# 17: Regular Expressions

## 🔍 What Are Regular Expressions?

A **regular expression (regex)** is a pattern used to match, search, and manipulate strings. PHP uses **PCRE** (Perl-Compatible Regular Expressions).

All PHP regex functions use the pattern format: `'/pattern/flags'`

---

## 📐 Pattern Syntax

### Literal Characters & Dot
```
/hello/     matches "hello" anywhere in string
/Hello/i    matches "hello" case-insensitively
/./         matches any single character except newline
/\./        matches literal dot (escaped)
```

### Character Classes `[]`
```
/[abc]/     a, b, or c
/[^abc]/    any char EXCEPT a, b, c
/[a-z]/     lowercase letter
/[A-Z]/     uppercase letter
/[0-9]/     digit (same as \d)
/[a-zA-Z0-9_]/  word char (same as \w)
```

### Shorthand Classes
```
\d    digit [0-9]
\D    non-digit
\w    word char [a-zA-Z0-9_]
\W    non-word char
\s    whitespace (space, tab, newline)
\S    non-whitespace
\b    word boundary (position)
\B    non-word boundary
```

### Anchors
```
^     start of string (or line with m flag)
$     end of string (or line with m flag)
\A    absolute start of string
\Z    absolute end of string
```

### Quantifiers
```
*       0 or more
+       1 or more
?       0 or 1 (also makes quantifier lazy)
{n}     exactly n
{n,}    n or more
{n,m}   between n and m

*?      lazy (as few as possible)
+?      lazy
{n,m}?  lazy
```

### Groups & Alternation
```
(abc)      capturing group
(?:abc)    non-capturing group
(?P<name>abc) named capturing group
a|b        a or b
```

---

## 🔧 PHP Regex Functions

PHP uses the **PCRE** (Perl Compatible Regular Expressions) library. `preg_match()` finds the first match; `preg_match_all()` finds all matches. `preg_replace()` substitutes matches with a string. `preg_split()` splits a string on a pattern. `preg_grep()` filters an array, keeping only elements matching a pattern.

```php
<?php
$str = "The quick brown fox jumped over 3 lazy dogs.";

// preg_match — find first match (returns 1=found, 0=not found)
$found = preg_match('/(\d+)/', $str, $matches);
// $found   = 1
// $matches = ["3", "3"]  [0=full match, 1=group 1]

// preg_match_all — find all matches
$count = preg_match_all('/\b\w{4}\b/', $str, $matches);
// $matches[0] = ["quick", "over", "lazy", "dogs"]

// preg_replace — replace matches
$result = preg_replace('/\d+/', '##', $str);
// "The quick brown fox jumped over ## lazy dogs."

// preg_replace_callback — replace with function
$result = preg_replace_callback('/\b\w+\b/', function($m) {
    return strtoupper($m[0]);
}, "hello world");
// "HELLO WORLD"

// preg_split — split string by pattern
$words = preg_split('/\s+/', "Hello   World\tFoo");
// ["Hello", "World", "Foo"]

// preg_grep — filter array by pattern
$lines = ["Error: timeout", "Info: started", "Error: crash"];
$errors = preg_grep('/^Error:/', $lines);
// [0 => "Error: timeout", 2 => "Error: crash"]
```

---

## 🎯 Captures & Named Groups

**Capturing groups** `()` extract portions of the match into a `$matches` array. `$matches[0]` is always the full match; numbered groups start at `$matches[1]`. **Named groups** `(?P<name>...)` let you access captures by a descriptive name (e.g. `$m['year']`) rather than a positional index, making patterns far more readable.

```php
// Indexed groups
$date = "2025-03-24";
preg_match('/(\d{4})-(\d{2})-(\d{2})/', $date, $m);
// $m[0] = "2025-03-24" (full match)
// $m[1] = "2025"
// $m[2] = "03"
// $m[3] = "24"

// Named groups (?P<name>...)
preg_match('/(?P<year>\d{4})-(?P<month>\d{2})-(?P<day>\d{2})/', $date, $m);
echo $m['year'];   // 2025
echo $m['month'];  // 03
echo $m['day'];    // 24

// All matches with named groups
$text = "Mon 2025-01-06, Tue 2025-01-07, Wed 2025-01-08";
preg_match_all('/(?P<date>\d{4}-\d{2}-\d{2})/', $text, $m);
print_r($m['date']);
// ["2025-01-06", "2025-01-07", "2025-01-08"]
```

---

## 🔄 Replace with Callback

`preg_replace_callback()` is the most powerful replacement function — instead of a literal replacement string, you pass a callable that receives the match array and returns the replacement. This lets you perform arbitrary logic on each match (math, database lookups, formatting transformations).

```php
// Double all numbers in a string
$result = preg_replace_callback('/\d+(\.\d+)?/', function($m) {
    return (float)$m[0] * 2;
}, "Price: 19.99, Qty: 3");
// "Price: 39.98, Qty: 6"

// Named group in callback
$text = "John Smith, Jane Doe";
$result = preg_replace_callback(
    '/(?P<first>\w+)\s+(?P<last>\w+)/',
    fn($m) => $m['last'] . ', ' . $m['first'],
    $text
);
// "Smith, John, Doe, Jane"

// preg_replace with backreferences
$html = '<b>bold</b> and <i>italic</i>';
$result = preg_replace('/<(\w+)>(.*?)<\/\1>/', '[$1: $2]', $html);
// "[b: bold] and [i: italic]"
```

