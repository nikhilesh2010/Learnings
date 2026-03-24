# 08: Object-Oriented Programming

Object-Oriented Programming (OOP) is a way of organizing code around **objects** — self-contained units that bundle together data (attributes) and the functions that work with that data (methods). Instead of writing a procedure that acts on separate data, you define a **class** (a blueprint) and create **instances** (objects) from it.

The four core principles of OOP are:
- **Encapsulation** — bundling data and methods together, and hiding internal details
- **Inheritance** — a child class can reuse and extend a parent class
- **Polymorphism** — different classes can be used interchangeably if they share a common interface
- **Abstraction** — exposing only what is needed, hiding the implementation

## 🏛️ Classes & Objects

A **class** is a blueprint/template. An **object** (or instance) is a specific thing created from that blueprint. You define a class with `class`, and create objects by calling the class like a function.

- `__init__` is the **constructor** — it runs automatically when you create an object and sets up the initial state.
- `self` refers to the current object instance. All instance methods must take `self` as the first argument.
- **Instance attributes** (e.g., `self.name`) are unique per object.
- **Class attributes** (e.g., `species = "..."` at class level) are shared by all instances.
- `__str__` defines what you see when you `print()` the object (human-readable).
- `__repr__` defines the developer representation (ideally shows how to recreate the object).

```python
# Define a class
class Dog:
    # Class attribute — shared by all instances
    species = "Canis lupus familiaris"

    # __init__ is the constructor
    def __init__(self, name, age):
        # Instance attributes — unique per object
        self.name = name
        self.age  = age

    # Instance method
    def bark(self):
        return f"{self.name} says: Woof!"

    def __str__(self):
        return f"Dog(name={self.name}, age={self.age})"

    def __repr__(self):
        return f"Dog({self.name!r}, {self.age!r})"

# Create objects
dog1 = Dog("Rex", 3)
dog2 = Dog("Luna", 5)

print(dog1.name)       # Rex
print(dog1.bark())     # Rex says: Woof!
print(dog1)            # Dog(name=Rex, age=3)  ← __str__
print(repr(dog1))      # Dog('Rex', 3)         ← __repr__
print(Dog.species)     # Canis lupus familiaris
```

---

## 🔒 Access & Properties

By convention, Python uses a leading underscore `_` to signal that an attribute is **internal** (not part of the public API). Two leading underscores `__` trigger **name mangling** (renames the attribute to `_ClassName__attr`) to prevent accidental overrides in subclasses.

The `@property` decorator lets you define a **getter** that looks like a regular attribute from the outside but runs logic under the hood. Paired with `@attr.setter`, you can add validation when someone tries to set the value. This replaces the need for explicit `get_x()` / `set_x()` methods.

```python
class BankAccount:
    def __init__(self, owner, balance=0):
        self.owner = owner
        self._balance = balance    # _ convention: "internal use"

    @property
    def balance(self):
        """Getter — access like an attribute, not a method."""
        return self._balance

    @balance.setter
    def balance(self, value):
        """Setter — runs when balance = x is used."""
        if value < 0:
            raise ValueError("Balance cannot be negative")
        self._balance = value

    @balance.deleter
    def balance(self):
        del self._balance

acc = BankAccount("Alice", 1000)
print(acc.balance)      # 1000 — calls getter
acc.balance = 1500      # calls setter
acc.balance = -1        # ValueError!
```

---

## 🧬 Inheritance

**Inheritance** allows a child class to **reuse** all the attributes and methods of a parent class, and optionally **override** or **extend** them. This avoids code duplication when multiple classes share common behavior.

- The child class declares its parent in parentheses: `class Dog(Animal):`
- If the child doesn't define a method, Python automatically looks it up in the parent.
- You can override a parent method by simply defining a method with the same name in the child.
- `isinstance(obj, Class)` checks if an object is an instance of a class **or any of its parents**.

