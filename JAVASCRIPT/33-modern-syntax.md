# 27: Modern JavaScript Syntax (ES2016–ES2024)

## 📅 ES2016 (ES7)

```js
// Array.prototype.includes (vs indexOf)
[1, 2, 3].includes(2);     // true
[1, 2, NaN].includes(NaN); // true  (indexOf can't find NaN)
[1, 2, 3].includes(2, 1);  // true  (start from index 1)

// Exponentiation operator **
2 ** 10;    // 1024
2 ** 0.5;   // Math.sqrt(2) ≈ 1.414
(-2) ** 3;  // -8
```

---

## 📅 ES2017 (ES8)

```js
// Object.values / Object.entries
const obj = { a: 1, b: 2, c: 3 };
Object.values(obj);   // [1, 2, 3]
Object.entries(obj);  // [["a", 1], ["b", 2], ["c", 3]]

// String padding
"5".padStart(3, "0");   // "005"
"hello".padEnd(10, "."); // "hello....."

// Object.getOwnPropertyDescriptors — deep clone helpers
const source = { get foo() { return 1; } };
const copy   = Object.create(
  Object.getPrototypeOf(source),
  Object.getOwnPropertyDescriptors(source)
);  // preserves getters/setters

// Async / Await (see dedicated chapter)
// Trailing commas in function parameters
function fn(a, b, c,) {}  // valid — easier git diffs
```

---

## 📅 ES2018 (ES9)

```js
// Object spread / rest
const { a, ...rest } = { a: 1, b: 2, c: 3 };  // rest = { b:2, c:3 }
const merged = { ...obj1, ...obj2 };            // shallow merge

// Promise.finally
fetch(url)
  .then(process)
  .catch(handleError)
  .finally(() => setLoading(false));  // always runs

// Async iteration
async function readStream(stream) {
  for await (const chunk of stream) {
    process(chunk);
  }
}

// RegExp improvements
// Named capture groups
const { year, month, day } =
  /(?<year>\d{4})-(?<month>\d{2})-(?<day>\d{2})/.exec("2024-03-15").groups;

// Lookbehind assertions
/(?<=\$)\d+/.exec("$100");    // matches "100"
/(?<!\$)\d+/.exec("€100");    // matches "100"

// dotAll flag (s)
/foo.bar/s.test("foo\nbar");  // true (. matches newlines)
```

---

## 📅 ES2019 (ES10)

```js
// Array.flat / Array.flatMap
[1, [2, [3, [4]]]].flat();     // [1, 2, [3, [4]]]  (depth 1)
[1, [2, [3, [4]]]].flat(2);    // [1, 2, 3, [4]]
[1, [2, [3, [4]]]].flat(Infinity); // [1, 2, 3, 4]

[[1, 2], [3, 4]].flatMap(x => x); // [1, 2, 3, 4]
["hello world", "foo bar"].flatMap(s => s.split(" "));
// ["hello", "world", "foo", "bar"]

// Object.fromEntries — inverse of Object.entries
Object.fromEntries([["a", 1], ["b", 2]]); // { a:1, b:2 }
Object.fromEntries(
  Object.entries(obj).map(([k, v]) => [k, v * 2])
);  // double all values

// String trimStart / trimEnd
"  hello  ".trimStart();  // "hello  "
"  hello  ".trimEnd();    // "  hello"

// Optional catch binding
try {
  dangerousOp();
} catch {              // no (e) needed
  console.log("failed");
}

// Array.prototype.sort is now stable (guaranteed in spec)
```

---

## 📅 ES2020 (ES11)

```js
// Optional chaining ?.
const user = null;
user?.name;               // undefined (no error)
user?.address?.city;      // undefined
user?.greet();            // undefined
arr?.[0];                 // undefined if arr is null/undefined

// Nullish coalescing ??
const name = user?.name ?? "Anonymous";
const port = config.port ?? 3000;

// ?? vs ||
0  ?? "default";   // 0      (only null/undefined triggers ??)
0  || "default";   // "default"  (falsy triggers ||)
"" ?? "default";   // ""
"" || "default";   // "default"

// BigInt
const huge = 9007199254740991n;  // Number.MAX_SAFE_INTEGER
const big  = BigInt("12345678901234567890");
big + 10n;     // ✅
big + 10;      // ❌ TypeError — can't mix BigInt and Number

// Promise.allSettled
const results = await Promise.allSettled([
  fetch("/api/users"),
  fetch("/api/posts"),
]);
for (const r of results) {
  if (r.status === "fulfilled") console.log(r.value);
  else console.log("Error:", r.reason);
}

// globalThis — works in browser, Node.js, Web Workers
globalThis.setTimeout === window.setTimeout;  // true in browser

// String.matchAll
const regex = /(\d+)/g;
for (const match of "a1b2c3".matchAll(regex)) {
  console.log(match[0], match.index);
}
// "1" 1, "2" 3, "3" 5

// import() — dynamic import (see Modules chapter)
// export * as ns from "..." re-exports
export * as utils from "./utils.js";
```

