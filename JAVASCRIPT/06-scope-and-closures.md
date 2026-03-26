# 06: Scope & Closures

## 🗺️ What is Scope?

Scope determines **where variables are visible** in your code. JS has four types of scope.

---

## 1. Global Scope

Variables declared outside any function or block are in the global scope and accessible everywhere. `var` declarations at the top level become properties of the global object (`window` in browsers), while `let` and `const` do not.

```js
var globalVar = "I'm global";   // on window in browsers
let globalLet = "Also global";  // NOT on window

function test() {
  console.log(globalVar); // accessible
  console.log(globalLet); // accessible
}

// ⚠️ Accidental globals (without var/let/const)
function oops() {
  accidental = "BAD!"; // creates a global property
}
// Use "use strict" to prevent this
```

---

## 2. Function Scope

Variables declared with `var`, `let`, or `const` inside a function are only visible within that function. `var` in particular is function-scoped rather than block-scoped, which means it leaks out of `if` blocks and loops but is still contained within the enclosing function.

```js
function myFunc() {
  var funcVar = "function scope";
  let funcLet = "also function scope";

  console.log(funcVar); // ✅
  console.log(funcLet); // ✅
}

// console.log(funcVar); // ReferenceError: not defined outside
// console.log(funcLet); // ReferenceError

// var is function-scoped, not block-scoped:
function test() {
  if (true) {
    var leaked = "I leak!";   // leaks to function scope
    let safe   = "contained"; // stays in block
  }
  console.log(leaked); // "I leak!"
  // console.log(safe); // ReferenceError
}
```

---

## 3. Block Scope (ES6 — let & const)

`let` and `const` are block-scoped: they are accessible only within the `{}` block where they are declared. This fixes the classic `var`-in-loop closure bug because each loop iteration gets its own binding.

```js
{
  let x = 10;
  const y = 20;
  console.log(x, y); // ✅
}
// console.log(x); // ReferenceError

for (let i = 0; i < 3; i++) {
  setTimeout(() => console.log(i), 100); // 0 1 2 ✅
}

// Classic bug with var
for (var i = 0; i < 3; i++) {
  setTimeout(() => console.log(i), 100); // 3 3 3 ❌ (var leaks)
}
```

---

## 4. Module Scope

Each ES module file has its own top-level scope. Variables declared at the module's top level are scoped to that module and are not added to the global object, preventing accidental global pollution.

```js
// Each ES module has its own scope
// Variables defined at the top level are module-scoped, not global
export const API_URL = "https://api.example.com"; // not on window
```

---

## 🔭 Lexical Scope (Static Scope)

JS uses **lexical scoping** — scope is determined by where the code is **written**, not where it's called from.

```js
const x = "global";

function outer() {
  const x = "outer";

  function inner() {
    const x = "inner";
    console.log(x); // "inner" — nearest scope wins
  }

  console.log(x); // "outer"
  inner();
}

outer();
console.log(x); // "global"
```

### Scope Chain
```
inner → outer → global
              ↑
inner can see outer variables, outer CANNOT see inner's
```

---

## 🔒 Closures

A **closure** is a function bundled with its **lexical environment** — it retains access to variables from its outer scope even after the outer function has returned.

```js
function makeAdder(x) {
  // x is "closed over" by the returned function
  return function(y) {
    return x + y;  // x still accessible!
  };
}

const add5 = makeAdder(5);
const add10 = makeAdder(10);

add5(3);   // 8  — x = 5, y = 3
add10(3);  // 13 — x = 10, y = 3
```

### How Closures Work Internally

```
makeAdder(5) call:
  Creates an environment: { x: 5 }
  Returns a function that holds a REFERENCE to that environment
  
  Environment is NOT garbage collected because the returned
  function still references it!
```

---

## 🔐 Practical Closure Patterns

### 1. Private State / Module Pattern
```js
function createCounter(initial = 0) {
  let count = initial;  // PRIVATE — not accessible outside

  return {
    increment(by = 1) { count += by; return this; },
    decrement(by = 1) { count -= by; return this; },
    reset()           { count = initial; return this; },
    value()           { return count; },
  };
}

const c = createCounter(10);
c.increment().increment().decrement();
console.log(c.value()); // 11
console.log(count);     // ReferenceError! count is private ✅
```

