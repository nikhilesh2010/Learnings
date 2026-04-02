# Lambda - Serverless Computing

## What is Lambda?

**Lambda = Serverless Function-as-a-Service (FaaS)**

Upload code, run without managing servers:

```
Traditional Server Model       Lambda Model
├── Rent EC2 instance          ├── Write function
├── Install runtime/deps       ├── Upload to AWS
├── Deploy code                ├── Upload triggers
├── Configure auto-scaling     ├── Automatic scaling
├── Monitor & maintain         ├── AWS manages everything
└── Pay $$/hour                └── Pay per execution
```

## Key Benefits

```bash
✅ No server management
✅ Automatic scaling (0 to 1000s of concurrent)
✅ Pay only for execution time
✅ High availability built-in
✅ Easy integrations
✅ Fast deployment
```

## Supported Runtimes

```
Python:         3.8, 3.9, 3.10, 3.11, 3.12
Node.js:        16.x, 18.x, 20.x
Java:           8, 11, 17, 21
Go:             1.x, 1.20
C#/.NET:        7.0, 8.0
Ruby:           3.2, 3.3
Custom:         Bring your own runtime

Can also run containers (Docker images)
```

## Lambda Function Structure

### Python Example

```python
# handler.py
def lambda_handler(event, context):
    """
    event: Input data (JSON, S3 event, HTTP request, etc.)
    context: Execution context (request ID, memory, etc.)
    
    Returns: Response object
    """
    
    name = event.get('name', 'World')
    message = f"Hello, {name}!"
    
    return {
        'statusCode': 200,
        'body': message
    }
```

### Node.js Example

```javascript
exports.handler = async (event, context) => {
    // event: Input data
    // context: Execution metadata
    
    const name = event.name || 'World';
    
    return {
        statusCode: 200,
        body: `Hello, ${name}!`
    };
};
```

## Creating Your First Lambda

### Via Console

```bash
1. AWS Console → Lambda → Create Function
2. Basic information:
   Name: my-first-function
   Runtime: Python 3.11
   Architecture: x86_64 (or arm64)
3. Permissions:
   Execution role: Create new basic role
   (adds permissions to logs)
4. Code:
   # Default code shown, edit or paste yours
5. Deploy
```

### Via AWS CLI

```bash
# Create function
aws lambda create-function \
  --function-name my-first-function \
  --runtime python3.11 \
  --role arn:aws:iam::123456789:role/lambda-role \
  --handler index.handler \
  --zip-file fileb://function.zip

# Update function code
aws lambda update-function-code \
  --function-name my-first-function \
  --zip-file fileb://new-function.zip

# Invoke function
aws lambda invoke \
  --function-name my-first-function \
  --payload '{"name":"John"}' \
  response.json
```

## Invoking Lambda

### Method 1: Synchronous (Wait for response)

```
Client → Lambda → Execute → Return response
└── Waits for complete execution
```

**Use for:** APIs, real-time processing

### Method 2: Asynchronous (Fire and forget)

```
Client → Lambda [executed in background]
└── Returns immediate confirmation
└── Lambda processes separately
```

**Use for:** Batch processing, background jobs

### Event Sources (Triggers)

```bash
1. API Gateway
   └── HTTP request → Lambda

2. S3
   └── Upload file → Lambda processes

3. DynamoDB Streams
   └── Database change → Lambda reacts

4. SNS/SQS
   └── Message published → Lambda consumes

5. CloudWatch Events
   └── Scheduled (cron) → Lambda runs

6. Kinesis
   └── Stream data → Lambda processes

7. EventBridge
   └── Custom events → Lambda

8. Manual - AWS CLI
   └── aws lambda invoke --function-name ...

9. Load Balancer
   └── HTTP request → Lambda
```

## Lambda Pricing

### Pay Per ...

```bash
Requests:   $0.0000002 per request (1M = $0.20)
Duration:   $0.0000166667 per GB-second

Example: 1M requests, 1 second each, 256MB
Requests:           1M × $0.0000002 = $0.20
Duration:           1M × 1 sec × 0.25 GB × $0.0000166667 = $4.17
────────────────────────────────────────
Total: $4.37

# Monthly with 1M daily requests:
Daily:    $0.15
Monthly:  $4.50

Free tier (no end):
- 1M requests/month FREE
- 400K GB-seconds/month FREE
- Most small apps fit in free tier!
```

## Lambda Configuration

### Memory & CPU

```
Memory:        128 MB - 10_240 MB
CPU allocated: Correlates with memory
               128 MB = 0.09 CPU
               1 GB = 0.71 CPU
               10 GB = 6 CPU

Increase memory for CPU-intensive tasks!
```

### Timeout

```
Default:  3 seconds
Maximum:  15 minutes (900 seconds)

Use case:
- Quick API: 3 seconds (default)
- Batch processing: 5 minutes
- Long report generation: 15 minutes
```

