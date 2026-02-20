import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Routes, Route, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { studentAPI } from '../services/api'
import Navbar from '../components/common/Navbar'
import Sidebar from '../components/common/Sidebar'
import { StatCard } from '../components/common/Card'
import ProfileCompleteness from '../components/student/ProfileCompleteness'
import DrivesFeed from '../components/student/DrivesFeed'
import ApplicationTracker from '../components/student/ApplicationTracker'
import ProfileForm from '../components/student/ProfileForm'
import SkillGapAnalysis from '../components/student/SkillGapAnalysis'
import MentorshipBooking from '../components/student/MentorshipBooking'
import PlacementBot from '../components/student/PlacementBot'
import MarketIntelligence from '../components/common/MarketIntelligence'
import { alumniAPI } from '../services/api'

function Home() {
  const { user, profile, updateProfile } = useAuth()
  const [stats, setStats] = useState({ applied: 0, interviews: 0, selected: 0, eligible: 0 })
  const navigate = useNavigate()

  useEffect(() => { loadStats() }, [])

  const loadStats = async () => {
    try {
      const [apps, drives] = await Promise.all([
        studentAPI.getApplications({ limit: 100 }),
        studentAPI.getEligibleDrives({ limit: 100 }),
      ])
      if (apps.data.success) {
        const a = apps.data.applications
        setStats({
          applied: a.length,
          interviews: a.filter((x) => ['Interview', 'HR Round'].includes(x.status)).length,
          selected: a.filter((x) => x.status === 'Selected').length,
          eligible: drives.data.total || 0,
        })
      }
    } catch {}
  }

  return (
    <div className="space-y-6">
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-2xl font-bold text-gray-900">
          Welcome back, {profile?.name?.split(' ')[0] || 'Student'}! 👋
        </h1>
        <p className="text-gray-500 text-sm mt-0.5">Here's your placement journey overview</p>
      </motion.div>

      {profile?.isPlaced && (
        <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="bg-gradient-to-r from-emerald-500 to-teal-600 rounded-2xl p-5 text-white">
          <div className="flex items-center gap-3">
            <span className="text-3xl">🎉</span>
            <div>
              <p className="font-bold text-lg">Congratulations! You're Placed!</p>
              <p className="text-emerald-100 text-sm">at {profile.placedCompany}</p>
            </div>
          </div>
        </motion.div>
      )}

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { icon: '📋', label: 'Applied', value: stats.applied, color: 'indigo' },
          { icon: '🎤', label: 'Interviews', value: stats.interviews, color: 'purple' },
          { icon: '✅', label: 'Selected', value: stats.selected, color: 'emerald' },
          { icon: '💼', label: 'Eligible Drives', value: stats.eligible, color: 'amber' },
        ].map((s, i) => (
          <motion.div key={s.label} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}>
            <StatCard {...s} />
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-5">
          <div className="bg-white rounded-2xl p-5 border border-gray-100">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-semibold text-gray-900">🔥 Eligible Drives</h2>
              <button onClick={() => navigate('/student/drives')} className="text-xs text-indigo-600 hover:text-indigo-700 font-medium">View all →</button>
            </div>
            <DrivesFeed compact />
          </div>

          <div className="bg-white rounded-2xl p-5 border border-gray-100">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-semibold text-gray-900">📋 Recent Applications</h2>
              <button onClick={() => navigate('/student/applications')} className="text-xs text-indigo-600 hover:text-indigo-700 font-medium">View all →</button>
            </div>
            <ApplicationTracker compact />
          </div>
        </div>

        <div className="space-y-5">
          <ProfileCompleteness profile={profile} />

          <div className="bg-white rounded-2xl p-5 border border-gray-100">
            <h2 className="font-semibold text-gray-900 mb-3">⚡ Quick Actions</h2>
            <div className="space-y-2">
              {[
                { label: 'Update Profile', icon: '👤', action: () => navigate('/student/profile'), color: 'indigo' },
                { label: 'AI PlacementBot', icon: '🤖', action: () => navigate('/student/chatbot'), color: 'purple' },
                { label: 'Skill Gap Analysis', icon: '📊', action: () => navigate('/student/skill-gap'), color: 'blue' },
                { label: 'Book Mentorship', icon: '🤝', action: () => navigate('/student/mentorship'), color: 'emerald' },
              ].map((action) => (
                <motion.button
                  key={action.label}
                  whileHover={{ x: 4 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={action.action}
                  className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-gray-50 transition-colors text-left group"
                >
                  <span className="text-xl">{action.icon}</span>
                  <span className="text-sm font-medium text-gray-700 group-hover:text-indigo-600 transition-colors">{action.label}</span>
                  <span className="ml-auto text-gray-300 group-hover:text-indigo-400">→</span>
                </motion.button>
              ))}
            </div>
          </div>

          <MarketIntelligence compact />
        </div>
      </div>
    </div>
  )
}

function Referrals() {
  const [referrals, setReferrals] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    alumniAPI.getAllReferrals().then(({ data }) => {
      if (data.success) setReferrals(data.referrals)
    }).catch(() => {}).finally(() => setLoading(false))
  }, [])

  if (loading) return <div className="text-center py-10"><motion.div className="w-8 h-8 border-2 border-indigo-200 border-t-indigo-500 rounded-full mx-auto" animate={{ rotate: 360 }} transition={{ duration: 0.8, repeat: Infinity }} /></div>

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold text-gray-900">Alumni Referrals 🔗</h1>
      {referrals.length === 0 ? (
        <div className="text-center py-10"><div className="text-4xl mb-3">🔗</div><p className="text-gray-500">No active referrals available</p></div>
      ) : (
        referrals.map((ref, i) => (
          <motion.div key={ref._id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }} className="bg-white rounded-2xl p-5 border border-gray-100">
            <div className="flex items-start justify-between mb-3">
              <div>
                <h3 className="font-semibold text-gray-900">{ref.role}</h3>
                <p className="text-indigo-600 font-medium">{ref.company}</p>
                <p className="text-sm text-gray-500 mt-0.5">By {ref.alumniProfileId?.name || 'Alumni'} • {ref.alumniProfileId?.designation}</p>
              </div>
              <span className="text-xs bg-emerald-100 text-emerald-700 px-2.5 py-1 rounded-full font-medium">{ref.salaryRange || 'Competitive'}</span>
            </div>
            <p className="text-sm text-gray-600 mb-3">{ref.description}</p>
            {ref.requirements?.length > 0 && (
              <div className="flex flex-wrap gap-1.5 mb-3">
                {ref.requirements.map((r) => <span key={r} className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full">{r}</span>)}
              </div>
            )}
            <div className="flex items-center justify-between">
              <span className="text-xs text-gray-500">Deadline: {new Date(ref.deadline).toLocaleDateString()}</span>
              <span className="text-xs text-gray-500">{ref.applicants?.length || 0}/{ref.maxReferrals} applied</span>
            </div>
          </motion.div>
        ))
      )}
    </div>
  )
}

