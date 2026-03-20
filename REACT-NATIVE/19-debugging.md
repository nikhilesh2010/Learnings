# 19: Debugging & Tools

## 🛠️ Debugging Tools Overview

| Tool | Use Case |
|------|----------|
| **React Native Debugger** | JS debugging, Redux DevTools |
| **Flipper** | Network inspector, layout inspector, logs |
| **Expo Dev Tools** | Quick access to reload, logs, QR code |
| **React DevTools** | Component tree, props, state inspection |
| **Hermes Debugger** | JS profiling with Chrome DevTools |
| **Reactotron** | Network, state, async storage inspector |
| **LogBox** | In-app warnings and errors |

---

## 🔄 Developer Menu

Shake your device or press keyboard shortcut:
- **iOS Simulator:** `Cmd+D`
- **Android Emulator:** `Cmd+M` (Mac) / `Ctrl+M` (Windows)
- **Physical device:** Shake the device

Options available:
- **Reload** — Reload the JS bundle
- **Open Debugger** — Connect to Chrome / Hermes debugger
- **Show Element Inspector** — Tap components to inspect
- **Toggle Performance Monitor** — Shows FPS, JS/UI thread usage
- **Show Dev Menu** — Access settings

---

## 🔁 Fast Refresh

React Native's hot reload automatically reloads components on save, preserving state where possible.

```javascript
// Force full reload (not just hot reload)
// Press R twice in the terminal running Metro

// If Fast Refresh is causing issues, disable in Dev Menu
// Dev Menu → Fast Refresh → toggle

// Force component to re-mount on hot reload
// @refresh reset  ← add this comment at top of file
```

---

## 📱 Expo Dev Client

```bash
# Start dev server
npx expo start

# Commands in terminal:
# r — reload
# m — open dev menu
# j — open debugger
# i — open iOS simulator
# a — open Android emulator
# ? — more commands

# Start with tunnel (share with others on different networks)
npx expo start --tunnel

# Clear cache and restart
npx expo start -c
```

---

## 🔍 React DevTools

Inspect component tree, view props and state.

```bash
# Install standalone React DevTools
npm install --global react-devtools

# Run it
react-devtools
```

Then in your app dev menu: **Open Debugger** → connect to React DevTools.

Features:
- Browse component tree
- Inspect and edit props / state live
- Highlight component re-renders
- Profile rendering performance

---

## 🦅 Flipper

Full-featured mobile debugging platform.

