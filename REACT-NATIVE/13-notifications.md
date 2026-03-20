# 13: Notifications

## 🔔 Notification Types

| Type | Delivery | Example |
|------|----------|---------|
| **Local** | Scheduled by the device itself | Reminder alarm, daily habit |
| **Push** | Sent from a server to the device | Chat message, order update |

---

## 📦 expo-notifications Setup

```bash
npx expo install expo-notifications expo-device
```

### Configure (app.json)

```json
{
  "expo": {
    "plugins": [
      [
        "expo-notifications",
        {
          "icon": "./assets/notification-icon.png",
          "color": "#ffffff",
          "sounds": ["./assets/notification-sound.wav"]
        }
      ]
    ]
  }
}
```

### Global Notification Handler

Set once at app startup:

```javascript
import * as Notifications from 'expo-notifications';

// How to present notifications when app is in foreground
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});
```

---

## 📲 Push Notifications

### Request Permission & Get Token

```javascript
import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import Constants from 'expo-constants';

async function registerForPushNotifications(): Promise<string | null> {
  if (!Device.isDevice) {
    console.warn('Push notifications require a physical device');
    return null;
  }

  const { status: existing } = await Notifications.getPermissionsAsync();
  let finalStatus = existing;

  if (existing !== 'granted') {
    const { status } = await Notifications.requestPermissionsAsync();
    finalStatus = status;
  }

  if (finalStatus !== 'granted') {
    Alert.alert('Permission denied', 'Enable notifications in Settings.');
    return null;
  }

  // Get Expo Push Token
  const projectId = Constants.expoConfig?.extra?.eas?.projectId;
  const token = (await Notifications.getExpoPushTokenAsync({ projectId })).data;

  // Send this token to your backend
  await api.post('/users/push-token', { token });

  return token;
}
```

### Handle Incoming Notifications

```javascript
import { useEffect, useRef } from 'react';
import * as Notifications from 'expo-notifications';
import { useNavigation } from '@react-navigation/native';

function useNotifications() {
  const navigation = useNavigation();
  const responseListener = useRef<Notifications.Subscription>();

  useEffect(() => {
    registerForPushNotifications();

    // Notification received while app is open
    const receivedSub = Notifications.addNotificationReceivedListener(notification => {
      console.log('Notification received:', notification);
    });

    // User tapped on a notification
    responseListener.current = Notifications.addNotificationResponseReceivedListener(response => {
      const data = response.notification.request.content.data;
      
      if (data?.screen === 'Message') {
        navigation.navigate('Chat', { chatId: data.chatId });
      }
    });

    return () => {
      receivedSub.remove();
      responseListener.current?.remove();
    };
  }, []);
}
```

### Send Push from Your Backend

Using Expo's push service:

```javascript
// Node.js server example
async function sendPushNotification(expoPushToken, title, body, data = {}) {
  const message = {
    to: expoPushToken,
    sound: 'default',
    title,
    body,
    data,
    badge: 1,
  };

  await fetch('https://exp.host/--/api/v2/push/send', {
    method: 'POST',
    headers: {
      'Accept': 'application/json',
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(message),
  });
}
```

---

## ⏰ Local Notifications

Schedule notifications without a server.

### Immediate Notification

```javascript
await Notifications.scheduleNotificationAsync({
  content: {
    title: 'Task Complete! ✅',
    body: 'Your upload finished successfully.',
    sound: true,
    data: { screen: 'Uploads' },
  },
  trigger: null,  // null = send immediately
});
```

### Scheduled Notification

