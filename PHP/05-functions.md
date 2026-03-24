# 05: Functions

## 📌 Defining & Calling Functions

Functions are reusable named blocks of code that accept inputs (parameters) and optionally return a value. In PHP, functions are **globally available** once defined anywhere in the same script — unlike variables, they can even be called before their definition appears in the file.

```php
<?php
// Basic function
function greet(string $name): string {
    return "Hello, $name!";
}

echo greet("Alice");   // Hello, Alice!

// Functions are global once defined anywhere in scope
// (even after the call site, unlike variables)
sayHi();

function sayHi(): void {
    echo "Hi!\n";
}
```

---

## 🏷️ Type Declarations

Type declarations specify what type a parameter must be and what type a function returns. With `declare(strict_types=1)`, PHP enforces these strictly at call time. PHP 8 added **union types** (`int|string`), **nullable types** (`?string`), **mixed** (any type), and **never** (function always throws or exits).

```php
declare(strict_types=1);

// Parameter types
function add(int $a, int $b): int {
    return $a + $b;
}

// Return type — void for no return value
function logMessage(string $msg): void {
    echo $msg . "\n";
}

// Nullable types (PHP 7.1+)
function findUser(?int $id): ?string {
    if ($id === null) return null;
    return "User #$id";
}

// Union types (PHP 8.0+)
function formatId(int|string $id): string {
    return (string) $id;
}

// Intersection types (PHP 8.1+ — must satisfy ALL types)
function process(Iterator&Countable $col): void { }

// mixed — any type (PHP 8.0+)
function dump(mixed $value): void {
    var_dump($value);
}

// never — function never returns (throws or exits) (PHP 8.1+)
function fail(string $msg): never {
    throw new RuntimeException($msg);
}
```

---

## 🎛️ Parameters & Defaults

Parameters with **default values** are optional — they use their default when the caller omits them. **Variadic parameters** (`...$args`) gather any number of extra arguments into an array. The **spread operator** (`...$array`) unpacks an array into positional arguments when calling a function.

```php
// Default values
function createUser(string $name, int $age = 25, bool $active = true): array {
    return compact('name', 'age', 'active');
}

createUser("Alice");                      // age=25, active=true
createUser("Bob", 30);                    // active=true
createUser("Charlie", 40, false);

// Default must be a constant expression (not a variable/function call)
function example(array $items = []): void { }      // ✅
function bad(array $items = getDefault()): void {} // ❌ parse error

// Variadic parameters
function sum(int ...$numbers): int {
    return array_sum($numbers);
}
echo sum(1, 2, 3, 4);   // 10

// Spread operator — unpack an array into args
$nums = [1, 2, 3];
echo sum(...$nums);     // 6

// Mixed variadic
function mixed(string $prefix, int ...$nums): string {
    return $prefix . ': ' . implode(',', $nums);
}
echo mixed("Values", 1, 2, 3);   // Values: 1,2,3
```

---

## 🏷️ Named Arguments (PHP 8.0+)

Named arguments let you pass values by **parameter name** rather than position. This means you can skip optional parameters in the middle of a signature, and argument order no longer matters. Named arguments are especially useful with built-in PHP functions that have many optional parameters.

```php
function createTag(string $tag, string $content, string $class = ""): string {
    $cls = $class ? " class=\"$class\"" : "";
    return "<$tag$cls>$content</$tag>";
}

// Named args — order independent, skip defaults
echo createTag(content: "Hello", tag: "p");
echo createTag(tag: "div", content: "World", class: "box");

// Useful with built-in functions
$arr = [3, 1, 4, 1, 5];
echo implode(separator: ", ", array: $arr);

array_slice(array: $arr, offset: 1, length: 3, preserve_keys: true);
```

---

## 📦 Return Values

Functions return a single value with `return`. To return multiple values, use an array and destructure on the receiving end with `list()` or `[]`. Functions can also return **by reference** (`function &getName()`). The **guard clause** pattern returns early for invalid inputs, keeping the main logic un-indented and readable.

