const mongoose = require('mongoose');

const bookingSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    slot: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'ParkingSlot',
        required: true
    },
    bookingCode: {
        type: String,
        required: true,
        unique: true
    },
    qrCode: {
        type: String, // base64 encoded QR image
        required: true
    },
    vehicleNumber: {
        type: String,
        default: ''
    },
    status: {
        type: String,
        enum: ['booked', 'active', 'completed', 'cancelled'],
        default: 'booked'
    },
    entryTime: {
        type: Date,
        default: null
    },
    exitTime: {
        type: Date,
        default: null
    },
    duration: {
        type: Number, // in minutes
        default: 0
    },
    baseRate: {
        type: Number,
        default: 20 // base rate in ₹
    },
    hourlyRate: {
        type: Number,
        default: 10 // per hour in ₹
    },
    pricingMultiplier: {
        type: Number,
        default: 1.0
    },
    totalFee: {
        type: Number,
        default: 0
    }
}, { timestamps: true });

module.exports = mongoose.model('Booking', bookingSchema);
