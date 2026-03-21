# 18: Regular Expressions

## 🔍 What are Regex?

Regular expressions are patterns for matching text. Python's `re` module provides full regex support.

```python
import re

# Basic: re.search() — find first match anywhere in string
match = re.search(r"\d+", "I have 42 apples")
if match:
    print(match.group())   # "42"
    print(match.start())   # 7
    print(match.end())     # 9
    print(match.span())    # (7, 9)
```

---

## 🔤 Pattern Syntax

### Character Classes
```
.      — any character except newline
\d     — digit [0-9]
\D     — non-digit
\w     — word character [a-zA-Z0-9_]
\W     — non-word
\s     — whitespace [\t\n\r\f\v ]
\S     — non-whitespace
[abc]  — a, b, or c
[^abc] — not a, b, or c
[a-z]  — lowercase letters
[A-Za-z0-9] — alphanumeric
```

### Quantifiers
```
*      — 0 or more
+      — 1 or more
?      — 0 or 1 (optional)
{n}    — exactly n times
{n,m}  — n to m times
{n,}   — n or more times

*?     — non-greedy (lazy) version
+?     — non-greedy
```

### Anchors & Boundaries
```
^      — start of string (or line in MULTILINE)
$      — end of string
\b     — word boundary
\B     — non-word boundary
```

### Groups & Alternation
```
(abc)  — capturing group
(?:abc) — non-capturing group
(a|b)  — alternation (a or b)
(?P<name>...) — named group
```

### Special
```
\      — escape special character
|      — alternation
```

---

## 🛠️ re Functions

```python
import re

text = "Hello World 2025"

# search — first match anywhere
re.search(r"\d+", text)           # Match at position 12

# match — only at start of string
re.match(r"Hello", text)           # Match
re.match(r"World", text)           # None (not at start)

# fullmatch — entire string must match
re.fullmatch(r"\d{4}", "2025")     # Match
re.fullmatch(r"\d{4}", "2025x")    # None

# findall — list of all matches
re.findall(r"\d+", "a1 b22 c333") # ["1", "22", "333"]

# finditer — iterator of match objects
for m in re.finditer(r"\d+", "a1 b22 c333"):
    print(m.group(), m.start())

# sub — replace matches
re.sub(r"\d+", "X", "a1 b22 c333")   # "aX bX cX"
re.sub(r"\d+", "X", "a1 b22", count=1) # "aX b22"

# subn — replace and return count
new, n = re.subn(r"\d+", "X", "a1 b22 c333")

# split — split on pattern
re.split(r"\s+", "hello   world")    # ["hello", "world"]
re.split(r"[,;]", "a,b;c")          # ["a", "b", "c"]
```

---

## 📦 Compiled Patterns (Faster for Reuse)

```python
# Compile once, use many times
pattern = re.compile(r"\d{4}-\d{2}-\d{2}")

pattern.search("Today is 2025-06-15.")
pattern.findall("2025-01-01 to 2025-12-31")
pattern.sub("XXXX-XX-XX", text)
```

---

## 🎯 Groups

```python
# Capturing groups
m = re.search(r"(\d{4})-(\d{2})-(\d{2})", "2025-06-15")
m.group(0)    # "2025-06-15" (whole match)
m.group(1)    # "2025"
m.group(2)    # "06"
m.group(3)    # "15"
m.groups()    # ("2025", "06", "15")

# Named groups — clearer
m = re.search(r"(?P<year>\d{4})-(?P<month>\d{2})-(?P<day>\d{2})", "2025-06-15")
m.group("year")   # "2025"
m.groupdict()     # {"year": "2025", "month": "06", "day": "15"}

# Non-capturing group (?:...) — group without capturing
re.search(r"(?:https?|ftp)://(\w+)", "https://python")
# group(1) = "python" (only the domain captured)
```

---

## 🚩 Flags

```python
re.search(r"hello", "HELLO WORLD", re.IGNORECASE)   # case-insensitive
re.search(r"hello", "HELLO WORLD", re.I)             # shorthand

# Multiple flags
re.search(r"^hello", "lines\nhello", re.MULTILINE | re.I)

# Common flags
re.I   # IGNORECASE — case-insensitive
re.M   # MULTILINE  — ^ and $ match start/end of each line
re.S   # DOTALL     — . matches \n too
re.X   # VERBOSE    — allow whitespace and comments in pattern
```

### Verbose patterns
```python
# Without VERBOSE
pattern = re.compile(r"(\d{1,3}\.){3}\d{1,3}")

# With VERBOSE — much more readable
pattern = re.compile(r"""
    (\d{1,3}\.){3}  # three groups of 1-3 digits followed by dot
    \d{1,3}          # final group of 1-3 digits
""", re.VERBOSE)
```

---

## 🎯 Common Patterns

```python
# Email
re.match(r"[a-zA-Z0-9._%+\-]+@[a-zA-Z0-9.\-]+\.[a-zA-Z]{2,}", email)

# URL
re.match(r"https?://[^\s]+", url)

# Phone number (US)
re.match(r"\(?\d{3}\)?[\s\-]?\d{3}[\s\-]?\d{4}", phone)

# Date YYYY-MM-DD
re.match(r"\d{4}-(?:0[1-9]|1[0-2])-(?:0[1-9]|[12]\d|3[01])", date)

# IPv4 address
re.match(r"(?:\d{1,3}\.){3}\d{1,3}", ip)

# Hex color
re.match(r"#[0-9a-fA-F]{6}", color)

# Slug (URL-friendly)
re.match(r"[a-z0-9]+(?:-[a-z0-9]+)*", slug)

# Extract all URLs from HTML
re.findall(r'href=["\']([^"\']+)["\']', html)

# Remove HTML tags
re.sub(r"<[^>]+>", "", html)

# Normalize whitespace
re.sub(r"\s+", " ", text).strip()
```

---

## 📌 Quick Reference

```python
import re

# Core functions
re.search(pattern, string)     # first match anywhere
re.match(pattern, string)      # match at start
re.fullmatch(pattern, string)  # full string match
re.findall(pattern, string)    # list of matches
re.finditer(pattern, string)   # iterator of matches
re.sub(pattern, repl, string)  # replace
re.split(pattern, string)      # split

# Compiled
p = re.compile(pattern, flags)
p.search(string)

# Match object
m.group()       # whole match
m.group(n)      # nth group
m.groups()      # all groups
m.start/end/span()
m.groupdict()   # named groups

# Flags
re.I  re.M  re.S  re.X
```


---

[← Previous: Standard Library](17-standard-library.md) | [Contents](README.md) | [Next: Virtual Environments & pip →](19-virtual-environments.md)
