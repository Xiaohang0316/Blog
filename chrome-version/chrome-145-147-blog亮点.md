# Chrome 145–147 新特性亮点

> 来源：[New in Chrome](https://developer.chrome.com/blog) 官方博客精选，每版本提炼 3 个最值得关注的更新。

---

## Chrome 145（2026-02-10）

### 1. CSS 多列布局换行（`column-wrap` / `column-height`）

来自 CSS Multicol Level 2 规范，新增 `column-wrap` 和 `column-height` 两个属性，让多列容器在高度受限时能将溢出列折入新行，而不是产生横向滚动条，真正实现二维列布局。

```css
.container {
  columns: 3;
  column-height: 200px;
  column-wrap: wrap;
}
```

👉 [详细文章：Support for wrapped columns in CSS multicol](https://developer.chrome.com/blog/multicol-wrapping)

---

### 2. Origin API

引入原生 `Origin` 对象，将"源（origin）"这一 Web 安全核心概念直接暴露给开发者。过去只能拿到字符串序列化结果，做同源/同站比较时容易出错甚至产生漏洞；现在 `Origin` 对象提供了安全、规范的比较、解析和序列化方法。

---

### 3. 设备绑定会话凭证（DBSC）

将用户 Session 与设备硬件密钥绑定，通过定期验证私钥刷新短周期 Cookie，使偷来的 Cookie 在其他设备上无效，从根本上抵御 Cookie 窃取攻击。

👉 [文档：Device Bound Session Credentials](https://developer.chrome.com/docs/web-platform/device-bound-session-credentials)

---

## Chrome 146（2026-03-10）

### 1. 滚动触发动画（Scroll-triggered Animations）

通过 CSS 声明式语法，让动画在滚动到指定位置时自动触发、暂停或重置，无需 JS 监听滚动事件。浏览器可将交互逻辑卸载到 Worker 线程，性能更好；同时也提供 JS 接口，扩展到 Web Animations API。

```css
@keyframes slide-in {
  from { transform: translateX(-100%); }
  to   { transform: translateX(0); }
}

.box {
  animation: slide-in linear;
  animation-trigger: scroll() entry;
}
```

👉 [详细文章：Scroll-triggered animations are coming](https://developer.chrome.com/blog/scroll-triggered-animations)

---

### 2. 作用域自定义元素注册表（Scoped Custom Element Registry）

允许在同一页面为同一标签名注册多套自定义元素定义，通过将注册表与 Shadow Root 绑定实现命名隔离，彻底解决多组件库的自定义元素名称冲突问题。

```js
const registry = new CustomElementRegistry();
registry.define('my-button', MyButton);
// 仅在绑定的 shadow root 内生效，不影响全局
```

👉 [详细文章：Make custom elements behave with scoped registries](https://developer.chrome.com/blog/scoped-registries)

---

### 3. Sanitizer API

浏览器原生 HTML 净化接口，无需引入第三方库（如 DOMPurify）即可安全地处理用户输入 HTML，移除可执行脚本等危险内容，构建防 XSS 应用更轻松。Firefox 已同步支持。

```js
const sanitizer = new Sanitizer();
element.setHTML(untrustedHTML, { sanitizer });
```

👉 [MDN 文档：HTML Sanitizer API](https://developer.mozilla.org/docs/Web/API/HTML_Sanitizer_API)

---

## Chrome 147（2026-04-07）

### 1. 元素级视图过渡（Element-scoped View Transitions）

`startViewTransition()` 现在可以直接在任意 HTML 元素上调用，而不再局限于 `document`。带来三大新能力：多个元素的过渡动画**并发运行**、支持**嵌套**过渡、过渡期间页面其余部分**保持可交互**。

```js
document.querySelector('.card').startViewTransition(() => updateCard());
```

👉 [详细文章：Chrome 147 enables concurrent and nested view transitions](https://developer.chrome.com/blog/element-scoped-view-transitions)

---

### 2. CSS `contrast-color()` 函数

接受一个颜色参数，自动返回对比度最高的黑色或白色，可用于任何需要颜色值的 CSS 属性。不再需要手动计算前景色以满足无障碍（WCAG）对比度要求。

```css
.button {
  background: var(--brand-color);
  color: contrast-color(var(--brand-color)); /* 自动选黑或白 */
}
```

👉 [MDN 文档：contrast-color()](https://developer.mozilla.org/docs/Web/CSS/Reference/Values/color_value/contrast-color)

---

### 3. CSS `border-shape` 属性

为元素边框定义任意几何形状（多边形、圆形、`shape()` 路径等）。与 `clip-path` 裁切整个元素不同，`border-shape` 只作用于边框本身并对内部进行裁切，支持描边形状和填充双形状两种变体。

```css
.card {
  border: 4px solid steelblue;
  border-shape: polygon(0 0, 100% 0, 90% 100%, 10% 100%);
}
```

---

## 参考链接

| 版本 | Blog 文章 |
|------|-----------|
| Chrome 145 | [New in Chrome 145](https://developer.chrome.com/blog/new-in-chrome-145) |
| Chrome 146 | [New in Chrome 146](https://developer.chrome.com/blog/new-in-chrome-146) |
| Chrome 147 | [New in Chrome 147](https://developer.chrome.com/blog/new-in-chrome-147) |
