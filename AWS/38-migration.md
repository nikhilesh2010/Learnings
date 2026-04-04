# Migration - Moving to AWS

## Migration Strategies

**What:** How to move applications from on-premises to AWS.

**Why we use it:** Leverage cloud benefits for existing systems.

**How it works - 6 Rs Framework:**

```
1. Rehost (Lift & Shift):
   ├── Move VM image directly to EC2
   ├── Minimal changes
   ├── Effort: Low
   ├── Cost savings: 10-30%
   └── Timeline: Weeks

2. Replatform (Lift, Tinker & Shift):
   ├── Move to managed services
   ├── On-prem MySQL → RDS MySQL
   ├── Some refactoring needed
   ├── Effort: Medium
   ├── Cost savings: 20-40%
   └── Timeline: Months

3. Refactor (Re-architect):
   ├── Redesign for cloud
   ├── Monolith → Microservices
   ├── Lambda, serverless
   ├── Effort: High
   ├── Cost savings: 40-60%
   └── Timeline: 6+ months

4. Repurchase (SaaS):
   ├── Replace with SaaS
   ├── On-prem CRM → Salesforce
   ├── Effort: Medium
   └── Exit maintenance costs

5. Retire:
   ├── Shut down old app
   ├── No longer needed
   └── Eliminate costs!

6. Retain (Hybrid):
   ├── Keep on-premises
   ├── Not cloud-ready yet
   └── Revisit later
```

**Simple example:**

```
Migrate web application:

Rehost approach (fast):
1. Snapshot VM on-premises
2. Convert to EC2 AMI
3. Launch on AWS
Timeline: 1 week
Cost: Still paying AWS compute

Refactor approach (optimized):
1. Analyze architecture
2. Split monolith into services
3. Use Lambda + API Gateway
4. Use RDS + DynamoDB
Timeline: 6 months
Cost: 50% lower, better performance
```

### Choosing Strategy

```
Application assessment:
├── Business criticality
├── Technical complexity
├── Interdependencies
└── ROI timeline

Scoring:
High value + Low complexity
  └── Rehost first (quick wins)

High value + High complexity
  └── Refactor (worth investment)

Low value + Any complexity
  └── Retire or retain
```

## AWS Migration Accelerator Program (MAP)

```
Free AWS support:
├── Migration assessment
├── Partner recommendations
├── Technical guidance
└── Funding for migration

Eligibility:
├── Enterprise customers
├── Significant cloud commitment
└── 1000+ servers typically

Process:
1. Assessment phase
2. Migration planning
3. Execution phase (with AWS partner)
4. Optimization phase
```

## On-Premises to AWS

### Database Migration Service (DMS)

```
Migrate database:

Source:
└── MySQL (on-premises)
    └── 500GB data

Target:
└── RDS MySQL (AWS)

DMS setup:
├── Create DMS replication instance
├── Define source/target endpoints
├── Create migration task
├── Full load + CDC (ongoing changes)
└── Minimal downtime!

Cost:
├── DMS instance: $0.30/hour (dms.t3.micro)
├── Data transfer: $0.02/GB
└── Typical migration: $100-500
```

### Rehost Using AWS Application Discovery Service

```
Scan on-premises servers:

Agentless:
├── Network-based discovery
├── Map applications
├── Understand dependencies

Discover:
├── What servers exist
├── CPU/Memory usage patterns
├── Network connections
└── Dependencies between apps

Plan:
├── Group related servers (dependencies)
├── Plan migration sequence
├── Size EC2 instances appropriately
└── Estimate costs
```

### VM Import/Export

```
Import VM image:

On-premises VM:
└── VMware/Hyper-V image

Upload to S3:
aws ec2 import-image \
  --description "web-server" \
  --disk-containers DeviceName=/dev/sda1,UserBucket={S3Bucket=uploads,S3Key=web-server.ova}

Result:
  └── EC2 AMI (ready to launch)

Timeline:
├── 30 GB image: ~30 minutes
└── Set up and then launch instance
```

## Snowball - Physical Data Transfer

```
Problem: Internet too slow
├── 1 TB data
├── 50 Mbps upload
├── 200+ hours (8+ days!)

Solution: AWS Snowball
├── Physical hard drive (50-80TB)
├── AWS ships to you
├── You load data
├── Ship back to AWS
├── AWS loads to S3

Timeline:
└── 2 weeks total (vs. 8 days upload)

Cost:
├── Snowball: $200 per device
├── Fast vs. waiting
└── Good for large data

Use for:
├── >100 GB datasets
├── Slow internet
└── One-time migration
```

## Network Connectivity

### VPN-Based Migration

```
Site-to-Site VPN:
├── On-premises → AWS
├── 1-2 Gbps throughput
├── Setup: Hours
└── Existing internet

Cost: $40/month
```

### Direct Connect-Based Migration

```
Direct Connect:
├── Dedicated connection
├── 1, 10, or 100 Gbps
├── Setup: 3-4 weeks
└── Consistent performance

Cost: $0.30/hour + data
Typical: $0.30/hour * 730 = $219/month

Use for:
└── >200 GB transfer (ROI)
```

## Post-Migration Optimization

```
Phase 1: Rehost (fast)
└── Running (possibly oversized)

Phase 2: Optimization
├── Right-size instances (spend analysis)
├── Switch to spot instances (cost)
├── Use autoscaling
├── Consolidate databases
└── Potential 40-60% cost savings

Example:
Costs after rehost: $10,000/month
After optimization: $6,000/month
Savings: $4,000/month ($48k/year)
```

## Common Migration Issues

### Database Issues

```
Problem: Schema compatibility
├── Datatypes different
├── Sequences/identity columns mismatch
└── Stored procedures missing

Solution:
├── DMS task mapping rules
├── Pre-conversion scripts
├── Post-migration validation
├── Test before cutover
```

### Application Issues

```
Problem: Hard-coded IP addresses
├── Database host: 192.168.x.x (on-prem)
└── After migration: Different IP (AWS)

Solution:
├── DNS-based (update CNAME)
├── Parameter store (fetch endpoint on startup)
└── Configuration management

Test:
├── Run in parallel
├── Verify connectivity
└── Migrate data validation
```

## ⚠️ Common Mistakes

❌ **No assessment before migration**
→ Unrealistic timelines, bad architecture

❌ **Big bang cutover**
→ Something breaks, no fallback

❌ **Not using DMS**
→ Manual migrations have downtime

❌ **Rehost everything**
→ Miss opportunities for refactoring

❌ **No cost comparison**
→ Might cost more than on-prem!

## 🎯 Key Takeaways

✅ 6 Rs framework for planning
✅ Quick wins (rehost) first
✅ DMS for minimal-downtime DB migration
✅ Snowball for large datasets
✅ Right-size after rehost
✅ Test, test, test before cutover
✅ Parallel running recommended
✅ Optimization phase critical

---

**Migration is a journey, not a sprint!**

---

[← Previous: AWS Organizations & Account Management](37-aws-organizations.md) | [Contents](README.md) | [Next: Machine Learning Services →](39-ml-services.md)
