# 13 – WebSockets

## What are WebSockets?

WebSockets provide a **persistent, full-duplex communication channel** between the client and server over a single TCP connection. Unlike HTTP (request → response), WebSockets allow both sides to send messages at any time.

Use cases:
- Real-time chat
- Live notifications
- Collaborative editing
- Live dashboards
- Multiplayer games

## Basic WebSocket Endpoint

Declare a WebSocket endpoint with `@app.websocket("/path")`. The handler must be `async def` and must call `await websocket.accept()` before sending or receiving any messages.

```python
from fastapi import FastAPI, WebSocket

app = FastAPI()

@app.websocket("/ws")
async def websocket_endpoint(websocket: WebSocket):
    await websocket.accept()           # accept the connection
    
    while True:
        data = await websocket.receive_text()
        await websocket.send_text(f"Echo: {data}")
```

### HTML Client (for testing)

```html
<!DOCTYPE html>
<html>
<body>
    <input id="msg" type="text">
    <button onclick="send()">Send</button>
    <ul id="messages"></ul>

    <script>
        const ws = new WebSocket("ws://localhost:8000/ws");
        
        ws.onmessage = (event) => {
            const li = document.createElement("li");
            li.textContent = event.data;
            document.getElementById("messages").appendChild(li);
        };

        function send() {
            ws.send(document.getElementById("msg").value);
        }
    </script>
</body>
</html>
```

## Receiving Different Data Types

The WebSocket object provides dedicated methods for receiving text, binary, and JSON payloads. Use the method that matches the format your client sends.

```python
@app.websocket("/ws")
async def ws_handler(websocket: WebSocket):
    await websocket.accept()
    
    data_text = await websocket.receive_text()    # receive string
    data_bytes = await websocket.receive_bytes()  # receive binary
    data_json = await websocket.receive_json()    # receive JSON
```

## Sending Different Data Types

Mirror the receive methods for sending: use `send_text()`, `send_bytes()`, or `send_json()` depending on the payload format. `send_json()` serialises a Python dict or list to JSON automatically.

```python
await websocket.send_text("Hello!")
await websocket.send_bytes(b"binary data")
await websocket.send_json({"event": "update", "data": [1, 2, 3]})
```

## Handling Disconnect

Client disconnections raise a `WebSocketDisconnect` exception. Wrap the receive loop in a `try/except WebSocketDisconnect` block so your handler can perform clean-up such as removing the client from a connection manager or notifying other users.

```python
from fastapi import WebSocket, WebSocketDisconnect

@app.websocket("/ws")
async def websocket_endpoint(websocket: WebSocket):
    await websocket.accept()
    try:
        while True:
            data = await websocket.receive_text()
            await websocket.send_text(f"Echo: {data}")
    except WebSocketDisconnect:
        print("Client disconnected")
```

## Path and Query Parameters

WebSocket endpoints can declare path parameters and query parameters exactly like HTTP routes. This allows passing a room ID in the path or an auth token as a query string parameter on the connection URL.

```python
@app.websocket("/ws/{room_id}")
async def room_chat(websocket: WebSocket, room_id: str, token: str | None = None):
    await websocket.accept()
    
    if not token:
        await websocket.close(code=1008)  # Policy Violation
        return
    
    await websocket.send_text(f"Joined room {room_id}")
    
    try:
        while True:
            msg = await websocket.receive_text()
            await websocket.send_text(f"[{room_id}] {msg}")
    except WebSocketDisconnect:
        pass
```

## Connection Manager (Broadcasting)

Manage multiple clients and broadcast messages:

