const express = require('express');
const Booking = require('../models/Booking');
const ParkingSlot = require('../models/ParkingSlot');
const { adminAuth } = require('../middleware/auth');

const router = express.Router();

// Get admin dashboard stats
router.get('/stats', adminAuth, async (req, res) => {
    try {
        const totalSlots = await ParkingSlot.countDocuments();
        const occupied = await ParkingSlot.countDocuments({ isOccupied: true });
        const reservedOnline = await ParkingSlot.countDocuments({ isReservedOnline: true, isOccupied: false });
        const available = totalSlots - occupied - reservedOnline;

        const totalBookings = await Booking.countDocuments();
        const activeBookings = await Booking.countDocuments({ status: 'active' });
        const completedBookings = await Booking.countDocuments({ status: 'completed' });

        // Calculate total revenue
        const revenueResult = await Booking.aggregate([
            { $match: { status: 'completed' } },
            { $group: { _id: null, total: { $sum: '$totalFee' } } }
        ]);
        const totalRevenue = revenueResult.length > 0 ? revenueResult[0].total : 0;

        // Recent bookings
        const recentBookings = await Booking.find()
            .populate('user', 'name email')
            .populate('slot', 'slotNumber floor')
            .sort({ createdAt: -1 })
            .limit(10);

        res.json({
            slots: {
                total: totalSlots,
                occupied,
                available,
                reservedOnline,
                occupancyPercentage: Math.round((occupied / totalSlots) * 100)
            },
            bookings: {
                total: totalBookings,
                active: activeBookings,
                completed: completedBookings
            },
            revenue: totalRevenue,
            recentBookings
        });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

// Get all bookings (admin)
router.get('/bookings', adminAuth, async (req, res) => {
    try {
        const bookings = await Booking.find()
            .populate('user', 'name email vehicleNumber')
            .populate('slot', 'slotNumber floor type')
            .sort({ createdAt: -1 });
        res.json(bookings);
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

module.exports = router;
