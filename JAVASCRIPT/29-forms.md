# 24: Forms & Validation

## 📝 Accessing Form Data

```js
const form = document.querySelector("#user-form");

// FormData — best way to collect all fields
form.addEventListener("submit", (e) => {
  e.preventDefault();  // prevent page reload

  const formData = new FormData(form);

  // Read values
  formData.get("email");           // string value
  formData.getAll("interests");    // array (for multi-select/checkboxes)
  formData.has("newsletter");      // boolean

  // Convert to plain object
  const data = Object.fromEntries(formData);

  // Or JSON body
  await fetch("/api/users", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
});

// Direct element access
const email = form.elements["email"].value;
const age   = Number(form.elements["age"].value);
```

---

## 🔍 Input Types & Values

```js
// Text inputs
input.value;           // current value (string)
input.defaultValue;    // original HTML value
input.placeholder;
input.maxLength;

// Checkboxes & Radios
checkbox.checked;      // boolean
checkbox.defaultChecked;  // original state

// Select (dropdown)
select.value;          // selected option's value
select.selectedIndex;  // index of selected option
select.options;        // HTMLOptionsCollection
// Multiple select
[...select.options].filter(o => o.selected).map(o => o.value);

// File inputs
fileInput.files;       // FileList — NOT accessed via .value
fileInput.files[0];    // first File object
fileInput.files[0].name;
fileInput.files[0].size;
fileInput.files[0].type;  // MIME type

// Range
slider.value;          // string! convert to Number
slider.min; slider.max; slider.step;

// Date
dateInput.value;       // "2024-03-15" (YYYY-MM-DD)
dateInput.valueAsDate; // Date object
dateInput.valueAsNumber; // timestamp
```

---

## ✅ HTML5 Built-in Validation

```html
<form id="signup">
  <input type="email" name="email" required placeholder="Email">
  <input type="password" name="password" required minlength="8">
  <input type="text" name="username" pattern="[a-zA-Z0-9]{3,20}" required>
  <input type="number" name="age" min="18" max="120" step="1">
  <input type="url" name="website">
  <button type="submit">Sign Up</button>
</form>
```

```js
// Access validity state
const input = document.querySelector('[name="email"]');

input.validity.valid;           // true if all constraints pass
input.validity.valueMissing;    // required but empty
input.validity.typeMismatch;    // wrong type (bad email format)
input.validity.patternMismatch; // failed pattern regex
input.validity.tooShort;        // below minlength
input.validity.tooLong;         // above maxlength
input.validity.rangeUnderflow;  // below min
input.validity.rangeOverflow;   // above max
input.validity.stepMismatch;    // not divisible by step

input.validationMessage;        // browser's error message string

// Check programmatically
input.checkValidity();          // returns boolean, fires 'invalid' event
form.checkValidity();           // checks all inputs

// Custom validation message
input.setCustomValidity("Please enter a valid username");
input.setCustomValidity("");    // clear custom message (restore built-in)
```

---

## 🛠️ Custom Validation

