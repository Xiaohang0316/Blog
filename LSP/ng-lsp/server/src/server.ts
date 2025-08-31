import {
  createConnection,
  TextDocuments,
  ProposedFeatures,
  Diagnostic,
  DiagnosticSeverity,
  CodeActionKind,
  CodeAction,
  TextEdit
} from "vscode-languageserver/node";

import { TextDocument } from "vscode-languageserver-textdocument";
import { parseTemplate } from "@angular/compiler";

const connection = createConnection(ProposedFeatures.all);
const documents: TextDocuments<TextDocument> = new TextDocuments(TextDocument);

connection.onInitialize(() => {
  return {
    capabilities: {
      textDocumentSync: documents.syncKind,
      codeActionProvider: true
    }
  };
});

documents.onDidChangeContent(change => {
  validateTextDocument(change.document);
});

async function validateTextDocument(document: TextDocument) {
  const text = document.getText();
  const diagnostics: Diagnostic[] = [];

  const ast = parseTemplate(text, "inline.html").nodes;

  function walk(nodes: any[]) {
    for (const node of nodes) {
      if (node.attributes) {
        for (const attr of node.attributes) {
          if (attr.name === "ngIf") {
            diagnostics.push({
              severity: DiagnosticSeverity.Warning,
              range: {
                start: document.positionAt(node.sourceSpan.start.offset),
                end: document.positionAt(node.sourceSpan.end.offset)
              },
              message: `请替换 *ngIf 为 @if (...) { ... }`,
              source: "angular-lsp",
              code: `replace-ngIf::${attr.value}`
            });
          }
          if (attr.name === "ngFor") {
            diagnostics.push({
              severity: DiagnosticSeverity.Warning,
              range: {
                start: document.positionAt(node.sourceSpan.start.offset),
                end: document.positionAt(node.sourceSpan.end.offset)
              },
              message: `请替换 *ngFor 为 @for (...) { ... }`,
              source: "angular-lsp",
              code: `replace-ngFor::${attr.value}`
            });
          }
        }
      }
      if (node.children) walk(node.children);
    }
  }

  walk(ast);

  connection.sendDiagnostics({ uri: document.uri, diagnostics });
}

connection.onCodeAction(params => {
  const document = documents.get(params.textDocument.uri);
  if (!document) return [];

  const text = document.getText();
  const actions: CodeAction[] = [];

  for (const diag of params.context.diagnostics) {
    if (typeof diag.code === "string") {
      const [codeType, expr] = diag.code.split("::");

      if (codeType === "replace-ngIf") {
        // 检查是否有 else 分支
        const elseMatch = expr.match(/^(.*?)\s*;\s*else\s+(\w+)$/);
        let condition = expr;
        let elseTemplateName: string | null = null;
        if (elseMatch) {
          condition = elseMatch[1].trim();
          elseTemplateName = elseMatch[2].trim();
        }

        const original = text.slice(
          document.offsetAt(diag.range.start),
          document.offsetAt(diag.range.end)
        );

        // 如果有 else，找到对应 ng-template 内容
        let elseContent = "";
        if (elseTemplateName) {
          const tplRegex = new RegExp(
            `<ng-template\\s+#${elseTemplateName}[^>]*>([\\s\\S]*?)<\\/ng-template>`,
            "m"
          );
          const tplMatch = tplRegex.exec(text);
          if (tplMatch) {
            elseContent = tplMatch[1].trim();
          }
        }

        let replacement = `@if (${condition}) {\n  ${original.replace(/\*ngIf="[^"]+"/, "")}\n}`;
        if (elseContent) {
          replacement += ` @else {\n  ${elseContent}\n}`;
        }

        actions.push({
          title: `转换为 @if block${elseContent ? " + @else" : ""}`,
          kind: CodeActionKind.QuickFix,
          diagnostics: [diag],
          edit: {
            changes: {
              [document.uri]: [TextEdit.replace(diag.range, replacement)]
            }
          }
        });
      }

      if (codeType === "replace-ngFor") {
        const original = text.slice(
          document.offsetAt(diag.range.start),
          document.offsetAt(diag.range.end)
        );
        actions.push({
          title: `转换为 @for block`,
          kind: CodeActionKind.QuickFix,
          diagnostics: [diag],
          edit: {
            changes: {
              [document.uri]: [
                TextEdit.replace(
                  diag.range,
                  `@for (${expr}) {\n  ${original.replace(/\*ngFor="[^"]+"/, "")}\n}`
                )
              ]
            }
          }
        });
      }
    }
  }

  return actions;
});

documents.listen(connection);
connection.listen();
