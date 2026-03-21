# 23: Web Frameworks

## 🌐 Python Web Framework Landscape

| Framework | Style | Use Case |
|-----------|-------|----------|
| **Flask** | Micro, sync | Simple APIs, learning, full control |
| **FastAPI** | Async, modern | High-performance APIs, auto-docs |
| **Django** | Batteries-included | Full web apps, CMS, admin panels |
| **Starlette** | ASGI, minimal | Base for FastAPI |

---

## ⚗️ Flask — Minimal Web Framework

```bash
pip install flask
```

### Basic App
```python
# app.py
from flask import Flask, request, jsonify, abort

app = Flask(__name__)

@app.route("/")
def index():
    return "Hello, World!"

@app.route("/users/<int:user_id>")
def get_user(user_id):
    user = find_user(user_id)
    if user is None:
        abort(404)
    return jsonify(user)

@app.route("/users", methods=["GET", "POST"])
def users():
    if request.method == "POST":
        data = request.get_json()
        user = create_user(data)
        return jsonify(user), 201
    return jsonify(get_all_users())

if __name__ == "__main__":
    app.run(debug=True, port=5000)
```

```bash
flask run           # uses FLASK_APP env var
flask run --debug   # with auto-reload
```

### Request & Response
```python
from flask import request, jsonify, make_response

# Request data
request.method          # GET, POST, etc.
request.args.get("q")   # query param ?q=value
request.form.get("name")  # form data
request.get_json()        # JSON body
request.headers.get("Authorization")
request.files["upload"]   # file upload

# Response
return jsonify({"key": "value"})    # JSON response
return jsonify(data), 201           # with status code
return "text", 404                  # text with status
```

### Blueprints (Routing Modules)
```python
# routes/users.py
from flask import Blueprint

users_bp = Blueprint("users", __name__, url_prefix="/users")

@users_bp.route("/")
def list_users(): ...

@users_bp.route("/<int:id>")
def get_user(id): ...

# app.py
from routes.users import users_bp
app.register_blueprint(users_bp)
```

### Error Handling
```python
@app.errorhandler(404)
def not_found(error):
    return jsonify({"error": "Not found"}), 404

@app.errorhandler(500)
def server_error(error):
    return jsonify({"error": "Internal server error"}), 500
```

---

## ⚡ FastAPI — Modern Async Framework

```bash
pip install fastapi uvicorn
```

### Basic App
```python
# main.py
from fastapi import FastAPI, HTTPException
from pydantic import BaseModel

app = FastAPI()

class User(BaseModel):
    name: str
    email: str
    age: int | None = None

@app.get("/")
def root():
    return {"message": "Hello World"}

@app.get("/users/{user_id}")
async def get_user(user_id: int):
    user = await find_user(user_id)
    if user is None:
        raise HTTPException(status_code=404, detail="User not found")
    return user

@app.post("/users", status_code=201)
async def create_user(user: User):
    new_user = await save_user(user)
    return new_user
```

```bash
uvicorn main:app --reload   # dev server with hot reload
uvicorn main:app --workers 4  # production
```

### Request Parameters
```python
from fastapi import FastAPI, Query, Path, Body

@app.get("/items/{item_id}")
async def get_item(
    item_id: int = Path(..., gt=0),                   # path param, must be > 0
    q: str | None = Query(None, max_length=50),       # optional query param
    skip: int = Query(0, ge=0),                       # with default
    limit: int = Query(10, ge=1, le=100),
):
    ...

@app.put("/items/{item_id}")
async def update_item(item_id: int, item: Item):
    # item is parsed from JSON body
    ...
```

### Automatic Validation with Pydantic
```python
from pydantic import BaseModel, EmailStr, validator, Field
from typing import Optional

class UserCreate(BaseModel):
    name: str = Field(..., min_length=1, max_length=100)
    email: EmailStr
    age: int = Field(..., ge=0, le=150)
    role: str = "user"

    @validator("name")
    def name_must_not_be_empty(cls, v):
        if not v.strip():
            raise ValueError("Name cannot be blank")
        return v.title()

# FastAPI auto-validates + returns 422 on invalid input
@app.post("/users")
async def create(user: UserCreate):
    return user.dict()
```

### Dependency Injection
```python
from fastapi import Depends

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

def get_current_user(token: str = Header(...)):
    user = verify_token(token)
    if not user:
        raise HTTPException(401, "Invalid token")
    return user

@app.get("/profile")
async def profile(
    db: Session = Depends(get_db),
    user = Depends(get_current_user),
):
    return db.query(User).filter(User.id == user.id).first()
```

### Auto-generated Docs
```
http://localhost:8000/docs      → Swagger UI (interactive)
http://localhost:8000/redoc     → ReDoc (readable)
http://localhost:8000/openapi.json → OpenAPI schema
```

---

## 🏰 Django — Batteries Included

```bash
pip install django
django-admin startproject mysite
cd mysite
python manage.py startapp myapp
python manage.py runserver
```

### URL Routing
```python
# mysite/urls.py
from django.urls import path, include

urlpatterns = [
    path("admin/", admin.site.urls),
    path("api/users/", include("users.urls")),
]
```

### View
```python
# users/views.py
from django.http import JsonResponse
from django.views import View
import json

class UserView(View):
    def get(self, request, user_id):
        user = User.objects.get(pk=user_id)
        return JsonResponse({"name": user.name})

    def post(self, request):
        data = json.loads(request.body)
        user = User.objects.create(**data)
        return JsonResponse({"id": user.id}, status=201)
```

### Model
```python
# users/models.py
from django.db import models

class User(models.Model):
    name  = models.CharField(max_length=100)
    email = models.EmailField(unique=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["-created_at"]
```

```bash
python manage.py makemigrations
python manage.py migrate
python manage.py createsuperuser
```

---

## 📌 Choose Your Framework

```
Small/simple API     → Flask
High-performance API → FastAPI
Full web app + admin → Django
Learning / prototyping → Flask or FastAPI
Async required       → FastAPI
Auto validation/docs → FastAPI
```

---

## 📌 Quick Reference

```python
# Flask
from flask import Flask, request, jsonify
app = Flask(__name__)
@app.route("/path", methods=["GET", "POST"])
def view():
    return jsonify(data)

# FastAPI
from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
app = FastAPI()
@app.get("/path/{id}")
async def view(id: int):
    return {"id": id}

class Schema(BaseModel):
    field: str

@app.post("/path")
async def create(body: Schema):
    return body
```


---

[← Previous: Database](22-database.md) | [Contents](README.md) | [Next: Best Practices & Patterns →](24-best-practices.md)
