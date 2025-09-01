import {
  createConnection,
  TextDocuments,
  ProposedFeatures,
  Diagnostic,
  DiagnosticSeverity,
  TextDocumentSyncKind,
  InitializeParams,
  InitializeResult,
} from "vscode-languageserver/node";
import { TextDocument } from "vscode-languageserver-textdocument";

// 添加调试日志函数
function debugLog(message: string) {
  console.log(`[DEBUG] ${new Date().toISOString()} - ${message}`);
}

// 创建连接
const connection = createConnection(ProposedFeatures.all);
debugLog("服务器进程已启动");

// 创建文档管理器
const documents: TextDocuments<TextDocument> = new TextDocuments(TextDocument);

// 记录启动过程
debugLog("正在初始化 LSP 连接...");
connection.console.log("🚀 Angular ControlFlow LSP Server 进程已启动");

// 初始化处理
connection.onInitialize((params: InitializeParams): InitializeResult => {
  debugLog("收到初始化请求");
  connection.console.log("📝 收到客户端初始化请求");
  
  const capabilities = params.capabilities;
  connection.console.log(`客户端能力: ${JSON.stringify(capabilities, null, 2)}`);

  const result: InitializeResult = {
    capabilities: {
      textDocumentSync: TextDocumentSyncKind.Incremental,
      completionProvider: {
        resolveProvider: true,
        triggerCharacters: ['@', '*', 'n']
      },
      hoverProvider: false,
      codeActionProvider: false,
      diagnosticProvider: {
        interFileDependencies: false,
        workspaceDiagnostics: false
      }
    }
  };

  debugLog("发送服务器能力响应");
  connection.console.log("✅ 服务器初始化完成，发送能力信息");
  return result;
});

// 初始化完成
connection.onInitialized(() => {
  debugLog("服务器初始化完成");
  connection.console.log("🎉 服务器已准备就绪！");
  
  // 发送就绪通知
  connection.window.showInformationMessage("Angular Control Flow LSP 服务器已就绪！");
});

// 文档事件处理
documents.onDidOpen((event) => {
  debugLog(`文档已打开: ${event.document.uri}`);
  connection.console.log(`📂 文档已打开: ${event.document.uri}`);
  validateTextDocument(event.document);
});

documents.onDidChangeContent((change) => {
  debugLog(`文档已变更: ${change.document.uri}`);
  connection.console.log(`📝 文档内容已变更: ${change.document.uri}`);
  validateTextDocument(change.document);
});

documents.onDidClose((event) => {
  debugLog(`文档已关闭: ${event.document.uri}`);
  connection.console.log(`📄 文档已关闭: ${event.document.uri}`);
});

// 计算位置的辅助函数
function getPositionFromOffset(text: string, offset: number) {
  const beforeOffset = text.substring(0, offset);
  const lines = beforeOffset.split('\n');
  return {
    line: lines.length - 1,
    character: lines[lines.length - 1].length
  };
}

// 检测和转换 Angular 指令
function analyzeAngularTemplate(document: TextDocument) {
  const content = document.getText();
  const diagnostics: Diagnostic[] = [];
  
  debugLog("开始分析 Angular 模板");

  try {
    // 检测 *ngIf
    const ngIfRegex = /\*ngIf\s*=\s*"([^"]+)"/g;
    let match;
    
    while ((match = ngIfRegex.exec(content)) !== null) {
      const startPos = getPositionFromOffset(content, match.index);
      const endPos = getPositionFromOffset(content, match.index + match[0].length);
      
      debugLog(`发现 *ngIf: ${match[0]} 在位置 ${match.index}`);
      
      diagnostics.push({
        message: `💡 建议迁移到新的控制流: @if (${match[1]}) { ... }`,
        range: { start: startPos, end: endPos },
        severity: DiagnosticSeverity.Information,
        source: "angular-control-flow",
        code: "MIGRATE_NGIF",
        data: {
          condition: match[1],
          originalText: match[0],
          suggestedText: `@if (${match[1]}) { }`
        }
      });
    }

    // 检测 *ngFor
    const ngForRegex = /\*ngFor\s*=\s*"([^"]+)"/g;
    
    while ((match = ngForRegex.exec(content)) !== null) {
      const startPos = getPositionFromOffset(content, match.index);
      const endPos = getPositionFromOffset(content, match.index + match[0].length);
      
      debugLog(`发现 *ngFor: ${match[0]} 在位置 ${match.index}`);
      
      const forExpression = match[1];
      let transformedFor = forExpression;
      
      // 转换 ngFor 表达式
      const letMatch = forExpression.match(/let\s+(\w+)\s+of\s+(.+?)(?:;\s*trackBy:\s*(\w+))?/);
      if (letMatch) {
        const [, itemVar, collection, trackBy] = letMatch;
        const trackExpression = trackBy || '$index';
        transformedFor = `${itemVar} of ${collection}; track ${trackExpression}`;
      }
      
      diagnostics.push({
        message: `💡 建议迁移到新的控制流: @for (${transformedFor}) { ... }`,
        range: { start: startPos, end: endPos },
        severity: DiagnosticSeverity.Information,
        source: "angular-control-flow",
        code: "MIGRATE_NGFOR",
        data: {
          originalExpression: forExpression,
          transformedExpression: transformedFor,
          originalText: match[0],
          suggestedText: `@for (${transformedFor}) { }`
        }
      });
    }

    debugLog(`分析完成，发现 ${diagnostics.length} 个建议`);
    
  } catch (error) {
    debugLog(`分析出错: ${error}`);
    connection.console.error(`❌ 模板分析错误: ${error}`);
  }

  return diagnostics;
}

