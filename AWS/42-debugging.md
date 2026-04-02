# Debugging & Troubleshooting

## Common AWS Issues & Solutions

## EC2 Connection Issues

### Can't SSH into Instance

```
Error: "Connection refused" or timeout

Diagnosis Checklist:
□ Instance running? (Status: running)
□ Public IP assigned? (Elastic IP or Auto-assign)
□ Security group allows SSH (port 22)?
□ Network ACL allows port 22?
□ Private key correct? (my-key.pem)
□ Private key permissions? (chmod 400 my-key.pem)
□ Network connectivity? (ping DNS name)

Solution:
1. aws ec2 describe-instances --instance-ids i-xxxxx
   └── Check state, public IP, security group

2. Check security group:
   aws ec2 describe-security-groups --group-ids sg-xxxxx
   └── Verify port 22 is open

3. Verify network:
   aws ec2 describe-network-interfaces --filters Name=instance-id,Values=i-xxxxx

4. If no public IP:
   aws ec2 allocate-address --domain vpc
   aws ec2 associate-address --allocation-id eipalloc-xxxxx --instance-id i-xxxxx
```

### Instance Unresponsive

```
Instance running but won't respond

Causes:
├── OS crash
├── Disk full
├── Out of memory
├── Failed boot
└── Network misconfiguration

Solution:
1. Check instance status:
   └── System Status Check
   └── Instance Status Check
   └── Both must be "OK"

2. Check CloudWatch logs

3. Reboot instance:
   aws ec2 reboot-instances --instance-ids i-xxxxx

4. If persists: Check Systems Manager Session Manager
   or create AMI and troubleshoot offline
```

## Lambda Issues

### Lambda Timeout

```
Error: "Task timed out after X seconds"

Causes:
├── Function takes too long (>15 min)
├── Deadlock in code
├── Waiting on external service

Solution:
1. Check timeout setting:
   aws lambda get-function-configuration --function-name my-function
   └── Look for "Timeout"

2. Increase timeout:
   aws lambda update-function-configuration \
     --function-name my-function \
     --timeout 60

3. Check CloudWatch logs:
   aws logs tail /aws/lambda/my-function --follow

4. Optimize code:
   └── Profile with X-Ray
   └── Reduce cold starts
   └── Use async where possible
```

### Lambda Out of Memory

```
Error: Process exited before completing request

Causes:
├── Function memory too low
├── Memory leak in code
├── Large payload processing

Solution:
1. Increase memory:
   aws lambda update-function-configuration \
     --function-name my-function \
     --memory-size 512

2. Monitor memory usage:
   └── CloudWatch Logs Insights:
       fields @memoryUsed
       | stats max(@memoryUsed) as MaxMemory

3. Analyze code:
   └── Check for memory leaks
   └── Use profiler
```

### Lambda Throttling

```
Error: "Rate exceeded" or HTTP 429

Causes:
├── Exceeding concurrency limit (1000 default)
├── Too many simultaneous invocations
└── Account service limit

Solution:
1. Check throttles in CloudWatch:
   Metric: Throttles

2. Request limit increase:
   Service Quotas Console
     └── AWS Lambda → Concurrent Executions
     └── Request quota increase

3. Set reserved concurrency:
   aws lambda put-function-concurrency \
     --function-name my-function \
     --reserved-concurrent-executions 500
```

## RDS Issues

### Database Connection Failed

```
Error: "could not connect to server"

Causes:
├── Instance not available
├── Wrong endpoint (regional difference)
├── Security group doesn't allow connection
├── Authentication failed

Solution:
1. Check instance status:
   aws rds describe-db-instances --db-instance-identifier mydb

2. Check security group:
   └── Inbound rule for port 5432 (PostgreSQL)
   └── Source should be application security group

3. Verify connection string:
   postgresql://user:pass@mydb.xxxxx.us-east-1.rds.amazonaws.com:5432/dbname

4. Test from EC2 in same VPC:
   psql -h endpoint -U admin -d dbname
```

### Database Slow Queries

```
Diagnostic:
1. Enable Performance Insights:
   aws rds modify-db-instance \
     --db-instance-identifier mydb \
     --enable-performance-insights

2. Check slow query log:
   SELECT * FROM mysql.slow_log; (MySQL)
   -- PostgreSQL: Check system catalog

3. Check query plan:
   EXPLAIN ANALYZE SELECT ... ;

Solution:
├── Add index: CREATE INDEX idx_name ON table(column);
├── Optimize query
├── Increase instance size
└── Add read replica
```

### High Database Connections

```
Diagnostic:
1. Check connection count:
   SHOW max_connections; (PostgreSQL)
   SHOW PROCESSLIST; (MySQL)

2. Find blocking connections:
   SELECT * FROM pg_stat_activity;

Solution:
├── Add connection pooling (PgBouncer)
├── Increase max_connections
├── Identify zombie connections
├── Fix application connection leaks
└── Scale with read replicas
```

## S3 Issues

### S3 Access Denied

```
Error: "Access Denied" on GetObject/PutObject

Causes:
├── IAM policy missing
├── Bucket policy restrictive
├── Object ACL restrictive
└── Block Public Access preventing access

Solution:
1. Check IAM policy:
   aws iam get-user-policy --user-name myuser --policy-name policy-name

2. Verify bucket policy:
   aws s3api get-bucket-policy --bucket my-bucket

3. Check if IAM user has S3 access:
   Attach policy: AmazonS3FullAccess

4. Verify ACL not restrictive:
   aws s3api get-object-acl --bucket my-bucket --key my-file
```

### S3 Slow Performance

