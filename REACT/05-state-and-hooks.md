# 05: State & Hooks

## 🎣 What are Hooks?

**Hooks** are functions that let you "hook into" React features. They allow function components to use state, lifecycle, and other React features.

**Before Hooks:** Only class components could have state  
**After Hooks:** Function components are just as powerful! ⭐

---

## 📊 State vs Props

```
┌────────────────────────────────────────┐
│         Props vs State                 │
├────────────┬──────────────────────────┤
│    Props   │        State             │
├────────────┼──────────────────────────┤
│ Read-only  │ Mutable (can change)     │
│ From parent│ Inside component         │
│ CAN'T      │ CAN be changed           │
│ modify     │ with setState/setter     │
└────────────┴──────────────────────────┘
```

---

## 🎯 useState Hook

### The Most Important Hook!

```javascript
import { useState } from 'react';

function Counter() {
  // useState returns [currentValue, functionToUpdateIt]
  const [count, setCount] = useState(0);
  //    ↑ state      ↑ setter      ↑ initial value
  
  return (
    <div>
      <p>Count: {count}</p>
      <button onClick={() => setCount(count + 1)}>
        Increment
      </button>
    </div>
  );
}
```

### How useState Works

```
Step 1: Initial Render
┌─────────────────────────────────┐
│ const [count, setCount]         │
│       = useState(0);            │
│ → count = 0                     │
└─────────────────────────────────┘

Step 2: User clicks button
┌─────────────────────────────────┐
│ setCount(count + 1)             │
│ → setCount(1)                   │
└─────────────────────────────────┘

Step 3: React Re-renders
┌─────────────────────────────────┐
│ count now equals 1              │
│ Component re-renders with new   │
│ count value                     │
└─────────────────────────────────┘
```

### Multiple State Variables

```javascript
function UserProfile() {
  const [name, setName] = useState('John');
  const [age, setAge] = useState(25);
  const [email, setEmail] = useState('john@example.com');
  
  return (
    <div>
      <p>Name: {name}</p>
      <p>Age: {age}</p>
      <p>Email: {email}</p>
      
      <button onClick={() => setName('Jane')}>Change Name</button>
      <button onClick={() => setAge(age + 1)}>Birthday</button>
    </div>
  );
}
```

### State Objects

```javascript
function UserData() {
  const [user, setUser] = useState({
    name: 'John',
    age: 25,
    email: 'john@example.com'
  });
  
  // Update a single property - MUST spread other properties
  const updateName = (newName) => {
    setUser({ ...user, name: newName });
  };
  
  const incrementAge = () => {
    setUser({ ...user, age: user.age + 1 });
  };
  
  return (
    <div>
      <p>Name: {user.name}</p>
      <p>Age: {user.age}</p>
      <p>Email: {user.email}</p>
      <button onClick={() => updateName('Jane')}>Change Name</button>
    </div>
  );
}
```

---

## 🔄 useState With Arrays

```javascript
function TodoList() {
  const [todos, setTodos] = useState([
    { id: 1, text: 'Learn React' },
    { id: 2, text: 'Build a project' }
  ]);
  
  // Add a todo
  const addTodo = (text) => {
    const newTodo = { id: Date.now(), text };
    setTodos([...todos, newTodo]);
  };
  
  // Remove a todo
  const removeTodo = (id) => {
    setTodos(todos.filter(todo => todo.id !== id));
  };
  
  // Update a todo
  const updateTodo = (id, newText) => {
    setTodos(todos.map(todo => 
      todo.id === id ? { ...todo, text: newText } : todo
    ));
  };
  
  return (
    <div>
      {todos.map(todo => (
        <div key={todo.id}>
          <p>{todo.text}</p>
          <button onClick={() => removeTodo(todo.id)}>Delete</button>
        </div>
      ))}
      <button onClick={() => addTodo('New task')}>Add Todo</button>
    </div>
  );
}
```

---

## ⚡ Updating State

### ✅ CORRECT Ways to Update State

```javascript
// 1. Direct value
setCount(5);

// 2. Using previous state (recommended for dependent updates)
setCount(prevCount => prevCount + 1);

// 3. With objects (must spread)
setUser({ ...user, name: 'Jane' });

// 4. With arrays (must spread)
setItems([...items, newItem]);
```

