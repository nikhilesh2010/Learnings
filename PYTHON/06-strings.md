# 06: Strings

## 📝 String Basics

```python
# Creation
s1 = 'single quotes'
s2 = "double quotes"
s3 = """multiline
string"""
s4 = r"raw string \n (backslash not interpreted)"
s5 = b"bytes literal"

# Strings are immutable — you can't change characters in-place
s = "hello"
s[0] = "H"   # TypeError!
s = "H" + s[1:]   # create a new string instead
```

---

## 🔄 f-Strings (Python 3.6+) — Preferred

```python
name = "Alice"
age  = 30
pi   = 3.14159

# Basic
print(f"Hello, {name}!")              # Hello, Alice!

# Expressions
print(f"Next year: {age + 1}")        # Next year: 31

# Format spec
print(f"{pi:.2f}")                    # 3.14
print(f"{1000000:,}")                 # 1,000,000
print(f"{0.42:.1%}")                  # 42.0%
print(f"{'left':<10}|")              # left      |
print(f"{'right':>10}|")             # right|
print(f"{'center':^10}|")            # center|
print(f"{42:05d}")                    # 00042 (zero-padded)

# Repr
print(f"{name!r}")      # 'Alice'
print(f"{name!s}")      # Alice (default)
print(f"{name!a}")      # 'Alice' (ascii)

# Debug (Python 3.8+)
value = 42
print(f"{value=}")      # value=42
```

---

## 🔧 String Methods

### Case
```python
s = "Hello, World!"

s.upper()       # "HELLO, WORLD!"
s.lower()       # "hello, world!"
s.title()       # "Hello, World!"
s.capitalize()  # "Hello, world!"
s.swapcase()    # "hELLO, wORLD!"
```

### Search & Check
```python
s = "Hello, World!"

s.find("World")       # 7  (index; -1 if not found)
s.index("World")      # 7  (index; raises ValueError if not found)
s.count("l")          # 3
s.startswith("Hello") # True
s.endswith("!")        # True
"World" in s          # True

s.isalpha()    # True if all letters
s.isdigit()    # True if all digits
s.isalnum()    # True if letters or digits
s.isspace()    # True if all whitespace
s.isupper()    # True if all uppercase
s.islower()    # True if all lowercase
```

### Trim & Strip
```python
s = "  hello  "
s.strip()        # "hello"         — both ends
s.lstrip()       # "hello  "       — left only
s.rstrip()       # "  hello"       — right only
s.strip("xyz")   # strip specific chars
```

### Split & Join
```python
# split — string to list
"a,b,c".split(",")        # ["a", "b", "c"]
"hello world".split()     # ["hello", "world"] — splits on whitespace
"a,b,c".split(",", 1)     # ["a", "b,c"] — max 1 split
"hello".splitlines()      # ["hello"]

# join — list to string
", ".join(["Alice", "Bob", "Carol"])   # "Alice, Bob, Carol"
"-".join(["2025", "01", "15"])         # "2025-01-15"
"".join(["h", "e", "l", "l", "o"])    # "hello"
```

### Replace & Modify
```python
"hello".replace("l", "r")         # "herro"
"hello".replace("l", "r", 1)      # "herlo" — max 1 replacement
"  hello  ".strip()                # "hello"
```

### Padding
```python
"42".zfill(5)       # "00042"
"hi".ljust(10)      # "hi        "
"hi".rjust(10)      # "        hi"
"hi".center(10)     # "    hi    "
"hi".center(10, "-") # "----hi----"
```

---

## 🔪 Slicing

```python
s = "Hello, World!"
#    0123456789...
#    -13 ...  -1

s[0]      # "H"
s[-1]     # "!"
s[7:12]   # "World"
s[:5]     # "Hello"
s[7:]     # "World!"
s[::2]    # every 2nd character
s[::-1]   # reversed string  → "!dlroW ,olleH"
```

---

## 🔗 String Concatenation & Repetition

```python
"Hello" + ", " + "World"   # "Hello, World"
"ha" * 3                   # "hahaha"

# Efficient concatenation — use join for many strings
parts = ["Hello", "World", "Python"]
result = " ".join(parts)   # faster than + in loops
```

---

## 📐 String Formatting Styles

```python
name, age = "Alice", 30

# 1. f-string (modern — preferred)
f"Name: {name}, Age: {age}"

# 2. .format()
"Name: {}, Age: {}".format(name, age)
"Name: {name}, Age: {age}".format(name=name, age=age)

# 3. % formatting (old)
"Name: %s, Age: %d" % (name, age)
```

---

## 🔄 Common Patterns

```python
# Check if string is a number
"123".isdigit()          # True
"12.3".replace(".", "").isdigit()  # True (float check)

# Reverse a string
s[::-1]

# Count unique characters
len(set("mississippi"))   # 4

# Remove punctuation
import string
s.translate(str.maketrans("", "", string.punctuation))

# Title case with custom separators
import re
re.sub(r"\b\w", lambda m: m.group().upper(), s)

# Split on multiple separators
import re
re.split(r"[,;.\s]+", "a,b;c.d e")   # ["a","b","c","d","e"]
```

---

## 📌 Quick Reference

```python
s.upper() / s.lower() / s.title()
s.strip() / s.lstrip() / s.rstrip()
s.split(sep) / sep.join(list)
s.replace(old, new)
s.find(sub) / s.index(sub)
s.startswith(x) / s.endswith(x)
s.count(sub)
s.format() / f"{var}"
s[start:stop:step]   # slicing
```


---

[← Previous: Data Structures](05-data-structures.md) | [Contents](README.md) | [Next: File I/O →](07-file-io.md)
