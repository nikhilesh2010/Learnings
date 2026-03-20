# 10: Forms & Input Handling

## 📝 What are Controlled Components?

A **controlled component** is when React controls the form input's value through state. The component re-renders whenever the value changes.

```
User types in input
    ↓
onChange fires
    ↓
State updates
    ↓
Input re-renders with new value
```

---

## 🎯 Controlled Input Components

### Basic Text Input
```javascript
function TextInput() {
  const [text, setText] = useState('');
  
  return (
    <>
      <input
        type="text"
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder="Type something..."
      />
      <p>You typed: {text}</p>
    </>
  );
}
```

### Multiple Inputs with Separate State
```javascript
function SignupForm() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  
  return (
    <form>
      <input
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="Email"
      />
      
      <input
        type="password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        placeholder="Password"
      />
      
      <input
        type="password"
        value={confirmPassword}
        onChange={(e) => setConfirmPassword(e.target.value)}
        placeholder="Confirm Password"
      />
    </form>
  );
}
```

### Multiple Inputs with Single Object
```javascript
function ContactForm() {
  const [form, setForm] = useState({
    name: '',
    email: '',
    message: ''
  });
  
  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm({
      ...form,
      [name]: value  // Dynamic key update
    });
  };
  
  return (
    <form>
      <input
        name="name"
        value={form.name}
        onChange={handleChange}
        placeholder="Your name"
      />
      
      <input
        name="email"
        type="email"
        value={form.email}
        onChange={handleChange}
        placeholder="Your email"
      />
      
      <textarea
        name="message"
        value={form.message}
        onChange={handleChange}
        placeholder="Your message"
      />
    </form>
  );
}
```

---

## ☑️ Checkboxes

### Single Checkbox
```javascript
function Newsletter() {
  const [subscribed, setSubscribed] = useState(false);
  
  const handleChange = (e) => {
    setSubscribed(e.target.checked);
  };
  
  return (
    <label>
      <input
        type="checkbox"
        checked={subscribed}
        onChange={handleChange}
      />
      Subscribe to newsletter
    </label>
  );
}
```

### Multiple Checkboxes
```javascript
function FormSettings() {
  const [settings, setSettings] = useState({
    emailNotifications: true,
    smsNotifications: false,
    pushNotifications: true
  });
  
  const handleChange = (e) => {
    const { name, checked } = e.target;
    setSettings({
      ...settings,
      [name]: checked
    });
  };
  
  return (
    <div>
      <label>
        <input
          name="emailNotifications"
          type="checkbox"
          checked={settings.emailNotifications}
          onChange={handleChange}
        />
        Email Notifications
      </label>
      
      <label>
        <input
          name="smsNotifications"
          type="checkbox"
          checked={settings.smsNotifications}
          onChange={handleChange}
        />
        SMS Notifications
      </label>
      
      <label>
        <input
          name="pushNotifications"
          type="checkbox"
          checked={settings.pushNotifications}
          onChange={handleChange}
        />
        Push Notifications
      </label>
    </div>
  );
}
```

---

## 🔘 Radio Buttons

```javascript
function PaymentMethod() {
  const [payment, setPayment] = useState('credit-card');
  
  const handleChange = (e) => {
    setPayment(e.target.value);
  };
  
  return (
    <div>
      <label>
        <input
          type="radio"
          value="credit-card"
          checked={payment === 'credit-card'}
          onChange={handleChange}
        />
        Credit Card
      </label>
      
      <label>
        <input
          type="radio"
          value="paypal"
          checked={payment === 'paypal'}
          onChange={handleChange}
        />
        PayPal
      </label>
      
      <label>
        <input
          type="radio"
          value="bank-transfer"
          checked={payment === 'bank-transfer'}
          onChange={handleChange}
        />
        Bank Transfer
      </label>
      
      <p>Selected: {payment}</p>
    </div>
  );
}
```

---

## 📋 Select/Dropdown

### Single Select
```javascript
function CountrySelector() {
  const [country, setCountry] = useState('');
  
  return (
    <>
      <select
        value={country}
        onChange={(e) => setCountry(e.target.value)}
      >
        <option value="">Select a country</option>
        <option value="us">United States</option>
        <option value="uk">United Kingdom</option>
        <option value="ca">Canada</option>
        <option value="au">Australia</option>
      </select>
      <p>Selected: {country}</p>
    </>
  );
}
```

### Multiple Select
```javascript
function TagSelector() {
  const [tags, setTags] = useState([]);
  
  const handleChange = (e) => {
    const selected = Array.from(e.target.selectedOptions, option => option.value);
    setTags(selected);
  };
  
  return (
    <>
      <select
        multiple
        value={tags}
        onChange={handleChange}
      >
        <option value="react">React</option>
        <option value="javascript">JavaScript</option>
        <option value="css">CSS</option>
        <option value="node">Node.js</option>
      </select>
      <p>Selected: {tags.join(', ')}</p>
    </>
  );
}
```

---

## 🎯 Form Submission

