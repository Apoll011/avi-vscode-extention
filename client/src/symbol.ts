import * as path from 'path';
import * as vscode from 'vscode';
import * as fs from 'fs';
import { SkillWorkspace } from './types';

// ============================================================================
// Cross-File Symbol Resolution
// ============================================================================

export class SymbolResolver {
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