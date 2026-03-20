# 18: Best Practices

## 🏗️ Project Structure

Organize by feature, not by type:

```
src/
├── features/
│   ├── auth/
│   │   ├── components/      # AuthForm, LoginButton
│   │   ├── screens/         # LoginScreen, RegisterScreen
│   │   ├── hooks/           # useAuth, useLogin
│   │   ├── services/        # authService.ts
│   │   ├── store/           # authStore.ts
│   │   └── types.ts
│   ├── feed/
│   │   ├── components/
│   │   ├── screens/
│   │   └── ...
│   └── profile/
├── shared/
│   ├── components/          # Button, Card, Avatar
│   ├── hooks/               # useDebounce, useAppState
│   ├── utils/               # formatDate, truncate
│   ├── constants/           # colors, spacing, fonts
│   └── types/               # global TypeScript types
├── navigation/
│   └── RootNavigator.tsx
└── services/
    ├── api.ts               # Axios instance
    └── analytics.ts
```

---

## 🎯 Component Design

### Keep Components Small & Focused

```javascript
// ❌ Monolithic component
function UserProfileScreen() {
  // 200+ lines of JSX, fetching, logic...
}

// ✅ Decomposed
function UserProfileScreen() {
  const { user, isLoading } = useProfile();
  if (isLoading) return <ProfileSkeleton />;
  return (
    <ScrollView>
      <ProfileHeader user={user} />
      <ProfileStats stats={user.stats} />
      <ProfilePosts userId={user.id} />
    </ScrollView>
  );
}
```

### Separate Logic from Presentation

```javascript
// ✅ Custom hook for logic
function useLogin() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const login = async (email: string, password: string) => {
    setLoading(true);
    setError(null);
    try {
      await authService.login(email, password);
    } catch (e) {
      setError('Invalid email or password');
    } finally {
      setLoading(false);
    }
  };

  return { login, loading, error };
}

// ✅ Presentational component is clean
function LoginScreen() {
  const { login, loading, error } = useLogin();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  return (
    <View>
      <TextInput value={email} onChangeText={setEmail} />
      <TextInput value={password} onChangeText={setPassword} secureTextEntry />
      {error && <Text style={styles.error}>{error}</Text>}
      <Button onPress={() => login(email, password)} loading={loading} />
    </View>
  );
}
```

---

## 🔒 TypeScript Best Practices

```typescript
// ✅ Type your navigation params
export type RootStackParamList = {
  Home: undefined;
  Profile: { userId: string };
  Settings: undefined;
};

// ✅ Type component props
interface ButtonProps {
  title: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary' | 'danger';
  disabled?: boolean;
  loading?: boolean;
}

function Button({ title, onPress, variant = 'primary', disabled, loading }: ButtonProps) {
  // ...
}

// ✅ Type API responses
interface User {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  createdAt: string;
}

interface ApiResponse<T> {
  data: T;
  message: string;
  success: boolean;
}

// ✅ Use enums for constants
enum NotificationType {
  Message = 'message',
  Follow = 'follow',
  Like = 'like',
}
```

---

## 🛡️ Security Best Practices

```javascript
// ✅ Store sensitive data in SecureStore, not AsyncStorage
import * as SecureStore from 'expo-secure-store';
await SecureStore.setItemAsync('auth_token', token);

// ✅ Never store passwords — only tokens
// ❌
await AsyncStorage.setItem('password', userPassword);

// ✅ Validate user input
function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

// ✅ Use HTTPS only
const api = axios.create({ baseURL: 'https://api.example.com' });

// ✅ Don't log sensitive data in production
if (__DEV__) {
  console.log('User token:', token);
}

// ✅ Implement certificate pinning for high-security apps
// See 08-networking.md

// ✅ Biometric authentication for sensitive actions
const authed = await LocalAuthentication.authenticateAsync({
  promptMessage: 'Confirm to proceed',
});
if (!authed.success) return;
```

---

## 🎨 UI / UX Standards

```javascript
// ✅ Always use SafeAreaView
import { SafeAreaView } from 'react-native-safe-area-context';

function Screen({ children }) {
  return (
    <SafeAreaView style={{ flex: 1 }} edges={['top', 'bottom']}>
      {children}
    </SafeAreaView>
  );
}

// ✅ Handle keyboard properly
<KeyboardAvoidingView
  style={{ flex: 1 }}
  behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
>
  {/* forms */}
</KeyboardAvoidingView>

// ✅ Provide loading and empty states
function ListScreen() {
  const { data, isLoading } = useData();

  if (isLoading) return <SkeletonList />;
  if (!data?.length) return <EmptyState message="No items yet" />;
  return <FlatList data={data} renderItem={renderItem} />;
}

// ✅ Use appropriate tap target sizes (min 44x44 pt)
<Pressable
  style={{ minWidth: 44, minHeight: 44, padding: 12 }}
  hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
>
  <Ionicons name="close" size={20} />
</Pressable>

// ✅ Show feedback on every tap
<Pressable style={({ pressed }) => [styles.btn, pressed && styles.pressed]}>
  <Text>Button</Text>
</Pressable>
```

