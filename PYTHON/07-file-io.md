# 07: File I/O

## 📂 Opening Files

```python
# open(path, mode, encoding)
f = open("data.txt", "r", encoding="utf-8")
content = f.read()
f.close()   # always close!

# Better: use 'with' — auto-closes even on error
with open("data.txt", "r", encoding="utf-8") as f:
    content = f.read()
```

### File Modes

| Mode | Description |
|------|-------------|
| `"r"` | Read (default) — error if file doesn't exist |
| `"w"` | Write — creates or **overwrites** |
| `"a"` | Append — creates or adds to end |
| `"x"` | Exclusive create — error if file exists |
| `"r+"` | Read + Write |
| `"b"` | Binary mode (add to any: `"rb"`, `"wb"`) |

---

## 📖 Reading Files

```python
# Read entire file as a string
with open("data.txt") as f:
    content = f.read()

# Read line by line (memory efficient for large files)
with open("data.txt") as f:
    for line in f:
        print(line.strip())   # strip removes the trailing \n

# Read all lines into a list
with open("data.txt") as f:
    lines = f.readlines()     # ["\n" included at end]
    lines = [l.strip() for l in f.readlines()]  # cleaned

# Read one line
with open("data.txt") as f:
    first = f.readline()
```

---

## ✏️ Writing Files

```python
# Write (overwrites existing content)
with open("output.txt", "w", encoding="utf-8") as f:
    f.write("Hello, World!\n")
    f.write("Second line\n")

# Append (add to existing content)
with open("log.txt", "a") as f:
    f.write("New log entry\n")

# Write multiple lines
lines = ["line 1\n", "line 2\n", "line 3\n"]
with open("output.txt", "w") as f:
    f.writelines(lines)

# print() to a file
with open("output.txt", "w") as f:
    print("Hello", file=f)
    print("World", file=f)
```

---

## 📦 Working with JSON

```python
import json

# Write JSON to file
data = {"name": "Alice", "age": 30, "scores": [95, 87, 92]}

with open("data.json", "w") as f:
    json.dump(data, f, indent=2)

# Read JSON from file
with open("data.json") as f:
    loaded = json.load(f)

print(loaded["name"])   # Alice

# Convert to/from string
json_str = json.dumps(data)        # dict → string
parsed   = json.loads(json_str)    # string → dict
```

---

## 📊 Working with CSV

```python
import csv

# Write CSV
data = [
    ["Name", "Age", "City"],
    ["Alice", 30, "NYC"],
    ["Bob", 25, "LA"],
]

with open("users.csv", "w", newline="", encoding="utf-8") as f:
    writer = csv.writer(f)
    writer.writerows(data)

# Read CSV
with open("users.csv", newline="", encoding="utf-8") as f:
    reader = csv.reader(f)
    header = next(reader)    # skip header row
    for row in reader:
        print(row)

# DictReader/DictWriter — use column names as keys
with open("users.csv") as f:
    reader = csv.DictReader(f)
    for row in reader:
        print(row["Name"], row["Age"])
```

---

## 🗂️ pathlib — Modern Path Handling (Python 3.4+)

`pathlib` is the modern, object-oriented way to work with file paths.

```python
from pathlib import Path

# Create paths
p = Path("data/users.csv")
home = Path.home()           # /Users/alice
cwd  = Path.cwd()            # current directory

# Build paths
base = Path("data")
file = base / "subdir" / "file.txt"    # data/subdir/file.txt

# Path info
p.name          # "users.csv"
p.stem          # "users"
p.suffix        # ".csv"
p.parent        # Path("data")
p.parts         # ("data", "users.csv")

# Check existence
p.exists()
p.is_file()
p.is_dir()

# Read/Write (convenient one-liners)
text = Path("readme.txt").read_text(encoding="utf-8")
Path("output.txt").write_text("Hello!\n", encoding="utf-8")
data = Path("data.bin").read_bytes()

# Directory operations
Path("new_dir").mkdir(exist_ok=True)
Path("deep/nested/dir").mkdir(parents=True, exist_ok=True)

# List directory contents
for item in Path(".").iterdir():
    print(item)

# Glob patterns
for py_file in Path(".").glob("**/*.py"):
    print(py_file)

for md_file in Path("docs").rglob("*.md"):
    print(md_file)

# Rename/move
p.rename(p.parent / "new_name.csv")

# Delete
p.unlink()              # delete file
Path("empty_dir").rmdir()  # delete empty directory
```

---

## 🔧 os Module (Older Style)

```python
import os

os.getcwd()                  # current directory
os.listdir(".")              # list directory
os.makedirs("a/b/c", exist_ok=True)  # create nested dirs
os.remove("file.txt")        # delete file
os.rename("old.txt", "new.txt")
os.path.exists("file.txt")   # check existence
os.path.join("dir", "file")  # build path (use pathlib instead)
os.path.basename("/a/b/c.txt")  # "c.txt"
os.path.dirname("/a/b/c.txt")   # "/a/b"
os.environ.get("HOME")       # environment variable
```

---

## ⚠️ Error Handling with Files

```python
from pathlib import Path

# Safe file reading
def read_config(path: str) -> dict:
    try:
        import json
        with open(path, encoding="utf-8") as f:
            return json.load(f)
    except FileNotFoundError:
        return {}
    except json.JSONDecodeError as e:
        raise ValueError(f"Invalid JSON in {path}: {e}")

# Check before opening
p = Path("config.json")
if p.exists() and p.is_file():
    data = p.read_text()
```

---

## 📌 Quick Reference

```python
# Read
with open("f.txt") as f:
    content = f.read()
    lines   = f.readlines()
    for line in f: ...

# Write
with open("f.txt", "w") as f:
    f.write("text\n")

# JSON
import json
json.dump(obj, f, indent=2)
obj = json.load(f)

# CSV
import csv
csv.DictReader(f) / csv.DictWriter(f, fieldnames)

# pathlib
from pathlib import Path
p = Path("dir") / "file.txt"
p.read_text() / p.write_text()
p.exists() / p.is_file()
Path(".").glob("**/*.py")
```


---

[← Previous: Strings](06-strings.md) | [Contents](README.md) | [Next: Object-Oriented Programming →](08-oop.md)
