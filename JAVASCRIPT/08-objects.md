# 08: Objects

## 📦 Creating Objects

Objects in JavaScript can be created in several ways. The object literal syntax is the most common and readable. `Object.create()` allows you to set the prototype explicitly, while constructor functions and classes are used to produce multiple instances with shared methods.

```js
// 1. Object literal (most common)
const person = {
  name: "Alice",
  age: 30,
  city: "Paris",
};

// 2. Object.create() — explicit prototype
const animal = Object.create({ breathes: true });
animal.name = "Dog";

// 3. new Object()
const obj = new Object();
obj.key = "value";

// 4. Constructor function
function Car(make, model) {
  this.make  = make;
  this.model = model;
}
const car = new Car("Toyota", "Corolla");

// 5. Class (preferred over constructor functions)
class Point {
  constructor(x, y) {
    this.x = x;
    this.y = y;
  }
}
const p = new Point(3, 4);
```

---

## 🔑 Property Access

Dot notation is the standard way to read object properties and is preferred for known, valid identifier keys. Bracket notation is required when the key is dynamic, stored in a variable, or contains special characters. Optional chaining (`?.`) prevents `TypeError` when accessing deeply nested properties that may not exist.

```js
const user = { name: "Alice", "user-id": 42, address: { city: "Paris" } };

// Dot notation (preferred for known keys)
user.name;          // "Alice"
user.address.city;  // "Paris"

// Bracket notation (required for dynamic/special keys)
user["user-id"];           // 42
user["name"];              // "Alice"

const key = "name";
user[key];                 // "Alice" — dynamic key

// Optional chaining — safe deep access
user?.address?.city;       // "Paris" (or undefined, not error)
user?.phone?.number;       // undefined (safe)
```

---

## ✏️ Adding, Modifying, Deleting Properties

Object properties can be added, replaced, or removed at any time using dot or bracket notation. The `delete` operator removes a property entirely. Use `Object.hasOwn()` or the `in` operator to check whether a property exists before accessing it.

```js
const obj = { a: 1 };

// Add
obj.b = 2;
obj["c"] = 3;

// Modify
obj.a = 99;

// Delete
delete obj.b;
console.log(obj); // { a: 99, c: 3 }

// Check existence
"a" in obj;              // true
Object.hasOwn(obj, "a"); // true (ES2022) ✅
obj.hasOwnProperty("a"); // true (older API)
```

---

## 🏗️ Property Shorthand & Computed Keys (ES6)

When a property name matches a local variable name, shorthand syntax lets you write the name once. Computed property names (using `[expression]`) allow you to determine key names dynamically at object creation time.

```js
const name = "Alice";
const age  = 30;

// Shorthand — key = variable name, value = variable value
const user = { name, age }; // { name: "Alice", age: 30 }

// Computed property names
const prefix = "user";
const config = {
  [`${prefix}Name`]: "Alice",  // userName: "Alice"
  [`${prefix}Age`]:  30,       // userAge: 30
};

// Dynamic key from expression
const key = "x";
const point = { [key]: 10 };   // { x: 10 }
```

---

## 🔧 Methods & `this`

Functions stored as object properties are called methods. Inside a regular method, `this` refers to the object the method was called on. Arrow functions do not have their own `this` and should not be used as top-level object methods, but they work well for callbacks inside methods.

```js
const counter = {
  value: 0,

  // Method shorthand (ES6) — preferred
  increment() {
    this.value++;
  },

  // Traditional method
  decrement: function() {
    this.value--;
  },

  // ⚠️ Arrow function as method — no own `this`
  getDouble: () => {
    return this.value * 2;  // `this` is NOT the object!
  },

  // Correct arrow usage inside regular methods
  getDoubleLater() {
    return new Promise(resolve => {
      setTimeout(() => resolve(this.value * 2), 100); // `this` correct ✅
    });
  },
};
```

---

## 📋 Object Methods (built-in)

`Object.keys()`, `Object.values()`, and `Object.entries()` extract an object's own enumerable properties as arrays, making it easy to iterate, filter, or transform them. `Object.assign()` and the spread operator merge objects, with later sources overriding earlier ones.

```js
const user = { name: "Alice", age: 30, role: "admin" };

// Keys, values, entries
Object.keys(user);    // ["name", "age", "role"]
Object.values(user);  // ["Alice", 30, "admin"]
Object.entries(user); // [["name","Alice"], ["age",30], ["role","admin"]]

// Rebuild from entries
const copy = Object.fromEntries(Object.entries(user)); // ✅

// Iterate entries
for (const [key, value] of Object.entries(user)) {
  console.log(`${key}: ${value}`);
}

// Merge objects (spread) — last one wins on conflicts
const merged = { ...defaults, ...overrides };

// Object.assign — mutates target
Object.assign(target, source1, source2);

// Shallow clone
const clone = { ...user };
const clone2 = Object.assign({}, user);
```

---

## 🔒 Object.freeze & Object.seal

`Object.freeze()` makes an object fully immutable: no properties can be added, removed, or modified. `Object.seal()` is less strict — existing properties can be modified but the shape of the object cannot change. Both operations are shallow and do not affect nested objects.

