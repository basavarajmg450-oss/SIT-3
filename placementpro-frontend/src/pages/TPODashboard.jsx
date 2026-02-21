import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Routes, Route, useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { tpoAPI } from '../services/api'
import Navbar from '../components/common/Navbar'
import Sidebar from '../components/common/Sidebar'
import { StatCard } from '../components/common/Card'
import { useTheme } from '../context/ThemeContext'
import CreateDrive from '../components/tpo/CreateDrive'
import AnalyticsDashboard from '../components/tpo/AnalyticsDashboard'
import EligibleStudents from '../components/tpo/EligibleStudents'
import InterviewCalendar from '../components/tpo/InterviewCalendar'
import toast from 'react-hot-toast'
import { formatDate, getStatusColor, formatSalaryRange } from '../utils/helpers'
import { Plus, Download, RefreshCw, ChevronDown, BarChart3, GraduationCap, FileText, Zap } from 'lucide-react'

const quickActions = [
  { label: 'Create Drive', icon: Plus, path: '/tpo/drives?create=1', color: 'indigo', gradient: 'from-indigo-500 to-purple-500' },
  { label: 'View Analytics', icon: BarChart3, path: '/tpo/analytics', color: 'purple', gradient: 'from-purple-500 to-pink-500' },
  { label: 'View Students', icon: GraduationCap, path: '/tpo/students', color: 'blue', gradient: 'from-blue-500 to-cyan-500' },
  { label: 'Export Report', icon: Download, type: 'export', color: 'emerald', gradient: 'from-emerald-500 to-teal-500' },
]

