# 13: Decorators

## 🎭 What are Decorators?

A decorator is a function that **wraps another function** to add behavior without modifying it. Python's `@` syntax is shorthand for `func = decorator(func)`.

```python
# What @ does under the hood:
def my_decorator(func):
    def wrapper(*args, **kwargs):
        print("Before")
        result = func(*args, **kwargs)
        print("After")
        return result
    return wrapper

# Using @ syntax (syntactic sugar)
@my_decorator
def say_hello():
    print("Hello!")

# Equivalent to:
# say_hello = my_decorator(say_hello)

say_hello()
# Before
# Hello!
# After
```

---

## 🔧 Decorator Anatomy

```python
import functools

def decorator(func):
    @functools.wraps(func)   # preserves func's name, docstring, etc.
    def wrapper(*args, **kwargs):
        # Code before
        result = func(*args, **kwargs)
        # Code after
        return result
    return wrapper
```

> Always use `@functools.wraps(func)` — without it, the wrapped function loses its metadata (`__name__`, `__doc__`).

---

## 🎯 Common Decorator Use Cases

### Timing
```python
import functools
import time

def timer(func):
    @functools.wraps(func)
    def wrapper(*args, **kwargs):
        start = time.perf_counter()
        result = func(*args, **kwargs)
        end = time.perf_counter()
        print(f"{func.__name__} took {end - start:.4f}s")
        return result
    return wrapper

@timer
def slow_function():
    time.sleep(1)

slow_function()   # slow_function took 1.0012s
```

### Logging
```python
import functools
import logging

def log_calls(func):
    @functools.wraps(func)
    def wrapper(*args, **kwargs):
        logging.info(f"Calling {func.__name__} with {args}, {kwargs}")
        result = func(*args, **kwargs)
        logging.info(f"{func.__name__} returned {result!r}")
        return result
    return wrapper

@log_calls
def add(a, b):
    return a + b
```

### Retry
```python
import functools
import time

def retry(times=3, delay=1.0, exceptions=(Exception,)):
    def decorator(func):
        @functools.wraps(func)
        def wrapper(*args, **kwargs):
            last_error = None
            for attempt in range(times):
                try:
                    return func(*args, **kwargs)
                except exceptions as e:
                    last_error = e
                    if attempt < times - 1:
                        time.sleep(delay)
            raise last_error
        return wrapper
    return decorator

@retry(times=3, delay=0.5, exceptions=(ConnectionError,))
def fetch_data(url):
    ...
```

### Caching
```python
from functools import lru_cache, cache

# cache (Python 3.9+) — unlimited size
@cache
def fib(n):
    if n < 2:
        return n
    return fib(n-1) + fib(n-2)

# lru_cache — limited size (LRU eviction)
@lru_cache(maxsize=128)
def expensive_query(param):
    return db.fetch(param)

fib.__wrapped__   # original function
fib.cache_info()  # CacheInfo(hits=..., misses=..., ...)
fib.cache_clear() # clear the cache
```

### Validation
```python
def validate_positive(*arg_names):
    def decorator(func):
        @functools.wraps(func)
        def wrapper(*args, **kwargs):
            # Inspect positional args by position
            for name, val in zip(arg_names, args):
                if val < 0:
                    raise ValueError(f"{name} must be positive, got {val}")
            return func(*args, **kwargs)
        return wrapper
    return decorator

@validate_positive("width", "height")
def create_rect(width, height):
    return {"w": width, "h": height}

create_rect(-1, 5)   # ValueError: width must be positive, got -1
```

---

## 🏗️ Decorators with Arguments

To accept arguments, you need an **extra wrapper layer**.

```python
def repeat(n):           # ← takes decorator argument
    def decorator(func): # ← takes function
        @functools.wraps(func)
        def wrapper(*args, **kwargs):  # ← takes function arguments
            for _ in range(n):
                result = func(*args, **kwargs)
            return result
        return wrapper
    return decorator

@repeat(3)
def say_hi():
    print("Hi!")

say_hi()
# Hi!
# Hi!
# Hi!
```

---

## 🔗 Stacking Decorators

```python
@decorator_a
@decorator_b
@decorator_c
def func():
    pass

# Applied from bottom to top:
# func = decorator_a(decorator_b(decorator_c(func)))
```

---

## 🏛️ Class-Based Decorators

```python
class Memoize:
    def __init__(self, func):
        self.func = func
        self.cache = {}
        functools.update_wrapper(self, func)

    def __call__(self, *args):
        if args not in self.cache:
            self.cache[args] = self.func(*args)
        return self.cache[args]

@Memoize
def slow_square(n):
    time.sleep(1)
    return n ** 2

slow_square(5)   # 25 (takes 1s)
slow_square(5)   # 25 (instant — from cache)
```

---

## 🔧 Class Decorators

Decorators can also decorate **classes**:

```python
def singleton(cls):
    """Ensure only one instance of a class exists."""
    instances = {}
    @functools.wraps(cls)
    def get_instance(*args, **kwargs):
        if cls not in instances:
            instances[cls] = cls(*args, **kwargs)
        return instances[cls]
    return get_instance

@singleton
class DatabaseConnection:
    def __init__(self, url):
        self.url = url

db1 = DatabaseConnection("localhost")
db2 = DatabaseConnection("localhost")
db1 is db2   # True
```

---

## 📌 Quick Reference

```python
# Basic decorator
def my_dec(func):
    @functools.wraps(func)
    def wrapper(*args, **kwargs):
        # before
        result = func(*args, **kwargs)
        # after
        return result
    return wrapper

@my_dec
def func(): ...

# Decorator with arguments
def my_dec(arg):
    def decorator(func):
        @functools.wraps(func)
        def wrapper(*args, **kwargs):
            return func(*args, **kwargs)
        return wrapper
    return decorator

@my_dec(arg)
def func(): ...

# Built-ins
@functools.lru_cache(maxsize=128)
@functools.cache             # Python 3.9+
@staticmethod
@classmethod
@property
```


---

[← Previous: Iterators & Generators](12-iterators-and-generators.md) | [Contents](README.md) | [Next: Context Managers →](14-context-managers.md)
