# 13: Sessions & Cookies

## 🍪 Cookies

Cookies are small pieces of data stored **in the browser** and sent back to the server with every request.

```php
<?php
// setcookie(name, value, options_array)  PHP 7.3+
setcookie("username", "Alice", [
    'expires'  => time() + 60 * 60 * 24 * 30,  // 30 days
    'path'     => '/',               // available across the whole site
    'domain'   => 'example.com',    // optional: specific domain/subdomain
    'secure'   => true,             // only sent over HTTPS
    'httponly' => true,             // not accessible via JavaScript
    'samesite' => 'Lax',           // CSRF protection: Lax | Strict | None
]);

// Must be called BEFORE any output (HTML, echo, etc.)
// Cookies are available on the NEXT request
```

---

## 🍪 Reading & Deleting Cookies

Cookies set in one request are available on the **next request** in `$_COOKIE`. To delete a cookie, set it again with an expiry in the past — this instructs the browser to discard it. Also `unset()` the key from `$_COOKIE` to prevent it from being read by the current request.

```php
// Read
$username = $_COOKIE['username'] ?? null;

if ($username !== null) {
    echo "Welcome back, " . htmlspecialchars($username) . "!";
} else {
    echo "Welcome, guest!";
}

// Check if cookie exists
isset($_COOKIE['username']);

// Delete — set expiry in the past
setcookie("username", "", [
    'expires'  => time() - 3600,
    'path'     => '/',
    'secure'   => true,
    'httponly' => true,
    'samesite' => 'Lax',
]);
unset($_COOKIE['username']);  // also remove from current request superglobal
```

---

## 🔐 Secure Cookie Values

**Never store sensitive data** (user IDs, access tokens) in a cookie as plain text — cookies can be inspected by anyone with access to the browser. If you must store sensitive values in cookies, encrypt them symmetrically. Always set `secure`, `httponly`, and `samesite` flags for any cookie containing privileged data.

```php
// Encrypt cookie values — don't store plain sensitive data
function encryptCookie(string $value, string $key): string {
    $iv   = random_bytes(16);
    $enc  = openssl_encrypt($value, 'AES-256-CBC', $key, 0, $iv);
    return base64_encode($iv . $enc);
}

function decryptCookie(string $encoded, string $key): string|false {
    $data = base64_decode($encoded);
    $iv   = substr($data, 0, 16);
    $enc  = substr($data, 16);
    return openssl_decrypt($enc, 'AES-256-CBC', $key, 0, $iv);
}

$secret = $_ENV['COOKIE_SECRET'];
setcookie("user_id", encryptCookie("42", $secret), [
    'expires'  => time() + 86400,
    'secure'   => true,
    'httponly' => true,
    'samesite' => 'Strict',
]);
```

---

## 🗂️ Sessions

Sessions store data **on the server**, identified by a session ID in a cookie (or URL parameter).

```php
// Start or resume a session — call before any output
session_start();

// Store data
$_SESSION['user_id']   = 42;
$_SESSION['username']  = 'Alice';
$_SESSION['logged_in'] = true;
$_SESSION['cart']      = [];

// Read data
$userId = $_SESSION['user_id'] ?? null;

if (!isset($_SESSION['logged_in']) || !$_SESSION['logged_in']) {
    header("Location: /login.php");
    exit;
}

echo "Hello, " . htmlspecialchars($_SESSION['username']);
```

---

## 🔒 Session Security

The most critical session security practice is calling `session_regenerate_id(true)` immediately after a successful login. This prevents **session fixation attacks** where an attacker plants a known session ID, waits for the victim to log in, and then hijacks the session. Combine with short timeouts and secure cookie flags.

```php
session_start([
    'cookie_secure'   => true,      // HTTPS only
    'cookie_httponly' => true,      // no JS access
    'cookie_samesite' => 'Lax',    // CSRF protection
    'use_strict_mode' => true,      // reject unknown session IDs
]);

// Regenerate session ID after login (prevents session fixation)
function login(string $username): void {
    // Verify credentials first...

    session_regenerate_id(true);    // true = delete old session file
    $_SESSION['user_id']   = getUserId($username);
    $_SESSION['username']  = $username;
    $_SESSION['logged_in'] = true;
    $_SESSION['login_time'] = time();
}

// Session timeout
const SESSION_TIMEOUT = 1800;  // 30 minutes

function checkSessionTimeout(): void {
    if (isset($_SESSION['last_activity'])) {
        if (time() - $_SESSION['last_activity'] > SESSION_TIMEOUT) {
            session_unset();
            session_destroy();
            header("Location: /login.php?timeout=1");
            exit;
        }
    }
    $_SESSION['last_activity'] = time();
}

session_start();
checkSessionTimeout();
```

---

## 🚪 Logout & Destroying Sessions

A proper logout must: (1) clear all `$_SESSION` data with `session_unset()`, (2) destroy the server-side session file with `session_destroy()`, and (3) expire the session cookie in the browser. Skipping any step can leave the session exploitable. Always redirect after logout so the browser replaces the expired-cookie page.

