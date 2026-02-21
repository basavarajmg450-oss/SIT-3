// Reloaded to disable rate limiters
require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const { createServer } = require('http');
const { Server } = require('socket.io');

const connectDB = require('./config/db');
const { errorHandler, notFoundHandler } = require('./middleware/errorHandler');

const authRoutes = require('./routes/authRoutes');
const studentRoutes = require('./routes/studentRoutes');
const tpoRoutes = require('./routes/tpoRoutes');
const alumniRoutes = require('./routes/alumniRoutes');
const chatbotRoutes = require('./routes/chatbotRoutes');
const notificationRoutes = require('./routes/notificationRoutes');

const app = express();
const httpServer = createServer(app);

const io = new Server(httpServer, {
  cors: {
    origin: process.env.FRONTEND_URL || 'http://localhost:3000',
    methods: ['GET', 'POST'],
    credentials: true,
  },
});

connectDB();

app.use(helmet({ contentSecurityPolicy: false }));
app.use(
  cors({
    origin: process.env.FRONTEND_URL || 'http://localhost:3000',
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  })
);
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Rate limiters disabled for development


app.get('/health', (req, res) => {
  res.json({
    status: 'OK',
    service: 'PlacementPro API',
    version: '1.0.0',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV,
  });
});

app.use('/api/auth', authRoutes);
app.use('/api/student', studentRoutes);
app.use('/api/tpo', tpoRoutes);
app.use('/api/alumni', alumniRoutes);
app.use('/api/chatbot', chatbotRoutes);
app.use('/api/notifications', notificationRoutes);

app.get('/api/stats/market-intelligence', async (req, res) => {
  try {
    const Drive = require('./models/Drive');
    const Application = require('./models/Application');

    const [activeDrives, totalCompanies, totalApplications] = await Promise.all([
      Drive.countDocuments({ status: 'Active' }),
      Drive.distinct('company'),
      Application.countDocuments(),
    ]);

    res.json({
      success: true,
      data: {
        activeDrives,
        companiesHiring: totalCompanies.length,
        totalApplications,
        topSkills: ['JavaScript', 'Python', 'React', 'Node.js', 'SQL', 'Java', 'Data Structures', 'System Design'],
        avgPackage: '8.5 LPA',
        maxPackage: '45 LPA',
        lastUpdated: new Date().toISOString(),
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to get market intelligence.' });
  }
});

const connectedUsers = new Map();

io.on('connection', (socket) => {
  console.log(`🔌 Socket connected: ${socket.id}`);

  socket.on('authenticate', (userId) => {
    connectedUsers.set(userId, socket.id);
    socket.join(`user:${userId}`);
    console.log(`👤 User ${userId} authenticated on socket`);
  });

  socket.on('disconnect', () => {
    for (const [userId, socketId] of connectedUsers.entries()) {
      if (socketId === socket.id) {
        connectedUsers.delete(userId);
        break;
      }
    }
    console.log(`🔌 Socket disconnected: ${socket.id}`);
  });
});

app.set('io', io);
app.set('connectedUsers', connectedUsers);

app.use(notFoundHandler);
app.use(errorHandler);

const PORT = process.env.PORT || 5000;
httpServer.listen(PORT, () => {
  console.log(`\n🚀 PlacementPro Server running on port ${PORT}`);
  console.log(`📊 Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`🌐 Health check: http://localhost:${PORT}/health`);
  console.log(`📡 API Base: http://localhost:${PORT}/api\n`);
});

process.on('unhandledRejection', (err) => {
  console.error('Unhandled Rejection:', err.message);
});

process.on('SIGTERM', () => {
  console.log('SIGTERM received. Shutting down gracefully...');
  httpServer.close(() => { process.exit(0); });
});

module.exports = { app, io };
