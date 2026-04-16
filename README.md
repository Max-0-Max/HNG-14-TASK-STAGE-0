# HNG-14-TASK-STAGE-0

# Gender Classification API

## Endpoint
GET /api/classify?name={name}

## Description
Classifies a name using Genderize API and returns processed data.

## Features
- External API integration
- Confidence scoring
- Error handling
- ISO timestamp generation

## Example
/api/classify?name=john

## Response
{
  "status": "success",
  "data": {
    "name": "john",
    "gender": "male",
    "probability": 0.99,
    "sample_size": 1234,
    "is_confident": true,
    "processed_at": "2026-04-15T10:30:00Z"
  }
}

## Deployment
Hosted on Railway / Vercel

