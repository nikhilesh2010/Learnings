# 18: Best Practices & Patterns

## 📋 Project Structure

```
my-api/
├── src/
│   ├── app.js              ← Express app setup (no listen)
│   ├── server.js           ← Entry point (listen here)
│   ├── config/
│   │   └── index.js        ← All config from env vars
│   ├── routes/
│   │   ├── index.js        ← Barrel: combines all routers
│   │   ├── auth.js
│   │   └── users.js
│   ├── controllers/
│   │   └── userController.js   ← Route logic
│   ├── services/
│   │   └── userService.js  ← Business logic
│   ├── repositories/
│   │   └── userRepository.js  ← DB access
│   ├── models/
│   │   └── User.js         ← Mongoose schemas
│   ├── middleware/
│   │   ├── auth.js
│   │   └── errorHandler.js
│   ├── errors/
│   │   └── AppError.js
│   └── utils/
│       └── asyncHandler.js
├── tests/
├── .env
├── .env.example            ← committed — shows what vars are needed
├── .gitignore
└── package.json
```

---

## 🏗️ Separation of Concerns

### Route → Controller → Service → Repository

```javascript
// routes/users.js  — HTTP layer only
const router = express.Router();
const userController = require('../controllers/userController');
const { requireAuth } = require('../middleware/auth');

router.get('/', requireAuth, userController.getAll);
router.get('/:id', requireAuth, userController.getById);
router.post('/', requireAuth, userController.create);

module.exports = router;
```

```javascript
// controllers/userController.js  — handles req/res
const userService = require('../services/userService');
const asyncHandler = require('../utils/asyncHandler');
const { NotFoundError } = require('../errors/AppError');

exports.getAll = asyncHandler(async (req, res) => {
  const users = await userService.getAllUsers();
  res.json({ data: users, count: users.length });
});

exports.getById = asyncHandler(async (req, res) => {
  const user = await userService.getUserById(req.params.id);
  if (!user) throw new NotFoundError('User');
  res.json(user);
});

exports.create = asyncHandler(async (req, res) => {
  const user = await userService.createUser(req.body);
  res.status(201).json(user);
});
```

```javascript
// services/userService.js  — business logic
const userRepository = require('../repositories/userRepository');
const { ValidationError } = require('../errors/AppError');

exports.getAllUsers = () => userRepository.findAll();

exports.getUserById = (id) => userRepository.findById(id);

exports.createUser = async (data) => {
  const { name, email } = data;

  if (!name || !email) {
    throw new ValidationError('Name and email are required');
  }

  const existing = await userRepository.findByEmail(email);
  if (existing) throw new ValidationError('Email already in use');

  return userRepository.create({ name, email });
};
```

```javascript
// repositories/userRepository.js  — DB access only
const User = require('../models/User');

exports.findAll = () => User.find().select('-__v');
exports.findById = (id) => User.findById(id).select('-__v');
exports.findByEmail = (email) => User.findOne({ email });
exports.create = (data) => User.create(data);
```

---

## ⚙️ app.js vs server.js Split

```javascript
// src/app.js  — configure Express (exported for testing)
const express = require('express');
const helmet = require('helmet');
const cors = require('cors');
const morgan = require('morgan');

const app = express();

app.use(helmet());
app.use(cors({ origin: process.env.CLIENT_URL }));
app.use(morgan('dev'));
app.use(express.json({ limit: '10kb' }));

app.use('/api/v1', require('./routes'));

app.use((req, res) => res.status(404).json({ error: 'Not found' }));
app.use(require('./middleware/errorHandler'));

module.exports = app;

// src/server.js  — start the server
const app = require('./app');
const connectDB = require('./db/connect');

const PORT = process.env.PORT || 3000;

async function start() {
  await connectDB();
  app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
}

start();
```

---

## 🔢 API Versioning

```javascript
// Prefix routes with version
app.use('/api/v1/users', usersRouterV1);
app.use('/api/v2/users', usersRouterV2);

// Or in a dedicated routes/index.js
router.use('/v1', require('./v1'));
router.use('/v2', require('./v2'));
```

---

## 📝 Consistent API Response Format

```javascript
// utils/response.js
const success = (res, data, statusCode = 200, message = 'OK') => {
  res.status(statusCode).json({ success: true, message, data });
};

const error = (res, message, statusCode = 500) => {
  res.status(statusCode).json({ success: false, error: message });
};

module.exports = { success, error };

// Usage
const { success } = require('../utils/response');
success(res, users, 200, 'Users retrieved');
success(res, newUser, 201, 'User created');
```

---

## ♻️ Async Patterns

```javascript
// ✅ parallel when possible
const [user, posts, comments] = await Promise.all([
  userService.getById(id),
  postService.getByUser(id),
  commentService.getByUser(id),
]);

// ✅ sequential when order matters or rate-limiting
for (const email of emails) {
  await emailService.send(email); // controlled rate
}

// ✅ wrap all route handlers with asyncHandler
```

---

## 🔧 Environment-Based Configuration

```javascript
// config/index.js
const config = {
  development: {
    logLevel: 'debug',
    dbUrl: 'mongodb://localhost:27017/dev',
  },
  production: {
    logLevel: 'warn',
    dbUrl: process.env.DB_URL,
  },
  test: {
    logLevel: 'silent',
    dbUrl: 'mongodb://localhost:27017/test',
  },
};

module.exports = config[process.env.NODE_ENV || 'development'];
```

---

## 🚦 Graceful Shutdown

```javascript
const server = app.listen(PORT);

function shutdown(signal) {
  console.log(`${signal} received — graceful shutdown`);

  server.close(async () => {
    await mongoose.connection.close();
    console.log('Server and DB connections closed');
    process.exit(0);
  });

  // Force exit after 10s if graceful shutdown takes too long
  setTimeout(() => process.exit(1), 10000);
}

process.on('SIGTERM', () => shutdown('SIGTERM'));
process.on('SIGINT', () => shutdown('SIGINT'));
```

---

## 🔑 Key Takeaways

- Separate **Route → Controller → Service → Repository** — each layer has one job
- Split `app.js` (config) and `server.js` (listen) — makes testing easier
- Always have a `.env.example` file committed — shows what env vars are needed
- Use **API versioning** (`/api/v1/`) from the start
- Standardize API response format with a helper
- Implement **graceful shutdown** to avoid dropped requests on deploy

---

[← Previous: Security Best Practices](17-security.md) | [Contents](README.md) | [Next: Debugging & Performance →](19-debugging.md)
