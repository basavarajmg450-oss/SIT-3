import { motion } from 'framer-motion'
import { cardHover } from '../../utils/animations'

export default function Card({ children, className = '', hover = false, onClick, gradient }) {
  const Component = hover || onClick ? motion.div : 'div'
  const motionProps = hover || onClick ? { ...cardHover, onClick } : { onClick }

  return (
    <Component
      className={`bg-slate-900/70 backdrop-blur-xl rounded-2xl shadow-lg border border-white/10 ${hover || onClick ? 'cursor-pointer' : ''} ${gradient ? 'overflow-hidden' : ''} ${className}`}
      {...motionProps}
    >
      {gradient && (
        <div className={`h-1 bg-gradient-to-r ${gradient}`} />
      )}
      {children}
    </Component>
  )
}

export function StatCard({ icon, label, value, change, color = 'indigo', gradient: gradientColors }) {
  const colorMap = {
    indigo: 'from-indigo-500 to-indigo-600',
    purple: 'from-purple-500 to-purple-600',
    emerald: 'from-emerald-500 to-emerald-600',
    amber: 'from-amber-500 to-amber-600',
    red: 'from-red-500 to-red-600',
    blue: 'from-blue-500 to-blue-600',
  }

  return (
    <motion.div
      className="bg-slate-900/70 backdrop-blur-xl rounded-2xl p-6 shadow-lg border border-white/10"
      whileHover={{ y: -3, transition: { duration: 0.2 } }}
    >
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm font-medium text-slate-400 mb-1">{label}</p>
          <p className="text-3xl font-bold text-white">{value}</p>
          {change !== undefined && (
            <p className={`text-xs font-medium mt-1 ${change >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
              {change >= 0 ? '↑' : '↓'} {Math.abs(change)}% from last month
            </p>
          )}
        </div>
        <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${gradientColors || colorMap[color]} flex items-center justify-center text-white text-xl shadow-lg`}>
          {icon}
        </div>
      </div>
    </motion.div>
  )
}
