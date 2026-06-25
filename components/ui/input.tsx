import * as React from 'react'
import { cn } from '@/lib/utils/cn'

const Input = React.forwardRef<HTMLInputElement, React.InputHTMLAttributes<HTMLInputElement>>(
  ({ className, type, ...props }, ref) => (
    <input
      type={type}
      className={cn(
        'flex h-10 w-full rounded-[10px] border border-[var(--bb-border)] bg-[var(--bb-bg)] px-3 py-2 text-sm text-[var(--bb-ink)] placeholder:text-[var(--bb-ink-muted)] transition-colors focus:outline-none focus:ring-2 focus:ring-[var(--h-teal)] focus:border-[var(--h-teal)] disabled:cursor-not-allowed disabled:opacity-50',
        className,
      )}
      ref={ref}
      {...props}
    />
  ),
)
Input.displayName = 'Input'

export { Input }
