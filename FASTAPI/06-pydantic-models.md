# 06 – Pydantic Models

## What is Pydantic?

Pydantic is the data validation library that powers FastAPI. It uses Python type hints to define schemas and validate data at runtime.

```bash
pip install pydantic         # bundled with fastapi
```

## Basic Model

Define a schema by subclassing `BaseModel` and annotating each field with a type. Fields without a default are required; fields with a default (including `None`) are optional.

```python
from pydantic import BaseModel

class User(BaseModel):
    id: int
    name: str
    email: str
    age: int | None = None   # optional field
    is_active: bool = True   # field with default
```

## Creating and Using Models

Pydantic models can be instantiated from keyword arguments, validated from a dict with `model_validate()`, or parsed directly from a JSON string with `model_validate_json()`. Use `model_dump()` to serialise back to a dict.

```python
# From a dict
user = User(id=1, name="Alice", email="alice@example.com")
print(user.name)           # Alice

# From JSON string
import json
user = User.model_validate_json('{"id":1,"name":"Bob","email":"bob@example.com"}')

# To dict
user.model_dump()          # {'id': 1, 'name': 'Alice', ...}

# To JSON string
user.model_dump_json()     # '{"id":1,"name":"Alice",...}'
```

> Pydantic v1 used `.dict()` and `.json()`. Pydantic v2 uses `.model_dump()` and `.model_dump_json()`.

## Field – Adding Validation and Metadata

`Field()` attaches validation constraints and documentation metadata to individual model fields. It is the equivalent of `Query()` and `Path()` but used inside model definitions rather than route signatures.

```python
from pydantic import BaseModel, Field

class Item(BaseModel):
    name: str = Field(min_length=1, max_length=100)
    description: str | None = Field(default=None, max_length=300)
    price: float = Field(gt=0, description="Price must be positive")
    quantity: int = Field(default=1, ge=1, le=999)
    tags: list[str] = Field(default_factory=list)
```

### Field Options

| Option | Description |
|--------|-------------|
| `default` | Default value |
| `default_factory` | Callable that returns default (e.g. `list`, `dict`) |
| `title` | Field title in JSON schema |
| `description` | Field description in docs |
| `min_length` | Min length for strings |
| `max_length` | Max length for strings |
| `pattern` | Regex pattern for strings |
| `gt` | Greater than (numbers) |
| `ge` | Greater than or equal (numbers) |
| `lt` | Less than (numbers) |
| `le` | Less than or equal (numbers) |
| `alias` | Alternative field name for JSON |
| `exclude` | Exclude from serialization |
| `frozen` | Make field immutable |

## Supported Field Types

Pydantic supports a wide range of built-in Python types as well as specialised types from `pydantic` including `EmailStr`, `HttpUrl`, `UUID`, `Decimal`, and `datetime`. Each type is validated and coerced automatically.

```python
from pydantic import BaseModel, HttpUrl, EmailStr
from datetime import datetime
from uuid import UUID
from decimal import Decimal

class Profile(BaseModel):
    id: UUID
    username: str
    email: EmailStr              # validates email format (pip install pydantic[email])
    website: HttpUrl             # validates URL format
    score: Decimal
    created_at: datetime
    metadata: dict[str, str]
    tags: list[str]
    coords: tuple[float, float]
    status: set[str]
```

## Validators

### Field Validator (Pydantic v2)

```python
from pydantic import BaseModel, field_validator

class User(BaseModel):
    username: str
    password: str

    @field_validator("username")
    @classmethod
    def username_alphanumeric(cls, v: str) -> str:
        if not v.isalnum():
            raise ValueError("Username must be alphanumeric")
        return v.lower()          # transform the value

    @field_validator("password")
    @classmethod
    def password_length(cls, v: str) -> str:
        if len(v) < 8:
            raise ValueError("Password must be at least 8 characters")
        return v
```

### Model Validator (cross-field validation)

```python
from pydantic import BaseModel, model_validator

class DateRange(BaseModel):
    start_date: str
    end_date: str

    @model_validator(mode="after")
    def check_dates(self) -> "DateRange":
        if self.start_date >= self.end_date:
            raise ValueError("end_date must be after start_date")
        return self
```

## Nested Models

