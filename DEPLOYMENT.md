# MCAT Study Schedule API - Deployment Guide

## 🚀 Quick Start (Development)

### Prerequisites

- Node.js 18+
- npm 8+
- Git

### 1. Clone and Setup

```bash
git clone <repository-url>
cd mcat-upwork
npm install
```

### 2. Start Development Server

```bash
npm run dev
```

### 3. Test the API

```bash
# Health check
curl http://localhost:3000/health

# Generate schedule
curl "http://localhost:3000/full-plan?start=2025-01-01&test=2025-04-01&priorities=1A,1B,1D,3A,3B,4A,4B,5A,5D,5E,6B,7A,9B&availability=Mon,Tue,Thu,Fri,Sat&fl_weekday=Sat"
```

## 🏭 Production Deployment

### Option 1: Docker Deployment

#### 1. Create Dockerfile

```dockerfile
FROM node:18-alpine

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci --only=production

# Copy source code
COPY . .

# Build the application
RUN npm run build

# Expose port
EXPOSE 3000

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD curl -f http://localhost:3000/health || exit 1

# Start the application
CMD ["npm", "start"]
```

#### 2. Create .dockerignore

```
node_modules
npm-debug.log
dist
.git
.gitignore
README.md
.env
.nyc_output
coverage
.DS_Store
```

#### 3. Build and Run

```bash
# Build Docker image
docker build -t mcat-schedule-api .

# Run container
docker run -p 3000:3000 mcat-schedule-api

# Run with environment variables
docker run -p 3000:3000 -e PORT=3000 -e NODE_ENV=production mcat-schedule-api
```

### Option 2: Cloud Platform Deployment

#### AWS Elastic Beanstalk

```bash
# Install EB CLI
pip install awsebcli

# Initialize EB application
eb init

# Create environment
eb create production

# Deploy
eb deploy
```

#### Heroku

```bash
# Install Heroku CLI
# Create Procfile
echo "web: npm start" > Procfile

# Login and create app
heroku login
heroku create mcat-schedule-api

# Deploy
git push heroku main
```

#### Google Cloud Run

```bash
# Build and push to Google Container Registry
gcloud builds submit --tag gcr.io/PROJECT-ID/mcat-schedule-api

# Deploy to Cloud Run
gcloud run deploy --image gcr.io/PROJECT-ID/mcat-schedule-api --platform managed
```

### Option 3: VPS/Server Deployment

#### 1. Server Setup

```bash
# Update system
sudo apt update && sudo apt upgrade -y

# Install Node.js
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# Install PM2 for process management
sudo npm install -g pm2
```

#### 2. Application Setup

```bash
# Clone repository
git clone <repository-url>
cd mcat-upwork

# Install dependencies
npm install

# Build application
npm run build

# Start with PM2
pm2 start dist/index.js --name "mcat-api"

# Save PM2 configuration
pm2 save
pm2 startup
```

#### 3. Nginx Configuration

```nginx
server {
    listen 80;
    server_name your-domain.com;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
}
```

## 🔧 Environment Configuration

### Environment Variables

Create `.env` file:

```env
# Server Configuration
PORT=3000
NODE_ENV=production

# Logging
LOG_LEVEL=info

# Performance
REQUEST_TIMEOUT=60000
MAX_REQUEST_SIZE=10mb
```

### Production Optimizations

```bash
# Install production dependencies only
npm ci --only=production

# Enable production optimizations
export NODE_ENV=production

# Use cluster mode for better performance
pm2 start dist/index.js -i max --name "mcat-api"
```

## 📊 Monitoring & Health Checks

### Health Check Endpoint

```bash
curl http://your-domain.com/health
```

Response:

```json
{
  "status": "OK",
  "timestamp": "2025-01-21T10:30:00.000Z",
  "uptime": 3600,
  "memory": {
    "rss": 11583488,
    "heapTotal": 21266432,
    "heapUsed": 19224480
  }
}
```

