# 39: Best Practices

## 🏗️ Code Quality Principles

### Use Meaningful Names

```js
// ❌ Cryptic
const d = new Date();
const x = users.filter(u => u.a > 18);
function calc(a, b) { return a * b * 0.1; }

// ✅ Descriptive
const currentDate = new Date();
const legalAgeUsers = users.filter(user => user.age > 18);
function calculateTax(price, taxRate) { return price * taxRate; }

// ✅ Booleans should read as yes/no questions
const isLoading    = true;
const hasError     = false;
const canEdit      = user.role === "admin";
const shouldRetry  = attempts < MAX_RETRIES;

// ✅ Functions should describe the action they perform
getUserById(id);
validateEmail(email);
transformToSnakeCase(str);
```

---

### Prefer `const` over `let`, avoid `var`

```js
// ✅ Default: const
const PI = 3.14;
const config = { debug: true };  // object is mutable, binding is not

// ✅ Use let only when value truly changes
let count = 0;
count++;  // ok

// ❌ Avoid var — function-scoped, hoisted, can cause subtle bugs
var x = 1;
```

---

### Keep Functions Small and Focused

```js
// ❌ One monster function
async function handleRegistration(formData) {
  if (!formData.email || !formData.password) throw new Error("Missing fields");
  if (!/\S+@\S+\.\S+/.test(formData.email)) throw new Error("Bad email");
  const hash = await bcrypt.hash(formData.password, 10);
  const user = await db.insert({ email: formData.email, password: hash });
  await sendEmail(user.email, "Welcome!");
  await createDefaultSettings(user.id);
  return user;
}

// ✅ Decomposed into single responsibilities
async function handleRegistration(formData) {
  validateRegistrationInput(formData);
  const user = await createUser(formData);
  await onboardUser(user);
  return user;
}

function validateRegistrationInput({ email, password }) {
  if (!email || !password) throw new ValidationError("Missing fields");
  if (!isValidEmail(email)) throw new ValidationError("Invalid email");
}

async function createUser({ email, password }) {
  const hash = await hashPassword(password);
  return db.users.insert({ email, password: hash });
}

async function onboardUser(user) {
  await Promise.all([
    sendWelcomeEmail(user.email),
    createDefaultSettings(user.id),
  ]);
}
```

---

## 🔄 Async / Await Best Practices

Always handle errors with `try/catch` around `await` calls, and run independent async operations in parallel with `Promise.all` — sequential `await` chains are slower than necessary. Never forget the `await` keyword on async calls; a missing `await` is one of the most common async bugs.

```js
// ✅ Prefer async/await over raw promises
// ✅ Handle errors explicitly
async function fetchData(url) {
  try {
    const res = await fetch(url);
    if (!res.ok) throw new HttpError(res.status, `Fetch failed: ${url}`);
    return await res.json();
  } catch (err) {
    logger.error("fetchData failed", { url, error: err.message });
    throw err;
  }
}

// ✅ Run independent async ops in parallel
// ❌ Sequential when you don't need to be (slower)
const users  = await fetchUsers();
const posts  = await fetchPosts();

// ✅ Parallel
const [users, posts] = await Promise.all([fetchUsers(), fetchPosts()]);

// ✅ Don't forget to await
// ❌ Forgot await — no error thrown, but no wait either
loginUser();  // returns Promise but result not used

// ✅
await loginUser();

// ✅ Async IIFE for top-level await in non-module contexts
(async () => {
  const data = await fetchData("/api/config");
  initApp(data);
})();
```

---

## 🧊 Immutability & Pure Functions

Never mutate function parameters — always create and return new objects or arrays. This makes side effects obvious and makes code easier to reason about, test, and debug, especially in state management contexts.

```js
// ✅ Don't mutate objects / arrays received as parameters
function addItem(cart, item) {
  return [...cart, item];   // new array — original cart unchanged
}

// ❌ Mutates parameter — surprising to callers
function addItem(cart, item) {
  cart.push(item);  // breaks immutability
}

// ✅ Return new objects from reducers / state updates
function updateUser(user, changes) {
  return { ...user, ...changes };
}
```

---

## 📦 Module Organization