```js
// freeze — no additions, deletions, or modifications
const config = Object.freeze({ debug: false, version: "1.0" });
config.debug = true;       // silently fails (or throws in strict mode)
config.newProp = "x";      // silently fails
console.log(config.debug); // false — unchanged

// seal — no additions or deletions, but CAN modify existing
const obj = Object.seal({ x: 1, y: 2 });
obj.x = 99;   // ✅ modification allowed
obj.z = 3;    // ❌ silently fails
delete obj.x; // ❌ silently fails

// Check status
Object.isFrozen(config); // true
Object.isSealed(obj);    // true

// ⚠️ freeze is shallow — nested objects are NOT frozen
const deep = Object.freeze({ nested: { value: 1 } });
deep.nested.value = 99; // ✅ still works! nested not frozen
```

---

## 🔍 Property Descriptors

Every property has a descriptor with metadata.

```js
const obj = { name: "Alice" };

Object.getOwnPropertyDescriptor(obj, "name");
// {
//   value: "Alice",
//   writable: true,
//   enumerable: true,
//   configurable: true
// }

// Define custom property
Object.defineProperty(obj, "id", {
  value: 42,
  writable: false,      // cannot reassign
  enumerable: false,    // won't show in for...in / Object.keys
  configurable: false,  // cannot delete or redefine
});

obj.id = 99;          // fails silently (or throws in strict mode)
Object.keys(obj);     // ["name"] — id is not enumerable

// Getters and setters
const person = {
  _age: 0,

  get age() {
    return this._age;
  },
  set age(value) {
    if (value < 0) throw new RangeError("Age must be non-negative");
    this._age = value;
  },
};

person.age = 30;    // calls setter
person.age;         // 30 — calls getter
```

---

## 🔄 Looping & Spreading

Use `Object.entries()` for the safest and most readable object iteration, as it produces key-value pairs cleanly. The spread operator creates shallow copies and is the standard approach for immutable object updates in React and Redux patterns.

```js
// for...in (enumerates ALL enumerable properties, including inherited)
for (const key in obj) {
  if (Object.hasOwn(obj, key)) {  // filter own properties
    console.log(key, obj[key]);
  }
}

// Object.entries — safest iteration
Object.entries(obj).forEach(([key, val]) => console.log(key, val));

// Spread for immutable updates (common in React/Redux)
const original = { a: 1, b: 2, c: 3 };
const updated  = { ...original, b: 99 }; // { a: 1, b: 99, c: 3 }
const without  = { ...original };
delete without.b; // ← but simpler with Object.fromEntries:
const { b, ...rest } = original; // rest = { a: 1, c: 3 }
```

---

## 🌳 Nested Objects & Deep Clone

Copying an object with the spread operator or `Object.assign()` creates only a shallow clone — nested objects still share the same reference. Use `structuredClone()` (ES2022) for a true deep clone, or the JSON round-trip for simple plain-data objects when no functions, `Date`s, or `undefined` values are present.

```js
// Shallow copy — nested objects still shared
const original = { name: "Alice", address: { city: "Paris" } };
const shallow = { ...original };

shallow.address.city = "London";
console.log(original.address.city); // "London" — same reference!

// Deep clone options:
// 1. structuredClone (ES2022) — recommended ✅
const deep = structuredClone(original);

// 2. JSON trick (loses functions, undefined, Date, etc.)
const deepJSON = JSON.parse(JSON.stringify(original));

// 3. Recursive clone
function deepClone(obj) {
  if (obj === null || typeof obj !== "object") return obj;
  if (Array.isArray(obj)) return obj.map(deepClone);
  return Object.fromEntries(
    Object.entries(obj).map(([k, v]) => [k, deepClone(v)])
  );
}
```

---

## 🏷️ Checking & Comparing Objects

Objects are compared by reference in JavaScript, not by value, so two objects with identical properties are not `===` equal unless they are the same object in memory. For content equality, use `JSON.stringify` as a quick check for simple objects, or a dedicated deep-equal utility for anything more complex.

```js
const a = { x: 1 };
const b = { x: 1 };
const c = a;

// == and === compare REFERENCES for objects
a === b;  // false — different objects in memory
a === c;  // true  — same reference
a == b;   // false

// Check if two objects have the same content
JSON.stringify(a) === JSON.stringify(b); // true (works for simple objects)

// Deep equality (proper solution — use a library like lodash.isEqual or write recursive)
function deepEqual(a, b) {
  if (a === b) return true;
  if (typeof a !== "object" || typeof b !== "object") return false;
  if (a === null || b === null) return false;
  const keysA = Object.keys(a);
  const keysB = Object.keys(b);
  if (keysA.length !== keysB.length) return false;
  return keysA.every(k => deepEqual(a[k], b[k]));
}
```

---

## 🔑 Key Takeaways

- Use object literals `{}` for most cases.
- Use dot notation for known keys; bracket notation for dynamic/special keys.
- `Object.freeze()` makes objects immutable (shallow).
- Property descriptors control writability, enumerability, and configurability.
- Objects are **passed by reference** — mutating a copy mutates the original unless cloned.
- Use `structuredClone()` for deep cloning.
- Use `{ ...original, changes }` for immutable updates.

---

[← Previous: Hoisting & Temporal Dead Zone](07-hoisting.md) | [Contents](README.md) | [Next: Arrays →](09-arrays.md)
