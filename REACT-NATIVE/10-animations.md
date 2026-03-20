# 10: Animations

## 🎬 Animation Options in React Native

| Option | Complexity | Performance | Use Case |
|--------|------------|-------------|----------|
| **Animated API** | Medium | Good (can use native driver) | Built-in, simple animations |
| **React Native Reanimated** | Medium | Excellent (runs on UI thread) | Complex, gesture-driven |
| **Lottie** | Low | Good | JSON-based vector animations |
| **Moti** | Low | Excellent (wraps Reanimated) | Declarative, simple API |

---

## 🎯 Animated API (Built-In)

### Animated Values

```javascript
import { Animated } from 'react-native';
import { useRef } from 'react';

function FadeIn({ children }) {
  const opacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(opacity, {
      toValue: 1,
      duration: 500,
      useNativeDriver: true,  // ✅ Always use when possible — runs on native thread
    }).start();
  }, []);

  return (
    <Animated.View style={{ opacity }}>
      {children}
    </Animated.View>
  );
}
```

### Animation Types

```javascript
// timing — linear or eased transition over time
Animated.timing(value, {
  toValue: 1,
  duration: 300,
  easing: Easing.out(Easing.quad),
  useNativeDriver: true,
}).start(({ finished }) => {
  if (finished) console.log('Done!');
});

// spring — physics-based bounce
Animated.spring(value, {
  toValue: 1,
  tension: 40,
  friction: 7,
  useNativeDriver: true,
}).start();

// decay — momentum-based deceleration
Animated.decay(value, {
  velocity: 0.5,
  deceleration: 0.998,
  useNativeDriver: true,
}).start();
```

### Composing Animations

```javascript
// sequence — one after another
Animated.sequence([
  Animated.timing(opacity, { toValue: 1, duration: 300, useNativeDriver: true }),
  Animated.timing(translateY, { toValue: 0, duration: 400, useNativeDriver: true }),
]).start();

// parallel — all at once
Animated.parallel([
  Animated.timing(opacity, { toValue: 1, duration: 400, useNativeDriver: true }),
  Animated.spring(scale, { toValue: 1, useNativeDriver: true }),
]).start();

// stagger — parallel with delay between each
Animated.stagger(100, [
  Animated.timing(items[0].opacity, { toValue: 1, duration: 300, useNativeDriver: true }),
  Animated.timing(items[1].opacity, { toValue: 1, duration: 300, useNativeDriver: true }),
  Animated.timing(items[2].opacity, { toValue: 1, duration: 300, useNativeDriver: true }),
]).start();

// loop — repeat
Animated.loop(
  Animated.sequence([
    Animated.timing(scale, { toValue: 1.2, duration: 500, useNativeDriver: true }),
    Animated.timing(scale, { toValue: 1, duration: 500, useNativeDriver: true }),
  ])
).start();
```

### Interpolate

Map one range to another:

```javascript
const rotation = opacity.interpolate({
  inputRange: [0, 1],
  outputRange: ['0deg', '360deg'],
});

const backgroundColor = progress.interpolate({
  inputRange: [0, 1],
  outputRange: ['rgb(255,0,0)', 'rgb(0,255,0)'],
});

const translateY = scrollY.interpolate({
  inputRange: [0, 100],
  outputRange: [0, -50],
  extrapolate: 'clamp',  // Don't go outside output range
});

// Usage
<Animated.View style={{
  transform: [{ rotate: rotation }],
}} />
```

### Animated Components

```javascript
// Built-in animated versions
<Animated.View style={{ opacity }} />
<Animated.Text style={{ fontSize }} />
<Animated.Image style={{ opacity }} />
<Animated.ScrollView onScroll={...} />

// Create custom animated component
const AnimatedPressable = Animated.createAnimatedComponent(Pressable);
```

---

## 🔥 React Native Reanimated (Recommended)

Runs animations on the UI thread — no JS bridge latency, buttery smooth.

```bash
npm install react-native-reanimated
# Add plugin to babel.config.js:
# plugins: ['react-native-reanimated/plugin']
```

### Basic Usage

```javascript
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withSpring,
  withSequence,
  withRepeat,
  Easing,
} from 'react-native-reanimated';

function ScaleButton() {
  const scale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const handlePress = () => {
    scale.value = withSequence(
      withTiming(0.9, { duration: 100 }),
      withSpring(1, { damping: 10, stiffness: 200 })
    );
  };

  return (
    <Animated.View style={animatedStyle}>
      <Pressable onPress={handlePress}>
        <Text>Press Me</Text>
      </Pressable>
    </Animated.View>
  );
}
```

### Shared Values & Animated Styles

