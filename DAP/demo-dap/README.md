# demo-dap

本项目为 VS Code Debug Adapter Protocol (DAP) 教学 Demo，演示如何用 Node.js 实现一个最简单的 Fake Debug Adapter，并集成到 VSCode 插件中。

## 目录结构

```
demo-dap/
 ├─ package.json           # 项目依赖与脚本
 ├─ extension.ts           # VSCode 插件入口，注册 Debug Adapter
 ├─ adapter/
 │   └─ debugAdapter.ts    # Fake Debug Adapter 实现
 ├─ src/
 │   └─ simpleRuntime.ts   # 可选，模拟运行时逻辑
 └─ .vscode/
     └─ launch.json        # VSCode 调试配置
```

## 快速开始

1. 安装依赖
   ```bash
   npm install
   ```
2. 编译 TypeScript（如有）
   ```bash
   npm run compile
   ```
3. 按 F5 启动 Extension Host
4. 选择 Fake Debug 配置，点击运行
5. 体验断点、堆栈、继续等调试功能

## 主要依赖
- vscode-debugadapter
- vscode-debugprotocol
- typescript（开发依赖）

## 说明
- adapter/debugAdapter.ts 为核心调试协议适配层，支持 launch、setBreakpoints、stackTrace、continue。
- extension.ts 注册并启动 Debug Adapter。
- .vscode/launch.json 提供 VSCode 调试配置。

如需深入了解 DAP 原理与实现，请参考本仓库根目录下的技术博客文档。
