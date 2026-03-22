# 03: Operators

## ➕ Arithmetic Operators

```js
5 + 3   // 8   addition
5 - 3   // 2   subtraction
5 * 3   // 15  multiplication
10 / 3  // 3.333... division (always float in JS!)
10 % 3  // 1   remainder (modulo)
2 ** 8  // 256 exponentiation (ES2016)

// Integer division workaround
Math.floor(10 / 3) // 3
Math.trunc(10 / 3) // 3

// Unary operators
let x = 5;
+x    // 5   (unary plus — convert to number)
-x    // -5  (negate)
++x   // 6   (pre-increment: increment then return)
x++   // 6   (post-increment: return then increment)
--x   // 5   (pre-decrement)
x--   // 5   (post-decrement)

// Increment/decrement difference
let a = 3;
console.log(++a); // 4 — incremented first
console.log(a++); // 4 — returned first, then incremented
console.log(a);   // 5
```

---

## 🔁 Assignment Operators

```js
let x = 10;
x += 5;   // x = x + 5  → 15
x -= 3;   // x = x - 3  → 12
x *= 2;   // x = x * 2  → 24
x /= 4;   // x = x / 4  → 6
x %= 4;   // x = x % 4  → 2
x **= 3;  // x = x ** 3 → 8

// Logical assignment (ES2021)
let a = null;
a ??= "default";   // a = a ?? "default" → "default"

let b = 0;
b ||= "fallback";  // b = b || "fallback" → "fallback" (0 is falsy)

let c = "hi";
c &&= c.toUpperCase(); // c = c && c.toUpperCase() → "HI"
```

---

## 🔍 Comparison Operators

```js
// Strict equality (no coercion) ✅ ALWAYS USE THESE
5 === 5      // true
5 === "5"    // false — different types
5 !== "5"    // true

// Loose equality (with coercion) ⚠️
5 == "5"     // true — "5" coerced to 5
0 == false   // true — both falsy
null == undefined  // true
null == 0    // false ← surprising!

// Relational
5 > 3        // true
5 < 3        // false
5 >= 5       // true
5 <= 4       // false

// String comparison (lexicographic)
"apple" < "banana"  // true
"Z" < "a"           // true (uppercase letters < lowercase in UTF-16)
```

---

## 🔘 Logical Operators

```js
// AND — returns first falsy or last value
true && true    // true
true && false   // false
"hi" && 0       // 0   ← returns the falsy operand
"hi" && "bye"   // "bye" ← all truthy, returns last

// OR — returns first truthy or last value
false || true   // true
false || false  // false
0 || "default"  // "default" ← returns first truthy
"hi" || "bye"   // "hi"

// Practical use
const name = userInput || "Anonymous";  // fallback
const log  = debug && console.log;      // conditional call

// NOT
!true  // false
!false // true
!0     // true
!!0    // false — double-bang converts to boolean
```

### Nullish Coalescing `??` (ES2020)
```js
// Like || but only for null/undefined (not other falsy values)
null ?? "default"      // "default"
undefined ?? "default" // "default"
0 ?? "default"         // 0    ← key difference from ||
"" ?? "default"        // ""   ← key difference from ||
false ?? "default"     // false ← key difference from ||

// Use case: preserve intentional falsy values
const port = userConfig.port ?? 3000;  // 0 is a valid port!
```

---

## ❓ Ternary Operator

```js
condition ? valueIfTrue : valueIfFalse

const age = 20;
const status = age >= 18 ? "adult" : "minor";  // "adult"

// Nesting (keep it simple — prefer if/else for complex cases)
const grade = score >= 90 ? "A"
            : score >= 80 ? "B"
            : score >= 70 ? "C"
            : "F";
```

---

## 🔗 Optional Chaining `?.` (ES2020)

```js
// Without optional chaining — verbose and error-prone
const city = user && user.address && user.address.city;

// With optional chaining ✅
const city = user?.address?.city;

// Works on method calls
const upper = str?.toUpperCase();

// Works on array access
const first = arr?.[0];

// Safe function call
const result = callback?.();

// Combining with ??
const label = user?.profile?.displayName ?? "Anonymous";
```

