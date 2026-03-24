# 12: Forms & User Input

## 📋 HTML Forms & PHP

HTML forms are the primary way users submit data to a PHP server. A form's `action` attribute specifies the PHP script to run; `method="post"` sends data in the request body (use for creating/modifying data), `method="get"` appends data to the URL (use for searches and filters). PHP accesses submitted values through the `$_POST` and `$_GET` superglobals.

```php
<!-- form.html -->
<form action="process.php" method="post">
    <input type="text"     name="username" placeholder="Username">
    <input type="email"    name="email"    placeholder="Email">
    <input type="password" name="password" placeholder="Password">
    <input type="number"   name="age"      min="1" max="120">
    <select name="role">
        <option value="user">User</option>
        <option value="admin">Admin</option>
    </select>
    <input type="checkbox" name="agree" value="1">
    <input type="submit"   value="Submit">
</form>
```

```php
<?php
// process.php
declare(strict_types=1);

// $_POST — data from POST requests (forms, APIs)
// $_GET  — data from URL query string
// $_REQUEST — combined GET + POST + COOKIE (avoid — ambiguous)

// Reading POST data
$username = $_POST['username'] ?? '';
$email    = $_POST['email']    ?? '';
$age      = $_POST['age']      ?? null;
$agreed   = isset($_POST['agree']) && $_POST['agree'] === '1';
```

---

## 🔍 Superglobals Overview

**Superglobals** are built-in PHP arrays that are automatically available in every scope without `global`. Each one captures a different input source. Use specific superglobals (`$_POST`, `$_GET`) rather than the ambiguous `$_REQUEST`. Never trust data from superglobals — always validate and sanitize before use.

```php
$_GET       // URL query parameters: ?name=Alice&page=2
$_POST      // HTTP POST body (forms, application/json via body)
$_FILES     // Uploaded files
$_COOKIE    // HTTP cookies
$_SESSION   // Session data (after session_start())
$_SERVER    // Server & execution environment info
$_ENV       // Environment variables
$_GLOBALS   // All global variables
```

### `$_SERVER` Useful Keys

```php
$_SERVER['REQUEST_METHOD'];   // "GET", "POST", "PUT", etc.
$_SERVER['REQUEST_URI'];      // /path?query=1
$_SERVER['HTTP_HOST'];        // example.com
$_SERVER['HTTP_REFERER'];     // referring URL (spoofable)
$_SERVER['HTTP_USER_AGENT'];  // browser/client string
$_SERVER['REMOTE_ADDR'];      // client IP address
$_SERVER['HTTPS'];            // "on" if HTTPS
$_SERVER['PHP_SELF'];         // current script path (/form.php)
$_SERVER['SCRIPT_FILENAME'];  // full filesystem path
```

---

## 🛡️ Input Validation

**Never trust user input.** Always validate before use.

```php
declare(strict_types=1);

// ✅ Check request method
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    die("Method Not Allowed");
}

$errors = [];

// Username: required, 3-20 chars, alphanumeric + underscore
$username = trim($_POST['username'] ?? '');
if ($username === '') {
    $errors['username'] = "Username is required.";
} elseif (!preg_match('/^[a-zA-Z0-9_]{3,20}$/', $username)) {
    $errors['username'] = "Username must be 3–20 alphanumeric characters.";
}

// Email: required + valid format
$email = trim($_POST['email'] ?? '');
if ($email === '') {
    $errors['email'] = "Email is required.";
} elseif (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
    $errors['email'] = "Invalid email address.";
}

// Age: integer between 1 and 120
$ageRaw = $_POST['age'] ?? null;
$age = filter_var($ageRaw, FILTER_VALIDATE_INT, [
    'options' => ['min_range' => 1, 'max_range' => 120]
]);
if ($age === false) {
    $errors['age'] = "Age must be between 1 and 120.";
}

if (!empty($errors)) {
    // Re-display form with errors
    foreach ($errors as $field => $msg) {
        echo "<p class='error'>$field: " . htmlspecialchars($msg) . "</p>";
    }
    exit;
}

// ✅ Data is valid — proceed
echo "Welcome, " . htmlspecialchars($username);
```

