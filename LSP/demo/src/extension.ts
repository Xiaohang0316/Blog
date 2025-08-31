import * as vscode from 'vscode';

export function activate(context: vscode.ExtensionContext) {
  console.log('✅ my-minimal-demo: activate() called');
  vscode.window.showInformationMessage('✅ my-minimal-demo Activated!');

  const disposable = vscode.commands.registerCommand('my-minimal-demo.hello', () => {
    vscode.window.showInformationMessage('Hello from my-minimal-demo!');
  });

  context.subscriptions.push(disposable);
}

export function deactivate() {
  console.log('🛑 my-minimal-demo: deactivate() called');
}
