# 02: Variables & Data Types

## 📦 Variables

Variables are **names that point to values** in memory. No declaration keyword needed.

```python
# Assignment
name = "Alice"
age = 30
pi = 3.14159
is_active = True
nothing = None

# Multiple assignment
x = y = z = 0

# Tuple unpacking
a, b, c = 1, 2, 3
first, *rest = [1, 2, 3, 4, 5]   # first=1, rest=[2,3,4,5]
```

---

## 🔢 Built-in Data Types

Python ships with a rich set of built-in types covering text, numbers, booleans, sequences, mappings, and sets. Understanding which type to use — and the trade-offs between `list` (mutable, ordered) vs `tuple` (immutable), `dict` (key-value) vs `set` (unique values) — is foundational to writing Pythonic code.

```
┌────────────────────────────────────────────────┐
│              Python Data Types                  │
├─────────────┬──────────────────────────────────┤
│  Numeric    │  int, float, complex             │
│  Text       │  str                             │
│  Boolean    │  bool                            │
│  None       │  NoneType                        │
│  Sequence   │  list, tuple, range              │
│  Mapping    │  dict                            │
│  Set        │  set, frozenset                  │
│  Binary     │  bytes, bytearray, memoryview    │
└─────────────┴──────────────────────────────────┘
```

---

## 🔢 Numbers

Python's `int` type has **unlimited precision** — it grows as needed, unlike C or Java. `float` is a 64-bit IEEE 754 double. Use underscores in large literals (`1_000_000`) solely for readability. True division `/` always returns a float; floor division `//` returns an integer; `**` is exponentiation.

```python
# int — whole numbers (unlimited size!)
x = 42
y = -7
big = 1_000_000   # underscores for readability

# float — decimal numbers (64-bit)
pi = 3.14159
sci = 1.5e10      # scientific notation

# complex
z = 3 + 4j
print(z.real)   # 3.0
print(z.imag)   # 4.0

# Arithmetic operators
print(10 + 3)   # 13  — addition
print(10 - 3)   # 7   — subtraction
print(10 * 3)   # 30  — multiplication
print(10 / 3)   # 3.333... — true division (always float)
print(10 // 3)  # 3   — floor division
print(10 % 3)   # 1   — modulo
print(10 ** 3)  # 1000 — exponentiation

# Math functions (no import needed)
abs(-5)        # 5
round(3.7)     # 4
round(3.14159, 2)  # 3.14
min(1, 2, 3)   # 1
max(1, 2, 3)   # 3
sum([1, 2, 3]) # 6
```

```python
# Type conversion
int("42")       # 42
int(3.9)        # 3  (truncates, doesn't round)
float("3.14")   # 3.14
str(100)        # "100"
bool(0)         # False
bool("")        # False
bool([])        # False
bool(None)      # False
bool(1)         # True
bool("hi")      # True
```

---

## 📝 Strings

Strings are **immutable** sequences of Unicode characters. Single and double quotes are interchangeable; triple quotes allow multiline strings. f-strings (Python 3.6+) are the modern, preferred way to embed expressions in strings. Because strings are immutable, every operation returns a new string — the original is never modified. See [06-strings.md](06-strings.md) for the full reference.

```python
# String creation
s1 = 'single quotes'
s2 = "double quotes"
s3 = """triple quotes
for multiline strings"""

# f-strings (Python 3.6+) — preferred
name = "Alice"
age = 30
print(f"Hello, {name}! You are {age} years old.")
print(f"2 + 2 = {2 + 2}")         # expressions work
print(f"{name!r}")                 # 'Alice' — repr()
print(f"{pi:.2f}")                 # 3.14 — formatting
```

> See [06-strings.md](06-strings.md) for the full string reference.

---

## ✅ Booleans

Python's booleans are `True` and `False` (capitalised). Many values are **falsy** — they evaluate to `False` in a boolean context: `0`, `0.0`, `''`, `[]`, `{}`, `set()`, and `None`. This lets you write clean conditional checks like `if items:` instead of `if len(items) > 0:`. Logical operators (`and`, `or`, `not`) short-circuit and return the actual value, not just `True`/`False`.

```python
# True / False (capitalized!)
is_valid = True
is_done  = False

# bool() — falsy values
bool(0)        # False
bool(0.0)      # False
bool("")       # False
bool([])       # False
bool({})       # False
bool(None)     # False
# Everything else → True

# Comparison operators — always return bool
print(5 > 3)   # True
print(5 == 5)  # True
print(5 != 4)  # True
print(5 >= 5)  # True

# Logical operators
print(True and False)  # False
print(True or False)   # True
print(not True)        # False

# Short-circuit evaluation
x = None
y = x or "default"   # y = "default"
z = x and x.value    # z = None (safe, never calls .value)
```

---

## 🚫 None

`None` is Python's null value — the single instance of `NoneType`, representing the absence of a value. Always check for `None` using the **identity operator** `is` (not `==`), because custom objects may override `__eq__`. It's commonly used as a default argument sentinel and as the implicit return value of functions that don't return anything.

```python
# None is Python's null — represents "no value"
result = None

# Check for None — always use `is`, not ==
if result is None:
    print("No result yet")

if result is not None:
    print(result)

# Common pattern: default argument
def greet(name=None):
    if name is None:
        name = "Guest"
    return f"Hello, {name}!"
```

---

## 🔍 Type Checking

Python is dynamically typed — variables can hold any type at runtime. `type()` returns the exact type; `isinstance()` is preferred because it also matches subclasses. Type **annotations** (e.g., `x: int`) are hints for static analysis tools like `mypy`; they are never enforced at runtime.

```python
x = 42

# Check type
print(type(x))          # <class 'int'>
print(type(x).__name__) # int

# isinstance — preferred (handles inheritance)
isinstance(x, int)      # True
isinstance(x, (int, float))  # True — check multiple types
isinstance("hi", str)   # True

# Type annotations (hints only — not enforced at runtime)
def add(a: int, b: int) -> int:
    return a + b
```

---

## 🔄 Variable Scope (Preview)

Python uses the **LEGB** rule to resolve variable names: Local → Enclosing → Global → Built-in. A variable assigned inside a function is local by default. Use `global` to modify a module-level variable from inside a function; use `nonlocal` to modify a variable in the immediately enclosing (non-global) scope.

```python
x = "global"

def func():
    x = "local"       # new local variable
    print(x)          # local

func()
print(x)              # global

def modify():
    global x
    x = "modified"    # modifies the global

modify()
print(x)              # modified
```

---

## 📌 Quick Reference

A concise summary of Python's most fundamental type-checking, conversion, and identity operations.

```python
# Check type
type(x)
isinstance(x, int)

# Convert
int(x), float(x), str(x), bool(x), list(x)

# Useful constants
True, False, None

# Identity vs equality
x is y       # same object in memory
x == y       # same value

# Delete a variable
del x
```


---

[← Previous: What is Python?](01-introduction.md) | [Contents](README.md) | [Next: Control Flow →](03-control-flow.md)
