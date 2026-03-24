# 16: Async & Concurrency

## ⚡ Concurrency vs Parallelism

**Concurrency** means multiple tasks make progress by taking turns (interleaving on a single CPU). **Parallelism** means tasks run literally simultaneously on multiple CPU cores. Python's `asyncio` and `threading` provide concurrency; `multiprocessing` provides true parallelism, bypassing the GIL for CPU-bound work.

```
Concurrency  — multiple tasks in progress at the same time (interleaved)
Parallelism  — multiple tasks running at the exactly same time (multiple CPUs)

┌─────────────────────────────────────────────────┐
│  asyncio    — concurrency (I/O-bound tasks)      │
│  threading  — concurrency (I/O-bound tasks)      │
│  multiprocessing — parallelism (CPU-bound tasks) │
└─────────────────────────────────────────────────┘
```

### When to use what?

| Problem | Tool |
|---------|------|
| Many I/O operations (HTTP, DB, files) | `asyncio` |
| Blocking I/O in third-party library | `threading` |
| CPU-heavy computation | `multiprocessing` |
| Mix of I/O + CPU | `concurrent.futures` |

---

## 🔄 asyncio — Async/Await

Python's built-in event loop for async programming.

```python
import asyncio

# async def — defines a coroutine
async def fetch_data(url: str) -> str:
    await asyncio.sleep(1)   # simulate async I/O
    return f"Data from {url}"

# await — suspend until the coroutine completes
async def main():
    result = await fetch_data("https://api.example.com")
    print(result)

# Run the event loop
asyncio.run(main())
```

### Parallel Execution — gather()
```python
import asyncio
import time

async def fetch(url: str, delay: float) -> str:
    await asyncio.sleep(delay)
    return f"Response from {url}"

async def main():
    start = time.perf_counter()

    # Sequential — takes 3s total
    # r1 = await fetch("api1", 1)
    # r2 = await fetch("api2", 2)

    # Parallel — takes ~2s (max delay)
    r1, r2 = await asyncio.gather(
        fetch("api1", 1),
        fetch("api2", 2),
    )

    print(f"Done in {time.perf_counter() - start:.2f}s")
    print(r1, r2)

asyncio.run(main())
```

### Tasks
```python
async def main():
    # Create tasks — start immediately in background
    task1 = asyncio.create_task(fetch("api1", 1))
    task2 = asyncio.create_task(fetch("api2", 2))

    # Do other work while tasks run...
    print("Doing other stuff")

    # Wait for tasks to complete
    r1 = await task1
    r2 = await task2

    # Or wait for all tasks
    results = await asyncio.gather(task1, task2)
```

### Timeouts & Cancellation
```python
async def main():
    # Timeout
    try:
        result = await asyncio.wait_for(fetch("slow-api", 5), timeout=2.0)
    except asyncio.TimeoutError:
        print("Request timed out")

    # Cancel a task
    task = asyncio.create_task(long_running())
    await asyncio.sleep(1)
    task.cancel()
    try:
        await task
    except asyncio.CancelledError:
        print("Task was cancelled")
```

### Async Context Managers & Iterators
```python
# async with
async with aiohttp.ClientSession() as session:
    async with session.get(url) as response:
        data = await response.json()

# async for
async for item in async_generator():
    process(item)

# async generator
async def paginate(url):
    page = 1
    while True:
        data = await fetch_page(url, page)
        if not data:
            break
        for item in data:
            yield item
        page += 1
```

### Real HTTP with aiohttp
```python
import aiohttp
import asyncio

async def fetch_all(urls: list[str]) -> list[str]:
    async with aiohttp.ClientSession() as session:
        tasks = [fetch_one(session, url) for url in urls]
        return await asyncio.gather(*tasks)

async def fetch_one(session, url):
    async with session.get(url) as resp:
        return await resp.text()

results = asyncio.run(fetch_all(["https://example.com", "https://python.org"]))
```

---

## 🧵 threading — I/O Concurrency

Use for blocking I/O calls that don't support async.

```python
import threading
import time

def download(url):
    print(f"Downloading {url}...")
    time.sleep(2)   # simulate blocking I/O
    print(f"Done: {url}")

# Create and start threads
threads = []
for url in ["url1", "url2", "url3"]:
    t = threading.Thread(target=download, args=(url,))
    threads.append(t)
    t.start()

# Wait for all to finish
for t in threads:
    t.join()
```

### Thread Safety
```python
import threading

counter = 0
lock = threading.Lock()

def increment():
    global counter
    with lock:   # thread-safe
        counter += 1

# Thread-local storage
local = threading.local()

def worker():
    local.user_id = get_user_id()  # per-thread value
```

---

## 🔢 multiprocessing — True Parallelism

Bypasses the GIL — uses separate OS processes for CPU-bound work.

```python
import multiprocessing
import math

def is_prime(n):
    if n < 2: return False
    for i in range(2, int(math.sqrt(n)) + 1):
        if n % i == 0: return False
    return True

if __name__ == "__main__":
    numbers = range(10000, 10100)

    # Pool — worker processes
    with multiprocessing.Pool() as pool:
        results = pool.map(is_prime, numbers)

    primes = [n for n, p in zip(numbers, results) if p]
    print(primes)
```

---

## 🏊 concurrent.futures — Unified API

High-level interface for both threads and processes.

```python
from concurrent.futures import ThreadPoolExecutor, ProcessPoolExecutor
import requests

def fetch(url):
    return requests.get(url).status_code

urls = ["https://example.com", "https://python.org", "https://github.com"]

# Thread pool (for I/O)
with ThreadPoolExecutor(max_workers=5) as executor:
    results = list(executor.map(fetch, urls))

# Process pool (for CPU)
with ProcessPoolExecutor(max_workers=4) as executor:
    results = list(executor.map(cpu_intensive_task, data))

# submit() — individual futures
with ThreadPoolExecutor(max_workers=5) as executor:
    futures = {executor.submit(fetch, url): url for url in urls}
    for future in concurrent.futures.as_completed(futures):
        url = futures[future]
        try:
            result = future.result()
        except Exception as e:
            print(f"{url} failed: {e}")
```

---

## 📌 Quick Reference

A concise cheatsheet of Python's three concurrency models: asyncio (I/O-bound async/await), threading (blocking I/O), and multiprocessing (CPU-bound parallelism).

```python
# asyncio
import asyncio

async def my_coro():
    await something()

asyncio.run(my_coro())

# Parallel
results = await asyncio.gather(coro1(), coro2())
task = asyncio.create_task(coro())

# Timeout
await asyncio.wait_for(coro(), timeout=5.0)

# threading
t = threading.Thread(target=func, args=(...))
t.start(); t.join()
lock = threading.Lock()
with lock: ...

# multiprocessing
with multiprocessing.Pool() as pool:
    results = pool.map(func, items)

# concurrent.futures
with ThreadPoolExecutor(max_workers=n) as ex:
    results = list(ex.map(func, items))
```


---

[← Previous: Functional Programming](15-functional-programming.md) | [Contents](README.md) | [Next: Standard Library →](17-standard-library.md)