### Environment Variables

```python
import os

def handler(event, context):
    db_host = os.environ.get('DB_HOST')
    api_key = os.environ.get('API_KEY')  # Use Secrets Manager in production!
    
    return {'message': 'Processing...'}
```

Set via console or CLI:
```bash
aws lambda update-function-configuration \
  --function-name my-function \
  --environment Variables={DB_HOST=localhost,REGION=us-east-1}
```

### Layers (Shared Code)

```bash
Create reusable code layer:
├── common-utils.zip (shared libraries)

Functions can reference layer:
├── Function 1 uses common-utils
├── Function 2 uses common-utils
└── Update layer once, all functions updated!
```

## Common Lambda Use Cases

### 1. REST API Backend

```
Client → API Gateway → Lambda
                       ├── Query database
                       ├── Process data
                       └── Return JSON
```

### 2. S3 Image Processing

```
User uploads image → S3 → Triggers Lambda
                          ├── Resize image
                          ├── Create thumbnail
                          ├── Save to S3
                          └── Update database
```

### 3. Scheduled Tasks (Cron Jobs)

```
CloudWatch Event:  Every day at 2 AM
                   ├── Triggers Lambda
                   └── Lambda runs backup script
```

### 4. Async Processing

```
User submits form → API Gateway → Lambda (quick response)
                                 ↓ (async)
                              Process in background
                              ├── Send email
                              ├── Update database
                              └── Generate report
```

### 5. Data Pipeline

```
S3 → Lambda processes data
└─→ Transforms to standardized format
└─→ Saves to data warehouse
```

## Lambda + API Gateway Example

### Create REST Endpoint

```bash
# Create Lambda function
aws lambda create-function \
  --function-name hello-api \
  --runtime python3.11 \
  --handler handler.lambda_handler \
  --role arn:aws:iam::123456789:role/lambda-role \
  --zip-file fileb://handler.zip

# Create API Gateway
aws apigateway create-rest-api \
  --name hello-api

# Add Lambda integration
# [Create resource, method, lambda integration in console]

# Invoke:
curl https://xxxxx.execute-api.us-east-1.amazonaws.com/hello
```

### Python Lambda Function

```python
import json

def lambda_handler(event, context):
    # Parse query parameters
    name = event.get('queryStringParameters', {}).get('name', 'World')
    
    response = {
        'statusCode': 200,
        'body': json.dumps({
            'message': f'Hello, {name}!',
            'region': event['requestContext']['accountId']
        })
    }
    
    return response
```

## Monitoring Lambda

### CloudWatch Logs

```bash
# Automatically sent
print("This goes to CloudWatch!")

# View via console or CLI
aws logs tail /aws/lambda/my-function --follow
```

### CloudWatch Metrics

```bash
Invocations:        # of times executed
Errors:             # of failures
Duration:           Execution time
Concurrent executions:  # running simultaneously
Throttles:          # rejected due to limits
```

### X-Ray Tracing

```
Enable X-Ray:
├── Lambda adds X-Ray write access to role
├── Lambda automatically samples requests
└── See detailed trace in X-Ray console

Shows:
└── Function execution time
└── Database query time
└── External API calls
└── Bottlenecks
```

## ⚠️ Lambda Limitations & Challenges

❌ **Cold starts** (first invocation slow)
→ Solution: Keep warm with scheduled ping, use Lambda@Edge

❌ **15-minute timeout limit**
→ Solution: Use Step Functions for longer tasks

❌ **500 concurrent limit** (default)
→ Solution: Request limit increase, use Async invocation

❌ **No local storage** (ephemeral /tmp only)
→ Solution: Use S3 for persistent storage

❌ **Hard to debug locally**
→ Solution: Use SAM CLI for local testing

## 🎯 Key Takeaways

✅ Lambda = serverless functions, pay-per-execution
✅ Free tier: 1M requests + 400K GB-seconds per month
✅ Fastest way to deploy APIs
✅ Integrates with 50+ AWS services
✅ Scales automatically from 0 to thousands
✅ Cold starts on first invocation
✅ Perfect for event-driven workloads

## 🚀 Hands-On Exercise

1. ☑️ Create Lambda function (Python)
2. ☑️ Test with simple JSON input
3. ☑️ Create API Gateway endpoint
4. ☑️ Test API via browser/curl
5. ☑️ Add environment variable
6. ☑️ Create S3 trigger (upload file → Lambda)
7. ☑️ Monitor in CloudWatch

---

**Lambda is the future of backend development. Master it!**

---

[← Previous: EC2 - Advanced Features](06-ec2-advanced.md) | [Contents](README.md) | [Next: Lambda - Advanced Patterns →](08-lambda-advanced.md)
