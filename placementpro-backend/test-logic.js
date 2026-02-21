require('dotenv').config();
const mongoose = require('mongoose');
const Drive = require('./models/Drive');
const Application = require('./models/Application');
const StudentProfile = require('./models/StudentProfile');

const test = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('Connected');

        const profile = null; // simulate new user
        const drives = await Drive.find({ status: 'Active' }); // ignore deadline for test
        console.log('Total Active Drives:', drives.length);

        let eligibleDrives = drives;
        const appliedDriveIds = [];

        const enriched = eligibleDrives.map((drive) => ({
            ...drive.toObject(),
            hasApplied: appliedDriveIds.map((id) => id.toString()).includes(drive._id.toString()),
        }));

        console.log('Enriched count:', enriched.length);
        process.exit(0);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
};

test();
