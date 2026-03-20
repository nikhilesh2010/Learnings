# 12: Streams & Buffers

## 🌊 What are Streams?

**Streams** are a way to handle data piece-by-piece instead of loading everything into memory at once. Essential for large files, video, or real-time data.

```
❌ Without Streams:
  Read entire file → Load into RAM → Process → Send
       (crashes on large files)

✅ With Streams:
  Read chunk → Process chunk → Send chunk → Read next chunk...
       (constant low memory usage)
```

---

## 🔠 Types of Streams

| Type | Description | Example |
|------|-------------|---------|
| **Readable** | Source of data | `fs.createReadStream()`, `http` request |
| **Writable** | Destination for data | `fs.createWriteStream()`, `http` response |
| **Duplex** | Both readable and writable | `net.Socket` (TCP socket) |
| **Transform** | Modifies data as it passes through | `zlib.createGzip()` |

---

## 📖 Readable Streams

```javascript
const fs = require('fs');

// Create a readable stream
const readStream = fs.createReadStream('bigfile.txt', {
  encoding: 'utf8',
  highWaterMark: 16 * 1024, // 16KB chunks
});

// Listen to events
readStream.on('data', (chunk) => {
  console.log('Received chunk:', chunk.length, 'bytes');
});

readStream.on('end', () => {
  console.log('Finished reading!');
});

readStream.on('error', (err) => {
  console.error('Error:', err.message);
});
```

---

## ✏️ Writable Streams

```javascript
const fs = require('fs');

const writeStream = fs.createWriteStream('output.txt');

// Write chunks
writeStream.write('Hello, ');
writeStream.write('World!\n');
writeStream.write('More content...\n');

// Signal end
writeStream.end();

writeStream.on('finish', () => {
  console.log('Done writing!');
});

writeStream.on('error', (err) => {
  console.error('Write error:', err.message);
});
```

---

## 🔗 Piping Streams (The Power Tool)

`pipe()` connects a readable stream to a writable stream — automatically handles backpressure.

```javascript
const fs = require('fs');

// Copy a file using streams (memory efficient)
const readStream = fs.createReadStream('input.txt');
const writeStream = fs.createWriteStream('output.txt');

readStream.pipe(writeStream);

writeStream.on('finish', () => {
  console.log('File copied!');
});
```

### Pipe with Transform (compress on the fly)

```javascript
const fs = require('fs');
const zlib = require('zlib');

// Compress a file: read → gzip → write
fs.createReadStream('big.txt')
  .pipe(zlib.createGzip())
  .pipe(fs.createWriteStream('big.txt.gz'))
  .on('finish', () => console.log('Compressed!'));
```

### Streaming a large file as an HTTP response

```javascript
const http = require('http');
const fs = require('fs');

http.createServer((req, res) => {
  res.writeHead(200, { 'Content-Type': 'text/plain' });
  fs.createReadStream('hugefile.txt').pipe(res);
  // No need to load the whole file into memory!
}).listen(3000);
```

---

## 🧊 Buffers

A **Buffer** is a fixed-size chunk of raw binary data — like a byte array. Buffers are used when dealing with binary files, network data, or images.

```javascript
// Create a buffer
const buf1 = Buffer.from('Hello, World!', 'utf8');
const buf2 = Buffer.alloc(10);          // 10 bytes, zeroed
const buf3 = Buffer.allocUnsafe(10);    // 10 bytes, uninitialized (faster)

// Read buffer content
console.log(buf1.toString('utf8'));   // Hello, World!
console.log(buf1.toString('hex'));    // 48656c6c6f2c...
console.log(buf1.toString('base64')); // SGVsbG8sIFdvcmxkIQ==

// Buffer length
console.log(buf1.length); // byte count, not character count

// Concatenate buffers
const combined = Buffer.concat([buf1, buf2]);
```

### Buffer vs String

```javascript
// String: for text
const str = 'Hello';

// Buffer: for binary (images, files, network data)
const imgData = Buffer.from(base64ImageString, 'base64');
fs.writeFileSync('image.png', imgData);
```

---

## 🔄 Transform Streams

Transform streams let you **modify data** as it flows through:

```javascript
const { Transform } = require('stream');

// Custom transform: uppercase text
const upperCase = new Transform({
  transform(chunk, encoding, callback) {
    this.push(chunk.toString().toUpperCase());
    callback();
  },
});

// Use it in a pipeline
process.stdin
  .pipe(upperCase)
  .pipe(process.stdout);

// Or with files
fs.createReadStream('input.txt')
  .pipe(upperCase)
  .pipe(fs.createWriteStream('output.txt'));
```

---

## 🛡️ stream.pipeline (Error-safe Piping)

`pipe()` doesn't handle errors well in chains. Use `pipeline()` instead:

```javascript
const { pipeline } = require('stream');
const fs = require('fs');
const zlib = require('zlib');

pipeline(
  fs.createReadStream('input.txt'),
  zlib.createGzip(),
  fs.createWriteStream('output.gz'),
  (err) => {
    if (err) console.error('Pipeline failed:', err);
    else console.log('Pipeline succeeded!');
  }
);

// Or with async/await
const { pipeline } = require('stream/promises');

await pipeline(
  fs.createReadStream('input.txt'),
  zlib.createGzip(),
  fs.createWriteStream('output.gz')
);
```

---

## 📡 Streaming in Express

```javascript
const express = require('express');
const fs = require('fs');
const path = require('path');

const app = express();

// Stream a large CSV file
app.get('/download/report', (req, res) => {
  const filePath = path.join(__dirname, 'data', 'report.csv');

  res.setHeader('Content-Type', 'text/csv');
  res.setHeader('Content-Disposition', 'attachment; filename="report.csv"');

  fs.createReadStream(filePath).pipe(res);
});
```

---

## 🔑 Key Takeaways

- Streams process data **chunk by chunk** — ideal for large files
- 4 types: **Readable**, **Writable**, **Duplex**, **Transform**
- `pipe()` connects streams; use `stream.pipeline()` for proper error handling
- **Buffers** are raw binary data containers
- Use `Buffer.from()`, `Buffer.alloc()` to create; `.toString()` to read
- Streaming a file with `createReadStream().pipe(res)` means no memory spike

---

[← Previous: Event Loop & EventEmitter](11-event-loop.md) | [Contents](README.md) | [Next: Error Handling →](13-error-handling.md)
