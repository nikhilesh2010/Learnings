# 01: What is Python?

## 🚀 Introduction

**Python** is a high-level, interpreted, general-purpose programming language known for its clean syntax and readability. Created by Guido van Rossum in 1991.

### Why Python?

| Feature | Benefit |
|---------|---------|
| **Readable Syntax** | Code looks like plain English |
| **Interpreted** | Runs line-by-line, no compile step |
| **Dynamic Typing** | No need to declare variable types |
| **Versatile** | Web, data science, AI, automation, scripting |
| **Large Ecosystem** | 400,000+ PyPI packages |
| **Cross-Platform** | Windows, macOS, Linux |

---

## 📊 How Python Works

Python is an **interpreted** language. When you run a `.py` file, CPython compiles the source to bytecode (`.pyc`) and immediately executes it on the Python Virtual Machine — all automatically. You never manage compilation yourself; just run `python my_script.py` and execution begins instantly.

```
Source Code (.py) → Python Interpreter → Bytecode (.pyc) → Python VM → Output
```

```python
# Python vs other languages — simplicity wins
# Java: System.out.println("Hello, World!");
# C++:  std::cout << "Hello, World!" << std::endl;
# Python:
print("Hello, World!")
```

---

## 🏗️ Core Concepts at a Glance

### **1. Simple Syntax**
```python
# No semicolons, no curly braces — indentation defines blocks
name = "Alice"
age = 30

if age >= 18:
    print(f"{name} is an adult")
else:
    print(f"{name} is a minor")
```

### **2. Dynamic Typing**
```python
x = 10        # int
x = "hello"   # now a string — same variable!
x = [1, 2, 3] # now a list
```

### **3. Everything is an Object**
```python
# Even functions and classes are objects
print(type(42))        # <class 'int'>
print(type("hello"))   # <class 'str'>
print(type(print))     # <class 'builtin_function_or_method'>
```

### **4. The REPL**
```python
# Interactive shell — great for experimenting
>>> 2 + 3
5
>>> "hello".upper()
'HELLO'
>>> [1, 2, 3].reverse()
```

---

## 🎯 Python Use Cases

Python's readable syntax, huge ecosystem (400,000+ PyPI packages), and fast development cycle have made it dominant in **data science, machine learning, web backends, automation, and scripting**. Knowing when Python is the right tool — and when it isn't (e.g., CPU-intensive real-time systems) — is the first practical insight.

```
┌──────────────────────────────────────────────┐
│              Python Ecosystem                │
├──────────────────┬───────────────────────────┤
│  Web Dev         │  Django, Flask, FastAPI   │
│  Data Science    │  pandas, NumPy, Jupyter   │
│  Machine Learning│ TensorFlow, PyTorch       │
│  Automation      │  Selenium, pyautogui      │
│  DevOps          │  Ansible, Fabric          │
│  Scripting       │  os, subprocess, pathlib  │
└──────────────────┴───────────────────────────┘
```

---

## ⚙️ Installation & Setup

You run Python scripts with the `python` (Windows) or `python3` (macOS/Linux) command. External packages are installed with `pip`. In VS Code, use **Python: Select Interpreter** from the Command Palette to point the editor at the right environment so you get proper autocomplete and linting.

```bash
# Check if Python is installed
python --version       # Windows
python3 --version      # macOS/Linux

# Run a script
python my_script.py

# Start interactive REPL
python

# Install packages
pip install requests
```

### VS Code Setup
```bash
# Install Python extension in VS Code
# Select interpreter: Ctrl+Shift+P → "Python: Select Interpreter"
```

---

## 📝 Your First Python Program

A typical Python script wraps logic in a function (for reusability and testability) and uses the `if __name__ == '__main__':` guard to run code only when the file is executed directly — not when it's imported as a module. Every public function should have a **docstring** describing what it does and returns.

```python
# hello.py

def greet(name):
    """Return a greeting message."""
    return f"Hello, {name}!"

if __name__ == "__main__":
    message = greet("World")
    print(message)  # Hello, World!
```

---

## 🔑 Key Python Philosophy

The Zen of Python (`import this`) is a set of aphorisms that guide how Python code should be written. The essentials: **Beautiful is better than ugly. Explicit is better than implicit. Simple is better than complex. Readability counts.** When in doubt between two approaches, choose the more readable one.

```python
import this  # prints "The Zen of Python"
```

> *Beautiful is better than ugly.*  
> *Explicit is better than implicit.*  
> *Simple is better than complex.*  
> *Readability counts.*

---

## 📌 Quick Reference

A summary of Python's fundamental built-in operators for output, input, and introspection. `print()` is highly flexible with `sep` and `end` arguments. `help()` and `dir()` are invaluable for exploring any object or module interactively in the REPL.

```python
# Comments
# This is a single-line comment

"""
This is a
multi-line string / docstring
"""

# Print
print("Hello")          # Hello
print("a", "b", "c")   # a b c
print("a", "b", sep="-") # a-b
print("no newline", end="") # no newline

# Input
name = input("Enter name: ")  # reads from stdin (always returns str)

# Help
help(str)        # show docs for str
dir(list)        # show all methods of list
```


---

[Contents](README.md) | [Next: Variables & Data Types →](02-variables-and-types.md)
