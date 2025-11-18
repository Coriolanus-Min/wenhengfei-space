
// js/translate.js

let isEnglish = true;
const translationCache = Object.create(null);

async function translateText(text, targetLang) {
    const cacheKey = `${text}-${targetLang}`;
    if (translationCache[cacheKey]) {
        return translationCache[cacheKey];
    }

    try {
        const response = await fetch('/api/translate', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ text, targetLang }),
        });

        if (!response.ok) {
            throw new Error(`API error: ${response.status}`);
        }

        const data = await response.json();
        const translatedText = data.data.translations[0].translatedText;
        
        // Store in cache
        translationCache[cacheKey] = translatedText;
        
        return translatedText;
    } catch (error) {
        console.error('Translation error:', error);
        // Return original text if translation fails
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
