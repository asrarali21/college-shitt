const mongoose = require('mongoose');

const parkingSlotSchema = new mongoose.Schema({
    slotNumber: {
        type: String,
        required: true,
        unique: true
    },
    floor: {
        type: String,
        required: true,
        enum: ['A', 'B']
    },
    type: {
        type: String,
        enum: ['compact', 'regular', 'large'],
        default: 'regular'
    },
    isOccupied: {
        type: Boolean,
        default: false
    },
    isReservedOnline: {
        type: Boolean,
        default: false
    },
    currentBooking: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Booking',
        default: null
    }
}, { timestamps: true });

module.exports = mongoose.model('ParkingSlot', parkingSlotSchema);
