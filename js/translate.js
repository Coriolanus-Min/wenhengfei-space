// Use unified translation proxy endpoint
const TRANSLATE_ENDPOINT = '/api/translate';

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
                text,
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

/**
 * Toggle page language between English and Chinese
 * Translates all text nodes and updates the UI
 */
async function toggleLanguage() {
    const button = document.querySelector('.language-switch button');
    if (button) {
        const icon = button.querySelector('i');
        button.disabled = true;
        if (icon) icon.className = 'fas fa-spinner fa-spin'; // Loading spinner
    }

    isEnglish = !isEnglish;
    const targetLang = isEnglish ? 'en' : 'zh';

    const elementsToTranslate = document.querySelectorAll('[data-translate]');

    for (const element of elementsToTranslate) {
        // Store original text if it's not already stored
        if (!element.dataset.originalText) {
            element.dataset.originalText = element.textContent;
        }

        const originalText = element.dataset.originalText;
        let newText;

        if (isEnglish) {
            // If switching back to English, use the stored original text
            newText = originalText;
        } else {
            // Otherwise, translate the original English text to Chinese
            newText = await translateText(originalText, targetLang);
        }

        element.textContent = newText;
    }

    if (button) {
        button.disabled = false;
        const icon = button.querySelector('i');
        if (icon) icon.className = 'fas fa-language'; // Restore original icon
        button.title = isEnglish ? '中文' : 'English';
    }
  } catch (error) {
    console.error('Toggle language error:', error);
  } finally {
    if (button) {
      button.disabled = false;
      if (icon) icon.className = 'fas fa-language';
    }
  }
}

document.addEventListener('DOMContentLoaded', () => {
    const langButton = document.querySelector('.language-switch button');
    if (langButton) {
        langButton.addEventListener('click', toggleLanguage);
        langButton.title = '中文'; // Initial tooltip
    }
});
