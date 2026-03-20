# 08: Networking & APIs

## 🌐 Fetch API

React Native includes the browser's `fetch` API — no dependencies needed.

```javascript
// GET request
const response = await fetch('https://api.example.com/posts');
const data = await response.json();

// POST request
const response = await fetch('https://api.example.com/posts', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`,
  },
  body: JSON.stringify({ title: 'Hello', body: 'World' }),
});

if (!response.ok) {
  throw new Error(`HTTP error! status: ${response.status}`);
}

const created = await response.json();
```

---

## 🛡️ Axios (Recommended)

Axios provides a cleaner API, automatic JSON parsing, interceptors, and better error handling.

```bash
npm install axios
```

### Basic Requests

```javascript
import axios from 'axios';

// GET
const { data } = await axios.get('https://api.example.com/users');

// POST
const { data: newUser } = await axios.post('/users', {
  name: 'Alice',
  email: 'alice@example.com',
});

// PUT / PATCH
await axios.put(`/users/${id}`, updatedUser);
await axios.patch(`/users/${id}`, { name: 'Bob' });

// DELETE
await axios.delete(`/users/${id}`);
```

### Create a Configured Instance

```javascript
// services/api.ts
import axios from 'axios';
import * as SecureStore from 'expo-secure-store';

const api = axios.create({
  baseURL: 'https://api.example.com',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor — attach auth token
api.interceptors.request.use(async config => {
  const token = await SecureStore.getItemAsync('auth_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Response interceptor — handle errors globally
api.interceptors.response.use(
  response => response,
  async error => {
    if (error.response?.status === 401) {
      await SecureStore.deleteItemAsync('auth_token');
      // navigate to login
    }
    return Promise.reject(error);
  }
);

export default api;
```

```javascript
// Usage
import api from './services/api';

const { data } = await api.get('/profile');
const { data: post } = await api.post('/posts', { title: 'Hello' });
```

---

## 📡 Building a Service Layer

```javascript
// services/userService.ts
import api from './api';

export const userService = {
  getProfile: () => api.get('/profile').then(r => r.data),
  
  updateProfile: (updates) => api.patch('/profile', updates).then(r => r.data),
  
  getUsers: (page = 1, limit = 20) =>
    api.get('/users', { params: { page, limit } }).then(r => r.data),
  
  deleteAccount: () => api.delete('/account'),
};

// Usage in component
const profile = await userService.getProfile();
```

---

## 🔄 React Query Integration

See [06-state-and-hooks.md](06-state-and-hooks.md) for full setup.

```javascript
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { userService } from '../services/userService';

// Fetch with caching
function ProfileScreen() {
  const { data: profile, isLoading, error } = useQuery({
    queryKey: ['profile'],
    queryFn: userService.getProfile,
    staleTime: 5 * 60 * 1000,
  });

  if (isLoading) return <ActivityIndicator />;
  if (error) return <Text>Error: {error.message}</Text>;

  return <Text>{profile.name}</Text>;
}

// Paginated / infinite scroll
function PostsFeedScreen() {
  const { data, fetchNextPage, hasNextPage, isFetchingNextPage } =
    useInfiniteQuery({
      queryKey: ['posts'],
      queryFn: ({ pageParam = 1 }) =>
        api.get('/posts', { params: { page: pageParam } }).then(r => r.data),
      getNextPageParam: (lastPage, pages) =>
        lastPage.hasMore ? pages.length + 1 : undefined,
    });

  const posts = data?.pages.flatMap(page => page.items) ?? [];

  return (
    <FlatList
      data={posts}
      renderItem={({ item }) => <PostCard post={item} />}
      onEndReached={() => hasNextPage && fetchNextPage()}
      ListFooterComponent={isFetchingNextPage ? <ActivityIndicator /> : null}
    />
  );
}
```

---

## 📤 File Uploads

```javascript
async function uploadImage(imageUri: string) {
  const formData = new FormData();
  
  formData.append('photo', {
    uri: imageUri,
    type: 'image/jpeg',
    name: 'photo.jpg',
  } as any);
  
  formData.append('userId', '123');

  const response = await api.post('/upload', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
    onUploadProgress: (progressEvent) => {
      const percent = Math.round(
        (progressEvent.loaded * 100) / (progressEvent.total ?? 1)
      );
      setProgress(percent);
    },
  });

  return response.data;
}
```

---

## ⬇️ File Downloads

```javascript
import * as FileSystem from 'expo-file-system';

async function downloadFile(url: string, filename: string) {
  const fileUri = FileSystem.documentDirectory + filename;

  const { uri } = await FileSystem.downloadAsync(url, fileUri, {
    headers: { Authorization: `Bearer ${token}` },
  });

  return uri;  // local file path
}

// Download with progress
const downloadResumable = FileSystem.createDownloadResumable(
  url,
  FileSystem.documentDirectory + 'file.pdf',
  {},
  (downloadProgress) => {
    const progress =
      downloadProgress.totalBytesWritten /
      downloadProgress.totalBytesExpectedToWrite;
    setProgress(progress);
  }
);

const { uri } = await downloadResumable.downloadAsync();
```

---

## 🔌 WebSocket

```javascript
const ws = new WebSocket('wss://chat.example.com/ws');

ws.onopen = () => {
  console.log('Connected');
  ws.send(JSON.stringify({ type: 'join', room: 'general' }));
};

ws.onmessage = (event) => {
  const message = JSON.parse(event.data);
  setMessages(prev => [...prev, message]);
};

ws.onerror = (error) => {
  console.error('WebSocket error:', error.message);
};

ws.onclose = () => {
  console.log('Disconnected');
};

// Send message
ws.send(JSON.stringify({ type: 'message', text: 'Hello!' }));

// Close connection
ws.close();

// Custom hook
function useChatWebSocket(roomId: string) {
  const wsRef = useRef<WebSocket | null>(null);
  const [messages, setMessages] = useState([]);

  useEffect(() => {
    wsRef.current = new WebSocket(`wss://chat.example.com/ws?room=${roomId}`);
    wsRef.current.onmessage = ({ data }) =>
      setMessages(prev => [...prev, JSON.parse(data)]);

    return () => wsRef.current?.close();
  }, [roomId]);

  const send = (text: string) =>
    wsRef.current?.send(JSON.stringify({ text }));

  return { messages, send };
}
```

---

## ❌ Error Handling

```javascript
// Axios error handling
try {
  const { data } = await api.get('/user/profile');
} catch (error) {
  if (axios.isAxiosError(error)) {
    if (error.response) {
      // Server responded with a non-2xx status
      console.log('Status:', error.response.status);
      console.log('Message:', error.response.data?.message);
    } else if (error.request) {
      // Request made but no response (network error)
      Alert.alert('No connection', 'Please check your internet.');
    } else {
      // Something else
      console.error('Error:', error.message);
    }
  }
}
```

---

## 🔒 Certificate Pinning

For high-security apps, pin your server's SSL certificate:

```bash
npm install react-native-ssl-pinning
```

```javascript
import { fetch } from 'react-native-ssl-pinning';

const response = await fetch('https://api.example.com/data', {
  method: 'GET',
  sslPinning: {
    certs: ['my_cert_sha256_hash'],
  },
});
```

---

## 🌐 Environment-Based API URLs

```javascript
// config/api.ts
const ENV = {
  development: {
    apiUrl: 'http://localhost:3000',
  },
  staging: {
    apiUrl: 'https://staging-api.example.com',
  },
  production: {
    apiUrl: 'https://api.example.com',
  },
};

const getEnv = () => {
  if (__DEV__) return ENV.development;
  // Set via app.config.js extra field
  return ENV.production;
};

export const API_URL = getEnv().apiUrl;
```

With Expo and `app.config.js`:
```javascript
// app.config.js
export default {
  expo: {
    extra: {
      apiUrl: process.env.API_URL ?? 'https://api.example.com',
    },
  },
};

// Usage
import Constants from 'expo-constants';
const API_URL = Constants.expoConfig?.extra?.apiUrl;
```

---

[← Previous: Platform API](07-platform-api.md) | [Contents](README.md) | [Next: Storage →](09-storage.md)
