# 18: Promises

## 🤝 What is a Promise?

A **Promise** is an object representing the **eventual completion or failure** of an asynchronous operation. It can be in one of three states:

```
Pending  →  Fulfilled (resolved with a value)
         →  Rejected  (rejected with a reason)
```

Once settled (fulfilled or rejected), a promise **never changes state**.

---

## 🏗️ Creating Promises

A `Promise` is created by passing an executor function to the `Promise` constructor. The executor receives `resolve` and `reject` callbacks: calling `resolve(value)` fulfils the promise, and calling `reject(error)` rejects it. This is typically used to wrap callback-based APIs so they can be chained with `.then()`.

```js
const promise = new Promise((resolve, reject) => {
  // Do async work...
  const data = fetchData();

  if (data) {
    resolve(data);    // success — value passed to .then()
  } else {
    reject(new Error("No data")); // failure — passed to .catch()
  }
});

// Wrapping a callback API
function readFileAsync(path) {
  return new Promise((resolve, reject) => {
    fs.readFile(path, "utf8", (err, data) => {
      if (err) reject(err);
      else resolve(data);
    });
  });
}
```

---

## 🔗 Chaining with .then()

Each `.then()` call returns a new promise so operations can be chained in sequence. Returning a plain value from a `.then()` handler passes it to the next `.then()`; returning a promise causes the chain to wait for that promise to settle before continuing. Never nest promise chains — always return inner promises to keep the chain flat.

```js
fetch("/api/user/1")
  .then(response => response.json())   // transform
  .then(user => user.name)             // extract
  .then(name => console.log(name))     // use
  .catch(error => console.error(error)) // handle any error in chain
  .finally(() => hideSpinner());        // always runs

// Key rule: .then() returns a NEW promise
// If you return a value → next .then() gets that value
// If you return a promise → chain waits for it to settle

fetch("/api/users")
  .then(r => r.json())
  .then(users => fetch(`/api/orders/${users[0].id}`)) // returns new promise
  .then(r => r.json())   // waits for above promise
  .then(orders => console.log(orders));
```

---

## ❌ Error Handling

A `.catch()` added to the end of a chain intercepts any rejection from any step above it. Returning a value inside `.catch()` turns the rejection into a resolved value, allowing the chain to continue recovery. `.finally()` always runs whether the chain succeeded or failed, making it the right place for cleanup logic.

```js
// .catch() handles rejections anywhere in the chain
fetch("/api/data")
  .then(r => {
    if (!r.ok) throw new Error(`HTTP ${r.status}`); // triggers .catch()
    return r.json();
  })
  .then(data => process(data))
  .catch(err => {
    console.error("Failed:", err.message);
    return fallbackData; // recovery — returns a value to continue chain
  })
  .then(data => display(data)); // receives fallbackData if error occurred

// .finally() — cleanup (always runs)
showSpinner();
fetchData()
  .then(render)
  .catch(handleError)
  .finally(() => hideSpinner()); // runs regardless of success or failure
```

---

## 🔀 Promise Combinators

### Promise.all() — All must succeed

```js
// Runs all in parallel, waits for ALL to complete
// Fails fast — rejects immediately if ANY rejects
const [users, products, orders] = await Promise.all([
  fetch("/api/users").then(r => r.json()),
  fetch("/api/products").then(r => r.json()),
  fetch("/api/orders").then(r => r.json()),
]);
```

### Promise.allSettled() — Wait for all (ES2020)

```js
// Waits for ALL promises, regardless of success/failure
const results = await Promise.allSettled([
  fetch("/api/a"),
  fetch("/api/b"),
  fetch("/api/c"),
]);

results.forEach(result => {
  if (result.status === "fulfilled") {
    console.log("Success:", result.value);
  } else {
    console.log("Error:", result.reason);
  }
});
```

### Promise.race() — First one wins

```js
// Resolves/rejects with the FIRST promise to settle
const result = await Promise.race([
  fetch("/api/fast"),
  fetch("/api/slow"),
  new Promise((_, reject) => setTimeout(() => reject(new Error("Timeout")), 5000)),
]);
```

### Promise.any() — First success (ES2021)

```js
// Resolves with the first FULFILLED promise
// Only rejects if ALL promises reject (AggregateError)
const fastest = await Promise.any([
  fetch("https://cdn1.example.com/data"),
  fetch("https://cdn2.example.com/data"),
  fetch("https://cdn3.example.com/data"),
]);
// First CDN to respond wins
```

### Summary

| Combinator | Resolves | Rejects |
|-----------|---------|---------|
| `Promise.all` | All fulfilled | First rejection |
| `Promise.allSettled` | All settled (always resolves) | Never |
| `Promise.race` | First settled (either) | First rejection |
| `Promise.any` | First fulfilled | All rejected |

