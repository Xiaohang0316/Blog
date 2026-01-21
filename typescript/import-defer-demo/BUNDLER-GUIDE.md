# 使用打包工具处理 `import defer`

由于 `import defer` 是 Stage 2 提案，目前没有运行时原生支持。这里提供了两个打包工具的解决方案。

## 安装依赖

```bash
npm install
```

这会安装：
- `webpack` 和 `webpack-cli` - 用于 Webpack 打包
- `vite` - 用于 Vite 打包

## 方案 1: 使用 Vite（推荐）

Vite 构建更快，配置更简单。

### 配置说明

查看 [vite-simple.config.js](vite-simple.config.js)：

```javascript
function simpleDeferPlugin() {
  return {
    name: 'simple-defer-transform',
    transform(code, id) {
      // 将 import defer * as X from 'Y'
      // 转换为 const X = await import('Y')
      return transformedCode;
    }
  };
}
```

### 运行 Demo

```bash
# 使用 Vite 构建并运行 demo2
npm run demo2:vite

# 使用 Vite 构建并运行 demo3
npm run demo3:vite
```

### 工作原理

1. Vite 插件在构建时转换 `import defer` 语法
2. 转换为标准的动态 `import()` 
3. 输出到 `dist-vite/` 目录
4. 使用 Node.js 运行转换后的代码

## 方案 2: 使用 Webpack

Webpack 通过自定义插件处理。

### 配置说明

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

### 1. Vite 简单转换
```javascript
// 输入
import defer * as heavy from "./heavy-module.js";
console.log(heavy.config);

// 输出
const heavy = await import("./heavy-module.js");
console.log(heavy.config);
```

**优点**: 简单、直接  
**缺点**: 需要 async 上下文

### 2. Webpack 代理转换
```javascript
// 使用 Proxy 延迟加载
const heavy = new Proxy({}, {
  get(target, prop) {
    // 首次访问时才加载
  }
});
```

**优点**: 更接近 `import defer` 语义  
**缺点**: 实现复杂

### 3. 自定义脚本转换
```javascript
// 创建 loader 函数
async function _load_heavy() {
  if (!_heavy_cached) {
    _heavy_cached = await import('./heavy-module.js');
  }
  return _heavy_cached;
}
```

**优点**: 灵活、可控  
**缺点**: 需要手动处理所有访问

## 最佳实践建议

### 用于生产环境
❌ **不推荐** - `import defer` 仍是提案阶段，生产环境应使用动态 `import()`

### 用于学习/演示
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
