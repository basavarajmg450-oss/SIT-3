const express = require('express');
const router = express.Router();
const { register, login, logout, getMe, forgotPassword, resetPassword } = require('../controllers/authController');
const { authenticate } = require('../middleware/auth');
const rateLimit = require('express-rate-limit');

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: process.env.NODE_ENV === 'production' ? 20 : 1000,
  message: { success: false, message: 'Too many login attempts. Please wait 15 minutes.' },
  skipSuccessfulRequests: true,
});

// router.post('/register', authLimiter, register);
// router.post('/login', authLimiter, login);
// router.post('/forgot-password', authLimiter, forgotPassword);
// router.post('/reset-password', authLimiter, resetPassword);
router.post('/register', register);
router.post('/login', login);
router.post('/forgot-password', forgotPassword);
router.post('/reset-password', resetPassword);
router.post('/logout', authenticate, logout);
router.get('/me', authenticate, getMe);

module.exports = router;
