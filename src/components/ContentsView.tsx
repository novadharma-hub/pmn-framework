import React, { useState, useEffect, useRef } from 'react'

interface SubSection { id: string; title: string; html?: string; text?: string; is_intro?: boolean }
interface Part { part: string; title: string; subs: SubSection[] }

interface ContentsViewProps {
  data: { parts: Part[]; gl: Record<string, string>; glg: Record<string, any>; quotes: string[] }
  readMap: Record<string, boolean>; curPos: [number, number]
  onSelectSection: (pIdx: number, sIdx: number) => void
  onBackHome: () => void; theme: 'light' | 'dark'; onToggleTheme: () => void
}

export default function ContentsView({ data, readMap, curPos, onSelectSection, onBackHome, theme, onToggleTheme }: ContentsViewProps) {
  const [activeTab, setActiveTab] = useState<'toc' | 'glossary'>('toc')
  const [searchQuery, setSearchQuery] = useState('')
  const totalSections = data.parts.reduce((a, p) => a + (p.subs?.length || 0), 0)
  const readCount = Object.keys(readMap).length
  const readPct = totalSections > 0 ? Math.round((readCount / totalSections) * 100) : 0

  return (
    <div id="srch-view" className="view on flex flex-col h-screen bg-pmn-bg font-pmn-body select-none">
      
      {/* HEADER: Restoration to Original Minimal Style */}
      <header id="hdr" className="sticky top-0 h-[52px] bg-pmn-bg/80 backdrop-blur-lg border-b border-pmn-rule px-6 flex items-center justify-between z-[100] transition-colors">
        <div className="flex items-center gap-6">
          <button onClick={onBackHome} className="font-pmn-head font-bold text-[1.1rem] text-pmn-acc tracking-[0.04em] hover:opacity-80 cursor-pointer">
            PMN
          </button>
          {/* Top Search bar inside Header */}
          <div className="hidden lg:flex items-center bg-pmn-bg2 border border-pmn-rule px-3 py-1.5 gap-2 w-[380px]">
            <span className="text-pmn-acc text-sm font-bold">&#8981;</span>
            <input 
              type="text" 
              value={searchQuery} 
              onChange={e => setSearchQuery(e.target.value)} 
              placeholder="Cari kata kunci atau nomor bab..." 
              className="bg-transparent border-none outline-none font-pmn-mono text-[0.75rem] text-pmn-ink placeholder:text-pmn-mute/40 w-full" 
            />
          </div>
        </div>

        <div className="flex items-center gap-4">
          <button 
            onClick={() => setActiveTab('toc')} 
            className={`font-pmn-mono text-[0.66rem] uppercase tracking-[0.18em] px-4 py-1.5 transition-all cursor-pointer ${activeTab === 'toc' ? 'bg-pmn-acc text-white dark:text-black font-bold shadow-md' : 'text-pmn-mute hover:text-pmn-ink'}`}
          >
            Contents
          </button>
          <button 
            onClick={() => setActiveTab('glossary')} 
            className={`font-pmn-mono text-[0.66rem] uppercase tracking-[0.18em] px-4 py-1.5 transition-all cursor-pointer ${activeTab === 'glossary' ? 'bg-pmn-acc text-white dark:text-black font-bold shadow-md' : 'text-pmn-mute hover:text-pmn-ink'}`}
          >
            Glossary
          </button>
          <button onClick={onToggleTheme} className="font-pmn-mono text-[0.62rem] border border-pmn-rule2 px-3 py-1.5 text-pmn-mute hover:text-pmn-acc transition-all cursor-pointer">
            {theme === 'dark' ? '☀ LIGHT' : '☾ DARK'}
          </button>
        </div>
      </header>

      {/* VIEW PANEL SHELL (Legacy toc-panel) */}
      <main id="toc-panel" className="flex-1 overflow-y-auto custom-scrollbar pt-12 pb-24">
        <div className="max-w-[1150px] mx-auto px-8 space-y-12">
          
          {/* Breadcrumb Header */}
          <div className="flex justify-between items-baseline border-b border-pmn-rule/60 pb-6 flex-wrap gap-6">
            <h2 className="font-pmn-head text-3xl font-bold text-pmn-ink tracking-tight">
              {activeTab === 'toc' ? 'Manuscript Map — Peta Manuskrip' : 'Lexicon — Glosarium Istilah'}
            </h2>
            <div className="flex items-center gap-6 font-pmn-mono text-[0.65rem] text-pmn-mute uppercase tracking-[0.2em] font-bold">
               <div className="flex items-center gap-2">
                  <span className="text-pmn-acc">Release:</span> V117.6
               </div>
               <div className="flex items-center gap-2">
                  <span className="text-pmn-acc">Progress:</span> {readPct}% ({readCount}/{totalSections})
               </div>
            </div>
          </div>

          {/* TAB 1: TABLE OF CONTENTS (toc-grid) */}
          {activeTab === 'toc' && (
            <div id="toc-grid" className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-12 gap-y-16">
              {data.parts.map((p, pIdx) => {
                const pRead = p.subs.filter((_, sIdx) => readMap[`${pIdx}-${sIdx}`]).length
                const pPct = Math.round((pRead / p.subs.length) * 100)
                
                return (
                  <div key={p.part} className="toc-part flex flex-col space-y-5 animate-in fade-in slide-in-from-bottom-2">
                    {/* Part Header (Legacy toc-ph) */}
                    <div className="toc-ph border-b border-pmn-rule/80 pb-3 flex items-baseline gap-3">
                       <span className="toc-pnum font-pmn-mono font-bold text-pmn-acc text-[0.75rem] tracking-[0.2em]">{p.part}</span>
                       <h3 className="toc-pname font-pmn-head text-[1.15rem] font-bold text-pmn-ink leading-tight flex-1">{p.title}</h3>
                    </div>

                    {/* Sub-sections List (Legacy toc-subs) */}
                    <div className="toc-subs flex flex-col gap-1.5">
                      {p.subs.map((s, sIdx) => {
                        const isR = readMap[`${pIdx}-${sIdx}`]
                        return (
                          <button 
                            key={s.id} 
                            onClick={() => onSelectSection(pIdx, sIdx)} 
                            className={`toc-sub w-full text-left py-2 px-3 flex items-baseline gap-4 transition-all border-l-2 cursor-pointer rounded-r-xs group ${s.is_intro ? 'bg-pmn-acc/5 border-pmn-acc/40' : 'border-transparent hover:bg-pmn-bg2 hover:border-pmn-acc/30'}`}
                          >
                            {!s.is_intro && (
                              <span className={`toc-sid font-pmn-mono text-[0.72rem] min-w-[34px] font-bold ${isR ? 'text-pmn-mute/50' : 'text-pmn-acc'}`}>
                                {s.id}
                              </span>
                            )}
                            <span className={`toc-sname font-pmn-body text-[0.85rem] leading-snug flex-1 transition-colors ${isR ? 'text-pmn-mute' : 'text-pmn-ink2'} group-hover:text-pmn-ink`}>
                              {s.title}
                            </span>
                            {isR && <span className="text-pmn-acc font-bold text-[0.65rem]">✓</span>}
                          </button>
                        )
                      })}
                    </div>

                    {/* Local Progress Bar */}
                    {p.subs.length > 1 && (
                      <div className="flex items-center gap-4 pt-2">
                        <div className="flex-1 h-[2px] bg-pmn-rule overflow-hidden">
                           <div className="h-full bg-pmn-acc opacity-60" style={{ width: `${pPct}%` }} />
                        </div>
                        <span className="font-pmn-mono text-[0.55rem] text-pmn-mute font-bold tracking-widest">{pPct}%</span>
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          )}

          {/* TAB 2: GLOSSARY (Lexicon Grid) */}
          {activeTab === 'glossary' && (
            <div className="space-y-16 animate-in fade-in slide-in-from-bottom-2">
              {Object.entries(data.glg).map(([group, terms]: [string, any]) => (
                <div key={group} className="space-y-8">
                  <div className="flex items-center gap-5 select-none">
                     <h3 className="font-pmn-mono text-[0.7rem] text-pmn-acc uppercase tracking-[0.3em] font-bold whitespace-nowrap">{group}</h3>
                     <div className="flex-1 h-px bg-pmn-rule/60" />
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {terms.map((term: string) => (
                      <div key={term} className="gl-card group border border-pmn-rule bg-pmn-bg2 p-6 space-y-3 transition-all hover:border-pmn-acc/50 hover:translate-y-[-2px] shadow-sm hover:shadow-xl">
                        <h4 className="gl-term font-pmn-head text-[1.05rem] font-bold text-pmn-ink group-hover:text-pmn-acc transition-colors">{term}</h4>
                        <p className="gl-def font-pmn-body text-[0.82rem] text-pmn-mute leading-relaxed italic opacity-85">
                          {data.gl[term] || 'Definisi teknis tertunda dalam versi ini.'}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>

      {/* FOOTER */}
      <footer className="h-[60px] border-t border-pmn-rule bg-pmn-bg flex items-center justify-center font-pmn-mono text-[0.62rem] text-pmn-mute uppercase tracking-[0.3em] select-none">
         Progressive Materialist Naturalism &mdash; V117.6
      </footer>
    </div>
  )
}
