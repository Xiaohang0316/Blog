# Weekly Knowledge Share  
## NgOptimizedImage
### 什么是 NgOptimizedImage
  NgOptimizedImage 是 Angular 提供的一个图像优化指令，用于替代标准的 <img> 标签。它通过内置最佳实践，自动完成图片懒加载、响应式尺寸、加载优先级等优化策略，显著提升 LCP（Largest Contentful Paint）等关键性能指标

### NgOptimizedImage 可以做什么
| 功能点             | 描述                             |
| --------------- | ------------------------------ |
| ✅ 自动懒加载         | 只有在图片进入视口时才加载                  |
| ✅ 自动生成 `srcset` | 根据屏幕尺寸加载合适分辨率的图片               |
| ✅ 支持优先级加载       | 使用 `priority` 属性优化 LCP 图片      |
| ✅ 支持 CDN 加载器    | 可配置如 Cloudinary、ImageKit 等图像服务 |
| ✅ 填充模式（实验）      | 无需设置宽高，自动适应容器尺寸                |

##### 自动懒加载


##### 自动生成 srcset

##### 支持优先级加载

##### 支持 CDN 加载器

##### 填充模式（实验）


###  性能对比：使用前后数据

| 指标    | 普通 `<img>` | `NgOptimizedImage` | 提升     |
| ----- | ---------- | ------------------ | ------ |
| LCP   | 3.2s       | 1.4s               | ⚡️ 56% |
| 总图片体积 | 5.8MB      | 2.1MB              | 📉 64% |
| 加载请求数 | 5          | 3（懒加载）             | 📉 40% |




### NgOptimizedImage 如何工作
  - 指令拦截渲染：通过 Angular 指令系统，替换原生 <img> 标签。
  - 加载器系统：支持自定义图像加载器（如 Cloudinary），自动生成优化 URL。
  - 优先级调度：使用 priority 标记 LCP 图片，提前加载。
  - 懒加载策略：使用 IntersectionObserver 判断图片是否进入视口。
  - 响应式生成 srcset：根据图片尺寸与设备像素比，自动生成多分辨率地址。
