# 12: useContext Hook

## 🎯 What is Context?

**Context** lets you share data between components without passing props through every level. It solves **prop drilling** - passing props through many layers.

```
Problem: Prop Drilling
┌─────────────┐
│  App        │ (has theme)
│ theme="dark"│
├─────────────┤
│  Header     │ (passes theme)
│ theme="dark"│
├─────────────┤
│  Nav        │ (passes theme)
│ theme="dark"│
├─────────────┤
│  Button     │ (uses theme)
│ theme="dark"│
└─────────────┘

Solution: Context
┌─────────────────────────────┐
│  ThemeContext.Provider      │
│  value = { theme: "dark" }  │
├─────────────────────────────┤
│  Header, Nav, Button        │
│  (all access theme directly)│
└─────────────────────────────┘
```

---

## 🔧 Creating & Using Context

### Step 1: Create Context
```javascript
import { createContext } from 'react';

// Create context with default value
const ThemeContext = createContext();

export default ThemeContext;
```

### Step 2: Provide Context
```javascript
import ThemeContext from './ThemeContext';

function App() {
  const [theme, setTheme] = useState('light');
  
  return (
    // Wrap with Provider and pass value
    <ThemeContext.Provider value={{ theme, setTheme }}>
      <Header />
      <Main />
      <Footer />
    </ThemeContext.Provider>
  );
}

export default App;
```

### Step 3: Consume Context
```javascript
import { useContext } from 'react';
import ThemeContext from './ThemeContext';

function Button() {
  // Use context value
  const { theme, setTheme } = useContext(ThemeContext);
  
  return (
    <button 
      style={{ 
        background: theme === 'light' ? 'white' : 'black',
        color: theme === 'light' ? 'black' : 'white'
      }}
      onClick={() => setTheme(theme === 'light' ? 'dark' : 'light')}
    >
      Toggle Theme
    </button>
  );
}

export default Button;
```

---

## 💡 Real-World Example: Authentication

### 1. Create Auth Context
```javascript
// AuthContext.js
import { createContext } from 'react';

const AuthContext = createContext();

export default AuthContext;
```

### 2. Create Auth Provider
```javascript
// AuthProvider.js
import { useState, useEffect } from 'react';
import AuthContext from './AuthContext';

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  
  // Check if user is already logged in
  useEffect(() => {
    const savedUser = localStorage.getItem('user');
    if (savedUser) {
      setUser(JSON.parse(savedUser));
    }
    setLoading(false);
  }, []);
  
  const login = (email, password) => {
    // Simulate API call
    const user = { id: 1, email, name: 'John Doe' };
    setUser(user);
    localStorage.setItem('user', JSON.stringify(user));
  };
  
  const logout = () => {
    setUser(null);
    localStorage.removeItem('user');
  };
  
  const value = {
    user,
    loading,
    login,
    logout,
    isLoggedIn: !!user
  };
  
  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export default AuthContext;
```

### 3. Use Auth Provider in App
```javascript
import { AuthProvider } from './AuthProvider';

function App() {
  return (
    <AuthProvider>
      <Router>
        <Header />
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/dashboard" element={<Dashboard />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
```

### 4. Consume Auth Context
```javascript
import { useContext } from 'react';
import AuthContext from './AuthContext';

function Header() {
  const { user, isLoggedIn, logout } = useContext(AuthContext);
  
  return (
    <header>
      {isLoggedIn ? (
        <>
          <p>Welcome, {user.name}!</p>
          <button onClick={logout}>Logout</button>
        </>
      ) : (
        <a href="/login">Login</a>
      )}
    </header>
  );
}

function Dashboard() {
  const { user, loading } = useContext(AuthContext);
  
  if (loading) return <p>Loading...</p>;
  if (!user) return <p>Please log in</p>;
  
  return (
    <div>
      <h1>Dashboard for {user.name}</h1>
      <p>Email: {user.email}</p>
    </div>
  );
}
```

---

## 🎨 Theme Context Example

### Complete Theme System
```javascript
// ThemeContext.js
import { createContext, useState, useEffect } from 'react';

const ThemeContext = createContext();

export function ThemeProvider({ children }) {
  const [theme, setTheme] = useState(() => {
    return localStorage.getItem('theme') || 'light';
  });
  
  useEffect(() => {
    localStorage.setItem('theme', theme);
    document.documentElement.setAttribute('data-theme', theme);
  }, [theme]);
  
  const toggleTheme = () => {
    setTheme(t => t === 'light' ? 'dark' : 'light');
  };
  
  const value = { theme, toggleTheme };
  
  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
}

export default ThemeContext;
```

