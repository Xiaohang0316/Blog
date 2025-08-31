import {
  createConnection,
  TextDocuments,
  ProposedFeatures,
  Diagnostic,
  DiagnosticSeverity,
  TextDocumentSyncKind,
} from "vscode-languageserver/node";
import { TextDocument } from "vscode-languageserver-textdocument";

const connection = createConnection(ProposedFeatures.all);
console.log("✅ Server process started"); // <-- 这个必须在顶层打印
connection.console.log("✅ Server LSP connection created");
const documents: TextDocuments<TextDocument> = new TextDocuments(TextDocument);

// 初始化 LSP
connection.onInitialize(() => {
  return {
    capabilities: {
      textDocumentSync: TextDocumentSyncKind.Incremental,
    },
  };
});
connection.console.log("Server started!");
// 替换 *ngIf / *ngFor
function transformTemplate(content: string) {
  let transformed = content;
  const diagnostics: Diagnostic[] = [];

  // *ngIf 替换
  const ngIfRegex = /\*ngIf="([^"]+)"/g;
  transformed = transformed.replace(ngIfRegex, (match, p1, offset) => {
    diagnostics.push({
      message: "*ngIf detected, consider using @if",
      range: {
        start: { line: 0, character: offset },
        end: { line: 0, character: offset + match.length },
      },
      severity: DiagnosticSeverity.Warning,
      source: "angular-lsp",
    });
    return `@if (${p1}) { }`;
  });

  // *ngFor 替换
  const ngForRegex = /\*ngFor="([^"]+)"/g;
  transformed = transformed.replace(ngForRegex, (match, p1, offset) => {
    diagnostics.push({
      message: "*ngFor detected, consider using @for",
      range: {
        start: { line: 0, character: offset },
        end: { line: 0, character: offset + match.length },
      },
      severity: DiagnosticSeverity.Warning,
      source: "angular-lsp",
    });
    return `@for (${p1}) { }`;
  });

  return { transformed, diagnostics };
}

// 当文档变化时检查
documents.onDidChangeContent((change: { document: TextDocument }) => {
  console.log(111111);
  
  const { transformed, diagnostics } = transformTemplate(
    change.document.getText()
  );

  connection.sendDiagnostics({ uri: change.document.uri, diagnostics });
  connection.console.log("Transformed template:\n" + transformed);
});

documents.listen(connection);
connection.listen();
