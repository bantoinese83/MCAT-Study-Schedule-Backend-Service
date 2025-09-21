# MCAT Study Schedule API Documentation

## 🚀 API Overview

The MCAT Study Schedule API generates comprehensive 3-month study plans tailored
to individual needs, availability, and priorities. The API processes MCAT topic
data and creates optimized schedules with proper phase distribution, full-length
exam scheduling, and resource allocation.

## 📋 Base URL

```
http://localhost:3000 (Development)
https://your-domain.com (Production)
```

## 🔗 Endpoints

### 1. Health Check

**GET** `/health`

Returns the current status and system information.

#### Response

```json
{
  "status": "OK",
  "timestamp": "2025-01-21T10:30:00.000Z",
  "uptime": 3600.123,
  "memory": {
    "rss": 11583488,
    "heapTotal": 21266432,
    "heapUsed": 19224480,
    "external": 4921494,
    "arrayBuffers": 3025902
  }
}
```

#### Example

```bash
curl http://localhost:3000/health
```

---

### 2. Generate Study Schedule

**GET** `/full-plan`

Generates a complete MCAT study schedule based on provided parameters.

#### Query Parameters

| Parameter      | Type   | Required | Description                         | Example                                  |
| -------------- | ------ | -------- | ----------------------------------- | ---------------------------------------- |
| `start`        | string | Yes      | Start date (YYYY-MM-DD)             | `2025-01-01`                             |
| `test`         | string | Yes      | Test date (YYYY-MM-DD)              | `2025-04-01`                             |
| `priorities`   | string | Yes      | Comma-separated priority categories | `1A,1B,1D,3A,3B,4A,4B,5A,5D,5E,6B,7A,9B` |
| `availability` | string | Yes      | Comma-separated study days          | `Mon,Tue,Thu,Fri,Sat`                    |
| `fl_weekday`   | string | Yes      | Day for full-length exams           | `Sat`                                    |

#### Response Structure

```json
{
  "success": true,
  "data": [
    {
      "date": "2025-01-01",
      "kind": "break"
    },
    {
      "date": "2025-01-02",
      "kind": "study",
      "phase": 1,
      "blocks": {
        "science_content": [
          {
            "title": "Cell Structure and Function",
            "provider": "Khan Academy",
            "type": "video",
            "duration": 12,
            "url": "https://example.com/video1"
          }
        ],
        "science_discretes": [
          {
            "title": "Biology Practice Set 1",
            "provider": "Khan Academy",
            "type": "discrete",
            "duration": 30,
            "questions": 10
          }
        ],
        "cars": [
          {
            "title": "CARS Passage 1",
            "provider": "Jack Westin",
            "type": "passage",
            "duration": 25
          }
        ],
        "written_review_minutes": 60,
        "total_resource_minutes": 240
      }
    },
    {
      "date": "2025-01-18",
      "kind": "full_length",
      "provider": "AAMC",
      "name": "FL #1"
    }
  ],
  "stats": {
    "totalDays": 90,
    "studyDays": 59,
    "breakDays": 26,
    "flDays": 5,
    "phaseStats": [
      {
        "phase": 1,
        "count": 19,
        "percentage": 32
      },
      {
        "phase": 2,
        "count": 19,
        "percentage": 32
      },
      {
        "phase": 3,
        "count": 21,
        "percentage": 36
      }
    ],
    "flStats": {
      "total": 5,
      "dates": [
        "2025-01-18",
        "2025-02-01",
        "2025-02-15",
        "2025-03-08",
        "2025-03-22"
      ],
      "averageSpacing": 16
    },
    "resourceStats": {
      "totalUsed": 8,
      "byProvider": {
        "Khan Academy": 15,
        "Kaplan": 8,
        "Jack Westin": 12,
        "UWorld": 5,
        "AAMC": 10
      }
    }
  },
  "generatedAt": "2025-01-21T10:30:00.000Z"
}
```

#### Example Request

```bash
curl "http://localhost:3000/full-plan?start=2025-01-01&test=2025-04-01&priorities=1A,1B,1D,3A,3B,4A,4B,5A,5D,5E,6B,7A,9B&availability=Mon,Tue,Thu,Fri,Sat&fl_weekday=Sat"
```

---

### 3. Get Schedule Statistics

**GET** `/stats`

Returns statistics for a generated schedule without the full schedule data.

#### Query Parameters

Same as `/full-plan` endpoint.

#### Response

```json
{
  "success": true,
  "stats": {
    "totalDays": 90,
    "studyDays": 59,
    "breakDays": 26,
    "flDays": 5,
    "phaseStats": [...],
    "flStats": {...},
    "resourceStats": {...}
  },
  "generatedAt": "2025-01-21T10:30:00.000Z"
}
```

#### Example Request

```bash
curl "http://localhost:3000/stats?start=2025-01-01&test=2025-04-01&priorities=1A,1B,1D,3A,3B,4A,4B,5A,5D,5E,6B,7A,9B&availability=Mon,Tue,Thu,Fri,Sat&fl_weekday=Sat"
```

---

## 📊 Response Types

### Study Day Types

#### 1. Break Day

```json
{
  "date": "2025-01-01",
  "kind": "break"
}
```

#### 2. Study Day - Phase 1

```json
{
  "date": "2025-01-02",
  "kind": "study",
  "phase": 1,
  "blocks": {
    "science_content": [...],
    "science_discretes": [...],
    "cars": [...],
    "written_review_minutes": 60,
    "total_resource_minutes": 240
  }
}
```

#### 3. Study Day - Phase 2

