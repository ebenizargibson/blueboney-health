export function formatDate(iso: string, opts?: Intl.DateTimeFormatOptions): string {
  return new Date(iso).toLocaleDateString('en-LR', {
    year: 'numeric', month: 'short', day: 'numeric', ...opts,
  })
}

export function formatDateTime(iso: string): string {
  return new Date(iso).toLocaleString('en-LR', {
    month: 'short', day: 'numeric', year: 'numeric',
    hour: 'numeric', minute: '2-digit',
  })
}

export function formatTime(iso: string): string {
  return new Date(iso).toLocaleTimeString('en-LR', { hour: 'numeric', minute: '2-digit' })
}

export function formatRelative(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime()
  const mins = Math.floor(diff / 60000)
  if (mins < 1)    return 'just now'
  if (mins < 60)   return `${mins}m ago`
  const hrs = Math.floor(mins / 60)
  if (hrs < 24)    return `${hrs}h ago`
  const days = Math.floor(hrs / 24)
  if (days < 7)    return `${days}d ago`
  return formatDate(iso)
}

export function formatCurrency(amount: number, currency = 'LRD'): string {
  return new Intl.NumberFormat('en-LR', { style: 'currency', currency, minimumFractionDigits: 2 }).format(amount)
}

export function formatUSD(amount: number): string {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 2 }).format(amount)
}

export function formatPhone(phone: string): string {
  const clean = phone.replace(/\D/g, '')
  if (clean.length === 11 && clean.startsWith('231')) return `+231 ${clean.slice(3, 5)} ${clean.slice(5, 8)} ${clean.slice(8)}`
  return phone
}

export function maskPhone(phone: string): string {
  if (phone.length <= 6) return phone
  return `${phone.slice(0, 4)}****${phone.slice(-2)}`
}

export function formatDate_YMD(iso: string): string {
  return new Date(iso).toISOString().split('T')[0]
}

export function countdown(iso: string): string {
  const diff = new Date(iso).getTime() - Date.now()
  if (diff <= 0) return 'Now'
  const mins = Math.floor(diff / 60000)
  if (mins < 60) return `In ${mins}m`
  const hrs = Math.floor(mins / 60)
  if (hrs < 24) return `In ${hrs}h`
  const days = Math.floor(hrs / 24)
  return `In ${days}d`
}
