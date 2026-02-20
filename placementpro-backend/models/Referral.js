const mongoose = require('mongoose');

const referralSchema = new mongoose.Schema(
  {
    alumniId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    alumniProfileId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'AlumniProfile',
    },
    company: { type: String, required: true, trim: true },
    role: { type: String, required: true, trim: true },
    description: { type: String, required: true },
    requirements: [String],
    minCGPA: { type: Number, default: 6.0 },
    eligibleBranches: [String],
    salaryRange: { type: String },
    location: { type: String },
    deadline: { type: Date, required: true },
    maxReferrals: { type: Number, default: 5 },
    applicants: [
      {
        studentId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
        studentName: { type: String },
        studentEmail: { type: String },
        appliedDate: { type: Date, default: Date.now },
        status: {
          type: String,
          enum: ['Applied', 'Referred', 'Interview', 'Hired', 'Rejected'],
          default: 'Applied',
        },
        notes: { type: String },
      },
    ],
    status: {
      type: String,
      enum: ['Active', 'Closed', 'Expired'],
      default: 'Active',
      index: true,
    },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

referralSchema.index({ company: 1, status: 1 });
referralSchema.index({ deadline: 1, status: 1 });

module.exports = mongoose.model('Referral', referralSchema);
