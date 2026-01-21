# 使用打包工具处理 `import defer`

## 🎉 好消息！主流工具已支持

根据 [TC39 实现追踪](https://github.com/tc39/proposal-defer-import-eval/issues/73)：

- ✅ **Babel 7.23+** - `@babel/plugin-proposal-import-defer`
- ✅ **Webpack 5.100+** - `experiments.deferImport: true`
- ✅ **Rspack 1.6.0+** - 实验性支持
- ✅ **esbuild 0.25.7+** - 仅语法解析
- ✅ **TypeScript 5.9+** - 仅语法支持

## 安装依赖

```bash
npm install
```

这会安装：
- `webpack 5.100+` - 原生支持 import defer
- `babel-loader` 和 `@babel/plugin-proposal-import-defer` - Babel 转换
- `vite` 和 `@rollup/plugin-babel` - Vite + Babel 支持

## 方案 1: 使用 Webpack 5.100+（原生支持，推荐）

Webpack 5.100+ 版本开始原生支持 `import defer`！

### 配置说明

查看 [webpack.config.js](webpack.config.js)：

```javascript
export default {
  experiments: {
    // ✅ 启用原生 import defer 支持
    deferImport: true
  }
};
```

### 运行 Demo

```bash
# 使用 Webpack 原生支持构建并运行
npm run demo2:webpack
npm run demo3:webpack
```
+ Babel 构建并运行
npm run demo2:vite
npm run demo3:vite
```

### 工作原理

1. Babel 在构建时转换 `import defer` 语法
2. 转换为动态加载模式（CommonJS 风格）
3. 输出到 `dist-vite/` 目录

⚠️ **注意**：Babel 的转换目前仅支持 CommonJS 输出格式
查看 [webpack.config.js](webpack.config.js)：

```javascript
class ImportDeferPlugin {
  apply(compiler) {
    // 在编译时转换 import defer 语法
  }
}
```

### 运行 Demo

```bash
# 使用 Webpack 构建并运行 demo2
npm run demo2:webpack

# 使用 Webpack 构建并运行 demo3  
npm run demo3:webpack
```

### 工作原理

1. 先用 TypeScript 编译到 `dist/`
2. Webpack 插件处理编译后的 JS 文件
3. 转换 `import defer` 为动态加载
4. 打包到 `dist-webpack/` 目录

## 对比

| 特性 | Vite | Webpack |
|------|------|---------|
| 构建速度 | ⚡ 非常快 | 🐌 较慢 |
| 配置复杂度 | 简单 | 较复杂 |
| 插件编写 | 简单 | 复杂 |
| 转换准确性 | ⭐⭐⭐ | ⭐⭐⭐ |
| 推荐度 | ✅ 推荐 | ⚠️ 可用 |

## 方案 3: 自定义转换脚本

最简单的方案，无需打包工具：

```bash
# 使用自定义脚本转换
npm run demo2:transformed
npm run demo3:transformed
```

查看 [transform-defer.js](transform-defer.js) 了解实现。

## 转换策略对比

### 1. Webpack 原生转换（最佳）
```javascript
// Webpack 5.100+ 原生理解 import defer
// 无需转换，直接按规范实现延迟加载
import defer * as heavy from "./heavy-module.js";
console.log(heavy.config); // 此时才执行模块
```

**优点**: 
- ✅ 完全符合 TC39 规范
- ✅ 原生支持，无需额外转换
- ✅ 性能最优

**缺点**: 
- ⚠️ 需要 Webpack 5.100+

### 2. Babel 转换
```javascript
// 输入
import defer * as heavy from "./heavy-module.js";

// Babel 输出（CommonJS）
const heavy = /* Babel 特殊处理 */;
```

**优点**: 
- ✅ 成熟稳定
- ✅ 广泛支持

**缺点**: 
- ⚠️ 仅支持 CommonJS 输出
- ⚠️ 不支持 ES modules

### 3. 自定义转换
```javascript
// 手动转换为动态导入
async function _load_heavy() {
  if (!_heavy_cached) {
    _heavy_cached = await import('./heavy-module.js');
  }
  return _heavy_cached;
}
```

✅ **可以使用** - 通过 Webpack 5.100+ 打包后部署
- 使用 `experiments.deferImport: true`
- 打包后的代码可在任何环境运行
- 获得性能优化的好处

### 用于学习/演示
✅ **推荐 Webpack 原生支持** - 符合规范、性能最佳

### 用于博客文章
✅ **完整展示方案**：
1. 展示 `import defer` 语法（Demo 2/3）
2. 说明 Webpack/Babel 支持情况
3. 对比动态 `import()` 替代方案（Demo 4）
4. 提供可运行的 Webpack 打包示例
✅ **推荐 Vite 方案** - 快速、简单、足够准确

### 用于博客文章
✅ **展示语法** + **Demo 4 动态 import**  
- Demo 2/3 展示 `import defer` 语法
- Demo 4 展示实际可用的替代方案

## 故障排除

### Vite 构建失败
```bash
# 确保安装了依赖
npm install vite

# 检查 TypeScript 编译
npm run build
```

### Webpack 构建失败
```bash
# 确保安装了依赖
npm install webpack webpack-cli

# 先编译 TypeScript
npm run build
```

### 运行时错误
如果看到 "import defer" 相关错误，说明：
1. 打包工具没有正确转换
2. 直接运行了未转换的代码
3. 需要检查插件配置

## 总结

对于 **`import defer` 演示项目**，推荐策略：

1. ✅ **保留原始语法**用于展示和教学
2. ✅ 使用 **Vite** 进行快速转换和测试
3. ✅ 提供 **Demo 4（动态 import）** 作为生产可用方案
4. 📝 在文档中说明这是提案特性，需要转换工具

这样既能展示新特性，又能提供可运行的示例！