```python
class Animal:
    def __init__(self, name):
        self.name = name

    def speak(self):
        raise NotImplementedError("Subclass must implement speak()")

    def __str__(self):
        return f"{type(self).__name__}({self.name})"

class Dog(Animal):
    def speak(self):
        return f"{self.name} says: Woof!"

    def fetch(self):
        return f"{self.name} fetches the ball!"

class Cat(Animal):
    def speak(self):
        return f"{self.name} says: Meow!"

dog = Dog("Rex")
cat = Cat("Luna")

print(dog.speak())   # Rex says: Woof!
print(cat.speak())   # Luna says: Meow!

# isinstance / issubclass
isinstance(dog, Dog)     # True
isinstance(dog, Animal)  # True — checks hierarchy
issubclass(Dog, Animal)  # True
```

### super()
`super()` gives you access to the parent class. Its most common use is in `__init__` — when the child class needs its own initialization logic but also needs to run the parent's `__init__` to set up the base attributes. Without calling `super().__init__()`, the parent's setup would be skipped.

```python
class Rectangle:
    def __init__(self, width, height):
        self.width  = width
        self.height = height

    def area(self):
        return self.width * self.height

class Square(Rectangle):
    def __init__(self, side):
        super().__init__(side, side)   # call parent __init__

    def __repr__(self):
        return f"Square(side={self.width})"

s = Square(5)
print(s.area())   # 25
```

### Multiple Inheritance
Python allows a class to inherit from **more than one parent**. When the same method name exists in multiple parents, Python uses the **MRO (Method Resolution Order)** — a specific lookup order computed by the C3 linearization algorithm — to decide which parent's method to call. You can inspect it with `ClassName.__mro__`.

```python
class Flyable:
    def fly(self):
        return "I can fly!"

class Swimmable:
    def swim(self):
        return "I can swim!"

class Duck(Animal, Flyable, Swimmable):
    def speak(self):
        return "Quack!"

d = Duck("Donald")
d.speak()   # Quack!
d.fly()     # I can fly!
d.swim()    # I can swim!

# Python uses MRO (Method Resolution Order)
print(Duck.__mro__)
```

---

## 🔧 Class & Static Methods

Python has three types of methods in a class:

1. **Instance method** (normal method): takes `self`. Works with a specific object's data. Most methods you write are instance methods.
2. **Class method** (`@classmethod`): takes `cls` (the class itself) instead of an instance. Used to access or modify class-wide state, and very commonly used as **alternative constructors** (factory methods) that create instances in different ways.
3. **Static method** (`@staticmethod`): takes neither `self` nor `cls`. Just a regular utility function that lives inside the class for organizational purposes. It has no access to the class or instance.

```python
class User:
    _count = 0   # class variable

    def __init__(self, name, email):
        self.name  = name
        self.email = email
        User._count += 1

    @classmethod
    def get_count(cls):
        """Access class state. cls = the class itself."""
        return cls._count

    @classmethod
    def from_string(cls, s):
        """Alternative constructor — factory method."""
        name, email = s.split(",")
        return cls(name.strip(), email.strip())

    @staticmethod
    def validate_email(email):
        """No access to class or instance — pure utility."""
        return "@" in email and "." in email

u1 = User("Alice", "alice@example.com")
u2 = User.from_string("Bob, bob@example.com")

User.get_count()                   # 2
User.validate_email("bad-email")   # False
```

---

## 🔮 Dunder (Magic) Methods

**Dunder methods** (double-underscore methods, also called **magic methods** or **special methods**) are methods with names like `__add__`, `__len__`, `__str__`. They are called automatically by Python when you use built-in operations on your objects.

For example:
- `__add__` is called when you write `obj1 + obj2`
- `__len__` is called when you write `len(obj)`
- `__str__` is called when you `print(obj)`
- `__iter__` is called when you loop over the object with `for`
- `__call__` is called when you call the object like a function: `obj(args)`

By implementing these methods, your custom class behaves like a built-in Python type and works naturally with Python's operators and functions.

