# 19: JSON & REST APIs

## 📄 JSON in PHP

`json_encode()` converts a PHP array or object to a JSON string. `json_decode()` does the reverse. Always pass `JSON_THROW_ON_ERROR` so PHP throws a `JsonException` on malformed input rather than returning `false` silently. Use `JSON_PRETTY_PRINT` for human-readable output during development.

```php
<?php
declare(strict_types=1);

// Encode PHP → JSON
$data = [
    "name"    => "Alice",
    "age"     => 30,
    "active"  => true,
    "scores"  => [95, 87, 91],
    "address" => ["city" => "Paris", "country" => "France"],
];

$json = json_encode($data);
// {"name":"Alice","age":30,"active":true,"scores":[95,87,91],"address":{"city":"Paris","country":"France"}}

// Pretty print
$pretty = json_encode($data, JSON_PRETTY_PRINT);

// Additional flags
json_encode($data, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);
```

---

## 🔓 JSON Flags

| Flag | Effect |
|------|--------|
| `JSON_PRETTY_PRINT` | Indent the output |
| `JSON_UNESCAPED_UNICODE` | Don't escape Unicode chars (é, ñ, etc.) |
| `JSON_UNESCAPED_SLASHES` | Don't escape `/` |
| `JSON_THROW_ON_ERROR` | Throw JsonException instead of returning false |
| `JSON_NUMERIC_CHECK` | Encode numeric strings as numbers |
| `JSON_FORCE_OBJECT` | Force object instead of array |

---

## 🔍 Decoding JSON
`json_decode()` with `true` as the second argument returns an associative array (recommended). Without it, PHP returns a `stdClass` object. Always use `JSON_THROW_ON_ERROR` so invalid JSON throws a `JsonException` instead of silently returning `null`, which is indistinguishable from a valid JSON `null`.
```php
$json = '{"name":"Alice","age":30,"scores":[95,87,91]}';

// Decode to associative array (recommended)
$data = json_decode($json, true);
echo $data['name'];      // Alice
echo $data['scores'][0]; // 95

// Decode to object
$obj = json_decode($json);
echo $obj->name;         // Alice
echo $obj->scores[0];    // 95

// Safe decode with error handling
$data = json_decode($json, true, 512, JSON_THROW_ON_ERROR);
// Throws JsonException on invalid JSON

// Manual error checking (without JSON_THROW_ON_ERROR)
$data = json_decode($invalid_json, true);
if (json_last_error() !== JSON_ERROR_NONE) {
    throw new RuntimeException("JSON decode error: " . json_last_error_msg());
}
```

---

## 🌐 Making HTTP Requests with file_get_contents

`file_get_contents()` can fetch remote URLs when `allow_url_fopen` is enabled. It's the simplest way to make GET requests but has limited control over headers, timeouts, and error handling. For more control, use cURL. Always set a timeout via a **stream context** to avoid hanging requests.

```php
// Simple GET
$response = file_get_contents('https://api.example.com/users');
$users = json_decode($response, true, 512, JSON_THROW_ON_ERROR);

// With headers (using stream context)
$context = stream_context_create([
    'http' => [
        'method'  => 'GET',
        'header'  => "Authorization: Bearer $token\r\nAccept: application/json\r\n",
        'timeout' => 10,
    ],
]);
$response = file_get_contents('https://api.example.com/protected', false, $context);
```

---

## 🔌 Making HTTP Requests with cURL

**cURL** is the standard way to make HTTP requests in PHP when you need full control: custom methods (PUT, DELETE), request bodies, headers, SSL certificates, redirects, and timeouts. Always set `CURLOPT_SSL_VERIFYPEER => true` in production — never disable SSL verification.

