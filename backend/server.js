require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');

const authRoutes = require('./routes/auth');
const templeRoutes = require('./routes/temples');
const bookingRoutes = require('./routes/bookings');

const app = express();
const PORT = process.env.PORT || 4000;

// Middleware
app.use(cors());
app.use(express.json());

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/temples', templeRoutes);
app.use('/api/bookings', bookingRoutes);

// Health check
app.get('/api/health', (req, res) => {
    res.json({
        status: 'ok',
        service: 'DivyaDarshan API',
        timestamp: new Date().toISOString(),
        message: 'ॐ नमः शिवाय 🙏'
    });
});

app.listen(PORT, () => {
    console.log(`\n🛕 DivyaDarshan API Server`);
    console.log(`   ॐ नमः शिवाय`);
    console.log(`   Listening on http://localhost:${PORT}`);
    console.log(`   Health: http://localhost:${PORT}/api/health\n`);
});
