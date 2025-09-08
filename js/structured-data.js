// Structured data for SEO
document.addEventListener('DOMContentLoaded', function() {
    // Person schema
    const personSchema = {
        "@context": "https://schema.org",
        "@type": "Person",
        "name": "Wen Hengfei",
        "jobTitle": "Web Developer & Designer",
        "url": "https://wenhengfei.space",
        "sameAs": [
            "https://github.com/yourusername",
            "https://linkedin.com/in/yourusername",
            "https://twitter.com/yourusername"
        ],
        "worksFor": {
            "@type": "Organization",
            "name": "Freelance"
        }
    };

    // Website schema
    const websiteSchema = {
        "@context": "https://schema.org",
        "@type": "WebSite",
        "name": "Wen Hengfei - Web Developer & Designer",
        "url": "https://wenhengfei.space",
        "description": "Personal website of Wen Hengfei, a web developer and designer. View portfolio, articles, and professional work.",
        "publisher": {
            "@type": "Person",
            "name": "Wen Hengfei"
        }
    };

    // Add structured data to page
    function addStructuredData(data) {
        const script = document.createElement('script');
        script.type = 'application/ld+json';
        script.textContent = JSON.stringify(data);
        document.head.appendChild(script);
    }

    // Add schemas based on current page
    const currentPage = window.location.pathname.split('/').pop();
    
    // Always add person and website schema
    addStructuredData(personSchema);
    addStructuredData(websiteSchema);

    // Add page-specific schemas
    if (currentPage === 'work.html' || currentPage === '') {
        const workSchema = {
            "@context": "https://schema.org",
            "@type": "ProfilePage",
            "name": "Professional Experience - Wen Hengfei",
            "url": "https://wenhengfei.space/work.html",
            "mainEntity": personSchema
        };
        addStructuredData(workSchema);
    } else if (currentPage === 'portfolio.html') {
        const portfolioSchema = {
            "@context": "https://schema.org",
            "@type": "CollectionPage",
            "name": "Portfolio - Wen Hengfei",
            "url": "https://wenhengfei.space/portfolio.html",
            "description": "Portfolio showcase of web development and design projects"
        };
        addStructuredData(portfolioSchema);
    } else if (currentPage === 'articles.html') {
        const articlesSchema = {
            "@context": "https://schema.org",
            "@type": "Blog",
            "name": "Articles - Wen Hengfei",
            "url": "https://wenhengfei.space/articles.html",
            "description": "Technical articles and thoughts on web development and design"
        };
        addStructuredData(articlesSchema);
    }
});
