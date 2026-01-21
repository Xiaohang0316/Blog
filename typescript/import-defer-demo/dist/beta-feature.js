// beta-feature.ts - 实验性功能模块（体积大、初始化慢）
console.log("🧪 Beta Feature 模块开始加载...");
// 模拟大型依赖的初始化
function loadLargeLibrary() {
    console.log("📦 加载大型依赖库...");
    let data = new Array(10000000).fill(0).map((_, i) => i * 2);
    console.log("✅ 依赖库加载完成");
    return data.length;
}
const libSize = loadLargeLibrary();
export function betaFeature1() {
    console.log("🚀 执行 Beta Feature 1");
    return "Beta Feature 1 结果";
}
export function betaFeature2() {
    console.log("🚀 执行 Beta Feature 2");
    return "Beta Feature 2 结果";
}
export const betaConfig = {
    enabled: true,
    librarySize: libSize
};
