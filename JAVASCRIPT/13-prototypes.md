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

Use `Object.getPrototypeOf(obj)` to read an object's prototype — the modern, standards-recommended approach. The `__proto__` accessor is deprecated and should be avoided in new code. Following the chain to `null` will traverse the entire inheritance hierarchy.

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

When you access a property that an object does not own, JavaScript walks up the prototype chain looking for it. This continues until the property is found or the end of the chain (`null`) is reached, at which point `undefined` is returned. Methods placed on the prototype are shared by every instance that inherits from it.

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

When a function is called with `new`, JavaScript creates a new object whose prototype is set to `Function.prototype`. Properties set with `this` inside the constructor become own properties of the instance, while methods placed on `Constructor.prototype` are shared across all instances, saving memory.

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

To set up an inheritance chain between two constructor functions, assign a new object created from the parent's `prototype` as the child's `prototype`, then restore the `constructor` reference. The child's constructor should call the parent constructor with `call` to initialise inherited own properties.

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

`Object.create(proto)` creates a new object whose prototype is set to `proto`, giving you fine-grained control over the inheritance chain without needing a constructor function. Passing `null` creates a truly empty object with no inherited properties — useful as a safe dictionary.

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

`instanceof` checks whether the `prototype` property of a constructor appears anywhere in an object's prototype chain. `isPrototypeOf()` does the same but operates directly on prototype objects. Note that `instanceof` does not work reliably across iframes because each frame has its own global object and constructors.

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

`Object.hasOwn(obj, key)` (ES2022) reliably checks whether a property is directly on an object rather than inherited from its prototype. Use it when iterating with `for...in`, which also traverses inherited enumerable properties and can produce unexpected keys.

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

Adding properties to built-in prototypes like `Array.prototype` or `Object.prototype` is generally considered bad practice. It can conflict with future language additions, break `for...in` enumeration, and cause hard-to-diagnose bugs when multiple libraries do the same. Write standalone utility functions instead.

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

Reading a property that lives directly on an object is fastest; each hop up the prototype chain adds a small lookup cost. Deeply nested inheritance hierarchies can degrade performance for frequently-called hot paths, though modern engine optimisations often compensate.

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

ES6 `class` syntax is purely syntactic sugar over constructor functions and prototype assignment — both approaches produce an identical runtime prototype chain. Classes are strongly preferred in new code because they are more readable, enforce `super()` calls, and support private fields.

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
