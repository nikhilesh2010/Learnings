# 01: What is Node.js?

## 🚀 Introduction

**Node.js** is a JavaScript runtime built on Chrome's V8 engine that lets you run JavaScript outside the browser — on the server side.

### Why Node.js?

| Feature | Benefit |
|---------|---------|
| **Non-blocking I/O** | Handles many requests without waiting |
| **Single Language** | JavaScript on both frontend and backend |
| **Fast** | V8 engine compiles JS to machine code |
| **Large Ecosystem** | npm has millions of packages |
| **Event-Driven** | Efficient for real-time apps |

---

## 📊 How Node.js Works

```
Client Request → Node.js (Single Thread) → Event Loop → Response
                        ↓
              Non-blocking I/O (DB, Files, APIs)
```

**Traditional (Blocking) Server:**
```javascript
// Thread waits doing nothing while DB query runs
const data = db.query('SELECT * FROM users'); // blocks thread
console.log(data);
```

**Node.js (Non-blocking):**
```javascript
// Thread is free to handle other requests while waiting
db.query('SELECT * FROM users', (err, data) => {
  console.log(data); // called when ready
});
// continues running immediately
```

---

## 🏗️ Core Concepts at a Glance

### **1. Runtime**
JavaScript that runs on the server (not browser)

```javascript
// This runs in Node.js, not the browser
console.log('Hello from Node!');
console.log(process.version); // Node version
```

### **2. Modules**
Node.js uses a module system to organize code

```javascript
const fs = require('fs');       // built-in module
const express = require('express'); // npm module
const myUtil = require('./util');   // your own file
```

### **3. Async by Default**
Almost all I/O operations are asynchronous

```javascript
const fs = require('fs');
fs.readFile('file.txt', 'utf8', (err, data) => {
  console.log(data);
});
```

### **4. npm**
The world's largest software registry

```bash
npm install express   # install a package
npm start             # run your app
```

### **5. Event Loop**
Node's secret to handling concurrency with one thread

---

## 🎯 Node.js Workflow

```
┌─────────────────┐
│  Write JS Code  │
│  (server-side)  │
└────────┬────────┘
         │
         ↓
┌─────────────────┐
│   Node.js       │
│   Runtime       │
└────────┬────────┘
         │
         ↓
┌─────────────────┐
│   V8 Engine     │
│ Executes Code   │
└────────┬────────┘
         │
         ↓
┌─────────────────┐
│  libuv handles  │
│  async I/O      │
└─────────────────┘
```

---

## 🌍 Where Node.js Shines

| Use Case | Why Node.js |
|----------|-------------|
| **REST APIs** | Fast, lightweight servers |
| **Real-time apps** | WebSockets, chat, live feeds |
| **Microservices** | Small, fast, scalable services |
| **CLI tools** | Use same JS skills |
| **Streaming** | Video, file streaming efficiently |

---

## ⚡ Node.js vs Browser JavaScript

| Feature | Browser JS | Node.js |
|---------|-----------|---------|
| `document`, `window` | ✅ Available | ❌ Not available |
| `fs`, `http`, `path` | ❌ Not available | ✅ Available |
| `localStorage` | ✅ Available | ❌ Not available |
| `process`, `__dirname` | ❌ Not available | ✅ Available |
| Module system | ES Modules | CommonJS + ES Modules |

---

## 🔧 Quick Start

```bash
# Check Node.js version
node --version

# Run a JS file
node app.js

# Start Node REPL (interactive mode)
node
```

```javascript
// app.js - your first Node.js program
console.log('Node.js is running!');
console.log('Node version:', process.version);
console.log('Platform:', process.platform);
```

---

## 🔑 Key Takeaways

- Node.js lets you run JavaScript on the server
- It uses a **single-threaded event loop** for concurrency
- **Non-blocking I/O** makes it fast and scalable
- Built on the **V8 JavaScript engine** (same as Chrome)
- Huge ecosystem through **npm**

---

[Contents](README.md) | [Next: Modules & CommonJS →](02-modules.md)
