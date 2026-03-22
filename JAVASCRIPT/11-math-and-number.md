# 46: Math & Number

## 🔢 The Number Type

JavaScript uses **IEEE 754 double-precision floating-point** for all numbers (integers and floats share the same type).

```js
typeof 42;        // "number"
typeof 3.14;      // "number"
typeof NaN;       // "number"  ← NaN is technically a number!
typeof Infinity;  // "number"

// Safe integer range: -(2^53 - 1) to (2^53 - 1)
Number.MAX_SAFE_INTEGER;   // 9007199254740991
Number.MIN_SAFE_INTEGER;   // -9007199254740991

Number.MAX_VALUE;          // ~1.8e308   (largest finite number)
Number.MIN_VALUE;          // ~5e-324    (smallest positive number)
Number.POSITIVE_INFINITY;  // Infinity
Number.NEGATIVE_INFINITY;  // -Infinity
Number.EPSILON;            // ~2.22e-16  (smallest diff between 1 and next float)
Number.NaN;                // NaN
```

---

## 🔍 Number Checking

```js
// ✅ isNaN — does NOT coerce (use this, not the global isNaN)
Number.isNaN(NaN);         // true
Number.isNaN("hello");     // false  ← correct
Number.isNaN(undefined);   // false  ← correct

// ❌ Global isNaN coerces first — unreliable
isNaN("hello");            // true  ← wrong! ("hello" converts to NaN)
isNaN(undefined);          // true  ← wrong!

// isFinite — false for Infinity, -Infinity, NaN
Number.isFinite(42);        // true
Number.isFinite(Infinity);  // false
Number.isFinite(NaN);       // false
Number.isFinite("42");      // false  ← no coercion

// global isFinite coerces
isFinite("42");             // true  ← coerces "42" to 42, avoid

// isInteger
Number.isInteger(42);       // true
Number.isInteger(42.0);     // true  (42.0 === 42 in JS)
Number.isInteger(42.5);     // false
Number.isInteger(Infinity); // false

// isSafeInteger — within -(2^53-1) to (2^53-1)
Number.isSafeInteger(9007199254740991);   // true
Number.isSafeInteger(9007199254740992);   // false — loses precision
Number.isSafeInteger(3.14);              // false
```

---

## 🔄 Number Parsing & Conversion

```js
// parseInt — parse integer from string (stops at first non-digit)
parseInt("42px");           // 42
parseInt("  42  ");         // 42
parseInt("3.99");           // 3  (truncates)
parseInt("0x1F", 16);       // 31  (hex)
parseInt("101", 2);         // 5   (binary)
parseInt("hello");          // NaN

// ✅ Always pass a radix (base) to parseInt
parseInt("08");             // 8   ← but old IE treated as octal!
parseInt("08", 10);         // 8   ✅ explicit base 10

// parseFloat — parse floating-point number
parseFloat("3.14px");       // 3.14
parseFloat("  3.14  ");     // 3.14
parseFloat("hello");        // NaN

// Number() conversion — stricter than parseInt
Number("42");               // 42
Number("3.14");             // 3.14
Number("");                 // 0    ← gotcha
Number(" ");                // 0    ← gotcha
Number(null);               // 0    ← gotcha
Number(undefined);          // NaN
Number(true);               // 1
Number(false);              // 0
Number("42px");             // NaN  ← unlike parseInt

// Unary + operator (same as Number())
+"42";                      // 42
+true;                      // 1
+null;                      // 0
+"hello";                   // NaN

// parseInt vs Number
parseInt("42.9 dollars");   // 42  — lenient
Number("42.9 dollars");     // NaN — strict
```

---

## 🖨️ Number Formatting

