# Environment Variables Configuration

This document provides a comprehensive list of all environment variables required for the WRDO Cave Ultra Build application.

## 🔧 Core Application Variables

| Variable | Required | Category | Description | Example Value |
|----------|----------|----------|-------------|---------------|
| `NODE_ENV` | ✅ Required | Application | Node.js environment mode | `production` |
| `PORT` | ⚠️ Optional | Application | Server port number | `3000` |
| `NEXT_PUBLIC_APP_URL` | ✅ Required | Application | Public URL of the application | `https://your-app.railway.app` |

## 🤖 AI & API Integration Variables

### OpenAI Configuration
| Variable | Required | Category | Description | Example Value |
|----------|----------|----------|-------------|---------------|
| `OPENAI_API_KEY` | ✅ Required | AI/OpenAI | OpenAI API key for GPT models | `sk-proj-...` |
| `OPENAI_ORG_ID` | ⚠️ Optional | AI/OpenAI | OpenAI organization ID | `org-...` |
| `OPENAI_BASE_URL` | ⚠️ Optional | AI/OpenAI | Custom OpenAI API base URL | `https://api.openai.com/v1` |

### Hume AI Configuration
| Variable | Required | Category | Description | Example Value |
|----------|----------|----------|-------------|---------------|
| `HUME_API_KEY` | ✅ Required | AI/Hume | Hume AI API key for emotion analysis | `hume_...` |
| `HUME_BASE_URL` | ⚠️ Optional | AI/Hume | Custom Hume AI API base URL | `https://api.hume.ai/v0` |

### ElevenLabs Configuration
| Variable | Required | Category | Description | Example Value |
|----------|----------|----------|-------------|---------------|
| `ELEVENLABS_API_KEY` | ✅ Required | AI/Voice | ElevenLabs API key for voice synthesis | `el_...` |
| `ELEVENLABS_BASE_URL` | ⚠️ Optional | AI/Voice | Custom ElevenLabs API base URL | `https://api.elevenlabs.io/v1` |

### Abacus AI Configuration
| Variable | Required | Category | Description | Example Value |
|----------|----------|----------|-------------|---------------|
| `ABACUSAI_API_KEY` | ✅ Required | AI/Abacus | Abacus AI API key for advanced analytics | `abacus_...` |

## 🗄️ Database Configuration

| Variable | Required | Category | Description | Example Value |
|----------|----------|----------|-------------|---------------|
| `DATABASE_URL` | ✅ Required | Database | PostgreSQL database connection string | `postgresql://user:pass@host:5432/db` |

## 🔐 Security & Authentication

| Variable | Required | Category | Description | Example Value |
|----------|----------|----------|-------------|---------------|
| `JWT_SECRET` | ✅ Required | Security | Secret key for JWT token signing | `your-super-secret-jwt-key-here` |
| `API_RATE_LIMIT` | ⚠️ Optional | Security | API rate limit per minute | `100` |

## 🚀 Railway Deployment Variables

| Variable | Required | Category | Description | Example Value |
|----------|----------|----------|-------------|---------------|
| `RAILWAY_ENVIRONMENT` | ✅ Required | Deployment | Railway environment identifier | `production` |
| `RAILWAY_PROJECT_ID` | 🔄 Auto-set | Deployment | Railway project ID (auto-generated) | `proj_...` |
| `RAILWAY_SERVICE_ID` | 🔄 Auto-set | Deployment | Railway service ID (auto-generated) | `svc_...` |
| `RAILWAY_DEPLOYMENT_ID` | 🔄 Auto-set | Deployment | Railway deployment ID (auto-generated) | `dep_...` |

## 📝 Environment File Templates

### Development (.env.local)
```bash
# Development Environment
NODE_ENV=development
PORT=3000
NEXT_PUBLIC_APP_URL=http://localhost:3000

# API Keys (Development)
OPENAI_API_KEY=your_openai_api_key_here
HUME_API_KEY=your_hume_api_key_here
ELEVENLABS_API_KEY=your_elevenlabs_api_key_here
ABACUSAI_API_KEY=your_abacusai_api_key_here

# Database (Development)
DATABASE_URL=postgresql://localhost:5432/wrdo_dev

# Security
JWT_SECRET=dev-jwt-secret-change-in-production
API_RATE_LIMIT=1000
```

### Production (.env)
```bash
# Production Environment
NODE_ENV=production
NEXT_PUBLIC_APP_URL=https://your-app.railway.app

# API Keys (Production)
OPENAI_API_KEY=sk-proj-your-production-key
HUME_API_KEY=hume-your-production-key
ELEVENLABS_API_KEY=el-your-production-key
ABACUSAI_API_KEY=abacus-your-production-key

# Database (Production)
DATABASE_URL=${{Postgres.DATABASE_URL}}

# Security
JWT_SECRET=your-super-secure-production-jwt-secret
API_RATE_LIMIT=100

# Railway
RAILWAY_ENVIRONMENT=production
```

## 🔍 Variable Validation

The application includes built-in validation for critical environment variables:

### Required Variables Check
- Application startup will fail if any required variables are missing
- API endpoints will return 500 errors if their respective API keys are not configured
- Database operations will fail if `DATABASE_URL` is not properly set

### Security Validation
- JWT operations require `JWT_SECRET` to be at least 32 characters long
- API keys are validated for proper format before making external requests
- Rate limiting is enforced based on `API_RATE_LIMIT` setting

## 🛠️ Setup Instructions

### 1. Local Development
1. Copy `.env.example` to `.env.local`
2. Fill in your API keys and database URL
3. Run `npm run dev` to start development server

### 2. Railway Deployment
1. Set environment variables in Railway dashboard
2. Use Railway's PostgreSQL add-on for `DATABASE_URL`
3. Deploy using Railway CLI or GitHub integration

### 3. Environment Variable Priority
1. Railway environment variables (highest priority)
2. `.env` file
3. `.env.local` file
4. Default values (lowest priority)

## 🚨 Security Notes

- **Never commit real API keys to version control**
- Use Railway's environment variable management for production
- Rotate API keys regularly
- Monitor API usage and rate limits
- Use strong, unique JWT secrets for each environment

## 📊 API Integration Status

| Service | Status | Required Variables | Health Check |
|---------|--------|-------------------|--------------|
| OpenAI | ✅ Active | `OPENAI_API_KEY` | `/api/chat` |
| Hume AI | ✅ Active | `HUME_API_KEY` | `/api/hume/analyze` |
| ElevenLabs | ✅ Active | `ELEVENLABS_API_KEY` | `/api/elevenlabs/synthesize` |
| Database | ✅ Active | `DATABASE_URL` | `/api/health` |

## 🔧 Troubleshooting

### Common Issues
1. **API Authentication Errors**: Check if API keys are correctly set and valid
2. **Database Connection Errors**: Verify `DATABASE_URL` format and accessibility
3. **Rate Limiting**: Adjust `API_RATE_LIMIT` based on your API plan limits
4. **CORS Issues**: Ensure `NEXT_PUBLIC_APP_URL` matches your domain

### Testing Environment Variables
Run the API test script to verify all integrations:
```bash
npm run test:apis
```

This will test all API endpoints and report any configuration issues.
