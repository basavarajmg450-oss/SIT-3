const mongoose = require('mongoose');

const projectSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String },
  techStack: [String],
  link: { type: String },
  duration: { type: String },
});

const studentProfileSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true,
      index: true,
    },
    name: { type: String, required: true, trim: true },
    regNumber: { type: String, unique: true, sparse: true, trim: true },
    branch: {
      type: String,
      enum: ['CSE', 'IT', 'ECE', 'EEE', 'ME', 'CE', 'MCA', 'MBA', 'Other'],
      required: true,
    },
    semester: { type: Number, min: 1, max: 10 },
    cgpa: { type: Number, min: 0, max: 10, required: true },
    backlogs: { type: Number, default: 0, min: 0 },
    phone: { type: String, trim: true },
    skills: [{ type: String, trim: true }],
    projects: [projectSchema],
    resumeUrl: { type: String, default: null },
    resumeData: { type: mongoose.Schema.Types.Mixed, default: null },
    profileCompleteness: { type: Number, default: 0, min: 0, max: 100 },
    mentorshipBooked: [
      {
        alumniId: { type: mongoose.Schema.Types.ObjectId, ref: 'AlumniProfile' },
        slotId: { type: String },
        date: { type: Date },
        topic: { type: String },
        status: { type: String, enum: ['Pending', 'Confirmed', 'Completed', 'Cancelled'], default: 'Pending' },
      },
    ],
    achievements: [{ type: String }],
    certifications: [
      {
        name: { type: String },
        issuer: { type: String },
        year: { type: Number },
      },
    ],
    photo: { type: String, default: null },
    linkedin: { type: String, default: null },
    github: { type: String, default: null },
    isPlaced: { type: Boolean, default: false },
    placedCompany: { type: String, default: null },
    placedPackage: { type: Number, default: null },
  },
  { timestamps: true }
);

studentProfileSchema.methods.calculateCompleteness = function () {
  let score = 0;
  const checks = [
    { field: this.name, weight: 10 },
    { field: this.regNumber, weight: 10 },
    { field: this.phone, weight: 5 },
    { field: this.skills?.length > 0, weight: 15 },
    { field: this.projects?.length > 0, weight: 20 },
    { field: this.resumeUrl, weight: 20 },
    { field: this.cgpa, weight: 10 },
    { field: this.linkedin, weight: 5 },
    { field: this.github, weight: 5 },
  ];
  checks.forEach((c) => { if (c.field) score += c.weight; });
  this.profileCompleteness = score;
  return score;
};

studentProfileSchema.index({ cgpa: -1, backlogs: 1, branch: 1 });
studentProfileSchema.index({ isPlaced: 1 });

module.exports = mongoose.model('StudentProfile', studentProfileSchema);
