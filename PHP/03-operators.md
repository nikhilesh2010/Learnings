# 03: Operators

## ➕ Arithmetic Operators

Arithmetic operators perform standard mathematical calculations. Division `/` returns a float when the result isn't a whole number — use `intdiv()` for integer division. The exponentiation operator `**` was introduced in PHP 5.6. `fmod()` and `intdiv()` are the function equivalents for modulo and integer division.

```php
<?php
$a = 10;
$b = 3;

echo $a + $b;   // 13  — addition
echo $a - $b;   // 7   — subtraction
echo $a * $b;   // 30  — multiplication
echo $a / $b;   // 3.333…  — division (always float if not evenly divisible)
echo $a % $b;   // 1   — modulo (remainder)
echo $a ** $b;  // 1000 — exponentiation (PHP 5.6+)

// Integer division
echo intdiv(10, 3);   // 3

// Division returns int when evenly divisible
var_dump(10 / 2);   // int(5)
var_dump(10 / 3);   // float(3.333...)
```

---

## 📝 Assignment Operators

Assignment operators assign a value to a variable, optionally combining with an arithmetic or string operation. Combined operators like `+=`, `-=`, and `.=` are shorthand for `$x = $x + y`. The null coalescing assignment `??=` (PHP 7.4+) only assigns if the variable is `null` or unset — perfect for populating defaults.

```php
$x = 5;         // assign

$x += 3;        // $x = $x + 3   → 8
$x -= 2;        // $x = $x - 2   → 6
$x *= 4;        // $x = $x * 4   → 24
$x /= 6;        // $x = $x / 6   → 4
$x %= 3;        // $x = $x % 3   → 1
$x **= 3;       // $x = $x ** 3  → 1

$str = "Hello";
$str .= " World";   // string concatenation assignment → "Hello World"

// Null coalescing assignment (PHP 7.4+)
$arr = [];
$arr['key'] ??= "default";   // only assigns if null or unset
echo $arr['key'];             // default
```

---

## 🔍 Comparison Operators

Comparison operators compare two values and return a boolean. The **spaceship operator** `<=>` returns -1, 0, or 1 — ideal for `usort()` callbacks. Always use `===` (strict) instead of `==` (loose) to avoid type-coercion surprises, especially with values like `0`, `""`, and `null` which are all loosely equal.

```php
$a = 5;
$b = "5";
$c = 10;

// Loose comparison (type coercion)
var_dump($a == $b);    // true  — value equal after coercion
var_dump($a == $c);    // false

// Strict comparison (type + value)
var_dump($a === $b);   // false — different types (int vs string)
var_dump($a === 5);    // true

// Inequality
var_dump($a != $b);    // false (loose)
var_dump($a !== $b);   // true  (strict)

// Relational
var_dump($a <  $c);    // true
var_dump($a >  $c);    // false
var_dump($a <= 5);     // true
var_dump($a >= 5);     // true

// Spaceship operator (PHP 7+) — returns -1, 0, or 1
echo 1 <=> 2;   // -1
echo 2 <=> 2;   //  0
echo 3 <=> 2;   //  1
// Great for sorting
usort($arr, fn($a, $b) => $a <=> $b);
```

---

## 🧠 Logical Operators

Logical operators combine boolean conditions. PHP has two sets: symbol forms (`&&`, `||`) with higher precedence, and word forms (`and`, `or`) with very low precedence. **Always use `&&` and `||`** in practice — the word operators interact unexpectedly with assignment statements due to their lower precedence.

```php
$t = true;
$f = false;

// Word operators (lower precedence)
$t and $f;    // false
$t or  $f;    // true
$t xor $f;    // true  (one or the other, not both)
!$t;          // false

// Symbol operators (higher precedence — prefer these)
$t && $f;     // false
$t || $f;     // true
!$t;          // false

// Short-circuit evaluation
false && expensiveFunction();   // expensiveFunction never called
true  || expensiveFunction();   // expensiveFunction never called

// Practical use
$user = getUser() && $user->isActive();

// Difference between 'and'/'or' vs '&&'/'||' — precedence!
$a = true;
$b = $a and false;    // $b = true  ! 'and' has lower precedence than =
$c = $a && false;     // $c = false  correct

// Always use && and || to avoid precedence surprises
```

---

## 🔢 Bitwise Operators

Bitwise operators work on individual **bits** of integers. The most common real-world usage is **permission flags** — combine multiple boolean states into one integer using `|`, and test individual flags with `&`. Shift operators `<<` and `>>` multiply or divide by powers of two.

```php
$a = 0b1100;   // 12
$b = 0b1010;   // 10

echo $a &  $b;  // 8  (AND):  1000
echo $a |  $b;  // 14 (OR):   1110
echo $a ^  $b;  // 6  (XOR):  0110
echo ~$a;       // -13 (NOT)
echo $a << 1;   // 24 (left shift)
echo $a >> 1;   // 6  (right shift)

// Common use: permission flags
const READ    = 0b001;  // 1
const WRITE   = 0b010;  // 2
const EXECUTE = 0b100;  // 4

$perm = READ | WRITE;   // 3 — user has read + write
var_dump($perm & READ);    // 1 — has read?
var_dump($perm & EXECUTE); // 0 — has execute? no
```

---

## ➡️ String Operator

PHP uses the **dot** `.` to concatenate (join) strings — not `+` like JavaScript. The `.=` operator appends a string to an existing variable. For building strings inside loops, repeated `.=` can be slow on large strings; prefer `implode()` or an output buffer for heavy concatenation.

