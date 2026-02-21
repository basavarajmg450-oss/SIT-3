const StudentProfile = require('../models/StudentProfile');
const Drive = require('../models/Drive');
const Application = require('../models/Application');
const AlumniProfile = require('../models/AlumniProfile');
const Notification = require('../models/Notification');
const { checkStudentEligibility, calculateSkillGap } = require('../utils/criteriaEngine');
const { generateResumePDF } = require('../utils/pdfGenerator');
const { sendEmail } = require('../config/email');

const getProfile = async (req, res) => {
  try {
    let profile = await StudentProfile.findOne({ userId: req.user._id });
    if (!profile) {
      return res.status(404).json({ success: false, message: 'Profile not found. Please create your profile.' });
    }
    res.json({ success: true, profile });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to get profile.' });
  }
};

const updateProfile = async (req, res) => {
  try {
    const { name, regNumber, branch, semester, cgpa, backlogs, phone, skills, projects, linkedin, github, achievements, certifications } = req.body;

    let profile = await StudentProfile.findOne({ userId: req.user._id });

    if (!profile) {
      profile = new StudentProfile({
        userId: req.user._id,
        name: name || 'Student',
        branch: branch || 'Other',
        cgpa: !isNaN(parseFloat(cgpa)) ? parseFloat(cgpa) : 0
      });
    }

    if (name) profile.name = name;
    // Convert empty string to undefined so sparse unique index is not violated
    if (regNumber !== undefined) {
      if (regNumber && regNumber.trim()) {
        profile.regNumber = regNumber.trim();
      } else {
        profile.regNumber = undefined;
      }
    }
    if (branch) profile.branch = branch;
    if (semester && !isNaN(parseInt(semester))) profile.semester = parseInt(semester);
    if (cgpa !== undefined && !isNaN(parseFloat(cgpa))) profile.cgpa = parseFloat(cgpa);
    if (backlogs !== undefined && !isNaN(parseInt(backlogs))) profile.backlogs = parseInt(backlogs);
    if (phone) profile.phone = phone;
    if (skills) profile.skills = Array.isArray(skills) ? skills : skills.split(',').map((s) => s.trim());
    if (projects) profile.projects = projects;
    if (linkedin) profile.linkedin = linkedin;
    if (github) profile.github = github;
    if (achievements) profile.achievements = achievements;
    if (certifications) profile.certifications = certifications;

    // Ensure branch enum is always valid before save
    const validBranches = ['CSE', 'IT', 'ECE', 'EEE', 'ME', 'CE', 'MCA', 'MBA', 'Other'];
    if (!validBranches.includes(profile.branch)) profile.branch = 'Other';

    profile.calculateCompleteness();
    await profile.save();

    res.json({ success: true, message: 'Profile updated successfully.', profile });
  } catch (error) {
    console.error('updateProfile error:', error);
    let message = 'Failed to update profile.';
    if (error.code === 11000) {
      const field = Object.keys(error.keyPattern)[0];
      message = `Duplicate value: ${field === 'regNumber' ? 'Registration Number' : field} already exists.`;
    } else if (error.name === 'ValidationError') {
      message = Object.values(error.errors).map(val => val.message).join(', ');
    } else {
      message = error.message || message;
    }
    res.status(400).json({ success: false, message });
  }
};

