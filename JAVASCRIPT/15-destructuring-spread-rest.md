# 13: Destructuring, Spread & Rest

## 📦 Array Destructuring

Array destructuring unpacks values from an array into named variables by position. Elements can be skipped, default values provided for missing positions, and remaining elements collected with a rest pattern. It provides a clean syntax for swapping variables or extracting values from a function's array return.

```js
// Basic
const [a, b, c] = [1, 2, 3];
console.log(a, b, c); // 1 2 3

// Skip elements with commas
const [, second, , fourth] = [1, 2, 3, 4];
console.log(second, fourth); // 2 4

// Default values
const [x = 10, y = 20] = [5];
console.log(x, y); // 5 20

// Rest element (must be last)
const [first, ...rest] = [1, 2, 3, 4, 5];
console.log(first); // 1
console.log(rest);  // [2, 3, 4, 5]

// Swap variables (elegant!)
let m = 1, n = 2;
[m, n] = [n, m];
console.log(m, n); // 2 1

// From function returns
function getCoords() { return [40.7128, -74.0060]; }
const [lat, lng] = getCoords();

// Nested array destructuring
const [[a1, a2], [b1, b2]] = [[1, 2], [3, 4]];
console.log(a1, b2); // 1 4

// Ignoring rest
const [head] = [1, 2, 3, 4]; // head = 1 (rest ignored)
```

---

## 🔑 Object Destructuring

Object destructuring extracts properties from an object into local variables by name. Properties can be renamed with `: newName`, given a default with `= value`, collected into a rest object with `...`, or accessed from nested objects by chaining the pattern. It is commonly used for function parameter destructuring.

```js
// Basic
const { name, age } = { name: "Alice", age: 30, city: "Paris" };
console.log(name, age); // "Alice" 30

// Rename while destructuring
const { name: userName, age: userAge } = { name: "Alice", age: 30 };
console.log(userName, userAge); // "Alice" 30

// Default values
const { host = "localhost", port = 3000 } = { port: 8080 };
console.log(host, port); // "localhost" 8080

// Rename + default
const { name: n = "Anonymous" } = {};
console.log(n); // "Anonymous"

// Rest/remaining properties
const { a, b, ...remaining } = { a: 1, b: 2, c: 3, d: 4 };
console.log(a, b);        // 1 2
console.log(remaining);   // { c: 3, d: 4 }

// Nested object destructuring
const { address: { city, zip } } = {
  name: "Alice",
  address: { city: "Paris", zip: "75001" },
};
console.log(city, zip); // "Paris" "75001"

// Combined nested + defaults
const {
  settings: {
    theme   = "light",
    sidebar = true,
  } = {},
} = userConfig ?? {};
```

---

## 🎯 Destructuring in Function Parameters

Destructuring directly in a function's parameter list lets you unpack the values you need from an object or array argument at the call site. This avoids repetitive `const x = options.x` boilerplate and makes the expected shape of the argument self-documenting.

```js
// Object parameter destructuring (most useful pattern)
function createUser({ name, email, role = "user", active = true }) {
  return { name, email, role, active };
}
createUser({ name: "Alice", email: "a@b.com" });

// With rename
function displayUser({ name: displayName, age: years }) {
  return `${displayName} (${years} years old)`;
}

// Array parameter destructuring
function processPoint([x, y, z = 0]) {
  return Math.sqrt(x**2 + y**2 + z**2);
}
processPoint([3, 4]);     // 5
processPoint([1, 2, 2]);  // 3

// Complex real-world example
function renderCard({
  title,
  description = "",
  image: { src, alt = title } = {},
  tags = [],
  author: { name: authorName } = {},
}) {
  // ...
}
```

---

## 🌊 Spread Operator `...`

