# 12: Camera & Media

## 📷 expo-camera

```bash
npx expo install expo-camera
```

### Basic Camera

```javascript
import { CameraView, useCameraPermissions } from 'expo-camera';
import { useRef, useState } from 'react';

function CameraScreen() {
  const [permission, requestPermission] = useCameraPermissions();
  const [facing, setFacing] = useState<'front' | 'back'>('back');
  const cameraRef = useRef<CameraView>(null);

  if (!permission) return <View />;  // Still loading

  if (!permission.granted) {
    return (
      <View style={styles.container}>
        <Text>Camera permission required</Text>
        <Pressable onPress={requestPermission}>
          <Text>Grant Permission</Text>
        </Pressable>
      </View>
    );
  }

  const takePicture = async () => {
    if (!cameraRef.current) return;
    const photo = await cameraRef.current.takePictureAsync({
      quality: 0.8,
      base64: false,
      exif: false,
    });
    console.log('Photo URI:', photo.uri);
  };

  return (
    <View style={{ flex: 1 }}>
      <CameraView
        ref={cameraRef}
        style={{ flex: 1 }}
        facing={facing}
        flash="auto"
      />
      <View style={styles.controls}>
        <Pressable onPress={() => setFacing(f => f === 'back' ? 'front' : 'back')}>
          <Text>Flip</Text>
        </Pressable>
        <Pressable onPress={takePicture} style={styles.captureButton} />
      </View>
    </View>
  );
}
```

### Record Video

```javascript
const [isRecording, setIsRecording] = useState(false);

const startRecording = async () => {
  setIsRecording(true);
  const video = await cameraRef.current!.recordAsync({
    maxDuration: 60,  // seconds
    maxFileSize: 50 * 1024 * 1024,  // 50 MB
  });
  setIsRecording(false);
  console.log('Video URI:', video.uri);
};

const stopRecording = () => {
  cameraRef.current?.stopRecording();
};
```

### QR / Barcode Scanner

```javascript
import { CameraView } from 'expo-camera';

function QRScanner({ onScanned }) {
  const [scanned, setScanned] = useState(false);

  return (
    <CameraView
      style={{ flex: 1 }}
      facing="back"
      barcodeScannerSettings={{
        barcodeTypes: ['qr', 'ean13', 'ean8', 'code128'],
      }}
      onBarcodeScanned={scanned ? undefined : ({ type, data }) => {
        setScanned(true);
        onScanned({ type, data });
      }}
    />
  );
}
```

---

## 🖼️ Image Picker (expo-image-picker)

Let the user pick images or videos from their library or capture with the camera.

```bash
npx expo install expo-image-picker
```

```javascript
import * as ImagePicker from 'expo-image-picker';

async function pickImage() {
  // Request permission
  const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
  if (status !== 'granted') {
    Alert.alert('Permission required', 'Please allow photo library access.');
    return;
  }

  const result = await ImagePicker.launchImageLibraryAsync({
    mediaTypes: ImagePicker.MediaTypeOptions.Images,
    allowsEditing: true,
    aspect: [4, 3],
    quality: 0.8,
    allowsMultipleSelection: false,
  });

  if (!result.canceled) {
    const asset = result.assets[0];
    console.log('URI:', asset.uri);
    console.log('Width:', asset.width, 'Height:', asset.height);
    uploadImage(asset.uri);
  }
}

// Launch camera directly
async function takePhoto() {
  const { status } = await ImagePicker.requestCameraPermissionsAsync();
  if (status !== 'granted') return;

  const result = await ImagePicker.launchCameraAsync({
    mediaTypes: ImagePicker.MediaTypeOptions.Images,
    quality: 0.9,
  });

  if (!result.canceled) {
    const photo = result.assets[0];
    setImage(photo.uri);
  }
}
```

---

## 🎵 Audio (expo-audio)

```bash
npx expo install expo-audio
```

### Playback

```javascript
import { useAudioPlayer } from 'expo-audio';

function AudioPlayer({ url }) {
  const player = useAudioPlayer(url);

  return (
    <View>
      <Pressable onPress={() => player.play()}>
        <Text>Play</Text>
      </Pressable>
      <Pressable onPress={() => player.pause()}>
        <Text>Pause</Text>
      </Pressable>
      <Pressable onPress={() => player.seekTo(0)}>
        <Text>Restart</Text>
      </Pressable>
    </View>
  );
}
```

