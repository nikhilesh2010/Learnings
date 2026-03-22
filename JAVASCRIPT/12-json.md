# 45: JSON

JSON (JavaScript Object Notation) is the universal data interchange format. JavaScript's `JSON` object provides methods to serialize and deserialize it.

---

## 🔄 JSON.stringify — Serialization

```js
// Basic usage
JSON.stringify(42);               // "42"
JSON.stringify("hello");          // '"hello"'
JSON.stringify(true);             // "true"
JSON.stringify(null);             // "null"
JSON.stringify([1, 2, 3]);        // "[1,2,3]"
JSON.stringify({ name: "Alice", age: 30 });  // '{"name":"Alice","age":30}'

// Pretty-print (indent with spaces or tab)
JSON.stringify({ a: 1, b: [2, 3] }, null, 2);
// {
//   "a": 1,
//   "b": [
//     2,
//     3
//   ]
// }

JSON.stringify({ a: 1 }, null, "\t");  // tab indentation
```

---

## ⚠️ What Gets Dropped / Transformed

```js
// Values that become undefined (dropped from objects, become null in arrays)
JSON.stringify({ fn: function() {}, sym: Symbol(), undef: undefined });
// '{}'    ← all three are dropped from the object

JSON.stringify([undefined, function(){}, Symbol()]);
// '[null,null,null]'   ← replaced with null in arrays

// Special number values
JSON.stringify({ inf: Infinity, nan: NaN, neg: -Infinity });
// '{"inf":null,"nan":null,"neg":null}'  ← converted to null

// Dates become ISO strings
JSON.stringify(new Date("2024-03-15T10:30:00Z"));
// '"2024-03-15T10:30:00.000Z"'   ← string, not a Date on parse!

// Map and Set — not directly serializable
JSON.stringify(new Map([["a", 1]]));  // '{}'
JSON.stringify(new Set([1, 2, 3]));   // '{}'

// BigInt — throws!
// JSON.stringify(42n);  // TypeError: Cannot serialize BigInt
```

---

## 🎛️ Replacer Function

A replacer lets you control which properties are included or transform values.

```js
const data = {
  name: "Alice",
  password: "secret123",
  age: 30,
  role: "admin",
};

// Filter: only include certain keys
JSON.stringify(data, ["name", "age"]);
// '{"name":"Alice","age":30}'

// Transform: replacer function (key, value)
JSON.stringify(data, (key, value) => {
  if (key === "password") return undefined;   // omit
  if (typeof value === "number") return value * 2;  // transform
  return value;
});
// '{"name":"Alice","age":60,"role":"admin"}'

// The root value has key = "" (empty string)
JSON.stringify({ x: 1 }, (key, value) => {
  console.log(key, typeof value);
  return value;
});
//  "" object   ← root call
//  x number
```

---

## 🔍 JSON.parse — Deserialization

```js
JSON.parse("42");               // 42
JSON.parse('"hello"');          // "hello"
JSON.parse("true");             // true
JSON.parse("null");             // null
JSON.parse("[1,2,3]");          // [1, 2, 3]
JSON.parse('{"name":"Alice"}'); // { name: "Alice" }

// Always wrap in try/catch — throws SyntaxError on invalid input
function safeJsonParse(text, fallback = null) {
  try {
    return JSON.parse(text);
  } catch {
    return fallback;
  }
}
safeJsonParse('{"a":1}');   // { a: 1 }
safeJsonParse("invalid");   // null
safeJsonParse("invalid", []); // []
```

---

## 🔮 Reviver Function

A reviver transforms values during parsing — the reverse of replacer.

```js
// Revive Date strings back to Date objects
const data = JSON.parse('{"created":"2024-03-15T10:30:00.000Z","count":5}', (key, value) => {
  if (typeof value === "string" && /^\d{4}-\d{2}-\d{2}T/.test(value)) {
    return new Date(value);
  }
  return value;
});
data.created instanceof Date;  // true ✅

// Revive Map
const text = '{"type":"Map","entries":[["a",1],["b",2]]}';
const map = JSON.parse(text, (key, value) => {
  if (value?.type === "Map") return new Map(value.entries);
  return value;
});
map instanceof Map;   // true
map.get("a");         // 1

// The reviver is called bottom-up (leaf nodes first)
JSON.parse('{"a":{"b":1}}', (key, value) => {
  console.log(key, value);
  return value;
});
// "b"  1
// "a"  { b: 1 }
// ""   { a: { b: 1 } }   ← "" is the root
```

---

## 🛠️ Custom toJSON()

Objects can define a `toJSON()` method to control their serialization.

```js
class Money {
  constructor(amount, currency) {
    this.amount   = amount;
    this.currency = currency;
  }

  toJSON() {
    return { amount: this.amount, currency: this.currency, _type: "Money" };
  }
}

JSON.stringify(new Money(99.99, "USD"));
// '{"amount":99.99,"currency":"USD","_type":"Money"}'

// Date uses toJSON() internally — that's why it becomes a string
new Date().toJSON();   // "2024-03-15T10:30:00.000Z"

// toJSON receives the key it's being serialized as
class Debug {
  toJSON(key) {
    return `[Debug value at key: ${key}]`;
  }
}
JSON.stringify({ info: new Debug() });
// '{"info":"[Debug value at key: info]"}'
```

