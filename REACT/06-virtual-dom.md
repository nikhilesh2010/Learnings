# 06: Rendering & Virtual DOM

## 🎬 What is the Rendering Process?

**Rendering** is when React creates the UI and displays it on the screen. React uses a special technique called the **Virtual DOM** to do this efficiently.

---

## 🔍 The Virtual DOM Explained

### What Is It?

The **Virtual DOM** is a lightweight copy of the actual DOM kept in memory. It's React's clever way to avoid slow DOM updates.

```
React Component
    ↓
Virtual DOM (JavaScript copy)
    ↓
Compare with old Virtual DOM
    ↓
Calculate differences (Diffing)
    ↓
Update only changed parts in Real DOM
    ↓
Browser displays new UI
```

### Real DOM vs Virtual DOM

| Real DOM | Virtual DOM |
|----------|-------------|
| Actual HTML elements in browser | JavaScript representation |
| Slow to update | Fast to calculate |
| One per page | React keeps two (previous & current) |
| Updates trigger repaints/reflows | Updates are optimized |

---

## ⚡ Why Virtual DOM?

### Problem Without Virtual DOM
```javascript
// Vanilla JavaScript - manual updates (slow)
document.getElementById('name').textContent = 'John';
document.getElementById('age').textContent = 25;
document.getElementById('email').textContent = 'john@example.com';
// Each line triggers a DOM update!
```

### Solution With Virtual DOM
```javascript
// React - automatic optimization (fast)
const [user, setUser] = useState({ 
  name: 'John', 
  age: 25, 
  email: 'john@example.com' 
});

// React figures out what changed and updates only that
setUser({ ...user, name: 'Jane' });
```

---

## 🔄 The Rendering Cycle

### Phase 1: Initial Render
```
Component defined
    ↓
useState/initial values set
    ↓
JSX evaluated
    ↓
Virtual DOM created
    ↓
Real DOM updated
    ↓
UI appears on screen
```

### Phase 2: Update Trigger (when state/props change)
```
State or Props changed (setCount, prop update, etc.)
    ↓
Component function runs again
    ↓
New Virtual DOM created
    ↓
React compares: Old Virtual DOM vs New Virtual DOM
    ↓
Diffing algorithm finds differences
    ↓
Only those parts updated in Real DOM
    ↓
Browser repaints changed elements
    ↓
User sees updated UI
```

---

## 🎨 Example: How Virtual DOM Works

```javascript
function Counter() {
  const [count, setCount] = useState(0);
  
  return (
    <div>
      <h1>Count: {count}</h1>
      <button onClick={() => setCount(count + 1)}>
        Increment
      </button>
    </div>
  );
}
```

### Step-by-Step Rendering

```
Initial Render (count = 0):
┌─────────────────────────────────────┐
│ Virtual DOM:                        │
│ <div>                               │
│   <h1>Count: 0</h1>               │
│   <button>Increment</button>       │
│ </div>                              │
└─────────────────────────────────────┘
       ↓↓↓ Rendered to Real DOM ↓↓↓
┌─────────────────────────────────────┐
│ Browser shows: Count: 0             │
└─────────────────────────────────────┘

User clicks button (setCount(1)):
┌─────────────────────────────────────┐
│ Virtual DOM (NEW):                  │
│ <div>                               │
│   <h1>Count: 1</h1>              │ ← Changed
│   <button>Increment</button>       │
│ </div>                              │
└─────────────────────────────────────┘
       ↓ Only this changed ↓
       Only update <h1> in Real DOM
       ↓↓↓ Updated in Real DOM ↓↓↓
┌─────────────────────────────────────┐
│ Browser shows: Count: 1             │
└─────────────────────────────────────┘
```

**Efficiency:** Only the `<h1>` is updated, not the button!

---

## 🎯 Re-rendering Triggers

### 1. State Changes
```javascript
function Component() {
  const [count, setCount] = useState(0);
  
  // Triggers re-render
  setCount(count + 1);
}
```

### 2. Props Changes
```javascript
function Parent() {
  const [message, setMessage] = useState('Hello');
  
  return (
    <>
      <Child message={message} />
      {/* Changing message triggers re-render of Child */}
      <button onClick={() => setMessage('Hi')}>
        Change Message
      </button>
    </>
  );
}
```