function Home() {
  const navigate = useNavigate()
  const { isDark } = useTheme()
  const [stats, setStats] = useState({ totalDrives: 0, activeDrives: 0, totalApplications: 0, placedStudents: 0 })
  const [recentDrives, setRecentDrives] = useState([])
  const [exporting, setExporting] = useState(false)

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    try {
      const [analyticsRes, drivesRes] = await Promise.all([
        tpoAPI.getAnalytics(),
        tpoAPI.getDrives({ limit: 5 }),
      ])
      if (analyticsRes.data.success) setStats(analyticsRes.data.stats)
      if (drivesRes.data.success) setRecentDrives(drivesRes.data.drives)
    } catch { }
  }

  const handleExport = async () => {
    setExporting(true)
    try {
      const { data } = await tpoAPI.exportReport()
      const payload = { success: data.success, data: data.data, total: data.total, generatedAt: data.generatedAt }
      const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `placement_report_${Date.now()}.json`
      a.click()
      URL.revokeObjectURL(url)
      toast.success('Report exported!')
    } catch {
      toast.error('Export failed')
    } finally {
      setExporting(false)
    }
  }

  const handleQuickAction = (action) => {
    if (action.type === 'export') {
      handleExport()
    } else {
      navigate(action.path)
    }
  }

  return (
    <motion.div
      className="space-y-6"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.4 }}
    >
      <div className="flex items-start justify-between">
        <div>
          <motion.h1
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className={`text-2xl font-bold transition-colors duration-300 ${isDark ? 'text-white' : 'text-slate-900'}`}
          >
            TPO Dashboard 👨‍💼
          </motion.h1>
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.1 }}
            className={`${isDark ? 'text-slate-400' : 'text-slate-500'} text-sm mt-0.5`}
          >
            Manage drives, students, and placements
          </motion.p>
        </div>
        <motion.button
          whileHover={{ scale: 1.03 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => navigate('/tpo/drives?create=1')}
          className="btn-primary text-sm flex items-center gap-2 shadow-lg shadow-indigo-500/25"
        >
          <Plus className="w-4 h-4" /> New Drive
        </motion.button>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { icon: '💼', label: 'Total Drives', value: stats.totalDrives, color: 'indigo' },
          { icon: '✅', label: 'Active Drives', value: stats.activeDrives, color: 'emerald' },
          { icon: '🎓', label: 'Placed Students', value: stats.placedStudents, color: 'purple' },
          { icon: '📋', label: 'Applications', value: stats.totalApplications, color: 'amber' },
        ].map((s, i) => (
          <motion.div
            key={s.label}
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 + i * 0.08, type: 'spring', stiffness: 120, damping: 18 }}
            whileHover={{ y: -6, transition: { duration: 0.2 } }}
          >
            <StatCard {...s} />
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <motion.div
          className="lg:col-span-2"
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.3, duration: 0.4 }}
        >
          <div className={`backdrop-blur-xl rounded-2xl p-5 border shadow-sm transition-all duration-300 ${isDark ? 'bg-slate-900/70 border-white/10 hover:shadow-cyan-500/5' : 'bg-white border-slate-200 hover:shadow-md'
            }`}>
            <div className="flex items-center justify-between mb-4">
              <h2 className={`font-semibold ${isDark ? 'text-white' : 'text-slate-800'}`}>Recent Drives</h2>
              <motion.button
                whileHover={{ rotate: 180 }}
                transition={{ duration: 0.4 }}
                onClick={loadData}
                className="text-slate-400 hover:text-cyan-400 transition-colors p-1 rounded-lg"
              >
                <RefreshCw className="w-4 h-4" />
              </motion.button>
            </div>
            <div className="space-y-3">
              {recentDrives.map((drive, i) => (
                <motion.div
                  key={drive._id}
                  initial={{ opacity: 0, x: -12 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.35 + i * 0.05 }}
                  whileHover={{ x: 4, backgroundColor: isDark ? 'rgba(255,255,255,0.15)' : 'rgba(0,0,0,0.02)' }}
                  onClick={() => navigate(`/tpo/drives`)}
                  className={`flex items-center justify-between p-3 rounded-xl cursor-pointer border transition-all ${isDark ? 'bg-white/10 border-transparent hover:border-white/20' : 'bg-slate-50 border-slate-100 hover:border-slate-200'
                    }`}
                >
                  <div>
                    <p className={`font-medium text-sm ${isDark ? 'text-white' : 'text-slate-800'}`}>{drive.company}</p>
                    <p className={`text-xs ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>{drive.title}</p>
                    <p className={`text-xs mt-0.5 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>Deadline: {formatDate(drive.deadline)}</p>
                  </div>
                  <div className="text-right">
                    <span className={`text-xs px-2.5 py-1 rounded-full font-medium border ${getStatusColor(drive.status)}`}>{drive.status}</span>
                    <p className="text-xs text-slate-400 mt-1">{drive.applicationCount || 0} applied</p>
                  </div>
                </motion.div>
              ))}
              {recentDrives.length === 0 && (
                <motion.p
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.4 }}
                  className="text-center text-slate-400 text-sm py-6"
                >
                  No drives yet. Create your first drive!
                </motion.p>
              )}
            </div>
          </div>
        </motion.div>

        <motion.div
          className="space-y-4"
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.35, duration: 0.4 }}
        >
          <div className={`backdrop-blur-xl rounded-2xl p-5 border shadow-sm transition-all duration-300 ${isDark ? 'bg-slate-900/70 border-white/10' : 'bg-white border-slate-200'
            }`}>
            <div className="flex items-center gap-2 mb-4">
              <Zap className="w-5 h-5 text-amber-500" />
              <h2 className={`font-semibold ${isDark ? 'text-white' : 'text-slate-800'}`}>Quick Actions</h2>
            </div>
            <div className="space-y-2">
              {quickActions.map((action, i) => {
                const Icon = action.icon
                return (
                  <motion.button
                    key={action.label}
                    initial={{ opacity: 0, x: 16 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.4 + i * 0.06, type: 'spring', stiffness: 150 }}
                    whileHover={{ x: 6, scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => handleQuickAction(action)}
                    disabled={action.type === 'export' && exporting}
                    className={`w-full flex items-center gap-3 p-3 rounded-xl transition-all text-left group border border-transparent ${isDark ? 'hover:bg-white/10 hover:border-white/10' : 'hover:bg-slate-50 hover:border-slate-100'
                      }`}
                  >
                    <motion.div
                      className={`w-10 h-10 rounded-xl bg-gradient-to-br ${action.gradient} flex items-center justify-center text-white shadow-md`}
                      whileHover={{ scale: 1.1, rotate: 5 }}
                    >
                      <Icon className="w-5 h-5" />
                    </motion.div>
                    <span className={`text-sm font-medium transition-colors flex-1 ${isDark ? 'text-slate-200 group-hover:text-cyan-400' : 'text-slate-700 group-hover:text-indigo-600'
                      }`}>
                      {action.label}
                    </span>
                    {action.type === 'export' && exporting ? (
                      <motion.div
                        className="w-5 h-5 border-2 border-indigo-300 border-t-indigo-600 rounded-full"
                        animate={{ rotate: 360 }}
                        transition={{ duration: 0.8, repeat: Infinity, ease: 'linear' }}
                      />
                    ) : (
                      <motion.span
                        className="text-gray-300 group-hover:text-cyan-400"
                        initial={false}
                        whileHover={{ x: 4 }}
                      >
                        →
                      </motion.span>
                    )}
                  </motion.button>
                )
              })}
            </div>
          </div>
        </motion.div>
      </div>
    </motion.div>
  )
}