### ❌ WRONG Ways to Update State

```javascript
// ❌ WRONG - Direct mutation
count = 5;
user.name = 'Jane';
items.push(newItem);

// ❌ WRONG - Modifying without spread
setUser(user.name = 'Jane');  // Bad!
setUser({ ...user, name = 'Jane' });  // Bad assignment!

// ❌ WRONG - Missing spread for objects/arrays
setTodos(todos.push(newTodo));  // This returns a number, not array!
```

---

## 🎯 useState Patterns

### Pattern 1: Toggle Boolean
```javascript
function Toggle() {
  const [isOn, setIsOn] = useState(false);
  
  return (
    <>
      <p>Status: {isOn ? 'ON' : 'OFF'}</p>
      <button onClick={() => setIsOn(!isOn)}>Toggle</button>
    </>
  );
}
```

### Pattern 2: Counter
```javascript
function Counter() {
  const [count, setCount] = useState(0);
  
  return (
    <>
      <p>Count: {count}</p>
      <button onClick={() => setCount(count + 1)}>+</button>
      <button onClick={() => setCount(count - 1)}>-</button>
      <button onClick={() => setCount(0)}>Reset</button>
    </>
  );
}
```

### Pattern 3: Form Input
```javascript
function Form() {
  const [input, setInput] = useState('');
  
  const handleChange = (e) => {
    setInput(e.target.value);
  };
  
  const handleSubmit = (e) => {
    e.preventDefault();
    console.log('Submitted:', input);
    setInput('');
  };
  
  return (
    <form onSubmit={handleSubmit}>
      <input 
        value={input}
        onChange={handleChange}
        placeholder="Type something..."
      />
      <button type="submit">Submit</button>
    </form>
  );
}
```

### Pattern 4: Loading States
```javascript
function DataFetcher() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  
  const fetchData = async () => {
    setLoading(true);
    try {
      const result = await fetch('/api/data');
      setData(result);
    } catch (err) {
      setError(err);
    } finally {
      setLoading(false);
    }
  };
  
  if (loading) return <p>Loading...</p>;
  if (error) return <p>Error: {error}</p>;
  return <div>{data}</div>;
}
```

---

## 🚨 Common useState Mistakes

| ❌ Wrong | ✅ Correct |
|---------|-----------|
| `count++` | `setCount(count + 1)` |
| `setCount(count++)` | `setCount(count + 1)` |
| `user.name = 'Jane'` | `setUser({ ...user, name: 'Jane' })` |
| Multiple data in separate states | Consider useReducer for complex state |
| `useState(() => expensiveComputation())` | `useState(expensiveComputation)` (pass function, not call it) |

---

## 📋 State Rules

### Rule 1: Only Call Hooks at Top Level
```javascript
// ✅ CORRECT
function Component() {
  const [count, setCount] = useState(0);
  
  return <div>{count}</div>;
}

// ❌ WRONG - in a loop or condition
function Component() {
  if (true) {  // ❌ Inside condition
    const [count, setCount] = useState(0);
  }
}
```

### Rule 2: Only Call Hooks in React Functions
```javascript
// ✅ CORRECT - in React component
function Component() {
  const [count, setCount] = useState(0);
}

// ❌ WRONG - in regular JavaScript function
function regularFunction() {
  const [count, setCount] = useState(0);
}
```

---

## 🔑 Key Takeaways

1. **useState** is the most fundamental hook
2. State causes **re-renders** when it changes
3. Use **setter functions** to update state
4. Always **spread objects and arrays** when updating
5. Never directly **mutate state**
6. Use **previous state** for dependent updates: `prevCount => prevCount + 1`
7. State is **local to the component**

---

## 🎣 Other Hooks Preview

- **useEffect**: Side effects & lifecycle
- **useContext**: Share data across components
- **useReducer**: Complex state management
- **useRef**: Access DOM directly
- **useMemo & useCallback**: Performance optimization
---

[← Previous: Props](04-props.md) | [Contents](README.md) | [Next: Virtual DOM & Rendering →](06-virtual-dom.md)
