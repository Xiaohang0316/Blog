// demo1-without-defer.ts - 不使用 import defer 的情况
console.log("=== Demo 1: 不使用 import defer ===\n");
console.log("1️⃣  准备导入模块...");
// 普通的 import 会立即执行模块
import * as heavy from "./heavy-module.js";
console.log("2️⃣  模块已导入（模块已经执行完毕）");
// 模拟应用的其他初始化工作
console.log("3️⃣  执行应用其他初始化...");
// 可能很久之后才会用到这个模块
setTimeout(() => {
    console.log("\n4️⃣  现在才需要使用模块功能:");
    console.log(heavy.config);
    const result = heavy.processData("测试数据");
    console.log(result);
}, 2000);
console.log("5️⃣  应用启动完成\n");
/**
 * 输出结果分析：
 * - heavy-module 在 import 时就立即执行了
 * - 即使我们2秒后才需要使用，初始化代码也在开始就运行了
 * - 这会导致应用启动变慢
 */
