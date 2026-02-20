import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { tpoAPI } from '../../services/api'
import toast from 'react-hot-toast'
import { Search, ChevronDown, Mail, GraduationCap } from 'lucide-react'

export default function EligibleStudents({ driveId, driveName }) {
  const [students, setStudents] = useState([])
  const [filtered, setFiltered] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [selected, setSelected] = useState([])
  const [notifying, setNotifying] = useState(false)
  const [statusUpdate, setStatusUpdate] = useState({ applicationId: '', status: '', feedback: '' })

  useEffect(() => {
    if (driveId) loadStudents()
  }, [driveId])

  useEffect(() => {
    if (search) {
      setFiltered(students.filter((s) =>
        s.name?.toLowerCase().includes(search.toLowerCase()) ||
        s.regNumber?.toLowerCase().includes(search.toLowerCase()) ||
        s.branch?.toLowerCase().includes(search.toLowerCase())
      ))
    } else {
      setFiltered(students)
    }
  }, [search, students])

  const loadStudents = async () => {
    try {
      const { data } = await tpoAPI.getEligibleStudents(driveId)
      if (data.success) {
        setStudents(data.students)
        setFiltered(data.students)
      }
    } catch {
      toast.error('Failed to load eligible students')
    } finally {
      setLoading(false)
    }
  }

  const handleNotifySelected = async () => {
    if (selected.length === 0) return toast.error('Select students to notify')
    setNotifying(true)
    try {
      const { data } = await tpoAPI.notifyStudents({
        userIds: selected,
        title: `Drive Reminder: ${driveName}`,
        message: `Don't forget to apply for ${driveName}! Deadline is approaching.`,
        type: 'drive',
      })
      if (data.success) {
        toast.success(`${selected.length} students notified!`)
        setSelected([])
      }
    } catch {
      toast.error('Failed to send notifications')
    } finally {
      setNotifying(false)
    }
  }

  const getCGPAColor = (cgpa) => {
    if (cgpa >= 9) return 'text-emerald-600 bg-emerald-50'
    if (cgpa >= 7.5) return 'text-indigo-600 bg-indigo-50'
    return 'text-amber-600 bg-amber-50'
  }

  if (loading) {
    return (
      <div className="space-y-3">
        {[...Array(5)].map((_, i) => (
          <div key={i} className="bg-white rounded-2xl p-4 border border-gray-100 animate-pulse">
            <div className="flex gap-3">
              <div className="w-10 h-10 bg-gray-200 rounded-full" />
              <div className="flex-1 space-y-2">
                <div className="h-4 bg-gray-200 rounded w-1/3" />
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
      <div className="flex flex-wrap gap-3 mb-4">
        <div className="relative flex-1 min-w-48">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search students..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2.5 bg-white border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/40 transition-all"
          />
        </div>
        {selected.length > 0 && (
          <motion.button
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            onClick={handleNotifySelected}
            disabled={notifying}
            className="flex items-center gap-2 bg-indigo-50 text-indigo-700 border border-indigo-200 px-4 py-2.5 rounded-xl text-sm font-medium hover:bg-indigo-100 transition-colors"
          >
            <Mail className="w-4 h-4" />
            Notify {selected.length} Selected
          </motion.button>
        )}
      </div>

      <div className="text-sm text-gray-500 mb-3 flex items-center gap-1">
        <GraduationCap className="w-4 h-4" />
        {filtered.length} eligible students
      </div>

      <div className="space-y-2">
        {filtered.map((student, i) => (
          <motion.div
            key={student._id || i}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.03 }}
            className="bg-white rounded-xl border border-gray-100 p-3 hover:shadow-sm transition-shadow"
          >
            <div className="flex items-center gap-3">
              <input
                type="checkbox"
                checked={selected.includes(student.userId?.toString())}
                onChange={(e) => {
                  const userId = student.userId?.toString()
                  setSelected((prev) => e.target.checked ? [...prev, userId] : prev.filter((id) => id !== userId))
                }}
                className="w-4 h-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
              />
              <div className="w-9 h-9 bg-gradient-to-br from-indigo-100 to-purple-100 rounded-full flex items-center justify-center text-indigo-600 font-bold text-sm flex-shrink-0">
                {student.name?.[0] || '?'}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <p className="font-medium text-gray-900 text-sm">{student.name}</p>
                  <span className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full">{student.regNumber}</span>
                  <span className="text-xs bg-indigo-50 text-indigo-600 px-2 py-0.5 rounded-full">{student.branch}</span>
                </div>
                <div className="flex items-center gap-3 mt-0.5">
                  <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${getCGPAColor(student.cgpa)}`}>
                    CGPA: {student.cgpa}
                  </span>
                  <span className="text-xs text-gray-500">Backlogs: {student.backlogs || 0}</span>
                  {student.hasApplied && (
                    <span className="text-xs bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded-full font-medium">Applied ✓</span>
                  )}
                </div>
              </div>
              {student.skills?.length > 0 && (
                <div className="hidden md:flex gap-1 flex-shrink-0">
                  {student.skills.slice(0, 2).map((s) => (
                    <span key={s} className="text-xs bg-gray-50 text-gray-600 px-2 py-0.5 rounded-full border border-gray-100">{s}</span>
                  ))}
                  {student.skills.length > 2 && <span className="text-xs text-gray-400">+{student.skills.length - 2}</span>}
                </div>
              )}
            </div>
          </motion.div>
        ))}

        {filtered.length === 0 && (
          <div className="text-center py-8">
            <div className="text-3xl mb-2">🔍</div>
            <p className="text-gray-500 text-sm">No eligible students found</p>
          </div>
        )}
      </div>
    </div>
  )
}
