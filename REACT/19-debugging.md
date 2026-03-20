# 19: Debugging & Developer Tools

## 🔍 React DevTools

### Installation
- **Chrome**: React Developer Tools (extension)
- **Firefox**: React Developer Tools (extension)
- **Safari**: React DevTools (via npm)

### Inspector Tab
```
Inspect components    → See component hierarchy
View props           → Check what props are passed
Modify state         → Change state for testing
Track updates        → See which components re-render
```

---

## 🎯 Debugging React Code

### Console Logging
```javascript
function Component({ data }) {
  useEffect(() => {
    console.log('Component mounted');
    
    return () => {
      console.log('Component unmounting');
    };
  }, []);
  
  console.log('Rendering with data:', data);
  
  return <div>{data}</div>;
}
```

### Log Initialization & Changes
```javascript
function useLogEffect(label, value) {
  useEffect(() => {
    console.log(`${label} changed:`, value);
  }, [value, label]);
}

function Component({ userId }) {
  useLogEffect('userId', userId);
  // Logs whenever userId changes
}
```

---

## 🐛 Common Debugging Patterns

### Problem: State Not Updating
```javascript
// ❌ WRONG: Modifying state directly
function Counter() {
  const [count, setCount] = useState(0);
  
  const increment = () => {
    count++;  // This doesn't work!
  };
  
  return <p>{count}</p>;
}

// ✅ CORRECT: Use setState
function Counter() {
  const [count, setCount] = useState(0);
  
  const increment = () => {
    setCount(count + 1);  // Correct
    // or
    setCount(c => c + 1);  // Safer for multiple updates
  };
  
  return <p>{count}</p>;
}
```

### Problem: Stale Closures
```javascript
// ❌ WRONG: Function captures old state
function Component() {
  const [count, setCount] = useState(0);
  
  setTimeout(() => {
    console.log(count);  // Always logs 0
  }, 5000);
  
  return (
    <>
      <p>{count}</p>
      <button onClick={() => setCount(count + 1)}>+</button>
    </>
  );
}

// ✅ CORRECT: Use ref for mutable values
function Component() {
  const [count, setCount] = useState(0);
  const countRef = useRef(count);
  
  useEffect(() => {
    countRef.current = count;
  }, [count]);
  
  setTimeout(() => {
    console.log(countRef.current);  // Gets latest count
  }, 5000);
  
  return (
    <>
      <p>{count}</p>
      <button onClick={() => setCount(count + 1)}>+</button>
    </>
  );
}
```

### Problem: Memory Leaks
```javascript
// ❌ WRONG: No cleanup
function Timer() {
  useEffect(() => {
    const interval = setInterval(() => {
      console.log('Tick');
    }, 1000);
    // Interval never cleared!
  }, []);
  
  return <p>Timer running</p>;
}

// ✅ CORRECT: Cleanup on unmount
function Timer() {
  useEffect(() => {
    const interval = setInterval(() => {
      console.log('Tick');
    }, 1000);
    
    return () => clearInterval(interval);  // Cleanup
  }, []);
  
  return <p>Timer running</p>;
}
```

### Problem: Infinite Loops
```javascript
// ❌ WRONG: Effect has no dependencies
function Component() {
  const [data, setData] = useState(null);
  
  useEffect(() => {
    fetch('/api/data')
      .then(res => res.json())
      .then(setData);
    // No dependency array = runs every render!
  });  // Infinite loop!
  
  return <div>{data}</div>;
}

// ✅ CORRECT: Add proper dependencies
function Component() {
  const [data, setData] = useState(null);
  
  useEffect(() => {
    fetch('/api/data')
      .then(res => res.json())
      .then(setData);
  }, []);  // Runs only once
  
  return <div>{data}</div>;
}
```

---

## 🔧 Browser DevTools

### Network Tab
```
Monitor API calls
├── Check request headers
├── View response body
├── See network timings
└── Identify failed requests
```

### Performance Tab
```
Record application performance
├── Identify slow renders
├── See component lifecycle
├── Measure frame rate
└── Find performance bottlenecks
```

---

## 🎯 Breakpoints & Debugging

### Using DevTools Breakpoints
```javascript
function handleClick() {
  debugger;  // Execution pauses here
  console.log('Code after debugger');
}
```

### Conditional Breakpoints
```javascript
function loop(arr) {
  arr.forEach((item, i) => {
    if (item.id === 999) {  // Break only when condition is true
      debugger;
    }
  });
}
```

---

## 📊 Performance Profiling

### React Profiler in DevTools
```
Profile tab
├── Record render
├── Interact with app
├── Stop recording
└── Analyze results
```

### Manual Profiling
```javascript
import { Profiler } from 'react';

function onRenderCallback(
  id,              // 'app', 'header', etc.
  phase,           // 'mount' or 'update'
  actualDuration,  // Time spent rendering
  baseDuration,    // Time without memo optimization
  startTime,       // When React started rendering
  commitTime       // When React finished rendering
) {
  console.log(`${id} (${phase}): ${actualDuration}ms`);
}

function App() {
  return (
    <Profiler id="app" onRender={onRenderCallback}>
      <Dashboard />
    </Profiler>
  );
}
```

---

## 🔍 Common Errors & Solutions

