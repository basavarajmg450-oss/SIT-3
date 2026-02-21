import { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { authAPI } from '../services/api'
import toast from 'react-hot-toast'
import { Mail, ArrowRight, RefreshCw, Shield, Sparkles, TrendingUp, Users } from 'lucide-react'
import { useTheme } from '../context/ThemeContext'

const ROLES = [
  { value: 'student', label: 'Student', icon: '🎓', desc: 'Track placements & apply to drives' },
  { value: 'tpo', label: 'TPO', icon: '👨‍💼', desc: 'Manage drives & students' },
  { value: 'alumni', label: 'Alumni', icon: '🌟', desc: 'Give referrals & mentor students' },
]

export default function Login() {
  const [step, setStep] = useState('role')
  const [role, setRole] = useState('')
  const [email, setEmail] = useState('')
  const [otp, setOtp] = useState(['', '', '', '', '', ''])
  const [loading, setLoading] = useState(false)
  const [countdown, setCountdown] = useState(0)
  const otpRefs = useRef([])
  const { isDark } = useTheme()
  const { login, user } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()

  useEffect(() => {
    if (user) {
      const dest = location.state?.from?.pathname || `/${user.role}`
      navigate(dest, { replace: true })
    }
  }, [user])

  useEffect(() => {
    if (countdown > 0) {
      const t = setTimeout(() => setCountdown((c) => c - 1), 1000)
      return () => clearTimeout(t)
    }
  }, [countdown])

  const handleSendOTP = async (e) => {
    e?.preventDefault?.()
    if (!email) return toast.error('Please enter your email')
    setLoading(true)
    try {
      const { data } = await authAPI.sendOTP({ email, role })
      if (data.success) {
        toast.success('OTP sent! Check your email (or console in dev mode)')
        setStep('otp')
        setCountdown(60)
        setTimeout(() => otpRefs.current[0]?.focus(), 100)
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to send OTP')
    } finally {
      setLoading(false)
    }
  }

  const handleOTPChange = (idx, val) => {
    if (!/^\d*$/.test(val)) return
    const newOtp = [...otp]
    newOtp[idx] = val.slice(-1)
    setOtp(newOtp)
    if (val && idx < 5) otpRefs.current[idx + 1]?.focus()
    if (newOtp.every((d) => d) && newOtp.join('').length === 6) {
      handleVerifyOTP(newOtp.join(''))
    }
  }

  const handleOTPKeyDown = (idx, e) => {
    if (e.key === 'Backspace' && !otp[idx] && idx > 0) {
      otpRefs.current[idx - 1]?.focus()
    }
  }

  const handleOTPPaste = (e) => {
    e.preventDefault()
    const text = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6)
    if (text.length === 6) {
      setOtp(text.split(''))
      handleVerifyOTP(text)
    }
  }

  const handleVerifyOTP = async (otpValue) => {
    const otpStr = otpValue || otp.join('')
    if (otpStr.length < 6) return toast.error('Please enter complete OTP')
    setLoading(true)
    try {
      const { data } = await authAPI.verifyOTP({ email, otp: otpStr, role })
      if (data.success) {
        login(data)
        toast.success(`Welcome to PlacementPro! 🎉`)
        const dashboards = { student: '/student', tpo: '/tpo', alumni: '/alumni' }
        navigate(dashboards[data.user.role] || '/')
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Invalid OTP')
      setOtp(['', '', '', '', '', ''])
      otpRefs.current[0]?.focus()
    } finally {
      setLoading(false)
    }
  }

  const features = [
    { icon: <TrendingUp className="w-5 h-5" />, text: 'Track placement statistics & trends' },
    { icon: <Users className="w-5 h-5" />, text: 'Connect students with top companies' },
    { icon: <Sparkles className="w-5 h-5" />, text: 'AI-powered resume & interview tips' },
    { icon: <Shield className="w-5 h-5" />, text: 'Secure OTP-based authentication' },
  ]

  return (
    <div className="min-h-screen flex">
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-indigo-600 via-purple-600 to-indigo-800 flex-col justify-between p-12 relative overflow-hidden">
        <div className="absolute inset-0">
          {[...Array(6)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute rounded-full bg-white/5"
              style={{
                width: `${(i + 2) * 80}px`,
                height: `${(i + 2) * 80}px`,
                top: `${[10, 60, 30, 70, 20, 80][i]}%`,
                left: `${[20, 70, 50, 10, 80, 40][i]}%`,
              }}
              animate={{ y: [0, -20, 0], rotate: [0, 180, 360] }}
              transition={{ duration: 8 + i * 2, repeat: Infinity, ease: 'easeInOut' }}
            />
          ))}
        </div>

        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-16">
            <span className="text-4xl">🎓</span>
            <span className="text-3xl font-bold text-white">PlacementPro</span>
          </div>

          <div>
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-4xl font-bold text-white mb-4 leading-tight"
            >
              Your College's<br />
              <span className="text-yellow-300">Smart Placement</span><br />
              Platform
            </motion.h1>
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="text-indigo-200 text-lg mb-10"
            >
              Replace Excel sheets and notice boards with an intelligent placement management system.
            </motion.p>

            <div className="space-y-4">
              {features.map((f, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.2 + i * 0.1 }}
                  className="flex items-center gap-3 text-white/90"
                >
                  <div className="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center text-white">
                    {f.icon}
                  </div>
                  <span className="text-sm">{f.text}</span>
                </motion.div>
              ))}
            </div>
          </div>
        </div>

        <div className="relative z-10">
          <div className="grid grid-cols-3 gap-4">
            {[{ v: '500+', l: 'Students' }, { v: '50+', l: 'Companies' }, { v: '95%', l: 'Placement Rate' }].map((s) => (
              <div key={s.l} className="text-center">
                <div className="text-2xl font-bold text-white">{s.v}</div>
                <div className="text-xs text-indigo-300 mt-0.5">{s.l}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className={`w-full lg:w-1/2 flex items-center justify-center p-6 transition-colors duration-300 ${isDark ? 'bg-slate-900' : 'bg-[#fcfdff]'
        }`}>
        <div className="w-full max-w-md">
          <div className="lg:hidden flex items-center gap-2 justify-center mb-8">
            <span className="text-3xl">🎓</span>
            <span className="text-2xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
              PlacementPro
            </span>
          </div>

          <AnimatePresence mode="wait">
            {step === 'role' && (
              <motion.div
                key="role"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
              >
                <h2 className={`text-2xl font-bold mb-1 ${isDark ? 'text-white' : 'text-slate-900'}`}>Welcome Back! 👋</h2>
                <p className={`${isDark ? 'text-slate-400' : 'text-slate-500'} mb-8`}>Select your role to continue</p>

                <div className="space-y-3 mb-6">
                  {ROLES.map((r) => (
                    <motion.button
                      key={r.value}
                      whileHover={{ scale: 1.01 }}
                      whileTap={{ scale: 0.99 }}
                      onClick={() => { setRole(r.value); setStep('email') }}
                      className={`w-full flex items-center gap-4 p-4 rounded-2xl border-2 text-left transition-all ${role === r.value
                          ? isDark ? 'border-indigo-500 bg-indigo-500/10' : 'border-indigo-500 bg-indigo-50'
                          : isDark ? 'border-white/10 bg-white/5 hover:border-white/20 hover:bg-white/10' : 'border-slate-200 bg-white hover:border-indigo-300 hover:bg-slate-50/50'
                        }`}
                    >
                      <span className="text-3xl">{r.icon}</span>
                      <div>
                        <p className={`font-semibold ${isDark ? 'text-white' : 'text-slate-900'}`}>{r.label}</p>
                        <p className={`text-sm ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>{r.desc}</p>
                      </div>
                      <ArrowRight className="w-5 h-5 text-gray-400 ml-auto" />
                    </motion.button>
                  ))}
                </div>
              </motion.div>
            )}

            {step === 'email' && (
              <motion.div
                key="email"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
              >
                <button onClick={() => setStep('role')} className="flex items-center gap-1 text-sm text-indigo-600 hover:text-indigo-700 mb-6 font-medium">
                  ← Back
                </button>
                <div className="flex items-center gap-3 mb-6">
                  <span className="text-3xl">{ROLES.find((r) => r.value === role)?.icon}</span>
                  <div>
                    <h2 className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}>Sign In</h2>
                    <p className={`${isDark ? 'text-slate-400' : 'text-slate-500'} text-sm`}>as {ROLES.find((r) => r.value === role)?.label}</p>
                  </div>
                </div>

                <form onSubmit={handleSendOTP} className="space-y-4">
                  <div>
                    <label className={`block text-sm font-medium mb-1.5 ${isDark ? 'text-slate-200' : 'text-slate-700'}`}>Email Address</label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                      <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="your.email@college.edu"
                        className={`w-full pl-10 pr-4 py-3 rounded-xl border transition-all outline-none focus:ring-2 focus:ring-indigo-500/40 ${isDark ? 'bg-slate-800 border-white/10 text-white' : 'bg-white border-slate-200 text-slate-900'
                          }`}
                        required
                        autoFocus
                      />
                    </div>
                  </div>

                  <motion.button
                    type="submit"
                    disabled={loading}
                    whileTap={{ scale: 0.98 }}
                    className="btn-primary w-full flex items-center justify-center gap-2 disabled:opacity-60"
                  >
                    {loading ? (
                      <motion.div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full" animate={{ rotate: 360 }} transition={{ duration: 0.8, repeat: Infinity }} />
                    ) : (
                      <>Send OTP <ArrowRight className="w-4 h-4" /></>
                    )}
                  </motion.button>
                </form>

                <div className="mt-6 p-3 bg-blue-50 rounded-xl">
                  <p className="text-xs text-blue-600">
                    💡 <strong>Dev Mode:</strong> OTP is logged to server console. Check terminal.
                  </p>
                </div>
                <p className="text-center text-sm text-gray-500 mt-4">
                  Prefer password?{' '}
                  <button type="button" onClick={() => navigate('/')} className="text-indigo-600 hover:text-indigo-700 font-medium">
                    Sign in with password on home
                  </button>
                </p>
              </motion.div>
            )}

            {step === 'otp' && (
              <motion.div
                key="otp"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
              >
                <button onClick={() => { setStep('email'); setOtp(['', '', '', '', '', '']) }} className="flex items-center gap-1 text-sm text-indigo-600 hover:text-indigo-700 mb-6 font-medium">
                  ← Back
                </button>

                <div className="text-center mb-8">
                  <div className={`w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4 ${isDark ? 'bg-white/5' : 'bg-indigo-50'}`}>
                    <Shield className="w-8 h-8 text-indigo-600" />
                  </div>
                  <h2 className={`text-2xl font-bold mb-1 ${isDark ? 'text-white' : 'text-slate-900'}`}>Enter OTP</h2>
                  <p className={`${isDark ? 'text-slate-400' : 'text-slate-500'} text-sm`}>We sent a 6-digit code to</p>
                  <p className="text-indigo-600 font-medium">{email}</p>
                </div>

                <div className="flex gap-2 justify-center mb-6">
                  {otp.map((digit, idx) => (
                    <input
                      key={idx}
                      ref={(el) => (otpRefs.current[idx] = el)}
                      type="text"
                      inputMode="numeric"
                      maxLength={1}
                      value={digit}
                      onChange={(e) => handleOTPChange(idx, e.target.value)}
                      onKeyDown={(e) => handleOTPKeyDown(idx, e)}
                      onPaste={handleOTPPaste}
                      className={`w-12 h-14 text-center text-xl font-bold border-2 rounded-xl transition-all focus:outline-none ${digit
                          ? isDark ? 'border-indigo-500 bg-indigo-500/20 text-indigo-300' : 'border-indigo-500 bg-indigo-50 text-indigo-700'
                          : isDark ? 'border-white/10 bg-white/5 focus:border-indigo-400' : 'border-slate-200 bg-white focus:border-indigo-400'
                        }`}
                    />
                  ))}
                </div>

                <motion.button
                  onClick={() => handleVerifyOTP()}
                  disabled={loading || otp.join('').length < 6}
                  whileTap={{ scale: 0.98 }}
                  className="btn-primary w-full flex items-center justify-center gap-2 disabled:opacity-60 mb-4"
                >
                  {loading ? (
                    <motion.div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full" animate={{ rotate: 360 }} transition={{ duration: 0.8, repeat: Infinity }} />
                  ) : (
                    <>Verify OTP <ArrowRight className="w-4 h-4" /></>
                  )}
                </motion.button>

                <div className="text-center">
                  {countdown > 0 ? (
                    <p className="text-sm text-gray-500">Resend in <span className="font-medium text-indigo-600">{countdown}s</span></p>
                  ) : (
                    <button
                      onClick={handleSendOTP}
                      className="text-sm text-indigo-600 hover:text-indigo-700 font-medium flex items-center gap-1 mx-auto"
                    >
                      <RefreshCw className="w-4 h-4" /> Resend OTP
                    </button>
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  )
}
