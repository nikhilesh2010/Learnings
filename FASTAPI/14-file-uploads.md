# 14 – File Uploads

## Install Required Package

```bash
pip install python-multipart
```

This is required for receiving `multipart/form-data` file uploads.

## Single File Upload

```python
from fastapi import FastAPI, UploadFile, File

app = FastAPI()

@app.post("/upload")
async def upload_file(file: UploadFile = File(...)):
    contents = await file.read()       # read file bytes
    return {
        "filename": file.filename,
        "content_type": file.content_type,
        "size": len(contents)
    }
```

## `UploadFile` Properties

| Property | Description |
|----------|-------------|
| `file.filename` | Original filename from the client |
| `file.content_type` | MIME type (e.g., `image/jpeg`) |
| `file.size` | File size in bytes (after reading) |
| `file.file` | SpooledTemporaryFile object |

## Reading File Contents

```python
@app.post("/upload")
async def upload(file: UploadFile):
    # Read all bytes
    data = await file.read()

    # Read in chunks (for large files)
    chunk_size = 1024 * 1024  # 1MB
    while chunk := await file.read(chunk_size):
        process_chunk(chunk)

    # Seek back to beginning
    await file.seek(0)
    data_again = await file.read()
```

## Saving Files to Disk

```python
import os
import shutil
from pathlib import Path
from fastapi import UploadFile

UPLOAD_DIR = Path("uploads")
UPLOAD_DIR.mkdir(exist_ok=True)

@app.post("/upload")
async def upload_file(file: UploadFile):
    file_path = UPLOAD_DIR / file.filename
    with open(file_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)
    return {"saved_to": str(file_path)}
```

## Saving with a Unique Filename (Prevents Overwrite)

```python
import uuid
from pathlib import Path

@app.post("/upload")
async def upload_file(file: UploadFile):
    extension = Path(file.filename).suffix
    unique_name = f"{uuid.uuid4()}{extension}"
    file_path = UPLOAD_DIR / unique_name

    with open(file_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)

    return {"filename": unique_name, "original": file.filename}
```

## Multiple File Upload

```python
from typing import List

@app.post("/upload-multiple")
async def upload_multiple(files: List[UploadFile] = File(...)):
    return [
        {"filename": f.filename, "size": f.size}
        for f in files
    ]
```

## File Validation

```python
from fastapi import HTTPException

ALLOWED_TYPES = {"image/jpeg", "image/png", "image/webp"}
MAX_FILE_SIZE = 5 * 1024 * 1024   # 5MB

@app.post("/upload-image")
async def upload_image(file: UploadFile = File(...)):
    if file.content_type not in ALLOWED_TYPES:
        raise HTTPException(
            status_code=400,
            detail=f"File type '{file.content_type}' not allowed. Allowed: {ALLOWED_TYPES}"
        )

    contents = await file.read()
    if len(contents) > MAX_FILE_SIZE:
        raise HTTPException(status_code=400, detail="File too large (max 5MB)")

    await file.seek(0)   # reset after reading for saving
    # ... save file
    return {"filename": file.filename}
```

## Combining File Upload with Form Data

```python
from fastapi import Form, UploadFile, File

@app.post("/profile")
async def update_profile(
    username: str = Form(...),
    bio: str = Form(default=""),
    avatar: UploadFile = File(...)
):
    return {
        "username": username,
        "bio": bio,
        "avatar": avatar.filename
    }
```

> Note: You **cannot** mix Pydantic JSON body with file uploads. Use `Form()` for text fields alongside `File()`.

## Optional File Upload

```python
from typing import Optional

@app.post("/items")
async def create_item(
    name: str = Form(...),
    image: Optional[UploadFile] = File(default=None)
):
    if image:
        # save image
        pass
    return {"name": name, "has_image": image is not None}
```

## Streaming File Download

```python
from fastapi.responses import FileResponse, StreamingResponse
from pathlib import Path

@app.get("/download/{filename}")
def download_file(filename: str):
    file_path = UPLOAD_DIR / filename
    if not file_path.exists():
        raise HTTPException(status_code=404, detail="File not found")
    return FileResponse(
        path=file_path,
        filename=filename,          # sets Content-Disposition: attachment
        media_type="application/octet-stream"
    )
```

## Streaming Large Files

```python
@app.get("/stream/{filename}")
def stream_file(filename: str):
    file_path = UPLOAD_DIR / filename

    def iter_file():
        with open(file_path, "rb") as f:
            while chunk := f.read(1024 * 64):   # 64KB chunks
                yield chunk

    return StreamingResponse(
        iter_file(),
        media_type="application/octet-stream",
        headers={"Content-Disposition": f"attachment; filename={filename}"}
    )
```

## Upload to Cloud Storage (S3 Example)

```bash
pip install boto3
```

```python
import boto3
from fastapi import UploadFile

s3_client = boto3.client(
    "s3",
    aws_access_key_id="ACCESS_KEY",
    aws_secret_access_key="SECRET_KEY",
    region_name="us-east-1"
)

BUCKET_NAME = "my-bucket"

@app.post("/upload-s3")
async def upload_to_s3(file: UploadFile):
    key = f"uploads/{uuid.uuid4()}/{file.filename}"
    contents = await file.read()
    s3_client.put_object(
        Bucket=BUCKET_NAME,
        Key=key,
        Body=contents,
        ContentType=file.content_type
    )
    url = f"https://{BUCKET_NAME}.s3.amazonaws.com/{key}"
    return {"url": url}
```

## Summary

- Install `python-multipart` before using file uploads
- Use `UploadFile` and `File(...)` to receive uploaded files
- Use `await file.read()` or `shutil.copyfileobj(file.file, dst)` to read/save
- Generate unique filenames with `uuid.uuid4()` to prevent overwrites
- Validate `content_type` and file size before saving
- Mix file uploads with form data using `Form()` — cannot mix with JSON body Pydantic models
- Use `FileResponse` or `StreamingResponse` to serve files back to clients

---

[← Previous: WebSockets](13-websockets.md) | [Contents](README.md) | [Next: Error Handling →](15-error-handling.md)
