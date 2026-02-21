import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { studentAPI } from '../../services/api'
import { formatDate, getStatusColor, getStatusIcon, formatSalaryRange } from '../../utils/helpers'
import toast from 'react-hot-toast'
import { ChevronDown, MapPin, Calendar } from 'lucide-react'
import { useTheme } from '../../context/ThemeContext'

const STATUS_STEPS = ['Applied', 'Shortlisted', 'Aptitude', 'Interview', 'HR Round', 'Selected']

export default function ApplicationTracker({ compact = false }) {
  const { isDark } = useTheme()
  const [applications, setApplications] = useState([])
  const [loading, setLoading] = useState(true)
  const [expanded, setExpanded] = useState(null)
  const [filter, setFilter] = useState('all')

  useEffect(() => {
    loadApplications()
  }, [])

  const loadApplications = async () => {
    try {
      const { data } = await studentAPI.getApplications({ limit: compact ? 5 : 50 })
      if (data.success) setApplications(data.applications)
    } catch {
      toast.error('Failed to load applications')
    } finally {
      setLoading(false)
    }
  }

  const statusFilters = ['all', 'Applied', 'Interview', 'Selected', 'Rejected']
  const filtered = filter === 'all' ? applications : applications.filter((a) => a.status === filter)

  const getStepIndex = (status) => {
    const idx = STATUS_STEPS.indexOf(status)
    return idx === -1 ? (status === 'Rejected' ? -1 : 0) : idx
  }

  if (loading) {
    return (
      <div className="space-y-3">
        {[...Array(3)].map((_, i) => (
          <div key={i} className={`rounded-2xl p-4 border animate-pulse ${isDark ? 'bg-slate-900/70 border-white/10' : 'bg-white border-slate-100'}`}>
            <div className="flex gap-3">
              <div className={`w-10 h-10 rounded-xl ${isDark ? 'bg-white/5' : 'bg-slate-100'}`} />
              <div className="flex-1 space-y-2">
                <div className={`h-4 rounded w-3/4 ${isDark ? 'bg-white/5' : 'bg-slate-100'}`} />
                <div className={`h-3 rounded w-1/2 ${isDark ? 'bg-white/5' : 'bg-slate-100'}`} />
              </div>
            </div>
          </div>
        ))}
      </div>
    )
  }

  return (
    <div>
      {!compact && (
        <div className="flex gap-2 mb-4 overflow-x-auto pb-1 scrollbar-thin">
          {statusFilters.map((s) => (
            <button
              key={s}
              onClick={() => setFilter(s)}
              className={`flex-shrink-0 text-xs px-3 py-1.5 rounded-full font-medium transition-colors ${filter === s
                  ? 'bg-indigo-500 text-white'
                  : isDark ? 'bg-white/10 text-slate-300 hover:bg-white/20' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
            >
              {s === 'all' ? 'All' : s}
              {s !== 'all' && (
                <span className="ml-1 text-xs opacity-70">
                  ({applications.filter((a) => a.status === s).length})
                </span>
              )}
            </button>
          ))}
        </div>
      )}

      {filtered.length === 0 ? (
        <div className="text-center py-8">
          <div className="text-4xl mb-3">📋</div>
          <p className="text-gray-500 font-medium">No applications yet</p>
          <p className="text-gray-400 text-sm mt-1">Start applying to eligible drives</p>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((app, i) => {
            const drive = app.driveId
            if (!drive) return null
            const stepIdx = getStepIndex(app.status)
            const isRejected = app.status === 'Rejected'

            return (
              <motion.div
                key={app._id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
                className={`backdrop-blur-xl rounded-2xl border overflow-hidden transition-all duration-300 ${isDark ? 'bg-slate-900/70 border-white/10' : 'bg-white border-slate-200'}`}
              >
                <div
                  className={`p-4 cursor-pointer transition-colors ${isDark ? 'hover:bg-white/5' : 'hover:bg-slate-50'}`}
                  onClick={() => setExpanded(expanded === app._id ? null : app._id)}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-start gap-3">
                      <div className="w-10 h-10 bg-gradient-to-br from-indigo-100 to-purple-100 rounded-xl flex items-center justify-center text-lg font-bold text-indigo-600 flex-shrink-0">
                        {drive.company?.[0] || '?'}
                      </div>
                      <div>
                        <p className={`font-semibold text-sm ${isDark ? 'text-white' : 'text-slate-900'}`}>{drive.title || 'Unknown Role'}</p>
                        <p className="text-indigo-600 text-sm font-medium">{drive.company}</p>
                        <p className={`text-xs mt-0.5 ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>Applied {formatDate(app.appliedDate)}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className={`text-xs px-2.5 py-1 rounded-full font-semibold border ${getStatusColor(app.status)}`}>
                        {getStatusIcon(app.status)} {app.status}
                      </span>
                      <motion.div animate={{ rotate: expanded === app._id ? 180 : 0 }}>
                        <ChevronDown className="w-4 h-4 text-gray-400" />
                      </motion.div>
                    </div>
                  </div>

                  {!isRejected && !compact && (
                    <div className="mt-3 flex items-center gap-0">
                      {STATUS_STEPS.map((step, idx) => (
                        <div key={step} className="flex items-center flex-1">
                          <div className={`w-full h-1 rounded-full transition-all ${idx <= stepIdx ? 'bg-indigo-500' : isDark ? 'bg-white/10' : 'bg-slate-100'}`} />
                          {idx === STATUS_STEPS.length - 1 && (
                            <div className={`w-2.5 h-2.5 rounded-full flex-shrink-0 ${idx <= stepIdx ? 'bg-indigo-500' : isDark ? 'bg-white/10' : 'bg-slate-200'}`} />
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <AnimatePresence>
                  {expanded === app._id && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      className="overflow-hidden"
                    >
                      <div className={`px-4 pb-4 border-t pt-3 space-y-3 ${isDark ? 'border-white/10' : 'border-slate-100'}`}>
                        <div className="grid grid-cols-2 gap-3 text-sm">
                          <div className={`rounded-xl p-3 ${isDark ? 'bg-white/5' : 'bg-slate-50'}`}>
                            <p className={`text-xs mb-1 ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>Package</p>
                            <p className={`font-semibold ${isDark ? 'text-slate-100' : 'text-slate-800'}`}>{formatSalaryRange(drive.salaryMin, drive.salaryMax)}</p>
                          </div>
                          <div className={`rounded-xl p-3 ${isDark ? 'bg-white/5' : 'bg-slate-50'}`}>
                            <p className={`text-xs mb-1 ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>Location</p>
                            <p className={`font-semibold ${isDark ? 'text-slate-100' : 'text-slate-800'}`}>{drive.location || 'TBD'}</p>
                          </div>
                        </div>

                        {app.interviewSchedule?.date && (
                          <div className="bg-blue-50 border border-blue-200 rounded-xl p-3">
                            <p className="text-xs font-semibold text-blue-700 mb-1">📅 Interview Scheduled</p>
                            <p className="text-sm text-blue-800">
                              {formatDate(app.interviewSchedule.date)} at {app.interviewSchedule.time}
                            </p>
                            {app.interviewSchedule.venue && <p className="text-xs text-blue-600 mt-0.5">📍 {app.interviewSchedule.venue}</p>}
                          </div>
                        )}

                        {app.feedback && (
                          <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-3">
                            <p className="text-xs font-semibold text-yellow-700 mb-1">💬 Feedback</p>
                            <p className="text-sm text-yellow-800">{app.feedback}</p>
                          </div>
                        )}

                        {app.status === 'Selected' && (
                          <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-3 text-center">
                            <p className="text-2xl mb-1">🎉</p>
                            <p className="text-sm font-bold text-emerald-700">Congratulations! You're Selected!</p>
                          </div>
                        )}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            )
          })}
        </div>
      )}
    </div>
  )
}
