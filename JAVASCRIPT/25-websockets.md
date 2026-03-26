# 44: WebSockets

WebSocket provides a **full-duplex, persistent communication channel** over a single TCP connection — unlike HTTP's request/response model, both client and server can send messages at any time.

---

## 🔌 Creating a Connection

Instantiate a `WebSocket` by passing a `wss://` URL (always use the secure protocol in production). You can optionally specify subprotocols that the server can accept to negotiate a shared message format.

```js
// Connect — ws:// for HTTP, wss:// for HTTPS (always use wss:// in production)
const ws = new WebSocket("wss://api.example.com/socket");

// With subprotocols (optional — server must confirm one)
const ws2 = new WebSocket("wss://api.example.com/socket", ["json", "xml"]);
```

---

## 📡 Events

WebSocket communication is event-driven. Listen for `open` to know when the connection is ready, `message` to handle incoming data, `close` to detect disconnection, and `error` for connection failures.

```js
const ws = new WebSocket("wss://echo.websocket.events");

// Connection established
ws.addEventListener("open", (event) => {
  console.log("Connected:", ws.url);
  console.log("Protocol:", ws.protocol);   // negotiated subprotocol
  ws.send("Hello Server!");
});

// Message received
ws.addEventListener("message", (event) => {
  // event.data is string for text frames, Blob or ArrayBuffer for binary
  console.log("Received:", event.data);

  if (typeof event.data === "string") {
    const msg = JSON.parse(event.data);
    handleMessage(msg);
  }
});

// Connection closed
ws.addEventListener("close", (event) => {
  console.log("Closed:", event.code, event.reason, event.wasClean);
  // event.wasClean — false if connection dropped unexpectedly
});

// Error
ws.addEventListener("error", (event) => {
  console.error("WebSocket error:", event);
  // Note: browser gives minimal error info for security reasons
  // The close event always fires after an error event
});
```

---

## 📤 Sending Data

Call `ws.send()` to push data to the server — it accepts strings, JSON-serialized objects, `ArrayBuffer`, or `Blob` for binary payloads. Check `bufferedAmount` if you need to avoid overwhelming a slow connection.

```js
// Text
ws.send("Hello!");

// JSON
ws.send(JSON.stringify({ type: "chat", text: "Hello", userId: 42 }));

// Binary — ArrayBuffer
const buffer = new ArrayBuffer(4);
const view = new Uint32Array(buffer);
view[0] = 12345;
ws.send(buffer);

// Binary — Blob
const blob = new Blob(["binary data"], { type: "application/octet-stream" });
ws.send(blob);

// Set how binary data is received
ws.binaryType = "arraybuffer";   // default: "blob"
ws.binaryType = "blob";

// Check buffered unsent data (useful for back-pressure)
ws.bufferedAmount;   // bytes waiting to be sent
```

---

## 🔒 ReadyState

The `readyState` property tells you the current lifecycle state of the connection. Always check that the socket is `OPEN` before calling `send` to avoid errors on a connecting or closed socket.

```js
ws.readyState;
// WebSocket.CONNECTING = 0  — connection not yet established
// WebSocket.OPEN       = 1  — ready to send and receive
// WebSocket.CLOSING    = 2  — close handshake in progress
// WebSocket.CLOSED     = 3  — connection closed or failed

// Safe send helper
function safeSend(ws, data) {
  if (ws.readyState === WebSocket.OPEN) {
    ws.send(typeof data === "string" ? data : JSON.stringify(data));
  }
}
```

---

## 🚪 Closing

Call `ws.close()` to initiate a graceful shutdown. You can pass a numeric close code and a short reason string so the server knows why the client disconnected. Standard codes are defined in RFC 6455; codes 4000–4999 are reserved for application use.

```js
// Close cleanly (optional code and reason string)
ws.close();
ws.close(1000, "Normal closure");
ws.close(1001, "Going away");

// Common close codes (RFC 6455)
// 1000  Normal closure
// 1001  Endpoint going away (page unload)
// 1002  Protocol error
// 1003  Unsupported data
// 1006  Abnormal closure (no close frame — network drop)
// 1008  Policy violation
// 1011  Server error
// 4000-4999  Application-defined codes (safe to use)
```

---

## 🔁 Auto-Reconnect Pattern

