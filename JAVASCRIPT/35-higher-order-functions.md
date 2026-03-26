# 29: Higher-Order Functions

## 🧠 What Is a Higher-Order Function?

A function that either:
1. **Takes one or more functions as arguments**, or
2. **Returns a function**

```js
// Takes a function → map, filter, forEach, reduce
[1, 2, 3].map(x => x * 2);

// Returns a function → factory, closure-based
function multiplier(factor) {
  return (x) => x * factor;    // ← returns new function
}
const double = multiplier(2);
const triple = multiplier(3);
double(5);  // 10
triple(5);  // 15
```

---

## 🏭 Function Factories

Create specialized functions from a generic one:

```js
// Adder factory
const add = (a) => (b) => a + b;
const add5  = add(5);
const add10 = add(10);
add5(3);   // 8
add10(3);  // 13

// Greeting factory
function greet(greeting) {
  return (name) => `${greeting}, ${name}!`;
}
const sayHi   = greet("Hi");
const sayHello = greet("Hello");
sayHi("Alice");    // "Hi, Alice!"
sayHello("Bob");   // "Hello, Bob!"

// Validator factory
function rangeValidator(min, max) {
  return (value) => value >= min && value <= max;
}
const isValidAge = rangeValidator(0, 120);
isValidAge(25);  // true
isValidAge(-1);  // false
```

---

## ⛓️ Function Composition

Combining functions so the output of one feeds the next:

```js
// compose — right to left (mathematical notation f(g(x)))
const compose = (...fns) => (x) => fns.reduceRight((v, f) => f(v), x);

// pipe — left to right (more readable for data pipelines)
const pipe = (...fns) => (x) => fns.reduce((v, f) => f(v), x);

const double    = x => x * 2;
const addOne    = x => x + 1;
const square    = x => x * x;

const transform = pipe(double, addOne, square);
transform(3);  // square(addOne(double(3))) = square(7) = 49

// Processing pipeline
const processUser = pipe(
  user => ({ ...user, name: user.name.trim() }),
  user => ({ ...user, email: user.email.toLowerCase() }),
  user => ({ ...user, role: user.role ?? "user" }),
);

processUser({ name: " Alice ", email: "ALICE@EXAMPLE.COM" });
// { name: "Alice", email: "alice@example.com", role: "user" }
```

---

## 🍛 Currying

Transform a multi-argument function into a chain of single-argument functions:

```js
// Manual curry
function add(a) {
  return function(b) {
    return function(c) {
      return a + b + c;
    };
  };
}
add(1)(2)(3);  // 6

// Generic curry function
function curry(fn) {
  return function curried(...args) {
    if (args.length >= fn.length) {
      return fn.apply(this, args);
    }
    return (...more) => curried(...args, ...more);
  };
}

const curriedAdd = curry((a, b, c) => a + b + c);
curriedAdd(1)(2)(3);    // 6
curriedAdd(1, 2)(3);    // 6
curriedAdd(1)(2, 3);    // 6
curriedAdd(1, 2, 3);    // 6

// Real-world currying
const get = curry((key, obj) => obj[key]);
const names = [{ name: "Alice" }, { name: "Bob" }];
names.map(get("name"));  // ["Alice", "Bob"]

// Practical: curried HTTP helper
const request = curry(async (method, url, body) => {
  const res = await fetch(url, {
    method,
    body: body ? JSON.stringify(body) : undefined,
    headers: { "Content-Type": "application/json" },
  });
  return res.json();
});

const get2  = request("GET");
const post  = request("POST");
const users = await get2("/api/users")(null);
await post("/api/users")({ name: "Alice" });
```

---

## 🔁 Partial Application

Fix some arguments, leaving others for later:

```js
// Using bind
function power(base, exp) { return base ** exp; }
const square = power.bind(null, undefined, 2);  // ← doesn't work cleanly with bind

// Better: partial utility
function partial(fn, ...presetArgs) {
  return (...laterArgs) => fn(...presetArgs, ...laterArgs);
}

const double = partial((factor, x) => x * factor, 2);
double(5);  // 10
double(7);  // 14

const log = partial(console.log, "[APP]");
log("Server started");  // "[APP] Server started"
```

---

## 🔄 Memoize

Cache expensive computations:

