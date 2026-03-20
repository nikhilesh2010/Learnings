# 15: Other Important Hooks

## 🎯 useRef Hook

### What is useRef?

**useRef** creates a reference to a DOM element or stores a mutable value that persists across renders without causing re-renders.

```javascript
const ref = useRef(initialValue);
// ref.current = the actual value
```

---

## 📌 useRef Use Cases

### 1. Access DOM Elements Directly

```javascript
function TextInput() {
  const inputRef = useRef(null);
  
  const focusInput = () => {
    inputRef.current.focus();
  };
  
  return (
    <>
      <input ref={inputRef} />
      <button onClick={focusInput}>Focus Input</button>
    </>
  );
}
```

### 2. Storing Previous Values

```javascript
function Timer() {
  const intervalRef = useRef(null);
  const [seconds, setSeconds] = useState(0);
  
  const startTimer = () => {
    // Store interval ID to clear it later
    intervalRef.current = setInterval(() => {
      setSeconds(s => s + 1);
    }, 1000);
  };
  
  const stopTimer = () => {
    clearInterval(intervalRef.current);
  };
  
  return (
    <>
      <p>Time: {seconds}s</p>
      <button onClick={startTimer}>Start</button>
      <button onClick={stopTimer}>Stop</button>
    </>
  );
}
```

### 3. Mutable Value That Doesn't Cause Re-render

```javascript
function Stopwatch() {
  const startTimeRef = useRef(null);
  const [elapsed, setElapsed] = useState(0);
  
  const handleStart = () => {
    startTimeRef.current = Date.now() - elapsed;
  };
  
  const handleStop = () => {
    setElapsed(Date.now() - startTimeRef.current);
  };
  
  return (
    <>
      <p>Elapsed: {elapsed}ms</p>
      <button onClick={handleStart}>Start</button>
      <button onClick={handleStop}>Stop</button>
    </>
  );
}
```

### 4. Video/Audio Control

```javascript
function VideoPlayer() {
  const videoRef = useRef(null);
  
  const play = () => {
    videoRef.current.play();
  };
  
  const pause = () => {
    videoRef.current.pause();
  };
  
  return (
    <>
      <video ref={videoRef} src="video.mp4" />
      <button onClick={play}>Play</button>
      <button onClick={pause}>Pause</button>
    </>
  );
}
```

---

## ⚠️ useRef vs useState

| useState | useRef |
|----------|--------|
| Updates trigger re-render | No re-renders |
| Good for display state | Good for storing values |
| Use for UI changes | Use for DOM access |
| Value is read-only | Value is mutable |

---

## 🎨 useMemo Hook

### What is useMemo?

**useMemo** memoizes a value and only recalculates it when dependencies change. Useful for expensive calculations.

```javascript
const memoizedValue = useMemo(() => {
  return expensiveCalculation(a, b);
}, [a, b]);  // Only recalculate when a or b changes
```

### Example: Expensive Calculation

```javascript
function DataProcessor({ numbers }) {
  // Without useMemo - recalculates every render
  const sorted = numbers.sort((a, b) => a - b);
  const filtered = sorted.filter(n => n > 5);
  const sum = filtered.reduce((a, b) => a + b, 0);
  
  return <p>Sum: {sum}</p>;
}

// With useMemo - only when numbers change
function OptimizedDataProcessor({ numbers }) {
  const sum = useMemo(() => {
    const sorted = numbers.sort((a, b) => a - b);
    const filtered = sorted.filter(n => n > 5);
    return filtered.reduce((a, b) => a + b, 0);
  }, [numbers]);  // Only recalculate when numbers changes
  
  return <p>Sum: {sum}</p>;
}
```

### Memoizing Objects

```javascript
function ExpensiveComponent({ data }) {
  // Without memoization - new object every render
  const filterConfig = {
    category: data.category,
    minPrice: data.minPrice,
    maxPrice: data.maxPrice
  };
  
  return <ChildComponent config={filterConfig} />;
}

// With memoization - same object if data hasn't changed
import { useMemo } from 'react';

function OptimizedComponent({ data }) {
  const filterConfig = useMemo(() => ({
    category: data.category,
    minPrice: data.minPrice,
    maxPrice: data.maxPrice
  }), [data.category, data.minPrice, data.maxPrice]);
  
  return <ChildComponent config={filterConfig} />;
}
```

---

## ⚡ useCallback Hook

### What is useCallback?

**useCallback** memoizes a function and returns the same function reference if dependencies haven't changed.

```javascript
const memoizedCallback = useCallback(() => {
  doSomething(a, b);
}, [a, b]);
```

### Why useCallback?

Prevents child components from unnecessary re-renders when they receive function props.