### 3. Parent Re-render
```javascript
function Parent() {
  const [count, setCount] = useState(0);
  
  return (
    <>
      <p>Parent count: {count}</p>
      {/* Child re-renders whenever Parent re-renders */}
      <Child />
      <button onClick={() => setCount(count + 1)}>
        Increment Parent
      </button>
    </>
  );
}
```

---

## 📊 Component Tree Re-rendering

```
When state/props changes in Parent:

Parent (re-renders)
├── Child1 (re-renders)
│   └── GrandChild (re-renders)
├── Child2 (re-renders if props changed)
└── Child3 (re-renders)
```

**Key Point:** When parent re-renders, all children re-render too (unless optimized).

---

## ⚙️ Diffing Algorithm

React uses a smart algorithm to find differences:

### Example 1: Simple Update
```javascript
// Old Virtual DOM
<ul>
  <li>Apple</li>
  <li>Banana</li>
</ul>

// New Virtual DOM (after adding Orange)
<ul>
  <li>Apple</li>
  <li>Banana</li>
  <li>Orange</li>  ← New! Only this needs to update
</ul>

// Real DOM: Only <li>Orange</li> gets added
```

### Example 2: Using Keys
```javascript
// ❌ WITHOUT KEYS (Less efficient)
{items.map(item => <li>{item.name}</li>)}

// When you remove middle item, React might update all items!

// ✅ WITH KEYS (Efficient)
{items.map(item => <li key={item.id}>{item.name}</li>)}

// React knows which item changed and only updates that one
```

---

## 🚨 Key in Lists

### Why Keys Matter

```javascript
function TodoList() {
  const [todos, setTodos] = useState([
    { id: 1, text: 'Buy milk' },
    { id: 2, text: 'Study React' }
  ]);
  
  // ❌ Bad - no key
  return (
    <ul>
      {todos.map(todo => (
        <li>{todo.text}</li>  // Which todo is which?
      ))}
    </ul>
  );
  
  // ✅ Good - with key
  return (
    <ul>
      {todos.map(todo => (
        <li key={todo.id}>{todo.text}</li>  // Clear identity
      ))}
    </ul>
  );
}
```

**Problem Without Keys:**
- React can't know which item changed
- Might update wrong items
- Performance suffers
- Can cause bugs with input values

---

## 🎯 Practical Rendering Example

```javascript
function App() {
  const [user, setUser] = useState({ name: 'John', age: 30 });
  const [showDetails, setShowDetails] = useState(false);
  
  return (
    <div>
      <h1>{user.name}</h1>
      
      {/* Renders only when showDetails is true */}
      {showDetails && <p>Age: {user.age}</p>}
      
      <button onClick={() => setShowDetails(!showDetails)}>
        Toggle Details
      </button>
      
      <button onClick={() => setUser({ ...user, name: 'Jane' })}>
        Change Name
      </button>
    </div>
  );
}
```

### Rendering Sequence

```
1. Initial render (showDetails = false):
   ┌─────────────┐
   │ <h1>John</h1>
   │ ❌ <p> hidden
   │ [Buttons]
   └─────────────┘

2. Click "Toggle Details" (showDetails = true):
   ┌─────────────┐
   │ <h1>John</h1>
   │ ✅ <p>Age: 30</p>  ← Part added
   │ [Buttons]
   └─────────────┘

3. Click "Change Name" (name = 'Jane'):
   ┌─────────────┐
   │ <h1>Jane</h1>  ← Updated
   │ ✅ <p>Age: 30</p>
   │ [Buttons]
   └─────────────┘
```

---

## 🔑 Key Takeaways

1. **Virtual DOM** is a JavaScript representation of real DOM
2. React uses **diffing** to find what changed
3. **Only changed parts** are updated in real DOM
4. This makes React **fast and efficient**
5. Always use **keys** in lists
6. **Parent changes** trigger child re-renders
7. State/prop changes **trigger re-renders**

---

## ⚠️ Common Rendering Issues

| Problem | Solution |
|---------|----------|
| Item order changes but no diff notice | Add unique `key` prop |
| Unnecessary re-renders | Use `React.memo` or `useMemo` |
| List items lose state | Use stable `key` (not index) |
| Component re-creates on each render | Move function outside or use `useCallback` |
---

[← Previous: State & Hooks](05-state-and-hooks.md) | [Contents](README.md) | [Next: Event Handling →](07-event-handling.md)