```js
function memoize(fn) {
  const cache = new Map();
  return function(...args) {
    const key = JSON.stringify(args);
    if (cache.has(key)) return cache.get(key);
    const result = fn.apply(this, args);
    cache.set(key, result);
    return result;
  };
}

const slowFib = (n) => n <= 1 ? n : slowFib(n - 1) + slowFib(n - 2);
const fib     = memoize(slowFib);

fib(40);  // fast with cache

// Memoize with WeakMap for object keys (avoids memory leak)
function memoizeWeak(fn) {
  const cache = new WeakMap();
  return function(obj, ...rest) {
    if (!cache.has(obj)) cache.set(obj, fn(obj, ...rest));
    return cache.get(obj);
  };
}
```

---

## ⏱️ Debounce & Throttle

Debounce delays a function until a burst of calls stops — ideal for search inputs. Throttle limits how often a function runs during continuous firing — ideal for scroll and resize handlers. Both return a new wrapper function.

```js
// Debounce — delay execution until after N ms of silence
function debounce(fn, wait) {
  let timer;
  return function(...args) {
    clearTimeout(timer);
    timer = setTimeout(() => fn.apply(this, args), wait);
  };
}

// Use case: search-as-you-type
const search = debounce(async (query) => {
  const results = await searchAPI(query);
  render(results);
}, 300);

input.addEventListener("input", e => search(e.target.value));


// Throttle — execute at most once per N ms
function throttle(fn, limit) {
  let lastTime = 0;
  return function(...args) {
    const now = Date.now();
    if (now - lastTime >= limit) {
      lastTime = now;
      return fn.apply(this, args);
    }
  };
}

// Use case: scroll handler
const onScroll = throttle(() => updateScrollProgress(), 100);
window.addEventListener("scroll", onScroll);
```

---

## 🔂 Once, Before, After

`once` wraps a function so it executes only the first time it's called and returns the cached result on subsequent calls. `atMost` allows up to `n` calls, and `after` delays execution until after `n` calls have occurred.

```js
// Execute at most once
function once(fn) {
  let called = false;
  let result;
  return function(...args) {
    if (!called) {
      called  = true;
      result  = fn.apply(this, args);
    }
    return result;
  };
}

const initialize = once(() => {
  console.log("Initialized");
  return { ready: true };
});

initialize();  // "Initialized", returns { ready: true }
initialize();  // returns { ready: true } (from cache, no log)

// Execute only N times
function atMost(n, fn) {
  let count = 0;
  return function(...args) {
    if (count < n) {
      count++;
      return fn.apply(this, args);
    }
  };
}

// Execute after N calls
function after(n, fn) {
  let count = 0;
  return function(...args) {
    if (++count >= n) return fn.apply(this, args);
  };
}
```

---

## 🔍 Practical Patterns

Small utility combinators like `tap` (inspect a value mid-pipeline without changing it) and `identity` (return the value unchanged) make function composition pipelines more debuggable and expressive.

```js
// "tap" — inspect value in pipeline without changing it
const tap = (fn) => (x) => { fn(x); return x; };

pipe(
  x => x * 2,
  tap(x => console.log("After double:", x)),
  x => x + 1,
)(5);  // logs "After double: 10", returns 11

// "identity" — passthrough
const identity = x => x;
arr.filter(identity);  // removes falsy values

// "constant" — return same value always
const always = (x) => () => x;
const alwaysTrue  = always(true);
const alwaysFalse = always(false);

// "negate" — flip a predicate
const negate = (fn) => (...args) => !fn(...args);
const isEven = x => x % 2 === 0;
const isOdd  = negate(isEven);
[1,2,3,4,5].filter(isOdd);  // [1, 3, 5]

// Flipped argument order
const flip = (fn) => (a, b, ...rest) => fn(b, a, ...rest);
const subtract = (a, b) => a - b;
const subtractFrom = flip(subtract);
subtractFrom(3, 10);  // 10 - 3 = 7
```

---

## 🔑 Key Takeaways

- HOFs either accept or return functions — they enable reusable, composable logic.
- **Curry**: transform `f(a, b, c)` → `f(a)(b)(c)` — great for partial specialization.
- **Partial application**: fix some arguments now, supply the rest later.
- **Compose/pipe**: chain functions without intermediate variables.
- **Memoize**: cache results; best for pure functions with expensive computation.
- **Debounce**: execute after a pause (search boxes, resize handlers).
- **Throttle**: execute at most once per interval (scroll, mousemove handlers).
- **Once**: run a function at most one time (initialization, event binding).

---

[← Previous: Array Methods](34-array-methods.md) | [Contents](README.md) | [Next: Functional Programming Patterns →](36-functional-programming.md)