```javascript
// In 5 seconds
await Notifications.scheduleNotificationAsync({
  content: {
    title: 'Reminder',
    body: "Don't forget your meeting!",
  },
  trigger: {
    seconds: 5,
  },
});

// At a specific date
await Notifications.scheduleNotificationAsync({
  content: {
    title: 'Daily Reminder',
    body: 'Time to review your tasks.',
  },
  trigger: {
    date: new Date('2025-01-01T09:00:00'),
  },
});

// Repeating — every day at 8 AM
await Notifications.scheduleNotificationAsync({
  content: {
    title: 'Good Morning!',
    body: 'Start your day with a goal.',
  },
  trigger: {
    hour: 8,
    minute: 0,
    repeats: true,
  },
});

// Repeating — every week
await Notifications.scheduleNotificationAsync({
  content: { title: 'Weekly Check-In' },
  trigger: {
    weekday: 2,  // 1=Sun, 2=Mon, 7=Sat
    hour: 9,
    minute: 0,
    repeats: true,
  },
});
```

### Manage Scheduled Notifications

```javascript
// Get all scheduled
const scheduled = await Notifications.getAllScheduledNotificationsAsync();

// Cancel one
await Notifications.cancelScheduledNotificationAsync(notificationId);

// Cancel all
await Notifications.cancelAllScheduledNotificationsAsync();
```

---

## 🔢 Badge Count

```javascript
// Set badge number on app icon
await Notifications.setBadgeCountAsync(5);

// Get current badge count
const count = await Notifications.getBadgeCountAsync();

// Clear badge
await Notifications.setBadgeCountAsync(0);
```

---

## 📨 Notification Channels (Android)

Android requires notification channels (categories):

```javascript
await Notifications.setNotificationChannelAsync('messages', {
  name: 'Messages',
  importance: Notifications.AndroidImportance.HIGH,
  vibrationPattern: [0, 250, 250, 250],
  lightColor: '#007AFF',
  sound: 'default',
});

await Notifications.setNotificationChannelAsync('reminders', {
  name: 'Reminders',
  importance: Notifications.AndroidImportance.DEFAULT,
  sound: 'notification-sound',  // must match filename in assets
});

// Use the channel when scheduling
await Notifications.scheduleNotificationAsync({
  content: {
    title: 'New Message',
    body: 'Alice sent you a message',
    android: { channelId: 'messages' },
  },
  trigger: null,
});
```

---

## 🎯 Notification Categories (iOS Actions)

Add action buttons to iOS notifications:

```javascript
await Notifications.setNotificationCategoryAsync('message', [
  {
    identifier: 'reply',
    buttonTitle: 'Reply',
    textInput: { submitButtonTitle: 'Send', placeholder: 'Type reply...' },
  },
  {
    identifier: 'mark_read',
    buttonTitle: 'Mark as Read',
    options: { isDestructive: false },
  },
]);

// Send notification with the category
await Notifications.scheduleNotificationAsync({
  content: {
    title: 'New Message',
    body: 'Alice: Hey!',
    categoryIdentifier: 'message',
    data: { chatId: '123' },
  },
  trigger: null,
});

// Handle action response
Notifications.addNotificationResponseReceivedListener(response => {
  const { actionIdentifier, userText } = response;
  if (actionIdentifier === 'reply') {
    sendReply(userText);
  }
});
```

---

## 📱 FCM / APNs (Direct Push — without Expo)

For production apps not using Expo's push service:

```bash
npm install @react-native-firebase/app @react-native-firebase/messaging
```

```javascript
import messaging from '@react-native-firebase/messaging';

async function setupFCM() {
  const authStatus = await messaging().requestPermission();
  const enabled =
    authStatus === messaging.AuthorizationStatus.AUTHORIZED ||
    authStatus === messaging.AuthorizationStatus.PROVISIONAL;

  if (enabled) {
    const token = await messaging().getToken();
    await api.post('/users/fcm-token', { token });
  }
}

// Handle background messages
messaging().setBackgroundMessageHandler(async remoteMessage => {
  console.log('Background message:', remoteMessage);
});

// Handle foreground messages
useEffect(() => {
  const unsubscribe = messaging().onMessage(async remoteMessage => {
    Alert.alert('New message!', remoteMessage.notification?.body);
  });
  return unsubscribe;
}, []);
```

---

[← Previous: Camera & Media](12-camera-and-media.md) | [Contents](README.md) | [Next: Performance →](14-performance.md)
