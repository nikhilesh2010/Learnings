# 38: Security

## 🔥 XSS — Cross-Site Scripting

XSS occurs when attacker-controlled HTML/JS is injected into your page.

```js
// ❌ NEVER do this — directly inserts HTML
element.innerHTML = userInput;
document.write(userInput);

// ❌ Dangerous — executes strings as code
eval(userInput);
setTimeout(userInput, 100);   // string form of setTimeout
new Function(userInput)();

// ✅ Safe alternatives
element.textContent = userInput;   // text only — never parsed as HTML
element.innerText   = userInput;

// ✅ If you must insert HTML, sanitize first
import DOMPurify from "dompurify";
element.innerHTML = DOMPurify.sanitize(userInput);
// DOMPurify strips dangerous elements and attributes

// ✅ Build DOM with createElement — never interpret as HTML
function createUserCard(name, bio) {
  const card = document.createElement("div");
  const h2   = document.createElement("h2");
  const p    = document.createElement("p");
  h2.textContent = name;  // safe
  p.textContent  = bio;   // safe
  card.appendChild(h2);
  card.appendChild(p);
  return card;
}

// ✅ Template literals to HTML — always escape!
function escapeHtml(str) {
  return String(str)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#x27;");
}
const safeHtml = `<p>${escapeHtml(userInput)}</p>`;
```

---

## 🛡️ Content Security Policy (CSP)

CSP is an HTTP header that restricts what resources the browser loads:

```
# HTTP header
Content-Security-Policy: default-src 'self'; script-src 'self' 'nonce-abc123'; img-src *; style-src 'self' 'unsafe-inline'

# Meta tag (less powerful — can't block some violations)
<meta http-equiv="Content-Security-Policy" content="default-src 'self'">
```

```js
// Use nonces for inline scripts (better than 'unsafe-inline')
// Server generates: const nonce = crypto.randomUUID()
// HTML: <script nonce="abc123">...</script>
// CSP:  script-src 'nonce-abc123'

// Violations can be reported
Content-Security-Policy: ...; report-uri /csp-report

// Check & fix CSP issues in DevTools → Console (shows violations)
```

---

## 🔐 CSRF — Cross-Site Request Forgery

Tricking a user's browser into making unwanted authenticated requests.

```js
// ✅ CSRF Tokens — include a secret token in every mutating request
// Server generates a per-session token:
const csrfToken = generateSecureToken();
sessionStorage.setItem("csrf_token", csrfToken);

// Include in requests:
await fetch("/api/transfer", {
  method: "POST",
  headers: {
    "Content-Type":  "application/json",
    "X-CSRF-Token":  sessionStorage.getItem("csrf_token"),  // custom header
  },
  body: JSON.stringify({ amount: 100 }),
});
// Server validates the token

// ✅ SameSite Cookie attribute prevents cross-site cookie sending
// Set by server: Set-Cookie: session=abc; SameSite=Strict; Secure; HttpOnly

// ✅ Use Authorization header (Bearer token) instead of cookies for API auth
// — Bearer tokens can't be sent cross-origin by form/img tags
```

---

## 🔒 Secure Data Handling

Never store authentication tokens or sensitive data in `localStorage` — it's accessible to any JavaScript on the page and is the first target of XSS attacks. Use `HttpOnly` cookies for auth tokens (they can't be read by JS), and rely on the Web Crypto API for any cryptographic operations.

```js
// ✅ NEVER store sensitive data in localStorage / sessionStorage
// LocalStorage is accessible by ALL JS on the page — XSS drains it instantly
localStorage.setItem("jwt_token", token);  // ❌ vulnerable to XSS theft
localStorage.setItem("password", pwd);     // ❌ never!

// ✅ Use HttpOnly cookies for auth tokens (can't be read by JS)
// Server sets: Set-Cookie: token=abc; HttpOnly; Secure; SameSite=Strict

// ✅ Don't log sensitive data
console.log("User credentials:", user);    // ❌ visible in DevTools
console.log("Payment data:", cardNumber);  // ❌

// ✅ Clear sensitive data when done
function processPayment(cardData) {
  try {
    return charge(cardData);
  } finally {
    cardData = null;  // help GC — but JS can't truly zero memory
  }
}

// ✅ Use Web Crypto API for crypto operations (never roll your own)
const key = await crypto.subtle.generateKey(
  { name: "AES-GCM", length: 256 },
  true,
  ["encrypt", "decrypt"]
);

// ✅ Hash passwords only on server (never client-side)
// Client sends password over HTTPS; server hashes with bcrypt/Argon2
```

