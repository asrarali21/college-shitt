
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
