# 34: Performance Optimization

## 📊 Measuring Performance

Use `performance.now()` for precise elapsed-time measurements. The User Timing API (`performance.mark` / `performance.measure`) lets you label spans that appear as named regions in the DevTools Performance flame chart.

```js
// High-resolution timer
const start = performance.now();
expensiveOperation();
const end = performance.now();
console.log(`Took ${end - start}ms`);

// Mark and measure (User Timing API)
performance.mark("start-render");
renderUI();
performance.mark("end-render");
performance.measure("render", "start-render", "end-render");

const [measure] = performance.getEntriesByName("render");
console.log(`Render: ${measure.duration}ms`);

// Clear marks
performance.clearMarks();
performance.clearMeasures();

// Navigation / Resource timing
performance.getEntriesByType("navigation")[0]; // page load
performance.getEntriesByType("resource");       // asset loads
```

---

## 🔁 Loop Optimization

The most common loop bottlenecks are redundant DOM queries and property lookups inside the loop body. Cache elements and lengths in variables before the loop, use `for...of` for clean iteration, and choose short-circuiting methods like `find` and `some` when you only need the first match.

```js
// ❌ Slow — recalculates arr.length every iteration
for (let i = 0; i < arr.length; i++) { ... }

// ✅ Cache length
for (let i = 0, len = arr.length; i < len; i++) { ... }

// ✅ for...of is clean and modern (comparable performance)
for (const item of arr) { ... }

// ❌ forEach cannot break early
arr.forEach(item => { if (item === target) break; }); // SyntaxError

// ✅ Use for...of to break early
for (const item of arr) {
  if (item === target) break;
}

// ✅ Use appropriate method for the task
arr.find(x => x.id === id);      // stops at first match
arr.some(x => x.age > 18);       // short-circuits
arr.every(x => x.active);        // short-circuits at first false

// ❌ Repeated expensive lookups
for (const item of items) {
  document.getElementById("container").appendChild(createEl(item)); // DOM query each time!
}

// ✅ Cache the reference
const container = document.getElementById("container");
for (const item of items) {
  container.appendChild(createEl(item));
}
```

---

## 🏗️ DOM Batching

DOM manipulation is expensive — minimize reflows and repaints.

```js
// ❌ Causes layout thrash — read interleaved with write
const heights = items.map(el => el.offsetHeight);
items.forEach(el => el.style.height = "100px");

// ✅ Batch reads, then writes
const heights = items.map(el => el.offsetHeight);  // all reads first
items.forEach(el => el.style.height = "100px");    // then all writes

// ✅ DocumentFragment — build off-DOM, then insert once
const fragment = document.createDocumentFragment();
for (let i = 0; i < 1000; i++) {
  const li = document.createElement("li");
  li.textContent = `Item ${i}`;
  fragment.appendChild(li);
}
ul.appendChild(fragment);  // single DOM reflow

// ✅ innerHTML batch update (careful of XSS!)
ul.innerHTML = items.map(x => `<li>${sanitize(x.name)}</li>`).join("");

// ✅ requestAnimationFrame for visual updates
function animate() {
  updatePositions();
  requestAnimationFrame(animate);
}
requestAnimationFrame(animate);

// ✅ CSS class toggle instead of many style changes
el.classList.add("expanded");  // single reflow
// vs
el.style.height   = "200px";
el.style.opacity  = "1";
el.style.overflow = "visible";  // 3 potential reflows
```

---

## 📦 Virtual DOM / List Virtualization

When rendering thousands of list items, only the visible ones should exist in the DOM. A virtual list calculates which items are in the viewport based on scroll position and renders just those, keeping DOM node count constant regardless of data size.

```js
// Only render visible items (virtual scroll)
class VirtualList {
  #container;
  #data;
  #itemHeight;
  #visibleCount;

  constructor(container, data, itemHeight = 40) {
    this.#container    = container;
    this.#data         = data;
    this.#itemHeight   = itemHeight;
    this.#visibleCount = Math.ceil(window.innerHeight / itemHeight) + 2; // buffer
    this.#render();
    container.addEventListener("scroll", () => this.#render());
  }

  #render() {
    const scrollTop   = this.#container.scrollTop;
    const startIndex  = Math.floor(scrollTop / this.#itemHeight);
    const endIndex    = Math.min(startIndex + this.#visibleCount, this.#data.length);
    const totalHeight = this.#data.length * this.#itemHeight;

    this.#container.innerHTML = `
      <div style="height:${totalHeight}px;position:relative">
        ${this.#data.slice(startIndex, endIndex).map((item, i) => `
          <div style="position:absolute;top:${(startIndex + i) * this.#itemHeight}px;height:${this.#itemHeight}px">
            ${item.name}
          </div>
        `).join("")}
      </div>`;
  }
}
```

---

## 🚀 Code Splitting & Lazy Loading

Split your bundle so users only download the code they need for the current page or action. Use dynamic `import()` to load modules on demand — on button click, route change, or when an element becomes visible.

```js
// Dynamic import — load only when needed
const loadChart = async () => {
  const { Chart } = await import("./chart.js");
  return new Chart(canvas, config);
};

