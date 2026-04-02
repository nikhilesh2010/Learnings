# Best Practices & Optimization

## AWS Well-Architected Framework

AWS recommends 6 pillars:

### 1. Operational Excellence

```
Focus: Run and monitor systems effectively

Practices:
├── Infrastructure as Code (CloudFormation)
├── Anticipate failure
├── Regular reviews and improvements
├── Automate operational tasks
└── Maintain and enhance procedures

Questions:
├── How do you monitor your systems?
├── How do you manage changes?
├── How do you design for failure?
```

### 2. Security

```
Focus: Protect data and systems

Practices:
├── Principle of least privilege
├── Centralized access management
├── Encryption everywhere
├── Detective controls
└── Compliance automation

Questions:
├── How do you manage access?
├── How do you protect your data?
├── How do you manage compliance?
```

### 3. Reliability

```
Focus: Systems recover from failures

Practices:
├── Multi-AZ deployment
├── Automated recovery
├── Capacity planning
├── Service quotas monitoring
└── Disaster recovery testing

Questions:
├── How do you prevent failures?
├── How do you recover from failure?
├── How do you manage change?
```

### 4. Performance Efficiency

```
Focus: Use resources efficiently

Practices:
├── Serverless first (no servers to manage)
├── Right-sizing instances
├── Multi-region for low latency
├── Use managed services
└── Optimize continuously

Questions:
├── How do you select services?
├── How do you use resources efficiently?
├── How do you monitor performance?
```

### 5. Cost Optimization

```
Focus: Controlled spending

Practices:
├── Measure and attribute costs
├── Right-size resources
├── Use Reserved Instances/Savings Plans
├── Eliminate waste
└── Regular cost reviews

Questions:
├── How do you allocate costs?
├── How do you optimize costs?
├── How do you monitor spending?
```

### 6. Sustainability

```
Focus: Environmental responsibility

Practices:
├── Understand impact
├── Choose efficient regions
├── Right-size for demand
├── Optimize code
└── Monitor and measure

Questions:
├── What's your energy efficiency?
├── How do you measure impact?
└── How do you optimize efficiency?
```

## Cost Optimization Deep Dive

### Right-Sizing

Analyze and adjust instance types:

```
Current: m5.xlarge (high cost)
CPU avg:    15% (underutilized!)
Memory avg: 20% (underutilized!)

Action: Downsize to t2.large
Savings: 60-70%

Process:
1. Monitor CloudWatch 2+ weeks
2. Identify underutilized resources
3. Test smaller size
4. Verify performance
5. Downgrade
```

### Reserved Instances

Commit for discounts:

```
         Cost/Hour    Yearly Cost (commitment)
On-Demand:  $0.10     $8.47 × 12 = ~$100/year

1-year RI:  $0.05     $438 (41% savings!)
3-year RI:  $0.034    $876 (66% savings!)

Recommendation:
├── Baseline (always-on): 1-3 year RI
├── Variable (peaks): On-Demand or Spot
```

### Compute Savings Plans

Flexible discounts:

```
Like Reserved Instances but:
├── Flexible across instance families
├── Flexible across regions
├── 32-72% savings
└── Good for: Variable instance types
```

### Spot Instances

```
Market price for spare capacity:

Example: t2.micro
Normal:    $0.0116/hour
Spot:      $0.0035/hour (70% discount!)

Catch:     Can terminate with 2-min notice

Use for:
├── Batch processing
├── Testing
├── Non-critical workloads
├── Can combine with On-Demand for stable base
```

### Data Transfer Costs

Biggest hidden cost:

```
Within same AZ:       FREE
Between AZs:          $0.01/GB
Between regions:      $0.02/GB
Outbound to internet: $0.09/GB

Example: 100GB transfer between regions
Cost: 100 × $0.02 = $2 (seems small but adds up!)

Optimization:
├── Keep data in one region
├── Use CloudFront for CDN (cheaper)
├── Batch transfers vs. real-time
```

### Storage Optimization

```
S3 storage lifecycle:

New (hot):           Standard        $0.023/GB
30 days old:         Intelligent     $0.0125/GB
90 days old:         Glacier         $0.004/GB
180 days old:        Deep Archive    $0.00099/GB

Benefit: 95% savings on old data!

Automated via lifecycle policies
```

### Database Optimization

```
Pick right database:
├── SQL needed? → RDS
├── High scale? → DynamoDB
├── Analytics? → Redshift
├── Search? → OpenSearch

Reserved capacity:
├── Baseline guaranteed? → Reserved
├── Unpredictable? → On-demand

Multi-AZ:
├── Production? → Enable
├── Dev/test? → Disable (for cost)
```

## Performance Optimization

### Caching Strategy

```
Application Caching (ElastiCache):
├── Frequently accessed data
├── Reduce database load
├── Redis or Memcached
└── Cost: $0.017-0.169 per hour

CDN Caching (CloudFront):
├── Static content (HTML, CSS, JS, images)
├── 400+ edge locations globally
├── Lower latency to users
└── Cost: $0.085/GB (after you pay for transfer)
```

### Database Performance

```
Query optimization:
├── Proper indexes
├── Avoid N+1 queries
├── Connection pooling

RDS  monitoring:
├── CPU, memory, disk
├── Slow query logs
├── Performance Insights

DynamoDB optimization:
├── Query pattern design
├── Correct key schema
├── Index selection
```

