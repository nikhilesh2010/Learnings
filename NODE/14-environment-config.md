# 14: Environment Variables & Configuration

## 🔑 What are Environment Variables?

Environment variables are **key-value pairs set outside your code** — they let you configure your app differently in development, testing, and production without changing code.

```
❌ Hardcoded (bad):
const DB_URL = 'mongodb://localhost:27017/mydb';
const SECRET = 'my-super-secret-key';

✅ Environment variables (good):
const DB_URL = process.env.DB_URL;
const SECRET = process.env.JWT_SECRET;
```

---

## 📄 The .env File

Store your variables in a `.env` file at the root of your project:

```env
# .env
NODE_ENV=development
PORT=3000

# Database
DB_URL=mongodb://localhost:27017/myapp

# Authentication
JWT_SECRET=your-super-secret-key-here
JWT_EXPIRES_IN=7d

# Email
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your@email.com
SMTP_PASS=your-email-password

# External APIs
STRIPE_KEY=sk_test_...
AWS_ACCESS_KEY=AKIA...
```

> **NEVER commit `.env` to Git!**

---

## 🚫 .gitignore

```gitignore
# .gitignore
node_modules/
.env
.env.local
.env.production
dist/
```

---

## 📦 dotenv Package

```bash
npm install dotenv
```

```javascript
// Load .env at the very top of your entry file
require('dotenv').config();

// Now access variables with process.env
const PORT = process.env.PORT || 3000;
const DB_URL = process.env.DB_URL;
const SECRET = process.env.JWT_SECRET;

console.log(`Starting on port ${PORT}`);
```

> Load `dotenv` **before** any other imports that need env vars.

---

## 🌍 process.env

`process.env` is available anywhere in Node.js without dotenv — but for `.env` file values, you need dotenv first.

```javascript
// Accessing environment variables
process.env.NODE_ENV       // 'development', 'production', 'test'
process.env.PORT           // '3000' (always a string!)
process.env.DB_URL
process.env.JWT_SECRET

// Type coercion needed for numbers
const PORT = parseInt(process.env.PORT) || 3000;
const POOL_SIZE = Number(process.env.DB_POOL) || 5;
```

---

## 🗂️ Config Module Pattern

Centralize all config in one file:

```javascript
// config/index.js
require('dotenv').config();

module.exports = {
  env: process.env.NODE_ENV || 'development',
  port: parseInt(process.env.PORT) || 3000,

  db: {
    url: process.env.DB_URL || 'mongodb://localhost:27017/myapp',
    poolSize: parseInt(process.env.DB_POOL) || 5,
  },

  jwt: {
    secret: process.env.JWT_SECRET,
    expiresIn: process.env.JWT_EXPIRES_IN || '7d',
  },

  email: {
    host: process.env.SMTP_HOST,
    port: parseInt(process.env.SMTP_PORT) || 587,
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
};
```

```javascript
// Usage anywhere in the app
const config = require('./config');

console.log(config.port);           // 3000
console.log(config.db.url);         // mongodb://...
console.log(config.jwt.secret);     // your-secret
```

---

## ✅ Config Validation

Fail early if required variables are missing:

```javascript
// config/index.js
require('dotenv').config();

const required = ['DB_URL', 'JWT_SECRET'];

required.forEach((key) => {
  if (!process.env[key]) {
    console.error(`❌ Missing required env variable: ${key}`);
    process.exit(1);  // don't start the app
  }
});

module.exports = {
  port: parseInt(process.env.PORT) || 3000,
  dbUrl: process.env.DB_URL,
  jwtSecret: process.env.JWT_SECRET,
};
```

---

## 📁 Multiple .env Files

Different configs for different environments:

```
.env               ← defaults (committed — no secrets)
.env.local         ← local overrides (not committed)
.env.development   ← dev environment
.env.production    ← production values
.env.test          ← test environment
```

```javascript
// Load the right file based on NODE_ENV
const envFile = `.env.${process.env.NODE_ENV || 'development'}`;
require('dotenv').config({ path: envFile });
```

Or with `dotenv-expand` for variable interpolation:

```env
BASE_URL=http://localhost
API_URL=${BASE_URL}/api    ← references BASE_URL
```

---

## 📊 Environment-Specific Behavior

```javascript
const config = require('./config');

// Different behavior per environment
if (config.env === 'production') {
  app.use(morgan('combined'));    // detailed logs
  app.use(rateLimiter);          // rate limiting
} else {
  app.use(morgan('dev'));        // colored logs
}

// Only use dev tools in development
if (config.env === 'development') {
  app.use(require('express-list-routes')(app));
}
```

---

## 🔒 Security Tips

```javascript
// ✅ Mask sensitive values in logs
console.log('DB URL:', config.dbUrl.replace(/:\/\/.*@/, '://***@'));

// ✅ Set JWT secret as a long random string
// Generate: node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"

// ✅ Don't log entire process.env — it contains system secrets too
// ❌ console.log(process.env);
```

---

## 🌐 Setting Env Vars Without .env

```powershell
# Windows PowerShell
$env:PORT=4000; node app.js

# Or set permanently in system settings
[System.Environment]::SetEnvironmentVariable('PORT', '4000', 'User')
```

```bash
# Linux / macOS
PORT=4000 node app.js
NODE_ENV=production node app.js
```

In production (e.g., on a cloud platform), inject variables through the platform's dashboard — never ship a `.env` file to production.

---

## 🔑 Key Takeaways

- Store secrets in `.env`, never in code
- Always add `.env` to `.gitignore`
- Load `dotenv` at the very beginning of your app
- Centralize config in a `config/index.js` file
- Validate required vars at startup and fail fast if missing
- All `process.env` values are **strings** — convert types explicitly

---

[← Previous: Error Handling](13-error-handling.md) | [Contents](README.md) | [Next: Database Integration →](15-database.md)
