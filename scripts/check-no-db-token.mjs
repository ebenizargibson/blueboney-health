#!/usr/bin/env node
/**
 * The patient portal holds no database token and builds no Supabase client
 * (founder rulings 2026-10-19: live updates go through the health API, and no app
 * holds a database token, on either side).
 *
 * Fails on any import of @supabase/supabase-js, a postgres_changes subscription,
 * a realtime.setAuth call, or a request for a realtime token. The last client,
 * the telehealth page's public broadcast channel, was removed as a security fix.
 *
 * Run: node scripts/check-no-db-token.mjs
 */
import { readFileSync, readdirSync, statSync } from 'node:fs'
import { join } from 'node:path'

const DIRS = ['app', 'lib', 'components', 'hooks']
const files = []
const walk = d => { for (const e of readdirSync(d)) { const p = join(d, e); if (statSync(p).isDirectory()) walk(p); else if (/\.(ts|tsx|js|jsx)$/.test(e)) files.push(p) } }
for (const d of DIRS) { try { walk(d) } catch { /* absent */ } }

// Control: the scan reads the pages it should.
if (!files.some(f => f.includes(join('app', 'patient', 'messages')))) {
  console.error('No-database-token check CANNOT RUN — the scan did not reach app/patient/messages.')
  process.exit(2)
}

const bad = files.filter(f => /@supabase\/supabase-js|postgres_changes|realtime\.setAuth|realtime-token|\.channel\(/.test(readFileSync(f, 'utf8')))
if (bad.length) {
  console.error('No-database-token check FAILED — these build a Supabase client, subscribe, or take a token:')
  for (const f of bad) console.error(`  ${f}`)
  process.exit(1)
}
console.log(`No-database-token check OK — ${files.length} files; none builds a Supabase client or takes a database token.`)
