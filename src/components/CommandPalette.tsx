import React, { useState, useEffect, useRef } from 'react'

interface SubSection {
  id: string
  title: string
  html?: string
  text?: string
}

interface Part {
  part: string
  title: string
  subs: SubSection[]
}

interface CommandPaletteProps {
  parts: Part[]
  onSelectSection: (partIdx: number, secIdx: number) => void
  isOpen: boolean
  onClose: () => void
}

export default function CommandPalette({ parts, onSelectSection, isOpen, onClose }: CommandPaletteProps) {
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<{ partIdx: number; secIdx: number; partLabel: string; sec: SubSection }[]>([])
  const inputRef = useRef<HTMLInputElement>(null)

  // Auto focus input when opened
  useEffect(() => {
    if (isOpen) {
      setQuery('')
      setResults([])
      setTimeout(() => inputRef.current?.focus(), 50)
    }
  }, [isOpen])

  // Filter sections by search query
  useEffect(() => {
    if (!query.trim()) {
      setResults([])
      return
    }

    const term = query.toLowerCase()
    const matches: typeof results = []

    parts.forEach((p, pIdx) => {
      p.subs.forEach((s, sIdx) => {
        const titleMatch = s.title.toLowerCase().includes(term)
        const idMatch = s.id.toLowerCase().includes(term)
        const contentMatch = s.html?.toLowerCase().includes(term) || s.text?.toLowerCase().includes(term)
        
        if (titleMatch || idMatch || contentMatch) {
          matches.push({
            partIdx: pIdx,
            secIdx: sIdx,
            partLabel: p.part,
            sec: s,
          })
        }
      })
    })

    setResults(matches.slice(0, 8)) // Limit to 8 results for cleaner layout
  }, [query, parts])

  // Handle key listeners (Close on Esc)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose()
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [onClose])

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-[500] flex items-start justify-center pt-20 px-4 bg-black/70 backdrop-blur-sm select-none">
      {/* Modal Box */}
      <div className="w-full max-w-[620px] bg-[var(--bg)] border border-[var(--rule)] shadow-2xl overflow-hidden flex flex-col max-h-[500px]">
        {/* Search Input */}
        <div className="flex items-center gap-3 border-b border-[var(--rule)] px-4 py-3.5 bg-[var(--sb)]">
          <span className="font-mono text-sm text-[var(--mute2)]">&#8981;</span>
          <input
            ref={inputRef}
            type="text"
            className="flex-1 bg-transparent border-none outline-none font-mono text-xs text-[var(--ink)] placeholder-[var(--mute3)]"
            placeholder="Cari kata kunci atau nomor bab (misal: 3.4b)..."
            value={query}
            onChange={e => setQuery(e.target.value)}
          />
          <button onClick={onClose} className="font-mono text-xs text-[var(--mute)] hover:text-[var(--acc)] cursor-pointer">ESC</button>
        </div>

        {/* Results List */}
        <div className="flex-1 overflow-y-auto divide-y divide-[var(--rule)]">
          {query.trim() === '' ? (
            <div className="p-8 text-center text-xs font-mono text-[var(--mute2)]">
              Ketikkan kata kunci untuk memulai pencarian di seluruh manuskrip.
            </div>
          ) : results.length === 0 ? (
            <div className="p-8 text-center text-xs font-serif italic text-[var(--mute)]">
              Tidak ada bagian yang cocok dengan "{query}".
            </div>
          ) : (
            results.map(({ partIdx, secIdx, partLabel, sec }) => (
              <button
                key={sec.id}
                onClick={() => {
                  onSelectSection(partIdx, secIdx)
                  onClose()
                }}
                className="w-full text-left p-4 hover:bg-[rgba(173,52,30,0.025)] flex flex-col gap-1 cursor-pointer transition-colors"
              >
                <div className="flex justify-between items-baseline font-mono text-[0.6rem] tracking-wider text-[var(--acc)]">
                  <span>Part {partLabel} &mdash; Bab {sec.id}</span>
                  <span className="text-[var(--mute2)]">Lompat ke Bab &rarr;</span>
                </div>
                <h4 className="font-serif text-[0.92rem] font-semibold text-[var(--ink)] leading-snug">{sec.title}</h4>
              </button>
            ))
          )}
        </div>
      </div>
    </div>
  )
}
