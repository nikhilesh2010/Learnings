# Terraform - Multi-Cloud IaC

## Terraform vs CloudFormation

**What:** Terraform = Multi-cloud Infrastructure as Code tool (AWS, Azure, GCP).

**Why we use it:** CloudFormation only works with AWS. Terraform works everywhere, so code is portable.

**How it works:**

```
CloudFormation:
├── AWS-only
├── Native integration (auto-discovers resources)
├── Limited to AWS ecosystem
└── Good for: AWS-focused teams

Terraform:
├── Multi-cloud (AWS, Azure, GCP, Kubernetes, etc.)
├── Write once, deploy anywhere
├── Cloud-agnostic approach
├── Powerful modularity
├── Steeper learning curve
└── Good for: Multi-cloud strategy
```

**Simple example comparison:**

```
Deploy VPC + Subnet:

CloudFormation (AWS-only):
aws cloudformation create-stack \
  --template-body file://vpc.yaml

Terraform (multi-cloud):
terraform apply  # Same code works on AWS, Azure, GCP!

To switch from AWS to Azure:
├── Change provider configuration
├── Run terraform apply
├── Done! Infrastructure on Azure now
```

## Terraform Workflow

```
1. Write code (.tf files)
2. terraform init (download plugins)
3. terraform plan (preview changes)
4. terraform apply (create/update)
5. terraform destroy (remove)
```

## Terraform Configuration

```hcl
# Configure AWS provider
terraform {
  required_version = ">= 1.0"
  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.0"
    }
  }

  # Store state in S3 (shared)
  backend "s3" {
    bucket = "terraform-state"
    key    = "prod/terraform.tfstate"
    region = "us-east-1"
  }
}

provider "aws" {
  region = "us-east-1"
}

# Create VPC
resource "aws_vpc" "main" {
  cidr_block           = "10.0.0.0/16"
  enable_dns_hostnames = true

  tags = {
    Name = "main-vpc"
  }
}

# Create subnet
resource "aws_subnet" "main" {
  vpc_id            = aws_vpc.main.id
  cidr_block        = "10.0.1.0/24"
  availability_zone = "us-east-1a"

  tags = {
    Name = "main-subnet"
  }
}

# Output values
output "vpc_id" {
  value = aws_vpc.main.id
}
```

## Variables & Modules

### Variables

```hcl
variable "environment" {
  description = "Environment name"
  type        = string
  default     = "prod"

  validation {
    condition     = contains(["dev", "staging", "prod"], var.environment)
    error_message = "Must be dev, staging, or prod"
  }
}

variable "instance_count" {
  type    = number
  default = 3
}

variable "tags" {
  type = map(string)
  default = {
    Owner = "Platform Team"
    Env   = "prod"
  }
}

# Use variables
resource "aws_instance" "web" {
  for_each      = toset(range(var.instance_count))
  ami           = "ami-0123456789abcdef0"
  instance_type = var.environment == "prod" ? "t3.large" : "t3.micro"

  tags = merge(
    var.tags,
    { Name = "web-${each.key}" }
  )
}
```

### Modules

Reusable components:

```hcl
# modules/vpc/main.tf
resource "aws_vpc" "main" {
  cidr_block = var.vpc_cidr

  tags = {
    Name = var.vpc_name
  }
}

resource "aws_subnet" "main" {
  vpc_id            = aws_vpc.main.id
  cidr_block        = var.subnet_cidr
  availability_zone = var.az

  tags = {
    Name = var.subnet_name
  }
}

# modules/vpc/variables.tf
variable "vpc_name" {
  type = string
}

variable "vpc_cidr" {
  type = string
}

# modules/vpc/outputs.tf
output "vpc_id" {
  value = aws_vpc.main.id
}

output "subnet_id" {
  value = aws_subnet.main.id
}

# main.tf (root)
module "vpc" {
  source = "./modules/vpc"

  vpc_name   = "main-vpc"
  vpc_cidr   = "10.0.0.0/16"
  subnet_cidr = "10.0.1.0/24"
  subnet_name = "main-subnet"
  az         = "us-east-1a"
}

# Reference module outputs
resource "aws_instance" "web" {
  subnet_id = module.vpc.subnet_id
  # ...
}
```

