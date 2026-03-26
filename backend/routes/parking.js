const express = require('express');
const ParkingSlot = require('../models/ParkingSlot');
const { auth } = require('../middleware/auth');

const router = express.Router();

// Get all parking slots
router.get('/slots', auth, async (req, res) => {
    try {
        const slots = await ParkingSlot.find().populate('currentBooking');
        res.json(slots);
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

// Get parking availability summary
router.get('/availability', async (req, res) => {
    try {
        const total = await ParkingSlot.countDocuments();
        const occupied = await ParkingSlot.countDocuments({ isOccupied: true });
        const reservedOnline = await ParkingSlot.countDocuments({ isReservedOnline: true, isOccupied: false });
        const available = total - occupied - reservedOnline;

        // 40% online booking limit
        const maxOnlineSlots = Math.floor(total * 0.4);
        const onlineSlotsUsed = await ParkingSlot.countDocuments({ isReservedOnline: true });
        const onlineSlotsRemaining = maxOnlineSlots - onlineSlotsUsed;

        res.json({
            total,
            occupied,
            available,
            reservedOnline,
            maxOnlineSlots,
            onlineSlotsUsed,
            onlineSlotsRemaining,
            occupancyPercentage: Math.round((occupied / total) * 100)
        });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

module.exports = router;
