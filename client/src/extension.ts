// ============================================================================
// Domain Models
// ============================================================================

interface Manifest {
  id: string;
  name: string;
  description: string;
  entry: string;
  capabilities: string[];
  permissions: string[];
  author?: string;
  version: string;
}

interface Setting {
  value: any;
  vtype: string;
  description?: string;
  ui?: string;
  required?: boolean;
  min?: number;
  max?: number;
  enum_?: string[];
  group?: string;
  advanced?: boolean;
}

interface SettingsConfig {
  settings: Record<string, Setting>;
}

interface ConstantsConfig {
  constants: Record<string, string>;
}

interface Entity {
  type: 'entity';
  name: string;
  automatically_extensible: boolean;
  values: string[];
}

interface Intent {
  type: 'intent';
  name: string;
  utterances: string[];
}

interface LangFile {
  code: string;
  lang: Record<string, string>;
}

interface AviFile {
  path: string;
  content: string;
}

class SkillWorkspace {
  constructor(
    public rootPath: string,
    public manifest: Manifest,
    public entryFile: AviFile,
    public aviFiles: AviFile[] = [],
    public intents: Intent[] = [],
    public entities: Entity[] = [],
    public responses: LangFile[] = [],
    public constants?: ConstantsConfig,
    public settings?: SettingsConfig
  ) {}
}

// ============================================================================
// Core Extension Implementation
// ============================================================================

import * as path from 'path';
import * as vscode from 'vscode';
import * as fs from 'fs';
import * as yaml from 'js-yaml';
import {
  LanguageClient,
  LanguageClientOptions,
  ServerOptions,
  TransportKind
} from 'vscode-languageclient/node';

let client: LanguageClient;
let currentWorkspace: SkillWorkspace | null = null;
let diagnosticCollection: vscode.DiagnosticCollection;

// ============================================================================
// Workspace Detection & Model Building
// ============================================================================

async function detectSkillWorkspace(workspaceFolder: vscode.WorkspaceFolder): Promise<SkillWorkspace | null> {
  const manifestPath = path.join(workspaceFolder.uri.fsPath, 'manifest.yaml');
  
  if (!fs.existsSync(manifestPath)) {
    return null;
  }

  try {
    const manifestContent = fs.readFileSync(manifestPath, 'utf8');
    const manifest = yaml.load(manifestContent) as Manifest;

    // Validate entry file exists
    const entryPath = path.join(workspaceFolder.uri.fsPath, manifest.entry);
    if (!fs.existsSync(entryPath)) {
      vscode.window.showErrorMessage(`Entry file ${manifest.entry} not found`);
      return null;
    }

    const entryFile: AviFile = {
      path: entryPath,
      content: fs.readFileSync(entryPath, 'utf8')
    };

    // Load all .avi files
    const aviFiles = await loadAviFiles(workspaceFolder.uri.fsPath);
    
    // Load intents
    const intents = await loadIntents(workspaceFolder.uri.fsPath);
    
    // Load entities
    const entities = await loadEntities(workspaceFolder.uri.fsPath);
    
    // Load responses
    const responses = await loadResponses(workspaceFolder.uri.fsPath);
    
    // Load configs
    const constants = await loadConstants(workspaceFolder.uri.fsPath);
    const settings = await loadSettings(workspaceFolder.uri.fsPath);

    return new SkillWorkspace(
      workspaceFolder.uri.fsPath,
      manifest,
      entryFile,
      aviFiles,
      intents,
      entities,
      responses,
      constants,
      settings
    );
  } catch (error) {
    vscode.window.showErrorMessage(`Failed to load skill workspace: ${error}`);
    return null;
  }
}

async function loadAviFiles(rootPath: string): Promise<AviFile[]> {
  const files: AviFile[] = [];
  const pattern = new vscode.RelativePattern(rootPath, '**/*.avi');
  const uris = await vscode.workspace.findFiles(pattern);
  
  for (const uri of uris) {
    files.push({
      path: uri.fsPath,
      content: fs.readFileSync(uri.fsPath, 'utf8')
    });
  }
  
  return files;
}