// 文档验证函数
async function validateTextDocument(textDocument: TextDocument): Promise<void> {
  try {
    debugLog(`开始验证文档: ${textDocument.uri}`);
    connection.console.log(`🔍 正在验证: ${textDocument.uri}`);
    
    const diagnostics = analyzeAngularTemplate(textDocument);
    
    debugLog(`验证完成，发送 ${diagnostics.length} 个诊断`);
    connection.console.log(`📊 发现 ${diagnostics.length} 个建议`);
    
    // 发送诊断信息
    connection.sendDiagnostics({ 
      uri: textDocument.uri, 
      diagnostics 
    });
    
  } catch (error) {
    debugLog(`验证出错: ${error}`);
    connection.console.error(`❌ 验证文档时出错: ${error}`);
  }
}

// 自动完成
connection.onCompletion((textDocumentPosition) => {
  debugLog("收到自动完成请求");
  connection.console.log("🔤 处理自动完成请求");
  
  const document = documents.get(textDocumentPosition.textDocument.uri);
  if (!document) {
    debugLog("文档不存在");
    return [];
  }

  const position = textDocumentPosition.position;
  const text = document.getText();
  const lines = text.split('\n');
  
  if (position.line >= lines.length) return [];
  
  const lineText = lines[position.line];
  const beforeCursor = lineText.substring(0, position.character);

  debugLog(`自动完成上下文: "${beforeCursor}"`);

  const completions = [];

  // @ 符号补全
  if (beforeCursor.endsWith('@')) {
    debugLog("提供 @ 控制流补全");
    completions.push(
      {
        label: '@if',
        kind: 15, // CompletionItemKind.Snippet
        insertText: 'if (${1:condition}) {\n  ${2:content}\n}',
        insertTextFormat: 2,
        documentation: 'Angular 新的 if 控制流',
      },
      {
        label: '@for',
        kind: 15,
        insertText: 'for (${1:item} of ${2:items}; track ${3:$index}) {\n  ${4:content}\n}',
        insertTextFormat: 2,
        documentation: 'Angular 新的 for 控制流',
      },
      {
        label: '@switch',
        kind: 15,
        insertText: 'switch (${1:expression}) {\n  @case (${2:value}) {\n    ${3:content}\n  }\n  @default {\n    ${4:default content}\n  }\n}',
        insertTextFormat: 2,
        documentation: 'Angular 新的 switch 控制流',
      }
    );
  }

  debugLog(`返回 ${completions.length} 个补全项`);
  return completions;
});

// 监听文档变化
documents.listen(connection);

// 启动连接监听
connection.listen();

// 最后的日志
debugLog("服务器监听已启动");
connection.console.log("🚀 Angular ControlFlow LSP Server 已准备就绪！");

// 进程退出处理
process.on('exit', () => {
  debugLog("服务器进程退出");
});

process.on('uncaughtException', (error) => {
  debugLog(`未捕获异常: ${error}`);
  connection.console.error(`❌ 未捕获异常: ${error}`);
});
