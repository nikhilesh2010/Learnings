# Database Optimization & Tuning

## RDS Performance Insights

Real-time database performance monitoring:

```
Metrics visible:
├── Database load (peak vs average)
├── Active sessions
├── Wait events (what's slowing down queries?)
└── DB Parameters

Example insight:
"High CPU, caused by full table scan"
  └── Add index to improve query
```

### Enabling Performance Insights

```
Enable in RDS:
RDS → [Database] → Modify
  └── Enable Performance Insights

Retention:
├── 7 days (free tier)
└── 31 days (paid: $0.02/day)
```

## Query Optimization

### Slow Query Logging

Monitor slow queries:

```
MySQL slow query:
SELECT * FROM users WHERE created_at BETWEEN '2024-01-01' AND '2024-01-31'
  └── Without index: Full scan, 10 seconds

With index:
CREATE INDEX idx_created_at ON users(created_at)
  └── With index: 50ms (200x faster!)
```

### Index Strategy

```
When to index:
├── Columns in WHERE clause
├── JOIN columns
├── ORDER BY columns
└── Columns filtered frequently

When NOT to index:
├── Columns with low cardinality (few distinct values)
├── Columns rarely queried
├── Very small tables
└── NULL-heavy columns
```

## DynamoDB Optimization

### Hot Partitions

Problem: All traffic to single partition

```
Before:
User table (partition key: user_id)
  ├── 1M users accessing user 12345
  └── Partition overwhelmed, throttling!

Solution:
Use cache first:
├── Cache hot user in ElastiCache
├── Reduce database hits
├── Burst capacity absorbs peaks
```

### Global Secondary Indexes (GSI)

Query by different attributes:

```
Primary key: user_id
  └── Query: Get user by ID

Add GSI on email:
  └── Query: Get user by email

Cost:
├── GSI has separate RCU/WCU
├── Writes to base require writes to GSI
└── Budget for GSI capacity!
```

### Capacity Optimization

```
Provisioned:
├── Fixed RCU/WCU
├── Costs: Read $0.25/RCU/month, Write $1.25/WCU/month
├── Good for: Predictable workloads

On-Demand:
├── Pay per request: $0.25 per 1M reads, $1.25 per 1M writes
├── Good for: Variable/spiky workloads
└── Can be 5-10x more expensive for consistent load
```

### DynamoDB Streams

```
Capture data changes:
├── Item added: NEW_IMAGE
├── Item updated: NEW_IMAGE + OLD_IMAGE
├── Item deleted: OLD_IMAGE

Use for:
├── Replicate to other database
├── Trigger Lambda
├── Send to Kinesis
└── Real-time analytics
```

## Aurora Optimization

### Aurora MySQL vs Standard RDS MySQL

```
Aurora advantages:
├── 5x faster reads (distributed architecture)
├── Auto-scaling read replicas (Aurora Replicas)
├── Automatic failover (90s)
├── Storage auto-scales (up to 128TB)
├── Backtrack (PITR without restore)
└── Cost: +30% over RDS but much better performance
```

### Aurora Autoscaling

```
Configure:
├── Min replicas: 2 (HA)
├── Max replicas: 5
├── CPU threshold: Scale up at 70%
└── Scale down: After 5 minutes of low CPU

Result:
└── Handles variable load automatically
```

### Aurora Serverless

Pay-per-second billing:

```
Traditional Aurora:
└── Pay for provisioned capacity (even unused)

Aurora Serverless:
├── Auto-pause when idle (no cost!)
├── Auto-resume on query
├── $0.06 per capacity unit per second
├── Good for: Variable workloads, dev/test

Database sleep:
└── Idle > 5 min → Pauses (configurable)
```

## Query Patterns

### N+1 Query Problem

```
BAD:
for user in users:
    posts = db.query("SELECT * FROM posts WHERE user_id = ?", user.id)

Result: 1000 users → 1001 queries!

GOOD:
users = db.query("SELECT * FROM users")
posts = db.query("SELECT * FROM posts WHERE user_id IN (?)", user_ids)

Result: 2 queries total!
```

### Connection Pooling

Reuse database connections:

```
Without pooling:
Each request → Creates new connection
  └── Handshake overhead per request

With pooling:
├── Maintain 20 ready connections
├── Requests grab connection
├── Return when done
└── 10x faster (no handshake per request)

Popular: pgBouncer (PostgreSQL), ProxySQL (MySQL)
```

## Monitoring Database Health

### CloudWatch Alarms

```
Set alarms for:
├── CPU > 80%: Add replica or scale
├── Connections high: Connection pooling needed
├── IOPS > threshold: Provision larger
├── Free storage < 10%: Increase storage
└── Read latency > 100ms: Index missing?
```

## ⚠️ Common Mistakes

❌ **No indexes on large tables**
→ Add indexes on filter columns

❌ **Provisioning too much capacity**
→ Use CloudWatch to right-size

❌ **N+1 queries**
→ Use batch queries

❌ **No connection pooling**
→ Add pooling layer (10x faster)

❌ **Ignoring slow query logs**
→ Review weekly, optimize top queries

## 🎯 Key Takeaways

✅ Performance Insights reveals bottlenecks
✅ Indexes are your friend (usually)
✅ Monitor slow queries continuously
✅ Connection pooling essential
✅ DynamoDB hot partition detection
✅ Aurora >> RDS for scale
✅ Right-size capacity for workload
✅ Test queries before production

---

**Database optimization is iterative. Monitor, identify, optimize, repeat!**

---

[← Previous: DynamoDB - NoSQL Database](15-dynamodb.md) | [Contents](README.md) | [Next: VPC - Virtual Private Cloud →](17-vpc.md)