async function loadIntents(rootPath: string): Promise<Intent[]> {
  const intents: Intent[] = [];
  const intentDir = path.join(rootPath, 'intent', 'intents');
  
  if (!fs.existsSync(intentDir)) return intents;
  
  const files = fs.readdirSync(intentDir).filter(f => f.endsWith('.intent'));
  
  for (const file of files) {
    try {
      const content = fs.readFileSync(path.join(intentDir, file), 'utf8');
      const intent = yaml.load(content) as Intent;
      intents.push(intent);
    } catch (error) {
      console.error(`Failed to load intent ${file}:`, error);
    }
  }
  
  return intents;
}

async function loadEntities(rootPath: string): Promise<Entity[]> {
  const entities: Entity[] = [];
  const entityDir = path.join(rootPath, 'intent', 'entities');
  
  if (!fs.existsSync(entityDir)) return entities;
  
  const files = fs.readdirSync(entityDir).filter(f => f.endsWith('.entity'));
  
  for (const file of files) {
    try {
      const content = fs.readFileSync(path.join(entityDir, file), 'utf8');
      const entity = yaml.load(content) as Entity;
      entities.push(entity);
    } catch (error) {
      console.error(`Failed to load entity ${file}:`, error);
    }
  }
  
  return entities;
}

async function loadResponses(rootPath: string): Promise<LangFile[]> {
  const responses: LangFile[] = [];
  const responseDir = path.join(rootPath, 'responses');
  
  if (!fs.existsSync(responseDir)) return responses;
  
  const files = fs.readdirSync(responseDir).filter(f => f.endsWith('.lang'));
  
  for (const file of files) {
    try {
      const content = fs.readFileSync(path.join(responseDir, file), 'utf8');
      const langFile = yaml.load(content) as LangFile;
      responses.push(langFile);
    } catch (error) {
      console.error(`Failed to load response ${file}:`, error);
    }
  }
  
  return responses;
}

async function loadConstants(rootPath: string): Promise<ConstantsConfig | undefined> {
  const constantsPath = path.join(rootPath, 'config', 'const.config');
  
  if (!fs.existsSync(constantsPath)) return undefined;
  
  try {
    const content = fs.readFileSync(constantsPath, 'utf8');
    return yaml.load(content) as ConstantsConfig;
  } catch (error) {
    console.error('Failed to load constants:', error);
    return undefined;
  }
}

async function loadSettings(rootPath: string): Promise<SettingsConfig | undefined> {
  const settingsPath = path.join(rootPath, 'config', 'settings.config');
  
  if (!fs.existsSync(settingsPath)) return undefined;
  
  try {
    const content = fs.readFileSync(settingsPath, 'utf8');
    return yaml.load(content) as SettingsConfig;
  } catch (error) {
    console.error('Failed to load settings:', error);
    return undefined;
  }
}

// ============================================================================
// Cross-File Symbol Resolution
// ============================================================================

class SymbolResolver {
  constructor(private workspace: SkillWorkspace) {}

  resolveLocaleKey(key: string): vscode.Location[] {
    const locations: vscode.Location[] = [];
    
    for (const langFile of this.workspace.responses) {
      if (langFile.lang[key]) {
        const langPath = path.join(
          this.workspace.rootPath,
          'responses',
          `${langFile.code}.lang`
        );
        
        if (fs.existsSync(langPath)) {
          const content = fs.readFileSync(langPath, 'utf8');
          const lines = content.split('\n');
          
          for (let i = 0; i < lines.length; i++) {
            if (lines[i].includes(`${key}:`)) {
              const uri = vscode.Uri.file(langPath);
              const position = new vscode.Position(i, lines[i].indexOf(key));
              locations.push(new vscode.Location(uri, position));
            }
          }
        }
      }
    }
    
    return locations;
  }

  resolveSettingKey(key: string): vscode.Location | null {
    if (!this.workspace.settings?.settings[key]) {
      return null;
    }
    
    const settingsPath = path.join(this.workspace.rootPath, 'config', 'settings.config');
    
    if (!fs.existsSync(settingsPath)) return null;
    
    const content = fs.readFileSync(settingsPath, 'utf8');
    const lines = content.split('\n');
    
    for (let i = 0; i < lines.length; i++) {
      if (lines[i].trim().startsWith(`${key}:`)) {
        const uri = vscode.Uri.file(settingsPath);
        const position = new vscode.Position(i, lines[i].indexOf(key));
        return new vscode.Location(uri, position);
      }
    }
    
    return null;
  }