### Spread with Arrays
```js
const a = [1, 2, 3];
const b = [4, 5, 6];

// Combine arrays
const combined = [...a, ...b];           // [1,2,3,4,5,6]
const withExtra = [0, ...a, ...b, 7];   // [0,1,2,3,4,5,6,7]

// Clone array (shallow)
const clone = [...a];       // [1, 2, 3] — new array

// Pass array as arguments
Math.max(...a);             // 3
Math.min(...a);             // 1
someFunc(...args);          // spread as arguments

// Convert iterable to array
const chars = [..."hello"]; // ["h","e","l","l","o"]
const setArr = [...new Set([1,2,2,3])]; // [1,2,3]

// Insert in middle
const arr = [1, 2, 5, 6];
const full = [...arr.slice(0, 2), 3, 4, ...arr.slice(2)]; // [1,2,3,4,5,6]
```

### Spread with Objects
```js
const defaults = { theme: "light", fontSize: 14, sidebar: true };
const userPrefs = { fontSize: 18, sidebar: false };

// Merge — later keys override earlier
const settings = { ...defaults, ...userPrefs };
// { theme: "light", fontSize: 18, sidebar: false }

// Clone object (shallow)
const clone = { ...original };

// Add/override properties immutably
const updated = { ...original, key: "newValue" };

// Remove property (destructure + spread)
const { unwanted, ...without } = original;

// Merge with override
const merged = { ...base, ...overrides, timestamp: Date.now() };
```

---

## 📦 Rest Parameters `...`

Rest gathers **remaining items** into an array (always last).

```js
// In function parameters
function sum(first, second, ...rest) {
  console.log(first);  // 1
  console.log(second); // 2
  console.log(rest);   // [3, 4, 5]
  return [first, second, ...rest].reduce((a, b) => a + b, 0);
}
sum(1, 2, 3, 4, 5); // 15

// Variadic function
function log(level, ...messages) {
  console[level](...messages);
}
log("info", "Server", "started", "on", "port", 3000);

// In destructuring
const [head, ...tail] = [1, 2, 3, 4];
const { a, ...rest } = { a: 1, b: 2, c: 3 };
```

---

## 🔄 Advanced Patterns

### Computed Key Destructuring
```js
const key = "name";
const { [key]: value } = { name: "Alice" };
console.log(value); // "Alice"

// Dynamic key in loop
const props = ["name", "age", "city"];
props.forEach(prop => {
  const { [prop]: val } = user;
  console.log(prop, val);
});
```

### Nested + Rest
```js
const {
  name,
  address: { city, ...addressRest },
  ...userRest
} = {
  name: "Alice",
  address: { city: "Paris", zip: "75001", country: "France" },
  age: 30,
  active: true,
};

console.log(city);        // "Paris"
console.log(addressRest); // { zip: "75001", country: "France" }
console.log(userRest);    // { age: 30, active: true }
```

### Object Spread for Immutable State (Redux/React pattern)
```js
const state = {
  user: { name: "Alice", preferences: { theme: "dark" } },
  loading: false,
};

// Update nested property immutably
const newState = {
  ...state,
  user: {
    ...state.user,
    preferences: {
      ...state.user.preferences,
      theme: "light",
    },
  },
};
```

### Swapping Object Properties
```js
let { a: x, b: y } = { a: 1, b: 2 };
({ x, y } = { x: y, y: x }); // swap
```

### Destructuring in for...of
```js
const entries = [["name", "Alice"], ["age", 30]];
for (const [key, value] of entries) {
  console.log(`${key}: ${value}`);
}

const people = [
  { name: "Alice", age: 30 },
  { name: "Bob", age: 25 },
];
for (const { name, age } of people) {
  console.log(`${name} is ${age}`);
}

// Object.entries
for (const [key, val] of Object.entries(obj)) {
  console.log(key, val);
}
```

---

## 🔑 Key Takeaways

- **Array destructuring** matches by **position**; **object destructuring** matches by **key name**.
- **Defaults** apply when the value is `undefined` (not `null` or `0`).
- **Rename** with `{ originalName: newName }`.
- **Rest** in destructuring (`...rest`) collects remaining items — must be last.
- **Spread** (`...`) expands iterables — works in calls, array literals, object literals.
- Spread creates **shallow copies** — nested objects still share references.
- Use `{ ...original, key: newVal }` for immutable object updates (avoid mutation).

---

[← Previous: Classes (ES6+)](14-classes.md) | [Contents](README.md) | [Next: Map, Set, WeakMap & WeakSet →](16-map-and-set.md)