---

## 🚩 Flags (Modifiers)

Flags are appended after the closing delimiter (e.g. `/pattern/i`) to change matching behaviour. `i` makes the pattern case-insensitive. `m` makes `^` and `$` match line starts/ends instead of string start/end. `s` makes `.` match newlines. `u` enables Unicode mode for correct handling of multi-byte characters.

```
i    case-insensitive
m    multiline (^ and $ match start/end of each line)
s    dot-all (. matches newline too)
x    extended (allow whitespace and comments in pattern)
u    unicode mode (treat pattern as UTF-8)
```

```php
// Case-insensitive
preg_match('/hello/i', 'HELLO World');   // 1

// Multiline
$text = "line1\nline2\nline3";
preg_match_all('/^\w+/m', $text, $m);   // ["line1","line2","line3"]

// Dot-all (s flag)
preg_match('/start(.*)end/s', "start\nmiddle\nend", $m);  // matches!

// Extended (readable patterns)
$pattern = '/
    ^               # start of string
    (\+\d{1,3})?    # optional country code
    [\s\-]?         # optional separator
    \(?\d{3}\)?     # area code
    [\s\-]?         # separator
    \d{3}           # prefix
    [\s\-]?         # separator
    \d{4}           # line number
    $               # end of string
/x';

// Unicode
preg_match('/\p{L}+/u', "Héllo");   // matches Unicode letters
```

---

## 🔒 Common Validation Patterns

Regex is commonly used for input validation. Always prefer PHP's `filter_var()` for email and URL validation (it uses RFCs) over hand-rolled patterns. Use regex for custom formats like slugs, dates, phone numbers, and passwords. Note that no regex can fully validate an email address — sending a verification link is the only reliable method.

```php
// Email (basic — use filter_var for best results)
$emailPattern = '/^[a-zA-Z0-9._%+\-]+@[a-zA-Z0-9.\-]+\.[a-zA-Z]{2,}$/';

// URL
$urlPattern = '/^https?:\/\/([\w\-]+\.)+[\w\-]+(\/[\w\-._~:/?#\[\]@!$&\'()*+,;=%]*)?$/i';

// Phone (international)
$phonePattern = '/^\+?[\d\s\-().]{7,20}$/';

// Date YYYY-MM-DD
$datePattern = '/^\d{4}-(0[1-9]|1[0-2])-(0[1-9]|[12]\d|3[01])$/';

// IP address (v4)
$ipv4Pattern = '/^(\d{1,3}\.){3}\d{1,3}$/';

// Username: 3-20 chars, letters/numbers/underscore
$usernamePattern = '/^[a-zA-Z0-9_]{3,20}$/';

// Password (min 8 chars, 1 upper, 1 lower, 1 digit, 1 special)
$passwordPattern = '/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/';

// Hex color
$hexColorPattern = '/^#([a-fA-F0-9]{6}|[a-fA-F0-9]{3})$/';

// Slug
$slugPattern = '/^[a-z0-9]+(?:-[a-z0-9]+)*$/';

// IPv6 (simplified)
$ipv6Pattern = '/^([0-9a-fA-F]{0,4}:){2,7}[0-9a-fA-F]{0,4}$/';

// Usage
function validateEmail(string $email): bool {
    return (bool) preg_match(
        '/^[a-zA-Z0-9._%+\-]+@[a-zA-Z0-9.\-]+\.[a-zA-Z]{2,}$/',
        $email
    );
}
```

---

## 🛡️ Security: Escaping User Input

**Never** embed raw user input in a regex pattern — an attacker can insert special characters that change the pattern's meaning or trigger **ReDoS** (Regular Expression Denial of Service) with catastrophic backtracking. Always escape user-supplied strings with `preg_quote()` before including them in a pattern.

```php
// When building regex from user input, always escape it
$userInput = "price (USD)";
$safe      = preg_quote($userInput, '/');  // "price \(USD\)"

$result = preg_match("/$safe/i", "Our price (USD) is 9.99");

// Example: search-and-highlight
function highlight(string $text, string $search): string {
    $safe = preg_quote($search, '/');
    return preg_replace("/($safe)/i", '<mark>$1</mark>', $text);
}

echo highlight("Hello World", "world");
// "Hello <mark>World</mark>"
```

---

## 📋 Regex Quick Reference

| Pattern | Matches |
|---------|---------|
| `\d+` | One or more digits |
| `\w+` | One or more word chars |
| `\s+` | One or more whitespace |
| `[a-z]+` | One or more lowercase letters |
| `[^<>]+` | Anything except `<` and `>` |
| `\d{4}-\d{2}-\d{2}` | Date format YYYY-MM-DD |
| `\b\w+\b` | Whole word |
| `^foo` | Starts with "foo" |
| `bar$` | Ends with "bar" |
| `(foo\|bar)` | "foo" or "bar" |
| `foo(?=bar)` | "foo" followed by "bar" (lookahead) |
| `foo(?!bar)` | "foo" NOT followed by "bar" |
| `(?<=foo)bar` | "bar" preceded by "foo" (lookbehind) |


---

[← Previous: Namespaces & Autoloading](16-namespaces-and-autoloading.md) | [Contents](README.md) | [Next: Date & Time →](18-date-and-time.md)