```python
from fastapi import WebSocket
from typing import List

class ConnectionManager:
    def __init__(self):
        self.active_connections: List[WebSocket] = []

    async def connect(self, websocket: WebSocket):
        await websocket.accept()
        self.active_connections.append(websocket)

    def disconnect(self, websocket: WebSocket):
        self.active_connections.remove(websocket)

    async def send_personal(self, message: str, websocket: WebSocket):
        await websocket.send_text(message)

    async def broadcast(self, message: str):
        for connection in self.active_connections:
            await connection.send_text(message)

manager = ConnectionManager()

@app.websocket("/ws/{client_id}")
async def websocket_endpoint(websocket: WebSocket, client_id: int):
    await manager.connect(websocket)
    try:
        while True:
            data = await websocket.receive_text()
            await manager.send_personal(f"You said: {data}", websocket)
            await manager.broadcast(f"Client #{client_id}: {data}")
    except WebSocketDisconnect:
        manager.disconnect(websocket)
        await manager.broadcast(f"Client #{client_id} left the chat")
```

## Room-Based Chat

Room-based chat groups connected clients by a room identifier. A `RoomManager` tracks which sockets belong to each room and provides a method to broadcast a message to everyone in the room except the sender.

```python
from collections import defaultdict
from typing import Dict, List

class RoomManager:
    def __init__(self):
        self.rooms: Dict[str, List[WebSocket]] = defaultdict(list)

    async def join(self, room: str, websocket: WebSocket):
        await websocket.accept()
        self.rooms[room].append(websocket)

    async def leave(self, room: str, websocket: WebSocket):
        self.rooms[room].remove(websocket)

    async def broadcast_to_room(self, room: str, message: str, sender: WebSocket = None):
        for ws in self.rooms[room]:
            if ws != sender:
                await ws.send_text(message)

room_manager = RoomManager()

@app.websocket("/chat/{room}")
async def chat(websocket: WebSocket, room: str):
    await room_manager.join(room, websocket)
    try:
        while True:
            text = await websocket.receive_text()
            await room_manager.broadcast_to_room(room, text, sender=websocket)
    except WebSocketDisconnect:
        await room_manager.leave(room, websocket)
```

## With Authentication

Because WebSocket connections don't support custom headers easily from browsers, pass the auth token as a query parameter when connecting. Validate it before calling `accept()` — if invalid, close the connection with code `1008` (Policy Violation).

```python
from fastapi import WebSocket, Query, status
from jose import JWTError, jwt

SECRET_KEY = "your-secret"
ALGORITHM = "HS256"

async def get_user_from_token(token: str) -> dict | None:
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        return {"username": payload.get("sub")}
    except JWTError:
        return None

@app.websocket("/ws")
async def authenticated_ws(
    websocket: WebSocket,
    token: str = Query(...)
):
    user = await get_user_from_token(token)
    if not user:
        await websocket.close(code=status.WS_1008_POLICY_VIOLATION)
        return

    await websocket.accept()
    await websocket.send_text(f"Hello, {user['username']}!")
    ...
```

## WebSocket Close Codes

| Code | Meaning |
|------|---------|
| 1000 | Normal closure |
| 1001 | Going away |
| 1008 | Policy violation (e.g., auth failed) |
| 1011 | Internal server error |
| 4000–4999 | Custom application codes |

```python
await websocket.close(code=1000, reason="Session ended")
```

## Testing WebSockets

Use `TestClient.websocket_connect()` to open a WebSocket connection inside a test. The context manager gives you a connection object with `send_text()` and `receive_text()` methods.

```python
from fastapi.testclient import TestClient

def test_websocket():
    client = TestClient(app)
    with client.websocket_connect("/ws") as ws:
        ws.send_text("Hello")
        data = ws.receive_text()
        assert data == "Echo: Hello"
```

## Summary

- Use `@app.websocket("/path")` to declare a WebSocket endpoint
- Always `await websocket.accept()` before sending or receiving
- Handle `WebSocketDisconnect` to clean up on client exit
- Use a `ConnectionManager` class to track and broadcast to multiple clients
- Authenticate via query params (Bearer token in query string) since WebSocket headers are limited
- Test with `TestClient` and `ws.websocket_connect()`

---

[← Previous: Background Tasks](12-background-tasks.md) | [Contents](README.md) | [Next: File Uploads →](14-file-uploads.md)
