# Machine Learning Services

## ML Services Overview

Amazon's machine learning portfolio:

```
No ML expertise needed:
├── Pre-trained models
├── API-based
└── Pay-per-use

SageMaker:
├── Full ML platform
├── Build, train, deploy
├── For data scientists

Quick integration:
├── Computer Vision (Rekognition)
├── NLP (Comprehend)
├── Forecast (Lookup Tables)
```

## Rekognition - Computer Vision

Pre-trained visual analysis:

```
Use cases:
├── Identify objects in images
├── Face recognition
├── Text in images (OCR)
├── Content moderation
└── Celebrity detection

Example 1: Object Detection
Input: Image of street scene
Output:
  - Car: 98% confidence
  - Person: 87% confidence
  - Bus: 76% confidence

Pricing:
└── $1.50 per 1,000 images
```

### Object Detection Example

```python
import boto3

client = boto3.client('rekognition', region_name='us-east-1')

response = client.detect_objects(
    Image={'S3Object': {'Bucket': 'my-bucket', 'Name': 'image.jpg'}}
)

for label in response['Labels']:
    print(f"{label['Name']}: {label['Confidence']}%")

Output:
Car: 98.5%
Person: 87.2%
Stop Sign: 76.1%
```

### Face Recognition Example

```python
response = client.detect_faces(
    Image={'S3Object': {'Bucket': 'my-bucket', 'Name': 'photo.jpg'}}
)

for detail in response['FaceDetails']:
    print(f"Confidence: {detail['Confidence']}%")
    print(f"Smile: {detail['Smile']['Value']}")
    print(f"Age range: {detail['AgeRange']['Low']}-{detail['AgeRange']['High']}")

Output:
Confidence: 99.8%
Smile: True
Age range: 25-32
```

## Textract - Document Processing

Extract text from documents:

```
Use cases:
├── Scanned documents
├── PDFs
├── Forms
└── Invoices

Input:
└── Scanned invoice image

Output:
├── Line items extracted
├── Tables recognized
├── Handwriting detected
└── Structured data

Cost: $0.015 per page
```

## Comprehend - NLP

Natural language processing:

```
Capabilities:
├── Sentiment analysis
   "This product is amazing!" → Positive (0.98)
├── Entity detection
   "John Smith works at AWS" → Person: John Smith, Org: AWS
├── Key phrase extraction
   "The blue car is fast" → blue car, fast
└── Language detection
   "Bonjour" → French (0.99)

Cost:
├── Sentiment: $0.0001 per unit
├── Entities: $0.00002 per unit
```

### Sentiment Analysis Example

```python
client = boto3.client('comprehend', region_name='us-east-1')

response = client.detect_sentiment(
    Text="I love this product! Best purchase ever!",
    LanguageCode='en'
)

print(f"Sentiment: {response['Sentiment']}")  # POSITIVE
print(f"Scores: {response['SentimentScore']}")
# {'Positive': 0.99, 'Negative': 0.01, 'Neutral': 0.0, 'Mixed': 0.0}
```

## Forecast - Time Series

Predict future values:

```
Use cases:
├── Demand forecasting
├── Resource planning
├── Financial forecasting
└── Capacity planning

Input:
└── Historical data (time series)

Example - E-Commerce:
├── 2 years daily sales history
├── Forecast: Next 30 days
├── Output: Expected demand per day

Use prediction:
├── Adjust inventory
├── Staffing levels
├── Budget planning
```

## Lookout Services

Detect anomalies:

```
Lookout for Metrics:
├── Monitor metrics automatically
├── Detect anomalies
├── Example: Website latency

Workflow:
1. Connect data source (CloudWatch, S3)
2. Lookout learns normal pattern
3. Detects deviations
4. Alerts on anomalies
5. Reduce false positives

Use for:
├── Operations monitoring
├── Quality control
├── Predictive maintenance
```

## SageMaker - Full ML Platform

For data scientists:

```
Capabilities:
├── Jupyter notebooks (development)
├── Algorithm selection (200+ algorithms)
├── Model training (distributed)
├── Hyperparameter tuning
├── Model deployment (endpoints)
└── Monitoring (model quality)

Workflow:
1. Prepare data (notebooks)
2. Train model (automatic scaling)
3. Evaluate performance
4. Deploy to endpoint
5. Application calls endpoint
6. Auto-scaling handles load

Cost:
├── Notebook instance: $0.30/hour (ml.t3.medium)
├── Training job: ML compute hourly rates
├── Endpoint: ml.t3.medium instance cost
```

### SageMaker Example

```python
import sagemaker
from sagemaker.xgboost.estimator import XGBoost

session = sagemaker.Session()
role = sagemaker.get_execution_role()

xgb = XGBoost(
    entry_point='train.py',
    role=role,
    instance_type='ml.m5.xlarge',
    instance_count=1,
    framework_version='1.3-1',
    hyperparameters={
        'num_round': 100,
        'early_stopping_rounds': 10
    }
)

# Train
xgb.fit({'training': 's3://bucket/data/'})

# Deploy
predictor = xgb.deploy(initial_instance_count=1)

# Predict
result = predictor.predict({'features': [1, 2, 3, 4]})
```

## Personalize - Recommendations

Build recommendation engine:

```
Use cases:
├── Product recommendations
├── Content suggestions
├── Next-best action
└── Personalized ranking

Example: Amazon.com
Customer views product
  ↓
Personalize analyzes
  ├── View history
  ├── Similar user behavior
  ├── Item characteristics
  └── Real-time data

Output: Top 5 recommendations

Training:
├── Historical interactions
├── Item metadata
├── User metadata

Inference:
└── Real-time API calls
```

## Comparing Services

| Service | Use Case | Effort | Cost |
|---------|----------|--------|------|
| Rekognition | Image analysis | None (API) | $1.50/1k |
| Textract | Document extraction | None (API) | $0.015/page |
| Comprehend | Text analysis | None (API) | $0.0001/unit |
| Forecast | Time series | Low (data prep) | $0.10/hour |
| Personalize | Recommendations | Medium | $0.20/1k inference |
| SageMaker | Custom ML | High (ML knowledge) | Compute-based |

## ⚠️ Common Mistakes

❌ **Expecting perfect accuracy**
→ No ML model is 100% accurate

❌ **Using Rekognition for text extraction**
→ Use Textract (better at OCR)

❌ **Training on unclean data**
→ Garbage in, garbage out

❌ **Not monitoring model quality**
→ Model degrades over time

❌ **Using generic model for specific domain**
→ May need custom training

## 🎯 Key Takeaways

✅ Rekognition for computer vision
✅ Textract for document processing
✅ Comprehend for NLP
✅ Forecast for time series
✅ Personalize for recommendations
✅ SageMaker for custom ML
✅ Start with pre-trained models
✅ Monitor model performance

---

**AWS ML services make AI accessible to all developers!**

---

[← Previous: Migration Strategies](38-migration.md) | [Contents](README.md) | [Next: Real-world Architecture Patterns →](40-architecture-patterns.md)
