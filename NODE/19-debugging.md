# 19: Debugging & Performance

## 🐛 Debugging Node.js

### console methods

```javascript
console.log('Basic log');
console.error('Error message');   // goes to stderr
console.warn('Warning');
console.info('Info');
console.table([{ id: 1, name: 'Alice' }, { id: 2, name: 'Bob' }]);
console.dir(obj, { depth: 5 });   // deep inspect
console.time('label');            // start timer
console.timeEnd('label');         // end timer → logs elapsed ms
console.trace('trace point');     // prints call stack
```

---

## 🔍 Node.js Built-in Debugger

```bash
# Start with inspector
node --inspect app.js
node --inspect-brk app.js   # pause at first line

# Open Chrome DevTools:
# Go to: chrome://inspect
# Click "Open dedicated DevTools for Node"
```

---

## 🧰 VS Code Debugger

Create `.vscode/launch.json`:

```json
{
  "version": "0.2.0",
  "configurations": [
    {
      "type": "node",
      "request": "launch",
      "name": "Debug App",
      "skipFiles": ["<node_internals>/**"],
      "program": "${workspaceFolder}/src/server.js",
      "envFile": "${workspaceFolder}/.env"
    },
    {
      "type": "node",
      "request": "attach",
      "name": "Attach to Process",
      "port": 9229
    }
  ]
}
```

> Set breakpoints by clicking the gutter in VS Code, then press `F5` to start debugging.

---

## 📊 Logging with Winston

```bash
npm install winston
```

```javascript
// utils/logger.js
const winston = require('winston');

const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.errors({ stack: true }),
    process.env.NODE_ENV === 'production'
      ? winston.format.json()
      : winston.format.colorize({ all: true }),
    winston.format.printf(({ level, message, timestamp, stack }) =>
      stack
        ? `${timestamp} ${level}: ${message}\n${stack}`
        : `${timestamp} ${level}: ${message}`
    )
  ),
  transports: [
    new winston.transports.Console(),
    new winston.transports.File({ filename: 'logs/error.log', level: 'error' }),
    new winston.transports.File({ filename: 'logs/combined.log' }),
  ],
});

module.exports = logger;

// Usage
const logger = require('./utils/logger');
logger.info('Server started');
logger.warn('Low memory');
logger.error('DB connection failed', { error: err.message });
```

---

## 📡 HTTP Logging with Morgan

```javascript
const morgan = require('morgan');

// Development: colored, concise
app.use(morgan('dev'));

// Production: Apache combined log format
app.use(morgan('combined'));

// Custom format
app.use(morgan(':method :url :status :res[content-length] - :response-time ms'));
```

---

## ⚡ Performance Profiling

### Built-in CPU Profiler

```bash
# Run app with profiler
node --prof app.js

# Load test (in another terminal)
# (run your benchmark / test traffic)

# Process the profiling output
node --prof-process isolate-*.log > profile.txt
```

### Measuring Execution Time

```javascript
// Quick timing
console.time('operation');
await heavyOperation();
console.timeEnd('operation');  // operation: 234.567ms

// High-resolution timing
const { performance } = require('perf_hooks');
const start = performance.now();
await heavyOperation();
const end = performance.now();
console.log(`Took ${(end - start).toFixed(2)}ms`);
```

---

## 🧠 Memory Usage

```javascript
// Check current memory
const mem = process.memoryUsage();
console.log({
  rss: `${Math.round(mem.rss / 1024 / 1024)}MB`,       // total memory
  heap: `${Math.round(mem.heapUsed / 1024 / 1024)}MB`, // JS heap used
  heapTotal: `${Math.round(mem.heapTotal / 1024 / 1024)}MB`,
});

// Monitor over time
setInterval(() => {
  const { heapUsed } = process.memoryUsage();
  console.log(`Heap: ${Math.round(heapUsed / 1024 / 1024)}MB`);
}, 10000);
```

---

## 🚀 Performance Tips

### 1. Use Async Patterns

```javascript
// ❌ Sequential — slow
const user = await getUser(id);
const posts = await getPosts(id);
const comments = await getComments(id);

// ✅ Parallel — fast
const [user, posts, comments] = await Promise.all([
  getUser(id),
  getPosts(id),
  getComments(id),
]);
```

### 2. Cache Expensive Operations

```javascript
const NodeCache = require('node-cache');
const cache = new NodeCache({ stdTTL: 600 }); // 10 min default

async function getExpensiveData(key) {
  const cached = cache.get(key);
  if (cached) return cached;

  const data = await expensiveDBQuery();
  cache.set(key, data);
  return data;
}
```

### 3. DB Indexes (MongoDB example)

```javascript
// Add indexes to frequently queried fields
userSchema.index({ email: 1 });          // single field
userSchema.index({ role: 1, name: 1 });  // compound
userSchema.index({ createdAt: -1 });     // for date sorting
```

### 4. Pagination — Never Return All Records

```javascript
// ❌ Never do this on large collections
const allUsers = await User.find();

// ✅ Always paginate
const page = parseInt(req.query.page) || 1;
const limit = parseInt(req.query.limit) || 20;
const skip = (page - 1) * limit;

const users = await User.find().skip(skip).limit(limit);
```

---

## 🔧 Common Debug Scenarios

### "Cannot read property of undefined"

```javascript
// Check the chain for nulls
const name = user?.profile?.name ?? 'Unknown';
// Optional chaining (?.) prevents crashing
```

### "EADDRINUSE: address already in use"

```powershell
# Find what's using port 3000
netstat -ano | findstr :3000
# Kill it by PID
taskkill /PID <pid> /F
```

### "UnhandledPromiseRejection"

```javascript
// Always catch async errors
app.get('/route', async (req, res) => {
  try {
    await something();
  } catch (err) {
    next(err);  // don't forget this!
  }
});
// Or use asyncHandler wrapper
```

---

## 🏎️ Clustering for Multi-core Performance

```javascript
const cluster = require('cluster');
const os = require('os');
const numCPUs = os.cpus().length;

if (cluster.isPrimary) {
  console.log(`Primary ${process.pid} running`);

  // Fork a worker per CPU core
  for (let i = 0; i < numCPUs; i++) {
    cluster.fork();
  }

  cluster.on('exit', (worker) => {
    console.log(`Worker ${worker.process.pid} died — restarting`);
    cluster.fork();
  });
} else {
  // Each worker runs the Express server
  require('./app').listen(3000);
  console.log(`Worker ${process.pid} started`);
}
```

---

## 🔑 Key Takeaways

- Use VS Code debugger with breakpoints instead of `console.log` spam
- Use **Winston** for structured, leveled logging in production
- Use `console.time()` / `performance.now()` to measure performance
- Always **paginate** database queries — never return all records
- Use `Promise.all()` for parallel queries instead of sequential `await`
- Run `node --inspect` and open `chrome://inspect` for full DevTools debugging

---

[← Previous: Best Practices & Patterns](18-best-practices.md) | [Contents](README.md)
