import React, { useState, useEffect, useRef, useMemo } from 'react'
import Sidebar from './Sidebar'
import AITerminal from './AITerminal'
import CommandPalette from './CommandPalette'

interface SubSection { id: string; title: string; html?: string; text?: string; is_intro?: boolean }
interface Part { part: string; title: string; subs: SubSection[] }

interface ReaderViewProps {
  data: {
    parts: Part[]
    look: Record<string, { pi: number; si: number; title: string }>
    rel: Record<string, string[]>
    ci: Record<string, string[]>
    gl: Record<string, string>
  }
  partIdx?: number; secIdx?: number
  curPos?: [number, number]
  readMap: Record<string, boolean>
  onMarkRead: (p: number, s: number) => void
  onSavePosition: (p: number, s: number) => void
  onBackHome: () => void
  onToggleTheme: () => void
  theme: 'light' | 'dark'
  forceOpenPalette?: number
  contentWidth?: 'narrow' | 'medium' | 'wide'
  onChangeWidth?: (w: 'narrow' | 'medium' | 'wide') => void
  history?: [number, number][]
  version?: string
}

const SPECIAL: Record<string, boolean> = { 'Preface': true, 'Coda': true, 'Intellectual Debts': true, 'Bibliography': true }

const shortenId = (id: string) => {
  if (id === 'how-to-read-this-document') return 'HTR'
  if (id === 'intellectual-debts') return 'DEBT'
  if (id === 'bibliography') return 'BIB'
  if (id === 'preface') return 'PREF'
  if (id === 'coda') return 'CODA'
  return id
}

