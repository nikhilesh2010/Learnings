# CloudFormation - Infrastructure as Code

## What is CloudFormation?

**CloudFormation = Infrastructure as Code (IaC)**

Define AWS resources in code, deploy consistently:

```
Manual              CloudFormation
├── Click console  ├── Write JSON/YAML
├── Create VPC     ├── Create template
├── Create subnets ├── Deploy stack
├── Launch EC2     ├── Resources auto-created
└── Error-prone    └── Reproducible, version controlled
```

## Benefits of IaC

```bash
✅ Version control (git)
✅ Reusable templates
✅ Rapid deployment (seconds)
✅ Reproducible environments
✅ Easy to update/modify
✅ Disaster recovery
✅ Cost estimation
✅ Compliance & auditing
```

## CloudFormation Template Basics

### YAML Example

```yaml
AWSTemplateFormatVersion: '2010-09-09'
Description: 'Create VPC and EC2 instance'

Resources:
  MyVPC:
    Type: AWS::EC2::VPC
    Properties:
      CidrBlock: 10.0.0.0/16
      EnableDnsHostnames: true

  MySubnet:
    Type: AWS::EC2::Subnet
    Properties:
      VpcId: !Ref MyVPC
      CidrBlock: 10.0.1.0/24
      AvailabilityZone: us-east-1a

  MySecurityGroup:
    Type: AWS::EC2::SecurityGroup
    Properties:
      GroupDescription: Allow SSH and HTTP
      VpcId: !Ref MyVPC
      SecurityGroupIngress:
        - IpProtocol: tcp
          FromPort: 22
          ToPort: 22
          CidrIp: 0.0.0.0/0
        - IpProtocol: tcp
          FromPort: 80
          ToPort: 80
          CidrIp: 0.0.0.0/0

Outputs:
  VPCId:
    Value: !Ref MyVPC
    Description: VPC ID
```

### Template Sections

```yaml
AWSTemplateFormatVersion   # Version (always '2010-09-09')
Description                # Template description
Metadata                    # Template metadata
Parameters                  # Input parameters
Mappings                    # Lookup tables
Conditions                  # Conditional logic
Resources                   # AWS resources (REQUIRED)
Outputs                     # Return values
```

## Key Concepts

### 1. Stacks

Collection of resources created together:

```
Stack: production-app
├── VPC
├── Subnets
├── EC2 instance
├── RDS database
└── Security groups

Delete stack → All resources deleted
Update stack → All resources updated
```

### 2. Resources

Individual AWS components:

```yaml
Resources:
  MyDB:
    Type: AWS::RDS::DBInstance
    Properties:
      DBInstanceIdentifier: mydb
      Engine: PostgreSQL
      DBInstanceClass: db.t3.micro
      MasterUsername: admin
      MasterUserPassword: SecurePassword123!
```

### 3. Parameters

Make templates reusable:

```yaml
Parameters:
  InstanceType:
    Type: String
    Default: t2.micro
    AllowedValues:
      - t2.micro
      - t2.small
      - m5.large
    Description: EC2 instance type

Resources:
  MyEC2:
    Type: AWS::EC2::Instance
    Properties:
      InstanceType: !Ref InstanceType
      ImageId: ami-0c02fb55b0a6d0f0e
```

When deploying:
```bash
aws cloudformation create-stack \
  --stack-name my-stack \
  --template-body file://template.yaml \
  --parameters ParameterKey=InstanceType,ParameterValue=m5.large
```

### 4. Outputs

Return values after deployment:

```yaml
Outputs:
  LoadBalancerDNS:
    Value: !GetAtt MyLoadBalancer.DNSName
    Description: DNS name of load balancer

  DatabaseEndpoint:
    Value: !GetAtt MyDatabase.Endpoint.Address
    Description: RDS database endpoint
```

## Deploying CloudFormation

### Method 1: AWS Console