### Error: "TypeError: Cannot read property 'name' of undefined"
```javascript
// ❌ WRONG: Accessing property of undefined
function UserCard({ user }) {
  return <h1>{user.name}</h1>;  // Crashes if user is null
}

// ✅ CORRECT: Check first
function UserCard({ user }) {
  if (!user) return <p>No user</p>;
  return <h1>{user.name}</h1>;
}

// ✅ OR: Use optional chaining
function UserCard({ user }) {
  return <h1>{user?.name || 'Unknown'}</h1>;
}
```

### Error: "Warning: setState on unmounted component"
```javascript
// ❌ WRONG: Setting state after unmount
function DataFetcher() {
  const [data, setData] = useState(null);
  
  useEffect(() => {
    fetch('/api/data')
      .then(res => res.json())
      .then(setData);  // Can try to update unmounted component
  }, []);
}

// ✅ CORRECT: Check if mounted
function DataFetcher() {
  const [data, setData] = useState(null);
  
  useEffect(() => {
    let isMounted = true;
    
    fetch('/api/data')
      .then(res => res.json())
      .then(data => {
        if (isMounted) setData(data);  // Only update if mounted
      });
    
    return () => {
      isMounted = false;  // Cleanup
    };
  }, []);
}
```

### Error: "Warning: Each child in a list should have a unique 'key' prop"
```javascript
// ❌ WRONG: No keys
{items.map((item, index) => (
  <li>{item.name}</li>
))}

// ✅ CORRECT: Add keys
{items.map(item => (
  <li key={item.id}>{item.name}</li>
))}
```

---

## 🎨 Debugging Tools & Extensions

### React DevTools Inspection
```
Right-click component → Inspect
DevTools opens → React tab
├── Components tree
├── Props panel
├── State hooks
└── Source code
```

### Chrome DevTools Console API
```javascript
// Get React component
$r  // Selected component in DevTools

// Modify props
$r.props = { ...props };

// Call component methods
$r.doSomething();
```

---

## 📈 Performance Monitoring

### Log Render Times
```javascript
function useRenderCount(componentName) {
  const renderCount = useRef(0);
  
  useEffect(() => {
    renderCount.current++;
    console.log(`${componentName} rendered ${renderCount.current} times`);
  });
}

// Usage
function MyComponent() {
  useRenderCount('MyComponent');
  return <div>Content</div>;
}
```

### Detect Unnecessary Renders
```javascript
function useWhyDidYouUpdate(name, props) {
  const previousProps = useRef();
  
  useEffect(() => {
    if (previousProps.current) {
      const allKeys = Object.keys({ ...previousProps.current, ...props });
      const changedProps = {};
      
      allKeys.forEach(key => {
        if (previousProps.current[key] !== props[key]) {
          changedProps[key] = {
            from: previousProps.current[key],
            to: props[key]
          };
        }
      });
      
      if (Object.keys(changedProps).length > 0) {
        console.log('[why-did-you-update]', name, changedProps);
      }
    }
    
    previousProps.current = props;
  }, [props, name]);
}

// Usage
function Component(props) {
  useWhyDidYouUpdate('Component', props);
  return <div>Component</div>;
}
```

---

## 🚨 Error Boundaries Edge Cases

### Catching Errors in Event Handlers
```javascript
// Error boundaries don't catch errors in handlers!
function Component() {
  const handleClick = () => {
    throw new Error('Handle manually!');  // Won't be caught
  };
  
  // Must catch manually
  const handleClickSafe = () => {
    try {
      throw new Error('Now we catch it');
    } catch (error) {
      console.error(error);
    }
  };
  
  return <button onClick={handleClickSafe}>Click</button>;
}
```

---

## 📚 Useful npm Packages for Debugging

```javascript
// react-json-tree - Pretty print objects
import JSONTree from 'react-json-tree';

function DebugOutput({ data }) {
  return <JSONTree data={data} />;
}

// redux-logger - Log state changes
import { logger } from 'redux-logger';

// why-did-you-render - Track unnecessary updates
import whyDidYouRender from '@welldone-software/why-did-you-render';

if (process.env.NODE_ENV === 'development') {
  whyDidYouRender(React, {
    trackAllPureComponents: true
  });
}
```

---

## 🔑 Key Takeaways

1. **Use React DevTools** to inspect components
2. **Check browser DevTools** Network and Performance tabs
3. **Add logging** strategically
4. **Use debugger** to pause execution
5. **Handle errors** with try-catch and Error Boundaries
6. **Profile performance** to find bottlenecks
7. **Clean up** subscriptions and timers
8. **Validate props** to prevent errors early
9. **Check for stale closures** in callbacks
10. **Use custom hooks** to encapsulate debugging logic

---

## 🚀 Summary

You now have comprehensive React knowledge covering:
- ✅ Fundamentals (JSX, Components, Props, State)
- ✅ Rendering & Virtual DOM
- ✅ Event Handling & Forms
- ✅ Hooks (useState, useEffect, useContext, useReducer, Custom Hooks)
- ✅ State Management Patterns
- ✅ Performance Optimization
- ✅ Best Practices
- ✅ Debugging & Tools

**Continue Learning:**
- Build projects to reinforce concepts
- Read React documentation
- Contribute to open source
- Stay updated with React releases

Happy coding! 🚀

---

[← Previous: Best Practices](18-best-practices.md) | [Contents](README.md)
