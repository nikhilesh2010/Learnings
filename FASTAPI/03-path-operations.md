# 03 – Path Operations

## What is a Path Operation?

A **path operation** is a combination of:
- A **path** (URL): `/users`, `/items/{id}`
- An **HTTP method**: `GET`, `POST`, `PUT`, `DELETE`, etc.
- A **function** (the handler / route handler)

```python
@app.get("/users")        # "path operation decorator"
def get_users():          # "path operation function"
    return [{"name": "Alice"}]
```

## HTTP Method Decorators

FastAPI provides a decorator for every standard HTTP verb. The decorator name matches the method: `@app.get()`, `@app.post()`, `@app.put()`, `@app.patch()`, `@app.delete()`, and so on. Each binds a URL path and HTTP method to a handler function.

```python
from fastapi import FastAPI

app = FastAPI()

@app.get("/items")         # Read data
def read_items(): ...

@app.post("/items")        # Create data
def create_item(): ...

@app.put("/items/{id}")    # Replace data (full update)
def update_item(id: int): ...

@app.patch("/items/{id}")  # Partial update
def patch_item(id: int): ...

@app.delete("/items/{id}") # Delete data
def delete_item(id: int): ...

@app.head("/items")        # Like GET but no body
def head_items(): ...

@app.options("/items")     # Preflight / CORS
def options_items(): ...
```

## Return Values

FastAPI automatically serializes the return value to JSON:

```python
@app.get("/")
def root():
    return {"message": "Hello"}          # dict → JSON object

@app.get("/list")
def get_list():
    return [1, 2, 3]                     # list → JSON array

@app.get("/text")
def get_text():
    return "plain string"                # str → JSON string

@app.get("/num")
def get_num():
    return 42                            # int → JSON number
```

## Path Parameters

Path parameters are declared with `{param_name}` in the URL and matched by the same-named function argument. Adding a type hint (`int`, `str`, etc.) tells FastAPI to validate and cast the value automatically — invalid types return a `422` error.

```python
@app.get("/users/{user_id}")
def get_user(user_id: int):              # type hint → auto validation + casting
    return {"user_id": user_id}
```

- `/users/42` → `user_id = 42` (int)
- `/users/abc` → `422 Unprocessable Entity` (validation error)

## Query Parameters

Query parameters are function arguments that don't appear in the path template. They are read from the URL query string (`?key=value`) and may have default values (optional) or no default (required).

```python
@app.get("/items")
def read_items(skip: int = 0, limit: int = 10):
    return {"skip": skip, "limit": limit}
```

- `/items` → `skip=0, limit=10`
- `/items?skip=5&limit=20` → `skip=5, limit=20`

## Order Matters

Fixed paths must come before parameterized paths:

```python
@app.get("/users/me")       # ← must be FIRST
def get_current_user():
    return {"user": "current"}

@app.get("/users/{user_id}")
def get_user(user_id: str):
    return {"user_id": user_id}
```

If reversed, `/users/me` would match `{user_id}` with value `"me"`.

## Response Status Codes

By default FastAPI returns `200 OK`. Pass `status_code` to the decorator to return a different code. Use the `status` constants from `fastapi` (e.g., `status.HTTP_201_CREATED`) for readability and to avoid magic numbers.

```python
from fastapi import FastAPI, status

@app.post("/items", status_code=status.HTTP_201_CREATED)
def create_item():
    return {"created": True}

@app.delete("/items/{id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_item(id: int):
    return None
```

Common status codes:

| Code | Constant | Meaning |
|------|----------|---------|
| 200 | `HTTP_200_OK` | Success |
| 201 | `HTTP_201_CREATED` | Resource created |
| 204 | `HTTP_204_NO_CONTENT` | Success, no body |
| 400 | `HTTP_400_BAD_REQUEST` | Client error |
| 401 | `HTTP_401_UNAUTHORIZED` | Not authenticated |
| 403 | `HTTP_403_FORBIDDEN` | Not authorized |
| 404 | `HTTP_404_NOT_FOUND` | Resource not found |
| 422 | `HTTP_422_UNPROCESSABLE_ENTITY` | Validation error |
| 500 | `HTTP_500_INTERNAL_SERVER_ERROR` | Server error |

## Tags (for Docs Grouping)

Tags group related routes together in the Swagger UI and ReDoc documentation. Pass a list of strings to `tags=` on each route, and all routes sharing the same tag appear under a collapsible section.

```python
@app.get("/users", tags=["users"])
def get_users(): ...

@app.post("/users", tags=["users"])
def create_user(): ...

@app.get("/items", tags=["items"])
def get_items(): ...
```

Tags organize routes in the Swagger UI into collapsible sections.

## Summary / Description in Docs

Use `summary` for a short one-line description and `description` for longer Markdown text that appears in the Swagger UI detail panel. Python docstrings on the handler function are also used as the description.

```python
@app.get(
    "/items/{item_id}",
    summary="Get a single item",
    description="Retrieve a specific item by its unique ID.",
    tags=["items"],
)
def get_item(item_id: int):
    """
    Docstrings also appear in the docs.
    Supports **Markdown** formatting.
    """
    return {"item_id": item_id}
```

## Deprecated Routes

Mark a route as `deprecated=True` to flag it in the auto-generated docs without removing it. Deprecated routes appear crossed-out in Swagger UI, signalling to API consumers that they should migrate to a newer endpoint.

```python
@app.get("/old-endpoint", deprecated=True)
def old_endpoint():
    return {"message": "use /new-endpoint instead"}
```

## Using APIRouter (for large apps)

An `APIRouter` works exactly like the main `FastAPI` app but is designed to live in a separate file and be included into the main app. Use one router per resource (users, items, auth) to keep your codebase modular and focused.

```python
# routers/users.py
from fastapi import APIRouter

router = APIRouter(prefix="/users", tags=["users"])

@router.get("/")
def get_users():
    return [{"name": "Alice"}]

@router.get("/{user_id}")
def get_user(user_id: int):
    return {"user_id": user_id}
```

```python
# main.py
from fastapi import FastAPI
from app.routers import users

app = FastAPI()
app.include_router(users.router)
```

## Async Route Handlers

Handler functions can be either `def` (synchronous) or `async def` (asynchronous). Use `async def` when the handler calls other `await`-able operations such as async database drivers or `httpx`. FastAPI automatically runs plain `def` handlers in a thread pool to avoid blocking the event loop.

```python
import asyncio
from fastapi import FastAPI

app = FastAPI()

@app.get("/async")
async def async_handler():
    await asyncio.sleep(1)           # non-blocking
    return {"message": "done"}
```

Use `async def` when:
- Calling async libraries (async DB drivers, httpx, aiofiles)
- Doing I/O-bound work you want non-blocking

Use `def` when:
- Doing CPU-bound work
- Using synchronous libraries (SQLAlchemy sync, requests)

> FastAPI runs sync `def` handlers in a thread pool automatically.

## Summary

- Decorate functions with `@app.get()`, `@app.post()`, etc. to create routes
- Return dicts, lists, or Pydantic models — FastAPI serializes them
- Use `status_code` to control HTTP response codes
- Use `tags`, `summary`, and `description` to enrich auto-generated docs
- Use `APIRouter` to split routes across multiple files
- Use `async def` for non-blocking I/O operations

---

[← Previous: Setup](02-setup.md) | [Contents](README.md) | [Next: Path & Query Parameters →](04-path-and-query-params.md)
