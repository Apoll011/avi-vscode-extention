// declaration/symbolResolver.ts
import { TextDocument } from 'vscode-languageserver-textdocument';
import { Location, Position, Range } from 'vscode-languageserver/node';
import { SymbolInfo } from './types';

export class SymbolResolver {
  resolveFunction(document: TextDocument, position: Position): Location | null {
    const text = document.getText();
    const offset = document.offsetAt(position);
    const wordRange = this.getWordRangeAtPosition(text, offset);
    
    if (!wordRange) return null;
    
    const word = text.substring(wordRange.start, wordRange.end);
    if (!word) return null;

    const functionPattern = new RegExp(`^\\s*fn\\s+${this.escapeRegex(word)}\\s*\\(`, 'm');
    const lines = text.split('\n');
    
    for (let i = 0; i < lines.length; i++) {
      if (functionPattern.test(lines[i])) {
        const match = lines[i].match(/fn\s+(\w+)/);
        if (match) {
          const startChar = lines[i].indexOf('fn');
          return Location.create(
            document.uri,
            Range.create(i, startChar, i, startChar + match[0].length)
          );
        }
      }
    }
    
    return null;
  }

  resolveVariable(document: TextDocument, position: Position): Location | null {
    const text = document.getText();
    const offset = document.offsetAt(position);
    const wordRange = this.getWordRangeAtPosition(text, offset);
    
    if (!wordRange) return null;
    
    const word = text.substring(wordRange.start, wordRange.end);
    if (!word) return null;

    const lines = text.split('\n');
    const currentLine = position.line;
    
    const declarationPattern = new RegExp(`^\\s*${this.escapeRegex(word)}\\s*:=`, 'm');
    
    for (let i = 0; i <= currentLine; i++) {
      if (declarationPattern.test(lines[i])) {
        const match = lines[i].match(/(\w+)\s*:=/);
        if (match && match[1] === word) {
          const startChar = lines[i].indexOf(word);
          return Location.create(
            document.uri,
            Range.create(i, startChar, i, startChar + word.length)
          );
        }
      }
    }
    
    return null;
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