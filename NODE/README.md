# Node.js Backend Playbook

Learn Node.js by building servers, APIs, and tooling with a practical, backend-first approach.

## 📚 Table of Contents

### **Fundamentals**
1. [What is Node.js?](01-introduction.md)
2. [Modules & CommonJS](02-modules.md)
3. [NPM & Package Management](03-npm.md)
4. [File System](04-file-system.md)
5. [HTTP Module](05-http-module.md)

### **Express.js**
6. [Express.js Introduction](06-express.md)
7. [Routing](07-routing.md)
8. [Middleware](08-middleware.md)
9. [REST APIs](09-rest-api.md)

### **Async & Core Internals**
10. [Async JavaScript](10-async-javascript.md)
11. [Event Loop & EventEmitter](11-event-loop.md)
12. [Streams & Buffers](12-streams.md)

### **Production Topics**
13. [Error Handling](13-error-handling.md)
14. [Environment & Config](14-environment-config.md)
15. [Database Integration](15-database.md)
16. [Authentication & JWT](16-authentication.md)

### **Security & Best Practices**
17. [Security Best Practices](17-security.md)
18. [Best Practices & Patterns](18-best-practices.md)
19. [Debugging & Performance](19-debugging.md)

---

## Prerequisites

- Node.js 18+ installed
- Basic JavaScript knowledge
- Familiarity with the command line

---

## 🚀 Quick Start

```bash
node --version
npm init -y
npm install express
```

```javascript
const express = require('express');
const app = express();

app.get('/', (req, res) => res.send('Hello, Node.js!'));

app.listen(3000, () => console.log('Server running on port 3000'));
```

```bash
node index.js
```

Visit `http://localhost:3000` to see your server in action.

---

## 🔑 Key Features

| Feature | Description |
|---------|-------------|
| **Non-Blocking I/O** | Handles many connections concurrently without threading |
| **V8 Engine** | Fast JavaScript execution via Google's V8 runtime |
| **NPM Ecosystem** | Largest package registry with 2M+ packages |
| **Event-Driven** | Event loop enables highly scalable applications |
| **Cross-Platform** | Runs on Windows, macOS, and Linux |

---

*Happy building with Node.js! 🟩*
