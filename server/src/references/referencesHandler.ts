// references/referencesHandler.ts
import { TextDocuments, ReferenceParams, Location } from 'vscode-languageserver/node';
import { TextDocument } from 'vscode-languageserver-textdocument';
import { SymbolReferenceResolver } from './symbolReferenceResolver';
import { ConfigReferenceResolver } from './configReferenceResolver';
import { DeclarationRegistry } from '../declaration/types';

export class ReferencesHandler {
  private symbolResolver: SymbolReferenceResolver;
  private configResolver: ConfigReferenceResolver;

  constructor(
    private documents: TextDocuments<TextDocument>,
    workspaceRoot: string,
    private registry: DeclarationRegistry
  ) {
    this.symbolResolver = new SymbolReferenceResolver();
    this.configResolver = new ConfigReferenceResolver(workspaceRoot);
  }

  handle(params: ReferenceParams): Location[] | null {
    const document = this.documents.get(params.textDocument.uri);
    if (!document) return null;

    const position = params.position;
    const includeDeclaration = params.context.includeDeclaration;

    if (this.isConfigFile(params.textDocument.uri)) {
      const allDocs = new Map<string, TextDocument>();
      this.documents.all().forEach(doc => {
        if (!this.isConfigFile(doc.uri)) {
          allDocs.set(doc.uri, doc);
        }
      });
      
      const configReferences = this.configResolver.findConfigKeyReferences(
        params.textDocument.uri,
        position,
        allDocs,
        includeDeclaration
      );
      
      if (configReferences.length > 0) return configReferences;
    }

    const functionReferences = this.symbolResolver.findFunctionReferences(
      document,
      position,
      includeDeclaration
    );
    if (functionReferences.length > 0) return functionReferences;

    const variableReferences = this.symbolResolver.findVariableReferences(
      document,
      position,
      includeDeclaration
    );
    if (variableReferences.length > 0) return variableReferences;

    return null;
  }

  private isConfigFile(uri: string): boolean {
    return uri.endsWith('.config') || uri.endsWith('.lang');
  }

  clearCache(): void {
    this.configResolver.clearCache();
  }
}