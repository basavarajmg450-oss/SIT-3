# 🎓 PlacementPro — Intelligent Placement Management System

> Replace Excel sheets and notice boards with a modern, AI-powered placement platform.

[![Node.js](https://img.shields.io/badge/Node.js-v18+-green)](https://nodejs.org)
[![React](https://img.shields.io/badge/React-18-blue)](https://reactjs.org)
[![MongoDB](https://img.shields.io/badge/MongoDB-Atlas-brightgreen)](https://mongodb.com)
[![License](https://img.shields.io/badge/License-MIT-yellow)](LICENSE)

---

## 📖 Overview

**PlacementPro** is a full-stack placement management web application for colleges with role-based access for **Students**, **TPO (Training & Placement Officers)**, and **Alumni**.

### ✨ Key Features

| Feature | Description |
|---------|-------------|
| 🔐 OTP Auth | Secure 6-digit OTP login via email + JWT role-based access |
| 💼 Drive Management | TPO creates drives, auto-notifies eligible students |
| 📊 Criteria Engine | Auto-filters students by CGPA, backlogs, branch |
| 📄 PDF Resume | College-branded resume generator with PDFKit |
| 🤖 PlacementBot | AI chatbot powered by Gemini API for placement guidance |
| 📈 Analytics | Real-time charts for placements, trends, and skill distribution |
| 🔗 Referrals | Alumni post job referrals, students apply directly |
| 🤝 Mentorship | Book 1:1 mentorship slots with alumni |
| 🔔 Notifications | Real-time notifications + email alerts |
| 📜 Audit Logs | Track all TPO actions for compliance |

---

## 🏗️ Tech Stack

**Backend:** Node.js + Express + MongoDB (Mongoose) + Socket.io  
**Frontend:** React 18 + Vite + Tailwind CSS + Framer Motion  
**AI:** Google Gemini API  
**PDF:** PDFKit  
**Email:** Nodemailer  
**Auth:** OTP + JWT

---

## 🚀 Quick Start

### Prerequisites
- Node.js v18+
- MongoDB (local or Atlas)
- Gmail account (for OTP emails)

### 1. Clone & Setup

```bash
git clone <your-repo-url>
cd placementpro
```

### 2. Backend Setup

```bash
cd placementpro-backend

# Install dependencies
npm install

# Configure environment
cp .env.example .env
# Edit .env with your values

# Seed sample data
npm run seed

# Start development server
npm run dev
```

### 3. Frontend Setup

```bash
cd placementpro-frontend

# Install dependencies
npm install

# Start dev server
npm run dev
```

App runs at: **http://localhost:3000**

---

## ⚙️ Environment Variables

### Backend (.env)
```env
PORT=5000
MONGODB_URI=mongodb+srv://<user>:<pass>@cluster.mongodb.net/placementpro
JWT_SECRET=your_super_secret_min_32_chars
GEMINI_API_KEY=your_gemini_api_key
EMAIL_USER=your_email@gmail.com
EMAIL_PASSWORD=your_gmail_app_password
FRONTEND_URL=http://localhost:3000
```

> **Gmail Setup:** Enable 2FA → Generate App Password → Use in EMAIL_PASSWORD

---

## 🧪 Test Credentials

After running seed data (`npm run seed`):

| Role | Email |
|------|-------|
| TPO | tpo@college.edu |
| Student | student1@college.edu |
| Alumni | alumni1@gmail.com |

> **Dev Mode:** OTP is printed to server console. No email setup required for testing.

---

## 📡 API Endpoints

### Auth
```
POST /api/auth/send-otp    → Send OTP to email
POST /api/auth/verify-otp  → Verify OTP, get JWT
POST /api/auth/logout      → Logout
GET  /api/auth/me          → Get current user
```

### Student
```
GET  /api/student/profile          → Get profile
PUT  /api/student/profile          → Update profile
POST /api/student/resume           → Generate PDF resume
GET  /api/student/eligible-drives  → Get eligible drives
POST /api/student/apply-drive      → Apply to drive
GET  /api/student/applications     → Get applications
GET  /api/student/skill-gap        → Skill gap analysis
POST /api/student/book-mentorship  → Book mentorship slot
```

### TPO
```
POST /api/tpo/drive                         → Create drive
GET  /api/tpo/drives                        → List drives
GET  /api/tpo/drive/:id/eligible-students   → Eligible students
POST /api/tpo/interview-schedule            → Schedule interview
PUT  /api/tpo/application-status            → Update status
GET  /api/tpo/analytics                     → Analytics data
POST /api/tpo/notify                        → Notify students
GET  /api/tpo/audit-logs                    → Audit logs
GET  /api/tpo/export-report                 → Export report
```

### Alumni
```
GET  /api/alumni/profile           → Get profile
PUT  /api/alumni/profile           → Update profile
POST /api/alumni/referral          → Post referral
GET  /api/alumni/referrals         → My referrals
GET  /api/alumni/referrals/all     → All active referrals
POST /api/alumni/mentorship-slots  → Add slots
GET  /api/alumni/mentorship-slots  → Available mentors
```

### Chatbot
```
POST /api/chatbot/message         → Chat with PlacementBot
POST /api/chatbot/mock-interview  → Start mock interview
POST /api/chatbot/resume-review   → Get resume feedback
```

---

## 🎨 UI Features

- **Glassmorphism** design with translucent cards
- **Framer Motion** animations (page transitions, hover effects, progress bars)
- **Indigo/Purple** gradient color scheme
- **Responsive** mobile-first design with collapsible sidebar
- **Dark mode** toggle
- **Real-time** notifications via Socket.io

---

## 📊 Sample Data

After seeding (`npm run seed`), you get:
- 1 TPO user
- 10 Students (varying CGPA: 7.2–9.5, branches: CSE/IT/ECE/MCA)
- 3 Alumni (Google, Microsoft, Amazon)
- 6 Placement drives (TCS, Infosys, Wipro, Accenture, Amazon, Razorpay)
- Mix of applications in various statuses
- 2 Alumni referrals
- Mentorship slots

---

## 🚢 Deployment

### Backend (Render)
1. Create a new Web Service on render.com
2. Set build command: `npm install`
3. Set start command: `node server.js`
4. Add all environment variables

### Frontend (Vercel)
1. Import repo on vercel.com
2. Set root directory: `placementpro-frontend`
3. Build command: `npm run build`
4. Output: `dist`
5. Add `VITE_API_URL=https://your-render-app.onrender.com/api`

### Database (MongoDB Atlas)
1. Create free M0 cluster
2. Add connection IP (0.0.0.0/0 for production)
3. Copy connection string to MONGODB_URI

---

## 🏛️ Architecture

```
placementpro/
├── placementpro-backend/       # Express.js API
│   ├── config/                 # DB, Gemini, Email config
│   ├── controllers/            # Business logic
│   ├── models/                 # Mongoose schemas
│   ├── routes/                 # API routes
│   ├── middleware/             # Auth, roles, errors, audit
│   ├── utils/                  # OTP, JWT, PDF, analytics
│   └── seeds/                  # Sample data
│
└── placementpro-frontend/      # React + Vite SPA
    └── src/
        ├── components/         # Reusable UI components
        │   ├── auth/           # OTP login, protected routes
        │   ├── common/         # Navbar, Sidebar, Cards
        │   ├── student/        # Student-specific components
        │   ├── tpo/            # TPO components
        │   └── alumni/         # Alumni components
        ├── context/            # Auth & Theme contexts
        ├── pages/              # Dashboard pages
        ├── services/           # API service layer
        └── utils/              # Animations, helpers
```

---

## 🤝 Contributing

1. Fork the repository
2. Create feature branch: `git checkout -b feature/amazing-feature`
3. Commit changes: `git commit -m 'feat: add amazing feature'`
4. Push to branch: `git push origin feature/amazing-feature`
5. Open Pull Request

---

## 📄 License

MIT © 2024 PlacementPro

---

<div align="center">
  Made with ❤️ for college placements | <strong>PlacementPro</strong> — Your Career Launchpad
</div>
