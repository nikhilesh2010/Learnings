# 28: Array Methods

## 🔨 Mutating Methods (change original array)

These methods modify the array in place and return either a new length, a removed element, or the modified array. Prefer the non-mutating ES2023 equivalents (`toSorted`, `toReversed`) when you need to preserve the original.

```js
const arr = [1, 2, 3];

arr.push(4, 5);          // adds to end → [1,2,3,4,5],    returns new length
arr.pop();               // removes last → [1,2,3,4],      returns removed element
arr.unshift(0);          // adds to front → [0,1,2,3,4],   returns new length
arr.shift();             // removes first → [1,2,3,4],      returns removed element

// splice(startIndex, deleteCount, ...itemsToInsert)
arr.splice(1, 2);        // remove 2 from index 1 → [1,4]
arr.splice(1, 0, 99);    // insert 99 at index 1 → [1,99,4]
arr.splice(1, 1, 88, 77); // replace 1 element with 2

arr.sort();                         // sorts in-place (lexicographic by default!)
arr.sort((a, b) => a - b);          // numeric ascending
arr.sort((a, b) => b - a);          // numeric descending
arr.sort((a, b) => a.localeCompare(b)); // alphabetical

arr.reverse();           // reverses in-place
arr.fill(0);             // fill all with 0
arr.fill(0, 1, 3);       // fill index 1–2 with 0
arr.copyWithin(0, 3);    // copy from index 3 to index 0 (rarely used)
```

---

## 📤 Non-Mutating Methods (return new value)

These methods leave the original array untouched and return a new value — a new array, string, or element. Use `slice()` to copy, `concat`/spread to merge, and `at(-1)` as a clean alternative to `arr[arr.length - 1]`.

```js
const arr = [1, 2, 3, 4, 5];

// Slice — returns portion
arr.slice(1, 3);    // [2, 3]  (end is exclusive)
arr.slice(-2);      // [4, 5]
arr.slice();        // shallow copy of entire array

// Concat — merge arrays
arr.concat([6, 7], [8]);  // [1,2,3,4,5,6,7,8]
[...arr, 6, 7];            // same with spread

// Join — array to string
arr.join(", ");  // "1, 2, 3, 4, 5"
arr.join("");    // "12345"
arr.join();      // "1,2,3,4,5" (default comma)

// indexOf / lastIndexOf
[1, 2, 3, 2, 1].indexOf(2);     // 1
[1, 2, 3, 2, 1].lastIndexOf(2); // 3
[1, 2, 3].indexOf(99);          // -1 (not found)

// includes — with NaN support
[1, NaN, 3].includes(NaN);  // true  (indexOf would return -1)

// at — supports negative indexing
arr.at(0);    // 1
arr.at(-1);   // 5

// flat — flatten nested arrays
[1, [2, [3]]].flat();          // [1, 2, [3]]
[1, [2, [3]]].flat(Infinity);  // [1, 2, 3]

// ES2023 non-mutating alternatives
arr.toSorted((a, b) => a - b);
arr.toReversed();
arr.toSpliced(1, 1, 99);
arr.with(2, 99);         // replace arr[2] with 99
```

---

## 🔄 Iteration Methods

All return a new array or value; original is unchanged.

```js
const nums  = [1, 2, 3, 4, 5];
const words = ["hello", "world", "foo"];

// map — transform each element
nums.map(x => x * 2);          // [2, 4, 6, 8, 10]
nums.map((x, i) => `${i}:${x}`); // ["0:1", "1:2", ...]

// filter — keep elements that pass test
nums.filter(x => x % 2 === 0);  // [2, 4]
words.filter(w => w.length > 3); // ["hello", "world"]

// reduce — fold into single value
nums.reduce((acc, x) => acc + x, 0);    // 15 (sum)
nums.reduce((acc, x) => acc * x, 1);    // 120 (product)

// Build object from array
const freq = ["a","b","a","c","b","a"].reduce((acc, ch) => {
  acc[ch] = (acc[ch] ?? 0) + 1;
  return acc;
}, {});
// { a: 3, b: 2, c: 1 }

// reduceRight — reduces from right to left
[1, 2, 3].reduceRight((acc, x) => `${acc}-${x}`, "0");  // "0-3-2-1"

// forEach — side effects, returns undefined
nums.forEach((x, i, arr) => console.log(x));

// flatMap — map then flatten (1 level)
["hello world", "foo bar"].flatMap(s => s.split(" "));
// ["hello", "world", "foo", "bar"]

nums.flatMap(x => [x, x * 2]);
// [1,2,2,4,3,6,4,8,5,10]
```

---

## 🔍 Search Methods

Use `find` to get the first matching element, `findIndex` to get its position, and `some`/`every` to check whether any or all elements meet a condition. ES2023's `findLast`/`findLastIndex` search from the end.

```js
const people = [
  { name: "Alice", age: 25 },
  { name: "Bob",   age: 30 },
  { name: "Carol", age: 25 },
];

// find — first match or undefined
people.find(p => p.age === 25);       // { name:"Alice", age:25 }
people.find(p => p.age === 99);       // undefined

// findIndex — index of first match or -1
people.findIndex(p => p.name === "Bob"); // 1

// findLast / findLastIndex (ES2023)
people.findLast(p => p.age === 25);      // { name:"Carol", age:25 }
people.findLastIndex(p => p.age === 25); // 2

// some — at least one passes?
nums.some(x => x > 4);     // true
nums.some(x => x > 10);    // false

// every — all pass?
nums.every(x => x > 0);    // true
nums.every(x => x > 3);    // false
```

