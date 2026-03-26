# 25: Modules

## 📦 ES Modules (ESM)

ES Modules are the native JavaScript module system (ES6+).

```js
// ── math.js ──────────────────────────────────
// Named exports
export const PI = 3.14159;

export function add(a, b) {
  return a + b;
}

export class Vector2 {
  constructor(x, y) { this.x = x; this.y = y; }
  add(other) { return new Vector2(this.x + other.x, this.y + other.y); }
}

// Default export (one per file)
export default function multiply(a, b) {
  return a * b;
}

// ── main.js ──────────────────────────────────
// Named imports
import { PI, add, Vector2 } from "./math.js";

// Default import
import multiply from "./math.js";

// Both at once
import multiply, { PI, add } from "./math.js";

// Rename on import
import { add as sum, Vector2 as Vec } from "./math.js";

// Import everything as namespace
import * as math from "./math.js";
math.PI;         // 3.14159
math.add(2, 3);  // 5
math.default;    // the default export (multiply)
```

---

## 🔄 Re-exports (Barrel Files)

A barrel file (`index.js`) re-exports selected items from multiple modules, giving consumers a single convenient import path instead of knowing every internal file location. This is the standard pattern for organizing utility or component libraries.

```js
// ── utils/index.js ──────────────────────────
export { add, PI }          from "./math.js";
export { formatDate }       from "./date.js";
export { debounce }         from "./timing.js";
export { default as http }  from "./http.js";
export * from "./strings.js";  // re-export all named

// ── consumer.js ─────────────────────────────
import { add, formatDate, debounce, http } from "./utils/index.js";
```

---

## 🚀 Dynamic Import

Load modules lazily at runtime — great for code splitting.

```js
// Returns a Promise<Module>
const math = await import("./math.js");
math.add(2, 3);
math.default(2, 3);    // access default

// In async function
async function loadChart() {
  const { Chart } = await import("./chart.js");
  new Chart(canvas, config);
}

// Conditional loading
if (userWantsAdmin) {
  const { AdminPanel } = await import("./admin.js");
  renderAdmin(AdminPanel);
}

// Dynamic path (must be a template literal or string)
const lang = "en";
const translations = await import(`./i18n/${lang}.js`);

// import.meta — module metadata
import.meta.url;      // URL of current module file
import.meta.env;      // Vite/bundler environment variables
```

---

## 🗂️ Module Loading Rules

ESM resolves paths relative to the importing file. Bare specifiers (like `"react"`) work in Node.js and bundlers but not in browsers without an import map. Use `import.meta.url` to determine the current module's URL.

```
// ✅ Relative path
import "./utils.js";
import "../shared/helpers.js";

// ✅ Absolute path (less common in browsers)
import "/src/utils.js";

// ✅ URL (browsers support this)
import "https://cdn.skypack.dev/lodash-es";

// ✅ Bare specifier — works in Node.js / with bundlers
import "lodash";
import "react";

// ❌ Bare specifiers don't work in browsers without importmap
```

### Import Maps (browser native)

```html
<script type="importmap">
{
  "imports": {
    "lodash": "https://cdn.skypack.dev/lodash-es",
    "utils/": "/src/utils/"
  }
}
</script>
<script type="module">
  import { debounce } from "lodash";
  import { add } from "utils/math.js";
</script>
```

---

## 🔑 Module Characteristics

ESM has several important behaviors that differ from regular scripts: modules are deferred by default, run in strict mode automatically, have their own file scope (no globals), are cached as singletons, and export live bindings that reflect mutations in the exporting module.

```js
// 1. Deferred by default (like defer attribute)
//    Scripts execute after HTML parse

// 2. Strict mode enabled automatically
//    "use strict" is not needed

// 3. Own scope — no global leaking
let secret = 42;   // not available as window.secret

// 4. Singleton — modules are cached after first import
//    Multiple imports of same file = same module instance

// 5. Live bindings — named exports reflect updates
// counter.js
export let count = 0;
export function increment() { count++; }

// main.js
import { count, increment } from "./counter.js";
console.log(count);  // 0
increment();
console.log(count);  // 1  ← live binding updated!
```

---

## 📜 CommonJS (Node.js)

CommonJS is Node.js's original module system, using `require()` to import and `module.exports` to export. It's synchronous and dynamic (evaluated at runtime), which differs fundamentally from ESM's static analysis. Modern Node.js supports both, but ESM is the recommended standard.

```js
// ── math.cjs.js ──────────────────────────────
const PI = 3.14159;

function add(a, b) { return a + b; }

// Named exports via module.exports object
module.exports = { PI, add };

// Or modify exports directly
exports.PI  = PI;
exports.add = add;

// Default-style export (replace entire exports)
module.exports = add;  // only add is exported

// ── main.cjs.js ──────────────────────────────
const { PI, add } = require("./math.cjs.js");
const add2 = require("./math.cjs.js");  // whole module

// Node.js built-in
const fs   = require("fs");
const path = require("path");
```

---

## ⚖️ ESM vs CommonJS

| Feature | ESM | CommonJS |
|---|---|---|
| Syntax | `import / export` | `require / module.exports` |
| Loading | Static (compile-time) | Dynamic (runtime) |
| Tree-shaking | ✅ Yes | ❌ No |
| Top-level await | ✅ Yes | ❌ No |
| Default in Browser | ✅ Native | ❌ Needs bundler |
| Default in Node.js | Supported (`.mjs` or `"type":"module"`) | Default |
| `__dirname` / `__filename` | ❌ (use `import.meta.url`) | ✅ |
| Circular deps | Works (live bindings) | Works (cached snapshot) |

---

## 📁 Module Patterns in Projects

A common project layout uses barrel `index.js` files in each feature folder to provide clean import paths, and separates concerns into `utils/`, `api/`, and `components/` directories. This makes imports predictable and keeps individual files focused.

```
src/
├── index.js          ← entry point
├── utils/
│   ├── index.js      ← barrel (re-exports everything)
│   ├── math.js
│   ├── date.js
│   └── format.js
├── api/
│   ├── index.js
│   ├── users.js
│   └── posts.js
└── components/
    ├── Button.js
    └── Modal.js
```

---

## 🔑 Key Takeaways

- Named exports: `export { name }` / `import { name } from "..."`.
- Default exports: `export default value` / `import name from "..."` (one per file).
- Dynamic `import()` returns a Promise — use for lazy loading / code splitting.
- ES Modules run in strict mode automatically and have their own scope.
- Modules are singletons — the same instance is shared across all imports.
- Named export bindings are **live** — mutations in the exporting module are visible.
- CommonJS (`require`) is Node's legacy system; ESM is the modern standard.

---

[← Previous: Service Workers & PWA](30-service-workers.md) | [Contents](README.md) | [Next: Proxy & Reflect →](32-proxy-and-reflect.md)
