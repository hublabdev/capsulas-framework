# Deployment Guide

Complete guide for deploying Capsulas-generated applications to various platforms.

## Quick Platform Selector

Choose based on your needs:

| Platform | Best For | Setup Time | Cost |
|----------|----------|------------|------|
| **Vercel** | Next.js, APIs | 5 min | Free tier available |
| **Railway** | Full-stack apps | 5 min | $5/month |
| **Replit** | Quick prototypes | 2 min | Free tier available |
| **AWS Lambda** | Serverless, scale | 15 min | Pay per use |
| **Heroku** | Traditional apps | 10 min | $7/month |
| **Docker** | Any platform | 10 min | Varies |
| **Self-hosted** | Full control | 30 min | Server cost |

---

## Vercel

**Best for**: Next.js applications, API routes, static sites

### Prerequisites
- Vercel account
- Generated Capsulas code
- Git repository

### Step 1: Prepare Project

```bash
# In your project directory
npm init -y
npm install next react react-dom
npm install -D typescript @types/react @types/node
```

### Step 2: Create API Route

Create `pages/api/flow.ts`:

```typescript
import type { NextApiRequest, NextApiResponse } from 'next';

// Import your generated flow
async function executeFlow() {
  // Paste your generated code here
  // OR import it:
  // import { executeFlow } from '../../lib/generated-flow';
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  try {
    // Only allow POST requests
    if (req.method !== 'POST') {
      return res.status(405).json({ error: 'Method not allowed' });
    }

    // Execute your flow
    const result = await executeFlow();

    res.status(200).json({
      success: true,
      data: result
    });
  } catch (error) {
    console.error('Flow execution failed:', error);
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}
```

### Step 3: Configure Environment Variables

Create `.env.local`:

```bash
# Copy from your .env.example
DATABASE_URL=your-database-url
JWT_SECRET=your-secret
OPENAI_API_KEY=your-key
```

### Step 4: Create vercel.json

```json
{
  "version": 2,
  "env": {
    "DATABASE_URL": "@database-url",
    "JWT_SECRET": "@jwt-secret",
    "OPENAI_API_KEY": "@openai-key"
  },
  "build": {
    "env": {
      "NODE_ENV": "production"
    }
  }
}
```

### Step 5: Deploy

```bash
# Install Vercel CLI
npm install -g vercel

# Deploy
vercel

# Production deployment
vercel --prod
```

### Step 6: Add Environment Variables in Vercel

1. Go to Vercel dashboard
2. Select your project
3. Go to Settings → Environment Variables
4. Add all variables from `.env.example`
5. Redeploy

### Testing

```bash
curl -X POST https://your-app.vercel.app/api/flow
```

---

## Railway

**Best for**: Full-stack apps, PostgreSQL integration, quick deployment

### Prerequisites
- Railway account
- GitHub repository (optional but recommended)

### Step 1: Prepare Express Server

Create `server.ts`:

```typescript
import express from 'express';
import cors from 'cors';

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'healthy', timestamp: new Date().toISOString() });
});

// Your flow endpoint
app.post('/api/flow', async (req, res) => {
  try {
    // Import your generated flow
    const { executeFlow } = await import('./generated-flow');
    const result = await executeFlow();

    res.json({
      success: true,
      data: result
    });
  } catch (error) {
    console.error('Flow execution failed:', error);
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM received, shutting down gracefully');
  process.exit(0);
});
```

### Step 2: Update package.json

```json
{
  "name": "my-capsulas-app",
  "version": "1.0.0",
  "scripts": {
    "build": "tsc",
    "start": "node dist/server.js",
    "dev": "ts-node server.ts"
  },
  "dependencies": {
    "express": "^4.18.0",
    "cors": "^2.8.5"
  },
  "devDependencies": {
    "@types/express": "^4.17.17",
    "@types/cors": "^2.8.13",
    "typescript": "^5.0.0",
    "ts-node": "^10.9.1"
  }
}
```

### Step 3: Deploy to Railway

**Option A: CLI**
```bash
# Install Railway CLI
npm install -g @railway/cli

# Login
railway login

# Initialize
railway init

# Deploy
railway up
```

**Option B: GitHub**
1. Push code to GitHub
2. Go to Railway dashboard
3. "New Project" → "Deploy from GitHub"
4. Select repository
5. Add environment variables
6. Deploy

### Step 4: Add Database (Optional)

```bash
# Add PostgreSQL
railway add

# Get DATABASE_URL
railway variables

# It's automatically added to your app
```

### Testing

```bash
curl -X POST https://your-app.railway.app/api/flow
```

---

## AWS Lambda

**Best for**: Serverless, auto-scaling, pay-per-use

### Step 1: Create Lambda Handler

Create `lambda.ts`:

