# Architecture Patterns - Real-World Designs

## Serverless Web Application

```
Architecture:

Client
  ↓ (HTTPS)
CloudFront (CDN)
  ├── /static/* → S3 (images, CSS, JS)
  └── /api/* → API Gateway

API Gateway
  ├── POST /users → Lambda (create)
  ├── GET /users → Lambda (list)
  └── GET /users/{id} → Lambda (detail)

Lambda functions
  ├── Connect to RDS (secrets from Secrets Manager)
  ├── Connection pooling (avoid cold start)
  └── Logs to CloudWatch

RDS Aurora MySQL
  ├── Multi-AZ
  ├── Automated backups
  └── Read replicas for analytics

Benefits:
├── No servers to manage
├── Auto-scaling
├── Pay per use
└── High availability built-in

Cost:
├── CloudFront: $0.085/GB
├── API Gateway: $3.50 per million requests
├── Lambda: $0.0000002 per request
├── RDS: $0.45 per hours
└── Total: $50-200/month (small app)
```

## Microservices on Containers

```
Architecture:

ALB
  ├── /orders → Order service
  ├── /payments → Payment service
  └── /inventory → Inventory service

Each service:
  ├── Container image (ECR)
  └── ECS Fargate (serverless containers)
  └── Auto-scaling

Inter-service communication:
  ├── Synchronous: Direct via ALB
  ├── Asynchronous: Via SQS/SNS
  └── Service discovery: Route 53

Database per service:
  ├── Orders → DynamoDB
  ├── Payments → RDS
  └── Inventory → PostgreSQL

Benefits:
├── Independent scaling
├── Technology choice per service
├── Deploy independently
└── Team ownership

Challenges:
├── Distributed tracing (X-Ray)
├── Data consistency (eventual)
└── Operational complexity (higher)
```

## Event-Driven Processing

```
Architecture:

Data source
  └── S3 file upload

EventBridge trigger
  ↓
Lambda function
  ├── Resize image
  ├── Extract metadata
  ├── Index in ElasticSearch
  └── Store metadata in DynamoDB

Fanout pattern:
└── Multiple parallel processes

Async pattern:
Lambda 1: Process immediately
Lambda 2: Queue for later processing

Benefits:
├── Decoupled architecture
├── Scalable
├── Resilient (DLQ for failures)
└── Cost-effective

Real-world example:
Uploaded: user_photo_12345.jpg
  ├── Lambda 1: Thumbnail generation
  ├── Lambda 2: ML analysis (Rekognition)
  ├── Lambda 3: Index for search
  └── All parallel, independent
```

## High-Throughput Data Pipeline

```
Architecture:

Data sources (millions/sec):
  ├── IoT devices
  ├── Clickstream
  └── Server logs

Kinesis Data Streams
  └── Real-time ingestion (1M records/sec)

Processing:
  ├── Lambda (transform)
  ├── Kinesis Firehose (batch)
  └── EventBridge (route)

Storage:
  ├── S3 (data lake)
  ├── Timestream (time-series)
  ├── DynamoDB (aggregates)
  └── Redshift (analytics)

Querying:
  ├── Athena (SQL on S3)
  ├── Redshift (OLAP)
  └── QuickSight (dashboards)

Benefits:
├── Handles massive throughput
├── Near real-time analytics
├── Replay capability
└── Data lake foundation

Cost:
├── Kinesis: $0.34 per day per shard
├── S3: $0.023/GB
├── Athena: $5 per TB scanned
```

## E-Commerce Platform

```
Components:

Frontend:
  ├── S3 + CloudFront (static HTML/CSS/JS)
  ├── Client-side: React/Vue
  └── Cached aggressively (1 week TTL)

API Layer:
  ├── API Gateway
  ├── Lambda backend
  └── Cognito (authentication)

Catalog Service:
  ├── CloudFront
  ├── Origin: API Gateway
  └── Cache: 1 hour

Product Database:
  ├── DynamoDB (NoSQL)
  ├── Global tables (multi-region)
  └── ElasticSearch (search)

Cart & Orders:
  ├── Session cache: ElastiCache
  ├── Order storage: DynamoDB
  └── Stream orders to SNS (async)

Payment:
  ├── Stripe integration
  ├── via API Gateway
  └── Store in RDS (audit)

Admin Dashboard:
  ├── IAM auth
  ├── Lambda backend
  └── ReadOnly replicas for reports

Scalability:
├── CloudFront caches 80%+ traffic
├── API cache reduces Lambda calls
├── Auto-scaling per component
└── Database sharding for scale

Real-time features:
├── WebSocket API (live chat)
├── Notifications: SNS
└── Real-time inventory: DynamoDB Streams
```

