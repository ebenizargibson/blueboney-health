'use client'
import useSWR, { type SWRConfiguration } from 'swr'

async function fetcher(url: string) {
  const res = await fetch(url)
  if (res.status === 401) {
    if (typeof window !== 'undefined') window.location.href = '/login'
    throw Object.assign(new Error('Session expired'), { status: 401 })
  }
  if (!res.ok) {
    const body = await res.json().catch(() => ({}))
    throw Object.assign(new Error(body?.error ?? 'request_failed'), { status: res.status })
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
    ...opts,
  })
  return { data, error, isLoading, mutate }
}
