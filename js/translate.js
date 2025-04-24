let isEnglish = true;
const translationCache = {};

async function translateText(text) {
    if (!text.trim()) return text;
    
    const cacheKey = isEnglish ? text : translationCache[text];
    if (translationCache[cacheKey]) {
        return translationCache[cacheKey];
    }

    const subscriptionKey = 'YOUR_MICROSOFT_TRANSLATOR_KEY';
    const endpoint = 'https://api.cognitive.microsofttranslator.com';
    const location = 'YOUR_LOCATION';

    try {
        const response = await fetch(`${endpoint}/translate?api-version=3.0&from=${isEnglish ? 'en' : 'zh-Hans'}&to=${isEnglish ? 'zh-Hans' : 'en'}`, {
            method: 'POST',
            headers: {
                'Ocp-Apim-Subscription-Key': subscriptionKey,
                'Ocp-Apim-Subscription-Region': location,
                'Content-type': 'application/json',
            },
            body: JSON.stringify([{ text }]),
        });

        const data = await response.json();
        const translatedText = data[0].translations[0].text;
        
        // Store in cache both ways
        translationCache[text] = translatedText;
        translationCache[translatedText] = text;
        
        return translatedText;
    } catch (error) {
        console.error('Translation error:', error);
        return text;
    }
}

async function toggleLanguage() {
    const button = document.querySelector('.language-switch button');
    button.disabled = true;
    
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
    } catch (error) {
        console.error('Toggle language error:', error);
    } finally {
        button.disabled = false;
    }
} 