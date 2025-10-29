// Use unified translation proxy endpoint
const TRANSLATE_ENDPOINT = window.TRANSLATE_ENDPOINT || 'https://translation-proxy-97s8lczou-coriolanus-mins-projects.vercel.app/api/translate';

let isEnglish = true;
const translationCache = {};

// Call the translation proxy with the new request/response shape
async function callTranslate(text, to) {
    if (!text.trim()) return text;
    
    try {
        const response = await fetch(TRANSLATE_ENDPOINT, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ 
                text: text,
                targetLanguage: to 
            })
        });

        if (!response.ok) {
            throw new Error(`Translation API error: ${response.status}`);
        }

        const data = await response.json();
        return data.translated;
    } catch (error) {
        console.error('Translation error:', error);
        throw error;
    }
}

async function translateText(text) {
    if (!text.trim()) return text;
    
    // Check cache first
    const cacheKey = isEnglish ? text : translationCache[text];
    if (translationCache[cacheKey]) {
        return translationCache[cacheKey];
    }

    try {
        const targetLang = isEnglish ? 'zh-CN' : 'en';
        const translatedText = await callTranslate(text, targetLang);
        
        // Store in cache both ways for bidirectional lookup
        translationCache[text] = translatedText;
        translationCache[translatedText] = text;
        
        return translatedText;
    } catch (error) {
        console.error('Translation error:', error);
        // Display user-friendly error message
        const errorMessage = document.createElement('div');
        errorMessage.className = 'translation-error';
        errorMessage.textContent = '暂不可用';
        document.body.appendChild(errorMessage);
        setTimeout(() => errorMessage.remove(), 3000);
        return text;
    }
}

async function toggleLanguage() {
    const button = document.querySelector('.language-switch button');
    const icon = button.querySelector('i');
    button.disabled = true;
    icon.className = 'fas fa-spinner fa-spin'; // 添加加载动画
    
    try {
        const textNodes = document.evaluate(
            '//text()[not(ancestor::script) and not(ancestor::style)]',
            document,
            null,
            XPathResult.UNORDERED_NODE_SNAPSHOT_TYPE,
            null
        );

        for (let i = 0; i < textNodes.snapshotLength; i++) {
            const node = textNodes.snapshotItem(i);
            if (node.nodeValue.trim()) {
                const translatedText = await translateText(node.nodeValue);
                node.nodeValue = translatedText;
            }
        }

        isEnglish = !isEnglish;
        // 移除文字提示，只使用图标
        button.textContent = '';
        button.appendChild(icon); // 重新添加图标
    } catch (error) {
        console.error('Toggle language error:', error);
    } finally {
        button.disabled = false;
        icon.className = 'fas fa-language'; // 恢复原始图标
    }
}

// 初始化按钮提示文本
document.addEventListener('DOMContentLoaded', () => {
    const button = document.querySelector('.language-switch button');
    if (button) {
        button.title = isEnglish ? '中' : 'En';
    }
});
