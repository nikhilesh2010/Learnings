# 10: Strings & Template Literals

## 📝 String Basics

```js
const single  = 'Hello';
const double  = "World";
const template = `Hello, ${double}!`;  // Template literal (ES6)

// Strings are immutable primitives
"hello"[0] = "H";  // silently fails
typeof "hello";     // "string"

// Length
"hello".length; // 5

// Unicode support
"café".length;  // 4 (JS counts UTF-16 code units)
[..."café"];    // ["c","a","f","é"] — spread iterates code points
```

---

## 🔤 Template Literals

```js
const name = "Alice";
const age  = 30;

// Embedded expressions
const greeting = `Hello, ${name}! You are ${age} years old.`;
const math      = `Result: ${2 + 2}`;
const fn        = `Uppercase: ${name.toUpperCase()}`;
const ternary   = `Status: ${age >= 18 ? "adult" : "minor"}`;

// Multi-line strings
const essay = `
  This is line 1.
  This is line 2.
  This is line 3.
`;

// Nested templates
const list = items => `
  <ul>
    ${items.map(item => `<li>${item}</li>`).join("\n    ")}
  </ul>
`;
```

### Tagged Template Literals
```js
// Tag function receives strings array + values
function highlight(strings, ...values) {
  return strings.reduce((result, str, i) => {
    const val = values[i] !== undefined ? `<b>${values[i]}</b>` : "";
    return result + str + val;
  }, "");
}

const user = "Alice";
const score = 95;
highlight`Player ${user} scored ${score} points!`;
// "Player <b>Alice</b> scored <b>95</b> points!"

// Real-world: styled-components, SQL template tags
const query = sql`SELECT * FROM users WHERE id = ${userId}`;
```

---

## 🔍 String Methods

### Searching

```js
const str = "Hello, World! Hello!";

str.includes("World");      // true ✅ (use this)
str.startsWith("Hello");    // true
str.endsWith("!");          // true
str.startsWith("World", 7); // true — check from index 7

str.indexOf("Hello");       // 0 (first occurrence)
str.lastIndexOf("Hello");   // 14 (last occurrence)
str.indexOf("xyz");         // -1 (not found)

// Regex search
str.search(/World/i);       // 7 — returns index or -1
```

### Extracting

```js
const str = "Hello, World!";

// slice(start, end) — end not included, supports negative
str.slice(7);       // "World!"
str.slice(7, 12);   // "World"
str.slice(-6);      // "orld!" wait: "World!"
str.slice(0, 5);    // "Hello"

// at() — supports negative index (ES2022)
str.at(0);   // "H"
str.at(-1);  // "!"

// substr (deprecated — avoid it)
// substring(start, end) — like slice but no negative
str.substring(7, 12); // "World"
str.charAt(0);        // "H"
str.charCodeAt(0);    // 72
```

### Case Conversion

```js
"Hello World".toLowerCase(); // "hello world"
"Hello World".toUpperCase(); // "HELLO WORLD"

// Locale-aware (important for i18n)
"istanbul".toLocaleUpperCase("tr-TR"); // "İSTANBUL"
```

### Trimming

```js
"  hello  ".trim();       // "hello"
"  hello  ".trimStart();  // "hello  "
"  hello  ".trimEnd();    // "  hello"
```

### Replacing

```js
const str = "Hello World Hello";

str.replace("Hello", "Hi");     // "Hi World Hello" — first only
str.replaceAll("Hello", "Hi");  // "Hi World Hi" ✅ (ES2021)

// Regex replace
str.replace(/Hello/g, "Hi");    // "Hi World Hi" — global flag

// Replace with function
"hello world".replace(/\b\w/g, char => char.toUpperCase());
// "Hello World"

// Named capture groups
"2024-03-15".replace(
  /(?<year>\d{4})-(?<month>\d{2})-(?<day>\d{2})/,
  "$<day>/$<month>/$<year>"
); // "15/03/2024"
```

### Splitting & Joining

```js
"a,b,c".split(",");          // ["a","b","c"]
"hello".split("");           // ["h","e","l","l","o"]
"hello".split("", 3);        // ["h","e","l"] — limit
"a  b  c".split(/\s+/);      // ["a","b","c"] — regex

["a","b","c"].join("-");     // "a-b-c"
["a","b","c"].join("");      // "abc"
```

### Padding & Repeating

