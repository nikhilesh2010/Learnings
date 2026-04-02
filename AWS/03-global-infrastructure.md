# AWS Global Infrastructure

## Understanding the Architecture

AWS infrastructure is organized hierarchically to ensure reliability, performance, and compliance.

## Geographic Regions

### What is a Region?

A region is a **completely independent geographic area** with its own resources:

```
┌─────────────────────────────────────────┐
│         AWS Region (us-east-1)          │
│  ┌───────────────┐  ┌──────────────┐    │
│  │ Availability  │  │ Availability │    │
│  │ Zone 1 (a)    │  │ Zone 2 (b)   │    │
│  │               │  │              │    │
│  │ [Servers]     │  │ [Servers]    │    │
│  └───────────────┘  └──────────────┘    │
│  └───────────────┐  ┌──────────────┐    │
│  │ Availability  │  │ Availability │    │
│  │ Zone 3 (c)    │  │ Zone 4 (d)   │    │
│  │               │  │              │    │
│  │ [Servers]     │  │ [Servers]    │    │
│  └───────────────┘  └──────────────┘    │
└─────────────────────────────────────────┘
```

### Why Separate Regions?

1. **Disaster Recovery** - Protect against regional failures
2. **Compliance** - Data sovereignty laws (GDPR, etc.)
3. **Latency** - Serve users from nearby region
4. **Redundancy** - Geographic diversity

### Current AWS Regions (30+)

```
North America:
  us-east-1 (N. Virginia)        ← Most popular, most services
  us-east-2 (Ohio)
  us-west-1 (N. California)
  us-west-2 (Oregon)
  ca-central-1 (Canada)

Europe:
  eu-west-1 (Ireland)            ← Entry to EU
  eu-west-2 (London)
  eu-central-1 (Frankfurt)       ← Central Europe, best for GDPR
  eu-north-1 (Stockholm)

Asia Pacific:
  ap-southeast-1 (Singapore)
  ap-southeast-2 (Sydney)
  ap-northeast-1 (Tokyo)
  ap-south-1 (Mumbai)

Middle East & Africa:
  me-south-1 (Bahrain)

South America:
  sa-east-1 (São Paulo)
```

**New regions added regularly!**

## Availability Zones (AZs)

### What is an Availability Zone?

An AZ is a **physically isolated data center** within a region:

```
Region: us-east-1
├── AZ: us-east-1a (Data center 1)
├── AZ: us-east-1b (Data center 2)
├── AZ: us-east-1c (Data center 3)
└── AZ: us-east-1d (Data center 4)

All connected with low-latency, dedicated fiber
```

### Key Characteristics

- **Physically separate** - Different buildings, but close
- **Low-latency connectivity** - <1ms between AZs
- **Redundancy** - Fail-safe architecture
- **Multiple per region** - Usually 3-4 AZs

### Typical Architecture

```
┌────────────────────────────────────┐
│         Region (us-east-1)         │
│                                    │
│  ┌──────────┐      ┌──────────┐    │
│  │   AZ 1   │      │   AZ 2   │    │
│  │ ┌──────┐ │      │ ┌──────┐ │    │
│  │ │EC2   │ │      │ │EC2   │ │    │  High Availability:
│  │ └──────┘ │      │ └──────┘ │    │  Traffic balances across AZs
│  │ ┌──────┐ │      │ ┌──────┐ │    │  If AZ1 fails, AZ2 takes over
│  │ │RDS   │ │      │ │RDS   │ │    │
│  │ └──────┘ │      │ └──────┘ │    │
│  └────┬─────┘      └────┬─────┘    │
│       └────┬─────────┬──┘          │
│            │Low-lat  │             │
│            │fiber    │             │
└────────────┼─────────┼─────────────┘
             └────┬────┘
              Elastic Load Balancer
```

## Local Zones

### AWS Local Zones

For ultra-low latency applications:

```
Region (us-east-1)
└── Local Zone: New York (us-east-1-nyc)   ← <5ms to NYC

Region (us-west-2)
└── Local Zone: Los Angeles (us-west-2-la) ← <5ms to LA
```

**Use cases:**
- Real-time gaming
- IoT applications
- High-frequency trading

## Wavelength Zones

### Edge Computing

5G network integration for mobile/edge computing:

```
┌──────────────────┐
│  Wavelength Zone │ ← AWS Infrastructure inside 5G networks
│  (5G carrier)    │   Ultra-low latency (sub-10ms)
└──────────────────┘
```

## Edge Locations (CloudFront)

### What are Edge Locations?