```js
const n = 123456.789;

// toFixed — decimal places (returns string)
n.toFixed(2);      // "123456.79"   (rounds)
n.toFixed(0);      // "123457"
(1.005).toFixed(2);  // "1.00"  ← floating-point rounding quirk!

// toPrecision — significant digits (returns string)
n.toPrecision(6);  // "123457"
n.toPrecision(4);  // "1.235e+5"
n.toPrecision(9);  // "123456.789"

// toString with base
(255).toString(16);  // "ff"   (hex)
(255).toString(2);   // "11111111" (binary)
(255).toString(8);   // "377"  (octal)
(255).toString(10);  // "255"

// toLocaleString — locale-aware (prefer Intl.NumberFormat for reuse)
n.toLocaleString("en-US");   // "123,456.789"
n.toLocaleString("de-DE");   // "123.456,789"
n.toLocaleString("en-US", { style: "currency", currency: "USD" });
// "$123,456.79"
```

---

## ⚠️ Floating-Point Precision

```js
0.1 + 0.2;              // 0.30000000000000004  ← classic floating-point issue
0.1 + 0.2 === 0.3;      // false!

// ✅ Compare with epsilon tolerance
Math.abs(0.1 + 0.2 - 0.3) < Number.EPSILON;   // true

// ✅ For currency: work in integer cents
const price    = 199;    // ¢
const tax      = 16;     // ¢
const total    = (price + tax) / 100;  // 2.15
total.toFixed(2);        // "2.15"

// ✅ toFixed for display (but beware rounding)
(1.005).toFixed(2);      // "1.00"  ← should be "1.01" but floating-point
// Correct rounding:
Math.round((1.005 + Number.EPSILON) * 100) / 100;  // 1.01
```

---

## 🔢 Math Object

The `Math` object has static properties and methods — it's not a constructor.

### Constants

```js
Math.PI;     // 3.141592653589793   (π)
Math.E;      // 2.718281828459045   (Euler's number)
Math.SQRT2;  // 1.4142135623730951  (√2)
Math.LN2;    // 0.6931471805599453  (ln 2)
Math.LN10;   // 2.302585092994046   (ln 10)
Math.LOG2E;  // 1.4426950408889634  (log₂e)
Math.LOG10E; // 0.4342944819032518  (log₁₀e)
```

### Rounding Methods

```js
Math.round(4.5);    // 5  (rounds half up)
Math.round(4.4);    // 4
Math.round(-4.5);   // -4  ← rounds toward +∞ for .5

Math.floor(4.9);    // 4  (round down toward -∞)
Math.floor(-4.1);   // -5  ← floor goes toward -∞ ⚠️

Math.ceil(4.1);     // 5  (round up toward +∞)
Math.ceil(-4.9);    // -4

Math.trunc(4.9);    // 4  (truncate — round toward 0)
Math.trunc(-4.9);   // -4  ← different from floor for negatives!

// Comparison: trunc vs floor for negatives
Math.trunc(-4.9);   // -4  (toward zero)
Math.floor(-4.9);   // -5  (toward -∞)
```

### Min, Max, Absolute Value

```js
Math.min(3, 1, 4, 1, 5, 9);   // 1
Math.max(3, 1, 4, 1, 5, 9);   // 9

Math.min();   // Infinity   (no args)
Math.max();   // -Infinity  (no args)

// Spread for arrays
const nums = [3, 1, 4, 1, 5];
Math.min(...nums);    // 1
Math.max(...nums);    // 5

// For large arrays prefer reduce (avoids stack overflow)
nums.reduce((a, b) => Math.min(a, b), Infinity);

Math.abs(-42);        // 42
Math.abs(-3.14);      // 3.14
```

### Power & Roots

```js
Math.pow(2, 10);     // 1024   (2^10)
2 ** 10;             // 1024   ← prefer ** operator (ES2016)

Math.sqrt(16);       // 4      (square root)
Math.cbrt(27);       // 3      (cube root)
Math.hypot(3, 4);    // 5      (√(3² + 4²))
Math.hypot(1, 1, 1); // 1.732… (3D distance from origin)

// nth root
Math.pow(8, 1/3);    // 2      (cube root of 8)
8 ** (1/3);          // 2
```

