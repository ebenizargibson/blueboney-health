'use client'
import { use, useState, useEffect, useRef } from 'react'
import { ArrowLeft, Send, Paperclip } from 'lucide-react'
import Link from 'next/link'
import { useHealthData } from '@/lib/hooks/useHealthData'
import { useRealtimeMessages } from '@/lib/hooks/useRealtimeMessages'
import { patientApi } from '@/lib/api'
import { formatDateTime } from '@/lib/utils/formatters'
import { CardSkeleton } from '@/components/shared/LoadingSkeleton'

interface Message { id: string; body: string; sender_type: string; created_at: string; sender_name?: string }
interface Thread { id: string; subject: string; thread_type?: string; status?: string; provider?: { name: string; specialty?: string }; messages: Message[] }

export default function ThreadPage({ params }: { params: Promise<{ threadId: string }> }) {
  const { threadId } = use(params)
  const { data, isLoading, mutate } = useHealthData<{ thread: Thread }>(`/health/messages/threads/${threadId}`)
  const [messages, setMessages] = useState<Message[]>([])
  const [body, setBody] = useState('')
  const [sending, setSending] = useState(false)
  const bottomRef = useRef<HTMLDivElement>(null)
  const thread = data?.thread

  useEffect(() => { if (thread?.messages) setMessages(thread.messages) }, [thread])
  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: 'smooth' }) }, [messages])

  useRealtimeMessages(threadId, (msg) => {
    setMessages(prev => [...prev, msg as Message])
  })

  const send = async () => {
    if (!body.trim() || sending) return
    setSending(true)
    try {
      await patientApi.sendMessage(threadId, { body: body.trim() })
      setBody('')
      mutate()
    } catch {}
    setSending(false)
  }

  if (isLoading) return <div className="space-y-3"><CardSkeleton /><CardSkeleton /></div>
  if (!thread) return <div className="text-center py-16 text-[var(--bb-ink-soft)]">Thread not found</div>

  return (
    <div className="flex flex-col h-[calc(100vh-140px)] max-w-3xl">
      {/* Header */}
      <div className="bg-white rounded-t-[12px] border border-[var(--bb-border)] border-b-0 p-4 flex items-center gap-3 shrink-0">
        <Link href="/patient/messages" className="text-[var(--bb-ink-muted)] hover:text-[var(--bb-ink)] transition-colors">
          <ArrowLeft size={18} />
        </Link>
        <div className="w-8 h-8 rounded-full bg-[var(--h-teal-light)] flex items-center justify-center">
          <span className="text-[11px] font-bold text-[var(--h-teal)]">{(thread.provider?.name ?? 'B').slice(0, 1)}</span>
        </div>
        <div>
          <p className="text-[14px] font-semibold text-[var(--bb-ink)]">{thread.subject}</p>
          {thread.provider && <p className="text-[11px] text-[var(--bb-ink-muted)]">{thread.provider.name}{thread.provider.specialty ? ` · ${thread.provider.specialty}` : ''}</p>}
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto bg-[var(--bb-bg2)] border-x border-[var(--bb-border)] p-4 space-y-3">
        {messages.map(msg => {
          const isPatient = msg.sender_type === 'patient'
          return (
            <div key={msg.id} className={`flex ${isPatient ? 'justify-end' : 'justify-start'}`}>
              <div className={`max-w-[75%] rounded-[12px] px-4 py-3 ${isPatient ? 'bg-[var(--h-teal)] text-white rounded-br-[4px]' : 'bg-white border border-[var(--bb-border)] rounded-bl-[4px]'}`}>
                {!isPatient && <p className="text-[11px] font-semibold mb-1" style={{ color: 'var(--h-teal)' }}>{msg.sender_name ?? thread.provider?.name ?? 'Provider'}</p>}
                <p className="text-[13px] leading-relaxed">{msg.body}</p>
                <p className={`text-[10px] mt-1 ${isPatient ? 'text-white/70' : 'text-[var(--bb-ink-muted)]'}`}>{formatDateTime(msg.created_at)}</p>
              </div>
            </div>
          )
        })}
        <div ref={bottomRef} />
      </div>

      {/* Compose */}
      <div className="bg-white rounded-b-[12px] border border-[var(--bb-border)] border-t-0 p-3 flex items-end gap-2 shrink-0">
        <textarea value={body} onChange={e => setBody(e.target.value)} rows={2}
          onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); send() } }}
          placeholder="Type a message... (Enter to send, Shift+Enter for new line)"
          className="flex-1 rounded-[8px] border border-[var(--bb-border)] bg-[var(--bb-bg)] px-3 py-2 text-[13px] text-[var(--bb-ink)] resize-none focus:outline-none focus:ring-2 focus:ring-[var(--h-teal)] transition-colors" />
        <button onClick={send} disabled={!body.trim() || sending}
          className="w-10 h-10 rounded-[8px] bg-[var(--h-teal)] text-white flex items-center justify-center hover:bg-[var(--h-teal-hover)] transition-colors disabled:opacity-50 shrink-0">
          <Send size={15} />
        </button>
      </div>
    </div>
  )
}
