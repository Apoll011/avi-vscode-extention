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
    const hasSettings = !!this.workspace.settings;
    const hasConstants = !!this.workspace.constants && Object.keys(this.workspace.constants.constants || {}).length > 0;

    if (!hasSettings && !hasConstants) {
      return `
        <!DOCTYPE html>
        <html>
        <head>
          <style>
            body {
              font-family: var(--vscode-font-family);
              padding: 24px;
              background: var(--vscode-editor-background);
              color: var(--vscode-editor-foreground);
              display: flex;
              align-items: center;
              justify-content: center;
              min-height: 100vh;
            }
            .empty-state {
              text-align: center;
              color: var(--vscode-descriptionForeground);
            }
            .empty-state-icon {
              font-size: 64px;
              margin-bottom: 16px;
            }
          </style>
        </head>
        <body>
          <div class="empty-state">
            <h2>No Configuration Found</h2>
            <p>This skill doesn't have settings or constants defined.</p>
          </div>
        </body>
        </html>
      `;
    }

    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <style>
          * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
          }

          body {
            font-family: var(--vscode-font-family);
            padding: 24px;
            background: var(--vscode-editor-background);
            color: var(--vscode-editor-foreground);
            line-height: 1.6;
          }

          .container {
            max-width: 900px;
            margin: 0 auto;
          }

          h1 {
            font-size: 24px;
            font-weight: 600;
            margin-bottom: 8px;
            color: var(--vscode-editor-foreground);
          }

          .subtitle {
            color: var(--vscode-descriptionForeground);
            margin-bottom: 24px;
            font-size: 14px;
          }

          .card {
            background: var(--vscode-sideBar-background);
            border: 1px solid var(--vscode-panel-border);
            border-radius: 6px;
            padding: 20px;
            margin-bottom: 16px;
          }

          .card-header {
            display: flex;
            align-items: center;
            gap: 8px;
            margin-bottom: 16px;
            padding-bottom: 12px;
            border-bottom: 1px solid var(--vscode-panel-border);
          }

          .card-icon {
            font-size: 20px;
          }

          .card-title {
            font-size: 16px;
            font-weight: 600;
            color: var(--vscode-editor-foreground);
          }

          .card-badge {
            margin-left: auto;
            padding: 2px 8px;
            background: var(--vscode-badge-background);
            color: var(--vscode-badge-foreground);
            border-radius: 10px;
            font-size: 11px;
            font-weight: 600;
          }

          .setting-item {
            background: var(--vscode-editor-background);
            border: 1px solid var(--vscode-panel-border);
            border-radius: 4px;
            padding: 14px;
            margin-bottom: 12px;
          }

          .setting-item:last-child {
            margin-bottom: 0;
          }

          .setting-header {
            display: flex;
            align-items: center;
            gap: 8px;
            margin-bottom: 8px;
          }

          .setting-name {
            font-weight: 600;
            color: var(--vscode-symbolIcon-variableForeground);
            font-family: var(--vscode-editor-font-family);
            font-size: 14px;
          }

          .required-badge {
            padding: 2px 6px;
            background: var(--vscode-inputValidation-errorBackground);
            color: var(--vscode-inputValidation-errorForeground);
            border-radius: 3px;
            font-size: 10px;
            font-weight: 600;
            text-transform: uppercase;
          }

          .advanced-badge {
            padding: 2px 6px;
            background: var(--vscode-badge-background);
            color: var(--vscode-badge-foreground);
            border-radius: 3px;
            font-size: 10px;
            font-weight: 600;
            text-transform: uppercase;
          }

          .setting-description {
            font-size: 13px;
            color: var(--vscode-descriptionForeground);
            margin-bottom: 10px;
            line-height: 1.5;
          }

          .setting-details {
            display: grid;
            grid-template-columns: auto 1fr;
            gap: 8px 12px;
            font-size: 13px;
            margin-top: 10px;
            padding-top: 10px;
            border-top: 1px solid var(--vscode-panel-border);
          }

          .detail-label {
            color: var(--vscode-descriptionForeground);
            font-weight: 500;
          }

          .detail-value {
            font-family: var(--vscode-editor-font-family);
            color: var(--vscode-editor-foreground);
          }

          .value-display {
            display: inline-block;
            padding: 4px 8px;
            background: var(--vscode-textCodeBlock-background);
            border-radius: 3px;
            font-family: var(--vscode-editor-font-family);
            font-size: 12px;
          }

          .value-display.boolean {
            color: var(--vscode-symbolIcon-booleanForeground);
          }

          .value-display.number {
            color: var(--vscode-symbolIcon-numberForeground);
          }

          .value-display.string {
            color: var(--vscode-symbolIcon-stringForeground);
          }

          .constant-item {
            background: var(--vscode-editor-background);
            border: 1px solid var(--vscode-panel-border);
            border-radius: 4px;
            padding: 14px;
            margin-bottom: 12px;
          }

          .constant-item:last-child {
            margin-bottom: 0;
          }

          .constant-header {
            display: flex;
            align-items: center;
            justify-content: space-between;
            margin-bottom: 6px;
          }

          .constant-name {
            font-weight: 600;
            color: var(--vscode-symbolIcon-constantForeground);
            font-family: var(--vscode-editor-font-family);
            font-size: 14px;
          }

          .constant-value {
            padding: 8px 12px;
            background: var(--vscode-textCodeBlock-background);
            border-radius: 4px;
            font-family: var(--vscode-editor-font-family);
            font-size: 13px;
            color: var(--vscode-editor-foreground);
            word-break: break-all;
          }

          .empty-card {
            text-align: center;
            padding: 32px;
            color: var(--vscode-descriptionForeground);
          }

          .section-divider {
            height: 24px;
          }
        </style>
      </head>
      <body>
        <div class="container">
          <h1>Skill Configuration</h1>
          <div class="subtitle">Constants and configurable settings for this skill</div>

          ${this.generateConstantsSection()}
          ${hasConstants && hasSettings ? '<div class="section-divider"></div>' : ''}
          ${this.generateSettingsSection()}
        </div>
      </body>
      </html>
    `;
  }

  private generateConstantsSection(): string {
    if (!this.workspace.constants || Object.keys(this.workspace.constants.constants || {}).length === 0) {
      return '';
    }

    const constants = this.workspace.constants.constants;
    const constantCount = Object.keys(constants).length;

    let html = `
      <div class="card">
        <div class="card-header">
          <span class="card-title">Constants</span>
          <span class="card-badge">${constantCount}</span>
        </div>
    `;

    for (const [key, value] of Object.entries(constants)) {
      html += `
        <div class="constant-item">
          <div class="constant-header">
            <span class="constant-name">${this.escapeHtml(key)}</span>
          </div>
          <div class="constant-value">${this.escapeHtml(value)}</div>
        </div>
      `;
    }

    html += `</div>`;
    return html;
  }

  private generateSettingsSection(): string {
    if (!this.workspace.settings) {
      return '';
    }

    const groupedSettings = this.groupSettings(this.workspace.settings);
    let html = '';

    for (const [groupName, settings] of Object.entries(groupedSettings)) {
      const settingCount = Object.keys(settings).length;
      const displayGroupName = groupName === '__default__' ? 'General Settings' : groupName;

      html += `
        <div class="card">
          <div class="card-header">
            <span class="card-title">${this.escapeHtml(displayGroupName)}</span>
            <span class="card-badge">${settingCount}</span>
          </div>
      `;

      for (const [key, setting] of Object.entries(settings)) {
        html += this.generateSettingItem(key, setting);
      }

      html += `</div>`;
    }

    return html;
  }

  private generateSettingItem(key: string, setting: Setting): string {
    const badges = [];
    
    if (setting.required) {
      badges.push('<span class="required-badge">Required</span>');
    }
    
    if (setting.advanced) {
      badges.push('<span class="advanced-badge">Advanced</span>');
    }

    const valueType = typeof setting.value;
    const valueClass = valueType === 'boolean' ? 'boolean' : 
                       valueType === 'number' ? 'number' : 'string';

    let details = [];

    // Type information
    details.push(['Type', this.getSettingType(setting)]);

    // Default value
    if (setting.value !== undefined && setting.value !== null) {
      const displayValue = this.formatValue(setting.value);
      details.push(['Default', `<span class="value-display ${valueClass}">${displayValue}</span>`]);
    }

    // Range for sliders/numbers
    if (setting.ui === 'slider' && (setting.min !== undefined || setting.max !== undefined)) {
      details.push(['Range', `${setting.min ?? '∞'} to ${setting.max ?? '∞'}`]);
    }

    // Options for dropdowns
    if (setting.ui === 'dropdown' && setting.enum_) {
      const options = setting.enum_.map(opt => `<code>${this.escapeHtml(opt)}</code>`).join(', ');
      details.push(['Options', options]);
    }

    const detailsHTML = details.length > 0 ? `
      <div class="setting-details">
        ${details.map(([label, value]) => `
          <span class="detail-label">${label}:</span>
          <span class="detail-value">${value}</span>
        `).join('')}
      </div>
    ` : '';

    return `
      <div class="setting-item">
        <div class="setting-header">
          <span class="setting-name">${this.escapeHtml(key)}</span>
          ${badges.join('')}
        </div>
        ${setting.description ? `<div class="setting-description">${this.escapeHtml(setting.description)}</div>` : ''}
        ${detailsHTML}
      </div>
    `;
  }

  private getSettingType(setting: Setting): string {
    switch (setting.ui) {
      case 'toggle':
        return 'Boolean';
      case 'slider':
        return 'Number (Slider)';
      case 'dropdown':
        return 'String (Dropdown)';
      case 'password':
        return 'String (Password)';
      default:
        const valueType = typeof setting.value;
        return valueType.charAt(0).toUpperCase() + valueType.slice(1);
    }
  }

  private formatValue(value: any): string {
    if (typeof value === 'boolean') {
      return value ? 'true' : 'false';
    }
    if (typeof value === 'string') {
      return `"${this.escapeHtml(value)}"`;
    }
    return String(value);
  }

  private groupSettings(config: SettingsConfig): Record<string, Record<string, Setting>> {
    const grouped: Record<string, Record<string, Setting>> = {};

    for (const [key, setting] of Object.entries(config.settings)) {
      const group = setting.group || '__default__';
      
      if (!grouped[group]) {
        grouped[group] = {};
      }
      
      grouped[group][key] = setting;
    }

    return grouped;
  }

  private escapeHtml(unsafe: string): string {
    return unsafe
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");
  }
}