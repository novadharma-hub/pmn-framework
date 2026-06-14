import React, { useState, useEffect } from 'react'
import ParticlesBackground from './components/ParticlesBackground'
import ReaderView from './components/ReaderView'
import ContentsView from './components/ContentsView'
import VersionManager from './components/VersionManager'
import KeyboardModal from './components/KeyboardModal'
import NotesModal from './components/NotesModal'
import GuideView from './components/GuideView'
import AITerminal from './components/AITerminal'



export default function App() {
  const [page, setPage] = useState<'home' | 'contents' | 'reader' | 'login' | 'admin' | 'guide'>('home')
  const [theme, setTheme] = useState<'dark' | 'light'>('dark')
  const [loading, setLoading] = useState(true)
  const [data, setData] = useState<any>(null)
  const [loadError, setLoadError] = useState<string | null>(null)
  const [readMap, setReadMap] = useState<Record<string, boolean>>({})
  const [curPos, setCurPos] = useState<[number, number]>([0, 0])
  const [searchQuery, setSearchQuery] = useState('')
  const [searchPartFilter, setSearchPartFilter] = useState('')
  const [paletteTrigger, setPaletteTrigger] = useState(0)
  const [contentsSub, setContentsSub] = useState<'map' | 'glossary' | 'search'>('map')
  const [kbdOpen, setKbdOpen] = useState(false)
  const [notesOpen, setNotesOpen] = useState(false)
  const [contentWidth, setContentWidth] = useState<'narrow' | 'medium' | 'wide'>('wide')
  const [history, setHistory] = useState<[number, number][]>([])
  const [showTip, setShowTip] = useState<boolean>(() => {
    try { return localStorage.getItem('pmn-tip-dismissed') !== '1' } catch { return true }
  }) // persist until X (mengikuti user, not reset on reload/nav back to cover)

  const [version, setVersion] = useState('117.9')

  // Global hotkeys: Alt+K = keyboard modal, Alt+N = notes modal, Alt+/ = command palette, Alt+F = focus, Alt+C = contents, Alt+? = glossary, Alt+R = resume
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (['INPUT', 'TEXTAREA', 'SELECT'].includes((e.target as HTMLElement)?.tagName)) return
      if (!e.altKey || e.ctrlKey || e.metaKey) return // Must press Alt, must NOT press Ctrl or Meta
      const key = e.key.toLowerCase()
      if (key === 'k') { e.preventDefault(); setKbdOpen(v => !v) }
      if (key === 'n') { e.preventDefault(); setNotesOpen(v => !v) }
      if (key === '/') { e.preventDefault(); if (page !== 'reader') setPage('reader'); setPaletteTrigger(t => t + 1) }
      if (key === 'f') { e.preventDefault(); document.body.classList.toggle('focus-mode') } // global focus toggle
      if (key === 'c') { e.preventDefault(); setContentsSub('map'); setPage('contents') }
      if (key === '?' || (key === '/' && e.shiftKey)) { e.preventDefault(); setContentsSub('glossary'); setPage('contents') }
      if (key === 'r') { e.preventDefault(); setPage('reader') }
      
      // Arrow navigation between sections in Reader view
      if (page === 'reader' && data?.parts) {
        if (e.key === 'ArrowRight') {
          e.preventDefault()
          let [pi, si] = curPos
          let nextS = si + 1
          let nextP = pi
          if (nextS >= data.parts[pi].subs.length) {
            nextS = 0
            nextP = pi + 1
          }
          if (nextP < data.parts.length) {
            navToSection(nextP, nextS)
          }
        }
        if (e.key === 'ArrowLeft') {
          e.preventDefault()
          let [pi, si] = curPos
          let prevS = si - 1
          let prevP = pi
          if (prevS < 0) {
            prevP = pi - 1
            if (prevP >= 0) {
              prevS = data.parts[prevP].subs.length - 1
            }
          }
          if (prevP >= 0) {
            navToSection(prevP, prevS)
          }
        }
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [page, data, curPos])

  // Data loading
  useEffect(() => {
    const dataFiles = ['parts', 'gl', 'glg', 'rel', 'look', 'quotes', 'ci', 'version']
    Promise.all(dataFiles.map(f => fetch(`./data/${f}.json`).then(r => r.json()).catch(() => null)))
      .then(([parts, gl, glg, rel, look, quotes, ci, verData]) => {
        setData({ parts: parts || [], gl: gl || {}, glg: glg || {}, rel: rel || {}, look: look || {}, quotes: quotes || [], ci: ci || {} })
        if (verData && verData.version) {
          setVersion(verData.version.replace(/^v/i, ''))
        }
        setLoadError((parts && parts.length > 0) ? null : 'Gagal memuat data manuskrip. Cek network / public_static/data.')
        setLoading(false)
      })
      .catch(e => { setLoadError('Error memuat data: ' + (e?.message || e)); setLoading(false) })
  }, [])

  // Theme & local storage sync
  useEffect(() => {
    const savedTheme = localStorage.getItem('pmn-theme') as 'dark' | 'light' || 'dark'
    setTheme(savedTheme)
    document.documentElement.setAttribute('data-theme', savedTheme)
    const savedRead = JSON.parse(localStorage.getItem('pmn-read') || '{}')
    setReadMap(savedRead)
    const savedPos = localStorage.getItem('pmn-pos')
    if (savedPos) {
      const [p, s] = savedPos.split(',').map(Number)
      if (!isNaN(p) && !isNaN(s)) setCurPos([p, s])
    }
    const savedWidth = localStorage.getItem('pmn-content-width') as any
    if (savedWidth) setContentWidth(savedWidth)
    const savedHist = JSON.parse(localStorage.getItem('pmn-history') || '[]')
    setHistory(savedHist)
  }, [])

  // Content width initialization (moved before conditional returns to fix Hook order violation)
  useEffect(() => {
    const savedWidth = localStorage.getItem('pmn-content-width') as any
    if (savedWidth) {
      setContentWidth(savedWidth)
      const val = savedWidth === 'narrow' ? '62ch' : savedWidth === 'wide' ? '92ch' : '78ch'
      document.documentElement.style.setProperty('--reader-measure', val)
    } else {
      document.documentElement.style.setProperty('--reader-measure', '78ch')
    }
  }, [])

  const toggleTheme = () => {
    const nt = theme === 'dark' ? 'light' : 'dark'
    setTheme(nt)
    document.documentElement.setAttribute('data-theme', nt)
    localStorage.setItem('pmn-theme', nt)
  }

  const handleGlobalSearchJump = () => {
    const q = searchQuery.trim()
    if (!q || !data) { setSearchQuery(''); return }
    
    // 1. Check for exact module ID jump
    const lookHit = data.look && data.look[q]
    if (lookHit && typeof lookHit.pi === 'number') {
      navToSection(lookHit.pi, lookHit.si)
      setPage('reader'); setSearchQuery(''); return
    }
    
    // 2. If on contents page, trigger dedicated search view
    if (page === 'contents') {
      setContentsSub('search');
      return;
    }

    // 3. Fallback to Part jump
    const lowerQ = q.toLowerCase()
    const partHit = data.parts.findIndex((p: any) => p.part.toLowerCase() === lowerQ || p.title.toLowerCase().includes(lowerQ))
    if (partHit !== -1) {
      navToSection(partHit, 0)
      setPage('reader'); setSearchQuery(''); return
    }
    
    // 4. Default: Go to search results page
    setPage('contents');
    setContentsSub('search');
  }

  if (loading) return (
    <div style={{display:'flex',alignItems:'center',justifyContent:'center',minHeight:'100vh',background:'#0d0d0d',color:'#c0271a',fontFamily:"'Source Code Pro',monospace",fontSize:'.65rem',letterSpacing:'.3em',textTransform:'uppercase'}}>
      &gt;&gt; Initializing PMN Core...
    </div>
  )

  if (loadError || !data) return (
    <div style={{display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center',minHeight:'100vh',background:'var(--bg)',color:'var(--ink)',padding:'1.5rem',textAlign:'center'}}>
      <div style={{fontFamily:"'Source Code Pro',monospace",color:'var(--acc)',fontSize:'.85rem',letterSpacing:'.2em',marginBottom:'1rem'}}>DATA LOAD FAILED</div>
      <div style={{maxWidth:'420px',marginBottom:'1.5rem'}}>{loadError || 'Tidak ada data.'}</div>
      <button onClick={() => window.location.reload()} style={{fontFamily:"'Source Code Pro',monospace",fontSize:'.75rem',border:'1px solid var(--rule)',padding:'.5rem 1.2rem',background:'none',color:'var(--ink)',cursor:'pointer'}}>RELOAD</button>
    </div>
  )

  const resumeSection = data.parts[curPos[0]]?.subs[curPos[1]] || null
  const totalSections = data.parts.reduce((a: number, p: any) => a + (p.subs?.length || 0), 0)
  const readPct = totalSections > 0 ? Math.round((Object.keys(readMap).length / totalSections) * 100) : 0

  const navToSection = (pi: number, si: number) => {
    setCurPos([pi, si])
    localStorage.setItem('pmn-pos', `${pi},${si}`)
    // Update history
    setHistory(prev => {
      const next = [[pi, si], ...prev.filter(h => h[0] !== pi || h[1] !== si)].slice(0, 5) as [number, number][]
      localStorage.setItem('pmn-history', JSON.stringify(next))
      return next
    })
  }

  const changeWidth = (w: 'narrow' | 'medium' | 'wide') => {
    setContentWidth(w)
    localStorage.setItem('pmn-content-width', w)
    const val = w === 'narrow' ? '62ch' : w === 'wide' ? '92ch' : '78ch'
    document.documentElement.style.setProperty('--reader-measure', val)
  }

  return (
    <>

      {/* HEADER — IDs match style.css rules exactly */}
      <header id="hdr" className="select-none">
        <div id="reading-progress" className="fixed top-[52px] left-0 h-[2px] bg-pmn-acc z-[110] transition-[width] duration-100 ease-out pointer-events-none" style={{ width: '0%' }} />
        <button id="hdr-logo" onClick={() => setPage('home')}>PMN</button>
        <div id="hdr-srch">
          <span id="srch-icon">&#8981;</span>
          <input
            id="srch-in" type="search"
            placeholder="Search or jump to section… (e.g. 3.4b)"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            onFocus={() => {
              if (page !== 'contents') setPage('contents');
              setContentsSub('search');
            }}
            onKeyDown={e => { if (e.key === 'Enter') handleGlobalSearchJump(); if (e.key === 'Escape') setSearchQuery('') }}
          />
          <select id="srch-part" value={searchPartFilter} onChange={e => setSearchPartFilter(e.target.value)}>
            <option value="">All parts</option>
            {data?.parts?.map((p: any) => <option key={p.part} value={p.part}>{p.part}</option>)}
          </select>
          <button id="srch-clr" onClick={() => { setSearchQuery(''); setSearchPartFilter('') }}>&times;</button>
        </div>
        {/* DEEP SCAN after search (rapi samping logo, not pushing srch to tengah) */}
        <button className="hbtn text-[10px] opacity-70" onClick={() => { if (page !== 'reader') setPage('reader'); setPaletteTrigger(t => t + 1) }}>DEEP SCAN</button>
        <div id="hdr-r">
          <button id="focus-btn" className="focus-mode-btn" onClick={() => document.body.classList.toggle('focus-mode')}>FOCUS</button>
          <button id="hb-home" onClick={() => { setContentsSub('map'); setPage('contents') }}>Table of Contents</button>
          <button id="hb-gl" onClick={() => { setContentsSub('glossary'); setPage('contents') }}>Glossary</button>
          <button id="theme-tog" onClick={toggleTheme}>{theme === 'dark' ? 'LIGHT' : 'DARK'}</button>
          <button id="hb-kbd" onClick={() => setKbdOpen(true)}>Keys [Alt+K]</button>
        </div>
      </header>

      {/* PAGE SHELL — height = 100vh - 52px (header height) */}
      <div className="page-shell">
        <div className="views-shell" style={{flex:1, overflow:'hidden', position:'relative', minHeight:0, width:'100%'}}>

          {page === 'home' && (
            <HomeView
              data={data} readMap={readMap} resumeSec={resumeSection}
              onStartReading={() => setPage('contents')}
              onResumeReading={() => setPage('reader')}
              onOpenAdmin={() => setPage('login')}
              onOpenNotes={() => setNotesOpen(true)}
              onOpenGuide={() => setPage('guide')}
              onOpenGlossary={() => { setContentsSub('glossary'); setPage('contents') }}
              onJump={(pi: number, si: number) => { navToSection(pi, si); setPage('reader') }}
              showTip={showTip} setShowTip={setShowTip}
              version={version}
            />
          )}

          {page === 'contents' && (
            <ContentsView
              data={data} readMap={readMap} curPos={curPos}
              subView={contentsSub}
              searchQuery={searchQuery}
              searchPartFilter={searchPartFilter}
              onSelectSection={(p, s) => { navToSection(p, s); setPage('reader') }}
              onBackHome={() => setPage('home')}
              onSetSubView={setContentsSub}
              onSearch={(query) => {
                setSearchQuery(query);
                setContentsSub('search'); // Dedicated legacy-style search view
                setPage('contents');
              }}
              contentWidth={contentWidth}
              onChangeWidth={changeWidth}
              version={version}
            />
          )}

          {page === 'reader' && (
            <ReaderView
              data={data} readMap={readMap} curPos={curPos}
              onMarkRead={(p, s) => {
                const key = `${p}-${s}`
                const up = { ...readMap, [key]: true }
                setReadMap(up)
                localStorage.setItem('pmn-read', JSON.stringify(up))
              }}
              onSavePosition={(p, s) => navToSection(p, s)}
              onBackHome={() => setPage('contents')}
              theme={theme}
              onToggleTheme={toggleTheme}
              forceOpenPalette={paletteTrigger}
              contentWidth={contentWidth}
              onChangeWidth={changeWidth}
              history={history}
              version={version}
            />
          )}

          {page === 'login' && <AdminLogin onLogin={() => setPage('admin')} onBack={() => setPage('home')} />}
          {page === 'admin' && <VersionManager onBack={() => setPage('home')} />}
          {page === 'guide' && <GuideView onBackHome={() => setPage('home')} version={version} />}

        </div>

        <nav id="mob-nav">
          <button className="mob-nav-btn" onClick={() => setPage(page === 'reader' ? 'contents' : 'home')}>&#8592;</button>
          <button className="mob-nav-btn" onClick={() => setPage('contents')}>&#9776;</button>
          <button className="mob-nav-btn" onClick={() => setPage('reader')}>&#8594;</button>
        </nav>
      </div>

      <KeyboardModal isOpen={kbdOpen} onClose={() => setKbdOpen(false)} />
      <NotesModal isOpen={notesOpen} onClose={() => setNotesOpen(false)} data={data} onJump={(pi: number, si: number) => { navToSection(pi, si); setPage('reader') }} />
      {page === 'home' && showTip && (
        <div className="hero-orientation-tip animate-in fade-in zoom-in duration-300" style={{
          position: 'fixed',
          bottom: '1.6rem',
          right: '1.6rem',
          background: 'var(--bg2)',
          border: '1px solid var(--rule)',
          padding: '0.95rem 1.05rem',
          maxWidth: 275,
          boxShadow: '10px 10px 0 rgba(0,0,0,.25)',
          zIndex: 999
        }}>
          <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:'.3rem'}}>
            <div style={{fontFamily:'var(--f-mono)',fontSize:'.62rem',letterSpacing:'.2em',textTransform:'uppercase',color:'var(--acc)'}}>&#9679; ORIENTATION TIP</div>
            <button onClick={() => { try{localStorage.setItem('pmn-tip-dismissed','1')}catch{}; setShowTip(false) }} style={{background:'none',border:'none',color:'var(--mute)',cursor:'pointer',fontSize:'1.05rem',lineHeight:1}} title="Close tip">×</button>
          </div>
          <div style={{fontFamily:'var(--f-head)',fontSize:'.95rem',color:'var(--ink)',marginBottom:'.3rem'}}>Welcome to PMN Framework</div>
          <p style={{fontFamily:'var(--f-body)',fontSize:'.78rem',lineHeight:1.5,color:'var(--mute)',marginBottom:'.65rem'}}>
            Press <kbd style={{fontFamily:'var(--f-mono)',border:'1px solid var(--rule)',padding:'.1rem .35rem'}}>Alt+K</kbd> anytime for shortcuts, or visit the <button onClick={() => setPage('guide')} style={{color:'var(--acc)', background:'none', border:'none', padding:0, font:'inherit', cursor:'pointer', textDecoration:'underline'}}>AI Agent Guide</button>.
          </p>
          <div style={{display:'flex',gap:'.5rem'}}>
            <button onClick={() => setPage('contents')} style={{background:'var(--acc)',color:'#fff',border:'none',fontFamily:'var(--f-mono)',fontSize:'.65rem',letterSpacing:'.12em',textTransform:'uppercase',padding:'.32rem .65rem',cursor:'pointer'}}>START READING</button>
            <button onClick={() => setPage('guide')} style={{border:'1px solid var(--rule)',fontFamily:'var(--f-mono)',fontSize:'.65rem',letterSpacing:'.12em',textTransform:'uppercase',padding:'.32rem .65rem',color:'var(--ink)',background:'none',cursor:'pointer'}}>OPEN AI GUIDE</button>
          </div>
        </div>
      )}
    </>
  )
}

