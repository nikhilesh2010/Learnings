# DynamoDB - NoSQL Database

## What is DynamoDB?

**DynamoDB = Fully Managed NoSQL Database**

```
SQL Database (RDS)           NoSQL (DynamoDB)
├── Fixed schema             ├── Flexible schema
├── Relationships (joins)    ├── Nested data
├── Complex queries          ├── Simple key-value lookups
├── Scaling complex          ├── Scales automatically
└── Good for:                └── Good for:
   Relational data              Fast, scalable applications
   Structured queries           Real-time apps
                                IoT, gaming, mobile
```

## DynamoDB vs SQL

### When to Use DynamoDB

```bash
✅ High-scale, real-time apps (millions of requests)
✅ Mobile/web backends
✅ Time-series data (IoT, metrics)
✅ Gaming leaderboards
✅ Session storage
✅ Chat/messaging
✅ Recommendation engines (+ cache)

❌ Complex joins and relationships
❌ Complex transactions
❌ Ad-hoc reporting
❌ → Use RDS instead
```

## Core Concepts

### 1. Tables

Similar to SQL tables:

```
Table: Users
├── Attributes (columns):
│   ├── userId (PK)
│   ├── name
│   ├── email
│   ├── phone
│   └── address (nested JSON)
└── Items (rows):
    ├── user-001: {name: "Alice", email: "alice@ex.com", ...}
    ├── user-002: {name: "Bob", email: "bob@ex.com", ...}
    └── user-003: {name: "Charlie", email: "charlie@ex.com", ...}
```

### 2. Primary Key

Unique identifier:

```
Partition Key (PK):
├── Distributes data across partitions
├── Example: userId
├── Must be unique
└── Used for queries

Composite Key (PK + SK):
├── Partition Key (PK): userId
├── Sort Key (SK): timestamp
├── Together: unique
└── Example: userId#2024-01-15T10:00:00

Example table:
Table: Orders
├── PK: customerId (partition)
├── SK: orderId (sort)
└── Unique combination: (customer-001, order-1) unique
```

### 3. Attributes

Data fields (can be nested):

```
Item: {
  id: "user-001",
  name: "Alice",
  age: 30,
  email: "alice@ex.com",
  address: {                    // Nested document
    street: "123 Main St",
    city: "Boston",
    zip: "02101"
  },
  tags: ["vip", "premium"],     // List
  metadata: {
    createdAt: "2024-01-01",
    lastLogin: "2024-01-15"
  }
}
```

### 4. Data Types

```
String (S):           "hello"
Number (N):           123, 45.67
Binary (B):           Image/PDF bytes
Boolean:              true, false
Null:                 null
List:                 [1, 2, "three"]
Map:                  {nested: {objects}}
String Set (SS):      {"a", "b", "c"}
Number Set (NS):      {1, 2, 3}
Binary Set (BS):      {bytes1, bytes2}
```

## Creating Tables

### Via Console

```
1. DynamoDB → Create Table
2. Table name: Users
3. Partition key: userId (String)
4. Sort key: (optional) timestamp (String)
5. Billing mode:
   ☑ On-demand (pay-per-request, flexible)
   ☐ Provisioned (reserve capacity, cheaper at scale)
6. Encryption: Yes (default)
7. Create
```

### Via CLI

```bash
aws dynamodb create-table \
  --table-name Users \
  --attribute-definitions \
    AttributeName=userId,AttributeType=S \
    AttributeName=timestamp,AttributeType=S \
  --key-schema \
    AttributeName=userId,KeyType=HASH \
    AttributeName=timestamp,KeyType=RANGE \
  --billing-mode PAY_PER_REQUEST
```

### Via SDK (Python)

```python
import boto3

dynamodb = boto3.resource('dynamodb', region_name='us-east-1')

table = dynamodb.create_table(
    TableName='Users',
    KeySchema=[
        {'AttributeName': 'userId', 'KeyType': 'HASH'},
        {'AttributeName': 'timestamp', 'KeyType': 'RANGE'}
    ],
    AttributeDefinitions=[
        {'AttributeName': 'userId', 'AttributeType': 'S'},
        {'AttributeName': 'timestamp', 'AttributeType': 'S'}
    ],
    BillingMode='PAY_PER_REQUEST'
)
```

