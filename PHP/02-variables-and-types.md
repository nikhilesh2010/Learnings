# 02: Variables & Data Types

## 📦 Variables

PHP variables start with `$` and require no explicit declaration.

```php
<?php
$name    = "Alice";   // string
$age     = 30;        // integer
$price   = 9.99;      // float
$active  = true;      // boolean
$nothing = null;      // null

// Variable names: case-sensitive, start with letter or _
$myVar  = 1;
$my_var = 2;   // different variable!
$_count = 0;
```

### Variable Variables
```php
$varName = "hello";
$$varName = "world";   // creates $hello = "world"

echo $hello;    // world
echo $$varName; // world
```

---

## 🔢 Data Types

PHP has **8 primitive types** grouped into three categories:

| Category | Types |
|----------|-------|
| **Scalar** | `int`, `float`, `string`, `bool` |
| **Compound** | `array`, `object` |
| **Special** | `null`, `resource` |

---

### 1. Integer (`int`)

```php
$a = 42;
$b = -10;
$c = 1_000_000;    // underscore separator (PHP 7.4+)
$hex = 0x1A;        // hexadecimal = 26
$oct = 0755;        // octal = 493
$bin = 0b11001100;  // binary = 204

echo PHP_INT_MAX;   // 9223372036854775807 (64-bit)
echo PHP_INT_MIN;   // -9223372036854775808
echo PHP_INT_SIZE;  // 8 (bytes)
```

---

### 2. Float (`float` / `double`)

```php
$pi    = 3.14159;
$sci   = 1.5e3;    // 1500.0
$small = 1.5e-3;   // 0.0015

echo PHP_FLOAT_MAX;    // 1.7976931348623E+308
echo PHP_FLOAT_EPSILON; // 2.2204460492503E-16

// Floating-point precision gotcha
var_dump(0.1 + 0.2 == 0.3);    // bool(false) ⚠️
var_dump(abs(0.1 + 0.2 - 0.3) < PHP_FLOAT_EPSILON);  // bool(true) ✅

// Use bcmath for precise decimal arithmetic
echo bcadd('0.1', '0.2', 10);  // 0.3000000000
```

---

### 3. String (`string`)

```php
// Single-quoted: literal, no variable interpolation
$s1 = 'Hello, $name';    // Hello, $name (literal)
$s2 = 'It\'s a string';  // escape single quote

// Double-quoted: interpolation + escape sequences
$name = "Alice";
$s3 = "Hello, $name!";          // Hello, Alice!
$s4 = "Tab:\there, Newline:\n"; // escape sequences work
$s5 = "Result: {$obj->method()}"; // complex expressions with {}

// Heredoc: like double-quoted, good for multi-line
$text = <<<EOT
    Hello, $name.
    This is heredoc.
    EOT;

// Nowdoc: like single-quoted, no interpolation
$raw = <<<'EOT'
    Hello, $name.
    No interpolation here.
    EOT;

// String as array of characters
$str = "Hello";
echo $str[0];   // H
echo $str[-1];  // o (negative index, PHP 7.1+)
```

---

### 4. Boolean (`bool`)

```php
$yes  = true;
$no   = false;

// Falsy values in PHP (everything else is truthy)
var_dump((bool) false);    // false
var_dump((bool) 0);        // false
var_dump((bool) 0.0);      // false
var_dump((bool) "");       // false
var_dump((bool) "0");      // false  ← common gotcha!
var_dump((bool) []);       // false
var_dump((bool) null);     // false

// Truthy
var_dump((bool) "false");  // true  ← non-empty string!
var_dump((bool) [0]);      // true  ← non-empty array!
var_dump((bool) -1);       // true  ← any non-zero number!
```

---

### 5. Null

```php
$x = null;
$y = NULL;   // case-insensitive

var_dump(is_null($x));    // true
var_dump(isset($x));      // false — null counts as "not set"
var_dump(isset($z));      // false — undefined variable

// null coalescing operator (PHP 7+)
$val = $x ?? "default";   // "default"
```

---

### 6. Array

```php
// Indexed array
$fruits = ["apple", "banana", "cherry"];
$nums   = [1, 2, 3];

// Associative array (like a dictionary / hashmap)
$person = [
    "name" => "Alice",
    "age"  => 30,
];

// Multi-dimensional
$matrix = [[1, 2], [3, 4]];

// Old syntax (still valid)
$arr = array(1, 2, 3);
```

> Arrays are covered in depth in [07-arrays.md](07-arrays.md).

---

### 7. Object

```php
class Dog {
    public string $name;
    public function bark(): string {
        return "Woof!";
    }
}

$dog = new Dog();
$dog->name = "Rex";
echo $dog->name;    // Rex
echo $dog->bark();  // Woof!
```

> Objects are covered in depth in [08-oop.md](08-oop.md).

---

### 8. Resource

```php
// A resource is a reference to an external resource
$file = fopen("data.txt", "r");   // file resource
$conn = mysqli_connect("localhost", "root", "", "db"); // DB resource

// Always release resources when done
fclose($file);
mysqli_close($conn);
```

---

## 🔍 Type Checking Functions

