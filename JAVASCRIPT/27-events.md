# 22: Events & Event Delegation

## 🎯 Adding Event Listeners

```js
const btn = document.querySelector("#myBtn");

// addEventListener — preferred ✅
btn.addEventListener("click", (event) => {
  console.log("Clicked!", event);
});

// Multiple listeners on the same element/event
btn.addEventListener("click", handlerA);
btn.addEventListener("click", handlerB); // both will fire!

// Remove a listener (must reference same function)
function handler() { console.log("click"); }
btn.addEventListener("click", handler);
btn.removeEventListener("click", handler); // ✅ removed

// One-time listener
btn.addEventListener("click", handler, { once: true });

// Old way (avoid — only one handler allowed)
btn.onclick = () => console.log("click");  // overwrites previous
```

---

## 📦 The Event Object

```js
document.addEventListener("click", (event) => {
  // Mouse position
  event.clientX;  // X relative to viewport
  event.clientY;  // Y relative to viewport
  event.pageX;    // X relative to document
  event.pageY;    // Y relative to document

  // Target
  event.target;           // element that triggered the event
  event.currentTarget;    // element the listener is attached to

  // Type
  event.type;             // "click"

  // Prevent default behaviour
  event.preventDefault(); // stop link navigation, form submit, etc.

  // Stop propagation
  event.stopPropagation();         // stop bubble/capture
  event.stopImmediatePropagation(); // stop + prevent other listeners on same element

  // Timing
  event.timeStamp;        // when the event occurred
});
```

---

## 🫧 Event Propagation

Events propagate in 3 phases:
1. **Capture phase** — top (window) down to target
2. **Target phase** — at the element itself  
3. **Bubble phase** — back up to the top

```html
<div id="outer">
  <div id="inner">
    <button id="btn">Click</button>
  </div>
</div>
```

```js
// Default: bubble phase (false or omitted = bubble)
document.querySelector("#outer").addEventListener("click", () => console.log("outer bubble"));
document.querySelector("#inner").addEventListener("click", () => console.log("inner bubble"));
document.querySelector("#btn").addEventListener("click", () => console.log("button"));

// Clicking button logs: button → inner bubble → outer bubble

// Capture phase (third param = true)
document.querySelector("#outer").addEventListener("click", () => console.log("outer capture"), true);
// outer capture → button → inner bubble → outer bubble

// Stop bubbling
document.querySelector("#btn").addEventListener("click", e => {
  e.stopPropagation(); // outer bubble never fires
  console.log("button");
});
```

---

## 🔗 Event Delegation

Instead of adding listeners to each element, add ONE listener to a parent and use `event.target` to detect which child was clicked.

```js
// ❌ Bad — individual listeners on each item
document.querySelectorAll(".card").forEach(card => {
  card.addEventListener("click", handleCardClick);
});
// Problem: new cards won't have listeners!

// ✅ Good — one listener on parent (works for dynamically added items too!)
document.querySelector(".cards-container").addEventListener("click", (e) => {
  const card = e.target.closest(".card");  // navigate up to .card
  if (!card) return;                       // clicked outside any card

  const id = card.dataset.id;
  handleCardClick(id);
});
```

### Full Delegation Pattern
```js
// Table row click → identify which action was clicked
document.querySelector("#user-table").addEventListener("click", (e) => {
  const row = e.target.closest("tr[data-user-id]");
  if (!row) return;

  const userId = row.dataset.userId;

  if (e.target.matches(".btn-edit"))   editUser(userId);
  if (e.target.matches(".btn-delete")) deleteUser(userId);
  if (e.target.matches(".btn-view"))   viewUser(userId);
});
```

---

## 🖱️ Common Event Types

### Mouse Events
```js
element.addEventListener("click", handler);       // single click
element.addEventListener("dblclick", handler);    // double click
element.addEventListener("mousedown", handler);   // button pressed
element.addEventListener("mouseup", handler);     // button released
element.addEventListener("mousemove", handler);   // mouse moves over
element.addEventListener("mouseenter", handler);  // enters element (no bubble)
element.addEventListener("mouseleave", handler);  // leaves element (no bubble)
element.addEventListener("mouseover", handler);   // enters element or child
element.addEventListener("mouseout", handler);    // leaves element or child
element.addEventListener("contextmenu", handler); // right click
element.addEventListener("wheel", handler);       // scroll wheel
```