**Install:** [Flipper Desktop](https://fbflipper.com)

### Key Plugins

**Network Inspector:**
```javascript
// See all API requests/responses in real time
// No code changes needed — works automatically in debug builds
```

**React DevTools:**
- Component tree viewer built into Flipper

**Layout Inspector:**
- Visualize view hierarchy, inspect styles, measure elements

**Hermes Debugger:**
- Step-by-step JS debugger (breakpoints, watch variables)

**AsyncStorage Viewer:**
- Browse and edit AsyncStorage keys

**Crash Reporter:**
- View native crashes with stack traces

---

## 🧪 Console Debugging

```javascript
// Basic logging
console.log('Data:', data);
console.warn('Warning message');
console.error('Error occurred:', error);

// Table format (objects)
console.table(users);

// Grouping
console.group('User Flow');
console.log('Step 1: Login');
console.log('Step 2: Fetch Profile');
console.groupEnd();

// Timing
console.time('fetchUsers');
const users = await fetchUsers();
console.timeEnd('fetchUsers');  // Logs: "fetchUsers: 245ms"

// Conditional logging (remove in prod)
if (__DEV__) {
  console.log('Debug info:', debugData);
}
```

---

## 🐛 Common Issues & Fixes

### Red Screen (Runtime Error)

```
TypeError: Cannot read property 'map' of undefined
```
**Fix:** Add null checks: `data?.map(...)` or provide default value.

---

### Yellow Warning: VirtualizedLists nested in ScrollViews

```
VirtualizedLists should never be nested inside plain ScrollViews
```
**Fix:** Replace outer `ScrollView` with `FlatList` + `ListHeaderComponent`, or use `ScrollView` with a plain mapped array instead of `FlatList`.

---

### Metro Bundler Cache Error

```
Error: Unable to resolve module ...
```
**Fix:** Clear the cache:
```bash
npx expo start -c
# or
npx react-native start --reset-cache
```

---

### Keyboard Covers Input

**Fix:** Use `KeyboardAvoidingView`:
```javascript
<KeyboardAvoidingView
  behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
  style={{ flex: 1 }}
>
```

---

### Android Emulator Not Detecting Server

```bash
# Reverse port from emulator to host machine
adb reverse tcp:8081 tcp:8081
adb reverse tcp:19000 tcp:19000
```

---

### iOS Simulator Not Opening

```bash
# List available simulators
xcrun simctl list devices

# Boot a specific simulator
xcrun simctl boot "iPhone 15 Pro"
open -a Simulator
```

---

### Expo Go App Out of Date

```bash
# Check SDK version
npx expo --version

# Update Expo SDK
npx expo install expo@latest
```

---

### CocoaPods Install Fails (iOS)

```bash
cd ios
pod deintegrate
pod install
```

---

### Android Build Fails — Gradle Daemon

```bash
cd android
./gradlew clean
cd ..
npx react-native run-android
```

---

## 📊 Performance Monitor

Enable in Dev Menu → **Show Perf Monitor**.

```
JS: 60 FPS   ← JavaScript thread frame rate
UI: 60 FPS   ← UI / render thread frame rate
RAM: 124 MB
```

**Target:** Both threads at 60 FPS. Drops below 60 indicate:
- **JS FPS drops:** Heavy JS computation, too many re-renders
- **UI FPS drops:** Complex animations not using native driver

---

## 🔍 Element Inspector

Dev Menu → **Toggle Element Inspector** → tap any element to see:
- Component name
- Applied styles
- Layout dimensions
- Source location

---

## 📝 LogBox Customization

```javascript
import { LogBox } from 'react-native';

// Ignore specific warnings
LogBox.ignoreLogs([
  'Sending `onAnimatedValueUpdate`',      // Known RN issue
  'AsyncStorage has been extracted',
  /ViewPropTypes will be removed/,        // Regex pattern
]);

// Ignore all warnings (use with caution in dev only)
if (!__DEV__) {
  LogBox.ignoreAllLogs();
}
```

---

## 🔭 Reactotron

Powerful debugger for state, network, and async storage.

```bash
npm install --save-dev reactotron-react-native

# For Redux:
npm install --save-dev reactotron-redux
```

```javascript
// ReactotronConfig.ts
import Reactotron from 'reactotron-react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

if (__DEV__) {
  Reactotron
    .setAsyncStorageHandler(AsyncStorage)
    .configure({ name: 'MyApp' })
    .useReactNative()
    .connect();

  // Custom logging
  console.tron = Reactotron;
}

// Usage
console.tron?.log('Custom log', { data });
console.tron?.warn('Something odd');
console.tron?.display({
  name: 'API Call',
  value: response.data,
  important: true,
});
```

---

## 🐞 Debugging Network Requests

### Flipper Network Plugin (automatic in debug)

### Manual logging with Axios interceptors:

```javascript
api.interceptors.request.use(config => {
  if (__DEV__) {
    console.log(`→ ${config.method?.toUpperCase()} ${config.url}`, config.data);
  }
  return config;
});

api.interceptors.response.use(
  response => {
    if (__DEV__) {
      console.log(`← ${response.status} ${response.config.url}`, response.data);
    }
    return response;
  },
  error => {
    if (__DEV__) {
      console.error(`✗ ${error.response?.status} ${error.config?.url}`, error.response?.data);
    }
    return Promise.reject(error);
  }
);
```

---

## 📈 Crash Reporting (Production)

### Sentry

```bash
npx expo install sentry-expo @sentry/react-native
```

```javascript
// App.tsx
import * as Sentry from '@sentry/react-native';

Sentry.init({
  dsn: 'YOUR_SENTRY_DSN',
  environment: process.env.APP_ENV,
  enableNative: true,
  tracesSampleRate: 0.2,
});

// Wrap root component
export default Sentry.wrap(App);

// Manual error capture
Sentry.captureException(new Error('Something failed'));
Sentry.captureMessage('Non-fatal warning', 'warning');

// Add context
Sentry.setUser({ id: user.id, email: user.email });
Sentry.setTag('version', appVersion);
```

---

## 🧰 Useful ADB Commands (Android)

```bash
# List connected devices
adb devices

# Take screenshot
adb shell screencap -p /sdcard/screen.png
adb pull /sdcard/screen.png ./

# View logcat (device logs)
adb logcat -s ReactNative:V ReactNativeJS:V

# Clear app data (like uninstall/reinstall)
adb shell pm clear com.yourapp.myapp

# Install APK
adb install path/to/app.apk

# Tunnel port
adb reverse tcp:8081 tcp:8081
```

---

## 🧰 Useful Simulator Commands (iOS)

```bash
# List simulators
xcrun simctl list devices

# Take screenshot
xcrun simctl io booted screenshot screenshot.png

# Record screen
xcrun simctl io booted recordVideo recording.mp4

# Open URL / deep link
xcrun simctl openurl booted "myapp://profile/123"

# Clear app data
xcrun simctl uninstall booted com.yourapp.myapp
```

---

[← Previous: Best Practices](18-best-practices.md) | [Contents](README.md)
