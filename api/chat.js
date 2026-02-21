const axios = require('axios');

module.exports = async (req, res) => {
    // CORS Headers
    res.setHeader('Access-Control-Allow-Credentials', true);
    res.setHeader('Access-Control-Allow-Origin', '*'); // Replace '*' with 'https://wenhengfei.space' for better security
    res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
    res.setHeader('Access-Control-Allow-Headers', 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version');

    // Handle OPTIONS request (Preflight)
    if (req.method === 'OPTIONS') {
        res.status(200).end();
        return;
    }

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
        
        const botReply = response.data.candidates[0].content.parts[0].text;
        res.json({ reply: botReply });
    } catch (error) {
        console.error('Error calling Gemini API:', error.response ? error.response.data : error.message);
        res.status(500).json({ error: 'Failed to get chat response' });
    }
};