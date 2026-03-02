const express = require('express');
const { v4: uuidv4 } = require('uuid');
const { authMiddleware } = require('../middleware/auth');
const temples = require('../data/temples.json');

const router = express.Router();

// In-memory bookings store (demo)
const bookings = [];

// POST /api/bookings — Create a booking (auth required)
router.post('/', authMiddleware, (req, res) => {
    try {
        const { templeId, darshanType, date, tickets, contactName, contactPhone } = req.body;

        if (!templeId || !darshanType || !date || !tickets) {
            return res.status(400).json({ error: 'templeId, darshanType, date, and tickets are required.' });
        }

        const temple = temples.find(t => t.id === templeId);
        if (!temple) {
            return res.status(404).json({ error: 'Temple not found.' });
        }

        const darshan = temple.darshanTypes.find(d => d.id === darshanType);
        if (!darshan) {
            return res.status(400).json({ error: 'Invalid darshan type for this temple.' });
        }

        if (!darshan.available) {
            return res.status(400).json({ error: `${darshan.name} is currently unavailable for booking.` });
        }

        const ticketCount = parseInt(tickets);
        if (isNaN(ticketCount) || ticketCount < 1 || ticketCount > 10) {
            return res.status(400).json({ error: 'Tickets must be between 1 and 10.' });
        }

        const totalPrice = darshan.price * ticketCount;

        const booking = {
            id: uuidv4(),
            bookingRef: 'DD' + Date.now().toString(36).toUpperCase(),
            userId: req.user.id,
            templeId: temple.id,
            templeName: temple.name,
            templeLocation: temple.location,
            darshanType: darshan.id,
            darshanName: darshan.name,
            date,
            tickets: ticketCount,
            pricePerTicket: darshan.price,
            totalPrice,
            contactName: contactName || req.user.name,
            contactPhone: contactPhone || '',
            status: 'confirmed',
            createdAt: new Date().toISOString()
        };

        bookings.push(booking);

        res.status(201).json({
            message: `Booking confirmed! 🙏 ${ticketCount} ticket(s) for ${darshan.name} at ${temple.name}`,
            booking
        });
    } catch (err) {
        res.status(500).json({ error: 'Server error during booking.' });
    }
});

// GET /api/bookings/my — Get current user's bookings (auth required)
router.get('/my', authMiddleware, (req, res) => {
    const userBookings = bookings
        .filter(b => b.userId === req.user.id)
        .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

    res.json({ bookings: userBookings, total: userBookings.length });
});

module.exports = router;
