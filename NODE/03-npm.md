# 03: NPM & Package Management

## 📦 What is npm?

**npm** (Node Package Manager) is the world's largest software registry. It lets you install, share, and manage JavaScript packages.

```
npm comes pre-installed with Node.js
```

---

## 🚀 Getting Started

```bash
# Check versions
node --version
npm --version

# Initialize a new project (creates package.json)
npm init

# Initialize with defaults (skip questions)
npm init -y
```

---

## 📄 package.json

The heart of every Node.js project — describes the project and its dependencies.

```json
{
  "name": "my-app",
  "version": "1.0.0",
  "description": "A Node.js application",
  "main": "index.js",
  "scripts": {
    "start": "node index.js",
    "dev": "nodemon index.js",
    "test": "jest"
  },
  "dependencies": {
    "express": "^4.18.2",
    "mongoose": "^7.0.0"
  },
  "devDependencies": {
    "nodemon": "^3.0.0",
    "jest": "^29.0.0"
  }
}
```

### Dependencies vs devDependencies

| Type | Purpose | Included in Production |
|------|---------|------------------------|
| `dependencies` | Needed to **run** the app | ✅ Yes |
| `devDependencies` | Needed only to **develop** | ❌ No |

---

## 📥 Installing Packages

```bash
# Install a package (adds to dependencies)
npm install express
npm i express           # shorthand

# Install as devDependency
npm install --save-dev nodemon
npm i -D nodemon        # shorthand

# Install globally (available everywhere)
npm install -g nodemon

# Install specific version
npm install express@4.18.2

# Install all dependencies from package.json
npm install
```

---

## 🗑️ Removing Packages

```bash
# Uninstall a package
npm uninstall express
npm remove express      # same thing

# Uninstall global package
npm uninstall -g nodemon
```

---

## 🔢 Version Ranges

```json
{
  "dependencies": {
    "express": "4.18.2",   // exact version
    "express": "~4.18.2",  // patch updates (4.18.x)
    "express": "^4.18.2",  // minor updates (4.x.x)  ← most common
    "express": "*"         // any version (avoid!)
  }
}
```

**Semantic Versioning (SemVer): `MAJOR.MINOR.PATCH`**
```
1.2.3
│ │ └── PATCH: bug fixes (backwards compatible)
│ └──── MINOR: new features (backwards compatible)
└────── MAJOR: breaking changes
```

---

## 📜 npm Scripts

Define shortcuts for common commands in `package.json`:

```json
{
  "scripts": {
    "start": "node src/index.js",
    "dev": "nodemon src/index.js",
    "build": "tsc",
    "test": "jest --coverage",
    "lint": "eslint .",
    "format": "prettier --write ."
  }
}
```

```bash
# Run scripts
npm start        # "start" is special — no "run" needed
npm test         # "test" is special — no "run" needed
npm run dev      # custom scripts need "run"
npm run build
npm run lint
```

---

## 📂 node_modules & .gitignore

```javascript
// .gitignore — ALWAYS include this
node_modules/
.env
dist/
```

```bash
# node_modules can be huge — never commit it
# Anyone can restore it with:
npm install
```

---

## 🔒 package-lock.json

```
package.json      → what you want (version ranges)
package-lock.json → exact versions installed (locked)
```

- **Always commit** `package-lock.json`
- Ensures everyone on the team installs **exact same versions**
- `npm ci` installs from lock file (faster, stricter — use in CI/CD)

```bash
npm ci    # clean install from lock file (for CI/CD pipelines)
npm install  # updates lock file if needed
```

---

## 🔍 Useful npm Commands

```bash
# List installed packages
npm list
npm list --depth=0     # top-level only

# Check for outdated packages
npm outdated

# Update packages
npm update
npm update express     # update specific package

# View package info
npm info express
npm view express version

# Search for packages
npm search express

# Audit for security vulnerabilities
npm audit
npm audit fix          # auto-fix where possible

# Show what's globally installed
npm list -g --depth=0
```

---

## 🛠️ npx — Run Without Installing

**npx** runs a package from the registry without a permanent install:

```bash
# Run create-react-app without installing globally
npx create-react-app my-app

# Run a specific version
npx create-react-app@latest my-app

# Run local bin scripts
npx eslint .
```

---

## 🌟 Popular Packages to Know

| Package | Purpose |
|---------|---------|
| `express` | Web framework |
| `mongoose` | MongoDB ODM |
| `dotenv` | Environment variables |
| `nodemon` | Auto-restart on file change |
| `axios` | HTTP requests |
| `bcrypt` | Password hashing |
| `jsonwebtoken` | JWT authentication |
| `cors` | CORS headers |
| `helmet` | Security headers |
| `jest` | Testing framework |

---

## 🔑 Key Takeaways

- `npm init -y` creates a `package.json` quickly
- `npm install` (no args) restores all dependencies
- Use `^` prefix for version ranges (allows minor updates)
- `devDependencies` are for tools, not runtime code
- Never commit `node_modules/` — always add to `.gitignore`
- Commit `package-lock.json` for reproducible installs

---

[← Previous: Modules & CommonJS](02-modules.md) | [Contents](README.md) | [Next: File System →](04-file-system.md)