## Reading & Writing Data

### Put Item (Create/Overwrite)

```python
table.put_item(
    Item={
        'userId': 'user-001',
        'timestamp': '2024-01-15T10:00:00',
        'name': 'Alice',
        'email': 'alice@ex.com',
        'age': 30
    }
)
```

### Get Item (Read)

```python
response = table.get_item(
    Key={
        'userId': 'user-001',
        'timestamp': '2024-01-15T10:00:00'
    }
)

item = response['Item']
print(item['name'])  # "Alice"
```

### Update Item (Partial Update)

```python
table.update_item(
    Key={'userId': 'user-001', 'timestamp': '2024-01-15T10:00:00'},
    UpdateExpression='SET email = :e, age = :a',
    ExpressionAttributeValues={
        ':e': 'newemail@ex.com',
        ':a': 31
    }
)
```

### Delete Item (Remove)

```python
table.delete_item(
    Key={
        'userId': 'user-001',
        'timestamp': '2024-01-15T10:00:00'
    }
)
```

### Query (Get Multiple Items)

```python
# Get all orders by user
response = table.query(
    KeyConditionExpression='userId = :uid',
    ExpressionAttributeValues={
        ':uid': 'user-001'
    }
)

items = response['Items']
# Returns all items with userId='user-001'
```

### Scan (Search All Items)

```python
# Find all users older than 25
response = table.scan(
    FilterExpression='age > :age',
    ExpressionAttributeValues={
        ':age': 25
    }
)

items = response['Items']
```

## Billing Modes

### On-Demand (Flexible)

```bash
Pay-per-request:
├── Read: $1.25 per 1M read units
├── Write: $6.25 per 1M write units

Good for:
├── Unpredictable traffic
├── Spiky workloads
├── New/unknown demand

Example: Small app with sporadic use
└── $5/month
```

### Provisioned (Reserve Capacity)

```bash
Reserve capacity:
├── Read capacity: units/second
├── Write capacity: units/second
├── Cost: ~$0.47 per RCU/month, $2.37 per WCU/month

Example: 10 RCU, 5 WCU
└── 10 × $0.47 + 5 × $2.37 = $16.75/month

Auto-scaling:
├── Automatically adjust based on demand
├── Set min/max
├── Smooth out spiky traffic
```

## Secondary Indexes

Query by different attributes:

### Global Secondary Index (GSI)

```
Table: Orders
├── PK: customerId
├── SK: orderId

GSI: OrdersByDate
├── PK: orderDate (new!)
├── SK: orderId
└── Allows querying by date instead of customerId

Query: "Find all orders from 2024-01-15"
```

```python
# Create table with GSI
table = dynamodb.create_table(
    TableName='Orders',
    KeySchema=[
        {'AttributeName': 'customerId', 'KeyType': 'HASH'},
        {'AttributeName': 'orderId', 'KeyType': 'RANGE'}
    ],
    GlobalSecondaryIndexes=[
        {
            'IndexName': 'OrdersByDate',
            'KeySchema': [
                {'AttributeName': 'orderDate', 'KeyType': 'HASH'},
                {'AttributeName': 'orderId', 'KeyType': 'RANGE'}
            ],
            'Projection': {'ProjectionType': 'ALL'},
            'BillingMode': 'PAY_PER_REQUEST'
        }
    ],
    ...
)

# Query by date
response = table.query(
    IndexName='OrdersByDate',
    KeyConditionExpression='orderDate = :date',
    ExpressionAttributeValues={':date': '2024-01-15'}
)
```

### Local Secondary Index (LSI)

```
Alternative sort key for same partition key:
├── Must have same PK as table
├── Different SK
├── 10GB size limit
└── Part of table provisioned capacity

Use case: Small, often-accessed alternate views
```

## DynamoDB Best Practices

### ✅ DO

