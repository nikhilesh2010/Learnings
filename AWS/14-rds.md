# RDS - Relational Databases

## What is RDS?

**What:** Relational Database Service - AWS manages your database.

**Why we use it:** Managing databases is hard (backups, patches, high availability). RDS does it for you.

**How it works:**

```
Self-Managed Database:       RDS (AWS Managed):
├── Install DB server        ├── Choose engine (MySQL, PostgreSQL, etc.)
├── Configure                ├── Select instance size
├── Manage backups          ├── AWS handles:
├── Apply patches           │  ├── Automated backups
├── High availability       │  ├── OS patches
├── Security                │  ├── Database patches
└── Disasters               │  ├── Replication
    └── You manage OS/DB    │  ├── Automatic scaling
                            │  └── Disaster recovery
                            └── You focus on data
```

**Simple example:**

```
Start a PostgreSQL database:

Traditional (manual):
1. Buy server hardware ($3,000)
2. Install Linux OS (2 hours)
3. Download PostgreSQL (30 min)
4. Configure backups (4 hours)
5. Setup replication (8 hours)
6. Optimize for performance (days)
7. Monitor 24/7 (forever)
Total: Weeks of work!

With RDS:
1. RDS console → Create database
2. Engine: PostgreSQL
3. Instance: db.t3.micro
4. Click "Create"
5. Wait 5 minutes
6. Database ready with:
   ├── Automated daily backups
   ├── Automatic failover (high availability)
   ├── OS patches applied automatically
   ├── Database patches applied automatically
   └── CloudWatch monitoring
Done in minutes!

Cost:
├── Manual: Server hardware + your time + DevOps salary
├── RDS: ~$17/month for small database
```

## Supported Engines

```
PostgreSQL
  ├── Open source
  ├── Free
  ├── Powerful JSON/JSONB support
  └── Recommended for new projects

MySQL
  ├── Open source
  ├── Free
  ├── Very popular
  └── Good for web applications

MariaDB
  ├── MySQL fork
  ├── Open source
  └── Improved performance

Oracle Database
  ├── Enterprise
  ├── Costs extra ($2000+/month)
  └── For legacy systems

SQL Server
  ├── Microsoft
  ├── Costs extra
  └── Windows integration
```

## RDS Deployment Types

### Single-AZ (Basic)

```
┌──────────────────────┐
│   Single AZ (us-1a)  │
├──────────────────────┤
│                      │
│  RDS Instance        │
│  ├── Primary DB      │
│  └── Local storage   │
│                      │
└──────────────────────┘
        │ Fails
        ↓ Manual intervention
    Downtime
```

**Use for:** Dev/test, non-production

### Multi-AZ (Recommended)

```
┌────────────────────────────┐
│ Region (us-east-1)         │
├────────────────────────────┤
│                            │
│ ┌──────────────┐ ┌──────┐  │
│ │ Primary DB   │ │Sync  │  │
│ │ (us-east-1a) │-│Repl  │  │
│ │              │ │(1b)  │  │
│ │ Accepting    │ └──────┘  │
│ │ reads/writes │           │
│ └──────────────┘           │
│        │ Fails             │
│        ↓ Automatic failover│
│ ┌──────────────┐           │
│ │Standby DB now│           │
│ │Primary       │           │
│ └──────────────┘           │
│        ↓                   │
│    No downtime!            │
│                            │
└────────────────────────────┘
```

**Use for:** Production, critical workloads

### Aurora - AWS Native Database

```
Similar to RDS but better:
├── 3x faster than MySQL
├── 2x faster than PostgreSQL
├── Automatic scaling
├── Auto-recovery from failures
├── Read replicas included
└── More expensive but worth it for high-traffic

Architecture:
├── Multiple read replicas
├── Automatic failover
├── Shared storage layer
└── Up to 15 read replicas
```

## Instance Types

### db.t3 (Burstable)

