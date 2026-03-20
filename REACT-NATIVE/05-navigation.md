# 05: Navigation

## 🗺️ React Navigation

**React Navigation** is the de-facto standard navigation library for React Native. It provides stack, tab, drawer, and more navigators.

```bash
npm install @react-navigation/native
npm install react-native-screens react-native-safe-area-context

# Stack Navigator
npm install @react-navigation/native-stack

# Bottom Tabs
npm install @react-navigation/bottom-tabs

# Drawer
npm install @react-navigation/drawer
npm install react-native-gesture-handler react-native-reanimated
```

---

## 🏗️ Basic Setup

Wrap your entire app in `NavigationContainer`:

```javascript
// App.tsx
import { NavigationContainer } from '@react-navigation/native';
import { RootNavigator } from './src/navigation/RootNavigator';

export default function App() {
  return (
    <NavigationContainer>
      <RootNavigator />
    </NavigationContainer>
  );
}
```

---

## 📚 Stack Navigator

A stack of screens — push to navigate forward, pop to go back. Like a browser history.

```javascript
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import HomeScreen from '../screens/HomeScreen';
import DetailsScreen from '../screens/DetailsScreen';

const Stack = createNativeStackNavigator();

function RootNavigator() {
  return (
    <Stack.Navigator
      initialRouteName="Home"
      screenOptions={{
        headerStyle: { backgroundColor: '#007AFF' },
        headerTintColor: '#fff',
        headerTitleStyle: { fontWeight: 'bold' },
      }}
    >
      <Stack.Screen name="Home" component={HomeScreen} />
      <Stack.Screen
        name="Details"
        component={DetailsScreen}
        options={{ title: 'Item Details' }}
      />
    </Stack.Navigator>
  );
}
```

---

## 🔄 Navigating Between Screens

### `useNavigation` hook

```javascript
import { useNavigation } from '@react-navigation/native';

function HomeScreen() {
  const navigation = useNavigation();

  return (
    <Pressable onPress={() => navigation.navigate('Details', { id: 42 })}>
      <Text>Go to Details</Text>
    </Pressable>
  );
}
```

### Navigation methods

```javascript
// Push a new screen onto the stack
navigation.navigate('Details', { id: 42 });

// Always push a new instance (even if already in stack)
navigation.push('Details', { id: 42 });

// Go back one screen
navigation.goBack();

// Go back to a specific screen in the stack
navigation.popTo('Home');

// Reset the stack (replace entire history)
navigation.reset({
  index: 0,
  routes: [{ name: 'Home' }],
});

// Replace current screen
navigation.replace('Login');
```

---

## 📦 Route Params

### Passing params

```javascript
navigation.navigate('Profile', {
  userId: '123',
  username: 'alice',
});
```

### Receiving params

```javascript
import { useRoute } from '@react-navigation/native';

function ProfileScreen() {
  const route = useRoute();
  const { userId, username } = route.params;

  return <Text>User: {username}</Text>;
}
```

### TypeScript typing for params

```typescript
// types/navigation.ts
export type RootStackParamList = {
  Home: undefined;
  Profile: { userId: string; username: string };
  Details: { id: number };
};

// Usage in component
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../types/navigation';

type Props = NativeStackScreenProps<RootStackParamList, 'Profile'>;

function ProfileScreen({ route, navigation }: Props) {
  const { userId, username } = route.params;
  // ...
}
```

---

## 🔖 Bottom Tab Navigator

```javascript
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';

const Tab = createBottomTabNavigator();

function TabNavigator() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          let iconName;
          if (route.name === 'Home') {
            iconName = focused ? 'home' : 'home-outline';
          } else if (route.name === 'Profile') {
            iconName = focused ? 'person' : 'person-outline';
          }
          return <Ionicons name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: '#007AFF',
        tabBarInactiveTintColor: 'gray',
      })}
    >
      <Tab.Screen name="Home" component={HomeScreen} />
      <Tab.Screen name="Profile" component={ProfileScreen} />
    </Tab.Navigator>
  );
}
```

---

## 🗂️ Drawer Navigator

Side menu (hamburger menu).

