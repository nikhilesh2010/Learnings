# Container Services - ECS & Kubernetes

## Container Basics Review

```
VM vs. Container:

VM:
├── Full OS (heavyweight)
├── Hypervisor overhead
├── Slow startup (minutes)
├── Isolation: Strong

Container:
├── Lightweight (just app)
├── Shared kernel
├── Fast startup (seconds)
├── Isolation: Good
└── More dense packing
```

## Elastic Container Service (ECS)

AWS-native container orchestration:

```
Components:
├── Task definition (what to run: image, memory, CPU, env vars)
├── Service (how many tasks, load balancing)
├── Cluster (where to run: EC2 or Fargate)
└── Container registry: ECR (Elastic Container Registry)
```

### ECS Launch Types

#### EC2 Launch Type

```
You manage:
├── EC2 instances
├── Scaling
├── Patching
├── OS updates

AWS manages:
├── Docker daemon
├── Scheduling

Best for:
├── Consistent, predictable load
├── Need GPU/specialized hardware
└── Cost optimization (spot instances)

Cost:
└── EC2 instance + ECS agent
```

#### Fargate Launch Type

```
You provide:
├── Container image
└── Memory/CPU requirement

AWS manages:
├── Infrastructure
├── Scaling
├── Patching
└── Networking

Best for:
├── Unpredictable load
├── Don't want to manage servers
├── Rapid scaling

Cost:
├── Fargate (per vCPU-hour): $0.04560
├── Memory (per GB-hour): $0.00504
└── Typical: $50/month (small task)
```

## Task Definition Example

```json
{
  "family": "web-app",
  "taskRoleArn": "arn:aws:iam::123456789012:role/ecsTaskRole",
  "executionRoleArn": "arn:aws:iam::123456789012:role/ecsTaskExecutionRole",
  "containerDefinitions": [
    {
      "name": "web",
      "image": "123456789012.dkr.ecr.us-east-1.amazonaws.com/myapp:latest",
      "cpu": 256,
      "memory": 512,
      "portMappings": [
        {
          "containerPort": 8080,
          "hostPort": 8080,
          "protocol": "tcp"
        }
      ],
      "environment": [
        {
          "name": "DATABASE_URL",
          "value": "postgres://..."
        }
      ],
      "secrets": [
        {
          "name": "API_KEY",
          "valueFrom": "arn:aws:secretsmanager:..."
        }
      ],
      "logConfiguration": {
        "logDriver": "awslogs",
        "options": {
          "awslogs-group": "/ecs/web-app",
          "awslogs-region": "us-east-1",
          "awslogs-stream-prefix": "ecs"
        }
      }
    }
  ],
  "requiresCompatibilities": ["FARGATE"],
  "networkMode": "awsvpc",
  "cpu": "256",
  "memory": "512"
}
```

## Service Auto-Scaling

```
Desired count: 3

Scale up when:
├── CPU > 70%
├── Memory > 80%
└── Custom metric spike

Scale down when:
├── Load drops
└── CPU < 20% for 5 min

Result:
└── Desired count adjusts 1-10 automatically
```

## Elastic Kubernetes Service (EKS)

Managed Kubernetes:

```
Kubernetes:
├── Industry-standard orchestration
├── Portable (not AWS-specific)
├── Steep learning curve
└── Powerful

EKS provides:
├── Managed control plane
├── AWS integration (IAM, VPC, etc.)
├── Auto-provisioning nodes
└── Simplified management

Cost:
├── Control plane: $0.10 per hour
├── Worker nodes: EC2/Fargate costs
└── Typical: $200-500/month
```

### EKS Cluster Setup

```
1. Create IAM role for control plane
2. Create VPC + subnets
3. Create EKS cluster
   aws eks create-cluster \
     --name my-cluster \
     --version 1.28 \
     --role-arn arn:aws:iam::...:role/eks-service
4. Create node group
   aws eks create-nodegroup \
     --cluster-name my-cluster \
     --nodegroup-name ng-1 \
     --subnets subnet-xxx1 subnet-xxx2
5. Configure kubectl
   aws eks update-kubeconfig \
     --name my-cluster
6. Deploy application
   kubectl apply -f deployment.yaml
```

