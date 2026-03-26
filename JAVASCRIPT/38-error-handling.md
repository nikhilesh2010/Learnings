# 32: Error Handling

## 🔥 try / catch / finally

`try` wraps risky code; `catch` receives any thrown error and handles it; `finally` always runs regardless of success or failure — ideal for cleanup like hiding spinners or releasing resources. Use the re-throw pattern to handle only what you can and let everything else propagate.

```js
try {
  // code that might throw
  const data = JSON.parse(invalidJson);
  await fetchData();
} catch (error) {
  // handles ANY error thrown inside try
  console.error(error.message);
  console.error(error.stack);
} finally {
  // ALWAYS runs — success or failure
  setLoading(false);
  cleanupResources();
}

// Optional catch binding (ES2019)
try {
  riskyOperation();
} catch {
  console.log("Something went wrong");
}

// Re-throw pattern — only handle what you can
try {
  processOrder(order);
} catch (error) {
  if (error instanceof ValidationError) {
    showUserMessage(error.message);
  } else {
    throw error;  // re-throw unexpected errors
  }
}
```

---

## 🏷️ Built-in Error Types

JavaScript has several built-in error subtypes for common situations: `TypeError` for wrong types, `ReferenceError` for undefined variables, `RangeError` for out-of-bounds values, and `SyntaxError` for malformed code. Every error has `.name`, `.message`, and `.stack` properties — and ES2022 added `.cause` for error chaining.

```js
// Error — base class
new Error("message");

// ReferenceError — accessing undefined variable
undeclaredVar;              // ReferenceError: undeclaredVar is not defined

// TypeError — wrong type of value
null.property;              // TypeError: Cannot read properties of null
undefined();                // TypeError: undefined is not a function

// SyntaxError — invalid code (usually parse-time)
eval("if (");               // SyntaxError

// RangeError — value out of valid range
new Array(-1);              // RangeError: Invalid array length
(1).toFixed(200);           // RangeError

// URIError — malformed URI
decodeURIComponent("%XYZ"); // URIError

// EvalError — deprecated (usually TypeError now)

// Inspect an error
const err = new Error("Something failed");
err.name;     // "Error"
err.message;  // "Something failed"
err.stack;    // Stack trace string

// Error with cause (ES2022)
try {
  connectToDatabase();
} catch (cause) {
  throw new Error("Failed to connect", { cause });
}
// err.cause === original db error
```

---

## 📐 Custom Error Classes

Extend `Error` to create domain-specific error classes that carry extra context (like HTTP status codes or invalid field names) and can be identified with `instanceof`. Always call `super(message)`, set `this.name`, and fix the prototype chain for transpiled environments.

```js
// Base custom error
class AppError extends Error {
  constructor(message, options = {}) {
    super(message);
    this.name = this.constructor.name;  // "ValidationError", "HttpError" etc.
    this.code = options.code ?? "UNKNOWN_ERROR";
    if (options.cause) this.cause = options.cause;

    // Fix prototype chain in transpiled environments
    Object.setPrototypeOf(this, new.target.prototype);
  }

  toJSON() {
    return { name: this.name, message: this.message, code: this.code };
  }
}

class ValidationError extends AppError {
  constructor(message, field) {
    super(message, { code: "VALIDATION_ERROR" });
    this.field = field;
  }
}

class HttpError extends AppError {
  constructor(statusCode, message) {
    super(message, { code: `HTTP_${statusCode}` });
    this.statusCode = statusCode;
  }

  get isClientError() { return this.statusCode >= 400 && this.statusCode < 500; }
  get isServerError() { return this.statusCode >= 500; }
}

class NotFoundError extends HttpError {
  constructor(resource) {
    super(404, `${resource} not found`);
    this.resource = resource;
  }
}

// Usage
try {
  throw new ValidationError("Email is invalid", "email");
} catch (err) {
  if (err instanceof ValidationError) {
    console.log(`Field: ${err.field}, Message: ${err.message}`);
  } else if (err instanceof HttpError) {
    console.log(`HTTP ${err.statusCode}: ${err.message}`);
  } else if (err instanceof AppError) {
    console.log(`App error [${err.code}]: ${err.message}`);
  } else {
    throw err;  // unexpected — re-throw
  }
}
```

---

## 🌐 Async Error Handling

For `async/await`, wrap awaited calls in `try/catch`. For Promise chains, use `.catch()` at the end. Be aware that `fetch` only rejects on network failure, not HTTP errors — check `response.ok` explicitly. When running multiple promises in parallel, add per-promise `.catch()` handlers to allow partial failures.

```js
// async/await with try/catch
async function fetchUser(id) {
  try {
    const res = await fetch(`/api/users/${id}`);
    if (!res.ok) throw new HttpError(res.status, `User ${id} not found`);
    return await res.json();
  } catch (err) {
    if (err instanceof HttpError && err.statusCode === 404) {
      return null;  // handle gracefully
    }
    throw err;  // rethrow others
  }
}

// Promise .catch
fetch("/api/data")
  .then(res => res.json())
  .then(processData)
  .catch(err => {
    console.error("Fetch failed:", err);
    return defaultData;  // recover with default
  })
  .finally(() => setLoading(false));

// Wrapping callbacks in promises with error handling
function readFile(path) {
  return new Promise((resolve, reject) => {
    fs.readFile(path, "utf8", (err, data) => {
      if (err) reject(err);
      else resolve(data);
    });
  });
}

// Catching in parallel
const [users, posts] = await Promise.all([
  fetchUsers().catch(() => []),   // default on failure
  fetchPosts().catch(() => []),
]);
```

