// Forces reload to apply rate-limit and UI fixes
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import { AuthProvider } from './context/AuthContext'
import { ThemeProvider } from './context/ThemeContext'
import ErrorBoundary from './components/common/ErrorBoundary'
import ProtectedRoute from './components/auth/ProtectedRoute'
import SharedBackground from './components/common/SharedBackground'
import Landing from './pages/Landing'
import ResetPassword from './pages/ResetPassword'
import StudentDashboard from './pages/StudentDashboard'
import TPODashboard from './pages/TPODashboard'
import AlumniDashboard from './pages/AlumniDashboard'
import NotFound from './pages/NotFound'

export default function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider>
        <AuthProvider>
          <BrowserRouter>
            <SharedBackground />
            <div className="relative z-10 min-h-screen">
              <Toaster
                position="top-right"
                toastOptions={{
                  duration: 3500,
                  style: {
                    background: '#ffffff',
                    color: '#1e293b',
                    borderRadius: '16px',
                    padding: '12px 20px',
                    fontSize: '14px',
                    fontWeight: '500',
                    boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
                    border: '1px solid rgba(0, 0, 0, 0.05)',
                  },
                  success: {
                    iconTheme: { primary: '#10b981', secondary: '#fff' },
                  },
                  error: {
                    iconTheme: { primary: '#ef4444', secondary: '#fff' },
                  },
                }}
              />
              <Routes>
                <Route path="/" element={<Landing />} />
                <Route path="/reset-password" element={<ResetPassword />} />
                <Route path="/login" element={<Navigate to="/" replace />} />
                <Route
                  path="/student/*"
                  element={
                    <ProtectedRoute roles={['student']}>
                      <StudentDashboard />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/tpo/*"
                  element={
                    <ProtectedRoute roles={['tpo']}>
                      <TPODashboard />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/alumni/*"
                  element={
                    <ProtectedRoute roles={['alumni']}>
                      <AlumniDashboard />
                    </ProtectedRoute>
                  }
                />
                <Route path="*" element={<NotFound />} />
              </Routes>
            </div>
          </BrowserRouter>
        </AuthProvider>
      </ThemeProvider>
    </ErrorBoundary>
  )
}
