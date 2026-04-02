# Analytics & Big Data Services

## Data Analytics Pipeline

```
Data sources:
├── Application logs (S3)
├── Database (RDS)
├── Third-party APIs
└── IoT devices

Ingestion:
├── Kinesis Data Streams (real-time)
├── S3 (batch)
└── Data Transfer Service

Processing:
├── Lambda (transformations)
├── EMR (distributed computing)
├── Glue (ETL)
└── Step Functions (orchestration)

Storage:
├── S3 (data lake)
├── Redshift (data warehouse)
├── DynamoDB (operational)
└── Timestream (time-series)

Querying:
├── Athena (SQL on S3)
├── Redshift (OLAP)
├── QuickSight (BI dashboards)
```

## Athena - Query S3 Data

SQL queries on S3 files:

```
Setup:
1. Upload data to S3 (CSV, Parquet, JSON)
2. Define table schema
3. Run SQL queries

Query:
SELECT 
  date, 
  COUNT(*) as request_count,
  AVG(response_time) as avg_response
FROM logs
WHERE date >= '2024-01-16'
GROUP BY date

Cost:
├── $5 per TB scanned
├── Partitioning = cost savings
└── Typical: $5-50/month

Use for:
├── Ad-hoc analysis
├── One-time investigations
├── Cost-effective approach
```

## Glue - ETL Service

Extract, Transform, Load:

```
ETL Job:
1. Extract: Read from source
   └── S3, database, APIs
2. Transform: Clean/normalize
   └── Deduplicate, aggregate, enrich
3. Load: Write to destination
   └── S3, Redshift, database

Glue catalog:
├── Metadata repository
├── Tables auto-discovered
├── Integrates with Athena, Redshift
└── Schema evolution tracking

Cost:
├── $0.35 per DPU per hour
└── Typical: $50-200/month
```

## EMR - Elastic MapReduce

Distributed big data processing:

```
Use Spark for:
├── Complex transformations
├── Machine learning pre-processing
├── Large-scale aggregations

Cluster:
├── Master node (coordinates)
├── Worker nodes (compute, scales with data)
├── Spot instances (70% discount)

Processing 1 TB data:
├── Single machine: 10 hours
├── EMR cluster (100 nodes): 6 minutes

Cost:
├── EC2 instances: $0.30/hour per node
├── EMR service: $0.15/hour per instance
└── Typical job: $20-50

Use for:
├── Batch processing
├── Machine learning
├── Data warehousing
```

## Redshift - Data Warehouse

Petabyte-scale analytics:

```
Architecture:
├── Leader node (coordinates queries)
├── Compute nodes (store + process)
└── Auto-scaling

Query performance:
├── Optimized for OLAP (analytical)
├── Columnar storage (compression)
├── Queries run 10-100x faster vs. traditional DB

Cost:
├── dc2.large: $0.25/hour (~$1,800/month)
├── 160 GB storage per node
└── Add more nodes for more data

Use for:
├── Business intelligence
├── Historical analysis
├── Reporting
└── Data science research
```

### Redshift Spectrum

Query S3 directly from Redshift:

```
Data warehouse (Redshift):
└── Expensive storage, fast queries

Data lake (S3):
└── Cheap storage, slower queries

Spectrum bridge:
├── Redshift queries S3 data
├── Results joined with warehouse data
├── Cost-effective analysis
└── No data movement needed
```

## QuickSight - Business Intelligence

Create dashboards and visualizations:

```
Data source:
├── Redshift
├── RDS
├── S3
├── Athena
└── 25+ integrations

Dashboard creation:
├── Visual builder (no SQL needed)
├── Drag-and-drop fields
├── Auto-suggest charts
└── Interactive filters

Sharing:
├── Internal teams
├── External users (with auth)
└── Embedded in apps

Cost:
├── Standard: $12/user/month
├── Pro: $24/user/month (more features)
└── SPICE capacity: $0.25 per GB-month
```

## Kinesis - Real-Time Streaming

Ingest massive streams of data:

```
Kinesis Data Streams:
├── Real-time data ingestion
├── 1 shard = 1,000 records/sec
├── Auto-scaling shards
└── Retain 24 hours (extendable to 365)

Use case:
IoT sensors sending billions of events

Architecture:
Sensors
  ├── Send records to Kinesis
  └── Every second

Consumers:
├── Lambda (processes in real-time)
├── Kinesis Analytics (aggregates)
├── Kinesis Firehose (batches to S3)
└── Custom consumers

Cost:
├── Shard: $0.36/hour (~$260/month)
├── Put record: $0.014 per 1M
└── Get record: $0.014 per 1M
```

## Data Pipeline Example

```
E-commerce platform analytics:

1. Data collection:
   User clicks → CloudFront logs → S3
   Database → RDS Snapshot → S3

2. Data lake:
   Raw data stored in S3 partitions
   ├── s3://company-data/year=2024/month=01/day=16/
   └── User can access frozen data

3. ETL:
   Glue job (daily):
   ├── Read raw logs
   ├── Clean duplicates
   ├── Aggregate by product
   └── Write to refined S3

4. Data warehouse:
   Redshift (replicate for analysis)
   ├── Load refined data daily
   ├── Optimize for OLAP
   └── 2 year history

5. Analytics:
   QuickSight dashboards:
   ├── Daily revenue by product
   ├── Customer cohort analysis
   ├── Inventory forecasting
   └── Executive reports

Cost:
├── S3: $20/month
├── Glue: $30/month (daily jobs)
├── Redshift: $2,000/month (1 node)
├── QuickSight: $50/month (2 users)
└── Total: ~$2,100/month for insights
```

## ⚠️ Common Mistakes

❌ **Querying unpartitioned huge S3 tables**
→ Costs explode, add partition columns

❌ **Not compressing data**
→ Use Parquet or ORC (90% smaller)

❌ **Mixing OLTP and OLAP on same database**
→ Use separate systems (RDS for OLTP, Redshift for OLAP)

❌ **No data pipeline scheduling**
→ Use Step Functions to orchestrate

❌ **Keeping all historical data in hot storage**
→ Move to Glacier after 90 days

## 🎯 Key Takeaways

✅ Athena for ad-hoc queries on S3
✅ Glue for ETL orchestration
✅ Redshift for data warehouse
✅ EMR for distributed computing
✅ QuickSight for BI dashboards
✅ Kinesis for real-time data
✅ Partition data for cost savings
✅ Compress data (Parquet/ORC)

---

**Data is the new oil. Analytics extracts the value!**

---

[← Previous: CloudWatch Deep Dive](44-cloudwatch-advanced.md) | [Contents](README.md)
