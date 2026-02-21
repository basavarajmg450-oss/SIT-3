import axios from 'axios'

// Use /api in dev so Vite proxy forwards to backend; use full URL when VITE_API_URL is set (e.g. production)
const BASE_URL = import.meta.env.VITE_API_URL || '/api'

const api = axios.create({
  baseURL: BASE_URL,
  headers: { 'Content-Type': 'application/json' },
})

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('pp_token')
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401) {
      localStorage.removeItem('pp_token')
      if (window.location.pathname !== '/') {
        window.location.href = '/'
      }
    }
    return Promise.reject(err)
  }
)

export const authAPI = {
  register: (data) => api.post('/auth/register', data),
  login: (data) => api.post('/auth/login', data),
  logout: () => api.post('/auth/logout'),
  getMe: () => api.get('/auth/me'),
  sendOTP: (data) => api.post('/auth/send-otp', data),
  verifyOTP: (data) => api.post('/auth/verify-otp', data),
  forgotPassword: (data) => api.post('/auth/forgot-password', data),
  resetPassword: (data) => api.post('/auth/reset-password', data),
}

export const studentAPI = {
  getProfile: () => api.get('/student/profile'),
  updateProfile: (data) => api.put('/student/profile', data),
  generateResume: () => api.post('/student/resume', {}, { responseType: 'blob' }),
  getEligibleDrives: (params) => api.get('/student/eligible-drives', { params }),
  applyToDrive: (data) => api.post('/student/apply-drive', data),
  getApplications: (params) => api.get('/student/applications', { params }),
  getSkillGap: () => api.get('/student/skill-gap'),
  bookMentorship: (data) => api.post('/student/book-mentorship', data),
  submitAlumniReview: (data) => api.post('/student/alumni-review', data),
}

export const tpoAPI = {
  createDrive: (data) => api.post('/tpo/drive', data),
  getDrives: (params) => api.get('/tpo/drives', { params }),
  updateDrive: (id, data) => api.put(`/tpo/drive/${id}`, data),
  getEligibleStudents: (id) => api.get(`/tpo/drive/${id}/eligible-students`),
  scheduleInterview: (data) => api.post('/tpo/interview-schedule', data),
  updateApplicationStatus: (data) => api.put('/tpo/application-status', data),
  getAnalytics: () => api.get('/tpo/analytics'),
  notifyStudents: (data) => api.post('/tpo/notify', data),
  getInterviewSlots: (params) => api.get('/tpo/interview-slots', { params }),
  getAuditLogs: (params) => api.get('/tpo/audit-logs', { params }),
  exportReport: (params) => api.get('/tpo/export-report', { params }),
}

export const alumniAPI = {
  getProfile: () => api.get('/alumni/profile'),
  updateProfile: (data) => api.put('/alumni/profile', data),
  postReferral: (data) => api.post('/alumni/referral', data),
  getReferrals: () => api.get('/alumni/referrals'),
  getAllReferrals: (params) => api.get('/alumni/referrals/all', { params }),
  addMentorshipSlots: (data) => api.post('/alumni/mentorship-slots', data),
  getMentorshipSlots: () => api.get('/alumni/mentorship-slots'),
  getInterviewReviews: () => api.get('/alumni/interview-reviews'),
  updateInterviewReview: (data) => api.put('/alumni/interview-review', data),
  applyForReferral: (data) => api.post('/alumni/apply-referral', data),
}

export const chatbotAPI = {
  sendMessage: (data) => api.post('/chatbot/message', data),
  mockInterview: (data) => api.post('/chatbot/mock-interview', data),
  getResumeReview: (data) => api.post('/chatbot/resume-review', data),
}

export const notificationAPI = {
  getAll: (params) => api.get('/notifications', { params }),
  markRead: (id) => api.put(`/notifications/${id}/read`),
  markAllRead: () => api.put('/notifications/read-all'),
  delete: (id) => api.delete(`/notifications/${id}`),
}

export const statsAPI = {
  getMarketIntelligence: () => api.get('/stats/market-intelligence'),
}

export default api
