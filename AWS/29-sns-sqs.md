# SNS & SQS - Messaging Services

## What are SNS & SQS?

**What:** Two message services for connecting applications.

**Why we use them:** Applications need to communicate reliably, especially when they can't connect directly.

**How they work:**

```
SNS = Simple Notification Service (Push):
├── Pub/Sub model
├── Publisher sends once
├── Multiple subscribers receive immediately
├── Like: Broadcasting announcement to everyone
└── Use for: Alerts, notifications, fanout

SQS = Simple Queue Service (Pull):
├── Queue/Worker model
├── Producer puts messages in queue
├── Consumer pulls when ready
├── Like: Email inbox (get messages when you log in)
└── Use for: Decoupling, buffering, worker pools
```

**Simple example comparison:**
```
Scenario: Order placed notification

SNS approach (Push):
├── Order service publishes: "Order #123 placed!"
├── Email service subscribes → Gets email instantly
├── SMS service subscribes → Gets text instantly
├── Analytical service subscribes → Gets data instantly
└── All 3 notified immediately!

SNS = Instant broadcast

SQS approach (Pull):
├── Order service puts message in queue
├── Email service: "When I'm ready, pull message, send email"
├── SMS service: "When I'm ready, pull message, send text"
├── Analytics service later: "Pull message, analyze"
└── Each processes when ready

SQS = Asynchronous, decoupled processing

Choice:
├── SNS: Need instant notifications to multiple services
├── SQS: Need to buffer work, process later
├── Both: SNS → fans out to multiple SQS queues
```

## SNS - Simple Notification Service

### Pub/Sub Pattern

```
Publisher (sends messages)
    ↓
  SNS Topic
    ├─→ Email subscriber (gets email)
    ├─→ SMS subscriber (gets text)
    ├─→ Lambda subscriber (Lambda invoked)
    ├─→ SQS subscriber (message queued)
    └─→ HTTP subscriber (webhook called)
```

### Creating Topics & Subscriptions

```bash
# Via AWS CLI
aws sns create-topic --name my-topic
# Output: TopicArn: arn:aws:sns:us-east-1:...:my-topic

# Subscribe email
aws sns subscribe \
  --topic-arn arn:aws:sns:us-east-1:...:my-topic \
  --protocol email \
  --notification-endpoint myemail@example.com

# Subscribe Lambda
aws sns subscribe \
  --topic-arn arn:aws:sns:us-east-1:...:my-topic \
  --protocol lambda \
  --notification-endpoint arn:aws:lambda:us-east-1:...:function:MyFunction
```

### Publishing Messages

```python
import boto3

sns = boto3.client('sns')

# Publish to topic
response = sns.publish(
    TopicArn='arn:aws:sns:us-east-1:...:my-topic',
    Subject='Order Confirmation',
    Message='Your order #12345 has been placed'
)

# All subscribers notified instantly!
```

### SNS Pricing

```
Publish:    $0.50 per million requests
Email:      First 1000/month free, then $2 per thousand
SMS:        ~$0.0075 per SMS
Lambda:     Free
SQS:        Charged as SQS messages

Example: Publish 10M messages, 5M SMS
Publish:  10M × $0.50 = $5
SMS:      5M × $0.0075 = $37.50
─────────────────────
Total: ~$40/month
```

## SQS - Simple Queue Service

### Queue Model

```
Producer sends message
    ↓
Message stored in queue
    ↓
Consumer polls queue
    ├── Gets message
    ├── Processes
    └── Deletes from queue

If consumer fails:
├── Message stays in queue
├── Another consumer retries
└── Guaranteed delivery
```

### Creating Queues

```bash
# Via console or CLI
aws sqs create-queue --queue-name my-queue

# Output: QueueUrl: https://sqs.us-east-1.amazonaws.com/.../my-queue
```

### Sending/Receiving Messages

```python
import boto3

sqs = boto3.client('sqs')
queue_url = 'https://sqs.us-east-1.amazonaws.com/...'

# Send message
sqs.send_message(
    QueueUrl=queue_url,
    MessageBody='Process this task'
)

# Receive message
response = sqs.receive_message(
    QueueUrl=queue_url,
    MaxNumberOfMessages=10,
    WaitTimeSeconds=20  # Long polling
)

for message in response.get('Messages', []):
    print(message['Body'])
    
    # Tell queue we processed it
    sqs.delete_message(
        QueueUrl=queue_url,
        ReceiptHandle=message['ReceiptHandle']
    )
```

### Message Retention

```
Default: 4 days
Range: 60 seconds - 14 days

Message not deleted:
├── Stays in queue
├── Can be re-processed
├── Good for visibility timeout (re-drive)
└── Bad if forgotten (wastes storage)
```

### Visibility Timeout

