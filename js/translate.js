let isEnglish = true;
const translationCache = {};

// 检查是否缺少必要的环境变量
function checkEnvironmentVariables() {
    const missingVars = [];
    // 在浏览器环境中检查全局变量而不是 process.env
    if (typeof TRANSLATOR_API_KEY === 'undefined') missingVars.push('TRANSLATOR_API_KEY');
    if (typeof TRANSLATOR_LOCATION === 'undefined') missingVars.push('TRANSLATOR_LOCATION');
    
    if (missingVars.length > 0) {
        console.error('Missing required environment variables:', missingVars.join(', '));
        return false;
    }
    return true;
}

async function translateText(text) {
    if (!text.trim()) return text;
    
    const cacheKey = isEnglish ? text : translationCache[text];
    if (translationCache[cacheKey]) {
        return translationCache[cacheKey];
    }

    try {
        // Remove server-side environment variable check - not applicable in browser
        const response = await fetch('https://grizzled-spiral-mantis.glitch.me/api/translate', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ text, to: "zh-CN" })
        });

        if (!response.ok) {
            throw new Error(`Translation API error: ${response.status}`);
        }

        const data = await response.json();
        const translatedText = data[0].translations[0].text;
        
        // Store in cache both ways
        translationCache[text] = translatedText;
        translationCache[translatedText] = text;
        
        return translatedText;
    } catch (error) {
        console.error('Translation error:', error);
        // 显示用户友好的错误消息
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