function ManageDrives() {
  const navigate = useNavigate()
  const location = useLocation()
  const { isDark } = useTheme()
  const openCreate = new URLSearchParams(location.search).get('create') === '1'
  const [drives, setDrives] = useState([])
  const [loading, setLoading] = useState(true)
  const [showCreate, setShowCreate] = useState(openCreate)
  const [selected, setSelected] = useState(null)

  useEffect(() => { loadDrives() }, [])
  useEffect(() => {
    if (openCreate) setShowCreate(true)
  }, [openCreate])

  const loadDrives = async () => {
    try {
      const { data } = await tpoAPI.getDrives({ limit: 50 })
      if (data.success) setDrives(data.drives)
    } catch { } finally { setLoading(false) }
  }

  const handleStatusUpdate = async (driveId, status) => {
    try {
      await tpoAPI.updateDrive(driveId, { status })
      toast.success(`Drive marked as ${status}`)
      loadDrives()
    } catch { toast.error('Update failed') }
  }

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <h1 className={`text-2xl font-bold transition-colors duration-300 ${isDark ? 'text-white' : 'text-slate-900'}`}>Manage Drives 💼</h1>
        <button onClick={() => setShowCreate(!showCreate)} className="btn-primary text-sm flex items-center gap-2">
          <Plus className="w-4 h-4" /> {showCreate ? 'Cancel' : 'Create Drive'}
        </button>
      </div>

      {showCreate && (
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className={`backdrop-blur-xl rounded-2xl p-5 border transition-all duration-300 ${isDark ? 'bg-slate-900/70 border-white/10' : 'bg-white border-slate-200 shadow-sm'
          }`}>
          <CreateDrive onSuccess={() => { setShowCreate(false); loadDrives() }} />
        </motion.div>
      )}

      {loading ? (
        <div className="space-y-3">{[...Array(3)].map((_, i) => <div key={i} className={`h-24 backdrop-blur-xl rounded-2xl border animate-pulse ${isDark ? 'bg-slate-900/70 border-white/10' : 'bg-white border-slate-200'
          }`} />)}</div>
      ) : (
        <div className="space-y-3">
          {drives.map((drive, i) => (
            <motion.div key={drive._id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }} className={`backdrop-blur-xl rounded-2xl border transition-all duration-300 ${isDark ? 'bg-slate-900/70 border-white/10' : 'bg-white border-slate-200 shadow-sm'
              } overflow-hidden`}>
              <div className={`p-4 cursor-pointer transition-colors ${isDark ? 'hover:bg-white/10' : 'hover:bg-slate-50'}`} onClick={() => setSelected(selected === drive._id ? null : drive._id)}>
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 bg-indigo-100 rounded-xl flex items-center justify-center text-indigo-600 font-bold">{drive.company[0]}</div>
                    <div>
                      <h3 className={`font-semibold text-sm ${isDark ? 'text-white' : 'text-slate-800'}`}>{drive.title}</h3>
                      <p className="text-indigo-600 text-sm font-medium">{drive.company}</p>
                      <div className={`flex gap-3 text-xs mt-0.5 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                        <span>CGPA ≥ {drive.minCGPA}</span>
                        <span>{drive.applicationCount} applied</span>
                        <span>Deadline: {formatDate(drive.deadline)}</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={`text-xs px-2.5 py-1 rounded-full font-medium border ${getStatusColor(drive.status)}`}>{drive.status}</span>
                    <motion.div animate={{ rotate: selected === drive._id ? 180 : 0 }}><ChevronDown className="w-4 h-4 text-slate-400" /></motion.div>
                  </div>
                </div>
              </div>
              {selected === drive._id && (
                <div className={`px-4 pb-4 border-t pt-3 space-y-3 ${isDark ? 'border-white/10' : 'border-slate-100'}`}>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-xs">
                    <div className={`rounded-lg p-2 ${isDark ? 'bg-white/10' : 'bg-slate-50'}`}><p className={isDark ? 'text-slate-400' : 'text-slate-500'}>Salary</p><p className={`font-semibold ${isDark ? 'text-slate-100' : 'text-slate-800'}`}>{formatSalaryRange(drive.salaryMin, drive.salaryMax)}</p></div>
                    <div className={`rounded-lg p-2 ${isDark ? 'bg-white/10' : 'bg-slate-50'}`}><p className={isDark ? 'text-slate-400' : 'text-slate-500'}>Branches</p><p className={`font-semibold ${isDark ? 'text-slate-100' : 'text-slate-800'}`}>{drive.eligibleBranches.join(', ')}</p></div>
                    <div className={`rounded-lg p-2 ${isDark ? 'bg-white/10' : 'bg-slate-50'}`}><p className={isDark ? 'text-slate-400' : 'text-slate-500'}>Max Backlogs</p><p className={`font-semibold ${isDark ? 'text-slate-100' : 'text-slate-800'}`}>{drive.maxBacklogs}</p></div>
                    <div className={`rounded-lg p-2 ${isDark ? 'bg-white/10' : 'bg-slate-50'}`}><p className={isDark ? 'text-slate-400' : 'text-slate-500'}>Selected</p><p className={`font-semibold ${isDark ? 'text-slate-100' : 'text-slate-800'}`}>{drive.selectedCount || 0}</p></div>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <button onClick={() => navigate(`/tpo/students?driveId=${drive._id}`)} className="text-xs bg-indigo-50 text-indigo-700 px-3 py-1.5 rounded-lg hover:bg-indigo-100 transition-colors font-medium">View Eligible Students</button>
                    {drive.status === 'Active' && <button onClick={() => handleStatusUpdate(drive._id, 'Closed')} className="text-xs bg-red-50 text-red-700 px-3 py-1.5 rounded-lg hover:bg-red-100 transition-colors font-medium">Close Drive</button>}
                    {drive.status === 'Closed' && <button onClick={() => handleStatusUpdate(drive._id, 'Completed')} className="text-xs bg-emerald-50 text-emerald-700 px-3 py-1.5 rounded-lg hover:bg-emerald-100 transition-colors font-medium">Mark Completed</button>}
                  </div>
                </div>
              )}
            </motion.div>
          ))}
          {drives.length === 0 && <div className="text-center py-10"><div className="text-4xl mb-3">💼</div><p className="text-slate-400">No drives created yet</p></div>}
        </div>
      )}
    </div>
  )
}

function StudentsPage() {
  const { isDark } = useTheme()
  const [driveId, setDriveId] = useState(new URLSearchParams(window.location.search).get('driveId') || '')
  const [drives, setDrives] = useState([])

  useEffect(() => {
    tpoAPI.getDrives({ limit: 50 }).then(({ data }) => { if (data.success) setDrives(data.drives) }).catch(() => { })
  }, [])

  return (
    <div className="space-y-4">
      <h1 className={`text-2xl font-bold transition-colors duration-300 ${isDark ? 'text-white' : 'text-slate-900'}`}>Students 🎓</h1>
      <div>
        <label className={`text-sm font-medium mb-1.5 block ${isDark ? 'text-slate-200' : 'text-slate-700'}`}>Select Drive</label>
        <select
          value={driveId}
          onChange={(e) => setDriveId(e.target.value)}
          className={`w-full max-w-xs px-3 py-2.5 rounded-xl text-sm outline-none focus:ring-2 focus:ring-indigo-500/40 transition-all border ${isDark ? 'bg-slate-800 border-white/10 text-white' : 'bg-white border-gray-200 text-slate-900'
            }`}
        >
          <option value="">Select a drive...</option>
          {drives.map((d) => <option key={d._id} value={d._id}>{d.company} - {d.title}</option>)}
        </select>
      </div>
      {driveId && <EligibleStudents driveId={driveId} driveName={drives.find((d) => d._id === driveId)?.title} />}
    </div>
  )
}

export default function TPODashboard() {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const { isDark } = useTheme()

  return (
    <div className="min-h-screen">
      <Navbar onMenuClick={() => setSidebarOpen(!sidebarOpen)} sidebarOpen={sidebarOpen} />
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <main className="lg:ml-64 pt-16">
        <div className="p-4 lg:p-6 max-w-6xl mx-auto">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/drives" element={<ManageDrives />} />
            <Route path="/students" element={<StudentsPage />} />
            <Route path="/analytics" element={<div><h1 className={`text-2xl font-bold mb-5 ${isDark ? 'text-white' : 'text-slate-900'}`}>Analytics 📊</h1><AnalyticsDashboard /></div>} />
            <Route path="/applications" element={<div><h1 className={`text-2xl font-bold mb-5 ${isDark ? 'text-white' : 'text-slate-900'}`}>Applications</h1><p className={isDark ? 'text-slate-400' : 'text-slate-500'}>Select a drive from Manage Drives to view applications.</p></div>} />
            <Route path="/interviews" element={<div><h1 className={`text-2xl font-bold mb-5 ${isDark ? 'text-white' : 'text-slate-900'}`}>Interviews 🎤</h1><InterviewCalendar /></div>} />
          </Routes>
        </div>
      </main>
    </div>
  )
}
