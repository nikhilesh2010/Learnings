# PHP Learning Path

Master PHP from core syntax to modern OOP, databases, security, and professional web development.

## 📚 Table of Contents

### **Fundamentals**
1. [Introduction to PHP](01-introduction.md)
2. [Variables & Data Types](02-variables-and-types.md)
3. [Operators](03-operators.md)
4. [Control Flow](04-control-flow.md)
5. [Functions](05-functions.md)

### **Core Language**
6. [Strings](06-strings.md)
7. [Arrays](07-arrays.md)
8. [Object-Oriented Programming](08-oop.md)
9. [Interfaces, Abstract Classes & Traits](09-interfaces-and-traits.md)
10. [Error & Exception Handling](10-error-handling.md)

### **Web Development**
11. [File I/O](11-file-io.md)
12. [Forms & User Input](12-forms-and-input.md)
13. [Sessions & Cookies](13-sessions-and-cookies.md)
14. [Database (PDO & MySQLi)](14-database.md)

### **Ecosystem & Architecture**
15. [Composer & Packages](15-composer-and-packages.md)
16. [Namespaces & Autoloading](16-namespaces-and-autoloading.md)

### **Standard Library**
17. [Regular Expressions](17-regex.md)
18. [Date & Time](18-date-and-time.md)
19. [JSON & REST APIs](19-json-and-apis.md)
20. [HTTP, Headers & Redirects](20-http-and-headers.md)

### **Production Topics**
21. [Security](21-security.md)
22. [Testing (PHPUnit)](22-testing.md)
23. [Modern PHP (PHP 8+)](23-modern-php.md)

### **Best Practices**
24. [Best Practices & Clean Code](24-best-practices.md)
25. [Debugging & Profiling](25-debugging.md)

---

## Prerequisites

- PHP 8.1+ installed ([php.net/downloads](https://www.php.net/downloads))
- A web server (Apache/Nginx) or PHP's built-in server
- Basic HTML knowledge
- Familiarity with the command line

---

## 🚀 Quick Start

```bash
# Check version
php --version

# Start built-in web server
php -S localhost:8000

# Run a script directly
php script.php

# Open REPL
php -a
```

```php
<?php
// Your first PHP file: index.php
echo "Hello, World!";
?>
```

---

## 🔑 Key PHP Facts

| Feature | Detail |
|---------|--------|
| **Created by** | Rasmus Lerdorf, 1994 |
| **Current version** | PHP 8.3 (2023) |
| **Runs on** | Apache, Nginx, CLI, built-in server |
| **Typing** | Dynamically typed, optional strict types |
| **Paradigms** | Procedural, Object-Oriented, Functional |
| **Primary use** | Server-side web development |
| **Powers** | WordPress, Laravel, Symfony, Drupal |

---

## 🏗️ How PHP Fits in the Web Stack

```
Browser  →  HTTP Request  →  Web Server (Apache/Nginx)
                                    ↓
                             PHP Interpreter
                                    ↓
                         PHP executes & builds HTML
                                    ↓
              Web Server  →  HTTP Response  →  Browser
```

---

## 📖 Learning Tips

- Code every example — PHP is learned by doing
- Always use `strict_types=1` for new projects
- Practice with real HTML forms and a local database
- Learn Laravel after mastering core PHP

---

*All examples target PHP 8.1+ unless noted otherwise.*