### 2. Function Factory
```js
function validator(min, max) {
  return (value) => value >= min && value <= max;
}

const isValidAge   = validator(0, 120);
const isValidScore = validator(0, 100);

isValidAge(25);    // true
isValidScore(105); // false
```

### 3. Memoization
```js
function memoize(fn) {
  const cache = new Map();  // closed over by returned function

  return function(...args) {
    const key = JSON.stringify(args);
    if (cache.has(key)) {
      return cache.get(key);
    }
    const result = fn.apply(this, args);
    cache.set(key, result);
    return result;
  };
}

const expensiveFib = memoize(function fib(n) {
  return n <= 1 ? n : expensiveFib(n - 1) + expensiveFib(n - 2);
});
```

### 4. Partial Application
```js
function multiply(a, b) { return a * b; }

function partial(fn, ...presetArgs) {
  return function(...laterArgs) {
    return fn(...presetArgs, ...laterArgs);
  };
}

const double = partial(multiply, 2);
const triple = partial(multiply, 3);

double(5); // 10
triple(5); // 15
```

### 5. Once Function
```js
function once(fn) {
  let called = false;
  let result;

  return function(...args) {
    if (!called) {
      called = true;
      result = fn.apply(this, args);
    }
    return result;
  };
}

const init = once(() => {
  console.log("Initialized!");
  return 42;
});

init(); // "Initialized!" → 42
init(); // 42 (no log — already called)
```

---

## ⚠️ Closure Gotcha — Loop Variables

When `var` is used in a loop, all callback closures share a reference to the same variable. By the time the callbacks execute, the loop has already finished and `i` holds its final value. Using `let` instead creates a new binding for each iteration, giving each closure its own copy.

```js
// Common bug with var and closures in loops
for (var i = 0; i < 3; i++) {
  setTimeout(function() {
    console.log(i); // 3 3 3 — all closures share the SAME i
  }, 100);
}

// Fix 1: Use let (creates new binding per iteration) ✅
for (let i = 0; i < 3; i++) {
  setTimeout(() => console.log(i), 100); // 0 1 2 ✅
}

// Fix 2: IIFE to create new scope per iteration
for (var i = 0; i < 3; i++) {
  (function(j) {
    setTimeout(() => console.log(j), 100); // 0 1 2
  })(i);
}

// Fix 3: bind
for (var i = 0; i < 3; i++) {
  setTimeout(console.log.bind(null, i), 100); // 0 1 2
}
```

---

## 🔍 Variable Shadowing

A variable declaration in an inner scope that uses the same name as an outer-scope variable is said to shadow it. The inner declaration is completely independent; accessing the name inside the inner scope resolves to the inner binding, leaving the outer binding unchanged.

```js
const name = "global";

function outer() {
  const name = "outer";  // shadows global name

  function inner() {
    const name = "inner";  // shadows outer name
    console.log(name);     // "inner"
  }

  inner();
  console.log(name);  // "outer"
}

outer();
console.log(name);  // "global"
```

---

## 📦 The Module Pattern (pre-ES6)

Before ES modules, the module pattern used an IIFE to create a private scope and returned only the public-facing API. Closures kept the internal state hidden from the outside world. ES `import`/`export` syntax is preferred today, but this pattern still appears in legacy codebases.

```js
const MyModule = (function() {
  // Private
  let _data = [];
  let _count = 0;

  function _validate(item) {
    return item !== null && item !== undefined;
  }

  // Public API
  return {
    add(item) {
      if (_validate(item)) {
        _data.push(item);
        _count++;
      }
    },
    remove(item) {
      _data = _data.filter(d => d !== item);
      _count--;
    },
    getCount() { return _count; },
    getAll()   { return [..._data]; }, // return copy
  };
})();

MyModule.add(1);
MyModule.add(2);
console.log(MyModule.getCount()); // 2
// _data is inaccessible from outside ✅
```

---

## 🔑 Key Takeaways

- **Scope** = where a variable is accessible.
- **Lexical scope** = determined by where code is *written*, not *called*.
- **Closures** = a function + its lexical environment — it remembers outer variables.
- Use `let`/`const` in loops to avoid the classic closure bug with `var`.
- Closures enable private state, function factories, memoization, and more.
- The **scope chain** lookup goes: local → enclosing → global → ReferenceError.

---

[← Previous: Functions](05-functions.md) | [Contents](README.md) | [Next: Hoisting & Temporal Dead Zone →](07-hoisting.md)
