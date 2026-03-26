# 20: Fetch API & HTTP

## 🌐 The Fetch API

`fetch()` is the modern, Promise-based API for making HTTP requests. It replaces `XMLHttpRequest`.

```js
// Basic GET request
const response = await fetch("https://api.example.com/users");
const data     = await response.json();

// Full example with error handling
async function getUsers() {
  const response = await fetch("https://jsonplaceholder.typicode.com/users");

  if (!response.ok) {
    throw new Error(`HTTP error! Status: ${response.status}`);
  }

  return response.json();
}
```

---

## 📨 Request Options

Control how a request is made by passing an options object as the second argument to `fetch`. This is where you set the HTTP method, request headers, and body payload.

```js
// POST — send JSON
const response = await fetch("/api/users", {
  method: "POST",
  headers: {
    "Content-Type": "application/json",
    "Authorization": "Bearer " + token,
  },
  body: JSON.stringify({ name: "Alice", email: "a@b.com" }),
});

// PUT — update
await fetch(`/api/users/${id}`, {
  method: "PUT",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify(updatedData),
});

// PATCH — partial update
await fetch(`/api/users/${id}`, {
  method: "PATCH",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({ email: "new@email.com" }),
});

// DELETE
await fetch(`/api/users/${id}`, { method: "DELETE" });
```

---

## 📥 Reading Response Body

A `Response` object's body can only be read once. Choose the right reader method based on the expected content type — `.json()` for JSON APIs, `.text()` for plain text, and `.blob()` for binary data like images.

```js
const response = await fetch(url);

// Choose ONE reader method (body can only be read once!)
await response.json();       // Parse as JSON
await response.text();       // Parse as string
await response.blob();       // Parse as Blob (images, files)
await response.arrayBuffer();// Parse as binary ArrayBuffer
await response.formData();   // Parse as FormData

// Response metadata
response.status;       // 200, 404, 500...
response.statusText;   // "OK", "Not Found"...
response.ok;           // true if status 200-299
response.headers;      // Headers object
response.url;          // final URL (after redirects)
response.redirected;   // boolean

// Read headers
response.headers.get("Content-Type");  // "application/json"
response.headers.get("X-Rate-Limit");
```

---

## 🔒 Headers

Use the `Headers` class or a plain object to set request headers. Common use cases include specifying `Content-Type`, passing authentication tokens, and reading server-returned headers.

```js
// Custom Headers object
const headers = new Headers({
  "Content-Type": "application/json",
  "X-API-Key": apiKey,
});

// Or as plain object
const headers = {
  "Content-Type": "application/json",
  "Accept": "application/json",
  "Authorization": `Bearer ${token}`,
};

// Reading response headers
for (const [key, value] of response.headers.entries()) {
  console.log(`${key}: ${value}`);
}
```

---

## ❌ Error Handling

`fetch` only rejects its Promise on network-level failures (no connection, DNS error). HTTP error status codes like 404 or 500 resolve normally — you must check `response.ok` yourself and throw appropriately.

```js
// ⚠️ fetch() only rejects on NETWORK errors (no internet, DNS failure)
// It does NOT reject on HTTP errors (404, 500)!

async function apiFetch(url, options = {}) {
  let response;

  try {
    response = await fetch(url, options);
  } catch (networkError) {
    throw new Error(`Network error: ${networkError.message}`);
  }

  if (!response.ok) {
    // Try to get error details from response body
    let errorBody;
    try { errorBody = await response.json(); }
    catch { errorBody = await response.text(); }

    const error = new Error(`HTTP ${response.status}: ${response.statusText}`);
    error.status   = response.status;
    error.response = response;
    error.body     = errorBody;
    throw error;
  }

  return response;
}

// Usage
try {
  const res  = await apiFetch("/api/users");
  const data = await res.json();
} catch (err) {
  if (err.status === 404) showNotFound();
  else if (err.status === 401) redirectToLogin();
  else showGenericError(err.message);
}
```

---

## ⏰ Timeouts & Cancellation

`fetch` has no native timeout option. Use `AbortController` to cancel a request programmatically and `setTimeout` to abort after a deadline. Always clear the timeout after a successful response to avoid stale aborts.

```js
// Fetch doesn't have a built-in timeout — use AbortController
async function fetchWithTimeout(url, timeoutMs = 5000) {
  const controller = new AbortController();
  const timeoutId  = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const response = await fetch(url, { signal: controller.signal });
    clearTimeout(timeoutId);
    return response;
  } catch (err) {
    clearTimeout(timeoutId);
    if (err.name === "AbortError") throw new Error(`Request timed out after ${timeoutMs}ms`);
    throw err;
  }
}

// Cancel a fetch programmatically
const controller = new AbortController();

fetch("/api/large-file", { signal: controller.signal })
  .then(r => r.json())
  .then(data => render(data))
  .catch(err => {
    if (err.name === "AbortError") console.log("Cancelled");
    else throw err;
  });

// Later, cancel it:
cancelButton.onclick = () => controller.abort();
```

