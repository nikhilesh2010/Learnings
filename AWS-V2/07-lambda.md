# Lambda - Serverless Compute

## 1. What is Lambda?

AWS Lambda is a **serverless compute service** — run code without provisioning or managing servers.

- **Serverless**: AWS manages infrastructure, scaling, patching
- **Event-driven**: Execute code in response to events (HTTP, S3, DynamoDB, SNS, etc.)
- **Pay-per-execution**: Billed for compute duration (100ms granularity) + requests
- **Auto-scaling**: Automatically scales to handle 1 request or 1M concurrent requests
- **Supported languages**: Python, Node.js, Java, C#, Go, Ruby, custom runtimes

### Why Lambda?

- **No ops overhead**: No servers to manage
- **Cost-efficient**: Pay only for execution time (+ memory used)
- **Instant scaling**: Handle traffic spikes without pre-warming
- **Integrates with AWS**: Direct integration with S3, API Gateway, DynamoDB, etc.

### When NOT to Use Lambda

- Long-running jobs (> 15 min timeout)
- Complex stateful workflows (use Step Functions)
- High-disk I/O requirements (use EC2)
- Need for persistent connections (WebSocket → API Gateway + Lambda works, but ALB/EC2 better)

---

## 2. Function Basics

### 2.1 Trigger

**What invokes the Lambda function?**

| Trigger | Example | Timing |
|---------|---------|--------|
| **API Gateway** | HTTP POST to `/user` | Synchronous |
| **S3** | Object uploaded | Asynchronous (async invoker) |
| **DynamoDB Streams** | Item created/updated | Asynchronous |
| **SNS** | Message published to topic | Asynchronous |
| **SQS** | Message added to queue | Asynchronous (Lambda polls) |
| **CloudWatch Events** | Time-based schedule (cron) | Asynchronous |
| **ALB** | HTTP request | Synchronous |
| **Direct invocation** | `aws lambda invoke` command | Sync or async |

### 2.2 Runtime

**Language + version used to execute your code.**

| Runtime | Version | Notes |
|---------|---------|-------|
| **python3.12** | Python 3.12 | Current, recommended |
| **python3.11** | Python 3.11 | Stable |
| **nodejs20.x** | Node.js 20 | Current |
| **nodejs18.x** | Node.js 18 | Stable |
| **java17** | Java 17 | Enterprise |
| **go1.x** | Go | Fast, low memory |

### 2.3 Handler

**Entry point of your code.**

| Runtime | Handler Format | Example |
|---------|---|---|
| **Python** | `filename.function_name` | `index.handler` → `def handler(event, context):` in `index.py` |
| **Node.js** | `filename.function_name` | `index.handler` → `exports.handler = async (event, context)` in `index.js` |
| **Java** | `class.package.methodname` | `com.example.App::handleRequest` |
| **Go** | `binary_name` | `main` (compiled to binary) |

### 2.4 Memory & CPU

- **Memory**: 128 MB to 10,240 MB (10 GB)
- **CPU**: Allocated proportionally to memory (more memory = more CPU)
- Default: 128 MB (cheapest, slowest)
- Recommended: 512 MB to 1,024 MB for most apps

### 2.5 Timeout

- **Default**: 3 seconds
- **Max**: 15 minutes (900 seconds)
- **If exceeded**: Lambda terminates the function, returns error 504

---

## 3. Creating a Lambda Function

### 📟 Console — Create Python Lambda Function

```
1. Lambda → Functions → Create function
2. Function name: my-hello-world
3. Runtime: Python 3.12
4. Role: Create new role with basic Lambda permissions
   OR use existing role (must have trust policy for lambda.amazonaws.com)
5. Advanced settings:
   - Timeout: 30 seconds
   - Memory: 512 MB
   - Ephemeral storage: 512 MB
6. → Create function
7. Code editor:
   - index.py:
     def handler(event, context):
         return {
             'statusCode': 200,
             'body': 'Hello from Lambda!'
         }
8. → Deploy
```

### 💻 CLI — Deploy Lambda Function

