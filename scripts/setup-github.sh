#!/bin/bash

# Porshi - GitHub Setup Script
# Sets up GitHub Secrets for GitHub Actions
# 
# Usage: ./scripts/setup-github.sh <repo-owner/repo-name>

set -e

REPO=$1

if [ -z "$REPO" ]; then
    echo "❌ Usage: ./scripts/setup-github.sh <repo-owner/repo-name>"
    echo ""
    echo "Example: ./scripts/setup-github.sh md-salman/porshi"
    exit 1
fi

echo "🚀 Setting up GitHub Secrets for $REPO"
echo ""

# Check if GitHub CLI is installed
if ! command -v gh &> /dev/null; then
    echo "❌ GitHub CLI not found. Install from: https://cli.github.com"
    exit 1
fi

# Login to GitHub if needed
gh auth status > /dev/null 2>&1 || gh auth login

echo "📝 Enter your Vercel configuration:"
echo ""

# Prompt for Vercel tokens
read -sp "Vercel Token: " VERCEL_TOKEN
echo ""
read -p "Vercel Organization ID: " VERCEL_ORG_ID
read -p "Vercel Project ID: " VERCEL_PROJECT_ID

echo ""
echo "🔐 Setting GitHub Secrets..."
echo ""

# Set secrets
gh secret set VERCEL_TOKEN -b "$VERCEL_TOKEN" -R "$REPO" && echo "✅ VERCEL_TOKEN set"
gh secret set VERCEL_ORG_ID -b "$VERCEL_ORG_ID" -R "$REPO" && echo "✅ VERCEL_ORG_ID set"
gh secret set VERCEL_PROJECT_ID -b "$VERCEL_PROJECT_ID" -R "$REPO" && echo "✅ VERCEL_PROJECT_ID set"

echo ""
echo "✅ GitHub Secrets configured successfully!"
echo ""
echo "Next steps:"
echo "1. Push code to GitHub: git push origin main"
echo "2. GitHub Actions will automatically start building"
echo "3. Check Actions tab to monitor progress"
echo "4. Download APKs from Artifacts"
echo ""
