# 16 – Testing

## Setup

Install `pytest` as the test runner, `httpx` as the underlying HTTP client, and `pytest-asyncio` to support `async def` test functions. Run `pytest` from the project root to discover and execute all test files.

```bash
pip install pytest httpx pytest-asyncio
```

- `pytest` – test runner
- `httpx` – async-capable HTTP client (used by `TestClient`)
- `pytest-asyncio` – run async test functions

## `TestClient` – Synchronous Testing

`TestClient` wraps your FastAPI app in a synchronous WSGI-compatible interface, letting you write straightforward `requests`-style tests without running a real server.

```python
# app/main.py
from fastapi import FastAPI

app = FastAPI()

@app.get("/")
def root():
    return {"message": "Hello"}

@app.get("/items/{item_id}")
def get_item(item_id: int):
    return {"item_id": item_id}
```

```python
# tests/test_main.py
from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)

def test_root():
    response = client.get("/")
    assert response.status_code == 200
    assert response.json() == {"message": "Hello"}

def test_get_item():
    response = client.get("/items/42")
    assert response.status_code == 200
    assert response.json() == {"item_id": 42}

def test_invalid_item_id():
    response = client.get("/items/not-a-number")
    assert response.status_code == 422
```

## Testing POST with Body

Pass a Python dict to `json=` to send a JSON request body. `TestClient` serialises it automatically and sets the `Content-Type: application/json` header.

```python
def test_create_item():
    response = client.post(
        "/items",
        json={"name": "Widget", "price": 9.99}
    )
    assert response.status_code == 201
    data = response.json()
    assert data["name"] == "Widget"
```

## Testing with Headers

Supply a `headers` dict to any `TestClient` method to add request headers. Use this to simulate authenticated requests by including an `Authorization` header.

```python
def test_protected_route():
    response = client.get(
        "/protected",
        headers={"Authorization": "Bearer valid-token"}
    )
    assert response.status_code == 200

def test_unauthorized():
    response = client.get("/protected")
    assert response.status_code == 401
```

## Using Fixtures (pytest)

A `@pytest.fixture` function runs before each test that requests it. Wrap `TestClient` in a fixture so every test function gets a fresh, cleanly initialised client.

```python
import pytest
from fastapi.testclient import TestClient
from app.main import app

@pytest.fixture
def client():
    return TestClient(app)

def test_root(client):
    response = client.get("/")
    assert response.status_code == 200
```

## Overriding Dependencies

Replace production dependencies (DB, auth) with test versions:

```python
# app/main.py
from app.dependencies import get_db
from app.main import app

# tests/conftest.py
import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from app.db.session import Base
from app.dependencies import get_db
from app.main import app

TEST_DATABASE_URL = "sqlite:///./test.db"
test_engine = create_engine(TEST_DATABASE_URL, connect_args={"check_same_thread": False})
TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=test_engine)

@pytest.fixture(scope="session", autouse=True)
def setup_db():
    Base.metadata.create_all(bind=test_engine)
    yield
    Base.metadata.drop_all(bind=test_engine)

@pytest.fixture
def db_session():
    session = TestingSessionLocal()
    try:
        yield session
    finally:
        session.close()

@pytest.fixture
def client(db_session):
    def override_get_db():
        try:
            yield db_session
        finally:
            pass

    app.dependency_overrides[get_db] = override_get_db
    with TestClient(app) as c:
        yield c
    app.dependency_overrides.clear()
```

## Async Testing with `pytest-asyncio`

Configure `asyncio_mode = auto` in `pytest.ini` so pytest-asyncio applies to all async tests. Use `httpx.AsyncClient` with `app=app` to send requests to the ASGI app without starting a real server.

```python
# pytest.ini or pyproject.toml
[pytest]
asyncio_mode = auto
```

```python
import pytest
import httpx
from app.main import app

@pytest.mark.asyncio
async def test_async_endpoint():
    async with httpx.AsyncClient(app=app, base_url="http://test") as ac:
        response = await ac.get("/")
    assert response.status_code == 200
```

## Mocking External Services

Use `unittest.mock.patch` to replace external service calls with controlled fakes during tests. For async functions, use `AsyncMock` as the replacement so the mock is properly awaitable.

