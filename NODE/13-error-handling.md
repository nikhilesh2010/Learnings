# 13: Error Handling

## ⚠️ Why Error Handling Matters

Unhandled errors crash your server and expose sensitive info. Good error handling:
- Keeps the server running
- Returns clean error messages to clients
- Hides implementation details from attackers

---

## 🔠 Types of Errors

| Type | Description | Example |
|------|-------------|---------|
| **Operational** | Expected, runtime errors | DB down, file not found, invalid input |
| **Programmer** | Bugs in code | TypeError, null reference, wrong logic |
| **System** | OS/environment issues | Out of memory, port taken |

> Handle operational errors gracefully. Fix programmer errors in code.

---

## 🛡️ try / catch

```javascript
// Sync code
function parseConfig(json) {
  try {
    return JSON.parse(json);
  } catch (err) {
    console.error('Invalid JSON:', err.message);
    return null;
  }
}

// Async code (always use try/catch with await)
async function fetchUser(id) {
  try {
    const user = await db.findById(id);
    return user;
  } catch (err) {
    console.error('DB error:', err.message);
    throw err; // re-throw so caller can handle it
  }
}
```

---

## 🧩 Custom Error Classes

```javascript
// errors/AppError.js

class AppError extends Error {
  constructor(message, statusCode) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = true;    // mark as expected error
    Error.captureStackTrace(this, this.constructor);
  }
}

class NotFoundError extends AppError {
  constructor(resource = 'Resource') {
    super(`${resource} not found`, 404);
  }
}

class ValidationError extends AppError {
  constructor(message) {
    super(message, 400);
  }
}

class UnauthorizedError extends AppError {
  constructor() {
    super('Unauthorized', 401);
  }
}

module.exports = { AppError, NotFoundError, ValidationError, UnauthorizedError };
```

```javascript
// Usage in routes
const { NotFoundError, ValidationError } = require('./errors/AppError');

app.get('/users/:id', async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) throw new NotFoundError('User');
    res.json(user);
  } catch (err) {
    next(err);  // forward to error handler
  }
});
```

---

## 🔧 Express Error Handling Middleware

```javascript
// Must have 4 parameters to be treated as error handler
app.use((err, req, res, next) => {
  // Log error (use a logger like winston in production)
  console.error(`[ERROR] ${err.message}`);

  // Don't expose stack traces in production
  const isDev = process.env.NODE_ENV === 'development';

  // Operational errors — safe to send to client
  if (err.isOperational) {
    return res.status(err.statusCode).json({
      error: err.message,
      ...(isDev && { stack: err.stack }),
    });
  }

  // Unknown errors — don't leak details
  res.status(500).json({
    error: 'Something went wrong',
    ...(isDev && { details: err.message, stack: err.stack }),
  });
});
```

---

## 🔄 Async Route Wrapper

Avoids repeating `try/catch` in every route:

```javascript
// utils/asyncHandler.js
const asyncHandler = (fn) => (req, res, next) =>
  Promise.resolve(fn(req, res, next)).catch(next);

module.exports = asyncHandler;

// Route usage — clean!
const asyncHandler = require('./utils/asyncHandler');
const { NotFoundError } = require('./errors/AppError');

app.get('/users/:id', asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id);
  if (!user) throw new NotFoundError('User');
  res.json(user);
}));
```

---

## 🌐 Global Uncaught Exceptions & Rejections

Handle errors that escape all try/catch blocks:

```javascript
// Synchronous errors not caught anywhere
process.on('uncaughtException', (err) => {
  console.error('UNCAUGHT EXCEPTION! Shutting down...', err);
  process.exit(1); // must exit — process state is now unreliable
});

// Async promise rejections not handled
process.on('unhandledRejection', (reason, promise) => {
  console.error('UNHANDLED REJECTION:', reason);
  // Optionally exit (recommended in production)
  process.exit(1);
});
```

> These are safety nets — don't rely on them. Fix the root cause.

---

## 📋 404 Not Found Handler

```javascript
// Place BEFORE the error handler, AFTER all routes
app.use((req, res, next) => {
  res.status(404).json({
    error: `Cannot ${req.method} ${req.path}`,
  });
});
```

---

## 🏗️ Full Error Handling Setup

```javascript
// errors/AppError.js  (custom classes)
// utils/asyncHandler.js  (route wrapper)

// app.js
const express = require('express');
const app = express();

app.use(express.json());

// Routes
app.use('/api/users', require('./routes/users'));

// 404 — no matching route
app.use((req, res) => {
  res.status(404).json({ error: `Cannot ${req.method} ${req.path}` });
});

// Global error handler
app.use((err, req, res, next) => {
  const status = err.statusCode || 500;
  const message = err.isOperational ? err.message : 'Internal Server Error';
  res.status(status).json({ error: message });
});

// Catch unhandled rejections
process.on('unhandledRejection', (err) => {
  console.error('Unhandled Rejection:', err);
  process.exit(1);
});

app.listen(3000);
```

---

## ❌ Common Mistakes

```javascript
// ❌ Swallowing errors — silent failures
try {
  doSomething();
} catch (err) {
  // empty — never do this!
}

// ❌ Logging but not returning
app.get('/user', async (req, res, next) => {
  try {
    throw new Error('Fail');
  } catch (err) {
    console.error(err);
    next(err);
    res.json({ ok: true }); // ❌ still tries to respond!
  }
});

// ✅ Return after next(err)
  } catch (err) {
    return next(err); // return stops further execution
  }
```

---

## 🔑 Key Takeaways

- Use `try/catch` with `async/await` — always
- Create **custom error classes** with `statusCode` and `isOperational`
- Express error handler has **4 parameters** `(err, req, res, next)` — last in chain
- Use `asyncHandler` wrapper to avoid repeating `try/catch` in routes
- Register `unhandledRejection` and `uncaughtException` as safety nets
- Never expose stack traces or implementation details to clients in production

---

[← Previous: Streams & Buffers](12-streams.md) | [Contents](README.md) | [Next: Environment & Config →](14-environment-config.md)
