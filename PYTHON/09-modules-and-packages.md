# 09: Modules & Packages

## 📦 What are Modules?

A **module** is any `.py` file. A **package** is a directory containing modules and an `__init__.py`.

```
my_project/
├── main.py
├── utils.py          ← module
└── services/
    ├── __init__.py   ← makes this a package
    ├── auth.py       ← module inside package
    └── email.py
```

---

## 🔄 Importing

```python
# Import module (namespace stays separate)
import math
math.sqrt(16)     # 4.0
math.pi           # 3.14159...

# Import specific names
from math import sqrt, pi
sqrt(16)          # 4.0 (no prefix needed)
pi                # 3.14159...

# Import with alias
import numpy as np
from datetime import datetime as dt

# Import everything (avoid — pollutes namespace)
from math import *

# Import your own modules
from utils import format_date, parse_config
from services.auth import login, logout
from services import email   # import submodule
```

---

## ✍️ Creating Modules

```python
# utils.py

def greet(name: str) -> str:
    """Return a greeting message."""
    return f"Hello, {name}!"

def clamp(value, low, high):
    return max(low, min(high, value))

# Module-level constant
VERSION = "1.0.0"

# Code only runs when this file is executed directly
if __name__ == "__main__":
    print(greet("World"))
```

```python
# main.py
from utils import greet, VERSION

print(greet("Alice"))   # Hello, Alice!
print(VERSION)          # 1.0.0
```

---

## 📂 Packages

```python
# services/__init__.py
# Can be empty, or export things for convenience

from .auth import login, logout     # re-export
from .email import send_email

__all__ = ["login", "logout", "send_email"]   # controls `from pkg import *`
```

```python
# services/auth.py
def login(username, password):
    ...

def logout(user_id):
    ...
```

```python
# main.py
from services import login      # works because of __init__.py re-export
from services.auth import login # also works (direct path)
```

### Relative Imports (inside packages)
```python
# services/email.py
from .auth import get_user        # relative: same package
from ..utils import format_date   # relative: parent package
```

---

## 🏗️ `__name__` and `__main__`

```python
# script.py

def main():
    print("Running main logic")

# This block only runs when file is executed directly
# NOT when imported as a module
if __name__ == "__main__":
    main()
```

```bash
python script.py     # __name__ == "__main__" → main() runs
# vs.
python -c "import script"  # __name__ == "script" → main() does NOT run
```

---

## 📦 Package Management with pip

```bash
# Install a package
pip install requests

# Install specific version
pip install requests==2.28.0

# Install from requirements file
pip install -r requirements.txt

# Upgrade a package
pip install --upgrade requests

# Uninstall
pip uninstall requests

# List installed packages
pip list

# Show package info
pip show requests

# Freeze installed packages to file
pip freeze > requirements.txt
```

---

## 📋 requirements.txt

```
# requirements.txt
requests==2.31.0
python-dotenv>=1.0.0
click~=8.1.0        # ~= means compatible release
fastapi             # no version pin (latest)
```

---

## 🏢 pyproject.toml (Modern)

```toml
# pyproject.toml — modern standard (PEP 517/518)
[project]
name = "my-package"
version = "1.0.0"
description = "My awesome package"
requires-python = ">=3.11"
dependencies = [
    "requests>=2.28",
    "click>=8.0",
]

[project.optional-dependencies]
dev = ["pytest", "black", "mypy"]

[build-system]
requires = ["setuptools>=68"]
build-backend = "setuptools.backends.legacy:build"
```

---

## 🔍 Module Internals

```python
import math

# See what's in a module
dir(math)            # list all attributes/functions

# Module file location
math.__file__        # /path/to/math.so (or .py)

# Module documentation
help(math)
math.__doc__

# All public names (controlled by __all__)
math.__all__          # not set → all non-underscore names exported
```

---

## 🌐 The Python Standard Library (Top Modules)

```python
import os           # OS interface (files, env, paths)
import sys          # Python interpreter info
import re           # Regular expressions
import json         # JSON encoding/decoding
import csv          # CSV files
import math         # Math functions
import random       # Random numbers
import datetime     # Date and time
import time         # Time functions
import collections  # Container data types
import itertools    # Efficient iterators
import functools    # Higher-order functions
import pathlib      # Object-oriented paths
import logging      # Logging framework
import unittest     # Testing framework
import subprocess   # Run shell commands
import threading    # Threads
import multiprocessing  # Processes
import socket       # Low-level networking
import http.client  # HTTP client
import urllib       # URL handling
import hashlib      # Hashing (SHA, MD5)
import base64       # Base64 encoding
import copy         # Shallow/deep copy
import io           # I/O streams
import struct       # Binary data
import pickle       # Serialize Python objects
import gzip / zipfile / tarfile  # Compression
import argparse     # CLI argument parsing
import configparser # .ini config files
import dataclasses  # Dataclasses
import typing       # Type hints
import abc          # Abstract base classes
import contextlib   # Context managers
import textwrap     # Text wrapping
import shutil       # High-level file operations
import tempfile     # Temporary files
import platform     # Platform info
import traceback    # Stack traces
import inspect      # Introspection
import ast          # Abstract syntax tree
import dis          # Bytecode disassembler
import pdb          # Debugger
import profile/cProfile  # Profiler
```

> See [17-standard-library.md](17-standard-library.md) for deep dives.

---

## 📌 Quick Reference

```python
# Import
import module
from module import name
from package.submodule import func
import module as alias

# Create module
# Any .py file is a module
# Use if __name__ == "__main__": for runnable scripts

# pip
# pip install pkg
# pip freeze > requirements.txt
# pip install -r requirements.txt
```


---

[← Previous: Object-Oriented Programming](08-oop.md) | [Contents](README.md) | [Next: Error Handling →](10-error-handling.md)
