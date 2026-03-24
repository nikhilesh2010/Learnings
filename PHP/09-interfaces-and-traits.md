# 09: Interfaces, Abstract Classes & Traits

## 🤝 Interfaces

An interface defines a **contract** — a set of methods a class must implement. Interfaces have no implementation.

```php
<?php
declare(strict_types=1);

interface Drawable {
    public function draw(): string;
}

interface Resizable {
    public function resize(float $factor): static;
}

// A class can implement multiple interfaces
class Circle implements Drawable, Resizable {
    public function __construct(private float $radius) {}

    public function draw(): string {
        return "Drawing circle (r={$this->radius})";
    }

    public function resize(float $factor): static {
        return new static($this->radius * $factor);
    }
}

$c = new Circle(5.0);
echo $c->draw();           // Drawing circle (r=5)
$big = $c->resize(2.0);
echo $big->draw();         // Drawing circle (r=10)

// Type hint on interface — accepts any implementor
function render(Drawable $shape): void {
    echo $shape->draw() . "\n";
}
render(new Circle(3));
```

### Interface Constants

```php
interface HttpStatus {
    const OK        = 200;
    const NOT_FOUND = 404;
    const ERROR     = 500;
}

class Response implements HttpStatus {
    public int $code = self::OK;
}

echo HttpStatus::OK;       // 200
echo Response::NOT_FOUND;  // 404
```

### Interface Inheritance

```php
interface Animal {
    public function speak(): string;
}

interface Pet extends Animal {
    public function name(): string;
}

class Dog implements Pet {
    public function __construct(private string $petName) {}
    public function speak(): string { return "Woof!"; }
    public function name(): string  { return $this->petName; }
}
```

---

## 🧩 Abstract Classes

An **abstract class** can have both abstract (unimplemented) and concrete (implemented) methods. It cannot be instantiated directly.

```php
abstract class Logger {
    // Abstract — subclasses MUST implement
    abstract protected function writeLog(string $level, string $message): void;

    // Concrete — shared implementation
    public function info(string $message): void {
        $this->writeLog("INFO", $message);
    }
    public function error(string $message): void {
        $this->writeLog("ERROR", $message);
    }
    public function debug(string $message): void {
        $this->writeLog("DEBUG", $message);
    }

    protected function format(string $level, string $message): string {
        $time = date("Y-m-d H:i:s");
        return "[$time] [$level] $message";
    }
}

class FileLogger extends Logger {
    protected function writeLog(string $level, string $message): void {
        $line = $this->format($level, $message) . PHP_EOL;
        file_put_contents("app.log", $line, FILE_APPEND);
    }
}

class EchoLogger extends Logger {
    protected function writeLog(string $level, string $message): void {
        echo $this->format($level, $message) . PHP_EOL;
    }
}

$log = new EchoLogger();
$log->info("Application started");
$log->error("Something failed");
// [2025-03-24 10:00:00] [INFO] Application started
// [2025-03-24 10:00:00] [ERROR] Something failed
```

### Interface vs Abstract Class

| Feature | Interface | Abstract Class |
|---------|-----------|----------------|
| Multiple inheritance | ✅ (multiple interfaces) | ❌ (single class) |
| Constructor | ❌ | ✅ |
| Properties | Constants only | ✅ |
| Method implementation | ❌ (default methods: PHP 8) | ✅ |
| Access modifiers | `public` only | Any |
| Use when | Pure contract | Shared base code |

---

## ♻️ Traits

**Traits** are reusable code fragments that can be mixed into any class — PHP's answer to horizontal code reuse (like mixins).

```php
trait Timestampable {
    private ?DateTime $createdAt = null;
    private ?DateTime $updatedAt = null;

    public function setCreatedAt(): void {
        $this->createdAt = new DateTime();
    }
    public function setUpdatedAt(): void {
        $this->updatedAt = new DateTime();
    }
    public function getCreatedAt(): ?DateTime {
        return $this->createdAt;
    }
    public function getUpdatedAt(): ?DateTime {
        return $this->updatedAt;
    }
}

trait SoftDeletable {
    private ?DateTime $deletedAt = null;

    public function delete(): void {
        $this->deletedAt = new DateTime();
    }
    public function isDeleted(): bool {
        return $this->deletedAt !== null;
    }
    public function restore(): void {
        $this->deletedAt = null;
    }
}

// Use multiple traits in a class
class Post {
    use Timestampable, SoftDeletable;

    public function __construct(
        public string $title,
        public string $body,
    ) {
        $this->setCreatedAt();
    }
}

$post = new Post("Hello", "World");
echo $post->getCreatedAt()->format("Y-m-d");   // today
$post->delete();
var_dump($post->isDeleted());    // true
$post->restore();
var_dump($post->isDeleted());    // false
```

