import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { authAPI } from '../services/api'
import toast from 'react-hot-toast'
import LoginModal from '../components/auth/LoginModal'
import {
  GraduationCap,
  FileText,
  Briefcase,
  Target,
  Zap,
  BarChart3,
  Users,
  Shield,
  FileCheck,
  Rocket,
  ChevronDown,
  ArrowRight,
  Play,
} from 'lucide-react'

const DASHBOARDS = [
  {
    id: 'student',
    title: 'Student Portal',
    desc: 'Track applications, build resumes, find mentors, and stay updated with placement drives',
    icon: GraduationCap,
    gradient: 'from-blue-500/20 via-indigo-500/20 to-purple-500/20',
    accent: 'text-cyan-300',
    btnGradient: 'from-cyan-500 to-blue-600',
    features: [
      'Eligible Drives Feed',
      'Resume Builder',
      'Application Tracker',
      'Skill Gap Analysis',
      'Mentorship Booking',
      'AI PlacementBot',
    ],
  },
  {
    id: 'tpo',
    title: 'TPO Dashboard',
    desc: 'Manage drives, schedule interviews, track analytics, and coordinate placements efficiently',
    icon: FileText,
    gradient: 'from-purple-500/20 via-pink-500/20 to-rose-500/20',
    accent: 'text-pink-300',
    btnGradient: 'from-pink-500 to-purple-600',
    features: [
      'Create Placement Drives',
      'Criteria Engine',
      'Interview Scheduler',
      'Analytics Dashboard',
      'Student Management',
      'Export Reports',
    ],
  },
  {
    id: 'alumni',
    title: 'Alumni Network',
    desc: 'Post job referrals, mentor students, share insights, and give back to your alma mater',
    icon: Briefcase,
    gradient: 'from-orange-500/20 via-amber-500/20 to-red-500/20',
    accent: 'text-amber-300',
    btnGradient: 'from-orange-500 to-red-600',
    features: [
      'Post Job Referrals',
      'Mentorship Slots',
      'Interview Reviews',
      'Career Guidance',
      'Company Insights',
      'Network Growth',
    ],
  },
]

const WHY_CHOOSE = [
  {
    icon: Target,
    title: 'Smart Matching',
    desc: 'AI-powered algorithm matches students with relevant opportunities based on skills and criteria.',
    color: 'bg-cyan-500/20 text-cyan-300',
  },
  {
    icon: Zap,
    title: 'Real-time Updates',
    desc: 'Instant notifications for drive updates, application status, and interview schedules.',
    color: 'bg-pink-500/20 text-pink-300',
  },
  {
    icon: BarChart3,
    title: 'Analytics Dashboard',
    desc: 'Comprehensive insights into placement trends, skill gaps, and performance metrics.',
    color: 'bg-amber-500/20 text-amber-300',
  },
  {
    icon: Users,
    title: 'Alumni Network',
    desc: 'Connect with successful alumni for mentorship, referrals, and career guidance.',
    color: 'bg-emerald-500/20 text-emerald-300',
  },
  {
    icon: Shield,
    title: 'Secure & Private',
    desc: 'Role-based access control ensures data privacy and security for all users.',
    color: 'bg-purple-500/20 text-purple-300',
  },
  {
    icon: FileCheck,
    title: 'Resume Builder',
    desc: 'Professional resume wizard with college branding and AI-powered suggestions.',
    color: 'bg-yellow-500/20 text-yellow-300',
  },
]

function DashboardLoginCard({ dashboard, onSuccess }) {
  const [modalOpen, setModalOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const Icon = dashboard.icon

  const handleLogin = async ({ email, password }) => {
    setLoading(true)
    try {
      const { data } = await authAPI.login({ email, password, role: dashboard.id })
      if (data.success) {
        onSuccess(data)
        toast.success('Welcome to PlacementPro! 🎉')
        setModalOpen(false)
      }
    } catch (err) {
      let msg = err.response?.data?.message
      if (!msg) {
        if (err.code === 'ERR_NETWORK' || err.message === 'Network Error') {
          msg = 'Backend not running. Run: cd placementpro-backend && npm run dev'
        } else if ([500, 502, 503, 504].includes(err.response?.status)) {
          msg = 'Server error. Check MongoDB connection and run: npm run seed'
        } else {
          msg = 'Login failed'
        }
      }
      toast.error(msg)
    } finally {
      setLoading(false)
    }
  }

  const handleRegister = async ({ email, password, name }) => {
    setLoading(true)
    try {
      const { data } = await authAPI.register({ email, password, role: dashboard.id, name: name || '' })
      if (data.success) {
        onSuccess(data)
        toast.success('Account created! Welcome to PlacementPro! 🎉')
        setModalOpen(false)
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Registration failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      <motion.div
        layout
        className={`rounded-2xl overflow-hidden bg-white/5 backdrop-blur-xl border border-white/10 shadow-2xl ${dashboard.gradient}`}
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.5 }}
      >
        <div className="p-6">
          <div className="flex items-start gap-4 mb-4">
            <div className="w-14 h-14 rounded-2xl bg-white/10 flex items-center justify-center shrink-0">
              <Icon className="w-7 h-7 text-white" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-white">{dashboard.title}</h3>
              <p className="text-sm text-white/70 mt-0.5">{dashboard.desc}</p>
            </div>
          </div>

          <ul className={`space-y-2 mb-6 text-sm ${dashboard.accent}`}>
            {dashboard.features.map((f, i) => (
              <li key={i} className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-current opacity-80" />
                {f}
              </li>
            ))}
          </ul>

          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => setModalOpen(true)}
            className={`w-full py-3 rounded-xl font-semibold text-white bg-gradient-to-r ${dashboard.btnGradient} flex items-center justify-center gap-2 shadow-lg`}
          >
            Login as {dashboard.id === 'student' ? 'Student' : dashboard.id === 'tpo' ? 'TPO' : 'Alumni'}
            <ArrowRight className="w-4 h-4" />
          </motion.button>
        </div>
      </motion.div>

      <LoginModal
        role={dashboard.id}
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        onSubmit={handleLogin}
        onRegister={handleRegister}
        loading={loading}
      />
    </>
  )
}

