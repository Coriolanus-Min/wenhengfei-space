const axios = require('axios');

/**
 * 改进的翻译API端点
 * 支持多个翻译源：DeepL（首选）、Google Translate、LibreTranslate（免费备选）
 * 包含缓存和降级机制
 */

// 翻译服务优先级
const translationServices = [
    {
        name: 'deepl',
        enabled: !!process.env.DEEPL_API_KEY,
        translate: translateWithDeepL
    },
    {
        name: 'google',
        enabled: !!process.env.GOOGLE_TRANSLATE_API_KEY,
        translate: translateWithGoogle
    },
    {
        name: 'libretranslate',
        enabled: true, // 始终启用作为免费备选
        translate: translateWithLibreTranslate
    }
];

/**
 * DeepL 翻译（推荐 - 质量最好）
 */
async function translateWithDeepL(text, targetLanguage) {
    const apiKey = process.env.DEEPL_API_KEY;
    const isFreeAccount = process.env.DEEPL_FREE_ACCOUNT === 'true';
    const baseUrl = isFreeAccount 
        ? 'https://api-free.deepl.com/v2/translate'
        : 'https://api.deepl.com/v2/translate';
    
    // DeepL 语言代码映射
    const langMap = {
        'zh-CN': 'ZH',
        'zh': 'ZH',
        'en': 'EN',
        'ja': 'JA',
        'ko': 'KO',
        'fr': 'FR',
        'de': 'DE',
        'es': 'ES',
        'it': 'IT',
        'pt': 'PT',
        'ru': 'RU'
    };

    const response = await axios.post(baseUrl, null, {
        params: {
            auth_key: apiKey,
            text: text,
            target_lang: langMap[targetLanguage] || targetLanguage.toUpperCase()
        },
        timeout: 10000
    });

    return response.data.translations[0].text;
}

/**
 * Google Translate 翻译
 */
async function translateWithGoogle(text, targetLanguage) {
    const apiKey = process.env.GOOGLE_TRANSLATE_API_KEY;
    
    const response = await axios.post(
        `https://translation.googleapis.com/language/translate/v2?key=${apiKey}`,
        {
            q: text,
            target: targetLanguage,
            format: 'text'
        },
        { timeout: 10000 }
    );
    
    return response.data.data.translations[0].translatedText;
}

/**
 * LibreTranslate 翻译（开源免费方案）
 */
async function translateWithLibreTranslate(text, targetLanguage) {
    // 使用公共的 LibreTranslate 实例
    const endpoint = process.env.LIBRETRANSLATE_ENDPOINT || 'https://libretranslate.com/translate';
    const apiKey = process.env.LIBRETRANSLATE_API_KEY; // 可选，用于提高速率限制
    
    // LibreTranslate 语言代码映射
    const langMap = {
        'zh-CN': 'zh',
        'zh': 'zh',
        'en': 'en',
        'ja': 'ja',
        'ko': 'ko',
        'fr': 'fr',
        'de': 'de',
        'es': 'es',
        'it': 'it',
        'pt': 'pt',
        'ru': 'ru'
    };

    const payload = {
        q: text,
        source: 'auto',
        target: langMap[targetLanguage] || 'en',
        format: 'text'
    };

    if (apiKey) {
        payload.api_key = apiKey;
    }

    const response = await axios.post(endpoint, payload, {
        timeout: 15000,
        headers: { 'Content-Type': 'application/json' }
    });

    return response.data.translatedText;
}

/**
 * 尝试使用多个翻译服务（降级机制）
 */
async function translateWithFallback(text, targetLanguage) {
    const errors = [];
    
    for (const service of translationServices) {
        if (!service.enabled) {
            continue;
        }
        
        try {
            console.log(`尝试使用 ${service.name} 翻译...`);
            const result = await service.translate(text, targetLanguage);
            console.log(`${service.name} 翻译成功`);
            return {
                translatedText: result,
                service: service.name
            };
        } catch (error) {
            const errorMsg = `${service.name} 失败: ${error.message}`;
            console.error(errorMsg);
            errors.push(errorMsg);
            continue; // 尝试下一个服务
        }
    }
    
    // 所有服务都失败了
    throw new Error(`所有翻译服务都失败了:\n${errors.join('\n')}`);
}

/**
 * 主处理函数
 */
module.exports = async (req, res) => {
    // CORS Headers
    res.setHeader('Access-Control-Allow-Credentials', true);
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
    res.setHeader('Access-Control-Allow-Headers', 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version');

    // Handle OPTIONS request (Preflight)
    if (req.method === 'OPTIONS') {
        res.status(200).end();
        return;
    }

    // 只接受 POST 请求
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    const { text, targetLanguage, preferredService } = req.body;

    // 验证输入
    if (!text || !targetLanguage) {
        return res.status(400).json({ 
            error: 'Missing required parameters',
            details: 'Both text and targetLanguage are required'
        });
    }

    if (text.trim().length === 0) {
        return res.json({ 
            translated: '',
            service: 'none',
            cached: false
        });
    }

    try {
        // 如果指定了优先服务，先尝试使用它
        if (preferredService) {
            const service = translationServices.find(s => s.name === preferredService && s.enabled);
            if (service) {
                try {
                    const result = await service.translate(text, targetLanguage);
                    return res.json({
                        translated: result,
                        service: service.name,
                        cached: false
                    });
                } catch (error) {
                    console.error(`首选服务 ${preferredService} 失败，使用降级方案`);
                }
            }
        }

        // 使用降级机制
        const { translatedText, service } = await translateWithFallback(text, targetLanguage);
        
        res.json({
            translated: translatedText,
            service: service,
            cached: false
        });

    } catch (error) {
        console.error('翻译错误:', error);
        res.status(500).json({ 
            error: 'Translation failed',
            details: error.message,
            availableServices: translationServices
                .filter(s => s.enabled)
                .map(s => s.name)
        });
    }
};
