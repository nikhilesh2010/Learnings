# RDS - Relational Database Service

## 1. What is RDS?

AWS Relational Database Service (RDS) is a **managed SQL database service**.

- **Managed**: AWS handles patching, backup, replication, multi-AZ failover
- **Supported engines**: MySQL, PostgreSQL, MariaDB, Oracle, SQL Server, Aurora
- **High availability**: Multi-AZ (synchronous replication, auto-failover)
- **Scalability**: Read replicas (async replication across regions/AZs)
- **Automated backups**: 7–35 day retention, point-in-time recovery

### Why RDS?

- No database administration (AWS patches, upgrades, backups)
- Automatic failover (multi-AZ)
- Automated backups with PITR (Point-In-Time Recovery)
- Performance insights
- Read replicas for scaling reads globally

### When NOT to Use RDS

- NoSQL use case → use DynamoDB
- Non-relational data → use DynamoDB or DocumentDB
- Very large data warehouse → use Redshift
- Need super-high throughput → use DynamoDB

---

## 2. Database Engines & Editions

### Supported Engines

| Engine | Best For | Licensing |
|--------|----------|-----------|
| **MySQL** | Web apps, startups | Open-source, free |
| **PostgreSQL** | Advanced queries, JSON, extensions | Open-source, free |
| **MariaDB** | MySQL drop-in replacement | Open-source, free |
| **Oracle** | Enterprise | Expensive license |
| **SQL Server** | .NET applications | License or AWS pricing |
| **Aurora** | Ultra-high performance, serverless | AWS-native, 3x MySQL speed |

### Aurora (AWS-Native)

- **5x faster** than standard MySQL
- **Auto-scaling** storage (up to 64 TB)
- **Read replicas**: Instant (no snapshot needed)
- **Serverless**: Pay per request (Aurora Serverless v2)
- **Multi-master**: Read/write from multiple AZs

---

## 3. Creating an RDS Instance

### 📟 Console — Launch RDS MySQL (Free Tier)

```
1. RDS → Databases → Create database
2. Engine: MySQL 8.0 (or latest)
3. Edition: Standard (2 AZs) or Multi-AZ (HA)
4. DB instance identifier: my-database
5. Master username: admin
6. Master password: YourSecurePassword123!
7. DB instance class: db.t3.micro (free tier)
8. Storage: 20 GB (free tier up to 20 GB)
9. Storage type: gp3 (general purpose, faster)
10. Multi-AZ: Yes (ensures HA, but doubles cost)
11. Public accessibility: No (keep private, access via VPC)
12. VPC: default or custom
13. DB subnet group: aws-rds-default (or create custom)
14. Backup:
    - Automated backup: Yes, 7 days (default)
    - Backup window: 3:00–4:00 UTC
15. Monitoring:
    - Enable CloudWatch Logs exports: Yes (for troubleshooting)
16. Enable deletion protection: Yes (prevents accidental delete)
17. → Create database (takes 5–10 minutes)
```

### 💻 CLI

```bash
# Create MySQL DB instance
aws rds create-db-instance \
  --db-instance-identifier my-database \
  --db-instance-class db.t3.micro \
  --engine mysql \
  --engine-version 8.0.36 \
  --master-username admin \
  --master-user-password YourSecurePassword123! \
  --allocated-storage 20 \
  --storage-type gp3 \
  --db-subnet-group-name default \
  --multi-az \
  --backup-retention-period 7 \
  --enable-cloudwatch-logs-exports error general slowquery

# Wait for it to be available
aws rds describe-db-instances \
  --db-instance-identifier my-database \
  --query 'DBInstances[0].[DBInstanceStatus]'

# Get connection details
aws rds describe-db-instances \
  --db-instance-identifier my-database \
  --query 'DBInstances[0].[Endpoint.Address,Endpoint.Port,Engine,MasterUsername]'
```

---

## 4. Connecting to RDS

### Connection Details

