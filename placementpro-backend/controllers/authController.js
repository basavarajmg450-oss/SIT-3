const User = require('../models/User');
const StudentProfile = require('../models/StudentProfile');
const AlumniProfile = require('../models/AlumniProfile');
const { generateOTP, getOTPExpiry } = require('../utils/otp');
const { generateToken } = require('../utils/jwt');
const { sendOTPEmail } = require('../config/email');

const sendOTP = async (req, res) => {
  try {
    const { email, role } = req.body;

    if (!email || !role) {
      return res.status(400).json({ success: false, message: 'Email and role are required.' });
    }
    if (!['student', 'tpo', 'alumni'].includes(role)) {
      return res.status(400).json({ success: false, message: 'Invalid role.' });
    }

    let user = await User.findOne({ email: email.toLowerCase() });

    if (!user) {
      user = new User({ email: email.toLowerCase(), role });
    } else if (user.role !== role) {
      return res.status(403).json({ success: false, message: `This email is registered as ${user.role}, not ${role}.` });
    }

    if (user.otpAttempts >= 5 && user.otpExpiry && new Date() < new Date(user.otpExpiry)) {
      return res.status(429).json({ success: false, message: 'Too many OTP attempts. Please wait 10 minutes.' });
    }

    const otp = generateOTP();
    user.otp = otp;
    user.otpExpiry = getOTPExpiry();
    user.otpAttempts = (user.otpAttempts || 0) + 1;
    await user.save();

    await sendOTPEmail(email, otp);

    console.log(`🔐 OTP for ${email}: ${otp}`);

    res.json({ success: true, message: 'OTP sent successfully. Check your email.', email, role });
  } catch (error) {
    console.error('sendOTP error:', error);
    res.status(500).json({ success: false, message: 'Failed to send OTP.' });
  }
};

const verifyOTP = async (req, res) => {
  try {
    const { email, otp, role } = req.body;

    if (!email || !otp) {
      return res.status(400).json({ success: false, message: 'Email and OTP are required.' });
    }

    const user = await User.findOne({ email: email.toLowerCase() });

    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found. Please send OTP first.' });
    }

    if (!user.isOTPValid(otp)) {
      return res.status(400).json({ success: false, message: 'Invalid or expired OTP.' });
    }

    user.clearOTP();
    user.lastLogin = new Date();
    await user.save();

    const token = generateToken({ userId: user._id, email: user.email, role: user.role });

    let profile = null;
    if (user.role === 'student') {
      profile = await StudentProfile.findOne({ userId: user._id });
    } else if (user.role === 'alumni') {
      profile = await AlumniProfile.findOne({ userId: user._id });
    }

    res.json({
      success: true,
      message: 'Login successful!',
      token,
      user: { id: user._id, email: user.email, role: user.role, lastLogin: user.lastLogin },
      profile,
      isNewUser: !profile,
    });
  } catch (error) {
    console.error('verifyOTP error:', error);
    res.status(500).json({ success: false, message: 'Verification failed.' });
  }
};

const logout = async (req, res) => {
  res.json({ success: true, message: 'Logged out successfully.' });
};

const getMe = async (req, res) => {
  try {
    const user = req.user;
    let profile = null;

    if (user.role === 'student') {
      profile = await StudentProfile.findOne({ userId: user._id });
    } else if (user.role === 'alumni') {
      profile = await AlumniProfile.findOne({ userId: user._id });
    }

    res.json({ success: true, user: { id: user._id, email: user.email, role: user.role, lastLogin: user.lastLogin }, profile });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to get user info.' });
  }
};

module.exports = { sendOTP, verifyOTP, logout, getMe };
