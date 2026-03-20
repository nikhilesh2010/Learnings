# 18: Best Practices & Patterns

## 📋 Code Organization

### Folder Structure
```
src/
├── components/          # Reusable components
│   ├── Button.js
│   ├── Card.js
│   └── Header.js
├── pages/              # Page components
│   ├── Home.js
│   ├── About.js
│   └── Dashboard.js
├── hooks/              # Custom hooks
│   ├── useForm.js
│   ├── useFetch.js
│   └── useAuth.js
├── context/            # Context providers
│   ├── AuthContext.js
│   └── ThemeContext.js
├── services/           # API calls
│   ├── api.js
│   └── auth.js
├── styles/             # Stylesheets
│   ├── global.css
│   └── variables.css
└── utils/              # Utility functions
    ├── helpers.js
    └── constants.js
```

---

## 🎯 Component Design

### Rule 1: Single Responsibility
```javascript
// ❌ BAD: Does too much
function UserProfile() {
  const [user, setUser] = useState(null);
  const [posts, setPosts] = useState([]);
  
  useEffect(() => {
    fetchUser();
    fetchPosts();
  }, []);
  
  return (
    <div>
      <h1>{user?.name}</h1>
      <ul>
        {posts.map(post => (
          <li key={post.id}>
            <h3>{post.title}</h3>
            <p>{post.body}</p>
          </li>
        ))}
      </ul>
    </div>
  );
}

// ✅ GOOD: Separate concerns
function UserProfile() {
  const user = useUser();
  return (
    <div>
      <UserHeader user={user} />
      <UserPosts userId={user.id} />
    </div>
  );
}

function UserHeader({ user }) {
  return <h1>{user?.name}</h1>;
}

function UserPosts({ userId }) {
  const posts = usePosts(userId);
  return (
    <ul>
      {posts.map(post => (
        <PostItem key={post.id} post={post} />
      ))}
    </ul>
  );
}

function PostItem({ post }) {
  return (
    <li>
      <h3>{post.title}</h3>
      <p>{post.body}</p>
    </li>
  );
}
```

### Rule 2: Component Size
```javascript
// ❌ BAD: 500 lines in one file
function App() {
  // ... entire app logic
}

// ✅ GOOD: Small, focused components
function App() {
  return (
    <>
      <Header />
      <Navigation />
      <Main />
      <Sidebar />
      <Footer />
    </>
  );
}
```

---

## 🔐 Props Design

### Rule: Make Props Clear
```javascript
// ❌ BAD: Unclear prop names
<UserCard user={userData} meta={extra} />

// ✅ GOOD: Descriptive names
<UserCard 
  userName={userData.name}
  userEmail={userData.email}
  isAdmin={userData.role === 'admin'}
/>
```

### Rule: Validate Props
```javascript
import PropTypes from 'prop-types';

function UserCard({ name, age, email }) {
  return <div>{name}, {age}, {email}</div>;
}

UserCard.propTypes = {
  name: PropTypes.string.isRequired,
  age: PropTypes.number.isRequired,
  email: PropTypes.string
};

UserCard.defaultProps = {
  email: 'noemail@example.com'
};
```

---

## 📝 Naming Conventions

### Components (PascalCase)
```javascript
// ✅ CORRECT
function UserProfile() {}
const UserCard = () => {};
export default HomePage;

// ❌ WRONG
function userProfile() {}
const user_card = () => {};
```

### Variables & Functions (camelCase)
```javascript
// ✅ CORRECT
const userName = 'John';
const handleClick = () => {};
let isLoading = false;

// ❌ WRONG
const user_name = 'John';
const HandleClick = () => {};
let IsLoading = false;
```

### Event Handlers (handle + Verb)
```javascript
// ✅ CLEAR AND CONSISTENT
const handleClick = () => {};
const handleChange = () => {};
const handleSubmit = () => {};
const handleDelete = () => {};
const handleOpen = () => {};

// Also good: on + EventType for callbacks
<Component onUserDelete={handleDelete} />
<Component onFormSubmit={handleSubmit} />
```

---

## 🛡️ Error Handling

### Error Boundaries
```javascript
class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }
  
  static getDerivedStateFromError(error) {
    return { hasError: true };
  }
  
  componentDidCatch(error, errorInfo) {
    console.error('Error:', error, errorInfo);
  }
  
  render() {
    if (this.state.hasError) {
      return <h1>Something went wrong</h1>;
    }
    
    return this.props.children;
  }
}

// Usage
<ErrorBoundary>
  <App />
</ErrorBoundary>
```

### Try-Catch in Effects
```javascript
function DataFetcher() {
  const [error, setError] = useState(null);
  const [data, setData] = useState(null);
  
  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch('/api/data');
        if (!response.ok) throw new Error('Network response failed');
        const result = await response.json();
        setData(result);
      } catch (err) {
        setError(err.message);
      }
    };
    
    fetchData();
  }, []);
  
  if (error) return <p>Error: {error}</p>;
  if (!data) return <p>Loading...</p>;
  
  return <div>{data}</div>;
}
```

