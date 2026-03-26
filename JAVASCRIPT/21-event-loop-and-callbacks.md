# 17: The Event Loop & Callbacks

## 🔄 JavaScript's Concurrency Model

JavaScript is **single-threaded** — it has one call stack, executing one thing at a time. Yet it can handle I/O, timers, and network requests without blocking. This is achieved through the **Event Loop**.

```
┌─────────────────────────────────┐
│            Call Stack            │  ← executes code (LIFO)
└──────────────┬──────────────────┘
               │
┌──────────────▼──────────────────┐
│           Event Loop             │  ← picks tasks when stack is empty
└──────────────┬──────────────────┘
               │
┌──────────────▼──────────────────┐
│    Task Queue (Macro tasks)      │  ← setTimeout, setInterval, I/O
│  Microtask Queue (higher prio)   │  ← Promises, queueMicrotask
└─────────────────────────────────┘
```

---

## 📚 The Call Stack

The call stack is a LIFO (last-in, first-out) data structure that tracks the currently executing functions. Each function call pushes a frame; when the function returns, the frame is popped. JavaScript can only execute one function at a time, and the event loop only processes queued tasks when the stack is completely empty.

```js
function third()  { console.log("third"); }
function second() { third(); console.log("second"); }
function first()  { second(); console.log("first"); }

first();

// Call stack execution:
// 1. first() pushed
// 2. second() pushed (called from first)
// 3. third() pushed (called from second)
// 4. third() completes → popped → logs "third"
// 5. second() completes → popped → logs "second"
// 6. first() completes → popped → logs "first"
```

---

## ⏰ Web APIs & Task Queues

When the call stack is empty the event loop picks the next callback from the queues. Microtasks (Promise callbacks and `queueMicrotask`) have higher priority than macrotasks (`setTimeout`, `setInterval`, I/O), and the entire microtask queue drains before the next macrotask is processed.

```js
console.log("1: Start");

setTimeout(() => console.log("2: Timeout"), 0);

Promise.resolve().then(() => console.log("3: Microtask"));

console.log("4: End");

// Output:
// 1: Start
// 4: End
// 3: Microtask   ← microtasks run BEFORE next macro task
// 2: Timeout
```

### Why this order?
```
1. JS engine runs synchronous code (1: Start, 4: End)
2. Stack empty → check Microtask Queue → runs Promise callback (3)
3. Microtask Queue empty → Event Loop picks next Macro task (2: Timeout)
```

---

## 📋 Macrotasks vs Microtasks

| Macrotasks (Task Queue) | Microtasks (Microtask Queue) |
|------------------------|------------------------------|
| `setTimeout` | `Promise.then/catch/finally` |
| `setInterval` | `queueMicrotask()` |
| `setImmediate` (Node) | `MutationObserver` |
| I/O callbacks | `async/await` (awaited expressions) |
| UI rendering | |

```js
// All microtasks run before the next macrotask
Promise.resolve()
  .then(() => console.log("micro1"))
  .then(() => console.log("micro2"));

setTimeout(() => console.log("macro1"), 0);

// Output: micro1 → micro2 → macro1
```

---

## 📞 Callbacks

A **callback** is a function passed as an argument to be called later.

```js
// Basic callback
function greet(name, callback) {
  const message = `Hello, ${name}!`;
  callback(message);
}

greet("Alice", msg => console.log(msg)); // "Hello, Alice!"

// Async callback (setTimeout)
setTimeout(() => {
  console.log("Executed after 1 second");
}, 1000);

// Node.js I/O callback convention: error-first
const fs = require("fs");
fs.readFile("file.txt", "utf8", (err, data) => {
  if (err) {
    console.error("Error:", err);
    return;
  }
  console.log(data);
});
```

---

## 😱 Callback Hell (Pyramid of Doom)

When multiple asynchronous operations depend on each other, nesting callbacks leads to deeply indented, hard-to-read code known as "callback hell" or the "pyramid of doom". Error handling at each level makes the problem worse. Promises and `async/await` were introduced to solve this.

```js
// ❌ Deeply nested callbacks — hard to read and maintain
getUser(userId, (err, user) => {
  if (err) handleError(err);
  else {
    getOrders(user.id, (err, orders) => {
      if (err) handleError(err);
      else {
        getOrderDetails(orders[0].id, (err, details) => {
          if (err) handleError(err);
          else {
            sendConfirmation(details, (err, result) => {
              if (err) handleError(err);
              else {
                console.log("Done!", result); // 4 levels deep!
              }
            });
          }
        });
      }
    });
  }
});
```

