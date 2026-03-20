# 08: Middleware

## ⚙️ What is Middleware?

Middleware are **functions that run between the request and the response**. They have access to `req`, `res`, and `next`.

```
Request → Middleware 1 → Middleware 2 → Route Handler → Response
```

```javascript
// Middleware function shape
function myMiddleware(req, res, next) {
  // do something
  next(); // pass to next middleware or route
}
```

---

## 🔗 How next() Works

```
app.use(middlewareA)
app.use(middlewareB)
app.get('/path', handler)

Request comes in:
  → middlewareA runs → calls next()
  → middlewareB runs → calls next()
  → handler runs → sends response
```

- Call `next()` to continue the chain
- Don't call `next()` to **stop** (you must send a response instead)
- Call `next(err)` to jump to the **error handler**

---

## 🛠️ Built-in Express Middleware

```javascript
const express = require('express');
const app = express();

// Parse JSON request bodies
app.use(express.json());

// Parse URL-encoded form data
app.use(express.urlencoded({ extended: true }));

// Serve static files from the 'public' folder
app.use(express.static('public'));
// GET /images/logo.png → looks in public/images/logo.png
```

---

## 🧩 Custom Middleware

### Logging Middleware

```javascript
function logger(req, res, next) {
  const now = new Date().toISOString();
  console.log(`[${now}] ${req.method} ${req.url}`);
  next();
}

app.use(logger);
```

### Timing Middleware

```javascript
function timing(req, res, next) {
  req.startTime = Date.now();

  res.on('finish', () => {
    const duration = Date.now() - req.startTime;
    console.log(`${req.method} ${req.url} → ${res.statusCode} (${duration}ms)`);
  });

  next();
}

app.use(timing);
```

### Auth Middleware

```javascript
function requireAuth(req, res, next) {
  const token = req.headers.authorization?.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'No token provided' });
  }

  // verify token (see authentication guide)
  req.user = { id: 1, name: 'Alice' }; // attach to req
  next();
}

// Apply only to specific routes
app.get('/dashboard', requireAuth, (req, res) => {
  res.json({ user: req.user });
});
```

---

## 📍 Middleware Scope

```javascript
// Global — applies to ALL routes
app.use(express.json());
app.use(logger);

// Path-scoped — applies to routes starting with /api
app.use('/api', requireAuth);

// Route-specific — inline middleware
app.get('/secret', requireAuth, (req, res) => {
  res.json({ secret: 'data' });
});

// Router-level — applies only within a router
const router = express.Router();
router.use(requireAuth);
router.get('/', handler);
```

---

## ❌ Error-Handling Middleware

Error middleware has **4 parameters** — Express knows it's an error handler because of the `err` argument:

```javascript
// Regular middleware: 3 params
app.use((req, res, next) => { ... });

// Error middleware: 4 params (MUST have err first)
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(err.status || 500).json({
    error: err.message || 'Internal Server Error',
  });
});
```

```javascript
// Trigger it by passing an error to next()
app.get('/bad', (req, res, next) => {
  const err = new Error('Something went wrong!');
  err.status = 400;
  next(err);                // jumps directly to error handler
});

// Or inside async code
app.get('/async-bad', async (req, res, next) => {
  try {
    await someFailingOperation();
  } catch (err) {
    next(err);
  }
});
```

**Error handler must be the LAST `app.use()`:**

```javascript
app.use(express.json());
app.use(logger);
app.use('/api', routes);
app.use(notFoundHandler); // 404
app.use(errorHandler);    // error handler ← always last
```

---

## 📦 Third-Party Middleware

### morgan — HTTP request logger

```bash
npm install morgan
```

```javascript
const morgan = require('morgan');
app.use(morgan('dev'));       // colored output
app.use(morgan('combined')); // Apache-style logs
```

### cors — Cross-Origin Resource Sharing

```bash
npm install cors
```

```javascript
const cors = require('cors');
app.use(cors());  // allow all origins

// Allow specific origin
app.use(cors({ origin: 'http://localhost:3000' }));
```

### helmet — Security headers

```bash
npm install helmet
```

```javascript
const helmet = require('helmet');
app.use(helmet()); // sets secure HTTP headers
```

### compression — Gzip responses

```bash
npm install compression
```

```javascript
const compression = require('compression');
app.use(compression()); // compress all responses
```

---

## 🎯 Full Middleware Setup Example

```javascript
const express = require('express');
const morgan = require('morgan');
const helmet = require('helmet');
const cors = require('cors');

const app = express();

// Security
app.use(helmet());
app.use(cors({ origin: process.env.CLIENT_URL }));

// Logging
app.use(morgan('dev'));

// Body parsing
app.use(express.json({ limit: '10kb' }));

// Routes
app.use('/api/users', require('./routes/users'));

// 404
app.use((req, res) => {
  res.status(404).json({ error: 'Not found' });
});

// Error handler
app.use((err, req, res, next) => {
  res.status(err.status || 500).json({ error: err.message });
});

app.listen(3000);
```

---

## 🔑 Key Takeaways

- Middleware functions take `(req, res, next)` as arguments
- Call `next()` to continue, `next(err)` to jump to error handler
- `app.use()` registers middleware globally, or with a path prefix
- Error handlers have 4 params `(err, req, res, next)` — always last
- Use `morgan`, `cors`, `helmet` for logging, CORS, and security

---

[← Previous: Routing](07-routing.md) | [Contents](README.md) | [Next: REST APIs →](09-rest-api.md)
