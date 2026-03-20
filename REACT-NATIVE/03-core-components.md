# 03: Core Components

## 🧱 Core Components Overview

React Native provides built-in components that map to native UI elements. There are no HTML tags — instead you use React Native's own component set.

| Web (HTML) | React Native | Description |
|------------|--------------|-------------|
| `<div>` | `<View>` | Container / layout box |
| `<p>`, `<span>` | `<Text>` | Any text content |
| `<img>` | `<Image>` | Display images |
| `<input>` | `<TextInput>` | Text input field |
| `<button>` | `<TouchableOpacity>` / `<Pressable>` | Tappable element |
| `<ul>` / `<ol>` | `<FlatList>` / `<SectionList>` | Lists |
| `<div style="overflow:scroll">` | `<ScrollView>` | Scrollable container |
| `<select>` | `<Picker>` / Modal | Dropdown picker |

---

## 📦 View

The most fundamental layout component — like a `div`. Used for grouping and styling.

```javascript
import { View } from 'react-native';

function Card() {
  return (
    <View style={{ padding: 16, backgroundColor: '#fff', borderRadius: 8 }}>
      {/* children go here */}
    </View>
  );
}
```

**Key props:**
- `style` — layout and visual styling
- `accessible` — accessibility flag
- `onLayout` — callback when component is laid out

---

## 📝 Text

**All text must be wrapped in `<Text>`** — you cannot render raw strings outside of it.

```javascript
import { Text } from 'react-native';

function Example() {
  return (
    <Text style={{ fontSize: 18, fontWeight: 'bold', color: '#333' }}>
      Hello, React Native!
    </Text>
  );
}
```

**Nesting Text:**
```javascript
<Text>
  This is <Text style={{ fontWeight: 'bold' }}>bold</Text> and{' '}
  <Text style={{ color: 'red' }}>red</Text>.
</Text>
```

**Key props:**
- `numberOfLines` — truncate with ellipsis
- `onPress` — make text tappable
- `selectable` — allow text selection

```javascript
<Text numberOfLines={2} ellipsizeMode="tail">
  This is a very long text that will be truncated after two lines...
</Text>
```

---

## 🖼️ Image

Displays local or network images.

```javascript
import { Image } from 'react-native';

// Local image
<Image source={require('./assets/logo.png')} style={{ width: 100, height: 100 }} />

// Network image (requires explicit width & height)
<Image
  source={{ uri: 'https://example.com/photo.jpg' }}
  style={{ width: 200, height: 150 }}
  resizeMode="cover"
/>
```

**`resizeMode` options:**
| Value | Behavior |
|-------|----------|
| `cover` | Fill area, crop if needed |
| `contain` | Fit inside, add letterbox |
| `stretch` | Stretch to fill exactly |
| `center` | Center at original size |

**Key props:**
- `source` — local (`require`) or network (`{ uri }`)
- `style` — must specify width/height for network images
- `onLoad` — fired when image loads
- `onError` — fired on load failure
- `defaultSource` — placeholder while loading

---

## ⌨️ TextInput

Text field for user input.

```javascript
import { useState } from 'react';
import { TextInput, View } from 'react-native';

function LoginForm() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  return (
    <View>
      <TextInput
        value={email}
        onChangeText={setEmail}
        placeholder="Email"
        keyboardType="email-address"
        autoCapitalize="none"
        style={{ borderWidth: 1, padding: 10, borderRadius: 6 }}
      />
      <TextInput
        value={password}
        onChangeText={setPassword}
        placeholder="Password"
        secureTextEntry
        style={{ borderWidth: 1, padding: 10, borderRadius: 6 }}
      />
    </View>
  );
}
```

**Key props:**
| Prop | Description |
|------|-------------|
| `keyboardType` | `default`, `numeric`, `email-address`, `phone-pad` |
| `autoCapitalize` | `none`, `sentences`, `words`, `characters` |
| `secureTextEntry` | Hides text (for passwords) |
| `multiline` | Multi-line text area |
| `maxLength` | Character limit |
| `onSubmitEditing` | Called when Return key pressed |
| `returnKeyType` | `done`, `next`, `search`, `go` |
| `autoFocus` | Focus on mount |

---

## 👆 Pressable & TouchableOpacity

Make any element tappable.

### Pressable (recommended — most flexible)
```javascript
import { Pressable, Text } from 'react-native';

<Pressable
  onPress={() => console.log('Pressed!')}
  style={({ pressed }) => [
    styles.button,
    pressed && styles.buttonPressed,
  ]}
>
  <Text>Tap Me</Text>
</Pressable>
```

### TouchableOpacity (classic — reduces opacity on press)
```javascript
import { TouchableOpacity, Text } from 'react-native';

<TouchableOpacity onPress={handlePress} activeOpacity={0.7}>
  <Text>Tap Me</Text>
</TouchableOpacity>
```

**Touch events:**
- `onPress` — single tap
- `onLongPress` — hold
- `onPressIn` — finger down
- `onPressOut` — finger up

