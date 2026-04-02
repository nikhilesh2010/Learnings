# S3 - Object Storage Fundamentals

## What is S3?

**S3 = Simple Storage Service**

```
File/Folder System         S3 (Object Storage)
├── Files & folders       ├── Objects (files)
├── Hierarchy (C:/Users) ├── Buckets (containers)
├── Permissions per file └── Flat structure, infinite scale
├── 16TB file limit       └── No file size limit
└── Slower scaling        └── Automatic scaling

Think: Google Drive / Dropbox / AWS version
```

## Key Concepts

### Bucket

A container (like a folder) that holds objects:

```bash
Bucket names:
  my-app-data
  company-documents-backup
  images-cdn-234823

Rules:
  - Globally unique (across all AWS accounts!)
  - Lowercase, numbers, hyphens only
  - Must start with letter or number
  - 3-63 characters long
```

### Objects

Files stored in buckets:

```
Bucket: my-app-data
├── document.pdf (1 MB)
├── photo.jpg (5 MB)
├── video.mp4 (500 MB)
├── folder/
│   ├── file1.txt
│   └── file2.txt
└── archive.zip

Key (path): folder/file1.txt
Size limit: None (objects up to 5TB each!)
```

### Regions

```bash
Buckets are regional:
├── us-east-1 (cheapest: $0.023/GB)
├── eu-west-1 (+15% cost)
└── ap-south-1 (+25% cost)

Choose based on:
- Data residency/compliance
- Access latency
- Cost
```

## S3 Storage Classes

### Use Cases Determine Storage Cost

#### 1. **S3 Standard** (Most expensive, instant access)

```bash
Cost:            $0.023/GB/month
Retrieval:       Instant
Availability:    99.99%
Use for:         Frequently accessed files
                 Websites, APIs, active data

Example: 1GB = $0.023/month
```

#### 2. **S3 Intelligent-Tiering** (Auto-optimization)

```bash
Cost:            $0.0125/GB/month (cheaper than Standard)
How it works:    Automatically moves between classes
                 based on access patterns
Retrieval:       Instant to hours (depends on tier)
Availability:    99.9%
Use for:         Unknown access patterns
                 Don't know if data will be accessed

Example: 1GB = $0.0125/month
```

#### 3. **S3 Standard-IA** (Infrequent Access)

```bash
Cost:            $0.0125/GB/month
Retrieval fee:   $0.01/GB (first time retrieving)
Availability:    99.9%
Minimum stay:    30 days (remove before = penalty)
Use for:         Data accessed <1/month
                 Backup files, monthly reports

Example: Store 1GB = $0.0125
         Retrieve once = $0.01
         Total: $0.0225
```

#### 4. **S3 Glacier** (Archive)

```bash
Cost:            $0.004/GB/month (ultra cheap!)
Retrieval:       3-5 hours (slow!)
                 1 minute expedited (costs extra)
Availability:    99.99%
Minimum stay:    90 days
Use for:         Compliance archives
                 Audit trails, old backups

Example: 1GB = $0.004/month (archival cost)
         Retrieve = $0.03/GB + time
```

#### 5. **S3 Glacier Deep Archive** (Long-term)

```bash
Cost:            $0.00099/GB/month (cheapest!)
Retrieval:       12 hours standard
Availability:    99.99%
Minimum stay:    180 days
Use for:         7-year compliance requirements
                 Rarely accessed archives

Example: 1GB = $0.00099/month (tiny cost!)
```

### Storage Class Comparison

| Class | $/GB/mo | Retrieval Time | Min Stay |
|-------|---------|---|---|
| Standard | $0.023 | Instant | None |
| Intelligent-Tiering | $0.0125 | Varies | None |
| Standard-IA | $0.0125 | Instant | 30 days |
| Glacier | $0.004 | 3-5 hrs | 90 days |
| Glacier Deep | $0.00099 | 12 hrs | 180 days |

## Creating and Using S3 Buckets

### Creating a Bucket

```bash
1. AWS Console → S3
2. Click "Create bucket"
3. Bucket name: my-unique-name-123
4. Region: us-east-1 (first time)
5. ACL: Private (default, recommended)
6. Block public access: ON (recommended)
7. Versioning: Disable (initially)
8. Default encryption: SSE-S3 (free!)
9. Create bucket → Done!
```

### Uploading Objects

```bash
Method 1: Console
├── Click bucket
└── Click "Upload"
    ├── Drag & drop or select files
    ├── Click "Upload"
    └── Done!

Method 2: AWS CLI
```bash
aws s3 cp myfile.txt s3://my-bucket/
aws s3 cp ~/folder s3://my-bucket/folder --recursive
```

Method 3: SDK (Python, JavaScript, etc.)
```python
import boto3
s3 = boto3.client('s3')
s3.upload_file('local-file.txt', 'my-bucket', 'remote-file.txt')
```
```

### Accessing Objects

```bash
Object location:
s3://bucket-name/object-key

Example: s3://my-app-data/photos/vacation.jpg

Public URL (if public):
https://my-app-data.s3.amazonaws.com/photos/vacation.jpg

Signed URL (temporary link):
https://...?Signature=...&Expires=1234567890
```

## Access Control

### Public vs. Private

#### ❌ Public Access (Risky!)

