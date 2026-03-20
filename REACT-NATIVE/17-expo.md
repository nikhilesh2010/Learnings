# 17: Expo Ecosystem

## 🚀 What is Expo?

**Expo** is an open-source platform built on top of React Native that provides:
- **Managed workflow** — batteries included, no native code required
- **Expo SDK** — 50+ pre-built, maintained native modules
- **EAS** — Cloud build, submit, and update service
- **Expo Router** — File-based routing (like Next.js)
- **Expo Go** — Instant preview on physical devices
- **Snack** — Browser-based playground

---

## 📦 Expo SDK Modules

All installed with `npx expo install <package>` (ensures compatible versions).

### Device & System
| Package | Purpose |
|---------|---------|
| `expo-device` | Device info (model, OS, etc.) |
| `expo-constants` | App config, manifest |
| `expo-application` | App version, bundle ID |
| `expo-battery` | Battery level and state |
| `expo-brightness` | Screen brightness |
| `expo-keep-awake` | Prevent screen from sleeping |
| `expo-network` | Network type, IP |

### UI & Media
| Package | Purpose |
|---------|---------|
| `expo-image` | Optimized image component |
| `expo-video` | Video playback |
| `expo-audio` | Audio playback & recording |
| `expo-camera` | Camera & barcode scanner |
| `expo-image-picker` | Pick from gallery / camera |
| `expo-image-manipulator` | Resize, crop, rotate images |
| `expo-media-library` | Access device photo library |
| `expo-av` | Legacy AV (use expo-video/audio instead) |

### Storage & Files
| Package | Purpose |
|---------|---------|
| `expo-file-system` | Read/write files |
| `expo-secure-store` | Encrypted key-value storage |
| `expo-sqlite` | Local SQLite database |
| `expo-asset` | Load bundled assets |
| `expo-document-picker` | Pick files from device storage |

### Sensors & Location
| Package | Purpose |
|---------|---------|
| `expo-location` | GPS location |
| `expo-sensors` | Accelerometer, gyroscope, barometer |
| `expo-pedometer` | Step counter |
| `expo-compass` | Magnetic heading |

### Communication & Social
| Package | Purpose |
|---------|---------|
| `expo-notifications` | Local & push notifications |
| `expo-sharing` | Share files / URLs |
| `expo-clipboard` | Copy / paste |
| `expo-contacts` | Access device contacts |
| `expo-calendar` | Read/write calendar events |
| `expo-mail-composer` | Compose emails |
| `expo-sms` | Send SMS messages |

### Auth & Identity
| Package | Purpose |
|---------|---------|
| `expo-auth-session` | OAuth 2.0 / OpenID Connect |
| `expo-local-authentication` | Face ID / Touch ID / PIN |
| `expo-crypto` | Cryptographic functions |
| `expo-random` | Secure random bytes |

### UI Utilities
| Package | Purpose |
|---------|---------|
| `expo-haptics` | Haptic feedback |
| `expo-status-bar` | Control status bar |
| `expo-navigation-bar` | Android navigation bar |
| `expo-system-ui` | System UI appearance |
| `expo-splash-screen` | Control splash screen visibility |
| `expo-font` | Load custom fonts |
| `expo-linear-gradient` | Gradient views |
| `expo-blur` | Blur view effect |
| `expo-symbols` | SF Symbols (iOS) / Material Symbols |

---

## 🗺️ Expo Router

File-based routing for React Native — same mental model as Next.js App Router.

### File Structure

```
app/
├── _layout.tsx          ← Root layout (wrap all routes)
├── index.tsx            ← / (home screen)
├── +not-found.tsx       ← 404 handler
├── (auth)/              ← Route group (no URL segment)
│   ├── login.tsx        ← /login
│   └── register.tsx     ← /register
├── (tabs)/              ← Tab navigator group
│   ├── _layout.tsx      ← Tab bar layout
│   ├── index.tsx        ← / (first tab)
│   ├── explore.tsx      ← /explore
│   └── profile.tsx      ← /profile
└── post/
    ├── [id].tsx         ← /post/:id (dynamic)
    └── [id]/
        └── comments.tsx ← /post/:id/comments
```

### Root Layout

```javascript
// app/_layout.tsx
import { Stack } from 'expo-router';
import { ThemeProvider } from '../contexts/ThemeContext';

export default function RootLayout() {
  return (
    <ThemeProvider>
      <Stack>
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen name="(auth)" options={{ headerShown: false }} />
        <Stack.Screen name="post/[id]" options={{ title: 'Post' }} />
      </Stack>
    </ThemeProvider>
  );
}
```

### Tab Layout

