'use client'
import { use, useEffect, useRef, useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { Mic, MicOff, Video, VideoOff, PhoneOff, MessageSquare, Settings } from 'lucide-react'
import { createClient, type RealtimeChannel, type SupabaseClient } from '@supabase/supabase-js'
import { patientApi } from '@/lib/api'
import { useHealthData } from '@/lib/hooks/useHealthData'

// ── Types ────────────────────────────────────────────────────────────────────
type Turn = { username: string; credential: string; uris: string[] }
type Session = {
  id: string; status: string; room_id: string
  provider_name?: string; turn_credentials?: Turn
}
type Signal =
  | { type: 'offer';  sdp: string;  from: string }
  | { type: 'answer'; sdp: string;  from: string }
  | { type: 'ice';    candidate: RTCIceCandidateInit; from: string }
  | { type: 'ready' }

// ── useWebRTC ────────────────────────────────────────────────────────────────
function useWebRTC(sessionId: string, turn: Turn | null) {
  const [localStream,  setLocalStream]  = useState<MediaStream | null>(null)
  const [remoteStream, setRemoteStream] = useState<MediaStream | null>(null)
  const [micOn,  setMicOn]  = useState(true)
  const [camOn,  setCamOn]  = useState(true)
  const [mediaError, setMediaError] = useState<string | null>(null)
  const [connected,  setConnected]  = useState(false)

  const pcRef       = useRef<RTCPeerConnection | null>(null)
  const channelRef  = useRef<RealtimeChannel | null>(null)
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const supabaseRef = useRef<SupabaseClient<any> | null>(null)
  const localRef    = useRef<MediaStream | null>(null)
  const pendingRef  = useRef<RTCIceCandidateInit[]>([])
  const turnRef     = useRef<Turn | null>(turn)
  turnRef.current   = turn

  // Stable send helper — reads channelRef at call time
  const sendRef = useRef<(payload: Signal) => void>(() => undefined)
  sendRef.current = useCallback((payload: Signal) => {
    channelRef.current?.send({ type: 'broadcast', event: 'signal', payload })
  }, [])

  // Signal handler — uses refs to avoid stale closures
  const handleSignal = useRef(async (msg: Signal) => {
    const pc = pcRef.current
    if (!pc) return

    if (msg.type === 'ready') {
      // We're the caller — create and send an offer
      const offer = await pc.createOffer()
      await pc.setLocalDescription(offer)
      sendRef.current({ type: 'offer', sdp: offer.sdp!, from: 'patient' })
    } else if (msg.type === 'offer') {
      // Defensive: handle being a callee too
      await pc.setRemoteDescription(new RTCSessionDescription({ type: 'offer', sdp: msg.sdp }))
      const ans = await pc.createAnswer()
      await pc.setLocalDescription(ans)
      sendRef.current({ type: 'answer', sdp: ans.sdp!, from: 'patient' })
      for (const c of pendingRef.current) await pc.addIceCandidate(new RTCIceCandidate(c))
      pendingRef.current = []
    } else if (msg.type === 'answer') {
      await pc.setRemoteDescription(new RTCSessionDescription({ type: 'answer', sdp: msg.sdp }))
      for (const c of pendingRef.current) await pc.addIceCandidate(new RTCIceCandidate(c))
      pendingRef.current = []
    } else if (msg.type === 'ice') {
      if (pc.remoteDescription) {
        await pc.addIceCandidate(new RTCIceCandidate(msg.candidate))
      } else {
        pendingRef.current.push(msg.candidate)
      }
    }
  })

  useEffect(() => {
    if (!sessionId) return
    let gone = false

    ;(async () => {
      // 1. Get user media
      let stream: MediaStream
      try {
        stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true })
      } catch (err: unknown) {
        const e = err as DOMException
        setMediaError(
          e.name === 'NotAllowedError'
            ? 'Camera and microphone access was denied. Please allow access and reload.'
            : `Could not access camera/microphone: ${e.message}`,
        )
        return
      }
      if (gone) { stream.getTracks().forEach(t => t.stop()); return }
      localRef.current = stream
      setLocalStream(stream)

      // 2. Create RTCPeerConnection with STUN + TURN
      const iceServers: RTCIceServer[] = [{ urls: 'stun:stun.l.google.com:19302' }]
      const t = turnRef.current
      if (t) iceServers.push({ urls: t.uris, username: t.username, credential: t.credential })
      const pc = new RTCPeerConnection({ iceServers })
      pcRef.current = pc
      stream.getTracks().forEach(track => pc.addTrack(track, stream))

      pc.ontrack = e => {
        if (e.streams[0]) { setRemoteStream(e.streams[0]); setConnected(true) }
      }
      pc.onicecandidate = e => {
        if (e.candidate) {
          sendRef.current({ type: 'ice', candidate: e.candidate.toJSON(), from: 'patient' })
        }
      }

      // 3. Subscribe to Supabase Realtime channel for signaling
      const sb = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      )
      supabaseRef.current = sb
      const ch = sb.channel(`telehealth:${sessionId}`)
      channelRef.current = ch

      ch.on('broadcast', { event: 'signal' }, ({ payload }) => {
        handleSignal.current(payload as Signal).catch(console.error)
      })
      ch.subscribe(status => {
        if (status === 'SUBSCRIBED') {
          // Signal readiness; if provider is already waiting, they'll send an offer
          // If provider joins later, they'll broadcast 'ready' and we'll send the offer
          sendRef.current({ type: 'ready' })
        }
      })
    })()

    return () => {
      gone = true
      localRef.current?.getTracks().forEach(t => t.stop())
      pcRef.current?.close()
      if (channelRef.current && supabaseRef.current) {
        supabaseRef.current.removeChannel(channelRef.current)
      }
    }
  }, [sessionId]) // turn read via turnRef at init time

  const toggleMic = useCallback(() => {
    localRef.current?.getAudioTracks().forEach(t => { t.enabled = !t.enabled })
    setMicOn(v => !v)
  }, [])

  const toggleCam = useCallback(() => {
    localRef.current?.getVideoTracks().forEach(t => { t.enabled = !t.enabled })
    setCamOn(v => !v)
  }, [])

  const cleanup = useCallback(() => {
    localRef.current?.getTracks().forEach(t => t.stop())
    pcRef.current?.close()
    if (channelRef.current && supabaseRef.current) {
      supabaseRef.current.removeChannel(channelRef.current)
    }
  }, [])

  return { localStream, remoteStream, micOn, camOn, connected, mediaError, toggleMic, toggleCam, cleanup }
}

