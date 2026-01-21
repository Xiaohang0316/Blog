import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * 自定义 Webpack 插件：转换 import defer 语法
 */
class ImportDeferPlugin {
  apply(compiler) {
    compiler.hooks.compilation.tap('ImportDeferPlugin', (compilation) => {
      compilation.hooks.optimizeModules.tap('ImportDeferPlugin', (modules) => {
        for (const module of modules) {
          if (module.resource && module.resource.endsWith('.js')) {
            // 处理模块源码，转换 import defer
            this.transformModule(module);
          }
        }
      });
    });
  }

  transformModule(module) {
    if (!module._source) return;
    
    const source = module._source._value || module._source._valueAsString;
    if (!source) return;
    
    // 匹配 import defer * as name from "path"
    const deferRegex = /import\s+defer\s+\*\s+as\s+(\w+)\s+from\s+["']([^"']+)["'];?/g;
    
    let transformed = source;
    let match;
    const deferImports = [];
    
    while ((match = deferRegex.exec(source)) !== null) {
      deferImports.push({
        name: match[1],
        path: match[2],
        fullMatch: match[0]
      });
    }
    
    if (deferImports.length === 0) return;
    
    // 转换为动态导入
    deferImports.forEach(imp => {
      const replacement = `
let _${imp.name}_cache = null;
const _${imp.name}_promise = new Proxy({}, {
  get(target, prop) {
    if (!_${imp.name}_cache) {
      _${imp.name}_cache = import('${imp.path}');
    }
    return async (...args) => {
      const mod = await _${imp.name}_cache;
      return typeof mod[prop] === 'function' ? mod[prop](...args) : mod[prop];
    };
  }
});
const ${imp.name} = new Proxy({}, {
  get(target, prop) {
    return async (...args) => {
      if (!_${imp.name}_cache) {
        _${imp.name}_cache = import('${imp.path}');
      }
      const mod = await _${imp.name}_cache;
      return typeof mod[prop] === 'function' ? mod[prop](...args) : mod[prop];
    };
  }
});`;
      
      transformed = transformed.replace(imp.fullMatch, replacement);
    });
    
    module._source._value = transformed;
  }
}

export default {
  mode: 'development',
  entry: {
    demo2: './dist/demo2-with-defer.js',
    demo3: './dist/demo3-conditional-loading.js'
  },
  output: {
    path: path.resolve(__dirname, 'dist-webpack'),
    filename: '[name].bundle.js',
    module: true,
  },
  experiments: {
    outputModule: true,
  },
  plugins: [
    new ImportDeferPlugin()
  ],
  target: 'node',
  optimization: {
    minimize: false
  }
};
