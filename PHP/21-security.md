# 21: Security

> Security is not a feature — it's a foundation. PHP applications are common targets; understanding the attack vectors is essential.

---

## 🔑 1. Password Hashing

**Never store passwords as plain text or with fast hash functions** like MD5 or SHA1. Use `password_hash()` with `PASSWORD_ARGON2ID` (recommended) or `PASSWORD_BCRYPT`. These are intentionally slow, incorporate a random salt automatically, and resist brute-force and rainbow table attacks. `password_verify()` compares securely. Call `password_needs_rehash()` after login to upgrade stored hashes when you change the algorithm.

```php
<?php
declare(strict_types=1);

// ✅ Hashing — uses bcrypt by default, Argon2 recommended
$hash = password_hash($plaintext, PASSWORD_ARGON2ID, [
    'memory_cost' => 65536,   // 64 MB
    'time_cost'   => 4,       // iterations
    'threads'     => 3,
]);

// ✅ Verifying
if (password_verify($plaintext, $storedHash)) {
    // Login success
}

// ✅ Check if hash needs rehashing (after algorithm upgrade)
if (password_needs_rehash($storedHash, PASSWORD_ARGON2ID)) {
    $newHash = password_hash($plaintext, PASSWORD_ARGON2ID);
    // Save $newHash to database
}

// ❌ NEVER use:
md5($password);         // broken, reversible via rainbow tables
sha1($password);        // too fast — brute-forceable
sha256($password);      // still no salt, too fast
```

---

## 💉 2. SQL Injection Prevention

**SQL injection** is the most dangerous web vulnerability — an attacker appends SQL code to your query, potentially reading or deleting your entire database. The only safe defence is **prepared statements with bound parameters** via PDO. Always set `ATTR_EMULATE_PREPARES => false` so PHP uses native prepared statements rather than client-side string substitution.

```php
// ❌ VULNERABLE — never concatenate user data into SQL
$id   = $_GET['id'];
$sql  = "SELECT * FROM users WHERE id = $id";  // attacker sends: 1 OR 1=1

// ✅ SAFE — always use prepared statements with PDO
$pdo = new PDO("mysql:host=localhost;dbname=app", $user, $pass, [
    PDO::ATTR_ERRMODE            => PDO::ERRMODE_EXCEPTION,
    PDO::ATTR_EMULATE_PREPARES   => false,   // ← critical: disables emulation
    PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
]);

$stmt = $pdo->prepare("SELECT * FROM users WHERE id = :id AND active = :active");
$stmt->execute([':id' => (int)$_GET['id'], ':active' => 1]);
$user = $stmt->fetch();

// ✅ Dynamic ORDER BY (identifiers can't be parametrized)
$allowed = ['name', 'email', 'created_at'];
$sortBy  = in_array($_GET['sort'] ?? '', $allowed, true)
    ? $_GET['sort'] : 'name';                // whitelist approach
$stmt = $pdo->query("SELECT * FROM users ORDER BY `$sortBy`");
```

---

## 🔤 3. XSS (Cross-Site Scripting) Prevention

**XSS** occurs when user-supplied content is rendered as raw HTML, letting attackers inject `<script>` tags that steal cookies or redirect users. The fix is to **always escape output** with `htmlspecialchars()` using `ENT_QUOTES` and `UTF-8`. Deploy a Content Security Policy header as an additional layer of defence.

```php
// ❌ VULNERABLE — outputs raw user content
echo "<p>Hello, $_GET[name]</p>";
// attacker sends: ?name=<script>document.cookie</script>

// ✅ Always escape output
function e(mixed $value): string {
    return htmlspecialchars((string)$value, ENT_QUOTES | ENT_SUBSTITUTE, 'UTF-8');
}

echo "<p>Hello, " . e($_GET['name']) . "</p>";

// ✅ JSON in JavaScript context — encode to prevent breaking out
$userData = json_encode($data, JSON_HEX_TAG | JSON_HEX_AMP | JSON_HEX_APOS | JSON_HEX_QUOT);
echo "<script>const user = $userData;</script>";

// ✅ Content Security Policy as defence in depth
header("Content-Security-Policy: default-src 'self'; script-src 'self'");
```

---

## 🛡️ 4. CSRF Protection

**CSRF** exploits the browser's automatic inclusion of cookies — an attacker's page tricks the victim's browser into sending an authenticated request to your site. Defend with a **random secret token** in every form that the server validates on submission. Use `hash_equals()` for the comparison to prevent timing attacks. `SameSite=Strict` cookies provide additional browser-level protection.

