# Multi-Region & Disaster Recovery

## Disaster Recovery Strategies Recap

**What:** How fast can you recover if a disaster (data center failure) happens?

**Why it matters:**
- Backup & Restore: Can wait 24 hours to recover
- Real-time: Need instant recovery (live replication)
- Business decides: How much downtime is acceptable?

**Trade-off:**

```
Cheap: 24-hour wait → Customers wait 24 hours
Medium: 1-hour wait → Customers wait 1 hour
Expensive: Real-time → No wait (active replication)

Choose based on business criticism!
```

**Simple strategies:**

```
Backup & Restore (Cheapest):
├── Take daily backup
├── Store separately
├── If disaster: Restore from backup (24 hours)
├── RPO: 24 hours (lose 1 day of data)
├── RTO: 24 hours (recover in 24 hours)
└── Cost: Minimal

Pilot Light (Low-cost active):
├── Keep standby copy ready (but scaled down)
├── Continuously replicated
├── Quick activation when needed
├── RPO: 15 minutes
├── RTO: 1 hour
└── Cost: Low

Warm Standby (Medium):
├── Full secondary system running (50% capacity)
├── Real-time replication
├── Fast failover
├── RPO: 5 minutes
├── RTO: 15 minutes
└── Cost: Medium (paying for standby)

Hot Standby / Active-Active (Most expensive):
├── Full primary + full backup running
├── Both active (no "standby")
├── Instant failover
├── RPO: 0 (real-time)
├── RTO: 0 (already active!)
└── Cost: High (2x infrastructure)
```

**Choose your strategy:**
```
Not critical: Backup & Restore
Somewhat critical: Pilot Light
Business critical: Warm Standby
Highly critical: Active-Active
```

## Multi-Region Architecture

### Active-Active

```
Region 1 (us-east-1):
├── Application servers
├── Database (primary)
├── Handling 50% traffic

Region 2 (eu-west-1):
├── Application servers
├── Database (read replica)
├── Handling 50% traffic

Route 53:
├── Latency-based routing
└── Distributes traffic

Failure scenario:
├── Region 1 fails
├── Route 53 routes all to Region 2
└── DynamoDB streams already synchronized
```

### Active-Passive

```
Primary Region (us-east-1):
├── Full application stack
├── Production database
└── Handling all traffic

Standby Region (eu-west-1):
├── Read-only replicas
├── Scaled minimum
└── Route 53 health check

Failure:
├── Region 1 fails
├── Health check fails
├── Route 53 fails over to Region 2
├── Lambda triggers failover
├── RDS replica promoted
└── DNS propagation (5-15 min)
```

## Cross-Region Replication

### RDS Multi-Region Read Replica

```
Primary: RDS MySQL (us-east-1)
└── Asynchronous replication
└── Read Replica: RDS MySQL (eu-west-1)

For failover:
├── Can promote replica to standalone
├── Becomes new primary
├── Old primary: needs manual intervention

RPO: ~1 second (very fresh)
RTO: 2-3 minutes (promotion + DNS)
```

### DynamoDB Global Tables

```
Region 1:
└── DynamoDB table (writes)

Region 2:
└── DynamoDB table (read replica, eventually consistent)

Replication:
├── <1 second between regions
├── Bidirectional
├── Conflict resolution (last-write-wins)

Scenario:
├── App writes to Region 1
├── Instantly replicated to Region 2
├── Region 1 fails
├── Update app to Region 2
└── Data current!
```

### S3 Cross-Region Replication

```
Source bucket (us-east-1):
└── New objects

Target bucket (eu-west-1):
└── Replicated asynchronously

Cost:
└── $0.02 per 1,000 replication operations

RTC (Replication Time Control):
├── Guarantee replication < 15 minutes
├── SLA-backed
└── Additional cost

Use for:
├── Compliance (data residency)
├── Disaster recovery
└── Local access optimization
```

