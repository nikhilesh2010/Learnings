# 11 – Middleware

## What is Middleware?

Middleware intercepts every request before it reaches a route handler, and every response before it's sent to the client. It runs for **all routes**.

```
Client Request
     │
     ▼
Middleware 1  (e.g., logging)
     │
     ▼
Middleware 2  (e.g., auth check)
     │
     ▼
Route Handler
     │
     ▼
Middleware 2  (post-response)
     │
     ▼
Middleware 1  (post-response)
     │
     ▼
Client Response
```

## Adding Middleware with `@app.middleware`

The `@app.middleware("http")` decorator registers a function as HTTP middleware. The function receives the request and a `call_next` callable, which passes the request to the next layer (route handler or further middleware) and returns the response.

```python
import time
from fastapi import FastAPI, Request

app = FastAPI()

@app.middleware("http")
async def add_process_time_header(request: Request, call_next):
    start_time = time.perf_counter()
    response = await call_next(request)    # call the actual route handler
    duration = time.perf_counter() - start_time
    response.headers["X-Process-Time"] = str(duration)
    return response
```

## Logging Middleware

A logging middleware intercepts every request and response without modifying them. It is useful for recording timing data, status codes, and URLs for monitoring and debugging.

```python
import logging
from fastapi import Request

logger = logging.getLogger("api")

@app.middleware("http")
async def log_requests(request: Request, call_next):
    logger.info(f"Request: {request.method} {request.url}")
    response = await call_next(request)
    logger.info(f"Response: {response.status_code}")
    return response
```

## CORS Middleware

Allow cross-origin requests from a frontend (e.g., React on localhost:3000):

```python
from fastapi.middleware.cors import CORSMiddleware

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "https://myapp.com"],
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "DELETE", "PATCH"],
    allow_headers=["*"],
)
```

| Option | Description |
|--------|-------------|
| `allow_origins` | List of allowed origins. Use `["*"]` for all (not for cookie-based auth) |
| `allow_credentials` | Allow cookies / authorization headers |
| `allow_methods` | Allowed HTTP methods |
| `allow_headers` | Allowed request headers |
| `expose_headers` | Headers the browser can read in responses |
| `max_age` | How long to cache preflight results (seconds) |

## GZip Middleware

Automatically compress responses:

```python
from fastapi.middleware.gzip import GZipMiddleware

app.add_middleware(GZipMiddleware, minimum_size=1000)  # compress if > 1KB
```

## HTTPS Redirect Middleware

Redirect all HTTP traffic to HTTPS:

```python
from fastapi.middleware.httpsredirect import HTTPSRedirectMiddleware

app.add_middleware(HTTPSRedirectMiddleware)
```

## Trusted Host Middleware

Prevent Host header attacks:

```python
from fastapi.middleware.trustedhost import TrustedHostMiddleware

app.add_middleware(
    TrustedHostMiddleware,
    allowed_hosts=["example.com", "*.example.com"]
)
```

## Custom Middleware Class (Starlette Style)

For more control, use a class-based middleware:

```python
from starlette.middleware.base import BaseHTTPMiddleware
from starlette.requests import Request
from starlette.responses import Response

class RateLimitMiddleware(BaseHTTPMiddleware):
    def __init__(self, app, max_requests: int = 100):
        super().__init__(app)
        self.max_requests = max_requests
        self.request_counts = {}

    async def dispatch(self, request: Request, call_next) -> Response:
        client_ip = request.client.host
        count = self.request_counts.get(client_ip, 0)
        
        if count >= self.max_requests:
            from starlette.responses import JSONResponse
            return JSONResponse(
                {"detail": "Rate limit exceeded"},
                status_code=429
            )
        
        self.request_counts[client_ip] = count + 1
        return await call_next(request)

app.add_middleware(RateLimitMiddleware, max_requests=100)
```

## Request ID Middleware

Attach a unique ID to every request for tracing:

```python
import uuid
from fastapi import Request
from starlette.middleware.base import BaseHTTPMiddleware

class RequestIDMiddleware(BaseHTTPMiddleware):
    async def dispatch(self, request: Request, call_next):
        request_id = str(uuid.uuid4())
        request.state.request_id = request_id
        response = await call_next(request)
        response.headers["X-Request-ID"] = request_id
        return response

app.add_middleware(RequestIDMiddleware)
```

Access it in a route:

```python
@app.get("/items")
def read_items(request: Request):
    request_id = request.state.request_id
    return {"request_id": request_id}
```

## Middleware Execution Order

Middleware added **last** runs **first** (LIFO order):

```python
app.add_middleware(MiddlewareA)   # runs second
app.add_middleware(MiddlewareB)   # runs first
```

## Exception Handling in Middleware

Wrapping `call_next` in a `try/except` block inside middleware allows you to catch any unhandled exception that escapes route handlers, log it, and return a controlled JSON error response to the client.

```python
@app.middleware("http")
async def catch_all_exceptions(request: Request, call_next):
    try:
        return await call_next(request)
    except Exception as exc:
        logger.error(f"Unhandled exception: {exc}", exc_info=True)
        return JSONResponse(
            {"detail": "Internal server error"},
            status_code=500
        )
```

## Starlette Middleware vs FastAPI Middleware

| Type | Use Case |
|------|----------|
| `@app.middleware("http")` | Simple function-based middleware |
| `BaseHTTPMiddleware` | Class-based, more control |
| `app.add_middleware(SomeClass)` | Third-party or Starlette built-ins |

## Summary

- Middleware wraps all requests and responses
- Use `@app.middleware("http")` for simple cases
- Use `BaseHTTPMiddleware` for class-based middleware with state
- Built-in: `CORSMiddleware`, `GZipMiddleware`, `HTTPSRedirectMiddleware`, `TrustedHostMiddleware`
- Middleware is added in LIFO order (last added = first to run)
- Use `request.state` to pass data between middleware and route handlers

---

[← Previous: Database](10-database.md) | [Contents](README.md) | [Next: Background Tasks →](12-background-tasks.md)
