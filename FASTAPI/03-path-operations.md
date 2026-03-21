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

```python
@app.get("/users/{user_id}")
def get_user(user_id: int):              # type hint → auto validation + casting
    return {"user_id": user_id}
```

- `/users/42` → `user_id = 42` (int)
- `/users/abc` → `422 Unprocessable Entity` (validation error)

## Query Parameters

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

```python
@app.get("/old-endpoint", deprecated=True)
def old_endpoint():
    return {"message": "use /new-endpoint instead"}
```

## Using APIRouter (for large apps)

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