```bash
✅ Use partition key that distributes evenly
   Bad: status (ACTIVE vs INACTIVE, uneven)
   Good: userId (random, spreads evenly)

✅ Use GSI for alternate access patterns
   Table: PK=userId, query by email? → GSI

✅ Use TTL for automatic cleanup
   Old sessions, temporary data

✅ Enable point-in-time recovery
   Protection against accidental deletes

✅ Monitor consumed capacity
   Understand your usage patterns

✅ Use DynamoDB Streams
   React to data changes (Lambda trigger)
```

### ❌ DON'T

```bash
❌ Use sequential/sequential keys
   Creates hot partitions
   Scale to one partition

❌ Store large objects (>400KB)
   Use S3, store reference in DynamoDB

❌ Update frequently (>1000x/sec per item)
   Design for eventual consistency

❌ Complex joins
   ← Use RDS instead

❌ Scan full table repeatedly
   Use Query + indexes

❌ Request more capacity than needed
   Monitor and adjust
```

## TTL (Time to Live)

Auto-expire old items:

```
Table: Sessions
├── sessionId (PK)
├── expiresAt (TTL attribute)
└── data

Set:
{
  sessionId: "sess-001",
  expiresAt: 1704067200,  // Unix timestamp
  data: {...}
}

Result: Automatically deleted after expiration
```

```python
# Enable TTL
dynamodb_client = boto3.client('dynamodb')
dynamodb_client.update_time_to_live(
    TableName='Sessions',
    TimeToLiveSpecification={
        'AttributeName': 'expiresAt',
        'Enabled': True
    }
)
```

## DynamoDB Streams

React to data changes:

```
Item updated in DynamoDB
  ↓ (change captured)
Stream record created
  ↓ (Lambda reads stream)
Lambda function executes
  ├── Send notification
  ├── Update cache
  ├── Write to data lake
  └── Trigger workflow
```

```python
# Enable streams on table
table.stream_specification = {
    'StreamEnabled': True,
    'StreamViewType': 'NEW_AND_OLD_IMAGES'
}

# Lambda triggered automatically
def lambda_handler(event, context):
    for record in event['Records']:
        if record['eventName'] == 'MODIFY':
            print(f"Item updated: {record['dynamodb']['Keys']}")
```

## DynamoDB Pricing Example

### High-Velocity Mobile App

```
On-demand billing:
├── 10 million writes/day: 10M × $6.25/1M = $62.50
├── 50 million reads/day: 50M × $1.25/1M = $62.50
├── Storage: 100GB × $0.25 = $25
├── Streams: 10M records × $0.02/1M = $0.20
└── Backup storage: $0.10 GB/month = $10
─────────────────────────────────────
Total: ~$160/month (varies)

Provisioned with auto-scaling:
├── 5000 RCU, 2000 WCU: ~$3000/month
├── Better for consistent, predictable load
└── Saves money at scale
```

## ⚠️ Common Mistakes

❌ **Sequential partition keys**
→ Hot partitions, throttling

❌ **Storing everything in one attribute**
→ Use nested documents properly

❌ **Scanning full table for small result**
→ Use Query + indexes

❌ **NoSQL like SQL**
→ Denormalize, duplicate data (OK!)

❌ **No backup strategy**
→ Enable point-in-time recovery

## 🎯 Key Takeaways

✅ DynamoDB = managed NoSQL database
✅ Pay-per-request or reserved capacity
✅ Primary key (partition + sort)
✅ Query fast, Scan slow
✅ GSI for alternate access patterns
✅ TTL for automatic cleanup
✅ Streams for change data capture
✅ Denormalize data (OK in NoSQL!)

## 🚀 Hands-On Exercise

1. ☑️ Create DynamoDB table (Users)
2. ☑️ Put items with nested attributes
3. ☑️ Query by partition key
4. ☑️ Create GSI (email lookup)
5. ☑️ Update item
6. ☑️ Scan with filter
7. ☑️ Enable streams
8. ☑️ Monitor usage

---

**DynamoDB powers billions of requests daily. Master it!**

---

[← Previous: RDS - Relational Databases](14-rds.md) | [Contents](README.md) | [Next: Database Optimization & Scaling →](16-database-optimization.md)