```php
// GET request
function httpGet(string $url, array $headers = []): array {
    $ch = curl_init();
    curl_setopt_array($ch, [
        CURLOPT_URL            => $url,
        CURLOPT_RETURNTRANSFER => true,
        CURLOPT_TIMEOUT        => 10,
        CURLOPT_HTTPHEADER     => $headers,
        CURLOPT_FOLLOWLOCATION => true,
        CURLOPT_SSL_VERIFYPEER => true,  // always verify SSL in production
    ]);

    $response = curl_exec($ch);
    $status   = curl_getinfo($ch, CURLINFO_HTTP_CODE);
    $error    = curl_error($ch);
    curl_close($ch);

    if ($error) throw new RuntimeException("cURL error: $error");
    if ($status >= 400) throw new RuntimeException("HTTP $status: $url");

    return json_decode($response, true, 512, JSON_THROW_ON_ERROR);
}

// POST request
function httpPost(string $url, array $data, array $headers = []): array {
    $headers[] = 'Content-Type: application/json';

    $ch = curl_init();
    curl_setopt_array($ch, [
        CURLOPT_URL            => $url,
        CURLOPT_RETURNTRANSFER => true,
        CURLOPT_POST           => true,
        CURLOPT_POSTFIELDS     => json_encode($data),
        CURLOPT_HTTPHEADER     => $headers,
        CURLOPT_TIMEOUT        => 10,
        CURLOPT_SSL_VERIFYPEER => true,
    ]);

    $response = curl_exec($ch);
    $status   = curl_getinfo($ch, CURLINFO_HTTP_CODE);
    curl_close($ch);

    return json_decode($response, true, 512, JSON_THROW_ON_ERROR);
}

// Usage
$user = httpGet('https://api.example.com/users/42', [
    'Authorization: Bearer ' . $token,
    'Accept: application/json',
]);

$created = httpPost('https://api.example.com/users', [
    'name'  => 'Alice',
    'email' => 'alice@example.com',
]);
```

---

## 🏗️ Building a JSON API Endpoint

A PHP JSON API endpoint sets `Content-Type: application/json`, reads the request method and body, performs the operation, and echoes a JSON response with the appropriate HTTP status code. Wrap everything in `try/catch` so unhandled errors return a structured JSON error response rather than an HTML error page.

```php
// api/users.php
declare(strict_types=1);

header('Content-Type: application/json; charset=UTF-8');
header('X-Content-Type-Options: nosniff');

function jsonResponse(mixed $data, int $status = 200): never {
    http_response_code($status);
    echo json_encode($data, JSON_UNESCAPED_UNICODE | JSON_THROW_ON_ERROR);
    exit;
}

function jsonError(string $message, int $status = 400, array $extra = []): never {
    $body = array_merge(['error' => $message], $extra);
    jsonResponse($body, $status);
}

try {
    $method = $_SERVER['REQUEST_METHOD'];
    $id     = filter_input(INPUT_GET, 'id', FILTER_VALIDATE_INT);

    if ($method === 'GET') {
        if ($id === null || $id === false) {
            // List all users
            $users = getUsersFromDB();
            jsonResponse(['data' => $users, 'count' => count($users)]);
        } else {
            // Single user
            $user = getUserById($id);
            if ($user === null) jsonError("User not found", 404);
            jsonResponse(['data' => $user]);
        }
    }

    if ($method === 'POST') {
        $raw  = file_get_contents('php://input');
        $body = json_decode($raw, true, 512, JSON_THROW_ON_ERROR);

        // Validate
        if (empty($body['email']) || !filter_var($body['email'], FILTER_VALIDATE_EMAIL)) {
            jsonError("Invalid or missing email", 422);
        }

        $newId = createUser($body);
        jsonResponse(['data' => ['id' => $newId]], 201);
    }

    jsonError("Method not allowed", 405);

} catch (\JsonException $e) {
    jsonError("Invalid JSON: " . $e->getMessage(), 400);
} catch (\Throwable $e) {
    error_log($e->getMessage());
    jsonError("Internal server error", 500);
}
```

---

## 📡 Consuming an External API (Example: GitHub)

When consuming a third-party API, encapsulate all requests in a dedicated **client class** that handles authentication headers, base URL, and error mapping in one place. This keeps calling code clean and makes it easy to swap the HTTP implementation or add retry logic later.

