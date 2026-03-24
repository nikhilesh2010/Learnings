# 20: HTTP, Headers & Redirects

## 🌐 The HTTP Request–Response Cycle

Every PHP page starts with an **HTTP request** from a browser (or API client). The server runs your PHP script and sends back an **HTTP response** containing a status code, headers, and a body (HTML, JSON, etc.). PHP scripts end when the response is fully sent. The diagram below shows the full flow.

```
Browser                        PHP Server
  │                                │
  │── GET /products?page=2 ───────▶│
  │   Host: example.com            │
  │   Cookie: PHPSESSID=abc123     │
  │   Accept: text/html            │
  │                                │
  │                            PHP runs
  │                         generates HTML
  │                                │
  │◀── HTTP/1.1 200 OK ───────────│
  │    Content-Type: text/html     │
  │    Set-Cookie: viewed=1        │
  │                                │
  │    <html>...</html>            │
```

---

## 📬 Reading Request Data

PHP makes every part of the HTTP request available. `$_SERVER['REQUEST_METHOD']` gives the HTTP verb. `$_GET` and `$_POST` hold query-string and body parameters. `getallheaders()` returns the request headers as an array. For JSON API requests, read the raw body with `file_get_contents('php://input')`.

```php
<?php
// HTTP method
$method = $_SERVER['REQUEST_METHOD'];   // GET, POST, PUT, DELETE, PATCH

// URL components
$uri     = $_SERVER['REQUEST_URI'];     // /products?page=2&sort=price
$path    = parse_url($uri, PHP_URL_PATH);    // /products
$query   = parse_url($uri, PHP_URL_QUERY);   // page=2&sort=price

// From parse_url — all parts
$parts = parse_url("https://user:pass@example.com:8080/path?q=1#frag");
// scheme, host, port, user, pass, path, query, fragment

// Query string
parse_str($query, $params);   // $params = ['page' => '2', 'sort' => 'price']
$page = (int) ($_GET['page'] ?? 1);

// Request headers
$contentType = $_SERVER['HTTP_CONTENT_TYPE'] ?? $_SERVER['CONTENT_TYPE'] ?? '';
$accept      = $_SERVER['HTTP_ACCEPT'] ?? '*/*';
$auth        = $_SERVER['HTTP_AUTHORIZATION'] ?? '';

// All request headers
$headers = getallheaders();  // ['Content-Type' => 'application/json', ...]

// Request body (JSON API)
$rawBody = file_get_contents('php://input');
if (str_contains($contentType, 'application/json')) {
    $body = json_decode($rawBody, true, 512, JSON_THROW_ON_ERROR);
}

// Client IP
$ip = $_SERVER['REMOTE_ADDR'];
// When behind a proxy:
$ip = $_SERVER['HTTP_X_FORWARDED_FOR'] ?? $_SERVER['REMOTE_ADDR'];
// ⚠️ HTTP_X_FORWARDED_FOR can be spoofed — validate or trust only known proxies
```

---

## 📤 Sending Response Headers

`header()` sends an HTTP response header. It **must be called before any output** (before any `echo`, HTML, or whitespace). Use `http_response_code()` to set the status code. Always remove the `X-Powered-By` header with `header_remove()` to avoid leaking the PHP version to potential attackers.

```php
// header() must be called BEFORE any output (HTML, echo, whitespace)

// Content type
header('Content-Type: text/html; charset=UTF-8');
header('Content-Type: application/json; charset=UTF-8');
header('Content-Type: text/plain; charset=UTF-8');
header('Content-Type: application/pdf');
header('Content-Type: image/png');

// HTTP status code
http_response_code(200);   // OK
http_response_code(201);   // Created
http_response_code(204);   // No Content
http_response_code(301);   // Moved Permanently
http_response_code(302);   // Found (temporary redirect)
http_response_code(400);   // Bad Request
http_response_code(401);   // Unauthorized
http_response_code(403);   // Forbidden
http_response_code(404);   // Not Found
http_response_code(405);   // Method Not Allowed
http_response_code(422);   // Unprocessable Entity
http_response_code(429);   // Too Many Requests
http_response_code(500);   // Internal Server Error

// Check if headers were already sent
if (headers_sent($file, $line)) {
    echo "Headers sent in $file on line $line";
}

// Remove a header
header_remove('X-Powered-By');   // hide PHP version ← security best practice
```

