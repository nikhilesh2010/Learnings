# 06: State & Hooks

## 🎣 React Hooks in React Native

All standard React hooks work in React Native. Additionally, React Native provides its own hooks for device/platform interaction.

---

## 🔁 useState

Manage local component state — identical to React web.

```javascript
import { useState } from 'react';
import { View, Text, Pressable } from 'react-native';

function Counter() {
  const [count, setCount] = useState(0);

  return (
    <View>
      <Text>{count}</Text>
      <Pressable onPress={() => setCount(c => c + 1)}>
        <Text>Increment</Text>
      </Pressable>
    </View>
  );
}
```

---

## ⚡ useEffect

Side effects — data fetching, subscriptions, cleanup.

```javascript
import { useEffect, useState } from 'react';

function UserProfile({ userId }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    async function fetchUser() {
      try {
        const response = await fetch(`https://api.example.com/users/${userId}`);
        const data = await response.json();
        if (!cancelled) setUser(data);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    fetchUser();
    return () => { cancelled = true; };  // cleanup
  }, [userId]);

  if (loading) return <ActivityIndicator />;
  return <Text>{user?.name}</Text>;
}
```

---

## 📱 React Native-Specific Hooks

### `useColorScheme`

Detect the device's light/dark mode setting:

```javascript
import { useColorScheme } from 'react-native';

function ThemedButton() {
  const scheme = useColorScheme(); // 'light' | 'dark' | null

  return (
    <View style={{ backgroundColor: scheme === 'dark' ? '#1c1c1e' : '#ffffff' }}>
      <Text style={{ color: scheme === 'dark' ? '#fff' : '#000' }}>
        Button
      </Text>
    </View>
  );
}
```

### `useWindowDimensions`

Get window size reactively (updates on rotation):

```javascript
import { useWindowDimensions } from 'react-native';

function ResponsiveLayout() {
  const { width, height } = useWindowDimensions();
  const isLandscape = width > height;

  return (
    <View style={{ flexDirection: isLandscape ? 'row' : 'column' }}>
      {/* content adapts to orientation */}
    </View>
  );
}
```

### `useAnimatedValue` (via Animated API)

Built-in animation driver — see [10-animations.md](10-animations.md).

---

## 🌐 Context API

Share state without prop drilling — same as React web.

```javascript
// contexts/ThemeContext.tsx
import { createContext, useContext, useState } from 'react';

type Theme = 'light' | 'dark';

const ThemeContext = createContext<{
  theme: Theme;
  toggleTheme: () => void;
}>({ theme: 'light', toggleTheme: () => {} });

export function ThemeProvider({ children }) {
  const [theme, setTheme] = useState<Theme>('light');
  const toggleTheme = () => setTheme(t => t === 'light' ? 'dark' : 'light');

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export const useTheme = () => useContext(ThemeContext);
```

```javascript
// App.tsx
<ThemeProvider>
  <NavigationContainer>
    <RootNavigator />
  </NavigationContainer>
</ThemeProvider>

// Any component
function SettingsScreen() {
  const { theme, toggleTheme } = useTheme();
  return <Switch value={theme === 'dark'} onValueChange={toggleTheme} />;
}
```

---

## 🏪 Zustand (Recommended State Manager)

Lightweight, simple, no boilerplate — great for React Native.

```bash
npm install zustand
```

```javascript
// stores/useAuthStore.ts
import { create } from 'zustand';

interface AuthState {
  user: User | null;
  token: string | null;
  login: (user: User, token: string) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  token: null,
  login: (user, token) => set({ user, token }),
  logout: () => set({ user: null, token: null }),
}));

// Usage in any component
function ProfileScreen() {
  const user = useAuthStore(state => state.user);
  const logout = useAuthStore(state => state.logout);

  return (
    <View>
      <Text>Welcome, {user?.name}</Text>
      <Pressable onPress={logout}><Text>Log Out</Text></Pressable>
    </View>
  );
}
```

### Persist Zustand to AsyncStorage

```javascript
import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';

