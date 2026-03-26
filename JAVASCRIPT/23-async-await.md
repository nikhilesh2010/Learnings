# 19: Async / Await

## ⚡ What is Async/Await?

`async/await` is **syntactic sugar over Promises** — it lets you write asynchronous code that *looks* synchronous, making it dramatically more readable.

```js
// With Promises
function getUser(id) {
  return fetch(`/api/users/${id}`)
    .then(r => r.json())
    .then(user => user.name);
}

// With async/await ✅
async function getUser(id) {
  const response = await fetch(`/api/users/${id}`);
  const user     = await response.json();
  return user.name;  // async function always returns a Promise
}
```

---

## 🔑 async Functions

The `async` keyword before a function declaration causes it to always return a Promise, wrapping any returned value automatically. You can use `async` with regular functions, arrow functions, and class methods.

```js
// async makes a function return a Promise
async function greet() {
  return "Hello!";  // wraps in Promise.resolve("Hello!")
}

greet().then(console.log); // "Hello!"

// If you throw inside, the promise rejects
async function fail() {
  throw new Error("oops");
}
fail().catch(console.error); // Error: oops

// Arrow async functions
const fetchUser = async (id) => {
  const r = await fetch(`/api/users/${id}`);
  return r.json();
};

// Async class methods
class UserService {
  async getUser(id) {
    const r = await fetch(`/api/users/${id}`);
    return r.json();
  }
}
```

---

## ⏳ await

`await` pauses execution of the `async` function until the Promise settles.

```js
async function loadDashboard(userId) {
  const user     = await getUser(userId);       // wait for user
  const orders   = await getOrders(user.id);    // wait for orders
  const settings = await getSettings(user.id);  // wait for settings

  return { user, orders, settings };
}
```

> `await` can only be used inside `async` functions (or at the top level of ES modules).

### Top-Level Await (ES2022 — modules only)
```js
// In a .mjs file or <script type="module">
const data = await fetch("/api/config").then(r => r.json());
console.log(data);  // works at module top level!
```

---

## ❌ Error Handling

### try/catch
```js
async function loadUser(id) {
  try {
    const response = await fetch(`/api/users/${id}`);
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    return await response.json();
  } catch (error) {
    console.error("Failed to load user:", error.message);
    return null;  // return fallback
  } finally {
    hideSpinner(); // always runs
  }
}
```

### Per-await error handling
```js
// Wrap individual awaits when you need per-step control
async function process() {
  let user;
  try {
    user = await getUser(id);
  } catch {
    user = defaultUser;  // fallback
  }

  const orders = await getOrders(user.id); // may still throw
}
```

### The "go" pattern (avoid try/catch verbosity)
```js
// Utility: returns [error, data] tuple
async function go(promise) {
  try {
    return [null, await promise];
  } catch (err) {
    return [err, null];
  }
}

async function loadData() {
  const [err, user] = await go(getUser(1));
  if (err) return handleError(err);

  const [err2, orders] = await go(getOrders(user.id));
  if (err2) return handleError(err2);

  return { user, orders };
}
```

---

## ⚡ Sequential vs Parallel

Awaiting multiple independent operations one after another wastes time — each waits for the previous to finish. Use `Promise.all` to kick off all operations simultaneously and wait for all results at once.

```js
// ❌ Sequential — total time = sum of all waits
async function sequential() {
  const a = await fetchA(); // 1s
  const b = await fetchB(); // 1s
  const c = await fetchC(); // 1s
  // Total: ~3s
  return [a, b, c];
}

// ✅ Parallel with Promise.all — total time = max of all waits
async function parallel() {
  const [a, b, c] = await Promise.all([fetchA(), fetchB(), fetchC()]);
  // Total: ~1s
  return [a, b, c];
}

// ✅ Start all, then await (same as Promise.all but explicit)
async function parallel2() {
  const promiseA = fetchA();  // starts immediately
  const promiseB = fetchB();  // starts immediately
  const promiseC = fetchC();  // starts immediately

  const a = await promiseA;
  const b = await promiseB;
  const c = await promiseC;
  return [a, b, c];
}
```

---

## 🔁 Async Loops

Choose your loop construct carefully: `for...of` processes items one at a time (sequentially), while `Promise.all` with `map` processes them all in parallel. Avoid `forEach` with async callbacks — it won't wait for the async work to finish.

