'use client'
import { useState, useRef } from 'react'
import { FolderOpen, Upload, Download, Trash2, FileText, Image as ImageIcon, File } from 'lucide-react'
import { EmptyHealthState } from '@/components/health/EmptyHealthState'
import { CardSkeleton } from '@/components/shared/LoadingSkeleton'
import { useHealthData } from '@/lib/hooks/useHealthData'
import { patientApi } from '@/lib/api'
import { formatDate } from '@/lib/utils/formatters'
import { cn } from '@/lib/utils/cn'

const CATEGORIES = ['All', 'insurance_card', 'prescription', 'lab_report', 'consent_form', 'visit_summary', 'vaccination_record', 'imaging', 'other']
const CAT_LABELS: Record<string, string> = { insurance_card: 'Insurance Cards', prescription: 'Prescriptions', lab_report: 'Lab Reports', consent_form: 'Consent Forms', visit_summary: 'Visit Summaries', vaccination_record: 'Vaccinations', imaging: 'Imaging', other: 'Other' }

interface Doc { id: string; file_name: string; document_category?: string; file_size?: number; file_url?: string; created_at: string; provider_name?: string }

function DocIcon({ name }: { name: string }) {
  if (/\.(jpg|jpeg|png|gif|webp)/i.test(name)) return <ImageIcon size={16} color="var(--h-info)" />
  if (/\.(pdf)/i.test(name)) return <FileText size={16} color="var(--h-danger)" />
  return <File size={16} color="var(--bb-ink-muted)" />
}

export default function DocumentsPage() {
  const [cat, setCat] = useState('All')
  const { data, isLoading, mutate } = useHealthData<{ documents: Doc[] }>(
    '/health/records/documents',
    cat !== 'All' ? { category: cat } : undefined,
  )
  const docs = data?.documents ?? []
  const inputRef = useRef<HTMLInputElement>(null)

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    // In production, upload to Supabase Storage first, then record the URL
    // For now: show the filename as a placeholder
    alert(`Upload feature: "${file.name}" would be uploaded to Supabase Storage and recorded via /health/records/documents`)
  }

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-[22px] font-bold text-[var(--bb-ink)]">Documents</h1>
          <p className="text-[13px] text-[var(--bb-ink-soft)]">Your health documents and files</p>
        </div>
        <button onClick={() => inputRef.current?.click()}
          className="flex items-center gap-1.5 h-10 px-4 rounded-[10px] bg-[var(--h-teal)] text-white text-[13px] font-semibold hover:bg-[var(--h-teal-hover)] transition-colors">
          <Upload size={15} /> Upload
        </button>
        <input ref={inputRef} type="file" className="hidden" accept=".pdf,.jpg,.jpeg,.png,.gif" onChange={handleUpload} />
      </div>

      {/* Category filter */}
      <div className="flex gap-2 overflow-x-auto pb-1">
        {CATEGORIES.map(c => (
          <button key={c} onClick={() => setCat(c)}
            className={cn('shrink-0 h-8 px-3 rounded-full text-[12px] font-medium transition-colors',
              cat === c ? 'bg-[var(--h-teal)] text-white' : 'bg-white border border-[var(--bb-border)] text-[var(--bb-ink-soft)] hover:border-[var(--h-teal)] hover:text-[var(--h-teal)]')}>
            {c === 'All' ? 'All' : CAT_LABELS[c] ?? c}
          </button>
        ))}
      </div>

      {isLoading
        ? <div className="space-y-2">{[1,2,3].map(i => <CardSkeleton key={i} />)}</div>
        : docs.length > 0
          ? <div className="bg-white rounded-[12px] border border-[var(--bb-border)] divide-y divide-[var(--bb-border)]">
              {docs.map(d => (
                <div key={d.id} className="flex items-center gap-3 px-4 py-3">
                  <div className="w-9 h-9 rounded-[8px] bg-[var(--bb-bg2)] flex items-center justify-center shrink-0">
                    <DocIcon name={d.file_name} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-[13px] font-medium text-[var(--bb-ink)] truncate">{d.file_name}</p>
                    <p className="text-[11px] text-[var(--bb-ink-muted)]">
                      {d.document_category ? `${CAT_LABELS[d.document_category] ?? d.document_category} · ` : ''}{formatDate(d.created_at)}
                    </p>
                  </div>
                  <div className="flex items-center gap-1 shrink-0">
                    {d.file_url && (
                      <a href={d.file_url} download target="_blank" rel="noopener noreferrer"
                        className="w-8 h-8 flex items-center justify-center rounded-[6px] hover:bg-[var(--bb-bg2)] transition-colors text-[var(--bb-ink-muted)] hover:text-[var(--bb-ink)]">
                        <Download size={14} />
                      </a>
                    )}
                  </div>
                </div>
              ))}
            </div>
          : <EmptyHealthState icon={FolderOpen} title="No documents" message="Upload insurance cards, lab reports, consent forms, and more." action={{ label: 'Upload Document', onClick: () => inputRef.current?.click() }} />
      }
    </div>
  )
}
