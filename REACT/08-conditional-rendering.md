# 08: Conditional Rendering

## 🎭 What is Conditional Rendering?

**Conditional Rendering** is showing or hiding different UI based on conditions - like displaying different content based on user login status, data availability, etc.

```
Condition Check
    ↓
TRUE → Render Component A
FALSE → Render Component B
```

---

## 🔀 Conditional Rendering Methods

### Method 1: If/Else Statement
```javascript
function LoginStatus({ isLoggedIn }) {
  if (isLoggedIn) {
    return <h1>Welcome back!</h1>;
  } else {
    return <h1>Please log in</h1>;
  }
}

// Usage
<LoginStatus isLoggedIn={true} />      // Shows "Welcome back!"
<LoginStatus isLoggedIn={false} />     // Shows "Please log in"
```

### Method 2: Ternary Operator (RECOMMENDED ⭐)
```javascript
function LoginStatus({ isLoggedIn }) {
  return (
    <h1>
      {isLoggedIn ? 'Welcome back!' : 'Please log in'}
    </h1>
  );
}

// Usage
<LoginStatus isLoggedIn={true} />      // Welcome back!
<LoginStatus isLoggedIn={false} />     // Please log in
```

### Method 3: Logical AND (&&)
```javascript
function Messages({ unreadCount }) {
  return (
    <div>
      {/* Only shows if unreadCount > 0 */}
      {unreadCount > 0 && (
        <p>You have {unreadCount} unread messages!</p>
      )}
    </div>
  );
}

// Usage
<Messages unreadCount={0} />     // Shows nothing
<Messages unreadCount={5} />     // Shows "You have 5 unread messages!"
```

### Method 4: Logical OR (||)
```javascript
function Greeting({ name }) {
  return (
    <h1>Hello {name || 'Guest'}!</h1>
  );
}

// Usage
<Greeting name="Alice" />        // Hello Alice!
<Greeting name="" />             // Hello Guest!
<Greeting />                     // Hello Guest!
```

---

## 🎯 Practical Examples

### Example 1: Login/Logout Button
```javascript
function LoginButton() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  
  return (
    <div>
      {isLoggedIn ? (
        <>
          <p>You are logged in</p>
          <button onClick={() => setIsLoggedIn(false)}>
            Logout
          </button>
        </>
      ) : (
        <>
          <p>You are not logged in</p>
          <button onClick={() => setIsLoggedIn(true)}>
            Login
          </button>
        </>
      )}
    </div>
  );
}
```

### Example 2: Loading State
```javascript
function DataLoader() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Imagine fetching data here...
  
  if (loading) {
    return <p>Loading...</p>;
  }
  
  if (error) {
    return <p>Error: {error}</p>;
  }
  
  if (!data) {
    return <p>No data available</p>;
  }
  
  return (
    <div>
      <h1>{data.title}</h1>
      <p>{data.description}</p>
    </div>
  );
}
```

### Example 3: Permission-Based Rendering
```javascript
function AdminPanel({ userRole }) {
  return (
    <div>
      <h1>Dashboard</h1>
      
      {userRole === 'admin' && (
        <section>
          <h2>Admin Controls</h2>
          <button>Delete User</button>
          <button>Ban User</button>
        </section>
      )}
      
      {userRole === 'moderator' && (
        <section>
          <h2>Moderator Tools</h2>
          <button>Delete Comments</button>
        </section>
      )}
      
      <section>
        <h2>User Profile</h2>
        <p>Your posts, settings, etc.</p>
      </section>
    </div>
  );
}

// Usage
<AdminPanel userRole="admin" />        // Shows admin + user
<AdminPanel userRole="moderator" />    // Shows moderator + user
<AdminPanel userRole="user" />         // Shows only user
```

### Example 4: Empty State
```javascript
function TodoList({ todos }) {
  return (
    <div>
      {todos.length > 0 ? (
        <>
          <h2>Your Todos</h2>
          <ul>
            {todos.map(todo => (
              <li key={todo.id}>{todo.text}</li>
            ))}
          </ul>
        </>
      ) : (
        <div className="empty-state">
          <p>No todos yet!</p>
          <p>Create your first todo to get started</p>
        </div>
      )}
    </div>
  );
}

// Usage
<TodoList todos={[]} />                // Shows empty state
<TodoList todos={[{id: 1, text: 'Learn React'}]} />  // Shows list
```

