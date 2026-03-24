# 04: Control Flow

## 🔀 if / elseif / else

The `if` statement executes a block when its condition is `true`. `elseif` adds additional conditions and `else` is the fallback. PHP also supports an **alternative syntax** (`if (...): ... endif;`) designed for embedding conditional logic cleanly inside HTML templates.

```php
<?php
$age = 25;

if ($age < 13) {
    echo "Child";
} elseif ($age < 18) {
    echo "Teenager";
} elseif ($age < 65) {
    echo "Adult";
} else {
    echo "Senior";
}

// Single-statement (no braces) — allowed but use with care
if ($age >= 18) echo "Adult";

// Alternative syntax (useful in HTML templates)
if ($age >= 18): ?>
    <p>Welcome, adult.</p>
<?php else: ?>
    <p>Access denied.</p>
<?php endif; ?>
```

---

## 🔄 Switch

`switch` compares one variable against many possible values using **loose `==` comparison**. Each `case` block must end with `break` to stop **fall-through** (running into the next case). For strict comparison and cleaner syntax, prefer the `match` expression (PHP 8+).

```php
$day = "Monday";

switch ($day) {
    case "Monday":
    case "Tuesday":
    case "Wednesday":
    case "Thursday":
    case "Friday":
        echo "Weekday";
        break;   // ← required to prevent fall-through
    case "Saturday":
    case "Sunday":
        echo "Weekend";
        break;
    default:
        echo "Invalid day";
}

// switch uses loose comparison (==)
switch ("0") {
    case false: echo "matches!"; break;  // true — "0" == false
}
// Use match for strict comparison
```

---

## 🎯 Match Expression (PHP 8+)

`match` is PHP 8's modern replacement for `switch`. It uses **strict `===` comparison**, every arm returns a value (it is an expression), there is no fall-through between arms, and it throws `UnhandledMatchError` if no arm matches — making it both exhaustive and type-safe.

```php
$status = 2;

$label = match($status) {
    1       => "Active",
    2, 3    => "Pending",        // multiple values per arm
    4       => "Inactive",
    default => "Unknown",
};

echo $label;   // Pending

// Differences from switch:
// - Uses strict (===) comparison — no type coercion
// - Returns a value (it's an expression)
// - No fall-through, no break needed
// - UnhandledMatchError if no arm matches (unlike switch)

$val = match(true) {
    $age < 13  => "Child",
    $age < 18  => "Teen",
    $age < 65  => "Adult",
    default    => "Senior",
};
```

---

## 🔁 while Loop

`while` repeats a block as long as its condition is `true`, checking the condition **before** each iteration. `do...while` is the same but checks **after** — guaranteeing the body runs at least once. Use `while` when you don't know in advance how many iterations are needed.

```php
$i = 1;

while ($i <= 5) {
    echo $i . "\n";
    $i++;
}
// 1 2 3 4 5

// do…while — executes body at least once
$n = 10;

do {
    echo $n . "\n";
    $n++;
} while ($n <= 5);
// prints 10 once, condition is checked after
```

---

## 🔃 for Loop

`for` is used when you know exactly how many iterations are needed. It has three parts in the header: **initializer** (runs once before the loop), **condition** (checked before each iteration), and **increment** (runs after each iteration). All three are optional — omitting all three creates an infinite loop.

```php
for ($i = 0; $i < 5; $i++) {
    echo $i . "\n";   // 0 1 2 3 4
}

// Multiple vars
for ($i = 0, $j = 10; $i < $j; $i++, $j--) {
    echo "$i - $j\n";
}

// Empty parts — infinite loop with manual break
for (;;) {
    if (someCondition()) break;
}
```

---

## 🔄 foreach Loop

`foreach` is the standard loop for iterating over arrays and objects in PHP. It automatically advances through every element without managing an index counter. To **modify** elements in-place, use a reference `&$value` — but always `unset($value)` after the loop to break the reference binding and prevent unexpected side effects.

```php
// Indexed array
$fruits = ["apple", "banana", "cherry"];

foreach ($fruits as $fruit) {
    echo $fruit . "\n";
}

// With index
foreach ($fruits as $index => $fruit) {
    echo "$index: $fruit\n";
}

// Associative array
$person = ["name" => "Alice", "age" => 30];

foreach ($person as $key => $value) {
    echo "$key = $value\n";
}

// Modify with reference
$prices = [10, 20, 30];
foreach ($prices as &$price) {
    $price *= 1.1;   // apply 10% markup
}
unset($price);   // ← always unset reference after loop!

// Nested foreach
$matrix = [[1, 2], [3, 4], [5, 6]];
foreach ($matrix as $row) {
    foreach ($row as $cell) {
        echo $cell . " ";
    }
    echo "\n";
}
```

