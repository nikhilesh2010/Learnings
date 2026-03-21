# 17 – Deployment

## Production Checklist

Before deploying:

- [ ] Set `DEBUG=False` / disable docs (`docs_url=None`, `redoc_url=None`)
- [ ] Use environment variables for all secrets
- [ ] Configure CORS properly (no `allow_origins=["*"]`)
- [ ] Use HTTPS (TLS certificate)
- [ ] Run with multiple workers
- [ ] Set up logging
- [ ] Add health check endpoint
- [ ] Configure database connection pooling

## Health Check Endpoint

```python
@app.get("/health", tags=["health"])
def health_check():
    return {"status": "ok"}
```

## Running with Uvicorn (Single Process)

```bash
uvicorn app.main:app --host 0.0.0.0 --port 8000
```

## Running with Gunicorn + Uvicorn Workers

For production: Gunicorn manages workers, each is a Uvicorn ASGI process.

```bash
pip install gunicorn
gunicorn app.main:app \
    --workers 4 \
    --worker-class uvicorn.workers.UvicornWorker \
    --bind 0.0.0.0:8000 \
    --timeout 120 \
    --access-logfile - \
    --error-logfile -
```

Workers formula: `(2 × CPU cores) + 1`

## Dockerfile

```dockerfile
FROM python:3.12-slim

WORKDIR /app

# Install dependencies first (layer caching)
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy application code
COPY . .

EXPOSE 8000

CMD ["gunicorn", "app.main:app", \
     "--workers", "4", \
     "--worker-class", "uvicorn.workers.UvicornWorker", \
     "--bind", "0.0.0.0:8000"]
```

```bash
# Build
docker build -t my-api .

# Run
docker run -p 8000:8000 --env-file .env my-api
```

## Docker Compose (App + PostgreSQL + Redis)

```yaml
# docker-compose.yml
version: "3.9"

services:
  api:
    build: .
    ports:
      - "8000:8000"
    env_file:
      - .env
    depends_on:
      - db
      - redis
    restart: unless-stopped

  db:
    image: postgres:16
    environment:
      POSTGRES_USER: user
      POSTGRES_PASSWORD: password
      POSTGRES_DB: mydb
    volumes:
      - postgres_data:/var/lib/postgresql/data
    restart: unless-stopped

  redis:
    image: redis:7
    restart: unless-stopped

volumes:
  postgres_data:
```

```bash
docker compose up -d          # start all services
docker compose logs -f api    # follow API logs
docker compose down           # stop all services
```

## Nginx as Reverse Proxy

```nginx
# /etc/nginx/sites-available/myapi
server {
    listen 80;
    server_name api.example.com;
    return 301 https://$host$request_uri;  # redirect HTTP → HTTPS
}

server {
    listen 443 ssl;
    server_name api.example.com;

    ssl_certificate     /etc/letsencrypt/live/api.example.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/api.example.com/privkey.pem;

    location / {
        proxy_pass http://127.0.0.1:8000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    # WebSocket support
    location /ws {
        proxy_pass http://127.0.0.1:8000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
    }
}
```

## Environment Config for Production

```python
# app/config.py
from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    env: str = "development"
    database_url: str
    secret_key: str
    allowed_origins: list[str] = []
    debug: bool = False

    class Config:
        env_file = ".env"

settings = Settings()
```

```python
# app/main.py
from app.config import settings

app = FastAPI(
    title="My API",
    docs_url="/docs" if not settings.env == "production" else None,
    redoc_url="/redoc" if not settings.env == "production" else None,
)
```

## Cloud Deployment Options

### Railway / Render / Fly.io (Easiest)

1. Push code to GitHub
2. Connect repo to the platform
3. Set environment variables
4. Deploy (auto-detected Dockerfile or Procfile)

**Procfile** (for Render/Heroku-style):

```
web: gunicorn app.main:app --workers 4 --worker-class uvicorn.workers.UvicornWorker --bind 0.0.0.0:$PORT
```

### AWS ECS / Google Cloud Run / Azure Container Apps

1. Build and push Docker image to container registry
2. Create a container service pointing to the image
3. Configure environment variables and secrets
4. Set up load balancer / auto scaling

### Kubernetes (Large Scale)

```yaml
# k8s/deployment.yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: fastapi-app
spec:
  replicas: 3
  selector:
    matchLabels:
      app: fastapi
  template:
    metadata:
      labels:
        app: fastapi
    spec:
      containers:
        - name: fastapi
          image: myregistry/my-api:latest
          ports:
            - containerPort: 8000
          envFrom:
            - secretRef:
                name: api-secrets
---
apiVersion: v1
kind: Service
metadata:
  name: fastapi-service
spec:
  selector:
    app: fastapi
  ports:
    - port: 80
      targetPort: 8000
  type: LoadBalancer
```

## Database Migrations on Deploy

Run Alembic migrations before starting the app:

```dockerfile
CMD alembic upgrade head && gunicorn app.main:app \
    --workers 4 \
    --worker-class uvicorn.workers.UvicornWorker \
    --bind 0.0.0.0:8000
```

Or as a separate step in CI/CD.

## CI/CD with GitHub Actions

```yaml
# .github/workflows/deploy.yml
name: Deploy

on:
  push:
    branches: [main]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-python@v5
        with:
          python-version: "3.12"
      - run: pip install -r requirements.txt
      - run: pytest --cov=app

  deploy:
    needs: test
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - name: Build and push Docker image
        run: |
          docker build -t ${{ secrets.REGISTRY }}/my-api:${{ github.sha }} .
          docker push ${{ secrets.REGISTRY }}/my-api:${{ github.sha }}
```

## Summary

- Use Gunicorn + UvicornWorker for multi-process production deployment
- Containerize with Docker; orchestrate with Docker Compose or Kubernetes
- Place Nginx in front of FastAPI for SSL termination and reverse proxying
- Disable docs endpoints in production
- Run database migrations (`alembic upgrade head`) before starting the server
- Use CI/CD pipelines to automate test → build → deploy

---

[← Previous: Testing](16-testing.md) | [Contents](README.md) | [Next: Best Practices →](18-best-practices.md)
