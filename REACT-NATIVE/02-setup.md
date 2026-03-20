# 02: Environment Setup

## 🛠️ Two Ways to Start

| Approach | Best For | iOS Simulator | Android Emulator |
|----------|----------|---------------|------------------|
| **Expo (Managed)** | Beginners, rapid prototyping | ✅ | ✅ |
| **React Native CLI** | Full native control, custom modules | ✅ (Mac only) | ✅ |

---

## 🚀 Option 1: Expo (Recommended)

### Step 1 — Prerequisites
- Node.js (LTS) — [nodejs.org](https://nodejs.org)
- A smartphone or emulator

```bash
# Verify Node.js
node -v   # should be 18+
npm -v
```

### Step 2 — Create Project

```bash
npx create-expo-app MyApp
cd MyApp
```

With TypeScript template:
```bash
npx create-expo-app MyApp --template blank-typescript
```

### Step 3 — Start Development Server

```bash
npx expo start
```

This opens **Expo Dev Tools** in your browser and shows a QR code.

### Step 4 — Run on Device

**Physical Device:**
1. Install **Expo Go** from App Store / Play Store
2. Scan the QR code shown in terminal

**Android Emulator:**
```bash
npx expo start --android
```

**iOS Simulator (Mac only):**
```bash
npx expo start --ios
```

---

## ⚙️ Option 2: React Native CLI

### Prerequisites

#### macOS (for iOS development)
```bash
# Install Homebrew
/bin/sh -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"

# Install Node.js & Watchman
brew install node watchman

# Install Ruby (for CocoaPods)
brew install rbenv ruby-build
rbenv install 3.1.0

# Install CocoaPods
sudo gem install cocoapods

# Install Xcode from App Store, then:
sudo xcode-select --switch /Applications/Xcode.app/Contents/Developer
```

#### All Platforms (for Android)
1. Install **JDK 17**
   ```bash
   # macOS
   brew install --cask zulu@17
   
   # Windows — download from adoptium.net
   ```

2. Install **Android Studio** from developer.android.com

3. In Android Studio, install:
   - Android SDK (API 34+)
   - Android SDK Build-Tools
   - Android Virtual Device (AVD)

4. Set environment variables:
   ```bash
   # macOS / Linux (~/.zshrc or ~/.bashrc)
   export ANDROID_HOME=$HOME/Library/Android/sdk
   export PATH=$PATH:$ANDROID_HOME/emulator
   export PATH=$PATH:$ANDROID_HOME/platform-tools
   
   # Windows (System Environment Variables)
   ANDROID_HOME = C:\Users\<user>\AppData\Local\Android\Sdk
   ```

### Create & Run Project

```bash
# Create project
npx @react-native-community/cli@latest init MyApp
cd MyApp

# Run on Android
npx react-native run-android

# Run on iOS (Mac only)
cd ios && pod install && cd ..
npx react-native run-ios
```

---

## 📂 Project Structure

### Expo Project
```
MyApp/
├── app/                  # App Router pages (Expo Router)
│   ├── (tabs)/
│   │   ├── index.tsx
│   │   └── explore.tsx
│   └── _layout.tsx
├── assets/               # Images, fonts, icons
├── components/           # Reusable components
├── constants/            # Colors, themes, config
├── hooks/                # Custom hooks
├── app.json              # Expo configuration
├── package.json
└── tsconfig.json
```

### React Native CLI Project
```
MyApp/
├── android/              # Android native project
├── ios/                  # iOS native project (Xcode)
├── src/
│   ├── screens/          # Screen components
│   ├── components/       # Reusable components
│   ├── navigation/       # Navigation config
│   ├── services/         # API calls, storage
│   └── utils/            # Helper functions
├── App.tsx               # Root component
├── index.js              # Entry point
└── package.json
```

---

## 📄 app.json / app.config.js

Central configuration for Expo apps:

```json
{
  "expo": {
    "name": "MyApp",
    "slug": "my-app",
    "version": "1.0.0",
    "orientation": "portrait",
    "icon": "./assets/icon.png",
    "splash": {
      "image": "./assets/splash.png",
      "backgroundColor": "#ffffff"
    },
    "ios": {
      "supportsTablet": true,
      "bundleIdentifier": "com.yourname.myapp"
    },
    "android": {
      "adaptiveIcon": {
        "foregroundImage": "./assets/adaptive-icon.png",
        "backgroundColor": "#ffffff"
      },
      "package": "com.yourname.myapp"
    }
  }
}
```

---

## 🔄 Metro Bundler

Metro is React Native's JavaScript bundler (like Webpack for the web).

```bash
# Start Metro manually
npx react-native start

# Clear Metro cache (fixes many weird bugs)
npx react-native start --reset-cache
# or with Expo:
npx expo start -c
```

---

## 📦 Essential Dependencies

```bash
# Navigation
npm install @react-navigation/native @react-navigation/stack
npm install react-native-screens react-native-safe-area-context

# State management
npm install zustand        # Lightweight
npm install @reduxjs/toolkit react-redux  # Redux

# Storage
npm install @react-native-async-storage/async-storage

# HTTP requests
npm install axios

# Icons
npm install @expo/vector-icons    # Expo
npm install react-native-vector-icons  # RN CLI

# UI library
npm install react-native-paper
```

---

## 🧩 TypeScript Setup

Expo templates come with TypeScript by default. For RN CLI:

```bash
# Add TypeScript to existing project
npm install --save-dev typescript @types/react @types/react-native
```

`tsconfig.json`:
```json
{
  "extends": "@react-native/typescript-config/tsconfig.json",
  "compilerOptions": {
    "strict": true,
    "baseUrl": ".",
    "paths": {
      "@components/*": ["src/components/*"],
      "@screens/*": ["src/screens/*"]
    }
  }
}
```

---

## ✅ Verify Your Setup

```bash
# Check React Native environment
npx react-native doctor

# Check Expo
npx expo-env-info
```

Common output:
```
✅ Node.js - v20.10.0
✅ npm - 10.2.3
✅ Android SDK - 34
✅ Xcode - 15.0 (Mac only)
✅ CocoaPods - 1.14 (Mac only)
```

---

[← Previous: What is React Native?](01-introduction.md) | [Contents](README.md) | [Next: Core Components →](03-core-components.md)
