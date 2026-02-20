const Drive = require('../models/Drive');
const Application = require('../models/Application');
const StudentProfile = require('../models/StudentProfile');
const InterviewSlot = require('../models/InterviewSlot');
const Notification = require('../models/Notification');
const User = require('../models/User');
const { filterStudents, rankStudents } = require('../utils/criteriaEngine');
const { getAuditLogs } = require('../middleware/auditLogger');
const { getPlacementStats, getBranchWisePlacement, getMonthlyApplicationTrends, getCompanyWisePlacements, getSkillDistribution } = require('../utils/analytics');
const { sendDriveNotification, sendInterviewSchedule } = require('../config/email');
const { generateResumePDF } = require('../utils/pdfGenerator');

const createDrive = async (req, res) => {
  try {
    const { title, company, description, jobRole, minCGPA, maxBacklogs, eligibleBranches, salaryMin, salaryMax, location, workMode, driveDate, deadline, rounds, requirements, perks, maxHires } = req.body;

    const drive = new Drive({
      title, company, description, jobRole,
      minCGPA: parseFloat(minCGPA),
      maxBacklogs: parseInt(maxBacklogs),
      eligibleBranches: Array.isArray(eligibleBranches) ? eligibleBranches : [eligibleBranches],
      salaryMin, salaryMax, location, workMode, driveDate, deadline,
      rounds, requirements, perks, maxHires,
      createdBy: req.user._id,
    });

    await drive.save();

    const eligibleStudents = await StudentProfile.find({
      cgpa: { $gte: drive.minCGPA },
      backlogs: { $lte: drive.maxBacklogs },
      branch: { $in: drive.eligibleBranches },
    }).populate('userId', 'email');

    const notificationPromises = eligibleStudents.map(async (student) => {
      await Notification.create({
        userId: student.userId._id,
        type: 'drive',
        title: `New Drive: ${company}`,
        message: `${company} is hiring for ${jobRole}. Apply before ${new Date(deadline).toLocaleDateString()}.`,
        actionLink: `/drives/${drive._id}`,
        metadata: { driveId: drive._id },
      });
      return sendDriveNotification(student.userId.email, title, company, deadline);
    });

    await Promise.allSettled(notificationPromises);

    res.status(201).json({ success: true, message: `Drive created and ${eligibleStudents.length} students notified!`, drive });
  } catch (error) {
    console.error('createDrive error:', error);
    res.status(500).json({ success: false, message: 'Failed to create drive.' });
  }
};

const getDrives = async (req, res) => {
  try {
    const { status, page = 1, limit = 10, search } = req.query;
    const filter = {};
    if (status) filter.status = status;
    if (search) filter.$or = [{ title: new RegExp(search, 'i') }, { company: new RegExp(search, 'i') }];

    const [drives, total] = await Promise.all([
      Drive.find(filter).sort('-createdAt').skip((page - 1) * limit).limit(parseInt(limit)),
      Drive.countDocuments(filter),
    ]);

    res.json({ success: true, drives, total, page: parseInt(page), pages: Math.ceil(total / limit) });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to get drives.' });
  }
};

const getEligibleStudents = async (req, res) => {
  try {
    const drive = await Drive.findById(req.params.id);
    if (!drive) return res.status(404).json({ success: false, message: 'Drive not found.' });

    const allStudents = await StudentProfile.find().populate('userId', 'email lastLogin');
    const eligible = filterStudents(allStudents.map((s) => ({ ...s.toObject(), id: s._id })), drive);
    const ranked = rankStudents(eligible);

    const appliedIds = await Application.find({ driveId: drive._id }).distinct('studentId');

    const enriched = ranked.map((s) => ({
      ...s,
      hasApplied: appliedIds.map((id) => id.toString()).includes(s.userId?.toString()),
    }));

    res.json({ success: true, students: enriched, total: enriched.length, drive: { title: drive.title, company: drive.company } });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to get eligible students.' });
  }
};

