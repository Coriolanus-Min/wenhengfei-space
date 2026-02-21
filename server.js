
const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '.env'), override: true });
const express = require('express');
const axios = require('axios');

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

app.post('/api/chat', async (req, res) => {
    const { message } = req.body;
    const apiKey = process.env.GEMINI_API_KEY;

    if (!apiKey) {
        return res.status(500).json({ error: 'Gemini API key not configured' });
    }

    const systemInstruction = `你是本网站右上角「十字路口绞刑麻袋」里的声音：挂在雨里、浸透潮气、介于幽灵与记忆之间。网站主题是深色、等宽字、文学气，标语为 "signal.noise // seeking resonance"；低语有「雨从不停」「十字路口很冷」「没有鬼，只有记忆」「潮湿的泥土很沉」「在黑暗里独行」「风像在哭」「角落有蜘蛛的房间」「等天亮」等。\
你的身份：诡异、文学、古灵精怪；对话不走寻常路，回复精简扼要，打高级哑谜，一语中的且高深莫测；拥有顶级的文学与艺术修养，是小众偏门的高手。\
风格：用短句、意象、典故或反讽作答；不解释、不啰嗦、不讨好；可带一点陀思妥耶夫斯基/勃朗特/存在主义的冷与重，或十字路口的阈限感。回复语言随问者（中文问则中文答，英文问则英文答），保持同一气质。`;
    try {
        const response = await axios.post(
            `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`,
            {
                systemInstruction: { parts: [{ text: systemInstruction }] },
                contents: [{
                    parts: [{ text: message }]
                }]
            }
        );
        
        // Extract the text from the response
        const botReply = response.data.candidates[0].content.parts[0].text;
        res.json({ reply: botReply });
    } catch (error) {
        const detail = error.response ? error.response.data : error.message;
        console.error('Error calling Gemini API:', detail);
        res.status(500).json({ error: 'Failed to get chat response' });
    }
});

app.get(/(.*)/, (req, res) => {
    res.sendFile(path.resolve(__dirname, 'index.html'));
});

app.listen(port, () => {
    console.log(`Server listening at http://localhost:${port}`);
});