```javascript
import { createDrawerNavigator } from '@react-navigation/drawer';

const Drawer = createDrawerNavigator();

function DrawerNavigator() {
  return (
    <Drawer.Navigator
      screenOptions={{
        drawerActiveTintColor: '#007AFF',
        drawerStyle: { backgroundColor: '#f9f9f9' },
      }}
    >
      <Drawer.Screen name="Home" component={HomeScreen} />
      <Drawer.Screen name="Settings" component={SettingsScreen} />
    </Drawer.Navigator>
  );
}

// Open/close the drawer programmatically
navigation.openDrawer();
navigation.closeDrawer();
navigation.toggleDrawer();
```

---

## 🏗️ Nested Navigators

Combine navigators for complex app structures:

```
NavigationContainer
└── Stack.Navigator (root)
    ├── Login  (before auth)
    └── Main   (after auth)
        └── Tab.Navigator
            ├── HomeTab → Stack.Navigator (home stack)
            ├── SearchTab
            └── ProfileTab → Stack.Navigator (profile stack)
```

```javascript
function MainTabs() {
  return (
    <Tab.Navigator>
      <Tab.Screen name="HomeTab" component={HomeStackNavigator} />
      <Tab.Screen name="Profile" component={ProfileScreen} />
    </Tab.Navigator>
  );
}

function HomeStackNavigator() {
  return (
    <Stack.Navigator>
      <Stack.Screen name="Feed" component={FeedScreen} />
      <Stack.Screen name="Post" component={PostScreen} />
    </Stack.Navigator>
  );
}

function RootNavigator() {
  const { isLoggedIn } = useAuth();
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      {isLoggedIn ? (
        <Stack.Screen name="Main" component={MainTabs} />
      ) : (
        <Stack.Screen name="Login" component={LoginScreen} />
      )}
    </Stack.Navigator>
  );
}
```

---

## ⚙️ Screen Options

### Static options
```javascript
<Stack.Screen
  name="Details"
  component={DetailsScreen}
  options={{
    title: 'Details',
    headerShown: true,
    headerBackTitle: 'Back',
    headerRight: () => <Button title="Save" onPress={save} />,
  }}
/>
```

### Dynamic options (from component)
```javascript
function DetailScreen({ navigation, route }) {
  useLayoutEffect(() => {
    navigation.setOptions({
      title: route.params.title,
      headerRight: () => (
        <Pressable onPress={share}>
          <Ionicons name="share-outline" size={24} />
        </Pressable>
      ),
    });
  }, [navigation, route.params.title]);
}
```

---

## 🔔 Navigation Listeners

```javascript
useEffect(() => {
  // Called every time screen comes into focus
  const unsubscribe = navigation.addListener('focus', () => {
    fetchData();
  });

  return unsubscribe; // Cleanup
}, [navigation]);
```

**Events:** `focus`, `blur`, `beforeRemove`, `state`

---

## 🔗 Deep Linking

Configure URLs to open specific screens:

```javascript
const linking = {
  prefixes: ['myapp://', 'https://myapp.com'],
  config: {
    screens: {
      Home: '',
      Profile: 'profile/:userId',
      Details: 'details/:id',
    },
  },
};

<NavigationContainer linking={linking}>
  {/* navigators */}
</NavigationContainer>
```

---

## 📍 Expo Router (File-Based Routing)

Expo Router uses the filesystem for routing — similar to Next.js.

```
app/
├── _layout.tsx       ← Root layout
├── index.tsx         ← / (home)
├── (tabs)/
│   ├── _layout.tsx   ← Tab layout
│   ├── index.tsx     ← /
│   └── profile.tsx   ← /profile
└── post/
    └── [id].tsx      ← /post/:id (dynamic)
```

```javascript
// app/(tabs)/_layout.tsx
import { Tabs } from 'expo-router';

export default function TabLayout() {
  return (
    <Tabs>
      <Tabs.Screen name="index" options={{ title: 'Home' }} />
      <Tabs.Screen name="profile" options={{ title: 'Profile' }} />
    </Tabs>
  );
}

// Navigate programmatically
import { router } from 'expo-router';

router.push('/profile');
router.push(`/post/${id}`);
router.back();
router.replace('/home');
```

---

[← Previous: Styling & Flexbox](04-styling.md) | [Contents](README.md) | [Next: State & Hooks →](06-state-and-hooks.md)