```bash
# Create IAM role for Lambda
aws iam create-role \
  --role-name lambda-execution-role \
  --assume-role-policy-document '{
    "Version": "2012-10-17",
    "Statement": [{
      "Effect": "Allow",
      "Principal": {"Service": "lambda.amazonaws.com"},
      "Action": "sts:AssumeRole"
    }]
  }'

# Attach basic execution policy
aws iam attach-role-policy \
  --role-name lambda-execution-role \
  --policy-arn arn:aws:iam::aws:policy/service-role/AWSLambdaBasicExecutionRole

# Create function (Python)
zip function.zip index.py
aws lambda create-function \
  --function-name my-hello-world \
  --runtime python3.12 \
  --role arn:aws:iam::123456789012:role/lambda-execution-role \
  --handler index.handler \
  --zip-file fileb://function.zip

# Update code
zip function.zip index.py
aws lambda update-function-code \
  --function-name my-hello-world \
  --zip-file fileb://function.zip

# Invoke function
aws lambda invoke \
  --function-name my-hello-world \
  --payload '{"key": "value"}' \
  response.json
cat response.json
```

---

## 4. Event Structure

Every Lambda receives an **event** and **context**.

### 4.1 Event Object

Event data from the trigger (format varies by trigger).

```python
# Lambda from API Gateway
{
  "resource": "/my-path",
  "httpMethod": "POST",
  "headers": {"Content-Type": "application/json"},
  "body": "{\"message\":\"hello\"}"
}

# Lambda from S3
{
  "Records": [{
    "s3": {
      "bucket": {"name": "my-bucket"},
      "object": {"key": "uploaded-file.txt"}
    }
  }]
}

# Lambda from API Gateway HTTP (v2)
{
  "requestContext": {"http": {"method": "GET", "path": "/"}},
  "headers": {},
  "body": null,
  "isBase64Encoded": false
}
```

### 4.2 Context Object

Metadata about the invocation.

```python
def handler(event, context):
    print(f"Request ID: {context.request_id}")
    print(f"Function name: {context.function_name}")
    print(f"Remaining time: {context.get_remaining_time_in_millis()} ms")
    print(f"Memory limit: {context.memory_limit_in_mb} MB")
    print(f"Invoked ARN: {context.invoked_function_arn}")
    
    # Use remaining time to decide: continue or save state
    if context.get_remaining_time_in_millis() < 5000:
        # Less than 5 seconds left, gracefully exit
        return {"statusCode": 200, "body": "Timeout soon, saving state"}
```

---

## 5. Logging & Monitoring

### CloudWatch Logs

Lambda auto-sends stdout/stderr to CloudWatch Logs.

```python
import json

def handler(event, context):
    print(f"Received event: {json.dumps(event)}")  # Goes to CloudWatch
    return {
        'statusCode': 200,
        'body': 'OK'
    }
```

### 📟 Console — View Logs

```
1. Lambda → Functions → select function
2. Monitor tab → View CloudWatch Logs
3. Log groups: /aws/lambda/my-hello-world
4. Latest log stream shows execution logs (stdout/print statements)
```

### Structured Logging (Best Practice)

```python
import json
import logging

logger = logging.getLogger()
logger.setLevel(logging.INFO)

def handler(event, context):
    logger.info(json.dumps({
        "event": event,
        "requestId": context.request_id
    }))
    return {"statusCode": 200}
```

### CloudWatch Metrics

Lambda auto-publishes metrics:
- **Invocations**: Total calls
- **Errors**: Failures
- **Duration**: Execution time (ms)
- **Throttles**: Concurrent limit exceeded

### 📟 Console — Create CloudWatch Alarm

```
1. CloudWatch → Alarms → Create alarm
2. Metric: Lambda > Errors > select function
3. Condition: Errors >= 1
4. Period: 1 minute
5. Action: SNS notification → select topic
6. → Create alarm
```

---

## 6. Environment Variables & Secrets

### Environment Variables

Simple key-value config, visible in console (not for secrets).

### 📟 Console — Set Environment Variables

```
1. Lambda → select function → Configuration tab
2. Environment variables → Edit
3. Key: DB_HOST, Value: prod-db.example.com
4. Key: DB_PORT, Value: 5432
5. → Save
```

### 💻 CLI

```python
# Python: read from os
import os

db_host = os.environ['DB_HOST']
db_port = os.environ['DB_PORT']
```

### Secrets Manager (For Sensitive Data)

Never put passwords/API keys in environment variables.

```python
import boto3
import json

secrets_client = boto3.client('secretsmanager')

def handler(event, context):
    response = secrets_client.get_secret_value(
        SecretId='prod/db-password'
    )
    secret = json.loads(response['SecretString'])
    db_password = secret['password']
    
    return {'statusCode': 200}
```

---

## 7. Concurrency

Lambda **concurrency** = number of instances running simultaneously.

### 7.1 Concurrency Limits

- **Account-level**: 1,000 concurrent executions (default, can request increase)
- **Function-level**: Reserved concurrency (guarantees execution), provisioned concurrency (pre-warmed)

