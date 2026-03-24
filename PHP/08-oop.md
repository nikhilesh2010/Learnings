# 08: Object-Oriented Programming

## 🏗️ Classes & Objects

A **class** is a blueprint defining properties (data) and methods (behaviour). An **object** is a specific instance created from that blueprint with `new`. Classes group related data and logic into a single unit — the foundation of Object-Oriented Programming and of all major PHP frameworks like Laravel and Symfony.

```php
<?php
declare(strict_types=1);

class Car {
    // Properties
    public string $make;
    public string $model;
    private int $year;
    protected float $price;

    // Constructor
    public function __construct(
        string $make,
        string $model,
        int    $year,
        float  $price = 0.0
    ) {
        $this->make  = $make;
        $this->model = $model;
        $this->year  = $year;
        $this->price = $price;
    }

    // Method
    public function describe(): string {
        return "{$this->year} {$this->make} {$this->model}";
    }

    // Getter for private property
    public function getYear(): int {
        return $this->year;
    }
}

$car = new Car("Toyota", "Camry", 2023, 28000.0);
echo $car->describe();    // 2023 Toyota Camry
echo $car->make;          // Toyota
echo $car->getYear();     // 2023
```

---

## 🔒 Visibility (Access Modifiers)

Access modifiers control where a class member can be read or modified. `public` — accessible from anywhere. `protected` — accessible within the class and its subclasses. `private` — accessible only inside the declaring class. Restricting visibility enforces **encapsulation** — preventing code outside the class from accidentally corrupting internal state.

```php
class BankAccount {
    public string $owner;          // accessible anywhere
    protected float $balance;      // accessible in class + subclasses
    private string $accountNumber; // only within this class

    public function __construct(string $owner, string $accountNum) {
        $this->owner = $owner;
        $this->accountNumber = $accountNum;
        $this->balance = 0.0;
    }

    public function deposit(float $amount): void {
        if ($amount <= 0) throw new InvalidArgumentException("Amount must be positive");
        $this->balance += $amount;
    }

    public function getBalance(): float {
        return $this->balance;
    }

    private function generateStatement(): string {
        return "Account: {$this->accountNumber} | Balance: {$this->balance}";
    }
}

$acc = new BankAccount("Alice", "ACC-001");
$acc->deposit(1000);
echo $acc->getBalance();   // 1000.0
echo $acc->owner;          // Alice
// $acc->balance;          // Fatal error: Cannot access protected property
// $acc->accountNumber;    // Fatal error: Cannot access private property
```

---

## 🏷️ Constructor Promotion (PHP 8.0+)

Constructor promotion is a PHP 8 shorthand that declares a property **and** assigns it in one step, directly in the parameter list. Writing a visibility modifier before a constructor parameter (e.g. `public float $x`) automatically creates the property and assigns the argument. It eliminates the repetitive boilerplate of separate property declarations and manual `$this->x = $x` assignments.

```php
// Traditional
class Point {
    public float $x;
    public float $y;
    public function __construct(float $x, float $y) {
        $this->x = $x;
        $this->y = $y;
    }
}

// Promoted (PHP 8.0+) — declare + assign in one place
class Point {
    public function __construct(
        public float $x,
        public float $y,
        private float $z = 0.0,
    ) {}

    public function distanceTo(Point $other): float {
        return sqrt(
            ($this->x - $other->x) ** 2 +
            ($this->y - $other->y) ** 2
        );
    }
}

$p1 = new Point(0, 0);
$p2 = new Point(3, 4);
echo $p2->distanceTo($p1);  // 5.0
```

---

## 🔁 Inheritance

**Inheritance** lets a child class extend a parent, inheriting all its public and protected properties and methods. The child can **override** a method to provide specialised behaviour, and call the parent's original version via `parent::`. PHP supports **single inheritance** only (one parent), but a class can implement multiple interfaces.

