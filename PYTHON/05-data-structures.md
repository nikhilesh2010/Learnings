# 05: Data Structures

## 📋 Lists

Ordered, mutable, allows duplicates.

```python
# Create
fruits = ["apple", "banana", "cherry"]
mixed  = [1, "two", 3.0, True, None]
empty  = []
nested = [[1, 2], [3, 4], [5, 6]]

# Access
fruits[0]     # "apple"    — first
fruits[-1]    # "cherry"   — last
fruits[1:3]   # ["banana", "cherry"]   — slice
fruits[::-1]  # reverse
```

### List Methods
```python
lst = [3, 1, 4, 1, 5]

lst.append(9)           # add to end         → [3,1,4,1,5,9]
lst.insert(0, 0)        # insert at index    → [0,3,1,4,1,5,9]
lst.extend([7, 8])      # add multiple       → [..., 7, 8]
lst.remove(1)           # remove first match
lst.pop()               # remove & return last
lst.pop(0)              # remove & return at index
lst.sort()              # sort in-place
lst.sort(reverse=True)  # sort descending
lst.reverse()           # reverse in-place
lst.index(4)            # index of first 4
lst.count(1)            # count of 1s
lst.clear()             # remove all items
copy = lst.copy()       # shallow copy
```

```python
# Functions on lists
len(fruits)                        # 3
sorted(fruits)                     # new sorted list
sorted(fruits, reverse=True)       # new sorted desc
min([3, 1, 4]), max([3, 1, 4])    # 1, 4
sum([1, 2, 3])                     # 6
any([False, True, False])          # True
all([True, True, False])           # False
```

---

## 📦 Tuples

Ordered, **immutable**, allows duplicates. Faster than lists.

```python
# Create
point = (3, 4)
single = (1,)        # note the comma — required for single element!
empty  = ()
packed = 1, 2, 3     # parentheses optional

# Access — same as list
point[0]    # 3
point[-1]   # 4
x, y = point   # unpack

# Immutable!
point[0] = 5   # TypeError!

# Common use: multiple return values, dict keys
def get_range(data):
    return min(data), max(data)

low, high = get_range([3, 1, 4, 1, 5])

# Named tuples — readable alternative
from collections import namedtuple
Point = namedtuple("Point", ["x", "y"])
p = Point(3, 4)
p.x   # 3
p.y   # 4
```

---

## 🗄️ Dictionaries

Unordered key-value pairs. Keys must be hashable (strings, numbers, tuples).

```python
# Create
user = {"name": "Alice", "age": 30, "city": "NYC"}
empty = {}
from_keys = dict.fromkeys(["a", "b", "c"], 0)  # {"a":0,"b":0,"c":0}
```

### Dict Access & Methods
```python
user = {"name": "Alice", "age": 30}

# Access
user["name"]              # "Alice"
user.get("email")         # None — safe, no KeyError
user.get("email", "N/A")  # "N/A" — with default

# Modify
user["email"] = "alice@example.com"   # add/update
del user["age"]                       # delete key
user.pop("city", None)                # remove & return (safe)
user.update({"age": 31, "role": "admin"})  # merge

# Iterate
for key in user:              # keys
for val in user.values():     # values
for k, v in user.items():     # key-value pairs

# Check key
"name" in user      # True
"email" not in user # True

# All keys/values as lists
list(user.keys())
list(user.values())
list(user.items())   # list of (key, value) tuples
```

```python
# setdefault — add key only if missing
user.setdefault("role", "user")   # sets role="user" if not present

# defaultdict — auto-create missing keys
from collections import defaultdict
word_count = defaultdict(int)
for word in words:
    word_count[word] += 1   # no KeyError even on first access

# Merge dicts (Python 3.9+)
merged = dict1 | dict2
dict1 |= dict2    # update in-place
```

---

## 🔵 Sets

Unordered, **unique values only**, mutable.

```python
# Create
colors = {"red", "green", "blue"}
empty  = set()    # NOT {} — that makes a dict!
from_list = set([1, 2, 2, 3, 3])   # {1, 2, 3}

# Set operations
a = {1, 2, 3, 4}
b = {3, 4, 5, 6}

a | b       # {1,2,3,4,5,6}  — union
a & b       # {3, 4}         — intersection
a - b       # {1, 2}         — difference (in a, not in b)
a ^ b       # {1,2,5,6}      — symmetric difference

a.issubset(b)    # is a ⊆ b ?
a.issuperset(b)  # is a ⊇ b ?
a.isdisjoint(b)  # no common elements?

# Modify
colors.add("yellow")
colors.discard("red")    # safe — no error if missing
colors.remove("green")   # raises KeyError if missing
colors.pop()             # remove arbitrary element
```

---

## 🧊 frozenset

Like a set but **immutable** — can be used as dict keys.

```python
fs = frozenset([1, 2, 3])
fs.add(4)   # AttributeError!
```

---

## 📊 Choosing the Right Data Structure

| Structure | Ordered | Mutable | Duplicates | Key-Value | Use When |
|-----------|---------|---------|------------|-----------|----------|
| **list**  | ✅ | ✅ | ✅ | ❌ | Ordered collection |
| **tuple** | ✅ | ❌ | ✅ | ❌ | Fixed data, dict keys |
| **dict**  | ✅* | ✅ | keys: ❌ | ✅ | Key-value lookup |
| **set**   | ❌ | ✅ | ❌ | ❌ | Uniqueness, membership |

*Dicts are ordered by insertion since Python 3.7

---

## 🏆 collections Module

```python
from collections import Counter, deque, OrderedDict, defaultdict

# Counter — count hashable objects
words = ["apple", "banana", "apple", "cherry", "banana", "apple"]
c = Counter(words)
# Counter({'apple': 3, 'banana': 2, 'cherry': 1})
c.most_common(2)   # [('apple', 3), ('banana', 2)]

# deque — fast appends/pops from both ends
dq = deque([1, 2, 3])
dq.appendleft(0)    # [0, 1, 2, 3]
dq.popleft()        # removes 0
dq.rotate(1)        # [3, 1, 2]

# deque as fixed-size buffer
last_5 = deque(maxlen=5)
for i in range(10):
    last_5.append(i)
# deque([5, 6, 7, 8, 9], maxlen=5)
```

---

## 📌 Quick Reference

```python
# List
lst = [1, 2, 3]
lst.append(x)          # add end
lst.pop()              # remove end
lst.insert(i, x)       # insert at i
lst[start:stop:step]   # slice

# Dict
d = {"k": "v"}
d.get("k", default)    # safe access
d.items()              # (key, val) pairs

# Set
s = {1, 2, 3}
s.add(x)
s.discard(x)
s & other              # intersection
s | other              # union

# Tuple
t = (1, 2, 3)
a, b, c = t            # unpack
```


---

[← Previous: Functions](04-functions.md) | [Contents](README.md) | [Next: Strings →](06-strings.md)
