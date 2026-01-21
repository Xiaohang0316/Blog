import { defineConfig } from 'vite';
import path from 'path';

/**
 * Vite 插件：转换 import defer 语法
 */
function importDeferPlugin() {
  return {
    name: 'vite-plugin-import-defer',
    
    transform(code, id) {
      // 只处理 .js 和 .ts 文件
      if (!id.endsWith('.js') && !id.endsWith('.ts')) {
        return null;
      }
      
      // 匹配 import defer * as name from "path"
      const deferRegex = /import\s+defer\s+\*\s+as\s+(\w+)\s+from\s+["']([^"']+)["'];?/g;
      
      let match;
      const deferImports = [];
      
      while ((match = deferRegex.exec(code)) !== null) {
        deferImports.push({
          name: match[1],
          path: match[2],
          fullMatch: match[0]
        });
      }
      
      if (deferImports.length === 0) {
        return null;
      }
      
      let transformed = code;
      
      // 转换每个 import defer
      deferImports.forEach(imp => {
        // 创建延迟加载的代理
        const replacement = `
// Deferred import for ${imp.name}
let _${imp.name}_cache = null;
let _${imp.name}_loading = false;

async function _load_${imp.name}() {
  if (!_${imp.name}_cache && !_${imp.name}_loading) {
    _${imp.name}_loading = true;
    console.log('📦 Loading deferred module: ${imp.name}');
    _${imp.name}_cache = await import('${imp.path}');
    _${imp.name}_loading = false;
  }
  while (_${imp.name}_loading) {
    await new Promise(resolve => setTimeout(resolve, 10));
  }
  return _${imp.name}_cache;
}

const ${imp.name} = new Proxy({}, {
  get(target, prop) {
    // 返回一个 getter，在访问时才加载模块
    if (!_${imp.name}_cache) {
      // 同步访问时抛出错误提示
      const value = (async () => {
        const mod = await _load_${imp.name}();
        return mod[prop];
      })();
      
      // 如果是在 async 上下文中，这会正常工作
      // 如果是同步访问，会得到 Promise
      return value;
    }
    return _${imp.name}_cache[prop];
  }
});

// 预加载函数（可选）
globalThis._preload_${imp.name} = _load_${imp.name};
`;
        
        transformed = transformed.replace(imp.fullMatch, replacement);
      });
      
      // 转换属性访问为 await 形式
      deferImports.forEach(imp => {
        // 匹配 module.property 的访问
        const accessRegex = new RegExp(`(?<!_load_|_cache\\.)(${imp.name})\\.(\\w+)`, 'g');
        transformed = transformed.replace(accessRegex, `(await _load_${imp.name}()).$2`);
      });
      
      return {
        code: transformed,
        map: null
      };
    }
  };
}

export default defineConfig({
  plugins: [importDeferPlugin()],
  
  build: {
    outDir: 'dist-vite',
    lib: {
      entry: {
        'demo2-with-defer': path.resolve(__dirname, 'demo2-with-defer.ts'),
        'demo3-conditional-loading': path.resolve(__dirname, 'demo3-conditional-loading.ts')
      },
      formats: ['es']
    },
    rollupOptions: {
      output: {
        entryFileNames: '[name].js',
      }
    },
    target: 'esnext',
    minify: false
  },
  
  resolve: {
    extensions: ['.ts', '.js']
  }
});