```js
"5".padStart(3, "0");        // "005"
"hi".padEnd(10, ".");        // "hi........"
"42".padStart(5);            // "   42" — default is space

"ha".repeat(3);              // "hahaha"

// Useful: formatting numbers
String(num).padStart(8, "0"); // "00000042"
```

---

## 🔡 String Comparison

```js
"apple" < "banana";   // true (lexicographic)
"Z" < "a";            // true (uppercase < lowercase in Unicode)

// Locale-aware comparison (for proper sorting)
"ä" > "z";            // true (raw)
"ä".localeCompare("z"); // -1 (in German locale: ä comes before z) ✅

const names = ["Éclair", "Apple", "Banana"];
names.sort((a, b) => a.localeCompare(b, "en", { sensitivity: "base" }));
// Proper case-insensitive sort
```

---

## 🔢 Number ↔ String Conversions

```js
// Number to string
String(42);           // "42"
(42).toString();      // "42"
(255).toString(16);   // "ff"    — hex
(8).toString(2);      // "1000"  — binary
(3.14159).toFixed(2); // "3.14"  — decimal places
(1234.5).toLocaleString("en-US"); // "1,234.5"

// String to number
Number("42");         // 42
Number("3.14");       // 3.14
Number("0xff");       // 255
Number("");           // 0
Number("abc");        // NaN

parseInt("42px");     // 42
parseInt("0xff", 16); // 255 (explicit base)
parseFloat("3.14em"); // 3.14

+"42";  // 42  — unary + trick (converts to number)
+"abc"; // NaN
```

---

## 🔠 Character Codes & Unicode

```js
// Character code
"A".charCodeAt(0);       // 65
String.fromCharCode(65); // "A"

// Unicode code point (handles emojis/surrogate pairs)
"😀".codePointAt(0);          // 128512
String.fromCodePoint(128512); // "😀"

// Unicode escape sequences
"\u0041";   // "A"
"\u{1F600}"; // "😀" (ES6 — supports > U+FFFF)

// Normalize (canonical equivalence)
"\u00e9".normalize("NFC");  // é (composed form)
"\u0065\u0301".normalize("NFC"); // é (e + combining accent → composed)
```

---

## 🔍 Regular Expressions in Strings

```js
const email = "user@example.com";

// Test if matches
/\w+@\w+\.\w+/.test(email);  // true

// Match — returns array or null
email.match(/(\w+)@(\w+)\.(\w+)/);
// ["user@example.com", "user", "example", "com", index:0, ...]

// Match all occurrences
const text = "cats and dogs and horses";
[...text.matchAll(/\b\w+s\b/g)];
// [["cats",...], ["dogs",...], ["horses",...]]
```

---

## 📋 Useful Patterns

```js
// Capitalize first letter
const capitalize = s => s.charAt(0).toUpperCase() + s.slice(1);

// Truncate with ellipsis
const truncate = (s, max) => s.length > max ? s.slice(0, max) + "…" : s;

// Slug (URL-friendly)
const slug = s => s.toLowerCase().trim().replace(/\s+/g, "-").replace(/[^\w-]/g, "");

// Count occurrences
const countOccurrences = (str, sub) => str.split(sub).length - 1;
countOccurrences("hello world hello", "hello"); // 2

// Reverse a string
const reverse = s => [...s].reverse().join(""); // Use spread for Unicode safety

// Is palindrome
const isPalindrome = s => {
  const clean = s.toLowerCase().replace(/[^a-z0-9]/g, "");
  return clean === [...clean].reverse().join("");
};

// camelCase to kebab-case
const toKebab = s => s.replace(/([A-Z])/g, "-$1").toLowerCase();
toKebab("helloWorld"); // "hello-world"
```

---

## 🔑 Key Takeaways

- Template literals (`` ` `` backticks) support expressions, multi-line, and tagged templates.
- Strings are **immutable** — methods always return new strings.
- Use `includes()`, `startsWith()`, `endsWith()` over `indexOf()` for boolean checks.
- `replaceAll()` replaces all occurrences without a regex global flag.
- Use `localeCompare()` for proper sorting of international strings.
- Use spread `[...str]` instead of `str.split("")` to correctly handle Unicode (emojis, etc.).

---

[← Previous: Arrays](09-arrays.md) | [Contents](README.md) | [Next: Math & Number →](11-math-and-number.md)