  resolveConstantKey(key: string): vscode.Location | null {
    if (!this.workspace.constants?.constants[key]) {
      return null;
    }
    
    const constantsPath = path.join(this.workspace.rootPath, 'config', 'const.config');
    
    if (!fs.existsSync(constantsPath)) return null;
    
    const content = fs.readFileSync(constantsPath, 'utf8');
    const lines = content.split('\n');
    
    for (let i = 0; i < lines.length; i++) {
      if (lines[i].includes(`${key}:`)) {
        const uri = vscode.Uri.file(constantsPath);
        const position = new vscode.Position(i, lines[i].indexOf(key));
        return new vscode.Location(uri, position);
      }
    }
    
    return null;
  }

  resolveEntity(entityName: string): vscode.Location | null {
    const entity = this.workspace.entities.find(e => e.name === entityName);
    
    if (!entity) return null;
    
    const entityPath = path.join(
      this.workspace.rootPath,
      'intent',
      'entities',
      `${entityName}.entity`
    );
    
    if (!fs.existsSync(entityPath)) return null;
    
    const uri = vscode.Uri.file(entityPath);
    return new vscode.Location(uri, new vscode.Position(0, 0));
  }
}

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
    const handlerName = `fn intent_${intent.name.split('@')[1]}`;
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
// Definition Provider (Go to Definition)
// ============================================================================

class AviDefinitionProvider implements vscode.DefinitionProvider {
  constructor(private resolver: SymbolResolver) {}

  provideDefinition(
    document: vscode.TextDocument,
    position: vscode.Position,
    token: vscode.CancellationToken
  ): vscode.ProviderResult<vscode.Definition> {
    const line = document.lineAt(position.line).text;
    const wordRange = document.getWordRangeAtPosition(position, /[\w_]+/);
    
    if (!wordRange) return null;
    
    const word = document.getText(wordRange);
    
    // Check for locale() calls
    const localeMatch = line.match(/locale\s*\(\s*key:\s*"([^"]+)"/);
    if (localeMatch && line.includes(word)) {
      return this.resolver.resolveLocaleKey(localeMatch[1]);
    }
    
    // Check for get_setting() calls
    const settingMatch = line.match(/get_setting\s*\(\s*"([^"]+)"/);
    if (settingMatch && line.includes(word)) {
      const location = this.resolver.resolveSettingKey(settingMatch[1]);
      return location ? [location] : null;
    }
    
    // Check for get_constant() calls
    const constantMatch = line.match(/get_constant\s*\(\s*key:\s*"([^"]+)"/);
    if (constantMatch && line.includes(word)) {
      const location = this.resolver.resolveConstantKey(constantMatch[1]);
      return location ? [location] : null;
    }
    
    // Check for entity references [entityName]
    const entityMatch = line.match(/\[(\w+)\]/);
    if (entityMatch && word === entityMatch[1]) {
      const location = this.resolver.resolveEntity(word);
      return location ? [location] : null;
    }
    
    return null;
  }
}

// ============================================================================
// Settings UI Preview Panel
// ============================================================================

class SettingsPreviewPanel {
  private panel: vscode.WebviewPanel | undefined;

  constructor(private workspace: SkillWorkspace) {}

  show() {
    if (this.panel) {
      this.panel.reveal();
      return;
    }

    this.panel = vscode.window.createWebviewPanel(
      'aviSettingsPreview',
      'Skill Settings Preview',
      vscode.ViewColumn.Two,
      { enableScripts: true }
    );

    this.panel.webview.html = this.generateSettingsHTML();

    this.panel.onDidDispose(() => {
      this.panel = undefined;
    });
  }

