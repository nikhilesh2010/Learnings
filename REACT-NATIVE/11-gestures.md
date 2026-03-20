# 11: Gestures & Touch

## 👆 Touch Primitives (Built-In)

### Pressable (recommended)

```javascript
import { Pressable, Text } from 'react-native';

<Pressable
  onPress={() => console.log('tap')}
  onLongPress={() => console.log('long press')}
  onPressIn={() => console.log('finger down')}
  onPressOut={() => console.log('finger up')}
  delayLongPress={500}    // long press threshold (ms)
  hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}  // expand tap area
  style={({ pressed }) => ({
    backgroundColor: pressed ? '#ddd' : '#fff',
    borderRadius: 8,
    padding: 12,
  })}
>
  <Text>Tap Me</Text>
</Pressable>
```

### TouchableOpacity

```javascript
import { TouchableOpacity } from 'react-native';

<TouchableOpacity
  onPress={handlePress}
  activeOpacity={0.6}  // opacity while pressed (0–1)
>
  <Text>Button</Text>
</TouchableOpacity>
```

### TouchableHighlight

Highlights with a backing view color on press:

```javascript
import { TouchableHighlight } from 'react-native';

<TouchableHighlight
  onPress={handlePress}
  underlayColor="#CCE5FF"
>
  <View style={styles.item}><Text>Item</Text></View>
</TouchableHighlight>
```

---

## 🤌 React Native Gesture Handler (Recommended)

More powerful, performant gestures that run on the native thread.

```bash
npm install react-native-gesture-handler
```

Wrap your app root with `GestureHandlerRootView`:

```javascript
import { GestureHandlerRootView } from 'react-native-gesture-handler';

export default function App() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <NavigationContainer>...</NavigationContainer>
    </GestureHandlerRootView>
  );
}
```

---

## 🤲 Gesture Types

### Tap Gesture

```javascript
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Animated, { useSharedValue, withSpring } from 'react-native-reanimated';

function TapButton() {
  const scale = useSharedValue(1);

  const tap = Gesture.Tap()
    .onBegin(() => {
      'worklet';
      scale.value = withSpring(0.9);
    })
    .onFinalize(() => {
      'worklet';
      scale.value = withSpring(1);
    });

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  return (
    <GestureDetector gesture={tap}>
      <Animated.View style={[styles.button, animatedStyle]}>
        <Text>Tap</Text>
      </Animated.View>
    </GestureDetector>
  );
}
```

### Pan (Drag) Gesture

```javascript
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
} from 'react-native-reanimated';

function DraggableCard() {
  const translateX = useSharedValue(0);
  const translateY = useSharedValue(0);
  const startX = useSharedValue(0);
  const startY = useSharedValue(0);

  const pan = Gesture.Pan()
    .onStart(() => {
      'worklet';
      startX.value = translateX.value;
      startY.value = translateY.value;
    })
    .onUpdate((event) => {
      'worklet';
      translateX.value = startX.value + event.translationX;
      translateY.value = startY.value + event.translationY;
    })
    .onEnd(() => {
      'worklet';
      translateX.value = withSpring(0);  // snap back to origin
      translateY.value = withSpring(0);
    });

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [
      { translateX: translateX.value },
      { translateY: translateY.value },
    ],
  }));

  return (
    <GestureDetector gesture={pan}>
      <Animated.View style={[styles.card, animatedStyle]}>
        <Text>Drag Me</Text>
      </Animated.View>
    </GestureDetector>
  );
}
```

### Pinch (Zoom) Gesture

```javascript
const scale = useSharedValue(1);
const savedScale = useSharedValue(1);

const pinch = Gesture.Pinch()
  .onUpdate((event) => {
    'worklet';
    scale.value = savedScale.value * event.scale;
  })
  .onEnd(() => {
    'worklet';
    savedScale.value = scale.value;
  });

const animatedStyle = useAnimatedStyle(() => ({
  transform: [{ scale: scale.value }],
}));
```

### Rotation Gesture

```javascript
import { Gesture } from 'react-native-gesture-handler';

const rotation = useSharedValue(0);
const savedRotation = useSharedValue(0);

const rotateGesture = Gesture.Rotation()
  .onUpdate((event) => {
    'worklet';
    rotation.value = savedRotation.value + event.rotation;
  })
  .onEnd(() => {
    'worklet';
    savedRotation.value = rotation.value;
  });

const animatedStyle = useAnimatedStyle(() => ({
  transform: [{ rotateZ: `${rotation.value}rad` }],
}));
```

### Simultaneous Gestures

Combine multiple gestures at once (e.g., pan + pinch):

```javascript
const composed = Gesture.Simultaneous(pan, pinch, rotateGesture);

<GestureDetector gesture={composed}>
  <Animated.Image source={source} style={[styles.image, animatedStyle]} />
</GestureDetector>
```

### Exclusive Gestures

Only one gesture activates at a time:

```javascript
const exclusive = Gesture.Exclusive(doubleTap, singleTap);
```

---

## 🃏 Swipeable List Item (Swipe to Delete)

```javascript
import { Swipeable } from 'react-native-gesture-handler';

function ListItem({ item, onDelete }) {
  const renderRightActions = () => (
    <Pressable
      onPress={() => onDelete(item.id)}
      style={styles.deleteAction}
    >
      <Text style={styles.deleteText}>Delete</Text>
    </Pressable>
  );

  return (
    <Swipeable renderRightActions={renderRightActions}>
      <View style={styles.itemContainer}>
        <Text>{item.title}</Text>
      </View>
    </Swipeable>
  );
}

const styles = StyleSheet.create({
  deleteAction: {
    backgroundColor: '#FF3B30',
    justifyContent: 'center',
    alignItems: 'center',
    width: 80,
  },
  deleteText: { color: '#fff', fontWeight: 'bold' },
});
```

---

## 📜 ScrollView with Gesture Handler

```javascript
import { ScrollView } from 'react-native-gesture-handler';

// Nested in gesture detectors or bottom sheets
<ScrollView waitFor={panRef} nestedScrollEnabled>
  {/* content */}
</ScrollView>
```

---

## 🔲 Gesture Refs (avoid conflicts)

```javascript
import { useRef } from 'react';

const panRef = useRef(null);
const scrollRef = useRef(null);

const pan = Gesture.Pan()
  .simultaneously(Gesture.Native());  // allow native scroll to work

// Refs for cross-component coordination
const swipeRef = useRef(null);
const childPan = Gesture.Pan().withRef(swipeRef);
```

---

## 📱 Screen Gestures (React Navigation)

React Navigation uses gesture-based navigation by default (swipe back on iOS):

```javascript
// Disable swipe-back for a specific screen
<Stack.Screen
  name="CriticalForm"
  component={CriticalFormScreen}
  options={{ gestureEnabled: false }}
/>

// Custom gesture for swipe
<Stack.Screen
  name="Details"
  options={{
    gestureDirection: 'horizontal',  // 'horizontal' | 'vertical'
    fullScreenGestureEnabled: true,
  }}
/>
```

---

[← Previous: Animations](10-animations.md) | [Contents](README.md) | [Next: Camera & Media →](12-camera-and-media.md)
