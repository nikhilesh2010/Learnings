# EventBridge - Event Management

## EventBridge Basics

Event-driven architecture:

```
Source sends event:
Order placed → EventBridge → Route to 3 targets

Targets:
├── Lambda (process order)
├── SNS (send notification)
└── SQS (queue for async)

Event flow:
└── Decoupled applications
└── Scalable, resilient
```

## Event Sources

Where events come from:

```
AWS Services:
├── EC2: Instance state change
├── RDS: DB event
├── S3: Object uploaded
├── SNS: Message received
└── 90+ AWS services

Custom Applications:
└── PutEvents API: Send custom events

SaaS Partners:
├── Zendesk
├── Datadog
├── Okta
└── Stripe (and more)
```

## Event Rules

Route events to targets:

```
Rule: "New S3 Object"
├── Source: S3
├── Detail: "put object"
├── Detail pattern: Bucket = "uploads"

Targets:
├── Lambda function (resize image)
├── SQS queue (notification)
└── CloudWatch log group (audit)

Triggering:
└── New object in uploads bucket
└── All targets invoked in parallel
```

## Event Pattern Matching

Advanced routing:

```
Pattern:
{
  "source": ["ec2"],
  "detail-type": ["EC2 Instance State-change Notification"],
  "detail": {
    "state": ["terminated"],
    "instance-type": ["t2.*"]
  }
}

Matches:
├── EC2 instance termination
├── Type starts with "t2"
└── Specific to matching instances

Cost: All matching events routed
```

## Targets

What events trigger:

### Lambda

```
Invocation type:
├── Synchronous: Wait for response
├── Asynchronous: Fire and forget (DLQ support)

Example:
S3 object uploaded
  ↓
EventBridge
  ↓
Lambda (async)
  └── Process/resize image
  └── Event logged
  └── Failed events → DLQ
```

### SQS/SNS

```
EventBridge → SQS
└── Messages queued for processing

Advantages:
├── Buffering (SQS)
├── Decoupling
├── Retry mechanism
├── Lambda overcapacity protection

Example:
100,000 orders/minute
  → EventBridge routes all to SQS
  → Lambda polls SQS (controlled rate)
  → No Lambda cold starts
```

### HTTP Target

```
EventBridge → HTTP POST endpoint

Example:
Stripe webhook
├── Payment received
├── Stripe → EventBridge
├── EventBridge → Your API (HTTP)
├── Your API processes payment

Flexibility:
└── Event as JSON POST body
```

### Step Functions

```
EventBridge → Step Functions
└── Orchestrate complex workflows

Example:
Order placed
  ↓
Step Functions:
├── Step 1: Validate order
├── Step 2: Reserve inventory
├── Step 3: Process payment
└── Step 4: Send confirmation

Advantages:
├── Visual workflow
├── Error handling
├── Retry logic
└── Timeout management
```

## Event Buses

Multiple namespaces:

```
Default event bus:
└── AWS service events only

Custom event buses:
├── Company-specific events
├── Partner events
└── Each application posts events

Example setup:
Account: 123456789012
├── /default: AWS events
├── /orders: Order service
├── /payments: Payment service
└── /inventory: Inventory service

Each service:
└── Sends events to own bus
└── Subscribes to relevant buses
```

## Dead Letter Queue (DLQ)

Handle failed events:

```
Target processing failure:
Event → Lambda
  └── Lambda fails (exception, timeout)
  └── Retry 2 times
  └── All attempts failed
  └── Event → DLQ

DLQ setup:
├── SQS queue
└── Manual investigation
└── Replay after fix

Cost: Retention only
```

## Archive & Replay

Save and resend events:

```
Archive events:
├── All events to archive
├── Retention: 0 - 1095 days
├── Cost: $0.10 per million events stored

Replay events:
├── Resend archived events
├── Useful for debugging
├── Test new targets
└── Backdated timestamps

Use case:
Lambda bug discovered
  → Archive contains event
  → Fix bug
  → Replay events
  → Reprocess with fixed code
```

## Cross-Account Events

Share events between accounts:

```
Account A events:
└── EventBridge route to Account B

Use for:
├── Centralized logging
├── Shared alerting
├── Multi-account architecture

Setup:
├── Event bus in Account B
├── Resource-based policy (allow Account A)
├── Account A routes to Account B
└── Cross-account role (if needed)
```

## Cost Optimization

```
Billing:
├── EventBridge event: $0.35 per million events
├── Rule evaluations: Included
└── Low cost (<$1/month for typical apps)

Optimize:
├── Filter at source (pattern matching)
├── Avoid sending all events
├── Use efficient patterns
└── Archive selectively
```

## Common Patterns

### Fan-out Pattern

```
Single event → Multiple parallel processes

Order received event
├── Lambda 1: Invoice generation
├── Lambda 2: CRM update
├── Lambda 3: Analytics
└── Lambda 4: Notification

All parallel
└── No blocking between processes
```

### Filtering Pattern

```
Event arrives
  ↓
EventBridge evaluates pattern
├── Match: Send to target
└── No match: Discard

Saves Lambda invocations:
└── Reduce costs
```

## ⚠️ Common Mistakes

❌ **No DLQ configured**
→ Failed events lost silently

❌ **Pattern matching too broad**
→ Extra events processed (cost)

❌ **Synchronous Lambda targets**
→ Timeouts on slow processing

❌ **No archive policy**
→ Events lost immediately on failure

❌ **Same event bus for different apps**
→ Isolation concerns, scale issues

## 🎯 Key Takeaways

✅ Route events between services
✅ Decouple applications
✅ Multiple targets in parallel
✅ Pattern matching for filtering
✅ DLQ for failed events
✅ Archive + replay for debugging
✅ Custom event buses for structure
✅ Cross-account event routing

---

**EventBridge is your event-driven nervous system!**

---

[← Previous: API Gateway - REST & WebSocket APIs](30-api-gateway.md) | [Contents](README.md) | [Next: CloudFormation - IaC Fundamentals →](32-cloudformation.md)
