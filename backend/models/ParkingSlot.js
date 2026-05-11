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
module.exports = mongoose.model('ParkingSlot', parkingSlotSchema);
