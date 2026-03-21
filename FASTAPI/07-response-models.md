# 07 – Response Models

## Declaring a Response Model

Use `response_model` to control what gets sent back to the client:

```python
from fastapi import FastAPI
from pydantic import BaseModel

app = FastAPI()

class UserCreate(BaseModel):
    username: str
    password: str

class UserResponse(BaseModel):
    id: int
    username: str
    # password is NOT here — never sent back

@app.post("/users", response_model=UserResponse)
def create_user(user: UserCreate):
    # Imagine this saves to DB and returns an object with id
    return {"id": 1, "username": user.username, "password": user.password}
    # password is filtered out by response_model
```

FastAPI will:
1. Use the return value only if it conforms to `UserResponse`
2. **Strip out** any extra fields not in the response model
3. Apply Pydantic validation to the output

## Response Model Options

### `response_model_exclude_unset`

Only include fields that were explicitly set (not defaults):

```python
@app.get("/items/{item_id}", response_model=Item, response_model_exclude_unset=True)
def get_item(item_id: int):
    return {"name": "Widget"}    # price not set → not included in response
```

### `response_model_exclude`

Exclude specific fields from the response:

```python
@app.get("/users/{id}", response_model=User, response_model_exclude={"password", "secret"})
def get_user(id: int):
    ...
```

### `response_model_include`

Include only specific fields:

```python
@app.get("/users/{id}", response_model=User, response_model_include={"id", "username"})
def get_user(id: int):
    ...
```

## Returning Multiple Items

```python
from typing import List

class Item(BaseModel):
    id: int
    name: str

@app.get("/items", response_model=list[Item])
def get_items():
    return [{"id": 1, "name": "Widget"}, {"id": 2, "name": "Gadget"}]
```

## Response Status Codes

```python
from fastapi import status

@app.post("/items", response_model=Item, status_code=status.HTTP_201_CREATED)
def create_item(item: ItemCreate):
    ...

@app.delete("/items/{id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_item(id: int):
    return None
```

## Using `Response` Directly

For fine-grained control:

```python
from fastapi import FastAPI, Response
from fastapi.responses import JSONResponse, PlainTextResponse, HTMLResponse

@app.get("/custom")
def custom_response():
    return JSONResponse(
        content={"message": "custom"},
        status_code=200,
        headers={"X-Custom-Header": "value"}
    )

@app.get("/text")
def text_response():
    return PlainTextResponse("Hello, world!")

@app.get("/html")
def html_response():
    return HTMLResponse("<h1>Hello</h1>")
```

## Setting Headers and Cookies

```python
from fastapi import FastAPI, Response

@app.get("/headers")
def set_headers(response: Response):
    response.headers["X-Token"] = "secret"
    return {"message": "headers set"}

@app.post("/login")
def login(response: Response):
    response.set_cookie(key="session", value="abc123", httponly=True)
    return {"message": "logged in"}

@app.post("/logout")
def logout(response: Response):
    response.delete_cookie(key="session")
    return {"message": "logged out"}
```

## JSONResponse, RedirectResponse, StreamingResponse

```python
from fastapi.responses import RedirectResponse, StreamingResponse
import io

@app.get("/redirect")
def redirect():
    return RedirectResponse(url="https://example.com", status_code=301)

@app.get("/stream")
def stream_data():
    def generate():
        for i in range(10):
            yield f"data: {i}\n"
    return StreamingResponse(generate(), media_type="text/plain")

@app.get("/download")
def download_file():
    file_data = b"file content here"
    return StreamingResponse(
        io.BytesIO(file_data),
        media_type="application/octet-stream",
        headers={"Content-Disposition": "attachment; filename=file.txt"}
    )
```

## Documenting Possible Responses

```python
from fastapi import FastAPI
from fastapi.responses import JSONResponse

@app.get(
    "/items/{item_id}",
    response_model=Item,
    responses={
        404: {"description": "Item not found"},
        200: {
            "content": {
                "application/json": {
                    "example": {"id": 1, "name": "Widget"}
                }
            }
        }
    }
)
def get_item(item_id: int):
    ...
```

## Response with ORM Objects

When returning database objects, set `from_attributes = True` in the response model:

```python
class ItemResponse(BaseModel):
    id: int
    name: str
    price: float

    model_config = {"from_attributes": True}

@app.get("/items/{item_id}", response_model=ItemResponse)
def get_item(item_id: int, db: Session = Depends(get_db)):
    item = db.query(Item).filter(Item.id == item_id).first()
    return item   # ORM object → auto-converted to Pydantic model
```

## Union Response Models

Return one of several possible response shapes:

```python
from typing import Union

class Cat(BaseModel):
    pet_type: str = "cat"
    meows: int

class Dog(BaseModel):
    pet_type: str = "dog"
    barks: float

@app.get("/pet/{pet_id}", response_model=Union[Cat, Dog])
def get_pet(pet_id: int):
    if pet_id == 1:
        return Cat(meows=3)
    return Dog(barks=1.5)
```

## `response_model=None` – Skip Serialization

```python
@app.get("/data", response_model=None)
def get_raw():
    # Return exactly what you want with no filtering
    return Response(content="raw bytes", media_type="application/octet-stream")
```

## Summary

- Use `response_model` to filter and shape what the API returns to clients
- This prevents accidentally leaking sensitive fields (passwords, secrets)
- Use `response_model_exclude_unset=True` to omit fields not explicitly set
- Return `JSONResponse`, `PlainTextResponse`, etc. for complete control
- Use `Response` as a parameter to set headers and cookies without bypassing serialization
- Set `from_attributes = True` in response models when returning ORM objects

---

[← Previous: Pydantic Models](06-pydantic-models.md) | [Contents](README.md) | [Next: Dependency Injection →](08-dependency-injection.md)
