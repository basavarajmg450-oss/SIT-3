const Application = require('../models/Application');
const Drive = require('../models/Drive');
const StudentProfile = require('../models/StudentProfile');

const getPlacementStats = async () => {
  const [totalDrives, activeDrives, totalApplications, selectedApplications, studentProfiles] = await Promise.all([
    Drive.countDocuments(),
    Drive.countDocuments({ status: 'Active' }),
    Application.countDocuments(),
    Application.countDocuments({ status: 'Selected' }),
    StudentProfile.find({}, 'isPlaced placedPackage branch cgpa'),
  ]);

  const placedStudents = studentProfiles.filter((s) => s.isPlaced);
  const packages = placedStudents.map((s) => s.placedPackage).filter(Boolean);
  const avgPackage = packages.length > 0 ? packages.reduce((a, b) => a + b, 0) / packages.length : 0;
  const maxPackage = packages.length > 0 ? Math.max(...packages) : 0;

  return {
    totalDrives,
    activeDrives,
    totalApplications,
    selectedCount: selectedApplications,
    placedStudents: placedStudents.length,
    totalStudents: studentProfiles.length,
    avgPackage: Math.round(avgPackage / 100000) / 10,
    maxPackage: Math.round(maxPackage / 100000) / 10,
    placementRate:
      studentProfiles.length > 0
        ? Math.round((placedStudents.length / studentProfiles.length) * 100)
        : 0,
  };
};

const getBranchWisePlacement = async () => {
  return StudentProfile.aggregate([
    {
      $group: {
        _id: '$branch',
        total: { $sum: 1 },
        placed: { $sum: { $cond: ['$isPlaced', 1, 0] } },
        avgCGPA: { $avg: '$cgpa' },
      },
    },
    { $sort: { placed: -1 } },
  ]);
};

const getMonthlyApplicationTrends = async () => {
  return Application.aggregate([
    {
      $group: {
        _id: {
          year: { $year: '$createdAt' },
          month: { $month: '$createdAt' },
        },
        count: { $sum: 1 },
        selected: { $sum: { $cond: [{ $eq: ['$status', 'Selected'] }, 1, 0] } },
      },
    },
    { $sort: { '_id.year': 1, '_id.month': 1 } },
    { $limit: 12 },
  ]);
};

const getCompanyWisePlacements = async () => {
  return Application.aggregate([
    { $match: { status: 'Selected' } },
    {
      $lookup: {
        from: 'drives',
        localField: 'driveId',
        foreignField: '_id',
        as: 'drive',
      },
    },
    { $unwind: '$drive' },
    {
      $group: {
        _id: '$drive.company',
        count: { $sum: 1 },
        avgPackage: { $avg: '$drive.salaryMax' },
      },
    },
    { $sort: { count: -1 } },
    { $limit: 10 },
  ]);
};

const getSkillDistribution = async () => {
  return StudentProfile.aggregate([
    { $unwind: '$skills' },
    { $group: { _id: '$skills', count: { $sum: 1 } } },
    { $sort: { count: -1 } },
    { $limit: 20 },
  ]);
};

module.exports = { getPlacementStats, getBranchWisePlacement, getMonthlyApplicationTrends, getCompanyWisePlacements, getSkillDistribution };
