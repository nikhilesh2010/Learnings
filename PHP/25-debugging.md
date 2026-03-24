# 25: Debugging

---

## 🔍 Basic Debugging Functions

PHP's built-in inspection functions let you print the contents of any value at any point in execution. `var_dump()` shows type and value (most informative). `print_r()` gives a readable tree. `var_export()` outputs valid PHP syntax. When output goes to a browser and you need to inspect silently, capture with `ob_start()` / `ob_get_clean()` and forward to `error_log()`.

```php
<?php
declare(strict_types=1);

$data = ['name' => 'Alice', 'scores' => [95, 87, 91], 'active' => true];

// var_dump — shows type + value, best for single variables
var_dump($data);
/*
array(3) {
  ["name"]    => string(5) "Alice"
  ["scores"]  => array(3) { [0]=> int(95) ... }
  ["active"]  => bool(true)
}
*/

// print_r — more readable tree format
print_r($data);

// var_export — valid PHP syntax, useful for generating fixtures/config
var_export($data);
var_export($data, true);  // return as string instead of printing

// json_encode — clean for arrays to read in browser
echo json_encode($data, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE);

// Capture output in a string
ob_start();
var_dump($data);
$output = ob_get_clean();
error_log($output);   // send to error log instead of browser
```

---

## 📝 Logging with error_log

`error_log()` is the simplest way to log PHP messages without touching browser output. It writes to the file set by the `error_log` directive in `php.ini`. Use `print_r($data, true)` to stringify complex values before logging. This is particularly useful in production where `display_errors` is disabled.

```php
// error_log sends to the PHP error log (set in php.ini: error_log = /var/log/php-error.log)
error_log("Something happened");
error_log("User ID: " . $userId);
error_log(print_r($data, true));  // log a complex value

// Types:
// 0 = PHP error log (default)
// 1 = email
// 3 = append to a file
error_log("Debug: request received\n", 3, '/tmp/app-debug.log');

// Useful in production where display_errors is Off
```

---

## 📦 Monolog — Structured Logging

**Monolog** is the de-facto standard structured logging library for PHP, used by Laravel, Symfony, and most modern frameworks. It supports multiple **handlers** (file, STDERR, Slack, database) and **formatters** (line, JSON). Log levels follow PSR-3: DEBUG → INFO → NOTICE → WARNING → ERROR → CRITICAL → ALERT → EMERGENCY.

```bash
composer require monolog/monolog
```

```php
use Monolog\Logger;
use Monolog\Handler\StreamHandler;
use Monolog\Handler\RotatingFileHandler;
use Monolog\Formatter\JsonFormatter;

// Create logger
$log = new Logger('app');

// Write to daily rotating log file
$handler = new RotatingFileHandler(__DIR__ . '/logs/app.log', 30, Logger::DEBUG);
$handler->setFormatter(new JsonFormatter());
$log->pushHandler($handler);

// Also write errors to stderr in dev
if (getenv('APP_ENV') === 'development') {
    $log->pushHandler(new StreamHandler('php://stderr', Logger::DEBUG));
}

// Log levels: DEBUG < INFO < NOTICE < WARNING < ERROR < CRITICAL < ALERT < EMERGENCY
$log->debug('Processing request', ['url' => $_SERVER['REQUEST_URI']]);
$log->info('User logged in', ['user_id' => $userId]);
$log->warning('Rate limit approaching', ['limit' => 100, 'current' => 95]);
$log->error('Database query failed', ['sql' => $sql, 'exception' => $e->getMessage()]);
$log->critical('Service unavailable', ['service' => 'payment-gateway']);
```

---

## 🛠️ Xdebug Setup

**Xdebug** is the definitive PHP debugging extension. It enables step-through debugging with breakpoints in VS Code or PhpStorm, full variable inspection at runtime, and call-stack analysis. It also adds code coverage for PHPUnit and profiling output (cachegrind format) for flamegraph analysis.

```bash
# Install
pecl install xdebug

# php.ini additions:
zend_extension=xdebug
xdebug.mode=debug
xdebug.start_with_request=yes
xdebug.client_host=127.0.0.1
xdebug.client_port=9003
xdebug.log=/tmp/xdebug.log
```

### VS Code + Xdebug

1. Install "PHP Debug" extension (xdebug.php-debug)
2. Create `.vscode/launch.json`:

```json
{
    "version": "0.2.0",
    "configurations": [
        {
            "name": "Listen for Xdebug",
            "type": "php",
            "request": "launch",
            "port": 9003
        },
        {
            "name": "Launch current script",
            "type": "php",
            "request": "launch",
            "program": "${file}",
            "cwd": "${workspaceFolder}"
        }
    ]
}
```

3. Press F5, set breakpoints in the gutter, reload the page.

---

## 🔬 Xdebug Functions

When Xdebug is active it enhances `var_dump()` (depth-limited, colour-coded) and adds its own functions. `xdebug_var_dump()` respects `xdebug.var_display_max_depth`. `xdebug_print_function_stack()` dumps the current call stack inline. Trace and coverage functions drive PHPUnit's code-coverage reports.

```php
// Dump with full detail (respects xdebug.var_display_max_depth)
xdebug_var_dump($complexObject);

// Get call stack
xdebug_print_function_stack();

// Start profiling at a specific point
xdebug_start_trace('/tmp/trace');
// ... code ...
xdebug_stop_trace();

// Measure timing
$time = xdebug_time_index();   // seconds since script start

// Check coverage (requires xdebug.mode=coverage)
xdebug_start_code_coverage();
// ... run code ...
$coverage = xdebug_get_code_coverage();
```

---

## ⚡ Profiling