```php
function logout(): void {
    session_start();

    // Clear all session variables
    session_unset();

    // Destroy session data server-side
    session_destroy();

    // Delete session cookie from browser
    if (isset($_COOKIE[session_name()])) {
        setcookie(session_name(), '', [
            'expires'  => time() - 3600,
            'path'     => '/',
            'secure'   => true,
            'httponly' => true,
            'samesite' => 'Lax',
        ]);
    }

    // Redirect to login
    header("Location: /login.php");
    exit;
}
```

---

## 🛒 Shopping Cart Example

The session is the simplest way to persist per-user state between page loads without a database. A shopping cart is a classic example: store it as an associative array in `$_SESSION` indexed by product ID. PHP automatically serialises and deserialises the session data between requests.

```php
<?php
session_start();

// Initialize cart if not set
$_SESSION['cart'] ??= [];

function addToCart(int $productId, int $qty = 1): void {
    if (isset($_SESSION['cart'][$productId])) {
        $_SESSION['cart'][$productId] += $qty;
    } else {
        $_SESSION['cart'][$productId] = $qty;
    }
}

function removeFromCart(int $productId): void {
    unset($_SESSION['cart'][$productId]);
}

function getCartCount(): int {
    return array_sum($_SESSION['cart'] ?? []);
}

// Usage
addToCart(101, 2);   // add 2 of product 101
addToCart(202, 1);   // add 1 of product 202
echo getCartCount(); // 3
removeFromCart(101);
echo getCartCount(); // 1
```

---

## 🔔 Flash Messages

Flash messages are stored in the session, displayed once, then deleted.

```php
function setFlash(string $type, string $message): void {
    $_SESSION['flash'][] = ['type' => $type, 'message' => $message];
}

function getFlashes(): array {
    $flashes = $_SESSION['flash'] ?? [];
    unset($_SESSION['flash']);   // remove after reading
    return $flashes;
}

// Set flash before redirect
setFlash('success', 'Profile updated successfully!');
header("Location: /profile.php");
exit;

// In profile.php template
session_start();
foreach (getFlashes() as $flash) {
    $type = htmlspecialchars($flash['type']);
    $msg  = htmlspecialchars($flash['message']);
    echo "<div class='alert alert-$type'>$msg</div>";
}
```

---

## ⚙️ Session Configuration

PHP session behaviour is controlled by `php.ini` directives or by `ini_set()` before `session_start()`. The `save_handler` setting controls where session data is stored — the default is the filesystem, but high-traffic apps use Redis or Memcached. Implement `SessionHandlerInterface` to store sessions in a database for centralized management across servers.

```php
// In php.ini or via ini_set()
session.save_handler = files       // where to store (files, redis, memcached, db)
session.save_path    = /tmp        // path for file handler
session.name         = PHPSESSID   // cookie name
session.gc_maxlifetime = 1440      // 24 min idle timeout
session.cookie_lifetime = 0        // 0 = until browser closes
session.use_strict_mode = 1
session.cookie_secure = 1
session.cookie_httponly = 1
session.cookie_samesite = Lax

// Programmatically
ini_set('session.gc_maxlifetime', 3600);

// Custom session save handler (e.g., database)
class DatabaseSessionHandler implements SessionHandlerInterface {
    public function __construct(private PDO $pdo) {}

    public function open(string $path, string $name): bool { return true; }
    public function close(): bool { return true; }

    public function read(string $id): string|false {
        $stmt = $this->pdo->prepare("SELECT data FROM sessions WHERE id = ?");
        $stmt->execute([$id]);
        return $stmt->fetchColumn() ?: '';
    }

    public function write(string $id, string $data): bool {
        $stmt = $this->pdo->prepare(
            "INSERT INTO sessions (id, data, updated_at)
             VALUES (?, ?, NOW())
             ON DUPLICATE KEY UPDATE data = ?, updated_at = NOW()"
        );
        return $stmt->execute([$id, $data, $data]);
    }

    public function destroy(string $id): bool {
        $stmt = $this->pdo->prepare("DELETE FROM sessions WHERE id = ?");
        return $stmt->execute([$id]);
    }

    public function gc(int $maxlifetime): int|false {
        $stmt = $this->pdo->prepare(
            "DELETE FROM sessions WHERE updated_at < DATE_SUB(NOW(), INTERVAL ? SECOND)"
        );
        $stmt->execute([$maxlifetime]);
        return $stmt->rowCount();
    }
}

$pdo     = new PDO("mysql:host=localhost;dbname=app", "user", "pass");
$handler = new DatabaseSessionHandler($pdo);
session_set_save_handler($handler, true);
session_start();
```

---

## 📋 Cookies vs Sessions

| Feature | Cookie | Session |
|---------|--------|---------|
| **Storage** | Browser | Server |
| **Size limit** | ~4KB | Server memory/disk limit |
| **Security** | Can be read/modified by user | Server-side — harder to tamper |
| **Expiry** | Set via `expires` | Configurable; ends on browser close by default |
| **Access** | Any domain page | Same server |
| **Performance** | Sent with every request | One ID cookie sent; data on server |
| **Use for** | Preferences, tracking tokens | Auth, cart, user state |


---

[← Previous: Forms & User Input](12-forms-and-input.md) | [Contents](README.md) | [Next: Database (PDO & MySQLi) →](14-database.md)
