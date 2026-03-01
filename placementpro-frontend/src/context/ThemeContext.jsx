import { createContext, useContext, useEffect } from 'react'

const ThemeContext = createContext(null)

export const ThemeProvider = ({ children }) => {
  // Application is ALWAYS dark — no toggle allowed.
  const isDark = true

  useEffect(() => {
    // Force the dark class on <html> immediately and keep it there permanently.
    document.documentElement.classList.add('dark')
    // Also pin it in localStorage so any old 'light' value is overwritten.
    localStorage.setItem('pp_theme', 'dark')
  }, [])

  // toggleTheme is a no-op: dark mode is enforced system-wide.
  const toggleTheme = () => { }

  // setForceDark is kept for API compatibility with Landing.jsx (does nothing extra).
  const setForceDark = () => { }

  return (
    <ThemeContext.Provider value={{ isDark, toggleTheme, setForceDark }}>
      {children}
    </ThemeContext.Provider>
  )
}

export const useTheme = () => {
  const ctx = useContext(ThemeContext)
  if (!ctx) throw new Error('useTheme must be used within ThemeProvider')
  return ctx
}
