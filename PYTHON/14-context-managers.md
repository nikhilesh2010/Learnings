# 14: Context Managers

## 🔑 What are Context Managers?

A context manager lets you run setup and teardown code around a block, guaranteeing cleanup even if an exception occurs.

```python
# The 'with' statement uses context managers
with open("file.txt") as f:
    data = f.read()
# file is automatically closed here, even if an exception occurred

# Without context manager (error-prone)
f = open("file.txt")
try:
    data = f.read()
finally:
    f.close()   # have to remember this!
```

---

## 🏛️ Class-Based Context Managers

Implement `__enter__` and `__exit__`.

```python
class Timer:
    import time

    def __enter__(self):
        self.start = time.perf_counter()
        return self   # value assigned to 'as' variable

    def __exit__(self, exc_type, exc_val, exc_tb):
        self.elapsed = time.perf_counter() - self.start
        print(f"Elapsed: {self.elapsed:.4f}s")
        return False  # False = don't suppress exceptions
                      # True  = suppress exceptions

with Timer() as t:
    time.sleep(0.5)
# Elapsed: 0.5001s

print(t.elapsed)   # 0.5001
```

### __exit__ Parameters
```python
def __exit__(self, exc_type, exc_val, exc_tb):
    # exc_type  — exception class (None if no exception)
    # exc_val   — exception instance
    # exc_tb    — traceback object
    
    if exc_type is ValueError:
        print(f"Suppressing ValueError: {exc_val}")
        return True   # suppress this exception
    return False      # let other exceptions propagate
```

---

## ⚡ contextlib — Generator-Based (Simpler!)

The `@contextmanager` decorator lets you write a context manager as a simple generator function instead of a class with `__enter__`/`__exit__` methods. The code before `yield` is the setup phase; the code in the `finally` block is the teardown. This is the most concise way to create custom context managers.

```python
from contextlib import contextmanager

@contextmanager
def timer():
    import time
    start = time.perf_counter()
    try:
        yield   # code in the 'with' block runs here
    finally:
        elapsed = time.perf_counter() - start
        print(f"Elapsed: {elapsed:.4f}s")

with timer():
    time.sleep(0.5)
# Elapsed: 0.5001s

# With a value
@contextmanager
def managed_resource(name):
    resource = acquire(name)   # setup
    try:
        yield resource          # provide to 'as' variable
    finally:
        release(resource)       # cleanup

with managed_resource("db_conn") as conn:
    conn.query(...)
```

---

## 🔧 Practical Context Managers

### Database Transaction
```python
from contextlib import contextmanager

@contextmanager
def transaction(db):
    """Automatically commit or rollback a DB transaction."""
    try:
        yield db
        db.commit()
    except Exception:
        db.rollback()
        raise

with transaction(db) as conn:
    conn.execute("INSERT INTO users ...")
    conn.execute("UPDATE stats ...")
# auto-committed on success, rolled back on error
```

### Temporary Directory
```python
import tempfile
import shutil
from contextlib import contextmanager

@contextmanager
def temp_directory():
    """Create a temp dir and clean it up automatically."""
    tmpdir = tempfile.mkdtemp()
    try:
        yield tmpdir
    finally:
        shutil.rmtree(tmpdir, ignore_errors=True)

with temp_directory() as tmpdir:
    # do work in tmpdir
    pass
# tmpdir automatically deleted
```

### Suppress Exceptions
```python
from contextlib import suppress

# Instead of:
try:
    os.remove("file.txt")
except FileNotFoundError:
    pass

# Write:
with suppress(FileNotFoundError):
    os.remove("file.txt")
```

### Redirect Output
```python
from contextlib import redirect_stdout, redirect_stderr
import io

# Capture stdout
buffer = io.StringIO()
with redirect_stdout(buffer):
    print("This goes to buffer, not terminal")

output = buffer.getvalue()
print(f"Captured: {output!r}")
```

### nullcontext (Python 3.7+)
```python
from contextlib import nullcontext

def process(data, lock=None):
    ctx = lock if lock is not None else nullcontext()
    with ctx:
        # Works both with and without a lock
        transform(data)
```

---

## 🔗 Multiple Context Managers

Multiple context managers can be combined on a single `with` line, which is cleaner than nesting. For a **dynamic** number of context managers (e.g., opening files from a list), use `contextlib.ExitStack` — it registers each manager at runtime and ensures all are closed properly even if one raises.

```python
# Multiple on same line (preferred)
with open("input.txt") as fin, open("output.txt", "w") as fout:
    fout.write(fin.read().upper())

# ExitStack — dynamic number of context managers
from contextlib import ExitStack

files = ["a.txt", "b.txt", "c.txt"]
with ExitStack() as stack:
    handles = [stack.enter_context(open(f)) for f in files]
    for h in handles:
        print(h.read())
# all files closed when ExitStack exits
```

---

## 📌 Built-in Context Managers

| Object | Provides |
|--------|----------|
| `open(file)` | File handle, auto-closes |
| `threading.Lock()` | Thread lock, auto-releases |
| `unittest.mock.patch()` | Monkey-patch, auto-restores |
| `tempfile.TemporaryDirectory()` | Temp dir, auto-deletes |
| `contextlib.suppress(exc)` | Suppress specific exception |
| `contextlib.redirect_stdout(f)` | Redirect stdout |
| `decimal.localcontext()` | Local decimal context |

---

## 📌 Quick Reference

A concise cheatsheet of context manager syntax (class-based and generator-based) and the most useful `contextlib` utilities.

```python
# Class-based
class MyCtx:
    def __enter__(self):
        # setup
        return self   # or value for 'as'

    def __exit__(self, exc_type, exc_val, exc_tb):
        # cleanup
        return False  # True to suppress exception

# Function-based (simpler)
from contextlib import contextmanager

@contextmanager
def my_ctx():
    # setup
    try:
        yield value    # code in 'with' runs here
    finally:
        # cleanup

# Use
with my_ctx() as val:
    ...

# Suppress
from contextlib import suppress
with suppress(KeyError, ValueError):
    ...
```


---

[← Previous: Decorators](13-decorators.md) | [Contents](README.md) | [Next: Functional Programming →](15-functional-programming.md)