### Recording

```javascript
import { useAudioRecorder, AudioModule, RecordingPresets } from 'expo-audio';

function AudioRecorder() {
  const recorder = useAudioRecorder(RecordingPresets.HIGH_QUALITY);

  const startRecording = async () => {
    await AudioModule.requestRecordingPermissionsAsync();
    await recorder.record();
  };

  const stopRecording = async () => {
    await recorder.stop();
    const uri = recorder.uri;
    console.log('Recorded URI:', uri);
  };

  return (
    <View>
      <Pressable onPress={recorder.isRecording ? stopRecording : startRecording}>
        <Text>{recorder.isRecording ? 'Stop' : 'Record'}</Text>
      </Pressable>
    </View>
  );
}
```

---

## 🎬 Video (expo-video)

```bash
npx expo install expo-video
```

```javascript
import { VideoView, useVideoPlayer } from 'expo-video';

function VideoPlayer({ uri }) {
  const player = useVideoPlayer(uri, (p) => {
    p.loop = false;
    p.play();
  });

  return (
    <VideoView
      player={player}
      style={{ width: '100%', height: 250 }}
      allowsFullscreen
      allowsPictureInPicture
    />
  );
}
```

---

## 🏞️ Image Manipulation (expo-image-manipulator)

```bash
npx expo install expo-image-manipulator
```

```javascript
import * as ImageManipulator from 'expo-image-manipulator';

async function resizeAndCrop(uri: string) {
  const result = await ImageManipulator.manipulateAsync(
    uri,
    [
      { resize: { width: 800 } },
      { crop: { originX: 0, originY: 0, width: 800, height: 600 } },
      { rotate: 90 },
      { flip: ImageManipulator.FlipType.Horizontal },
    ],
    {
      compress: 0.8,
      format: ImageManipulator.SaveFormat.JPEG,
    }
  );

  return result.uri;
}
```

---

## 📤 Sharing Images

```javascript
import * as Sharing from 'expo-sharing';
import * as FileSystem from 'expo-file-system';

async function shareImage(imageUri: string) {
  const isAvailable = await Sharing.isAvailableAsync();
  if (!isAvailable) {
    Alert.alert('Sharing not available on this device');
    return;
  }

  // If it's a remote URL, download first
  if (imageUri.startsWith('http')) {
    const localUri = FileSystem.cacheDirectory + 'shared-image.jpg';
    await FileSystem.downloadAsync(imageUri, localUri);
    await Sharing.shareAsync(localUri, {
      mimeType: 'image/jpeg',
    });
  } else {
    await Sharing.shareAsync(imageUri);
  }
}
```

---

## 💾 Saving to Camera Roll

```javascript
import * as MediaLibrary from 'expo-media-library';

async function saveToGallery(uri: string) {
  const { status } = await MediaLibrary.requestPermissionsAsync();
  if (status !== 'granted') return;

  const asset = await MediaLibrary.createAssetAsync(uri);

  // Save to specific album
  const album = await MediaLibrary.getAlbumAsync('MyApp');
  if (album) {
    await MediaLibrary.addAssetsToAlbumAsync([asset], album, false);
  } else {
    await MediaLibrary.createAlbumAsync('MyApp', asset, false);
  }

  Alert.alert('Saved to gallery!');
}
```

---

## 🖼️ Expo Image (Optimized)

The `expo-image` component is more performant than the built-in `Image`:

```bash
npx expo install expo-image
```

```javascript
import { Image } from 'expo-image';

<Image
  source="https://example.com/photo.jpg"
  placeholder={{ uri: blurHashUri }}         // Show while loading
  contentFit="cover"                          // Like CSS object-fit
  transition={300}                            // Fade in duration (ms)
  style={{ width: 200, height: 200, borderRadius: 12 }}
  cachePolicy="memory-disk"                   // 'none' | 'disk' | 'memory' | 'memory-disk'
/>
```

**Benefits over built-in `Image`:**
- Better caching
- BlurHash / ThumbHash placeholders
- Smoother transitions
- Better memory management

---

[← Previous: Gestures & Touch](11-gestures.md) | [Contents](README.md) | [Next: Notifications →](13-notifications.md)
