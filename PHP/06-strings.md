# 06: Strings

## 📝 String Basics

PHP has four string syntaxes. **Single-quoted** is literal — no variable expansion, minimal escape sequences. **Double-quoted** supports variable interpolation and escape sequences like `\n`. **Heredoc** (`<<<EOT`) is like double-quoted for multi-line blocks. **Nowdoc** (`<<<'EOT'`) is like single-quoted for multi-line blocks.

```php
<?php
// Single-quoted — no interpolation, no most escape sequences
$s1 = 'Hello, World!';
$s2 = 'It\'s a string';    // escape single quote with backslash
$s3 = 'Line 1\nLine 2';    // \n is literal two chars, NOT a newline

// Double-quoted — interpolation + escape sequences
$name = "Alice";
$s4 = "Hello, $name!";          // Hello, Alice!
$s5 = "Tab\there";              // Tab + tab char + here
$s6 = "Newline\n";              // includes newline
$s7 = "Result: {$obj->prop}";  // complex expressions need {}

// Useful escape sequences
// \n   newline
// \t   tab
// \r   carriage return
// \\   backslash
// \$   literal dollar sign
// \"   double quote
// \xHH hex character
// \uHHHH Unicode codepoint (PHP 7+)

$euro = "\u{20AC}";   // €
```

---

## 📜 Heredoc & Nowdoc

**Heredoc** (`<<<LABEL`) is ideal for multi-line strings that need variable interpolation — such as generating HTML or SQL. **Nowdoc** (`<<<'LABEL'`) produces a raw multi-line string with no interpolation. The closing label must appear on its own line, optionally followed by a semicolon.

```php
// Heredoc — like double-quoted, good for long strings
$name = "Alice";
$html = <<<HTML
    <div class="user">
        <h1>Welcome, $name!</h1>
    </div>
    HTML;

// Nowdoc — like single-quoted, NO interpolation
$raw = <<<'SQL'
    SELECT * FROM users WHERE name = '$name'
    SQL;
// $name is treated literally, not interpolated
```

---

## 📏 String Length & Access

`strlen()` returns the **byte count** of a string, not the character count for multi-byte text. For Unicode (UTF-8) strings, always use `mb_strlen()` which counts actual characters. Individual characters can be accessed like array elements with `$str[0]` using zero-based indexing.

```php
$str = "Hello";

echo strlen($str);    // 5  — byte length
echo mb_strlen($str); // 5  — character length (use with Unicode!)

// Access by index (read-only via [])
echo $str[0];    // H
echo $str[-1];   // o  (negative index, PHP 7.1+)

// Iterate characters
for ($i = 0; $i < strlen($str); $i++) {
    echo $str[$i] . " ";
}

// For Unicode, use mb_ functions
$unicode = "Héllo";
echo strlen($unicode);     // 6 (bytes)
echo mb_strlen($unicode);  // 5 (characters)
```

---

## 🔡 Case Manipulation

PHP has ASCII case functions (`strtolower`, `strtoupper`, `ucfirst`, `ucwords`) and multibyte-safe equivalents (`mb_strtolower`, `mb_strtoupper`). For any content that may contain non-ASCII characters — accented letters, Cyrillic, Arabic — always use the `mb_` variants to avoid corrupting characters.

```php
$str = "Hello World";

echo strtolower($str);      // hello world
echo strtoupper($str);      // HELLO WORLD
echo ucfirst("hello");      // Hello
echo lcfirst("Hello");      // hello
echo ucwords("hello world"); // Hello World

// Multibyte (Unicode-safe)
echo mb_strtolower("HÉLLO");  // héllo
echo mb_strtoupper("héllo");  // HÉLLO
```

---

## 🔍 Searching & Finding

`strpos()` returns the position of the first occurrence (or `false`). **Always compare with `!== false`** — not `!= false` — because position `0` is falsy. PHP 8 added `str_contains()`, `str_starts_with()`, and `str_ends_with()` for intent-expressing, boolean-returning alternatives.

```php
$str = "Hello World Hello";

// strpos — find first occurrence (returns int|false)
$pos = strpos($str, "World");   // 6
$pos = strpos($str, "xyz");     // false

// CAUTION: use === false, not == false (pos 0 == false!)
if (strpos($str, "Hello") !== false) {
    echo "Found!";
}

// str_contains — PHP 8+ (cleaner)
if (str_contains($str, "World")) {
    echo "Found World";
}

// str_starts_with / str_ends_with — PHP 8+
str_starts_with($str, "Hello");   // true
str_ends_with($str, "Hello");     // true
str_ends_with($str, "World");     // false

// strrpos — find last occurrence
strrpos($str, "Hello");   // 12

// Case-insensitive variants
stripos($str, "hello");   // 0
str_contains strtolower($str), "world");  // combine with strtolower

// substr_count — count occurrences
echo substr_count($str, "Hello");   // 2
```

