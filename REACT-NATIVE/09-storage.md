# 09: Storage

## 🗄️ Storage Options Overview

| Solution | Use Case | Capacity | Encrypted | Sync |
|----------|----------|----------|-----------|------|
| **AsyncStorage** | General key-value | Large | No | Async |
| **SecureStore** | Tokens, passwords | Small | Yes | Async |
| **MMKV** | High-performance KV | Large | Optional | Sync |
| **SQLite** | Relational data | Large | No | Sync |
| **expo-file-system** | Files, blobs | Disk | No | Async |

---

## 📦 AsyncStorage

Simple, async key-value storage. Persists across app restarts.

```bash
npm install @react-native-async-storage/async-storage
```

### Basic Operations

```javascript
import AsyncStorage from '@react-native-async-storage/async-storage';

// Save string
await AsyncStorage.setItem('username', 'alice');

// Read string
const username = await AsyncStorage.getItem('username');
// Returns null if key doesn't exist

// Save object (must stringify)
await AsyncStorage.setItem('user', JSON.stringify({ id: 1, name: 'Alice' }));

// Read object
const raw = await AsyncStorage.getItem('user');
const user = raw ? JSON.parse(raw) : null;

// Remove item
await AsyncStorage.removeItem('username');

// Clear everything (use with caution!)
await AsyncStorage.clear();

// Get all keys
const keys = await AsyncStorage.getAllKeys();

// Batch operations
await AsyncStorage.multiSet([
  ['key1', 'value1'],
  ['key2', 'value2'],
]);

const results = await AsyncStorage.multiGet(['key1', 'key2']);
// [['key1', 'value1'], ['key2', 'value2']]

await AsyncStorage.multiRemove(['key1', 'key2']);
```

### Storage Hook

```javascript
function useStorage<T>(key: string, defaultValue: T) {
  const [value, setValue] = useState<T>(defaultValue);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    AsyncStorage.getItem(key).then(raw => {
      if (raw !== null) setValue(JSON.parse(raw));
      setLoading(false);
    });
  }, [key]);

  const save = async (newValue: T) => {
    setValue(newValue);
    await AsyncStorage.setItem(key, JSON.stringify(newValue));
  };

  const remove = async () => {
    setValue(defaultValue);
    await AsyncStorage.removeItem(key);
  };

  return { value, save, remove, loading };
}

// Usage
const { value: settings, save: saveSettings } = useStorage('settings', {
  theme: 'light',
  notifications: true,
});
```

---

## 🔒 SecureStore (Expo)

Hardware-backed encrypted storage. Use for tokens, passwords, and sensitive data.

```javascript
import * as SecureStore from 'expo-secure-store';

// Save securely
await SecureStore.setItemAsync('auth_token', 'eyJhbGciOiJIUzI1...');

// Read
const token = await SecureStore.getItemAsync('auth_token');

// Delete
await SecureStore.deleteItemAsync('auth_token');

// Check availability
const available = await SecureStore.isAvailableAsync();
```

**Options:**
```javascript
await SecureStore.setItemAsync('key', 'value', {
  requireAuthentication: true,  // Biometric required to read
  authenticationPrompt: 'Verify your identity',
  keychainAccessible: SecureStore.WHEN_UNLOCKED,
});
```

---

## ⚡ MMKV (High Performance)

Synchronous storage — 10x faster than AsyncStorage. Best for frequently read/written data.

```bash
npm install react-native-mmkv
```

```javascript
import { MMKV } from 'react-native-mmkv';

const storage = new MMKV();

// No await needed — synchronous!
storage.set('user.name', 'Alice');
storage.set('user.age', 25);
storage.set('user.premium', true);

const name = storage.getString('user.name');
const age = storage.getNumber('user.age');
const isPremium = storage.getBoolean('user.premium');

storage.delete('user.name');
storage.clearAll();

// Encrypted instance
const secureStorage = new MMKV({
  id: 'secure-storage',
  encryptionKey: 'my-encryption-key',
});
```

### MMKV with Zustand

```javascript
import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { MMKV } from 'react-native-mmkv';

const storage = new MMKV();

const mmkvStorage = createJSONStorage(() => ({
  setItem: (name, value) => storage.set(name, value),
  getItem: (name) => storage.getString(name) ?? null,
  removeItem: (name) => storage.delete(name),
}));

const useStore = create(
  persist(
    (set) => ({
      theme: 'light',
      setTheme: (theme) => set({ theme }),
    }),
    { name: 'app-store', storage: mmkvStorage }
  )
);
```

---

## 🗃️ SQLite (expo-sqlite)

Relational database — use for structured, queryable data.

```bash
npx expo install expo-sqlite
```

