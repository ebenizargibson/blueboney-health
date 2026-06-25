import { MapPin, Video, Star, Globe, User } from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'
import { cn } from '@/lib/utils/cn'

interface Provider {
  id:               string
  name:             string
  specialty?:       string
  provider_type?:   string
  city?:            string
  country?:         string
  languages?:       string[]
  consultation_fee?: number
  currency?:        string
  telehealth_available?: boolean
  accepting_new_patients?: boolean
  profile_photo?:   string
  bio?:             string
}

interface Props {
  provider: Provider
  onBook?:  (id: string) => void
  variant?: 'card' | 'list'
  className?: string
}

function Avatar({ src, name, size = 48 }: { src?: string; name: string; size?: number }) {
  if (src) return <Image src={src} alt={name} width={size} height={size} className="rounded-full object-cover" />
  const initials = name.split(' ').slice(0, 2).map(w => w[0]).join('').toUpperCase()
  return (
    <div className="rounded-full bg-[var(--h-teal-light)] flex items-center justify-center shrink-0" style={{ width: size, height: size }}>
      <span className="text-[var(--h-teal)] font-bold text-[13px]">{initials}</span>
    </div>
  )
}

export function ProviderCard({ provider, onBook, variant = 'card', className }: Props) {
  const fee = provider.consultation_fee
    ? `${provider.currency ?? 'LRD'} ${provider.consultation_fee.toLocaleString()}`
    : 'Fee on request'

  return (
    <div className={cn('bg-white rounded-[12px] border border-[var(--bb-border)] p-4 hover:shadow-[var(--shadow)] transition-shadow', className)}>
      <div className="flex items-start gap-3">
        <Avatar src={provider.profile_photo} name={provider.name} size={48} />
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <div>
              <p className="text-[14px] font-semibold text-[var(--bb-ink)]">{provider.name}</p>
              {provider.specialty && <p className="text-[12px] text-[var(--bb-ink-soft)]">{provider.specialty}</p>}
            </div>
            <div className="flex flex-col items-end gap-1 shrink-0">
              {provider.telehealth_available && (
                <span className="chip chip-teal text-[11px]"><Video size={10} /> Telehealth</span>
              )}
              {provider.accepting_new_patients && (
                <span className="chip chip-success text-[11px]"><User size={10} /> Accepting</span>
              )}
            </div>
          </div>
          <div className="flex flex-wrap gap-2 mt-2">
            {provider.city && (
              <span className="flex items-center gap-1 text-[11px] text-[var(--bb-ink-muted)]">
                <MapPin size={10} /> {provider.city}
              </span>
            )}
            {provider.languages?.length && (
              <span className="flex items-center gap-1 text-[11px] text-[var(--bb-ink-muted)]">
                <Globe size={10} /> {provider.languages.slice(0, 2).join(', ')}
              </span>
            )}
          </div>
          {provider.bio && variant === 'card' && (
            <p className="mt-2 text-[12px] text-[var(--bb-ink-soft)] line-clamp-2">{provider.bio}</p>
          )}
          <div className="flex items-center justify-between mt-3">
            <span className="text-[12px] font-semibold text-[var(--h-teal)]">{fee}</span>
            <div className="flex gap-2">
              <Link href={`/patient/find-care/${provider.id}`}
                className="h-8 px-3 rounded-[8px] border border-[var(--bb-border)] text-[12px] font-medium text-[var(--bb-ink)] hover:bg-[var(--bb-bg2)] transition-colors flex items-center">
                View
              </Link>
              {onBook && (
                <button onClick={() => onBook(provider.id)}
                  className="h-8 px-3 rounded-[8px] bg-[var(--h-teal)] text-white text-[12px] font-medium hover:bg-[var(--h-teal-hover)] transition-colors">
                  Book
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
