import { motion } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export default function NotFound() {
  const navigate = useNavigate()
  const { user } = useAuth()

  const dashboardPath = user ? `/${user.role}` : '/login'

  return (
    <div className="min-h-screen bg-mesh flex items-center justify-center p-4">
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
        <h1 className="text-6xl font-black text-gray-900 mb-2">404</h1>
        <p className="text-xl font-semibold text-gray-700 mb-2">Page Not Found</p>
        <p className="text-gray-500 mb-8">
          Looks like this page took a placement elsewhere! Let's get you back on track.
        </p>
        <div className="flex gap-3 justify-center">
          <motion.button
            whileTap={{ scale: 0.97 }}
            onClick={() => navigate(-1)}
            className="btn-secondary text-sm"
          >
            ← Go Back
          </motion.button>
          <motion.button
            whileTap={{ scale: 0.97 }}
            onClick={() => navigate(dashboardPath)}
            className="btn-primary text-sm"
          >
            Go to Dashboard
          </motion.button>
        </div>
      </motion.div>
    </div>
  )
}