---

## 🏗️ Creating Arrays

For most cases use an array literal, but `Array.from` is your go-to for generating arrays from iterables, strings, or a length + mapping function. `Array.of` avoids the ambiguity of `new Array(n)` when creating single-element arrays.

```js
// Array literal
const a = [1, 2, 3];

// Array.of — always creates array from arguments
Array.of(3);        // [3]  (vs new Array(3) which makes sparse array of length 3)
Array.of(1, 2, 3);  // [1, 2, 3]

// Array.from — from iterable or array-like
Array.from("hello");          // ["h","e","l","l","o"]
Array.from(new Set([1,1,2])); // [1, 2]
Array.from({length: 5}, (_, i) => i);  // [0,1,2,3,4]
Array.from({length: 5}, (_, i) => i * i);  // [0,1,4,9,16]

// Spread
[...new Set([1,1,2,2,3])];   // [1, 2, 3]
[..."abc"];                    // ["a","b","c"]

// new Array(n).fill(val)
new Array(5).fill(0);          // [0,0,0,0,0]
new Array(5).fill(null).map(() => ({})); // 5 distinct objects
```

---

## 📊 Grouping & Aggregating

ES2024's `Object.groupBy` partitions an array into groups by a key function. For older targets use `reduce` to build the same grouped object manually. Common utilities like `unique`, `zip`, `chunk`, and `range` are also easy to implement with `reduce` and `Array.from`.

```js
// Object.groupBy (ES2024)
const items = [
  { type: "fruit", name: "apple" },
  { type: "veggie", name: "carrot" },
  { type: "fruit", name: "banana" },
];
const grouped = Object.groupBy(items, item => item.type);
// { fruit: [{...}, {...}], veggie: [{...}] }

// Manual groupBy
const groupBy = (arr, keyFn) =>
  arr.reduce((acc, item) => {
    const key = keyFn(item);
    (acc[key] ??= []).push(item);
    return acc;
  }, {});

// Unique values
const unique = arr => [...new Set(arr)];
unique([1, 2, 2, 3, 3]);  // [1, 2, 3]

// Flatten and deduplicate
const all = [[1,2],[2,3],[3,4]];
const flat = [...new Set(all.flat())];  // [1,2,3,4]

// Zip two arrays
const zip = (a, b) => a.map((item, i) => [item, b[i]]);
zip([1,2,3], ["a","b","c"]); // [[1,"a"],[2,"b"],[3,"c"]]

// Chunk an array
const chunk = (arr, size) =>
  Array.from({ length: Math.ceil(arr.length / size) },
    (_, i) => arr.slice(i * size, i * size + size));

chunk([1,2,3,4,5,6,7], 3); // [[1,2,3],[4,5,6],[7]]

// Range
const range = (start, end, step = 1) =>
  Array.from({ length: Math.ceil((end - start) / step) },
    (_, i) => start + i * step);

range(0, 10, 2);  // [0, 2, 4, 6, 8]
```

---

## ⚙️ Sorting Deep Dive

For multi-key sort, chain comparisons: compare by the primary key first, then fall back to secondary keys when the primary comparison is a tie. Use `toSorted` to sort without mutating, and `localeCompare` for correct alphabetical ordering.

```js
const users = [
  { name: "Charlie", age: 30 },
  { name: "Alice",   age: 25 },
  { name: "Bob",     age: 30 },
];

// Sort by age, then by name
users.toSorted((a, b) =>
  a.age !== b.age
    ? a.age - b.age
    : a.name.localeCompare(b.name)
);
// Alice(25), Bob(30), Charlie(30)

// Sort by multiple criteria generically
const multiSort = (...criteria) => (a, b) => {
  for (const [key, dir] of criteria) {
    const diff = typeof a[key] === "string"
      ? a[key].localeCompare(b[key])
      : a[key] - b[key];
    if (diff !== 0) return dir === "desc" ? -diff : diff;
  }
  return 0;
};

users.toSorted(multiSort(["age", "asc"], ["name", "asc"]));
```

---

## 🔑 Key Takeaways

- Mutating methods: `push`, `pop`, `shift`, `unshift`, `splice`, `sort`, `reverse`, `fill`.
- Non-mutating equivalents (ES2023): `toSorted`, `toReversed`, `toSpliced`, `with`.
- `map` / `filter` / `reduce` are the core functional triad.
- `flatMap` = `map` followed by a single-level `flat` — concise for transforming to arrays.
- `find` / `findLast` returns the element; `findIndex` / `findLastIndex` returns the position.
- `some` / `every` do short-circuit evaluation; `forEach` does not return.
- `Array.from({length: n}, fn)` is the standard way to create a filled array.
- `[...new Set(arr)]` is the quickest way to deduplicate an array.
- Always use `toSorted` instead of `sort` when you need the original preserved.

---

[← Previous: Modern Syntax (ES6–ES2024)](33-modern-syntax.md) | [Contents](README.md) | [Next: Higher-Order Functions →](35-higher-order-functions.md)
