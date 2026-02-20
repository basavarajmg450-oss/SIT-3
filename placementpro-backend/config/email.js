const nodemailer = require('nodemailer');

let transporter = null;

const getTransporter = () => {
  if (!transporter) {
    transporter = nodemailer.createTransport({
      host: process.env.EMAIL_HOST || 'smtp.gmail.com',
      port: parseInt(process.env.EMAIL_PORT) || 587,
      secure: false,
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASSWORD,
      },
    });
  }
  return transporter;
};

const sendEmail = async ({ to, subject, html, text }) => {
  try {
    if (!process.env.EMAIL_USER || process.env.EMAIL_USER === 'your_email@gmail.com') {
      console.log(`📧 [MOCK EMAIL] To: ${to} | Subject: ${subject}`);
      return { messageId: 'mock-' + Date.now(), mock: true };
    }
    const transport = getTransporter();
    const info = await transport.sendMail({
      from: process.env.EMAIL_FROM || `PlacementPro <${process.env.EMAIL_USER}>`,
      to,
      subject,
      html,
      text,
    });
    console.log(`📧 Email sent: ${info.messageId}`);
    return info;
  } catch (error) {
    console.error('Email Error:', error.message);
    console.log(`📧 [FALLBACK] To: ${to} | Subject: ${subject}`);
    return { messageId: 'fallback-' + Date.now(), error: error.message };
  }
};

const sendOTPEmail = async (email, otp) => {
  const html = `
    <!DOCTYPE html>
    <html>
    <head><style>
      body { font-family: Arial, sans-serif; background: #f0f4ff; }
      .container { max-width: 500px; margin: 40px auto; background: white; border-radius: 16px; padding: 40px; box-shadow: 0 4px 20px rgba(0,0,0,0.1); }
      .logo { text-align: center; margin-bottom: 24px; }
      .logo h1 { color: #6366f1; font-size: 28px; margin: 0; }
      .otp-box { background: linear-gradient(135deg, #6366f1, #8b5cf6); border-radius: 12px; padding: 24px; text-align: center; margin: 24px 0; }
      .otp { font-size: 40px; font-weight: bold; color: white; letter-spacing: 8px; }
      .note { color: #6b7280; font-size: 14px; text-align: center; }
      .footer { text-align: center; color: #9ca3af; font-size: 12px; margin-top: 24px; }
    </style></head>
    <body>
      <div class="container">
        <div class="logo"><h1>🎓 PlacementPro</h1></div>
        <h2 style="color: #1f2937; text-align: center;">Your OTP Code</h2>
        <p style="color: #6b7280; text-align: center;">Use the following code to login to your PlacementPro account:</p>
        <div class="otp-box"><div class="otp">${otp}</div></div>
        <p class="note">⏱️ This OTP is valid for <strong>10 minutes</strong>.</p>
        <p class="note">If you didn't request this, please ignore this email.</p>
        <div class="footer">© 2024 PlacementPro • Your Career Launchpad</div>
      </div>
    </body>
    </html>
  `;
  return sendEmail({ to: email, subject: 'Your PlacementPro OTP Code', html, text: `Your OTP: ${otp} (valid for 10 minutes)` });
};

const sendDriveNotification = async (email, driveName, company, deadline) => {
  const html = `
    <!DOCTYPE html>
    <html>
    <head><style>
      body { font-family: Arial, sans-serif; background: #f0f4ff; }
      .container { max-width: 500px; margin: 40px auto; background: white; border-radius: 16px; padding: 40px; box-shadow: 0 4px 20px rgba(0,0,0,0.1); }
      .header { background: linear-gradient(135deg, #6366f1, #8b5cf6); border-radius: 12px; padding: 24px; text-align: center; margin-bottom: 24px; }
      .header h2 { color: white; margin: 0; }
      .badge { display: inline-block; background: #10b981; color: white; padding: 4px 12px; border-radius: 20px; font-size: 12px; margin-bottom: 8px; }
      .btn { display: block; width: fit-content; margin: 24px auto; background: linear-gradient(135deg, #6366f1, #8b5cf6); color: white; padding: 12px 32px; border-radius: 8px; text-decoration: none; font-weight: bold; }
    </style></head>
    <body>
      <div class="container">
        <div class="header">
          <div class="badge">New Opportunity</div>
          <h2>🚀 ${company} is Hiring!</h2>
        </div>
        <p>A new placement drive has been announced for <strong>${driveName}</strong>.</p>
        <p><strong>🏢 Company:</strong> ${company}</p>
        <p><strong>⏰ Apply Before:</strong> ${new Date(deadline).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
        <p>Login to PlacementPro to view full details and apply.</p>
        <a href="${process.env.FRONTEND_URL}/drives" class="btn">View Drive Details →</a>
      </div>
    </body>
    </html>
  `;
  return sendEmail({ to: email, subject: `New Placement Drive: ${company} | PlacementPro`, html });
};

