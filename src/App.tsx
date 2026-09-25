import React, { useState, useEffect, useRef } from 'react'
import ParticlesBackground from './components/ParticlesBackground'
import ReaderView from './components/ReaderView'
import ContentsView from './components/ContentsView'
import KeyboardModal from './components/KeyboardModal'
import NotesModal from './components/NotesModal'
import GuideView from './components/GuideView'
import AITerminal from './components/AITerminal'
import ReadingPathsSection from './components/ReadingPathsSection'
import TheoreticalAnatomySection from './components/TheoreticalAnatomySection'
import MobileCollapse from './components/MobileCollapse'
import RulesPage, { PolicyTab } from './components/RulesPage'
import { hashToRoute, routeToHash, findSection, sectionIdAt, GuideTab } from './routing'



export default function App() {
  // Flag `?v2` DICABUT dari jalur pembaca 2026-09-17 (papan K24).
  //
  // ReaderView2 adalah strangler fig yang berhenti tumbuh: 325 baris lawan 760,
  // dan ia TIDAK punya CommandPalette, sorotan & anotasi, tooltip glosarium,
  // maupun AITerminal. Satu-satunya keunggulannya — prev/next seksi — pindah
  // ke ReaderView pada hari yang sama, sesudah Nova melaporkan ketiadaannya
  // sebagai cacat mobile.
  //
  // Selama flag ini hidup, ia adalah permukaan KEDUA yang bisa menyimpang
  // diam-diam dari yang pertama — dan penyimpangan itu persis bug yang
  // dilaporkan. Berkasnya dihapus 2026-09-24 (audit repo); sebagai rujukan
  // arsitektur - pembaca tanpa ketergantungan tata letak pada style.css - ia
  // tetap ada di riwayat git: src/components/ReaderView2.tsx.
  const ReaderComp = ReaderView
  // URL menang atas localStorage. Sebelum ini reload memulihkan view terakhir
  // dari localStorage, sehingga tautan yang dibagikan selalu membuka halaman
  // terakhir SI PENERIMA, bukan halaman yang dimaksud pengirim.
  const rutAwal = hashToRoute(window.location.hash)
  const [page, setPage] = useState<'home' | 'contents' | 'reader' | 'guide' | 'rules'>(() => {
    if (rutAwal) return rutAwal.page
    try {
      const s = localStorage.getItem('pmn-page')
      return (s === 'reader' || s === 'contents' || s === 'guide') ? s : 'home'
    } catch { return 'home' }
  })
  const [theme, setTheme] = useState<'dark' | 'light'>('dark')
  const [loading, setLoading] = useState(true)
  const [data, setData] = useState<any>(null)
  const [loadError, setLoadError] = useState<string | null>(null)
  const [readMap, setReadMap] = useState<Record<string, boolean>>({})
  const [curPos, setCurPos] = useState<[number, number]>([0, 0])
  const [searchQuery, setSearchQuery] = useState('')
  const [searchPartFilter, setSearchPartFilter] = useState('')
  const [paletteTrigger, setPaletteTrigger] = useState(0)
  const [contentsSub, setContentsSub] = useState<'map' | 'glossary' | 'search'>(() => {
    if (rutAwal) return rutAwal.contentsSub
    try {
      const s = localStorage.getItem('pmn-sub')
      return (s === 'glossary' || s === 'search') ? s : 'map'
    } catch { return 'map' }
  })
  // Mode fokus punya SATU sumber kebenaran di sini. Sebelumnya ada dua:
  // tombol global menyalakan class body.focus-mode langsung tanpa state,
  // sementara ReaderView memegang state `focusMode` sendiri yang
  // menyinkronkan class yang sama - sehingga label FOCUS/EXIT di reader
  // bisa berbohong tentang keadaan sebenarnya.
  const [focusMode, setFocusMode] = useState(false)
  useEffect(() => {
    document.body.classList.toggle('focus-mode', focusMode)
  }, [focusMode])
  // Hint "cara keluar" muncul saat fokus menyala, memudar setelah 4,5 dtk;
  // chip exit tetap tersedia selama fokus menyala (dua-duanya hasil UX pass
  // setelah laporan user: fokus tak sengaja menyala tanpa jalan keluar terlihat).
  const [focusHint, setFocusHint] = useState(false)
  useEffect(() => {
    if (!focusMode) { setFocusHint(false); return }
    setFocusHint(true)
    const t = setTimeout(() => setFocusHint(false), 4500)
    return () => clearTimeout(t)
  }, [focusMode])

  const [kbdOpen, setKbdOpen] = useState(false)
  // Di <= 960px kolom cari bertulisan 16px (lihat style.css, "Kerangka HP")
  // dan hanya ~90-120px lebar: placeholder panjang terpotong jadi "Search —".
  const [layarSempit, setLayarSempit] = useState(() => {
    try { return window.matchMedia('(max-width: 960px)').matches } catch { return false }
  })
  useEffect(() => {
    let mq: MediaQueryList
    try { mq = window.matchMedia('(max-width: 960px)') } catch { return }
    const ubah = () => setLayarSempit(mq.matches)
    mq.addEventListener('change', ubah)
    return () => mq.removeEventListener('change', ubah)
  }, [])
  const [notesOpen, setNotesOpen] = useState(false)
  // Rules & Data adalah halaman (#/rules/...), bukan jendela melayang lagi:
  // lihat catatan di RulesPage.tsx.
  const [rulesTab, setRulesTab] = useState<PolicyTab>(() => rutAwal?.rulesTab ?? 'privacy')
  // Back di halaman Rules kembali ke halaman asal di DALAM aplikasi.
  // history.back() tidak dipakai: bila halaman ini dibuka dari tautan luar,
  // itu akan membawa pembaca keluar dari situs.
  const halamanSebelumRules = useRef<'home' | 'contents' | 'reader' | 'guide'>('home')
  const openPolicy = (tab: PolicyTab = 'privacy') => {
    if (page === 'home' || page === 'contents' || page === 'reader' || page === 'guide') {
      halamanSebelumRules.current = page
    }
    setRulesTab(tab)
    setPage('rules')
  }
  const policyOpen = page === 'rules'
  // AI Guide juga bertab dengan URL sendiri (#/guide/prompts, ...). Tombol
  // "AI Guide" di navigasi selalu membuka tab pertama; tab lain dicapai
  // lewat tautan langsung atau dari dalam halaman.
  const [guideTab, setGuideTab] = useState<GuideTab>(() => rutAwal?.guideTab ?? 'start')
  // Dipanggil langsung sebagai onClick (argumennya event, diabaikan) atau
  // dengan nama tab, mis. openGuide('dev') dari Workbench di beranda.
  const openGuide = (tab?: unknown) => {
    setGuideTab(typeof tab === 'string' ? (tab as GuideTab) : 'start')
    setPage('guide')
  }
  const [contentWidth, setContentWidth] = useState<'narrow' | 'medium' | 'wide'>('wide')
  const [history, setHistory] = useState<[number, number][]>([])
  const [showTip, setShowTip] = useState<boolean>(() => {
    try { return localStorage.getItem('pmn-tip-dismissed') !== '1' } catch { return true }
  }) // persist until X (mengikuti user, not reset on reload/nav back to cover)

  // Perangkat dengan penunjuk presisi (mouse/trackpad) saja yang punya papan
  // ketik; menganjurkan Alt+K di layar sentuh adalah saran yang tak bisa
  // dijalankan. Dihitung sekali karena jenis penunjuk praktis tidak berubah
  // dalam satu sesi.
  const [hasFinePointer] = useState<boolean>(() => {
    try { return window.matchMedia('(pointer: fine)').matches } catch { return true }
  })

  // Kartu orientasi adalah milik halaman SAMPUL. Begitu pembaca menggulir
  // melewati sampul tugasnya selesai; membiarkannya melayang membuatnya
  // menimpa teks aksioma, tombol form AI terminal, statistik Release
  // Snapshot, dan teks footer di setiap posisi gulir.
  const [pastCover, setPastCover] = useState(false)
  useEffect(() => {
    if (page !== 'home' || !showTip) return
    const homeView = document.getElementById('home-view')
    if (!homeView) return
    const stage = document.getElementById('hero-stage')
    const onScroll = () => {
      const batas = Math.max((stage?.offsetHeight ?? homeView.clientHeight) * 0.6, 200)
      setPastCover(homeView.scrollTop > batas)
    }
    homeView.addEventListener('scroll', onScroll, { passive: true })
    onScroll()
    return () => homeView.removeEventListener('scroll', onScroll)
  }, [page, showTip, data])

  // A8: peredaran tepi atas wadah gulir (lihat blok RONDE 0 di style.css)
  // hanya boleh aktif SETELAH wadahnya benar-benar tergulir; kalau tidak,
  // baris teratas ikut memudar padahal tak ada apa pun yang lewat di
  // baliknya. Dipasang sebagai listener capture di document karena event
  // scroll tidak menggelembung, dan ketiga wadah ini mount/unmount
  // mengikuti view yang sedang aktif.
  useEffect(() => {
    const WADAH = ['reader-main', 'sb-list', 'toc-panel', 'glossary-panel', 'sv-body-scroll']
    const onAnyScroll = (e: Event) => {
      const el = e.target as HTMLElement
      if (!el || !el.id || !WADAH.includes(el.id)) return
      el.style.setProperty('--scrolled', el.scrollTop > 4 ? '1' : '0')
    }
    document.addEventListener('scroll', onAnyScroll, true)
    return () => document.removeEventListener('scroll', onAnyScroll, true)
  }, [])

  // ── Routing URL ────────────────────────────────────────────────────────
  // Rute seksi (#/s/1.1) baru bisa diterapkan setelah data naskah tiba,
  // karena ID seksi harus dipetakan ke posisi [part, seksi]. Sekali saja:
  // sesudah itu URL mengikuti navigasi, bukan sebaliknya.
  const rutSeksiSudahDipakai = useRef(false)
  useEffect(() => {
    if (!data?.parts?.length || rutSeksiSudahDipakai.current) return
    rutSeksiSudahDipakai.current = true
    const mentah = hashToRoute(window.location.hash)              // tanpa validasi
    const sah = hashToRoute(window.location.hash, data.parts)     // divalidasi
    if (mentah?.page !== 'reader' || !mentah.sectionId) return

    const pos = sah?.sectionId ? findSection(data.parts, sah.sectionId) : null
    if (pos) {
      setCurPos(pos)
      setPage('reader')
      return
    }
    // Tautan menunjuk seksi yang tidak ada - naskah ini disunting terus, jadi
    // tautan lama pasti akan basi. Membuka reader pada posisi default berarti
    // membawa pembaca ke bagian yang tidak pernah ia minta tanpa tanda apa
    // pun; daftar isi setidaknya jujur bahwa tujuannya tidak ditemukan.
    setPage('contents')
    setContentsSub('map')
  }, [data])

  // State -> URL. Sinkronisasi pertama memakai replaceState supaya tidak
  // menyisipkan entri riwayat palsu sebelum pengguna menavigasi apa pun
  // (termasuk saat #/reader berubah jadi #/s/<id> begitu data selesai muat).
  const sinkronPertama = useRef(true)
  useEffect(() => {
    // Jangan sentuh URL selama ID seksi belum bisa dipetakan. Tanpa penjaga
    // ini, memuat #/s/3.4c akan menulis ulang URL jadi #/reader sebelum data
    // tiba - ID-nya hilang sebelum sempat dipulihkan.
    if (page === 'reader' && !data?.parts?.length) return
    const sectionId = page === 'reader' ? sectionIdAt(data?.parts, curPos[0], curPos[1]) : null
    const hashBaru = routeToHash({ page, contentsSub, sectionId, rulesTab, guideTab })
    if (hashBaru === window.location.hash) { sinkronPertama.current = false; return }
    const url = window.location.pathname + window.location.search + hashBaru
    if (sinkronPertama.current) window.history.replaceState(null, '', url)
    else window.history.pushState(null, '', url)
    sinkronPertama.current = false
  }, [page, contentsSub, curPos, data, rulesTab, guideTab])

  // Judul tab per halaman (audit 2026-09-24: semua rute berjudul sama, jadi
  // tab, bookmark dan riwayat browser tak bisa dibedakan). Judul beranda
  // diambil dari index.html sekali, supaya SEO beranda tidak berubah.
  const judulBeranda = useRef(document.title)
  useEffect(() => {
    const GUIDE: Record<GuideTab, string> = { start: '', install: 'Install', prompts: 'Prompts', questions: 'Questions', dev: 'Developer', endpoints: 'Endpoints' }
    const RULES: Record<string, string> = { privacy: 'Privacy', terms: 'Terms & Citation', disclaimer: 'Epistemic Limits', ai: 'AI Policy' }
    let t = judulBeranda.current
    if (page === 'reader') {
      const sub = data?.parts?.[curPos[0]]?.subs?.[curPos[1]]
      if (sub?.id) t = `§${sub.id} ${sub.title || ''}`.trim() + ' — PMN'
    } else if (page === 'contents') {
      t = (contentsSub === 'glossary' ? 'Glossary' : contentsSub === 'search' ? 'Search' : 'Contents') + ' — PMN'
    } else if (page === 'guide') {
      t = (GUIDE[guideTab] ? GUIDE[guideTab] + ' · ' : '') + 'AI Guide — PMN'
    } else if (page === 'rules') {
      t = (RULES[rulesTab] ? RULES[rulesTab] + ' · ' : '') + 'Rules & Data — PMN'
    }
    document.title = t
  }, [page, contentsSub, curPos, data, guideTab, rulesTab])

  // URL -> state. Tanpa ini tombol Back browser tidak melakukan apa pun.
  useEffect(() => {
    const onPop = () => {
      const r = hashToRoute(window.location.hash, data?.parts)
      if (!r) return
      setPage(r.page)
      setContentsSub(r.contentsSub)
      if (r.page === 'rules' && r.rulesTab) setRulesTab(r.rulesTab)
      if (r.page === 'guide' && r.guideTab) setGuideTab(r.guideTab)
      if (r.page === 'reader' && r.sectionId) {
        const pos = findSection(data?.parts, r.sectionId)
        if (pos) setCurPos(pos)
      }
    }
    window.addEventListener('popstate', onPop)
    window.addEventListener('hashchange', onPop)
    return () => {
      window.removeEventListener('popstate', onPop)
      window.removeEventListener('hashchange', onPop)
    }
  }, [data])

  const [version, setVersion] = useState('')
  const [loadedCount, setLoadedCount] = useState(0)

  const toggleTheme = () => {
    const nt = theme === 'dark' ? 'light' : 'dark'
    setTheme(nt)
    document.documentElement.setAttribute('data-theme', nt)
    localStorage.setItem('pmn-theme', nt)
  }

  // Global hotkeys: Alt+K = keyboard modal, Alt+N = notes modal, Alt+/ = command palette, Alt+F = focus, Alt+T = theme, Alt+C = contents, Alt+? = glossary, Alt+R = resume; Esc exits focus
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (['INPUT', 'TEXTAREA', 'SELECT'].includes((e.target as HTMLElement)?.tagName)) return
      // Escape exits Focus Mode (modals close themselves via their own Escape handlers)
      if (e.key === 'Escape' && focusMode) { e.preventDefault(); setFocusMode(false); return }
      if (!e.altKey || e.ctrlKey || e.metaKey) return // Must press Alt, must NOT press Ctrl or Meta
      const key = e.key.toLowerCase()
      if (key === 'k') { e.preventDefault(); setKbdOpen(v => !v) }
      if (key === 'n') { e.preventDefault(); setNotesOpen(v => !v) }
      if (key === '/') { e.preventDefault(); if (page !== 'reader') setPage('reader'); setPaletteTrigger(t => t + 1) }
      if (key === 'f') { e.preventDefault(); setFocusMode(v => !v) } // global focus toggle
      if (key === 't') { e.preventDefault(); toggleTheme() }
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
  }, [page, data, curPos, theme, focusMode, toggleTheme])

  // Data loading
  useEffect(() => {
    const dataFiles = ['parts', 'gl', 'glg', 'rel', 'look', 'quotes', 'ci', 'version']
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), 15000)

    const loadFile = (name: string) =>
      fetch(`./data/${name}.json`, { signal: controller.signal })
        .then(r => r.json())
        .then((d: any) => { setLoadedCount(c => c + 1); return d })
        .catch((e: any) => {
          setLoadedCount(c => c + 1)
          if (e?.name === 'AbortError') throw e
          return null
        })

    Promise.all(dataFiles.map(loadFile))
      .then(([parts, gl, glg, rel, look, quotes, ci, verData]) => {
        clearTimeout(timeoutId)
        setData({ parts: parts || [], gl: gl || {}, glg: glg || {}, rel: rel || {}, look: look || {}, quotes: quotes || [], ci: ci || {} })
        if (verData?.version) setVersion(verData.version.replace(/^v/i, ''))
        setLoadError((parts && parts.length > 0) ? null : 'Failed to load manuscript data. Check the network path or public data files.')
        setLoading(false)
      })
      .catch((e: any) => {
        clearTimeout(timeoutId)
        setLoadError(e?.name === 'AbortError'
          ? 'Load timed out after 15s. Check network or data files.'
          : 'Error memuat data: ' + (e?.message || e))
        setLoading(false)
      })

    return () => { clearTimeout(timeoutId); controller.abort() }
  }, [])

  // Theme, local storage sync & content-width CSS variable init (all on mount)
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
    if (savedWidth) {
      setContentWidth(savedWidth)
      const val = savedWidth === 'narrow' ? '62ch' : savedWidth === 'wide' ? '92ch' : '78ch'
      document.documentElement.style.setProperty('--reader-measure', val)
    } else {
      document.documentElement.style.setProperty('--reader-measure', '78ch')
    }
    const savedHist = JSON.parse(localStorage.getItem('pmn-history') || '[]')
    setHistory(savedHist)
  }, [])

  useEffect(() => {
    try { localStorage.setItem('pmn-page', page) } catch {}
  }, [page])

  useEffect(() => {
    try { localStorage.setItem('pmn-sub', contentsSub) } catch {}
  }, [contentsSub])

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
    <div style={{display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center',minHeight:'100vh',background:'#0d0d0d',color:'#c0271a',fontFamily:"'Source Code Pro',monospace",letterSpacing:'.2em',textTransform:'uppercase',gap:'1.5rem'}}>
      <div style={{fontSize:'.75rem'}}>&gt;&gt; PMN Core</div>
      <div style={{width:'180px',height:'2px',background:'#1c1c1c',borderRadius:'1px',overflow:'hidden'}}>
        <div style={{height:'100%',background:'#c0271a',width:`${Math.round((loadedCount / 8) * 100)}%`,transition:'width .3s ease'}} />
      </div>
      <div style={{fontSize:'.5rem',color:'#3a3a3a',letterSpacing:'.3em'}}>{loadedCount}/8 FILES</div>
    </div>
  )

  if (loadError || !data) return (
    <div style={{display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center',minHeight:'100vh',background:'var(--bg)',color:'var(--ink)',padding:'1.5rem',textAlign:'center'}}>
      <div style={{fontFamily:"'Source Code Pro',monospace",color:'var(--acc-text)',fontSize:'.85rem',letterSpacing:'.2em',marginBottom:'1rem'}}>DATA LOAD FAILED</div>
      <div style={{maxWidth:'420px',marginBottom:'1.5rem'}}>{loadError || 'No manuscript data is available.'}</div>
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
            placeholder={layarSempit ? 'Search' : 'Search — e.g. 3.4b'}
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            onFocus={() => {
              if (page !== 'contents') setPage('contents');
              setContentsSub('search');
            }}
            onKeyDown={e => { if (e.key === 'Enter') handleGlobalSearchJump(); if (e.key === 'Escape') setSearchQuery('') }}
          />
          <select id="srch-part" aria-label="Limit search to one Part" value={searchPartFilter} onChange={e => setSearchPartFilter(e.target.value)}>
            <option value="">All parts</option>
            {data?.parts?.map((p: any) => <option key={p.part} value={p.part}>{p.part}</option>)}
          </select>
          <button id="srch-clr" onClick={() => { setSearchQuery(''); setSearchPartFilter('') }}>&times;</button>
        </div>
        {/* DEEP SCAN after search (rapi samping logo, not pushing srch to tengah) */}
        <button className="hbtn text-[10px] opacity-70" onClick={() => { if (page !== 'reader') setPage('reader'); setPaletteTrigger(t => t + 1) }}>JUMP ↗</button>
        <div id="hdr-r">
          <button id="focus-btn" className="focus-mode-btn" onClick={() => setFocusMode(v => !v)}>FOCUS</button>
          <button id="hb-home" className={page === 'contents' && contentsSub === 'map' ? 'on' : ''} onClick={() => { setContentsSub('map'); setPage('contents') }}>
            <span className="lbl-long">Table of Contents</span><span className="lbl-short">Contents</span>
          </button>
          <button id="hb-gl" className={page === 'contents' && contentsSub === 'glossary' ? 'on' : ''} onClick={() => { setContentsSub('glossary'); setPage('contents') }}>Glossary</button>
          <button id="hb-guide" className={page === 'guide' ? 'on' : ''} onClick={openGuide}>AI Guide</button>
          <button id="hb-policy" className={policyOpen ? 'on' : ''} onClick={() => openPolicy('privacy')}>Rules &amp; Data</button>
          <button id="theme-tog" onClick={toggleTheme}>{theme === 'dark' ? 'LIGHT' : 'DARK'}</button>
          <button id="hb-kbd" onClick={() => setKbdOpen(true)}>
            <span className="lbl-long">Keys [Alt+K]</span><span className="lbl-short">Keys</span>
          </button>
        </div>
      </header>

      {/* PAGE SHELL — height = 100vh - 52px (header height) */}
      <div className="page-shell">
        {/* Satu landmark <main> untuk semua halaman (audit axe 2026-09-24:
            Cover, Daftar Isi, Glosarium tidak punya <main> sama sekali, dan
            konten di luar landmark tak terjangkau navigasi pembaca layar).
            Karena itu halaman di dalamnya tidak memakai <main> lagi. */}
        <main id="main-content" className="views-shell" style={{flex:1, overflow:'hidden', position:'relative', minHeight:0, width:'100%'}}>

          {page === 'home' && (
            <HomeView
              data={data} readMap={readMap} resumeSec={resumeSection}
              onStartReading={() => setPage('contents')}
              onResumeReading={() => setPage('reader')}
              onOpenNotes={() => setNotesOpen(true)}
              onOpenGuide={openGuide}
              onOpenGlossary={() => { setContentsSub('glossary'); setPage('contents') }}
              onOpenPolicy={openPolicy}
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
            <ReaderComp
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
              focusMode={focusMode}
              setFocusMode={setFocusMode}
              history={history}
              version={version}
              onOpenPolicy={openPolicy}
            />
          )}

          {page === 'guide' && (
            <GuideView
              tab={guideTab}
              onTabChange={setGuideTab}
              onBackHome={() => setPage('home')}
              version={version}
            />
          )}

          {page === 'rules' && (
            <RulesPage
              tab={rulesTab}
              onTabChange={setRulesTab}
              onBack={() => setPage(halamanSebelumRules.current)}
              version={version}
            />
          )}

        </main>

        {/* BOTTOM / MOBILE NAVIGATION BAR */}
        <nav id="mob-nav" className="mob-nav" aria-label="Mobile Navigation">
          <button className={`mob-nav-btn${page === 'home' ? ' active' : ''}`} aria-current={page === 'home' ? 'page' : undefined} onClick={() => setPage('home')}>
            <NavIcon name="home" /><span className="mob-nav-lbl">Cover</span>
          </button>
          <button className={`mob-nav-btn${page === 'contents' && contentsSub === 'map' ? ' active' : ''}`} aria-current={page === 'contents' && contentsSub === 'map' ? 'page' : undefined} onClick={() => { setContentsSub('map'); setPage('contents') }}>
            <NavIcon name="map" /><span className="mob-nav-lbl">Map</span>
          </button>
          <button className={`mob-nav-btn${page === 'reader' ? ' active' : ''}`} aria-current={page === 'reader' ? 'page' : undefined} onClick={() => setPage('reader')}>
            <NavIcon name="read" /><span className="mob-nav-lbl">Read</span>
          </button>
          <button
            className={`mob-nav-btn${page === 'contents' && contentsSub === 'glossary' ? ' active' : ''}`}
            aria-current={page === 'contents' && contentsSub === 'glossary' ? 'page' : undefined}
            onClick={() => { setContentsSub('glossary'); setPage('contents') }}
          >
            <NavIcon name="glossary" /><span className="mob-nav-lbl">Glossary</span>
          </button>
          <button
            className={`mob-nav-btn${page === 'guide' ? ' active' : ''}`}
            aria-current={page === 'guide' ? 'page' : undefined}
            onClick={openGuide}
          >
            <NavIcon name="guide" /><span className="mob-nav-lbl">AI Guide</span>
          </button>
          <button
            className={`mob-nav-btn${policyOpen ? ' active' : ''}`}
            aria-current={policyOpen ? 'page' : undefined}
            onClick={() => openPolicy('privacy')}
          >
            <NavIcon name="rules" /><span className="mob-nav-lbl">Rules</span>
          </button>
          <button className="mob-nav-btn" onClick={toggleTheme} aria-label={theme === 'dark' ? 'Switch to light theme' : 'Switch to dark theme'}>
            <NavIcon name={theme === 'dark' ? 'sun' : 'moon'} />
            <span className="mob-nav-lbl">{theme === 'dark' ? 'Light' : 'Dark'}</span>
          </button>
        </nav>
      </div>

      {focusMode && (
        <>
          <div className={'focus-exit-hint' + (focusHint ? ' on' : '')} role="status">
            Focus mode — press <kbd>Esc</kbd> or <kbd>Alt+F</kbd> to exit
          </div>
          <button className="focus-exit-chip" onClick={() => setFocusMode(false)}>
            ✕&nbsp;Exit Focus
          </button>
        </>
      )}

      <KeyboardModal isOpen={kbdOpen} onClose={() => setKbdOpen(false)} />
      <NotesModal isOpen={notesOpen} onClose={() => setNotesOpen(false)} data={data} onJump={(pi: number, si: number) => { navToSection(pi, si); setPage('reader') }} />

      {/* Penataan letak kartu orientasi sengaja TIDAK inline: inline style
          mengalahkan stylesheet, sehingga media query tidak bisa menghentikan
          kartu ini melayang di atas CTA pada layar sempit. Lihat
          .hero-orientation-tip di blok RONDE 0 style.css. */}
      {page === 'home' && showTip && !pastCover && (
        <div className="hero-orientation-tip animate-in fade-in zoom-in duration-300">
          <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:'.3rem'}}>
            <div style={{fontFamily:'var(--f-mono)',fontSize:'.75rem',letterSpacing:'.2em',textTransform:'uppercase',color:'var(--acc-text)'}}>&#9679; ORIENTATION TIP</div>
            <button onClick={() => { try{localStorage.setItem('pmn-tip-dismissed','1')}catch{}; setShowTip(false) }} style={{background:'none',border:'none',color:'var(--mute)',cursor:'pointer',fontSize:'1.05rem',lineHeight:1}} title="Close tip">×</button>
          </div>
          <div style={{fontFamily:'var(--f-head)',fontSize:'.95rem',color:'var(--ink)',marginBottom:'.3rem'}}>Welcome to PMN Framework</div>
          <p style={{fontFamily:'var(--f-body)',fontSize:'.85rem',lineHeight:1.5,color:'var(--mute)',marginBottom:'.65rem'}}>
            {hasFinePointer && <>Press <kbd style={{fontFamily:'var(--f-mono)',border:'1px solid var(--rule)',padding:'.1rem .35rem'}}>Alt+K</kbd> anytime for shortcuts, or visit </>}
            {!hasFinePointer && <>Visit </>}
            the <button onClick={openGuide} style={{color:'var(--acc-text)', background:'none', border:'none', padding:0, font:'inherit', cursor:'pointer', textDecoration:'underline'}}>AI Agent Guide</button>.
          </p>
          <div style={{display:'flex',gap:'.5rem'}}>
            <button onClick={() => setPage('contents')} style={{background:'var(--acc)',color:'#fff',border:'none',fontFamily:'var(--f-mono)',fontSize:'.75rem',letterSpacing:'.12em',textTransform:'uppercase',padding:'.32rem .65rem',cursor:'pointer'}}>START READING</button>
            <button onClick={openGuide} style={{border:'1px solid var(--rule)',fontFamily:'var(--f-mono)',fontSize:'.75rem',letterSpacing:'.12em',textTransform:'uppercase',padding:'.32rem .65rem',color:'var(--ink)',background:'none',cursor:'pointer'}}>OPEN AI GUIDE</button>
          </div>
        </div>
      )}
    </>
  )
}

