# 35: Memory Management

## 🔄 How JavaScript GC Works

JavaScript uses **automatic garbage collection** — the engine reclaims memory no longer reachable from the root set of references (global, call stack).

### Mark-and-Sweep Algorithm

1. **Mark**: Start from roots (global, stack), traverse all reachable objects and mark them.
2. **Sweep**: Reclaim memory occupied by unmarked (unreachable) objects.
3. **Compact** (optional): Defragment the heap.

```js
// Object becomes garbage when no references remain
function example() {
  let obj = { data: new Array(1000000) };
  return 42;
  // obj falls out of scope → no reference → eligible for GC
}
example();
// obj reclaimed after the call
```

---

## 💧 Common Memory Leaks

### 1. Forgotten Timers / Intervals

```js
// ❌ Interval holds reference to callback + outer scope
function startTracking() {
  const data = collectData();
  const interval = setInterval(() => {
    sendData(data);  // data never freed!
  }, 1000);
  // interval never cleared — leaks both interval AND data
}

// ✅ Store the interval ID and clear it
function startTracking() {
  const data = collectData();
  const interval = setInterval(() => sendData(data), 1000);
  return () => clearInterval(interval);  // return cleanup function
}

const stop = startTracking();
// Later:
stop();
```

---

### 2. Detached DOM Nodes

```js
// ❌ Reference to removed element locks entire subtree in memory
const removed = [];
function removeButton(btn) {
  btn.remove();
  removed.push(btn);  // still referenced! Not GC'd
}

// ✅ Nullify when done
function removeButton(btn) {
  btn.remove();
  // don't keep a reference
}

// ❌ Event listener on detached node — subtree stays in memory
const container = document.querySelector("#container");
const btn = document.createElement("button");
container.appendChild(btn);
btn.addEventListener("click", heavyHandler);
container.removeChild(btn);  // btn is detached but listener keeps it alive!

// ✅ Remove listener before detaching, or use AbortController
const ac = new AbortController();
btn.addEventListener("click", handler, { signal: ac.signal });
ac.abort();  // removes all listeners registered with this signal
container.removeChild(btn);
```

---

### 3. Closures Holding Large Data

```js
// ❌ Closure captures entire large object even if only one field needed
function processLargeData(largeObj) {
  const id = largeObj.id;
  const data = largeObj.data;  // 100MB array

  return function handleResult(result) {
    console.log(`Item ${id}: ${result}`);
    // data is also captured in closure even though unused here!
  };
}

// ✅ Only capture what you need
function processLargeData(largeObj) {
  const id = largeObj.id;  // extract only what's needed
  // largeObj goes out of scope — can be GC'd

  return function handleResult(result) {
    console.log(`Item ${id}: ${result}`);
  };
}
```

---

### 4. Global Variable Accumulation

```js
// ❌ Accidental global
function badFunction() {
  result = [];          // missing let/const/var — creates window.result!
  for (let i = 0; i < 1000000; i++) result.push(i);
}

// ❌ Growing global cache without eviction
const cache = {};  // module-level global
function getCached(key) {
  cache[key] ??= expensiveCompute(key);
  return cache[key];
}
// cache grows forever!

// ✅ Bounded LRU cache or WeakMap
const cache = new Map();
const MAX_SIZE = 100;
function getCached(key) {
  if (!cache.has(key)) {
    if (cache.size >= MAX_SIZE) {
      cache.delete(cache.keys().next().value);  // evict oldest
    }
    cache.set(key, expensiveCompute(key));
  }
  return cache.get(key);
}
```

---

### 5. Event Listener Accumulation

```js
// ❌ Adding same listener multiple times (without deduplication)
function initButton() {
  document.querySelector("#btn").addEventListener("click", handler);
}
initButton();  // called on each re-render → duplicate listeners!

// ✅ Remove before adding
function initButton() {
  const btn = document.querySelector("#btn");
  btn.removeEventListener("click", handler);
  btn.addEventListener("click", handler);
}

// ✅ Or use { once: true } for one-off events
btn.addEventListener("click", handler, { once: true });

// ✅ AbortController for bulk cleanup
class Component {
  #ac = new AbortController();

  bind() {
    const signal = this.#ac.signal;
    window.addEventListener("resize", this.#onResize.bind(this), { signal });
    document.addEventListener("keydown", this.#onKey.bind(this), { signal });
    // ... more listeners
  }

  destroy() {
    this.#ac.abort();  // removes ALL listeners at once
  }
}
```

---

