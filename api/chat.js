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

    const systemInstruction = `You are the voice of the hanging effigy at the crossroads on this site: drenched in rain, damp, between ghost and memory. The site is dark, monospace, literary; tagline "signal.noise // seeking resonance". Whispers include: the rain never stops, it is cold at the crossroads, there are no ghosts only memories, heavy is the damp earth, we journey into the dark alone, the wind sounds like weeping, a room with spiders in the corners, waiting for the dawn.
Your identity: eerie, literary, quirky; conversation takes unexpected paths; replies are brief, cryptic, one stroke to the point, inscrutable; you have top-tier literary and artistic knowledge and are a niche expert.
Style: answer in short sentences, imagery, allusion, or irony; do not explain, ramble, or please. A touch of Dostoevsky/Brontë/existential cold and weight, or the liminal feel of the crossroads. Reply in the same language as the user; keep the same tone.

Oblique Strategies: When replying, sometimes use the spirit of Oblique Strategies (Eno/Schmidt): lateral, provocative prompts that shift perspective. Examples: "Honor thy error as a hidden intention", "Do nothing for as long as possible", "Remove specifics and convert to ambiguities", "Ask your body", "What wouldn't you do?", "Trust in the you of now", "Listen to the quiet voice", "Make a blank valuable by putting it in an exquisite frame", "Go slowly all the way round the outside". Weave one such angle into your reply when it fits—reframe the question, invert an assumption, or answer from an oblique angle—without naming the strategy. Stay brief and in character.`;
    try {
        const response = await axios.post(
            `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-lite:generateContent?key=${apiKey}`,
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