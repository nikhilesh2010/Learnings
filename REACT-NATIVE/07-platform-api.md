# 07: Platform API

## 📱 Platform Module

Detect which platform the code is running on.

```javascript
import { Platform } from 'react-native';

// Check platform
Platform.OS           // 'ios' | 'android' | 'windows' | 'macos' | 'web'
Platform.Version      // iOS: '17.0' | Android: 34 (API level)
Platform.isPad        // iOS only — is it an iPad?
Platform.isTV         // Is it a TV?
```

---

## 🔀 Platform.select

Return a platform-specific value:

```javascript
import { Platform, StyleSheet } from 'react-native';

const styles = StyleSheet.create({
  container: {
    paddingTop: Platform.select({
      ios: 44,
      android: 24,
      default: 0,
    }),
  },
  shadow: Platform.select({
    ios: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.2,
      shadowRadius: 4,
    },
    android: {
      elevation: 4,
    },
  }),
});

// With JSX
const buttonText = Platform.select({
  ios: 'Done',
  android: 'OK',
  default: 'Confirm',
});
```

---

## 📂 Platform-Specific Files

React Native automatically picks the right file based on platform:

```
components/
├── Button.ios.tsx        ← Used on iOS
├── Button.android.tsx    ← Used on Android
└── Button.tsx            ← Fallback / shared
```

```javascript
// Automatically resolved — no need to specify the extension
import Button from './components/Button';
```

---

## 📳 Vibration

```javascript
import { Vibration } from 'react-native';

// Single vibration (duration in ms)
Vibration.vibrate(500);

// Pattern: [wait, vibrate, wait, vibrate, ...]
Vibration.vibrate([0, 200, 100, 200]);

// Repeat indefinitely
Vibration.vibrate([0, 500, 500], true);

// Stop
Vibration.cancel();
```

---

## 🔆 Appearance

Access system appearance settings reactively:

```javascript
import { Appearance } from 'react-native';

// Get current color scheme
const scheme = Appearance.getColorScheme(); // 'light' | 'dark' | null

// Listen for changes
const subscription = Appearance.addChangeListener(({ colorScheme }) => {
  console.log('Scheme changed to:', colorScheme);
});

// Cleanup
subscription.remove();
```

---

## 📲 Linking

Open URLs, deep links, settings, phone calls, emails:

```javascript
import { Linking } from 'react-native';

// Open a URL in browser
await Linking.openURL('https://reactnative.dev');

// Open phone dialpad
await Linking.openURL('tel:+1234567890');

// Open email client
await Linking.openURL('mailto:hello@example.com?subject=Hello');

// Open device Settings
await Linking.openSettings();

// Check if URL can be handled
const canOpen = await Linking.canOpenURL('myapp://profile/123');

// Handle incoming deep links
useEffect(() => {
  const subscription = Linking.addEventListener('url', ({ url }) => {
    handleDeepLink(url);
  });

  // Get initial URL (app opened from a link)
  Linking.getInitialURL().then(url => {
    if (url) handleDeepLink(url);
  });

  return () => subscription.remove();
}, []);
```

---

## 📋 Clipboard

```javascript
import * as Clipboard from 'expo-clipboard';

// Copy to clipboard
await Clipboard.setStringAsync('Text to copy');

// Read from clipboard
const text = await Clipboard.getStringAsync();
```

---

## 🔊 Haptics (Expo)

Tactile feedback:

```javascript
import * as Haptics from 'expo-haptics';

// Light feedback
await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
// Medium
await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
// Heavy
await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);

// Notification types
await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);

// Selection feedback (light single tap)
await Haptics.selectionAsync();
```

---

## 🔆 Screen Brightness (Expo)

```javascript
import * as Brightness from 'expo-brightness';

// Get current brightness (0.0 – 1.0)
const brightness = await Brightness.getBrightnessAsync();

// Set brightness
await Brightness.setBrightnessAsync(0.8);

// Keep screen awake
import { activateKeepAwakeAsync, deactivateKeepAwake } from 'expo-keep-awake';
await activateKeepAwakeAsync();
deactivateKeepAwake();
```

---

## 📶 Network Info

