
## 参考链接

| 版本 | Blog 文章 |
|------|-----------|
| Chrome 145 | [New in Chrome 145](https://developer.chrome.com/blog/new-in-chrome-145) |
| Chrome 146 | [New in Chrome 146](https://developer.chrome.com/blog/new-in-chrome-146) |
| Chrome 147 | [New in Chrome 147](https://developer.chrome.com/blog/new-in-chrome-147) |


## Chrome 145（2026-02-10）


### 1. 设备绑定会话凭证（DBSC）

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

### 2. Sanitizer API

浏览器原生 HTML 净化接口，无需引入第三方库（如 DOMPurify）即可安全地处理用户输入 HTML，移除可执行脚本等危险内容，构建防 XSS 应用更轻松。Firefox 已同步支持。

```js
const sanitizer = new Sanitizer();
element.setHTML(untrustedHTML, { sanitizer });
```
可以替换 `DomSanitizer` 使用

```js
import { DomSanitizer, SafeHtml } from '@angular/platform-browser'; 
```

👉 [MDN 文档：HTML Sanitizer API](https://developer.mozilla.org/docs/Web/API/HTML_Sanitizer_API)

---


