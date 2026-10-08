'use client'
/**
 * An account the backend refuses health access to (403 HEALTH_ACCESS_REFUSED).
 *
 * It is a 403, never a 401, on purpose: signing in again cannot change it, so the
 * portal must not send the person to sign in, to activation, or round a retry
 * loop. It shows the backend's own sentence and the reference to quote, and
 * nothing else. The sentence is written server-side so that no client ever has
 * to choose words for why; this file never adds any.
 *
 * Both data clients report a refusal here, and the patient layout listens, so a
 * refusal on ANY request, including one that arrives mid-session after the
 * account was fine a minute ago, replaces the whole patient area.
 */
export const ACCESS_REFUSED = 'HEALTH_ACCESS_REFUSED'

export interface AccessRefusal { message: string | null; reference: string | null }

const EVENT = 'bb-health:access-refused'

/** The refusal in a response body, or null if the body is anything else. */
export function refusalIn(status: number, body: unknown): AccessRefusal | null {
  const b = body as { code?: unknown; message?: unknown; reference?: unknown } | null
  if (status !== 403 || b?.code !== ACCESS_REFUSED) return null
  return {
    message:   typeof b.message === 'string' ? b.message : null,
    reference: typeof b.reference === 'string' ? b.reference : null,
  }
}

export function reportAccessRefused(r: AccessRefusal) {
  if (typeof window !== 'undefined') window.dispatchEvent(new CustomEvent<AccessRefusal>(EVENT, { detail: r }))
}

export function onAccessRefused(fn: (r: AccessRefusal) => void): () => void {
  const listener = (e: Event) => fn((e as CustomEvent<AccessRefusal>).detail)
  window.addEventListener(EVENT, listener)
  return () => window.removeEventListener(EVENT, listener)
}

/** An error thrown by a data client, carrying the refusal when there was one. */
export type HealthRequestError = Error & { status?: number; code?: string; refusal?: AccessRefusal }
