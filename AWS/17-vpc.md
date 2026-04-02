# VPC - Virtual Private Cloud

## What is a VPC?

**VPC = Virtual Private Cloud**

Your own isolated network environment in AWS:

```
Traditional Office              VPC in AWS
├── Physical office building   ├── Virtual network
├── Building perimeter         ├── Network boundaries
├── Secure entrances           ├── Internet Gateway
├── Internal network           ├── Subnets
└── Interconnected devices     └── EC2 instances

Think: Your own private isolated office, but in the cloud
```

## VPC Fundamentals

### Key Components

```
┌──────────────────────────────────────────┐
│              VPC (10.0.0.0/16)           │
│                                          │
│  ┌────────────────┐  ┌───────────────┐   │
│  │ Subnet 1       │  │ Subnet 2      │   │
│  │ (10.0.1.0/24)  │  │ (10.0.2.0/24) │   │
│  │ us-east-1a     │  │ us-east-1b    │   │
│  │ ┌──────────┐   │  │ ┌──────────┐  │   │
│  │ │EC2       │   │  │ │EC2       │  │   │
│  │ │instance  │   │  │ │instance  │  │   │
│  │ └──────────┘   │  │ └──────────┘  │   │
│  └──────┬─────────┘  └────┬──────────┘   │
│         └────┬────────┬───┘              │
│              │        │ Routes traffic   │
│              ▼    Network ACLs           │
│         ┌─────────────┐                  │
│         │ Router      │                  │
│         └──────┬──────┘                  │
│                │                         │
│         ┌──────▼────────┐                │
│         │ Internet GW   │                │
│         └──────┬────────┘                │
└────────────────┼─────────────────────────┘
                 │
              Internet
```

### 1. VPC CIDR Block

IPv4 address range for your VPC:

```bash
VPC CIDR: 10.0.0.0/16

Breakdown:
10.0.0.0    = Network address (start)
/16         = Netmask (first 16 bits fixed, last 16 flexible)
             = 65,536 available IPs
             
Range: 10.0.0.0 → 10.0.255.255

Common CIDR blocks:
├── 10.0.0.0/16 (65K IPs)
├── 10.0.0.0/24 (256 IPs)
├── 172.16.0.0/12 (1M IPs)
└── 192.168.0.0/16 (65K IPs)
```

### 2. Subnets

Subdivisions of VPC in specific AZ:

```bash
VPC: 10.0.0.0/16 (ALL IPs)
├── Subnet 1: 10.0.1.0/24 (256 IPs) in us-east-1a
│   └── Usable: 10.0.1.1 - 10.0.1.254
│       (AWS reserves .0 and .255)
└── Subnet 2: 10.0.2.0/24 (256 IPs) in us-east-1b
    └── Usable: 10.0.2.1 - 10.0.2.254
```

#### Subnet Types

**Public Subnet:**
- EC2 instances can reach internet
- Internet Gateway attached
- Route to 0.0.0.0/0 → IGW
- Use for: Web servers, load balancers

**Private Subnet:**
- EC2 instances cannot reach internet directly
- No IGW route
- Can access internet via NAT gateway (optional)
- Use for: Databases, sensitive servers

### 3. Internet Gateway (IGW)

Connects VPC to internet:

```
Public Subnet (route to IGW)
└── EC2 with public IP
    └── Can send/receive internet traffic
    
Internet Gateway
└── Bidirectional connection
```

### 4. NAT Gateway

Allows private instances to route out (but not in):

```
Private Subnet (has route to NAT)
└── EC2 instance (no public IP)
    └── Initiates connection out
        └── NAT replaces source IP
        └── Internet response comes back
        └── NAT returns to EC2
        
Result: Private EC2 can download updates, but not accessible from internet
```

### 5. Route Tables

Define traffic routing:

```
Route Table Example:

Destination    Target
──────────────────
10.0.0.0/16    Local     (within VPC, direct)
0.0.0.0/0      igw-xxx   (internet, via IGW)
```

## Creating Your First VPC

### Manually (Best Learning)

```bash
# Step 1: Create VPC
AWS Console → VPC → Create VPC
Name: my-vpc
IPv4 CIDR: 10.0.0.0/16
DNS hostnames: Enable
DNS resolution: Enable
→ Create

# Step 2: Create Internet Gateway
VPC → Internet Gateways → Create
Name: my-igw
→ Create
→ Attach to VPC (my-vpc)

# Step 3: Create Subnets
VPC → Subnets → Create
Subnet 1:
  Name: public-subnet-1a
  VPC: my-vpc
  IPv4: 10.0.1.0/24
  AZ: us-east-1a
  → Create

Subnet 2:
  Name: private-subnet-1b
  VPC: my-vpc
  IPv4: 10.0.2.0/24
  AZ: us-east-1b
  → Create

# Step 4: Create Route Tables
Route Table for public:
  Name: public-rt
  VPC: my-vpc
  Routes:
    - 10.0.0.0/16 → Local
    - 0.0.0.0/0 → igw-xxx
  Subnet associations:
    - public-subnet-1a

Route Table for private:
  Name: private-rt
  VPC: my-vpc
  Routes:
    - 10.0.0.0/16 → Local
  Subnet associations:
    - private-subnet-1b

# Step 5: Launch EC2 instances
EC2 → Launch Instance
Subnet: public-subnet-1a
Public IP: Enabled
Security group: Allow SSH/HTTP
→ Launch
```

