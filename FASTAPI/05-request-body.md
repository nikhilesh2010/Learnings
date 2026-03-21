# 05 – Request Body

## What is a Request Body?

A **request body** is data sent by the client in the HTTP request (typically JSON). FastAPI uses **Pydantic models** to declare, validate, and parse request bodies.

## Declaring a Request Body

```python
from fastapi import FastAPI
from pydantic import BaseModel

app = FastAPI()

class Item(BaseModel):
    name: str
    description: str | None = None
    price: float
    tax: float | None = None

@app.post("/items")
def create_item(item: Item):
    return item
```

FastAPI will:
1. Read the request body as JSON
2. Validate fields against the model
3. Convert to the correct Python types
4. Return `422 Unprocessable Entity` if validation fails

## Accessing Body Fields

```python
@app.post("/items")
def create_item(item: Item):
    item_dict = item.model_dump()      # Pydantic v2
    # item_dict = item.dict()          # Pydantic v1
    if item.tax:
        price_with_tax = item.price + item.tax
        item_dict["price_with_tax"] = price_with_tax
    return item_dict
```

## Body + Path Parameter

```python
@app.put("/items/{item_id}")
def update_item(item_id: int, item: Item):
    return {"item_id": item_id, **item.model_dump()}
```

FastAPI knows:
- `item_id` → path parameter (in URL)
- `item` → request body (Pydantic model)

## Body + Path + Query

```python
@app.put("/items/{item_id}")
def update_item(
    item_id: int,
    item: Item,
    q: str | None = None
):
    result = {"item_id": item_id, **item.model_dump()}
    if q:
        result["q"] = q
    return result
```

## Multiple Body Parameters

When multiple Pydantic models are declared, FastAPI expects a nested JSON object:

```python
class Item(BaseModel):
    name: str
    price: float

class User(BaseModel):
    username: str
    full_name: str | None = None

@app.put("/items/{item_id}")
def update_item(item_id: int, item: Item, user: User):
    return {"item_id": item_id, "item": item, "user": user}
```

Expected JSON body:

```json
{
  "item": {
    "name": "Foo",
    "price": 35.4
  },
  "user": {
    "username": "dave",
    "full_name": "Dave Grohl"
  }
}
```

## Singular Body Values with `Body()`

When adding a single non-model value to the body:

```python
from fastapi import Body

@app.put("/items/{item_id}")
def update_item(
    item_id: int,
    item: Item,
    importance: int = Body(gt=0)
):
    return {"item_id": item_id, "item": item, "importance": importance}
```

Expected JSON:

```json
{
  "item": {"name": "Foo", "price": 5},
  "importance": 5
}
```

## Embedding a Single Model

Use `Body(embed=True)` to require the model inside a named key:

```python
@app.put("/items/{item_id}")
def update_item(item_id: int, item: Item = Body(embed=True)):
    return {"item_id": item_id, "item": item}
```

Expected JSON:

```json
{
  "item": {
    "name": "Foo",
    "price": 35.4
  }
}
```

Instead of just:

```json
{
  "name": "Foo",
  "price": 35.4
}
```

## Nested Models

```python
class Image(BaseModel):
    url: str
    name: str

class Item(BaseModel):
    name: str
    price: float
    image: Image | None = None    # nested model

@app.post("/items")
def create_item(item: Item):
    return item
```

Expected JSON:

```json
{
  "name": "Camera",
  "price": 299.99,
  "image": {
    "url": "https://example.com/camera.jpg",
    "name": "Camera Photo"
  }
}
```

## Lists in Body

```python
class Item(BaseModel):
    name: str
    price: float
    tags: list[str] = []           # list of strings

class Bundle(BaseModel):
    items: list[Item]              # list of nested models
```

## Body with Extra Validation using Field

```python
from pydantic import BaseModel, Field

class Item(BaseModel):
    name: str = Field(min_length=1, max_length=100)
    price: float = Field(gt=0, description="Must be greater than zero")
    quantity: int = Field(default=1, ge=1, le=1000)
```

See [06 – Pydantic Models](06-pydantic-models.md) for full details.

## Schema Example in Docs

```python
class Item(BaseModel):
    name: str
    price: float

    model_config = {
        "json_schema_extra": {
            "examples": [
                {
                    "name": "Widget",
                    "price": 9.99
                }
            ]
        }
    }
```

This shows an example in the Swagger UI "Try it out" section.

## Validation Errors

When the body fails validation, FastAPI returns `422 Unprocessable Entity`:

```json
{
  "detail": [
    {
      "type": "missing",
      "loc": ["body", "price"],
      "msg": "Field required",
      "input": {"name": "Widget"}
    }
  ]
}
```

## Summary

- Declare a Pydantic model and use it as a function parameter to receive JSON body data
- FastAPI automatically validates, parses, and serializes the body
- Combine body, path, and query params freely in one handler
- Use `Body(embed=True)` to wrap a single model in a key
- Use `Field()` inside Pydantic models to add per-field validation
- Nested models and lists of models are fully supported

---

[← Previous: Path & Query Parameters](04-path-and-query-params.md) | [Contents](README.md) | [Next: Pydantic Models →](06-pydantic-models.md)
