'use client'
import { Component, type ReactNode } from 'react'

export class ErrorBoundary extends Component<
  { children: ReactNode },
  { hasError: boolean }
> {
  state = { hasError: false }

  static getDerivedStateFromError() {
    return { hasError: true }
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex h-screen items-center justify-center">
          <div className="text-center p-8 max-w-sm">
            <h2 className="text-base font-semibold mb-2">Something went wrong</h2>
            <p className="text-sm text-gray-500 mb-4">Please refresh the page.</p>
            <button
              onClick={() => {
                this.setState({ hasError: false })
                window.location.reload()
              }}
              className="px-4 py-2 rounded-lg bg-[var(--h-teal)] text-white text-sm font-medium hover:bg-[var(--h-teal-hover)]"
            >
              Refresh
            </button>
          </div>
        </div>
      )
    }
    return this.props.children
  }
}
