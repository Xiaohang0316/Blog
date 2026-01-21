// demo2-with-defer.ts - 使用 import defer 的情况
console.log("=== Demo 2: 使用 import defer ===\n");
console.log("1️⃣  准备导入模块...");
// 使用 import defer - 模块不会立即执行
import defer * as heavy from "./heavy-module.js";
console.log("2️⃣  模块已导入（但模块代码还没执行！）");
// 模拟应用的其他初始化工作
console.log("3️⃣  执行应用其他初始化...");
// 可能很久之后才会用到这个模块
setTimeout(() => {
    console.log("\n4️⃣  现在才需要使用模块功能:");
    // 在第一次访问 heavy 的属性时，模块才会执行
    console.log(heavy.config);
    const result = heavy.processData("测试数据");
    console.log(result);
}, 2000);
console.log("5️⃣  应用启动完成\n");
