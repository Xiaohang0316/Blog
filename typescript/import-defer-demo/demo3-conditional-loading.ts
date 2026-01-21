// demo3-conditional-loading.ts - 条件加载演示
console.log("=== Demo 3: 条件加载 Beta 功能 ===\n");

import * as flags from "./feature-flags.js";

// 使用 defer 导入可能不需要的功能
import defer * as beta from "./beta-feature.js";

console.log("1️⃣  应用已启动");
console.log("2️⃣  Feature flags 已加载");
console.log("3️⃣  Beta 模块已 defer 导入（尚未执行）\n");

// 检查是否启用了 beta 功能
if (flags.isFeatureEnabled("enableBetaFeatures")) {
  console.log("✅ Beta 功能已启用，开始使用:\n");
  
  // 只有在启用时才会执行 beta 模块的代码
  console.log(beta.betaConfig);
  const result = beta.betaFeature1();
  console.log(result);
} else {
  console.log("❌ Beta 功能未启用");
  console.log("💡 beta 模块永远不会被执行，节省了资源！");
}

/**
 * 使用场景分析：
 * 1. 条件功能：根据配置或权限决定是否加载某些功能
 * 2. A/B 测试：根据用户分组加载不同的功能模块
 * 3. 性能优化：延迟非关键功能的加载
 */
