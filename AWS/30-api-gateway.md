# API Gateway - REST & WebSocket APIs

## What is API Gateway?

**API Gateway = Managed API Service**

Create REST/WebSocket APIs without managing servers:

```
Traditional API                API Gateway
├── Build web server          ├── Configure endpoints
├── Configure routes          ├── Map to backend
├── Handle SSL/TLS           ├── AWS manages SSL/TLS
├── Add authentication       ├── Built-in auth (AWS/custom)
├── Set rate limits          ├── Throttling, caching
├── Monitor traffic          ├── CloudWatch integration
└── Scale infrastructure     └── Auto-scales
```

## Types of APIs

### REST API (HTTP/HTTPS)

```
GET  /api/users
POST /api/users
GET  /api/users/{id}
PUT  /api/users/{id}
DELETE /api/users/{id}
```

### WebSocket API

```
Persistent two-way connection:
├── Client ←→ API Gateway ←→ Lambda/Backend
├── Real-time messaging
├── Chat, notifications, gaming
└── $3.50 per million messages
```

### HTTP API (Newer, Simpler)

```
Simpler than REST API:
├── Lower latency
├── Lower cost
├── 70% cheaper than REST
└── Good for simple use cases
```

## Creating REST API

### Via Console

```
1. API Gateway → Create API
2. Choose: REST API
3. API name: UserAPI
4. Endpoint type: Regional
5. Create

6. Create resources:
   /users (Resource)
   ├── GET method → Lambda function
   ├── POST method → Lambda function
   └── /{id} (Resource)
       ├── GET method → Lambda function
       ├── PUT method → Lambda function
       └── DELETE method → Lambda function

7. Deploy to stage: prod
   - Creates public URL
   - https://xxxxx.execute-api.us-east-1.amazonaws.com/prod/users
```

### Template Structure

```

/
└── /users (Resource)
    ├── GET /users
    │   └── Lambda: ListUsers
    ├── POST /users
    │   └── Lambda: CreateUser
    └── /{id} (Resource with path parameter)
        ├── GET /users/{id}
        │   └── Lambda: GetUser
        ├── PUT /users/{id}
        │   └── Lambda: UpdateUser
        └── DELETE /users/{id}
            └── Lambda: DeleteUser
```

### Integration with Lambda

```yaml
Method: GET
Integration Type: Lambda Function
Lambda Function: GetUser
Request Template:
  application/json:
    {
      "id": $input.params('id')
    }

Response Template:
  application/json:
    {
      "id": $input.path('$.id'),
      "name": $input.path('$.name'),
      "email": $input.path('$.email')
    }
```

## Request/Response Processing

### Request Flow

```
Client Request
    ↓
API Gateway (Validates)
    ├── Check path parameter
    ├── Parse query string
    ├── Validate headers
    ├── Check rate limits
    └── Apply request transformation
    ↓
Map to method request
    ↓
Request template (transform JSON)
    ↓
Send to Lambda
    ↓
Lambda executes
```

### Response Flow

```
Lambda returns {statusCode, body}
    ↓
API Gateway receives response
    ↓
Response template (transform JSON)
    ↓
Add headers
    ↓
Send to client
```

## Stages & Deployments

```
Stage: Environment for testing/production

Development:
  Base path: /dev/
  Lambda: dev-GetUser
  DB: Dev database
  Rate limit: Low

Production:
  Base path: /prod/
  Lambda: prod-GetUser
  DB: Production database
  Rate limit: High
  Throttling: Enabled
  Caching: Enabled
```

## Authentication & Authorization

### AWS IAM Auth

```
Client with AWS credentials
    ↓
Includes AWS Signature V4 signing
    ↓
API Gateway validates signature
    ↓
Checks IAM permissions
    ↓
Allows/denies request
```

### API Keys

```
Simple key-based authentication:

Client adds header:
  x-api-key: sk-1234567890abcdef

API Gateway checks key
  ├── Valid key → Allow
  └── Invalid key → Deny
```

### Cognito Authorization

```
Client authenticates with Cognito
  ├── Get ID token
  └── Get access token

Client adds header:
  Authorization: Bearer {token}

API Gateway validates token
  ├── Valid → Allow (with user info)
  └── Invalid → Deny
```

### Lambda Authorizers (Custom)

```
Client sends request
    ↓
API Gateway calls authorizer Lambda
    ↓
Lambda validates token/headers
    ↓
Returns policy (Allow/Deny + context)
    ↓
If Allow: Request proceeds with context data

Example: Validate JWT custom token
```

## Rate Limiting & Throttling

### Throttling

```
Limit concurrent requests:

Burst limit:        5000 requests/second (5 min)
Steady-state rate:  10000 requests/second

If exceeded:
└── Return 429 Too Many Requests
```

### Usage Plans & API Keys

```
Usage Plan: Tier-based access

Standard tier:
  ├── 10,000 requests/day
  ├── 100 requests/second
  └── $5/month

Pro tier:
  ├── 100,000 requests/day
  ├── 1000 requests/second
  └── $50/month

Associate API key with tier
  └── Throttling applies per key
```