## Machine Learning Pipeline

```
Architecture:

Data Ingestion:
  ├── S3 (data lake)
  ├── RDS (operational)
  └── Kinesis (streaming)

Data Preparation:
  ├── EMR (Spark for transformation)
  ├── SageMaker notebooks (exploration)
  └── Processed data → S3

Model Training:
  ├── SageMaker training jobs
  ├── Hyperparameter tuning
  ├── Model registry (versioning)
  └── Best model selected

Model Deployment:
  ├── SageMaker endpoint (A/B testing)
  ├── Lambda wrapper (API)
  └── Auto-scaling based on load

Inference:
  ├── API call to Lambda
  ├── Lambda → SageMaker endpoint
  ├── Response to application
  └── Cache predictions (where appropriate)

Monitoring:
  ├── Model quality metrics
  ├── Prediction drift detection
  ├── CloudWatch dashboards
  └── Auto-retraining trigger

Use case:
Customer visits: personalized_recommendations

Lambda:
  ├── User ID
  ├── Call SageMaker endpoint
  └── Return top 5 products

Results:
  ├── 40% increase in conversion
  └── $2M incremental revenue/year
```

## Compliance & Audit Ready

```
Architecture:

All API calls logged:
  └── CloudTrail → S3 (audit bucket)

Configuration changes tracked:
  ├── Config Rules
  ├── Non-compliance flagged
  └── Auto-remediation

Data encryption:
  ├── At-rest: KMS
  ├── In-transit: TLS
  └── CloudTrail audits key usage

Access logging:
  ├── ALB logs → S3
  ├── RDS audit logs
  ├── VPC Flow Logs
  └── Query with Athena

Backup & recovery:
  ├── Daily snapshots
  ├── Cross-region replication
  ├── PITR enabled
  └── Regular restore tests

Compliance tools:
  ├── Security Hub (findings aggregation)
  ├── GuardDuty (threat detection)
  ├── Macie (data discovery)
  └── Inspector (vulnerability scanning)

Audit readiness:
  ├── 7-year log retention
  ├── Integrity validation (CloudTrail logs)
  ├── Change tracking (Config)
  └── Ready for inspectors
```

## Cost-Optimized Startup

```
Phase 1 (Launch):
  ├── Single EC2 (t3.micro)
  ├── RDS (single-AZ, t3.micro)
  ├── S3 for assets
  └── Cost: $30/month

Phase 2 (Growth):
  ├── ALB added
  ├── Multi-AZ RDS
  ├── CloudFront for scale
  ├── CloudWatch monitoring
  └── Cost: $200/month

Phase 3 (Scale):
  ├── Microservices
  ├── Lambda for some workloads
  ├── Auto-scaling groups
  ├── ReadOnly replicas
  └── Cost: $2,000/month

Optimization:
  ├── Spot instances (30-70% discount)
  ├── Reserved instances
  ├── CloudFront caching (cost/performance)
  ├── Data transfer optimization
  └── Potential 50% cost reduction
```

## ⚠️ Common Mistakes

❌ **Over-engineering initially**
→ Start simple, evolve with demand

❌ **No monitoring**
→ Can't optimize what you don't measure

❌ **Single region**
→ Regional failure = total outage

❌ **Hard to tier architecture**
→ Build flexibility in from start

❌ **Ignoring costs**
→ Serverless can cost 10x if not optimized

## 🎯 Key Takeaways

✅ Match architecture to use case
✅ Serverless for unpredictable load
✅ Containers for complex apps
✅ Event-driven for scalability
✅ Multi-region for resilience
✅ Cost optimization is ongoing
✅ Monitor from day 1
✅ Start simple, evolve to complex

---

**Good architecture is both elegant and pragmatic!**

---

[← Previous: Machine Learning Services](39-ml-services.md) | [Contents](README.md) | [Next: Best Practices & Optimization →](41-best-practices.md)

