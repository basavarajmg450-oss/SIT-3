import { useState, useEffect } from 'react'
import { useSearchParams, useNavigate } from 'react-router-dom'
import { authAPI } from '../services/api'
import toast from 'react-hot-toast'
import { Lock, ArrowRight } from 'lucide-react'
import { useTheme } from '../context/ThemeContext'

export default function ResetPassword() {
  const { isDark } = useTheme()
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [loading, setLoading] = useState(false)

  const token = searchParams.get('token')
  const email = searchParams.get('email')
  const role = searchParams.get('role')

  useEffect(() => {
    if (!token || !email || !role) {
      toast.error('Invalid reset link')
      navigate('/')
    }
  }, [token, email, role, navigate])

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (password.length < 6) {
      toast.error('Password must be at least 6 characters')
      return
    }
    if (password !== confirmPassword) {
      toast.error('Passwords do not match')
      return
    }
    setLoading(true)
    try {
      const { data } = await authAPI.resetPassword({ token, email, role, password })
      if (data.success) {
        toast.success('Password reset! Sign in with your new password.')
        navigate('/')
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to reset password')
    } finally {
      setLoading(false)
    }
  }

  if (!token || !email || !role) return null

  return (
    <div className={`min-h-screen flex items-center justify-center p-6 transition-colors duration-500 ${isDark ? 'bg-slate-900' : 'bg-[#fcfdff]'}`}>
      <div className={`w-full max-w-md rounded-3xl overflow-hidden shadow-2xl transition-all duration-300 border ${isDark ? 'bg-slate-900 border-white/10' : 'bg-white border-slate-200'
        }`}>
        <div className="px-6 py-5 bg-gradient-to-r from-cyan-500 to-indigo-600">
          <h1 className="text-xl font-bold text-white">Reset Password</h1>
          <p className="text-sm text-white/90 mt-0.5">Enter your new password</p>
        </div>
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-white/90' : 'text-slate-700'}`}>New Password</label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Min 6 characters"
                className={`w-full pl-11 pr-4 py-3 rounded-xl transition-all outline-none focus:ring-2 focus:ring-cyan-500/50 border ${isDark ? 'bg-slate-800 border-slate-600/50 text-white placeholder-gray-500' : 'bg-white border-slate-200 text-slate-900'
                  }`}
                required
                minLength={6}
              />
            </div>
          </div>
          <div>
            <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-white/90' : 'text-slate-700'}`}>Confirm Password</label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Re-enter password"
                className={`w-full pl-11 pr-4 py-3 rounded-xl transition-all outline-none focus:ring-2 focus:ring-cyan-500/50 border ${isDark ? 'bg-slate-800 border-slate-600/50 text-white placeholder-gray-500' : 'bg-white border-slate-200 text-slate-900'
                  }`}
                required
              />
            </div>
          </div>
          <button
            type="submit"
            disabled={loading}
            className="w-full py-3.5 rounded-xl font-semibold text-white bg-gradient-to-r from-cyan-500 to-indigo-600 flex items-center justify-center gap-2 disabled:opacity-70"
          >
            {loading ? 'Resetting...' : 'Reset Password'}
            <ArrowRight className="w-4 h-4" />
          </button>
          <a href="/" className="block text-center text-sm text-cyan-400 hover:text-cyan-300">
            ← Back to login
          </a>
        </form>
      </div>
    </div>
  )
}