## Caching

```
Cache API responses:

GET /users/{id}
  └── Lambda returns user data (slow)
  └── Cache for 5 minutes
  └── Next request from cache (fast!)

CloudFront (CDN):
  ├── Cache at edge locations
  ├── Global distribution
  ├── Even faster responses
  └── $0.085/GB
```

## CORS (Cross-Origin Resource Sharing)

Enable cross-domain requests:

```
Client in browser (domain-a.com)
  └── Request to API (domain-b.com)

Without CORS:
  └── Browser blocks request!

With CORS enabled:
  ├── API Gateway adds headers:
  │   Access-Control-Allow-Origin: *
  │   Access-Control-Allow-Methods: GET, POST
  ├── Browser sees headers
  └── Request allowed!
```

Configuration:
```
1. API Gateway → [API] → Actions → Enable CORS
2. Choose methods: GET, POST, PUT, DELETE
3. Deploy
```

## Monitoring & Logging

### CloudWatch Logs

```
Enable logging:
1. API Gateway → [API] → Settings
2. CloudWatch log role: Create
3. Log level: INFO or ERROR

Logs include:
├── Request timestamps
├── Client IPs
├── Response codes
├── Latency
└── Errors
```

### Metrics

```
CloudWatch metrics:
├── Count: # requests
├── 4xx Errors: Bad requests
├── 5xx Errors: Server errors
└── Latency: Response time
```

## API Gateway Pricing

```
REST API:
├── Requests: $3.50 per million requests
├── Cache: $0.020/hour per GB (optional)
└── Data out: $0.09/GB after free tier

WebSocket:
├── Messages: $1/million messages
├── Minutes connected: $0.25 per million

HTTP API (Recommended for new):
├── Requests: $0.90 per million requests
├── 75% cheaper than REST

Example: 1M requests/day
REST:        1M × $3.50 = $3.50/day = $105/month
HTTP API:    1M × $0.90 = $0.90/day = $27/month
```

## Example: Complete REST API

### Lambda Function

```python
import json

def lambda_handler(event, context):
    method = event['httpMethod']
    path = event['path']
    body = json.loads(event.get('body', '{}'))
    
    if method == 'GET':
        return {
            'statusCode': 200,
            'body': json.dumps([
                {'id': 1, 'name': 'Alice'},
                {'id': 2, 'name': 'Bob'}
            ])
        }
    
    elif method == 'POST':
        user = {'id': 3, 'name': body['name']}
        return {
            'statusCode': 201,
            'body': json.dumps(user)
        }
    
    else:
        return {
            'statusCode': 405,
            'body': json.dumps({'error': 'Method not allowed'})
        }
```

### Terraform Configuration

```hcl
resource "aws_apigatewayv2_api" "main" {
  name          = "UserAPI"
  protocol_type = "HTTP"
}

resource "aws_apigatewayv2_integration" "lambda" {
  api_id           = aws_apigatewayv2_api.main.id
  integration_type = "AWS_PROXY"
  integration_method = "POST"
  payload_format_version = "2.0"
  target = aws_lambda_function.handler.arn
}

resource "aws_apigatewayv2_route" "users" {
  api_id    = aws_apigatewayv2_api.main.id
  route_key = "GET /users"
  target    = "integrations/${aws_apigatewayv2_integration.lambda.id}"
}

resource "aws_apigatewayv2_stage" "prod" {
  api_id      = aws_apigatewayv2_api.main.id
  name        = "prod"
  auto_deploy = true
}

output "api_endpoint" {
  value = aws_apigatewayv2_stage.prod.invoke_url
}
```

## ⚠️ Common Mistakes

❌ **Not enabling logging**
→ Can't debug issues

❌ **Forgetting CORS for web clients**
→ API works in CLI but not browser

❌ **No rate limiting**
→ One user can exhaust quota

❌ **Using REST API for new projects**
→ Use HTTP API (cheaper, faster)

❌ **Not caching GET responses**
→ Avoidable Lambda invocations

## 🎯 Key Takeaways

✅ API Gateway = managed API service
✅ Integrates with Lambda for serverless APIs
✅ REST API, HTTP API, WebSocket
✅ Authentication: IAM, API keys, Cognito, Lambda
✅ Throttling and rate limiting built-in
✅ CloudWatch monitoring included
✅ Price varies by type and volume

## 🚀 Hands-On Exercise

1. ☑️ Create HTTP API
2. ☑️ Create /users GET endpoint
3. ☑️ Integrate with Lambda
4. ☑️ Deploy to prod stage
5. ☑️ Test via curl/Postman
6. ☑️ Enable CloudWatch logs
7. ☑️ Create /users POST endpoint
8. ☑️ Add rate limiting

---

**API Gateway is your gateway to serverless backends!**

---

[← Previous: SNS & SQS - Messaging Services](29-sns-sqs.md) | [Contents](README.md) | [Next: EventBridge - Event Processing →](31-eventbridge.md)
