# 09: Arrays

## 📦 Creating Arrays

```js
// Array literal (preferred)
const nums = [1, 2, 3, 4, 5];
const mixed = [1, "hello", true, null, { x: 1 }, [2, 3]];

// Array constructor (avoid the ambiguity)
new Array(3);       // [empty × 3] — 3 empty slots
new Array(1, 2, 3); // [1, 2, 3]

// Array.from — create from iterable or array-like
Array.from("hello");              // ["h","e","l","l","o"]
Array.from({ length: 5 }, (_, i) => i); // [0,1,2,3,4]
Array.from(new Set([1, 2, 2, 3]));// [1, 2, 3]
Array.from(document.querySelectorAll("div")); // NodeList → Array

// Array.of — always creates an array with the given elements
Array.of(7);        // [7] (not [empty × 7]!)
Array.of(1, 2, 3);  // [1, 2, 3]
```

---

## 🔍 Accessing & Modifying

```js
const arr = [10, 20, 30, 40, 50];

// Positive index
arr[0];  // 10
arr[4];  // 50

// Negative index with at() (ES2022) ✅
arr.at(-1);  // 50 (last)
arr.at(-2);  // 40

// Modify
arr[0] = 99;
console.log(arr); // [99, 20, 30, 40, 50]

// Length
arr.length;  // 5

// Truncate via length
arr.length = 3;
console.log(arr); // [99, 20, 30]

// Spread
const copy = [...arr];
```

---

## ➕ Adding & Removing Elements

```js
const arr = [1, 2, 3];

// End
arr.push(4, 5);    // arr = [1,2,3,4,5], returns new length (5)
arr.pop();         // arr = [1,2,3,4], returns removed element (5)

// Start
arr.unshift(0);    // arr = [0,1,2,3,4], returns new length
arr.shift();       // arr = [1,2,3,4], returns removed element (0)

// At any position — splice(startIndex, deleteCount, ...items)
arr.splice(1, 0, 10, 11); // insert at index 1: [1,10,11,2,3,4]
arr.splice(2, 2);          // remove 2 items at index 2: [1,10,3,4]
arr.splice(1, 1, 99);      // replace 1 item at index 1: [1,99,3,4]
```

---

## 🔎 Searching

```js
const arr = [10, 20, 30, 40, 30];

arr.indexOf(30);        // 2 (first occurrence)
arr.lastIndexOf(30);    // 4 (last occurrence)
arr.indexOf(99);        // -1 (not found)

arr.includes(20);       // true ✅ (use this instead of indexOf !== -1)
arr.includes(99);       // false

// Find with a condition
arr.find(n => n > 25);       // 30 (first match value)
arr.findIndex(n => n > 25);  // 2  (first match index)
arr.findLast(n => n > 25);   // 30 (last match value, ES2023)
arr.findLastIndex(n => n > 25); // 4

// Some / Every
arr.some(n => n > 35);   // true (at least one > 35)
arr.every(n => n > 5);   // true (all > 5)
arr.every(n => n > 15);  // false (10 is not > 15)
```

---

## 🔄 Iteration

```js
const fruits = ["apple", "banana", "cherry"];

// forEach — no return value, can't break
fruits.forEach((fruit, index) => {
  console.log(`${index}: ${fruit}`);
});

// for...of — can break, continue
for (const fruit of fruits) {
  if (fruit === "banana") continue;
  console.log(fruit);
}

// entries() — get [index, value] pairs
for (const [i, fruit] of fruits.entries()) {
  console.log(i, fruit);
}
```

---

## 🗺️ Transformation Methods

These return **new arrays** (do not mutate).

```js
const nums = [1, 2, 3, 4, 5];

// map — transform each element
nums.map(n => n * 2);      // [2, 4, 6, 8, 10]
nums.map(n => ({ value: n })); // [{value:1}, ...]

// filter — keep elements matching predicate
nums.filter(n => n % 2 === 0);  // [2, 4]

// reduce — accumulate to single value
nums.reduce((sum, n) => sum + n, 0);  // 15
nums.reduce((acc, n) => ({ ...acc, [n]: n ** 2 }), {}); // {1:1, 2:4, ...}

// reduceRight — same but right to left
["a", "b", "c"].reduceRight((acc, v) => acc + v, ""); // "cba"

// flatMap — map + flatten (1 level)
[[1,2],[3,4]].flatMap(x => x);  // [1,2,3,4]
["hello world", "foo bar"].flatMap(s => s.split(" ")); // ["hello","world","foo","bar"]

// flat — flatten nested arrays
[1, [2, [3, [4]]]].flat();    // [1, 2, [3, [4]]] — 1 level
[1, [2, [3, [4]]]].flat(2);   // [1, 2, 3, [4]]   — 2 levels
[1, [2, [3, [4]]]].flat(Infinity); // [1, 2, 3, 4] — all levels
```

