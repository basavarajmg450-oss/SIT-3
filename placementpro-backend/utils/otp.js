const crypto = require('crypto');

const generateOTP = () => {
  return crypto.randomInt(100000, 999999).toString();
};

const getOTPExpiry = () => {
  const expiry = new Date();
  expiry.setMinutes(expiry.getMinutes() + parseInt(process.env.OTP_EXPIRY_MINUTES || 10));
  return expiry;
};

module.exports = { generateOTP, getOTPExpiry };
