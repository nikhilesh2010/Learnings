# VPN & Direct Connect

## Secure Network Communication

### Types of Connections

```
Public internet:
├── Cheap (free)
├── Insecure (snoop-able)
└── Variable latency

VPN (Virtual Private Network):
├── Encrypted tunnel over public internet
├── Secure but still internet-dependent
└── Some latency/jitter

Direct Connect:
├── Dedicated physical connection
├── Consistent performance
├── Expensive (≥$0.30/hour)
└── Long setup time (weeks)
```

## AWS Site-to-Site VPN

Connect on-premises to AWS:

```
Configuration:
├── Customer Gateway (on-premises)
├── VPN Connection (encrypted tunnel)
├── Virtual Private Gateway (AWS VPC)
└── Routing rules (what goes through VPN)

Example:
On-premises office (192.168.0.0/16)
  ↓ (encrypted via VPN)
AWS VPC (10.0.0.0/8)

Cost:
├── VPN Connection: $0.05/hour
├── Data: $0.09/GB (in), $0.09/GB (out)
└── Total: ~$40/month for typical usage
```

## Setting Up Site-to-Site VPN

```
Step 1: Create Virtual Private Gateway (VGW)
aws ec2 create-vpn-gateway \
  --type ipsec.1 \
  --amazon-side-asn 64512

Step 2: Attach to VPC
aws ec2 attach-vpn-gateway \
  --vpn-gateway-id vgw-xxxxx \
  --vpc-id vpc-xxxxx

Step 3: Create Customer Gateway (on-premises device)
aws ec2 create-customer-gateway \
  --type ipsec.1 \
  --public-ip 203.0.113.1 \
  --bgp-asn 65000

Step 4: Create VPN Connection
aws ec2 create-vpn-connection \
  --type ipsec.1 \
  --customer-gateway-id cgw-xxxxx \
  --vpn-gateway-id vgw-xxxxx

Step 5: Configure on-premises router
└── Download VPN config from AWS console
```

## Client VPN

Remote workers connecting to VPC:

```
Scenario:
├── Employee working from home
├── Needs access to VPC resources
└── Uses their laptop

Solution: AWS Client VPN
├── Install VPN client on laptop
├── Connects to Client VPN endpoint
├── Gets IP in VPC range
├── Accesses internal resources

Configuration:
├── Authentication: Certificates or SAML
├── Client VPN Authorization rules
├── Split DNS (which domains go through VPN?)
├── Logging: CloudWatch logs
```

### Client VPN Setup

```
Create endpoint:
aws ec2 create-client-vpn-endpoint \
  --client-cidr-block 10.0.0.0/8 \
  --server-certificate-arn arn:aws:acm:...

Create routes:
aws ec2 associate-client-vpn-target-network \
  --client-vpn-endpoint-id cvpn-endpoint-xxxxx \
  --subnet-id subnet-xxxxx

Create authorization rule:
aws ec2 authorize-client-vpn-ingress \
  --client-vpn-endpoint-id cvpn-endpoint-xxxxx \
  --target-network-cidr 10.0.0.0/16

Cost: $0.05/hour + $0.05/GB (data)
```

## AWS Direct Connect

Dedicated network connection:

```
Traditional internet connection:
User → ISP → Internet → AWS (variable)

Direct Connect:
User → ISP → Direct Connect → AWS (dedicated)
           (1, 10, or 100 Gbps)

Performance:
├── Consistent latency
├── No internet congestion
├── Higher bandwidth
└── For: High-volume, latency-sensitive apps

Setup time:
└── 3-4 weeks (physical connection setup)
```

### Direct Connect Configuration

```
1. Create Virtual Interface (VIF):
   ├── Public VIF (AWS public IPs)
   ├── Private VIF (VPC)
   └── Transit VIF (multiple VPCs via Transit Gateway)

2. BGP routing:
   ├── Your AS# ↔ AWS AS#
   ├── Route propagation
   └── Automatic failover

3. Redundancy:
   └── 2 connections to same location (HA)
```

## Hybrid Networking Comparison

| Feature | VPN | Direct Connect |
|---------|-----|-----------------|
| Setup time | Immediate | 3-4 weeks |
| Cost | $40/month | $0.30/hour + $0.02/GB |
| Bandwidth | ~1 Gbps* | 1/10/100 Gbps |
| Latency | Variable | Consistent |
| Security | Encrypted | Physical isolation |
| Use for | Remote offices | High-volume datacenters |

## Transit Gateway

Simplify hybrid networking:

```
Multiple connections:
├── 5 VPCs
├── 3 on-premises networks
├── 2 Direct Connects

Without Transit Gateway:
└── N*(N-1)/2 connections! (exponential)

With Transit Gateway:
└── All connect to Transit Gateway (hub-spoke)

Cost:
├── Attachment: $0.05/hour per attachment
├── Data processed: $0.02/GB
```

## Network ACLs vs. VPC Security

```
Network ACL:
├── Stateless (require explicit return rules)
├── Applies to subnet
├── Rules evaluated in order
└── For: Noisy neighbors, bulk blocking

Security Group:
├── Stateful (return traffic implicit)
├── Applies to instance
├── All rules evaluate
└── For: Application-level filtering

Best practice:
└── Use SG for most, NACL for bulk filtering
```

## ⚠️ Common Mistakes

❌ **VPN without BGP failover**
→ Single tunnel failure = lost connection

❌ **IP overlap between networks**
→ VPN fails silently when overlap exists

❌ **Not enabling route propagation**
→ Routes not added automatically

❌ **Client VPN with no split DNS**
→ DNS queries leak on VPC

❌ **Direct Connect without redundancy**
→ Single connection = single point of failure

## 🎯 Key Takeaways

✅ Site-to-Site VPN for on-premises
✅ Client VPN for remote workers
✅ Direct Connect for high-volume, low-latency
✅ Transit Gateway for hub-spoke networks
✅ Virtual Private Gateway endpoints
✅ Always use redundancy (2 connections)
✅ BGP for dynamic routing
✅ Cost vs. performance tradeoff

---

**Hybrid networking connects your infrastructure securely!**

---

[← Previous: KMS & Encryption](24-kms-encryption.md) | [Contents](README.md) | [Next: CloudWatch - Monitoring & Logging →](26-cloudwatch.md)
