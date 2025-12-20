import * as vscode from 'vscode';
import { SymbolResolver } from './symbol';

export class AviDefinitionProvider implements vscode.DefinitionProvider {
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