---

## 📜 ScrollView

Scrollable container for content. Best for **small, finite** lists.

```javascript
import { ScrollView, Text } from 'react-native';

function ContentPage() {
  return (
    <ScrollView
      showsVerticalScrollIndicator={false}
      contentContainerStyle={{ padding: 16 }}
    >
      <Text>Section 1...</Text>
      <Text>Section 2...</Text>
      {/* more content */}
    </ScrollView>
  );
}
```

**Horizontal scroll:**
```javascript
<ScrollView horizontal showsHorizontalScrollIndicator={false}>
  {items.map(item => <Card key={item.id} item={item} />)}
</ScrollView>
```

> ⚠️ **Warning:** `ScrollView` renders all children at once. For long lists, use `FlatList`.

---

## 📋 FlatList

Performant, virtualized list — only renders visible items.

```javascript
import { FlatList, Text, View } from 'react-native';

const data = [
  { id: '1', title: 'Item One' },
  { id: '2', title: 'Item Two' },
  { id: '3', title: 'Item Three' },
];

function MyList() {
  const renderItem = ({ item }) => (
    <View style={styles.item}>
      <Text>{item.title}</Text>
    </View>
  );

  return (
    <FlatList
      data={data}
      renderItem={renderItem}
      keyExtractor={item => item.id}
      ItemSeparatorComponent={() => <View style={styles.separator} />}
      ListEmptyComponent={<Text>No items found</Text>}
      onRefresh={handleRefresh}
      refreshing={isRefreshing}
      onEndReached={loadMore}
      onEndReachedThreshold={0.5}
    />
  );
}
```

**Key props:**
| Prop | Description |
|------|-------------|
| `data` | Array of items |
| `renderItem` | Function to render each item |
| `keyExtractor` | Unique key function |
| `numColumns` | Grid layout |
| `horizontal` | Horizontal list |
| `ListHeaderComponent` | Header element |
| `ListFooterComponent` | Footer element |
| `ListEmptyComponent` | Shown when data is empty |
| `onEndReached` | Trigger for infinite scroll |

---

## 🗂️ SectionList

Like `FlatList` but with grouped sections.

```javascript
import { SectionList, Text, View } from 'react-native';

const sections = [
  { title: 'A', data: ['Alice', 'Adam'] },
  { title: 'B', data: ['Bob', 'Ben'] },
];

<SectionList
  sections={sections}
  keyExtractor={(item, index) => item + index}
  renderItem={({ item }) => <Text style={styles.item}>{item}</Text>}
  renderSectionHeader={({ section }) => (
    <Text style={styles.header}>{section.title}</Text>
  )}
/>
```

---

## 🔘 Switch

Toggle boolean state.

```javascript
import { Switch, View, Text } from 'react-native';

function ToggleSetting() {
  const [enabled, setEnabled] = useState(false);

  return (
    <View style={{ flexDirection: 'row', alignItems: 'center' }}>
      <Text>Dark Mode</Text>
      <Switch
        value={enabled}
        onValueChange={setEnabled}
        trackColor={{ false: '#767577', true: '#81b0ff' }}
        thumbColor={enabled ? '#f5dd4b' : '#f4f3f4'}
      />
    </View>
  );
}
```

---

## 🗃️ Modal

Overlay dialog or sheet.

```javascript
import { Modal, View, Text, Pressable } from 'react-native';

function AlertModal({ visible, onClose }) {
  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}   // Android back button
    >
      <View style={styles.overlay}>
        <View style={styles.dialog}>
          <Text style={styles.title}>Confirm Action</Text>
          <Text>Are you sure you want to continue?</Text>
          <Pressable onPress={onClose} style={styles.button}>
            <Text>OK</Text>
          </Pressable>
        </View>
      </View>
    </Modal>
  );
}
```

**`animationType`:** `none` | `slide` | `fade`

---

## 📊 ActivityIndicator

Loading spinner.

```javascript
import { ActivityIndicator, View } from 'react-native';

function LoadingScreen() {
  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
      <ActivityIndicator size="large" color="#007AFF" />
    </View>
  );
}
```

---

## 🔗 SafeAreaView

Renders content within the safe area boundaries (notch, home indicator).

```javascript
import { SafeAreaView } from 'react-native-safe-area-context';

function App() {
  return (
    <SafeAreaView style={{ flex: 1 }} edges={['top', 'bottom']}>
      {/* content */}
    </SafeAreaView>
  );
}
```

> Always wrap your root screen in `SafeAreaView` to avoid content being hidden under device notches.

---

## ⌛ StatusBar

Control the appearance of the device status bar.

```javascript
import { StatusBar } from 'expo-status-bar';

function App() {
  return (
    <>
      <StatusBar style="dark" />  {/* light | dark | auto */}
      {/* app content */}
    </>
  );
}
```

---

[← Previous: Environment Setup](02-setup.md) | [Contents](README.md) | [Next: Styling & Flexbox →](04-styling.md)
