import React, { useState, useEffect, useRef } from 'react'
import ParticlesBackground from './components/ParticlesBackground'
import ReaderView from './components/ReaderView'
import ContentsView from './components/ContentsView'
import VersionManager from './components/VersionManager'

export default function App() {
  const [page, setPage] = useState<'home' | 'contents' | 'reader' | 'login' | 'admin'>('home')
  const [theme, setTheme] = useState<'dark' | 'light'>('dark')
  const [layoutMode, setLayoutMode] = useState<'auto' | 'mobile' | 'desktop'>('auto')
  
  // Manuscript Data State
  const [loading, setLoading] = useState(true)
  const [data, setData] = useState<{
    parts: any[];
    gl: Record<string, string>;
    glg: Record<string, any>;
    rel: Record<string, any>;
    look: Record<string, any>;
    quotes: string[];
    ci: Record<string, any>;
  } | null>(null)

  // Global Reading States
  const [readMap, setReadMap] = useState<Record<string, boolean>>({})
  const [curPos, setCurPos] = useState<[number, number]>([0, 0])

  // Fetch Manuscript Data
  useEffect(() => {
    const dataFiles = ['parts', 'gl', 'glg', 'rel', 'look', 'quotes', 'ci']
    
    Promise.all(dataFiles.map(file => 
      fetch(`./data/${file}.json`)
        .then(res => {
          if (!res.ok) throw new Error(`Gagal memuat ${file}`)
          return res.json()
        })
        .catch(err => {
          console.error(err)
          return null
        })
    )).then(([parts, gl, glg, rel, look, quotes, ci]) => {
      setData({
        parts: parts || [],
        gl: gl || {},
        glg: glg || {},
        rel: rel || {},
        look: look || {},
        quotes: quotes || [],
        ci: ci || {}
      })
      setLoading(false)
    })
  }, [])

  // Initialize Theme, Reading Progress, & Layout overrides
  useEffect(() => {
    // Theme
    try {
      const savedTheme = localStorage.getItem('pmn-theme') as 'dark' | 'light'
      const activeTheme = savedTheme || 'dark'
      setTheme(activeTheme)
      document.documentElement.setAttribute('data-theme', activeTheme)
    } catch (e) {}

    // Layout
    try {
      const savedLayout = localStorage.getItem('pmn-layout') as 'mobile' | 'desktop' | null
      if (savedLayout) {
        setLayoutMode(savedLayout)
        document.documentElement.setAttribute('data-layout', savedLayout)
      }
    } catch (e) {}

    // Reading Progress
    try {
      const savedRead = JSON.parse(localStorage.getItem('pmn-read') || '{}')
      setReadMap(savedRead)
    } catch (e) {}

    // Reading Position
    try {
      const savedPos = localStorage.getItem('pmn-pos')
      if (savedPos) {
        const [p, s] = savedPos.split(',').map(Number)
        if (!isNaN(p) && !isNaN(s)) {
          setCurPos([p, s])
        }
      }
    } catch (e) {}
  }, [])

  const toggleTheme = () => {
    const nextTheme = theme === 'dark' ? 'light' : 'dark'
    setTheme(nextTheme)
    document.documentElement.setAttribute('data-theme', nextTheme)
    try {
      localStorage.setItem('pmn-theme', nextTheme)
    } catch (e) {}
  }

  const toggleLayoutMode = () => {
    const isMobileScreen = window.innerWidth <= 680
    const eff = layoutMode === 'auto' ? (isMobileScreen ? 'mobile' : 'desktop') : layoutMode
    
    let nextMode: 'auto' | 'mobile' | 'desktop' = 'auto'
    if (layoutMode === 'auto') {
      nextMode = eff === 'mobile' ? 'desktop' : 'mobile'
    } else if (layoutMode === eff) {
      nextMode = eff === 'mobile' ? 'desktop' : 'mobile'
    } else {
      nextMode = 'auto'
    }

    setLayoutMode(nextMode)
    try {
      if (nextMode !== 'auto') {
        localStorage.setItem('pmn-layout', nextMode)
        document.documentElement.setAttribute('data-layout', nextMode)
      } else {
        localStorage.removeItem('pmn-layout')
        document.documentElement.removeAttribute('data-layout')
      }
    } catch (e) {}
  }

  const markSectionAsRead = (partIdx: number, secIdx: number) => {
    const key = `${partIdx}-${secIdx}`
    if (readMap[key]) return
    const updated = { ...readMap, [key]: true }
    setReadMap(updated)
    try {
      localStorage.setItem('pmn-read', JSON.stringify(updated))
    } catch (e) {}
  }

  const saveReadingPosition = (partIdx: number, secIdx: number) => {
    setCurPos([partIdx, secIdx])
    try {
      localStorage.setItem('pmn-pos', `${partIdx},${secIdx}`)
    } catch (e) {}
  }

  if (loading || !data) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-[#0d0d0d] text-[#c9a84c] font-mono text-sm tracking-widest">
        <div className="text-center">
          <div className="animate-pulse mb-3">MEMUAT MANUSKRIP PMN...</div>
          <div className="w-48 h-1 bg-[#1a1a1a] mx-auto overflow-hidden">
            <div className="h-full bg-[#c9a84c] animate-infinite-loading w-1/2"></div>
          </div>
        </div>
      </div>
    )
  }

  // Find resume section info if valid
  const resumeSection = (() => {
    const [pIdx, sIdx] = curPos
    return data.parts[pIdx]?.subs[sIdx] || null
  })()

  return (
    <div className="min-h-screen bg-[var(--bg)] text-[var(--ink)] transition-colors duration-200">
      {/* Dynamic Grid Overlays */}
      <div className="vignette-overlay" />
      <div className="grid-overlay" />

      {/* Main App Page Routing Container */}
      {page === 'home' && (
        <HomeView 
          data={data}
          readMap={readMap}
          resumeSec={resumeSection}
          theme={theme}
          onToggleTheme={toggleTheme}
          layoutMode={layoutMode}
          onToggleLayout={toggleLayoutMode}
          onStartReading={() => setPage('contents')}
          onResumeReading={() => setPage('reader')}
          onOpenAdmin={() => setPage('login')}
        />
      )}

      {page === 'contents' && (
        <ContentsView 
          data={data}
          readMap={readMap}
          curPos={curPos}
          onSelectSection={(pIdx, sIdx) => {
            saveReadingPosition(pIdx, sIdx)
            setPage('reader')
          }}
          onBackHome={() => setPage('home')}
          theme={theme}
          onToggleTheme={toggleTheme}
        />
      )}

      {page === 'reader' && (
        <ReaderView 
          data={data}
          readMap={readMap}
          curPos={curPos}
          onMarkRead={markSectionAsRead}
          onSavePosition={saveReadingPosition}
          onBackHome={() => setPage('contents')}
          theme={theme}
          onToggleTheme={toggleTheme}
        />
      )}

      {page === 'login' && (
        <AdminLogin 
          onLogin={() => setPage('admin')}
          onBack={() => setPage('home')}
        />
      )}

      {page === 'admin' && (
        <VersionManager 
          onBack={() => setPage('home')}
        />
      )}
    </div>
  )
}

