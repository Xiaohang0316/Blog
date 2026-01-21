// heavy-module.ts - 一个有大量初始化工作的模块
console.log("🚀 Heavy module 开始初始化...");

// 模拟耗时的初始化操作
function expensiveInitialization() {
  console.log("⏱️  执行昂贵的初始化操作...");
  
  // 模拟大量计算
  let result = 0;
  for (let i = 0; i < 100000000; i++) {
    result += Math.sqrt(i);
  }
  
  console.log("✅ 初始化完成！");
  return result;
}

// 模块加载时就会执行这个初始化
const initResult = expensiveInitialization();

export const config = {
  version: "1.0.0",
  initialized: true,
  initTime: Date.now(),
  calculationResult: initResult
};

export function processData(data: string) {
  console.log(`📊 处理数据: ${data}`);
  return `已处理: ${data}`;
}

export function analyze() {
  console.log("🔍 执行分析功能");
  return "分析结果";
}
