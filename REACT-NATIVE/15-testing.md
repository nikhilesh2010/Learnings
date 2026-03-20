# 15: Testing

## 🧪 Testing Stack

| Tool | Purpose |
|------|---------|
| **Jest** | Test runner, assertions, mocking |
| **React Native Testing Library (RNTL)** | Component testing |
| **Maestro** | End-to-end (E2E) UI testing |
| **Detox** | E2E testing (CI/CD focused) |

---

## ⚙️ Setup

Expo and React Native CLI projects come with Jest pre-configured.

```bash
# Install RNTL
npm install --save-dev @testing-library/react-native @testing-library/jest-native

# jest.config.js
module.exports = {
  preset: 'jest-expo',      // or 'react-native'
  setupFilesAfterFramework: ['@testing-library/jest-native/extend-expect'],
  transformIgnorePatterns: [
    'node_modules/(?!((jest-)?react-native|@react-native(-community)?)|expo(nent)?|@expo(nent)?/.*|@expo-google-fonts/.*|react-navigation|@react-navigation/.*|@unimodules/.*|unimodules|sentry-expo|native-base|react-native-svg)',
  ],
};
```

---

## 🧩 Unit Tests (Pure Functions)

```javascript
// utils/formatters.ts
export function formatPrice(cents: number, currency = 'USD'): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
  }).format(cents / 100);
}

export function truncate(str: string, maxLength: number): string {
  if (str.length <= maxLength) return str;
  return str.slice(0, maxLength - 3) + '...';
}

// utils/__tests__/formatters.test.ts
import { formatPrice, truncate } from '../formatters';

describe('formatPrice', () => {
  it('formats cents to USD', () => {
    expect(formatPrice(1999)).toBe('$19.99');
  });

  it('formats EUR currency', () => {
    expect(formatPrice(2000, 'EUR')).toBe('€20.00');
  });
});

describe('truncate', () => {
  it('returns string unchanged when within limit', () => {
    expect(truncate('Hello', 10)).toBe('Hello');
  });

  it('truncates and adds ellipsis', () => {
    expect(truncate('Hello World', 8)).toBe('Hello...');
  });
});
```

---

## 🔬 Component Tests (RNTL)

```javascript
// components/__tests__/UserCard.test.tsx
import React from 'react';
import { render, fireEvent, screen } from '@testing-library/react-native';
import UserCard from '../UserCard';

const mockUser = {
  id: '1',
  name: 'Alice Johnson',
  email: 'alice@example.com',
  avatar: 'https://example.com/avatar.jpg',
};

describe('UserCard', () => {
  it('renders user name', () => {
    render(<UserCard user={mockUser} onFollow={() => {}} />);
    expect(screen.getByText('Alice Johnson')).toBeTruthy();
  });

  it('renders user email', () => {
    render(<UserCard user={mockUser} onFollow={() => {}} />);
    expect(screen.getByText('alice@example.com')).toBeTruthy();
  });

  it('calls onFollow when Follow button is pressed', () => {
    const onFollow = jest.fn();
    render(<UserCard user={mockUser} onFollow={onFollow} />);

    fireEvent.press(screen.getByText('Follow'));

    expect(onFollow).toHaveBeenCalledWith('1');
    expect(onFollow).toHaveBeenCalledTimes(1);
  });

  it('shows "Following" when user is followed', () => {
    render(<UserCard user={mockUser} onFollow={() => {}} isFollowing />);
    expect(screen.getByText('Following')).toBeTruthy();
  });
});
```

---

## 🎣 Testing Hooks

```javascript
import { renderHook, act } from '@testing-library/react-native';
import { useCounter } from '../useCounter';

describe('useCounter', () => {
  it('initializes with default value', () => {
    const { result } = renderHook(() => useCounter(0));
    expect(result.current.count).toBe(0);
  });

  it('increments count', () => {
    const { result } = renderHook(() => useCounter(0));

    act(() => {
      result.current.increment();
    });

    expect(result.current.count).toBe(1);
  });

  it('respects max value', () => {
    const { result } = renderHook(() => useCounter(0, { max: 3 }));

    act(() => {
      result.current.increment();
      result.current.increment();
      result.current.increment();
      result.current.increment(); // should not go above max
    });

    expect(result.current.count).toBe(3);
  });
});
```

---

## 🌐 Testing API Calls (Mocking)