---

## ⚡ Static Methods

`Promise.resolve()` and `Promise.reject()` create an already-settled promise, which is useful in tests, default branches, and normalising values that may or may not be promises. Awaiting `Promise.resolve(value)` is safe whether `value` is a promise or a plain value.

```js
// Already resolved/rejected — useful in tests and defaults
Promise.resolve(42).then(v => console.log(v)); // 42

Promise.reject(new Error("nope")).catch(e => console.log(e.message)); // "nope"

// Wrap non-promise values
async function example(maybePromise) {
  const value = await Promise.resolve(maybePromise); // safe even if not a promise
}
```

---

## 🔁 Promise Chaining vs Nesting

Nested `.then()` callbacks recreate the callback-hell problem and make error handling incomplete. Always return the inner promise from a `.then()` handler to keep the chain flat and ensure a single `.catch()` handles all errors.

```js
// ❌ Nested promises — defeats the purpose
fetch("/api/user")
  .then(r => r.json())
  .then(user => {
    fetch(`/api/orders/${user.id}`) // NESTED — error not caught by outer chain!
      .then(r => r.json())
      .then(orders => console.log(orders));
  });

// ✅ Flat chain — always RETURN inner promises
fetch("/api/user")
  .then(r => r.json())
  .then(user => fetch(`/api/orders/${user.id}`)) // RETURNED ← chain continues
  .then(r => r.json())
  .then(orders => console.log(orders))
  .catch(handleError); // catches ALL errors ✅
```

---

## 🏗️ Promisify Pattern

The promisify pattern wraps a Node.js error-first callback function in a `Promise` so it can be used with `.then()` chains or `async/await`. Node's built-in `util.promisify()` does this automatically for functions that follow the standard `(err, result)` callback convention.

```js
// Convert callback-based functions to promise-based
function promisify(fn) {
  return function(...args) {
    return new Promise((resolve, reject) => {
      fn(...args, (err, result) => {
        if (err) reject(err);
        else resolve(result);
      });
    });
  };
}

const readFile = promisify(fs.readFile);
readFile("config.json", "utf8")
  .then(JSON.parse)
  .then(config => console.log(config))
  .catch(err => console.error(err));

// Node.js has this built in:
const { promisify } = require("util");
const readFile = promisify(fs.readFile);
```

---

## 🧩 Building a Simple Promise Chain

This pattern wraps a `Promise` in a class to demonstrate how chainable fluent APIs can be built. Storing the promise internally and returning `this` from each method allows calls like `.then(...).catch(...).finally(...)` on the custom class.

```js
class Task {
  constructor(fn) {
    this._promise = new Promise(fn);
  }

  static resolve(value) {
    return new Task(resolve => resolve(value));
  }

  then(fn)        { this._promise = this._promise.then(fn);    return this; }
  catch(fn)       { this._promise = this._promise.catch(fn);   return this; }
  finally(fn)     { this._promise = this._promise.finally(fn); return this; }
}
```

---

## ⚠️ Common Mistakes

The most frequent promise bugs are forgetting to `return` an inner promise from `.then()` (which breaks the chain), omitting `.catch()` (leaving rejections unhandled), and the "promise constructor anti-pattern" of wrapping an existing promise in a `new Promise()` unnecessarily.

```js
// 1. Forgetting to return in .then()
.then(user => {
  fetchOrders(user.id)  // ❌ not returned — chain doesn't wait!
})

.then(user => {
  return fetchOrders(user.id); // ✅
})

// 2. Mixing callbacks and promises
.then(user => {
  setTimeout(() => resolve(user), 1000); // ❌ can't use outside promise
})

// 3. Not handling rejections
somePromise.then(handle); // ❌ uncaught rejection if fails
somePromise.then(handle).catch(handleError); // ✅

// 4. Promise constructor anti-pattern
new Promise((resolve, reject) => {
  someExistingPromise.then(resolve).catch(reject); // ❌ redundant
});
// Just use someExistingPromise directly ✅
```

---

## 🔑 Key Takeaways

- A Promise is: **Pending → Fulfilled | Rejected**. Once settled, it's immutable.
- `.then()` chains are **flat** — always return promises from `.then()` to avoid nesting.
- **Always add `.catch()`** — unhandled rejections crash Node.js and show warnings in browsers.
- `Promise.all` for parallel tasks that all must succeed.
- `Promise.allSettled` when you need results from all, regardless of failure.
- `Promise.any` for fastest CDN/mirror/fallback pattern.
- Use `async/await` (next chapter) for even cleaner syntax.

---

[← Previous: The Event Loop & Callbacks](21-event-loop-and-callbacks.md) | [Contents](README.md) | [Next: Async / Await →](23-async-await.md)
