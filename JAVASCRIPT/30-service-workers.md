# 43: Service Workers

A **Service Worker** is a JavaScript file that runs in a background thread, separate from the main page. It acts as a programmable network proxy, enabling offline support, background sync, push notifications, and PWA capabilities.

> Service Workers are distinct from Web Workers (covered in [23-web-apis.md](23-web-apis.md)). Web Workers are for CPU tasks; Service Workers intercept network requests.

---

## 🏗️ Registration

Register a service worker from your main JavaScript file, usually during the `load` event. The browser installs it asynchronously — the registration object lets you check its scope, monitor lifecycle state, and manually trigger an update check.

```js
// In your main JS (app.js / main.js)
if ("serviceWorker" in navigator) {
  window.addEventListener("load", async () => {
    try {
      const reg = await navigator.serviceWorker.register("/sw.js", {
        scope: "/",   // default: same directory as sw.js
      });
      console.log("SW registered:", reg.scope);
    } catch (err) {
      console.error("SW registration failed:", err);
    }
  });
}

// Check current registration
const reg = await navigator.serviceWorker.getRegistration();
reg?.scope;        // "/https://example.com/"
reg?.active;       // ServiceWorker instance (or null)
reg?.installing;   // while installing
reg?.waiting;      // installed but waiting to activate

// Update the service worker manually
await reg.update();

// Unregister
await reg.unregister();   // returns true if successful
```

---

## 🔄 Lifecycle

A service worker progresses through install, waiting, and activate phases before it controls any pages. The waiting phase ensures existing tabs keep using the old worker until they're closed — call `skipWaiting()` and `clients.claim()` to take over immediately.

```
Registration
     │
     ▼
  Installing  ──(error)──→ Redundant
     │
     ▼
  Installed / Waiting   ← (waits for old clients to close)
     │
     ▼
  Activating
     │
     ▼
  Activated  ←─────────── controls all in-scope pages
```

### install event

```js
// sw.js
const CACHE_NAME = "v1";
const PRECACHE_ASSETS = [
  "/",
  "/index.html",
  "/style.css",
  "/app.js",
  "/logo.png",
];

self.addEventListener("install", (event) => {
  // Extend the install event until caching is done
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log("Pre-caching assets");
      return cache.addAll(PRECACHE_ASSETS);   // fails entirely if any asset fails
    })
  );

  // Skip the waiting phase — activate immediately
  // self.skipWaiting();  // uncomment for instant takeover (use carefully)
});
```

### activate event

```js
self.addEventListener("activate", (event) => {
  // Clean up old caches
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames
          .filter((name) => name !== CACHE_NAME)  // delete old versions
          .map((name) => caches.delete(name))
      );
    })
  );

  // Take control of all open pages immediately (don't wait for reload)
  event.waitUntil(self.clients.claim());
});
```

---

## 🌐 Fetch Interception

The `fetch` event fires for every network request made by controlled pages.

```js
self.addEventListener("fetch", (event) => {
  // Must respond synchronously via event.respondWith()
  event.respondWith(handleFetch(event.request));
});

async function handleFetch(request) {
  const cached = await caches.match(request);
  if (cached) return cached;

  try {
    const response = await fetch(request);
    return response;
  } catch {
    // Network failed — return fallback
    return caches.match("/offline.html");
  }
}
```

---

## 📦 Caching Strategies

### 1. Cache First (best for static assets)
```js
async function cacheFirst(request) {
  const cached = await caches.match(request);
  if (cached) return cached;

  const response = await fetch(request);
  const cache    = await caches.open(CACHE_NAME);
  cache.put(request, response.clone());   // clone — body can only be read once
  return response;
}
```

### 2. Network First (best for API data / fresh content)
```js
async function networkFirst(request) {
  try {
    const response = await fetch(request);
    const cache    = await caches.open(CACHE_NAME);
    cache.put(request, response.clone());
    return response;
  } catch {
    return caches.match(request);  // fall back to cache
  }
}
```