```typescript
import { APIGatewayProxyEvent, APIGatewayProxyResult, Context } from 'aws-lambda';

export const handler = async (
  event: APIGatewayProxyEvent,
  context: Context
): Promise<APIGatewayProxyResult> => {
  try {
    // Import your generated flow
    const { executeFlow } = await import('./generated-flow');

    // Parse request body if needed
    const input = event.body ? JSON.parse(event.body) : {};

    // Execute flow
    const result = await executeFlow();

    return {
      statusCode: 200,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      },
      body: JSON.stringify({
        success: true,
        data: result
      })
    };
  } catch (error) {
    console.error('Flow execution failed:', error);

    return {
      statusCode: 500,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      },
      body: JSON.stringify({
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      })
    };
  }
};
```

### Step 2: Install Dependencies

```bash
npm install
npm install -D @types/aws-lambda esbuild
```

### Step 3: Build

```bash
# Compile TypeScript
npx tsc

# Bundle with dependencies
npx esbuild dist/lambda.js --bundle --platform=node --target=node18 --outfile=dist/bundle.js
```

### Step 4: Create Deployment Package

```bash
cd dist
zip -r function.zip bundle.js
```

### Step 5: Deploy with AWS CLI

```bash
# Create function
aws lambda create-function \
  --function-name my-capsulas-flow \
  --runtime nodejs18.x \
  --handler bundle.handler \
  --zip-file fileb://function.zip \
  --role arn:aws:iam::YOUR_ACCOUNT:role/lambda-role

# Update function
aws lambda update-function-code \
  --function-name my-capsulas-flow \
  --zip-file fileb://function.zip
```

### Step 6: Add Environment Variables

```bash
aws lambda update-function-configuration \
  --function-name my-capsulas-flow \
  --environment "Variables={DATABASE_URL=your-url,JWT_SECRET=your-secret}"
```

### Step 7: Create API Gateway (Optional)

```bash
# Creates HTTP endpoint for your Lambda
aws apigatewayv2 create-api \
  --name my-capsulas-api \
  --protocol-type HTTP \
  --target arn:aws:lambda:REGION:ACCOUNT:function:my-capsulas-flow
```

### Alternative: Serverless Framework

Create `serverless.yml`:

```yaml
service: my-capsulas-app

provider:
  name: aws
  runtime: nodejs18.x
  region: us-east-1
  environment:
    DATABASE_URL: ${env:DATABASE_URL}
    JWT_SECRET: ${env:JWT_SECRET}

functions:
  flow:
    handler: dist/lambda.handler
    events:
      - httpApi:
          path: /flow
          method: post

plugins:
  - serverless-esbuild
```

Deploy:
```bash
npx serverless deploy
```

---

## Replit

**Best for**: Quick prototyping, sharing demos, collaborative development

### Step 1: Create Repl

1. Go to replit.com
2. Create new Repl
3. Choose "Node.js"

### Step 2: Upload Your Code

- Drag and drop files
- Or paste generated code into `index.js`

### Step 3: Create .replit Config

```toml
run = "node index.js"
entrypoint = "index.js"

[nix]
channel = "stable-22_11"

[deployment]
run = ["node", "index.js"]
deploymentTarget = "cloudrun"
```

### Step 4: Add Secrets

1. Click "Secrets" (lock icon)
2. Add environment variables:
   - DATABASE_URL
   - JWT_SECRET
   - etc.

### Step 5: Run

Click "Run" button. Your app is now live at `https://your-repl.your-username.repl.co`

---

## Docker

**Best for**: Consistent environment, any platform, microservices

### Step 1: Create Dockerfile

```dockerfile
FROM node:20-alpine AS builder

WORKDIR /app

# Copy package files
COPY package*.json ./
COPY tsconfig.json ./

# Install dependencies
RUN npm ci

# Copy source
COPY . .

# Build
RUN npm run build

# Production image
FROM node:20-alpine

WORKDIR /app

# Copy built files
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/node_modules ./node_modules
COPY package*.json ./

# Create non-root user
RUN addgroup -g 1001 -S nodejs
RUN adduser -S nodejs -u 1001
USER nodejs

EXPOSE 3000

CMD ["node", "dist/server.js"]
```

### Step 2: Create .dockerignore

```
node_modules
dist
.env
*.log
.git
.DS_Store
```

### Step 3: Build Image

```bash
docker build -t my-capsulas-app .
```

### Step 4: Run Locally

```bash
docker run -p 3000:3000 \
  -e DATABASE_URL=your-url \
  -e JWT_SECRET=your-secret \
  my-capsulas-app
```

### Step 5: docker-compose (Recommended)

Create `docker-compose.yml`:

```yaml
version: '3.8'

services:
  app:
    build: .
    ports:
      - "3000:3000"
    environment:
      - DATABASE_URL=postgresql://user:pass@db:5432/mydb
      - JWT_SECRET=your-secret
      - NODE_ENV=production
    depends_on:
      - db
    restart: unless-stopped

  db:
    image: postgres:15-alpine
    environment:
      - POSTGRES_USER=user
      - POSTGRES_PASSWORD=pass
      - POSTGRES_DB=mydb
    volumes:
      - postgres-data:/var/lib/postgresql/data
    restart: unless-stopped

volumes:
  postgres-data:
```

