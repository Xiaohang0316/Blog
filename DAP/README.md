你是一名资深 VSCode Extension 开发专家，同时也是技术博客作者。

请帮我写一篇完整的技术博客，主题是：

《VS Code Debug Adapter Protocol (DAP) 深度解析与实战》

要求输出为 Markdown 文档。

文章目标读者：
具有 Node.js / VSCode Extension 开发经验的工程师。

文章需要包含：
- 原理解析
- 架构设计
- VSCode 与 Debug Adapter 通讯流程
- 实际 Demo
- 可运行代码
- 项目结构
- 关键代码解释

文章结构要求如下：

# 1. 什么是 Debug Adapter Protocol
- VSCode 为什么要设计 DAP
- DAP 解决什么问题
- DAP 的核心思想
- VSCode Debug Architecture

# 2. VSCode Debug 架构解析
解释以下组件：

VSCode
Debug Client
Debug Adapter
Debugger

并画出架构流程图（使用 mermaid）

说明通信流程：
VSCode → Debug Adapter → Debugger

# 3. DAP 协议基础

解释 DAP 的消息结构：

Request
Response
Event

并展示 JSON 示例，例如：

initialize
launch
setBreakpoints
stackTrace

示例 JSON 必须真实。

# 4. VSCode Debug 生命周期

详细讲解 Debug 生命周期：

initialize  
launch  
setBreakpoints  
configurationDone  
threads  
stackTrace  
continue  

并解释每一步的作用。

# 5. 实战：实现一个最简单的 Debug Adapter

目标：
实现一个 Fake Debugger，用 Node.js 写一个最简单的 Debug Adapter。

功能：

支持：
- launch
- setBreakpoints
- stackTrace
- continue

使用 npm 包：

vscode-debugadapter
vscode-debugprotocol

给出完整代码。

# 6. Demo 项目结构

展示完整项目结构，例如：

demo-dap
 ├─ package.json
 ├─ extension.ts
 ├─ adapter
 │   └─ debugAdapter.ts
 ├─ src
 │   └─ simpleRuntime.ts
 └─ .vscode
     └─ launch.json

并解释每个文件作用。

# 7. Debug Adapter 核心代码实现

逐步讲解：

DebugSession
setBreakPointsRequest
stackTraceRequest
continueRequest

给出完整代码。

# 8. VSCode Extension 如何启动 Debug Adapter

展示 extension.ts 示例代码：

registerDebugAdapterDescriptorFactory

说明 VSCode 如何启动 Adapter。

# 9. launch.json 示例

提供完整 launch.json 示例。

# 10. 运行 Demo

给出完整运行步骤：

npm install  
npm run compile  
F5 启动 Extension Host  
运行 Debug

并展示 Debug 运行效果。

# 11. 进阶能力

介绍：

变量查看
多线程
条件断点
Step Into / Step Over

# 12. 常见 Debug Adapter

介绍：

Node Debug
Python Debug
Go Debug
Java Debug

# 13. 总结

总结 DAP 的价值：
- 解耦 VSCode 和 Debugger
- 支持多语言
- 标准协议

要求：

1 输出 Markdown
2 代码必须完整
3 代码必须可运行
4 每个章节必须有代码示例
5 使用 mermaid 画流程图
6 文章长度不少于 4000 字
7 适合发布到技术博客平台

最后增加：

参考资料：
- https://microsoft.github.io/debug-adapter-protocol/
- VSCode 官方文档