---

## 📅 ES2021 (ES12)

```js
// Logical assignment operators
let x = null;
x ||= "default";    // if falsy, assign
x &&= x.trim();     // if truthy, assign  
x ??= "fallback";   // if null/undefined, assign

// Equivalent to:
// x = x || "default"
// x = x && x.trim()
// x = x ?? "fallback"

// String.replaceAll
"a-b-c-d".replaceAll("-", ".");  // "a.b.c.d"
// (vs "a-b-c-d".replace(/-/g, "."))

// Promise.any — first fulfilled (opposite of race for errors)
const first = await Promise.any([fetch(url1), fetch(url2), fetch(url3)]);
// Returns first successful, rejects with AggregateError if ALL reject

// Numeric separators (just for readability)
const million    = 1_000_000;
const hex        = 0xFF_EC_D8_12;
const bytes      = 0b1010_0001;
const pi         = 3.141_592;

// WeakRef — weak reference (doesn't prevent GC)
const ref = new WeakRef(bigObject);
ref.deref()?.doSomething();  // deref() returns object or undefined

// FinalizationRegistry
const registry = new FinalizationRegistry((value) => {
  console.log(`${value} was GC'd`);
});
registry.register(obj, "myObject");
```

---

## 📅 ES2022 (ES13)

```js
// Class fields & private methods (see Classes chapter)
class Counter {
  count = 0;               // public field
  #secret = "hidden";      // private field
  #increment() { this.count++; }  // private method
  static defaultStep = 1;  // static field
}

// Array / String .at() — negative indexing!
[1, 2, 3, 4, 5].at(-1);    // 5
[1, 2, 3, 4, 5].at(-2);    // 4
"hello".at(-1);             // "o"

// Object.hasOwn (safer than .hasOwnProperty)
Object.hasOwn({ a: 1 }, "a");  // true — preferred
Object.hasOwn({ a: 1 }, "b");  // false

// Error.cause
throw new Error("Database failed", { cause: originalError });
// err.cause === originalError

// Top-level await (in modules)
// fetch.js ← a module
const config = await fetch("/config.json").then(r => r.json());
export { config };

// Array.prototype.findLast / findLastIndex
[1, 2, 3, 4, 5].findLast(x => x % 2 === 0);       // 4
[1, 2, 3, 4, 5].findLastIndex(x => x % 2 === 0);  // 3
```

---

## 📅 ES2023 (ES14)

```js
// Array change methods (non-mutating alternatives)
const arr = [3, 1, 2];
arr.toSorted();     // [1, 2, 3] — arr unchanged
arr.toReversed();   // [2, 1, 3] — arr unchanged
arr.toSpliced(1, 1, 99);  // [3, 99, 2] — arr unchanged
arr.with(1, 99);    // [3, 99, 2] — arr unchanged (replace at index)

// Symbols as WeakMap keys
const sym = Symbol("key");
const wm = new WeakMap();
wm.set(sym, "value");     // ✅ ES2023

// groupBy (Array.prototype.group moved to Object.groupBy)
const people = [
  { name: "Alice", dept: "eng" },
  { name: "Bob",   dept: "eng" },
  { name: "Carol", dept: "hr" },
];
const byDept = Object.groupBy(people, p => p.dept);
// { eng: [Alice, Bob], hr: [Carol] }

Map.groupBy(people, p => p.dept);  // returns Map
```

---

## 📅 ES2024 (ES15)

```js
// Promise.withResolvers — cleaner deferred pattern
const { promise, resolve, reject } = Promise.withResolvers();

// Before (boilerplate):
// let resolve, reject;
// const promise = new Promise((res, rej) => { resolve = res; reject = rej; });

// Object.groupBy / Map.groupBy (moved from ES2023 proposal to standard)

// ArrayBuffer.prototype.transfer — detach and move buffer (low-level)

// RegExp /v flag (unicodeSets) — advanced Unicode matching
/^\p{Emoji}$/v.test("😀");   // true
/[\p{L}--\p{ASCII}]/v;       // set difference in character classes
```

---

## 🔑 Key Takeaways

- `?.` (optional chaining) prevents "cannot read property of null" errors.
- `??` (nullish coalescing) only falls back for `null`/`undefined`, not all falsy values.
- `??=`, `||=`, `&&=` are logical assignment shorthand operators.
- `Array.at(-1)` gives the last element — use instead of `arr[arr.length - 1]`.
- `Object.groupBy` groups an array into an object by key.
- `toSorted()`, `toReversed()`, `toSpliced()`, `with()` are non-mutating array methods.
- `Promise.allSettled` waits for all promises regardless of rejection.
- `Promise.any` returns first fulfilled; uses `AggregateError` if all reject.
- `BigInt` handles integers larger than `Number.MAX_SAFE_INTEGER`.
- Top-level `await` works inside ES modules.

---

[← Previous: Proxy & Reflect](32-proxy-and-reflect.md) | [Contents](README.md) | [Next: Array Methods →](34-array-methods.md)
