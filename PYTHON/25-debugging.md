# 25: Debugging & Profiling

## 🐛 print() Debugging

The simplest approach — fine for quick checks.

```python
# f-string debug (Python 3.8+) — prints name AND value
x = 42
y = [1, 2, 3]
print(f"{x=}")      # x=42
print(f"{y=}")      # y=[1, 2, 3]

# pprint for deeply nested structures
from pprint import pprint
pprint({"users": [{"name": "Alice", "scores": [90, 85, 92]}]}, indent=2)
```

---

## 🔍 pdb — Python Debugger

The built-in interactive debugger.

```python
# Method 1: breakpoint() (Python 3.7+) — preferred
def process_data(data):
    result = transform(data)
    breakpoint()    # execution pauses here, opens pdb
    return result

# Method 2: import pdb
import pdb
pdb.set_trace()    # same effect

# Conditional breakpoint
if some_condition:
    breakpoint()
```

### pdb Commands

| Command | Action |
|---------|--------|
| `n` | **n**ext line (step over) |
| `s` | **s**tep into function |
| `c` | **c**ontinue until next breakpoint |
| `q` | **q**uit debugger |
| `l` | **l**ist current code context |
| `p x` | **p**rint variable x |
| `pp x` | pretty-print x |
| `w` | **w**here — stack trace |
| `u` / `d` | move **u**p/**d**own the stack |
| `b 42` | set **b**reakpoint at line 42 |
| `h` | **h**elp |
| `!x = 5` | execute `x = 5` in current scope |

---

## 🖥️ VS Code Debugger

1. Add a breakpoint (click left margin or press **F9**)
2. Press **F5** to start debugging
3. Use the debug toolbar: Step Over (F10), Step Into (F11), Continue (F5)

```json
// .vscode/launch.json
{
  "version": "0.2.0",
  "configurations": [
    {
      "name": "Python: Current File",
      "type": "python",
      "request": "launch",
      "program": "${file}",
      "console": "integratedTerminal"
    },
    {
      "name": "Python: FastAPI",
      "type": "python",
      "request": "launch",
      "module": "uvicorn",
      "args": ["main:app", "--reload"],
      "console": "integratedTerminal"
    }
  ]
}
```

---

## 🪵 Logging

Better than `print()` for production code.

```python
import logging

# Setup (call once at entry point)
logging.basicConfig(
    level=logging.DEBUG,
    format="%(asctime)s [%(levelname)s] %(name)s: %(message)s",
    handlers=[
        logging.StreamHandler(),                       # console
        logging.FileHandler("app.log", encoding="utf-8"),  # file
    ]
)

logger = logging.getLogger(__name__)

# Log levels
logger.debug("Detailed debug info")           # lowest level
logger.info("Normal operation")
logger.warning("Something unexpected")
logger.error("Something failed")
logger.critical("System is down")
logger.exception("Error with traceback")     # includes traceback

# Structured logging
logger.info("Order created", extra={"order_id": 123, "user": "alice"})
```

---

## 🔥 traceback Module

`traceback.print_exc()` prints the current exception's full stack trace to stderr. `traceback.format_exc()` returns it as a string, which you can pass to a logger. `sys.exc_info()` provides the raw exception type, value, and traceback object for custom handling inside an `except` block.

```python
import traceback
import sys

try:
    risky_code()
except Exception as e:
    # Print traceback to stderr
    traceback.print_exc()

    # Get traceback as string
    tb_string = traceback.format_exc()

    # Log it
    logger.error("Unexpected error:\n%s", traceback.format_exc())

    # Get exception info
    exc_type, exc_value, exc_tb = sys.exc_info()
    print(f"Type: {exc_type.__name__}")
    print(f"Value: {exc_value}")
```

---

## ⏱️ Profiling — Finding Bottlenecks

### time — Quick Timing
```python
import time

start = time.perf_counter()
result = expensive_function()
elapsed = time.perf_counter() - start
print(f"Took {elapsed:.4f}s")

# Context manager
from contextlib import contextmanager

@contextmanager
def timer(label=""):
    start = time.perf_counter()
    yield
    print(f"{label}: {time.perf_counter() - start:.4f}s")

with timer("Process data"):
    process_data()
```

### cProfile — Function-Level Profiling
```python
import cProfile
import pstats

# Profile a function
cProfile.run("my_function()", "profile_output")

# Analyze results
stats = pstats.Stats("profile_output")
stats.sort_stats("cumulative")    # sort by cumulative time
stats.print_stats(20)             # top 20 functions

# Profile a code block
with cProfile.Profile() as pr:
    expensive_code()
pstats.Stats(pr).sort_stats("cumulative").print_stats(10)
```

```bash
# Command line profiling
python -m cProfile -s cumulative my_script.py
python -m cProfile -o output.prof my_script.py

# Visualize with snakeviz
pip install snakeviz
snakeviz output.prof
```

### line_profiler — Line-Level Profiling
```bash
pip install line_profiler
```

```python
from line_profiler import profile

@profile
def slow_function(data):
    result = []
    for item in data:        # ← which line is slow?
        result.append(item * 2)
    return result
```

```bash
kernprof -l -v my_script.py
```

### memory_profiler — Memory Usage
```bash
pip install memory-profiler
```

```python
from memory_profiler import profile

@profile
def memory_heavy():
    big_list = [i for i in range(1_000_000)]
    return big_list
```

```bash
python -m memory_profiler my_script.py
```

---

## 🔬 timeit — Microbenchmarks

For comparing small code snippets.

```python
import timeit

# Quick time one expression
timeit.timeit("sum(range(1000))", number=10000)

# Compare approaches
list_comp = timeit.timeit(
    "[x**2 for x in range(1000)]",
    number=10000
)
map_func = timeit.timeit(
    "list(map(lambda x: x**2, range(1000)))",
    number=10000
)
print(f"list comp: {list_comp:.3f}s")
print(f"map: {map_func:.3f}s")
```

```bash
python -m timeit "sum(range(1000))"
```

---

## 🔧 Common Debugging Patterns

Python's introspection tools help diagnose unexpected behaviour without a full debugger. `dir(obj)` lists all attributes and methods. `vars(obj)` shows the instance `__dict__`. `inspect.getsource(func)` retrieves the source code of any function at runtime. `inspect.signature(func)` shows the expected parameters.

```python
# Inspect an object
print(dir(obj))            # all attributes/methods
print(vars(obj))           # __dict__
help(obj)                  # full documentation
print(type(obj))           # type
print(isinstance(obj, X))  # is it an instance of X?

# Check module contents
import mymodule
print(dir(mymodule))

# Introspection with inspect
import inspect
inspect.getsource(func)    # source code of function
inspect.signature(func)    # parameters
inspect.isfunction(obj)
inspect.getmembers(obj)    # all members
```

---

## 📌 Quick Reference

A concise cheatsheet of Python debugging tools: `print`/f-string debug output, `breakpoint()` / pdb commands, logging levels, profiling with cProfile, and timeit for microbenchmarks.

```python
# Quick debug
print(f"{var=}")             # Python 3.8+
breakpoint()                 # drop into pdb

# Logging
import logging
logger = logging.getLogger(__name__)
logger.info("msg")
logger.exception("error")   # includes traceback

# Time a block
import time
start = time.perf_counter()
...
print(time.perf_counter() - start)

# Profile
python -m cProfile -s cumulative script.py

# Inspect
dir(obj) / vars(obj) / help(obj)
import inspect; inspect.getsource(func)
```


---

[← Previous: Best Practices & Patterns](24-best-practices.md) | [Contents](README.md)
