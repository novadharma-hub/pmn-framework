import React, { useEffect } from 'react'

interface KeyboardModalProps {
  isOpen: boolean
  onClose: () => void
}

const SHORTCUTS = [
  { section: 'Navigation', items: [
    { key: 'K', desc: 'Toggle this shortcuts panel' },
    { key: 'C', desc: 'Open Contents map' },
    { key: '/', desc: 'Open Command Palette (jump/search)' },
    { key: 'Esc', desc: 'Close active modal or palette' },
  ]},
  { section: 'Reader', items: [
    { key: '→', desc: 'Next section' },
    { key: '←', desc: 'Previous section' },
    { key: 'F', desc: 'Toggle Focus Mode (hide sidebar)' },
    { key: 'N', desc: 'Toggle Quick Notes modal' },
  ]},
  { section: 'Content', items: [
    { key: '?', desc: 'Jump to Glossary' },
    { key: 'R', desc: 'Resume last reading position' },
    { key: 'Ctrl+S', desc: 'Save note (Reader View)' },
  ]},
]

export default function KeyboardModal({ isOpen, onClose }: KeyboardModalProps) {
  // Close on Escape
  useEffect(() => {
    if (!isOpen) return
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', handleEsc)
    return () => window.removeEventListener('keydown', handleEsc)
  }, [isOpen, onClose])

  if (!isOpen) return null

  return (
    <>
      {/* Backdrop */}
      <div
        onClick={onClose}
        style={{
          position: 'fixed', inset: 0, zIndex: 9990,
          background: 'rgba(0,0,0,0.65)',
          backdropFilter: 'blur(2px)',
          animation: 'pmn-fade-in .15s ease',
        }}
      />

      {/* Modal */}
      <div
        role="dialog"
        aria-modal="true"
        aria-label="Keyboard Shortcuts"
        style={{
          position: 'fixed',
          top: '50%', left: '50%',
          transform: 'translate(-50%, -50%)',
          zIndex: 9991,
          width: 'min(520px, 90vw)',
          background: 'var(--bg)',
          border: '1px solid var(--rule)',
          boxShadow: '0 24px 80px rgba(0,0,0,0.5)',
          animation: 'pmn-slide-up .18s ease',
        }}
      >
        {/* Header */}
        <div style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: '.8rem 1.2rem',
          borderBottom: '1px solid var(--rule)',
          background: 'var(--bg2)',
        }}>
          <span style={{
            fontFamily: 'var(--f-mono)',
            fontSize: '.65rem',
            letterSpacing: '.2em',
            textTransform: 'uppercase',
            color: 'var(--acc)',
            fontWeight: 700,
          }}>
            ⌨ Keyboard Shortcuts
          </span>
          <button
            onClick={onClose}
            style={{
              background: 'none', border: 'none',
              color: 'var(--mute)', cursor: 'pointer',
              fontFamily: 'var(--f-mono)', fontSize: '.75rem',
              padding: '.2rem .5rem',
            }}
          >
            [ESC] ×
          </button>
        </div>

        {/* Shortcut Groups */}
        <div style={{ padding: '1.2rem', display: 'flex', flexDirection: 'column', gap: '1.4rem' }}>
          {SHORTCUTS.map(group => (
            <div key={group.section}>
              <div style={{
                fontFamily: 'var(--f-mono)',
                fontSize: '.6rem',
                letterSpacing: '.2em',
                textTransform: 'uppercase',
                color: 'var(--mute)',
                borderBottom: '1px solid var(--rule)',
                paddingBottom: '.4rem',
                marginBottom: '.65rem',
              }}>
                {group.section}
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '.4rem' }}>
                {group.items.map(item => (
                  <div key={item.key} style={{
                    display: 'flex', alignItems: 'center',
                    justifyContent: 'space-between', gap: '1rem',
                  }}>
                    <span style={{
                      fontFamily: 'var(--f-body)',
                      fontSize: '.85rem',
                      color: 'var(--ink2)',
                    }}>
                      {item.desc}
                    </span>
                    <kbd style={{
                      fontFamily: 'var(--f-mono)',
                      fontSize: '.68rem',
                      background: 'var(--bg2)',
                      border: '1px solid var(--rule2)',
                      color: 'var(--acc)',
                      padding: '.15rem .55rem',
                      whiteSpace: 'nowrap',
                      flexShrink: 0,
                    }}>
                      {item.key}
                    </kbd>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Footer */}
        <div style={{
          borderTop: '1px solid var(--rule)',
          padding: '.65rem 1.2rem',
          fontFamily: 'var(--f-mono)',
          fontSize: '.62rem',
          letterSpacing: '.1em',
          color: 'var(--mute)',
          textTransform: 'uppercase',
        }}>
          Press <strong style={{color:'var(--acc)'}}>K</strong> anytime to toggle · <strong style={{color:'var(--acc)'}}>ESC</strong> to dismiss
        </div>
      </div>

      <style>{`
        @keyframes pmn-fade-in { from { opacity: 0 } to { opacity: 1 } }
        @keyframes pmn-slide-up { from { opacity: 0; transform: translate(-50%, -46%) } to { opacity: 1; transform: translate(-50%, -50%) } }
      `}</style>
    </>
  )
}
