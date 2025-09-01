import {
  createConnection,
  TextDocuments,
  ProposedFeatures,
  Diagnostic,
  DiagnosticSeverity,
  TextDocumentSyncKind,
  InitializeParams,
  InitializeResult,
  CodeActionParams,
  CodeAction,
  CodeActionKind,
  TextEdit,
  Range,
  Position,
} from "vscode-languageserver/node";
import { TextDocument } from "vscode-languageserver-textdocument";

// 添加调试日志函数
function debugLog(message: string) {
  connection.console.log(`[DEBUG] ${new Date().toISOString()} - ${message}`);
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
      // 添加 Code Action 支持
      codeActionProvider: {
        codeActionKinds: [
          CodeActionKind.QuickFix,
          CodeActionKind.Refactor
        ]
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
function getPositionFromOffset(text: string, offset: number): Position {
  const beforeOffset = text.substring(0, offset);
  const lines = beforeOffset.split('\n');
  return {
    line: lines.length - 1,
    character: lines[lines.length - 1].length
  };
}

// 获取完整元素的范围（包括开始和结束标签）
function getElementRange(content: string, match: RegExpExecArray): Range {
  const startPos = getPositionFromOffset(content, match.index);
  const attributeEnd = match.index + match[0].length;
  
  // 查找元素的开始标签结束位置
  let tagStart = match.index;
  while (tagStart > 0 && content[tagStart] !== '<') {
    tagStart--;
  }
  
  // 查找标签名
  const tagNameMatch = content.substring(tagStart).match(/<(\w+)/);
  if (!tagNameMatch) {
    // 如果找不到标签名，只返回属性范围
    return {
      start: startPos,
      end: getPositionFromOffset(content, attributeEnd)
    };
  }
  
  const tagName = tagNameMatch[1];
  
  // 查找对应的结束标签或自闭合标签
  let currentPos = attributeEnd;
  let depth = 0;
  let inTag = false;
  let elementEnd = attributeEnd;
  
  // 检查是否为自闭合标签
  const selfClosingMatch = content.substring(tagStart, currentPos + 10).match(/<[^>]*\/>/);
  if (selfClosingMatch) {
    elementEnd = tagStart + selfClosingMatch[0].length;
  } else {
    // 查找结束标签
    while (currentPos < content.length) {
      const char = content[currentPos];
      
      if (char === '<') {
        const remaining = content.substring(currentPos);
        const openTag = remaining.match(new RegExp(`^<${tagName}[^>]*>`));
        const closeTag = remaining.match(new RegExp(`^</${tagName}>`));
        
        if (openTag) {
          depth++;
          currentPos += openTag[0].length;
        } else if (closeTag) {
          if (depth === 0) {
            elementEnd = currentPos + closeTag[0].length;
            break;
          }
          depth--;
          currentPos += closeTag[0].length;
        } else {
          currentPos++;
        }
      } else {
        currentPos++;
      }
    }
  }
  
  return {
    start: getPositionFromOffset(content, tagStart),
    end: getPositionFromOffset(content, elementEnd)
  };
}

// 升级版的 Angular 模板分析函数
function analyzeAngularTemplate(document: TextDocument) {
  const content = document.getText();
  const diagnostics: Diagnostic[] = [];
  
  debugLog("开始分析 Angular 模板");

  try {
    // 检测 *ngIf
    const ngIfRegex = /\*ngIf\s*=\s*"([^"]+)"/g;
    let match;
    
    while ((match = ngIfRegex.exec(content)) !== null) {
      const range = getElementRange(content, match);
      const condition = match[1];
      
      debugLog(`发现 *ngIf: ${match[0]} 在位置 ${match.index}`);
      
      // 生成新的控制流语法
      const elementContent = content.substring(
        content.indexOf('>', match.index) + 1,
        content.lastIndexOf('<', content.indexOf(`</${getTagName(content, match.index)}`, match.index))
      ).trim();
      
      const newControlFlow = `@if (${condition}) {\n  ${elementContent}\n}`;
      
      diagnostics.push({
        message: `💡 建议迁移到新的控制流: @if (${condition}) { ... }`,
        range,
        severity: DiagnosticSeverity.Warning,
        source: "angular-control-flow",
        code: "MIGRATE_NGIF",
        data: {
          condition,
          originalText: match[0],
          suggestedText: newControlFlow,
          elementRange: range,
          replacementText: newControlFlow
        }
      });
    }

    // 检测 *ngFor
    const ngForRegex = /\*ngFor\s*=\s*"([^"]+)"/g;
    
    while ((match = ngForRegex.exec(content)) !== null) {
      const range = getElementRange(content, match);
      const forExpression = match[1];
      
      debugLog(`发现 *ngFor: ${match[0]} 在位置 ${match.index}`);
      
      // 转换 ngFor 表达式
      let transformedFor = forExpression;
      const letMatch = forExpression.match(/let\s+(\w+)\s+of\s+(.+?)(?:;\s*let\s+(\w+)\s*=\s*index)?(?:;\s*trackBy:\s*(\w+))?/);
      
      if (letMatch) {
        const [, itemVar, collection, indexVar, trackBy] = letMatch;
        const trackExpression = trackBy || '$index';
        transformedFor = `${itemVar} of ${collection}; track ${trackExpression}`;
        
        // 如果有索引变量，添加到转换中
        if (indexVar) {
          transformedFor = `${itemVar} of ${collection}; let ${indexVar} = $index; track ${trackExpression}`;
        }
      }
      
      // 生成新的控制流语法
      const elementContent = content.substring(
        content.indexOf('>', match.index) + 1,
        content.lastIndexOf('<', content.indexOf(`</${getTagName(content, match.index)}`, match.index))
      ).trim();
      
      const newControlFlow = `@for (${transformedFor}) {\n  ${elementContent}\n}`;
      
      diagnostics.push({
        message: `💡 建议迁移到新的控制流: @for (${transformedFor}) { ... }`,
        range,
        severity: DiagnosticSeverity.Warning,
        source: "angular-control-flow",
        code: "MIGRATE_NGFOR",
        data: {
          originalExpression: forExpression,
          transformedExpression: transformedFor,
          originalText: match[0],
          suggestedText: newControlFlow,
          elementRange: range,
          replacementText: newControlFlow
        }
      });
    }

    // 检测 *ngSwitch
    const ngSwitchRegex = /\*ngSwitch\s*=\s*"([^"]+)"/g;
    
    while ((match = ngSwitchRegex.exec(content)) !== null) {
      const range = getElementRange(content, match);
      const switchExpression = match[1];
      
      debugLog(`发现 *ngSwitch: ${match[0]} 在位置 ${match.index}`);
      
      // 查找相关的 *ngSwitchCase 和 *ngSwitchDefault
      const switchCases = findSwitchCases(content, match.index);
      const newSwitchFlow = generateSwitchControlFlow(switchExpression, switchCases);
      
      diagnostics.push({
        message: `💡 建议迁移到新的控制流: @switch (${switchExpression}) { ... }`,
        range,
        severity: DiagnosticSeverity.Warning,
        source: "angular-control-flow",
        code: "MIGRATE_NGSWITCH",
        data: {
          switchExpression,
          originalText: match[0],
          suggestedText: newSwitchFlow,
          elementRange: range,
          replacementText: newSwitchFlow
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

// 获取标签名的辅助函数
function getTagName(content: string, offset: number): string {
  let tagStart = offset;
  while (tagStart > 0 && content[tagStart] !== '<') {
    tagStart--;
  }
  
  const tagMatch = content.substring(tagStart).match(/<(\w+)/);
  return tagMatch ? tagMatch[1] : 'div';
}

// 查找 switch cases 的辅助函数
function findSwitchCases(content: string, switchOffset: number): Array<{type: 'case' | 'default', value?: string, content: string}> {
  const cases: Array<{type: 'case' | 'default', value?: string, content: string}> = [];
  
  // 这里可以添加更复杂的逻辑来查找相关的 switch cases
  // 简化版本，返回示例结构
  return cases;
}

// 生成 switch 控制流的辅助函数
function generateSwitchControlFlow(expression: string, cases: Array<{type: 'case' | 'default', value?: string, content: string}>): string {
  let result = `@switch (${expression}) {\n`;
  
  for (const case_ of cases) {
    if (case_.type === 'case') {
      result += `  @case (${case_.value}) {\n    ${case_.content}\n  }\n`;
    } else {
      result += `  @default {\n    ${case_.content}\n  }\n`;
    }
  }
  
  result += '}';
  return result;
}

// Code Action 处理器
connection.onCodeAction((params: CodeActionParams) => {
  debugLog(`收到 Code Action 请求: ${params.textDocument.uri}`);
  
  const document = documents.get(params.textDocument.uri);
  if (!document) {
    debugLog("找不到对应的文档");
    return [];
  }

  const actions: CodeAction[] = [];
  
  // 遍历范围内的诊断
  for (const diagnostic of params.context.diagnostics) {
    if (diagnostic.source !== "angular-control-flow") {
      continue;
    }

    const data = diagnostic.data as any;
    if (!data) {
      continue;
    }

    switch (diagnostic.code) {
      case "MIGRATE_NGIF":
        actions.push(createNgIfCodeAction(document, diagnostic, data));
        break;
      
      case "MIGRATE_NGFOR":
        actions.push(createNgForCodeAction(document, diagnostic, data));
        break;
        
      case "MIGRATE_NGSWITCH":
        actions.push(createNgSwitchCodeAction(document, diagnostic, data));
        break;
    }
  }

  // 添加批量替换所有的 Code Action
  if (actions.length > 0) {
    actions.push(createBatchReplaceAction(document));
  }

  debugLog(`返回 ${actions.length} 个 Code Actions`);
  return actions;
});

// 创建 *ngIf 的 Code Action
function createNgIfCodeAction(document: TextDocument, diagnostic: Diagnostic, data: any): CodeAction {
  const content = document.getText();
  const elementRange = data.elementRange;
  
  // 获取元素的完整内容
  const elementText = document.getText(elementRange);
  
  // 解析元素结构
  const tagMatch = elementText.match(/<(\w+)([^>]*?)(\*ngIf="[^"]+")([^>]*?)>(.*?)<\/\1>/s);
  if (!tagMatch) {
    // 处理自闭合标签或简单情况
    const simpleMatch = elementText.match(/<(\w+)([^>]*?)(\*ngIf="[^"]+")([^>]*?)\/?>/);
    if (simpleMatch) {
      const [, tagName, beforeAttr, ngIfAttr, afterAttr] = simpleMatch;
      const condition = ngIfAttr.match(/\*ngIf="([^"]+)"/)?.[1] || data.condition;
      const cleanAttrs = (beforeAttr + afterAttr).trim();
      const newElement = cleanAttrs ? `<${tagName} ${cleanAttrs} />` : `<${tagName} />`;
      const replacement = `@if (${condition}) {\n  ${newElement}\n}`;
      
      return {
        title: `🔄 替换为 @if (${condition})`,
        kind: CodeActionKind.QuickFix,
        diagnostics: [diagnostic],
        edit: {
          changes: {
            [document.uri]: [{
              range: elementRange,
              newText: replacement
            }]
          }
        }
      };
    }
  } else {
    const [, tagName, beforeAttr, ngIfAttr, afterAttr, innerContent] = tagMatch;
    const condition = data.condition;
    const cleanAttrs = (beforeAttr + afterAttr).trim();
    const newElement = cleanAttrs 
      ? `<${tagName} ${cleanAttrs}>${innerContent}</${tagName}>`
      : `<${tagName}>${innerContent}</${tagName}>`;
    
    const replacement = `@if (${condition}) {\n  ${newElement}\n}`;
    
    return {
      title: `🔄 替换为 @if (${condition})`,
      kind: CodeActionKind.QuickFix,
      diagnostics: [diagnostic],
      edit: {
        changes: {
          [document.uri]: [{
            range: elementRange,
            newText: replacement
          }]
        }
      }
    };
  }

  // 默认回退
  return {
    title: `🔄 替换为新的 @if 控制流`,
    kind: CodeActionKind.QuickFix,
    diagnostics: [diagnostic],
    edit: {
      changes: {
        [document.uri]: [{
          range: diagnostic.range,
          newText: `@if (${data.condition})`
        }]
      }
    }
  };
}

// 创建 *ngFor 的 Code Action
function createNgForCodeAction(document: TextDocument, diagnostic: Diagnostic, data: any): CodeAction {
  const content = document.getText();
  const elementRange = data.elementRange;
  const elementText = document.getText(elementRange);
  
  // 解析 *ngFor 表达式
  const forExpression = data.originalExpression;
  let transformedFor = data.transformedExpression;
  
  // 更智能的 ngFor 转换
  const letMatch = forExpression.match(/let\s+(\w+)\s+of\s+(.+?)(?:;\s*let\s+(\w+)\s*=\s*index)?(?:;\s*trackBy:\s*(\w+))?/);
  if (letMatch) {
    const [, itemVar, collection, indexVar, trackBy] = letMatch;
    const trackExpression = trackBy || '$index';
    
    if (indexVar) {
      transformedFor = `${itemVar} of ${collection}; let ${indexVar} = $index; track ${trackExpression}`;
    } else {
      transformedFor = `${itemVar} of ${collection}; track ${trackExpression}`;
    }
  }
  
  // 解析元素结构
  const tagMatch = elementText.match(/<(\w+)([^>]*?)(\*ngFor="[^"]+")([^>]*?)>(.*?)<\/\1>/s);
  if (tagMatch) {
    const [, tagName, beforeAttr, ngForAttr, afterAttr, innerContent] = tagMatch;
    const cleanAttrs = (beforeAttr + afterAttr).trim();
    const newElement = cleanAttrs 
      ? `<${tagName} ${cleanAttrs}>${innerContent}</${tagName}>`
      : `<${tagName}>${innerContent}</${tagName}>`;
    
    const replacement = `@for (${transformedFor}) {\n  ${newElement}\n}`;
    
    return {
      title: `🔄 替换为 @for (${transformedFor.split(';')[0]})`,
      kind: CodeActionKind.QuickFix,
      diagnostics: [diagnostic],
      edit: {
        changes: {
          [document.uri]: [{
            range: elementRange,
            newText: replacement
          }]
        }
      }
    };
  }

  // 处理自闭合标签
  const simpleMatch = elementText.match(/<(\w+)([^>]*?)(\*ngFor="[^"]+")([^>]*?)\/?>/);
  if (simpleMatch) {
    const [, tagName, beforeAttr, ngForAttr, afterAttr] = simpleMatch;
    const cleanAttrs = (beforeAttr + afterAttr).trim();
    const newElement = cleanAttrs ? `<${tagName} ${cleanAttrs} />` : `<${tagName} />`;
    const replacement = `@for (${transformedFor}) {\n  ${newElement}\n}`;
    
    return {
      title: `🔄 替换为 @for (${transformedFor.split(';')[0]})`,
      kind: CodeActionKind.QuickFix,
      diagnostics: [diagnostic],
      edit: {
        changes: {
          [document.uri]: [{
            range: elementRange,
            newText: replacement
          }]
        }
      }
    };
  }

  // 默认回退
  return {
    title: `🔄 替换为新的 @for 控制流`,
    kind: CodeActionKind.QuickFix,
    diagnostics: [diagnostic],
    edit: {
      changes: {
        [document.uri]: [{
          range: diagnostic.range,
          newText: `@for (${transformedFor})`
        }]
      }
    }
  };
}

// 创建 *ngSwitch 的 Code Action
function createNgSwitchCodeAction(document: TextDocument, diagnostic: Diagnostic, data: any): CodeAction {
  const replacement = data.replacementText || `@switch (${data.switchExpression}) {\n  // TODO: 添加 @case 和 @default 块\n}`;
  
  return {
    title: `🔄 替换为 @switch (${data.switchExpression})`,
    kind: CodeActionKind.QuickFix,
    diagnostics: [diagnostic],
    edit: {
      changes: {
        [document.uri]: [{
          range: data.elementRange,
          newText: replacement
        }]
      }
    }
  };
}

// 创建批量替换所有的 Code Action
function createBatchReplaceAction(document: TextDocument): CodeAction {
  const content = document.getText();
  const edits: TextEdit[] = [];
  
  // 收集所有需要替换的内容
  const allMatches: Array<{range: Range, replacement: string}> = [];
  
  // 处理 *ngIf
  const ngIfRegex = /\*ngIf\s*=\s*"([^"]+)"/g;
  let match;
  
  while ((match = ngIfRegex.exec(content)) !== null) {
    const range = getElementRange(content, match);
    const condition = match[1];
    const elementText = document.getText(range);
    
    // 生成替换文本
    const tagMatch = elementText.match(/<(\w+)([^>]*?)(\*ngIf="[^"]+")([^>]*?)>(.*?)<\/\1>/s);
    if (tagMatch) {
      const [, tagName, beforeAttr, , afterAttr, innerContent] = tagMatch;
      const cleanAttrs = (beforeAttr + afterAttr).trim();
      const newElement = cleanAttrs 
        ? `<${tagName} ${cleanAttrs}>${innerContent}</${tagName}>`
        : `<${tagName}>${innerContent}</${tagName}>`;
      
      const replacement = `@if (${condition}) {\n  ${newElement}\n}`;
      allMatches.push({ range, replacement });
    }
  }
  
  // 处理 *ngFor
  const ngForRegex = /\*ngFor\s*=\s*"([^"]+)"/g;
  
  while ((match = ngForRegex.exec(content)) !== null) {
    const range = getElementRange(content, match);
    const forExpression = match[1];
    const elementText = document.getText(range);
    
    // 转换表达式
    let transformedFor = forExpression;
    const letMatch = forExpression.match(/let\s+(\w+)\s+of\s+(.+?)(?:;\s*let\s+(\w+)\s*=\s*index)?(?:;\s*trackBy:\s*(\w+))?/);
    
    if (letMatch) {
      const [, itemVar, collection, indexVar, trackBy] = letMatch;
      const trackExpression = trackBy || '$index';
      
      if (indexVar) {
        transformedFor = `${itemVar} of ${collection}; let ${indexVar} = $index; track ${trackExpression}`;
      } else {
        transformedFor = `${itemVar} of ${collection}; track ${trackExpression}`;
      }
    }
    
    // 生成替换文本
    const tagMatch = elementText.match(/<(\w+)([^>]*?)(\*ngFor="[^"]+")([^>]*?)>(.*?)<\/\1>/s);
    if (tagMatch) {
      const [, tagName, beforeAttr, , afterAttr, innerContent] = tagMatch;
      const cleanAttrs = (beforeAttr + afterAttr).trim();
      const newElement = cleanAttrs 
        ? `<${tagName} ${cleanAttrs}>${innerContent}</${tagName}>`
        : `<${tagName}>${innerContent}</${tagName}>`;
      
      const replacement = `@for (${transformedFor}) {\n  ${newElement}\n}`;
      allMatches.push({ range, replacement });
    }
  }
  
  // 按位置排序（从后往前替换，避免位置偏移）
  allMatches.sort((a, b) => {
    if (a.range.start.line !== b.range.start.line) {
      return b.range.start.line - a.range.start.line;
    }
    return b.range.start.character - a.range.start.character;
  });
  
  return {
    title: `🚀 批量替换所有旧控制流 (${allMatches.length} 处)`,
    kind: CodeActionKind.Refactor,
    edit: {
      changes: {
        [document.uri]: allMatches.map(item => ({
          range: item.range,
          newText: item.replacement
        }))
      }
    }
  };
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

// 监听文档变化
documents.listen(connection);

// 启动连接监听
connection.listen();

// 最后的日志
debugLog("服务器监听已启动");
connection.console.log("🚀 Angular ControlFlow LSP Server 已准备就绪！");