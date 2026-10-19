'use client'
import { use } from 'react'
import Link from 'next/link'
import { ArrowLeft, VideoOff } from 'lucide-react'
import { useHealthData } from '@/lib/hooks/useHealthData'

// Video visits cannot start from the portal yet.
//
// This page used to signal the call over a public Supabase broadcast channel
// named after the session, with the public key. No provider-side code joined it,
// so no call ever connected, and anyone holding the public key and a session id
// could join the channel and answer the offer. It was removed as a security fix
// (founder ruling 2026-10-19); the proper design belongs to the media work. With
// it went the "End call" button, which ended the session and released the
// visit's escrow for a call that had never connected.

type Session = { id: string; status: string; provider_name?: string }

export default function TelehealthSessionPage({ params }: { params: Promise<{ sessionId: string }> }) {
  const { sessionId } = use(params)
  const { data, isLoading } = useHealthData<{ session: Session }>(`/health/telehealth/session/${sessionId}`)
  const session = data?.session

  if (isLoading) return (
    <div className="h-[50vh] flex items-center justify-center text-[var(--bb-ink-soft)]">Loading visit...</div>
  )

  return (
    <div className="max-w-xl mx-auto py-10 px-4 text-center">
      <div className="w-14 h-14 rounded-full bg-[var(--h-teal-light)] flex items-center justify-center mx-auto mb-4">
        <VideoOff size={24} color="var(--h-teal)" />
      </div>
      <h1 className="text-[18px] font-bold text-[var(--bb-ink)]">
        {session?.provider_name ? `Visit with ${session.provider_name}` : 'Telehealth visit'}
      </h1>
      <p className="text-[14px] text-[var(--bb-ink-muted)] mt-3">
        Video visits cannot start from the portal yet. Your provider will contact you about this visit.
      </p>
      <Link href="/patient/telehealth"
        className="inline-flex items-center gap-2 mt-6 h-11 px-5 rounded-[10px] border border-[var(--bb-border)] text-[14px] font-semibold text-[var(--bb-ink)] hover:bg-[var(--bb-bg2)] transition-colors">
        <ArrowLeft size={16} /> Back to visits
      </Link>
    </div>
  )
}
