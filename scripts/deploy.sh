
#!/bin/bash

set -e

echo "🚀 WRDO Deployment Script"
echo "========================="

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARN]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check if we're in the right directory
if [ ! -f "package.json" ]; then
    print_error "package.json not found. Please run this script from the project root."
    exit 1
fi

# Check for required environment variables
print_status "Checking environment variables..."

required_vars=("OPENAI_API_KEY" "HUME_API_KEY" "ELEVENLABS_API_KEY")
missing_vars=()

for var in "${required_vars[@]}"; do
    if [ -z "${!var}" ]; then
        missing_vars+=("$var")
    fi
done

if [ ${#missing_vars[@]} -ne 0 ]; then
    print_warning "Missing environment variables: ${missing_vars[*]}"
    print_warning "Please set these variables before deployment."
fi

# Install dependencies
print_status "Installing dependencies..."
if command -v pnpm &> /dev/null; then
    pnpm install --frozen-lockfile
else
    npm ci
fi

# Run linting
print_status "Running linter..."
if command -v pnpm &> /dev/null; then
    pnpm lint || print_warning "Linting issues found"
else
    npm run lint || print_warning "Linting issues found"
fi

# Build the application
print_status "Building application..."
if command -v pnpm &> /dev/null; then
    pnpm build
else
    npm run build
fi

# Test the build locally
print_status "Starting local server for testing..."
if command -v pnpm &> /dev/null; then
    pnpm start &
else
    npm start &
fi

SERVER_PID=$!
sleep 10

# Test APIs
print_status "Testing APIs..."
node scripts/test-apis.js

# Stop local server
kill $SERVER_PID 2>/dev/null || true

# Deploy to Railway (if Railway CLI is available)
if command -v railway &> /dev/null; then
    print_status "Deploying to Railway..."
    
    # Check if logged in
    if ! railway whoami &> /dev/null; then
        print_error "Not logged in to Railway. Please run 'railway login' first."
        exit 1
    fi
    
    # Deploy
    railway up --detach
    
    print_status "Deployment initiated. Check Railway dashboard for status."
    
    # Wait a bit and test production
    print_status "Waiting for deployment to complete..."
    sleep 30
    
    # Get the production URL
    PROD_URL=$(railway domain 2>/dev/null || echo "")
    
    if [ -n "$PROD_URL" ]; then
        print_status "Testing production deployment at $PROD_URL..."
        NEXT_PUBLIC_APP_URL="https://$PROD_URL" node scripts/test-apis.js
    fi
    
else
    print_warning "Railway CLI not found. Skipping automatic deployment."
    print_status "To deploy manually:"
    print_status "1. Install Railway CLI: npm install -g @railway/cli"
    print_status "2. Login: railway login"
    print_status "3. Deploy: railway up"
fi

print_status "Deployment script completed!"
