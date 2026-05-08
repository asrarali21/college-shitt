    return {
        message: fallbackResponse,
        stats: { total, occupied, available, reserved, occupancyPct },
        isFallback: true
    };
}

module.exports = { getChatResponse };
