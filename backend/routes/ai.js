const express = require('express');
const { getPrediction } = require('../services/prediction');
const { getDynamicPricing } = require('../services/pricing');
const { getChatResponse } = require('../services/chatbot');
const ParkingSlot = require('../models/ParkingSlot');

const router = express.Router();

// Get AI parking prediction
router.get('/predict', async (req, res) => {
    try {
        const prediction = await getPrediction();
        res.json(prediction);
    } catch (error) {
        res.status(500).json({ message: 'Prediction error', error: error.message });
    }
});

// Get dynamic pricing
router.get('/pricing', async (req, res) => {
    try {
        const pricing = await getDynamicPricing();
        res.json(pricing);
    } catch (error) {
        res.status(500).json({ message: 'Pricing error', error: error.message });
    }
});

// Chatbot
router.post('/chat', async (req, res) => {
    try {
        const { message, history } = req.body;

        if (!message) {
            return res.status(400).json({ message: 'Message is required' });
        }

        const response = await getChatResponse(message, history || []);
        res.json(response);
    } catch (error) {
        res.status(500).json({ message: 'Chatbot error', error: error.message });
    }
});

// Smart suggestions
router.get('/suggestions', async (req, res) => {
    try {
        const total = await ParkingSlot.countDocuments();
        const occupied = await ParkingSlot.countDocuments({ isOccupied: true });
        const occupancyPct = Math.round((occupied / total) * 100);
        const hour = new Date().getHours();

        const suggestions = [];

        if (occupancyPct > 80) {
            suggestions.push({
                type: 'warning',
                icon: '⚠️',
                message: 'Parking is almost full! Book online to guarantee a spot.'
            });
        }

        if (occupancyPct < 30) {
            suggestions.push({
                type: 'success',
                icon: '✅',
                message: 'Great time to park! Low demand means discounted pricing.'
            });
        }

        if (hour >= 9 && hour <= 11) {
            suggestions.push({
                type: 'info',
                icon: '📊',
                message: 'Morning peak hours. Consider coming after 11 AM for better availability.'
            });
        }

        if (hour >= 17 && hour <= 19) {
            suggestions.push({
                type: 'info',
                icon: '🌆',
                message: 'Evening rush hour. Availability may decrease. Book online recommended.'
            });
        }

        if (hour >= 20 || hour < 6) {
            suggestions.push({
                type: 'success',
                icon: '🌙',
                message: 'Off-peak hours! Enjoy low prices and easy parking.'
            });
        }

        if (hour >= 6 && hour < 9) {
            suggestions.push({
                type: 'tip',
                icon: '💡',
                message: 'Early bird advantage! Park before 9 AM for the best spots.'
            });
        }

        suggestions.push({
            type: 'tip',
            icon: '📱',
            message: `Currently ${total - occupied} slots available out of ${total} total.`
        });

        res.json({ suggestions });
    } catch (error) {
        res.status(500).json({ message: 'Suggestions error', error: error.message });
    }
});

module.exports = router;
