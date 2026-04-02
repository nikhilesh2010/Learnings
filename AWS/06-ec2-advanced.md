# EC2 - Advanced Features

## Advanced Instance Configurations

### Placement Groups

Control EC2 instance placement within a cluster:

```
Cluster Placement Group:
├── Low-latency, high-throughput
├── Same AZ, close physical proximity
├── <1ms latency between instances
└── Use for: HPC, big data, real-time apps

Partition Placement Group:
├── Spread across partitions
├── Each partition = separate rack
├── Isolate failure domains
└── Use for: Hadoop, Kafka, distributed systems

Spread Placement Group:
├── Spread across different hardware
├── Max 7 instances per AZ
├── Minimize correlated failures
└── Use for: Critical workloads
```

### Instance Metadata & User Data

Access instance information:

```bash
# From within EC2 instance:
curl http://169.254.169.254/latest/meta-data/

Returns:
├── ami-id: Instance's AMI
├── instance-id: Instance ID
├── instance-type: t2.micro, etc.
├── local-ipv4: Private IP
├── public-ipv4: Public IP
├── security-groups: SG names
├── iam/info: IAM role name
└── user-data: Launch script output
```

User data (runs on launch):

```bash
#!/bin/bash
yum update
yum install httpd
systemctl start httpd

# Write to instance metadata for tracking
echo "Server started at $(date)" > /var/www/html/index.html
```

### Hibernation

Pause and resume instances:

```
Benefits:
├── Persist RAM to disk
├── Quick resume (seconds not minutes)
├── Maintain connections
├── Good for: Expensive computations, stateful apps

Drawbacks:
├── Only for specific instance types
├── EBS volume must be encrypted
└── Cost: ~3x more than stopped

Enable:
EC2 Launch → Advanced Details → Hibernation → Enable
```

### Dedicated Hosts

Entire physical server for your use:

```
Use for:
├── License compliance (BYOL)
├── Regulatory requirements
├── Performance consistency
└── Cost: ~3-4x premium

vs. Dedicated Instances (share hardware with other AWS customers' instances)
```

## Advanced Storage

### Elastic Block Store (EBS)

Persistent block storage for EC2:

```
Volume types:
├── gp2: General purpose (SSD)
├── gp3: Newer, better price/performance
├── io1: Provisioned IOPS (premium)
├── st1: Throughput optimized (HDD)
└── sc1: Cold storage (HDD)

Snapshots:
├── Point-in-time backup
├── Copy across regions
├── Create AMI from snapshot
├── Incremental saves

Encryption:
├── Enabled by default (AWS KMS)
├── In-flight + at-rest
└── Minimal performance impact
```

### EBS-Optimized Instances

Dedicated bandwidth to EBS:

```
Benefits:
├── Consistent IOPS
├── No competition for bandwidth
├── Good for: Databases, high I/O apps

Cost:
├── Small premium (~10%)
└── Pays back on I/O heavy workloads
```

## Advanced Networking

### Elastic Network Interfaces (ENIs)

Virtual network interfaces:

```
Attach multiple ENIs to instance:
├── Primary ENI (cannot detach): eth0
├── Secondary ENI 1: eth1
├── Secondary ENI 2: eth2
└── Up to ~128 (depends on instance type)

Use cases:
├── Multi-homed instances
├── Dual-stack (IPv4 + IPv6)
├── License by MAC address
└── Migration without stopping
```

### Enhanced Networking

High-performance networking:

```
SR-IOV (Single Root I/O Virtualization):
├── Bypass hypervisor
├── Direct access to network card
├── Lower latency
├── Higher throughput

Enable:
├── EC2 instance type: Must support
├── Driver: ena (Elastic Network Adapter)
└── Performance: 10 Gbps+ vs 1 Gbps standard
```

### ENA (Elastic Network Adapter)

```
Features:
├── 100 Gbps bandwidth
├── <10 microsecond latency
├── 30M packets/second
└── Use for: High-performance computing
```

## Advanced Security

### Nitro System

AWS's custom hypervisor:

```
Benefits:
├── Better performance
├── Stronger isolation
├── Lower overhead
├── More resources for instances

Security:
├── TPM 2.0 (Trusted Platform Module)
├── Secure Boot
├── Measured Boot
└── Good for regulated workloads
```

### Systems Manager Session Manager

Access instances without SSH:

```
Benefits:
├── No public IP needed
├── No SSH keys needed
├── All actions logged
├── IAM-based access control
├── Works through VPN/Direct Connect

Requirements:
├── IAM role with SSM permissions
├── SSM agent (installed by default)
├── Outbound HTTPS to SSM service

Usage:
aws ssm start-session --target i-xxxxx
```

### EC2 Image Builder

Automate AMI creation:

```
Pipeline:
1. Start from base image
2. Apply updates + customizations
3. Test with InSpec
4. Create AMI
5. Distribute to regions

Benefits:
├── Consistent, reproducible AMIs
├── Automated testing
├── Multi-region distribution
└── Compliance validation
```

## Monitoring & Troubleshooting

### CloudWatch Agent

Deep OS-level monitoring:

```
Metrics:
├── Memory usage (not available by default!)
├── Disk space
├── Processes
├── Custom metrics from applications

Install:
aws ssm send-command \
  --document-name "AWS-ConfigureAWSPackage" \
  --instance-ids i-xxxxx \
  --parameters '{"action":["Install"],"name":["AmazonCloudWatchAgent"]}'

Configuration:
└── Stored in Systems Manager Parameter Store
└── Applied to instances
```

### Status Checks

```
System Status Checks:
├── Network connectivity
├── Power/hardware
├── AWS infrastructure
└── Red: Need to stop/start (migrate)

Instance Status Checks:
├── OS-level checks
├── Kernel panic, disk issues
└── Yellow: Might resolve quickly
└── Red: Need reboot or troubleshoot
```

### CloudWatch Logs

```
Agent streams:
├── /aws/ec2/system-logs
├── /aws/ec2/application-logs
└── Custom application logs

Query with Insights:
fields @timestamp, @message
| filter @message like /ERROR/
| stats count() as errors
```

## AMI (Amazon Machine Image)

### Creating Custom AMIs

```
Process:
1. Launch instance
2. Install software + configuration
3. Test thoroughly
4. Create image:
   aws ec2 create-image --instance-id i-xxxxx --name my-app-v1

Result:
├── AMI ID: ami-xxxxxxxxx
├── EBS snapshots created
└── Ready to launch from
```

### AMI Management

```
Public AMIs:
├── Owned by AWS
├── Community AMIs (user-created)
├── Vendor AMIs (licensed)
└── Free to use (but charge for instances)

Custom AMIs:
├── Version control (my-app-v1, v2, v3)
├── Share across accounts
├── Maintain consistently
└── Tag for organization
```

## ⚠️ Common Pitfalls

❌ **Not backing up EBS volumes**
→ Create snapshots regularly

❌ **Single ENI for multiple traffic types**
→ Use multiple ENIs for isolation

❌ **Ignoring status checks**
→ Check when instance unresponsive

❌ **Large AMIs slowing deployment**
→ Minimize software in base AMI

## 🎯 Key Takeaways

✅ Placement groups for performance
✅ EBS best practices and snapshots
✅ Enhanced networking for high performance
✅ Systems Manager for secure access
✅ Status checks for troubleshooting
✅ Custom AMIs for consistency
✅ CloudWatch agent for deep monitoring

---

**Advanced EC2 features power enterprise applications!**

---

[← Previous: EC2 Basics - Virtual Machines](05-ec2-basics.md) | [Contents](README.md) | [Next: Lambda - Serverless Computing →](07-lambda.md)
