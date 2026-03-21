# 10 – Database

## Overview

FastAPI works with any database. The most common setup is:

| Layer | Library |
|-------|---------|
| ORM | SQLAlchemy 2.0 |
| Driver (PostgreSQL) | `psycopg2` or `asyncpg` |
| Driver (MySQL) | `PyMySQL` or `aiomysql` |
| Driver (SQLite) | built-in |
| Migrations | Alembic |

```bash
pip install sqlalchemy alembic psycopg2-binary
# or for async:
pip install sqlalchemy[asyncio] asyncpg
```

## SQLAlchemy Setup

### Database Session

```python
# app/db/session.py
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, DeclarativeBase

DATABASE_URL = "postgresql://user:password@localhost/dbname"
# SQLite: DATABASE_URL = "sqlite:///./app.db"

engine = create_engine(DATABASE_URL)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

class Base(DeclarativeBase):
    pass
```

### FastAPI Dependency

```python
# app/dependencies.py
from app.db.session import SessionLocal

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
```

## Defining ORM Models

```python
# app/models/user.py
from sqlalchemy import Column, Integer, String, Boolean, DateTime, func
from app.db.session import Base

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    email = Column(String, unique=True, index=True, nullable=False)
    username = Column(String, unique=True, index=True, nullable=False)
    hashed_password = Column(String, nullable=False)
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
```

```python
# app/models/item.py
from sqlalchemy import Column, Integer, String, Float, ForeignKey
from sqlalchemy.orm import relationship
from app.db.session import Base

class Item(Base):
    __tablename__ = "items"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, index=True)
    description = Column(String, nullable=True)
    price = Column(Float, nullable=False)
    owner_id = Column(Integer, ForeignKey("users.id"))

    owner = relationship("User", back_populates="items")
```

## Pydantic Schemas

Keep ORM models and Pydantic schemas separate:

```python
# app/schemas/user.py
from pydantic import BaseModel, EmailStr

class UserBase(BaseModel):
    email: EmailStr
    username: str

class UserCreate(UserBase):
    password: str

class UserResponse(UserBase):
    id: int
    is_active: bool

    model_config = {"from_attributes": True}
```

## CRUD Operations

```python
# app/crud/user.py
from sqlalchemy.orm import Session
from app.models.user import User
from app.schemas.user import UserCreate
from passlib.context import CryptContext

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

def get_user(db: Session, user_id: int):
    return db.query(User).filter(User.id == user_id).first()

def get_user_by_email(db: Session, email: str):
    return db.query(User).filter(User.email == email).first()

def get_users(db: Session, skip: int = 0, limit: int = 100):
    return db.query(User).offset(skip).limit(limit).all()

def create_user(db: Session, user: UserCreate):
    hashed = pwd_context.hash(user.password)
    db_user = User(
        email=user.email,
        username=user.username,
        hashed_password=hashed
    )
    db.add(db_user)
    db.commit()
    db.refresh(db_user)
    return db_user

def update_user(db: Session, user_id: int, updates: dict):
    db.query(User).filter(User.id == user_id).update(updates)
    db.commit()
    return get_user(db, user_id)

def delete_user(db: Session, user_id: int):
    user = get_user(db, user_id)
    if user:
        db.delete(user)
        db.commit()
    return user
```

## Routers Using CRUD + DB

```python
# app/routers/users.py
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app import crud
from app.schemas.user import UserCreate, UserResponse
from app.dependencies import get_db

router = APIRouter(prefix="/users", tags=["users"])

@router.post("/", response_model=UserResponse, status_code=status.HTTP_201_CREATED)
def create_user(user: UserCreate, db: Session = Depends(get_db)):
    existing = crud.user.get_user_by_email(db, email=user.email)
    if existing:
        raise HTTPException(status_code=400, detail="Email already registered")
    return crud.user.create_user(db, user)

@router.get("/{user_id}", response_model=UserResponse)
def get_user(user_id: int, db: Session = Depends(get_db)):
    user = crud.user.get_user(db, user_id)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    return user

@router.get("/", response_model=list[UserResponse])
def list_users(skip: int = 0, limit: int = 20, db: Session = Depends(get_db)):
    return crud.user.get_users(db, skip=skip, limit=limit)
```

## Creating Tables on Startup

```python
# app/main.py
from app.db.session import engine, Base
from app import models   # ensure models are imported

Base.metadata.create_all(bind=engine)  # creates tables if they don't exist
```

## Alembic Migrations

### Setup

```bash
alembic init alembic
```

Edit `alembic/env.py`:

```python
from app.db.session import Base
from app import models   # import all ORM models so they register

target_metadata = Base.metadata
```

Edit `alembic.ini`:

```ini
sqlalchemy.url = postgresql://user:password@localhost/dbname
```

### Migration Commands

```bash
# Create a migration
alembic revision --autogenerate -m "add users table"

# Apply migrations
alembic upgrade head

# Rollback one step
alembic downgrade -1

# Show history
alembic history
```

## Async Database with SQLAlchemy 2.0

```bash
pip install sqlalchemy[asyncio] asyncpg
```

```python
# app/db/session.py (async)
from sqlalchemy.ext.asyncio import AsyncSession, create_async_engine, async_sessionmaker

DATABASE_URL = "postgresql+asyncpg://user:password@localhost/dbname"

engine = create_async_engine(DATABASE_URL, echo=True)
AsyncSessionLocal = async_sessionmaker(engine, class_=AsyncSession, expire_on_commit=False)

async def get_db():
    async with AsyncSessionLocal() as session:
        yield session
```

```python
# Async CRUD
from sqlalchemy import select

async def get_user(db: AsyncSession, user_id: int):
    result = await db.execute(select(User).filter(User.id == user_id))
    return result.scalars().first()

async def create_user(db: AsyncSession, user: UserCreate):
    db_user = User(**user.model_dump())
    db.add(db_user)
    await db.commit()
    await db.refresh(db_user)
    return db_user
```

```python
# Async route handler
@router.get("/{user_id}", response_model=UserResponse)
async def get_user(user_id: int, db: AsyncSession = Depends(get_db)):
    user = await crud.user.get_user(db, user_id)
    if not user:
        raise HTTPException(status_code=404, detail="Not found")
    return user
```

## Summary

- Define ORM models with SQLAlchemy `Base` and column types
- Use a `get_db()` generator dependency to manage session lifecycle
- Keep ORM models and Pydantic schemas in separate files
- Put DB operations in CRUD modules for clean separation
- Use Alembic for schema migrations in production
- Use async SQLAlchemy + asyncpg for high-concurrency workloads

---

[← Previous: Authentication](09-authentication.md) | [Contents](README.md) | [Next: Middleware →](11-middleware.md)