### 3. Stale-While-Revalidate (best for content that can be slightly stale)
```js
async function staleWhileRevalidate(request) {
  const cache  = await caches.open(CACHE_NAME);
  const cached = await cache.match(request);

  // Fetch in background to update cache
  const fetchPromise = fetch(request).then((response) => {
    cache.put(request, response.clone());
    return response;
  });

  // Return cached immediately, or wait for network
  return cached ?? fetchPromise;
}
```

### 4. Cache Only (pre-cached offline assets)
```js
async function cacheOnly(request) {
  return caches.match(request);
}
```

### 5. Network Only (no caching — analytics, POSTs)
```js
async function networkOnly(request) {
  return fetch(request);
}
```

### Routing by request type
```js
self.addEventListener("fetch", (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Don't intercept non-GET or cross-origin
  if (request.method !== "GET") return;
  if (url.origin !== self.location.origin) return;

  if (url.pathname.startsWith("/api/")) {
    event.respondWith(networkFirst(request));
  } else if (/\.(js|css|png|jpg|svg|woff2)$/.test(url.pathname)) {
    event.respondWith(cacheFirst(request));
  } else {
    event.respondWith(staleWhileRevalidate(request));
  }
});
```

---

## 💾 Cache API

The Cache API stores `Request`/`Response` pairs, allowing you to serve assets without hitting the network. You can open named caches, add or put entries, query them with `match`, and delete stale entries during the activate event.

```js
// Open / create a cache
const cache = await caches.open("my-cache-v1");

// Add a single URL
await cache.add("/data.json");         // fetches and caches

// Add multiple URLs
await cache.addAll(["/a.js", "/b.css"]);

// Manually put a response
const response = await fetch("/data.json");
await cache.put("/data.json", response);

// Read
const cached = await cache.match("/data.json");
const allCached = await cache.matchAll("/data.json", { ignoreSearch: true });

// Delete an entry
await cache.delete("/old-asset.js");

// List all cache names
const names = await caches.keys();

// Delete a whole cache
await caches.delete("my-cache-v1");

// Cache match options
caches.match(request, {
  ignoreSearch: true,   // ignore query string
  ignoreMethod: false,
  ignoreVary:   false,
});
```

---

## 📬 Push Notifications

Push notifications require the user's permission, a VAPID key pair for server authentication, and a push subscription sent to your server. The service worker listens for `push` events to display the notification, and `notificationclick` to handle user interaction.

```js
// 1. Request permission
const permission = await Notification.requestPermission();
if (permission !== "granted") return;

// 2. Subscribe to push
const reg  = await navigator.serviceWorker.ready;
const sub  = await reg.pushManager.subscribe({
  userVisibleOnly: true,
  applicationServerKey: urlBase64ToUint8Array("YOUR_VAPID_PUBLIC_KEY"),
});

// 3. Send subscription to your server (sub.toJSON())
await fetch("/api/push-subscribe", {
  method: "POST",
  body: JSON.stringify(sub),
  headers: { "Content-Type": "application/json" },
});

// 4. In sw.js — handle push event
self.addEventListener("push", (event) => {
  const data = event.data?.json() ?? {};
  event.waitUntil(
    self.registration.showNotification(data.title ?? "Notification", {
      body:    data.body,
      icon:    "/icon-192.png",
      badge:   "/badge-72.png",
      data:    { url: data.url },
      actions: [
        { action: "open", title: "Open" },
        { action: "dismiss", title: "Dismiss" },
      ],
    })
  );
});

// 5. Handle notification click
self.addEventListener("notificationclick", (event) => {
  event.notification.close();
  if (event.action === "dismiss") return;

  event.waitUntil(
    clients.openWindow(event.notification.data?.url ?? "/")
  );
});
```

---

## 🔄 Background Sync

Retry failed requests when the user comes back online.

