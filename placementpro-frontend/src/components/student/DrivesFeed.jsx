import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { studentAPI } from '../../services/api'
import { formatDate, formatSalaryRange, daysUntil, getBranchColor } from '../../utils/helpers'
import toast from 'react-hot-toast'
import { Search, MapPin, Calendar, TrendingUp, CheckCircle, Clock, Filter } from 'lucide-react'

export default function DrivesFeed({ compact = false }) {
  const [drives, setDrives] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [applying, setApplying] = useState(null)
  const [selected, setSelected] = useState(null)

  useEffect(() => {
    loadDrives()
  }, [search])

  const loadDrives = async () => {
    try {
      setLoading(true)
      const { data } = await studentAPI.getEligibleDrives({ search, limit: compact ? 5 : 20 })
      if (data.success) setDrives(data.drives)
    } catch {
      toast.error('Failed to load drives')
    } finally {
      setLoading(false)
    }
  }

  const handleApply = async (driveId) => {
    setApplying(driveId)
    try {
      const { data } = await studentAPI.applyToDrive({ driveId })
      if (data.success) {
        toast.success('Application submitted! 🎉')
        setDrives((prev) => prev.map((d) => d._id === driveId ? { ...d, hasApplied: true } : d))
        setSelected(null)
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to apply')
    } finally {
      setApplying(null)
    }
  }

  const getWorkModeColor = (mode) => {
    const colors = { Remote: 'bg-green-100 text-green-700', Hybrid: 'bg-blue-100 text-blue-700', 'On-site': 'bg-orange-100 text-orange-700' }
    return colors[mode] || 'bg-gray-100 text-gray-700'
  }

  if (loading) {
    return (
      <div className="space-y-3">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="bg-white rounded-2xl p-5 border border-gray-100 animate-pulse">
            <div className="flex items-start gap-3">
              <div className="w-12 h-12 bg-gray-200 rounded-xl" />
              <div className="flex-1 space-y-2">
                <div className="h-4 bg-gray-200 rounded w-3/4" />
                <div className="h-3 bg-gray-200 rounded w-1/2" />
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
        <div className="mb-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search companies, roles..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="input-field pl-9 py-2.5 text-sm"
            />
          </div>
        </div>
      )}

      {drives.length === 0 ? (
        <div className="text-center py-10">
          <div className="text-4xl mb-3">🔍</div>
          <p className="text-gray-500 font-medium">No eligible drives found</p>
          <p className="text-gray-400 text-sm mt-1">Check back later or update your profile</p>
        </div>
      ) : (
        <div className="space-y-3">
          <AnimatePresence>
            {drives.map((drive, i) => (
              <motion.div
                key={drive._id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
                className={`bg-white rounded-2xl border border-gray-100 overflow-hidden hover:shadow-md transition-all ${drive.hasApplied ? 'border-emerald-200 bg-emerald-50/30' : ''}`}
              >
                <div
                  className="p-4 cursor-pointer"
                  onClick={() => setSelected(selected?._id === drive._id ? null : drive)}
                >
                  <div className="flex items-start gap-3">
                    <div className="w-12 h-12 bg-gradient-to-br from-indigo-100 to-purple-100 rounded-xl flex items-center justify-center text-xl font-bold text-indigo-600 flex-shrink-0">
                      {drive.company[0]}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <h4 className="font-semibold text-gray-900 text-sm leading-tight">{drive.title}</h4>
                          <p className="text-indigo-600 font-medium text-sm">{drive.company}</p>
                        </div>
                        {drive.hasApplied ? (
                          <span className="flex items-center gap-1 text-xs bg-emerald-100 text-emerald-700 px-2.5 py-1 rounded-full font-medium flex-shrink-0">
                            <CheckCircle className="w-3 h-3" /> Applied
                          </span>
                        ) : (
                          <span className="text-xs text-red-500 font-medium flex items-center gap-1 flex-shrink-0">
                            <Clock className="w-3 h-3" />{daysUntil(drive.deadline)}
                          </span>
                        )}
                      </div>
                      <div className="flex flex-wrap gap-1.5 mt-2">
                        {drive.eligibleBranches.slice(0, 3).map((b) => (
                          <span key={b} className={`text-xs px-2 py-0.5 rounded-full font-medium ${getBranchColor(b)}`}>{b}</span>
                        ))}
                        {drive.eligibleBranches.length > 3 && (
                          <span className="text-xs text-gray-500">+{drive.eligibleBranches.length - 3} more</span>
                        )}
                        <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${getWorkModeColor(drive.workMode)}`}>{drive.workMode}</span>
                      </div>
                      <div className="flex items-center gap-3 mt-2 text-xs text-gray-500">
                        <span className="flex items-center gap-1"><TrendingUp className="w-3 h-3" />{formatSalaryRange(drive.salaryMin, drive.salaryMax)}</span>
                        <span className="flex items-center gap-1"><MapPin className="w-3 h-3" />{drive.location || 'TBD'}</span>
                        <span className="flex items-center gap-1"><Calendar className="w-3 h-3" />{formatDate(drive.driveDate)}</span>
                      </div>
                    </div>
                  </div>
                </div>

                <AnimatePresence>
                  {selected?._id === drive._id && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      className="overflow-hidden"
                    >
                      <div className="px-4 pb-4 border-t border-gray-100 pt-3">
                        <p className="text-sm text-gray-600 mb-3">{drive.description}</p>
                        <div className="grid grid-cols-2 gap-3 text-sm mb-3">
                          <div className="bg-gray-50 rounded-xl p-3">
                            <p className="text-xs text-gray-500 mb-1">Min CGPA Required</p>
                            <p className="font-bold text-indigo-600">{drive.minCGPA}</p>
                          </div>
                          <div className="bg-gray-50 rounded-xl p-3">
                            <p className="text-xs text-gray-500 mb-1">Max Backlogs</p>
                            <p className="font-bold text-indigo-600">{drive.maxBacklogs}</p>
                          </div>
                        </div>
                        {drive.requirements?.length > 0 && (
                          <div className="mb-3">
                            <p className="text-xs font-semibold text-gray-700 mb-1.5">Requirements</p>
                            <div className="flex flex-wrap gap-1.5">
                              {drive.requirements.map((r) => (
                                <span key={r} className="text-xs bg-indigo-50 text-indigo-700 px-2.5 py-1 rounded-full">{r}</span>
                              ))}
                            </div>
                          </div>
                        )}
                        {!drive.hasApplied && (
                          <motion.button
                            whileTap={{ scale: 0.97 }}
                            onClick={() => handleApply(drive._id)}
                            disabled={applying === drive._id}
                            className="btn-primary w-full text-sm py-2.5 disabled:opacity-60 flex items-center justify-center gap-2"
                          >
                            {applying === drive._id ? (
                              <motion.div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full" animate={{ rotate: 360 }} transition={{ duration: 0.8, repeat: Infinity }} />
                            ) : 'Apply Now →'}
                          </motion.button>
                        )}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}
    </div>
  )
}
