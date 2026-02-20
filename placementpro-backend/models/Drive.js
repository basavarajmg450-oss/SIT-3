const mongoose = require('mongoose');

const roundSchema = new mongoose.Schema({
  name: { type: String, required: true },
  description: { type: String },
  date: { type: Date },
  duration: { type: String },
});

const driveSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    company: { type: String, required: true, trim: true },
    companyLogo: { type: String, default: null },
    description: { type: String, required: true },
    jobRole: { type: String, required: true },
    minCGPA: { type: Number, required: true, min: 0, max: 10 },
    maxBacklogs: { type: Number, required: true, min: 0, default: 0 },
    eligibleBranches: [
      {
        type: String,
        enum: ['CSE', 'IT', 'ECE', 'EEE', 'ME', 'CE', 'MCA', 'MBA', 'Other'],
      },
    ],
    salaryMin: { type: Number },
    salaryMax: { type: Number },
    location: { type: String, trim: true },
    workMode: {
      type: String,
      enum: ['On-site', 'Remote', 'Hybrid'],
      default: 'On-site',
    },
    driveDate: { type: Date, required: true },
    deadline: { type: Date, required: true },
    status: {
      type: String,
      enum: ['Draft', 'Active', 'Closed', 'Completed'],
      default: 'Active',
      index: true,
    },
    rounds: [roundSchema],
    requirements: [String],
    perks: [String],
    maxHires: { type: Number, default: null },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    applicationCount: { type: Number, default: 0 },
    selectedCount: { type: Number, default: 0 },
  },
  { timestamps: true }
);

driveSchema.index({ status: 1, deadline: 1 });
driveSchema.index({ company: 1, createdAt: -1 });
driveSchema.index({ minCGPA: 1, maxBacklogs: 1 });

module.exports = mongoose.model('Drive', driveSchema);
