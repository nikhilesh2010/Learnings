# 12: Iterators & Generators

## 🔄 Iterables vs Iterators

**Iterable** — Any object you can loop over (e.g., lists, strings, dicts, tuples). It has a special method `__iter__()` that returns an iterator.

**Iterator** — The object that actually does the looping. It keeps track of *where you are* in the sequence and gives you the next item every time you call `next()` on it. It has both `__iter__()` and `__next__()` methods.

**Key relationship:** You call `iter()` on an iterable to get an iterator. You then call `next()` on the iterator to get values one at a time. When the iterator runs out of items, it raises a `StopIteration` exception. Python's `for` loop does all of this automatically for you.

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

You can make your own class behave like an iterator by implementing two methods:
- `__iter__(self)`: returns the iterator object (usually `self`)
- `__next__(self)`: returns the next value, or raises `StopIteration` when done

This is useful when you want to define custom iteration logic — for example, counting down instead of up, or skipping certain values.

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

A **generator** is a special, simpler way to create an iterator without writing a full class. Instead of building all values at once and storing them in memory (like a list does), a generator **produces values one at a time, on demand**.

You write a generator using a **generator function** — a normal function that uses `yield` instead of `return`. When Python sees `yield`, it:
1. Sends the yielded value to the caller
2. **Pauses execution** of the function at that exact line and saves all its local state (variables, where it is in the loop, etc.)
3. When `next()` is called again, it **resumes from exactly where it paused**

This makes generators extremely memory-efficient — a generator that produces 1 million numbers uses almost no memory, because it only computes one number at a time.

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
The critical thing to understand is that calling a generator function does NOT run the code inside it immediately. It just creates a generator object. The code only runs when you call `next()`. Each call to `next()` runs the code up to the next `yield`, then pauses again.

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

Generators shine in real-world scenarios where you deal with large or infinite sequences. Three key use cases:
1. **Infinite sequences** — A generator can `yield` forever (e.g., an infinite counter). You just take as many values as you need.
2. **Large file processing** — Instead of loading an entire huge file into memory as a list of lines, a generator reads and yields one line at a time. This is essential for files that are gigabytes in size.
3. **Pipelines** — You can chain generators together. Each generator feeds its output into the next one as input. This is like Unix pipes — data flows through the chain one item at a time, never filling up memory.

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

`yield from` is a shortcut that lets a generator **delegate** to another iterable or generator. Instead of manually looping over a sub-iterable and yielding each item, `yield from` does it all in one line. It's especially powerful for recursive generators (like flattening nested lists), because it passes values, exceptions, and return values through correctly.

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

A generator can also **receive values** from outside, turning it into a two-way communication channel called a **coroutine**. The `send(value)` method resumes the generator AND passes a value in, which becomes the result of the `yield` expression inside the generator. This is how Python's async/await was originally built.

Note: You must call `next(gen)` first (or `gen.send(None)`) to "prime" the generator — advance it to the first `yield` before you can send values into it.

```python
def accumulator():
    total = 0
    while True:
        value = yield total   # yield current total, receive new value
        if value is None:
            break
        total += value

gen = accumulator()
next(gen)            # 0  — prime the generator (advance to first yield)
gen.send(10)         # 10
gen.send(20)         # 30
gen.send(5)          # 35
gen.close()          # stop
```

---

## 🛠️ itertools — Iterator Toolkit

The `itertools` module is Python's built-in library of iterator-building tools. All functions in `itertools` return iterators (lazy, memory-efficient), never lists. They are grouped into three categories:

- **Infinite iterators**: produce values forever — you control when to stop
- **Combining iterators**: merge or chain multiple iterables together
- **Filtering/slicing iterators**: take only parts of an iterable, or apply conditions

```python
import itertools

# Infinite iterators
itertools.count(start=0, step=1)    # 0, 1, 2, 3, ...  (infinite)
itertools.cycle([1, 2, 3])          # 1, 2, 3, 1, 2, 3, ...  (repeats forever)
itertools.repeat("x", times=3)     # "x", "x", "x"

# Combining iterators
itertools.chain([1,2], [3,4], [5])  # 1,2,3,4,5  — joins multiple iterables
itertools.chain.from_iterable([[1,2],[3,4]])  # same, but takes a list of iterables

# Slicing
itertools.islice(gen, 5)            # first 5 items from generator
itertools.islice(gen, 2, 8)         # items at index 2-7

# Combinations
itertools.product([1,2], ["a","b"])   # all combinations: (1,'a'),(1,'b'),(2,'a'),(2,'b')
itertools.permutations([1,2,3], 2)    # ordered arrangements of length 2
itertools.combinations([1,2,3], 2)    # unordered selections of length 2

# Grouping — groups consecutive items with the same key
data = [("A", 1), ("A", 2), ("B", 3), ("B", 4)]
for key, group in itertools.groupby(data, key=lambda x: x[0]):
    print(key, list(group))
# A [('A',1),('A',2)]
# B [('B',3),('B',4)]
# A [('A',1),('A',2)]
# B [('B',3),('B',4)]

# Filtering itertools functions
itertools.filterfalse(lambda x: x%2, range(10))  # items where condition is FALSE → 0,2,4,6,8
itertools.takewhile(lambda x: x < 5, range(10))  # take items as long as condition is True → 0,1,2,3,4
itertools.dropwhile(lambda x: x < 5, range(10))  # skip items while condition is True → 5,6,7,8,9

# Accumulate — like a running total (can use any binary function, not just addition)
import itertools
list(itertools.accumulate([1,2,3,4,5]))         # [1,3,6,10,15]  — running sum
list(itertools.accumulate([1,2,3,4], max))      # [1,2,3,4]  — running maximum
```

---

## 📊 Memory: Generator vs List

This is the **biggest advantage of generators**. A list comprehension creates all values immediately and stores them all in memory at once. A generator expression looks similar but only computes values when asked. For large sequences, the memory difference is enormous.

```python
import sys

# List — all values computed and stored in memory immediately
lst = [x**2 for x in range(10000)]
sys.getsizeof(lst)   # ~85 KB  (grows with the number of items)

# Generator — only the generator object is stored; values computed on demand
gen = (x**2 for x in range(10000))
sys.getsizeof(gen)   # ~112 bytes (stays constant regardless of how many items)
```

---

## 📌 Quick Reference

A concise cheatsheet of Python's iteration protocol, generator function syntax, and the most useful `itertools` functions.

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
