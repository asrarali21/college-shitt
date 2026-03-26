const { generateContent } = require('./gemini');
const ParkingSlot = require('../models/ParkingSlot');

async function getDynamicPricing() {
    const total = await ParkingSlot.countDocuments();
    const occupied = await ParkingSlot.countDocuments({ isOccupied: true });
    const reserved = await ParkingSlot.countDocuments({ isReservedOnline: true });
    const occupancyPct = Math.round(((occupied + reserved) / total) * 100);

    const now = new Date();
    const hour = now.getHours();
    const dayOfWeek = now.toLocaleDateString('en-US', { weekday: 'long' });

    const prompt = `You are a smart parking pricing AI. Based on the current parking demand, recommend a dynamic pricing multiplier.

Current Status:
- Total slots: ${total}
- Occupied + Reserved: ${occupied + reserved} (${occupancyPct}%)
- Time: ${hour}:00 (${dayOfWeek})

Rules:
- Normal price multiplier is 1.0
- Low demand (< 30% full): offer discount (0.7 - 0.9x)
- Medium demand (30-60%): normal pricing (0.9 - 1.1x)
- High demand (60-85%): surge pricing (1.2 - 1.4x)
- Very high demand (> 85%): peak pricing (1.4 - 1.8x)

Respond in EXACTLY this JSON format (no markdown, no code blocks, just raw JSON):
{
  "multiplier": <number with 1 decimal>,
  "level": "discount" or "normal" or "surge" or "peak",
  "reason": "brief explanation",
  "baseRate": 20,
  "hourlyRate": 10,
  "effectiveHourlyRate": <hourlyRate * multiplier>
}`;

    const response = await generateContent(prompt);

    if (response) {
        try {
            const cleaned = response.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
            const pricing = JSON.parse(cleaned);
            return {
                ...pricing,
                occupancyPct,
                timestamp: new Date()
            };
        } catch (e) {
            console.error('Failed to parse Gemini pricing:', e.message);
        }
    }

    // Fallback pricing
    let multiplier = 1.0;
    let level = 'normal';
    let reason = 'Standard pricing';

    if (occupancyPct < 30) {
        multiplier = 0.8;
        level = 'discount';
        reason = 'Low demand — enjoy discounted parking!';
    } else if (occupancyPct < 60) {
        multiplier = 1.0;
        level = 'normal';
        reason = 'Normal demand — standard pricing applies.';
    } else if (occupancyPct < 85) {
        multiplier = 1.3;
        level = 'surge';
        reason = 'High demand — surge pricing in effect.';
    } else {
        multiplier = 1.5;
        level = 'peak';
        reason = 'Very high demand — peak pricing applies.';
    }

    return {
        multiplier,
        level,
        reason,
        baseRate: 20,
        hourlyRate: 10,
        effectiveHourlyRate: Math.round(10 * multiplier),
        occupancyPct,
        timestamp: new Date(),
        isFallback: true
    };
}

module.exports = { getDynamicPricing };
