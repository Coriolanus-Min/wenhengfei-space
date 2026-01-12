/**
 * 改进的翻译服务
 * 功能：
 * 1. 多翻译源支持（DeepL、Google、LibreTranslate）
 * 2. 本地和云端缓存
 * 3. 用户手动校正功能
 * 4. 批量翻译优化
 */

// 配置API端点
const TRANSLATE_ENDPOINT = window.TRANSLATE_ENDPOINT || 'https://wenhengfei-space.vercel.app/api/translate-improved';
const CACHE_ENDPOINT = window.CACHE_ENDPOINT || 'https://wenhengfei-space.vercel.app/api/translation-cache';

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
    'about-p1': 'Here you can learn more about me in detail. I share my background, education, career journey, and what drives me.',
    'about-p2': 'You can learn about my values, philosophy, and how I work. What makes me different? What principles guide my professional and personal life?',
    'about-p3': 'This includes important milestones, achievements, or transformative experiences that have shaped who I am today.',
    'featured-work': 'Featured Work',
    'latest-articles': 'Latest Articles',
    'read-more': 'Read More',
    'view-portfolio': 'View Full Portfolio',
    'view-articles': 'View All Articles',
    'copyright': '© 2025 Wen Hengfei. All rights reserved.'
};

class ImprovedTranslationService {
    constructor() {
        this.currentLanguage = localStorage.getItem('preferredLanguage') || 'en';
        this.localCache = this.loadLocalCache();
        this.userCorrections = this.loadUserCorrections();
        this.loading = false;
        this.preferredService = localStorage.getItem('preferredTranslationService') || 'auto';
        
        // 初始化
        this.syncWithCloud();
        
        // 页面加载时更新翻译
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => this.updatePageTranslations());
        } else {
            this.updatePageTranslations();
        }
    }

    /**
     * 从 localStorage 加载本地缓存
     */
    loadLocalCache() {
        try {
            const cache = localStorage.getItem('translationCache');
            return cache ? JSON.parse(cache) : {};
        } catch (e) {
            console.error('Failed to load local cache:', e);
            return {};
        }
    }

    /**
     * 保存本地缓存到 localStorage
     */
    saveLocalCache() {
        try {
            localStorage.setItem('translationCache', JSON.stringify(this.localCache));
        } catch (e) {
            console.error('Failed to save local cache:', e);
        }
    }

    /**
     * 从 localStorage 加载用户校正
     */
    loadUserCorrections() {
        try {
            const corrections = localStorage.getItem('userCorrections');
            return corrections ? JSON.parse(corrections) : {};
        } catch (e) {
            console.error('Failed to load user corrections:', e);
            return {};
        }
    }

    /**
     * 保存用户校正到 localStorage
     */
    saveUserCorrections() {
        try {
            localStorage.setItem('userCorrections', JSON.stringify(this.userCorrections));
        } catch (e) {
            console.error('Failed to save user corrections:', e);
        }
    }

    /**
     * 生成缓存键
     */
    getCacheKey(text, targetLang) {
        return `en:${targetLang}:${text}`;
    }

    /**
     * 从缓存获取翻译（优先用户校正）
     */
    getCachedTranslation(text, targetLang) {
        const key = this.getCacheKey(text, targetLang);
        
        // 优先返回用户校正
        if (this.userCorrections[key]) {
            return {
                text: this.userCorrections[key],
                source: 'user-correction'
            };
        }
        
        // 返回缓存
        if (this.localCache[key]) {
            return {
                text: this.localCache[key],
                source: 'cache'
            };
        }
        
        return null;
    }

    /**
     * 保存翻译到缓存
     */
    saveToCache(text, targetLang, translation, isUserCorrection = false) {
        const key = this.getCacheKey(text, targetLang);
        
        if (isUserCorrection) {
            this.userCorrections[key] = translation;
            this.saveUserCorrections();
            // 同步到云端
            this.syncCorrectionToCloud(text, 'en', targetLang, translation);
        } else {
            this.localCache[key] = translation;
            this.saveLocalCache();
        }
    }

    /**
     * 翻译单个文本
     */
    async translate(text, targetLang = 'zh-CN') {
        if (!text || !text.trim()) return text;
        
        // 检查缓存
        const cached = this.getCachedTranslation(text, targetLang);
        if (cached) {
            return cached.text;
        }
        
        try {
            // 调用API翻译
            const response = await fetch(TRANSLATE_ENDPOINT, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    text,
                    targetLanguage: targetLang,
                    preferredService: this.preferredService === 'auto' ? null : this.preferredService
                })
            });
            
            if (!response.ok) {
                throw new Error(`Translation API error: ${response.status}`);
            }
            
            const data = await response.json();
            const translatedText = data.translated;
            
            // 保存到缓存
            this.saveToCache(text, targetLang, translatedText, false);
            
            return translatedText;
        } catch (error) {
            console.error('Translation error:', error);
            return text; // 失败时返回原文
        }
    }

    /**
     * 批量翻译（优化性能）
     */
    async translateBatch(texts, targetLang = 'zh-CN') {
        const results = [];
        const textsToTranslate = [];
        const indices = [];
        
        // 先从缓存获取
        for (let i = 0; i < texts.length; i++) {
            const text = texts[i];
            const cached = this.getCachedTranslation(text, targetLang);
            
            if (cached) {
                results[i] = cached.text;
            } else {
                textsToTranslate.push(text);
                indices.push(i);
            }
        }
        
        // 批量翻译未缓存的文本
        if (textsToTranslate.length > 0) {
            const translations = await Promise.all(
                textsToTranslate.map(text => this.translate(text, targetLang))
            );
            
            translations.forEach((translation, idx) => {
                results[indices[idx]] = translation;
            });
        }
        
        return results;
    }

    /**
     * 更新页面所有翻译
     */
    async updatePageTranslations() {
        if (this.loading) return;
        
        this.loading = true;
        this.updateLoadingState(true);
        
        const elements = document.querySelectorAll('[data-translate]');
        
        try {
            if (this.currentLanguage === 'en') {
                // 显示英文
                elements.forEach(el => {
                    const key = el.getAttribute('data-translate');
                    el.textContent = defaultTranslations[key] || key;
                });
            } else {
                // 批量翻译
                const keys = Array.from(elements).map(el => 
                    el.getAttribute('data-translate')
                );
                const texts = keys.map(key => defaultTranslations[key] || key);
                
                const translations = await this.translateBatch(texts, this.currentLanguage);
                
                // 更新页面
                elements.forEach((el, index) => {
                    el.textContent = translations[index];
                    
                    // 添加双击编辑功能
                    this.makeEditable(el, keys[index], translations[index]);
                });
            }
        } catch (error) {
            console.error('Failed to update translations:', error);
            this.showError('翻译失败，请稍后重试');
        } finally {
            this.loading = false;
            this.updateLoadingState(false);
            this.updateLanguageButton();
        }
    }

    /**
     * 使元素可编辑（双击编辑翻译）
     */
    makeEditable(element, key, currentTranslation) {
        // 移除旧的监听器
        element.removeEventListener('dblclick', element._editHandler);
        
        // 创建新的监听器
        element._editHandler = () => {
            if (this.currentLanguage === 'en') return; // 只在中文模式下可编辑
            
            const originalText = defaultTranslations[key] || key;
            const newTranslation = prompt(
                `编辑翻译\n原文: ${originalText}\n\n当前翻译:`,
                currentTranslation
            );
            
            if (newTranslation && newTranslation !== currentTranslation) {
                // 保存用户校正
                this.saveToCache(originalText, this.currentLanguage, newTranslation, true);
                element.textContent = newTranslation;
                this.showSuccess('翻译已保存并同步到云端');
            }
        };
        
        element.addEventListener('dblclick', element._editHandler);
        element.style.cursor = this.currentLanguage === 'en' ? 'default' : 'pointer';
        element.title = this.currentLanguage === 'en' ? '' : '双击编辑翻译';
    }

    /**
     * 切换语言
     */
    async toggleLanguage() {
        if (this.loading) return;
        
        this.currentLanguage = this.currentLanguage === 'en' ? 'zh-CN' : 'en';
        localStorage.setItem('preferredLanguage', this.currentLanguage);
        await this.updatePageTranslations();
    }

    /**
     * 同步用户校正到云端
     */
    async syncCorrectionToCloud(text, sourceLang, targetLang, translation) {
        try {
            await fetch(CACHE_ENDPOINT, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    action: 'save',
                    text,
                    sourceLang,
                    targetLang,
                    translation,
                    isUserCorrection: true
                })
            });
        } catch (error) {
            console.error('Failed to sync correction to cloud:', error);
        }
    }

    /**
     * 从云端同步用户校正
     */
    async syncWithCloud() {
        try {
            // 导出本地校正到云端
            const localCorrections = Object.entries(this.userCorrections).map(([key, translation]) => {
                const [sourceLang, targetLang, ...textParts] = key.split(':');
                return {
                    text: textParts.join(':'),
                    sourceLang,
                    targetLang,
                    translation
                };
            });
            
            if (localCorrections.length > 0) {
                await fetch(CACHE_ENDPOINT, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        action: 'import',
                        corrections: localCorrections
                    })
                });
            }
            
            // 从云端导入校正
            const response = await fetch(CACHE_ENDPOINT, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ action: 'export' })
            });
            
            if (response.ok) {
                const data = await response.json();
                data.corrections.forEach(({ text, sourceLang, targetLang, translation }) => {
                    const key = this.getCacheKey(text, targetLang);
                    this.userCorrections[key] = translation;
                });
                this.saveUserCorrections();
            }
        } catch (error) {
            console.error('Failed to sync with cloud:', error);
        }
    }

    /**
     * 更新加载状态
     */
    updateLoadingState(isLoading) {
        const btn = document.getElementById('translateBtn') || document.querySelector('.language-switch button');
        if (btn) {
            btn.disabled = isLoading;
            const icon = btn.querySelector('i');
            if (icon) {
                icon.className = isLoading ? 'fas fa-spinner fa-spin' : 'fas fa-language';
            }
        }
    }

    /**
     * 更新语言按钮
     */
    updateLanguageButton() {
        const btn = document.getElementById('translateBtn') || document.querySelector('.language-switch button');
        if (btn) {
            btn.title = this.currentLanguage === 'en' ? '中文' : 'English';
        }
    }

    /**
     * 显示错误消息
     */
    showError(message) {
        this.showMessage(message, 'error');
    }

    /**
     * 显示成功消息
     */
    showSuccess(message) {
        this.showMessage(message, 'success');
    }

    /**
     * 显示消息
     */
    showMessage(message, type = 'info') {
        const existing = document.querySelector('.translation-message');
        if (existing) existing.remove();
        
        const msgDiv = document.createElement('div');
        msgDiv.className = `translation-message translation-message-${type}`;
        msgDiv.textContent = message;
        msgDiv.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            padding: 12px 20px;
            border-radius: 8px;
            background: ${type === 'error' ? '#f44336' : type === 'success' ? '#4caf50' : '#2196f3'};
            color: white;
            font-size: 14px;
            box-shadow: 0 4px 12px rgba(0,0,0,0.15);
            z-index: 10000;
            animation: slideIn 0.3s ease-out;
        `;
        
        document.body.appendChild(msgDiv);
        setTimeout(() => {
            msgDiv.style.animation = 'slideOut 0.3s ease-out';
            setTimeout(() => msgDiv.remove(), 300);
        }, 3000);
    }

    /**
     * 设置首选翻译服务
     */
    setPreferredService(service) {
        this.preferredService = service;
        localStorage.setItem('preferredTranslationService', service);
    }

    /**
     * 获取翻译统计
     */
    getStats() {
        return {
            cacheSize: Object.keys(this.localCache).length,
            correctionsCount: Object.keys(this.userCorrections).length,
            currentLanguage: this.currentLanguage,
            preferredService: this.preferredService
        };
    }
}

// 添加CSS动画
const style = document.createElement('style');
style.textContent = `
    @keyframes slideIn {
        from {
            transform: translateX(400px);
            opacity: 0;
        }
        to {
            transform: translateX(0);
            opacity: 1;
        }
    }
    
    @keyframes slideOut {
        from {
            transform: translateX(0);
            opacity: 1;
        }
        to {
            transform: translateX(400px);
            opacity: 0;
        }
    }
`;
document.head.appendChild(style);

// 创建全局实例
window.translationService = new ImprovedTranslationService();

// 导出函数供外部使用
window.toggleLanguage = () => window.translationService.toggleLanguage();
window.getTranslationStats = () => window.translationService.getStats();
window.setPreferredTranslationService = (service) => window.translationService.setPreferredService(service);
