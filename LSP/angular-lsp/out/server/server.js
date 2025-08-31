"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const node_1 = require("vscode-languageserver/node");
const vscode_languageserver_textdocument_1 = require("vscode-languageserver-textdocument");
const connection = (0, node_1.createConnection)(node_1.ProposedFeatures.all);
console.log("✅ Server process started"); // <-- 这个必须在顶层打印
connection.console.log("✅ Server LSP connection created");
const documents = new node_1.TextDocuments(vscode_languageserver_textdocument_1.TextDocument);
// 初始化 LSP
connection.onInitialize(() => {
    return {
        capabilities: {
            textDocumentSync: node_1.TextDocumentSyncKind.Incremental,
        },
    };
});
connection.console.log("Server started!");
// 替换 *ngIf / *ngFor
function transformTemplate(content) {
    let transformed = content;
    const diagnostics = [];
    // *ngIf 替换
    const ngIfRegex = /\*ngIf="([^"]+)"/g;
    transformed = transformed.replace(ngIfRegex, (match, p1, offset) => {
        diagnostics.push({
            message: "*ngIf detected, consider using @if",
            range: {
                start: { line: 0, character: offset },
                end: { line: 0, character: offset + match.length },
            },
            severity: node_1.DiagnosticSeverity.Warning,
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
            severity: node_1.DiagnosticSeverity.Warning,
            source: "angular-lsp",
        });
        return `@for (${p1}) { }`;
    });
    return { transformed, diagnostics };
}
// 当文档变化时检查
documents.onDidChangeContent((change) => {
    console.log(111111);
    const { transformed, diagnostics } = transformTemplate(change.document.getText());
    connection.sendDiagnostics({ uri: change.document.uri, diagnostics });
    connection.console.log("Transformed template:\n" + transformed);
});
documents.listen(connection);
connection.listen();