### Use in Components
```javascript
import { useContext } from 'react';
import ThemeContext from './ThemeContext';

function ThemedButton() {
  const { theme, toggleTheme } = useContext(ThemeContext);
  
  return (
    <button 
      onClick={toggleTheme}
      className={`btn btn-${theme}`}
    >
      Current theme: {theme}
    </button>
  );
}

function ThemedCard() {
  const { theme } = useContext(ThemeContext);
  
  return (
    <div className={`card card-${theme}`}>
      This card changes with theme
    </div>
  );
}
```

---

## 📝 Language/i18n Context Example

```javascript
// LanguageContext.js
import { createContext, useState } from 'react';

const LanguageContext = createContext();

export function LanguageProvider({ children }) {
  const [language, setLanguage] = useState('en');
  
  const translations = {
    en: {
      greeting: 'Hello',
      goodbye: 'Goodbye',
      welcome: 'Welcome'
    },
    es: {
      greeting: 'Hola',
      goodbye: 'Adiós',
      welcome: 'Bienvenido'
    },
    fr: {
      greeting: 'Bonjour',
      goodbye: 'Au revoir',
      welcome: 'Bienvenue'
    }
  };
  
  const t = (key) => translations[language][key] || key;
  
  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export default LanguageContext;
```

### Usage
```javascript
function Greeting() {
  const { language, setLanguage, t } = useContext(LanguageContext);
  
  return (
    <>
      <h1>{t('greeting')}</h1>
      <p>{t('welcome')}</p>
      
      <select value={language} onChange={(e) => setLanguage(e.target.value)}>
        <option value="en">English</option>
        <option value="es">Spanish</option>
        <option value="fr">French</option>
      </select>
    </>
  );
}
```

---

## 🎯 Multiple Contexts

```javascript
// App.js
import { AuthProvider } from './AuthContext';
import { ThemeProvider } from './ThemeContext';
import { LanguageProvider } from './LanguageContext';

function App() {
  return (
    <AuthProvider>
      <ThemeProvider>
        <LanguageProvider>
          <Header />
          <Main />
          <Footer />
        </LanguageProvider>
      </ThemeProvider>
    </AuthProvider>
  );
}
```

### Custom Hook for Multiple Contexts
```javascript
import { useContext } from 'react';
import AuthContext from './AuthContext';
import ThemeContext from './ThemeContext';

export function useAppContext() {
  const auth = useContext(AuthContext);
  const theme = useContext(ThemeContext);
  
  if (!auth || !theme) {
    throw new Error('useAppContext must be used within providers');
  }
  
  return { ...auth, ...theme };
}

// Usage
function Component() {
  const { user, theme, toggleTheme } = useAppContext();
  
  return <div>...</div>;
}
```

---

## ⚠️ Common Context Mistakes

### Mistake 1: Not Wrapping Provider
```javascript
// ❌ WRONG - No provider
<Header />  // Header tries to useContext but no provider!

// ✅ CORRECT
<ThemeProvider>
  <Header />
</ThemeProvider>
```

### Mistake 2: Unnecessary Re-renders
```javascript
// ❌ WRONG - New object created every render
<ThemeContext.Provider value={{ theme, setTheme }}>
  {children}
</ThemeContext.Provider>

// ✅ CORRECT - Memoize value
const value = useMemo(() => ({ theme, setTheme }), [theme]);

<ThemeContext.Provider value={value}>
  {children}
</ThemeContext.Provider>
```

### Mistake 3: Context Defaults
```javascript
// ❌ WRONG - No default
const ThemeContext = createContext();

// ✅ CORRECT - Provide useful default
const ThemeContext = createContext({
  theme: 'light',
  toggleTheme: () => {}
});
```

---

## 🔑 Key Takeaways

1. **Context** avoids prop drilling
2. **createContext()** creates context
3. **Provider** wraps components and provides value
4. **useContext()** consumes the value
5. **Multiple contexts** can be nested
6. **Memoize value** to prevent unnecessary re-renders
7. Use **custom providers** to encapsulate logic
---

[← Previous: useEffect Hook](11-useeffect.md) | [Contents](README.md) | [Next: useReducer Hook →](13-usereducer.md)
