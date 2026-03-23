
import * as vscode from 'vscode';
import * as path from 'path';

export function activate(context: vscode.ExtensionContext) {
  console.log('========================================');
  console.log('Fake Debug Extension ACTIVATE called');
  console.log('context.extensionPath:', context.extensionPath);
  console.log('========================================');
  
  vscode.window.showInformationMessage('Fake Debug Extension activated');
  
  const factory = vscode.debug.registerDebugAdapterDescriptorFactory('fake-debug', {
    createDebugAdapterDescriptor(session: vscode.DebugSession) {
      console.log('========================================');
      console.log('🔥 createDebugAdapterDescriptor CALLED!');
      console.log('Session ID:', session.id);
      console.log('Session name:', session.name);
      console.log('Session type:', session.type);
      console.log('========================================');
      
      const adapter = path.join(context.extensionPath, 'out', 'adapter', 'debugAdapter.js');
      console.log('Adapter path:', adapter);
      
      return new vscode.DebugAdapterExecutable('node', [adapter]);
    }
  });
  
  context.subscriptions.push(factory);
  console.log('✅ DebugAdapterDescriptorFactory registered for fake-debug');
}
