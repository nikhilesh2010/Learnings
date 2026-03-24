# 14: Database (PDO & MySQLi)

## 🗄️ PDO — PHP Data Objects

PDO is the **recommended** way to interact with databases in PHP. It's database-agnostic and supports prepared statements natively.

```php
<?php
declare(strict_types=1);

// Connect to MySQL
$dsn = "mysql:host=localhost;dbname=myapp;charset=utf8mb4";
$pdo = new PDO($dsn, "db_user", "db_pass", [
    PDO::ATTR_ERRMODE            => PDO::ERRMODE_EXCEPTION,   // throw exceptions
    PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,          // return assoc arrays
    PDO::ATTR_EMULATE_PREPARES   => false,                     // use native prepares
]);

// Connect to SQLite
$pdo = new PDO("sqlite:/path/to/database.db");

// Connect to PostgreSQL
$pdo = new PDO("pgsql:host=localhost;dbname=mydb", "user", "pass");
```

---

## 🔐 Prepared Statements (SQL Injection Prevention)

**Never** concatenate user input into SQL strings.

```php
// ❌ VULNERABLE — SQL injection!
$id = $_GET['id'];
$result = $pdo->query("SELECT * FROM users WHERE id = $id");

// ✅ SAFE — prepared statement with positional placeholder
$stmt = $pdo->prepare("SELECT * FROM users WHERE id = ?");
$stmt->execute([$id]);
$user = $stmt->fetch();

// ✅ SAFE — named placeholder (clearer for many params)
$stmt = $pdo->prepare("SELECT * FROM users WHERE email = :email AND active = :active");
$stmt->execute([':email' => $email, ':active' => 1]);
$user = $stmt->fetch();

// Or bind params individually with type hints
$stmt = $pdo->prepare("INSERT INTO users (name, email, age) VALUES (?, ?, ?)");
$stmt->bindValue(1, $name,  PDO::PARAM_STR);
$stmt->bindValue(2, $email, PDO::PARAM_STR);
$stmt->bindValue(3, $age,   PDO::PARAM_INT);
$stmt->execute();
```

---

## 📥 Fetching Results

`fetch()` retrieves one row at a time; `fetchAll()` retrieves all rows at once. Use `PDO::FETCH_ASSOC` for associative arrays (most common) or `PDO::FETCH_CLASS` to hydrate results directly into objects. Use `fetchColumn()` to grab a single scalar value (like an ID or count) without building a full array.

```php
$stmt = $pdo->prepare("SELECT * FROM users WHERE active = ?");
$stmt->execute([1]);

// Fetch one row
$user = $stmt->fetch();                     // assoc array (default FETCH_ASSOC)
$user = $stmt->fetch(PDO::FETCH_ASSOC);     // explicit assoc
$user = $stmt->fetch(PDO::FETCH_OBJ);       // stdClass object
$user = $stmt->fetch(PDO::FETCH_NUM);       // numeric indexed

// Fetch all rows
$users = $stmt->fetchAll();                 // array of arrays
$users = $stmt->fetchAll(PDO::FETCH_ASSOC); // explicit assoc

// Fetch into class
$users = $stmt->fetchAll(PDO::FETCH_CLASS, User::class);

// Fetch single column
$stmt = $pdo->prepare("SELECT email FROM users WHERE id = ?");
$stmt->execute([42]);
$email = $stmt->fetchColumn();              // "alice@example.com"

// Advanced — column with offset
$stmt = $pdo->prepare("SELECT id, name, email FROM users");
$stmt->execute();
$names = $stmt->fetchAll(PDO::FETCH_COLUMN, 1);   // all names

// Row count
$count = $stmt->rowCount();   // rows affected/returned
```

---

## ✏️ INSERT, UPDATE, DELETE

`INSERT` adds new rows; `UPDATE` modifies existing ones; `DELETE` removes them. Always use **prepared statements** with named or positional placeholders — never string-interpolate user data into SQL. `lastInsertId()` returns the auto-increment ID of the most recently inserted row. `rowCount()` tells you how many rows were affected.

