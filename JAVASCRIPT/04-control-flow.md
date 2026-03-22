# 04: Control Flow

## 🔀 if / else if / else

```js
const score = 75;

if (score >= 90) {
  console.log("A");
} else if (score >= 80) {
  console.log("B");
} else if (score >= 70) {
  console.log("C");
} else {
  console.log("F");
}
// Output: "C"

// Single-line (braces optional but use them!)
if (flag) doSomething();

// Braces-always rule prevents bugs:
if (flag)
  doA();
  doB(); // ← always executes! not inside the if
```

---

## 🔄 switch

```js
const day = "Monday";

switch (day) {
  case "Saturday":
  case "Sunday":
    console.log("Weekend");
    break;
  case "Monday":
    console.log("Start of work week");
    break;
  case "Friday":
    console.log("TGIF!");
    break;
  default:
    console.log("Midweek");
}

// switch uses strict equality (===)
switch ("5") {
  case 5:  console.log("number"); break;  // NOT matched
  case "5":console.log("string"); break;  // matched ✅
}

// Fall-through is intentional without break:
switch (n) {
  case 1:
  case 2:
  case 3:
    console.log("1 to 3");  // all three cases reach this
    break;
}
```

---

## 🔁 Loops

### `for`

```js
for (let i = 0; i < 5; i++) {
  console.log(i);  // 0 1 2 3 4
}

// Count down
for (let i = 10; i > 0; i -= 2) {
  console.log(i);  // 10 8 6 4 2
}

// Nested loops
for (let i = 0; i < 3; i++) {
  for (let j = 0; j < 3; j++) {
    console.log(i, j);
  }
}
```

### `while`

```js
let i = 0;
while (i < 5) {
  console.log(i);
  i++;
}

// Processing until condition
let input;
while (!isValid(input)) {
  input = getInput();
}
```

### `do...while`

```js
// Executes ONCE before checking condition
let i = 0;
do {
  console.log(i);  // runs at least once even if condition false
  i++;
} while (i < 5);

// Menu loop pattern
let choice;
do {
  choice = showMenu();
} while (choice !== "quit");
```

### `for...of` (ES6) — iterating values

```js
// Arrays
const fruits = ["apple", "banana", "cherry"];
for (const fruit of fruits) {
  console.log(fruit);
}

// Strings (iterates characters)
for (const char of "hello") {
  console.log(char);  // h e l l o
}

// With index (using entries())
for (const [index, value] of fruits.entries()) {
  console.log(`${index}: ${value}`);
}

// Maps
const map = new Map([["a", 1], ["b", 2]]);
for (const [key, value] of map) {
  console.log(key, value);
}

// Sets
const set = new Set([1, 2, 3]);
for (const val of set) {
  console.log(val);
}
```

### `for...in` — iterating object keys

```js
const person = { name: "Alice", age: 30, city: "Paris" };

for (const key in person) {
  console.log(`${key}: ${person[key]}`);
}

// ⚠️ for...in also iterates inherited properties
// Use hasOwnProperty check in older code:
for (const key in obj) {
  if (Object.hasOwn(obj, key)) {  // ES2022, or obj.hasOwnProperty(key)
    console.log(key);
  }
}

// for...in on arrays — DON'T DO THIS
// Use for...of or Array methods instead
```

---

## 🛑 Loop Control

```js
// break — exits the loop
for (let i = 0; i < 10; i++) {
  if (i === 5) break;
  console.log(i);  // 0 1 2 3 4
}

// continue — skips current iteration
for (let i = 0; i < 10; i++) {
  if (i % 2 === 0) continue;
  console.log(i);  // 1 3 5 7 9
}

// Labeled breaks — for nested loops
outer: for (let i = 0; i < 3; i++) {
  for (let j = 0; j < 3; j++) {
    if (j === 1) break outer;  // breaks both loops
    console.log(i, j);
  }
}
```

---

## 🛡️ try / catch / finally

```js
try {
  const result = JSON.parse(invalidJSON); // throws SyntaxError
  console.log(result);
} catch (error) {
  console.error("Parsing failed:", error.message);
} finally {
  console.log("Always runs — cleanup here");
}

// Catching specific error types
try {
  riskyOperation();
} catch (error) {
  if (error instanceof TypeError) {
    console.log("Type error:", error.message);
  } else if (error instanceof RangeError) {
    console.log("Range error:", error.message);
  } else {
    throw error; // re-throw unexpected errors
  }
}

// Optional catch binding (ES2019) — when you don't need the error
try {
  JSON.parse(text);
} catch {
  return null;  // no (error) parameter needed
}
```

---

## 💣 throw

```js
// Throw anything (but Error objects are conventional)
throw new Error("Something went wrong");
throw new TypeError("Expected a string");
throw new RangeError("Value out of range");

// Custom error classes
class ValidationError extends Error {
  constructor(field, message) {
    super(message);
    this.name = "ValidationError";
    this.field = field;
  }
}

throw new ValidationError("email", "Invalid email format");

// Usage
try {
  validate(input);
} catch (e) {
  if (e instanceof ValidationError) {
    showFieldError(e.field, e.message);
  } else {
    throw e;
  }
}
```

---

## 🔀 Conditional Patterns

### Guard Clauses (Early Return)
```js
// ❌ Deep nesting
function process(user) {
  if (user) {
    if (user.isActive) {
      if (user.role === "admin") {
        performAdminAction();
      }
    }
  }
}

// ✅ Guard clauses — flat and readable
function process(user) {
  if (!user) return;
  if (!user.isActive) return;
  if (user.role !== "admin") return;

  performAdminAction();
}
```

### Nullish Safety Pattern
```js
function getDisplayName(user) {
  return user?.profile?.displayName
    ?? user?.username
    ?? "Anonymous";
}
```

### Object Lookup (replace switch)
```js
// Instead of long switch:
const handlers = {
  click: handleClick,
  keydown: handleKeydown,
  submit: handleSubmit,
};

const handler = handlers[eventType];
if (handler) handler(event);
```

---

## 🔑 Key Takeaways

- Always use `{}` braces with if/else — even for one-liners.
- `for...of` iterates **values** (arrays, strings, maps, sets).
- `for...in` iterates **object keys** — avoid on arrays.
- Use guard clauses (early return) to reduce nesting.
- `finally` always runs — use it for cleanup (close files, release locks).
- Re-throw unexpected errors in catch blocks.

---

[← Previous: Operators](03-operators.md) | [Contents](README.md) | [Next: Functions →](05-functions.md)