```bash
npm install @react-native-community/netinfo
```

```javascript
import NetInfo from '@react-native-community/netinfo';

// One-time fetch
const state = await NetInfo.fetch();
console.log('Connected:', state.isConnected);
console.log('Type:', state.type); // 'wifi' | 'cellular' | 'none' | ...

// Subscribe to changes
const unsubscribe = NetInfo.addEventListener(state => {
  console.log(state.isConnected, state.type);
});

// Cleanup
unsubscribe();
```

---

## 🔑 Permissions (Expo)

```javascript
import * as Location from 'expo-location';
import * as Camera from 'expo-camera';
import * as Notifications from 'expo-notifications';

// Request location
const { status } = await Location.requestForegroundPermissionsAsync();
if (status === 'granted') {
  const location = await Location.getCurrentPositionAsync({});
}

// Request camera
const { status: camStatus } = await Camera.requestCameraPermissionsAsync();

// Check without requesting
const existing = await Location.getForegroundPermissionsAsync();
// existing.status: 'granted' | 'denied' | 'undetermined'
```

---

## 📍 Location (Expo)

```javascript
import * as Location from 'expo-location';

// Get current position
const location = await Location.getCurrentPositionAsync({
  accuracy: Location.Accuracy.High,
});
console.log(location.coords.latitude, location.coords.longitude);

// Watch position (continuous updates)
const subscription = await Location.watchPositionAsync(
  { accuracy: Location.Accuracy.Balanced, distanceInterval: 10 },
  location => {
    console.log('New position:', location.coords);
  }
);

// Stop watching
subscription.remove();

// Reverse geocode (coords → address)
const [address] = await Location.reverseGeocodeAsync({
  latitude: 37.7749,
  longitude: -122.4194,
});
console.log(address.city, address.country);
```

---

## 📐 Device Info (expo-device)

```javascript
import * as Device from 'expo-device';

Device.brand           // 'Apple' | 'Samsung' | ...
Device.modelName       // 'iPhone 15 Pro' | 'Pixel 8' | ...
Device.osName          // 'iOS' | 'Android'
Device.osVersion       // '17.0' | '14'
Device.deviceType      // PHONE | TABLET | DESKTOP | TV | UNKNOWN
Device.isDevice        // false when running in emulator
Device.totalMemory     // bytes
```

---

## 🔒 SecureStore (Expo)

Store sensitive data securely (uses Keychain/Keystore):

```javascript
import * as SecureStore from 'expo-secure-store';

// Save
await SecureStore.setItemAsync('auth_token', 'my-jwt-token');

// Read
const token = await SecureStore.getItemAsync('auth_token');

// Delete
await SecureStore.deleteItemAsync('auth_token');
```

---

## 🖥️ AppState

Track whether the app is in the foreground, background, or inactive:

```javascript
import { AppState } from 'react-native';

useEffect(() => {
  const subscription = AppState.addEventListener('change', state => {
    // 'active'     — foreground (user can see and interact)
    // 'background' — backgrounded (home button pressed)
    // 'inactive'   — transitioning (iOS only: call overlay, etc.)
    console.log('App state:', state);
  });
  return () => subscription.remove();
}, []);
```

---

## ⌨️ Keyboard

Control and react to the keyboard:

```javascript
import { Keyboard, KeyboardAvoidingView, Platform } from 'react-native';

// Dismiss keyboard
Keyboard.dismiss();

// Listen to keyboard events
useEffect(() => {
  const show = Keyboard.addListener('keyboardDidShow', (e) => {
    console.log('Keyboard height:', e.endCoordinates.height);
  });
  const hide = Keyboard.addListener('keyboardDidHide', () => {
    console.log('Keyboard hidden');
  });
  return () => { show.remove(); hide.remove(); };
}, []);

// Prevent keyboard from covering inputs
<KeyboardAvoidingView
  style={{ flex: 1 }}
  behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
>
  <TextInput placeholder="Email" />
  <TextInput placeholder="Password" secureTextEntry />
</KeyboardAvoidingView>
```

---

[← Previous: State & Hooks](06-state-and-hooks.md) | [Contents](README.md) | [Next: Networking & APIs →](08-networking.md)