## Multi-Region Failover

### Route 53 Health Checks

```
Health check configuration:
├── Primary region ALB
├── Health check interval: 30s
├── Failures before failover: 3 consecutive

Workflow:
├── Health check passes
├── Route 53 sends 100% traffic to primary
├── Health check fails
├── Route 53 detects failure (90s max)
├── Route 53 routes to secondary
└── Update DNS (5-15 min propagation)
```

### Application Recovery

```
Lambda-based failover:

1. Health check -> SNS (failure alert)
2. SNS triggers Lambda
3. Lambda steps:
   ├── Verify failure (double-check)
   ├── Promote read replica to primary
   ├── Update database endpoint in Parameter Store
   ├── Notify team (PagerDuty)
   ├── Post to Slack

Automation:
└── Reduces manual intervention
```

## Cost of Multi-Region

```
Single region:
├── ALB: $16/month
├── EC2 (3x t3.micro): $30/month
└── RDS (db.t3.micro): $35/month
Total: $81/month

Multi-region (both regions):
├── ALB: $32/month (2x)
├── EC2: $60/month (2x)
├── RDS: $35/month (cold standby)
└── Replication: $10/month
Total: $137/month

Increase: 69% (~$56/month)

Value:
├── 99.99% availability (vs 99.9%)
└── Protection against regional disaster
```

## Multi-Region Database Strategy

### Option 1: Primary-Replica (RDS)

```
Pro:
├── Cheap standby
├── Simple failover
└── RTO 2-3 min

Con:
├── Regional failure -> 2-3 min downtime
└── RPO ~1 sec (acceptable)

Use for:
└── Acceptable downtime tolerance
```

### Option 2: Global Tables (DynamoDB)

```
Pro:
├── <1 sec replication
├── Bidirectional
└── Active-active possible

Con:
├── More expensive
└── Eventually consistent

Use for:
└── Always-on applications
```

### Option 3: Event-Driven Sync

```
Architecture:
├── Primary Writes to DynamoDB
├── DynamoDB Streams triggered
├── Lambda replicates to secondary region
├── Secondary available for reads

Pro:
├── Fine control
├── Affordable
└── Works across services

Con:
├── Custom code
└── ~50-200ms replication
```

## Backup Strategy

### Backup Frequency

```
Daily backup:
├── All data backed up
├── Retained 7 days
├── PITR enabled
└── Cost: $0.023/GB/month

Weekly backup:
├── Additional snapshot
├── Retained 30 days
└── Cost: $0.012/GB/month

Monthly backup:
├── Archive snapshot
├── Retained 1 year
└── Cost: $0.023/GB/month

Example (100GB DB):
└── ~$2.35/month storage
```

## Testing Disaster Recovery

```
Quarterly DR test:

1. Restore from backup
2. Verify data integrity
3. Test application startup
4. Run smoke tests
5. Measure RTO
6. Document issues

Document:
├── Actual vs. expected RTO
├── Actual vs. expected RPO
├── Issues encountered
├── Improvement actions
```

## ⚠️ Common Mistakes

❌ **No secondary region backups**
→ Single region fails = data loss

❌ **Never testing failover**
→ Discovery during actual failure (worst time)

❌ **Backup bucket not replicated**
→ Backups in same region as source!

❌ **Wrong health check endpoint**
→ Fails over on false positive

❌ **No automation**
→ Manual failover = human error risk

## 🎯 Key Takeaways

✅ RTO/RPO defines strategy
✅ Multi-region = cost increase
✅ Active-active for zero downtime
✅ Cross-region replication
✅ Route 53 health checks
✅ Automated failover via Lambda
✅ Regular DR testing critical
✅ Backup to different region

---

**Disaster recovery is insurance for your business!**

---

[← Previous: Auto Scaling & Performance](35-autoscaling.md) | [Contents](README.md) | [Next: AWS Organizations & Account Management →](37-aws-organizations.md)
