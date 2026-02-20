const mongoose = require('mongoose');

const interviewSlotSchema = new mongoose.Schema(
  {
    driveId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Drive',
      required: true,
    },
    studentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    alumniId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
    scheduledBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    date: { type: Date, required: true },
    time: { type: String, required: true },
    duration: { type: Number, default: 60 },
    type: {
      type: String,
      enum: ['Technical', 'HR', 'Managerial', 'Mock', 'Group Discussion'],
      default: 'Technical',
    },
    mode: {
      type: String,
      enum: ['Online', 'Offline', 'Phone'],
      default: 'Online',
    },
    venue: { type: String },
    meetLink: { type: String },
    notes: { type: String },
    status: {
      type: String,
      enum: ['Scheduled', 'Completed', 'Cancelled', 'Rescheduled'],
      default: 'Scheduled',
      index: true,
    },
    feedback: { type: String },
    rating: { type: Number, min: 1, max: 5 },
    result: {
      type: String,
      enum: ['Pass', 'Fail', 'Hold', 'Pending'],
      default: 'Pending',
    },
  },
  { timestamps: true }
);

interviewSlotSchema.index({ driveId: 1, studentId: 1 });
interviewSlotSchema.index({ date: 1, status: 1 });

module.exports = mongoose.model('InterviewSlot', interviewSlotSchema);