```python
class Vector:
    def __init__(self, x, y):
        self.x, self.y = x, y

    # String representations
    def __str__(self):   return f"Vector({self.x}, {self.y})"
    def __repr__(self):  return f"Vector(x={self.x}, y={self.y})"

    # Arithmetic operators
    def __add__(self, other):  return Vector(self.x + other.x, self.y + other.y)
    def __sub__(self, other):  return Vector(self.x - other.x, self.y - other.y)
    def __mul__(self, scalar): return Vector(self.x * scalar, self.y * scalar)

    # Comparison
    def __eq__(self, other):   return self.x == other.x and self.y == other.y
    def __lt__(self, other):   return abs(self) < abs(other)

    # Length
    def __len__(self):  return 2
    def __abs__(self):  return (self.x**2 + self.y**2) ** 0.5

    # Iteration
    def __iter__(self): return iter((self.x, self.y))

    # Subscript
    def __getitem__(self, i): return (self.x, self.y)[i]

    # Callable
    def __call__(self, scale):  return Vector(self.x * scale, self.y * scale)

v1 = Vector(1, 2)
v2 = Vector(3, 4)
print(v1 + v2)    # Vector(4, 6)
print(v1 == v2)   # False
print(abs(v2))    # 5.0
x, y = v1         # unpack via __iter__
```

---

## 🔒 Encapsulation

**Encapsulation** means keeping an object's internal data **private** and only allowing access through controlled methods. The idea is to hide the implementation details — callers should interact with clean public methods, not reach in and modify internal state directly.

In Python, there is no hard `private` keyword like in Java, but the conventions are:
- **`_attr`** (single underscore) — "internal use" signal. Still accessible, but treated as private by convention.
- **`__attr`** (double underscore) — triggers **name mangling** (`_ClassName__attr`), making it harder to accidentally access from outside the class. Used to protect attributes in complex inheritance hierarchies.
- **`@property`** — the Pythonic way to expose controlled read/write access with validation.

```python
class BankAccount:
    def __init__(self, owner, balance):
        self.owner = owner          # public — anyone can access
        self._balance = balance     # "internal" — please don't touch directly
        self.__pin = 1234           # name-mangled — strongly hidden

    @property
    def balance(self):
        return self._balance        # controlled read access

    def deposit(self, amount):
        if amount <= 0:
            raise ValueError("Deposit must be positive")
        self._balance += amount     # only modified through a method

    def withdraw(self, amount):
        if amount > self._balance:
            raise ValueError("Insufficient funds")
        self._balance -= amount

acc = BankAccount("Alice", 1000)

# ✅ Access through controlled methods
acc.deposit(500)
print(acc.balance)     # 1500

# ⚠️ Direct access to _balance works but breaks the contract
acc._balance = 99999   # possible but frowned upon

# ✅ Name mangling — __pin is hard to access
# acc.__pin              # AttributeError
# acc._BankAccount__pin  # works, but really shouldn't be done
```

---

## 🐾 Polymorphism

**Polymorphism** means "many forms" — different objects can be used **interchangeably** as long as they support the same interface (i.e., the same method names). You write code that works with a general type, and it works correctly regardless of which specific class you pass in.

There are two main kinds in Python:
1. **Method overriding** — child classes provide their own implementation of a method defined in the parent. When you call `animal.speak()`, the right version runs based on the actual object type.
2. **Duck typing** — Python doesn't care about the type of an object, only whether it has the method you're calling. "If it walks like a duck and quacks like a duck, it's a duck." This means unrelated classes can be used together as long as they have the same method names.

```python
# --- Method overriding Polymorphism ---
class Animal:
    def speak(self):
        raise NotImplementedError

class Dog(Animal):
    def speak(self):
        return "Woof!"

class Cat(Animal):
    def speak(self):
        return "Meow!"

class Duck(Animal):
    def speak(self):
        return "Quack!"

# Polymorphic function — works for ANY Animal subclass
def make_noise(animal):
    print(animal.speak())

animals = [Dog(), Cat(), Duck()]
for a in animals:
    make_noise(a)   # Woof! / Meow! / Quack!
    # Python automatically calls the right speak() for each object

# --- Duck Typing ---
class Robot:
    def speak(self):
        return "Beep boop!"

# Robot doesn't inherit Animal, but it still works here
make_noise(Robot())   # Beep boop!
# Python only checks: does this object have a speak() method? Yes → run it.
```

---

