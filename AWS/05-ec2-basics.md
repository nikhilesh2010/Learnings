# EC2 Basics - Virtual Machines

## What is EC2?

**EC2 = Elastic Compute Cloud**

Your own virtual server in the cloud that you can:
- Start/stop/restart instantly
- Configure with different sizes
- Install any operating system
- Pay per hour of use

```
Traditional Server          EC2 Server
├── Physical hardware   ├── Virtual hardware
├── In data center      ├── AWS data center
├── Takes weeks to buy  ├── Available in seconds
├── Fixed capacity      ├── Adjustable anytime
├── Paid upfront        ├── Paid per hour
└── Difficult to scale  └── Scales automatically
```

## EC2 Use Cases

### 1. **Web Servers**
- Host websites, APIs, web applications
- Replace Apache/Nginx servers

### 2. **Application Servers**
- Run Java, Python, Node.js applications
- Process business logic

### 3. **Batch Processing**
- Process large datasets
- Scientific computing
- Image/video processing

### 4. **Development Environment**
- Developer workstations in cloud
- Accessible from anywhere

### 5. **Database Servers**
- MySQL, PostgreSQL, MongoDB
- Full control over configuration

## Instance Types

### Understanding Instance Naming

```
t2 . micro
│  │   │
│  │   └─ Size: nano, micro, small, medium, large, xlarge, 2xlarge, ...
│  │
│  └──── Generation: t2, t3, t4, ...
│
└────── Family/Type: t (burstable), m (general), c (compute), r (memory), ...
```

### Instance Families

#### **t2 - Burstable** (Low cost, background tasks)

```bash
t2.micro         1 vCPU, 1 GB RAM      $0.0116/hr
t2.small         1 vCPU, 2 GB RAM      $0.0232/hr
t2.medium        2 vCPU, 4 GB RAM      $0.0464/hr

CPU credits system: Earn credits at idle, spend when busy
Good for:  Web servers, dev/test, low traffic apps
```

#### **m5 - General Purpose** (Balanced)

```bash
m5.large         2 vCPU, 8 GB RAM      $0.096/hr
m5.xlarge        4 vCPU, 16 GB RAM     $0.192/hr
m5.2xlarge       8 vCPU, 32 GB RAM     $0.384/hr

Balance of compute/memory/network
Good for: Web applications, enterprise apps
```

#### **c5 - Compute Optimized** (CPU-intensive)

```bash
c5.large         2 vCPU, 4 GB RAM      $0.085/hr
c5.xlarge        4 vCPU, 8 GB RAM      $0.17/hr
c5.2xlarge       8 vCPU, 16 GB RAM     $0.34/hr

High CPU for processing-heavy tasks
Good for: Data processing, batch jobs, gaming servers
```

#### **r5 - Memory Optimized** (RAM-heavy)

```bash
r5.large         2 vCPU, 16 GB RAM     $0.126/hr
r5.xlarge        4 vCPU, 32 GB RAM     $0.252/hr
r5.2xlarge       8 vCPU, 64 GB RAM     $0.504/hr

Large memory for in-memory databases
Good for: In-memory caching, big data, databases
```

#### **i3 - Storage Optimized** (NVMe SSD)

```bash
i3.large         2 vCPU, 16 GB, 1900 GB NVMe SSD
i3.xlarge        4 vCPU, 32 GB, 1900 GB NVMe SSD

Ultra-fast local storage
Good for: Data warehouses, NoSQL databases, analytics
```

### Quick Sizing Guide

```bash
Website/Blog:              t2.micro (free tier)
Small web app:            t2.small or t2.medium
Medium traffic app:       m5.large
High CPU workload:        c5.large or c5.xlarge
Large database:           r5.xlarge or r5.2xlarge
Real-time analytics:      i3.xlarge
```

## Operating Systems

### Supported OS

```bash
Amazon Linux 2 (AWS optimized)    ✅ Recommended, optimized, free
Ubuntu (20.04 LTS recommended)    ✅ Popular, large community
CentOS / RHEL                     ✅ Enterprise
Windows Server 2019/2022          ⚠️ +$5-6/hr extra cost
Custom/Bring Your Own             ✅ Possible with licenses
```

### AMI (Amazon Machine Image)

Pre-configured templates with OS + software:

```bash
Public AMIs (free):
├── Amazon Linux 2
├── Ubuntu 20.04 LTS
├── CentOS 7/8
└── Windows Server

Community AMIs:
├── Docker containers
├── Bitnami stacks (LAMP, WordPress, etc.)
└── Popular frameworks

Custom AMI:
├── Create from running instance
├── Bake in your config/software
└── Faster deployment
```

## Launching an EC2 Instance

### Step-by-Step Console Walkthrough

```
1. AWS Console → EC2 → Instances
2. Click "Launch Instances"
3. Select AMI (Amazon Linux 2 recommended)
4. Choose instance type (t2.micro for free tier)
5. Configure details:
   - # instances: 1
   - Network: Default VPC
   - Subnet: Any
   - IAM role: None (for now)
   - Monitoring: Disable (default)
6. Add storage (default 8GB is fine)
7. Add tags:
   - Key: Name
   - Value: MyFirstServer
8. Security group (firewall rules):
   - SSH: Port 22, source 0.0.0.0/0
   - HTTP: Port 80, source 0.0.0.0/0
   - HTTPS: Port 443, source 0.0.0.0/0
9. Review and launch
10. Select key pair (or create new)
11. Launch!
```

## Security Groups (Firewall)

### What is a Security Group?

