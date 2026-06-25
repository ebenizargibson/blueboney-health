'use client'
import { useEffect, useRef } from 'react'
import { createClient } from '@supabase/supabase-js'

export function useRealtimeMessages(threadId: string | null, onMessage: (msg: unknown) => void) {
  const onMessageRef = useRef(onMessage)
  onMessageRef.current = onMessage

  useEffect(() => {
    if (!threadId) return
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL
    const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
    if (!url || !key) return

    const supabase = createClient(url, key)
    const channel = supabase
      .channel(`messages:${threadId}`)
      .on('postgres_changes', {
        event:  'INSERT',
        schema: 'public',
        table:  'health_messages',
        filter: `thread_id=eq.${threadId}`,
      }, (payload) => onMessageRef.current(payload.new))
      .subscribe()

    return () => { supabase.removeChannel(channel) }
  }, [threadId])
}
