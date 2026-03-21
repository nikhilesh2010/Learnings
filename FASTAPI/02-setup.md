# 02 – Setup

## Installation

### Minimum install

```bash
pip install fastapi uvicorn
```

### Full install (with all optional dependencies)

```bash
pip install "fastapi[all]"
```

This includes `uvicorn`, `pydantic`, `python-multipart`, `email-validator`, `httpx`, and more.

## Virtual Environment (Recommended)

```bash
# Create
python -m venv venv

# Activate (Windows)
venv\Scripts\activate

# Activate (macOS/Linux)
source venv/bin/activate

# Install dependencies
pip install fastapi uvicorn
```

## Project Structure

### Simple project

```
my_api/
├── main.py
├── requirements.txt
└── .env
```

### Production-ready structure

```
my_api/
├── app/
│   ├── __init__.py
│   ├── main.py              # App entry point, mounts routers
│   ├── config.py            # Settings / environment config
│   ├── dependencies.py      # Shared Depends() functions
│   │
│   ├── routers/
│   │   ├── __init__.py
│   │   ├── users.py
│   │   ├── items.py
│   │   └── auth.py
│   │
│   ├── models/
│   │   ├── __init__.py
│   │   ├── user.py          # SQLAlchemy ORM models
│   │   └── item.py
│   │
│   ├── schemas/
│   │   ├── __init__.py
│   │   ├── user.py          # Pydantic request/response schemas
│   │   └── item.py
│   │
│   ├── crud/
│   │   ├── __init__.py
│   │   ├── user.py          # DB operations for users
│   │   └── item.py
│   │
│   └── db/
│       ├── __init__.py
│       └── session.py       # DB engine + session setup
│
├── tests/
│   ├── __init__.py
│   ├── test_users.py
│   └── test_items.py
│
├── alembic/                 # DB migrations
├── .env
├── requirements.txt
└── Dockerfile
```

## Running the App

### Development (with auto-reload)

```bash
uvicorn app.main:app --reload
```

### With custom host/port

```bash
uvicorn app.main:app --host 0.0.0.0 --port 8080 --reload
```

### With multiple workers (production)

```bash
uvicorn app.main:app --workers 4
```

Or use Gunicorn with Uvicorn workers:

```bash
gunicorn app.main:app -w 4 -k uvicorn.workers.UvicornWorker
```

## Uvicorn Options

| Flag | Description |
|------|-------------|
| `--reload` | Auto-restart on file changes |
| `--host` | Bind address (default `127.0.0.1`) |
| `--port` | Port number (default `8000`) |
| `--workers` | Number of worker processes |
| `--log-level` | Log level: `debug`, `info`, `warning`, `error` |
| `--ssl-keyfile` | SSL key file path |
| `--ssl-certfile` | SSL cert file path |

## App Configuration with Metadata

```python
from fastapi import FastAPI

app = FastAPI(
    title="My API",
    description="A production-ready API built with FastAPI",
    version="1.0.0",
    contact={
        "name": "Dev Team",
        "email": "dev@example.com",
    },
    license_info={
        "name": "MIT",
    },
    docs_url="/docs",        # Swagger UI path (set None to disable)
    redoc_url="/redoc",      # ReDoc path (set None to disable)
    openapi_url="/openapi.json",
)
```

## Environment Variables with Pydantic Settings

```bash
pip install pydantic-settings
```

```python
# app/config.py
from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    app_name: str = "My API"
    debug: bool = False
    database_url: str
    secret_key: str
    allowed_origins: list[str] = ["http://localhost:3000"]

    class Config:
        env_file = ".env"

settings = Settings()
```

```env
# .env
DATABASE_URL=postgresql://user:pass@localhost/dbname
SECRET_KEY=supersecretkey
DEBUG=true
```

```python
# Usage
from app.config import settings

print(settings.database_url)
```

## requirements.txt

```
fastapi>=0.110.0
uvicorn[standard]>=0.29.0
pydantic>=2.0.0
pydantic-settings>=2.0.0
sqlalchemy>=2.0.0
alembic>=1.13.0
python-jose[cryptography]>=3.3.0
passlib[bcrypt]>=1.7.4
python-multipart>=0.0.9
httpx>=0.27.0
pytest>=8.0.0
```

## Disabling Docs in Production

```python
import os
from fastapi import FastAPI

is_production = os.getenv("ENV") == "production"

app = FastAPI(
    docs_url=None if is_production else "/docs",
    redoc_url=None if is_production else "/redoc",
)
```

## Summary

- Install with `pip install fastapi uvicorn` or `pip install "fastapi[all]"`
- Run with `uvicorn main:app --reload` for development
- Use a structured project layout for larger apps
- Store configuration in `.env` files using `pydantic-settings`
- Disable docs in production environments

---

[← Previous: Introduction](01-introduction.md) | [Contents](README.md) | [Next: Path Operations →](03-path-operations.md)