## 🪝 WeakRef & FinalizationRegistry
`WeakRef` holds a reference to an object without preventing garbage collection — call `.deref()` to get the object, which returns `undefined` once it's been collected. `FinalizationRegistry` lets you register a cleanup callback that fires after the GC reclaims an object.
```js
// WeakRef — weak reference that doesn't prevent GC
let bigObject = { data: new Array(1000000).fill(0) };
const ref = new WeakRef(bigObject);

function getObject() {
  const obj = ref.deref();  // returns object OR undefined if GC'd
  if (!obj) {
    console.log("Object was garbage collected");
    return null;
  }
  return obj;
}

bigObject = null;  // no strong reference left
// GC may reclaim the object; ref.deref() returns undefined

// FinalizationRegistry — callback after GC
const registry = new FinalizationRegistry((heldValue) => {
  console.log(`${heldValue} was garbage collected`);
  cleanupResource(heldValue);
});

const target = { id: 42 };
registry.register(target, "resource-42");  // heldValue = "resource-42"

// Cache with automatic eviction
class WeakCache {
  #refs = new Map();       // key → WeakRef
  #registry;

  constructor() {
    this.#registry = new FinalizationRegistry(key => {
      if (!this.#refs.get(key)?.deref()) {
        this.#refs.delete(key);  // clean up stale entry
      }
    });
  }

  set(key, value) {
    this.#refs.set(key, new WeakRef(value));
    this.#registry.register(value, key);
  }

  get(key) {
    return this.#refs.get(key)?.deref();
  }
}
```

---

## 🔍 Detecting Memory Leaks (DevTools)

Use the Memory tab in Chrome DevTools to take heap snapshots before and after an operation and compare them. Objects that should have been freed but remain in the "after" snapshot are leak candidates. The Retainers panel shows exactly what is keeping each object alive.

```
Chrome DevTools → Memory tab:

1. Heap Snapshot
   - Take before operation, perform action, take after
   - Look for objects that should have been freed

2. Allocation Timeline
   - Record heap allocations over time
   - Peaks that don't come back down = potential leak

3. Allocation Sampling
   - Lightweight profiling of allocation hotspots

Tips:
- Use "Retainers" panel to see what holds an object alive
- Filter snapshot by class name to find unexpected instances
- "Detached DOM trees" filter — find detached nodes
```

---

## 🧮 Memory-Efficient Patterns

For large data: stream files in chunks instead of loading them entirely, use typed arrays (`Float32Array`, `Uint32Array`) for numeric datasets (no per-element boxing overhead), and apply object pooling for high-frequency allocations like game particles — reuse objects instead of creating and discarding them every frame.

```js
// ✅ Process large data in chunks (streaming)
async function processLargeFile(file) {
  const reader = file.stream().getReader();
  const decoder = new TextDecoder();
  let buffer = "";

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    buffer += decoder.decode(value, { stream: true });
    processChunk(buffer);
    buffer = "";  // free memory as we go
  }
}

// ✅ Typed arrays for large numeric datasets
// 1M numbers: regular Array ≈ 8+ MB;  Float64Array ≈ 8 MB (no boxing overhead)
const coords = new Float32Array(1_000_000 * 2);  // x,y pairs

// ✅ Object pools — reuse objects instead of creating new ones
class Particle {
  reset(x, y, vx, vy) { this.x = x; this.y = y; this.vx = vx; this.vy = vy; }
}

class ParticlePool {
  #pool = [];

  acquire(x, y, vx, vy) {
    const p = this.#pool.pop() ?? new Particle();
    p.reset(x, y, vx, vy);
    return p;
  }

  release(particle) {
    this.#pool.push(particle);  // return to pool instead of GC
  }
}
```

---

## 🔑 Key Takeaways

- JS uses mark-and-sweep GC — objects are freed when no longer reachable.
- Main leak causes: timers not cleared, detached DOM with listeners, over-capturing closures, growing global collections.
- Always clear `setInterval` and `setTimeout` references when done.
- Use `AbortController` to bulk-remove event listeners on component teardown.
- `WeakMap` / `WeakSet` / `WeakRef` hold weak references — won't prevent GC.
- `FinalizationRegistry` allows cleanup callbacks after GC.
- Use DevTools Heap Snapshot to identify unexpected retained objects.
- Object pools reduce GC pressure in high-frequency allocation scenarios.
- Only capture the minimum needed in closures — don't accidentally retain large data.

---

[← Previous: Performance Optimization](40-performance.md) | [Contents](README.md) | [Next: Testing (Jest / Vitest) →](42-testing.md)
