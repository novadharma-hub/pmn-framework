import React from 'react'

interface SubSection { id: string; title: string; is_intro?: boolean }
interface Part { part: string; title: string; subs: SubSection[] }

interface SidebarProps {
  parts: Part[]
  readMap: Record<string, boolean>
  curPos: [number, number]
  onSelectSection: (pIdx: number, sIdx: number) => void
  onClose: () => void
  history?: [number, number][]
}

const shortenId = (id: string) => {
  if (id === 'how-to-read-this-document') return 'HTR'
  if (id === 'intellectual-debts') return 'DEBT'
  if (id === 'bibliography') return 'BIB'
  if (id === 'preface') return 'PREF'
  if (id === 'coda') return 'CODA'
  return id
}

export default function Sidebar({ parts, readMap, curPos, onSelectSection, onClose, history = [] }: SidebarProps) {
  return (
    <div id="sidebar" className="select-none flex flex-col h-full overflow-hidden border-r border-pmn-rule bg-pmn-bg2 shrink-0" style={{width: '380px'}}>
      <div className="flex items-center justify-between p-4 border-b border-pmn-rule bg-pmn-bg3/20 sm:hidden">
        <span className="font-mono text-[0.7rem] uppercase tracking-widest text-pmn-ink font-bold">Manuscript Modules</span>
        <button 
          onClick={onClose} 
          className="font-mono text-[0.8rem] text-pmn-mute hover:text-pmn-acc transition-colors p-1"
          aria-label="Close sections"
        >
          ✕
        </button>
      </div>
      <button id="sb-tog" onClick={onClose}>&#8249;</button>
      
      {/* Recent / History box — styled using native CSS classes */}
      {history.length > 0 && (
        <div id="sb-hist" className="sb-hist flex-none border-b border-pmn-rule bg-pmn-bg3/20">
          <div className="sb-hist-lbl py-3 px-4 font-mono text-[0.65rem] text-pmn-acc uppercase tracking-widest font-bold">Recent Activity</div>
          <div id="sb-hist-list" className="flex flex-col gap-1 pb-3">
            {history.map(([pi, si], i) => {
              const p = parts[pi]; const s = p?.subs[si]
              if (!p || !s) return null
              return (
                <button 
                  key={`${pi}-${si}-${i}`}
                  onClick={() => onSelectSection(pi, si)} 
                  className="sb-hist-item hover:bg-pmn-bg group"
                >
                  <span className="sb-hist-sid group-hover:text-pmn-acc">{shortenId(s.id)}</span>
                  <span className="sb-hist-title">{s.title}</span>
                </button>
              )
            })}
          </div>
        </div>
      )}

      {/* Sidebar Tools: Font Controls */}
      <div className="sb-tools desktop-only flex-none py-3 px-4 border-b border-pmn-rule">
        <span className="sb-tools-lbl">Sidebar size</span>
        <div className="font-controls" role="group" aria-label="Sidebar text size">
          <button className="font-btn hover:bg-pmn-bg" type="button" onClick={() => { const v = 0.9; document.documentElement.style.setProperty('--sidebar-scale', String(v)); localStorage.setItem('pmn-sidebar-scale', String(v)); }}>A-</button>
          <button className="font-btn hover:bg-pmn-bg font-bold" type="button" onClick={() => { document.documentElement.style.setProperty('--sidebar-scale', '1'); localStorage.setItem('pmn-sidebar-scale', '1'); }}>A</button>
          <button className="font-btn hover:bg-pmn-bg" type="button" onClick={() => { const v = 1.1; document.documentElement.style.setProperty('--sidebar-scale', String(v)); localStorage.setItem('pmn-sidebar-scale', String(v)); }}>A+</button>
        </div>
      </div>

      {/* Main Navigation List */}
      <div id="sb-list" className="flex-1 overflow-y-auto custom-scrollbar pb-8">
        {parts.map((p, pIdx) => (
          <div key={p.part} className="sb-group flex flex-col">
            {/* Part Label forced to override CSS file constraints to center text precisely */}
            <div 
              className={`sb-plbl flex !items-center justify-start px-4 !pt-4 !pb-4 !h-auto !min-h-0 border-b border-pmn-rule font-pmn-head text-[0.85rem] font-bold uppercase tracking-tight !leading-normal ${curPos[0] === pIdx ? 'on bg-pmn-acc' : 'bg-pmn-bg3/40'}`}
              style={{
                color: curPos[0] === pIdx ? '#ffffff' : 'var(--pmn-ink)',
                borderLeft: curPos[0] === pIdx ? 'none' : '4px solid var(--pmn-acc)'
              }}
            >
              <span className="font-pmn-mono text-[0.65rem] tracking-[0.2em] opacity-60 shrink-0">P.{p.part}</span>
              <span className="mx-2 opacity-30 shrink-0">·</span>
              <span className="min-w-0 break-words">{p.title}</span>
            </div>
            
            <div className="sb-subs flex flex-col border-b border-pmn-rule">
              {p.subs.map((s, sIdx) => {
                const isActive = curPos[0] === pIdx && curPos[1] === sIdx
                const isRead = !!readMap[`${pIdx}-${sIdx}`]
                
                return (
                  <button 
                    key={s.id} 
                    onClick={() => onSelectSection(pIdx, sIdx)} 
                    className={`sb-item ${isActive ? 'on' : ''} ${s.is_intro ? 'intro-sec' : ''}`}
                  >
                    {!s.is_intro && (
                      <span className={`sb-iid ${isActive ? 'on' : ''} ${isRead ? 'r' : ''}`}>
                        {shortenId(s.id)}
                      </span>
                    )}
                    <span className={`sb-ilbl ${isActive ? 'on' : ''}`}>
                      {s.title}
                    </span>
                    {isRead && <span className="toc-chk">✓</span>}
                  </button>
                )
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}