```
Message deleted from producer
    ↓
Consumer receives (visibility timeout = 30s)
    ├── Processing message for 20s...
    ├── Within 30s? Message not visible to others
    └── After 30s? Message becomes visible again (retry)

Consumer deletes message before timeout expires
    └── Gone for good (success!)

Consumer crashes without deleting
    └── Message reappears after timeout (retry by another consumer)
```

### Dead Letter Queue (DLQ)

```
Main Queue
    ├── Attempts to process: 3 times
    └── If all fail → Move to DLQ

Dead Letter Queue
    └── Failed messages for investigation
    └── Separate queue, same format
    └── Inspect why messages failed
```

## SNS vs SQS Decision Tree

```
Do subscribers need immediate delivery?
├─ YES  → SNS (pub/sub, instant)
└─ NO

Do you need message buffering?
├─ YES  → SQS (queue, buffer)
└─ NO

Do you need multiple subscribers?
├─ YES  → SNS (fanout)
└─ SQS (only one consumer pulls)

Do you need guaranteed processing?
├─ YES  → SQS (polling, re-tries)
└─ SNS (fire and forget)
```

## Common Patterns

### Pattern 1: Fanout with SNS → SQS

```
Order Placed (Event)
    ↓
  SNS Topic
    ├─→ SQS Queue 1 (Email Service)
    ├─→ SQS Queue 2 (Inventory)
    ├─→ SQS Queue 3 (Analytics)
    └─→ SQS Queue 4 (Fulfillment)

Each service processes independently
Decoupled architecture
```

### Pattern 2: Worker Pool with SQS

```
Task Queue (SQS)
    ├─→ Message 1
    ├─→ Message 2
    ├─→ Message 3
    └─→ Message N

Workers (ec2/lambda)
├─ Worker 1: Grab message, process, delete
├─ Worker 2: Grab message, process, delete
└─ Worker N: Grab message, process, delete

Auto-scaling based on queue length
```

### Pattern 3: SNS Direct to Lambda

```
CloudWatch Alarm triggered
    ↓
  SNS Topic
    ↓
Lambda auto-invoked
    ├── Check metrics
    ├── Auto-scale EC2
    ├── Send notification
    └── Create incident

Real-time alerting & response
```

## FIFO vs Standard

### Standard Queue

```
Order not guaranteed:
├── Message 1 might arrive as Message 3
├── Message 2 might arrive as Message 1
└── Good for: Non-order-critical tasks

Exactly-once delivery attempt, but possible duplicates
```

### FIFO Queue (First-In-First-Out)

```
Order guaranteed:
├── Message 1 → arrives 1st
├── Message 2 → arrives 2nd
└── Message 3 → arrives 3rd

No duplicates, exactly-once delivery

Cost: Slightly more expensive
Use for: Order processing, critical sequences
```

## Pricing

### SQS Pricing

```
Standard Queue:
├── Requests: $0.40 per million
├── First 1GB/month free, then $0.09/GB

FIFO Queue:
├── Requests: $0.50 per million

Example: 1M messages, 100MB data
Cost: 1M × $0.40 + 0 = $0.40/month
```

### SNS Pricing

```
Publish: $0.50 per million requests
Email:   Free first 1000, then $2/thousand
SMS:     ~$0.0075 per SMS
Lambda:  Free delivery
SQS:     Standard SQS rates

Example: 1M message fanout to 3 SQS queues
SNS:  1M × $0.50 = $0.50
SQS:  3M × $0.40 = $1.20
─────────────────
Total: $1.70/month
```

## ⚠️ Common Mistakes

❌ **Using SQS when SNS is needed**
→ SNS for real-time notifications

❌ **Not handling duplicate messages**
→ Assume duplicates possible

❌ **Long polling without wait time**
→ Use WaitTimeSeconds=20 to reduce costs

❌ **Not using DLQ**
→ Messages "disappear"

❌ **Infinite retry loops**
→ Set max attempts + DLQ

## 🎯 Key Takeaways

✅ SNS = pub/sub notifications (push)
✅ SQS = message queue (pull)
✅ SNS for real-time, fanout events
✅ SQS for decoupling, buffering
✅ FIFO for order-critical messages
✅ DLQ for failed message handling
✅ Long polling reduces costs
✅ Pricing: micro-cost for volume

## 🚀 Hands-On Exercise

1. ☑️ Create SNS topic
2. ☑️ Subscribe with email
3. ☑️ Publish message (check email)
4. ☑️ Create SQS queue
5. ☑️ Send message via CLI
6. ☑️ Receive and delete message
7. ☑️ Subscribe SQS to SNS topic
8. ☑️ Monitor via CloudWatch

---

**SNS & SQS decouple and scale your applications!**

---

[← Previous: Systems Manager - Operations](28-systems-manager.md) | [Contents](README.md) | [Next: API Gateway - REST & WebSocket APIs →](30-api-gateway.md)
