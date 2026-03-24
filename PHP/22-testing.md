# 22: Testing

## 🧪 Why Test?

- Catch regressions early
- Confident refactoring
- Living documentation of behaviour
- Enforce design contracts

---

## ⚙️ Setup PHPUnit

**PHPUnit** is the standard testing framework for PHP. Install it as a dev-only dependency with Composer. The `phpunit.xml` configuration file defines your test suites, the bootstrap file (Composer's autoloader), source directories for coverage reports, and output options. Run `./vendor/bin/phpunit` to execute the full suite.

```bash
# Install as dev dependency
composer require --dev phpunit/phpunit

# Create phpunit.xml
vendor/bin/phpunit --generate-configuration

# Run tests
vendor/bin/phpunit
vendor/bin/phpunit --testdox              # human-readable output
vendor/bin/phpunit tests/Unit/MathTest.php  # single file
vendor/bin/phpunit --filter testAdd      # filter by method name
vendor/bin/phpunit --coverage-html coverage/  # HTML code coverage
```

`phpunit.xml`:
```xml
<?xml version="1.0" encoding="UTF-8"?>
<phpunit xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
         xsi:noNamespaceSchemaLocation="vendor/phpunit/phpunit/phpunit.xsd"
         bootstrap="vendor/autoload.php"
         colors="true">
    <testsuites>
        <testsuite name="Unit">
            <directory>tests/Unit</directory>
        </testsuite>
        <testsuite name="Feature">
            <directory>tests/Feature</directory>
        </testsuite>
    </testsuites>
    <coverage>
        <include>
            <directory suffix=".php">src</directory>
        </include>
    </coverage>
</phpunit>
```

---

## ✏️ First Test

Every test class extends `TestCase` and each test method is prefixed with `test`. Structure each test using the **Arrange / Act / Assert** pattern: create the inputs, call the code under test, then verify the result. Test one behaviour per method so that failure messages are immediately obvious.

```php
<?php
// src/Math.php
declare(strict_types=1);

namespace App;

class Math {
    public function add(float $a, float $b): float  { return $a + $b; }
    public function divide(float $a, float $b): float {
        if ($b === 0.0) throw new \DivisionByZeroError("Division by zero");
        return $a / $b;
    }
    public function factorial(int $n): int {
        if ($n < 0) throw new \InvalidArgumentException("Negative input");
        return $n <= 1 ? 1 : $n * $this->factorial($n - 1);
    }
}
```

```php
<?php
// tests/Unit/MathTest.php
declare(strict_types=1);

namespace Tests\Unit;

use App\Math;
use PHPUnit\Framework\TestCase;

class MathTest extends TestCase {
    private Math $math;

    // Runs before each test method
    protected function setUp(): void {
        $this->math = new Math();
    }

    public function testAdd(): void {
        $this->assertSame(5.0, $this->math->add(2, 3));
    }

    public function testAddNegative(): void {
        $this->assertSame(-1.0, $this->math->add(-3, 2));
    }

    public function testDivide(): void {
        $this->assertEqualsWithDelta(3.333, $this->math->divide(10, 3), 0.001);
    }

    public function testDivideByZeroThrows(): void {
        $this->expectException(\DivisionByZeroError::class);
        $this->expectExceptionMessage("Division by zero");
        $this->math->divide(5, 0);
    }

    public function testFactorial(): void {
        $this->assertSame(120, $this->math->factorial(5));
        $this->assertSame(1,   $this->math->factorial(0));
    }

    public function testFactorialNegativeThrows(): void {
        $this->expectException(\InvalidArgumentException::class);
        $this->math->factorial(-1);
    }
}
```

---

## 🔢 Data Providers

**Data providers** allow the same test method to run with many different input-output combinations without duplicating code. Define a `public static` method that returns a named array of `[$input, $expected]` pairs, then annotate the test with `#[DataProvider('methodName')]`. Each case runs as a separate test with its own pass/fail status.

```php
// Parameterize tests with multiple inputs
class MathTest extends TestCase {
    /** @dataProvider additionProvider */
    public function testAddTable(float $a, float $b, float $expected): void {
        $math = new \App\Math();
        $this->assertSame($expected, $math->add($a, $b));
    }

    public static function additionProvider(): array {
        return [
            'positive numbers' => [2.0, 3.0, 5.0],
            'negative numbers' => [-1.0, -2.0, -3.0],
            'zero identity'    => [0.0, 5.0, 5.0],
            'floats'           => [0.1, 0.2, 0.30000000000000004],
        ];
    }
}
```

---

## 🎭 Mocks and Stubs
**Stubs** replace dependencies with objects that return canned values so you test the unit in isolation. **Mocks** additionally verify that specific methods were called with specific arguments — asserting _behaviour_, not just output. PHPUnit generates both via `createMock()`. Define return values with `willReturn()` and expectations with `expects($this->once())`.
```php
<?php
// src/UserService.php
namespace App;

interface UserRepository {
    public function findById(int $id): ?array;
    public function save(array $user): int;
}

class UserService {
    public function __construct(private readonly UserRepository $repo) {}

    public function getDisplayName(int $id): string {
        $user = $this->repo->findById($id);
        if ($user === null) throw new \RuntimeException("User $id not found");
        return $user['first_name'] . ' ' . $user['last_name'];
    }

    public function createUser(string $name, string $email): int {
        if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
            throw new \InvalidArgumentException("Invalid email");
        }
        return $this->repo->save(['name' => $name, 'email' => $email]);
    }
}
```

```php
<?php
// tests/Unit/UserServiceTest.php
use App\UserService;
use App\UserRepository;
use PHPUnit\Framework\TestCase;
use PHPUnit\Framework\MockObject\MockObject;

class UserServiceTest extends TestCase {
    private UserRepository&MockObject $repo;
    private UserService $service;

    protected function setUp(): void {
        // createMock: stub with no expectations
        $this->repo    = $this->createMock(UserRepository::class);
        $this->service = new UserService($this->repo);
    }

    public function testGetDisplayName(): void {
        // Stub: define return value
        $this->repo
            ->method('findById')
            ->with(42)
            ->willReturn(['first_name' => 'Jane', 'last_name' => 'Doe']);

        $this->assertSame('Jane Doe', $this->service->getDisplayName(42));
    }

    public function testGetDisplayNameNotFound(): void {
        $this->repo->method('findById')->willReturn(null);
        $this->expectException(\RuntimeException::class);
        $this->service->getDisplayName(99);
    }

    public function testCreateUserCallsRepo(): void {
        // Mock: verify it was called exactly once
        $this->repo
            ->expects($this->once())
            ->method('save')
            ->with($this->arrayHasKey('email'))
            ->willReturn(1);

        $id = $this->service->createUser('Alice', 'alice@example.com');
        $this->assertSame(1, $id);
    }

    public function testCreateUserInvalidEmail(): void {
        $this->repo->expects($this->never())->method('save');
        $this->expectException(\InvalidArgumentException::class);
        $this->service->createUser('Bob', 'not-an-email');
    }
}
```

---

## ✅ Common Assertions
Use `assertSame()` (strict `===`) by default and reserve `assertEquals()` for when loose comparison is intentional. For floats, always use `assertEqualsWithDelta()`. Test that exceptions are thrown by calling `expectException()` **before** the code that should throw. `assertCount()`, `assertInstanceOf()`, and `assertMatchesRegularExpression()` cover the other common cases.
```php
// Equality
$this->assertSame(5, $result);              // strict ===
$this->assertEquals('5', 5);               // loose ==
$this->assertNotSame($a, $b);
$this->assertEqualsWithDelta(3.14, $pi, 0.001);

// Type checks
$this->assertIsInt($value);
$this->assertIsString($value);
$this->assertIsArray($value);
$this->assertIsFloat($value);
$this->assertNull($value);
$this->assertNotNull($value);
$this->assertInstanceOf(UserService::class, $obj);

// Boolean
$this->assertTrue($condition);
$this->assertFalse($condition);

// Arrays / collections
$this->assertCount(3, $items);
$this->assertEmpty($array);
$this->assertNotEmpty($array);
$this->assertContains(42, $items);
$this->assertArrayHasKey('name', $data);
$this->assertArrayNotHasKey('password', $response);

// Strings
$this->assertStringContainsString('hello', $str);
$this->assertStringStartsWith('http', $url);
$this->assertStringEndsWith('.pdf', $filename);
$this->assertMatchesRegularExpression('/^\d{4}-\d{2}-\d{2}$/', $date);

// Exceptions
$this->expectException(\InvalidArgumentException::class);
$this->expectExceptionMessage("must be positive");
$this->expectExceptionCode(422);

// Output
$this->expectOutputString("Hello World");
$this->expectOutputRegex('/Hello \w+/');
```

---

## 🔧 setUp / tearDown

`setUp()` runs before **each** test method — use it to create fresh objects so no state bleeds between tests. `tearDown()` runs after each test even on failure — use it to close connections or delete temp files. The static variants `setUpBeforeClass()` / `tearDownAfterClass()` run once per class and are ideal for expensive shared resources like database connections.

```php
class DatabaseTest extends TestCase {
    private PDO $pdo;

    // Runs before each test
    protected function setUp(): void {
        $this->pdo = new PDO('sqlite::memory:');
        $this->pdo->exec("CREATE TABLE users (id INTEGER PRIMARY KEY, name TEXT)");
    }

    // Runs after each test (always, even on failure)
    protected function tearDown(): void {
        unset($this->pdo);
    }

    // Runs once before all tests in the class
    public static function setUpBeforeClass(): void { /* ... */ }

    // Runs once after all tests in the class
    public static function tearDownAfterClass(): void { /* ... */ }

    public function testInsert(): void {
        $this->pdo->exec("INSERT INTO users (name) VALUES ('Alice')");
        $count = (int) $this->pdo->query("SELECT COUNT(*) FROM users")->fetchColumn();
        $this->assertSame(1, $count);
    }
}
```

---

## 📋 Testing Quick Reference

| Concept | Code/Command |
|---------|-------------|
| Run all tests | `vendor/bin/phpunit` |
| Run single file | `vendor/bin/phpunit tests/Unit/FooTest.php` |
| Filter by name | `vendor/bin/phpunit --filter testFoo` |
| Readable output | `vendor/bin/phpunit --testdox` |
| Code coverage | `vendor/bin/phpunit --coverage-text` |
| Stub return | `$mock->method('foo')->willReturn($value)` |
| Mock expectation | `$mock->expects($this->once())->method('foo')` |
| Throw on call | `$mock->method('foo')->willThrowException(new \Exception)` |
| Data provider | `/** @dataProvider provider */` on test method |
| Skip test | `$this->markTestSkipped('reason')` |
| Incomplete test | `$this->markTestIncomplete('not done')` |


---

[← Previous: Security](21-security.md) | [Contents](README.md) | [Next: Modern PHP (8.0 → 8.3) →](23-modern-php.md)
