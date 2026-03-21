# 12: Iterators & Generators

## 🔄 Iterables vs Iterators

```
Iterable  — can be looped over (has __iter__)
Iterator  — the thing that produces values one by one (has __iter__ + __next__)

Iterable → iter(iterable) → Iterator → next() → values
```

```python
# Iterables: list, tuple, str, dict, set, range, file
fruits = ["apple", "banana", "cherry"]

# Get an iterator from an iterable
it = iter(fruits)

next(it)   # "apple"
next(it)   # "banana"
next(it)   # "cherry"
next(it)   # StopIteration exception — signals exhaustion

# for loops do this automatically
for fruit in fruits:
    print(fruit)
```

---

## ♻️ Custom Iterator (Class-Based)

```python
class Countdown:
    def __init__(self, start):
        self.current = start

    def __iter__(self):
        return self   # the object is its own iterator

    def __next__(self):
        if self.current < 0:
            raise StopIteration
        value = self.current
        self.current -= 1
        return value

for n in Countdown(5):
    print(n)   # 5, 4, 3, 2, 1, 0
```

---

## ⚡ Generators — Simpler Iterators

A **generator function** uses `yield` instead of `return`. It creates an iterator automatically.

```python
# Generator function
def countdown(start):
    while start >= 0:
        yield start   # pauses here and gives value to caller
        start -= 1

# Use it like any iterator
for n in countdown(5):
    print(n)   # 5, 4, 3, 2, 1, 0

# Get a generator object
gen = countdown(3)
next(gen)   # 3
next(gen)   # 2
next(gen)   # 1
next(gen)   # 0
next(gen)   # StopIteration
```

### How yield Works
```
Call countdown(5)
→ Returns generator object (code NOT run yet)
→ next() is called
→ Code runs until yield
→ Value yielded, function PAUSED
→ next() called again
→ Code resumes from after yield
→ ... until function returns or runs out of yield
```

---

## 🎯 Practical Generator Examples

```python
# Infinite counter (never runs out!)
def integers_from(n):
    while True:
        yield n
        n += 1

gen = integers_from(0)
[next(gen) for _ in range(5)]   # [0, 1, 2, 3, 4]

# Read large file line by line (memory efficient)
def read_large_file(path):
    with open(path) as f:
        for line in f:
            yield line.strip()

for line in read_large_file("huge_log.txt"):
    process(line)   # only one line in memory at a time

# Pipeline: chain generators
def numbers():
    yield from range(1, 11)   # yield from delegates to another iterable

def squared(nums):
    for n in nums:
        yield n ** 2

def only_even(nums):
    for n in nums:
        if n % 2 == 0:
            yield n

# Compose the pipeline
pipeline = only_even(squared(numbers()))
list(pipeline)   # [4, 16, 36, 64, 100]
```

---

## 🔗 yield from

Delegates to another generator (Python 3.3+).

```python
def flatten(nested):
    for item in nested:
        if isinstance(item, list):
            yield from flatten(item)   # delegate recursively
        else:
            yield item

list(flatten([1, [2, [3, 4], 5], 6]))
# [1, 2, 3, 4, 5, 6]
```

---

## 📨 Generator send() and throw()

Generators can receive values — they become coroutines.

```python
def accumulator():
    total = 0
    while True:
        value = yield total   # yield current total, receive new value
        if value is None:
            break
        total += value

gen = accumulator()
next(gen)            # 0  — prime the generator
gen.send(10)         # 10
gen.send(20)         # 30
gen.send(5)          # 35
gen.close()          # stop
```

---

## 🛠️ itertools — Iterator Toolkit

```python
import itertools

# Infinite iterators
itertools.count(start=0, step=1)    # 0, 1, 2, 3, ...
itertools.cycle([1, 2, 3])          # 1, 2, 3, 1, 2, 3, ...
itertools.repeat("x", times=3)     # "x", "x", "x"

# Combining iterators
itertools.chain([1,2], [3,4], [5])  # 1,2,3,4,5
itertools.chain.from_iterable([[1,2],[3,4]])  # same

# Slicing
itertools.islice(gen, 5)            # first 5 items from generator
itertools.islice(gen, 2, 8)         # items 2-7

# Combinations
itertools.product([1,2], ["a","b"])   # (1,'a'),(1,'b'),(2,'a'),(2,'b')
itertools.permutations([1,2,3], 2)    # (1,2),(1,3),(2,1),(2,3),(3,1),(3,2)
itertools.combinations([1,2,3], 2)    # (1,2),(1,3),(2,3)

# Grouping
data = [("A", 1), ("A", 2), ("B", 3), ("B", 4)]
for key, group in itertools.groupby(data, key=lambda x: x[0]):
    print(key, list(group))
# A [('A',1),('A',2)]
# B [('B',3),('B',4)]

# Filtering
itertools.filterfalse(lambda x: x%2, range(10))  # 1,3,5,7,9
itertools.takewhile(lambda x: x < 5, range(10))  # 0,1,2,3,4
itertools.dropwhile(lambda x: x < 5, range(10))  # 5,6,7,8,9

# Accumulate (running totals)
import itertools
list(itertools.accumulate([1,2,3,4,5]))         # [1,3,6,10,15]
list(itertools.accumulate([1,2,3,4], max))      # [1,2,3,4]
```

---

## 📊 Memory: Generator vs List

```python
import sys

# List — all in memory
lst = [x**2 for x in range(10000)]
sys.getsizeof(lst)   # ~85 KB

# Generator — constant memory
gen = (x**2 for x in range(10000))
sys.getsizeof(gen)   # ~112 bytes (just the generator object!)
```

---

## 📌 Quick Reference

```python
# Generator function
def gen_func():
    yield value
    yield from other_iterable

# Generator expression
gen = (x**2 for x in range(10))

# Iteration protocol
iter(obj)    # get iterator
next(it)     # get next value

# itertools essentials
itertools.chain(*iterables)
itertools.islice(it, n)
itertools.product(*iterables)
itertools.combinations(it, r)
itertools.groupby(it, key)
itertools.accumulate(it)
```


---

[← Previous: Comprehensions](11-comprehensions.md) | [Contents](README.md) | [Next: Decorators →](13-decorators.md)
