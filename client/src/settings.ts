import * as vscode from 'vscode';
import { SkillWorkspace, SettingsConfig, Setting } from './types';

export class SettingsPreviewPanel {
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