```bash
1. CloudFormation → Create Stack
2. Upload template (YAML/JSON)
3. Stack name: my-app-stack
4. Parameters (if any): Leave defaults or customize
5. Configure stack options (optional)
6. Review
7. Create Stack
8. Wait 5-30 minutes for deployment
```

### Method 2: AWS CLI

```bash
# Create stack
aws cloudformation create-stack \
  --stack-name my-app-stack \
  --template-body file://template.yaml \
  --parameters ParameterKey=KeyPair,ParameterValue=my-key

# Monitor deployment
aws cloudformation describe-stacks \
  --stack-name my-app-stack

# Get outputs
aws cloudformation describe-stacks \
  --stack-name my-app-stack \
  --query 'Stacks[0].Outputs'

# Delete stack
aws cloudformation delete-stack \
  --stack-name my-app-stack
```

## Updating Stacks

### Modify Template

```yaml
# Original:
DBInstanceClass: db.t3.micro

# Updated to:
DBInstanceClass: db.m5.large
```

### Deploy Update

```bash
aws cloudformation update-stack \
  --stack-name my-app-stack \
  --template-body file://updated-template.yaml

# Some changes cause:
- No interruption (applied immediately)
- Some resources replaced (brief downtime)
- Stack rollback on failure
```

## Intrinsic Functions

### Ref (Reference)

```yaml
MyVPC:
  Type: AWS::EC2::VPC
  Properties:
    CidrBlock: 10.0.0.0/16

MySubnet:
  Type: AWS::EC2::Subnet
  Properties:
    VpcId: !Ref MyVPC    # Reference MyVPC's ID
    CidrBlock: 10.0.1.0/24
```

### GetAtt (Get Attribute)

```yaml
MyDB:
  Type: AWS::RDS::DBInstance
  Properties:
    DBInstanceIdentifier: mydb
    Engine: PostgreSQL
    ...

Outputs:
  DBEndpoint:
    Value: !GetAtt MyDB.Endpoint.Address
```

### Sub (String Substitution)

```yaml
MyRole:
  Type: AWS::IAM::Role
  Properties:
    AssumeRolePolicyDocument:
      Version: '2012-10-17'
      Statement:
        - Effect: Allow
          Principal:
            Service: !Sub ec2.amazonaws.com
          Action: sts:AssumeRole

Outputs:
  Message:
    Value: !Sub 'Stack deployed in ${AWS::Region}'
    # Output: "Stack deployed in us-east-1"
```

## Common Resource Types

```yaml
# Networking
AWS::EC2::VPC
AWS::EC2::Subnet
AWS::EC2::SecurityGroup
AWS::EC2::InternetGateway
AWS::EC2::RouteTable

# Compute
AWS::EC2::Instance
AWS::Lambda::Function
AWS::Batch::ComputeEnvironment

# Database
AWS::RDS::DBInstance
AWS::DynamoDB::Table
AWS::ElastiCache::CacheCluster

# Storage
AWS::S3::Bucket
AWS::S3::BucketPolicy

# Application Integration
AWS::SNS::Topic
AWS::SQS::Queue
AWS::ApiGateway::RestApi

# Security
AWS::IAM::Role
AWS::IAM::Policy
AWS::KMS::Key
```

## Stack Events & Monitoring

### Events

```
RESOURCE_TYPE              STATUS
─────────────────────────  ──────────────
my-app-stack               CREATE_IN_PROGRESS
├── AWS::VPC                CREATE_IN_PROGRESS
├── AWS::VPC                CREATE_COMPLETE
├── AWS::EC2::Subnet        CREATE_IN_PROGRESS
├── AWS::EC2::Subnet        CREATE_COMPLETE
├── AWS::RDS::DBInstance    CREATE_IN_PROGRESS
│   (waiting 5 minutes...)
├── AWS::RDS::DBInstance    CREATE_COMPLETE
└── my-app-stack            CREATE_COMPLETE
```

