# 15: Composer & Packages

## 📦 What is Composer?

**Composer** is PHP's dependency manager. It downloads, installs, and autoloads libraries from **Packagist** (packagist.org).

```
Project
├── composer.json    ← you define dependencies here
├── composer.lock    ← exact resolved versions (commit this!)
└── vendor/          ← installed packages (do NOT commit)
    └── autoload.php ← require this once to load all packages
```

---

## 🚀 Installation

Composer is a standalone PHP tool distributed as a `.phar` archive. On macOS/Linux, move it to `/usr/local/bin/composer` so it's globally available. On Windows, the `.exe` installer does this automatically. Once installed, all Composer operations are run from the project root directory.

```bash
# Windows — download composer-setup.exe from getcomposer.org
# Or with PowerShell:
php -r "copy('https://getcomposer.org/installer', 'composer-setup.php');"
php composer-setup.php
php -r "unlink('composer-setup.php');"

# macOS/Linux
curl -sS https://getcomposer.org/installer | php
sudo mv composer.phar /usr/local/bin/composer

# Verify
composer --version
```

---

## 📄 composer.json

`composer.json` is the manifest file that defines your project's **requirements** and metadata. `require` lists runtime dependencies; `require-dev` lists tools only needed during development (test runners, code analysers). The `autoload` section tells Composer how to map namespaces to directories. **Commit `composer.lock`** but never commit the `vendor/` directory.

```json
{
    "name": "myname/myproject",
    "description": "My PHP application",
    "type": "project",
    "require": {
        "php": "^8.1",
        "vlucas/phpdotenv": "^5.5",
        "guzzlehttp/guzzle": "^7.5",
        "monolog/monolog": "^3.3"
    },
    "require-dev": {
        "phpunit/phpunit": "^10.0",
        "friendsofphp/php-cs-fixer": "^3.0",
        "phpstan/phpstan": "^1.0"
    },
    "autoload": {
        "psr-4": {
            "App\\": "src/"
        }
    },
    "autoload-dev": {
        "psr-4": {
            "Tests\\": "tests/"
        }
    },
    "scripts": {
        "test": "phpunit --colors=always",
        "lint": "php-cs-fixer fix --dry-run --diff",
        "analyse": "phpstan analyse src --level=8"
    },
    "config": {
        "optimize-autoloader": true,
        "sort-packages": true
    },
    "minimum-stability": "stable"
}
```

---

## 🔧 Common Composer Commands

The two most important commands are `composer install` (installs exact versions from `composer.lock` — use on servers and CI) and `composer update` (resolves latest allowed versions and updates `composer.lock` — use during development to upgrade dependencies). `composer dump-autoload` regenerates the autoload files after adding new classes.

```bash
# Initialize a new project
composer init

# Install all dependencies (from composer.json)
composer install

# Update all packages to latest allowed versions
composer update

# Update a specific package
composer update monolog/monolog

# Add a new dependency
composer require guzzlehttp/guzzle

# Add a dev-only dependency
composer require --dev phpunit/phpunit

# Remove a package
composer remove guzzlehttp/guzzle

# Show installed packages
composer show

# Show details about a package
composer show monolog/monolog

# Validate composer.json
composer validate

# Check for security vulnerabilities
composer audit

# Regenerate autoload files after adding classes
composer dump-autoload

# Optimized autoloader for production
composer dump-autoload --optimize

# Run a script defined in composer.json
composer run test
```

---

## 🔢 Version Constraints

Composer version constraints follow **semantic versioning** (`MAJOR.MINOR.PATCH`). The caret `^` (recommended) allows any backwards-compatible upgrade: `^1.2.3` means `>=1.2.3 <2.0.0`. The tilde `~` is more restrictive: `~1.2.3` means `>=1.2.3 <1.3.0`. Avoid `*` in production — it allows any version including potentially breaking major releases.

```json
"require": {
    "vendor/package": "1.2.3",       // exact version
    "vendor/package": "^1.2.3",      // >=1.2.3 <2.0.0  (safe, recommended)
    "vendor/package": "~1.2.3",      // >=1.2.3 <1.3.0  (patch only)
    "vendor/package": ">=1.0 <2.0",  // explicit range
    "vendor/package": "1.0.*",       // any patch of 1.0
    "vendor/package": "*",           // any version (avoid!)
    "vendor/package": "dev-main"     // main branch (unstable)
}
```

