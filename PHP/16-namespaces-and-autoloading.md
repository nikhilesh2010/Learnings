# 16: Namespaces & Autoloading

## 📦 What Are Namespaces?

Namespaces solve **name collisions** when combining multiple libraries or large codebases. They act like directories for class names.

```php
<?php
// Without namespaces — global space
class User { }   // collides with any other "User" class

// With namespaces
namespace App\Models;
class User { }   // fully qualified: App\Models\User

namespace Admin\Models;
class User { }   // fully qualified: Admin\Models\User — no collision!
```

---

## 🗂️ Declaring Namespaces

The `namespace` declaration must be the **first statement** in a PHP file (after `<?php`). It groups everything in the file under that namespace path. The standard convention is one class per file, with the namespace mirroring the directory structure — this is the PSR-4 convention that Composer's autoloader relies on.

```php
<?php
// Must be the FIRST statement in the file (after <?php)
// One namespace per file is standard practice
namespace App\Controllers;

class UserController {
    public function index(): void {
        echo "User list";
    }
}
```

### Sub-namespaces

```php
namespace App\Http\Controllers\Api\V1;

class ProductController { }
// Fully qualified: App\Http\Controllers\Api\V1\ProductController
```

---

## 🔗 Using Classes from Other Namespaces

The `use` statement **imports** a class into the current file's scope, letting you refer to it by its short name. Without `use`, you'd need to write the fully qualified name everywhere. `as` creates an alias to resolve name conflicts. Group imports from the same namespace with `use App\Models\{User, Post, Comment}`.

```php
<?php
namespace App\Controllers;

// use — import a class
use App\Models\User;
use App\Services\AuthService;
use App\Repositories\UserRepository;

// Alias to avoid conflicts
use App\Models\User as UserModel;
use ThirdParty\Models\User as ExternalUser;

// Import multiple from same namespace (PHP 7.0+)
use App\Models\{User, Post, Comment};

// use for functions and constants
use function App\Helpers\formatDate;
use const App\Config\APP_VERSION;

class DashboardController {
    public function __construct(
        private UserRepository $users,
        private AuthService    $auth,
    ) {}

    public function index(): void {
        $user = $this->users->findById(1);
        echo $user->getName();
    }
}
```

---

## 🌍 Global Namespace

When you are inside a namespace, PHP looks in the **current namespace** first when resolving class names. Built-in PHP classes (`DateTime`, `PDO`, `Exception`) live in the global namespace. Prefix them with a backslash (e.g. `new \DateTime()`) or add `use DateTime;` at the top to avoid a fatal "class not found" error.

```php
namespace App\Services;

class MyService {
    public function doSomething(): void {
        // Without \ — looks in current namespace first
        $dt = new DateTime();          // looks for App\Services\DateTime first → error!

        // With \ — explicitly global namespace
        $dt = new \DateTime();         // ✅ PHP's built-in DateTime
        $arr = new \ArrayObject();

        // Built-in functions don't need \
        $len = strlen("hello");        // ✅ always finds global strlen
        $len = \strlen("hello");       // also valid (explicit)

        // Built-in exceptions need \ in namespaced files
        throw new \InvalidArgumentException("Bad input");
        // Or: use \InvalidArgumentException at the top
    }
}
```

---

## 🔄 Autoloading with PSR-4

**PSR-4** is the standard that maps PHP class namespace paths to filesystem paths.

### Rule
```
Namespace prefix: App\
Base directory:   src/

App\Models\User           → src/Models/User.php
App\Controllers\UserCtrl  → src/Controllers/UserCtrl.php
App\Http\Middleware\Auth  → src/Http/Middleware/Auth.php
```

### composer.json
```json
{
    "autoload": {
        "psr-4": {
            "App\\": "src/"
        }
    }
}
```

After editing `composer.json`:
```bash
composer dump-autoload
```

### File structure
```
src/
├── Models/
│   ├── User.php              ← namespace App\Models;  class User
│   └── Post.php              ← namespace App\Models;  class Post
├── Controllers/
│   └── UserController.php    ← namespace App\Controllers;  class UserController
└── Services/
    └── AuthService.php       ← namespace App\Services;  class AuthService
```

---

## ✍️ Manual Autoloader (without Composer)

`spl_autoload_register()` registers a callback that PHP calls automatically the first time an unknown class name is used. Inside the callback you convert the class name to a file path and `require` it. You can register multiple autoloaders — PHP tries them in order until the class is found.

