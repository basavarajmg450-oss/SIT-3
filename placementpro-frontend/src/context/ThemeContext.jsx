import React, { createContext, useContext, useState, useEffect, useMemo, useCallback } from 'react'

const ThemeContext = createContext(null)

export const ThemeProvider = ({ children }) => {
  // Initialize from localStorage or default to dark
  const [isDark, setIsDark] = useState(() => {
    const saved = localStorage.getItem('pp_theme')
    return saved ? saved === 'dark' : true
  })

  // forceDark is used by Landing.jsx to override user preference
  const [forceDark, setForceDarkState] = useState(false)

  // Apply theme to document
  useEffect(() => {
    if (typeof document !== 'undefined') {
      // If forceDark is true (landing page), always use dark
      // Otherwise use the user's preference
      const effectiveDarkMode = forceDark || isDark
      
      if (effectiveDarkMode) {
        document.documentElement.classList.add('dark')
      } else {
        document.documentElement.classList.remove('dark')
      }
    }
  }, [isDark, forceDark])

  const toggleTheme = useCallback(() => {
    setIsDark(prev => {
      const newVal = !prev
      localStorage.setItem('pp_theme', newVal ? 'dark' : 'light')
      return newVal
    })
  }, [])

  const setForceDark = useCallback((val) => {
    setForceDarkState(val)
  }, [])

  const value = useMemo(() => ({
    isDark: forceDark || isDark, // This ensures components use the "effective" theme
    actualTheme: isDark ? 'dark' : 'light', // For internal use if needed
    toggleTheme,
    setForceDark
  }), [isDark, toggleTheme, setForceDark, forceDark])

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  )
}

export const useTheme = () => {
  const ctx = useContext(ThemeContext)
  if (!ctx) throw new Error('useTheme must be used within ThemeProvider')
  return ctx
}
