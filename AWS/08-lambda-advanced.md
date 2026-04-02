# Lambda - Advanced Patterns

## Lambda Concurrency & Performance

### Provisioned Concurrency

Reserve concurrent execution capacity:

```
Default: Shared pool across all functions
Problem: Cold starts on first request

Provisioned Concurrency:
├── Pre-warm function
├── Always ready for requests
├── No cold start delay
└── Cost: $0.015 per provisioned concurrency per hour

Use for:
├── APIs requiring <100ms latency
├── Real-time applications
├── Customer-facing endpoints
```

### Ephemeral Storage

Temporary disk space (`/tmp`):

```
Default: 512 MB
Max: 10,240 MB (10 GB)

Use for:
├── Cache data during execution
├── Temporary files
├── Download + process (e.g., images)

Example:
def handler(event, context):
    # Download file to /tmp
    urllib.request.urlretrieve(url, '/tmp/file.zip')
    # Process
    # Auto-deleted after execution
```

### Lambda Layers

Share code across functions:

```
Layer structure:
python/lib/python3.11/site-packages/requests/
nodejs/node_modules/express/

Benefits:
├── DRY (don't repeat yourself)
├── Version dependencies separately
├── Update without redeploying function
└── Can be 5 layers per function

Create layer:
aws lambda publish-layer-version \
  --layer-name my-dependencies \
  --zip-file fileb://layer.zip \
  --compatible-runtimes python3.11
```

## Lambda Integrations

### Event Sources

```
S3 → Lambda (image processing):
  s3:ObjectCreated:* → Invoke function
  
SQS → Lambda (queue processing):
  Messages in queue → Poll and invoke
  
DynamoDB Streams → Lambda (triggers):
  Table modifications → Invoke function
  
Scheduled → Lambda (cron jobs):
  EventBridge rule → Invoke at schedule
  
API Gateway → Lambda (REST API):
  HTTP request → Invoke function
```

### Dead Letter Queues

Handle failed invocations:

```
Async invocation fails:
├── Retry 2 times automatically
├── If all fail → Send to DLQ
└── DLQ = SQS queue or SNS topic

Configure:
Lambda → Alias/Function → Async invocations
  └── On failure trigger → SQS/SNS
```

## Lambda Security

### VPC Integration

Lambda in VPC for database access:

```
Without VPC:
└── Can't access RDS in private subnet

With VPC:
├── Deploy to specific subnets
├── Attach security group
├── Can access private resources
└── Cold starts slightly longer
```

### Environment Variables & Secrets

```
Environment variables (visible):
import os
db_host = os.environ.get('DB_HOST')  # Visible in code

Secrets Manager (encrypted):
client = boto3.client('secretsmanager')
secret = client.get_secret_value(SecretId='db-password')
password = json.loads(secret['SecretString'])['password']

Best practice:
✅ Use Secrets Manager for passwords
✅ Use environment variables for non-sensitive config
```

## Lambda Optimization

### Cold Starts

First invocation is slow (initialization):

```
Factors affecting cold start time:
├── Runtime: Python < Node.js < Java
├── Memory size: More = faster CPU = slightly faster
├── Dependencies: More imports = slower
├── VPC: Adding VPC adds 100+ ms
├── Initialization code: Optimize imports

Optimization:
├── Keep dependencies minimal
├── Move imports outside handler
├── Use provisioned concurrency
├── Use smaller packages
└── Lazy load dependencies
```

### Connection Pooling

Reuse database connections:

```python
# Bad: New connection every invocation
def handler(event, context):
    conn = psycopg2.connect(...)
    # Query
    conn.close()

# Good: Reuse connection
conn = None

def handler(event, context):
    global conn
    if not conn:
        conn = psycopg2.connect(...)
    # Query
    # Connection reused next invocation!
```

### X-Ray Tracing

Deep performance visibility:

```
Enable X-Ray:
├── Add AWSXRayDaemonWriteAccess to role
├── Import xray_recorder
├── Wrap functions

Code:
from aws_xray_sdk.core import xray_recorder

@xray_recorder.capture('database_query')
def query_db():
    # Query code
    pass

Result:
└── See: Function duration, DB query time, cold starts
```

## Advanced Async Processing

### Step Functions

Orchestrate complex workflows:

```
Flow:
1. Function A processes
2. If result > 1000 → Function B
   else → Function C
3. Wait for approval (human review)
4. Function D finalizes

Benefits:
├── Visual workflow
├── Error handling
├── Retry logic
├── Long-running processes (up to 1 year!)
```

### SQS as Buffer

Decouple with queues:

```
Fast producer:
├── API Gateway → Lambda (quick response)
└── Put message in SQS queue

Slow consumer:
├── Poll SQS
├── Process messages
└── Delete on success or send to DLQ
```

## Monitoring Lambda

### CloudWatch Insights Queries

```
Find errors:
fields @timestamp, @message, @duration
| filter @message like /ERROR/
| stats count() as error_count, avg(@duration) as avg_duration

Find slow invocations:
fields @duration, @maxMemoryUsed
| filter @duration > 5000
| stats avg(@duration) as avg_ms, pct(@duration, 99) as p99

Resource usage:
fields @maxMemoryUsed
| stats max(@maxMemoryUsed) as MaxMemory, avg(@maxMemoryUsed) as AvgMemory
```

### CloudWatch Alarms

```
Alert on:
├── Errors > 5% of invocations
├── Throttles (concurrent limit exceeded)
├── Duration > 10 seconds
└── Duration > 50% of timeout
```

## Lambda Costs & Optimization

### Cost Calculation

```
Requests:    $0.0000002 per request (1M = $0.20)
Duration:    $0.0000166667 per GB-second

Example: 100M requests/month, 1GB, 1 second each
Requests:    100M × $0.0000002 = $20
Duration:    100M × 1 sec × 1 GB × $0.0000166667 = $1667
────────────────────────────────────────────────
Total: ~$1687/month

Wait, that's expensive! Reduce duration!

With 100ms execution:
Duration: 100M × 0.1 sec × 1 GB × $0.0000166667 = $166.70
Total: ~$186.70/month (89% savings!)
```

### Right-Sizing Memory

```
Memory affects both cost and CPU:
├── 128 MB = slowest CPU
├── 512 MB = reasonable CPU
├── 1024 MB (1 GB) = fast CPU
├── 3008 MB = max CPU

Find optimal:
1. Monitor @maxMemoryUsed
2. Set memory to max observed use + 10%
3. Balance cost vs. duration
4. Usually 512 MB - 1 GB is sweet spot
```

## ⚠️ Common Mistakes

❌ **Ignoring cold starts**
→ Use provisioned concurrency for production

❌ **Creating new DB connection each invocation**
→ Reuse connections (init outside handler)

❌ **Too many dependencies**
→ Minimize package size

❌ **No DLQ for async invocations**
→ Messages lost on failure

❌ **Not handling timeouts**
→ Set function timeout < associated timeout

## 🎯 Key Takeaways

✅ Provisioned concurrency eliminates cold starts
✅ VPC needed for private resource access
✅ Secrets Manager for sensitive data
✅ X-Ray for performance tracing
✅ Step Functions for complex workflows
✅ SQS for async processing
✅ Optimize memory for cost

---

**Advanced Lambda patterns enable scalable, production systems!**

---

[← Previous: Lambda - Serverless Computing](07-lambda.md) | [Contents](README.md) | [Next: Elastic Beanstalk - Application Deployment →](09-elastic-beanstalk.md)
