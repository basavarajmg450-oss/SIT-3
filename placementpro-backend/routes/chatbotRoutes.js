const express = require('express');
const router = express.Router();
const { authenticate } = require('../middleware/auth');
const { sendMessage, mockInterview, getResumeReview } = require('../controllers/chatbotController');
const rateLimit = require('express-rate-limit');

const chatLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 20,
  message: { success: false, message: 'Too many messages. Please slow down.' },
});

router.use(authenticate, chatLimiter);

router.post('/message', sendMessage);
router.post('/mock-interview', mockInterview);
router.post('/resume-review', getResumeReview);

module.exports = router;
