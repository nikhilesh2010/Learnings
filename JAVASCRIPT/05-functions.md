# 05: Functions

## 📝 Function Declaration

```js
// Hoisted — can be called before it appears in the code
greet("Alice");  // works!

function greet(name) {
  return `Hello, ${name}!`;
}
```

## 📝 Function Expression

```js
// NOT hoisted — must be defined before use
const greet = function(name) {
  return `Hello, ${name}!`;
};

// Named function expression (useful for recursion & stack traces)
const factorial = function fact(n) {
  return n <= 1 ? 1 : n * fact(n - 1);
};
```

## ➡️ Arrow Functions (ES6)

```js
// Concise syntax
const add = (a, b) => a + b;            // implicit return
const double = n => n * 2;              // single param, no parens needed
const greet = () => "Hello!";           // no params — parens required
const makeObj = (x, y) => ({ x, y });   // return object: wrap in ()

// Block body — explicit return needed
const divide = (a, b) => {
  if (b === 0) throw new Error("Division by zero");
  return a / b;
};

// Key differences from regular functions:
// 1. No own `this` — inherits from enclosing scope
// 2. No `arguments` object
// 3. Cannot be used as constructors (no `new`)
// 4. No `prototype` property
```

---

## 🎯 Parameters

### Default Parameters (ES6)
```js
function greet(name = "World", greeting = "Hello") {
  return `${greeting}, ${name}!`;
}
greet();              // "Hello, World!"
greet("Alice");       // "Hello, Alice!"
greet("Bob", "Hi");   // "Hi, Bob!"

// Default can reference previous params
function createUser(name, role = "user", id = `${name}-${Date.now()}`) {
  return { name, role, id };
}
```

### Rest Parameters
```js
function sum(...numbers) {
  return numbers.reduce((total, n) => total + n, 0);
}
sum(1, 2, 3, 4, 5);  // 15

// Rest must be last
function log(level, ...messages) {
  console.log(`[${level}]`, ...messages);
}
log("INFO", "Server", "started", "on", "port", 3000);
```

### `arguments` Object (legacy — avoid)
```js
function legacy() {
  console.log(arguments); // array-like, not a real array
  // Use rest params instead ✅
}
```

---

## 🔄 Returning Values

```js
// Explicit return
function add(a, b) { return a + b; }

// Multiple values via object/array
function minMax(arr) {
  return { min: Math.min(...arr), max: Math.max(...arr) };
}
const { min, max } = minMax([3, 1, 4, 1, 5, 9]);

// Early return (guard clause)
function process(data) {
  if (!data) return null;
  if (!data.valid) return { error: "Invalid data" };
  return transform(data);
}
```

---

## 🌀 First-Class Functions

Functions are **values** — they can be stored, passed, and returned.

```js
// Stored in variables
const fn = function() {};

// Stored in arrays
const pipeline = [parse, validate, transform, save];
pipeline.forEach(step => step(data));

// Stored in objects
const math = {
  add: (a, b) => a + b,
  sub: (a, b) => a - b,
};

// Passed as arguments (callbacks)
[1, 2, 3].map(n => n * 2);

// Returned from functions
function multiplier(factor) {
  return (n) => n * factor;  // returns a new function
}
const triple = multiplier(3);
triple(5);  // 15
```

---

## 🏭 Immediately Invoked Function Expression (IIFE)

```js
// Creates a private scope — useful for avoiding global pollution
(function() {
  const secret = "only inside here";
  console.log("IIFE ran!");
})();

// Arrow IIFE
(() => {
  console.log("Arrow IIFE");
})();

// With parameter
(function(global) {
  global.MY_LIB = {};
})(window);
```

---

## ♻️ Recursion

```js
// Factorial
function factorial(n) {
  if (n <= 1) return 1;       // base case
  return n * factorial(n - 1); // recursive case
}
factorial(5); // 120

// Fibonacci
function fib(n) {
  if (n <= 1) return n;
  return fib(n - 1) + fib(n - 2);
}

// Tree traversal
function traverse(node) {
  if (!node) return;
  console.log(node.value);
  traverse(node.left);
  traverse(node.right);
}

// Tail call optimization (supported by modern engines with strict mode)
function factTail(n, acc = 1) {
  if (n <= 1) return acc;
  return factTail(n - 1, n * acc);  // tail position ✅
}
```