Profiling reveals where time and memory are spent in your application. `microtime(true)` gives microsecond precision for manual timing. `memory_get_usage()` / `memory_get_peak_usage()` track memory consumption. For production profiling, use Xdebug's profiler output (cachegrind files) or **Blackfire** which generates visualised flamegraphs.

```php
// Quick manual profiling with microtime + memory
function profile(string $label, callable $fn): mixed {
    $start  = microtime(true);
    $memBefore = memory_get_usage(true);

    $result = $fn();

    $elapsed = (microtime(true) - $start) * 1000;
    $memDiff = memory_get_usage(true) - $memBefore;

    printf("[%s] %.2f ms | %+d bytes\n", $label, $elapsed, $memDiff);
    return $result;
}

$users = profile('findAll', fn() => $userRepo->findAll());

// Memory snapshots
$peak = memory_get_peak_usage(true);   // highest usage
echo "Peak memory: " . round($peak / 1024 / 1024, 2) . " MB";
```

---

## 🚨 Common Errors and Solutions

Knowing PHP's most frequent fatal errors by pattern saves hours of debugging. **"Headers already sent"** means output was generated before a `header()` call (check for whitespace before `<?php`). **"Call to member function on null"** means an object fetch returned null and wasn't checked. **"Class not found"** usually indicates a Composer autoloading issue or wrong namespace.

```php
// ────────────────────────────────────────────────────
// "Headers already sent in ... on line N"
// ────────────────────────────────────────────────────
// Cause: whitespace/BOM/echo before header() call
// Fix:   remove whitespace before <?php, use output buffering,
//        ensure no BOM in UTF-8 files
ob_start();         // buffer output before headers
header('Location: /page');
ob_end_flush();

// ────────────────────────────────────────────────────
// "Undefined array key 'foo' / Undefined variable $bar"
// ────────────────────────────────────────────────────
// Fix: null coalescing or isset()
$val = $_GET['q'] ?? '';
$name = $data['name'] ?? 'default';

// ────────────────────────────────────────────────────
// "Call to a member function xxx() on null"
// ────────────────────────────────────────────────────
$user = findUser($id);
if ($user === null) throw new \RuntimeException("User not found");
$user->getName();   // safe

// PHP 8+: nullsafe operator
$city = $user?->getAddress()?->getCity();

// ────────────────────────────────────────────────────
// "Maximum execution time exceeded"
// ────────────────────────────────────────────────────
set_time_limit(120);          // extend for long operations
ini_set('max_execution_time', '0');  // unlimited (CLI scripts)

// ────────────────────────────────────────────────────
// "Allowed memory size exhausted"
// ────────────────────────────────────────────────────
ini_set('memory_limit', '512M');
// Better fix: process in chunks, avoid loading all rows at once
$stmt = $pdo->query("SELECT * FROM big_table");
while ($row = $stmt->fetch()) { processRow($row); }   // stream rows

// ────────────────────────────────────────────────────
// "Class not found" / autoloading issues
// ────────────────────────────────────────────────────
// 1. Check namespace matches directory path (PSR-4)
// 2. composer dump-autoload
// 3. Verify vendor/autoload.php is required
```

---

## 🧰 Debugging Helpers

Small reusable helper functions make ad-hoc debugging effortless. `dd()` (dump-and-die) prints all arguments with full detail then stops execution — ideal for quick inspection. A `dump()` variant prints without stopping, useful inside loops. **Symfony VarDumper** (`dump()`) provides colour-coded, collapsible output in the browser.

```php
// Pretty-print die (common in small scripts)
function dd(mixed ...$values): never {
    foreach ($values as $v) {
        echo '<pre>';
        var_dump($v);
        echo '</pre>';
    }
    exit;
}

// Return as string (email/log)
function dumpToString(mixed $value): string {
    ob_start();
    var_dump($value);
    return ob_get_clean();
}

// Show full backtrace
function trace(): void {
    $bt = debug_backtrace(DEBUG_BACKTRACE_IGNORE_ARGS);
    foreach ($bt as $i => $frame) {
        $file = $frame['file'] ?? '[internal]';
        $line = $frame['line'] ?? 0;
        $fn   = ($frame['class'] ?? '') . ($frame['type'] ?? '') . ($frame['function'] ?? '');
        printf("#%d %s(%d): %s()\n", $i, basename($file), $line, $fn);
    }
}
```

---

## 🔧 php.ini: Development vs Production

| Setting | Development | Production |
|---------|------------|-----------|
| `display_errors` | `On` | `Off` |
| `display_startup_errors` | `On` | `Off` |
| `error_reporting` | `E_ALL` | `E_ALL & ~E_DEPRECATED` |
| `log_errors` | `On` | `On` |
| `error_log` | `/tmp/php-errors.log` | `/var/log/php/errors.log` |
| `xdebug.mode` | `debug,develop` | disabled |
| `opcache.enable` | optional | `1` |
| `expose_php` | `On` | `Off` |

---

## 📋 Debugging Quick Reference

| Task | Tool |
|------|------|
| Inspect variable type+value | `var_dump($x)` |
| Inspect array/object tree | `print_r($x)` |
| Log to error log | `error_log(print_r($x, true))` |
| Structured logging | Monolog `Logger` |
| Step-through debugger | Xdebug + VS Code PHP Debug |
| Profile a block | `microtime(true)` before/after |
| Peak memory | `memory_get_peak_usage(true)` |
| Check headers sent | `headers_sent($file, $line)` |
| Stack trace | `debug_backtrace()` |
| Timing trace | Xdebug `xdebug_start_trace()` |


---

[← Previous: Best Practices](24-best-practices.md) | [Contents](README.md)
