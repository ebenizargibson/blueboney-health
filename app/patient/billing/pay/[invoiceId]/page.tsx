'use client'
import { use, useState } from 'react'
import { ArrowLeft, CreditCard, Wallet, Smartphone } from 'lucide-react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useHealthData } from '@/lib/hooks/useHealthData'
import { patientApi } from '@/lib/api'
import { formatCurrency } from '@/lib/utils/formatters'
import { randomUUID } from '@/lib/utils/uuid'

interface Invoice { id: string; invoice_number?: string; total_amount: number; patient_amount: number; currency?: string; provider_name?: string; service_date?: string; description?: string }

type PayMethod = 'wallet' | 'mobile_money' | 'card'

export default function BillingPayPage({ params }: { params: Promise<{ invoiceId: string }> }) {
  const { invoiceId } = use(params)
  const router = useRouter()
  const { data } = useHealthData<{ invoice: Invoice }>(`/health/billing/invoices/${invoiceId}`)
  const invoice = data?.invoice

  const [method, setMethod] = useState<PayMethod>('wallet')
  const [paying, setPaying] = useState(false)
  const [error,  setError]  = useState('')

  const handlePay = async () => {
    if (!invoice) return
    setPaying(true); setError('')
    try {
      await patientApi.payBill({ invoice_id: invoiceId, payment_method: method }, randomUUID())
      router.push('/patient/billing?paid=1')
    } catch (e: any) {
      setError(e.message ?? 'Payment failed. Please try again.')
    }
    setPaying(false)
  }

  const METHOD_OPTIONS: { value: PayMethod; icon: typeof Wallet; label: string; desc: string }[] = [
    { value: 'wallet',       icon: Wallet,      label: 'Health Wallet',  desc: 'Pay from your Blue Boney Health Wallet balance' },
    { value: 'mobile_money', icon: Smartphone,  label: 'Mobile Money',   desc: 'MTN Mobile Money or other providers' },
    { value: 'card',         icon: CreditCard,  label: 'Card',           desc: 'Debit or credit card (Visa, Mastercard)' },
  ]

  if (!invoice) {
    return (
      <div className="max-w-md mx-auto mt-20 text-center text-[var(--bb-ink-soft)]">Loading invoice...</div>
    )
  }

  return (
    <div className="space-y-5 max-w-md">
      <Link href="/patient/billing" className="inline-flex items-center gap-1.5 text-[13px] text-[var(--bb-ink-soft)] hover:text-[var(--bb-ink)] transition-colors">
        <ArrowLeft size={14} /> Back to Billing
      </Link>
      <h1 className="text-[22px] font-bold text-[var(--bb-ink)]">Pay Invoice</h1>

      {/* Invoice summary */}
      <div className="bg-white rounded-[12px] border border-[var(--bb-border)] p-5">
        {invoice.invoice_number && (
          <p className="text-[11px] text-[var(--bb-ink-muted)] mb-1">Invoice #{invoice.invoice_number}</p>
        )}
        {invoice.provider_name  && <p className="text-[14px] font-semibold text-[var(--bb-ink)]">{invoice.provider_name}</p>}
        {invoice.description    && <p className="text-[12px] text-[var(--bb-ink-soft)] mt-0.5">{invoice.description}</p>}
        <div className="mt-4 pt-4 border-t border-[var(--bb-border)]">
          <div className="flex items-center justify-between">
            <span className="text-[13px] text-[var(--bb-ink-soft)]">Amount due</span>
            <span className="text-[20px] font-extrabold text-[var(--bb-ink)]">
              {formatCurrency(invoice.patient_amount, invoice.currency ?? 'LRD')}
            </span>
          </div>
        </div>
      </div>

      {/* Payment method */}
      <div className="space-y-2">
        <p className="text-[12px] font-semibold text-[var(--bb-ink-soft)] uppercase tracking-wide">Payment Method</p>
        {METHOD_OPTIONS.map(({ value, icon: Icon, label, desc }) => (
          <button key={value} onClick={() => setMethod(value)}
            className={`w-full flex items-center gap-3 p-4 rounded-[10px] border transition-colors text-left ${method === value ? 'border-[var(--h-teal)] bg-[var(--h-teal-light)]' : 'border-[var(--bb-border)] bg-white hover:border-[var(--h-teal)]'}`}>
            <div className={`w-9 h-9 rounded-[8px] flex items-center justify-center shrink-0 ${method === value ? 'bg-[var(--h-teal)]' : 'bg-[var(--bb-bg2)]'}`}>
              <Icon size={16} color={method === value ? 'white' : 'var(--bb-ink-muted)'} />
            </div>
            <div>
              <p className="text-[13px] font-semibold text-[var(--bb-ink)]">{label}</p>
              <p className="text-[11px] text-[var(--bb-ink-muted)]">{desc}</p>
            </div>
          </button>
        ))}
      </div>

      {error && <p className="text-[13px] text-[var(--h-danger)]">{error}</p>}

      <button onClick={handlePay} disabled={paying}
        className="w-full h-12 rounded-[10px] bg-[var(--h-teal)] text-white text-[15px] font-bold hover:bg-[var(--h-teal-hover)] transition-colors disabled:opacity-60">
        {paying ? 'Processing...' : `Pay ${formatCurrency(invoice.patient_amount, invoice.currency ?? 'LRD')}`}
      </button>
    </div>
  )
}