```php
// CSRF: an attacker tricks a logged-in user's browser into submitting
// a form to your site (e.g., transfer money, change email)

// ✅ Generate token (on every page/session)
function csrfToken(): string {
    if (empty($_SESSION['csrf_token'])) {
        $_SESSION['csrf_token'] = bin2hex(random_bytes(32));
    }
    return $_SESSION['csrf_token'];
}

// ✅ In HTML form
echo '<input type="hidden" name="csrf_token" value="' . csrfToken() . '">';

// ✅ Validate on POST (use hash_equals to prevent timing attacks)
function verifyCsrf(): void {
    $token = $_POST['csrf_token'] ?? '';
    if (!hash_equals($_SESSION['csrf_token'] ?? '', $token)) {
        http_response_code(403);
        exit("CSRF token mismatch");
    }
}

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    verifyCsrf();
    // process form...
}

// ✅ SameSite cookies also mitigate CSRF
session_set_cookie_params([
    'samesite' => 'Strict',
    'secure'   => true,
    'httponly' => true,
]);
```

---

## 📁 5. File Upload Security

File uploads are a common attack vector if handled carelessly. **Never trust the filename or MIME type from the browser** — both can be forged. Check the MIME type server-side using `finfo`, enforce a size limit, and always generate a random filename. Ideally, store uploaded files **outside the web root** so they cannot be directly accessed via URL.

```php
// ❌ NEVER trust the client's MIME type ($_FILES['file']['type'])
// ❌ NEVER use the original filename directly

function handleSecureUpload(array $file): string {
    $maxSize  = 5 * 1024 * 1024;   // 5 MB
    $allowed  = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];

    // Check for upload errors
    if ($file['error'] !== UPLOAD_ERR_OK) {
        throw new RuntimeException("Upload error: " . $file['error']);
    }

    // Check size
    if ($file['size'] > $maxSize) {
        throw new RuntimeException("File too large.");
    }

    // Validate MIME type server-side
    $finfo    = new finfo(FILEINFO_MIME_TYPE);
    $mimeType = $finfo->file($file['tmp_name']);
    if (!in_array($mimeType, $allowed, true)) {
        throw new RuntimeException("Invalid file type: $mimeType");
    }

    // Generate safe filename (never use original)
    $ext      = match($mimeType) {
        'image/jpeg' => 'jpg', 'image/png' => 'png',
        'image/gif'  => 'gif', 'image/webp' => 'webp',
    };
    $filename = bin2hex(random_bytes(16)) . ".$ext";
    $destPath = "/var/www/uploads/$filename";   // outside webroot is ideal

    if (!move_uploaded_file($file['tmp_name'], $destPath)) {
        throw new RuntimeException("Failed to move file.");
    }

    return $filename;
}
```

---

## 🔐 6. Session Security

Session security is critical for any authenticated application. The key practices are: using secure, HttpOnly, SameSite cookies; enabling strict mode; and **regenerating the session ID after login** to prevent session fixation. Add an idle timeout to automatically log out inactive users.

```php
// ✅ Secure session configuration (set BEFORE session_start)
ini_set('session.cookie_secure',   '1');   // HTTPS only
ini_set('session.cookie_httponly', '1');   // No JavaScript access
ini_set('session.cookie_samesite', 'Strict');
ini_set('session.use_strict_mode', '1');   // Reject unknown session IDs
ini_set('session.use_only_cookies', '1');  // No session ID in URL

session_start();

// ✅ Regenerate session ID after privilege change (login, sudo)
session_regenerate_id(true);  // true = delete old session

// ✅ Session timeout
$timeout = 1800;   // 30 minutes
if (isset($_SESSION['last_activity']) &&
    (time() - $_SESSION['last_activity']) > $timeout) {
    session_unset();
    session_destroy();
    redirect('/login?timeout=1');
}
$_SESSION['last_activity'] = time();

// ✅ Bind session to user agent + IP (optional, can cause issues with mobile)
if (isset($_SESSION['user_agent']) &&
    $_SESSION['user_agent'] !== $_SERVER['HTTP_USER_AGENT']) {
    session_destroy();
    exit("Session hijack detected");
}
$_SESSION['user_agent'] = $_SERVER['HTTP_USER_AGENT'] ?? '';
```

---

## 🚪 7. Input Validation & Sanitization

**Validate intent** — check that the value is the right type, range, and format before using it. **Sanitize for output context** — escape for HTML, SQL, shell, etc. at the point of use. Integer casting `(int)` is the safest approach for numeric IDs. Use whitelists for enum-like values rather than trying to blacklist bad input.

