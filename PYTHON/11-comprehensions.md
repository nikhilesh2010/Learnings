# 11: Comprehensions

## 🔄 List Comprehensions

A concise way to create lists. Faster than equivalent `for` loops.

```python
# Syntax: [expression for item in iterable if condition]

# Basic
squares = [x**2 for x in range(10)]
# [0, 1, 4, 9, 16, 25, 36, 49, 64, 81]

# With condition (filter)
evens = [x for x in range(20) if x % 2 == 0]
# [0, 2, 4, 6, 8, 10, 12, 14, 16, 18]

# Transform strings
words = ["hello", "world", "python"]
upper = [w.upper() for w in words]
# ["HELLO", "WORLD", "PYTHON"]

# Equivalent for loop (harder to read)
upper = []
for w in words:
    upper.append(w.upper())
```

### Nested Loops
```python
# Flatten a 2D list
matrix = [[1, 2, 3], [4, 5, 6], [7, 8, 9]]
flat = [num for row in matrix for num in row]
# [1, 2, 3, 4, 5, 6, 7, 8, 9]

# Cartesian product
pairs = [(x, y) for x in [1, 2, 3] for y in ["a", "b"]]
# [(1,'a'),(1,'b'),(2,'a'),(2,'b'),(3,'a'),(3,'b')]
```

### if/else in Expression (Different Position!)
```python
# Condition in expression (no filtering — every item included)
labels = ["even" if x % 2 == 0 else "odd" for x in range(6)]
# ["even", "odd", "even", "odd", "even", "odd"]

# Both: transform AND filter
result = [x**2 if x > 0 else 0 for x in range(-3, 4) if x != 2]
```

---

## 🗄️ Dict Comprehensions

```python
# Syntax: {key: value for item in iterable if condition}

# Basic
squares = {x: x**2 for x in range(6)}
# {0:0, 1:1, 2:4, 3:9, 4:16, 5:25}

# Swap keys and values
original = {"a": 1, "b": 2, "c": 3}
inverted = {v: k for k, v in original.items()}
# {1: "a", 2: "b", 3: "c"}

# Filter a dict
prices = {"apple": 1.5, "banana": 0.5, "cherry": 3.0}
expensive = {k: v for k, v in prices.items() if v > 1.0}
# {"apple": 1.5, "cherry": 3.0}

# Transform keys
upper_keys = {k.upper(): v for k, v in original.items()}

# Build dict from two lists
keys   = ["name", "age", "city"]
values = ["Alice", 30, "NYC"]
user   = {k: v for k, v in zip(keys, values)}
# or: dict(zip(keys, values))
```

---

## 🔵 Set Comprehensions

```python
# Syntax: {expression for item in iterable if condition}

# Unique squares
unique_remainders = {x % 3 for x in range(10)}
# {0, 1, 2}

# Unique first letters
words = ["apple", "banana", "avocado", "blueberry", "cherry"]
first_letters = {w[0] for w in words}
# {"a", "b", "c"}

# Remove duplicates while transforming
names = ["Alice", "alice", "BOB", "bob"]
normalized = {n.lower() for n in names}
# {"alice", "bob"}
```

---

## ⚡ Generator Expressions

Like list comprehensions but **lazy** — compute one item at a time. Memory efficient.

```python
# Syntax: (expression for item in iterable if condition)
# Note: parentheses, not square brackets

# Generator expression — doesn't compute until needed
gen = (x**2 for x in range(1000000))   # instant, no memory
next(gen)    # 0  — compute first item
next(gen)    # 1  — compute second item

# Pass directly to functions that accept iterables
total = sum(x**2 for x in range(1000))        # no [], efficient
any_even = any(x % 2 == 0 for x in numbers)  # short-circuits
all_pos  = all(x > 0 for x in numbers)
max_sqr  = max(x**2 for x in range(100))

# List vs generator
list_comp = [x**2 for x in range(5)]   # [0,1,4,9,16] — all in memory
gen_expr  = (x**2 for x in range(5))   # generator object — lazy
```

### When to use Generator vs List?
```python
# Use LIST when: you need to reuse results, index, or know the length
squares_list = [x**2 for x in range(1000)]
print(squares_list[5])    # needs indexing
print(len(squares_list))  # needs length

# Use GENERATOR when: single-pass, large data, piping into sum/any/max
total = sum(x**2 for x in range(1_000_000))   # constant memory!
```

---

## 🎯 Practical Examples

```python
# Parse CSV-like data
raw = ["Alice,30,NYC", "Bob,25,LA", "Carol,35,Chicago"]
people = [{"name": p[0], "age": int(p[1]), "city": p[2]}
          for line in raw
          for p in [line.split(",")]]

# Extract specific fields from list of dicts
users = [{"name": "Alice", "active": True}, {"name": "Bob", "active": False}]
active_names = [u["name"] for u in users if u["active"]]

# Count word frequencies
words = "the quick brown fox jumps over the lazy dog the".split()
freq = {w: words.count(w) for w in set(words)}

# Better (use Counter):
from collections import Counter
freq = Counter(words)

# Nested dict comprehension
matrix_dict = {i: {j: i*j for j in range(1, 4)} for i in range(1, 4)}
# {1: {1:1, 2:2, 3:3}, 2: {1:2, 2:4, 3:6}, 3: {1:3, 2:6, 3:9}}
```

---

## 📌 Quick Reference

```python
# List
[expr for x in iterable]
[expr for x in iterable if cond]
[expr_if_true if cond else expr_if_false for x in iterable]
[expr for x in outer for y in inner]   # nested

# Dict
{k: v for k, v in items}
{k: v for k, v in items if cond}

# Set
{expr for x in iterable}

# Generator (lazy)
(expr for x in iterable)
sum(x**2 for x in range(n))   # no extra ()

# Performance
# list comp > map/filter (usually)
# generator > list comp (for large or single-pass data)
```


---

[← Previous: Error Handling](10-error-handling.md) | [Contents](README.md) | [Next: Iterators & Generators →](12-iterators-and-generators.md)
