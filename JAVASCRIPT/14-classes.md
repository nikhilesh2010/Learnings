# 12: Classes (ES6+)

## 🏗️ Class Basics

Classes are **syntactic sugar** over prototype-based inheritance. They produce the same prototype chain as constructor functions but with cleaner syntax.

```js
class Animal {
  // Constructor runs when `new Animal()` is called
  constructor(name, sound) {
    this.name  = name;   // instance property
    this.sound = sound;
  }

  // Method — placed on Animal.prototype (shared by all instances)
  speak() {
    return `${this.name} says ${this.sound}!`;
  }

  // toString override
  toString() {
    return `Animal(${this.name})`;
  }
}

const cat = new Animal("Kitty", "meow");
cat.speak();    // "Kitty says meow!"
String(cat);    // "Animal(Kitty)"
```

---

## 🧬 Inheritance with extends

The `extends` keyword sets up a prototype chain between two classes. The derived class must call `super()` before accessing `this` in its constructor. Methods defined in the child class override the parent's; use `super.methodName()` to call the parent implementation explicitly.

```js
class Animal {
  constructor(name) {
    this.name = name;
  }
  speak() {
    return `${this.name} makes a sound.`;
  }
}

class Dog extends Animal {
  constructor(name, breed) {
    super(name);       // MUST call super() before using `this`
    this.breed = breed;
  }

  // Override parent method
  speak() {
    return `${this.name} barks!`;
  }

  // Extend parent method
  describe() {
    return `${super.speak()} (${this.breed})`;
  }
}

const rex = new Dog("Rex", "Labrador");
rex.speak();       // "Rex barks!"
rex.describe();    // "Rex barks! (Labrador)"

rex instanceof Dog;    // true
rex instanceof Animal; // true ✅ extends creates proper chain
```

---

## 🔒 Public, Private & Static

### Public Fields (ES2022)

```js
class Counter {
  count = 0;           // public instance field
  step  = 1;           // public field with default

  constructor(step = 1) {
    this.step = step;  // can also set via constructor
  }
}
const c = new Counter(2);
c.count;  // 0
c.step;   // 2
```

### Private Fields `#` (ES2022)

```js
class BankAccount {
  #balance = 0;       // private field — truly private
  #owner;             // private field

  constructor(owner, initialBalance = 0) {
    this.#owner   = owner;
    this.#balance = initialBalance;
  }

  deposit(amount) {
    if (amount <= 0) throw new RangeError("Amount must be positive");
    this.#balance += amount;
    return this;       // chain-friendly
  }

  withdraw(amount) {
    if (amount > this.#balance) throw new Error("Insufficient funds");
    this.#balance -= amount;
    return this;
  }

  get balance() { return this.#balance; }  // public getter

  toString() {
    return `${this.#owner}'s account: $${this.#balance}`;
  }
}

const acc = new BankAccount("Alice", 1000);
acc.deposit(500).withdraw(200);
acc.balance;    // 1300
acc.#balance;   // SyntaxError — genuinely inaccessible ✅
```

### Static Members

```js
class MathUtils {
  static PI = 3.14159;  // static field

  static square(n)  { return n * n; }
  static cube(n)    { return n * n * n; }
  static clamp(n, min, max) { return Math.min(Math.max(n, min), max); }
}

MathUtils.PI;          // 3.14159
MathUtils.square(5);   // 25  — called on CLASS, not instance
// new MathUtils().square(); // works but wrong convention

// Static in inheritance
class ExtendedMath extends MathUtils {
  static hypot(a, b) { return Math.sqrt(a*a + b*b); }
}
ExtendedMath.square(4);  // 16 — inherited static methods ✅
```

---

## 🔧 Getters & Setters

Getters and setters are accessor properties that look like plain property accesses from the outside but execute a function when read or written. They are useful for computed properties, lazy initialisation, and input validation on assignment without exposing internal state.

```js
class Temperature {
  #celsius;

  constructor(celsius) {
    this.#celsius = celsius;
  }