```
Endpoint: my-database.c9akciq32.ap-south-1.rds.amazonaws.com
Port: 3306 (MySQL default)
Username: admin
Password: YourSecurePassword123!
Database: (none yet, create one after connecting)
```

### Requirements

- **Security Group**: Must allow inbound on port (3306 MySQL, 5432 PostgreSQL, etc.)
- **Network**: EC2 instance or server must be in same VPC or have network path

### 📟 Console — Configure Security Group

```
1. RDS → Databases → select database
2. Security group rules → outbound (inbound usually pre-configured)
3. Edit: Add inbound rule
   - Type: MySQL/Aurora (port 3306)
   - Source: SG of EC2 instance (or specific IP)
4. → Save
```

### 💻 CLI — Connect from EC2

```bash
# SSH into EC2 instance first
ssh -i my-key.pem ec2-user@ec2-instance-ip

# Inside EC2, install MySQL client
sudo yum install -y mysql

# Connect to RDS
mysql -h my-database.c9akciq32.ap-south-1.rds.amazonaws.com \
       -u admin \
       -p
# Enter password when prompted

# Test connection
SHOW DATABASES;
CREATE DATABASE myapp;
USE myapp;
CREATE TABLE users (id INT PRIMARY KEY, name VARCHAR(100));
INSERT INTO users VALUES (1, 'John Doe');
SELECT * FROM users;
```

---

## 5. Multi-AZ Deployment

**Multi-AZ** = synchronous replication across 2 AZs for high availability.

### How It Works

```
Primary DB (AZ-a)
    ↓ (synchronous replication)
Standby DB (AZ-b)

On primary failure:
    → DNS updates (CNAME points to standby)
    → Standby becomes primary (automatic failover)
    → RTO: ~60–120 seconds
```

### Costs

- 2x compute (2 instances running)
- ~30% more storage (EBS replicated)
- No additional data transfer cost (same region)

### 📟 Console — Enable Multi-AZ

```
1. RDS → Databases → select database
2. Modify → Availability options
3. Multi-AZ deployment: Yes
4. Apply: Immediately (incurs brief outage) or during maintenance window
5. → Modify database instance
```

### Maintenance Impact

During maintenance window:
- Single-AZ: Database unavailable (1–5 minutes)
- Multi-AZ: Failover to standby, minimal disruption

---

## 6. Read Replicas

**Read Replicas** are async copies of the database for scaling reads.

### How It Works

```
Primary (write)
    ↓ (async replication, lag: milliseconds–seconds)
Read Replica 1 (regional)
Read Replica 2 (us-east-1 → ap-south-1, cross-region)

Application:
    Writes → Primary
    Reads → Replicas (distribute load)
```

### Key Points

- **Async**: Replication lag (usually milliseconds)
- **Scalable**: Create up to 15 read replicas
- **Cross-region**: Optional for disaster recovery
- **Promotion**: Convert replica to standalone DB (breaks replication)

### 📟 Console — Create Read Replica

```
1. RDS → Databases → select database
2. Actions → Create read replica
3. Read replica identifier: my-database-read-1
4. Destination region: Same region (regional) or another (cross-region)
5. Instance type: db.t3.micro (can be different from primary)
6. → Create read replica (takes 5–10 minutes)
```

### 💻 CLI

```bash
# Create read replica (same region)
aws rds create-db-instance-read-replica \
  --db-instance-identifier my-database-read-1 \
  --source-db-instance-identifier my-database

# Create cross-region read replica (DR)
aws rds create-db-instance-read-replica \
  --db-instance-identifier my-database-read-useast \
  --source-db-instance-identifier my-database \
  --source-region ap-south-1 \
  --region us-east-1

# Promote read replica to standalone (breaks replication)
aws rds promote-read-replica \
  --db-instance-identifier my-database-read-1
```

---

## 7. Backups & Recovery

### Automated Backups

- **Retention**: 1–35 days (default 7)
- **Timing**: Daily snapshot + transaction logs
- **PITR**: Point-in-Time Recovery (recover to any second within retention window)
- **Automatic**: AWS creates, deleted with instance

