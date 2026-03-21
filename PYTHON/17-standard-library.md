# 17: Standard Library

## 🗓️ datetime — Dates and Times

```python
from datetime import datetime, date, time, timedelta

# Current date/time
now = datetime.now()           # local time
utc = datetime.utcnow()        # UTC (naive)
today = date.today()           # date only

# Create
dt = datetime(2025, 6, 15, 14, 30, 0)    # year, month, day, h, m, s
d  = date(2025, 6, 15)
t  = time(14, 30, 0)

# Format / Parse
dt.strftime("%Y-%m-%d %H:%M:%S")          # "2025-06-15 14:30:00"
dt.strftime("%d/%m/%Y")                   # "15/06/2025"
datetime.strptime("2025-06-15", "%Y-%m-%d")   # parse string

# Arithmetic
tomorrow   = today + timedelta(days=1)
last_week  = today - timedelta(weeks=1)
diff       = datetime(2025, 12, 31) - datetime.now()
diff.days  # number of days until

# ISO format
dt.isoformat()           # "2025-06-15T14:30:00"
datetime.fromisoformat("2025-06-15T14:30:00")
```

---

## 🗂️ os — Operating System Interface

```python
import os

# Working directory
os.getcwd()                   # current directory
os.chdir("/path/to/dir")      # change directory

# Environment variables
os.environ.get("PATH")
os.environ.get("HOME", "/default")
os.getenv("DATABASE_URL")

# File system
os.listdir(".")               # list directory
os.makedirs("a/b/c", exist_ok=True)
os.remove("file.txt")
os.rename("old.txt", "new.txt")

# Path operations (use pathlib instead)
os.path.exists("file.txt")
os.path.join("dir", "file.txt")
os.path.basename("/a/b/c.txt")  # "c.txt"
os.path.splitext("file.txt")    # ("file", ".txt")

# Process
os.getpid()          # current process ID
os.cpu_count()       # number of CPUs
```

---

## ⚙️ sys — Python Interpreter

```python
import sys

sys.version               # Python version string
sys.version_info          # (3, 11, 0, ...)
sys.platform              # "win32", "linux", "darwin"
sys.path                  # module search paths
sys.argv                  # command-line arguments ["script.py", "arg1", ...]
sys.executable            # path to Python interpreter
sys.exit(0)               # exit with code (0 = success)
sys.stdin / stdout / stderr   # standard streams
sys.getrecursionlimit()   # default 1000
sys.setrecursionlimit(5000)
sys.getsizeof(obj)        # memory size in bytes
```

---

## 🔢 math — Mathematical Functions

```python
import math

math.sqrt(16)     # 4.0
math.pow(2, 10)   # 1024.0
math.log(100, 10) # 2.0
math.log2(8)      # 3.0
math.log(math.e)  # 1.0
math.floor(3.7)   # 3
math.ceil(3.2)    # 4
math.trunc(3.9)   # 3
math.factorial(5) # 120
math.gcd(12, 8)   # 4
math.lcm(4, 6)    # 12

math.pi    # 3.14159...
math.e     # 2.71828...
math.inf   # positive infinity
math.nan   # Not a Number

math.sin(math.pi/2)   # 1.0
math.cos(0)           # 1.0
math.degrees(math.pi) # 180.0
math.radians(180)     # 3.14159...

math.isnan(math.nan)  # True
math.isinf(math.inf)  # True
```

---

## 🎲 random — Random Numbers

```python
import random

random.random()           # 0.0 to 1.0 float
random.uniform(1.0, 10.0) # float in range
random.randint(1, 6)      # int inclusive (die roll)
random.randrange(0, 10, 2) # even numbers 0-8

items = [1, 2, 3, 4, 5]
random.choice(items)       # random element
random.choices(items, k=3) # 3 random elements (with replacement)
random.sample(items, k=3)  # 3 random elements (no replacement)
random.shuffle(items)      # shuffle in-place

random.seed(42)            # reproducible results
```

---

## 🔄 collections — Specialized Containers

