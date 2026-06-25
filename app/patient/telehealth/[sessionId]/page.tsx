'use client'
import { use, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Mic, MicOff, Video, VideoOff, PhoneOff, MessageSquare, Settings } from 'lucide-react'
import { useHealthData } from '@/lib/hooks/useHealthData'
import { patientApi } from '@/lib/api'

interface Session { id: string; status: string; provider_name?: string; session_token?: string; started_at?: string }

export default function TelehealthSessionPage({ params }: { params: Promise<{ sessionId: string }> }) {
  const { sessionId } = use(params)
  const router = useRouter()
  const { data } = useHealthData<{ session: Session }>(`/health/telehealth/session/${sessionId}`)
  const session = data?.session

  const [micOn,   setMicOn]   = useState(true)
  const [camOn,   setCamOn]   = useState(true)
  const [ending,  setEnding]  = useState(false)
  const [showChat, setShowChat] = useState(false)

  const handleEndCall = async () => {
    setEnding(true)
    try {
      await patientApi.endSession(sessionId)
    } finally {
      router.push('/patient/telehealth')
    }
  }

  if (!session) {
    return (
      <div className="h-[70vh] flex items-center justify-center text-[var(--bb-ink-soft)]">
        Loading session...
      </div>
    )
  }

  return (
    <div className="flex flex-col h-[calc(100vh-var(--topbar-h))] -m-6 bg-[#0F1923]">
      {/* Video area */}
      <div className="flex-1 relative flex items-center justify-center">
        {/* Provider video placeholder */}
        <div className="w-full h-full bg-[#1A2533] flex items-center justify-center">
          <div className="text-center">
            <div className="w-24 h-24 rounded-full bg-[var(--h-teal-dark)] flex items-center justify-center mx-auto mb-3">
              <span className="text-[32px] font-bold text-white">
                {(session.provider_name ?? 'P').charAt(0)}
              </span>
            </div>
            <p className="text-white font-semibold">{session.provider_name ?? 'Provider'}</p>
            <p className="text-[var(--bb-ink-muted)] text-[13px] mt-1">
              {session.status === 'waiting' ? 'Waiting for provider to join...' : 'Connected'}
            </p>
          </div>
        </div>

        {/* Patient self-view */}
        <div className="absolute bottom-4 right-4 w-36 h-24 rounded-[10px] bg-[#2A3A4A] border border-white/20 flex items-center justify-center">
          {camOn
            ? <p className="text-white/60 text-[11px]">Your camera</p>
            : <VideoOff size={20} color="white" opacity={0.5} />
          }
        </div>
      </div>

      {/* Controls */}
      <div className="bg-[#0F1923] py-5 flex items-center justify-center gap-4 border-t border-white/10">
        <button onClick={() => setMicOn(m => !m)}
          className={`w-12 h-12 rounded-full flex items-center justify-center transition-colors ${micOn ? 'bg-white/15 hover:bg-white/25' : 'bg-[var(--h-danger)]'}`}>
          {micOn ? <Mic size={20} color="white" /> : <MicOff size={20} color="white" />}
        </button>

        <button onClick={() => setCamOn(c => !c)}
          className={`w-12 h-12 rounded-full flex items-center justify-center transition-colors ${camOn ? 'bg-white/15 hover:bg-white/25' : 'bg-[var(--h-danger)]'}`}>
          {camOn ? <Video size={20} color="white" /> : <VideoOff size={20} color="white" />}
        </button>

        <button onClick={handleEndCall} disabled={ending}
          className="w-14 h-14 rounded-full bg-[var(--h-danger)] flex items-center justify-center hover:bg-red-700 transition-colors shadow-lg disabled:opacity-60">
          <PhoneOff size={22} color="white" />
        </button>

        <button onClick={() => setShowChat(c => !c)}
          className={`w-12 h-12 rounded-full flex items-center justify-center transition-colors ${showChat ? 'bg-[var(--h-teal)]' : 'bg-white/15 hover:bg-white/25'}`}>
          <MessageSquare size={20} color="white" />
        </button>

        <button className="w-12 h-12 rounded-full bg-white/15 hover:bg-white/25 flex items-center justify-center transition-colors">
          <Settings size={20} color="white" />
        </button>
      </div>

      {/* Note: Real WebRTC integration requires mediasoup-client and the media server.
         The session_token from the API connects to NEXT_PUBLIC_MEDIA_SERVER_URL. */}
    </div>
  )
}
