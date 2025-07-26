// Notion Configuration - Updated for Public Pages
// Modern approach using Notion's public publishing feature

const NOTION_CONFIG = {
    // Public Notion Pages Approach (Recommended & Active)
    // 1. In Notion: Share → Publish to web → Copy public URL
    // 2. Add URLs to articles.json with "notionUrl" property
    // 3. Articles will open directly in Notion's public pages
    
    // API Integration (Optional - only needed for advanced database features)
    // You can ignore these unless you want to pull content automatically from Notion databases
    NOTION_TOKEN: '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',
    ARTICLES_DATABASE_ID: '23c727d0d1bf804bb40efa350a1256c4', // Extracted from your URL
    PROJECTS_DATABASE_ID: '23c727d0d1bf805dac99dfe721e83123', // Extracted from your URL
    
    // Feature toggles
    USE_PUBLIC_PAGES: true, // ✅ ACTIVE - Uses public Notion pages
    USE_API_INTEGRATION: false, // ❌ DISABLED - No complex API calls needed
    FALLBACK_TO_JSON: true // ✅ ACTIVE - Always keep JSON as backup
};

// Export for use in other files
if (typeof module !== 'undefined' && module.exports) {
    module.exports = NOTION_CONFIG;
}
