# AWS-V2: Essential AWS Learning Guide

A practical, modern reference for AWS services with hands-on console steps, CLI commands, and real interview questions.

## 📚 Core Modules

Master AWS fundamentals with these essential services. Each module includes practical examples, best practices, and interview Q&A.

### Foundation (Start Here)

| # | Module | Description |
|---|--------|---|
| **01** | [Introduction](01-introduction.md) | AWS basics, global infrastructure, shared responsibility, account setup, free tier |
| **02** | [IAM](02-iam.md) | Identity & Access Management, users, roles, policies, cross-account access |
| **03** | [EC2](03-ec2.md) | Elastic Compute Cloud, instance types, security groups, key pairs, pricing models |

### Core Services (in Learning Order)

| Week | Module | Description |
|---|--------|---|
| **4** | [S3](04-s3.md) ⭐ | Simple Storage Service, buckets, storage classes, versioning, lifecycle, replication |
| **5** | [VPC](05-vpc.md) | Virtual Private Cloud, subnets, gateways, routing, security groups, NACLs |
| **6** | [RDS](06-rds.md) | Relational Database Service, multi-AZ, read replicas, backups, PITR |
| **7** | [Lambda](07-lambda.md) | Serverless compute, functions, triggers, concurrency, layers, optimization |

---

## 🎯 How to Use This Guide

Each module follows a consistent structure:

1. **Core Concepts** — Essential terminology and mental models
2. **Console Steps** (📟) — Visual, step-by-step AWS console instructions
3. **CLI Commands** (💻) — Copy-paste ready terminal commands with examples
4. **Best Practices** — Production-ready patterns and optimization tips
5. **Interview Q&A** — 10–15 common questions with detailed answers
6. **Quick Reference** — Cheat sheet with key facts and comparisons

### 📖 Recommended Study Path

**Week 1: Foundations**
- Read: [01-Introduction](01-introduction.md)
- Focus: AWS basics, global infrastructure, account setup
- Hands-on: Create AWS account, enable MFA on root, create IAM user

**Week 2: Identity & Access**
- Read: [02-IAM](02-iam.md)
- Focus: Users, roles, policies, least privilege principle
- Hands-on: Create IAM user with EC2 permissions, attach policies, generate access keys

**Week 3: Compute**
- Read: [03-EC2](03-ec2.md)
- Focus: Instances, security groups, instance types, pricing models
- Hands-on: Launch t3.micro instance, SSH in, host a web server, create AMI

**Week 4: Storage (Object Storage) ⭐ S3 SUITS HERE**
- Read: [04-S3](04-s3.md)
- Focus: Buckets, storage classes, versioning, lifecycle policies, encryption, replication, costs
- Hands-on: Create bucket, upload files, enable versioning, set lifecycle rules, create cross-region copy
- Why: S3 is the most fundamental storage service; you'll use it with EC2, Lambda, RDS, and backups

**Week 5: Networking**
- Read: [05-VPC](05-vpc.md)
- Focus: VPC architecture, public/private subnets, gateways, routing, security groups, NACLs
- Hands-on: Create VPC with 2+ AZs, configure subnets, add IGW and NAT Gateway, test connectivity
- Why: Understand network isolation before deploying databases and services

**Week 6: Databases**
- Read: [06-RDS](06-rds.md)
- Focus: RDS setup, multi-AZ, backups, read replicas, PITR recovery
- Hands-on: Launch RDS MySQL, connect from EC2, create database, enable backups to S3, create read replica
- Why: RDS integrates with VPC, IAM, S3 (backups), and CloudWatch monitoring

**Week 7: Serverless**
- Read: [07-Lambda](07-lambda.md)
- Focus: Serverless functions, triggers (S3, API, DynamoDB), concurrency, layers
- Hands-on: Create Lambda triggered by S3 upload, connect to RDS, store results back in S3
- Why: Final integration - S3 as trigger/storage, RDS as database, VPC for networking, Lambda for logic

**Interview Prep**
- Review: All modules' Q&A sections
- Practice: Design scenarios (scalable web apps, data pipelines, etc.)
- Focus areas: Trade-offs, pricing, HA/DR patterns, security considerations

---

## 📍 Where S3 Fits Exactly in AWS Architecture

