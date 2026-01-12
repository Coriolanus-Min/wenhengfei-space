// Notion Configuration - Updated for Public Pages
// Modern approach using Notion's public publishing feature

const NOTION_CONFIG = {
    // Public Notion Pages Approach (Recommended & Active)
    // 1. In Notion: Share → Publish to web → Copy public URL
    // 2. Add URLs to articles.json with "notionUrl" property
    // 3. Articles will open directly in Notion's public pages
    
    // API Integration (Optional - only needed for advanced database features)
    // SECURITY NOTICE: Never commit real API tokens to version control
    // Set these as environment variables or use a secure configuration method
    NOTION_TOKEN: '', // Empty by default for client-side usage
    ARTICLES_DATABASE_ID: '23c727d0d1bf804bb40efa350a1256c4', // Extracted from your URL
    PROJECTS_DATABASE_ID: '23c727d0d1bf805dac99dfe721e83123', // Extracted from your URL
    
    // Feature toggles
    USE_PUBLIC_PAGES: true, // ✅ ACTIVE - Uses public Notion pages
    USE_API_INTEGRATION: false, // ❌ DISABLED - No complex API calls needed
    FALLBACK_TO_JSON: true // ✅ ACTIVE - Always keep JSON as backup
};

// Security validation
if (typeof window !== 'undefined' && NOTION_CONFIG.NOTION_TOKEN) {
    console.warn('WARNING: API token is exposed in client-side code. Consider using server-side integration for production.');
}

// Export for use in other files
if (typeof module !== 'undefined' && module.exports) {
    module.exports = NOTION_CONFIG;
}

// Make available globally for browser usage
if (typeof window !== 'undefined') {
    window.NOTION_CONFIG = NOTION_CONFIG;
}