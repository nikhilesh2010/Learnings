# 02: Variables & Data Types

## 📦 Variable Declarations

JavaScript has three ways to declare a variable.

```js
var   name = "Alice";  // old way — function-scoped, hoisted, avoid
let   age  = 30;       // block-scoped, mutable         ✅ use this
const PI   = 3.14159;  // block-scoped, immutable bind  ✅ prefer this
```

### Comparison Table

| Feature | `var` | `let` | `const` |
|---------|-------|-------|---------|
| Scope | Function | Block | Block |
| Hoisted | Yes (as `undefined`) | Yes (TDZ) | Yes (TDZ) |
| Re-declarable | Yes | No | No |
| Re-assignable | Yes | Yes | No |
| Global property | Yes | No | No |

```js
// Block scope example
{
  let x = 10;
  const y = 20;
  var z = 30;
}
console.log(z); // 30 — var leaks out!
// console.log(x); // ReferenceError
// console.log(y); // ReferenceError

// const prevents rebinding, NOT mutation
const arr = [1, 2, 3];
arr.push(4);       // ✅ fine — mutating the object
// arr = [5, 6];   // ❌ TypeError — rebinding forbidden
```

---

## 🔢 Primitive Types

JavaScript has **8 primitive types** — they are immutable values.

### 1. `number`
```js
let integer = 42;
let float   = 3.14;
let neg     = -7;
let big     = 1_000_000;  // numeric separator (ES2021)

// Special values
console.log(1 / 0);        // Infinity
console.log(-1 / 0);       // -Infinity
console.log(0 / 0);        // NaN  (Not a Number)
console.log(Number.MAX_SAFE_INTEGER);  // 9007199254740991 (2^53 - 1)
console.log(Number.EPSILON);           // 2.220446049250313e-16

// Floating-point gotcha
console.log(0.1 + 0.2);         // 0.30000000000000004 ⚠️
console.log(Math.abs(0.1 + 0.2 - 0.3) < Number.EPSILON); // true ✅
```

### 2. `bigint`
```js
const huge = 9007199254740993n;  // n suffix makes it BigInt
const sum  = 1000000000000000000n + 1n;

typeof huge; // "bigint"
// Cannot mix with regular numbers:
// 1n + 1  // TypeError — use explicit conversion
Number(1n) + 1;   // 2
```

### 3. `string`
```js
const single = 'Hello';
const double = "World";
const template = `Hello, ${double}!`;  // template literal

// Multi-line with template literals
const poem = `Roses are red,
Violets are blue`;

// String is immutable — you can't change individual chars
let s = "hello";
s[0] = "H";  // silently fails in non-strict, error in strict
console.log(s); // "hello" unchanged
```

### 4. `boolean`
```js
const yes = true;
const no  = false;

// Falsy values (the only 8 in JS!)
Boolean(false);     // false
Boolean(0);         // false
Boolean(-0);        // false
Boolean(0n);        // false
Boolean("");        // false
Boolean(null);      // false
Boolean(undefined); // false
Boolean(NaN);       // false

// Everything else is truthy
Boolean("0");       // true  ← common gotcha!
Boolean([]);        // true  ← empty array is truthy!
Boolean({});        // true  ← empty object is truthy!
```

### 5. `null`
```js
let data = null;  // intentional absence of a value
typeof null;      // "object"  ← famous historical bug in JS!

// Check for null correctly:
data === null;    // true
```

### 6. `undefined`
```js
let x;
console.log(x);           // undefined — declared but not assigned
console.log(typeof x);    // "undefined"

function noReturn() {}
console.log(noReturn());  // undefined — no return statement

const obj = {};
console.log(obj.foo);     // undefined — property doesn't exist
```

### 7. `symbol`
```js
const id1 = Symbol("id");
const id2 = Symbol("id");
console.log(id1 === id2); // false — every symbol is unique

// Used as unique object keys
const KEY = Symbol("key");
const obj = { [KEY]: "secret" };

// Does NOT appear in for...in or Object.keys
for (const k in obj) console.log(k); // nothing
Object.getOwnPropertySymbols(obj);   // [Symbol(key)]
```

### 8. `boolean` — already covered above

---

## 🏗️ The `object` Type

Everything that is not a primitive is an object (reference type).

```js
// Object literal
const person = {
  name: "Alice",
  age: 30,
  greet() { return `Hi, I'm ${this.name}`; }
};

// Array (a special object)
const nums = [1, 2, 3];
typeof nums; // "object"
Array.isArray(nums); // true

