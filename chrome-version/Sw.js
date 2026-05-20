// sw.js
// 策略:根据请求头 X-Trigger 决定走 Cache 还是网络。
//   - X-Trigger: reload     → 命中 Cache 就返回 Cache,否则走网络并写入 Cache
//   - X-Trigger: user-click → 永远走网络,并更新 Cache
// 这样既能在刷新后秒显上次数据,又能在用户主动操作时拿到新鲜数据。
//
// Request.isReloadNavigation:依旧在 navigation 请求中读取,用来打印 & 报告页面,
// 证明它确实在 SW 环境下可用。真正的"决策"由页面通过 header 传进来。

console.log('[SW] 脚本加载,时间戳:', Date.now());

const DATA_CACHE = 'user-data-v2';
const API_PATH = '/api/user';

self.addEventListener('install', () => {
  console.log('[SW] install');
  self.skipWaiting();
});

self.addEventListener('activate', (e) => {
  console.log('[SW] activate');
  e.waitUntil(self.clients.claim());
});

async function broadcast(msg) {
  const clients = await self.clients.matchAll({ includeUncontrolled: true });
  clients.forEach((c) => c.postMessage(msg));
}

function buildFreshResponse() {
  const body = JSON.stringify({
    user: 'Alice Chen',
    score: Math.floor(Math.random() * 9000) + 1000,
    fetchedAt: new Date().toISOString(),
  });
  return new Response(body, {
    status: 200,
    headers: {
      'Content-Type': 'application/json',
      'X-Served-By': 'network',
    },
  });
}

self.addEventListener('fetch', (event) => {
  const req = event.request;
  const url = new URL(req.url);

  // A. navigation 请求:读取 isReloadNavigation,报告给页面
  if (req.mode === 'navigate') {
    console.log('[SW] navigate · isReloadNavigation =', req.isReloadNavigation);
    broadcast({
      type: 'nav-info',
      payload: {
        mode: req.mode,
        isReloadNavigation: req.isReloadNavigation === true,
        isHistoryNavigation: req.isHistoryNavigation === true,
      },
    });
    return;
  }

  // B. /api/user 拦截
  if (url.pathname === API_PATH) {
    event.respondWith(handleApi(event));
    return;
  }
});

async function handleApi(event) {
  const req = event.request;
  const trigger = req.headers.get('X-Trigger') || 'unknown';
  const cache = await caches.open(DATA_CACHE);

  console.log('[SW] /api/user · X-Trigger =', trigger);

  if (trigger === 'reload') {
    // 刷新触发 → 优先 Cache
    const cached = await cache.match(API_PATH);
    if (cached) {
      broadcast({
        type: 'api-info',
        payload: { msg: '刷新触发 · 命中 Cache ⚡ 返回上次数据' },
      });
      const body = await cached.clone().text();
      return new Response(body, {
        status: 200,
        headers: {
          'Content-Type': 'application/json',
          'X-Served-By': 'cache',
        },
      });
    }
    broadcast({
      type: 'api-info',
      payload: { msg: '刷新触发但 Cache 为空 · 走网络并写入' },
    });
  } else {
    broadcast({
      type: 'api-info',
      payload: { msg: `${trigger} 触发 · 走网络并更新 Cache` },
    });
  }

  const fresh = buildFreshResponse();
  cache.put(API_PATH, fresh.clone());
  return fresh;
}