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
    <div className="fixed inset-0 z-[500] flex items-start justify-center pt-20 px-4 bg-black/75 backdrop-blur-sm select-none">
      {/* Modal Box */}
      <div className="w-full max-w-[620px] bg-pmn-bg border border-pmn-rule shadow-2xl overflow-hidden flex flex-col max-h-[500px]">
        {/* Search Input */}
        <div className="flex items-center gap-3 border-b border-pmn-rule px-5 py-4 bg-pmn-bg2">
          <span className="font-pmn-mono text-sm text-pmn-mute">&#8981;</span>
          <input
            ref={inputRef}
            type="text"
            className="flex-1 bg-transparent border-none outline-none font-pmn-mono text-[0.8rem] text-pmn-ink placeholder:text-pmn-mute/40"
            placeholder="Cari kata kunci atau nomor bab (misal: 3.4b)..."
            value={query}
            onChange={e => setQuery(e.target.value)}
          />
          <button onClick={onClose} className="font-pmn-mono text-[0.62rem] text-pmn-mute border border-pmn-rule px-2 py-1 hover:text-pmn-acc hover:border-pmn-acc cursor-pointer transition-all">ESC</button>
        </div>

        {/* Results List */}
        <div className="flex-1 overflow-y-auto divide-y divide-pmn-rule">
          {query.trim() === '' ? (
            <div className="p-12 text-center text-[0.7rem] font-pmn-mono text-pmn-mute uppercase tracking-widest opacity-60">
              Ketikkan kata kunci untuk memicu pencarian dialektikal.
            </div>
          ) : results.length === 0 ? (
            <div className="p-12 text-center text-[0.85rem] font-pmn-body italic text-pmn-mute">
              Tidak ada modul yang cocok dengan "{query}".
            </div>
          ) : (
            results.map(({ partIdx, secIdx, partLabel, sec }) => (
              <button
                key={sec.id}
                onClick={() => {
                  onSelectSection(partIdx, secIdx)
                  onClose()
                }}
                className="w-full text-left p-5 hover:bg-pmn-acc/5 flex flex-col gap-1.5 cursor-pointer transition-colors"
              >
                <div className="flex justify-between items-baseline font-pmn-mono text-[0.6rem] tracking-[0.15em] text-pmn-acc uppercase font-bold">
                  <span>Part {partLabel} &mdash; Module {sec.id}</span>
                  <span className="text-pmn-mute/50 font-normal">Navigate &rarr;</span>
                </div>
                <h4 className="font-pmn-head text-[1rem] font-bold text-pmn-ink leading-snug group-hover:text-pmn-acc transition-colors">{sec.title}</h4>
              </button>
            ))
          )}
        </div>
      </div>
    </div>
  )
}
