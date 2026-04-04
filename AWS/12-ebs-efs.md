# EBS & EFS - Block & File Storage

## Elastic Block Storage (EBS)

**What:** Persistent storage volumes that attach to EC2 instances (like a hard drive for your VM).

**Why we use it:** EC2 instances lose data when stopped. EBS keeps your data persistent.

**How it works:**

```
EC2 without EBS:
├── Data in instance storage
├── Instance stops → Data LOST
├── Not suitable for production

EC2 with EBS:
├── EBS volume attached
├── Instance stops → Data SAFE
├── Survives failures
└── Can be backed up (snapshots)
```

**Simple example:**

```
Run web application on EC2:

Without EBS (BAD):
1. Launch ec2 instance
2. Install Nginx web server
3. Upload website files
4. EC2 fails → All files LOST!
5. Have to setup everything again

With EBS (GOOD):
1. Create EBS volume (like buying hard drive)
2. Attach to EC2 instance
3. Put website files on EBS
4. EC2 fails → EBS volume preserved
5. Attach EBS to new EC2 instance
6. Website back online immediately!

Cost:
├── EBS: $0.10/GB/month
└── Example: 100GB drive = $10/month
```

### Volume Types

**gp3 (General Purpose) - RECOMMENDED:**
- SSD (fast)
- $0.08/GB/month
- Good for: Most workloads, web servers

**io2 (Provisioned IOPS):**
- Very fast SSD
- For: Databases requiring high IOPS
- More expensive

**st1 (Throughput Optimized) - HDD:**
- Slower but cheaper ($0.045/GB)
- For: Big data, sequential reads

### EBS Snapshots

**What:** Backup of your EBS volume at a point in time.

**Why:** For disaster recovery, copying volumes, creating AMIs.

**How:**
```bash
# Create snapshot
aws ec2 create-snapshot --volume-id vol-xxxxx

# Snapshot stored in S3 (invisible to you)
# Later: Create new EBS volume from snapshot
aws ec2 create-volume --snapshot-id snap-xxxxx
```

### EBS Snapshots

```
Point-in-time backup:

Create snapshot:
aws ec2 create-snapshot --volume-id vol-xxxxx

Result:
├── Stored in S3 (behind scenes)
├── Incremental (only changes)
├── Can be copied to other regions
├── Can create AMI from snapshot

Restore:
aws ec2 create-volume --snapshot-id snap-xxxxx

Cost:
└── $0.05 per GB-month (S3 storage)
```

### Volume Encryption

```
Encryption:
├── Enabled by default (AWS KMS)
├── Minimal performance impact
├── In-flight encryption
├── At-rest encryption

Create encrypted volume:
aws ec2 create-volume \
  --size 100 \
  --region us-east-1 \
  --availability-zone us-east-1a \
  --encrypted

Encrypt existing:
1. Create snapshot
2. Copy with encryption
3. Create volume from encrypted copy
```

### EBS Optimization

```
EBS-Optimized instances:
├── Dedicated bandwidth to EBS
├── Consistent performance
├── No resource contention
└── Small cost increase (~$0.05/hour)

Benefits:
├── Predictable I/O
├── Better throughput
└── Good for: Databases, high I/O apps
```

## Elastic File System (EFS)

### EFS vs EBS

```
EBS:
├── Block storage (volumes)
├── Single instance
├── Local to AZ
├── Faster, lower latency
└── Cheaper per GB

EFS:
├── File storage (NFS)
├── Multiple instances simultaneously
├── Multi-AZ
├── Shared across EC2/Lambda/containers
├── Higher cost
```

### EFS Architecture

```
EFS Mount Target (in each AZ):
├── EC2 in us-east-1a → Mount target in 1a
├── EC2 in us-east-1b → Mount target in 1b
└── EC2 in us-east-1c → Mount target in 1c

All instances can:
├── Read the same files
├── Write simultaneously
├── Share data
```

### Creating & Mounting EFS

```
Create EFS:
aws efs create-file-system \
  --performance-mode generalPurpose \
  --throughput-mode bursting

Create mount targets:
aws efs create-mount-target \
  --file-system-id fs-xxxxx \
  --subnet-id subnet-xxxxx \
  --security-groups sg-xxxxx

Mount on EC2:
sudo mount -t nfs4 -o nfsvers=4.1,rsize=1048576,wsize=1048576,hard,timeo=600,retrans=2 \
  fs-xxxxx.efs.us-east-1.amazonaws.com:/ /mnt/efs
```

### EFS Performance Modes

```
General Purpose (default):
├── Recommended for most workloads
├── Lower latency
└── Best for: Web servers, CMS, CI/CD

Max I/O:
├── Optimized for high throughput
├── Higher latency
└── Best for: Big data analytics, media processing
```

### EFS Throughput Modes

```
Bursting (default):
├── Baseline: 50 KB/s per GB stored
├── Burst to higher throughput
├── Good for: Variable workloads
└── Cheaper

Provisioned:
├── Set specific throughput (MB/s)
├── Consistent performance
├── Good for: Predictable high throughput
└── More expensive
```

## When to Use Each

```
Use EBS when:
├── Single instance needs storage
├── High performance needed
├── Cost optimization priority
└── Instance-specific data

Use EFS when:
├── Multiple instances need same files
├── Shared content management
├── Container workloads
├── Multi-AZ coverage needed
└── Collaborative environments
```

### Storage Comparison

| Metric | EBS | EFS |
|--------|-----|-----|
| Access | Single instance | Multiple instances |
| Performance | Very fast | Good |
| Cost/GB | $0.08 (gp3) | $0.30 |
| Redundancy | Single AZ | Multi-AZ |
| Setup | Easy | Moderate |

## EFS Use Cases

### Web Content Management

```
WordPress site:
├── EFS mounts to 3 EC2 instances
├── All instances share /wp-content/uploads
├── Users see synchronized content
├── Auto-scaling uses same EFS
```

### Container Orchestration

```
Kubernetes cluster:
├── Pods need persistent storage
├── EFS provides shared volume
├── StatefulSets use EFS
├── Replicas see shared data
```

### CI/CD Pipeline

```
Build servers:
├── Source code on EFS
├── All build servers access same code
├── Build artifacts shared
├── Cost-effective for dev
```

## ⚠️ Common Mistakes

❌ **EBS snapshots without encryption**
→ Copy with encryption enabled

❌ **EBS volumes exceeding size limit**
→ Monitor usage, expand before full

❌ **Not using gp3 (using older gp2)**
→ gp3 better performance, same price

❌ **EFS for single instance**
→ Use EBS (cheaper, faster)

❌ **EFS security group not allowing NFS**
→ Allow port 2049 in security group

## 🎯 Key Takeaways

✅ EBS = block storage, single instance
✅ gp3 recommended for most workloads
✅ Snapshots for backup (incremental)
✅ EFS = file storage, multi-instance
✅ EFS useful for shared data
✅ Always encrypt sensitive data
✅ Match storage to access pattern

---

**EBS and EFS serve different storage needs. Choose wisely!**

---

[← Previous: S3 - Advanced Features & Optimization](11-s3-advanced.md) | [Contents](README.md) | [Next: Glacier & Backup Services →](13-backup-services.md)
