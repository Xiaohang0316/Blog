// demo4-dynamic-import-alternative.ts
// 使用动态 import 作为 import defer 的替代方案
console.log("=== Demo 4: 动态 Import 替代方案 (可运行) ===\n");

console.log("1️⃣  应用启动");

// 不使用 import defer，而是使用动态 import
let heavyModule: typeof import("./heavy-module.js") | null = null;

console.log("2️⃣  准备就绪（heavy-module 未加载）");

// 模拟应用的其他初始化工作
console.log("3️⃣  执行应用其他初始化...");

async function loadAndUseHeavyModule() {
  console.log("\n4️⃣  现在需要使用模块功能:");
  
  // 延迟加载和执行模块
  if (!heavyModule) {
    console.log("📦 动态加载模块...");
    heavyModule = await import("./heavy-module.js");
  }
  
  console.log(heavyModule.config);
  const result = heavyModule.processData("测试数据");
  console.log(result);
}

// 模拟2秒后才需要使用
setTimeout(() => {
  loadAndUseHeavyModule();
}, 2000);

console.log("5️⃣  应用启动完成\n");

/**
 * 动态 import() 与 import defer 的区别：
 * 
 * import defer:
 * - 模块立即加载，延迟执行
 * - 同步访问，使用时才执行
 * - 语法: import defer * as module from "..."
 * 
 * 动态 import():
 * - 模块延迟加载，也延迟执行
 * - 异步访问，返回 Promise
 * - 语法: await import("...")
 * 
 * 相同点：
 * - 都可以延迟模块的执行
 * - 都能减少启动时的开销
 */
