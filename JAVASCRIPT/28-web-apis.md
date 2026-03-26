# 23: Web APIs

## 💾 Web Storage

### localStorage
```js
// Persistent — survives browser restarts, no expiry
localStorage.setItem("theme", "dark");
localStorage.getItem("theme");                // "dark"
localStorage.removeItem("theme");
localStorage.clear();                          // removes everything!
localStorage.length;                           // number of items

// Store objects (must serialize)
const user = { name: "Alice", age: 30 };
localStorage.setItem("user", JSON.stringify(user));
const stored = JSON.parse(localStorage.getItem("user") ?? "null");

// Safe helpers
const storage = {
  get: (key, fallback = null) => {
    try { return JSON.parse(localStorage.getItem(key)) ?? fallback; }
    catch { return fallback; }
  },
  set: (key, value) => localStorage.setItem(key, JSON.stringify(value)),
  remove: (key) => localStorage.removeItem(key),
};
```

### sessionStorage
```js
// Like localStorage but cleared when tab/window is closed
sessionStorage.setItem("formData", JSON.stringify(formState));
sessionStorage.getItem("formData");
// Same API as localStorage
```

### Storage Event
```js
// Fires in OTHER tabs (not the one that changed the storage)
window.addEventListener("storage", (event) => {
  event.key;       // changed key
  event.newValue;  // new value
  event.oldValue;  // old value
  event.storageArea; // localStorage or sessionStorage
});
```

---

## 🍪 Cookies (Web API)

Cookies are small key-value strings stored by the browser and automatically sent with HTTP requests to the same domain. They're the traditional mechanism for session management, but require careful handling for expiry, path scoping, and security flags.

```js
// Set cookie
document.cookie = "username=Alice; expires=Fri, 31 Dec 2029 23:59:59 GMT; path=/; Secure; SameSite=Strict";

// Read all cookies (clunky string parsing)
document.cookie; // "username=Alice; theme=dark"

// Parse cookies
function getCookie(name) {
  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  if (parts.length === 2) return parts.pop().split(";").shift();
  return null;
}

// Delete cookie (set past expiry)
document.cookie = "username=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/";

// Better: Use CookieStore API (modern browsers)
await cookieStore.set({ name: "theme", value: "dark", expires: Date.now() + 86400 * 1000 });
const cookie = await cookieStore.get("theme");
await cookieStore.delete("theme");
```

---

## 🔗 URL & History API

The `URL` class makes it easy to parse, construct, and modify URLs without manual string manipulation. The History API lets single-page apps update the browser's URL and history stack without triggering a full page reload.

```js
// URL object — parse and manipulate URLs
const url = new URL("https://example.com/search?q=js&page=2#results");
url.protocol; // "https:"
url.hostname; // "example.com"
url.pathname; // "/search"
url.search;   // "?q=js&page=2"
url.hash;     // "#results"
url.origin;   // "https://example.com"

// Search params
url.searchParams.get("q");      // "js"
url.searchParams.set("q", "javascript");
url.searchParams.append("lang", "en");
url.searchParams.delete("page");
url.searchParams.has("q");      // true
[...url.searchParams];          // [["q","javascript"], ["lang","en"]]
url.toString();                 // full URL string

// URLSearchParams standalone
const params = new URLSearchParams({ name: "Alice", page: 1 });
params.toString(); // "name=Alice&page=1"

// History API — SPA navigation
history.pushState({ page: 2 }, "", "/page/2");  // navigate without reload
history.replaceState({ page: 2 }, "", "/page/2"); // replace without adding history entry
history.back();
history.forward();
history.go(-2);  // go back 2 entries

window.addEventListener("popstate", (e) => {
  const state = e.state;  // { page: 2 }
  renderPage(state);
});
```

---

## 🌍 Geolocation API

`navigator.geolocation` provides the user's physical location (with their permission) via GPS, Wi-Fi triangulation, or IP lookup. Use `getCurrentPosition` for a one-time fix or `watchPosition` for continuous updates.

```js
// Get current position
navigator.geolocation.getCurrentPosition(
  (position) => {
    const { latitude, longitude, accuracy } = position.coords;
    console.log(`Lat: ${latitude}, Lng: ${longitude} (±${accuracy}m)`);
  },
  (error) => {
    switch (error.code) {
      case error.PERMISSION_DENIED: console.log("Denied"); break;
      case error.POSITION_UNAVAILABLE: console.log("Unavailable"); break;
      case error.TIMEOUT: console.log("Timeout"); break;
    }
  },
  { enableHighAccuracy: true, timeout: 5000, maximumAge: 30000 }
);

// Watch position (continuous updates)
const watchId = navigator.geolocation.watchPosition(
  position => updateMap(position.coords),
  handleError
);

// Stop watching
navigator.geolocation.clearWatch(watchId);

// Promise wrapper
function getPosition() {
  return new Promise((resolve, reject) =>
    navigator.geolocation.getCurrentPosition(resolve, reject)
  );
}
const pos = await getPosition();
```

---

## 📋 Clipboard API

The modern async Clipboard API lets you read from and write to the system clipboard programmatically. It requires user gesture and clipboard permission for reading, and works over HTTPS only.

```js
// Copy to clipboard
await navigator.clipboard.writeText("Hello, clipboard!");

// Read from clipboard
const text = await navigator.clipboard.readText();

// Copy with fallback
async function copyToClipboard(text) {
  if (navigator.clipboard) {
    await navigator.clipboard.writeText(text);
  } else {
    // Fallback for older browsers
    const textarea = document.createElement("textarea");
    textarea.value = text;
    document.body.appendChild(textarea);
    textarea.select();
    document.execCommand("copy");
    document.body.removeChild(textarea);
  }
}
```

