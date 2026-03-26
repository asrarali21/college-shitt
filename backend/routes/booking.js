const express = require('express');
const QRCode = require('qrcode');
const Booking = require('../models/Booking');
const ParkingSlot = require('../models/ParkingSlot');
const { auth } = require('../middleware/auth');
const { getDynamicPricing } = require('../services/pricing');

const router = express.Router();

// Generate unique booking code
function generateBookingCode() {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let code = 'PK-';
    for (let i = 0; i < 6; i++) {
        code += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return code;
}

// Book a parking slot
router.post('/book', auth, async (req, res) => {
    try {
        const { slotId, vehicleNumber } = req.body;

        // Check 40% online booking limit
        const totalSlots = await ParkingSlot.countDocuments();
        const maxOnline = Math.floor(totalSlots * 0.4);
        const currentOnline = await ParkingSlot.countDocuments({ isReservedOnline: true });

        if (currentOnline >= maxOnline) {
            return res.status(400).json({
                message: 'Online booking limit reached (40%). Please try walk-in parking.'
            });
        }

        // Check if slot is available
        const slot = await ParkingSlot.findById(slotId);
        if (!slot) {
            return res.status(404).json({ message: 'Slot not found' });
        }
        if (slot.isOccupied || slot.isReservedOnline) {
            return res.status(400).json({ message: 'Slot is not available' });
        }

        // Generate booking code and QR
        const bookingCode = generateBookingCode();
        const qrData = JSON.stringify({
            code: bookingCode,
            slot: slot.slotNumber,
            floor: slot.floor
        });
        const qrCode = await QRCode.toDataURL(qrData);

        // Get dynamic pricing
        const pricing = await getDynamicPricing();

        // Create booking
        const booking = new Booking({
            user: req.user._id,
            slot: slot._id,
            bookingCode,
            qrCode,
            vehicleNumber: vehicleNumber || req.user.vehicleNumber,
            pricingMultiplier: pricing.multiplier
        });
        await booking.save();

        // Update slot
        slot.isReservedOnline = true;
        slot.currentBooking = booking._id;
        await slot.save();

        res.status(201).json({
            message: 'Slot booked successfully!',
            booking: {
                id: booking._id,
                bookingCode,
                qrCode,
                slot: slot.slotNumber,
                floor: slot.floor,
                status: booking.status,
                pricingMultiplier: pricing.multiplier,
                pricingReason: pricing.reason
            }
        });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

// Get user's bookings
router.get('/my', auth, async (req, res) => {
    try {
        const bookings = await Booking.find({ user: req.user._id })
            .populate('slot')
            .sort({ createdAt: -1 });
        res.json(bookings);
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

// Simulate entry (scan QR / enter code)
router.post('/entry', async (req, res) => {
    try {
        const { bookingCode } = req.body;

        const booking = await Booking.findOne({ bookingCode }).populate('slot');
        if (!booking) {
            return res.status(404).json({ message: 'Invalid booking code' });
        }
        if (booking.status !== 'booked') {
            return res.status(400).json({ message: `Booking is already ${booking.status}` });
        }

        // Mark entry
        booking.status = 'active';
        booking.entryTime = new Date();
        await booking.save();

        // Update slot
        const slot = await ParkingSlot.findById(booking.slot._id);
        slot.isOccupied = true;
        await slot.save();

        res.json({
            message: 'Entry recorded successfully!',
            booking: {
                bookingCode: booking.bookingCode,
                slot: slot.slotNumber,
                floor: slot.floor,
                entryTime: booking.entryTime,
                status: booking.status
            }
        });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

// Simulate exit
router.post('/exit', async (req, res) => {
    try {
        const { bookingCode } = req.body;

        const booking = await Booking.findOne({ bookingCode }).populate('slot');
        if (!booking) {
            return res.status(404).json({ message: 'Invalid booking code' });
        }
        if (booking.status !== 'active') {
            return res.status(400).json({ message: `Booking is not active (status: ${booking.status})` });
        }

        // Calculate duration and fee
        const exitTime = new Date();
        const durationMs = exitTime - booking.entryTime;
        const durationMinutes = Math.ceil(durationMs / (1000 * 60));
        const durationHours = Math.ceil(durationMinutes / 60);

        const baseFee = booking.baseRate;
        const hourlyFee = durationHours * booking.hourlyRate;
        const totalFee = Math.round((baseFee + hourlyFee) * booking.pricingMultiplier);

        // Update booking
        booking.status = 'completed';
        booking.exitTime = exitTime;
        booking.duration = durationMinutes;
        booking.totalFee = totalFee;
        await booking.save();

        // Release slot
        const slot = await ParkingSlot.findById(booking.slot._id);
        slot.isOccupied = false;
        slot.isReservedOnline = false;
        slot.currentBooking = null;
        await slot.save();

        res.json({
            message: 'Exit recorded. Thank you!',
            receipt: {
                bookingCode: booking.bookingCode,
                slot: slot.slotNumber,
                floor: slot.floor,
                entryTime: booking.entryTime,
                exitTime: booking.exitTime,
                duration: `${durationMinutes} minutes (${durationHours} hr)`,
                baseRate: `₹${baseFee}`,
                hourlyCharge: `₹${hourlyFee}`,
                pricingMultiplier: `${booking.pricingMultiplier}x`,
                totalFee: `₹${totalFee}`
            }
        });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

// Cancel booking
router.post('/cancel/:id', auth, async (req, res) => {
    try {
        const booking = await Booking.findById(req.params.id);
        if (!booking) {
            return res.status(404).json({ message: 'Booking not found' });
        }
        if (booking.user.toString() !== req.user._id.toString()) {
            return res.status(403).json({ message: 'Not authorized' });
        }
        if (booking.status !== 'booked') {
            return res.status(400).json({ message: 'Can only cancel booked (not yet entered) bookings' });
        }

        booking.status = 'cancelled';
        await booking.save();

        // Release slot
        const slot = await ParkingSlot.findById(booking.slot);
        slot.isReservedOnline = false;
        slot.currentBooking = null;
        await slot.save();

        res.json({ message: 'Booking cancelled successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

module.exports = router;
