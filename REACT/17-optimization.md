# 17: Component Optimization

## ⚡ Why Optimize?

React is fast by default, but large apps can get slow due to:
- Unnecessary re-renders
- Heavy calculations
- Large lists
- Frequent updates

---

## 🎯 Problem: Unnecessary Re-renders

### Common Scenario

```javascript
function App() {
  const [count, setCount] = useState(0);
  
  return (
    <div>
      <button onClick={() => setCount(count + 1)}>Count: {count}</button>
      <ExpensiveComponent />
    </div>
  );
}

function ExpensiveComponent() {
  console.log('ExpensiveComponent rendered!');
  
  // Expensive calculation
  let result = 0;
  for (let i = 0; i < 1000000000; i++) {
    result += i;
  }
  
  return <div>Result: {result}</div>;
}
```

**Problem:** Every time count changes, `ExpensiveComponent` re-renders even though it doesn't use count!

---

## 🛡️ Solution 1: React.memo

**React.memo** prevents re-renders if props haven't changed.

```javascript
// Before: Re-renders every time
function UserCard({ user }) {
  console.log('UserCard rendered');
  return <div>{user.name}</div>;
}

// After: Only re-renders if user prop changes
const UserCard = React.memo(function UserCard({ user }) {
  console.log('UserCard rendered');
  return <div>{user.name}</div>;
});
```

### Using with Objects

```javascript
function App() {
  const [count, setCount] = useState(0);
  const user = { id: 1, name: 'John' };  // NEW object every render!
  
  return (
    <>
      <p>Count: {count}</p>
      <button onClick={() => setCount(count + 1)}>+</button>
      <UserCard user={user} />  // Re-renders every time!
    </>
  );
}
```

**Fix: Memoize the object**

```javascript
import { useMemo } from 'react';

function App() {
  const [count, setCount] = useState(0);
  
  const user = useMemo(() => ({
    id: 1,
    name: 'John'
  }), []);  // Same object reference
  
  return (
    <>
      <p>Count: {count}</p>
      <button onClick={() => setCount(count + 1)}>+</button>
      <UserCard user={user} />  // No unnecessary re-renders!
    </>
  );
}

const UserCard = React.memo(function UserCard({ user }) {
  return <div>{user.name}</div>;
});
```

### Using with Callbacks

```javascript
function App() {
  const [count, setCount] = useState(0);
  
  // NEW function every render
  const handleDelete = (id) => {
    console.log('Delete', id);
  };
  
  return (
    <>
      <p>Count: {count}</p>
      <button onClick={() => setCount(count + 1)}>+</button>
      <UserList onDelete={handleDelete} />  // Re-renders every time!
    </>
  );
}
```

**Fix: Use useCallback**

```javascript
import { useCallback } from 'react';

function App() {
  const [count, setCount] = useState(0);
  
  const handleDelete = useCallback((id) => {
    console.log('Delete', id);
  }, []);  // Same function reference
  
  return (
    <>
      <p>Count: {count}</p>
      <button onClick={() => setCount(count + 1)}>+</button>
      <UserList onDelete={handleDelete} />  // No unnecessary re-renders!
    </>
  );
}

const UserList = React.memo(function UserList({ onDelete }) {
  return <div>User list</div>;
});
```

---

## 💾 Solution 2: useMemo

**useMemo** caches expensive calculations.

```javascript
// Before: Recalculates every render
function DataAnalyzer({ numbers }) {
  const sorted = numbers.sort((a, b) => a - b);
  const average = sorted.reduce((a, b) => a + b) / sorted.length;
  
  return <p>Average: {average}</p>;
}

// After: Only recalculates when numbers change
import { useMemo } from 'react';

function DataAnalyzer({ numbers }) {
  const average = useMemo(() => {
    const sorted = numbers.sort((a, b) => a - b);
    return sorted.reduce((a, b) => a + b) / sorted.length;
  }, [numbers]);
  
  return <p>Average: {average}</p>;
}
```

---

## 📋 Optimization Checklist

### Before Optimizing
```javascript
// ✅ Fine: Simple component, no expensive calculations
function SimpleList({ items }) {
  return (
    <ul>
      {items.map(item => <li key={item.id}>{item.name}</li>)}
    </ul>
  );
}

// ✅ Fine: Component re-renders but it's fast
function Counter() {
  const [count, setCount] = useState(0);
  return <p>{count}</p>;
}
```

