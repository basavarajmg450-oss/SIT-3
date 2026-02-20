const mongoose = require('mongoose');

const userSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      index: true,
    },
    role: {
      type: String,
      enum: ['student', 'tpo', 'alumni'],
      required: true,
    },
    otp: { type: String, default: null },
    otpExpiry: { type: Date, default: null },
    otpAttempts: { type: Number, default: 0 },
    isActive: { type: Boolean, default: true },
    lastLogin: { type: Date, default: null },
  },
  { timestamps: true }
);

userSchema.methods.clearOTP = function () {
  this.otp = null;
  this.otpExpiry = null;
  this.otpAttempts = 0;
};

userSchema.methods.isOTPValid = function (inputOtp) {
  return (
    this.otp === inputOtp &&
    this.otpExpiry &&
    new Date() < new Date(this.otpExpiry)
  );
};

userSchema.index({ email: 1, role: 1 });

module.exports = mongoose.model('User', userSchema);