### Basic Form Submission
```javascript
function LoginForm() {
  const [form, setForm] = useState({
    username: '',
    password: ''
  });
  
  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm({ ...form, [name]: value });
  };
  
  const handleSubmit = (e) => {
    e.preventDefault();  // Prevent page reload
    
    if (form.username && form.password) {
      console.log('Logging in:', form);
      // Send to server
    } else {
      alert('Please fill all fields');
    }
  };
  
  return (
    <form onSubmit={handleSubmit}>
      <input
        name="username"
        value={form.username}
        onChange={handleChange}
        placeholder="Username"
      />
      
      <input
        name="password"
        type="password"
        value={form.password}
        onChange={handleChange}
        placeholder="Password"
      />
      
      <button type="submit">Login</button>
    </form>
  );
}
```

### Form with Validation
```javascript
function RegistrationForm() {
  const [form, setForm] = useState({
    email: '',
    password: '',
    confirmPassword: ''
  });
  const [errors, setErrors] = useState({});
  
  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm({ ...form, [name]: value });
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors({ ...errors, [name]: '' });
    }
  };
  
  const validate = () => {
    const newErrors = {};
    
    if (!form.email.includes('@')) {
      newErrors.email = 'Invalid email';
    }
    
    if (form.password.length < 6) {
      newErrors.password = 'Password must be 6+ characters';
    }
    
    if (form.password !== form.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }
    
    return newErrors;
  };
  
  const handleSubmit = (e) => {
    e.preventDefault();
    const newErrors = validate();
    
    if (Object.keys(newErrors).length === 0) {
      console.log('Form valid, registering...');
      // Send to server
    } else {
      setErrors(newErrors);
    }
  };
  
  return (
    <form onSubmit={handleSubmit}>
      <div>
        <input
          name="email"
          type="email"
          value={form.email}
          onChange={handleChange}
          placeholder="Email"
        />
        {errors.email && <p className="error">{errors.email}</p>}
      </div>
      
      <div>
        <input
          name="password"
          type="password"
          value={form.password}
          onChange={handleChange}
          placeholder="Password"
        />
        {errors.password && <p className="error">{errors.password}</p>}
      </div>
      
      <div>
        <input
          name="confirmPassword"
          type="password"
          value={form.confirmPassword}
          onChange={handleChange}
          placeholder="Confirm Password"
        />
        {errors.confirmPassword && <p className="error">{errors.confirmPassword}</p>}
      </div>
      
      <button type="submit">Register</button>
    </form>
  );
}
```

---

## 🎨 Complex Form Example

```javascript
function JobApplicationForm() {
  const [form, setForm] = useState({
    name: '',
    email: '',
    position: '',
    experience: '',
    skills: [],
    available: true,
    resume: null
  });
  
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    
    if (type === 'checkbox') {
      setForm({ ...form, [name]: checked });
    } else if (type === 'file') {
      setForm({ ...form, [name]: e.target.files[0] });
    } else {
      setForm({ ...form, [name]: value });
    }
  };
  
  const handleSkills = (e) => {
    const selected = Array.from(e.target.selectedOptions, option => option.value);
    setForm({ ...form, skills: selected });
  };
  
  const handleSubmit = (e) => {
    e.preventDefault();
    console.log('Application:', form);
  };
  
  return (
    <form onSubmit={handleSubmit}>
      <input
        name="name"
        value={form.name}
        onChange={handleChange}
        placeholder="Full Name"
      />
      
      <input
        name="email"
        type="email"
        value={form.email}
        onChange={handleChange}
        placeholder="Email"
      />
      
      <select name="position" value={form.position} onChange={handleChange}>
        <option value="">Select Position</option>
        <option value="frontend">Frontend Developer</option>
        <option value="backend">Backend Developer</option>
        <option value="fullstack">Full Stack Developer</option>
      </select>
      
      <input
        name="experience"
        type="number"
        value={form.experience}
        onChange={handleChange}
        placeholder="Years of Experience"
      />
      
      <select multiple value={form.skills} onChange={handleSkills}>
        <option value="react">React</option>
        <option value="javascript">JavaScript</option>
        <option value="node">Node.js</option>
        <option value="python">Python</option>
      </select>
      
      <label>
        <input
          type="checkbox"
          name="available"
          checked={form.available}
          onChange={handleChange}
        />
        Available to start immediately
      </label>
      
      <input
        type="file"
        name="resume"
        onChange={handleChange}
      />
      
      <button type="submit">Submit Application</button>
    </form>
  );
}
```

---

## ⚠️ Uncontrolled Components

Sometimes you might use **uncontrolled components** (not recommended for most cases):

```javascript
function UncontrolledInput() {
  const inputRef = useRef(null);
  
  const handleSubmit = (e) => {
    e.preventDefault();
    console.log('Value:', inputRef.current.value);
  };
  
  return (
    <form onSubmit={handleSubmit}>
      <input
        type="text"
        defaultValue="Initial value"  // Note: defaultValue, not value
        ref={inputRef}
      />
      <button type="submit">Submit</button>
    </form>
  );
}
```

**When to use:**
- Integrating with non-React code
- File inputs (can't be controlled)
- When you don't need to validate on change

---

## 🔑 Key Takeaways

1. Use **controlled components** (value + onChange)
2. Always call **e.preventDefault()** in form submit
3. For checkboxes, use **e.target.checked**
4. For selects, use **e.target.value**
5. For multiple inputs, use a **form object**
6. **Validate before submit**, not just on blur
7. **Provide clear error messages**
---

[← Previous: Lists & Keys](09-lists-and-keys.md) | [Contents](README.md) | [Next: useEffect Hook →](11-useeffect.md)