---

## 🔄 Conditional Rendering

### Bad: Too Complex
```javascript
// ❌ Hard to read
{loading ? (
  <Spinner />
) : error ? (
  <Error />
) : data && data.length > 0 ? (
  <List data={data} />
) : (
  <Empty />
)}
```

### Good: Early Returns
```javascript
// ✅ Clear logic flow
if (loading) return <Spinner />;
if (error) return <Error error={error} />;
if (!data?.length) return <Empty />;

return <List data={data} />;
```

---

## 📡 API Integration

### Bad Pattern
```javascript
// ❌ API call in component
function UserList() {
  const [users, setUsers] = useState([]);
  
  useEffect(() => {
    fetch('/api/users')
      .then(res => res.json())
      .then(setUsers);
  }, []);
  
  return <ul>{users.map(u => <li key={u.id}>{u.name}</li>)}</ul>;
}
```

### Good Pattern: Separate Concerns
```javascript
// api.js - All API logic
export async function fetchUsers() {
  const response = await fetch('/api/users');
  if (!response.ok) throw new Error('Failed to fetch users');
  return response.json();
}

// useFetch.js - Reusable hook
function useFetchUsers() {
  const [status, setStatus] = useState('pending');
  const [data, setData] = useState(null);
  const [error, setError] = useState(null);
  
  useEffect(() => {
    const load = async () => {
      try {
        const result = await fetchUsers();
        setData(result);
      } catch (err) {
        setError(err);
      } finally {
        setStatus('idle');
      }
    };
    
    load();
  }, []);
  
  return { status, data, error };
}

// Component - Simple
function UserList() {
  const { status, data: users, error } = useFetchUsers();
  
  if (status === 'pending') return <p>Loading...</p>;
  if (error) return <p>Error: {error.message}</p>;
  
  return <ul>{users.map(u => <li key={u.id}>{u.name}</li>)}</ul>;
}
```

---

## 📚 Constants & Enums

```javascript
// ❌ BAD: Magic values everywhere
if (user.status === 'active') { }
if (theme === 'light') { }

// ✅ GOOD: Centralized constants
// constants.js
export const USER_STATUS = {
  ACTIVE: 'active',
  INACTIVE: 'inactive',
  BANNED: 'banned'
};

export const THEMES = {
  LIGHT: 'light',
  DARK: 'dark'
};

// Usage
if (user.status === USER_STATUS.ACTIVE) { }
if (theme === THEMES.LIGHT) { }
```

---

## 🧪 Testing Patterns

### Component Testing
```javascript
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import Counter from './Counter';

describe('Counter', () => {
  it('increments count on button click', async () => {
    render(<Counter />);
    const button = screen.getByRole('button');
    
    await userEvent.click(button);
    
    expect(screen.getByText('Count: 1')).toBeInTheDocument();
  });
});
```

---

## 🔑 Common Props Patterns

### Forwarding Props
```javascript
// ❌ BAD: Manually pass each prop
function Button({ className, onClick, disabled, title, type }) {
  return (
    <button 
      className={className}
      onClick={onClick}
      disabled={disabled}
      title={title}
      type={type}
    />
  );
}

// ✅ GOOD: Use spread operator
function Button({ className, ...props }) {
  return <button className={`btn ${className}`} {...props} />;
}
```

### Children Pattern
```javascript
// Flexible wrapper
function Card({ children, title }) {
  return (
    <div className="card">
      {title && <h2>{title}</h2>}
      {children}
    </div>
  );
}

// Usage
<Card title="User Info">
  <p>Name: John</p>
  <p>Email: john@example.com</p>
</Card>
```

---

## 💡 Comments & Documentation

### Bad Comments
```javascript
// ❌ Obvious comments
const count = 0;  // Initialize count to 0
function onClick() {  // Click handler
  setCount(count + 1);  // Increment count
}
```

### Good Comments
```javascript
// ✅ When WHY is not obvious
const RETRY_ATTEMPTS = 3;  // API sometimes returns stale data after first try
const debounceDelay = 300;  // 300ms prevents excessive API calls when user types

// ✅ Complex logic explanation
const filtered = items.filter(item => {
  // Only include items from current month
  // and exclude future-dated items (for data consistency)
  const itemDate = new Date(item.date);
  const currentMonth = new Date().getMonth();
  return itemDate.getMonth() === currentMonth && itemDate <= new Date();
});
```

---

## 🔑 Key Takeaways

1. **Organize code** by feature/functionality
2. **Keep components small** and focused
3. **Use clear naming** conventions
4. **Separate concerns**: API, state, UI
5. **Centralize constants**
6. **Handle errors** gracefully
7. **Validate props** with PropTypes
8. **Write for readability** over brevity
9. **Test components** thoroughly
10. **Document** WHY, not WHAT
---

[← Previous: Component Optimization](17-optimization.md) | [Contents](README.md) | [Next: Debugging & Tools →](19-debugging.md)
