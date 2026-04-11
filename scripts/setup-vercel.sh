#!/bin/bash

# Porshi - Vercel Setup Script
# Deploys backend to Vercel and sets environment variables
#
# Usage: ./scripts/setup-vercel.sh

set -e

echo "🚀 Porshi - Vercel Backend Setup"
echo ""

# Check if Vercel CLI is installed
if ! command -v vercel &> /dev/null; then
    echo "📦 Installing Vercel CLI..."
    npm install -g vercel
fi

# Check if logged in
echo "🔐 Checking Vercel login..."
vercel whoami > /dev/null 2>&1 || vercel login

echo ""
echo "📝 Enter your environment variables:"
echo ""

read -p "Database URL (leave empty to use in-memory): " DATABASE_URL
read -p "App URL (e.g., https://your-app.vercel.app): " APP_URL
read -sp "Encryption Key (32 chars, press enter to auto-generate): " ENCRYPTION_KEY

if [ -z "$ENCRYPTION_KEY" ]; then
    ENCRYPTION_KEY=$(openssl rand -base64 32 | tr -d '\n')
fi

echo ""
read -sp "FCM Server Key (leave empty to skip): " FCM_SERVER_KEY
echo ""

echo ""
echo "🚀 Deploying to Vercel..."
echo ""

# Deploy
vercel deploy --prod

# Get project info
PROJECT_ID=$(vercel projects list --json | jq -r '.[0].id')
ORG_ID=$(vercel projects list --json | jq -r '.[0].accountId')

echo ""
echo "⚙️  Setting environment variables..."
echo ""

# Set environment variables
vercel env add DATABASE_URL production <<< "$DATABASE_URL"
vercel env add APP_URL production <<< "$APP_URL"
vercel env add ENCRYPTION_KEY production <<< "$ENCRYPTION_KEY"

if [ ! -z "$FCM_SERVER_KEY" ]; then
    vercel env add FCM_SERVER_KEY production <<< "$FCM_SERVER_KEY"
fi

echo ""
echo "✅ Vercel deployment complete!"
echo ""
echo "Project Details:"
echo "  Organization ID: $ORG_ID"
echo "  Project ID: $PROJECT_ID"
echo ""
echo "Next steps:"
echo "1. Get deployment URL: vercel -p"
echo "2. Add to VITE_API_URL in .env"
echo "3. Test API: curl https://your-url/api/health"
echo "4. Update GitHub Actions with Vercel IDs"
echo ""
