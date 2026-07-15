### Task 7: Service Worker — Offline App Shell

**Files:**
- Create: `service-worker.js`
- Modify: `index.html` — register service worker

**Interfaces:**
- Produces: Offline-capable app. On first load, caches all app files + data JSONs. On subsequent offline visits, app loads and all data is navigable.

- [ ] **Step 1: Create service-worker.js**

```javascript
const CACHE = '9lectures-v1';
const ASSETS = [
  '/',
  '/index.html',
  '/app.js',
  '/styles.css',
  '/data/subjects.json',
  '/data/math.json',
  '/data/physics.json',
  '/data/chemistry.json',
  '/data/urdu.json',
  '/data/computer.json'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE).then((cache) => {
      return cache.addAll(ASSETS);
    })
  );
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.filter((k) => k !== CACHE).map((k) => caches.delete(k))
      );
    })
  );
  self.clients.claim();
});

self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request).then((cached) => {
      if (cached) return cached;
      return fetch(event.request).then((response) => {
        if (!response || response.status !== 200 || response.type !== 'basic') {
          return response;
        }
        const clone = response.clone();
        caches.open(CACHE).then((cache) => cache.put(event.request, clone));
        return response;
      }).catch(() => {
        // Offline and not in cache — return a fallback
        if (event.request.destination === 'document') {
          return caches.match('/');
        }
        return new Response('Offline', { status: 503 });
      });
    })
  );
});
```

- [ ] **Step 2: Register service worker in index.html**

Add before closing `</body>` tag:

```html
<script>
if ('serviceWorker' in navigator) {
  navigator.serviceWorker.register('/service-worker.js')
    .catch(() => {});
}
</script>
```

- [ ] **Step 3: Verify offline works**

Open app in Chrome. DevTools → Application → Service Workers → confirm registered. Go to Network tab, check "Offline". Reload page. App should load fully, navigate subjects → chapters → sections. Video thumbnails may not load (they're from youtube.com, not cached).

- [ ] **Step 4: Commit**

```bash
git add service-worker.js index.html
git commit -m "feat: add service worker for offline app shell + data caching"
```

---