// ─── HomeView ─────────────────────────────────────────────────────────────────

/**
 * Ikon navigasi bawah (HP/tablet). Sampai 2026-09-24 berupa karakter teks
 * (⌂ ☰ ▶ § ⚙ ⚖ ☀) yang tiap font gambar berbeda ukuran dan ketebalannya.
 * Satu set garis 24px, warna mengikuti teks tombol.
 */
function NavIcon({ name }: { name: 'home' | 'map' | 'read' | 'glossary' | 'guide' | 'rules' | 'sun' | 'moon' }) {
  const common = {
    width: 22, height: 22, viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor',
    strokeWidth: 1.7, strokeLinecap: 'round' as const, strokeLinejoin: 'round' as const,
    'aria-hidden': true, className: 'mob-nav-ico',
  }
  switch (name) {
    case 'home':
      return <svg {...common}><path d="M3 11.5 12 4l9 7.5" /><path d="M5.5 10v10h13V10" /><path d="M10 20v-5h4v5" /></svg>
    case 'map':
      return <svg {...common}><path d="M9 6h11M9 12h11M9 18h11" /><path d="M4.5 6h.01M4.5 12h.01M4.5 18h.01" strokeWidth={2.6} /></svg>
    case 'read':
      return <svg {...common}><path d="M3 5.5h6a3 3 0 0 1 3 3V20a2.5 2.5 0 0 0-2.5-2.5H3z" /><path d="M21 5.5h-6a3 3 0 0 0-3 3V20a2.5 2.5 0 0 1 2.5-2.5H21z" /></svg>
    case 'glossary':
      return <svg {...common}><text x="12" y="18" textAnchor="middle" fontSize="19" fontFamily="Georgia, 'Times New Roman', serif" fill="currentColor" stroke="none">§</text></svg>
    case 'guide':
      return <svg {...common}><path d="M12 3.5l1.9 5.1L19 10.5l-5.1 1.9L12 17.5l-1.9-5.1L5 10.5l5.1-1.9z" /><path d="M18.5 16.5l.7 1.8 1.8.7-1.8.7-.7 1.8-.7-1.8-1.8-.7 1.8-.7z" /></svg>
    case 'rules':
      return <svg {...common}><path d="M12 4v16M7 20h10M5 7h14" /><path d="M5 7l-2.5 5.5a2.5 2.5 0 0 0 5 0z" /><path d="M19 7l-2.5 5.5a2.5 2.5 0 0 0 5 0z" /></svg>
    case 'sun':
      return <svg {...common}><circle cx="12" cy="12" r="4" /><path d="M12 2.5v2M12 19.5v2M4.6 4.6 6 6M18 18l1.4 1.4M2.5 12h2M19.5 12h2M4.6 19.4 6 18M18 6l1.4-1.4" /></svg>
    case 'moon':
      return <svg {...common}><path d="M20 14.5A8 8 0 0 1 9.5 4a8 8 0 1 0 10.5 10.5z" /></svg>
  }
}

