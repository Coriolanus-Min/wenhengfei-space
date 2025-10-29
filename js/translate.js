// Use window.TRANSLATE_ENDPOINT if set, otherwise default to the proxy
const TRANSLATE_ENDPOINT = window.TRANSLATE_ENDPOINT || 'https://translation-proxy-97s8lczou-coriolanus-mins-projects.vercel.app/api/translate';

let isEnglish = true;
const translationCache = {};

/**
 * Call the translation proxy endpoint
 * @param {string} text - Text to translate
 * @param {string} targetLanguage - Target language code (e.g., 'zh-CN', 'en')
 * @returns {Promise<string>} Translated text
 */
async function callTranslate(text, targetLanguage) {
    if (!text.trim()) return text;
    
    try {
        const response = await fetch(TRANSLATE_ENDPOINT, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ 
                text: text,
                targetLanguage: targetLanguage 
            })
        });

        if (!response.ok) {
            throw new Error(`Translation API error: ${response.status}`);
        }

        const data = await response.json();
        return data.translated || text;
    } catch (error) {
        console.error('Translation error:', error);
        return text;
    }
}

/**
 * Translate text with caching
 * @param {string} text - Text to translate
 * @returns {Promise<string>} Translated text
 */
async function translateText(text) {
    if (!text.trim()) return text;
    
    // Check cache first
    const cacheKey = text;
    if (translationCache[cacheKey]) {
        return translationCache[cacheKey];
    }

    try {
        // Determine target language based on current state
        const targetLanguage = isEnglish ? 'zh-CN' : 'en';
        const translatedText = await callTranslate(text, targetLanguage);
        
        // Store in cache both ways for bidirectional translation
        translationCache[text] = translatedText;
        translationCache[translatedText] = text;
        
        return translatedText;
    } catch (error) {
        console.error('Translation error:', error);
        // Show user-friendly error message
        const errorMessage = document.createElement('div');
        errorMessage.className = 'translation-error';
        errorMessage.textContent = 'Translation temporarily unavailable';
        errorMessage.style.cssText = 'position: fixed; top: 20px; right: 20px; background: #f44336; color: white; padding: 12px 20px; border-radius: 4px; z-index: 10000;';
        document.body.appendChild(errorMessage);
        setTimeout(() => errorMessage.remove(), 3000);
        return text;
    }
}

/**
 * Toggle page language between English and Chinese
 * Translates all text nodes and updates the UI
 */
async function toggleLanguage() {
    const button = document.querySelector('.language-switch button');
    if (!button) return;
    
    const icon = button.querySelector('i');
    button.disabled = true;
    if (icon) {
        icon.className = 'fas fa-spinner fa-spin';
    }
    
    try {
        // Get all text nodes that are not in script or style tags
        const textNodes = document.evaluate(
            '//text()[not(ancestor::script) and not(ancestor::style)]',
            document,
            null,
            XPathResult.UNORDERED_NODE_SNAPSHOT_TYPE,
            null
        );

        // Translate each text node
        for (let i = 0; i < textNodes.snapshotLength; i++) {
            const node = textNodes.snapshotItem(i);
            const trimmedText = node.nodeValue.trim();
            if (trimmedText) {
                const translatedText = await translateText(node.nodeValue);
                node.nodeValue = translatedText;
            }
        }

        // Toggle language state
        isEnglish = !isEnglish;
        
        // Update button UI
        if (icon) {
            button.textContent = '';
            button.appendChild(icon);
        }
        button.title = isEnglish ? 'Switch to Chinese (中)' : 'Switch to English (En)';
    } catch (error) {
        console.error('Toggle language error:', error);
        // Show error to user
        alert('Translation failed. Please try again.');
    } finally {
        button.disabled = false;
        if (icon) {
            icon.className = 'fas fa-language';
        }
    }
}

// Initialize button on page load
document.addEventListener('DOMContentLoaded', () => {
    const button = document.querySelector('.language-switch button');
    if (button) {
        button.title = isEnglish ? 'Switch to Chinese (中)' : 'Switch to English (En)';
    }
});