### Manual Snapshots

- **User-created**: Never auto-deleted
- **Portable**: Can share with other accounts, restore to different region

### 📟 Console — Create Manual Snapshot

```
1. RDS → Databases → select database
2. Actions → Create snapshot
3. Snapshot identifier: my-database-backup-2024-01-15
4. → Create snapshot (takes based on DB size)
```

### PITR (Point-In-Time Recovery)

```
1. RDS → Databases → select database
2. Actions → Restore to point in time
3. Restore time: choose exact time within retention window
4. DB instance identifier: my-database-restored
5. → Restore
```

---

## 8. Performance & Optimization

### 8.1 Instance Class Sizing

| Class | CPUs | RAM | Use Case |
|-------|------|-----|----------|
| **t3.micro** | 2 | 1 GB | Dev/test, burstable |
| **t3.small** | 2 | 2 GB | Light production |
| **t3.medium** | 2 | 4 GB | Small production app |
| **m5.large** | 2 | 8 GB | High availability |
| **m5.2xlarge** | 8 | 32 GB | Heavy load |
| **r5.large** | 2 | 16 GB | Memory-intensive (cache) |

### 8.2 Parameter Groups

**Parameter group** = configuration for DB engine (affect all instances in group).

| Parameter | Effect | Example |
|-----------|--------|---------|
| `max_connections` | Max simultaneous connections | 100 (t3.micro) → 1000 (m5.large) |
| `slow_query_log` | Log queries > threshold | Useful for optimization |
| `innodb_buffer_pool_size` | Cache for InnoDB | ~50–75% of RAM |
| `log_bin` | Enable binary logging (replication) | Required for read replicas |

### 8.3 CloudWatch Monitoring

| Metric | Healthy Range | Concern |
|--------|---|---|
| **CPU Utilization** | 20–50% | >80% = scale up or optimize |
| **Database Connections** | < max_connections * 80% | Approaching limit = increase or scale |
| **Read/Write Latency** | <1–5 ms | >20 ms = slow queries or I/O issue |
| **Free Storage** | > 10% of allocated | <5% = increase storage |
| **IOPS** | <80% of provisioned | Burst limit exceeded |

### 📟 Console — View Performance Insights

```
1. RDS → Databases → select database
2. Performance Insights → Database Load
3. View active sessions, top SQL, waits
4. Drill down on slow queries
```

---

## 9. Backup, Migration & High Availability Strategy

### Backup Summary

| Backup Type | Duration | Costs | Use |
|---|---|---|---|
| **Automated** | 7 days (default) | Cheap | Daily snapshots + PITR |
| **Manual** | Never expires | Storage cost | Before major changes |
| **Read Replica** | Continuous | 50% of primary | HA + read scaling |
| **Multi-AZ** | Real-time | Double compute | Instant failover |

### HA Architecture Recommendation

```
Primary (Multi-AZ)
├─ AZ-a (primary)
└─ AZ-b (standby, auto-promote if primary fails)

Read Replicas:
├─ Regional (load balancing, scaling reads)
└─ Cross-region (disaster recovery)
```

### Migration from MySQL (On-Premises)

1. **Create RDS instance** (same MySQL version)
2. **Create read replica** of on-premises DB (point AWS to on-prem MySQL)
3. **Stop application writes** to on-premises
4. **Wait for replication lag** to reach 0
5. **Promote RDS replica** to standalone
6. **Point application** to RDS endpoint

---

## 10. Pricing Model

### RDS Instance Pricing

| Component | Pricing Model |
|-----------|---|
| **Compute (instance)** | Per hour (on-demand) or RI (1–3 year discount) |
| **Storage** | Per GB-month ($0.1–0.2 for gp3) |
| **Backup storage** | Per GB-month (first snapshot free) |
| **Data transfer** | Out to internet charged, same AZ free |
| **Multi-AZ** | ~50% additional for standby |
| **Read replicas (cross-region)** | Full compute + data transfer ($0.01/GB) |

