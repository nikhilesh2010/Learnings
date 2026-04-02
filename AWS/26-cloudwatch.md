# CloudWatch - Monitoring & Logging

## What is CloudWatch?

**CloudWatch = AWS Monitoring & Logging Service**

Collect metrics, logs, and set alarms:

```
All AWS Services          CloudWatch Dashboard
├── EC2 metrics    ----→  ├── Visualizations
├── Lambda logs    ----→  ├── Trends
├── RDS data       ----→  ├── Alarms
├── S3 events      ----→  └── Insights
└── Custom metrics ----→
```

## Key Concepts

### 1. Metrics

Time-series data points (measurements):

```
Metric: CPU Utilization
├── Timestamp: 2024-01-15 10:00:00
├── Value: 75%
├── Unit: Percent
└── Dimensions: InstanceId=i-1234567890abcdef0

AWS provides 50+ metrics per service automatically
```

### 2. Logs

Text records from applications/services:

```
Log Group: /aws/lambda/my-function
└── Log Stream: 2024/01/15/[$LATEST]abc123
    └── Log Events:
        ├── [10:00:00] Processing request
        ├── [10:00:01] Database query: 45ms
        ├── [10:00:02] Returning response
        └── [10:00:03] Total: 3s
```

### 3. Alarms

Trigger actions when metrics meet conditions:

```
Metric: CPU > 80%
Action: Send SNS notification
        Auto-scale EC2
        Create incident ticket
```

### 4. Dashboards

Visualize metrics:

```
┌──────────────────────────────────┐
│ Application Dashboard            │
├──────────────────────────────────┤
│ ┌─────────────┐  ┌─────────────┐ │
│ │ CPU Usage   │  │ Memory Used │ │
│ │ 45%         │  │ 3.2 GB      │ │
│ └─────────────┘  └─────────────┘ │
│ ┌─────────────┐  ┌─────────────┐ │
│ │ Requests/s  │  │ Error Rate  │ │
│ │ 1234        │  │ 0.1%        │ │
│ └─────────────┘  └─────────────┘ │
│ ┌─────────────────────────────┐  │
│ │ Network (24h)               │  │
│ │ [Graph showing traffic]     │  │
│ └─────────────────────────────┘  │
└──────────────────────────────────┘
```

## CloudWatch Metrics

### EC2 Metrics (Auto Available)

```
CPU Utilization:        0-100%
Network In/Out:         Bytes/second
Disk Read/Write:        Operations/second
Status Checks:          Passed/Failed

Enabled by default:
├── Basic monitoring (5-minute intervals)
└── Free tier included

Detailed monitoring (1-minute):
├── $3.50 per metric per month
└── Better for auto-scaling
```

### Lambda Metrics

```
Invocations:            # times executed
Errors:                 # of failures
Duration:               Execution time
Concurrent Executions:  Running simultaneously
Throttles:              Rejected calls
```

### RDS Metrics

```
CPU Utilization:        Database CPU load
Database Connections:   Active connections
Read/Write Latency:     Query response time
Free Disk Space:        Storage remaining
```

### Custom Metrics

Your application sends custom metrics:

```python
import boto3

cloudwatch = boto3.client('cloudwatch')

# Put a metric
cloudwatch.put_metric_data(
    Namespace='MyApp',
    MetricData=[
        {
            'MetricName': 'ProcessingTime',
            'Value': 123.45,
            'Unit': 'Milliseconds'
        }
    ]
)
```

## CloudWatch Logs

### Log Groups & Streams

```
Log Group: /aws/lambda/my-function
├── Log Stream: 2024/01/15/[$LATEST]abc
│   ├── [10:00:00] Processing...
│   ├── [10:00:01] Database: 45ms
│   └── [10:00:02] Done
│
├── Log Stream: 2024/01/15/[$LATEST]def
│   └── [10:00:05] New request...
│
└── Log Stream: 2024/01/16/[$LATEST]ghi
    └── [11:00:00] Processing...
```

### Logs from Applications

#### Python

```python
import logging

# Configure logging
logger = logging.getLogger()
logger.setLevel(logging.INFO)

# These go to CloudWatch automatically
logger.info("User signed up")
logger.warning("Low memory!")
logger.error("Database connection failed")
logger.debug("Variable x = 123")
```

#### Node.js

```javascript
// Lambda runtime passes console to CloudWatch
console.log("User signed up");
console.warn("Low memory!");
console.error("Database connection failed");
```

### Log Insights (Query Logs)

Search and analyze logs:

```
Filter:
fields @timestamp, @message, @duration
| filter @message like /ERROR/
| stats count() by @message

Result: All error messages and their counts
```

## Creating Alarms

### Via Console

```bash
1. CloudWatch Console → Alarms → Create Alarm
2. Select metric:
   - Instance → CPUUtilization
3. Define condition:
   - Threshold: Static
   - Value: 80 (percent)
   - Comparison: Greater than or equal
4. Define datapoints:
   - 2 datapoints out of 2 evaluations
   - Period: 5 minutes
5. Configure actions:
   - When alarm state is: ALARM
   - Action: Send SNS
   - SNS topic: Create new
   - Email: your@email.com
6. Set alarm name: HighCPU
7. Create alarm
```

### Via CLI

