# 06: Express.js Introduction

## ⚡ What is Express?

**Express.js** is a minimal, fast web framework for Node.js. It wraps the built-in `http` module and gives you clean tools for routing, middleware, and responses.

```bash
npm install express
```

---

## 🚀 Your First Express App

```javascript
const express = require('express');

const app = express();

// Route
app.get('/', (req, res) => {
  res.send('Hello from Express!');
});

// Start server
app.listen(3000, () => {
  console.log('Server running at http://localhost:3000');
});
```

**vs raw http module:**
```javascript
// ❌ Raw http: verbose
const http = require('http');
const server = http.createServer((req, res) => {
  if (req.method === 'GET' && req.url === '/') {
    res.writeHead(200, { 'Content-Type': 'text/plain' });
    res.end('Hello!');
  }
});

// ✅ Express: clean
app.get('/', (req, res) => res.send('Hello!'));
```

---

## 🗂️ Application Setup

```javascript
const express = require('express');
const app = express();

// Middleware
app.use(express.json());        // Parse JSON request bodies
app.use(express.urlencoded({ extended: true })); // Parse form data
app.use(express.static('public')); // Serve static files from /public

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
```

---

## 🔀 Basic Routing

```javascript
// GET request
app.get('/users', (req, res) => {
  res.json([{ id: 1, name: 'Alice' }]);
});

// POST request
app.post('/users', (req, res) => {
  const newUser = req.body;
  // save newUser...
  res.status(201).json({ message: 'Created', user: newUser });
});

// PUT request
app.put('/users/:id', (req, res) => {
  const { id } = req.params;
  res.json({ message: `Updated user ${id}` });
});

// DELETE request
app.delete('/users/:id', (req, res) => {
  const { id } = req.params;
  res.json({ message: `Deleted user ${id}` });
});
```

---

## 📤 Response Methods

```javascript
app.get('/demo', (req, res) => {
  // Send text
  res.send('Hello!');

  // Send JSON
  res.json({ key: 'value' });

  // Send with status code
  res.status(404).json({ error: 'Not found' });

  // Send a file
  res.sendFile(path.join(__dirname, 'public', 'index.html'));

  // Redirect
  res.redirect('/new-url');
  res.redirect(301, '/permanent-url');

  // Send status only
  res.sendStatus(204);    // 204 No Content

  // Set headers manually
  res.set('X-Custom', 'value').json({ ok: true });
});
```

---

## 📬 Request Object (req)

```javascript
app.get('/info', (req, res) => {
  console.log(req.method);          // GET
  console.log(req.url);             // /info
  console.log(req.path);            // /info
  console.log(req.params);          // { id: '1' } from /:id
  console.log(req.query);           // { page: '2' } from ?page=2
  console.log(req.body);            // { name: 'Alice' } (POST data)
  console.log(req.headers);         // { authorization: 'Bearer ...' }
  console.log(req.get('Authorization')); // get specific header
  console.log(req.ip);              // client's IP
});
```

---

## ⚙️ Express App Settings

```javascript
// Disable X-Powered-By header (security)
app.disable('x-powered-by');

// Trust proxy (when behind nginx/load balancer)
app.set('trust proxy', 1);

// View engine (for server-side rendering)
app.set('view engine', 'ejs');
app.set('views', './views');
```

---

## 🏗️ Minimal Project Structure

```
my-app/
├── src/
│   ├── index.js         ← app entry point
│   ├── routes/
│   │   └── users.js
│   └── middleware/
│       └── auth.js
├── public/              ← static files
├── .env
├── .gitignore
└── package.json
```

```javascript
// src/index.js
const express = require('express');
const usersRouter = require('./routes/users');

const app = express();
app.use(express.json());
app.use('/api/users', usersRouter);

app.listen(3000, () => console.log('Running on port 3000'));
```

---

## 🔥 Nodemon for Development

```bash
npm install --save-dev nodemon
```

```json
// package.json
{
  "scripts": {
    "start": "node src/index.js",
    "dev": "nodemon src/index.js"
  }
}
```

```bash
npm run dev   # auto-restarts on file changes
```

---

## 🔑 Key Takeaways

- `express()` creates an app instance
- `app.get()`, `app.post()`, `app.put()`, `app.delete()` — define routes by HTTP method
- `req.body` — parsed request data (needs `express.json()` middleware)
- `req.params` — URL parameters (`:id`)
- `req.query` — query string (`?page=2`)
- `res.json()` — send JSON; `res.send()` — send text/HTML
- `res.status(404).json(...)` — chain status and response

---

[← Previous: HTTP Module](05-http-module.md) | [Contents](README.md) | [Next: Routing →](07-routing.md)
