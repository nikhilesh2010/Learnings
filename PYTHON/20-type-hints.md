# 20: Type Hints & Dataclasses

## 🏷️ Type Hints

Type hints (PEP 484) add optional type annotations. Python doesn't enforce them at runtime — use a type checker like `mypy` or `pyright`.

```python
# Variable annotations
name: str = "Alice"
age: int = 30
scores: list[int] = [90, 85, 92]

# Function annotations
def greet(name: str, greeting: str = "Hello") -> str:
    return f"{greeting}, {name}!"

def process(items: list[int]) -> dict[str, int]:
    return {"min": min(items), "max": max(items)}
```

---

## 📦 typing Module

```python
from typing import (
    Optional, Union, Any, Callable,
    Tuple, List, Dict, Set,    # legacy (Python <3.9)
    TypeVar, Generic, Protocol,
    Literal, Final, TypedDict,
    overload, cast, TYPE_CHECKING
)

# Optional — can be None
def find_user(id: int) -> Optional[str]:   # str | None
    ...

# Union — multiple types
def process(x: Union[int, str]) -> str:   # int | str
    return str(x)

# Modern syntax (Python 3.10+)
def find(id: int) -> str | None: ...
def handle(x: int | str) -> str: ...

# Any — opt out of type checking
def dynamic(x: Any) -> Any:
    return x

# Callable
def apply(func: Callable[[int, int], int], a: int, b: int) -> int:
    return func(a, b)

# TypeVar — generic types
T = TypeVar("T")
def first(items: list[T]) -> T:
    return items[0]

# Literal — specific values
def set_direction(dir: Literal["north", "south", "east", "west"]) -> None:
    ...

# Final — constant (can't be reassigned)
MAX_SIZE: Final[int] = 100
```

---

## 🗃️ TypedDict

Type hints for dictionaries with specific keys.

```python
from typing import TypedDict

class UserData(TypedDict):
    name: str
    age: int
    email: str

class UserDataPartial(TypedDict, total=False):   # all keys optional
    name: str
    age: int

def create_user(data: UserData) -> None:
    print(data["name"])   # type checker knows this is str

user: UserData = {"name": "Alice", "age": 30, "email": "alice@example.com"}
```

---

## 🏛️ Dataclasses — Deep Dive

```python
from dataclasses import dataclass, field, KW_ONLY, asdict, astuple, replace

@dataclass
class Point:
    x: float
    y: float
    label: str = "point"                    # default value
    tags: list[str] = field(default_factory=list)  # mutable default

# Auto-generated methods: __init__, __repr__, __eq__
p = Point(1.0, 2.0)
print(p)         # Point(x=1.0, y=2.0, label='point', tags=[])
p == Point(1.0, 2.0)   # True (compares fields)
```

### Dataclass Options
```python
@dataclass(
    init=True,       # generate __init__
    repr=True,       # generate __repr__
    eq=True,         # generate __eq__
    order=False,     # generate __lt__, __le__, __gt__, __ge__
    frozen=False,    # make immutable (no __setattr__)
    slots=True,      # use __slots__ (Python 3.10+, more memory efficient)
    kw_only=False,   # all fields must be keyword-only (Python 3.10+)
)
class MyClass:
    ...

@dataclass(frozen=True)    # immutable
class ImmutablePoint:
    x: float
    y: float

@dataclass(order=True)     # enables sorting
class Score:
    # Fields compared in order for sorting
    value: int
    name: str
```

### field() Options
```python
from dataclasses import field

@dataclass
class Config:
    name: str
    tags: list[str] = field(default_factory=list)
    _private: str   = field(default="", repr=False,   init=True)
    computed: str   = field(default="", init=False)   # not in __init__
    metadata: dict  = field(default_factory=dict, compare=False)  # skip in ==

    def __post_init__(self):
        self.computed = self.name.upper()   # run after __init__
```

### Dataclass Utilities
```python
from dataclasses import asdict, astuple, replace, fields

p = Point(1.0, 2.0, label="A")

asdict(p)          # {"x": 1.0, "y": 2.0, "label": "A", "tags": []}
astuple(p)         # (1.0, 2.0, "A", [])
replace(p, x=5.0)  # new Point with x changed (non-destructive)
fields(p)          # tuple of Field objects (name, type, default, ...)
```

### Inheritance
```python
@dataclass
class Animal:
    name: str
    sound: str = ""

@dataclass
class Dog(Animal):
    breed: str = "unknown"
    # __init__ becomes: (name, sound="", breed="unknown")
```

---

## 🔑 Protocol — Structural Subtyping

Define an interface without inheritance (duck typing with type safety).

```python
from typing import Protocol

class Drawable(Protocol):
    def draw(self) -> None: ...
    def resize(self, factor: float) -> None: ...

class Circle:
    def draw(self) -> None:
        print("Drawing circle")
    def resize(self, factor: float) -> None:
        self.radius *= factor

# Circle satisfies Drawable protocol without inheriting from it!
def render(shape: Drawable) -> None:
    shape.draw()

render(Circle())   # type checker is happy
```

---

## 🔢 Generic Classes

```python
from typing import Generic, TypeVar

T = TypeVar("T")
K = TypeVar("K")
V = TypeVar("V")

class Stack(Generic[T]):
    def __init__(self) -> None:
        self._items: list[T] = []

    def push(self, item: T) -> None:
        self._items.append(item)

    def pop(self) -> T:
        return self._items.pop()

    def peek(self) -> T:
        return self._items[-1]

stack: Stack[int] = Stack()
stack.push(42)
value: int = stack.pop()
```

---

## ✅ Running mypy

```bash
# Install
pip install mypy

# Check a file
mypy my_script.py

# Check entire project
mypy src/

# Configuration (mypy.ini or pyproject.toml)
[mypy]
python_version = 3.11
strict = true
```

---

## 📌 Quick Reference

```python
# Basic hints
x: int = 5
def f(a: str, b: int = 0) -> list[str]: ...

# Optional / Union (modern)
x: str | None = None
y: int | str = 5

# Common typing
from typing import Any, Callable, TypeVar, Literal, Final

# Dataclass
from dataclasses import dataclass, field
@dataclass
class Foo:
    x: int
    y: str = "default"
    items: list[int] = field(default_factory=list)

# Protocol
from typing import Protocol
class HasName(Protocol):
    name: str
```


---

[← Previous: Virtual Environments & pip](19-virtual-environments.md) | [Contents](README.md) | [Next: Testing →](21-testing.md)