```php
$hello = "Hello";
$world = "World";

// Concatenation
$full = $hello . ", " . $world . "!";
echo $full;   // Hello, World!

// Concatenation assignment
$full .= " Have fun.";
echo $full;   // Hello, World! Have fun.
```

---

## 📊 Increment / Decrement

The `++` and `--` operators increase or decrease a value by 1. **Pre-increment** (`++$n`) changes the value first and then returns it. **Post-increment** (`$n++`) returns the current value first and then changes it. Uniquely, PHP also supports `++` on string variables, incrementing alphabetically.

```php
$n = 5;

echo $n++;   // 5  — post-increment: return THEN increment
echo $n;     // 6

echo ++$n;   // 7  — pre-increment: increment THEN return
echo $n;     // 7

echo $n--;   // 7  — post-decrement: return THEN decrement
echo --$n;   // 5  — pre-decrement: decrement THEN return

// Works on strings too (increment only)
$s = "a";
echo ++$s;   // b
$s = "Z";
echo ++$s;   // AA
$s = "Az";
echo ++$s;   // Ba
```

---

## ❓ Ternary & Null Operators

The **ternary** `? :` is a compact inline if/else. The **Elvis operator** `?:` returns the left side if truthy, otherwise the right — useful for fallback values. The **null coalescing operator** `??` returns the left side if it is set and not `null`, making it the safest way to read `$_GET`/`$_POST` values with a default.

```php
// Ternary: condition ? true_val : false_val
$age = 20;
$status = $age >= 18 ? "adult" : "minor";
echo $status;   // adult

// Short ternary (Elvis operator) — returns left if truthy, else right
$name = "" ?: "Anonymous";
echo $name;    // Anonymous

$name = "Alice" ?: "Anonymous";
echo $name;    // Alice

// Null coalescing (PHP 7+) — returns left if NOT null, else right
$user = null;
$display = $user ?? "Guest";
echo $display;  // Guest

// Chaining null coalescing
$a = null;
$b = null;
$c = "Found!";
echo $a ?? $b ?? $c;   // Found!

// Null coalescing assignment (PHP 7.4+)
$config['timeout'] ??= 30;   // set to 30 only if null/unset
```

---

## 🔒 Type Operators

The `instanceof` operator checks whether an object is an instance of a specific class or implements a particular interface. It returns `true` for the exact class, any parent class in the hierarchy, and any implemented interface — making it useful for type guards in polymorphic code.

```php
class Animal {}
class Dog extends Animal {}

$dog = new Dog();

var_dump($dog instanceof Dog);     // true
var_dump($dog instanceof Animal);  // true — via inheritance
var_dump($dog instanceof stdClass); // false
```

---

## 📋 Operator Precedence (High → Low)

| Precedence | Operators |
|------------|-----------|
| Highest | `clone`, `new` |
| | `**` |
| | `++`, `--`, `~`, `(cast)`, `@` |
| | `instanceof` |
| | `!` |
| | `*`, `/`, `%` |
| | `+`, `-`, `.` |
| | `<<`, `>>` |
| | `<`, `<=`, `>`, `>=` |
| | `==`, `!=`, `===`, `!==`, `<=>` |
| | `&` |
| | `^` |
| | `\|` |
| | `&&` |
| | `\|\|` |
| | `??` |
| | `?:` (ternary) |
| | `=`, `+=`, `-=`, etc. |
| | `yield` |
| | `print` |
| | `and` |
| | `xor` |
| Lowest | `or` |

```php
// Parentheses always override precedence
$result = 2 + 3 * 4;        // 14 (not 20)
$result = (2 + 3) * 4;      // 20

// Note: 'and'/'or' lower than '=' — use && and || !
$x = true and false;    // $x = true  (assigns first, then and)
$x = true && false;     // $x = false (correct)
```

---

## 🔇 Error Control Operator

The `@` prefix suppresses any error messages produced by the expression that follows it. **Avoid it** — it hides real problems, makes debugging extremely difficult, and has a performance cost. Use proper error handling (`try/catch`, `file_exists()` checks, etc.) instead of silencing errors.

```php
// @ suppresses errors for an expression — use sparingly!
$result = @file_get_contents("missing.txt");   // no warning
if ($result === false) {
    echo "File not found";
}

// Better practice: check before operating
if (file_exists("file.txt")) {
    $result = file_get_contents("file.txt");
}
```

> **Avoid `@`** — it hides real problems and makes debugging harder. Use proper error handling instead.

---

## ⚡ Null-Safe Operator (PHP 8+)

The null-safe operator `?->` short-circuits a method or property chain the moment any step returns `null` — returning `null` for the entire expression instead of throwing a fatal error. It eliminates cascading `if ($x !== null)` guards when traversing nested objects.

```php
class User {
    public ?Address $address;
}
class Address {
    public ?City $city;
}
class City {
    public string $name = "Paris";
}

$user = new User();
$user->address = null;

// Without null-safe: verbose null checks
$city = $user->address !== null ? $user->address->city : null;
$name = $city !== null ? $city->name : null;

// With null-safe operator (?->)
$name = $user?->address?->city?->name;
echo $name;   // null (no error!)

$user->address = new Address();
$user->address->city = new City();
echo $user?->address?->city?->name;   // Paris
```


---

[← Previous: Variables & Data Types](02-variables-and-types.md) | [Contents](README.md) | [Next: Control Flow →](04-control-flow.md)
