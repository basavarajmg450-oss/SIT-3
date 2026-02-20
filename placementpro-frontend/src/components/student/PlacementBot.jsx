import { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { chatbotAPI } from '../../services/api'
import { Send, Bot, Sparkles, X } from 'lucide-react'
import toast from 'react-hot-toast'

const FAQ_SUGGESTIONS = [
  'How do I prepare my resume?',
  'What are common interview questions?',
  'How to improve my CGPA impact?',
  'What skills are in demand?',
  'How to negotiate salary?',
]

export default function PlacementBot({ isPage = false }) {
  const [messages, setMessages] = useState([
    {
      id: 1,
      role: 'bot',
      content: "👋 Hi! I'm **PlacementBot**, your AI placement assistant!\n\nI can help you with:\n• 📄 Resume tips & review\n• 🎤 Interview preparation\n• 📚 Skill development guidance\n• 💰 Salary negotiation\n• 🏢 Company research\n\nWhat would you like to know?",
      timestamp: new Date(),
    },
  ])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [mode, setMode] = useState('chat')
  const messagesEndRef = useRef(null)
  const inputRef = useRef(null)

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const sendMessage = async (text) => {
    const messageText = text || input.trim()
    if (!messageText || loading) return

    const userMsg = { id: Date.now(), role: 'user', content: messageText, timestamp: new Date() }
    setMessages((prev) => [...prev, userMsg])
    setInput('')
    setLoading(true)

    try {
      const history = messages.slice(-6).map((m) => ({ role: m.role, content: m.content }))
      const { data } = await chatbotAPI.sendMessage({ message: messageText, conversationHistory: history })

      if (data.success) {
        setMessages((prev) => [...prev, { id: Date.now() + 1, role: 'bot', content: data.response, timestamp: new Date() }])
      }
    } catch {
      toast.error('Bot is unavailable. Try again.')
      setMessages((prev) => [...prev, { id: Date.now() + 1, role: 'bot', content: "I'm temporarily unavailable. Please try again shortly.", timestamp: new Date() }])
    } finally {
      setLoading(false)
    }
  }

  const startMockInterview = async () => {
    setMode('mock')
    setLoading(true)
    try {
      const { data } = await chatbotAPI.mockInterview({ role: 'Software Engineer', round: 'Technical' })
      if (data.success) {
        setMessages((prev) => [...prev,
          { id: Date.now(), role: 'bot', content: '🎤 **Mock Interview Mode Activated!**\n\nI will ask you interview questions and evaluate your answers. Ready?', timestamp: new Date() },
          { id: Date.now() + 1, role: 'bot', content: data.response, timestamp: new Date() },
        ])
      }
    } catch {
      toast.error('Failed to start mock interview')
    } finally {
      setLoading(false)
    }
  }

  const formatMessage = (text) => {
    return text
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      .replace(/\*(.*?)\*/g, '<em>$1</em>')
      .replace(/•/g, '<span class="inline-block w-1.5 h-1.5 bg-current rounded-full mr-1 mb-0.5 align-middle"></span>')
      .replace(/\n/g, '<br />')
  }

  return (
    <div className={`flex flex-col ${isPage ? 'h-[calc(100vh-10rem)]' : 'h-[500px]'} bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden`}>
      <div className="bg-gradient-to-r from-indigo-600 to-purple-600 p-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center">
            <Bot className="w-6 h-6 text-white" />
          </div>
          <div>
            <h3 className="font-semibold text-white text-sm">PlacementBot</h3>
            <div className="flex items-center gap-1">
              <span className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse" />
              <span className="text-white/70 text-xs">Online • AI Powered</span>
            </div>
          </div>
        </div>
        <div className="flex gap-2">
          <button
            onClick={startMockInterview}
            className="flex items-center gap-1.5 bg-white/20 hover:bg-white/30 text-white text-xs px-3 py-1.5 rounded-lg transition-colors font-medium"
          >
            <Sparkles className="w-3 h-3" />
            Mock Interview
          </button>
          {mode === 'mock' && (
            <button onClick={() => setMode('chat')} className="text-white/70 hover:text-white transition-colors">
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {messages.length === 1 && (
        <div className="px-4 py-3 bg-indigo-50 border-b border-indigo-100 flex gap-2 overflow-x-auto scrollbar-thin">
          {FAQ_SUGGESTIONS.map((q) => (
            <button
              key={q}
              onClick={() => sendMessage(q)}
              className="flex-shrink-0 text-xs bg-white text-indigo-600 border border-indigo-200 px-3 py-1.5 rounded-full hover:bg-indigo-50 transition-colors font-medium"
            >
              {q}
            </button>
          ))}
        </div>
      )}

      <div className="flex-1 overflow-y-auto p-4 space-y-3 scrollbar-thin bg-gray-50">
        <AnimatePresence>
          {messages.map((msg) => (
            <motion.div
              key={msg.id}
              initial={{ opacity: 0, y: 10, scale: 0.97 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{ duration: 0.3 }}
              className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              {msg.role === 'bot' && (
                <div className="w-7 h-7 bg-indigo-100 rounded-full flex items-center justify-center mr-2 flex-shrink-0 mt-0.5">
                  <Bot className="w-4 h-4 text-indigo-600" />
                </div>
              )}
              <div
                className={`max-w-[80%] px-4 py-3 rounded-2xl text-sm leading-relaxed ${
                  msg.role === 'user'
                    ? 'bg-gradient-to-br from-indigo-500 to-purple-600 text-white rounded-tr-none shadow-lg shadow-indigo-200'
                    : 'bg-white text-gray-800 rounded-tl-none shadow-sm border border-gray-100'
                }`}
              >
                {msg.role === 'bot' ? (
                  <div dangerouslySetInnerHTML={{ __html: formatMessage(msg.content) }} />
                ) : (
                  msg.content
                )}
              </div>
            </motion.div>
          ))}
        </AnimatePresence>

        {loading && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex items-center gap-2">
            <div className="w-7 h-7 bg-indigo-100 rounded-full flex items-center justify-center">
              <Bot className="w-4 h-4 text-indigo-600" />
            </div>
            <div className="bg-white rounded-2xl rounded-tl-none px-4 py-3 shadow-sm border border-gray-100">
              <div className="flex gap-1">
                {[0, 1, 2].map((i) => (
                  <motion.div
                    key={i}
                    className="w-2 h-2 bg-indigo-400 rounded-full"
                    animate={{ y: [0, -8, 0] }}
                    transition={{ duration: 0.8, repeat: Infinity, delay: i * 0.15 }}
                  />
                ))}
              </div>
            </div>
          </motion.div>
        )}
        <div ref={messagesEndRef} />
      </div>

      <div className="p-3 bg-white border-t border-gray-100">
        <div className="flex gap-2">
          <input
            ref={inputRef}
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && sendMessage()}
            placeholder="Ask about placements, resumes, interviews..."
            className="flex-1 px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/40 focus:border-indigo-400 transition-all"
          />
          <motion.button
            whileTap={{ scale: 0.9 }}
            onClick={() => sendMessage()}
            disabled={!input.trim() || loading}
            className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-purple-600 text-white rounded-xl flex items-center justify-center shadow-lg hover:shadow-indigo-300 transition-shadow disabled:opacity-50"
          >
            <Send className="w-4 h-4" />
          </motion.button>
        </div>
      </div>
    </div>
  )
}
