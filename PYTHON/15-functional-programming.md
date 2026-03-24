# 15: Functional Programming

## 🧮 What is Functional Programming?

Functional programming treats computation as the evaluation of **pure functions** — avoiding shared state and mutation.

| Principle | Meaning |
|-----------|---------|
| **Pure functions** | Same input → same output, no side effects |
| **Immutability** | Don't modify data; create new versions |
| **First-class functions** | Functions as values — pass, return, store |
| **Higher-order functions** | Functions that take/return functions |

---

## 🗺️ map()

Apply a function to every item in an iterable.

```python
# map(function, iterable) → iterator
numbers = [1, 2, 3, 4, 5]

squares = list(map(lambda x: x**2, numbers))
# [1, 4, 9, 16, 25]

strings = list(map(str, numbers))
# ["1", "2", "3", "4", "5"]

# Map over multiple iterables
a = [1, 2, 3]
b = [10, 20, 30]
sums = list(map(lambda x, y: x + y, a, b))
# [11, 22, 33]

# Modern Python: list comprehensions are usually preferred
squares = [x**2 for x in numbers]   # clearer
```

---

## 🔍 filter()

Keep only items for which the function returns True.

```python
# filter(function, iterable) → iterator
numbers = [1, -2, 3, -4, 5, -6]

positives = list(filter(lambda x: x > 0, numbers))
# [1, 3, 5]

# filter(None, iterable) removes falsy values
mixed = [0, 1, "", "hi", None, [], [1, 2]]
truthy = list(filter(None, mixed))
# [1, "hi", [1, 2]]

# Equivalent comprehension (often preferred)
positives = [x for x in numbers if x > 0]
```

---

## 🔽 functools.reduce()

Reduce an iterable to a single value by applying a function cumulatively.

```python
from functools import reduce

# reduce(function, iterable, initial?)
numbers = [1, 2, 3, 4, 5]

total   = reduce(lambda acc, x: acc + x, numbers)         # 15
product = reduce(lambda acc, x: acc * x, numbers)         # 120
maximum = reduce(lambda acc, x: acc if acc > x else x, numbers)  # 5

# With initial value
reduce(lambda acc, x: acc + x, numbers, 100)   # 115

# Flatten
nested = [[1,2],[3,4],[5,6]]
flat = reduce(lambda acc, x: acc + x, nested, [])
# [1, 2, 3, 4, 5, 6]
```

---

## ⚙️ functools Module

`functools` provides higher-order function utilities. `partial()` pre-fills arguments to create specialised versions of a function. `lru_cache` / `cache` memoize (cache) results of pure functions, transforming exponential recursion into linear work. `reduce()` accumulates a sequence to a single value using a binary function.

```python
from functools import partial, reduce, wraps, lru_cache, cache

# partial — pre-fill some arguments
from functools import partial

def power(base, exp):
    return base ** exp

square = partial(power, exp=2)
cube   = partial(power, exp=3)

square(5)   # 25
cube(3)     # 27

# Real-world: pre-configured function calls
import json
pretty_print = partial(json.dumps, indent=2, sort_keys=True)
print(pretty_print({"b": 2, "a": 1}))

# partial with positional args
multiply = lambda x, y: x * y
double   = partial(multiply, 2)
double(5)   # 10

# reduce
from functools import reduce
reduce(lambda a, b: a + b, [1,2,3,4,5])   # 15

# lru_cache
from functools import lru_cache
@lru_cache(maxsize=128)
def fib(n):
    return n if n < 2 else fib(n-1) + fib(n-2)
```

---

## 🔗 Function Composition

Function composition creates a new function that applies two or more functions in sequence: `compose(f, g)(x)` equals `f(g(x))`. Python has no built-in composition operator, but it's easy to implement with `functools.reduce` and a two-argument `compose` helper.

```python
# Compose two functions: compose(f, g)(x) = f(g(x))
def compose(f, g):
    return lambda x: f(g(x))

add_one  = lambda x: x + 1
double   = lambda x: x * 2

add_then_double = compose(double, add_one)
add_then_double(3)   # double(add_one(3)) = double(4) = 8

# Compose many functions
from functools import reduce

def compose_many(*funcs):
    """Apply functions right-to-left."""
    return reduce(compose, funcs)

pipeline = compose_many(str, abs, lambda x: x - 10)
pipeline(3)   # str(abs(3 - 10)) = str(7) = "7"
```

---

## 🔒 Pure Functions

A pure function always returns the same output for the same input and has **no side effects** — it doesn't modify external state, write to disk, or call the network. Pure functions are trivially testable, easy to reason about, safe to parallelise, and safe to memoize.

```python
# Pure function — same input, same output, no side effects
def add(a, b):
    return a + b

# Impure — depends on external state
total = 0
def add_to_total(x):   # side effect!
    global total
    total += x

# Impure — modifies input
def append_item(lst, item):
    lst.append(item)   # mutates the original list!

# Pure version — return new list
def append_item_pure(lst, item):
    return lst + [item]
```

---

## 🧊 Working with Immutable Data
Favour immutable data structures when possible: use tuples instead of lists, and `@dataclass(frozen=True)` for immutable value objects. Instead of modifying data in place, return a new modified copy. This prevents accidental mutation of shared state and makes your code easier to reason about.
```python
# Use tuples instead of lists when data shouldn't change
point = (3, 4)

# Create new versions instead of mutating
def move_point(p, dx, dy):
    return (p[0] + dx, p[1] + dy)   # returns new tuple

# dataclass(frozen=True) for immutable objects
from dataclasses import dataclass

@dataclass(frozen=True)
class Point:
    x: float
    y: float

p = Point(1, 2)
p.x = 3   # FrozenInstanceError!
```

---

## 🎯 operator Module

Functional versions of Python's operators — useful with map/filter/reduce.

```python
import operator

operator.add(2, 3)      # 5 (same as 2 + 3)
operator.mul(2, 3)      # 6
operator.neg(5)         # -5
operator.lt(2, 3)       # True

# itemgetter — get attribute/key by name
from operator import itemgetter, attrgetter

users = [{"name": "Alice", "age": 30}, {"name": "Bob", "age": 25}]
sorted_users = sorted(users, key=itemgetter("age"))
names = list(map(itemgetter("name"), users))   # ["Alice", "Bob"]

# attrgetter — for objects
from operator import attrgetter
sorted_objs = sorted(objects, key=attrgetter("name"))

# methodcaller
from operator import methodcaller
upper = list(map(methodcaller("upper"), ["hello", "world"]))
# ["HELLO", "WORLD"]
```

---

## 📌 Quick Reference

A concise cheatsheet of Python's functional programming tools: map, filter, reduce, partial, pure functions, and the operator module.

```python
# map / filter / reduce
list(map(func, iterable))
list(filter(pred, iterable))
from functools import reduce
reduce(func, iterable, initial)

# partial
from functools import partial
new_func = partial(func, arg1=val)

# Pure function pattern
def transform(data):
    return new_data   # don't modify input

# Comprehension vs map/filter
# Prefer comprehensions for readability
[f(x) for x in items]           # map
[x for x in items if pred(x)]   # filter

# operator
from operator import itemgetter, attrgetter
sorted(items, key=itemgetter("field"))
```


---

[← Previous: Context Managers](14-context-managers.md) | [Contents](README.md) | [Next: Async & Concurrency →](16-async-and-concurrency.md)
