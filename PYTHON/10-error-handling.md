# 10: Error Handling

## ⚠️ Why Error Handling Matters

Unhandled exceptions crash your program. Good error handling:
- Keeps programs running through expected failures
- Returns meaningful error messages
- Protects sensitive data from leaking in tracebacks

---

## 🔠 Exception Hierarchy

```
BaseException
├── SystemExit
├── KeyboardInterrupt
├── GeneratorExit
└── Exception
    ├── ArithmeticError
    │   ├── ZeroDivisionError
    │   └── OverflowError
    ├── AttributeError
    ├── EOFError
    ├── ImportError
    │   └── ModuleNotFoundError
    ├── LookupError
    │   ├── IndexError
    │   └── KeyError
    ├── NameError
    ├── OSError
    │   ├── FileNotFoundError
    │   ├── PermissionError
    │   └── TimeoutError
    ├── RuntimeError
    ├── StopIteration
    ├── TypeError
    ├── ValueError
    └── (your own custom exceptions)
```

---

## 🛡️ try / except / else / finally

```python
# Basic
try:
    result = 10 / 0
except ZeroDivisionError:
    print("Cannot divide by zero")

# Catch multiple exception types
try:
    data = int(input("Enter number: "))
except ValueError:
    print("That's not a number!")
except (TypeError, ArithmeticError):
    print("Math error!")

# Catch any exception (use sparingly)
try:
    risky_operation()
except Exception as e:
    print(f"Something went wrong: {e}")

# else — runs only if NO exception occurred
try:
    value = int("42")
except ValueError:
    print("Invalid number")
else:
    print(f"Parsed successfully: {value}")  # runs

# finally — ALWAYS runs (cleanup code)
file = None
try:
    file = open("data.txt")
    data = file.read()
except FileNotFoundError:
    print("File not found")
finally:
    if file:
        file.close()   # always close the file
```

---

## 🔄 Re-raising Exceptions

```python
def fetch_user(user_id):
    try:
        data = db.query(user_id)
    except ConnectionError:
        print("DB connection failed")
        raise   # re-raise the same exception

# Raise a different exception (chaining)
try:
    config = load_config("config.json")
except FileNotFoundError as e:
    raise RuntimeError("Config file required") from e
    # The original exception is preserved as __cause__
```

---

## 🧩 Custom Exceptions

```python
# Base application exception
class AppError(Exception):
    """Base class for app errors."""
    def __init__(self, message: str, code: int = None):
        super().__init__(message)
        self.code = code

class NotFoundError(AppError):
    """Resource not found."""
    def __init__(self, resource: str):
        super().__init__(f"{resource} not found", code=404)
        self.resource = resource

class ValidationError(AppError):
    """Invalid input data."""
    def __init__(self, field: str, message: str):
        super().__init__(f"{field}: {message}", code=400)
        self.field = field

class PermissionError(AppError):
    """Access denied."""
    def __init__(self):
        super().__init__("Access denied", code=403)
```

```python
# Raising and catching custom exceptions
def get_user(user_id: int):
    user = db.find(user_id)
    if user is None:
        raise NotFoundError("User")
    return user

try:
    user = get_user(999)
except NotFoundError as e:
    print(e)         # User not found
    print(e.code)    # 404
except AppError as e:
    print(f"App error {e.code}: {e}")
```

---

## 🔍 Exception Info & Tracebacks

```python
import traceback
import sys

try:
    risky()
except Exception as e:
    # Exception attributes
    print(type(e).__name__)   # exception class name
    print(str(e))             # message
    print(e.args)             # tuple of args

    # Traceback
    traceback.print_exc()     # print traceback to stderr
    tb_str = traceback.format_exc()  # as string (for logging)

    # Current exception info
    exc_type, exc_val, exc_tb = sys.exc_info()
```

---

## 🚨 Raising Exceptions

```python
# raise with message
raise ValueError("Invalid input")
raise TypeError(f"Expected int, got {type(x).__name__}")

# raise from context
raise RuntimeError("Failed") from original_exception

# Re-raise current exception
raise   # only valid inside except block

# Assert (development checks — disabled with python -O)
def divide(a, b):
    assert b != 0, "Divisor cannot be zero"
    return a / b
```

---

## 🎯 Best Practices

```python
# ✅ Catch specific exceptions
try:
    data = json.loads(text)
except json.JSONDecodeError as e:
    logger.error(f"Invalid JSON: {e}")
    return None

# ❌ Don't silently swallow exceptions
try:
    risky()
except Exception:
    pass   # BAD — hides bugs

# ✅ Always log or handle meaningfully
try:
    risky()
except Exception as e:
    logger.exception("Unexpected error")   # logs traceback

# ✅ Use finally / context managers for cleanup
with open("file.txt") as f:   # auto-closes
    data = f.read()

# ✅ Catch at the right level
# Low-level: let exceptions propagate
# High-level: catch and handle/log

# ✅ Distinguish operational vs programmer errors
# Operational: input validation, file not found, network timeout
# Programmer: TypeError, AttributeError — these should propagate
```

---

## 🔧 Context Managers for Cleanup

```python
# Better than try/finally for resource cleanup
with open("file.txt") as f:
    data = f.read()

# Works with DB sessions, locks, etc.
with db.session() as session:
    session.add(record)
    session.commit()

# Multiple context managers
with open("in.txt") as src, open("out.txt", "w") as dst:
    dst.write(src.read())
```

> See [14-context-managers.md](14-context-managers.md) for building your own.

---

## 📌 Quick Reference

```python
# Basic
try:
    ...
except SomeError as e:
    ...
except (Error1, Error2):
    ...
else:
    ...    # no exception
finally:
    ...    # always runs

# Custom exception
class MyError(Exception):
    pass

# Raise
raise ValueError("msg")
raise MyError("msg") from original

# Re-raise
except Exception:
    raise   # same exception
```


---

[← Previous: Modules & Packages](09-modules-and-packages.md) | [Contents](README.md) | [Next: Comprehensions →](11-comprehensions.md)
