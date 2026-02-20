const crypto = require('crypto');
const bcrypt = require('bcryptjs');
const User = require('../models/User');
const StudentProfile = require('../models/StudentProfile');
const AlumniProfile = require('../models/AlumniProfile');
const { generateToken } = require('../utils/jwt');
const { sendPasswordResetEmail } = require('../config/email');

const register = async (req, res) => {
  try {
    const { email, password, role, name } = req.body;

    if (!email || !password || !role) {
      return res.status(400).json({ success: false, message: 'Email, password, and role are required.' });
    }
    if (!['student', 'tpo', 'alumni'].includes(role)) {
      return res.status(400).json({ success: false, message: 'Invalid role.' });
    }
    if (password.length < 6) {
      return res.status(400).json({ success: false, message: 'Password must be at least 6 characters.' });
    }

    const exists = await User.findOne({ email: email.toLowerCase(), role });
    if (exists) {
      return res.status(400).json({ success: false, message: `An account with this email already exists as ${role}.` });
    }

    const hashedPassword = await bcrypt.hash(password, 12);
    const user = new User({
      email: email.toLowerCase(),
      password: hashedPassword,
      role,
      name: name || '',
    });
    await user.save();

    const token = generateToken({ userId: user._id, email: user.email, role: user.role });
    let profile = null;
    if (user.role === 'student') {
      profile = await StudentProfile.findOne({ userId: user._id });
    } else if (user.role === 'alumni') {
      profile = await AlumniProfile.findOne({ userId: user._id });
    }

    res.status(201).json({
      success: true,
      message: 'Registration successful!',
      token,
      user: { id: user._id, email: user.email, role: user.role, name: user.name, lastLogin: user.lastLogin },
      profile,
      isNewUser: true,
    });
  } catch (error) {
    console.error('register error:', error);
    res.status(500).json({ success: false, message: 'Registration failed.' });
  }
};

const login = async (req, res) => {
  try {
    const { email, password, role } = req.body;

    if (!email || !password || !role) {
      return res.status(400).json({ success: false, message: 'Email, password, and role are required.' });
    }
    if (!['student', 'tpo', 'alumni'].includes(role)) {
      return res.status(400).json({ success: false, message: 'Invalid role.' });
    }

    const user = await User.findOne({ email: email.toLowerCase(), role }).select('+password');
    if (!user) {
      return res.status(401).json({ success: false, message: 'Invalid email or password.' });
    }

    const valid = await bcrypt.compare(password, user.password);
    if (!valid) {
      return res.status(401).json({ success: false, message: 'Invalid email or password.' });
    }

    if (!user.isActive) {
      return res.status(403).json({ success: false, message: 'Account is disabled.' });
    }

    user.lastLogin = new Date();
    await user.save({ validateBeforeSave: false });

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
      user: { id: user._id, email: user.email, role: user.role, name: user.name, lastLogin: user.lastLogin },
      profile,
      isNewUser: !profile,
    });
  } catch (error) {
    console.error('login error:', error);
    res.status(500).json({ success: false, message: 'Login failed.' });
  }
};

const forgotPassword = async (req, res) => {
  try {
    const { email, role } = req.body;
    if (!email || !role || !['student', 'tpo', 'alumni'].includes(role)) {
      return res.status(400).json({ success: false, message: 'Email and role are required.' });
    }

    const user = await User.findOne({ email: email.toLowerCase(), role }).select('+resetPasswordToken +resetPasswordExpires');
    if (!user) {
      return res.json({ success: true, message: 'If an account exists, a reset link has been sent.' });
    }

    const token = crypto.randomBytes(32).toString('hex');
    user.resetPasswordToken = crypto.createHash('sha256').update(token).digest('hex');
    user.resetPasswordExpires = new Date(Date.now() + 60 * 60 * 1000);
    await user.save({ validateBeforeSave: false });

    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
    const resetUrl = `${frontendUrl}/reset-password?token=${token}&email=${encodeURIComponent(user.email)}&role=${user.role}`;
    await sendPasswordResetEmail(user.email, resetUrl);

    if (process.env.NODE_ENV !== 'production') {
      console.log(`🔗 Password reset link (dev): ${resetUrl}`);
    }

    // In development or when email is not configured, return the link so user can still reset
    const isMockEmail = !process.env.EMAIL_USER || process.env.EMAIL_USER === 'your_email@gmail.com';
    res.json({
      success: true,
      message: isMockEmail
        ? 'Reset link generated. Use the link below (email is not configured).'
        : 'If an account exists, a reset link has been sent to your email.',
      ...((process.env.NODE_ENV !== 'production' || isMockEmail) && { resetLink: resetUrl }),
    });
  } catch (error) {
    console.error('forgotPassword error:', error);
    res.status(500).json({ success: false, message: 'Failed to process request.' });
  }
};

const resetPassword = async (req, res) => {
  try {
    const { token, email, role, password } = req.body;
    if (!token || !email || !role || !password || password.length < 6) {
      return res.status(400).json({ success: false, message: 'Token, email, role, and password (min 6 chars) are required.' });
    }

    const hashedToken = crypto.createHash('sha256').update(token).digest('hex');
    const user = await User.findOne({
      email: email.toLowerCase(),
      role,
      resetPasswordToken: hashedToken,
      resetPasswordExpires: { $gt: new Date() },
    }).select('+password +resetPasswordToken +resetPasswordExpires');

    if (!user) {
      return res.status(400).json({ success: false, message: 'Invalid or expired reset link.' });
    }

    user.password = await bcrypt.hash(password, 12);
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;
    await user.save();

    res.json({ success: true, message: 'Password reset successful. You can now sign in.' });
  } catch (error) {
    console.error('resetPassword error:', error);
    res.status(500).json({ success: false, message: 'Failed to reset password.' });
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

    res.json({
      success: true,
      user: { id: user._id, email: user.email, role: user.role, name: user.name, lastLogin: user.lastLogin },
      profile,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to get user info.' });
  }
};

module.exports = { register, login, logout, getMe, forgotPassword, resetPassword };
