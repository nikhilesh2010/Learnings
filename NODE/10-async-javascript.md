# 10: Async JavaScript

## ⏳ Why Async Matters in Node.js

Node.js is **single-threaded**. If you block for a slow operation (DB query, file read, API call), your entire server freezes. Async code lets Node handle other requests while waiting.

```
Sync (blocking):     Task → Wait → Wait → Wait → Done
Async (non-blocking): Task → Continue → Resume when ready
```

---

## 1️⃣ Callbacks (Old Pattern)

A **callback** is a function passed as an argument, called when an operation completes.

```javascript
const fs = require('fs');

fs.readFile('file.txt', 'utf8', function(err, data) {
  if (err) {
    console.error('Error:', err);
    return;
  }
  console.log(data);
});

console.log('This runs FIRST — readFile is async');
```

### The Problem: Callback Hell

```javascript
// ❌ Deeply nested callbacks — hard to read and maintain
fs.readFile('config.json', 'utf8', (err, config) => {
  if (err) return handleError(err);

  db.connect(config, (err, connection) => {
    if (err) return handleError(err);

    connection.query('SELECT * FROM users', (err, users) => {
      if (err) return handleError(err);

      users.forEach(user => {
        sendEmail(user.email, (err) => {
          if (err) return handleError(err);
          console.log('Email sent to', user.email);
        });
      });
    });
  });
});
```

---

## 2️⃣ Promises

A **Promise** represents a value that will be available in the future — it's either **pending**, **fulfilled**, or **rejected**.

```javascript
const promise = new Promise((resolve, reject) => {
  const success = true;

  if (success) {
    resolve('Operation succeeded!');
  } else {
    reject(new Error('Operation failed!'));
  }
});

promise
  .then(result => console.log(result))   // fulfilled
  .catch(error => console.error(error))  // rejected
  .finally(() => console.log('Done'));   // always runs
```

### Chaining Promises

```javascript
// ✅ Cleaner than callbacks
fetch('/api/data')
  .then(response => response.json())
  .then(data => filterData(data))
  .then(filtered => saveToDb(filtered))
  .then(result => console.log('Saved:', result))
  .catch(err => console.error('Something failed:', err));
```

### Promise.all — Run in Parallel

```javascript
// Wait for multiple promises at once (fastest)
const [users, products, orders] = await Promise.all([
  fetchUsers(),
  fetchProducts(),
  fetchOrders(),
]);
```

### Promise.allSettled — Get All Results

```javascript
// Get results even if some fail
const results = await Promise.allSettled([
  fetchUsers(),
  fetchProducts(),
]);

results.forEach(result => {
  if (result.status === 'fulfilled') console.log(result.value);
  else console.error(result.reason);
});
```

### Promise.race — First One Wins

```javascript
// Returns the first promise to settle
const result = await Promise.race([
  fetch('/api/fast'),
  fetch('/api/slow'),
]);
```

---

## 3️⃣ async / await (Modern — Preferred ⭐)

`async/await` is **syntactic sugar over Promises** — it makes async code look synchronous.

```javascript
// ✅ async function always returns a Promise
async function fetchUser(id) {
  const response = await fetch(`/api/users/${id}`);
  const user = await response.json();
  return user;
}
```

### Error Handling with try/catch

```javascript
async function getUserData(id) {
  try {
    const user = await db.findUser(id);

    if (!user) {
      throw new Error('User not found');
    }

    const posts = await db.findPostsByUser(user.id);
    return { user, posts };

  } catch (err) {
    console.error('Failed to get user data:', err.message);
    throw err; // re-throw so caller knows it failed
  }
}
```

### In an Express Route

```javascript
// ❌ Without error handling — uncaught rejections crash Node
app.get('/users/:id', async (req, res) => {
  const user = await User.findById(req.params.id); // can throw!
  res.json(user);
});

// ✅ With try/catch
app.get('/users/:id', async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ error: 'Not found' });
    res.json(user);
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});
```

---

## 🔄 Async Wrapper Utility

Avoid repeating `try/catch` in every route:

```javascript
// utils/asyncHandler.js
const asyncHandler = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

module.exports = asyncHandler;

// Usage — clean routes without try/catch
const asyncHandler = require('./utils/asyncHandler');

app.get('/users/:id', asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id);
  if (!user) return res.status(404).json({ error: 'Not found' });
  res.json(user);
}));
// Errors auto-forwarded to Express error handler
```

---

## 📊 Comparison

| | Callbacks | Promises | async/await |
|---|-----------|----------|-------------|
| Readability | ❌ Poor | ✅ OK | ✅✅ Best |
| Error handling | Manual | `.catch()` | `try/catch` |
| Debugging | Hard | OK | Easy |
| Node version | All | v0.12+ | v7.6+ |
| Parallel tasks | Hard | `Promise.all` | `Promise.all` |

---

## ⚡ Common Patterns

### Sequential async operations

```javascript
// Run one after another (order matters)
async function processUser(id) {
  const user = await getUser(id);
  const profile = await getProfile(user.profileId);
  const posts = await getPosts(user.id);
  return { user, profile, posts };
}
```

### Parallel async operations

```javascript
// Run all at the same time (faster!)
async function processUser(id) {
  const user = await getUser(id);
  const [profile, posts] = await Promise.all([
    getProfile(user.profileId),
    getPosts(user.id),
  ]);
  return { user, profile, posts };
}
```

### Async array operations

```javascript
const users = [1, 2, 3, 4, 5];

// ✅ Process in parallel
const results = await Promise.all(users.map(id => fetchUser(id)));

// ✅ Process sequentially (when order/rate matters)
for (const id of users) {
  const user = await fetchUser(id);
  console.log(user);
}
```

---

## 🔑 Key Takeaways

- Callbacks → Promises → `async/await` — each is an improvement
- `async` marks a function as async; `await` pauses until a Promise resolves
- Always handle errors with `try/catch` in async functions
- `Promise.all([...])` — run multiple Promises in **parallel**
- Use an `asyncHandler` wrapper to avoid repeating `try/catch` in routes
- Never forget `await` — missing it returns a Promise object, not the value!

---

[← Previous: REST APIs](09-rest-api.md) | [Contents](README.md) | [Next: Event Loop & EventEmitter →](11-event-loop.md)
