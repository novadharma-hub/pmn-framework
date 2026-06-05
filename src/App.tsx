import React, { useState, useEffect, useRef } from 'react'
import ParticlesBackground from './components/ParticlesBackground'
import ReaderView from './components/ReaderView'
import ContentsView from './components/ContentsView'
import VersionManager from './components/VersionManager'

export default function App() {
  const [page, setPage] = useState<'home' | 'contents' | 'reader' | 'login' | 'admin'>('home')
  const [theme, setTheme] = useState<'dark' | 'light'>('dark')
  const [layoutMode, setLayoutMode] = useState<'auto' | 'mobile' | 'desktop'>('auto')
  const [loading, setLoading] = useState(true)
  const [data, setData] = useState<any>(null)
  const [readMap, setReadMap] = useState<Record<string, boolean>>({})
  const [curPos, setCurPos] = useState<[number, number]>([0, 0])

  useEffect(() => {
    const dataFiles = ['parts', 'gl', 'glg', 'rel', 'look', 'quotes', 'ci']
    Promise.all(dataFiles.map(file => fetch(`./data/${file}.json`).then(res => res.json()).catch(() => null)))
      .then(([parts, gl, glg, rel, look, quotes, ci]) => {
        setData({ parts: parts || [], gl: gl || {}, glg: glg || {}, rel: rel || {}, look: look || {}, quotes: quotes || [], ci: ci || {} })
        setLoading(false)
      })
  }, [])

  useEffect(() => {
    const savedTheme = localStorage.getItem('pmn-theme') as 'dark' | 'light' || 'dark'
    setTheme(savedTheme); document.documentElement.setAttribute('data-theme', savedTheme)
    const savedLayout = localStorage.getItem('pmn-layout'); if (savedLayout) { setLayoutMode(savedLayout as any); document.documentElement.setAttribute('data-layout', savedLayout) }
    const savedRead = JSON.parse(localStorage.getItem('pmn-read') || '{}'); setReadMap(savedRead)
    const savedPos = localStorage.getItem('pmn-pos'); if (savedPos) { const [p, s] = savedPos.split(',').map(Number); if (!isNaN(p) && !isNaN(s)) setCurPos([p, s]) }
  }, [])

  const toggleTheme = () => {
    const nt = theme === 'dark' ? 'light' : 'dark'; setTheme(nt); document.documentElement.setAttribute('data-theme', nt); localStorage.setItem('pmn-theme', nt)
  }

  if (loading || !data) return (
    <div className="flex items-center justify-center min-h-screen bg-[#0d0d0d] text-pmn-acc font-pmn-mono text-xs tracking-widest">MEMUAT MANUSKRIP PMN...</div>
  )

  return (
    <div className="min-h-screen bg-pmn-bg text-pmn-ink transition-colors duration-200">
      <div className="vignette-overlay" />
      <div className="grid-overlay" />
      
      {page === 'home' && (
        <HomeView data={data} readMap={readMap} curPos={curPos} theme={theme} onToggleTheme={toggleTheme} onStartReading={() => setPage('contents')} onResumeReading={() => setPage('reader')} onOpenAdmin={() => setPage('login')} />
      )}

      {page === 'contents' && (
        <ContentsView data={data} readMap={readMap} curPos={curPos} onSelectSection={(p, s) => { setCurPos([p, s]); localStorage.setItem('pmn-pos', `${p},${s}`); setPage('reader') }} onBackHome={() => setPage('home')} theme={theme} onToggleTheme={toggleTheme} />
      )}

      {page === 'reader' && (
        <ReaderView data={data} readMap={readMap} curPos={curPos} onMarkRead={(p, s) => { const key = `${p}-${s}`; const up = { ...readMap, [key]: true }; setReadMap(up); localStorage.setItem('pmn-read', JSON.stringify(up)) }} onSavePosition={(p, s) => { setCurPos([p, s]); localStorage.setItem('pmn-pos', `${p},${s}`) }} onBackHome={() => setPage('contents')} theme={theme} onToggleTheme={toggleTheme} />
      )}

      {page === 'login' && <AdminLogin onLogin={() => setPage('admin')} onBack={() => setPage('home')} />}
      {page === 'admin' && <VersionManager onBack={() => setPage('home')} />}
    </div>
  )
}

