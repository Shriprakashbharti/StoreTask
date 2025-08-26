import { Link, useLocation } from 'react-router-dom'
import { Store, BarChart3, Shield, Home } from 'lucide-react'

const Sidebar = ({ role }) => {
  const location = useLocation()

  const menuItems = [
    { icon: Home, label: 'Stores', path: '/stores', roles: ['USER', 'OWNER', 'ADMIN'] },
    { icon: BarChart3, label: 'Owner Dashboard', path: '/owner', roles: ['OWNER'] },
    { icon: Shield, label: 'Admin Dashboard', path: '/admin', roles: ['ADMIN'] },
  ]

  const filteredItems = menuItems.filter(item => item.roles.includes(role))

  return (
    <div className="fixed left-0 top-16 h-[calc(100vh-4rem)] w-64 bg-white/80 dark:bg-gray-900/80 backdrop-blur-md border-r border-gray-200 dark:border-gray-700 p-4">
      <nav className="space-y-2">
        {filteredItems.map((item) => {
          const Icon = item.icon
          const isActive = location.pathname === item.path
          return (
            <Link
              key={item.path}
              to={item.path}
              className={`flex items-center space-x-3 px-4 py-3 rounded-xl transition-all ${
                isActive
                  ? 'bg-indigo-100 dark:bg-indigo-900/50 text-indigo-700 dark:text-indigo-300'
                  : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800'
              }`}
            >
              <Icon className="w-5 h-5" />
              <span className="font-medium">{item.label}</span>
            </Link>
          )
        })}
      </nav>
    </div>
  )
}

export default Sidebar