```js
// ✅ Sequential: for...of (use when each iteration depends on previous)
async function processUsersSequentially(users) {
  for (const user of users) {
    await processUser(user);     // waits before next
  }
}

// ✅ Parallel: Promise.all with map
async function processUsersParallel(users) {
  await Promise.all(users.map(user => processUser(user)));
}

// ✅ Controlled concurrency (process N at a time)
async function processBatch(items, batchSize, processor) {
  for (let i = 0; i < items.length; i += batchSize) {
    const batch = items.slice(i, i + batchSize);
    await Promise.all(batch.map(processor));
  }
}

// ❌ forEach doesn't wait for async callbacks
users.forEach(async user => {
  await processUser(user); // forEach doesn't await these!
});
// Use for...of or Promise.all instead ✅
```

---

## ⏰ Timeouts & Cancellation

`fetch` and most async operations don't have built-in timeouts. Use `AbortController` to cancel requests manually, and wrap promises with `Promise.race` to enforce time limits.

```js
// Timeout wrapper
function withTimeout(promise, ms) {
  const timeout = new Promise((_, reject) =>
    setTimeout(() => reject(new Error(`Timed out after ${ms}ms`)), ms)
  );
  return Promise.race([promise, timeout]);
}

async function fetchWithTimeout(url) {
  return withTimeout(fetch(url), 5000);
}

// AbortController — cancel fetch requests
async function fetchUser(id, signal) {
  const response = await fetch(`/api/users/${id}`, { signal });
  return response.json();
}

const controller = new AbortController();

// Cancel after 5 seconds
setTimeout(() => controller.abort(), 5000);

try {
  const user = await fetchUser(1, controller.signal);
} catch (err) {
  if (err.name === "AbortError") {
    console.log("Request was cancelled");
  } else {
    throw err;
  }
}
```

---

## 🔄 Async Iteration

`for await...of` lets you loop over async generators or any async iterable, awaiting each yielded value in turn. This is ideal for paginated APIs, streaming data sources, or any sequence that arrives asynchronously.

```js
// for await...of with async generators
async function* fetchPages(url) {
  let nextUrl = url;
  while (nextUrl) {
    const res  = await fetch(nextUrl);
    const data = await res.json();
    yield data.items;
    nextUrl = data.nextPageUrl ?? null;
  }
}

for await (const page of fetchPages("/api/products")) {
  renderPage(page);
}
```

---

## 🧩 Real-World Patterns

### Retry with Exponential Backoff
```js
async function fetchWithRetry(url, maxRetries = 3) {
  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      const r = await fetch(url);
      if (!r.ok) throw new Error(`HTTP ${r.status}`);
      return await r.json();
    } catch (err) {
      if (attempt === maxRetries) throw err;
      const delay = Math.pow(2, attempt) * 100; // 100, 200, 400ms
      await new Promise(r => setTimeout(r, delay));
    }
  }
}
```

### Async Queue (rate limiting)
```js
class AsyncQueue {
  #queue = [];
  #running = 0;
  #concurrency;

  constructor(concurrency = 1) {
    this.#concurrency = concurrency;
  }

  add(fn) {
    return new Promise((resolve, reject) => {
      this.#queue.push({ fn, resolve, reject });
      this.#run();
    });
  }

  async #run() {
    if (this.#running >= this.#concurrency || !this.#queue.length) return;
    this.#running++;
    const { fn, resolve, reject } = this.#queue.shift();
    try   { resolve(await fn()); }
    catch { reject(err); }
    finally { this.#running--; this.#run(); }
  }
}
```

---

## 🔑 Key Takeaways

- `async` functions always return a Promise.
- `await` pauses the *function*, not the thread — the event loop keeps running.
- Use `try/catch` for error handling (not `.catch()`).
- **Parallel is faster** — start promises simultaneously with `Promise.all`.
- `forEach` doesn't await async callbacks — use `for...of` or `Promise.all(arr.map(...))`.
- `AbortController` lets you cancel in-flight `fetch` requests.
- `async/await` is just cleaner syntax — it compiles to Promises internally.

---

[← Previous: Promises](22-promises.md) | [Contents](README.md) | [Next: Fetch API & HTTP →](24-fetch-and-http.md)
