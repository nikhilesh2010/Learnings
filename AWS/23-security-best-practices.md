# Security Best Practices

## AWS Shared Responsibility Model

```
AWS Responsible For:          You Responsible For:
├── Facilities                ├── User access (IAM)
├── Physical hardware         ├── Encryption keys
├── Network infrastructure    ├── OS patches (for non-managed)
├── Hypervisor                ├── Application security
├── Managed service internals ├── Data classification
├── DDoS protection           ├── Network rules
└── Compliance infrastructure └── Security monitoring
```

## Identity & Access Management (IAM)

### Principle of Least Privilege

```
Grant only minimum permissions needed

Bad:
  Developer → AdministratorAccess
  └── Can delete entire account!

Good:
  Developer → EC2FullAccess + RDSReadOnly
  └── Only what they need
```

### MFA (Multi-Factor Authentication)

Enable for all users:

```bash
Protect against:
├── Compromised passwords
├── Phishing attacks
└── Credential theft

MFA Methods:
├── Virtual (Google Authenticator, Authy) ✓ Recommended
├── Hardware key (Yubikey)
└── SMS (not recommended)
```

### Access Keys Management

```bash
✓ Rotate every 90 days
✓ Store securely (AWS Secrets Manager)
✓ Never commit to git
✓ Use IAM roles for services instead

✗ Share access keys
✗ Use root account access keys
✗ Hard-code in applications
```

## Encryption

### At-Rest Encryption

Data encrypted on disk:

```
S3:
├── Default: SSE-S3 (free)
├── Better: SSE-KMS (can rotate keys)
└── Advanced: Customer-managed keys

EBS:
├── Enable by default
├── Minimal performance impact
└── Use AWS KMS for keys

RDS:
├── Enable at creation
├── Encrypted snapshots
└── Multi-AZ with encryption

DynamoDB:
├── Default: AWS-managed
├── Advanced: KMS-managed
```

### In-Transit Encryption

Data encrypted while moving:

```
TLS/SSL (HTTPS):
├── Encrypt API calls
├── Encrypt data between services
├── Protect against eavesdropping

AWS Certificate Manager (ACM):
├── Free SSL/TLS certificates
├── Auto-renewal
├── Works with ALB, CloudFront, API Gateway
```

## Network Security

### Security Groups (Detailed)

```
Principle: Deny by default, allow explicitly

Inbound (from internet to instance):
├── SSH (22): Only from your IP, not 0.0.0.0/0
├── HTTP (80): From ALB only
├── HTTPS (443): From CloudFront only
└── DB (3306): From application tier only

Outbound (from instance to internet):
├── Standard: Allow all (customizable)
└── Locked down: Only to required services
```

### Network ACLs

Subnet-level firewall:

```
Optional layer:
├── Usually not needed (security groups sufficient)
├── Use for: Edge case restrictions
├── Stateless (must configure return traffic)
```

### VPC Flow Logs

Monitor network traffic:

```
Captures:
├── Source/destination IP
├── Port
├── Protocol
├── Accept/reject status

Use for:
├── Security analysis
├── Troubleshooting connectivity
├── Compliance audits
```

## Data Protection

### Sensitive Data Classification

```
Public:               No restrictions
Internal:             Employees only
Confidential:         Need-to-know
Restricted/PII:       Highly protected
```

### Masking PII

```
Don't log: Credit cards, SSNs, passwords
Do hash: User IDs (one-way)
Do encrypt: Personal emails per user

Example:
✓ User successfully logged in (user-id)
✗ User logged in with password: abc123
✗ User email: john@gmail.com
```

### Secrets Management

Store sensitive data securely:

```
AWS Secrets Manager:
├── Centralized secrets storage
├── Automatic rotation
├── Audit trail
├── Cost: $0.40/secret/month + API calls

Bad:
  const DB_PASSWORD = "SecurePass123!"  // In code!

Good:
  secrets = botoc.client('secretsmanager').get_secret_value()
  password = secrets['SecretString']    // From secure storage
```

## Monitoring & Logging

### CloudTrail (Auditing)

Track ALL API calls:

```
Logs:
├── Who made the call (IAM user)
├── When (timestamp)
├── What (API action)
├── From where (IP address)
└── Success/failure

Enable: https://console.aws.amazon.com/cloudtrail
Retention: 90 days (S3 for longer)
```

### CloudWatch Logs

Monitor application logs:

```
Forward to CloudWatch:
├── App logs
├── System logs
├── Security events

Create insights:
├── Find all errors
├── Alert on suspicious patterns
└── Investigation
```

### GuardDuty (Threat Detection)

AI-powered threat detection:

```
Monitors:
├── CloudTrail logs (suspicious API activity)
├── VPC Flow Logs (suspicious network)
├── DNS logs (malware communication)

Detects:
├── Compromised instances
├── Credential abuse
├── Unauthorized access
└── Cryptocurrency mining
```

