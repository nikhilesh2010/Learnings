# 22: Database

## 🗄️ Database Options

| Tool | Use Case |
|------|----------|
| **sqlite3** | Built-in, local, no server needed |
| **psycopg2** | PostgreSQL (raw SQL) |
| **SQLAlchemy Core** | SQL query builder (any DB) |
| **SQLAlchemy ORM** | ORM — Python classes map to tables |
| **SQLModel** | Modern: SQLAlchemy + Pydantic |
| **Tortoise ORM** | Async-first ORM |

---

## 🗃️ sqlite3 — Built-in

```python
import sqlite3
from contextlib import contextmanager

# Connect (creates file if not exists)
conn = sqlite3.connect("mydb.sqlite3")
conn.row_factory = sqlite3.Row   # access columns by name

# Create table
conn.execute("""
    CREATE TABLE IF NOT EXISTS users (
        id    INTEGER PRIMARY KEY AUTOINCREMENT,
        name  TEXT    NOT NULL,
        email TEXT    UNIQUE NOT NULL,
        age   INTEGER
    )
""")
conn.commit()

# Insert (use parameterized queries — prevents SQL injection!)
conn.execute(
    "INSERT INTO users (name, email, age) VALUES (?, ?, ?)",
    ("Alice", "alice@example.com", 30)
)
conn.commit()

# Query
cursor = conn.execute("SELECT * FROM users WHERE age > ?", (25,))
for row in cursor.fetchall():
    print(row["name"], row["email"])

# Fetchone
user = conn.execute("SELECT * FROM users WHERE name = ?", ("Alice",)).fetchone()

conn.close()
```

### Context Manager Pattern
```python
@contextmanager
def get_db(path="mydb.sqlite3"):
    conn = sqlite3.connect(path)
    conn.row_factory = sqlite3.Row
    conn.execute("PRAGMA foreign_keys = ON")
    try:
        yield conn
        conn.commit()
    except Exception:
        conn.rollback()
        raise
    finally:
        conn.close()

with get_db() as db:
    db.execute("INSERT INTO users ...", (...))
    # auto-committed on success, rolled back on error
```

---

## 🔥 SQLAlchemy ORM

The most popular Python ORM.

```bash
pip install sqlalchemy
```

### Define Models
```python
from sqlalchemy import create_engine, Column, Integer, String, ForeignKey
from sqlalchemy.orm import DeclarativeBase, relationship, Session

class Base(DeclarativeBase):
    pass

class User(Base):
    __tablename__ = "users"

    id    = Column(Integer, primary_key=True)
    name  = Column(String(100), nullable=False)
    email = Column(String(200), unique=True, nullable=False)

    posts = relationship("Post", back_populates="author")

    def __repr__(self):
        return f"User(id={self.id}, name={self.name})"

class Post(Base):
    __tablename__ = "posts"

    id        = Column(Integer, primary_key=True)
    title     = Column(String(200))
    body      = Column(String)
    author_id = Column(Integer, ForeignKey("users.id"))

    author = relationship("User", back_populates="posts")
```

### Engine & Session
```python
# Create engine (connection pool)
engine = create_engine("sqlite:///mydb.sqlite3", echo=False)

# Create all tables
Base.metadata.create_all(engine)

# Session — unit of work
with Session(engine) as session:
    # Create
    user = User(name="Alice", email="alice@example.com")
    session.add(user)
    session.commit()
    session.refresh(user)       # reload from DB (get auto-generated id)
    print(user.id)              # 1

    # Read
    alice = session.get(User, 1)                          # by primary key
    alice = session.execute(
        select(User).where(User.name == "Alice")
    ).scalar_one()

    # Update
    alice.name = "Alicia"
    session.commit()

    # Delete
    session.delete(alice)
    session.commit()
```

### Querying (SQLAlchemy 2.x)
```python
from sqlalchemy import select, and_, or_, func

with Session(engine) as session:
    # All users
    users = session.execute(select(User)).scalars().all()

    # Filter
    stmt = select(User).where(User.name == "Alice")
    stmt = select(User).where(User.id > 5, User.name.like("A%"))

    # Order / Limit
    stmt = select(User).order_by(User.name).limit(10).offset(20)

    # Count
    count = session.execute(select(func.count()).select_from(User)).scalar()

    # Join
    stmt = (
        select(User, Post)
        .join(Post, User.id == Post.author_id)
        .where(Post.title.contains("python"))
    )

    # Aggregate
    stmt = select(func.count(User.id), User.name).group_by(User.name)
```

---

## 🚀 SQLModel — Modern (SQLAlchemy + Pydantic)

```bash
pip install sqlmodel
```

```python
from sqlmodel import SQLModel, Field, Session, create_engine, select
from typing import Optional

class User(SQLModel, table=True):
    id:    Optional[int] = Field(default=None, primary_key=True)
    name:  str
    email: str = Field(unique=True)
    age:   Optional[int] = None

engine = create_engine("sqlite:///mydb.db")
SQLModel.metadata.create_all(engine)

# Create
with Session(engine) as session:
    user = User(name="Alice", email="alice@example.com", age=30)
    session.add(user)
    session.commit()
    session.refresh(user)

# Query
with Session(engine) as session:
    users = session.exec(select(User).where(User.age > 25)).all()
```

---

## 🐘 PostgreSQL with psycopg2

```bash
pip install psycopg2-binary
```

```python
import psycopg2
from psycopg2.extras import RealDictCursor

conn = psycopg2.connect(
    host="localhost",
    database="mydb",
    user="postgres",
    password="secret"
)

with conn.cursor(cursor_factory=RealDictCursor) as cur:
    cur.execute(
        "SELECT * FROM users WHERE age > %s",   # %s for psycopg2
        (25,)
    )
    users = cur.fetchall()   # list of dicts

conn.commit()
conn.close()
```

---

## 🔑 Safety Rules

```python
# ✅ Always use parameterized queries
cursor.execute("SELECT * FROM users WHERE email = ?", (email,))

# ❌ NEVER concatenate user input into SQL (SQL Injection!)
cursor.execute(f"SELECT * FROM users WHERE email = '{email}'")
```

---

## 📌 Quick Reference

```python
# sqlite3
import sqlite3
conn = sqlite3.connect("db.sqlite3")
conn.row_factory = sqlite3.Row
conn.execute("SQL", (params,))
conn.commit()

# SQLAlchemy 2.x
from sqlalchemy import create_engine, select
from sqlalchemy.orm import DeclarativeBase, Session

engine = create_engine("sqlite:///db.sqlite3")

with Session(engine) as s:
    s.add(obj)
    s.commit()
    result = s.execute(select(Model).where(Model.field == val)).scalars().all()

# Always parameterize!
# ✅ cursor.execute("SELECT * WHERE id = ?", (id,))
# ❌ cursor.execute(f"SELECT * WHERE id = {id}")
```


---

[← Previous: Testing](21-testing.md) | [Contents](README.md) | [Next: Web Frameworks →](23-web-frameworks.md)
