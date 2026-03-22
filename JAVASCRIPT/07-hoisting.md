# 07: Hoisting & Temporal Dead Zone

## ⬆️ What is Hoisting?

**Hoisting** is JavaScript's behaviour of moving declarations to the top of their scope during the compilation phase — before any code runs.

> Only **declarations** are hoisted, NOT initializations.

---

## `var` Hoisting

```js
// What you write:
console.log(x); // undefined (NOT ReferenceError!)
var x = 5;
console.log(x); // 5

// What the engine sees (conceptually):
var x;           // declaration hoisted to top
console.log(x);  // undefined — declared but not yet assigned
x = 5;           // assignment stays in place
console.log(x);  // 5
```

```js
// var inside a function — hoisted to top of FUNCTION scope
function test() {
  console.log(a); // undefined (hoisted)
  var a = 10;
  console.log(a); // 10
}

// Classic var gotcha in loops
for (var i = 0; i < 3; i++) {}
console.log(i); // 3 — i leaked to function/global scope!
```

---

## Function Declaration Hoisting

Function declarations are **fully hoisted** — the entire function body moves up.

```js
// You can call a function BEFORE it appears
greet("Alice"); // "Hello, Alice!" — works!

function greet(name) {
  return `Hello, ${name}!`;
}

// Order in the file doesn't matter for declarations
helper(); // ✅

function main() {
  helper(); // ✅
}

function helper() {
  console.log("helper ran");
}

main();
```

---

## Function Expression & Arrow Function Hoisting

These are **not** hoisted (only the `var` binding is, not the function value).

```js
// var function expression — variable hoisted as undefined
sayHi(); // TypeError: sayHi is not a function

var sayHi = function() {
  console.log("Hi!");
};

// let/const function expression — TDZ error
greet(); // ReferenceError: Cannot access 'greet' before initialization

const greet = () => "Hello!";
```

---

## ⏳ Temporal Dead Zone (TDZ)

`let` and `const` declarations are also hoisted, but they are placed in a **Temporal Dead Zone** — the region between the start of the block and the declaration line, where accessing them throws a `ReferenceError`.

```js
// TDZ starts here for x
console.log(x); // ❌ ReferenceError: Cannot access 'x' before initialization
let x = 10;
// TDZ ends here
console.log(x); // ✅ 10

// const has the same TDZ behaviour
console.log(y); // ❌ ReferenceError
const y = 20;
```

```js
// TDZ is per-block
let a = "outer";

{
  console.log(a); // ❌ ReferenceError — inner `a` is in TDZ
  let a = "inner";
  console.log(a); // ✅ "inner"
}
```

### Why does TDZ exist?
```
TDZ prevents a class of bugs where you access a variable
before it has a meaningful value. With var, you'd silently
get `undefined` — with let/const, you get a loud error ✅
```

---

## Hoisting Summary Table

| Declaration | Hoisted? | Initialised to | TDZ |
|-------------|----------|----------------|-----|
| `var` | Yes | `undefined` | No |
| `let` | Yes | (uninitialized) | Yes |
| `const` | Yes | (uninitialized) | Yes |
| `function` declaration | Yes (fully) | Function object | No |
| `function` expression (`var`) | Partially | `undefined` | No |
| `function` expression (`let`/`const`) | Yes | (uninitialized) | Yes |
| `class` | Yes | (uninitialized) | Yes |

---

## Class Hoisting & TDZ

```js
// Class declarations are in TDZ — cannot use before definition
const obj = new Animal(); // ❌ ReferenceError

class Animal {
  constructor(name) { this.name = name; }
}

const dog = new Animal("Rex"); // ✅
```

---

## import Hoisting

```js
// Imports are hoisted and evaluated BEFORE any code runs
// This is valid:
console.log(add(1, 2)); // ✅ (if add.js exports `add`)

import { add } from "./add.js";
```

---

## Real-World Hoisting Bugs

### Bug 1: var in Conditional
```js
// ❌ This looks like it creates x only when flag is true
if (flag) {
  var x = 10; // but var is ALWAYS hoisted to function scope
}
console.log(x); // 10 or undefined depending on flag — confusing!

// ✅ Use let/const
if (flag) {
  let x = 10; // stays in the if block
}
// console.log(x); // ReferenceError — clearly outside scope
```

### Bug 2: Function vs Expression
```js
var double = function(n) { return n * 2; }; // ← expression
function double(n) { return n * 3; }        // ← declaration, hoisted first

double(5); // 10 — the expression OVERRIDES the hoisted declaration!

// Execution order:
// 1. function double hoisted (returns n*3)
// 2. var double hoisted as undefined
// 3. Code runs: double assigned to function(n*2)
// 4. double(5) → 10 from the expression
```

### Bug 3: Variable in Same Name as Function
```js
function foo() { return "function"; }
var foo;  // just a declaration — doesn't override the function

console.log(typeof foo); // "function" — declaration wins

var foo = "variable"; // ASSIGNMENT overrides
console.log(typeof foo); // "string"
```

---

## Best Practices

```js
// ✅ Declare all variables at the TOP of their scope
function process(data) {
  const result = [];  // at top
  const MAX = 100;    // at top
  let i = 0;          // at top

  // ... rest of code
}

// ✅ Use const/let instead of var
// ✅ Define functions before using them (even though declarations are hoisted)
// ✅ Avoid relying on hoisting — it makes code harder to read

// ✅ Never use a variable before it's declared
```

---

## 🔑 Key Takeaways

- `var` declarations are hoisted and initialised to `undefined`.
- Function **declarations** are fully hoisted (callable anywhere in scope).
- `let` and `const` are hoisted but in the **Temporal Dead Zone** — accessing before declaration throws `ReferenceError`.
- `class` declarations are also in the TDZ.
- **Don't rely on hoisting** — declare variables and functions before using them for cleaner, predictable code.

---

[← Previous: Scope & Closures](06-scope-and-closures.md) | [Contents](README.md) | [Next: Objects →](08-objects.md)