export default function StudentDashboard() {
  const [sidebarOpen, setSidebarOpen] = useState(false)

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar onMenuClick={() => setSidebarOpen(!sidebarOpen)} sidebarOpen={sidebarOpen} />
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <main className="lg:ml-64 pt-16">
        <div className="p-4 lg:p-6 max-w-6xl mx-auto">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/profile" element={<div><h1 className="text-2xl font-bold text-gray-900 mb-5">My Profile</h1><ProfileForm /></div>} />
            <Route path="/drives" element={<div><h1 className="text-2xl font-bold text-gray-900 mb-5">Eligible Drives 💼</h1><DrivesFeed /></div>} />
            <Route path="/applications" element={<div><h1 className="text-2xl font-bold text-gray-900 mb-5">My Applications 📋</h1><ApplicationTracker /></div>} />
            <Route path="/skill-gap" element={<div><h1 className="text-2xl font-bold text-gray-900 mb-5">Skill Gap Analysis 📊</h1><SkillGapAnalysis /></div>} />
            <Route path="/mentorship" element={<div><h1 className="text-2xl font-bold text-gray-900 mb-5">Book Mentorship 🤝</h1><MentorshipBooking /></div>} />
            <Route path="/referrals" element={<Referrals />} />
            <Route path="/chatbot" element={<div><h1 className="text-2xl font-bold text-gray-900 mb-5">PlacementBot 🤖</h1><PlacementBot isPage /></div>} />
          </Routes>
        </div>
      </main>
    </div>
  )
}
