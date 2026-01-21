/**
 * 简单的 import defer 转换脚本
 * 将 import defer 转换为动态 import
 * 
 * 用法: node transform-defer.js
 */

import { readFileSync, writeFileSync } from 'fs';

function transformDeferImport(code) {
  // 匹配 import defer * as name from "path"
  const deferRegex = /import\s+defer\s+\*\s+as\s+(\w+)\s+from\s+["']([^"']+)["'];?/g;
  
  const deferImports = [];
  let match;
  
  // 提取所有 defer import
  while ((match = deferRegex.exec(code)) !== null) {
    deferImports.push({
      name: match[1],
      path: match[2],
      fullMatch: match[0]
    });
  }
  
  if (deferImports.length === 0) {
    return code;
  }
  
  // 移除 import defer 语句
  let transformed = code;
  deferImports.forEach(imp => {
    transformed = transformed.replace(imp.fullMatch, '');
  });
  
  // 添加 lazy loader
  const loaders = deferImports.map(imp => `
// Lazy loader for ${imp.name}
let _${imp.name}_cached = null;
const ${imp.name} = new Proxy({}, {
  get(target, prop) {
    if (!_${imp.name}_cached) {
      throw new Error('Module not loaded yet. Use await import() or load synchronously first.');
    }
    return _${imp.name}_cached[prop];
  }
});

// Load function (call this before accessing ${imp.name})
async function _load_${imp.name}() {
  if (!_${imp.name}_cached) {
    console.log('📦 Loading deferred module: ${imp.name}');
    _${imp.name}_cached = await import('${imp.path}');
  }
  return _${imp.name}_cached;
}
`).join('\n');
  
  // 在文件顶部添加 loaders
  transformed = loaders + '\n' + transformed;
  
  // 替换访问模式 (简单版本，可能不完美)
  deferImports.forEach(imp => {
    // 替换 module.property 为 (await _load_module()).property
    const accessRegex = new RegExp(`\\b${imp.name}\\.`, 'g');
    transformed = transformed.replace(accessRegex, `(await _load_${imp.name}()).`);
  });
  
  return transformed;
}

// 转换 demo2
try {
  const demo2 = readFileSync('./dist/demo2-with-defer.js', 'utf-8');
  const transformed = transformDeferImport(demo2);
  writeFileSync('./dist/demo2-with-defer.transformed.js', transformed);
  console.log('✅ demo2 transformed -> dist/demo2-with-defer.transformed.js');
} catch (e) {
  console.log('⚠️ demo2 not found or error:', e.message);
}

// 转换 demo3
try {
  const demo3 = readFileSync('./dist/demo3-conditional-loading.js', 'utf-8');
  const transformed = transformDeferImport(demo3);
  writeFileSync('./dist/demo3-conditional-loading.transformed.js', transformed);
  console.log('✅ demo3 transformed -> dist/demo3-conditional-loading.transformed.js');
} catch (e) {
  console.log('⚠️ demo3 not found or error:', e.message);
}

console.log('\n运行转换后的文件:');
console.log('  node dist/demo2-with-defer.transformed.js');
console.log('  node dist/demo3-conditional-loading.transformed.js');
