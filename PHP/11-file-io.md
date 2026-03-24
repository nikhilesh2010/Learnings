# 11: File I/O

## 📁 Reading Files

PHP provides both high-level convenience functions and low-level handle-based I/O. `file_get_contents()` reads an entire file into a string in one call. `file()` reads into an array of lines. For large files, use `fopen()` + `fgets()` to stream line-by-line without loading the entire file into memory.

```php
<?php
// Read entire file into a string
$content = file_get_contents("data.txt");
var_dump($content);

// Read file from URL (if allow_url_fopen is enabled)
$html = file_get_contents("https://example.com");

// Read file into an array of lines
$lines = file("data.txt");                  // includes \n on each line
$lines = file("data.txt", FILE_IGNORE_NEW_LINES);  // no trailing newline
$lines = file("data.txt", FILE_SKIP_EMPTY_LINES);  // skip blank lines

// Low-level file read with handle
$handle = fopen("data.txt", "r");
if ($handle === false) {
    throw new RuntimeException("Cannot open file");
}

try {
    while (!feof($handle)) {
        $line = fgets($handle);   // read one line
        if ($line !== false) {
            echo $line;
        }
    }
} finally {
    fclose($handle);
}

// Read fixed number of bytes
$handle = fopen("binary.bin", "rb");
$bytes = fread($handle, 1024);  // read up to 1024 bytes
fclose($handle);
```

---

## ✍️ Writing Files

`file_put_contents()` writes a string to a file in one call — creating it if it doesn't exist, overwriting otherwise. Pass `FILE_APPEND` to append instead. For concurrent writes (multiple processes), always use `LOCK_EX` to obtain an exclusive file lock and prevent race conditions.

```php
// Write string to file (creates if not exists, overwrites)
file_put_contents("output.txt", "Hello, World!");

// Append to file
file_put_contents("log.txt", "New line\n", FILE_APPEND);

// Prepend with locking (prevent race conditions)
file_put_contents("log.txt", "Entry\n", FILE_APPEND | LOCK_EX);

// Low-level write
$handle = fopen("output.txt", "w");  // "w" truncates or creates
try {
    fwrite($handle, "Line 1\n");
    fwrite($handle, "Line 2\n");
} finally {
    fclose($handle);
}

// Write with exclusive lock
$handle = fopen("output.txt", "a");  // "a" = append
if (flock($handle, LOCK_EX)) {
    fwrite($handle, "Safe concurrent write\n");
    fflush($handle);        // flush to disk
    flock($handle, LOCK_UN); // release lock
}
fclose($handle);
```

---

## 🔑 File Modes

| Mode | Description |
|------|-------------|
| `r` | Read only, pointer at start |
| `r+` | Read + write, pointer at start |
| `w` | Write only, truncate or create |
| `w+` | Read + write, truncate or create |
| `a` | Write only, append (pointer at end) |
| `a+` | Read + write, pointer at end |
| `x` | Write only, fail if file exists |
| `x+` | Read + write, fail if file exists |
| `b` | Binary (append to above: `rb`, `wb`) |

---

## 📂 File & Directory Checks

Always verify a file or directory exists and is accessible before operating on it. `file_exists()` checks existence. `is_file()`, `is_dir()`, `is_readable()`, and `is_writable()` test specific attributes. `pathinfo()` and `basename()` extract parts of a path without touching the filesystem.

```php
$path = "data/users.txt";

// Existence checks
file_exists($path);      // file or directory exists
is_file($path);          // exists AND is a regular file
is_dir("data/");         // exists AND is a directory
is_readable($path);      // can be read
is_writable($path);      // can be written
is_executable($path);    // can be executed

// File info
filesize($path);                  // size in bytes
filemtime($path);                 // last modified time (Unix timestamp)
filectime($path);                 // change time
date("Y-m-d", filemtime($path));  // formatted date

// Pathname utilities
basename("/path/to/file.txt");         // file.txt
dirname("/path/to/file.txt");          // /path/to
pathinfo("/path/to/file.txt");
// ['dirname'=>'/path/to','basename'=>'file.txt','extension'=>'txt','filename'=>'file']

$info = pathinfo("/path/to/file.txt");
echo $info['extension'];  // txt

// Realpath — resolve .. and symlinks
$real = realpath("../config.php");
```

