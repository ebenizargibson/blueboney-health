'use client'
import { useEffect, useState } from 'react'
import { portalAuth } from '@/lib/api'
import { useRouter } from 'next/navigation'

export interface ClientSession {
  userId:    string
  fullName:  string
  phone:     string
  tier:      string
  kycStatus: string
}

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
