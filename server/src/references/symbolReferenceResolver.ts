// references/symbolReferenceResolver.ts
import { TextDocument } from 'vscode-languageserver-textdocument';
import { Location, Position, Range } from 'vscode-languageserver/node';

export class SymbolReferenceResolver {
  findFunctionReferences(
    document: TextDocument,
    position: Position,
    includeDeclaration: boolean
  ): Location[] {
    const text = document.getText();
    const offset = document.offsetAt(position);
    const wordRange = this.getWordRangeAtPosition(text, offset);
    
    if (!wordRange) return [];
    
    const word = text.substring(wordRange.start, wordRange.end);
    if (!word) return [];

    const isCursorOnDeclaration = this.isFunctionDeclaration(text, offset);
    
    const locations: Location[] = [];
    const lines = text.split('\n');
    
    if (includeDeclaration || !isCursorOnDeclaration) {
      const declarationPattern = new RegExp(`^\\s*fn\\s+${this.escapeRegex(word)}\\s*\\(`, 'm');
      
      for (let i = 0; i < lines.length; i++) {
        if (declarationPattern.test(lines[i])) {
          const match = lines[i].match(/fn\s+(\w+)/);
          if (match && match[1] === word) {
            const startChar = lines[i].indexOf(word);
            locations.push(
              Location.create(
                document.uri,
                Range.create(i, startChar, i, startChar + word.length)
              )
            );
            break;
          }
        }
      }
    }
    
    const callPattern = new RegExp(`\\b${this.escapeRegex(word)}\\s*\\(`, 'g');
    
    for (let i = 0; i < lines.length; i++) {
      let match;
      const line = lines[i];
      
      if (/^\s*fn\s+/.test(line)) continue;
      
      while ((match = callPattern.exec(line)) !== null) {
        const startChar = match.index;
        locations.push(
          Location.create(
            document.uri,
            Range.create(i, startChar, i, startChar + word.length)
          )
        );
      }
    }
    
    return locations;
  }

  findVariableReferences(
    document: TextDocument,
    position: Position,
    includeDeclaration: boolean
  ): Location[] {
    const text = document.getText();
    const offset = document.offsetAt(position);
    const wordRange = this.getWordRangeAtPosition(text, offset);
    
    if (!wordRange) return [];
    
    const word = text.substring(wordRange.start, wordRange.end);
    if (!word) return [];

    const isCursorOnDeclaration = this.isVariableDeclaration(text, offset);
    
    const locations: Location[] = [];
    const lines = text.split('\n');
    
    let declarationLine = -1;
    const declarationPattern = new RegExp(`^\\s*${this.escapeRegex(word)}\\s*:=`, 'm');
    
    for (let i = 0; i < lines.length; i++) {
      if (declarationPattern.test(lines[i])) {
        const match = lines[i].match(/(\w+)\s*:=/);
        if (match && match[1] === word) {
          declarationLine = i;
          
          if (includeDeclaration || !isCursorOnDeclaration) {
            const startChar = lines[i].indexOf(word);
            locations.push(
              Location.create(
                document.uri,
                Range.create(i, startChar, i, startChar + word.length)
              )
            );
          }
          break;
        }
      }
    }
    
    if (declarationLine === -1) return [];
    
    const usagePattern = new RegExp(`\\b${this.escapeRegex(word)}\\b`, 'g');
    
    for (let i = declarationLine; i < lines.length; i++) {
      const line = lines[i];
      
      if (i === declarationLine && /^\s*\w+\s*:=/.test(line)) {
        continue;
      }
      
      let match;
      while ((match = usagePattern.exec(line)) !== null) {
        const startChar = match.index;
        
        const before = line.substring(0, startChar);
        if (/\w$/.test(before)) continue;
        
        const after = line.substring(startChar + word.length);
        if (/^\w/.test(after)) continue;
        
        if (/\s*:=/.test(after)) continue;
        
        locations.push(
          Location.create(
            document.uri,
            Range.create(i, startChar, i, startChar + word.length)
          )
        );
      }
    }
    
    return locations;
  }

  private isFunctionDeclaration(text: string, offset: number): boolean {
    const lines = text.substring(0, offset).split('\n');
    const currentLine = lines[lines.length - 1];
    return /^\s*fn\s+\w+/.test(currentLine);
  }

  private isVariableDeclaration(text: string, offset: number): boolean {
    const lines = text.substring(0, offset).split('\n');
    const currentLine = lines[lines.length - 1];
    return /^\s*\w+\s*:=/.test(currentLine);
  }

  private getWordRangeAtPosition(text: string, offset: number): { start: number; end: number } | null {
    if (offset < 0 || offset > text.length) return null;
    
    let start = offset;
    let end = offset;
    
    while (start > 0 && this.isWordChar(text[start - 1])) {
      start--;
    }
    
    while (end < text.length && this.isWordChar(text[end])) {
      end++;
    }
    
    if (start === end) return null;
    
    return { start, end };
  }

  private isWordChar(char: string): boolean {
    return /[a-zA-Z0-9_]/.test(char);
  }

  private escapeRegex(str: string): string {
    return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  }
}
