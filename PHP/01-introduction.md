# 01: Introduction to PHP

## 🚀 What is PHP?

**PHP** (PHP: Hypertext Preprocessor) is a widely-used, open-source, server-side scripting language designed for web development. Created by Rasmus Lerdorf in 1994, PHP runs on the server and generates HTML that is sent to the browser.

| Feature | Detail |
|---------|--------|
| **Created by** | Rasmus Lerdorf, 1994 |
| **Current version** | PHP 8.3 (2023) |
| **License** | PHP License (open source) |
| **Typing** | Dynamically typed; supports strict types |
| **Paradigms** | Procedural, Object-Oriented, Functional |
| **Extension** | `.php` |
| **Powers** | ~79% of all websites (WordPress, Laravel, Facebook origins) |

---

## 🌐 Where Does PHP Run?

PHP runs **exclusively on the server**. When a browser requests a `.php` page, the web server passes it to the PHP interpreter, which executes the code and sends back only the output (HTML, JSON, etc.). The PHP source code is **never** exposed to the browser.

```
Browser  →  HTTP Request  →  Web Server (Apache / Nginx)
                                     ↓
                              PHP Interpreter
                              (reads .php files)
                                     ↓
                           Executes PHP → Builds HTML
                                     ↓
              Web Server  →  HTTP Response  →  Browser renders HTML
```

> PHP code is **never sent to the browser** — only its output (HTML, JSON, etc.) is.

---

## ⚙️ How PHP is Executed

The **Zend Engine** is PHP's core runtime. Your `.php` source file is tokenized, parsed into an Abstract Syntax Tree (AST), and compiled to OPcodes (bytecode). **OPcache** stores the compiled bytecode in memory so subsequent requests skip the compile step — a major performance improvement in production.

```
Source (.php)
    ↓
Zend Engine tokenizes & parses → AST
    ↓
Compiled to Zend OPcodes (bytecode)
    ↓
OPcache stores bytecode (skip recompile on repeat requests)
    ↓
Executed → Output sent to browser
```

---

## 📝 Your First PHP File

Any file with a `.php` extension is processed by PHP. Code goes between `<?php` tags. The `echo` keyword outputs text to the HTTP response. Save the file, start the built-in server with `php -S localhost:8000`, and open it in a browser — or run directly in the terminal with `php hello.php`.

```php
<?php
// hello.php
echo "Hello, World!";
?>
```

**Run it:**
```bash
# Via built-in server
php -S localhost:8000
# Visit http://localhost:8000/hello.php

# Or run directly in terminal
php hello.php
```

---

## 🔖 PHP Tags

PHP code must be wrapped in recognised opening tags so the interpreter knows what to execute. **Always use `<?php`**. The short echo tag `<?=` is shorthand for `<?php echo`. When a file contains **only PHP** (no HTML), omit the closing `?>` to prevent accidental whitespace from being output before HTTP headers.

```php
<?php
  // Standard opening tag — always use this
  echo "Standard";
?>

<?= "Short echo tag — outputs a value directly" ?>

<?php
  // Closing ?> is optional when the file is pure PHP
  // Omitting it prevents accidental whitespace output
  echo "Best practice: omit closing tag in pure-PHP files";
```

> **Rule:** Always use `<?php`. Never use the short `<?` tag (disabled on many servers).

---

## 📋 Basic Syntax Rules

PHP syntax is inspired by C and Perl. Unlike Python, **whitespace is not significant** — blocks use curly braces `{}`. Every statement must end with a semicolon `;`. Variable names are **case-sensitive** but function names and keywords are not. Comments use `//`, `#`, or `/* ... */`.

```php
<?php
// 1. Statements end with a semicolon
echo "Hello";
$x = 5;

// 2. Variables start with $
$name = "Alice";
$age  = 30;

// 3. PHP is case-insensitive for keywords and functions, but NOT variables
ECHO "hello";      // valid
echo "hello";      // valid
$Name = "Alice";   // different variable from $name!

// 4. Comments
// Single-line comment
# Also single-line (shell style)
/* Multi-line
   comment */

// 5. String concatenation uses dot (.)
$greeting = "Hello, " . $name . "!";
echo $greeting;   // Hello, Alice!

// 6. echo vs print
echo "Fast output";        // can take multiple args: echo "a", "b";
print "Returns 1";         // single arg, returns 1
```

---

## 🏗️ PHP in HTML

PHP can be embedded directly into HTML:

