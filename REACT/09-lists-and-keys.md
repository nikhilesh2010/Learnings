# 09: Lists & Keys

## 📋 Rendering Lists

Displaying multiple items from arrays is one of the most common tasks in React. Use the `.map()` method to transform arrays into components.

---

## 📝 Basic List Rendering

### Simple List
```javascript
function FruitList() {
  const fruits = ['apple', 'banana', 'orange', 'mango'];
  
  return (
    <ul>
      {fruits.map(fruit => (
        <li>{fruit}</li>
      ))}
    </ul>
  );
}

// Renders:
// • apple
// • banana
// • orange
// • mango
```

### List of Objects
```javascript
function UserList() {
  const users = [
    { id: 1, name: 'Alice', age: 25 },
    { id: 2, name: 'Bob', age: 30 },
    { id: 3, name: 'Carol', age: 28 }
  ];
  
  return (
    <ul>
      {users.map(user => (
        <li>{user.name} - Age {user.age}</li>
      ))}
    </ul>
  );
}
```

### List with Components
```javascript
function TodoList() {
  const todos = [
    { id: 1, text: 'Learn React' },
    { id: 2, text: 'Build a project' },
    { id: 3, text: 'Deploy app' }
  ];
  
  return (
    <div>
      {todos.map(todo => (
        <TodoItem key={todo.id} todo={todo} />
      ))}
    </div>
  );
}

function TodoItem({ todo }) {
  return <p>✓ {todo.text}</p>;
}
```

---

## 🔑 Why Keys Matter

### Without Keys (❌ INEFFICIENT)

```javascript
const items = ['item1', 'item2', 'item3'];

{items.map((item, index) => (
  <li key={index}>{item}</li>
))}

// Problems:
// - When items are reordered, React doesn't know what changed
// - If items have state (like input values), they get confused
// - Performance suffers
// - Bugs can occur!
```

### With Keys (✅ EFFICIENT)

```javascript
const items = [
  { id: 'unique-1', text: 'item1' },
  { id: 'unique-2', text: 'item2' },
  { id: 'unique-3', text: 'item3' }
];

{items.map(item => (
  <li key={item.id}>{item.text}</li>
))}

// Benefits:
// - React knows which item is which
// - Reordering works perfectly
// - State stays with correct item
// - Better performance
```

---

## 🎯 Key Rules

### Rule 1: Keys Must Be Unique
```javascript
// ❌ WRONG - Not unique
{items.map(item => (
  <li key="item">{item.name}</li>
))}

// ✅ CORRECT - Unique for each item
{items.map(item => (
  <li key={item.id}>{item.name}</li>
))}
```

### Rule 2: Don't Use Index as Key
```javascript
// ❌ NOT RECOMMENDED
{items.map((item, index) => (
  <li key={index}>{item.name}</li>
))}
// Works only if list is static (never reordered/filtered)

// ✅ BETTER
{items.map(item => (
  <li key={item.id}>{item.name}</li>
))}
```

### Rule 3: Keys Must Be Consistent
```javascript
// ❌ WRONG - Key changes between renders
const randomKey = Math.random();
{items.map(item => (
  <li key={randomKey}>{item.name}</li>
))}

// ✅ CORRECT - Same key every render
{items.map(item => (
  <li key={item.id}>{item.name}</li>
))}
```

### Rule 4: Global Uniqueness Not Required
```javascript
// ✅ OK - Keys only need to be unique within the list
<ul>
  {items.map(item => <li key={item.id}>{item.name}</li>)}
</ul>
<ul>
  {items.map(item => <li key={item.id}>{item.name}</li>)}
</ul>
// Same IDs in different lists = OK
```

---

## 🔄 List Updates Example

### Dynamic List with Add/Remove

```javascript
function TodoApp() {
  const [todos, setTodos] = useState([
    { id: 1, text: 'Buy milk' },
    { id: 2, text: 'Learn React' }
  ]);
  const [input, setInput] = useState('');
  
  // Add todo
  const addTodo = () => {
    if (input.trim()) {
      setTodos([
        ...todos,
        { id: Date.now(), text: input }
      ]);
      setInput('');
    }
  };
  
  // Remove todo
  const removeTodo = (id) => {
    setTodos(todos.filter(todo => todo.id !== id));
  };
  
  return (
    <div>
      <input 
        value={input}
        onChange={(e) => setInput(e.target.value)}
      />
      <button onClick={addTodo}>Add</button>
      
      <ul>
        {todos.map(todo => (
          <li key={todo.id}>
            {todo.text}
            <button onClick={() => removeTodo(todo.id)}>
              Delete
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}
```

**Key Points:**
- Each todo has **unique ID** (`Date.now()` or UUID)
- ID is used as **key**
- When removed, React knows exactly which item to remove
- Input values stay correct when items are reordered