```
Causes:
├── Sequential key naming (hot partition)
├── Geographic distance
├── Network limit

Solution:
1. Use random prefix:
   Before: logs/2024-01-15/access.log
   After: logs/a1b2c3d4/2024-01-15/access.log

2. Use CloudFront for CDN:
   └── Caches at edge
   └── Faster retrieval

3. Multi-part upload for large files:
   aws s3api upload-part-copy ...
```

## DynamoDB Issues

### DynamoDB Throttling

```
Error: "ProvisionedThroughputExceededException"

Causes:
├── Exceeding provisioned capacity
├── Hot partition (uneven key distribution)
├── Burst capacity exhausted

Solution:
1. Check consumed capacity:
   CloudWatch metric: ConsumedWriteCapacityUnits

2. Switch to on-demand:
   aws dynamodb update-billing-mode \
     --table-name MyTable \
     --billing-mode PAY_PER_REQUEST

3. Fix hot partition:
   └── Add random suffix to key
   └── Better partition key design

4. Increase provisioned capacity:
   aws dynamodb update-table \
     --table-name MyTable \
     --write-capacity-units 1000
```

### DynamoDB Query Timeout

```
Causes:
├── Partition key query on large dataset
├── No index for sort criteria
├── Client timeout too low

Solution:
1. Review query pattern:
   └── Use partition key for filtering
   └── Use sort key for range

2. Add Global Secondary Index:
   aws dynamodb update-table --table-name ...

3. Increase client timeout:
   boto3.client('dynamodb', connect_timeout=30)

4. Use pagination:
   response = table.query(ExclusiveStartKey=token)
```

## CloudWatch/Monitoring Issues

### Missing Metrics

```
Diagnostic:
1. Check if metrics exist:
   aws cloudwatch list-metrics --namespace AWS/EC2

2. Enable detailed monitoring:
   aws ec2 monitor-instances --instance-ids i-xxxxx

3. For custom metrics:
   └── Verify application sending them
   └── Check CloudWatch agent

Solution:
├── Enable detailed monitoring
├── Start CloudWatch agent on instances
├── Add metrics to application code
```

### High CloudWatch Costs

```
Causes:
├── Too many custom metrics
├── VPC Flow Logs at high detail
├── Excessive log ingestion

Solution:
1. Filter unnecessary metrics:
   └── Keep only critical

2. Set log retention:
   aws logs put-retention-policy \
     --log-group-name /aws/lambda/my-function \
     --retention-in-days 7

3. Use log filters to reduce ingestion
```

## API Gateway Issues

### 5xx Errors

```
Error: HTTP 500 or 503

Causes:
├── Lambda timeout
├── Lambda error
├── Throttling
└── Backend service down

Solution:
1. Check Lambda CloudWatch logs:
   aws logs get-log-events --log-group-name /aws/lambda/my-function

2. Check for throttling:
   CloudWatch metric: 5xx

3. Verify backend service:
   └── Check integration target status

4. Increase timeout:
   API Gateway → Integration → Timeout
```

### High Latency

```
Diagnostic:
1. CloudWatch metric: Latency

2. Enable access logs:
   API Gateway → Logs
   └── View request/response times

3. X-Ray tracing:
   └── Identify slow segments

Solution:
├── Increase Lambda memory (→ CPU)
├── Optimize database queries
├── Enable caching
├── Use warm Lambda (provisioned concurrency)
```

## General Debugging Tips

### Step-by-Step Process

```
1. Define the problem clearly
   └─ "Lambda returns 500" vs. "User can't access API"

2. Check status pages
   └─ https://health.aws.amazon.com

3. Check CloudTrail
   └─ See exactly what API called, by whom, when

4. Check CloudWatch logs
   └─ Application logs, error messages

5. Check metrics
   └─ CloudWatch dashboards

6. Check configuration
   └─ aws describe-* commands

7. Test in isolation
   └─ Can Lambda run standalone?
   └─ Can database connect directly?

8. Review recent changes
   └─ What changed before issue started?
```

### Useful CLI Commands

```bash
# Get basic resources info
aws ec2 describe-instances
aws rds describe-db-instances
aws lambda get-function-configuration

# Check logs
aws logs tail /aws/lambda/my-function --follow
aws logs tail /aws/rds/instance/mydb/error --follow

# Check metrics
aws cloudwatch get-metric-statistics \
  --namespace AWS/EC2 \
  --metric-name CPUUtilization \
  --dimensions Name=InstanceId,Value=i-xxxxx \
  --start-time 2024-01-15T00:00:00Z \
  --end-time 2024-01-15T01:00:00Z \
  --period 60 \
  --statistics Average

# Check CloudTrail
aws cloudtrail lookup-events \
  --lookup-attributes AttributeKey=EventName,AttributeValue=AuthorizeSecurityGroupIngress
```

## 🎯 Key Takeaways

✅ Systematic debugging process
✅ Check logs first (CloudWatch)
✅ Verify configuration (aws describe-*)
✅ Check CloudTrail for API calls
✅ Use CloudWatch Insights for log analysis
✅ X-Ray for distributed tracing
✅ Understand security group rules
✅ Monitor key metrics

## 🚀 Resources

- AWS Troubleshooting Guides: https://docs.aws.amazon.com
- AWS Support: https://console.aws.amazon.com/support
- AWS Forums: https://forums.aws.amazon.com
- Stack Overflow: Tag "amazon-web-services"

---

**Debugging skills are what seperate good engineers from great ones!**

---

[← Previous: Best Practices & Optimization](41-best-practices.md) | [Contents](README.md) | [Next: Advanced Best Practices & Optimization →](43-advanced-best-practices.md)