```bash
aws cloudwatch put-metric-alarm \
  --alarm-name HighCPU \
  --alarm-description "Alert if CPU > 80%" \
  --metric-name CPUUtilization \
  --namespace AWS/EC2 \
  --statistic Average \
  --period 300 \
  --threshold 80 \
  --comparison-operator GreaterThanThreshold \
  --evaluation-periods 2 \
  --alarm-actions arn:aws:sns:us-east-1:123456789012:my-topic
```

## Alarm States

```
┌─────────────┐
│   OK        │ ← Condition not met
├─────────────┤ Send notification? → Optional
└──────┬──────┘
       │ Condition met
       ▼
┌─────────────┐
│   ALARM     │ ← Trigger actions!
├─────────────┤ Send email, auto-scale, etc.
└──────┬──────┘
       │ (typically after minutes)
       ▼
┌─────────────┐
│  OK         │ ← Back to normal
├─────────────┤ Send "resolved" notification
└─────────────┘
```

## CloudWatch Dashboards

### Create Dashboard

```bash
1. CloudWatch → Dashboards → Create Dashboard
2. Add widgets:
   - Line graph
   - Number
   - Logs Insights table
   - Metric widget
3. Add metrics:
   - EC2: CPUUtilization
   - Lambda: Errors
   - RDS: DatabaseConnections
4. Configure layout, colors, time ranges
5. Save dashboard
```

### Dashboard JSON

```json
{
  "widgets": [
    {
      "type": "metric",
      "properties": {
        "metrics": [
          [ "AWS/EC2", "CPUUtilization", "InstanceId", "i-1234567" ],
          [ ".", "NetworkIn", ".", "." ]
        ],
        "period": 300,
        "stat": "Average",
        "region": "us-east-1",
        "title": "EC2 Performance"
      }
    }
  ]
}
```

## Log Groups & Retention

### Set Retention

```bash
By default logs kept forever (costs money!)

Update retention:
1. CloudWatch Logs → Log Groups
2. Select log group
3. Actions → Edit retention policy
4. Set to: 7 days (or your preference)

Cost consideration:
- Keeping 1 year of logs: $57/GB/year
- 7 days: ~$0.50/GB
```

## CloudWatch Pricing

### Metrics

```
Custom metrics:    $0.30/metric/month
Each metric stored for 15 months

API requests:      $0.01 per 1000 requests
(PutMetricData, GetMetricStatistics, etc.)
```

### Logs

```
Ingestion:         $0.50/GB
Storage:           $0.03/GB/month

Example: 100GB logs per month
Ingestion: 100 × $0.50 = $50
Storage (1 year): 1200 × $0.03 = $36
───────────────────────────
Total: ~$50/month
```

### Alarms

```
Standard alarm:    $0.10 each/month
Composite alarm:   $0.002 each/month
(cheaper if many alarms)

Example: 50 alarms
Cost: 50 × $0.10 = $5/month
```

## CloudWatch Use Cases

### 1. Application Performance Monitoring

```
Track custom metrics:
├── Request latency
├── Error rate
├── Database queries
├── Cache hit ratio
```

### 2. Infrastructure Monitoring

```
EC2 instances:
├── CPU, memory, disk
├── Network traffic
└── Status checks

Set up alarms for:
├── High CPU
├── Disk running out
└── Network saturation
```

### 3. Cost Monitoring

```
Track AWS costs:
├── Estimated charges (daily)
├── By service
├── By account
└── Set budget alarms ($100/day)
```

### 4. Security Monitoring

```
CloudTrail → CloudWatch Logs
├── Track API calls
├── Detect suspicious activity
├── Alert on permission changes
```

## Anomaly Detection

AI-powered outlier detection:

```
CloudWatch learns normal patterns
├── CPU: normally 20-40%
├── Requests: normally 1000-2000/sec
├── Errors: normally 0.1%

When values deviate:
├── Band change color (yellow)
└── Alert triggers
```

Setup:
```bash
Alarm → Anomaly Detection
└── Specify metric
└── AWS learns for ~2 weeks
└── Then auto-detects anomalies
```

## ⚠️ Common Mistakes

❌ **No retention policy**
→ Costs money forever

❌ **Alarms with too many false positives**
→ Tune thresholds

❌ **Custom metrics without namespace**
→ Hard to organize

❌ **Missing important metrics**
→ Set up dashboards early

## 🎯 Key Takeaways

✅ CloudWatch = monitoring and logging
✅ Metrics + Logs + Alarms + Dashboards
✅ EC2, Lambda, RDS metrics automatic
✅ Set log retention (avoid costs)
✅ Create alarms for critical metrics
✅ Use dashboards for quick overview
✅ Log Insights for log analysis

## 🚀 Hands-On Exercise

1. ☑️ Create CloudWatch dashboard
2. ☑️ Add EC2 CPU metric
3. ☑️ Create alarm (CPU > 50%)
4. ☑️ Create SNS topic for notifications
5. ☑️ View Lambda logs in CloudWatch
6. ☑️ Set log retention to 7 days
7. ☑️ Query logs with Insights

---

**Monitoring is critical for production. Start early!**

---

[← Previous: VPN & Direct Connect](25-vpn-direct-connect.md) | [Contents](README.md) | [Next: CloudTrail - Auditing & Compliance →](27-cloudtrail.md)
