# 36: Testing

## 🧪 Why Test?

- Catch bugs before users do
- Confidently refactor code
- Document expected behavior
- Prevent regressions

### Types of Tests

| Type | Scope | Speed | Example |
|---|---|---|---|
| **Unit** | Single function/class | Very fast | `add(2, 3) === 5` |
| **Integration** | Multiple modules together | Fast | API handler + DB |
| **E2E** | Full user flow in browser | Slow | Login → cart → checkout |

---

## ⚙️ Jest / Vitest Basics

Vitest is the modern choice (compatible with Jest API, runs on Vite).

```bash
# Install
npm install -D vitest
npm install -D jest @types/jest

# Run
npx vitest
npx jest
```

---

## 🏗️ Structuring Tests

Organize tests with `describe` blocks for grouping related cases and `it`/`test` for individual assertions. Group by the function or behavior being tested, and write test descriptions that read like plain English sentences explaining what the code should do.

```js
// math.test.js  or  math.spec.js
import { describe, it, expect, beforeEach, afterEach } from "vitest";
import { add, subtract, divide } from "./math.js";

describe("Math functions", () => {
  describe("add()", () => {
    it("adds two positive numbers", () => {
      expect(add(2, 3)).toBe(5);
    });

    it("handles negative numbers", () => {
      expect(add(-1, -2)).toBe(-3);
    });

    it("returns 0 for add(0, 0)", () => {
      expect(add(0, 0)).toBe(0);
    });
  });

  describe("divide()", () => {
    it("divides correctly", () => {
      expect(divide(10, 2)).toBe(5);
    });

    it("throws on division by zero", () => {
      expect(() => divide(10, 0)).toThrow("Cannot divide by zero");
      expect(() => divide(10, 0)).toThrow(RangeError);
    });
  });
});
```

---

## ✅ Matchers (Expect API)

`expect(value).matcher()` makes assertions readable. Use `.toBe` for strict equality, `.toEqual` for deep object comparison, `.toContain`/`.toMatchObject` for partial matching, and `await expect(promise).resolves.toBe(...)` for async assertions.

```js
// Equality
expect(val).toBe(5);          // strict equality (===)
expect(val).toEqual({ a: 1 }); // deep equality
expect(val).not.toBe(5);

// Truthiness
expect(val).toBeTruthy();
expect(val).toBeFalsy();
expect(val).toBeNull();
expect(val).toBeUndefined();
expect(val).toBeDefined();

// Numbers
expect(0.1 + 0.2).toBeCloseTo(0.3, 5);  // floating point
expect(10).toBeGreaterThan(5);
expect(5).toBeLessThanOrEqual(5);

// Strings
expect("hello world").toContain("world");
expect("hello").toMatch(/^h/);

// Arrays
expect([1, 2, 3]).toContain(2);
expect([1, 2, 3]).toHaveLength(3);
expect([1, 2, 3]).toEqual(expect.arrayContaining([1, 3]));  // subset

// Objects
expect({ a: 1, b: 2 }).toMatchObject({ a: 1 });  // partial match
expect(obj).toHaveProperty("user.name", "Alice");

// Errors
expect(() => fn()).toThrow();
expect(() => fn()).toThrow("message");
expect(() => fn()).toThrow(CustomError);

// Promises / async
await expect(asyncFn()).resolves.toBe("ok");
await expect(asyncFn()).rejects.toThrow("error");

// Snapshots
expect(renderHtml(component)).toMatchSnapshot();  // auto-creates/updates
```

---

## 🎭 Mocking

`vi.fn()` creates a mock function that tracks calls and return values. `vi.mock('module')` replaces an entire module for the test file. `vi.spyOn()` wraps an existing method to track calls while preserving real behavior. Always restore mocks after each test.

```js
import { vi, describe, it, expect } from "vitest";

// Mock a function
const mockFn = vi.fn();
mockFn(1, 2);
expect(mockFn).toHaveBeenCalledWith(1, 2);
expect(mockFn).toHaveBeenCalledTimes(1);

// Return values
const spy = vi.fn().mockReturnValue(42);
const asyncSpy = vi.fn().mockResolvedValue({ data: "ok" });
const onceSpy = vi.fn()
  .mockReturnValueOnce("first")
  .mockReturnValueOnce("second")
  .mockReturnValue("rest");

// Mock entire module
vi.mock("./api.js", () => ({
  fetchUser: vi.fn().mockResolvedValue({ name: "Alice" }),
  saveUser:  vi.fn().mockResolvedValue({ ok: true }),
}));

// Spy on existing method without replacing it
const consoleSpy = vi.spyOn(console, "error");
consoleSpy.mockImplementation(() => {});  // suppress output in tests

// Restore
consoleSpy.mockRestore();

// Partial mock with actual implementation
vi.mock("./utils.js", async (importOriginal) => {
  const actual = await importOriginal();
  return { ...actual, formatDate: vi.fn().mockReturnValue("Jan 1, 2024") };
});
```

---

## ⏰ Fake Timers

`vi.useFakeTimers()` replaces `setTimeout`, `setInterval`, and `Date` with controllable fakes. Use `vi.advanceTimersByTime(ms)` to fast-forward time without actually waiting, making it trivial to test debounce, throttle, and interval-based code.

