# 30: Functional Programming

## 💡 Core Principles

| Principle | Description |
|---|---|
| **Pure functions** | Same input → same output, no side effects |
| **Immutability** | Never mutate; always return new values |
| **Function composition** | Build complex behavior from small functions |
| **Declarative style** | Describe *what*, not *how* |
| **First-class functions** | Functions as values |

---

## 🧼 Pure Functions

```js
// ✅ Pure — same input always yields same output, no side effects
function add(a, b) { return a + b; }
const double = x => x * 2;

// ❌ Impure — reads external state
let tax = 0.1;
function price(amount) { return amount * (1 + tax); }  // depends on `tax`

// ❌ Impure — mutates external state
const cart = [];
function addToCart(item) { cart.push(item); }  // side effect

// ✅ Pure equivalent
function addToCart(cart, item) { return [...cart, item]; }

// Why pure functions matter:
// - Easy to test (no setup/teardown)
// - Easy to reason about
// - Can be memoized
// - Safe to run in parallel
```

---

## 🧊 Immutability

```js
// ❌ Mutating
const user = { name: "Alice", age: 25 };
user.age = 26;  // mutates original

// ✅ Immutable — create new objects
const updatedUser = { ...user, age: 26 };

// ❌ Mutating array
const nums = [1, 2, 3];
nums.push(4);     // mutates
nums.sort();      // mutates

// ✅ Immutable equivalents
const nums2 = [...nums, 4];
const sorted = nums.toSorted();  // ES2023

// Deep immutability with Object.freeze
const config = Object.freeze({
  host: "localhost",
  port: 3000,
});
config.port = 9000;  // silently fails (throws in strict mode)

// For deep freeze:
function deepFreeze(obj) {
  Object.keys(obj).forEach(key => {
    if (typeof obj[key] === "object" && obj[key] !== null) {
      deepFreeze(obj[key]);
    }
  });
  return Object.freeze(obj);
}

// Immutable update patterns
const state = { user: { name: "Alice", prefs: { theme: "dark" } } };

// Update nested property immutably
const newState = {
  ...state,
  user: {
    ...state.user,
    prefs: { ...state.user.prefs, theme: "light" },
  },
};

// Using structured clone for deep copy + modify
const copy = structuredClone(state);
copy.user.prefs.theme = "light";
```

---

## 🏗️ Declarative vs Imperative

```js
const users = [
  { name: "Alice", age: 25, active: true },
  { name: "Bob",   age: 17, active: false },
  { name: "Carol", age: 30, active: true },
];

// ❌ Imperative — tells HOW
const activeAdults = [];
for (let i = 0; i < users.length; i++) {
  if (users[i].active && users[i].age >= 18) {
    activeAdults.push(users[i].name.toUpperCase());
  }
}

// ✅ Declarative — tells WHAT
const activeAdults2 = users
  .filter(u => u.active && u.age >= 18)
  .map(u => u.name.toUpperCase());
```

---

## 🔗 Function Composition

```js
// pipe — left to right
const pipe = (...fns) => x => fns.reduce((v, f) => f(v), x);

// compose — right to left (math convention)
const compose = (...fns) => x => fns.reduceRight((v, f) => f(v), x);

const trim     = str => str.trim();
const lower    = str => str.toLowerCase();
const words    = str => str.split(/\s+/);
const toSet    = arr => [...new Set(arr)];
const sorted   = arr => arr.toSorted();

const normalize = pipe(trim, lower, words, toSet, sorted);
normalize("  Hello world hello  ");
// ["hello", "world"]

// Composing predicates
const and = (...preds) => x => preds.every(p => p(x));
const or  = (...preds) => x => preds.some(p => p(x));
const not = pred => x => !pred(x);

const isEven   = x  => x % 2 === 0;
const isPositive = x => x > 0;
const isEvenAndPositive = and(isEven, isPositive);

[-4, -2, 1, 2, 4].filter(isEvenAndPositive);  // [2, 4]
```

---

## 🍛 Currying & Partial Application

```js
// See HOF chapter for full detail

const curry = fn => function curried(...args) {
  return args.length >= fn.length
    ? fn(...args)
    : (...more) => curried(...args, ...more);
};

// Curried utilities enable point-free style
const map    = curry((fn, arr) => arr.map(fn));
const filter = curry((pred, arr) => arr.filter(pred));
const reduce = curry((fn, init, arr) => arr.reduce(fn, init));

const double    = x => x * 2;
const isPositive = x => x > 0;
const sum       = (a, b) => a + b;

const doubleAll   = map(double);
const positives   = filter(isPositive);
const totalSum    = reduce(sum, 0);

const process = pipe(positives, doubleAll, totalSum);
process([-1, 2, -3, 4, 5]);  // 22
```

