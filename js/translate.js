let isEnglish = true;
const translationCache = {};
const errorLogged = new Set();

// Get the translation endpoint
function getTranslationEndpoint() {
    return window.TRANSLATE_ENDPOINT || 'https://translation-proxy-97s8lczou-coriolanus-mins-projects.vercel.app/api/translate';
}

async function translateText(text) {
    if (!text.trim()) return text;
    
    // Check bidirectional cache
    if (translationCache[text]) {
        return translationCache[text];
    }

    try {
        const targetLanguage = isEnglish ? 'zh-CN' : 'en';
        const endpoint = getTranslationEndpoint();
        
        const response = await fetch(endpoint, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ text, targetLanguage })
        });

        if (!response.ok) {
            throw new Error(`Translation API error: ${response.status}`);
        }

        const data = await response.json();
        const translatedText = data.translated;
        
        // Store in bidirectional cache
        translationCache[text] = translatedText;
        translationCache[translatedText] = text;
        
        return translatedText;
    } catch (error) {
        // Log error only once per unique error message
        const errorKey = error.message;
        if (!errorLogged.has(errorKey)) {
            console.error('Translation error:', error);
            errorLogged.add(errorKey);
        }
        // Fall back to original text
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
