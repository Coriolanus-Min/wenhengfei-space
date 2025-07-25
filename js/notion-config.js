// Notion Configuration
// Replace these with your actual Notion credentials and database IDs

const NOTION_CONFIG = {
    // Get your integration token from: https://www.notion.so/my-integrations
    NOTION_TOKEN: 'YOUR_NOTION_TOKEN_HERE',
    
    // Database IDs - Get these from your Notion database URLs
    ARTICLES_DATABASE_ID: 'YOUR_ARTICLES_DATABASE_ID_HERE',
    PROJECTS_DATABASE_ID: 'YOUR_PROJECTS_DATABASE_ID_HERE',
    
    // CORS Proxy (needed for browser requests to Notion API)
    // You can use a service like https://cors-anywhere.herokuapp.com/ or set up your own
    CORS_PROXY: 'https://cors-anywhere.herokuapp.com/',
    
    // Enable/disable features
    ENABLE_NOTION_INTEGRATION: false, // Set to true once you configure everything above
    FALLBACK_TO_JSON: true // Always keep JSON as fallback
};

// Export for use in other files
if (typeof module !== 'undefined' && module.exports) {
    module.exports = NOTION_CONFIG;
}
