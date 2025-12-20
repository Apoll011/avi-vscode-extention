// declaration/handler.ts
import { TextDocuments, DeclarationParams, Location } from 'vscode-languageserver/node';
import { TextDocument } from 'vscode-languageserver-textdocument';
import { ConfigResolver } from './configResolver';
import { DeclarationRegistry } from './types';

export class DeclarationHandler {
  private configResolver: ConfigResolver;

  constructor(
    private documents: TextDocuments<TextDocument>,
    workspaceRoot: string,
    private registry: DeclarationRegistry
  ) {
    this.configResolver = new ConfigResolver(workspaceRoot);
  }

  handle(params: DeclarationParams): Location | Location[] | null {
    const document = this.documents.get(params.textDocument.uri);
    if (!document) return null;

    const position = params.position;

    const configLocation = this.configResolver.resolve(
      document,
      position,
      this.registry.configEntries
    );
    if (configLocation) return configLocation;

    return null;
  }

  clearCache(): void {
    this.configResolver.clearCache();
  }
}