Virtual firewall controlling what traffic can reach instance:

```
┌─────────────────────┐
│   Internet/Users    │
└──────────┬──────────┘
           │
           ▼
    ┌──────────────────────────────┐
    │ Security Group (Firewall)    │
    ├──────────────────────────────┤
    │ Inbound Rules:               │
    │  - SSH (22): Allowed         │
    │  - HTTP (80): Allowed        │
    │  - HTTPS (443): Allowed      │
    │                              │
    │ Outbound Rules:              │
    │  - All: Allowed              │
    └──────┬───────────────────────┘
           │
           ▼
      ┌──────────────┐
      │ EC2 Instance │
      └──────────────┘
```

### Common Inbound Rules

```bash
SSH:                 Port 22    (remote login)
HTTP:               Port 80    (web traffic)
HTTPS:              Port 443   (encrypted web)
MySQL:              Port 3306  (database)
RDP:                Port 3389  (Windows remote)
Custom TCP:         Port XXXX  (application)
All traffic:        *          (NOT recommended!)
```

### Security Group Best Practices

```bash
✅ Principle of least privilege
   - Only open ports you need
   - Restrict source IP if possible
   
❌ Don't use 0.0.0.0/0 for database ports
   - 0.0.0.0/0 = entire internet can access

✅ Use different SGs for different tiers
   - Web security group (port 80, 443)
   - Database security group (port 3306)
   - Cache security group (port 6379)
```

## Key Pairs (SSH Access)

### What is a Key Pair?

Public-private cryptographic keys for secure login:

```
AWS stores:        Your computer stores:
  Public key   ←→    Private key
  (can share)        (keep secret!)
```

### During Launch

```bash
Option 1: Create new key pair (AWS generates)
  - Download .pem file (private key)
  - Save it securely!
  - Used for SSH access

Option 2: Use existing key pair
  - Choose from previous key pairs
  - Need private key on your computer
```

### SSH Into Instance

```bash
# Get instance's public IP from console
# On Windows with Git Bash:
ssh -i my-key.pem ec2-user@54.123.45.67

# On Mac/Linux:
# (same command, -i specifies private key)

# First login prompts: "Is this the real host?" → yes
# You're in!
```

### Lost Private Key?

```bash
❌ Cannot recover
⚠️  You CAN:
  1. Terminate instance
  2. Create new instance with existing or new key
  3. Restore from backup/AMI
```

## Elastic IPs

### Static IP Address

Regular IPs change when instance stops:

```
Instance starts:     54.123.45.67
Instance stops:      (IP released)
Instance starts:     54.98.76.54 (different!)
```

### Elastic IP (Static)

```
Allocate Elastic IP:  203.0.113.5
Assign to instance:   Same IP forever!
Even after stop/restart: 203.0.113.5
Reassign to other instance: Same IP, different host
```

### Cost

```bash
Using:    FREE
Unused:   $3.65/month ❌ (common mistake!)

Tip: Release unused Elastic IPs!
```

## Instance States

### Lifecycle

```
┌──────────┐
│ Running  │ ← Instance operational
│          │   CPU/RAM in use
│          │   Charges accumulate
└────┬─────┘
     │ (Stop)
     ▼
┌──────────┐
│ Stopped  │ ← Instance off
│          │   Storage/IP retained
│          │   Charges STOP
└────┬─────┘
     │ (Start)
     ▼
┌──────────┐
│ Running  │ ← Back online
└──────────┘

(Terminate) ← Permanently delete!
```

## Saving Money on EC2

### Strategy 1: Reserved Instances (RI)

```bash
On-Demand:   t2.micro = $8.47/month
1-year RI:   t2.micro = $5/month (41% savings!)
3-year RI:   t2.micro = $3.90/month (54% savings!)
```

### Strategy 2: Spot Instances

```bash
On-Demand:  $0.0116/hour
Spot:       $0.0035/hour (70% discount!)
```

Use for non-critical, interruptible workloads

### Strategy 3: Auto Scaling

```bash
Don't run large instances 24/7
↓
Run small instance baseline
↓
Auto-scale up during peak
↓
Scale back down off-hours
```

## ⚠️ Common Mistakes

❌ **Forgetting security groups**
→ Set up before connecting

❌ **Using 0.0.0.0/0 for everything**
→ Principle of least privilege

❌ **Leaving instances running when not needed**
→ Stop dev instances overnight

❌ **Not backing up critical data**
→ Use EBS snapshots

❌ **Losing private key**
→ Keep secure backup

## 🎯 Key Takeaways

✅ EC2 = virtual servers in cloud
✅ Pay per hour, start/stop anytime
✅ Instance families: t (burstable), m (general), c (compute), r (memory)
✅ Security groups control inbound/outbound traffic
✅ Key pairs used for SSH access
✅ Elastic IPs for static addresses (costs $3.65 if unused!)
✅ Use RI/Spot for cost savings

## 🚀 Hands-On Exercise

1. ☑️ Launch t2.micro Amazon Linux 2 instance
2. ☑️ Configure security group (SSH, HTTP)
3. ☑️ Generate key pair, download
4. ☑️ SSH into instance
5. ☑️ Run: `cat /etc/os-release`
6. ☑️ Stop instance (costs stop!)
7. ☑️ Start instance again
8. ☑️ Terminate when done

---

**EC2 is the foundation of AWS compute. Master it well!**

---

[← Previous: AWS Pricing & Cost Management](04-pricing.md) | [Contents](README.md) | [Next: EC2 - Advanced Features →](06-ec2-advanced.md)
