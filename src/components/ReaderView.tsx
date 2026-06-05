import React, { useState, useEffect, useRef } from 'react'
import Sidebar from './Sidebar'
import AITerminal from './AITerminal'
import CommandPalette from './CommandPalette'

interface SubSection { id: string; title: string; html?: string; text?: string; is_intro?: boolean }
interface Part { part: string; title: string; subs: SubSection[] }
interface Highlight { id: string; text: string; color: string; note: string }

interface ReaderViewProps {
  data: {
    parts: Part[]
    look: Record<string, { pi: number; si: number; title: string }>
    rel: Record<string, string[]>
    ci: Record<string, string[]>
    gl: Record<string, string>
  }
  partIdx: number; secIdx: number
  readMap: Record<string, boolean>
  onMarkRead: (p: number, s: number) => void
  onSavePosition: (p: number, s: number) => void
  onBackHome: () => void; onToggleTheme: () => void
  theme: 'light' | 'dark'
}

export default function ReaderView({ data, partIdx, secIdx, readMap, onMarkRead, onSavePosition, onBackHome, onToggleTheme, theme }: ReaderViewProps) {
  const [sbOpen, setSbOpen] = useState(window.innerWidth > 1024)
  const [focusMode, setFocusMode] = useState(false)
  const [readerScale, setReaderScale] = useState(1)
  const [kbdModalOpen, setKbdModalOpen] = useState(false)
  const [commandPaletteOpen, setCommandPaletteOpen] = useState(false)
  const [toolbarState, setToolbarState] = useState({ visible: false, x: 0, y: 0, note: '', color: 'red', activeHlId: null as string | null, selectedText: '', range: null as Range | null })

  const p = data.parts[partIdx]; const s = p?.subs[secIdx]
  const isRead = !!readMap[`${partIdx}-${secIdx}`]
  const proseRef = useRef<HTMLDivElement>(null)
  const mainRef = useRef<HTMLDivElement>(null)

  // Keyboard Shortcuts
  useEffect(() => {
    const handleKbd = (e: KeyboardEvent) => {
      if (['INPUT', 'TEXTAREA'].includes((e.target as HTMLElement).tagName)) return
      const key = e.key.toLowerCase()
      if (key === 'arrowright' || key === 'arrowdown') handleNext()
      if (key === 'arrowleft' || key === 'arrowup') handlePrev()
      if (key === 'f') setFocusMode(!focusMode)
      if (key === 'c') onBackHome()
      if (key === 'k') setKbdModalOpen(true)
      if (key === '/') { e.preventDefault(); setCommandPaletteOpen(true) }
    }
    window.addEventListener('keydown', handleKbd)
    return () => window.removeEventListener('keydown', handleKbd)
  }, [partIdx, secIdx, focusMode])

  const handleNext = () => {
    let nextS = secIdx + 1; let nextP = partIdx
    if (nextS >= p.subs.length) { nextP++; nextS = 0 }
    if (nextP < data.parts.length) { 
      onSavePosition(nextP, nextS)
      mainRef.current?.scrollTo(0, 0)
    }
  }

  const handlePrev = () => {
    let prevS = secIdx - 1; let prevP = partIdx
    if (prevS < 0) { prevP--; if (prevP >= 0) prevS = data.parts[prevP].subs.length - 1 }
    if (prevP >= 0) { 
      onSavePosition(prevP, prevS)
      mainRef.current?.scrollTo(0, 0)
    }
  }

  const SPECIAL: Record<string, number> = { Preface: 1, Coda: 1, 'Intellectual Debts': 1, Bibliography: 1 }

  return (
    <div id="reader-view" className={`view on flex h-screen overflow-hidden bg-pmn-bg text-pmn-ink font-pmn-body ${focusMode ? 'focus-mode' : ''}`}>
      {!focusMode && (
        <Sidebar 
          parts={data.parts} readMap={readMap} curPos={[partIdx, secIdx]} 
          onSelectSection={(p, s) => { onSavePosition(p, s); mainRef.current?.scrollTo(0, 0) }} 
          onClose={() => setSbOpen(false)} 
        />
      )}

      <main ref={mainRef} id="reader-main" className="flex-1 flex flex-col min-w-0 overflow-y-auto relative z-10 scroll-smooth">
        
        {/* Reader Topbar */}
        <header id="hdr" className="sticky top-0 h-[52px] bg-pmn-bg/80 backdrop-blur-lg border-b border-pmn-rule px-6 flex items-center justify-between z-[100] select-none transition-transform duration-300">
          <div className="flex items-center gap-4">
            {!focusMode && (
              <button onClick={() => setSbOpen(!sbOpen)} className="p-2 text-pmn-mute hover:text-pmn-acc cursor-pointer transition-colors" title="Toggle Sidebar">☰</button>
            )}
            <button onClick={onBackHome} className="font-pmn-head font-bold text-pmn-acc text-[1.05rem] tracking-wider">PMN</button>
            <span className="hidden md:block text-pmn-mute/30 font-thin">|</span>
            <span className="hidden md:block font-pmn-mono text-[0.65rem] text-pmn-mute uppercase tracking-widest truncate max-w-[200px] opacity-70">
              {p?.part} &rsaquo; {s?.title}
            </span>
          </div>
          
          <div className="flex items-center gap-4">
            <button onClick={() => setFocusMode(!focusMode)} className={`hidden md:block font-pmn-mono text-[0.62rem] border border-pmn-rule px-3 py-1.5 tracking-wider transition-all cursor-pointer ${focusMode ? 'bg-pmn-acc text-white dark:text-black font-bold' : 'text-pmn-mute hover:border-pmn-acc hover:text-pmn-acc'}`}>
              {focusMode ? 'EXIT FOCUS [F]' : 'FOCUS MODE [F]'}
            </button>
            <button onClick={onToggleTheme} className="font-pmn-mono text-[0.62rem] border border-pmn-rule2 px-2.5 py-1.5 text-pmn-mute hover:text-pmn-acc transition-all cursor-pointer">
              {theme === 'dark' ? '☀ LIGHT' : '☾ DARK'}
            </button>
            <button onClick={() => setKbdModalOpen(true)} className="font-pmn-mono text-[0.62rem] text-pmn-mute border border-pmn-rule bg-pmn-bg2 px-2.5 py-1.5 hover:opacity-80 transition-all cursor-pointer">KEYS [K]</button>
          </div>
        </header>

        {/* Reading Column (Restored max-width logic) */}
        <div id="reader-col" className="flex-1 w-full max-w-[800px] mx-auto px-6 py-16 md:px-12 md:py-24 flex flex-col gap-10">
          
          {/* Section Kicker */}
          <div className="flex items-center gap-4 select-none opacity-80">
            <span className="font-pmn-mono text-[0.62rem] text-pmn-acc uppercase tracking-[0.3em]">
              {SPECIAL[p?.part] ? p.part : `Part ${p?.part} &mdash; ${p?.title}`}
            </span>
            <div className="flex-1 h-px bg-pmn-rule/40" />
          </div>

          {/* Section Heading */}
          <div className="sec-ttl-wrap space-y-4">
             <h1 className="font-pmn-head text-3xl md:text-5xl font-bold leading-[1.1] text-pmn-ink tracking-tight">
               {!SPECIAL[p?.part] && <span className="text-pmn-acc/80 mr-4 font-light select-none">{s?.id}</span>}
               {s?.title}
             </h1>
             <div className="h-px bg-pmn-acc/30 w-24" />
          </div>

          {/* PROSE CONTENT (Critical for original style) */}
          <article 
            ref={proseRef} 
            id="prose" 
            className="pmn-prose font-pmn-body text-[1.15rem] leading-[1.88] text-pmn-ink/90 space-y-8 prose-p:mb-8 md:text-[1.2rem] selection:bg-pmn-acc/25"
            style={{ fontSize: `${readerScale}rem` }}
            dangerouslySetInnerHTML={{ __html: s?.html || `<p>${s?.text}</p>` }}
          />

          {/* Mark as Read / Completion */}
          <div className="mt-20 pt-16 border-t border-pmn-rule flex flex-col items-center gap-6 select-none">
            {!isRead ? (
              <button onClick={() => onMarkRead(partIdx, secIdx)} className="group flex flex-col items-center gap-4 cursor-pointer transition-all hover:scale-105">
                <div className="w-16 h-16 rounded-full border border-pmn-acc flex items-center justify-center text-pmn-acc group-hover:bg-pmn-acc group-hover:text-pmn-bg transition-all duration-500 text-xl shadow-lg">✓</div>
                <span className="font-pmn-mono text-[0.65rem] text-pmn-mute uppercase tracking-[0.3em] font-bold group-hover:text-pmn-acc transition-colors">Tandai Selesai</span>
              </button>
            ) : (
              <div className="flex flex-col items-center gap-4 opacity-60">
                 <div className="w-16 h-16 rounded-full bg-pmn-acc/10 border border-pmn-acc/30 flex items-center justify-center text-pmn-acc text-xl">✓</div>
                 <span className="font-pmn-mono text-[0.6rem] text-pmn-mute uppercase tracking-[0.3em]">Bab Selesai Dibaca</span>
              </div>
            )}
          </div>

          {/* Footer Navigation */}
          <nav className="flex justify-between items-center mt-12 py-10 border-t border-pmn-rule font-pmn-mono text-[0.68rem] text-pmn-mute tracking-[0.15em] select-none">
            <button onClick={handlePrev} disabled={partIdx === 0 && secIdx === 0} className="px-6 py-2.5 border border-pmn-rule bg-pmn-bg2 hover:text-pmn-acc hover:border-pmn-acc transition-all disabled:opacity-20 cursor-pointer uppercase font-bold">
              &larr; Prev
            </button>
            <div className="flex flex-col items-center gap-1 opacity-50">
               <span className="font-bold text-pmn-acc text-xs">{secIdx + 1} / {p?.subs.length}</span>
               <span className="text-[0.55rem]">MODULE PROGRESS</span>
            </div>
            <button onClick={handleNext} disabled={partIdx === data.parts.length - 1 && secIdx === p?.subs.length - 1} className="px-6 py-2.5 border border-pmn-rule bg-pmn-bg2 hover:text-pmn-acc hover:border-pmn-acc transition-all disabled:opacity-20 cursor-pointer uppercase font-bold">
              Next &rarr;
            </button>
          </nav>

          {/* Related / Tools Area */}
          <section className="mt-16 border-t border-pmn-rule pt-12 space-y-12">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 items-start">
               {/* Note Area */}
               <div className="bg-pmn-bg2/50 border border-pmn-rule p-8 flex flex-col gap-6 shadow-sm">
                  <span className="font-pmn-mono text-[0.62rem] text-pmn-acc uppercase tracking-[0.25em] font-bold">Catatan Analisis</span>
                  <textarea className="w-full h-56 bg-pmn-bg border border-pmn-rule p-4 font-pmn-body text-[0.95rem] outline-none focus:border-pmn-acc transition-colors text-pmn-ink placeholder:text-pmn-mute/30 italic" placeholder="Ketik abstraksi dialektikal Anda di sini..." />
                  <button className="self-end font-pmn-mono text-[0.65rem] border border-pmn-rule2 px-4 py-2 hover:bg-pmn-acc hover:text-white dark:hover:text-black transition-all cursor-pointer font-bold uppercase tracking-widest shadow-md">Simpan Catatan [Ctrl+S]</button>
               </div>

               {/* AI Handoff */}
               <AITerminal parts={data.parts} gl={data.gl} activeSec={s} />
            </div>
          </section>
        </div>

        <footer className="py-16 border-t border-pmn-rule text-center text-xs font-pmn-mono text-pmn-mute uppercase tracking-[0.3em] bg-pmn-bg select-none mt-auto">
          Progressive Materialist Naturalism &mdash; V117.6 &mdash; Nova Dharma
        </footer>
      </main>

      <CommandPalette parts={data.parts} onSelectSection={onSavePosition} isOpen={commandPaletteOpen} onClose={() => setCommandPaletteOpen(false)} />
      
      {/* Keyboard Modal (Restored styling) */}
      {kbdModalOpen && (
        <div className="fixed inset-0 z-[500] bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 animate-fade-in select-none">
          <div className="bg-pmn-bg border border-pmn-rule p-10 max-w-md w-full shadow-[20px_20px_0_rgba(0,0,0,0.6)] space-y-8">
            <div className="border-b border-pmn-rule pb-4">
              <span className="block font-pmn-mono text-[0.6rem] text-pmn-acc uppercase tracking-[0.2em] mb-2">System Manual</span>
              <h2 className="font-pmn-head text-2xl font-bold text-pmn-ink">Keyboard Shortcuts</h2>
            </div>
            
            <div className="space-y-4 font-pmn-mono text-[0.75rem] text-pmn-ink2 tracking-tight">
              <div className="flex justify-between border-b border-pmn-rule/40 pb-2"><span>Next Module</span><span className="text-pmn-acc font-bold">&rarr; / &darr;</span></div>
              <div className="flex justify-between border-b border-pmn-rule/40 pb-2"><span>Prev Module</span><span className="text-pmn-acc font-bold">&larr; / &uarr;</span></div>
              <div className="flex justify-between border-b border-pmn-rule/40 pb-2"><span>Focus Mode</span><span className="text-pmn-acc font-bold">F</span></div>
              <div className="flex justify-between border-b border-pmn-rule/40 pb-2"><span>Manuscript Map</span><span className="text-pmn-acc font-bold">C</span></div>
              <div className="flex justify-between"><span>Search Palette</span><span className="text-pmn-acc font-bold">/</span></div>
            </div>
            
            <button onClick={() => setKbdModalOpen(false)} className="bg-pmn-acc text-white dark:text-black px-10 py-4 uppercase text-[0.7rem] font-bold w-full tracking-[0.2em] hover:opacity-85 shadow-lg cursor-pointer transition-all">
              Return to Manuscript
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