WebSocket connections drop due to network issues, idle timeouts, or server restarts. Always implement reconnection.

```js
class ReconnectingWebSocket {
  #url;
  #protocols;
  #ws = null;
  #reconnectDelay = 1000;
  #maxDelay = 30_000;
  #attempt = 0;
  #closed = false;
  #handlers = {};

  constructor(url, protocols = []) {
    this.#url       = url;
    this.#protocols = protocols;
    this.#connect();
  }

  #connect() {
    if (this.#closed) return;
    this.#ws = new WebSocket(this.#url, this.#protocols);
    this.#ws.binaryType = "arraybuffer";

    this.#ws.addEventListener("open",    (e) => { this.#attempt = 0; this.#reconnectDelay = 1000; this.#emit("open", e); });
    this.#ws.addEventListener("message", (e) => this.#emit("message", e));
    this.#ws.addEventListener("error",   (e) => this.#emit("error", e));
    this.#ws.addEventListener("close",   (e) => {
      this.#emit("close", e);
      if (!this.#closed && !e.wasClean) {
        const delay = Math.min(this.#reconnectDelay * 2 ** this.#attempt, this.#maxDelay);
        console.log(`Reconnecting in ${delay}ms (attempt ${++this.#attempt})...`);
        setTimeout(() => this.#connect(), delay);
      }
    });
  }

  #emit(event, data) {
    this.#handlers[event]?.forEach((fn) => fn(data));
  }

  on(event, fn) {
    (this.#handlers[event] ??= []).push(fn);
    return this;
  }

  send(data) {
    if (this.#ws?.readyState === WebSocket.OPEN) {
      this.#ws.send(typeof data === "object" ? JSON.stringify(data) : data);
    }
  }

  close(code = 1000, reason = "") {
    this.#closed = true;
    this.#ws?.close(code, reason);
  }
}

// Usage
const ws = new ReconnectingWebSocket("wss://api.example.com/socket");
ws.on("open",    ()    => ws.send({ type: "auth", token: "..." }))
  .on("message", (e)   => handleMessage(JSON.parse(e.data)))
  .on("close",   (e)   => console.log("Closed:", e.code))
  .on("error",   (e)   => console.error("Error:", e));
```

---

## ❤️ Heartbeat / Ping-Pong

Detect stale connections and keep them alive through proxies/firewalls.

```js
class HeartbeatWebSocket {
  #ws;
  #pingInterval;
  #pongTimeout;

  constructor(url) {
    this.#ws = new WebSocket(url);
    this.#ws.addEventListener("open",    () => this.#startHeartbeat());
    this.#ws.addEventListener("message", (e) => this.#onMessage(e));
    this.#ws.addEventListener("close",   () => this.#stopHeartbeat());
  }

  #startHeartbeat() {
    this.#pingInterval = setInterval(() => {
      if (this.#ws.readyState !== WebSocket.OPEN) return;
      this.#ws.send(JSON.stringify({ type: "ping" }));
      // Expect a pong within 5 seconds
      this.#pongTimeout = setTimeout(() => {
        console.warn("No pong — closing stale connection");
        this.#ws.close(1001, "Heartbeat timeout");
      }, 5000);
    }, 30_000);  // ping every 30 seconds
  }

  #onMessage(event) {
    const msg = JSON.parse(event.data);
    if (msg.type === "pong") {
      clearTimeout(this.#pongTimeout);
      return;
    }
    // handle other messages...
  }

  #stopHeartbeat() {
    clearInterval(this.#pingInterval);
    clearTimeout(this.#pongTimeout);
  }
}
```

---

## 📨 Message Protocol Patterns

For non-trivial apps, define a structured message envelope with a type field and an ID for correlating requests to responses. This lets you implement request-response semantics on top of the WebSocket's push-based model.

```js
// Common JSON message envelope
const msg = {
  id:      crypto.randomUUID(),   // correlate request/response
  type:    "chat.message",        // action/event type
  payload: { text: "Hello!" },
  ts:      Date.now(),
};

// Request-response over WebSocket
const pending = new Map();  // id → { resolve, reject, timeout }

