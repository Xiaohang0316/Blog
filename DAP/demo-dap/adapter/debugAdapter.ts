
import {
  DebugSession,
  InitializedEvent,
  StoppedEvent,
  Thread,
  StackFrame,
  Source
} from 'vscode-debugadapter';
import { DebugProtocol } from 'vscode-debugprotocol';


class FakeDebugSession extends DebugSession {
  private _breakPoints: Array<{ line: number }> = [];

  public constructor() {
    super();
  }


  protected initializeRequest(
    response: DebugProtocol.InitializeResponse,
    args: DebugProtocol.InitializeRequestArguments
  ): void {
    response.body = response.body || {};
    response.body.supportsConfigurationDoneRequest = true;
    this.sendResponse(response);
    this.sendEvent(new InitializedEvent());
  }


  protected launchRequest(
    response: DebugProtocol.LaunchResponse,
    args: DebugProtocol.LaunchRequestArguments
  ): void {
    this.sendResponse(response);
    // 启动后立即停在第一行
    this.sendEvent(new StoppedEvent('entry', 1));
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
    const frames = [
      new StackFrame(1, 'main', new Source('fake.js', 'fake.js'), 1, 1)
    ];
    response.body = {
      stackFrames: frames,
      totalFrames: frames.length
    };
    this.sendResponse(response);
  }


  protected continueRequest(
    response: DebugProtocol.ContinueResponse,
    args: DebugProtocol.ContinueArguments
  ): void {
    this.sendResponse(response);
    // 直接结束调试
    this.sendEvent(new StoppedEvent('end', 1));
  }
}


DebugSession.run(FakeDebugSession);
