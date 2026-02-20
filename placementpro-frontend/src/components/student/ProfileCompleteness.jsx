import { motion } from 'framer-motion'

const checklist = [
  { key: 'name', label: 'Full Name', weight: 10 },
  { key: 'regNumber', label: 'Registration Number', weight: 10 },
  { key: 'phone', label: 'Phone Number', weight: 5 },
  { key: 'skills', label: 'Skills Added', weight: 15 },
  { key: 'projects', label: 'Projects Added', weight: 20 },
  { key: 'resumeUrl', label: 'Resume Generated', weight: 20 },
  { key: 'cgpa', label: 'CGPA Set', weight: 10 },
  { key: 'linkedin', label: 'LinkedIn Profile', weight: 5 },
  { key: 'github', label: 'GitHub Profile', weight: 5 },
]

export default function ProfileCompleteness({ profile }) {
  if (!profile) return null

  const score = profile.profileCompleteness || 0

  const getColor = () => {
    if (score >= 80) return { bar: 'from-emerald-400 to-emerald-600', text: 'text-emerald-600', bg: 'bg-emerald-50' }
    if (score >= 50) return { bar: 'from-amber-400 to-amber-600', text: 'text-amber-600', bg: 'bg-amber-50' }
    return { bar: 'from-red-400 to-red-600', text: 'text-red-600', bg: 'bg-red-50' }
  }

  const colors = getColor()

  const getStatus = (key) => {
    if (key === 'skills') return profile.skills?.length > 0
    if (key === 'projects') return profile.projects?.length > 0
    return !!profile[key]
  }

  return (
    <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-semibold text-gray-900">Profile Completeness</h3>
        <span className={`text-2xl font-bold ${colors.text}`}>{score}%</span>
      </div>

      <div className="relative h-3 bg-gray-100 rounded-full overflow-hidden mb-4">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${score}%` }}
          transition={{ duration: 1.2, ease: 'easeOut' }}
          className={`h-full bg-gradient-to-r ${colors.bar} rounded-full`}
        />
      </div>

      <p className={`text-xs font-medium mb-4 ${colors.text}`}>
        {score >= 80 ? '🌟 Excellent! Recruiters can find you easily.' : score >= 50 ? '⚡ Good progress! Complete more to stand out.' : '🚀 Get started! Complete your profile now.'}
      </p>

      <div className="space-y-2">
        {checklist.map((item) => {
          const done = getStatus(item.key)
          return (
            <div key={item.key} className="flex items-center gap-2 text-sm">
              <span className={`w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 text-xs ${done ? 'bg-emerald-100 text-emerald-600' : 'bg-gray-100 text-gray-400'}`}>
                {done ? '✓' : '○'}
              </span>
              <span className={done ? 'text-gray-700' : 'text-gray-400'}>{item.label}</span>
              <span className={`ml-auto text-xs ${done ? 'text-emerald-500' : 'text-gray-300'}`}>+{item.weight}%</span>
            </div>
          )
        })}
      </div>
    </div>
  )
}
