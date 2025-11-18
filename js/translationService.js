class TranslationService {
  constructor() {
    this.currentLanguage = localStorage.getItem('preferredLanguage') || 'en';
    this.loading = false;
    this.defaults = {};     // { key: 原文 }
    this.translations = {}; // { lang: { key: 译文 } }


    }
    return out;
  }

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
