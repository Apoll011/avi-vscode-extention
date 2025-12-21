import * as vscode from 'vscode';
import { SkillWorkspace } from "./types";

export function validateSkillWorkspace(workspace: SkillWorkspace, collection: vscode.DiagnosticCollection) {
    const diagnostics: vscode.Diagnostic[] = [];
    const mainUri = vscode.Uri.file(workspace.entryFile.path);

        
    // Check for main() function in entry file
    if (!workspace.entryFile.content.includes('fn main()')) {
        const diagnostic = new vscode.Diagnostic(
            new vscode.Range(0, 0, 0, 0),
            'Entry file must contain a main() function',
            vscode.DiagnosticSeverity.Error
        );
        diagnostics.push(diagnostic);
    }
  
    // Validate intent handlers
    for (const intent of workspace.intents) {
        const handlerName = `fn intent_${intent.name.split('@')[1].replace('.', '_')}(`;
        const hasHandler = workspace.aviFiles.some(f => f.content.includes(handlerName));
    
        if (!hasHandler) {
            diagnostics.push({
                message: `Intent ${intent.name} has no handler function (expected ${handlerName})`,
                severity: vscode.DiagnosticSeverity.Warning,
                range: new vscode.Range(0, 0, 0, 0),
                source: 'avi-skill'
            } as vscode.Diagnostic);
        }
    }
  
    // Validate entity references in intents
    for (const intent of workspace.intents) {
        for (const utterance of intent.utterances) {
        const entityMatches = utterance.match(/\[(\w+)\]/g);
      
        if (entityMatches) {
            for (const match of entityMatches) {
            const entityName = match.slice(1, -1);
            const entityExists = workspace.entities.some(e => e.name === entityName);
          
            if (!entityExists) {
                diagnostics.push({
                    message: `Entity '${entityName}' referenced but not defined`,
                    severity: vscode.DiagnosticSeverity.Error,
                    range: new vscode.Range(0, 0, 0, 0),
                    source: 'avi-skill'
                } as vscode.Diagnostic);
              }
            }
        }
        }
    }
  
    // Validate locale key consistency across languages
    if (workspace.responses.length > 0) {
        const allKeys = new Set<string>();
    
        for (const langFile of workspace.responses) {
        Object.keys(langFile.lang).forEach(key => allKeys.add(key));
        }

        for (const key of allKeys) {
        const missingIn = workspace.responses.filter(lf => !lf.lang[key]);
      
        if (missingIn.length > 0) {
            diagnostics.push({
            message: `Locale key '${key}' missing in: ${missingIn.map(lf => lf.code).join(', ')}`,
            severity: vscode.DiagnosticSeverity.Warning,
                range: new vscode.Range(0, 0, 0, 0),
                source: 'avi-skill'
            } as vscode.Diagnostic);
        }
        }
    }

    collection.set(mainUri, diagnostics);
}