## State Management

Critical for tracking resources:

```
terraform.tfstate (JSON):
{
  "resources": [
    {
      "type": "aws_instance",
      "name": "web",
      "instances": [
        {
          "id": "i-0123456789abcdef0",
          "attributes": {
            "ami": "ami-..."
          }
        }
      ]
    }
  ]
}

Remote state (S3):
├── Main state file
├── Shared across team
├── Locking (prevent concurrent edits)
└── Versioning (rollback capability)

State locking:
├── DynamoDB table
├── Prevents simultaneous applies
└── Automatic cleanup
```

## Plan & Apply

### Terraform Plan

```
terraform plan -out=tfplan

Output:
+ aws_vpc.main (will create)
~ aws_instance.web[0] (will modify)
  ~ instance_type: "t3.micro" -> "t3.small"
- aws_security_group.old (will delete)

Review changes:
└── Verify expected actions
└── No surprises
```

### Terraform Apply

```
terraform apply tfplan

Creates/updates/deletes:
├── New resources
├── Modified properties
└── Removed resources

State updated:
└── terraform.tfstate reflects reality
```

## Workspaces

Separate states per environment:

```
terraform workspace new staging
terraform workspace select staging

Result:
├── staging state (separate)
├── Modify staging environment
└── Switch back: terraform workspace select prod

Directory structure:
└── terraform.tfstate.d/
    ├── default/
    ├── staging/
    └── prod/
```

## Local Values

Simplify repetitive values:

```hcl
locals {
  common_tags = {
    Environment = var.environment
    Owner       = "Platform Team"
    ManagedBy   = "Terraform"
  }

  db_config = {
    engine_version = "13.7"
    instance_class = "db.t3.medium"
    allocated_storage = 100
  }
}

resource "aws_db_instance" "main" {
  engine_version     = local.db_config.engine_version
  db_instance_class  = local.db_config.instance_class
  allocated_storage  = local.db_config.allocated_storage

  tags = local.common_tags
}
```

## Data Sources

Query existing resources:

```hcl
# Find latest Ubuntu AMI
data "aws_ami" "ubuntu" {
  most_recent = true

  filter {
    name   = "name"
    values = ["ubuntu/images/hvm-ssd/ubuntu-jammy-22.04-amd64-server-*"]
  }

  owners = ["099720109477"] # Canonical
}

# Use in resource
resource "aws_instance" "web" {
  ami           = data.aws_ami.ubuntu.id
  instance_type = "t3.micro"
}
```

## Conditional Logic

```hcl
resource "aws_instance" "web" {
  count         = var.environment == "prod" ? 3 : 1
  ami           = data.aws_ami.ubuntu.id
  instance_type = var.environment == "prod" ? "t3.large" : "t3.micro"

  tags = {
    Name = "web-${count.index}"
  }
}
```

## ⚠️ Common Mistakes

❌ **State committed to Git**
→ Keep state remote (S3) and add .gitignore

❌ **No locking configured**
→ Use DynamoDB locking for safety

❌ **Hard-coded values**
→ Use variables and locals

❌ **Not using modules**
→ Code reuse saves time

❌ **No version constraints**
→ Pin provider versions

## 🎯 Key Takeaways

✅ Multi-cloud IaC
✅ State management critical
✅ Modules for reusability
✅ Variables for inputs
✅ Workspaces for environments
✅ Plan before apply (safety)
✅ Remote state for teams
✅ Locking prevents conflicts

---

**Terraform makes infrastructure truly code-driven!**

---

[← Previous: CloudFormation - Advanced Patterns](33-cloudformation-advanced.md) | [Contents](README.md) | [Next: Auto Scaling & Performance →](35-autoscaling.md)
