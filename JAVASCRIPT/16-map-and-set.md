# 14: Map, Set, WeakMap & WeakSet

## 🗺️ Map

A `Map` stores **key-value pairs** like an object, but keys can be **any type** (not just strings), and it remembers **insertion order**.

```js
const map = new Map();

// Set entries
map.set("name", "Alice");
map.set(42, "the answer");
map.set(true, "yes");
map.set({ id: 1 }, "object key!");

// Get entries
map.get("name");   // "Alice"
map.get(42);       // "the answer"
map.size;          // 4

// Check existence
map.has("name");   // true
map.has("email");  // false

// Delete
map.delete("name");
map.size;          // 3

// Clear all
map.clear();

// Initialize with entries
const config = new Map([
  ["host", "localhost"],
  ["port", 3000],
  ["debug", true],
]);
```

### Iterating Maps
```js
const scores = new Map([
  ["Alice", 95],
  ["Bob", 87],
  ["Charlie", 92],
]);

// Keys, values, entries
for (const key of scores.keys())     console.log(key);
for (const val of scores.values())   console.log(val);
for (const [k, v] of scores.entries()) console.log(k, v);
for (const [k, v] of scores)          console.log(k, v); // same as entries

// Convert
[...scores.keys()];    // ["Alice", "Bob", "Charlie"]
[...scores.values()];  // [95, 87, 92]
[...scores];           // [["Alice",95], ["Bob",87], ["Charlie",92]]

// Map ↔ Object
const obj = Object.fromEntries(scores);  // → plain object
const map2 = new Map(Object.entries(obj)); // → Map
```

### Map vs Object

| Feature | Map | Object |
|---------|-----|--------|
| Key types | Any | String/Symbol |
| Order | Insertion order | Insertion order (ES2015+) |
| Size | `.size` | `Object.keys().length` |
| Iteration | Direct iterable | `Object.entries()` |
| Prototype pollution | No | Yes (inherit toString etc.) |
| Performance (many entries) | Better | Good |

```js
// Use Map when:
// - Keys are not strings/symbols
// - You need to know the size easily
// - You frequently add/delete keys
// - You need pure key-value store (no prototype pollution)

// Use Object when:
// - Keys are strings, the data is record-like
// - You use JSON serialization
// - Simple config/options objects
```

---

## 🔵 Set

A `Set` is a collection of **unique values** (any type). Duplicates are automatically removed.

```js
const set = new Set([1, 2, 3, 2, 1]);
console.log(set);    // Set {1, 2, 3} — duplicates removed
set.size;            // 3

// Add / Delete / Has
set.add(4);
set.add(2);          // no-op — already exists
set.delete(1);
set.has(2);          // true
set.has(99);         // false

// Clear
set.clear();

// Iteration
const colors = new Set(["red", "green", "blue", "red"]);
for (const color of colors) console.log(color);  // red green blue

[...colors];  // ["red", "green", "blue"]
```

### Set Operations (ES2024 native or manual)

```js
const a = new Set([1, 2, 3, 4]);
const b = new Set([3, 4, 5, 6]);

// ES2024 native methods ✅
a.union(b);        // Set {1,2,3,4,5,6}
a.intersection(b); // Set {3,4}
a.difference(b);   // Set {1,2}
a.symmetricDifference(b); // Set {1,2,5,6}
a.isSubsetOf(b);   // false
a.isSupersetOf(b); // false

// Manual (older environments)
const union        = new Set([...a, ...b]);
const intersection = new Set([...a].filter(x => b.has(x)));
const difference   = new Set([...a].filter(x => !b.has(x)));
```

### Common Use Cases
```js
// Deduplicate an array
const arr = [1, 2, 2, 3, 3, 3, 4];
const unique = [...new Set(arr)];  // [1, 2, 3, 4] ✅

// Check if all elements are unique
const allUnique = arr => new Set(arr).size === arr.length;

// Remove duplicate strings (case-insensitive)
const words = ["Hello", "world", "hello", "WORLD"];
const uniqueWords = [...new Set(words.map(w => w.toLowerCase()))];
// ["hello", "world"]

// Fast membership test (O(1) vs O(n) for arrays)
const blocked = new Set(["spam@evil.com", "bot@fake.com"]);
blocked.has(userEmail); // O(1) lookup ✅
```