---

## 🚫 Injection Prevention

Never build SQL queries, shell commands, or code strings from user input. Use parameterized queries on the server, avoid `eval` and `new Function`, and validate all external input at your application's entry points with strict type and format checks.

```js
// SQL (usually server-side, but relevant for context)
// ❌ String concatenation
db.query(`SELECT * FROM users WHERE name = '${userInput}'`);

// ✅ Parameterized queries
db.query("SELECT * FROM users WHERE name = ?", [userInput]);

// Command injection (Node.js)
const { execFile } = require("child_process");  // avoid exec()

// ❌ eval and friends
eval(userCode);
new Function(userCode)();
setTimeout("evil code", 0);

// ✅ For sandboxed code execution, use Web Workers with no access to DOM
const worker = new Worker("sandbox.js");

// ✅ Validate / sanitize all external input
function validateEmail(email) {
  if (typeof email !== "string") throw new ValidationError("Invalid input");
  if (email.length > 254) throw new ValidationError("Email too long");
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email)) {
    throw new ValidationError("Invalid email format");
  }
  return email.toLowerCase().trim();
}
```

---

## 🌐 HTTPS & Secure Communication

Always serve your application and API over HTTPS. Redirect HTTP to HTTPS at the application level as a safety net, and never disable TLS certificate validation in Node.js — setting `NODE_TLS_REJECT_UNAUTHORIZED=0` in production is a serious security vulnerability.

```js
// ✅ Always use HTTPS — never HTTP for anything sensitive
// ✅ Check https:// before making API calls
if (location.protocol !== "https:" && location.hostname !== "localhost") {
  location.replace("https:" + location.href.substring(location.protocol.length));
}

// ✅ Validate SSL in Node.js (don't disable it!)
// ❌ This disables certificate validation — DO NOT USE in production:
process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";  // NEVER in prod

// ✅ Check URL is safe before fetch (avoid SSRF in backend)
function isAllowedUrl(url) {
  const parsed = new URL(url);
  const allowed = ["api.example.com", "cdn.example.com"];
  return allowed.includes(parsed.hostname);
}
```

---

## 🪟 postMessage Security

Always validate `event.origin` before trusting a message received via `postMessage` — any window or iframe can send messages, including malicious ones. When sending, specify the exact target origin rather than `"*"` to prevent data leaking to unexpected recipients.

```js
// ❌ Don't accept messages from any origin
window.addEventListener("message", (event) => {
  processData(event.data);  // DANGEROUS — could be from malicious site
});

// ✅ Always check the origin
window.addEventListener("message", (event) => {
  if (event.origin !== "https://trusted.example.com") return;
  processData(event.data);
});

// ✅ Specify target origin when sending
iframe.contentWindow.postMessage(data, "https://trusted.example.com");
// NOT: iframe.contentWindow.postMessage(data, "*");  // ❌
```

---

## 🔍 Security Headers (Reference)

These HTTP response headers form your application's security baseline. Set them on your server or reverse proxy. `Content-Security-Policy` and `Strict-Transport-Security` are the most impactful — the others prevent MIME sniffing, clickjacking, and referrer leakage.

```
Content-Security-Policy      — restrict resource sources
Strict-Transport-Security    — force HTTPS (HSTS)
X-Content-Type-Options: nosniff  — prevent MIME sniffing
X-Frame-Options: DENY        — prevent clickjacking
Referrer-Policy: no-referrer — don't leak URL in referrer
Permissions-Policy           — restrict browser APIs
```

---

## 🔑 Key Takeaways

- **XSS**: Never use `innerHTML`/`eval` with user input. Use `textContent` or DOMPurify.
- **CSP**: Limit where scripts, styles, and media can load from.
- **CSRF**: Use CSRF tokens or SameSite=Strict cookies; validate on server.
- **Sensitive data**: Never store tokens or passwords in localStorage. Use HttpOnly cookies.
- **Always validate** all external input (type, length, format) before use.
- **Parameterized queries** prevent SQL injection on the backend.
- **postMessage**: always verify `event.origin` before trusting the message.
- Use **HTTPS** always; never disable TLS validation.
- Use the **Web Crypto API** for any cryptographic operations.

---

[← Previous: Tooling (Vite, Webpack, Babel, ESLint)](43-tooling.md) | [Contents](README.md) | [Next: Best Practices & Clean Code →](45-best-practices.md)