function HomeView({ data, readMap, curPos, theme, onToggleTheme, onStartReading, onResumeReading, onOpenAdmin }: any) {
  const resumeSec = data.parts[curPos[0]]?.subs[curPos[1]]
  const totalSections = data.parts.reduce((a: number, p: any) => a + (p.subs?.length || 0), 0)
  const readPct = totalSections > 0 ? Math.round((Object.keys(readMap).length / totalSections) * 100) : 0

  return (
    <div id="home-view" className="view on h-screen overflow-y-auto relative z-10 flex flex-col">
      <header id="hdr" className="sticky top-0 z-[100] h-[52px] px-6 flex items-center justify-between select-none">
         <button className="font-pmn-head font-bold text-[1.05rem] text-pmn-acc tracking-[0.04em]">PMN</button>
         <div className="flex items-center gap-6">
            <button onClick={onStartReading} className="font-pmn-mono text-[0.68rem] text-pmn-mute uppercase hover:text-pmn-acc">Contents</button>
            <button onClick={onToggleTheme} className="font-pmn-mono text-[0.65rem] border border-pmn-rule px-2 py-1 text-pmn-mute">{theme === 'dark' ? '☀ LIGHT' : '☾ DARK'}</button>
            <button onClick={onOpenAdmin} className="font-pmn-mono text-[0.62rem] text-pmn-mute border border-pmn-rule px-2 py-1 bg-pmn-bg2">ADMIN ↗</button>
         </div>
      </header>

      <section id="hero-stage" className="hero-stage cover-active relative min-h-screen flex flex-col justify-center items-center text-center p-6 border-b border-pmn-rule overflow-hidden">
        <ParticlesBackground />
        <div id="hero-parallax" className="hero-parallax relative z-10 max-w-[820px] mx-auto mt-12">
          <div className="font-pmn-mono text-[0.7rem] bg-pmn-acc text-white dark:text-black inline-block px-5 py-1.5 uppercase tracking-[0.2em] mb-8">A Framework for Navigating Material Reality</div>
          <h1 className="font-pmn-head text-[clamp(2.5rem,7vw,5rem)] font-bold uppercase leading-none text-pmn-ink mb-4">Progressive<br />Materialist<br /><em className="text-pmn-acc not-italic lowercase">naturalism</em></h1>
          <p className="font-pmn-body italic text-lg opacity-85 mb-8">By Nova Dharma &mdash; Version 117.6</p>
          <div className="grid grid-cols-3 max-w-[480px] mx-auto border border-pmn-rule bg-pmn-bg2 mb-12 divide-x divide-pmn-rule">
            <div className="py-3"><span className="block font-pmn-mono text-[0.6rem] text-pmn-mute uppercase mb-1">Parts</span><span className="font-pmn-head text-pmn-acc">{data.parts.length}</span></div>
            <div className="py-3"><span className="block font-pmn-mono text-[0.6rem] text-pmn-mute uppercase mb-1">Sections</span><span className="font-pmn-head text-pmn-acc">{totalSections}</span></div>
            <div className="py-3"><span className="block font-pmn-mono text-[0.6rem] text-pmn-mute uppercase mb-1">Read</span><span className="font-pmn-head text-pmn-acc">{readPct}%</span></div>
          </div>
          <div className="flex gap-4 justify-center">
            <button onClick={onStartReading} className="bg-pmn-acc text-white dark:text-black font-pmn-mono text-[0.75rem] font-bold px-8 py-4 tracking-widest uppercase shadow-lg">Start Reading [C]</button>
            {resumeSec && <button onClick={onResumeReading} className="border border-pmn-rule bg-pmn-bg2 font-pmn-mono text-[0.75rem] px-8 py-4 uppercase tracking-widest hover:text-pmn-acc transition-colors">Resume: {resumeSec.id} &rarr;</button>}
          </div>
        </div>
      </section>

      <div className="marquee-wrap bg-pmn-acc py-3 border-b border-pmn-rule select-none overflow-hidden whitespace-nowrap">
        <div className="animate-marquee inline-block font-pmn-mono font-bold text-[0.75rem] text-white dark:text-black uppercase">
          <span className="mr-10">MATERIAL REALITY IS PRIMARY — EMERGENT AND INTERFACE PHENOMENA REMAIN REAL</span>
          <span className="mr-10">ANTI-DOGMATIC BY DESIGN — DOCTRINE REVISABLE UNDER EVIDENCE AND FAILURE</span>
          <span className="mr-10">REDUCE STRUCTURAL SUFFERING — EXPAND GENUINE BECOMING — PMN v117.6</span>
        </div>
      </div>

      <section className="bg-pmn-bg2 py-24 px-6 border-b border-pmn-rule">
        <div className="max-w-[1000px] mx-auto grid grid-cols-1 md:grid-cols-[1fr_2fr] gap-12">
          <div className="border border-pmn-rule p-8 bg-pmn-bg shadow-2xl">
            <h2 className="font-pmn-head text-2xl font-bold mb-4">Axiom Structure</h2>
            <p className="font-pmn-body text-sm text-pmn-mute leading-relaxed mb-6">PMN operates on three levels. Tier 1 axioms are choice anchors. Tier 2 are structural commitments. Tier 3 are empirical hypotheses.</p>
            <div className="flex flex-col gap-2 font-pmn-mono text-[0.6rem] uppercase tracking-widest">
              <div className="text-pmn-acc">● Tier 1 — Foundational</div>
              <div className="text-pmn-ink opacity-70">● Tier 2 — Structural</div>
              <div className="text-pmn-mute">● Tier 3 — Empirical</div>
            </div>
          </div>
          <div className="divide-y divide-pmn-rule">
            <AxiomItem num="1a" title="Mind-Independent Material Reality is Primary">Reality exists independently of perception. Establishing material conditions is the prior move.</AxiomItem>
            <AxiomItem num="1b" title="Suffering Has Negative Evaluative Valence">Biological suffering is our non-arbitrary moral anchor. Organisms materially avoid pain.</AxiomItem>
            <AxiomItem num="1c" title="Becoming is Evaluatively Significant">The expansion of capacity for development beyond survival is the evaluative ceiling.</AxiomItem>
          </div>
        </div>
      </section>

      <footer className="max-w-[900px] mx-auto py-12 px-6 flex justify-between font-pmn-mono text-[0.6rem] text-pmn-mute uppercase tracking-[0.2em]">
        <span>Progressive Materialist Naturalism &mdash; Nova Dharma</span>
        <span>{new Date().getFullYear()}</span>
      </footer>
    </div>
  )
}

