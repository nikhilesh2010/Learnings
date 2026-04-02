# CloudFormation Advanced - Infrastructure as Code

## CloudFormation Templates

Declare infrastructure as code:

```
Template format: YAML/JSON
├── AWSTemplateFormatVersion
├── Description
├── Parameters (inputs)
├── Mappings (static data)
├── Conditions (if/then)
├── Resources (what to create)
├── Outputs (what to return)
└── Metadata

Workflow:
1. Write template
2. Create stack
3. CloudFormation processes
4. Resources created
```

## Template Example

```yaml
AWSTemplateFormatVersion: '2010-09-09'
Description: 'Web application stack'

Parameters:
  EnvironmentName:
    Type: String
    Default: prod
  InstanceType:
    Type: String
    Default: t3.micro

Resources:
  MySecurityGroup:
    Type: AWS::EC2::SecurityGroup
    Properties:
      GroupDescription: Allow HTTP/S
      SecurityGroupIngress:
        - IpProtocol: tcp
          FromPort: 80
          ToPort: 80
          CidrIp: 0.0.0.0/0
        - IpProtocol: tcp
          FromPort: 443
          ToPort: 443
          CidrIp: 0.0.0.0/0

  MyInstance:
    Type: AWS::EC2::Instance
    Properties:
      ImageId: ami-0123456789abcdef0
      InstanceType: !Ref InstanceType
      SecurityGroupIds:
        - !Ref MySecurityGroup
      Tags:
        - Key: Environment
          Value: !Ref EnvironmentName

Outputs:
  InstanceId:
    Value: !Ref MyInstance
  PublicIp:
    Value: !GetAtt MyInstance.PublicIp
```

## Nested Stacks

Modular templates:

```
Main template:
├── VPC stack
├── Database stack
├── Application stack
└── Monitoring stack

Each stack:
└── Separate template (modules)

Benefits:
├── Reusability
├── Cleaner templates
├── Easier to maintain
└── Team ownership per stack

Outputs:
└── Each stack outputs passed to parent
```

## Stack Sets

Multi-account/region deployment:

```
StackSet: Base infrastructure
├── Deployed to 10 AWS accounts
├── Across 3 regions
└── 30 stacks total (10 × 3)

Use for:
├── Organization-wide policies
├── Multi-tenant applications
├── Disaster recovery (multi-region)
├── Compliance standards

Management:
└── Update StackSet once
└── All 30 stacks update automatically
```

## Change Sets

Preview changes safely:

```
Traditional stack update:
Update template
  ↓ (fingers crossed)
Resources change immediately
  ↓
Hope nothing broke!

Change set:
Create change set
  ↓
Preview what will change
  ├── Create: New resources
  ├── Modify: Changed properties
  ├── Delete: Removed resources
  └── Unchanged: No changes

Review before:
└── Execute change set
```

## Intrinsic Functions

Dynamically reference values:

```
!Ref: Reference resource
  aws::Ref MyBucket → bucket name

!GetAtt: Get resource attribute
  !GetAtt MyInstance.PublicIp → public IP

!Sub: String substitution
  Domain: !Sub "${AppName}.example.com"

!Join: Join values
  !Join [',', [a, b, c]] → "a,b,c"

!If: Conditional
  !If [IsProd, large, small]

!Select: Array element
  !Select [0, !Split [',', data]]
```

## Conditions

Conditional resource creation:

```yaml
Conditions:
  IsProd:
    Fn::Equals:
      - !Ref EnvironmentName
      - prod

Resources:
  MultiAZRDS:
    Type: AWS::RDS::DBInstance
    Condition: IsProd  # Only if prod
    Properties:
      MultiAZ: true
      DBInstanceClass: db.r5.large

  SimpleRDS:
    Type: AWS::RDS::DBInstance
    Condition: !Not [IsProd]  # Only if NOT prod
    Properties:
      MultiAZ: false
      DBInstanceClass: db.t3.micro
```

## Mappings

Static lookup tables:

```yaml
Mappings:
  RegionMap:
    us-east-1:
      AMI: ami-0123456789abcdef0
      InstanceType: t3.micro
    eu-west-1:
      AMI: ami-9876543210fedcba0
      InstanceType: t3.small

Resources:
  MyInstance:
    Properties:
      ImageId: !FindInMap [RegionMap, !Ref 'AWS::Region', AMI]
      InstanceType: !FindInMap [RegionMap, !Ref 'AWS::Region', InstanceType]
```

## Drift Detection

Detect manual changes:

```
Template defines:
├── EC2 instance: t3.micro
├── EBS 100GB
└── Tag: ENV=prod

Someone manually:
├── Changes instance to t3.small (DRIFT!)
├── Increases EBS to 200GB (DRIFT!)
└── Removes tag (DRIFT!)

Detect drift:
Stack → Detect drift
  └── Show all manual changes
  └── Recommend remediation

Fix drift:
├── Update template
├── Or, force back to template
```

## Deletion Policies

Control what happens on delete:

```yaml
Resources:
  MyBucket:
    Type: AWS::S3::Bucket
    DeletionPolicy: Retain  # Keep bucket even if stack deleted
    Properties:
      BucketName: my-data-bucket

  MyDB:
    Type: AWS::RDS::DBInstance
    DeletionPolicy: Snapshot  # Snapshot before delete
    Properties:
      DBInstanceIdentifier: mydb

  MyInstance:
    Type: AWS::EC2::Instance
    DeletionPolicy: Delete  # Delete (default)
    Properties:
      ImageId: ami-0123456789abcdef0
```

## Stack Policies

Prevent accidental updates:

```json
{
  "Statement": [
    {
      "Effect": "Allow",
      "Principal": "*",
      "Action": "Update:*",
      "Resource": "*"
    },
    {
      "Effect": "Deny",
      "Principal": "*",
      "Action": "Update:Replace",
      "Resource": "LogicalResourceId/MyDatabase"
    }
  ]
}
```

Prevents accidental DB replacement!

## Cost & Validation

```
Validate template:
aws cloudformation validate-template \
  --template-body file://template.yaml

Estimate costs:
AWS Console → Check stack costs
  └── Monthly estimate

Cost driver:
├── EC2 (compute): $20-$100/month typical
├── RDS (database): $10-$50/month typical
└── Others: Varies
```

## ⚠️ Common Mistakes

❌ **Hard-coded values**
→ Use parameters for reusability

❌ **No DeletionPolicy**
→ Critical data deleted with stack!

❌ **Not using nested stacks**
→ Monolithic template becomes unwieldy

❌ **No change set review**
→ Unexpected resource replacement

❌ **Tags not applied**
→ Can't track costs/ownership

## 🎯 Key Takeaways

✅ Infrastructure as code
✅ Parameters for inputs
✅ Nested stacks for modularity
✅ Change sets for safety
✅ Stack sets for multi-account
✅ Drift detection for compliance
✅ Deletion policies for safety
✅ Intrinsic functions for flexibility

---

**CloudFormation makes infrastructure reproducible and version-controlled!**

---

[← Previous: CloudFormation - IaC Fundamentals](32-cloudformation.md) | [Contents](README.md) | [Next: Terraform on AWS →](34-terraform.md)