---

## ⚔️ Trait Conflict Resolution

When two traits used by the same class define a method with the **same name**, PHP reports a fatal conflict that must be resolved explicitly. Use `insteadof` to choose which trait's method wins, and `as` to optionally create an alias for the discarded version so both remain accessible.

```php
trait Hello {
    public function greet(): string { return "Hello!"; }
    public function name(): string  { return "Hello Trait"; }
}

trait Hi {
    public function greet(): string { return "Hi!"; }
    public function name(): string  { return "Hi Trait"; }
}

class Greeter {
    use Hello, Hi {
        Hello::greet insteadof Hi;    // prefer Hello::greet over Hi::greet
        Hi::greet as greetHi;         // also keep Hi::greet under alias
        Hello::name insteadof Hi;
    }
}

$g = new Greeter();
echo $g->greet();    // Hello!
echo $g->greetHi();  // Hi!
```

---

## 🔧 Traits with Abstract Methods

A trait can declare an **abstract method** (no body), forcing any class that uses the trait to provide its own implementation. This is useful when the trait's concrete methods depend on behaviour that only the consuming class can supply — a form of the Template Method pattern without inheritance.

```php
trait Validatable {
    abstract protected function rules(): array;

    public function validate(array $data): bool {
        foreach ($this->rules() as $field => $rule) {
            if ($rule === 'required' && empty($data[$field])) {
                return false;
            }
        }
        return true;
    }
}

class UserForm {
    use Validatable;

    protected function rules(): array {
        return [
            'name'  => 'required',
            'email' => 'required',
        ];
    }
}

$form = new UserForm();
var_dump($form->validate(["name" => "Alice", "email" => "a@b.com"]));  // true
var_dump($form->validate(["name" => "Alice"]));                         // false
```

---

## 🏷️ Trait Properties & Visibility

Traits can define properties with default values and methods with any visibility. When a class uses a trait, its methods can be **renamed or given different visibility** using the `as` keyword in the `use` block. This is useful for exposing a protected method as public in a specific class.

```php
trait Counter {
    private int $count = 0;

    public function increment(): void { $this->count++; }
    public function decrement(): void { $this->count--; }
    public function getCount(): int   { return $this->count; }

    // Change method visibility when using trait
}

class OrderCart {
    use Counter {
        decrement as public decrementPublic;  // expose with different visibility
    }
}

$cart = new OrderCart();
$cart->increment();
$cart->increment();
echo $cart->getCount();  // 2
```

---

## 🧩 Interfaces + Traits Together

Interfaces define the **contract** (what methods a class must have); traits provide the **implementation** (reusable code that satisfies part or all of that contract). A common pattern is pairing them: the interface ensures the type contract, and the trait provides a default implementation so classes don't have to repeat the same code.

```php
interface Serializable {
    public function serialize(): string;
    public function unserialize(string $data): void;
}

trait JsonSerializableTrait {
    public function serialize(): string {
        return json_encode($this->toArray(), JSON_THROW_ON_ERROR);
    }

    public function unserialize(string $data): void {
        $arr = json_decode($data, true, 512, JSON_THROW_ON_ERROR);
        foreach ($arr as $key => $value) {
            if (property_exists($this, $key)) {
                $this->$key = $value;
            }
        }
    }

    abstract protected function toArray(): array;
}

class Product implements Serializable {
    use JsonSerializableTrait;

    public function __construct(
        public string $name,
        public float  $price
    ) {}

    protected function toArray(): array {
        return ["name" => $this->name, "price" => $this->price];
    }
}

$p = new Product("Widget", 9.99);
$json = $p->serialize();
echo $json;   // {"name":"Widget","price":9.99}

$p2 = new Product("", 0);
$p2->unserialize($json);
echo $p2->name;   // Widget
```

---

## 📋 Summary

| Feature | Use when |
|---------|---------|
| **Interface** | Defining a contract: what a class must do |
| **Abstract class** | Shared base with some default behavior |
| **Trait** | Mixing reusable code into unrelated classes |

```
Relationship rules:
- A class can implement MULTIPLE interfaces
- A class can extend only ONE class (abstract or concrete)
- A class can use MULTIPLE traits
- Traits cannot be instantiated
- Interfaces cannot have properties (only constants) or constructors
```


---

[← Previous: Object-Oriented Programming](08-oop.md) | [Contents](README.md) | [Next: Error & Exception Handling →](10-error-handling.md)