---

## 🔍 filter_var & filter_input

PHP's `filter_var()` validates or sanitizes a value using built-in filter constants. Use `FILTER_VALIDATE_*` to check that a value matches a format (email, URL, integer, IP). Use `FILTER_SANITIZE_*` to strip unwanted characters. `filter_input()` reads directly from a superglobal and applies a filter in one step.

```php
// FILTER_VALIDATE_*
filter_var("test@example.com", FILTER_VALIDATE_EMAIL);   // "test@example.com" or false
filter_var("3.14",             FILTER_VALIDATE_FLOAT);   // 3.14 or false
filter_var("42",               FILTER_VALIDATE_INT);     // 42 or false
filter_var("https://example.com", FILTER_VALIDATE_URL); // URL or false
filter_var("1",                FILTER_VALIDATE_BOOLEAN); // true/false/null
filter_var("192.168.1.1",      FILTER_VALIDATE_IP);      // IP or false

// With options
filter_var(42, FILTER_VALIDATE_INT, ['options' => ['min_range' => 1, 'max_range' => 100]]);

// FILTER_SANITIZE_* — clean input (produce safe output)
filter_var(" Hello <b>World!</b> ", FILTER_SANITIZE_SPECIAL_CHARS); // encoded
filter_var("42.5abc",              FILTER_SANITIZE_NUMBER_FLOAT, FILTER_FLAG_ALLOW_FRACTION); // "42.5"
filter_var("10abc",                FILTER_SANITIZE_NUMBER_INT);  // "10"

// filter_input — directly from superglobals
$email = filter_input(INPUT_POST, 'email', FILTER_VALIDATE_EMAIL);
$id    = filter_input(INPUT_GET,  'id',    FILTER_VALIDATE_INT);
$page  = filter_input(INPUT_GET,  'page',  FILTER_SANITIZE_NUMBER_INT);
```

---

## 🚫 Preventing XSS

**Cross-Site Scripting (XSS)** — attacker injects JavaScript into your HTML.

```php
// ❌ VULNERABLE — user input rendered raw
echo "<p>Hello, " . $_POST['name'] . "!</p>";
// If name = "<script>alert('XSS')</script>" — script executes!

// ✅ SAFE — always escape output
echo "<p>Hello, " . htmlspecialchars($_POST['name'], ENT_QUOTES, 'UTF-8') . "!</p>";

// htmlspecialchars converts:
// & → &amp;
// < → &lt;
// > → &gt;
// " → &quot;
// ' → &#039;  (with ENT_QUOTES)

// Helper function
function e(string $str): string {
    return htmlspecialchars($str, ENT_QUOTES | ENT_SUBSTITUTE, 'UTF-8');
}

// Use in templates
<h1>Welcome, <?= e($username) ?>!</h1>
<input value="<?= e($value) ?>">
```

---

## 🔒 CSRF Protection

**Cross-Site Request Forgery** — tricking a logged-in user into submitting a form.

```php
// Generate CSRF token
session_start();
if (empty($_SESSION['csrf_token'])) {
    $_SESSION['csrf_token'] = bin2hex(random_bytes(32));
}

// In HTML form
?>
<form method="post" action="process.php">
    <input type="hidden" name="csrf_token" value="<?= $_SESSION['csrf_token'] ?>">
    <!-- other fields -->
    <button type="submit">Submit</button>
</form>
<?php

// Validate CSRF token on form submission
function verifyCsrf(): void {
    if ($_SERVER['REQUEST_METHOD'] === 'POST') {
        $token = $_POST['csrf_token'] ?? '';
        if (!hash_equals($_SESSION['csrf_token'], $token)) {
            http_response_code(403);
            die("CSRF token mismatch");
        }
    }
}

verifyCsrf();
```

---

## 📤 File Uploads

File uploads require a form with `enctype="multipart/form-data"`. PHP makes the uploaded file available via `$_FILES`. Always validate the upload: check the `error` code, verify file size, and inspect the **server-side MIME type** (never trust the client-provided type). Generate a random filename to prevent overwriting and path traversal attacks.

