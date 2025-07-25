import React, { useState, useEffect } from 'react'
import { BrowserRouter as Router, Routes, Route, useNavigate, useLocation } from 'react-router-dom'
import Dashboard from './components/Dashboard'
import Chat from './components/Chat'
import FileUpload from './components/FileUpload'
import ComplianceInsights from './components/ComplianceInsights'
import ReportGeneration from './components/ReportGeneration'
import Settings from './components/Settings'
import Header from './components/Header'
import Sidebar from './components/Sidebar'

function AppContent() {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const navigate = useNavigate()
  const location = useLocation()

  // Handle window resize to close sidebar on mobile
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 1024) {
        setSidebarOpen(false)
      }
    }

    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  const getCurrentView = () => {
    const path = location.pathname
    if (path === '/chat') return 'chat'
    if (path === '/upload') return 'upload'
    if (path === '/insights') return 'insights'
    if (path === '/reports') return 'reports'
    if (path === '/settings') return 'settings'
    return 'dashboard'
  }

  const setCurrentView = (view) => {
    const routes = {
      dashboard: '/',
      chat: '/chat',
      upload: '/upload',
      insights: '/insights',
      reports: '/reports',
      settings: '/settings'
    }
    navigate(routes[view] || '/')
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-black transition-colors">
      <Header 
        sidebarOpen={sidebarOpen} 
        setSidebarOpen={setSidebarOpen}
        currentView={getCurrentView()}
        setCurrentView={setCurrentView}
      />
      
      <div className="flex h-[calc(100vh-73px)]">
        <Sidebar 
          open={sidebarOpen} 
          setOpen={setSidebarOpen}
          currentView={getCurrentView()}
          setCurrentView={setCurrentView}
        />
        
        <main className="flex-1 overflow-auto">
          <div className="p-4 sm:p-6">
            <Routes>
              <Route path="/" element={<Dashboard setCurrentView={setCurrentView} />} />
              <Route path="/chat" element={<Chat />} />
              <Route path="/upload" element={<FileUpload />} />
              <Route path="/insights" element={<ComplianceInsights />} />
              <Route path="/reports" element={<ReportGeneration />} />
              <Route path="/settings" element={<Settings />} />
            </Routes>
          </div>
        </main>
      </div>
    </div>
  )
}

function App() {
  return (
    <Router>
      <AppContent />
    </Router>
  )
}

export default App