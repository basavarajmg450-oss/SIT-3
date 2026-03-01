import React, { createContext, useContext, useEffect, useMemo, useCallback } from 'react'

const ThemeContext = createContext(null)

export const ThemeProvider = ({ children }) => {
  // Application is ALWAYS dark — no toggle allowed.
  const isDark = true

  useEffect(() => {
    // Force the dark class on <html> immediately and keep it there permanently.
    if (typeof document !== 'undefined') {
      document.documentElement.classList.add('dark')
      localStorage.setItem('pp_theme', 'dark')
    }
  }, [])

  // Memorize no-ops so Landing.jsx's useEffect dependency array doesn't trigger loops
  const toggleTheme = useCallback(() => { }, [])
  const setForceDark = useCallback(() => { }, [])

  const value = useMemo(() => ({
    isDark,
    toggleTheme,
    setForceDark
  }), [isDark, toggleTheme, setForceDark])

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
