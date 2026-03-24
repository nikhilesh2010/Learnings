# 15 – Error Handling

## `HTTPException`

The primary way to return HTTP error responses in FastAPI:

```python
from fastapi import FastAPI, HTTPException

app = FastAPI()

@app.get("/items/{item_id}")
def get_item(item_id: int):
    if item_id not in ITEMS:
        raise HTTPException(status_code=404, detail="Item not found")
    return ITEMS[item_id]
```

FastAPI returns a JSON response:

```json
{"detail": "Item not found"}
```

### HTTPException with Custom Headers

```python
raise HTTPException(
    status_code=401,
    detail="Not authenticated",
    headers={"WWW-Authenticate": "Bearer"}
)
```

## Custom Exception Classes

Define a custom exception class that carries the data needed to construct a meaningful error response — for example, an item ID or a field name. Custom exceptions are caught by registered exception handlers before they reach the default handler.

```python
class ItemNotFoundError(Exception):
    def __init__(self, item_id: int):
        self.item_id = item_id
```

## Custom Exception Handlers

Register a handler with `@app.exception_handler(YourException)` to intercept a specific exception type anywhere in the app. The handler receives the `request` and the exception instance and must return a `Response` object.

```python
from fastapi import FastAPI, Request
from fastapi.responses import JSONResponse

app = FastAPI()

class ItemNotFoundError(Exception):
    def __init__(self, item_id: int):
        self.item_id = item_id

@app.exception_handler(ItemNotFoundError)
async def item_not_found_handler(request: Request, exc: ItemNotFoundError):
    return JSONResponse(
        status_code=404,
        content={"message": f"Item {exc.item_id} was not found"},
    )

@app.get("/items/{item_id}")
def get_item(item_id: int):
    if item_id not in ITEMS:
        raise ItemNotFoundError(item_id=item_id)
    return ITEMS[item_id]
```

## Overriding Default Exception Handlers

### Override Validation Error Handler (422)

```python
from fastapi.exceptions import RequestValidationError
from fastapi.responses import JSONResponse

@app.exception_handler(RequestValidationError)
async def validation_exception_handler(request: Request, exc: RequestValidationError):
    return JSONResponse(
        status_code=422,
        content={
            "message": "Validation failed",
            "errors": exc.errors(),
            "body": exc.body,
        }
    )
```

### Override HTTP Exception Handler

```python
from starlette.exceptions import HTTPException as StarletteHTTPException

@app.exception_handler(StarletteHTTPException)
async def http_exception_handler(request: Request, exc: StarletteHTTPException):
    return JSONResponse(
        status_code=exc.status_code,
        content={
            "status": exc.status_code,
            "message": exc.detail,
            "path": str(request.url),
        }
    )
```

## Global Catch-All Handler

A handler registered for the base `Exception` class catches any unhandled exception that escapes route handlers and middleware. Always log the full traceback here so bugs are visible, then return a generic 500 response to avoid leaking internal details.

```python
@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    # Log the error
    import logging
    logging.error(f"Unhandled exception: {exc}", exc_info=True)

    return JSONResponse(
        status_code=500,
        content={"message": "An internal server error occurred"}
    )
```

## Structured Error Responses

Define a consistent error schema:

```python
from pydantic import BaseModel

class ErrorResponse(BaseModel):
    status: int
    message: str
    details: list | None = None

@app.exception_handler(HTTPException)
async def http_exception_handler(request: Request, exc: HTTPException):
    return JSONResponse(
        status_code=exc.status_code,
        content=ErrorResponse(
            status=exc.status_code,
            message=exc.detail
        ).model_dump()
    )
```

## Returning Errors in Middleware

Middleware can return early with an error response before the request reaches the route handler. This is useful for enforcing blanket requirements — such as a required API key — that apply to every endpoint.

```python
from starlette.middleware.base import BaseHTTPMiddleware
from starlette.responses import JSONResponse

class AuthMiddleware(BaseHTTPMiddleware):
    async def dispatch(self, request: Request, call_next):
        if not request.headers.get("X-API-Key"):
            return JSONResponse(
                {"detail": "Missing API key"},
                status_code=401
            )
        return await call_next(request)
```

## Logging Errors

Configure Python's built-in `logging` module at startup to write formatted log entries. In exception handlers, use `exc_info=True` in the `logger.error()` call to include the full traceback in the log output.

```python
import logging

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s %(levelname)s %(message)s",
)

logger = logging.getLogger(__name__)

@app.exception_handler(Exception)
async def log_all_errors(request: Request, exc: Exception):
    logger.error(
        "Unhandled error on %s %s: %s",
        request.method,
        request.url,
        exc,
        exc_info=True
    )
    return JSONResponse(status_code=500, content={"detail": "Server error"})
```

## Re-using FastAPI's Default Handlers

You can call FastAPI's built-in handler functions from within your own exception handlers after adding custom logic such as logging. This lets you extend the default behaviour rather than completely replace it.

```python
from fastapi.exception_handlers import (
    http_exception_handler,
    request_validation_exception_handler,
)
from fastapi.exceptions import RequestValidationError
from starlette.exceptions import HTTPException as StarletteHTTPException

@app.exception_handler(StarletteHTTPException)
async def custom_http_handler(request: Request, exc: StarletteHTTPException):
    # Add your logic, then fall through to the default
    logger.warning(f"HTTP {exc.status_code}: {exc.detail}")
    return await http_exception_handler(request, exc)

@app.exception_handler(RequestValidationError)
async def custom_validation_handler(request: Request, exc: RequestValidationError):
    logger.warning(f"Validation error: {exc.errors()}")
    return await request_validation_exception_handler(request, exc)
```

## Validation Error Structure

When a `422` is returned, FastAPI gives:

```json
{
  "detail": [
    {
      "type": "missing",
      "loc": ["body", "email"],
      "msg": "Field required",
      "input": {"name": "Alice"},
      "url": "https://errors.pydantic.dev/..."
    }
  ]
}
```

## Common HTTP Error Patterns

These are the standard `HTTPException` calls for the most common failure scenarios. Using consistent status codes and detail messages makes your API predictable and easy for clients to handle.

```python
# 400 Bad Request
raise HTTPException(status_code=400, detail="Invalid input data")

# 401 Unauthorized (not logged in)
raise HTTPException(
    status_code=401,
    detail="Not authenticated",
    headers={"WWW-Authenticate": "Bearer"}
)

# 403 Forbidden (logged in but not allowed)
raise HTTPException(status_code=403, detail="Insufficient permissions")

# 404 Not Found
raise HTTPException(status_code=404, detail="Resource not found")

# 409 Conflict (e.g., duplicate email)
raise HTTPException(status_code=409, detail="Email already in use")

# 422 Unprocessable Entity (auto-handled by FastAPI for validation)

# 429 Too Many Requests
raise HTTPException(status_code=429, detail="Rate limit exceeded")

# 500 Internal Server Error
raise HTTPException(status_code=500, detail="An unexpected error occurred")
```

## Summary

- Raise `HTTPException(status_code=..., detail=...)` for expected HTTP errors
- Use `@app.exception_handler(ExcType)` to handle custom or overridden exceptions
- Register a global `Exception` handler for unexpected errors with logging
- Override `RequestValidationError` to customize validation error responses
- Define a consistent `ErrorResponse` schema for uniform API error bodies
- Always log unexpected errors with `exc_info=True` for full tracebacks

---

[← Previous: File Uploads](14-file-uploads.md) | [Contents](README.md) | [Next: Testing →](16-testing.md)