```js
import { vi } from "vitest";

describe("debounce", () => {
  beforeEach(() => vi.useFakeTimers());
  afterEach(() => vi.useRealTimers());

  it("calls function after delay", () => {
    const fn      = vi.fn();
    const debounced = debounce(fn, 300);

    debounced("a");
    debounced("b");
    debounced("c");

    expect(fn).not.toHaveBeenCalled();  // still waiting

    vi.advanceTimersByTime(300);
    expect(fn).toHaveBeenCalledTimes(1);
    expect(fn).toHaveBeenCalledWith("c");
  });

  it("respects setInterval", () => {
    const fn = vi.fn();
    setInterval(fn, 1000);

    vi.advanceTimersByTime(3500);
    expect(fn).toHaveBeenCalledTimes(3);
  });

  it("can jump to a specific time", () => {
    vi.setSystemTime(new Date("2024-01-01"));
    expect(new Date().getFullYear()).toBe(2024);
  });
});
```

---

## ♻️ Setup & Teardown

`beforeAll`/`afterAll` run once per `describe` block — use them for expensive setup like creating a test database. `beforeEach`/`afterEach` run around every test — use them to seed fresh data and restore mocks to keep each test independent.

```js
import { beforeAll, afterAll, beforeEach, afterEach } from "vitest";

let db;

beforeAll(async () => {
  db = await createTestDatabase();
  await db.migrate();
});

afterAll(async () => {
  await db.close();
});

beforeEach(async () => {
  await db.seed(testData);  // fresh data for each test
});

afterEach(async () => {
  await db.clear();
  vi.restoreAllMocks();    // restore any spies
});
```

---

## 📐 Testing Async Code

Always `return` a Promise or use `async/await` in tests — if you forget and the assertion throws asynchronously, the test may falsely pass. Use `await expect(promise).rejects.toThrow(...)` to assert on promise rejections cleanly.

```js
// async/await style (preferred)
it("fetches user", async () => {
  const user = await fetchUser(1);
  expect(user.name).toBe("Alice");
});

// Promise style
it("fetches user (promise)", () => {
  return fetchUser(1).then(user => {
    expect(user.name).toBe("Alice");
  });
});

// Testing error cases
it("handles 404", async () => {
  await expect(fetchUser(999)).rejects.toThrow("Not found");
});

// Fetch mocking (MSW — Mock Service Worker is the gold standard)
// Or simple fetch mock:
global.fetch = vi.fn().mockResolvedValue({
  ok: true,
  json: () => Promise.resolve({ id: 1, name: "Alice" }),
});
```

---

## 📊 Code Coverage

Code coverage reports show which lines, branches, and functions were exercised by your tests. Configure coverage thresholds in `vitest.config.js` to fail the CI build if coverage drops below your target. Run `--coverage` to get both a terminal summary and an HTML report.

```json
// vitest.config.js
export default {
  test: {
    coverage: {
      provider: "v8",      // or "istanbul"
      reporter: ["text", "html", "lcov"],
      include: ["src/**/*.js"],
      exclude: ["src/**/*.test.js"],
      thresholds: {
        lines:     80,
        functions: 80,
        branches:  70,
      },
    },
  },
};
```

```bash
npx vitest --coverage
# Opens coverage/index.html for visual report
```

---

## 🏆 Testing Best Practices

Write test descriptions that explain what the code does and under what conditions. Follow the Arrange-Act-Assert pattern for clarity. Use `test.each` for data-driven tests instead of copy-pasting. Test behavior, not implementation details, so tests don't break on refactors.

```js
// ✅ Descriptive test names — describe WHAT and WHEN
it("returns null when user is not found");
it("throws ValidationError when email is invalid");
it("sends welcome email after successful registration");

// ✅ AAA pattern — Arrange, Act, Assert
it("doubles a number", () => {
  // Arrange
  const input = 5;

  // Act
  const result = double(input);

  // Assert
  expect(result).toBe(10);
});

// ✅ One assertion concept per test
// ❌ Too many unrelated assertions in one test

// ✅ Test behavior, not implementation
// ❌ Don't test private internals

// ✅ Tests should be independent — no shared mutable state
// ✅ Fast tests run often — slow tests run in CI

// ✅ Use test.each for data-driven tests
it.each([
  [1, 2, 3],
  [0, 0, 0],
  [-1, 1, 0],
])("add(%i, %i) === %i", (a, b, expected) => {
  expect(add(a, b)).toBe(expected);
});
```

---

## 🔑 Key Takeaways

- Unit tests are fast and focused; integration tests cover module interactions; E2E covers full flows.
- Vitest is the modern choice (Vite-based, Jest-compatible API).
- `describe` groups related tests; `it`/`test` for individual cases.
- `vi.fn()` for function mocks; `vi.spyOn()` to track calls on real objects.
- `vi.mock("module")` to replace entire modules in tests.
- `vi.useFakeTimers()` + `vi.advanceTimersByTime()` to test debounce/intervals.
- `beforeEach` / `afterEach` for test isolation; `beforeAll` / `afterAll` for expensive setup.
- Follow AAA (Arrange-Act-Assert) for readable tests.
- Aim for 80%+ coverage on business logic; don't obsess over 100%.

---

[← Previous: Memory Management & Garbage Collection](41-memory-management.md) | [Contents](README.md) | [Next: Tooling (Vite, Webpack, Babel, ESLint) →](43-tooling.md)