---

## 🔄 Serializing Special Types

```js
// Map ↔ JSON
function mapToJson(map) {
  return JSON.stringify([...map.entries()]);
}
function jsonToMap(json) {
  return new Map(JSON.parse(json));
}

const m = new Map([["a", 1], ["b", 2]]);
const s = mapToJson(m);   // '[[\"a\",1],[\"b\",2]]'
jsonToMap(s).get("a");    // 1

// Set ↔ JSON
const set = new Set([1, 2, 3]);
JSON.stringify([...set]);           // '[1,2,3]'
new Set(JSON.parse('[1,2,3]'));     // Set(3) {1, 2, 3}

// BigInt ↔ JSON (custom)
const obj = { id: 9007199254740993n };
JSON.stringify(obj, (key, value) =>
  typeof value === "bigint" ? value.toString() : value
);  // '{"id":"9007199254740993"}'

// Error ↔ JSON
function errorToJson(err) {
  return JSON.stringify({ message: err.message, name: err.name, stack: err.stack });
}
```

---

## 🔁 Deep Clone with JSON

```js
// Quick deep clone — works for plain JSON-safe data
const original = { a: 1, b: { c: [2, 3] } };
const clone = JSON.parse(JSON.stringify(original));

// Limitations:
// ❌ Functions    → dropped
// ❌ undefined   → dropped (object) or null (array)
// ❌ Dates       → become strings (not Date objects)
// ❌ Map / Set   → become {}
// ❌ Circular refs → throws TypeError
// ❌ Class instances → lose their prototype

// ✅ Prefer structuredClone() for deep cloning (ES2022)
const betterClone = structuredClone(original);
// Handles: Date, Map, Set, ArrayBuffer, RegExp, Error
// Still does NOT clone: functions, DOM nodes, class methods
```

---

## 🔄 Circular Reference Handling

```js
// JSON.stringify throws on circular refs
const obj = {};
obj.self = obj;
// JSON.stringify(obj);  // TypeError: Converting circular structure to JSON

// Option 1: replacer to detect and replace cycles
function stringifyWithCycles(obj) {
  const seen = new WeakSet();
  return JSON.stringify(obj, (key, value) => {
    if (typeof value === "object" && value !== null) {
      if (seen.has(value)) return "[Circular]";
      seen.add(value);
    }
    return value;
  });
}

const circular = { a: 1 };
circular.self = circular;
stringifyWithCycles(circular);  // '{"a":1,"self":"[Circular]"}'

// Option 2: Use a library like flatted or json-stringify-safe for full round-trip
```

---

## 🛡️ Security Considerations

```js
// ❌ NEVER use eval() to parse JSON
eval('(' + jsonText + ')');    // XSS risk — can execute arbitrary code!

// ✅ ALWAYS use JSON.parse()
JSON.parse(jsonText);

// ❌ Prototype pollution — crafted JSON can pollute Object.prototype
JSON.parse('{"__proto__": {"isAdmin": true}}');
// In some older libraries/code this could set Object.prototype.isAdmin = true
// ✅ Safe in modern JS engines (JSON.parse is prototype pollution safe)
// ✅ But watch out with custom merge/assign logic:
const obj = {};
Object.assign(obj, JSON.parse('{"__proto__":{"evil":true}}'));
// Potentially dangerous — validate input shapes first

// ✅ Validate JSON structure using a schema library (Zod, Ajv)
import { z } from "zod";
const UserSchema = z.object({ name: z.string(), age: z.number() });
const user = UserSchema.parse(JSON.parse(rawJSON));   // throws on bad input
```

---

## 📏 JSON5 & JSONC (Supersets)

```js
// JSON5 — allows comments, trailing commas, single quotes (npm: json5)
import JSON5 from "json5";
JSON5.parse(`{
  // This is a comment
  name: 'Alice',       // unquoted keys
  scores: [1, 2, 3,],  // trailing comma
}`);

// JSONC — JSON with Comments (used in VS Code settings, tsconfig.json)
// No npm needed — VS Code's language server handles it
// Cannot be parsed with standard JSON.parse
```

---

## 🔑 Key Takeaways

- `JSON.stringify(value, replacer, indent)` — replacer can be an array (whitelist) or function (transform/filter).
- `JSON.parse(text, reviver)` — reviver lets you transform values (e.g., revive Dates, Maps).
- `toJSON()` on any object controls how it serializes — `Date` uses this internally.
- Things that get **dropped/changed**: `undefined`, functions, `Symbol`, `Infinity`, `NaN`, `BigInt` (throws).
- For deep cloning, prefer **`structuredClone()`** over the JSON round-trip trick.
- Handle **circular references** manually with a `WeakSet` in a replacer.
- Never use **`eval()`** to parse JSON — always use `JSON.parse()`.
- **Validate** parsed JSON against a schema (Zod, Ajv) before using it as trusted data.

---

[← Previous: Math & Number](11-math-and-number.md) | [Contents](README.md) | [Next: Prototypes & Prototype Chain →](13-prototypes.md)
