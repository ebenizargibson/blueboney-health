import * as React from 'react'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '@/lib/utils/cn'

const badgeVariants = cva(
  'inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-semibold transition-colors',
  {
    variants: {
      variant: {
        default:   'bg-[var(--h-teal-light)] text-[var(--h-teal-dark)]',
        success:   'bg-[var(--h-success-bg)] text-[var(--h-success)]',
        warning:   'bg-[var(--h-warning-bg)] text-[var(--h-warning)]',
        danger:    'bg-[var(--h-danger-bg)] text-[var(--h-danger)]',
        critical:  'bg-[var(--h-critical-bg)] text-[var(--h-critical)]',
        info:      'bg-[var(--h-info-bg)] text-[var(--h-info)]',
        neutral:   'bg-[var(--h-neutral-bg)] text-[var(--h-neutral)]',
        outline:   'border border-[var(--bb-border)] text-[var(--bb-ink-soft)]',
      },
    },
    defaultVariants: { variant: 'default' },
  },
)

export interface BadgeProps extends React.HTMLAttributes<HTMLDivElement>, VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return <div className={cn(badgeVariants({ variant }), className)} {...props} />
}

export { Badge, badgeVariants }