```json
{
  "date": "2025-01-15",
  "kind": "study",
  "phase": 2,
  "blocks": {
    "science_passages": [...],
    "uworld_set": [...],
    "extra_discretes": [...],
    "cars": [...],
    "written_review_minutes": 60,
    "total_resource_minutes": 240
  }
}
```

#### 4. Study Day - Phase 3

```json
{
  "date": "2025-03-15",
  "kind": "study",
  "phase": 3,
  "blocks": {
    "aamc_sets": [...],
    "aamc_CARS_passages": [...],
    "written_review_minutes": 60,
    "total_resource_minutes": 240
  }
}
```

#### 5. Full-Length Exam Day

```json
{
  "date": "2025-01-18",
  "kind": "full_length",
  "provider": "AAMC",
  "name": "FL #1"
}
```

---

## 🔧 Resource Types

### Science Content

```json
{
  "title": "Cell Structure and Function",
  "provider": "Khan Academy",
  "type": "video",
  "duration": 12,
  "url": "https://example.com/video1",
  "high_yield": true,
  "category": "1A",
  "concept": "1A.1.1"
}
```

### Science Discretes

```json
{
  "title": "Biology Practice Set 1",
  "provider": "Khan Academy",
  "type": "discrete",
  "duration": 30,
  "questions": 10,
  "high_yield": true,
  "category": "1A"
}
```

### CARS Passages

```json
{
  "title": "CARS Passage 1",
  "provider": "Jack Westin",
  "type": "passage",
  "duration": 25,
  "high_yield": true
}
```

### UWorld Sets

```json
{
  "title": "UWorld Biology Set 1",
  "provider": "UWorld",
  "type": "uworld_set",
  "duration": 30,
  "questions": 10
}
```

### AAMC Sets

```json
{
  "title": "AAMC Biology Pack A",
  "provider": "AAMC",
  "type": "aamc_set",
  "duration": 45,
  "questions": 25,
  "pack": "A"
}
```

---

## ⚠️ Error Responses

### Validation Error

```json
{
  "success": false,
  "error": "Invalid date format. Use YYYY-MM-DD",
  "code": "VALIDATION_ERROR"
}
```

### Missing Parameters

```json
{
  "success": false,
  "error": "Missing required parameters: start, test, priorities, availability, fl_weekday",
  "code": "VALIDATION_ERROR"
}
```

### Internal Server Error

```json
{
  "success": false,
  "error": "Internal server error",
  "code": "INTERNAL_ERROR"
}
```

---

## 🎯 Priority Categories

The API supports the following MCAT content categories:

| Category | Description                            |
| -------- | -------------------------------------- |
| 1A       | Biology: Cell and Molecular Biology    |
| 1B       | Biology: Genetics                      |
| 1C       | Biology: Evolution                     |
| 1D       | Biology: Ecology                       |
| 2A       | Chemistry: General Chemistry           |
| 2B       | Chemistry: Organic Chemistry           |
| 3A       | Physics: Mechanics                     |
| 3B       | Physics: Thermodynamics                |
| 3C       | Physics: Waves and Sound               |
| 3D       | Physics: Light and Optics              |
| 4A       | Psychology: Sensation and Perception   |
| 4B       | Psychology: Learning and Memory        |
| 4C       | Psychology: Cognition                  |
| 4D       | Psychology: Social Psychology          |
| 5A       | Sociology: Social Structure            |
| 5B       | Sociology: Social Interaction          |
| 5C       | Sociology: Social Change               |
| 5D       | Sociology: Social Stratification       |
| 5E       | Sociology: Social Institutions         |
| 6A       | Biochemistry: Protein Structure        |
| 6B       | Biochemistry: Enzymes                  |
| 6C       | Biochemistry: Metabolism               |
| 7A       | Critical Analysis and Reasoning Skills |
| 8A       | Research Methods                       |
| 9A       | Data Analysis                          |
| 9B       | Scientific Reasoning                   |

---

## 📈 Rate Limits

- **Default**: 100 requests per 15 minutes per IP
- **Health Endpoint**: No rate limit
- **Schedule Generation**: 10 requests per hour per IP (configurable)

---

## 🔍 Testing Examples

### Basic Schedule Generation

```bash
curl "http://localhost:3000/full-plan?start=2025-01-01&test=2025-04-01&priorities=1A,1B,1D&availability=Mon,Tue,Wed,Thu,Fri&fl_weekday=Sat"
```

### Weekend Study Schedule

```bash
curl "http://localhost:3000/full-plan?start=2025-01-01&test=2025-04-01&priorities=1A,1B,1D,3A,3B&availability=Sat,Sun&fl_weekday=Sun"
```

### Intensive 2-Month Schedule

```bash
curl "http://localhost:3000/full-plan?start=2025-01-01&test=2025-03-01&priorities=1A,1B,1D,3A,3B,4A,4B,5A,5D,5E,6B,7A,9B&availability=Mon,Tue,Wed,Thu,Fri,Sat,Sun&fl_weekday=Sat"
```

---

## 🛠️ Development Tools

### Health Check Script

```bash
#!/bin/bash
# health-check.sh
curl -s http://localhost:3000/health | jq '.status'
```

### Schedule Generator Script

```bash
#!/bin/bash
# generate-schedule.sh
curl -s "http://localhost:3000/full-plan?start=2025-01-01&test=2025-04-01&priorities=1A,1B,1D,3A,3B,4A,4B,5A,5D,5E,6B,7A,9B&availability=Mon,Tue,Thu,Fri,Sat&fl_weekday=Sat" | jq '.data | length'
```

---

## 📞 Support

For API issues or questions:

1. Check the health endpoint: `GET /health`
2. Review error responses for specific error codes
3. Verify all required parameters are provided
4. Check server logs for detailed error information
