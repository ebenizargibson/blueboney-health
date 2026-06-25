import * as React from 'react'
import { Slot } from '@radix-ui/react-slot'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '@/lib/utils/cn'

const buttonVariants = cva(
  'inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-[10px] text-sm font-semibold transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--h-teal)] disabled:pointer-events-none disabled:opacity-50',
  {
    variants: {
      variant: {
        default:   'bg-[var(--h-teal)] text-white hover:bg-[var(--h-teal-hover)] shadow-sm',
        secondary: 'bg-[var(--bb-bg2)] text-[var(--bb-ink)] hover:bg-[var(--bb-border)]',
        outline:   'border border-[var(--bb-border)] bg-white text-[var(--bb-ink)] hover:bg-[var(--bb-bg2)]',
        ghost:     'text-[var(--bb-ink-soft)] hover:bg-[var(--bb-bg2)] hover:text-[var(--bb-ink)]',
        danger:    'bg-[var(--h-danger)] text-white hover:opacity-90',
        link:      'text-[var(--h-teal)] underline-offset-4 hover:underline p-0 h-auto',
      },
      size: {
        default: 'h-10 px-4 py-2',
        sm:      'h-8 px-3 text-xs',
        lg:      'h-12 px-6 text-base',
        icon:    'h-10 w-10',
        xs:      'h-7 px-2.5 text-xs',
      },
    },
    defaultVariants: { variant: 'default', size: 'default' },
  },
)

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement>, VariantProps<typeof buttonVariants> {
  asChild?: boolean
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : 'button'
    return <Comp className={cn(buttonVariants({ variant, size, className }))} ref={ref} {...props} />
  },
)
Button.displayName = 'Button'

export { Button, buttonVariants }
