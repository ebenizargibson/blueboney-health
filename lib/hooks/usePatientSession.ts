'use client'
import { useEffect, useState } from 'react'
import { portalAuth } from '@/lib/api'
import { useRouter } from 'next/navigation'

/**
 * Signed in to the chart a clinic registered, with no banking account (P2); only
 * health pages work for it. The portal's only session since the banking sign-in
 * was retired (A2-2a).
 */
export type ClientSession = { kind: 'health'; healthPatientId: string; fullName: string }

export function usePatientSession() {
  const [session, setSession] = useState<ClientSession | null | undefined>(undefined)
  const router = useRouter()

  useEffect(() => {
    portalAuth.session().then((res: { session: ClientSession | null }) => {
      setSession(res.session)
      if (!res.session) router.push('/login')
    }).catch(() => {
      setSession(null)
      router.push('/login')
    })
  }, [router])

  return { session, loading: session === undefined }
}
