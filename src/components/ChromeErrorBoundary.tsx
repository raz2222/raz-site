import { Component, type ReactNode } from "react"

// Wraps purely decorative chrome (intro animation, custom cursor) that sits
// outside the page's real content. If anything in here throws, fail silently
// instead of taking the whole site down with it — decoration is never worth
// a blank page.
export class ChromeErrorBoundary extends Component<{ children: ReactNode }, { hasError: boolean }> {
  state = { hasError: false }

  static getDerivedStateFromError() {
    return { hasError: true }
  }

  render() {
    if (this.state.hasError) return null
    return this.props.children
  }
}