// Function (a callable object)
function add(a, b) { return a + b; }
typeof add; // "function" (special case of object)

// Primitives vs Objects — value vs reference
let a = 5;
let b = a;  // copy of the value
b = 10;
console.log(a); // 5 — unchanged

let obj1 = { x: 1 };
let obj2 = obj1;  // copy of the REFERENCE
obj2.x = 99;
console.log(obj1.x); // 99 — same object!
```

---

## 🔍 `typeof` Operator

The `typeof` operator returns a string identifying the primitive type of its operand. Note that `typeof null` returns `"object"` — a historical quirk retained for backward compatibility rather than a true reflection of the type.

```js
typeof 42           // "number"
typeof 3.14         // "number"
typeof 42n          // "bigint"
typeof "hello"      // "string"
typeof true         // "boolean"
typeof undefined    // "undefined"
typeof Symbol()     // "symbol"
typeof null         // "object"  ← bug preserved for compatibility
typeof {}           // "object"
typeof []           // "object"
typeof function(){} // "function"
```

---

## 🔄 Type Coercion

JS automatically converts types in certain operations — a source of many bugs.

### Implicit Coercion
```js
// + with a string triggers string concatenation
"5" + 3     // "53" ← string!
"5" + true  // "5true"
"5" - 3     // 2    ← - triggers numeric conversion

// Comparison operators
"5" == 5    // true  ← loose equality coerces types
"5" === 5   // false ← strict equality: no coercion ✅

null == undefined  // true
null === undefined // false

NaN == NaN         // false ← NaN is never equal to itself!
Number.isNaN(NaN)  // true  ✅ use this
```

### Explicit Coercion
```js
// To number
Number("42")   // 42
Number(true)   // 1
Number(false)  // 0
Number(null)   // 0
Number("")     // 0
Number("abc")  // NaN
parseInt("42px") // 42
parseFloat("3.14em") // 3.14

// To string
String(42)     // "42"
String(true)   // "true"
String(null)   // "null"
(42).toString() // "42"
(255).toString(16) // "ff" — hex
(8).toString(2)    // "1000" — binary

// To boolean
Boolean(0)     // false
Boolean("hi")  // true
!!0            // false — double-bang trick
!!"hello"      // true
```

---

## 🔎 Checking Types Reliably

Because `typeof` has edge cases, use specialised checks for specific types: `Array.isArray()` for arrays, strict `=== null` for null, and `Number.isNaN()` for NaN. Use `instanceof` to check object types against constructor functions in the prototype chain.

```js
// Primitives → typeof
typeof "hi" === "string"   // true
typeof 42 === "number"     // true

// null
value === null             // only reliable way

// Arrays
Array.isArray([1,2,3])     // true ✅

// NaN
Number.isNaN(NaN)          // true ✅ (not isNaN() which coerces)

// Objects
value !== null && typeof value === "object"  // plain objects

// instanceof (checks prototype chain)
[] instanceof Array        // true
{} instanceof Object       // true

// Object.prototype.toString — most precise
Object.prototype.toString.call([])       // "[object Array]"
Object.prototype.toString.call(null)     // "[object Null]"
Object.prototype.toString.call(/rx/)     // "[object RegExp]"
```

---

## 📌 Variable Best Practices

Default to `const` for every declaration and only switch to `let` when you need to reassign. Avoid `var` entirely — its function scope and hoisting behaviour introduce subtle bugs that `let` and `const` prevent.

```js
// ✅ Prefer const by default
const MAX = 100;
const config = { debug: true };

// ✅ Use let only when you must reassign
let counter = 0;
counter++;

// ❌ Avoid var (scoping surprises, hoisting bugs)

// ✅ Declare at the top of their scope
// ✅ One declaration per line (more readable)
// ✅ Use descriptive names
const userFirstName = "Alice";  // not: const ufn = "Alice"

// ✅ SCREAMING_SNAKE_CASE for true constants
const HTTP_TIMEOUT_MS = 5000;
```

---

## 🔑 Key Takeaways

- Use `const` by default, `let` when you need to reassign, never `var`.
- JS has 7 primitive types: `number`, `bigint`, `string`, `boolean`, `null`, `undefined`, `symbol`.
- Reference types (objects, arrays, functions) are passed by reference.
- Always use `===` strict equality — avoid type coercion bugs.
- `typeof null === "object"` is a known historical bug.

---

[← Previous: Introduction to JavaScript](01-introduction.md) | [Contents](README.md) | [Next: Operators →](03-operators.md)
