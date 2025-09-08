# Notion Integration Setup Guide

## 🚀 Quick Start with Public Pages (Recommended)

Your website now supports simple integration with Notion's public pages! Here's the easiest way to get started:

## Method 1: Public Notion Pages (Simple & Fast)

### Step 1: Publish Your Notion Page
1. Go to your Notion page (e.g., "China's Plan to Fight Trump's Trade War")
2. Click **"Share"** in the top-right
3. Toggle **"Publish to web"** ON
4. Copy the public URL (e.g., `https://username.notion.site/page-title-123abc`)

### Step 2: Update Your Articles JSON
Edit `data/articles.json` and add the `notionUrl` property:

```json
{
  "articles": [
    {
      "id": "china-trade-war",
      "title": "China's Plan to Fight Trump's Trade War",
      "date": "2024-03-20",
      "type": "notion",
      "notionUrl": "YOUR_PUBLIC_NOTION_URL_HERE",
      "summary": "An analysis of China's strategic response...",
      "tags": ["economics", "politics"],
      "featured": true
    }
  ]
}
```

### Step 3: Push Changes
```bash
git add .
git commit -m "Add public Notion URL for Trump article"
git push
```

**That's it!** Your article will now link directly to your published Notion page.

## Method 2: Advanced API Integration (Optional)

For dynamic content loading from Notion databases:

### Step 1: Create Notion Integration
1. Go to [https://www.notion.so/my-integrations](https://www.notion.so/my-integrations)
2. Click "Create new integration"
3. Copy the integration token

### Step 2: Set Up Databases
Create databases with these properties:

**Articles Database:**
- Title, Summary, Date, Status (Draft/Published), Tags, Featured

**Projects Database:**  
- Project Name, Description, Image, Tech Stack, Live URL, GitHub URL, Featured

### Step 3: Configure Integration
Edit `js/notion-config.js`:
```javascript
const NOTION_CONFIG = {
    USE_API_INTEGRATION: true,
    NOTION_TOKEN: 'your_token_here',
    ARTICLES_DATABASE_ID: 'your_db_id',
    PROJECTS_DATABASE_ID: 'your_db_id'
};
```

## 🎯 Benefits of Public Pages Approach

- ✅ **No API setup required**
- ✅ **Works immediately** 
- ✅ **Full Notion formatting** preserved
- ✅ **Easy to maintain**
- ✅ **Mobile-friendly**
- ✅ **SEO-friendly** (Notion handles this)

## 🔄 Simple Workflow

1. **Write** in Notion
2. **Publish to web** (one click)
3. **Add URL** to articles.json
4. **Push** to GitHub
5. **Article goes live!**

Your Trump trade war article is ready to work with this system!
