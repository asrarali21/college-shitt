const { GoogleGenerativeAI } = require('@google/generative-ai');

let genAI = null;
let model = null;

function getModel() {
    if (!model) {
        if (!process.env.GEMINI_API_KEY || process.env.GEMINI_API_KEY === 'your-gemini-api-key-here') {
            console.warn('⚠️  GEMINI_API_KEY not set. AI features will use fallback responses.');
            return null;
        }
        genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
        model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' });
    }
    return model;
}

async function generateContent(prompt) {
    const m = getModel();
    if (!m) return null;

    try {
        const result = await m.generateContent(prompt);
        return result.response.text();
    } catch (error) {
        console.error('Gemini API error:', error.message);
        return null;
    }
}

async function generateChat(history, message) {
    const m = getModel();
    if (!m) return null;

    try {
        const chat = m.startChat({
            history: history.map(msg => ({
                role: msg.role,
                parts: [{ text: msg.content }]
            }))
        });
        const result = await chat.sendMessage(message);
        return result.response.text();
    } catch (error) {
        console.error('Gemini Chat error:', error.message);
        return null;
    }
}

module.exports = { getModel, generateContent, generateChat };
