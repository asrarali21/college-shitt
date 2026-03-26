const { generateChat, generateContent } = require('./gemini');
const ParkingSlot = require('../models/ParkingSlot');
const Booking = require('../models/Booking');

async function getChatResponse(userMessage, conversationHistory = []) {
    // Get current parking stats for context
    const total = await ParkingSlot.countDocuments();
    const occupied = await ParkingSlot.countDocuments({ isOccupied: true });
    const reserved = await ParkingSlot.countDocuments({ isReservedOnline: true, isOccupied: false });
    const available = total - occupied - reserved;
    const occupancyPct = Math.round((occupied / total) * 100);

    const now = new Date();
    const hour = now.getHours();

    const systemContext = `You are ParkBot, a friendly and helpful AI assistant for a Smart Urban Parking Management System. 

CURRENT REAL-TIME PARKING DATA:
- Total parking slots: ${total}
- Currently occupied: ${occupied}
- Reserved online (not yet entered): ${reserved}
- Available right now: ${available}
- Occupancy rate: ${occupancyPct}%
- Current time: ${now.toLocaleTimeString('en-US', { hour12: true })}
- Online booking limit: 40% of total slots

PRICING:
- Base rate: ₹20
- Hourly rate: ₹10/hour
- Dynamic pricing is active (multiplier varies with demand)

FEATURES YOU CAN HELP WITH:
1. Check parking availability
2. Estimate parking costs
3. Suggest best times to park
4. Explain booking process 
5. Explain QR code entry/exit system
6. Provide parking tips and suggestions

GUIDELINES:
- Be conversational, friendly, and concise
- Use emojis sparingly for a friendly tone
- Always use the real-time data above for accurate answers
- If asked about cost, calculate: (₹20 base + ₹10 × hours) × pricing multiplier
- Keep responses under 150 words
- If you don't know something, say so honestly`;

    // Build conversation history for Gemini
    const history = conversationHistory.map(msg => ({
        role: msg.role === 'user' ? 'user' : 'model',
        content: msg.content
    }));

    // Add system context as the first user message if no history
    if (history.length === 0) {
        const fullMessage = `${systemContext}\n\nUser question: ${userMessage}`;
        const response = await generateContent(fullMessage);

        if (response) {
            return {
                message: response,
                stats: { total, occupied, available, reserved, occupancyPct }
            };
        }
    } else {
        // For ongoing conversations, prepend context to user message
        const contextualMessage = `[Current parking status: ${available}/${total} available, ${occupancyPct}% occupied]\n\nUser: ${userMessage}`;

        const response = await generateChat(history, contextualMessage);

        if (response) {
            return {
                message: response,
                stats: { total, occupied, available, reserved, occupancyPct }
            };
        }
    }

    // Fallback responses
    const lowerMsg = userMessage.toLowerCase();
    let fallbackResponse = '';

    if (lowerMsg.includes('available') || lowerMsg.includes('free') || lowerMsg.includes('slot')) {
        fallbackResponse = `🅿️ Currently ${available} out of ${total} slots are available (${occupancyPct}% occupied). ${available > 10 ? 'Plenty of space!' : 'Hurry, slots are filling up!'}`;
    } else if (lowerMsg.includes('cost') || lowerMsg.includes('price') || lowerMsg.includes('fee') || lowerMsg.includes('charge')) {
        fallbackResponse = `💰 Parking costs ₹20 base + ₹10/hour. For 2 hours, it would be approximately ₹40. Dynamic pricing may apply during peak hours.`;
    } else if (lowerMsg.includes('time') || lowerMsg.includes('best') || lowerMsg.includes('when')) {
        fallbackResponse = `⏰ Best times to park: Early morning (6-8 AM) or after 8 PM. Peak hours are 9-11 AM and 5-7 PM.`;
    } else if (lowerMsg.includes('book') || lowerMsg.includes('reserve')) {
        fallbackResponse = `📱 To book: Go to Dashboard → Book Slot → Select a slot → Confirm. You'll receive a QR code for entry. Online booking is limited to 40% of total slots.`;
    } else if (lowerMsg.includes('qr') || lowerMsg.includes('entry') || lowerMsg.includes('exit')) {
        fallbackResponse = `🔄 Use your QR code or booking code at entry. On exit, scan again and fees are calculated automatically based on duration.`;
    } else if (lowerMsg.includes('hello') || lowerMsg.includes('hi') || lowerMsg.includes('hey')) {
        fallbackResponse = `👋 Hello! I'm ParkBot, your parking assistant. I can help you check availability, estimate costs, or suggest the best time to park. What would you like to know?`;
    } else {
        fallbackResponse = `🅿️ I'm ParkBot! I can help with: parking availability, cost estimates, best times to park, and booking help. Currently ${available} slots available. What would you like to know?`;
    }

    return {
        message: fallbackResponse,
        stats: { total, occupied, available, reserved, occupancyPct },
        isFallback: true
    };
}

module.exports = { getChatResponse };
