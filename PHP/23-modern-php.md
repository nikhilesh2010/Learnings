# 23: Modern PHP (8.0 → 8.3)

> PHP 8.x transformed the language. This chapter covers the most impactful features by version.

---

## PHP 8.0 (Nov 2020)

### Named Arguments

```php
<?php
// Before: had to pass all args in order
htmlspecialchars($str, ENT_QUOTES, 'UTF-8', false);

// PHP 8.0: skip optional args, any order
htmlspecialchars($str, double_encode: false);
array_slice(array: $items, offset: 2, length: 3);

function createUser(string $name, string $role = 'user', bool $active = true): array {
    return compact('name', 'role', 'active');
}
createUser(name: 'Alice', active: false);  // skip $role
```

### Match Expression

```php
// match uses strict === comparison, returns a value, throws on no match
$status = 200;

$label = match($status) {
    200, 201 => 'Success',
    301, 302 => 'Redirect',
    404      => 'Not Found',
    500      => 'Server Error',
    default  => 'Unknown',
};

// vs switch:  match is exhaustive, no fall-through, no type coercion
// match(true) pattern for non-equality tests:
$age = 25;
$group = match(true) {
    $age < 13  => 'child',
    $age < 18  => 'teen',
    $age < 65  => 'adult',
    default    => 'senior',
};
```

### Nullsafe Operator (?->)

```php
// Before:
$city = null;
if ($user !== null) {
    $address = $user->getAddress();
    if ($address !== null) {
        $city = $address->getCity();
    }
}

// PHP 8.0:
$city = $user?->getAddress()?->getCity();   // null if any step is null
$code = $order?->customer?->address?->countryCode?->toUpper();
```

### Union Types

```php
function parseInput(int|string $value): int|float {
    return is_string($value) ? (float)$value : $value;
}

// Mixed type (any value including null)
function debug(mixed $value): void { var_dump($value); }
```

### Constructor Promotion

```php
class Point {
    // Declare AND assign properties in the constructor signature
    public function __construct(
        public readonly float $x,
        public readonly float $y,
        public readonly float $z = 0.0,
    ) {}
}

$p = new Point(1.0, 2.0);
echo $p->x;  // 1.0
```

### `str_contains`, `str_starts_with`, `str_ends_with`

```php
str_contains('Hello World', 'World');        // true
str_starts_with('Hello World', 'Hello');     // true
str_ends_with('Hello World', 'World');       // true

// Before PHP 8:
strpos('Hello World', 'World') !== false;    // verbose
```

### Throw Expressions

```php
// Before: throw could only be a statement
// PHP 8.0: throw is an expression — usable anywhere
$value = $input ?? throw new \InvalidArgumentException("Required");

$user = findUser($id) ?: throw new \RuntimeException("Not found");

$callback = fn($x) => $x > 0 ? $x : throw new \RangeError("Positive only");
```

### JIT (Just-In-Time Compiler)

```php
// Configured in php.ini — biggest gains for CPU-bound code
// opcache.enable=1
// opcache.jit=tracing     (or function)
// opcache.jit_buffer_size=128M
// Most web apps see modest gains; CLI/number-crunching benefits most
```

---

## PHP 8.1 (Nov 2021)

### Enums

```php
// Pure enum (no backing value)
enum Status {
    case Active;
    case Inactive;
    case Pending;
}

// Backed enum (int or string backing value)
enum Color: string {
    case Red   = '#FF0000';
    case Green = '#00FF00';
    case Blue  = '#0000FF';

    // Enums can have methods
    public function label(): string {
        return match($this) {
            Color::Red   => 'Red',
            Color::Green => 'Green',
            Color::Blue  => 'Blue',
        };
    }

    // Enums can implement interfaces
}

// Usage
$status = Status::Active;
$color  = Color::Red;
$hex    = Color::Red->value;           // '#FF0000'
$found  = Color::from('#00FF00');      // Color::Green  (throws ValueError if not found)
$maybe  = Color::tryFrom('#FFFFFF');   // null           (safe)
$cases  = Color::cases();             // [Color::Red, Color::Green, Color::Blue]

// Enum in match
function describe(Status $s): string {
    return match($s) {
        Status::Active  => 'Active user',
        Status::Inactive => 'Disabled',
        Status::Pending  => 'Awaiting approval',
    };
}

// Type-safe parameters
function activate(Status $status): void { /* ... */ }
activate(Status::Active);
```

### Readonly Properties

```php
class User {
    public readonly string $name;
    public readonly string $email;

    public function __construct(string $name, string $email) {
        $this->name  = $name;    // set once in constructor
        $this->email = $email;
    }
}

$user = new User('Alice', 'alice@example.com');
echo $user->name;       // Alice
$user->name = 'Bob';   // Error: Cannot modify readonly property
```

