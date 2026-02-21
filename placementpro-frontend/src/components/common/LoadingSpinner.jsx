import { motion } from 'framer-motion'
import { useTheme } from '../../context/ThemeContext'

export default function LoadingSpinner({ size = 'md', text = '', fullScreen = false }) {
  const { isDark } = useTheme()
  const sizes = { sm: 'w-5 h-5', md: 'w-10 h-10', lg: 'w-16 h-16' }

  const spinner = (
    <div className="flex flex-col items-center justify-center gap-3">
      <motion.div
        className={`${sizes[size]} border-4 border-indigo-200 border-t-indigo-500 rounded-full`}
        animate={{ rotate: 360 }}
        transition={{ duration: 0.8, repeat: Infinity, ease: 'linear' }}
      />
      {text && <p className={`text-sm font-medium ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>{text}</p>}
    </div>
  )

  if (fullScreen) {
    return (
      <div className={`fixed inset-0 backdrop-blur-sm z-50 flex items-center justify-center transition-colors duration-300 ${isDark ? 'bg-slate-900/80' : 'bg-white/80'
        }`}>
        <div className="text-center">
          <div className="text-4xl mb-4">🎓</div>
          {spinner}
          {!text && <p className={`text-sm mt-2 font-medium ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>Loading PlacementPro...</p>}
        </div>
      </div>
    )
  }

  return spinner
}
