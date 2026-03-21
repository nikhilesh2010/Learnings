# 21: Testing

## 🧪 Why Test?

Testing ensures your code works correctly and keeps working as it changes.

| Type | Speed | Scope | Tool |
|------|-------|-------|------|
| **Unit** | Fast | Single function/class | pytest, unittest |
| **Integration** | Medium | Multiple units together | pytest |
| **End-to-end** | Slow | Full system | pytest, Selenium |

---

## ✅ pytest — The Standard

```bash
pip install pytest
```

```python
# test_math.py

def add(a, b):
    return a + b

def test_add_positive_numbers():
    assert add(2, 3) == 5

def test_add_negative():
    assert add(-1, -1) == -2

def test_add_zero():
    assert add(0, 5) == 5
```

```bash
pytest                     # run all tests
pytest test_math.py        # specific file
pytest test_math.py::test_add  # specific test
pytest -v                  # verbose output
pytest -x                  # stop on first failure
pytest -k "add"            # run tests matching name
pytest --tb=short          # shorter traceback
pytest -s                  # show print() output
```

---

## 🎯 Assertions & Failure Messages

```python
# pytest rewrites assert for detailed failure messages
def test_example():
    result = [1, 2, 3]
    assert 4 in result               # will show: AssertionError: assert 4 in [1, 2, 3]
    assert len(result) == 3
    assert result[0] == 1

# Custom message
assert x > 0, f"Expected positive, got {x}"

# Compare dicts/lists
assert result == {"name": "Alice", "age": 30}
```

---

## 🚨 Testing Exceptions

```python
import pytest

def divide(a, b):
    if b == 0:
        raise ZeroDivisionError("Cannot divide by zero")
    return a / b

def test_divide_by_zero():
    with pytest.raises(ZeroDivisionError):
        divide(10, 0)

# Check message
def test_error_message():
    with pytest.raises(ZeroDivisionError, match="Cannot divide"):
        divide(10, 0)

# Capture exception info
def test_exception_info():
    with pytest.raises(ValueError) as exc_info:
        int("not a number")
    assert "invalid literal" in str(exc_info.value)
```

---

## 🔧 Fixtures

Fixtures provide reusable setup/teardown.

```python
import pytest

@pytest.fixture
def sample_user():
    """Provide a sample user dict for tests."""
    return {"name": "Alice", "age": 30, "email": "alice@example.com"}

@pytest.fixture
def db_connection():
    """Setup and teardown a DB connection."""
    conn = create_test_db()    # setup
    yield conn                  # provide to test
    conn.close()               # teardown (runs after test)

def test_user_name(sample_user):
    assert sample_user["name"] == "Alice"

def test_user_query(db_connection, sample_user):
    db_connection.insert(sample_user)
    result = db_connection.find("Alice")
    assert result["age"] == 30
```

### Fixture Scope
```python
@pytest.fixture(scope="function")  # default — new instance per test
@pytest.fixture(scope="class")     # shared per test class
@pytest.fixture(scope="module")    # shared per module
@pytest.fixture(scope="session")   # shared for entire test run
```

### conftest.py — Shared Fixtures
```python
# conftest.py — auto-discovered by pytest
# Put shared fixtures here

@pytest.fixture(scope="session")
def app():
    return create_app(testing=True)

@pytest.fixture
def client(app):
    return app.test_client()
```

---

## 📊 Parametrize — Run Test with Multiple Inputs

```python
import pytest

@pytest.mark.parametrize("a, b, expected", [
    (2, 3, 5),
    (-1, -1, -2),
    (0, 0, 0),
    (100, -50, 50),
])
def test_add(a, b, expected):
    assert add(a, b) == expected

# Single parameter
@pytest.mark.parametrize("n", [1, 2, 3, 4, 5])
def test_positive(n):
    assert n > 0
```

---

## 🎭 Mocking

Replace real dependencies with controllable fakes.

```python
from unittest.mock import Mock, MagicMock, patch, call

# Basic Mock
mock = Mock()
mock.method(1, 2)
mock.method.assert_called_once_with(1, 2)
mock.method.call_count   # 1
mock.method.return_value = "fake"
mock.method()   # "fake"

# patch — replace real object during test
from unittest.mock import patch
import requests

def get_status(url):
    response = requests.get(url)
    return response.status_code

def test_get_status():
    with patch("requests.get") as mock_get:
        mock_get.return_value.status_code = 200
        result = get_status("https://example.com")
    
    assert result == 200
    mock_get.assert_called_once_with("https://example.com")

# patch as decorator
@patch("requests.get")
def test_get_status_decorator(mock_get):
    mock_get.return_value.status_code = 404
    assert get_status("https://example.com") == 404
```

---

## 🏗️ Organizing Tests

```
my_project/
├── src/
│   └── myapp/
│       ├── __init__.py
│       ├── users.py
│       └── orders.py
└── tests/
    ├── conftest.py        ← shared fixtures
    ├── test_users.py
    ├── test_orders.py
    └── integration/
        └── test_api.py
```

---

## 🎚️ Marks & Skipping

```python
import pytest

@pytest.mark.skip(reason="Not implemented yet")
def test_future():
    ...

@pytest.mark.skipif(sys.platform == "win32", reason="Not on Windows")
def test_unix_only():
    ...

@pytest.mark.xfail(reason="Known bug")
def test_known_issue():
    ...

@pytest.mark.slow
def test_slow_operation():
    ...

# Run: pytest -m "not slow"
```

---

## ⚙️ pytest.ini / pyproject.toml

```toml
# pyproject.toml
[tool.pytest.ini_options]
testpaths = ["tests"]
python_files = ["test_*.py", "*_test.py"]
python_functions = ["test_*"]
addopts = "-v --tb=short"
markers = [
    "slow: marks tests as slow",
    "integration: integration tests",
]
```

---

## 📌 Quick Reference

```python
# Test function
def test_something():
    assert result == expected
    assert x > 0

# Exception
with pytest.raises(ErrorType, match="msg"):
    risky()

# Fixture
@pytest.fixture
def resource():
    obj = setup()
    yield obj
    teardown()

# Parametrize
@pytest.mark.parametrize("input, expected", [(1, 2), (3, 4)])
def test_fn(input, expected):
    assert transform(input) == expected

# Mock
from unittest.mock import patch, Mock
with patch("module.func") as mock_fn:
    mock_fn.return_value = "fake"
    ...
```


---

[← Previous: Type Hints & Dataclasses](20-type-hints.md) | [Contents](README.md) | [Next: Database →](22-database.md)
