# 13: useReducer Hook

## 🤔 When to Use useReducer?

**useReducer** is for managing **complex state** with multiple sub-values or when state transitions are related. It's like `useState` but more powerful.

```
Easy state?        → useState
Complex state?     → useReducer
```

---

## 📊 useState vs useReducer

| useState | useReducer |
|----------|-----------|
| Single value | Multiple related values |
| Simple updates | Complex logic |
| Fewer state variables | Predictable state changes |
| Good for forms | Good for apps |

---

## 🎯 Basic useReducer Pattern

### Anatomy

```javascript
import { useReducer } from 'react';

// 1. Define reducer function
function reducer(state, action) {
  switch(action.type) {
    case 'ACTION_1':
      return { ...state, property: newValue };
    case 'ACTION_2':
      return { ...state, property: anotherValue };
    default:
      return state;
  }
}

// 2. Use in component
function Component() {
  const [state, dispatch] = useReducer(reducer, initialState);
  
  // 3. Dispatch actions
  <button onClick={() => dispatch({ type: 'ACTION_1' })}>
    Click
  </button>
}
```

### Simple Counter Example

```javascript
import { useReducer } from 'react';

// Reducer function
function counterReducer(state, action) {
  switch(action.type) {
    case 'INCREMENT':
      return { count: state.count + 1 };
    case 'DECREMENT':
      return { count: state.count - 1 };
    case 'RESET':
      return { count: 0 };
    default:
      return state;
  }
}

// Component
function Counter() {
  const [state, dispatch] = useReducer(counterReducer, { count: 0 });
  
  return (
    <div>
      <p>Count: {state.count}</p>
      <button onClick={() => dispatch({ type: 'INCREMENT' })}>+</button>
      <button onClick={() => dispatch({ type: 'DECREMENT' })}>-</button>
      <button onClick={() => dispatch({ type: 'RESET' })}>Reset</button>
    </div>
  );
}
```

---

## 💾 Todo App with useReducer

### Basic Todo Reducer

```javascript
import { useReducer, useState } from 'react';

// Action types
const ACTIONS = {
  ADD_TODO: 'ADD_TODO',
  DELETE_TODO: 'DELETE_TODO',
  TOGGLE_TODO: 'TOGGLE_TODO',
  CLEAR_TODOS: 'CLEAR_TODOS'
};

// Reducer
function todoReducer(todos, action) {
  switch(action.type) {
    case ACTIONS.ADD_TODO:
      return [
        ...todos,
        { id: Date.now(), text: action.payload, completed: false }
      ];
    
    case ACTIONS.DELETE_TODO:
      return todos.filter(todo => todo.id !== action.payload);
    
    case ACTIONS.TOGGLE_TODO:
      return todos.map(todo =>
        todo.id === action.payload
          ? { ...todo, completed: !todo.completed }
          : todo
      );
    
    case ACTIONS.CLEAR_TODOS:
      return [];
    
    default:
      return todos;
  }
}

// Component
function TodoApp() {
  const [todos, dispatch] = useReducer(todoReducer, []);
  const [input, setInput] = useState('');
  
  const addTodo = () => {
    if (input.trim()) {
      dispatch({ type: ACTIONS.ADD_TODO, payload: input });
      setInput('');
    }
  };
  
  const deleteTodo = (id) => {
    dispatch({ type: ACTIONS.DELETE_TODO, payload: id });
  };
  
  const toggleTodo = (id) => {
    dispatch({ type: ACTIONS.TOGGLE_TODO, payload: id });
  };
  
  return (
    <div>
      <input
        value={input}
        onChange={(e) => setInput(e.target.value)}
        onKeyPress={(e) => e.key === 'Enter' && addTodo()}
      />
      <button onClick={addTodo}>Add Todo</button>
      
      <ul>
        {todos.map(todo => (
          <li key={todo.id}>
            <label>
              <input
                type="checkbox"
                checked={todo.completed}
                onChange={() => toggleTodo(todo.id)}
              />
              <span style={{
                textDecoration: todo.completed ? 'line-through' : 'none'
              }}>
                {todo.text}
              </span>
            </label>
            <button onClick={() => deleteTodo(todo.id)}>Delete</button>
          </li>
        ))}
      </ul>
      
      <button onClick={() => dispatch({ type: ACTIONS.CLEAR_TODOS })}>
        Clear All
      </button>
    </div>
  );
}
```

---

## 🛒 Complex State Management: Shopping Cart

