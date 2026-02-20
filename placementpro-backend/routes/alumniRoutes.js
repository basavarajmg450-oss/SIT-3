const express = require('express');
const router = express.Router();
const { authenticate } = require('../middleware/auth');
const { requireRole } = require('../middleware/roleCheck');
const { getProfile, updateProfile, postReferral, getReferrals, getAllReferrals, addMentorshipSlots, getMentorshipSlots, getInterviewReviews, updateInterviewReview, applyForReferral } = require('../controllers/alumniController');

router.use(authenticate);

router.get('/profile', requireRole('alumni'), getProfile);
router.put('/profile', requireRole('alumni'), updateProfile);
router.post('/referral', requireRole('alumni'), postReferral);
router.get('/referrals', requireRole('alumni'), getReferrals);
router.get('/referrals/all', getAllReferrals);
router.post('/mentorship-slots', requireRole('alumni'), addMentorshipSlots);
router.get('/mentorship-slots', getMentorshipSlots);
router.get('/interview-reviews', requireRole('alumni'), getInterviewReviews);
router.put('/interview-review', requireRole('alumni'), updateInterviewReview);
router.post('/apply-referral', requireRole('student'), applyForReferral);

module.exports = router;
