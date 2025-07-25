import React, { useState, useEffect } from 'react'
import { BarChart3, FileText, MessageSquare, TrendingUp, AlertCircle, CheckCircle } from 'lucide-react'

const Dashboard = ({ setCurrentView }) => {
  const [stats, setStats] = useState({
    totalDocuments: 0,
    complianceScore: 0,
    activeReports: 0,
    chatSessions: 0
  })

  const [recentActivity, setRecentActivity] = useState([])

  useEffect(() => {
    // Load dashboard data from API
    const loadDashboardData = async () => {
      try {
        // Fetch documents count
        const docsResponse = await fetch('https://saasend-production.up.railway.apphttps://saasend-production.up.railway.apphttps://saasend-production.up.railway.app/api/documents?limit=1')
        const docsData = await docsResponse.json()

        // Fetch chat sessions
        const chatResponse = await fetch('https://saasend-production.up.railway.apphttps://saasend-production.up.railway.app/api/chat')
        const chatData = await chatResponse.json()

        // Calculate compliance score based on documents and frameworks
        const complianceScore = calculateComplianceScore(docsData.documents || [])

        setStats({
          totalDocuments: docsData.pagination?.total || 0,
          complianceScore,
          activeReports: 3, // Static for now
          chatSessions: chatData.sessions?.length || 0
        })

        // Generate recent activity from actual data
        const activities = []

        if (docsData.documents && docsData.documents.length > 0) {
          docsData.documents.slice(0, 2).forEach((doc, index) => {
            activities.push({
              id: `doc-${index}`,
              type: 'upload',
              message: `Uploaded ${doc.filename}`,
              time: formatTimeAgo(doc.uploadedAt),
              status: doc.processingStatus === 'completed' ? 'success' : 'info'
            })
          })
        }

        if (chatData.sessions && chatData.sessions.length > 0) {
          chatData.sessions.slice(0, 2).forEach((session, index) => {
            activities.push({
              id: `chat-${index}`,
              type: 'chat',
              message: `Chat session with ${session.messageCount} messages`,
              time: formatTimeAgo(session.lastActivity),
              status: 'info'
            })
          })
        }

        // Add some default activities if none exist
        if (activities.length === 0) {
          activities.push(
            { id: 1, type: 'info', message: 'Welcome to Saastain ESG Co-Pilot', time: 'now', status: 'info' },
            { id: 2, type: 'info', message: 'Upload documents to get started', time: 'now', status: 'info' }
          )
        }

        setRecentActivity(activities)

      } catch (error) {
        console.error('Error loading dashboard data:', error)
        // Fallback to static data
        setStats({
          totalDocuments: 0,
          complianceScore: 0,
          activeReports: 0,
          chatSessions: 0
        })
        setRecentActivity([
          { id: 1, type: 'info', message: 'Welcome to Saastain ESG Co-Pilot', time: 'now', status: 'info' }
        ])
      }
    }

    loadDashboardData()
  }, [])

  const calculateComplianceScore = (documents) => {
    if (documents.length === 0) return 0

    const frameworkCoverage = new Set()
    const documentTypes = new Set()

    documents.forEach(doc => {
      if (doc.complianceFrameworks) {
        doc.complianceFrameworks.forEach(fw => frameworkCoverage.add(fw.framework))
      }
      if (doc.documentType) {
        documentTypes.add(doc.documentType)
      }
    })

    // Score based on framework coverage and document diversity
    const frameworkScore = Math.min(frameworkCoverage.size * 15, 60)
    const documentScore = Math.min(documentTypes.size * 10, 30)
    const baseScore = documents.length > 0 ? 10 : 0

    return Math.min(frameworkScore + documentScore + baseScore, 100)
  }

  const formatTimeAgo = (dateString) => {
    if (!dateString) return 'recently'

    const date = new Date(dateString)
    const now = new Date()
    const diffMs = now - date
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60))
    const diffDays = Math.floor(diffHours / 24)

    if (diffDays > 0) return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`
    if (diffHours > 0) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`
    return 'recently'
  }

  const StatCard = ({ title, value, icon: Icon, color = 'blue' }) => (
    <div className="card p-4 sm:p-6">
      <div className="flex items-center justify-between">
        <div className="min-w-0 flex-1">
          <p className="text-xs sm:text-sm font-medium text-gray-600 dark:text-gray-400 truncate">{title}</p>
          <p className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900 dark:text-white">{value}</p>
        </div>
        <div className={`p-2 sm:p-3 rounded-full bg-${color}-100 dark:bg-${color}-900/30 flex-shrink-0`}>
          <Icon className={`h-4 w-4 sm:h-5 sm:w-5 lg:h-6 lg:w-6 text-${color}-600 dark:text-${color}-400`} />
        </div>
      </div>
    </div>
  )

  const getActivityIcon = (type) => {
    switch (type) {
      case 'upload': return FileText
      case 'chat': return MessageSquare
      case 'report': return BarChart3
      case 'analysis': return TrendingUp
      default: return FileText
    }
  }

  const getStatusIcon = (status) => {
    switch (status) {
      case 'success': return CheckCircle
      case 'warning': return AlertCircle
      default: return MessageSquare
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">ESG Dashboard</h1>
        <p className="text-gray-600 dark:text-gray-400">Monitor your ESG compliance and reporting progress</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        <StatCard
          title="Total Documents"
          value={stats.totalDocuments}
          icon={FileText}
          color="blue"
        />
        <StatCard
          title="Compliance Score"
          value={`${stats.complianceScore}%`}
          icon={TrendingUp}
          color="green"
        />
        <StatCard
          title="Active Reports"
          value={stats.activeReports}
          icon={BarChart3}
          color="purple"
        />
        <StatCard
          title="Chat Sessions"
          value={stats.chatSessions}
          icon={MessageSquare}
          color="orange"
        />
      </div>

      {/* Recent Activity */}
      <div className="card p-6">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Recent Activity</h2>
        <div className="space-y-4">
          {recentActivity.map((activity) => {
            const ActivityIcon = getActivityIcon(activity.type)
            const StatusIcon = getStatusIcon(activity.status)

            return (
              <div key={activity.id} className="flex items-center space-x-3 sm:space-x-4 p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                <div className="p-2 rounded-full bg-gray-100 dark:bg-gray-700 flex-shrink-0">
                  <ActivityIcon className="h-4 w-4 text-gray-600 dark:text-gray-400" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 dark:text-white truncate">{activity.message}</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">{activity.time}</p>
                </div>
                <StatusIcon className={`h-4 w-4 flex-shrink-0 ${activity.status === 'success' ? 'text-green-500 dark:text-green-400' :
                  activity.status === 'warning' ? 'text-yellow-500 dark:text-yellow-400' :
                    'text-blue-500 dark:text-blue-400'
                  }`} />
              </div>
            )
          })}
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
        <div className="card p-4 sm:p-6 text-center">
          <MessageSquare className="h-10 w-10 sm:h-12 sm:w-12 text-blue-600 dark:text-blue-400 mx-auto mb-3 sm:mb-4" />
          <h3 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-white mb-2">Ask ESG Co-Pilot</h3>
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">Get instant answers about ESG compliance and reporting</p>
          <button
            onClick={() => setCurrentView('chat')}
            className="btn-primary w-full touch-target"
          >
            Start Chat
          </button>
        </div>

        <div className="card p-4 sm:p-6 text-center">
          <FileText className="h-10 w-10 sm:h-12 sm:w-12 text-green-600 dark:text-green-400 mx-auto mb-3 sm:mb-4" />
          <h3 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-white mb-2">Upload Documents</h3>
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">Add your ESG reports and policies for analysis</p>
          <button
            onClick={() => setCurrentView('upload')}
            className="btn-primary w-full touch-target"
          >
            Upload Files
          </button>
        </div>

        <div className="card p-4 sm:p-6 text-center sm:col-span-2 lg:col-span-1">
          <BarChart3 className="h-10 w-10 sm:h-12 sm:w-12 text-purple-600 dark:text-purple-400 mx-auto mb-3 sm:mb-4" />
          <h3 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-white mb-2">Generate Report</h3>
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">Create compliance reports based on your data</p>
          <button
            onClick={() => setCurrentView('reports')}
            className="btn-primary w-full touch-target"
          >
            Create Report
          </button>
        </div>
      </div>
    </div>
  )
}

export default Dashboard