# Translation Fix Guide

## Problem Identified

When clicking the translate button, you see the error message **"暂不可用"** (temporarily unavailable) because:

1. The translation API endpoint (`/api/translate`) is returning a **500 error**
2. The Google Translate API key is not configured in Vercel
3. The current endpoint only supports Google Translate (no fallback)

## Solutions Implemented

I've made the following changes to fix this issue:

### 1. Switched to Improved Translation API ✅

**File:** `js/translate.js`

Changed from:
```javascript
const TRANSLATE_ENDPOINT = 'https://wenhengfei-space.vercel.app/api/translate';
```

To:
```javascript
const TRANSLATE_ENDPOINT = 'https://wenhengfei-space.vercel.app/api/translate-improved';
```

**Why?** The improved API (`api/translate-improved.js`) includes:
- ✅ DeepL (highest quality, requires key)
- ✅ Google Translate (requires key)  
- ✅ **LibreTranslate (FREE, no key required)** - Used as fallback

### 2. Better Error Messages ✅

Changed error message from:
```
暂不可用
```

To:
```
翻译服务暂不可用 (Translation temporarily unavailable)
```

Also increased display time from 3 to 5 seconds and added better error logging.

## How to Deploy These Changes

Since your site is hosted on Vercel, you need to push these changes to your GitHub repository. Here are the steps:

### Option 1: Initialize Git and Connect to GitHub (Recommended)

1. **Initialize git repository:**
   ```bash
   git init
   git add .
   git commit -m "Fix translation API endpoint to use improved version with free fallback"
   ```

2. **Create a new repository on GitHub:**
   - Go to https://github.com/new
   - Create a new repository (e.g., `wenhengfei-space`)
   - Don't initialize with README (we already have one)

3. **Connect and push:**
   ```bash
   git remote add origin https://github.com/YOUR_USERNAME/wenhengfei-space.git
   git branch -M main
   git push -u origin main
   ```

4. **Deploy on Vercel:**
   - Your Vercel project should auto-deploy when you push to GitHub
   - Or manually trigger a deployment from Vercel dashboard

### Option 2: Direct Upload to Vercel

If you deployed directly without Git:

1. Install Vercel CLI:
   ```bash
   npm install -g vercel
   ```

2. Deploy:
   ```bash
   vercel --prod
   ```

## Testing the Fix

After deployment, test by:

1. Visit your website
2. Click the translate icon (🌐)
3. The translation should work using LibreTranslate (free service)
4. Or you'll see the improved error message

## Optional: Add API Keys for Better Translation Quality

The free LibreTranslate works, but if you want higher quality translations:

### Add DeepL API Key (Recommended - Best Quality)

1. Get a free API key at: https://www.deepl.com/pro-api
2. In Vercel Dashboard → Your Project → Settings → Environment Variables
3. Add: `DEEPL_API_KEY` = your key
4. Add: `DEEPL_FREE_ACCOUNT` = `true`
5. Redeploy

### Add Google Translate API Key (Alternative)

1. Get API key from: https://cloud.google.com/translate
2. In Vercel Dashboard → Your Project → Settings → Environment Variables
3. Add: `GOOGLE_TRANSLATE_API_KEY` = your key
4. Redeploy

## Current Status

- ✅ Code fixed locally
- ⏳ Waiting for deployment to production

---

**Need help?** Check these docs:
- [Translation Quick Start](docs/QUICK_START_TRANSLATION.md)
- [Improved Translation Guide](docs/IMPROVED_TRANSLATION_GUIDE.md)
