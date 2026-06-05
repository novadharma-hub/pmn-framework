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

  // Fetch Data
  useEffect(() => {
    const files = ['parts', 'gl', 'glg', 'rel', 'look', 'quotes', 'ci']
    Promise.all(files.map(f => fetch(`./data/${f}.json`).then(r => r.json()).catch(() => null)))
      .then(([parts, gl, glg, rel, look, quotes, ci]) => {
        setData({ parts: parts || [], gl: gl || {}, glg: glg || {}, rel: rel || {}, look: look || {}, quotes: quotes || [], ci: ci || {} })
        setLoading(false)
      })
  }, [])

  // Init Settings
  useEffect(() => {
    const st = localStorage.getItem('pmn-theme') as 'dark' | 'light' || 'dark'
    setTheme(st); document.documentElement.setAttribute('data-theme', st)
    
    const sl = localStorage.getItem('pmn-layout'); if (sl) { setLayoutMode(sl as any); document.documentElement.setAttribute('data-layout', sl) }
    const sr = JSON.parse(localStorage.getItem('pmn-read') || '{}'); setReadMap(sr)
    const sp = localStorage.getItem('pmn-pos'); if (sp) { const [p, s] = sp.split(',').map(Number); if (!isNaN(p) && !isNaN(s)) setCurPos([p, s]) }
  }, [])

  const toggleTheme = () => {
    const nt = theme === 'dark' ? 'light' : 'dark'; setTheme(nt); document.documentElement.setAttribute('data-theme', nt); localStorage.setItem('pmn-theme', nt)
  }

  if (loading || !data) return (
    <div className="flex items-center justify-center min-h-screen bg-pmn-bg text-pmn-acc font-pmn-mono text-xs tracking-[0.3em] uppercase animate-pulse">
      MEMUAT MANUSKRIP PMN...
    </div>
  )

  const resumeSection = data.parts[curPos[0]]?.subs[curPos[1]] || null

  return (
    <div className="min-h-screen bg-pmn-bg text-pmn-ink transition-colors duration-300 selection:bg-pmn-acc/30 selection:text-white dark:selection:text-black">
      {/* Decorative Overlays (Consistent with index.html.bak) */}
      <div className="vignette-overlay pointer-events-none" />
      <div className="grid-overlay pointer-events-none" />

      {page === 'home' && (
        <HomeView 
          data={data} readMap={readMap} resumeSec={resumeSection} 
          theme={theme} onToggleTheme={toggleTheme}
          onStartReading={() => setPage('contents')}
          onResumeReading={() => setPage('reader')}
          onOpenAdmin={() => setPage('login')}
        />
      )}

      {page === 'contents' && (
        <ContentsView 
          data={data} readMap={readMap} curPos={curPos}
          onSelectSection={(p, s) => { setCurPos([p, s]); localStorage.setItem('pmn-pos', `${p},${s}`); setPage('reader') }}
          onBackHome={() => setPage('home')}
          theme={theme} onToggleTheme={toggleTheme}
        />
      )}

      {page === 'reader' && (
        <ReaderView 
          data={data} readMap={readMap} curPos={curPos}
          onMarkRead={(p, s) => { const key = `${p}-${s}`; const up = { ...readMap, [key]: true }; setReadMap(up); localStorage.setItem('pmn-read', JSON.stringify(up)) }}
          onSavePosition={(p, s) => { setCurPos([p, s]); localStorage.setItem('pmn-pos', `${p},${s}`) }}
          onBackHome={() => setPage('contents')}
          theme={theme} onToggleTheme={toggleTheme}
        />
      )}

      {page === 'login' && <AdminLogin onLogin={() => setPage('admin')} onBack={() => setPage('home')} />}
      {page === 'admin' && <VersionManager onBack={() => setPage('home')} />}
    </div>
  )
}