// ── VideoEl ───────────────────────────────────────────────────────────────────
function VideoEl({ stream, muted = false, className }: {
  stream: MediaStream | null; muted?: boolean; className?: string
}) {
  const ref = useRef<HTMLVideoElement>(null)
  useEffect(() => { if (ref.current) ref.current.srcObject = stream }, [stream])
  return <video ref={ref} autoPlay playsInline muted={muted} className={className} />
}

// ── Page ──────────────────────────────────────────────────────────────────────
export default function TelehealthSessionPage({ params }: { params: Promise<{ sessionId: string }> }) {
  const { sessionId } = use(params)
  const router = useRouter()
  const { data } = useHealthData<{ session: Session }>(`/health/telehealth/session/${sessionId}`)
  const session = data?.session

  const [ending,   setEnding]   = useState(false)
  const [showChat, setShowChat] = useState(false)

  const { localStream, remoteStream, micOn, camOn, connected, mediaError, toggleMic, toggleCam, cleanup } =
    useWebRTC(session ? sessionId : '', session?.turn_credentials ?? null)

  const handleEndCall = async () => {
    setEnding(true)
    cleanup()
    try { await patientApi.endSession(sessionId) } finally { router.push('/patient/telehealth') }
  }

  if (!session) return (
    <div className="h-[70vh] flex items-center justify-center text-[var(--bb-ink-soft)]">
      Loading session...
    </div>
  )

  if (mediaError) return (
    <div className="h-[70vh] flex flex-col items-center justify-center gap-4 text-center px-6">
      <VideoOff size={40} className="text-[var(--h-danger)]" />
      <p className="text-white font-semibold">Camera / Microphone Required</p>
      <p className="text-[var(--bb-ink-muted)] text-sm max-w-xs">{mediaError}</p>
      <button onClick={() => router.push('/patient/telehealth')}
        className="mt-2 px-4 py-2 rounded-lg bg-[var(--h-danger)] text-white text-sm">
        Leave
      </button>
    </div>
  )

  return (
    <div className="flex flex-col h-[calc(100vh-var(--topbar-h))] -m-6 bg-[#0F1923]">
      {/* Video area */}
      <div className="flex-1 relative">
        {/* Remote (provider) full-screen */}
        {remoteStream ? (
          <VideoEl stream={remoteStream} className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full bg-[#1A2533] flex items-center justify-center">
            <div className="text-center">
              <div className="w-24 h-24 rounded-full bg-[var(--h-teal-dark)] flex items-center justify-center mx-auto mb-3">
                <span className="text-[32px] font-bold text-white">
                  {(session.provider_name ?? 'P').charAt(0)}
                </span>
              </div>
              <p className="text-white font-semibold">{session.provider_name ?? 'Provider'}</p>
              <p className="text-[var(--bb-ink-muted)] text-[13px] mt-1">
                {connected ? 'Connecting video...' : 'Waiting for provider to join...'}
              </p>
            </div>
          </div>
        )}

        {/* Self-view PiP — bottom-right */}
        <div className="absolute bottom-4 right-4 w-36 h-24 rounded-[10px] overflow-hidden border border-white/20 bg-[#2A3A4A]">
          {localStream && camOn
            ? <VideoEl stream={localStream} muted className="w-full h-full object-cover" />
            : <div className="w-full h-full flex items-center justify-center">
                <VideoOff size={20} color="white" opacity={0.5} />
              </div>
          }
        </div>
      </div>

      {/* Controls */}
      <div className="bg-[#0F1923] py-5 flex items-center justify-center gap-4 border-t border-white/10">
        <button onClick={toggleMic}
          className={`w-12 h-12 rounded-full flex items-center justify-center transition-colors ${micOn ? 'bg-white/15 hover:bg-white/25' : 'bg-[var(--h-danger)]'}`}>
          {micOn ? <Mic size={20} color="white" /> : <MicOff size={20} color="white" />}
        </button>

        <button onClick={toggleCam}
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
    </div>
  )
}
