# 05: Functions

## 📝 Function Declaration

A function declaration defines a named function using the `function` keyword. Declarations are fully hoisted, meaning they can be called anywhere in their scope — even on lines that appear before the definition.

```js
// Hoisted — can be called before it appears in the code
greet("Alice");  // works!

function greet(name) {
  return `Hello, ${name}!`;
}
```

## 📝 Function Expression

A function expression assigns a function to a variable. Unlike declarations, expressions are not hoisted, so the variable must be defined before it is called. Named function expressions are useful for recursion and for producing clearer stack traces.

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

Arrow functions provide a concise syntax with an implicit return for single expressions. They do not bind their own `this`, `arguments`, or `prototype`, making them ideal as callbacks but unsuitable for use as object methods or constructors.

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

A function returns `undefined` by default unless an explicit `return` statement is reached. Functions can return multiple values by packing them into an object or array. Early returns act as guard clauses that make the happy path easier to follow.

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

An IIFE is a function that is defined and called in the same expression. It creates a private scope that does not pollute the surrounding namespace — a pattern commonly used before ES modules made scoped encapsulation straightforward.

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

A recursive function calls itself until it reaches a base case. It is a natural fit for tree traversal, divide-and-conquer algorithms, and any problem with a self-similar structure. Every recursive function must have a clearly defined base case to prevent infinite recursion.

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

A pure function always returns the same output for the same inputs and has no side effects — it does not read from or write to any external state. Pure functions are predictable, easy to test, and straightforward to compose.

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

In regular functions, `this` refers to the object that called the function, and can change depending on the call site. Arrow functions capture `this` from their enclosing lexical scope and never have a `this` of their own. Use `call`, `apply`, or `bind` to set `this` explicitly.

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

Every function has a `name` property (set automatically from the variable or declaration name) and a `length` property reporting the number of declared parameters. Parameters with default values and rest parameters are not counted in `length`.

```js
function add(a, b) {}
add.name;   // "add"
add.length; // 2 (param count, rest/default not counted)

const fn = (a, b = 1, ...rest) => {};
fn.length;  // 1 (only a — default and rest not counted)
```

---

## 🏗️ Constructor Functions (pre-class)

Before ES6 classes, constructor functions called with `new` were used to create object instances. Methods were placed on the constructor's `prototype` so they were shared across all instances. ES6 `class` syntax is preferred today — it is cleaner and produces identical runtime behaviour.

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

Keep functions small and focused on a single task. Use named functions for reusable logic, arrow functions for short callbacks, and an options object when a function requires more than three parameters. Prefer pure functions wherever possible to make code easier to test and reason about.

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
