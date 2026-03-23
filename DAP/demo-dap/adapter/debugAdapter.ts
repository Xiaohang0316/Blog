
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
fs.writeFileSync('/tmp/fake-debug-loaded.txt', `Loaded at ${new Date().toISOString()}\n`, { flag: 'a' });

class FakeDebugSession extends DebugSession {
  private _breakPoints: Array<{ line: number }> = [];
  private _programPath: string = '';

  public constructor() {
    super();
    console.error('========================================');
    console.error('🎯 FakeDebugSession CONSTRUCTOR called!');
    console.error('========================================');
    
    // 写入文件确认构造函数被调用
    fs.writeFileSync('/tmp/fake-debug-loaded.txt', `Constructor called at ${new Date().toISOString()}\n`, { flag: 'a' });
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
    fs.writeFileSync('/tmp/fake-debug-loaded.txt', `initializeRequest at ${new Date().toISOString()}\n`, { flag: 'a' });
    
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
    fs.writeFileSync('/tmp/fake-debug-loaded.txt', `launchRequest at ${new Date().toISOString()}\nArgs: ${JSON.stringify(args)}\n`, { flag: 'a' });
    
    // sole.error('🚀 launchRequest called');
    console.error('Args:', JSON.stringify(args, null, 2));
    console.error('========================================');
    
    // 保存程序路径
    this._programPath = (args as any).program || 'unknown.js';
    console.error('Program path:', this._programPath);
    
    this.sendResponse(response);
    // 启动后立即停在第一行
    this.sendEvent(new StoppedEvent('entry', 1));
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
    
    // 如果有程序路径且文件存在，创建带源文件的栈帧
    if (this._programPath && fs.existsSync(this._programPath)) {
      console.error('✅ Program file exists');
      const fileName = path.basename(this._programPath);
      frames.push(
        new StackFrame(1, 'main', new Source(fileName, this._programPath), 1, 1)
      );
    } else {
      console.error('⚠️  Program file not found, using placeholder');
      // 不提供源文件信息，只提供函数名
      frames.push(new StackFrame(1, 'main', undefined, 0, 0));
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
