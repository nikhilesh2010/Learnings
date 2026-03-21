# FastAPI Backend Guide

Build high-performance Python APIs with validation, async patterns, and production-ready practices.

## 📚 Table of Contents

### **Fundamentals**
1. [What is FastAPI?](01-introduction.md)
2. [Setup & Project Structure](02-setup.md)
3. [Path Operations](03-path-operations.md)
4. [Path & Query Parameters](04-path-and-query-params.md)
5. [Request Body](05-request-body.md)

### **Data Validation**
6. [Pydantic Models](06-pydantic-models.md)
7. [Response Models](07-response-models.md)

### **Core Features**
8. [Dependency Injection](08-dependency-injection.md)
9. [Authentication](09-authentication.md)
10. [Database](10-database.md)

### **Advanced Features**
11. [Middleware](11-middleware.md)
12. [Background Tasks](12-background-tasks.md)
13. [WebSockets](13-websockets.md)
14. [File Uploads](14-file-uploads.md)

### **Production Topics**
15. [Error Handling](15-error-handling.md)
16. [Testing](16-testing.md)
17. [Deployment](17-deployment.md)

### **Best Practices**
18. [Best Practices & Patterns](18-best-practices.md)
19. [Debugging & Profiling](19-debugging.md)

---

## Prerequisites

- Python 3.8+
- Basic understanding of Python
- Familiarity with HTTP and REST concepts

---

## 🚀 Quick Start

```bash
pip install fastapi uvicorn
```

```python
from fastapi import FastAPI

app = FastAPI()

@app.get("/")
def root():
    return {"message": "Hello, FastAPI!"}
```

```bash
uvicorn main:app --reload
```

Visit `http://127.0.0.1:8000/docs` for the interactive Swagger UI.

---

## 🔑 Key Features

| Feature | Description |
|---------|-------------|
| **Fast** | One of the fastest Python frameworks, on par with Node.js and Go |
| **Automatic Docs** | Swagger UI and ReDoc generated automatically |
| **Type Safety** | Full Python type hints support via Pydantic |
| **Standards-Based** | OpenAPI and JSON Schema compliant |
| **Async Support** | Built on Starlette with native async/await |

---

*Happy building with FastAPI! ⚡*
