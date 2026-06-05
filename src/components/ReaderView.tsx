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
  const [notesModalOpen, setNotesModalOpen] = useState(false)
  const [commandPaletteOpen, setCommandPaletteOpen] = useState(false)
  const [toolbarState, setToolbarState] = useState({ visible: false, x: 0, y: 0, note: '', color: 'red', activeHlId: null as string | null, selectedText: '', range: null as Range | null })

  const p = data.parts[partIdx]; const s = p?.subs[secIdx]
  const isRead = !!readMap[`${partIdx}-${secIdx}`]
  const proseRef = useRef<HTMLDivElement>(null)
  const toolbarRef = useRef<HTMLDivElement>(null)

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
    if (nextP < data.parts.length) { onSavePosition(nextP, nextS); proseRef.current?.parentElement?.scrollTo(0, 0) }
  }

  const handlePrev = () => {
    let prevS = secIdx - 1; let prevP = partIdx
    if (prevS < 0) { prevP--; if (prevP >= 0) prevS = data.parts[prevP].subs.length - 1 }
    if (prevP >= 0) { onSavePosition(prevP, prevS); proseRef.current?.parentElement?.scrollTo(0, 0) }
  }

  return (
    <div id="reader-view" className="view on flex h-screen overflow-hidden bg-pmn-bg text-pmn-ink font-pmn-body">
      {!focusMode && sbOpen && (
        <Sidebar parts={data.parts} readMap={readMap} curPos={[partIdx, secIdx]} onSelectSection={onSavePosition} onClose={() => setSbOpen(false)} />
      )}

      <main id="reader-main" className="flex-1 flex flex-col min-w-0 bg-pmn-bg overflow-y-auto relative z-10 scroll-smooth">
        <header className="sticky top-0 bg-pmn-bg border-b border-pmn-rule h-[52px] px-6 flex items-center justify-between z-[100] select-none">
          <div className="flex items-center gap-4">
            <button onClick={() => setSbOpen(!sbOpen)} className="p-2 text-pmn-mute hover:text-pmn-acc cursor-pointer">☰</button>
            <button onClick={onBackHome} className="font-pmn-head font-bold text-pmn-acc">PMN</button>
          </div>
          <div className="flex items-center gap-4">
            <button onClick={() => setFocusMode(!focusMode)} className={`font-pmn-mono text-[0.65rem] border border-pmn-rule px-3 py-1 ${focusMode ? 'bg-pmn-acc text-white' : 'text-pmn-mute'}`}>FOCUS</button>
            <button onClick={onToggleTheme} className="font-pmn-mono text-[0.65rem] border border-pmn-rule2 px-2.5 py-1 text-pmn-mute">{theme === 'dark' ? '☀ LIGHT' : '☾ DARK'}</button>
            <button onClick={() => setKbdModalOpen(true)} className="font-pmn-mono text-[0.62rem] text-pmn-mute border border-pmn-rule bg-pmn-bg2 px-2.5 py-1">K [?]</button>
          </div>
        </header>

        <div id="reader-col" className="flex-1 w-full max-w-[720px] mx-auto px-6 py-12 md:px-12 flex flex-col gap-8">
          <div className="space-y-4">
            <span className="block font-pmn-mono text-[0.65rem] text-pmn-mute tracking-widest uppercase">{p?.part} — {p?.title}</span>
            <h1 className="font-pmn-head text-3xl font-bold text-pmn-ink">{s?.title}</h1>
            <div className="h-px bg-pmn-rule/50" />
          </div>

          <div ref={proseRef} id="prose" className="pmn-prose font-pmn-body text-[1.12rem] leading-relaxed text-pmn-ink space-y-8" dangerouslySetInnerHTML={{ __html: s?.html || `<p>${s?.text}</p>` }} />

          <nav className="flex justify-between items-center mt-24 py-8 border-t border-pmn-rule font-pmn-mono text-xs text-pmn-mute">
            <button onClick={handlePrev} disabled={partIdx === 0 && secIdx === 0} className="px-4 py-2 border border-pmn-rule bg-pmn-bg2 hover:text-pmn-acc disabled:opacity-30">&larr; PREV</button>
            <span>{secIdx + 1} / {p?.subs.length}</span>
            <button onClick={handleNext} disabled={partIdx === data.parts.length - 1 && secIdx === p?.subs.length - 1} className="px-4 py-2 border border-pmn-rule bg-pmn-bg2 hover:text-pmn-acc disabled:opacity-30">NEXT &rarr;</button>
          </nav>

          <div className="border-t border-pmn-rule pt-12 mt-12 grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div className="bg-pmn-bg2 border border-pmn-rule p-8 flex flex-col gap-5">
              <span className="font-pmn-mono text-[0.6rem] text-pmn-mute uppercase tracking-widest font-bold">Catatan Pinggir</span>
              <textarea className="w-full h-48 bg-pmn-bg border border-pmn-rule p-4 font-pmn-body text-[0.9rem] outline-none" placeholder="Ketik catatan..." />
            </div>
            <AITerminal parts={data.parts} gl={data.gl} activeSec={s} />
          </div>
        </div>

        <footer className="py-12 border-t border-pmn-rule text-center text-xs font-pmn-mono text-pmn-mute uppercase tracking-widest bg-pmn-bg">PMN Framework &mdash; V117.6</footer>
      </main>

      <CommandPalette parts={data.parts} onSelectSection={onSavePosition} isOpen={commandPaletteOpen} onClose={() => setCommandPaletteOpen(false)} />
      
      {kbdModalOpen && (
        <div className="fixed inset-0 z-[500] bg-black/75 flex items-center justify-center p-4">
          <div className="bg-pmn-bg border border-pmn-rule p-8 max-w-md w-full">
            <h2 className="font-pmn-head text-xl mb-4 text-pmn-ink">Keyboard Shortcuts</h2>
            <div className="space-y-2 font-pmn-mono text-sm text-pmn-mute">
              <div className="flex justify-between"><span>Next Bab</span><span>&rarr;</span></div>
              <div className="flex justify-between"><span>Prev Bab</span><span>&larr;</span></div>
              <div className="flex justify-between"><span>Focus Mode</span><span>F</span></div>
              <div className="flex justify-between"><span>Daftar Isi</span><span>C</span></div>
            </div>
            <button onClick={() => setKbdModalOpen(false)} className="mt-8 bg-pmn-acc text-white px-6 py-2 uppercase text-xs font-bold w-full">Tutup</button>
          </div>
        </div>
      )}
    </div>
  )
}
