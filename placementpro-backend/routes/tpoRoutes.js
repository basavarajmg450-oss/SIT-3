const express = require('express');
const router = express.Router();
const { authenticate } = require('../middleware/auth');
const { requireRole } = require('../middleware/roleCheck');
const { auditLogger } = require('../middleware/auditLogger');
const {
  createDrive,
  getDrives,
  getEligibleStudents,
  scheduleInterview,
  updateApplicationStatus,
  getAnalytics,
  notifyStudents,
  getAuditLogsController,
  exportReport,
  updateDrive,
  getInterviewSlots,
} = require('../controllers/tpoController');

router.use(authenticate, requireRole('tpo'));

router.post('/drive', auditLogger('CREATE_DRIVE'), createDrive);
router.get('/drives', getDrives);
router.get('/drive/:id/eligible-students', getEligibleStudents);
router.put('/drive/:id', auditLogger('UPDATE_DRIVE'), updateDrive);
router.post('/interview-schedule', auditLogger('SCHEDULE_INTERVIEW'), scheduleInterview);
router.put('/application-status', auditLogger('UPDATE_APPLICATION_STATUS'), updateApplicationStatus);
router.get('/analytics', getAnalytics);
router.post('/notify', auditLogger('SEND_NOTIFICATION'), notifyStudents);
router.get('/audit-logs', getAuditLogsController);
router.get('/interview-slots', getInterviewSlots);
router.get('/export-report', exportReport);

module.exports = router;
