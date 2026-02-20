const AlumniProfile = require('../models/AlumniProfile');
const Referral = require('../models/Referral');
const InterviewSlot = require('../models/InterviewSlot');
const Notification = require('../models/Notification');
const StudentProfile = require('../models/StudentProfile');
const User = require('../models/User');
const { v4: uuidv4 } = require('uuid');

const getProfile = async (req, res) => {
  try {
    let profile = await AlumniProfile.findOne({ userId: req.user._id });
    if (!profile) {
      return res.status(404).json({ success: false, message: 'Profile not found.', isNewUser: true });
    }
    res.json({ success: true, profile });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to get profile.' });
  }
};

const updateProfile = async (req, res) => {
  try {
    const { name, graduationYear, branch, company, designation, domain, linkedin, bio, skills, mentorshipAvailable } = req.body;

    let profile = await AlumniProfile.findOne({ userId: req.user._id });

    if (!profile) {
      profile = new AlumniProfile({ userId: req.user._id, name, graduationYear, company, designation });
    }

    if (name) profile.name = name;
    if (graduationYear) profile.graduationYear = graduationYear;
    if (branch) profile.branch = branch;
    if (company) profile.company = company;
    if (designation) profile.designation = designation;
    if (domain) profile.domain = domain;
    if (linkedin) profile.linkedin = linkedin;
    if (bio) profile.bio = bio;
    if (skills) profile.skills = Array.isArray(skills) ? skills : skills.split(',').map((s) => s.trim());
    if (mentorshipAvailable !== undefined) profile.mentorshipAvailable = mentorshipAvailable;

    await profile.save();
    res.json({ success: true, message: 'Profile updated.', profile });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to update profile.' });
  }
};

const postReferral = async (req, res) => {
  try {
    const { company, role, description, requirements, minCGPA, eligibleBranches, salaryRange, location, deadline, maxReferrals } = req.body;

    const alumniProfile = await AlumniProfile.findOne({ userId: req.user._id });
    if (!alumniProfile) return res.status(404).json({ success: false, message: 'Alumni profile not found.' });

    const referral = new Referral({
      alumniId: req.user._id,
      alumniProfileId: alumniProfile._id,
      company, role, description,
      requirements: Array.isArray(requirements) ? requirements : (requirements || '').split(',').map((s) => s.trim()),
      minCGPA, eligibleBranches, salaryRange, location, deadline, maxReferrals,
    });
    await referral.save();

    alumniProfile.totalReferrals += 1;
    await alumniProfile.save();

    const eligibleStudents = await StudentProfile.find({
      cgpa: { $gte: minCGPA || 6.0 },
    }).populate('userId', 'email _id');

    const notifyPromises = eligibleStudents.slice(0, 50).map((student) =>
      Notification.create({
        userId: student.userId._id,
        type: 'referral',
        title: `Job Referral: ${company}`,
        message: `${alumniProfile.name} from ${alumniProfile.company} is offering referrals for ${role} at ${company}.`,
        actionLink: `/referrals/${referral._id}`,
      })
    );
    await Promise.allSettled(notifyPromises);

    res.status(201).json({ success: true, message: 'Referral posted successfully!', referral });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to post referral.' });
  }
};

const getReferrals = async (req, res) => {
  try {
    const referrals = await Referral.find({ alumniId: req.user._id }).sort('-createdAt');
    res.json({ success: true, referrals, total: referrals.length });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to get referrals.' });
  }
};

const getAllReferrals = async (req, res) => {
  try {
    const { page = 1, limit = 10 } = req.query;
    const [referrals, total] = await Promise.all([
      Referral.find({ status: 'Active', deadline: { $gte: new Date() } })
        .populate({ path: 'alumniId', select: 'email' })
        .populate({ path: 'alumniProfileId', select: 'name company designation' })
        .sort('-createdAt')
        .skip((page - 1) * limit)
        .limit(parseInt(limit)),
      Referral.countDocuments({ status: 'Active', deadline: { $gte: new Date() } }),
    ]);

    res.json({ success: true, referrals, total, page: parseInt(page), pages: Math.ceil(total / limit) });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to get referrals.' });
  }
};

