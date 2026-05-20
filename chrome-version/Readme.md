# Request.isReloadNavigation Demo (Fixed)

## 上一版的问题

刷新页面时,浏览器只发出 **navigation 请求**(请求 HTML),并不会自动去请求 `/api/user`。我之前把 `isReloadNavigation` 的判断写在 API 请求的分支里,等于永远不会被触发。刷新后要手动点按钮才能看到数据 —— 体验不到"自动还原"的效果。

## 这一版的修复

两步联动:

1. **SW 在 navigation 请求里捕获 `event.request.isReloadNavigation`**,如果是 `true`,记一个时间戳到 SW 内存里。
2. **页面 `load` 后主动发起 `fetch('/api/user')`**。SW 拦截这个请求时,查看"最近 5 秒内是否发生过 reload navigation",是就返回 Cache。

这样刷新才会有可观察的效果:score 保持不变 + 响应头 `X-Served-By: cache`。

## 运行

```bash
cd 项目目录
npx serve .
# 或
python3 -m http.server 8080
```

打开 `http://localhost:端口/`。

## 操作步骤

| 动作 | 预期结果 |
|---|---|
| 首次打开 | 状态栏:"SW 已安装但未控制当前页面,请按 F5 刷新" |
| 第 1 次 F5 | SW 接管,页面自动 fetch,显示 `Fresh from network`,比如 score = 3821 |
| 第 2 次 F5 | 面板 `isReloadNavigation: true`,score 仍是 3821,带 `⚡ Served from Cache` |
| 点"手动 Fetch" | 每次都是新数据(点击不是 reload) |
| 点"清除 Cache" | 再刷新会回到 `Fresh from network` |

## 浏览器支持

- ✅ Chrome / Edge / Firefox:`request.isReloadNavigation` 正常返回 true/false
- ⚠️ Safari:属性为 `undefined`,`=== true` 判定为 false,退化为正常走网络(不报错)