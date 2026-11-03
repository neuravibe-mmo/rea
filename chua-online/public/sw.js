/**
 * Chùa Sen - Service Worker (PWA Offline Caching & Instant Load)
 */

const CACHE_NAME = "chua-sen-pwa-v3";
const PRECACHE_ASSETS = [
  "./",
  "./index.html",
  "./manifest.webmanifest",
  "./favicon.svg",
  "./og.png",
  "./icons/icon-192.png",
  "./icons/icon-512.png",
  "./icons/apple-touch-icon.png",
  "./images/gioi-thieu.png",
  "./images/huong-dan-di-chua-online.png",
  "./images/quan-the-am-bo-tat.png",
  "./images/cay-bo-de.png",
  "./images/tha-den-hoa-dang.png",
  "./images/thap-huong-online.png",
  "./images/thien-online.png",
  "./images/niem-phat-online.png",
];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches
      .open(CACHE_NAME)
      .then((cache) => {
        return cache.addAll(PRECACHE_ASSETS);
      })
      .then(() => self.skipWaiting()),
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) => {
        return Promise.all(
          keys.map((key) => {
            if (key !== CACHE_NAME) {
              return caches.delete(key);
            }
          }),
        );
      })
      .then(() => self.clients.claim()),
  );
});

self.addEventListener("fetch", (event) => {
  const req = event.request;
  const url = new URL(req.url);

  // Bỏ qua các request không phải GET hoặc kết nối WebSocket / API máy chủ
  if (
    req.method !== "GET" ||
    url.protocol.startsWith("ws") ||
    url.pathname.startsWith("/lobby")
  ) {
    return;
  }

  // Chiến lược: Stale-While-Revalidate cho tài nguyên tĩnh (assets, scripts, styles)
  event.respondWith(
    caches.match(req).then((cachedResponse) => {
      const fetchPromise = fetch(req)
        .then((networkResponse) => {
          if (
            networkResponse &&
            networkResponse.status === 200 &&
            networkResponse.type === "basic"
          ) {
            const responseToCache = networkResponse.clone();
            caches.open(CACHE_NAME).then((cache) => {
              cache.put(req, responseToCache);
            });
          }
          return networkResponse;
        })
        .catch(() => {
          // Nếu offline và đang tải trang, trả về index.html từ cache
          if (req.mode === "navigate") {
            return caches.match("./index.html");
          }
          return cachedResponse;
        });

      return cachedResponse || fetchPromise;
    }),
  );
});
