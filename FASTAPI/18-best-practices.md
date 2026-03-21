# 18 – Best Practices

## Project Structure

Use a layered, modular structure for maintainability:

```
app/
├── main.py              # App creation, router registration, startup events
├── config.py            # Settings via pydantic-settings
├── dependencies.py      # Shared Depends() — DB session, auth
│
├── routers/             # One file per resource
│   ├── users.py
│   ├── items.py
│   └── auth.py
│
├── schemas/             # Pydantic models (request/response)
│   ├── user.py          # UserBase, UserCreate, UserResponse
│   └── item.py
│
├── models/              # SQLAlchemy ORM models
│   ├── user.py
│   └── item.py
│
├── crud/                # DB operations
│   ├── user.py
│   └── item.py
│
├── services/            # Business logic
│   ├── auth.py          # JWT, password hashing
│   └── email.py
│
└── db/
    └── session.py       # engine, SessionLocal, Base
```

## Schema Separation

Never expose internal model details to the client. Always use separate schemas:

```python
# schemas/user.py

class UserBase(BaseModel):
    email: str
    username: str

class UserCreate(UserBase):    # input: registration
    password: str

class UserUpdate(BaseModel):   # input: partial update (all optional)
    email: str | None = None
    username: str | None = None
    password: str | None = None

class UserResponse(UserBase):  # output: never includes password
    id: int
    is_active: bool
    model_config = {"from_attributes": True}
```

## Naming Conventions

| Item | Convention | Example |
|------|-----------|---------|
| Routes | kebab-case | `/user-profiles/` |
| Python functions | snake_case | `create_user()` |
| Pydantic models | PascalCase | `UserCreate` |
| ORM models | PascalCase | `User` |
| Constants | UPPER_SNAKE | `MAX_FILE_SIZE` |
| Env vars | UPPER_SNAKE | `DATABASE_URL` |

## API Versioning

Prefix routers with a version number:

```python
# main.py
from app.routers import users_v1, users_v2

app.include_router(users_v1.router, prefix="/api/v1")
app.include_router(users_v2.router, prefix="/api/v2")
```

Or separate apps behind a load balancer.

## Pagination

Always paginate list endpoints:

```python
from pydantic import BaseModel
from typing import Generic, TypeVar

T = TypeVar("T")

class PaginatedResponse(BaseModel, Generic[T]):
    items: list[T]
    total: int
    page: int
    size: int
    pages: int

@app.get("/items", response_model=PaginatedResponse[ItemResponse])
def list_items(page: int = 1, size: int = Query(default=20, le=100), db: Session = Depends(get_db)):
    offset = (page - 1) * size
    total = db.query(Item).count()
    items = db.query(Item).offset(offset).limit(size).all()
    return {
        "items": items,
        "total": total,
        "page": page,
        "size": size,
        "pages": (total + size - 1) // size
    }
```

## Use `Annotated` for Clean Dependency Declarations

```python
from typing import Annotated
from fastapi import Depends
from sqlalchemy.orm import Session
from app.dependencies import get_db, get_current_user

# Define reusable type aliases
DBSession = Annotated[Session, Depends(get_db)]
CurrentUser = Annotated[User, Depends(get_current_user)]

@app.get("/me")
def get_me(user: CurrentUser):
    return user

@app.get("/items")
def list_items(db: DBSession, user: CurrentUser):
    return db.query(Item).filter(Item.owner_id == user.id).all()
```

## Never Store Secrets in Code

```python
# BAD
SECRET_KEY = "hardcoded-secret"

# GOOD
import os
SECRET_KEY = os.environ["SECRET_KEY"]

# BETTER: use pydantic-settings
from app.config import settings
SECRET_KEY = settings.secret_key
```

## Input Validation at the Boundary

Validate all inputs at the API layer. Trust internal function calls:

```python
# BAD: validating deep inside business logic
def process_order(order_id: int):
    if order_id <= 0:     # shouldn't need this here
        raise ValueError(...)

# GOOD: validate at the route level
@app.post("/orders/{order_id}")
def create_order(order_id: int = Path(ge=1)):
    process_order(order_id)   # order_id is guaranteed valid
```

## Async Best Practices

```python
# Use async def when doing async I/O
@app.get("/data")
async def get_data():
    result = await async_db_query()   # non-blocking
    return result

# Use def for CPU-bound or sync-only operations
@app.get("/compute")
def compute():
    return cpu_heavy_work()   # FastAPI runs in thread pool automatically

# DON'T use async def with synchronous blocking calls
@app.get("/bad")
async def bad():
    import time
    time.sleep(5)       # blocks the event loop!
    return {}

# Use run_in_executor for sync-blocking work in async routes
import asyncio
@app.get("/ok")
async def ok():
    loop = asyncio.get_event_loop()
    result = await loop.run_in_executor(None, blocking_function)
    return result
```

## Response Caching

```python
from functools import lru_cache

@lru_cache(maxsize=128)
def get_settings():
    return Settings()

# For HTTP-level caching:
from fastapi import Response

@app.get("/static-data")
def get_static(response: Response):
    response.headers["Cache-Control"] = "public, max-age=3600"
    return {"data": "..."}
```

## Rate Limiting

Use `slowapi` (a Starlette-compatible rate limiter):

```bash
pip install slowapi
```

```python
from slowapi import Limiter, _rate_limit_exceeded_handler
from slowapi.util import get_remote_address
from slowapi.errors import RateLimitExceeded

limiter = Limiter(key_func=get_remote_address)
app.state.limiter = limiter
app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)

@app.get("/items")
@limiter.limit("20/minute")
async def list_items(request: Request):
    return {"items": []}
```

## Keep Handlers Thin

```python
# BAD: all logic in the handler
@app.post("/users")
def create_user(user: UserCreate, db: Session = Depends(get_db)):
    existing = db.query(User).filter(User.email == user.email).first()
    if existing:
        raise HTTPException(400, "Email taken")
    hashed = bcrypt.hash(user.password)
    db_user = User(email=user.email, hashed_password=hashed)
    db.add(db_user)
    db.commit()
    db.refresh(db_user)
    return db_user

# GOOD: delegate to CRUD and service layers
@app.post("/users", response_model=UserResponse, status_code=201)
def create_user(user: UserCreate, db: Session = Depends(get_db)):
    if crud.user.get_by_email(db, user.email):
        raise HTTPException(400, "Email already registered")
    return crud.user.create(db, user)
```

## Use `status` Module for Status Codes

```python
from fastapi import status

# BAD
@app.post("/items", status_code=201)
def create_item(): ...

# GOOD
@app.post("/items", status_code=status.HTTP_201_CREATED)
def create_item(): ...
```

## Lifespan Events

Use lifespan for startup/shutdown logic:

```python
from contextlib import asynccontextmanager
from fastapi import FastAPI

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup
    await connect_to_db()
    yield
    # Shutdown
    await disconnect_from_db()

app = FastAPI(lifespan=lifespan)
```

## Summary

- Follow a layered project structure: routers → services → crud → models
- Use separate Pydantic schemas per operation (create, update, response)
- Store all secrets in environment variables, never in source code
- Paginate all list endpoints with consistent page/size params
- Use `Annotated` type aliases for reusable `Depends()` declarations
- Keep route handlers thin — delegate to service and CRUD layers
- Use `async def` only for non-blocking async I/O operations
- Use `lifespan` for setup/teardown instead of deprecated `on_event` handlers

---

[← Previous: Deployment](17-deployment.md) | [Contents](README.md) | [Next: Debugging →](19-debugging.md)
