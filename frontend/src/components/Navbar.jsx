import { LogOut, User } from 'lucide-react'
import Logo from './Logo'
import ThemeToggle from './ThemeToggle'
import { clearAuth } from '../lib/auth'

const Navbar = ({ user, toggleTheme, theme }) => {
  const handleLogout = () => {
    clearAuth()
    window.location.href = '/login'
  }

  return (
    <nav className="fixed top-0 left-0 right-0 h-16 bg-white/80 dark:bg-gray-900/80 backdrop-blur-md border-b border-gray-200 dark:border-gray-700 z-50">
      <div className="flex items-center justify-between h-full px-6">
        <Logo />
        <div className="flex items-center space-x-4">
          <ThemeToggle theme={theme} toggleTheme={toggleTheme} />
          <div className="flex items-center space-x-2 bg-gray-100 dark:bg-gray-800 rounded-full px-4 py-1">
            <User className="w-4 h-4 text-gray-600 dark:text-gray-400" />
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
              {user.name} ({user.role})
            </span>
          </div>
          <button
            onClick={handleLogout}
            className="p-2 text-gray-600 dark:text-gray-400 hover:text-red-600 dark:hover:text-red-400 transition-colors"
          >
            <LogOut className="w-5 h-5" />
          </button>
        </div>
      </div>
    </nav>
  )
}

export default Navbar