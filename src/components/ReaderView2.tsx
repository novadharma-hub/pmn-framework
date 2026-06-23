import React, { useState, useEffect, useRef, useMemo } from 'react'
import Sidebar from './Sidebar'

/*
  ReaderView2 — STRANGLER-FIG REBUILD (di belakang flag ?v2)
  ───────────────────────────────────────────────────────────
  Tujuan: ganti ReaderView lama dengan arsitektur Tailwind-only,
  ZERO ketergantungan pada layout style.css (hanya pinjam .prose
  untuk fidelity konten + body.focus-mode untuk sembunyikan header
  app — keduanya di-port belakangan).

  Drop-in: prop IDENTIK dengan ReaderView lama, jadi App.tsx cukup
  menukar komponen via flag tanpa mengubah data flow.

  Spec visual TERKUNCI: mockup Opus (Spectral + measure ch-based +
  warm-paper light). Palette pakai token --color-pmn-* yang sudah ada.
*/

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

const MEASURE: Record<string, string> = { narrow: '56ch', medium: '66ch', wide: '78ch' }

// Inject Spectral once (slice isolation; pindah ke index.html saat v2 dipromosikan)
function useSpectralFont() {
  useEffect(() => {
    const id = 'rv2-spectral-font'
    if (document.getElementById(id)) return
    const link = document.createElement('link')
    link.id = id
    link.rel = 'stylesheet'
    link.href = 'https://fonts.googleapis.com/css2?family=Spectral:ital,wght@0,300;0,400;0,500;1,400&display=swap'
    document.head.appendChild(link)
  }, [])
}

