import { createContext, useContext, useState, useEffect, useCallback } from 'react'
import toast from 'react-hot-toast'
import { authAPI } from '../services/api'

const AuthContext = createContext(null)

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null)
  const [profile, setProfile] = useState(null)
  const [loading, setLoading] = useState(true)
  const [token, setToken] = useState(() => localStorage.getItem('pp_token'))

  // Check backend health on mount
  useEffect(() => {
    const checkBackendHealth = async () => {
      try {
        const response = await fetch(`${import.meta.env.VITE_API_URL || '/api'}/health`, {
          method: 'GET',
          timeout: 3000
        })
        if (!response.ok) {
          throw new Error('Backend unavailable')
        }
      } catch (error) {
        toast.error(
          'Backend not running. Run: cd placementpro-backend && npm run dev',
          {
            duration: 0, // Don't auto-dismiss
            icon: '⚠️',
            style: {
              background: '#fee2e2',
              color: '#991b1b',
              border: '2px solid #dc2626',
            },
          }
        )
      }
    }
    checkBackendHealth()
  }, [])

  const loadUser = useCallback(async () => {
    const storedToken = localStorage.getItem('pp_token')
    if (!storedToken) {
      setLoading(false)
      return
    }
    try {
      const { data } = await authAPI.getMe()
      if (data.success) {
        setUser(data.user)
        setProfile(data.profile)
      } else {
        localStorage.removeItem('pp_token')
        setToken(null)
      }
    } catch {
      localStorage.removeItem('pp_token')
      setToken(null)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    loadUser()
  }, [loadUser])

  const login = (authData) => {
    localStorage.setItem('pp_token', authData.token)
    setToken(authData.token)
    setUser(authData.user)
    setProfile(authData.profile)
  }

  const logout = async () => {
    try {
      await authAPI.logout()
    } catch {}
    localStorage.removeItem('pp_token')
    setToken(null)
    setUser(null)
    setProfile(null)
  }

  const updateProfile = (newProfile) => {
    setProfile(newProfile)
  }

  const value = {
    user,
    profile,
    token,
    loading,
    login,
    logout,
    updateProfile,
    isAuthenticated: !!user,
    isStudent: user?.role === 'student',
    isTPO: user?.role === 'tpo',
    isAlumni: user?.role === 'alumni',
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export const useAuth = () => {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}