---

## ✂️ Extracting & Modifying

`substr()` extracts a portion of a string by start position and optional length. `str_replace()` substitutes all occurrences of a substring. `trim()`, `ltrim()`, and `rtrim()` remove whitespace (or specified characters) from the ends — always trim before processing form input.

```php
$str = "Hello, World!";

// substr(string, start, length)
echo substr($str, 7);        // World!
echo substr($str, 7, 5);     // World
echo substr($str, -6);       // orld!  (negative = from end)
echo substr($str, 0, 5);     // Hello

// str_replace — replace all occurrences
echo str_replace("World", "PHP", $str);   // Hello, PHP!
echo str_replace(["Hello", "World"], ["Hi", "PHP"], $str); // Hi, PHP!

// Case-insensitive replace
str_ireplace("hello", "Hi", $str);

// substr_replace(string, replacement, start, length)
echo substr_replace($str, "PHP", 7, 5);   // Hello, PHP!

// String padding
echo str_pad("42", 5, "0", STR_PAD_LEFT);   // 00042
echo str_pad("hi", 10, "-", STR_PAD_BOTH);  // ----hi----

// Repeat
echo str_repeat("ab", 3);   // ababab

// Reverse
echo strrev("Hello");   // olleH

// Trim whitespace
$padded = "  Hello  ";
echo trim($padded);         // "Hello"
echo ltrim($padded);        // "Hello  "
echo rtrim($padded);        // "  Hello"
echo trim("###Hello###", "#");  // trim specific chars
```

---

## ✂️ Splitting & Joining

`explode()` splits a string into an array by a delimiter — the opposite of `implode()` which joins an array into a string. `str_split()` breaks a string into single-character elements or fixed-length chunks. These are fundamental for parsing CSV lines, URL query strings, and formatted text.

```php
// explode — split string into array
$csv = "one,two,three,four";
$parts = explode(",", $csv);        // ["one","two","three","four"]
$limited = explode(",", $csv, 3);   // ["one","two","three,four"]

// implode / join — join array into string
echo implode(", ", $parts);    // one, two, three, four
echo join(" - ", $parts);      // one - two - three - four (alias)

// str_split — split into array of characters or chunks
str_split("Hello");       // ["H","e","l","l","o"]
str_split("Hello", 2);    // ["He","ll","o"]

// chunk_split — split with delimiter (useful for Base64)
echo chunk_split(base64_encode("Hello"), 8, "\n");

// wordwrap — wrap long lines
$long = "The quick brown fox jumped over the lazy dog.";
echo wordwrap($long, 15, "\n", true);
```

---

## 🔢 String to Number & Vice‑Versa

PHP coerces strings starting with digits to numbers in arithmetic, but it is better to be explicit. `(int)` and `(float)` casts stop at the first non-numeric character. `number_format()` is essential for displaying currencies and large numbers with thousands separators and controlled decimal places.

```php
// Casting and parsing
$str = "42.5 meters";
echo (int)   $str;   // 42  — stops at non-numeric char
echo (float) $str;   // 42.5
echo intval($str);   // 42
echo floatval($str); // 42.5

// Number to string
$n = 3.14159;
echo (string) $n;           // "3.14159"
echo number_format($n, 2);  // "3.14"
echo sprintf("%.2f", $n);   // "3.14"

// Number formatting
echo number_format(1234567.891, 2, '.', ',');   // 1,234,567.89

// Numeric strings
is_numeric("42");       // true
is_numeric("3.14");     // true
is_numeric("42abc");    // false
is_numeric("0x1A");     // false (PHP 7+ changed this)
```

---

## 📐 sprintf & printf

`sprintf()` formats a string using **format specifiers** as placeholders and returns the result. `printf()` formats and prints immediately. Format specifiers control padding, alignment, decimal precision, and number base. Prefer `sprintf()` over string concatenation for complex string assembly.

```php
// sprintf — format into string
$name = "Alice";
$score = 95.5;

echo sprintf("Name: %s, Score: %.1f%%", $name, $score);
// Name: Alice, Score: 95.5%

// Format specifiers
sprintf("%d",    42);        // integer:       42
sprintf("%05d",  42);        // zero-padded:   00042
sprintf("%-10s", "left");    // left-aligned:  "left      "
sprintf("%+d",   42);        // with sign:     +42
sprintf("%e",    123456.78); // scientific:    1.234568e+5
sprintf("%b",    255);       // binary:        11111111
sprintf("%o",    8);         // octal:         10
sprintf("%x",    255);       // hex lowercase: ff
sprintf("%X",    255);       // hex uppercase: FF

// printf — format and print directly
printf("Hello, %s! You are %d years old.\n", "Bob", 30);

// sscanf — parse formatted string (reverse of sprintf)
[$year, $month, $day] = sscanf("2025-03-24", "%d-%d-%d");
```

