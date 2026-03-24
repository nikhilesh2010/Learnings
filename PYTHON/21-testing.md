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

**pytest** is the de-facto standard Python testing framework. Tests are plain functions prefixed with `test_` — no class required. Install with `pip install pytest` and run with `pytest` to discover all `test_*.py` files. The `-v`, `-x`, `-k`, and `-s` flags are the most commonly used options.

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

pytest **rewrites** the standard `assert` statement to produce detailed failure messages that show the actual vs expected values. Custom `assert value, 'message'` adds context. For nested dicts and lists, pytest shows a structured diff so you can immediately see what differs.

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

Use `pytest.raises(ErrorType)` as a context manager to assert that a code block raises a specific exception. The `match='pattern'` argument asserts the error message matches a regex. Assign the context manager to a variable to inspect the exception object's attributes after the block.

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

`@pytest.mark.parametrize` runs the same test function with multiple input/output cases. Each case appears as a separate test in the report. This eliminates copy-paste test duplication and ensures consistent behaviour is verified across the full range of inputs.

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

Organise tests in a `tests/` directory mirroring the `src/` package structure. Put shared fixtures in `conftest.py` — pytest auto-discovers it. Group related tests in files named `test_<module>.py`. Separate unit, integration, and end-to-end tests in subdirectories.

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

Marks let you annotate tests with metadata. `skip` and `skipif` conditionally skip tests. `xfail` marks tests expected to fail (useful for known bugs or pending features). Custom marks (e.g., `@pytest.mark.slow`) let you run a subset with `pytest -m 'not slow'`.

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

Configure pytest behaviour in `pyproject.toml` under `[tool.pytest.ini_options]`. Set `testpaths` to restrict discovery, `addopts` for default CLI flags, and `markers` to register custom marks (which suppresses the "unknown mark" warning when you run pytest).

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

A concise cheatsheet of pytest essentials: test structure, exception testing, fixtures, parametrize, and mocking.

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
