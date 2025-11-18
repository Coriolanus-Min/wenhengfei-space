// Unified translate caller: prefer window.TRANSLATE_ENDPOINT, fallback to a hardcoded default
const TRANSLATE_ENDPOINT =
  (typeof window !== 'undefined' && window.TRANSLATE_ENDPOINT)
    ? window.TRANSLATE_ENDPOINT
    : 'https://translation-proxy-oizxhi497-coriolanus-mins-projects.vercel.app/api/translate';

let isEnglish = true;

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
    // 遍历可见文本节点（排除 script/style）
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
        // 英 -> 中
        node.nodeValue = await translateText(val);
      } else {
        // 中 -> 英（反向缓存还原）
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
document.addEventListener('DOMContentLoaded', () => {
  const button = document.querySelector('.language-switch button');
  if (button) {
    button.title = isEnglish ? '中' : 'En';
  }
});
