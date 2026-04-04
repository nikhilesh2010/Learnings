# Elastic Beanstalk - Application Deployment

## What is Elastic Beanstalk?

**Elastic Beanstalk = Platform as a Service (PaaS)**

Deploy applications without managing servers.

**What it is:** Upload your code, specify the environment (Python, Node, Java, etc.), and AWS automatically:
- Creates EC2 instances
- Installs your runtime
- Deploys your code
- Manages load balancers
- Auto-scales when needed

**Why we use it:** Between manual EC2 and serverless Lambda, Beanstalk provides the sweet spot - managed infrastructure without much configuration.

**How it works:**
```
Traditional Way:                Elastic Beanstalk:
├── Create EC2              ├── Upload code (.zip)
├── Install runtime         ├── Choose platform
├── Deploy code             ├── Click "Deploy"
├── Configure ALB           └── Auto-scaling starts
├── Setup auto-scaling      
├── Monitor                 AWS handles:
└── Scale manually          ├── EC2 creation
                            ├── Load balancing
                            ├── Auto-scaling
                            ├── Monitoring
                            ├── Logging
                            ├── Updates
                            └── Health checks
```

**Simple example:**
```
Deploy a Python Flask API:
1. Write Flask app locally
2. Create .ebignore file (what to skip)
3. Run: eb create my-api --platform python-3.9
4. Wait 3-5 minutes
5. API is live at https://my-api.elasticbeanstalk.com
6. Traffic spikes? Auto-scales automatically!
7. Traffic drops? Scales down to save costs
```

## Supported Platforms

```
Runtimes:
├── Node.js
├── Python
├── Java
├── Go
├── Ruby
├── PHP
├── .NET
└── Docker (custom)

Web servers:
├── Apache (PHP)
├── Nginx
├── Apache Tomcat (Java)
└── IIS (.NET)
```

## Core Concepts

### Environments

```
Application: MyWebApp
├── Environment: Production
│   ├── 5 instances (large)
│   └── Custom domain
├── Environment: Staging
│   ├── 2 instances (medium)
│   └── Test new versions
└── Environment: Development
    ├── 1 instance (small)
    └── Develop features

Each environment:
├── Separate infrastructure
├── Separate database
├── Independent scaling
└── Isolated for safety
```

### Deployment Options

#### All-at-Once

```
Deploy to all instances simultaneously:

Benefits:
├── Fastest deployment (seconds)

Drawbacks:
├── Brief downtime
└── No rollback if failed

Use for: Development only!
```

#### Rolling

```
Deploy to subset at a time:

Batch size: 2 instances
1. Stop 2 instances
2. Deploy new code
3. Start 2 instances
4. Repeat until all updated

Benefits:
├── No downtime
├── Partial rollback possible

Drawbacks:
├── Longer deployment time

Use for: Production (recommended)
```

#### Rolling with Additional Batch

```
Like rolling but keeps extra batch available:

Keep original fleet running
+ Launch new temporary batch
Deploy to new batch
→ All good? Route traffic to new
→ Bad? Route back to old

Benefits:
├── No downtime
├── Easy rollback

Drawbacks:
├── Costs more (temporary resources)
└── Longer deployment

Use for: Critical production systems
```

#### Immutable

```
Launch identical new environment
Deploy to brand new instances
Health check new instances
Route traffic to new environment
Terminate old environment

Benefits:
├── Safest deployment
├── Easy instant rollback
├── No downtime

Drawbacks:
├── Most expensive (double resources temporarily)
└── Slower deployment

Use for: High-availability critical systems
```

#### Blue/Green

```
Two identical production environments:

Blue (Current):
├── Production traffic
├── Fully tested
└── Known stable

Green (New):
├── New version deployed
├── Tested separately
└── No traffic

Flip traffic toggle:
└── Route all traffic to Green

Rollback:
└── Route traffic back to Blue (instant!)
```

## Creating an Application

### Via Console

```
1. Elastic Beanstalk → Create Application
2. Application name: MyApp
3. Platform: Python 3.11 (example)
4. Application code: Upload ZIP
5. Create

Creates:
├── Application version
├── Environment (default)
├── EC2 instance(s)
├── Security groups
├── Auto scaling group
└── Load balancer

Takes 5-10 minutes
```

### Application Code Structure

```
myapp/
├── app.py (or requirements.txt, index.php, etc.)
├── .ebextensions/
│   ├── python.config
│   └── alb.config
└── .elasticbeanstalk/
    ├── config.yml
    └── .gitignore

ZIP and upload to Beanstalk
```

### Configuration File (.ebextensions)

```yaml
# .ebextensions/python.config
option_settings:
  aws:elasticbeanstalk:container:python:
    WSGIPath: app:application
  
  aws:elasticbeanstalk:application:environment:
    DJANGO_SETTINGS_MODULE: config.settings

commands:
  01_migrate:
    command: "source /var/app/venv/*/bin/activate && python manage.py migrate"
    leader_only: true
```

