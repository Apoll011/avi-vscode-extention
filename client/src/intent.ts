import * as vscode from 'vscode';
import { TestHistory, IntentResponse } from './types';


export class IntentTestPanel {
  private panel: vscode.WebviewPanel | undefined;
  private testHistory: TestHistory[] = [];

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

    this.panel.webview.onDidReceiveMessage(async message => {
      if (message.command === 'testUtterance') {
        await this.handleTestUtterance(message.utterance);
      } else if (message.command === 'clearHistory') {
        this.testHistory = [];
        this.panel!.webview.postMessage({ command: 'historyCleared' });
      }
    });

    this.panel.onDidDispose(() => {
      this.panel = undefined;
      this.testHistory = [];
    });
  }

  private async handleTestUtterance(utterance: string) {
    const apiUrl = vscode.workspace.getConfiguration('avi').get<string>('intentApiUrl', 'http://localhost:1178/intent_recognition');

    try {
            console.log(`Sending intent test request to ${apiUrl} with utterance: ${utterance}`);

      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 10000); // 10s timeout
      
      
      const response = await fetch(apiUrl + `?text=${encodeURIComponent(utterance)}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        throw new Error(`Server responded with ${response.status}: ${response.statusText}`);
      }

      const data: IntentResponse = (await response.json() as {response: IntentResponse}).response;

      // Add to history
      this.testHistory.unshift({
        utterance: data.input,
        intent: data.intent?.intentName || null,
        confidence: data.intent?.probability || 0,
        timestamp: Date.now(),
      });

      // Keep only last 5
      if (this.testHistory.length > 5) {
        this.testHistory = this.testHistory.slice(0, 5);
      }

      this.panel!.webview.postMessage({
        command: 'result',
        data: {
          success: true,
          response: data,
          history: this.testHistory,
        }
      });

    } catch (error: any) {
      let errorMessage = 'Something unexpected happened';
      let errorType = 'error';

      if (error.name === 'AbortError') {
        errorMessage = 'The request took too long. Is your server running?';
        errorType = 'timeout';
      } else if (error.message.includes('fetch')) {
        errorMessage = 'Could not reach the server. Make sure it\'s running!';
        errorType = 'connection';
      } else if (error.message.includes('JSON')) {
        errorMessage = 'Server sent back something weird. Check the response format.';
        errorType = 'parse';
      } else if (error.message.includes('Server responded')) {
        errorMessage = error.message;
        errorType = 'server';
      }

      this.panel!.webview.postMessage({
        command: 'result',
        data: {
          success: false,
          error: errorMessage,
          errorType: errorType,
        }
      });
    }
  }

  private generateTestHTML(): string {
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <style>
          * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
          }

          body {
            font-family: var(--vscode-font-family);
            padding: 24px;
            background: var(--vscode-editor-background);
            color: var(--vscode-editor-foreground);
            line-height: 1.6;
          }

          .container {
            max-width: 800px;
            margin: 0 auto;
          }

          h1 {
            font-size: 24px;
            font-weight: 600;
            margin-bottom: 24px;
            color: var(--vscode-editor-foreground);
          }

          .card {
            background: var(--vscode-sideBar-background);
            border: 1px solid var(--vscode-panel-border);
            border-radius: 6px;
            padding: 20px;
            margin-bottom: 16px;
          }

          .input-card {
            display: flex;
            flex-direction: column;
            gap: 12px;
          }

          .input-group {
            display: flex;
            gap: 8px;
          }

          input {
            flex: 1;
            padding: 10px 12px;
            background: var(--vscode-input-background);
            color: var(--vscode-input-foreground);
            border: 1px solid var(--vscode-input-border);
            border-radius: 4px;
            font-size: 14px;
            font-family: var(--vscode-font-family);
          }

          input:focus {
            outline: none;
            border-color: var(--vscode-focusBorder);
          }

          input::placeholder {
            color: var(--vscode-input-placeholderForeground);
          }

          button {
            padding: 10px 20px;
            background: var(--vscode-button-background);
            color: var(--vscode-button-foreground);
            border: none;
            border-radius: 4px;
            cursor: pointer;
            font-size: 14px;
            font-weight: 500;
            transition: background 0.1s;
          }

          button:hover {
            background: var(--vscode-button-hoverBackground);
          }

          button:active {
            transform: translateY(1px);
          }

          button.secondary {
            background: var(--vscode-button-secondaryBackground);
            color: var(--vscode-button-secondaryForeground);
          }

          button.secondary:hover {
            background: var(--vscode-button-secondaryHoverBackground);
          }

          .result-card {
            display: none;
          }

          .result-card.show {
            display: block;
          }

          .error-card {
            background: var(--vscode-inputValidation-errorBackground);
            border-color: var(--vscode-inputValidation-errorBorder);
          }

          .error-icon {
            font-size: 48px;
            text-align: center;
            margin-bottom: 16px;
          }

          .error-title {
            font-size: 18px;
            font-weight: 600;
            margin-bottom: 8px;
            text-align: center;
          }

          .error-message {
            text-align: center;
            opacity: 0.9;
            margin-bottom: 16px;
          }

          .error-suggestions {
            background: rgba(0, 0, 0, 0.2);
            border-radius: 4px;
            padding: 12px;
            font-size: 13px;
          }

          .error-suggestions ul {
            margin-left: 20px;
            margin-top: 8px;
          }

          .error-suggestions li {
            margin: 4px 0;
          }

          .intent-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 16px;
            padding-bottom: 12px;
            border-bottom: 1px solid var(--vscode-panel-border);
          }

          .intent-name {
            font-size: 18px;
            font-weight: 600;
            color: var(--vscode-textLink-activeForeground);
          }

          .confidence-badge {
            padding: 4px 12px;
            background: var(--vscode-badge-background);
            color: var(--vscode-badge-foreground);
            border-radius: 12px;
            font-size: 12px;
            font-weight: 600;
          }

          .confidence-bar-container {
            margin: 16px 0;
          }

          .confidence-label {
            font-size: 12px;
            color: var(--vscode-descriptionForeground);
            margin-bottom: 6px;
            display: flex;
            justify-content: space-between;
          }

          .confidence-bar {
            height: 8px;
            background: var(--vscode-panel-border);
            border-radius: 4px;
            overflow: hidden;
          }

          .confidence-fill {
            height: 100%;
            background: var(--vscode-textLink-activeForeground);
            border-radius: 4px;
            transition: width 0.3s ease;
          }

          .slots-section {
            margin-top: 20px;
          }

          .section-title {
            font-size: 14px;
            font-weight: 600;
            margin-bottom: 12px;
            color: var(--vscode-descriptionForeground);
          }

          .slot-item {
            background: var(--vscode-editor-background);
            border: 1px solid var(--vscode-panel-border);
            border-radius: 4px;
            padding: 12px;
            margin-bottom: 8px;
          }

          .slot-header {
            display: flex;
            justify-content: space-between;
            margin-bottom: 8px;
          }

          .slot-name {
            font-weight: 600;
            color: var(--vscode-symbolIcon-functionForeground);
          }

          .slot-entity {
            font-size: 12px;
            color: var(--vscode-descriptionForeground);
            font-family: var(--vscode-editor-font-family);
          }

          .slot-value {
            margin-top: 4px;
            padding: 6px 8px;
            background: var(--vscode-textCodeBlock-background);
            border-radius: 3px;
            font-family: var(--vscode-editor-font-family);
            font-size: 13px;
          }

          .empty-state {
            text-align: center;
            padding: 32px;
            color: var(--vscode-descriptionForeground);
          }

          .history-card {
            max-height: 300px;
            overflow-y: auto;
          }

          .history-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 12px;
          }

          .history-item {
            background: var(--vscode-editor-background);
            border: 1px solid var(--vscode-panel-border);
            border-radius: 4px;
            padding: 10px 12px;
            margin-bottom: 8px;
            cursor: pointer;
            transition: border-color 0.1s;
          }

          .history-item:hover {
            border-color: var(--vscode-focusBorder);
          }

          .history-utterance {
            font-size: 13px;
            margin-bottom: 4px;
          }

          .history-meta {
            display: flex;
            justify-content: space-between;
            font-size: 11px;
            color: var(--vscode-descriptionForeground);
          }

          .loading {
            text-align: center;
            padding: 20px;
            color: var(--vscode-descriptionForeground);
          }

          .spinner {
            display: inline-block;
            width: 20px;
            height: 20px;
            border: 3px solid var(--vscode-panel-border);
            border-top-color: var(--vscode-textLink-activeForeground);
            border-radius: 50%;
            animation: spin 0.8s linear infinite;
          }

          @keyframes spin {
            to { transform: rotate(360deg); }
          }
        </style>
      </head>
      <body>
        <div class="container">
          <h1>Intent Recognition Tester</h1>

          <!-- Input Card -->
          <div class="card input-card">
            <div class="input-group">
              <input 
                type="text" 
                id="utterance" 
                placeholder="Enter an utterance to test... (e.g., 'turn on the lights')"
                autocomplete="off"
              />
              <button onclick="testUtterance()" id="testBtn">Test</button>
            </div>
          </div>

          <!-- Result Area -->
          <div id="resultArea"></div>

          <!-- History Card -->
          <div class="card history-card" id="historyCard" style="display: none;">
            <div class="history-header">
              <span class="section-title" style="margin: 0;">Recent Tests</span>
              <button class="secondary" onclick="clearHistory()" style="padding: 6px 12px; font-size: 12px;">Clear</button>
            </div>
            <div id="historyList"></div>
          </div>
        </div>

        <script>
          const vscode = acquireVsCodeApi();

          // Enter key support
          document.getElementById('utterance').addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
              testUtterance();
            }
          });

          function testUtterance() {
            const input = document.getElementById('utterance');
            const utterance = input.value.trim();
            
            if (!utterance) {
              showError('Empty utterance', 'Please enter something to test!', 'validation');
              return;
            }

            document.getElementById('testBtn').disabled = true;
            showLoading();

            vscode.postMessage({
              command: 'testUtterance',
              utterance: utterance
            });
          }

          function showLoading() {
            document.getElementById('resultArea').innerHTML = \`
              <div class="card">
                <div class="loading">
                  <div class="spinner"></div>
                  <p style="margin-top: 12px;">Testing utterance...</p>
                </div>
              </div>
            \`;
          }

          function showError(title, message, type) {
            const suggestions = {
              connection: \`
                <div class="error-suggestions">
                  <strong>💡 Quick fixes:</strong>
                  <ul>
                    <li>Check if your intent server is running</li>
                    <li>Verify the API URL in VS Code settings (avi.intentApiUrl)</li>
                    <li>Make sure there are no firewall issues</li>
                  </ul>
                </div>
              \`,
              timeout: \`
                <div class="error-suggestions">
                  <strong>💡 What to check:</strong>
                  <ul>
                    <li>Server might be overloaded or stuck</li>
                    <li>Check server logs for errors</li>
                    <li>Try restarting the intent service</li>
                  </ul>
                </div>
              \`,
              server: \`
                <div class="error-suggestions">
                  <strong>💡 Server issue detected:</strong>
                  <ul>
                    <li>Check server logs for details</li>
                    <li>Verify the request format is correct</li>
                  </ul>
                </div>
              \`,
              parse: \`
                <div class="error-suggestions">
                  <strong>💡 Response format issue:</strong>
                  <ul>
                    <li>Server might be returning unexpected data</li>
                    <li>Check if API versions match</li>
                  </ul>
                </div>
              \`
            };

            document.getElementById('resultArea').innerHTML = \`
              <div class="card error-card">
                <div class="error-icon">⚠️</div>
                <div class="error-title">\${title}</div>
                <div class="error-message">\${message}</div>
                \${suggestions[type] || ''}
              </div>
            \`;
          }

          function displayResult(data) {
            const intent = data.intent?.intentName || 'No intent detected';
            const confidence = data.intent?.probability || 0;
            const confidencePercent = (confidence * 100).toFixed(1);
            const slots = data.slots || [];

            let slotsHTML = '';
            if (slots.length > 0) {
              slotsHTML = \`
                <div class="slots-section">
                  <div class="section-title">Detected Slots (\${slots.length})</div>
                  \${slots.map(slot => \`
                    <div class="slot-item">
                      <div class="slot-header">
                        <span class="slot-name">\${slot.slotName}</span>
                        <span class="slot-entity">\${slot.entity}</span>
                      </div>
                      <div class="slot-value">
                        <strong>Raw:</strong> "\${slot.rawValue}"<br>
                        <strong>Value:</strong> \${JSON.stringify(slot.value.value)}
                        \${slot.value.kind !== 'Custom' ? \`<br><strong>Type:</strong> \${slot.value.kind}\` : ''}
                      </div>
                    </div>
                  \`).join('')}
                </div>
              \`;
            } else {
              slotsHTML = \`
                <div class="slots-section">
                  <div class="section-title">Detected Slots</div>
                  <div class="empty-state">No slots detected</div>
                </div>
              \`;
            }

            document.getElementById('resultArea').innerHTML = \`
              <div class="card result-card show">
                <div class="intent-header">
                  <span class="intent-name">\${intent}</span>
                  <span class="confidence-badge">\${confidencePercent}%</span>
                </div>
                
                <div class="confidence-bar-container">
                  <div class="confidence-label">
                    <span>Confidence</span>
                    <span>\${confidencePercent}%</span>
                  </div>
                  <div class="confidence-bar">
                    <div class="confidence-fill" style="width: \${confidencePercent}%"></div>
                  </div>
                </div>

                \${slotsHTML}
              </div>
            \`;
          }

          function displayHistory(history) {
            if (!history || history.length === 0) {
              document.getElementById('historyCard').style.display = 'none';
              return;
            }

            document.getElementById('historyCard').style.display = 'block';
            document.getElementById('historyList').innerHTML = history.map(item => \`
              <div class="history-item" onclick="loadFromHistory('\${item.utterance.replace(/'/g, "\\'")}')">
                <div class="history-utterance">"\${item.utterance}"</div>
                <div class="history-meta">
                  <span>\${item.intent || 'No intent'}</span>
                  <span>\${(item.confidence * 100).toFixed(1)}%</span>
                </div>
              </div>
            \`).join('');
          }

          function loadFromHistory(utterance) {
            document.getElementById('utterance').value = utterance;
            testUtterance();
          }

          function clearHistory() {
            vscode.postMessage({ command: 'clearHistory' });
          }

          window.addEventListener('message', event => {
            const message = event.data;
            document.getElementById('testBtn').disabled = false;

            if (message.command === 'result') {
              if (message.data.success) {
                displayResult(message.data.response);
                displayHistory(message.data.history);
              } else {
                showError(
                  message.data.errorType === 'connection' ? 'Connection Failed' :
                  message.data.errorType === 'timeout' ? 'Request Timeout' :
                  message.data.errorType === 'server' ? 'Server Error' :
                  message.data.errorType === 'parse' ? 'Parse Error' :
                  'Error',
                  message.data.error,
                  message.data.errorType
                );
              }
            } else if (message.command === 'historyCleared') {
              document.getElementById('historyCard').style.display = 'none';
            }
          });
        </script>
      </body>
      </html>
    `;
  }
}