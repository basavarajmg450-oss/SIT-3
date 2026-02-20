import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { studentAPI } from '../../services/api'
import toast from 'react-hot-toast'
import { Target, CheckCircle, XCircle, ExternalLink } from 'lucide-react'

export default function SkillGapAnalysis() {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadSkillGap()
  }, [])

  const loadSkillGap = async () => {
    try {
      const { data: res } = await studentAPI.getSkillGap()
      if (res.success) setData(res)
    } catch {
      toast.error('Failed to load skill gap analysis')
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="bg-white rounded-2xl p-6 border border-gray-100 animate-pulse">
        <div className="h-5 bg-gray-200 rounded w-1/3 mb-4" />
        <div className="space-y-3">
          {[...Array(5)].map((_, i) => <div key={i} className="h-8 bg-gray-100 rounded-xl" />)}
        </div>
      </div>
    )
  }

  if (!data) return null

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-2xl p-6 border border-gray-100">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Target className="w-5 h-5 text-indigo-600" />
            <h3 className="font-semibold text-gray-900">Skill Gap Analysis</h3>
          </div>
          <div className="text-right">
            <span className="text-2xl font-bold text-indigo-600">{data.gap.score}%</span>
            <p className="text-xs text-gray-500">match rate</p>
          </div>
        </div>

        <div className="h-2.5 bg-gray-100 rounded-full overflow-hidden mb-6">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${data.gap.score}%` }}
            transition={{ duration: 1.2, ease: 'easeOut' }}
            className={`h-full rounded-full ${data.gap.score >= 70 ? 'bg-emerald-500' : data.gap.score >= 40 ? 'bg-amber-500' : 'bg-red-500'}`}
          />
        </div>

        <div className="grid grid-cols-2 gap-4 mb-6">
          <div className="bg-emerald-50 border border-emerald-100 rounded-xl p-4">
            <div className="flex items-center gap-2 mb-2">
              <CheckCircle className="w-4 h-4 text-emerald-600" />
              <p className="text-sm font-semibold text-emerald-700">Matched Skills</p>
            </div>
            <div className="flex flex-wrap gap-1.5">
              {data.gap.matched.length > 0 ? data.gap.matched.map((skill) => (
                <span key={skill} className="text-xs bg-emerald-100 text-emerald-700 px-2.5 py-1 rounded-full font-medium">{skill}</span>
              )) : (
                <p className="text-xs text-emerald-600">None matched yet</p>
              )}
            </div>
          </div>
          <div className="bg-red-50 border border-red-100 rounded-xl p-4">
            <div className="flex items-center gap-2 mb-2">
              <XCircle className="w-4 h-4 text-red-500" />
              <p className="text-sm font-semibold text-red-700">Missing Skills</p>
            </div>
            <div className="flex flex-wrap gap-1.5">
              {data.gap.missing.length > 0 ? data.gap.missing.map((skill) => (
                <span key={skill} className="text-xs bg-red-100 text-red-700 px-2.5 py-1 rounded-full font-medium">{skill}</span>
              )) : (
                <p className="text-xs text-red-500">None! Great job!</p>
              )}
            </div>
          </div>
        </div>

        <div>
          <p className="text-sm font-semibold text-gray-800 mb-2">🔥 Top Market Skills</p>
          <div className="flex flex-wrap gap-1.5">
            {data.topMarketSkills.map((skill) => {
              const hasIt = data.studentSkills.some((s) => s.toLowerCase().includes(skill.toLowerCase()))
              return (
                <span
                  key={skill}
                  className={`text-xs px-2.5 py-1 rounded-full font-medium ${hasIt ? 'bg-indigo-100 text-indigo-700' : 'bg-gray-100 text-gray-500'}`}
                >
                  {skill} {hasIt && '✓'}
                </span>
              )
            })}
          </div>
        </div>
      </div>

      {data.recommendations?.length > 0 && (
        <div className="bg-white rounded-2xl p-5 border border-gray-100">
          <h3 className="font-semibold text-gray-900 mb-4">📚 Learning Recommendations</h3>
          <div className="space-y-3">
            {data.recommendations.map((rec) => (
              <motion.div
                key={rec.skill}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                className="border border-gray-100 rounded-xl p-3"
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="font-medium text-gray-800 text-sm capitalize">{rec.skill}</span>
                  <span className="text-xs bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full font-medium">Recommended</span>
                </div>
                <div className="flex flex-wrap gap-2">
                  {rec.resources.map((r) => (
                    <a
                      key={r.name}
                      href={r.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-1 text-xs text-indigo-600 hover:text-indigo-700 bg-indigo-50 px-2.5 py-1 rounded-lg transition-colors"
                    >
                      <ExternalLink className="w-3 h-3" />
                      {r.name}
                    </a>
                  ))}
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
