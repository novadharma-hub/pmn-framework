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
  const [query, setQuery] = useState('')
  const totalSections = data.parts.reduce((a, p) => a + (p.subs?.length || 0), 0)
  const readCount = Object.keys(readMap).length
  const readPct = totalSections > 0 ? Math.round((readCount / totalSections) * 100) : 0

  return (
    <div id="srch-view" className="view on flex flex-col h-screen bg-pmn-bg font-pmn-body">
      <header id="hdr" className="sticky top-0 z-[100] h-[52px] px-6 border-b border-pmn-rule flex items-center justify-between select-none">
        <div className="flex items-center gap-6">
          <button onClick={onBackHome} className="font-pmn-head font-bold text-pmn-acc">PMN</button>
          <div className="hidden lg:flex items-center bg-pmn-bg2 border border-pmn-rule px-3 py-1 gap-2 w-[340px]">
            <span className="text-pmn-mute">&#8981;</span>
            <input type="text" value={query} onChange={e => setQuery(e.target.value)} placeholder="Search..." className="bg-transparent border-none outline-none font-pmn-mono text-[0.72rem] text-pmn-ink w-full" />
          </div>
        </div>
        <div className="flex items-center gap-4">
          <button onClick={() => setActiveTab('toc')} className={`font-pmn-mono text-xs ${activeTab === 'toc' ? 'text-pmn-acc' : 'text-pmn-mute'}`}>CONTENTS</button>
          <button onClick={() => setActiveTab('glossary')} className={`font-pmn-mono text-xs ${activeTab === 'glossary' ? 'text-pmn-acc' : 'text-pmn-mute'}`}>GLOSSARY</button>
          <button onClick={onToggleTheme} className="font-pmn-mono text-[0.65rem] border border-pmn-rule2 px-2.5 py-1 text-pmn-mute">{theme === 'dark' ? '☀ LIGHT' : '☾ DARK'}</button>
        </div>
      </header>

      <main id="toc-panel" className="flex-1 overflow-y-auto p-12">
        <div className="max-w-[1000px] mx-auto space-y-12">
          <div className="flex justify-between items-baseline border-b border-pmn-rule pb-4">
            <h2 className="font-pmn-head text-2xl font-bold text-pmn-ink">{activeTab === 'toc' ? 'Manuscript Map' : 'Lexicon'}</h2>
            <div className="font-pmn-mono text-[0.65rem] text-pmn-mute uppercase tracking-widest">Progress: {readPct}% ({readCount}/{totalSections})</div>
          </div>

          {activeTab === 'toc' && (
            <div id="toc-grid" className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {data.parts.map((p, pIdx) => {
                const pRead = p.subs.filter((_, sIdx) => readMap[`${pIdx}-${sIdx}`]).length
                const pPct = Math.round((pRead / p.subs.length) * 100)
                return (
                  <div key={p.part} className="toc-part border border-pmn-rule bg-pmn-bg2 p-6 space-y-4">
                    <div className="space-y-1">
                      <span className="font-pmn-mono text-[0.58rem] text-pmn-acc uppercase tracking-widest">Part {p.part}</span>
                      <h3 className="font-pmn-head text-lg font-bold text-pmn-ink">{p.title}</h3>
                    </div>
                    <div className="toc-subs flex flex-col gap-2 pt-2 border-t border-pmn-rule">
                      {p.subs.map((s, sIdx) => (
                        <button key={s.id} onClick={() => onSelectSection(pIdx, sIdx)} className="text-left font-pmn-body text-xs py-1.5 flex items-baseline gap-3 hover:text-pmn-acc transition-colors">
                          {!s.is_intro && <span className="font-pmn-mono text-pmn-acc min-w-[28px]">{s.id}</span>}
                          <span className="flex-1 truncate">{s.title}</span>
                          {readMap[`${pIdx}-${sIdx}`] && <span className="text-pmn-acc">✓</span>}
                        </button>
                      ))}
                    </div>
                    {p.subs.length > 1 && (
                      <div className="w-full h-[2px] bg-pmn-rule mt-4 overflow-hidden">
                        <div className="h-full bg-pmn-acc" style={{ width: `${pPct}%` }} />
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          )}

          {activeTab === 'glossary' && (
            <div className="space-y-12">
              {Object.entries(data.glg).map(([group, terms]: [string, any]) => (
                <div key={group} className="space-y-6">
                  <h3 className="font-pmn-mono text-[0.65rem] text-pmn-acc uppercase tracking-[0.2em] border-b border-pmn-rule pb-2">{group}</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {terms.map((term: string) => (
                      <div key={term} className="border border-pmn-rule bg-pmn-bg2 p-4 space-y-2">
                        <h4 className="font-pmn-head font-bold text-pmn-ink">{term}</h4>
                        <p className="font-pmn-body text-xs text-pmn-mute leading-relaxed">{data.gl[term] || 'Definisi tertunda.'}</p>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  )
}