button.addEventListener("click", async () => {
  const chart = await loadChart();
  chart.render(data);
});

// Route-based code splitting (React / Vite)
const AdminPage = lazy(() => import("./pages/Admin.jsx"));

// Lazy load images
const observer = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      const img   = entry.target;
      img.src     = img.dataset.src;
      img.onload  = () => img.classList.add("loaded");
      observer.unobserve(img);
    }
  });
}, { rootMargin: "200px" });

document.querySelectorAll("img[data-src]").forEach(img => observer.observe(img));
```

---

## ♻️ Memoization & Caching

Memoization caches the result of a pure function so repeated calls with the same arguments return instantly. Use a simple Map-based cache for most cases, or an LRU cache with a bounded size to prevent unbounded memory growth.

```js
// React useMemo equivalent for plain JS
function createMemoized(fn) {
  let lastArgs, lastResult;
  return function(...args) {
    if (lastArgs && args.every((a, i) => a === lastArgs[i])) {
      return lastResult;
    }
    lastArgs   = args;
    lastResult = fn(...args);
    return lastResult;
  };
}

// LRU Cache
class LRUCache {
  #cache;
  #capacity;

  constructor(capacity) {
    this.#capacity = capacity;
    this.#cache    = new Map();  // Map preserves insertion order
  }

  get(key) {
    if (!this.#cache.has(key)) return null;
    // Move to end (most recent)
    const value = this.#cache.get(key);
    this.#cache.delete(key);
    this.#cache.set(key, value);
    return value;
  }

  put(key, value) {
    if (this.#cache.has(key)) this.#cache.delete(key);
    else if (this.#cache.size >= this.#capacity) {
      // Delete oldest (first item in Map)
      this.#cache.delete(this.#cache.keys().next().value);
    }
    this.#cache.set(key, value);
  }
}
```

---

## ⏳ Debounce, Throttle & Task Scheduling

For non-urgent work, `requestIdleCallback` defers execution to idle browser time. `queueMicrotask` schedules work after the current synchronous task but before the next macrotask. Yielding to the main thread periodically with `setTimeout(fn, 0)` keeps the UI responsive during long-running processing loops.

```js
// requestIdleCallback — run non-urgent work during idle time
requestIdleCallback((deadline) => {
  while (deadline.timeRemaining() > 0 && tasks.length > 0) {
    processTask(tasks.shift());
  }
  if (tasks.length > 0) requestIdleCallback(processIdleTasks);
});

// queueMicrotask — run after current operation, before next macrotask
queueMicrotask(() => { /* runs before any setTimeout */ });

// setTimeout(fn, 0) — yield to browser for a paint
function yieldToMain() {
  return new Promise(resolve => setTimeout(resolve, 0));
}

async function runChunked(tasks) {
  for (let i = 0; i < tasks.length; i++) {
    tasks[i]();
    if (i % 50 === 0) await yieldToMain();  // yield every 50 tasks
  }
}
```

---

## 🧠 String & Object Performance Tips

For large datasets: join strings with `Array.join` instead of `+=` in loops, use `Set` for O(1) membership checks instead of `Array.includes`, and prefer a single-pass `reduce` over chained `filter().map()` when you need both operations at once.

```js
// ❌ String concatenation in loop
let html = "";
for (const item of items) html += `<li>${item}</li>`;

// ✅ Use array join
const html = items.map(item => `<li>${item}</li>`).join("");

// ✅ Use Set for O(1) lookups
const allowedRoles = new Set(["admin", "editor", "viewer"]);
allowedRoles.has("admin");  // O(1) vs array includes O(n)

// ✅ Use Map for object-like structures with many dynamic keys
const cache = new Map();  // faster than plain object for frequent add/delete

// ✅ Avoid creating unnecessary intermediate arrays
// ❌
arr.filter(x => x > 0).map(x => x * 2).reduce((a, b) => a + b, 0);
// ✅ Single pass
arr.reduce((sum, x) => x > 0 ? sum + x * 2 : sum, 0);

// ✅ Use typed arrays for numeric data
const positions = new Float32Array(numParticles * 2);  // much faster than Array
const ids       = new Uint32Array(numItems);
```

---

## 🔑 Key Takeaways

- Use `performance.now()` for micro-benchmarks; DevTools Performance tab for profiling.
- Batch DOM reads before DOM writes to avoid layout thrashing.
- `DocumentFragment` batches DOM insertions into a single reflow.
- Use `IntersectionObserver` for lazy loading — never scroll listeners.
- `requestIdleCallback` for non-urgent background tasks.
- Code-split with dynamic `import()` to reduce initial bundle size.
- `Set` lookups are O(1); prefer over `Array.includes` for large collections.
- Memoize expensive pure functions; use LRU cache with bounded size.
- Yield to the browser with `setTimeout(fn, 0)` for long-running tasks.
- Virtual scrolling is essential for rendering thousands of items.

---

[← Previous: Regular Expressions](39-regex.md) | [Contents](README.md) | [Next: Memory Management & Garbage Collection →](41-memory-management.md)
