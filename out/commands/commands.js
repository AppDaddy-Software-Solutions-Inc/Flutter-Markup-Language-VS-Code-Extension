"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.initCommands = void 0;
const vscode = require("vscode");
let previewPanel = undefined;
function initCommands(context) {
    // The command has been defined in the package.json file
    // Now provide the implementation of the command with registerCommand
    // The commandId parameter must match the command field in package.json
    // let disposable = ;
    context.subscriptions.push(vscode.commands.registerCommand('fml.openTemplatePreview', () => openTemplatePreview(context)));
    context.subscriptions.push(vscode.commands.registerCommand('fml.updateTemplatePreview', () => updateTemplatePreview()));
}
exports.initCommands = initCommands;
const openTemplatePreview = function (context) {
    try {
        // keep hold of our active editor so we can switch back after
        let activeEditor = vscode.window.activeTextEditor;
        // Set a custom context to reference that indicates the panel is open
        vscode.commands.executeCommand('setContext', 'flutter-markup-language.isPreviewOpen', true);
        let file = vscode.workspace.workspaceFile?.toString() ?? 'FML';
        // Create and show a new webview
        const panel = vscode.window.createWebviewPanel('openTemplatePreview', // Identifies the type of the webview. Used internally
        file + ' Template Preview', // Title of the panel displayed to the user
        vscode.ViewColumn.Two, // Editor column to show the new webview panel in.
        {
            enableScripts: true,
            enableCommandUris: true,
            retainContextWhenHidden: true,
            localResourceRoots: [vscode.Uri.joinPath(context.extensionUri)]
        });
        panel.webview.html = iframeHtml;
        panel.onDidDispose(() => {
            // Unset the global reference to the panel
            previewPanel = undefined;
            // Set a custom context to reference that indicates the panel is closed
            vscode.commands.executeCommand('setContext', 'flutter-markup-language.isPreviewOpen', false);
        }, null, context.subscriptions);
        // Set a global reference to the panel for accessing externally
        previewPanel = panel;
        // Update the preview on editor save
        vscode.workspace.onDidSaveTextDocument((doc) => doc.languageId === 'xml' ? updateTemplatePreview() : null);
        // vscode.workspace.onDidChangeTextDocument(() => updateTemplatePreview());
        panel.webview.onDidReceiveMessage((msg) => {
            if (msg.to && msg.to === 'vscode') {
                vscode.window.showInformationMessage(`${msg}`);
                updateTemplatePreview();
                console.log('Updated Template Preview from: ' + msg);
            }
        });
        // re-focus the editor the openTemplatePreview() call came from
        if (activeEditor) {
            vscode.window.showTextDocument(activeEditor.document.uri, { preview: false, viewColumn: activeEditor.viewColumn });
        }
        return panel;
    }
    catch (e) {
        // Reset the custom context to indicate the panel couldn't open
        vscode.commands.executeCommand('setContext', 'flutter-markup-language.isPreviewOpen', false);
        return undefined;
    }
};
function updateTemplatePreview() {
    // Get current editor panel text (fml code)
    let editorText = vscode.window.activeTextEditor?.document.getText();
    if (previewPanel === undefined) {
        vscode.window.showErrorMessage('Unable to find an open preview panel to update.');
    }
    else if (editorText === undefined) {
        vscode.window.showErrorMessage('Unable to read open editor panel text.');
    }
    else {
        previewPanel.webview.postMessage(editorText);
        // vscode.window.showInformationMessage('Updating Preview!');
    }
}
// webview + iframe to run the FML Engine through for template parsing 
// and a listener within the webview to pass the message to the iframe
let engineUrl = `https://pad.fml.dev/#/templates/vscode.xml`;
let iframeHtml = `<!DOCTYPE html>
	<html>
	<head>
		<style>
			body{
				margin: 0;
				padding: 0;
				border: none;
			}
			iframe{      
				display: block;   
				height: calc(100vh - 0px);   
				width: calc(100vw - 0px);     
				border: none;
				background: white;
				margin: 0;
				padding: 0;
			}
		</style>
	</head>
	<body>	
		<iframe id="iframe" name="${Date.now()}" src="${engineUrl}?v=${Date.now()}" title="fmliframe" sandbox="allow-same-origin allow-scripts allow-top-navigation allow-popups allow-pointer-lock allow-forms"></iframe>
		<!-- Relay the message the preview window receives to the iframe -->
		<script>
			window.addEventListener('message', (event) => {
				iframe.contentWindow.postMessage(event.data, '*');
			})
		</script>

	</body>
	</html>
`;
//# sourceMappingURL=commands.js.map