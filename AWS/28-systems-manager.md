# Systems Manager - Operations & Automation

## Systems Manager Overview

Comprehensive operations hub:

```
Manages:
├── EC2, RDS, on-premises servers
├── Automation workflows
├── Patch management
├── Configuration management
├── Session management
└── Parameter store

Cost: Free (mostly)
```

## Session Manager

Secure shell access without SSH:

```
Traditional SSH:
├── Open port 22
├── Manage SSH keys
├── SSH key leakage risk
└── Need SSH client installed

Session Manager:
├── Encrypted tunnel via Systems Manager
├── No inbound ports needed
├── IAM-based access control
├── Audit logging
└── Works on EC2, on-premises

Setup:
└── IAM role with SSM permissions
└── SSM agent on instance (pre-installed on AMI)
```

### Using Session Manager

```
Start session:
aws ssm start-session \
  --target i-0123456789abcdef0

Session starts:
└── Connected to instance
└── Can run bash commands
└── Commands logged to CloudWatch

Advantages:
├── No key management
├── CloudTrail logs every command
├── MFA integration
└── Session recording

Cost: Free
```

## Parameter Store

Centralized configuration:

```
Store:
├── Application configuration
├── Database passwords
├── API keys
├── License keys
└── Any string values

Types:
├── String: Simple text
├── StringList: Comma-separated values
├── SecureString: Encrypted with KMS
```

### Using Parameters

```
Store parameter:
aws ssm put-parameter \
  --name /myapp/db/password \
  --value "SecureP@ssw0rd" \
  --type SecureString \
  --key-id alias/myapp-key

Retrieve parameter:
aws ssm get-parameter \
  --name /myapp/db/password \
  --with-decryption

Application reads:
└── No hardcoded vars
└── Central configuration
└── Update without redeployment
```

## Automation Documents

Run operational procedures:

```
Document (YAML):
┬── Instruction 1: Stop instances
├── Instruction 2: Create snapshot
├── Instruction 3: Start instances
└── Instruction 4: Verify health

Template: AWS::Systems Manager::Document
Used for: Pre-built workflows (patching, backups)
```

## Patch Manager

Automatic OS patching:

```
Setup:
├── Create patch baseline
├── Define patch groups
├── Schedule maintenance window
└── Patches auto-apply

Patch baseline:
├── Auto-approve critical/security
├── Manual review for non-critical
├── Exemptions for specific patches
└── Automatic reboot option

Maintenance window:
├── Tuesday 2 AM - 4 AM (30-min window)
├── Max 2 instances patching simultaneously
└── Auto-rollback on failure

Cost: Free (individual patching)
```

## Inventory

Track installed software:

```
AWS Systems Manager Inventory:
├── Installed applications
├── OS details
├── Patches applied
├── Running services
└── Network configuration

View:
Console → Systems Manager → Inventory
├── Software inventory
├── Instances
├── Custom inventory

Use for:
├── Licensing compliance
├── Vulnerability assessment
└── Software deployment
```

## Run Command

Execute commands across instances:

```
Command:
aws ssm send-command \
  --document-name "AWS-RunShellScript" \
  --instance-ids "i-0123456789abcdef0" "i-abcdefghij123456" \
  --parameters commands="['echo Hello World']"

Execute across many:
├── All instances with tag "batch-process"
├── Commands run in parallel
├── Results aggregated
└── Failed instances identified

Use for:
├── Security updates
├── Configuration changes
├── Troubleshooting commands
```

## State Manager

Maintain consistent state:

```
Association:
├── Target instances
├── Automation document
├── Schedule: daily, hourly, etc.

Example: Antivirus update
├── Every 6 hours
├── Check for AV updates
├── Download and install
├── Report status

Use for:
├── Configuration compliance
├── Software deployment
├── Log rotation
└── Security hardening
```

## OpsCenter

Unified monitoring dashboard:

```
View:
├── All alerts in one place
├── Alert severity
├── Automation available
└── Runbooks

Common alerts:
├── High CPU
├── Low disk space
├── Failed backup
├── Health check failure
└── Auto-remediation triggers

Integrate with:
├── CloudWatch alarms
├── SNS
├── EventBridge
└── Third-party monitoring
```

## Compliance Manager

Track configuration compliance:

```
Compliance patches:
├── Deploy patch baseline
├── Track compliance status
├── Report non-compliant instances

Compliance rules:
├── Must have antivirus
├── Must have firewall
├── CloudWatch agent required
└── Custom checks

View dashboard:
├── Overall compliance %
├── Non-compliant instances
├── Remediation steps
```

## ⚠️ Common Mistakes

❌ **SSM agent not running**
→ Install on custom AMIs

❌ **IAM role missing SSM permissions**
→ Add SSM managed policy

❌ **No maintenance window**
→ Patches never apply

❌ **Patch baseline too aggressive**
→ Major versions need staging

❌ **Parameter names not organized**
→ Use hierarchical naming: /app/env/config

## 🎯 Key Takeaways

✅ Session Manager for shell access (no SSH)
✅ Parameter Store for configuration
✅ Patch Manager for OS updates
✅ Run Command for fleet execution
✅ State Manager for consistency
✅ Inventory for software tracking
✅ OpsCenter for unified monitoring
✅ Automation for operational procedures

---

**Systems Manager is your operations control center!**

---

[← Previous: CloudTrail - Auditing & Compliance](27-cloudtrail.md) | [Contents](README.md) | [Next: SNS & SQS - Messaging Services →](29-sns-sqs.md)
