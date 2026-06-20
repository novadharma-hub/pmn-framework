import React, { useState, useEffect } from 'react'

interface NotesModalProps {
  isOpen: boolean
  onClose: () => void
  data: any
  onJump: (pi: number, si: number) => void
}

interface NoteEntry {
  id: string
  title: string
  note: string
  pi: number
  si: number
}

export default function NotesModal({ isOpen, onClose, data, onJump }: NotesModalProps) {
  const [notes, setNotes] = useState<NoteEntry[]>([])
  const [status, setStatus] = useState('')

  // Load notes on open or local storage changes
  useEffect(() => {
    if (!isOpen) return

    const entries: NoteEntry[] = []
    const lookMap = data?.look || {}

    // Find all pmn-an- keys in localStorage
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i)
      if (key && key.startsWith('pmn-an-')) {
        const id = key.substring(7)
        const note = localStorage.getItem(key) || ''
        if (note.trim()) {
          const info = lookMap[id]
          entries.push({
            id,
            title: info?.title || 'Unknown Section',
            note: note.trim(),
            pi: info?.pi ?? 0,
            si: info?.si ?? 0,
          })
        }
      }
    }

    // Sort notes by section ID (numeric or alphabetical structure)
    entries.sort((a, b) => a.id.localeCompare(b.id, undefined, { numeric: true, sensitivity: 'base' }))
    setNotes(entries)
  }, [isOpen, data])

  // Close on ESC key
  useEffect(() => {
    if (!isOpen) return
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [isOpen, onClose])

  if (!isOpen) return null

  const handleCopyAll = () => {
    const text = notes.map(n => `[Section ${n.id} — ${n.title}]\n${n.note}`).join('\n\n---\n\n')
    navigator.clipboard.writeText(text).then(() => {
      setStatus('All notes copied.')
      window.setTimeout(() => setStatus(''), 1800)
    })
  }

  const handleCopyNote = (note: string) => {
    navigator.clipboard.writeText(note).then(() => {
      setStatus('Note copied.')
      window.setTimeout(() => setStatus(''), 1800)
    })
  }

  const handleDeleteNote = (id: string) => {
    if (window.confirm(`Delete the note for section ${id}?`)) {
      localStorage.removeItem(`pmn-an-${id}`)
      setNotes(prev => prev.filter(n => n.id !== id))
      setStatus('Note deleted.')
      window.setTimeout(() => setStatus(''), 1800)
    }
  }

  return (
    <>
      {/* Backdrop */}
      <div
        onClick={onClose}
        style={{
          position: 'fixed',
          inset: 0,
          zIndex: 9980,
          background: 'rgba(0,0,0,0.65)',
          backdropFilter: 'blur(2px)',
          animation: 'pmn-fade-in .15s ease',
        }}
      />

      {/* Modal Container */}
      <div
        role="dialog"
        aria-modal="true"
        aria-label="My Notes"
        style={{
          position: 'fixed',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          zIndex: 9981,
          width: 'min(640px, 92vw)',
          maxHeight: '82vh',
          background: 'var(--bg)',
          border: '1px solid var(--rule)',
          boxShadow: '0 24px 80px rgba(0,0,0,0.5)',
          display: 'flex',
          flexDirection: 'column',
          animation: 'pmn-slide-up .18s ease',
        }}
      >
        {/* Header */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '1rem 1.4rem',
            borderBottom: '1px solid var(--rule)',
            background: 'var(--bg2)',
          }}
        >
          <span
            style={{
              fontFamily: 'var(--f-mono)',
              fontSize: '.65rem',
              letterSpacing: '.2em',
              textTransform: 'uppercase',
              color: 'var(--acc)',
              fontWeight: 700,
            }}
          >
            📝 My Notes
          </span>
          <div style={{ display: 'flex', gap: '.6rem', alignItems: 'center' }}>
            {notes.length > 0 && (
              <button
                onClick={handleCopyAll}
                style={{
                  fontFamily: 'var(--f-mono)',
                  fontSize: '.62rem',
                  letterSpacing: '.1em',
                  textTransform: 'uppercase',
                  background: 'transparent',
                  color: 'var(--mute)',
                  border: '1px solid var(--rule2)',
                  padding: '.3rem .8rem',
                  cursor: 'pointer',
                }}
              >
                Copy all
              </button>
            )}
            <button
              onClick={onClose}
              style={{
                background: 'none',
                border: 'none',
                color: 'var(--mute)',
                cursor: 'pointer',
                fontFamily: 'var(--f-mono)',
                fontSize: '.75rem',
                padding: '.2rem .5rem',
              }}
            >
              [ESC] ×
            </button>
          </div>
        </div>

        {/* Notes List */}
        <div
          style={{
            flex: 1,
            overflowY: 'auto',
            padding: '1.4rem',
            display: 'flex',
            flexDirection: 'column',
            gap: '1.5rem',
          }}
        >
          {notes.length === 0 ? (
            <div
              style={{
                textAlign: 'center',
                fontFamily: 'var(--f-body)',
                fontStyle: 'italic',
                color: 'var(--mute)',
                padding: '2.5rem 0',
              }}
            >
              No saved notes yet. Read the manuscript and save notes from the bottom of any reader section.
            </div>
          ) : (
            notes.map(n => (
              <div
                key={n.id}
                style={{
                  borderBottom: '1px solid var(--rule2)',
                  paddingBottom: '1.2rem',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '.6rem',
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                  <button
                    onClick={() => {
                      onJump(n.pi, n.si)
                      onClose()
                    }}
                    style={{
                      background: 'none',
                      border: 'none',
                      padding: 0,
                      textAlign: 'left',
                      cursor: 'pointer',
                      display: 'flex',
                      gap: '.6rem',
                      alignItems: 'baseline',
                    }}
                  >
                    <span
                      style={{
                        fontFamily: 'var(--f-mono)',
                        fontSize: '.72rem',
                        color: 'var(--acc)',
                        fontWeight: 'bold',
                      }}
                    >
                      {n.id}
                    </span>
                    <span
                      style={{
                        fontFamily: 'var(--f-head)',
                        fontSize: '.9rem',
                        color: 'var(--ink)',
                        textDecoration: 'underline',
                        textDecorationColor: 'transparent',
                        transition: 'text-decoration-color .15s',
                      }}
                      onMouseEnter={e => (e.currentTarget.style.textDecorationColor = 'var(--ink)')}
                      onMouseLeave={e => (e.currentTarget.style.textDecorationColor = 'transparent')}
                    >
                      {n.title}
                    </span>
                  </button>
                  <div style={{ display: 'flex', gap: '.4rem' }}>
                    <button
                      onClick={() => handleCopyNote(n.note)}
                      style={{
                        fontFamily: 'var(--f-mono)',
                        fontSize: '.55rem',
                        letterSpacing: '.05em',
                        background: 'transparent',
                        color: 'var(--mute)',
                        border: '1px solid var(--rule2)',
                        padding: '.15rem .4rem',
                        cursor: 'pointer',
                      }}
                    >
                      Copy
                    </button>
                    <button
                      onClick={() => handleDeleteNote(n.id)}
                      style={{
                        fontFamily: 'var(--f-mono)',
                        fontSize: '.55rem',
                        letterSpacing: '.05em',
                        background: 'transparent',
                        color: 'var(--mute)',
                        border: '1px solid var(--rule2)',
                        padding: '.15rem .4rem',
                        cursor: 'pointer',
                      }}
                      onMouseEnter={e => (e.currentTarget.style.color = 'var(--acc)')}
                      onMouseLeave={e => (e.currentTarget.style.color = 'var(--mute)')}
                    >
                      Delete
                    </button>
                  </div>
                </div>
                <pre
                  style={{
                    fontFamily: 'var(--f-body)',
                    fontSize: '.88rem',
                    lineHeight: 1.6,
                    whiteSpace: 'pre-wrap',
                    color: 'var(--ink2)',
                    margin: 0,
                    padding: '.5rem .8rem',
                    background: 'var(--bg2)',
                    borderLeft: '2px solid var(--rule)',
                  }}
                >
                  {n.note}
                </pre>
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        <div
          style={{
            borderTop: '1px solid var(--rule)',
            padding: '.65rem 1.4rem',
            fontFamily: 'var(--f-mono)',
            fontSize: '.62rem',
            letterSpacing: '.1em',
            color: 'var(--mute)',
            textTransform: 'uppercase',
            background: 'var(--bg2)',
          }}
        >
          Notes: {notes.length} - Press <strong style={{ color: 'var(--acc)' }}>ESC</strong> to close
        </div>
      </div>

      <style>{`
        @keyframes pmn-fade-in { from { opacity: 0 } to { opacity: 1 } }
        @keyframes pmn-slide-up { from { opacity: 0; transform: translate(-50%, -46%) } to { opacity: 1; transform: translate(-50%, -50%) } }
      `}</style>
    </>
  )
}
