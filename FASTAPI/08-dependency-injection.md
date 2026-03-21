# 08 – Dependency Injection

## What is Dependency Injection?

Dependency Injection (DI) in FastAPI lets you declare shared logic, state, or database connections that are automatically resolved and injected into your route handlers. Use `Depends()` to declare a dependency.

```python
from fastapi import FastAPI, Depends

app = FastAPI()

def get_db():
    # Shared logic that runs before the handler
    return {"connection": "db_conn"}

@app.get("/items")
def read_items(db = Depends(get_db)):
    return {"db": db}
```

## Why Use Dependencies?

- **Reuse**: Share logic across many routes
- **Separation of concerns**: Keep route handlers slim
- **Testability**: Easily override dependencies in tests
- **Scoping**: Automatically clean up resources (DB sessions)
- **Chaining**: Dependencies can depend on other dependencies

## Basic Dependency

```python
from fastapi import Depends, HTTPException, Query

def common_params(skip: int = 0, limit: int = Query(default=10, le=100)):
    return {"skip": skip, "limit": limit}

@app.get("/items")
def read_items(params: dict = Depends(common_params)):
    return params

@app.get("/users")
def read_users(params: dict = Depends(common_params)):
    return params
```

## Class-Based Dependencies

Classes are also valid dependencies — FastAPI calls `__init__`:

```python
class CommonQueryParams:
    def __init__(self, skip: int = 0, limit: int = 10, q: str | None = None):
        self.skip = skip
        self.limit = limit
        self.q = q

@app.get("/items")
def read_items(params: CommonQueryParams = Depends(CommonQueryParams)):
    return {"skip": params.skip, "limit": params.limit, "q": params.q}

# Shorthand (FastAPI infers the class):
@app.get("/users")
def read_users(params: CommonQueryParams = Depends()):
    return params
```

## Database Session Dependency

The most common real-world use case:

```python
from sqlalchemy.orm import Session
from app.db.session import SessionLocal

def get_db():
    db = SessionLocal()
    try:
        yield db              # provide the session to the handler
    finally:
        db.close()            # always close, even on exceptions

@app.get("/users/{user_id}")
def get_user(user_id: int, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    return user
```

`yield` makes it a generator dependency — code after `yield` runs on cleanup.

## Chaining Dependencies

Dependencies can declare their own dependencies:

```python
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

def get_current_user(db: Session = Depends(get_db), token: str = Header()):
    user = verify_token(token, db)
    if not user:
        raise HTTPException(status_code=401, detail="Invalid token")
    return user

def get_active_user(current_user = Depends(get_current_user)):
    if not current_user.is_active:
        raise HTTPException(status_code=400, detail="Inactive user")
    return current_user

@app.get("/profile")
def get_profile(user = Depends(get_active_user)):
    return user
```

## Router-Level Dependencies

Apply dependencies to **all routes** in a router:

```python
from fastapi import APIRouter, Depends

router = APIRouter(
    prefix="/admin",
    tags=["admin"],
    dependencies=[Depends(require_admin_role)]
)

@router.get("/stats")
def get_stats():
    return {"stats": "..."}
```

## App-Level Dependencies

Apply dependencies globally to all routes:

```python
app = FastAPI(dependencies=[Depends(verify_api_key)])
```

## Overriding Dependencies in Tests

```python
# main.py
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

# test_main.py
from fastapi.testclient import TestClient
from app.main import app, get_db

def override_get_db():
    db = TestingSessionLocal()
    try:
        yield db
    finally:
        db.close()

app.dependency_overrides[get_db] = override_get_db

client = TestClient(app)
```

## `Depends` with `use_cache`

By default, FastAPI caches dependency results within a single request. To disable:

```python
@app.get("/items")
def read_items(
    db1: Session = Depends(get_db),
    db2: Session = Depends(get_db, use_cache=False)  # fresh call
):
    ...
```

## Security Dependencies

```python
from fastapi.security import OAuth2PasswordBearer

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="token")

def get_current_user(token: str = Depends(oauth2_scheme)):
    user = decode_token(token)
    if not user:
        raise HTTPException(status_code=401)
    return user

@app.get("/me")
def read_me(current_user = Depends(get_current_user)):
    return current_user
```

## Full DI Example

```python
from fastapi import FastAPI, Depends, HTTPException, Header
from sqlalchemy.orm import Session

app = FastAPI()

# Layer 1: DB session
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

# Layer 2: Auth token validation
def get_current_user(
    authorization: str = Header(),
    db: Session = Depends(get_db)
):
    token = authorization.replace("Bearer ", "")
    user = db.query(User).filter(User.token == token).first()
    if not user:
        raise HTTPException(status_code=401, detail="Unauthorized")
    return user

# Layer 3: Active-user check
def require_active(user = Depends(get_current_user)):
    if not user.is_active:
        raise HTTPException(status_code=403, detail="Account disabled")
    return user

# Route uses the full chain
@app.get("/dashboard")
def dashboard(user = Depends(require_active), db: Session = Depends(get_db)):
    return {"user": user.email, "data": "..."}
```

## Summary

- Use `Depends()` to inject reusable logic into route handlers
- Dependencies can be functions, async functions, or classes
- Use `yield` for setup/teardown (e.g., DB sessions)
- Dependencies can chain — each can depend on other dependencies
- Apply dependencies at route, router, or app level
- Override dependencies in tests with `app.dependency_overrides`

---

[← Previous: Response Models](07-response-models.md) | [Contents](README.md) | [Next: Authentication →](09-authentication.md)
