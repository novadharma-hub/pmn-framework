import React, { useState, useEffect, useRef, useMemo } from 'react'
import Sidebar from './Sidebar'
import AITerminal from './AITerminal'
import CommandPalette from './CommandPalette'

interface SubSection {
  id: string
  title: string
  html?: string
  text?: string
  is_intro?: boolean
}

interface Part {
  part: string
  title: string
  subs: SubSection[]
}

interface Highlight {
  id: string
  text: string
  color: string
  note: string
}

interface ReaderViewProps {
  data: {
    parts: Part[]
    look: Record<string, { pi: number; si: number; title: string }>
    rel: Record<string, string[]>
    ci: Record<string, string[]>
    gl: Record<string, string>
  }
  partIdx: number
  secIdx: number
  readMap: Record<string, boolean>
  onMarkRead: (p: number, s: number) => void
  onSavePosition: (p: number, s: number) => void
  onBackHome: () => void
  onToggleTheme: () => void
  theme: 'light' | 'dark'
}

export default function ReaderView({ 
  data, 
  partIdx, 
  secIdx, 
  readMap, 
  onMarkRead, 
  onSavePosition, 
  onBackHome,
  onToggleTheme,
  theme
}: ReaderViewProps) {
  const [sbOpen, setSbOpen] = useState(window.innerWidth > 1024)
  const [focusMode, setFocusMode] = useState(false)
  const [readerScale, setReaderScale] = useState(1)
  const [readerMeasure, setReaderMeasure] = useState('720px')
  const [kbdModalOpen, setKbdModalOpen] = useState(false)
  const [notesModalOpen, setNotesModalOpen] = useState(false)
  const [commandPaletteOpen, setCommandPaletteOpen] = useState(false)

  // Current position pointers
  const p = data.parts[partIdx]
  const s = p?.subs[secIdx]
  const curPos: [number, number] = [partIdx, secIdx]
  const isRead = !!readMap[`${partIdx}-${secIdx}`]

  // Highlights State
  const [highlights, setHighlights] = useState<Record<string, Highlight[]>>({})
  const [toolbarState, setToolbarState] = useState<{
    visible: boolean
    x: number
    y: number
    note: string
    color: string
    activeHlId: string | null
    selectedText: string
    range: Range | null
  }>({
    visible: false,
    x: 0,
    y: 0,
    note: '',
    color: 'red',
    activeHlId: null,
    selectedText: '',
    range: null
  })

  // Cross-reference Previews
  const [xrefPreview, setXrefPreview] = useState<{
    visible: boolean
    x: number
    y: number
    kicker: string
    title: string
    excerpt: string
  }>({
    visible: false,
    x: 0,
    y: 0,
    kicker: '',
    title: '',
    excerpt: ''
  })

  // Notes/Annotation State for Active Section
  const [noteText, setNoteText] = useState('')
  const [noteSavedStatus, setNoteSavedStatus] = useState('')

  // Reading Session History (Recent Sections)
  const [sessHist, setSessHist] = useState<Array<{ pi: number; si: number; id: string; title: string }>>([])

  // References
  const proseRef = useRef<HTMLDivElement>(null)
  const toolbarRef = useRef<HTMLDivElement>(null)
  const xrefCardRef = useRef<HTMLDivElement>(null)

  const hideXrefTimeout = useRef<number | null>(null)

  const SPECIAL: Record<string, number> = { Preface: 1, Coda: 1, 'Intellectual Debts': 1, Bibliography: 1 }
  const SECTION_LABELS: Record<string, string> = {
    'how-to-read-this-document': 'Guide',
    'preface': 'Preface',
    'coda': 'Coda',
    'intellectual-debts': 'Debts',
    'bibliography': 'Sources'
  }

  const pshort = (partObj: Part) => {
    if (!partObj) return ''
    if (SPECIAL[partObj.part]) return partObj.part
    return `Part ${partObj.part}`
  }

  // Effect: Load highlights from storage
  useEffect(() => {
    try {
      const saved = localStorage.getItem('pmn-hl-v3')
      if (saved) setHighlights(JSON.parse(saved))
      
      // Load current section note
      if (s) {
        const note = localStorage.getItem(`pmn-an-${s.id}`)
        setNoteText(note || '')
      }
    } catch (e) {}
  }, [s])

  // Effect: Update session history
  useEffect(() => {
    if (!s) return
    const entry = { pi: partIdx, si: secIdx, id: s.id, title: s.title }
    setSessHist(prev => {
      const filtered = prev.filter(h => h.id !== s.id)
      return [entry, ...filtered].slice(0, 10)
    })
  }, [partIdx, secIdx, s])

  // Responsive sidebar handling
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth <= 1024) setSbOpen(false)
    }
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  // Keyboard Navigation
  useEffect(() => {
    const handleKbd = (e: KeyboardEvent) => {
      if (['INPUT', 'TEXTAREA'].includes((e.target as HTMLElement).tagName)) return
      
      const key = e.key.toLowerCase()
      if (key === 'arrowright' || key === 'arrowdown') handleNextSection()
      if (key === 'arrowleft' || key === 'arrowup') handlePrevSection()
      if (key === 'f') setFocusMode(!focusMode)
      if (key === 'c') onBackHome()
      if (key === 'k') setKbdModalOpen(true)
      if (key === '/') { e.preventDefault(); setCommandPaletteOpen(true) }
      if (key === 'n') setNotesModalOpen(true)
    }
    window.addEventListener('keydown', handleKbd)
    return () => window.removeEventListener('keydown', handleKbd)
  }, [partIdx, secIdx, focusMode])

  // Internal Actions
  const setReaderScaleValue = (val: number) => setReaderScale(val)
  
  const handleXrefClick = (targetId: string) => {
    const info = data.look[targetId]
    if (info) {
      onSavePosition(info.pi, info.si)
      proseRef.current?.parentElement?.scrollTo(0, 0)
    }
  }

  // Jumpback logic if came from cross-ref
  const [jumpbackStack, setJumpbackStack] = useState<Array<{ pi: number; si: number; id: string; title: string }>>([])
  useEffect(() => {
    // Basic logic to track jumps could go here
  }, [s])

  const hasJumpback = jumpbackStack.length > 0
  const jumpbackMeta = jumpbackStack[jumpbackStack.length - 1]
  const handleJumpBack = () => {
    const last = jumpbackStack.pop()
    if (last) {
      onSavePosition(last.pi, last.si)
      setJumpbackStack([...jumpbackStack])
    }
  }

  const showXrefPreview = (el: HTMLElement, sid: string) => {
    if (hideXrefTimeout.current) {
      window.clearTimeout(hideXrefTimeout.current)
      hideXrefTimeout.current = null
    }
    const info = data.look[sid]
    if (!info) return

    const rect = el.getBoundingClientRect()
    const targetSec = data.parts[info.pi].subs[info.si]
    
    setXrefPreview({
      visible: true,
      x: rect.left,
      y: rect.top + window.scrollY + 25,
      kicker: pshort(data.parts[info.pi]),
      title: targetSec.title,
      excerpt: stripHtml(targetSec.html || targetSec.text || '').slice(0, 180) + '...'
    })
  }

  const hideXrefPreview = () => {
    hideXrefTimeout.current = window.setTimeout(() => {
      setXrefPreview(prev => ({ ...prev, visible: false }))
    }, 300)
  }

  const handlePreviewMouseOver = () => {
    if (hideXrefTimeout.current) {
      window.clearTimeout(hideXrefTimeout.current)
      hideXrefTimeout.current = null
    }
  }

  const handleMouseUp = () => {
    const sel = window.getSelection()
    if (!sel || sel.isCollapsed) {
      // Small delay to allow clicking on toolbar itself
      setTimeout(() => {
        const nextSel = window.getSelection()
        if (!nextSel || nextSel.isCollapsed) {
          setToolbarState(prev => ({ ...prev, visible: false }))
        }
      }, 100)
      return
    }

    const text = sel.toString().trim()
    if (text.length < 3 || text.length > 600) return

    const range = sel.getRangeAt(0)
    if (!proseRef.current?.contains(range.commonAncestorContainer)) return

    const rect = range.getBoundingClientRect()
    
    setToolbarState({
      visible: true,
      x: rect.left + window.scrollX,
      y: rect.top + window.scrollY - 50,
      note: '',
      color: 'red',
      activeHlId: null,
      selectedText: text,
      range: range.cloneRange()
    })
  }

  const handleHlClick = (spanEl: HTMLElement, hlId: string) => {
    if (!s) return
    const sHls = highlights[s.id] || []
    const hl = sHls.find(h => h.id === hlId)
    if (!hl) return

    const rect = spanEl.getBoundingClientRect()
    setToolbarState({
      visible: true,
      x: rect.left + window.scrollX,
      y: rect.top + window.scrollY - 50,
      note: hl.note,
      color: hl.color,
      activeHlId: hlId,
      selectedText: hl.text,
      range: null
    })
  }

  // DOM Post-processing
  useEffect(() => {
    const proseNode = proseRef.current
    if (!proseNode || !s) return

    proseNode.addEventListener('mouseup', handleMouseUp)
    
    // Process HTML content for interactive elements
    // This part is simplified for the React migration
    
    return () => {
      proseNode.removeEventListener('mouseup', handleMouseUp)
    }
  }, [s, highlights])

  const handleSaveHlNote = () => {
    if (!s) return
    const note = toolbarState.note.trim()

    if (toolbarState.activeHlId) {
      const updated = (highlights[s.id] || []).map(h => 
        h.id === toolbarState.activeHlId ? { ...h, note } : h
      )
      const newHls = { ...highlights, [s.id]: updated }
      setHighlights(newHls)
      localStorage.setItem('pmn-hl-v3', JSON.stringify(newHls))
      setToolbarState(prev => ({ ...prev, visible: false }))
    } else if (toolbarState.range && toolbarState.selectedText) {
      handleColorClick('red')
    }
  }

  const handleRemoveHl = () => {
    if (!s || !toolbarState.activeHlId) return
    const updated = (highlights[s.id] || []).filter(h => h.id !== toolbarState.activeHlId)
    const newHls = { ...highlights, [s.id]: updated }
    setHighlights(newHls)
    localStorage.setItem('pmn-hl-v3', JSON.stringify(newHls))
    setToolbarState(prev => ({ ...prev, visible: false }))
  }

  const handleColorClick = (color: string) => {
    if (!s) return
    const note = toolbarState.note.trim()

    if (toolbarState.activeHlId) {
      const updated = (highlights[s.id] || []).map(h => 
        h.id === toolbarState.activeHlId ? { ...h, color } : h
      )
      const newHls = { ...highlights, [s.id]: updated }
      setHighlights(newHls)
      localStorage.setItem('pmn-hl-v3', JSON.stringify(newHls))
      setToolbarState(prev => ({ ...prev, visible: false }))
    } else if (toolbarState.range && toolbarState.selectedText) {
      const hlId = 'hl-' + Date.now() + '-' + Math.random().toString(16).slice(2, 6)
      const newHl: Highlight = {
        id: hlId,
        text: toolbarState.selectedText,
        color,
        note
      }
      const updated = [...(highlights[s.id] || []), newHl]
      const newHls = { ...highlights, [s.id]: updated }
      setHighlights(newHls)
      localStorage.setItem('pmn-hl-v3', JSON.stringify(newHls))
      window.getSelection()?.removeAllRanges()
      setToolbarState(prev => ({ ...prev, visible: false }))
    }
  }

  const saveSectionNotes = () => {
    if (!s) return
    try {
      const key = `pmn-an-${s.id}`
      if (noteText.trim()) localStorage.setItem(key, noteText)
      else localStorage.removeItem(key)
      setNoteSavedStatus('Tersimpan')
      setTimeout(() => setNoteSavedStatus(''), 1600)
    } catch (e) {}
  }

  const handleNotesKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if ((e.ctrlKey || e.metaKey) && e.key === 's') {
      e.preventDefault()
      saveSectionNotes()
    }
  }

  const handleNextSection = () => {
    let nextS = secIdx + 1
    let nextP = partIdx
    if (nextS >= p.subs.length) {
      nextP++
      nextS = 0
    }
    if (nextP < data.parts.length) {
      onSavePosition(nextP, nextS)
      proseRef.current?.parentElement?.scrollTo(0, 0)
    }
  }

  const handlePrevSection = () => {
    let prevS = secIdx - 1
    let prevP = partIdx
    if (prevS < 0) {
      prevP--
      if (prevP >= 0) prevS = data.parts[prevP].subs.length - 1
    }
    if (prevP >= 0) {
      onSavePosition(prevP, prevS)
      proseRef.current?.parentElement?.scrollTo(0, 0)
    }
  }

  const copySectionLink = () => {
    if (!s) return
    const url = window.location.href.split('#')[0] + '#' + s.id
    navigator.clipboard.writeText(url).then(() => {
      setNoteSavedStatus('Link Disalin')
      setTimeout(() => setNoteSavedStatus(''), 1800)
    })
  }

  const copySectionCitation = () => {
    if (!s || !p) return
    const partLabel = SPECIAL[p.part] ? p.title : `Part ${p.part} — ${p.title}`
    const citation = `V117.6 — PMN\n${s.id} — ${s.title}\n${partLabel}\n${window.location.href.split('#')[0]}#${s.id}`
    navigator.clipboard.writeText(citation).then(() => {
      setNoteSavedStatus('Kutipan Disalin')
      setTimeout(() => setNoteSavedStatus(''), 1800)
    })
  }

  const countActiveHls = s ? (highlights[s.id] || []).length : 0

  return (
    <div className="flex h-screen overflow-hidden bg-pmn-bg text-pmn-ink font-pmn-body select-text">
      {!focusMode && sbOpen && (
        <Sidebar 
          parts={data.parts} 
          readMap={readMap} 
          curPos={curPos}
          onSelectSection={(p, s) => onSavePosition(p, s)}
          onClose={() => setSbOpen(false)}
        />
      )}

      <main id="reader-main" className="flex-1 flex flex-col min-w-0 bg-pmn-bg overflow-y-auto relative z-10 scroll-smooth">
        <button 
          id="sb-tog"
          onClick={() => setSbOpen(!sbOpen)}
          className="fixed left-4 bottom-4 w-10 h-10 rounded-full bg-pmn-bg2 border border-pmn-rule text-pmn-ink hover:text-pmn-acc flex items-center justify-center font-bold z-50 shadow-2xl cursor-pointer transition-all"
        >
          {sbOpen ? '‹' : '›'}
        </button>

        <header className="sticky top-0 bg-pmn-bg border-b border-pmn-rule h-[52px] px-6 flex items-center justify-between z-[100] select-none">
          <div className="flex items-center gap-4">
            <button onClick={onBackHome} className="font-pmn-head font-bold text-[1.05rem] text-pmn-acc tracking-[0.04em] hover:opacity-75 cursor-pointer">PMN</button>
            <nav className="hidden md:flex items-center gap-2 font-pmn-mono text-[0.68rem] text-pmn-mute">
              <span>&rsaquo;</span>
              <button onClick={onBackHome} className="hover:text-pmn-acc cursor-pointer">Daftar Isi</button>
              <span>&rsaquo;</span>
              <span className="text-pmn-mute truncate max-w-[150px]">{pshort(p)}</span>
              <span>&rsaquo;</span>
              <span className="text-pmn-acc font-bold">{s?.id}</span>
            </nav>
          </div>

          <div className="flex items-center gap-4">
            <button onClick={() => setFocusMode(!focusMode)} className={`hidden md:block font-pmn-mono text-[0.65rem] border border-pmn-rule px-3 py-1 cursor-pointer transition-all ${focusMode ? 'bg-pmn-acc text-white dark:text-black border-pmn-acc font-bold' : 'text-pmn-mute hover:text-pmn-acc'}`}>
              {focusMode ? 'EXIT FOCUS' : 'FOCUS'}
            </button>
            <button onClick={onToggleTheme} className="font-pmn-mono text-[0.65rem] border border-pmn-rule2 px-2.5 py-1 text-pmn-mute hover:text-pmn-acc cursor-pointer">
              {theme === 'dark' ? '☀ LIGHT' : '☾ DARK'}
            </button>
            <button onClick={() => setKbdModalOpen(true)} className="font-pmn-mono text-[0.62rem] text-pmn-mute border border-pmn-rule bg-pmn-bg2 px-2.5 py-1 hover:opacity-80 cursor-pointer">K [?]</button>
          </div>
        </header>

        <div id="reader-col" className="flex-1 max-w-(--reader-measure) w-full mx-auto px-6 py-12 md:px-12 flex flex-col gap-8" style={{ '--reader-measure': readerMeasure } as any}>
          <div className="space-y-4">
            <span className="block font-pmn-mono text-[0.65rem] text-pmn-mute tracking-[0.25em] uppercase">
              {SPECIAL[p?.part] ? '' : `Part ${p?.part} — ${p?.title}`}
            </span>
            <div className="flex justify-between items-baseline gap-6 flex-wrap">
              <h1 className="font-pmn-head text-[clamp(1.8rem,4vw,2.4rem)] font-bold text-pmn-ink leading-tight">
                {!SPECIAL[p?.part] && <span className="text-pmn-acc mr-4 select-none opacity-80">{s?.id}</span>}
                {s?.title}
              </h1>
            </div>
            <div className="h-px bg-pmn-rule/50" />
          </div>

          <div 
            ref={proseRef} 
            id="prose" 
            className="pmn-prose font-pmn-body text-[1.12rem] leading-[1.85] text-pmn-ink space-y-8 prose-p:mb-8"
            style={{ fontSize: `${readerScale}rem` }}
            dangerouslySetInnerHTML={{ __html: s?.html || `<p>${s?.text}</p>` }}
          />

          <nav className="flex justify-between items-center mt-24 py-8 border-t border-pmn-rule select-none font-pmn-mono text-xs">
            <button onClick={handlePrevSection} disabled={partIdx === 0 && secIdx === 0} className="py-2 px-4 border border-pmn-rule bg-pmn-bg2 hover:text-pmn-acc disabled:opacity-30">
              &larr; PREV
            </button>
            <span className="text-pmn-mute/60">{secIdx + 1} / {p?.subs.length}</span>
            <button onClick={handleNextSection} disabled={partIdx === data.parts.length - 1 && secIdx === p?.subs.length - 1} className="py-2 px-4 border border-pmn-rule bg-pmn-bg2 hover:text-pmn-acc disabled:opacity-30">
              NEXT &rarr;
            </button>
          </nav>

          <div className="border-t border-pmn-rule pt-12 mt-12 space-y-12">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <div className="bg-pmn-bg2 border border-pmn-rule p-8 flex flex-col gap-5">
                <div className="flex justify-between items-baseline">
                  <span className="font-pmn-mono text-[0.6rem] text-pmn-mute uppercase tracking-widest font-bold">Catatan Pinggir</span>
                  <button onClick={saveSectionNotes} className="font-pmn-mono text-[0.66rem] border border-pmn-rule2 px-3 py-1.5 text-pmn-ink hover:text-pmn-acc bg-pmn-bg">Simpan [Ctrl+S]</button>
                </div>
                <textarea 
                  value={noteText}
                  onChange={e => setNoteText(e.target.value)}
                  onKeyDown={handleNotesKeyDown}
                  className="w-full h-56 bg-pmn-bg border border-pmn-rule p-4 font-pmn-body text-[0.9rem] outline-none focus:border-pmn-acc"
                  placeholder="Ketik catatan analisis Anda..."
                />
              </div>
              <AITerminal parts={data.parts} gl={data.gl} activeSec={s} />
            </div>
          </div>
        </div>

        <footer className="py-12 border-t border-pmn-rule text-center text-xs font-pmn-mono text-pmn-mute uppercase tracking-[0.25em] bg-pmn-bg">
          PMN &mdash; V117.6
        </footer>
      </main>

      {/* Modals & Toolbars */}
      {toolbarState.visible && (
        <div ref={toolbarRef} className="fixed flex items-center gap-2 p-2 bg-pmn-bg border border-pmn-rule shadow-2xl z-[8000]" style={{ left: toolbarState.x, top: toolbarState.y, position: 'absolute' }}>
           <button className="w-5 h-5 rounded-full bg-pmn-acc" onClick={() => handleColorClick('red')}></button>
           <button className="w-5 h-5 rounded-full bg-blue-500" onClick={() => handleColorClick('blue')}></button>
           <input className="bg-pmn-bg2 border border-pmn-rule text-pmn-ink text-[0.68rem] px-2 py-1 max-w-[100px]" value={toolbarState.note} onChange={e => setToolbarState(p => ({...p, note: e.target.value}))} />
           <button className="text-[0.62rem] font-bold bg-pmn-acc text-white px-2 py-1" onClick={handleSaveHlNote}>OK</button>
        </div>
      )}

      <CommandPalette 
        parts={data.parts}
        onSelectSection={(pIdx, sIdx) => onSavePosition(pIdx, sIdx)}
        isOpen={commandPaletteOpen}
        onClose={() => setCommandPaletteOpen(false)}
      />
    </div>
  )
}
