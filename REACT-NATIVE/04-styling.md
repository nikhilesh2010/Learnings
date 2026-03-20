# 04: Styling & Flexbox

## 🎨 Styling in React Native

React Native does **not** use CSS. Styles are written as **JavaScript objects** and applied via the `style` prop. `StyleSheet.create()` is the recommended way to define styles.

```javascript
import { View, Text, StyleSheet } from 'react-native';

function Card() {
  return (
    <View style={styles.card}>
      <Text style={styles.title}>Hello</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,  // Android shadow
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
  },
});
```

**Why `StyleSheet.create()`?**
- Validates styles in development
- Optimizes by sending style IDs instead of objects across the bridge
- Better IDE autocomplete

---

## 📐 Units

React Native uses **density-independent pixels (dp)** — no `px`, `em`, `rem`, or `%` (mostly).

```javascript
// All numbers are in dp (density-independent pixels)
{ width: 100, height: 50, fontSize: 16 }

// Percentage strings are supported for width/height
{ width: '100%', height: '50%' }
```

---

## 📏 Dimensions API

Get the screen or window size:

```javascript
import { Dimensions } from 'react-native';

const { width, height } = Dimensions.get('window');
// 'window' is the app area (excluding status bar on Android)
// 'screen' is the full device screen

const styles = StyleSheet.create({
  halfScreen: {
    width: width / 2,
    height: height * 0.3,
  },
});
```

**Dynamic dimensions with hook:**
```javascript
import { useWindowDimensions } from 'react-native';

function ResponsiveBox() {
  const { width, height } = useWindowDimensions();
  return <View style={{ width: width * 0.8, height: height * 0.2 }} />;
}
```

---

## 💪 Flexbox

React Native uses **Flexbox** for layout — similar to CSS Flexbox, but with different defaults.

### React Native vs CSS Flexbox Defaults

| Property | CSS Default | React Native Default |
|----------|-------------|----------------------|
| `flexDirection` | `row` | **`column`** |
| `alignContent` | `stretch` | `flex-start` |
| `flexShrink` | `1` | `0` |

### Main Axis & Cross Axis

```
flexDirection: 'column' (default)
┌──────────────┐
│   Item 1     │  ← main axis (↓)
│   Item 2     │
│   Item 3     │
└──────────────┘
cross axis: →

flexDirection: 'row'
┌──────────────────────────┐
│  Item 1  Item 2  Item 3  │  ← main axis (→)
└──────────────────────────┘
cross axis: ↓
```

---

## 🧱 Core Flexbox Properties

### `flex`

Occupy remaining space proportionally:

```javascript
// Parent: flex: 1 (fill entire screen)
// Children split space
<View style={{ flex: 1 }}>
  <View style={{ flex: 1, backgroundColor: 'red' }} />   // 1/3
  <View style={{ flex: 2, backgroundColor: 'blue' }} />  // 2/3
</View>
```

### `justifyContent` (main axis alignment)

```javascript
{ justifyContent: 'flex-start' }   // Default — packed at start
{ justifyContent: 'flex-end' }     // Packed at end
{ justifyContent: 'center' }       // Centered
{ justifyContent: 'space-between' }// Space between items
{ justifyContent: 'space-around' } // Space around items
{ justifyContent: 'space-evenly' } // Equal space everywhere
```

```
space-between:  |A       B       C|
space-around:   | A   B   C |
space-evenly:   |  A  B  C  |
```

### `alignItems` (cross axis alignment)

```javascript
{ alignItems: 'stretch' }    // Default — fill cross axis
{ alignItems: 'flex-start' } // Align to start
{ alignItems: 'flex-end' }   // Align to end
{ alignItems: 'center' }     // Centered on cross axis
{ alignItems: 'baseline' }   // Text baseline alignment
```

### `alignSelf` (override for a single child)

```javascript
<View style={{ alignItems: 'flex-start' }}>
  <View style={{ alignSelf: 'flex-end' }}>
    {/* This one item aligns to end */}
  </View>
</View>
```

### `flexWrap`

```javascript
{ flexWrap: 'nowrap' }  // Default — no wrapping
{ flexWrap: 'wrap' }    // Wrap to next row/column
```

---

## 📦 Box Model

```javascript
{
  // Margin (outside spacing)
  margin: 10,
  marginTop: 5,
  marginHorizontal: 16,  // marginLeft + marginRight
  marginVertical: 8,     // marginTop + marginBottom

  // Padding (inside spacing)
  padding: 10,
  paddingTop: 5,
  paddingHorizontal: 16,
  paddingVertical: 8,

  // Border
  borderWidth: 1,
  borderTopWidth: 2,
  borderColor: '#ccc',
  borderRadius: 8,
  borderTopLeftRadius: 12,
}
```

