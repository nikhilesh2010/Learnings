# 14: Custom Hooks

## 🎣 What are Custom Hooks?

**Custom Hooks** are reusable functions that contain React logic. They let you extract component logic into reusable functions.

**Rule:** Custom hook names **must start with `use`**

```
useMyHook, useForm, useFetch, useLocalStorage
```

---

## 🎯 Creating Custom Hooks

### Structure

```javascript
// Custom hooks are just JavaScript functions
function useMyHook() {
  // Can use useState, useEffect, and other hooks
  const [state, setState] = useState(initialValue);
  
  useEffect(() => {
    // Side effects
  }, []);
  
  // Return what you want to expose
  return { state, setState, someFunction };
}

// Use in components
function MyComponent() {
  const { state, setState } = useMyHook();
  return <div>{state}</div>;
}
```

---

## 📝 Practical Custom Hooks

### 1. useForm Hook

```javascript
// useForm.js
import { useState } from 'react';

function useForm(initialValues, onSubmit) {
  const [values, setValues] = useState(initialValues);
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    const fieldValue = type === 'checkbox' ? checked : value;
    
    setValues(prev => ({
      ...prev,
      [name]: fieldValue
    }));
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };
  
  const handleBlur = (e) => {
    const { name } = e.target;
    setTouched(prev => ({
      ...prev,
      [name]: true
    }));
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      await onSubmit(values);
    } catch (err) {
      setErrors(err);
    } finally {
      setIsSubmitting(false);
    }
  };
  
  const reset = () => {
    setValues(initialValues);
    setErrors({});
    setTouched({});
  };
  
  return {
    values,
    errors,
    touched,
    isSubmitting,
    handleChange,
    handleBlur,
    handleSubmit,
    reset,
    setValues,
    setErrors
  };
}

export default useForm;
```

### Using useForm

```javascript
import useForm from './useForm';

function LoginPage() {
  const form = useForm(
    { email: '', password: '' },
    async (values) => {
      const response = await fetch('/login', {
        method: 'POST',
        body: JSON.stringify(values)
      });
      if (!response.ok) throw new Error('Login failed');
    }
  );
  
  return (
    <form onSubmit={form.handleSubmit}>
      <input
        name="email"
        value={form.values.email}
        onChange={form.handleChange}
        onBlur={form.handleBlur}
      />
      {form.touched.email && form.errors.email && (
        <p className="error">{form.errors.email}</p>
      )}
      
      <input
        name="password"
        type="password"
        value={form.values.password}
        onChange={form.handleChange}
        onBlur={form.handleBlur}
      />
      {form.touched.password && form.errors.password && (
        <p className="error">{form.errors.password}</p>
      )}
      
      <button disabled={form.isSubmitting}>
        {form.isSubmitting ? 'Logging in...' : 'Login'}
      </button>
    </form>
  );
}
```

---

### 2. useFetch Hook

```javascript
// useFetch.js
import { useState, useEffect } from 'react';

function useFetch(url, options = {}) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  useEffect(() => {
    let isMounted = true;
    
    const fetchData = async () => {
      try {
        setLoading(true);
        const response = await fetch(url, options);
        
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const json = await response.json();
        
        if (isMounted) {
          setData(json);
          setError(null);
        }
      } catch (err) {
        if (isMounted) {
          setError(err.message);
          setData(null);
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };
    
    fetchData();
    
    return () => {
      isMounted = false;  // Cleanup
    };
  }, [url, options]);
  
  const refetch = () => {
    setLoading(true);
    return fetch(url, options).then(res => res.json());
  };
  
  return { data, loading, error, refetch };
}

export default useFetch;
```

### Using useFetch

```javascript
import useFetch from './useFetch';

function UsersList() {
  const { data: users, loading, error, refetch } = useFetch('/api/users');
  
  if (loading) return <p>Loading...</p>;
  if (error) return <p>Error: {error}</p>;
  
  return (
    <div>
      <button onClick={refetch}>Refresh</button>
      <ul>
        {users.map(user => (
          <li key={user.id}>{user.name}</li>
        ))}
      </ul>
    </div>
  );
}
```

---

### 3. useLocalStorage Hook

```javascript
// useLocalStorage.js
import { useState, useEffect } from 'react';

function useLocalStorage(key, initialValue) {
  // Initialize from localStorage
  const [storedValue, setStoredValue] = useState(() => {
    try {
      const item = window.localStorage.getItem(key);
      return item ? JSON.parse(item) : initialValue;
    } catch (error) {
      console.error(error);
      return initialValue;
    }
  });
  
  // Save to localStorage
  const setValue = (value) => {
    try {
      const valueToStore = value instanceof Function ? value(storedValue) : value;
      setStoredValue(valueToStore);
      window.localStorage.setItem(key, JSON.stringify(valueToStore));
    } catch (error) {
      console.error(error);
    }
  };
  
  const removeValue = () => {
    try {
      window.localStorage.removeItem(key);
      setStoredValue(initialValue);
    } catch (error) {
      console.error(error);
    }
  };
  
  return [storedValue, setValue, removeValue];
}

export default useLocalStorage;
```

