# 03: Components

## 🧩 What are Components?

Components are **reusable pieces of UI** that encapsulate structure, style, and behavior. They're the building blocks of React applications.

Think of components like **LEGO blocks** - you build them once and reuse them everywhere.

---

## 📍 Two Types of Components

### **1. Function Components** (Modern Approach ⭐)

```javascript
function Welcome() {
  return <h1>Hello from a Function Component!</h1>;
}

export default Welcome;
```

**Characteristics:**
- ✅ Just a JavaScript function
- ✅ Returns JSX
- ✅ Can use Hooks (useState, useEffect, etc.)
- ✅ Preferred way to write React today

### **2. Class Components** (Legacy)

```javascript
import React from 'react';

class Welcome extends React.Component {
  render() {
    return <h1>Hello from a Class Component!</h1>;
  }
}

export default Welcome;
```

**Characteristics:**
- 📦 More verbose
- 📦 Extends React.Component
- 📦 Uses `render()` method
- 📦 Harder to work with lifecycle
- ⚠️ Still supported but not recommended for new code

**Focus:** We'll use function components (modern approach)

---

## 🎨 Component Anatomy

```javascript
// 1. Import dependencies
import React, { useState } from 'react';

// 2. Define component function
function Greeting({ name }) {
  // 3. State and logic
  const [count, setCount] = useState(0);
  
  // 4. Handlers/functions
  const handleClick = () => {
    setCount(count + 1);
  };
  
  // 5. Return JSX
  return (
    <div>
      <h1>Hello {name}!</h1>
      <p>Button clicked {count} times</p>
      <button onClick={handleClick}>Click me</button>
    </div>
  );
}

// 6. Export component
export default Greeting;
```

---

## 🎯 Component Naming & Organization

### Rule 1: PascalCase for Components
```javascript
// ✅ CORRECT component names
function UserProfile() { }
function ShoppingCart() { }
class DataTable extends React.Component { }

// ❌ WRONG - lowercase means it's a regular HTML element
function userProfile() { }
function shopping_cart() { }
```

### Rule 2: File Structure
```
src/
├── components/
│   ├── Header.js
│   ├── Footer.js
│   ├── Button.js
│   └── UserCard.js
├── pages/
│   ├── Home.js
│   └── About.js
└── App.js
```

---

## 🔄 Reusing Components

### Creating Reusable Components

```javascript
// UserCard.js - Reusable component
function UserCard({ name, age, job }) {
  return (
    <div className="user-card">
      <h2>{name}</h2>
      <p>Age: {age}</p>
      <p>Job: {job}</p>
    </div>
  );
}

export default UserCard;
```

### Using Components Everywhere

```javascript
// App.js - Reusing UserCard multiple times
function App() {
  return (
    <div>
      <UserCard name="Alice" age={25} job="Engineer" />
      <UserCard name="Bob" age={30} job="Designer" />
      <UserCard name="Carol" age={28} job="Manager" />
    </div>
  );
}

export default App;
```

**Result:** Same component, different data = powerful reusability!

---

## 🎭 Component Composition

You can **nest components inside other components** to build complex UIs.

### Simple Example

```javascript
// Small reusable components
function Avatar({ src }) {
  return <img src={src} alt="avatar" />;
}

function UserInfo({ name, status }) {
  return (
    <div>
      <h3>{name}</h3>
      <p>{status}</p>
    </div>
  );
}

// Composition: combine smaller components
function UserProfile({ name, status, avatar }) {
  return (
    <div className="profile">
      <Avatar src={avatar} />
      <UserInfo name={name} status={status} />
    </div>
  );
}
```

### Real-World Example

```javascript
function Article({ title, content, author, date }) {
  return (
    <article>
      <ArticleHeader title={title} author={author} date={date} />
      <ArticleBody content={content} />
      <ArticleFooter author={author} />
    </article>
  );
}

// The header is its own component
function ArticleHeader({ title, author, date }) {
  return (
    <header>
      <h1>{title}</h1>
      <p>By {author} on {date}</p>
    </header>
  );
}

function ArticleBody({ content }) {
  return <main>{content}</main>;
}

function ArticleFooter({ author }) {
  return <footer>Published by {author}</footer>;
}
```

---

## 🎨 Props vs State

### Props: Parent → Child Data
```javascript
function Welcome({ name, age }) {  // name, age are Props
  return <h1>Hello {name}, {age}!</h1>;
}

// Parent passes props
<Welcome name="John" age={25} />
```

### State: Component's Own Data
```javascript
function Counter() {
  const [count, setCount] = useState(0);  // count is State
  
  return (
    <div>
      <p>Count: {count}</p>
      <button onClick={() => setCount(count + 1)}>+</button>
    </div>
  );
}
```

**Key Difference:**
| Props | State |
|-------|-------|
| Passed FROM parent TO child | Owned BY component |
| Read-only | Can be changed |
| Cannot be modified by child | Modified with setter |

---

## 📊 Component Hierarchy Example

```
App
├── Header
│   ├── Logo
│   └── Navigation
├── MainContent
│   ├── ArticleList
│   │   └── ArticleCard (×3)
│   └── Sidebar
│       └── Advertisement
└── Footer
```

Each box = **one component**

---

## ⚠️ Common Mistakes

| ❌ Wrong | ✅ Correct |
|---------|-----------|
| `function welcome()` | `function Welcome()` |
| Modifying props inside child | Using state for mutable data |
| Component functions with no return | Always return JSX or null |
| Props.name instead of destructuring | `function Card({ name })` |

---

## 🔑 Key Takeaways

1. Components are **reusable UI blocks**
2. Use **function components** (modern)
3. Name components with **PascalCase**
4. **Props** flow down from parent
5. **State** is internal to component
6. **Compose** small components into larger ones
7. Components are just **JavaScript functions**
---

[← Previous: JSX Basics](02-jsx.md) | [Contents](README.md) | [Next: Props →](04-props.md)
