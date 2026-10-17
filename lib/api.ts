'use client'
import { refusalIn, reportAccessRefused } from '@/lib/accessRefused'

const BASE = '/api/proxy'

async function req<T = unknown>(method: string, path: string, body?: unknown, headers?: Record<string, string>): Promise<T> {
  const res = await fetch(`${BASE}${path}`, {
    method,
    headers: { 'Content-Type': 'application/json', ...headers },
    ...(body !== undefined ? { body: JSON.stringify(body) } : {}),
  })
  if (res.status === 401) {
    if (typeof window !== 'undefined') window.location.href = '/login'
    throw new Error('Session expired')
  }
  const data = await res.json()
  if (!res.ok) {
    const refusal = refusalIn(res.status, data)
    if (refusal) reportAccessRefused(refusal)
    throw Object.assign(new Error(refusal?.message ?? data?.message ?? data?.error ?? 'request_failed'),
      { status: res.status, code: data?.code, data, refusal: refusal ?? undefined })
  }
  return data as T
}

function get<T = unknown>(path: string, params?: Record<string, string | number | undefined>) {
  const url = params
    ? `${path}?${new URLSearchParams(Object.entries(params).filter(([, v]) => v !== undefined).map(([k, v]) => [k, String(v)])).toString()}`
    : path
  return req<T>('GET', url)
}
function post<T = unknown>(path: string, body: unknown, idem?: string) {
  return req<T>('POST', path, body, idem ? { 'Idempotency-Key': idem } : undefined)
}
function patch<T = unknown>(path: string, body: unknown) { return req<T>('PATCH', path, body) }
function del<T = unknown>(path: string) { return req<T>('DELETE', path) }