### 7.2 Throttling

If concurrency limit exceeded → Lambda throttles (queues or rejects requests).

### 7.3 Provisioned Concurrency

Pre-initialize function instances (reduce cold starts). Charged per hour.

### 📟 Console — Set Reserved Concurrency

```
1. Lambda → Functions → select function
2. Configuration → Concurrency → Edit
3. Reserved concurrency: e.g., 100 (guarantees 100 parallel executions)
4. → Save
```

### 📟 Console — Set Provisioned Concurrency

```
1. Lambda → Functions → select function → Aliases or Versions
2. Create version/alias
3. Provisioned concurrency: Yes
4. Provisioned concurrent executions: 10
5. → Deploy
6. Charged hourly for 10 pre-warmed instances
```

---

## 8. Layers

A **layer** is reusable code (libraries, custom runtimes) bundled separately.

### Use Cases

- Shared libraries (requests, numpy, pandas)
- Custom runtime (if using unsupported language)
- Reduce function package size

### 📟 Console — Create Layer

```
1. Lambda → Layers → Create layer
2. Name: common-dependencies
3. Upload ZIP containing Python packages:
   python/
   ├── requests/
   ├── numpy/
   └── ... (pip install -t python/ -r requirements.txt)
4. Runtime: Python 3.12
5. → Create
```

### Attach Layer to Function

```
1. Lambda → select function → Code tab
2. Layers (bottom) → Add layer
3. Select layer: common-dependencies
4. → Add
5. Your code can now: import requests, import numpy
```

### 💻 CLI

```bash
# Create layer
mkdir python
pip install -t python/ requests numpy
zip -r layer.zip python/
aws lambda publish-layer-version \
  --layer-name common-dependencies \
  --zip-file fileb://layer.zip \
  --compatible-runtimes python3.12

# Attach to function
aws lambda update-function-configuration \
  --function-name my-function \
  --layers arn:aws:lambda:region:account:layer:common-dependencies:1
```

---

## 9. Pricing

### Execution Costs

- **Requests**: $0.0000002 per request ($0.2 per million requests)
- **Duration**: $0.0000166667 per GB-second
  - 512 MB × 100 ms = 0.05 GB-seconds → $0.00000083
- **Free tier**: 1M requests + 400,000 GB-seconds/month

### Provisioned Concurrency

- **Hourly charge**: ~$0.05 per hour per instance (varies by region)
- Example: 100 provisioned concurrency × $0.05 × 730 hours = $3,650/month

### Cost Optimization

```
☑ Right-size memory (don't overprovision)
☑ Optimize code (reduce duration)
☑ Use provisioned concurrency only if cold starts are critical
☑ Use Lambda for event-driven (not real-time streaming)
☑ Batch invocations before SQS triggers
```

---

## 10. Cold Starts & Optimization

### Cold Start

Time taken to initialize Lambda environment (download code, start runtime) before first execution.

- **Typical**: 100–500 ms
- **Minimized by**: Smaller packages, faster runtimes (Go, Node.js vs Python)
- **Eliminated by**: Provisioned Concurrency

### Optimization Tips

1. **Keep deployment package small**: Don't bundle unnecessary files
2. **Lazy-load libraries**: Import inside handler only if needed
3. **Reuse connections**: Initialize DB connections outside handler
4. **Use provisioned concurrency**: For time-sensitive operations

```python
# BAD: Connection created every invocation
def handler(event, context):
    conn = connect_to_db()
    result = query(conn)
    conn.close()
    return result

# GOOD: Connection reused across invocations
db_conn = None

def get_connection():
    global db_conn
    if db_conn is None:
        db_conn = connect_to_db()
    return db_conn

def handler(event, context):
    conn = get_connection()
    result = query(conn)
    return result
```

---

## 11. Common Patterns

### 11.1 Lambda + API Gateway

Serve HTTP API without managing servers.

```python
def handler(event, context):
    body = json.loads(event.get('body', '{}'))
    
    if body.get('name'):
        return {
            'statusCode': 200,
            'body': json.dumps({'message': f"Hello, {body['name']}!"})
        }
    else:
        return {
            'statusCode': 400,
            'body': json.dumps({'error': 'Name required'})
        }
```

### 11.2 Lambda + S3

Triggered when files uploaded → transform and store results.

```python
def handler(event, context):
    s3 = boto3.client('s3')
    
    for record in event['Records']:
        bucket = record['s3']['bucket']['name']
        key = record['s3']['object']['key']
        
        # Download object
        response = s3.get_object(Bucket=bucket, Key=key)
        file_content = response['Body'].read()
        
        # Transform
        transformed = file_content.upper()
        
        # Upload
        s3.put_object(Bucket=bucket, Key=f'transformed/{key}', Body=transformed)
```