```js
class FormValidator {
  #form;
  #rules;
  #errors = new Map();

  constructor(formSelector, rules) {
    this.#form  = document.querySelector(formSelector);
    this.#rules = rules;
    this.#setup();
  }

  #setup() {
    this.#form.addEventListener("submit", (e) => {
      e.preventDefault();
      if (this.validate()) {
        this.#form.dispatchEvent(new CustomEvent("formValid", {
          detail: this.getData(),
          bubbles: true,
        }));
      }
    });

    // Real-time validation
    this.#form.querySelectorAll("input, select, textarea").forEach(field => {
      field.addEventListener("blur", () => this.#validateField(field));
      field.addEventListener("input", () => {
        if (this.#errors.has(field.name)) this.#validateField(field);
      });
    });
  }

  #validateField(field) {
    const rule  = this.#rules[field.name];
    if (!rule) return true;

    let error = null;
    for (const [validator, message] of Object.entries(rule)) {
      if (!validators[validator](field.value, rule[validator])) {
        error = message;
        break;
      }
    }

    this.#errors.set(field.name, error);
    this.#showError(field, error);
    return error === null;
  }

  #showError(field, message) {
    const container = field.closest(".field") ?? field.parentElement;
    let errorEl = container.querySelector(".field-error");

    if (!errorEl) {
      errorEl = document.createElement("span");
      errorEl.className = "field-error";
      container.appendChild(errorEl);
    }

    if (message) {
      errorEl.textContent = message;
      field.setAttribute("aria-invalid", "true");
    } else {
      errorEl.textContent = "";
      field.removeAttribute("aria-invalid");
    }
  }

  validate() {
    let valid = true;
    this.#form.querySelectorAll("input, select, textarea").forEach(field => {
      if (!this.#validateField(field)) valid = false;
    });
    return valid;
  }

  getData() {
    return Object.fromEntries(new FormData(this.#form));
  }
}

const validators = {
  required: (v) => v.trim().length > 0,
  minLength: (v, min) => v.length >= min,
  maxLength: (v, max) => v.length <= max,
  email: (v) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v),
  matches: (v, pattern) => new RegExp(pattern).test(v),
  numeric: (v) => !isNaN(Number(v)),
};

// Usage
new FormValidator("#signup-form", {
  email:    { email: "Invalid email address", required: "Email is required" },
  password: { required: "Password is required", minLength: "Min 8 characters" },
});
```

---

## 📂 File Uploads

```js
const fileInput = document.querySelector('input[type="file"]');

fileInput.addEventListener("change", async (e) => {
  const files = [...e.target.files];  // convert FileList to Array

  for (const file of files) {
    // Validate
    if (file.size > 5 * 1024 * 1024) {  // 5MB limit
      alert(`${file.name} is too large`);
      continue;
    }
    if (!file.type.startsWith("image/")) {
      alert(`${file.name} is not an image`);
      continue;
    }

    // Preview
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = document.createElement("img");
      img.src = e.target.result;  // data URL
      previewContainer.appendChild(img);
    };
    reader.readAsDataURL(file);

    // Upload
    const formData = new FormData();
    formData.append("file", file);

    const response = await fetch("/api/upload", {
      method: "POST",
      body: formData,               // no Content-Type header needed!
    });
    const { url } = await response.json();
    console.log("Uploaded:", url);
  }
});

// Drag and drop upload
const dropZone = document.querySelector(".drop-zone");

dropZone.addEventListener("dragover", (e) => {
  e.preventDefault();
  dropZone.classList.add("dragging");
});

dropZone.addEventListener("dragleave", () => {
  dropZone.classList.remove("dragging");
});

dropZone.addEventListener("drop", async (e) => {
  e.preventDefault();
  dropZone.classList.remove("dragging");
  const files = [...e.dataTransfer.files];
  handleFiles(files);
});
```

---

## 🔒 Security in Forms

```js
// ✅ Always validate on the server — client validation is UX only!

// ✅ Sanitize before displaying user input
function sanitizeHTML(str) {
  const div = document.createElement("div");
  div.textContent = str;
  return div.innerHTML;  // escapes &, <, >, ", '
}

// ✅ CSRF protection — use CSRF tokens
// Include in form
const csrfInput = document.createElement("input");
csrfInput.type  = "hidden";
csrfInput.name  = "csrf_token";
csrfInput.value = getCsrfToken();
form.appendChild(csrfInput);

// ✅ Use HTTPS for all form submissions
// ✅ Use POST (not GET) for sensitive data
// ✅ Set autocomplete="off" for sensitive fields
// ✅ Never log form values that may contain passwords
```

---

## 🔑 Key Takeaways

- Use `e.preventDefault()` to prevent default form submission.
- `FormData` is the cleanest way to collect all form field values.
- HTML5 validation attributes (`required`, `pattern`, `minlength`…) give free validation.
- `input.validity` object gives detailed validation state.
- Always validate on the server — client-side validation is for UX only.
- Use `textContent` not `innerHTML` when displaying user input to prevent XSS.
- `FileReader` for previewing files; `FormData` + `fetch` for uploading.

---

[← Previous: Web APIs](28-web-apis.md) | [Contents](README.md) | [Next: Service Workers & PWA →](30-service-workers.md)