function request(ws, type, payload, timeoutMs = 5000) {
  return new Promise((resolve, reject) => {
    const id = crypto.randomUUID();
    const timeout = setTimeout(() => {
      pending.delete(id);
      reject(new Error(`Request ${type} timed out`));
    }, timeoutMs);
    pending.set(id, { resolve, reject, timeout });
    ws.send(JSON.stringify({ id, type, payload }));
  });
}

ws.addEventListener("message", (event) => {
  const msg = JSON.parse(event.data);
  if (msg.id && pending.has(msg.id)) {
    const { resolve, reject, timeout } = pending.get(msg.id);
    clearTimeout(timeout);
    pending.delete(msg.id);
    msg.error ? reject(new Error(msg.error)) : resolve(msg.payload);
  } else {
    handleEvent(msg);   // unsolicited server push
  }
});

// Usage
const users = await request(ws, "users.list", { page: 1 });
```

---

## 🔐 Authentication

WebSockets don't support custom HTTP headers during the initial handshake. Common patterns include passing a token in the URL query string (less secure), encoding it as a subprotocol, sending it as the first message after `open`, or relying on a session cookie for same-origin connections.

```js
// Option 1: Token in URL query string (visible in server logs — avoid if possible)
const ws = new WebSocket(`wss://api.example.com/socket?token=${token}`);

// Option 2: Subprotocol header (most common)
const ws2 = new WebSocket("wss://api.example.com/socket", [`bearer.${token}`]);

// Option 3: First message after connect (cleanest)
ws.addEventListener("open", () => {
  ws.send(JSON.stringify({ type: "auth", token }));
});

// Option 4: Cookie (automatic for wss:// same-origin if credentials are set)
// Works if the HTTP upgrade request includes the session cookie
```

---

## ⚠️ Security Considerations

Always use `wss://` to encrypt traffic in transit. On the server, validate the `Origin` header to prevent unauthorized sites from establishing connections, authenticate every client before accepting commands, and validate all incoming message payloads before processing them.

```js
// ✅ Always use wss:// (TLS) in production — never ws://
const ws = new WebSocket("wss://api.example.com/socket");

// ✅ Validate the Origin header on the server side
// Browsers send the Origin header in the WebSocket handshake
// Server should reject connections from unexpected origins

// ✅ Authenticate before allowing actions (don't trust connection alone)

// ✅ Validate and sanitize all incoming message payloads
ws.addEventListener("message", (event) => {
  let msg;
  try {
    msg = JSON.parse(event.data);
  } catch {
    console.warn("Invalid JSON received");
    return;
  }
  if (typeof msg.type !== "string") return;  // validate structure
  // process msg...
});

// ✅ Rate-limit messages on the server side
// ✅ Set maximum message size on the server
// ❌ Never trust message data without validation (injection risks)
```

---

## 🌐 WebSocket vs Other Options

| Feature | WebSocket | Server-Sent Events | HTTP Polling |
|---|---|---|---|
| Direction | Full-duplex | Server → Client only | Client → Server only |
| Connection | Persistent | Persistent | New per request |
| Protocol | `ws://` / `wss://` | HTTP | HTTP |
| Binary data | Yes | No (text only) | Yes |
| Auto-reconnect | No (manual) | Yes (built-in) | N/A |
| Best for | Chat, games, live collab | Live feeds, notifications | Simple polling |

```js
// Server-Sent Events alternative (one-way, simpler)
const sse = new EventSource("/api/events");
sse.addEventListener("message", (e) => console.log(e.data));
sse.addEventListener("update",  (e) => render(JSON.parse(e.data)));
sse.addEventListener("error",   ()  => console.error("SSE error"));
sse.close();
```

---

## 🔑 Key Takeaways

- WebSocket provides **full-duplex** persistent communication — both sides can send at any time.
- Always use **`wss://`** (TLS) in production.
- `readyState` must be `OPEN` before calling `send()`.
- Implement **auto-reconnect with exponential backoff** — connections drop.
- Use a **JSON message envelope** with `type` and `id` for structured communication.
- Use **heartbeat/ping-pong** to detect stale connections through NAT and proxies.
- **Authenticate** after connection (first-message pattern) rather than relying on URL tokens.
- For one-way server push, **Server-Sent Events (SSE)** is simpler and auto-reconnects.

---

[← Previous: Fetch API & HTTP](24-fetch-and-http.md) | [Contents](README.md) | [Next: DOM Manipulation →](26-dom-manipulation.md)
