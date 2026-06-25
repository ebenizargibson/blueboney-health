'use client'
import useSWR, { type SWRConfiguration } from 'swr'

async function fetcher(url: string) {
  const res = await fetch(url)
  if (!res.ok) throw new Error('fetch failed')
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