function HomeView({ data, readMap, resumeSec, theme, onToggleTheme, onStartReading, onResumeReading, onOpenAdmin }: any) {
  const totalSections = data.parts.reduce((a: number, p: any) => a + (p.subs?.length || 0), 0)
  const readCount = Object.keys(readMap).length
  const readPct = totalSections > 0 ? Math.round((readCount / totalSections) * 100) : 0

  return (
    <div id="home-view" className="view on h-screen overflow-y-auto relative z-10 flex flex-col">
      {/* HEADER: Restoration to Original Minimal Style */}
      <header id="hdr" className="sticky top-0 h-[52px] bg-pmn-bg border-b border-pmn-rule px-6 flex items-center justify-between z-[100] select-none">
        <button className="font-pmn-head font-bold text-[1.1rem] text-pmn-acc tracking-[0.04em] hover:opacity-80 transition-opacity">
          PMN
        </button>
        <div className="flex items-center gap-8">
          <button onClick={onStartReading} className="font-pmn-mono text-[0.68rem] text-pmn-mute uppercase tracking-[0.15em] hover:text-pmn-acc transition-colors">
            Contents
          </button>
          <button onClick={onToggleTheme} className="font-pmn-mono text-[0.65rem] border border-pmn-rule2 px-3 py-1 text-pmn-mute hover:border-pmn-acc hover:text-pmn-acc transition-all">
            {theme === 'dark' ? '☀ LIGHT' : '☾ DARK'}
          </button>
          <button onClick={onOpenAdmin} className="font-pmn-mono text-[0.62rem] text-pmn-mute border border-pmn-rule bg-pmn-bg2 px-3 py-1.5 hover:bg-pmn-acc/10 transition-all">
            ADMIN ↗
          </button>
        </div>
      </header>

      {/* HERO: Cinematic & Dense */}
      <section id="hero-stage" className="hero-stage relative min-h-screen flex flex-col justify-center items-center text-center p-6 border-b border-pmn-rule overflow-hidden">
        <ParticlesBackground />
        
        <div id="hero-parallax" className="hero-parallax relative z-10 max-w-[850px] w-full mx-auto mt-8 flex flex-col items-center">
          <div className="font-pmn-mono text-[0.68rem] bg-pmn-acc text-white dark:text-black inline-block px-6 py-2 tracking-[0.25em] uppercase mb-10 shadow-xl">
            A Framework for Navigating Material Reality
          </div>
          
          <h1 className="font-pmn-head text-[clamp(2.8rem,8vw,5.5rem)] font-bold uppercase leading-[0.95] tracking-tight text-pmn-ink mb-6 select-none drop-shadow-2xl">
            Progressive<br />Materialist<br />
            <em className="text-pmn-acc not-italic font-normal block lowercase mt-3" style={{ fontFamily: 'serif', fontStyle: 'italic' }}>naturalism</em>
          </h1>
          
          <p className="font-pmn-body italic text-xl text-pmn-ink opacity-90 mb-10 tracking-wide">
            By Nova Dharma &mdash; Version 117.6
          </p>
          
          <div className="font-pmn-body italic text-[0.95rem] text-pmn-ink2 max-w-[580px] border-y border-pmn-acc/40 py-5 px-8 mb-12 leading-relaxed bg-pmn-bg2/30 backdrop-blur-xs">
            &ldquo;Philosophers have only interpreted the world in various ways. The point, however, is to reconstruct its material foundations.&rdquo;
          </div>

          {/* Metrics Grid */}
          <div className="grid grid-cols-3 w-full max-w-[520px] border border-pmn-rule bg-pmn-bg2 mb-12 divide-x divide-pmn-rule shadow-2xl">
            <div className="py-4 px-2">
              <span className="block font-pmn-mono text-[0.6rem] text-pmn-mute uppercase tracking-[0.2em] mb-1">Architecture</span>
              <span className="font-pmn-head text-[1.2rem] text-pmn-acc font-bold">{data.parts.length} Parts</span>
            </div>
            <div className="py-4 px-2">
              <span className="block font-pmn-mono text-[0.6rem] text-pmn-mute uppercase tracking-[0.2em] mb-1">Modules</span>
              <span className="font-pmn-head text-[1.2rem] text-pmn-acc font-bold">{totalSections} Sections</span>
            </div>
            <div className="py-4 px-2">
              <span className="block font-pmn-mono text-[0.6rem] text-pmn-mute uppercase tracking-[0.2em] mb-1">Progress</span>
              <span className="font-pmn-head text-[1.2rem] text-pmn-acc font-bold">{readPct}% Read</span>
            </div>
          </div>

          {/* Main Action Row */}
          <div className="flex flex-wrap gap-5 justify-center w-full max-w-[600px]">
            <button 
              onClick={onStartReading} 
              className="bg-pmn-acc text-white dark:text-black font-pmn-mono text-[0.8rem] font-bold px-12 py-5 tracking-[0.2em] uppercase shadow-[10px_10px_0_rgba(0,0,0,0.5)] hover:translate-y-[-2px] hover:translate-x-[-2px] active:translate-y-[0] active:translate-x-[0] transition-all cursor-pointer"
            >
              Start Reading [C]
            </button>
            {resumeSec && (
              <button 
                onClick={onResumeReading} 
                className="border border-pmn-rule bg-pmn-bg2 font-pmn-mono text-[0.75rem] font-bold text-pmn-acc px-10 py-5 tracking-[0.15em] uppercase hover:bg-pmn-acc/5 transition-all shadow-xl cursor-pointer"
              >
                Resume: {resumeSec.id} &rarr;
              </button>
            )}
          </div>
        </div>

        {/* Scroll Prompt */}
        <div className="absolute bottom-10 left-1/2 -translate-x-1/2 flex flex-col items-center gap-3 animate-bounce opacity-40">
           <span className="font-pmn-mono text-[0.55rem] uppercase tracking-widest text-pmn-mute">Scroll Down</span>
           <div className="w-px h-12 bg-pmn-acc" />
        </div>
      </section>

      {/* MARQUEE: Crucial for "Density" feel */}
      <div className="bg-pmn-acc py-3.5 border-y border-pmn-rule select-none overflow-hidden whitespace-nowrap shadow-xl">
        <div className="animate-marquee inline-block font-pmn-mono font-bold text-[0.72rem] text-white dark:text-black uppercase tracking-[0.15em]">
          <span className="mr-12">MATERIAL REALITY IS PRIMARY — EMERGENT AND INTERFACE PHENOMENA REMAIN REAL</span>
          <span className="mr-12">ANTI-DOGMATIC BY DESIGN — DOCTRINE REVISABLE UNDER EVIDENCE AND FAILURE</span>
          <span className="mr-12">REDUCE STRUCTURAL SUFFERING — EXPAND GENUINE BECOMING — PMN v117.6</span>
          <span className="mr-12">THE CUSTODIAN PROBLEM — INFORMATION ASYMMETRY AS STRUCTURAL POWER</span>
        </div>
      </div>

      {/* AXIOM MAP: Structural Fidelity */}
      <section className="bg-pmn-bg2 py-24 px-6 border-b border-pmn-rule">
        <div className="max-w-[1100px] mx-auto grid grid-cols-1 lg:grid-cols-[1fr_2.2fr] gap-16 items-start">
          <div className="border border-pmn-rule p-10 bg-pmn-bg shadow-[15px_15px_0_rgba(0,0,0,0.4)] sticky top-24">
            <h2 className="font-pmn-head text-3xl font-bold mb-5 leading-tight">Axiom Map</h2>
            <p className="font-pmn-body text-[0.95rem] text-pmn-mute leading-relaxed mb-8 opacity-80 italic">
              PMN operates on three integrated layers of analysis. Every proposition is anchored in the layers below it.
            </p>
            <div className="flex flex-col gap-3 font-pmn-mono text-[0.62rem] uppercase tracking-[0.2em] font-bold">
              <div className="text-pmn-acc flex items-center gap-3"><span className="w-2 h-2 rounded-full bg-pmn-acc" /> Tier 1 — Foundational</div>
              <div className="text-pmn-ink opacity-60 flex items-center gap-3"><span className="w-2 h-2 rounded-full bg-pmn-ink" /> Tier 2 — Structural</div>
              <div className="text-pmn-mute flex items-center gap-3"><span className="w-2 h-2 rounded-full bg-pmn-mute" /> Tier 3 — Empirical</div>
            </div>
          </div>
          
          <div className="divide-y divide-pmn-rule/60 border-t border-pmn-rule/60">
            <AxiomItem num="1a" title="Mind-Independent Material Reality is Primary">
              Reality exists independently of perception. Establishing material conditions is the prior analytical move: any framework that begins with norms before conditions is built on sand.
            </AxiomItem>
            <AxiomItem num="1b" title="Suffering Has Negative Evaluative Valence">
              Biological suffering is our non-arbitrary moral anchor. We do not argue from metaphysics, but from the material fact that organisms avoid pain.
            </AxiomItem>
            <AxiomItem num="1c" title="Becoming is Evaluatively Significant">
              The expansion of capacity for development beyond mere survival is the evaluative ceiling that pairs with the biological floor.
            </AxiomItem>
            <AxiomItem num="2a" title="Probabilistic Determinism">
              Structural forces establish probability distributions over outcomes, not fatalistic certainty. The task is to identify which outcomes the arrangement makes most likely.
            </AxiomItem>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="max-w-[1000px] mx-auto py-16 px-8 flex justify-between items-center flex-wrap gap-6 text-xs font-pmn-mono text-pmn-mute uppercase tracking-[0.25em] mt-auto select-none">
        <span>Progressive Materialist Naturalism &mdash; Nova Dharma</span>
        <div className="flex gap-6">
           <a href="https://github.com/novadharma-hub/pmn-framework" target="_blank" className="hover:text-pmn-acc transition-colors">GitHub</a>
           <span>{new Date().getFullYear()}</span>
        </div>
      </footer>
    </div>
  )
}