## Environment Variables

Store configuration securely:

```
Elastic Beanstalk Console → [Environment] → Configuration

Environment properties:
├── DB_HOST: mydb.xxxxx.rds.amazonaws.com
├── DB_PORT: 5432
├── DEBUG: false
└── SECRET_KEY: ****** (hidden)

In application:
import os
db_host = os.environ['DB_HOST']
debug = os.environ.get('DEBUG', 'false').lower() == 'true'
```

## Scaling Configuration

### Auto Scaling

```
Trigger based on metrics:

CPU > 70% for 5 min     → Scale up (add 1 instance)
CPU < 30% for 10 min    → Scale down (remove 1 instance)

Thresholds:
├── Min instances: 1
├── Max instances: 6
└── Desired: 2
```

### Load Balancer

```
Application Load Balancer (ALB):
├── Distributes traffic
├── Health checks instances
├── Route to healthy only
├── Sticky sessions (optional)
└── HTTPS termination

Sticky sessions:
├── Keep user on same instance
├── Good for: Shopping carts, sessions
└── Bad for: Stateless apps (disable)
```

## Monitoring & Logging

### Health Dashboard

```
Shows:
├── Instance status
├── CPU utilization
├── Network throughput
├── Deployment history
├── Recent events
└── Environment health (Green/Yellow/Red)
```

### CloudWatch Logs

```
Auto-aggregated logs:
├── Application logs
├── System logs
├── Docker logs (if using Docker)

Access:
Elastic Beanstalk → [Environment] → Logs
  └── View recent logs
  └── Request full log file
```

## Database Integration

### Option 1: Managed by Beanstalk

```
RDS created alongside environment:

Drawbacks:
├── Tied to environment lifecycle
├── Delete environment → Delete database!
├── Not recommended for production

Good for: Development environments
```

### Option 2: External RDS

```
Create RDS separately:
├── Database persists independently
├── Can be shared across environments
├── Better security (separate instances)
├── Recommended for production

Setup:
1. Create RDS instance (prod-db)
2. Create security group for access
3. Environment security group added to RDS allowed list
4. Pass connection string via environment variables
```

## Deployment Hooks

Run scripts during deployment:

```
.ebextensions/hooks.config:

container_commands:
  01_migrate:
    command: "python manage.py migrate"
    leader_only: true
  02_collectstatic:
    command: "python manage.py collectstatic --noinput"

Lifecycle:
├── Run before app starts
├── leader_only: Runs on one instance
└── Good for database migrations, asset compilation
```

## EB CLI (Command Line)

```bash
# Initialize
eb init -p python-3.11 myapp

# Create environment
eb create prod-env

# Deploy
eb deploy

# View logs
eb logs

# SSH into instance
eb ssh

# Scale
eb scale 3

# Open app
eb open (opens in browser)
```

## Comparing Deployment Strategies

| Strategy | Downtime | Deployment Time | Cost | Rollback |
|----------|----------|---|---|---|
| All-at-Once | Yes | Seconds | Low | Manual |
| Rolling | No | Minutes | Low | Partial |
| Rolling + Extra | No | Minutes | Medium | Easy |
| Immutable | No | Minutes | High | Instant |
| Blue/Green | No | Minutes | High | Instant |

## When to Use Beanstalk

### ✅ Good For

```
├── Traditional web apps
├── Python/Node/Java/PHP apps
├── Don't need low-level control
├── Want managed infrastructure
├── Need auto-scaling
└── Small-medium teams
```

### ❌ Not Good For

```
├── Containers (use ECS instead)
├── Serverless (use Lambda + API Gateway)
├── Complex architectures
├── Microservices (use ECS + Fargate)
└── Need specific OS configuration
```

## ⚠️ Common Mistakes

❌ **Database managed by Beanstalk**
→ Create separate RDS instance

❌ **All-at-once deployments in production**
→ Use rolling or immutable

❌ **No backup before environment changes**
→ Create snapshot of database

❌ **Ignoring environment variables**
→ Store secrets, not in code

## 🎯 Key Takeaways

✅ Beanstalk = PaaS for web applications
✅ Managed EC2, ALB, auto-scaling
✅ Multiple environments (dev/staging/prod)
✅ Deployment strategies prevent downtime
✅ External RDS for production
✅ Environment variables for configuration
✅ Blue/Green for safest deployments

---

**Elastic Beanstalk accelerates web app deployment!**

---

[← Previous: Lambda - Advanced Patterns](08-lambda-advanced.md) | [Contents](README.md) | [Next: S3 - Object Storage Fundamentals →](10-s3-basics.md)