### Using useLocalStorage

```javascript
import useLocalStorage from './useLocalStorage';

function ThemeSwitcher() {
  const [theme, setTheme, removeTheme] = useLocalStorage('theme', 'light');
  
  return (
    <div>
      <p>Current theme: {theme}</p>
      <button onClick={() => setTheme('dark')}>Dark</button>
      <button onClick={() => setTheme('light')}>Light</button>
      <button onClick={removeTheme}>Reset</button>
    </div>
  );
}
```

---

### 4. usePrevious Hook

```javascript
// usePrevious.js
import { useEffect, useRef } from 'react';

function usePrevious(value) {
  const ref = useRef();
  
  useEffect(() => {
    ref.current = value;
  }, [value]);
  
  return ref.current;
}

export default usePrevious;
```

### Using usePrevious

```javascript
import usePrevious from './usePrevious';

function Counter() {
  const [count, setCount] = useState(0);
  const prevCount = usePrevious(count);
  
  return (
    <div>
      <p>Now: {count}</p>
      <p>Before: {prevCount}</p>
      <p>Changed by: {count - (prevCount || 0)}</p>
      <button onClick={() => setCount(count + 1)}>+</button>
    </div>
  );
}
```

---

### 5. useToggle Hook

```javascript
// useToggle.js
import { useState } from 'react';

function useToggle(initialValue = false) {
  const [value, setValue] = useState(initialValue);
  
  const toggle = () => setValue(v => !v);
  const setTrue = () => setValue(true);
  const setFalse = () => setValue(false);
  
  return { value, toggle, setTrue, setFalse };
}

export default useToggle;
```

### Using useToggle

```javascript
import useToggle from './useToggle';

function Modal() {
  const { value: isOpen, toggle } = useToggle();
  
  return (
    <>
      <button onClick={toggle}>Open Modal</button>
      {isOpen && (
        <div className="modal">
          <p>Modal Content</p>
          <button onClick={toggle}>Close</button>
        </div>
      )}
    </>
  );
}
```

---

### 6. useAsync Hook

```javascript
// useAsync.js
import { useState, useEffect } from 'react';

function useAsync(asyncFunction, immediate = true) {
  const [status, setStatus] = useState('idle');
  const [value, setValue] = useState(null);
  const [error, setError] = useState(null);
  
  const execute = async () => {
    setStatus('pending');
    setValue(null);
    setError(null);
    
    try {
      const response = await asyncFunction();
      setValue(response);
      setStatus('success');
      return response;
    } catch (error) {
      setError(error);
      setStatus('error');
    }
  };
  
  useEffect(() => {
    if (immediate) {
      execute();
    }
  }, []);
  
  return { execute, status, value, error };
}

export default useAsync;
```

---

## 🔑 Rules for Custom Hooks

1. **Name starts with `use`**: `useMyHook`
2. **Only call other hooks**: useState, useEffect, useContext, etc.
3. **Call hooks at the top level**: Not in loops or conditions
4. **Return what makes sense**: State, functions, objects, etc.
5. **Keep them focused**: One responsibility per hook

---

## 🎯 Hook Composition

Hooks can use other hooks:

```javascript
function useAuthForm() {
  const form = useForm({ username: '', password: '' }, onSubmit);
  const { value: rememberMe, toggle } = useToggle();
  
  return { form, rememberMe, toggle };
}

// Use composed hook
function LoginPage() {
  const { form, rememberMe, toggle } = useAuthForm();
  
  return (
    <form onSubmit={form.handleSubmit}>
      {/* form fields */}
      <label>
        <input type="checkbox" checked={rememberMe.value} onChange={rememberMe.toggle} />
        Remember me
      </label>
    </form>
  );
}
```

---

## ⚠️ Common Custom Hook Mistakes

| ❌ Wrong | ✅ Correct |
|---------|-----------|
| Hook named `myHook` | Hook named `useMyHook` |
| Calling hooks conditionally | Call at top level |
| Forgetting to return values | Always return what's needed |
| Too many responsibilities | Keep hooks focused |
| Not handling cleanup | Return cleanup functions |

---

## 🔑 Key Takeaways

1. **Custom hooks** extract **reusable logic**
2. Names **must start with `use`**
3. Can use **any built-in hooks**
4. Can be **composed** together
5. Return **values needed** by components
6. Keep **focused and simple**
7. Great for **sharing logic** across components
---

[← Previous: useReducer Hook](13-usereducer.md) | [Contents](README.md) | [Next: Other Important Hooks →](15-other-hooks.md)
