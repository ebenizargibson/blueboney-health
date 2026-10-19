#!/usr/bin/env node
/**
 * The patient portal holds no database token and subscribes to no table
 * (founder ruling D-A2-10, 2026-10-19: live updates go through the health API).
 *
 * Fails on a postgres_changes subscription, a realtime.setAuth call, or a request
 * for a realtime token. A file that still builds a Supabase client for something
 * else is named, not passed over in silence.
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

const bad = [], clients = []
for (const f of files) {
  const src = readFileSync(f, 'utf8')
  if (/postgres_changes|realtime\.setAuth|realtime-token/.test(src)) bad.push(f)
  else if (/@supabase\/supabase-js/.test(src)) clients.push(f)
}
if (bad.length) {
  console.error('No-database-token check FAILED — these subscribe to the database or take a token for it:')
  for (const f of bad) console.error(`  ${f}`)
  process.exit(1)
}
console.log(`No-database-token check OK — ${files.length} files, none subscribes to a table or takes a database token.`)
for (const f of clients) console.log(`  Still builds a Supabase client (not a table subscription; recorded): ${f}`)