```php
// Return single value
function square(int $n): int {
    return $n ** 2;
}

// Return multiple via array
function minMax(array $arr): array {
    return [min($arr), max($arr)];
}
[$min, $max] = minMax([3, 1, 4, 1, 5]);

// Return by reference
function &getRef(array &$data, string $key): mixed {
    return $data[$key];
}
$arr = ['count' => 0];
$ref = &getRef($arr, 'count');
$ref = 10;
echo $arr['count'];   // 10

// Early return pattern (guard clauses)
function processOrder(array $order): string {
    if (empty($order)) return "Empty order";
    if (!isset($order['total'])) return "Missing total";
    if ($order['total'] <= 0) return "Invalid total";

    // happy path
    return "Order processed: \${$order['total']}";
}
```

---

## 🔒 Variable Scope

PHP functions have their **own isolated scope** — outer variables are not accessible inside unless explicitly imported with `global`. The `$GLOBALS` array provides access to all global variables from anywhere. Prefer passing values as parameters over using `global`, as it makes functions easier to test in isolation.

```php
$global = "I am global";

function noAccess(): void {
    // echo $global;  // Undefined — functions have their own scope
}

function useGlobal(): void {
    global $global;     // import global
    echo $global;
    $global = "Modified";  // changes the original
}

// $GLOBALS superglobal
function useGlobalsArr(): void {
    echo $GLOBALS['global'];
}
```

---

## 🏹 Anonymous Functions (Closures)
Anonymous functions (closures) are functions without a name, assigned to a variable or passed as an argument. To access variables from the surrounding scope inside a closure, use the `use` keyword. Pass by **value** (default) for a snapshot, or by **reference** (`&$var`) if the closure needs to modify the outer variable.
```php
// Basic closure
$greet = function(string $name): string {
    return "Hello, $name!";
};
echo $greet("Alice");

// Closures capture variables with 'use'
$prefix = "Dear";
$formal = function(string $name) use ($prefix): string {
    return "$prefix $name";
};
echo $formal("Alice");   // Dear Alice

// Capture by reference
$count = 0;
$increment = function() use (&$count): void {
    $count++;
};
$increment();
$increment();
echo $count;   // 2

// Closures as callbacks
$numbers = [3, 1, 4, 1, 5, 9];
$evens = array_filter($numbers, function($n) { return $n % 2 === 0; });
$doubled = array_map(function($n) { return $n * 2; }, $numbers);
usort($numbers, function($a, $b) { return $a <=> $b; });
```

---

## ➡️ Arrow Functions (PHP 7.4+)

Arrow functions are a compact closure syntax for **single-expression** functions. Unlike regular closures, they **automatically capture** variables from the enclosing scope without needing `use`. The expression result is implicitly returned — no `return` keyword needed. Arrow functions cannot have a block body.

```php
// Short syntax — single expression, implicit return
$double = fn($n) => $n * 2;
echo $double(5);   // 10

// Arrow functions auto-capture outer variables (no 'use' needed)
$multiplier = 3;
$times = fn($n) => $n * $multiplier;
echo $times(4);    // 12

// Nested arrow functions
$addTax = fn($rate) => fn($price) => $price * (1 + $rate);
$withVAT = $addTax(0.2);
echo $withVAT(100);    // 120.0

// Arrow functions in array operations
$prices = [10.0, 25.0, 50.0];
$discounted = array_map(fn($p) => $p * 0.9, $prices);
$expensive  = array_filter($prices, fn($p) => $p > 20);
```

---

## ♻️ Recursive Functions

A recursive function calls itself to break a problem into smaller sub-problems of the same type. Every recursive function must have a **base case** that stops the recursion — without one, it runs forever and exhausts the call stack. **Memoization** caches previously computed results to avoid redundant computation.

