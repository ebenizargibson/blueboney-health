/**
 * A patient page opens only for a session the API recognises (founder ruling
 * 2026-10-19: the patient portal gets the hospital's gate fix, so a placeholder
 * cookie is refused, not just checked for presence).
 *
 * The gate is transpiled with this repo's TypeScript from whichever file the
 * tree has (proxy.ts, or the middleware.ts it replaced), so this runs against
 * the old code unchanged. The API is a stand-in for fetch that knows one live
 * chart session and one live banking session.
 *
 * Old code fails: middleware.ts opened any patient page when a
 * patient_portal_token cookie was present, whatever its value. Then, until A2-2a
 * retired the banking sign-in (D-A2-3), a banking cookie whose session was live
 * opened a page; now only the chart session does.
 *
 * Run: node --test scripts/test/session-gate.test.mjs
 */
import { test, before, beforeEach, afterEach } from 'node:test'
import assert from 'node:assert/strict'
import { existsSync, mkdirSync, readFileSync, writeFileSync, rmSync } from 'node:fs'
import { join } from 'node:path'
import ts from 'typescript'
import { SignJWT } from 'jose'

const ROOT = join(import.meta.dirname, '..', '..')
const OUT = join(ROOT, 'node_modules', '.cache', 'session-gate-test')
process.env.PATIENT_JWT_SECRET = 'session-gate-test-secret'
process.env.BACKEND_URL = 'https://api.example/api'

const compile = (from, to) => {
  const src = readFileSync(join(ROOT, from), 'utf8')
  let js = ts.transpileModule(src, { compilerOptions: { module: ts.ModuleKind.ESNext, target: ts.ScriptTarget.ES2022 } }).outputText
  js = js.replace(/from ['"](?:\.\/|@\/)lib\/patientAuth['"]/g, "from './lib/patientAuth.mjs'")
    // Node's ESM loader needs the extension: next has no exports map.
    .replace(/from ['"]next\/(server|headers)['"]/g, "from 'next/$1.js'")
  mkdirSync(join(OUT, 'lib'), { recursive: true })
  writeFileSync(join(OUT, to), js)
}

let gate
before(async () => {
  rmSync(OUT, { recursive: true, force: true })
  const file = existsSync(join(ROOT, 'proxy.ts')) ? 'proxy.ts' : 'middleware.ts'
  compile(file, 'gate.mjs')
  compile('lib/patientAuth.ts', 'lib/patientAuth.mjs')
  const mod = await import(join(OUT, 'gate.mjs'))
  gate = mod.proxy ?? mod.middleware
})

const sign = (claims, secret = process.env.PATIENT_JWT_SECRET) =>
  new SignJWT(claims).setProtectedHeader({ alg: 'HS256' }).setIssuedAt().setExpirationTime('1h').sign(new TextEncoder().encode(secret))

const asked = []
const realFetch = globalThis.fetch
beforeEach(() => {
  asked.length = 0
  globalThis.fetch = async (url, init = {}) => {
    asked.push(String(url))
    const h = new Headers(init.headers)
    const live = (String(url).endsWith('/health/session') && h.get('x-health-token') === 'live-health')
      || (String(url).endsWith('/health/status') && h.get('authorization') === 'Bearer live-banking')
    return new Response('{}', { status: live ? 200 : 401 })
  }
})
afterEach(() => { globalThis.fetch = realFetch })

const { NextRequest } = await import('next/server.js')
const page = cookie => new NextRequest('https://health.example/patient/dashboard', cookie ? { headers: { cookie: `patient_portal_token=${cookie}` } } : undefined)
const opens = res => res.headers.get('x-middleware-next') === '1'
const toLogin = res => [302, 307].includes(res.status) && new URL(res.headers.get('location') ?? '', 'https://x').pathname === '/login'

test('a live chart session opens the page (control)', async () => {
  assert.ok(opens(await gate(page(await sign({ kind: 'health', healthPatientId: 'p', fullName: 'P', healthToken: 'live-health', expiresAt: '' })))))
  assert.ok(asked.some(u => u.endsWith('/health/session')), 'the API was not asked')
})

test('refused, and sent to sign in', async () => {
  const cases = {
    'no cookie': undefined,
    'a placeholder': 'placeholder',
    'a token signed with another secret': await sign({ kind: 'health', healthToken: 'live-health' }, 'not-the-portal-secret'),
    'a signed token whose chart session has ended': await sign({ kind: 'health', healthPatientId: 'p', fullName: 'P', healthToken: 'ended', expiresAt: '' }),
    'a signed token whose banking session has ended': await sign({ kind: 'banking', userId: 'u', fullName: 'U', phone: '', tier: '', kycStatus: '', token: 'ended' }),
    'a signed banking cookie whose session is live (A2-2a)': await sign({ kind: 'banking', userId: 'u', fullName: 'U', phone: '', tier: '', kycStatus: '', token: 'live-banking' }),
  }
  for (const [why, cookie] of Object.entries(cases)) {
    const res = await gate(page(cookie))
    assert.ok(toLogin(res), `${why}: status ${res.status}, location ${res.headers.get('location')}`)
  }
  assert.ok(!asked.some(u => u.endsWith('/health/status')), 'the gate asked about a banking session')
})

test('refused when the API cannot be reached', async () => {
  globalThis.fetch = async () => { throw new Error('unreachable') }
  const res = await gate(page(await sign({ kind: 'health', healthPatientId: 'p', fullName: 'P', healthToken: 'live-health', expiresAt: '' })))
  assert.ok(toLogin(res))
})
