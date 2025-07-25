import React, { useState, useEffect } from 'react'
import { FileText, Download, Loader, CheckCircle, AlertTriangle, BarChart3, Thermometer, Users, TrendingUp, Clock } from 'lucide-react'

const ReportGeneration = () => {
  const [reportTypes, setReportTypes] = useState([])
  const [selectedType, setSelectedType] = useState('comprehensive')
  const [generating, setGenerating] = useState(false)
  const [generatedReport, setGeneratedReport] = useState(null)
  const [reportHistory, setReportHistory] = useState([])

  useEffect(() => {
    loadReportTypes()
    loadReportHistory()
  }, [])

  const loadReportTypes = async () => {
    try {
      const response = await fetch('https://saasend-production.up.railway.app/api/reports/types')
      const data = await response.json()
      setReportTypes(data.types)
    } catch (error) {
      console.error('Error loading report types:', error)
    }
  }

  const loadReportHistory = async () => {
    try {
      const response = await fetch('https://saasend-production.up.railway.app/api/reports/history')
      const data = await response.json()
      setReportHistory(data.reports || [])
    } catch (error) {
      console.error('Error loading report history:', error)
    }
  }

  const generateReport = async () => {
    setGenerating(true)
    try {
      const response = await fetch('https://saasend-production.up.railway.app/api/reports/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reportType: selectedType })
      })
      
      const data = await response.json()
      if (data.success) {
        setGeneratedReport(data.report)
        loadReportHistory() // Refresh history
      } else {
        console.error('Report generation failed:', data.error)
      }
    } catch (error) {
      console.error('Error generating report:', error)
    } finally {
      setGenerating(false)
    }
  }

  const exportReport = async (format = 'json') => {
    try {
      const response = await fetch('https://saasend-production.up.railway.app/api/reports/export', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          reportType: selectedType,
          format 
        })
      })
      
      const data = await response.json()
      
      // Create download
      const blob = new Blob([JSON.stringify(data.report, null, 2)], { type: 'application/json' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `esg-report-${selectedType}-${new Date().toISOString().split('T')[0]}.json`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)
    } catch (error) {
      console.error('Error exporting report:', error)
    }
  }

  const getIcon = (iconName) => {
    const icons = {
      BarChart3,
      FileText,
      Thermometer,
      Users
    }
    return icons[iconName] || FileText
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Generate ESG Reports</h1>
        <p className="text-gray-600 dark:text-gray-400">Create comprehensive compliance reports based on your uploaded documents and ESG data</p>
      </div>

      {/* Report Type Selection */}
      <div className="card p-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Select Report Type</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {reportTypes.map((type) => {
            const Icon = getIcon(type.icon)
            return (
              <div
                key={type.id}
                className={`p-4 border rounded-lg cursor-pointer transition-colors ${
                  selectedType === type.id
                    ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                    : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
                }`}
                onClick={() => setSelectedType(type.id)}
              >
                <div className="flex items-start space-x-3">
                  <Icon className="h-6 w-6 text-blue-600 dark:text-blue-400 mt-1" />
                  <div className="flex-1">
                    <h4 className="font-medium text-gray-900 dark:text-white">{type.name}</h4>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">{type.description}</p>
                    <div className="flex items-center mt-2 text-xs text-gray-500 dark:text-gray-400">
                      <Clock className="h-3 w-3 mr-1" />
                      <span>{type.estimatedTime}</span>
                    </div>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* Generate Button */}
      <div className="flex justify-center">
        <button
          onClick={generateReport}
          disabled={generating}
          className="btn-primary flex items-center space-x-2 px-8 py-3"
        >
          {generating ? (
            <Loader className="w-5 h-5 animate-spin" />
          ) : (
            <FileText className="w-5 h-5" />
          )}
          <span>{generating ? 'Generating Report...' : 'Generate Report'}</span>
        </button>
      </div>

      {/* Generated Report Display */}
      {generatedReport && (
        <div className="card p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-lg font-semibold text-gray-900">Generated Report</h3>
              <p className="text-sm text-gray-600">
                Generated on {new Date(generatedReport.generatedAt).toLocaleString()}
              </p>
            </div>
            <button 
              onClick={() => exportReport('json')}
              className="btn-secondary flex items-center space-x-2"
            >
              <Download className="w-4 h-4" />
              <span>Export JSON</span>
            </button>
          </div>
          
          <ReportDisplay report={generatedReport} />
        </div>
      )}

      {/* Report History */}
      {reportHistory.length > 0 && (
        <div className="card p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Reports</h3>
          <div className="space-y-3">
            {reportHistory.map((report) => (
              <div key={report.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div>
                  <p className="font-medium text-gray-900 capitalize">{report.type} Report</p>
                  <p className="text-sm text-gray-600">
                    Generated {new Date(report.generatedAt).toLocaleDateString()}
                  </p>
                </div>
                <div className="flex items-center space-x-3">
                  <span className={`px-2 py-1 text-xs rounded-full ${
                    report.score >= 80 ? 'bg-green-100 text-green-700' :
                    report.score >= 60 ? 'bg-yellow-100 text-yellow-700' :
                    'bg-red-100 text-red-700'
                  }`}>
                    {report.score}% Score
                  </span>
                  <span className="text-xs text-gray-500">{report.status}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

const ReportDisplay = ({ report }) => {
  const getSeverityColor = (severity) => {
    switch (severity) {
      case 'high': return 'text-red-600 bg-red-50 border-red-200'
      case 'medium': return 'text-yellow-600 bg-yellow-50 border-yellow-200'
      case 'low': return 'text-blue-600 bg-blue-50 border-blue-200'
      default: return 'text-gray-600 bg-gray-50 border-gray-200'
    }
  }

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'high': return 'text-red-600 bg-red-100'
      case 'medium': return 'text-yellow-600 bg-yellow-100'
      case 'low': return 'text-green-600 bg-green-100'
      default: return 'text-gray-600 bg-gray-100'
    }
  }

  return (
    <div className="space-y-8">
      {/* Executive Summary */}
      <div>
        <h4 className="text-lg font-semibold text-gray-900 mb-4">Executive Summary</h4>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <div className="text-center p-4 bg-blue-50 rounded-lg">
            <div className="text-3xl font-bold text-blue-600">{report.summary.totalDocuments}</div>
            <div className="text-sm text-gray-600">Documents Analyzed</div>
          </div>
          <div className="text-center p-4 bg-green-50 rounded-lg">
            <div className="text-3xl font-bold text-green-600">{report.summary.frameworksCovered.length}</div>
            <div className="text-sm text-gray-600">Frameworks Covered</div>
          </div>
          <div className="text-center p-4 bg-purple-50 rounded-lg">
            <div className="text-3xl font-bold text-purple-600">{report.summary.overallScore}%</div>
            <div className="text-sm text-gray-600">Overall Compliance</div>
          </div>
          <div className="text-center p-4 bg-orange-50 rounded-lg">
            <div className="text-3xl font-bold text-orange-600">{report.complianceGaps.length}</div>
            <div className="text-sm text-gray-600">Identified Gaps</div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="p-4 border border-gray-200 rounded-lg">
            <h5 className="font-medium text-gray-900 mb-2">Data Quality</h5>
            <p className="text-sm text-gray-600">{report.summary.dataQuality}</p>
          </div>
          <div className="p-4 border border-gray-200 rounded-lg">
            <h5 className="font-medium text-gray-900 mb-2">Frameworks Covered</h5>
            <div className="flex flex-wrap gap-1">
              {report.summary.frameworksCovered.map((framework) => (
                <span key={framework} className="px-2 py-1 text-xs bg-blue-100 text-blue-700 rounded">
                  {framework}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Framework Analysis */}
      <div>
        <h4 className="text-lg font-semibold text-gray-900 mb-4">Framework Analysis</h4>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {Object.entries(report.frameworkAnalysis).map(([framework, analysis]) => (
            <div key={framework} className="border border-gray-200 rounded-lg p-4">
              <div className="flex items-center justify-between mb-3">
                <h5 className="font-medium text-gray-900">{framework}</h5>
                <span className={`px-2 py-1 text-xs rounded-full ${
                  analysis.status === 'excellent' ? 'bg-green-100 text-green-700' :
                  analysis.status === 'good' ? 'bg-blue-100 text-blue-700' :
                  analysis.status === 'fair' ? 'bg-yellow-100 text-yellow-700' :
                  'bg-red-100 text-red-700'
                }`}>
                  {analysis.coverage}% Coverage
                </span>
              </div>
              <div className="space-y-2 text-sm text-gray-600">
                <p>{analysis.documentsCount} documents analyzed</p>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className={`h-2 rounded-full ${
                      analysis.coverage > 80 ? 'bg-green-500' :
                      analysis.coverage > 60 ? 'bg-blue-500' :
                      analysis.coverage > 40 ? 'bg-yellow-500' :
                      'bg-red-500'
                    }`}
                    style={{ width: `${analysis.coverage}%` }}
                  />
                </div>
                {analysis.gaps.length > 0 && (
                  <div className="mt-2">
                    <p className="text-xs text-red-600">Gaps identified:</p>
                    <ul className="text-xs text-gray-500 list-disc list-inside">
                      {analysis.gaps.slice(0, 2).map((gap, index) => (
                        <li key={index}>{gap}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Compliance Gaps */}
      {report.complianceGaps.length > 0 && (
        <div>
          <h4 className="text-lg font-semibold text-gray-900 mb-4">Compliance Gaps</h4>
          <div className="space-y-3">
            {report.complianceGaps.slice(0, 5).map((gap, index) => (
              <div key={index} className={`p-4 rounded-lg border ${getSeverityColor(gap.severity)}`}>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h5 className="font-medium text-gray-900">{gap.title}</h5>
                    <p className="text-sm text-gray-600 mt-1">{gap.description}</p>
                    <p className="text-sm text-blue-600 mt-2">{gap.recommendation}</p>
                  </div>
                  <span className={`px-2 py-1 text-xs rounded-full ${
                    gap.severity === 'high' ? 'bg-red-100 text-red-700' :
                    gap.severity === 'medium' ? 'bg-yellow-100 text-yellow-700' :
                    'bg-blue-100 text-blue-700'
                  }`}>
                    {gap.severity.toUpperCase()}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Recommendations */}
      {report.recommendations.length > 0 && (
        <div>
          <h4 className="text-lg font-semibold text-gray-900 mb-4">Recommendations</h4>
          <div className="space-y-4">
            {report.recommendations.slice(0, 4).map((rec, index) => (
              <div key={index} className="border border-gray-200 rounded-lg p-4">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-1">
                      <h5 className="font-medium text-gray-900">{rec.title}</h5>
                      <span className={`px-2 py-1 text-xs rounded-full ${getPriorityColor(rec.priority)}`}>
                        {rec.priority}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600">{rec.description}</p>
                  </div>
                  <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">
                    {rec.framework}
                  </span>
                </div>
                <div className="mt-3">
                  <p className="text-sm font-medium text-gray-700 mb-2">Action Items:</p>
                  <ul className="text-sm text-gray-600 space-y-1">
                    {rec.actions.map((action, actionIndex) => (
                      <li key={actionIndex} className="flex items-start">
                        <CheckCircle className="h-3 w-3 text-green-500 mt-1 mr-2 flex-shrink-0" />
                        {action}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

export default ReportGeneration