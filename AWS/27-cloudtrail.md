# CloudTrail & Audit Logging

## CloudTrail Overview

API call tracking:

```
Every AWS API call logged:
├── Who called (principal)
├── When they called
├── What they called
├── Where from (IP)
├── Response (success/failure)

Example:
User: john@company.com
Action: ec2:RunInstances
Resource: i-0123456789abcdef0
Time: 2024-01-15 14:32:47 UTC
Source IP: 203.0.113.42
```

## CloudTrail Setup

```
Enable CloudTrail:
AWS Console → CloudTrail → Create trail

Configuration:
├── Trail name
├── S3 bucket (where to store logs)
├── CloudWatch Logs group (optional)
├── SNS topic (optional, for alerts)
├── KMS encryption (optional)
└── Multi-region: Yes/No

Cost:
├── First trail: Free
├── Additional trails: $2 per 100k API calls
```

## Event Log Example

```
CloudTrail log structure:
{
  "eventVersion": "1.05",
  "userIdentity": {
    "type": "IAMUser",
    "principalId": "AIDACKCEVSQ6C2EXAMPLE",
    "arn": "arn:aws:iam::123456789012:user/Alice",
    "accountId": "123456789012",
    "userName": "Alice"
  },
  "eventTime": "2024-01-15T15:30:49Z",
  "eventSource": "ec2.amazonaws.com",
  "eventName": "RunInstances",
  "awsRegion": "us-east-1",
  "sourceIPAddress": "192.0.2.1",
  "userAgent": "aws-cli/2.0",
  "requestParameters": {
    "instanceType": "t3.micro",
    "imageId": "ami-0123456789abcdef0",
    "minCount": 1,
    "maxCount": 1
  },
  "responseElements": {
    "instancesSet": [
      {
        "instanceId": "i-0123456789abcdef0"
      }
    ]
  },
  "requestId": "12345678-1234-1234-1234-123456789012",
  "eventID": "1234567-89ab-cdef-0123-456789abcdef",
  "eventType": "AwsApiCall",
  "recipientAccountId": "123456789012"
}
```

## Querying CloudTrail Logs

Using Athena:

```
Create Athena table on CloudTrail logs:
SELECT
  eventtime,
  username,
  eventname,
  sourceipaddress
FROM cloudtrail_logs
WHERE eventname = 'DeleteSecurityGroup'
  AND eventtime >= '2024-01-15'
ORDER BY eventtime DESC;
```

Find who deleted security group:
find deleted DB instances:
COUNT deletes over time
```

## CloudTrail Event Categories

### Management Events (default)

API calls:

```
Examples:
├── CreateBucket (S3)
├── RunInstances (EC2)
├── CreateDBInstance (RDS)
├── CreateUser (IAM)
├── PutBucketPolicy (S3)
└── All control plane operations

Logged: Yes (default)
Cost: Included in free tier
```

### Data Events (optional, paid)

Object operations:

```
Examples:
├── GetObject (S3)
├── PutObject (S3)
├── DeleteObject (S3)
├── GetItem (DynamoDB)
├── PutItem (DynamoDB)

Cost: $0.10 per 100k data events
Volume: Can be massive (↑ costs!)

Enable selectively:
└── Specific buckets, tables, functions
```

### Insights Events

Unusual activity detection:

```
CloudTrail Insights:
├── Detects anomalies
├── Example: Spike in API calls
├── Automatically enabled
├── Cost: $0.35 per 100k api call volume

Alert on:
├── High API call rate
├── Unusual user activity
├── Permission changes
└── Large data transfers
```

## Compliance & Investigations

### Security Investigation Template

```
Question: Who accessed production database?

CloudTrail query:
SELECT
  eventtime,
  username,
  eventname,
  requestparameters,
  responseelements
FROM cloudtrail_logs
WHERE eventname LIKE '%Describe%'
  AND requestparameters LIKE '%prod-db%'
ORDER BY eventtime DESC;

Results:
├── List all queries to prod database
├── Identify suspicious access
├── Check timing (business hours?)
└── Review context (why access?)
```

### Compliance Audit Template

```
Question: How do we prove we never deleted backups?

CloudTrail query:
SELECT COUNT(*) as delete_count
FROM cloudtrail_logs
WHERE eventname LIKE '%DeleteSnapshot%'
ORDER BY eventtime;

Report:
├── Generate monthly summary
├── Export to S3 (long-term storage)
├── Present to auditors
└── Evidence of compliance
```

## Integration with Other Services

### CloudWatch Alarms

Alert on critical events:

```
Create alarm:
EventName = DeleteSecurityGroup
  └── Trigger SNS notification
  └── Page on-call engineer

Common alarms:
├── Root account login
├── IAM policy change
├── Security group modification
├── CloudTrail disabled
├── KMS key disabled
└── Database deletion
```

### S3 Integration

Store long-term logs:

```
CloudTrail → S3 bucket (logs)
└── 30 days in CloudTrail
└── Then to S3 glacier for compliance
└── 7-year retention (typical)

Lifecycle rule:
├── Move to Glacier after 90 days
├── Delete after 2,555 days (7 years)

Cost: $0.004/GB/month for Glacier
```

## Best Practices

```
✅ Enable multi-region trails
   Single trail for all regions

✅ Enable CloudTrail at account creation
   Don't miss early history

✅ Encrypt logs with KMS
   Prevent unauthorized access

✅ Enable MFA delete on trail bucket
   Prevent accidental log deletion

✅ Monitor trail status
   Alert if CloudTrail disabled

✅ Review high-risk events weekly
   Don't wait for audit

✅ Document suspicious findings
   Create incident records

✅ Archive long-term
   Glacier for compliance
```

## Cost Optimization

```
CloudTrail pricing:
├── First trail/account: Free
├── Each additional trail: $2 per 100k events
├── Data events: $0.10 per 100k
├── Insights: $0.35 per 100k API calls

Optimize:
├── Use organization trail (all accounts)
├── Selective data events (important buckets only)
├── Archive to Glacier quickly
└── Delete old logs per policy
```

## ⚠️ Common Mistakes

❌ **CloudTrail not enabled**
→ No evidence of who did what

❌ **No log integrity validation**
→ Can't prove logs weren't tampered

❌ **Logging to bucket without MFA delete**
→ Logs can be deleted/modified

❌ **All data events enabled**
→ Costs explode (can be $1000s/day)

❌ **Not archiving old logs**
→ CloudTrail storage costs

## 🎯 Key Takeaways

✅ CloudTrail logs all API calls
✅ Management events free, data events paid
✅ Query with Athena for investigation
✅ Compliance + security audits
✅ Alert on critical events
✅ Archive to Glacier for compliance
✅ MFA delete for protection
✅ Monitor CloudTrail status continuously

---

**CloudTrail is your audit trail and security investigator!**

---

[← Previous: CloudWatch - Monitoring & Logging](26-cloudwatch.md) | [Contents](README.md) | [Next: Systems Manager - Operations →](28-systems-manager.md)