```python
from unittest.mock import patch, AsyncMock

def test_send_email():
    with patch("app.services.email.send_email") as mock_send:
        mock_send.return_value = True
        response = client.post("/register", json={"email": "test@example.com"})
        assert response.status_code == 201
        mock_send.assert_called_once_with("test@example.com")

# For async mocks:
async def test_async_service():
    with patch("app.services.external.fetch_data", new_callable=AsyncMock) as mock_fetch:
        mock_fetch.return_value = {"data": "value"}
        response = await async_client.get("/data")
        assert response.json() == {"data": "value"}
```

## Testing File Uploads

Pass a `files` dict to `TestClient.post()` where each value is a tuple of `(filename, content, content_type)`. This replicates a multipart file upload without needing a real file on disk.

```python
def test_upload_file():
    file_content = b"fake image content"
    response = client.post(
        "/upload",
        files={"file": ("test.jpg", file_content, "image/jpeg")}
    )
    assert response.status_code == 200
    assert response.json()["filename"] == "test.jpg"
```

## Testing WebSockets

Use `client.websocket_connect("/path")` as a context manager to open a test WebSocket connection. The resulting object supports `send_text()`, `receive_text()`, and their JSON equivalents.

```python
def test_websocket():
    with client.websocket_connect("/ws") as ws:
        ws.send_text("Hello")
        data = ws.receive_text()
        assert data == "Echo: Hello"
```

## Test Structure

Organise tests in a `tests/` directory with one file per router. Put shared fixtures in `conftest.py` — pytest discovers it automatically and makes its fixtures available to all test files in the same directory.

```
tests/
├── conftest.py           # shared fixtures
├── test_users.py
├── test_items.py
├── test_auth.py
└── test_websockets.py
```

### conftest.py pattern

```python
# tests/conftest.py
import pytest
from fastapi.testclient import TestClient
from app.main import app

@pytest.fixture(scope="module")
def client():
    with TestClient(app) as c:
        yield c

@pytest.fixture
def auth_header():
    # Get a real token or return a fake one if overriding auth
    return {"Authorization": "Bearer test-token"}
```

## Running Tests

These `pytest` command-line flags cover the most common test-running scenarios. Add `--cov=app` with `pytest-cov` installed to generate a coverage report alongside the test results.

```bash
# Run all tests
pytest

# Verbose output
pytest -v

# Run a specific file
pytest tests/test_users.py

# Run a specific test
pytest tests/test_users.py::test_create_user

# Show print output
pytest -s

# With coverage (pip install pytest-cov)
pytest --cov=app --cov-report=html
```

## Example: Full User CRUD Test

This test suite walks through the full lifecycle of the user resource: create, attempt duplicate, read, and read-nonexistent. It demonstrates how to chain requests and carry IDs between test calls.

```python
# tests/test_users.py

def test_create_user(client):
    response = client.post("/users", json={
        "email": "alice@example.com",
        "username": "alice",
        "password": "secret123"
    })
    assert response.status_code == 201
    data = response.json()
    assert data["email"] == "alice@example.com"
    assert "password" not in data   # never return password

def test_create_duplicate_user(client):
    client.post("/users", json={"email": "bob@example.com", "username": "bob", "password": "pw"})
    response = client.post("/users", json={"email": "bob@example.com", "username": "bob2", "password": "pw"})
    assert response.status_code == 400

def test_get_user(client):
    create = client.post("/users", json={"email": "carol@example.com", "username": "carol", "password": "pw"})
    user_id = create.json()["id"]
    response = client.get(f"/users/{user_id}")
    assert response.status_code == 200
    assert response.json()["username"] == "carol"

def test_get_nonexistent_user(client):
    response = client.get("/users/99999")
    assert response.status_code == 404
```

## Summary

- Use `TestClient` from fastapi for fast synchronous tests
- Override dependencies with `app.dependency_overrides[get_db] = override_fn`
- Use `conftest.py` for shared fixtures: test client, DB session
- Use `pytest-asyncio` + `httpx.AsyncClient` for async endpoint tests
- Mock external services with `unittest.mock.patch`
- Test file uploads with the `files=` parameter in `client.post()`
- Test WebSockets with `with client.websocket_connect(...):`

---

[← Previous: Error Handling](15-error-handling.md) | [Contents](README.md) | [Next: Deployment →](17-deployment.md)
