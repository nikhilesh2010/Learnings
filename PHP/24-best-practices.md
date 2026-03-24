# 24: Best Practices

> Clean, maintainable PHP: standards, architecture, and patterns that scale.

---

## 📏 PSR Standards

PHP-FIG standards ensure interoperability between libraries and frameworks.

| PSR | Name | Rule |
|-----|------|------|
| PSR-1 | Basic Coding Standard | `<?php` or `<?=` only; UTF-8 no BOM; namespaced classes; `StudlyCaps` classes, `camelCase` methods, `UPPER_CASE` constants |
| PSR-2/PSR-12 | Extended Coding Style | 4-space indent, LF line endings, 1 blank line after `namespace`/`use`, opening `{` on same line for classes/functions |
| PSR-4 | Autoloading Standard | Namespace maps to directory path; one class per file |
| PSR-7 | HTTP Message Interfaces | Immutable request/response objects |
| PSR-11 | Container Interface | Dependency injection containers |
| PSR-15 | HTTP Handlers | Middleware pipeline interface |
| PSR-3 | Logger Interface | Common logger interface (`LoggerInterface`) |

---

## 🏗️ SOLID Principles

### Single Responsibility Principle

```php
// ❌ Class does too much
class UserManager {
    public function save(User $user): void { /* DB */ }
    public function sendWelcomeEmail(User $user): void { /* SMTP */ }
    public function generateReport(): array { /* reporting */ }
}

// ✅ One class, one concern
class UserRepository    { public function save(User $u): void { /* DB */ } }
class UserMailer        { public function welcome(User $u): void { /* SMTP */ } }
class UserReportService { public function generate(): array { /* report */ } }
```

### Open/Closed Principle

```php
// ✅ Open for extension, closed for modification
interface Discount {
    public function apply(float $price): float;
}

class PercentDiscount implements Discount {
    public function __construct(private float $percent) {}
    public function apply(float $price): float { return $price * (1 - $this->percent / 100); }
}

class FixedDiscount implements Discount {
    public function __construct(private float $amount) {}
    public function apply(float $price): float { return max(0, $price - $this->amount); }
}

// Add new discount type without changing existing code
class BuyOneGetOne implements Discount {
    public function apply(float $price): float { return $price / 2; }
}
```

### Liskov Substitution Principle

```php
// ✅ Subclass must be usable wherever the parent is expected
abstract class Shape {
    abstract public function area(): float;
}

class Rectangle extends Shape {
    public function __construct(protected float $w, protected float $h) {}
    public function area(): float { return $this->w * $this->h; }
}

class Square extends Shape {
    public function __construct(private float $side) {}
    public function area(): float { return $this->side ** 2; }
}

// ✅ Both work interchangeably as Shape
function printArea(Shape $shape): void {
    echo "Area: " . $shape->area() . "\n";
}
```

### Interface Segregation Principle

```php
// ❌ Fat interface forces irrelevant methods
interface Animal {
    public function walk(): void;
    public function fly(): void;   // Not all animals fly
    public function swim(): void;
}

// ✅ Small, focused interfaces
interface Walkable { public function walk(): void; }
interface Flyable  { public function fly(): void; }
interface Swimmable { public function swim(): void; }

class Duck implements Walkable, Flyable, Swimmable {
    public function walk(): void { }
    public function fly(): void { }
    public function swim(): void { }
}
class Dog implements Walkable, Swimmable {
    public function walk(): void { }
    public function swim(): void { }
}
```

### Dependency Inversion Principle

```php
// ❌ High-level depends on low-level concrete class
class OrderService {
    private MySqlOrderRepository $repo;  // concrete dependency
    public function __construct() { $this->repo = new MySqlOrderRepository(); }
}

// ✅ Depend on abstractions (interfaces), inject them
interface OrderRepository {
    public function findById(int $id): ?Order;
    public function save(Order $order): void;
}

class OrderService {
    public function __construct(private readonly OrderRepository $orders) {}

    public function process(int $id): void {
        $order = $this->orders->findById($id);
        // ...
    }
}
// Swap implementations without touching OrderService:
new OrderService(new MySqlOrderRepository());
new OrderService(new InMemoryOrderRepository());  // for tests
```

---

## 🏛️ Repository Pattern
The **Repository pattern** abstracts database access behind an interface so that business logic never directly touches SQL. Controllers and services call methods like `find()`, `findAll()`, or `save()` on the repository interface. This makes the application testable (swap out the real repository for an in-memory fake) and decouples it from the specific database engine.
```php
interface ProductRepository {
    public function find(int $id): ?Product;
    public function findAll(): array;
    public function save(Product $product): void;
    public function delete(int $id): void;
}

class PdoProductRepository implements ProductRepository {
    public function __construct(private PDO $pdo) {}

    public function find(int $id): ?Product {
        $stmt = $this->pdo->prepare("SELECT * FROM products WHERE id = ?");
        $stmt->execute([$id]);
        $row = $stmt->fetch();
        return $row ? Product::fromArray($row) : null;
    }
    // ...
}
```

---

## 🔧 Dependency Injection Container

A **DI Container** is a central registry that builds objects and resolves their dependencies automatically. Instead of manually passing `new Repository(new PDO(...))` through every constructor, you register factories once and let the container wire everything together. This keeps boilerplate minimal and makes swapping implementations trivial.

