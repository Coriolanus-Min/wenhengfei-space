class ArticleManager {
    constructor() {
        this.articles = [];
        this.container = document.querySelector('.articles-container');
    }

    async init() {
        try {
            const response = await fetch('/data/articles.json');
            const data = await response.json();
            this.articles = data.articles;
            await this.displayArticles();
            // 初始化 Notion 嵌入
            if (window.notionReady) {
                this.setupNotionEmbeds();
            } else {
                this.loadNotionScript();
            }
        } catch (error) {
            console.error('Error loading articles:', error);
        }
    }

    loadNotionScript() {
        // 加载 Notion 官方嵌入脚本
        const script = document.createElement('script');
        script.src = 'https://embed.notion.com/embed.js';
        script.onload = () => {
            this.setupNotionEmbeds();
        };
        document.head.appendChild(script);
    }

    setupNotionEmbeds() {
        // 初始化所有 Notion 嵌入块
        const embeds = document.querySelectorAll('.notion-embed');
        embeds.forEach(embed => {
            if (window.notion) {
                window.notion.embedBlock(embed);
            }
        });
    }

    async loadArticleContent(contentPath) {
        try {
            const response = await fetch(contentPath);
            return await response.text();
        } catch (error) {
            console.error('Error loading article content:', error);
            return null;
        }
    }

    formatDate(dateString) {
        const options = { year: 'numeric', month: 'long', day: 'numeric' };
        return new Date(dateString).toLocaleDateString(undefined, options);
    }

    createNotionEmbed(notionId) {
        // 使用 Notion 官方的嵌入格式
        return `<div class="notion-embed"
                     data-notion-id="${notionId}"
                     style="width: 100%; min-height: 600px;">
                </div>`;
    }

    createArticleElement(article) {
        const articleElement = document.createElement('div');
        articleElement.className = 'article';
        
        let contentHtml = '';
        if (article.type === 'notion') {
            contentHtml = `
                <div class="article-header">
                    <div class="article-date">${this.formatDate(article.date)}</div>
                    <h3 class="article-title">${article.title}</h3>
                    <div class="article-tags">
                        ${article.tags.map(tag => `<span class="tag">${tag}</span>`).join('')}
                    </div>
                </div>
                <div class="article-content notion-content">
                    ${this.createNotionEmbed(article.notionId)}
                </div>`;
        } else {
            contentHtml = `
                <div class="article-date">${this.formatDate(article.date)}</div>
                <h3 class="article-title">${article.title}</h3>
                <p>${article.summary}</p>
                <div class="article-tags">
                    ${article.tags.map(tag => `<span class="tag">${tag}</span>`).join('')}
                </div>
                <a href="/article/${article.id}" class="read-more">Read Full Article</a>`;
        }

        articleElement.innerHTML = contentHtml;
        return articleElement;
    }

    async displayArticles() {
        if (!this.container) return;
        
        // Clear existing content
        this.container.innerHTML = '';

        // Add articles
        for (const article of this.articles) {
            const articleElement = this.createArticleElement(article);
            this.container.appendChild(articleElement);
        }
    }
}

// Initialize article manager when the page loads
document.addEventListener('DOMContentLoaded', () => {
    const articleManager = new ArticleManager();
    articleManager.init();
}); 