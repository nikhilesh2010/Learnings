# 26: Proxy & Reflect

## 🪞 Proxy Basics

A `Proxy` wraps another object and intercepts operations on it through **traps**.

```js
const target = { name: "Alice", age: 30 };

const proxy = new Proxy(target, {
  // get trap — intercepts property reads
  get(target, prop, receiver) {
    console.log(`Reading ${prop}`);
    return Reflect.get(target, prop, receiver);
  },
  // set trap — intercepts property writes
  set(target, prop, value, receiver) {
    console.log(`Setting ${prop} = ${value}`);
    return Reflect.set(target, prop, value, receiver);
  },
});

proxy.name;        // logs "Reading name", returns "Alice"
proxy.age = 31;    // logs "Setting age = 31"
```

---

## 🪤 All Proxy Traps

| Trap | Triggered by |
|---|---|
| `get(target, prop, receiver)` | `obj.prop`, `obj[prop]` |
| `set(target, prop, value, receiver)` | `obj.prop = val` |
| `has(target, prop)` | `prop in obj` |
| `deleteProperty(target, prop)` | `delete obj.prop` |
| `apply(target, thisArg, args)` | `fn(args)` — function call |
| `construct(target, args, newTarget)` | `new Fn(args)` |
| `getPrototypeOf(target)` | `Object.getPrototypeOf(obj)` |
| `setPrototypeOf(target, proto)` | `Object.setPrototypeOf(obj, proto)` |
| `isExtensible(target)` | `Object.isExtensible(obj)` |
| `preventExtensions(target)` | `Object.preventExtensions(obj)` |
| `defineProperty(target, prop, desc)` | `Object.defineProperty(obj, ...)` |
| `getOwnPropertyDescriptor(target, prop)` | `Object.getOwnPropertyDescriptor(obj, ...)` |
| `ownKeys(target)` | `Object.keys()`, `for...in`, etc. |

---

## 🛡️ Validation Proxy

Wrap an empty object in a Proxy with a `set` trap that checks types or values before allowing writes. This enforces a schema at runtime without any external library.

```js
function createTypedObject(schema) {
  return new Proxy({}, {
    set(target, prop, value) {
      const type = schema[prop];
      if (!type) throw new Error(`Unknown property: ${prop}`);
      if (typeof value !== type) {
        throw new TypeError(`${prop} must be a ${type}, got ${typeof value}`);
      }
      target[prop] = value;
      return true;
    },
    get(target, prop) {
      if (!(prop in target)) throw new Error(`Property ${prop} not set`);
      return target[prop];
    }
  });
}

const user = createTypedObject({ name: "string", age: "number" });
user.name = "Alice";   // ✅
user.age = "thirty";   // ❌ TypeError: age must be a number
```

---

## 🔄 Observable / Reactive Proxy

The foundation of Vue 3's reactivity system:

```js
function reactive(target, onChange) {
  return new Proxy(target, {
    set(target, prop, value, receiver) {
      const oldValue = target[prop];
      const result   = Reflect.set(target, prop, value, receiver);
      if (oldValue !== value) onChange(prop, value, oldValue);
      return result;
    },
    deleteProperty(target, prop) {
      const had    = prop in target;
      const result = Reflect.deleteProperty(target, prop);
      if (had) onChange(prop, undefined, target[prop]);
      return result;
    },
  });
}

const state = reactive({ count: 0 }, (prop, newVal, oldVal) => {
  console.log(`${prop} changed: ${oldVal} → ${newVal}`);
  renderUI();
});

state.count = 1;  // logs "count changed: 0 → 1"
```

---

## 🏦 Default Values Proxy

Intercept property reads with a `get` trap to return a fallback when a key doesn't exist. This pattern also enables negative array indexing by converting the index before forwarding the lookup.

```js
// Returns a default value for missing properties
const withDefaults = (target, defaultValue = 0) =>
  new Proxy(target, {
    get: (obj, prop) => (prop in obj ? obj[prop] : defaultValue),
  });

const scores = withDefaults({}, 0);
scores.Alice = 95;
scores.Alice;  // 95
scores.Bob;    // 0 — default

// Negative array indexing
const arr = new Proxy([1, 2, 3, 4, 5], {
  get(target, prop) {
    const index = Number(prop);
    const i = index < 0 ? target.length + index : index;
    return Reflect.get(target, i);
  },
});

arr[-1];  // 5
arr[-2];  // 4
```

---

## 🚫 Read-only / Frozen Proxy

Throw an error from the `set` and `deleteProperty` traps to create an object that appears normal but rejects all modifications at runtime — useful for protecting configuration or constants.