### Application Performance

```
Lambda optimization:
├── Right memory size (increases CPU)
├── Connection pooling
├── Lightweight dependencies

EC2 optimization:
├── Instance placement
├── Network optimization
├── AMI optimization
```

### Monitoring Performance

```
Key metrics:
├── Request latency (P50, P95, P99)
├── Error rate
├── Throughput (requests/sec)
├── Resource utilization

Tools:
├── CloudWatch (builtin)
├── X-Ray (distributed tracing)
└── Application Performance Monitoring (APM)
```

## Disaster Recovery

### RTO/RPO Definitions

```
RTO = Recovery Time Objective
  └── Max acceptable downtime

RPO = Recovery Point Objective
  └── Max acceptable data loss

Example: E-commerce site
RTO: < 1 hour (disaster to back online)
RPO: < 5 minutes (max 5 min data loss acceptable)

Strategy must meet RTO/RPO
```

### Backup Strategy

```
Automated backups:
├── EC2: EBS snapshots daily
├── RDS: Automated backups (7 days)
├── S3: Versioning enabled
├── DynamoDB: Point-in-time recovery

Manual backups:
├── Before major changes
├── Long-term compliance
├── Cross-region copy

Test restores regularly:
└── Backups worthless if can't restore!
```

### High Availability

```
Single AZ (❌ Risky):
└── EC2 instance → Failure = downtime

Multi-AZ (✅ Recommended):
├── 2+ instances in different AZs
├── Load balancer behind
├── Auto-scaling group
└── Automatic failover

Multi-Region (✓✓ Maximum):
├── Full stack in 2+ regions
├── Route 53 geo-routing
├── Active-active or active-passive
```

## Operational Excellence

### Automation

Infrastructure as Code:
```
CloudFormation templates
  ├── Git version control
  ├── Code review process
  ├── Automated testing
  └── Single-click deployment
```

Operational Tasks:
```
Lambda + EventBridge:
├── Schedule backups
├── Cleanup old resources
├── Generate reports
├── Remediate compliance issues
```

### Monitoring & Alerting

```
CloudWatch dashboards:
├── Real-time metrics
├── Historical trends
└── Quick overview

Alarms:
├── CPU > 80%
├── Error rate > 1%
├── Database connections high
└── Disk space < 10%

Notifications:
├── SNS email
├── Slack integration
└── PagerDuty for critical
```

### Documentation

```
✓ Architecture diagrams
✓ Runbooks for common tasks
✓ Incident response procedures
✓ Change log
✓ Contact info

Store in:
├── Git (version controlled)
├── Confluence/Wiki
├── NotionRoam Research
└── Always accessible
```

## Tagging & Cost Allocation

### Tag Strategy

```
Mandatory tags:
├── Environment: prod, staging, dev
├── Owner: team@company.com
├── Project: project-name
├── CostCenter: finance code
└── Application: app-name

Example EC2 instance:
{
  "Environment": "prod",
  "Owner": "platform-team",
  "Project": "user-service",
  "CostCenter": "3-1234",
  "Application": "api-gateway"
}
```

### Cost Attribution

```
By tag:
├── Production: $5000/month (highest cost)
├── Development: $200/month
├── Testing: $50/month

By project:
├── Project A: $2000/month
├── Project B: $1500/month
├── Infrastructure shared: $1750/month

By team:
├── Platform: $3000/month
├── Data: $2000/month
└── Mobile: $1750/month

Chargeback model:
└── Bill teams based on usage
```

## Environment Progression

### Typical Setup

```
Development (dev):
├── Minimal resources
├── Cost optimization priority
├── Frequent changes
└── Single instance, no backup

Staging (stage):
├── Production-like
├── Test before promote
├── Automated testing
└── Multi-AZ for accuracy

Production (prod):
├── High availability
├── Security hardened
├── Monitoring & alerting
├── Backup & disaster recovery
```

## ⚠️ Common Mistakes

❌ **Over-provisioning resources**
→ Cost bloat

❌ **No baseline established**
→ Can't optimize

❌ **Ignoring CloudTrail logs**
→ Can't troubleshoot

❌ **Not testing backups**
→ Backups fail when needed

❌ **No cost allocation**
→ Can't find waste

## 🎯 Key Takeaways

✅ Six pillars: Operational, Security, Reliability, Performance, Cost, Sustainability
✅ Right-size instances continuously
✅ Use Reserved Instances for baseline
✅ Automate everything
✅ Monitor and alert
✅ Test disaster recovery
✅ Tag resources for cost allocation
✅ Document processes

## 🚀 Hands-On Exercise

1. ☑️ Tag all resources (Environment, Owner, Project)
2. ☑️ Create Cost Explorer report by tag
3. ☑️ Identify underutilized resources
4. ☑️ Create Right-Sizing recommendations
5. ☑️ Calculate RI savings
6. ☑️ Create backup snapshot
7. ☑️ Test restore
8. ☑️ Document architecture

---

**Optimization is continuous. Make it part of your culture!**

---

[← Previous: Real-world Architecture Patterns](40-architecture-patterns.md) | [Contents](README.md) | [Next: Debugging & Troubleshooting →](42-debugging.md)