// ─── LOKAL SUB-KOMPONEN UNTUK TAMPILAN BERANDA (HOME VIEW) ───
interface HomeViewProps {
  data: any
  readMap: Record<string, boolean>
  resumeSec: any
  theme: 'dark' | 'light'
  onToggleTheme: () => void
  layoutMode: 'auto' | 'mobile' | 'desktop'
  onToggleLayout: () => void
  onStartReading: () => void
  onResumeReading: () => void
  onOpenAdmin: () => void
}

function HomeView({ 
  data, 
  readMap, 
  resumeSec, 
  theme, 
  onToggleTheme, 
  layoutMode, 
  onToggleLayout, 
  onStartReading, 
  onResumeReading, 
  onOpenAdmin 
}: HomeViewProps) {
  const homeViewRef = useRef<HTMLDivElement>(null)
  const heroStageRef = useRef<HTMLDivElement>(null)

  // Cover parallax calculations (L1432-1484 in app.ts)
  useEffect(() => {
    const homeView = homeViewRef.current
    const stage = heroStageRef.current
    if (!homeView || !stage) return

    const reduceMotion = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches
    let current = 0
    let target = 0
    let rafId = 0

    function holdRatio() {
      return window.innerWidth <= 680 ? 0.18 : 0.3
    }
    
    function shapeProgress(raw: number) {
      const hold = holdRatio()
      if (raw <= hold) return raw * 0.05
      // Simplified smoothStep: v * v * (3 - 2 * v)
      const v = (raw - hold) / (1 - hold)
      return 0.015 + (v * v * (3 - 2 * v)) * 0.985
    }

    function paint() {
      if (!reduceMotion) {
        current += (target - current) * 0.075
        if (Math.abs(target - current) < 0.001) current = target
      } else {
        current = target
      }
      
      // Eased cubic release
      const eased = 1 - Math.pow(1 - current, 3)
      stage.style.setProperty('--cover-progress', eased.toFixed(4))
      stage.classList.toggle('cover-settled', eased > 0.985)
      
      if (!reduceMotion && current !== target) {
        rafId = requestAnimationFrame(paint)
      } else {
        rafId = 0
      }
    }

    function syncCover() {
      const releaseRange = Math.max(stage.offsetHeight - homeView.clientHeight, 1)
      const raw = Math.max(0, Math.min(1, (homeView.scrollTop - stage.offsetTop) / releaseRange))
      target = shapeProgress(raw)
      
      if (reduceMotion) {
        current = target
        paint()
      } else if (!rafId) {
        rafId = requestAnimationFrame(paint)
      }
    }

    homeView.addEventListener('scroll', syncCover, { passive: true })
    window.addEventListener('resize', syncCover)
    syncCover()

    return () => {
      homeView.removeEventListener('scroll', syncCover)
      window.removeEventListener('resize', syncCover)
      if (rafId) cancelAnimationFrame(rafId)
    }
  }, [])

  // Calculate statistics
  const totalSections = data.parts.reduce((acc: number, p: any) => acc + (p.subs?.length || 0), 0)
  const readCount = Object.keys(readMap).length
  const readPct = totalSections > 0 ? Math.round((readCount / totalSections) * 100) : 0

  // Format layout toggle label
  const getLayoutLabel = () => {
    const isMobileScreen = window.innerWidth <= 680
    const eff = isMobileScreen ? 'mobile' : 'desktop'
    
    if (layoutMode === 'mobile') {
      return 'Layout: Mobile \u2192 switch to desktop'
    } else if (layoutMode === 'desktop') {
      return 'Layout: Desktop \u2192 reset to auto'
    } else {
      return `Layout: Auto (${eff}) \u2192 override`
    }
  }

  return (
    <div ref={homeViewRef} id="home-view" className="view on h-screen overflow-y-auto relative z-10 flex flex-col">
      {/* Header Bar */}
      <header className="fixed top-0 left-0 right-0 h-[52px] bg-[var(--hdr)] border-b border-[var(--rule)] px-5 flex items-center justify-between z-[100] select-none">
        <button className="font-serif font-bold text-[1.05rem] text-[var(--acc)] tracking-[0.04em] cursor-pointer hover:opacity-75">
          PMN
        </button>
        <div className="flex items-center gap-6">
          <button onClick={onStartReading} className="font-mono text-[0.72rem] text-[var(--mute)] uppercase tracking-[0.14em] hover:text-[var(--acc)] cursor-pointer">
            Mulai Membaca
          </button>
          <button onClick={onToggleTheme} className="font-mono text-[0.72rem] text-[var(--mute)] border border-[var(--rule2)] px-3 py-1 hover:text-[var(--acc)] hover:border-[var(--acc)] cursor-pointer">
            {theme === 'dark' ? '☀ LIGHT' : '☾ DARK'}
          </button>
          <button onClick={onOpenAdmin} className="font-mono text-[0.62rem] text-[var(--mute)] border border-[var(--rule)] bg-[var(--surface)] px-3 py-1.5 hover:opacity-75 cursor-pointer">
            ADMIN ↗
          </button>
        </div>
      </header>

      {/* Hero Cinematic Section */}
      <section ref={heroStageRef} id="hero-stage" className="hero-stage cover-active relative min-h-screen flex flex-col justify-center items-center text-center p-6 border-b border-[var(--rule)] overflow-hidden">
        <ParticlesBackground />
        
        <div className="hero-parallax relative z-10 max-w-[820px] w-full mx-auto mt-12">
          <div className="font-mono text-[0.7rem] bg-[var(--acc)] text-white dark:text-black inline-block px-5 py-1.5 tracking-[0.2em] uppercase mb-8">
            A Framework for Navigating Material Reality
          </div>
          <h1 className="font-serif text-[clamp(2.5rem,7vw,5rem)] font-bold uppercase leading-none tracking-tight text-[var(--ink)] mb-4 select-none">
            Progressive<br />Materialist<br />
            <em className="text-[var(--acc)] not-italic serif-italic font-normal block lowercase mt-2">naturalism</em>
          </h1>
          <p className="font-serif italic text-lg text-[var(--ink)] opacity-85 mb-8">
            By Nova Dharma &mdash; Version 117.6
          </p>
          <div className="font-serif italic text-sm text-[var(--ink2)] max-w-[520px] mx-auto border-t border-b border-[var(--acc)] py-3 px-6 mb-8 leading-relaxed">
            &ldquo;Philosophers have only interpreted the world in various ways. The point, however, is to reconstruct its material foundations.&rdquo;
          </div>

          {/* Quick Metrics */}
          <div className="grid grid-cols-3 max-w-[480px] mx-auto border border-[var(--rule)] bg-[var(--bg2)] mb-8 divide-x divide-[var(--rule)]">
            <div className="py-3 text-center">
              <span className="block font-mono text-[0.62rem] text-[var(--mute2)] uppercase tracking-widest mb-1">Parts</span>
              <span className="font-serif text-[1.1rem] text-[var(--acc)]">{data.parts.length}</span>
            </div>
            <div className="py-3 text-center">
              <span className="block font-mono text-[0.62rem] text-[var(--mute2)] uppercase tracking-widest mb-1">Sections</span>
              <span className="font-serif text-[1.1rem] text-[var(--acc)]">{totalSections}</span>
            </div>
            <div className="py-3 text-center">
              <span className="block font-mono text-[0.62rem] text-[var(--mute2)] uppercase tracking-widest mb-1">Read</span>
              <span className="font-serif text-[1.1rem] text-[var(--acc)]">{readPct}%</span>
            </div>
          </div>

          {/* CTAs */}
          <div className="max-w-[520px] mx-auto border border-[var(--ink)] dark:border-[var(--rule2)] divide-y divide-[var(--ink)] dark:divide-[var(--rule2)] bg-[#050505] shadow-xl">
            <div className="flex divide-x divide-[var(--ink)] dark:divide-[var(--rule2)]">
              <button onClick={onStartReading} className="flex-1 font-mono text-[0.72rem] font-bold text-white bg-[var(--acc)] uppercase tracking-[0.18em] py-4 cursor-pointer hover:bg-[var(--acc2)] transition-colors">
                Mulai Membaca [C]
              </button>
              {resumeSec && (
                <button onClick={onResumeReading} className="flex-1 font-mono text-[0.72rem] font-bold text-[var(--acc)] border-l border-[var(--rule2)] bg-transparent uppercase tracking-[0.18em] py-4 cursor-pointer hover:bg-[rgba(201,168,76,0.05)] transition-colors">
                  Resume: {resumeSec.id} &rarr; [R]
                </button>
              )}
            </div>
            <div className="flex divide-x divide-[var(--ink)] dark:divide-[var(--rule2)] text-center font-mono text-[0.68rem]">
              <a href="https://github.com/novadharma-hub/pmn-framework/releases/latest" target="_blank" rel="noopener noreferrer" className="flex-1 text-[var(--ink)] dark:text-[var(--ink2)] py-3 uppercase tracking-wider hover:bg-[var(--ink)] dark:hover:bg-[var(--rule2)] hover:text-white dark:hover:text-[var(--acc)] transition-colors">
                Download PDF/MD &darr;
              </a>
              <a href="pmn-agent-guide.html" className="flex-1 text-[var(--ink)] dark:text-[var(--ink2)] py-3 uppercase tracking-wider hover:bg-[var(--ink)] dark:hover:bg-[var(--rule2)] hover:text-white dark:hover:text-[var(--acc)] transition-colors">
                AI Agent Guide [A] &rarr;
              </a>
            </div>
            <div className="flex divide-x divide-[var(--ink)] dark:divide-[var(--rule2)] text-center font-mono text-[0.62rem]">
              <button onClick={onToggleLayout} className="flex-1 text-[var(--mute)] py-2.5 uppercase tracking-wider hover:bg-[var(--ink)] dark:hover:bg-[var(--rule2)] hover:text-white dark:hover:text-[var(--acc)] cursor-pointer">
                {getLayoutLabel()}
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Marquee Ticker */}
      <div className="bg-[var(--acc)] text-white dark:text-black font-mono font-bold text-[0.75rem] uppercase tracking-[0.14em] py-3 overflow-hidden border-b border-[var(--rule)] whitespace-nowrap flex select-none">
        <div className="animate-marquee inline-block">
          <span className="mr-10">MATERIAL REALITY IS PRIMARY — EMERGENT AND INTERFACE PHENOMENA REMAIN REAL</span>
          <span className="mr-10">ANTI-DOGMATIC BY DESIGN — DOCTRINE REVISABLE UNDER EVIDENCE AND FAILURE</span>
          <span className="mr-10">CONDITIONAL BIOLOGICAL CONSTRAINTS — PROBABILISTIC DETERMINISM — LAYERED ANALYSIS</span>
          <span className="mr-10">THE CUSTODIAN PROBLEM — INFORMATION ASYMMETRY AS STRUCTURAL POWER</span>
          <span className="mr-10">REDUCE STRUCTURAL SUFFERING — EXPAND GENUINE BECOMING — PMN v117.6</span>
        </div>
      </div>

      {/* Axiom Map Section (Accordion) */}
      <section className="bg-[var(--bg2)] dark:bg-[#141414] py-16 px-6 border-b border-[var(--rule)] select-none">
        <div className="max-w-[1080px] mx-auto grid grid-cols-1 md:grid-cols-[1fr_2fr] gap-8">
          <div className="border border-[#7a593c42] bg-[rgba(255,255,255,0.22)] dark:bg-[rgba(255,255,255,0.018)] p-8 shadow-[12px_12px_0_rgba(122,106,88,0.08)] dark:shadow-[10px_10px_0_rgba(0,0,0,0.28)]">
            <h2 className="font-serif text-2xl font-semibold mb-3">Axiom Structure</h2>
            <p className="font-serif text-sm text-[var(--mute)] leading-relaxed mb-6">
              PMN beroperasi pada tiga tingkatan. Axiom Tier 1 adalah pilihan desain dasar. Tier 2 adalah komitmen struktural yang hanya direvisi jika ada kegagalan arsitektur. Tier 3 adalah hipotesis empiris yang siap dikoreksi kapan saja.
            </p>
            <div className="flex flex-col gap-2 font-mono text-[0.65rem] uppercase tracking-wider">
              <div className="text-[var(--acc)]">● Tier 1 — Foundational</div>
              <div className="text-[var(--ink2)] dark:text-[#d4c4b4]">● Tier 2 — Structural</div>
              <div className="text-[var(--mute)] dark:text-[#b9aa9c]">● Tier 3 — Empirical</div>
            </div>
          </div>
          
          <div className="divide-y divide-[var(--rule)]">
            <div className="font-mono text-[0.65rem] text-[var(--acc)] uppercase tracking-wider pb-3">Tier 1 — Foundational Axioms (Titik Tolak)</div>
            <AxiomItem num="1a" title="Mind-Independent Material Reality is Primary" defaultOpen={true}>
              Realitas ada terlepas dari persepsi atau kerangka konseptual kita. Ini adalah fondasi mutlak: kerangka apa pun yang mendahulukan norma/nilai sebelum menetapkan kondisi material telah disusun di atas pasir.
            </AxiomItem>
            <AxiomItem num="1b" title="Suffering Has Negative Evaluative Valence">
              Penderitaan (suffering) biologi yang tidak perlu adalah jangkar moral non-arbitrer yang kita pilih. Kami tidak berargumen dari metafisika, melainkan dari kenyataan biologis bahwa organisme menghindari rasa sakit.
            </AxiomItem>
            <AxiomItem num="1c" title="Becoming is Evaluatively Significant">
              Pengembangan kapasitas diri melampaui kelangsungan hidup (Becoming) adalah atap evaluatif yang berpasangan dengan lantai penderitaan. Atap dan lantai ini saling mendukung.
            </AxiomItem>
            <div className="font-mono text-[0.65rem] text-[var(--ink2)] dark:text-[#d4c4b4] uppercase tracking-wider py-3 mt-4">Tier 2 — Structural Commitments (Kerangka Kerja)</div>
            <AxiomItem num="2a" title="Probabilistic Determinism">
              Struktur material membatasi dan membentuk apa saja hasil yang mungkin didapat, tetapi agen tetap memiliki ruang untuk bergerak di dalam batas-batas probabilistik tersebut.
            </AxiomItem>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="max-w-[900px] mx-auto py-8 px-6 flex justify-between flex-wrap gap-4 text-xs font-mono text-[var(--mute)] uppercase tracking-widest mt-auto">
        <span>Progressive Materialist Naturalism &mdash; Nova Dharma</span>
        <span>{new Date().getFullYear()}</span>
      </footer>
    </div>
  )
}

