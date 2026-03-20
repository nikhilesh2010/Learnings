# 11: useEffect Hook

## ⚙️ What is useEffect?

**useEffect** lets you perform side effects in function components. Side effects are things like:
- 📡 Fetching data from APIs
- 📌 Directly manipulating the DOM
- 🔔 Setting up timers/intervals
- 📍 Subscribing to events
- 💾 Saving to localStorage

```javascript
import { useEffect } from 'react';

useEffect(() => {
  // Side effect code here
  console.log('Component mounted or updated');
});
```

---

## 🔄 useEffect Lifecycle

### Breakdown

```
Component Renders
    ↓
useEffect runs
    ↓
Return cleanup (if any)
    ↓
Component Renders Again
    ↓
Cleanup from previous effect runs
    ↓
New useEffect runs
```

---

## 📋 useEffect Patterns

### Pattern 1: Runs After Every Render
```javascript
function Counter() {
  const [count, setCount] = useState(0);
  
  useEffect(() => {
    console.log('Component rendered, count =', count);
  });  // No dependency array = runs every render
  
  return (
    <>
      <p>Count: {count}</p>
      <button onClick={() => setCount(count + 1)}>+</button>
    </>
  );
}

// Console output:
// "Component rendered, count = 0"
// [click button]
// "Component rendered, count = 1"
// [click button]
// "Component rendered, count = 2"
```

### Pattern 2: Runs Only Once (On Mount)
```javascript
function DataFetcher() {
  const [data, setData] = useState(null);
  
  useEffect(() => {
    // This runs ONLY when component mounts
    console.log('Component mounted!');
    
    fetch('/api/data')
      .then(res => res.json())
      .then(data => setData(data));
  }, []);  // Empty array = runs once on mount
  
  return <div>{data ? data.name : 'Loading...'}</div>;
}
```

### Pattern 3: Runs When Dependencies Change
```javascript
function SearchResults({ query }) {
  const [results, setResults] = useState([]);
  
  useEffect(() => {
    // Runs whenever 'query' changes
    console.log('Searching for:', query);
    
    fetch(`/api/search?q=${query}`)
      .then(res => res.json())
      .then(data => setResults(data));
  }, [query]);  // Dependency array with query
  
  return (
    <ul>
      {results.map(result => (
        <li key={result.id}>{result.name}</li>
      ))}
    </ul>
  );
}
```

---

## 🧹 Cleanup Function

### Setup and Cleanup
```javascript
function Timer() {
  const [seconds, setSeconds] = useState(0);
  
  useEffect(() => {
    // Setup: Create interval
    const interval = setInterval(() => {
      setSeconds(s => s + 1);
    }, 1000);
    
    // Cleanup: Clear interval on unmount
    return () => {
      clearInterval(interval);
    };
  }, []);  // Only set up once
  
  return <p>Time: {seconds}s</p>;
}

// When component unmounts, cleanup function runs
// This prevents memory leaks!
```

### Event Listener with Cleanup
```javascript
function WindowSize() {
  const [size, setSize] = useState({
    width: window.innerWidth,
    height: window.innerHeight
  });
  
  useEffect(() => {
    // Setup
    const handleResize = () => {
      setSize({
        width: window.innerWidth,
        height: window.innerHeight
      });
    };
    
    window.addEventListener('resize', handleResize);
    
    // Cleanup
    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, []);
  
  return <p>Width: {size.width}, Height: {size.height}</p>;
}
```

---

## 📡 API Fetching Examples

### Basic API Call
```javascript
function UserProfile({ userId }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  useEffect(() => {
    // Reset state
    setLoading(true);
    setError(null);
    
    // Fetch data
    fetch(`/api/users/${userId}`)
      .then(res => res.json())
      .then(data => {
        setUser(data);
        setLoading(false);
      })
      .catch(err => {
        setError(err.message);
        setLoading(false);
      });
  }, [userId]);  // Re-fetch when userId changes
  
  if (loading) return <p>Loading...</p>;
  if (error) return <p>Error: {error}</p>;
  
  return (
    <div>
      <h1>{user.name}</h1>
      <p>Email: {user.email}</p>
    </div>
  );
}
```

