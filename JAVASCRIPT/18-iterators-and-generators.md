# 16: Iterators & Generators

## 🔄 The Iterator Protocol

An **iterator** is any object with a `next()` method that returns `{ value, done }`.

```js
// Manual iterator
function counter(from, to) {
  let current = from;
  return {
    next() {
      if (current <= to) {
        return { value: current++, done: false };
      }
      return { value: undefined, done: true };
    },
  };
}

const it = counter(1, 3);
it.next(); // { value: 1, done: false }
it.next(); // { value: 2, done: false }
it.next(); // { value: 3, done: false }
it.next(); // { value: undefined, done: true }
```

## 🔃 The Iterable Protocol

An **iterable** is any object with a `[Symbol.iterator]()` method that returns an iterator.

```js
const range = {
  from: 1,
  to: 5,
  [Symbol.iterator]() {
    let current = this.from;
    const to    = this.to;
    return {
      next() {
        return current <= to
          ? { value: current++, done: false }
          : { value: undefined, done: true };
      },
    };
  },
};

// Now it works with ALL iteration consumers:
[...range];                   // [1, 2, 3, 4, 5]
for (const n of range) {}    // works
const [a, b] = range;        // a=1, b=2
Array.from(range);           // [1, 2, 3, 4, 5]
```

---

## ⚡ Generator Functions

A generator `function*` can **pause** and **resume** execution using `yield`.

```js
function* counter(from, to) {
  for (let i = from; i <= to; i++) {
    yield i;  // pause here, return i
  }
  // implicit return { value: undefined, done: true }
}

const gen = counter(1, 3);

gen.next(); // { value: 1, done: false }
gen.next(); // { value: 2, done: false }
gen.next(); // { value: 3, done: false }
gen.next(); // { value: undefined, done: true }

// Generators ARE iterables:
[...counter(1, 5)];           // [1, 2, 3, 4, 5]
for (const n of counter(1, 3)) console.log(n);  // 1 2 3
```

---

## 🏗️ Generator Patterns

### Infinite Sequence
```js
function* naturals(start = 1) {
  while (true) {
    yield start++;
  }
}

function take(n, iterable) {
  const result = [];
  for (const val of iterable) {
    result.push(val);
    if (result.length === n) return result;
  }
  return result;
}

take(5, naturals());     // [1, 2, 3, 4, 5]
take(5, naturals(10));   // [10, 11, 12, 13, 14]
```

### Lazy Transformation Pipeline
```js
function* map(iterable, fn) {
  for (const val of iterable) yield fn(val);
}

function* filter(iterable, pred) {
  for (const val of iterable) if (pred(val)) yield val;
}

function* take(n, iterable) {
  let count = 0;
  for (const val of iterable) {
    if (count++ >= n) return;
    yield val;
  }
}

// Process first 3 even squares from infinite sequence — lazily!
const result = take(3,
  map(
    filter(naturals(), n => n % 2 === 0),
    n => n * n
  )
);
[...result]; // [4, 16, 36]
```

### Two-way Communication (yield as expression)
```js
function* calculator() {
  let result = 0;
  while (true) {
    const input = yield result;  // yield sends result out, receives input
    if (input === null) break;
    result += input;
  }
  return result;
}

const calc = calculator();
calc.next();        // start: { value: 0, done: false }
calc.next(10);      // send 10: { value: 10, done: false }
calc.next(5);       // send 5: { value: 15, done: false }
calc.next(null);    // stop: { value: 15, done: true }
```

### Generator Return & Throw
```js
function* gen() {
  try {
    yield 1;
    yield 2;
    yield 3;
  } catch (e) {
    console.log("Caught:", e.message);
    yield 99;
  }
}

const it = gen();
it.next();            // { value: 1, done: false }
it.throw(new Error("oops")); // "Caught: oops" → { value: 99, done: false }

// Return early
const it2 = gen();
it2.next();           // { value: 1, done: false }
it2.return("done");   // { value: "done", done: true } — generator finished
```

### yield* — Delegate to another iterable
```js
function* letters() {
  yield "a";
  yield "b";
}

function* numbers() {
  yield 1;
  yield* letters();  // delegate: yields a, b
  yield 2;
}

[...numbers()]; // [1, "a", "b", 2]

// Great for flattening
function* flatten(arr) {
  for (const item of arr) {
    if (Array.isArray(item)) yield* flatten(item);
    else yield item;
  }
}

[...flatten([1, [2, [3, [4]]], 5])]; // [1, 2, 3, 4, 5]
```

---

## ⚡ Async Generators & for await...of

```js
async function* asyncCounter(from, to, delayMs = 100) {
  for (let i = from; i <= to; i++) {
    await new Promise(r => setTimeout(r, delayMs));
    yield i;
  }
}

// Consume async generator
for await (const n of asyncCounter(1, 5)) {
  console.log(n); // 1 2 3 4 5 (with delay)
}

// Real-world: paginated API
async function* fetchAllPages(url) {
  let nextUrl = url;
  while (nextUrl) {
    const response = await fetch(nextUrl);
    const data = await response.json();
    yield* data.items;
    nextUrl = data.nextPageUrl;
  }
}

for await (const item of fetchAllPages("/api/products?page=1")) {
  process(item);
}
```

---

## 🔬 Custom Iterable Class

```js
class LinkedList {
  #head = null;

  append(value) {
    if (!this.#head) {
      this.#head = { value, next: null };
    } else {
      let node = this.#head;
      while (node.next) node = node.next;
      node.next = { value, next: null };
    }
    return this;
  }

  [Symbol.iterator]() {
    let node = this.#head;
    return {
      next() {
        if (node) {
          const value = node.value;
          node = node.next;
          return { value, done: false };
        }
        return { value: undefined, done: true };
      },
    };
  }

  *[Symbol.iterator]() {  // generator version (cleaner)
    let node = this.#head;
    while (node) {
      yield node.value;
      node = node.next;
    }
  }
}

const list = new LinkedList().append(1).append(2).append(3);
[...list];             // [1, 2, 3]
for (const v of list)  console.log(v); // 1 2 3
```

---

## 📊 Iterator vs Generator

| | Iterator | Generator |
|--|---------|-----------|
| Definition | Object with `next()` | `function*` |
| Syntax | Verbose | Compact |
| Pause/Resume | Manual state | `yield` handles it |
| Two-way comm | No | `yield` receives values |
| Delegation | Manual | `yield*` |
| Return value | Manual | `return` |

---

## 🔑 Key Takeaways

- **Iterators** define `next()` returning `{ value, done }`.
- **Iterables** define `[Symbol.iterator]()` returning an iterator.
- `for...of`, spread, destructuring, `Array.from` all work with any iterable.
- **Generators** (`function*` + `yield`) make iterator creation effortless.
- Generators are lazy — values computed on demand (great for infinite sequences and pipelines).
- `yield*` delegates to another iterable.
- **Async generators** + `for await...of` handle async sequences (pagination, streams).

---

[← Previous: Symbols & Well-Known Symbols](17-symbols.md) | [Contents](README.md) | [Next: Date & Time →](19-date-and-time.md)
