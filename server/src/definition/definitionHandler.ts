// definition/definitionHandler.ts
import { TextDocuments, DefinitionParams, Location } from 'vscode-languageserver/node';
import { TextDocument } from 'vscode-languageserver-textdocument';
import { SymbolResolver } from '../declaration/symbolResolver';

export class DefinitionHandler {
  private symbolResolver: SymbolResolver;

  constructor(private documents: TextDocuments<TextDocument>) {
    this.symbolResolver = new SymbolResolver();
  }

  handle(params: DefinitionParams): Location | Location[] | null {
    const document = this.documents.get(params.textDocument.uri);
    if (!document) return null;

    const position = params.position;

    const functionLocation = this.symbolResolver.resolveFunction(document, position);
    if (functionLocation) return functionLocation;

    const variableLocation = this.symbolResolver.resolveVariable(document, position);
    if (variableLocation) return variableLocation;

    return null;
  }
}