# 07: Event Handling

## 🎯 What are Events?

**Events** are user interactions like clicks, typing, hovering, etc. React lets you respond to these events with event handlers.

```
User Action (click, type, hover)
    ↓
Event fires
    ↓
Event handler function runs
    ↓
State updates / UI changes
    ↓
Component re-renders
```

---

## 🖱️ Common Events

### Click Events
```javascript
function ClickExample() {
  const handleClick = () => {
    console.log('Button clicked!');
  };
  
  return <button onClick={handleClick}>Click me</button>;
}
```

### Input Events
```javascript
function InputExample() {
  const [text, setText] = useState('');
  
  const handleChange = (e) => {
    setText(e.target.value);
  };
  
  return (
    <>
      <input onChange={handleChange} value={text} />
      <p>You typed: {text}</p>
    </>
  );
}
```

### Form Events
```javascript
function FormExample() {
  const handleSubmit = (e) => {
    e.preventDefault();  // Prevent page reload
    console.log('Form submitted!');
  };
  
  return (
    <form onSubmit={handleSubmit}>
      <input type="text" />
      <button type="submit">Submit</button>
    </form>
  );
}
```

### Focus Events
```javascript
function FocusExample() {
  const [isFocused, setIsFocused] = useState(false);
  
  return (
    <>
      <input
        onFocus={() => setIsFocused(true)}
        onBlur={() => setIsFocused(false)}
      />
      <p>{isFocused ? 'Input is focused' : 'Input is blurred'}</p>
    </>
  );
}
```

### Mouse Events
```javascript
function MouseExample() {
  const [isHovered, setIsHovered] = useState(false);
  
  return (
    <div
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      style={{ backgroundColor: isHovered ? 'lightblue' : 'white' }}
    >
      Hover over me!
    </div>
  );
}
```

---

## 📋 Event Handler Syntax

### Method 1: Arrow Function (RECOMMENDED ⭐)
```javascript
function Button() {
  const handleClick = () => {
    console.log('Clicked!');
  };
  
  return <button onClick={handleClick}>Click</button>;
}
```

### Method 2: Inline Arrow Function
```javascript
function Button() {
  return (
    <button onClick={() => console.log('Clicked!')}>
      Click
    </button>
  );
}
```

### Method 3: Named Function
```javascript
function Button() {
  function handleClick() {
    console.log('Clicked!');
  }
  
  return <button onClick={handleClick}>Click</button>;
}
```

### ❌ COMMON MISTAKE - Don't call the function!
```javascript
// ❌ WRONG - This calls the function immediately!
<button onClick={handleClick()}>Click</button>

// ✅ CORRECT - Pass the function, don't call it
<button onClick={handleClick}>Click</button>

// ✅ ALSO CORRECT - Use arrow function
<button onClick={() => handleClick()}>Click</button>
```

---

## 📤 Accessing Event Object

The **event object** contains information about what happened.

```javascript
function EventExample() {
  const handleClick = (e) => {
    console.log('Event:', e);
    console.log('Target:', e.target);
    console.log('Type:', e.type);
  };
  
  return <button onClick={handleClick}>Click me</button>;
}
```

### Common Event Properties

```javascript
function InputExample() {
  const handleChange = (e) => {
    const value = e.target.value;      // Input value
    const name = e.target.name;        // Input name
    const type = e.target.type;        // Input type
    const checked = e.target.checked;  // For checkboxes
    
    console.log(value, name, type, checked);
  };
  
  return (
    <input 
      name="email"
      onChange={handleChange}
      placeholder="Enter email"
    />
  );
}
```

---

## 🎯 Practical Examples

### Example 1: Form with Multiple Inputs
```javascript
function LoginForm() {
  const [form, setForm] = useState({
    email: '',
    password: '',
    rememberMe: false
  });
  
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    
    setForm({
      ...form,
      [name]: type === 'checkbox' ? checked : value
    });
  };
  
  const handleSubmit = (e) => {
    e.preventDefault();
    console.log('Login:', form);
  };
  
  return (
    <form onSubmit={handleSubmit}>
      <input
        name="email"
        type="email"
        value={form.email}
        onChange={handleChange}
        placeholder="Email"
      />
      
      <input
        name="password"
        type="password"
        value={form.password}
        onChange={handleChange}
        placeholder="Password"
      />
      
      <label>
        <input
          name="rememberMe"
          type="checkbox"
          checked={form.rememberMe}
          onChange={handleChange}
        />
        Remember me
      </label>
      
      <button type="submit">Login</button>
    </form>
  );
}
```