## 🎭 Abstraction

**Abstraction** means hiding complex implementation details and exposing only a **clean, simple interface** to the outside world. The user of a class doesn't need to know *how* it works internally, only *what* it can do.

Python's `abc` module provides **Abstract Base Classes (ABCs)** to formally enforce this. An abstract class defines the interface (what methods must exist) but leaves the implementation to subclasses. You cannot instantiate an abstract class directly — it exists only as a contract.
- `@abstractmethod` marks a method that **must** be overridden by any concrete (non-abstract) subclass.
- If a subclass doesn't implement all abstract methods, Python raises a `TypeError` when you try to create an instance.

```python
from abc import ABC, abstractmethod

# Abstract class — defines the interface, no full implementation
class Shape(ABC):
    @abstractmethod
    def area(self) -> float:
        """All shapes must implement area()."""
        pass

    @abstractmethod
    def perimeter(self) -> float:
        """All shapes must implement perimeter()."""
        pass

    def describe(self):
        # Concrete method — shared by all subclasses
        return f"Area: {self.area():.2f}, Perimeter: {self.perimeter():.2f}"

# Concrete subclass — provides actual implementations
class Circle(Shape):
    def __init__(self, radius):
        self.radius = radius

    def area(self):
        import math
        return math.pi * self.radius ** 2

    def perimeter(self):
        import math
        return 2 * math.pi * self.radius

class Rectangle(Shape):
    def __init__(self, width, height):
        self.width  = width
        self.height = height

    def area(self):
        return self.width * self.height

    def perimeter(self):
        return 2 * (self.width + self.height)

# Shape()      # TypeError — cannot instantiate abstract class
c = Circle(5)
r = Rectangle(4, 6)

print(c.describe())   # Area: 78.54, Perimeter: 31.42
print(r.describe())   # Area: 24.00, Perimeter: 20.00

# Both work identically from the caller's POV — abstraction in action
shapes = [Circle(3), Rectangle(2, 5), Circle(7)]
total_area = sum(s.area() for s in shapes)
```

---

## 💾 Dataclasses (Python 3.7+)

A **dataclass** is a class that mainly exists to hold data. Normally, writing a class just to hold a few values requires a lot of boilerplate: `__init__`, `__repr__`, `__eq__`. The `@dataclass` decorator auto-generates all of these from the field annotations you declare. It's the cleanest way to define simple data containers.

- Fields are declared with type annotations (e.g., `x: float`)
- You can set defaults with `= value` or with `field()` for mutable defaults like lists
- `frozen=True` makes the dataclass immutable (like a named tuple)
- `order=True` auto-generates comparison methods (`<`, `>`, etc.) based on field order

```python
from dataclasses import dataclass, field

@dataclass
class Point:
    x: float
    y: float
    label: str = "point"          # default value
    tags: list = field(default_factory=list)  # mutable default

    def distance_to_origin(self):
        return (self.x**2 + self.y**2) ** 0.5

p = Point(3.0, 4.0)
print(p)                           # Point(x=3.0, y=4.0, label='point', tags=[])
print(p.distance_to_origin())      # 5.0

# Auto-generates __init__, __repr__, __eq__

@dataclass(frozen=True)   # immutable
class Color:
    r: int
    g: int
    b: int

@dataclass(order=True)    # enables <, >, <=, >=
class Score:
    value: int
    name: str
```

---

## 📌 Quick Reference
A concise cheatsheet of Python's OOP syntax: defining classes, instance/class/static methods, properties, inheritance, and dataclasses.
```python
# Class
class MyClass(Parent):
    class_var = 0

    def __init__(self, x):
        self.x = x

    def method(self): ...

    @classmethod
    def from_x(cls, x): return cls(x)

    @staticmethod
    def util(): ...

    @property
    def value(self): return self._x

    @value.setter
    def value(self, v): self._x = v

# Dataclass
from dataclasses import dataclass
@dataclass
class Point:
    x: float
    y: float = 0.0
```


---

[← Previous: File I/O](07-file-io.md) | [Contents](README.md) | [Next: Modules & Packages →](09-modules-and-packages.md)
