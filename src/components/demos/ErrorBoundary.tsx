import { CircleAlert, RotateCw } from 'lucide-react'
import { Component, createRef, type ErrorInfo, type ReactNode } from 'react'

interface ErrorBoundaryProps {
  children: ReactNode
  /**
   * Called before a retry re-renders the children. A failed React.lazy() component keeps its rejected
   * promise forever, so the owner must hand back a fresh lazy component for the retry to fetch again.
   */
  onRetry?: () => void
  /** When this changes (e.g. a different demo type), a caught error is cleared. */
  resetKey?: unknown
}

interface ErrorBoundaryState {
  error: Error | null
  /** How many times Retry has been pressed; used to decide where focus goes. */
  retries: number
  /** The resetKey this state belongs to. */
  resetKey: unknown
}

/**
 * Catches a demo that fails to load (e.g. its chunk can't be fetched when offline or after a redeploy)
 * or throws while rendering, and shows a retry box in its place instead of breaking the whole page.
 */
export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  state: ErrorBoundaryState = { error: null, retries: 0, resetKey: this.props.resetKey }

  private containerRef = createRef<HTMLDivElement>()
  private retryRef = createRef<HTMLButtonElement>()

  static getDerivedStateFromError(error: Error): Partial<ErrorBoundaryState> {
    return { error }
  }

  // A new resetKey (e.g. a different demo type) clears a caught error before the next render.
  static getDerivedStateFromProps(props: ErrorBoundaryProps, state: ErrorBoundaryState): Partial<ErrorBoundaryState> | null {
    return props.resetKey === state.resetKey ? null : { resetKey: props.resetKey, error: null, retries: 0 }
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error('[InteractiveDemo] A demo failed to load or render.', error, info.componentStack)
  }

  componentDidUpdate(_prevProps: ErrorBoundaryProps, prevState: ErrorBoundaryState) {
    if (this.state.retries === prevState.retries && this.state.error === prevState.error) return

    // Focus management around a retry. The Retry button disappears when pressed, so focus would fall back
    // to the top of the page. Keep it here: on the demo area while it loads, or back on Retry if the
    // retry failed too.
    if (this.state.error && this.state.retries > 0) this.retryRef.current?.focus()
    else if (!this.state.error && this.state.retries > prevState.retries) this.containerRef.current?.focus()
  }

  private retry = () => {
    this.props.onRetry?.()
    this.setState((s) => ({ error: null, retries: s.retries + 1 }))
  }

  render() {
    return (
      // tabIndex -1: focusable from script only, as a landing spot after Retry.
      <div ref={this.containerRef} tabIndex={-1} className="focus:outline-none">
        {this.state.error ? (
          <div
            role="alert"
            className="flex flex-col items-center gap-3 rounded-lg border border-red-300 bg-red-50 p-6 text-center"
          >
            <CircleAlert className="size-6 text-red-700" aria-hidden="true" />
            <div className="flex flex-col gap-1">
              <p className="font-semibold text-red-900">Couldn't load this demo</p>
              <p className="text-sm text-red-900">Check your connection, then try again.</p>
            </div>
            <button
              ref={this.retryRef}
              type="button"
              onClick={this.retry}
              className="inline-flex min-h-11 cursor-pointer items-center gap-2 rounded-lg bg-red-700 px-4 text-sm font-semibold text-white hover:bg-red-800 focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-red-700"
            >
              <RotateCw className="size-4" aria-hidden="true" />
              Retry
            </button>
          </div>
        ) : (
          this.props.children
        )}
      </div>
    )
  }
}