---

## 🔀 Sorting

```js
// Default sort — lexicographic (converts to string)
[10, 9, 2, 1, 100].sort();       // [1, 10, 100, 2, 9] ← wrong for numbers!

// Numeric sort
[10, 9, 2, 1, 100].sort((a, b) => a - b);  // [1, 2, 9, 10, 100] ascending
[10, 9, 2, 1, 100].sort((a, b) => b - a);  // [100, 10, 9, 2, 1]  descending

// Sort objects by property
const people = [
  { name: "Charlie", age: 25 },
  { name: "Alice", age: 30 },
  { name: "Bob", age: 20 },
];
people.sort((a, b) => a.age - b.age);         // by age ascending
people.sort((a, b) => a.name.localeCompare(b.name)); // by name alphabetically

// sort() mutates the original array — clone first if needed
const sorted = [...arr].sort((a, b) => a - b);
// OR
const sorted2 = arr.toSorted((a, b) => a - b); // ES2023 — non-mutating ✅
```

---

## 🔗 Combining & Slicing

```js
const a = [1, 2, 3];
const b = [4, 5, 6];

// Concatenate
const combined = a.concat(b);        // [1,2,3,4,5,6] — non-mutating
const combined2 = [...a, ...b];      // preferred ✅

// Slice — extract portion [start, end)
a.slice(1);     // [2, 3]
a.slice(1, 2);  // [2]
a.slice(-2);    // [2, 3] — from end
a.slice();      // [1, 2, 3] — full copy

// Join — array to string
["a", "b", "c"].join("-");  // "a-b-c"
["a", "b", "c"].join("");   // "abc"
["a", "b", "c"].join();     // "a,b,c" — default

// String to array
"a-b-c".split("-");  // ["a","b","c"]
```

---

## 🔄 Reversing & Filling

```js
[1, 2, 3].reverse();               // [3, 2, 1] — mutates!
[1, 2, 3].toReversed();            // [3, 2, 1] — non-mutating (ES2023) ✅

new Array(5).fill(0);              // [0, 0, 0, 0, 0]
[1, 2, 3, 4, 5].fill(0, 2, 4);    // [1, 2, 0, 0, 5] — fill from index 2 to 4

// copyWithin — copies part of array to another position (rare)
[1, 2, 3, 4, 5].copyWithin(0, 3); // [4, 5, 3, 4, 5]
```

---

## 🧩 Destructuring Arrays

```js
const [a, b, c] = [1, 2, 3];
console.log(a, b, c); // 1 2 3

// Skip elements
const [, second, , fourth] = [1, 2, 3, 4];
console.log(second, fourth); // 2 4

// Rest
const [first, ...rest] = [1, 2, 3, 4];
console.log(first, rest); // 1 [2, 3, 4]

// Default values
const [x = 10, y = 20] = [5];
console.log(x, y); // 5 20

// Swap variables
let m = 1, n = 2;
[m, n] = [n, m];
console.log(m, n); // 2 1

// From function return
function getRange() { return [0, 100]; }
const [min, max] = getRange();
```

---

## 🔬 Typed Arrays

For performance-sensitive numeric data (WebAssembly, Canvas, AudioBuffer…):

```js
const int32 = new Int32Array([1, 2, 3]);
const float64 = new Float64Array(4);  // 4 zeros
const uint8 = new Uint8Array([255, 0, 128]);

// Views on an ArrayBuffer
const buffer = new ArrayBuffer(16);  // 16 bytes
const view   = new Int32Array(buffer); // 4 int32s
view[0] = 42;
```

---

## 🔑 Key Takeaways

- `push/pop` at end; `shift/unshift` at start; `splice` anywhere.
- **Non-mutating** methods: `map`, `filter`, `reduce`, `slice`, `concat`, `flat`, `flatMap`, `toSorted`(ES2023), `toReversed`(ES2023).
- **Mutating** methods: `sort`, `reverse`, `splice`, `fill`, `push`, `pop`, `shift`, `unshift`.
- Use `arr.at(-1)` instead of `arr[arr.length - 1]` for last element.
- `includes()` is cleaner than `indexOf() !== -1`.
- Always clone (`[...arr]`) before sorting if you need non-destructive sort.

---

[← Previous: Objects](08-objects.md) | [Contents](README.md) | [Next: Strings & Template Literals →](10-strings.md)
