# 11: Event Loop & EventEmitter

## 🔄 What is the Event Loop?

The **Event Loop** is what makes Node.js non-blocking. It continuously checks for tasks to execute, allowing Node.js to handle many operations concurrently with a single thread.

```
┌──────────────────────────┐
│         Call Stack        │
│   (runs sync JS code)     │
└────────────┬─────────────┘
             │ empty?
             ↓
┌──────────────────────────┐
│      Event Loop           │
│   checks queues...        │
└────────────┬─────────────┘
             │
    ┌─────────────────┐
    │  Task Queues:   │
    │  · Microtask    │ ← Promise callbacks, .then()
    │  · Macrotask    │ ← setTimeout, setInterval, I/O
    └─────────────────┘
```

---

## 🏗️ How It Works

Node.js uses **libuv** (a C library) to manage async I/O.

```
┌────────────────────────────────────┐
│            Node.js Process          │
│                                    │
│  Call Stack    │  Web APIs / libuv  │
│  ─────────     │  ──────────────    │
│  main()        │  setTimeout(fn,0)  │
│  console.log   │  fs.readFile       │
│                │  http.request      │
└─────────────── │ ───────────────────┘
                 │
          Completed? → push to queue
                 │
         ┌───────────────┐
         │   Task Queue  │
         │  [callback1]  │
         │  [callback2]  │
         └───────┬───────┘
                 │ call stack empty?
                 ↓
         Execute next callback
```

---

## ⏱️ setTimeout vs setImmediate vs process.nextTick

```javascript
console.log('1 - sync');

setTimeout(() => console.log('4 - setTimeout'), 0);
setImmediate(() => console.log('3 - setImmediate'));

Promise.resolve().then(() => console.log('2 - Promise (microtask)'));

process.nextTick(() => console.log('2 - nextTick (microtask, runs first)'));

console.log('1 - sync (end)');

// Output:
// 1 - sync
// 1 - sync (end)
// 2 - nextTick (microtask, runs first)
// 2 - Promise (microtask)
// 3 - setImmediate
// 4 - setTimeout
```

### Priority Order

```
1. Call Stack (sync code)
2. process.nextTick()      ← microtask, highest priority
3. Promise callbacks       ← microtask
4. setImmediate()          ← macrotask (after I/O)
5. setTimeout/setInterval  ← macrotask
```

---

## ⚠️ Blocking the Event Loop

```javascript
// ❌ BAD — blocks the event loop for all other requests!
app.get('/compute', (req, res) => {
  let result = 0;
  for (let i = 0; i < 1_000_000_000; i++) {
    result += i;
  }
  res.json({ result });
});

// ✅ GOOD — offload heavy work to worker threads
const { Worker } = require('worker_threads');

app.get('/compute', (req, res) => {
  const worker = new Worker('./heavyTask.js');
  worker.on('message', (result) => res.json({ result }));
  worker.on('error', (err) => res.status(500).json({ error: err.message }));
});
```

---

## 📡 EventEmitter

Node.js is built on an **event-driven architecture**. The `EventEmitter` class is the foundation.

```javascript
const EventEmitter = require('events');

// Create an emitter
const emitter = new EventEmitter();

// Register a listener (subscribe)
emitter.on('data', (payload) => {
  console.log('Received:', payload);
});

// Emit the event (publish)
emitter.emit('data', { id: 1, name: 'Alice' });
// Output: Received: { id: 1, name: 'Alice' }
```

---

## 🔧 EventEmitter Methods

```javascript
const EventEmitter = require('events');
const emitter = new EventEmitter();

// Listen to an event (called every time)
emitter.on('message', (msg) => console.log(msg));

// Listen ONCE (auto-removed after first fire)
emitter.once('connect', () => console.log('Connected!'));

// Emit an event
emitter.emit('message', 'Hello!');
emitter.emit('connect');

// Remove a specific listener
const handler = (data) => console.log(data);
emitter.on('event', handler);
emitter.off('event', handler);         // remove it
emitter.removeListener('event', handler); // same as .off()

// Remove ALL listeners for an event
emitter.removeAllListeners('message');

// List event names
console.log(emitter.eventNames());

// Count listeners
console.log(emitter.listenerCount('message'));
```

---

## 🏗️ Extending EventEmitter

Build your own event-driven classes:

```javascript
const EventEmitter = require('events');

class Database extends EventEmitter {
  constructor() {
    super();
    this.connected = false;
  }

  connect(url) {
    // simulate async connection
    setTimeout(() => {
      this.connected = true;
      this.emit('connect', { url });
    }, 500);
  }

  query(sql) {
    if (!this.connected) {
      this.emit('error', new Error('Not connected'));
      return;
    }
    // simulate query
    setTimeout(() => {
      this.emit('data', { rows: [], sql });
    }, 100);
  }
}

const db = new Database();

db.on('connect', ({ url }) => {
  console.log('Connected to:', url);
  db.query('SELECT * FROM users');
});

db.on('data', ({ rows }) => {
  console.log('Got rows:', rows.length);
});

db.on('error', (err) => {
  console.error('DB Error:', err.message);
});

db.connect('mongodb://localhost');
```

---

## 🔥 Real-World: Custom Event Bus

```javascript
// eventBus.js — shared event bus across your app
const EventEmitter = require('events');
const eventBus = new EventEmitter();
module.exports = eventBus;

// userService.js
const eventBus = require('./eventBus');

async function createUser(data) {
  const user = await db.save(data);
  eventBus.emit('user:created', user);  // fire and forget
  return user;
}

// emailService.js
const eventBus = require('./eventBus');

eventBus.on('user:created', async (user) => {
  await sendWelcomeEmail(user.email);
  console.log('Welcome email sent to', user.email);
});

// orderService.js
eventBus.on('user:created', async (user) => {
  await createDefaultCart(user.id);
});
```

---

## 🔑 Key Takeaways

- Node.js is **single-threaded** but handles concurrency via the **Event Loop**
- Never run CPU-heavy synchronous code in a server — it blocks everyone
- **Microtasks** (`process.nextTick`, Promises) run before **macrotasks** (`setTimeout`, I/O callbacks)
- `EventEmitter` is the foundation of Node.js — streams, http, and more extend it
- Use `.on()` to subscribe, `.emit()` to publish, `.once()` for one-time listeners

---

[← Previous: Async JavaScript](10-async-javascript.md) | [Contents](README.md) | [Next: Streams & Buffers →](12-streams.md)