```javascript
// useSharedValue — lives on UI thread
const opacity = useSharedValue(0);
const translateX = useSharedValue(-100);

// Trigger animation from JS
opacity.value = withTiming(1, { duration: 500 });
translateX.value = withSpring(0);

// useAnimatedStyle — derives styles from shared values
const style = useAnimatedStyle(() => ({
  opacity: opacity.value,
  transform: [{ translateX: translateX.value }],
}));

// Use computed values
const animStyle = useAnimatedStyle(() => ({
  opacity: opacity.value,
  transform: [
    { translateX: interpolate(opacity.value, [0, 1], [-50, 0]) },
  ],
}));
```

### Common Reanimated Helpers

```javascript
import {
  interpolate,
  interpolateColor,
  Extrapolation,
  runOnJS,
} from 'react-native-reanimated';

// Interpolate number
const height = interpolate(
  progress.value,
  [0, 1],
  [0, 200],
  Extrapolation.CLAMP
);

// Interpolate color
const bg = interpolateColor(
  progress.value,
  [0, 1],
  ['#fff', '#007AFF']
);

// Call JS function from UI thread
function onComplete() {
  // This runs on JS thread
  navigation.navigate('Home');
}

opacity.value = withTiming(1, {}, (finished) => {
  'worklet';
  if (finished) runOnJS(onComplete)();
});
```

### Collapsible Header (scroll-driven animation)

```javascript
function ScrollWithHeader() {
  const scrollY = useSharedValue(0);

  const scrollHandler = useAnimatedScrollHandler({
    onScroll: (event) => {
      'worklet';
      scrollY.value = event.contentOffset.y;
    },
  });

  const headerStyle = useAnimatedStyle(() => ({
    height: interpolate(scrollY.value, [0, 100], [200, 60], Extrapolation.CLAMP),
    opacity: interpolate(scrollY.value, [0, 80], [1, 0], Extrapolation.CLAMP),
  }));

  return (
    <>
      <Animated.View style={[styles.header, headerStyle]}>
        <Text style={styles.headerTitle}>My Feed</Text>
      </Animated.View>
      <Animated.ScrollView onScroll={scrollHandler} scrollEventThrottle={16}>
        {/* content */}
      </Animated.ScrollView>
    </>
  );
}
```

---

## 🧩 Moti (Declarative Animations)

Moti wraps Reanimated with a simple, declarative API.

```bash
npm install moti
```

```javascript
import { MotiView, MotiText } from 'moti';

// Fade in on mount
<MotiView
  from={{ opacity: 0, translateY: 20 }}
  animate={{ opacity: 1, translateY: 0 }}
  transition={{ type: 'timing', duration: 400 }}
/>

// Animated presence (enter/exit)
import { AnimatePresence } from 'moti';

<AnimatePresence>
  {visible && (
    <MotiView
      from={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.8 }}
    />
  )}
</AnimatePresence>

// Looping skeleton loader
import { Skeleton } from 'moti/skeleton';

<Skeleton colorMode="light" width={200} height={20} radius={8} />
<Skeleton colorMode="light" width={120} height={20} radius={8} />
```

---

## 🎞️ Lottie Animations

Play Adobe After Effects / JSON animations.

```bash
npx expo install lottie-react-native
```

```javascript
import LottieView from 'lottie-react-native';
import { useRef } from 'react';

function SuccessAnimation() {
  const animRef = useRef<LottieView>(null);

  useEffect(() => {
    animRef.current?.play();
  }, []);

  return (
    <LottieView
      ref={animRef}
      source={require('./assets/success.json')}
      style={{ width: 200, height: 200 }}
      autoPlay
      loop={false}
      speed={1.5}
      onAnimationFinish={() => navigation.goBack()}
    />
  );
}
```

> Browse free animations at [lottiefiles.com](https://lottiefiles.com)

---

## 🧩 Layout Animations (Reanimated)

Animate component mounting/unmounting automatically:

```javascript
import Animated, { FadeIn, FadeOut, SlideInRight, ZoomIn } from 'react-native-reanimated';

// Item that animates in on mount
<Animated.View entering={FadeIn.duration(300)} exiting={FadeOut}>
  <Card />
</Animated.View>

// List items stagger in
{items.map((item, index) => (
  <Animated.View
    key={item.id}
    entering={SlideInRight.delay(index * 100).duration(300)}
  >
    <ListItem item={item} />
  </Animated.View>
))}

// Enable layout transitions
import { enableLayoutAnimations } from 'react-native-reanimated';
enableLayoutAnimations(true);
```

---

[← Previous: Storage](09-storage.md) | [Contents](README.md) | [Next: Gestures & Touch →](11-gestures.md)