```php
function factorial(int $n): int {
    if ($n <= 1) return 1;
    return $n * factorial($n - 1);
}
echo factorial(5);   // 120

// Memoized recursion
function fib(int $n, array &$memo = []): int {
    if ($n <= 1) return $n;
    if (isset($memo[$n])) return $memo[$n];
    $memo[$n] = fib($n - 1, $memo) + fib($n - 2, $memo);
    return $memo[$n];
}
echo fib(10);   // 55
```

---

## 🔧 First-Class Callables (PHP 8.1+)

First-class callables let you convert any function, static method, or instance method into a `Closure` object using the `...` (ellipsis) argument syntax. This makes it easy to pass existing named functions to higher-order functions like `array_map()` or `usort()` without wrapping them in an anonymous function.

```php
function double(int $n): int {
    return $n * 2;
}

// Obtain a closure from any callable with Closure::fromCallable
$fn = Closure::fromCallable('double');

// PHP 8.1 first-class callable syntax
$fn = double(...);       // creates a Closure from a function
$arr = [3, 1, 4];
$doubled = array_map(double(...), $arr);    // [6, 2, 8]

class Math {
    public static function square(int $n): int { return $n ** 2; }
    public function cube(int $n): int { return $n ** 3; }
}

$sq   = Math::square(...);   // static method
$math = new Math();
$cu   = $math->cube(...);    // instance method
```

---

## 🏗️ Built-in Function Utilities
PHP provides meta-functions for working with functions dynamically at runtime: checking whether a function exists, calling a function by its name stored in a string, and listing all defined functions. These are commonly used in plugin architectures and framework internals.
```php
// Check if function exists
function_exists('array_map');     // true
function_exists('myCustomFunc');  // false (if not defined)

// Get all defined functions
$funcs = get_defined_functions();
// $funcs['internal'] — PHP built-ins
// $funcs['user']     — user-defined

// call_user_func and call_user_func_array
function multiply(int $a, int $b): int { return $a * $b; }

call_user_func('multiply', 3, 4);         // 12
call_user_func_array('multiply', [3, 4]); // 12

// Dynamic function calls
$funcName = 'strtoupper';
echo $funcName("hello");   // HELLO
```

---

## 🧩 Static Functions & Methods

A **static local variable** inside a function retains its value across calls — it is initialised only once on the first call. **Static methods** and properties belong to the class itself rather than any instance, and are called with `ClassName::method()`. Both are useful for counters, caches, and utility helpers.

```php
// Static local variable
function counter(): int {
    static $count = 0;
    return ++$count;
}
echo counter();  // 1
echo counter();  // 2
echo counter();  // 3

// Static class method (no instance needed)
class MathHelper {
    public static function add(int $a, int $b): int {
        return $a + $b;
    }
}

echo MathHelper::add(3, 4);  // 7
$method = [MathHelper::class, 'add'];
call_user_func($method, 3, 4);
```

---

## 📋 Parameter Passing: Value vs Reference

By default PHP passes arguments **by value** — the function receives a copy and the original variable is unchanged. Passing **by reference** (`&$param`) lets the function modify the caller's variable directly. Objects behave differently: they are passed by a reference handle by default, so modifying an object's properties inside a function affects the original.

```php
// By value (default) — copy is passed
function doubleVal(int $n): int {
    $n *= 2;
    return $n;
}
$x = 5;
doubleVal($x);
echo $x;   // 5 — unchanged

// By reference — original is modified
function doubleRef(int &$n): void {
    $n *= 2;
}
doubleRef($x);
echo $x;   // 10 — changed!

// Arrays and objects — objects pass by reference-handle by default
function addItem(array &$arr, mixed $item): void {
    $arr[] = $item;
}
$list = [1, 2];
addItem($list, 3);
print_r($list);  // [1, 2, 3]
```


---

[← Previous: Control Flow](04-control-flow.md) | [Contents](README.md) | [Next: Strings →](06-strings.md)
