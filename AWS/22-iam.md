# IAM - Identity & Access Management

## What is IAM?

**IAM = Identity and Access Management**

Control who has access to AWS resources and what they can do:

```
Traditional              IAM Model
├── Everyone admin      ├── Fine-grained permissions
├── Hard to audit       ├── Central access control
├── High breach risk    ├── Audit trail of actions
├── No separation       ├── Principle of least privilege
└── Manual access       └── Automated provisioning

Think: Like office keycards - different cards, different rooms
```

## IAM Identities

### 1. AWS Account Root User

```bash
= Email address used to create account
= Highest privilege (can delete everything!)
= Root access keys (NEVER create, use IAM users instead)

Usage:
✅ Account setup/billing
✅ Emergency only
❌ Daily work
❌ Programmatic access
```

### 2. IAM Users

Individual people or applications:

```bash
Username: john.smith
Access type: Console + Programmatic
MFA: Enabled
Permissions: Attached policies

Can have:
├── Console password (login to AWS console)
├── Access keys (AWS CLI, SDK)
└── Temporary credentials (via STS)
```

### 3. IAM Groups

Collection of users with shared permissions:

```
Group: DevelopersGroup
├── Member: alice
├── Member: bob
└── Member: charlie

Attach Policy: PowerUserAccess
└── All 3 developers get same permissions
└── Add new developer → just add to group!
```

### 4. IAM Roles

Identity with permissions (for services/users):

```
Lambda needs S3 access:
├── Create Role: LambdaS3Role
├── Attach: S3FullAccess policy
├── Trust: Lambda service
└── Lambda uses role's credentials

EC2 needs DynamoDB access:
├── Create Role: EC2DynamoDBRole
├── Attach: DynamoDBReadAccess
├── EC2 instance assumes role
└── EC2 has temporary credentials
```

## IAM Policies

### What is a Policy?

JSON document granting/denying permissions:

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Action": "s3:GetObject",
      "Resource": "arn:aws:s3:::my-bucket/*"
    }
  ]
}
```

### Anatomy

```
Version:    2012-10-17 (latest)
Statement:  Array of permissions
├── Effect: Allow/Deny
├── Action: What they can do (s3:*, ec2:DescribeInstances, etc.)
├── Resource: What resources (ARN - Amazon Resource Name)
└── Condition: Optional (IP address, time, etc.)
```

### AWS Managed Policies (Pre-built)

```bash
AdministratorAccess
  └── Full access to all services

PowerUserAccess
  └── All except IAM/Org management

ReadOnlyAccess
  └── View everything, don't modify

S3FullAccess
  └── All S3 permissions

EC2FullAccess
  └── All EC2 permissions

LambdaFullAccess
  └── All Lambda permissions

AmazonDynamoDBReadOnlyAccess
  └── Read DynamoDB tables only

... 500+ more AWS managed policies
```

### Custom Policies

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Sid": "ListBuckets",
      "Effect": "Allow",
      "Action": "s3:ListBucket",
      "Resource": "arn:aws:s3:::my-bucket"
    },
    {
      "Sid": "GetObjects",
      "Effect": "Allow",
      "Action": "s3:GetObject",
      "Resource": "arn:aws:s3:::my-bucket/*"
    },
    {
      "Sid": "DenyDeleteObjects",
      "Effect": "Deny",
      "Action": "s3:DeleteObject",
      "Resource": "arn:aws:s3:::my-bucket/*"
    }
  ]
}
```

## Amazon Resource Names (ARNs)

Unique identifier for AWS resources:

```
arn:aws:service:region:account-id:resource-id

Examples:
arn:aws:s3:::my-bucket
  └── S3 bucket (global, no region/account)

arn:aws:s3:::my-bucket/*
  └── All objects in bucket

arn:aws:dynamodb:us-east-1:123456789012:table/Users
  └── DynamoDB table

arn:aws:lambda:us-east-1:123456789012:function:my-function
  └── Lambda function

arn:aws:iam::123456789012:user/john
  └── IAM user

Wildcards:
*           All resources
prod-*      Prefix match
arn:aws:s3:::my-bucket/2024/*  Objects from 2024
```

## IAM Security Best Practices

### ✅ DO

```bash
✅ Use IAM users for daily work (not root)
✅ Enable MFA for all users
✅ Use groups for permissions (easier management)
✅ Apply least privilege (minimum needed)
✅ Rotate access keys every 90 days
✅ Use roles for EC2/Lambda (better than access keys)
✅ Enable CloudTrail for auditing
✅ Use password policies (strong passwords)
✅ Check permissions regularly (IAM Access Analyzer)
```

### ❌ DON'T

```bash
❌ Use AWS root account daily
❌ Create root access keys
❌ Share access keys in code/git
❌ Give everyone admin access
❌ Use same user for multiple people
❌ Assign permissions directly to users (use groups)
❌ Ignore MFA
❌ Hard-code credentials
```

