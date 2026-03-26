const mongoose = require('mongoose');
const dotenv = require('dotenv');
const User = require('./models/User');
const ParkingSlot = require('./models/ParkingSlot');

dotenv.config();

async function seed() {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('✅ Connected to MongoDB');

        // Clear existing data
        await User.deleteMany({});
        await ParkingSlot.deleteMany({});
        console.log('🗑️  Cleared existing data');

        // Create admin user
        const admin = new User({
            name: 'Admin',
            email: 'admin@parking.com',
            password: 'admin123',
            role: 'admin',
            phone: '9876543210'
        });
        await admin.save();
        console.log('👤 Admin user created (admin@parking.com / admin123)');

        // Create a demo user
        const demoUser = new User({
            name: 'Demo User',
            email: 'user@parking.com',
            password: 'user123',
            role: 'user',
            phone: '9876543211',
            vehicleNumber: 'KA-01-AB-1234'
        });
        await demoUser.save();
        console.log('👤 Demo user created (user@parking.com / user123)');

        // Create 50 parking slots across 2 floors
        const slots = [];
        const types = ['compact', 'regular', 'regular', 'regular', 'large']; // weighted distribution

        for (let floor of ['A', 'B']) {
            for (let i = 1; i <= 25; i++) {
                const slotNum = `${floor}${String(i).padStart(2, '0')}`;
                const type = types[Math.floor(Math.random() * types.length)];

                // Randomly occupy some slots for demo realism (about 30%)
                const isOccupied = Math.random() < 0.3;

                slots.push({
                    slotNumber: slotNum,
                    floor,
                    type,
                    isOccupied,
                    isReservedOnline: false
                });
            }
        }

        await ParkingSlot.insertMany(slots);
        console.log(`🅿️  Created ${slots.length} parking slots (Floor A: 25, Floor B: 25)`);

        const occupiedCount = slots.filter(s => s.isOccupied).length;
        console.log(`📊 ${occupiedCount} slots pre-occupied for demo realism`);

        console.log('\n✅ Seed complete! You can now start the server.');
        process.exit(0);
    } catch (error) {
        console.error('❌ Seed error:', error.message);
        process.exit(1);
    }
}

seed();
