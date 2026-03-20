# 05: HTTP Module

## 🌐 What is the HTTP Module?

Node.js has a **built-in `http` module** that lets you create web servers and make HTTP requests — without installing anything.

```javascript
const http = require('http');
```

---

## 🖥️ Creating a Basic Server

```javascript
const http = require('http');

const server = http.createServer((req, res) => {
  res.writeHead(200, { 'Content-Type': 'text/plain' });
  res.end('Hello, World!');
});

server.listen(3000, () => {
  console.log('Server running at http://localhost:3000');
});
```

**Flow:**
```
Client (Browser)
      ↓  HTTP Request
 Node.js Server
      ↓  Runs callback
  req → inspect request
  res → send response
      ↓
Client receives response
```

---

## 📬 The Request Object (req)

```javascript
const server = http.createServer((req, res) => {
  console.log(req.method);   // GET, POST, PUT, DELETE
  console.log(req.url);      // /about, /users/1, etc.
  console.log(req.headers);  // { host, user-agent, ... }

  // req.url includes query string
  // GET /search?q=node  →  req.url = '/search?q=node'
});
```

---

## 📤 The Response Object (res)

```javascript
const server = http.createServer((req, res) => {
  // Set status code and headers
  res.writeHead(200, {
    'Content-Type': 'application/json',
    'X-Custom-Header': 'my-value',
  });

  // Send the body and end response
  res.end(JSON.stringify({ message: 'OK' }));
});
```

### Common Status Codes

| Code | Meaning |
|------|---------|
| `200` | OK |
| `201` | Created |
| `204` | No Content |
| `301` | Moved Permanently |
| `400` | Bad Request |
| `401` | Unauthorized |
| `403` | Forbidden |
| `404` | Not Found |
| `500` | Internal Server Error |

---

## 🔀 Basic Routing

```javascript
const http = require('http');

const server = http.createServer((req, res) => {
  const { method, url } = req;

  // GET /
  if (method === 'GET' && url === '/') {
    res.writeHead(200, { 'Content-Type': 'text/html' });
    res.end('<h1>Home Page</h1>');
    return;
  }

  // GET /about
  if (method === 'GET' && url === '/about') {
    res.writeHead(200, { 'Content-Type': 'text/plain' });
    res.end('About Page');
    return;
  }

  // GET /api/users
  if (method === 'GET' && url === '/api/users') {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify([{ id: 1, name: 'Alice' }]));
    return;
  }

  // 404 fallback
  res.writeHead(404, { 'Content-Type': 'text/plain' });
  res.end('404 Not Found');
});

server.listen(3000, () => console.log('Listening on port 3000'));
```

---

## 📥 Reading POST Body Data

```javascript
const http = require('http');

const server = http.createServer((req, res) => {
  if (req.method === 'POST' && req.url === '/data') {
    let body = '';

    // Data comes in chunks
    req.on('data', (chunk) => {
      body += chunk.toString();
    });

    // All data received
    req.on('end', () => {
      try {
        const parsed = JSON.parse(body);
        console.log('Received:', parsed);

        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ received: true, data: parsed }));
      } catch {
        res.writeHead(400, { 'Content-Type': 'text/plain' });
        res.end('Invalid JSON');
      }
    });
    return;
  }

  res.writeHead(404);
  res.end('Not Found');
});

server.listen(3000);
```

---

## 🌍 Making HTTP Requests

```javascript
const http = require('http');

// GET request
http.get('http://jsonplaceholder.typicode.com/todos/1', (res) => {
  let data = '';

  res.on('data', (chunk) => {
    data += chunk;
  });

  res.on('end', () => {
    const todo = JSON.parse(data);
    console.log(todo.title);
  });
}).on('error', (err) => {
  console.error('Request failed:', err.message);
});
```

---

## 🔧 Server Events

```javascript
const server = http.createServer(handler);

// Listening
server.listen(3000, 'localhost', () => {
  console.log('Server address:', server.address());
});

// Error handling
server.on('error', (err) => {
  if (err.code === 'EADDRINUSE') {
    console.error('Port already in use!');
  }
});

// Close server
server.close(() => {
  console.log('Server closed');
});
```

---

## ⚠️ Why Use Express Instead?

The raw `http` module is low-level. As soon as your app grows, use **Express**:

| Feature | http module | Express |
|---------|-------------|---------|
| Routing | Manual if/else | Clean `app.get()` |
| Body parsing | Manual chunks | `express.json()` |
| Static files | Manual | `express.static()` |
| Middleware | Manual | Built-in pipeline |
| Error handling | Manual | Centralized |

> The `http` module is the **foundation** — Express builds on top of it.

---

## 🔑 Key Takeaways

- `http.createServer()` creates a server — callback runs on every request
- `req` has method, URL, headers; `res` is used to send back data
- Use `res.writeHead(statusCode, headers)` then `res.end(body)`
- POST body data comes in chunks via `req.on('data', ...)` event
- For real apps, use **Express** which wraps the http module

---

[← Previous: File System](04-file-system.md) | [Contents](README.md) | [Next: Express.js →](06-express.md)
