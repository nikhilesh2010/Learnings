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
