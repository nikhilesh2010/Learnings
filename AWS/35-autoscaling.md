# Auto Scaling & Performance

## What is Auto Scaling?

**Auto Scaling = Automatically adjust capacity based on demand**

```
Manual Scaling          Auto Scaling
├── Fixed capacity      ├── Scales up when needed
├── Over-provision      ├── Scales down when not needed
├── Underutilized       ├── Right-sized always
├── Capacity planning   ├── Reactive to demand
└── Costs wasted        └── Minimal waste
```

## EC2 Auto Scaling

### Launch Template

Defines instance configuration:

```bash
1. Create launch template
   Name: web-server-template
   Image: Amazon Linux 2
   Instance type: t2.micro
   Security group: web-sg
   User data: #!/bin/bash
              yum update
              yum install httpd
              systemctl start httpd
```

### Auto Scaling Group (ASG)

```
Desired capacity: 3 (want 3 running)
Minimum capacity: 1 (never go below 1)
Maximum capacity: 6 (never exceed 6)

Current: 2 instances
└── ASG launches 1 more (desired = 3)

High traffic (CPU > 70%)
└── ASG launches 2 more (up to 5 total)

Traffic drops (CPU < 30%)
└── ASG terminates 2 instances (down to 3)
```

### Scaling Policies

#### Target Tracking

```
Maintain metric at target value

Example: Keep CPU at 50%
├── If CPU < 50% → Scale down
├── If CPU > 50% → Scale up
└── Automatically adjusts capacity

Most common, simplest to configure
```

#### Step Scaling

```
Based on alarm thresholds

CPU > 70% for 2 min     → Add 1 instance
CPU > 80% for 2 min     → Add 2 instances
CPU > 90% for 2 min     → Add 3 instances

CPU < 30% for 5 min     → Remove 1 instance
CPU < 20% for 5 min     → Remove 2 instances
```

#### Simple Scaling

```
Single scaling action

CPU > 70% for 2 min     → Add 2 instances
CPU < 30% for 5 min     → Remove 1 instance

Legacy, not recommended (Use Target Tracking instead)
```

### Setup Auto Scaling

```bash
1. Create launch template (as shown above)

2. Create Auto Scaling Group
   Name: web-asg
   Launch template: web-server-template
   Min: 1
   Desired: 3
   Max: 6
   Subnets: Multiple AZs (high availability!)

3. Add scaling policy
   Type: Target Tracking
   Metric: CPU Utilization
   Target value: 50%

4. Configure notifications (optional)
   Send SNS when scaling occurs
```

## Application Load Balancer (ALB)

Distribute traffic across instances:

```
Users
    ↓
ALB (Load Balancer)
    ├─→ Instance 1 (via health check)
    ├─→ Instance 2 (via health check)
    └─→ Instance 3 (via health check)

ALB distributes requests fairly
Removes unhealthy instances from rotation
```

### Health Checks

```
ALB pings instances every 30 seconds:

GET /health HTTP/1.1
Response: 200 OK

Response: 200 → Instance healthy
Response: 500 → Instance unhealthy
Timeout:  → Instance unhealthy
           └── Remove from rotation
           └── Replace unhealthy instance
```

### With Auto Scaling

```
ALB + Auto Scaling Group:

1. Traffic increases
2. ALB sees high latency
3. Triggers CPU metric > 70%
4. Auto Scaling launches new instances
5. New instances registered with ALB
6. ALB routes traffic to them
7. Load distributed again

Transparent scaling!
```

## Lambda Auto Scaling

### Concurrency

```
Concurrent execution: # of functions running simultaneously

Default limit: 1000 concurrent (per account/region)
Individual limit: Configurable

Example:
├── 100 concurrent requests arrive
├── 100 Lambda invocations running
├── 101st request → Throttled (rejected)
└── Set higher limit if needed

Cost: Pay only for what executes
```

### Provisioned Concurrency

Reserve capacity:

```
Guaranteed concurrency:
├── Always available
├── Cold starts avoided
├── Costs even when idle

Use for:
├── APIs with strict latency requirements
├── Real-time applications
```

### Reserved Concurrency

Cap maximum concurrency:

```
Limit per function: 500 concurrent

Why limit?
├── Cost control
├── Prevent runaway billing
├── Share quota among functions
```

## RDS Auto Scaling

### Read Replicas (Read Scaling)

```
                    Primary (RW)
                         │
        ┌────────────────┼────────────────┐
        │                │                │
    Replica 1         Replica 2       Replica 3
    (Read)            (Read)          (Read)
```