```javascript
// services/__tests__/userService.test.ts
import axios from 'axios';
import { userService } from '../userService';

jest.mock('axios');
const mockedAxios = axios as jest.Mocked<typeof axios>;

describe('userService', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  it('fetches user profile', async () => {
    const mockProfile = { id: '1', name: 'Alice', email: 'alice@test.com' };
    mockedAxios.get.mockResolvedValueOnce({ data: mockProfile });

    const result = await userService.getProfile();

    expect(result).toEqual(mockProfile);
    expect(mockedAxios.get).toHaveBeenCalledWith('/profile');
  });

  it('handles network error', async () => {
    mockedAxios.get.mockRejectedValueOnce(new Error('Network Error'));

    await expect(userService.getProfile()).rejects.toThrow('Network Error');
  });
});
```

---

## 🏪 Testing with Store (Zustand / Redux)

### Zustand

```javascript
import { render, fireEvent, screen } from '@testing-library/react-native';
import { useAuthStore } from '../../stores/useAuthStore';
import LoginScreen from '../LoginScreen';

// Reset store between tests
beforeEach(() => {
  useAuthStore.setState({ user: null, token: null });
});

it('shows welcome message after login', async () => {
  render(<LoginScreen />);
  
  fireEvent.changeText(screen.getByPlaceholderText('Email'), 'alice@test.com');
  fireEvent.changeText(screen.getByPlaceholderText('Password'), 'password123');
  fireEvent.press(screen.getByText('Log In'));

  // Wait for async update
  await screen.findByText('Welcome, Alice!');
});
```

### Redux Toolkit

```javascript
import { configureStore } from '@reduxjs/toolkit';
import { Provider } from 'react-redux';
import cartReducer from '../../store/slices/cartSlice';
import CartScreen from '../CartScreen';

function renderWithStore(ui, preloadedState = {}) {
  const store = configureStore({
    reducer: { cart: cartReducer },
    preloadedState,
  });
  return render(<Provider store={store}>{ui}</Provider>);
}

it('displays cart items', () => {
  renderWithStore(<CartScreen />, {
    cart: {
      items: [
        { id: '1', name: 'Apple', price: 100, quantity: 2 },
      ],
    },
  });

  expect(screen.getByText('Apple')).toBeTruthy();
  expect(screen.getByText('2')).toBeTruthy();
});
```

---

## 🧭 Testing Navigation

```javascript
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

const Stack = createNativeStackNavigator();

function TestNavigator({ component: Component, params = {} }) {
  return (
    <NavigationContainer>
      <Stack.Navigator>
        <Stack.Screen
          name="Test"
          component={Component}
          initialParams={params}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}

it('navigates to details on press', async () => {
  const { getByText } = render(<TestNavigator component={HomeScreen} />);

  fireEvent.press(getByText('View Post'));

  await waitFor(() => {
    expect(getByText('Post Details')).toBeTruthy();
  });
});
```

---

## 📸 Snapshot Testing

```javascript
import renderer from 'react-test-renderer';

it('renders correctly', () => {
  const tree = renderer
    .create(<Button title="Click Me" onPress={() => {}} />)
    .toJSON();
  expect(tree).toMatchSnapshot();
});
```

> Snapshots are useful for detecting unexpected UI changes. Update with `jest --updateSnapshot`.

---

## 📱 E2E Testing with Maestro

Maestro runs real flows on a simulator/device.

```bash
# Install Maestro CLI
curl -Ls "https://get.maestro.mobile.dev" | bash

# Run a flow
maestro test flow.yaml
```

```yaml
# flows/login.yaml
appId: com.yourapp.myapp
---
- launchApp
- tapOn: "Email"
- inputText: "alice@test.com"
- tapOn: "Password"
- inputText: "password123"
- tapOn: "Log In"
- assertVisible: "Welcome, Alice!"
- screenshot: "logged-in"
```

```yaml
# flows/swipe-list.yaml
- scrollUntilVisible:
    element: "Load More"
    direction: DOWN
    timeout: 5000
- tapOn: "Load More"
- assertVisible: "New Items"
```

---

## ▶️ Running Tests

```bash
# Run all tests
npx jest

# Watch mode
npx jest --watch

# With coverage
npx jest --coverage

# Run specific file
npx jest UserCard.test.tsx

# Run tests matching name
npx jest -t "renders user name"
```

Coverage report targets:
```json
// jest.config.js
{
  "coverageThreshold": {
    "global": {
      "branches": 70,
      "functions": 80,
      "lines": 80,
      "statements": 80
    }
  }
}
```

---

[← Previous: Performance](14-performance.md) | [Contents](README.md) | [Next: Deployment →](16-deployment.md)
