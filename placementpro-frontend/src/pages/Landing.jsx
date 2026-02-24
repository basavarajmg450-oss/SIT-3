import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useTheme } from '../context/ThemeContext'
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
  Sparkles,
  Star,
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

// Animated counter component
function AnimatedCounter({ value, label, delay = 0 }) {
  const [count, setCount] = useState(0)
  const ref = useRef(null)

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          const numericValue = parseInt(value.replace(/\D/g, ''))
          let current = 0
          const increment = numericValue / 50
          const timer = setInterval(() => {
            current += increment
            if (current >= numericValue) {
              setCount(numericValue)
              clearInterval(timer)
            } else {
              setCount(Math.floor(current))
            }
          }, 30)
          return () => clearInterval(timer)
        }
      },
      { threshold: 0.5 }
    )
    if (ref.current) observer.observe(ref.current)
    return () => observer.disconnect()
  }, [value])

  return (
    <motion.div
      ref={ref}
      className="rounded-2xl bg-white/10 backdrop-blur-xl border border-white/20 p-4 shadow-lg shadow-black/20 hover:bg-white/15 transition-all"
      initial={{ opacity: 0, y: 20, scale: 0.8 }}
      whileInView={{ opacity: 1, y: 0, scale: 1 }}
      viewport={{ once: true }}
      transition={{ delay, type: 'spring', stiffness: 100 }}
      whileHover={{ scale: 1.1, rotateY: 5, rotateX: 5 }}
      style={{ transformStyle: 'preserve-3d' }}
    >
      <motion.div
        className="text-2xl md:text-3xl font-bold text-white"
        key={count}
        initial={{ scale: 1.5, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.3 }}
      >
        {count}{value.replace(/\d/g, '')}
      </motion.div>
      <div className="text-sm text-white/60 mt-0.5">{label}</div>
    </motion.div>
  )
}

