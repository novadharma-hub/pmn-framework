import React, { useState, useEffect, useRef } from 'react'

interface SubSection {
  id: string
  title: string
  html?: string
  text?: string
  is_intro: boolean
}

interface Part {
  part: string
  title: string
  subs: SubSection[]
}

const SPECIAL: Record<string, number> = { Preface: 1, Coda: 1, 'Intellectual Debts': 1, Bibliography: 1 }

const pshort = (partObj: Part) => {
  if (!partObj) return ''
  return SPECIAL[partObj.part] ? partObj.title : 'Part ' + partObj.part
}

interface ContentsViewProps {
  data: {
    parts: Part[]
    gl: Record<string, string>
    glg: Record<string, any>
    rel: Record<string, any>
    look: Record<string, any>
    quotes: string[] | any[]
    ci: Record<string, any>
  }
  readMap: Record<string, boolean>
  curPos: [number, number]
  onSelectSection: (partIdx: number, secIdx: number) => void
  onBackHome: () => void
  theme: 'dark' | 'light'
  onToggleTheme: () => void
  initialTab?: 'toc' | 'glossary' | 'search'
}

interface SearchResult {
  pi: number
  si: number
  p: Part
  s: SubSection
  snip: string
  isGlossaryMatch?: boolean
}

export default function ContentsView({
  data,
  readMap,
  curPos,
  onSelectSection,
  onBackHome,
  theme,
  onToggleTheme,
  initialTab = 'toc'
}: ContentsViewProps) {
  const [activeTab, setActiveTab] = useState<'toc' | 'glossary' | 'search'>(initialTab)
  const [searchQuery, setSearchQuery] = useState('')
  const [partFilter, setPartFilter] = useState<string>('')
  const [searchResults, setSearchResults] = useState<SearchResult[]>([])
  
  // Scales and Customization
  const [contentsScale, setContentsScale] = useState(1)
  
  // Quotes strip states
  const [quotesCollapsed, setQuotesCollapsed] = useState(false)
  const [currentQuoteIdx, setCurrentQuoteIdx] = useState(0)

  const searchInputRef = useRef<HTMLInputElement>(null)

  // Load contents scale and quotes collapse setting on mount
  useEffect(() => {
    try {
      const savedScale = parseFloat(localStorage.getItem('pmn-contents-scale') || '1')
      if ([0.94, 1, 1.1].includes(savedScale)) setContentsScale(savedScale)

      const savedQuotesCollapsed = localStorage.getItem('pmn-quotes-collapsed') === '1'
      setQuotesCollapsed(savedQuotesCollapsed)
    } catch (e) {}
    
    // Choose a random quote to start
    if (data.quotes && data.quotes.length > 0) {
      setCurrentQuoteIdx(Math.floor(Math.random() * data.quotes.length))
    }
  }, [data.quotes])

  // Sync contents scale
  useEffect(() => {
    document.documentElement.style.setProperty('--contents-scale', String(contentsScale))
  }, [contentsScale])

  // Quotes rotation timer
  useEffect(() => {
    if (quotesCollapsed || !data.quotes || data.quotes.length <= 1) return

    const timer = setInterval(() => {
      setCurrentQuoteIdx(prev => (prev + 1) % data.quotes.length)
    }, 18000)

    return () => clearInterval(timer)
  }, [quotesCollapsed, data.quotes])

  // Helper: strip HTML tags
  const stripHtml = (str: string) => {
    return (str || '')
      .replace(/<br\s*\/?>/gi, '\n')
      .replace(/<[^>]+>/g, ' ')
      .replace(/&amp;/g, '&')
      .replace(/&lt;/g, '<')
      .replace(/&gt;/g, '>')
      .replace(/&nbsp;/g, ' ')
      .trim()
  }

  // Smart search logic ported from app.ts (L1074-1194)
  const runSearch = (q: string, filterByPart: string) => {
    if (!q.trim()) {
      setSearchResults([])
      return
    }

    const ql = q.toLowerCase().trim()
    
    // Exact section ID match (e.g. "3.4") -> directly open it!
    const resolvedId = data.look[ql] ? ql : null
    if (resolvedId && data.look[resolvedId]) {
      const info = data.look[resolvedId]
      onSelectSection(info.pi, info.si)
      return
    }

    const results: SearchResult[] = []
    const addedSections: Record<string, boolean> = {}

    // 1. Smart Glossary mapping (find citations in glossary definition)
    let matchedTermKey = null
    const keys = Object.keys(data.gl)
    const citedSections: string[] = []

    for (let i = 0; i < keys.length; i++) {
      const k = keys[i]
      if (k.toLowerCase() === ql || ql.includes(k.toLowerCase()) || k.toLowerCase().includes(ql)) {
        matchedTermKey = k
        const def = data.gl[k]
        const rx = /\((\d+\.\d+[a-z]?)\)/g
        let match
        while ((match = rx.exec(def)) !== null) {
          const secId = match[1]
          if (!citedSections.includes(secId)) citedSections.push(secId)
        }
      }
    }

    // Add cited glossary match sections first
    citedSections.forEach(secId => {
      const info = data.look[secId]
      if (info) {
        if (filterByPart !== '' && info.pi !== parseInt(filterByPart)) return
        const p = data.parts[info.pi]
        const s = p.subs[info.si]
        const key = `${info.pi}-${info.si}`
        if (!addedSections[key]) {
          results.push({
            pi: info.pi,
            si: info.si,
            p,
            s,
            snip: `<em>Istilah Kunci: "${matchedTermKey}" dirujuk di bagian ini.</em>`,
            isGlossaryMatch: true
          })
          addedSections[key] = true
        }
      }
    })

    // 2. Scan all parts for regular matching
    data.parts.forEach((p, pIdx) => {
      if (filterByPart !== '' && pIdx !== parseInt(filterByPart)) return

      p.subs.forEach((s, sIdx) => {
        const key = `${pIdx}-${sIdx}`
        if (addedSections[key]) return // Already added as glossary match

        const stxt = stripHtml(s.html || s.text || '')
        let matched = false
        let snip = ''

        // Strict substring match
        if (s.title.toLowerCase().includes(ql) || stxt.toLowerCase().includes(ql)) {
          matched = true
          const idx = stxt.toLowerCase().indexOf(ql)
          if (idx >= 0) {
            const start = Math.max(0, idx - 90)
            const end = Math.min(stxt.length, idx + 160)
            snip = (start > 0 ? '…' : '') + stxt.slice(start, end) + (end < stxt.length ? '…' : '')
          }
        }
        // Multi-word token fallback
        else if (ql.includes(' ')) {
          const words = ql.split(/\s+/).filter(w => w.length > 2)
          if (words.length >= 2) {
            const allWordsPresent = words.every(w => s.title.toLowerCase().includes(w) || stxt.toLowerCase().includes(w))
            if (allWordsPresent) {
              matched = true
              const firstWord = words[0]
              const idx = stxt.toLowerCase().indexOf(firstWord)
              if (idx >= 0) {
                const start = Math.max(0, idx - 90)
                const end = Math.min(stxt.length, idx + 160)
                snip = (start > 0 ? '…' : '') + stxt.slice(start, end) + (end < stxt.length ? '…' : '')
              }
            }
          }
        }

        if (matched) {
          results.push({ pi: pIdx, si: sIdx, p, s, snip })
          addedSections[key] = true
        }
      })
    })

    setSearchResults(results)
  }

  // Handle Search Input Change
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value
    setSearchQuery(val)
    if (val.trim().length >= 3) {
      setActiveTab('search')
      runSearch(val, partFilter)
    } else if (!val) {
      setSearchResults([])
      setActiveTab('toc')
    }
  }

  const handlePartFilterChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const filter = e.target.value
    setPartFilter(filter)
    runSearch(searchQuery, filter)
  }

  const handleClearSearch = () => {
    setSearchQuery('')
    setSearchResults([])
    setActiveTab('toc')
  }

  const handleGlossaryCardClick = (term: string) => {
    setSearchQuery(term)
    setActiveTab('search')
    runSearch(term, partFilter)
  }

  const toggleQuotes = () => {
    const nextState = !quotesCollapsed
    setQuotesCollapsed(nextState)
    localStorage.setItem('pmn-quotes-collapsed', nextState ? '1' : '0')
  }

  const setContentsScaleValue = (scale: number) => {
    setContentsScale(scale)
    localStorage.setItem('pmn-contents-scale', String(scale))
  }

  // Highlight matches inside snippets
  const highlightQuery = (text: string) => {
    if (!searchQuery || searchQuery.length < 2) return text
    const escapedQuery = searchQuery.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
    const regex = new RegExp(`(${escapedQuery})`, 'gi')
    return text.replace(regex, '<mark>$1</mark>')
  }

  // Stats calculation
  const totalSections = data.parts.reduce((acc, p) => acc + (p.subs?.length || 0), 0)
  const readCount = Object.keys(readMap).length
  const readPct = totalSections > 0 ? Math.round((readCount / totalSections) * 100) : 0

  return (
    <div className="relative z-10 flex-1 flex flex-col min-h-screen">
      
      {/* HEADER BAR */}
      <header className="sticky top-0 bg-[var(--hdr)] border-b border-[var(--rule)] h-[52px] px-6 flex items-center justify-between z-[100] select-none">
        <div className="flex items-center gap-4 flex-1">
          <button onClick={onBackHome} className="font-serif font-bold text-[1.05rem] text-[var(--acc)] tracking-[0.04em] hover:opacity-75 cursor-pointer">
            PMN
          </button>
          
          {/* Top Search bar */}
          <div className="relative flex items-center bg-[var(--surface)] border border-[var(--rule)] rounded-xs px-2.5 py-1 w-full max-w-[340px]">
            <span className="font-mono text-xs text-[var(--mute2)] mr-2">&#8981;</span>
            <input 
              ref={searchInputRef}
              type="text" 
              value={searchQuery}
              onChange={handleSearchChange}
              placeholder="Cari kata kunci atau nomor bab..." 
              className="bg-transparent border-none outline-none font-mono text-[0.72rem] text-[var(--ink)] placeholder-[var(--mute3)] w-full"
            />
            {searchQuery && (
              <button onClick={handleClearSearch} className="text-xs text-[var(--mute)] hover:text-[var(--acc)] px-1 cursor-pointer">&times;</button>
            )}
          </div>
        </div>

        <div className="flex items-center gap-4">
          <button onClick={() => setActiveTab('toc')} className={`font-mono text-[0.66rem] uppercase tracking-wider px-3 py-1 cursor-pointer transition-colors ${activeTab === 'toc' ? 'bg-[var(--acc)] text-white dark:text-black font-bold' : 'text-[var(--mute)] hover:text-[var(--ink)]'}`}>
            Daftar Isi
          </button>
          <button onClick={() => setActiveTab('glossary')} className={`font-mono text-[0.66rem] uppercase tracking-wider px-3 py-1 cursor-pointer transition-colors ${activeTab === 'glossary' ? 'bg-[var(--acc)] text-white dark:text-black font-bold' : 'text-[var(--mute)] hover:text-[var(--ink)]'}`}>
            Glossary
          </button>
          <button onClick={onToggleTheme} className="font-mono text-[0.65rem] border border-[var(--rule2)] px-2.5 py-1 text-[var(--mute)] hover:text-[var(--acc)] cursor-pointer">
            {theme === 'dark' ? '☀ LIGHT' : '☾ DARK'}
          </button>
        </div>
      </header>

      {/* VIEW PANEL SHELL */}
      <div className="flex-1 max-w-[1000px] w-full mx-auto px-6 py-12 flex flex-col gap-8">
        
        {/* ROTATING QUOTES STRIP */}
        {data.quotes && data.quotes.length > 0 && (
          <div id="quote-strip" className={`border border-[var(--rule)] bg-[var(--bg2)] p-4 relative transition-all duration-300 ${quotesCollapsed ? 'h-[42px] overflow-hidden' : ''}`}>
            <div id="quote-strip-hdr" className="flex justify-between items-center border-b border-[var(--rule)] pb-2 mb-2 select-none">
              <span id="quote-strip-lbl" className="font-mono text-[0.58rem] text-[var(--acc)] uppercase tracking-widest">— PMN AXIOM SHIELD —</span>
              <button onClick={toggleQuotes} className="font-mono text-xs text-[var(--mute)] hover:text-[var(--acc)] px-2 cursor-pointer">
                {quotesCollapsed ? '+' : '−'}
              </button>
            </div>
            {!quotesCollapsed && (
              <div id="quote-inner" className="space-y-2 py-2">
                <blockquote id="quote-body" className="font-serif italic text-sm text-[var(--ink)] leading-relaxed transition-opacity duration-500">
                  &ldquo;{data.quotes[currentQuoteIdx]?.body || data.quotes[currentQuoteIdx]}&rdquo;
                </blockquote>
                {data.quotes[currentQuoteIdx]?.title && (
                  <cite id="quote-title" className="block font-mono text-[0.6rem] text-[var(--mute2)] text-right not-italic uppercase tracking-wider">
                    — {data.quotes[currentQuoteIdx].title}
                  </cite>
                )}
                <div className="flex justify-center gap-1.5 pt-2">
                  {data.quotes.map((_, i) => (
                    <button 
                      key={i} 
                      onClick={() => setCurrentQuoteIdx(i)}
                      className={`w-1.5 h-1.5 rounded-full transition-all cursor-pointer ${i === currentQuoteIdx ? 'bg-[var(--acc)] scale-125' : 'bg-[var(--rule)]'}`}
                    />
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* BREADCRUMB HEADER */}
        <div className="flex justify-between items-baseline border-b border-[var(--rule)] pb-4 flex-wrap gap-4 select-none">
          <h2 className="font-serif text-2xl font-bold text-[var(--ink)]">
            {activeTab === 'toc' && 'Daftar Isi — Peta Manuskrip'}
            {activeTab === 'glossary' && 'Lexicon — Istilah Kunci'}
            {activeTab === 'search' && `Pencarian: "${searchQuery}"`}
          </h2>
          
          <div className="flex items-center gap-4 flex-wrap">
            {/* Scale adjustment */}
            <div className="flex items-center gap-2">
              <span className="font-mono text-[0.58rem] text-[var(--mute2)] uppercase">Skala Teks</span>
              <div className="font-controls flex border border-[var(--rule)]">
                <button onClick={() => setContentsScaleValue(0.94)} className={`font-mono text-[0.68rem] px-2 py-0.5 border-r border-[var(--rule)] cursor-pointer hover:bg-[rgba(201,168,76,0.05)] ${contentsScale === 0.94 ? 'bg-[var(--acc)] text-white dark:text-black font-bold' : 'text-[var(--mute)]'}`}>A-</button>
                <button onClick={() => setContentsScaleValue(1)} className={`font-mono text-[0.68rem] px-2.5 py-0.5 border-r border-[var(--rule)] cursor-pointer hover:bg-[rgba(201,168,76,0.05)] ${contentsScale === 1 ? 'bg-[var(--acc)] text-white dark:text-black font-bold' : 'text-[var(--mute)]'}`}>A</button>
                <button onClick={() => setContentsScaleValue(1.1)} className={`font-mono text-[0.68rem] px-2 py-0.5 cursor-pointer hover:bg-[rgba(201,168,76,0.05)] ${contentsScale === 1.1 ? 'bg-[var(--acc)] text-white dark:text-black font-bold' : 'text-[var(--mute)]'}`}>A+</button>
              </div>
            </div>
            
            {/* Stats */}
            <div className="flex items-center gap-3 font-mono text-[0.63rem] text-[var(--mute)] bg-[var(--bg2)] border border-[var(--rule)] px-3 py-1">
              <span>Rilis: <strong>V117.6</strong></span>
              <span>•</span>
              <span>Bab: <strong>{totalSections}</strong></span>
              <span>•</span>
              <span>Keterbacaan: <strong>{readPct}%</strong></span>
            </div>
          </div>
        </div>

        {/* CONTENTS TAB: TOC GRID */}
        {activeTab === 'toc' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {data.parts.map((p, pIdx) => {
              const subs = p.subs || []
              const totalPartSubs = subs.length
              const readPartCount = subs.filter((_, sIdx) => !!readMap[`${pIdx}-${sIdx}`]).length
              const partPct = totalPartSubs > 0 ? Math.round((readPartCount / totalPartSubs) * 100) : 0

              const isSpecial = SPECIAL[p.part]
              const pLabel = isSpecial ? p.title : `Part ${p.part}`
              const pSubtext = isSpecial ? '' : p.title

              return (
                <div key={p.part} className="border border-[var(--rule)] bg-[var(--bg2)] p-6 space-y-4 shadow-xs">
                  {/* Part Header */}
                  <div className="space-y-1">
                    <span className="block font-mono text-[0.58rem] text-[var(--acc)] uppercase tracking-wider">{pLabel}</span>
                    <h3 className="font-serif text-base font-bold text-[var(--ink)]">{pSubtext || p.title}</h3>
                    {totalPartSubs > 1 && (
                      <div className="flex items-center justify-between font-mono text-[0.55rem] text-[var(--mute2)] tracking-wider pt-2">
                        <span>PROGRESS</span>
                        <span>{readPartCount}/{totalPartSubs} ({partPct}%)</span>
                      </div>
                    )}
                    {totalPartSubs > 1 && (
                      <div className="w-full h-[2px] bg-[var(--rule)] overflow-hidden">
                        <div className="h-full bg-[var(--acc)]" style={{ width: `${partPct}%` }} />
                      </div>
                    )}
                  </div>
                  
                  {/* Sections List */}
                  <div className="flex flex-col gap-2 pt-2 border-t border-[var(--rule)]">
                    {subs.map((s, sIdx) => {
                      const isRead = !!readMap[`${pIdx}-${sIdx}`]
                      return (
                        <button
                          key={s.id}
                          onClick={() => onSelectSection(pIdx, sIdx)}
                          className={`w-full text-left font-serif text-xs py-1.5 flex items-baseline gap-2 transition-colors cursor-pointer ${s.is_intro ? 'italic text-[var(--mute)] hover:text-[var(--acc)]' : 'text-[var(--ink)] hover:text-[var(--acc)]'}`}
                        >
                          {!s.is_intro && (
                            <span className={`font-mono text-[0.68rem] min-w-[28px] ${isRead ? 'text-[var(--mute2)]' : 'text-[var(--acc)]'}`}>
                              {s.id}
                            </span>
                          )}
                          <span className="flex-1 hover:underline truncate">{s.title}</span>
                          {isRead && <span className="font-mono text-[0.55rem] text-[var(--mute2)]">✓</span>}
                        </button>
                      )
                    })}
                  </div>
                </div>
              )
            })}
          </div>
        )}

        {/* GLOSSARY TAB: KEY TERMS CARDS */}
        {activeTab === 'glossary' && (
          <div className="space-y-8">
            {Object.keys(data.glg).map(groupName => {
              const terms = data.glg[groupName] || []
              return (
                <div key={groupName} className="space-y-4">
                  <h3 className="font-mono text-[0.65rem] text-[var(--acc)] uppercase tracking-widest border-b border-[var(--rule)] pb-2">{groupName}</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {terms.map((term: string) => {
                      const def = data.gl[term] || ''
                      const empty = !def.trim()
                      const displayText = empty 
                        ? 'Definisi tertunda dalam versi publik ini. Silakan cari bab terkait atau buka naskah lengkap.' 
                        : def
                      return (
                        <button
                          key={term}
                          onClick={() => handleGlossaryCardClick(term)}
                          className="text-left border border-[var(--rule)] bg-[var(--bg2)] p-4 flex flex-col gap-2 cursor-pointer hover:bg-[rgba(201,168,76,0.02)] transition-colors group"
                        >
                          <span className="block font-serif text-sm font-bold text-[var(--ink)] group-hover:text-[var(--acc)] transition-colors">{term}</span>
                          <p className={`font-serif text-xs leading-relaxed text-[var(--mute)] ${empty ? 'italic text-[var(--mute2)]' : ''}`}>
                            {displayText}
                          </p>
                        </button>
                      )
                    })}
                  </div>
                </div>
              )
            })}
          </div>
        )}

        {/* SEARCH RESULTS TAB */}
        {activeTab === 'search' && (
          <div className="space-y-6">
            <div className="flex justify-between items-center flex-wrap gap-3 pb-3 border-b border-[var(--rule)] select-none">
              <span className="font-mono text-xs text-[var(--mute)]">
                Ditemukan <strong>{searchResults.length}</strong> hasil pencarian untuk "{searchQuery}"
              </span>
              <div className="flex items-center gap-2">
                <span className="font-mono text-[0.58rem] text-[var(--mute2)] uppercase">Filter Part</span>
                <select 
                  value={partFilter} 
                  onChange={handlePartFilterChange}
                  className="bg-[var(--bg2)] border border-[var(--rule)] text-[var(--ink)] font-mono text-[0.68rem] p-1.5 outline-none cursor-pointer"
                >
                  <option value="">Semua Bagian</option>
                  {data.parts.map((p, idx) => (
                    <option key={p.part} value={String(idx)}>{pshort(p)}</option>
                  ))}
                </select>
              </div>
            </div>

            {searchResults.length === 0 ? (
              <div className="border border-dashed border-[var(--rule)] p-12 text-center font-serif italic text-[var(--mute2)]">
                Tidak ada hasil pencarian yang cocok. Coba kurangi kata kunci Anda.
              </div>
            ) : (
              <div className="space-y-4">
                {searchResults.slice(0, 40).map(result => (
                  <button
                    key={`${result.pi}-${result.si}`}
                    onClick={() => onSelectSection(result.pi, result.si)}
                    className={`w-full text-left border p-5 bg-[var(--bg2)] hover:bg-[rgba(201,168,76,0.015)] flex flex-col gap-2 transition-colors cursor-pointer ${result.isGlossaryMatch ? 'border-[var(--acc)]' : 'border-[var(--rule)]'}`}
                  >
                    <div className="flex justify-between items-baseline font-mono text-[0.6rem] text-[var(--mute2)] uppercase tracking-wider">
                      <span>{pshort(result.p)} &middot; Bab {result.s.id}</span>
                      {result.isGlossaryMatch && <span className="text-[var(--acc)]">ISTILAH GLOSARIUM</span>}
                    </div>
                    <h4 className="font-serif text-sm font-bold text-[var(--ink)] hover:text-[var(--acc)]" dangerouslySetInnerHTML={{ __html: highlightQuery(result.s.title) }} />
                    {result.snip && (
                      <p className="font-serif text-xs leading-relaxed text-[var(--mute)]" dangerouslySetInnerHTML={{ __html: result.isGlossaryMatch ? result.snip : highlightQuery(result.snip) }} />
                    )}
                  </button>
                ))}
              </div>
            )}
          </div>
        )}

      </div>

      {/* FOOTER */}
      <footer className="py-8 border-t border-[var(--rule)] text-center text-xs font-mono text-[var(--mute2)] uppercase tracking-widest mt-auto select-none">
        Progressive Materialist Naturalism &mdash; V117.6
      </footer>
    </div>
  )
}