const sendInterviewSchedule = async (email, studentName, company, date, time, type) => {
  const html = `
    <!DOCTYPE html>
    <html>
    <head><style>
      body { font-family: Arial, sans-serif; background: #f0f4ff; }
      .container { max-width: 500px; margin: 40px auto; background: white; border-radius: 16px; padding: 40px; box-shadow: 0 4px 20px rgba(0,0,0,0.1); }
      .header { background: linear-gradient(135deg, #10b981, #059669); border-radius: 12px; padding: 24px; text-align: center; margin-bottom: 24px; }
      .header h2 { color: white; margin: 0; }
      .detail-row { display: flex; justify-content: space-between; padding: 12px 0; border-bottom: 1px solid #f3f4f6; }
      .label { color: #6b7280; }
      .value { font-weight: bold; color: #1f2937; }
    </style></head>
    <body>
      <div class="container">
        <div class="header"><h2>📅 Interview Scheduled!</h2></div>
        <p>Dear <strong>${studentName}</strong>, your interview has been scheduled.</p>
        <div class="detail-row"><span class="label">🏢 Company</span><span class="value">${company}</span></div>
        <div class="detail-row"><span class="label">📅 Date</span><span class="value">${new Date(date).toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}</span></div>
        <div class="detail-row"><span class="label">⏰ Time</span><span class="value">${time}</span></div>
        <div class="detail-row"><span class="label">💻 Type</span><span class="value">${type}</span></div>
        <p style="margin-top: 24px; color: #6b7280;">Best of luck! Prepare well and give your best.</p>
      </div>
    </body>
    </html>
  `;
  return sendEmail({ to: email, subject: `Interview Scheduled: ${company} | PlacementPro`, html });
};

const sendPasswordResetEmail = async (email, resetUrl) => {
  const html = `
    <!DOCTYPE html>
    <html>
    <head><style>
      body { font-family: Arial, sans-serif; background: #f0f4ff; }
      .container { max-width: 500px; margin: 40px auto; background: white; border-radius: 16px; padding: 40px; box-shadow: 0 4px 20px rgba(0,0,0,0.1); }
      .logo { text-align: center; margin-bottom: 24px; }
      .logo h1 { color: #6366f1; font-size: 28px; margin: 0; }
      .btn { display: inline-block; background: linear-gradient(135deg, #6366f1, #8b5cf6); color: white; padding: 14px 32px; border-radius: 8px; text-decoration: none; font-weight: bold; margin: 24px 0; }
      .note { color: #6b7280; font-size: 14px; }
      .footer { text-align: center; color: #9ca3af; font-size: 12px; margin-top: 24px; }
    </style></head>
    <body>
      <div class="container">
        <div class="logo"><h1>🎓 PlacementPro</h1></div>
        <h2 style="color: #1f2937; text-align: center;">Reset Your Password</h2>
        <p class="note">You requested a password reset. Click the button below to set a new password:</p>
        <p style="text-align: center;"><a href="${resetUrl}" class="btn">Reset Password</a></p>
        <p class="note">This link expires in 1 hour. If you didn't request this, ignore this email.</p>
        <div class="footer">© 2024 PlacementPro • Your Career Launchpad</div>
      </div>
    </body>
    </html>
  `;
  return sendEmail({ to: email, subject: 'Reset Your PlacementPro Password', html, text: `Reset password: ${resetUrl}` });
};

module.exports = { sendEmail, sendOTPEmail, sendDriveNotification, sendInterviewSchedule, sendPasswordResetEmail };
