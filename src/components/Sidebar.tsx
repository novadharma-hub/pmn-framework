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

const SPECIAL: Record<string, number> = { Preface: 1, Coda: 1, 'Intellectual Debts': 1, Bibliography: 1 }

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
    <aside className="w-full md:w-[320px] h-full bg-pmn-bg2 border-r border-pmn-rule flex flex-col flex-shrink-0 z-40 select-none">
      {/* Sidebar Header */}
      <div className="p-5 border-b border-pmn-rule flex items-center justify-between bg-pmn-bg">
        <div>
          <span className="block font-pmn-mono text-[0.6rem] text-pmn-mute uppercase tracking-[0.2em] mb-1">MANUSKRIP PMN</span>
          <span className="font-pmn-head text-sm font-bold text-pmn-ink">Daftar Isi</span>
        </div>
        <button onClick={onClose} className="md:hidden font-pmn-mono text-sm text-pmn-mute px-2 hover:text-pmn-acc cursor-pointer">&times;</button>
      </div>

      {/* Progress Box */}
      <div className="p-4 bg-pmn-bg2 border-b border-pmn-rule">
        <div className="flex justify-between font-pmn-mono text-[0.62rem] text-pmn-mute uppercase tracking-wider mb-2">
          <span>Keterbacaan</span>
          <span>{readPct}% ({readCount}/{totalSections})</span>
        </div>
        <div className="w-full h-[3px] bg-pmn-rule overflow-hidden">
          <div className="h-full bg-pmn-acc transition-all duration-500" style={{ width: `${readPct}%` }} />
        </div>
      </div>

      {/* Scrollable TOC List */}
      <nav className="flex-1 overflow-y-auto divide-y divide-pmn-rule">
        {parts.map((p, pIdx) => {
          const isOpen = !!openParts[p.part]
          const isPartActive = curPos[0] === pIdx
          const isSpecial = SPECIAL[p.part]
          const pLabel = isSpecial ? p.title : `Part ${p.part}`
          const pSubtext = isSpecial ? '' : p.title

          return (
            <div key={p.part} className="flex flex-col">
              {/* Part Header Toggle Button */}
              <button 
                onClick={() => togglePart(p.part)}
                className={`w-full text-left p-4 flex items-center justify-between cursor-pointer hover:bg-pmn-acc/5 transition-colors ${isPartActive ? 'bg-pmn-bg3/20' : ''}`}
              >
                <div className="flex-1 pr-2">
                  <span className="block font-pmn-mono text-[0.58rem] text-pmn-acc uppercase tracking-wider mb-1">{pLabel}</span>
                  {pSubtext && (
                    <span className="font-pmn-head text-xs font-semibold text-pmn-ink leading-tight">{pSubtext}</span>
                  )}
                </div>
                <span className="font-pmn-mono text-xs text-pmn-mute transition-transform duration-200" style={{ transform: isOpen ? 'rotate(90deg)' : 'rotate(0)' }}>
                  ›
                </span>
              </button>

              {/* Sub-sections list */}
              {isOpen && (
                <div className="bg-black/5 dark:bg-white/5 border-t border-pmn-rule">
                  {p.subs.map((s, sIdx) => {
                    const isActive = curPos[0] === pIdx && curPos[1] === sIdx
                    const isRead = !!readMap[`${pIdx}-${sIdx}`]

                    return (
                      <button
                        key={s.id}
                        onClick={() => onSelectSection(pIdx, sIdx)}
                        className={`w-full text-left py-2.5 pl-8 pr-4 flex items-baseline gap-2 border-l-2 transition-all cursor-pointer ${isActive ? 'border-l-pmn-acc bg-pmn-bg2 text-pmn-ink' : 'border-l-transparent text-pmn-mute hover:text-pmn-ink hover:bg-pmn-bg3/5'}`}
                      >
                        {/* Status indicators */}
                        <span className="font-pmn-mono text-[0.68rem] text-pmn-acc min-w-[28px]">{s.id}</span>
                        <span className="font-pmn-body text-xs leading-relaxed flex-1">{s.title}</span>
                        {isRead && (
                          <span className="font-pmn-mono text-[0.55rem] text-pmn-mute" title="Sudah Dibaca">✓</span>
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
