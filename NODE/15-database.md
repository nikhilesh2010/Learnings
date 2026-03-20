# 15: Database Integration

## 🗄️ Database Options in Node.js

| Database | Type | Node.js Library |
|----------|------|----------------|
| **MongoDB** | NoSQL (document) | `mongoose`, `mongodb` |
| **PostgreSQL** | SQL (relational) | `pg`, `prisma` |
| **MySQL** | SQL (relational) | `mysql2`, `prisma` |
| **SQLite** | SQL (file-based) | `better-sqlite3` |
| **Redis** | Key-value cache | `ioredis` |

---

## 🍃 MongoDB with Mongoose

### Installation & Connection

```bash
npm install mongoose
```

```javascript
// db/connect.js
const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.DB_URL);
    console.log(`MongoDB connected: ${conn.connection.host}`);
  } catch (err) {
    console.error('DB connection failed:', err.message);
    process.exit(1);
  }
};

module.exports = connectDB;

// app.js
const connectDB = require('./db/connect');
connectDB();
```

### Defining a Schema & Model

```javascript
// models/User.js
const mongoose = require('mongoose');

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Name is required'],
      trim: true,
      maxlength: [50, 'Name too long'],
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      lowercase: true,
      match: [/\S+@\S+\.\S+/, 'Invalid email format'],
    },
    age: {
      type: Number,
      min: [0, 'Age cannot be negative'],
    },
    role: {
      type: String,
      enum: ['user', 'admin'],
      default: 'user',
    },
  },
  {
    timestamps: true, // adds createdAt, updatedAt
  }
);

module.exports = mongoose.model('User', userSchema);
```

### CRUD Operations

```javascript
const User = require('./models/User');

// CREATE
const newUser = await User.create({ name: 'Alice', email: 'alice@example.com' });

// READ — find all
const users = await User.find();
const admins = await User.find({ role: 'admin' });

// READ — find one
const user = await User.findById('64abc...');
const user2 = await User.findOne({ email: 'alice@example.com' });

// READ — with query options
const results = await User.find({ role: 'user' })
  .select('name email')      // only these fields
  .sort({ name: 1 })         // ascending
  .limit(10)
  .skip(20);                 // pagination

// UPDATE
const updated = await User.findByIdAndUpdate(
  id,
  { name: 'Alice Smith' },
  { new: true, runValidators: true }  // return updated doc, validate
);

// DELETE
await User.findByIdAndDelete(id);
await User.deleteMany({ role: 'user' });  // delete many
```

---

## 🐘 PostgreSQL with pg

### Installation & Connection

```bash
npm install pg
```

```javascript
// db/pool.js
const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.DB_URL,
  // or individual fields:
  // host, port, database, user, password
  max: 10,               // pool size
  idleTimeoutMillis: 30000,
});

pool.on('error', (err) => {
  console.error('Unexpected DB error:', err);
});

module.exports = pool;
```

### Running Queries

```javascript
const pool = require('./db/pool');

// Simple query
const result = await pool.query('SELECT * FROM users');
console.log(result.rows);

// Parameterized query (prevents SQL injection)
const id = 1;
const result = await pool.query(
  'SELECT * FROM users WHERE id = $1',
  [id]
);
console.log(result.rows[0]);

// Insert
const { rows } = await pool.query(
  'INSERT INTO users (name, email) VALUES ($1, $2) RETURNING *',
  ['Alice', 'alice@example.com']
);
const newUser = rows[0];

// Update
await pool.query(
  'UPDATE users SET name = $1 WHERE id = $2',
  ['Alice Smith', id]
);

// Delete
await pool.query('DELETE FROM users WHERE id = $1', [id]);
```

### Transactions

```javascript
const client = await pool.connect();

try {
  await client.query('BEGIN');

  await client.query(
    'UPDATE accounts SET balance = balance - $1 WHERE id = $2',
    [100, fromAccount]
  );
  await client.query(
    'UPDATE accounts SET balance = balance + $1 WHERE id = $2',
    [100, toAccount]
  );

  await client.query('COMMIT');
  console.log('Transfer complete');
} catch (err) {
  await client.query('ROLLBACK');
  console.error('Transfer failed, rolled back:', err.message);
  throw err;
} finally {
  client.release(); // return connection to pool
}
```

---

## 🗂️ Repository Pattern

Keep database code organized and testable:

```javascript
// repositories/userRepository.js
const User = require('../models/User');   // for Mongoose

const userRepository = {
  async findAll(filter = {}) {
    return User.find(filter);
  },

  async findById(id) {
    return User.findById(id);
  },

  async create(data) {
    return User.create(data);
  },

  async update(id, data) {
    return User.findByIdAndUpdate(id, data, { new: true, runValidators: true });
  },

  async delete(id) {
    return User.findByIdAndDelete(id);
  },
};

module.exports = userRepository;

// routes/users.js — uses repository, not model directly
const userRepo = require('../repositories/userRepository');

router.get('/', asyncHandler(async (req, res) => {
  const users = await userRepo.findAll();
  res.json(users);
}));
```

---

## 📊 Mongoose Populate (Relationships)

```javascript
// models/Post.js
const postSchema = new mongoose.Schema({
  title: String,
  content: String,
  author: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',   // references the User model
  },
});

// Fetch posts with author details
const posts = await Post.find()
  .populate('author', 'name email'); // second arg = fields to include

// Result:
// { title: '...', author: { name: 'Alice', email: 'alice@...' } }
```

---

## ✅ Connection Best Practices

```javascript
// ✅ Handle disconnect events
mongoose.connection.on('disconnected', () => {
  console.warn('MongoDB disconnected — attempting reconnect...');
});

// ✅ Use connection pooling (default in Mongoose and pg)

// ✅ Close DB on process exit
process.on('SIGINT', async () => {
  await mongoose.connection.close();
  process.exit(0);
});
```

---

## 🔑 Key Takeaways

- **Mongoose** for MongoDB: define Schema → Model → CRUD with `.find()`, `.create()`, etc.
- **pg** for PostgreSQL: use connection pool (`Pool`), always use **parameterized queries** (`$1`, `$2`)
- Use **transactions** for multi-step operations that must all succeed or all fail
- Abstract DB logic into **repositories** to keep routes clean
- Always close DB connections on process exit

---

[← Previous: Environment & Config](14-environment-config.md) | [Contents](README.md) | [Next: Authentication & JWT →](16-authentication.md)