---

## 📦 Pure Functions

```js
// Pure: same inputs always produce same outputs, no side effects
function add(a, b) { return a + b; }
function toUpperCase(str) { return str.toUpperCase(); }

// Impure: modifies external state or depends on external state
let count = 0;
function increment() { count++; }  // modifies external state

const users = [];
function addUser(user) { users.push(user); }  // mutates arr

// Make it pure:
function addUser(users, user) { return [...users, user]; }  // returns new array ✅
```

---

## 🔒 Closures

A closure is a function that **remembers** its outer scope even after the outer function returns.

```js
function makeCounter(start = 0) {
  let count = start;  // enclosed variable

  return {
    increment() { count++; },
    decrement() { count--; },
    value()     { return count; },
  };
}

const counter = makeCounter(10);
counter.increment();
counter.increment();
console.log(counter.value()); // 12
// count is private — not accessible from outside

// Practical: function factory
function power(exponent) {
  return (base) => base ** exponent;
}
const square = power(2);
const cube   = power(3);
square(4);  // 16
cube(2);    // 8
```

---

## 🔗 `this` in Functions

```js
// Regular function — `this` depends on HOW it's called
const obj = {
  name: "Alice",
  greet() {
    return `Hi, I'm ${this.name}`;  // this = obj
  },
};
obj.greet();  // "Hi, I'm Alice"

// Arrow functions — `this` inherited from enclosing scope
const obj2 = {
  name: "Bob",
  greet: () => `Hi, I'm ${this.name}`,  // this = outer (window/undefined)
};
obj2.greet();  // "Hi, I'm undefined"

// Explicit binding
function greet() { return `Hi, ${this.name}`; }
greet.call({ name: "Alice" });         // "Hi, Alice"
greet.apply({ name: "Bob" });          // "Hi, Bob"
const greetAlice = greet.bind({ name: "Alice" });  // returns new function
greetAlice();                          // "Hi, Alice"
```

---

## 🔢 Function Length & Name

```js
function add(a, b) {}
add.name;   // "add"
add.length; // 2 (param count, rest/default not counted)

const fn = (a, b = 1, ...rest) => {};
fn.length;  // 1 (only a — default and rest not counted)
```

---

## 🏗️ Constructor Functions (pre-class)

```js
function Person(name, age) {
  this.name = name;
  this.age  = age;
}
Person.prototype.greet = function() {
  return `Hi, I'm ${this.name}`;
};

const alice = new Person("Alice", 30);
alice.greet(); // "Hi, I'm Alice"
// Use class syntax instead — same thing, nicer syntax
```

---

## 📋 Function Best Practices

```js
// ✅ Single responsibility — one function, one job
// ✅ Descriptive names: verbs for actions
function fetchUser(id) {}
function calculateTotal(items) {}
function isEmailValid(email) {}

// ✅ Keep functions small — 10-20 lines max
// ✅ Limit parameters — > 3 params → use an options object
function createUser({ name, email, role = "user" }) {}

// ✅ Prefer pure functions
// ✅ Use const for function expressions
// ✅ Arrow functions for callbacks
[1, 2, 3].map(n => n * 2);  // not: .map(function(n) { return n * 2; })
```

---

## 🔑 Key Takeaways

- Function **declarations** are hoisted; **expressions** are not.
- Arrow functions have no own `this`, `arguments`, or `prototype`.
- Use **default parameters** instead of `arg || default` patterns.
- **Closures** allow private state — each call gets its own enclosed scope.
- Functions are first-class values — pass them, return them, store them.
- Prefer **pure functions** — they're easier to test and reason about.

---

[← Previous: Control Flow](04-control-flow.md) | [Contents](README.md) | [Next: Scope & Closures →](06-scope-and-closures.md)