export default function ReaderView({ 
  data, partIdx, secIdx, curPos, readMap, onMarkRead, onSavePosition, onBackHome, onToggleTheme, theme, forceOpenPalette,
  contentWidth = 'narrow', onChangeWidth, history = [], version = ''
}: ReaderViewProps) {
  const [sbOpen, setSbOpen] = useState(window.innerWidth > 1024)
  const [focusMode, setFocusMode] = useState(false)
  const [commandPaletteOpen, setCommandPaletteOpen] = useState(false)
  const [noteText, setNoteText] = useState('')
  const [noteSavedStatus, setNoteSavedStatus] = useState('')
  const [readerScale, setReaderScale] = useState(() => {
    try { return Number(localStorage.getItem('pmn-reader-scale')) || 1 } catch { return 1 }
  })
  
  const [toolbar, setToolbar] = useState({ visible: false, x: 0, y: 0, text: '', range: null as Range | null })
  const [preview, setPreview] = useState<{ visible: boolean; x: number; y: number; title: string; kicker: string; excerpt: string }>({ visible: false, x: 0, y: 0, title: '', kicker: '', excerpt: '' })
  const [glossaryTooltip, setGlossaryTooltip] = useState<{ visible: boolean; x: number; y: number; term: string; definition: string }>({ visible: false, x: 0, y: 0, term: '', definition: '' })
  const [highlights, setHighlights] = useState<Record<string, { id: string; text: string; color: string; note: string }[]>>(() => {
    try { return JSON.parse(localStorage.getItem('pmn-hl-v3') || '{}') } catch { return {} }
  })
  const isMobile = () => typeof window !== 'undefined' && window.innerWidth <= 680

  const pIdx = (curPos ? curPos[0] : partIdx) ?? 0
  const sIdx = (curPos ? curPos[1] : secIdx) ?? 0
  const p = data.parts[pIdx]; const s = p?.subs[sIdx]
  const isRead = !!readMap[`${pIdx}-${sIdx}`]
  const mainRef = useRef<HTMLDivElement>(null)
  const proseRef = useRef<HTMLDivElement>(null)

  const changeReaderScale = (delta: number) => {
    const next = Math.max(0.7, Math.min(1.6, readerScale + delta))
    setReaderScale(next)
    document.documentElement.style.setProperty('--reader-scale', String(next))
    localStorage.setItem('pmn-reader-scale', String(next))
  }

  useEffect(() => {
    if (focusMode) document.body.classList.add('focus-mode')
    else document.body.classList.remove('focus-mode')
  }, [focusMode])

  useEffect(() => {
    document.documentElement.style.setProperty('--reader-scale', String(readerScale))
  }, [])

  useEffect(() => {
    const syncSidebarForViewport = () => setSbOpen(window.innerWidth > 1024)
    window.addEventListener('resize', syncSidebarForViewport)
    return () => window.removeEventListener('resize', syncSidebarForViewport)
  }, [])

  // Process highlights and XREFs into HTML
  const processedHTML = useMemo(() => {
    if (!s) return ''
    let html = s.html || `<p>${s.text}</p>`
    const sHls = highlights[s.id] || []

    // 1. Inject Highlights
    sHls.forEach(hl => {
      const esc = hl.text.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
      const cls = `pmn-hl ${hl.color !== 'red' ? 'hl-' + hl.color : ''}`
      const regex = new RegExp(`(?<!['"=>])(${esc})(?![^<]*>)`, 'i')
      html = html.replace(regex, `<span class="${cls.trim()}" data-hl-id="${hl.id}" title="${hl.note ? '📝 ' + hl.note : 'Click to edit annotation'}">$1</span>`)
    })

    return html
  }, [s, highlights])

  // Click handler for highlights and xrefs
  const handleProseClick = (e: React.MouseEvent) => {
    const target = e.target as HTMLElement
    
    // Handle XREF
    if (target.closest('.xref')) {
      e.preventDefault()
      const sid = target.closest('.xref')?.getAttribute('data-sid')
      if (sid && data.look[sid]) {
        onSavePosition(data.look[sid].pi, data.look[sid].si)
      }
      return
    }

    // Handle Highlight Edit
    const hlSpan = target.closest('[data-hl-id]')
    if (hlSpan) {
      const hlId = hlSpan.getAttribute('data-hl-id')
      const secHls = highlights[s?.id || ''] || []
      const hl = secHls.find(h => h.id === hlId)
      if (hl) {
        const rect = hlSpan.getBoundingClientRect()
        const containerRect = mainRef.current?.getBoundingClientRect()
        setToolbar({
          visible: true,
          x: rect.left - (containerRect?.left || 0) + (mainRef.current?.scrollLeft || 0),
          y: rect.top - (containerRect?.top || 0) + (mainRef.current?.scrollTop || 0) - 50,
          text: hl.text,
          range: null
        })
      }
    }
  }

  const handleProseMouseOver = (e: React.MouseEvent) => {
    const target = (e.target as HTMLElement).closest('.xref')
    if (target) {
      const sid = target.getAttribute('data-sid')
      if (sid && data.look[sid]) {
        const info = data.look[sid]
        const sec = data.parts[info.pi].subs[info.si]
        const plain = (sec.html || sec.text || '').replace(/<[^>]+>/g, '')
        const excerpt = plain.slice(0, 180) + (plain.length > 180 ? '...' : '')
        
        const rect = target.getBoundingClientRect()
        const containerRect = mainRef.current?.getBoundingClientRect()
        setPreview({
          visible: true,
          x: rect.left - (containerRect?.left || 0) + (mainRef.current?.scrollLeft || 0),
          y: rect.top - (containerRect?.top || 0) + (mainRef.current?.scrollTop || 0) - 160,
          title: sec.title,
          kicker: `Part ${data.parts[info.pi].part} \u00B7 Module ${sid}`,
          excerpt
        })
      }
    }
  }

  const handleProseMouseOut = () => {
    // We could use a timeout here like legacy, but React state is fast
  }

  const handleProseMouseUp = () => {
    const sel = window.getSelection()
    if (!sel || sel.isCollapsed) {
      if (!toolbar.range) setToolbar(t => ({ ...t, visible: false }))
      return
    }
    
    const txt = sel.toString().trim()
    if (txt.length < 3 || txt.length > 600) return

    const rect = sel.getRangeAt(0).getBoundingClientRect()
    const containerRect = mainRef.current?.getBoundingClientRect()
    const x = rect.left - (containerRect?.left || 0) + (mainRef.current?.scrollLeft || 0)
    const y = rect.top - (containerRect?.top || 0) + (mainRef.current?.scrollTop || 0) - 50

    // Check for glossary match
    const lowerTxt = txt.toLowerCase()
    const matchedKey = Object.keys(data.gl).find(k => 
      lowerTxt === k.toLowerCase() || lowerTxt.includes(k.toLowerCase()) || k.toLowerCase().includes(lowerTxt)
    )

    if (matchedKey) {
      setGlossaryTooltip({
        visible: true,
        x: Math.min(x, (containerRect?.width || window.innerWidth) - 290),
        y: rect.bottom - (containerRect?.top || 0) + (mainRef.current?.scrollTop || 0) + 14,
        term: matchedKey,
        definition: data.gl[matchedKey]
      })
    } else {
      setToolbar({
        visible: true,
        x: Math.min(x, (containerRect?.width || window.innerWidth) - 300),
        y,
        text: txt,
        range: sel.getRangeAt(0).cloneRange()
      })
    }
  }

  const saveHighlight = (color: string) => {
    if (!s) return
    const id = 'hl-' + Date.now()
    const newHl = { id, text: toolbar.text, color, note: '' }
    const updated = { ...highlights, [s.id]: [...(highlights[s.id] || []), newHl] }
    setHighlights(updated)
    localStorage.setItem('pmn-hl-v3', JSON.stringify(updated))
    setToolbar(t => ({ ...t, visible: false }))
    window.getSelection()?.removeAllRanges()
  }

  const removeHighlight = () => {
    if (!s) return
    const updated = { ...highlights, [s.id]: (highlights[s.id] || []).filter(h => h.text !== toolbar.text) }
    setHighlights(updated)
    localStorage.setItem('pmn-hl-v3', JSON.stringify(updated))
    setToolbar(t => ({ ...t, visible: false }))
  }

  useEffect(() => {
    const dismiss = () => { 
      setGlossaryTooltip(prev => prev.visible ? { ...prev, visible: false } : prev)
      setPreview(prev => prev.visible ? { ...prev, visible: false } : prev)
      if (!toolbar.range) setToolbar(prev => prev.visible ? { ...prev, visible: false } : prev)
    }
    const handleClickOutside = (e: MouseEvent) => {
      const target = e.target as HTMLElement
      if (!target.closest('#hl-toolbar') && !target.closest('.gl-ref') && !target.closest('.xref') && !target.closest('[data-hl-id]')) {
        dismiss()
      }
    }
    const scroller = mainRef.current
    scroller?.addEventListener('scroll', dismiss)
    window.addEventListener('click', handleClickOutside)
    return () => {
      scroller?.removeEventListener('scroll', dismiss)
      window.removeEventListener('click', handleClickOutside)
    }
  }, [toolbar.range])

  useEffect(() => {
    if (forceOpenPalette && forceOpenPalette > 0) setCommandPaletteOpen(true)
  }, [forceOpenPalette])

  // Bug #18: Load note dari localStorage saat section berganti
  useEffect(() => {
    if (!s) return
    const saved = localStorage.getItem(`pmn-an-${s.id}`) || ''
    setNoteText(saved)
    setNoteSavedStatus('')
  }, [s?.id])

  // Global hotkey: Ctrl+S to save note
  useEffect(() => {
    const handleSaveKey = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 's') {
        e.preventDefault()
        saveNote()
      }
    }
    window.addEventListener('keydown', handleSaveKey)
    return () => window.removeEventListener('keydown', handleSaveKey)
  }, [s, noteText])

  useEffect(() => {
    const scroller = mainRef.current
    if (!scroller) return
    const updateProgress = () => {
      const winScroll = scroller.scrollTop
      const height = scroller.scrollHeight - scroller.clientHeight
      const scrolled = height > 0 ? (winScroll / height) * 100 : 0
      const bar = document.getElementById('reading-progress')
      if (bar) bar.style.width = scrolled + '%'
    }
    scroller.addEventListener('scroll', updateProgress)
    updateProgress()
    return () => scroller.removeEventListener('scroll', updateProgress)
  }, [s])

  useEffect(() => {
    if (!s || isRead) return
    const timer = setTimeout(() => { onMarkRead(pIdx, sIdx) }, 10000)
    return () => clearTimeout(timer)
  }, [pIdx, sIdx, s, isRead])

  const saveNote = () => {
    if (!s) return
    if (noteText.trim()) localStorage.setItem(`pmn-an-${s.id}`, noteText)
    else localStorage.removeItem(`pmn-an-${s.id}`)
    setNoteSavedStatus('Saved')
    setTimeout(() => setNoteSavedStatus(''), 1500)
  }

  return (
    <div className="flex h-full bg-pmn-bg overflow-hidden relative select-text">
      {sbOpen && (
        <Sidebar 
          parts={data.parts} 
          readMap={readMap}
          curPos={[pIdx, sIdx]}
          onSelectSection={(p, s) => {
            onSavePosition(p, s)
            if (isMobile()) setSbOpen(false)
          }}
          onClose={() => setSbOpen(false)} 
          history={history}
        />
      )}
      {sbOpen && isMobile() && (
        <button
          aria-label="Close section drawer"
          onClick={() => setSbOpen(false)}
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 190,
            background: 'rgba(0,0,0,.52)',
            border: 'none',
            padding: 0,
            cursor: 'pointer'
          }}
        />
      )}

      <main ref={mainRef} id="reader-main" className="flex-1 overflow-y-auto custom-scrollbar relative bg-pmn-bg">
        <div 
          id="reader-nav"
          role="navigation"
          className="select-none sticky top-0 z-20 bg-pmn-bg w-full border-b border-pmn-rule/60" 
          style={{ height: '68px', boxSizing: 'border-box' }}
        >
          {/* 3-col grid: 1fr auto 1fr guarantees title at exact midpoint of nav */}
          <div className="w-full h-full grid items-center px-4 sm:px-6 lg:px-8" style={{ gridTemplateColumns: '1fr auto 1fr' }}>
            {/* Left: ← Contents button and mobile sections drawer trigger */}
            <div className="flex items-center gap-2">
              <button
                className="font-mono text-[0.7rem] uppercase tracking-widest text-pmn-mute hover:text-pmn-ink transition-colors whitespace-nowrap shrink-0"
                onClick={onBackHome}
                aria-label="Back to Table of Contents"
              >
                &larr; <span className="hidden sm:inline">Table of Contents</span>
              </button>
              <button
                className="font-mono text-[0.62rem] uppercase tracking-widest text-pmn-acc border border-pmn-rule px-2.5 py-1 sm:hidden shrink-0 transition-all hover:bg-pmn-acc hover:text-white"
                onClick={() => setSbOpen(v => !v)}
                aria-expanded={sbOpen}
                aria-controls="sidebar"
                style={{ background: 'var(--pmn-bg2)' }}
              >
                § Sections
              </button>
            </div>

            {/* Center: naturally sized, grid places it at exact center */}
            <div className="flex flex-col items-center justify-center text-center pointer-events-none px-3 overflow-hidden" style={{ maxWidth: '45vw' }}>
              <span className="font-mono text-[0.55rem] sm:text-[0.6rem] lg:text-[0.7rem] text-pmn-acc uppercase tracking-[0.2em] leading-none mb-1 font-bold whitespace-nowrap">Part {p?.part}</span>
              <span className="font-pmn-head text-[0.75rem] sm:text-[0.85rem] lg:text-[1rem] font-bold text-pmn-ink leading-snug truncate w-full">{p?.title}</span>
            </div>

            {/* Right: Mark Read / Completed button — justify-end pushes to right edge */}
            <div className="flex items-center justify-end gap-2">
              <button
                onClick={() => onMarkRead(pIdx, sIdx)}
                className={`font-mono text-[0.58rem] lg:text-[0.65rem] uppercase tracking-widest border transition-all shrink-0 whitespace-nowrap ${isRead ? 'border-pmn-acc text-pmn-acc bg-pmn-acc/5' : 'border-pmn-rule text-pmn-mute hover:border-pmn-ink hover:text-pmn-ink'}`}
                style={{ padding: '6px 12px', cursor: 'pointer' }}
              >
                <span className="hidden sm:inline">{isRead ? 'Completed' : 'Mark Read'}</span>
                <span className="sm:hidden">{isRead ? '✓' : '○'}</span>
              </button>
            </div>
          </div>
        </div>

        <div id="reader-col" className="mx-auto transition-all duration-300">
          <div className="w-full px-6 lg:px-12">
            {/* ── Title + Controls Card ── */}
            <div className="reader-title-card">
              <p className="sec-eye uppercase tracking-[0.4em] font-mono text-[0.62rem] text-pmn-acc opacity-80 mb-6 border-b border-pmn-acc/20 pb-2 inline-block">
                {SPECIAL[p?.part] ? `SYSTEM DOC // ${shortenId(s?.id || '')}` : `MODULE // ${shortenId(s?.id || '')}`}
              </p>
              <h1 className="font-pmn-head font-bold text-pmn-ink text-3xl lg:text-5xl leading-tight mb-8 text-center">{s?.title}</h1>

              <div className="reader-meta flex flex-col md:flex-row md:items-center justify-between border-b border-pmn-rule/60 pb-6 mb-10 select-none gap-6">
                <span className="font-mono text-[0.65rem] text-pmn-mute opacity-60 uppercase tracking-widest italic">
                  {s?.text ? `${Math.ceil(s.text.split(/\s+/).length / 200)} min read` : '1 min read'}
                </span>
                
                {/* section wrapper used instead of div to bypass the legacy .reader-meta > div styling */}
                <section className="flex flex-col sm:flex-row sm:items-center gap-4 sm:gap-6 w-full md:w-auto">
                  <div className="flex items-center justify-between sm:justify-start gap-3">
                    <span className="font-mono text-[0.6rem] text-pmn-mute uppercase tracking-widest">Measure</span>
                    <div className="flex bg-pmn-bg2 border border-pmn-rule p-0.5 rounded-sm gap-1 select-none">
                      <button 
                        onClick={() => onChangeWidth?.('narrow')} 
                        className={`px-3 py-1 font-mono text-[0.7rem] cursor-pointer rounded-xs transition-all ${contentWidth === 'narrow' ? 'bg-pmn-acc text-white border-none' : 'text-pmn-mute hover:text-pmn-ink bg-transparent border-none'}`}
                      >
                        N
                      </button>
                      <button 
                        onClick={() => onChangeWidth?.('medium')} 
                        className={`px-3 py-1 font-mono text-[0.7rem] cursor-pointer rounded-xs transition-all ${contentWidth === 'medium' ? 'bg-pmn-acc text-white border-none' : 'text-pmn-mute hover:text-pmn-ink bg-transparent border-none'}`}
                      >
                        M
                      </button>
                      <button 
                        onClick={() => onChangeWidth?.('wide')} 
                        className={`px-3 py-1 font-mono text-[0.7rem] cursor-pointer rounded-xs transition-all ${contentWidth === 'wide' ? 'bg-pmn-acc text-white border-none' : 'text-pmn-mute hover:text-pmn-ink bg-transparent border-none'}`}
                      >
                        W
                      </button>
                    </div>
                  </div>
                  
                  <div className="hidden sm:block w-px h-6 bg-pmn-rule/40" />
                  
                  <div className="flex items-center justify-between sm:justify-start gap-3">
                    <span className="font-mono text-[0.6rem] text-pmn-mute uppercase tracking-widest">Zoom</span>
                    <div className="flex bg-pmn-bg2 border border-pmn-rule p-0.5 rounded-sm gap-1 select-none">
                      <button 
                        onClick={() => changeReaderScale(-0.1)} 
                        className="px-3 py-1 font-mono text-[0.7rem] cursor-pointer rounded-xs text-pmn-mute hover:text-pmn-ink transition-all bg-transparent border-none"
                      >
                        A-
                      </button>
                      <button 
                        onClick={() => { setReaderScale(1); document.documentElement.style.setProperty('--reader-scale','1'); localStorage.setItem('pmn-reader-scale','1'); }} 
                        className="px-3 py-1 font-mono text-[0.7rem] cursor-pointer rounded-xs bg-pmn-bg text-pmn-ink hover:text-pmn-acc transition-all border-none font-bold"
                      >
                        A
                      </button>
                      <button 
                        onClick={() => changeReaderScale(0.1)} 
                        className="px-3 py-1 font-mono text-[0.7rem] cursor-pointer rounded-xs text-pmn-mute hover:text-pmn-ink transition-all bg-transparent border-none"
                      >
                        A+
                      </button>
                    </div>
                  </div>
                  
                  <div className="hidden sm:block w-px h-6 bg-pmn-rule/40" />
                  
                  <button 
                    onClick={() => setFocusMode(!focusMode)}
                    className={`px-4 py-1.5 font-mono text-[0.65rem] uppercase tracking-widest cursor-pointer border transition-all rounded-xs w-full sm:w-auto ${focusMode ? 'bg-pmn-acc text-white border-pmn-acc shadow-md' : 'border-pmn-rule text-pmn-mute hover:border-pmn-ink hover:text-pmn-ink bg-transparent'}`}
                  >
                    {focusMode ? 'EXIT' : 'FOCUS'}
                  </button>
                </section>
              </div>
            </div> {/* /reader-title-card */}

            {/* ── Prose Content Box ── */}
            <div className="reader-prose-box">
            <div 
              id="prose" 
              ref={proseRef} 
              className="prose font-pmn-body text-pmn-ink" 
              style={{ fontSize: `calc(1.15rem * var(--reader-scale, ${readerScale}))` }}
              dangerouslySetInnerHTML={{ __html: processedHTML }} 
              onClick={handleProseClick}
              onMouseUp={handleProseMouseUp}
              onMouseOver={handleProseMouseOver}
            />
            </div> {/* /reader-prose-box */}

            <div className="reader-endcap space-y-16 pt-24 border-t border-pmn-rule/40 mt-32">
              <div className="reader-endcap-hdr flex justify-between items-end gap-12">
                <div className="flex-1">
                  <span className="reader-endcap-kicker block font-mono text-[0.65rem] text-pmn-acc uppercase tracking-[0.4em] font-bold mb-3">Trace the Analytical Drift</span>
                  <div className="reader-endcap-title font-pmn-head text-4xl font-bold text-pmn-ink leading-tight">Continue the Inquiry</div>
                  <p className="reader-endcap-desc font-pmn-body text-[0.95rem] text-pmn-mute leading-relaxed italic opacity-80 mt-4 max-w-[500px]">Use related sections, manuscript notes, and PMN Agent handoff to bridge this module with the broader framework.</p>
                </div>
                <div className="flex gap-4">
                  <button className="pmn-agent-btn px-6 py-2 border border-pmn-rule hover:border-pmn-acc hover:text-pmn-acc transition-all font-mono text-[0.7rem] uppercase tracking-widest" onClick={() => {
                    if (!s || !p) return
                    const citation = `${p.title} — ${s.title} [PMN v${version}, Module ${s.id}]`
                    try { navigator.clipboard.writeText(citation) } catch { window.prompt('Copy citation:', citation) }
                  }}>Copy Citation</button>
                  <button className="pmn-agent-btn px-6 py-2 bg-pmn-ink text-pmn-bg hover:bg-pmn-acc transition-all font-mono text-[0.7rem] uppercase tracking-widest shadow-xl" onClick={onBackHome}>Map &uarr;</button>
                </div>
              </div>

              <div className="reader-endcap-grid">
                <section className="reader-panel">
                  <span className="reader-tools-lbl">Structural Relations</span>
                  <div className="reader-tools-list">
                    {(data.rel[s?.id || ''] || []).map(rid => (
                      <button key={rid} className="reader-tool-link" onClick={() => {
                        const hit = data.look[rid]
                        if (hit) onSavePosition(hit.pi, hit.si)
                      }}>
                        <span className="tool-id">{rid}</span>
                        <span className="tool-ttl">{data.look[rid]?.title || 'Module'}</span>
                      </button>
                    ))}
                  </div>
                </section>
                <section className="reader-panel">
                  <div className="annot-hdr">
                    <span className="reader-tools-lbl">Notes</span>
                    <div className="annot-actions">
                      <button className="annot-btn" onClick={saveNote}>{noteSavedStatus || 'Save'}</button>
                    </div>
                  </div>
                  <textarea className="annot-ta" placeholder="Capture your analytical drift on this section..." value={noteText} onChange={e => setNoteText(e.target.value)} />
                </section>
              </div>

              <footer className="doc-footer border-t border-pmn-rule/40 py-16 flex justify-between items-center select-none font-mono text-[0.7rem] text-pmn-mute uppercase tracking-[0.4em]">
                <span>PMN CORE &mdash; REV V{version}</span>
                <button className="hover:text-pmn-acc transition-colors border-b border-transparent hover:border-pmn-acc pb-1" onClick={onBackHome}>Return to Table of Contents &uarr;</button>
              </footer>
            </div>
          </div>
        </div>
      </main>

      <CommandPalette 
        parts={data.parts} glossary={data.gl} isOpen={commandPaletteOpen} 
        onSelectSection={(p, s) => { onSavePosition(p, s); setCommandPaletteOpen(false) }} 
        onToggleTheme={onToggleTheme} onToggleFocus={() => setFocusMode(!focusMode)}
        onClose={() => setCommandPaletteOpen(false)} 
      />

      {toolbar.visible && (
        <div id="hl-toolbar" className="visible" style={{ left: toolbar.x, top: toolbar.y, position: 'absolute', zIndex: 1000 }}>
          <button className="hl-btn hl-btn-red" onClick={() => saveHighlight('red')} title="High-Value" />
          <button className="hl-btn hl-btn-blue" onClick={() => saveHighlight('blue')} title="Structural" />
          <button className="hl-btn hl-btn-green" onClick={() => saveHighlight('green')} title="Empirical" />
          <button className="hl-btn-remove" onClick={removeHighlight} title="Remove">✕</button>
        </div>
      )}

      {preview.visible && (
        <div className="xref-preview-card visible" style={{ left: preview.x, top: preview.y }}>
          <span className="xref-preview-kicker">{preview.kicker}</span>
          <h4 className="xref-preview-title">{preview.title}</h4>
          <p className="xref-preview-excerpt italic opacity-80">{preview.excerpt}</p>
          <div className="xref-preview-footer border-t border-pmn-rule/20 pt-3 mt-3 flex justify-between items-center">
            <span>Click to navigate</span>
            <span className="text-pmn-acc font-bold">PMN Core &rarr;</span>
          </div>
        </div>
      )}

      {glossaryTooltip.visible && (
        <div id="tt" style={{ display: 'block', left: glossaryTooltip.x, top: glossaryTooltip.y, position: 'absolute', zIndex: 1000 }}>
          <div id="tt-term">{glossaryTooltip.term}</div>
          <div id="tt-def">{glossaryTooltip.definition}</div>
        </div>
      )}
    </div>
  )
}