---

## 🎯 Functors & Monads (simplified)

```js
// Functor — a thing you can map over (preserves structure)
// Arrays are functors! [1,2,3].map(f) returns [f(1),f(2),f(3)]

// Maybe functor — handles null/undefined safely
class Maybe {
  #value;
  constructor(value) { this.#value = value; }

  static of(value)   { return new Maybe(value); }
  static empty()     { return new Maybe(null); }

  isNothing()        { return this.#value == null; }

  map(fn) {
    return this.isNothing()
      ? Maybe.empty()
      : Maybe.of(fn(this.#value));
  }

  getOrElse(defaultValue) {
    return this.isNothing() ? defaultValue : this.#value;
  }
}

const user = { address: { city: "NYC" } };

// Without Maybe — verbose null checks
const city1 = user?.address?.city ?? "Unknown";

// With Maybe
const city2 = Maybe.of(user)
  .map(u => u.address)
  .map(a => a.city)
  .getOrElse("Unknown");

// Result monad — handle success/failure without throws
class Result {
  #value; #isOk;
  constructor(value, isOk) { this.#value = value; this.#isOk = isOk; }

  static ok(value)  { return new Result(value, true); }
  static err(error) { return new Result(error, false); }

  map(fn)     { return this.#isOk ? Result.ok(fn(this.#value)) : this; }
  mapErr(fn)  { return this.#isOk ? this : Result.err(fn(this.#value)); }
  flatMap(fn) { return this.#isOk ? fn(this.#value) : this; }

  match({ ok, err }) {
    return this.#isOk ? ok(this.#value) : err(this.#value);
  }
}

function parseAge(str) {
  const n = parseInt(str);
  if (isNaN(n)) return Result.err(`"${str}" is not a valid age`);
  if (n < 0)   return Result.err("Age cannot be negative");
  return Result.ok(n);
}

parseAge("25").match({
  ok:  age   => console.log(`Valid age: ${age}`),
  err: error => console.log(`Error: ${error}`),
});
```

---

## 🔄 Transducers (Advanced)

Compose transformations without creating intermediate arrays:

```js
// Normally map + filter creates 2 intermediate arrays:
arr.filter(isEven).map(double);  // [filter result] then [map result]

// Transducer approach — single pass:
const mapping   = fn    => reducer => (acc, x) => reducer(acc, fn(x));
const filtering = pred  => reducer => (acc, x) => pred(x) ? reducer(acc, x) : acc;

const concat = (acc, x) => [...acc, x];  // base reducer

const transducer = compose(filtering(isEven), mapping(double));
arr.reduce(transducer(concat), []);  // single pass!
```

---

## 📦 Immutable Data Patterns in Practice

```js
// State management (like Redux)
const initialState = { count: 0, items: [], user: null };

function reducer(state = initialState, action) {
  switch (action.type) {
    case "INCREMENT":
      return { ...state, count: state.count + 1 };

    case "ADD_ITEM":
      return { ...state, items: [...state.items, action.payload] };

    case "UPDATE_ITEM":
      return {
        ...state,
        items: state.items.map(item =>
          item.id === action.payload.id
            ? { ...item, ...action.payload }
            : item
        ),
      };

    case "REMOVE_ITEM":
      return {
        ...state,
        items: state.items.filter(item => item.id !== action.payload),
      };

    default:
      return state;
  }
}
```

---

## 🔑 Key Takeaways

- **Pure functions**: no side effects, deterministic — the foundation of FP.
- **Immutability**: never mutate; create new values — use spread, `toSorted`, `slice`.
- **Declarative**: use `map`/`filter`/`reduce` instead of imperative loops.
- **Composition**: `pipe` builds left-to-right data pipelines from small functions.
- **Currying** enables partial application and point-free style.
- **Maybe/Result** monads handle null and errors without exceptions.
- FP isn't all-or-nothing — applying these principles selectively improves any codebase.

---

[← Previous: Higher-Order Functions](35-higher-order-functions.md) | [Contents](README.md) | [Next: Design Patterns →](37-design-patterns.md)