// Komponen Pembantu Accordion Axiom
interface AxiomItemProps {
  num: string
  title: string
  children: React.ReactNode
  defaultOpen?: boolean
}

function AxiomItem({ num, title, children, defaultOpen = false }: AxiomItemProps) {
  const [isOpen, setIsOpen] = useState(defaultOpen)
  return (
    <div className="border-b border-[var(--rule)]">
      <button onClick={() => setIsOpen(!isOpen)} className="w-full flex items-baseline gap-4 py-4 text-left cursor-pointer hover:bg-[rgba(173,52,30,0.035)] dark:hover:bg-[rgba(255,255,255,0.02)] transition-colors">
        <span className="font-mono font-bold text-[var(--acc)] text-sm">{num}</span>
        <span className="font-serif font-semibold text-[1.06rem] text-[var(--ink)] dark:text-[#e8e4db] flex-1">{title}</span>
        <span className="font-mono text-xs text-[var(--mute)] transition-transform duration-200" style={{ transform: isOpen ? 'rotate(90deg)' : 'rotate(0)' }}>›</span>
      </button>
      {isOpen && (
        <div className="pl-8 pb-4 font-serif text-sm text-[var(--ink2)] dark:text-[#c8bfb2] leading-relaxed">
          {children}
        </div>
      )}
    </div>
  )
}

