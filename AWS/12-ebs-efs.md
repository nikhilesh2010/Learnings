# EBS & EFS - Block & File Storage

## Elastic Block Storage (EBS)

### EBS Volume Types

```
General Purpose (gp3) - RECOMMENDED:
├── SSD (fast)
├── Baseline: 3000 IOPS, 125 MB/s
├── Can increase: Up to 16,000 IOPS, 1000 MB/s
├── Cost: $0.08/GB/month
└── Use for: Most workloads

Provisioned IOPS (io2):
├── SSD (very fast)
├── Can provision: 64,000 IOPS per volume
├── Good for: Databases, intensive I/O
└── Cost: Higher (premium performance)

Throughput Optimized (st1) - HDD:
├── Slower but cheaper
├── 125-500 MB/s
├── Cost: $0.045/GB/month
└── Use for: Big data, data warehouses

Cold Storage (sc1) - HDD:
├── Cheapest
├── Cost: $0.015/GB/month
└── Use for: Archives, cold storage
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
