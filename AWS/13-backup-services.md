# Backup Services & Disaster Recovery

## AWS Backup Service

**What:** Centralized backup management across multiple AWS services.

**Why we use it:** Managing backups for EC2, RDS, EBS, DynamoDB separately is chaotic and error-prone.

**How it works:**
```
AWS Backup Service:
├── One central place for all backups
├── Set backup frequency (daily, weekly, monthly)
├── Define retention (keep for 7 days, 30 days, 1 year)
├── Automatic lifecycle management
└── One dashboard to see all backups

Compared to manual:
├── Manual: EC2 snapshot policy + RDS backup policy = multiple tools
├── AWS Backup: All in one place!
```

**Simple example:**
```
Set up backup plan:
├── Frequency: Every day at 2 AM UTC
├── Retention: Keep for 30 days
├── Services: EC2, RDS, EBS, EFS

Result:
├── Every VM, database, volume backed up automatically
├── Old backups deleted after 30 days
├── Can restore any resource instantly
```

## Backup Plans

```
Create backup plan:
├── Backup frequency: Daily, weekly, monthly
├── Retention: 7 days, 30 days, 1 year
├── Backup window: 2 AM UTC
├── Copy to another region: Yes/No
└── Resources to backup: EC2, RDS, EBS, EFS, DynamoDB, etc.

Example: Daily backup, retain 7 days
└── Automatically manages lifecycle
```

## Supported Services for Backup

```
AWS Backup supports:
├── EC2 (via EBS snapshots)
├── RDS (databases)
├── EBS (volumes)
├── EFS (file systems)
├── DynamoDB (tables)
├── Storage Gateway (backups)
├── Neptune (graphs)
└── DocumentDB (MongoDB-compatible)
```

## Cross-Region Backup

```
Backup in us-east-1
    ↓ (async copy)
Replicated to us-west-2

Benefits:
├── Disaster recovery
├── Compliance (data residency)
├── Regional failure protection

Cost:
└── Additional copy costs
```

## Disaster Recovery Strategies

### RTO/RPO Tradeoff

```
Cost vs. Capability:

Backup & Restore (Cheapest):
├── RTO: 24 hours (recover from backups)
├── RPO: 24 hours (lose 1 day of data)
└── Cost: Minimal

Pilot Light:
├── RTO: 1 hour (have standby ready)
├── RPO: 15 minutes
└── Cost: Low-medium (minimal resources)

Warm Standby:
├── RTO: 15 minutes
├── RPO: 5 minutes
└── Cost: Medium (half-scale resources)

Hot Standby (Active-Active):
├── RTO: 0 minutes (already active)
├── RPO: 0 minutes (real-time sync)
└── Cost: High (duplicate infrastructure)

Choose strategy based on business requirements!
```

## Database Backup Strategies

### RDS Automated Backups

```
Default backup:
├── Daily automated snapshots
├── Retain 7 days (configurable 1-35)
├── Point-in-time recovery (PITR)
└── Free (charged for storage only)

PITR:
└── Restore to any second within retention
```

### RDS Manual Snapshots

```
Create before:
├── Major version upgrade
├── Schema changes
├── Risky operations

Manual snapshots:
├── Retained indefinitely
├── User-initiated
├── Pay for storage: $0.10/GB/month
```

### DynamoDB Backup

```
Backup types:
├── AWS Backup (managed backup)
├── Point-in-time recovery (PITR)
└── On-demand snapshot

PITR:
├── 35-day recovery window
├── Recover to any point in 35 days
├── Cost: Minimal (uses existing infrastructure)
```

## Application Recovery

### Failover Scenarios

```
Scenario 1: EC2 instance failure
└── ASG detects unhealthy
└── Launches new instance
└── Traffic routed to new
└── RTO: 2-3 minutes

Scenario 2: AZ failure
└── Multi-AZ RDS fails over (1-2 min)
└── ALB routes to instances in other AZ
└── RTO: 2-3 minutes

Scenario 3: Region failure
└── Route 53 failover (DNS change)
└── Traffic to standby region
└── RTO: 5-15 minutes (DNS propagation)
```

## AWS Disaster Recovery Services

### AWS Backup Vault

```
Secure, centralized repository:
├── Encrypted backups
├── Audit trail (CloudTrail)
├── Resource-based policies
├── Cross-account access possible
└── Compliance-ready
```

### AWS Application Discovery Service

Understand your applications:

```
Agentless discovery:
├── Map applications
├── Understand dependencies
├── Calculate TCO
└── Plan migration
```

### AWS DataSync

Automated data movement:

```
Transfer data between:
├── On-premises storage → AWS
├── AWS regions
├── AWS storage services

Features:
├── Resume on failure
├── Encrypt in-flight
├── Preserve metadata
└── Scheduled transfers
```

## Backup Best Practices

```
✅ Practice restores regularly
   Don't assume backups work!

✅ Backup to different region
   Protect against regional failure

✅ Test restoration procedures
   Recovery is only as good as restore test

✅ Encrypt backups
   Especially for compliance workloads

✅ Automate backup policy
   Don't rely on manual backups

✅ Document retention
   How long do you need to keep?

✅ Cost optimization
   Use storage classes (Glacier for old backups)

✅ Monitor backup completion
   CloudWatch alerts on failures
```

## Backup Compliance

```
Compliance requirements:
├── HIPAA: 3 years retention
├── SOX: 7 years retention
├── GDPR: Right to be forgotten
└── PCI-DSS: 1 year retention

Setup in AWS Backup:
└── Create retention policies per compliance need
```

## ⚠️ Common Mistakes

❌ **No backups at all**
→ Bad things happen, have backups!

❌ **Single-region backups**
→ Region fails, backups also gone

❌ **Never testing restore**
→ Can't recover when needed

❌ **No retention policy**
→ Costs grow indefinitely

❌ **Backing up to same account**
→ Ransomware affects backups too

## 🎯 Key Takeaways

✅ AWS Backup centralized management
✅ Automated backup plans with retention
✅ Cross-region replication for DR
✅ RTO/RPO drives strategy choice
✅ Encryption for sensitive data
✅ Test restores regularly
✅ Compliance retention policies
✅ Cost scales with backup age

---

**Backups aren't optional. Invest in recovery capability!**

---

[← Previous: EBS & EFS - Block Storage](12-ebs-efs.md) | [Contents](README.md) | [Next: RDS - Relational Databases →](14-rds.md)