```php
// autoload.php — for projects not using Composer
spl_autoload_register(function(string $className): void {
    // PSR-4: App\Controllers\UserController → src/Controllers/UserController.php
    $prefix  = 'App\\';
    $baseDir = __DIR__ . '/src/';

    // Check if class uses the namespace prefix
    if (strncmp($className, $prefix, strlen($prefix)) !== 0) {
        return;  // not our namespace
    }

    // Convert namespace to path
    $relative = substr($className, strlen($prefix));
    $file = $baseDir . str_replace('\\', '/', $relative) . '.php';

    if (file_exists($file)) {
        require $file;
    }
});

// Register multiple autoloaders (called in order)
spl_autoload_register(function(string $class): void {
    // fallback autoloader for legacy code
    $file = __DIR__ . '/legacy/' . $class . '.php';
    if (file_exists($file)) require $file;
});
```

---

## 🔍 Namespace Inspection at Runtime

The magic constants `__NAMESPACE__` and `__CLASS__` return the current namespace and fully qualified class name at runtime. The `::class` syntax on a class name is a compile-time constant that returns the fully qualified name as a string — useful for container bindings, error messages, and reflection.

```php
namespace App\Models;

class User {
    public function getNamespace(): string {
        return __NAMESPACE__;          // "App\Models"
    }
    public function getClass(): string {
        return __CLASS__;              // "App\Models\User"
    }
}

// In code
echo User::class;                      // "App\Models\User"
echo (new User())::class;             // "App\Models\User"

$obj = new User();
echo get_class($obj);                  // "App\Models\User"
echo (new \ReflectionClass($obj))->getNamespaceName();  // "App\Models"
```

---

## 🧩 Namespace Best Practices

The top-level vendor namespace should be unique (company or project name) to prevent conflicts when your code is used alongside third-party libraries. Keep one class per file with the namespace matching the directory path. Group `use` statements at the top of each file, and use aliases liberally when two classes from different packages share a name.

```php
// ✅ Match vendor/project structure
namespace Acme\Blog\Controllers;
namespace Acme\Blog\Models;
namespace Acme\Blog\Services;

// ✅ One class per file, filename matches class name
// src/Models/User.php → class User in namespace App\Models

// ✅ Use 'use' at top of file, not inline
use App\Models\User;
use App\Models\Post;

// Inside function — avoid, but valid
function doSomething(): void {
    $user = new \App\Models\User();  // fully qualified
}

// ✅ Alias colliding names clearly
use App\Models\User as AppUser;
use Api\V2\Resources\User as ApiUser;

// ✅ Group imports from the same namespace
use App\Models\{User, Post, Comment, Tag};
```

---

## 🏷️ Namespace Constants & Functions

Namespaces scope not just classes but also **functions** and **constants** defined within them. To call a namespaced function from outside, use the fully qualified name or `use function`. To access a namespaced constant, use `use const`. This avoids global pollution and allows the same constant name to mean different things in different packages.

```php
<?php
namespace App\Config;

// Define namespace-scoped constants
const APP_NAME    = 'MyApp';
const APP_VERSION = '1.0.0';
const DEBUG       = true;

// Define namespace-scoped functions
function loadConfig(string $path): array {
    return require $path;
}
```

```php
<?php
namespace App\Controllers;

use const App\Config\APP_NAME;
use const App\Config\APP_VERSION;
use function App\Config\loadConfig;

class HomeController {
    public function index(): void {
        echo APP_NAME . " v" . APP_VERSION;
        $config = loadConfig(__DIR__ . '/../../config/app.php');
    }
}
```

---

## 📋 Namespace Summary

| Feature | Example |
|---------|---------|
| Declare | `namespace App\Models;` |
| Import class | `use App\Models\User;` |
| Import with alias | `use App\Models\User as U;` |
| Import group | `use App\Models\{User, Post};` |
| Import function | `use function App\Helpers\format;` |
| Import constant | `use const App\Config\DEBUG;` |
| Current namespace | `__NAMESPACE__` |
| Current class (FQN) | `__CLASS__` or `ClassName::class` |
| Global class | `new \DateTime()` |
| Fully qualified | `new \App\Models\User()` |


---

[← Previous: Composer & Packages](15-composer-and-packages.md) | [Contents](README.md) | [Next: Regular Expressions →](17-regex.md)
