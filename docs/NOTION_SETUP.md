# Notion Integration Setup Guide

## 🚀 Quick Start

Your website now supports dynamic content loading from Notion! Here's how to set it up:

## Step 1: Create Notion Integration

1. Go to [https://www.notion.so/my-integrations](https://www.notion.so/my-integrations)
2. Click "Create new integration"
3. Name it "Website Integration" 
4. Select your workspace
5. Copy the **Integration Token** (starts with `secret_`)

## Step 2: Create Notion Databases

### Articles Database
Create a new database with these properties:
- **Title** (Title) - Article title
- **Summary** (Text) - Brief description  
- **Date** (Date) - Publication date
- **Status** (Select) - Options: "Draft", "Published"
- **Tags** (Multi-select) - Article categories
- **Featured** (Checkbox) - Show on homepage

### Projects Database  
Create another database with these properties:
- **Project Name** (Title) - Project title
- **Description** (Text) - Project description
- **Image** (Files & media) - Project cover image
- **Tech Stack** (Multi-select) - Technologies used
- **Live URL** (URL) - Live demo link
- **GitHub URL** (URL) - GitHub repository
- **Featured** (Checkbox) - Show on homepage

## Step 3: Share Databases with Integration

1. Go to each database page
2. Click "Share" in top-right
3. "Invite" your integration
4. Copy the database ID from the URL:
   `https://notion.so/DATABASE_ID?v=...`

## Step 4: Configure Your Website

Edit `js/notion-config.js`:

```javascript
const NOTION_CONFIG = {
    NOTION_TOKEN: 'secret_YOUR_ACTUAL_TOKEN_HERE',
    ARTICLES_DATABASE_ID: 'your-articles-database-id-here',
    PROJECTS_DATABASE_ID: 'your-projects-database-id-here',
    ENABLE_NOTION_INTEGRATION: true, // Enable Notion
    FALLBACK_TO_JSON: true // Keep JSON as backup
};
```

## Step 5: Add Content

### Add Articles:
1. Create new pages in your Articles database
2. Set Status to "Published"
3. Check "Featured" for homepage display
4. Add content using Notion's rich editor

### Add Projects:
1. Create new pages in your Projects database  
2. Upload cover images
3. Add tech stack tags
4. Include live/GitHub URLs
5. Check "Featured" for homepage display

## Step 6: Deploy

1. Commit and push your changes:
```bash
git add .
git commit -m "Add Notion integration"
git push
```

2. Your website will now:
   - ✅ Load articles from Notion automatically
   - ✅ Show featured content on homepage
   - ✅ Link directly to Notion pages
   - ✅ Fallback to JSON if Notion is unavailable

## 🔧 Troubleshooting

### CORS Issues
If you get CORS errors, the integration includes a CORS proxy. For production, consider:
- Setting up your own CORS proxy
- Using a serverless function (Vercel, Netlify)
- Moving API calls to server-side

### Database Not Found
- Ensure the integration has access to your databases
- Double-check database IDs in the configuration
- Verify the integration token is correct

### Content Not Loading
- Check browser console for errors
- Ensure "Status" is set to "Published" for articles
- Verify database property names match exactly

## 🎯 Benefits

- **Write in Notion**: Use Notion's powerful editor
- **Auto-sync**: Content updates automatically
- **No coding**: Add articles without touching code
- **Rich content**: Full Notion formatting support
- **Backup**: JSON files as fallback system

## 🔄 Workflow

1. **Write** articles in Notion
2. **Set** status to "Published" 
3. **Check** "Featured" for homepage
4. **Content** appears automatically on your website!

Your Trump trade war article is already configured and will load once you set up the Notion integration!
