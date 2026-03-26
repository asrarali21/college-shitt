const { generateContent } = require('./gemini');
const ParkingSlot = require('../models/ParkingSlot');
const Booking = require('../models/Booking');

async function getPrediction() {
    const total = await ParkingSlot.countDocuments();
    const occupied = await ParkingSlot.countDocuments({ isOccupied: true });
    const reserved = await ParkingSlot.countDocuments({ isReservedOnline: true, isOccupied: false });
    const available = total - occupied - reserved;
    const occupancyPct = Math.round((occupied / total) * 100);

    const now = new Date();
    const hour = now.getHours();
    const dayOfWeek = now.toLocaleDateString('en-US', { weekday: 'long' });

    // Get recent booking patterns
    const last24h = new Date(Date.now() - 24 * 60 * 60 * 1000);
    const recentBookings = await Booking.countDocuments({ createdAt: { $gte: last24h } });

    const prompt = `You are an AI parking management assistant. Analyze the following parking data and provide a prediction.

Current Parking Status:
- Total slots: ${total}
- Occupied: ${occupied} (${occupancyPct}%)
- Reserved online: ${reserved}
- Available: ${available}
- Current time: ${hour}:00 (${dayOfWeek})
- Bookings in last 24 hours: ${recentBookings}

Please respond in EXACTLY this JSON format (no markdown, no code blocks, just raw JSON):
{
  "availabilityLevel": "High" or "Medium" or "Low",
  "predictedOccupancy": <number 0-100>,
  "trend": "increasing" or "stable" or "decreasing",
  "peakHours": ["HH:MM - HH:MM", "HH:MM - HH:MM"],
  "bestTimeToPark": "description of best time",
  "suggestion": "a helpful suggestion for the user",
  "confidence": <number 0-100>
}`;

    const response = await generateContent(prompt);

    if (response) {
        try {
            const cleaned = response.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
            const prediction = JSON.parse(cleaned);
            return {
                ...prediction,
                currentStats: { total, occupied, available, reserved, occupancyPct },
                timestamp: new Date()
            };
        } catch (e) {
            console.error('Failed to parse Gemini prediction:', e.message);
        }
    }

    // Fallback prediction
    let level = 'High';
    if (occupancyPct > 70) level = 'Low';
    else if (occupancyPct > 40) level = 'Medium';

    return {
        availabilityLevel: level,
        predictedOccupancy: occupancyPct,
        trend: occupancyPct > 50 ? 'increasing' : 'stable',
        peakHours: ['09:00 - 11:00', '17:00 - 19:00'],
        bestTimeToPark: 'Early morning (6-8 AM) or late evening (after 8 PM)',
        suggestion: occupancyPct > 70
            ? 'Parking is filling up fast. Book online to secure your spot!'
            : 'Good availability right now. Walk-in parking is recommended.',
        confidence: 60,
        currentStats: { total, occupied, available, reserved, occupancyPct },
        timestamp: new Date(),
        isFallback: true
    };
}

module.exports = { getPrediction };