---

## 🔒 WeakMap

`WeakMap` is like `Map` but:
- **Keys must be objects** (not primitives)
- Keys are **weakly held** — when the object has no other references, it can be garbage collected
- **Not iterable** — no `.keys()`, `.values()`, `.forEach()`, `.size`

```js
const wm = new WeakMap();

let obj = { id: 1 };
wm.set(obj, "metadata");
wm.get(obj);    // "metadata"
wm.has(obj);    // true
wm.delete(obj);

// When obj goes out of scope:
obj = null;
// The entry in WeakMap is automatically garbage collected ✅
```

### WeakMap Use Cases

```js
// 1. Private data per instance (before # private fields)
const _private = new WeakMap();

class Person {
  constructor(name, age) {
    _private.set(this, { name, age });
  }
  greet() {
    const { name } = _private.get(this);
    return `Hi, I'm ${name}`;
  }
}

// 2. Caching per object (auto-cleaned when object is collected)
const cache = new WeakMap();

function processExpensive(obj) {
  if (cache.has(obj)) return cache.get(obj);
  const result = expensiveComputation(obj);
  cache.set(obj, result);
  return result;
}

// 3. DOM node metadata
const nodeData = new WeakMap();
nodeData.set(element, { clickCount: 0, lastClicked: null });
// Auto-cleans up when element is removed from DOM
```

---

## 🔵 WeakSet

`WeakSet` is like `Set` but:
- Values must be **objects** (not primitives)
- Values are **weakly held** — can be garbage collected
- **Not iterable** — only `.add()`, `.has()`, `.delete()`

```js
const ws = new WeakSet();

let obj = {};
ws.add(obj);
ws.has(obj);    // true
ws.delete(obj);

obj = null;
// Entry auto-removed by GC
```

### WeakSet Use Cases
```js
// 1. Track which objects have been processed (no memory leak)
const processed = new WeakSet();

function processOnce(item) {
  if (processed.has(item)) return;
  process(item);
  processed.add(item);
}

// 2. Prevent circular reference issues
const seen = new WeakSet();

function safeStringify(val) {
  return JSON.stringify(val, (key, value) => {
    if (typeof value === "object" && value !== null) {
      if (seen.has(value)) return "[Circular]";
      seen.add(value);
    }
    return value;
  });
}

// 3. Class instances validation
const validInstances = new WeakSet();
class SecureClass {
  constructor() {
    validInstances.add(this);
  }
  doSomething() {
    if (!validInstances.has(this)) throw new Error("Invalid instance");
    // ...
  }
}
```

---

## 📊 Comparison Summary

| | Map | Set | WeakMap | WeakSet |
|--|-----|-----|---------|---------|
| Keys/Values | Any → Any | Any | Object → Any | Object |
| Size | `.size` | `.size` | ❌ | ❌ |
| Iterable | ✅ | ✅ | ❌ | ❌ |
| Weak references | ❌ | ❌ | ✅ | ✅ |
| GC friendly | ❌ | ❌ | ✅ | ✅ |

---

## 🔑 Key Takeaways

- **Map** over Object when keys aren't strings/symbols or when you need size/iteration.
- **Set** for unique values and O(1) membership checks.
- Use `[...new Set(arr)]` for the cleanest array deduplication.
- **WeakMap/WeakSet** hold objects weakly — perfect for caches or metadata that should be GC'd with the object.
- WeakMap/WeakSet cannot be iterated — that's by design (GC timing is non-deterministic).

---

[← Previous: Destructuring, Spread & Rest](15-destructuring-spread-rest.md) | [Contents](README.md) | [Next: Symbols & Well-Known Symbols →](17-symbols.md)
