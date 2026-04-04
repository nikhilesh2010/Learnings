# Elastic Load Balancing (ELB)

## Load Balancer Types

**What:** Service that distributes traffic across multiple servers.

**Why we use it:** One server can't handle all traffic. Load balancers spread the load.

**How it works:**

```
Without load balancer (BOTTLENECK):
1,000 users → Single server → Overloaded!

With load balancer (BALANCED):
1,000 users → Load Balancer  
            ├→ Server 1 (250 users)
            ├→ Server 2 (250 users)
            ├→ Server 3 (250 users)
            └→ Server 4 (250 users)

Each server: Fast response!
```

**Three types:**

### Application Load Balancer (ALB) - MOST COMMON

**Best for:** Web applications, microservices, REST APIs

**Features:**
- Intelligent routing (based on path, hostname, query strings)
- /api/* → API service
- /images/* → Image service
- www.example.com → Web servers

**Example:**
```
ALB routes traffic intelligently:
GET /api/users → Lambda function
POST /api/users → Lambda function  
GET /static/image.jpg → S3 bucket
GET / → Web server pool

Same URL domain, different backends!
```

### Network Load Balancer (NLB)

**Best for:** Extreme performance, real-time gaming, IoT

**Features:**
- 1 million requests/second
- Sub-millisecond latency
- Non-HTTP protocols (TCP, UDP, custom)

### Classic Load Balancer (CLB) - Legacy

Old, not recommended. Use ALB instead.

---

**Choose:** Use ALB for 99% of cases!

### Network Load Balancer (NLB)

Layer 4 (Transport layer):

```
Perfect for:
├── Ultra-high performance
├── Extreme throughput
├── Real-time gaming
├── IoT
├── Non-HTTP protocols (TCP, UDP)

Features:
├── 1 million requests/second
├── Sub-millisecond latency
├── Preserve source IP
├── Static IP support
└── Ultra-performance

Use for: Specialized, extreme workloads
```

### Classic Load Balancer (CLB)

Legacy (not recommended):

```
Old generation:
├── Layer 4 + Layer 7 (hybrid)
├── Limited routing
├── Lower performance
└── Use ALB instead

ELBv2 > CLBv1 (always)
```

## ALB Configuration

### Target Groups

Logical grouping of targets:

```
ALB with 3 target groups:

1. Web servers (port 80):
   ├── EC2 instance 1
   └── EC2 instance 2

2. API servers (port 3000):
   ├── EC2 instance 3
   └── EC2 instance 4

3. Cache layer:
   └── ElastiCache endpoints

Routing rules:
├── /api/* → API target group
├── /static/* → S3 (origin)
└── /* → Web target group
```

### Listener Rules

Direct traffic:

```
Listener (ALB port 443):
├── Rule 1: If Path /api/* → Target group: APIs
├── Rule 2: If Host: images.example.com → S3 Origin
├── Rule 3: If HTTP Method POST → Lambda
└── Default rule → Web servers

Order matters:
└── First matching rule applies
```

### Health Checks

Automatic target monitoring:

```
Configure:
├── Path: /health
├── Protocol: HTTP
├── Port: 80
├── Interval: 30 seconds (faster = more cost)
├── Timeout: 5 seconds
├── Healthy threshold: 3 consecutive successes
└── Unhealthy threshold: 2 consecutive failures

Workflow:
├── Instance unhealthy → Marked OUT_OF_SERVICE
├── Stopped receiving traffic
├── No removal until recovered
└── Or timeout (45s default)
```

## ALB Routing Examples

### Host-Based Routing

```
Single ALB, multiple backends:

Host: admin.example.com → Admin servers
Host: api.example.com → API servers
Host: example.com → Web servers

Configuration:
ALB Listener → Rules
  ├── If Host = admin.example.com → Target group: admin
  ├── If Host = api.example.com → Target group: api
  └── Default → Target group: web
```

### Path-Based Routing

```
Single ALB, multiple backends:

Path: /api/* → API servers
Path: /admin/* → Admin servers
Path: /* → Web servers (default)

Use for: Microservices on shared ALB
```

### Hostname-Based Routing

Dynamic routing:

```
Listener: HTTPS:443
  ├── Host: *.example.com → Wildcard cert
  │   ├── admin.example.com → Admin TG
  │   ├── api.example.com → API TG
  │   └── app.example.com → App TG
  └── Host: example.com → Web TG
```

## Sticky Sessions

Keep user on same target:

```
Problem: Stateful app
├── User logs in on server A
├── Next request goes to server B
└── Session data lost!

Solution: Sticky sessions
├── ALB remembers user session
├── Subsequent requests → Same server
├── Stickiness duration: 1s - 7 days

Cost: Small performance hit
Use for: Legacy stateful apps
Modern: Use Redis/DynamoDB instead
```

## NLB Use Cases

### Real-Time Gaming

```
Server capacity: 100 players/server
Incoming players: 50,000/hour
NLB capacity: 1 million requests/sec

NLB handles:
├── Sub-millisecond connection
├── Low latency critical
└── Route to specific game server
```

### IoT Data Ingestion

```
Devices: 1 million IoT devices
Data rate: Every 10 seconds
NLB features:
├── UDP support (lightweight)
├── 1M+ requests/sec
├── Connection preservation
└── Extreme throughput
```

## SSL/TLS Termination

ALB terminates HTTPS:

```
Incoming: HTTPS (encrypted)
  ↓ (ALB terminates SSL)
Internal: HTTP (plaintext - fast)
  ↓ (to EC2)

Benefits:
├── Offload encryption to ALB
├── EC2 focuses on application
├── ALB handles SSL negotiation
└── Cheaper than EC2 SSL

Certificate:
├── ACM (free within AWS)
├── Multi-domain support
└── Auto-renewal

Alternatively:
└── End-to-end encryption (PrivateLink)
```

## ALB Access Logs

Debug issues:

```
Enable access logs:
ALB → Advanced attributes
  └── Enable access logs → S3 bucket

Log contains:
├── Request timestamp
├── Client IP
├── Request method/path
├── Response status
├── Bytes sent/received
├── Processing time
└── User agent

Query logs:
```
SELECT * FROM logs WHERE status_code >= 500
```
```

## Auto-Scaling Integration

```
Auto Scaling Group for ALB targets:

ALB health check:
  └── Marks instance unhealthy

ASG detects:
  └── Terminates unhealthy
  └── Launches replacement

Result:
└── Self-healing infrastructure
```

## ALB Cost Optimization

```
Charges:
├── ALB hourly: $0.0225/hour
├── LCU (New Connections): $0.006/LCU
├── LCU (Active Connections): $0.006/LCU
├── LCU (Processed bytes): $0.006/LCU
└── LCU (Rule evaluations): $0.006/LCU

Optimize:
├── Consolidate ALBs
├── Use target groups efficiently
├── Enable connection reuse
└── Tune health check frequency
```

## ⚠️ Common Mistakes

❌ **Health check path doesn't exist**
→ Path must return 2xx/3xx

❌ **ALB in single AZ**
→ Use multi-AZ for HA

❌ **No sticky sessions for stateful**
→ Use sticky or move state to cache

❌ **Security group blocks ALB**
→ Allow ALB security group on targets

❌ **SSL certificate expired**
→ Use ACM auto-renewal

## 🎯 Key Takeaways

✅ ALB for Layer 7 routing
✅ NLB for extreme performance
✅ Target groups organize backends
✅ Listener rules direct traffic
✅ Health checks keep traffic off failing instances
✅ Sticky sessions for stateful apps
✅ SSL termination at ALB layer
✅ Auto-scaling integration for resilience

---

**Load balancers are your app's traffic controller. Choose wisely!**

---

[← Previous: Route 53 - DNS Management](18-route53.md) | [Contents](README.md) | [Next: CloudFront - Content Delivery Network →](20-cloudfront.md)
