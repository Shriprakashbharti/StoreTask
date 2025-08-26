import { Routes, Route, Navigate } from 'react-router-dom'
import { useState, useEffect } from 'react'
import Navbar from './components/Navbar'
import Sidebar from './components/Sidebar'
import Login from './pages/Login'
import Signup from './pages/Signup'
import Stores from './pages/Stores'
import OwnerDashboard from './pages/OwnerDashboard'
import AdminDashboard from './pages/AdminDashboard'
import { getToken, getUser } from './lib/auth'

function App() {
  const [user, setUser] = useState(null)
  const [theme, setTheme] = useState(localStorage.getItem('theme') || 'light')

  useEffect(() => {
    const storedUser = getUser()
    if (storedUser) {
      setUser(storedUser)
    }
  }, [])

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme)
    localStorage.setItem('theme', theme)
  }, [theme])

  const toggleTheme = () => {
    setTheme(prev => prev === 'light' ? 'dark' : 'light')
  }

  const ProtectedRoute = ({ children, requiredRole }) => {
    const token = getToken()
    if (!token) {
      return <Navigate to="/login" />
    }
    if (requiredRole && user?.role !== requiredRole) {
      return <Navigate to="/stores" />
    }
    return children
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800">
      {user ? (
        <>
          <Navbar user={user} toggleTheme={toggleTheme} theme={theme} />
          <div className="flex">
            <Sidebar role={user.role} />
            <div className="flex-1 p-6 ml-64">
              <Routes>
                <Route path="/" element={<Navigate to="/stores" />} />
                <Route path="/stores" element={
                  <ProtectedRoute>
                    <Stores />
                  </ProtectedRoute>
                } />
                <Route path="/owner" element={
                  <ProtectedRoute requiredRole="OWNER">
                    <OwnerDashboard />
                  </ProtectedRoute>
                } />
                <Route path="/admin" element={
                  <ProtectedRoute requiredRole="ADMIN">
                    <AdminDashboard />
                  </ProtectedRoute>
                } />
              </Routes>
            </div>
          </div>
        </>
      ) : (
        <Routes>
          <Route path="/login" element={<Login setUser={setUser} />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="*" element={<Navigate to="/login" />} />
        </Routes>
      )}
    </div>
  )
}

export default App