### Example 2: Counter with Multiple Operations
```javascript
function Counter() {
  const [count, setCount] = useState(0);
  
  const increment = () => setCount(count + 1);
  const decrement = () => setCount(count - 1);
  const reset = () => setCount(0);
  const add = (num) => setCount(count + num);
  
  return (
    <div>
      <p>Count: {count}</p>
      <button onClick={increment}>+1</button>
      <button onClick={decrement}>-1</button>
      <button onClick={() => add(10)}>+10</button>
      <button onClick={reset}>Reset</button>
    </div>
  );
}
```

### Example 3: Dropdown with Change Handler
```javascript
function SelectExample() {
  const [category, setCategory] = useState('');
  
  const handleChange = (e) => {
    setCategory(e.target.value);
  };
  
  return (
    <>
      <select value={category} onChange={handleChange}>
        <option value="">Select a category</option>
        <option value="react">React</option>
        <option value="javascript">JavaScript</option>
        <option value="css">CSS</option>
      </select>
      <p>Selected: {category}</p>
    </>
  );
}
```

### Example 4: Keyboard Events
```javascript
function SearchBox() {
  const [search, setSearch] = useState('');
  
  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      console.log('Searching for:', search);
    }
  };
  
  return (
    <input
      value={search}
      onChange={(e) => setSearch(e.target.value)}
      onKeyDown={handleKeyDown}
      placeholder="Press Enter to search"
    />
  );
}
```

---

## 💦 Event Propagation

### Bubbling (Default)
```javascript
function BubblingExample() {
  const handleParentClick = () => console.log('Parent clicked');
  const handleChildClick = (e) => {
    console.log('Child clicked');
    // Event bubbles up to parent (both logs appear)
  };
  
  return (
    <div onClick={handleParentClick}>
      Parent
      <button onClick={handleChildClick}>Child</button>
    </div>
  );
}

// When button clicked:
// Console: "Child clicked"
// Console: "Parent clicked"
```

### Stopping Propagation
```javascript
function StopBubblingExample() {
  const handleParentClick = () => console.log('Parent clicked');
  const handleChildClick = (e) => {
    e.stopPropagation();  // Stops event from bubbling up
    console.log('Child clicked');
  };
  
  return (
    <div onClick={handleParentClick}>
      Parent
      <button onClick={handleChildClick}>Child</button>
    </div>
  );
}

// When button clicked:
// Console: "Child clicked"
// Parent handler is NOT called
```

---

## 📋 Common Event Types

```javascript
function EventTypes() {
  return (
    <div>
      {/* Mouse Events */}
      <div onClick={() => {}}>onClick</div>
      <div onDoubleClick={() => {}}>onDoubleClick</div>
      <div onMouseDown={() => {}}>onMouseDown</div>
      <div onMouseUp={() => {}}>onMouseUp</div>
      <div onMouseEnter={() => {}}>onMouseEnter</div>
      <div onMouseLeave={() => {}}>onMouseLeave</div>
      
      {/* Form Events */}
      <input onChange={() => {}} />
      <input onFocus={() => {}} />
      <input onBlur={() => {}} />
      <form onSubmit={() => {}}>
        <button>Submit</button>
      </form>
      
      {/* Keyboard Events */}
      <input onKeyDown={() => {}} />
      <input onKeyUp={() => {}} />
      <input onKeyPress={() => {}} />
    </div>
  );
}
```

---

## 🔑 Key Takeaways

1. Events are **user interactions** (clicks, typing, etc.)
2. Use **camelCase** for event names (`onClick`, not `onclick`)
3. Pass **function references**, don't call the function
4. Use **arrow functions** for cleaner syntax
5. Access **event data** via `e.target`
6. Use **preventDefault()** to stop default behavior
7. Use **stopPropagation()** to stop event bubbling

---

## ⚠️ Common Mistakes

| ❌ Wrong | ✅ Correct |
|---------|-----------|
| `onClick={handleClick()}` | `onClick={handleClick}` |
| `onclick` (lowercase) | `onClick` (camelCase) |
| Forget `e.preventDefault()` in form | Always prevent default |
| `value={form.email}` without onChange | Always add onChange handler |
| Multiple handlers with same name | Each needs unique name |
---

[← Previous: Virtual DOM & Rendering](06-virtual-dom.md) | [Contents](README.md) | [Next: Conditional Rendering →](08-conditional-rendering.md)
