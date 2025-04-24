import { useTranslation } from '../js/TranslationContext';

export default function Header() {
    const { t, currentLanguageName, toggleLanguage, loading } = useTranslation();

    return (
        <header className="site-header">
            <nav>
                <ul>
                    <li><a href="/">{t('nav-home')}</a></li>
                    <li><a href="/work">{t('nav-work')}</a></li>
                    <li><a href="/hobbies">{t('nav-hobbies')}</a></li>
                    <li><a href="/articles">{t('nav-articles')}</a></li>
                    <li><a href="/portfolio">{t('nav-portfolio')}</a></li>
                    <li><a href="/contact">{t('nav-contact')}</a></li>
                </ul>
                <button 
                    onClick={toggleLanguage}
                    disabled={loading}
                    className="lang-switch-btn"
                >
                    {loading ? '...' : `Switch to ${currentLanguageName}`}
                </button>
            </nav>
        </header>
    );
} 