### Keyboard Events
```js
document.addEventListener("keydown", (e) => {
  e.key;        // "a", "Enter", "ArrowUp", "Escape"...
  e.code;       // "KeyA", "Enter", "ArrowUp" — physical key
  e.ctrlKey;    // boolean — Ctrl held
  e.shiftKey;   // boolean
  e.altKey;     // boolean
  e.metaKey;    // boolean — Cmd (Mac) / Win key

  if (e.key === "Enter") submitForm();
  if (e.ctrlKey && e.key === "s") saveDocument();
  if (e.key === "Escape") closeModal();
});

document.addEventListener("keyup", handler);
document.addEventListener("keypress", handler); // deprecated — use keydown
```

### Form Events
```js
const form  = document.querySelector("form");
const input = document.querySelector("input");

form.addEventListener("submit", (e) => {
  e.preventDefault();  // prevent page reload
  const data = new FormData(form);
  submitData(Object.fromEntries(data));
});

input.addEventListener("input", (e) => {   // fires on every keystroke
  console.log(e.target.value);
});

input.addEventListener("change", (e) => {  // fires on blur/commit
  validate(e.target.value);
});

input.addEventListener("focus", () => showHint());
input.addEventListener("blur",  () => validate());
```

### Window & Document Events
```js
window.addEventListener("load", () => {         // everything loaded
  console.log("All resources loaded");
});

document.addEventListener("DOMContentLoaded", () => { // HTML parsed
  console.log("DOM ready (scripts/styles may not be)");
});

window.addEventListener("resize", () => {
  adjustLayout(window.innerWidth, window.innerHeight);
});

window.addEventListener("scroll", () => {
  const scrollY = window.scrollY;
  updateScrollProgress(scrollY);
});

window.addEventListener("beforeunload", (e) => {
  if (hasUnsavedChanges) {
    e.preventDefault();
    e.returnValue = ""; // shows browser's leave confirmation
  }
});
```

### Touch Events
```js
element.addEventListener("touchstart",  (e) => { e.touches[0]; });
element.addEventListener("touchmove",   (e) => { e.preventDefault(); });
element.addEventListener("touchend",    (e) => { e.changedTouches[0]; });
element.addEventListener("touchcancel", handler);
```

### Pointer Events (unified mouse + touch)
```js
element.addEventListener("pointerdown", handler);
element.addEventListener("pointermove", handler);
element.addEventListener("pointerup",   handler);
element.addEventListener("pointerenter", handler);
element.addEventListener("pointerleave", handler);
```

---

## 🎯 Custom Events

```js
// Create and dispatch
const event = new CustomEvent("user:login", {
  detail: { user: { id: 1, name: "Alice" }, timestamp: Date.now() },
  bubbles: true,    // allow event to bubble up
  cancelable: true, // allow preventDefault
});

document.dispatchEvent(event);

// Listen for custom events
document.addEventListener("user:login", (e) => {
  console.log("User logged in:", e.detail.user.name);
});

// Component communication via custom events
class ShoppingCart extends HTMLElement {
  addItem(item) {
    this.items.push(item);
    this.dispatchEvent(new CustomEvent("cart:updated", {
      detail: { items: this.items, total: this.calculateTotal() },
      bubbles: true,
    }));
  }
}
```

---

## ⚡ Debounce & Throttle

```js
// Debounce — wait until activity stops (search input, resize)
function debounce(fn, delay) {
  let timeoutId;
  return function(...args) {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => fn.apply(this, args), delay);
  };
}

const searchInput = document.querySelector("#search");
searchInput.addEventListener("input", debounce((e) => {
  fetchSearchResults(e.target.value);
}, 300)); // waits 300ms after last keystroke

// Throttle — execute at most once per interval (scroll, mousemove)
function throttle(fn, limit) {
  let lastRun = 0;
  return function(...args) {
    const now = Date.now();
    if (now - lastRun >= limit) {
      lastRun = now;
      return fn.apply(this, args);
    }
  };
}

window.addEventListener("scroll", throttle(() => {
  updateScrollIndicator();
}, 100)); // run at most every 100ms
```

---

## 🔑 Key Takeaways

- `addEventListener` is preferred — allows multiple listeners and easy removal.
- Events bubble up the DOM by default — use this to your advantage.
- **Event delegation**: one listener on a parent ≫ many listeners on children.
- `event.target` = element that triggered; `event.currentTarget` = element with listener.
- `event.preventDefault()` stops browser default behaviour.
- `event.stopPropagation()` stops bubbling/capturing.
- Use **debounce** for "when user stops" (input, resize); **throttle** for "rate-limit" (scroll, mousemove).
- `closest(selector)` is essential for event delegation — it navigates up to the matching ancestor.

---

[← Previous: DOM Manipulation](26-dom-manipulation.md) | [Contents](README.md) | [Next: Web APIs →](28-web-apis.md)
