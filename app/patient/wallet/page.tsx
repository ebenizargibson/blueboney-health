'use client'
import { Wallet, ArrowUpRight, ArrowDownLeft, Plus, Send } from 'lucide-react'
import Link from 'next/link'
import { EmptyHealthState } from '@/components/health/EmptyHealthState'
import { CardSkeleton } from '@/components/shared/LoadingSkeleton'
import { useHealthData } from '@/lib/hooks/useHealthData'
import { formatCurrency, formatDateTime } from '@/lib/utils/formatters'

interface WalletInfo { balance: number; currency: string; wallet_number?: string }
interface Transaction { id: string; transaction_type: string; amount: number; currency: string; status: string; description?: string; created_at: string; counterparty_name?: string }

export default function WalletPage() {
  const { data: walData, isLoading: walLoading } = useHealthData<{ wallet: WalletInfo }>('/health/wallet')
  const { data: txData, isLoading: txLoading } = useHealthData<{ transactions: Transaction[] }>('/health/wallet/transactions')
  const wallet = walData?.wallet
  const txs    = txData?.transactions ?? []

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-[22px] font-bold text-[var(--bb-ink)]">Health Wallet</h1>
        <p className="text-[13px] text-[var(--bb-ink-soft)]">Pay for care, receive reimbursements</p>
      </div>

      {/* Balance card */}
      {walLoading
        ? <div className="skeleton h-40 rounded-[16px]" />
        : wallet
          ? (
            <div className="teal-gradient rounded-[16px] p-6 shadow-[var(--shadow-lg)]">
              <p className="text-[12px] font-semibold uppercase tracking-wide text-white/70 mb-1">Health Wallet Balance</p>
              <p className="text-[36px] font-extrabold text-white leading-none mb-1">{formatCurrency(wallet.balance, wallet.currency)}</p>
              {wallet.wallet_number && <p className="text-[12px] text-white/60 font-mono">{wallet.wallet_number}</p>}
              <div className="flex gap-3 mt-5">
                {[
                  { icon: Send,  label: 'Pay Provider', href: '/patient/billing' },
                  { icon: Plus,  label: 'Add Funds',    href: '#' },
                ].map(a => (
                  <Link key={a.label} href={a.href}
                    className="flex items-center gap-1.5 h-9 px-4 rounded-[8px] bg-white/20 hover:bg-white/30 text-white text-[12px] font-semibold transition-colors">
                    <a.icon size={13} /> {a.label}
                  </Link>
                ))}
              </div>
            </div>
          )
          : <div className="bg-[var(--h-neutral-bg)] rounded-[16px] p-6 text-center">
              <Wallet size={28} className="mx-auto text-[var(--bb-ink-muted)] mb-2" />
              <p className="text-[14px] font-semibold text-[var(--bb-ink)]">Health wallet not set up</p>
              <p className="text-[12px] text-[var(--bb-ink-soft)] mt-1">Activate Blue Boney Health to enable your wallet.</p>
            </div>
      }

      {/* Transactions */}
      <section>
        <h2 className="text-[15px] font-bold text-[var(--bb-ink)] mb-3">Transaction History</h2>
        {txLoading
          ? <div className="space-y-2">{[1,2,3].map(i => <CardSkeleton key={i} />)}</div>
          : txs.length > 0
            ? <div className="bg-white rounded-[12px] border border-[var(--bb-border)] divide-y divide-[var(--bb-border)]">
                {txs.map(tx => {
                  const isCredit = ['credit', 'reimbursement', 'refund'].includes(tx.transaction_type)
                  return (
                    <div key={tx.id} className="flex items-center gap-3 px-4 py-3">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${isCredit ? 'bg-[var(--h-success-bg)]' : 'bg-[var(--bb-bg2)]'}`}>
                        {isCredit
                          ? <ArrowDownLeft size={14} color="var(--h-success)" />
                          : <ArrowUpRight  size={14} color="var(--bb-ink-soft)" />
                        }
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-[13px] font-medium text-[var(--bb-ink)] truncate">{tx.description ?? tx.transaction_type.replace(/_/g, ' ')}</p>
                        <p className="text-[11px] text-[var(--bb-ink-muted)]">{formatDateTime(tx.created_at)}</p>
                      </div>
                      <p className={`text-[14px] font-bold shrink-0 ${isCredit ? 'text-[var(--h-success)]' : 'text-[var(--bb-ink)]'}`}>
                        {isCredit ? '+' : '-'}{formatCurrency(tx.amount, tx.currency)}
                      </p>
                    </div>
                  )
                })}
              </div>
            : <EmptyHealthState icon={Wallet} title="No transactions yet" message="Payments and reimbursements will appear here." />
        }
      </section>
    </div>
  )
}
