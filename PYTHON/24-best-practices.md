# 24: Best Practices & Patterns

## 📐 Project Structure

A well-organised project separates source code (`src/`), tests (`tests/`), configuration (`.env`, `pyproject.toml`), and documentation. Using a `src/` layout prevents accidental imports of the uninstalled package from the repo root, catching missing-dependency bugs early.

```
my-project/
├── src/
│   └── myapp/
│       ├── __init__.py
│       ├── main.py           ← entry point
│       ├── config.py         ← configuration
│       ├── models/
│       │   ├── __init__.py
│       │   └── user.py
│       ├── services/
│       │   ├── __init__.py
│       │   └── user_service.py
│       ├── repositories/
│       │   └── user_repo.py  ← DB access
│       └── utils/
│           └── helpers.py
├── tests/
│   ├── conftest.py
│   ├── test_services.py
│   └── test_repos.py
├── .env
├── .env.example
├── .gitignore
├── pyproject.toml            ← or requirements.txt
└── README.md
```

---

## 🔤 Naming Conventions (PEP 8)

PEP 8 defines Python's standard naming conventions: `snake_case` for variables and functions, `PascalCase` for classes, `UPPER_SNAKE_CASE` for module-level constants, and a single leading underscore for internal/private names (convention only, not enforced).

```python
# Variables and functions — snake_case
user_name = "Alice"
def calculate_total(items):
    ...

# Classes — PascalCase
class UserService:
    ...

# Constants — UPPER_SNAKE_CASE
MAX_RETRY_COUNT = 3
DEFAULT_TIMEOUT = 30

# Private — leading underscore (convention, not enforced)
_internal_counter = 0

# "Dunder" — double underscores (Python internals)
__version__ = "1.0.0"

# Packages and modules — short, lowercase, no underscores preferred
# mypackage, utils, helpers
```

---

## 📏 Code Style (PEP 8)
PEP 8 defines code formatting standards: line length (79–99 chars), spaces around operators, blank lines between definitions, and import grouping (stdlib → third-party → local). Use an auto-formatter like Black or Ruff to enforce these rules automatically and end all style debates.
```python
# Line length: 79-99 chars (88 is Black's default)

# Spaces around operators
x = 1 + 2
y = x * 3

# No spaces inside brackets
my_list = [1, 2, 3]
my_dict = {"key": "value"}

# Two blank lines between top-level definitions
def foo():
    pass


def bar():          # two blank lines before
    pass

# One blank line between methods in a class
class MyClass:
    def method_a(self):
        pass

    def method_b(self):  # one blank line
        pass

# Imports at top, grouped:
# 1. stdlib
# 2. third-party
# 3. local
import os
import sys

import requests
from sqlalchemy import create_engine

from myapp.models import User
```

---

## 🤖 Formatters & Linters

Use **Black** or **Ruff** for auto-formatting (configure to run on save and enforce in CI). Use **mypy** or **pyright** for static type checking. **isort** / Ruff also sorts imports. These tools eliminate style debates and catch bugs before runtime, at zero ongoing cost.

```bash
# black — opinionated formatter (auto-formats code)
pip install black
black src/             # format all Python files
black --check src/     # check without modifying

# ruff — extremely fast linter + formatter (modern, replaces flake8)
pip install ruff
ruff check src/        # lint
ruff format src/       # format

# isort — sort imports
pip install isort
isort src/

# mypy — static type checker
pip install mypy
mypy src/
```

```toml
# pyproject.toml
[tool.black]
line-length = 88

[tool.ruff]
line-length = 88
select = ["E", "F", "W", "I"]

[tool.mypy]
python_version = "3.11"
strict = true
```

---

## 🏗️ Separation of Concerns

Keep the four layers of responsibility clearly separate: **models** (data structures), **repositories** (database access), **services** (business logic), and **routes/handlers** (HTTP layer). Business logic must never appear in route handlers, and database queries must never appear in service functions.

```python
# ❌ Everything in one function
def handle_create_user(request):
    data = json.loads(request.body)
    if not data.get("email"):
        return {"error": "Email required"}, 400
    conn = sqlite3.connect("db.sqlite3")
    conn.execute("INSERT INTO users VALUES (?, ?)", (data["name"], data["email"]))
    conn.commit()
    send_email(data["email"], "Welcome!")
    return {"status": "created"}, 201

# ✅ Separated concerns
# models/user.py — data structure
@dataclass
class User:
    name: str
    email: str
    id: int | None = None

# repositories/user_repo.py — DB access
class UserRepository:
    def create(self, user: User) -> User: ...
    def find_by_email(self, email: str) -> User | None: ...

# services/user_service.py — business logic
class UserService:
    def __init__(self, repo: UserRepository, mailer: Mailer):
        self.repo = repo
        self.mailer = mailer

    def register(self, name: str, email: str) -> User:
        if self.repo.find_by_email(email):
            raise ValueError("Email already in use")
        user = self.repo.create(User(name=name, email=email))
        self.mailer.send_welcome(email)
        return user

# routes/users.py — HTTP handling
def create_user(request):
    data = request.get_json()
    user = user_service.register(data["name"], data["email"])
    return jsonify(asdict(user)), 201
```

