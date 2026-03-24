# 12 – Background Tasks

## What are Background Tasks?

Background tasks run **after the response is sent** to the client. They are useful for work that the client doesn't need to wait for, like:

- Sending emails
- Logging or auditing
- Sending notifications
- Processing uploaded files
- Invalidating cache entries

## FastAPI's Built-in `BackgroundTasks`

FastAPI's `BackgroundTasks` runs lightweight tasks in the same process after the HTTP response has already been sent. Inject it directly into a route function parameter and call `add_task()` with the function and its arguments.

```python
from fastapi import FastAPI, BackgroundTasks

app = FastAPI()

def send_welcome_email(email: str):
    # Simulates a slow operation
    print(f"Sending welcome email to {email}...")

@app.post("/register")
def register_user(email: str, background_tasks: BackgroundTasks):
    # ... create user in DB ...
    background_tasks.add_task(send_welcome_email, email)
    return {"message": "Registration successful, email will arrive shortly"}
```

The response is sent immediately. `send_welcome_email` runs in the background.

## Multiple Background Tasks

You can queue as many background tasks as you like before returning the response. Each call to `add_task()` appends a new task to the queue; they execute sequentially in the order they were added.

```python
@app.post("/users/{user_id}/actions")
def perform_action(
    user_id: int,
    background_tasks: BackgroundTasks
):
    background_tasks.add_task(log_action, user_id, "action_performed")
    background_tasks.add_task(send_notification, user_id)
    background_tasks.add_task(update_stats, user_id)
    return {"status": "ok"}
```

## Background Tasks with Dependencies

You can pass `BackgroundTasks` through `Depends`:

```python
from fastapi import Depends, BackgroundTasks

def send_email_dependency(background_tasks: BackgroundTasks, email: str):
    background_tasks.add_task(send_email, email)

@app.post("/users")
def create_user(
    email: str,
    background_tasks: BackgroundTasks,
    _=Depends(lambda bt=Depends(lambda: background_tasks): None)
):
    ...
```

More practically — pass `BackgroundTasks` directly into route functions and shared functions:

```python
def notify_user(background_tasks: BackgroundTasks, user_id: int):
    background_tasks.add_task(push_notification, user_id)

@app.post("/items")
def create_item(item: Item, background_tasks: BackgroundTasks):
    # ... save item
    notify_user(background_tasks, item.owner_id)
    return item
```

## Async Background Tasks

Background task functions can be `async def` as well as plain `def`. FastAPI handles both automatically — async tasks are awaited on the event loop, while sync tasks run in a thread pool.

```python
import asyncio

async def async_send_email(email: str):
    await asyncio.sleep(2)  # simulate async I/O
    print(f"Email sent to {email}")

@app.post("/register")
def register(email: str, background_tasks: BackgroundTasks):
    background_tasks.add_task(async_send_email, email)
    return {"message": "Registered"}
```

FastAPI handles both sync and async background task functions.

## Limitations of `BackgroundTasks`

| Limitation | Details |
|-----------|---------|
| In-process | Runs in the same process — if the process restarts, tasks are lost |
| No persistence | Tasks are not stored anywhere |
| No retry | Failed tasks are not retried automatically |
| No scheduling | Cannot schedule tasks for a future time |

For production-grade task processing, use a proper task queue.

## Celery (Production Task Queue)

Celery runs tasks in separate worker processes, with persistence and retries.

### Install

```bash
pip install celery redis
```

### Setup

```python
# app/celery_app.py
from celery import Celery

celery_app = Celery(
    "worker",
    broker="redis://localhost:6379/0",
    backend="redis://localhost:6379/0"
)

celery_app.conf.task_routes = {
    "app.tasks.*": {"queue": "main-queue"}
}
```

### Define Tasks

```python
# app/tasks.py
from app.celery_app import celery_app
import time

@celery_app.task
def send_email_task(email: str):
    time.sleep(3)
    print(f"Email sent to {email}")
    return f"done: {email}"

@celery_app.task(bind=True, max_retries=3)
def process_payment(self, payment_id: int):
    try:
        # process payment logic
        pass
    except Exception as exc:
        raise self.retry(exc=exc, countdown=60)
```

### Trigger from FastAPI

```python
from fastapi import FastAPI
from app.tasks import send_email_task

app = FastAPI()

@app.post("/register")
def register(email: str):
    send_email_task.delay(email)          # fire and forget
    return {"message": "Processing..."}

@app.post("/register-sync")
def register_sync(email: str):
    result = send_email_task.delay(email)
    return {"task_id": result.id}         # return task ID for status polling
```

### Start Celery Worker

```bash
celery -A app.celery_app worker --loglevel=info
```

### Check Task Status

```python
from celery.result import AsyncResult
from app.celery_app import celery_app

@app.get("/tasks/{task_id}")
def get_task_status(task_id: str):
    result = AsyncResult(task_id, app=celery_app)
    return {
        "task_id": task_id,
        "status": result.status,
        "result": result.result if result.ready() else None
    }
```

## Celery Beat (Scheduled Tasks)

Celery Beat is a scheduler that triggers Celery tasks on a fixed timetable. Define the schedule in `celery_app.conf.beat_schedule` using crontab expressions, then run a separate `celery beat` process alongside your workers.

```bash
pip install celery[redis] django-celery-beat
```

```python
from celery.schedules import crontab

celery_app.conf.beat_schedule = {
    "cleanup-every-hour": {
        "task": "app.tasks.cleanup_old_sessions",
        "schedule": crontab(minute=0),     # every hour
    },
    "daily-report": {
        "task": "app.tasks.send_daily_report",
        "schedule": crontab(hour=8, minute=0),  # 8 AM daily
    }
}
```

```bash
celery -A app.celery_app beat --loglevel=info
```

## Choosing the Right Approach

| Scenario | Tool |
|----------|------|
| Quick post-response work, low stakes | `BackgroundTasks` |
| Send email after signup | `BackgroundTasks` or Celery |
| Payment processing with retries | Celery |
| Long-running jobs | Celery |
| Scheduled/periodic tasks | Celery Beat |
| High volume async I/O tasks | Celery with asyncio pool |

## Summary

- Use `BackgroundTasks` for simple fire-and-forget tasks that run in-process
- Add tasks with `background_tasks.add_task(func, *args)` in route handlers
- Both sync and async task functions are supported
- Use Celery + Redis/RabbitMQ for persistent, retryable, distributed task queues
- Use Celery Beat for cron-like scheduled tasks
- Return a `task_id` to clients so they can poll for task status

---

[← Previous: Middleware](11-middleware.md) | [Contents](README.md) | [Next: WebSockets →](13-websockets.md)