---

## 📂 Directory Operations

`scandir()` lists the contents of a directory as an array. `mkdir()` with `recursive: true` creates a full path in one call. `rmdir()` only works on **empty** directories. Use `opendir()`/`readdir()` for a streaming approach when listing very large directories.

```php
// List directory contents
$entries = scandir("images/");
// ['.', '..', 'photo.jpg', 'logo.png']

// Filter out . and ..
$files = array_diff(scandir("images/"), ['.', '..']);

// Create directory
mkdir("new-folder");
mkdir("deep/path/to/folder", 0755, true);   // recursive

// Remove directory (must be empty)
rmdir("empty-folder");

// Get current working directory
echo getcwd();   // /var/www/html

// Change directory
chdir("/var/www/html/public");

// Iterate directory with opendir/readdir
$dir = opendir("images/");
while (($file = readdir($dir)) !== false) {
    if ($file !== '.' && $file !== '..') {
        echo "$file\n";
    }
}
closedir($dir);
```

---

## 🔍 Glob & SPL Directory Iterator

`glob()` finds files matching a filename pattern (like shell wildcards). For **recursive** directory traversal, use `RecursiveDirectoryIterator` with `RecursiveIteratorIterator` from the SPL library. `FilesystemIterator` iterates a single directory with automatic `.` and `..` skipping.

```php
// glob — find files by pattern
$phpFiles = glob("src/*.php");
$allLogs  = glob("logs/**/*.log", GLOB_BRACE);
$any      = glob("{src,tests}/*.php", GLOB_BRACE);

foreach ($phpFiles as $file) {
    echo $file . "\n";
}

// SPL RecursiveDirectoryIterator — walk directory tree
$iterator = new RecursiveIteratorIterator(
    new RecursiveDirectoryIterator("src/"),
    RecursiveIteratorIterator::LEAVES_ONLY
);

foreach ($iterator as $file) {
    if ($file->isFile() && $file->getExtension() === "php") {
        echo $file->getPathname() . "\n";
    }
}

// FilesystemIterator — single directory
$dir = new FilesystemIterator("images/", FilesystemIterator::SKIP_DOTS);
foreach ($dir as $entry) {
    echo $entry->getFilename() . " (" . $entry->getSize() . " bytes)\n";
}
```

---

## 🗂️ File Manipulation

`copy()` duplicates a file. `rename()` both renames and moves files (across directories on the same filesystem). `unlink()` deletes a file. `tmpfile()` creates a temporary file that is automatically cleaned up when the handle is closed. Use `touch()` to create an empty file or update a file's modification timestamp.

```php
// Copy
copy("source.txt", "destination.txt");

// Move / rename
rename("old.txt", "new.txt");
rename("file.txt", "archive/file.txt");  // move to different dir

// Delete
unlink("old-file.txt");

// Temporary files
$tmpFile = tmpfile();           // returns handle
$tmpPath = tempnam(sys_get_temp_dir(), "php_");   // returns path
fwrite($tmpFile, "temporary data");
// tmpfile() auto-deleted when handle is closed or script ends

// Touch — create empty file or update timestamp
touch("file.txt");
touch("file.txt", strtotime("2025-01-01"));  // set mtime
```

---

## 📄 CSV Files

`fputcsv()` writes an array as a CSV line, handling quoting and escaping automatically. `fgetcsv()` reads one CSV line, returning an array. `str_getcsv()` parses a CSV string without requiring a file handle. Use `array_combine()` with the header row to get named associative arrays.

```php
// Write CSV
$data = [
    ["Name", "Age", "City"],
    ["Alice", 30, "Paris"],
    ["Bob",   25, "London"],
];

$handle = fopen("people.csv", "w");
foreach ($data as $row) {
    fputcsv($handle, $row);
}
fclose($handle);

// Read CSV
$handle = fopen("people.csv", "r");
$header = fgetcsv($handle);  // first row as headers

while (($row = fgetcsv($handle)) !== false) {
    $person = array_combine($header, $row);
    echo $person["Name"] . " is " . $person["Age"] . "\n";
}
fclose($handle);

// str_getcsv — parse a CSV string
$line = 'Alice,30,"Paris, France"';
$fields = str_getcsv($line);
// ["Alice", "30", "Paris, France"]
```