PHP provides functions to inspect a variable's type at runtime. `gettype()` returns the type as a string, `var_dump()` shows type and value together (great for debugging), and the `is_*()` family (`is_int()`, `is_string()`, `is_array()`, etc.) returns a boolean. Use these when validating input from external sources.

```php
$val = 42;

gettype($val);          // "integer"
var_dump($val);         // int(42)

is_int($val);           // true
is_integer($val);       // alias for is_int
is_float($val);         // false
is_string($val);        // false
is_bool($val);          // false
is_null($val);          // false
is_array($val);         // false
is_object($val);        // false
is_numeric("42");       // true  — "42" is numeric
is_numeric("42abc");    // false

// instanceof for objects
$obj = new stdClass();
$obj instanceof stdClass;  // true
```

---

## 🔄 Type Casting

### Explicit Casting

```php
$str = "42.5";

(int)    $str;    // 42
(float)  $str;    // 42.5
(string) 99;      // "99"
(bool)   1;       // true
(array)  "hello"; // ["hello"]
(object) ["a" => 1]; // stdClass { a: 1 }

// settype() — changes in place
$x = "3.14";
settype($x, "float");
var_dump($x);   // float(3.14)
```

### Implicit (Coercion)

```php
// PHP coerces types in loose comparisons and arithmetic
echo 5 + "3 apples";  // 8  (extracts leading number) ⚠️
echo "5" + 3;         // 8
echo 10 - "2";        // 8

// With strict_types=1, function signatures enforce types
// but arithmetic still coerces
```

---

## 🆚 Loose vs Strict Comparison

PHP has two equality operators. `==` performs **loose comparison** with automatic type coercion — notorious for surprising results like `0 == "a"` being `true` in PHP 7. `===` performs **strict comparison** requiring both value AND type to match. Always prefer `===` in application code to avoid subtle bugs.

```php
// == (loose) — coerces types before comparing
var_dump(0  == "a");    // true  (PHP 7) / false (PHP 8) ← changed!
var_dump(0  == "0");    // true
var_dump("" == false);  // true
var_dump("" == null);   // true
var_dump(100 == "1e2"); // true

// === (strict) — checks type AND value
var_dump(0   === "0");  // false — different types
var_dump(100 === 100);  // true

// Always prefer === for comparisons
```

> PHP 8.0 changed `0 == "non-numeric-string"` from `true` to `false` — a common source of upgrade bugs.

---

## 🌍 Constants

Constants hold values that **cannot change** after definition. Unlike variables they have no `$` prefix. Use `const` for class-level or compile-time constants. Use `define()` for runtime constants (e.g. defined inside an `if` block). PHP also ships with many built-in constants like `PHP_EOL`, `PHP_INT_MAX`, and `DIRECTORY_SEPARATOR`.

```php
// define() — global, case-insensitive option
define('MAX_SIZE', 100);
define('PI', 3.14159);

// const — preferred in OOP and namespaced code (compile-time)
const APP_NAME = 'MyApp';
const DB_PORT  = 3306;

echo MAX_SIZE;   // 100
echo APP_NAME;   // MyApp

// PHP built-in constants
echo PHP_EOL;    // OS-appropriate newline
echo PHP_MAJOR_VERSION; // 8
echo DIRECTORY_SEPARATOR; // \ on Windows, / on Linux

// Check if constant exists
defined('MAX_SIZE');  // true
```

---

## 🔁 Variable Scope

Unlike JavaScript, PHP functions do **not** automatically inherit the surrounding scope — every function has its own isolated scope. To access a global variable inside a function you must explicitly declare it with `global`. The `static` keyword creates a local variable that persists its value across multiple calls to the same function.

```php
$globalVar = "I'm global";

function noAccess() {
    // echo $globalVar;  // Undefined! PHP functions don't auto-inherit globals
}

function withGlobal() {
    global $globalVar;   // explicitly import
    echo $globalVar;     // I'm global
}

function withStatic() {
    static $count = 0;   // persists across calls
    $count++;
    echo $count;
}

withStatic();  // 1
withStatic();  // 2
withStatic();  // 3

// Superglobals are always available everywhere
// $_GET, $_POST, $_SESSION, $_COOKIE, $_SERVER, $_ENV, $_FILES, $GLOBALS
echo $_SERVER['PHP_SELF'];   // current script path
```

---

## 📋 Type Juggling Summary

| Original | `(int)` | `(float)` | `(string)` | `(bool)` |
|----------|---------|-----------|------------|----------|
| `0` | `0` | `0.0` | `"0"` | `false` |
| `1` | `1` | `1.0` | `"1"` | `true` |
| `""` | `0` | `0.0` | `""` | `false` |
| `"0"` | `0` | `0.0` | `"0"` | `false` |
| `"1"` | `1` | `1.0` | `"1"` | `true` |
| `"abc"` | `0` | `0.0` | `"abc"` | `true` |
| `[]` | `0` | `0.0` | Error | `false` |
| `[1,2]` | `1` | `1.0` | Error | `true` |
| `null` | `0` | `0.0` | `""` | `false` |
| `true` | `1` | `1.0` | `"1"` | `true` |
| `false` | `0` | `0.0` | `""` | `false` |


---

[← Previous: Introduction to PHP](01-introduction.md) | [Contents](README.md) | [Next: Operators →](03-operators.md)
