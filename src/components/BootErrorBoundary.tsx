import { Component, type ErrorInfo, type ReactNode } from "react"

/** A React crash unmounts the whole tree, and on a black background that is a
 * black screen · no message, nothing to press, nothing to report. Raz opened
 * the admin to exactly that, and from here the live site is unreachable
 * (organization egress policy), so "what does it say" was the only way to know
 * and the screen said nothing.
 *
 * It says something now. The message is on the page, in words that name the
 * failure, with a reload that also clears the stale-build guard so a reload is
 * actually allowed to happen. */
export class BootErrorBoundary extends Component<{ children: ReactNode }, { error: Error | null }> {
  state: { error: Error | null } = { error: null }

  static getDerivedStateFromError(error: Error) {
    return { error }
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    // The stack is what makes a report actionable, and a phone has no console.
    // Keeping it on window means a screenshot of this screen carries it.
    ;(window as unknown as { razCrash?: unknown }).razCrash = {
      message: error.message,
      stack: error.stack,
      component: info.componentStack,
    }
  }

  render() {
    if (!this.state.error) return this.props.children

    return (
      <div className="min-h-[100dvh] flex items-center justify-center px-6 bg-background text-foreground">
        <div className="max-w-md w-full text-center">
          <p className="text-sm text-dim leading-relaxed">משהו בעמוד הזה נשבר. זו השגיאה:</p>
          <pre
            dir="ltr"
            className="mt-4 text-left text-[11px] text-dim bg-white/5 rounded-lg p-3 overflow-auto max-h-[40vh] whitespace-pre-wrap"
          >
            {this.state.error.message}
            {this.state.error.stack ? `\n\n${this.state.error.stack}` : ""}
          </pre>
          <button
            onClick={() => {
              try {
                sessionStorage.removeItem("raz-stale-build")
              } catch {
                // Private mode. Reloading is still worth a try.
              }
              window.location.reload()
            }}
            className="mt-5 font-mono text-xs uppercase tracking-wide border border-white/30 rounded-full px-6 min-h-[44px] hover:bg-foreground hover:text-background transition-colors"
          >
            רענון
          </button>
        </div>
      </div>
    )
  }
}
