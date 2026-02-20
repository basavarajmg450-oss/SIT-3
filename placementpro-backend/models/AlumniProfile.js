const mongoose = require('mongoose');

const slotSchema = new mongoose.Schema({
  date: { type: Date, required: true },
  time: { type: String, required: true },
  duration: { type: Number, default: 60 },
  topic: { type: String, default: 'General Mentorship' },
  isBooked: { type: Boolean, default: false },
  bookedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
  meetLink: { type: String, default: null },
});

const alumniProfileSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true,
      index: true,
    },
    name: { type: String, required: true, trim: true },
    graduationYear: { type: Number, required: true },
    branch: {
      type: String,
      enum: ['CSE', 'IT', 'ECE', 'EEE', 'ME', 'CE', 'MCA', 'MBA', 'Other'],
    },
    company: { type: String, required: true, trim: true },
    designation: { type: String, required: true, trim: true },
    domain: { type: String, trim: true },
    linkedin: { type: String, trim: true },
    bio: { type: String, maxlength: 500 },
    skills: [String],
    mentorshipAvailable: { type: Boolean, default: false },
    slots: [slotSchema],
    totalMentorships: { type: Number, default: 0 },
    totalReferrals: { type: Number, default: 0 },
    rating: { type: Number, default: 0, min: 0, max: 5 },
    reviewCount: { type: Number, default: 0 },
    photo: { type: String, default: null },
  },
  { timestamps: true }
);

alumniProfileSchema.index({ mentorshipAvailable: 1, company: 1 });

module.exports = mongoose.model('AlumniProfile', alumniProfileSchema);
