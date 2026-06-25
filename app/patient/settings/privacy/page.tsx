'use client'
import { ArrowLeft, Download, FileText, Shield, Eye } from 'lucide-react'
import Link from 'next/link'
import { useState } from 'react'
import { patientApi } from '@/lib/api'

export default function PrivacySettingsPage() {
  const [exporting, setExporting] = useState(false)
  const [exportMsg, setExportMsg] = useState('')

  const handleExport = async () => {
    setExporting(true); setExportMsg('')
    try {
      await patientApi.exportRecords({ format: 'json', include: ['encounters', 'observations', 'conditions', 'medications', 'labs'] })
      setExportMsg('Export request submitted. You will receive a download link via message within 24 hours.')
    } catch (e: any) {
      setExportMsg(e.message ?? 'Failed to request export')
    }
    setExporting(false)
  }

  return (
    <div className="space-y-5 max-w-2xl">
      <Link href="/patient/settings" className="inline-flex items-center gap-1.5 text-[13px] text-[var(--bb-ink-soft)] hover:text-[var(--bb-ink)] transition-colors">
        <ArrowLeft size={14} /> Back to Settings
      </Link>
      <h1 className="text-[22px] font-bold text-[var(--bb-ink)]">Privacy</h1>

      {/* Data export */}
      <div className="bg-white rounded-[12px] border border-[var(--bb-border)] p-5">
        <div className="flex items-center gap-2 mb-3">
          <Download size={15} color="var(--h-teal)" />
          <h2 className="text-[14px] font-bold text-[var(--bb-ink)]">Export Your Health Data</h2>
        </div>
        <p className="text-[13px] text-[var(--bb-ink-soft)] mb-4">
          Download a copy of all your health records, appointments, lab results, and documents in JSON or PDF format.
        </p>
        {exportMsg && <p className="text-[12px] text-[var(--h-info)] mb-3">{exportMsg}</p>}
        <button onClick={handleExport} disabled={exporting}
          className="h-10 px-4 rounded-[9px] bg-[var(--h-teal)] text-white text-[13px] font-semibold hover:bg-[var(--h-teal-hover)] transition-colors disabled:opacity-60">
          {exporting ? 'Requesting...' : 'Request Data Export'}
        </button>
      </div>

      {/* Consent */}
      <div className="bg-white rounded-[12px] border border-[var(--bb-border)] p-5">
        <div className="flex items-center gap-2 mb-3">
          <FileText size={15} color="var(--h-teal)" />
          <h2 className="text-[14px] font-bold text-[var(--bb-ink)]">Consent & Agreements</h2>
        </div>
        <div className="space-y-2 text-[13px] text-[var(--bb-ink-soft)]">
          <Link href="#" className="block text-[var(--h-teal)] hover:underline">Privacy Policy</Link>
          <Link href="#" className="block text-[var(--h-teal)] hover:underline">Terms of Service</Link>
          <Link href="#" className="block text-[var(--h-teal)] hover:underline">HIPAA Notice of Privacy Practices</Link>
          <Link href="#" className="block text-[var(--h-teal)] hover:underline">Authorization for Release of Records</Link>
        </div>
      </div>

      {/* Access audit */}
      <div className="bg-white rounded-[12px] border border-[var(--bb-border)] p-5">
        <div className="flex items-center gap-2 mb-3">
          <Eye size={15} color="var(--h-teal)" />
          <h2 className="text-[14px] font-bold text-[var(--bb-ink)]">Provider Access</h2>
        </div>
        <p className="text-[13px] text-[var(--bb-ink-soft)] mb-3">
          Manage which providers can access your health records.
        </p>
        <Link href="/patient/records/access"
          className="inline-flex items-center gap-1.5 h-9 px-4 rounded-[8px] border border-[var(--bb-border)] text-[13px] font-medium text-[var(--bb-ink-soft)] hover:border-[var(--h-teal)] hover:text-[var(--h-teal)] transition-colors">
          Manage Provider Access
        </Link>
      </div>

      {/* Delete account */}
      <div className="bg-white rounded-[12px] border border-[var(--h-danger)] p-5">
        <div className="flex items-center gap-2 mb-3">
          <Shield size={15} color="var(--h-danger)" />
          <h2 className="text-[14px] font-bold text-[var(--h-danger)]">Delete Account</h2>
        </div>
        <p className="text-[13px] text-[var(--bb-ink-soft)] mb-3">
          Permanently delete your patient portal account and all associated data. This action cannot be undone. Contact support to initiate account deletion.
        </p>
        <Link href="mailto:support@blueboney.com?subject=Account Deletion Request"
          className="inline-flex items-center gap-1.5 h-9 px-4 rounded-[8px] border border-[var(--h-danger)] text-[13px] font-medium text-[var(--h-danger)] hover:bg-[var(--h-danger-bg)] transition-colors">
          Contact Support to Delete Account
        </Link>
      </div>
    </div>
  )
}
