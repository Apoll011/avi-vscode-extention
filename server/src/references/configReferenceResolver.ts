// references/configReferenceResolver.ts
import { TextDocument } from 'vscode-languageserver-textdocument';
import { Location, Position, Range } from 'vscode-languageserver/node';
import * as fs from 'fs';
import * as path from 'path';
import { ConfigFunctions } from '../types';

export class ConfigReferenceResolver {
  private configCache: Map<string, { keys: Set<string> }> = new Map();

  constructor(private workspaceRoot: string) {}

  findConfigKeyReferences(
    configUri: string,
    position: Position,
    documents: Map<string, TextDocument>,
    includeDeclaration: boolean
  ): Location[] {
    try {
      const configPath = this.uriToFsPath(configUri);
      const content = fs.readFileSync(configPath, 'utf-8');
      const lines = content.split('\n');
      
      const keyAtPosition = this.extractKeyAtPosition(lines, position);
      if (!keyAtPosition) return [];
      
      const locations: Location[] = [];
      
      if (includeDeclaration) {
        const keyPattern = new RegExp(`^\\s*${this.escapeRegex(keyAtPosition)}\\s*:`);
        for (let i = 0; i < lines.length; i++) {
          if (keyPattern.test(lines[i])) {
            const startChar = lines[i].search(/\S/);
            const keyEnd = startChar + keyAtPosition.length;
            locations.push(
              Location.create(
                configUri,
                Range.create(i, startChar, i, keyEnd)
              )
            );
            break;
          }
        }
      }
      
      const relativeConfigPath = path.relative(this.workspaceRoot, configPath);
      
      for (const [uri, doc] of documents) {
        const docLocations = this.findReferencesInDocument(
          doc,
          keyAtPosition,
          relativeConfigPath
        );
        locations.push(...docLocations);
      }
      
      return locations;
    } catch {
      return [];
    }
  }

  findReferencesInAllDocuments(
    documents: Map<string, TextDocument>,
    position: Position,
    entries: ConfigFunctions[],
    includeDeclaration: boolean
  ): Location[] {
    const locations: Location[] = [];
    
    for (const [uri, doc] of documents) {
      const docLocations = this.findReferencesInDocumentAtPosition(
        doc,
        position,
        entries
      );
      locations.push(...docLocations);
    }
    
    return locations;
  }

  private findReferencesInDocumentAtPosition(
    document: TextDocument,
    position: Position,
    entries: ConfigFunctions[]
  ): Location[] {
    const line = document.getText(
      Range.create(position.line, 0, position.line + 1, 0)
    );
    
    for (const entry of entries) {
      const key = this.extractKeyFromPosition(document, position, line, entry);
      if (key) {
        return this.findReferencesInDocument(document, key, entry.configPath);
      }
    }
    
    return [];
  }

  private findReferencesInDocument(
    document: TextDocument,
    key: string,
    configPath: string
  ): Location[] {
    const locations: Location[] = [];
    const text = document.getText();
    const lines = text.split('\n');
    
    const stringPattern = new RegExp(`["']${this.escapeRegex(key)}["']`, 'g');
    
    for (let i = 0; i < lines.length; i++) {
      let match;
      while ((match = stringPattern.exec(lines[i])) !== null) {
        const startChar = match.index + 1;
        locations.push(
          Location.create(
            document.uri,
            Range.create(i, startChar, i, startChar + key.length)
          )
        );
      }
    }
    
    return locations;
  }

  private extractKeyFromPosition(
    document: TextDocument,
    position: Position,
    line: string,
    entry: ConfigFunctions
  ): string | null {
    const callPattern = new RegExp(
      `${this.escapeRegex(entry.functionName)}\\s*\\(([^)]*)\\)`,
      'g'
    );
    
    let match;
    while ((match = callPattern.exec(line)) !== null) {
      const args = this.parseArguments(match[1]);
      
      if (args.length <= entry.argumentPosition) continue;
      
      const arg = args[entry.argumentPosition];
      const argStartInLine = match.index + match[0].indexOf(match[1]) + 
        match[1].indexOf(arg.raw);
      const argEndInLine = argStartInLine + arg.raw.length;
      
      if (position.character >= argStartInLine && position.character <= argEndInLine) {
        return arg.value;
      }
    }
    
    return null;
  }

  private extractKeyAtPosition(lines: string[], position: Position): string | null {
    if (position.line >= lines.length) return null;
    
    const line = lines[position.line];
    const keyMatch = line.match(/^\s*(\w+)\s*:/);
    
    if (!keyMatch) return null;
    
    return keyMatch[1];
  }

  private parseArguments(argsText: string): Array<{ raw: string; value: string | null }> {
    const args: Array<{ raw: string; value: string | null }> = [];
    let current = '';
    let inString = false;
    let stringChar = '';
    let depth = 0;
    
    for (let i = 0; i < argsText.length; i++) {
      const char = argsText[i];
      
      if (!inString) {
        if (char === '"' || char === "'") {
          inString = true;
          stringChar = char;
        } else if (char === '(') {
          depth++;
        } else if (char === ')') {
          depth--;
        } else if (char === ',' && depth === 0) {
          args.push(this.processArg(current.trim()));
          current = '';
          continue;
        }
      } else {
        if (char === stringChar && argsText[i - 1] !== '\\') {
          inString = false;
        }
      }
      
      current += char;
    }
    
    if (current.trim()) {
      args.push(this.processArg(current.trim()));
    }
    
    return args;
  }

  private processArg(arg: string): { raw: string; value: string | null } {
    const stringMatch = arg.match(/^["'](.*)["']$/);
    return {
      raw: arg,
      value: stringMatch ? stringMatch[1] : null
    };
  }

  private uriToFsPath(uri: string): string {
    return uri.replace(/^file:\/\//, '');
  }

  private escapeRegex(str: string): string {
    return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  }

  clearCache(): void {
    this.configCache.clear();
  }
}