---

## 🖼️ Canvas API

The `<canvas>` element provides a pixel-based drawing surface. You get a 2D context with methods for drawing rectangles, paths, arcs, images, and text — useful for charts, games, image editors, and data visualizations.

```js
const canvas  = document.querySelector("canvas");
const ctx     = canvas.getContext("2d");

// Shapes
ctx.fillStyle   = "#4CAF50";
ctx.fillRect(10, 10, 100, 80);        // x, y, width, height
ctx.strokeStyle = "#333";
ctx.lineWidth   = 2;
ctx.strokeRect(10, 10, 100, 80);

// Path drawing
ctx.beginPath();
ctx.moveTo(50, 50);
ctx.lineTo(150, 50);
ctx.lineTo(100, 150);
ctx.closePath();
ctx.fill();
ctx.stroke();

// Circle
ctx.beginPath();
ctx.arc(100, 100, 50, 0, Math.PI * 2);
ctx.fill();

// Text
ctx.font = "bold 24px Arial";
ctx.fillStyle = "#333";
ctx.fillText("Hello Canvas", 50, 50);

// Images
const img = new Image();
img.src = "photo.jpg";
img.onload = () => ctx.drawImage(img, 0, 0, 200, 150);

// Get pixel data
const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
// imageData.data is Uint8ClampedArray [R,G,B,A, R,G,B,A, ...]
```

---

## 🔔 Notifications API

The Notifications API lets you show system-level desktop notifications outside the browser tab. The user must explicitly grant permission, and notifications can include icons, actions, and click handlers.

```js
// Request permission
const permission = await Notification.requestPermission();
// "granted", "denied", or "default"

if (permission === "granted") {
  const notification = new Notification("New Message", {
    body: "You have a new message from Alice",
    icon: "/icons/message.png",
    badge: "/icons/badge.png",
    tag: "message-1",           // group similar notifications
    silent: false,
  });

  notification.onclick = () => {
    window.focus();
    notification.close();
  };

  // Auto close after 5s
  setTimeout(() => notification.close(), 5000);
}
```

---

## 🔊 Web Audio API (basics)

The Web Audio API provides a graph-based system for generating and processing audio in the browser — connect source nodes (oscillators, audio files) through processing nodes (gain, filter) to a destination (speakers).

```js
const audioCtx = new AudioContext();

// Play a beep
function playBeep(frequency = 440, duration = 200) {
  const oscillator = audioCtx.createOscillator();
  const gainNode   = audioCtx.createGain();

  oscillator.connect(gainNode);
  gainNode.connect(audioCtx.destination);

  oscillator.frequency.value = frequency;
  oscillator.type = "sine"; // sine, square, sawtooth, triangle

  oscillator.start();
  gainNode.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + duration / 1000);
  oscillator.stop(audioCtx.currentTime + duration / 1000);
}

playBeep(880, 300); // high-pitched beep
```

---

## 👷 Web Workers

Web Workers run JavaScript in a separate background thread, keeping the main UI thread free during expensive computations. They communicate with the main thread via `postMessage` and have no access to the DOM.

```js
// main.js — main thread
const worker = new Worker("worker.js");

worker.postMessage({ data: bigArray, task: "sort" });

worker.onmessage = (event) => {
  console.log("Result:", event.data);
};

worker.onerror = (error) => {
  console.error("Worker error:", error);
};

worker.terminate(); // stop the worker

// worker.js — runs in separate thread (no DOM access)
self.onmessage = (event) => {
  const { data, task } = event.data;

  let result;
  if (task === "sort") {
    result = [...data].sort((a, b) => a - b); // heavy computation
  }

  self.postMessage(result);
};
```

---

## 🔧 Other Useful APIs

The browser provides many small but handy APIs: `performance.now()` for high-resolution timing, `navigator.vibrate()` for haptic feedback, online/offline events for connectivity detection, and `ResizeObserver` for element size change notifications.

```js
// Performance
performance.now();          // high-resolution timestamp (ms)
performance.mark("start");
performance.mark("end");
performance.measure("duration", "start", "end");

// Vibration (mobile)
navigator.vibrate(200);           // vibrate 200ms
navigator.vibrate([100, 50, 200]); // pattern: on 100, off 50, on 200

// Online/Offline
navigator.onLine;  // boolean
window.addEventListener("online",  () => showConnectionStatus("online"));
window.addEventListener("offline", () => showConnectionStatus("offline"));

// Page Visibility
document.addEventListener("visibilitychange", () => {
  if (document.hidden) pauseVideo();
  else resumeVideo();
});

// ResizeObserver — observe element size changes
const ro = new ResizeObserver(entries => {
  entries.forEach(entry => {
    const { width, height } = entry.contentRect;
    adjustLayout(width, height);
  });
});
ro.observe(document.querySelector(".resizable"));
ro.disconnect(); // stop
```

---

## 🔑 Key Takeaways

- `localStorage` persists across sessions; `sessionStorage` is cleared on tab close.
- Never store sensitive data (passwords, tokens) in Web Storage — use HTTP-only cookies.
- The `URL` object is the clean way to parse and build URLs.
- The History API enables SPA navigation without page reloads.
- Web Workers run code on a parallel thread — use for heavy computation.
- `navigator.clipboard` requires HTTPS and permission.
- `IntersectionObserver` and `ResizeObserver` are more performant than scroll/resize event handlers.

---

[← Previous: Events & Event Delegation](27-events.md) | [Contents](README.md) | [Next: Forms & Validation →](29-forms.md)