---

## 📤 Sending Different Body Types

Choose the right body format based on what the server expects. Use `JSON.stringify` for JSON APIs, `FormData` for file uploads (the browser sets the `Content-Type` automatically), and `URLSearchParams` for HTML form-style submissions.

```js
// JSON body
await fetch("/api/data", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({ key: "value" }),
});

// Form data (multipart — for file uploads)
const formData = new FormData();
formData.append("name", "Alice");
formData.append("avatar", fileInput.files[0]);

await fetch("/api/upload", {
  method: "POST",
  body: formData,  // NO Content-Type header — browser sets it automatically
});

// URL-encoded form
const params = new URLSearchParams({ name: "Alice", age: 30 });
await fetch("/api/form", {
  method: "POST",
  headers: { "Content-Type": "application/x-www-form-urlencoded" },
  body: params.toString(),
});

// Binary data
await fetch("/api/binary", {
  method: "POST",
  headers: { "Content-Type": "application/octet-stream" },
  body: new Uint8Array([1, 2, 3, 4]),
});
```

---

## 🍪 Cookies & Credentials

By default, `fetch` does not include cookies in cross-origin requests. Use the `credentials` option to control whether cookies and HTTP auth are sent, which is required for session-based authentication across origins.

```js
// Include cookies in cross-origin requests
await fetch("https://api.example.com/user", {
  credentials: "include",  // send cookies across origins
});

// Include cookies for same-origin only (default)
await fetch("/api/user", {
  credentials: "same-origin",
});

// Never send credentials
await fetch("/api/public", {
  credentials: "omit",
});
```

---

## 🔄 Request Object

The `Request` class lets you create reusable, portable request descriptors. You can build a `Request` once with all its options and pass it to `fetch`, which is useful when caching or intercepting requests.

```js
// Create reusable Request objects
const req = new Request("/api/users", {
  method: "GET",
  headers: { "Authorization": `Bearer ${token}` },
  cache: "no-cache",
});

const response = await fetch(req);
```

---

## 🏗️ API Client Wrapper

For real applications, wrap `fetch` in a class that centralizes your base URL, default headers, error handling, and authentication. This prevents repetitive boilerplate and gives you one place to add logging, retries, or interceptors.

```js
class ApiClient {
  #baseUrl;
  #defaultHeaders;

  constructor(baseUrl, options = {}) {
    this.#baseUrl        = baseUrl.replace(/\/$/, "");
    this.#defaultHeaders = {
      "Content-Type": "application/json",
      "Accept": "application/json",
      ...options.headers,
    };
  }

  async #request(method, path, { body, headers = {}, signal, params } = {}) {
    const url = params
      ? `${this.#baseUrl}${path}?${new URLSearchParams(params)}`
      : `${this.#baseUrl}${path}`;

    const response = await fetch(url, {
      method,
      headers: { ...this.#defaultHeaders, ...headers },
      body: body ? JSON.stringify(body) : undefined,
      signal,
    });

    if (!response.ok) {
      const err = new Error(`HTTP ${response.status}`);
      err.status   = response.status;
      err.response = response;
      throw err;
    }

    return response.status === 204 ? null : response.json();
  }

  get(path, options)         { return this.#request("GET",    path, options); }
  post(path, body, options)  { return this.#request("POST",   path, { ...options, body }); }
  put(path, body, options)   { return this.#request("PUT",    path, { ...options, body }); }
  patch(path, body, options) { return this.#request("PATCH",  path, { ...options, body }); }
  delete(path, options)      { return this.#request("DELETE", path, options); }

  withAuth(token) {
    return new ApiClient(this.#baseUrl, {
      headers: { ...this.#defaultHeaders, "Authorization": `Bearer ${token}` },
    });
  }
}

// Usage
const api = new ApiClient("https://api.example.com");
const users = await api.get("/users", { params: { page: 1, limit: 20 } });
const newUser = await api.post("/users", { name: "Alice", email: "a@b.com" });
```

---

## 🔑 Key Takeaways

- `fetch()` is Promise-based and replaces `XMLHttpRequest`.
- `fetch()` only rejects on **network errors** — always check `response.ok` for HTTP errors.
- Response body can only be read **once** — choose the right reader method (`.json()`, `.text()`, `.blob()`).
- Use `AbortController` for timeouts and cancellation.
- `FormData` for file uploads; set no `Content-Type` header manually — browser handles it.
- `credentials: "include"` to send cookies cross-origin (requires CORS config on server).

---

[← Previous: Async / Await](23-async-await.md) | [Contents](README.md) | [Next: WebSockets →](25-websockets.md)
