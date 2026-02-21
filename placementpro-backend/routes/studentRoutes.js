const express = require('express');
const router = express.Router();
const { authenticate } = require('../middleware/auth');
const { requireRole } = require('../middleware/roleCheck');
const { getProfile, updateProfile, generateResume, getEligibleDrives, applyToDrive, getApplications, getSkillGap, bookMentorship, submitAlumniReview } = require('../controllers/studentController');

router.use(authenticate, requireRole('student'));

router.get('/profile', getProfile);
router.put('/profile', updateProfile);
router.post('/resume', generateResume);
router.get('/eligible-drives', getEligibleDrives);
router.post('/apply-drive', applyToDrive);
router.get('/applications', getApplications);
router.get('/skill-gap', getSkillGap);
router.post('/book-mentorship', bookMentorship);
router.post('/alumni-review', submitAlumniReview);

module.exports = router;