Cache and distribution points for content delivery:

```
400+ CloudFront Edge Locations Worldwide
└── Closest to end users
└── Cache content locally
└── Reduce latency
└── Reduce bandwidth costs
```

### Examples

```
User in Paris wants image
  → Request goes to nearest edge location (London)
  → Already cached? Return from cache (fast!)
  → Not cached? Fetch from origin, cache, return
```

## How to Choose a Region

### 1. **Latency**

```bash
Measurement: round-trip time (RTT) to users

Users in Europe     → eu-west-1 (Ireland)
Users in Asia       → ap-southeast-1 (Singapore)
Users in N. America → us-east-1 (N. Virginia)
Global users        → Multi-region deployment
```

### 2. **Compliance & Data Residency**

```bash
GDPR (Europe)           → eu-central-1 (Frankfurt)
China operations        → cn-north-1 (Beijing, special access)
Financial data (USA)    → us-east-1, us-west-2
Data sovereignty strict → Check regional availability
```

### 3. **Service Availability**

Not all services available in all regions:

```bash
// Check service availability!
us-east-1:   ALL 200+ services ✅
ap-south-1:  ~150 services ⚠️
me-south-1:  ~100 services ❌
```

Check: https://aws.amazon.com/about-aws/global-infrastructure/regional-product-services/

### 4. **Pricing**

Varies by region:

```
us-east-1 (Virginia)   ← Usually cheapest
eu-west-1 (Ireland)    ← +10-15% more expensive
ap-south-1 (Mumbai)    ← +20-30% more expensive
cn-north-1 (Beijing)   ← +50% more expensive
```

## High Availability Deployment Pattern

### Single AZ (❌ Not Recommended)

```
Region: us-east-1
└── AZ: us-east-1a
    ├── EC2 instance
    ├── RDS database
    └── [Single point of failure!]
```

**Problem:** One data center fire → entire service down

### Multi-AZ (✅ Recommended)

```
Region: us-east-1
├── AZ: us-east-1a
│   ├── EC2 instance
│   └── RDS primary
├── AZ: us-east-1b
│   ├── EC2 instance
│   └── RDS standby
└── Load Balancer (balances traffic)
```

**Benefits:**
- Survives AZ failure
- Automatic failover
- 99.99% uptime

### Multi-Region (✅✅ Maximum Reliability)

```
┌─────────────────────────────────────┐
│   Route 53 (Global DNS)             │
│   Routes traffic to nearest region  │
└───────────┬──────────┬──────────────┘
            │          │
    ┌───────▼──┐   ┌───▼───────┐
    │Region 1  │   │Region 2   │
    │us-east-1 │   │eu-west-1  │
    └──────────┘   └───────────┘
```

**For disaster recovery, compliance, global reach**

## AWS Local Zones & Wavelength Decision Tree

```
Do you need ultra-low latency?
│
├─ Yes, <10ms, in NYC/LA area
│  └─ Use Local Zone
│
├─ Yes, <10ms, for mobile/5G
│  └─ Use Wavelength Zone
│
└─ No, <100ms acceptable
   └─ Use standard AZs
```

## Regional Data Transfer Costs

### Data Transfer Pricing

```
Within same AZ:     FREE
Between AZs:        $0.01/GB (significant!)
Between regions:    $0.02+ /GB (very expensive!)
Outbound to internet: $0.09+/GB (most expensive)

TIP: Design to minimize cross-region traffic!
```

## VPN Endpoints by Region

For compliance-strict workloads:

```
us-east-1
├── VPC Endpoint A
├── VPC Endpoint B
└── VPC Endpoint C

eu-central-1
└── VPC Endpoint (GDPR compliant)
```

## 🎯 Key Takeaways

✅ AWS has 30+ regions worldwide
✅ Each region has 3-4 Availability Zones
✅ AZs are physically separate but closely networked
✅ Choose region based on latency, compliance, cost, services
✅ High availability requires multi-AZ deployment
✅ Data transfer between regions is expensive
✅ 400+ edge locations for content delivery

## Quick Reference

```bash
Most popular:     us-east-1 (N. Virginia)
EU/GDPR:         eu-central-1 (Frankfurt)
Asia:            ap-southeast-1 (Singapore)
Best latency:    Choose closest to users
Most services:   Stick with us-east-1 for learning
```

---

**Remember:** Infrastructure locations matter for performance, compliance, and cost!

---

[← Previous: AWS Account Setup & Console Navigation](02-account-setup.md) | [Contents](README.md) | [Next: AWS Pricing & Cost Management →](04-pricing.md)
