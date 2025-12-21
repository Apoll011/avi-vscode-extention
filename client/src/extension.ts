// ============================================================================
// Core Extension Implementation
// ============================================================================

import * as path from 'path';
import * as vscode from 'vscode';
import {
  LanguageClient,
  LanguageClientOptions,
  ServerOptions,
  TransportKind
} from 'vscode-languageclient/node';
import { SkillWorkspace, LangFile, SettingsConfig, Setting } from './types';
import { detectSkillWorkspace } from './workspace';
import { SymbolResolver } from './symbol';
import { registerCommands } from './commands';
import { AviDefinitionProvider } from './definition';

let client: LanguageClient;
let currentWorkspace: SkillWorkspace | null = null;
let diagnosticCollection: vscode.DiagnosticCollection;

// ============================================================================
// Diagnostics System
// ============================================================================

function validateSkillWorkspace(workspace: SkillWorkspace): vscode.Diagnostic[] {
  const diagnostics: vscode.Diagnostic[] = [];
  
  // Check for main() function in entry file
  if (!workspace.entryFile.content.includes('fn main()')) {
    const uri = vscode.Uri.file(workspace.entryFile.path);
    const diagnostic = new vscode.Diagnostic(
      new vscode.Range(0, 0, 0, 0),
      'Entry file must contain a main() function',
      vscode.DiagnosticSeverity.Error
    );
    diagnosticCollection.set(uri, [diagnostic]);
  }
  
  // Validate intent handlers
  for (const intent of workspace.intents) {
    const handlerName = `fn intent_${intent.name.split('@')[1].replace('.', '_')}()`;
    const hasHandler = workspace.aviFiles.some(f => f.content.includes(handlerName));
    
    if (!hasHandler) {
      diagnostics.push({
        message: `Intent ${intent.name} has no handler function (expected ${handlerName})`,
        severity: vscode.DiagnosticSeverity.Warning,
        range: new vscode.Range(0, 0, 0, 0),
        source: 'avi-skill'
      } as vscode.Diagnostic);
    }
  }
  
  // Validate entity references in intents
  for (const intent of workspace.intents) {
    for (const utterance of intent.utterances) {
      const entityMatches = utterance.match(/\[(\w+)\]/g);
      
      if (entityMatches) {
        for (const match of entityMatches) {
          const entityName = match.slice(1, -1);
          const entityExists = workspace.entities.some(e => e.name === entityName);
          
          if (!entityExists) {
            diagnostics.push({
              message: `Entity '${entityName}' referenced but not defined`,
              severity: vscode.DiagnosticSeverity.Error,
              range: new vscode.Range(0, 0, 0, 0),
              source: 'avi-skill'
            } as vscode.Diagnostic);
          }
        }
      }
    }
  }
  
  // Validate locale key consistency across languages
  if (workspace.responses.length > 0) {
    const allKeys = new Set<string>();
    
    for (const langFile of workspace.responses) {
      Object.keys(langFile.lang).forEach(key => allKeys.add(key));
    }
    
    for (const key of allKeys) {
      const missingIn = workspace.responses.filter(lf => !lf.lang[key]);
      
      if (missingIn.length > 0) {
        diagnostics.push({
          message: `Locale key '${key}' missing in: ${missingIn.map(lf => lf.code).join(', ')}`,
          severity: vscode.DiagnosticSeverity.Warning,
          range: new vscode.Range(0, 0, 0, 0),
          source: 'avi-skill'
        } as vscode.Diagnostic);
      }
    }
  }
  
  return diagnostics;
}

// ============================================================================
// Extension Activation
// ============================================================================

export async function activate(context: vscode.ExtensionContext) {
  console.log('Avi Skill extension is now active');

  // Initialize diagnostic collection
  diagnosticCollection = vscode.languages.createDiagnosticCollection('avi');
  context.subscriptions.push(diagnosticCollection);

  // Start LSP client
  const serverModule = context.asAbsolutePath(
    path.join('server', 'out', 'server.js')
  );

  const serverOptions: ServerOptions = {
    run: { module: serverModule, transport: TransportKind.stdio },
    debug: {
      module: serverModule,
      transport: TransportKind.stdio,
    }
  };

  const clientOptions: LanguageClientOptions = {
    documentSelector: [{ scheme: 'file', language: 'avi' }],
    synchronize: {
      fileEvents: vscode.workspace.createFileSystemWatcher('**/*.{avi,yaml,config,intent,entity,lang}')
    }
  };

  client = new LanguageClient(
    'aviLanguageServer',
    'Avi Language Server',
    serverOptions,
    clientOptions
  );

  client.start();

  // Detect and load skill workspace
  const workspaceFolders = vscode.workspace.workspaceFolders;
  
  if (workspaceFolders && workspaceFolders.length > 0) {
    for (const folder of workspaceFolders) {
      const workspace = await detectSkillWorkspace(folder);
      
      if (workspace) {
        currentWorkspace = workspace;
        vscode.window.showInformationMessage(`Avi Skill loaded: ${workspace.manifest.name}`);
        
        // Run initial validation
        const diagnostics = validateSkillWorkspace(workspace);
        
        if (diagnostics.length > 0) {
          vscode.window.showWarningMessage(`Found ${diagnostics.length} workspace issues`);
        }

        // Register definition provider
        const resolver = new SymbolResolver(workspace);
        context.subscriptions.push(
          vscode.languages.registerDefinitionProvider(
            { scheme: 'file', language: 'avi' },
            new AviDefinitionProvider(resolver)
          )
        );
        
        break;
      }
    }
  }

  // Register commands
  registerCommands(context, currentWorkspace);

  // Watch for file changes
  const watcher = vscode.workspace.createFileSystemWatcher('**/*.{avi,yaml,config,intent,entity,lang}');
  
  watcher.onDidChange(async (uri) => {
    if (currentWorkspace) {
      // Reload workspace on file changes
      const folder = vscode.workspace.getWorkspaceFolder(uri);
      if (folder) {
        const newWorkspace = await detectSkillWorkspace(folder);
        if (newWorkspace) {
          currentWorkspace = newWorkspace;
          validateSkillWorkspace(newWorkspace);
        }
      }
    }
  });

  watcher.onDidCreate(async (uri) => {
    if (currentWorkspace) {
      const folder = vscode.workspace.getWorkspaceFolder(uri);
      if (folder) {
        const newWorkspace = await detectSkillWorkspace(folder);
        if (newWorkspace) {
          currentWorkspace = newWorkspace;
          validateSkillWorkspace(newWorkspace);
        }
      }
    }
  });

  watcher.onDidDelete(async (uri) => {
    if (currentWorkspace) {
      const folder = vscode.workspace.getWorkspaceFolder(uri);
      if (folder) {
        const newWorkspace = await detectSkillWorkspace(folder);
        if (newWorkspace) {
          currentWorkspace = newWorkspace;
          validateSkillWorkspace(newWorkspace);
        }
      }
    }
  });

  context.subscriptions.push(watcher);
}

// ============================================================================
// Extension Deactivation
// ============================================================================

export function deactivate(): Thenable<void> | undefined {
  if (!client) {
    return undefined;
  }
  return client.stop();
}