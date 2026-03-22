# 37: Tooling

## 📦 Package Managers

```bash
# npm (Node Package Manager — comes with Node.js)
npm init -y                    # create package.json
npm install react              # install runtime dependency
npm install -D vite            # install dev dependency
npm install                    # install from package.json
npm uninstall react
npm update
npm run dev                    # run script from package.json
npm list                       # list installed packages
npm audit                      # check for vulnerabilities
npm audit fix                  # auto-fix vulnerabilities

# yarn (alternative, fast)
yarn add react
yarn add -D vite
yarn install
yarn dev

# pnpm (disk-space efficient, fast)
pnpm add react
pnpm add -D vite
pnpm install
pnpm dev

# npx — run package without global install
npx create-vite my-app
npx prettier --write .
```

```json
// package.json scripts
{
  "scripts": {
    "dev":    "vite",
    "build":  "vite build",
    "preview": "vite preview",
    "test":   "vitest",
    "lint":   "eslint src --ext .js,.jsx --fix",
    "format": "prettier --write src",
    "typecheck": "tsc --noEmit"
  }
}
```

---

## ⚡ Vite (Build Tool)

The modern bundler for development and production.

```bash
# Create project
npm create vite@latest my-app -- --template vanilla
npm create vite@latest my-app -- --template react
cd my-app && npm install && npm run dev
```

```js
// vite.config.js
import { defineConfig } from "vite";

export default defineConfig({
  root: "src",          // source directory
  build: {
    outDir: "../dist",
    target: "es2020",
    minify: "esbuild",  // or "terser"
    rollupOptions: {
      input: { main: "src/index.html", admin: "src/admin.html" },
    },
  },
  server: {
    port: 3000,
    proxy: {
      "/api": "http://localhost:8000",  // proxy API calls
    },
  },
  resolve: {
    alias: { "@": "/src" },  // import from "@/utils/..." instead of "../../utils/..."
  },
  plugins: [
    // viteReact(), viteSvgr(), etc.
  ],
});
```

### Vite Features

```js
// Hot Module Replacement (HMR) — updates without full page reload
if (import.meta.hot) {
  import.meta.hot.accept((newModule) => {
    // handle update
  });
}

// Environment variables — prefix with VITE_
// .env
// VITE_API_URL=https://api.example.com
import.meta.env.VITE_API_URL;
import.meta.env.MODE;       // "development" or "production"
import.meta.env.DEV;        // boolean
import.meta.env.PROD;       // boolean

// Static imports
import logo from "./logo.png";           // resolved URL string
import styles from "./styles.module.css"; // CSS modules
```

---

## 📦 Webpack (Older but Common)

```js
// webpack.config.js
const path = require("path");
const HtmlPlugin = require("html-webpack-plugin");

module.exports = {
  entry: "./src/index.js",
  output: {
    filename: "[name].[contenthash].js",
    path: path.resolve(__dirname, "dist"),
    clean: true,
  },
  module: {
    rules: [
      {
        test: /\.jsx?$/,
        use: "babel-loader",
        exclude: /node_modules/,
      },
      {
        test: /\.css$/,
        use: ["style-loader", "css-loader"],
      },
    ],
  },
  plugins: [new HtmlPlugin({ template: "./src/index.html" })],
  resolve: { extensions: [".js", ".jsx"] },
  optimization: {
    splitChunks: { chunks: "all" },  // code splitting
  },
};
```

---

## 🔄 Babel (JavaScript Transpiler)

Converts modern JS to compatible older versions.

```bash
npm install -D @babel/core @babel/cli @babel/preset-env
```

```json
// babel.config.json
{
  "presets": [
    ["@babel/preset-env", {
      "targets": "> 0.25%, not dead",
      "useBuiltIns": "usage",    // auto-add polyfills
      "corejs": 3
    }],
    "@babel/preset-react",       // JSX
    "@babel/preset-typescript"   // TypeScript
  ],
  "plugins": [
    "@babel/plugin-proposal-decorators"
  ]
}
```

> **Note**: Vite uses **esbuild** for transpiling (much faster than Babel). Babel is mainly needed for legacy projects or advanced transforms.

---

## 🔍 ESLint (Linting)

Catches errors and enforces code style.

```bash
npm install -D eslint
npx eslint --init
```

```js
// eslint.config.js (ESLint 9+ flat config)
import js from "@eslint/js";
import globals from "globals";

export default [
  js.configs.recommended,
  {
    files: ["**/*.js"],
    languageOptions: {
      globals: { ...globals.browser, ...globals.node },
      ecmaVersion: "latest",
      sourceType: "module",
    },
    rules: {
      "no-console":      "warn",
      "no-unused-vars":  "error",
      "no-var":          "error",
      "prefer-const":    "error",
      "eqeqeq":          "error",
      "no-eval":         "error",
      "curly":           "error",
    },
  },
];
```

```bash
npx eslint src                   # check
npx eslint src --fix             # auto-fix where possible
```

---

## 💅 Prettier (Code Formatter)

```bash
npm install -D prettier
```

```json
// .prettierrc
{
  "semi":         true,
  "singleQuote":  false,
  "tabWidth":     2,
  "trailingComma": "all",
  "printWidth":   100,
  "arrowParens":  "always"
}
```

```bash
npx prettier --write "src/**/*.{js,ts,jsx,tsx,css,json,md}"
npx prettier --check "src/**/*.js"   # CI check only
```

```json
// package.json — run both on each commit
{
  "lint-staged": {
    "*.{js,jsx,ts,tsx}": ["eslint --fix", "prettier --write"],
    "*.{css,json,md}": ["prettier --write"]
  }
}
```

---

## 🪝 Husky & lint-staged (Git Hooks)

```bash
npm install -D husky lint-staged
npx husky init
```

```bash
# .husky/pre-commit
npx lint-staged
```

```json
// package.json
{
  "lint-staged": {
    "*.{js,ts}": ["eslint --fix", "prettier --write", "vitest related --run"]
  }
}
```

---

## 📂 TypeScript (Type Checking)

```bash
npm install -D typescript
npx tsc --init         # creates tsconfig.json
```

```json
// tsconfig.json
{
  "compilerOptions": {
    "target":    "ES2020",
    "module":    "ESNext",
    "moduleResolution": "bundler",
    "strict":    true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "outDir":    "./dist",
    "rootDir":   "./src",
    "lib":       ["DOM", "ESNext"]
  },
  "include": ["src"],
  "exclude": ["node_modules", "dist"]
}
```

```bash
npx tsc                 # compile
npx tsc --noEmit        # type-check only (no output files)
npx tsc --watch         # watch mode
```

---

## 🔑 Key Takeaways

- **Vite** is the modern build tool: instant dev server with HMR, fast production builds.
- **npm / pnpm / yarn** manage dependencies; `npm run <script>` runs tasks.
- **ESLint** catches bugs and enforces rules; **Prettier** formats consistently.
- Run both on every commit via **Husky** pre-commit hooks + **lint-staged**.
- **Babel** transpiles modern JS; rarely needed with Vite (which uses esbuild).
- **TypeScript** adds static types — use `tsc --noEmit` in CI for type checking.
- `import.meta.env.VITE_*` for environment variables in Vite projects.
- `vite.config.js` allows path aliases (`@` → `/src`), proxies, and plugins.

---

[← Previous: Testing (Jest / Vitest)](42-testing.md) | [Contents](README.md) | [Next: Security →](44-security.md)