const scheduleInterview = async (req, res) => {
  try {
    const { driveId, studentId, date, time, type, mode, venue, meetLink, notes, alumniId } = req.body;

    const [drive, student] = await Promise.all([
      Drive.findById(driveId),
      User.findById(studentId),
    ]);

    if (!drive) return res.status(404).json({ success: false, message: 'Drive not found.' });
    if (!student) return res.status(404).json({ success: false, message: 'Student not found.' });

    const slot = new InterviewSlot({
      driveId, studentId, alumniId,
      scheduledBy: req.user._id,
      date, time, type, mode, venue, meetLink, notes,
    });
    await slot.save();

    await Application.findOneAndUpdate(
      { driveId, studentId },
      { status: 'Interview', interviewSchedule: { date, time, venue, type: mode, meetLink } }
    );

    const studentProfile = await StudentProfile.findOne({ userId: studentId });

    await Notification.create({
      userId: studentId,
      type: 'interview',
      title: 'Interview Scheduled!',
      message: `Your interview for ${drive.company} is scheduled on ${new Date(date).toLocaleDateString()} at ${time}.`,
      actionLink: '/applications',
    });

    if (studentProfile) {
      await sendInterviewSchedule(student.email, studentProfile.name, drive.company, date, time, type);
    }

    res.status(201).json({ success: true, message: 'Interview scheduled and student notified!', slot });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to schedule interview.' });
  }
};

const updateApplicationStatus = async (req, res) => {
  try {
    const { applicationId, status, feedback } = req.body;

    const application = await Application.findById(applicationId);
    if (!application) return res.status(404).json({ success: false, message: 'Application not found.' });

    const drive = await Drive.findById(application.driveId);
    application.status = status;
    if (feedback) application.feedback = feedback;

    if (status === 'Selected') {
      await StudentProfile.findOneAndUpdate(
        { userId: application.studentId },
        { isPlaced: true, placedCompany: drive?.company, placedPackage: drive?.salaryMax }
      );
      await Drive.findByIdAndUpdate(application.driveId, { $inc: { selectedCount: 1 } });
    }

    await application.save();

    await Notification.create({
      userId: application.studentId,
      type: 'result',
      title: `Application Status Updated`,
      message: `Your application for ${drive?.company} has been updated to: ${status}. ${feedback ? `Feedback: ${feedback}` : ''}`,
      actionLink: '/applications',
    });

    res.json({ success: true, message: 'Application status updated.', application });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to update status.' });
  }
};

const getAnalytics = async (req, res) => {
  try {
    const [stats, branchWise, trends, companyWise, skillDistribution] = await Promise.all([
      getPlacementStats(),
      getBranchWisePlacement(),
      getMonthlyApplicationTrends(),
      getCompanyWisePlacements(),
      getSkillDistribution(),
    ]);

    res.json({ success: true, stats, branchWise, trends, companyWise, skillDistribution });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to get analytics.' });
  }
};

const notifyStudents = async (req, res) => {
  try {
    const { userIds, title, message, type, actionLink } = req.body;

    const notifications = userIds.map((userId) => ({
      userId, type: type || 'system', title, message, actionLink,
    }));

    await Notification.insertMany(notifications);

    res.json({ success: true, message: `${userIds.length} students notified.` });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to send notifications.' });
  }
};

const getAuditLogsController = async (req, res) => {
  try {
    const logs = getAuditLogs(req.query);
    res.json({ success: true, logs, total: logs.length });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to get audit logs.' });
  }
};

const exportReport = async (req, res) => {
  try {
    const { format = 'json', driveId } = req.query;

    const filter = driveId ? { driveId } : {};
    const applications = await Application.find(filter)
      .populate('driveId', 'title company salaryMin salaryMax jobRole')
      .populate('studentId', 'email')
      .lean();

    const studentIds = applications.map((a) => a.studentId?._id).filter(Boolean);
    const profiles = await StudentProfile.find({ userId: { $in: studentIds } }).lean();
    const profileMap = {};
    profiles.forEach((p) => { profileMap[p.userId.toString()] = p; });

    const reportData = applications.map((app) => {
      const profile = profileMap[app.studentId?._id?.toString()];
      return {
        studentName: profile?.name || 'N/A',
        email: app.studentId?.email || 'N/A',
        regNumber: profile?.regNumber || 'N/A',
        branch: profile?.branch || 'N/A',
        cgpa: profile?.cgpa || 'N/A',
        company: app.driveId?.company || 'N/A',
        role: app.driveId?.jobRole || 'N/A',
        status: app.status,
        appliedDate: new Date(app.appliedDate).toLocaleDateString(),
      };
    });

    res.json({ success: true, data: reportData, total: reportData.length, generatedAt: new Date().toISOString() });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to export report.' });
  }
};

const updateDrive = async (req, res) => {
  try {
    const drive = await Drive.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!drive) return res.status(404).json({ success: false, message: 'Drive not found.' });
    res.json({ success: true, message: 'Drive updated.', drive });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to update drive.' });
  }
};

module.exports = { createDrive, getDrives, getEligibleStudents, scheduleInterview, updateApplicationStatus, getAnalytics, notifyStudents, getAuditLogsController, exportReport, updateDrive };