```bash
# Bad: Anyone on internet can see
Object ACL: Public Read Only
Or:
Bucket Policy allows GetObject
```

#### ✅ Private Access (Recommended)

```bash
# Good: Only authorized users/roles
Block Public Access: ON
Require authentication to access
Use IAM roles or Signed URLs
```

### Access Methods

```bash
1. IAM User
   ├── EC2 instance with IAM role
   ├── AWS CLI with credentials
   └── SDK in application

2. Signed URL (Temporary access)
   ├── Generate with expiration time
   ├── Share with external users
   └── Auto-revokes after expiration

3. Pre-signed POST
   ├── Browser-based upload
   └── Without AWS credentials
```

## Versioning

### Enable Versioning

```bash
Bucket → Properties → Versioning → Enable
Now every object keeps old versions!

Upload file.txt (v1)
Upload file.txt (v2) - v1 retained
Upload file.txt (v3) - v1, v2 retained
Delete file.txt     - Marked deleted, versions stay
```

### Benefits

```bash
✅ Accidental overwrite protection
✅ Compliance requirements
✅ Easy rollback
✅ Audit trail
```

### Costs

```bash
Each version counts toward storage!

Without versioning: 1GB file = $0.023
With versioning, 10 versions: 10GB = $0.23

TIP: Set lifecycle to delete old versions
```

## Lifecycle Policies

### Auto-management Based on Age

```
New file (0-30 days)
  └─ S3 Standard

30 days old
  └─ S3 Intelligent-Tiering (cheaper)

90 days old
  └─ S3 Glacier (archive)

180 days old
  └─ S3 Glacier Deep Archive (compliance)

365 days old
  └─ Delete
```

### Setting Lifecycle

```bash
1. Bucket → Management → Lifecycle rules
2. Create rule:
   - Prefix: documents/ (optional)
   - Transition to Intelligent-Tiering: 30 days
   - Transition to Glacier: 90 days
   - Delete: 365 days
3. Enable rule
```

## S3 Use Cases

### 1. **Static Website Hosting**

```bash
Bucket: my-website.example.com
├── index.html
├── style.css
├── app.js
└── assets/
    ├── image1.jpg
    └── image2.jpg

Enable static website hosting
→ Automatic URL: http://my-website.example.com.s3.amazonaws.com/
```

### 2. **Backup & Archive**

```bash
Backup daily database dumps:
s3://company-backups/db-backup-2024-01-15.sql

Lifecycle: Move to Glacier after 30 days
Cost savings: 90% reduction!
```

### 3. **Data Lake**

```bash
Raw data → S3 Standard
Processed data → Intelligent-Tiering
Historical archive → Glacier
```

### 4. **Log Storage**

```bash
Application logs:
s3://app-logs/2024/01/15/app-12345.log

CloudTrail logs (compliance)
ELB logs (access logs)
CloudFront logs (CDN usage)
```

### 5. **Media Distribution**

```bash
Upload video: s3://videos/movie.mp4
CloudFront caches it
Users download from CDN edge locations (fast!)
Save 66% on bandwidth costs
```

## S3 Pricing Example

### Scenario: Photo Backup Service

```
Upload: 100GB photos/month
Storage: Growing, 2TB total currently
Access: Check photos 2-3 times/month

Configuration:
├── Recent photos (1TB):           S3 Standard
├── Monthly archive (500GB):       Glacier (30 days old)
└── Older (500GB):                 Glacier Deep (6+ months)

Monthly cost:
├── Standard: 1TB × $0.023 = $23.68
├── Glacier: 0.5TB × $0.004 = $2
├── Glacier Deep: 0.5TB × $0.00099 = $0.50
└── Data transfer out: ~$5
───────────────────────────
Total: ~$31/month

Without optimization:
├── All Standard: 2TB × $0.023 = $46/month
──────────────────────────
Savings: $15/month (33% less!)
```

## ⚠️ Common Mistakes

❌ **Making bucket public accidentally**
→ Block Public Access by default

❌ **Forgetting to set lifecycle**
→ Paying Standard price for old archives

❌ **Large files without multipart upload**
→ Upload fails, slow

❌ **Not enabling versioning, then deletion**
→ Can't recover deleted files

❌ **Wrong region for compliance**
→ GDPR requires EU region

## 🎯 Key Takeaways

✅ S3 = object storage for files, images, videos
✅ Bucket = container with globally unique name
✅ Choose storage class: Standard (fast/expensive) → Deep Archive (slow/cheap)
✅ Use lifecycle policies for cost optimization
✅ Versioning protects against accidental deletion
✅ Default = private (change deliberately)
✅ First 1GB data transfer free per month

## 🚀 Hands-On Exercise

1. ☑️ Create S3 bucket (my-learning-bucket-123)
2. ☑️ Upload 500MB of files
3. ☑️ Enable versioning
4. ☑️ Modify a file, notice version created
5. ☑️ Create lifecycle rule (30-day Glacier transition)
6. ☑️ Enable static website hosting
7. ☑️ Upload index.html, access via public URL

---

**S3 is the backbone of AWS data storage. Understand pricing and lifecycle!**

---

[← Previous: Elastic Beanstalk - Application Deployment](09-elastic-beanstalk.md) | [Contents](README.md) | [Next: S3 - Advanced Features & Optimization →](11-s3-advanced.md)