function AxiomItem({ num, title, children }: any) {
  const [open, setOpen] = useState(false)
  return (
    <div className="group border-b border-pmn-rule/40 last:border-none">
      <button 
        onClick={() => setOpen(!open)} 
        className="w-full flex items-baseline gap-6 py-8 text-left hover:bg-pmn-acc/5 transition-all px-4 cursor-pointer"
      >
        <span className="font-pmn-mono font-bold text-pmn-acc text-[1.1rem] tracking-tighter opacity-80 group-hover:opacity-100">{num}</span>
        <span className="font-pmn-head font-bold text-[1.25rem] text-pmn-ink flex-1 leading-tight group-hover:text-pmn-acc transition-colors">{title}</span>
        <span className="font-pmn-mono text-lg text-pmn-mute transition-transform duration-300" style={{ transform: open ? 'rotate(90deg)' : 'rotate(0)' }}>›</span>
      </button>
      {open && (
        <div className="pl-[4.5rem] pr-6 pb-10 font-pmn-body text-[1.05rem] text-pmn-ink/80 leading-relaxed animate-slide-up">
          {children}
        </div>
      )}
    </div>
  )
}

function AdminLogin({ onLogin, onBack }: any) {
  const [u, setU] = useState(''); const [p, setP] = useState(''); const [err, setErr] = useState('')
  const submit = () => { if (u === 'admin' && p === 'pmn117') { onLogin() } else { setErr('Akses ditolak.') } }
  return (
    <div className="max-w-[380px] mx-auto py-32 px-6 flex flex-col items-center">
      <button onClick={onBack} className="font-pmn-mono text-[0.62rem] uppercase tracking-[0.2em] text-pmn-mute mb-16 hover:text-pmn-acc flex items-center gap-2 cursor-pointer group transition-all">
        <span className="group-hover:-translate-x-1 transition-transform">←</span> Back to Framework
      </button>
      
      <div className="w-full bg-pmn-bg2 border border-pmn-rule p-10 shadow-[20px_20px_0_rgba(0,0,0,0.6)] space-y-6">
        <div className="text-center space-y-2 mb-8">
           <span className="font-pmn-mono text-[0.6rem] text-pmn-acc uppercase tracking-[0.3em] font-bold">Encrypted Access</span>
           <h2 className="font-pmn-head text-xl font-bold text-pmn-ink">Admin Authorization</h2>
        </div>
        
        <input className="w-full bg-pmn-bg border border-pmn-rule p-4 font-pmn-body text-sm outline-none focus:border-pmn-acc transition-colors text-pmn-ink" placeholder="Security Identifier" value={u} onChange={e => setU(e.target.value)} />
        <input className="w-full bg-pmn-bg border border-pmn-rule p-4 font-pmn-body text-sm outline-none focus:border-pmn-acc transition-colors text-pmn-ink" type="password" placeholder="Passphrase" value={p} onChange={e => setP(e.target.value)} />
        
        {err && <p className="text-pmn-acc font-pmn-mono text-[0.65rem] text-center italic">⚠️ {err}</p>}
        
        <button onClick={submit} className="w-full bg-pmn-acc text-white dark:text-black font-pmn-mono text-xs font-bold py-5 uppercase tracking-[0.2em] shadow-lg hover:opacity-85 transition-opacity cursor-pointer">
          Authorize Session ↗
        </button>
      </div>
    </div>
  )
}
