'use client'
import useSWR, { type SWRConfiguration } from 'swr'
import { refusalIn, reportAccessRefused, type HealthRequestError } from '@/lib/accessRefused'

async function fetcher(url: string) {
  const res = await fetch(url)
  if (res.status === 401) {
    if (typeof window !== 'undefined') window.location.href = '/login'
    throw Object.assign(new Error('Session expired'), { status: 401 })
  }
  if (!res.ok) {
    const body = await res.json().catch(() => ({}))
    const refusal = refusalIn(res.status, body)
    if (refusal) reportAccessRefused(refusal)
    const err: HealthRequestError = Object.assign(
      new Error(refusal?.message ?? body?.message ?? body?.error ?? 'request_failed'),
      { status: res.status, code: body?.code, refusal: refusal ?? undefined })
    throw err
  }
  return res.json()
}

export function useHealthData<T = unknown>(
  path: string | null,
  params?: Record<string, string | number | undefined>,
  opts?: SWRConfiguration,
) {
  const qs = params
    ? '?' + new URLSearchParams(Object.entries(params).filter(([, v]) => v !== undefined).map(([k, v]) => [k, String(v)])).toString()
    : ''
  const key = path ? `/api/proxy${path}${qs}` : null
  const { data, error, isLoading, mutate } = useSWR<T>(key, fetcher, {
    revalidateOnFocus: false,
    dedupingInterval: 10_000,
    // A 4xx is an answer, not a blip. Retrying a refusal would ask the backend
    // again every few seconds, and every refused ask is audited.
    shouldRetryOnError: (err: HealthRequestError) => !(err.status && err.status >= 400 && err.status < 500),
    ...opts,
  })
  return { data, error, isLoading, mutate }
}