### Cost Optimization

```
☑ db.t3.micro/small: Dev/test burstable instances
☑ Reserved Instances: 1–3 year commitment for production (save 30–70%)
☑ gp3: Faster than gp2, cheaper
☑ Shared storage: Aurora for auto-scaling
☑ Automated backups: 7 days is usually enough (increase if needed)
☑ Read replicas: Only for high read load (don't create "just in case")
```

---

## 11. Interview Q&A

**Q: What is the difference between Multi-AZ and Read Replicas?**
Multi-AZ = synchronous replication for HA/failover (one database). Read Replicas = async for scaling reads (separate databases, apply to primary).

**Q: How does RDS fail over in Multi-AZ?**
Automatic DNS CNAME update points to standby. RTO ~60–120 seconds. No manual intervention. Standby promoted to primary.

**Q: Can you lose data with Multi-AZ?**
Unlikely. Synchronous replication ensures both primary and standby are in sync. If primary fails, standby takes over with latest data.

**Q: What is PITR and how long can you go back?**
Point-in-Time Recovery. Restore to any second within the backup retention window (1–35 days, default 7). Uses automated backups + transaction logs.

**Q: Should you create read replicas for disaster recovery?**
Cross-region read replicas: yes. Promotion to standalone takes ~1 min. Same-region replicas: good for read scaling, not DR.

**Q: How do you connect to RDS from an EC2 instance?**
Same VPC: Use private RDS endpoint (secure, no data transfer cost). Different VPC: Use VPC peering or RDS public endpoint (HTTPS + security group).

**Q: What is a parameter group?**
Configuration settings for a DB engine (max_connections, buffer_pool_size, etc.). Apply to all instances using the group.

**Q: Can you downsize an RDS instance?**
Yes, but only to smaller size in the same family (e.g., m5.large → m5.medium). Downtime during the change. Scale vertically during maintenance window.

**Q: How is RDS different from DynamoDB?**
RDS = relational (SQL, joins, ACID). DynamoDB = NoSQL (key-value, fast, automatic scaling). Choose based on data model.

**Q: Can I upgrade from single-AZ to Multi-AZ?**
Yes. Modify instance → Multi-AZ: Yes. AWS creates standby, minimal downtime during application of change.

---

## 12. Quick Reference Cheat Sheet

| Feature | Detail |
|---------|--------|
| **DB Engines** | MySQL, PostgreSQL, MariaDB, Oracle, SQL Server, Aurora |
| **Free tier** | db.t3.micro, 20 GB storage, 7-day backup |
| **Multi-AZ** | Sync replication, auto-failover, RTO ~60–120 sec |
| **Read Replicas** | Async, up to 15 per primary, cross-region OK |
| **Backup retention** | 1–35 days (default 7) |
| **PITR window** | Within backup retention days |
| **Max storage** | 65 TB (varies by engine) |
| **Instance class** | t3.micro → r5.24xlarge (CPU + RAM) |
| **Parameter group** | DB configuration (engine-specific) |
| **Manual snapshot** | Never expires, portable, shareable |
| **Automated backup** | Deleted with instance (unless final snapshot) |
| **Read replica promotion** | Breaks replication, becomes standalone DB |
| **Modified DB** | Downtime if: immediate apply + single-AZ |
| **Maintenance window** | Weekly (default: Sunday 3–4 AM) |
| **Monitoring** | CloudWatch metrics + Performance Insights |
| **Connection timeout** | Adjust in security group + DB parameter |
| **Cross-region replica** | Full compute + data transfer cost |
| **Multi-AZ cost** | ~50% additional for standby |
| **RI savings** | 30–70% for 1–3 year commitment |
| **Aurora** | AWS-native, 3x faster, auto-scaling, serverless option |

---

*Manage complexity, not infrastructure. Replicate for resilience. Scale reads, scale confidence.* 🗄️