---

## 🔡 Character Functions

`ord()` converts a character to its ASCII code; `chr()` does the reverse. `strcmp()` compares strings lexicographically (returns 0 for equal). For fuzzy matching, `levenshtein()` counts minimum edit operations between two strings, while `soundex()` and `metaphone()` group words that sound similar.

```php
// ord — character to ASCII code
echo ord('A');    // 65
echo ord('a');    // 97

// chr — ASCII code to character
echo chr(65);     // A
echo chr(10);     // newline

// String comparison
strcmp("apple", "banana");    // negative (apple < banana)
strcmp("banana", "apple");    // positive
strcmp("apple", "apple");     // 0

strcasecmp("Apple", "apple"); // 0 — case-insensitive

// Similarity
similar_text("Hello", "World", $percent);
echo round($percent, 1);    // 20.0

levenshtein("kitten", "sitting");    // 3 (edit distance)
soundex("Robert");   // R163
metaphone("Smith");  // SM0
```

---

## 🔐 Hashing & Encoding

**Never use `md5()` or `sha1()` for passwords** — they are cryptographic hash functions designed to be fast, making them trivially brute-forceable. Use `password_hash()` with `PASSWORD_ARGON2ID` or `PASSWORD_BCRYPT`. `base64_encode/decode` transfers binary data as text. `htmlspecialchars()` is the primary XSS prevention tool.

```php
// Common hash functions
echo md5("hello");          // 5d41402abc4b2a76b9719d911017c592
echo sha1("hello");         // aaf4c61ddcc5e8a2dabede0f3b482cd9aea9434d
echo hash("sha256", "hello"); // longer, more secure

// Password hashing (the RIGHT way)
$hash = password_hash("secret123", PASSWORD_BCRYPT);
$hash = password_hash("secret123", PASSWORD_ARGON2ID); // PHP 7.3+

password_verify("secret123", $hash);  // true
password_verify("wrong",     $hash);  // false

// Base64
$encoded = base64_encode("Hello World");   // SGVsbG8gV29ybGQ=
$decoded = base64_decode("SGVsbG8gV29ybGQ=");  // Hello World

// URL encode/decode
echo urlencode("hello world!");      // hello+world%21
echo urldecode("hello+world%21");    // hello world!
echo rawurlencode("hello world!");   // hello%20world%21
echo rawurldecode("hello%20world%21"); // hello world!

// HTML encode/decode (XSS prevention)
echo htmlspecialchars("<script>alert('xss')</script>");
// &lt;script&gt;alert(&#039;xss&#039;)&lt;/script&gt;

echo htmlspecialchars_decode("&lt;b&gt;");   // <b>
echo htmlentities("<café>");  // converts all special chars
```

---

## 🔤 Multibyte Strings (UTF-8)

Standard PHP string functions operate on **bytes**, not characters. A single UTF-8 character can occupy 2–4 bytes, so `strlen()` may return a larger number than the visible character count. For strings with non-ASCII content, always use the `mb_` family of functions. Call `mb_internal_encoding('UTF-8')` at startup for consistent behaviour.

```php
// Always use mb_ functions for non-ASCII text
$str = "Héllo Wörld";

echo mb_strlen($str);                // 11 (chars, not bytes)
echo mb_substr($str, 6, 5);          // Wörld
echo mb_strtoupper($str);           // HÉLLO WÖRLD
echo mb_strpos($str, "ö");           // 7
echo mb_convert_encoding($str, "ISO-8859-1", "UTF-8");

// Set default encoding
mb_internal_encoding("UTF-8");
mb_language("Neutral");

// Detect encoding
$enc = mb_detect_encoding($str, ["UTF-8", "ISO-8859-1", "ASCII"]);
```

---

## 📋 String Functions Quick Reference

| Function | Purpose |
|----------|---------|
| `strlen()` | Byte length |
| `mb_strlen()` | Character length (Unicode) |
| `strtolower/upper()` | Change case |
| `str_contains()` | Check substring (PHP 8+) |
| `str_starts_with()` | Check prefix (PHP 8+) |
| `str_ends_with()` | Check suffix (PHP 8+) |
| `strpos()` | Find first position |
| `str_replace()` | Replace occurrences |
| `substr()` | Extract substring |
| `trim()` | Remove whitespace |
| `explode()` | String → array |
| `implode()` | Array → string |
| `sprintf()` | Format string |
| `htmlspecialchars()` | HTML-encode (XSS prevention) |
| `nl2br()` | Newlines → `<br>` |
| `strip_tags()` | Remove HTML tags |
| `number_format()` | Format numbers |
| `hash()` | Hash a string |
| `password_hash()` | Secure password hash |


---

[← Previous: Functions](05-functions.md) | [Contents](README.md) | [Next: Arrays →](07-arrays.md)
