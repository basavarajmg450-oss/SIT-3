import { NavLink, useLocation } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { useAuth } from '../../context/AuthContext'

const studentLinks = [
  { to: '/student', label: 'Dashboard', icon: '🏠', end: true },
  { to: '/student/profile', label: 'My Profile', icon: '👤' },
  { to: '/student/drives', label: 'Drive Feed', icon: '💼' },
  { to: '/student/applications', label: 'Applications', icon: '📋' },
  { to: '/student/skill-gap', label: 'Skill Gap', icon: '📊' },
  { to: '/student/mentorship', label: 'Mentorship', icon: '🤝' },
  { to: '/student/referrals', label: 'Referrals', icon: '🔗' },
  { to: '/student/chatbot', label: 'PlacementBot', icon: '🤖' },
]

const tpoLinks = [
  { to: '/tpo', label: 'Dashboard', icon: '🏠', end: true },
  { to: '/tpo/drives', label: 'Manage Drives', icon: '💼' },
  { to: '/tpo/applications', label: 'Applications', icon: '📋' },
  { to: '/tpo/students', label: 'Students', icon: '🎓' },
  { to: '/tpo/interviews', label: 'Interviews', icon: '🎤' },
  { to: '/tpo/analytics', label: 'Analytics', icon: '📊' },
  { to: '/tpo/audit-logs', label: 'Audit Logs', icon: '📜' },
]

const alumniLinks = [
  { to: '/alumni', label: 'Dashboard', icon: '🏠', end: true },
  { to: '/alumni/profile', label: 'My Profile', icon: '👤' },
  { to: '/alumni/referrals', label: 'Referrals', icon: '🔗' },
  { to: '/alumni/mentorship', label: 'Mentorship', icon: '🤝' },
  { to: '/alumni/reviews', label: 'Interview Reviews', icon: '⭐' },
]

export default function Sidebar({ isOpen, onClose }) {
  const { user, profile } = useAuth()
  const location = useLocation()

  const links = user?.role === 'student' ? studentLinks : user?.role === 'tpo' ? tpoLinks : alumniLinks

  const sidebarContent = (
    <div className="flex flex-col h-full">
      <div className="p-5 border-b border-gray-100">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl flex items-center justify-center text-white font-bold shadow-lg">
            {profile?.name?.[0]?.toUpperCase() || user?.email?.[0]?.toUpperCase() || '?'}
          </div>
          <div>
            <p className="font-semibold text-gray-900 text-sm">{profile?.name || user?.email?.split('@')[0]}</p>
            <p className="text-xs text-gray-500 capitalize">{user?.role}</p>
          </div>
        </div>
        {user?.role === 'student' && profile?.profileCompleteness !== undefined && (
          <div className="mt-3">
            <div className="flex justify-between items-center mb-1">
              <span className="text-xs text-gray-500">Profile</span>
              <span className="text-xs font-semibold text-indigo-600">{profile.profileCompleteness}%</span>
            </div>
            <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${profile.profileCompleteness}%` }}
                transition={{ duration: 1, ease: 'easeOut' }}
                className="h-full bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full"
              />
            </div>
          </div>
        )}
      </div>

      <nav className="flex-1 p-3 overflow-y-auto scrollbar-thin">
        <ul className="space-y-1">
          {links.map((link) => (
            <li key={link.to}>
              <NavLink
                to={link.to}
                end={link.end}
                onClick={() => window.innerWidth < 1024 && onClose?.()}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 ${
                    isActive
                      ? 'bg-indigo-50 text-indigo-700 shadow-sm'
                      : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                  }`
                }
              >
                {({ isActive }) => (
                  <>
                    <span className="text-lg w-6 text-center">{link.icon}</span>
                    <span>{link.label}</span>
                    {isActive && (
                      <motion.div
                        layoutId="sidebar-active"
                        className="ml-auto w-1.5 h-5 bg-indigo-500 rounded-full"
                      />
                    )}
                  </>
                )}
              </NavLink>
            </li>
          ))}
        </ul>
      </nav>

      <div className="p-4 border-t border-gray-100">
        <div className="bg-gradient-to-br from-indigo-50 to-purple-50 rounded-xl p-3">
          <p className="text-xs font-semibold text-indigo-700 mb-0.5">PlacementPro v1.0</p>
          <p className="text-xs text-indigo-500">Your Career Launchpad</p>
        </div>
      </div>
    </div>
  )

  return (
    <>
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/30 z-30 lg:hidden"
            onClick={onClose}
          />
        )}
      </AnimatePresence>

      <motion.aside
        initial={false}
        animate={{ x: isOpen ? 0 : '-100%' }}
        transition={{ type: 'spring', damping: 30, stiffness: 300 }}
        className="fixed left-0 top-16 bottom-0 w-64 bg-white border-r border-gray-100 shadow-xl z-30 lg:hidden"
      >
        {sidebarContent}
      </motion.aside>

      <aside className="hidden lg:flex flex-col fixed left-0 top-16 bottom-0 w-64 bg-white border-r border-gray-100 z-20">
        {sidebarContent}
      </aside>
    </>
  )
}