function DashboardLoginCard({ dashboard, onSuccess }) {
  const [modalOpen, setModalOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [isHovered, setIsHovered] = useState(false)
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
      let msg = err.response?.data?.message
      if (!msg) {
        if (err.code === 'ERR_NETWORK' || err.message === 'Network Error') {
          msg = 'Backend not running. Run: cd placementpro-backend && npm run dev'
        } else if ([500, 502, 503, 504].includes(err.response?.status)) {
          msg = 'Server error. Check MongoDB connection and run: npm run seed'
        } else {
          msg = 'Registration failed'
        }
      }
      toast.error(msg)
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      <motion.div
        layout
        className={`h-full flex flex-col rounded-2xl overflow-hidden bg-white/10 backdrop-blur-xl border border-white/20 shadow-2xl shadow-black/30 ${dashboard.gradient} hover:border-cyan-400/40 transition-all relative group`}
        initial={{ opacity: 0, y: 50, rotateX: -15 }}
        whileInView={{ opacity: 1, y: 0, rotateX: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6, type: 'spring', stiffness: 100 }}
        whileHover={{ scale: 1.05, y: -8, rotateY: 5 }}
        onHoverStart={() => setIsHovered(true)}
        onHoverEnd={() => setIsHovered(false)}
        style={{ transformStyle: 'preserve-3d', perspective: 1000 }}
      >
        <motion.div
          className={`absolute inset-0 bg-gradient-to-br ${dashboard.gradient} opacity-0 group-hover:opacity-100 transition-opacity duration-500`}
          animate={{ backgroundPosition: isHovered ? ['0% 0%', '100% 100%'] : '0% 0%' }}
          transition={{ duration: 3, repeat: Infinity, repeatType: 'reverse' }}
        />

        <AnimatePresence>
          {isHovered && (
            <>
              {[...Array(6)].map((_, i) => (
                <motion.div
                  key={i}
                  className="absolute w-2 h-2 bg-cyan-400 rounded-full"
                  initial={{ x: '50%', y: '50%', opacity: 0, scale: 0 }}
                  animate={{
                    x: `${20 + Math.random() * 60}%`,
                    y: `${20 + Math.random() * 60}%`,
                    opacity: [0, 1, 0],
                    scale: [0, 1.5, 0],
                  }}
                  exit={{ opacity: 0, scale: 0 }}
                  transition={{ duration: 1.5, delay: i * 0.1, repeat: Infinity, repeatDelay: 2 }}
                />
              ))}
            </>
          )}
        </AnimatePresence>

        <div className="p-6 relative z-10 flex flex-col flex-1 min-h-0">
          <div className="flex items-start gap-4 mb-4 shrink-0">
            <motion.div
              className="w-14 h-14 rounded-2xl bg-white/10 flex items-center justify-center shrink-0 group-hover:bg-white/20 transition-colors relative overflow-hidden"
              whileHover={{ rotate: 360, scale: 1.15 }}
              transition={{ duration: 0.6, type: 'spring' }}
            >
              <motion.div
                className="absolute inset-0 bg-gradient-to-br from-cyan-400/20 to-purple-400/20 opacity-0 group-hover:opacity-100 transition-opacity"
                animate={{ rotate: [0, 360] }}
                transition={{ duration: 20, repeat: Infinity, ease: 'linear' }}
              />
              <motion.div
                className="relative z-10"
                animate={isHovered ? { rotate: [0, 10, -10, 0], scale: [1, 1.2, 1] } : { rotate: [0, 360] }}
                transition={isHovered ? { duration: 0.5 } : { duration: 20, repeat: Infinity, ease: 'linear' }}
              >
                <Icon className="w-7 h-7 text-white icon-bounce" />
              </motion.div>
            </motion.div>
            <div>
              <motion.h3 className="text-xl font-bold text-white" initial={{ x: -20, opacity: 0 }} whileInView={{ x: 0, opacity: 1 }} viewport={{ once: true }} transition={{ delay: 0.2 }}>{dashboard.title}</motion.h3>
              <motion.p className="text-sm text-white/70 mt-0.5" initial={{ x: -20, opacity: 0 }} whileInView={{ x: 0, opacity: 1 }} viewport={{ once: true }} transition={{ delay: 0.3 }}>{dashboard.desc}</motion.p>
            </div>
          </div>

          <ul className={`space-y-2 mb-6 text-sm ${dashboard.accent} flex-1 min-h-[140px]`}>
            {dashboard.features.map((f, i) => (
              <motion.li key={i} className="flex items-center gap-2" initial={{ x: -20, opacity: 0 }} whileInView={{ x: 0, opacity: 1 }} viewport={{ once: true }} transition={{ delay: 0.1 * i }} whileHover={{ x: 5, scale: 1.05 }}>
                <motion.span className="w-1.5 h-1.5 rounded-full bg-current opacity-80" animate={{ scale: [1, 1.3, 1] }} transition={{ duration: 2, repeat: Infinity, delay: i * 0.2 }} />
                {f}
              </motion.li>
            ))}
          </ul>

          <motion.button
            whileHover={{ scale: 1.08, x: 5, boxShadow: '0 20px 40px rgba(0,0,0,0.4)' }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setModalOpen(true)}
            className={`mt-auto shrink-0 w-full py-3 rounded-xl font-semibold text-white bg-gradient-to-r ${dashboard.btnGradient} flex items-center justify-center gap-2 shadow-lg relative overflow-hidden group/btn gradient-shift`}
          >
            <motion.span className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/30 to-white/0" animate={{ x: ['-100%', '100%'] }} transition={{ duration: 2, repeat: Infinity, repeatDelay: 1 }} />
            <span className="relative z-10">Login as {dashboard.id === 'student' ? 'Student' : dashboard.id === 'tpo' ? 'TPO' : 'Alumni'}</span>
            <motion.div className="relative z-10" animate={{ x: [0, 5, 0] }} transition={{ duration: 1.5, repeat: Infinity }}><ArrowRight className="w-4 h-4" /></motion.div>
          </motion.button>
        </div>
      </motion.div>

      <LoginModal role={dashboard.id} isOpen={modalOpen} onClose={() => setModalOpen(false)} onSubmit={handleLogin} onRegister={handleRegister} loading={loading} />
    </>
  )
}

