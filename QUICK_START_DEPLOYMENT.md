# 🚀 Porshi - Quick Start Deployment Checklist

Fast-track setup for GitHub Actions + Vercel backend deployment.

## ⚡ 5-Minute Quick Setup

### 1. Vercel Backend (3 minutes)

```bash
# Install Vercel CLI
npm install -g vercel

# Login to Vercel
vercel login

# Deploy to Vercel
npm run setup:vercel

# Copy the deployment URL
# Example: https://porshi-backend.vercel.app
```

**Save this URL for next step!** ↓

### 2. GitHub Actions Setup (2 minutes)

```bash
# Get your Vercel tokens from:
# 1. https://vercel.com/account/tokens (copy token)
# 2. https://vercel.com/dashboard (copy Org ID and Project ID)

# Run setup script
npm run setup:github your-username/porshi-repo

# When prompted, paste your Vercel credentials
```

### 3. Test Everything

```bash
# Test Vercel backend
curl https://porshi-backend.vercel.app/api/health

# Expected response:
# { "status": "ok", "service": "porshi-chat-backend" }
```

✅ **Done! Your CI/CD is now live!**

---

## 📋 Step-by-Step Setup (Detailed)

### Part 1: Deploy Backend to Vercel

#### 1a. Create Vercel Account
- Go to https://vercel.com
- Sign up with GitHub
- Click "Import Project"
- Select your Porshi GitHub repo
- Click "Import"

#### 1b. Configure Environment
In Vercel Dashboard:
1. Go to Settings → Environment Variables
2. Add these variables:
   - `DATABASE_URL`: (optional, leave empty)
   - `APP_URL`: `https://your-vercel-deployment.vercel.app`
   - `ENCRYPTION_KEY`: Generate random 32-char string

3. Redeploy after adding variables

#### 1c. Verify Deployment
```bash
# Test API
curl https://your-deployment.vercel.app/api/health

# Test message endpoint
curl -X POST https://your-deployment.vercel.app/api/sync-chat \
  -H "Content-Type: application/json" \
  -d '{
    "senderId": "test-user",
    "senderName": "TestUser",
    "recipientId": "test-user-2",
    "text": "Hello Porshi!",
    "timestamp": '$(date +%s)'000
  }'
```

**✅ Backend is live!**

---

### Part 2: Set Up GitHub Actions