---

## 🌍 Global Error Handlers

Register global handlers to catch errors that slip through all local handling. In the browser, use `window.onerror` for synchronous errors and `unhandledrejection` for missed Promise rejections. In Node.js, use `process.on('uncaughtException')` and `process.on('unhandledRejection')` — but always exit after an uncaught exception.

```js
// Browser — uncaught synchronous errors
window.onerror = (message, source, line, col, error) => {
  logToSentry({ message, source, line, col, stack: error?.stack });
  return true;  // suppress default browser error display
};

// Browser  — unhandled promise rejections
window.addEventListener("unhandledrejection", (event) => {
  console.error("Unhandled promise rejection:", event.reason);
  event.preventDefault();  // suppress console error
});

// Node.js
process.on("uncaughtException", (err) => {
  console.error("Uncaught exception:", err);
  process.exit(1);  // mandatory — process may be in corrupt state
});

process.on("unhandledRejection", (reason, promise) => {
  console.error("Unhandled rejection at:", promise, "reason:", reason);
});
```

---

## ✅ Result Pattern (no-throw)

An alternative to exceptions for expected failures:

```js
class Result {
  static ok(value)  { return { ok: true, value }; }
  static err(error) { return { ok: false, error }; }
}

async function parseUserInput(raw) {
  if (!raw.name)  return Result.err(new ValidationError("Name required", "name"));
  if (!raw.email) return Result.err(new ValidationError("Email required", "email"));
  return Result.ok({ name: raw.name.trim(), email: raw.email.toLowerCase() });
}

// Caller always handles both cases explicitly
const result = await parseUserInput(formData);
if (!result.ok) {
  showFieldError(result.error.field, result.error.message);
} else {
  submitUser(result.value);
}
```

---

## 🛟 Error Boundaries Pattern
Wrap risky async operations in a helper that catches failures and returns a fallback value instead of throwing. The retry utility adds exponential backoff for transient failures like network timeouts or flaky external APIs.
```js
// Wrap risky operations with recovery
async function withFallback(fn, fallback) {
  try {
    return await fn();
  } catch (err) {
    console.warn("Operation failed, using fallback:", err.message);
    return typeof fallback === "function" ? fallback(err) : fallback;
  }
}

const config = await withFallback(
  () => fetch("/config.json").then(r => r.json()),
  DEFAULT_CONFIG
);

// Retry with exponential backoff
async function retry(fn, { times = 3, delay = 100, factor = 2 } = {}) {
  for (let i = 0; i < times; i++) {
    try {
      return await fn();
    } catch (err) {
      if (i < times - 1) {
        await new Promise(r => setTimeout(r, delay * factor ** i));
      } else {
        throw err;
      }
    }
  }
}

const data = await retry(() => fetch("/api/flaky").then(r => r.json()), {
  times: 5,
  delay: 200,
});
```

---

## 📋 Error Handling Best Practices

Never silently swallow errors — at minimum log them. Catch only the errors you can meaningfully handle and re-throw the rest. Add actionable context to error messages and use `.cause` to chain errors so the root cause is never lost.

```js
// ✅ Be specific — catch only what you can handle
// ❌ Swallowing errors (silent failures are the worst)
try { something(); } catch (e) {}  // BAD — hides bugs

// ✅ Always log unexpected errors with full context
catch (err) {
  logger.error("processOrder failed", {
    orderId: order.id,
    userId: user.id,
    error: err.message,
    stack: err.stack,
  });
  throw err;
}

// ✅ Use custom error classes for business logic errors
// ✅ Include context in error messages
throw new Error(`User ${userId} not found in region ${region}`);
// vs
throw new Error("Not found");  // ❌ not helpful

// ✅ Don't use errors for flow control
// ❌ Using try/catch as if/else
try { return getUserById(id); }
catch { return createUser(); }  // wrong — use findOrCreate pattern

// ✅ Add .cause to chain errors
throw new Error("Payment failed", { cause: stripeError });
```

---

## 🔑 Key Takeaways

- `try/catch/finally` is the primary error handling mechanism.
- `finally` runs regardless of success or failure — ideal for cleanup.
- Extend `Error` to create semantic custom error classes with `instanceof` support.
- Always call `super(message)` and set `this.name = this.constructor.name`.
- Async errors in `async/await`: wrap in `try/catch`; in Promises: use `.catch`.
- `window.onerror` / `unhandledrejection` for global error logging.
- Never silently swallow errors — at minimum log them.
- The Result pattern avoids exceptions for expected failures (validation, not-found).
- Include actionable context in error messages; chain errors using `cause`.

---

[← Previous: Design Patterns](37-design-patterns.md) | [Contents](README.md) | [Next: Regular Expressions →](39-regex.md)
