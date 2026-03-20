# 17: Security Best Practices

## 🛡️ Security Overview

Node.js servers are common attack targets. This file covers OWASP Top 10 threats and how to mitigate them.

```
OWASP Top 10 (most relevant for Node.js APIs)
  1. Broken Access Control
  2. Injection (SQL, NoSQL, Command)
  3. Cryptographic Failures
  4. Security Misconfiguration
  5. Identification & Auth Failures
  6. Insecure Components
  7. Security Logging Failures
```

---

## 🏷️ Essential Packages

```bash
npm install helmet cors express-rate-limit validator
```

---

## 🪖 Helmet — Security Headers

```javascript
const helmet = require('helmet');

app.use(helmet());
// Sets: Content-Security-Policy, X-Frame-Options, X-XSS-Protection,
//       X-Content-Type-Options, HSTS, Referrer-Policy, etc.
```

---

## 🌐 CORS — Cross-Origin Resource Sharing

```javascript
const cors = require('cors');

// ❌ Too permissive — allows any origin
app.use(cors());

// ✅ Restrict to your frontend
app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:3000',
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true,
}));
```

---

## 🛑 Rate Limiting

Prevent brute-force and DoS attacks:

```javascript
const rateLimit = require('express-rate-limit');

// General limiter
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,  // 15 minutes
  max: 100,                   // 100 requests per window
  message: { error: 'Too many requests, please try again later' },
  standardHeaders: true,
  legacyHeaders: false,
});
app.use(limiter);

// Stricter limiter for auth
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,   // only 10 login attempts per 15 min
  message: { error: 'Too many login attempts' },
});
app.use('/api/auth', authLimiter);
```

---

## 💉 Injection Prevention

### SQL Injection

```javascript
// ❌ DANGEROUS — never concatenate user input into SQL
const query = `SELECT * FROM users WHERE id = ${req.params.id}`;

// ✅ SAFE — parameterized query
const result = await pool.query(
  'SELECT * FROM users WHERE id = $1',
  [req.params.id]   // input is escaped automatically
);
```

### NoSQL Injection (MongoDB)

```javascript
// ❌ DANGEROUS — attacker can pass { $gt: '' } as email
const user = await User.findOne({ email: req.body.email });

// ✅ SAFE — validate type first
const email = String(req.body.email);
if (!email.includes('@')) return res.status(400).json({ error: 'Invalid email' });
const user = await User.findOne({ email });
```

### Command Injection

```javascript
const { exec } = require('child_process');

// ❌ DANGEROUS — never pass user input to shell
exec(`convert ${req.body.filename}`, callback);

// ✅ SAFE — use execFile (no shell), or better: avoid exec entirely
const { execFile } = require('child_process');
execFile('convert', [sanitizedFilename], callback);
```

---

## ✅ Input Validation & Sanitization

```javascript
const validator = require('validator');

// Validate
app.post('/users', (req, res) => {
  const { email, name, age } = req.body;

  if (!email || !validator.isEmail(email)) {
    return res.status(400).json({ error: 'Invalid email' });
  }
  if (!name || typeof name !== 'string' || name.length > 100) {
    return res.status(400).json({ error: 'Invalid name' });
  }

  // Sanitize — normalize email
  const safeEmail = validator.normalizeEmail(email);

  // Save safely
});
```

---

## 🔐 Cryptographic Practices

```javascript
const crypto = require('crypto');

// ✅ Generate secure random tokens
const token = crypto.randomBytes(32).toString('hex');

// ✅ Hash passwords: use bcrypt (not MD5, SHA1, or plain SHA256)
const bcrypt = require('bcrypt');
const hash = await bcrypt.hash(password, 12);

// ✅ Sign JWTs with strong secret (64+ random bytes)
// node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"

// ❌ NEVER use Math.random() for security-sensitive tokens
const badToken = Math.random().toString(36);  // predictable!
```

---

## 🔏 Sensitive Data Exposure

```javascript
// ❌ Never return passwords or secrets in API responses
const user = await User.findById(id);
res.json(user);  // includes hashed password!

// ✅ Exclude sensitive fields
const user = await User.findById(id).select('-password -__v');
res.json(user);

// ✅ Use a toJSON transform in Mongoose
userSchema.methods.toJSON = function () {
  const obj = this.toObject();
  delete obj.password;
  delete obj.__v;
  return obj;
};
```

---

## 🔥 Request Body Size Limiting

```javascript
// Prevent large payload attacks
app.use(express.json({ limit: '10kb' }));
app.use(express.urlencoded({ extended: true, limit: '10kb' }));
```

---

## 🕵️ Security Logging

```javascript
const morgan = require('morgan');
const fs = require('fs');
const path = require('path');

// Log all requests to a file in production
const accessLogStream = fs.createWriteStream(
  path.join(__dirname, 'logs', 'access.log'),
  { flags: 'a' }
);

app.use(morgan('combined', { stream: accessLogStream }));

// ❌ Never log passwords, tokens, or credit card numbers
logger.info({ body: req.body });  // could expose password!

// ✅ Log only safe info
logger.info({ email: req.body.email, action: 'login_attempt' });
```

---

## 📝 Security Checklist

```
Authentication
  ✅ Hash passwords with bcrypt (rounds >= 12)
  ✅ Use HTTPS in production
  ✅ Short JWT expiry + refresh tokens
  ✅ Rate-limit login endpoints

Input / Output
  ✅ Validate all user input
  ✅ Use parameterized SQL queries
  ✅ Never return sensitive fields (passwords, secrets)
  ✅ Limit request body size

Infrastructure
  ✅ Use helmet() for security headers
  ✅ Configure CORS to specific origins
  ✅ Remove X-Powered-By: Express header
  ✅ Run npm audit regularly

Dependencies
  ✅ Keep packages up to date
  ✅ Run npm audit in CI/CD
  ✅ Don't use packages with known vulnerabilities
```

```javascript
// Remove Express fingerprint header
app.disable('x-powered-by');
// Or let helmet handle it
```

---

## 🔑 Key Takeaways

- Use `helmet()` — sets a dozen security headers in one line
- Lock CORS to specific origins — never open to `*` in production
- Always use **parameterized queries** — prevent SQL/NoSQL injection
- Rate-limit auth routes — prevent brute force
- Use `bcrypt` for passwords with at least 12 rounds
- Validate and sanitize all user input at entry points
- Run `npm audit` regularly to catch vulnerable dependencies

---

[← Previous: Authentication & JWT](16-authentication.md) | [Contents](README.md) | [Next: Best Practices & Patterns →](18-best-practices.md)
