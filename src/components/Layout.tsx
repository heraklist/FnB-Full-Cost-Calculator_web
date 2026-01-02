import { useState } from 'react'
import { Outlet, Link, useLocation } from 'react-router-dom'
import { 
  LayoutDashboard, 
  Package, 
  UtensilsCrossed, 
  Calendar, 
  Wallet,
  Settings, 
  Menu as MenuIcon, 
  X,
  Moon,
  Sun,
  LogOut
} from 'lucide-react'
import { clsx } from 'clsx'
import { supabase } from '../lib/supabase'

export default function Layout() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)
  const [isDarkMode, setIsDarkMode] = useState(true)
  const location = useLocation()

  const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen)
  const toggleTheme = () => {
    setIsDarkMode(!isDarkMode)
    document.documentElement.classList.toggle('dark')
  }

  const navigation = [
    { name: 'Dashboard', href: '/', icon: LayoutDashboard },
    { name: 'Πρώτες Ύλες', href: '/ingredients', icon: Package },
    { name: 'Συνταγές', href: '/recipes', icon: UtensilsCrossed },
    { name: 'Events', href: '/events', icon: Calendar },
    { name: 'Έσοδα/Έξοδα', href: '/transactions', icon: Wallet },
    { name: 'Ρυθμίσεις', href: '/settings', icon: Settings },
  ]

  return (
    <div className={clsx("min-h-screen bg-gray-900 transition-colors duration-200", isDarkMode ? 'dark' : '')}>
      {/* Mobile sidebar backdrop */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 z-40 bg-gray-900/50 lg:hidden"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div className={clsx(
        "fixed inset-y-0 left-0 z-50 w-64 bg-gray-800 border-r border-gray-700 transform transition-transform duration-200 lg:translate-x-0 lg:static lg:inset-0",
        isSidebarOpen ? "translate-x-0" : "-translate-x-full"
      )}>
        <div className="flex items-center justify-between h-16 px-6 border-b border-gray-700">
          <span className="text-xl font-bold text-indigo-400">🍳 FnB Manager</span>
          <button onClick={() => setIsSidebarOpen(false)} className="lg:hidden text-gray-400 hover:text-gray-200">
            <X size={24} />
          </button>
        </div>

        <nav className="p-4 space-y-1">
          {navigation.map((item) => {
            const isActive = location.pathname === item.href
            return (
              <Link
                key={item.name}
                to={item.href}
                onClick={() => setIsSidebarOpen(false)}
                className={clsx(
                  "flex items-center px-4 py-3 text-sm font-medium rounded-lg transition-colors",
                  isActive 
                    ? "bg-indigo-900/20 text-indigo-400" 
                    : "text-gray-300 hover:bg-gray-700"
                )}
              >
                <item.icon className="w-5 h-5 mr-3" />
                {item.name}
              </Link>
            )
          })}
        </nav>
      </div>

      {/* Main content */}
      <div className="lg:ml-64 flex flex-col min-h-screen">
        {/* Top header */}
        <header className="flex items-center justify-between h-16 px-6 bg-gray-800 border-b border-gray-700">
          <button 
            onClick={toggleSidebar}
            className="lg:hidden text-gray-400 hover:text-gray-200"
          >
            <MenuIcon size={24} />
          </button>

          <div className="flex items-center space-x-4 ml-auto">
            <button 
              onClick={toggleTheme}
              className="p-2 text-gray-400 hover:text-gray-200 rounded-full hover:bg-gray-700"
            >
              {isDarkMode ? <Sun size={20} /> : <Moon size={20} />}
            </button>
            <button
              onClick={() => supabase.auth.signOut()}
              className="flex items-center gap-2 px-3 py-2 text-sm text-gray-300 hover:bg-gray-700 rounded-lg"
            >
              <LogOut size={16} />
              Έξοδος
            </button>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-y-auto p-6 bg-gray-900">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
