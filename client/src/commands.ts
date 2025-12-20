import * as path from 'path';
import * as vscode from 'vscode';
import * as fs from 'fs';
import * as yaml from 'js-yaml';
import { SettingsPreviewPanel } from "./settings";
import { LangFile, SettingsConfig, Setting, SkillWorkspace } from "./types";
import { IntentTestPanel } from './intent';

export function registerCommands(context: vscode.ExtensionContext, currentWorkspace: SkillWorkspace | null) {
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