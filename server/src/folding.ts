import { FoldingRange, FoldingRangeKind } from 'vscode-languageserver/node';
import { TextDocument } from 'vscode-languageserver-textdocument';

interface BraceStackItem {
	line: number;
	col: number;
}

interface CommentStackItem {
	startLine: number;
}

export function computeFoldingRanges(document: TextDocument): FoldingRange[] {
	const ranges: FoldingRange[] = [];
	const lineCount = document.lineCount;
	
	const braceStack: BraceStackItem[] = [];
	let commentStack: CommentStackItem | null = null;
	
	for (let i = 0; i < lineCount; i++) {
		const line = document.getText({
			start: { line: i, character: 0 },
			end: { line: i, character: Number.MAX_SAFE_INTEGER }
		});
		
		let inSingleLineComment = false;
		let inString = false;
		let stringChar: string | null = null;
		let escapeNext = false;
		
		for (let j = 0; j < line.length; j++) {
			const char = line[j];
			const next = j + 1 < line.length ? line[j + 1] : '';
			
			if (escapeNext) {
				escapeNext = false;
				continue;
			}
			
			if (inString) {
				if (char === '\\') {
					escapeNext = true;
				} else if (char === stringChar) {
					inString = false;
					stringChar = null;
				}
				continue;
			}
			
			if (inSingleLineComment) {
				continue;
			}
			
			if (commentStack !== null) {
				if (char === '*' && next === '/') {
					const startLine = commentStack.startLine;
					if (i > startLine) {
						ranges.push({
							startLine,
							endLine: i,
							kind: FoldingRangeKind.Comment
						});
					}
					commentStack = null;
					j++;
				}
				continue;
			}
			
			if (char === '/' && next === '/') {
				inSingleLineComment = true;
				continue;
			}
			
			if (char === '/' && next === '*') {
				const isJSDoc = j + 2 < line.length && line[j + 2] === '*';
				if (isJSDoc) {
					commentStack = { startLine: i };
					j += 2;
				}
				continue;
			}
			
			if (char === '"' || char === "'" || char === '`') {
				inString = true;
				stringChar = char;
				continue;
			}
			
			if (char === '{') {
				braceStack.push({ line: i, col: j });
			} else if (char === '}') {
				if (braceStack.length > 0) {
					const open = braceStack.pop()!;
					if (i > open.line) {
						ranges.push({
							startLine: open.line,
							endLine: i - 1
						});
					}
				}
			}
		}
	}
	
	return ranges;
}