```php
// INSERT
$stmt = $pdo->prepare(
    "INSERT INTO users (name, email, password_hash, created_at)
     VALUES (:name, :email, :password_hash, NOW())"
);
$stmt->execute([
    ':name'          => $name,
    ':email'         => $email,
    ':password_hash' => password_hash($password, PASSWORD_ARGON2ID),
]);
$newId = (int) $pdo->lastInsertId();

// UPDATE
$stmt = $pdo->prepare("UPDATE users SET name = :name WHERE id = :id");
$stmt->execute([':name' => $newName, ':id' => $userId]);
$affected = $stmt->rowCount();  // number of rows updated

// DELETE
$stmt = $pdo->prepare("DELETE FROM users WHERE id = ? AND deleted_at IS NULL");
$stmt->execute([$userId]);

// Soft delete
$stmt = $pdo->prepare("UPDATE users SET deleted_at = NOW() WHERE id = ?");
$stmt->execute([$userId]);
```

---

## 🔄 Transactions

A **transaction** groups multiple SQL statements into an all-or-nothing unit. If any statement fails, `rollBack()` reverts all changes in the group, preventing partial updates that would leave data inconsistent. `beginTransaction()` starts the transaction; `commit()` applies it permanently.

```php
try {
    $pdo->beginTransaction();

    // Debit account
    $pdo->prepare("UPDATE accounts SET balance = balance - ? WHERE id = ?")
        ->execute([$amount, $fromId]);

    // Credit account
    $pdo->prepare("UPDATE accounts SET balance = balance + ? WHERE id = ?")
        ->execute([$amount, $toId]);

    // Record transfer
    $pdo->prepare("INSERT INTO transfers (from_id, to_id, amount, created_at) VALUES (?,?,?,NOW())")
        ->execute([$fromId, $toId, $amount]);

    $pdo->commit();
} catch (PDOException $e) {
    $pdo->rollBack();
    throw new RuntimeException("Transfer failed: " . $e->getMessage(), 0, $e);
}
```

---

## 🏗️ Repository Pattern

The **Repository pattern** encapsulates all database queries for an entity behind a class. Controllers and services call repository methods like `findById()` or `create()` without knowing anything about SQL or PDO. This decouples business logic from persistence, making it easy to swap database backends and write unit tests with mock repositories.

```php
class UserRepository {
    public function __construct(private PDO $pdo) {}

    public function findById(int $id): ?array {
        $stmt = $this->pdo->prepare("SELECT * FROM users WHERE id = ?");
        $stmt->execute([$id]);
        $user = $stmt->fetch();
        return $user !== false ? $user : null;
    }

    public function findByEmail(string $email): ?array {
        $stmt = $this->pdo->prepare("SELECT * FROM users WHERE email = ?");
        $stmt->execute([$email]);
        $user = $stmt->fetch();
        return $user !== false ? $user : null;
    }

    /** @return array[] */
    public function findAll(int $limit = 50, int $offset = 0): array {
        $stmt = $this->pdo->prepare(
            "SELECT * FROM users ORDER BY created_at DESC LIMIT ? OFFSET ?"
        );
        $stmt->execute([$limit, $offset]);
        return $stmt->fetchAll();
    }

    public function create(string $name, string $email, string $password): int {
        $stmt = $this->pdo->prepare(
            "INSERT INTO users (name, email, password_hash) VALUES (?, ?, ?)"
        );
        $stmt->execute([$name, $email, password_hash($password, PASSWORD_ARGON2ID)]);
        return (int) $this->pdo->lastInsertId();
    }

    public function update(int $id, array $data): bool {
        $sets   = implode(', ', array_map(fn($k) => "$k = ?", array_keys($data)));
        $values = array_values($data);
        $values[] = $id;
        $stmt = $this->pdo->prepare("UPDATE users SET $sets WHERE id = ?");
        return $stmt->execute($values);
    }

    public function delete(int $id): bool {
        $stmt = $this->pdo->prepare("DELETE FROM users WHERE id = ?");
        return $stmt->execute([$id]);
    }
}

// Usage
$db   = new PDO("mysql:host=localhost;dbname=app;charset=utf8mb4", "user", "pass");
$repo = new UserRepository($db);

$user = $repo->findById(42);
$users = $repo->findAll(limit: 10, offset: 0);
$id = $repo->create("Alice", "alice@example.com", "secret");
```

