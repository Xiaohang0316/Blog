import { log } from "console";
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
  console.log('Angular ControlFlow LSP Activated!');
  vscode.window.showInformationMessage("Angular ControlFlow LSP Activated!");

  // 确保服务器路径正确
  const serverModule = context.asAbsolutePath(
    path.join("out", "server", "server.js")
  );

  // 检查服务器文件是否存在
  const fs = require('fs');
  if (!fs.existsSync(serverModule)) {
    const errorMsg = `服务器文件不存在: ${serverModule}`;
    console.error(errorMsg);
    vscode.window.showErrorMessage(errorMsg);
    return;
  }

  console.log(`✅ 服务器文件存在: ${serverModule}`);

  // 调试端口 - 使用不同的端口避免冲突
  const debugPort = 6009;

  const serverOptions: ServerOptions = {
    run: { 
      module: serverModule, 
      transport: TransportKind.ipc,
    },
    debug: {
      module: serverModule,
      transport: TransportKind.ipc,
      options: { 
        execArgv: [
          "--nolazy", 
          `--inspect=${debugPort}`,
          "--enable-source-maps"
        ],
      },
    },
  };

  const clientOptions: LanguageClientOptions = {
    documentSelector: [
      { scheme: 'file', language: 'html' },
      { scheme: 'file', language: 'angular' },
      { scheme: 'file', language: 'typescript' },
      { scheme: 'file', language: 'javascript' }
    ],
    synchronize: {
      fileEvents: vscode.workspace.createFileSystemWatcher("**/*.{html,ts,js}"),
    },
  };

  client = new LanguageClient(
    "angularControlFlowLsp",
    "Angular ControlFlow LSP",
    serverOptions,
    clientOptions
  );

  // 启动客户端
  client.start().then(() => {
    console.log("✅ Client started successfully");
    vscode.window.showInformationMessage("Angular ControlFlow LSP 服务器已启动");
    
    // 等待一下再显示调试信息
    setTimeout(() => {
      // console.log(`🔧 服务器调试端口: ${debugPort}`);
      // console.log("💡 要调试服务器，请：");
      // console.log("1. 打开调试面板 (Ctrl+Shift+D)");
      // console.log("2. 选择 'Attach to Server' 配置");
      // console.log("3. 点击开始调试按钮");
    }, 2000);
    
  }).catch(err => {
    console.error("❌ Client failed to start", err);
    vscode.window.showErrorMessage(`LSP 启动失败: ${err.message}`);
  });

  // 监听文档变化事件

  let isApplyingEdit = false; // 防止递归触发
  const textDocumentChangeListener = vscode.workspace.onDidChangeTextDocument((event) => {
    if (isApplyingEdit) return; // 如果正在应用编辑，跳过处理
    
    const document = event.document;
    const editor = vscode.window.activeTextEditor;
    if (!editor) return;

    const position = event.contentChanges[0].range.start;
    const prefix = getPrefix(document, position);
    function getPrefix(document: vscode.TextDocument, position: vscode.Position): string {
      const line = document.lineAt(position.line).text;
      return line.slice(0, position.character);
    }
    function shouldTrigger(prefix: string): boolean {
      // 判断是否需要触发 AI 补全，比如输入 "."、"("、回车等
      return /\.$|\($|\s$/.test(prefix);
    }


    // 当输入触发条件满足时（比如输入 . 或回车）
    if (shouldTrigger(prefix)) {
      isApplyingEdit = true;
      triggerCompletion(prefix, position, editor);
    }

    async function triggerCompletion(prefix: string, position: vscode.Position, editor: vscode.TextEditor) {
      const document = editor.document;
      const fileContent = document.getText();

      // 1. 构造请求体（上下文 + 光标位置）
      const payload = {
        language: document.languageId,
        prefix,
        fileContent,
        cursorPosition: document.offsetAt(position),
      };

      console.log("🚀 触发补全请求:", payload);
      console.log("调用 API 返回代码补全功能尚未实现，以下为伪代码示例。");

      // 2. 调用后端 AI 服务（类似 Copilot 的代理）
      // const response = await fetch('http://localhost:3000/api/completion', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify(payload),
      // });

      // const data = await response.json();
      // const suggestion = data.completion; // 模型返回的文本
      const suggestion = "async function fetchData(url) {\n  const response = await axios.get(url);\n  return response.data;\n}" // 模型返回的文本

      // 3. 插入补全预览（ghost text）
      try {
        const edit = new vscode.WorkspaceEdit();
        const nextLinePos = position.translate(1, 0);
        edit.insert(document.uri, nextLinePos, '\n' + suggestion + '\n');
        await vscode.workspace.applyEdit(edit);
      } finally {
        isApplyingEdit = false;
      }
    }
  });

  // 添加到订阅列表
  context.subscriptions.push(client, textDocumentChangeListener);

  // 注册调试命令
  const debugServerCommand = vscode.commands.registerCommand('angularControlFlowLsp.debugServer', () => {
    vscode.window.showInformationMessage(
      `服务器调试信息:\n端口: ${debugPort}\n状态: ${client.state}`
    );
  });

  // 注册重启命令
  const restartCommand = vscode.commands.registerCommand('angularControlFlowLsp.restart', async () => {
    try {
      console.log("🔄 重启 LSP 服务器...");
      await client.restart();
      vscode.window.showInformationMessage('Angular ControlFlow LSP 已重启');
      
      // 重启后再次显示调试信息
      setTimeout(() => {
        console.log(`🔧 服务器调试端口: ${debugPort}`);
      }, 1000);
      
    } catch (error) {
      console.error("❌ 重启失败:", error);
      vscode.window.showErrorMessage(`重启失败: ${error}`);
    }
  });
  
  context.subscriptions.push(debugServerCommand, restartCommand);
}

export function deactivate(): Thenable<void> | undefined {
  if (!client) {
    return undefined;
  }
  console.log('🛑 Deactivating Angular ControlFlow LSP');
  return client.stop();
}