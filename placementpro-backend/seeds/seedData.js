require('dotenv').config();
const mongoose = require('mongoose');

const User = require('../models/User');
const StudentProfile = require('../models/StudentProfile');
const AlumniProfile = require('../models/AlumniProfile');
const Drive = require('../models/Drive');
const Application = require('../models/Application');
const Referral = require('../models/Referral');
const Notification = require('../models/Notification');

const connectDB = async () => {
  const uri = process.env.MONGODB_URI || 'mongodb://localhost:27017/placementpro';
  await mongoose.connect(uri);
  console.log('✅ Connected to MongoDB');
};

const seedUsers = [
  { email: 'tpo@college.edu', role: 'tpo' },
  { email: 'student1@college.edu', role: 'student' },
  { email: 'student2@college.edu', role: 'student' },
  { email: 'student3@college.edu', role: 'student' },
  { email: 'student4@college.edu', role: 'student' },
  { email: 'student5@college.edu', role: 'student' },
  { email: 'student6@college.edu', role: 'student' },
  { email: 'student7@college.edu', role: 'student' },
  { email: 'student8@college.edu', role: 'student' },
  { email: 'student9@college.edu', role: 'student' },
  { email: 'student10@college.edu', role: 'student' },
  { email: 'alumni1@gmail.com', role: 'alumni' },
  { email: 'alumni2@gmail.com', role: 'alumni' },
  { email: 'alumni3@gmail.com', role: 'alumni' },
];

const studentData = [
  { name: 'Arjun Sharma', regNumber: 'CSE2021001', branch: 'CSE', semester: 8, cgpa: 8.9, backlogs: 0, skills: ['JavaScript', 'React', 'Node.js', 'MongoDB', 'Python', 'SQL'], phone: '9876543210', github: 'github.com/arjun', linkedin: 'linkedin.com/in/arjun' },
  { name: 'Priya Patel', regNumber: 'CSE2021002', branch: 'CSE', semester: 8, cgpa: 9.2, backlogs: 0, skills: ['Java', 'Spring Boot', 'MySQL', 'Python', 'Machine Learning', 'TensorFlow'], phone: '9876543211', linkedin: 'linkedin.com/in/priya' },
  { name: 'Rahul Kumar', regNumber: 'ECE2021001', branch: 'ECE', semester: 8, cgpa: 7.8, backlogs: 1, skills: ['C', 'C++', 'Embedded Systems', 'VLSI', 'Python'], phone: '9876543212' },
  { name: 'Sneha Reddy', regNumber: 'IT2021001', branch: 'IT', semester: 8, cgpa: 8.5, backlogs: 0, skills: ['Python', 'Django', 'React', 'PostgreSQL', 'AWS', 'Docker'], phone: '9876543213', github: 'github.com/sneha' },
  { name: 'Vikram Singh', regNumber: 'CSE2021003', branch: 'CSE', semester: 8, cgpa: 7.2, backlogs: 2, skills: ['PHP', 'MySQL', 'JavaScript', 'HTML', 'CSS'], phone: '9876543214' },
  { name: 'Ananya Krishnan', regNumber: 'MCA2021001', branch: 'MCA', semester: 4, cgpa: 8.7, backlogs: 0, skills: ['Python', 'Data Analysis', 'Pandas', 'Tableau', 'SQL', 'Power BI'], phone: '9876543215', linkedin: 'linkedin.com/in/ananya' },
  { name: 'Karthik Nair', regNumber: 'CSE2021004', branch: 'CSE', semester: 8, cgpa: 9.5, backlogs: 0, skills: ['C++', 'Algorithms', 'Data Structures', 'Python', 'Go', 'Kubernetes'], phone: '9876543216', github: 'github.com/karthik' },
  { name: 'Divya Mehta', regNumber: 'IT2021002', branch: 'IT', semester: 8, cgpa: 8.1, backlogs: 0, skills: ['Full Stack', 'React', 'Express', 'MongoDB', 'GraphQL', 'TypeScript'], phone: '9876543217' },
  { name: 'Suresh Babu', regNumber: 'EEE2021001', branch: 'EEE', semester: 8, cgpa: 7.5, backlogs: 1, skills: ['MATLAB', 'Python', 'Power Systems', 'AutoCAD'], phone: '9876543218' },
  { name: 'Lakshmi Priya', regNumber: 'CSE2021005', branch: 'CSE', semester: 8, cgpa: 8.3, backlogs: 0, skills: ['Android', 'Kotlin', 'Java', 'Firebase', 'REST APIs', 'Figma'], phone: '9876543219', github: 'github.com/lakshmi' },
];