const addMentorshipSlots = async (req, res) => {
  try {
    const { slots } = req.body;

    const profile = await AlumniProfile.findOne({ userId: req.user._id });
    if (!profile) return res.status(404).json({ success: false, message: 'Profile not found.' });

    const newSlots = (slots || []).map((slot) => ({
      ...slot,
      _id: new require('mongoose').Types.ObjectId(),
    }));

    profile.slots.push(...newSlots);
    profile.mentorshipAvailable = true;
    await profile.save();

    res.json({ success: true, message: `${newSlots.length} mentorship slots added.`, slots: profile.slots });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to add slots.' });
  }
};

const getMentorshipSlots = async (req, res) => {
  try {
    const profiles = await AlumniProfile.find({ mentorshipAvailable: true })
      .select('name company designation skills slots bio rating reviewCount')
      .lean();

    const available = profiles.map((p) => ({
      ...p,
      availableSlots: p.slots.filter((s) => !s.isBooked),
    })).filter((p) => p.availableSlots.length > 0);

    res.json({ success: true, mentors: available, total: available.length });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to get mentorship slots.' });
  }
};

const getInterviewReviews = async (req, res) => {
  try {
    const reviews = await InterviewSlot.find({ alumniId: req.user._id, status: 'Completed' })
      .populate('driveId', 'title company')
      .populate('studentId', 'email')
      .sort('-updatedAt');
    res.json({ success: true, reviews, total: reviews.length });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to get reviews.' });
  }
};

const updateInterviewReview = async (req, res) => {
  try {
    const { slotId, feedback, rating, result } = req.body;

    const slot = await InterviewSlot.findOneAndUpdate(
      { _id: slotId, alumniId: req.user._id },
      { feedback, rating, result, status: 'Completed' },
      { new: true }
    );

    if (!slot) return res.status(404).json({ success: false, message: 'Interview slot not found.' });

    await Notification.create({
      userId: slot.studentId,
      type: 'interview',
      title: 'Interview Feedback Available',
      message: `Your interview feedback has been submitted. Result: ${result}`,
      actionLink: '/applications',
    });

    res.json({ success: true, message: 'Review updated.', slot });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to update review.' });
  }
};

const applyForReferral = async (req, res) => {
  try {
    const { referralId } = req.body;

    const referral = await Referral.findById(referralId);
    if (!referral) return res.status(404).json({ success: false, message: 'Referral not found.' });
    if (referral.status !== 'Active') return res.status(400).json({ success: false, message: 'Referral is no longer active.' });

    const existing = referral.applicants.find((a) => a.studentId.toString() === req.user._id.toString());
    if (existing) return res.status(409).json({ success: false, message: 'Already applied for this referral.' });

    const profile = await StudentProfile.findOne({ userId: req.user._id });

    referral.applicants.push({
      studentId: req.user._id,
      studentName: profile?.name || 'Unknown',
      studentEmail: req.user.email,
    });

    if (referral.applicants.length >= (referral.maxReferrals || 5)) {
      referral.status = 'Closed';
    }

    await referral.save();

    await Notification.create({
      userId: referral.alumniId,
      type: 'referral',
      title: 'New Referral Application',
      message: `${profile?.name || req.user.email} has applied for the ${referral.role} referral at ${referral.company}.`,
    });

    res.json({ success: true, message: 'Applied for referral successfully!' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to apply for referral.' });
  }
};

module.exports = { getProfile, updateProfile, postReferral, getReferrals, getAllReferrals, addMentorshipSlots, getMentorshipSlots, getInterviewReviews, updateInterviewReview, applyForReferral };