### with Abort Controller (Cancel Requests)
```javascript
function SearchUsers({ searchTerm }) {
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  
  useEffect(() => {
    if (!searchTerm) {
      setResults([]);
      return;
    }
    
    // Create abort controller
    const controller = new AbortController();
    
    setLoading(true);
    
    fetch(`/api/search?q=${searchTerm}`, {
      signal: controller.signal
    })
      .then(res => res.json())
      .then(data => {
        setResults(data);
        setLoading(false);
      })
      .catch(err => {
        if (err.name !== 'AbortError') {
          console.error(err);
        }
      });
    
    // Cleanup: Cancel request if component unmounts
    return () => controller.abort();
  }, [searchTerm]);
  
  return (
    <>
      {loading && <p>Searching...</p>}
      <ul>
        {results.map(user => (
          <li key={user.id}>{user.name}</li>
        ))}
      </ul>
    </>
  );
}
```

---

## 💾 localStorage Example

### Save to localStorage
```javascript
function ThemeToggle() {
  const [theme, setTheme] = useState(() => {
    // Initialize from localStorage
    return localStorage.getItem('theme') || 'light';
  });
  
  // Save to localStorage whenever theme changes
  useEffect(() => {
    localStorage.setItem('theme', theme);
    document.postMessage({ theme }, '*');
  }, [theme]);
  
  return (
    <button onClick={() => setTheme(theme === 'light' ? 'dark' : 'light')}>
      Current theme: {theme}
    </button>
  );
}
```

---

## 🔔 Multiple useEffects

You can have multiple useEffect hooks:

```javascript
function ComplexComponent({ userId }) {
  const [user, setUser] = useState(null);
  const [posts, setPosts] = useState([]);
  const [comments, setComments] = useState([]);
  
  // Effect 1: Fetch user data
  useEffect(() => {
    fetch(`/api/users/${userId}`)
      .then(res => res.json())
      .then(data => setUser(data));
  }, [userId]);
  
  // Effect 2: Fetch user's posts
  useEffect(() => {
    if (user) {
      fetch(`/api/users/${user.id}/posts`)
        .then(res => res.json())
        .then(data => setPosts(data));
    }
  }, [user]);
  
  // Effect 3: Set up title
  useEffect(() => {
    document.title = user ? `${user.name}'s Profile` : 'Profile';
  }, [user]);
  
  return (
    <div>
      {user && <h1>{user.name}</h1>}
      <div>
        {posts.map(post => (
          <article key={post.id}>{post.title}</article>
        ))}
      </div>
    </div>
  );
}
```

---

## ⚠️ Common useEffect Mistakes

### Mistake 1: Missing Dependencies
```javascript
// ❌ WRONG - Count changes but effect doesn't notice
function BadExample() {
  const [count, setCount] = useState(0);
  
  useEffect(() => {
    console.log('Count is:', count);
    // Missing [count] dependency!
  }, []);
}

// ✅ CORRECT
function GoodExample() {
  const [count, setCount] = useState(0);
  
  useEffect(() => {
    console.log('Count is:', count);
  }, [count]);  // Added dependency
}
```

### Mistake 2: Infinite Loop
```javascript
// ❌ WRONG - Setting state inside effect without dependencies
function InfiniteLoop() {
  const [data, setData] = useState(null);
  
  useEffect(() => {
    fetch('/api/data')
      .then(res => res.json())
      .then(data => setData(data));
    // No dependency array = runs every render
    // setData causes re-render = effect runs again = infinite loop
  });
}

// ✅ CORRECT
function NoLoop() {
  const [data, setData] = useState(null);
  
  useEffect(() => {
    fetch('/api/data')
      .then(res => res.json())
      .then(data => setData(data));
  }, []);  // Empty array = runs only once
}
```

### Mistake 3: Not Cleaning Up
```javascript
// ❌ WRONG - Memory leak
function LeakyComponent() {
  useEffect(() => {
    const interval = setInterval(() => {
      console.log('Tick');
    }, 1000);
    // Interval never cleared!
  }, []);
}

// ✅ CORRECT
function NoLeakComponent() {
  useEffect(() => {
    const interval = setInterval(() => {
      console.log('Tick');
    }, 1000);
    
    return () => clearInterval(interval);  // Cleanup
  }, []);
}
```

---

## 📊 Dependency Array Guide

```
useEffect(() => {}, [])
            ↑        ↑
       effect       dependencies

No array      → runs after EVERY render
[]            → runs ONCE on mount
[dep1, dep2]  → runs when dep1 or dep2 changes
```

---

## 🔑 Key Takeaways

1. **useEffect** runs side effects **after render**
2. **Dependency array** controls when it runs
3. Always **cleanup** subscriptions/timers
4. Include all **dependencies** in the array
5. Multiple **useEffect** hooks are OK
6. Effects run **after render completes**
7. Avoid **infinite loops** with proper dependencies
---

[← Previous: Forms & Input Handling](10-forms.md) | [Contents](README.md) | [Next: useContext Hook →](12-usecontext.md)
