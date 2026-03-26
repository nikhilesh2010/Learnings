# 40: Debugging

## 🔍 Console Methods

Beyond `console.log`, the console has specialized methods for every scenario: `console.table` renders arrays of objects as a sortable table, `console.group` creates collapsible sections for related logs, `console.time`/`timeEnd` measures elapsed time, and `console.assert` only logs when a condition is false.

```js
// Basic output
console.log("Message", variable);
console.error("Error:", err);         // red in DevTools
console.warn("Warning:", msg);        // yellow
console.info("Info:", data);

// Structured output
console.dir(obj);                     // interactive object tree
console.table(arrayOfObjects);        // renders as a table — great for arrays!
console.table([
  { name: "Alice", age: 25 },
  { name: "Bob",   age: 30 },
]);

// Groups — collapsible sections
console.group("User Requests");
console.log("GET /api/users");
console.log("POST /api/login");
console.groupEnd();

console.groupCollapsed("Details");    // collapsed by default
console.log(details);
console.groupEnd();

// Counting
console.count("myLabel");             // "myLabel: 1", "myLabel: 2" ...
console.countReset("myLabel");

// Timing
console.time("fetch-users");
await fetchUsers();
console.timeEnd("fetch-users");       // "fetch-users: 42.5ms"
console.timeLog("fetch-users");       // intermediate log without stopping

// Assertions
console.assert(value > 0, "value must be positive", { value }); // only logs if false

// Tracing
console.trace("Hit this point");      // prints stack trace

// Clear
console.clear();                      // clear console output
```

---

## 🛑 Breakpoints

### In Code

```js
// The debugger statement — pauses execution when DevTools is open
function processOrder(order) {
  debugger;             // <-- pause here
  return validate(order);
}

// Conditional breakpoint (in DevTools: right-click line → Add conditional BP)
// Equivalent in code:
if (order.id === 42) debugger;
```

### In DevTools

```
F12 → Sources tab

Types of breakpoints:
- Line-of-code: click line number
- Conditional: right-click line → Add conditional breakpoint
- DOM: Elements tab → right-click attr → Break on attribute modification
- Event listener: Sources → Event Listener Breakpoints → expand category
- XHR/Fetch: Sources → XHR/Fetch Breakpoints → add URL pattern
- Exception: Sources → gear icon → Pause on caught/uncaught exceptions

Controls while paused:
F8   / ▶  — Resume
F10  / ⤵  — Step over (skip function body)
F11  / ⬇  — Step into
⇧F11 / ⬆  — Step out
```

---

## 📦 Inspecting Variables