### First-Class Callables

```php
function double(int $n): int { return $n * 2; }

// PHP 8.1: capture any callable as a Closure with fn(...)
$fn    = double(...);                      // Closure from function
$upper = strtoupper(...);                  // Closure from built-in

$arr   = array_map(double(...), [1, 2, 3]);  // [2, 4, 6]

class Formatter {
    public function format(string $s): string { return strtoupper($s); }
}
$obj = new Formatter();
$fn  = $obj->format(...);                   // Closure from method
```

### Intersection Types

```php
interface Countable {}
interface Serializable {}

// &  means the value must satisfy ALL types
function process(Countable&Serializable $item): void { }
```

### `array_is_list()`

```php
array_is_list([1, 2, 3]);             // true  — sequential 0-based keys
array_is_list(['a' => 1, 'b' => 2]);  // false — associative
array_is_list([0 => 'a', 2 => 'b']);  // false — gaps in keys
```

### Fibers (coroutines)

```php
// Fibers are cooperative concurrency primitives (not threads)
$fiber = new Fiber(function(): void {
    $value = Fiber::suspend('initial');   // pause, yield value
    echo "Resumed with: $value\n";
    Fiber::suspend('done');
});

$yielded = $fiber->start();             // run until first suspend → 'initial'
$fiber->resume('hello');               // resume, prints "Resumed with: hello"
```

---

## PHP 8.2 (Dec 2022)

### Readonly Classes

```php
// All promoted or non-static properties are automatically readonly
readonly class Coordinate {
    public function __construct(
        public float $lat,
        public float $lng,
    ) {}
}

$c = new Coordinate(51.5, -0.12);
$c->lat = 0;  // Error: all properties are readonly
```

### `true`, `false`, `null` as Standalone Types

```php
function alwaysTrue(): true { return true; }
function alwaysFail(): false { return false; }
function returnNull(): null { return null; }
```

### DNF Types (Disjunctive Normal Form)

```php
// Combine union and intersection
function handle(Stringable|(Countable&Traversable) $input): void { }
```

### Deprecated Dynamic Properties

```php
class Foo {}
$f = new Foo();
$f->bar = 1;  // PHP 8.2: deprecated; PHP 9: will throw error

// Use an attribute to opt-in if needed (for legacy code)
#[\AllowDynamicProperties]
class LegacyClass {}
```

---

## PHP 8.3 (Nov 2023)

### Typed Class Constants

```php
class Config {
    const string VERSION = '1.0.0';
    const int    MAX_RETRIES = 3;
    const float  TIMEOUT = 30.5;
}

interface HasVersion {
    const string VERSION;   // enforce type in implementing classes
}
```

### `json_validate()`

```php
// Check validity without decoding (faster than decode + check)
json_validate('{"key": "value"}');   // true
json_validate('{invalid json}');     // false

// Optional depth and flags
json_validate($json, depth: 512);
```

### `#[\Override]` Attribute

```php
class ParentClass {
    public function compute(): int { return 1; }
}

class ChildClass extends ParentClass {
    #[\Override]    // compile-time error if method doesn't exist in parent
    public function compute(): int { return 2; }
}
```

---

## 📋 Feature Quick Reference

| Feature | Version | Syntax |
|---------|---------|--------|
| Named arguments | 8.0 | `fn(name: $v)` |
| Match expression | 8.0 | `match($x) { val => result }` |
| Nullsafe operator | 8.0 | `$a?->b()?->c` |
| Union types | 8.0 | `int\|string` |
| Constructor promotion | 8.0 | `__construct(public int $x)` |
| `str_contains()` | 8.0 | `str_contains($s, 'x')` |
| Throw expression | 8.0 | `$v ?? throw new Ex()` |
| Enums | 8.1 | `enum Color: string { case Red = '#f00'; }` |
| Readonly properties | 8.1 | `public readonly string $name` |
| First-class callables | 8.1 | `strtoupper(...)` |
| Intersection types | 8.1 | `A&B` |
| Fibers | 8.1 | `new Fiber(fn)` |
| `array_is_list()` | 8.1 | `array_is_list($arr)` |
| Readonly classes | 8.2 | `readonly class Foo {}` |
| DNF types | 8.2 | `A\|(B&C)` |
| Typed constants | 8.3 | `const string FOO = 'bar'` |
| `json_validate()` | 8.3 | `json_validate($str)` |
| `#[\Override]` | 8.3 | attribute on methods |


---

[← Previous: Testing](22-testing.md) | [Contents](README.md) | [Next: Best Practices →](24-best-practices.md)