### Example 5: Complex Conditions
```javascript
function ProductAvailability({ inStock, price, isSale }) {
  return (
    <div>
      {inStock && price < 50 && isSale ? (
        <p className="highlight">🔥 Limited Time Offer!</p>
      ) : inStock ? (
        <p>In Stock</p>
      ) : (
        <p className="warning">Out of Stock</p>
      )}
    </div>
  );
}
```

---

## 🎯 Conditional Rendering Patterns

### Pattern 1: Early Return
```javascript
function UserProfile({ userId, isLoading }) {
  if (isLoading) return <p>Loading...</p>;
  if (!userId) return <p>User not found</p>;
  
  return (
    <div>
      <h1>User Profile</h1>
      {/* Rest of the component... */}
    </div>
  );
}
```

### Pattern 2: Switch Statement
```javascript
function PaymentStatus({ status }) {
  switch(status) {
    case 'pending':
      return <p>Payment pending...</p>;
    case 'completed':
      return <p className="success">Payment successful!</p>;
    case 'failed':
      return <p className="error">Payment failed</p>;
    default:
      return <p>Unknown status</p>;
  }
}

// Usage
<PaymentStatus status="completed" />   // Shows success message
```

### Pattern 3: Map to Components
```javascript
function NotificationCenter({ notifications }) {
  const notificationComponents = {
    info: (msg) => <div className="info">ℹ️ {msg}</div>,
    warning: (msg) => <div className="warning">⚠️ {msg}</div>,
    error: (msg) => <div className="error">❌ {msg}</div>,
  };
  
  return (
    <div>
      {notifications.map(notif => (
        <div key={notif.id}>
          {notificationComponents[notif.type](notif.message)}
        </div>
      ))}
    </div>
  );
}
```

### Pattern 4: Element Variable
```javascript
function Greeting({ isLoggedIn, userName }) {
  let greeting;
  
  if (isLoggedIn) {
    greeting = <p>Welcome back, {userName}!</p>;
  } else {
    greeting = <p>Please sign in</p>;
  }
  
  return (
    <div>
      <h1>My App</h1>
      {greeting}
    </div>
  );
}
```

---

## ⚠️ Common Mistakes

### Mistake 1: Using && with 0 or false
```javascript
// ❌ WRONG - Shows "0" if count is 0!
{count && <p>Items: {count}</p>}

// When count = 0, React renders "0" (falsy but renders!)

// ✅ CORRECT - Use comparison
{count > 0 && <p>Items: {count}</p>}
```

### Mistake 2: Forgetting parens in ternary
```javascript
// ❌ WRONG - Syntax error
{loading ? 
  <Spinner /> 
  <Data />
}

// ✅ CORRECT
{loading ? (
  <Spinner />
) : (
  <Data />
)}
```

### Mistake 3: Inconsistent returns
```javascript
// ❌ Confusing mix of methods
function Component({ value }) {
  if (!value) return null;
  
  return value ? <p>Has value</p> : <p>No value</p>;
  // Second ternary will never execute!
}

// ✅ Clear structure
function Component({ value }) {
  if (!value) return <p>No value</p>;
  return <p>Has value</p>;
}
```

---

## 🔑 Which Method to Use?

| Method | Best For | Example |
|--------|----------|---------|
| **If/Else** | Multiple paths | Loading states |
| **Ternary** | Two paths in JSX | Show/hide |
| **&&** | Simple "if true" | Permissions |
| **Switch** | Many routes | Navigation |
| **Element var** | Complex logic | Nested conditions |

---

## 📊 Decision Tree

```
Should I render something?
    │
    ├─→ Yes/No? → Use && (AND)
    │
    ├─→ Show A or B? → Use ? : (Ternary)
    │
    ├─→ Many options? → Use switch (Switch)
    │
    └─→ Complex logic? → Use if/else + variable
```

---

## 🔑 Key Takeaways

1. **Conditional rendering** controls what displays
2. Use **ternary operator ?:** for simple if/else in JSX
3. Use **&& operator** for simple "if true" cases
4. Use **if/else** for complex multi-path logic
5. Avoid rendering **0 or false** unintentionally
6. Always provide **fallback UI** for loading/error states
7. Keep conditionals **simple and readable**
---

[← Previous: Event Handling](07-event-handling.md) | [Contents](README.md) | [Next: Lists & Keys →](09-lists-and-keys.md)
