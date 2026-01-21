import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * Webpack 5.100+ 原生支持 import defer
 * 使用实验性功能 experiments.deferImport
 * 参考：https://webpack.js.org/configuration/experiments/#experimentsdeferimport
 */
export default {
  mode: 'development',
  entry: {
    demo1: './dist/demo1-without-defer.js',
    demo2: './dist/demo2-with-defer.js',
    demo3: './dist/demo3-conditional-loading.js',
    demo4: './dist/demo4-dynamic-import-alternative.js'
  },
  output: {
    path: path.resolve(__dirname, 'dist-webpack'),
    filename: '[name].bundle.js',
    module: true,
  },
  experiments: {
    outputModule: true,
    // ✅ Webpack 5.100+ 原生支持 import defer
    deferImport: true
  },
  target: 'node',
  optimization: {
    minimize: false,  // 不压缩代码
    concatenateModules: false,  // 不合并模块，保持代码结构
    usedExports: false,  // 不进行 tree-shaking
    sideEffects: false,  // 不标记副作用
    mangleExports: false  // 不混淆导出名称
  },
  devtool: false,  // 不生成 source map（可选）
  // 使用 Babel 处理 TypeScript 源文件（可选）
  module: {
    rules: [
      {
        test: /\.ts$/,
        exclude: /node_modules/,
        use: {
          loader: 'babel-loader',
          options: {
            presets: [
              ['@babel/preset-typescript']
            ],
            plugins: [
              // Babel 7.23+ 支持 import defer
              ['@babel/plugin-proposal-import-defer', { 
                // 注意：Babel 的转换只支持 CommonJS 输出
                // 如果使用 ES modules，建议直接用 Webpack 的原生支持
              }]
            ]
          }
        }
      }
    ]
  },
  resolve: {
    extensions: ['.ts', '.js']
  }
};