---

## ♿ Accessibility

```javascript
// ✅ Label interactive elements
<Pressable
  onPress={handleLike}
  accessible
  accessibilityLabel={`Like post by ${post.author}`}
  accessibilityRole="button"
>
  <Ionicons name="heart" />
</Pressable>

// ✅ Accessibility hints
<TextInput
  accessibilityLabel="Email address"
  accessibilityHint="Enter your email to sign in"
/>

// ✅ Mark decorative images
<Image
  source={decorativeBackground}
  accessible={false}
  aria-hidden
/>

// ✅ Announce dynamic changes
import { AccessibilityInfo } from 'react-native';
AccessibilityInfo.announceForAccessibility('Item added to cart');
```

---

## ⚡ Performance Practices

```javascript
// ✅ Memoize list items
const PostCard = memo(({ post, onLike }) => (
  <View>
    <Text>{post.title}</Text>
    <Pressable onPress={() => onLike(post.id)}>
      <Text>Like</Text>
    </Pressable>
  </View>
));

// ✅ Stable callbacks
const handleLike = useCallback((id: string) => {
  likePost(id);
}, []);

// ✅ Fixed item height for FlatList performance
const ITEM_HEIGHT = 80;
const getItemLayout = (_, index) => ({
  length: ITEM_HEIGHT,
  offset: ITEM_HEIGHT * index,
  index,
});

// ✅ Defer heavy processing
useEffect(() => {
  const task = InteractionManager.runAfterInteractions(() => {
    processHeavyData();
  });
  return () => task.cancel();
}, []);
```

---

## 🛜 Offline Support

```javascript
// ✅ Show offline banner
function OfflineBanner() {
  const isConnected = useNetworkStatus();
  if (isConnected) return null;

  return (
    <View style={styles.banner}>
      <Text style={styles.bannerText}>You're offline</Text>
    </View>
  );
}

// ✅ Cache API responses
const { data } = useQuery({
  queryKey: ['posts'],
  queryFn: fetchPosts,
  staleTime: Infinity,   // never refetch unless manually invalidated
  gcTime: 1000 * 60 * 60 * 24,  // keep in cache for 24h
});

// ✅ Queue actions when offline
const pendingActions = useRef([]);
const isConnected = useNetworkStatus();

useEffect(() => {
  if (isConnected && pendingActions.current.length > 0) {
    pendingActions.current.forEach(action => action());
    pendingActions.current = [];
  }
}, [isConnected]);
```

---

## 🐞 Error Handling

```javascript
// ✅ Global error boundary
class ErrorBoundary extends React.Component {
  state = { hasError: false, error: null };

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, info) {
    Sentry.captureException(error, { extra: info });
  }

  render() {
    if (this.state.hasError) {
      return <ErrorScreen onRetry={() => this.setState({ hasError: false })} />;
    }
    return this.props.children;
  }
}

// ✅ Handle errors in async operations
async function submitForm(data) {
  try {
    await api.post('/form', data);
    navigation.navigate('Success');
  } catch (error) {
    if (axios.isAxiosError(error) && error.response?.status === 422) {
      showValidationErrors(error.response.data.errors);
    } else {
      Alert.alert('Error', 'Something went wrong. Please try again.');
    }
  }
}
```

---

## 📦 Dependency Management

```bash
# ✅ Use exact versions for critical deps
npm install --save-exact react-native-reanimated

# ✅ Keep Expo SDK dependencies in sync
npx expo install --fix

# ✅ Audit for vulnerabilities
npm audit

# ✅ Check for updates
npx npm-check-updates --interactive
```

---

## 🧹 Code Quality

```json
// .eslintrc.js
{
  "extends": ["expo", "prettier"],
  "plugins": ["react-hooks"],
  "rules": {
    "react-hooks/rules-of-hooks": "error",
    "react-hooks/exhaustive-deps": "warn",
    "no-console": "warn"
  }
}
```

```json
// .prettierrc
{
  "singleQuote": true,
  "trailingComma": "all",
  "printWidth": 100,
  "tabWidth": 2
}
```

---

## 📝 Naming Conventions

```javascript
// Components — PascalCase
function UserProfileCard() {}

// Hooks — camelCase with "use" prefix
function useUserProfile() {}

// Constants — SCREAMING_SNAKE_CASE
const MAX_RETRY_ATTEMPTS = 3;
const API_BASE_URL = 'https://...';

// Files
// components/UserCard.tsx       — component
// hooks/useUserProfile.ts       — hook
// services/userService.ts       — service
// screens/ProfileScreen.tsx     — screen
// types/user.types.ts           — types
// utils/dateFormatter.ts        — utility
// stores/useAuthStore.ts        — Zustand store
```

---

[← Previous: Expo Ecosystem](17-expo.md) | [Contents](README.md) | [Next: Debugging & Tools →](19-debugging.md)
