# Monitoring & Alerting - CloudWatch Deep Dive

## CloudWatch Core Concepts

```
Metrics:
├── Data points over time
├── Resolution: 1-minute (default), 5-minute (detailed)
├── Retention: 15 months
└── Examples: CPU, NetworkIn, RequestCount

Logs:
├── Text data from applications
├── Organized by log group
├── Searchable via Insights
└── Retention: Customizable

Alarms:
├── Monitor metrics
├── Trigger actions (SNS, Lambda, ASG)
├── States: OK, ALARM, INSUFFICIENT_DATA

Dashboards:
├── Custom visualizations
├── Real-time updates
├── Multiple metrics per dashboard
└── Share with teams
```

## Log Groups & Streams

```
Organization:

Log Group: /aws/lambda/my-function
├── Log Stream: 2024/01/16/[$LATEST]abc123
│   ├── Event: timestamp, message
│   ├── Event: timestamp, message
│   └── Event: timestamp, message
└── Log Stream: 2024/01/14/[$LATEST]xyz789
    ├── Event: timestamp, message
    └── Event: timestamp, message

Retention policies:
├── 1 day - 10 years
├── Or never expire
└── Cost increases with retention
```

## Metric Math

Create new metrics from existing:

```
Metric 1: NetworkIn (bytes received)
Metric 2: NetworkOut (bytes sent)

Metric Math:
└── Total bandwidth = NetworkIn + NetworkOut

Visualization:
  8 AM: In=100GB, Out=150GB, Total=250GB
  9 AM: In=120GB, Out=180GB, Total=300GB

Use for:
├── Derived metrics
├── Anomaly detection
└── Complex dashboards
```

## CloudWatch Alarms

### Simple Alarm

```
Alarm:
├── Metric: CPU utilization (EC2)
├── Threshold: > 80%
├── Evaluation period: 2 consecutive minutes
├── Action: Send SNS notification

Behavior:
├── 6 AM: CPU = 70% → OK
├── 7 AM: CPU = 85% → ALARM (min 1)
├── 7:01 AM: CPU = 82% → ALARM (min 2, threshold met)
└── → SNS notification sent
└── → Page engineer
```

### Composite Alarm

Logical conditions:

```
Alarm A: API response time > 500ms
Alarm B: Error rate > 1%

Composite: (A OR B)
├── Triggers if either true
├── Sends to incident management

Composite: (A AND B)
├── Triggers only if both true
├── False alarm reduction
└── Must have real problems

Use for:
├── Complex monitoring logic
├── Reducing false positives
```

### Alarm Actions

What happens when alarm triggers:

```
Notifications:
├── SNS (send SMS, email, webhook)
├── Auto Scaling (scale up/down)
├── EC2 (reboot, terminate)
├── System Manager (runbook execution)
└── Lambda (custom actions)

Example multi-action alarm:
High CPU detected
  ├── Scale up ASG (immediate fix)
  ├── Send SNS (notify team)
  ├── Create incident (PagerDuty)
  ├── Record metric (analytics)
  └── Trigger debug Lambda
```

## CloudWatch Insights

Query logs with SQL-like syntax:

```
Find errors by service:
fields @timestamp, @message, @service
| filter @message like /ERROR/
| stats count() as error_count
  by @service

Results:
service          | error_count
api-service      | 45
payment-service  | 12
inventory-svc    | 3

Find slow requests:
fields @duration, @endpoint
| filter @duration > 1000
| stats avg(@duration), max(@duration)
  by @endpoint

Results:
endpoint           | avg   | max
/api/search        | 2103  | 5432
/api/users/{id}    | 1876  | 4123
/api/checkout      | 987   | 1234
```

## Custom Metrics

Application sending metrics:

```python
import boto3
import time

cloudwatch = boto3.client('cloudwatch')

# Publish custom metric
cloudwatch.put_metric_data(
    Namespace='MyCompany/MyApp',
    MetricData=[
        {
            'MetricName': 'ProcessingTime',
            'Value': 1234,  # milliseconds
            'Unit': 'Milliseconds',
            'Timestamp': time.time()
        },
        {
            'MetricName': 'ItemsProcessed',
            'Value': 450,
            'Unit': 'Count'
        }
    ]
)

# CloudWatch stores metrics
# Can set alarms on them
# Can visualize in dashboards
```

## Anomaly Detection

Automatic baseline learning:

```
Metric: API response time

Normal pattern:
├── 8 AM - 5 PM: 50-100ms
├── 5 PM - 8 PM: 80-150ms (peak)
└── 8 PM - 8 AM: 20-50ms (quiet)

Anomaly detected:
└── 2 AM: Response time = 500ms!
└── Way outside normal (20-50ms)
└── Alarm triggers

Algorithm:
├── Learns normal variance
├── Ignores expected peaks
├── Only alerts on true anomalies
```

## Metric Filters

Extract metrics from log data:

```
Log entry:
[ERROR] RequestId: 12345, Duration: 2345ms

Metric filter:
Pattern: [ERROR]
Count: Count occurrences

Result:
CloudWatch metric: ErrorCount
  └── Can alarm on error count > 10
```

## Cost Optimization

CloudWatch costs:

```
Free tier:
├── 10 metrics
├── CloudWatch Logs (free tier)
├── API requests: Free up to ~150
└── Custom dashboards: Free (first 3)

Paid:
├── Metrics: $0.30/month per custom metric
├── Logs ingestion: $0.50 per GB
├── Logs storage: $0.03 per GB per month
├── API requests: $0.01 per 1,000 requests
└── Alarms: $0.10 per alarm per month

Cost reduction:
├── Aggregate logs before ingestion
├── Set log retention (don't keep forever)
├── Use metric math (fewer custom metrics)
└── CloudWatch Logs Insights (pay per scanned)
```

## Dashboards

Create custom visualizations:

```
Dashboard: Production Overview

Top row:
├── API response time (line graph)
├── Error rate (area chart)
└── Request count (bar chart)

Middle row:
├── Database CPU (gauge)
├── Memory utilization (line)
└── Disk usage (gauge)

Bottom row:
├── Active user sessions (number)
├── Payment processing rate (line)
└── Inventory count (number)

Benefits:
├── Full system visibility
├── Share with team
├── Drill-down capability
└── Auto-refresh
```

## ⚠️ Common Mistakes

❌ **Alarms on normal variance**
→ Use anomaly detection

❌ **Too many email notifications**
→ Use PagerDuty/Slack instead (better filtering)

❌ **Logs with no retention limit**
→ Costs grow monthly

❌ **Ignoring metrics**
→ Can't optimize what you don't measure

❌ **No dashboards**
→ Hard to understand system health

## 🎯 Key Takeaways

✅ Metrics for numeric data
✅ Logs for detailed information
✅ Alarms for automated responses
✅ Dashboards for visibility
✅ Insights for log analysis
✅ Anomaly detection for smart alerting
✅ Custom metrics for application data
✅ Cost monitoring as part of practice

---

**CloudWatch is the eyes and ears of your infrastructure!**

---

[← Previous: Advanced Best Practices & Optimization](43-advanced-best-practices.md) | [Contents](README.md) | [Next: Analytics & Big Data Services →](45-analytics-big-data.md)
