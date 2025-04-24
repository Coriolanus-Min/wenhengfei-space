let isEnglish = true;
const translationCache = {};

// 检查是否缺少必要的环境变量
function checkEnvironmentVariables() {
    const missingVars = [];
    if (!process.env.TRANSLATOR_API_KEY) missingVars.push('TRANSLATOR_API_KEY');
    if (!process.env.TRANSLATOR_LOCATION) missingVars.push('TRANSLATOR_LOCATION');
    
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
        if (!checkEnvironmentVariables()) {
            throw new Error('Missing required environment variables');
        }

        const response = await fetch(`https://api.cognitive.microsofttranslator.com/translate?api-version=3.0&from=${isEnglish ? 'en' : 'zh-Hans'}&to=${isEnglish ? 'zh-Hans' : 'en'}`, {
            method: 'POST',
            headers: {
                'Ocp-Apim-Subscription-Key': process.env.TRANSLATOR_API_KEY,
                'Ocp-Apim-Subscription-Region': process.env.TRANSLATOR_LOCATION,
                'Content-type': 'application/json',
            },
            body: JSON.stringify([{ text }]),
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
        errorMessage.textContent = '翻译服务暂时不可用，请稍后再试';
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
        button.textContent = isEnglish ? '中文' : 'English';
        button.insertBefore(icon, button.firstChild); // 保持图标在文本前面
    } catch (error) {
        console.error('Toggle language error:', error);
    } finally {
        button.disabled = false;
        icon.className = 'fas fa-language'; // 恢复原始图标
    }
} 