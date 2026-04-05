# IAM - Identity and Access Management

## 1. What is IAM?

AWS Identity and Access Management (IAM) is a **service for managing access to AWS resources**.

- **Users**: Individual people accessing AWS
- **Roles**: Sets of permissions assumable by services or users
- **Groups**: Collections of users with shared permissions
- **Policies**: JSON documents defining permissions
- **Federation**: Login with corporate credentials (Active Directory, SAML)

### Key Principle: Least Privilege

Grant users only the **minimum permissions** needed for their job. Reduces blast radius if credentials are compromised.

---

## 2. Root Account vs IAM Users

### Root Account

- **Email + password** for account creation
- **Unlimited access** to all AWS resources
- **Cannot be restricted** (no permissions boundary)
- **MFA-protect immediately** after account creation

### IAM Users

- Created by root or admin
- Can have programmatic access (access key + secret key) or console login
- **Restricted by policies** — only allowed actions specified
- Best practice: everyone except root should use IAM users

### 📟 Console — Create IAM User

```
1. IAM → Users → Create user
2. User name: john.doe
3. Console access: Yes (for management console)
   OR Programmatic access: Yes (for CLI/API)
4. Password: Auto-generated or custom
5. Require password change: Enable (security best practice)
6. → Next → Add to group or attach policies
7. Policies: AdministratorAccess (for testing), or specific policies
8. → Create user
```

### 💻 CLI — Create IAM User

```bash
# Create user
aws iam create-user --user-name john.doe

# Create console password
aws iam create-login-profile \
  --user-name john.doe \
  --password MySecurePassword123!

# Create programmatic access (access key)
aws iam create-access-key --user-name john.doe

# Attach policy
aws iam attach-user-policy \
  --user-name john.doe \
  --policy-arn arn:aws:iam::aws:policy/AdministratorAccess
```

---

## 3. IAM Policies

An **IAM policy is a JSON document** that defines what actions a principal (user, role, service) can perform on what resources.

### Policy Structure

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Sid": "DescriptiveStatement",
      "Effect": "Allow",
      "Action": ["s3:GetObject", "s3:PutObject"],
      "Resource": "arn:aws:s3:::my-bucket/*"
    },
    {
      "Effect": "Deny",
      "Action": "s3:DeleteObject",
      "Resource": "*"
    }
  ]
}
```

### Key Components

| Component | Example | Meaning |
|-----------|---------|---------|
| **Version** | "2012-10-17" | Policy language version (use this) |
| **Sid** | "AllowS3Read" | Statement ID (optional but recommended) |
| **Effect** | "Allow" or "Deny" | Permit or block action |
| **Action** | "s3:GetObject" | Service:Action format. Wildcards: `s3:*` = all S3 actions |
| **Resource** | "arn:aws:s3:::bucket/*" | ARN of resource. `*` = all resources |
| **Principal** | "arn:aws:iam::123456789012:root" | Used in resource-based policies (bucket policies), not user policies |
| **Condition** | `"IpAddress": {"aws:SourceIp": "203.0.113.0/24"}` | Optional constraint (time, IP, etc.) |

### AWS Managed vs Customer Managed

- **AWS Managed**: Pre-defined by AWS (AdministratorAccess, ReadOnlyAccess, PowerUserAccess)
- **Customer Managed**: You create and maintain

### Evaluation Logic

```
Explicit Deny (anywhere) → DENY (always wins)
↓
Explicit Allow (user OR role policy) → ALLOW
↓
No policy found → DENY (default deny)
```

For cross-account access:
```
Both: Policy in User Account AND Policy in Resource Account must Allow → ALLOW
```

### 📟 Console — Attach Policy to User

```
1. IAM → Users → select user
2. Add permissions → Attach policies directly
3. Search for policy (e.g., "S3ReadOnlyAccess")
4. Select policy → Attach policies
```

### Common AWS Managed Policies

| Policy | Permissions |
|--------|-----------|
| **AdministratorAccess** | Full access to all services (use sparingly) |
| **PowerUserAccess** | All services except IAM management |
| **ReadOnlyAccess** | All read-only operations |
| **AmazonS3FullAccess** | Full S3 access |
| **AmazonEC2FullAccess** | Full EC2 access |
| **AWSLambdaFullAccess** | Full Lambda access |

---

## 4. IAM Roles

A **role is a set of permissions** that a service or user can assume (temporary credentials).

### Use Cases

1. **Service assumes role**: EC2 → S3, Lambda → DynamoDB (no access keys needed)
2. **Cross-account access**: User in Account A assumes role in Account B
3. **Temporary credentials**: Web app sends STS token (expires automatically)
4. **Federation**: Corporate user gets temporary AWS credentials

### Key Difference: Role vs User

| Aspect | User | Role |
|--------|------|------|
| **Credentials** | Long-lived (access key, password) | Temporary (auto-refresh via STS) |
| **Use case** | Individual login | Service/cross-account |
| **Rotation** | Manual | Automatic (via STS) |

### 📟 Console — Create Role (for EC2)

```
1. IAM → Roles → Create role
2. Trusted entity type: AWS service
3. Service: EC2
4. → Next
5. Add permissions: AmazonS3FullAccess, AmazonDynamoDBFullAccess
6. Role name: EC2-S3-DynamoDB-Role
7. → Create role
8. EC2 → Instances → select instance → Security → Modify IAM role
9. Attach this role → Save
```

### 💻 CLI

```bash
# Create role
aws iam create-role \
  --role-name EC2-Lambda-Role \
  --assume-role-policy-document file://trust-policy.json

