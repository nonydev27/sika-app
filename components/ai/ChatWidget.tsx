'use client'

import { useState, useRef, useEffect } from 'react'
import { MessageCircle, X, Send } from 'lucide-react'

interface Message {
  role: 'user' | 'assistant'
  content: string
}

const QUICK_PROMPTS = [
  'How am I spending this month?',
  'Tips to save on transport?',
  'Help me create a budget',
  'How much have I spent on food?',
]

export default function ChatWidget() {
  const [isOpen, setIsOpen] = useState(false)
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState('')
  const [streaming, setStreaming] = useState(false)
  const conversationIdRef = useRef<string | null>(null)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  useEffect(() => {
    if (isOpen && messages.length === 0) {
      setMessages([
        {
          role: 'assistant',
          content: "Hello! I'm Cedi, your personal finance assistant. Ask me anything about your budget, spending, or how to save money as a student in Ghana.",
        },
      ])
    }
    if (isOpen) setTimeout(() => inputRef.current?.focus(), 100)
  }, [isOpen])

  const send = async (text?: string) => {
    const msg = (text ?? input).trim()
    if (!msg || streaming) return
    setInput('')
    setMessages((prev) => [...prev, { role: 'user', content: msg }])
    setStreaming(true)

    try {
      const response = await fetch('/api/ai', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: msg, conversationId: conversationIdRef.current }),
      })

      if (!response.ok) throw new Error('Failed to get response')

      const convId = response.headers.get('X-Conversation-Id')
      if (convId) conversationIdRef.current = convId

      const reader = response.body!.getReader()
      const decoder = new TextDecoder()
      let assistantMsg = ''

      setMessages((prev) => [...prev, { role: 'assistant', content: '' }])

      while (true) {
        const { done, value } = await reader.read()
        if (done) break
        assistantMsg += decoder.decode(value, { stream: true })
        setMessages((prev) => {
          const updated = [...prev]
          updated[updated.length - 1] = { role: 'assistant', content: assistantMsg }
          return updated
        })
      }
    } catch {
      setMessages((prev) => [
        ...prev,
        { role: 'assistant', content: 'Sorry, I had trouble responding. Please try again.' },
      ])
    } finally {
      setStreaming(false)
    }
  }

  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-24 md:bottom-8 right-6 w-14 h-14 bg-primary-dark hover:bg-primary-mid rounded-full shadow-xl flex items-center justify-center z-50 transition-colors"
        title="Chat with Cedi AI"
      >
        <MessageCircle size={22} className="text-white" />
      </button>
    )
  }

  return (
    <div className="fixed bottom-24 md:bottom-8 right-4 w-[340px] md:w-[380px] h-[520px] bg-white rounded-2xl shadow-2xl flex flex-col z-50 border border-gray-100 overflow-hidden">
      {/* Header */}
      <div className="bg-primary-dark px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center text-sm font-bold text-white">₵</div>
          <div>
            <p className="text-white text-sm font-semibold">Cedi AI</p>
            <p className="text-primary-light text-xs">Your budget assistant</p>
          </div>
        </div>
        <button onClick={() => setIsOpen(false)} className="text-primary-light hover:text-white transition-colors">
          <X size={16} />
        </button>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3 bg-gray-50">
        {messages.map((msg, i) => (
          <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div
              className={`max-w-[85%] px-4 py-2.5 rounded-2xl text-sm leading-relaxed ${
                msg.role === 'user'
                  ? 'bg-primary text-white rounded-br-sm'
                  : 'bg-white text-gray-800 shadow-sm rounded-bl-sm border border-gray-100'
              }`}
            >
              {msg.content || (streaming && i === messages.length - 1 ? (
                <span className="inline-flex gap-1 items-center h-4">
                  <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                  <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                  <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                </span>
              ) : '')}
            </div>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      {/* Quick prompts */}
      {messages.length <= 1 && (
        <div className="px-4 py-2 flex gap-2 overflow-x-auto border-t border-gray-100 bg-white">
          {QUICK_PROMPTS.map((p) => (
            <button
              key={p}
              onClick={() => send(p)}
              className="flex-shrink-0 text-xs bg-primary-light/40 text-primary-dark px-3 py-1.5 rounded-full hover:bg-primary-light transition-colors"
            >
              {p}
            </button>
          ))}
        </div>
      )}

      {/* Input */}
      <div className="px-4 py-3 border-t border-gray-100 bg-white flex gap-2">
        <input
          ref={inputRef}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && send()}
          placeholder="Ask Cedi anything…"
          disabled={streaming}
          className="flex-1 border border-gray-200 rounded-xl px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent disabled:opacity-50"
        />
        <button
          onClick={() => send()}
          disabled={!input.trim() || streaming}
          className="w-10 h-10 bg-primary hover:bg-primary-mid disabled:opacity-40 rounded-xl flex items-center justify-center text-white transition-colors flex-shrink-0"
        >
          <Send size={15} />
        </button>
      </div>
    </div>
  )
}
