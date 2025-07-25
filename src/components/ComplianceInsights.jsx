import React, { useState, useEffect } from 'react'
import { TrendingUp, AlertTriangle, CheckCircle, FileText, Target } from 'lucide-react'

const ComplianceInsights = () => {
  const [insights, setInsights] = useState({
    overallScore: 0,
    frameworkCoverage: [],
    gaps: [],
    recommendations: []
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadComplianceInsights()
  }, [])

  const loadComplianceInsights = async () => {
    try {
      setLoading(true)
      
      // Fetch documents and analyze compliance
      const docsResponse = await fetch('/api/documents')
      const docsData = await docsResponse.json()
      
      // Fetch available frameworks
      const frameworksResponse = await fetch('/api/documents/global/frameworks')
      const frameworksData = await frameworksResponse.json()

      const analysis = analyzeCompliance(docsData.documents || [], frameworksData.frameworks || [])
      setInsights(analysis)
      
    } catch (error) {
      console.error('Error loading compliance insights:', error)
    } finally {
      setLoading(false)
    }
  }

  const analyzeCompliance = (documents, availableFrameworks) => {
    const frameworkCoverage = new Map()
    const documentTypes = new Set()
    const detectedFrameworks = new Set()

    // Analyze existing documents
    documents.forEach(doc => {
      if (doc.documentType) {
        documentTypes.add(doc.documentType)
      }
      
      if (doc.complianceFrameworks) {
        doc.complianceFrameworks.forEach(fw => {
          detectedFrameworks.add(fw.framework)
          if (!frameworkCoverage.has(fw.framework)) {
            frameworkCoverage.set(fw.framework, {
              framework: fw.framework,
              documents: 0,
              avgRelevance: 0,
              totalRelevance: 0
            })
          }
          const current = frameworkCoverage.get(fw.framework)
          current.documents += 1
          current.totalRelevance += fw.relevanceScore || 0.5
          current.avgRelevance = current.totalRelevance / current.documents
        })
      }
    })

    // Calculate overall score
    const documentScore = Math.min(documents.length * 5, 30)
    const frameworkScore = Math.min(detectedFrameworks.size * 15, 50)
    const diversityScore = Math.min(documentTypes.size * 4, 20)
    const overallScore = documentScore + frameworkScore + diversityScore

    // Identify gaps
    const gaps = []
    const recommendations = []

    // Check for missing key frameworks
    const keyFrameworks = ['CSRD', 'ISSB', 'GHG_Protocol', 'TCFD']
    keyFrameworks.forEach(framework => {
      if (!detectedFrameworks.has(framework)) {
        gaps.push({
          type: 'framework',
          framework,
          severity: 'high',
          description: `No documents found for ${framework} compliance`
        })
        recommendations.push({
          type: 'framework',
          priority: 'high',
          title: `Implement ${framework} Reporting`,
          description: `Upload or create documents that address ${framework} requirements`
        })
      }
    })

    // Check for missing document types
    const keyDocTypes = ['governance_policy', 'environmental_data', 'esg_report']
    keyDocTypes.forEach(docType => {
      if (!documentTypes.has(docType)) {
        gaps.push({
          type: 'document',
          docType,
          severity: 'medium',
          description: `Missing ${docType.replace('_', ' ')} documentation`
        })
        recommendations.push({
          type: 'document',
          priority: 'medium',
          title: `Add ${docType.replace('_', ' ')}`,
          description: `Upload documents related to ${docType.replace('_', ' ')}`
        })
      }
    })

    // Convert framework coverage to array
    const coverageArray = Array.from(frameworkCoverage.values()).map(fw => ({
      ...fw,
      completeness: Math.min(fw.documents * 25, 100),
      status: fw.avgRelevance > 0.7 ? 'good' : fw.avgRelevance > 0.4 ? 'fair' : 'poor'
    }))

    return {
      overallScore: Math.min(overallScore, 100),
      frameworkCoverage: coverageArray,
      gaps: gaps.slice(0, 5),
      recommendations: recommendations.slice(0, 4)
    }
  }

  const getScoreColor = (score) => {
    if (score >= 80) return 'text-green-600'
    if (score >= 60) return 'text-yellow-600'
    return 'text-red-600'
  }

  const getScoreBgColor = (score) => {
    if (score >= 80) return 'bg-green-100'
    if (score >= 60) return 'bg-yellow-100'
    return 'bg-red-100'
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/3 mb-4"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="card p-6">
              <div className="h-4 bg-gray-200 rounded w-1/2 mb-4"></div>
              <div className="h-16 bg-gray-200 rounded"></div>
            </div>
            <div className="card p-6">
              <div className="h-4 bg-gray-200 rounded w-1/2 mb-4"></div>
              <div className="space-y-2">
                <div className="h-4 bg-gray-200 rounded"></div>
                <div className="h-4 bg-gray-200 rounded"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Compliance Insights</h1>
        <p className="text-gray-600 dark:text-gray-400">Analyze your ESG compliance status and get recommendations</p>
      </div>

      {/* Overall Score */}
      <div className="card p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Overall Compliance Score</h2>
          <div className={`px-4 py-2 rounded-full ${getScoreBgColor(insights.overallScore)}`}>
            <span className={`text-2xl font-bold ${getScoreColor(insights.overallScore)}`}>
              {insights.overallScore}%
            </span>
          </div>
        </div>
        
        <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3 mb-4">
          <div 
            className={`h-3 rounded-full transition-all duration-500 ${
              insights.overallScore >= 80 ? 'bg-green-500' :
              insights.overallScore >= 60 ? 'bg-yellow-500' :
              'bg-red-500'
            }`}
            style={{ width: `${insights.overallScore}%` }}
          />
        </div>
        
        <p className="text-sm text-gray-600 dark:text-gray-400">
          {insights.overallScore >= 80 ? 'Excellent compliance coverage' :
           insights.overallScore >= 60 ? 'Good progress, some areas need attention' :
           'Significant gaps in compliance coverage'}
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Framework Coverage */}
        <div className="card p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
            <Target className="h-5 w-5 mr-2 text-blue-600 dark:text-blue-400" />
            Framework Coverage
          </h3>
          
          {insights.frameworkCoverage.length > 0 ? (
            <div className="space-y-3">
              {insights.frameworkCoverage.map((fw, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                  <div>
                    <p className="font-medium text-gray-900 dark:text-white">{fw.framework}</p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">{fw.documents} document{fw.documents !== 1 ? 's' : ''}</p>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className={`w-3 h-3 rounded-full ${
                      fw.status === 'good' ? 'bg-green-500' :
                      fw.status === 'fair' ? 'bg-yellow-500' :
                      'bg-red-500'
                    }`} />
                    <span className="text-sm font-medium text-gray-900 dark:text-white">{fw.completeness}%</span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500 dark:text-gray-400">
              <FileText className="h-12 w-12 mx-auto mb-2 text-gray-300 dark:text-gray-600" />
              <p>No framework coverage detected</p>
              <p className="text-sm">Upload ESG documents to see framework analysis</p>
            </div>
          )}
        </div>

        {/* Compliance Gaps */}
        <div className="card p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
            <AlertTriangle className="h-5 w-5 mr-2 text-yellow-600 dark:text-yellow-400" />
            Compliance Gaps
          </h3>
          
          {insights.gaps.length > 0 ? (
            <div className="space-y-3">
              {insights.gaps.map((gap, index) => (
                <div key={index} className={`p-3 rounded-lg border-l-4 ${
                  gap.severity === 'high' ? 'border-red-500 bg-red-50 dark:bg-red-900/20' :
                  gap.severity === 'medium' ? 'border-yellow-500 bg-yellow-50 dark:bg-yellow-900/20' :
                  'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                }`}>
                  <p className="font-medium text-gray-900 dark:text-white">{gap.description}</p>
                  <p className={`text-sm ${
                    gap.severity === 'high' ? 'text-red-600 dark:text-red-400' :
                    gap.severity === 'medium' ? 'text-yellow-600 dark:text-yellow-400' :
                    'text-blue-600 dark:text-blue-400'
                  }`}>
                    {gap.severity.toUpperCase()} PRIORITY
                  </p>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500 dark:text-gray-400">
              <CheckCircle className="h-12 w-12 mx-auto mb-2 text-green-300 dark:text-green-600" />
              <p>No major gaps identified</p>
              <p className="text-sm">Your compliance coverage looks good</p>
            </div>
          )}
        </div>
      </div>

      {/* Recommendations */}
      {insights.recommendations.length > 0 && (
        <div className="card p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
            <TrendingUp className="h-5 w-5 mr-2 text-green-600 dark:text-green-400" />
            Recommendations
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {insights.recommendations.map((rec, index) => (
              <div key={index} className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg hover:border-blue-300 dark:hover:border-blue-600 transition-colors">
                <div className="flex items-start justify-between mb-2">
                  <h4 className="font-medium text-gray-900 dark:text-white">{rec.title}</h4>
                  <span className={`px-2 py-1 text-xs rounded-full ${
                    rec.priority === 'high' ? 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400' :
                    rec.priority === 'medium' ? 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400' :
                    'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400'
                  }`}>
                    {rec.priority}
                  </span>
                </div>
                <p className="text-sm text-gray-600 dark:text-gray-400">{rec.description}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

export default ComplianceInsights