---

## 🔄 Autoloading

Composer generates an **autoloader** at `vendor/autoload.php`. Require it once at your application entry point and all packages **and** your own PSR-4 mapped classes load automatically on demand — no manual `require` statements needed. Run `composer dump-autoload` after adding new class files or editing the `autoload` configuration.

```php
// Require autoloader once at app entry point
require __DIR__ . '/vendor/autoload.php';

// Now all packages + your own classes load automatically
```

### PSR-4 Autoloading (your own code)

```json
"autoload": {
    "psr-4": {
        "App\\": "src/",
        "Database\\": "lib/database/"
    },
    "files": [
        "src/helpers.php"
    ],
    "classmap": [
        "legacy/OldClass.php"
    ]
}
```

Directory structure:
```
src/
├── Controllers/
│   └── UserController.php    → class App\Controllers\UserController
├── Models/
│   └── User.php              → class App\Models\User
└── Services/
    └── AuthService.php       → class App\Services\AuthService
```

```php
// src/Controllers/UserController.php
namespace App\Controllers;

use App\Models\User;
use App\Services\AuthService;

class UserController {
    public function __construct(private AuthService $auth) {}

    public function show(int $id): void {
        $user = User::find($id);
        // ...
    }
}
```

---

## 🌟 Popular Packages

### HTTP Client
```bash
composer require guzzlehttp/guzzle
```
```php
use GuzzleHttp\Client;

$client   = new Client();
$response = $client->get('https://api.example.com/users');
$data     = json_decode($response->getBody(), true);
```

### Environment Variables
```bash
composer require vlucas/phpdotenv
```
```php
// .env
DB_HOST=localhost
DB_NAME=myapp
DB_USER=root
DB_PASSWORD=secret

// index.php
$dotenv = Dotenv\Dotenv::createImmutable(__DIR__);
$dotenv->load();
$dotenv->required(['DB_HOST', 'DB_NAME', 'DB_USER', 'DB_PASSWORD']);

echo $_ENV['DB_HOST'];   // localhost
```

### Logging
```bash
composer require monolog/monolog
```
```php
use Monolog\Logger;
use Monolog\Handler\StreamHandler;
use Monolog\Handler\RotatingFileHandler;

$log = new Logger('app');
$log->pushHandler(new StreamHandler('php://stdout', Logger::DEBUG));
$log->pushHandler(new RotatingFileHandler('logs/app.log', 30, Logger::WARNING));

$log->info('User logged in', ['user_id' => 42]);
$log->error('Payment failed', ['order_id' => 99, 'error' => 'Card declined']);
```

### Carbon (Date/Time)
```bash
composer require nesbot/carbon
```
```php
use Carbon\Carbon;

$now  = Carbon::now();
$past = Carbon::parse('2020-01-01');

echo $now->toDateString();         // 2025-03-24
echo $now->diffForHumans($past);   // 5 years ago
echo $now->addDays(7)->toDateString();
```

### Validation
```bash
composer require respect/validation
```
```php
use Respect\Validation\Validator as v;

$email = "invalid-email";
$valid = v::email()->validate($email);   // false

v::stringType()->length(3, 50)
 ->regex('/^[a-z0-9_]+$/i')
 ->validate("Alice_99");   // true
```

---

## 🔍 Packagist

- Browse packages at [packagist.org](https://packagist.org)
- Check download stats, GitHub stars, and last update date
- Read package documentation before installing
- Prefer packages with >1M installs and recent activity

---

## 📁 Project Structure (Recommended)

```
myproject/
├── composer.json
├── composer.lock
├── .env                  ← environment variables (NOT in git)
├── .env.example          ← template (commit this)
├── .gitignore
├── public/               ← web root (Apache/Nginx points here)
│   └── index.php         ← entry point
├── src/                  ← application code
│   ├── Controllers/
│   ├── Models/
│   ├── Services/
│   └── Helpers/
├── tests/                ← PHPUnit tests
├── config/               ← configuration files
├── views/                ← templates
├── logs/                 ← log files (NOT in git)
└── vendor/               ← Composer packages (NOT in git)
```

### .gitignore
```
/vendor/
/.env
/logs/
*.log
```


---

[← Previous: Database (PDO & MySQLi)](14-database.md) | [Contents](README.md) | [Next: Namespaces & Autoloading →](16-namespaces-and-autoloading.md)
