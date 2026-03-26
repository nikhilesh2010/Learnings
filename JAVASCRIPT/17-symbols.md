# 15: Symbols & Well-Known Symbols

## 🔣 What is a Symbol?

A `Symbol` is a **unique, immutable primitive** used mostly as unique property keys. Every `Symbol()` call produces a completely unique value.

```js
const id1 = Symbol("id");
const id2 = Symbol("id");

id1 === id2;         // false — every symbol is unique ✅
typeof id1;          // "symbol"

id1.toString();      // "Symbol(id)"
id1.description;     // "id" (ES2019)

// Cannot be coerced to string implicitly
// "My id: " + id1;  // TypeError
`My id: ${id1}`;     // "My id: Symbol(id)" ← template literals work
```

---

## 🔑 Symbols as Object Keys

Symbols can be used as object property keys by wrapping them in computed key syntax (`[symbol]`). Because each symbol is unique, they act as collision-free keys that are invisible to normal property enumeration methods like `Object.keys()` and `JSON.stringify()`, making them useful for library-internal or metadata properties.

```js
const ID  = Symbol("id");
const KEY = Symbol("key");

const user = {
  name: "Alice",
  [ID]: 42,    // computed symbol key
  [KEY]: "secret",
};

user[ID];    // 42
user.name;   // "Alice"

// Symbols are HIDDEN from normal enumeration
Object.keys(user);   // ["name"] ← no symbols
JSON.stringify(user); // '{"name":"Alice"}' ← symbols omitted

// But can be retrieved
Object.getOwnPropertySymbols(user); // [Symbol(id), Symbol(key)]

// Reflect.ownKeys gets EVERYTHING
Reflect.ownKeys(user); // ["name", Symbol(id), Symbol(key)]
```

### Use Case: Collision-free Properties
```js
// Two libraries both add a "meta" property — collision!
obj.meta = "library A";
obj.meta = "library B"; // OVERWRITES ← bug

// With symbols — no collision
const META_A = Symbol("meta");
const META_B = Symbol("meta");

obj[META_A] = "library A";
obj[META_B] = "library B";  // different keys ✅
```

---

## 🌍 Global Symbol Registry

`Symbol.for()` creates symbols in a **global registry** — same key = same symbol across modules.

```js
const a = Symbol.for("shared");
const b = Symbol.for("shared");
a === b;  // true ← same symbol from registry

// Get description of a registered symbol
Symbol.keyFor(a);  // "shared"
Symbol.keyFor(Symbol("unregistered")); // undefined

// Use case: shared keys across modules
// moduleA.js
const ROLE = Symbol.for("app.ROLE");

// moduleB.js
const ROLE = Symbol.for("app.ROLE"); // same symbol!
```

---

## ⚙️ Well-Known Symbols

Well-known symbols are **built-in symbols** that let you customise built-in JS behaviour.

### Symbol.iterator — Make anything iterable

```js
class Range {
  constructor(start, end) {
    this.start = start;
    this.end   = end;
  }

  [Symbol.iterator]() {
    let current = this.start;
    const end   = this.end;
    return {
      next() {
        return current <= end
          ? { value: current++, done: false }
          : { value: undefined, done: true };
      },
    };
  }
}

const range = new Range(1, 5);
[...range];                    // [1, 2, 3, 4, 5]
for (const n of range) console.log(n); // 1 2 3 4 5
const [first, second] = range; // destructuring works too!
```

### Symbol.asyncIterator — Async iteration

```js
const asyncRange = {
  from: 1,
  to: 3,
  [Symbol.asyncIterator]() {
    let current = this.from;
    const to    = this.to;
    return {
      async next() {
        await new Promise(r => setTimeout(r, 100)); // simulate async work
        return current <= to
          ? { value: current++, done: false }
          : { done: true };
      },
    };
  },
};

for await (const n of asyncRange) {
  console.log(n); // 1 2 3 (with 100ms delays)
}
```

