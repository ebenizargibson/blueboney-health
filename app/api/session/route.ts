import { NextRequest, NextResponse } from 'next/server'
import { getPatientSession } from '@/lib/patientAuth'

export async function GET(req: NextRequest) {
  const session = await getPatientSession(req)
  if (!session) return NextResponse.json({ session: null })
  return NextResponse.json({
    session: { kind: 'health', healthPatientId: session.healthPatientId, fullName: session.fullName },
  })
}