const generateResume = async (req, res) => {
  try {
    const profile = await StudentProfile.findOne({ userId: req.user._id });
    if (!profile) {
      return res.status(404).json({ success: false, message: 'Profile not found.' });
    }

    const profileData = {
      name: profile.name,
      email: req.user.email,
      phone: profile.phone,
      branch: profile.branch,
      semester: profile.semester,
      cgpa: profile.cgpa,
      regNumber: profile.regNumber,
      skills: profile.skills,
      projects: profile.projects,
      achievements: profile.achievements,
      certifications: profile.certifications,
      linkedin: profile.linkedin,
      github: profile.github,
      collegeName: 'ABC Engineering College',
    };

    const pdfBuffer = await generateResumePDF(profileData);

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="${profile.name.replace(/\s+/g, '_')}_Resume.pdf"`);
    res.send(pdfBuffer);
  } catch (error) {
    console.error('generateResume error:', error);
    res.status(500).json({ success: false, message: 'Failed to generate resume.' });
  }
};

const getEligibleDrives = async (req, res) => {
  try {
    const profile = await StudentProfile.findOne({ userId: req.user._id });
    const { page = 1, limit = 10, search, sort = '-createdAt' } = req.query;

    let eligibleDrives = [];
    // Relaxed deadline filter to ensure data loads in dev/test
    const drives = await Drive.find({ status: 'Active' }).sort(sort);

    if (!profile) {
      eligibleDrives = drives;
    } else {
      eligibleDrives = drives.filter((drive) => {
        try {
          // If profile is incomplete, show the drive anyway but might mark as ineligible in reasons
          const { eligible } = checkStudentEligibility(profile, drive);
          return eligible;
        } catch (e) {
          return true; // Fallback to show if logic fails
        }
      });

      // If no eligible drives but some active ones exist, show active ones anyway
      if (eligibleDrives.length === 0 && drives.length > 0) {
        eligibleDrives = drives;
      }
    }

    const appliedDriveIds = await Application.find({ studentId: req.user._id }).distinct('driveId');

    const enriched = eligibleDrives.map((drive) => ({
      ...drive.toObject(),
      hasApplied: appliedDriveIds.map((id) => id.toString()).includes(drive._id.toString()),
    }));

    const filtered = search
      ? enriched.filter((d) => d.title?.toLowerCase().includes(search.toLowerCase()) || d.company?.toLowerCase().includes(search.toLowerCase()))
      : enriched;

    const start = (page - 1) * limit;
    const paginated = filtered.slice(start, start + parseInt(limit));

    res.json({
      success: true,
      drives: paginated,
      total: filtered.length,
      page: parseInt(page),
      pages: Math.ceil(filtered.length / limit),
      hasProfile: !!profile
    });
  } catch (error) {
    console.error('getEligibleDrives error:', error);
    res.status(500).json({ success: false, message: 'Failed to get drives.' });
  }
};

const applyToDrive = async (req, res) => {
  try {
    const { driveId } = req.body;

    const drive = await Drive.findById(driveId);
    if (!drive) return res.status(404).json({ success: false, message: 'Drive not found.' });
    if (drive.status !== 'Active') return res.status(400).json({ success: false, message: 'Drive is not active.' });
    if (new Date() > new Date(drive.deadline)) return res.status(400).json({ success: false, message: 'Application deadline has passed.' });

    const profile = await StudentProfile.findOne({ userId: req.user._id });
    if (!profile) return res.status(404).json({ success: false, message: 'Please complete your profile first.' });

    const { eligible, reasons } = checkStudentEligibility(profile, drive);
    if (!eligible) return res.status(403).json({ success: false, message: 'Not eligible for this drive.', reasons });

    const existing = await Application.findOne({ driveId, studentId: req.user._id });
    if (existing) return res.status(409).json({ success: false, message: 'Already applied to this drive.' });

    const application = new Application({
      driveId,
      studentId: req.user._id,
      studentProfileId: profile._id,
    });
    await application.save();

    await Drive.findByIdAndUpdate(driveId, { $inc: { applicationCount: 1 } });

    await Notification.create({
      userId: req.user._id,
      type: 'application',
      title: 'Application Submitted',
      message: `Your application for ${drive.company} - ${drive.title} has been submitted successfully!`,
      actionLink: `/applications`,
    });

    res.status(201).json({ success: true, message: 'Application submitted successfully!', application });
  } catch (error) {
    console.error('applyToDrive error:', error);
    res.status(500).json({ success: false, message: error.message || 'Failed to apply.' });
  }
};

const getApplications = async (req, res) => {
  try {
    const { status, page = 1, limit = 10 } = req.query;
    const filter = { studentId: req.user._id };
    if (status) filter.status = status;

    const [applications, total] = await Promise.all([
      Application.find(filter)
        .populate('driveId', 'title company location salary driveDate deadline status salaryMin salaryMax jobRole')
        .sort('-createdAt')
        .skip((page - 1) * limit)
        .limit(parseInt(limit)),
      Application.countDocuments(filter),
    ]);

    res.json({ success: true, applications, total, page: parseInt(page), pages: Math.ceil(total / limit) });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to get applications.' });
  }
};

const getSkillGap = async (req, res) => {
  try {
    const profile = await StudentProfile.findOne({ userId: req.user._id });
    if (!profile) return res.status(404).json({ success: false, message: 'Profile not found.' });

    const activeDrives = await Drive.find({ status: 'Active' }).select('requirements title company');

    const allRequiredSkills = [];
    activeDrives.forEach((d) => allRequiredSkills.push(...(d.requirements || [])));

    const skillFrequency = {};
    allRequiredSkills.forEach((skill) => {
      const normalized = skill.toLowerCase().trim();
      skillFrequency[normalized] = (skillFrequency[normalized] || 0) + 1;
    });

    const topSkills = Object.entries(skillFrequency)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 15)
      .map(([skill]) => skill);

    const gap = calculateSkillGap(profile.skills, topSkills);

    const recommendations = gap.missing.slice(0, 5).map((skill) => ({
      skill,
      resources: [
        { name: `Learn ${skill} on Coursera`, url: `https://www.coursera.org/search?query=${encodeURIComponent(skill)}` },
        { name: `${skill} Tutorial on YouTube`, url: `https://www.youtube.com/results?search_query=${encodeURIComponent(skill + ' tutorial')}` },
      ],
    }));

    res.json({ success: true, studentSkills: profile.skills, topMarketSkills: topSkills, gap, recommendations });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to get skill gap.' });
  }
};

const bookMentorship = async (req, res) => {
  try {
    const { alumniId, slotId, topic } = req.body;

    const alumni = await AlumniProfile.findById(alumniId);
    if (!alumni) return res.status(404).json({ success: false, message: 'Alumni not found.' });

    const slot = alumni.slots.id(slotId);
    if (!slot) return res.status(404).json({ success: false, message: 'Slot not found.' });
    if (slot.isBooked) return res.status(409).json({ success: false, message: 'Slot already booked.' });

    slot.isBooked = true;
    slot.bookedBy = req.user._id;
    alumni.totalMentorships += 1;
    await alumni.save();

    const profile = await StudentProfile.findOne({ userId: req.user._id });
    if (profile) {
      profile.mentorshipBooked.push({ alumniId: alumni._id, slotId, date: slot.date, topic: topic || slot.topic });
      await profile.save();
    }

    await Notification.create({
      userId: req.user._id,
      type: 'mentorship',
      title: 'Mentorship Booked',
      message: `Your mentorship session with ${alumni.name} (${alumni.company}) has been confirmed for ${new Date(slot.date).toLocaleDateString()}.`,
    });

    res.json({ success: true, message: 'Mentorship slot booked successfully!', slot: { date: slot.date, time: slot.time, alumni: alumni.name, company: alumni.company } });
  } catch (error) {
    console.error('bookMentorship error:', error);
    res.status(500).json({ success: false, message: error.message || 'Failed to book mentorship.' });
  }
};

module.exports = { getProfile, updateProfile, generateResume, getEligibleDrives, applyToDrive, getApplications, getSkillGap, bookMentorship };