S3 is a **foundational service** that connects with everything:

```
┌─ Week 1-3: Foundation (IAM, EC2)
│   ↓
└─ Week 4: STORAGE ← S3 SUITS HERE ⭐
   │
   ├─ Stores: Application data, static files, backups, archives
   ├─ Integrates with: EC2 (read/write), Lambda (trigger + storage), RDS (backups)
   ├─ Key use cases: 
   │  • Backup EC2 configuration
   │  • Store Lambda layer dependencies
   │  • Archive RDS automated backups
   │  • Serve static website content
   │  • Data lake for analytics
   │
   ↓
   Week 5: VPC (Networking) ← S3 access from private subnets
   ↓
   Week 6: RDS (Databases) ← S3 for backups + restore
   ↓
   Week 7: Lambda (Serverless) ← S3 as trigger + storage layer
```

### Why S3 in Week 4?

| Reason | Explanation |
|--------|-----------|
| **Prerequisite for EC2** | Want to back up EC2 data? Use S3 |
| **Before Databases** | RDS automated backups go to S3 |
| **Before Lambda** | Lambda functions store outputs in S3; S3 triggers Lambda |
| **Fundamental storage** | More essential than VPC or RDS; simpler to learn first |
| **Cost impact** | Understanding S3 lifecycle/storage classes saves money across entire architecture |

---

## 🔑 Key AWS Concepts (Quick Reference)

### Regions & Availability Zones
- **Region**: Geographic location where AWS services run (e.g., us-east-1, ap-south-1)
- **Availability Zone (AZ)**: Independent data center within a region (always deploy across 2+ AZs for HA)
- **Local Zone**: Ultra-low latency compute near major cities (optional, specialized)

### High Availability (HA) vs Disaster Recovery (DR)

| Concept | Definition | Scope |
|---------|-----------|-------|
| **HA** | System runs continuously with minimal downtime | Same region, auto-failover |
| **DR** | Recover from catastrophic failure | Cross-region, manual/semi-auto |
| **RTO** | Recovery Time Objective (how fast to restore) | Measured in minutes/hours |
| **RPO** | Recovery Point Objective (max acceptable data loss) | Measured in hours/days |

### Shared Responsibility Model

**AWS Manages:**
- Physical infrastructure, data centers, hardware
- Network infrastructure, security of infrastructure
- Managed service engines (RDS database software, Lambda runtime, etc.)

**You Manage:**
- Guest OS (if using EC2), application code, dependencies
- Data (encryption, classification, backup strategy)
- Network configuration (security groups, NACLs, VPC design)
- Identity and Access Control (IAM users, roles, policies)

### Cost Optimization Strategy

| Layer | Action |
|-------|--------|
| **Compute** | Use RI/Savings Plans for steady-state; Spot for flexible; Lambda for event-driven |
| **Storage** | Lifecycle policies (move to cheaper tiers), compress data, use S3 Intelligent-Tiering |
| **Data Transfer** | CloudFront caching, same-region transfers, minimize cross-region |
| **Monitoring** | AWS Cost Explorer, right-sizing recommendations, tag resources for tracking |

---

## 💻 Setting Up Your Environment

### 1. Create AWS Account
```
1. Go to https://aws.amazon.com
2. Click "Create an AWS Account"
3. Verify email, add payment method
4. Verify phone number
5. Choose support plan (free is fine for learning)
```

### 2. Secure Root Account
```
1. Sign in as root
2. Account → Security Credentials
3. Enable Multi-Factor Authentication (MFA)
4. Create IAM user for daily use (never use root!)
```

### 3. Install AWS CLI
```bash
# Windows/Mac/Linux universal install
curl "https://awscli.amazonaws.com/awscli-exe-linux-x86_64.zip" -o "awscliv2.zip"
unzip awscliv2.zip
sudo ./aws/install

# Configure with IAM user credentials
aws configure
# Enter: Access Key ID, Secret Access Key, default region (ap-south-1), output format (json)
```

### 4. Test Installation
```bash
# Verify setup
aws sts get-caller-identity

# Should output:
# {
#   "UserId": "AIDAI...",
#   "Account": "123456789012",
#   "Arn": "arn:aws:iam::123456789012:user/your-user"
# }
```

