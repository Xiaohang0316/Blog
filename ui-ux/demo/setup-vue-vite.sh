#!/bin/bash
set -e

# 1. 初始化 npm 项目（如果没有 package.json）
if [ ! -f package.json ]; then
  npm init -y
fi

# 2. 安装依赖
npm install vue
npm install -D vite @vitejs/plugin-vue

# 3. 创建 vite.config.js
cat > vite.config.js <<EOL
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

export default defineConfig({
  plugins: [vue()],
  root: './src',
})
EOL

# 4. 添加 dev 脚本
if ! grep -q '"dev"' package.json; then
  npx npm-add-script -k "dev" -v "vite"
fi

# 5. 提示用户如何启动
cat <<TIPS

依赖和配置已完成！
请运行：
  npm run dev
然后在浏览器打开终端显示的本地地址。
TIPS