# trust-policy.json:
cat > trust-policy.json << 'EOF'
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Principal": {
        "Service": "ec2.amazonaws.com"
      },
      "Action": "sts:AssumeRole"
    }
  ]
}
EOF

# Attach policy to role
aws iam attach-role-policy \
  --role-name EC2-Lambda-Role \
  --policy-arn arn:aws:iam::aws:policy/AmazonS3FullAccess

# Create instance profile (for EC2 to assume role)
aws iam create-instance-profile --instance-profile-name EC2-Profile
aws iam add-role-to-instance-profile \
  --instance-profile-name EC2-Profile \
  --role-name EC2-Lambda-Role
```

---

## 5. Access Keys

Access keys enable **programmatic access** (CLI, SDK, API) without a password.

### Components

- **Access Key ID**: Like a username (e.g., AKIAIOSFODNN7EXAMPLE)
- **Secret Access Key**: Like a password (keep secret!)

### Best Practices

- Rotate every 90 days
- Never commit to code (use environment variables)
- Use IAM roles for EC2/Lambda (no keys needed)
- Deactivate unused keys immediately
- Use MFA with access keys for sensitive operations

### 📟 Console — Create Access Key

```
1. IAM → Users → select user
2. Security credentials tab → Create access key
3. Use case: Command Line Interface (CLI)
4. Set description (optional)
5. → Create access key
6. Download .csv or copy credentials
7. Configure with: aws configure
```

### 💻 CLI — Use Access Keys

```bash
# Configure once
aws configure
# Enter: Access Key ID, Secret Access Key, region, output format

# Use in CLI (auto-reads from credentials file)
aws s3 ls

# Or set as environment variables
export AWS_ACCESS_KEY_ID=AKIAIOSFODNN7EXAMPLE
export AWS_SECRET_ACCESS_KEY=wJalrXUtnFEMI/K7MDENG/bPxRfiCYEXAMPLEKEY
aws ec2 describe-instances

# List access keys
aws iam list-access-keys --user-name john.doe

# Delete access key
aws iam delete-access-key --user-name john.doe --access-key-id AKIAIOSFODNN7EXAMPLE
```

---

## 6. Groups

A **group is a collection of users** with a shared policy.

### Why Groups?

- Easier to manage permissions at scale
- Compliance: all engineers get same permissions
- Onboarding: add new user to group → permissions inherited

### 📟 Console — Create Group and Add User

```
1. IAM → User groups → Create group
2. Group name: Engineers
3. Attach policies: AdministratorAccess, or specific policies
4. → Create group
5. User groups → select group → Add users
6. Select users to add → Add users
```

### 💻 CLI

```bash
# Create group
aws iam create-group --group-name Engineers

# Attach policy to group
aws iam attach-group-policy \
  --group-name Engineers \
  --policy-arn arn:aws:iam::aws:policy/AdministratorAccess

# Add user to group
aws iam add-user-to-group --group-name Engineers --user-name john.doe

# Remove user from group
aws iam remove-user-from-group --group-name Engineers --user-name john.doe
```

---

## 7. MFA (Multi-Factor Authentication)

MFA adds a second verification factor on top of password.

### Types

| Type | Setup | Pros | Cons |
|------|-------|------|------|
| **Virtual MFA** | Google Authenticator, Authy | Free, portable | Phone dependency |
| **Hardware MFA** | YubiKey, security key | Most secure | Cost (~$50) |
| **SMS MFA** | Text message | Easy | Sim-swap attacks |

### Requirements

By default, MFA is optional (but **strongly recommended** for root and admins).

AWS allows requiring MFA via policy:
```json
{
  "Effect": "Deny",
  "Action": "*",
  "Resource": "*",
  "Condition": {
    "Bool": { "aws:MultiFactorAuthPresent": "false" }
  }
}
```

### 📟 Console — Enable MFA on Root

```
1. Click your account (top-right) → Security credentials
2. Multi-factor authentication → Activate MFA device
3. Virtual authenticator app → Next
4. Scan QR code with Google Authenticator / Authy
5. Enter 6-digit codes (two consecutive)
6. → Activate MFA device
```

---

## 8. IAM Best Practices

```
☑ Root account: Protect with MFA, don't use for daily work
☑ Least privilege: Grant only necessary permissions
☑ Use groups: Manage permissions at group level
☑ Use roles: For services and cross-account access
☑ Access keys: Rotate every 90 days
☑ Credential reports: Regularly audit who has what access
☑ Remove unused: Deactivate/delete unused users, keys, policies
☑ Use temporary credentials: STS tokens for temporary access
☑ CloudTrail: Log all IAM changes
☑ Prevent policy mistakes: Use AWS Config, 3rd-party tools review
```

---

## 9. STS (Security Token Service)

STS provides **temporary credentials** (access key + secret key + session token).

### Temporary Credentials

- Valid for 15 minutes to 1 hour (configurable)
- Auto-refresh (caller must request new ones)
- More secure than long-lived keys
- Perfect for web apps, mobile apps, federated users

### Use Cases

1. **Web app → AWS**: AssumeRole API returns temporary creds
2. **Mobile app**: Cognito returns temporary STS token
3. **Cross-account**: User assumes role in partner account
4. **On-premises**: SAML federation returns STS token

### 💻 CLI

```bash
# Assume role
aws sts assume-role \
  --role-arn arn:aws:iam::123456789012:role/MyRole \
  --role-session-name my-session

