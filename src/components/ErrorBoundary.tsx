import React, { Component, ErrorInfo, ReactNode } from 'react'

interface Props {
  children: ReactNode
}

interface State {
  hasError: boolean
  error: Error | null
}

export default class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props)
    this.state = { hasError: false, error: null }
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('[PMN ErrorBoundary]', error, errorInfo.componentStack)
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: '100vh',
          background: 'var(--bg)',
          color: 'var(--ink)',
          padding: '2rem',
          textAlign: 'center',
          gap: '1.5rem'
        }}>
          <div style={{
            fontFamily: "'Source Code Pro', monospace",
            color: 'var(--acc)',
            fontSize: '.85rem',
            letterSpacing: '.2em',
            textTransform: 'uppercase'
          }}>
            &#9679; PMN Runtime Exception
          </div>

          <div style={{
            maxWidth: '520px',
            fontFamily: "'Lora', serif",
            fontSize: '1.05rem',
            lineHeight: 1.7,
            color: 'var(--ink2)',
            fontStyle: 'italic'
          }}>
            A structural failure occurred in the PMN rendering layer.
            The manuscript data remains intact, but the display component
            has entered an unrecoverable state.
          </div>

          {this.state.error && (
            <pre style={{
              maxWidth: '560px',
              background: 'var(--bg2)',
              border: '1px solid var(--rule)',
              padding: '1rem 1.2rem',
              fontFamily: "'Source Code Pro', monospace",
              fontSize: '.7rem',
              color: 'var(--mute)',
              textAlign: 'left',
              overflow: 'auto',
              whiteSpace: 'pre-wrap',
              wordBreak: 'break-word',
              maxHeight: '120px'
            }}>
              {this.state.error.name}: {this.state.error.message}
            </pre>
          )}

          <div style={{ display: 'flex', gap: '1rem', marginTop: '.5rem' }}>
            <button
              onClick={() => {
                try { localStorage.clear() } catch {}
                window.location.reload()
              }}
              style={{
                fontFamily: "'Source Code Pro', monospace",
                fontSize: '.7rem',
                letterSpacing: '.15em',
                textTransform: 'uppercase',
                background: 'var(--acc)',
                color: '#fff',
                border: 'none',
                padding: '.6rem 1.5rem',
                cursor: 'pointer'
              }}
            >
              Reset &amp; Reload
            </button>
            <button
              onClick={() => {
                this.setState({ hasError: false, error: null })
                window.location.reload()
              }}
              style={{
                fontFamily: "'Source Code Pro', monospace",
                fontSize: '.7rem',
                letterSpacing: '.15em',
                textTransform: 'uppercase',
                background: 'none',
                color: 'var(--ink)',
                border: '1px solid var(--rule)',
                padding: '.6rem 1.5rem',
                cursor: 'pointer'
              }}
            >
              Reload Only
            </button>
          </div>
        </div>
      )
    }

    return this.props.children
  }
}
