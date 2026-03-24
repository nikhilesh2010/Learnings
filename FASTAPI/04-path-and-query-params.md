# 04 – Path & Query Parameters

## Path Parameters

Declared in the URL path using `{param_name}` and matched by function argument name:

```python
@app.get("/users/{user_id}")
def get_user(user_id: int):
    return {"user_id": user_id}
```

### Type Validation

FastAPI automatically validates and converts path parameters based on type hints:

```python
@app.get("/items/{item_id}")
def get_item(item_id: int):   # only integers allowed
    return {"item_id": item_id}
```

- `/items/42` → ✅ `item_id = 42`
- `/items/abc` → ❌ `422 Unprocessable Entity`

### Multiple Path Parameters

```python
@app.get("/users/{user_id}/posts/{post_id}")
def get_post(user_id: int, post_id: int):
    return {"user_id": user_id, "post_id": post_id}
```

### Predefined Values with Enum

```python
from enum import Enum
from fastapi import FastAPI

class ModelName(str, Enum):
    alexnet = "alexnet"
    resnet = "resnet"
    lenet = "lenet"

app = FastAPI()

@app.get("/models/{model_name}")
def get_model(model_name: ModelName):
    if model_name == ModelName.alexnet:
        return {"model": model_name, "message": "AlexNet selected"}
    return {"model": model_name}
```

Swagger UI will show a dropdown with the allowed values.

### Path Parameters Containing Slashes

```python
from fastapi import Path

@app.get("/files/{file_path:path}")
def read_file(file_path: str):
    return {"file_path": file_path}
```

- `/files/home/user/docs/report.txt` → `file_path = "home/user/docs/report.txt"`

## Query Parameters

Any function parameter that is **not** part of the path is treated as a query parameter:

```python
@app.get("/items")
def get_items(skip: int = 0, limit: int = 10):
    return {"skip": skip, "limit": limit}
```

- `/items` → `skip=0, limit=10`
- `/items?skip=20&limit=5` → `skip=20, limit=5`

### Optional Query Parameters

```python
from typing import Optional

@app.get("/items/{item_id}")
def get_item(item_id: str, q: Optional[str] = None):
    if q:
        return {"item_id": item_id, "q": q}
    return {"item_id": item_id}
```

In Python 3.10+:

```python
@app.get("/items/{item_id}")
def get_item(item_id: str, q: str | None = None):
    ...
```

### Boolean Query Parameters

```python
@app.get("/items/{item_id}")
def get_item(item_id: str, short: bool = False):
    return {"item_id": item_id, "short": short}
```

FastAPI handles these truthy string values for `bool`:
- `true`, `1`, `on`, `yes` → `True`
- `false`, `0`, `off`, `no` → `False`

## Parameter Validation with `Query` and `Path`

Import `Query` and `Path` to add extra validation and metadata:

```python
from fastapi import FastAPI, Query, Path

app = FastAPI()
```

### Query Validation

```python
@app.get("/items")
def read_items(
    q: str = Query(default=None, min_length=3, max_length=50)
):
    return {"q": q}
```

```python
@app.get("/items")
def read_items(
    q: str = Query(
        default=None,
        min_length=3,
        max_length=50,
        pattern=r"^\w+$",     # regex pattern
        title="Search query",
        description="Filter items by name",
        alias="search",       # use ?search= in URL instead of ?q=
    )
):
    return {"q": q}
```

### Required Query Parameter (no default)

```python
@app.get("/items")
def read_items(q: str = Query(...)):     # ... means required
    return {"q": q}

# Or simply:
@app.get("/items")
def read_items(q: str):                  # no default = required
    return {"q": q}
```

### List / Multiple Values

```python
@app.get("/items")
def read_items(q: list[str] = Query(default=[])):
    return {"q": q}
```

- `/items?q=foo&q=bar&q=baz` → `q = ["foo", "bar", "baz"]`

### Path Validation

```python
@app.get("/items/{item_id}")
def get_item(
    item_id: int = Path(title="The item ID", ge=1, le=1000)
):
    return {"item_id": item_id}
```

### Numeric Constraints

| Constraint | Meaning |
|-----------|---------|
| `ge=1` | greater than or equal to 1 |
| `gt=0` | greater than 0 |
| `le=100` | less than or equal to 100 |
| `lt=100` | less than 100 |

```python
@app.get("/items/{item_id}")
def get_item(
    item_id: int = Path(ge=1),
    price: float = Query(gt=0.0, le=9999.99)
):
    return {"item_id": item_id, "price": price}
```

## Combining Path, Query, and Body

A single route handler can accept path parameters, query parameters, and a request body simultaneously. FastAPI determines the source of each parameter automatically: values in the path template become path params, plain scalar types become query params, and Pydantic model arguments become the request body.

```python
from pydantic import BaseModel

class Item(BaseModel):
    name: str
    price: float

@app.put("/items/{item_id}")
def update_item(
    item_id: int = Path(ge=1),          # path param
    q: str | None = Query(default=None), # query param
    item: Item | None = None,            # body (optional)
):
    result = {"item_id": item_id}
    if q:
        result["q"] = q
    if item:
        result["item"] = item
    return result
```

FastAPI determines where each parameter comes from:
- Path `{param}` → path parameter
- Simple type with no body model → query parameter
- Pydantic model → request body

## Summary

- Path parameters use `{name}` syntax and are matched by function argument name
- Query parameters are any function arguments not in the path
- Use `Query()` and `Path()` to add validation: `min_length`, `max_length`, `ge`, `le`, `pattern`
- Use `Enum` to restrict path parameters to specific values
- Use `list[str]` + `Query` to accept multiple values for a single param
- `...` (Ellipsis) as a default means the parameter is required

---

[← Previous: Path Operations](03-path-operations.md) | [Contents](README.md) | [Next: Request Body →](05-request-body.md)
