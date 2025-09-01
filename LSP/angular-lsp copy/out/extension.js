"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.activate = activate;
exports.deactivate = deactivate;
const path = __importStar(require("path"));
const vscode = __importStar(require("vscode"));
const node_1 = require("vscode-languageclient/node");
let client;
function activate(context) {
    console.log('Angular ControlFlow LSP Activated!');
    vscode.window.showInformationMessage("Angular ControlFlow LSP Activated!");
    // 确保服务器路径正确
    const serverModule = context.asAbsolutePath(path.join("out", "server", "server.js"));
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
    const serverOptions = {
        run: {
            module: serverModule,
            transport: node_1.TransportKind.ipc,
            options: {
                cwd: context.extensionPath,
                env: { ...process.env, NODE_ENV: 'production' }
            }
        },
        debug: {
            module: serverModule,
            transport: node_1.TransportKind.ipc,
            options: {
                execArgv: [
                    "--nolazy",
                    `--inspect=${debugPort}`,
                    "--enable-source-maps"
                ],
                cwd: context.extensionPath,
                env: { ...process.env, NODE_ENV: 'development' }
            },
        },
    };
    const clientOptions = {
        documentSelector: [
            { scheme: 'file', language: 'html' },
            { scheme: 'file', language: 'angular' },
            { scheme: 'file', language: 'typescript' },
            { scheme: 'file', language: 'javascript' }
        ],
        synchronize: {
            fileEvents: vscode.workspace.createFileSystemWatcher("**/*.{html,ts,js}"),
        },
        outputChannel: vscode.window.createOutputChannel('Angular ControlFlow LSP'),
        traceOutputChannel: vscode.window.createOutputChannel('Angular ControlFlow LSP Trace'),
        errorHandler: {
            error: (error, message, count) => {
                console.error('LSP Error:', error, message, count);
                return { action: 1 }; // ErrorAction.Continue
            },
            closed: () => {
                console.log('LSP Connection closed');
                return { action: 1 }; // CloseAction.DoNotRestart
            }
        }
    };
    client = new node_1.LanguageClient("angularControlFlowLsp", "Angular ControlFlow LSP", serverOptions, clientOptions);
    // 启动客户端
    client.start().then(() => {
        console.log("✅ Client started successfully");
        vscode.window.showInformationMessage("Angular ControlFlow LSP 服务器已启动");
        // 等待一下再显示调试信息
        setTimeout(() => {
            console.log(`🔧 服务器调试端口: ${debugPort}`);
            console.log("💡 要调试服务器，请：");
            console.log("1. 打开调试面板 (Ctrl+Shift+D)");
            console.log("2. 选择 'Attach to Server' 配置");
            console.log("3. 点击开始调试按钮");
        }, 2000);
    }).catch(err => {
        console.error("❌ Client failed to start", err);
        vscode.window.showErrorMessage(`LSP 启动失败: ${err.message}`);
    });
    // 添加到订阅列表
    context.subscriptions.push(client);
    // 注册调试命令
    const debugServerCommand = vscode.commands.registerCommand('angularControlFlowLsp.debugServer', () => {
        vscode.window.showInformationMessage(`服务器调试信息:\n端口: ${debugPort}\n状态: ${client.state}`);
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
        }
        catch (error) {
            console.error("❌ 重启失败:", error);
            vscode.window.showErrorMessage(`重启失败: ${error}`);
        }
    });
    context.subscriptions.push(debugServerCommand, restartCommand);
}
function deactivate() {
    if (!client) {
        return undefined;
    }
    console.log('🛑 Deactivating Angular ControlFlow LSP');
    return client.stop();
}