# Output includes:
# - AccessKeyId (temp)
# - SecretAccessKey (temp)
# - SessionToken (session id, required for all calls)
# - Expiration (when creds expire)

# Get caller identity
aws sts get-caller-identity

# Get session token (MFA)
aws sts get-session-token \
  --serial-number arn:aws:iam::123456789012:mfa/john.doe \
  --token-code 123456
```

---

## 10. Interview Q&A

**Q: Should I use the root account for daily work?**
No. The root account has unlimited permissions and can't be restricted. Use IAM users with minimal permissions (least privilege). Protect root with MFA and only use for account recovery.

**Q: What is the difference between a user and a role?**
Users have long-lived credentials (password, access key). Roles have temporary credentials auto-refreshed via STS. Use roles for services (EC2, Lambda) and temporary access.

**Q: How do I give EC2 permission to access S3 without using access keys?**
Create an IAM role with S3 permissions, attach it to the EC2 instance. EC2 automatically gets temporary credentials via the instance metadata service — no keys needed.

**Q: What is principal and resource in IAM?**
Principal: who is trying to access (user, role, service). Resource: what they're accessing (S3 bucket, EC2 instance). Resource-based policies (bucket policies) specify both principal and resource.

**Q: What is an explicit Deny and why does it matter?**
Explicit Deny always wins. Even if a policy says Allow, an Explicit Deny will block access. Use Denies for exceptions or compliance blocks.

**Q: How do I audit IAM changes?**
Use CloudTrail to log all API calls including IAM changes. CloudTrail is the single source of truth for who did what and when.

**Q: What is a permissions boundary?**
A permissions boundary sets the maximum permissions a user/role can have. User's actual permissions = intersection of user policy AND boundary policy.

**Q: Can I use the same policy for a user and a role?**
Yes, but user policies have no trust relationship. Role policies include a trust policy (who can assume it) + permission policy (what they can do).

**Q: How do I detect unused access keys?**
Use Access Analyzer or Credential Report. Access Analyzer shows which credentials have been used in the last 90 days.

**Q: What is cross-account access and how do it set it up?**
Cross-account: User in Account A accesses resources in Account B. Setup: (1) Create role in Account B, (2) Add trust policy allowing Account A principal, (3) User in Account A assumes role in Account B.

---

## 11. Quick Reference Cheat Sheet

| Concept | Definition |
|---------|-----------|
| **Root account** | Email + password, unlimited access, MFA-protect |
| **IAM User** | Individual with restricted permissions |
| **IAM Group** | Collection of users, inherit group policies |
| **IAM Role** | Temporary credentials, services/cross-account use |
| **IAM Policy** | JSON allowing/denying specific actions on resources |
| **Least Privilege** | Grant only minimum permissions needed |
| **Access Key** | Long-lived programmatic credentials (access ID + secret) |
| **Temporary Creds** | STS-issued, expire in 15min–1hr, auto-refresh |
| **MFA** | Two-factor auth (virtual, hardware, SMS) |
| **Service Role** | Role assumed by AWS service (EC2, Lambda) |
| **Trust Policy** | Defines who can assume a role |
| **Permission Policy** | Defines what a role can do |
| **Principal** | Who (user, role, service) in access equation |
| **Resource** | What (S3 bucket, EC2 instance) in access equation |
| **Explicit Allow** | Permission granted explicitly |
| **Explicit Deny** | Permission blocked (overrides Allow) |
| **Permissions Boundary** | Max permissions a user/role can have |
| **Cross-Account** | User in one account assumes role in another |
| **In-line Policy** | Policy directly attached to user/role (not reusable) |
| **Managed Policy** | Policy created separate, reusable (AWS or customer) |
| **ARN** | Amazon Resource Name (unique identifier: arn:aws:service:region:account:resource) |
| **SID** | Statement ID in policy (optional, for clarity) |

---

*Identity is the new perimeter. Least privilege is non-negotiable.* 🔐
