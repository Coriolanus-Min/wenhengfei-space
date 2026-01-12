# Personal Profile Website

This is where I share my professional work, personal interests, and thoughts through articles.

## Setup

1. Install dependencies:
```bash
npm install
```

2. Start the development server:
```bash
npm start
```

3. Open in browser:
```
http://localhost:3000
```

## Adding Notion Articles

1. Make your Notion page public
2. Copy the page ID from the share link
3. Add the article information to `data/articles.json`

## Project Structure

- `data/` - JSON data files
- `content/` - Markdown articles
- `js/` - JavaScript files
- `css/` - Stylesheets
- `images/` - Image assets

## Development

The development server will automatically:
- Serve files from the project directory
- Enable live reloading
- Allow JSON file loading
- Support Notion embeds

## Features

### 🌐 Multi-Language Support (NEW!)

**Improved translation system with:**
- Multiple translation services (DeepL, Google Translate, LibreTranslate)
- User manual corrections with cloud sync
- Intelligent caching for better performance
- Free and premium options available

**Quick Start:** See [Quick Start Guide](docs/QUICK_START_TRANSLATION.md) for 5-minute setup!

### 📝 Notion Integration

Seamlessly integrate articles from your Notion workspace.

## Help & Documentation

- **New to Git/GitHub?** Check out our guides:
  - [Pull Request Management Guide](PULL_REQUEST_GUIDE.md) - Complete guide for managing PRs
  - [Merge Conflicts Quick Start](docs/MERGE_CONFLICTS_QUICK_START.md) - Simple visual guide for resolving conflicts
- **Setting up features:**
  - [🌐 Translation Quick Start](docs/QUICK_START_TRANSLATION.md) - **NEW!** Get started in 5 minutes
  - [🌐 Improved Translation Guide](docs/IMPROVED_TRANSLATION_GUIDE.md) - **NEW!** Complete translation guide
  - [Translation Setup (Legacy)](docs/TRANSLATION_SETUP.md) - Original translation setup
  - [Notion Integration](docs/NOTION_SETUP.md) - Notion integration guide
