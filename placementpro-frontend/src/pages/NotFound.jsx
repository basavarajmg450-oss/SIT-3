import { motion } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export default function NotFound() {
  const navigate = useNavigate()
  const { user } = useAuth()

  const dashboardPath = user ? `/${user.role}` : '/login'

  return (
    <div className="min-h-screen flex items-center justify-center p-4 relative z-10">
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center max-w-md"
      >
        <motion.div
          animate={{ y: [0, -15, 0] }}
          transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
          className="text-8xl mb-6"
        >
          🎓
        </motion.div>
        <h1 className="text-6xl font-black text-white mb-2">404</h1>
        <p className="text-xl font-semibold text-slate-200 mb-2">Page Not Found</p>
        <p className="text-slate-400 mb-8">
          Looks like this page took a placement elsewhere! Let's get you back on track.
        </p>
        <div className="flex gap-3 justify-center">
          <motion.button
            whileTap={{ scale: 0.97 }}
            onClick={() => navigate(-1)}
            className="px-4 py-2 rounded-xl font-semibold bg-white/10 border border-white/20 text-white hover:bg-white/20 text-sm"
          >
            ← Go Back
          </motion.button>
          <motion.button
            whileTap={{ scale: 0.97 }}
            onClick={() => navigate(dashboardPath)}
            className="px-4 py-2 rounded-xl font-semibold bg-gradient-to-r from-cyan-500 to-blue-600 text-white text-sm"
          >
            Go to Dashboard
          </motion.button>
        </div>
      </motion.div>
    </div>
  )
}