  private generateSettingsHTML(): string {
    if (!this.workspace.settings) {
      return '<html><body><h2>No settings.config found</h2></body></html>';
    }

    const groupedSettings = this.groupSettings(this.workspace.settings);
    
    let html = `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: var(--vscode-font-family); padding: 20px; }
          .setting-group { margin-bottom: 30px; }
          .setting-group h3 { color: var(--vscode-editor-foreground); border-bottom: 1px solid var(--vscode-panel-border); padding-bottom: 5px; }
          .setting { margin: 15px 0; padding: 10px; background: var(--vscode-editor-background); border-radius: 4px; }
          .setting-name { font-weight: bold; color: var(--vscode-textLink-foreground); }
          .setting-description { font-size: 0.9em; color: var(--vscode-descriptionForeground); margin: 5px 0; }
          .setting-value { margin: 8px 0; }
          .required { color: var(--vscode-errorForeground); }
          .advanced { opacity: 0.7; }
          input, select { width: 100%; padding: 5px; background: var(--vscode-input-background); color: var(--vscode-input-foreground); border: 1px solid var(--vscode-input-border); }
        </style>
      </head>
      <body>
        <h1>Skill Settings</h1>
    `;

    for (const [groupName, settings] of Object.entries(groupedSettings)) {
      html += `<div class="setting-group">`;
      if (groupName !== '__default__') {
        html += `<h3>${groupName}</h3>`;
      }

      for (const [key, setting] of Object.entries(settings)) {
        const advancedClass = setting.advanced ? 'advanced' : '';
        html += `<div class="setting ${advancedClass}">`;
        html += `<div class="setting-name">${key}${setting.required ? ' <span class="required">*</span>' : ''}</div>`;
        
        if (setting.description) {
          html += `<div class="setting-description">${setting.description}</div>`;
        }

        html += `<div class="setting-value">`;
        html += this.generateInputField(key, setting);
        html += `</div>`;
        
        html += `</div>`;
      }

      html += `</div>`;
    }

    html += `</body></html>`;
    return html;
  }

  private groupSettings(config: SettingsConfig): Record<string, Record<string, Setting>> {
    const grouped: Record<string, Record<string, Setting>> = { __default__: {} };

    for (const [key, setting] of Object.entries(config.settings)) {
      const group = setting.group || '__default__';
      
      if (!grouped[group]) {
        grouped[group] = {};
      }
      
      grouped[group][key] = setting;
    }

    return grouped;
  }

  private generateInputField(key: string, setting: Setting): string {
    const value = setting.value;

    switch (setting.ui) {
      case 'toggle':
        return `<input type="checkbox" ${value ? 'checked' : ''} disabled />`;
      
      case 'slider':
        return `<input type="range" min="${setting.min}" max="${setting.max}" value="${value}" disabled /> <span>${value}</span>`;
      
      case 'dropdown':
        const options = setting.enum_?.map(opt => 
          `<option ${opt === value ? 'selected' : ''}>${opt}</option>`
        ).join('');
        return `<select disabled>${options}</select>`;
      
      case 'password':
        return `<input type="password" value="${value}" disabled />`;
      
      default:
        return `<input type="text" value="${value}" disabled />`;
    }
  }
}

// ============================================================================
// Intent Test Panel (Placeholder for future API integration)
// ============================================================================

class IntentTestPanel {
  private panel: vscode.WebviewPanel | undefined;

  show() {
    if (this.panel) {
      this.panel.reveal();
      return;
    }

    this.panel = vscode.window.createWebviewPanel(
      'aviIntentTest',
      'Test Intent',
      vscode.ViewColumn.Two,
      { enableScripts: true }
    );

    this.panel.webview.html = this.generateTestHTML();

    // TODO: Add message handler for utterance testing
    this.panel.webview.onDidReceiveMessage(async message => {
      if (message.command === 'testUtterance') {
        // PLACEHOLDER: This is where API integration will happen
        // const result = await testUtteranceAPI(message.utterance);
        // this.panel.webview.postMessage({ command: 'result', data: result });
        
        this.panel!.webview.postMessage({
          command: 'result',
          data: {
            status: 'pending',
            message: 'API integration not yet implemented'
          }
        });
      }
    });

    this.panel.onDidDispose(() => {
      this.panel = undefined;
    });
  }

  private generateTestHTML(): string {
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: var(--vscode-font-family); padding: 20px; }
          #utterance { width: 100%; padding: 10px; margin: 10px 0; background: var(--vscode-input-background); color: var(--vscode-input-foreground); border: 1px solid var(--vscode-input-border); }
          button { padding: 10px 20px; background: var(--vscode-button-background); color: var(--vscode-button-foreground); border: none; cursor: pointer; }
          button:hover { background: var(--vscode-button-hoverBackground); }
          #result { margin-top: 20px; padding: 15px; background: var(--vscode-editor-background); border-radius: 4px; }
          .result-section { margin: 10px 0; }
          .label { font-weight: bold; color: var(--vscode-textLink-foreground); }
        </style>
      </head>
      <body>
        <h2>Test Intent Recognition</h2>
        <input type="text" id="utterance" placeholder="Enter an utterance to test..." />
        <button onclick="testUtterance()">Test</button>
        <div id="result"></div>

        <script>
          const vscode = acquireVsCodeApi();