### Symbol.toPrimitive — Control type coercion

```js
class Money {
  constructor(amount, currency) {
    this.amount   = amount;
    this.currency = currency;
  }

  [Symbol.toPrimitive](hint) {
    if (hint === "number")  return this.amount;
    if (hint === "string")  return `${this.amount} ${this.currency}`;
    return this.amount;  // "default" hint
  }
}

const price = new Money(42, "USD");
+price;            // 42  (numeric context)
`${price}`;        // "42 USD" (string context)
price + 0;         // 42  (default context)
price > 30;        // true
```

### Symbol.toStringTag — Custom `[object X]` tag

```js
class MyCollection {
  get [Symbol.toStringTag]() {
    return "MyCollection";
  }
}

const col = new MyCollection();
Object.prototype.toString.call(col); // "[object MyCollection]"
String(col);                         // "[object MyCollection]"
```

### Symbol.hasInstance — Customise instanceof

```js
class EvenNumber {
  static [Symbol.hasInstance](value) {
    return typeof value === "number" && value % 2 === 0;
  }
}

2 instanceof EvenNumber;  // true
3 instanceof EvenNumber;  // false
4 instanceof EvenNumber;  // true
```

### Symbol.species — Override constructor for derivative objects

```js
class MyArray extends Array {
  static get [Symbol.species]() {
    return Array;  // map/filter return base Array, not MyArray
  }
}

const myArr = new MyArray(1, 2, 3);
const mapped = myArr.map(x => x * 2);
mapped instanceof MyArray; // false (returns plain Array due to species)
mapped instanceof Array;   // true
```

### Symbol.isConcatSpreadable

```js
const arr = [1, 2];
const obj = { [Symbol.isConcatSpreadable]: true, 0: "a", 1: "b", length: 2 };

[0, ...arr].concat(obj); // [0, 1, 2, "a", "b"]

// Prevent an array from spreading
const locked = [3, 4];
locked[Symbol.isConcatSpreadable] = false;
[1, 2].concat(locked); // [1, 2, [3, 4]] — not spread
```

### Symbol.match, Symbol.replace, Symbol.search, Symbol.split

```js
// Make custom objects work with string methods
class Validator {
  constructor(regex) { this.regex = regex; }

  [Symbol.match](str) {
    return this.regex.test(str) ? ["✅ valid"] : null;
  }
}

const emailValidator = new Validator(/\S+@\S+\.\S+/);
"test@example.com".match(emailValidator); // ["✅ valid"]
```

---

## 📊 Well-Known Symbols Reference

| Symbol | Used by |
|--------|---------|
| `Symbol.iterator` | `for...of`, spread, destructuring |
| `Symbol.asyncIterator` | `for await...of` |
| `Symbol.toPrimitive` | Type coercion |
| `Symbol.toStringTag` | `Object.prototype.toString` |
| `Symbol.hasInstance` | `instanceof` |
| `Symbol.species` | Array methods returning new instances |
| `Symbol.isConcatSpreadable` | `Array.prototype.concat` |
| `Symbol.match` | `String.prototype.match` |
| `Symbol.replace` | `String.prototype.replace` |
| `Symbol.search` | `String.prototype.search` |
| `Symbol.split` | `String.prototype.split` |

---

## 🔑 Key Takeaways

- Every `Symbol()` is unique — perfect for collision-free property keys.
- Symbols are **hidden** from `Object.keys`, `for...in`, `JSON.stringify`.
- `Symbol.for()` creates/retrieves global shared symbols.
- **Well-known symbols** let you customise core language behaviour (iteration, coercion, instanceof…).
- `Symbol.iterator` is the most important — implement it to make your objects usable with `for...of`, spread, and destructuring.

---

[← Previous: Map, Set, WeakMap & WeakSet](16-map-and-set.md) | [Contents](README.md) | [Next: Iterators & Generators →](18-iterators-and-generators.md)
