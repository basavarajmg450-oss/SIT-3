const express = require('express');
const router = express.Router();
const { sendOTP, verifyOTP, logout, getMe } = require('../controllers/authController');
const { authenticate } = require('../middleware/auth');
const rateLimit = require('express-rate-limit');

const otpLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5,
  message: { success: false, message: 'Too many OTP requests. Please wait 15 minutes.' },
  skipSuccessfulRequests: false,
});

router.post('/send-otp', otpLimiter, sendOTP);
router.post('/verify-otp', verifyOTP);
router.post('/logout', authenticate, logout);
router.get('/me', authenticate, getMe);

module.exports = router;