```
db.t3.micro:    1 vCPU, 1 GB RAM       $0.017/hr
db.t3.small:    2 vCPU, 2 GB RAM       $0.034/hr
db.t3.medium:   2 vCPU, 4 GB RAM       $0.068/hr

Good for: Development, testing, small apps
Problem: Limited performance, can burst up
```

### db.m5 (General Purpose)

```
db.m5.large:    2 vCPU, 8 GB RAM       $0.096/hr
db.m5.xlarge:   4 vCPU, 16 GB RAM      $0.192/hr
db.m5.2xlarge:  8 vCPU, 32 GB RAM      $0.384/hr

Good for: Production web apps, balanced workload
```

### db.r5 (Memory Optimized)

```
db.r5.large:    2 vCPU, 16 GB RAM      $0.126/hr
db.r5.xlarge:   4 vCPU, 32 GB RAM      $0.252/hr
db.r5.2xlarge:  8 vCPU, 64 GB RAM      $0.504/hr

Good for: Large databases, in-memory caching
```

## Creating RDS Instance

### Via Console

```bash
1. RDS Console → Create database
2. Database type: PostgreSQL (recommended)
3. Templates: Free tier (dev/test) or Multi-AZ production
4. DB instance identifier: my-postgres-db
5. Credentials:
   Username: admin
   Password: [strong password]
6. Instance class: db.t3.micro (free tier)
7. Storage: 20 GB (free tier)
8. Multi-AZ: Enable
9. VPC: Default VPC
10. Publicly accessible: No (unless testing)
11. Backup retention: 7 days
12. Create database → Wait 5-10 minutes...
```

### Via AWS CLI

```bash
aws rds create-db-instance \
  --db-instance-identifier my-postgres-db \
  --db-instance-class db.t3.micro \
  --engine postgres \
  --master-username admin \
  --master-user-password SecurePassword123! \
  --allocated-storage 20 \
  --backup-retention-period 7 \
  --multi-az \
  --storage-encrypted
```

## Accessing RDS

### Connection String

```
PostgreSQL:
postgresql://admin:password@my-postgres-db.xxxxx.us-east-1.rds.amazonaws.com:5432/postgres

MySQL:
mysql -h my-mysql-db.xxxxx.us-east-1.rds.amazonaws.com -u admin -p

Components:
├── Username: admin
├── Password: your-password
├── Endpoint: my-postgres-db.xxxxx.us-east-1.rds.amazonaws.com
└── Port: 5432 (PostgreSQL), 3306 (MySQL)
```

### From EC2 Instance

```bash
# Inside EC2 in same VPC
psql -h my-postgres-db.c9akciq.us-east-1.rds.amazonaws.com \
     -U admin \
     -d postgres

# Enter password when prompted
```

### From Local Computer

```bash
# Good for development/testing only
# Must:
# 1. RDS publicly accessible: Yes
# 2. Security group allows port 5432 from your IP

psql -h my-postgres-db.xxxxx.us-east-1.rds.amazonaws.com \
     -U admin \
     -d postgres
```

## RDS Backups & Snapshots

### Automated Backups (Free)

```
Daily snapshots + transaction logs

Retention: 1-35 days (default 7)

Restore to:
├── Latest state
├── Any point in time (PITR)
└── Any hour within retention period

Enabled by default
```

### Manual Snapshots

```
Create snapshot:
RDS Console → Instances → [Select] → Snapshots → Create Snapshot

Costs:
├── Storage: $0.095/GB/month
└── No auto-deletion (your responsibility)

Use for: Major changes, compliance, permanent backup
```

### Restore from Snapshot

```
Creates NEW database (original remains intact)

Process:
1. RDS Console → Snapshots
2. Select snapshot → Restore
3. Choose parameters:
   ├── Instance ID
   ├── Instance class
   └── VPC/subnet
4. Modify (optional)
5. Restore → Done!

Time: 5-30 minutes depending on size
```

## Multi-AZ Deep Dive

### How Multi-AZ Works