---

## 📊 Practical List Examples

### Example 1: Filtered List
```javascript
function ProductFilter() {
  const [category, setCategory] = useState('all');
  
  const products = [
    { id: 1, name: 'Laptop', cat: 'electronics' },
    { id: 2, name: 'Shirt', cat: 'clothing' },
    { id: 3, name: 'Phone', cat: 'electronics' }
  ];
  
  const filtered = category === 'all' 
    ? products 
    : products.filter(p => p.cat === category);
  
  return (
    <>
      <select value={category} onChange={(e) => setCategory(e.target.value)}>
        <option value="all">All</option>
        <option value="electronics">Electronics</option>
        <option value="clothing">Clothing</option>
      </select>
      
      <ul>
        {filtered.map(product => (
          <li key={product.id}>{product.name}</li>
        ))}
      </ul>
    </>
  );
}
```

### Example 2: Sortable List
```javascript
function StudentList() {
  const [students, setStudents] = useState([
    { id: 1, name: 'Alice', grade: 'A' },
    { id: 2, name: 'Bob', grade: 'B' },
    { id: 3, name: 'Carol', grade: 'A' }
  ]);
  
  const [sortBy, setSortBy] = useState('name');
  
  const sorted = [...students].sort((a, b) => {
    if (sortBy === 'name') {
      return a.name.localeCompare(b.name);
    } else {
      return a.grade.localeCompare(b.grade);
    }
  });
  
  return (
    <>
      <select value={sortBy} onChange={(e) => setSortBy(e.target.value)}>
        <option value="name">Sort by Name</option>
        <option value="grade">Sort by Grade</option>
      </select>
      
      <ul>
        {sorted.map(student => (
          <li key={student.id}>
            {student.name} - {student.grade}
          </li>
        ))}
      </ul>
    </>
  );
}
```

### Example 3: Nested Lists
```javascript
function CourseList() {
  const courses = [
    {
      id: 1,
      name: 'React',
      lessons: [
        { id: 'r1', title: 'JSX' },
        { id: 'r2', title: 'Props' }
      ]
    },
    {
      id: 2,
      name: 'JavaScript',
      lessons: [
        { id: 'j1', title: 'Variables' },
        { id: 'j2', title: 'Functions' }
      ]
    }
  ];
  
  return (
    <div>
      {courses.map(course => (
        <div key={course.id}>
          <h2>{course.name}</h2>
          <ul>
            {course.lessons.map(lesson => (
              <li key={lesson.id}>{lesson.title}</li>
            ))}
          </ul>
        </div>
      ))}
    </div>
  );
}
```

### Example 4: List with Search
```javascript
function SearchableList() {
  const [search, setSearch] = useState('');
  
  const items = [
    { id: 1, name: 'Apple' },
    { id: 2, name: 'Apricot' },
    { id: 3, name: 'Banana' },
    { id: 4, name: 'Blueberry' }
  ];
  
  const filtered = items.filter(item =>
    item.name.toLowerCase().includes(search.toLowerCase())
  );
  
  return (
    <>
      <input
        placeholder="Search..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
      />
      
      <ul>
        {filtered.map(item => (
          <li key={item.id}>{item.name}</li>
        ))}
      </ul>
      
      {filtered.length === 0 && (
        <p>No results found</p>
      )}
    </>
  );
}
```

---

## 🎯 Common Map Operations

### Map with Index (Use with Caution!)
```javascript
{items.map((item, index) => (
  <li key={item.id}>
    {index + 1}. {item.name}
  </li>
))}
```

### Conditional Map
```javascript
{items
  .filter(item => item.active)
  .map(item => (
    <li key={item.id}>{item.name}</li>
  ))
}
```

### Map with Default Values
```javascript
{items.map(item => (
  <li key={item.id}>
    {item.name || 'Unnamed'}
  </li>
))}
```

---

## ⚠️ Common List Mistakes

| ❌ Wrong | ✅ Correct |
|---------|-----------|
| `key={index}` (for reorderable lists) | `key={item.id}` |
| `key={Math.random()}` | `key={item.id}` (stable) |
| Duplicate keys | Each item has unique key |
| Key on outer div instead of mapped element | Key on mapped child |
| Mutating during map | Use filter, map, spread operator |
| Forgetting to return JSX | Always return JSX from map |

---

## 🔑 Key Takeaways

1. Use `.map()` to **render lists**
2. **Always use keys** on list items
3. Keys should be **unique** and **stable**
4. Use **item ID**, not array index
5. Keys help React identify **which items changed**
6. **Never use random values** as keys
7. Keys improve **performance** and prevent **bugs**
---

[← Previous: Conditional Rendering](08-conditional-rendering.md) | [Contents](README.md) | [Next: Forms & Input Handling →](10-forms.md)