function HomeView({ data, readMap, resumeSec, onStartReading, onResumeReading, onOpenNotes, onOpenGuide, onOpenGlossary, onOpenPolicy, onJump, showTip, setShowTip, version }: any) {
  const totalSections = data.parts.reduce((a: number, p: any) => a + (p.subs?.length || 0), 0)
  const readCount = Object.keys(readMap).length
  const readPct = totalSections > 0 ? Math.round((readCount / totalSections) * 100) : 0


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
                  Start Reading <span style={{opacity:.82, fontSize:'.75rem'}}>[Alt+C]</span>
                </button>
                {resumeSec && (
                  <button id="cta-resume" className="cta-p secondary" onClick={onResumeReading}>
                    Resume &rarr; <span style={{opacity:.82, fontSize:'.75rem'}}>[Alt+R]</span>
                  </button>
                )}
              </div>
              <div className="cta-row-s">
                <button id="cta-gl" className="cta-s" onClick={onOpenGlossary}>Key Terms <span style={{opacity:.76, fontSize:'.75rem'}}>[Alt+?]</span></button>
                <a href="https://github.com/novadharma-hub/pmn-framework/releases/latest" className="cta-s" target="_blank" rel="noopener">Download Manuscript &darr;</a>
                <button className="cta-s" onClick={onOpenGuide}>AI Guide & Endpoints [v{version}] &rarr;</button>
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

      {/* READING PATHS — dilipat di ponsel dan tablet; di atas 960px
          MobileCollapse mengembalikan anaknya apa adanya. */}
      <MobileCollapse
        judul="Reading Paths"
        ringkas="Suggested routes in, by what you came looking for"
      >
        <ReadingPathsSection
          data={data}
          readMap={readMap}
          onJump={onJump}
          onStartReading={onStartReading}
          version={version}
        />
      </MobileCollapse>

      {/* HOW THE FRAMEWORK IS BUILT: Theoretical Anatomy + Axiom Structure (tab) */}
      <MobileCollapse
        judul="How the Framework Is Built"
        ringkas="Layers, the primary formula, the capture sequence, the twelve axioms, and every Part"
      >
        <TheoreticalAnatomySection
          data={data}
          onJump={onJump}
          onStartReading={onStartReading}
          version={version}
        />
      </MobileCollapse>

      {/* HOME AI MODULE — Integrated React Terminal */}
      <div className="home-ai-section">
        <div className="home-ai-inner" style={{maxWidth:1040, margin:'0 auto'}}>
          <AITerminal parts={data.parts} gl={data.gl} activeSec={null} onOpenGuide={onOpenGuide} version={version} />
        </div>
      </div>

      {/* Reader Desk (Quick Notes + "Useful next moves") dan Release Snapshot
          dihapus 2026-09-24: angka rilis sudah ada di sampul, tautannya ada di
          sampul dan footer, dan catatan bebas (pmn-desk-notes) kini menjadi
          "General notes" di My Notes - satu tempat mencatat, data lama tetap. */}

      {/* HOME FOOTER */}
      <div className="home-footer-bar">
        <div style={{display:'flex',flexDirection:'column',gap:'.35rem'}}>
          <span>[C] 2026 Nova Dharma // PMN Collective</span>
          <span style={{opacity:.55,fontSize:'.75rem',fontWeight:400,textTransform:'none',letterSpacing:'.02em'}}>Zero cookies &bull; Zero trackers &bull; 100% Client-side sovereignty</span>
        </div>

        <div style={{display:'flex',gap:'.85rem',alignItems:'center',flexWrap:'wrap',fontSize:'.75rem'}}>
          <button onClick={() => onOpenPolicy?.('privacy')} style={{background:'none',border:'none',color:'var(--ink2)',cursor:'pointer',padding:0,font:'inherit',textTransform:'uppercase',letterSpacing:'.06em'}} className="hover:text-[var(--acc-text)] transition-colors">Privacy &amp; Data</button>
          <span style={{color:'var(--rule)'}}>•</span>
          <button onClick={() => onOpenPolicy?.('terms')} style={{background:'none',border:'none',color:'var(--ink2)',cursor:'pointer',padding:0,font:'inherit',textTransform:'uppercase',letterSpacing:'.06em'}} className="hover:text-[var(--acc-text)] transition-colors">Terms &amp; Citation</button>
          <span style={{color:'var(--rule)'}}>•</span>
          <button onClick={() => onOpenPolicy?.('disclaimer')} style={{background:'none',border:'none',color:'var(--ink2)',cursor:'pointer',padding:0,font:'inherit',textTransform:'uppercase',letterSpacing:'.06em'}} className="hover:text-[var(--acc-text)] transition-colors">Methodological Limits</button>
          <span style={{color:'var(--rule)'}}>•</span>
          <button onClick={() => onOpenPolicy?.('ai')} style={{background:'none',border:'none',color:'var(--ink2)',cursor:'pointer',padding:0,font:'inherit',textTransform:'uppercase',letterSpacing:'.06em'}} className="hover:text-[var(--acc-text)] transition-colors">AI Ethics</button>
        </div>

        <div style={{display:'flex',alignItems:'center',gap:'.5rem',flexWrap:'wrap'}}>
          <span>V{version}</span>
          <span style={{color:'var(--rule)'}}>&mdash;</span>
          <span><kbd style={{fontFamily:'var(--f-mono)',border:'1px solid var(--rule)',padding:'.1rem .4rem',fontSize:'.7rem'}}>Alt+?</kbd> Glossary</span>
          <span style={{color:'var(--rule)'}}>&mdash;</span>
          <span><kbd style={{fontFamily:'var(--f-mono)',border:'1px solid var(--rule)',padding:'.1rem .4rem',fontSize:'.7rem'}}>Alt+K</kbd> Keys</span>
        </div>
      </div>
    </div>
  )
}