---

## 💾 Working with Paths (Cross-Platform)

Use `__DIR__` to get the directory of the current script as an absolute path — never rely on relative paths in PHP files. `realpath()` resolves `..` and symlinks to a canonical absolute path. `PHP_EOL` gives the OS-appropriate newline; `DIRECTORY_SEPARATOR` gives `\` on Windows or `/` on Linux/Mac.

```php
// Use DIRECTORY_SEPARATOR for portable paths
$path = "data" . DIRECTORY_SEPARATOR . "users" . DIRECTORY_SEPARATOR . "list.txt";

// Or use forward slashes — PHP handles them on all platforms
$path = "data/users/list.txt";

// __DIR__ — directory of current script
$configPath = __DIR__ . "/config.php";
$dataPath   = __DIR__ . "/../data/file.txt";

// realpath resolves ..
$real = realpath(__DIR__ . "/../data/file.txt");

// __FILE__ — full path of current script
echo __FILE__;   // /var/www/app/index.php

// PHP_EOL — OS-appropriate newline
file_put_contents("output.txt", "Line 1" . PHP_EOL . "Line 2" . PHP_EOL);
```

---

## 🔒 Security Best Practices

**Never** use user input directly in file paths — attackers can use `../` path traversal to read files outside your intended directory. Use `basename()` to strip directory components, then `realpath()` to resolve the full path, and verify it starts with your allowed base directory. Always validate file type by checking the MIME type server-side, not just the file extension.

```php
// NEVER use user input directly in file paths
// Vulnerable:
$filename = $_GET['file'];
readfile("/var/www/uploads/" . $filename);  // path traversal attack!

// Safe:
$filename = basename($_GET['file']);   // strip directory components
$safePath = realpath("/var/www/uploads/" . $filename);

// Verify it's still inside the allowed directory
if ($safePath === false || strpos($safePath, realpath("/var/www/uploads/")) !== 0) {
    http_response_code(403);
    die("Access denied");
}

readfile($safePath);

// Validate file extensions via whitelist
$allowed = ['jpg', 'png', 'gif'];
$ext = strtolower(pathinfo($filename, PATHINFO_EXTENSION));
if (!in_array($ext, $allowed, true)) {
    die("Invalid file type");
}

// Check MIME type (don't trust extension alone)
$finfo = finfo_open(FILEINFO_MIME_TYPE);
$mime  = finfo_file($finfo, $safePath);
finfo_close($finfo);
$allowedMimes = ['image/jpeg', 'image/png', 'image/gif'];
if (!in_array($mime, $allowedMimes, true)) {
    die("Invalid MIME type");
}
```

---

## 📋 File I/O Quick Reference

| Function | Purpose |
|----------|---------|
| `file_get_contents()` | Read entire file to string |
| `file_put_contents()` | Write string to file |
| `file()` | Read file to array of lines |
| `fopen/fclose()` | Low-level file handle |
| `fgets()` | Read one line |
| `fread()` | Read N bytes |
| `fwrite()` | Write to handle |
| `feof()` | Check end of file |
| `file_exists()` | Check file/dir exists |
| `is_file/is_dir()` | Type check |
| `filesize()` | Get file size |
| `filemtime()` | Last modified time |
| `copy/rename/unlink()` | Copy/move/delete |
| `mkdir/rmdir()` | Create/delete directory |
| `scandir()` | List directory |
| `glob()` | Find files by pattern |
| `fputcsv/fgetcsv()` | Read/write CSV |
| `realpath()` | Resolve canonical path |
| `basename/dirname()` | Path manipulation |
| `pathinfo()` | Path components |


---

[← Previous: Error & Exception Handling](10-error-handling.md) | [Contents](README.md) | [Next: Forms & User Input →](12-forms-and-input.md)
