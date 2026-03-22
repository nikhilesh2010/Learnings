# 11: Prototypes & Prototype Chain

## 🔗 What is a Prototype?

In JavaScript, every object has an internal link to another object called its **prototype**. When you access a property that doesn't exist on an object, JS looks up the prototype chain until it finds it or reaches `null`.

```
myObject → Object.prototype → null
myArray  → Array.prototype  → Object.prototype → null
myFunc   → Function.prototype → Object.prototype → null
```

---

## 🔍 Accessing Prototypes

```js
const arr = [1, 2, 3];

// Standard ways to get prototype
Object.getPrototypeOf(arr);  // Array.prototype ✅
arr.__proto__;               // Array.prototype (deprecated, avoid)

// Check chain
Object.getPrototypeOf(arr) === Array.prototype;           // true
Object.getPrototypeOf(Array.prototype) === Object.prototype; // true
Object.getPrototypeOf(Object.prototype);                  // null
```

---

## ⛓️ How the Prototype Chain Works

```js
const animal = {
  breathes: true,
  describe() {
    return `I breathe: ${this.breathes}`;
  },
};

const dog = Object.create(animal);  // dog's prototype = animal
dog.name = "Rex";
dog.bark = function() { return "Woof!"; };

dog.name;       // "Rex"    — own property
dog.breathes;   // true     — from animal (prototype)
dog.toString(); // "[object Object]" — from Object.prototype

// The lookup path for dog.breathes:
// 1. dog.breathes? No
// 2. animal.breathes? Yes → true ✅
```

---

## 🏭 Constructor Functions & Prototypes

```js
function Person(name, age) {
  // Instance properties — each instance gets its own copy
  this.name = name;
  this.age  = age;
}

// Shared methods — lives ONCE on the prototype
Person.prototype.greet = function() {
  return `Hi, I'm ${this.name}, age ${this.age}`;
};

Person.prototype.isAdult = function() {
  return this.age >= 18;
};

const alice = new Person("Alice", 30);
const bob   = new Person("Bob", 17);

alice.greet();   // "Hi, I'm Alice, age 30"
bob.isAdult();   // false

// Both share the SAME greet function — not duplicated
alice.greet === bob.greet;  // true ✅

// What `new` does:
// 1. Creates a blank object: {}
// 2. Sets its prototype to Person.prototype
// 3. Calls Person with `this` = new object
// 4. Returns the new object (unless constructor returns an object)
```

---

## 🧬 Prototypal Inheritance

```js
function Animal(name) {
  this.name = name;
}
Animal.prototype.speak = function() {
  return `${this.name} makes a sound.`;
};

function Dog(name, breed) {
  Animal.call(this, name);  // call parent constructor
  this.breed = breed;
}

// Set up prototype chain: Dog → Animal → Object
Dog.prototype = Object.create(Animal.prototype);
Dog.prototype.constructor = Dog;  // fix constructor reference

Dog.prototype.bark = function() {
  return `${this.name} barks!`;
};

const d = new Dog("Rex", "Lab");
d.speak();  // "Rex makes a sound."   — from Animal.prototype
d.bark();   // "Rex barks!"           — from Dog.prototype
d instanceof Dog;    // true
d instanceof Animal; // true (chain includes Animal.prototype)
```

---

## 🏗️ Object.create()

```js
// Create with specific prototype
const vehicleProto = {
  start() { return `${this.type} started`; },
  stop()  { return `${this.type} stopped`; },
};

const car = Object.create(vehicleProto);
car.type = "Car";
car.start(); // "Car started"

// Create with no prototype (pure dictionary/map)
const dict = Object.create(null);
dict.name = "Alice";
// dict has NO toString, hasOwnProperty, etc. — truly empty
"toString" in dict;   // false ✅ useful for maps

// Create with property descriptors
const obj = Object.create(vehicleProto, {
  type: { value: "Truck", writable: true, enumerable: true, configurable: true },
});
```

---

## 🔎 instanceof & isPrototypeOf

```js
const arr = [1, 2, 3];

arr instanceof Array;   // true
arr instanceof Object;  // true (Array extends Object)

// isPrototypeOf — checks if object is in the prototype chain
Array.prototype.isPrototypeOf(arr);  // true
Object.prototype.isPrototypeOf(arr); // true

// Gotcha: instanceof doesn't work across iframes (different global scopes)
// Use Array.isArray() instead for arrays
```

---

## 🏷️ hasOwnProperty & Own Properties

```js
const parent = { inherited: true };
const child  = Object.create(parent);
child.own = true;

child.own;                          // true (own)
child.inherited;                    // true (inherited)

Object.hasOwn(child, "own");        // true  ✅ (ES2022)
Object.hasOwn(child, "inherited");  // false
child.hasOwnProperty("own");        // true  (older way)

// Iterating own properties
Object.keys(child);    // ["own"] — only own enumerable
for (const key in child) {  // own + inherited enumerable!
  if (Object.hasOwn(child, key)) {
    console.log(key); // "own" only
  }
}
```

---

## 🔧 Augmenting Built-in Prototypes

```js
// ⚠️ Generally avoid augmenting built-in prototypes in libraries
// It can conflict with other code and future language additions

// Example (illustrative only):
Array.prototype.last = function() {
  return this[this.length - 1];
};
[1, 2, 3].last(); // 3

// Why it's risky:
// - Conflicts with future built-in additions (e.g., Array.prototype.at was added)
// - Breaks for...in on arrays
// - Conflicts with other libraries

// ✅ Safe alternative: utility functions
function last(arr) { return arr[arr.length - 1]; }
```

---

## 🔬 Property Lookup Performance

```js
// Properties found on the object itself are fastest
// Each prototype hop adds a tiny lookup cost

const obj = { a: 1 };  // a found immediately
// vs
const proto = { a: 1 };
const child = Object.create(proto);  // a found after 1 hop

// Deeply nested chains are slower (though engine optimization helps)
// Practical advice: flatten inheritance where possible
```

---

## 📋 Prototype vs Class (same thing)

```js
// Constructor function way:
function Rectangle(w, h) {
  this.width = w;
  this.height = h;
}
Rectangle.prototype.area = function() { return this.width * this.height; };

// Class way (sugar over the above — identical runtime behaviour):
class Rectangle {
  constructor(w, h) {
    this.width = w;
    this.height = h;
  }
  area() { return this.width * this.height; }  // on Rectangle.prototype
}

// Both produce the same prototype chain
```

---

## 🔑 Key Takeaways

- Every JS object has a prototype — it's the foundation of inheritance.
- The **prototype chain** is traversed until a property is found or `null` is reached.
- Methods on `Foo.prototype` are **shared** by all instances — efficient memory use.
- `Object.create(proto)` is the cleanest way to set up prototype chains.
- `Object.hasOwn(obj, key)` checks own properties (not inherited).
- ES6 **classes** are syntax sugar over prototype-based inheritance — they produce the same chain.
- Avoid modifying built-in prototypes (`Array.prototype`, `Object.prototype`).

---

[← Previous: JSON](12-json.md) | [Contents](README.md) | [Next: Classes (ES6+) →](14-classes.md)
