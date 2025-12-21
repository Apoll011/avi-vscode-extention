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
import { validateSkillWorkspace } from './diagnostic';

let client: LanguageClient;
let currentWorkspace: SkillWorkspace | null = null;
let diagnosticCollection: vscode.DiagnosticCollection;

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
        validateSkillWorkspace(workspace, diagnosticCollection);

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
          validateSkillWorkspace(newWorkspace, diagnosticCollection);
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
          validateSkillWorkspace(newWorkspace, diagnosticCollection);
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
          validateSkillWorkspace(newWorkspace, diagnosticCollection);
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