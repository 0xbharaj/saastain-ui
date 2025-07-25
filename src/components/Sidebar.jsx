import React from 'react'
import { X, BarChart3, MessageSquare, Upload, FileText, Settings, TrendingUp, Brain } from 'lucide-react'
import './s.css'

const Sidebar = ({ open, setOpen, currentView, setCurrentView }) => {
  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: BarChart3 },
    { id: 'chat', label: 'ESG AI', icon: MessageSquare },
    { id: 'upload', label: 'Upload', icon: Upload },
    { id: 'insights', label: 'Insights', icon: TrendingUp },
    { id: 'reports', label: 'Reports', icon: FileText },
    { id: 'settings', label: 'Settings', icon: Settings },
  ]

  return (
    <>
      {/* Mobile backdrop */}
      {open && (
        <div 
          className="fixed inset-0 bg-gray-600 dark:bg-black bg-opacity-75 dark:bg-opacity-75 z-20 lg:hidden"
          onClick={() => setOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div className={`
        fixed inset-y-0 left-0 z-30 w-55 bg-white dark:bg-black  shadow-lg transform transition-all duration-300 ease-in-out
        lg:translate-x-0 lg:static lg:inset-0 lg:shadow-none
        ${open ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
      `}>
        {/* Mobile Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700 lg:hidden">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Menu</h2>
          <button
            onClick={() => setOpen(false)}
            className="p-2 rounded-md text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
            aria-label="Close sidebar"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Desktop Header */}
  

        <nav className="mt-4 heehe lg:mt-6 px-3 pb-4 overflow-y-auto h-full">
          <ul className="space-y-1">
            {menuItems.map((item) => {
              const Icon = item.icon
              return (
                <li key={item.id}>
                  <button
                    onClick={() => {
                      setCurrentView(item.id)
                      if (window.innerWidth < 1024) {
                        setOpen(false)
                      }
                    }}
                    className={`w-full flex items-center space-x-3 px-3 py-3 rounded-lg text-left transition-colors ${
                      currentView === item.id
                        ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300'
                        : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 hover:text-gray-900 dark:hover:text-white'
                    }`}
                  >
                    <Icon className="h-5 w-5 flex-shrink-0" />
                    <span className="font-medium truncate">{item.label}</span>
                  </button>
                </li>
              )
            })}
          </ul>
        </nav>
      </div>
    </>
  )
}

export default Sidebar