### Monitoring Setup

```bash
# Install monitoring tools
npm install --save @sentry/node

# Configure Sentry
const Sentry = require('@sentry/node')
Sentry.init({ dsn: 'YOUR_SENTRY_DSN' })
```

## 🔒 Security Considerations

### 1. Input Validation

- All inputs are sanitized and validated
- Type checking with TypeScript
- Request size limits

### 2. Rate Limiting

```bash
npm install express-rate-limit
```

```javascript
const rateLimit = require('express-rate-limit')

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
})

app.use(limiter)
```

### 3. HTTPS Configuration

```javascript
// Force HTTPS in production
if (process.env.NODE_ENV === 'production') {
  app.use((req, res, next) => {
    if (req.header('x-forwarded-proto') !== 'https') {
      res.redirect(`https://${req.header('host')}${req.url}`)
    } else {
      next()
    }
  })
}
```

## 🚀 CI/CD Pipeline

### GitHub Actions Example

```yaml
name: Deploy to Production

on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest

    steps:
      - uses: actions/checkout@v2

      - name: Setup Node.js
        uses: actions/setup-node@v2
        with:
          node-version: '18'

      - name: Install dependencies
        run: npm ci

      - name: Run tests
        run: npm test

      - name: Build application
        run: npm run build

      - name: Deploy to server
        run: |
          # Add your deployment commands here
          echo "Deploying to production..."
```

## 📈 Performance Tuning

### 1. Memory Optimization

```javascript
// Increase memory limit
node --max-old-space-size=4096 dist/index.js
```

### 2. Caching

```javascript
// Redis caching (optional)
const redis = require('redis')
const client = redis.createClient()

// Cache schedule results
app.get('/full-plan', async (req, res) => {
  const cacheKey = `schedule:${JSON.stringify(req.query)}`
  const cached = await client.get(cacheKey)

  if (cached) {
    return res.json(JSON.parse(cached))
  }

  // Generate schedule and cache result
  const result = await generateSchedule(req.query)
  await client.setex(cacheKey, 3600, JSON.stringify(result))
  res.json(result)
})
```

### 3. Load Balancing

```nginx
upstream mcat_api {
    server localhost:3000;
    server localhost:3001;
    server localhost:3002;
}

server {
    location / {
        proxy_pass http://mcat_api;
    }
}
```

## 🔍 Troubleshooting

### Common Issues

1. **Port Already in Use**

```bash
# Find process using port 3000
lsof -ti:3000

# Kill process
kill -9 $(lsof -ti:3000)
```

2. **Memory Issues**

```bash
# Check memory usage
pm2 monit

# Restart if needed
pm2 restart mcat-api
```

3. **Excel File Not Found**

```bash
# Ensure file exists
ls -la Organized_MCAT_Topics.xlsx

# Check file permissions
chmod 644 Organized_MCAT_Topics.xlsx
```

### Logs

```bash
# View PM2 logs
pm2 logs mcat-api

# View specific log level
pm2 logs mcat-api --lines 100
```

## 📋 Pre-Deployment Checklist

- [ ] All tests passing
- [ ] TypeScript compilation successful
- [ ] ESLint checks passed
- [ ] Environment variables configured
- [ ] Excel file present and accessible
- [ ] Health check endpoint responding
- [ ] Memory usage within limits
- [ ] Security headers configured
- [ ] Monitoring setup complete
- [ ] Backup strategy in place

## 🎯 Production URLs

After deployment, your API will be available at:

- **Health Check**: `https://your-domain.com/health`
- **Schedule Generation**: `https://your-domain.com/full-plan`
- **Statistics**: `https://your-domain.com/stats`

## 📞 Support

For deployment issues or questions:

1. Check the logs: `pm2 logs mcat-api`
2. Verify health endpoint: `curl https://your-domain.com/health`
3. Check system resources: `pm2 monit`
4. Review error handling in the application logs