// ─── HomeView ─────────────────────────────────────────────────────────────────

function HomeView({ data, readMap, resumeSec, onStartReading, onResumeReading, onOpenAdmin, onOpenNotes, onOpenGuide, onOpenGlossary, onJump, showTip, setShowTip, version }: any) {
  const totalSections = data.parts.reduce((a: number, p: any) => a + (p.subs?.length || 0), 0)
  const readCount = Object.keys(readMap).length
  const readPct = totalSections > 0 ? Math.round((readCount / totalSections) * 100) : 0

  const [anatTab, setAnatTab] = useState(0)
  const [deskNotes, setDeskNotes] = useState(() => { try { return localStorage.getItem('pmn-desk-notes') || '' } catch { return '' } })
  const anatParts = data.parts.filter((p: any) => p.part !== 'Preface').slice(0, 14)
  const selectedPart = anatParts[anatTab] || null

  // Restored cover scroll parallax logic in React
  useEffect(() => {
    const homeView = document.getElementById('home-view')
    const stage = document.getElementById('hero-stage')
    if (!homeView || !stage) return

    const reduceMotion = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches
    let current = 0
    let target = 0
    let rafId = 0

    const clamp = (v: number, min: number, max: number) => Math.max(min, Math.min(max, v))
    const easeOutCubic = (v: number) => 1 - Math.pow(1 - v, 3)
    const smoothStep = (v: number) => v * v * (3 - 2 * v)
    const holdRatio = () => window.innerWidth <= 680 ? 0.18 : 0.3
    const shapeProgress = (raw: number) => {
      const hold = holdRatio()
      if (raw <= hold) return raw * 0.05
      return 0.015 + smoothStep((raw - hold) / (1 - hold)) * 0.985
    }

    const computeTarget = () => {
      const releaseRange = Math.max(stage.offsetHeight - homeView.clientHeight, 1)
      const raw = clamp((homeView.scrollTop - stage.offsetTop) / releaseRange, 0, 1)
      target = shapeProgress(raw)
      if (reduceMotion) current = target
    }

    const paint = () => {
      if (!reduceMotion) {
        current += (target - current) * 0.075
        if (Math.abs(target - current) < 0.001) current = target
      }
      const eased = easeOutCubic(current)
      stage.style.setProperty('--cover-progress', eased.toFixed(4))
      stage.classList.toggle('cover-settled', eased > 0.985)
      if (!reduceMotion && current !== target) {
        rafId = requestAnimationFrame(paint)
      } else {
        rafId = 0
      }
    }

    const syncCover = () => {
      computeTarget()
      if (rafId) return
      rafId = requestAnimationFrame(paint)
    }

    homeView.addEventListener('scroll', syncCover, { passive: true })
    window.addEventListener('resize', syncCover)
    syncCover()

    return () => {
      homeView.removeEventListener('scroll', syncCover)
      window.removeEventListener('resize', syncCover)
      if (rafId) cancelAnimationFrame(rafId)
    }
  }, [data])

  return (
    <div id="home-view" className="view on" style={{overflowY:'auto', height:'100%'}}>

      {/* HERO STAGE */}
      <div className="hero-stage cover-active" id="hero-stage">
        <div className="vignette-overlay" />
        <div className="noise-overlay" />
        <div className="grid-overlay" />
        <div className="hero">
          <ParticlesBackground />
          <div className="hero-inner hero-parallax" id="hero-parallax" style={{paddingTop: '1.5rem'}}>
            <div className="hero-orn" style={{marginTop: '0.5rem'}}>A Framework for Navigating Material Reality</div>
            <h1 className="hero-h1">Progressive<br />Materialist<br /><em>naturalism</em></h1>
            <p className="hero-sub">By Nova Dharma &mdash; Version {version}</p>
            <p className="hero-quote">&ldquo;Philosophers have only interpreted the world in various ways. The point, however, is to reconstruct its material foundations.&rdquo;</p>

            <div className="hero-stats">
              <div className="stat"><span className="stat-lbl">Version</span><span className="stat-val">{version}</span></div>
              <div className="stat"><span className="stat-lbl">Parts</span><span className="stat-val">{data.parts.length}</span></div>
              <div className="stat"><span className="stat-lbl">Sections</span><span className="stat-val">{totalSections}</span></div>
              <div className="stat"><span className="stat-lbl">Read</span><span className="stat-val">{readPct}%</span></div>
            </div>

            <div className="hero-ctas">
              <div className="cta-row-main">
                <button id="cta-begin" className="cta-p cta-main" onClick={onStartReading}>
                  Start Reading <span style={{opacity:.82, fontSize:'.68rem'}}>[Alt+C]</span>
                </button>
                {resumeSec && (
                  <button id="cta-resume" className="cta-p secondary" onClick={onResumeReading}>
                    Resume &rarr; <span style={{opacity:.82, fontSize:'.68rem'}}>[Alt+R]</span>
                  </button>
                )}
              </div>
              <div className="cta-row-s">
                <button id="cta-gl" className="cta-s" onClick={onOpenGlossary}>Key Terms <span style={{opacity:.76, fontSize:'.68rem'}}>[Alt+?]</span></button>
                <a href="https://github.com/novadharma-hub/pmn-framework/releases/latest" className="cta-s" target="_blank" rel="noopener">Download Manuscript &darr;</a>
                <button className="cta-s" onClick={onOpenGuide}>AI Agent Guide &rarr;</button>
              </div>
              <div className="cta-row-util">
                <button id="cta-notes" className="cta-util" onClick={onOpenNotes}>My Notes</button>
                {/* Admin Access removed per refs/contoh (no equivalent button in Versi Lama PNGs) */}
              </div>
            </div>
          </div>

          {/* Orientation tip card moved to App level for global fixed positioning */}

          <div className="hero-scroll" aria-hidden="true">
            <span className="hero-scroll-label">Scroll to enter</span>
            <span className="hero-scroll-line"><span className="hero-scroll-fill"></span></span>
          </div>
        </div>
      </div>

      {/* MARQUEE */}
      <div className="marquee-wrap">
        <div className="marquee-track">
          <span className="marquee-txt">MATERIAL REALITY IS PRIMARY — EMERGENT AND INTERFACE PHENOMENA REMAIN REAL</span>
          <span className="marquee-txt">ANTI-DOGMATIC BY DESIGN — DOCTRINE REVISABLE UNDER EVIDENCE AND FAILURE</span>
          <span className="marquee-txt">CONDITIONAL BIOLOGICAL CONSTRAINTS — PROBABILISTIC DETERMINISM — LAYERED ANALYSIS</span>
          <span className="marquee-txt">THE CUSTODIAN PROBLEM — INFORMATION ASYMMETRY AS STRUCTURAL POWER</span>
          <span className="marquee-txt">REDUCE STRUCTURAL SUFFERING — EXPAND GENUINE BECOMING — PMN v{version}</span>
        </div>
      </div>

      {/* READING PATHS */}
      <div className="reading-paths">
        <div className="reading-paths-hdr">
          <h2>Reading Paths</h2>
          <p>Not every reader needs to start the same way. These entry paths give faster on-ramps into PMN depending on whether you want foundations, power analysis, formula compression, or applied cases.</p>
        </div>
        <div className="reading-paths-meta">
          <div className="reading-stat"><strong>Entry Logic</strong><span>Choose by task, not by obligation.</span></div>
          <div className="reading-stat"><strong>Fastest Route</strong><span>15.15 for compression, then backfill.</span></div>
          <div className="reading-stat"><strong>Best for First Pass</strong><span>Start with foundations, not slogans.</span></div>
        </div>
        <div className="reading-paths-grid">
          {([
            {num:'01', kicker:'Foundation First', desc:'Start with epistemology, ontology, and the biological floor before touching doctrine or applied cases.', cta:'Open Part I'},
            {num:'02', kicker:'Power and Institutions', desc:'Jump straight into how power, legitimacy, and institutional capture shape the arrangement beneath the narrative.', cta:'Open Part VI'},
            {num:'03', kicker:'Compressed Core', desc:'Use the short-form PMN core when you need the framework fast before going back for the full architecture.', cta:'Open 15.15'},
            {num:'04', kicker:'Cases and the Individual', desc:'Move from abstract structure into historical cases and the practical demands PMN places on a person who holds it.', cta:'Open Part XVII'},
          ] as const).map(path => (
            <div key={path.num} className="path-card" data-ghost={path.num}>
              <span className="path-kicker">PATH {path.num}</span>
              <h3>{path.kicker}</h3>
              <p>{path.desc}</p>
              <button className="path-btn" onClick={() => {
                if (onJump && data) {
                  // Specific matching to avoid 'I' matching 'VI' or 'XVII'
                  let targetPart = null;
                  if (path.cta === 'Open Part I') targetPart = 'I';
                  else if (path.cta === 'Open Part VI') targetPart = 'VI';
                  else if (path.cta === 'Open Part XVII') targetPart = 'XVII';

                  if (targetPart) {
                    const idx = data.parts.findIndex((pp: any) => pp.part === targetPart);
                    if (idx >= 0) { onJump(idx, 0); return; }
                  }

                  // Special case for compressed core 15.15
                  if (path.cta.includes('15.15') || path.cta.includes('15,15')) {
                    const look = data.look?.['15.15'] || data.look?.['15,15'];
                    if (look) { 
                      onJump(look.pi, look.si); 
                      return; 
                    }
                  }
                }
                onStartReading();
              }}>{path.cta}</button>
            </div>
          ))}
        </div>
      </div>

      {/* ANATOMY TERMINAL — interactive, wired to real parts data */}
      <div className="anatomy-section">
        <div className="anatomy-section-inner">
          <div className="anatomy-section-hdr">
            <h2>Theoretical Anatomy</h2>
            <span>Structural Log: Active</span>
          </div>
          <div className="anatomy-terminal">
            <div className="anatomy-sidebar">
              <div style={{background:'var(--acc)',color:'var(--bg)',fontFamily:'var(--f-mono)',fontSize:'.68rem',fontWeight:700,textTransform:'uppercase',letterSpacing:'.1em',padding:'.6rem 1rem',flexShrink:0}}>
                Theoretical Anatomy
              </div>
              {anatParts.map((p: any, i: number) => (
                <button key={p.part} className={`anatomy-tab${anatTab === i ? ' on' : ''}`} onClick={() => setAnatTab(i)}>
                  Part {p.part}
                </button>
              ))}
            </div>
            <div className="anatomy-content">
              {selectedPart && (
                <div className="anatomy-panel on">
                  <div className="ap-badge">Part {selectedPart.part}</div>
                  <h3>{selectedPart.title}</h3>
                  <p style={{marginBottom:'.85rem'}}>
                    {selectedPart.subs?.[0]?.text
                      ? selectedPart.subs[0].text.slice(0, 260) + '\u2026'
                      : `This part contains ${selectedPart.subs?.length || 0} analytical modules.`}
                  </p>
                  <div style={{fontFamily:'var(--f-mono)',fontSize:'.7rem',marginBottom:'1rem',display:'flex',flexDirection:'column',gap:'.2rem'}}>
                    {(selectedPart.subs || []).slice(0, 7).map((s: any) => (
                      <div key={s.id} style={{padding:'.25rem 0',borderBottom:'1px solid var(--rule)'}}>
                        <span style={{color:'var(--acc)'}}>{s.id}</span>
                        <span style={{color:'var(--ink2)',marginLeft:'.5rem'}}>{s.title}</span>
                      </div>
                    ))}
                    {(selectedPart.subs?.length || 0) > 7 && <div style={{color:'var(--mute)',paddingTop:'.3rem'}}>+ {selectedPart.subs.length - 7} more</div>}
                  </div>
                  <button className="btn-anatomy-more" onClick={() => {
                    if (onJump && data) {
                      const pIdx = data.parts.findIndex((pp: any) => pp.part === selectedPart.part)
                      if (pIdx >= 0) { onJump(pIdx, 0); return }
                    }
                    onStartReading()
                  }}>Open in Reader &rarr;</button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* CORE THESES: ACCORDION */}
      <div className="theses-section">
        <div className="theses-inner">
          <div className="theses-lead">
            <h2>Axiom Structure</h2>
            <p className="theses-lead-sub">PMN operates on three tiers. Tier 1 axioms are design choices defended by argument. Tier 2 are structural commitments. Tier 3 are empirical hypotheses (revisable).</p>
            <div className="theses-tier-list">
              <span className="theses-tier-chip tier-1">&#9679; Tier 1 &mdash; Foundational</span>
              <span className="theses-tier-chip tier-2">&#9679; Tier 2 &mdash; Structural</span>
              <span className="theses-tier-chip tier-3">&#9679; Tier 3 &mdash; Empirical</span>
            </div>
          </div>
          <div className="theses-list" id="theses-list">
            <div className="thesis-tier-hdr tier-1 first">Tier 1 &mdash; Foundational Axioms</div>
            <ThesisItem num="1a" title="MIND-INDEPENDENT MATERIAL REALITY IS PRIMARY">Reality exists independently of perception. Establishing material conditions is the prior move.</ThesisItem>
            <ThesisItem num="1b" title="SUFFERING HAS NEGATIVE EVALUATIVE VALENCE">Biological suffering is our non-arbitrary moral anchor. Pain is materially avoided by all sentient systems.</ThesisItem>
            <ThesisItem num="1c" title="BECOMING IS EVALUATIVELY SIGNIFICANT">The expansion of development capacity is the evaluative ceiling that pairs with the floor of suffering reduction.</ThesisItem>
            <div className="thesis-tier-hdr tier-2">Tier 2 &mdash; Structural Commitments</div>
            <ThesisItem num="2a" title="CONDITIONAL BIOLOGICAL CONSTRAINTS">Human behavior and cognition operate within probabilistic biological constraints that are real but not fatalist.</ThesisItem>
            <ThesisItem num="2b" title="LAYERED ANALYTICAL ARCHITECTURE">Analysis proceeds across tiers: material conditions &#8594; structural forces &#8594; individual agency. No tier collapses into another.</ThesisItem>
            <div className="thesis-tier-hdr tier-3">Tier 3 &mdash; Empirical Hypotheses</div>
            <ThesisItem num="3a" title="INFORMATION ASYMMETRY AS STRUCTURAL POWER">Custodian advantage through selective access to information is a primary mechanism of institutional capture.</ThesisItem>
          </div>
        </div>
      </div>

      {/* HOME AI MODULE — Integrated React Terminal */}
      <div className="home-ai-section">
        <div className="home-ai-inner" style={{maxWidth:1000, margin:'0 auto'}}>
          <AITerminal parts={data.parts} gl={data.gl} activeSec={null} onOpenGuide={onOpenGuide} />
        </div>
      </div>

      {/* READER DESK */}
      <section className="home-bottom">
        <div className="home-bottom-inner">
          <div className="home-bottom-hdr">
            <div>
              <span className="home-bottom-kicker">Reader Desk</span>
              <h2 className="home-bottom-title">Keep notes, prompts, and feedback near the manuscript.</h2>
            </div>
            <p className="home-bottom-desc">Use this space like a working margin: save a line of inquiry, then jump back into the reader without losing your place.</p>
          </div>
          <div className="home-bottom-grid" style={{display:'grid', gridTemplateColumns:'repeat(12, 1fr)', gap:'1.5rem'}}>
            <article className="home-bottom-card notes-card" style={{gridColumn: 'span 8'}}>
              <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:'.6rem'}}>
                <span style={{fontFamily:'var(--f-mono)',fontSize:'.6rem',letterSpacing:'.15em',textTransform:'uppercase',color:'var(--mute)'}}>Quick Notes</span>
                <div style={{display:'flex',gap:'.4rem'}}>
                  <button className="annot-btn" onClick={() => { try { navigator.clipboard.writeText(deskNotes) } catch { window.prompt('Copy:', deskNotes) } }}>Copy</button>
                  <button className="annot-btn" onClick={() => { setDeskNotes(''); try { localStorage.removeItem('pmn-desk-notes') } catch {} }}>Clear</button>
                </div>
              </div>
              <textarea className="home-bottom-notes" placeholder="Your notes on this section\u2026" value={deskNotes} onChange={e => { setDeskNotes(e.target.value); try { localStorage.setItem('pmn-desk-notes', e.target.value) } catch {} }} />
            </article>
            <article className="home-bottom-card compact-card" style={{gridColumn: 'span 4'}}>
              <h3>Useful next moves</h3>
              <p>Keep one foot in the manuscript while you move between orientation and guidance.</p>
              <div className="home-bottom-actions">
                <button className="home-bottom-link" onClick={onStartReading}>Open orientation</button>
                <button className="home-bottom-link" onClick={onOpenGuide}>Open AI Guide</button>
              </div>
            </article>
          </div>

          {/* Release Snapshot — now SEPARATE section (not jammed/terhimpit in Reader Desk grid). Matches Image 1 look + live stats + open actions */}
          <div className="home-bottom-card release-card" style={{marginTop: '2rem', padding: '2rem'}}>
            <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',gap:'2rem',flexWrap:'wrap'}}>
              <div style={{flex: '1', minWidth: '300px'}}>
                <h3 style={{fontSize:'1.4rem', marginBottom:'.5rem'}}>Release Snapshot</h3>
                <p style={{fontSize:'.9rem',color:'var(--ink2)',maxWidth:'400px'}}>Live manuscript state, version tracking, and quick access to core foundations.</p>
              </div>
              <div style={{display:'flex', gap:'2rem', flexWrap:'wrap', flex: '2', justifyContent: 'flex-end'}}>
                <div style={{textAlign: 'center'}}>
                  <span style={{display:'block',fontSize:'.7rem',color:'var(--mute)',textTransform:'uppercase',letterSpacing:'.1em'}}>Parts</span>
                  <strong style={{fontSize: '1.8rem', color: 'var(--acc)'}}>{data.parts.length}</strong>
                </div>
                <div style={{textAlign: 'center'}}>
                  <span style={{display:'block',fontSize:'.7rem',color:'var(--mute)',textTransform:'uppercase',letterSpacing:'.1em'}}>Sections</span>
                  <strong style={{fontSize: '1.8rem', color: 'var(--acc)'}}>{totalSections}</strong>
                </div>
                <div style={{textAlign: 'center'}}>
                  <span style={{display:'block',fontSize:'.7rem',color:'var(--mute)',textTransform:'uppercase',letterSpacing:'.1em'}}>Read</span>
                  <strong style={{fontSize: '1.8rem', color: 'var(--acc)'}}>{readPct}%</strong>
                </div>
                <div style={{textAlign: 'center'}}>
                  <span style={{display:'block',fontSize:'.7rem',color:'var(--mute)',textTransform:'uppercase',letterSpacing:'.1em'}}>Release</span>
                  <strong style={{fontSize: '1.8rem', color: 'var(--acc)'}}>V{version}</strong>
                </div>
              </div>
            </div>
            <div className="home-bottom-actions" style={{marginTop:'1.5rem', paddingTop: '1.5rem', borderTop: '1px solid var(--rule)', display: 'flex', gap: '1rem'}}>
              <button className="home-bottom-link" onClick={onStartReading}>Open Full Contents Map &rarr;</button>
              <button className="home-bottom-link" onClick={() => { onJump(1, 0) }}>Jump to Foundations &rarr;</button>
            </div>
          </div>
        </div>
      </section>

      {/* HOME FOOTER */}
      <div className="home-footer-bar">
        <span>[C] 2026 Nova Dharma // PMN Collective</span>
        <span>V{version} &mdash; Press <kbd style={{fontFamily:'var(--f-mono)',border:'1px solid var(--rule)',padding:'.1rem .4rem',fontSize:'.7rem'}}>Alt+?</kbd> for Glossary &mdash; <kbd style={{fontFamily:'var(--f-mono)',border:'1px solid var(--rule)',padding:'.1rem .4rem',fontSize:'.7rem'}}>Alt+K</kbd> for Keys</span>
      </div>
    </div>
  )
}