```js
function readOnly(target) {
  return new Proxy(target, {
    set() {
      throw new TypeError("This object is read-only");
    },
    deleteProperty() {
      throw new TypeError("This object is read-only");
    },
  });
}

const config = readOnly({ apiUrl: "https://api.example.com", timeout: 5000 });
config.timeout = 9000;     // ❌ TypeError
delete config.apiUrl;      // ❌ TypeError
config.apiUrl;             // ✅ "https://api.example.com"
```

---

## 🔁 Reflect API

`Reflect` provides a set of static methods that mirror the proxy trap names. Always use `Reflect` inside traps to avoid infinite loops and preserve correct behavior.

```js
// Reflect methods match Proxy trap names 1:1
Reflect.get(target, prop, receiver);         // obj[prop]
Reflect.set(target, prop, value, receiver);  // obj[prop] = value
Reflect.has(target, prop);                   // prop in obj
Reflect.deleteProperty(target, prop);        // delete obj[prop]
Reflect.apply(target, thisArg, args);        // fn.apply(thisArg, args)
Reflect.construct(target, args, newTarget);  // new Fn(...args)
Reflect.getPrototypeOf(target);              // Object.getPrototypeOf
Reflect.setPrototypeOf(target, proto);       // Object.setPrototypeOf
Reflect.ownKeys(target);                     // own property keys (incl. Symbols)
Reflect.defineProperty(target, prop, desc);
Reflect.getOwnPropertyDescriptor(target, prop);
Reflect.isExtensible(target);
Reflect.preventExtensions(target);

// Why Reflect matters in traps:
const proxy = new Proxy({}, {
  get(target, prop, receiver) {
    // ✅ Correct — handles inherited props and `this` binding properly
    return Reflect.get(target, prop, receiver);

    // ❌ Avoid — may cause issues with getters and prototype chain
    // return target[prop];
  }
});
```

---

## 🔬 Function Proxy (apply trap)

The `apply` trap intercepts all calls to a function, letting you add logging, memoization, timing, or argument validation transparently without modifying the original function.

```js
// Logging all function calls
function withLogging(fn) {
  return new Proxy(fn, {
    apply(target, thisArg, args) {
      console.log(`Calling ${target.name}(${args.join(", ")})`);
      const result = Reflect.apply(target, thisArg, args);
      console.log(`   → returned ${result}`);
      return result;
    },
  });
}

const add    = (a, b) => a + b;
const logAdd = withLogging(add);
logAdd(2, 3);
// Calling add(2, 3)
//    → returned 5

// Memoization proxy
function memoize(fn) {
  const cache = new Map();
  return new Proxy(fn, {
    apply(target, thisArg, args) {
      const key = JSON.stringify(args);
      if (cache.has(key)) return cache.get(key);
      const result = Reflect.apply(target, thisArg, args);
      cache.set(key, result);
      return result;
    },
  });
}
```

---

## ⚠️ Proxy Gotchas

Proxies only intercept operations on the proxy object itself — deeply nested objects are plain objects and won't trigger traps. Proxy deeply nested values by returning proxies from the `get` trap. Also note that proxies have a performance cost and can't violate non-configurable property invariants.

```js
// 1. Proxies don't intercept deeply nested objects — need nested proxies
const obj = reactive({ nested: { count: 0 } });
obj.nested.count = 1;   // ❌ nested.count change not caught!

// Fix: proxy recursively
function deepReactive(target, onChange) {
  return new Proxy(target, {
    get(t, p, r) {
      const val = Reflect.get(t, p, r);
      return (val && typeof val === "object") ? deepReactive(val, onChange) : val;
    },
    set(t, p, v, r) {
      const result = Reflect.set(t, p, v, r);
      onChange(p, v);
      return result;
    },
  });
}

// 2. Invariants — proxy can't lie about non-configurable, non-writable properties
// 3. typeof, instanceof still work on proxy (they operate on the proxy, not target)
// 4. Performance — proxies are slower than plain objects; use when needed
```

---

## 🔑 Key Takeaways

- `new Proxy(target, handler)` wraps an object to intercept operations via traps.
- Each trap corresponds to a fundamental JS operation (get, set, has, apply…).
- Always use `Reflect.*` inside traps to properly forward the operation.
- Use cases: validation, reactivity, access control, logging, memoization, default values.
- Proxies cannot intercept operations deep inside nested objects — proxy recursively.
- `Reflect` provides the same operations as traps — useful independently of Proxy.

---

[← Previous: Modules (import / export)](31-modules.md) | [Contents](README.md) | [Next: Modern Syntax (ES6–ES2024) →](33-modern-syntax.md)