```javascript
function Parent() {
  const [count, setCount] = useState(0);
  
  // Without useCallback - new function every render
  const handleClick = () => {
    console.log('Clicked');
  };
  
  // Child will re-render even if nothing changed!
  return <Child onClick={handleClick} />;
}

// With useCallback - same function if deps haven't changed
import { useCallback } from 'react';

function ParentOptimized() {
  const [count, setCount] = useState(0);
  
  const handleClick = useCallback(() => {
    console.log('Clicked');
  }, []);  // No dependencies = always same function
  
  return <ChildOptimized onClick={handleClick} />;
}
```

### With Dependencies

```javascript
function SearchComponent() {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  
  // This function changes when query changes
  const handleSearch = useCallback(() => {
    fetch(`/api/search?q=${query}`)
      .then(res => res.json())
      .then(data => setResults(data));
  }, [query]);  // Re-create function when query changes
  
  return (
    <>
      <input value={query} onChange={(e) => setQuery(e.target.value)} />
      <button onClick={handleSearch}>Search</button>
      <Results data={results} />
    </>
  );
}
```

---

## 🎯 React.memo + useCallback

```javascript
// Child component
const SearchList = React.memo(({ onSearch, items }) => {
  console.log('SearchList re-rendered');
  return (
    <>
      <button onClick={onSearch}>Search</button>
      <ul>
        {items.map(item => <li key={item.id}>{item.name}</li>)}
      </ul>
    </>
  );
});

// Parent component
function App() {
  const [count, setCount] = useState(0);
  const [items, setItems] = useState([]);
  
  // Without useCallback - SearchList re-renders on every count change
  // const handleSearch = () => { /* ... */ };
  
  // With useCallback - SearchList only re-renders if items change
  const handleSearch = useCallback(() => {
    fetch('/api/items')
      .then(res => res.json())
      .then(data => setItems(data));
  }, []);
  
  return (
    <>
      <p>Count: {count}</p>
      <button onClick={() => setCount(count + 1)}>+</button>
      <SearchList onSearch={handleSearch} items={items} />
    </>
  );
}
```

---

## 📚 useLayoutEffect

**useLayoutEffect** runs synchronously AFTER the DOM updates but BEFORE the browser paints.

```javascript
useLayoutEffect(() => {
  // Runs after DOM updates, before paint
  // Good for measuring DOM elements
}, []);
```

### Difference from useEffect

```javascript
// useEffect - runs AFTER paint
useEffect(() => {
  element.style.color = 'red';  // Might flicker
}, []);

// useLayoutEffect - runs BEFORE paint
useLayoutEffect(() => {
  element.style.color = 'red';  // No flicker
}, []);
```

### Use Case: Measuring Elements

```javascript
function Tooltip() {
  const [top, setTop] = useState(0);
  const elementRef = useRef(null);
  
  useLayoutEffect(() => {
    if (elementRef.current) {
      const rect = elementRef.current.getBoundingClientRect();
      setTop(rect.top);
    }
  }, []);
  
  return (
    <div ref={elementRef} style={{ top }}>
      Tooltip
    </div>
  );
}
```

---

## 🔍 useId Hook

**useId** generates unique IDs for elements (useful for forms and accessibility).

```javascript
import { useId } from 'react';

function Form() {
  const emailId = useId();
  const passwordId = useId();
  
  return (
    <>
      <label htmlFor={emailId}>Email:</label>
      <input id={emailId} type="email" />
      
      <label htmlFor={passwordId}>Password:</label>
      <input id={passwordId} type="password" />
    </>
  );
}
```

---

## 🎭 useImperativeHandle

**useImperativeHandle** lets you customize what a ref exposes.

```javascript
const TextField = React.forwardRef((props, ref) => {
  const inputRef = useRef(null);
  
  useImperativeHandle(ref, () => ({
    focus: () => inputRef.current.focus(),
    clear: () => { inputRef.current.value = ''; },
    getValue: () => inputRef.current.value
  }), []);
  
  return <input ref={inputRef} />;
});

// Usage
function App() {
  const textRef = useRef();
  
  return (
    <>
      <TextField ref={textRef} />
      <button onClick={() => textRef.current.focus()}>Focus</button>
      <button onClick={() => textRef.current.clear()}>Clear</button>
    </>
  );
}
```

---

## ⚠️ Performance Hooks Summary

| Hook | Use Case | When to Use |
|------|----------|-----------|
| **useMemo** | Expensive calculations | Value changes frequently |
| **useCallback** | Prevent child re-renders | Passing callbacks to memoized children |
| **React.memo** | Prevent component re-renders | Component props rarely change |

---

## 🔑 Key Takeaways

1. **useRef** accesses DOM and stores mutable values
2. **useMemo** caches expensive calculations
3. **useCallback** caches function references
4. **useLayoutEffect** runs synchronously after DOM update
5. **useId** generates unique IDs
6. **useImperativeHandle** customizes ref behavior
7. Use optimization hooks **carefully** - premature optimization is bad
---

[← Previous: Custom Hooks](14-custom-hooks.md) | [Contents](README.md) | [Next: State Management Patterns →](16-state-management.md)
