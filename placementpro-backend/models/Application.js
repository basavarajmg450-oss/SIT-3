const mongoose = require('mongoose');

const applicationSchema = new mongoose.Schema(
  {
    driveId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Drive',
      required: true,
      index: true,
    },
    studentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    studentProfileId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'StudentProfile',
    },
    appliedDate: { type: Date, default: Date.now },
    status: {
      type: String,
      enum: ['Applied', 'Shortlisted', 'Aptitude', 'Interview', 'HR Round', 'Selected', 'Rejected', 'Withdrawn'],
      default: 'Applied',
      index: true,
    },
    interviewSchedule: {
      date: { type: Date },
      time: { type: String },
      venue: { type: String },
      type: { type: String, enum: ['Online', 'Offline', 'Phone'] },
      meetLink: { type: String },
    },
    feedback: { type: String, default: null },
    tpoNotes: { type: String, default: null },
    resumeSnapshot: { type: String, default: null },
    currentRound: { type: Number, default: 1 },
  },
  { timestamps: true }
);

applicationSchema.index({ driveId: 1, studentId: 1 }, { unique: true });
applicationSchema.index({ status: 1, driveId: 1 });
applicationSchema.index({ studentId: 1, createdAt: -1 });

module.exports = mongoose.model('Application', applicationSchema);