```php
// Simple manual DI (no library needed for small projects)
class Container {
    private array $bindings = [];

    public function bind(string $abstract, callable $factory): void {
        $this->bindings[$abstract] = $factory;
    }

    public function make(string $abstract): mixed {
        if (!isset($this->bindings[$abstract])) {
            throw new \RuntimeException("No binding for $abstract");
        }
        return ($this->bindings[$abstract])($this);
    }
}

$container = new Container();
$container->bind(PDO::class, fn() => new PDO(
    "mysql:host=localhost;dbname=app",
    getenv('DB_USER'), getenv('DB_PASS')
));
$container->bind(ProductRepository::class, fn($c) =>
    new PdoProductRepository($c->make(PDO::class))
);
$container->bind(ProductService::class, fn($c) =>
    new ProductService($c->make(ProductRepository::class))
);
```

---

## 🏭 Factory Pattern

The **Factory pattern** centralises object creation logic in one place. Instead of `new ConcreteClass()` scattered throughout the codebase, a factory method reads configuration (or an environment variable) and returns the right implementation. Calling code depends only on the shared interface, so swapping implementations requires updating one factory, not hundreds of call sites.

```php
interface Logger { public function log(string $message): void; }
class FileLogger    implements Logger { /* ... */ }
class DatabaseLogger implements Logger { /* ... */ }
class NullLogger    implements Logger { public function log(string $m): void {} }

class LoggerFactory {
    public static function create(string $type): Logger {
        return match($type) {
            'file'     => new FileLogger(),
            'database' => new DatabaseLogger(),
            'null'     => new NullLogger(),
            default    => throw new \InvalidArgumentException("Unknown logger: $type"),
        };
    }
}

$logger = LoggerFactory::create(getenv('LOG_DRIVER') ?: 'file');
```

---

## ⚙️ Environment Configuration

Hardcoding credentials or environment-specific values in source code is a security risk and a deployment nightmare. Store all configuration in a `.env` file (never committed to version control) and load it at startup with `vlucas/phpdotenv`. Access values via `$_ENV['KEY']` and provide a `.env.example` with dummy values as documentation for other developers.

```php
// .env file (loaded by vlucas/phpdotenv)
// DB_HOST=localhost
// DB_NAME=myapp
// APP_ENV=production

// bootstrap.php
$dotenv = Dotenv\Dotenv::createImmutable(__DIR__);
$dotenv->load();
$dotenv->required(['DB_HOST', 'DB_NAME', 'APP_ENV'])->notEmpty();

// Access
$dbHost  = $_ENV['DB_HOST'];
$appEnv  = $_ENV['APP_ENV'];
$isDebug = $_ENV['APP_DEBUG'] ?? 'false' === 'true';

// Never:
// - Hardcode credentials in source code
// - Commit .env to version control
// - Store secrets in config arrays tracked by git
```

---

## 🧹 Clean Code Principles

Clean code expresses intent clearly, contains no surprises, and is easy to change. **Guard clauses** eliminate deep nesting by returning early on invalid conditions. **Small focused functions** do one thing. **Named constants** replace magic numbers. **Immutable value objects** prevent accidental mutation of shared state.

```php
// ✅ Guard clauses instead of deep nesting
function processOrder(Order $order): void {
    if ($order->isCancelled()) return;
    if (!$order->hasItems())   return;
    if (!$order->isPaid())     throw new \RuntimeException("Unpaid order");
    // main logic here — no nesting
}

// ✅ Small functions with clear names
function isEligibleForDiscount(User $user, Order $order): bool {
    return $user->isPremium() && $order->total() > 100;
}

// ✅ Avoid magic numbers
const MAX_LOGIN_ATTEMPTS  = 5;
const SESSION_TIMEOUT_SEC = 1800;

// ✅ Return early, avoid else after return
function getUsername(int $id): string {
    $user = findUser($id);
    if ($user === null) return 'Guest';
    return $user->name;
}

// ✅ Immutable value objects
final class Money {
    public function __construct(
        public readonly int $amount,    // in cents
        public readonly string $currency,
    ) {}

    public function add(Money $other): self {
        if ($this->currency !== $other->currency) {
            throw new \DomainException("Currency mismatch");
        }
        return new self($this->amount + $other->amount, $this->currency);
    }
}
```

---

## 📋 Best Practices Checklist

| Category | Practice |
|----------|----------|
| Code style | Follow PSR-12, use PHP CS Fixer |
| Architecture | SOLID, Repository, DI Container |
| Configuration | `.env` + `vlucas/phpdotenv`, never hardcode |
| Errors | Throw typed exceptions, never swallow errors silently |
| Types | Enable `strict_types=1` in every file |
| Security | See chapter 21 — validate all input, use prepared statements |
| Testing | Unit test business logic, integration test boundaries |
| Composer | Pin versions with `^`, run `composer audit` regularly |
| Git | Commit `composer.lock`, never commit `.env` or vendor/ |
| Logging | Use PSR-3 `LoggerInterface` (e.g. Monolog) |


---

[← Previous: Modern PHP (8.0 → 8.3)](23-modern-php.md) | [Contents](README.md) | [Next: Debugging →](25-debugging.md)
