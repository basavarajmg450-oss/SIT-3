import { createContext, useContext, useState, useEffect, useCallback } from 'react'

const ThemeContext = createContext(null)

export const ThemeProvider = ({ children }) => {
  // User's saved preference (persisted to localStorage)
  const [userIsDark, setUserIsDark] = useState(() => {
    const saved = localStorage.getItem('pp_theme')
    return saved ? saved === 'dark' : true
  })

  // Page-level force-dark override (e.g. Landing page always dark)
  // Must default false — Landing.jsx explicitly sets it true on mount.
  // Defaulting to true would incorrectly force dark on protected pages
  // when a user navigates directly to /student, /tpo, etc.
  const [forceDark, setForceDark] = useState(false)

  // Effective dark = force OR user preference
  const isDark = forceDark || userIsDark

  useEffect(() => {
    if (isDark) {
      document.documentElement.classList.add('dark')
    } else {
      document.documentElement.classList.remove('dark')
    }
  }, [isDark])

  const toggleTheme = () => {
    setUserIsDark((prev) => {
      const next = !prev
      localStorage.setItem('pp_theme', next ? 'dark' : 'light')
      return next
    })
  }

  // Stable callback so Landing's useEffect dep array works
  const handleSetForceDark = useCallback((val) => {
    setForceDark(val)
  }, [])

  return (
    <ThemeContext.Provider value={{ isDark, toggleTheme, setForceDark: handleSetForceDark }}>
      {children}
    </ThemeContext.Provider>
  )
}

export const useTheme = () => {
  const ctx = useContext(ThemeContext)
  if (!ctx) throw new Error('useTheme must be used within ThemeProvider')
  return ctx
}
