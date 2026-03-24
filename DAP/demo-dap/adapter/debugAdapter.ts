
import {
  DebugSession,
  InitializedEvent,
  StoppedEvent,
  Thread,
  StackFrame,
  Source,
  LoggingDebugSession
} from 'vscode-debugadapter';
import { DebugProtocol } from 'vscode-debugprotocol';
import * as path from 'path';
import * as fs from 'fs';

console.error('========================================');
console.error('🚀 debugAdapter.js FILE LOADED!');
console.error('========================================');

// 写入文件确认调试适配器已加载
fs.writeFileSync('./fake-debug-loaded.txt', `Loaded at ${new Date().toISOString()}\n`, { flag: 'a' });

class FakeDebugSession extends DebugSession {
  private _breakPoints: Array<{ line: number }> = [];
  private _programPath: string = '';

  public constructor() {
    super();
    console.error('========================================');
    console.error('🎯 FakeDebugSession CONSTRUCTOR called!');
    console.error('========================================');
    
    // 写入文件确认构造函数被调用
    fs.writeFileSync('./fake-debug-loaded.txt', `Constructor called at ${new Date().toISOString()}\n`, { flag: 'a' });
  }


  protected initializeRequest(
    
    response: DebugProtocol.InitializeResponse,
    args: DebugProtocol.InitializeRequestArguments
  ): void {
    console.error('========================================');
    console.error('📥 initializeRequest called');
    console.error('Args:', JSON.stringify(args, null, 2));
    console.error('========================================');
    
    // 写入文件确认 initialize 被调用
    fs.writeFileSync('./fake-debug-loaded.txt', `initializeRequest at ${new Date().toISOString()}\n`, { flag: 'a' });
    
    response.body = response.body || {};
    response.body.supportsConfigurationDoneRequest = true;
    this.sendResponse(response);
    this.sendEvent(new InitializedEvent());
  }

  
  protected launchRequest(
    response: DebugProtocol.LaunchResponse,
    args: DebugProtocol.LaunchRequestArguments
  ): void {
    console.error('========================================');
    // con写入文件确认 launch 被调用
    console.error('🚀 launchRequest called!');
    fs.writeFileSync('./fake-debug-loaded.txt', `launchRequest at ${new Date().toISOString()}\nArgs: ${JSON.stringify(args)}\n`, { flag: 'a' });
    
    // sole.error('🚀 launchRequest called');
    console.error('Args:', JSON.stringify(args, null, 2));
    console.error('========================================');
    
    // 保存程序路径，使用绝对路径
    this._programPath = path.resolve((args as any).program || 'unknown.js');
    console.error('Program path:', this._programPath);
    // 取断点行号，默认4
    const entryLine = 1;
    this.sendResponse(response);
    // 启动后立即停在 entryLine 行
    this.sendEvent(new StoppedEvent('entry', entryLine));
  }

  protected configurationDoneRequest(
    response: DebugProtocol.ConfigurationDoneResponse,
    args: DebugProtocol.ConfigurationDoneArguments
  ): void {
    console.error('📝 configurationDoneRequest called');
    super.configurationDoneRequest(response, args);
  }

  protected threadsRequest(response: DebugProtocol.ThreadsResponse): void {
    console.error('🧵 threadsRequest called');
    response.body = {
      threads: [new Thread(1, 'Main Thread')]
    };
    this.sendResponse(response);
  }


  protected setBreakPointsRequest(
    response: DebugProtocol.SetBreakpointsResponse,
    args: DebugProtocol.SetBreakpointsArguments
  ): void {
    this._breakPoints = args.breakpoints || [];
    response.body = {
      breakpoints: this._breakPoints.map((bp) => ({
        verified: true,
        line: bp.line
      }))
    };
    this.sendResponse(response);
  }


  protected stackTraceRequest(
    response: DebugProtocol.StackTraceResponse,
    args: DebugProtocol.StackTraceArguments
  ): void {
    console.error('📚 stackTraceRequest called');
    console.error('Using program path:', this._programPath);
    
    const frames: StackFrame[] = [];
    
    // 假设 entryLine 为4，和 launchRequest 保持一致
    const entryLine = 1;
    if (this._programPath && fs.existsSync(this._programPath)) {
      console.error('✅ Program file exists');
      const fileName = path.basename(this._programPath);
      frames.push(
        new StackFrame(1, 'main', new Source(fileName, this._programPath), entryLine, 1)
      );
    } else {
      console.error('⚠️  Program file not found, using placeholder');
      frames.push(new StackFrame(1, 'main', undefined, entryLine, 0));
    }
    
    response.body = {
      stackFrames: frames,
      totalFrames: frames.length
    };
    this.sendResponse(response);
  }

  protected scopesRequest(
    response: DebugProtocol.ScopesResponse,
    args: DebugProtocol.ScopesArguments
  ): void {
    console.error('🔍 scopesRequest called');
    response.body = {
      scopes: []
    };
    this.sendResponse(response);
  }

  protected variablesRequest(
    response: DebugProtocol.VariablesResponse,
    args: DebugProtocol.VariablesArguments
  ): void {
    console.error('📊 variablesRequest called');
    response.body = {
      variables: []
    };
    this.sendResponse(response);
  }


  protected continueRequest(
    response: DebugProtocol.ContinueResponse,
    args: DebugProtocol.ContinueArguments
  ): void {
    console.error('▶️  continueRequest called');
    // 执行 js 文件并通过 OutputEvent 输出到调试控制台
    let result = '';
    const OutputEvent = require('vscode-debugadapter').OutputEvent;
    try {
      if (this._programPath && fs.existsSync(this._programPath)) {
        const code = fs.readFileSync(this._programPath, 'utf-8');
        // 自定义 console，将 log 输出到调试控制台
        const that = this;
        const customConsole = {
          log: function(...args: any[]) {
            that.sendEvent(new OutputEvent('[log] ' + args.map(String).join(' ') + '\n', 'stdout'));
          },
          error: function(...args: any[]) {
            that.sendEvent(new OutputEvent('[error] ' + args.map(String).join(' ') + '\n', 'stdout'));
          },
          warn: function(...args: any[]) {
            that.sendEvent(new OutputEvent('[warn] ' + args.map(String).join(' ') + '\n', 'stdout'));
          },
          info: function(...args: any[]) {
            that.sendEvent(new OutputEvent('[info] ' + args.map(String).join(' ') + '\n', 'stdout'));
          }
        };
        // 用 new Function 执行，传入自定义 console
        const fn = new Function('console', code + '\n;return typeof result !== "undefined" ? result : undefined;');
        result = fn(customConsole);
      } else {
        result = '[No program file]';
      }
    } catch (e) {
      result = '[Error executing js]: ' + e;
    }
    // 输出最终结果
    const outputMsg = [
      '================= FAKE DEBUG OUTPUT (stdout) =================',
      `Debug session ended at ${new Date().toISOString()}`,
      `Result: ${result}`,
      '============================================================='
    ].join('\n');
    this.sendEvent(new OutputEvent(outputMsg + '\n', 'stdout'));
    this.sendResponse(response);
    // 直接结束调试
    this.sendEvent(new StoppedEvent('end', 1));
  }

  protected disconnectRequest(
    response: DebugProtocol.DisconnectResponse,
    args: DebugProtocol.DisconnectArguments
  ): void {
    console.error('👋 disconnectRequest called');
    this.sendResponse(response);
  }
}

console.error('========================================');
console.error('🏃 About to call DebugSession.run()');
console.error('========================================');

DebugSession.run(FakeDebugSession);
