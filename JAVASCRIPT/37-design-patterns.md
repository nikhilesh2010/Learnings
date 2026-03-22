# 31: Design Patterns

## 🏗️ Creational Patterns

### Singleton

Ensure only one instance of a class exists:

```js
class DatabaseConnection {
  static #instance = null;
  #connection;

  constructor() {
    if (DatabaseConnection.#instance) {
      return DatabaseConnection.#instance;
    }
    this.#connection = this.#connect();
    DatabaseConnection.#instance = this;
  }

  #connect() {
    return { query: (sql) => `result of: ${sql}` };
  }

  static getInstance() {
    return DatabaseConnection.#instance ?? new DatabaseConnection();
  }
}

const db1 = new DatabaseConnection();
const db2 = new DatabaseConnection();
db1 === db2;  // true — same instance

// Simpler module-based singleton
let _instance;
export function getInstance() {
  _instance ??= createExpensiveThing();
  return _instance;
}
```

---

### Factory

Create objects without exposing creation logic:

```js
class UserFactory {
  static create(type, data) {
    switch (type) {
      case "admin":   return new AdminUser(data);
      case "guest":   return new GuestUser(data);
      case "premium": return new PremiumUser(data);
      default: throw new Error(`Unknown user type: ${type}`);
    }
  }
}

const user = UserFactory.create("admin", { name: "Alice" });

// Abstract factory — family of related objects
class UIFactory {
  static createButton(theme) {
    return theme === "dark" ? new DarkButton() : new LightButton();
  }
  static createModal(theme) {
    return theme === "dark" ? new DarkModal() : new LightModal();
  }
}
```

---

### Builder

Construct complex objects step by step:

