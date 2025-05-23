require('dotenv').config();
const TRANSLATOR_KEY = process.env.MICROSOFT_TRANSLATOR_KEY;
const TRANSLATOR_REGION = process.env.MICROSOFT_TRANSLATOR_REGION;

// 默认语言设置
export const defaultLanguage = 'en';

// 默认英文内容
const defaultTranslations = {
    'switchLang': 'Switch to Chinese',
    'nav-home': 'Home',
    'nav-work': 'Work',
    'nav-hobbies': 'Hobbies',
    'nav-articles': 'Articles',
    'nav-portfolio': 'Portfolio',
    'nav-contact': 'Contact',
    'hero-title': 'Web Developer & Designer',
    'hero-description': 'Welcome to my personal website. Here I share my professional work, personal interests, and thoughts.',
    'about-title': 'About Me',
    'about-p1': 'Here you can learn more about me in detail. I share my background, education, career journey, and what drives me. This section helps visitors better understand me and my perspective.',
    'about-p2': 'You can learn about my values, philosophy, and how I work. What makes me different? What principles guide my professional and personal life? This is an opportunity to build a deeper connection with the audience.',
    'about-p3': 'This includes important milestones, achievements, or transformative experiences that have shaped who I am today. The goal is to create an authentic self-presentation that resonates with visitors.',
    'featured-work': 'Featured Work',
    'project1-title': 'Project Title 1',
    'project1-desc': 'Brief project description',
    'project2-title': 'Project Title 2',
    'project2-desc': 'Brief project description',
    'project3-title': 'Project Title 3',
    'project3-desc': 'Brief project description',
    'view-portfolio': 'View Full Portfolio',
    'latest-articles': 'Latest Articles',
    'article1-title': 'Article Title 1',
    'article1-desc': 'This is a brief summary of the first article. It gives readers an idea of what the article is about and entices them to read more.',
    'article2-title': 'Article Title 2',
    'article2-desc': 'This is a brief summary of the second article. It gives readers an idea of what the article is about and entices them to read more.',
    'read-more': 'Read More',
    'view-articles': 'View All Articles',
    'copyright': '© 2025 Wen Hengfei. All rights reserved.',
    'existing-key': 'Existing Text',
    'new-key': 'New Text to Translate'
};

class TranslationService {
    constructor() {
        this.currentLanguage = localStorage.getItem('preferredLanguage') || 'en';
        this.translations = {};
        this.loading = false;
        
        // 初始化时立即翻译页面
        document.addEventListener('DOMContentLoaded', () => {
            this.updatePageTranslations();
        });
    }

    async translate(text, targetLang = 'zh-CN') {
        if (!TRANSLATOR_KEY) {
            console.warn('Translation API key not set');
            return text;
        }

        try {
            const response = await fetch('https://grizzled-spiral-mantis.glitch.me/api/translate', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ text, to: zh-CN })
});
            if (!response.ok) {
                throw new Error(`Translation failed: ${response.statusText}`);
            }

            const data = await response.json();
            return data[0]?.translations[0]?.text || text;
        } catch (error) {
            console.error('Translation error:', error);
            return text;
        }
    }

    async translateObject(obj, targetLang) {
        const translated = {};
        for (const [key, value] of Object.entries(obj)) {
            if (typeof value === 'string') {
                translated[key] = await this.translate(value, targetLang);
            } else if (typeof value === 'object') {
                translated[key] = await this.translateObject(value, targetLang);
            } else {
                translated[key] = value;
            }
        }
        return translated;
    }

    async updatePageTranslations() {
        if (this.loading) return;
        
        this.loading = true;
        this.updateLoadingState(true);
        
        const elements = document.querySelectorAll('[data-translate]');
        
        try {
            if (this.currentLanguage === 'en') {
                // 使用默认英文
                elements.forEach(el => {
                    const key = el.getAttribute('data-translate');
                    el.textContent = defaultTranslations[key] || key;
                });
            } else {
                // 如果没有缓存的翻译，获取新的翻译
                if (!this.translations[this.currentLanguage]) {
                    this.translations[this.currentLanguage] = await this.translateObject(defaultTranslations, this.currentLanguage);
                }
                
                // 更新页面文本
                elements.forEach(el => {
                    const key = el.getAttribute('data-translate');
                    el.textContent = this.translations[this.currentLanguage][key] || key;
                });
            }
        } catch (error) {
            console.error('Failed to update translations:', error);
            // 出错时使用默认英文
            elements.forEach(el => {
                const key = el.getAttribute('data-translate');
                el.textContent = defaultTranslations[key] || key;
            });
        } finally {
            this.loading = false;
            this.updateLoadingState(false);
            this.updateLanguageButton();
        }
    }

    updateLoadingState(isLoading) {
        const btn = document.getElementById('translateBtn');
        if (btn) {
            btn.disabled = isLoading;
            if (isLoading) {
                btn.classList.add('loading');
            } else {
                btn.classList.remove('loading');
            }
        }
    }

    updateLanguageButton() {
        const btn = document.getElementById('translateBtn');
        if (btn) {
            const span = btn.querySelector('span');
            if (span) {
                span.textContent = this.currentLanguage === 'en' ? '中文' : 'English';
            }
        }
    }

    async toggleLanguage() {
        if (this.loading) return;
        
        this.currentLanguage = this.currentLanguage === 'en' ? 'zh-CN' : 'en';
        localStorage.setItem('preferredLanguage', this.currentLanguage);
        await this.updatePageTranslations();
    }
}

// 创建全局翻译服务实例
window.translationService = new TranslationService();

// 获取翻译的函数
export async function getTranslations(lang = 'en') {
    if (lang === 'en') {
        return defaultTranslations;
    }
    
    try {
        return await window.translationService.translateObject(defaultTranslations, lang);
    } catch (error) {
        console.error('Failed to get translations:', error);
        return defaultTranslations;
    }
}

// 当页面加载完成时初始化翻译
document.addEventListener('DOMContentLoaded', () => {
    window.translationService.updatePageTranslations();
});

window.translationService.toggleLanguage(); // 切换语言
