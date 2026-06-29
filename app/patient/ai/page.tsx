'use client'
import { useState, useRef, useEffect } from 'react'
import { Send, Bot, User, Sparkles } from 'lucide-react'
import { patientApi } from '@/lib/api'

interface Message { role: 'user' | 'assistant'; content: string; ts: string }

export default function AIChatPage() {
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput]       = useState('')
  const [loading, setLoading]   = useState(false)
  const [historyLoaded, setHistoryLoaded] = useState(false)
  const bottomRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    patientApi.aiHistory()
      .then((res) => {
        const r = res as { history?: Message[] }
        if (r.history?.length) setMessages(r.history)
      })
      .catch(() => {})
      .finally(() => setHistoryLoaded(true))
  }, [])

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const send = async () => {
    const text = input.trim()
    if (!text || loading) return
    const userMsg: Message = { role: 'user', content: text, ts: new Date().toISOString() }
    setMessages(m => [...m, userMsg])
    setInput('')
    setLoading(true)
    try {
      const res = await patientApi.aiChat(text) as { reply?: string; response?: string }
      const reply = res.reply ?? res.response ?? 'Sorry, I could not generate a response.'
      setMessages(m => [...m, { role: 'assistant', content: reply, ts: new Date().toISOString() }])
    } catch {
      setMessages(m => [...m, { role: 'assistant', content: 'I\'m having trouble connecting right now. Please try again.', ts: new Date().toISOString() }])
    }
    setLoading(false)
  }

  return (
    <div className="flex flex-col h-[calc(100vh-5rem)]">
      {/* Header */}
      <div className="flex items-center gap-3 mb-4">
        <div className="w-10 h-10 rounded-[10px] bg-gradient-to-br from-[var(--h-teal)] to-[var(--bb-blue)] flex items-center justify-center shrink-0">
          <Sparkles size={18} color="white" />
        </div>
        <div>
          <h1 className="text-[18px] font-bold text-[var(--bb-ink)]">Blue Boney Health AI</h1>
          <p className="text-[12px] text-[var(--bb-ink-muted)]">Powered by Claude · Not a substitute for medical advice</p>
        </div>
      </div>

      {/* Chat area */}
      <div className="flex-1 overflow-y-auto space-y-4 pb-4">
        {!historyLoaded && (
          <div className="flex justify-center py-8">
            <div className="w-6 h-6 border-2 border-[var(--h-teal)] border-t-transparent rounded-full animate-spin" />
          </div>
        )}

        {historyLoaded && messages.length === 0 && (
          <div className="flex flex-col items-center justify-center h-full text-center py-12 gap-4">
            <div className="w-16 h-16 rounded-[16px] bg-gradient-to-br from-[var(--h-teal)] to-[var(--bb-blue)] flex items-center justify-center shadow-[0_4px_16px_rgba(8,145,178,0.25)]">
              <Sparkles size={28} color="white" />
            </div>
            <div>
              <p className="text-[15px] font-bold text-[var(--bb-ink)]">Ask me anything about your health</p>
              <p className="text-[13px] text-[var(--bb-ink-soft)] mt-1 max-w-xs">
                I can help you understand symptoms, medications, lab results, and more.
              </p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 w-full max-w-md mt-2">
              {[
                'What does my blood pressure reading mean?',
                'How should I take my medication?',
                'When should I see a doctor for a fever?',
                'Help me understand my lab results',
              ].map(q => (
                <button key={q} onClick={() => { setInput(q); setTimeout(send, 50) }}
                  className="text-left p-3 rounded-[10px] border border-[var(--bb-border)] bg-white text-[12px] text-[var(--bb-ink-soft)] hover:border-[var(--h-teal)] hover:text-[var(--h-teal)] transition-colors">
                  {q}
                </button>
              ))}
            </div>
          </div>
        )}

        {messages.map((m, i) => (
          <div key={i} className={`flex gap-3 ${m.role === 'user' ? 'flex-row-reverse' : ''}`}>
            <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${m.role === 'assistant' ? 'bg-gradient-to-br from-[var(--h-teal)] to-[var(--bb-blue)]' : 'bg-[var(--bb-bg2)] border border-[var(--bb-border)]'}`}>
              {m.role === 'assistant' ? <Bot size={15} color="white" /> : <User size={15} color="var(--bb-ink-muted)" />}
            </div>
            <div className={`max-w-[75%] rounded-[12px] px-4 py-3 text-[13px] leading-relaxed ${m.role === 'assistant' ? 'bg-white border border-[var(--bb-border)] text-[var(--bb-ink)]' : 'bg-[var(--h-teal)] text-white'}`}>
              {m.content}
            </div>
          </div>
        ))}

        {loading && (
          <div className="flex gap-3">
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[var(--h-teal)] to-[var(--bb-blue)] flex items-center justify-center shrink-0">
              <Bot size={15} color="white" />
            </div>
            <div className="bg-white border border-[var(--bb-border)] rounded-[12px] px-4 py-3 flex gap-1 items-center">
              {[0, 1, 2].map(i => (
                <span key={i} className="w-2 h-2 bg-[var(--bb-ink-muted)] rounded-full animate-bounce" style={{ animationDelay: `${i * 0.15}s` }} />
              ))}
            </div>
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <div className="flex gap-2 pt-3 border-t border-[var(--bb-border)]">
        <input
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && !e.shiftKey && send()}
          placeholder="Ask a health question…"
          className="flex-1 h-11 px-4 rounded-[10px] border border-[var(--bb-border)] bg-white text-[13px] text-[var(--bb-ink)] focus:outline-none focus:ring-2 focus:ring-[var(--h-teal)] transition-colors"
        />
        <button onClick={send} disabled={!input.trim() || loading}
          className="w-11 h-11 rounded-[10px] bg-[var(--h-teal)] flex items-center justify-center hover:bg-[var(--h-teal-hover)] transition-colors disabled:opacity-50 disabled:cursor-not-allowed">
          <Send size={16} color="white" />
        </button>
      </div>
      <p className="text-[11px] text-center text-[var(--bb-ink-muted)] mt-2">
        Not a substitute for professional medical advice. Always consult your care team.
      </p>
    </div>
  )
}
