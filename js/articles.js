class ArticleManager {
    constructor() {
        this.articles = [];
        this.container = document.querySelector('.articles-container');
        this.notionLoadRetries = 0;
        this.maxRetries = 3;
    }

    async init() {
        try {
            await this.loadArticles();
            await this.displayArticles();
            await this.initializeNotion();
        } catch (error) {
            console.error('Error initializing ArticleManager:', error);
            this.showError('无法加载文章，请稍后再试');
        }
    }

    async loadArticles() {
        try {
            const response = await fetch('/data/articles.json');
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            const data = await response.json();
            this.articles = data.articles;
        } catch (error) {
            console.error('Error loading articles:', error);
            throw new Error('Failed to load articles data');
        }
    }

    async initializeNotion() {
        if (window.notionReady) {
            await this.setupNotionEmbeds();
            return;
        }

        try {
            await this.loadNotionScript();
        } catch (error) {
            console.error('Error loading Notion script:', error);
            if (this.notionLoadRetries < this.maxRetries) {
                this.notionLoadRetries++;
                console.log(`Retrying Notion script load (${this.notionLoadRetries}/${this.maxRetries})`);
                setTimeout(() => this.initializeNotion(), 2000);
            } else {
                this.showError('Notion 内容暂时无法加载，请刷新页面重试');
            }
        }
    }

    loadNotionScript() {
        return new Promise((resolve, reject) => {
            const script = document.createElement('script');
            script.src = 'https://embed.notion.com/embed.js';
            script.async = true;
            
            script.onload = () => {
                window.notionReady = true;
                this.setupNotionEmbeds().then(resolve);
            };
            
            script.onerror = () => {
                reject(new Error('Failed to load Notion script'));
            };

            document.head.appendChild(script);
        });
    }

    async setupNotionEmbeds() {
        const embeds = document.querySelectorAll('.notion-embed');
        for (const embed of embeds) {
            try {
                if (window.notion) {
                    await window.notion.embedBlock(embed);
                    // 添加加载状态指示器
                    const loader = embed.querySelector('.notion-loader');
                    if (loader) {
                        loader.style.display = 'none';
                    }
                }
            } catch (error) {
                console.error('Error setting up Notion embed:', error);
                this.showEmbedError(embed);
            }
        }
    }

    showEmbedError(embed) {
        const errorDiv = document.createElement('div');
        errorDiv.className = 'notion-error';
        errorDiv.innerHTML = `
            <p>无法加载 Notion 内容</p>
            <button onclick="location.reload()">重试</button>
        `;
        embed.appendChild(errorDiv);
    }

    showError(message) {
        const errorDiv = document.createElement('div');
        errorDiv.className = 'error-message';
        errorDiv.textContent = message;
        this.container.appendChild(errorDiv);
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
        return `
            <div class="notion-embed-wrapper">
                <div class="notion-loader">
                    <div class="spinner"></div>
                    <p>加载中...</p>
                </div>
                <div class="notion-embed"
                     data-notion-id="${notionId}"
                     style="width: 100%; min-height: 600px;">
                </div>
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