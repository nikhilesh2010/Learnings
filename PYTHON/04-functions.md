# 04: Functions

A **function** is a named, reusable block of code that performs a specific task. You define it once and call it as many times as you need. Functions help you avoid repetition (DRY principle), break programs into logical pieces, and make code easier to test and understand.

In Python, functions are **first-class objects** — they can be passed as arguments to other functions, stored in variables, and returned from other functions, just like any other value.

## 🔧 Defining Functions

You define a function with the `def` keyword, give it a name, specify parameters in parentheses, and write the body indented below. The `return` statement sends a value back to the caller. If a function has no `return` statement (or has `return` with nothing after it), it automatically returns `None`.

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

Parameters are the variable names listed in the function definition. Arguments are the actual values passed when calling the function. Python supports several kinds of parameters:

### Default Parameters
You can give a parameter a **default value**. If the caller doesn't supply that argument, the default is used. Default parameters must always come **after** required (non-default) parameters in the function signature.

```python
def greet(name, greeting="Hello"):
    return f"{greeting}, {name}!"

greet("Alice")           # Hello, Alice!
greet("Bob", "Hi")       # Hi, Bob!
greet("Carol", greeting="Hey")  # Hey, Carol!
```
> Default parameters must come **after** required ones.

### *args — Variable Positional Arguments
`*args` lets a function accept **any number of positional arguments**. All extra positional arguments are collected into a **tuple** named `args` (the `*` is what matters; `args` is just convention). Use this when you don't know in advance how many values will be passed.

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
`**kwargs` lets a function accept **any number of keyword arguments** (i.e., `name=value` style). All extra keyword arguments are collected into a **dictionary** named `kwargs`. Use this when you want to accept arbitrary named options.

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
When a function uses multiple parameter types, they must appear in a strict order: `required → defaults → *args → keyword-only → **kwargs`. A bare `*` in the signature forces all parameters after it to be passed by keyword only (not by position).

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

The `return` statement exits the function and sends a value back to the caller. Python functions can return multiple values by returning a tuple — Python automatically packs them into a tuple and you can unpack them on the other side.

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

A **lambda** is a small, anonymous (nameless) function written in a single expression. It's not meant to replace regular functions — use it only for simple, short operations that are passed as arguments (e.g., as the `key` in `sorted()`). For anything more complex, write a regular `def` function.

**Syntax: `lambda arguments: expression`** (no `return` needed — the expression IS the return value)

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

You can unpack a list or tuple into positional arguments using `*`, and unpack a dictionary into keyword arguments using `**`. This is the reverse of `*args`/`**kwargs` — it expands collected values back out when calling a function.

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

A **closure** is a function that **remembers the variables** from the enclosing scope where it was created, even after that outer function has finished running. In Python, you use `nonlocal` to tell the inner function that a variable belongs to the enclosing (not local) scope so it can modify it.

Closures are the foundation for factories (functions that create and return customized functions) and are also how decorators work internally.

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

**Recursion** is when a function calls itself. Every recursive function needs two parts:
1. A **base case** — the condition where the function stops calling itself and returns a direct value.
2. A **recursive case** — where the function calls itself with a smaller/simpler version of the problem.

Without a base case, the function would call itself forever (stack overflow). Python's default recursion limit is 1000 calls deep. Deep recursion (like a naive Fibonacci that recalculates the same values over and over) is slow; using `@lru_cache` (memoization) stores already-computed results and avoids redundant calls.

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

In Python, functions are **first-class objects**, which means:
- A function can be assigned to a variable
- A function can be passed as an argument to another function
- A function can be returned from another function
- Functions can be stored in lists, dicts, and other data structures

This is the foundation of **higher-order functions** (functions that take or return other functions), which enables functional programming patterns like `map`, `filter`, decorators, and callbacks.

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

A concise cheatsheet of Python's core function features: defining, calling with various argument types, lambdas, closures, and type hints.

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