function AxiomItem({ num, title, children }: any) {
  const [open, setOpen] = useState(false)
  return (
    <div className="border-b border-pmn-rule">
      <button onClick={() => setOpen(!open)} className="w-full flex items-baseline gap-4 py-5 text-left hover:bg-pmn-acc/5 transition-colors">
        <span className="font-pmn-mono font-bold text-pmn-acc text-sm">{num}</span>
        <span className="font-pmn-head font-bold text-[1.1rem] text-pmn-ink flex-1">{title}</span>
        <span className="font-pmn-mono text-xs">{open ? '−' : '›'}</span>
      </button>
      {open && <div className="pl-9 pb-6 font-pmn-body text-sm text-pmn-ink opacity-80 leading-relaxed">{children}</div>}
    </div>
  )
}

function AdminLogin({ onLogin, onBack }: any) {
  const [u, setU] = useState(''); const [p, setP] = useState(''); const [err, setErr] = useState('')
  const submit = () => { if (u === 'admin' && p === 'pmn117') { onLogin() } else { setErr('Akses ditolak.') } }
  return (
    <div className="max-w-[340px] mx-auto py-32 px-6">
      <button onClick={onBack} className="font-pmn-mono text-[0.6rem] uppercase tracking-widest text-pmn-mute mb-12 hover:text-pmn-acc">← Back</button>
      <div className="space-y-4">
        <input className="w-full bg-pmn-bg2 border border-pmn-rule p-4 font-pmn-body text-sm outline-none" placeholder="Username" value={u} onChange={e => setU(e.target.value)} />
        <input className="w-full bg-pmn-bg2 border border-pmn-rule p-4 font-pmn-body text-sm outline-none" type="password" placeholder="Password" value={p} onChange={e => setP(e.target.value)} />
        {err && <p className="text-pmn-acc font-pmn-mono text-[0.65rem]">{err}</p>}
        <button onClick={submit} className="w-full bg-pmn-acc text-white dark:text-black font-pmn-mono text-xs font-bold py-4 uppercase tracking-widest">Authorize ↗</button>
      </div>
    </div>
  )
}
