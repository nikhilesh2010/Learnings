# 10: Error & Exception Handling

## ⚠️ PHP Error Levels

PHP has two distinct systems: **errors** (traditional, non-OOP) and **exceptions** (OOP, catchable).

```php
<?php
// Error reporting levels
error_reporting(E_ALL);          // report all errors (development)
error_reporting(E_ALL & ~E_NOTICE & ~E_DEPRECATED); // production

// Display errors (development only — NEVER in production!)
ini_set('display_errors', '1');
ini_set('display_startup_errors', '1');

// In production: log errors, don't display
ini_set('display_errors', '0');
ini_set('log_errors', '1');
ini_set('error_log', '/var/log/php/errors.log');
```

### Error Level Constants

| Constant | Meaning |
|----------|---------|
| `E_ERROR` | Fatal runtime error — script stops |
| `E_WARNING` | Non-fatal warning — script continues |
| `E_NOTICE` | Minor issue (undefined var, etc.) |
| `E_DEPRECATED` | Using deprecated functionality |
| `E_STRICT` | Best-practice suggestions |
| `E_PARSE` | Syntax error |
| `E_ALL` | All errors/warnings/notices |

---

## 🎯 Exceptions

**Exceptions** are the OOP way to handle errors in PHP. When something goes wrong, you `throw` an exception object; the calling code catches it with `try/catch`. Unlike traditional PHP errors, exceptions carry context (message, code, file, line, stack trace) and can be passed up the call stack until explicitly handled.

```php
declare(strict_types=1);

// Throwing an exception
function divide(float $a, float $b): float {
    if ($b === 0.0) {
        throw new InvalidArgumentException("Division by zero");
    }
    return $a / $b;
}

// Catching an exception
try {
    $result = divide(10, 0);
    echo $result;
} catch (InvalidArgumentException $e) {
    echo "Invalid argument: " . $e->getMessage();
} catch (RuntimeException $e) {
    echo "Runtime error: " . $e->getMessage();
} catch (Exception $e) {
    echo "General error: " . $e->getMessage();
} finally {
    echo "This always runs";  // cleanup code here
}
```

---

## 🌳 Exception Hierarchy

PHP 7+ has a unified `Throwable` interface at the top of the error hierarchy. `Error` covers engine-level issues (type errors, parse errors, out-of-memory) that are usually unrecoverable. `Exception` covers application-level problems that you are expected to handle. Use `catch (Throwable $t)` as a last resort to catch both.

```
Throwable
├── Error (engine errors — usually unrecoverable)
│   ├── TypeError
│   ├── ValueError
│   ├── ArithmeticError
│   │   └── DivisionByZeroError
│   ├── ParseError
│   └── OutOfMemoryError
└── Exception (application exceptions — catchable)
    ├── LogicException
    │   ├── BadFunctionCallException
    │   │   └── BadMethodCallException
    │   ├── DomainException
    │   ├── InvalidArgumentException
    │   ├── LengthException
    │   └── OutOfRangeException
    └── RuntimeException
        ├── OutOfBoundsException
        ├── OverflowException
        ├── RangeException
        ├── UnderflowException
        └── UnexpectedValueException
```

```php
// Catch both Error and Exception
try {
    // some risky operation
} catch (Throwable $t) {
    echo "Caught: " . $t->getMessage();
}
```

---

## 🏗️ Custom Exceptions

Creating your own exception classes makes error handling expressive and allows callers to catch specific error types. Extend `RuntimeException` for errors that are only detectable at runtime, and `LogicException` for errors that indicate a programming mistake. Add contextual properties (like `getErrors()`) to carry extra information.

```php
// Base application exception
class AppException extends RuntimeException {}

// Domain-specific exceptions
class UserNotFoundException extends AppException {
    public function __construct(int $userId) {
        parent::__construct("User with ID $userId not found", 404);
    }
}

class ValidationException extends AppException {
    private array $errors;

    public function __construct(array $errors) {
        parent::__construct("Validation failed", 422);
        $this->errors = $errors;
    }

    public function getErrors(): array {
        return $this->errors;
    }
}

class DatabaseException extends AppException {
    public function __construct(string $query, \Throwable $previous = null) {
        parent::__construct(
            "Database error executing: $query",
            500,
            $previous   // chain exceptions
        );
    }
}

// Usage
try {
    throw new UserNotFoundException(42);
} catch (UserNotFoundException $e) {
    echo $e->getMessage();  // User with ID 42 not found
    echo $e->getCode();     // 404
}

try {
    throw new ValidationException(["email" => "Required", "name" => "Too short"]);
} catch (ValidationException $e) {
    print_r($e->getErrors());
}
```

---

## 🔗 Exception Chaining

Exception chaining (also called wrapping) lets you catch a low-level exception and re-throw a higher-level one that provides more context — while preserving the original as the `$previous` cause. This keeps error messages meaningful at every layer without losing the root cause for debugging.

```php
function queryDatabase(string $sql): array {
    try {
        // simulate failing PDO query
        throw new PDOException("SQLSTATE[42S02]: Table doesn't exist");
    } catch (PDOException $e) {
        throw new DatabaseException($sql, $e);  // wrap with context
    }
}

try {
    queryDatabase("SELECT * FROM missing_table");
} catch (DatabaseException $e) {
    echo $e->getMessage() . "\n";

    // Access the original cause
    $prev = $e->getPrevious();
    if ($prev) {
        echo "Caused by: " . $prev->getMessage();
    }
}
```

---

## 🔄 Multiple catch & Union Types (PHP 8.0+)

A single `catch` block can handle multiple exception types at once using the pipe `|` syntax. This avoids duplicating handler logic when different exceptions need identical treatment. In PHP 8, `match` used as an expression inside functions makes throwing type-specific exceptions more concise.

