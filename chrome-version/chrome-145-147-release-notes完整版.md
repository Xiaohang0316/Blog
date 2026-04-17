# Chrome 145–147 完整 Release Notes 总结

> 来源：Chrome for Developers 官方 [Release Notes](https://developer.chrome.com/release-notes)，涵盖三个版本所有正式发布特性（含 Origin Trial 实验特性）。

---

## Chrome 145（2026-02-10）

### CSS & UI

#### `column-wrap` / `column-height`：多列布局换行
来自 CSS Multicol Level 2，支持为多列设定固定行高并在填满后折行，可实现竖向或二维多列布局，不再产生横向溢出滚动条。

#### `text-justify` 属性
控制 `text-align: justify` 的具体对齐算法，可强制对英文文本按字符间距两端对齐。

#### `letter-spacing` / `word-spacing` 支持百分比值
按空格字符（U+0020）宽度的百分比计算字距，响应式排版下随字体大小自动缩放。

#### 高 `border-radius` 阴影边缘精确计算
`border-radius` 接近 50% 的元素，其阴影和裁切边界现在精确贴合弧线轮廓，同样适用于 `corner-shape` 定义的非圆轮廓。

#### 可定制 `<select>` 列表框（Customizable Select Listbox）
`appearance: base-select` 扩展支持 `<select multiple>` 和 `<select size=N>` 的列表框渲染模式，可深度定制多选 UI。

#### `focus()` 新增 `focusVisible` 选项
`element.focus({ focusVisible: true/false })` 强制控制焦点环显示，与 `:focus-visible` 伪类联动。

#### 强制颜色模式下 Emoji 单色渲染
Forced Colors（高对比度）模式下，`font-variant-emoji` 为 `normal`/`unicode` 的 Emoji 自动切换单色字形，符合系统对比度要求。

#### 非根滚动容器弹性过滚动（Overscroll）
嵌套滚动元素到达边界时，弹性过滚动效果直接作用于该元素，不再穿透至根滚动容器，可通过 `overscroll-behavior` 逐元素控制。

---

### JavaScript

#### Map/WeakMap Upsert（`getOrInsert` / `getOrInsertComputed`）
ECMAScript 新提案，查找 key 不存在时自动插入默认值，简化"读-插"模式。

```js
map.getOrInsert('count', 0);
map.getOrInsertComputed('items', () => []);
```

#### Crash Reporting Key-Value API（`window.crashReport`）
向 `window.crashReport` 写入键值对，渲染进程崩溃时自动附加到崩溃报告，便于定位崩溃原因。

#### UA 字符串默认精简（移除 `UserAgentReduction` 策略）
`UserAgentReduction` 企业策略从 Chrome 145 起正式移除，Chrome 默认发送精简 UA。推荐迁移到 **User-Agent Client Hints（UA-CH）**。

#### Navigation API：`navigation.transition.to`
`NavigationTransition` 新增 `to`（`NavigationDestination`）属性，在 precommit 阶段即可读取导航目标 URL。

#### Cookie Store API 支持 `maxAge`
用秒数指定 Cookie 有效期，与 `document.cookie` 的 `Max-Age` 对齐。

#### 安全支付确认（SPC）：设备绑定密钥 + UX 刷新
- Browser Bound Keys：SPC 断言附加设备级加密签名，私钥不跨设备同步。
- Android SPC 对话框全面更新：商户徽标、双行支付信息、更细粒度的取消/继续状态区分。

#### `InputEvent` 删除命令类型修正
对选中文本使用 `Ctrl+Backspace`/`Ctrl+Delete` 时，`beforeinput`/`input` 事件的 `inputType` 现在正确上报 `deleteContentBackward`/`deleteContentForward`，而非错误的 `deleteWordBackward`/`deleteWordForward`。

#### `clipboardchange` 事件需要粘性用户激活
防止未经授权的剪贴板监听，触发 `clipboardchange` 事件现在需要粘性用户激活或 `clipboard-read` 权限。

---

### 安全

#### Origin API
原生 `Origin` 对象，封装 origin 概念，提供安全的同源/同站比较、序列化、解析方法，替代过去只能操作字符串造成的安全隐患。

#### 设备绑定会话凭证（DBSC）
Session Cookie 与设备硬件密钥绑定，短周期 Cookie + 定期私钥验证，从根本上防止 Cookie 被盗后在异设备复用。

#### 本地网络访问权限拆分（LNA Split Permissions）
`local-network-access` 权限拆分为：
- `local-network`：访问本地地址空间
- `loopback-network`：访问回环地址空间

#### Trusted Types 规范对齐
更新 Trusted Types 实现以匹配已上游合并至 HTML + DOM 的最新规范，与 WebKit 实现保持一致，修复多处可被开发者感知的不一致行为。

---

### 性能

#### `PerformanceNavigationTiming.confidence`
判断当前导航性能数据是否具有代表性，有效区分冷启动/热启动等双峰分布场景。

#### `paintTime` / `presentationTime`
Element Timing、LCP、Long Animation Frames、Paint Timing 中新增：
- `paintTime`：浏览器开始绘制的时间点
- `presentationTime`：像素实际到达屏幕的时间点

#### LayoutShift API 改用 CSS 像素
`prevRect` / `currentRect` 改为 CSS 像素上报，与其他布局 API 保持单位一致。

---

### 存储

#### IndexedDB 切换到 SQLite 后端（内存上下文）
隐身模式等内存上下文中，IndexedDB 底层从 LevelDB + 扁平文件迁移到 SQLite，提升可靠性，Web API 无变化。

---

### 多媒体

#### WebRTC `VideoFrame.metadata()` 暴露 `rtpTimestamp`
来自 WebRTC 源的视频帧可通过 `VideoFrame.metadata()` 获取 `rtpTimestamp`，便于音视频同步分析。

---

### 能力（Capabilities）

#### Android 准确报告窗口位置
`window.screenX`/`screenY`/`outerWidth`/`outerHeight` 现在在 Android 平板自由窗口模式下也能准确反映实际窗口位置和尺寸。

---

### 图形

#### WebGPU：`subgroup_uniformity` 特性
扩展 WGSL 一致性分析作用域，让 subgroup 功能在更多场景下被视为 uniform，解锁更多 subgroup 优化可能。

---

### Origin Trial（实验特性）

#### JPEG XL 图像解码（`image/jxl`）
基于 Rust 安全解码器 `jxl-rs`，支持 JPEG XL 格式，提供渐进解码、宽色域/HDR/高位深、动画等能力。需开启 flag。

#### WebAudio 可配置渲染量子
`AudioContext`/`OfflineAudioContext` 新增 `renderSizeHint`，可指定渲染帧数或设为 `"hardware"` 让浏览器自动选择。

---

### 废弃与移除

- **移除 macOS 过时虚拟摄像头支持**
- **移除 BMP 内嵌 JPEG/PNG 扩展**

---

## Chrome 146（2026-03-10）

### CSS & UI

#### 滚动触发动画（Scroll-triggered Animations）
CSS 声明式滚动触发动画，到达滚动位置时自动播放/暂停/重置动画，可卸载至 Worker 线程。同时提供 JS 接口扩展 Web Animations。

```css
.box {
  animation: slide-in linear;
  animation-trigger: scroll() entry;
}
```

#### `trigger-scope` 属性
将动画触发器名称限制在特定作用域内，避免全局污染，与 `anchor-name` 的作用域隔离机制类似。

#### `<meta name="text-scale">`
声明页面通过 `rem`/`em` 良好适配用户文字大小偏好，浏览器据此缩放根元素字号，并禁用全页缩放和移动端文字自动调整等旧机制。

#### 作用域自定义元素注册表（Scoped Custom Element Registry）
同一标签名可在不同 Shadow Root 绑定的注册表中有不同定义，彻底解决多库命名冲突。

---

### JavaScript

#### `Iterator.concat`（Iterator 序列化）
TC39 提案，按顺序连接多个迭代器为一个新迭代器。

```js
Iterator.concat([1, 2], [3, 4]); // 惰性合并
```

#### 选择性权限拦截（Selective Permissions Intervention）
页面授予的强大 API 权限（蓝牙、摄像头、麦克风、地理位置等）对页面内广告脚本不再生效，防止第三方脚本趁机访问敏感数据。

#### 拖放 `dropEffect` 值保留修复
`dragover` 中设置的 `dataTransfer.dropEffect` 现在能在 `drop` 事件中正确保留，修复长期不符合 HTML5 规范的行为。

#### Navigation API：`post-commit handler` 可在 `precommit` 中注册
在 precommit 处理器中可直接注册 post-commit 处理器，简化导航拦截的代码组织。

---

### 多媒体

#### `AudioContext.playbackStats`
返回 `AudioPlaybackStats` 对象，提供音频播放的平均/最小/最大延迟、欠载时长和次数等统计数据，用于监控播放质量和检测音频故障。

---

### 安全

#### Sanitizer API
浏览器原生 XSS 防护接口，移除用户输入 HTML 中危险内容。Firefox 已同步支持。

```js
element.setHTML(dirtyHTML, { sanitizer: new Sanitizer() });
```

---

### 网络

#### Data URL MIME 类型参数保留
Data URL 的 `Content-Type` 现在保留 `charset`、`boundary` 等 MIME 参数，符合 Fetch Standard。

---

### 性能

#### LCP 候选项发射行为修正
LCP 算法改为基于已绘制最大图像（而非待处理最大图像）发射候选项，与 Firefox/Safari 对齐，减少跨引擎差异。

---

### 图形（WebGPU）

#### Texture and Sampler Lets
WGSL 新增 `texture_and_sampler_let` 特性，允许将 `texture`/`sampler` 存入 `let` 声明。

#### Transient Attachments
新增 `TRANSIENT_ATTACHMENT` 纹理用途标志，渲染通道附件数据可保留在 tile memory，避免 VRAM 读写，在移动端 GPU 上效果显著。

#### 兼容模式（Compatibility Mode）
opt-in 的 WebGPU API 子集，兼容 OpenGL ES / Direct3D 11 等旧图形后端，只需 `requestAdapter` 时指定 `featureLevel: 'compatibility'`。

---

### PWA / Capabilities

#### 文件处理时填充 `LaunchParams.targetURL`
PWA 文件处理启动时 `LaunchParams.targetURL` 现在正确填充 manifest `action` URL（此前为 `null`）。

#### 修复页面刷新时重复触发 LaunchParams
刷新不再重复向 `launchQueue` 发送上次启动的文件参数。

---

### Origin Trial（实验特性）

#### WebNN（Web Neural Network API）
调用操作系统原生 ML 服务和硬件（CPU/GPU/NPU），在浏览器内实现高效 ML 推理。

#### CPU Performance API
暴露设备 CPU 算力信息，可与 Compute Pressure API 配合使用，按设备性能动态调整计算负载。

#### Speculation Rules：`form_submission` 字段
在 `prerender` speculation rules 中声明 `form_submission`，支持预加载表单提交目标页面（如搜索结果页）。

#### Focusgroup
`focusgroup` HTML 属性让一组可聚焦元素自动支持键盘方向键导航，无需手动编写键盘事件逻辑。

---

## Chrome 147（2026-04-07）

### CSS & UI

#### 元素级视图过渡（Element-scoped View Transitions）
`element.startViewTransition()` 可在任意元素上调用，支持多个过渡**并发运行**、**嵌套**过渡，且过渡期间页面其余部分保持可交互。

```js
el.startViewTransition(() => updateContent());
```

#### CSS `contrast-color()`
输入一个颜色，自动返回对比度最高的黑或白，满足无障碍对比度要求。

```css
color: contrast-color(var(--bg));
```

#### Timeline Named Range `scroll`
View Timeline 新增 `scroll` 命名范围，与 `entry`/`exit`/`cover`/`contain` 共同提供细粒度滚动动画控制。

#### CSS `border-shape` 属性
为边框定义任意形状（多边形、圆形、`shape()` 等），仅影响边框及内部裁切，不同于 `clip-path` 裁切整个元素。

```css
border-shape: polygon(0 0, 100% 0, 90% 100%, 10% 100%);
```

#### `CSSPseudoElement` 接口
`Element.pseudo('::after')` 等方法返回 `CSSPseudoElement` 对象，提供 `type`/`element`/`parent`/`pseudo()` 等属性，支持 `::before`/`::after`/`::marker`。

#### 事件 `pseudoTarget` 属性
`UIEvent`/`AnimationEvent`/`TransitionEvent` 新增 `.pseudoTarget`，标明事件是否发生在伪元素上（如 `::after`），`Event.target` 保持不变。

#### `border-width` / `outline-width` / `column-rule-width` 解耦
这三个宽度属性的计算值不再因对应 `*-style` 为 `none`/`hidden` 而强制归零，与 Firefox/WebKit 行为对齐。

#### SVG `<textPath>` 支持内联 `path` 属性
`<textPath path="M...">` 可直接内联定义路径，无需单独的 `<path>` 元素；`path` 属性优先级高于 `href`。

---

### JavaScript

#### `Math.sumPrecise`
TC39 提案，对可迭代数值精确求和，避免原生 `+` 累加的浮点精度损失。

```js
Math.sumPrecise([0.1, 0.2, 0.3]); // 精确得 0.6
```

---

### 网络 / 本地网络访问（LNA）

#### `Request.isReloadNavigation`
Fetch API `Request` 新增只读布尔属性，在 Service Worker `FetchEvent` 中判断请求是否来自页面刷新。

#### LNA 限制扩展至 WebTransport
通过 WebTransport 访问本地网络 IP 或回环地址现在需要权限提示。

#### LNA 限制扩展至 WebSockets
WebSocket 连接本地地址触发权限提示，现有 LNA 企业策略同样适用。

#### Service Worker `WindowClient.navigate()` 的 LNA 限制
SW 通过 `WindowClient.navigate()` 发起的子框架导航也受 LNA 限制约束。

---

### DOM

#### `<link rel="modulepreload">` 支持 JSON 和 CSS 模块

```html
<link rel="modulepreload" as="style" href="app.css">
<link rel="modulepreload" as="json"  href="config.json">
```

补全对 JSON 和 CSS 模块的预加载支持，之前仅支持 JS 模块。

#### Rust XML 解析器（非 XSLT 场景）
非 XSLT 场景下 XML 解析切换为基于 Rust 的安全实现，替换 C++ `libxml2`，消除内存安全风险。

---

### 性能

#### Device Memory API 数值更新
- **Android**：1 / 2 / 4 / 8 GB
- **其他平台**：2 / 4 / 8 / 16 / 32 GB

替换 2016 年以来的旧值（0.25–8 GB），降低指纹风险，更好区分高端设备。

---

### 设备 / XR

#### WebXR 平面检测（Plane Detection）
获取环境检测到的平面集合（墙面、桌面等），支持语义标签，即便被遮挡也能还原完整边界，能力强于深度感应 API。

#### WebXR Layers
更高效的沉浸式内容渲染，由系统合成器管理层，支持多种层类型和原生纹理，减少 JS 渲染开销。

---

### Origin Trial（实验特性）

#### 预渲染跨域 iframe
HTTP 响应头 `Supports-Loading-Mode: prerender-cross-origin-frames` 触发所有跨域 iframe 的预渲染。

#### Autofill 事件
新增 `autofill` 事件，开发者可监听浏览器自动填充，并在完成后通知浏览器，便于动态表单协同自动填充。

#### WebNN（续）
继 Chrome 146 继续 Origin Trial 测试 Web Neural Network API。

---

### 废弃与移除

**XSLT 中 SVG 内联生成移除：** 通过 XSL 样式表将 XML 转换为 SVG 的特殊用法被移除（使用率极低），是逐步弃用 XSLT 计划的一部分。

---

## 三版本完整特性总览

| 版本 | 类别 | 特性 |
|------|------|------|
| **145** | CSS | `column-wrap`/`column-height` 多列换行 |
| **145** | CSS | `text-justify` 属性 |
| **145** | CSS | `letter-spacing`/`word-spacing` 百分比值 |
| **145** | CSS | 高 `border-radius` 阴影精确渲染 |
| **145** | CSS | 可定制 `<select>` 列表框 |
| **145** | CSS | `focus()` 新增 `focusVisible` 选项 |
| **145** | CSS | 强制颜色模式下 Emoji 单色渲染 |
| **145** | CSS | 非根滚动容器弹性过滚动 |
| **145** | JS | Map/WeakMap `getOrInsert` Upsert |
| **145** | JS | `window.crashReport` 崩溃调试 API |
| **145** | JS | UA 字符串默认精简 |
| **145** | JS | Navigation API `transition.to` |
| **145** | JS | Cookie Store API `maxAge` 属性 |
| **145** | JS | InputEvent 删除命令类型修正 |
| **145** | JS | `clipboardchange` 需要粘性激活 |
| **145** | JS | SPC 设备绑定密钥 + UX 刷新 |
| **145** | 安全 | Origin API |
| **145** | 安全 | DBSC（设备绑定会话凭证） |
| **145** | 安全 | LNA 权限拆分（local/loopback） |
| **145** | 安全 | Trusted Types 规范对齐 |
| **145** | 性能 | 导航时序 `confidence` 字段 |
| **145** | 性能 | `paintTime` / `presentationTime` |
| **145** | 性能 | LayoutShift API 改用 CSS 像素 |
| **145** | 存储 | IndexedDB 切换 SQLite 后端（隐身模式） |
| **145** | 多媒体 | WebRTC `VideoFrame.metadata()` `rtpTimestamp` |
| **145** | 能力 | Android 准确报告窗口位置 |
| **145** | WebGPU | `subgroup_uniformity` 特性 |
| **146** | CSS | 滚动触发动画 |
| **146** | CSS | `trigger-scope` 属性 |
| **146** | CSS | `<meta name="text-scale">` |
| **146** | Web Components | 作用域自定义元素注册表 |
| **146** | JS | `Iterator.concat` 序列化 |
| **146** | JS | 选择性权限拦截（广告脚本隔离） |
| **146** | JS | 拖放 `dropEffect` 值保留修复 |
| **146** | JS | Navigation API post-commit in precommit |
| **146** | 多媒体 | `AudioContext.playbackStats` |
| **146** | 安全 | Sanitizer API |
| **146** | 网络 | Data URL MIME 参数保留 |
| **146** | 性能 | LCP 候选项发射行为修正 |
| **146** | WebGPU | Texture/Sampler Let 声明 |
| **146** | WebGPU | Transient Attachments |
| **146** | WebGPU | 兼容模式（旧图形 API） |
| **146** | PWA | 文件处理 `LaunchParams.targetURL` 修复 |
| **146** | PWA | 刷新不重复触发 LaunchParams |
| **147** | CSS | 元素级视图过渡 |
| **147** | CSS | `contrast-color()` |
| **147** | CSS | Timeline Named Range `scroll` |
| **147** | CSS | `border-shape` 属性 |
| **147** | CSS | `CSSPseudoElement` 接口 |
| **147** | CSS | 事件 `pseudoTarget` 属性 |
| **147** | CSS | `border/outline/column-rule-width` 解耦 |
| **147** | SVG | `<textPath path="">` 内联路径 |
| **147** | JS | `Math.sumPrecise` |
| **147** | 网络 | `Request.isReloadNavigation` |
| **147** | 网络 | LNA → WebTransport |
| **147** | 网络 | LNA → WebSockets |
| **147** | 网络 | LNA → SW `WindowClient.navigate()` |
| **147** | DOM | `modulepreload` 支持 JSON/CSS 模块 |
| **147** | DOM | Rust XML 解析器 |
| **147** | 性能 | Device Memory API 数值更新 |
| **147** | XR | WebXR 平面检测 |
| **147** | XR | WebXR Layers |

---

## 参考链接

| 版本 | Release Notes | Blog |
|------|---------------|------|
| Chrome 145 | [release-notes/145](https://developer.chrome.com/release-notes/145) | [new-in-chrome-145](https://developer.chrome.com/blog/new-in-chrome-145) |
| Chrome 146 | [release-notes/146](https://developer.chrome.com/release-notes/146) | [new-in-chrome-146](https://developer.chrome.com/blog/new-in-chrome-146) |
| Chrome 147 | [release-notes/147](https://developer.chrome.com/release-notes/147) | [new-in-chrome-147](https://developer.chrome.com/blog/new-in-chrome-147) |
