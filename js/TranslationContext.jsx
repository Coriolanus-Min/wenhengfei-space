import React, { createContext, useState, useContext, useEffect } from 'react';
import { getTranslations, defaultLanguage } from './translations';

const TranslationContext = createContext();

// 支持的语言
const SUPPORTED_LANGUAGES = {
    en: 'English',
    'zh-CN': '中文'
};

export function TranslationProvider({ children }) {
    const [language, setLanguage] = useState(() => {
        // 从 localStorage 获取上次使用的语言，如果没有则使用默认语言
        const saved = localStorage.getItem('preferredLanguage');
        return saved && SUPPORTED_LANGUAGES.hasOwnProperty(saved) ? saved : defaultLanguage;
    });
    const [translations, setTranslations] = useState({});
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const loadTranslations = async () => {
            setLoading(true);
            try {
                const newTranslations = await getTranslations(language);
                setTranslations(newTranslations);
                localStorage.setItem('preferredLanguage', language);
            } catch (error) {
                console.error('Failed to load translations:', error);
            } finally {
                setLoading(false);
            }
        };

        loadTranslations();
    }, [language]);

    const toggleLanguage = () => {
        setLanguage(language === 'en' ? 'zh-CN' : 'en');
    };

    const t = (key) => {
        return translations[key] || key;
    };

    return (
        <TranslationContext.Provider value={{ 
            language, 
            toggleLanguage, // 改为直接提供切换功能
            t, 
            loading,
            currentLanguageName: SUPPORTED_LANGUAGES[language] // 当前语言的显示名称
        }}>
            {children}
        </TranslationContext.Provider>
    );
}

export function useTranslation() {
    const context = useContext(TranslationContext);
    if (!context) {
        throw new Error('useTranslation must be used within a TranslationProvider');
    }
    return context;
} 