---

## 🔑 Configuration Management

Centralise all configuration in one place (e.g., `config.py`). Load values from environment variables — never hardcode them. Using a typed dataclass or Pydantic settings model gives the rest of the app type-safe config access with automatic validation at startup.

```python
# config.py — centralize all config
import os
from dataclasses import dataclass

@dataclass
class Config:
    database_url: str
    secret_key: str
    debug: bool = False
    port: int = 8000

def load_config() -> Config:
    from dotenv import load_dotenv
    load_dotenv()
    return Config(
        database_url=os.environ["DATABASE_URL"],
        secret_key=os.environ["SECRET_KEY"],
        debug=os.getenv("DEBUG", "false").lower() == "true",
        port=int(os.getenv("PORT", "8000")),
    )

config = load_config()
```

---

## 📝 Logging

Use the `logging` module instead of `print()` for production code. Call `logging.basicConfig()` once at startup. Get a per-module logger with `logging.getLogger(__name__)` so log messages are automatically labelled with the originating module. Use `logger.exception()` to capture full tracebacks.

```python
import logging

# Basic setup (call once at startup)
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s - %(name)s - %(levelname)s - %(message)s",
)

# Get a module-level logger
logger = logging.getLogger(__name__)

# Use structured messages
logger.debug("Processing item %d", item_id)
logger.info("User %s logged in", username)
logger.warning("Disk usage at %d%%", usage)
logger.error("Failed to connect to DB: %s", error)
logger.exception("Unexpected error")   # logs traceback automatically

# Levels: DEBUG < INFO < WARNING < ERROR < CRITICAL
```

---

## ⚡ Performance Tips

Key Python performance patterns: use **generators** for large data instead of loading everything into a list, `''.join(parts)` instead of `+=` in loops, **sets** for O(1) membership testing, and bind frequently called functions to local variables. Always profile before optimising — never guess where the bottleneck is.

```python
# Use generators for large data
def process_large_file(path):
    with open(path) as f:
        for line in f:         # one line at a time
            yield parse(line)

# str.join() for string concatenation
parts = ["a", "b", "c"]
result = "".join(parts)        # fast
# NOT: result = "" ; for p in parts: result += p  (slow)

# Local variable lookup is faster
import math
sqrt = math.sqrt             # bind to local
[sqrt(x) for x in data]

# Set for membership testing
valid_ids = set(ids)         # O(1) lookup
if user_id in valid_ids: ... # fast!
# NOT if user_id in ids: ... # O(n) lookup on list

# Avoid premature optimization — profile first!
import cProfile
cProfile.run("my_function()")
```

---

## 🔒 Security Basics

Fundamental security rules: never hardcode secrets (use environment variables), hash passwords with `bcrypt` or `argon2` (never MD5 or SHA-1), always use parameterised database queries, and validate all input at system boundaries (user data, external APIs).

```python
# Never hardcode secrets
SECRET = os.environ["SECRET_KEY"]         # ✅
SECRET = "hardcoded-secret-abc123"        # ❌

# Hash passwords properly
import bcrypt
hashed = bcrypt.hashpw(password.encode(), bcrypt.gensalt())
bcrypt.checkpw(password.encode(), hashed)  # verify

# Use parameterized queries
cursor.execute("SELECT * FROM users WHERE email = ?", (email,))  # ✅
cursor.execute(f"SELECT * FROM users WHERE email = '{email}'")   # ❌

# Validate input at system boundaries
def get_user_age(value: str) -> int:
    age = int(value)       # catches non-numeric
    if not 0 <= age <= 150:
        raise ValueError(f"Invalid age: {age}")
    return age
```

---

## 📌 Quick Reference

A concise summary of naming conventions, key design principles (DRY, YAGNI, single responsibility, explicit over implicit), and mandatory tooling (formatter, type checker, test runner).

```python
# Naming
variable_name = ...     # snake_case
def function_name(): ...
class ClassName: ...
CONSTANT = ...          # UPPER_SNAKE_CASE

# Principles
# - One responsibility per function/class
# - Fail fast and loudly
# - Explicit over implicit
# - Prefer composition over inheritance
# - Don't repeat yourself (DRY)
# - YAGNI — You Aren't Gonna Need It

# Tools
# black/ruff — format code
# mypy/pyright — type checking
# pytest — testing
# logging — structured logs (not print)
```


---

[← Previous: Web Frameworks](23-web-frameworks.md) | [Contents](README.md) | [Next: Debugging & Profiling →](25-debugging.md)
