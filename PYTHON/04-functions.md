# 04: Functions

## 🔧 Defining Functions

```python
# Basic function
def greet(name):
    """Return a greeting. (This is a docstring)"""
    return f"Hello, {name}!"

result = greet("Alice")
print(result)   # Hello, Alice!

# Function with no return → returns None
def say_hi():
    print("Hi!")

x = say_hi()    # prints "Hi!"
print(x)        # None
```

---

## 📥 Parameters

### Default Parameters
```python
def greet(name, greeting="Hello"):
    return f"{greeting}, {name}!"

greet("Alice")           # Hello, Alice!
greet("Bob", "Hi")       # Hi, Bob!
greet("Carol", greeting="Hey")  # Hey, Carol!
```
> Default parameters must come **after** required ones.

### *args — Variable Positional Arguments
```python
def add(*numbers):
    """Accept any number of arguments."""
    return sum(numbers)

add(1, 2)         # 3
add(1, 2, 3, 4)   # 10
add()             # 0

# *args is a tuple inside the function
def show(*args):
    print(type(args))   # <class 'tuple'>
    for arg in args:
        print(arg)
```

### **kwargs — Variable Keyword Arguments
```python
def describe(**info):
    """Accept any keyword arguments."""
    for key, value in info.items():
        print(f"{key}: {value}")

describe(name="Alice", age=30, city="NYC")
# name: Alice
# age: 30
# city: NYC

# **kwargs is a dict inside the function
```

### Combining All Parameter Types
```python
# Order: required, defaults, *args, keyword-only, **kwargs
def func(req, opt="default", *args, kw_only, **kwargs):
    pass

# * forces keyword-only arguments
def create_user(name, *, role="user", active=True):
    pass

create_user("Alice")                  # OK
create_user("Alice", role="admin")    # OK
create_user("Alice", "admin")         # TypeError!
```

---

## 📤 Return Values

```python
# Return a single value
def square(n):
    return n ** 2

# Return multiple values (actually a tuple)
def min_max(numbers):
    return min(numbers), max(numbers)

low, high = min_max([3, 1, 4, 1, 5])
print(low, high)   # 1 5

# Early return
def divide(a, b):
    if b == 0:
        return None   # early return
    return a / b
```

---

## 🎯 Lambda Functions

Single-expression anonymous functions.

```python
# lambda arguments: expression
square = lambda x: x ** 2
add    = lambda x, y: x + y

square(5)    # 25
add(3, 4)    # 7

# Most common use: as arguments to other functions
numbers = [3, 1, 4, 1, 5, 9, 2, 6]

sorted_nums = sorted(numbers)                         # [1, 1, 2, 3, 4, 5, 6, 9]
sorted_desc = sorted(numbers, reverse=True)           # [9, 6, 5, 4, 3, 2, 1, 1]

people = [{"name": "Alice", "age": 30}, {"name": "Bob", "age": 25}]
sorted_people = sorted(people, key=lambda p: p["age"])
```

---

## 📦 Unpacking in Function Calls

```python
def add(a, b, c):
    return a + b + c

args = [1, 2, 3]
add(*args)         # same as add(1, 2, 3)

kwargs = {"a": 1, "b": 2, "c": 3}
add(**kwargs)      # same as add(a=1, b=2, c=3)
```

---

## 🏠 Closures

A function that remembers the enclosing scope.

```python
def make_counter(start=0):
    count = start

    def counter():
        nonlocal count        # modify enclosing variable
        count += 1
        return count

    return counter

c = make_counter()
c()   # 1
c()   # 2
c()   # 3

# Each closure has its own state
c1 = make_counter()
c2 = make_counter(10)
c1()   # 1
c2()   # 11
```

---

## 🔁 Recursion

```python
# Factorial
def factorial(n):
    if n <= 1:          # base case
        return 1
    return n * factorial(n - 1)  # recursive case

factorial(5)   # 120

# Fibonacci
def fib(n):
    if n <= 1:
        return n
    return fib(n - 1) + fib(n - 2)

# With memoization (much faster)
from functools import lru_cache

@lru_cache(maxsize=None)
def fib(n):
    if n <= 1:
        return n
    return fib(n - 1) + fib(n - 2)
```

> Python's default recursion limit is 1000. Use `sys.setrecursionlimit()` to change it.

---

## 🔑 First-Class Functions

Functions are objects — they can be passed, stored, and returned.

```python
def apply(func, value):
    return func(value)

apply(str.upper, "hello")    # HELLO
apply(abs, -42)              # 42

# Store in a data structure
operations = {
    "double": lambda x: x * 2,
    "square": lambda x: x ** 2,
    "negate": lambda x: -x,
}

operations["double"](5)   # 10
operations["square"](4)   # 16
```

---

## 📌 Quick Reference

```python
# Define
def func(req, opt="val", *args, kw_only, **kwargs):
    return result

# Lambda
f = lambda x: x * 2

# Call
func(1, 2, *list_arg, **dict_arg)

# Closures
def outer():
    x = 0
    def inner():
        nonlocal x
        x += 1
    return inner

# Type hints
def add(a: int, b: int) -> int:
    return a + b

# Docstring
def func():
    """One-line summary.
    
    Longer description.
    """
```


---

[← Previous: Control Flow](03-control-flow.md) | [Contents](README.md) | [Next: Data Structures →](05-data-structures.md)