```php
class Animal {
    public function __construct(
        protected string $name,
        protected int $age
    ) {}

    public function speak(): string {
        return "...";
    }

    public function describe(): string {
        return "{$this->name} (age {$this->age})";
    }
}

class Dog extends Animal {
    public function __construct(
        string $name,
        int $age,
        private string $breed
    ) {
        parent::__construct($name, $age);   // call parent constructor
    }

    public function speak(): string {
        return "Woof!";   // override
    }

    public function describe(): string {
        return parent::describe() . " [{$this->breed}]";  // extend
    }
}

class Cat extends Animal {
    public function speak(): string {
        return "Meow!";
    }
}

$dog = new Dog("Rex", 3, "Labrador");
echo $dog->speak();      // Woof!
echo $dog->describe();   // Rex (age 3) [Labrador]

// Polymorphism
$animals = [new Dog("Rex", 3, "Lab"), new Cat("Whiskers", 2)];
foreach ($animals as $animal) {
    echo $animal->speak() . "\n";   // Woof! / Meow!
}
```

---

## 🔐 Static Properties & Methods

Static members **belong to the class itself**, not to any particular instance — there is only one shared copy. Access them with `ClassName::$property` or `ClassName::method()`. Use `self::` to reference the declaring class and `static::` for **late static binding**, which resolves to the actual called subclass at runtime.

```php
class Counter {
    private static int $count = 0;

    public static function increment(): void {
        self::$count++;
    }

    public static function getCount(): int {
        return self::$count;
    }

    // late static binding — correct for inheritance
    public static function create(): static {
        return new static();
    }
}

Counter::increment();
Counter::increment();
echo Counter::getCount();  // 2

// self:: vs static::
class Base {
    public static function create(): static {
        return new static();   // creates the actual called class
    }
}
class Child extends Base {}
$child = Child::create();   // returns Child, not Base
```

---

## 🔮 Magic Methods

**Magic methods** are special methods PHP calls automatically in response to certain operations. `__construct` runs on `new`; `__toString` is invoked when casting an object to string; `__get`/`__set` intercept property access; `__call` handles calls to undefined methods; `__invoke` makes an object callable like a function; `__debugInfo` controls `var_dump()` output.

```php
class MagicBox {
    private array $data = [];

    // Object creation / destruction
    public function __construct(array $initial = []) {
        $this->data = $initial;
    }
    public function __destruct() {
        // called when object is garbage-collected
    }

    // Property access
    public function __get(string $name): mixed {
        return $this->data[$name] ?? null;
    }
    public function __set(string $name, mixed $value): void {
        $this->data[$name] = $value;
    }
    public function __isset(string $name): bool {
        return isset($this->data[$name]);
    }
    public function __unset(string $name): void {
        unset($this->data[$name]);
    }

    // Calling
    public function __call(string $name, array $args): mixed {
        echo "Calling method '$name'\n";
        return null;
    }
    public static function __callStatic(string $name, array $args): mixed {
        echo "Calling static '$name'\n";
        return null;
    }

    // String conversion
    public function __toString(): string {
        return json_encode($this->data);
    }

    // Invoke as function
    public function __invoke(string $key): mixed {
        return $this->data[$key] ?? null;
    }

    // Cloning
    public function __clone(): void {
        // deep clone nested objects if needed
    }
}

$box = new MagicBox(["color" => "red"]);
echo $box->color;         // red  (via __get)
$box->size = "large";    // via __set
echo isset($box->color); // 1   (via __isset)
echo $box;               // {"color":"red","size":"large"} (via __toString)
echo $box("color");      // red  (via __invoke)
$box->doSomething();     // via __call
```

---

## 🧬 Abstract Classes

An **abstract class** cannot be instantiated directly — it exists only to be extended. It may contain **abstract methods** (declared with no body) that every concrete subclass must implement, as well as fully implemented methods sharing common logic. Use abstract classes when you have code to share but want to enforce a contract on all subclasses.

```php
abstract class Shape {
    abstract public function area(): float;
    abstract public function perimeter(): float;

    // Concrete method shared by all shapes
    public function describe(): string {
        return sprintf(
            "%s: area=%.2f, perimeter=%.2f",
            static::class,
            $this->area(),
            $this->perimeter()
        );
    }
}

class Circle extends Shape {
    public function __construct(private float $radius) {}

    public function area(): float {
        return M_PI * $this->radius ** 2;
    }
    public function perimeter(): float {
        return 2 * M_PI * $this->radius;
    }
}

class Rectangle extends Shape {
    public function __construct(
        private float $width,
        private float $height
    ) {}

    public function area(): float {
        return $this->width * $this->height;
    }
    public function perimeter(): float {
        return 2 * ($this->width + $this->height);
    }
}

$shapes = [new Circle(5), new Rectangle(4, 6)];
foreach ($shapes as $shape) {
    echo $shape->describe() . "\n";
}
// new Shape() — Fatal error: cannot instantiate abstract class
```

