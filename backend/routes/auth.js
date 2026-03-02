const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { v4: uuidv4 } = require('uuid');
const { JWT_SECRET, authMiddleware } = require('../middleware/auth');

const router = express.Router();

// In-memory user store (demo)
const users = [];

// POST /api/auth/signup
router.post('/signup', async (req, res) => {
    try {
        const { name, email, phone, password } = req.body;

        if (!name || !email || !password) {
            return res.status(400).json({ error: 'Name, email, and password are required.' });
        }

        const existing = users.find(u => u.email === email);
        if (existing) {
            return res.status(400).json({ error: 'An account with this email already exists.' });
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        const user = {
            id: uuidv4(),
            name,
            email,
            phone: phone || '',
            password: hashedPassword,
            createdAt: new Date().toISOString()
        };
        users.push(user);

        const token = jwt.sign({ id: user.id, name: user.name, email: user.email }, JWT_SECRET, { expiresIn: '7d' });

        res.status(201).json({
            message: 'Account created successfully! Har Har Mahadev 🙏',
            token,
            user: { id: user.id, name: user.name, email: user.email, phone: user.phone }
        });
    } catch (err) {
        res.status(500).json({ error: 'Server error during signup.' });
    }
});

// POST /api/auth/login
router.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({ error: 'Email and password are required.' });
        }

        const user = users.find(u => u.email === email);
        if (!user) {
            return res.status(401).json({ error: 'Invalid email or password.' });
        }

        const isValidPassword = await bcrypt.compare(password, user.password);
        if (!isValidPassword) {
            return res.status(401).json({ error: 'Invalid email or password.' });
        }

        const token = jwt.sign({ id: user.id, name: user.name, email: user.email }, JWT_SECRET, { expiresIn: '7d' });

        res.json({
            message: 'Login successful! Welcome back 🙏',
            token,
            user: { id: user.id, name: user.name, email: user.email, phone: user.phone }
        });
    } catch (err) {
        res.status(500).json({ error: 'Server error during login.' });
    }
});

// GET /api/auth/me
router.get('/me', authMiddleware, (req, res) => {
    const user = users.find(u => u.id === req.user.id);
    if (!user) {
        return res.status(404).json({ error: 'User not found.' });
    }
    res.json({ user: { id: user.id, name: user.name, email: user.email, phone: user.phone } });
});

// --- OTP LOGIN SYSTEM ---

// In-memory store for OTPs (In real app, use Redis/DB)
const otpStore = new Map();

// Generate a random 6-digit OTP
function generateOTP() {
    return Math.floor(100000 + Math.random() * 900000).toString();
}

const nodemailer = require('nodemailer');
const twilio = require('twilio');

// POST /api/auth/send-otp
router.post('/send-otp', async (req, res) => {
    const { identifier } = req.body;

    if (!identifier) {
        return res.status(400).json({ error: 'Email or Phone number is required' });
    }

    const otp = generateOTP();

    // Store OTP with expiration (5 minutes)
    otpStore.set(identifier, {
        otp,
        expiresAt: Date.now() + 5 * 60 * 1000
    });

    try {
        const isEmail = /^\S+@\S+\.\S+$/.test(identifier);

        if (isEmail) {
            // Send Email using Nodemailer
            if (process.env.EMAIL_USER && process.env.EMAIL_PASS) {
                const transporter = nodemailer.createTransport({
                    service: 'gmail',
                    auth: {
                        user: process.env.EMAIL_USER,
                        pass: process.env.EMAIL_PASS
                    }
                });

                await transporter.sendMail({
                    from: `"DivyaDarshan" <${process.env.EMAIL_USER}>`,
                    to: identifier,
                    subject: 'Your DivyaDarshan Login OTP 🙏',
                    html: `
                        <div style="font-family: sans-serif; text-align: center; padding: 20px;">
                            <h2>DivyaDarshan Login</h2>
                            <p>Here is your sacred OTP to access the portal:</p>
                            <h1 style="color: #FF6B00; letter-spacing: 5px; background: #FFF3E0; padding: 10px; border-radius: 8px; display: inline-block;">${otp}</h1>
                            <p>This code will expire in 5 minutes.</p>
                            <p style="color: #888;">ॐ नमः शिवाय</p>
                        </div>
                    `
                });
                console.log(`📧 Real Email OTP sent to ${identifier}`);
            } else {
                console.log(`⚠️ Email credentials missing in .env. Showing mock OTP for ${identifier}: ${otp}`);
            }
        } else {
            // Send SMS using Twilio
            if (process.env.TWILIO_ACCOUNT_SID && process.env.TWILIO_AUTH_TOKEN && process.env.TWILIO_PHONE_NUMBER) {
                const client = twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);

                await client.messages.create({
                    body: `Your DivyaDarshan OTP is: ${otp}. Valid for 5 minutes. 🙏`,
                    from: process.env.TWILIO_PHONE_NUMBER,
                    to: identifier
                });
                console.log(`📱 Real SMS OTP sent to ${identifier}`);
            } else {
                console.log(`⚠️ Twilio credentials missing in .env. Showing mock OTP for ${identifier}: ${otp}`);
            }
        }

        res.json({
            message: `OTP sent successfully to ${identifier}.`
        });
    } catch (error) {
        console.error('Error dispatching real OTP:', error);
        // Fallback to success response so UI doesn't break, just in case real delivery fails but simulated console log still works.
        res.json({
            message: `OTP processed for ${identifier}. (Check logs if real delivery failed)`
        });
    }
});

// POST /api/auth/verify-otp
router.post('/verify-otp', (req, res) => {
    const { identifier, otp } = req.body;

    if (!identifier || !otp) {
        return res.status(400).json({ error: 'Identifier and OTP are required' });
    }

    const record = otpStore.get(identifier);

    if (!record) {
        return res.status(400).json({ error: 'No OTP requested for this identifier or it expired' });
    }

    if (Date.now() > record.expiresAt) {
        otpStore.delete(identifier);
        return res.status(400).json({ error: 'OTP has expired' });
    }

    if (record.otp === otp) {
        // Clear OTP after successful use
        otpStore.delete(identifier);

        const isEmail = identifier.includes('@');

        // Find existing user or create a new mock one
        let user = users.find(u => u.email === identifier || u.phone === identifier);

        if (!user) {
            user = {
                id: uuidv4(),
                name: isEmail ? identifier.split('@')[0] : 'Devotee',
                email: isEmail ? identifier : '',
                phone: !isEmail ? identifier : '',
                createdAt: new Date().toISOString()
            };
            users.push(user);
        }

        const token = jwt.sign({ id: user.id, name: user.name, email: user.email }, JWT_SECRET, { expiresIn: '7d' });

        res.json({
            message: 'OTP Verified! Login successful.',
            token,
            user: { id: user.id, name: user.name, email: user.email, phone: user.phone }
        });
    } else {
        res.status(400).json({ error: 'Invalid OTP' });
    }
});

module.exports = router;