const alumniData = [
  { name: 'Rohit Verma', graduationYear: 2020, branch: 'CSE', company: 'Google', designation: 'Software Engineer', domain: 'Backend', linkedin: 'linkedin.com/in/rohit', bio: 'Passionate about distributed systems and scalable architectures.', skills: ['Python', 'Go', 'Kubernetes', 'GCP'], mentorshipAvailable: true },
  { name: 'Meera Nair', graduationYear: 2021, branch: 'IT', company: 'Microsoft', designation: 'Product Manager', domain: 'Product', linkedin: 'linkedin.com/in/meera', bio: 'Building products that matter. Love helping students navigate their career path.', skills: ['Product Management', 'Agile', 'Data Analysis', 'Strategy'], mentorshipAvailable: true },
  { name: 'Aditya Shah', graduationYear: 2019, branch: 'CSE', company: 'Amazon', designation: 'Senior Software Engineer', domain: 'Full Stack', linkedin: 'linkedin.com/in/aditya', bio: 'Ex-startup founder turned big-tech engineer. Happy to mentor students.', skills: ['Java', 'AWS', 'System Design', 'React'], mentorshipAvailable: false },
];

const driveData = [
  {
    title: 'Software Engineer - Full Stack',
    company: 'TCS',
    description: 'Join TCS Digital as a Software Engineer. Work on cutting-edge projects for global clients. Excellent learning and growth opportunities.',
    jobRole: 'Software Engineer',
    minCGPA: 7.0,
    maxBacklogs: 0,
    eligibleBranches: ['CSE', 'IT', 'MCA'],
    salaryMin: 700000,
    salaryMax: 900000,
    location: 'Hyderabad / Bangalore',
    workMode: 'Hybrid',
    rounds: [{ name: 'Online Aptitude Test', duration: '90 mins' }, { name: 'Technical Interview', duration: '45 mins' }, { name: 'HR Interview', duration: '30 mins' }],
    requirements: ['Data Structures', 'Algorithms', 'OOPS', 'SQL', 'JavaScript or Java'],
    perks: ['Health Insurance', 'Learning Budget', 'WFH Allowance'],
    maxHires: 20,
  },
  {
    title: 'Associate Engineer - Product Development',
    company: 'Infosys',
    description: 'Infosys is hiring fresh engineers for product development roles. Great opportunity to work with world-class technology.',
    jobRole: 'Associate Engineer',
    minCGPA: 6.5,
    maxBacklogs: 2,
    eligibleBranches: ['CSE', 'IT', 'ECE', 'EEE', 'MCA'],
    salaryMin: 650000,
    salaryMax: 800000,
    location: 'Pune / Chennai',
    workMode: 'On-site',
    rounds: [{ name: 'Aptitude + Coding Test', duration: '120 mins' }, { name: 'Technical Interview' }, { name: 'HR Interview' }],
    requirements: ['Programming Basics', 'Problem Solving', 'Communication Skills'],
    maxHires: 30,
  },
  {
    title: 'Data Engineer',
    company: 'Wipro',
    description: 'Work on Big Data pipelines and analytics solutions for Fortune 500 clients.',
    jobRole: 'Data Engineer',
    minCGPA: 7.5,
    maxBacklogs: 0,
    eligibleBranches: ['CSE', 'IT', 'MCA'],
    salaryMin: 800000,
    salaryMax: 1000000,
    location: 'Bangalore',
    workMode: 'Hybrid',
    rounds: [{ name: 'Data Structures Test' }, { name: 'SQL & Python Round' }, { name: 'Technical Interview' }, { name: 'HR Interview' }],
    requirements: ['Python', 'SQL', 'Data Structures', 'Statistics', 'Spark or Hadoop'],
    maxHires: 10,
  },
  {
    title: 'Business Analyst',
    company: 'Accenture',
    description: 'Join Accentures Strategy & Consulting practice. Work with global clients to solve business problems using technology.',
    jobRole: 'Business Analyst',
    minCGPA: 7.0,
    maxBacklogs: 1,
    eligibleBranches: ['CSE', 'IT', 'ECE', 'MCA', 'MBA'],
    salaryMin: 750000,
    salaryMax: 950000,
    location: 'Mumbai / Bangalore',
    workMode: 'Hybrid',
    rounds: [{ name: 'Aptitude Test' }, { name: 'Group Discussion' }, { name: 'Case Study Interview' }, { name: 'HR Round' }],
    requirements: ['Analytical Skills', 'Excel', 'Communication', 'Business Acumen'],
    maxHires: 15,
  },
  {
    title: 'SDE-1',
    company: 'Amazon',
    description: 'Build scalable systems at Amazon. Work on projects impacting millions of customers worldwide.',
    jobRole: 'Software Development Engineer',
    minCGPA: 8.0,
    maxBacklogs: 0,
    eligibleBranches: ['CSE', 'IT'],
    salaryMin: 2200000,
    salaryMax: 3500000,
    location: 'Hyderabad / Bangalore',
    workMode: 'Hybrid',
    rounds: [{ name: 'Online Assessment' }, { name: 'Technical Round 1 - DSA' }, { name: 'Technical Round 2 - System Design' }, { name: 'Bar Raiser Round' }],
    requirements: ['Data Structures', 'Algorithms', 'System Design', 'OOP', 'Java or Python or C++'],
    perks: ['ESOPs', 'Health Insurance', 'Relocation Bonus', 'Annual Bonus'],
    maxHires: 5,
  },
  {
    title: 'Frontend Developer',
    company: 'Razorpay',
    description: 'Build beautiful, performant UIs for Indias leading fintech company.',
    jobRole: 'Frontend Engineer',
    minCGPA: 7.5,
    maxBacklogs: 0,
    eligibleBranches: ['CSE', 'IT', 'MCA'],
    salaryMin: 1200000,
    salaryMax: 1800000,
    location: 'Bangalore',
    workMode: 'Hybrid',
    rounds: [{ name: 'Take-Home Assignment' }, { name: 'Technical Interview - React' }, { name: 'System Design' }, { name: 'HR Round' }],
    requirements: ['React', 'JavaScript', 'TypeScript', 'CSS', 'Performance Optimization', 'REST APIs'],
    maxHires: 3,
  },
];

