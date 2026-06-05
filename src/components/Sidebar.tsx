import React, { useState } from 'react'

interface SubSection {
  id: string
  title: string
  is_intro: boolean
}

interface Part {
  part: string
  title: string
  subs: SubSection[]
}

interface SidebarProps {
  parts: Part[]
  readMap: Record<string, boolean>
  curPos: [number, number]
  onSelectSection: (partIdx: number, secIdx: number) => void
  onClose: () => void
}

export default function Sidebar({ parts, readMap, curPos, onSelectSection, onClose }: SidebarProps) {
  const [openParts, setOpenParts] = useState<Record<string, boolean>>(() => {
    // Keep active part expanded initially
    const activePartKey = parts[curPos[0]]?.part || ''
    return { [activePartKey]: true }
  })

  const togglePart = (part: string) => {
    setOpenParts(prev => ({ ...prev, [part]: !prev[part] }))
  }

  // Calculate statistics
  const totalSections = parts.reduce((acc, p) => acc + (p.subs?.length || 0), 0)
  const readCount = Object.keys(readMap).length
  const readPct = totalSections > 0 ? Math.round((readCount / totalSections) * 100) : 0

  return (
    <aside className="w-full md:w-[320px] h-full bg-[var(--sb)] border-r border-[var(--rule)] flex flex-col flex-shrink-0 z-40 select-none">
      {/* Sidebar Header */}
      <div className="p-5 border-b border-[var(--rule)] flex items-center justify-between bg-[var(--bg)]">
        <div>
          <span className="block font-mono text-[0.6rem] text-[var(--mute2)] uppercase tracking-[0.2em] mb-1">MANUSKRIP PMN</span>
          <span className="font-serif text-sm font-bold text-[var(--ink)] dark:text-white">Daftar Isi</span>
        </div>
        <button onClick={onClose} className="md:hidden font-mono text-sm text-[var(--mute)] px-2 hover:text-[var(--acc)] cursor-pointer">&times;</button>
      </div>

      {/* Progress Box */}
      <div className="p-4 bg-[var(--bg2)] border-b border-[var(--rule)]">
        <div className="flex justify-between font-mono text-[0.62rem] text-[var(--mute2)] uppercase tracking-wider mb-2">
          <span>Keterbacaan</span>
          <span>{readPct}% ({readCount}/{totalSections})</span>
        </div>
        <div className="w-full h-[3px] bg-[var(--rule)] overflow-hidden">
          <div className="h-full bg-[var(--acc)] transition-all duration-500" style={{ width: `${readPct}%` }} />
        </div>
      </div>

      {/* Scrollable TOC List */}
      <nav className="flex-1 overflow-y-auto divide-y divide-[var(--rule)]">
        {parts.map((p, pIdx) => {
          const isOpen = !!openParts[p.part]
          const isPartActive = curPos[0] === pIdx

          return (
            <div key={p.part} className="flex flex-col">
              {/* Part Header Toggle Button */}
              <button 
                onClick={() => togglePart(p.part)}
                className={`w-full text-left p-4 flex items-center justify-between cursor-pointer hover:bg-[rgba(173,52,30,0.02)] transition-colors ${isPartActive ? 'bg-[var(--surface)]' : ''}`}
              >
                <div className="flex-1 pr-2">
                  <span className="block font-mono text-[0.58rem] text-[var(--acc)] uppercase tracking-wider mb-1">Part {p.part}</span>
                  <span className="font-serif text-xs font-semibold text-[var(--ink)] dark:text-gray-200 leading-tight">{p.title}</span>
                </div>
                <span className="font-mono text-xs text-[var(--mute)] transition-transform duration-200" style={{ transform: isOpen ? 'rotate(90deg)' : 'rotate(0)' }}>
                  ›
                </span>
              </button>

              {/* Sub-sections list */}
              {isOpen && (
                <div className="bg-[rgba(0,0,0,0.05)] dark:bg-[rgba(255,255,255,0.01)] border-t border-[var(--rule)]">
                  {p.subs.map((s, sIdx) => {
                    const isActive = curPos[0] === pIdx && curPos[1] === sIdx
                    const isRead = !!readMap[`${pIdx}-${sIdx}`]

                    return (
                      <button
                        key={s.id}
                        onClick={() => onSelectSection(pIdx, sIdx)}
                        className={`w-full text-left py-2.5 pl-8 pr-4 flex items-baseline gap-2 border-l-2 transition-all cursor-pointer ${isActive ? 'border-l-[var(--acc)] bg-[var(--bg2)] text-[var(--ink)]' : 'border-l-transparent text-[var(--mute)] hover:text-[var(--ink)] hover:bg-[rgba(0,0,0,0.01)]'}`}
                      >
                        {/* Status indicators */}
                        <span className="font-mono text-[0.68rem] text-[var(--acc)] min-w-[28px]">{s.id}</span>
                        <span className="font-serif text-xs leading-relaxed flex-1">{s.title}</span>
                        {isRead && (
                          <span className="font-mono text-[0.55rem] text-[var(--mute2)] tracking-tighter" title="Sudah Dibaca">✓</span>
                        )}
                      </button>
                    )
                  })}
                </div>
              )}
            </div>
          )
        })}
      </nav>
    </aside>
  )
}
