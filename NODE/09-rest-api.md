# 09: REST APIs

## 🌐 What is a REST API?

**REST** (Representational State Transfer) is an architectural style for building APIs using standard HTTP methods.

```
Client (Browser/App)
        ↓  HTTP Request (GET /users)
   REST API Server
        ↓  JSON Response
Client receives data
```

---

## 📋 REST Principles

| Principle | Meaning |
|-----------|---------|
| **Stateless** | Server doesn't store client state |
| **Uniform Interface** | Standard HTTP methods & URLs |
| **Client-Server** | Separation of concerns |
| **Resource-Based** | URLs represent resources (nouns, not verbs) |
| **JSON** | Standard data format |

---

## 🏷️ RESTful URL Design

```
✅ GOOD — nouns, hierarchical
GET    /users              → list all users
GET    /users/1            → get user 1
POST   /users              → create a new user
PUT    /users/1            → replace user 1 entirely
PATCH  /users/1            → partially update user 1
DELETE /users/1            → delete user 1

GET    /users/1/posts      → get posts of user 1
POST   /users/1/posts      → create a post for user 1

❌ BAD — verbs in URL
GET    /getUsers
POST   /createUser
DELETE /deleteUser/1
```

---

## 🔧 HTTP Methods & CRUD

| HTTP Method | CRUD Operation | Idempotent | Request Body |
|-------------|---------------|------------|--------------|
| `GET` | Read | ✅ Yes | ❌ No |
| `POST` | Create | ❌ No | ✅ Yes |
| `PUT` | Replace | ✅ Yes | ✅ Yes |
| `PATCH` | Update | ✅ Yes | ✅ Yes |
| `DELETE` | Delete | ✅ Yes | ❌ No |

---

## 🏗️ Building a REST API with Express

```javascript
const express = require('express');
const app = express();
app.use(express.json());

let users = [
  { id: 1, name: 'Alice', email: 'alice@example.com' },
  { id: 2, name: 'Bob',   email: 'bob@example.com' },
];
let nextId = 3;

// GET /users — list all
app.get('/users', (req, res) => {
  res.json(users);
});

// GET /users/:id — get one
app.get('/users/:id', (req, res) => {
  const user = users.find(u => u.id === parseInt(req.params.id));
  if (!user) return res.status(404).json({ error: 'User not found' });
  res.json(user);
});

// POST /users — create
app.post('/users', (req, res) => {
  const { name, email } = req.body;

  if (!name || !email) {
    return res.status(400).json({ error: 'Name and email are required' });
  }

  const newUser = { id: nextId++, name, email };
  users.push(newUser);
  res.status(201).json(newUser);
});

// PUT /users/:id — replace
app.put('/users/:id', (req, res) => {
  const idx = users.findIndex(u => u.id === parseInt(req.params.id));
  if (idx === -1) return res.status(404).json({ error: 'User not found' });

  const { name, email } = req.body;
  users[idx] = { id: users[idx].id, name, email };
  res.json(users[idx]);
});

// PATCH /users/:id — partial update
app.patch('/users/:id', (req, res) => {
  const user = users.find(u => u.id === parseInt(req.params.id));
  if (!user) return res.status(404).json({ error: 'User not found' });

  Object.assign(user, req.body);
  res.json(user);
});

// DELETE /users/:id — delete
app.delete('/users/:id', (req, res) => {
  const idx = users.findIndex(u => u.id === parseInt(req.params.id));
  if (idx === -1) return res.status(404).json({ error: 'User not found' });

  users.splice(idx, 1);
  res.status(204).send();
});

app.listen(3000);
```

---

## 📊 Response Format Standards

### Success Responses

```javascript
// Single resource
res.status(200).json({
  id: 1,
  name: 'Alice',
  email: 'alice@example.com',
});

// Collection
res.status(200).json({
  data: [...users],
  total: users.length,
  page: 1,
  limit: 10,
});

// Created resource
res.status(201).json({
  message: 'Created successfully',
  data: newUser,
});
```

### Error Responses

```javascript
// Client error (4xx)
res.status(400).json({
  error: 'Validation failed',
  details: ['Name is required', 'Email must be valid'],
});

res.status(401).json({ error: 'Unauthorized' });
res.status(403).json({ error: 'Forbidden' });
res.status(404).json({ error: 'User not found' });

// Server error (5xx)
res.status(500).json({ error: 'Internal server error' });
```

---

## 🔍 Query Parameter Patterns

```javascript
// GET /users?page=2&limit=10&sort=name&order=asc&search=alice
app.get('/users', (req, res) => {
  const {
    page = 1,
    limit = 10,
    sort = 'id',
    order = 'asc',
    search = '',
  } = req.query;

  let result = [...users];

  // Filter
  if (search) {
    result = result.filter(u =>
      u.name.toLowerCase().includes(search.toLowerCase())
    );
  }

  // Sort
  result.sort((a, b) => {
    if (order === 'asc') return a[sort] > b[sort] ? 1 : -1;
    return a[sort] < b[sort] ? 1 : -1;
  });

  // Paginate
  const start = (parseInt(page) - 1) * parseInt(limit);
  const paginated = result.slice(start, start + parseInt(limit));

  res.json({
    data: paginated,
    total: result.length,
    page: parseInt(page),
    limit: parseInt(limit),
  });
});
```

---

## ✅ Input Validation

```javascript
// Simple manual validation
app.post('/users', (req, res) => {
  const { name, email, age } = req.body;
  const errors = [];

  if (!name || typeof name !== 'string') errors.push('Name is required');
  if (!email || !email.includes('@')) errors.push('Valid email required');
  if (age !== undefined && (isNaN(age) || age < 0)) errors.push('Invalid age');

  if (errors.length > 0) {
    return res.status(400).json({ error: 'Validation failed', details: errors });
  }

  const newUser = { id: nextId++, name, email, age };
  users.push(newUser);
  res.status(201).json(newUser);
});
```

---

## 🔑 Key Takeaways

- Use **nouns** for URLs, not verbs (`/users`, not `/getUsers`)
- `GET` → read, `POST` → create, `PUT/PATCH` → update, `DELETE` → delete
- Always return appropriate **HTTP status codes** (`201`, `404`, `400`, etc.)
- Validate input and return **descriptive error messages**
- `DELETE` success = `204 No Content` (no body needed)
- `POST` success = `201 Created` with the new resource in the body

---

[← Previous: Middleware](08-middleware.md) | [Contents](README.md) | [Next: Async JavaScript →](10-async-javascript.md)
