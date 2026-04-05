# Introduction to AWS

## 1. What is AWS?

Amazon Web Services (AWS) is a **cloud computing platform** offering on-demand compute, storage, networking, and database services over the internet. You pay only for what you use — no upfront capital expenditure.

### Why Cloud?

- **Scalability** — Grow or shrink resources instantly.
- **Cost** — Pay-per-use, no unused capacity.
- **Global reach** — Deploy in 30+ regions worldwide.
- **Managed services** — AWS handles infrastructure, patching, backups.
- **Innovation** — Access cutting-edge AI, ML, analytics services.

### AWS vs On-Premises

| Aspect | On-Premises | AWS |
|--------|-------------|-----|
| **CapEx** | High upfront cost | Low, pay as you grow |
| **Scaling** | Weeks to months | Minutes to hours |
| **Maintenance** | You manage everything | AWS manages infrastructure |
| **Global deployment** | Difficult, expensive | Easy, one-click |
| **Security responsibility** | 100% yours | Shared responsibility |

---

## 2. The Shared Responsibility Model

### AWS Responsibility (Security **OF** the Cloud)
- Physical infrastructure (data centers, hardware)
- Network infrastructure (routers, switches, firewalls)
- Virtualization layer (hypervisors, networking)
- Managed service engines (RDS database software, DynamoDB engine)

### Your Responsibility (Security **IN** the Cloud)
- Guest OS (patching, updates)
- Application code and dependencies
- Data (encryption, classification)
- Network configuration (security groups, NACLs, VPN)
- Access control (IAM users, roles, policies)
- Encryption at rest and in transit

### Service-Specific Responsibility

**IaaS (Infrastructure as a Service)** — Most responsibility on you
```
┌─────────────────────┐
│   Applications      │ ← Your responsibility
│   Data              │ ← Your responsibility
│   Runtime           │ ← Your responsibility
│   OS                │ ← Your responsibility
│   Virtualization    │ ← AWS handles
│   Hardware          │ ← AWS handles
└─────────────────────┘
```

**PaaS (Platform as a Service)** — Shared responsibility
```
┌─────────────────────┐
│   Applications      │ ← Your responsibility
│   Data              │ ← Your responsibility
│   Runtime           │ ← AWS handles
│   OS                │ ← AWS handles
│   Virtualization    │ ← AWS handles
│   Hardware          │ ← AWS handles
└─────────────────────┘
```

**SaaS (Software as a Service)** — Minimal responsibility on you
```
┌─────────────────────┐
│   Applications      │ ← AWS handles
│   Data              │ ← Your responsibility (trust & compliance)
│   Runtime           │ ← AWS handles
│   OS                │ ← AWS handles
│   Virtualization    │ ← AWS handles
│   Hardware          │ ← AWS handles
└─────────────────────┘
```

**Examples per model:**
- **IaaS**: EC2 (you manage OS + app), VPC (you manage networking)
- **PaaS**: Elastic Beanstalk (AWS manages deployment), RDS (AWS manages database software)
- **SaaS**: Cognito (user auth managed by AWS), S3 (just upload & forget)

---

## 3. AWS Global Infrastructure

### Regions
- 33 launched regions (as of 2024)
- Each region is **geographically isolated** — data stays there unless replicated
- Choose region based on: latency (users), compliance (GDPR → EU), cost (cheaper in US), service availability

### Availability Zones (AZs)
- 3+ independent data centers per region (same AZ are isolated)
- Connected by private high-speed networking (low latency)
- Design for: run across 2+ AZs for high availability

### Edge Locations
- 500+ CloudFront edge locations for content delivery
- Lower latency for end-user content delivery

### Local Zones
- Ultra-low latency compute (1-digit milliseconds) near major cities
- Example: Los Angeles, Boston, New York

### Wavelength Zones
- 5G edge computing for ultra-low latency mobile apps

### 📊 Key Regions for Interviews

| Region Code | Name | Common Use |
|---|---|---|
| **us-east-1** | N. Virginia | Primary US region, cheapest |
| **us-west-2** | Oregon | West Coast, low latency west coast apps |
| **eu-west-1** | Ireland | EU/GDPR compliance |
| **ap-south-1** | Mumbai | Asia-Pacific |
| **ap-southeast-1** | Singapore | APAC gateway |
| **eu-central-1** | Frankfurt | Germany/GDPR |

---

## 4. Core AWS Services Classification

### Compute
- **EC2** — Virtual machines (IaaS)
- **Lambda** — Serverless functions (FaaS)
- **ECS/EKS** — Container orchestration
- **Elastic Beanstalk** — Managed deployment (PaaS)

### Storage
- **S3** — Object storage (buckets)
- **EBS** — Block storage (like hard disk)
- **EFS** — Network file system (NFS)
- **Glacier** — Archive storage

