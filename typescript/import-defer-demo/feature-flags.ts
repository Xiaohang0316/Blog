// feature-flags.ts - 特性开关模块
console.log("🎯 Feature flags 模块初始化");

export const features = {
  enableNewUI: false,
  enableBetaFeatures: true,
  enableExperimentalAPI: false
};

export function isFeatureEnabled(featureName: string): boolean {
  console.log(`🔍 检查特性: ${featureName}`);
  return (features as any)[featureName] || false;
}
