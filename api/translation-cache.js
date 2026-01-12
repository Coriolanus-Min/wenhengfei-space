/**
 * 翻译缓存和用户校正API
 * 用于保存和检索翻译缓存，支持用户手动校正
 */

// 简单的内存缓存（生产环境应使用数据库如 Redis 或 MongoDB）
const translationCache = new Map();
const userCorrections = new Map();

/**
 * 生成缓存键
 */
function getCacheKey(text, sourceLang, targetLang) {
    return `${sourceLang}:${targetLang}:${text}`;
}

/**
 * 获取翻译（从缓存或用户校正）
 */
function getTranslation(text, sourceLang, targetLang) {
    const key = getCacheKey(text, sourceLang, targetLang);
    
    // 优先返回用户校正
    if (userCorrections.has(key)) {
        return {
            translation: userCorrections.get(key),
            source: 'user-correction',
            cached: true
        };
    }
    
    // 其次返回缓存
    if (translationCache.has(key)) {
        return {
            translation: translationCache.get(key),
            source: 'cache',
            cached: true
        };
    }
    
    return null;
}

/**
 * 保存翻译到缓存
 */
function saveTranslation(text, sourceLang, targetLang, translation, isUserCorrection = false) {
    const key = getCacheKey(text, sourceLang, targetLang);
    
    if (isUserCorrection) {
        userCorrections.set(key, translation);
    } else {
        translationCache.set(key, translation);
    }
    
    return { success: true };
}

/**
 * 获取统计信息
 */
function getStats() {
    return {
        cacheSize: translationCache.size,
        userCorrectionsCount: userCorrections.size,
        totalEntries: translationCache.size + userCorrections.size
    };
}

/**
 * 导出用户校正（用于备份）
 */
function exportUserCorrections() {
    const corrections = [];
    userCorrections.forEach((translation, key) => {
        const [sourceLang, targetLang, ...textParts] = key.split(':');
        const text = textParts.join(':');
        corrections.push({
            text,
            sourceLang,
            targetLang,
            translation
        });
    });
    return corrections;
}

/**
 * 导入用户校正（用于恢复）
 */
function importUserCorrections(corrections) {
    let count = 0;
    corrections.forEach(({ text, sourceLang, targetLang, translation }) => {
        const key = getCacheKey(text, sourceLang, targetLang);
        userCorrections.set(key, translation);
        count++;
    });
    return { imported: count };
}

/**
 * API 处理函数
 */
module.exports = async (req, res) => {
    // CORS Headers
    res.setHeader('Access-Control-Allow-Credentials', true);
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
    res.setHeader('Access-Control-Allow-Headers', 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version');

    // Handle OPTIONS request
    if (req.method === 'OPTIONS') {
        res.status(200).end();
        return;
    }

    const { action, text, sourceLang, targetLang, translation, corrections } = req.body;

    switch (action) {
        case 'get':
            // 获取翻译
            if (!text || !targetLang) {
                return res.status(400).json({ error: 'Missing text or targetLang' });
            }
            const result = getTranslation(text, sourceLang || 'en', targetLang);
            if (result) {
                return res.json(result);
            } else {
                return res.status(404).json({ error: 'Translation not found in cache' });
            }

        case 'save':
            // 保存翻译
            if (!text || !targetLang || !translation) {
                return res.status(400).json({ error: 'Missing required parameters' });
            }
            const isUserCorrection = req.body.isUserCorrection === true;
            const saveResult = saveTranslation(text, sourceLang || 'en', targetLang, translation, isUserCorrection);
            return res.json(saveResult);

        case 'stats':
            // 获取统计信息
            return res.json(getStats());

        case 'export':
            // 导出用户校正
            const exported = exportUserCorrections();
            return res.json({ corrections: exported });

        case 'import':
            // 导入用户校正
            if (!corrections || !Array.isArray(corrections)) {
                return res.status(400).json({ error: 'Invalid corrections data' });
            }
            const importResult = importUserCorrections(corrections);
            return res.json(importResult);

        default:
            return res.status(400).json({ 
                error: 'Invalid action',
                validActions: ['get', 'save', 'stats', 'export', 'import']
            });
    }
};