          function testUtterance() {
            const utterance = document.getElementById('utterance').value;
            if (!utterance) return;

            vscode.postMessage({
              command: 'testUtterance',
              utterance: utterance
            });

            document.getElementById('result').innerHTML = '<p>Testing...</p>';
          }

          window.addEventListener('message', event => {
            const message = event.data;
            if (message.command === 'result') {
              displayResult(message.data);
            }
          });

          function displayResult(data) {
            const resultDiv = document.getElementById('result');
            
            if (data.status === 'pending') {
              resultDiv.innerHTML = '<p>' + data.message + '</p>';
              return;
            }

            // TODO: Format actual API response when integrated
            resultDiv.innerHTML = \`
              <div class="result-section">
                <span class="label">Intent:</span> \${data.intent || 'N/A'}
              </div>
              <div class="result-section">
                <span class="label">Confidence:</span> \${data.confidence || 'N/A'}
              </div>
              <div class="result-section">
                <span class="label">Slots:</span> \${JSON.stringify(data.slots || {})}
              </div>
            \`;
          }
        </script>
      </body>
      </html>
    `;
  }
}

// ============================================================================
// Commands
// ============================================================================

function registerCommands(context: vscode.ExtensionContext) {
  // Show Settings Preview
  context.subscriptions.push(
    vscode.commands.registerCommand('avi.showSettingsPreview', () => {
      if (!currentWorkspace) {
        vscode.window.showErrorMessage('No Avi skill workspace detected');
        return;
      }
      
      const panel = new SettingsPreviewPanel(currentWorkspace);
      panel.show();
    })
  );

  // Test Intent
  context.subscriptions.push(
    vscode.commands.registerCommand('avi.testIntent', () => {
      const panel = new IntentTestPanel();
      panel.show();
    })
  );

  // Create New Intent
  context.subscriptions.push(
    vscode.commands.registerCommand('avi.createIntent', async () => {
      if (!currentWorkspace) {
        vscode.window.showErrorMessage('No Avi skill workspace detected');
        return;
      }

      const intentName = await vscode.window.showInputBox({
        prompt: 'Enter intent name (e.g., light.turn_on)',
        validateInput: (value) => {
          if (!value) return 'Intent name is required';
          if (!/^[a-z_@.]+$/.test(value)) return 'Invalid format';
          return null;
        }
      });

      if (!intentName) return;

      const intentPath = path.join(
        currentWorkspace.rootPath,
        'intent',
        'intents',
        `${intentName}.intent`
      );

      const intentContent = yaml.dump({
        type: 'intent',
        name: intentName,
        utterances: []
      });

      fs.writeFileSync(intentPath, intentContent);
      
      const doc = await vscode.workspace.openTextDocument(intentPath);
      await vscode.window.showTextDocument(doc);
      
      vscode.window.showInformationMessage(`Intent ${intentName} created`);
    })
  );

  // Create New Entity
  context.subscriptions.push(
    vscode.commands.registerCommand('avi.createEntity', async () => {
      if (!currentWorkspace) {
        vscode.window.showErrorMessage('No Avi skill workspace detected');
        return;
      }

      const entityName = await vscode.window.showInputBox({
        prompt: 'Enter entity name',
        validateInput: (value) => {
          if (!value) return 'Entity name is required';
          if (!/^[a-zA-Z_]+$/.test(value)) return 'Invalid format';
          return null;
        }
      });

      if (!entityName) return;

      const entityPath = path.join(
        currentWorkspace.rootPath,
        'intent',
        'entities',
        `${entityName}.entity`
      );

      const entityContent = yaml.dump({
        type: 'entity',
        name: entityName,
        automatically_extensible: false,
        values: []
      });

      fs.writeFileSync(entityPath, entityContent);
      
      const doc = await vscode.workspace.openTextDocument(entityPath);
      await vscode.window.showTextDocument(doc);
      
      vscode.window.showInformationMessage(`Entity ${entityName} created`);
    })
  );

  // Add Language
  context.subscriptions.push(
    vscode.commands.registerCommand('avi.addLanguage', async () => {
      if (!currentWorkspace) {
        vscode.window.showErrorMessage('No Avi skill workspace detected');
        return;
      }

      const langCode = await vscode.window.showInputBox({
        prompt: 'Enter language code (e.g., fr, de, es)',
        validateInput: (value) => {
          if (!value) return 'Language code is required';
          if (!/^[a-z]{2}$/.test(value)) return 'Must be 2-letter code';
          return null;
        }
      });

      if (!langCode) return;

      // Get keys from existing language file (prefer en.lang)
      const baseLang = currentWorkspace.responses.find(r => r.code === 'en') 
        || currentWorkspace.responses[0];

      if (!baseLang) {
        vscode.window.showErrorMessage('No base language file found');
        return;
      }

      const newLangPath = path.join(
        currentWorkspace.rootPath,
        'responses',
        `${langCode}.lang`
      );

      const newLangContent: LangFile = {
        code: langCode,
        lang: {}
      };

      // Copy keys but leave values empty for translation
      for (const key of Object.keys(baseLang.lang)) {
        newLangContent.lang[key] = '';
      }

      fs.writeFileSync(newLangPath, yaml.dump(newLangContent));
      
      const doc = await vscode.workspace.openTextDocument(newLangPath);
      await vscode.window.showTextDocument(doc);
      
      vscode.window.showInformationMessage(`Language ${langCode} added with ${Object.keys(baseLang.lang).length} keys to translate`);
    })
  );

  // Show Missing Translations
  context.subscriptions.push(
    vscode.commands.registerCommand('avi.showMissingTranslations', () => {
      if (!currentWorkspace || currentWorkspace.responses.length === 0) {
        vscode.window.showInformationMessage('No language files found');
        return;
      }

      const allKeys = new Set<string>();
      const missingByLang: Map<string, string[]> = new Map();

      // Collect all keys across all languages
      for (const langFile of currentWorkspace.responses) {
        Object.keys(langFile.lang).forEach(key => allKeys.add(key));
        missingByLang.set(langFile.code, []);
      }

      // Find missing keys per language
      for (const key of allKeys) {
        for (const langFile of currentWorkspace.responses) {
          if (!langFile.lang[key] || langFile.lang[key] === '') {
            missingByLang.get(langFile.code)!.push(key);
          }
        }
      }

      // Display results
      let message = 'Missing Translations:\n\n';
      let hasMissing = false;

      for (const [lang, keys] of missingByLang.entries()) {
        if (keys.length > 0) {
          hasMissing = true;
          message += `${lang}: ${keys.join(', ')}\n`;
        }
      }

      if (!hasMissing) {
        vscode.window.showInformationMessage('All translations are complete!');
      } else {
        vscode.window.showWarningMessage(message);
      }
    })
  );

  // Add Setting
  context.subscriptions.push(
    vscode.commands.registerCommand('avi.addSetting', async () => {
      if (!currentWorkspace) {
        vscode.window.showErrorMessage('No Avi skill workspace detected');
        return;
      }

      const settingKey = await vscode.window.showInputBox({
        prompt: 'Enter setting key name',
        validateInput: (value) => {
          if (!value) return 'Setting key is required';
          if (!/^[a-z_]+$/.test(value)) return 'Use lowercase and underscores only';
          return null;
        }
      });

      if (!settingKey) return;

      const settingType = await vscode.window.showQuickPick(
        ['string', 'number', 'boolean', 'enum', 'io.ip', 'time.seconds'],
        { placeHolder: 'Select setting type' }
      );

      if (!settingType) return;

      const description = await vscode.window.showInputBox({
        prompt: 'Enter setting description (optional)'
      });

      const settingsPath = path.join(currentWorkspace.rootPath, 'config', 'settings.config');
      
      let config: SettingsConfig;
      
      if (fs.existsSync(settingsPath)) {
        const content = fs.readFileSync(settingsPath, 'utf8');
        config = yaml.load(content) as SettingsConfig;
      } else {
        config = { settings: {} };
      }

      // Create new setting with appropriate defaults
      const newSetting: Setting = {
        value: settingType === 'boolean' ? false : settingType === 'number' ? 0 : '',
        vtype: settingType,
        ui: settingType === 'boolean' ? 'toggle' : settingType === 'enum' ? 'dropdown' : 'text'
      };

      if (description) {
        newSetting.description = description;
      }

      config.settings[settingKey] = newSetting;

      fs.writeFileSync(settingsPath, yaml.dump(config));
      
      const doc = await vscode.workspace.openTextDocument(settingsPath);
      await vscode.window.showTextDocument(doc);
      
      vscode.window.showInformationMessage(`Setting ${settingKey} added`);
    })
  );
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
  registerCommands(context);

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