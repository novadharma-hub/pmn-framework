import React, { useEffect, useMemo, useState } from 'react'

interface SubSection { id: string; title: string; is_intro?: boolean }
interface Part { part: string; title: string; subs: SubSection[] }

interface SidebarProps {
  parts: Part[]
  readMap: Record<string, boolean>
  curPos: [number, number]
  onSelectSection: (pIdx: number, sIdx: number) => void
  onClose: () => void
  history?: [number, number][]
}

const shortenId = (id: string) => {
  if (id === 'how-to-read-this-document') return 'HTR'
  if (id === 'intellectual-debts') return 'DEBT'
  if (id === 'bibliography') return 'BIB'
  if (id === 'preface') return 'PREF'
  if (id === 'coda') return 'CODA'
  return id
}

export default function Sidebar({ parts, readMap, curPos, onSelectSection, onClose, history = [] }: SidebarProps) {
  // Daftar ini berisi 236 seksi setinggi 9.625px dalam wadah ~665px. Tanpa
  // lipatan dan tanpa filter, menemukan satu seksi berarti menggulir buta
  // sejauh 14 layar. Bawaannya kini hanya part yang sedang dibaca yang
  // terbuka; sisanya terlipat.
  const [terbuka, setTerbuka] = useState<Set<number>>(() => new Set([curPos[0]]))
  const [filter, setFilter] = useState('')

  // Part yang sedang dibaca selalu ikut terbuka, termasuk saat pembaca
  // berpindah lewat tautan, panah, atau daftar isi.
  useEffect(() => {
    setTerbuka(prev => (prev.has(curPos[0]) ? prev : new Set(prev).add(curPos[0])))
  }, [curPos[0]])

  const kueri = filter.trim().toLowerCase()
  const sedangMemfilter = kueri.length > 0

  // Saat memfilter, lipatan diabaikan: yang cocok harus terlihat di mana pun
  // ia berada.
  const hasil = useMemo(() => {
    if (!sedangMemfilter) return null
    return parts.map((p, pIdx) => ({
      pIdx,
      cocok: p.subs
        .map((s, sIdx) => ({ s, sIdx }))
        .filter(({ s }) =>
          s.title.toLowerCase().includes(kueri) || s.id.toLowerCase().includes(kueri)
        )
    })).filter(g => g.cocok.length > 0)
  }, [parts, kueri, sedangMemfilter])

  const jumlahCocok = hasil ? hasil.reduce((a, g) => a + g.cocok.length, 0) : 0

  const toggle = (pIdx: number) => {
    setTerbuka(prev => {
      const next = new Set(prev)
      if (next.has(pIdx)) next.delete(pIdx)
      else next.add(pIdx)
      return next
    })
  }

  // Recent Activity dulu menampilkan juga dokumen yang SEDANG dibuka - ruang
  // teratas sidebar dipakai untuk memberi tahu pembaca di mana ia berada,
  // padahal itu sudah jelas dari penanda aktif.
  const riwayat = history.filter(([pi, si]) => !(pi === curPos[0] && si === curPos[1])).slice(0, 4)

  const barisSeksi = (p: Part, pIdx: number, s: SubSection, sIdx: number) => {
    const isActive = curPos[0] === pIdx && curPos[1] === sIdx
    const isRead = !!readMap[`${pIdx}-${sIdx}`]
    return (
      <button
        key={s.id}
        onClick={() => onSelectSection(pIdx, sIdx)}
        className={`sb-item ${isActive ? 'on' : ''} ${s.is_intro ? 'intro-sec' : ''}`}
      >
        {!s.is_intro && (
          <span className={`sb-iid ${isActive ? 'on' : ''} ${isRead ? 'r' : ''}`}>
            {shortenId(s.id)}
          </span>
        )}
        <span className={`sb-ilbl ${isActive ? 'on' : ''}`}>{s.title}</span>
        {isRead && <span className="toc-chk">✓</span>}
      </button>
    )
  }

  const headerPart = (p: Part, pIdx: number, isOpen: boolean) => {
    const aktif = curPos[0] === pIdx
    return (
      // Part aktif dulunya blok merah solid penuh-lebar dengan teks putih,
      // sementara yang TIDAK aktif justru mendapat garis merah di tepi kiri -
      // penanda paling berat dipakai untuk keadaan yang paling sering muncul.
      // Sekarang jauh lebih ringan: aktif ditandai tepi tebal, latar bernada
      // tipis, dan warna teks aksen; tidak aktif nyaris netral.
      <button
        type="button"
        onClick={() => toggle(pIdx)}
        aria-expanded={isOpen}
        className={`sb-plbl sb-plbl-btn flex !items-center justify-start gap-0 px-4 !pt-4 !pb-4 !h-auto !min-h-0 w-full text-left border-b border-pmn-rule font-pmn-head text-[0.85rem] font-bold uppercase tracking-tight !leading-normal ${aktif ? 'on' : ''}`}
        style={{
          color: aktif ? 'var(--acc-text)' : 'var(--ink2)',
          background: aktif
            ? 'color-mix(in srgb, var(--acc) 12%, transparent)'
            : 'color-mix(in srgb, var(--bg3) 40%, transparent)',
          borderLeft: aktif
            ? '4px solid var(--acc)'
            : '4px solid color-mix(in srgb, var(--rule2) 80%, transparent)'
        }}
      >
        <span className="sb-plbl-chev shrink-0" aria-hidden="true">{isOpen ? '▾' : '▸'}</span>
        <span className="font-pmn-mono text-[0.65rem] tracking-[0.2em] opacity-60 shrink-0 ml-2">P.{p.part}</span>
        <span className="mx-2 opacity-30 shrink-0">·</span>
        <span className="min-w-0 break-words">{p.title}</span>
      </button>
    )
  }

  return (
    <div id="sidebar" className="select-none flex flex-col h-full overflow-hidden border-r border-pmn-rule bg-pmn-bg2 shrink-0" style={{width: '380px'}}>
      <div className="flex items-center justify-between p-4 border-b border-pmn-rule bg-pmn-bg3/20 sm:hidden">
        <span className="font-mono text-[0.7rem] uppercase tracking-widest text-pmn-ink font-bold">Manuscript Modules</span>
        <button
          onClick={onClose}
          className="font-mono text-[0.8rem] text-pmn-mute hover:text-pmn-acc transition-colors p-1"
          aria-label="Close sections"
        >
          ✕
        </button>
      </div>
      <button id="sb-tog" onClick={onClose}>&#8249;</button>

      {/* Filter: 236 seksi tanpa cara mencari berarti menggulir buta. */}
      <div className="sb-filter-wrap flex-none px-4 py-3 border-b border-pmn-rule">
        <input
          id="sb-filter"
          type="search"
          value={filter}
          onChange={e => setFilter(e.target.value)}
          placeholder="Filter sections…"
          aria-label="Filter sections"
          className="w-full bg-pmn-bg border border-pmn-rule px-3 py-2 font-mono text-[0.72rem] text-pmn-ink placeholder:text-pmn-mute3 rounded-xs outline-none focus:border-pmn-acc"
        />
        {sedangMemfilter && (
          <div className="mt-2 font-mono text-[0.62rem] uppercase tracking-widest text-pmn-mute">
            {jumlahCocok} match{jumlahCocok === 1 ? '' : 'es'}
          </div>
        )}
      </div>

      {riwayat.length > 0 && !sedangMemfilter && (
        <div id="sb-hist" className="sb-hist flex-none border-b border-pmn-rule bg-pmn-bg3/20">
          <div className="sb-hist-lbl py-3 px-4 font-mono text-[0.65rem] uppercase tracking-widest font-bold" style={{color:'var(--acc-text)'}}>Recent Activity</div>
          <div id="sb-hist-list" className="flex flex-col gap-1 pb-3">
            {riwayat.map(([pi, si], i) => {
              const p = parts[pi]; const s = p?.subs[si]
              if (!p || !s) return null
              return (
                <button
                  key={`${pi}-${si}-${i}`}
                  onClick={() => onSelectSection(pi, si)}
                  className="sb-hist-item hover:bg-pmn-bg group"
                >
                  <span className="sb-hist-sid group-hover:text-pmn-acc">{shortenId(s.id)}</span>
                  <span className="sb-hist-title">{s.title}</span>
                </button>
              )
            })}
          </div>
        </div>
      )}

      {/* Sidebar Tools: Font Controls */}
      <div className="sb-tools desktop-only flex-none py-3 px-4 border-b border-pmn-rule">
        <span className="sb-tools-lbl">Sidebar size</span>
        <div className="font-controls" role="group" aria-label="Sidebar text size">
          <button className="font-btn hover:bg-pmn-bg" type="button" onClick={() => { const v = 0.9; document.documentElement.style.setProperty('--sidebar-scale', String(v)); localStorage.setItem('pmn-sidebar-scale', String(v)); }}>A-</button>
          <button className="font-btn hover:bg-pmn-bg font-bold" type="button" onClick={() => { document.documentElement.style.setProperty('--sidebar-scale', '1'); localStorage.setItem('pmn-sidebar-scale', '1'); }}>A</button>
          <button className="font-btn hover:bg-pmn-bg" type="button" onClick={() => { const v = 1.1; document.documentElement.style.setProperty('--sidebar-scale', String(v)); localStorage.setItem('pmn-sidebar-scale', String(v)); }}>A+</button>
        </div>
      </div>

      {/* Main Navigation List */}
      <div id="sb-list" className="flex-1 overflow-y-auto custom-scrollbar pb-8">
        {sedangMemfilter ? (
          jumlahCocok === 0 ? (
            <div className="px-4 py-6 font-mono text-[0.7rem] text-pmn-mute">
              No sections match.
            </div>
          ) : (
            hasil!.map(({ pIdx, cocok }) => {
              const p = parts[pIdx]
              return (
                <div key={p.part} className="sb-group flex flex-col">
                  {headerPart(p, pIdx, true)}
                  <div className="sb-subs flex flex-col border-b border-pmn-rule">
                    {cocok.map(({ s, sIdx }) => barisSeksi(p, pIdx, s, sIdx))}
                  </div>
                </div>
              )
            })
          )
        ) : (
          parts.map((p, pIdx) => {
            const isOpen = terbuka.has(pIdx)
            return (
              <div key={p.part} className="sb-group flex flex-col">
                {headerPart(p, pIdx, isOpen)}
                {isOpen && (
                  <div className="sb-subs flex flex-col border-b border-pmn-rule">
                    {p.subs.map((s, sIdx) => barisSeksi(p, pIdx, s, sIdx))}
                  </div>
                )}
              </div>
            )
          })
        )}
      </div>
    </div>
  )
}