### Using VPC Wizard (Faster)

```bash
VPC → Launch VPC Wizard
Template: "VPC with Public and Private Subnets"
→ Fill details
→ Creates everything automatically!
```

## Security Groups vs Network ACLs

### Security Groups (Stateful)

```
VPC Security Group = Software firewall for instance

┌──────────────────┐
│   Security Group │
├──────────────────┤
│ Inbound Rules:   │
│ - SSH (22)       │ Allow from 0.0.0.0/0
│ - HTTP (80)      │ Allow from 0.0.0.0/0
│ - HTTPS (443)    │ Allow from 0.0.0.0/0
│                  │
│ Outbound Rules:  │
│ - All traffic    │ Allow to 0.0.0.0/0
└──────────────────┘
        ↓
     EC2 Instance
```

### Network ACLs (Stateless)

```
VPC Network ACL = Hardware firewall at subnet level

┌────────────────────────────┐
│   Network ACL              │
├────────────────────────────┤
│ Inbound Rules: (ACL)       │
│ - Rule 100: SSH Allow      │
│ - Rule 110: HTTP Allow     │
│ - Rule 120: Deny 10.0.3.0  │
│ - Rule *: Deny (default)   │
│                            │
│ Outbound Rules:            │
│ - Rule 100: All Allow      │
│ - Rule *: Deny (default)   │
└────────────────────────────┘
  ↓ (applies to all instances in subnet)
┌──────────────────────────────────────┐
│ Subnet                               │
│  ┌────┐ ┌────┐ ┌────┐ ┌─────┐ ┌────┐ │
│  │EC2 │ │DB  │ │Web │ │Cache│ │... │ │
│  └────┘ └────┘ └────┘ └─────┘ └────┘ │
└──────────────────────────────────────┘
```

### Comparison

| Aspect | Security Group | Network ACL |
|--------|---|---|
| Level | Instance | Subnet |
| Stateful? | Yes | No |
| Applies to | One instance | All subnet traffic |
| Rules | Allow only | Allow + Deny |
| Default | Deny all inbound | Allow all |

**Best Practice:** Use Security Groups (simpler), NACLs for edge cases

## VPC Peering

Connect multiple VPCs:

```
VPC A (10.0.0.0/16)          VPC B (172.16.0.0/16)
├── EC2 in 10.0.1.0/24    ←→  ├── EC2 in 172.16.1.0/24
└── Can ping VPC B            └── Can ping VPC A

Setup:
1. VPC A → Create VPC peering connection → VPC B
2. VPC B → Accept connection
3. Update route tables:
   VPC A: 172.16.0.0/16 → Peering connection
   VPC B: 10.0.0.0/16 → Peering connection
4. Done! Full connectivity
```

## VPN & AWS Site-to-Site VPN

Secure tunnel from on-premise to AWS:

```
┌─────────────────┐     VPN Tunnel      ┌──────────────┐
│ On-Premise      │ ←──(Encrypted)──→  │ AWS VPC      │
│ Network         │                     │ 10.0.0.0/16  │
│ 192.168.0.0/16  │                     │              │
└─────────────────┘                     └──────────────┘
```

## VPC Flow Logs

Monitor network traffic:

```
VPC Flow Log captures:
- Source IP
- Destination IP
- Port
- Protocol
- Bytes sent
- Accept/Reject

Useful for:
- Security analysis
- Troubleshooting connectivity
- Compliance audits

Cost: $0.50/month per 1M records
```

## ⚠️ Common VPC Mistakes

❌ **Overlapping CIDR blocks**
→ Can't communicate between resources

❌ **No Internet Gateway for public subnet**
→ Instances can't reach internet

❌ **Wrong security group rules**
→ Port 80 not added for web traffic

❌ **All instances in same AZ**
→ No high availability

❌ **Forgetting NAT for private subnet**
→ Private instances can't download updates

## 🎯 Key Takeaways

✅ VPC = isolated network in AWS
✅ Create CIDR, subnets, IGW, route tables
✅ Public subnet = Internet Gateway route
✅ Private subnet = No internet (unless NAT)
✅ Security groups = instance-level firewall
✅ Network ACLs = subnet-level firewall
✅ VPC peering for inter-VPC communication

## 🚀 Hands-On Exercise

1. ☑️ Create VPC (10.0.0.0/16)
2. ☑️ Create public subnet (10.0.1.0/24)
3. ☑️ Create private subnet (10.0.2.0/24)
4. ☑️ Create Internet Gateway, attach to VPC
5. ☑️ Create public route table, add IGW route
6. ☑️ Launch EC2 in public subnet
7. ☑️ SSH into instance (public IP)
8. ☑️ Delete and repeat, learn!

---

**VPC is the foundation of AWS networking. Master it!**

---

[← Previous: Database Optimization & Scaling](16-database-optimization.md) | [Contents](README.md) | [Next: Route 53 - DNS Management →](18-route53.md)