---

## 📊 AWS Service Comparison Summary

| Service | Type | Best For | Cost Model |
|---------|------|----------|------------|
| **EC2** | IaaS | Full server control, long-running apps | Per hour |
| **Lambda** | FaaS | Event-driven, serverless | Per invocation |
| **RDS** | Managed DB | SQL databases, HA/replication built-in | Per instance |
| **S3** | Object Storage | Unstructured data, backups, archives | Per GB/month |
| **VPC** | Networking | Private network, security isolation | No charge |
| **IAM** | Identity | Access control, security | No charge |

---

## 🚀 First Hands-On Steps

1. **Create EC2 instance** (Week 1-2)
   - Launch t3.micro instance (free tier eligible)
   - SSH in from your computer
   - Host a simple web server
   - Terminate when done

2. **Create S3 bucket** (Week 2-3)
   - Create bucket (unique global name)
   - Upload files (photos, documents, backups)
   - Set versioning and lifecycle policies
   - Enable static website hosting (optional)

3. **Launch RDS database** (Week 3-4)
   - Create MySQL instance (free tier)
   - Connect from EC2 instance
   - Create database and load sample data
   - Create read replica and multi-AZ replica

4. **Build with Lambda** (Week 4-5)
   - Create Python function
   - Trigger with S3 upload
   - Add layers (dependencies)
   - Monitor with CloudWatch Logs

5. **Design a VPC** (Week 5-6)
   - Create VPC with 2+ subnets across AZs
   - Configure public/private subnets
   - Add NAT Gateway for private egress
   - Test connectivity between subnets

---

## ⚡ Common AWS Commands Quick Reference

```bash
# Account & Identity
aws sts get-caller-identity                    # Who am I?
aws iam list-users                             # List all IAM users
aws iam get-user --user-name myuser            # Get specific user

# EC2
aws ec2 describe-instances --region ap-south-1         # List instances
aws ec2 run-instances --image-id ami-xyz --instance-type t3.micro  # Launch
aws ec2 stop-instances --instance-ids i-xyz   # Stop instance
aws ec2 terminate-instances --instance-ids i-xyz  # Delete instance

# S3
aws s3 ls                                      # List all buckets
aws s3 mb s3://my-unique-bucket-name           # Create bucket
aws s3 cp file.txt s3://bucket/                # Upload file
aws s3 sync ./folder s3://bucket/folder        # Sync directory

# RDS
aws rds describe-db-instances --region ap-south-1  # List databases
aws rds create-db-instance \
  --db-instance-identifier mydb \
  --engine mysql \
  --master-username admin \
  --master-user-password Password123!  # Create database

# VPC
aws ec2 describe-vpcs                          # List VPCs
aws ec2 create-vpc --cidr-block 10.0.0.0/16   # Create VPC

# Lambda
aws lambda list-functions                      # List functions
aws lambda invoke --function-name myfunction response.json  # Test function
```

---

## 💡 Essential Interview Patterns

### Scenario 1: Design a Scalable Web Application for 1M Users

**Your Answer Framework:**
1. **Compute**: EC2 behind ALB with Auto Scaling Group
2. **Database**: RDS Multi-AZ for relational data + ElastiCache for session cache
3. **Storage**: S3 for static assets (images, videos)
4. **CDN**: CloudFront in front of S3 + ALB
5. **DNS**: Route 53 for failover and geo-routing
6. **Security**: VPC with public/private subnets, security groups, NACLs, IAM roles

### Scenario 2: Migrate On-Premises Database to AWS

**Your Answer Framework:**
1. **Create RDS instance** (same or newer version of on-prem database)
2. **Create read replica** from on-premises (AWS DMS or native replication)
3. **Wait for sync** (zero replication lag)
4. **Switch application** to point to RDS endpoint
5. **Verify data** (row counts, checksums)
6. **Decommission** on-premises database after validation period

### Scenario 3: Minimize Cost of Data Storage

**Your Answer Framework:**
1. **S3 Lifecycle policies**: Move to Standard-IA after 30 days, Glacier after 90 days
2. **Intelligent-Tiering**: For unpredictable access patterns
3. **Compress data**: gzip reduces size by 50-80%
4. **Delete old versions**: Enable versioning but set expiration on non-current versions
5. **Monitor**: Use S3 Storage Lens to find cold/unused data

