# 19 – Debugging

## Built-in Debug Mode

Enable detailed logging with Uvicorn:

```bash
uvicorn app.main:app --reload --log-level debug
```

## Using Python's `logging` Module

Configure Python's built-in `logging` at startup to output timestamped, levelled messages. Use a module-level logger (`logging.getLogger(__name__)`) in each file so log entries identify their source automatically.

```python
import logging

logging.basicConfig(
    level=logging.DEBUG,
    format="%(asctime)s [%(levelname)s] %(name)s: %(message)s",
)

logger = logging.getLogger(__name__)

@app.get("/items/{item_id}")
def get_item(item_id: int):
    logger.debug(f"Fetching item: {item_id}")
    item = ITEMS.get(item_id)
    if not item:
        logger.warning(f"Item not found: {item_id}")
        raise HTTPException(status_code=404, detail="Not found")
    logger.info(f"Returning item: {item_id}")
    return item
```

## Structured Logging with `structlog`

`structlog` emits log entries as structured key-value pairs (JSON in production, coloured text in development) instead of plain strings, making logs easily searchable and parseable in log aggregation tools.

```bash
pip install structlog
```

```python
import structlog

logger = structlog.get_logger()

@app.get("/users/{user_id}")
def get_user(user_id: int, request: Request):
    log = logger.bind(
        user_id=user_id,
        request_id=getattr(request.state, "request_id", None),
        path=str(request.url)
    )
    log.info("get_user_called")
    user = fetch_user(user_id)
    if not user:
        log.warning("user_not_found")
        raise HTTPException(404)
    log.info("user_returned")
    return user
```

## VS Code Debugger Configuration

Create `.vscode/launch.json`:

```json
{
  "version": "0.2.0",
  "configurations": [
    {
      "name": "FastAPI: Debug",
      "type": "debugpy",
      "request": "launch",
      "module": "uvicorn",
      "args": ["app.main:app", "--reload"],
      "jinja": true,
      "justMyCode": false
    }
  ]
}
```

Set breakpoints in VS Code and press F5 to start debugging.

## `print()` and `pdb` Debugging

Quick inspection during development:

```python
@app.post("/items")
def create_item(item: Item):
    print(f"DEBUG: received item = {item}")
    import pdb; pdb.set_trace()   # interactive breakpoint
    return item
```

```python
# Python 3.7+: breakpoint() is the modern equivalent
@app.post("/items")
def create_item(item: Item):
    breakpoint()    # drops into pdb
    return item
```

## Inspecting Request Data

Inject the `Request` object into any route handler to access raw request data: method, URL, headers, and body bytes. This is useful for debugging unexpected inputs or building a low-level request inspection endpoint.

```python
from fastapi import Request

@app.post("/debug-request")
async def debug_request(request: Request):
    body = await request.body()
    print(f"Method: {request.method}")
    print(f"URL: {request.url}")
    print(f"Headers: {dict(request.headers)}")
    print(f"Body: {body}")
    return {"received": True}
```

## Middleware for Request/Response Logging

A logging middleware records the method, path, status code, and duration of every request in one place. This is more maintainable than adding logging statements inside every individual handler.

```python
import time
import logging

logger = logging.getLogger("request_logger")

@app.middleware("http")
async def log_requests(request: Request, call_next):
    start = time.perf_counter()
    response = await call_next(request)
    duration = time.perf_counter() - start
    logger.info(
        f"{request.method} {request.url.path} "
        f"→ {response.status_code} ({duration:.3f}s)"
    )
    return response
```

## Common Errors and Fixes

### `422 Unprocessable Entity`

**Cause**: Request body or parameter fails Pydantic validation.

```json
{
  "detail": [
    {
      "type": "missing",
      "loc": ["body", "price"],
      "msg": "Field required"
    }
  ]
}
```

**Fix**: Check the `loc` field to find which parameter is wrong. Ensure the client sends the right types.

---

### `404 Not Found` (but route exists)

**Cause**: Wrong URL or path parameter type mismatch.

**Fix**: Verify the URL path and that the path param type matches (e.g., `int` vs `str`).

---

### `500 Internal Server Error`

**Cause**: Unhandled exception in route handler.

**Fix**: Add a global exception handler with logging:

```python
@app.exception_handler(Exception)
async def global_handler(request, exc):
    logger.error("Unhandled error", exc_info=True)
    return JSONResponse({"detail": "Server error"}, status_code=500)
```

---

### CORS Error in Browser

**Cause**: Missing or misconfigured `CORSMiddleware`.

**Fix**:

```python
from fastapi.middleware.cors import CORSMiddleware
app.add_middleware(CORSMiddleware, allow_origins=["http://localhost:3000"], ...)
```

---

### `ImportError` or `ModuleNotFoundError`

**Fix**: Ensure virtual environment is activated and package is installed:

```bash
pip install <package>
```

---

### `sqlalchemy.exc.OperationalError`

**Cause**: Wrong `DATABASE_URL`, DB not running, or missing table.

**Fix**:
- Check the connection string in `.env`
- Run `alembic upgrade head` to create tables
- Make sure the DB service is running

---

### Async Deadlock / Hanging Request

**Cause**: Using a blocking `time.sleep()` or synchronous I/O inside an `async def` handler.

**Fix**: Use `await asyncio.sleep()` or move blocking work to `def` (FastAPI threads it automatically):

```python
# BAD
async def handler():
    time.sleep(5)   # blocks event loop

# GOOD
async def handler():
    await asyncio.sleep(5)

# ALSO GOOD (sync — FastAPI threads it)
def handler():
    time.sleep(5)
```

---

### Pydantic v1 vs v2 Compatibility

Pydantic v2 has breaking changes from v1:

| v1 | v2 |
|----|-----|
| `.dict()` | `.model_dump()` |
| `.json()` | `.model_dump_json()` |
| `orm_mode = True` | `from_attributes = True` |
| `@validator` | `@field_validator` |
| `class Config:` | `model_config = {}` |

---

## Performance Profiling

```bash
pip install pyinstrument
```

```python
from pyinstrument import Profiler

@app.get("/profile-me")
async def profile_endpoint():
    profiler = Profiler()
    profiler.start()
    
    # ... run your code
    result = await some_expensive_operation()
    
    profiler.stop()
    print(profiler.output_text(unicode=True, color=True))
    return result
```

## Testing Specific Errors

```python
from fastapi.testclient import TestClient

def test_404():
    response = client.get("/items/999999")
    assert response.status_code == 404
    assert "not found" in response.json()["detail"].lower()

def test_validation_error():
    response = client.post("/items", json={"name": "Widget"})  # missing price
    assert response.status_code == 422
    errors = response.json()["detail"]
    assert any(e["loc"] == ["body", "price"] for e in errors)
```

## OpenAPI Schema Debugging

Check the auto-generated schema at `/openapi.json` to verify:
- All routes are appearing
- Request/response schemas are correct
- Required vs optional fields are accurate

```bash
curl http://localhost:8000/openapi.json | python -m json.tool
```

## Summary

- Enable `--log-level debug` in Uvicorn for development
- Use Python's `logging` module or `structlog` for structured logs
- Configure VS Code's debugpy to set breakpoints in FastAPI routes
- Use `breakpoint()` for quick interactive debugging
- Read `422` error `loc` arrays to pinpoint which field failed validation
- Use global exception handler to log 500 errors with full tracebacks
- Avoid `time.sleep()` in `async def` routes — use `asyncio.sleep()` instead
- Check `/openapi.json` to validate route and schema definitions

---

[← Previous: Best Practices](18-best-practices.md) | [Contents](README.md)
