# AWS Pricing & Cost Management

## Understanding AWS Billing Model

### Core Principle: Pay-as-You-Go

```
Traditional IT:          AWS:
Year 1: $50,000         Month 1: $50
Year 2: $50,000         Month 2: $120
Year 3: $50,000         Month 3: $45
+ Maintenance           + Scale automatically
+ Upgrades
+ Downtime risks
───────────────
$150,000+               = Pay what you use
```

## The Three Pricing Models

### 1. On-Demand (Most Flexible)

Pay per unit of time (hourly, minutely):

```bash
EC2 t2.micro:      $0.0116 per hour
RDS db.t2.micro:   $0.017 per hour  
S3 storage:        $0.023 per GB/month
Lambda:            $0.0000002 per request

No commitment → Most expensive per unit
```

**Best for:**
- Development environments
- Unpredictable workloads
- Short-term projects
- Learning/testing

### 2. Reserved Instances (RI) - Best Savings

Commit to 1 or 3 years for significant discount:

```
On-Demand pricing:   1 hour = $0.10

1-year Standard RI:  1 year = $438
                     = $0.05/hour (50% discount)

3-year Standard RI:  3 years = $876
                     = $0.033/hour (67% discount)
```

**Options:**
- **Standard RI** - Flexible region/instance type changes
- **Convertible RI** - Change instance family (10% less discount)
- **Scheduled RI** - Reserved for specific time windows

**Best for:**
- Stable baseline workloads
- Known capacity needs
- Cost optimization
- Production environments

### 3. Spot Instances (Maximum Savings)

Bid for spare capacity:

```bash
On-Demand:  $0.10/hour
Spot:       $0.03/hour (70% discount!)

BUT: Can be interrupted with 2-min notice
```

**Best for:**
- Batch processing
- Testing
- Non-critical workloads
- Fault-tolerant applications
- Research/analytics

## Pricing Components

### EC2 Compute (Virtual Machines)

```bash
Factors affecting price:
├── Instance type/size
│   ├── t2.micro (burstable, cheap)
│   ├── m5.large (general purpose)
│   └── c5.xlarge (compute optimized)
├── Region
│   ├── us-east-1: cheapest
│   ├── eu-west-1: +15%
│   └── ap-south-1: +25%
├── Operating system
│   ├── Linux: $0.0116/hr
│   ├── Windows: $0.0210/hr (+80%)
│   └── Custom AMI: varies
└── Capacity reservation
    ├── On-demand: highest
    ├── RI: -50%
    └── Spot: -70%

Example: t2.micro Linux in us-east-1
Running 730 hours (1 month):
= $0.0116 × 730 = $8.47/month ✅ (Free tier!)
```

### S3 Storage

```bash
Storage costs (per GB/month):
├── Standard:              $0.023
├── Infrequent Access:     $0.0125 (cheaper storage, retrieval fees)
├── Glacier:               $0.004 (archival, very cheap)
└── Glacier Deep Archive:  $0.00099 (rarely accessed)

Example: 100 GB of large files
Standard:        100 × $0.023 = $2.30/month
Infrequent:      100 × $0.0125 = $1.25/month
Glacier:         100 × $0.004 = $0.40/month
Glacier Deep:    100 × $0.00099 = $0.10/month
```

### Data Transfer

```bash
Inbound traffic (FROM internet):    FREE
Outbound traffic (TO internet):     First 1GB free, then $0.09/GB
Same AZ:                             FREE
Between AZs:                         $0.01/GB
Between regions:                     $0.02+/GB
CloudFront:                          $0.085/GB (cheaper for popular content)

BIG COST FACTOR! Minimize outbound traffic!
```

### RDS Database

```bash
Multi-AZ RDS (most common):
db.t3.micro:     $0.034/hour or $24.84/month
db.m5.large:     $0.366/hour or $267.12/month
db.r5.xlarge:    $0.756/hour or $552.24/month

+ Storage:       $0.23/GB/month (first 20GB free)
+ Backups:       $0.10/GB/month
+ Multi-AZ:      +100% (standby replica)
```

### Lambda (Serverless)

```bash
NOT hourly billing! Instead:

Requests:    $0.0000002 per request
Duration:    $0.0000166667 per GB-second

Example: 1 million requests, 1 second each, 256MB
Requests:  1,000,000 × $0.0000002 = $0.20
Duration:  1,000,000 × 1 × 0.25 GB × $0.0000166667 = $4.17
────────────────────────────────────────────────
Total: $4.37 (for 1 million executions!)
```

## Free Tier Benefits (12 months)

### Always Free

```bash
Lambda:        1,000,000 requests/month (forever free!)
SNS:           1,000,000 notifications/month (forever free!)
SQS:           Some free tier included
CloudWatch:    3 free alarms (forever!)
S3:            12 months free (50GB)
```

### 12-Month Promotional

```bash
EC2:           750 hours/month (t2.micro only)
RDS:           750 hours/month (t2.micro only)
EBS:           30GB/month (standard)
Data transfer: 1GB/month outbound
```

### Limited Trial

```bash
Elastic Beanstalk:    Free to use
Auto Scaling:         Free service (pay for resources)
CloudFormation:       Free service
IAM:                  Free service
```

## Pricing Calculators

### Official AWS Pricing Calculator

1. Go to https://calculator.aws
2. Add services
3. Configure usage
4. Generate estimate
5. Share or save

