# CloudFront - Content Delivery Network

## CloudFront Basics

**What:** Global content delivery network that caches your content closer to users.

**Why we use it:** If your content is in one region but users are worldwide, they experience slow latency. CloudFront puts copies in 400+ locations worldwide.

**How CloudFront works:**

```
Without CloudFront:
User in Tokyo
  ↓ (slow, 200ms latency)
Origin in us-east-1

With CloudFront:
User in Tokyo
  ↓ (fast, 20ms latency)
Edge location in Tokyo (cached copy)
  ├── Cache hit? Return immediately!
  └── Cache miss? Fetch from origin us-east-1

Cost savings:
├── Data transfer cheaper from edge location
├── Origin load reduced
└── Better user experience
```

**Simple example:**
```
Website with images hosted in S3 (us-east-1):

Without CloudFront:
├── User in Sydney downloads 5MB image
├── Travels across entire Pacific (200ms latency)
├── Network cost: $0.09/GB (expensive!)

With CloudFront:
├── User in Sydney downloads image (20ms latency - instant!)
├── Served from edge location in Sydney
├── Network cost: $0.085/GB (slightly better)
├── User experience: 10x faster!

Result:
├── Happy users
├── Faster page loads
├── Better SEO rankings
├── Lower bandwidth costs
```

## How CloudFront Works

```
Request flow:

1. User requests example.com/image.jpg
2. CloudFront edge location checks cache
   ├── Hit: Return immediately (fast!)
   └── Miss: Fetch from origin
3. Origin returns image
4. Edge caches for TTL
5. Next user (same content): Cache hit!

Cost:
├── Requests: $0.0075/10k requests
├── Data transfer: $0.085/GB (varies by region)
└── Caching reduces origin costs
```

## Distribution Setup

Create distribution:

```
Configuration:
├── Origin: S3, ALB, EC2, custom
├── Behaviors: Path patterns (/*, /api/*, /static/*)
├── Caching: TTL settings
├── Compression: On/Off
├── SSL: HTTPS required?
├── Geo-restrictions: Block countries?
└── Web ACL: DDoS/bot protection?
```

## Caching Behavior

```
HTTP cache headers:
├── Cache-Control: max-age=3600 (1 hour)
├── Expires: Fri, 01 Jan 2025 00:00:00 GMT
└── Etag: Version identifier

CloudFront respects headers:
  └── Or uses defaults (24 hours)

Override in distribution:
  └── Minimum TTL, Maximum TTL, Default TTL
```

## Origins

Data source for CloudFront:

### S3 Origin

```
S3 bucket:
└── CloudFront downloads content

Benefits:
├── Automatic compression
├── OAI (Origin Access Identity) - private bucket
├── Cheap data transfer ($0 within AWS region)
└── Versioning support

Setup:
└── CloudFront → S3 bucket
    └── OAI automatically created
```

### ALB/HTTP Origin

```
Custom origin (any HTTP endpoint):
├── ALB
├── API Gateway
├── Custom web server
└── Anything with HTTP

Configuration:
├── Domain name
├── Port (80 or custom)
├── Protocol (HTTP or HTTPS)
└── Path prefix (optional)
```

## Caching Strategies

### Cache Everything

```
Cache headers not respected:
├── Never check origin
├── All content cached for TTL
├── Cheap origin, high edge cost
└── Static content (images, CSS, JS)
```

### TTL Based

```
Respect origin headers:
├── Check Cache-Control header
├── If missing, use TTL
├── Balance freshness vs cost

Example:
├── Static assets: 1 year TTL
├── HTML: 5 minutes TTL
└── API: 0 (no caching)
```

### Query String Caching

```
Same URL, different query strings:

/products?page=1 (different from)
/products?page=2

Options:
├── Cache all: same cache for all queries
├── Whitelist: only cache specific query params
└── Whitelist all: unique cache per query param

Avoid: /search?q=user_input (infinite cache!)
```

## CloudFront Features

### Geo-Restriction

Block by geography:

```
Whitelist countries:
├── Only US, Canada, UK allowed
└── Others: Blocked

Or Blacklist:
├── Block China, Russia
└── Everyone else: Allowed

Use for:
├── Licensing restrictions
├── Compliance
├── Content localization
```

### Origin Failover

Automatic failover:

```
Primary origin: ALB us-east-1
  ├── Health check every 30 seconds
  └── On failure...

Secondary origin: ALB us-west-2
  ├── Receives traffic
  └── Primary recovers...

Automatic recovery to primary

Cost: Health check $0.60/month
```

### Lambda@Edge

Run code at edge locations:

```
Traditional:
Request → CloudFront → Origin → Process

Lambda@Edge:
Request → CloudFront → Lambda @ edge location
  ├── Modify request
  ├── Validate auth token
  └── Return immediately (no origin hit)

Use for:
├── A/B testing
├── Authentication
├── Header manipulation
└── Bot filtering

Cost: $0.60 per 1 million function invocations
```

### Field-Level Encryption

Encrypt sensitive fields:

```
Credit card field: Encrypted at edge
  └── Only origin can decrypt

Use for:
├── PCI-DSS compliance
├── Protect data in transit
└── Origin has encryption key

Configuration:
├── CloudFront public key
├── Origin private key
└── Encrypt specified fields
```

## Security Features

### AWS WAF Integration

Protect against attacks:

```
CloudFront → AWS WAF
  ├── Block SQL injection
  ├── Block XSS attacks
  ├── Rate limiting
  ├── Geo-blocking
  └── Custom rules

Cost: ~$5 base + per rules
```

### DDoS Protection

AWS Shield Standard (free):

```
Automatic DDoS mitigation:
├── Layer 3 attacks
├── Layer 4 attacks
└── Included with CloudFront
```

AWS Shield Advanced (paid):

```
Enhanced protection:
├── Layer 7 attacks (application)
├── Larger attacks (TB scale)
├── DDoS response team (DRT)
└── Cost: $3,000/month
```

## Content Versioning

Handle updates:

```
Problem: Browser cache
├── User downloads style.css
├── You update style.css
┗─ User still sees old version!

Solution: Version in filename
├── style.css (generic)
├── style-v1.css
├── style-v2.css (new version)
└── Update HTML to link new version

CloudFront invalidates:
  └── /style.css (bust cache)
  └── Cost: $0.005 per path (first 100 free)
```

## CloudFront Costs

```
Pricing (US):
├── Requests: $0.0075/10k requests
├── Data transfer out: $0.085/GB
└── Origin shield: $0.01/GB (optional, caching layer)

Optimization:
├── Use Origin Shield for high-traffic origins
├── Compress content (3x smaller)
├── Use CloudFront for all static content
├── Longer TTL where possible
```

## ⚠️ Common Mistakes

❌ **TTL too short**
→ High origin traffic, add cache

❌ **TTL too long**
→ Updates slow to propagate, invalidate instead

❌ **Not compressing**
→ Enable gzip compression (3x smaller)

❌ **Caching errors**
→ Cache error responses short, or not at all

❌ **No invalidation**
→ Plan version strategy

## 🎯 Key Takeaways

✅ CloudFront speeds up content globally
✅ TTL balances freshness vs cost
✅ Origins can be S3, ALB, or custom
✅ Origin Shield for high-traffic
✅ Lambda@Edge for edge processing
✅ WAF integration for security
✅ Geo-restriction for compliance
✅ Proper versioning strategy

---

**CloudFront makes your content fast globally!**

---

[← Previous: Elastic Load Balancing (ALB/NLB)](19-elastic-load-balancing.md) | [Contents](README.md) | [Next: Container Services - ECS & EKS →](21-container-services.md)
