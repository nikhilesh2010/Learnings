# 21: DOM Manipulation

## 🌳 What is the DOM?

The **Document Object Model (DOM)** is a tree structure representing the HTML document. JavaScript can read and modify it dynamically.

```
document
└── html
    ├── head
    │   ├── title
    │   └── meta
    └── body
        ├── header
        │   └── h1 "My App"
        └── main
            ├── p "Hello"
            └── ul
                ├── li "Item 1"
                └── li "Item 2"
```

---

## 🔍 Selecting Elements

Use `querySelector` and `querySelectorAll` to find elements using CSS selector syntax — they work on the whole document or scoped to a specific parent element. Legacy methods like `getElementById` are still valid and slightly faster for ID lookups.

```js
// By CSS selector (returns FIRST match or null)
document.querySelector("h1");
document.querySelector(".card");
document.querySelector("#user-name");
document.querySelector("ul > li.active");

// By CSS selector (returns ALL matches as NodeList)
document.querySelectorAll(".card");
document.querySelectorAll("input[type='text']");

// Convert NodeList to Array for full array methods
const cards = [...document.querySelectorAll(".card")];
const cards2 = Array.from(document.querySelectorAll(".card"));

// Older methods (still useful)
document.getElementById("my-id");          // fastest lookup by id
document.getElementsByClassName("card");   // live HTMLCollection
document.getElementsByTagName("div");      // live HTMLCollection

// Scoped queries — search WITHIN an element
const nav = document.querySelector("nav");
const links = nav.querySelectorAll("a");   // only links inside nav
```

---

## 📄 Reading & Modifying Content

Use `textContent` to safely read or set text (user input is treated as plain text, not HTML). Use `innerHTML` only with fully trusted content — inserting unsanitized user data via `innerHTML` is a major XSS vulnerability.

```js
const el = document.querySelector("h1");

// Text content
el.textContent;          // reads text (strips HTML)
el.textContent = "New title"; // sets text safely (escapes HTML)

// HTML content (use carefully — XSS risk!)
el.innerHTML;            // reads inner HTML string
el.innerHTML = "<b>Bold</b>"; // ⚠️ only use with trusted content!
el.outerHTML;            // reads element + its outer HTML

// Safe HTML insertion (ES2022)
el.setHTML("<b>Safe</b>"); // sanitizes HTML before inserting

// Setting text with user input (ALWAYS use textContent, never innerHTML)
const userInput = getUserInput();
el.textContent = userInput;  // ✅ safe — treated as text, not HTML
// el.innerHTML = userInput; // ❌ XSS vulnerability!
```

---

## 🏷️ Attributes & Properties

HTML attributes and DOM properties are related but not always identical. Use `getAttribute`/`setAttribute` for HTML attributes, the direct property (e.g., `img.src`) for live JS values, and `dataset` for custom `data-*` attributes.

```js
const img = document.querySelector("img");

// Attributes (as in HTML)
img.getAttribute("src");          // "photo.jpg"
img.setAttribute("src", "new.jpg");
img.removeAttribute("alt");
img.hasAttribute("data-id");      // true/false

// Properties (on the JS object — may differ from attributes)
img.src;     // "http://..." absolute URL (unlike getAttribute)
img.alt;     // "description"
img.width;   // number

// Data attributes — access custom data-* attributes
// <div data-user-id="42" data-role="admin">
const el = document.querySelector("[data-user-id]");
el.dataset.userId;  // "42" (camelCase access)
el.dataset.role;    // "admin"
el.dataset.newKey = "value"; // sets data-new-key="value"
```

---

## 🎨 Styles & Classes

Set inline styles via `el.style` for dynamic one-offs, but prefer toggling CSS classes with `classList` — it keeps style logic in CSS and makes state changes more readable and maintainable.

```js
const el = document.querySelector(".card");

// Inline styles
el.style.color           = "red";
el.style.backgroundColor = "#eee";
el.style.display         = "none";
el.style.fontSize        = "16px";

// Read computed styles (includes CSS from stylesheets)
const computed = window.getComputedStyle(el);
computed.color;          // "rgb(255, 0, 0)"
computed.display;        // "block", "none", etc.

// Classes — classList API ✅
el.classList.add("active", "highlighted");
el.classList.remove("active");
el.classList.toggle("open");              // add if absent, remove if present
el.classList.toggle("open", condition);   // force add/remove
el.classList.contains("active");          // true/false
el.classList.replace("old-class", "new-class");
el.className;            // "card highlighted" — full class string
```

---

## 🏗️ Creating & Inserting Elements

Create new elements with `document.createElement`, configure them, then insert them into the document with methods like `append`, `prepend`, `before`, or `after`. Use `DocumentFragment` to batch many insertions into a single DOM operation for better performance.

