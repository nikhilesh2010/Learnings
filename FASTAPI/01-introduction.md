# 01 – Introduction to FastAPI

## What is FastAPI?

FastAPI is a modern, high-performance web framework for building APIs with Python 3.8+ based on standard Python type hints. It is built on top of **Starlette** (for the web parts) and **Pydantic** (for the data parts).

## Why FastAPI?

| Feature | Description |
|---------|-------------|
| **Performance** | On par with NodeJS and Go (thanks to Starlette + async) |
| **Developer speed** | ~2–3× faster to develop vs Flask/Django REST |
| **Auto docs** | Swagger UI and ReDoc generated from code |
| **Type safety** | Errors caught at development time via type hints |
| **Standards** | Based on OpenAPI (formerly Swagger) and JSON Schema |
| **Async** | Full async/await support out of the box |

## FastAPI vs Flask vs Django REST

| Feature | FastAPI | Flask | Django REST |
|---------|---------|-------|-------------|
| Performance | Excellent | Good | Moderate |
| Async support | Native | Limited | Limited |
| Auto validation | Yes (Pydantic) | Manual | Serializers |
| Auto docs | Yes | No | Yes (drf-yasg) |
| Learning curve | Low | Very low | High |
| Built-in auth | No | No | Yes |

## Core Concepts

- **Path operations**: Functions mapped to URL paths and HTTP methods
- **Pydantic models**: Python classes used for data validation and serialization
- **Dependency injection**: Reusable logic injected into route handlers
- **OpenAPI schema**: Auto-generated API documentation and spec

## Your First FastAPI App

```python
# main.py
from fastapi import FastAPI

app = FastAPI()

@app.get("/")
def root():
    return {"message": "Hello, FastAPI!"}

@app.get("/items/{item_id}")
def read_item(item_id: int, q: str = None):
    return {"item_id": item_id, "q": q}
```

### Run it

```bash
uvicorn main:app --reload
```

- `main` → the file `main.py`
- `app` → the `FastAPI()` instance
- `--reload` → auto-restart on file changes (development only)

## Automatic Interactive Documentation

Once running, FastAPI generates two doc UIs automatically:

| UI | URL | Description |
|----|-----|-------------|
| Swagger UI | `http://127.0.0.1:8000/docs` | Interactive API explorer |
| ReDoc | `http://127.0.0.1:8000/redoc` | Clean readable docs |
| OpenAPI JSON | `http://127.0.0.1:8000/openapi.json` | Raw schema |

## How FastAPI Works Under the Hood

```
Request
   │
   ▼
Starlette (ASGI)        ← handles HTTP, routing, middleware
   │
   ▼
FastAPI Router          ← matches path + method to handler
   │
   ▼
Pydantic Validation     ← validates and parses inputs
   │
   ▼
Your Handler Function   ← your business logic runs here
   │
   ▼
Pydantic Serialization  ← output converted to JSON
   │
   ▼
Response
```

## ASGI vs WSGI

FastAPI uses **ASGI** (Asynchronous Server Gateway Interface), unlike older frameworks that use WSGI:

```
WSGI (Flask, Django)  → synchronous, one request at a time per worker
ASGI (FastAPI)        → asynchronous, handles many requests concurrently
```

## Python Type Hints in FastAPI

FastAPI uses Python type hints to:
1. Validate request data
2. Convert data types automatically
3. Generate documentation

```python
from fastapi import FastAPI

app = FastAPI()

@app.get("/users/{user_id}")
def get_user(user_id: int, active: bool = True):
    #          ^^^              ^^^^
    #    auto-cast to int    optional bool query param
    return {"user_id": user_id, "active": active}
```

## Key Packages

```
fastapi        → the framework
uvicorn        → ASGI server to run the app
pydantic       → data validation (bundled with fastapi)
starlette      → ASGI toolkit (bundled with fastapi)
httpx          → async HTTP client (for testing)
sqlalchemy     → ORM for database access
alembic        → database migrations
python-jose    → JWT token handling
passlib        → password hashing
python-multipart → file upload support
```

## Summary

- FastAPI is a modern Python API framework built on Starlette and Pydantic
- It is async-first, type-safe, and auto-generates interactive documentation
- Type hints drive validation, serialization, and documentation
- Run with Uvicorn (ASGI server) using `uvicorn main:app --reload`

---

[Contents](README.md) | [Next: Setup →](02-setup.md)