// ─── ThesisItem ───────────────────────────────────────────────────────────────

function ThesisItem({ num, title, children }: any) {
  const [open, setOpen] = useState(false)
  return (
    <div className={`thesis-item border-b border-pmn-rule ${open ? 'open bg-pmn-acc/[0.02]' : ''}`}>
      <button className="thesis-toggle w-full flex items-baseline gap-6 py-6 text-left hover:bg-pmn-acc/[0.03] transition-colors" onClick={() => setOpen(!open)}>
        <span className="thesis-num font-pmn-mono text-pmn-acc font-bold text-[0.75rem] tracking-widest">{num}</span>
        <span className="thesis-title font-pmn-head text-[1.05rem] text-pmn-ink uppercase tracking-tight flex-1">{title}</span>
        <span className="thesis-arrow font-pmn-mono text-[0.8rem] text-pmn-mute transition-transform duration-300" style={{ transform: open ? 'rotate(90deg)' : 'none' }}>&rsaquo;</span>
      </button>
      {open && (
        <div className="thesis-body pb-8 pl-16 pr-6 font-pmn-body text-[0.98rem] text-pmn-ink2 leading-relaxed italic animate-in fade-in slide-in-from-top-1">
          {children}
        </div>
      )}
    </div>
  )
}

// ─── AdminLogin ───────────────────────────────────────────────────────────────

