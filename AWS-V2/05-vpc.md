# VPC - Virtual Private Cloud

## 1. What is VPC?

A **Virtual Private Cloud (VPC)** is a logically isolated network in AWS where you launch resources.

- **Isolated**: Your own virtual network (10-million customer accounts → 10-million isolated networks)
- **Customizable**: Define IP address space, subnets, route tables, gateways, security
- **Multi-AZ**: Subnets span AZs for high availability
- **Hybrid connectivity**: Connect on-premises data center via VPN or Direct Connect
- **Default VPC**: AWS creates one per region automatically (simple, not recommended for production)

### Key Concepts

```
Region (us-east-1)
│
├─ VPC (10.0.0.0/16)
│  │
│  ├─ Subnet 1A (10.0.1.0/24) ← AZ-a
│  │  ├─ EC2 instance (10.0.1.10)
│  │  └─ RDS database (10.0.1.20)
│  │
│  ├─ Subnet 1B (10.0.2.0/24) ← AZ-b
│  │  └─ EC2 instance (10.0.2.10)
│  │
│  ├─ Internet Gateway ← Public access
│  ├─ NAT Gateway ← Private egress
│  ├─ Route Tables
│  └─ Security Groups / NACLs ← Firewalls
```

---

## 2. Subnets

A **subnet is a range of IP addresses** in a VPC, bound to one AZ.

### Public vs Private Subnet

| Aspect | Public | Private |
|--------|--------|---------|
| **Internet access** | Direct (via IGW) | Via NAT Gateway (out only) |
| **Assign public IP** | Yes (required for internet) | No (but can use NAT) |
| **Use case** | Web servers, ALBs | Databases, app servers, cache |

### 📊 Example Subnetting

```
VPC: 10.0.0.0/16 (65,536 IPs)
│
├─ Public Subnet 1A: 10.0.1.0/24 (256 IPs)
│  ├─ Network: 10.0.1.0
│  ├─ Broadcast: 10.0.1.255
│  ├─ Usable: 10.0.1.1 - 10.0.1.254 (252 usable)
│  └─ Typical: 10.0.1.0 - 10.0.1.255
│
├─ Public Subnet 1B: 10.0.2.0/24 (256 IPs)
│
├─ Private Subnet 1A: 10.0.10.0/24 (256 IPs) ← Databases only
│
└─ Private Subnet 1B: 10.0.20.0/24 (256 IPs) ← Databases only
```

### 📟 Console — Create Subnet

```
1. VPC → Subnets → Create subnet
2. VPC ID: select your VPC
3. Subnet settings:
   - Name: public-subnet-1a
   - AZ: choose AZ (e.g., ap-south-1a)
   - IPv4 CIDR block: 10.0.1.0/24
4. → Create subnet
5. Edit subnet settings:
   - Enable auto-assign public IPv4: Yes (for public subnet)
   - → Save
```

### 💻 CLI

```bash
# Create VPC
aws ec2 create-vpc --cidr-block 10.0.0.0/16

# Create subnet
aws ec2 create-subnet \
  --vpc-id vpc-0123456789abcdef0 \
  --cidr-block 10.0.1.0/24 \
  --availability-zone ap-south-1a

# Enable auto-assign public IP
aws ec2 modify-subnet-attribute \
  --subnet-id subnet-0123456789abcdef0 \
  --map-public-ip-on-launch
```

---

## 3. Internet Gateway (IGW)

An **Internet Gateway** allows resources in a public subnet to communicate with the internet.

### How It Works

```
Internet → IGW (0.0.0.0/0) → Public Subnet (10.0.1.0/24) → EC2 (10.0.1.10)
```

- **Required for**: Public subnets to access internet
- **Attached to**: Entire VPC (not individual subnets)
- **Route table entry**: 0.0.0.0/0 → IGW

### 📟 Console — Create & Attach IGW

```
1. VPC → Internet Gateways → Create internet gateway
2. Name: my-igw
3. → Create internet gateway
4. → Attach to VPC
5. Select VPC → Attach internet gateway
```

### Route Table Configuration

For a public subnet to use IGW:

```
1. VPC → Route Tables → select public route table
2. Routes → Edit routes
3. Add route:
   - Destination: 0.0.0.0/0 (all internet traffic)
   - Target: Internet Gateway (my-igw)
4. → Save routes
```

---

## 4. NAT Gateway

A **NAT Gateway** allows private subnet resources to **initiate outbound** internet connections (but not receive inbound).

### How It Works

```
Private EC2 → NAT Gateway (public subnet) → IGW → Internet
Internet → NAT Gateway → Does NOT reach private EC2 (blocked)
```