---

## 🔀 Redirects

A redirect tells the browser to navigate to a different URL by sending a `Location` header with an appropriate status code. Use **302** (temporary) for the Post/Redirect/Get pattern to prevent form re-submission on browser refresh. Use **301** (permanent) when a URL has moved forever — browsers and search engines cache this.

```php
// Temporary redirect (302) — most common for POST/Redirect/GET
function redirect(string $url, int $code = 302): never {
    header("Location: $url", true, $code);
    exit;
}

redirect('/dashboard');
redirect('/login?timeout=1');
redirect('https://other-domain.com/', 301);  // permanent

// Permanent redirect (301) — tell browsers/search engines to update
header("Location: https://example.com/new-page", true, 301);
exit;

// POST/Redirect/GET pattern (prevent duplicate form submissions on refresh)
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    // process form...
    $_SESSION['flash'] = "Saved successfully!";
    header("Location: " . $_SERVER['PHP_SELF']);
    exit;
}
```

---

## 🔒 Security Headers

Security headers are HTTP response headers that instruct browsers to enforce hardened behaviour. Sending them on every response is a simple, high-value security improvement. The most important are: `Content-Security-Policy` (prevents XSS), `Strict-Transport-Security` (enforces HTTPS), `X-Frame-Options` (prevents clickjacking), and `X-Content-Type-Options` (prevents MIME sniffing).

```php
// Send security headers on every response
function securityHeaders(): void {
    // Prevent MIME sniffing
    header('X-Content-Type-Options: nosniff');

    // Clickjacking protection
    header('X-Frame-Options: SAMEORIGIN');

    // XSS protection (legacy browsers)
    header('X-XSS-Protection: 1; mode=block');

    // HTTPS enforcement (HSTS)
    header('Strict-Transport-Security: max-age=31536000; includeSubDomains; preload');

    // Content Security Policy — restricts resource loading
    header("Content-Security-Policy: default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline'");

    // Referrer policy
    header('Referrer-Policy: strict-origin-when-cross-origin');

    // Permissions policy
    header('Permissions-Policy: geolocation=(), microphone=(), camera=()');

    // Remove PHP fingerprinting
    header_remove('X-Powered-By');
}
```

---

## 📦 File Download

To trigger a **browser download dialog** instead of displaying a file inline, send `Content-Disposition: attachment` with a filename. Always verify the file exists and is inside the allowed directory before serving it. For large files, disable output buffering with `ob_end_clean()` to avoid loading the entire file into memory.

```php
function downloadFile(string $filePath, string $filename): never {
    if (!file_exists($filePath) || !is_readable($filePath)) {
        http_response_code(404);
        die("File not found");
    }

    $mimeType = mime_content_type($filePath);

    header('Content-Type: ' . $mimeType);
    header('Content-Disposition: attachment; filename="' . rawurlencode($filename) . '"');
    header('Content-Length: ' . filesize($filePath));
    header('Cache-Control: no-cache, must-revalidate');
    header('Pragma: no-cache');

    // Disable output buffering for large files
    if (ob_get_level()) ob_end_clean();
    flush();

    readfile($filePath);
    exit;
}

downloadFile('/var/www/app/reports/report.pdf', 'monthly-report.pdf');
```

---

## 💾 Caching Headers

