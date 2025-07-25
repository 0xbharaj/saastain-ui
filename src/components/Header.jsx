import React from 'react'
import { Menu, Brain, MessageSquare, Upload, BarChart3, TrendingUp, Settings } from 'lucide-react'

const Header = ({ sidebarOpen, setSidebarOpen, currentView, setCurrentView }) => {
  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: BarChart3 },
    { id: 'chat', label: 'ESG Co-Pilot', icon: MessageSquare },
    { id: 'upload', label: 'Upload Documents', icon: Upload },
    { id: 'insights', label: 'Compliance Insights', icon: TrendingUp },
  ]

  return (
    <header className="bg-white dark:bg-black shadow-sm border-b border-gray-200 dark:border-black transition-colors sticky top-0 z-40">
      <div className="flex items-center justify-between px-4 sm:px-6 py-4">
        <div className="flex items-center space-x-3 sm:space-x-4">
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="p-2 rounded-md text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors lg:hidden"
            aria-label="Toggle sidebar"
          >
            <Menu className="h-5 w-5" />
          </button>
          
          {/* Show branding on all screen sizes */}
          <div className="flex items-center space-x-2">
            <Brain className="h-6 w-6 sm:h-8 sm:w-8 text-blue-600 dark:text-blue-400" />
            <div className="flex flex-col sm:flex-row sm:items-center sm:space-x-2">
              <h1 className="text-lg sm:text-xl font-bold text-gray-900 dark:text-white">Saastain</h1>
              <span className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 hidden sm:inline">ESG Co-Pilot</span>
            </div>
          </div>
        </div>

        {/* Desktop Navigation */}
        <nav className="hidden lg:flex space-x-1">
          {navItems.map((item) => {
            const Icon = item.icon
            return (
              <button
                key={item.id}
                onClick={() => setCurrentView(item.id)}
                className={`flex items-center space-x-2 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                  currentView === item.id
                    ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300'
                    : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-700'
                }`}
              >
                <Icon className="h-4 w-4" />
                <span className="hidden xl:inline">{item.label}</span>
              </button>
            )
          })}
        </nav>

        {/* Mobile Quick Actions */}
        <div className="flex items-center space-x-2 lg:hidden">
          <button
            onClick={() => setCurrentView('chat')}
            className={`p-2 rounded-md transition-colors ${
              currentView === 'chat'
                ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300'
                : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-700'
            }`}
            aria-label="ESG Co-Pilot"
          >
            <MessageSquare className="h-5 w-5" />
          </button>
          <button
            onClick={() => setCurrentView('settings')}
            className={`p-2 rounded-md transition-colors ${
              currentView === 'settings'
                ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300'
                : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-700'
            }`}
            aria-label="Settings"
          >
            <Settings className="h-5 w-5" />
          </button>
        </div>
      </div>
    </header>
  )
}

export default Header