### After Optimization
```javascript
// ✅ Optimized: Heavy calculation
const FilteredList = React.memo(function FilteredList({ items, filter }) {
  const filtered = useMemo(() => {
    return items.filter(item => 
      item.name.toLowerCase().includes(filter)
    );
  }, [items, filter]);
  
  return (
    <ul>
      {filtered.map(item => <li key={item.id}>{item.name}</li>)}
    </ul>
  );
});

// ✅ Optimized: Using memoized callback
function App() {
  const [items, setItems] = useState([]);
  
  const handleAdd = useCallback((item) => {
    setItems(prev => [...prev, item]);
  }, []);
  
  return <FilteredList items={items} onAdd={handleAdd} />;
}
```

---

## 🔄 Optimizing Lists

### Problem: Large List Performance
```javascript
// ❌ Slow with 1000+ items
function TodoList({ todos }) {
  return (
    <ul>
      {todos.map(todo => (
        <TodoItem key={todo.id} todo={todo} />
      ))}
    </ul>
  );
}
```

### Solution: Virtualization
```javascript
// Use react-window for large lists
import { FixedSizeList } from 'react-window';

function VirtualizedTodoList({ todos }) {
  return (
    <FixedSizeList
      height={600}
      itemCount={todos.length}
      itemSize={35}
    >
      {({ index, style }) => (
        <div style={style}>
          <TodoItem todo={todos[index]} />
        </div>
      )}
    </FixedSizeList>
  );
}
```

---

## 🎯 Code Splitting & Lazy Loading

### Lazy Load Components
```javascript
import { lazy, Suspense } from 'react';

// Load component only when needed
const HeavyComponent = lazy(() => import('./HeavyComponent'));

function App() {
  const [showHeavy, setShowHeavy] = useState(false);
  
  return (
    <>
      <button onClick={() => setShowHeavy(true)}>Load Component</button>
      
      <Suspense fallback={<p>Loading...</p>}>
        {showHeavy && <HeavyComponent />}
      </Suspense>
    </>
  );
}
```

---

## 📊 Measuring Performance

### Using React DevTools Profiler

```javascript
// Mark sections for profiling
import { Profiler } from 'react';

function App() {
  const onRenderCallback = (
    id,      // ID of component
    phase,   // "mount" or "update"
    actualDuration,
    baseDuration,
    startTime,
    commitTime
  ) => {
    console.log(`${id} (${phase}) took ${actualDuration}ms`);
  };
  
  return (
    <Profiler id="App" onRender={onRenderCallback}>
      <YourApp />
    </Profiler>
  );
}
```

---

## 🚀 Performance Tips

### 1. Key in Lists
```javascript
// ❌ BAD: Using index
{items.map((item, index) => <li key={index}>{item}</li>)}

// ✅ GOOD: Using stable ID
{items.map(item => <li key={item.id}>{item}</li>)}
```

### 2. Avoid Inline Objects/Functions
```javascript
// ❌ BAD: New object every render
<Component style={{ color: 'red' }} />

// ✅ GOOD: Define outside or memoize
const style = { color: 'red' };
<Component style={style} />
```

### 3. Defer Non-Critical Updates
```javascript
import { startTransition } from 'react';

function SearchResults() {
  const [query, setQuery] = useState('');
  const results = useMemo(() => search(query), [query]);
  
  const handleChange = (e) => {
    // Update query immediately
    setQuery(e.target.value);
    
    // Update results with lower priority
    startTransition(() => {
      // Heavy computation
    });
  };
  
  return <input onChange={handleChange} />;
}
```

### 4. Use Production Build
```bash
# Development build is slow on purpose
npm run build  # Use optimized production build
```

---

## 📈 When to Optimize

```
Measure ↓ Identify Bottleneck ↓ Optimize ↓ Re-measure
```

**Don't optimize:**
- Before measuring
- Prematurely
- Components you're not sure about

**Optimize:**
- After identifying slow spots
- Heavy calculations
- Large lists
- Frequent updates

---

## ⚠️ Optimization Pitfalls

| ❌ Wrong | ✅ Right |
|---------|---------|
| Memoize everything | Memoize only if needed |
| React.memo without memoized props | Memoize props if needed |
| Premature optimization | Measure first |
| useMemo for simple values | Only for expensive operations |

---

## 🔑 Key Takeaways

1. **Measure** before optimizing
2. Use **React.memo** for expensive renders
3. Use **useMemo** for expensive calculations
4. Use **useCallback** for callback props
5. Use **proper keys** in lists
6. **Avoid inline objects/functions**
7. Use **lazy loading** for code splitting
8. Consider **virtualization** for large lists
---

[← Previous: State Management Patterns](16-state-management.md) | [Contents](README.md) | [Next: Best Practices →](18-best-practices.md)
