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
    <aside id="sidebar" className="select-none flex flex-col h-full bg-pmn-bg2 border-r border-pmn-rule transition-all duration-300 overflow-hidden">
      
      {/* Sidebar Tool Bar (Mirroring Legacy sb-tools) */}
      <div className="sb-tools p-5 border-b border-pmn-rule bg-pmn-bg/40 backdrop-blur-md">
        <div className="flex items-center justify-between mb-4">
          <div>
            <span className="block font-pmn-mono text-[0.62rem] text-pmn-mute uppercase tracking-[0.2em] mb-1">Manuskrip PMN</span>
            <span className="font-pmn-head text-sm font-bold text-pmn-ink">Daftar Isi</span>
          </div>
          <button onClick={onClose} className="lg:hidden text-pmn-mute hover:text-pmn-acc p-2 cursor-pointer transition-colors">&times;</button>
        </div>

        {/* Local Progress Bar */}
        <span className="block font-pmn-mono text-[0.58rem] text-pmn-mute uppercase tracking-widest mb-2 font-bold">Keterbacaan: {readPct}%</span>
        <div className="w-full h-[2px] bg-pmn-rule overflow-hidden shadow-inner">
          <div className="h-full bg-pmn-acc transition-all duration-700" style={{ width: `${readPct}%` }} />
        </div>
      </div>

      {/* Main Navigation List (Mirroring Legacy sb-list) */}
      <nav id="sb-list" className="flex-1 overflow-y-auto custom-scrollbar divide-y divide-pmn-rule/40 pb-20">
        {parts.map((p, pIdx) => (
          <div key={p.part} className="flex flex-col group">
            {/* Part Label (Legacy sb-plbl) */}
            <div className={`sb-plbl px-5 py-4 font-pmn-mono text-[0.65rem] tracking-[0.2em] uppercase font-bold transition-colors ${curPos[0] === pIdx ? 'text-pmn-acc bg-pmn-acc/5' : 'text-pmn-mute'}`}>
              {p.part} &mdash; {p.title}
            </div>
            
            <div className="flex flex-col">
              {p.subs.map((s, sIdx) => {
                const isActive = curPos[0] === pIdx && curPos[1] === sIdx
                const isRead = !!readMap[`${pIdx}-${sIdx}`]
                
                return (
                  <button 
                    key={s.id} 
                    onClick={() => onSelectSection(pIdx, sIdx)} 
                    className={`sb-item w-full text-left py-3 px-5 flex items-baseline gap-3 transition-all cursor-pointer border-l-2 ${isActive ? 'border-pmn-acc bg-pmn-bg2 text-pmn-ink' : 'border-transparent text-pmn-mute hover:bg-pmn-acc/5 hover:text-pmn-ink2'}`}
                  >
                    {!s.is_intro && (
                      <span className={`sb-iid font-pmn-mono text-[0.7rem] min-w-[32px] font-bold ${isActive ? 'text-pmn-acc' : isRead ? 'text-pmn-acc/50' : 'text-pmn-mute/60'}`}>
                        {s.id}
                      </span>
                    )}
                    <span className={`sb-ilbl font-pmn-body text-[0.8rem] leading-snug flex-1 ${isActive ? 'font-bold' : 'italic'}`}>
                      {s.title}
                    </span>
                    {isRead && <span className="text-pmn-acc text-[0.65rem] font-bold">✓</span>}
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