```js
class QueryBuilder {
  #table  = "";
  #wheres = [];
  #orderBy = null;
  #limit  = null;
  #selects = ["*"];

  from(table)  { this.#table = table; return this; }
  select(...fields) { this.#selects = fields; return this; }
  where(condition) { this.#wheres.push(condition); return this; }
  order(field, dir = "ASC") { this.#orderBy = `${field} ${dir}`; return this; }
  take(n)  { this.#limit = n; return this; }

  build() {
    let sql = `SELECT ${this.#selects.join(", ")} FROM ${this.#table}`;
    if (this.#wheres.length) sql += ` WHERE ${this.#wheres.join(" AND ")}`;
    if (this.#orderBy) sql += ` ORDER BY ${this.#orderBy}`;
    if (this.#limit)   sql += ` LIMIT ${this.#limit}`;
    return sql;
  }
}

const query = new QueryBuilder()
  .from("users")
  .select("id", "name", "email")
  .where("age > 18")
  .where("active = true")
  .order("name")
  .take(10)
  .build();
// "SELECT id, name, email FROM users WHERE age > 18 AND active = true ORDER BY name ASC LIMIT 10"
```

---

## 🔧 Structural Patterns

### Module Pattern (revealing module)

```js
// Using IIFE + closure
const Counter = (() => {
  let count = 0;  // private

  function increment() { count++; }
  function decrement() { count--; }
  function getCount()  { return count; }
  function reset()     { count = 0; }

  return { increment, decrement, getCount, reset }; // public API
})();

Counter.increment();
Counter.getCount();  // 1
// Counter.count → undefined (private!)
```

---

### Adapter (Wrapper)

Make incompatible interfaces work together:

```js
// Legacy payment API
class LegacyPaymentSystem {
  processPayment(amount, cardNumber, expiry) {
    return `Charged $${amount} to ${cardNumber}`;
  }
}

// New interface expected by app
// { pay(details) }

class PaymentAdapter {
  #legacy;
  constructor() { this.#legacy = new LegacyPaymentSystem(); }

  pay({ amount, card: { number, expiry } }) {
    return this.#legacy.processPayment(amount, number, expiry);
  }
}

const payment = new PaymentAdapter();
payment.pay({ amount: 100, card: { number: "1234", expiry: "12/26" } });
```

---

### Decorator Pattern

Add behavior to objects/functions without modifying originals:

```js
// Functional decorator
function withLogging(fn) {
  return function(...args) {
    console.log(`${fn.name} called with`, args);
    const result = fn(...args);
    console.log(`${fn.name} returned`, result);
    return result;
  };
}

function withRetry(fn, maxRetries = 3) {
  return async function(...args) {
    for (let i = 0; i < maxRetries; i++) {
      try { return await fn(...args); }
      catch (err) {
        if (i === maxRetries - 1) throw err;
        await new Promise(r => setTimeout(r, 2 ** i * 100));  // exponential backoff
      }
    }
  };
}

// Class decorator (with TC39 decorators proposal)
function readonly(target, context) {
  context.addInitializer(function() {
    Object.defineProperty(this, context.name, {
      writable: false,
      configurable: false,
    });
  });
  return target;
}
```

---

### Facade

Provide a simplified interface to a complex system:

```js
// Complex subsystems
class CPU    { freeze(){}; jump(pos){}; execute(){} }
class Memory { load(pos, data){} }
class HDD    { read(lba, size){ return "data"; } }

// Facade
class Computer {
  #cpu = new CPU();
  #memory = new Memory();
  #hdd = new HDD();

  start() {
    this.#cpu.freeze();
    this.#memory.load(0, this.#hdd.read(0, 512));
    this.#cpu.jump(0);
    this.#cpu.execute();
  }
}

// User just calls:
new Computer().start();
```

---

## 🔔 Behavioral Patterns

### Observer (Pub/Sub)

```js
class EventEmitter {
  #events = new Map();

  on(event, listener) {
    if (!this.#events.has(event)) this.#events.set(event, new Set());
    this.#events.get(event).add(listener);
    return () => this.off(event, listener);  // unsubscribe fn
  }

  off(event, listener) {
    this.#events.get(event)?.delete(listener);
  }

  once(event, listener) {
    const wrapper = (...args) => {
      listener(...args);
      this.off(event, wrapper);
    };
    return this.on(event, wrapper);
  }

  emit(event, ...args) {
    this.#events.get(event)?.forEach(fn => fn(...args));
  }
}

const bus = new EventEmitter();
const unsub = bus.on("login", user => console.log(`${user.name} logged in`));
bus.emit("login", { name: "Alice" });
unsub();  // clean up
```

---

### Strategy

Define a family of algorithms, encapsulate each, make them interchangeable:

```js
// Sorting strategies
const strategies = {
  bubble: (arr) => { /* ... */ },
  quick:  (arr) => arr.toSorted((a, b) => a - b),
  merge:  (arr) => { /* ... */ },
};

class Sorter {
  #strategy;
  constructor(strategy = strategies.quick) { this.#strategy = strategy; }
  setStrategy(strategy) { this.#strategy = strategy; }
  sort(data) { return this.#strategy([...data]); }
}

// Payment strategy
class PaymentProcessor {
  #strategies = {};

  register(name, strategy) { this.#strategies[name] = strategy; }

  process(method, amount) {
    if (!this.#strategies[method]) throw new Error(`Unknown method: ${method}`);
    return this.#strategies[method].pay(amount);
  }
}
```

---

### Command

Encapsulate actions as objects — supports undo/redo:

```js
class TextEditor {
  text = "";
  #history = [];

  execute(command) {
    command.execute(this);
    this.#history.push(command);
  }

  undo() {
    this.#history.pop()?.undo(this);
  }
}

class InsertCommand {
  constructor(text) { this.text = text; }
  execute(editor) { editor.text += this.text; }
  undo(editor)    { editor.text = editor.text.slice(0, -this.text.length); }
}

class DeleteCommand {
  #deleted = "";
  execute(editor) {
    this.#deleted = editor.text.at(-1) ?? "";
    editor.text = editor.text.slice(0, -1);
  }
  undo(editor) { editor.text += this.#deleted; }
}

const editor = new TextEditor();
editor.execute(new InsertCommand("Hello"));
editor.execute(new InsertCommand(" World"));
editor.text;   // "Hello World"
editor.undo();
editor.text;   // "Hello"
```

---

### Chain of Responsibility

Pass requests through a chain of handlers:

```js
class Handler {
  #next = null;

  setNext(handler) {
    this.#next = handler;
    return handler;  // enables chaining
  }

  handle(request) {
    return this.#next?.handle(request) ?? null;
  }
}

class AuthHandler extends Handler {
  handle(req) {
    if (!req.token) return { error: "Unauthorized" };
    return super.handle(req);
  }
}

class ValidationHandler extends Handler {
  handle(req) {
    if (!req.body?.name) return { error: "Name required" };
    return super.handle(req);
  }
}

class BusinessHandler extends Handler {
  handle(req) {
    return { success: true, data: req.body };
  }
}

const auth    = new AuthHandler();
const validate = new ValidationHandler();
const business = new BusinessHandler();

auth.setNext(validate).setNext(business);
auth.handle({ token: "abc", body: { name: "Alice" } });
// { success: true, data: { name: "Alice" } }
```

---

## 🔑 Key Takeaways

- **Singleton**: one instance — use ES module state or static class field.
- **Factory**: centralize object creation — easier to switch implementations.
- **Builder**: step-by-step construction with fluent interface (method chaining).
- **Module**: encapsulate private state with closures or ES module scope.
- **Adapter**: wrap incompatible interface — converts old API to new contract.
- **Decorator**: add behavior (logging, retry, cache) without touching original.
- **Facade**: simplify complex subsystem behind a minimal public API.
- **Observer/EventEmitter**: decouple producer from consumers — foundation of UI.
- **Strategy**: swap algorithms at runtime — avoid large if/switch chains.
- **Command**: encapsulate operations as objects — enables undo/redo history.
- **Chain of Responsibility**: middleware-style request pipeline.

---

[← Previous: Functional Programming Patterns](36-functional-programming.md) | [Contents](README.md) | [Next: Error Handling →](38-error-handling.md)
