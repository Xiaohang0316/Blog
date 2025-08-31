import * as vscode from "vscode";
import * as path from "path";
import {
  LanguageClient,
  LanguageClientOptions,
  ServerOptions,
  TransportKind
} from "vscode-languageclient/node";

let client: LanguageClient;

export function activate(context: vscode.ExtensionContext) {
  const serverModule = context.asAbsolutePath(
    path.join("server", "out", "server.js")
  );

  const serverOptions: ServerOptions = {
    run: { module: serverModule, transport: TransportKind.ipc },
    debug: { module: serverModule, transport: TransportKind.ipc }
  };

  const clientOptions: LanguageClientOptions = {
    documentSelector: [{ scheme: "file", language: "html" }],
  };

  client = new LanguageClient(
    "angularLsp",
    "Angular Template LSP",
    serverOptions,
    clientOptions
  );

  client.start();
}

export function deactivate(): Thenable<void> | undefined {
  return client ? client.stop() : undefined;
}
