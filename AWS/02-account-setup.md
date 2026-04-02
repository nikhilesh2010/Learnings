# AWS Account Setup & Console Navigation

## Creating Your AWS Account

### Step 1: Sign Up

1. Go to https://aws.amazon.com
2. Click "Create an AWS Account"
3. Enter email address (use a proper email, not throwaway)
4. Create a strong password
5. Choose account type:
   - **Personal** - For learning
   - **Professional** - For business

### Step 2: Contact Information

- Enter full name
- Address (must match billing records)
- Phone number (for verification)
- Accept AWS Customer Agreement

### Step 3: Payment Method

- Add valid credit/debit card
- AWS will charge $1 to verify (refunded immediately)
- Never use debit cards for production accounts (use credit cards)

### Step 4: Identity Verification

- Choose SMS or automated phone call
- Enter verification code
- Complete verification

### Step 5: Support Plan

Free tier includes:
- **Basic Plan** - Free, community forums
- **Developer Plan** - ~$30/month, email support
- **Business Plan** - ~$100+/month, 1-hour response

For learning: Start with **Basic Plan**

## Understanding Your AWS Account

### Account ID

```
123456789012  <- Your 12-digit account ID
```

Found in:
- Account drop-down (top-right)
- Billing console
- AWS CLI config

### Root Account vs IAM Users

#### ⚠️ Root Account (Account Owner)

- **Email address** used during sign-up
- Full access to everything
- Can damage entire account if compromised
- **NEVER use for daily work**

Best practices:
```bash
✅ Only use for account management
✅ Enable Multi-Factor Authentication (MFA)
✅ Create access keys... wait, don't
✅ Use only when necessary
```

#### ✅ IAM Users (Recommended)

- Created by root account administrator
- Limited permissions as needed
- Multiple users per account
- Can have access keys, passwords, MFA

Create your first IAM user instead!

## Setting Up Your Account Securely

### Step 1: Enable MFA on Root Account

1. Go to **AWS Management Console**
2. Click root account → **Security Credentials**
3. Click **Assign MFA device**
4. Choose device type:
   - **Virtual MFA** (Google Authenticator, Authy)
   - **Hardware MFA** (Yubikey, physical device)
   - **SMS MFA** (less recommended)

### Step 2: Create IAM Admin User

```bash
1. Go to IAM Console
2. Click Users → Create user
3. Username: "admin" or your-name
4. Enable console access
5. Set strong password
6. Attach "AdministratorAccess" policy
7. Save access keys safely (CSV download)
```

### Step 3: Create an Access Key (Optional)

For programmatic access (AWS CLI, SDKs):

```bash
1. IAM Console → Users → Select user
2. Security Credentials tab
3. Create access key
4. Copy:
   - Access Key ID: AKIA...
   - Secret Access Key: (save securely!)
5. Download CSV as backup
```

⚠️ **Keep secret key safe!** It's like a password - never share!

## AWS Management Console Overview

### Top Navigation Bar

```
┌─────────────────────────────────────────────────────┐
│ [AWS Logo] [Search box] [Notifications] [Account ▼] │
└─────────────────────────────────────────────────────┘

- Search box: Quick access to services
- Notifications: Service health, billing alerts
- Help: Documentation, support tickets
- Account: Switch accounts, billing, security
```

### Left Sidebar (Service Navigation)

```
┌──────────────────────────┐
│ All services (dropdown▼) │ ← Browse all 200+ services
├──────────────────────────┤
│ Frequently used:         │
│ • EC2                    │
│ • S3                     │
│ • RDS                    │
│ • Lambda                 │
│ • VPC                    │
└──────────────────────────┘
```

### Main Content Area

Service dashboards, management interfaces, configurations

## Navigating Services

### Method 1: Search Box

```
1. Click search box (top-left)
2. Type service name: "ec2", "s3", "lambda"
3. Results appear instantly
4. Click to navigate
```

### Method 2: Browse Category

```
1. Click "All services"
2. Select category:
   - Compute
   - Storage
   - Database
   - Networking
   - ...and more
3. Click service
```

### Method 3: Recent Services

```
Most used services appear in left sidebar
Favorites can be pinned
```

## Setting Up Billing & Alerts

### 1. Enable Billing Dashboard Access

```bash
1. Root account → Account dropdown
2. My Account
3. Find "Edit" next to "IAM user access to billing"
4. Check "Activate IAM Access"
5. Users can now access Billing console
```

### 2. Create Billing Alert

```bash
1. CloudWatch Console → Alarms
2. Create New Alarm
3. Select Metric: EstimatedCharges
4. Set threshold: e.g., $50
5. Add SNS topic for email notifications
6. Receive alert if spending exceeds limit
```

### 3. Enable Free Tier Alerts

```bash
1. Billing Preferences
2. Check "Free Tier Usage Alerts"
3. Will receive alerts if approaching limits
```

## AWS Organizations (Multiple Accounts)

For managing multiple AWS accounts:

```bash
1. Root Account → AWS Organizations
2. Create organization
3. Create member accounts
4. Apply policies across accounts
5. Consolidate billing
```

Perfect for:
- Separating dev/staging/prod
- Team isolation
- Cost allocation
- Compliance requirements

## AWS Regions & Availability Zones

### Choosing a Region

1. **Latency** - Closest to users
2. **Compliance** - Data residency requirements
3. **Service Availability** - Not all services in all regions
4. **Pricing** - Varies by region

```
Most services: us-east-1 (N. Virginia)
EU workloads: eu-west-1 (Ireland)
Asia-Pacific: ap-southeast-1 (Singapore)
```

### Switching Regions

```
Top-right dropdown shows current region
Click to select different region
Most console settings are region-specific!
```

## Cost Estimation

### AWS Pricing Calculator

1. Go to https://calculator.aws
2. Select services needed
3. Configure usage parameters
4. Get monthly cost estimate
5. Share or download report

### Example Calculation

```
EC2 t2.micro (1 year reserved): $50
S3 Storage (100GB/month): $2.30
Data transfer (10GB): $0.90
─────────────────────────────
Total: ~$53.20/month
```

## ⚠️ Security Checklist

```bash
✅ Root account MFA enabled
✅ No root access keys created
✅ IAM admin user created
✅ IAM user has MFA (recommended)
✅ Billing alerts configured
✅ CloudTrail logging enabled
✅ Trusted IP range configured
✅ Review IAM policies monthly
```

## Common First Mistakes

❌ **Using root account for daily work**
→ Create IAM admin user

❌ **Forgetting to set billing alerts**
→ Can result in surprise charges

❌ **Storing access keys in code**
→ Use IAM roles instead

❌ **Same password as other services**
→ Use strong, unique password

## 🎯 Key Takeaways

✅ Create AWS account with email
✅ Enable MFA immediately  
✅ Create IAM admin user (not root)
✅ Set up billing alerts
✅ Understand regions and AZs
✅ Keep access keys secure

## 🚀 Next Steps

1. ☑️ Create AWS account
2. ☑️ Enable root MFA
3. ☑️ Create IAM admin user
4. ☑️ Set billing alert
5. ☑️ Explore console navigation

---

Your account is now ready to explore AWS services!

---

[← Previous: What is AWS?](01-introduction.md) | [Contents](README.md) | [Next: AWS Global Infrastructure →](03-global-infrastructure.md)