```html
<!-- Multipart form required for file uploads -->
<form method="post" action="upload.php" enctype="multipart/form-data">
    <input type="file" name="avatar" accept="image/*">
    <input type="submit" value="Upload">
</form>
```

```php
// upload.php
declare(strict_types=1);

if ($_SERVER['REQUEST_METHOD'] !== 'POST') exit;

$file = $_FILES['avatar'] ?? null;
if ($file === null || $file['error'] === UPLOAD_ERR_NO_FILE) {
    die("No file uploaded");
}

// Check for upload errors
$uploadErrors = [
    UPLOAD_ERR_INI_SIZE   => "File exceeds server max size",
    UPLOAD_ERR_FORM_SIZE  => "File exceeds form max size",
    UPLOAD_ERR_PARTIAL    => "File only partially uploaded",
    UPLOAD_ERR_NO_TMP_DIR => "Missing temp directory",
    UPLOAD_ERR_CANT_WRITE => "Cannot write to disk",
    UPLOAD_ERR_EXTENSION  => "Extension blocked upload",
];
if ($file['error'] !== UPLOAD_ERR_OK) {
    die($uploadErrors[$file['error']] ?? "Unknown upload error");
}

// Validate file type via MIME (NOT extension)
$finfo    = finfo_open(FILEINFO_MIME_TYPE);
$mimeType = finfo_file($finfo, $file['tmp_name']);
finfo_close($finfo);

$allowedMimes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
if (!in_array($mimeType, $allowedMimes, true)) {
    die("Invalid file type: $mimeType");
}

// Validate size (e.g., max 2MB)
if ($file['size'] > 2 * 1024 * 1024) {
    die("File too large (max 2MB)");
}

// Generate safe filename
$ext        = match($mimeType) {
    'image/jpeg' => 'jpg',
    'image/png'  => 'png',
    'image/gif'  => 'gif',
    'image/webp' => 'webp',
};
$safeFilename = bin2hex(random_bytes(16)) . ".$ext";
$uploadDir    = __DIR__ . "/uploads/";
$destination  = $uploadDir . $safeFilename;

// Move from temp to target
if (!move_uploaded_file($file['tmp_name'], $destination)) {
    die("Failed to move uploaded file");
}

echo "Uploaded: $safeFilename";
```

---

## 📊 Multiple Values (Checkboxes & Multi-Select)

Checkboxes and multi-select elements submit **arrays** of values. In HTML, append `[]` to the field name (e.g. `name="colors[]"`) to tell PHP to collect multiple values. PHP makes them available as an array in `$_POST`. Always validate against a **whitelist** of known-good values before using.

```html
<input type="checkbox" name="colors[]" value="red">
<input type="checkbox" name="colors[]" value="green">
<input type="checkbox" name="colors[]" value="blue">

<select name="tags[]" multiple>
    <option value="php">PHP</option>
    <option value="js">JavaScript</option>
</select>
```

```php
// PHP receives arrays
$colors = $_POST['colors'] ?? [];  // ["red", "green"]
$tags   = $_POST['tags']   ?? [];

// Sanitize each entry
$colors = array_map(fn($c) => htmlspecialchars($c, ENT_QUOTES, 'UTF-8'), $colors);

// Whitelist validation
$allowedColors = ['red', 'green', 'blue'];
$colors = array_filter($colors, fn($c) => in_array($c, $allowedColors, true));
```

---

## 📋 Form Security Checklist

| Check | How |
|-------|-----|
| Validate all input | `filter_var`, regex, type checks |
| Sanitize output | `htmlspecialchars()` |
| CSRF protection | Token in session |
| Check methods | `$_SERVER['REQUEST_METHOD']` |
| File upload safety | MIME check, random filename, size limit |
| SQL injection | PDO prepared statements (see ch. 14) |
| Rate limiting | Session counters or token buckets |
| Redirect after POST | Prevent double-submit on refresh |


---

[← Previous: File I/O](11-file-io.md) | [Contents](README.md) | [Next: Sessions & Cookies →](13-sessions-and-cookies.md)