Route reads to replicas, writes to primary

### Aurora Auto Scaling

```
Aurora (AWS managed):
├── Automatically adds read replicas
├── Scales based on:
│   ├── CPU
│   ├── Memory
│   └── Connection count
├── Minimum 2 replicas (High Availability)
└── Maximum 15 replicas
```

## DynamoDB Auto Scaling

### Provisioned Capacity + Auto Scaling

```
Reserve base capacity:
├── Read Units (RU): 100 RU/sec
├── Write Units (WU): 50 WU/sec

Auto-scaling adds more:
├── If read traffic grows → Add RUs
├── If write traffic grows → Add WUs
├── When traffic drops → Reduce (slower)
```

### On-Demand vs Auto-Scaled

```
On-demand:        Pay per request (flexible)
Auto-scaled RI:   Reserve + scale (predictable)

Use on-demand:    Unpredictable traffic
Use auto-scaled:  Baseline with peaks
```

## Monitoring for Performance

### Key Metrics

```
EC2:
├── CPU Utilization
├── Network In/Out
├── Disk Read/Write
└── EBS Throughput

RDS:
├── CPU
├── Database Connections
├── Read/Write Latency
└── IOPS

Lambda:
├── Duration
├── Throttles (rejections)
├── Concurrent Executions
└── Errors
```

### CloudWatch Alarms for Scaling

```
High CPU (scale up):
├── Metric: CPUUtilization
├── Threshold: > 70%
├── Period: 2 minutes
└── Action: Add instance

Low CPU (scale down):
├── Metric: CPUUtilization
├── Threshold: < 30%
├── Period: 5 minutes
└── Action: Remove instances

Cooldown period: 5 min (prevent thrashing)
```

## Scaling Strategies

### Scale-Out (Horizontal)

```
Add more instances:
├── 1 large instance → 2 medium instances
├── Better availability
├── Better fault tolerance
└── No restart needed (rolling update)
```

### Scale-Up (Vertical)

```
Bigger instance:
├── t2.micro → m5.large
├── Requires restart (downtime)
├── Limited by instance sizes
└── Single point of failure risk
```

### Best Practice

```
Always scale out (horizontal):
├── More reliable
├── Can add/remove anytime
├── Cost per instance predictable
└── Better for cloud

Avoid scale-up (vertical):
├── Limited by max instance size
├── Restart = downtime
└── Expensive to revert
```

## Cost Impact of Auto Scaling

### Example: Web Application

```
Without Auto Scaling:
├── 10 instances always running (peak capacity)
├── 10 × $0.0116/hr × 730 hrs = $84.70/month
└── Waste on 70% average utilization

With Auto Scaling:
├── Peak: 10 instances ($84.70)
├── Average: 3 instances
├── Off-peak: 1 instance
└── Average cost: $20/month

Savings: ~76%! ($60+/month)
```

## ⚠️ Common Mistakes

❌ **Not distributing across AZs**
→ Scale across multiple AZs for HA

❌ **Scaling too fast**
→ Causes cost spikes

❌ **Ignoring cooldown periods**
→ Prevents thrashing (rapid add/remove)

❌ **No health checks**
→ Unhealthy instances stay in rotation

❌ **Setting max too low**
→ Can't handle traffic spike

## 🎯 Key Takeaways

✅ Auto Scaling adjusts capacity automatically
✅ EC2: ASG + ALB + Target Tracking
✅ Lambda: Automatic concurrency scaling
✅ RDS: Read replicas for read scaling
✅ DynamoDB: Provisioned + auto-scaling
✅ Scale horizontally, not vertically
✅ Monitor and alert on key metrics
✅ Can save 50-80% with proper scaling

## 🚀 Hands-On Exercise

1. ☑️ Create Launch Template (web server)
2. ☑️ Create Auto Scaling Group (min:1, desired:3, max:6)
3. ☑️ Create ALB
4. ☑️ Register ASG with ALB
5. ☑️ Add Target Tracking policy (CPU 50%)
6. ☑️ Monitor scaling activity
7. ☑️ Generate traffic (increase CPU)
8. ☑️ Watch instances scale up/down

---

**Auto Scaling is the key to cost-effective cloud!**

---

[← Previous: Terraform on AWS](34-terraform.md) | [Contents](README.md) | [Next: Multi-Region & Disaster Recovery →](36-multiregion-disaster-recovery.md)