```php
<!DOCTYPE html>
<html>
<body>

<?php $user = "Alice"; ?>

<h1>Welcome, <?= $user ?>!</h1>

<?php if ($user === "Alice"): ?>
  <p>You have admin access.</p>
<?php else: ?>
  <p>Standard user.</p>
<?php endif; ?>

</body>
</html>
```

> This **mixed mode** (PHP + HTML) is common in templates. For larger apps, separate PHP logic from HTML using templates or a framework.

---

## 🎯 PHP Use Cases

PHP is a **general-purpose web language** powering ~79% of all websites. It runs WordPress, Drupal, and Magento, and is the backbone of frameworks like Laravel and Symfony. Beyond traditional web pages, PHP is used for REST APIs, CLI tools, CMS platforms, and real-time applications.

```
┌──────────────────────────────────────────────────────┐
│                   PHP Ecosystem                      │
├──────────────────┬───────────────────────────────────┤
│  Web Development │  Laravel, Symfony, CodeIgniter    │
│  CMS             │  WordPress, Drupal, Joomla        │
│  E-Commerce      │  Magento, WooCommerce, OpenCart   │
│  APIs            │  RESTful APIs, GraphQL            │
│  CLI Scripts     │  php script.php, Symfony Console  │
│  Real-time       │  Ratchet (WebSockets)             │
└──────────────────┴───────────────────────────────────┘
```

---

## ⚙️ Installation & Setup

### Windows
```bash
# Option 1: XAMPP (Apache + MySQL + PHP) — easiest
# Download from https://www.apachefriends.org/

# Option 2: Standalone PHP
# Download from https://windows.php.net/download/
# Add PHP folder to system PATH

php --version
# PHP 8.3.x ...
```

### macOS
```bash
# Homebrew
brew install php

php --version
```

### Linux (Ubuntu/Debian)
```bash
sudo apt update
sudo apt install php php-cli php-mysql php-xml php-mbstring

php --version
```

---

## 🖥️ Development Setup

### Built-in Server (no Apache/Nginx needed)
```bash
# Serve current directory
php -S localhost:8000

# Serve a specific directory
php -S localhost:8000 -t public/

# Use a router script
php -S localhost:8000 router.php
```

### php.ini — Main Configuration File
```bash
# Find your php.ini location
php --ini

# Common settings to check/change
display_errors = On          ; show errors in dev
error_reporting = E_ALL      ; report all errors
max_execution_time = 30      ; seconds
memory_limit = 256M
upload_max_filesize = 10M
post_max_size = 12M
```

---

## 🔒 Strict Types Mode

By default PHP performs **type juggling** — silently coercing values to match expected parameter types (e.g. passing `"42"` where an `int` is expected works without error). Adding `declare(strict_types=1)` as the very first line of a file disables this coercion, making PHP throw a `TypeError` instead. This is a best practice that surfaces type bugs immediately.

```php
<?php
declare(strict_types=1);  // Must be first line of file

// Without strict_types, PHP coerces types silently:
// add(1, "2") → 3   (silently converts "2" to 2)

// With strict_types=1:
// add(1, "2") → TypeError — "2" is not an int

function add(int $a, int $b): int {
    return $a + $b;
}

echo add(3, 4);    // 7
echo add(3, "4");  // TypeError in strict mode
```

> **Always use `declare(strict_types=1)`** in new projects — it prevents subtle type-coercion bugs.

---

## 📊 PHP vs Other Server-Side Languages

| Feature | PHP | Python (Django) | Node.js | Ruby (Rails) |
|---------|-----|-----------------|---------|--------------|
| **Hosting** | Universal | Specialized | Universal | Specialized |
| **Learning curve** | Low | Medium | Medium | Medium |
| **Performance** | Good (OPcache) | Good | Excellent | Good |
| **Ecosystem** | Huge (Packagist) | Huge (PyPI) | Huge (npm) | Medium |
| **Async** | Limited | Full async | Native async | Limited |
| **Best for** | CMS, CRUD web apps | Data/AI/APIs | Real-time, APIs | Rapid prototyping |

---

## 🔑 Key Takeaways

- PHP runs **server-side** — browsers only see its HTML/JSON output
- Every PHP statement ends with a **semicolon**
- Variables always start with `$`
- Use `declare(strict_types=1)` in every file
- PHP 8.x brought major improvements: JIT, named args, enums, fibers
- The built-in web server (`php -S`) is perfect for local development


---

[Contents](README.md) | [Next: Variables & Data Types →](02-variables-and-types.md)