### Database
- **RDS** — Relational databases (MySQL, PostgreSQL, Oracle, SQL Server)
- **DynamoDB** — NoSQL key-value store
- **ElastiCache** — In-memory cache (Redis, Memcached)
- **Redshift** — Data warehouse (OLAP)

### Networking
- **VPC** — Virtual private cloud
- **Route 53** — Managed DNS
- **CloudFront** — Content delivery (CDN)
- **ELB** — Load balancing (ALB, NLB, CLB)
- **Direct Connect** — Dedicated network connection
- **VPN** — Encrypted site-to-site connection

### Developer Tools
- **CodePipeline** — CI/CD orchestration
- **CodeBuild** — Build service
- **CodeDeploy** — Deployment service
- **CloudFormation** — Infrastructure as Code
- **Systems Manager** — Fleet management

### Monitoring & Observability
- **CloudWatch** — Metrics, logs, alarms
- **CloudTrail** — API audit logging
- **X-Ray** — Distributed tracing
- **Config** — Configuration compliance

### Messaging & Integration
- **SQS** — Message queue (decoupling)
- **SNS** — Pub/sub notifications
- **Kinesis** — Real-time streaming
- **EventBridge** — Event routing

### Security & Identity
- **IAM** — Identity & Access Management
- **KMS** — Key management
- **Secrets Manager** — Secret rotation
- **Cognito** — User authentication
- **WAF** — Web application firewall

---

## 5. Getting Started: AWS Account Setup

### 🔐 Create an AWS Account

```
1. Go to https://aws.amazon.com/
2. Click "Create an AWS Account"
3. Email, password, AWS account name
4. Payment method (credit card required, won't charge for free tier)
5. Verify identity (phone call or SMS)
6. Select Free, Basic, or Business support plan
7. → Complete sign up
```

### 🔑 First Steps After Sign Up

1. **Enable MFA on root account** (security best practice)
   - Console → Account → Security Credentials → Multi-factor authentication (MFA)

2. **Create an IAM user for daily use** (never use root account)
   - Console → IAM → Users → Create user
   - Attach policy: AdministratorAccess (for learning)
   - Generate access key ID + secret key

3. **Set up AWS CLI** (command-line access)
   ```bash
   # Install AWS CLI v2
   curl "https://awscli.amazonaws.com/awscli-exe-linux-x86_64.zip" -o "awscliv2.zip"
   unzip awscliv2.zip
   sudo ./aws/install

   # Configure with your IAM credentials
   aws configure
   # Enter: Access Key ID, Secret Access Key, default region (e.g., ap-south-1), output format (json)
   ```

4. **Set region preference**
   ```bash
   # Set default region
   aws configure set region ap-south-1

   # Or use per-command
   aws ec2 describe-instances --region us-east-1
   ```

### 📟 Console — View AWS Account Info

```
1. Click your account name (top-right) → Account
2. View: Account ID, Account alias, contact info, billing status
3. Set region (top-right dropdowns)
```

### 💻 CLI — Query Account Info

```bash
# Get account ID and user ARN
aws sts get-caller-identity

# Output:
# {
#   "UserId": "AIDAI...",
#   "Account": "123456789012",
#   "Arn": "arn:aws:iam::123456789012:user/my-user"
# }

# List all regions
aws ec2 describe-regions --query 'Regions[].RegionName' --output text

# List availability zones in current region
aws ec2 describe-availability-zones --query 'AvailabilityZones[].ZoneName' --output text
```

---

## 6. AWS Free Tier

AWS offers a generous **Free Tier** (12 months from account creation):

### Always Free (no time limit)
- **EC2**: 750 hours/month t2.micro instance
- **S3**: 5 GB storage
- **DynamoDB**: 25 GB storage
- **Lambda**: 1 million requests/month, 400,000 compute seconds/month
- **RDS**: 750 hours/month t2.micro single-AZ

### Free for 12 Months
- **Elastic Load Balancing**: 750 hours/month (ALB)
- **CloudFront**: 50 GB data transfer

### Trial Services (limited credit)
- Some services offer $5-300 free credits for trial

