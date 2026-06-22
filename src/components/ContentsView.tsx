import React, { useState, useEffect, useMemo } from 'react'

interface SubSection { id: string; title: string; html?: string; text?: string; is_intro?: boolean }
interface Part { part: string; title: string; subs: SubSection[] }

interface ContentsViewProps {
  data: { 
    parts: Part[]; 
    gl: Record<string, string>; 
    glg: Record<string, any>; 
    quotes: any[] 
  }
  readMap: Record<string, boolean>
  curPos: [number, number]
  subView?: 'map' | 'glossary' | 'search'
  searchQuery?: string
  searchPartFilter?: string
  onSelectSection: (pIdx: number, sIdx: number) => void
  onBackHome: () => void
  onSetSubView?: (v: 'map' | 'glossary' | 'search') => void
  onSearch?: (query: string) => void
  contentWidth?: 'narrow' | 'medium' | 'wide'
  onChangeWidth?: (w: 'narrow' | 'medium' | 'wide') => void
  version?: string
}

const shortenId = (id: string) => {
  if (id === 'how-to-read-this-document') return 'HTR'
  if (id === 'intellectual-debts') return 'DEBT'
  if (id === 'bibliography') return 'BIB'
  if (id === 'preface') return 'PREF'
  if (id === 'coda') return 'CODA'
  return id
}

