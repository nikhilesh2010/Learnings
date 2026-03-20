# 07: Routing

## 🔀 What is Routing?

Routing determines **how an app responds** to client requests based on the URL and HTTP method.

```
GET  /users       → list all users
GET  /users/1     → get user with id 1
POST /users       → create a new user
PUT  /users/1     → update user 1
DELETE /users/1   → delete user 1
```

---

## 🧭 Route Parameters

Capture **dynamic values** from the URL using `:paramName`:

```javascript
// Route: /users/:id
app.get('/users/:id', (req, res) => {
  const { id } = req.params;
  res.json({ message: `Fetching user ${id}` });
});

// Route: /posts/:postId/comments/:commentId
app.get('/posts/:postId/comments/:commentId', (req, res) => {
  const { postId, commentId } = req.params;
  res.json({ postId, commentId });
});
```

```
GET /users/42        → req.params = { id: '42' }
GET /users/abc       → req.params = { id: 'abc' }
```

> **Note:** Parameters are always **strings** — convert with `parseInt()` if needed.

---

## 🔍 Query Strings

Access URL query parameters via `req.query`:

```javascript
// Route: /search
app.get('/search', (req, res) => {
  const { q, page, limit } = req.query;
  // GET /search?q=nodejs&page=2&limit=10
  res.json({
    query: q,
    page: parseInt(page) || 1,
    limit: parseInt(limit) || 10,
  });
});
```

```
GET /products?category=phones&sort=price&order=asc
req.query = { category: 'phones', sort: 'price', order: 'asc' }
```

---

## 🗂️ Express Router

`express.Router()` lets you create **modular route handlers** in separate files.

```javascript
// routes/users.js
const express = require('express');
const router = express.Router();

router.get('/', (req, res) => {
  res.json({ message: 'All users' });
});

router.get('/:id', (req, res) => {
  res.json({ message: `User ${req.params.id}` });
});

router.post('/', (req, res) => {
  const { name, email } = req.body;
  res.status(201).json({ message: 'Created', name, email });
});

router.put('/:id', (req, res) => {
  res.json({ message: `Updated user ${req.params.id}` });
});

router.delete('/:id', (req, res) => {
  res.json({ message: `Deleted user ${req.params.id}` });
});

module.exports = router;
```

```javascript
// app.js — mount the router
const express = require('express');
const usersRouter = require('./routes/users');
const productsRouter = require('./routes/products');

const app = express();
app.use(express.json());

app.use('/api/users', usersRouter);       // /api/users/...
app.use('/api/products', productsRouter); // /api/products/...
```

---

## 🔗 Route Chaining

Chain multiple HTTP methods on the same path:

```javascript
app.route('/users/:id')
  .get((req, res) => {
    res.json({ message: `GET user ${req.params.id}` });
  })
  .put((req, res) => {
    res.json({ message: `PUT user ${req.params.id}` });
  })
  .delete((req, res) => {
    res.json({ message: `DELETE user ${req.params.id}` });
  });
```

---

## 🌐 Catch-All & 404 Routes

```javascript
// Match any method on /admin/*
app.all('/admin/*', (req, res, next) => {
  console.log('Admin route accessed');
  next(); // pass to next handler
});

// 404 handler — must be LAST
app.use((req, res) => {
  res.status(404).json({ error: 'Route not found' });
});
```

---

## 📁 Organizing Routes

```
src/
├── routes/
│   ├── index.js        ← combine all routes
│   ├── auth.js
│   ├── users.js
│   ├── products.js
│   └── orders.js
└── app.js
```

```javascript
// routes/index.js
const express = require('express');
const router = express.Router();

router.use('/auth', require('./auth'));
router.use('/users', require('./users'));
router.use('/products', require('./products'));

module.exports = router;

// app.js
app.use('/api', require('./routes'));
// All routes are now under /api/...
```

---

## 🔢 Route Order Matters

Express matches routes **top-to-bottom** — specific routes must come before wildcards:

```javascript
// ✅ CORRECT order
app.get('/users/admin', (req, res) => {   // specific first
  res.send('Admin panel');
});

app.get('/users/:id', (req, res) => {     // dynamic second
  res.send(`User ${req.params.id}`);
});

// ❌ WRONG — :id catches 'admin' before the admin route
app.get('/users/:id', handler);
app.get('/users/admin', handler); // never reached!
```

---

## 🎯 Practical Example: Users CRUD

```javascript
// routes/users.js
const express = require('express');
const router = express.Router();

let users = [
  { id: 1, name: 'Alice' },
  { id: 2, name: 'Bob' },
];

// GET /api/users
router.get('/', (req, res) => {
  res.json(users);
});

// GET /api/users/:id
router.get('/:id', (req, res) => {
  const user = users.find(u => u.id === parseInt(req.params.id));
  if (!user) return res.status(404).json({ error: 'User not found' });
  res.json(user);
});

// POST /api/users
router.post('/', (req, res) => {
  const { name } = req.body;
  const newUser = { id: users.length + 1, name };
  users.push(newUser);
  res.status(201).json(newUser);
});

// PUT /api/users/:id
router.put('/:id', (req, res) => {
  const user = users.find(u => u.id === parseInt(req.params.id));
  if (!user) return res.status(404).json({ error: 'Not found' });
  user.name = req.body.name || user.name;
  res.json(user);
});

// DELETE /api/users/:id
router.delete('/:id', (req, res) => {
  users = users.filter(u => u.id !== parseInt(req.params.id));
  res.status(204).send();
});

module.exports = router;
```

---

## 🔑 Key Takeaways

- `req.params` — dynamic URL segments (`:id`)
- `req.query` — query string values (`?page=2`)
- `express.Router()` — modular route files
- Mount routers with `app.use('/prefix', router)`
- Place specific routes **before** dynamic ones
- 404 handler goes **last** in middleware chain

---

[← Previous: Express.js](06-express.md) | [Contents](README.md) | [Next: Middleware →](08-middleware.md)
