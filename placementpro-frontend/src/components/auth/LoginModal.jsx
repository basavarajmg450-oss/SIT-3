import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import toast from 'react-hot-toast'
import { GraduationCap, User, Users, Mail, Lock, Eye, EyeOff, X } from 'lucide-react'

const DEMO_CREDENTIALS = {
  student: { email: 'student1@college.edu', password: 'Password123' },
  tpo: { email: 'tpo@college.edu', password: 'Password123' },
  alumni: { email: 'alumni1@gmail.com', password: 'Password123' },
}

const ROLE_CONFIG = {
  student: {
    title: 'Student Portal',
    icon: GraduationCap,
    headerGradient: 'from-blue-500 to-blue-700',
    btnGradient: 'from-blue-500 to-indigo-600',
    linkColor: 'text-blue-400 hover:text-blue-300',
  },
  tpo: {
    title: 'TPO Dashboard',
    icon: User,
    headerGradient: 'from-purple-500 to-pink-600',
    btnGradient: 'from-purple-500 to-pink-600',
    linkColor: 'text-purple-400 hover:text-purple-300',
  },
  alumni: {
    title: 'Alumni Network',
    icon: Users,
    headerGradient: 'from-orange-500 to-red-600',
    btnGradient: 'from-orange-500 to-red-600',
    linkColor: 'text-orange-400 hover:text-orange-300',
  },
}

export default function LoginModal({ role, isOpen, onClose, onSubmit, onRegister, loading }) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [name, setName] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [isRegister, setIsRegister] = useState(false)
  const [showForgot, setShowForgot] = useState(false)
  const [forgotLoading, setForgotLoading] = useState(false)

  const config = ROLE_CONFIG[role] || ROLE_CONFIG.student
  const Icon = config.icon

  useEffect(() => {
    if (!isOpen) {
      setIsRegister(false)
      setShowForgot(false)
    }
  }, [isOpen])

  useEffect(() => {
    const onEscape = (e) => { if (e.key === 'Escape') onClose() }
    if (isOpen) {
      document.addEventListener('keydown', onEscape)
      return () => document.removeEventListener('keydown', onEscape)
    }
  }, [isOpen, onClose])

  const useDemoCredentials = () => {
    const demo = DEMO_CREDENTIALS[role]
    if (demo) {
      setEmail(demo.email)
      setPassword(demo.password)
    }
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    if (isRegister && onRegister) {
      onRegister({ email, password, name: name.trim() })
    } else {
      onSubmit({ email, password })
    }
  }

  const handleForgotPassword = async (e) => {
    e.preventDefault()
    if (!email) return
    setForgotLoading(true)
    try {
      const { authAPI } = await import('../../services/api')
      const { data } = await authAPI.forgotPassword({ email, role })
      if (data.success) {
        toast.success('If an account exists, a reset link has been sent to your email.')
        setShowForgot(false)
      }
    } catch {
      toast.error('Failed to send reset link.')
    } finally {
      setForgotLoading(false)
    }
  }

  return (
    <AnimatePresence>
      {isOpen && (
      <motion.div
        key="login-modal"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center p-4"
      >
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        />

        {/* Modal */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          transition={{ type: 'spring', damping: 25, stiffness: 300 }}
          className="relative w-full max-w-md rounded-3xl overflow-hidden shadow-2xl"
        >
          {/* Header - Gradient */}
          <div className={`relative px-6 py-5 bg-gradient-to-r ${config.headerGradient}`}>
            <button
              onClick={onClose}
              className="absolute top-5 right-5 w-8 h-8 flex items-center justify-center rounded-full bg-white/20 hover:bg-white/30 text-white transition-colors"
              aria-label="Close"
            >
              <X className="w-5 h-5" />
            </button>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center">
                <Icon className="w-5 h-5 text-white" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-white">{config.title}</h2>
                <p className="text-sm text-white/90 mt-0.5">Sign in to access your dashboard</p>
              </div>
            </div>
          </div>

          {/* Form Body - Dark */}
          <div className="bg-slate-900/95 px-6 py-6">
            {showForgot ? (
              <form onSubmit={handleForgotPassword} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-white mb-2">Email Address</label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="you@example.com"
                      className="w-full pl-11 pr-4 py-3 rounded-xl bg-slate-800/80 border border-slate-600/50 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-white/30 focus:border-transparent text-sm"
                      required
                    />
                  </div>
                </div>
                <button
                  type="submit"
                  disabled={forgotLoading}
                  className={`w-full py-3.5 rounded-xl font-semibold text-white bg-gradient-to-r ${config.btnGradient} flex items-center justify-center disabled:opacity-70`}
                >
                  {forgotLoading ? 'Sending...' : 'Send Reset Link'}
                </button>
                <button type="button" onClick={() => setShowForgot(false)} className="w-full text-center text-sm text-gray-400 hover:text-white">
                  ← Back to Sign In
                </button>
              </form>
            ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              {isRegister && (
                <div>
                  <label className="block text-sm font-medium text-white mb-2">Full Name</label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Your name"
                    className="w-full px-4 py-3 rounded-xl bg-slate-800/80 border border-slate-600/50 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-white/30 text-sm"
                  />
                </div>
              )}
              <div>
                <label className="block text-sm font-medium text-white mb-2">Email Address</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@example.com"
                    className="w-full pl-11 pr-4 py-3 rounded-xl bg-slate-800/80 border border-slate-600/50 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-white/30 focus:border-transparent"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-white mb-2">Password</label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full pl-11 pr-12 py-3 rounded-xl bg-slate-800/80 border border-slate-600/50 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-white/30 focus:border-transparent"
                    required
                    minLength={6}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white"
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                  >
                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
              </div>

              <div className="flex justify-end">
                <button
                  type="button"
                  onClick={useDemoCredentials}
                  className={`text-sm underline ${config.linkColor}`}
                >
                  Use demo credentials
                </button>
              </div>

              <button
                type="submit"
                disabled={loading}
                className={`w-full py-3.5 rounded-xl font-semibold text-white bg-gradient-to-r ${config.btnGradient} flex items-center justify-center gap-2 shadow-lg disabled:opacity-70 transition-opacity`}
              >
                {loading ? (
                  <motion.div
                    className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full"
                    animate={{ rotate: 360 }}
                    transition={{ duration: 0.8, repeat: Infinity, ease: 'linear' }}
                  />
                ) : isRegister ? (
                  'Create Account'
                ) : (
                  'Sign In'
                )}
              </button>

              <p className="text-center text-sm text-gray-500">
                Forgot password?{' '}
                <button type="button" onClick={() => setShowForgot(true)} className={`underline ${config.linkColor}`}>
                  Reset here
                </button>
              </p>
              {onRegister && (
                <p className="text-center text-sm text-gray-500">
                  {isRegister ? (
                    <button type="button" onClick={() => setIsRegister(false)} className={`underline ${config.linkColor}`}>
                      Already have an account? Sign In
                    </button>
                  ) : (
                    <button type="button" onClick={() => setIsRegister(true)} className={`underline ${config.linkColor}`}>
                      Don&apos;t have an account? Register
                    </button>
                  )}
                </p>
              )}
            </form>
            )}
          </div>
        </motion.div>
      </motion.div>
      )}
    </AnimatePresence>
  )
}
