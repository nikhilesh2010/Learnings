# 08: Object-Oriented Programming

## 🏛️ Classes & Objects

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

## 💾 Dataclasses (Python 3.7+)

Reduce boilerplate for data-focused classes.

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
