// 统一使用同一代理端点；支持在页面里用 window.TRANSLATE_ENDPOINT 覆盖。
// 建议在页面里提前设置：window.TRANSLATE_ENDPOINT = 'https://你的代理域名/api/translate';
const TRANSLATE_ENDPOINT =
  (typeof window !== 'undefined' && window.TRANSLATE_ENDPOINT)
    ? window.TRANSLATE_ENDPOINT
    : 'https://<your-production-domain>/api/translate';
// 简化：不依赖浏览器“环境变量”或密钥；直接调用代理。
// 与 DOM 解绑默认文案：首次加载时从 [data-translate] 元素采集英文原文，作为默认表。
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

class TranslationService {
  constructor() {
    this.currentLanguage = localStorage.getItem('preferredLanguage') || 'en';
    this.loading = false;
    this.defaults = {};     // { key: 原文 }
    this.translations = {}; // { lang: { key: 译文 } }

    document.addEventListener('DOMContentLoaded', () => {
      // 首次采集当前页面 [data-translate] 的原文，作为英文默认文案
      const elements = document.querySelectorAll('[data-translate]');
      elements.forEach(el => {
        const key = el.getAttribute('data-translate');
        if (key && !(key in this.defaults)) {
          this.defaults[key] = el.textContent || '';
        }
      });
      this.updatePageTranslations();
    });
  }

  async translate(text, targetLang = 'zh-CN') {
    return callTranslate(text, targetLang);
  }

  async translateObject(obj, targetLang) {
    const out = {};
    for (const [key, val] of Object.entries(obj)) {
      if (typeof val === 'string') {
        out[key] = await this.translate(val, targetLang);
      } else if (val && typeof val === 'object') {
        out[key] = await this.translateObject(val, targetLang);
      } else {
        out[key] = val;
      }
    }
    return out;
  }

  async updatePageTranslations() {
    if (this.loading) return;
    this.loading = true;
    this.updateLoadingState(true);

    const elements = document.querySelectorAll('[data-translate]');

    try {
      if (this.currentLanguage === 'en') {
        // 还原英文默认
        elements.forEach(el => {
          const key = el.getAttribute('data-translate');
          el.textContent = this.defaults[key] ?? el.textContent;
        });
      } else {
        // 如果没有该语言的缓存，生成一次
        if (!this.translations[this.currentLanguage]) {
          this.translations[this.currentLanguage] =
            await this.translateObject(this.defaults, this.currentLanguage);
        }
        elements.forEach(el => {
          const key = el.getAttribute('data-translate');
          const m = this.translations[this.currentLanguage] || {};
          el.textContent = m[key] ?? (this.defaults[key] ?? el.textContent);
        });
      }
    } catch (e) {
      console.error('Failed to update translations:', e);
      // 失败则回退英文
      elements.forEach(el => {
        const key = el.getAttribute('data-translate');
        el.textContent = this.defaults[key] ?? el.textContent;
      });
    } finally {
      this.loading = false;
      this.updateLoadingState(false);
      this.updateLanguageButton();
    }
  }

  updateLoadingState(isLoading) {
    const btn = document.getElementById('translateBtn');
    if (!btn) return;
    btn.disabled = isLoading;
    btn.classList.toggle('loading', isLoading);
  }

  updateLanguageButton() {
    const btn = document.getElementById('translateBtn');
    if (!btn) return;
    const span = btn.querySelector('span');
    if (span) span.textContent = this.currentLanguage === 'en' ? '中文' : 'English';
  }

  async toggleLanguage() {
    this.currentLanguage = this.currentLanguage === 'en' ? 'zh-CN' : 'en';
    localStorage.setItem('preferredLanguage', this.currentLanguage);
    await this.updatePageTranslations();
  }
}

// 可按需暴露
window.TranslationService = window.TranslationService || TranslationService;
