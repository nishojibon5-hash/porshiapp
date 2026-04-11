# Porshi - GitHub Actions & Vercel Setup Guide

Complete instructions for setting up automated APK builds on GitHub Actions and backend message syncing on Vercel.

## Table of Contents
1. [GitHub Actions Setup](#github-actions-setup)
2. [Vercel Backend Setup](#vercel-backend-setup)
3. [Integration Guide](#integration-guide)
4. [Troubleshooting](#troubleshooting)

---

## GitHub Actions Setup

### Prerequisites
- GitHub repository with your Porshi code
- Android SDK, Gradle, and Java installed (or use GitHub Actions)
- Expo account (optional, for EAS builds)

### Step 1: Add Workflow File

The workflow file is already created at `.github/workflows/android-build.yml`

**What it does:**
- ✅ Checks out your code
- ✅ Sets up Node.js, Java, and Android SDK
- ✅ Runs tests
- ✅ Builds Debug APK
- ✅ Builds Release APK (production)
- ✅ Uploads APKs as artifacts
- ✅ Creates GitHub releases
- ✅ Deploys to Vercel

### Step 2: Set Up GitHub Secrets

Add these secrets to your GitHub repository:

**Go to:** `Settings → Secrets and variables → Actions → New repository secret`

#### Required Secrets:

**1. Vercel Deployment Secrets**
```
VERCEL_TOKEN: <your-vercel-token>
VERCEL_ORG_ID: <your-vercel-org-id>
VERCEL_PROJECT_ID: <your-vercel-project-id>
```

**To get Vercel tokens:**
1. Go to https://vercel.com/account/tokens
2. Click "Create Token"
3. Copy and add to GitHub Secrets

#### Optional Secrets (for advanced features):

```
SIGNING_KEY_ALIAS: <android-key-alias>
SIGNING_KEY_PASSWORD: <android-key-password>
SIGNING_STORE_PASSWORD: <android-store-password>
```

### Step 3: Trigger Builds

Builds automatically trigger on:
- Push to `main` or `develop` branches
- Pull requests

**Or manually trigger:**
1. Go to `Actions` tab in GitHub
2. Select `Build Android APK` workflow
3. Click `Run workflow`

### Step 4: Download APKs

After build completes:
1. Go to `Actions` tab
2. Click the workflow run
3. Scroll to `Artifacts` section
4. Download `porshi-debug-apk` or `porshi-release-apk`

### Step 5: Create Releases (Optional)

To create GitHub releases with APKs:

```bash
# Tag a commit
git tag -a v1.0.0 -m "Porshi v1.0.0"

# Push tag
git push origin v1.0.0
```

GitHub Actions will automatically:
- Build APKs
- Create release
- Upload APKs to release assets

---

## Vercel Backend Setup

### Prerequisites
- Vercel account (free tier available)
- GitHub repository with backend code

### Step 1: Deploy to Vercel

**Option A: Using Vercel CLI**

```bash
# Install Vercel CLI
npm install -g vercel

# Login to Vercel
vercel login

# Deploy
vercel
```

**Option B: Import from GitHub**

1. Go to https://vercel.com/new
2. Click "Import Git Repository"
3. Select your Porshi repository
4. Click "Import"
5. Environment variables are auto-detected from `vercel.json`
6. Click "Deploy"

### Step 2: Set Environment Variables

In Vercel Dashboard:

1. Go to your project → Settings → Environment Variables
2. Add these variables:

```
DATABASE_URL: <your-database-url>  # Optional, use in-memory for testing
APP_URL: https://your-deployment.vercel.app
ENCRYPTION_KEY: <random-32-char-string>
FCM_SERVER_KEY: <firebase-cloud-messaging-key>  # Optional
```

### Step 3: Verify Backend Is Running

Test the health endpoint:

```bash
curl https://your-deployment.vercel.app/api/health
```

Expected response:
```json
{
  "status": "ok",
  "service": "porshi-chat-backend",
  "timestamp": 1234567890
}
```

### Step 4: Test Message Sync API

**Send a message:**
```bash
curl -X POST https://your-deployment.vercel.app/api/sync-chat \
  -H "Content-Type: application/json" \
  -d '{
    "senderId": "user-1",
    "senderName": "Alice",
    "recipientId": "user-2",
    "text": "Hello from Alice!",
    "timestamp": '$(date +%s)'000
  }'
```

**Retrieve messages:**
```bash
curl "https://your-deployment.vercel.app/api/sync-chat?userId=user-1&recipientId=user-2&limit=50"
```

**Update user profile:**
```bash
curl -X PUT https://your-deployment.vercel.app/api/sync-chat \
  -H "Content-Type: application/json" \
  -d '{
    "userId": "user-1",
    "name": "Alice",
    "bio": "Hello from Porshi!",
    "avatar": "👩‍💻"
  }'
```

---

## Integration Guide

### Connect React Frontend to Vercel Backend

1. **Install dependencies** (if not already done):
```bash
npm install
```

2. **Create `.env` file** in project root:
```
VITE_API_URL=https://your-deployment.vercel.app/api
```

3. **Update `src/App.tsx`** to use enhanced DeviceContext:

Instead of:
```typescript
import { DeviceProvider } from "@/context/DeviceContext";
```

Use:
```typescript
import { DeviceProvider } from "@/context/DeviceContextWithAPI";
```

4. **Update ChatScreen.tsx** to use `sendMessage` API:

Replace the simulated message handler:
```typescript
// Old: Manual addMessage
// New: Use API
const handleSendMessage = async () => {
  if (!messageText.trim()) return;
  
  setIsLoading(true);
  try {
    await sendMessage(messageText);
    setMessageText('');
  } catch (error) {
    console.error('Failed to send message:', error);
  } finally {
    setIsLoading(false);
  }
};
```

5. **Test the integration:**
```bash
npm run dev
```

### Production Deployment Flow

```
Your Code → GitHub
     ↓
GitHub Actions (Build APK) → Artifacts
     ↓
Vercel (Automatic Deploy) ← Webhook
     ↓
Backend API Running ✅
```

---

## API Endpoints Reference

### Health Check
```
GET /api/health
```
Returns service status

### Send/Sync Message
```
POST /api/sync-chat
Body: {
  senderId: string,
  senderName: string,
  recipientId: string,
  text: string,
  timestamp: number
}
```
Returns: `{ success: boolean, messageId: string, message: object }`

### Get Chat History
```
GET /api/sync-chat?userId=xxx&recipientId=yyy&limit=50&offset=0
```
Returns: `{ messages: Message[], messageCount: number, hasMore: boolean }`

### Update User Profile
```
PUT /api/sync-chat
Body: {
  userId: string,
  name: string,
  bio: string,
  avatar: string
}
```
Returns: `{ success: boolean, user: object }`

### Delete Message
```
DELETE /api/sync-chat?messageId=xxx&userId=xxx
```
Returns: `{ success: boolean, deleted: boolean }`

### Push Notifications
```
POST /api/notify
Body: {
  recipientId: string,
  senderId: string,
  senderName: string,
  messagePreview: string
}
```

### Poll Messages (Fallback)
```
GET /api/notify?userId=xxx&since=timestamp
```

---

## Monitoring & Logs

### GitHub Actions Logs
1. Go to Actions tab
2. Click workflow run
3. Expand step to see logs

### Vercel Logs
1. Go to https://vercel.com
2. Select your project
3. Go to `Deployments` tab
4. Click deployment
5. View build and function logs

**Real-time function logs:**
```bash
vercel logs
```

---

## Troubleshooting

### GitHub Actions Build Fails

**Issue: "Android SDK not found"**
```
Solution: The workflow automatically sets up Android SDK
Make sure `android/local.properties` exists in your repo
```

**Issue: "Gradle build failed"**
```
Solution: 
1. Check Gradle sync
2. Ensure Java 17+ is installed
3. Try: ./gradlew clean build
```

**Issue: "APK not generated"**
```
Solution:
1. Check app/build.gradle configuration
2. Ensure keystore is set up for release builds
3. Review build logs for specific errors
```

### Vercel Deployment Issues

**Issue: "Function timeout"**
```
Solution: Increase timeout in vercel.json:
"functions": {
  "api/**/*.js": {
    "maxDuration": 120  // Increase from 60
  }
}
```

**Issue: "CORS errors"**
```
Solution: Update headers in vercel.json and API files
Ensure Access-Control-Allow-Origin is set correctly
```

**Issue: "Out of memory"**
```
Solution: Reduce memory usage or increase function memory:
"functions": {
  "api/**/*.js": {
    "memory": 1024  // Increase from 512
  }
}
```

### Integration Issues

**Issue: "API calls return 404"**
```
Solution:
1. Verify VITE_API_URL is set correctly
2. Check Vercel deployment is active
3. Test endpoint with curl first
```

**Issue: "Messages not syncing"**
```
Solution:
1. Check browser console for errors
2. Verify userId and recipientId are correct
3. Check Vercel function logs
4. Ensure network connectivity
```

**Issue: "CORS blocked requests"**
```
Solution:
1. Verify API headers allow your origin
2. For development, VITE_API_URL might differ from production
3. Use proxy in development if needed:
   npm install -D http-proxy-middleware
```

---

## Next Steps

1. **Set up Database** (PostgreSQL, MongoDB, Firebase)
   - Update `api/sync-chat.js` to use real database instead of in-memory
   - Add Prisma or TypeORM for ORM

2. **Implement Firebase Cloud Messaging**
   - Add real push notifications
   - Update `api/notify.js` with FCM integration

3. **Add Authentication**
   - Implement JWT tokens
   - Secure API endpoints with auth middleware

4. **Enable Bluetooth/WiFi Direct**
   - For React Native: Use `react-native-nearby-connectivity`
   - Keep Vercel backend for offline message queue

5. **Add Data Encryption**
   - Implement E2E encryption for messages
   - Use crypto libraries for secure communication

---

## Support & Resources

- **GitHub Actions Docs**: https://docs.github.com/actions
- **Vercel Docs**: https://vercel.com/docs
- **Expo EAS Build**: https://docs.expo.dev/build/
- **Firebase Cloud Messaging**: https://firebase.google.com/docs/cloud-messaging
- **React Native Guide**: https://reactnative.dev/docs/getting-started

---

## File Structure Reference

```
.github/
└── workflows/
    └── android-build.yml          ✅ GitHub Actions workflow

api/
├── sync-chat.js                    ✅ Message sync endpoint
├── notify.js                       ✅ Notification endpoint
└── health.js                       ✅ Health check endpoint

client/
├── context/
│   ├── DeviceContext.tsx           (Original, simulated)
│   └── DeviceContextWithAPI.tsx    (With Vercel integration)
├── pages/
│   ├── ChatScreen.tsx              (Use sendMessage API)
│   └── ...
└── ...

vercel.json                         ✅ Vercel config
SETUP_GITHUB_VERCEL.md             ✅ This file
```

---

**Last Updated:** 2024
**Version:** 1.0.0
**Status:** Production Ready ✅
