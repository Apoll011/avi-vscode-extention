import {
	createConnection,
	TextDocuments,
	ProposedFeatures,
	InitializeParams,
	TextDocumentSyncKind,
	InitializeResult,
	DocumentDiagnosticReport,
	DocumentDiagnosticReportKind,
	FoldingRange,
} from 'vscode-languageserver/node';
import { URI } from 'vscode-uri';
import {
	TextDocument
} from 'vscode-languageserver-textdocument';
import { completionHandler, completionResolve } from './completion/completion';
import { ConfigBasedCompletionProvider } from './completion/providers/configBased';
import { computeFoldingRanges } from './folding';
import { DeclarationHandler } from './declaration/handler';
import { DeclarationRegistry } from './declaration/types';
import { DefinitionHandler } from './definition/definitionHandler';
import { ReferencesHandler } from './references/referencesHandler';
import { createHoverHandler } from './hover';

const connection = createConnection(ProposedFeatures.all);

const documents = new TextDocuments(TextDocument);
let rootPath = "";
export let configProviders: ConfigBasedCompletionProvider;

let declarationHandler: DeclarationHandler;
let definitionHandler: DefinitionHandler;
let referencesHandler: ReferencesHandler;

export let onValidProject = true;

connection.onInitialize((params: InitializeParams) => {
	const capabilities = params.capabilities;
	rootPath = URI.parse(params.workspaceFolders?.[0]?.uri || "").fsPath;

	if (rootPath === "") {
		onValidProject = false;
		connection.sendNotification('window/showMessage', { type: 1, message: 'Avi LSP Server: No workspace folder found. Some features may not work properly.' });
	}
	const result: InitializeResult = {
		capabilities: {
			textDocumentSync: TextDocumentSyncKind.Full,
			completionProvider: {
				resolveProvider: true
			},
			diagnosticProvider: {
				interFileDependencies: false,
				workspaceDiagnostics: false
			},
			foldingRangeProvider: true,
			declarationProvider: true,
			definitionProvider: true,
			referencesProvider: true,
			hoverProvider: true,
			workspace: {
				workspaceFolders: {
					supported: true
				}
			}
		}
	};
	return result;
});

connection.onInitialized(() => {
	if (onValidProject) {		    
		const registry: DeclarationRegistry = {
		configEntries: [
			{
			functionName: "locale",
			argumentPosition: 0,
			configPath: "responses/en.lang",
			parser: (value) => Object.keys((value as any).lang)
			},
			{
			functionName: "get_constant",
			argumentPosition: 0,
			configPath: "config/const.config",
			parser: (value) => Object.keys((value as any).constants)
			},
			{
			functionName: "has_constant",
			argumentPosition: 0,
			configPath: "config/const.config",
			parser: (value) => Object.keys((value as any).constants)
			},
			{
			functionName: "get_setting",
			argumentPosition: 0,
			configPath: "config/settings.config",
			parser: (value) => Object.keys((value as any).settings)
			},
			{
			functionName: "has_setting",
			argumentPosition: 0,
			configPath: "config/settings.config",
			parser: (value) => Object.keys((value as any).settings)
			},
			{
			functionName: "get_setting_full",
			argumentPosition: 0,
			configPath: "config/settings.config",
			parser: (value) => Object.keys((value as any).settings)
			},
		]
		};
		
		configProviders = new ConfigBasedCompletionProvider(rootPath, registry);
		definitionHandler = new DefinitionHandler(documents);
		declarationHandler = new DeclarationHandler(documents, rootPath, registry);
		referencesHandler = new ReferencesHandler(documents, rootPath, registry);
	}

	connection.sendNotification('window/showMessage', { type: 3, message: 'Avi LSP Server is running' });
});


connection.languages.diagnostics.on(async (params) => {
	const document = documents.get(params.textDocument.uri);
	if (document !== undefined) {
		return {
			kind: DocumentDiagnosticReportKind.Full,
			items: []
		} satisfies DocumentDiagnosticReport;
	} else {
		return {
			kind: DocumentDiagnosticReportKind.Full,
			items: []
		} satisfies DocumentDiagnosticReport;
	}
});

connection.onCompletion(completionHandler(documents));
connection.onCompletionResolve(completionResolve);
connection.onFoldingRanges((params): FoldingRange[] => {
	const document = documents.get(params.textDocument.uri);
	if (!document) {
		return [];
	}
	
	try {
		return computeFoldingRanges(document);
	} catch {
		return [];
	}
});
connection.onDeclaration((params) => {
  if (!declarationHandler) return null;
  return declarationHandler.handle(params);
});
connection.onDefinition((params) => {
  if (!definitionHandler) return null;
  return definitionHandler.handle(params);
});
connection.onReferences((params) => {
  if (!referencesHandler) return null;
  return referencesHandler.handle(params);
});
connection.onHover((params) => {
  const document = documents.get(params.textDocument.uri);
  if (!document) {
    return null;
  }
  
  try {
    return createHoverHandler(document, params.position);
  } catch {
    return null;
  }
});

documents.listen(connection);

connection.listen();