# 04: File System (fs Module)

## 📁 What is the fs Module?

The **`fs`** (File System) module lets you read, write, update, delete, and manage files and directories. It's a core Node.js module — no installation needed.

```javascript
const fs = require('fs');
const path = require('path');
```

---

## 🔄 Sync vs Async

Node.js offers both **synchronous** (blocking) and **asynchronous** (non-blocking) versions of most fs operations.

```
Sync  → Blocks execution until done  → Use only for startup scripts
Async → Non-blocking, uses callback  → Use in servers and apps
```

---

## 📖 Reading Files

```javascript
const fs = require('fs');

// ✅ Async (preferred)
fs.readFile('data.txt', 'utf8', (err, data) => {
  if (err) {
    console.error('Error reading file:', err);
    return;
  }
  console.log(data);
});

// 🔁 Sync (blocks — use sparingly)
try {
  const data = fs.readFileSync('data.txt', 'utf8');
  console.log(data);
} catch (err) {
  console.error(err);
}

// ✅ Async with Promises (modern approach)
const fsPromises = require('fs').promises;

async function readData() {
  try {
    const data = await fsPromises.readFile('data.txt', 'utf8');
    console.log(data);
  } catch (err) {
    console.error(err);
  }
}
```

---

## ✏️ Writing Files

```javascript
const fs = require('fs');

// Write (creates file or overwrites existing)
fs.writeFile('output.txt', 'Hello, Node.js!', 'utf8', (err) => {
  if (err) throw err;
  console.log('File written!');
});

// Append to existing file
fs.appendFile('output.txt', '\nAppended line', 'utf8', (err) => {
  if (err) throw err;
  console.log('Appended!');
});

// Write JSON data
const user = { name: 'Alice', age: 30 };
fs.writeFile('user.json', JSON.stringify(user, null, 2), 'utf8', (err) => {
  if (err) throw err;
  console.log('JSON saved!');
});
```

---

## 🗑️ Deleting Files

```javascript
const fs = require('fs');

// Delete a file
fs.unlink('tempFile.txt', (err) => {
  if (err) throw err;
  console.log('File deleted!');
});

// Check before deleting
fs.access('file.txt', fs.constants.F_OK, (err) => {
  if (!err) {
    fs.unlink('file.txt', () => console.log('Deleted'));
  } else {
    console.log('File does not exist');
  }
});
```

---

## 📂 Working with Directories

```javascript
const fs = require('fs');

// Create a directory
fs.mkdir('newFolder', (err) => {
  if (err) throw err;
  console.log('Folder created!');
});

// Create nested directories
fs.mkdir('a/b/c', { recursive: true }, (err) => {
  if (err) throw err;
  console.log('Nested folders created!');
});

// Read directory contents
fs.readdir('.', (err, files) => {
  if (err) throw err;
  console.log(files); // ['app.js', 'README.md', ...]
});

// Remove a directory
fs.rmdir('emptyFolder', (err) => {
  if (err) throw err;
  console.log('Folder removed!');
});

// Remove directory with contents (recursive)
fs.rm('folderWithFiles', { recursive: true, force: true }, (err) => {
  if (err) throw err;
  console.log('Folder and contents removed!');
});
```

---

## 🔍 File Information

```javascript
const fs = require('fs');

fs.stat('app.js', (err, stats) => {
  if (err) throw err;

  console.log('Size:', stats.size, 'bytes');
  console.log('Is file?', stats.isFile());
  console.log('Is folder?', stats.isDirectory());
  console.log('Modified:', stats.mtime);
});
```

---

## 🛣️ The path Module

Always use `path` to build file paths — it handles Windows vs Unix differences automatically.

```javascript
const path = require('path');

// Join path segments
const filePath = path.join(__dirname, 'data', 'users.json');
// Windows: C:\project\data\users.json
// Linux:   /project/data/users.json

// Get path parts
console.log(path.basename('/data/users.json'));  // users.json
console.log(path.dirname('/data/users.json'));   // /data
console.log(path.extname('users.json'));         // .json

// Resolve absolute path
console.log(path.resolve('data', 'users.json'));
// Absolute path from current working directory
```

---

## 📁 Watching Files for Changes

```javascript
const fs = require('fs');

// Watch a file for changes
fs.watch('config.json', (eventType, filename) => {
  console.log(`${filename} changed (${eventType})`);
});
```

---

## 🎯 Practical Example: Read & Process JSON

```javascript
const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'users.json');

// Read JSON file
fs.readFile(filePath, 'utf8', (err, data) => {
  if (err) {
    console.error('Could not read file:', err.message);
    return;
  }

  try {
    const users = JSON.parse(data);
    const adults = users.filter(u => u.age >= 18);
    console.log('Adults:', adults.length);
  } catch (parseErr) {
    console.error('Invalid JSON:', parseErr.message);
  }
});
```

---

## ✅ fs.promises (Async/Await Style)

```javascript
const { readFile, writeFile, readdir } = require('fs').promises;
const path = require('path');

async function processFiles() {
  try {
    const files = await readdir('.');
    console.log('Files:', files);

    const content = await readFile('data.txt', 'utf8');
    const processed = content.toUpperCase();

    await writeFile('output.txt', processed, 'utf8');
    console.log('Done!');
  } catch (err) {
    console.error('Error:', err.message);
  }
}

processFiles();
```

---

## 🔑 Key Takeaways

- `fs.readFile` / `fs.writeFile` — async file operations
- `fs.promises` — use with `async/await` (cleanest approach)
- Always use `path.join(__dirname, ...)` to build safe file paths
- `fs.stat()` — get file info (size, type, modified date)
- Use `{ recursive: true }` for deep mkdir / rm operations

---

[← Previous: NPM & Package Management](03-npm.md) | [Contents](README.md) | [Next: HTTP Module →](05-http-module.md)
