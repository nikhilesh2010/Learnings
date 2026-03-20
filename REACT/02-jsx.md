# 02: JSX Basics

## 🎨 What is JSX?

**JSX** (JavaScript XML) is syntax that looks like HTML but lives in JavaScript files. It lets you write markup directly in your code.

### JSX vs Normal JavaScript

```javascript
// ❌ Without JSX
const element = React.createElement('h1', null, 'Hello World');

// ✅ With JSX
const element = <h1>Hello World</h1>;
```

Both are identical! JSX is just **syntactic sugar** - it's easier to read.

---

## 🔄 JSX Gets Compiled

JSX code gets transformed before running in the browser:

```
JSX Code
   ↓
Babel (Compiler)
   ↓
JavaScript Code
   ↓
Browser
```

**Example:**
```javascript
// JSX
const greeting = <h1>Hello {name}!</h1>;

// Compiles to:
const greeting = React.createElement('h1', null, `Hello ${name}!`);
```

---

## 💡 JSX Rules & Syntax

### Rule 1: Single Root Element
```javascript
// ❌ WRONG - Multiple root elements
return (
  <h1>Title</h1>
  <p>Content</p>
);

// ✅ CORRECT - Wrapped in one container
return (
  <div>
    <h1>Title</h1>
    <p>Content</p>
  </div>
);

// ✅ OR use Fragment (empty tag)
return (
  <>
    <h1>Title</h1>
    <p>Content</p>
  </>
);
```

### Rule 2: Use Curly Braces for JavaScript
```javascript
function Greeting() {
  const name = 'Alice';
  const age = 25;
  
  return (
    <div>
      {/* Expressions go in {} */}
      <h1>Hello {name}</h1>
      <p>Age: {age}</p>
      <p>Next year: {age + 1}</p>
      <p>Double age: {age * 2}</p>
      
      {/* Ternary operators work */}
      <p>{age >= 18 ? 'Adult' : 'Minor'}</p>
    </div>
  );
}
```

### Rule 3: className (not class)
```javascript
// ❌ WRONG
<div class="container">Content</div>

// ✅ CORRECT
<div className="container">Content</div>

// Also works with template literals
<div className={`card ${isActive ? 'active' : ''}`}>Card</div>
```

### Rule 4: Attributes are camelCase
```javascript
// ❌ WRONG - kebab-case
onClick, onmouseover, readonly

// ✅ CORRECT - camelCase
onClick, onMouseOver, readOnly
```

### Rule 5: Close All Tags
```javascript
// ❌ WRONG - Self-closing tags not closed
<input type="text">

// ✅ CORRECT
<input type="text" />
<br />

// Also fine for normal tags
<div></div>
```

---

## 🎯 Common JSX Patterns

### Embedding Expressions
```javascript
const user = {
  name: 'Bob',
  age: 30,
  hobbies: ['reading', 'coding', 'gaming']
};

function UserCard() {
  return (
    <div>
      <h1>{user.name}</h1>
      <p>Age: {user.age}</p>
      <ul>
        {user.hobbies.map(hobby => (
          <li key={hobby}>{hobby}</li>
        ))}
      </ul>
    </div>
  );
}
```

### Conditional Rendering
```javascript
function LoginStatus({ isLoggedIn }) {
  return (
    <div>
      {/* Short-circuit evaluation */}
      {isLoggedIn && <p>Welcome back!</p>}
      
      {/* Ternary operator */}
      {isLoggedIn ? (
        <button>Logout</button>
      ) : (
        <button>Login</button>
      )}
    </div>
  );
}
```

### Styling with JSX
```javascript
function StyledBox() {
  const styles = {
    container: {
      backgroundColor: 'lightblue',
      padding: '20px',
      borderRadius: '8px'
    },
    title: {
      color: 'darkblue',
      fontSize: '24px'
    }
  };
  
  return (
    <div style={styles.container}>
      <h1 style={styles.title}>Styled Content</h1>
    </div>
  );
}
```

### Dynamic Attributes
```javascript
function Button({ type = 'button', disabled = false }) {
  return (
    <button 
      type={type} 
      disabled={disabled}
      className={disabled ? 'btn-disabled' : 'btn-active'}
    >
      Click me
    </button>
  );
}
```

---

## ⚠️ Common JSX Mistakes

| ❌ Wrong | ✅ Correct |
|---------|-----------|
| `<h1>Hello</h1>{greeting}` | `<>{<h1>Hello</h1>}{greeting}</>` |
| `<div class="box">` | `<div className="box">` |
| `<img>` | `<img />` |
| `<if>{condition}</if>` | `{condition && <div>...</div>}` |
| `<p>Age: {age}</p>` if not in JSX | Must be inside JSX context |

---

## 🔑 Key Takeaways

1. JSX is **HTML-like syntax in JavaScript**
2. JSX **compiles to JavaScript** function calls
3. You **must have one root element**
4. Use **curly braces `{}`** for JavaScript expressions
5. **camelCase** for attributes like `onClick`, `className`
6. JSX is **readable** and **maintainable**
---

[← Previous: What is React?](01-introduction.md) | [Contents](README.md) | [Next: Components →](03-components.md)