While paused at a breakpoint in DevTools, you can hover over variables to see their values, run arbitrary expressions in the Console tab (you're in the current scope), add Watch expressions for values you want to track across steps, and even modify variables to test different scenarios.

```js
// While paused at a breakpoint in DevTools:
// - Hover over a variable to see its value
// - Console tab: execute expressions in current scope

// Scope panel: shows local, closure, and global variables

// Watch panel: monitor specific expressions
// Add: user.address.city  — updates as you step

// Call stack panel: see the full chain of function calls

// Evaluate in console while paused:
user.name           // read variable
user.role = "admin" // even write to variables!
processOrder(order) // call functions
```

---

## 🗺️ Source Maps

Source maps link minified/compiled code back to original source.

```js
// vite.config.js
export default {
  build: { sourcemap: true }   // "inline", true, or "hidden"
};

// webpack.config.js
module.exports = {
  devtool: "source-map",          // production
  // devtool: "eval-source-map",  // development (faster rebuild)
};

// TypeScript — always enable in tsconfig.json
{ "compilerOptions": { "sourceMap": true } }

// With source maps enabled, DevTools shows your original .ts/.jsx files
// Breakpoints set in original files work correctly
```

---

## ⚡ Performance Profiling

Record a session in the DevTools Performance tab, then analyze the flame chart: width represents time spent and red corners indicate tasks over 50ms (jank). Look for forced reflows (purple Layout after yellow Script) and identify specific functions responsible for long tasks.

```
DevTools → Performance tab

1. Click record (⏺)
2. Perform the action you want to profile
3. Stop recording
4. Analyze the flame chart:
   - Width = time spent
   - Height = call depth
   - Red corner = long task (>50ms = jank)

Key sections:
- Main thread   — JS execution + layout + paint
- Network       — fetch requests
- Timings       — User Timing marks

Identify:
- Long tasks: look for red "Long Task" label
- Forced reflows: look for purple "Layout" after yellow "Script"
- Recurrent animations: check for style/layout/paint churn
```

```js
// User Timing API for precise marks in the flame chart
performance.mark("start-process");
processData(data);
performance.mark("end-process");
performance.measure("process-data", "start-process", "end-process");
// Shows up as labeled region in Performance flame chart
```

---

## 🧠 Memory Debugging

Use heap snapshot comparison in the DevTools Memory tab to find leaks: take a snapshot before an action, perform it, take another snapshot, then switch to Comparison view and filter for new objects. The Retainers panel reveals the reference chain keeping an object alive.

```
DevTools → Memory tab

Heap Snapshot:
1. Take snapshot BEFORE action
2. Perform action
3. Take snapshot AFTER
4. Select "Comparison" view
5. Filter by "(New)" to see what was created

Allocation Timeline:
- Records all heap allocations over time
- Peaks that don't drop = potential leak

Allocation Sampling:
- Low-overhead profiling
- Shows where allocations are happening

Detached DOM Trees:
- Heap Snapshot → filter by "Detached"
- Shows DOM nodes that are removed but still referenced
```

---

## 🌐 Network Debugging

The DevTools Network tab shows every request with its headers, payload, response, and detailed timing breakdown. You can throttle the connection to simulate slow mobile networks, block specific URLs to test fallback behavior, and replay XHR requests directly from the panel.

```
DevTools → Network tab

- Filter by type: XHR, Fetch, JS, CSS, Img
- Preview: rendered response body
- Headers: request/response headers
- Timing: breakdown of each request phase

Throttle network speed:
- "No throttling" → "Fast 3G" / "Slow 3G" / "Offline"

Block a specific URL:
- Right-click a request → Block request URL

Replay a request:
- Right-click → Replay XHR

Copy as cURL:
- Right-click → Copy → Copy as cURL
  → Paste in terminal to reproduce exact request
```

---

## 🔌 Common Debugging Patterns

Isolate bugs by logging input and output around the suspect code, then binary-search by commenting out half the code until the problem disappears. Use `Object.defineProperty` with a setter trap to attach a `console.trace` to any property assignment and catch unexpected mutations.

```js
// 1. Log before and after to isolate the bug
console.log("Before:", JSON.stringify(data));
processData(data);
console.log("After:", JSON.stringify(data));

// 2. Use step-into to find exactly where it breaks
// 3. Simplify the repro — remove unrelated code

// 4. Binary search: comment out half the code, narrow down where bug is

// 5. Check the obvious first:
//    - Correct variable name?
//    - Right file saved?
//    - Cache stale? (hard-refresh with Ctrl+Shift+R)
//    - Correct async/await?

// 6. Object.keys to inspect weird objects
console.log(Object.keys(obj), Object.values(obj));

// 7. Track mutation with a setter trap
function makeObservable(obj, key) {
  let _value = obj[key];
  Object.defineProperty(obj, key, {
    get() { return _value; },
    set(v) {
      console.trace(`${key} changed from ${_value} to ${v}`);
      _value = v;
    },
  });
}
makeObservable(state, "count");  // now any change to state.count shows a stack trace
```

---

## 🧩 Node.js Debugging

Start Node with `--inspect` to expose a WebSocket debugger that Chrome DevTools can connect to via `chrome://inspect`. Add `--inspect-brk` to pause before the first line of code. In VS Code, configure a `launch.json` with `"type": "node"` for full integrated debugging with breakpoints and variable inspection.

```bash
# Start with inspector
node --inspect server.js
node --inspect-brk server.js      # break before first line

# Connect Chrome DevTools
# Open chrome://inspect → click "inspect" under your Node process
# Full DevTools interface for Node process!

# VS Code debugger (launch.json)
{
  "type": "node",
  "request": "launch",
  "program": "${workspaceFolder}/src/index.js",
  "runtimeArgs": ["--nolazy"],
  "env": { "NODE_ENV": "development" }
}
```

---

## 🔑 Key Takeaways

- `console.table()` is underrated — great for arrays of objects.
- `debugger` statement pauses execution when DevTools is open — then step through with F10/F11.
- Set **conditional breakpoints** to break only when a specific condition is true.
- **Source maps** let you debug original source even from bundled/minified code.
- Use the **Performance tab** flame chart to find slow functions and long tasks.
- Use the **Memory tab** heap snapshot comparison to find memory leaks.
- The **Network tab** lets you inspect, replay, throttle, and block requests.
- For tricky mutation bugs, use `Object.defineProperty` with a setter + `console.trace`.
- Node.js: `--inspect` flag + `chrome://inspect` for full DevTools debugging.

---

[← Previous: Best Practices & Clean Code](45-best-practices.md) | [Contents](README.md)