- **Stateful**: Outbound traffic is allowed; inbound is blocked
- **Requires**: Elastic IP address
- **Cost**: Hourly + per GB data processed
- **HA**: Deploy one per AZ (2 for fully HA)

### 📟 Console — Create NAT Gateway

```
1. VPC → NAT Gateways → Create NAT gateway
2. Subnet: choose PUBLIC subnet (NAT must be in public)
3. Elastic IP: Allocate Elastic IP (new) or select existing
4. → Create NAT gateway (wait ~1 min)
5. Edit route table (private subnet):
   - Destination: 0.0.0.0/0
   - Target: NAT Gateway (my-nat-gw)
   - → Save routes
```

### 💻 CLI

```bash
# Allocate Elastic IP
aws ec2 allocate-address --domain vpc

# Create NAT Gateway
aws ec2 create-nat-gateway \
  --subnet-id subnet-public-1a \
  --allocation-id eipalloc-0123456789abcdef0

# Update private route table
aws ec2 create-route \
  --route-table-id rtb-private \
  --destination-cidr-block 0.0.0.0/0 \
  --nat-gateway-id natgw-0123456789abcdef0
```

---

## 5. Route Tables

A **route table is a set of rules** (routes) that determine where traffic is sent.

### Route Table Structure

| Destination | Target | Use |
|---|---|---|
| 10.0.0.0/16 | Local | All traffic within VPC (automatic) |
| 0.0.0.0/0 | IGW | Internet traffic (public subnet) |
| 0.0.0.0/0 | NAT | Internet outbound (private subnet) |
| 172.16.0.0/16 | VPN | On-premises network (hybrid) |
| 10.1.0.0/16 | Peering | Another VPC (peering connection) |

### 📟 Console — Create & Configure Route Table

```
1. VPC → Route Tables → Create route table
2. Name: public-rt
3. VPC: select your VPC
4. → Create route table
5. Edit routes:
   - Add route: 0.0.0.0/0 → Internet Gateway
6. Edit subnet associations:
   - Explicit subnet associations → Edit
   - Select public subnets (1a, 1b)
   - → Save
```

---

## 6. Security Groups & Network ACLs

### Security Groups (SG)

**Instance-level firewall**, stateful.

- **Ingress**: What traffic is ALLOWED IN
- **Egress**: What traffic is ALLOWED OUT
- **Default**: Deny all inbound, allow all outbound
- **Stateful**: Return traffic auto-allowed

### Network ACLs (NACL)

**Subnet-level firewall**, stateless.

- **Ingress**: What traffic is ALLOWED IN
- **Egress**: What traffic is ALLOWED OUT
- **Stateless**: Return traffic requires explicit rule
- **Order**: Rules evaluated top-down; first match wins

### SG vs NACL

| Aspect | SG | NACL |
|--------|----|----|
| **Level** | Instance | Subnet |
| **Stateful** | Yes | No |
| **Rule type** | Allow only | Allow + Deny |
| **Default** | Deny in, allow out | Allow all (default NACL) |
| **Best for** | Instance-level control | Subnet-level security |

### 📟 Console — Create Security Group

```
1. VPC → Security Groups → Create security group
2. Name: web-sg
3. Description: Allow HTTP/HTTPS
4. VPC: select your VPC
5. Inbound rules:
   - HTTP (80): from 0.0.0.0/0
   - HTTPS (443): from 0.0.0.0/0
   - SSH (22): from YOUR_IP/32
6. Outbound: Allow all (default)
7. → Create
```

---

## 7. VPC Peering

**VPC Peering** connects two VPCs for private communication.

- **Cross-region**: Supported (pay for cross-region data transfer)
- **Cross-account**: Supported (requester creates, accepter approves)
- **Route table**: Must add route for peer VPC CIDR

### 📟 Console — Create VPC Peering

```
1. VPC → Peering connections → Create peering connection
2. Requester VPC: vpc-a
3. Acceptor VPC: vpc-b (same account) or VPC ID from other account
4. → Create peering connection
5. Acceptor: Accept peering connection
6. Route tables (both VPCs):
   - Add route: 10.1.0.0/16 → Peering connection
```

---

## 8. VPC Endpoints

**VPC Endpoints** allow private access to AWS services without using IGW or NAT.

### Gateway Endpoints (Free)

For S3 and DynamoDB only. Added as route table target.

```
Route: *.s3.amazonaws.com → Gateway Endpoint
```

### Interface Endpoints (PrivateLink)

