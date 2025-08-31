import * as path from "path";
import * as vscode from "vscode";
import {
  LanguageClient,
  LanguageClientOptions,
  ServerOptions,
  TransportKind,
} from "vscode-languageclient/node";

let client: LanguageClient;

export function activate(context: vscode.ExtensionContext) {
  console.log('Angular ControlFlow LSP Activated!')
  vscode.window.showInformationMessage("Angular ControlFlow LSP Activated!");

  const serverModule = context.asAbsolutePath(
    path.join("out", "server", "server.js")
  );

  const serverOptions: ServerOptions = {
    run: { module: serverModule, transport: TransportKind.ipc },
    debug: {
      module: serverModule,
      transport: TransportKind.ipc,
      options: { execArgv: ["--nolazy", "--inspect=6009"] },
    },
  };

  const clientOptions: LanguageClientOptions = {
    documentSelector: [{ scheme: 'file', language: 'html' },
  { scheme: 'file', language: 'angular' },
  { scheme: 'file', language: 'HTML' },
  { scheme: 'file', language: 'angular-html' }],
    synchronize: {
      fileEvents: vscode.workspace.createFileSystemWatcher("**/*.html"),
    },
  };

  client = new LanguageClient(
    "angularControlFlowLsp",
    "Angular ControlFlow LSP",
    serverOptions,
    clientOptions
  );

client.start().then(() => {
  console.log("✅ Client started successfully");
}).catch(err => {
  console.error("❌ Client failed to start", err);
});
}

export function deactivate(): Thenable<void> | undefined {
  if (!client) return undefined;
  return client.stop();
}
