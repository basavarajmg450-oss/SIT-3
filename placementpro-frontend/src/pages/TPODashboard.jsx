import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Routes, Route, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { tpoAPI } from '../services/api'
import Navbar from '../components/common/Navbar'
import Sidebar from '../components/common/Sidebar'
import { StatCard } from '../components/common/Card'
import CreateDrive from '../components/tpo/CreateDrive'
import AnalyticsDashboard from '../components/tpo/AnalyticsDashboard'
import EligibleStudents from '../components/tpo/EligibleStudents'
import toast from 'react-hot-toast'
import { formatDate, getStatusColor, getStatusIcon, formatSalaryRange } from '../utils/helpers'
import { Plus, Download, RefreshCw, ChevronDown } from 'lucide-react'

function Home() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [stats, setStats] = useState({ totalDrives: 0, activeDrives: 0, totalApplications: 0, placedStudents: 0 })
  const [recentDrives, setRecentDrives] = useState([])

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
    } catch {}
  }

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">TPO Dashboard 👨‍💼</h1>
          <p className="text-gray-500 text-sm mt-0.5">Manage drives, students, and placements</p>
        </div>
        <button onClick={() => navigate('/tpo/drives')} className="btn-primary text-sm flex items-center gap-2">
          <Plus className="w-4 h-4" /> New Drive
        </button>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { icon: '💼', label: 'Total Drives', value: stats.totalDrives, color: 'indigo' },
          { icon: '✅', label: 'Active Drives', value: stats.activeDrives, color: 'emerald' },
          { icon: '🎓', label: 'Placed Students', value: stats.placedStudents, color: 'purple' },
          { icon: '📋', label: 'Applications', value: stats.totalApplications, color: 'amber' },
        ].map((s, i) => (
          <motion.div key={s.label} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}>
            <StatCard {...s} />
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <div className="bg-white rounded-2xl p-5 border border-gray-100">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-semibold text-gray-900">Recent Drives</h2>
              <button onClick={loadData} className="text-gray-400 hover:text-gray-600 transition-colors"><RefreshCw className="w-4 h-4" /></button>
            </div>
            <div className="space-y-3">
              {recentDrives.map((drive, i) => (
                <motion.div key={drive._id} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.05 }} className="flex items-center justify-between p-3 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors cursor-pointer">
                  <div>
                    <p className="font-medium text-gray-900 text-sm">{drive.company}</p>
                    <p className="text-xs text-gray-500">{drive.title}</p>
                    <p className="text-xs text-gray-400 mt-0.5">Deadline: {formatDate(drive.deadline)}</p>
                  </div>
                  <div className="text-right">
                    <span className={`text-xs px-2.5 py-1 rounded-full font-medium border ${getStatusColor(drive.status)}`}>{drive.status}</span>
                    <p className="text-xs text-gray-500 mt-1">{drive.applicationCount || 0} applied</p>
                  </div>
                </motion.div>
              ))}
              {recentDrives.length === 0 && <p className="text-center text-gray-400 text-sm py-6">No drives yet. Create your first drive!</p>}
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <div className="bg-white rounded-2xl p-5 border border-gray-100">
            <h2 className="font-semibold text-gray-900 mb-3">⚡ Quick Actions</h2>
            {[
              { label: 'Create Drive', icon: '➕', action: () => navigate('/tpo/drives'), color: 'indigo' },
              { label: 'View Analytics', icon: '📊', action: () => navigate('/tpo/analytics'), color: 'purple' },
              { label: 'View Students', icon: '🎓', action: () => navigate('/tpo/students'), color: 'blue' },
              { label: 'Export Report', icon: '📥', action: async () => { try { const { data } = await tpoAPI.exportReport(); const blob = new Blob([JSON.stringify(data.data, null, 2)], { type: 'application/json' }); const url = URL.createObjectURL(blob); const a = document.createElement('a'); a.href = url; a.download = `placement_report_${Date.now()}.json`; a.click(); toast.success('Report exported!') } catch { toast.error('Export failed') } }, color: 'emerald' },
              { label: 'Audit Logs', icon: '📜', action: () => navigate('/tpo/audit-logs'), color: 'gray' },
            ].map((action) => (
              <motion.button key={action.label} whileHover={{ x: 4 }} onClick={action.action} className="w-full flex items-center gap-3 p-2.5 rounded-xl hover:bg-gray-50 transition-colors text-left group">
                <span className="text-xl">{action.icon}</span>
                <span className="text-sm font-medium text-gray-700 group-hover:text-indigo-600 transition-colors">{action.label}</span>
                <span className="ml-auto text-gray-300 group-hover:text-indigo-400">→</span>
              </motion.button>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

function ManageDrives() {
  const navigate = useNavigate()
  const [drives, setDrives] = useState([])
  const [loading, setLoading] = useState(true)
  const [showCreate, setShowCreate] = useState(false)
  const [selected, setSelected] = useState(null)

  useEffect(() => { loadDrives() }, [])

  const loadDrives = async () => {
    try {
      const { data } = await tpoAPI.getDrives({ limit: 50 })
      if (data.success) setDrives(data.drives)
    } catch {} finally { setLoading(false) }
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
        <h1 className="text-2xl font-bold text-gray-900">Manage Drives 💼</h1>
        <button onClick={() => setShowCreate(!showCreate)} className="btn-primary text-sm flex items-center gap-2">
          <Plus className="w-4 h-4" /> {showCreate ? 'Cancel' : 'Create Drive'}
        </button>
      </div>

      {showCreate && (
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="bg-white rounded-2xl p-5 border border-gray-100">
          <CreateDrive onSuccess={() => { setShowCreate(false); loadDrives() }} />
        </motion.div>
      )}

      {loading ? (
        <div className="space-y-3">{[...Array(3)].map((_, i) => <div key={i} className="h-24 bg-white rounded-2xl border border-gray-100 animate-pulse" />)}</div>
      ) : (
        <div className="space-y-3">
          {drives.map((drive, i) => (
            <motion.div key={drive._id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }} className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
              <div className="p-4 cursor-pointer hover:bg-gray-50 transition-colors" onClick={() => setSelected(selected === drive._id ? null : drive._id)}>
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 bg-indigo-100 rounded-xl flex items-center justify-center text-indigo-600 font-bold">{drive.company[0]}</div>
                    <div>
                      <h3 className="font-semibold text-gray-900 text-sm">{drive.title}</h3>
                      <p className="text-indigo-600 text-sm font-medium">{drive.company}</p>
                      <div className="flex gap-3 text-xs text-gray-500 mt-0.5">
                        <span>CGPA ≥ {drive.minCGPA}</span>
                        <span>{drive.applicationCount} applied</span>
                        <span>Deadline: {formatDate(drive.deadline)}</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={`text-xs px-2.5 py-1 rounded-full font-medium border ${getStatusColor(drive.status)}`}>{drive.status}</span>
                    <motion.div animate={{ rotate: selected === drive._id ? 180 : 0 }}><ChevronDown className="w-4 h-4 text-gray-400" /></motion.div>
                  </div>
                </div>
              </div>
              {selected === drive._id && (
                <div className="px-4 pb-4 border-t border-gray-100 pt-3 space-y-3">
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-xs">
                    <div className="bg-gray-50 rounded-lg p-2"><p className="text-gray-500">Salary</p><p className="font-semibold text-gray-800">{formatSalaryRange(drive.salaryMin, drive.salaryMax)}</p></div>
                    <div className="bg-gray-50 rounded-lg p-2"><p className="text-gray-500">Branches</p><p className="font-semibold text-gray-800">{drive.eligibleBranches.join(', ')}</p></div>
                    <div className="bg-gray-50 rounded-lg p-2"><p className="text-gray-500">Max Backlogs</p><p className="font-semibold text-gray-800">{drive.maxBacklogs}</p></div>
                    <div className="bg-gray-50 rounded-lg p-2"><p className="text-gray-500">Selected</p><p className="font-semibold text-gray-800">{drive.selectedCount || 0}</p></div>
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
          {drives.length === 0 && <div className="text-center py-10"><div className="text-4xl mb-3">💼</div><p className="text-gray-500">No drives created yet</p></div>}
        </div>
      )}
    </div>
  )
}

function AuditLogs() {
  const [logs, setLogs] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    tpoAPI.getAuditLogs({ limit: 50 }).then(({ data }) => { if (data.success) setLogs(data.logs) }).catch(() => {}).finally(() => setLoading(false))
  }, [])

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold text-gray-900">Audit Logs 📜</h1>
      {loading ? <div className="text-center py-10"><motion.div className="w-8 h-8 border-2 border-indigo-200 border-t-indigo-500 rounded-full mx-auto" animate={{ rotate: 360 }} transition={{ duration: 0.8, repeat: Infinity }} /></div> : (
        <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-100">
              <tr>{['Action', 'User', 'Method', 'Path', 'Time'].map((h) => <th key={h} className="text-left px-4 py-3 text-xs font-semibold text-gray-600">{h}</th>)}</tr>
            </thead>
            <tbody>
              {logs.length === 0 ? (
                <tr><td colSpan={5} className="text-center py-8 text-gray-400">No audit logs yet</td></tr>
              ) : logs.map((log) => (
                <tr key={log.id} className="border-b border-gray-50 hover:bg-gray-50 transition-colors">
                  <td className="px-4 py-3"><span className="text-xs bg-indigo-50 text-indigo-700 px-2 py-0.5 rounded font-medium">{log.action}</span></td>
                  <td className="px-4 py-3 text-gray-600 text-xs">{log.userEmail}</td>
                  <td className="px-4 py-3"><span className={`text-xs font-bold ${log.method === 'POST' ? 'text-emerald-600' : log.method === 'PUT' ? 'text-amber-600' : 'text-blue-600'}`}>{log.method}</span></td>
                  <td className="px-4 py-3 text-gray-500 text-xs font-mono">{log.path}</td>
                  <td className="px-4 py-3 text-gray-400 text-xs">{new Date(log.timestamp).toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}

function StudentsPage() {
  const [driveId, setDriveId] = useState(new URLSearchParams(window.location.search).get('driveId') || '')
  const [drives, setDrives] = useState([])

  useEffect(() => {
    tpoAPI.getDrives({ limit: 50 }).then(({ data }) => { if (data.success) setDrives(data.drives) }).catch(() => {})
  }, [])

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold text-gray-900">Students 🎓</h1>
      <div>
        <label className="text-sm font-medium text-gray-700 mb-1.5 block">Select Drive</label>
        <select value={driveId} onChange={(e) => setDriveId(e.target.value)} className="w-full max-w-xs px-3 py-2.5 bg-white border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/40 transition-all">
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

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar onMenuClick={() => setSidebarOpen(!sidebarOpen)} sidebarOpen={sidebarOpen} />
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <main className="lg:ml-64 pt-16">
        <div className="p-4 lg:p-6 max-w-6xl mx-auto">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/drives" element={<ManageDrives />} />
            <Route path="/students" element={<StudentsPage />} />
            <Route path="/analytics" element={<div><h1 className="text-2xl font-bold text-gray-900 mb-5">Analytics 📊</h1><AnalyticsDashboard /></div>} />
            <Route path="/audit-logs" element={<AuditLogs />} />
            <Route path="/applications" element={<div><h1 className="text-2xl font-bold text-gray-900 mb-5">Applications</h1><p className="text-gray-500">Select a drive from Manage Drives to view applications.</p></div>} />
            <Route path="/interviews" element={<div><h1 className="text-2xl font-bold text-gray-900 mb-5">Interviews 🎤</h1><p className="text-gray-500">Interview scheduling is done per drive from Eligible Students view.</p></div>} />
          </Routes>
        </div>
      </main>
    </div>
  )
}