  // Getter
  get celsius()    { return this.#celsius; }
  get fahrenheit() { return this.#celsius * 9/5 + 32; }
  get kelvin()     { return this.#celsius + 273.15; }

  // Setter with validation
  set celsius(value) {
    if (value < -273.15) throw new RangeError("Temperature below absolute zero!");
    this.#celsius = value;
  }

  set fahrenheit(f) {
    this.celsius = (f - 32) * 5/9;  // reuse setter with validation
  }
}

const temp = new Temperature(100);
temp.celsius;      // 100
temp.fahrenheit;   // 212
temp.kelvin;       // 373.15

temp.fahrenheit = 32;
temp.celsius;      // 0
```

---

## 🔂 Iterators in Classes

A class becomes iterable by implementing the `[Symbol.iterator]()` method, which must return an iterator object with a `next()` method. Once a class is iterable, its instances work with `for...of`, the spread operator, and destructuring.

```js
class Range {
  constructor(start, end, step = 1) {
    this.start = start;
    this.end   = end;
    this.step  = step;
  }

  // Makes the class iterable (for...of, spread, destructuring)
  [Symbol.iterator]() {
    let current = this.start;
    const { end, step } = this;

    return {
      next() {
        if (current <= end) {
          const value = current;
          current += step;
          return { value, done: false };
        }
        return { value: undefined, done: true };
      },
    };
  }
}

const range = new Range(1, 10, 2);
[...range];           // [1, 3, 5, 7, 9]
for (const n of range) console.log(n); // 1 3 5 7 9
```

---

## 🏭 Static Factory Methods

Static factory methods are named constructors on the class itself that provide alternative ways to create instances. They make code more expressive by replacing overloaded constructors with clearly named alternatives like `fromHex` or `fromArray`.

```js
class Color {
  #r; #g; #b;

  constructor(r, g, b) {
    this.#r = r; this.#g = g; this.#b = b;
  }

  // Factory methods — readable constructors
  static fromHex(hex) {
    const r = parseInt(hex.slice(1, 3), 16);
    const g = parseInt(hex.slice(3, 5), 16);
    const b = parseInt(hex.slice(5, 7), 16);
    return new Color(r, g, b);
  }

  static fromArray([r, g, b]) {
    return new Color(r, g, b);
  }

  toHex() {
    return `#${[this.#r, this.#g, this.#b]
      .map(v => v.toString(16).padStart(2, "0"))
      .join("")}`;
  }
}

Color.fromHex("#ff5733").toHex();      // "#ff5733"
Color.fromArray([255, 87, 51]).toHex(); // "#ff5733"
```

---

## 🔄 Mixins (Multiple Inheritance)

JS classes only allow single inheritance, but mixins simulate multiple inheritance:

```js
// Mixin factory
const Serializable = (Base) => class extends Base {
  serialize()   { return JSON.stringify(this); }
  toJSON()      { return Object.fromEntries(
    Object.entries(this).filter(([k]) => !k.startsWith("_"))
  ); }
};

const Validatable = (Base) => class extends Base {
  validate() {
    return Object.entries(this.constructor.rules ?? {})
      .every(([field, fn]) => fn(this[field]));
  }
};

// Apply mixins
class User extends Serializable(Validatable(class {})) {
  static rules = {
    name:  name  => typeof name === "string" && name.length > 0,
    email: email => /\S+@\S+\.\S+/.test(email),
  };

  constructor(name, email) {
    super();
    this.name  = name;
    this.email = email;
  }
}

const user = new User("Alice", "alice@example.com");
user.validate();   // true
user.serialize();  // '{"name":"Alice","email":"alice@example.com"}'
```

---

## 📋 Abstract Classes (Pattern)

JS doesn't have built-in abstract classes, but you can enforce the pattern:

```js
class Shape {
  constructor() {
    if (new.target === Shape) {
      throw new Error("Shape is abstract — cannot instantiate directly");
    }
  }

  // Abstract method
  area() {
    throw new Error(`${this.constructor.name} must implement area()`);
  }

  // Concrete method
  toString() {
    return `${this.constructor.name} with area ${this.area().toFixed(2)}`;
  }
}

class Circle extends Shape {
  #r;
  constructor(r) { super(); this.#r = r; }
  area() { return Math.PI * this.#r ** 2; }
}

class Rectangle extends Shape {
  constructor(w, h) { super(); this.w = w; this.h = h; }
  area() { return this.w * this.h; }
}

new Shape();      // Error: Shape is abstract
new Circle(5);    // ✅
new Rectangle(4, 6).toString(); // "Rectangle with area 24.00"
```

---

## 🔑 Key Takeaways

- `class` is syntactic sugar — the prototype chain is identical to constructor functions.
- Always call `super()` first in a subclass constructor.
- `#field` creates **truly private** fields (not just convention like `_field`).
- `static` members belong to the class itself, not instances.
- Use **factory static methods** for multiple constructor signatures.
- Use **mixins** to compose behaviour from multiple sources.
- `get`/`set` create computed, validated property access.

---

[← Previous: Prototypes & Prototype Chain](13-prototypes.md) | [Contents](README.md) | [Next: Destructuring, Spread & Rest →](15-destructuring-spread-rest.md)