A Pydantic model can contain other models as field types, allowing arbitrarily deep nested structures. Nested models are validated recursively, so every level of the hierarchy must conform to its schema.

```python
class Address(BaseModel):
    street: str
    city: str
    country: str = "US"

class User(BaseModel):
    id: int
    name: str
    address: Address

user = User(
    id=1,
    name="Alice",
    address={"street": "123 Main St", "city": "Boston"}
)
print(user.address.city)   # Boston
```

## Inheritance

Models support standard Python class inheritance — subclasses inherit all parent fields and can add new ones. This is useful for building a hierarchy of related schemas such as a base model, a create model, and a response model.

```python
class BaseItem(BaseModel):
    name: str
    description: str | None = None

class Item(BaseItem):
    price: float
    tax: float | None = None

class StoredItem(Item):
    id: int                    # adds an id field
```

## Schema Separation Pattern (FastAPI Best Practice)

Use separate schemas for create, update, and read operations:

```python
# Base has shared fields
class UserBase(BaseModel):
    email: str
    full_name: str | None = None

# Create input (includes password)
class UserCreate(UserBase):
    password: str

# Update input (all fields optional)
class UserUpdate(BaseModel):
    email: str | None = None
    full_name: str | None = None
    password: str | None = None

# API response (no password)
class UserResponse(UserBase):
    id: int
    is_active: bool

    model_config = {"from_attributes": True}   # allows ORM model → Pydantic
```

## `from_attributes` (ORM Mode)

Used to populate Pydantic models from SQLAlchemy ORM objects:

```python
class UserResponse(BaseModel):
    id: int
    email: str

    model_config = {"from_attributes": True}

# Later:
db_user = db.query(User).first()
response = UserResponse.model_validate(db_user)  # works with ORM object
```

## Partial Updates with Optional Fields

For PATCH operations, declare all fields as `Optional` with a `None` default so that clients can send only the fields they want to update. Use `model_dump(exclude_unset=True)` to retrieve only the fields that were explicitly provided.

```python
class UserUpdate(BaseModel):
    email: str | None = None
    full_name: str | None = None
    is_active: bool | None = None

@app.patch("/users/{user_id}")
def patch_user(user_id: int, updates: UserUpdate):
    # Only fields provided in the request are non-None
    update_data = updates.model_dump(exclude_unset=True)
    # Apply update_data to the existing record
    return update_data
```

`exclude_unset=True` → only includes fields that were explicitly provided, ignoring defaults.

## Config Options

`model_config` is a dict-based configuration block that controls how Pydantic validates and serialises the model. Common options include `from_attributes` for ORM compatibility, `str_strip_whitespace`, and `json_schema_extra` for example values.

```python
class Item(BaseModel):
    name: str
    price: float

    model_config = {
        "from_attributes": True,         # ORM mode
        "populate_by_name": True,        # allow both alias and field name
        "str_strip_whitespace": True,    # strip whitespace from strings
        "validate_default": True,        # validate default values too
        "json_schema_extra": {
            "examples": [
                {"name": "Widget", "price": 9.99}
            ]
        }
    }
```

## Serialization Options

`model_dump()` accepts keyword arguments that control which fields are included in the output. Use `exclude_unset=True` for PATCH payloads, `exclude_none=True` to keep responses lean, and `by_alias=True` when field aliases are required.

```python
user = User(id=1, name="Alice", email="a@example.com")

user.model_dump()                            # all fields
user.model_dump(exclude={"id"})              # exclude id
user.model_dump(include={"name", "email"})   # include only these
user.model_dump(exclude_unset=True)          # only explicitly set fields
user.model_dump(exclude_none=True)           # exclude None values
user.model_dump(by_alias=True)              # use aliases as keys
```

## Summary

- Define schemas by subclassing `BaseModel`
- Use `Field()` to add constraints: `gt`, `ge`, `min_length`, `pattern`
- Use `@field_validator` for single-field validation and transformation
- Use `@model_validator` for cross-field constraints
- Use separate schemas for create / update / response (never expose password hashes)
- Set `from_attributes = True` in `model_config` for ORM compatibility
- Use `exclude_unset=True` in `model_dump()` for partial update handling

---

[← Previous: Request Body](05-request-body.md) | [Contents](README.md) | [Next: Response Models →](07-response-models.md)