---

## 🧮 Bitwise Operators

```js
// Operate on 32-bit integers
5 & 3    // 1   AND
5 | 3    // 7   OR
5 ^ 3    // 6   XOR
~5       // -6  NOT (inverts all bits)
5 << 1   // 10  Left shift  (x << n  =  x * 2^n)
5 >> 1   // 2   Right shift (x >> n  =  x / 2^n)
-5 >>> 1 // 2147483645  Unsigned right shift

// Practical uses
n & 1        // check if odd (1) or even (0)
n | 0        // fast integer conversion (truncates)
n << 0       // same — convert to int32
Math.floor(x) === (x | 0)  // for positive numbers
```

---

## 🔤 String Operator

```js
"Hello" + " " + "World"  // "Hello World"  (concatenation)

// + with mixed types
"Score: " + 100   // "Score: 100"
100 + "px"        // "100px"
1 + 2 + "3"       // "33" (left-to-right: 1+2=3, then 3+"3"="33")
"1" + 2 + 3       // "123"

// Always prefer template literals over + concatenation
`Score: ${100}`   // "Score: 100" ✅
```

---

## 🏷️ `typeof` & `instanceof`

```js
typeof 42          // "number"
typeof "hi"        // "string"
typeof true        // "boolean"
typeof undefined   // "undefined"
typeof null        // "object"  ← famous bug
typeof {}          // "object"
typeof []          // "object"
typeof function(){}// "function"

// instanceof checks prototype chain
[] instanceof Array    // true
[] instanceof Object   // true (Array extends Object)
"hi" instanceof String // false (primitive, not wrapper object)

// Constructor check
[].constructor === Array  // true
```

---

## 🆔 `in` Operator

```js
const obj = { name: "Alice", age: 30 };

"name" in obj    // true
"email" in obj   // false

// Also works on arrays (index as key)
const arr = [10, 20, 30];
0 in arr         // true (index 0 exists)
5 in arr         // false

// Checks prototype chain too!
"toString" in obj // true (from Object.prototype)

// Safe property access pattern
if ("fetch" in window) {
  // fetch is available
}
```

---

## 🗑️ `delete` Operator

```js
const obj = { a: 1, b: 2 };
delete obj.a;
console.log(obj);  // { b: 2 }

// Does NOT work on variables
const x = 5;
delete x;  // false — doesn't delete variables
```

---

## 🔀 Spread & Rest (Operators / Syntax)

```js
// Spread — expands iterables
const a = [1, 2, 3];
const b = [...a, 4, 5];  // [1, 2, 3, 4, 5]

Math.max(...a);  // 3

const obj1 = { x: 1 };
const obj2 = { ...obj1, y: 2 };  // { x: 1, y: 2 }

// Rest — gathers remaining args
function sum(...nums) {
  return nums.reduce((a, b) => a + b, 0);
}
sum(1, 2, 3, 4);  // 10
```

---

## 📊 Operator Precedence (high → low)

```
()            Grouping
?.  []  ()    Member access, optional chain, call
!  ~  +  -  typeof  void  delete  ++  --   Unary
**            Exponentiation (right-to-left)
*  /  %       Multiplication
+  -          Addition
<<  >>  >>>   Bitwise shift
<  <=  >  >=  in  instanceof   Relational
==  !=  ===  !==   Equality
&             Bitwise AND
^             Bitwise XOR
|             Bitwise OR
&&            Logical AND
??            Nullish coalescing
||            Logical OR
?:            Ternary
=  +=  -=...  Assignment (right-to-left)
,             Comma
```

---

## 🔑 Key Takeaways

- Always use `===` and `!==` — never `==` and `!=`.
- Use `??` instead of `||` when `0`, `""`, or `false` are valid values.
- Use `?.` for safe property/method access on potentially null/undefined.
- `typeof null === "object"` — use `=== null` to check for null.
- `**` is right-to-left: `2 ** 3 ** 2` is `2 ** 9 = 512`.

---

[← Previous: Variables & Data Types](02-variables-and-types.md) | [Contents](README.md) | [Next: Control Flow →](04-control-flow.md)