function AdminLogin({ onLogin, onBack }: any) {
  const [u, setU] = useState('')
  const [p, setP] = useState('')
  const [err, setErr] = useState('')
  const submit = () => {
    if (u === 'admin' && p === 'pmn117') { onLogin() }
    else { setErr('Access Denied.') }
  }
  return (
    <div id="home-view" className="view on" style={{display:'flex',alignItems:'center',justifyContent:'center',height:'100%'}}>
      <div style={{background:'var(--bg2)',border:'1px solid var(--rule)',padding:'3rem',boxShadow:'12px 12px 0 rgba(0,0,0,.3)',maxWidth:'360px',width:'100%'}}>
        <h2 style={{fontFamily:'var(--f-head)',fontSize:'1.3rem',fontWeight:700,marginBottom:'2rem',color:'var(--ink)'}}>Admin Authorization</h2>
        <div style={{display:'flex',flexDirection:'column',gap:'1rem'}}>
          <input
            style={{width:'100%',background:'var(--bg)',border:'1px solid var(--rule)',padding:'1rem',fontFamily:'var(--f-body)',fontSize:'.9rem',outline:'none',color:'var(--ink)'}}
            placeholder="Identifier" value={u} onChange={e => setU(e.target.value)}
          />
          <input
            style={{width:'100%',background:'var(--bg)',border:'1px solid var(--rule)',padding:'1rem',fontFamily:'var(--f-body)',fontSize:'.9rem',outline:'none',color:'var(--ink)'}}
            type="password" placeholder="Passphrase" value={p} onChange={e => setP(e.target.value)}
          />
          {err && <p style={{color:'var(--acc)',fontSize:'.8rem',fontStyle:'italic'}}>{err}</p>}
          <button onClick={submit} className="cta-p cta-main" style={{width:'100%',padding:'1rem',marginTop:'.5rem'}}>Authorize &uarr;</button>
          <button onClick={onBack} style={{width:'100%',background:'none',border:'none',color:'var(--mute)',fontFamily:'var(--f-mono)',fontSize:'.72rem',textTransform:'uppercase',letterSpacing:'.15em',cursor:'pointer',marginTop:'.5rem'}}>&larr; Cancel</button>
        </div>
      </div>
    </div>
  )
}