## Container Image Lifecycle

### Building Images

```dockerfile
# Dockerfile
FROM python:3.9-slim

WORKDIR /app

COPY requirements.txt .
RUN pip install -r requirements.txt

COPY . .

CMD ["python", "app.py"]
```

Build & push:

```bash
docker build -t myapp:1.0 .

# Tag for ECR
docker tag myapp:1.0 123456789012.dkr.ecr.us-east-1.amazonaws.com/myapp:1.0

# Login to ECR
aws ecr get-login-password --region us-east-1 | \
  docker login --username AWS --password-stdin \
  123456789012.dkr.ecr.us-east-1.amazonaws.com

# Push to ECR
docker push 123456789012.dkr.ecr.us-east-1.amazonaws.com/myapp:1.0
```

## ECR (Elastic Container Registry)

Private Docker repository:

```
Features:
├── Private image storage
├── Lifecycle policies (auto-delete old images)
├── Image scanning (vulnerability detection)
├── Cross-region replication
└── Integration with ECS/EKS

Cost:
└── $0.07 per GB per month

Example policy:
├── Keep 10 latest images
├── Delete older than 30 days
└── Auto-clean storage
```

## Service Mesh (Advanced)

Control communication between containers:

```
Without service mesh:
Container A → Container B (direct)
  ├── Retries handled in app code
  ├── Auth done in app
  ├── Tracing in app
  └── Messy, duplicated logic

With AWS App Mesh:
Container A → Proxy → Service Mesh → Proxy → Container B
  ├── Retries handled by mesh
  ├── Auth handled by mesh
  ├── Observability built-in
  └── Cleaner app code

Cost:
└── $0.015 per vCPU-hour
```

## Comparison: ECS vs. EKS vs. Fargate

| Feature | ECS | EKS | Fargate |
|---------|-----|-----|---------|
| Orchestration | Simple | Advanced | Managed |
| Learning curve | Low | Steep | Low |
| Portability | Low | High | Medium |
| Cost | Low | Medium | Medium-High |
| Use for | AWS-focused | Multi-cloud | Simplicity |

## Container Logging

```
Using CloudWatch:

Log group: /ecs/myapp
Log stream: task-id-1

Container logs → CloudWatch Logs
Query: 
  fields @timestamp, message
  | filter @message like /ERROR/
  | stats count() as error_count

Retention:
├── Never expire
├── Or 1 day - 10 years
└── Cost: $0.50 per GB ingested
```

## Container Security

```
Best practices:
├── Don't run container as root
├── Scan images for vulnerabilities
├── Use read-only file system
├── Limit resource usage
├── Use secrets (not env vars) for sensitive data
├── Network policies (restrict traffic)
└── Regular updates

ECR image scanning:
  Basic: Free (basic scan)
  Enhanced: $0.30/image/month
    ├── Continuous monitoring
    └── Integration with GuardDuty
```

## ⚠️ Common Mistakes

❌ **Ignoring image vulnerabilities**
→ Enable ECR image scanning

❌ **Running as root in containers**
→ Use non-root user

❌ **No container logging**
→ Can't debug issues

❌ **Hard-coding secrets**
→ Use Secrets Manager or Parameter Store

❌ **No resource limits**
→ Single container can consume all resources

## 🎯 Key Takeaways

✅ ECS for AWS-first approach
✅ EKS for portability/Kubernetes
✅ Fargate for serverless containers
✅ ECR for private registry
✅ Container logging to CloudWatch
✅ Image vulnerabilities scanning
✅ Non-root user in containers
✅ Service mesh for advanced needs

---

**Containers are the modern deployment unit!**

---

[← Previous: CloudFront - Content Delivery Network](20-cloudfront.md) | [Contents](README.md) | [Next: IAM - Identity & Access Management →](22-iam.md)