```javascript
import { useReducer } from 'react';

// Actions
const CART_ACTIONS = {
  ADD_ITEM: 'ADD_ITEM',
  REMOVE_ITEM: 'REMOVE_ITEM',
  UPDATE_QUANTITY: 'UPDATE_QUANTITY',
  APPLY_DISCOUNT: 'APPLY_DISCOUNT',
  CLEAR_CART: 'CLEAR_CART'
};

// Reducer
function cartReducer(state, action) {
  switch(action.type) {
    case CART_ACTIONS.ADD_ITEM: {
      const existingItem = state.items.find(
        item => item.id === action.payload.id
      );
      
      if (existingItem) {
        return {
          ...state,
          items: state.items.map(item =>
            item.id === action.payload.id
              ? { ...item, quantity: item.quantity + 1 }
              : item
          )
        };
      }
      
      return {
        ...state,
        items: [...state.items, { ...action.payload, quantity: 1 }]
      };
    }
    
    case CART_ACTIONS.REMOVE_ITEM:
      return {
        ...state,
        items: state.items.filter(item => item.id !== action.payload)
      };
    
    case CART_ACTIONS.UPDATE_QUANTITY:
      return {
        ...state,
        items: state.items.map(item =>
          item.id === action.payload.id
            ? { ...item, quantity: action.payload.quantity }
            : item
        )
      };
    
    case CART_ACTIONS.APPLY_DISCOUNT:
      return {
        ...state,
        discountCode: action.payload
      };
    
    case CART_ACTIONS.CLEAR_CART:
      return { items: [], discountCode: null };
    
    default:
      return state;
  }
}

// Shopping Cart Component
function ShoppingCart() {
  const [cart, dispatch] = useReducer(cartReducer, {
    items: [],
    discountCode: null
  });
  
  // Calculate total
  const total = cart.items.reduce((sum, item) =>
    sum + (item.price * item.quantity), 0
  );
  
  const addToCart = (product) => {
    dispatch({ type: CART_ACTIONS.ADD_ITEM, payload: product });
  };
  
  const removeFromCart = (productId) => {
    dispatch({ type: CART_ACTIONS.REMOVE_ITEM, payload: productId });
  };
  
  const updateQuantity = (productId, quantity) => {
    dispatch({
      type: CART_ACTIONS.UPDATE_QUANTITY,
      payload: { id: productId, quantity }
    });
  };
  
  return (
    <div>
      <h2>Shopping Cart</h2>
      {cart.items.length === 0 ? (
        <p>Cart is empty</p>
      ) : (
        <>
          {cart.items.map(item => (
            <div key={item.id}>
              <p>{item.name} - ${item.price}</p>
              <input
                type="number"
                min="1"
                value={item.quantity}
                onChange={(e) => updateQuantity(item.id, parseInt(e.target.value))}
              />
              <button onClick={() => removeFromCart(item.id)}>Remove</button>
            </div>
          ))}
          <h3>Total: ${total}</h3>
          <button onClick={() => dispatch({ type: CART_ACTIONS.CLEAR_CART })}>
            Clear Cart
          </button>
        </>
      )}
    </div>
  );
}
```

---

## 🎭 Form Reducer

```javascript
const FORM_ACTIONS = {
  SET_FIELD: 'SET_FIELD',
  SET_ERROR: 'SET_ERROR',
  RESET: 'RESET',
  SUBMIT: 'SUBMIT'
};

function formReducer(state, action) {
  switch(action.type) {
    case FORM_ACTIONS.SET_FIELD:
      return {
        ...state,
        values: {
          ...state.values,
          [action.payload.name]: action.payload.value
        },
        errors: {
          ...state.errors,
          [action.payload.name]: ''
        }
      };
    
    case FORM_ACTIONS.SET_ERROR:
      return {
        ...state,
        errors: {
          ...state.errors,
          ...action.payload
        }
      };
    
    case FORM_ACTIONS.RESET:
      return action.payload;
    
    case FORM_ACTIONS.SUBMIT:
      return {
        ...state,
        isSubmitting: true
      };
    
    default:
      return state;
  }
}

// Usage
function FormComponent() {
  const initialState = {
    values: { email: '', password: '' },
    errors: {},
    isSubmitting: false
  };
  
  const [form, dispatch] = useReducer(formReducer, initialState);
  
  const handleChange = (e) => {
    dispatch({
      type: FORM_ACTIONS.SET_FIELD,
      payload: { name: e.target.name, value: e.target.value }
    });
  };
  
  const handleSubmit = (e) => {
    e.preventDefault();
    dispatch({ type: FORM_ACTIONS.SUBMIT });
    // Validate and submit...
  };
  
  return (
    <form onSubmit={handleSubmit}>
      <input
        name="email"
        value={form.values.email}
        onChange={handleChange}
      />
      {form.errors.email && <p className="error">{form.errors.email}</p>}
      
      <input
        name="password"
        value={form.values.password}
        onChange={handleChange}
      />
      {form.errors.password && <p className="error">{form.errors.password}</p>}
      
      <button disabled={form.isSubmitting}>Submit</button>
    </form>
  );
}
```

---

## ⚠️ Common useReducer Mistakes

### Mistake 1: Mutating State
```javascript
// ❌ WRONG - Mutating state
case 'UPDATE':
  state.items[0] = newItem;
  return state;

// ✅ CORRECT - Return new state
case 'UPDATE':
  return {
    ...state,
    items: state.items.map((item, i) => i === 0 ? newItem : item)
  };
```

### Mistake 2: Forgetting Default Case
```javascript
// ❌ WRONG - What if action is not recognized?
function reducer(state, action) {
  switch(action.type) {
    case 'A': return newState;
  }
}

// ✅ CORRECT
function reducer(state, action) {
  switch(action.type) {
    case 'A': return newState;
    default: return state;  // Always handle default
  }
}
```

### Mistake 3: Complex Reducers
```javascript
// If reducer gets too complex, break it into smaller functions
function reducer(state, action) {
  const handlers = {
    'ADD': addHandler,
    'DELETE': deleteHandler,
    'UPDATE': updateHandler,
  };
  
  const handler = handlers[action.type];
  return handler ? handler(state, action) : state;
}
```

---

## 🔑 Key Takeaways

1. **useReducer** handles complex state
2. **Reducer** is a pure function: `(state, action) => newState`
3. **Actions** describe what happened
4. **Dispatch** sends actions to reducer
5. Never **mutate** state directly
6. Always include a **default case**
7. Good for related state values
---

[← Previous: useContext Hook](12-usecontext.md) | [Contents](README.md) | [Next: Custom Hooks →](14-custom-hooks.md)