Example calculation:
```
Services:
├── EC2 (2 × t2.micro, always-on): $16.94/month
├── RDS (db.t3.micro, Multi-AZ): $49.68/month
├── S3 (100GB storage): $2.30/month
├── Data transfer (50GB out): $4.50/month
└── Elastic IP (unused): $3.65/month
────────────────────────────────
Total: ~$77/month

With Reserved Instances: ~$45/month (42% savings!)
```

## Cost Optimization Strategies

### 1. **Right-Sizing**

Choose appropriate instance size:

```bash
Currently:  m5.xlarge (4 vCPU, 16GB RAM)
Actual use: 10% CPU, 5% memory

Action: Downsize to t2.large
Savings: ~70% ($366 → $110/month)

TIP: Monitor CloudWatch metrics; downsize if possible
```

### 2. **Use Spot Instances for Non-Critical**

```bash
Production:      On-Demand
Batch jobs:      Spot Instances (save 70%)
Dev/test:        Spot Instances
```

### 3. **Reserved Instances for Baseline**

```bash
Min capacity guaranteed:  → Reserved Instance
Variable workload:        → On-Demand
Seasonal peaks:           → Spot Instances
```

### 4. **Storage Tiering**

```bash
Hot data (recent files):         S3 Standard
Warm data (accessed monthly):    S3-IA (Infrequent Access)
Cold data (audits, archives):    S3 Glacier
```

### 5. **Close Unused Resources**

```bash
❌ Unused Elastic IPs (costs $3.65/month!)
❌ Unattached EBS volumes
❌ Unused NAT gateways ($32/month!)
❌ Old snapshots
❌ Idle databases

Use AWS Trusted Advisor → find unused resources
```

### 6. **Consolidate Data Transfer**

```bash
❌ Don't transfer between regions for each request
✅ Batch transfers once daily
❌ Don't serve large files via EC2
✅ Use S3 + CloudFront (cheaper)
```

## Monitoring Costs

### Billing Dashboard

```bash
1. AWS Console → Billing
2. View current/estimated charges
3. See service breakdown
4. Check month-to-date spend
```

### Cost Anomaly Detection

```bash
CloudWatch → Anomaly Detection
AI detects unusual spending patterns
Email alert if something seems wrong
Great for catching runaway resources!
```

### Budget Alerts

```bash
1. Budgets → Create budget
2. Set monthly spending limit: $100
3. Alert at 80% ($80 spent)
4. Alert at 100% ($100 reached)
5. Stop-the-bleeding: Auto-terminate resources
```

### Cost Explorer

```bash
Visualize spending patterns:
- By service
- By account
- By region
- Over time
```

## Real-World Cost Examples

### Small Startup Blog

```bash
Web server:
  EC2 t2.micro (RI)        $5/month
  S3 storage (1GB)         $0.02/month
  CloudFront              $0.50/month
  RDS (none, use S3)      $0
─────────────────────────────────
Total: ~$5.50/month
```

### Medium Web Application

```bash
Compute:
  2× m5.large + ALB       $70/month
Database:
  RDS multi-AZ            $60/month
Storage/CDN:
  S3 + CloudFront         $15/month
Data transfer:            $10/month
─────────────────────────────────
Total: ~$155/month
With RI: ~$100/month (35% savings)
```

### High-Traffic E-Commerce (Peak)

```bash
Compute:
  Auto-scaled: 10-50 instances  $500/month
Database:
  RDS cluster               $200/month
Cache:
  ElastiCache             $50/month
CDN:
  CloudFront (100TB)      $8000/month
─────────────────────────────────
Total: ~$8750/month (variable!)
```

## ⚠️ Cost Surprises to Avoid

❌ **Forgetting to deallocate Elastic IPs** → Costs $3.65/month

❌ **Running NAT Gateway constantly** → $32/month per gateway

❌ **Large VPC Flow Logs without filtering** → Can cost $100s

❌ **Expensive EC2 Instance types** → m5.4xlarge = $800/month!

❌ **Cross-region data transfer** → $0.02/GB adds up fast

❌ **Unused RDS snapshots** → $0.10/GB/month for storage

❌ **High EC2 data transfer** → Data going OUT costs $0.09/GB

## 🎯 Key Takeaways

✅ AWS uses pay-as-you-go pricing model
✅ On-Demand (most flexible), Reserved (save 50-70%), Spot (save 70%)
✅ Always use AWS Pricing Calculator before deploying
✅ Free tier: 750hrs EC2/RDS, Lambda forever free
✅ Data transfer costs are hidden killer - minimize it!
✅ Use Reserved Instances for baseline stable workload
✅ Set up billing alerts to catch surprises
✅ Right-size instances regularly
✅ Archive old data to Glacier/Deep Archive

## 🚀 Action Items

1. ☑️ Create billing alert (set at $50)
2. ☑️ Review AWS Pricing Calculator
3. ☑️ Estimate cost of your workload
4. ☑️ Enable free tier alerts
5. ☑️ Check Trusted Advisor weekly

---

**Remember:** Proper cost management can reduce AWS bills by 30-50% without sacrificing performance!

---

[← Previous: AWS Global Infrastructure](03-global-infrastructure.md) | [Contents](README.md) | [Next: EC2 Basics - Virtual Machines →](05-ec2-basics.md)
