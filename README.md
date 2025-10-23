# wenhengfei-space

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