For all AWS services. Creates ENI in your subnet.

```
EC2 (private) → Interface Endpoint (ENI) → AWS Service (private)
```

### Use Case

Avoid internet routing for sensitive data (compliance, security).

---

## 9. VPC Flow Logs

**VPC Flow Logs** capture network traffic metadata.

- **Source/Destination IP**: Who's talking
- **Ports**: Which ports
- **Action**: Accepted or rejected
- **Bytes/Packets**: Traffic volume

### 📟 Console — Enable VPC Flow Logs

```
1. VPC → VPCs → select VPC
2. Flow Logs → Create flow log
3. Filter: Accept, Reject, or All
4. Destination: CloudWatch Logs or S3
5. Log group name: /aws/vpc/flowlogs
6. IAM role: Create role with necessary permissions
7. → Create flow log
```

### Use Cases

- **Troubleshooting**: Why is traffic blocked?
- **Security**: Detect suspicious traffic patterns
- **Compliance**: Audit network activity

---

## 10. Common VPC Architectures

### Two-Tier (Public-Private)

```
┌─ Public Subnet (Web Tier)
│  └─ ALB, NAT Gateway
│
└─ Private Subnet (App/DB Tier)
   └─ EC2, RDS
```

### Three-Tier (DMZ)

```
┌─ Public Subnet (Web Tier)
│  └─ ALB
│
├─ Private Subnet (App Tier)
│  └─ EC2
│
└─ Private Subnet (DB Tier)
   └─ RDS
```

### Multi-AZ with Autoscaling

```
AZ-a                          AZ-b
│                             │
├─ Public: ALB               ├─ Public: ALB
├─ Private: ASG EC2 (2-10)   ├─ Private: ASG EC2 (2-10)
└─ Private: RDS primary      └─ Private: RDS replica
```

---

## 11. Interview Q&A

**Q: What is the default CIDR for a VPC?**
There's no default. You specify it at creation (typical: 10.0.0.0/16, 172.16.0.0/16, or 192.168.0.0/16). Cannot be changed after creation.

**Q: Can you have overlapping CIDR blocks?**
Not in the same account/region. Overlapping is okay for peered VPCs if you use NAT, but routing becomes complex.

**Q: How many subnets can you create?**
As many as the VPC CIDR allows. A /16 VPC can have 256 /24 subnets, each with 254 usable IPs.

**Q: What is the difference between public and private subnets?**
Public has a route to IGW (direct internet). Private does not (only via NAT outbound, no inbound).

**Q: Do Security Groups and NACLs work together?**
Yes. Both must allow traffic for it to pass. SG is instance-level; NACL is subnet-level.

**Q: Why would you use VPC peering instead of public internet?**
Private security. Traffic stays within AWS network (no public IP exposure, lower latency).

**Q: What is VPC flow logs used for?**
Debugging traffic issues (why is connection blocked?), security analysis, compliance auditing.

**Q: Can you change a VPC's CIDR after creation?**
No. You'd have to recreate the VPC. Plan carefully.

---

## 12. Quick Reference Cheat Sheet

| Concept | Detail |
|---------|--------|
| **VPC** | Isolated network, regional, customizable IP space |
| **Subnet** | Range of IPs in one AZ, tied to VPC |
| **IGW** | Internet Gateway, enables internet access for public subnets |
| **NAT** | Network Address Translation, private egress only |
| **Route table** | Rules for where traffic goes (local, IGW, NAT, peering, VPN) |
| **Security group** | Instance-level firewall, stateful |
| **NACL** | Subnet-level firewall, stateless |
| **SG ingress** | Inbound rules (what's ALLOWED in) |
| **SG egress** | Outbound rules (what's ALLOWED out) |
| **Public subnet** | Has route to IGW, assigns public IP |
| **Private subnet** | No IGW route, uses NAT for outbound |
| **VPC Peering** | Connect two VPCs for private communication |
| **VPC Endpoint** | Private access to AWS services (no IGW/NAT) |
| **Flow Logs** | Network traffic metadata logs |
| **CIDR notation** | 10.0.0.0/16 (IP address / prefix length) |
| **/16 subnet** | 65,536 IPs (256 /24 subnets) |
| **/24 subnet** | 256 IPs (254 usable for EC2) |
| **IPv4 private ranges** | 10.0.0.0/8, 172.16.0.0/12, 192.168.0.0/16 |
| **Default VPC** | AWS creates per region for convenience |
| **Max AZs per region** | 3+ (varies by region) |

---

*Design for zones. Scale across subnets. Isolate, don't rely on perimeter security.* 🔒
