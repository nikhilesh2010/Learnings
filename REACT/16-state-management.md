# 16: State Management Patterns

## 📊 State Management Hierarchy

```
Small App
    ↓
Component State (useState)
    ↓
Medium App
    ↓
Context + useReducer
    ↓
Large App
    ↓
External Libraries (Redux, Zustand, etc.)
```

---

## 🎯 Pattern 1: Local Component State

### When to Use
- Simple components
- State used only in one component
- No shared state needed

### Example
```javascript
function Counter() {
  const [count, setCount] = useState(0);
  
  return (
    <div>
      <p>Count: {count}</p>
      <button onClick={() => setCount(count + 1)}>+</button>
    </div>
  );
}
```

---

## 📌 Pattern 2: Lifting State Up

### When to Use
- Multiple components need the same state
- Components are siblings

### Before: Separate States
```javascript
function Parent() {
  return (
    <>
      <Counter1 />
      <Counter2 />
    </>
  );
}

function Counter1() {
  const [count, setCount] = useState(0);
  return <p>Counter 1: {count}</p>;
}

function Counter2() {
  const [count, setCount] = useState(0);
  return <p>Counter 2: {count}</p>;
}
// Each counter is independent!
```

### After: Shared State
```javascript
function Parent() {
  const [count, setCount] = useState(0);
  
  return (
    <>
      <Counter count={count} setCount={setCount} />
      <Counter count={count} setCount={setCount} />
    </>
  );
}

function Counter({ count, setCount }) {
  return (
    <>
      <p>Count: {count}</p>
      <button onClick={() => setCount(count + 1)}>+</button>
    </>
  );
}
// Both counters share the same state!
```

---

## 🌐 Pattern 3: Context API

### When to Use
- Many nested levels need the same data
- Global app state (theme, auth, etc.)

### Example: Theme Context
```javascript
// ThemeContext.js
import { createContext, useState } from 'react';

const ThemeContext = createContext();

export function ThemeProvider({ children }) {
  const [theme, setTheme] = useState('light');
  
  return (
    <ThemeContext.Provider value={{ theme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export { ThemeContext };
```

### Usage Throughout App
```javascript
function App() {
  return (
    <ThemeProvider>
      <Header />
      <Main />
      <Footer />
    </ThemeProvider>
  );
}

function Header() {
  const { theme, setTheme } = useContext(ThemeContext);
  return <header className={theme}>Header</header>;
}

function Main() {
  const { theme } = useContext(ThemeContext);
  return <main className={theme}>Main</main>;
}
```

---

## 🎪 Pattern 4: Context + useReducer

### When to Use
- Complex state with multiple actions
- Related state values
- Need clear state transitions

### Example: Complete App State
```javascript
// appStateReducer.js
const initialState = {
  user: null,
  theme: 'light',
  notifications: [],
  isLoading: false
};

function appStateReducer(state, action) {
  switch(action.type) {
    case 'LOGIN':
      return { ...state, user: action.payload };
    case 'LOGOUT':
      return { ...state, user: null };
    case 'SET_THEME':
      return { ...state, theme: action.payload };
    case 'ADD_NOTIFICATION':
      return {
        ...state,
        notifications: [...state.notifications, action.payload]
      };
    case 'REMOVE_NOTIFICATION':
      return {
        ...state,
        notifications: state.notifications.filter(n => n.id !== action.payload)
      };
    case 'SET_LOADING':
      return { ...state, isLoading: action.payload };
    default:
      return state;
  }
}

export { appStateReducer, initialState };
```

### Provider Component
```javascript
// AppStateProvider.js
import { createContext, useReducer } from 'react';
import { appStateReducer, initialState } from './appStateReducer';

const AppStateContext = createContext();

export function AppStateProvider({ children }) {
  const [state, dispatch] = useReducer(appStateReducer, initialState);
  
  const login = (user) => {
    dispatch({ type: 'LOGIN', payload: user });
  };
  
  const logout = () => {
    dispatch({ type: 'LOGOUT' });
  };
  
  const setTheme = (theme) => {
    dispatch({ type: 'SET_THEME', payload: theme });
  };
  
  const addNotification = (notification) => {
    const id = Date.now();
    const notif = { ...notification, id };
    dispatch({ type: 'ADD_NOTIFICATION', payload: notif });
    
    // Auto-remove after 3 seconds
    setTimeout(() => {
      dispatch({ type: 'REMOVE_NOTIFICATION', payload: id });
    }, 3000);
  };
  
  const value = {
    state,
    login,
    logout,
    setTheme,
    addNotification
  };
  
  return (
    <AppStateContext.Provider value={value}>
      {children}
    </AppStateContext.Provider>
  );
}

export { AppStateContext };
```

