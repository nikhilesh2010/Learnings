# 03: Control Flow

## 🔀 if / elif / else

```python
age = 20

if age < 13:
    print("Child")
elif age < 18:
    print("Teenager")
elif age < 65:
    print("Adult")
else:
    print("Senior")
```

### Ternary (One-liner)
```python
# value_if_true if condition else value_if_false
label = "adult" if age >= 18 else "minor"
print(label)   # adult
```

### Truthy / Falsy
```python
# These all evaluate as False:
# 0, 0.0, "", [], {}, set(), None, False

name = ""
if not name:
    print("Name is empty")

items = [1, 2, 3]
if items:
    print("List has items")
```

---

## 🔁 for Loops

```python
# Iterate over a sequence
fruits = ["apple", "banana", "cherry"]
for fruit in fruits:
    print(fruit)

# range() — generate numbers
for i in range(5):          # 0, 1, 2, 3, 4
    print(i)

for i in range(1, 6):       # 1, 2, 3, 4, 5
    print(i)

for i in range(0, 10, 2):   # 0, 2, 4, 6, 8 (step=2)
    print(i)

for i in range(10, 0, -1):  # 10, 9, ..., 1 (count down)
    print(i)
```

### Useful Loop Patterns
```python
# enumerate — get index AND value
for i, fruit in enumerate(fruits):
    print(f"{i}: {fruit}")
# 0: apple
# 1: banana
# 2: cherry

# zip — iterate two lists together
names = ["Alice", "Bob"]
scores = [95, 87]
for name, score in zip(names, scores):
    print(f"{name}: {score}")

# zip with enumerate
for i, (name, score) in enumerate(zip(names, scores)):
    print(f"{i+1}. {name}: {score}")

# Iterate over dict
user = {"name": "Alice", "age": 30}
for key in user:             # keys
    print(key)
for value in user.values():  # values
    print(value)
for key, value in user.items():  # both
    print(f"{key} = {value}")
```

---

## 🔄 while Loops

```python
count = 0
while count < 5:
    print(count)
    count += 1

# while with condition
data = None
while data is None:
    data = fetch_data()   # keep trying

# Infinite loop with break
while True:
    command = input("Enter command: ")
    if command == "quit":
        break
    process(command)
```

---

## ⏭️ break, continue, pass

```python
# break — exit the loop entirely
for i in range(10):
    if i == 5:
        break
    print(i)    # 0, 1, 2, 3, 4

# continue — skip to next iteration
for i in range(10):
    if i % 2 == 0:
        continue    # skip even numbers
    print(i)    # 1, 3, 5, 7, 9

# pass — do nothing (placeholder)
for i in range(10):
    pass    # valid empty loop

def todo():
    pass    # implement later

class Empty:
    pass
```

### for / else and while / else
```python
# else on a loop runs if loop completed WITHOUT a break
for i in range(5):
    if i == 10:   # never true
        break
else:
    print("Loop completed normally")  # this runs

# Useful for search pattern
for user in users:
    if user.id == target_id:
        print("Found!")
        break
else:
    print("User not found")
```

---

## 🔀 match / case (Python 3.10+)

Python's structural pattern matching — like `switch` but much more powerful.

```python
status = 404

match status:
    case 200:
        print("OK")
    case 404:
        print("Not Found")
    case 500:
        print("Server Error")
    case _:           # default
        print("Unknown status")
```

### Pattern Matching with Structure
```python
point = (1, 0)

match point:
    case (0, 0):
        print("Origin")
    case (x, 0):
        print(f"On x-axis at {x}")
    case (0, y):
        print(f"On y-axis at {y}")
    case (x, y):
        print(f"Point at ({x}, {y})")

# Match dicts
command = {"action": "move", "direction": "north"}

match command:
    case {"action": "move", "direction": direction}:
        print(f"Moving {direction}")
    case {"action": "stop"}:
        print("Stopping")
```

---

## 🎯 Comprehension Expressions (Preview)

```python
# Instead of:
squares = []
for i in range(10):
    squares.append(i ** 2)

# Write:
squares = [i ** 2 for i in range(10)]

# With condition:
evens = [i for i in range(20) if i % 2 == 0]
```

> See [11-comprehensions.md](11-comprehensions.md) for full coverage.

---

## 📌 Quick Reference

```python
# if/elif/else
if cond1:
    ...
elif cond2:
    ...
else:
    ...

# Ternary
result = "yes" if condition else "no"

# for
for item in iterable: ...
for i in range(n): ...
for i, v in enumerate(seq): ...
for a, b in zip(s1, s2): ...

# while
while condition: ...
while True:
    if done: break

# Loop control
break      # exit loop
continue   # next iteration
pass       # do nothing
```


---

[← Previous: Variables & Data Types](02-variables-and-types.md) | [Contents](README.md) | [Next: Functions →](04-functions.md)