Run:
```bash
docker-compose up -d
```

### Step 6: Deploy to Cloud

**Docker Hub + Any Cloud:**
```bash
# Tag
docker tag my-capsulas-app username/my-capsulas-app:latest

# Push
docker push username/my-capsulas-app:latest

# Pull and run on any server
docker pull username/my-capsulas-app:latest
docker run -d -p 80:3000 username/my-capsulas-app:latest
```

---

## Self-Hosted (VPS)

**Best for**: Full control, custom requirements, cost optimization

### Step 1: Provision Server

Any VPS provider:
- DigitalOcean
- Linode
- AWS EC2
- Hetzner

Requirements:
- Ubuntu 22.04+ or similar
- 1GB RAM minimum
- Node.js 18+

### Step 2: Setup Server

```bash
# SSH into server
ssh root@your-server-ip

# Update system
apt update && apt upgrade -y

# Install Node.js
curl -fsSL https://deb.nodesource.com/setup_20.x | bash -
apt install -y nodejs

# Install PM2 (process manager)
npm install -g pm2

# Install Nginx (reverse proxy)
apt install -y nginx

# Install certbot (SSL)
apt install -y certbot python3-certbot-nginx
```

### Step 3: Deploy Your App

```bash
# Clone or upload your code
git clone your-repo.git /var/www/my-app
cd /var/www/my-app

# Install dependencies
npm install

# Build
npm run build

# Create .env
nano .env
# Paste your environment variables

# Start with PM2
pm2 start dist/server.js --name my-app
pm2 save
pm2 startup
```

### Step 4: Configure Nginx

```bash
nano /etc/nginx/sites-available/my-app
```

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
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

Enable site:
```bash
ln -s /etc/nginx/sites-available/my-app /etc/nginx/sites-enabled/
nginx -t
systemctl reload nginx
```

### Step 5: Setup SSL

```bash
certbot --nginx -d your-domain.com
```

### Step 6: Monitoring

```bash
# View logs
pm2 logs my-app

# Monitor
pm2 monit

# Auto-restart on file changes
pm2 start dist/server.js --watch

# View status
pm2 status
```

---

## Environment Variables Reference

Common environment variables needed:

```bash
# Server
NODE_ENV=production
PORT=3000

# Database
DATABASE_URL=postgresql://user:pass@host:5432/db
MONGODB_URI=mongodb://host:27017/db

# Authentication
JWT_SECRET=min-32-characters-random-string
OAUTH_CLIENT_ID=your-client-id
OAUTH_CLIENT_SECRET=your-client-secret
OAUTH_REDIRECT_URI=https://your-domain.com/callback

# AI Services
OPENAI_API_KEY=sk-...
ANTHROPIC_API_KEY=sk-ant-...

# Email
SENDGRID_API_KEY=SG...
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-password

# Storage
AWS_ACCESS_KEY_ID=...
AWS_SECRET_ACCESS_KEY=...
S3_BUCKET=my-bucket
S3_REGION=us-east-1

# Payments
STRIPE_SECRET_KEY=sk_...
STRIPE_PUBLISHABLE_KEY=pk_...

# Cache/Queue
REDIS_URL=redis://localhost:6379

# Monitoring (optional)
SENTRY_DSN=https://...
```

---

## Production Checklist

Before deploying to production:

### Security
- [ ] All secrets in environment variables (not hardcoded)
- [ ] HTTPS enabled (SSL certificate)
- [ ] CORS configured properly
- [ ] Input validation on all endpoints
- [ ] Rate limiting enabled
- [ ] SQL injection prevention (use parameterized queries)
- [ ] XSS prevention (sanitize outputs)

### Performance
- [ ] Database indexes added
- [ ] Caching strategy implemented
- [ ] CDN for static assets
- [ ] Gzip compression enabled
- [ ] Connection pooling configured
- [ ] Lazy loading where appropriate

### Monitoring
- [ ] Error tracking (Sentry, Rollbar)
- [ ] Performance monitoring (DataDog, New Relic)
- [ ] Uptime monitoring (UptimeRobot, Pingdom)
- [ ] Log aggregation (Loggly, Papertrail)
- [ ] Alerts configured

### Reliability
- [ ] Health check endpoint
- [ ] Graceful shutdown handling
- [ ] Auto-restart on crashes (PM2, systemd)
- [ ] Database backups automated
- [ ] Disaster recovery plan

### Documentation
- [ ] API documentation (Swagger, Postman)
- [ ] Deployment runbook
- [ ] Incident response plan
- [ ] Environment setup guide

---

## Need Help?

- See [FAQ](./FAQ.md) for common questions
- See [AI Assistant Guide](./AI_ASSISTANT_GUIDE.md) for AI-assisted deployment
- Join [Discord](https://discord.gg/capsulas) for community support
- Open [GitHub Issue](https://github.com/yourusername/capsulas/issues) for bugs
