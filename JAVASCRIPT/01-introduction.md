# 01: Introduction to JavaScript

## 🚀 What is JavaScript?

**JavaScript (JS)** is a lightweight, interpreted, multi-paradigm programming language. It is the only programming language natively understood by web browsers, making it the language of the web. With Node.js it also runs on servers, IoT devices, and desktop apps.

| Axis | Detail |
|------|--------|
| **Created by** | Brendan Eich at Netscape, 1995 (in 10 days!) |
| **Standard** | ECMAScript (ECMA-262) — maintained by TC39 |
| **Current edition** | ES2024 |
| **Paradigms** | Procedural, Object-Oriented, Functional |
| **Typing** | Dynamic, loosely typed |
| **Execution** | Single-threaded with a non-blocking event loop |

---

## 🌐 Where Does JS Run?

JavaScript runs across a wide range of environments. In browsers it is executed by engines like V8 (Chrome), SpiderMonkey (Firefox), and JavaScriptCore (Safari); on the server via Node.js; on mobile via React Native; and on the desktop via Electron.

```
Frontend  →  Browser (Chrome V8, Firefox SpiderMonkey, Safari JavaScriptCore)
Backend   →  Node.js (V8 engine)
Mobile    →  React Native, Ionic
Desktop   →  Electron, Tauri
Scripts   →  Deno, Bun
```

---

## ⚙️ How JS is Executed

JavaScript source code passes through a multi-stage pipeline before producing output. The engine parses the source into an Abstract Syntax Tree, compiles it to bytecode via an interpreter, and then applies JIT optimisation for frequently executed ("hot") code paths — all happening automatically at runtime.

```
Source (.js)
    ↓
Parsing → AST (Abstract Syntax Tree)
    ↓
Bytecode compilation (V8 Ignition interpreter)
    ↓
JIT Compilation (V8 TurboFan optimizer for hot paths)
    ↓
Machine Code → Output
```

> Unlike C/C++, you never call a compiler manually. The engine handles everything at runtime.

---

## 📝 Your First Programs

A JavaScript program can run directly inside an HTML page via a `<script>` tag, or from the command line using Node.js. The `console.log()` function is the standard way to print output in both environments.

```html
<!-- index.html — runs in browser -->
<!DOCTYPE html>
<html>
  <body>
    <script>
      console.log("Hello from the browser!");
      alert("Hello, World!");
    </script>
  </body>
</html>
```

```js
// hello.js — run with: node hello.js
console.log("Hello from Node.js!");
```

---

## 🛠️ Essential Tools

### Browser DevTools (Console)
Press `F12` → Console tab. You can run any JS directly here.

```js
// Try these in the browser console right now:
2 + 2          // 4
"hello".toUpperCase()  // "HELLO"
[1,2,3].map(x => x * 2)  // [2, 4, 6]
```

### Node.js REPL
```bash
node          # starts interactive REPL
> 1 + 1       # 2
> .exit       # exits
```

### VS Code Setup
```bash
# Install Node.js from nodejs.org
node --version   # v18+
npm --version    # 9+

# Useful VS Code extensions:
# - ESLint
# - Prettier
# - JavaScript (ES6) code snippets
```

---

## 📜 JavaScript vs ECMAScript

| Term | Meaning |
|------|---------|
| **ECMAScript** | The official language specification (the rules) |
| **JavaScript** | The implementation of ECMAScript by browser vendors |
| **ES5** | 2009 — baseline still supported everywhere |
| **ES6 / ES2015** | 2015 — the big modern overhaul (classes, arrow fns, modules…) |
| **ES2020+** | Optional chaining, nullish coalescing, BigInt… |
| **ESNext** | Future/proposed features in TC39 pipeline |

---

## 🔢 The 3 Layers of the Web

Every webpage is built from three complementary technologies: HTML defines the structure, CSS defines the appearance, and JavaScript defines the behaviour. Keeping these concerns separate makes code easier to maintain and reason about.

```
HTML  →  Structure (what exists)
CSS   →  Presentation (how it looks)
JS    →  Behaviour (what it does)
```

```html
<!-- All three together -->
<button id="btn">Click me</button>
<style>#btn { background: steelblue; color: white; padding: 8px 16px; }</style>
<script>
  document.getElementById("btn").addEventListener("click", () => {
    alert("Button clicked!");
  });
</script>
```

---

## 🏷️ JavaScript Characteristics

### Dynamically Typed
```js
let x = 42;        // number
x = "hello";       // now a string — totally fine
x = true;          // now a boolean
x = { name: "JS" };// now an object
```

### First-Class Functions
```js
// Functions are values — they can be stored, passed, returned
const greet = function(name) { return `Hello, ${name}!`; };
const shout = (fn) => fn("World").toUpperCase();

console.log(shout(greet)); // "HELLO, WORLD!"
```

### Prototype-Based Inheritance
```js
// Objects inherit from other objects directly
const animal = { breathes: true };
const dog = Object.create(animal);
dog.barks = true;

console.log(dog.breathes); // true — inherited from animal
```

### Single-Threaded & Non-Blocking
```js
// Long operations don't block the main thread
console.log("Start");

setTimeout(() => console.log("Async!"), 0);

console.log("End");
// Output: Start → End → Async!
```

---

## 🔀 Including JavaScript

Script tags can be inline, external, deferred, or async. Use the `defer` attribute for most application scripts so the HTML parses completely before the script executes — this prevents errors caused by accessing DOM elements that haven't loaded yet.

```html
<!-- 1. Inline (avoid for anything >trivial) -->
<script>console.log("inline");</script>

<!-- 2. External file (preferred) -->
<script src="app.js"></script>

<!-- 3. Deferred — file loads in parallel, executes after HTML parsed -->
<script src="app.js" defer></script>

<!-- 4. Async — loads and executes as soon as possible (order not guaranteed) -->
<script src="analytics.js" async></script>
```

> **Best practice:** Always use `defer` for your app scripts placed in `<head>`.

---

## 📌 "use strict"

Strict mode opts into a restricted variant of JavaScript that catches common coding mistakes and throws errors for unsafe actions such as assigning to undeclared variables. ES Modules (files using `import`/`export`) are always in strict mode automatically.

```js
"use strict";  // opt-in to strict mode — catches common mistakes

// Without strict mode:
x = 5; // silently creates a global variable!

// With strict mode:
"use strict";
x = 5; // ReferenceError: x is not defined ✅ caught
```

> ES Modules (import/export) are always strict by default.

---

## 💬 Comments

Single-line comments use `//` and multi-line comments use `/* */`. JSDoc comments starting with `/**` are recognised by IDEs and documentation generators to provide type information and inline API documentation.

```js
// Single-line comment

/*
  Multi-line comment
  spans multiple lines
*/

/**
 * JSDoc comment — used for documentation
 * @param {string} name - The person's name
 * @returns {string} A greeting
 */
function greet(name) {
  return `Hello, ${name}!`;
}
```

---

## 🔑 Key Takeaways

- JavaScript is the language of the web — browser + server + mobile.
- It is interpreted and JIT-compiled at runtime (no build step required).
- It is dynamic, functional, and prototype-based.
- Use `"use strict"` and modern ES6+ syntax from day one.
- Open DevTools and experiment constantly — the console is your playground.

---

[Contents](README.md) | [Next: Variables & Data Types →](02-variables-and-types.md)