## Compliance & Governance

### AWS Config

Track configuration changes:

```
Monitors:
├── EC2 security groups
├── S3 bucket policies
├── RDS encryption settings
├── Compliance drift

Alerts on:
├── Unapproved changes
├── Non-compliant resources
└── Compliance violations
```

### Trusted Advisor

Security & performance checks:

```
Scans for:
├── Security groups allowing 0.0.0.0/0
├── Root MFA not enabled
├── IAM users without MFA
├── Unencrypted RDS instances
├── Unused resources (cost)
└── Service limits
```

## Secure Development

### Environment Separation

```
Dev:
├── Open access
├── Experimental
├── High risk OK

Staging:
├── Restricted
├── Production-like
├── Test before prod

Production:
├── Highly restricted
├── Audit everything
└── Change management required
```

### Infrastructure as Code Security

```
✓ Store templates in git
✓ Code review before deploy
✓ Automated unit tests (cfn-lint)
✓ Scan for hardcoded secrets

✗ Hard-coded credentials
✗ Public IP addresses in template
✗ Overly permissive policies
```

## Incident Response

### Common Incidents

#### Compromised Credentials

```
1. Revoke access immediately
   └── Disable IAM user
   └── Delete access keys

2. Investigate impact
   └── CloudTrail: What did attacker access?
   └── CloudWatch: Any anomalies?

3. Rotate all credentials
   └── Passwords
   └── Access keys
   └── Database passwords

4. Monitor for re-entry
   └── CloudTrail alerts
   └── GuardDuty monitoring
```

#### Unauthorized Access

```
1. Block immediately
   └── Revoke IAM permissions
   └── Update security groups

2. Find entry point
   └── Check CloudTrail
   └── Check VPC Flow Logs
   └── Check GuardDuty

3. Patch vulnerability
   └── Update code/config
   └── Deploy to all affected

4. Monitor for regression
```

#### Data Breach

```
1. Isolate affected resources
   └── Disconnect from internet
   └── Stop replication

2. Assess scope
   └── What data exposed?
   └── How many records?
   └── PII included?

3. Notify stakeholders
   └── Legal
   └── Compliance
   └── Users (if required)

4. Post-mortem
   └── What happened?
   └── How to prevent?
```

## Compliance Frameworks

### Common Certifications

```
SOC 2:              Security, Availability, Integrity
PCI DSS:            Payment Card Industry security
HIPAA:              Healthcare data protection
GDPR:               EU data privacy
ISO 27001:          Information security standard
```

AWS Compliance:
```
Managed services come with:
├── Compliance documentation
├── Audit reports
├── Control mappings
└── Attestations
```

## Security Checklist

```bash
Account Setup:
☑ Enable MFA on root account
☑ Create IAM admin user
☑ Enable billing alerts
☑ Enable CloudTrail

Access Control:
☑ Principle of least privilege
☑ MFA on all users
☑ Regular access reviews
☑ Groups instead of individual policies

Data Protection:
☑ Encryption at-rest
☑ Encryption in-transit
☑ Secrets in Secrets Manager
☑ PII not in logs

Networking:
☑ Security groups restrictive
☑ Private subnets for sensitive
☑ VPC Flow Logs enabled
☑ No public databases

Monitoring:
☑ CloudTrail enabled
☑ CloudWatch alarms
☑ GuardDuty enabled
☑ Config rules enforced

Compliance:
☑ Backup and recovery tested
☑ Compliance automation
☑ Documentation current
☑ Incidents documented
```

## ⚠️ Common Security Mistakes

❌ **Overly permissive security groups**
→ Use explicit allow rules

❌ **No encryption**
→ Enable encryption by default

❌ **Ignoring CloudTrail logs**
→ Enable and regularly review

❌ **Shared accounts**
→ Individual IAM users always

❌ **No disaster recovery plan**
→ Test backups regularly

## 🎯 Key Takeaways

✅ Principle of least privilege everywhere
✅ MFA for all users
✅ Encryption at-rest and in-transit
✅ Centralize secrets management
✅ Enable CloudTrail auditing
✅ Encrypt sensitive data
✅ Regular security reviews
✅ Have incident response plan

## 🚀 Hands-On Exercise

1. ☑️ Enable MFA on IAM user
2. ☑️ Create restricted security group
3. ☑️ Enable CloudTrail
4. ☑️ Review GuardDuty findings
5. ☑️ Store secret in Secrets Manager
6. ☑️ Enable encryption on RDS
7. ☑️ Review CloudTrail logs
8. ☑️ Run Trusted Advisor

---

**Security is not optional. Make it culture!**

---

[← Previous: IAM - Identity & Access Management](22-iam.md) | [Contents](README.md) | [Next: KMS & Encryption →](24-kms-encryption.md)
