const axios = require('axios');

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

    const { text, targetLanguage } = req.body;
    const apiKey = process.env.GOOGLE_TRANSLATE_API_KEY;

    if (!apiKey) {
        return res.status(500).json({ error: 'Translation API key not configured' });
    }

    if (!text || !targetLanguage) {
        return res.status(400).json({ error: 'Missing text or targetLanguage' });
    }

    try {
        const response = await axios.post(
            `https://translation.googleapis.com/language/translate/v2?key=${apiKey}`,
            {
                q: text,
                target: targetLanguage,
                format: 'text'
            }
        );
        
        const translatedText = response.data.data.translations[0].translatedText;
        res.json({ translated: translatedText });
    } catch (error) {
        console.error('Error calling Translation API:', error.response ? error.response.data : error.message);
        res.status(500).json({ error: 'Failed to translate text' });
    }
};
