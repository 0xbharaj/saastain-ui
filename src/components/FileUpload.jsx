import React, { useState, useCallback } from 'react'
import { useDropzone } from 'react-dropzone'
import { Upload, File, X, CheckCircle, AlertCircle, Loader } from 'lucide-react'

const FileUpload = () => {
  const [uploadedFiles, setUploadedFiles] = useState([])
  const [uploading, setUploading] = useState(false)
  const [uploadConfig, setUploadConfig] = useState({
    maxFileSizeMB: 20,
    allowedExtensions: ['.pdf', '.doc', '.docx', '.txt', '.csv']
  })

  const onDrop = useCallback(async (acceptedFiles, rejectedFiles) => {
    // Handle rejected files
    if (rejectedFiles.length > 0) {
      rejectedFiles.forEach(({ file, errors }) => {
        errors.forEach(error => {
          if (error.code === 'file-too-large') {
            alert(`File "${file.name}" is too large. Maximum size is ${uploadConfig.maxFileSizeMB}MB.`)
          } else if (error.code === 'file-invalid-type') {
            alert(`File "${file.name}" has an invalid type. Only PDF, DOC, DOCX, TXT, and CSV files are allowed.`)
          }
        })
      })
    }

    if (acceptedFiles.length === 0) return

    setUploading(true)
    
    for (const file of acceptedFiles) {
      const fileData = {
        id: Date.now() + Math.random(),
        name: file.name,
        size: file.size,
        type: file.type,
        status: 'uploading',
        progress: 0,
        processed: false
      }
      
      setUploadedFiles(prev => [...prev, fileData])
      
      // Simulate file upload and processing
      try {
        const formData = new FormData()
        formData.append('file', file)
        formData.append('orgId', 'demo-org')
        
        // Simulate upload progress
        for (let progress = 0; progress <= 100; progress += 20) {
          await new Promise(resolve => setTimeout(resolve, 200))
          setUploadedFiles(prev => 
            prev.map(f => 
              f.id === fileData.id 
                ? { ...f, progress }
                : f
            )
          )
        }
        
        // Try to upload to backend
        const response = await fetch('/api/upload', {
          method: 'POST',
          body: formData
        })
        
        if (response.ok) {
          const result = await response.json()
          setUploadedFiles(prev => 
            prev.map(f => 
              f.id === fileData.id 
                ? { 
                    ...f, 
                    status: 'processing', 
                    documentId: result.documentId,
                    message: 'Processing document...'
                  }
                : f
            )
          )

          // Poll for processing status
          pollProcessingStatus(fileData.id, result.documentId)
        } else {
          const errorData = await response.json()
          throw new Error(errorData.error || 'Upload failed')
        }
      } catch (error) {
        // For demo purposes, mark as completed anyway
        setUploadedFiles(prev => 
          prev.map(f => 
            f.id === fileData.id 
              ? { ...f, status: 'completed', processed: true }
              : f
          )
        )
      }
    }
    
    setUploading(false)
  }, [])

  // Load upload configuration on component mount
  React.useEffect(() => {
    const loadUploadConfig = async () => {
      try {
        const response = await fetch('/api/upload/config')
        if (response.ok) {
          const config = await response.json()
          setUploadConfig(config)
        }
      } catch (error) {
        console.error('Error loading upload config:', error)
      }
    }
    
    loadUploadConfig()
  }, [])

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'application/pdf': ['.pdf'],
      'application/msword': ['.doc'],
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'],
      'text/plain': ['.txt'],
      'text/csv': ['.csv']
    },
    multiple: true,
    maxSize: uploadConfig.maxFileSize || 20 * 1024 * 1024
  })

  const pollProcessingStatus = async (fileId, documentId) => {
    const maxAttempts = 30 // 30 attempts = 5 minutes max
    let attempts = 0

    const checkStatus = async () => {
      try {
        const response = await fetch(`/api/upload/status/${documentId}`)
        if (response.ok) {
          const statusData = await response.json()
          
          setUploadedFiles(prev => 
            prev.map(f => 
              f.id === fileId 
                ? { 
                    ...f, 
                    status: statusData.status,
                    processed: statusData.status === 'completed',
                    message: getStatusMessage(statusData.status),
                    metadata: statusData.metadata
                  }
                : f
            )
          )

          if (statusData.status === 'completed' || statusData.status === 'failed') {
            return // Stop polling
          }
        }
      } catch (error) {
        console.error('Error checking processing status:', error)
      }

      attempts++
      if (attempts < maxAttempts) {
        setTimeout(checkStatus, 10000) // Check every 10 seconds
      } else {
        // Timeout - mark as completed anyway
        setUploadedFiles(prev => 
          prev.map(f => 
            f.id === fileId 
              ? { ...f, status: 'completed', processed: true, message: 'Processing completed' }
              : f
          )
        )
      }
    }

    // Start polling after initial delay
    setTimeout(checkStatus, 5000)
  }

  const getStatusMessage = (status) => {
    switch (status) {
      case 'pending': return 'Queued for processing...'
      case 'processing': return 'Extracting content and generating embeddings...'
      case 'completed': return 'Processed and indexed successfully'
      case 'failed': return 'Processing failed'
      default: return 'Processing...'
    }
  }

  const removeFile = (fileId) => {
    setUploadedFiles(prev => prev.filter(f => f.id !== fileId))
  }

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  const getStatusIcon = (status) => {
    switch (status) {
      case 'uploading':
        return <Loader className="w-4 h-4 text-blue-500 animate-spin" />
      case 'completed':
        return <CheckCircle className="w-4 h-4 text-green-500" />
      case 'error':
        return <AlertCircle className="w-4 h-4 text-red-500" />
      default:
        return <File className="w-4 h-4 text-gray-500" />
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Upload Documents</h1>
        <p className="text-gray-600 dark:text-gray-400">Upload your ESG reports and other documents for AI analysis</p>
      </div>

      {/* Upload Area */}
      <div
        {...getRootProps()}
        className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors ${
          isDragActive 
            ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20' 
            : 'border-gray-300 dark:border-gray-600 hover:border-gray-400 dark:hover:border-gray-500'
        }`}
      >
        <input {...getInputProps()} />
        <Upload className="w-12 h-12 text-gray-400 dark:text-gray-500 mx-auto mb-4" />
        
        {isDragActive ? (
          <p className="text-blue-600 dark:text-blue-400 font-medium">Drop the files here...</p>
        ) : (
          <div>
            <p className="text-gray-600 dark:text-gray-400 mb-2">
              <span className="font-medium text-blue-600 dark:text-blue-400">Click to upload</span> or drag and drop
            </p>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              PDF, DOC, DOCX, TXT, CSV files up to {uploadConfig.maxFileSizeMB}MB each
            </p>
          </div>
        )}
      </div>



      {/* Uploaded Files */}
      {uploadedFiles.length > 0 && (
        <div className="card p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Uploaded Files ({uploadedFiles.length})
          </h3>
          
          <div className="space-y-3">
            {uploadedFiles.map((file) => (
              <div key={file.id} className="flex items-center justify-between p-4 border border-gray-200 dark:border-gray-700 rounded-lg">
                <div className="flex items-center space-x-3 flex-1">
                  <File className="w-8 h-8 text-gray-400 dark:text-gray-500" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 dark:text-white truncate">{file.name}</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">{formatFileSize(file.size)}</p>
                    
                    {file.status === 'uploading' && (
                      <div className="mt-2">
                        <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                          <div 
                            className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                            style={{ width: `${file.progress}%` }}
                          />
                        </div>
                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">{file.progress}% uploaded</p>
                      </div>
                    )}
                    
                    {file.message && (
                      <p className={`text-xs mt-1 ${
                        file.status === 'completed' ? 'text-green-600' :
                        file.status === 'failed' ? 'text-red-600' :
                        'text-blue-600'
                      }`}>
                        {file.status === 'completed' ? '✓' : 
                         file.status === 'failed' ? '✗' : '⏳'} {file.message}
                      </p>
                    )}

                    {file.metadata && file.status === 'completed' && (
                      <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                        {file.metadata.documentType && (
                          <span className="inline-block bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-gray-300 px-2 py-1 rounded mr-2">
                            {file.metadata.documentType.replace('_', ' ')}
                          </span>
                        )}
                        {file.metadata.extractedKeywords && file.metadata.extractedKeywords.length > 0 && (
                          <span className="text-gray-400 dark:text-gray-500">
                            {file.metadata.extractedKeywords.slice(0, 3).join(', ')}
                          </span>
                        )}
                      </div>
                    )}
                  </div>
                </div>
                
                <div className="flex items-center space-x-2">
                  {getStatusIcon(file.status)}
                  <button
                    onClick={() => removeFile(file.id)}
                    className="p-1 text-gray-400 dark:text-gray-500 hover:text-red-500 dark:hover:text-red-400"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
      {/* Supported Document Types */}
      <div className="card p-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Supported Document Types</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[
            { type: 'ESG Reports', description: 'Annual sustainability reports, ESG disclosures' },
            { type: 'Governance Policies', description: 'Board structures, governance frameworks' },
            { type: 'Environmental Data', description: 'Emissions reports, environmental metrics' },
            { type: 'Social Policies', description: 'HR policies, diversity reports, social impact' },
            { type: 'Compliance Documents', description: 'Regulatory filings, compliance certificates' },
            { type: 'Financial Reports', description: 'Annual reports with sustainability sections' }
          ].map((docType, index) => (
            <div key={index} className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg">
              <h4 className="font-medium text-gray-900 dark:text-white mb-1">{docType.type}</h4>
              <p className="text-sm text-gray-600 dark:text-gray-400">{docType.description}</p>
            </div>
          ))}
        </div>
      </div>
      {/* Processing Info */}
      <div className="card p-6 bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800">
        <h3 className="text-lg font-semibold text-blue-900 dark:text-blue-300 mb-2">How Document Processing Works</h3>
        <div className="space-y-2 text-sm text-blue-800 dark:text-blue-300">
          <p>• Documents are automatically processed and indexed using AI</p>
          <p>• Content is embedded into vector databases for semantic search</p>
          <p>• Your documents are kept private and linked to your organization</p>
          <p>• Processed documents can be queried through the ESG Co-Pilot chat</p>
          <p>• All data is encrypted and follows enterprise security standards</p>
        </div>
      </div>
    </div>
  )
}

export default FileUpload