# S3 - Advanced Features & Optimization

## S3 Advanced Security

### SSL/TLS Force HTTPS

```
Bucket policy to enforce HTTPS:

{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Sid": "AllowHTTPSOnly",
      "Effect": "Deny",
      "Principal": "*",
      "Action": "s3:*",
      "Resource": [
        "arn:aws:s3:::my-bucket",
        "arn:aws:s3:::my-bucket/*"
      ],
      "Condition": {
        "Bool": {
          "aws:SecureTransport": "false"
        }
      }
    }
  ]
}
```

### S3 Access Points

Simplify access management:

```
Create access point for each application:

Data Lake Bucket: data-lake
├── Access Point 1: analytics-team
│   ├── Restricted to /analytics/* prefix
│   ├── Read-only
│   └── Different credentials
├── Access Point 2: ml-team
│   ├── Restricted to /models/* prefix
│   ├── Read-write
│   └── Different credentials
└── Access Point 3: public-data
    ├── Restricted to /public/* prefix
    └── Read-only

Each app uses different access point
Centralized IAM policy management
```

### S3 Block Public Access

Prevent accidental exposure:

```
Console setting:
S3 → [Bucket] → Permissions → Block Public Access

Options:
├── Block all public ACLs
├── Ignore existing public ACLs
├── Block all public bucket policies
└── Ignore existing public bucket policies

Recommended: Enable all (prevent accidents)
```

## S3 Advanced Performance

### Multipart Upload

Upload large files faster:

```
Without multipart:
└── Single connection, slow, can fail

With multipart:
├── Split into 5MB chunks (configurable)
├── Upload in parallel
├── Retry individual parts
└── 6x faster for large files!

Implementation:
AWS SDK handles automatically for large files
Or manual:
  aws s3api create-multipart-upload --bucket --key
  aws s3api upload-part (chunk 1, 2, 3...)
  aws s3api complete-multipart-upload
```

### Transfer Acceleration

Speed up uploads/downloads:

```
Normal:
Client → S3 endpoint (may be distant)

With acceleration:
Client → Nearest CloudFront edge
         → S3 via optimized path

Speed: 2-4x faster for large transfers

Cost:
├── Per-request fee: $0.04 per request
├── Good for: Large file uploads
├── Not for: Small, frequent requests

Enable:
S3 → [Bucket] → Properties → Static website hosting
  └── Transfer Acceleration
```

### Requester Pays

Shift data transfer costs to downloader:

```
Use case:
└── Data provider (you) doesn't want to pay
└── Data consumer pays instead

Enable on bucket:
s3api put-bucket-request-payment \
  --bucket my-bucket \
  --request-payment-configuration RequesterPays=true

Consumer must:
├── Specify --request-payer requester
├── Pay all data transfer costs

Typical use:
├── Datasets on AWS
├── User downloads → User pays transfer fees
```

## S3 Application Integration

### S3 Event Notifications

Trigger actions on object changes:

```
Upload to S3
    ↓
Lambda triggered
    ├── Process image
    ├── Generate thumbnail
    ├── Update database
    └── Send notification

Configuration:
S3 → [Bucket] → Properties → Event notifications
  ├── Events: s3:ObjectCreated:*, s3:ObjectRemoved:*
  ├── Destination: Lambda function
  └── Enable

Notifications also available for:
├── SNS (publish message)
├── SQS (queue message)
└── EventBridge (event to bus)
```

### S3 Select

Query files without downloading:

```
Traditional:
Get entire file → Parse → Read specific fields

With S3 Select:
Query SQL directly on S3 object
    ↓
Returns only requested fields
    ↓
80% less data transfer

Use for:
├── CSV/JSON files
├── Find specific rows/columns
└── Save bandwidth

Example:
aws s3api select-object-content \
  --bucket my-bucket \
  --key data.csv \
  --expression-type SQL \
  --expression "SELECT name, age FROM s3object WHERE age > 30"
```

### S3 Inventory

List bucket contents efficiently:

```
Instead of:
  aws s3 ls s3://my-bucket --recursive (SLOW!)

Use S3 Inventory:
├── Scheduled report
├── Lists all objects daily/weekly
├── Generates inventory in S3
├── Query with Athena

Output format:
├── CSV
├── ORC
└── Parquet (good for analytics)

Use for:
├── Large buckets (>1 billion objects)
├── Compliance reporting
└── Cost analysis
```

## S3 Analytics & Monitoring

### S3 Metrics & CloudWatch

```
Metrics:
├── Bytes uploaded
├── Bytes downloaded
├── PUT/GET requests
├── Transfer acceleration usage

Enable:
S3 → [Bucket] → Metrics → Manage metrics

Cost: $0.30 per metric per month
```

### Cost Allocation Tags

Tag objects for cost tracking:

```
Tag bucket:
├── Application: app-name
├── Environment: prod
├── Owner: team

Query costs:
AWS Cost Explorer → By tag
  └── See costs per application/environment
```

### Replication

### Simple Cross-Region Replication

```
Source bucket (us-east-1)
    ├── New objects → Replicated asynchronously
    └── Replicated bucket (eu-west-1)

Use for:
├── Disaster recovery
├── Global data distribution
├── Compliance (data residency)

Configuration:
S3 → [Bucket] → Replication rules
  ├── Source: Entire bucket or prefix
  ├── Destination: Target bucket
  ├── RTC: Wait for replication confirmation
  └── Apply
```

## S3 Storage Class Analysis

Understand access patterns:

```
Store all objects in S3 Standard initially
S3 Storage Class Analysis monitors:
├── Access patterns
├── Recommends transitions
├── Save money on infrequently accessed data

Example output:
"Objects matching /logs/* pattern are accessed < 1/month"
  └── Recommend: Transition to Glacier

Enable:
S3 → [Bucket] → Metrics → Storage Class Analysis
```

## ⚠️ Common Mistakes

❌ **All files in S3 Standard**
→ Use lifecycle to transition to cheaper classes

❌ **No versioning on critical data**
→ Enable versioning for recovery

❌ **Large files without multipart**
→ Use multipart upload

❌ **Ignoring object encryption**
→ Enable default encryption (free!)

❌ **Public bucket by accident**
→ Use Block Public Access

## 🎯 Key Takeaways

✅ SSL/TLS bucket policies
✅ Access points for simplified IAM
✅ Multipart uploads for speed
✅ Transfer Acceleration for global users
✅ S3 Select to save bandwidth
✅ Event notifications for automation
✅ Cross-region replication for DR
✅ Storage class analysis for cost

---

**S3 advanced features unlock scalability and performance!**

---

[← Previous: S3 - Object Storage Fundamentals](10-s3-basics.md) | [Contents](README.md) | [Next: EBS & EFS - Block Storage →](12-ebs-efs.md)
