import { defineConfig } from 'vite';
import babel from '@rollup/plugin-babel';

/**
 * 使用 Babel 7.23+ 支持 import defer
 * 通过 @babel/plugin-proposal-import-defer 插件
 * 参考：https://babeljs.io/docs/babel-plugin-proposal-import-defer
 */
export default defineConfig({
  plugins: [
    babel({
      extensions: ['.ts', '.js'],
      babelHelpers: 'bundled',
      presets: [
        '@babel/preset-typescript'
      ],
      plugins: [
        // Babel 7.23+ 的 import defer 插件
        ['@babel/plugin-proposal-import-defer', {
          // 注意：Babel 转换仅支持 CommonJS 输出
          // 对于 ES modules，建议使用自定义转换
        }]
      ]
    })
  ],
  
  build: {
    outDir: 'dist-vite',
    target: 'esnext',
    minify: false,
    rollupOptions: {
      input: {
        demo1: './demo1-without-defer.ts',
        demo2: './demo2-with-defer.ts',
        demo3: './demo3-conditional-loading.ts',
        demo4: './demo4-dynamic-import-alternative.ts'
      },
      output: {
        entryFileNames: '[name].js',
        format: 'es'
      }
    }
  },
  
  resolve: {
    extensions: ['.ts', '.js']
  }
});
