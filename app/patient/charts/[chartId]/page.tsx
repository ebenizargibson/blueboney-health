'use client'
import { use } from 'react'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import { useHealthData } from '@/lib/hooks/useHealthData'
import { DashboardSkeleton } from '@/components/shared/LoadingSkeleton'
import { ChartSummary, type ClinicalSummary } from '@/components/health/ChartSummary'

/**
 * A chart the signed-in patient may view: their own, or one they look after as a
 * guardian. The backend decides through the recorded relationship; a chart it does
 * not allow answers 404, shown here as "not available".
 */
export default function ChartPage({ params }: { params: Promise<{ chartId: string }> }) {
  const { chartId } = use(params)
  const { data, error, isLoading } = useHealthData<{ acting_as: 'self' | 'guardian'; summary: ClinicalSummary }>(
    `/health/patient/charts/${chartId}/summary`,
  )
  return (
    <div className="space-y-5">
      <Link href="/patient" className="inline-flex items-center gap-1.5 text-[13px] text-[var(--bb-ink-soft)] hover:text-[var(--bb-ink)]">
        <ArrowLeft size={14} /> Back
      </Link>
      {isLoading ? <DashboardSkeleton />
        : error || !data ? (
          <p className="text-[14px] text-[var(--bb-ink-soft)]">This record is not available to you. If you think it should be, ask at the clinic desk.</p>
        ) : (
          <>
            <h1 className="text-[20px] font-bold text-[var(--bb-ink)]">
              {data.acting_as === 'guardian' ? 'Record of someone you look after' : 'Your health record'}
            </h1>
            <ChartSummary summary={data.summary} />
          </>
        )}
    </div>
  )
}