### Monitor via CLI

```bash
aws cloudformation wait stack-create-complete \
  --stack-name my-app-stack
```

### Estimate Cost

Before deploying:

```bash
aws cloudformation estimate-template-cost \
  --template-body file://template.yaml
```

Returns: AWS Pricing page with estimated cost

## Stack Policies

Prevent accidental modifications:

```json
{
  "Statement": [
    {
      "Effect": "Deny",
      "Principal": "*",
      "Action": "Update:Delete",
      "Resource": "LogicalResourceId/Database"
    },
    {
      "Effect": "Allow",
      "Principal": "*",
      "Action": "Update:*",
      "Resource": "*"
    }
  ]
}
```

## Drift Detection

Find manual changes made in console:

```bash
# Detect drift
aws cloudformation detect-stack-drift \
  --stack-name my-app-stack

# View drift details
aws cloudformation describe-stack-drift \
  --stack-drift-detection-id <ID>

Result:
└── Resource A: Modified (changed in console)
└── Resource B: In sync (matches template)
└── Resource C: Deleted (removed manually)
```

## Change Sets

Preview updates before applying:

```bash
# Create change set
aws cloudformation create-change-set \
  --stack-name my-app-stack \
  --change-set-name update-db-size \
  --template-body file://updated-template.yaml \
  --change-set-type UPDATE

# Review changes (describe what will happen)
aws cloudformation describe-change-set \
  --stack-name my-app-stack \
  --change-set-name update-db-size

# Execute if looks good
aws cloudformation execute-change-set \
  --stack-name my-app-stack \
  --change-set-name update-db-size
```

## Nested Stacks

Organize large templates:

```
Parent Stack: main-app
├── Networking Stack
│   ├── VPC
│   ├── Subnets
│   └── Security Groups
├── Database Stack
│   └── RDS Instance
└── Compute Stack
    ├── Lambda
    └── EC2
```

Parent template:
```yaml
Resources:
  NetworkingStack:
    Type: AWS::CloudFormation::Stack
    Properties:
      TemplateURL: https://s3.amazonaws.com/bucket/networking.yaml

  DatabaseStack:
    Type: AWS::CloudFormation::Stack
    Properties:
      TemplateURL: https://s3.amazonaws.com/bucket/database.yaml
```

## Template Validation

```bash
# Validate template syntax
aws cloudformation validate-template \
  --template-body file://template.yaml

# Use cfn-lint (local validation)
brew install cfn-lint
cfn-lint template.yaml
```

## ⚠️ Common Mistakes

❌ **Large monolithic templates**
→ Use nested stacks

❌ **Hard-coded values**
→ Use parameters

❌ **No change sets for production**
→ Always review before deploying

❌ **Forgetting DeletionPolicy**
→ Resources deleted when stack deleted!

❌ **Not version controlling templates**
→ Use git!

## 🎯 Key Takeaways

✅ CloudFormation = Infrastructure as Code
✅ Templates define resources (VPC, EC2, RDS, etc.)
✅ Stacks = deployed collections of resources
✅ Reproducible, version-controlled infrastructure
✅ Use parameters for reusability
✅ Change sets for safe updates
✅ Drift detection for manual changes

## 🚀 Hands-On Exercise

1. ☑️ Create simple CloudFormation template (VPC + EC2)
2. ☑️ Deploy stack via console
3. ☑️ Get outputs (EC2 IP)
4. ☑️ SSH into EC2 (verify it works)
5. ☑️ Modify template (change instance type)
6. ☑️ Create change set, review, execute
7. ☑️ Delete stack (cleanup)

---

**CloudFormation is infrastructure best practice. Invest time here!**

---

[← Previous: EventBridge - Event Processing](31-eventbridge.md) | [Contents](README.md) | [Next: CloudFormation - Advanced Patterns →](33-cloudformation-advanced.md)
