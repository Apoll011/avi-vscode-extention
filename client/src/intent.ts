import * as vscode from 'vscode';

export class IntentTestPanel {
  private panel: vscode.WebviewPanel | undefined;

  show() {
    if (this.panel) {
      this.panel.reveal();
      return;
    }

    this.panel = vscode.window.createWebviewPanel(
      'aviIntentTest',
      'Test Intent',
      vscode.ViewColumn.Two,
      { enableScripts: true }
    );

    this.panel.webview.html = this.generateTestHTML();

    // TODO: Add message handler for utterance testing
    this.panel.webview.onDidReceiveMessage(async message => {
      if (message.command === 'testUtterance') {
        // PLACEHOLDER: This is where API integration will happen
        // const result = await testUtteranceAPI(message.utterance);
        // this.panel.webview.postMessage({ command: 'result', data: result });
        
        this.panel!.webview.postMessage({
          command: 'result',
          data: {
            status: 'pending',
            message: 'API integration not yet implemented'
          }
        });
      }
    });

    this.panel.onDidDispose(() => {
      this.panel = undefined;
    });
  }

  private generateTestHTML(): string {
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: var(--vscode-font-family); padding: 20px; }
          #utterance { width: 100%; padding: 10px; margin: 10px 0; background: var(--vscode-input-background); color: var(--vscode-input-foreground); border: 1px solid var(--vscode-input-border); }
          button { padding: 10px 20px; background: var(--vscode-button-background); color: var(--vscode-button-foreground); border: none; cursor: pointer; }
          button:hover { background: var(--vscode-button-hoverBackground); }
          #result { margin-top: 20px; padding: 15px; background: var(--vscode-editor-background); border-radius: 4px; }
          .result-section { margin: 10px 0; }
          .label { font-weight: bold; color: var(--vscode-textLink-foreground); }
        </style>
      </head>
      <body>
        <h2>Test Intent Recognition</h2>
        <input type="text" id="utterance" placeholder="Enter an utterance to test..." />
        <button onclick="testUtterance()">Test</button>
        <div id="result"></div>

        <script>
          const vscode = acquireVsCodeApi();

          function testUtterance() {
            const utterance = document.getElementById('utterance').value;
            if (!utterance) return;

            vscode.postMessage({
              command: 'testUtterance',
              utterance: utterance
            });

            document.getElementById('result').innerHTML = '<p>Testing...</p>';
          }

          window.addEventListener('message', event => {
            const message = event.data;
            if (message.command === 'result') {
              displayResult(message.data);
            }
          });

          function displayResult(data) {
            const resultDiv = document.getElementById('result');
            
            if (data.status === 'pending') {
              resultDiv.innerHTML = '<p>' + data.message + '</p>';
              return;
            }

            // TODO: Format actual API response when integrated
            resultDiv.innerHTML = \`
              <div class="result-section">
                <span class="label">Intent:</span> \${data.intent || 'N/A'}
              </div>
              <div class="result-section">
                <span class="label">Confidence:</span> \${data.confidence || 'N/A'}
              </div>
              <div class="result-section">
                <span class="label">Slots:</span> \${JSON.stringify(data.slots || {})}
              </div>
            \`;
          }
        </script>
      </body>
      </html>
    `;
  }
}