## Setting Up IAM User (Recommended First Step)

### Step 1: Create IAM User

```bash
1. AWS Console → IAM → Users → Create user
2. User name: my-admin-user or your-name
3. Provide user access:
   ☑ AWS Management Console access
   ☑ AWS CLI/SDK access
4. Console password: Auto-generated (you can set)
5. Require password change: Yes (recommended)
```

### Step 2: Add Permissions

```bash
1. User → Add permission
2. Attach existing policies:
   → AdministratorAccess (for admin user)
   → OR specific policies (developers)
```

### Step 3: Set Up MFA

```bash
1. User → Security credentials
2. Assign MFA device:
   → Virtual (Google Authenticator, Authy)
   → Hardware key
   → SMS (not recommended)
```

### Step 4: Create Access Keys (Optional)

```bash
For CLI/SDK access:
1. User → Security credentials
2. Create access key
3. Download CSV (save securely!)
4. Use in AWS CLI config:
   
~/.aws/credentials:
[default]
aws_access_key_id = AKIA...
aws_secret_access_key = xxxxx...

~/.aws/config:
[default]
region = us-east-1
output = json
```

## Cross-Account Access

Share resources between AWS accounts:

```
Account A (owns S3 bucket)
└── Create role with S3 access
└── Trust Account B to assume role

Account B (needs S3 access)
└── User/role can assume role from Account A
└── Gets temporary credentials
└── Accesses S3 in Account A
```

Setup:
```json
// Account A's role trust policy
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Principal": {
        "AWS": "arn:aws:iam::ACCOUNT-B:root"
      },
      "Action": "sts:AssumeRole"
    }
  ]
}
```

## IAM Policy Evaluation

When user makes request:

```
1. Explicit Deny?
   └─ YES → BLOCKED

2. Explicit Allow?
   └─ YES → ALLOWED
   └─ NO → BLOCKED

3. Organizational SCP?
   └─ Similar process

```

## IAM Access Analyzer

Find overly permissive policies:

```
IAM Console → Access Analyzer
├── Find unused access
├── Identify public resources
├── Validate IAM policies
└── Export findings
```

## Temporary Credentials (STS)

AssumeRole to get temporary credentials:

```bash
AWS STS (Security Token Service):
├── Short-lived credentials (15 min - 12 hours)
├── Better than permanent access keys
├── Used by: Lambda, EC2 (via roles), API

Example: Session token
{
  "AccessKeyId": "ASIA...",
  "SecretAccessKey": "...",
  "SessionToken": "...",
  "Expiration": "2024-01-15T10:00:00Z"
}
```

## Common IAM Patterns

### Pattern 1: Development Team

```
Group: Developers
├── Members: alice, bob, charlie
├── Policies:
│   ├── EC2FullAccess
│   ├── RDSFullAccess
│   ├── S3FullAccess
│   └── CloudWatchFullAccess
└── Cannot: Delete anything, modify IAM, billing
```

### Pattern 2: Lambda with S3 Access

```
Role: LambdaS3ProcessorRole
├── Trust: Lambda service
└── Policies:
    ├── S3 read from source-bucket
    └── S3 write to dest-bucket
```

### Pattern 3: Cross-Account CI/CD

```
Account A (Dev): Has app, builds for staging
Account B (Staging): Receives deployments
Account C (Prod): Receives deployments

Setup:
├── Account A has role that can assume roles in B & C
├── CI/CD pipeline assumes roles
├── Deploys to each account
└── Automatic multi-account pipeline
```

## ⚠️ Common IAM Mistakes

❌ **Root account for daily work**
→ Create IAM admin user

❌ **AWS credentials in code/git**
→ Use IAM roles for services

❌ **Same access for everyone**
→ Practice least privilege

❌ **Permanent access keys**
→ Use temporary credentials/roles

❌ **No audit trail**
→ Enable CloudTrail

❌ **Admin access for developers**
→ Restrict to necessary permissions

## 🎯 Key Takeaways

✅ IAM controls access to AWS resources
✅ Users/Groups/Roles/Policies model
✅ ARNs identify resources
✅ Least privilege principle
✅ Root account = emergency only
✅ Roles better than access keys
✅ CloudTrail for auditing
✅ MFA for everyone

## 🚀 Hands-On Exercise

1. ☑️ Create IAM admin user (named my-admin)
2. ☑️ Set console password
3. ☑️ Enable MFA
4. ☑️ Create security credentials
5. ☑️ Configure AWS CLI with credentials
6. ☑️ Create developer group with PowerUserAccess
7. ☑️ Create developer user, add to group
8. ☑️ Review CloudTrail for audit

---

**IAM is the security foundation of AWS. Take it seriously!**

---

[← Previous: Container Services - ECS & EKS](21-container-services.md) | [Contents](README.md) | [Next: Security Best Practices →](23-security-best-practices.md)