---

## 🛡️ Database Connection Class

A **singleton connection class** ensures that only one PDO instance is created per request, reusing the same database connection throughout the application. The connection parameters are read from environment variables so no credentials are hardcoded in source code.

```php
class Database {
    private static ?PDO $instance = null;

    public static function connect(): PDO {
        if (self::$instance === null) {
            $host   = $_ENV['DB_HOST']     ?? 'localhost';
            $dbName = $_ENV['DB_NAME']     ?? 'app';
            $user   = $_ENV['DB_USER']     ?? 'root';
            $pass   = $_ENV['DB_PASSWORD'] ?? '';
            $port   = $_ENV['DB_PORT']     ?? '3306';

            $dsn = "mysql:host=$host;port=$port;dbname=$dbName;charset=utf8mb4";
            self::$instance = new PDO($dsn, $user, $pass, [
                PDO::ATTR_ERRMODE            => PDO::ERRMODE_EXCEPTION,
                PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
                PDO::ATTR_EMULATE_PREPARES   => false,
                PDO::ATTR_STRINGIFY_FETCHES  => false,
            ]);
        }
        return self::$instance;
    }
}

$pdo = Database::connect();
```

---

## 📊 MySQLi (Alternative)

MySQLi is MySQL-specific. Use PDO unless you need MySQLi-specific features.

```php
// Object-oriented style
$mysqli = new mysqli("localhost", "user", "pass", "database");
if ($mysqli->connect_error) {
    die("Connection failed: " . $mysqli->connect_error);
}

// Prepared statement
$stmt = $mysqli->prepare("SELECT * FROM users WHERE email = ?");
$stmt->bind_param("s", $email);   // s=string, i=int, d=double, b=blob
$stmt->execute();
$result = $stmt->get_result();

while ($row = $result->fetch_assoc()) {
    echo $row['name'] . "\n";
}
$stmt->close();

// Transaction
$mysqli->begin_transaction();
try {
    $mysqli->query("UPDATE stock SET qty = qty - 1 WHERE id = 1");
    $mysqli->commit();
} catch (Exception $e) {
    $mysqli->rollback();
    throw $e;
}

$mysqli->close();
```

---

## 📐 Schema Management

`$pdo->exec()` runs DDL statements (like `CREATE TABLE`) that return no result set. Use `CREATE TABLE IF NOT EXISTS` to make migrations idempotent — they can run multiple times without error. In production, use a proper migration tool (Phinx, Doctrine Migrations, Laravel Migrations) to version-control schema changes.

```php
// Create tables via PDO (run once or in a migration)
$pdo->exec("
    CREATE TABLE IF NOT EXISTS users (
        id           INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
        name         VARCHAR(100) NOT NULL,
        email        VARCHAR(255) NOT NULL UNIQUE,
        password_hash VARCHAR(255) NOT NULL,
        role         ENUM('user','admin') NOT NULL DEFAULT 'user',
        active       TINYINT(1) NOT NULL DEFAULT 1,
        created_at   TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at   TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        INDEX idx_email (email),
        INDEX idx_active (active)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
");
```

---

## 📋 PDO Quick Reference

| Task | Code |
|------|------|
| Connect | `new PDO($dsn, $user, $pass, $options)` |
| Prepare | `$pdo->prepare($sql)` |
| Execute | `$stmt->execute([$val1, $val2])` |
| Fetch one | `$stmt->fetch()` |
| Fetch all | `$stmt->fetchAll()` |
| Insert ID | `$pdo->lastInsertId()` |
| Row count | `$stmt->rowCount()` |
| Transaction | `beginTransaction()` / `commit()` / `rollBack()` |
| Inline query | `$pdo->exec($sql)` — for DDL with no results |
| Error mode | `PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION` |


---

[← Previous: Sessions & Cookies](13-sessions-and-cookies.md) | [Contents](README.md) | [Next: Composer & Packages →](15-composer-and-packages.md)
