# AWS Organizations - Multi-Account Management

## Organizations Overview

Manage multiple AWS accounts centrally:

```
Single Account:
└── Hard to organize
└── Billing consolidated at account level

Multi-Account (no Organizations):
├── Multiple separate accounts
├── Hard to manage centrally
├── Billing scattered

With Organizations:
├── Multiple accounts
├── Centralized management
├── Consolidated billing
├── Service Control Policies (SCP)
└── Simplified provisioning
```

## Organization Structure

```
Organization Root
├── Production OU
│   ├── Account 1 (prod-app)
│   ├── Account 2 (prod-db)
│   └── Account 3 (prod-analytics)
├── Development OU
│   ├── Account 4 (dev-app)
│   └── Account 5 (dev-db)
├── Security OU
│   └── Account 6 (security)
└── Management Account
    └── Billing, Organizations, logging
```

## Organization Setup

```
Step 1: Create organization
aws organizations create-organization \
  --feature-set ALL  # CloudTrail, SCP enabled

Step 2: Create OU (Organizational Unit)
aws organizations create-organizational-unit \
  --parent-id r-xxxx \
  --name Production

Step 3: Create or move account
aws organizations create-account \
  --account-name app-prod \
  --email app-prod@company.com

Step 4: Move account to OU
aws organizations move-account \
  --account-id 123456789012 \
  --source-parent-id r-xxxx \
  --destination-parent-id ou-prod-xxxxx
```

## Service Control Policies (SCP)

Restrict what services accounts can use:

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Deny",
      "Action": [
        "ec2:RunInstances"
      ],
      "Resource": "*",
      "Condition": {
        "StringNotEquals": {
          "ec2:InstanceType": [
            "t3.micro",
            "t3.small"
          ]
        }
      }
    }
  ]
}
```

Effect: Dev account can only run t3.micro/small (cost control)

## Consolidated Billing

```
Direct Accounts (no Organizations):
Account 1 Bill: $500
Account 2 Bill: $800
Account 3 Bill: $300
Total: $1,600

With Organizations:
Account 1: $500
Account 2: $800
Account 3: $300
Discount: -2% (volume discount)
Organization Total: $1,568

Savings: $32/month from consolidation
```

## Cost Allocation Tags

Track spend across organization:

```
Tag all resources:
├── Department: engineering
├── Project: ml-pipeline
├── Environment: prod
├── CostCenter: cc-1234

AWS Cost Explorer:
├── Filter by Department
├── Plot spend over time
├── Identify expensive projects
└── Show CostCenter P&L
```

## AWS SSO (Single Sign-On)

Central user management:

```
Without Organizations:
├── User: john@company.com
├── Account 1: john IAM user
├── Account 2: john IAM user
├── Account 3: john IAM user
└── Multiple logins, multiple credentials

With AWS SSO:
├── Federate from corporate directory
├── Single login
├── Group-based access
├── Automatic permission provisioning
└── Company identity source (Okta, AD)

Setup:
AWS SSO → External identity provider (Okta)
  └── john@company.com login
  └── Automatically map to accounts
  └── Groups = permission levels
```

## Account Lifecycle

### Create Account Programmatically

```
Create account:
aws organizations create-account \
  --account-name app-staging \
  --email app-staging@company.com

Result:
├── Account 123456789012 created
├── Root IAM role "OrganizationAccountAccessRole"
└── Use this role for delegation

Automation:
Lambda + SNS
├── Trigger on account creation
├── Deploy standard stack (VPC, logging, etc.)
├── Configure security baseline
└── Register in inventory
```

### Account Closure

```
Procedure:
1. Remove from OU
2. Disable AWS credentials
3. Archive data (S3, Glacier)
4. Close account (AWS Console)
5. Delete from Organization

Cost:
└── Eliminate unused accounts
```

## Logging & Compliance

### CloudTrail Organization Trail

```
Setup:
AWS Trail → Enable organization trail

Result:
├── All accounts' API calls logged
├── Single S3 bucket (audit account)
├── Single CloudTrail → All APIs
├── Compliance-ready

Event flow:
Account 1 API call → Organization Trail → Audit S3
Account 2 API call → Organization Trail → Audit S3
Account 3 API call → Organization Trail → Audit S3
```

### Security Hub (Organization)

```
Aggregate findings across accounts:

Account 1 findings:
├── Security group too permissive
├── Encryption not enabled
└── 5 findings

Account 2 findings:
├── Root credential exposed
└── 1 finding

Account 3 findings:
├── EC2 has public IP
└── 1 finding

Security Hub aggregates:
└── 7 findings across org
└── Central dashboard
└── Automated remediation possible
```

## Reserved Instance Sharing

```
Without org:
Account A: 10 RIs
Account B: 8 RIs
Account C: 3 RIs
Unused: Account B has 2 excess, Account C needs 5

With org:
├── All RIs pooled
├── Automatically distributed
├── Wasted capacity avoided
└── 30-40% cost savings vs. individual accounts
```

## API Permission Boundary

```
Organization-wide restriction:

Policy:
├── No service can be used outside us-east-1
├── No deletion of core infrastructure
├── No public S3 bucket

Account can't violate:
├── Even with full IAM permissions
├── Org policy is hard limit
└── Prevents accidental exposure
```

## ⚠️ Common Mistakes

❌ **All accounts in single OU**
→ No isolation, no policy flexibility

❌ **No tagging strategy**
→ Can't track spend by project

❌ **Management account used for workloads**
→ Use separate accounts for apps

❌ **No backup account for compliance**
→ Backups in same account risky

❌ **SCP too restrictive**
→ Test with small OU first

## 🎯 Key Takeaways

✅ Organize accounts by function
✅ Service Control Policies for governance
✅ Consolidated billing + volume discounts
✅ Organization trail for compliance
✅ AWS SSO for user management
✅ Tagging for cost allocation
✅ RI sharing reduces waste
✅ Separate accounts for isolation

---

**Organizations enable governance at scale!**

---

[← Previous: Multi-Region & Disaster Recovery](36-multiregion-disaster-recovery.md) | [Contents](README.md) | [Next: Migration Strategies →](38-migration.md)
