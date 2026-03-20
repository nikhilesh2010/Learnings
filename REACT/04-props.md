# 04: Props

## 🎁 What are Props?

**Props** (Properties) are how you pass data from a **parent component to a child component**. They're like function parameters.

```
Parent Component
     ↓ (passes data)
Props
     ↓
Child Component
```

---

## 📝 Basic Props Usage

### Passing Props

```javascript
function App() {
  return (
    // Parent passes props like HTML attributes
    <Welcome name="Alice" age={25} />
  );
}
```

### Receiving Props

```javascript
// Option 1: Receive all props as an object
function Welcome(props) {
  return (
    <div>
      <h1>Hello {props.name}!</h1>
      <p>Age: {props.age}</p>
    </div>
  );
}

// Option 2: Destructure props (PREFERRED ⭐)
function Welcome({ name, age }) {
  return (
    <div>
      <h1>Hello {name}!</h1>
      <p>Age: {age}</p>
    </div>
  );
}
```

**Both work, but destructuring is cleaner!**

---

## 🔖 Different Data Types

### Strings
```javascript
<Greeting message="Hello World" />

function Greeting({ message }) {
  return <p>{message}</p>;
}
```

### Numbers
```javascript
<Price amount={99.99} />

function Price({ amount }) {
  return <p>${amount}</p>;
}
```

### Booleans
```javascript
<Button disabled={true} />
<Button disabled={false} />

// Shorthand
<Button disabled />
```

### Objects
```javascript
const user = { name: 'John', age: 30 };

<UserCard user={user} />

function UserCard({ user }) {
  return (
    <div>
      <h1>{user.name}</h1>
      <p>{user.age}</p>
    </div>
  );
}
```

### Arrays
```javascript
const items = ['apple', 'banana', 'orange'];

<List items={items} />

function List({ items }) {
  return (
    <ul>
      {items.map(item => (
        <li key={item}>{item}</li>
      ))}
    </ul>
  );
}
```

### Functions
```javascript
<Button onClick={() => console.log('Clicked!')} />

function Button({ onClick }) {
  return <button onClick={onClick}>Click me</button>;
}
```

---

## 🎯 Props Flow & Data Binding

### Parent Controls Child

```javascript
function Parent() {
  const [count, setCount] = useState(0);
  
  return (
    <>
      <p>Current count: {count}</p>
      <button onClick={() => setCount(count + 1)}>Increase</button>
      
      {/* Pass count and setter to child */}
      <Child count={count} onCountChange={setCount} />
    </>
  );
}

function Child({ count, onCountChange }) {
  return (
    <div>
      <p>Child sees: {count}</p>
      <button onClick={() => onCountChange(count + 1)}>
        Child can also increase
      </button>
    </div>
  );
}
```

### Multiple Props Example

```javascript
function App() {
  return (
    <ProductCard
      id={123}
      name="Laptop"
      price={999}
      inStock={true}
      image="laptop.jpg"
      onBuy={() => console.log('Buying!')}
    />
  );
}

function ProductCard({ 
  id, 
  name, 
  price, 
  inStock, 
  image, 
  onBuy 
}) {
  return (
    <div className="card">
      <img src={image} alt={name} />
      <h2>{name}</h2>
      <p>${price}</p>
      <p>{inStock ? 'In Stock' : 'Out of Stock'}</p>
      <button onClick={onBuy} disabled={!inStock}>
        Buy Now
      </button>
    </div>
  );
}
```

---

## 🔐 Props are Read-Only

### ❌ WRONG - Don't modify props

```javascript
function Card({ name }) {
  // ❌ This doesn't work and will cause errors!
  name = 'Bob';
  
  return <p>{name}</p>;
}
```

### ✅ CORRECT - Use state for mutable data

```javascript
function Card({ initialName }) {
  const [name, setName] = useState(initialName);
  
  return (
    <>
      <p>{name}</p>
      <button onClick={() => setName('Bob')}>Change Name</button>
    </>
  );
}
```

**Remember:** Props are like function parameters - you read them, don't change them!

---

## 🎭 Default Props

### Using Destructuring with Defaults

```javascript
// Modern way (Function Components)
function Greeting({ name = 'Guest', age = 0 }) {
  return (
    <div>
      <h1>Hello {name}!</h1>
      <p>Age: {age}</p>
    </div>
  );
}

// Usage
<Greeting />  // Uses defaults
<Greeting name="Alice" />  // Uses provided name and default age
<Greeting name="Bob" age={30} />  // Uses both provided values
```

### Using defaultProps (older pattern)

```javascript
function Greeting({ name, age }) {
  return (
    <div>
      <h1>Hello {name}!</h1>
      <p>Age: {age}</p>
    </div>
  );
}

Greeting.defaultProps = {
  name: 'Guest',
  age: 0
};
```

---

## 📤 Passing Props Down Multiple Levels

### Props Drilling (Passing through intermediate components)

```javascript
function App() {
  const [theme, setTheme] = useState('light');
  
  return (
    <Header theme={theme} onThemeChange={setTheme} />
  );
}

function Header({ theme, onThemeChange }) {
  // Header receives theme and passes it down
  return (
    <div>
      <Logo theme={theme} />
      <ThemeToggle theme={theme} onToggle={onThemeChange} />
    </div>
  );
}

function Logo({ theme }) {
  return <div className={theme}>Logo</div>;
}

function ThemeToggle({ theme, onToggle }) {
  return (
    <button onClick={() => onToggle(theme === 'light' ? 'dark' : 'light')}>
      Toggle Theme
    </button>
  );
}
```

**Note:** For deeply nested data, consider using Context (covered later)

---

## 💾 Practical Examples

### Example 1: Reusable Button Component

```javascript
function Button({ 
  label = 'Click me',
  type = 'button',
  disabled = false,
  onClick = () => {}
}) {
  return (
    <button type={type} disabled={disabled} onClick={onClick}>
      {label}
    </button>
  );
}

// Usage
<Button label="Submit" onClick={handleSubmit} />
<Button label="Delete" type="submit" disabled />
<Button />  // Uses all defaults
```

### Example 2: Product List

```javascript
function ProductList({ products, onSelect }) {
  return (
    <div className="products">
      {products.map(product => (
        <ProductItem 
          key={product.id}
          product={product}
          onSelect={onSelect}
        />
      ))}
    </div>
  );
}

function ProductItem({ product, onSelect }) {
  return (
    <div className="product" onClick={() => onSelect(product)}>
      <h3>{product.name}</h3>
      <p>${product.price}</p>
    </div>
  );
}

// Usage
const products = [
  { id: 1, name: 'Laptop', price: 999 },
  { id: 2, name: 'Phone', price: 599 }
];

<ProductList 
  products={products}
  onSelect={(product) => console.log(product)}
/>
```

---

## ⚠️ Common Props Issues

| ❌ Wrong | ✅ Correct |
|---------|-----------|
| Modifying props directly | Use state for changes |
| Forgetting to pass props | Pass all needed data |
| Prop names with hyphens | Use camelCase |
| Boolean without value: `disabled` | Explicit: `disabled={true}` |
| Circular prop passing | One-way data flow (parent → child) |

---

## 🔑 Key Takeaways

1. Props are how **parent passes data to child**
2. Props are **read-only** - don't modify them
3. **Destructure props** for cleaner code
4. Props can be **any JavaScript data type**
5. **Default values** prevent undefined errors
6. Data flows **one direction only** (parent → child)
7. For callbacks, pass **functions as props**
---

[← Previous: Components](03-components.md) | [Contents](README.md) | [Next: State & Hooks →](05-state-and-hooks.md)