export default function Landing() {
  const { user, login } = useAuth()
  const navigate = useNavigate()

  useEffect(() => {
    if (user) {
      navigate(`/${user.role}`, { replace: true })
    }
  }, [user, navigate])

  const handleLoginSuccess = (data) => {
    login(data)
    navigate(`/${data.user.role}`, { replace: true })
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900/40 to-slate-900 text-white overflow-x-hidden">
      {/* Hero */}
      <section className="relative min-h-screen flex flex-col items-center justify-center px-6 pt-20 pb-16">
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-purple-500/20 rounded-full blur-3xl" />
          <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-blue-500/20 rounded-full blur-3xl" />
          <div className="absolute top-1/2 left-1/2 w-64 h-64 bg-pink-500/10 rounded-full blur-3xl" />
        </div>

        <motion.div
          className="relative z-10 max-w-4xl mx-auto text-center"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 mb-6">
            <Rocket className="w-4 h-4 text-cyan-400" />
            <span className="text-sm font-medium text-white/90">Next-Gen Placement Management</span>
          </div>

          <h1 className="text-5xl md:text-7xl font-bold mb-4 tracking-tight">
            Placement<span className="text-cyan-400">Pro</span>
          </h1>

          <p className="text-lg md:text-xl text-white/80 max-w-2xl mx-auto mb-10">
            Transform your campus placements with AI-powered insights, streamlined processes, and
            real-time collaboration between students, TPO, and alumni.
          </p>

          <div className="flex flex-wrap gap-4 justify-center mb-16">
            <motion.a
              href="#dashboards"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.98 }}
              className="px-8 py-4 rounded-xl font-semibold bg-gradient-to-r from-cyan-500 to-blue-600 text-white flex items-center gap-2 shadow-lg shadow-cyan-500/25"
            >
              Get Started
              <ArrowRight className="w-5 h-5" />
            </motion.a>
            <motion.a
              href="#why-choose"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.98 }}
              className="px-8 py-4 rounded-xl font-semibold bg-white/5 border border-white/20 text-white flex items-center gap-2 hover:bg-white/10"
            >
              <Play className="w-5 h-5" />
              Watch Demo
            </motion.a>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-3xl mx-auto">
            {[
              { value: '10K+', label: 'Students' },
              { value: '500+', label: 'Companies' },
              { value: '95%', label: 'Placement Rate' },
              { value: '₹15L', label: 'Avg. Package' },
            ].map((s, i) => (
              <motion.div
                key={s.label}
                className="rounded-2xl bg-white/5 backdrop-blur-md border border-white/10 p-4"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 + i * 0.1 }}
              >
                <div className="text-2xl md:text-3xl font-bold text-white">{s.value}</div>
                <div className="text-sm text-white/60 mt-0.5">{s.label}</div>
              </motion.div>
            ))}
          </div>

          <motion.div
            className="mt-16 flex flex-col items-center gap-2 text-white/50"
            animate={{ y: [0, 8, 0] }}
            transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
          >
            <span className="text-sm">Scroll to explore</span>
            <ChevronDown className="w-6 h-6" />
          </motion.div>
        </motion.div>
      </section>

      {/* Why Choose PlacementPro */}
      <section id="why-choose" className="relative py-24 px-6 scroll-mt-20">
        <div className="max-w-6xl mx-auto">
          <motion.div
            className="text-center mb-16"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="text-4xl md:text-5xl font-bold mb-4">Why Choose PlacementPro?</h2>
            <p className="text-lg text-white/70 max-w-2xl mx-auto">
              Everything you need to manage campus placements efficiently and effectively
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {WHY_CHOOSE.map((item, i) => (
              <motion.div
                key={item.title}
                className="rounded-2xl bg-white/5 backdrop-blur-xl border border-white/10 p-6 hover:bg-white/10 transition-colors"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.05 }}
              >
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center mb-4 ${item.color}`}>
                  <item.icon className="w-6 h-6" />
                </div>
                <h3 className="text-xl font-bold text-white mb-2">{item.title}</h3>
                <p className="text-white/70 text-sm leading-relaxed">{item.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Choose Your Dashboard */}
      <section id="dashboards" className="relative py-24 px-6 scroll-mt-20">
        <div className="max-w-6xl mx-auto">
          <motion.div
            className="text-center mb-16"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="text-4xl md:text-5xl font-bold mb-4">Choose Your Dashboard</h2>
            <p className="text-lg text-white/70 max-w-2xl mx-auto">
              Tailored experiences for students, TPO officers, and alumni
            </p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-8">
            {DASHBOARDS.map((d) => (
              <DashboardLoginCard key={d.id} dashboard={d} onSuccess={handleLoginSuccess} />
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 border-t border-white/10 text-center text-white/50 text-sm">
        <p>© {new Date().getFullYear()} PlacementPro. Campus Placement Management Platform.</p>
      </footer>
    </div>
  )
}