export default function ReaderView2({
  data, partIdx, secIdx, curPos, readMap, onMarkRead, onSavePosition, onBackHome,
  contentWidth = 'medium', onChangeWidth, history = [], version = ''
}: ReaderViewProps) {
  useSpectralFont()

  const [sbOpen, setSbOpen] = useState(window.innerWidth > 1024)
  const [focusMode, setFocusMode] = useState(false)
  const [readerScale, setReaderScale] = useState(() => {
    try { return Number(localStorage.getItem('pmn-reader-scale')) || 1 } catch { return 1 }
  })

  const isMobile = () => typeof window !== 'undefined' && window.innerWidth <= 680
  const pIdx = (curPos ? curPos[0] : partIdx) ?? 0
  const sIdx = (curPos ? curPos[1] : secIdx) ?? 0
  const p = data.parts[pIdx]; const s = p?.subs[sIdx]
  const isRead = !!readMap[`${pIdx}-${sIdx}`]
  const mainRef = useRef<HTMLDivElement>(null)

  // Flatten untuk navigasi prev/next (fitur baru, bukan downgrade)
  const flat = useMemo(() => {
    const out: { pi: number; si: number }[] = []
    data.parts.forEach((pt, pi) => pt.subs.forEach((_, si) => out.push({ pi, si })))
    return out
  }, [data.parts])
  const flatIdx = flat.findIndex(f => f.pi === pIdx && f.si === sIdx)
  const prev = flatIdx > 0 ? flat[flatIdx - 1] : null
  const next = flatIdx >= 0 && flatIdx < flat.length - 1 ? flat[flatIdx + 1] : null
  const prevSec = prev ? data.parts[prev.pi]?.subs[prev.si] : null
  const nextSec = next ? data.parts[next.pi]?.subs[next.si] : null

  const measure = MEASURE[contentWidth] || MEASURE.medium

  const changeReaderScale = (delta: number) => {
    const v = Math.max(0.7, Math.min(1.6, +(readerScale + delta).toFixed(2)))
    setReaderScale(v)
    document.documentElement.style.setProperty('--reader-scale', String(v))
    localStorage.setItem('pmn-reader-scale', String(v))
  }
  const resetScale = () => {
    setReaderScale(1)
    document.documentElement.style.setProperty('--reader-scale', '1')
    localStorage.setItem('pmn-reader-scale', '1')
  }

  useEffect(() => { document.documentElement.style.setProperty('--reader-scale', String(readerScale)) }, [])

  // body.focus-mode dipakai style.css untuk sembunyikan #hdr app (transisi)
  useEffect(() => {
    document.body.classList.toggle('focus-mode', focusMode)
    return () => document.body.classList.remove('focus-mode')
  }, [focusMode])

  useEffect(() => {
    if (!focusMode) return
    const onEsc = (e: KeyboardEvent) => { if (e.key === 'Escape') setFocusMode(false) }
    document.addEventListener('keydown', onEsc)
    return () => document.removeEventListener('keydown', onEsc)
  }, [focusMode])

  useEffect(() => {
    const sync = () => setSbOpen(window.innerWidth > 1024)
    window.addEventListener('resize', sync)
    return () => window.removeEventListener('resize', sync)
  }, [])

  // Reading progress bar (#reading-progress ada di header App)
  useEffect(() => {
    const sc = mainRef.current
    if (!sc) return
    const update = () => {
      const h = sc.scrollHeight - sc.clientHeight
      const pct = h > 0 ? (sc.scrollTop / h) * 100 : 0
      const bar = document.getElementById('reading-progress')
      if (bar) bar.style.width = pct + '%'
    }
    sc.addEventListener('scroll', update); update()
    return () => sc.removeEventListener('scroll', update)
  }, [s])

  // Scroll ke atas saat ganti section
  useEffect(() => { mainRef.current?.scrollTo({ top: 0 }) }, [pIdx, sIdx])

  // Auto mark-read setelah 10 detik
  useEffect(() => {
    if (!s || isRead) return
    const t = setTimeout(() => onMarkRead(pIdx, sIdx), 10000)
    return () => clearTimeout(t)
  }, [pIdx, sIdx, s, isRead])

  const html = s?.html || (s?.text ? `<p>${s.text}</p>` : '')
  const readMin = s?.text ? Math.max(1, Math.ceil(s.text.split(/\s+/).length / 200)) : 1

  const navBtn = 'font-pmn-mono text-[0.6rem] uppercase tracking-[0.13em] text-pmn-mute hover:text-pmn-ink transition-colors'
  const ctlBox = 'flex items-center bg-pmn-bg2 border border-pmn-rule rounded-sm p-1 gap-0.5 select-none'
  const ctlBtn = 'w-9 py-1.5 font-pmn-mono text-[0.7rem] text-center rounded-xs cursor-pointer transition-colors'

  return (
    <div className="flex h-full bg-pmn-bg overflow-hidden relative select-text">
      <style>{`
        #rv2-prose{font-family:'Spectral',Georgia,serif;color:var(--ink);letter-spacing:.002em}
        #rv2-prose p{font-size:calc(1.0625rem*var(--reader-scale,1));line-height:1.9;margin:0 0 1.2rem}
        #rv2-prose p:first-of-type:first-letter{font-size:3em;float:left;line-height:.8;font-weight:500;padding:.04em .1em 0 0;color:var(--acc)}
        #rv2-prose em,#rv2-prose i{color:var(--ink);font-style:italic}
        #rv2-prose h2,#rv2-prose h3,#rv2-prose h4{font-family:'Spectral',Georgia,serif;font-weight:500;color:var(--ink);line-height:1.25;margin:2.2rem 0 .8rem}
        #rv2-prose h2{font-size:calc(1.5rem*var(--reader-scale,1))}
        #rv2-prose h3{font-size:calc(1.2rem*var(--reader-scale,1))}
      `}</style>

      {focusMode && (
        <button
          onClick={() => setFocusMode(false)}
          title="Exit focus mode (ESC)"
          className="fixed top-3 right-4 z-[300] font-pmn-mono text-[0.55rem] uppercase tracking-widest px-3 py-1.5 bg-pmn-acc text-white border-none cursor-pointer transition-opacity opacity-20 hover:opacity-90 rounded-xs"
        >
          ✕ Exit Focus
        </button>
      )}

      {sbOpen && !focusMode && (
        <Sidebar
          parts={data.parts}
          readMap={readMap}
          curPos={[pIdx, sIdx]}
          onSelectSection={(p, s) => { onSavePosition(p, s); if (isMobile()) setSbOpen(false) }}
          onClose={() => setSbOpen(false)}
          history={history}
        />
      )}
      {sbOpen && !focusMode && isMobile() && (
        <button
          aria-label="Close section drawer"
          onClick={() => setSbOpen(false)}
          className="fixed inset-0 z-[190] border-none p-0 cursor-pointer"
          style={{ background: 'rgba(0,0,0,.52)' }}
        />
      )}

      <main ref={mainRef} className="flex-1 overflow-y-auto custom-scrollbar relative bg-pmn-bg">
        {/* ── NAV: grid 1fr/auto/1fr → judul presisi di tengah viewport ── */}
        {!focusMode && (
          <nav
            className="sticky top-0 z-20 bg-pmn-bg/95 backdrop-blur-sm border-b border-pmn-rule/60"
            style={{ height: '60px' }}
          >
            <div
              className="h-full grid items-center mx-auto px-4 sm:px-6"
              style={{ gridTemplateColumns: '1fr auto 1fr', maxWidth: measure, width: '100%' }}
            >
              <div className="flex items-center gap-2 min-w-0">
                <button className={navBtn + ' whitespace-nowrap shrink-0'} onClick={onBackHome} aria-label="Back to Table of Contents">
                  &larr; <span className="hidden sm:inline">Contents</span>
                </button>
                <button
                  className="font-pmn-mono text-[0.58rem] uppercase tracking-widest text-pmn-acc border border-pmn-rule px-2 py-1 rounded-xs sm:hidden shrink-0 hover:bg-pmn-acc hover:text-white transition-colors"
                  onClick={() => setSbOpen(v => !v)} aria-expanded={sbOpen}
                >
                  § Sections
                </button>
              </div>

              <div className="flex flex-col items-center text-center px-3 overflow-hidden pointer-events-none" style={{ maxWidth: '52vw' }}>
                <span className="font-pmn-mono text-[0.5rem] sm:text-[0.55rem] text-pmn-acc uppercase tracking-[0.22em] leading-none mb-0.5 font-medium whitespace-nowrap">Part {p?.part}</span>
                <span className="font-pmn-mono text-[0.62rem] sm:text-[0.68rem] text-pmn-mute leading-none truncate w-full">{p?.title}</span>
              </div>

              <div className="flex items-center justify-end">
                <button
                  onClick={() => onMarkRead(pIdx, sIdx)}
                  className={`font-pmn-mono text-[0.55rem] uppercase tracking-widest border rounded-xs px-2.5 py-1.5 shrink-0 whitespace-nowrap transition-colors cursor-pointer ${isRead ? 'border-pmn-acc text-pmn-acc bg-pmn-acc/5' : 'border-pmn-rule text-pmn-mute hover:border-pmn-ink hover:text-pmn-ink'}`}
                >
                  <span className="hidden sm:inline">{isRead ? 'Completed' : 'Mark Read'}</span>
                  <span className="sm:hidden">{isRead ? '✓' : '○'}</span>
                </button>
              </div>
            </div>
          </nav>
        )}

        {/* ── KOLOM BACA: measure ch-based, center via mx-auto pada parent block ── */}
        <article className="mx-auto px-6 sm:px-8 pt-12 pb-32" style={{ maxWidth: measure }}>
          {/* Eyebrow + judul */}
          <p className="font-pmn-mono text-[0.6rem] text-pmn-acc/80 uppercase tracking-[0.32em] mb-5">
            {SPECIAL[p?.part] ? `System Doc · ${shortenId(s?.id || '')}` : `Module · ${shortenId(s?.id || '')}`}
          </p>
          <h1 className="font-pmn-head font-medium text-pmn-ink leading-[1.18] mb-3" style={{ fontFamily: "'Spectral',Georgia,serif", fontSize: 'clamp(1.6rem, 4vw, 2.4rem)' }}>
            {s?.title}
          </h1>
          <div className="w-6 h-[2px] bg-pmn-acc/85 mb-6" />

          {/* Meta + controls */}
          {!focusMode && (
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-pmn-rule/60 pb-6 mb-10 select-none">
              <span className="font-pmn-mono text-[0.62rem] text-pmn-mute uppercase tracking-widest">{readMin} min read</span>
              <div className="flex flex-wrap items-center gap-4">
                <div className="flex items-center gap-2">
                  <span className="font-pmn-mono text-[0.55rem] text-pmn-mute uppercase tracking-widest">Measure</span>
                  <div className={ctlBox}>
                    {(['narrow', 'medium', 'wide'] as const).map((w, i) => (
                      <button key={w} onClick={() => onChangeWidth?.(w)}
                        className={`${ctlBtn} ${contentWidth === w ? 'bg-pmn-acc text-white' : 'text-pmn-mute hover:text-pmn-ink'}`}>
                        {['N', 'M', 'W'][i]}
                      </button>
                    ))}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className="font-pmn-mono text-[0.55rem] text-pmn-mute uppercase tracking-widest">Zoom</span>
                  <div className={ctlBox}>
                    <button onClick={() => changeReaderScale(-0.1)} className={`${ctlBtn} text-pmn-mute hover:text-pmn-ink`}>A-</button>
                    <button onClick={resetScale} className={`${ctlBtn} text-pmn-ink font-medium`}>A</button>
                    <button onClick={() => changeReaderScale(0.1)} className={`${ctlBtn} text-pmn-mute hover:text-pmn-ink`}>A+</button>
                  </div>
                </div>
                <button onClick={() => setFocusMode(true)}
                  className="font-pmn-mono text-[0.6rem] uppercase tracking-widest border border-pmn-rule text-pmn-mute hover:border-pmn-ink hover:text-pmn-ink rounded-xs px-4 py-1.5 cursor-pointer transition-colors">
                  Focus
                </button>
              </div>
            </div>
          )}

          {/* Prose */}
          <div id="rv2-prose" className="prose font-pmn-body" dangerouslySetInnerHTML={{ __html: html }} />

          {/* Prev / Next */}
          <div className="grid grid-cols-2 gap-4 mt-20 pt-8 border-t border-pmn-rule/40">
            {prevSec ? (
              <button onClick={() => prev && onSavePosition(prev.pi, prev.si)}
                className="text-left group cursor-pointer">
                <span className="block font-pmn-mono text-[0.55rem] text-pmn-mute uppercase tracking-widest mb-1">← Previous</span>
                <span className="block font-pmn-head text-[0.95rem] text-pmn-mute group-hover:text-pmn-ink transition-colors" style={{ fontFamily: "'Spectral',serif" }}>{prevSec.title}</span>
              </button>
            ) : <span />}
            {nextSec ? (
              <button onClick={() => next && onSavePosition(next.pi, next.si)}
                className="text-right group cursor-pointer">
                <span className="block font-pmn-mono text-[0.55rem] text-pmn-mute uppercase tracking-widest mb-1">Next →</span>
                <span className="block font-pmn-head text-[0.95rem] text-pmn-mute group-hover:text-pmn-ink transition-colors" style={{ fontFamily: "'Spectral',serif" }}>{nextSec.title}</span>
              </button>
            ) : <span />}
          </div>

          <footer className="mt-16 pt-8 border-t border-pmn-rule/40 flex justify-between items-center select-none font-pmn-mono text-[0.6rem] text-pmn-mute uppercase tracking-[0.3em]">
            <span>PMN Core · Rev v{version}</span>
            <button className="hover:text-pmn-acc transition-colors cursor-pointer" onClick={onBackHome}>Contents ↑</button>
          </footer>
        </article>
      </main>
    </div>
  )
}