export const patientApi = {
  // Profile
  profile:           ()             => get('/health/profile'),
  updateProfile:     (d: unknown)   => patch('/health/profile', d),
  status:            ()             => get('/health/status'),

  // Appointments
  appointments:      (p?: Record<string, string | number | undefined>) => get('/health/appointments', p),
  upcoming:          ()             => get('/health/appointments/upcoming'),
  appointment:       (id: string)   => get(`/health/appointments/${id}`),
  bookAppointment:   (d: unknown, idem?: string) => post('/health/appointments', d, idem),
  cancelAppointment: (id: string, d: unknown) => patch(`/health/appointments/${id}`, { ...d as object, action: 'cancel' }),
  rescheduleAppt:    (id: string, d: unknown) => patch(`/health/appointments/${id}`, { ...d as object, action: 'reschedule' }),
  submitIntake:      (id: string, d: unknown) => post(`/health/appointments/${id}/intake`, d),
  appointmentSlots:  (pid: string, d: string) => get(`/health/providers/${pid}/slots`, { date: d }),

  // Find Care / Providers
  providers:         (p?: Record<string, string | number | undefined>) => get('/health/providers', p),
  provider:          (id: string)   => get(`/health/providers/${id}`),

  // Telehealth
  createSession:     (d: unknown)   => post('/health/telehealth/session', d),
  telehealthSession: (id: string)   => get(`/health/telehealth/session/${id}`),
  endSession:        (id: string)   => post(`/health/telehealth/session/${id}/end`, {}),

  // Records
  encounters:        (p?: Record<string, string | number | undefined>) => get('/health/records/encounters', p),
  conditions:        ()             => get('/health/records/conditions'),
  carePlans:         ()             => get('/health/records/care-plans'),
  observations:      (p?: Record<string, string | number | undefined>) => get('/health/records/observations', p),
  referrals:         ()             => get('/health/records/referrals'),
  grantAccess:       (d: unknown)   => post('/health/records/access', d),
  revokeAccess:      (pid: string)  => patch(`/health/records/access/${pid}`, { action: 'revoke' }),
  exportRecords:     (d: unknown)   => post('/health/records/export', d),

  // Documents
  documents:         (p?: Record<string, string | number | undefined>) => get('/health/records/documents', p),
  uploadDocument:    (d: unknown)   => post('/health/records/documents', d),
  deleteDocument:    (id: string)   => del(`/health/records/documents/${id}`),

  // Labs
  labs:              (p?: Record<string, string | number | undefined>) => get('/health/labs', p),
  lab:               (id: string)   => get(`/health/labs/${id}`),

  // Imaging
  imaging:           (p?: Record<string, string | number | undefined>) => get('/health/imaging', p),

  // Dashboard
  dashboard:         ()             => get('/health/dashboard'),

  // Prescriptions
  prescriptions:     (p?: Record<string, string | number | undefined>) => get('/health/prescriptions', p),
  prescription:      (id: string)   => get(`/health/prescriptions/${id}`),
  requestRefill:     (id: string, d: unknown, idem?: string) => post(`/health/prescriptions/${id}/refill`, d, idem),
  sendToPharmacy:    (id: string, d: unknown) => post(`/health/prescriptions/${id}/pharmacy-route`, d),

  // Messages
  threads:           ()             => get('/health/messages/threads'),
  thread:            (id: string)   => get(`/health/messages/threads/${id}`),
  createThread:      (d: unknown, idem?: string) => post('/health/messages/threads', d, idem),
  sendMessage:       (id: string, d: unknown) => patch(`/health/messages/threads/${id}`, d),
  uploadAttachment:  (d: unknown)   => post('/health/messages/upload', d),

  // Billing
  invoices:          (p?: Record<string, string | number | undefined>) => get('/health/billing/invoices', p),
  invoice:           (id: string)   => get(`/health/billing/invoices/${id}`),
  payBill:           (d: unknown, idem?: string) => post('/health/billing/pay', d, idem),

  // Insurance
  policies:          ()             => get('/health/insurance/policies'),
  addPolicy:         (d: unknown, idem?: string) => post('/health/insurance/policies', d, idem),
  claims:            (p?: Record<string, string | number | undefined>) => get('/health/insurance/claims', p),

  // Family
  family:            ()             => get('/health/family'),
  addMember:         (d: unknown, idem?: string) => post('/health/family', d, idem),
  member:            (id: string)   => get(`/health/family/${id}`),
  updateMember:      (id: string, d: unknown) => patch(`/health/family/${id}`, d),
  setPermissions:    (id: string, d: unknown, idem?: string) => post(`/health/family/${id}/permissions`, d, idem),

  // AI
  aiHistory:         ()             => get('/health/ai'),
  aiChat:            (msg: string)  => post('/health/ai', { message: msg }),

  // Wellness (new backend endpoints)
  wellnessLogs:      (p?: Record<string, string | number | undefined>) => get('/health/wellness/logs', p),
  logWellness:       (d: unknown)   => post('/health/wellness/logs', d),
  goals:             ()             => get('/health/wellness/goals'),
  createGoal:        (d: unknown)   => post('/health/wellness/goals', d),
  updateGoal:        (id: string, d: unknown) => patch(`/health/wellness/goals/${id}`, d),

  // Medication reminders
  reminders:         ()             => get('/health/wellness/medication-reminders'),
  setReminder:       (d: unknown)   => post('/health/wellness/medication-reminders', d),
  updateReminder:    (id: string, d: unknown) => patch(`/health/wellness/medication-reminders/${id}`, d),
}

// Portal auth calls (not proxied — hit portal API directly)
export const portalAuth = {
  login:     (phone: string, password: string) =>
    fetch('/api/auth', { method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'login', phone, password }) }).then(r => r.json()),
  verifyOtp: (temp_token: string, code: string) =>
    fetch('/api/auth', { method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'verify_otp', temp_token, code }) }).then(r => r.json()),
  // Health record sign-in (P2): no Blue Boney account.
  claimStart:  (d: { uhr_number: string; date_of_birth: string } | { phone: string; date_of_birth: string }) =>
    fetch('/api/auth', { method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'claim_start', ...d }) }).then(r => r.json()),
  claimVerify: (challenge_id: string, code: string) =>
    fetch('/api/auth', { method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'claim_verify', challenge_id, code }) }).then(r => r.json()),
  logout:    () =>
    fetch('/api/logout', { method: 'POST' }).then(r => r.json()),
  session:   () =>
    fetch('/api/session').then(r => r.json()),
}