```
┌─────────────────────┐
│ Primary (AZ-a)      │
├─────────────────────┤
│ Accepts connections │
│ Processes queries   │
└────────┬────────────┘
         │ Synchronous replication
         │ (write to both before confirm)
         ▼
┌─────────────────────┐
│ Standby (AZ-b)      │
├─────────────────────┤
│ Updated copy        │
│ No direct access    │
│ Ready to take over  │
└─────────────────────┘

Failure detection → 1-2 minutes
Failover → 30-60 seconds
Total downtime: ~1-2 minutes
```

### Multi-AZ Benefits

```bash
✅ Survives AZ failure (99.95% uptime)
✅ Automatic failover
✅ Minimal downtime
✅ No manual intervention
❌ Slightly higher cost (+100%)
❌ Failover takes a minute
❌ Not read-write failover
```

## Read Replicas

Scale database reads:

```
┌──────────────┐
│ Primary (RW) │
├──────────────┤
│ Accepts all  │
│ reads/writes │
└────────┬─────┘
         │ Async replication
         ├─────────────────────┬─────────────┐
         ▼                     ▼             ▼
    ┌─────────────┐   ┌─────────────┐ ┌─────────────┐
    │ Replica 1   │   │ Replica 2   │ │ Replica 3   │
    │ (same AZ)   │   │ (diff region)│ │ (same AZ)  │
    │ Read-only   │   │ Read-only   │ │ Read-only  │
    └─────────────┘   └─────────────┘ └─────────────┘

Route reads to replicas:
app.read = replica1.example.com
app.write = primary.example.com
```

## RDS Monitoring

### CloudWatch Metrics

```
Key metrics:
├── CPU Utilization: High = upgrade instance
├── Database Connections: Trending up = connections leak
├── Read/Write Latency: Network performance
├── IOPS: Storage performance
├── Storage Space: Monitor for growth
```

### Enhanced Monitoring

```
Enable in RDS settings:
├── Granular metrics
├── OS-level visibility
├── 50+ metrics
├── Data retention: 1-7 days
```

### Performance Insights

```
Identify bottlenecks:
├── Active sessions over time
├── Top SQL queries
├── Resource utilization
└── Load by host
```

## RDS Pricing Example

### High-Availability Web App

```
Multi-AZ PostgreSQL:
├── db.m5.large: $0.384/hr
├── x 730 hours/month: $280
├── Multi-AZ: +280 = $560
├── Storage (500GB): 500 × $0.20 = $100
├── Backups (500GB): 500 × $0.10 = $50
└── I/O: ~$50

Monthly: ~$760

With 1-year reserved instance:
└── ~$500/month (33% savings!)
```

## ⚠️ Common RDS Mistakes

❌ **No Multi-AZ for production**
→ Use Multi-AZ for reliability

❌ **No backups configured**
→ Set retention to 7+ days

❌ **Database publicly accessible**
→ Only when necessary

❌ **Wrong instance type**
→ Monitor; scale if needed

❌ **No monitoring**
→ Enable CloudWatch + Enhanced monitoring

## 🎯 Key Takeaways

✅ RDS = fully managed relational database
✅ Supports PostgreSQL, MySQL, MariaDB, Oracle, SQL Server
✅ Multi-AZ for production High Availability
✅ Automatic backups (7 days default)
✅ Read replicas for read scaling
✅ Encryption at rest/in transit
✅ Pay per hour + storage + I/O

## 🚀 Hands-On Exercise

1. ☑️ Create RDS MySQL instance (free tier)
2. ☑️ Create database, user, table
3. ☑️ Connect from EC2 instance
4. ☑️ Insert test data
5. ☑️ Create manual snapshot
6. ☑️ Enable Multi-AZ
7. ☑️ Monitor CloudWatch metrics
8. ☑️ Delete instance (cleanup)

---

**RDS is the foundation of data persistence. Master it!**

---

[← Previous: Glacier & Backup Services](13-backup-services.md) | [Contents](README.md) | [Next: DynamoDB - NoSQL Database →](15-dynamodb.md)