const useSettingsStore = create(
  persist(
    (set) => ({
      notifications: true,
      theme: 'light',
      setTheme: (theme) => set({ theme }),
    }),
    {
      name: 'settings-storage',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);
```

---

## 🔴 Redux Toolkit

For larger apps that need predictable state management.

```bash
npm install @reduxjs/toolkit react-redux
```

```javascript
// store/slices/cartSlice.ts
import { createSlice, PayloadAction } from '@reduxjs/toolkit';

const cartSlice = createSlice({
  name: 'cart',
  initialState: { items: [], total: 0 },
  reducers: {
    addItem(state, action: PayloadAction<CartItem>) {
      state.items.push(action.payload);
      state.total += action.payload.price;
    },
    removeItem(state, action: PayloadAction<string>) {
      const index = state.items.findIndex(i => i.id === action.payload);
      if (index !== -1) {
        state.total -= state.items[index].price;
        state.items.splice(index, 1);
      }
    },
  },
});

export const { addItem, removeItem } = cartSlice.actions;
export default cartSlice.reducer;

// store/index.ts
import { configureStore } from '@reduxjs/toolkit';
import cartReducer from './slices/cartSlice';

export const store = configureStore({
  reducer: { cart: cartReducer },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

// App.tsx
import { Provider } from 'react-redux';
<Provider store={store}>
  <NavigationContainer>...</NavigationContainer>
</Provider>

// Component
import { useSelector, useDispatch } from 'react-redux';
function CartScreen() {
  const items = useSelector((state: RootState) => state.cart.items);
  const dispatch = useDispatch();

  return (
    <FlatList
      data={items}
      renderItem={({ item }) => (
        <Pressable onPress={() => dispatch(removeItem(item.id))}>
          <Text>{item.name}</Text>
        </Pressable>
      )}
    />
  );
}
```

---

## 🔄 useReducer

For complex local state logic:

```javascript
import { useReducer } from 'react';

type State = { count: number; step: number };
type Action = { type: 'increment' | 'decrement' | 'setStep'; payload?: number };

function reducer(state: State, action: Action): State {
  switch (action.type) {
    case 'increment': return { ...state, count: state.count + state.step };
    case 'decrement': return { ...state, count: state.count - state.step };
    case 'setStep': return { ...state, step: action.payload! };
    default: return state;
  }
}

function StepCounter() {
  const [state, dispatch] = useReducer(reducer, { count: 0, step: 1 });

  return (
    <View>
      <Text>Count: {state.count}</Text>
      <Pressable onPress={() => dispatch({ type: 'increment' })}>
        <Text>+{state.step}</Text>
      </Pressable>
    </View>
  );
}
```

---

## 🎯 Custom Hooks in React Native

### `useAppState` — detect app foreground/background

```javascript
import { useEffect, useRef, useState } from 'react';
import { AppState } from 'react-native';

function useAppState() {
  const appState = useRef(AppState.currentState);
  const [state, setState] = useState(AppState.currentState);

  useEffect(() => {
    const subscription = AppState.addEventListener('change', nextState => {
      appState.current = nextState;
      setState(nextState);
    });
    return () => subscription.remove();
  }, []);

  return state;
}

// Usage
function MyScreen() {
  const appState = useAppState();

  useEffect(() => {
    if (appState === 'active') {
      refreshData(); // user returned to app
    }
  }, [appState]);
}
```

### `useNetworkStatus` — detect online/offline

```javascript
import NetInfo from '@react-native-community/netinfo';
import { useEffect, useState } from 'react';

function useNetworkStatus() {
  const [isConnected, setIsConnected] = useState(true);

  useEffect(() => {
    const unsubscribe = NetInfo.addEventListener(state => {
      setIsConnected(!!state.isConnected);
    });
    return unsubscribe;
  }, []);

  return isConnected;
}
```

### `useDebounce`

```javascript
import { useState, useEffect } from 'react';

function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedValue(value), delay);
    return () => clearTimeout(timer);
  }, [value, delay]);

  return debouncedValue;
}

// Usage
function SearchScreen() {
  const [query, setQuery] = useState('');
  const debouncedQuery = useDebounce(query, 300);

  useEffect(() => {
    if (debouncedQuery) search(debouncedQuery);
  }, [debouncedQuery]);
}
```

---

## 📊 React Query (Server State)

For server data fetching, caching, and synchronization:

```bash
npm install @tanstack/react-query
```

```javascript
import { QueryClient, QueryClientProvider, useQuery, useMutation } from '@tanstack/react-query';

const queryClient = new QueryClient();

// Wrap app
<QueryClientProvider client={queryClient}>
  <App />
</QueryClientProvider>

// Fetch data
function PostsList() {
  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['posts'],
    queryFn: () => fetch('https://api.example.com/posts').then(r => r.json()),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  if (isLoading) return <ActivityIndicator />;
  if (error) return <Text>Error loading posts</Text>;

  return (
    <FlatList
      data={data}
      renderItem={({ item }) => <PostCard post={item} />}
      onRefresh={refetch}
      refreshing={isLoading}
    />
  );
}

// Mutate data
function CreatePostForm() {
  const mutation = useMutation({
    mutationFn: (newPost) =>
      fetch('/api/posts', { method: 'POST', body: JSON.stringify(newPost) }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['posts'] }),
  });

  return (
    <Pressable onPress={() => mutation.mutate({ title: 'New Post' })}>
      <Text>Create Post</Text>
    </Pressable>
  );
}
```

---

[← Previous: Navigation](05-navigation.md) | [Contents](README.md) | [Next: Platform API →](07-platform-api.md)
