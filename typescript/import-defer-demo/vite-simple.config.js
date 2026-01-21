import { defineConfig } from 'vite';

/**
 * 简化版 Vite 插件：将 import defer 转换为动态 import
 */
function simpleDeferPlugin() {
  return {
    name: 'simple-defer-transform',
    enforce: 'pre',
    
    transform(code, id) {
      if (!code.includes('import defer')) {
        return null;
      }
      
      console.log(`🔄 Transforming defer imports in: ${id}`);
      
      // 简单替换：import defer * as X from 'Y' -> const X = await import('Y')
      // 注意：这个简化版本要求在 async 上下文中使用
      let transformed = code.replace(
        /import\s+defer\s+\*\s+as\s+(\w+)\s+from\s+(['"][^'"]+['"]);\s*/g,
        (match, name, path) => {
          console.log(`  ✓ Found defer import: ${name} from ${path}`);
          return `// Original: ${match}\nconst ${name} = await import(${path});\n`;
        }
      );
      
      // 如果有转换，需要确保函数是 async 的
      if (transformed !== code) {
        // 包装在 async IIFE 中
        transformed = `(async () => {\n${transformed}\n})();`;
      }
      
      return transformed !== code ? { code: transformed, map: null } : null;
    }
  };
}

export default defineConfig({
  plugins: [simpleDeferPlugin()],
  
  build: {
    outDir: 'dist-vite',
    target: 'esnext',
    minify: false,
    rollupOptions: {
      input: {
        demo2: './demo2-with-defer.ts',
        demo3: './demo3-conditional-loading.ts'
      },
      output: {
        entryFileNames: '[name].js',
      }
    }
  }
});