```python
from collections import (
    Counter, defaultdict, OrderedDict,
    deque, namedtuple, ChainMap
)

# Counter
words = ["apple", "banana", "apple", "cherry", "apple"]
c = Counter(words)
c.most_common(2)        # [("apple", 3), ("banana", 1)]
c["apple"]              # 3
c["missing"]            # 0 (no KeyError!)
c.update(["apple"])     # add more counts
sum(c.values())         # total count

# defaultdict
dd = defaultdict(list)
dd["key"].append(1)     # no KeyError on first access
dd["key"].append(2)
dd["other"] += [3, 4]

# deque (double-ended queue)
dq = deque([1, 2, 3], maxlen=5)
dq.appendleft(0)
dq.popleft()
dq.rotate(1)   # rotate right
dq.rotate(-1)  # rotate left

# namedtuple
Point = namedtuple("Point", ["x", "y"])
p = Point(3, 4)
p.x, p.y        # 3, 4
p._asdict()     # {"x": 3, "y": 4}
p._replace(x=5) # Point(x=5, y=4)
```

---

## 🔄 itertools — Efficient Iterators

```python
import itertools

itertools.chain([1,2], [3,4])          # 1,2,3,4
itertools.islice(gen, 5)               # first 5 items
itertools.cycle([1,2,3])              # 1,2,3,1,2,3,...
itertools.count(start=0, step=1)       # 0,1,2,...
itertools.repeat(x, n)                # x repeated n times

itertools.combinations("ABC", 2)       # AB, AC, BC
itertools.permutations("ABC", 2)       # AB, AC, BA, BC, CA, CB
itertools.product("AB", repeat=2)      # AA, AB, BA, BB

itertools.groupby(sorted_data, key)    # group consecutive items
itertools.accumulate([1,2,3,4])        # [1,3,6,10]
itertools.takewhile(pred, it)
itertools.dropwhile(pred, it)
itertools.filterfalse(pred, it)
```

---

## ⚙️ subprocess — Run Shell Commands

```python
import subprocess

# Simple run
result = subprocess.run(
    ["python", "--version"],
    capture_output=True,
    text=True
)
print(result.stdout)     # Python 3.11.0
print(result.returncode) # 0

# Run shell command and check for errors
subprocess.run(["git", "status"], check=True)   # raises on non-zero exit

# Get output
output = subprocess.check_output(["ls", "-la"], text=True)

# Pipe
proc = subprocess.run(
    "echo hello | tr a-z A-Z",
    shell=True, capture_output=True, text=True
)
# HELLO
```

---

## 📦 copy — Copy Objects

```python
import copy

original = {"name": "Alice", "hobbies": ["reading", "coding"]}

# Shallow copy — new dict, same nested objects
shallow = copy.copy(original)
shallow["hobbies"].append("hiking")   # modifies original too!

# Deep copy — completely independent copy
deep = copy.deepcopy(original)
deep["hobbies"].append("hiking")      # original unchanged
```

---

## 🔗 hashlib — Cryptographic Hashing

```python
import hashlib

# SHA-256 hash (for data integrity)
text = "Hello, World!"
h = hashlib.sha256(text.encode()).hexdigest()

# MD5 (NOT for security — only for checksums)
hashlib.md5(b"data").hexdigest()

# File checksum
def file_sha256(path):
    h = hashlib.sha256()
    with open(path, "rb") as f:
        for chunk in iter(lambda: f.read(8192), b""):
            h.update(chunk)
    return h.hexdigest()
```

---

## 📌 Top Standard Library Modules

```python
# Time
import time
time.sleep(1)         # pause execution
time.perf_counter()   # high-res timer
time.time()           # Unix timestamp

# Logging → see 25-debugging.md
import logging

# UUID
import uuid
uuid.uuid4()          # random UUID

# pprint
from pprint import pprint
pprint({"very": "nested", "data": [1,2,3]})

# textwrap
import textwrap
textwrap.wrap("long text", width=40)
textwrap.dedent("    indented text")

# shutil
import shutil
shutil.copy("src", "dst")
shutil.copytree("src/", "dst/")
shutil.rmtree("dir")   # remove directory tree

# tempfile
import tempfile
with tempfile.NamedTemporaryFile(suffix=".txt", delete=True) as f:
    f.write(b"temp content")
```


---

[← Previous: Async & Concurrency](16-async-and-concurrency.md) | [Contents](README.md) | [Next: Regular Expressions →](18-regex.md)
