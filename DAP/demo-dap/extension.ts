
import * as vscode from 'vscode';
import * as path from 'path';

export function activate(context: vscode.ExtensionContext) {
  vscode.window.showInformationMessage('Fake Debug Extension activated');
  console.log('Fake Debug Extension activated');
  console.log('context.extensionPath:', context.extensionPath);
  console.log('process.env.WORKSPACE_FOLDER:', process.env.WORKSPACE_FOLDER);
  context.subscriptions.push(
    vscode.debug.registerDebugAdapterDescriptorFactory('fake-debug', {
      createDebugAdapterDescriptor(session: vscode.DebugSession) {
        console.log('Registering DebugAdapter for fake-debug');
        const adapter = path.join(context.extensionPath, 'adapter', 'debugAdapter.js');
        console.log('Adapter path:', adapter);
        return new vscode.DebugAdapterExecutable('node', [adapter]);
      }
    })
  );
}
