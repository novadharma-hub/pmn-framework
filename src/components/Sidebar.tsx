import React from 'react'

interface SubSection { id: string; title: string; is_intro?: boolean }
interface Part { part: string; title: string; subs: SubSection[] }

interface SidebarProps {
  parts: Part[]; readMap: Record<string, boolean>; curPos: [number, number]
  onSelectSection: (pIdx: number, sIdx: number) => void; onClose: () => void
}

export default function Sidebar({ parts, readMap, curPos, onSelectSection, onClose }: SidebarProps) {
  const totalSections = parts.reduce((a, p) => a + (p.subs?.length || 0), 0)
  const readCount = Object.keys(readMap).length
  const readPct = totalSections > 0 ? Math.round((readCount / totalSections) * 100) : 0

  return (
    <aside id="sidebar" className="w-[320px] h-full bg-pmn-bg2 border-r border-pmn-rule flex flex-col flex-shrink-0 z-40 select-none overflow-hidden">
      <div className="p-5 border-b border-pmn-rule flex items-center justify-between bg-pmn-bg">
        <div>
          <span className="block font-pmn-mono text-[0.6rem] text-pmn-mute uppercase tracking-widest mb-1">Manuskrip PMN</span>
          <span className="font-pmn-head text-sm font-bold text-pmn-ink">Daftar Isi</span>
        </div>
        <button onClick={onClose} className="lg:hidden text-pmn-mute hover:text-pmn-acc">&times;</button>
      </div>

      <div className="p-4 bg-pmn-bg2 border-b border-pmn-rule">
        <div className="flex justify-between font-pmn-mono text-[0.6rem] text-pmn-mute uppercase tracking-wider mb-2">
          <span>Progress</span>
          <span>{readPct}% ({readCount}/{totalSections})</span>
        </div>
        <div className="w-full h-[3px] bg-pmn-rule overflow-hidden">
          <div className="h-full bg-pmn-acc transition-all duration-500" style={{ width: `${readPct}%` }} />
        </div>
      </div>

      <nav className="flex-1 overflow-y-auto custom-scrollbar">
        {parts.map((p, pIdx) => (
          <div key={p.part} className="flex flex-col">
            <div className={`p-4 font-pmn-mono text-[0.58rem] text-pmn-acc uppercase tracking-widest bg-pmn-bg3/30 border-b border-pmn-rule ${curPos[0] === pIdx ? 'bg-pmn-acc/5' : ''}`}>
              {p.part} &mdash; {p.title}
            </div>
            <div className="flex flex-col border-b border-pmn-rule">
              {p.subs.map((s, sIdx) => {
                const on = curPos[0] === pIdx && curPos[1] === sIdx
                const r = !!readMap[`${pIdx}-${sIdx}`]
                return (
                  <button key={s.id} onClick={() => onSelectSection(pIdx, sIdx)} className={`w-full text-left py-2.5 px-5 flex items-baseline gap-3 hover:bg-pmn-acc/5 transition-all border-l-2 ${on ? 'border-pmn-acc bg-pmn-bg text-pmn-acc' : 'border-transparent text-pmn-ink2'}`}>
                    {!s.is_intro && <span className={`font-pmn-mono text-[0.68rem] ${on ? 'text-pmn-acc' : 'text-pmn-mute'}`}>{s.id}</span>}
                    <span className={`font-pmn-body text-[0.75rem] leading-snug flex-1 ${on ? 'font-bold' : ''}`}>{s.title}</span>
                    {r && <span className="text-pmn-acc text-[0.6rem]">✓</span>}
                  </button>
                )
              })}
            </div>
          </div>
        ))}
      </nav>
    </aside>
  )
}