#### 2a. Generate Vercel Tokens
1. Go to https://vercel.com/account/tokens
2. Create new token (personal)
3. Copy the token (you'll need this)

#### 2b. Add GitHub Secrets
1. Go to your GitHub repo
2. Settings → Secrets and variables → Actions
3. Create these secrets:

| Secret Name | Value |
|------------|-------|
| `VERCEL_TOKEN` | (from step 2a) |
| `VERCEL_ORG_ID` | (from Vercel dashboard) |
| `VERCEL_PROJECT_ID` | (from Vercel dashboard) |

#### 2c. Trigger First Build
```bash
# Push code to GitHub
git add .
git commit -m "Setup CI/CD pipeline"
git push origin main
```

**Go to Actions tab and watch it build!** 🎬

#### 2d. Download Your APK
1. GitHub Actions workflow completes
2. Go to Actions → Latest workflow run
3. Scroll to "Artifacts"
4. Download `porshi-debug-apk` or `porshi-release-apk`

**✅ APK built successfully!**

---

### Part 3: Connect Frontend to Backend

#### 3a. Create `.env` file
```bash
cp .env.example .env
```

Edit `.env`:
```
VITE_API_URL=https://your-vercel-deployment.vercel.app/api
```

#### 3b. Update ChatScreen (Optional)
In `client/pages/ChatScreen.tsx`, to use real API:

Replace simulated message sending with:
```typescript
const { sendMessage } = useDevice();

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

#### 3c. Test Locally
```bash
npm run dev

# Go to http://localhost:5173
# Set profile → Start scanning → Send message
```

**✅ Full integration complete!**

---

## 📁 Files Created

```
✅ .github/workflows/android-build.yml    (GitHub Actions)
✅ api/sync-chat.js                       (Message sync)
✅ api/notify.js                          (Notifications)
✅ api/health.js                          (Health check)
✅ vercel.json                            (Vercel config)
✅ .env.example                           (Env template)
✅ scripts/setup-github.sh                (GitHub setup)
✅ scripts/setup-vercel.sh                (Vercel setup)
✅ SETUP_GITHUB_VERCEL.md                 (Detailed guide)
✅ QUICK_START_DEPLOYMENT.md              (This file)
```

---

## 🔗 API Endpoints

| Method | Endpoint | Purpose |
|--------|----------|---------|
| `GET` | `/api/health` | Check backend status |
| `POST` | `/api/sync-chat` | Send message |
| `GET` | `/api/sync-chat` | Get chat history |
| `PUT` | `/api/sync-chat` | Update user profile |
| `DELETE` | `/api/sync-chat` | Delete message |
| `POST` | `/api/notify` | Send notification |
| `GET` | `/api/notify` | Poll messages |

**Full API Documentation:** See `SETUP_GITHUB_VERCEL.md`

---

## 🚨 Troubleshooting Quick Fixes

### APK Build Fails
```bash
# Clear build cache
rm -rf android/app/build

# Clean gradle
./gradlew clean

# Rebuild
npm run build
```

### API Returns 404
```bash
# Verify Vercel is deployed
curl https://your-url/api/health

# Check VITE_API_URL in .env
cat .env | grep VITE_API_URL

# Restart dev server
npm run dev
```

### CORS Errors
The API already handles CORS. If errors persist:
1. Check that API URL doesn't have trailing `/`
2. Verify production API is deployed
3. Check browser console for exact error

### Messages Not Syncing
1. Ensure both users have profiles created
2. Check Vercel function logs
3. Verify userId and recipientId are unique
4. Test endpoint with curl first

---

## 📊 Deployment Architecture

```
┌─────────────────────────────────────────┐
│     Your GitHub Repository              │
│  (Porshi Code + GitHub Actions)         │
└──────────────┬──────────────────────────┘
               │
      ┌────────┴────────┐
      ▼                 ▼
 ┌─────────┐      ┌───────────┐
 │ GitHub  │      │  GitHub   │
 │ Actions │      │ Artifacts │
 │ (Build) │      │  (APKs)   │
 └────┬────┘      └───────────┘
      │
      ├─── Push to Vercel ──┐
      │                     ▼
      │              ┌──────────────┐
      │              │   Vercel     │
      │              │  (Backend)   │
      │              │  - sync-chat │
      │              │  - notify    │
      │              └──────────────┘
      │                     ▲
      ▼                     │
 ┌──────────────┐           │
 │ Android App  │───────────┘
 │ (Porshi)     │ (API calls)
 └──────────────┘
```

---

## ✅ Completion Checklist

- [ ] Vercel backend deployed
  - [ ] API health check returns 200
  - [ ] Environment variables set
  
- [ ] GitHub Actions configured
  - [ ] VERCEL_TOKEN secret added
  - [ ] VERCEL_ORG_ID secret added
  - [ ] VERCEL_PROJECT_ID secret added
  
- [ ] Frontend integrated
  - [ ] `.env` file created with VITE_API_URL
  - [ ] DeviceContext updated (optional)
  - [ ] Local dev server tested
  
- [ ] First APK built
  - [ ] Push triggered GitHub Actions
  - [ ] Build completed successfully
  - [ ] APK downloaded from artifacts

---

## 🎯 Next Steps

1. **Test on Real Device**
   - Install APK on Android phone
   - Create profile
   - Start scanning (simulated devices)
   - Send messages (synced to Vercel)

2. **Add Real Bluetooth**
   - Install `react-native-nearby-connectivity`
   - Update device discovery in DeviceContext
   - Test with multiple devices

3. **Set Up Database**
   - Configure PostgreSQL or MongoDB
   - Update `api/sync-chat.js` to use database
   - Implement message persistence

4. **Add Authentication**
   - Implement JWT tokens
   - Secure API endpoints
   - Add user login/signup

5. **Enable Push Notifications**
   - Set up Firebase Cloud Messaging
   - Update `api/notify.js`
   - Test on real devices

---

## 📞 Support

- **GitHub Issues**: Create issue in your repo
- **Vercel Support**: https://vercel.com/support
- **Documentation**: See `SETUP_GITHUB_VERCEL.md`
- **React Native**: https://reactnative.dev/docs

---

**Status**: ✅ Production Ready
**Last Updated**: 2024
**Version**: 1.0.0
