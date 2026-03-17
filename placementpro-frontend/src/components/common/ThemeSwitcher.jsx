import React from 'react'
import { motion } from 'framer-motion'
import { Sun, Moon } from 'lucide-react'
import { useTheme } from '../../context/ThemeContext'

const ThemeSwitcher = () => {
  const { actualTheme, toggleTheme } = useTheme()
  const isDark = actualTheme === 'dark'

  return (
    <motion.button
      whileHover={{ scale: 1.1 }}
      whileTap={{ scale: 0.9 }}
      onClick={toggleTheme}
      className={`relative w-14 h-7 rounded-full transition-colors duration-300 flex items-center px-1 ${
        isDark ? 'bg-indigo-600' : 'bg-slate-300'
      }`}
      title={isDark ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
    >
      <motion.div
        layout
        transition={{ type: 'spring', stiffness: 700, damping: 30 }}
        className={`w-5 h-5 rounded-full flex items-center justify-center ${
          isDark ? 'bg-white ml-auto' : 'bg-white mr-auto'
        }`}
      >
        {isDark ? (
          <Moon className="w-3.5 h-3.5 text-indigo-600" />
        ) : (
          <Sun className="w-3.5 h-3.5 text-orange-500" />
        )}
      </motion.div>
    </motion.button>
  )
}

export default ThemeSwitcher
