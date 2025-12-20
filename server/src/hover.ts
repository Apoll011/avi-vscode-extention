import {
  Hover,
  MarkupKind,
  Position,
  Range,
} from 'vscode-languageserver/node';
import { TextDocument } from 'vscode-languageserver-textdocument';
import { AVI_BUILTINS } from './completion/builtins';
import { parseDoubleUnderscoreLabel } from './completion/providers/utils';

function getWordAtPosition(document: TextDocument, position: Position): { word: string; range: Range } | null {
  const text = document.getText();
  const offset = document.offsetAt(position);
  
  if (offset < 0 || offset > text.length) {
    return null;
  }

  const wordPattern = /[a-zA-Z_][a-zA-Z0-9_]*/g;
  const lines = text.split('\n');
  let currentOffset = 0;
  
  for (let line = 0; line < lines.length; line++) {
    const lineText = lines[line];
    const lineStart = currentOffset;
    const lineEnd = lineStart + lineText.length;
    
    if (offset >= lineStart && offset <= lineEnd) {
      const relativeOffset = offset - lineStart;
      let match: RegExpExecArray | null;
      
      while ((match = wordPattern.exec(lineText)) !== null) {
        const matchStart = match.index;
        const matchEnd = match.index + match[0].length;
        
        if (relativeOffset >= matchStart && relativeOffset <= matchEnd) {
          return {
            word: match[0],
            range: Range.create(
              Position.create(line, matchStart),
              Position.create(line, matchEnd)
            )
          };
        }
      }
      break;
    }
    
    currentOffset = lineEnd + 1;
  }
  
  return null;
}

export function createHoverHandler(document: TextDocument, position: Position): Hover | null {
  const wordInfo = getWordAtPosition(document, position);
  
  if (!wordInfo) {
    return null;
  }
  
  const symbol = AVI_BUILTINS.find(s => parseDoubleUnderscoreLabel(s.label).baseLabel === wordInfo.word);
  
  if (!symbol) {
    return null;
  }
  
  const parts: string[] = [];
  
  if (symbol.hoverText) {
    parts.push(symbol.hoverText);
  }
  
  if (symbol.detail) {
    parts.push(`\n\nSignature: ${symbol.detail}`);
  }
  
  return {
    contents: {
      kind: MarkupKind.Markdown,
      value: parts.join('')
    },
    range: wordInfo.range
  };
}