export default function ContentsView({ data, readMap, curPos, subView = 'map', searchQuery = '', searchPartFilter = '', onSelectSection, onBackHome, onSetSubView, onSearch, contentWidth = 'wide', onChangeWidth, version = '' }: ContentsViewProps) {
  const activeTab = subView
  const [quoteIdx, setQuoteIdx] = useState(0)
  const [quoteVisible, setQuoteVisible] = useState(true)

  const totalSections = data.parts.reduce((a, p) => a + (p.subs?.length || 0), 0)
  const readCount = Object.keys(readMap).length
  const readPct = totalSections > 0 ? Math.round((readCount / totalSections) * 100) : 0

  useEffect(() => {
    if (!data.quotes || data.quotes.length <= 1) return
    const interval = setInterval(() => {
      setQuoteIdx(p => (p + 1) % data.quotes.length)
    }, 12000)
    return () => clearInterval(interval)
  }, [data.quotes])

  const findSourceForTerm = (term: string, def: string) => {
    const idMatch = def.match(/\((\d+\.\d+)(?:-\d+\.\d+)?\)/)
    if (idMatch && data.parts) {
      const sid = idMatch[1]
      for (let pIdx = 0; pIdx < data.parts.length; pIdx++) {
        const sIdx = data.parts[pIdx].subs.findIndex(s => s.id === sid)
        if (sIdx !== -1) return { pIdx, sIdx }
      }
    }
    if (data.parts) {
      const lowerTerm = term.toLowerCase()
      for (let pIdx = 0; pIdx < data.parts.length; pIdx++) {
        const sIdx = data.parts[pIdx].subs.findIndex(s => s.title.toLowerCase() === lowerTerm)
        if (sIdx !== -1) return { pIdx, sIdx }
      }
    }
    return null
  }

  // --- SEARCH LOGIC (Legacy Replication) ---
  const searchResults = useMemo(() => {
    if (!searchQuery || searchQuery.length < 2) return []
    const q = searchQuery.toLowerCase()
    const res: any[] = []

    data.parts.forEach((p, pIdx) => {
      // Bug #12: filter by part if searchPartFilter is set
      if (searchPartFilter && p.part !== searchPartFilter) return
      p.subs.forEach((s, sIdx) => {
        const titleMatch = s.title.toLowerCase().includes(q)
        const textContent = s.text || (s.html ? s.html.replace(/<[^>]+>/g, '') : '')
        const contentMatch = textContent.toLowerCase().indexOf(q)
        
        if (titleMatch || contentMatch !== -1) {
          let snippet = ''
          if (contentMatch !== -1) {
            const start = Math.max(0, contentMatch - 60)
            const end = Math.min(textContent.length, contentMatch + q.length + 100)
            snippet = (start > 0 ? '...' : '') + textContent.slice(start, end).trim() + (end < textContent.length ? '...' : '')
          } else if (textContent) {
            snippet = textContent.slice(0, 160) + '...'
          }

          res.push({
            pIdx, sIdx,
            part: p.part,
            id: s.id,
            title: s.title,
            snippet,
            isIntro: s.is_intro
          })
        }
      })
    })
    return res
  }, [data.parts, searchQuery, searchPartFilter])

  const currentQuote = data.quotes[quoteIdx] || { body: '...', title: '...' }

  return (
    <div 
      id="srch-view" 
      className="view on flex flex-col h-full bg-pmn-bg select-none w-full"
    >
      <div className="sv-hdr-wrap flex-none w-full sticky top-0 z-50">
        {/* Full-width relative container so title centers across the whole viewport */}
        <div className="w-full h-[64px] relative flex items-center justify-center px-6 lg:px-10">
          {/* Button absolutely positioned at left edge of the inner 1280px column */}
          <div className="absolute flex items-center" style={{ left: 'max(1.5rem, calc(50% - 640px + 1.5rem))' }}>
            <button
              className="font-mono text-[0.7rem] uppercase tracking-[0.2em] text-pmn-mute hover:text-pmn-acc transition-colors flex items-center gap-2 group whitespace-nowrap"
              onClick={onBackHome}
            >
              <span className="text-base leading-none transition-transform group-hover:-translate-x-1">←</span> Home
            </button>
          </div>

          <h2 className="font-pmn-head font-normal text-[1.15rem] lg:text-[1.35rem] text-pmn-ink whitespace-nowrap leading-none tracking-tight" id="sv-hdr">
            {activeTab === 'map' ? 'Table of Contents — Manuscript Map' : activeTab === 'glossary' ? 'Glossary — Key Terms' : 'Search Analysis'}
          </h2>
        </div>
      </div>
      
      <div id="sv-body-scroll" className="flex-1 overflow-y-auto custom-scrollbar w-full flex flex-col items-center">
        <div id="sv-body" className="w-full flex flex-col items-center max-w-[1280px] mx-auto box-border">

          {activeTab === 'map' && (
            <div id="toc-panel" className="animate-in fade-in slide-in-from-bottom-2 max-w-[1200px] mx-auto">
              <div id="quote-strip" className={quoteVisible ? '' : 'collapsed'}>
                <div id="quote-strip-hdr">
                  <span id="quote-strip-lbl">— PMN —</span>
                  <div style={{display:'flex', gap:'.5rem', alignItems:'center'}}>
                    <button onClick={() => setQuoteIdx(p => (p - 1 + data.quotes.length) % data.quotes.length)} style={{background:'none', border:'none', color:'var(--mute)', cursor:'pointer', fontSize:'1rem'}}>‹</button>
                    <button onClick={() => setQuoteIdx(p => (p + 1) % data.quotes.length)} style={{background:'none', border:'none', color:'var(--mute)', cursor:'pointer', fontSize:'1rem'}}>›</button>
                    <button id="quote-tog" onClick={() => setQuoteVisible(!quoteVisible)} style={{marginLeft:'.5rem'}}>{quoteVisible ? '−' : '+'}</button>
                  </div>
                </div>
                {quoteVisible && (
                  <div id="quote-inner">
                    <div id="quote-body" className="italic font-serif leading-relaxed text-sm">
                      &ldquo;{currentQuote.body || currentQuote}&rdquo;
                    </div>
                    <div id="quote-title" className="text-right font-mono text-[0.6rem] uppercase tracking-widest mt-2 opacity-60">
                      — On the &ldquo;{currentQuote.title || 'Source'}&rdquo;
                    </div>
                    <div className="quote-dots flex justify-center gap-1.5 mt-4">
                      {data.quotes.map((_, i) => (
                        <div key={i} className={`qdot w-1.5 h-1.5 rounded-full ${i === quoteIdx ? 'bg-pmn-acc' : 'bg-pmn-rule'}`} />
                      ))}
                    </div>
                  </div>
                )}
              </div>

              <div className="toc-intro grid grid-cols-1 lg:grid-cols-[1fr_200px] gap-12 mb-20">
                <div className="toc-intro-copy">
                  <div className="toc-intro-toolbar mb-6">
                    <strong className="font-pmn-head text-2xl text-pmn-ink">Reading Room</strong>
                  </div>
                  <p className="font-pmn-body text-[1.05rem] text-pmn-mute leading-relaxed text-justify max-w-[750px]">
                    Use the Table of Contents as an editorial map rather than a raw index: open a part from the top, scan section IDs at speed, or jump straight from foundations into formulas, institutions, and cases.
                  </p>
                </div>
                <div className="toc-intro-stats border border-pmn-rule bg-pmn-bg2 p-8 flex flex-col gap-6 shadow-inner rounded-xs">
                  <div className="toc-stat flex flex-col">
                    <strong className="font-pmn-mono text-[0.6rem] text-pmn-mute uppercase tracking-widest mb-1">Part Groups</strong>
                    <span className="font-pmn-head text-2xl text-pmn-acc">{data.parts.length}</span>
                  </div>
                  <div className="toc-stat flex flex-col">
                    <strong className="font-pmn-mono text-[0.6rem] text-pmn-mute uppercase tracking-widest mb-1">Total Sections</strong>
                    <span className="font-pmn-head text-2xl text-pmn-acc">{totalSections}</span>
                  </div>
                  <div className="toc-stat flex flex-col">
                    <strong className="font-pmn-mono text-[0.6rem] text-pmn-mute uppercase tracking-widest mb-1">Read Progress</strong>
                    <span className="font-pmn-head text-2xl text-pmn-acc">{readPct}%</span>
                  </div>
                </div>
              </div>

              <p className="toc-lbl border-b border-pmn-rule pb-3 mb-12 font-pmn-mono text-[0.7rem] text-pmn-acc uppercase tracking-[0.3em] font-bold opacity-80">Manuscript Mapping</p>
              
              <div id="toc-grid" className="toc-grid">
                {data.parts.map((p, pIdx) => {
                  const isActivePart = curPos[0] === pIdx
                  return (
                    <div key={p.part} className="toc-part group mb-16">
                      <button 
                        className={`toc-ph w-full text-left flex items-center gap-6 pb-5 border-b border-pmn-rule/30 transition-colors hover:border-pmn-acc/40 ${isActivePart ? 'on' : ''}`}
                        onClick={() => onSelectSection(pIdx, 0)}
                      >
                        <span className="toc-pnum font-mono font-bold text-pmn-acc text-[2.2rem] lg:text-[2.8rem] leading-none flex-shrink-0" style={{minWidth: '70px'}}>{p.part}</span>
                        <span className="toc-pname font-pmn-head font-bold text-[1.4rem] lg:text-[1.6rem] text-pmn-ink leading-tight uppercase tracking-tight">{p.title}</span>
                      </button>
                      <div className="toc-subs pt-6">
                        {p.subs.map((s, sIdx) => {
                          const isR = !!readMap[`${pIdx}-${sIdx}`]
                          const isActive = curPos[0] === pIdx && curPos[1] === sIdx
                          return (
                            <button 
                              key={s.id} 
                              onClick={() => onSelectSection(pIdx, sIdx)}
                              className={`toc-sub w-full text-left py-2 px-4 flex items-baseline gap-4 transition-all hover:bg-pmn-acc/5 rounded-r-xs group ${s.is_intro ? 'bg-pmn-acc/5' : ''} ${isActive ? 'on' : ''}`}
                            >
                              {!s.is_intro && <span className={`toc-sid font-mono text-[0.75rem] min-w-[35px] ${isR ? 'text-pmn-mute/50' : 'text-pmn-mute'}`}>{shortenId(s.id)}</span>}
                              <span className={`toc-sname font-pmn-body text-[0.95rem] leading-snug flex-1 ${isR ? 'text-pmn-mute' : 'text-pmn-ink2'} group-hover:text-pmn-ink`}>{s.title}</span>
                              {isR && <span className="text-pmn-acc font-bold text-[0.7rem]">✓</span>}
                            </button>
                          )
                        })}
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          )}

          {activeTab === 'glossary' && (
            <div id="glossary-panel" className="animate-in fade-in slide-in-from-bottom-2 max-w-[1300px] mx-auto">
              <div className="space-y-20">
                {Object.entries(data.glg).map(([group, terms]: [string, any], gIdx) => (
                  <div key={group} className="gl-group" style={{marginTop: gIdx === 0 ? '0' : '6rem'}}>
                    <div className="flex items-center gap-6 mb-12 pb-3 border-b border-pmn-rule/50">
                      <h3 className="font-pmn-mono text-[1.2rem] text-pmn-acc uppercase tracking-[0.4em] font-bold" style={{marginBottom: '0'}}>{group}</h3>
                      <div className="flex-1 h-px bg-pmn-rule/20" />
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
                      {terms.map((term: string) => {
                        const def = data.gl[term] || ''
                        const source = findSourceForTerm(term, def)
                        return (
                          <div 
                            key={term} 
                            className="gl-card border border-pmn-rule bg-pmn-bg2 p-10 space-y-5 shadow-2xl transition-all hover:border-pmn-acc/40 text-left w-full min-h-[140px] flex flex-col group cursor-pointer"
                            onClick={() => {
                              const src = findSourceForTerm(term, def)
                              if (src) onSelectSection(src.pIdx, src.sIdx)
                              else if (onSearch) onSearch(term)
                            }}
                            title={source ? `Go to source section for "${term}"` : `Search for "${term}" in all modules`}>
                            <div className="flex justify-between items-start">
                              <h4 className="gl-term font-pmn-head font-bold text-pmn-ink text-xl transition-colors group-hover:text-pmn-acc" style={{textTransform: 'capitalize'}}>{term}</h4>
                              {source && (
                                <button 
                                  className="text-[0.6rem] font-mono text-pmn-acc opacity-40 group-hover:opacity-100 transition-opacity uppercase tracking-widest hover:underline"
                                  onClick={(e) => {
                                    e.stopPropagation()
                                    onSelectSection(source.pIdx, source.sIdx)
                                  }}
                                >
                                  Source &rarr;
                                </button>
                              )}
                            </div>
                            <p className="gl-def font-pmn-body text-[0.95rem] text-pmn-mute leading-relaxed italic opacity-85 mt-auto">{def || 'Definition pending.'}</p>
                          </div>
                        )
                      })}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'search' && (
            <div id="search-results-panel" className="animate-in fade-in slide-in-from-bottom-2 w-full max-w-[840px] pt-10 flex flex-col items-center" style={{ marginLeft: 'auto', marginRight: 'auto' }}>
              
              <div className="mb-20 text-center w-full">
                <h3 className="font-pmn-head text-4xl lg:text-5xl font-normal text-pmn-ink opacity-90 leading-tight">
                  {searchResults.length} {searchResults.length === 1 ? 'result' : 'results'} for &ldquo;{searchQuery || '...'}&rdquo;
                  {searchPartFilter && <span className="block text-xl mt-3 opacity-50 font-mono uppercase tracking-widest">in Part {searchPartFilter}</span>}
                </h3>
              </div>

              <div className="w-full space-y-0">
                {searchResults.map((r, i) => (
                  <button 
                    key={i} 
                    onClick={() => onSelectSection(r.pIdx, r.sIdx)}
                    className="res w-full text-left bg-pmn-bg py-12 border-b border-pmn-rule/20 hover:bg-pmn-bg2 transition-all group flex flex-col gap-2 px-6 rounded-xs"
                  >
                    <div className="flex items-center gap-3 mb-1">
                      <span className="res-loc font-mono text-[0.65rem] text-pmn-acc uppercase tracking-[0.2em] font-bold">
                        {r.isIntro ? `${r.part}` : `Part ${r.part} \u00B7 ${shortenId(r.id)}`}
                      </span>
                      {readMap[`${r.pIdx}-${r.sIdx}`] && <span className="text-[0.55rem] font-mono text-pmn-mute uppercase tracking-widest border border-pmn-rule px-1.5 py-0.5 opacity-50">Read</span>}
                    </div>
                    
                    <h4 className="res-title font-pmn-head text-2xl font-bold text-pmn-ink group-hover:text-pmn-acc transition-colors leading-tight">
                      {r.title}
                    </h4>

                    {r.snippet && (
                      <p className="res-snip font-pmn-body text-[1.05rem] text-pmn-mute italic leading-relaxed opacity-70 mt-2" 
                         dangerouslySetInnerHTML={{ 
                           __html: r.snippet.replace(new RegExp(`(${searchQuery.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi'), '<span style="color:var(--pmn-acc);font-weight:600;font-style:normal;border-bottom:1px solid var(--pmn-acc)">$1</span>')
                         }} 
                      />
                    )}

                    <div className="flex items-center gap-2 mt-4 opacity-0 group-hover:opacity-100 transition-opacity">
                      <div className="w-8 h-px bg-pmn-acc/40" />
                      <span className="text-[0.6rem] font-mono text-pmn-acc uppercase tracking-[0.2em]">Open Inquiry</span>
                    </div>
                  </button>
                ))}

                {searchResults.length === 0 && (
                  <div className="py-24 w-full flex flex-col items-center text-center">
                    <p className="font-pmn-body text-xl text-pmn-mute italic opacity-60 max-w-[400px] mx-auto leading-relaxed">
                      {searchQuery 
                        ? `No direct matches found in the manuscript for "${searchQuery}".` 
                        : "Enter a term above to begin analytical search."
                      }
                    </p>
                    <button 
                      onClick={() => onSetSubView?.('map')} 
                      className="mt-12 font-pmn-mono text-[0.7rem] text-pmn-acc uppercase tracking-[0.2em] border border-pmn-acc/40 px-8 py-3 hover:bg-pmn-acc hover:text-white transition-all rounded-xs"
                    >
                      Return to Manuscript Map
                    </button>
                  </div>
                )}
              </div>
            </div>
          )}

        </div>
        <footer className="w-full py-20 border-t border-pmn-rule text-center text-[0.7rem] font-pmn-mono text-pmn-mute uppercase tracking-[0.4em] bg-pmn-bg flex-none">
          Progressive Materialist Naturalism &mdash; SYSTEM RELEASE V{version}
        </footer>
      </div>
    </div>
  )
}