```php
// Golden rule: Validate INTENT, sanitize for OUTPUT context

// ✅ Validate with filter_var
$email = filter_var($_POST['email'] ?? '', FILTER_VALIDATE_EMAIL);
if ($email === false) {
    $errors[] = "Invalid email";
}

$url = filter_var($_POST['url'] ?? '', FILTER_VALIDATE_URL);
$age = filter_var($_POST['age'] ?? '', FILTER_VALIDATE_INT, [
    'options' => ['min_range' => 0, 'max_range' => 150]
]);

// ✅ Whitelist approach for enums
$statuses = ['active', 'inactive', 'pending'];
$status   = in_array($_POST['status'] ?? '', $statuses, true)
    ? $_POST['status'] : 'pending';

// ✅ Integer casting (safest for IDs)
$id = (int) ($_GET['id'] ?? 0);
if ($id <= 0) {
    http_response_code(400);
    exit("Invalid ID");
}

// ✅ Path traversal prevention (for file operations)
function safePath(string $base, string $userInput): string {
    $real = realpath($base . DIRECTORY_SEPARATOR . basename($userInput));
    if ($real === false || !str_starts_with($real, realpath($base))) {
        throw new RuntimeException("Path traversal detected");
    }
    return $real;
}
```

---

## 🔒 8. Cryptography

For secure random tokens (API keys, password-reset links), always use `random_bytes()` — never `rand()` or `mt_rand()`. For symmetric encryption, use **AES-256-GCM** (authenticated encryption) which both encrypts and authenticates in one operation. For data integrity and webhook verification, use HMAC with `hash_hmac()` + `hash_equals()` to prevent timing attacks.

```php
// ✅ Generating secure random tokens
$token = bin2hex(random_bytes(32));     // 64 hex chars — for API keys
$uuid  = sprintf(
    '%04x%04x-%04x-%04x-%04x-%04x%04x%04x',
    mt_rand(0, 0xffff), mt_rand(0, 0xffff),
    mt_rand(0, 0xffff), mt_rand(0, 0x0fff) | 0x4000,
    mt_rand(0, 0x3fff) | 0x8000,
    mt_rand(0, 0xffff), mt_rand(0, 0xffff), mt_rand(0, 0xffff)
);

// ✅ Symmetric encryption (AES-256-GCM — authenticated encryption)
function encrypt(string $plaintext, string $key): string {
    $iv         = random_bytes(12);    // 96-bit IV for GCM
    $ciphertext = openssl_encrypt($plaintext, 'aes-256-gcm', $key,
                    OPENSSL_RAW_DATA, $iv, $tag);
    return base64_encode($iv . $tag . $ciphertext);
}

function decrypt(string $encoded, string $key): string {
    $raw        = base64_decode($encoded);
    $iv         = substr($raw, 0, 12);
    $tag        = substr($raw, 12, 16);
    $ciphertext = substr($raw, 28);
    $plain      = openssl_decrypt($ciphertext, 'aes-256-gcm', $key,
                    OPENSSL_RAW_DATA, $iv, $tag);
    if ($plain === false) throw new RuntimeException("Decryption failed");
    return $plain;
}

$key = hex2bin(getenv('APP_ENCRYPTION_KEY'));  // 32-byte key stored in .env
$enc = encrypt("sensitive data", $key);
$dec = decrypt($enc, $key);

// ✅ HMAC for data integrity (webhooks, tokens)
$signature = hash_hmac('sha256', $data, $secret);
if (!hash_equals($signature, $receivedSig)) {
    http_response_code(401); exit;
}
```

---

## 📋 Security Checklist

| Category | Practice |
|----------|----------|
| Passwords | `password_hash(ARGON2ID)` + `password_verify()` |
| SQL | PDO prepared statements, `ATTR_EMULATE_PREPARES=false` |
| XSS | `htmlspecialchars(ENT_QUOTES)` on all output |
| CSRF | Session token + `hash_equals()` validation |
| Sessions | `secure httponly samesite=Strict` cookies + `strict_mode` |
| File uploads | Server-side MIME check, random filename, size limit |
| Input | `filter_var()`, whitelists, integer casting |
| Cryptography | `random_bytes()`, AES-256-GCM, `hash_hmac()` |
| Security headers | CSP, HSTS, X-Frame-Options, X-Content-Type-Options |
| Errors | Never display raw errors in production (`display_errors=Off`) |
| Dependencies | `composer audit` to check for vulnerabilities |


---

[← Previous: HTTP, Headers & Redirects](20-http-and-headers.md) | [Contents](README.md) | [Next: Testing →](22-testing.md)