---

## ⏭️ break & continue

`break` immediately exits the enclosing loop. `continue` skips the remainder of the current iteration and jumps to the next. Both accept an optional integer argument to act on **multiple nesting levels** at once (e.g. `break 2` exits two nested loops simultaneously).

```php
// break — exits the innermost loop
for ($i = 0; $i < 10; $i++) {
    if ($i === 5) break;
    echo $i . " ";   // 0 1 2 3 4
}

// break with level — exits N levels of nested loops
for ($i = 0; $i < 3; $i++) {
    for ($j = 0; $j < 3; $j++) {
        if ($j === 1) break 2;   // exits both loops
        echo "$i,$j ";
    }
}

// continue — skips to next iteration
for ($i = 0; $i < 6; $i++) {
    if ($i % 2 === 0) continue;
    echo $i . " ";   // 1 3 5 (odd numbers only)
}

// continue with level
for ($i = 0; $i < 3; $i++) {
    for ($j = 0; $j < 3; $j++) {
        if ($j === 1) continue 2;  // jumps to next outer iteration
        echo "$i,$j ";
    }
}
```

---

## 🔁 Nested & Complex Loops

Loops can be nested inside each other to traverse multi-dimensional data or generate combinations. Deeply nested loops often signal that inner logic should be extracted into a separate function to keep code readable and testable.

```php
// Find primes 2–20
for ($n = 2; $n <= 20; $n++) {
    $isPrime = true;
    for ($d = 2; $d <= sqrt($n); $d++) {
        if ($n % $d === 0) {
            $isPrime = false;
            break;
        }
    }
    if ($isPrime) echo "$n ";
}
// 2 3 5 7 11 13 17 19
```

---

## 🎯 Conditional Expressions

PHP supports **expression-based** conditionals that produce a value directly, making them usable inside assignments. The ternary `? :`, null-coalescing `??`, and `match` are expressions (they return a value), while `if/else` is a statement. PHP 8 also added `match` as a concise replacement for multiline ternary chains.

```php
// Ternary
$score = 72;
$grade = $score >= 90 ? "A"
       : ($score >= 80 ? "B"
       : ($score >= 70 ? "C" : "F"));

echo $grade;  // C

// Null coalescing
$username = $_GET['name'] ?? "Guest";

// match (PHP 8+) as expression
$http = 404;
$message = match($http) {
    200, 201 => "Success",
    301, 302 => "Redirect",
    403      => "Forbidden",
    404      => "Not Found",
    500      => "Server Error",
    default  => "Unknown",
};
```

---

## 🔚 return, exit & die

`return` exits the current function and optionally passes a value back to the caller. `exit` (alias `die`) **terminates the entire PHP script** immediately — use it sparingly, mainly for unrecoverable startup failures. `exit` accepts either a numeric exit code (for CLI tools) or a message string to output before halting.

```php
function calculate($x) {
    if ($x < 0) {
        return false;   // early return
    }
    return sqrt($x);
}

// exit / die — terminate script immediately
if (!file_exists("config.php")) {
    die("Config file missing!");   // same as exit()
}

exit(0);    // exit with status code (0 = success)
exit("Goodbye!");  // or with a message

// die() is an alias of exit()
```

---

## 🗂️ Declare Statement

`declare()` sets **execution directives** for a code block or an entire file. `strict_types=1` is by far the most important use — it enforces function argument type checking. `ticks` is used for low-level signal handling and profiling. All directives must appear before any executable code (ideally as the very first line).

```php
<?php
// declare() controls runtime behavior for a block or file

// Strict types — must be at top of file
declare(strict_types=1);

// Ticks — execute a function every N statements (rare)
declare(ticks=1);
register_tick_function(function() { /* ... */ });

// Encoding — specify character encoding (legacy use)
declare(encoding='UTF-8');
```

---

## 📋 Control Flow Summary

| Structure | Use case |
|-----------|----------|
| `if/elseif/else` | Branching on conditions |
| `switch` | Multiple values of one variable (loose ==) |
| `match` | Like switch, strict ===, returns value (PHP 8+) |
| `while` | Loop while condition is true |
| `do…while` | Execute at least once, then check |
| `for` | Loop with counter |
| `foreach` | Iterate arrays/iterables |
| `break` | Exit loop |
| `continue` | Skip to next iteration |
| `return` | Exit function (with optional value) |
| `exit`/`die` | Terminate script |


---

[← Previous: Operators](03-operators.md) | [Contents](README.md) | [Next: Functions →](05-functions.md)
