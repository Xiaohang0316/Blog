# TypeScript 

## Import Defer (TypeScript 5.9)

### 🎯 什么是 Import Defer？

`import defer` 是 TypeScript 5.9 引入的新特性，它允许你导入一个模块，但不立即执行该模块的代码。模块只有在第一次访问其导出内容时才会被执行。

### 📖 语法

```typescript
// 只支持命名空间导入
import defer * as module from "./some-module.js";

// ❌ 不支持命名导入
// import defer { someFunction } from "./module.js";

// ❌ 不支持默认导入  
// import defer defaultExport from "./module.js";
```

### 💡 核心特点

1. **延迟执行**：模块代码不会在 import 时执行，而是在第一次访问模块属性时执行
2. **立即加载**：模块文件会立即加载，只是不执行
3. **性能优化**：减少启动时间，特别适合条件性使用的模块

### 🔍 Demo 说明

#### Demo 1: 不使用 defer 的情况
- 文件：`demo1-without-defer.ts`
- 演示：普通 import 会立即执行模块的所有初始化代码
- 问题：即使稍后才使用，模块也会在启动时执行，拖慢启动速度

#### Demo 2: 使用 defer 的情况  
- 文件：`demo2-with-defer.ts`
- 演示：使用 `import defer` 延迟模块执行
- 优势：应用启动更快，模块只在真正需要时才执行

#### Demo 3: 条件加载场景
- 文件：`demo3-conditional-loading.ts`
- 演示：根据特性开关条件性加载功能模块
- 场景：如果功能未启用，模块永远不会执行，节省资源

### 🚀 使用场景

1. **条件功能模块**
   - 根据用户权限、配置或环境加载不同功能
   - A/B 测试中的功能分支

2. **大型依赖库**
   - 体积大、初始化慢的第三方库
   - 仅在特定场景下使用的工具库

3. **性能优化**
   - 减少应用启动时间
   - 延迟非关键路径的代码执行

4. **平台特定功能**
   - 根据运行环境（浏览器/Node.js）加载不同实现

### ⚡ 性能对比

```
不使用 defer:
├─ import 模块 -> 立即执行所有初始化
├─ 应用启动 (慢)
└─ 使用模块功能

使用 defer:
├─ import defer 模块 -> 仅加载，不执行
├─ 应用启动 (快)
└─ 使用模块功能 -> 此时才执行初始化
```

### 📝 注意事项

1. **运行环境要求** ⚠️
   - 这是一个 **TC39 Stage 2 提案**，目前处于实验阶段
   - **Node.js 支持**：需要 Node.js v22.12.0+ 或 v23.3.0+ 并使用 `--experimental-import-defer` 标志// 添加无效
   - **浏览器支持**：目前主流浏览器暂不支持，需要使用打包工具转译
   - 只在 `--module preserve` 或 `esnext` 模式下工作
   - 或使用支持该特性的打包工具（如 Webpack、Vite 等）

2. **TypeScript 不转译**
   - TypeScript 不会将 `import defer` 转译为旧版本兼容代码
   - 这只是语法检查和类型提示，不做代码转换
   - 确保目标环境支持此特性

3. **模块加载 vs 执行**
   - 模块文件仍会被加载（从文件系统或网络）
   - 只是代码执行被延迟了

### 🔗 运行 Demo

#### 方式一：使用实验性 Node.js 支持

需要升级到 Node.js v22.12.0+ 或 v23.3.0+：

```bash
# 检查当前 Node.js 版本
node --version

# 如果版本较低，使用 nvm 升级（Windows 使用 nvm-windows）
nvm install 23
nvm use 23

cd import-defer-demo

# 安装依赖
npm install

# 编译 TypeScript
npm run build

# 使用实验性标志运行演示
# --experimental-import-defer  // 添加无效
node --experimental-import-defer dist/demo1-without-defer.js
node --experimental-import-defer dist/demo2-with-defer.js
node --experimental-import-defer dist/demo3-conditional-loading.js
```

#### 方式二：学习代码（无需运行）

如果暂时不想升级 Node.js：
1. 直接查看源代码文件，理解 `import defer` 的语法和使用方式
2. 阅读代码中的注释，了解执行流程的区别
3. 对比 demo1（无 defer）和 demo2（有 defer）的代码差异

### � 实际应用建议

目前 `import defer` 还不能直接运行，但你可以：

1. **学习概念**：理解延迟模块执行的思想
2. **准备代码**：提前在代码中使用该语法，等待运行时支持
3. **使用打包工具**：配置 Webpack/Vite 等打包工具来转译
4. **替代方案**：使用动态 `import()` 实现类似效果（虽然语义不完全相同）

**动态 import 作为临时替代：**
```typescript
// 当前可运行的替代方案
let heavy: typeof import("./heavy-module.js");

async function useHeavyModule() {
  if (!heavy) {
    heavy = await import("./heavy-module.js");
  }
  return heavy.processData("test");
}
```


`import defer` 是 ECMAScript Stage 2 提案，还不是正式标准：

⏳ Stage 2 = 提案阶段（2024-2026）
🎯 Stage 3 = 候选标准（还未到达）
✅ Stage 4 = 正式标准（预计 2027+ 才可能）
只有到 Stage 4 后，浏览器和 Node.js 才会开始实现。

### 📚 参考资源

- [TypeScript 5.9 Release Notes](https://www.typescriptlang.org/docs/handbook/release-notes/typescript-5-9.html#support-for-import-defer)
- [ECMAScript Deferred Module Evaluation Proposal (TC39 Stage 2)](https://github.com/tc39/proposal-defer-import-eval/)
- [Node.js ES Modules](https://nodejs.org/api/esm.html)
- [Webpack](https://webpack.js.org/configuration/experiments/#experimentsdeferimport)