**Pro Tip**: Monitor your usage via [AWS Billing Dashboard](https://console.aws.amazon.com/billing/) to avoid surprise charges.

---

## 7. Cost Management

### Key Concepts

**Compute**: EC2, Lambda, ECS
- **On-Demand**: Pay per hour (highest cost)
- **Reserved Instances (RI)**: Commit for 1–3 years, 30–72% discount
- **Savings Plans**: Hourly usage commitment, all compute services, 30–72% discount
- **Spot**: 70–90% discount but can be interrupted

**Storage**: S3, EBS, Glacier
- **S3 Standard**: $0.023/GB/month
- **S3 Standard-IA**: $0.0125/GB/month + retrieval fee
- **Glacier**: $0.004/GB/month + retrieval fee
- **EBS**: $0.10/GB/month

**Data Transfer**
- **In (to AWS)**: Free
- **Out (from AWS)**: ~$0.09/GB (reduces to ~$0.01 at volume)
- **Same region**: Free
- **Cross-region**: Charges apply
- **CloudFront egress**: Cheaper than direct S3 egress

### Cost Optimization for Interviews

```
☑ Right-sizing: Use correct instance type (don't over-provision)
☑ Reserved Instances: Commit if workload is predictable (dev/test/prod)
☑ Spot Instances: For batch processing, non-critical workloads
☑ S3 Lifecycle: Archive old data to Glacier
☑ CloudFront: Cache content to reduce origin requests
☑ Consolidation: Use managed services (RDS instead of EC2 + DB)
☑ Management: Enable Cost Alerts, use Cost Explorer
```

### 📟 Console — Set Up Cost Alerts

```
1. Billing → Budgets → Create budget
2. Budget type: Spending
3. Budget name: monthly-limit
4. Period: Monthly
5. Budgeted amount: e.g., $100
6. Alert threshold: 80%, 100%, 120%
7. Notify via: Email
8. → Create budget
```

### 💻 CLI — Estimate Costs

```bash
# Use AWS Pricing API (no direct CLI for estimation, but get pricing info)
aws pricing describe-services \
  --service-code AmazonEC2 \
  --region ap-south-1

# Best practice: Use AWS Cost Explorer UI or calculator:
# https://calculator.aws/
```

---

## 8. AWS Support Plans

| Feature | Developer | Business | Enterprise |
|---------|-----------|----------|-----------|
| **Cost** | Free | $100–$10k/month | Custom |
| **Response time (critical)** | 24 hours | 15 min | 15 min |
| **Tech support** | Email only | Phone, chat | Dedicated TAM |
| **Best for** | Learning, testing | Production apps | Mission-critical |

---

## 9. Interview Quick Fire

**Q: What is the difference between a region and an availability zone?**
A region is a geographic area with multiple data centers (AZs). An AZ is a single data center or group of data centers in a region. Deploy across 2+ AZs for high availability.

**Q: Why shouldn't I use the root account for day-to-day work?**
The root account has unlimited permissions and cannot be restricted. If compromised, the entire account is at risk. Create IAM users with minimal required permissions (least privilege).

**Q: What is the free tier and for how long?**
AWS offers 12 months free for qualifying services (EC2, S3, RDS, etc.) after account creation, plus some always-free services (Lambda, DynamoDB limits). Monitor usage to stay within limits.

**Q: What is the shared responsibility model?**
AWS manages infrastructure; you manage security in the cloud (OS, apps, data, access). For managed services like RDS, AWS handles the database engine; you handle data and access control.

**Q: How do I estimate AWS costs?**
Use the AWS Pricing Calculator or Cost Explorer. Know the main cost drivers: compute (instance type/hours), storage (GB), data transfer (out), and API calls (some services).

**Q: What is the difference between on-demand, reserved, and spot instances?**
On-demand: pay hourly, most expensive, most flexible. Reserved: commit 1–3 years, 30–72% discount. Spot: 70–90% discount but can be terminated with short notice.

**Q: Why do I need an MFA on my root account?**
MFA (multi-factor authentication) adds a second verification layer. Even if someone gets your password, they can't access your account without the second factor (phone/hardware key).

**Q: What service should I start learning first?**
IAM (identity access), then EC2 (compute), then S3 (storage). These three form the foundation of AWS.

---

## 10. Key Takeaways

1. **Regions > AZs > Instances** — Think globally, design locally
2. **Pay for what you use** — No upfront cost, careful about data transfer
3. **Security is shared** — You're responsible for your OS, apps, and data
4. **Free tier is generous** — Get hands-on practice without spending
5. **CLI is faster than console** — Learn `aws` commands for production
6. **Monitor costs continuously** — Set budgets and alerts

---

## 11. Quick Reference Cheat Sheet

| Concept | Definition |
|---------|-----------|
| **Region** | Geographic location (us-east-1, ap-south-1) |
| **AZ** | 1+ isolated data centers in a region |
| **Edge location** | 500+ CloudFront endpoints for CDN |
| **Availability** | Designed to run across 2+ AZs |
| **Disaster Recovery** | Replicate to another region |
| **Shared Responsibility** | AWS: infra; You: OS, apps, data, access |
| **IAM** | Identity & Access Management service |
| **Root account** | Never use for day-to-day (too powerful) |
| **MFA** | Multi-factor authentication (added security) |
| **Service** | Functional offering (EC2, S3, RDS, etc.) |
| **On-demand** | Pay per hour, no commitment |
| **Reserved** | Commit 1–3 years for discount |
| **Spot** | Up to 90% discount, can be terminated |
| **Free tier** | Always free or 12 months free services |

---

*Ready to dive deeper? Start with EC2 next.* 🚀