export default function Landing() {
  const { user, login } = useAuth()
  const { setForceDark } = useTheme()
  const navigate = useNavigate()

  // Force dark mode ONLY on the landing page.
  // setForceDark(true) makes ThemeContext report isDark=true for ALL consumers
  // (including SharedBackground) without changing the user's saved preference.
  // Cleanup on unmount restores their actual preference.
  useEffect(() => {
    setForceDark(true)
    return () => setForceDark(false)
  }, [setForceDark])

  useEffect(() => {
    if (user) {
      navigate(`/${user.role}`, { replace: true })
    }
  }, [user, navigate])

  const handleLoginSuccess = (data) => {
    login(data)
    navigate(`/${data.user.role}`, { replace: true })
  }

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.1, delayChildren: 0.2 } },
  }

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: { y: 0, opacity: 1, transition: { type: 'spring', stiffness: 100 } },
  }

  return (
    <div className="min-h-screen transition-colors duration-500 overflow-x-hidden relative text-white">
      <section className="relative min-h-screen flex flex-col items-center justify-center px-6 pt-20 pb-16 z-10">
        <motion.div className="absolute inset-0 pointer-events-none flex items-center justify-center" aria-hidden>
          <motion.div className="w-[min(80vw,400px)] h-64 rounded-full bg-cyan-500/20 blur-[80px]" animate={{ scale: [1, 1.15, 1], opacity: [0.4, 0.7, 0.4] }} transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }} />
        </motion.div>

        <motion.div className="relative z-10 max-w-4xl mx-auto text-center" variants={containerVariants} initial="hidden" animate="visible">
          <motion.h1
            className="text-5xl md:text-7xl font-bold mb-4 tracking-tight drop-shadow-[0_0_30px_rgba(56,189,248,0.5)]"
            variants={itemVariants}
            animate={{ y: [0, -6, 0] }}
            transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
          >
            <motion.span initial={{ opacity: 0, y: 50 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, type: 'spring', stiffness: 100 }}>Placement</motion.span>
            <motion.span className="text-cyan-400 drop-shadow-[0_0_40px_rgba(56,189,248,0.8)] inline-block" initial={{ opacity: 0, scale: 0 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.5, delay: 0.5, type: 'spring', stiffness: 200 }} whileHover={{ scale: 1.08, rotate: [0, -3, 3, 0], transition: { duration: 0.4 } }}>Pro</motion.span>
            <motion.span className="inline-block ml-2" animate={{ rotate: [0, 360] }} transition={{ duration: 4, repeat: Infinity, ease: 'linear' }}><Sparkles className="w-8 h-8 md:w-12 md:h-12 text-cyan-400 inline-block" /></motion.span>
          </motion.h1>

          <motion.p className="text-lg md:text-xl max-w-2xl mx-auto mb-10 drop-shadow-[0_2px_20px_rgba(0,0,0,0.5)] text-white/90" variants={itemVariants} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.8 }}>
            Transform your campus placements with <motion.span className="text-cyan-300 font-semibold" animate={{ opacity: [1, 0.5, 1] }} transition={{ duration: 2, repeat: Infinity }}>AI-powered insights</motion.span>, streamlined processes, and real-time collaboration between students, TPO, and alumni.
          </motion.p>

          <motion.div className="flex flex-wrap gap-4 justify-center mb-16" variants={itemVariants}>
            <motion.a href="#dashboards" className="group/btn px-8 py-4 rounded-xl font-semibold bg-gradient-to-r from-cyan-500 to-blue-600 text-white flex items-center gap-2 shadow-lg shadow-cyan-500/25 relative overflow-hidden" whileHover={{ scale: 1.05, y: -4, boxShadow: '0 20px 40px rgba(56, 189, 248, 0.35)' }} whileTap={{ scale: 0.98 }} initial={{ opacity: 0, x: -50 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 1, type: 'spring', stiffness: 100 }}>
              <span className="absolute inset-0 w-1/2 bg-gradient-to-r from-transparent via-white/25 to-transparent -translate-x-full group-hover/btn:translate-x-[200%] transition-transform duration-500" />
              <span className="relative z-10 flex items-center gap-2">Get Started <motion.span animate={{ x: [0, 4, 0] }} transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}><ArrowRight className="w-5 h-5" /></motion.span></span>
            </motion.a>
            <motion.a href="#why-choose" className="px-8 py-4 rounded-xl font-semibold bg-white/5 border border-white/20 text-white flex items-center gap-2 hover:bg-white/10 backdrop-blur-xl" whileHover={{ scale: 1.1, y: -5, borderColor: 'rgba(56, 189, 248, 0.5)' }} whileTap={{ scale: 0.95 }} initial={{ opacity: 0, x: 50 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 1.2, type: 'spring', stiffness: 100 }}>
              <motion.div animate={{ rotate: [0, 360] }} transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}><Play className="w-5 h-5" /></motion.div> Watch Demo
            </motion.a>
          </motion.div>

          <motion.div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-3xl mx-auto" variants={containerVariants}>
            {[
              { value: '10K+', label: 'Students' },
              { value: '500+', label: 'Companies' },
              { value: '95%', label: 'Placement Rate' },
              { value: '₹15L', label: 'Avg. Package' },
            ].map((s, i) => (
              <AnimatedCounter key={s.label} value={s.value} label={s.label} delay={0.3 + i * 0.1} />
            ))}
          </motion.div>

          <motion.div className="mt-16 flex flex-col items-center gap-2 text-white/50" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1.8 }}>
            <motion.span className="text-sm" animate={{ opacity: [0.5, 1, 0.5] }} transition={{ duration: 2.5, repeat: Infinity }}>Scroll to explore</motion.span>
            <motion.div animate={{ y: [0, 6, 0] }} transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}><ChevronDown className="w-6 h-6" /></motion.div>
          </motion.div>
        </motion.div>
      </section>

      <section id="why-choose" className="relative py-24 px-6 scroll-mt-20 z-10">
        <div className="max-w-6xl mx-auto">
          <motion.div className="text-center mb-16" initial={{ opacity: 0, y: 50 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: '-100px' }} transition={{ duration: 0.8, type: 'spring' }}>
            <motion.h2 className="text-4xl md:text-5xl font-bold mb-4" initial={{ opacity: 0, scale: 0.8 }} whileInView={{ opacity: 1, scale: 1 }} viewport={{ once: true }} transition={{ duration: 0.6 }}>
              Why Choose <motion.span className="text-cyan-400" animate={{ textShadow: ['0 0 20px rgba(56,189,248,0.5)', '0 0 40px rgba(56,189,248,0.8)', '0 0 20px rgba(56,189,248,0.5)'] }} transition={{ duration: 2, repeat: Infinity }}>PlacementPro?</motion.span>
            </motion.h2>
            <motion.p className="text-lg max-w-2xl mx-auto text-white/70" initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }} transition={{ delay: 0.3 }}>
              Everything you need to manage campus placements efficiently and effectively
            </motion.p>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {WHY_CHOOSE.map((item, i) => (
              <motion.div key={item.title} className="rounded-2xl bg-white/10 backdrop-blur-xl border border-white/20 p-6 hover:bg-white/15 hover:border-cyan-400/30 transition-all shadow-lg shadow-black/20 relative overflow-hidden group" initial={{ opacity: 0, y: 50, rotateX: -20 }} whileInView={{ opacity: 1, y: 0, rotateX: 0 }} viewport={{ once: true, margin: '-50px' }} transition={{ delay: i * 0.1, duration: 0.6, type: 'spring', stiffness: 100 }} whileHover={{ scale: 1.05, y: -8, rotateY: 5, z: 50 }} style={{ transformStyle: 'preserve-3d' }}>
                <motion.div className="absolute inset-0 bg-gradient-to-br from-cyan-500/20 to-purple-500/20 opacity-0 group-hover:opacity-100 transition-opacity duration-500" animate={{ backgroundPosition: ['0% 0%', '100% 100%'] }} transition={{ duration: 3, repeat: Infinity, repeatType: 'reverse' }} />
                <div className="relative z-10">
                  <motion.div className={`w-12 h-12 rounded-xl flex items-center justify-center mb-4 ${item.color} relative`} whileHover={{ scale: 1.1, rotate: [0, -8, 8, 0] }} transition={{ duration: 0.4 }}><item.icon className="w-6 h-6" /></motion.div>
                  <motion.h3 className="text-xl font-bold text-white mb-2" whileHover={{ x: 5 }}>{item.title}</motion.h3>
                  <motion.p className="text-white/70 text-sm leading-relaxed" initial={{ opacity: 0.7 }} whileHover={{ opacity: 1 }}>{item.desc}</motion.p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <section id="dashboards" className="relative py-24 px-6 scroll-mt-20 z-10">
        <div className="max-w-6xl mx-auto">
          <motion.div className="text-center mb-16" initial={{ opacity: 0, y: 50 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: '-100px' }} transition={{ duration: 0.8, type: 'spring' }}>
            <motion.h2 className="text-4xl md:text-5xl font-bold mb-4" initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: '-80px' }} transition={{ duration: 0.6, type: 'spring', stiffness: 80 }}>
              Choose Your <motion.span className="bg-gradient-to-r from-cyan-400 via-purple-400 to-pink-400 bg-clip-text text-transparent" animate={{ backgroundPosition: ['0%', '100%'] }} transition={{ duration: 3, repeat: Infinity, repeatType: 'reverse' }}>Dashboard</motion.span>
            </motion.h2>
            <motion.p className="text-lg max-w-2xl mx-auto text-white/70" initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }} transition={{ delay: 0.3 }}>Tailored experiences for students, TPO officers, and alumni</motion.p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-8 items-stretch" initial="hidden" whileInView="visible" viewport={{ once: true, margin: '-100px' }} variants={containerVariants}>
            {DASHBOARDS.map((d, i) => (
              <motion.div key={d.id} variants={itemVariants} custom={i} className="h-full"><DashboardLoginCard dashboard={d} onSuccess={handleLoginSuccess} /></motion.div>
            ))}
          </div>
        </div>
      </section>

      <footer className="relative py-8 border-t border-white/10 text-center text-white/50 text-sm z-10 bg-slate-900/40 backdrop-blur-sm">
        <p>© {new Date().getFullYear()} PlacementPro. Campus Placement Management Platform.</p>
      </footer>
    </div>
  )
}
