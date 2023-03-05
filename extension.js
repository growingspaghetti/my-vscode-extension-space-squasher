// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
const vscode = require('vscode');

// This method is called when your extension is activated
// Your extension is activated the very first time the command is executed

const squashImpl = vscode.window.createTextEditorDecorationType({
	letterSpacing: '-10px',
});

const endLabel = vscode.window.createTextEditorDecorationType({
	after: {
		contentText: "//impl",
		color: "#448C27",
		backgroundColor: "#ebebeb",
		textDecoration: `
      padding: 0.1em;
      margin: 0.2em;
      border-radius: 0.2em;
    `,
	},
});

/**
 * @param {vscode.ExtensionContext} context
 */
function activate(context) {
	let activeEditor = vscode.window.activeTextEditor;
	if (activeEditor && activeEditor.document.languageId == 'rust') {
		updateDecorations();
	}
	vscode.window.onDidChangeActiveTextEditor(editor => {
		activeEditor = editor;
		if (editor && editor.document.languageId == 'rust') {
			updateDecorations();
		}
	}, null, context.subscriptions);
	vscode.workspace.onDidChangeTextDocument(event => {
		if (activeEditor && event.document === activeEditor.document && activeEditor.document.languageId == 'rust') {
			updateDecorations();
		}
	}, null, context.subscriptions);
	function updateDecorations() {
		if (!activeEditor) {
			return;
		}

		let squashing = [];
		let labelling = [];
		let text = vscode.window.activeTextEditor.document.getText();
		const arr = text.split('\n');
		let inImplBlock = false;
		for (let line = 0; line < arr.length; line++) {
			if (arr[line].startsWith("impl")) {
				inImplBlock = true;
				continue;
			}
			if (inImplBlock && arr[line].startsWith("}")) {
				inImplBlock = false;
				let range = new vscode.Range(
					new vscode.Position(line, 0),
					new vscode.Position(line, 1)
				);
				let decoration = { range: range, hoverMessage: 'end impl' };
				labelling.push(decoration);
				continue;
			}
			if (inImplBlock && arr[line].startsWith("    ")) {
				let range = new vscode.Range(
					new vscode.Position(line, 0),
					new vscode.Position(line, 4)
				);
				let decoration = { range };
				squashing.push(decoration);
			}
		}
		//var regEx = /(?:    )(.*\n{0})/g;
		// var spacing = [];
		// var match;
		// while (match = regEx.exec(text)) {
		// 	var startPosSpacing = vscode.window.activeTextEditor.document.positionAt(match.index);
		// 	var endPosSpacing = vscode.window.activeTextEditor.document.positionAt(match.index + match[1].length);
		// 	var decorationSpacing = { range: new vscode.Range(startPosSpacing, endPosSpacing), hoverMessage: null };
		// 	spacing.push(decorationSpacing);
		// }
		vscode.window.activeTextEditor.setDecorations(squashImpl, squashing);
		vscode.window.activeTextEditor.setDecorations(endLabel, labelling);
	}
	// The command has been defined in the package.json file
	// Now provide the implementation of the command with  registerCommand
	// The commandId parameter must match the command field in package.json
	let disposable = vscode.commands.registerCommand('letterspace.helloWorld', function () {
		// The code you place here will be executed every time your command is executed
		// Display a message box to the user
		vscode.window.showInformationMessage('Hello World from letterspace!');
	});

	context.subscriptions.push(disposable);
}

// This method is called when your extension is deactivated
function deactivate() { }

module.exports = {
	activate,
	deactivate
};