// ─── ADMIN LOGIN FORM (PORTED FROM app.jsx) ───
interface AdminLoginProps {
  onLogin: () => void
  onBack: () => void
}

function AdminLogin({ onLogin, onBack }: AdminLoginProps) {
  const [user, setUser] = useState('')
  const [pass, setPass] = useState('')
  const [err, setErr] = useState('')
  const [busy, setBusy] = useState(false)
  
  const loadCreds = () => {
    try {
      const raw = localStorage.getItem('pmn-creds')
      return raw ? JSON.parse(raw) : null
    } catch { return null }
  }

  const saveCreds = (c: any) => localStorage.setItem('pmn-creds', JSON.stringify(c))
  
  const sha256 = async (text: string) => {
    const data = new TextEncoder().encode(text)
    const digest = await crypto.subtle.digest('SHA-256', data)
    return Array.from(new Uint8Array(digest))
      .map(b => b.toString(16).padStart(2, '0'))
      .join('')
  }

  const createStoredCreds = async (u: string, p: string) => {
    const salt = Array.from(crypto.getRandomValues(new Uint8Array(16)))
      .map(b => b.toString(16).padStart(2, '0')).join('')
    const hash = await sha256(`${u}\n${salt}\n${p}`)
    return { user: u, salt, passwordHash: hash, createdAt: new Date().toISOString() }
  }

  const verifyStoredCreds = async (stored: any, u: string, p: string) => {
    if (!stored) return false
    if (stored.user !== u) return false
    if (stored.passwordHash && stored.salt) {
      const candidate = await sha256(`${u}\n${stored.salt}\n${p}`)
      return candidate === stored.passwordHash
    }
    return stored.pass === p
  }

  const isSetup = !loadCreds()

  const submit = async () => {
    const cleanUser = user.trim().slice(0, 80)
    if (!cleanUser || !pass.trim()) {
      setErr('Username dan password wajib diisi.')
      return
    }
    setBusy(true)
    try {
      if (isSetup) {
        const stored = await createStoredCreds(cleanUser, pass)
        saveCreds(stored)
        sessionStorage.setItem('pmn-admin-session', JSON.stringify({ user: cleanUser, ts: Date.now() }))
        onLogin()
        return
      }

      const stored = loadCreds()
      const ok = await verifyStoredCreds(stored, cleanUser, pass)
      if (!ok) {
        setErr('Username atau password salah.')
        return
      }

      sessionStorage.setItem('pmn-admin-session', JSON.stringify({ user: cleanUser, ts: Date.now() }))
      onLogin()
    } catch (e) {
      setErr('Terjadi kesalahan sistem.')
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="max-w-[380px] mx-auto py-24 px-6 relative z-10">
      <button onClick={onBack} className="font-mono text-[0.62rem] uppercase tracking-[0.14em] text-[var(--mute)] mb-8 flex items-center gap-2 cursor-pointer hover:text-[var(--acc)]">
        ← Kembali
      </button>
      <span className="block font-mono text-[0.65rem] uppercase tracking-[0.2em] text-[var(--mute2)] mb-4">{isSetup ? 'Buat Akun Admin' : 'Login Admin'}</span>
      {isSetup && (
        <p className="font-serif text-[0.88rem] text-[var(--mute)] leading-relaxed mb-6">
          Buat username dan password admin pertama kali. Kredensial disimpan secara aman di browser lokal Anda.
        </p>
      )}
      <div className="space-y-4">
        <input 
          className="w-full bg-[#0d0d0d] border border-[var(--rule)] text-[var(--ink)] font-serif p-3 outline-none focus:border-[var(--acc)]"
          placeholder="Username" 
          value={user} 
          onChange={e => { setUser(e.target.value); setErr('') }}
          onKeyDown={e => e.key === 'Enter' && submit()}
        />
        <input 
          className="w-full bg-[#0d0d0d] border border-[var(--rule)] text-[var(--ink)] font-serif p-3 outline-none focus:border-[var(--acc)]"
          type="password"
          placeholder="Password" 
          value={pass} 
          onChange={e => { setPass(e.target.value); setErr('') }}
          onKeyDown={e => e.key === 'Enter' && submit()}
        />
        {err && (
          <p className="text-[#c0392b] font-mono text-[0.68rem]">{err}</p>
        )}
        <button 
          onClick={submit} 
          disabled={busy}
          className="w-full bg-[var(--acc)] text-white dark:text-black font-mono text-[0.72rem] font-bold uppercase py-3 tracking-widest hover:bg-[var(--acc2)] cursor-pointer disabled:opacity-50"
        >
          {busy ? 'Memproses...' : (isSetup ? 'Buat & Masuk' : 'Masuk')}
        </button>
      </div>
    </div>
  )
}
