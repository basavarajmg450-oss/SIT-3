import { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useAuth } from '../../context/AuthContext'
import { useTheme } from '../../context/ThemeContext'
import { useNavigate } from 'react-router-dom'
import { notificationAPI } from '../../services/api'
import { timeAgo } from '../../utils/helpers'
import { Bell, Moon, Sun, LogOut, User, Menu, X, ChevronDown, Plus } from 'lucide-react'

export default function Navbar({ onMenuClick, sidebarOpen }) {
  const { user, profile, logout } = useAuth()
  const { isDark, toggleTheme } = useTheme()
  const navigate = useNavigate()
  const [notifications, setNotifications] = useState([])
  const [unreadCount, setUnreadCount] = useState(0)
  const [showNotifs, setShowNotifs] = useState(false)
  const [showProfile, setShowProfile] = useState(false)
  const notifRef = useRef(null)
  const profileRef = useRef(null)

  useEffect(() => {
    if (user) loadNotifications()
  }, [user])

  useEffect(() => {
    const handler = (e) => {
      if (notifRef.current && !notifRef.current.contains(e.target)) setShowNotifs(false)
      if (profileRef.current && !profileRef.current.contains(e.target)) setShowProfile(false)
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  const loadNotifications = async () => {
    try {
      const { data } = await notificationAPI.getAll({ limit: 10 })
      if (data.success) {
        setNotifications(data.notifications)
        setUnreadCount(data.unreadCount)
      }
    } catch { }
  }

  const handleMarkRead = async (id) => {
    try {
      await notificationAPI.markRead(id)
      setNotifications((prev) => prev.map((n) => n._id === id ? { ...n, isRead: true } : n))
      setUnreadCount((prev) => Math.max(0, prev - 1))
    } catch { }
  }

  const handleMarkAllRead = async () => {
    try {
      await notificationAPI.markAllRead()
      setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })))
      setUnreadCount(0)
    } catch { }
  }

  const handleLogout = async () => {
    await logout()
    navigate('/')
  }

  const roleLabel = { student: 'Student', tpo: 'TPO', alumni: 'Alumni' }
  const roleBadge = { student: 'bg-blue-500/20 text-blue-200', tpo: 'bg-purple-500/20 text-purple-200', alumni: 'bg-emerald-500/20 text-emerald-200' }

  const getTypeIcon = (type) => {
    const icons = { drive: '💼', application: '📋', interview: '🎤', referral: '🔗', mentorship: '🤝', system: '🔔', result: '🎉' }
    return icons[type] || '🔔'
  }

  return (
    <nav className={`fixed top-0 left-0 right-0 z-40 backdrop-blur-xl border-b transition-all duration-300 ${isDark
      ? 'bg-slate-900/80 border-white/10 shadow-lg'
      : 'bg-white/80 border-slate-200 shadow-md'
      }`}>
      <div className="flex items-center justify-between h-16 px-4 lg:px-6">
        <div className="flex items-center gap-3">
          <button onClick={onMenuClick} className={`p-2 rounded-xl transition-colors lg:hidden ${isDark ? 'hover:bg-white/10 text-white' : 'hover:bg-slate-100 text-slate-800'
            }`}>
            {sidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
          <div className="flex items-center gap-2">
            <span className="text-2xl">🎓</span>
            <span className="font-bold text-xl bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
              PlacementPro
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {user?.role === 'tpo' && (
            <button
              onClick={() => navigate('/tpo/drives?create=1')}
              className="hidden sm:flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-indigo-500 to-purple-600 text-white font-semibold text-sm hover:from-indigo-600 hover:to-purple-700 transition-all shadow-md"
            >
              <Plus className="w-4 h-4" /> New Drive
            </button>
          )}
          <button
            onClick={toggleTheme}
            className={`p-2 rounded-xl transition-colors ${isDark ? 'hover:bg-white/10 text-white' : 'hover:bg-slate-100 text-slate-800'
              }`}
            aria-label="Toggle theme"
          >
            {isDark ? <Sun className="w-5 h-5 text-amber-400" /> : <Moon className="w-5 h-5 text-slate-600" />}
          </button>

          <div className="relative" ref={notifRef}>
            <button
              onClick={() => setShowNotifs(!showNotifs)}
              className={`relative p-2 rounded-xl transition-colors ${isDark ? 'hover:bg-white/10 text-white' : 'hover:bg-slate-100 text-slate-800'
                }`}
              aria-label="Notifications"
            >
              <Bell className={`w-5 h-5 ${isDark ? 'text-slate-200' : 'text-slate-600'}`} />
              {unreadCount > 0 && (
                <motion.span
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center font-bold"
                >
                  {unreadCount > 9 ? '9+' : unreadCount}
                </motion.span>
              )}
            </button>

            <AnimatePresence>
              {showNotifs && (
                <motion.div
                  initial={{ opacity: 0, y: -10, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -10, scale: 0.95 }}
                  transition={{ duration: 0.2 }}
                  className={`absolute right-0 top-12 w-80 backdrop-blur-xl rounded-2xl shadow-2xl border overflow-hidden z-50 ${isDark ? 'bg-slate-900/95 border-white/10' : 'bg-white border-slate-200'
                    }`}
                >
                  <div className={`flex items-center justify-between p-4 border-b ${isDark ? 'border-white/10' : 'border-slate-100'}`}>
                    <h3 className={`font-semibold ${isDark ? 'text-white' : 'text-slate-800'}`}>Notifications</h3>
                    {unreadCount > 0 && (
                      <button onClick={handleMarkAllRead} className="text-xs text-cyan-400 hover:text-cyan-300 font-medium">
                        Mark all read
                      </button>
                    )}
                  </div>
                  <div className="max-h-80 overflow-y-auto scrollbar-thin">
                    {notifications.length === 0 ? (
                      <div className="p-6 text-center text-slate-400">
                        <Bell className="w-8 h-8 mx-auto mb-2 opacity-50" />
                        <p className="text-sm">No notifications yet</p>
                      </div>
                    ) : (
                      notifications.map((n) => (
                        <motion.div
                          key={n._id}
                          whileHover={{ backgroundColor: 'rgba(255,255,255,0.05)' }}
                          className={`p-4 border-b border-white/5 cursor-pointer transition-colors ${!n.isRead ? 'bg-cyan-500/10' : ''}`}
                          onClick={() => { handleMarkRead(n._id); setShowNotifs(false) }}
                        >
                          <div className="flex gap-3">
                            <span className="text-lg flex-shrink-0">{getTypeIcon(n.type)}</span>
                            <div className="flex-1 min-w-0">
                              <p className={`text-sm font-medium ${n.isRead ? 'text-slate-300' : 'text-white'}`}>{n.title}</p>
                              <p className="text-xs text-slate-400 mt-0.5 line-clamp-2">{n.message}</p>
                              <p className="text-xs text-slate-500 mt-1">{timeAgo(n.createdAt)}</p>
                            </div>
                            {!n.isRead && <span className="w-2 h-2 bg-cyan-400 rounded-full flex-shrink-0 mt-1.5" />}
                          </div>
                        </motion.div>
                      ))
                    )}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          <div className="relative" ref={profileRef}>
            <button
              onClick={() => setShowProfile(!showProfile)}
              className="flex items-center gap-2 p-1.5 rounded-xl hover:bg-white/10 transition-colors"
            >
              <div className="w-8 h-8 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl flex items-center justify-center text-white font-bold text-sm">
                {profile?.name?.[0]?.toUpperCase() || user?.email?.[0]?.toUpperCase() || '?'}
              </div>
              <div className="hidden md:block text-left">
                <p className={`text-sm font-semibold leading-tight ${isDark ? 'text-white' : 'text-slate-800'}`}>
                  {profile?.name || user?.email?.split('@')[0] || 'User'}
                </p>
                <span className={`text-xs px-1.5 py-0.5 rounded-full font-medium ${roleBadge[user?.role]}`}>
                  {roleLabel[user?.role]}
                </span>
              </div>
              <ChevronDown className="w-4 h-4 text-slate-400 hidden md:block" />
            </button>

            <AnimatePresence>
              {showProfile && (
                <motion.div
                  initial={{ opacity: 0, y: -10, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -10, scale: 0.95 }}
                  transition={{ duration: 0.2 }}
                  className={`absolute right-0 top-12 w-52 backdrop-blur-xl rounded-2xl shadow-2xl border overflow-hidden z-50 ${isDark ? 'bg-slate-900/95 border-white/10' : 'bg-white border-slate-200'
                    }`}
                >
                  <div className={`p-3 border-b ${isDark ? 'border-white/10' : 'border-slate-100'}`}>
                    <p className={`text-sm font-semibold ${isDark ? 'text-white' : 'text-slate-800'}`}>{profile?.name || 'User'}</p>
                    <p className="text-xs text-slate-500">{user?.email}</p>
                  </div>
                  <button
                    onClick={() => { setShowProfile(false); navigate(user?.role === 'student' ? '/student' : user?.role === 'tpo' ? '/tpo' : '/alumni') }}
                    className={`w-full flex items-center gap-2 px-3 py-2.5 text-sm transition-colors ${isDark ? 'text-slate-200 hover:bg-white/10' : 'text-slate-600 hover:bg-slate-50'
                      }`}
                  >
                    <User className="w-4 h-4" />
                    Dashboard
                  </button>
                  <button
                    onClick={handleLogout}
                    className="w-full flex items-center gap-2 px-3 py-2.5 text-sm text-red-400 hover:bg-red-500/20 transition-colors"
                  >
                    <LogOut className="w-4 h-4" />
                    Sign Out
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </nav>
  )
}