**Solutions**: Promises (Chapter 18) and Async/Await (Chapter 19).

---

## ⏱️ setTimeout & setInterval

`setTimeout` schedules a callback to run once after a delay, and `setInterval` repeats a callback at a fixed interval. Both return an ID that can be passed to `clearTimeout`/`clearInterval` to cancel them. A delay of `0` does not mean immediate execution — it defers until after the current synchronous code finishes.

```js
// setTimeout — run once after delay
const id = setTimeout(() => {
  console.log("Runs once after 2 seconds");
}, 2000);

clearTimeout(id); // cancel before it fires

// setInterval — run repeatedly
const intervalId = setInterval(() => {
  console.log("Runs every second");
}, 1000);

clearInterval(intervalId); // stop

// setTimeout with 0 delay — schedule for next iteration
setTimeout(() => {
  console.log("After current synchronous code");
}, 0);
console.log("Before"); // runs first!

// Recursive setTimeout (more reliable than setInterval)
function poll() {
  fetchData().then(data => {
    process(data);
    setTimeout(poll, 1000); // schedule next after this one completes
  });
}
poll();
```

---

## 🔄 queueMicrotask

`queueMicrotask()` schedules a function to run in the microtask queue — before the next macrotask and before rendering. It is a lighter alternative to `Promise.resolve().then(...)` when you need to defer work to the end of the current task but before any I/O callbacks.

```js
// Schedule a microtask (runs before next macrotask)
queueMicrotask(() => {
  console.log("Microtask 1");
});

console.log("Sync");

// Output: Sync → Microtask 1

// Equivalent to (but without creating a promise):
Promise.resolve().then(() => console.log("Microtask 1"));
```

---

## 🚫 Blocking the Event Loop

Long-running synchronous operations stall the event loop, freezing the UI and preventing other callbacks from executing. Break heavy work into smaller chunks scheduled with `setTimeout`, move CPU-intensive tasks to a Web Worker, and avoid synchronous patterns like busy-waiting loops on the main thread.

```js
// ❌ Never do heavy synchronous work on the main thread
function blockingSort(arr) {
  for (let i = 0; i < arr.length; i++) { // O(n²) busy work
    for (let j = 0; j < i; j++) {
      if (arr[j] > arr[j+1]) [arr[j], arr[j+1]] = [arr[j+1], arr[j]];
    }
  }
}

blockingSort(hugeArray); // Freezes UI for seconds!

// ✅ Solutions:
// 1. Web Workers (parallel thread)
// 2. Break work into chunks with setTimeout
// 3. Use built-in optimized functions (Array.sort)

// Chunking pattern
function processInChunks(items, chunkSize, processor) {
  let index = 0;
  function processChunk() {
    const end = Math.min(index + chunkSize, items.length);
    while (index < end) processor(items[index++]);
    if (index < items.length) setTimeout(processChunk, 0); // yield to event loop
  }
  processChunk();
}
```

---

## 🌐 Node.js Event Loop Phases

Node.js has a more detailed event loop with phases:

```
┌───────────────────────────┐
│           timers           │ ← setTimeout, setInterval callbacks
├───────────────────────────┤
│     pending callbacks      │ ← I/O errors from previous loop
├───────────────────────────┤
│       idle, prepare        │ ← internal use
├───────────────────────────┤
│            poll            │ ← retrieve new I/O events
├───────────────────────────┤
│           check            │ ← setImmediate callbacks
├───────────────────────────┤
│      close callbacks       │ ← socket.on('close')
└───────────────────────────┘
      ↑ microtasks (Promises, process.nextTick) run between each phase
```

```js
// process.nextTick — highest priority, runs before any I/O
process.nextTick(() => console.log("nextTick"));
setImmediate(() => console.log("setImmediate"));
setTimeout(() => console.log("setTimeout"), 0);

// Output in Node: nextTick → setTimeout → setImmediate
// (order of timeout vs immediate can vary when called at top level)
```

---

## 🔑 Key Takeaways

- JS is **single-threaded** but non-blocking via the Event Loop.
- **Synchronous code** runs first; callbacks are processed when the stack is empty.
- **Microtasks** (Promises) run before **macrotasks** (setTimeout) — after each task.
- **Callbacks** are the foundation of async JS — but lead to "callback hell" at scale.
- **Never block the event loop** with heavy synchronous work.
- Use Promises and async/await (next chapters) to write clean async code.

---

[← Previous: Intl API](20-intl.md) | [Contents](README.md) | [Next: Promises →](22-promises.md)
