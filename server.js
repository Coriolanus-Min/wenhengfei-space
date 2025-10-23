
require('dotenv').config();
const express = require('express');
const axios = require('axios');
const path = require('path');

const app = express();
const port = 3000;

app.use(express.json());
app.use(express.static(__dirname));

app.post('/api/translate', async (req, res) => {
    const { text, targetLang } = req.body;
    const apiKey = process.env.GOOGLE_TRANSLATE_API_KEY;

    if (!apiKey) {
        return res.status(500).json({ error: 'Google Translate API key not configured' });
    }

    try {
        const response = await axios.post(
            `https://translation.googleapis.com/language/translate/v2?key=${apiKey}`,
            {
                q: text,
                target: targetLang,
            }
        );
        res.json(response.data);
    } catch (error) {
        console.error('Error translating text:', error.response ? error.response.data : error.message);
        res.status(500).json({ error: 'Failed to translate text' });
    }
});

app.get('*', (req, res) => {
    res.sendFile(path.resolve(__dirname, 'index.html'));
});

app.listen(port, () => {
    console.log(`Server listening at http://localhost:${port}`);
});