```php
function riskyOperation(int $type): string {
    return match($type) {
        1 => throw new InvalidArgumentException("Bad argument"),
        2 => throw new RuntimeException("Runtime issue"),
        3 => throw new LogicException("Logic error"),
        default => "OK"
    };
}

// Catch multiple exception types in one block (PHP 8+)
try {
    echo riskyOperation(1);
} catch (InvalidArgumentException | LogicException $e) {
    echo "Logic/Argument error: " . $e->getMessage();
} catch (RuntimeException $e) {
    echo "Runtime error: " . $e->getMessage();
}
```

---

## 🛠️ Custom Error Handler

`set_error_handler()` lets you replace PHP's default error handling with your own function. The most common use is converting traditional PHP errors into `ErrorException` objects so they can be caught with `try/catch` alongside regular exceptions — giving you one unified error handling system.

```php
// Convert PHP errors to exceptions
set_error_handler(function(
    int    $severity,
    string $message,
    string $file,
    int    $line
): bool {
    if (!(error_reporting() & $severity)) {
        return false;  // not in error_reporting level, ignore
    }
    throw new ErrorException($message, 0, $severity, $file, $line);
});

// Now traditional errors become catchable
try {
    $arr = [];
    echo $arr["missing"];   // normally just a notice
} catch (ErrorException $e) {
    echo "Caught notice: " . $e->getMessage();
} finally {
    restore_error_handler();  // restore previous handler
}
```

---

## 💀 Fatal Error Handler

`register_shutdown_function()` registers a callback that runs when the script ends — including after **fatal errors** that the normal error handler cannot catch. It's used to handle `E_ERROR`, `E_PARSE`, and `E_CORE_ERROR`, log them, and show a user-friendly error page instead of a blank screen.

```php
// Register a shutdown function — runs even on fatal errors
register_shutdown_function(function(): void {
    $error = error_get_last();
    if ($error && in_array($error['type'], [E_ERROR, E_PARSE, E_CORE_ERROR])) {
        // log the fatal error
        error_log("FATAL: " . $error['message'] . " in " . $error['file'] . ":" . $error['line']);
        // show user-friendly error page
        http_response_code(500);
        echo "An unexpected error occurred.";
    }
});
```

---

## 🔍 Exception Methods

The `Exception` class provides a rich set of methods for inspecting what went wrong and where. `getMessage()`, `getCode()`, `getFile()`, `getLine()`, and `getTraceAsString()` are the primary diagnostic tools. `getPrevious()` returns the chained original exception.

```php
try {
    throw new RuntimeException("Something broke", 500);
} catch (RuntimeException $e) {
    echo $e->getMessage();    // "Something broke"
    echo $e->getCode();       // 500
    echo $e->getFile();       // /path/to/file.php
    echo $e->getLine();       // line number
    echo $e->getTraceAsString(); // full stack trace
    print_r($e->getTrace());  // stack trace as array
    $e->getPrevious();        // chained exception
}
```

---

## 🧹 finally Block

The `finally` block runs **unconditionally** after `try` and any `catch` — whether an exception was thrown, caught, or rethrown, and even if a `return` was hit. It is the right place for cleanup code (closing file handles, releasing locks, restoring state) that must always run.

```php
function readConfig(string $path): array {
    $handle = null;
    try {
        $handle = fopen($path, 'r');
        if ($handle === false) {
            throw new RuntimeException("Cannot open: $path");
        }
        $content = fread($handle, filesize($path));
        return json_decode($content, true, 512, JSON_THROW_ON_ERROR);
    } catch (JsonException $e) {
        throw new RuntimeException("Invalid JSON in config file", 0, $e);
    } finally {
        // Always runs — even if exception is thrown or rethrown
        if ($handle !== false && $handle !== null) {
            fclose($handle);   // guaranteed cleanup
        }
    }
}
```

---

## 🏗️ Best Practices

Good exception handling means catching only what you can meaningfully respond to, always including context in messages, and letting unexpected exceptions bubble up to a single top-level handler that logs them. Avoid catching `Exception` broadly just to suppress errors — that hides bugs.

```php
// ✅ Use specific exception types
throw new InvalidArgumentException("Age must be positive, got: $age");

// ✅ Include context in messages
throw new RuntimeException("Failed to write to cache: $key");

// ❌ Never catch Exception to silently swallow errors
try { /* ... */ } catch (Exception $e) { }  // BAD!

// ✅ Catch only what you can handle
try {
    $user = findUser($id);
} catch (UserNotFoundException $e) {
    return $this->notFound($e->getMessage());
}

// ✅ Use finally for cleanup, not for business logic
// ✅ Document what exceptions a function might throw

// ✅ Exception messages for developers, error codes for users
throw new HttpException(404, "User $id not found in database");

// ✅ Log exceptions at the boundary (entry point), not deep in code
```

---

## 📋 Error Handling Quick Reference

| Scenario | Tool |
|----------|------|
| Stop script on error | `throw new Error(...)` |
| Recoverable logic error | `throw new LogicException(...)` |
| Check invalid input | `throw new InvalidArgumentException(...)` |
| Resource not found | `throw new RuntimeException(...)` / custom |
| Traditional PHP error | `set_error_handler()` + `ErrorException` |
| Fatal error logging | `register_shutdown_function()` |
| Always-run cleanup | `finally` block |
| Catch anything | `catch (Throwable $t)` |


---

[← Previous: Interfaces, Abstract Classes & Traits](09-interfaces-and-traits.md) | [Contents](README.md) | [Next: File I/O →](11-file-io.md)