```js
// In main page — queue a sync when offline
async function sendMessage(data) {
  try {
    await fetch("/api/messages", { method: "POST", body: JSON.stringify(data) });
  } catch {
    // Save to IndexedDB, then register sync
    await saveToQueue(data);
    const reg = await navigator.serviceWorker.ready;
    await reg.sync.register("send-messages");
  }
}

// In sw.js
self.addEventListener("sync", (event) => {
  if (event.tag === "send-messages") {
    event.waitUntil(flushMessageQueue());
  }
});

async function flushMessageQueue() {
  const queue = await getFromQueue();
  await Promise.all(queue.map(item =>
    fetch("/api/messages", { method: "POST", body: JSON.stringify(item) })
      .then(() => removeFromQueue(item.id))
  ));
}
```

---

## 💬 Communicating with the Page

Service workers and the main page communicate via `postMessage`. The worker can broadcast to all controlled clients with `self.clients.matchAll()`, and the page sends messages to the active worker via `navigator.serviceWorker.controller.postMessage()`.

```js
// From sw.js → page (broadcast)
self.clients.matchAll().then((clients) => {
  clients.forEach((client) => client.postMessage({ type: "CACHE_UPDATED" }));
});

// From page → service worker
navigator.serviceWorker.controller?.postMessage({ type: "SKIP_WAITING" });

// Listen in page
navigator.serviceWorker.addEventListener("message", (event) => {
  console.log("SW says:", event.data);
});

// Listen in sw.js
self.addEventListener("message", (event) => {
  if (event.data.type === "SKIP_WAITING") {
    self.skipWaiting();
  }
  // Reply back to sender
  event.source?.postMessage({ type: "ACK" });
});
```

---

## 📱 PWA Manifest

Service Workers enable Progressive Web Apps (PWAs). A `manifest.json` makes the site installable.

```json
{
  "name": "My App",
  "short_name": "App",
  "description": "An awesome PWA",
  "start_url": "/",
  "display": "standalone",
  "background_color": "#ffffff",
  "theme_color": "#0f172a",
  "icons": [
    { "src": "/icon-192.png", "sizes": "192x192", "type": "image/png" },
    { "src": "/icon-512.png", "sizes": "512x512", "type": "image/png" },
    { "src": "/icon-maskable.png", "sizes": "512x512", "type": "image/png", "purpose": "maskable" }
  ]
}
```

```html
<!-- In <head> -->
<link rel="manifest" href="/manifest.json" />
<meta name="theme-color" content="#0f172a" />
```

---

## ⚠️ Important Constraints

Service workers require HTTPS (or `localhost`), run in their own global scope (`self`, not `window`), and cannot access the DOM or `localStorage`. They only control pages under the directory where `sw.js` is located, so place it at the root to cover the entire site.

```js
// Service Workers only work on HTTPS (or localhost for development)

// sw.js scope — only controls pages under the sw.js directory
// Placing sw.js at /app/sw.js → only controls /app/** pages
// Place at root /sw.js to control the whole site

// Cannot access DOM directly
// Cannot use synchronous XHR or localStorage
// Use IndexedDB for persistent storage in a service worker

// self is the global scope (not window) inside a service worker
self.addEventListener("fetch", ...);
self.clients;
self.registration;
```

---

## 🔑 Key Takeaways

- Service Workers run in a **background thread** and intercept all network requests for in-scope pages.
- They enable **offline support** via the Cache API and caching strategies.
- **Lifecycle**: install → waiting → activate → controlling. Use `skipWaiting()` + `clients.claim()` for instant takeover.
- Choose the right caching strategy: cache-first for static assets, network-first for API data, stale-while-revalidate for content.
- **Push notifications** require VAPID keys and server-side push (Web Push Protocol).
- **Background Sync** retries failed requests when connectivity is restored.
- Service Workers require **HTTPS** (except localhost) and cannot use `localStorage` or the DOM.

---

[← Previous: Forms & Validation](29-forms.md) | [Contents](README.md) | [Next: Modules (import / export) →](31-modules.md)
