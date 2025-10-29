// Unified translate caller: prefer window.TRANSLATE_ENDPOINT, fallback to a hardcoded default.
// TODO: 如需切换端点，可在页面里提前设置 window.TRANSLATE_ENDPOINT = 'https://<your-production-domain>/api/translate';
const TRANSLATE_ENDPOINT =
  (typeof window !== 'undefined' && window.TRANSLATE_ENDPOINT)
    ? window.TRANSLATE_ENDPOINT
    : 'https://translation-proxy-oizxhi497-coriolanus-mins-projects.vercel.app/api/translate';

let isEnglish = true;
const translationCache = Object.create(null);

// 调用你的代理：接受 { text, targetLanguage }，读取 { translated }。
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

async function translateText(text) {
  const s = String(text ?? '');
  if (!s.trim()) return s;

  const cacheKey = isEnglish ? s : translationCache[s];
  if (cacheKey && translationCache[cacheKey]) return translationCache[cacheKey];

  const translatedText = await callTranslate(s, 'zh-CN');

  // 双向缓存，便于切回原文
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

// Explicitly bind to window for inline onclick handlers
window.toggleLanguage = safeToggleLanguage;
window.safeToggleLanguage = safeToggleLanguage;

// 初始按钮提示和事件监听器作为后备
document.addEventListener('DOMContentLoaded', () => {
  const button = document.querySelector('.language-switch button');
  if (button) {
    button.title = isEnglish ? '中' : 'En';
    // Add click listener as fallback if inline onclick fails
    button.addEventListener('click', function(e) {
      // Only handle if not already handled by onclick
      if (!e.defaultPrevented && window.toggleLanguage) {
        window.toggleLanguage();
      }
    });
  }
});