---

## 🔒 Final Classes & Methods

Marking a class `final` prevents any class from extending it. A `final` method on a non-final class prevents that specific method from being overridden in subclasses. Use `final` for the **Singleton pattern**, security-critical value objects, and anywhere inheritance would break correctness guarantees.

```php
final class Singleton {
    private static ?Singleton $instance = null;
    private int $value = 0;

    private function __construct() {}  // private constructor

    public static function getInstance(): static {
        if (self::$instance === null) {
            self::$instance = new static();
        }
        return self::$instance;
    }

    public function getValue(): int { return $this->value; }
    public function setValue(int $v): void { $this->value = $v; }
}

$s1 = Singleton::getInstance();
$s2 = Singleton::getInstance();
$s1->setValue(42);
echo $s2->getValue();  // 42 — same instance

// class MySingleton extends Singleton {} // Fatal: cannot extend final class
```

---

## 📦 Value Objects & Readonly (PHP 8.1+)

A **value object** represents a concept whose identity is defined by its value (e.g. `Money(10, "USD")`), not by a database reference. Making properties `readonly` (PHP 8.1+) enforces **immutability** — they can be set only once in the constructor. PHP 8.2 added `readonly` classes where all properties are automatically readonly.

```php
// readonly properties — set once in constructor, immutable after
class Money {
    public function __construct(
        public readonly float $amount,
        public readonly string $currency,
    ) {}

    public function add(Money $other): static {
        if ($this->currency !== $other->currency) {
            throw new InvalidArgumentException("Currency mismatch");
        }
        return new static($this->amount + $other->amount, $this->currency);
    }

    public function __toString(): string {
        return "$this->amount $this->currency";
    }
}

$price  = new Money(10.00, "USD");
$tax    = new Money(1.50, "USD");
$total  = $price->add($tax);

echo $total;       // 11.5 USD
// $price->amount = 5.0;  // Fatal: cannot modify readonly

// Readonly classes (PHP 8.2+) — all properties readonly
readonly class Coordinate {
    public function __construct(
        public float $lat,
        public float $lng,
    ) {}
}
```

---

## 🔄 Object Cloning & Comparison

Assigning one object variable to another copies the **reference handle** — both variables point to the same object. Use `clone` to produce an independent copy. Cloning is **shallow** by default; implement `__clone()` to deep-copy nested objects. `==` checks if two objects have the same class and equal properties; `===` checks if they are literally the same instance.

```php
class Config {
    public array $settings = [];
}

$a = new Config();
$a->settings = ["debug" => true];

// Assignment copies reference, NOT the object
$b = $a;
$b->settings["debug"] = false;
echo $a->settings["debug"];   // false — same object!

// clone creates a shallow copy
$c = clone $a;
$c->settings["debug"] = true;
echo $a->settings["debug"];   // false — different object

// == (loose) — same keys and values
// === (strict) — exact same instance
var_dump($a == $c);    // true (same property values)
var_dump($a === $c);   // false (different instances)
```

---

## 📋 OOP Quick Reference

| Concept | Syntax |
|---------|--------|
| Define class | `class Foo { }` |
| Instantiate | `$obj = new Foo()` |
| Access property | `$obj->prop` |
| Call method | `$obj->method()` |
| Static access | `Foo::method()`, `Foo::$prop` |
| Inherit | `class Child extends Parent { }` |
| Abstract class | `abstract class Shape { }` |
| Final class | `final class Singleton { }` |
| Parent constructor | `parent::__construct(...)` |
| Check type | `$obj instanceof ClassName` |
| Current class | `self::class`, `static::class`, `get_class($obj)` |
| Clone | `$copy = clone $obj` |


---

[← Previous: Arrays](07-arrays.md) | [Contents](README.md) | [Next: Interfaces, Abstract Classes & Traits →](09-interfaces-and-traits.md)
