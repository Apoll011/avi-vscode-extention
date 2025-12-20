// declaration/configResolver.ts
import { TextDocument } from 'vscode-languageserver-textdocument';
import { Location, Position, Range } from 'vscode-languageserver/node';
import * as fs from 'fs';
import * as path from 'path';
import * as yaml from 'js-yaml';
import { ConfigFunctions } from '../types';

export class ConfigResolver {
  private configCache: Map<string, { content: string; keys: Set<string> }> = new Map();

  constructor(private workspaceRoot: string) {}

  resolve(
    document: TextDocument,
    position: Position,
    entries: ConfigFunctions[]
  ): Location | null {
    const line = document.getText(
      Range.create(position.line, 0, position.line + 1, 0)
    );
    
    for (const entry of entries) {
      const result = this.tryResolveForEntry(document, position, line, entry);
      if (result) return result;
    }
    
    return null;
  }

  private tryResolveForEntry(
    document: TextDocument,
    position: Position,
    line: string,
    entry: ConfigFunctions
  ): Location | null {
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
      
      if (position.character < argStartInLine || position.character > argEndInLine) {
        continue;
      }
      
      if (!arg.value) continue;
      
      return this.findInConfig(entry.configPath, arg.value, entry.parser);
    }
    
    return null;
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

  private findInConfig(
    configPath: string,
    key: string,
    parser: (value: any) => string[]
  ): Location | null {
    try {
      const fullPath = path.join(this.workspaceRoot, configPath);
      
      if (!fs.existsSync(fullPath)) return null;
      
      let cached = this.configCache.get(fullPath);
      
      if (!cached) {
        const content = fs.readFileSync(fullPath, 'utf-8');
        let keys: string[] = [];
        
        try {
          const parsed = yaml.load(content);
          keys = parser(parsed);
        } catch {
          return null;
        }
        
        cached = {
          content,
          keys: new Set(keys)
        };
        this.configCache.set(fullPath, cached);
      }
      
      if (!cached.keys.has(key)) return null;
      
      const lines = cached.content.split('\n');
      const keyPattern = new RegExp(`^\\s*${this.escapeRegex(key)}\\s*:`);
      
      for (let i = 0; i < lines.length; i++) {
        if (keyPattern.test(lines[i])) {
          const startChar = lines[i].search(/\S/);
          const keyEnd = startChar + key.length;
          return Location.create(
            `file://${fullPath}`,
            Range.create(i, startChar, i, keyEnd)
          );
        }
      }
      
      return null;
    } catch {
      return null;
    }
  }

  private escapeRegex(str: string): string {
    return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  }

  clearCache(): void {
    this.configCache.clear();
  }
}
