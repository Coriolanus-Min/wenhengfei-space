// Unified translate caller: prefer window.TRANSLATE_ENDPOINT, fallback to a hardcoded default
const TRANSLATE_ENDPOINT =
  (typeof window !== 'undefined' && window.TRANSLATE_ENDPOINT)
    ? window.TRANSLATE_ENDPOINT
    : 'https://translation-proxy-oizxhi497-coriolanus-mins-projects.vercel.app/api/translate';

let isEnglish = true;
const translationCache = Object.create(null);

// Call the proxy API: accepts { text, targetLanguage }, returns { translated }.
async function callTranslate(text, to = 'zh-CN') {
  try {
    const res = await fetch(TRANSLATE_ENDPOINT, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text, targetLanguage: to }),
      cache: 'no-store'
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) throw new Error(data?.error || res.statusText);
    return (data && typeof data.translated === 'string') ? data.translated : text;
  } catch (e) {
    console.error('Translation error:', e);
    return text;
  }
}

// Check if text is worth translating (skip numbers, single chars, special symbols)
function isTranslatable(text) {
  const s = text.trim();
  if (s.length <= 1) return false; // Skip single characters
  if (/^[\d\s\.,;:!?()[\]{}\-_+=*&^%$#@~`|\\/<>'"]+$/.test(s)) return false; // Skip numbers and punctuation only
  return true;
}

async function translateText(text) {
  const s = String(text ?? '');
  if (!s.trim()) return s;
  
  // Skip non-translatable content
  if (!isTranslatable(s)) return s;

  const cacheKey = isEnglish ? s : translationCache[s];
  if (cacheKey && translationCache[cacheKey]) return translationCache[cacheKey];

  const translatedText = await callTranslate(s, 'zh-CN');

  // Bidirectional cache for easy toggling back to original text
  translationCache[s] = translatedText;
  translationCache[translatedText] = s;

  return translatedText;
}
async function safeToggleLanguage() {
  const button = document.querySelector('.language-switch button');
  const icon = button ? button.querySelector('i') : null;
  if (button) {
    button.disabled = true;
    if (icon) icon.className = 'fas fa-spinner fa-spin';
  }

  try {
    // Iterate through visible text nodes (excluding script/style)
    const textNodes = document.evaluate(
      '//text()[not(ancestor::script) and not(ancestor::style)]',
      document,
      null,
      XPathResult.UNORDERED_NODE_SNAPSHOT_TYPE,
      null
    );

    for (let i = 0; i < textNodes.snapshotLength; i++) {
      const node = textNodes.snapshotItem(i);
      const val = node?.nodeValue ?? '';
      if (!val.trim()) continue;
      
      // Skip non-translatable content to reduce API calls
      if (!isTranslatable(val)) continue;

      if (isEnglish) {
        // English to Chinese
        node.nodeValue = await translateText(val);
      } else {
        // Chinese to English (reverse from cache)
        const original = translationCache[val];
        if (typeof original === 'string') node.nodeValue = original;
      }
    }

    isEnglish = !isEnglish;

    if (button) {
      button.title = isEnglish ? '中' : 'En';
      if (icon) {
        button.textContent = '';
        button.appendChild(icon);
      }
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

// Bind to window for inline onclick handlers and prevent override by script.js
window.safeToggleLanguage = safeToggleLanguage;
window.toggleLanguage = safeToggleLanguage;

document.addEventListener('DOMContentLoaded', () => {
  const button = document.querySelector('.language-switch button');
  if (button) {
    button.title = isEnglish ? '中' : 'En';
    // Also attach event listener as backup
    button.addEventListener('click', safeToggleLanguage);
  }
});