### Logarithms & Exponentials

```js
Math.log(Math.E);    // 1       (natural log)
Math.log(1);         // 0
Math.log(0);         // -Infinity
Math.log(-1);        // NaN

Math.log2(8);        // 3       (log base 2)
Math.log10(1000);    // 3       (log base 10)

Math.exp(1);         // 2.718…  (e^1)
Math.exp(0);         // 1
Math.exp(2);         // 7.389…

Math.log1p(0);       // 0        more accurate for small values near 0
Math.expm1(0);       // 0        more accurate for small values near 0
```

### Trigonometry

```js
// All angles in radians (degrees × π/180)
const deg = (d) => d * Math.PI / 180;

Math.sin(deg(90));    // 1
Math.cos(deg(0));     // 1
Math.tan(deg(45));    // ~1 (0.9999…)

Math.asin(1);         // π/2  (~1.5708)
Math.acos(1);         // 0
Math.atan(1);         // π/4  (~0.7854)

// atan2 — angle from x-axis to point (y, x)  (handles quadrants correctly)
Math.atan2(1, 1);     // π/4   (45°)
Math.atan2(0, -1);    // π     (180°)
Math.atan2(-1, 0);    // -π/2  (-90°)
```

### Miscellaneous

```js
Math.sign(-5);    // -1
Math.sign(0);     //  0
Math.sign(5);     //  1

Math.clz32(1);    // 31  (count leading zero bits in 32-bit int)
Math.fround(1.337);   // 1.3370000123977661  (nearest 32-bit float)

// Integer conversion tricks (bitwise)
1.9 | 0;          // 1   (truncates — same as Math.trunc for 32-bit range)
~~3.9;            // 3   (double bitwise NOT — truncates)
// ⚠️ These only reliably work within 32-bit integer range
```

---

## 🎲 Random Numbers

```js
// Math.random() — [0, 1) uniform pseudorandom (not cryptographically secure)
Math.random();              // 0.7392...

// Integer in [0, max)
Math.floor(Math.random() * max);

// Integer in [min, max]
Math.floor(Math.random() * (max - min + 1)) + min;

// Float in [min, max)
Math.random() * (max - min) + min;

// Random item from array
arr[Math.floor(Math.random() * arr.length)];

// Shuffle array (Fisher-Yates)
function shuffle(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

// ✅ Cryptographically secure random integers (Web Crypto API)
// Use for passwords, tokens, UUIDs, etc.
const array = new Uint32Array(1);
crypto.getRandomValues(array);     // fills with secure random bytes
array[0];                          // random uint32

// Secure random UUID
crypto.randomUUID();               // "110e8400-e29b-41d4-a716-446655440000"

// Secure random number in [0, 1)
crypto.getRandomValues(new Uint32Array(1))[0] / 2**32;
```

---

## 🔑 Key Takeaways

- JavaScript uses **IEEE 754 double precision** — all numbers are 64-bit floats.
- Use **`Number.isNaN()`** and **`Number.isFinite()`**, not the global versions (which coerce).
- Safe integer range is **±(2^53 − 1)**; use `BigInt` beyond that.
- **`0.1 + 0.2 !== 0.3`** — always compare floats with epsilon tolerance, not `===`.
- **`Math.trunc`** rounds toward zero; **`Math.floor`** rounds toward −∞ (different for negatives).
- **`Math.atan2(y, x)`** is better than `Math.atan(y/x)` — handles all quadrants.
- **`Math.random()`** is **not** cryptographically secure — use **`crypto.getRandomValues()`** for security-sensitive randomness.
- **`crypto.randomUUID()`** generates RFC 4122 compliant UUIDs securely.

---

[← Previous: Strings & Template Literals](10-strings.md) | [Contents](README.md) | [Next: JSON →](12-json.md)
