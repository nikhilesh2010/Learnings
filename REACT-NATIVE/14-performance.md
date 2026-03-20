# 14: Performance

## ⚡ Performance Golden Rules

1. Use `FlatList` / `SectionList` instead of `ScrollView` for long lists
2. Use `useNativeDriver: true` for animations
3. Memoize components and callbacks with `memo`, `useCallback`, `useMemo`
4. Avoid inline functions and objects in JSX
5. Use Hermes JavaScript engine
6. Profile before optimizing — don't guess

---

## 📋 FlatList Optimization

`FlatList` only renders items visible on screen (virtualization).

```javascript
<FlatList
  data={items}
  renderItem={renderItem}
  keyExtractor={item => item.id}

  // Performance tuning
  initialNumToRender={10}          // Items to render on first paint
  maxToRenderPerBatch={10}         // Items rendered per batch scroll
  windowSize={5}                   // Render window: 5 * screen height
  removeClippedSubviews={true}     // Unmount off-screen views (Android)
  updateCellsBatchingPeriod={50}   // Batch interval (ms)

  // Avoid re-renders
  getItemLayout={(data, index) => ({  // Skip measurement if fixed height
    length: ITEM_HEIGHT,
    offset: ITEM_HEIGHT * index,
    index,
  })}
/>
```

### Memoize renderItem

```javascript
// ✅ Memoize the item component
const PostCard = memo(function PostCard({ post, onPress }) {
  return (
    <Pressable onPress={() => onPress(post.id)}>
      <Text>{post.title}</Text>
    </Pressable>
  );
});

// ✅ Memoize the handler
function Feed() {
  const handlePress = useCallback((id) => {
    navigation.navigate('Post', { id });
  }, [navigation]);

  const renderItem = useCallback(
    ({ item }) => <PostCard post={item} onPress={handlePress} />,
    [handlePress]
  );

  return <FlatList data={posts} renderItem={renderItem} keyExtractor={i => i.id} />;
}
```

---

## 🧠 React.memo

Prevent re-renders when props haven't changed:

```javascript
// ❌ Re-renders every time parent renders
function UserCard({ user, onFollow }) {
  return (
    <View>
      <Text>{user.name}</Text>
      <Pressable onPress={() => onFollow(user.id)}>
        <Text>Follow</Text>
      </Pressable>
    </View>
  );
}

// ✅ Only re-renders when user or onFollow changes
const UserCard = memo(function UserCard({ user, onFollow }) {
  return (
    <View>
      <Text>{user.name}</Text>
      <Pressable onPress={() => onFollow(user.id)}>
        <Text>Follow</Text>
      </Pressable>
    </View>
  );
});

// Custom comparison
const UserCard = memo(UserCardComponent, (prev, next) =>
  prev.user.id === next.user.id && prev.user.name === next.user.name
);
```

---

## 🔧 useCallback & useMemo

```javascript
function PostList({ filters }) {
  const [posts, setPosts] = useState([]);

  // ✅ Memoize expensive computation
  const filteredPosts = useMemo(
    () => posts.filter(p => p.category === filters.category),
    [posts, filters.category]
  );

  // ✅ Memoize callback to pass stable reference to children
  const handleLike = useCallback(async (postId: string) => {
    await api.post(`/posts/${postId}/like`);
    setPosts(prev => prev.map(p => p.id === postId ? { ...p, liked: true } : p));
  }, []);  // empty deps = stable reference

  return (
    <FlatList
      data={filteredPosts}
      renderItem={({ item }) => <PostCard post={item} onLike={handleLike} />}
    />
  );
}
```

---

## 🎨 Avoid Unnecessary Re-renders

```javascript
// ❌ New object created every render — breaks memo
<UserCard style={{ marginTop: 10 }} />

// ✅ Define outside component
const cardStyle = { marginTop: 10 };
<UserCard style={cardStyle} />

// ❌ New function every render
<Pressable onPress={() => handlePress(item.id)} />

// ✅ Stable reference
const handlePress = useCallback(() => handlePress(item.id), [item.id]);
<Pressable onPress={handlePress} />

// ❌ Inline array — breaks memo
<Tabs screens={['Home', 'Profile', 'Settings']} />

// ✅ Defined once
const TABS = ['Home', 'Profile', 'Settings'];
<Tabs screens={TABS} />
```