```javascript
// app/(tabs)/_layout.tsx
import { Tabs } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={({ route }) => ({
        tabBarIcon: ({ color, size }) => {
          const icons = {
            index: 'home',
            explore: 'compass',
            profile: 'person',
          };
          return <Ionicons name={icons[route.name]} size={size} color={color} />;
        },
        tabBarActiveTintColor: '#007AFF',
      })}
    >
      <Tabs.Screen name="index" options={{ title: 'Home' }} />
      <Tabs.Screen name="explore" options={{ title: 'Explore' }} />
      <Tabs.Screen name="profile" options={{ title: 'Profile' }} />
    </Tabs>
  );
}
```

### Dynamic Routes

```javascript
// app/post/[id].tsx
import { useLocalSearchParams } from 'expo-router';

export default function PostScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  return <Text>Post ID: {id}</Text>;
}
```

### Navigation

```javascript
import { router, Link, useRouter } from 'expo-router';

// Imperative navigation
router.push('/profile');
router.push({ pathname: '/post/[id]', params: { id: '123' } });
router.replace('/home');
router.back();

// Declarative — Link component
<Link href="/profile">
  <Text>Go to Profile</Text>
</Link>

<Link href={{ pathname: '/post/[id]', params: { id: '123' } }}>
  <Text>View Post</Text>
</Link>
```

---

## 🎨 Fonts (expo-font)

```javascript
import { useFonts } from 'expo-font';
import { Inter_400Regular, Inter_700Bold } from '@expo-google-fonts/inter';
import * as SplashScreen from 'expo-splash-screen';

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const [loaded] = useFonts({
    Inter_400Regular,
    Inter_700Bold,
    'CustomFont': require('../assets/fonts/CustomFont.ttf'),
  });

  useEffect(() => {
    if (loaded) SplashScreen.hideAsync();
  }, [loaded]);

  if (!loaded) return null;

  return <Stack />;
}

// Usage
const styles = StyleSheet.create({
  title: { fontFamily: 'Inter_700Bold', fontSize: 24 },
  body: { fontFamily: 'Inter_400Regular', fontSize: 16 },
});
```

---

## 🔐 Local Authentication (Biometrics)

```javascript
import * as LocalAuthentication from 'expo-local-authentication';

async function authenticateWithBiometrics() {
  const hasHardware = await LocalAuthentication.hasHardwareAsync();
  const isEnrolled = await LocalAuthentication.isEnrolledAsync();

  if (!hasHardware || !isEnrolled) {
    return false;
  }

  const result = await LocalAuthentication.authenticateAsync({
    promptMessage: 'Verify your identity',
    fallbackLabel: 'Use passcode',
    disableDeviceFallback: false,
  });

  return result.success;
}

// Supported types
const types = await LocalAuthentication.supportedAuthenticationTypesAsync();
// [1] = FINGERPRINT, [2] = FACIAL_RECOGNITION, [3] = IRIS
```

---

## 🎭 Expo Splash Screen

Control when the splash screen hides:

```javascript
import * as SplashScreen from 'expo-splash-screen';

// Keep visible while loading
SplashScreen.preventAutoHideAsync();

function App() {
  const [appReady, setAppReady] = useState(false);

  useEffect(() => {
    async function prepare() {
      // Load fonts, data, etc.
      await loadFonts();
      await prefetchData();
      setAppReady(true);
    }
    prepare();
  }, []);

  const onLayout = useCallback(async () => {
    if (appReady) await SplashScreen.hideAsync();
  }, [appReady]);

  if (!appReady) return null;

  return (
    <View style={{ flex: 1 }} onLayout={onLayout}>
      <NavigationContainer>...</NavigationContainer>
    </View>
  );
}
```

---

## 🔑 OAuth with expo-auth-session

```javascript
import * as WebBrowser from 'expo-web-browser';
import * as Google from 'expo-auth-session/providers/google';

WebBrowser.maybeCompleteAuthSession();

function GoogleSignIn() {
  const [request, response, promptAsync] = Google.useAuthRequest({
    clientId: 'YOUR_EXPO_CLIENT_ID',
    iosClientId: 'YOUR_IOS_CLIENT_ID',
    androidClientId: 'YOUR_ANDROID_CLIENT_ID',
  });

  useEffect(() => {
    if (response?.type === 'success') {
      const { authentication } = response;
      fetchUserInfo(authentication.accessToken);
    }
  }, [response]);

  return (
    <Pressable onPress={() => promptAsync()} disabled={!request}>
      <Text>Sign in with Google</Text>
    </Pressable>
  );
}
```

---

## 🌐 Expo Go vs Development Build

| Feature | Expo Go | Development Build |
|---------|---------|------------------|
| Setup | Instant | Build required |
| Custom native code | ❌ | ✅ |
| All Expo SDK | ✅ | ✅ |
| Third-party native libs | ❌ | ✅ |
| Best for | Quick prototyping | Real development |

---

[← Previous: Deployment](16-deployment.md) | [Contents](README.md) | [Next: Best Practices →](18-best-practices.md)
