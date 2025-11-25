// Remove node-fetch dependency as Vercel Node.js 18+ has native fetch
// const fetch = require('node-fetch'); 

module.exports = async (req, res) => {
    // Handle CORS
    res.setHeader('Access-Control-Allow-Credentials', true);
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
    res.setHeader(
        'Access-Control-Allow-Headers',
        'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
    );

    if (req.method === 'OPTIONS') {
        res.status(200).end();
        return;
    }

    const { query, conversation_id, user } = req.body;
    const BOT_ID = '7576395788172050485';
    // Use environment variable, fallback to user provided token for testing
    const COZE_TOKEN = process.env.COZE_TOKEN || 'pat_ZLQnuC8djEQB4OY4dan3wJnpLt5VWFW42KIigBMw3OFvF3f7kbB9QV42UuNbA1q4';

    if (!COZE_TOKEN) {
        return res.status(500).json({ error: 'Server configuration error: COZE_TOKEN is missing.' });
    }

    try {
        const response = await fetch("https://api.coze.com/open_api/v2/chat", {
            method: "POST",
            headers: {
                "Authorization": "Bearer " + COZE_TOKEN,
                "Content-Type": "application/json",
                "Accept": "*/*"
            },
            body: JSON.stringify({
                conversation_id: conversation_id || "default_conv_" + Date.now(),
                bot_id: BOT_ID,
                user: user || "web_user",
                query: query,
                stream: false
            })
        });

        if (!response.ok) {
            const errorText = await response.text();
            console.error('Coze API Error:', response.status, errorText);
            return res.status(response.status).json({ error: 'Coze API Error: ' + response.status + ' ' + errorText });
        }

        const data = await response.json();
        res.status(200).json(data);
    } catch (error) {
        console.error('Server Error:', error);
        res.status(500).json({ error: 'Internal Server Error: ' + error.message });
    }
};
