# TypeScript 5.9 `import defer` 演示

这个项目演示了 TypeScript 5.9 的 `import defer` 特性。

## ⚠️ 重要说明

**`import defer` 是 ECMAScript Stage 2 提案，目前任何运行时都无法直接执行！**

- ✅ TypeScript 5.9 **支持此语法**，可以通过类型检查和编译
- ❌ Node.js / 浏览器 **都不支持运行时执行**
- 📝 这些 demo 主要用于**语法展示和概念说明**

**实际可运行的替代方案请看 Demo 4**

## 支持的环境

目前可以运行 `import defer` 的方式：

### 1. 使用打包工具（推荐）
- **Webpack 5+** with 实验性特性启用
- **Vite** with 插件支持
- **esbuild** with 相应配置

### 2. 使用支持该特性的运行时
- 等待 Node.js 未来版本支持此提案

## 配置要求

在 `tsconfig.json` 中，`module` 必须设置为 `preserve` 或 `esnext`：

```json
{
  "compilerOptions": {
    "module": "preserve"  // 或 "esnext"
  }
}
```

## Demo 说明

### Demo 1: 不使用 import defer
```bash
npm run demo1
```
展示普通 `import` 立即执行模块的行为。

### Demo 2: 使用 import defer（语法展示）
```bash
# ⚠️ 无法运行！仅用于查看源码和编译输出
npm run build  # 查看 dist/demo2-with-defer.js
```
**用途**：展示 `import defer` 语法如何被 TypeScript 保留到输出文件中。

**期望行为**：模块在第一次访问时才执行，而非导入时立即执行。

### Demo 3: 条件加载（语法展示）
```bash
# ⚠️ 无法运行！仅用于查看源码
npm run build  # 查看 dist/demo3-conditional-loading.js  
```
**用途**：展示如何用 `import defer` 实现条件加载，未使用的模块永不执行。

### Demo 4: 动态导入（✅ 可运行）
```bash
npm使用建议

### 写博客/文章时
1. 展示 Demo 2、3 的**源代码**，说明语法
2. 运行 **Demo 4** 展示实际效果
3. 说明两者的区别和联系

### 实际项目中
- 目前使用 **动态 `import()`**（Demo 4 的方式）
- 等待未来 `import defer` 成为标准后，可以用更简洁的语法替换

## 为什么 Demo 2/3 编译成功但无法运行？

TypeScript 的 `module: "preserve"` 模式会：
- ✅ 保留 `import defer` 语法到输出文件
- ✅ 提供类型检查和语法验证
- ❌ **不做任何转换**（不会转成动态 import）

这是设计如此，因为 TypeScript 假设你会使用支持此特性的打包工具或未来的运行时
3. 配置 Vite 支持 `import defer`
4. 在浏览器中运行

或者使用 demo4 查看使用动态 `import()` 的实现方式。

## 参考资料

- [TypeScript 5.9 发布说明](https://www.typescriptlang.org/docs/handbook/release-notes/typescript-5-9.html#support-for-import-defer)
- [ECMAScript 延迟模块评估提案](https://github.com/tc39/proposal-defer-import-eval/)
