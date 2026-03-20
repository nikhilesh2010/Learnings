# 02: Modules & CommonJS

## 📦 What are Modules?

Modules are **reusable pieces of code** in separate files. Node.js uses a module system so each file has its own scope — variables don't bleed between files.

---

## 🔄 CommonJS (Default in Node.js)

CommonJS uses `require()` to import and `module.exports` to export.

### Exporting

```javascript
// math.js

// Export a single value
module.exports = function add(a, b) {
  return a + b;
};
```

```javascript
// utils.js

// Export multiple values as an object
const greet = (name) => `Hello, ${name}!`;
const farewell = (name) => `Goodbye, ${name}!`;

module.exports = { greet, farewell };
```

```javascript
// config.js

// Shorthand: exports.key = value
exports.PORT = 3000;
exports.DB_URL = 'mongodb://localhost:27017';
```

### Importing

```javascript
// app.js

const add = require('./math');           // single export
const { greet, farewell } = require('./utils');   // destructure
const config = require('./config');      // whole object
const fs = require('fs');               // built-in module
const express = require('express');     // npm package

console.log(add(2, 3));        // 5
console.log(greet('Alice'));   // Hello, Alice!
console.log(config.PORT);     // 3000
```

---

## 🆕 ES Modules (Modern Syntax)

Node.js also supports ES Modules (ESM) — the same syntax used in the browser.

```json
// package.json — to enable ES Modules
{
  "type": "module"
}
```

```javascript
// math.mjs  — OR use .mjs extension

// Named exports
export const add = (a, b) => a + b;
export const subtract = (a, b) => a - b;

// Default export
export default function multiply(a, b) {
  return a * b;
}
```

```javascript
// app.mjs
import multiply, { add, subtract } from './math.mjs';

console.log(add(2, 3));        // 5
console.log(multiply(4, 5));   // 20
```

### CommonJS vs ES Modules

| Feature | CommonJS | ES Modules |
|---------|----------|------------|
| Syntax | `require()` / `module.exports` | `import` / `export` |
| Loading | Synchronous | Asynchronous |
| Default in Node | ✅ Yes | Needs `"type":"module"` |
| Browser support | ❌ No | ✅ Yes |
| Dynamic imports | ✅ Easy | `import()` function |

---

## 🗂️ Built-in Core Modules

Node.js ships with modules you can use without installing anything:

```javascript
const fs = require('fs');         // File system
const path = require('path');     // File paths
const http = require('http');     // HTTP server
const https = require('https');   // HTTPS server
const os = require('os');         // Operating system info
const events = require('events'); // EventEmitter
const stream = require('stream'); // Streams
const crypto = require('crypto'); // Cryptography
const url = require('url');       // URL parsing
const util = require('util');     // Utility functions
```

---

## 📁 Module Resolution Order

When you `require('something')`, Node looks in order:

```
1. Core modules (fs, path, http...)
         ↓
2. node_modules folder
         ↓
3. Relative path (./file or ../file)
         ↓
4. If a folder: looks for index.js inside
```

```javascript
require('fs')           // → core module
require('express')      // → node_modules/express
require('./myModule')   // → ./myModule.js
require('./utils')      // → ./utils/index.js (if folder)
```

---

## 🔁 Module Caching

Node.js **caches** modules after the first `require()` — it won't re-execute the file.

```javascript
// counter.js
let count = 0;
module.exports = {
  increment: () => ++count,
  getCount: () => count,
};

// app.js
const counter = require('./counter');
const counter2 = require('./counter'); // same object (cached)

counter.increment();
console.log(counter2.getCount()); // 1 — same instance!
```

---

## 🔑 Special Variables in Modules

Every Node.js module has these available automatically:

```javascript
console.log(__dirname);   // Absolute path of current folder
console.log(__filename);  // Absolute path of current file
console.log(module);      // Module info object
console.log(exports);     // Shorthand for module.exports
console.log(require);     // The require function
```

```javascript
// Useful pattern: build paths relative to current file
const path = require('path');
const filePath = path.join(__dirname, 'data', 'users.json');
```

---

## 🎯 Practical Example: Organizing a Project

```
project/
├── app.js
├── utils/
│   ├── index.js      ← barrel export
│   ├── math.js
│   └── string.js
└── config/
    └── index.js
```

```javascript
// utils/math.js
exports.add = (a, b) => a + b;
exports.multiply = (a, b) => a * b;

// utils/string.js
exports.capitalize = (str) => str.charAt(0).toUpperCase() + str.slice(1);

// utils/index.js  — barrel export
module.exports = {
  ...require('./math'),
  ...require('./string'),
};

// app.js — clean import
const { add, capitalize } = require('./utils');
console.log(add(1, 2));         // 3
console.log(capitalize('hello')); // Hello
```

---

## 🔑 Key Takeaways

- Use `require()` / `module.exports` for CommonJS (default)
- Use `import` / `export` for ES Modules (needs config)
- Core modules are built-in — no installation needed
- Modules are **cached** after first load
- `__dirname` and `__filename` give you the current file's location

---

[← Previous: What is Node.js?](01-introduction.md) | [Contents](README.md) | [Next: NPM & Package Management →](03-npm.md)