### Scenario 4: Ensure High Availability

**Your Answer Framework:**
1. **Multi-AZ**: RDS multi-AZ, ALB across AZs
2. **Auto Scaling**: Replace failed instances automatically
3. **Read Replicas**: Distribute reads across regions
4. **Backup Strategy**: Daily automated backups + cross-region snapshots
5. **Monitoring**: CloudWatch alarms on key metrics (CPU, connections, disk)

### Scenario 5: Secure the Application

**Your Answer Framework:**
1. **IAM**: Least privilege roles, avoid root account, MFA
2. **Data in Transit**: HTTPS/TLS everywhere (enforce in bucket policies)
3. **Data at Rest**: SSE-KMS encryption for S3/RDS
4. **Secrets**: Use AWS Secrets Manager (not environment variables)
5. **Network**: VPC isolation, security groups, NACLs, WAF if needed
6. **Audit**: CloudTrail for all API calls, VPC Flow Logs for network

---

## 📚 Key Concepts Glossary

| Term | Definition |
|------|-----------|
| **AMI** | Amazon Machine Image - template for EC2 instances |
| **ARN** | Amazon Resource Name - unique identifier for AWS resources |
| **Auto Scaling Group** | Automatically add/remove EC2 instances based on load |
| **CloudFront** | Content Delivery Network - cache content at edge locations |
| **IAM Policy** | JSON document defining permissions (allow/deny) |
| **Instance Profile** | Container for IAM role attached to EC2 instance |
| **Lifecycle Policy** | Automate moving/deleting objects based on age |
| **Multi-AZ** | Deploy standby in different AZ for high availability |
| **NAT Gateway** | Allows private subnet to initiate outbound internet connections |
| **PITR** | Point-In-Time Recovery - restore database to any second in retention window |
| **Read Replica** | Async copy of database for scaling reads |
| **Security Group** | Instance-level stateful firewall |
| **Snapshot** | Point-in-time backup of an EBS volume or RDS database |
| **VPC** | Virtual Private Cloud - isolated network you control |

---

## 🎓 Next Steps After Core Modules

Once you master these 7 modules, consider:

| Next Area | Why | When |
|-----------|-----|------|
| **DynamoDB** | NoSQL for ultra-fast, scalable apps | After SQL fundamentals |
| **CloudFront & CDN** | Global performance optimization | After S3 mastery |
| **Auto Scaling & ALB** | Build HA architectures | After EC2 + VPC |
| **CloudWatch & Monitoring** | Production readiness - critical! | In parallel with everything |
| **CloudFormation/Terraform** | Infrastructure as Code - real DevOps | After 2-3 services |
| **Containers (ECS/EKS)** | Modern deployment patterns | After Docker basics |

---

## ✅ Quick Self-Assessment

- [ ] I can create an IAM user and attach policies
- [ ] I can launch an EC2 instance and SSH into it
- [ ] I understand VPC subnets, public/private, routing
- [ ] I can create and manage S3 buckets with lifecycle policies
- [ ] I can launch an RDS database and create read replicas
- [ ] I can write and deploy a Lambda function
- [ ] I know the trade-offs between different AWS services
- [ ] I can estimate costs for a simple 3-tier application
- [ ] I can design for high availability and disaster recovery
- [ ] I can answer all Q&A sections in each module

**All checked?** → You're ready for AWS certification or senior engineering interviews! 🎉

---

## 🔗 Quick Links

- **AWS Console**: https://console.aws.amazon.com
- **AWS Free Tier**: https://aws.amazon.com/free/
- **AWS CLI Docs**: https://docs.aws.amazon.com/cli/
- **AWS SDK**: Choose your language at https://aws.amazon.com/tools/
- **AWS Cost Calculator**: https://calculator.aws/
- **AWS Well-Architected Framework**: https://aws.amazon.com/architecture/well-architected/

---

**Learning path: Foundation (Week 1-2) → Core Services (Week 3-6) → Advanced (Week 7+)**

**Remember: The best way to learn AWS is by doing. Create resources, break things, fix them, repeat.** 🚀
