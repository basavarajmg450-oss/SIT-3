import { createContext, useContext, useEffect } from 'react'
// Theme context - Dark theme only (permanent)

const ThemeContext = createContext(null)

export const ThemeProvider = ({ children }) => {
  // Always use dark theme permanently
  const isDark = true

  useEffect(() => {
    document.documentElement.classList.add('dark')
  }, [])

  return (
    <ThemeContext.Provider value={{ isDark }}>
      {children}
    </ThemeContext.Provider>
  )
}

export const useTheme = () => {
  const ctx = useContext(ThemeContext)
  if (!ctx) throw new Error('useTheme must be used within ThemeProvider')
  return ctx
}