### Usage
```javascript
function App() {
  return (
    <AppStateProvider>
      <Dashboard />
    </AppStateProvider>
  );
}

function Dashboard() {
  const { state, setTheme, addNotification } = useContext(AppStateContext);
  
  return (
    <div>
      <p>User: {state.user?.name}</p>
      <p>Theme: {state.theme}</p>
      
      <button onClick={() => setTheme(state.theme === 'light' ? 'dark' : 'light')}>
        Toggle Theme
      </button>
      
      <button onClick={() => addNotification({ message: 'Success!' })}>
        Show Notification
      </button>
      
      {state.notifications.map(notif => (
        <div key={notif.id} className="notification">
          {notif.message}
        </div>
      ))}
    </div>
  );
}
```

---

## 🛠️ Pattern 5: Custom State Hook

Perfect for reusable state logic:

```javascript
// useAppState.js
import { useContext } from 'react';
import { AppStateContext } from './AppStateProvider';

export function useAppState() {
  const context = useContext(AppStateContext);
  
  if (!context) {
    throw new Error('useAppState must be used within AppStateProvider');
  }
  
  return context;
}
```

### Usage
```javascript
function Component() {
  const { state, setTheme, logout } = useAppState();
  
  return (
    <div>
      <p>{state.user.name}</p>
      <button onClick={() => setTheme('dark')}>Dark</button>
      <button onClick={logout}>Logout</button>
    </div>
  );
}
```

---

## 💾 Pattern 6: Compound Components

### When to Use
- Components work together
- Flexible component composition
- Share state between related components

### Example: Tabs Component
```javascript
// TabsContext.js
const TabsContext = createContext();

// Main Tabs Component
function Tabs({ children, defaultTab = 0 }) {
  const [activeTab, setActiveTab] = useState(defaultTab);
  
  return (
    <TabsContext.Provider value={{ activeTab, setActiveTab }}>
      {children}
    </TabsContext.Provider>
  );
}

// TabList Component
function TabList({ children }) {
  return <div className="tab-list">{children}</div>;
}

// TabTrigger Component
function TabTrigger({ index, children }) {
  const { activeTab, setActiveTab } = useContext(TabsContext);
  
  return (
    <button
      className={activeTab === index ? 'active' : ''}
      onClick={() => setActiveTab(index)}
    >
      {children}
    </button>
  );
}

// TabContent Component
function TabContent({ index, children }) {
  const { activeTab } = useContext(TabsContext);
  
  return activeTab === index ? <div>{children}</div> : null;
}

export { Tabs, TabList, TabTrigger, TabContent };
```

### Usage
```javascript
function App() {
  return (
    <Tabs defaultTab={0}>
      <TabList>
        <TabTrigger index={0}>Home</TabTrigger>
        <TabTrigger index={1}>Settings</TabTrigger>
        <TabTrigger index={2}>About</TabTrigger>
      </TabList>
      
      <TabContent index={0}>
        <h2>Home Page</h2>
      </TabContent>
      
      <TabContent index={1}>
        <h2>Settings Page</h2>
      </TabContent>
      
      <TabContent index={2}>
        <h2>About Page</h2>
      </TabContent>
    </Tabs>
  );
}
```

---

## 📚 External Libraries

For **very large apps**, consider:

### Redux
```javascript
// Complex, verbose, but very predictable
const store = createStore(reducer);
const state = useSelector(state => state.data);
const dispatch = useDispatch();
```

### Zustand
```javascript
// Simple, modern, minimal boilerplate
const useStore = create(set => ({
  count: 0,
  increment: () => set(state => ({ count: state.count + 1 }))
}));
```

### Jotai
```javascript
// Primitive atoms, great for medium apps
const countAtom = atom(0);
const [count, setCount] = useAtom(countAtom);
```

### Recoil
```javascript
// Similar to Jotai, from Facebook
const countState = atom({ key: 'count', default: 0 });
const [count, setCount] = useRecoilState(countState);
```

---

## 📈 Decision Tree

```
Do you need shared state?
    │
    ├─ NO  → useState (local)
    │
    └─ YES → How complex?
        │
        ├─ Simple → Lift state up
        │
        ├─ Medium → Context API
        │
        ├─ Complex → Context + useReducer
        │
        └─ Very Large → External library
```

---

## 🔑 Key Takeaways

1. Start with **local useState**
2. Lift state up when **needed by siblings**
3. Use **Context** for global state
4. Add **useReducer** for complex logic
5. Create **custom hooks** for reusable logic
6. Use **compound components** for related components
7. Consider **external libraries** for large apps
---

[← Previous: Other Important Hooks](15-other-hooks.md) | [Contents](README.md) | [Next: Component Optimization →](17-optimization.md)
