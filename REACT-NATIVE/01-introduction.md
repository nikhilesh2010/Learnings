# 01: What is React Native?

## 🚀 Introduction

**React Native** is an open-source framework by Meta for building native mobile applications using JavaScript and React. Unlike hybrid frameworks that render inside a WebView, React Native bridges JavaScript code to real **native platform components**.

### Why React Native?

| Feature | Benefit |
|---------|---------|
| **Cross-Platform** | One codebase → iOS & Android |
| **Native Performance** | Renders actual native UI components |
| **React Knowledge Reuse** | Same concepts as React web |
| **Hot Reload** | Instant feedback during development |
| **Large Ecosystem** | Expo, community libraries, Meta support |
| **OTA Updates** | Push JS updates without app store approval |

---

## 📊 How React Native Works

```
JavaScript Code (your app)
         │
         ↓
   JS Thread (Metro)
         │
   Bridge / JSI
         │
         ↓
  Native Thread (iOS / Android)
         │
         ↓
   Native UI Components
   (UIView / Android View)
```

### Old Architecture: Bridge
- JS and Native ran on separate threads
- Communication was asynchronous via a serialized JSON bridge

### New Architecture: JSI (JavaScript Interface)
- Direct C++ bindings between JS and Native
- Synchronous calls, better performance
- Powers **Fabric** (new renderer) and **TurboModules**

---

## ⚖️ React Native vs React Web

| Aspect | React Web | React Native |
|--------|-----------|--------------|
| Output | HTML + CSS | Native Views |
| Layout Engine | Browser CSS | Yoga (Flexbox) |
| Base Components | `div`, `span`, `p` | `View`, `Text`, `Image` |
| Styling | `.css` / CSS-in-JS | `StyleSheet.create()` |
| Routing | React Router / Next.js | React Navigation |
| Assets | Public folder | Bundled assets |
| Debugging | Chrome DevTools | Flipper / Hermes |

---

## ⚖️ React Native vs Other Mobile Solutions

| Solution | Language | UI | Performance |
|----------|----------|----|-------------|
| **React Native** | JavaScript | Native | High |
| **Flutter** | Dart | Custom Canvas | High |
| **Ionic** | JS / HTML | WebView | Medium |
| **Swift / Kotlin** | Native | Native | Highest |
| **Xamarin** | C# | Native / Custom | High |

---

## 🏗️ Core Concepts at a Glance

### **1. Components**
Same component model as React — functional components with hooks

```javascript
import { View, Text } from 'react-native';

function Greeting({ name }) {
  return (
    <View>
      <Text>Hello, {name}!</Text>
    </View>
  );
}
```

### **2. StyleSheet**
Styles are JavaScript objects, not CSS

```javascript
import { StyleSheet } from 'react-native';

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
  },
});
```

### **3. No DOM — Native Components**
```javascript
// ❌ Not valid in React Native
<div className="box">Hello</div>

// ✅ React Native equivalents
<View style={styles.box}>
  <Text>Hello</Text>
</View>
```

### **4. Platform Access**
Direct access to device capabilities via native modules

```javascript
import { Platform, Vibration } from 'react-native';

if (Platform.OS === 'ios') {
  console.log('Running on iOS');
}
Vibration.vibrate(500);
```

---

## 🎯 React Native App Workflow

```
┌──────────────────┐
│  Write JSX +     │
│  Hooks in JS     │
└────────┬─────────┘
         │
         ↓
┌──────────────────┐
│  Metro Bundler   │
│  compiles JS     │
└────────┬─────────┘
         │
         ↓
┌──────────────────┐
│  JSI / Bridge    │
│  communicates    │
└────────┬─────────┘
         │
         ↓
┌──────────────────┐
│  Native Modules  │
│  & UI Components │
└────────┬─────────┘
         │
         ↓
┌──────────────────┐
│  iOS App or      │
│  Android App     │
└──────────────────┘
```

---

## 📱 What You Can Build

- **Social apps** — feed, chat, stories
- **E-commerce** — product listings, checkout
- **Dashboards** — charts, tables, analytics
- **Utilities** — calculators, note-taking
- **Media apps** — streaming, camera, gallery
- **Games (light)** — 2D games with Animated or Reanimated

---

## 🏢 Who Uses React Native?

- **Meta** — Facebook, Instagram
- **Microsoft** — Office Mobile, Xbox
- **Shopify** — Shop app
- **Discord** — Mobile client
- **Coinbase** — Crypto wallet
- **Walmart** — Shopping app

---

## 📈 React Native in 2024+

- **New Architecture** (JSI + Fabric + TurboModules) is stable & default in new projects
- **Expo** has become the standard starting point
- **EAS (Expo Application Services)** handles builds and OTA updates
- Strong TypeScript support out of the box

---

[Contents](README.md) | [Next: Environment Setup →](02-setup.md)
