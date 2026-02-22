// Static pre-translated JSON approach — zero runtime API calls
let isEnglish = true;
let translationsData = null;

// Load translations JSON (cached after first load)
async function loadTranslations() {
    if (translationsData) return translationsData;
    try {
        const res = await fetch('/data/translations-zh.json');
        if (!res.ok) throw new Error(res.status);
        translationsData = await res.json();
        return translationsData;
    } catch (err) {
        console.error('Failed to load translations:', err);
        return null;
    }
}

window.toggleLanguage = async function toggleLanguage() {
    const button = document.querySelector('.language-switch button');
    let icon = null;

    if (button) {
        icon = button.querySelector('i');
        button.disabled = true;
        if (icon) icon.className = 'fas fa-spinner fa-spin';
    }

    try {
        isEnglish = !isEnglish;
        const elements = document.querySelectorAll('[data-translate]');

        if (isEnglish) {
            // Switch back to English — restore originals
            for (const el of elements) {
                if (el.dataset.originalText) {
                    el.textContent = el.dataset.originalText;
                }
            }
        } else {
            // Switch to Chinese — use pre-translated JSON
            const data = await loadTranslations();
            if (!data) {
                isEnglish = true; // revert
                return;
            }

            for (const el of elements) {
                if (!el.dataset.originalText) {
                    el.dataset.originalText = el.textContent;
                }
                const key = el.getAttribute('data-translate');
                if (data[key] && data[key].zh) {
                    el.textContent = data[key].zh;
                }
            }
        }

        if (button) {
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
};

document.addEventListener('DOMContentLoaded', () => {
    const langButton = document.querySelector('.language-switch button');
    if (langButton) {
        langButton.addEventListener('click', window.toggleLanguage);
        langButton.title = '中文';
    }
    // Preload translations so toggle is instant
    loadTranslations();
});
