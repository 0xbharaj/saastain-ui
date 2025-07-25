import React, { useState, useRef, useEffect } from 'react'
import { Send, Bot, User, FileText, TrendingUp, AlertCircle } from 'lucide-react'
import ReactMarkdown from 'react-markdown'

// Error Boundary Component
class ChatErrorBoundary extends React.Component {
  constructor(props) {
    super(props)
    this.state = { hasError: false, error: null }
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error }
  }

  componentDidCatch(error, errorInfo) {
    console.error('Chat Error Boundary caught an error:', error, errorInfo)
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">Something went wrong</h3>
            <p className="text-gray-600 mb-4">There was an error displaying the chat messages.</p>
            <button
              onClick={() => this.setState({ hasError: false, error: null })}
              className="btn-primary"
            >
              Try Again
            </button>
          </div>
        </div>
      )
    }

    return this.props.children
  }
}

const Chat = () => {
  const [messages, setMessages] = useState([
    {
      id: 1,
      type: 'bot',
      content: "Hello! I'm your ESG Co-Pilot. I can help you with ESG compliance, reporting standards like CSRD and ISSB, and analyze your uploaded documents. What would you like to know?",
      timestamp: new Date(),
      confidence: null,
      sources: []
    }
  ])
  const [inputMessage, setInputMessage] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const messagesEndRef = useRef(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const handleSendMessage = async () => {
    if (!inputMessage.trim() || isLoading) return

    const userMessage = {
      id: Date.now(),
      type: 'user',
      content: inputMessage,
      timestamp: new Date()
    }

    setMessages(prev => [...prev, userMessage])
    setInputMessage('')
    setIsLoading(true)

    try {
      // Simulate API call to backend
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: inputMessage,
          sessionId: 'demo-session'
        })
      })

      if (response.ok) {
        const data = await response.json()
        console.log('Chat API Response:', data)
        
        // Validate the response data
        if (!data.response) {
          console.error('Invalid response from server:', data)
          throw new Error('Invalid response format')
        }
        
        // Log sources for debugging
        if (data.sources) {
          console.log('Sources received:', data.sources)
          data.sources.forEach((source, index) => {
            console.log(`Source ${index}:`, typeof source, source)
          })
        }
        
        const botMessage = {
          id: Date.now() + 1,
          type: 'bot',
          content: data.response,
          timestamp: new Date(),
          confidence: data.confidence || 0,
          sources: Array.isArray(data.sources) ? data.sources : []
        }

        console.log('Bot message created:', botMessage)
        setMessages(prev => [...prev, botMessage])
      } else {
        console.error('Server error:', response.status, response.statusText)
        // Fallback response for demo
        const demoResponse = getDemoResponse(inputMessage)
        setMessages(prev => [...prev, demoResponse])
      }
    } catch (error) {
      // Fallback response for demo
      const demoResponse = getDemoResponse(inputMessage)
      setMessages(prev => [...prev, demoResponse])
    }

    setIsLoading(false)
  }

  const getDemoResponse = (input) => {
    const lowerInput = input.toLowerCase()
    
    let response = "I understand you're asking about ESG compliance. "
    let confidence = Math.floor(Math.random() * 20) + 80 // 80-99%
    let sources = []

    if (lowerInput.includes('csrd')) {
      response = `The **Corporate Sustainability Reporting Directive (CSRD)** requires companies to report on sustainability matters following the European Sustainability Reporting Standards (ESRS). 

Key requirements include:
- **Double materiality assessment** - both impact and financial materiality
- **Detailed disclosures** on environmental, social, and governance topics
- **Digital reporting format** using XBRL taxonomy
- **Third-party assurance** of sustainability information

Based on your uploaded documents, I can help you identify any gaps in your current CSRD compliance.`
      sources = ['CSRD Directive 2022/2464', 'ESRS Standards', 'Your uploaded governance policy']
    } else if (lowerInput.includes('issb')) {
      response = `The **International Sustainability Standards Board (ISSB)** has issued two foundational standards:

**IFRS S1** - General Requirements for Disclosure of Sustainability-related Financial Information
**IFRS S2** - Climate-related Disclosures

These standards focus on:
- **Enterprise value creation** perspective
- **Climate-related risks and opportunities**
- **Governance, strategy, risk management, and metrics**
- **Scenario analysis** for climate resilience

Would you like me to analyze your current reporting against ISSB requirements?`
      sources = ['IFRS S1 Standard', 'IFRS S2 Standard', 'TCFD Recommendations']
    } else if (lowerInput.includes('board') || lowerInput.includes('governance')) {
      response = `For **board structure and governance** compliance:

**CSRD Requirements:**
- Board oversight of sustainability matters
- Sustainability expertise on the board
- Integration of sustainability in executive compensation

**Best Practices:**
- At least one board member with ESG expertise
- Regular sustainability training for directors
- Clear sustainability governance framework

I can compare your current board structure with these requirements if you've uploaded your governance documents.`
      sources = ['CSRD Article 19a', 'Your board_structure.pdf']
    }

    return {
      id: Date.now() + 1,
      type: 'bot',
      content: response,
      timestamp: new Date(),
      confidence,
      sources
    }
  }

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSendMessage()
    }
  }

  return (
    <ChatErrorBoundary>
      <div className="flex flex-col h-[calc(100vh-8rem)]">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">ESG Co-Pilot</h1>
          <p className="text-gray-600 dark:text-gray-400">Ask questions about ESG compliance, reporting standards, and your documents</p>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto space-y-4 mb-4">
          {messages.map((message) => {
            try {
              return (
                <div
                  key={message.id}
                  className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div className={`flex max-w-3xl ${message.type === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
                    <div className={`flex-shrink-0 ${message.type === 'user' ? 'ml-3' : 'mr-3'}`}>
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                        message.type === 'user' ? 'bg-blue-600' : 'bg-gray-600'
                      }`}>
                        {message.type === 'user' ? (
                          <User className="w-4 h-4 text-white" />
                        ) : (
                          <Bot className="w-4 h-4 text-white" />
                        )}
                      </div>
                    </div>
                    
                    <div className={`rounded-lg px-4 py-3 ${
                      message.type === 'user' 
                        ? 'bg-blue-600 text-white' 
                        : 'bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700'
                    }`}>
                      <div className="prose prose-sm max-w-none">
                        {message.type === 'user' ? (
                          <p className="text-white m-0">{message.content}</p>
                        ) : (
                          <ReactMarkdown className="text-gray-900 dark:text-white">{message.content}</ReactMarkdown>
                        )}
                      </div>
                      
                      {message.confidence && (
                        <div className="mt-3 pt-3 border-t border-gray-100 dark:border-gray-700">
                          <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
                            <span className="flex items-center">
                              <TrendingUp className="w-3 h-3 mr-1" />
                              Confidence: {message.confidence}%
                            </span>
                          </div>
                        </div>
                      )}
                      
                      {message.sources && message.sources.length > 0 && (
                        <div className="mt-2 pt-2 border-t border-gray-100 dark:border-gray-700">
                          <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Sources:</p>
                          <div className="flex flex-wrap gap-1">
                            {message.sources.map((source, index) => {
                              // Handle both string sources (demo) and object sources (API)
                              const sourceText = typeof source === 'string' ? source : source.title || source.framework || 'Unknown Source'
                              const relevanceScore = typeof source === 'object' ? source.relevanceScore : null
                              
                              return (
                                <span
                                  key={index}
                                  className="inline-flex items-center px-2 py-1 rounded text-xs bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300"
                                  title={typeof source === 'object' ? `Framework: ${source.framework}, Type: ${source.type}` : undefined}
                                >
                                  <FileText className="w-3 h-3 mr-1" />
                                  {sourceText}
                                  {relevanceScore && (
                                    <span className="ml-1 text-xs text-gray-500 dark:text-gray-400">
                                      ({relevanceScore}%)
                                    </span>
                                  )}
                                </span>
                              )
                            })}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )
            } catch (error) {
              console.error('Error rendering message:', error, message)
              return (
                <div key={message.id} className="flex justify-start">
                  <div className="bg-red-50 border border-red-200 rounded-lg px-4 py-3 max-w-3xl">
                    <p className="text-red-600 text-sm">Error rendering message</p>
                  </div>
                </div>
              )
            }
          })}
          
          {isLoading && (
            <div className="flex justify-start">
              <div className="flex mr-3">
                <div className="w-8 h-8 rounded-full bg-gray-600 flex items-center justify-center">
                  <Bot className="w-4 h-4 text-white" />
                </div>
              </div>
              <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg px-4 py-3">
                <div className="flex space-x-1">
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{animationDelay: '0.1s'}}></div>
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
                </div>
              </div>
            </div>
          )}
          
          <div ref={messagesEndRef} />
        </div>

        {/* Input */}
        <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
          <div className="flex space-x-4">
            <div className="flex-1">
              <textarea
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Ask about ESG compliance, CSRD requirements, board governance..."
                className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                rows="2"
                disabled={isLoading}
              />
            </div>
            <button
              onClick={handleSendMessage}
              disabled={!inputMessage.trim() || isLoading}
              className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
            >
              <Send className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </ChatErrorBoundary>
  )
}

export default Chat