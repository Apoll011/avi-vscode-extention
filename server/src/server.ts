import {
	createConnection,
	TextDocuments,
	ProposedFeatures,
	InitializeParams,
	TextDocumentSyncKind,
	InitializeResult,
	DocumentDiagnosticReport,
	DocumentDiagnosticReportKind,
} from 'vscode-languageserver/node';
import { URI } from 'vscode-uri';
import {
	TextDocument
} from 'vscode-languageserver-textdocument';
import { completionHandler, completionResolve } from './completion/completion';
import { ConfigBasedCompletionProvider } from './completion/providers/configBased';

const connection = createConnection(ProposedFeatures.all);

const documents = new TextDocuments(TextDocument);
let rootPath = "";
export let configProviders: ConfigBasedCompletionProvider;
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
		configProviders = new ConfigBasedCompletionProvider(rootPath);
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
documents.listen(connection);

connection.listen();
