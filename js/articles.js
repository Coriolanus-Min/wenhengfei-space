class ArticleManager {
    constructor() {
        this.articles = [];
        this.projects = [];
        this.container = document.querySelector('.articles-container');
        this.notionLoadRetries = 0;
        this.maxRetries = 3;
        this.isHomepage = window.location.pathname === '/' || window.location.pathname.includes('index.html');
        
        // Use configuration from notion-config.js with fallback
        this.config = window.NOTION_CONFIG || (typeof NOTION_CONFIG !== 'undefined' ? NOTION_CONFIG : {
            USE_API_INTEGRATION: false,
            USE_PUBLIC_PAGES: true,
            FALLBACK_TO_JSON: true,
            NOTION_TOKEN: '',
            ARTICLES_DATABASE_ID: '',
            PROJECTS_DATABASE_ID: ''
        });
        
        // Debug logging
        console.log('ArticleManager initialized');
        console.log('Container found:', this.container);
        console.log('Is homepage:', this.isHomepage);
        console.log('Config:', this.config);
    }

    async init() {
        console.log('ArticleManager.init() called');
        try {
            // Use simple JSON loading with public Notion URLs
            console.log('Loading from JSON...');
            await this.loadFromJSON();
            console.log('Articles loaded:', this.articles.length);
            
            console.log('Displaying articles...');
            await this.displayArticles();
            console.log('Articles displayed');
            
            // Only initialize complex Notion embeds for full articles page
            if (!this.isHomepage && this.config.USE_API_INTEGRATION) {
                console.log('Initializing Notion embeds...');
                await this.initializeNotion();
            }
        } catch (error) {
            console.error('Error initializing ArticleManager:', error);
            this.showError('Unable to load articles, please refresh the page');
        }
    }

    async loadFromNotion() {
        try {
            const baseUrl = this.config.CORS_PROXY + 'https://api.notion.com/v1/databases/';
            
            // Load articles from Notion
            const articlesResponse = await fetch(`${baseUrl}${this.config.ARTICLES_DATABASE_ID}/query`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${this.config.NOTION_TOKEN}`,
                    'Notion-Version': '2022-06-28',
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    filter: {
                        property: 'Status',
                        select: {
                            equals: 'Published'
                        }
                    },
                    sorts: [
                        {
                            property: 'Date',
                            direction: 'descending'
                        }
                    ]
                })
            });

            if (articlesResponse.ok) {
                const articlesData = await articlesResponse.json();
                this.articles = this.parseNotionArticles(articlesData.results);
            }

            // Load projects from Notion
            const projectsResponse = await fetch(`${baseUrl}${this.config.PROJECTS_DATABASE_ID}/query`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${this.config.NOTION_TOKEN}`,
                    'Notion-Version': '2022-06-28',
                    'Content-Type': 'application/json'
                }
            });

            if (projectsResponse.ok) {
                const projectsData = await projectsResponse.json();
                this.projects = this.parseNotionProjects(projectsData.results);
            }

        } catch (error) {
            console.error('Error loading from Notion:', error);
            throw error;
        }
    }

    parseNotionArticles(results) {
        return results.map(page => {
            const properties = page.properties;
            return {
                id: page.id,
                title: this.getNotionText(properties.Title),
                summary: this.getNotionText(properties.Summary),
                date: properties.Date?.date?.start || new Date().toISOString(),
                tags: properties.Tags?.multi_select?.map(tag => tag.name) || [],
                featured: properties.Featured?.checkbox || false,
                type: 'notion',
                notionId: page.id,
                url: page.url
            };
        });
    }

    parseNotionProjects(results) {
        return results.map(page => {
            const properties = page.properties;
            return {
                id: page.id,
                name: this.getNotionText(properties['Project Name']),
                description: this.getNotionText(properties.Description),
                techStack: properties['Tech Stack']?.multi_select?.map(tech => tech.name) || [],
                liveUrl: properties['Live URL']?.url,
                githubUrl: properties['GitHub URL']?.url,
                featured: properties.Featured?.checkbox || false,
                image: properties.Image?.files?.[0]?.file?.url || properties.Image?.files?.[0]?.external?.url
            };
        });
    }

    getNotionText(property) {
        if (!property) return '';
        if (property.title) return property.title.map(t => t.plain_text).join('');
        if (property.rich_text) return property.rich_text.map(t => t.plain_text).join('');
        return '';
    }

    async loadFromJSON() {
        try {
            const response = await fetch('data/articles.json');
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            const data = await response.json();
            this.articles = data.articles;
        } catch (error) {
            console.error('Error loading from JSON:', error);
            throw new Error('Failed to load articles data');
        }
    }

    async loadArticles() {
        // This method is now deprecated, replaced by loadFromNotion/loadFromJSON
        return this.loadFromJSON();
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
            // Use direct link to Notion page when API integration is disabled
            if (!this.config.USE_API_INTEGRATION) {
                const articleUrl = article.notionUrl || article.url || `https://notion.so/${article.notionId.replace(/-/g, '')}`;
                contentHtml = `
                    <div class="article-date">${this.formatDate(article.date)}</div>
                    <h3 class="article-title">${article.title}</h3>
                    <p>${article.summary}</p>
                    <div class="article-tags">
                        ${article.tags.map(tag => `<span class="tag">${tag}</span>`).join('')}
                    </div>
                    <a href="${articleUrl}" class="read-more" target="_blank">Read Full Article</a>`;
            } else {
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
            }
        } else {
            contentHtml = `
                <div class="article-date">${this.formatDate(article.date)}</div>
                <h3 class="article-title">${article.title}</h3>
                <p>${article.summary}</p>
                <div class="article-tags">
                    ${article.tags.map(tag => `<span class="tag">${tag}</span>`).join('')}
                </div>
                <a href="${article.content}" class="read-more">Read Full Article</a>`;
        }

        articleElement.innerHTML = contentHtml;
        return articleElement;
    }

    async displayArticles() {
        if (!this.container) return;
        
        // Clear existing content
        this.container.innerHTML = '';

        // On homepage, show only featured articles or first 2 articles
        if (this.isHomepage) {
            let articlesToShow = this.articles.filter(article => article.featured);
            if (articlesToShow.length === 0) {
                articlesToShow = this.articles.slice(0, 2);
            }
            
            for (const article of articlesToShow) {
                const articleElement = this.createSimpleArticleElement(article);
                this.container.appendChild(articleElement);
            }
        } else {
            // On articles page, show all articles with full format
            for (const article of this.articles) {
                const articleElement = this.createArticleElement(article);
                this.container.appendChild(articleElement);
            }
        }
    }

    async displayFeaturedProjects() {
        const projectsContainer = document.querySelector('.portfolio-gallery');
        if (!projectsContainer || this.projects.length === 0) return;

        // Clear existing projects
        projectsContainer.innerHTML = '';

        // Show featured projects or first 3 projects
        let projectsToShow = this.projects.filter(project => project.featured);
        if (projectsToShow.length === 0) {
            projectsToShow = this.projects.slice(0, 3);
        }

        for (const project of projectsToShow) {
            const projectElement = this.createProjectElement(project);
            projectsContainer.appendChild(projectElement);
        }
    }

    createProjectElement(project) {
        const projectElement = document.createElement('div');
        projectElement.className = 'portfolio-item';
        
        const imageUrl = project.image || 'images/portfolio-placeholder-1.jpg';
        const techStackHtml = project.techStack.length > 0 
            ? `<div class="tech-stack">${project.techStack.map(tech => `<span class="tech">${tech}</span>`).join('')}</div>`
            : '';
        
        projectElement.innerHTML = `
            <div class="portfolio-image-container">
                <img src="${imageUrl}" alt="${project.name}" loading="lazy">
                ${project.liveUrl ? `<div class="project-overlay"><a href="${project.liveUrl}" target="_blank" class="project-link">View Live</a></div>` : ''}
            </div>
            <div class="portfolio-caption">
                <h3>${project.name}</h3>
                <p>${project.description}</p>
                ${techStackHtml}
                <div class="project-links">
                    ${project.liveUrl ? `<a href="${project.liveUrl}" target="_blank" class="btn-small">Live Demo</a>` : ''}
                    ${project.githubUrl ? `<a href="${project.githubUrl}" target="_blank" class="btn-small">GitHub</a>` : ''}
                </div>
            </div>
        `;
        
        return projectElement;
    }

    createSimpleArticleElement(article) {
        const articleElement = document.createElement('div');
        articleElement.className = 'article';
        
        let articleUrl;
        let target = '_self';
        
        if (article.type === 'notion') {
            // Use public Notion URL (preferred) or construct from notionId
            articleUrl = article.notionUrl || article.url || `https://notion.so/${article.notionId.replace(/-/g, '')}`;
            target = '_blank';
        } else {
            articleUrl = `articles/${article.id}.html`;
        }
        
        const tagsHtml = article.tags && article.tags.length > 0 
            ? `<div class="article-tags">${article.tags.map(tag => `<span class="tag">${tag}</span>`).join('')}</div>`
            : '';
        
        articleElement.innerHTML = `
            <div class="article-date">${this.formatDate(article.date)}</div>
            <h3 class="article-title">${article.title}</h3>
            <p>${article.summary}</p>
            ${tagsHtml}
            <a href="${articleUrl}" class="read-more" target="${target}">Read More</a>
        `;
        
        return articleElement;
    }
}

// Initialize article manager when the page loads
document.addEventListener('DOMContentLoaded', () => {
    const articleManager = new ArticleManager();
    articleManager.init().then(() => {
        // Also load featured projects on homepage
        if (articleManager.isHomepage && articleManager.projects.length > 0) {
            articleManager.displayFeaturedProjects();
        }
    });
});