```javascript
import * as SQLite from 'expo-sqlite';

// Open (or create) a database
const db = SQLite.openDatabaseSync('myapp.db');

// Create table
db.execSync(`
  CREATE TABLE IF NOT EXISTS todos (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT NOT NULL,
    completed INTEGER DEFAULT 0,
    created_at TEXT DEFAULT (datetime('now'))
  );
`);

// Insert
db.runSync(
  'INSERT INTO todos (title) VALUES (?)',
  ['Buy groceries']
);

// Query all
const todos = db.getAllSync('SELECT * FROM todos ORDER BY created_at DESC');

// Query one
const todo = db.getFirstSync('SELECT * FROM todos WHERE id = ?', [1]);

// Update
db.runSync(
  'UPDATE todos SET completed = ? WHERE id = ?',
  [1, todoId]
);

// Delete
db.runSync('DELETE FROM todos WHERE id = ?', [todoId]);
```

### Using ORM (Drizzle with expo-sqlite)

```bash
npm install drizzle-orm
npm install --save-dev drizzle-kit
```

```javascript
import { drizzle } from 'drizzle-orm/expo-sqlite';
import * as SQLite from 'expo-sqlite';
import { integer, sqliteTable, text } from 'drizzle-orm/sqlite-core';
import { eq } from 'drizzle-orm';

const expo = SQLite.openDatabaseSync('db.sqlite');
const db = drizzle(expo);

// Define schema
export const todos = sqliteTable('todos', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  title: text('title').notNull(),
  completed: integer('completed', { mode: 'boolean' }).default(false),
});

// Query
const allTodos = await db.select().from(todos);
const activeTodos = await db.select().from(todos).where(eq(todos.completed, false));

// Insert
await db.insert(todos).values({ title: 'New Todo' });

// Update
await db.update(todos).set({ completed: true }).where(eq(todos.id, 1));

// Delete
await db.delete(todos).where(eq(todos.id, 1));
```

---

## 📁 File System (expo-file-system)

Read, write, and manage files on the device.

```javascript
import * as FileSystem from 'expo-file-system';

// Directories
FileSystem.documentDirectory  // Persistent user data
FileSystem.cacheDirectory     // Temporary cache (can be cleared by OS)

// Read text file
const content = await FileSystem.readAsStringAsync(
  FileSystem.documentDirectory + 'notes.txt'
);

// Write text file
await FileSystem.writeAsStringAsync(
  FileSystem.documentDirectory + 'notes.txt',
  'Hello, File System!'
);

// Check if file exists
const info = await FileSystem.getInfoAsync(
  FileSystem.documentDirectory + 'notes.txt'
);
if (info.exists) {
  console.log('File size:', info.size);
}

// Copy file
await FileSystem.copyAsync({
  from: FileSystem.cacheDirectory + 'temp.jpg',
  to: FileSystem.documentDirectory + 'photo.jpg',
});

// Move file
await FileSystem.moveAsync({
  from: FileSystem.cacheDirectory + 'download.pdf',
  to: FileSystem.documentDirectory + 'saved.pdf',
});

// Delete file
await FileSystem.deleteAsync(FileSystem.documentDirectory + 'notes.txt');

// Create directory
await FileSystem.makeDirectoryAsync(
  FileSystem.documentDirectory + 'photos',
  { intermediates: true }
);

// List directory
const { exists, isDirectory } = await FileSystem.getInfoAsync(path);
```

---

## 🔄 Data Migration & Versioning

Handle storage schema changes gracefully:

```javascript
const STORAGE_VERSION_KEY = 'storage_version';
const CURRENT_VERSION = 3;

async function migrateStorage() {
  const rawVersion = await AsyncStorage.getItem(STORAGE_VERSION_KEY);
  const version = rawVersion ? parseInt(rawVersion) : 0;

  if (version < 1) {
    // Migrate v0 → v1
    const oldData = await AsyncStorage.getItem('user_prefs');
    if (oldData) {
      const parsed = JSON.parse(oldData);
      await AsyncStorage.setItem('settings', JSON.stringify({
        theme: parsed.darkMode ? 'dark' : 'light',
        notifications: parsed.notifs ?? true,
      }));
      await AsyncStorage.removeItem('user_prefs');
    }
  }

  if (version < 2) {
    // Migrate v1 → v2
    await AsyncStorage.removeItem('deprecated_cache');
  }

  await AsyncStorage.setItem(STORAGE_VERSION_KEY, String(CURRENT_VERSION));
}

// Call on app startup
useEffect(() => {
  migrateStorage();
}, []);
```

---

[← Previous: Networking & APIs](08-networking.md) | [Contents](README.md) | [Next: Animations →](10-animations.md)