Caching headers tell browsers and CDNs how long they can serve a cached copy of a resource. `Cache-Control: public, max-age=3600` caches a resource for one hour. For dynamic content, use `no-store`. Implement **conditional requests** with `ETag`/`If-None-Match` so clients can validate their cache efficiently, receiving a `304 Not Modified` if unchanged.

```php
// Cache for 1 hour
header('Cache-Control: public, max-age=3600');
header('ETag: "' . md5_file($filePath) . '"');
header('Last-Modified: ' . gmdate('D, d M Y H:i:s', filemtime($filePath)) . ' GMT');

// No cache (dynamic content)
header('Cache-Control: no-store, no-cache, must-revalidate, max-age=0');
header('Pragma: no-cache');

// Handle conditional requests (304 Not Modified)
$etag    = '"' . md5_file($filePath) . '"';
$ifNone  = $_SERVER['HTTP_IF_NONE_MATCH'] ?? '';
if ($ifNone === $etag) {
    http_response_code(304);
    exit;
}
header('ETag: ' . $etag);
```

---

## 🔐 CORS Headers (for APIs)

**CORS (Cross-Origin Resource Sharing)** is a browser mechanism that blocks JavaScript from calling an API on a different domain unless the server explicitly allows it. The server signals permission via `Access-Control-Allow-Origin`. For non-simple requests, browsers first send a **preflight OPTIONS** request — always respond to it with a 204 and the correct headers.

```php
// Allow requests from specific origin
function corsHeaders(string $allowedOrigin = '*'): void {
    header("Access-Control-Allow-Origin: $allowedOrigin");
    header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
    header('Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With');
    header('Access-Control-Max-Age: 86400');  // preflight cache: 24h

    // Handle preflight (OPTIONS) request
    if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
        http_response_code(204);
        exit;
    }
}

// In production: use a whitelist, not '*'
$allowedOrigins = ['https://myapp.com', 'https://www.myapp.com'];
$origin = $_SERVER['HTTP_ORIGIN'] ?? '';
if (in_array($origin, $allowedOrigins, true)) {
    corsHeaders($origin);
    header('Vary: Origin');
}
```

---

## 📊 $_SERVER Reference

| Key | Value |
|-----|-------|
| `REQUEST_METHOD` | `GET`, `POST`, etc. |
| `REQUEST_URI` | Full path + query: `/path?q=1` |
| `SCRIPT_NAME` | Script path: `/index.php` |
| `HTTP_HOST` | `example.com` or `example.com:8080` |
| `HTTPS` | `'on'` if HTTPS, else unset |
| `SERVER_PORT` | Port number (`80`, `443`, `8080`) |
| `REMOTE_ADDR` | Client IP address |
| `HTTP_USER_AGENT` | Browser/client string |
| `HTTP_REFERER` | Previous page URL (spoofable) |
| `HTTP_ACCEPT` | Client accepted MIME types |
| `HTTP_ACCEPT_LANGUAGE` | Preferred languages |
| `CONTENT_TYPE` | Request body type |
| `CONTENT_LENGTH` | Request body length |
| `PHP_SELF` | Current script path |
| `SCRIPT_FILENAME` | Full filesystem path |
| `SERVER_NAME` | Server hostname |
| `HTTP_AUTHORIZATION` | Authorization header |

---

## 📋 HTTP Quick Reference

| Task | Code |
|------|------|
| Set status | `http_response_code(404)` |
| Redirect | `header('Location: /path', true, 302); exit` |
| Set content type | `header('Content-Type: application/json')` |
| Read raw body | `file_get_contents('php://input')` |
| Get all headers | `getallheaders()` |
| Check HTTPS | `isset($_SERVER['HTTPS']) && $_SERVER['HTTPS'] === 'on'` |
| Check headers sent | `headers_sent($file, $line)` |
| Remove header | `header_remove('X-Powered-By')` |


---

[← Previous: JSON & REST APIs](19-json-and-apis.md) | [Contents](README.md) | [Next: Security →](21-security.md)