### 11.3 Lambda + DynamoDB

Process stream of database changes.

```python
def handler(event, context):
    for record in event['Records']:
        if record['eventName'] == 'INSERT':
            new_item = record['dynamodb']['NewImage']
            # Send email, update cache, etc.
            print(f"New item: {new_item}")
        elif record['eventName'] == 'REMOVE':
            old_item = record['dynamodb']['OldImage']
            print(f"Deleted: {old_item}")
```

### 11.4 Lambda + SQS

Process messages from queue asynchronously.

```python
def handler(event, context):
    for record in event['Records']:
        body = json.loads(record['body'])
        # Process message
        print(f"Processing: {body}")
        
        # If processing fails, don't delete from queue
        # Lambda will retry (up to maxReceiveCount)
    
    return {'statusCode': 200}
```

---

## 12. Interview Q&A

**Q: What is serverless and how is Lambda different from EC2?**
Serverless = no server management. Lambda auto-scales, charges per invocation. EC2 = you manage instances, always charged. Lambda for event-driven; EC2 for long-running.

**Q: What is a cold start and how do you minimize it?**
Cold start = initialization time for Lambda environment (100–500ms). Minimize by: smaller package size, faster runtime (Go), lazy-loading libraries, provisioned concurrency.

**Q: What is the max timeout for Lambda?**
15 minutes (900 seconds). If you need longer, use Step Functions or ECS.

**Q: Can Lambda write to a database?**
Yes, use boto3 to connect to RDS, DynamoDB, or any database. But use connection pooling/reuse to avoid exhausting database connections.

**Q: How do you pass sensitive data to Lambda (passwords, API keys)?**
Use AWS Secrets Manager or Systems Manager Parameter Store. Read at runtime. Never hardcode in code or environment variables.

**Q: What is the difference between synchronous and asynchronous invocation?**
Synchronous: caller waits for response (API Gateway, ALB). Asynchronous: caller doesn't wait (S3, SNS, EventBridge). Async has built-in retry (2x by default).

**Q: How do you handle errors in Lambda?**
Throw exception (asynchronous invocations retry). For sync, return error response. Logs go to CloudWatch. Use X-Ray for tracing.

**Q: Can Lambda call another Lambda?**
Yes, use boto3 `lambda.invoke()`. Useful for microservices architecture.

**Q: What is Lambda concurrency and how do you control it?**
Concurrency = parallel executions. Limit = 1,000 per account (default). Set reserved concurrency per function to guarantee or provision for warm starts.

**Q: Should I use Lambda or EC2 for a long-running job?**
Neither — use Step Functions, Glue, ECS, or Batch. Lambda max 15 min. Long jobs = EC2 or Batch.

---

## 13. Quick Reference Cheat Sheet

| Feature | Detail |
|---------|--------|
| Memory | 128 MB to 10,240 MB (10 GB) |
| Timeout | Default 3 sec, max 15 min |
| Concurrent executions | 1,000 per account (default) |
| Cold start | 100–500 ms (depends on runtime + size) |
| Supported runtimes | Python, Node.js, Java, Go, C#, Ruby |
| Handler format (Python) | `filename.function_name` |
| Handler format (Node.js) | `filename.function_name` |
| Pricing (requests) | $0.2 per million requests |
| Pricing (duration) | $0.0000166667 per GB-second |
| Free tier | 1M requests + 400k GB-seconds/month |
| Event sources | 20+ (API Gateway, S3, DynamoDB, SNS, SQS, Kinesis, etc.) |
| Trigger | What invokes the function (S3 upload, HTTP, schedule, etc.) |
| Layer | Reusable code/libraries (dependencies, custom runtime) |
| Provisioned concurrency | Pre-warmed instances, billed hourly |
| Reserved concurrency | Guarantees capacity, prevents throttling |
| Environment variables | Key-value config (not for secrets) |
| Secrets Manager | Store passwords, API keys securely |
| CloudWatch | Auto-logs stdout/stderr + metrics |
| X-Ray | Distributed tracing, performance insights |
| VPC | Lambda can run inside VPC (SlowDown: less concurrency) |
| EFS | Persistent storage via EFS (shared across invocations) |
| Async retry | 2 retries default (exponential backoff) |
| Async Dead Letter Queue (DLQ) | Process failures sent to SQS/SNS |

---

*Write once. Scale infinitely. Pay only for what runs.* ⚡
