# Route 53 - DNS & Domain Management

## Route 53 Basics

**What:** AWS's Domain Name System (DNS) service - translates domain names to IP addresses.

**Why we use it:** Users type "example.com", but computers need IP address "203.0.113.1". Route 53 does that translation.

**How it works:**

```
Without Route 53:
User types: example.com
  ↓ 
Your domain registrar's DNS
  ↓
Returns: IP 203.0.113.1
  ↓
Browser connects to server

With Route 53:
User types: example.com
  ↓
AWS Route 53 (AWS's DNS)
  ├→ Can route to closest region (latency-based)
  ├→ Can route based on geography
  ├→ Can health-check and failover
  └→ Can load-balance requests
  ↓
Browser connects to right server
```

**Simple example:**

```
Setup traffic routing:

Simple routing:
example.com → 203.0.113.1 (always the same IP)

Weighted routing (A/B testing):
example.com → Server A 70%, Server B 30%

Latency-based routing (global):
User in Tokyo  → Route to ap-northeast-1 (closest)
User in London → Route to eu-west-1 (closest)

Failover routing (high availability):
Primary server healthy → Route there
Primary server down → Route to backup automatically

Health checks:
Route 53 constantly checks: Is server responding?
├── Healthy → Send traffic
└── Unhealthy → Route to backup

Result:
├── Users always connect to best server
├── Automatic failover if primary fails
├── Global load balancing without complexity
```

## Hosted Zones

Container for DNS records:

```
Create hosted zone for domain:
aws route53 create-hosted-zone \
  --name example.com \
  --hosted-zone-config PrivateZone=false

Result:
├── Hosted zone ID: Z1234...
├── 4 nameservers assigned
└── Update domain registrar nameservers
```

## Record Types

### Simple Records

```
A Record: Points domain to IP
  example.com → 203.0.113.1

AAAA Record: IPv6
  example.com → 2001:0db8::1

CNAME Record: Alias to another domain
  www.example.com → example.com

MX Record: Mail server
  example.com → mail.example.com (priority 10)

TXT Record: Text data (verification)
  example.com → v=spf1 include:sendgrid.net ~all
```

### Routing Policies

#### Simple Routing

```
One record = One IP

example.com A Record: 203.0.113.1
└── Always resolves to this IP

Use for: Single resource, no failover
```

#### Weighted Routing

```
Distribute traffic by percentage:

example.com A Record:
├── IP1: Weight 70 (70% traffic)
├── IP2: Weight 20 (20% traffic)
└── IP3: Weight 10 (10% traffic)

Use for:
├── Gradual deployments (canary)
├── A/B testing
├── Load distribution
```

#### Latency-Based Routing

```
Route to closest region:

User in London:
└── Resolves to eu-west-1 (closest)

User in Tokyo:
└── Resolves to ap-northeast-1 (closest)

Configuration:
├── Record in each region
├── Same name (example.com)
├── Different IPs (per region)
└── Route 53 measures latency

Use for: Global applications
```

#### Failover Routing

```
Active-Passive failover:

Primary: IP1 (active)
  └── Health check passes? Use IP1

Health check fails:
  └── Route to Secondary IP2

Health check passes again:
  └── Route back to Primary IP1

Configuration:
├── Primary with health check
├── Secondary (manual failover)
└── Route 53 monitors
```

#### Geo-Location Routing

```
Route by geography:

North America → US endpoints
Europe → EU endpoints
Asia → Asian endpoints
Everywhere else → Default

Use for:
├── Compliance (data residency)
├── Licensing restrictions
├── Localization
└── Content delivery
```

#### Geo-Proximity Routing

```
Route by geographic distance:

User location: 40°42'N 74°00'W (NYC)
  └── Resolves to closest endpoint

Bias setting:
├── Positive bias: Expand region
├── Negative bias: Shrink region
└── Fine-tune traffic distribution
```

#### Multi-Value Answer Routing

```
Return 8 random healthy IPs:

Query example.com:
└── Returns: 8 up-to-date IPs (from larger set)
└── Client picks one

Use for: Simple load balancing
Note: Not a replacement for load balancer
```

## Health Checks

Monitor endpoint health:

```
Create health check:
aws route53 create-health-check \
  --health-check-config \
    IPAddress=203.0.113.1,\
    Port=443,\
    Type=HTTPS,\
    ResourcePath=/health

Types:
├── HTTP/HTTPS/TCP: Response 2xx/3xx
├── Calculated: Combine other checks
├── CloudWatch: Based on metric
└── SNS: Publish to SNS
```

## TTL (Time To Live)

```
Short TTL (60 seconds):
├── DNS update faster
├── Frequent queries (extra cost)
├── Use for: Frequent changes

Long TTL (86400 seconds / 1 day):
├── DNS cached longer
├── Fewer queries (lower cost)
├── Use for: Stable records

Balance:
└── 300 seconds (5 min) for most records
```

## Alias Records

Route 53 specific records:

```
Normal CNAME:
www.example.com → example.com (works)

But AWS wants:
example.com → ALB (doesn't work, can't CNAME root)

Solution - Alias Record:
example.com → ALB (Alias)

Alias targets:
├── ALB/NLB
├── CloudFront
├── S3 website
├── API Gateway
├── Another Route 53 record
└── EC2 (not recommended)

Benefit:
└── No charge for alias queries
```

## DNS Failover Example

```
Production setup:

Route 53 Record: api.example.com
├── Primary: ALB in us-east-1
│   └── Health check every 30 seconds
├── Secondary: ALB in us-west-2
│   └── On standby

Failure scenario:
├── Primary ALB fails health check
├── Route 53 detects failure (<30s)
├── Traffic routes to Secondary
├── Users unaware of failure

Cost:
└── Health check: $0.50/month
```

## Private Hosted Zones

Internal DNS (not public):

```
Private zone: internal.example.com
└── Only accessible from VPC

Setup:
├── Create hosted zone
├── Associate with VPC
├── EC2 instances resolve internal.example.com
└── External users get NXDOMAIN

Use for:
├── Internal microservices
├── Database DNS
├── Cache DNS
└── Internal tools
```

## Route 53 Query Logging

Monitor DNS queries:

```
Enable query logging:
aws route53 create-query-logging-config \
  --hosted-zone-id Z1234 \
  --cloud-watch-logs-log-group-arn arn:aws:...

Logs show:
├── Query timestamp
├── Domain queried
├── Record type
├── Response code
└── Query count

Use for:
├── Debugging DNS issues
├── Security monitoring
├── Query analytics
└── Compliance
```

## ⚠️ Common Mistakes

❌ **TTL too long**
→ Changes take forever to propagate

❌ **CNAME on root domain**
→ Use Alias record instead

❌ **No health checks**
→ Failed endpoints still receive traffic

❌ **Mixed routing policies**
→ Understand interaction before combining

❌ **Forgetting nameserver update**
→ Domain registrar must point to Route 53

## 🎯 Key Takeaways

✅ Routing policies for different needs
✅ Health checks for failover capability
✅ Alias records for AWS resources
✅ TTL balances caching vs. freshness
✅ Private zones for internal DNS
✅ Geo-routing for global apps
✅ Query logging for debugging
✅ Weighted routing for canary deployments

---

**Route 53 is more than DNS—it's your traffic director!**

---

[← Previous: VPC - Virtual Private Cloud](17-vpc.md) | [Contents](README.md) | [Next: Elastic Load Balancing (ALB/NLB) →](19-elastic-load-balancing.md)