Use named exports for utility functions (they're tree-shakeable) and default exports for a module's primary class or component. Barrel files (`index.js`) provide clean, stable import paths for consumers and hide internal file structure.

```js
// ✅ One concern per file; small, focused modules
// ✅ Use named exports for libraries (tree-shakeable)
export function add(a, b) { return a + b; }

// ✅ Default export for main module export (like a React component)
export default class UserService { ... }

// ✅ Barrel files for clean imports
// src/utils/index.js
export { formatDate } from "./date.js";
export { debounce }   from "./timing.js";

// Consumer:
import { formatDate, debounce } from "@/utils";

// ❌ Deeply nested relative paths are hard to read
import { thing } from "../../../../shared/utils/format";
// ✅ Use path aliases
import { thing } from "@/shared/utils/format";
```

---

## ⚠️ Error Handling Discipline

A silently caught and ignored error is the worst kind of bug — it hides problems and makes debugging nearly impossible. Always at least log unexpected errors, validate data at system boundaries, and use custom error classes to carry domain-specific context.

```js
// ✅ Never silently swallow errors
try { doThing(); } catch {}   // ❌ hides bugs

try {
  doThing();
} catch (err) {
  logger.error("doThing failed:", err);  // ✅ at least log it
  throw err;                             // ✅ or re-throw
}

// ✅ Validate external data at boundaries
function createUser(input) {
  if (!input || typeof input !== "object") {
    throw new TypeError("createUser: input must be an object");
  }
  // ...
}

// ✅ Use custom error classes for domain errors
class UserNotFoundError extends Error { ... }
throw new UserNotFoundError(userId);
```

---

## 🧹 Clean Code Checklist

Favor early returns (guard clauses) over nested `if/else` trees — they reduce indentation and make the happy path clear. Use destructuring, default parameters, optional chaining, and template literals to write concise, intent-revealing code.

```js
// ✅ Prefer early returns to reduce nesting
function processOrder(order) {
  if (!order) return null;            // guard clause
  if (!order.items.length) return []; // guard clause

  return order.items.map(processItem);
}

// ❌ Nested if-else pyramid
function processOrder(order) {
  if (order) {
    if (order.items.length) {
      return order.items.map(processItem);
    } else {
      return [];
    }
  } else {
    return null;
  }
}

// ✅ Use destructuring to clarify intent
function displayUser({ name, email, role = "user" }) {
  return `${name} <${email}> [${role}]`;
}

// ✅ Default parameters instead of manual checks
function greet(name = "Anonymous") {
  return `Hello, ${name}!`;
}

// ✅ Optional chaining + nullish coalescing for safe access
const city = user?.address?.city ?? "Unknown";

// ✅ Use template literals over concatenation
const msg = `Hello ${name}, you have ${count} messages.`;
```

---

## 🚀 Performance Best Practices

Cache expensive results with memoization, debounce user input handlers, and lazy load large modules only when needed. Prefer declarative array methods over manual loops for readability — the performance difference is negligible for typical data sizes.

```js
// ✅ Cache expensive computations
const memoized = memoize(expensiveCalc);

// ✅ Debounce user input handlers
input.addEventListener("input", debounce(search, 300));

// ✅ Lazy load large modules
const heavy = await import("./heavy-module.js");

// ✅ Use const for primitives in loops (aids V8 optimization)

// ✅ Prefer array spread/methods over manual loops for readability
const doubled = nums.map(n => n * 2);  // vs for loop
```

---

## 📝 Documentation Style

Use JSDoc comments on public API functions to document parameters, return types, and thrown errors — IDEs use these for inline documentation and type hints. Write comments that explain *why* code does something, not *what* it does (the code itself shows what); and remove dead code rather than commenting it out.

```js
// ✅ JSDoc comments for public API
/**
 * Fetches a user by ID.
 * @param {number} id - The user's unique identifier.
 * @returns {Promise<User>} The user object.
 * @throws {NotFoundError} If the user doesn't exist.
 */
async function getUserById(id) { ... }

// ✅ Comment the WHY, not the WHAT
// Bad: increment i  →  i++
// Good: retry after exponential backoff to avoid thundering herd
await sleep(2 ** attempt * 100);

// ✅ Remove dead code — don't comment it out
// (version control is for history, not commented code)
```

---

## 🔑 Key Takeaways

- `const` by default, `let` when needed, never `var`.
- Meaningful names: variables = nouns, functions = verbs, booleans = `is/has/can`.
- Single Responsibility Principle: one function = one job.
- Pure functions are predictable, testable, and composable.
- Use early returns (guard clauses) to avoid deep nesting.
- Parallel async with `Promise.all` — never sequential when not needed.
- Validate at system boundaries; trust internal code.
- Handle errors explicitly — never swallow them silently.
- `const` objects are still mutable — use spread to create new versions.
- Comment the *why*, not the *what*; delete dead code, don't comment it.

---

[← Previous: Security](44-security.md) | [Contents](README.md) | [Next: Debugging →](46-debugging.md)