---

## 🖌️ Color

```javascript
{
  // Named colors
  color: 'red',
  backgroundColor: 'white',

  // Hex
  color: '#FF5733',
  backgroundColor: '#1A1A2E',

  // RGB / RGBA
  color: 'rgb(255, 87, 51)',
  backgroundColor: 'rgba(0, 0, 0, 0.5)',

  // HSL
  color: 'hsl(9, 100%, 60%)',
}
```

---

## ✍️ Typography

```javascript
{
  fontSize: 16,
  fontWeight: 'bold',         // '100' to '900', 'bold', 'normal'
  fontStyle: 'italic',        // 'normal' | 'italic'
  fontFamily: 'Roboto',       // must be loaded/linked
  textAlign: 'center',        // 'left' | 'right' | 'center' | 'justify'
  letterSpacing: 1,
  lineHeight: 24,
  textDecorationLine: 'underline',  // 'none' | 'underline' | 'line-through'
  textTransform: 'uppercase',       // 'uppercase' | 'lowercase' | 'capitalize'
  color: '#333',
}
```

---

## 🌑 Shadows

**iOS:**
```javascript
{
  shadowColor: '#000',
  shadowOffset: { width: 0, height: 4 },
  shadowOpacity: 0.2,
  shadowRadius: 6,
}
```

**Android:**
```javascript
{
  elevation: 5,  // 0–24
}
```

**Cross-platform (using react-native-shadow-2 or styled-components):**
```javascript
import { Platform } from 'react-native';

const shadow = Platform.select({
  ios: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
  },
  android: {
    elevation: 4,
  },
});
```

---

## 📐 Position

```javascript
// Relative (default) — takes up space in flow
{ position: 'relative', top: 10 }

// Absolute — removed from flow, positioned relative to parent
{
  position: 'absolute',
  top: 0,
  right: 0,
  bottom: 0,
  left: 0,
}

// Shorthand for absolute fill
StyleSheet.absoluteFillObject
// Equivalent to: { position: 'absolute', top: 0, right: 0, bottom: 0, left: 0 }
```

---

## 🎭 Dynamic Styles

### Array Syntax

```javascript
// Merge multiple style objects
<View style={[styles.base, styles.active, { marginTop: 10 }]} />
```

### Conditional Styles

```javascript
<Text style={[styles.text, isError && styles.errorText]}>
  Message
</Text>
```

### Inline Styles (use sparingly)

```javascript
<View style={{ backgroundColor: dynamicColor, width: width * 0.9 }} />
```

---

## 🎨 Theming Pattern

```javascript
// theme.js
export const theme = {
  colors: {
    primary: '#007AFF',
    background: '#F2F2F7',
    text: '#1C1C1E',
    border: '#C6C6C8',
  },
  spacing: {
    xs: 4,
    sm: 8,
    md: 16,
    lg: 24,
    xl: 32,
  },
  typography: {
    h1: { fontSize: 32, fontWeight: 'bold' },
    body: { fontSize: 16, lineHeight: 24 },
  },
};

// Usage
import { theme } from './theme';

const styles = StyleSheet.create({
  container: {
    backgroundColor: theme.colors.background,
    padding: theme.spacing.md,
  },
  title: {
    ...theme.typography.h1,
    color: theme.colors.text,
  },
});
```

---

## 🌙 Dark Mode

```javascript
import { useColorScheme } from 'react-native';

function Screen() {
  const scheme = useColorScheme(); // 'light' | 'dark' | null

  const backgroundColor = scheme === 'dark' ? '#1C1C1E' : '#FFFFFF';
  const textColor = scheme === 'dark' ? '#FFFFFF' : '#1C1C1E';

  return (
    <View style={{ flex: 1, backgroundColor }}>
      <Text style={{ color: textColor }}>Hello</Text>
    </View>
  );
}
```

---

## 💡 Common Layout Patterns

### Center Everything
```javascript
{ flex: 1, justifyContent: 'center', alignItems: 'center' }
```

### Full Screen
```javascript
{ flex: 1 }
```

### Row with Space Between
```javascript
{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }
```

### Absolute Overlay
```javascript
{
  ...StyleSheet.absoluteFillObject,
  backgroundColor: 'rgba(0,0,0,0.5)',
  zIndex: 10,
}
```

### Card Style
```javascript
{
  backgroundColor: '#fff',
  borderRadius: 12,
  padding: 16,
  marginHorizontal: 16,
  marginVertical: 8,
  elevation: 3,
  shadowColor: '#000',
  shadowOffset: { width: 0, height: 2 },
  shadowOpacity: 0.1,
  shadowRadius: 4,
}
```

---

[← Previous: Core Components](03-core-components.md) | [Contents](README.md) | [Next: Navigation →](05-navigation.md)
