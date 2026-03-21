# 09 – Authentication

## Authentication vs Authorization

| Concept | Description |
|---------|-------------|
| **Authentication** | Verifying *who* the user is (login) |
| **Authorization** | Verifying *what* the user can do (permissions) |

## API Key Authentication

Simple token passed in a header, query param, or cookie:

```python
from fastapi import FastAPI, Security, HTTPException, status
from fastapi.security import APIKeyHeader

app = FastAPI()
API_KEY = "my-secret-api-key"
api_key_header = APIKeyHeader(name="X-API-Key", auto_error=False)

def verify_api_key(api_key: str = Security(api_key_header)):
    if api_key != API_KEY:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Invalid or missing API key"
        )
    return api_key

@app.get("/protected", dependencies=[Depends(verify_api_key)])
def protected_route():
    return {"message": "Access granted"}
```

## Password Hashing

Never store plain text passwords. Use `passlib` with `bcrypt`:

```bash
pip install "passlib[bcrypt]"
```

```python
from passlib.context import CryptContext

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

def hash_password(password: str) -> str:
    return pwd_context.hash(password)

def verify_password(plain: str, hashed: str) -> bool:
    return pwd_context.verify(plain, hashed)
```

## JWT Authentication (OAuth2 + Bearer Token)

### Install

```bash
pip install "python-jose[cryptography]"
```

### Full Implementation

```python
# auth.py
from datetime import datetime, timedelta, timezone
from jose import JWTError, jwt
from passlib.context import CryptContext
from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm
from pydantic import BaseModel

SECRET_KEY = "your-secret-key-keep-it-safe"   # use env var in production
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 30

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/auth/token")

class Token(BaseModel):
    access_token: str
    token_type: str

class TokenData(BaseModel):
    username: str | None = None

# Fake user DB — replace with real DB queries
FAKE_USERS_DB = {
    "alice": {
        "username": "alice",
        "hashed_password": pwd_context.hash("secret123"),
        "disabled": False,
    }
}

def get_user(username: str):
    return FAKE_USERS_DB.get(username)

def authenticate_user(username: str, password: str):
    user = get_user(username)
    if not user or not pwd_context.verify(password, user["hashed_password"]):
        return None
    return user

def create_access_token(data: dict, expires_delta: timedelta | None = None) -> str:
    to_encode = data.copy()
    expire = datetime.now(timezone.utc) + (expires_delta or timedelta(minutes=15))
    to_encode["exp"] = expire
    return jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)

def get_current_user(token: str = Depends(oauth2_scheme)):
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        username: str = payload.get("sub")
        if username is None:
            raise credentials_exception
        token_data = TokenData(username=username)
    except JWTError:
        raise credentials_exception

    user = get_user(token_data.username)
    if user is None:
        raise credentials_exception
    return user

def get_active_user(current_user = Depends(get_current_user)):
    if current_user.get("disabled"):
        raise HTTPException(status_code=400, detail="Inactive user")
    return current_user
```

```python
# router/auth.py
from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordRequestForm
from datetime import timedelta
from app.auth import (
    authenticate_user, create_access_token,
    get_active_user, Token, ACCESS_TOKEN_EXPIRE_MINUTES
)

router = APIRouter(prefix="/auth", tags=["auth"])

@router.post("/token", response_model=Token)
def login(form_data: OAuth2PasswordRequestForm = Depends()):
    user = authenticate_user(form_data.username, form_data.password)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect username or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    access_token = create_access_token(
        data={"sub": user["username"]},
        expires_delta=timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    )
    return {"access_token": access_token, "token_type": "bearer"}

@router.get("/me")
def read_me(current_user = Depends(get_active_user)):
    return current_user
```

## Refresh Tokens

```python
REFRESH_TOKEN_EXPIRE_DAYS = 7

def create_refresh_token(data: dict) -> str:
    return create_access_token(data, expires_delta=timedelta(days=REFRESH_TOKEN_EXPIRE_DAYS))

@router.post("/refresh")
def refresh_token(refresh_token: str = Body()):
    try:
        payload = jwt.decode(refresh_token, SECRET_KEY, algorithms=[ALGORITHM])
        username = payload.get("sub")
        if not username:
            raise HTTPException(status_code=401, detail="Invalid refresh token")
    except JWTError:
        raise HTTPException(status_code=401, detail="Invalid refresh token")

    new_access_token = create_access_token({"sub": username})
    return {"access_token": new_access_token, "token_type": "bearer"}
```

## Role-Based Access Control (RBAC)

```python
from enum import Enum

class Role(str, Enum):
    user = "user"
    admin = "admin"

def require_role(role: Role):
    def checker(current_user = Depends(get_active_user)):
        if current_user.get("role") != role:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail=f"Requires {role} role"
            )
        return current_user
    return checker

@app.get("/admin/stats", dependencies=[Depends(require_role(Role.admin))])
def admin_stats():
    return {"stats": "sensitive data"}
```

## HTTP Basic Auth

```python
from fastapi.security import HTTPBasic, HTTPBasicCredentials
import secrets

security = HTTPBasic()

def verify_basic_auth(credentials: HTTPBasicCredentials = Depends(security)):
    correct_username = secrets.compare_digest(credentials.username, "admin")
    correct_password = secrets.compare_digest(credentials.password, "secret")
    if not (correct_username and correct_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect credentials",
            headers={"WWW-Authenticate": "Basic"},
        )
    return credentials.username
```

> Always use `secrets.compare_digest` to prevent timing attacks.

## Cookie-Based Auth

```python
from fastapi import Cookie

def get_current_user_from_cookie(session: str | None = Cookie(default=None)):
    if not session:
        raise HTTPException(status_code=401, detail="Not authenticated")
    user = decode_session(session)
    return user

@app.post("/login")
def login(response: Response, username: str = Form(), password: str = Form()):
    user = authenticate_user(username, password)
    if not user:
        raise HTTPException(status_code=401)
    session_token = create_session_token(user)
    response.set_cookie(key="session", value=session_token, httponly=True, secure=True)
    return {"message": "Logged in"}
```

## Security Best Practices

- Store `SECRET_KEY` in environment variables, never in code
- Hash passwords with bcrypt (work factor ≥ 12)
- Use HTTPS in production (TLS/SSL)
- Set short expiry on access tokens (15-30 min)
- Use `httponly=True` and `secure=True` for cookies
- Use `secrets.compare_digest` for constant-time string comparison
- Rotate secret keys periodically
- Log failed authentication attempts

## Summary

- Use `OAuth2PasswordBearer` + JWT for stateless token-based auth
- Hash passwords with `passlib[bcrypt]` before storing
- Use `Depends()` to inject auth checks into routes or routers
- Use `secrets.compare_digest` for timing-safe comparisons
- Keep secrets in environment variables via `pydantic-settings`
- Use RBAC by adding role checks inside dependency functions

---

[← Previous: Dependency Injection](08-dependency-injection.md) | [Contents](README.md) | [Next: Database →](10-database.md)