const seed = async () => {
  try {
    await connectDB();

    console.log('🧹 Clearing existing data...');
    await Promise.all([
      User.deleteMany({}),
      StudentProfile.deleteMany({}),
      AlumniProfile.deleteMany({}),
      Drive.deleteMany({}),
      Application.deleteMany({}),
      Referral.deleteMany({}),
      Notification.deleteMany({}),
    ]);

    console.log('👤 Creating users...');
    const users = await User.insertMany(seedUsers);

    const tpoUser = users[0];
    const studentUsers = users.slice(1, 11);
    const alumniUsers = users.slice(11, 14);

    console.log('🎓 Creating student profiles...');
    const projectSamples = [
      { title: 'E-Commerce Platform', description: 'Full-stack e-commerce app with payment integration', techStack: ['React', 'Node.js', 'MongoDB', 'Stripe'], duration: '3 months' },
      { title: 'ML Sentiment Analyzer', description: 'NLP-based sentiment analysis tool for social media', techStack: ['Python', 'TensorFlow', 'Flask', 'NLTK'], duration: '2 months' },
      { title: 'IoT Smart Home', description: 'Arduino-based home automation system with mobile app', techStack: ['Arduino', 'React Native', 'MQTT', 'AWS IoT'], duration: '4 months' },
      { title: 'Blockchain Voting', description: 'Decentralized voting application on Ethereum', techStack: ['Solidity', 'Web3.js', 'React', 'Truffle'], duration: '2 months' },
      { title: 'Real-time Chat App', description: 'WebSocket-based chat application with rooms', techStack: ['Socket.io', 'Node.js', 'React', 'Redis'], duration: '1 month' },
    ];

    const studentProfiles = await StudentProfile.insertMany(
      studentUsers.map((user, i) => {
        const data = studentData[i];
        return {
          userId: user._id,
          ...data,
          projects: [projectSamples[i % projectSamples.length], projectSamples[(i + 1) % projectSamples.length]].slice(0, 2),
          achievements: [`Won ${i % 2 === 0 ? 'First' : 'Second'} Prize in Hackathon 2023`, 'Google Kickstart Qualifier 2023'],
          certifications: [
            { name: 'AWS Cloud Practitioner', issuer: 'Amazon', year: 2023 },
            { name: 'Data Science with Python', issuer: 'Coursera', year: 2023 },
          ],
          profileCompleteness: 75 + (i % 3) * 8,
        };
      })
    );

    console.log('👨‍💼 Creating alumni profiles...');
    const alumniProfiles = await AlumniProfile.insertMany(
      alumniUsers.map((user, i) => {
        const data = alumniData[i];
        const slots = [];
        for (let j = 0; j < 3; j++) {
          const d = new Date();
          d.setDate(d.getDate() + 7 + j * 3);
          slots.push({
            date: d,
            time: `${10 + j}:00 AM`,
            duration: 60,
            topic: ['Resume Review', 'Mock Interview', 'Career Guidance'][j],
            isBooked: j === 0,
          });
        }
        return { userId: user._id, ...data, slots, totalReferrals: i + 1, rating: 4.5 + i * 0.2, reviewCount: 5 + i * 3 };
      })
    );

    console.log('💼 Creating placement drives...');
    const drives = await Drive.insertMany(
      driveData.map((drive, i) => {
        const driveDate = new Date();
        driveDate.setDate(driveDate.getDate() + 14 + i * 7);
        const deadline = new Date();
        deadline.setDate(deadline.getDate() + 10 + i * 5);
        return { ...drive, driveDate, deadline, createdBy: tpoUser._id, status: i < 4 ? 'Active' : 'Active' };
      })
    );

    console.log('📝 Creating applications...');
    const statuses = ['Applied', 'Shortlisted', 'Interview', 'Selected', 'Rejected'];
    const applications = [];

    for (let i = 0; i < Math.min(studentProfiles.length, 8); i++) {
      const numDrives = Math.floor(Math.random() * 3) + 1;
      const selectedDrives = drives.slice(0, numDrives);

      for (const drive of selectedDrives) {
        const student = studentProfiles[i];
        if (student.cgpa >= drive.minCGPA && student.backlogs <= drive.maxBacklogs && drive.eligibleBranches.includes(student.branch)) {
          applications.push({
            driveId: drive._id,
            studentId: studentUsers[i]._id,
            studentProfileId: student._id,
            status: statuses[Math.floor(Math.random() * statuses.length)],
            appliedDate: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000),
          });
        }
      }
    }

    if (applications.length > 0) {
      await Application.insertMany(applications);
    }

    console.log('🔗 Creating referrals...');
    const referrals = await Referral.insertMany([
      {
        alumniId: alumniUsers[0]._id,
        alumniProfileId: alumniProfiles[0]._id,
        company: 'Google',
        role: 'Software Engineer',
        description: 'Looking for talented engineers for Googles Hyderabad office.',
        requirements: ['Data Structures', 'Algorithms', 'System Design'],
        minCGPA: 8.0,
        eligibleBranches: ['CSE', 'IT'],
        salaryRange: '20-35 LPA',
        location: 'Hyderabad',
        deadline: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        maxReferrals: 3,
        status: 'Active',
      },
      {
        alumniId: alumniUsers[1]._id,
        alumniProfileId: alumniProfiles[1]._id,
        company: 'Microsoft',
        role: 'Program Manager',
        description: 'Hiring PM candidates with strong analytical and communication skills.',
        requirements: ['Excel', 'Communication', 'Product Thinking', 'Data Analysis'],
        minCGPA: 7.5,
        eligibleBranches: ['CSE', 'IT', 'MCA', 'MBA'],
        salaryRange: '15-25 LPA',
        location: 'Bangalore',
        deadline: new Date(Date.now() + 20 * 24 * 60 * 60 * 1000),
        maxReferrals: 2,
        status: 'Active',
      },
    ]);

    console.log('🔔 Creating notifications...');
    const notifications = [];
    for (const user of studentUsers.slice(0, 5)) {
      notifications.push({
        userId: user._id,
        type: 'drive',
        title: 'New Drive Available!',
        message: 'TCS is hiring Software Engineers. Apply before deadline!',
        actionLink: `/drives/${drives[0]._id}`,
        isRead: false,
      });
      notifications.push({
        userId: user._id,
        type: 'system',
        title: 'Welcome to PlacementPro!',
        message: 'Complete your profile to get noticed by recruiters and unlock all features.',
        actionLink: '/profile',
        isRead: true,
      });
    }
    await Notification.insertMany(notifications);

    console.log('\n✅ Seed data created successfully!\n');
    console.log('📊 Summary:');
    console.log(`   👤 Users: ${users.length} (1 TPO, 10 Students, 3 Alumni)`);
    console.log(`   🎓 Student Profiles: ${studentProfiles.length}`);
    console.log(`   👨‍💼 Alumni Profiles: ${alumniProfiles.length}`);
    console.log(`   💼 Drives: ${drives.length}`);
    console.log(`   📝 Applications: ${applications.length}`);
    console.log(`   🔗 Referrals: ${referrals.length}`);
    console.log('\n🔑 Test Credentials (use OTP login):');
    console.log('   TPO: tpo@college.edu');
    console.log('   Student: student1@college.edu');
    console.log('   Alumni: alumni1@gmail.com');
    console.log('\n💡 Note: In development mode, OTP is logged to console.\n');

    await mongoose.disconnect();
  } catch (error) {
    console.error('❌ Seed failed:', error);
    process.exit(1);
  }
};

seed();