```js
// Create element
const div = document.createElement("div");
div.className = "card";
div.textContent = "Hello!";

// Create text node
const text = document.createTextNode("plain text");

// Clone element
const clone = el.cloneNode(true);  // true = deep clone with children

// Insertion methods (modern)
parent.append(child);           // append at end (Node or string)
parent.append(child1, child2, "text"); // multiple at once
parent.prepend(child);          // insert at start
el.before(newEl);               // insert BEFORE el
el.after(newEl);                // insert AFTER el
el.replaceWith(newEl);          // replace el with newEl

// Remove
el.remove();                    // remove from DOM

// Old methods (still work)
parent.appendChild(child);
parent.removeChild(child);
parent.insertBefore(newEl, referenceEl);
```

### DocumentFragment — Batch DOM Updates
```js
// Build a large list without repeated reflows
const fragment = document.createDocumentFragment();

for (let i = 0; i < 1000; i++) {
  const li = document.createElement("li");
  li.textContent = `Item ${i}`;
  fragment.appendChild(li);
}

// ONE DOM operation instead of 1000
document.querySelector("ul").appendChild(fragment);
```

---

## 📐 Element Geometry

Different properties measure different things: `offsetWidth`/`offsetHeight` include borders, `clientWidth`/`clientHeight` include padding only, and `getBoundingClientRect()` gives the element's position and size relative to the current viewport.

```js
const el = document.querySelector(".card");

// Size
el.offsetWidth;    // includes border + padding
el.offsetHeight;
el.clientWidth;    // includes padding, excludes border
el.clientHeight;
el.scrollWidth;    // includes overflow content

// Position
el.offsetTop;      // distance from offsetParent top
el.offsetLeft;

// getBoundingClientRect — most useful
const rect = el.getBoundingClientRect();
rect.top;    // distance from viewport top
rect.left;
rect.width;
rect.height;
rect.bottom; // rect.top + rect.height
rect.right;

// Check if element is in viewport
function isInViewport(el) {
  const rect = el.getBoundingClientRect();
  return (
    rect.top >= 0 &&
    rect.bottom <= window.innerHeight &&
    rect.left >= 0 &&
    rect.right <= window.innerWidth
  );
}
```

---

## 🔀 Traversing the DOM

Navigate the element tree using parent, child, and sibling relationships. The `closest()` method is especially useful for event delegation — it walks up the tree to find the nearest ancestor that matches a selector.

```js
const el = document.querySelector("li.active");

// Parent
el.parentElement;           // immediate parent element
el.closest(".container");   // nearest ancestor matching selector

// Children
el.children;                // HTMLCollection of element children
el.childNodes;              // NodeList (includes text/comment nodes)
el.firstElementChild;
el.lastElementChild;

// Siblings
el.nextElementSibling;
el.previousElementSibling;

// Useful patterns
// Find all ancestors
function getAncestors(el) {
  const ancestors = [];
  let current = el.parentElement;
  while (current) {
    ancestors.push(current);
    current = current.parentElement;
  }
  return ancestors;
}
```

---

## 🏎️ IntersectionObserver (Lazy Loading)
`IntersectionObserver` fires a callback whenever a watched element enters or exits the viewport, without needing scroll event listeners. This is the standard way to implement lazy-loaded images, infinite scroll, and visibility-triggered animations.
```js
// Observe when elements enter/leave the viewport
const observer = new IntersectionObserver((entries, observer) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      const img = entry.target;
      img.src = img.dataset.src;  // load image on enter
      observer.unobserve(img);    // stop watching
    }
  });
}, {
  threshold: 0.1,  // trigger when 10% visible
  rootMargin: "100px",  // 100px before entering viewport
});

document.querySelectorAll("img[data-src]").forEach(img => {
  observer.observe(img);
});
```

---

## 🔄 MutationObserver

`MutationObserver` watches for changes to the DOM tree and fires a callback with a list of mutations. Use it to react to dynamically added nodes, attribute changes, or text modifications — a more efficient alternative to polling.

```js
// Watch for DOM changes
const observer = new MutationObserver(mutations => {
  mutations.forEach(mutation => {
    if (mutation.type === "childList") {
      console.log("Children added/removed:", mutation.addedNodes);
    }
    if (mutation.type === "attributes") {
      console.log(`Attribute "${mutation.attributeName}" changed`);
    }
  });
});

observer.observe(document.querySelector("#app"), {
  childList: true,     // watch child additions/removals
  attributes: true,    // watch attribute changes
  subtree: true,       // watch all descendants
  characterData: true, // watch text changes
});

// Stop observing
observer.disconnect();
```

---

## 🔑 Key Takeaways

- Use `querySelector`/`querySelectorAll` for flexible CSS-selector based querying.
- `textContent` for safe text; `innerHTML` only for trusted HTML.
- `classList.add/remove/toggle/contains` — never manipulate `className` manually.
- Use `DocumentFragment` to batch DOM insertions for performance.
- `getBoundingClientRect()` gives viewport-relative position.
- `IntersectionObserver` for lazy loading without scroll event handlers.
- **Never use `innerHTML` with user input** — major XSS vulnerability.

---

[← Previous: WebSockets](25-websockets.md) | [Contents](README.md) | [Next: Events & Event Delegation →](27-events.md)