---

## 🚀 Hermes JavaScript Engine

Hermes is Meta's JS engine optimized for React Native — pre-compiles to bytecode, faster startup, lower memory.

**Enable in app.json (Expo):**
```json
{
  "expo": {
    "jsEngine": "hermes"
  }
}
```

**React Native CLI (enabled by default in RN 0.70+):**
```ruby
# ios/Podfile
use_react_native!(
  :hermes_enabled => true
)
```

---

## 🧵 useNativeDriver

Always use `useNativeDriver: true` for animations that only change:
- `opacity`
- `transform` (translate, scale, rotate)

```javascript
// ✅ Can use native driver
Animated.timing(opacity, { toValue: 1, useNativeDriver: true }).start();

// ❌ Cannot use native driver (layout properties)
Animated.timing(width, { toValue: 100, useNativeDriver: false }).start();
```

---

## 🖼️ Image Performance

```javascript
// ✅ Use expo-image for better caching and performance
import { Image } from 'expo-image';

<Image
  source={uri}
  cachePolicy="memory-disk"
  transition={200}
  style={{ width: 100, height: 100 }}
/>

// ✅ Set explicit width/height to avoid layout thrashing
// ✅ Use resizeMode="cover" instead of stretching
// ✅ Serve appropriately sized images from your CDN
// ✅ Use WebP format — smaller file size, same quality
```

---

## 📊 Profiling with Flipper

Flipper is React Native's debugging platform with a performance profiler.

1. Open Flipper desktop app
2. Connect device / emulator
3. Select your app
4. Use **React DevTools** plugin for component profiling
5. Use **Hermes Debugger** for CPU profiling

**Key metrics to watch:**
- JS thread FPS (target: 60)
- UI thread FPS (target: 60)
- RAM usage
- Bridge messages (old architecture)

---

## 📉 Bundle Size Optimization

```bash
# Analyze bundle
npx expo export --platform android
# Then use source-map-explorer

npm install --save-dev source-map-explorer
npx source-map-explorer dist/bundles/android-*.js
```

**Tips:**
- Use tree-shaking (ES modules)
- Lazy load screens with `React.lazy` + Suspense
- Replace heavy libraries with lighter alternatives
- Use `react-native-svg` instead of image PNGs for icons

---

## 🧹 Memory Leaks

Common causes and fixes:

```javascript
// ❌ Subscription not cleaned up
useEffect(() => {
  const sub = someEmitter.addListener('event', handler);
  // missing return!
}, []);

// ✅ Always clean up
useEffect(() => {
  const sub = someEmitter.addListener('event', handler);
  return () => sub.remove();
}, []);

// ❌ setState after unmount
useEffect(() => {
  fetchData().then(data => setData(data));  // component may unmount first
}, []);

// ✅ Use cleanup flag
useEffect(() => {
  let mounted = true;
  fetchData().then(data => {
    if (mounted) setData(data);
  });
  return () => { mounted = false; };
}, []);
```

---

## 🎯 InteractionManager

Defer heavy work until after animations:

```javascript
import { InteractionManager } from 'react-native';

function HeavyScreen() {
  const [ready, setReady] = useState(false);

  useEffect(() => {
    // Wait for navigation animation to finish before loading data
    const task = InteractionManager.runAfterInteractions(() => {
      fetchHeavyData();
      setReady(true);
    });
    return () => task.cancel();
  }, []);

  if (!ready) return <LoadingPlaceholder />;
  return <HeavyContent />;
}
```

---

## 📐 LargeList Performance Tips

| Problem | Solution |
|---------|----------|
| Slow scroll | Add `getItemLayout` (fixed height items) |
| Memory high | Reduce `windowSize`, enable `removeClippedSubviews` |
| Re-renders | Memoize `renderItem` and item components |
| Initial slow | Reduce `initialNumToRender` |
| Image flicker | Use `expo-image` with disk cache |
| Jank on update | Batch state updates with `unstable_batchedUpdates` |

---

[← Previous: Notifications](13-notifications.md) | [Contents](README.md) | [Next: Testing →](15-testing.md)
