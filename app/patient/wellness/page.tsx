'use client'
import { Activity, Target, TrendingUp, Plus, ChevronRight } from 'lucide-react'
import Link from 'next/link'
import { VitalCard } from '@/components/health/VitalCard'
import { MetricChart } from '@/components/health/MetricChart'
import { EmptyHealthState } from '@/components/health/EmptyHealthState'
import { CardSkeleton } from '@/components/shared/LoadingSkeleton'
import { useHealthData } from '@/lib/hooks/useHealthData'

interface WellnessLog { log_date: string; weight_kg?: number; systolic_bp?: number; diastolic_bp?: number; heart_rate?: number; sleep_hours?: number; steps?: number; mood?: string }
interface Goal { id: string; goal_type: string; title: string; target_value?: number; current_value?: number; target_unit?: string; status: string; progress_pct?: number }

export default function WellnessPage() {
  const { data: logData, isLoading: logLoading } = useHealthData<{ logs: WellnessLog[] }>(
    '/health/wellness/logs', { limit: 30 },
  )
  const { data: goalData, isLoading: goalLoading } = useHealthData<{ goals: Goal[] }>('/health/wellness/goals')

  const logs  = (logData?.logs ?? []).sort((a, b) => a.log_date.localeCompare(b.log_date))
  const goals = goalData?.goals ?? []
  const latest = logs.at(-1)

  const toChart = (field: keyof WellnessLog) =>
    logs.filter(l => l[field] !== undefined && l[field] !== null).map(l => ({
      date:  l.log_date.slice(5),
      value: Number(l[field]),
    }))

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-[22px] font-bold text-[var(--bb-ink)]">Wellness</h1>
          <p className="text-[13px] text-[var(--bb-ink-soft)]">Track your vitals, goals, and daily health</p>
        </div>
        <Link href="/patient/wellness/log"
          className="flex items-center gap-1.5 h-10 px-4 rounded-[10px] bg-[var(--h-teal)] text-white text-[13px] font-semibold hover:bg-[var(--h-teal-hover)] transition-colors">
          <Plus size={15} /> Log Today
        </Link>
      </div>

      {/* Latest vitals */}
      {latest && (
        <section>
          <h2 className="text-[15px] font-bold text-[var(--bb-ink)] mb-3">Today's Vitals</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
            {latest.weight_kg    !== undefined && <VitalCard label="Weight"       value={latest.weight_kg}    unit="kg"     />}
            {latest.systolic_bp  !== undefined && <VitalCard label="Blood Pressure" value={`${latest.systolic_bp}/${latest.diastolic_bp}`} unit="mmHg" />}
            {latest.heart_rate   !== undefined && <VitalCard label="Heart Rate"   value={latest.heart_rate}   unit="bpm"    />}
            {latest.sleep_hours  !== undefined && <VitalCard label="Sleep"        value={latest.sleep_hours}  unit="hrs"    />}
            {latest.steps        !== undefined && <VitalCard label="Steps"        value={latest.steps.toLocaleString()}        />}
            {latest.mood         !== undefined && <VitalCard label="Mood"         value={({ great:'Great', good:'Good', okay:'Okay', low:'Low', bad:'Low' }[latest.mood ?? ''] ?? latest.mood)} />}
          </div>
        </section>
      )}

      {/* Goals */}
      <section>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-[15px] font-bold text-[var(--bb-ink)]">Health Goals</h2>
          <button className="text-[12px] text-[var(--h-teal)] font-medium hover:underline flex items-center gap-0.5">
            Add Goal <ChevronRight size={12} />
          </button>
        </div>
        {goalLoading
          ? <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">{[1,2].map(i => <CardSkeleton key={i} />)}</div>
          : goals.length > 0
            ? <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {goals.filter(g => g.status === 'active').map(g => (
                  <div key={g.id} className="bg-white rounded-[12px] border border-[var(--bb-border)] p-4">
                    <div className="flex items-start justify-between gap-2 mb-3">
                      <div>
                        <p className="text-[13px] font-semibold text-[var(--bb-ink)]">{g.title}</p>
                        {g.target_value && g.target_unit && (
                          <p className="text-[12px] text-[var(--bb-ink-soft)]">Target: {g.target_value} {g.target_unit}</p>
                        )}
                      </div>
                      <span className="text-[12px] font-bold text-[var(--h-teal)]">{Math.round(g.progress_pct ?? 0)}%</span>
                    </div>
                    <div className="h-2 rounded-full bg-[var(--bb-bg2)] overflow-hidden">
                      <div className="h-full rounded-full bg-[var(--h-teal)] transition-all" style={{ width: `${Math.min(100, g.progress_pct ?? 0)}%` }} />
                    </div>
                  </div>
                ))}
              </div>
            : <EmptyHealthState icon={Target} title="No active goals" message="Set health goals to track your progress over time." />
        }
      </section>

      {/* Trend charts */}
      {logs.length >= 2 && (
        <section>
          <h2 className="text-[15px] font-bold text-[var(--bb-ink)] mb-3">Trends (Last 30 Days)</h2>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {toChart('weight_kg').length >= 2 && (
              <div className="bg-white rounded-[12px] border border-[var(--bb-border)] p-4">
                <MetricChart data={toChart('weight_kg')} label="Weight" unit="kg" color="var(--h-teal)" />
              </div>
            )}
            {toChart('heart_rate').length >= 2 && (
              <div className="bg-white rounded-[12px] border border-[var(--bb-border)] p-4">
                <MetricChart data={toChart('heart_rate')} label="Heart Rate" unit="bpm" color="var(--h-danger)" normalLow={60} normalHigh={100} />
              </div>
            )}
            {toChart('sleep_hours').length >= 2 && (
              <div className="bg-white rounded-[12px] border border-[var(--bb-border)] p-4">
                <MetricChart data={toChart('sleep_hours')} label="Sleep" unit="hrs" color="var(--bb-blue)" normalLow={7} normalHigh={9} />
              </div>
            )}
          </div>
        </section>
      )}
    </div>
  )
}
