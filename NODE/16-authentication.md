# 16: Authentication & JWT

## 🔐 Authentication vs Authorization

| Concept | Question | Example |
|---------|----------|---------|
| **Authentication** | Who are you? | Login with email + password |
| **Authorization** | What can you do? | Only admins can delete users |

---

## 🍪 Session vs Token (JWT)

| | Sessions | JWT Tokens |
|--|---------|-----------|
| Storage | Server-side (DB/cache) | Client-side (localStorage/cookie) |
| Scalability | Harder (shared store needed) | Easy (stateless) |
| Revocation | Easy | Hard (need a blacklist) |
| Common for | Traditional web apps | APIs, SPAs, mobile |

---

## 🔑 How JWT Works

```
1. User sends email + password
2. Server validates credentials
3. Server creates a signed JWT: { userId: 1, role: 'admin' }
4. Client stores the token
5. Client sends token in every request: Authorization: Bearer <token>
6. Server verifies signature — no DB lookup needed
```

```
JWT = Header.Payload.Signature
  Header:    { alg: "HS256", typ: "JWT" }
  Payload:   { userId: 1, email: "alice@...", iat: ..., exp: ... }
  Signature: HMACSHA256(base64Header + base64Payload, SECRET_KEY)
```

---

## 📦 Packages

```bash
npm install bcrypt jsonwebtoken
```

---

## 🔒 Password Hashing with bcrypt

**Never store plain-text passwords!**

```javascript
const bcrypt = require('bcrypt');

// Hash a password (at registration)
async function hashPassword(plainPassword) {
  const saltRounds = 12;  // higher = slower & more secure
  const hash = await bcrypt.hash(plainPassword, saltRounds);
  return hash;
}

// Verify password (at login)
async function checkPassword(plainPassword, hash) {
  const match = await bcrypt.compare(plainPassword, hash);
  return match; // true or false
}

// Usage
const hash = await hashPassword('myPassword123');
console.log(hash); // $2b$12$...

const valid = await checkPassword('myPassword123', hash);
console.log(valid); // true
```

---

## 🎫 Creating & Verifying JWTs

```javascript
const jwt = require('jsonwebtoken');
const SECRET = process.env.JWT_SECRET;

// Sign a token (at login)
function generateToken(user) {
  return jwt.sign(
    { userId: user._id, email: user.email, role: user.role },
    SECRET,
    { expiresIn: '7d' }
  );
}

// Verify a token (in middleware)
function verifyToken(token) {
  return jwt.verify(token, SECRET); // throws if invalid/expired
}
```

---

## 🔑 Auth Routes (Register & Login)

```javascript
const express = require('express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const asyncHandler = require('../utils/asyncHandler');

const router = express.Router();

// POST /api/auth/register
router.post('/register', asyncHandler(async (req, res) => {
  const { name, email, password } = req.body;

  if (!name || !email || !password) {
    return res.status(400).json({ error: 'All fields required' });
  }

  const exists = await User.findOne({ email });
  if (exists) return res.status(400).json({ error: 'Email already in use' });

  const hashedPassword = await bcrypt.hash(password, 12);
  const user = await User.create({ name, email, password: hashedPassword });

  const token = jwt.sign(
    { userId: user._id, role: user.role },
    process.env.JWT_SECRET,
    { expiresIn: '7d' }
  );

  res.status(201).json({
    message: 'Registered successfully',
    token,
    user: { id: user._id, name: user.name, email: user.email },
  });
}));

// POST /api/auth/login
router.post('/login', asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password required' });
  }

  const user = await User.findOne({ email }).select('+password');
  if (!user) return res.status(401).json({ error: 'Invalid credentials' });

  const valid = await bcrypt.compare(password, user.password);
  if (!valid) return res.status(401).json({ error: 'Invalid credentials' });

  const token = jwt.sign(
    { userId: user._id, role: user.role },
    process.env.JWT_SECRET,
    { expiresIn: '7d' }
  );

  res.json({
    token,
    user: { id: user._id, name: user.name, email: user.email },
  });
}));

module.exports = router;
```

---

## 🛡️ Auth Middleware

```javascript
// middleware/auth.js
const jwt = require('jsonwebtoken');

const requireAuth = (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'No token provided' });
  }

  const token = authHeader.split(' ')[1];

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded; // { userId, role, iat, exp }
    next();
  } catch (err) {
    if (err.name === 'TokenExpiredError') {
      return res.status(401).json({ error: 'Token expired' });
    }
    return res.status(401).json({ error: 'Invalid token' });
  }
};

// Role-based access control
const requireRole = (...roles) => (req, res, next) => {
  if (!roles.includes(req.user.role)) {
    return res.status(403).json({ error: 'Forbidden' });
  }
  next();
};

module.exports = { requireAuth, requireRole };
```

```javascript
// Using the middleware in routes
const { requireAuth, requireRole } = require('../middleware/auth');

// Protected route — any authenticated user
router.get('/profile', requireAuth, (req, res) => {
  res.json({ user: req.user });
});

// Admin only
router.delete('/users/:id', requireAuth, requireRole('admin'), asyncHandler(async (req, res) => {
  await User.findByIdAndDelete(req.params.id);
  res.status(204).send();
}));
```

---

## 🔄 Refresh Tokens Pattern

```javascript
// Access token: short-lived (15 min)
const accessToken = jwt.sign({ userId }, SECRET, { expiresIn: '15m' });

// Refresh token: long-lived (7d), stored in DB
const refreshToken = jwt.sign({ userId }, REFRESH_SECRET, { expiresIn: '7d' });

// POST /api/auth/refresh
router.post('/refresh', asyncHandler(async (req, res) => {
  const { refreshToken } = req.body;
  const decoded = jwt.verify(refreshToken, process.env.REFRESH_SECRET);

  // Check if refresh token is in DB (revocation check)
  const stored = await Token.findOne({ token: refreshToken, userId: decoded.userId });
  if (!stored) return res.status(401).json({ error: 'Invalid refresh token' });

  const newAccessToken = jwt.sign({ userId: decoded.userId }, SECRET, { expiresIn: '15m' });
  res.json({ accessToken: newAccessToken });
}));
```

---

## 🔑 Key Takeaways

- **Never** store plain-text passwords — always use `bcrypt.hash()`
- Use `jwt.sign()` to create tokens, `jwt.verify()` to validate
- Send tokens as `Authorization: Bearer <token>` in headers
- Auth middleware attaches `req.user` for downstream handlers
- Use short-lived **access tokens** + long-lived **refresh tokens** in production
- Always return `'Invalid credentials'` (not "wrong password") — never hint which field is wrong

---

[← Previous: Database Integration](15-database.md) | [Contents](README.md) | [Next: Security Best Practices →](17-security.md)