```php
class GitHubClient {
    private const BASE_URL = 'https://api.github.com';

    public function __construct(
        private string $token,
        private string $userAgent = 'PHP-App/1.0'
    ) {}

    private function request(string $method, string $path, array $body = []): array {
        $ch = curl_init();

        $opts = [
            CURLOPT_URL            => self::BASE_URL . $path,
            CURLOPT_RETURNTRANSFER => true,
            CURLOPT_TIMEOUT        => 15,
            CURLOPT_SSL_VERIFYPEER => true,
            CURLOPT_HTTPHEADER     => [
                "Authorization: Bearer {$this->token}",
                "Accept: application/vnd.github.v3+json",
                "User-Agent: {$this->userAgent}",
                "Content-Type: application/json",
            ],
            CURLOPT_CUSTOMREQUEST  => $method,
        ];

        if (!empty($body)) {
            $opts[CURLOPT_POSTFIELDS] = json_encode($body);
        }

        curl_setopt_array($ch, $opts);
        $response = curl_exec($ch);
        $status   = curl_getinfo($ch, CURLINFO_HTTP_CODE);
        curl_close($ch);

        $data = json_decode($response, true, 512, JSON_THROW_ON_ERROR);

        if ($status >= 400) {
            throw new RuntimeException("GitHub API error $status: " . ($data['message'] ?? "Unknown"));
        }

        return $data;
    }

    public function getUser(string $username): array {
        return $this->request('GET', "/users/$username");
    }

    public function getRepos(string $username): array {
        return $this->request('GET', "/users/$username/repos?sort=updated&per_page=10");
    }

    public function createIssue(string $owner, string $repo, string $title, string $body): array {
        return $this->request('POST', "/repos/$owner/$repo/issues", [
            'title' => $title,
            'body'  => $body,
        ]);
    }
}

$gh   = new GitHubClient($_ENV['GITHUB_TOKEN']);
$user = $gh->getUser('torvalds');
echo $user['name'] . "\n";
echo "Public repos: " . $user['public_repos'] . "\n";
```

---

## 🔐 API Authentication Patterns

APIs use several authentication schemes. **Bearer tokens** (OAuth2, JWTs) are the most common — pass them in the `Authorization` header. **API keys** in a custom header are simple but less secure. For webhooks, verify the request signature with **HMAC** (`hash_hmac` + `hash_equals`) to ensure the payload came from the trusted source.

```php
// Bearer token (most common)
$headers = ["Authorization: Bearer $token"];

// Basic auth
$headers = ["Authorization: Basic " . base64_encode("$user:$pass")];

// API key in header
$headers = ["X-API-Key: $apiKey"];

// API key in query string (avoid — ends up in logs)
$url = "https://api.example.com/data?api_key=$apiKey";

// HMAC signature (webhook verification)
function verifyWebhook(string $secret, string $payload, string $signature): bool {
    $expected = 'sha256=' . hash_hmac('sha256', $payload, $secret);
    return hash_equals($expected, $signature);
}

$payload   = file_get_contents('php://input');
$sig       = $_SERVER['HTTP_X_HUB_SIGNATURE_256'] ?? '';
$verified  = verifyWebhook($_ENV['WEBHOOK_SECRET'], $payload, $sig);
```

---

## 📋 JSON & API Quick Reference

| Task | Code |
|------|------|
| Encode | `json_encode($data, JSON_PRETTY_PRINT \| JSON_UNESCAPED_UNICODE)` |
| Decode to array | `json_decode($json, true)` |
| Decode safely | `json_decode($json, true, 512, JSON_THROW_ON_ERROR)` |
| Set JSON header | `header('Content-Type: application/json')` |
| HTTP status | `http_response_code(201)` |
| Read request body | `file_get_contents('php://input')` |
| cURL GET | `curl_init` + `CURLOPT_RETURNTRANSFER` |
| cURL POST | `+ CURLOPT_POST + CURLOPT_POSTFIELDS` |
| Validate URL | `filter_var($url, FILTER_VALIDATE_URL)` |


---

[← Previous: Date & Time](18-date-and-time.md) | [Contents](README.md) | [Next: HTTP, Headers & Redirects →](20-http-and-headers.md)
