import React, { useState, useMemo } from 'react'

interface AxiomItem {
  code: string
  tier: 1 | 2 | 3
  tierName: string
  domain: 'Epistemologi' | 'Etika & Sentience' | 'Kekuasaan & Lembaga' | 'Ekonomi & Kontestasi'
  title: string
  summary: string
  anchor: string
  defense: string
  falsification: string
}

interface AxiomStructureSectionProps {
  data: any
  onJump: (pIdx: number, sIdx: number) => void
  onStartReading: () => void
}

const AXIOMS: AxiomItem[] = [
  // TIER 1 — FOUNDATIONAL
  {
    code: '1a',
    tier: 1,
    tierName: 'Tier 1 — Foundational Axioms',
    domain: 'Epistemologi',
    title: 'MIND-INDEPENDENT MATERIAL REALITY IS PRIMARY',
    summary: 'Dunia material dan hukum-hukum fisik ada secara objektif terlepas dari persepsi atau wacana manusia. Menetapkan kondisi material adalah langkah paling awal sebelum menganalisis wacana.',
    anchor: '1.6',
    defense: 'Menolak solipsisme, idealisme metafisik, dan relativisme wacana radikal. Kesadaran dan narasi selalu membutuhkan substrat biologis dan energi fisik untuk beroperasi.',
    falsification: 'Dapat digugurkan jika dibuktikan secara empiris adanya fenomena mental sadar yang eksis secara otonom tanpa memerlukan energi atau substrat fisik.',
  },
  {
    code: '1b',
    tier: 1,
    tierName: 'Tier 1 — Foundational Axioms',
    domain: 'Etika & Sentience',
    title: 'SUFFERING HAS NEGATIVE EVALUATIVE VALENCE',
    summary: 'Penderitaan somatik pada makhluk bersaraf adalah fakta material, bukan preferensi subjektif. Kerentanan rasa sakit berfungsi sebagai jangkar moral non-arbitrer (lantai dasar).',
    anchor: '3.4',
    defense: 'Menghindari jurang nihilisme moral tanpa membutuhkan dogma pewahyuan. Semua organisme sentient secara biologis terprogram menghindari trauma somatik.',
    falsification: 'Dapat digugurkan jika ditemukan populasi sentient yang secara konsisten dan intrinsik memilih kerusakan somatik tanpa kompensasi fungsional apa pun.',
  },
  {
    code: '1c',
    tier: 1,
    tierName: 'Tier 1 — Foundational Axioms',
    domain: 'Etika & Sentience',
    title: 'GENUINE BECOMING IS EVALUATIVELY SIGNIFICANT',
    summary: 'Ekspansi kapasitas manusia untuk mencipta, memahami, dan berelasi secara otonom adalah batas atas evaluatif yang berpasangan dengan lantai pengurangan penderitaan.',
    anchor: '5.1',
    defense: 'Etika tidak boleh berhenti pada pencegahan rasa sakit semata (utilitarianisme negatif pasif); pembebasan sejati menuntut ruang penyingkapan kapasitas kreatif.',
    falsification: 'Dapat digugurkan jika ekspansi kapasitas perkembangan manusia terbukti selalu berkorelasi positif dengan peningkatan penderitaan netto yang tak terelakkan.',
  },
  {
    code: '1d',
    tier: 1,
    tierName: 'Tier 1 — Foundational Axioms',
    domain: 'Epistemologi',
    title: 'ANTI-DOGMATIC DESIGN & ZERO AUTHORITY PRIVILEGE',
    summary: 'Tidak ada doktrin, teks, gelar, atau penjaga ideologi yang kebal dari audit empiris dan revisi prosedural bila berhadapan dengan bukti kegagalan.',
    anchor: '1.4',
    defense: 'Mencegah pembekuan intelektual skolastik. Menjaga PMN tetap sebagai instrumen penyelidikan yang adaptif terhadap dinamika material zaman.',
    falsification: 'Dapat digugurkan jika dibuktikan adanya prinsip filosofis yang mampu mempertahankan kebenaran mutlak tanpa memerlukan verifikasi empiris berulang.',
  },

  // TIER 2 — STRUCTURAL COMMITMENTS
  {
    code: '2a',
    tier: 2,
    tierName: 'Tier 2 — Structural Commitments',
    domain: 'Etika & Sentience',
    title: 'CONDITIONAL BIOLOGICAL CONSTRAINTS',
    summary: 'Kognisi dan perilaku manusia beroperasi di dalam batas-batas biologis evolusioner yang nyata dan terukur, namun bersifat probabilistik, bukan fatalistis.',
    anchor: '3.2',
    defense: 'Menolak utopianisme tabula-rasa yang berasumsi manusia dapat dibentuk tanpa batas, sekaligus menolak determinisme genetik yang melegitimasi ketidakadilan.',
    falsification: 'Dapat direvisi jika ilmu saraf membuktikan perilaku sosial manusia sepenuhnya kaku ditentukan oleh program genetika tanpa elastisitas lingkungan.',
  },
  {
    code: '2b',
    tier: 2,
    tierName: 'Tier 2 — Structural Commitments',
    domain: 'Kekuasaan & Lembaga',
    title: 'NON-COLLAPSIBLE LAYERED ARCHITECTURE',
    summary: 'Penyelidikan berlangsung dalam 3 lapisan: Kondisi Material Termodinamika → Medan Kekuatan Struktural & Lembaga → Agensi Subjektif. Tidak ada tier yang boleh runtuh ke tier lain.',
    anchor: '2.4',
    defense: 'Menghindari reduksionisme fisik murni (yang gagal membaca hukum dan pranata) serta kulturalisme murni (yang melupakan batasan fisik).',
    falsification: 'Dapat direvisi jika dinamika sosiopolitik terbukti dapat diprediksi secara tuntas hanya melalui kalkulasi fisika kuantum atau kimia biologis murni.',
  },
  {
    code: '2c',
    tier: 2,
    tierName: 'Tier 2 — Structural Commitments',
    domain: 'Kekuasaan & Lembaga',
    title: 'UNIVERSAL INSTITUTIONAL CONTESTABILITY',
    summary: 'Setiap tatanan institusional yang mengklaim mewakili kepentingan bersama wajib secara struktural menyediakan instrumen audit dan jalur perlawanan damai bagi pihak yang diatur.',
    anchor: '11.2',
    defense: 'Lembaga yang menutup jalur kontestasi niscaya mengalami degradasi informasi dan berubah menjadi instrumen ekstraksi kelompok penjaga (kustodian).',
    falsification: 'Dapat direvisi jika ditemukan masyarakat tanpa mekanisme oposisi yang mampu mempertahankan keadilan dan adaptabilitas jangka panjang.',
  },
  {
    code: '2d',
    tier: 2,
    tierName: 'Tier 2 — Structural Commitments',
    domain: 'Kekuasaan & Lembaga',
    title: 'BOUNDS OF COERCIVE PROPORTIONALITY',
    summary: 'Penggunaan instrumen pemaksa hanya sah sejauh diperlukan secara proporsional untuk mengamankan lantai biologis; kelebihan paksaan bermutasi menjadi dominasi ekstraktif.',
    anchor: '7.4',
    defense: 'Mencegah normalisasi kekerasan lembaga di bawah dalih stabilitas abstrak yang mengabaikan hak hidup konstituen.',
    falsification: 'Dapat direvisi jika peningkatan represi terbukti secara konsisten memperluas kebebasan dan flourishing umum dalam jangka panjang.',
  },

  // TIER 3 — EMPIRICAL HYPOTHESES
  {
    code: '3a',
    tier: 3,
    tierName: 'Tier 3 — Empirical Hypotheses',
    domain: 'Kekuasaan & Lembaga',
    title: 'INFORMATION ASYMMETRY AS STRUCTURAL POWER',
    summary: 'Keuntungan kustodian melalui kontrol selektif atas data, arsip, dan prosedur teknis merupakan mekanisme kausal paling dominan dalam proses pembajakan institusi.',
    anchor: '7.3',
    defense: 'Berdasarkan telaah historis organisasi: tanpa transparansi radikal, informasi selalu diakumulasi di puncak hirarki untuk mempertahankan kekuasaan.',
    falsification: 'Dapat difalsifikasi jika audit data menunjukkan pembajakan institusi terjadi secara merata terlepas dari apakah sistem informasi lembaga tersebut tertutup atau terbuka.',
  },
  {
    code: '3b',
    tier: 3,
    tierName: 'Tier 3 — Empirical Hypotheses',
    domain: 'Epistemologi',
    title: 'NARRATIVE INERTIA & DISCOURSE RETARDATION',
    summary: 'Kerangka ideologis dan wacana budaya cenderung bertahan puluhan tahun setelah kondisi material yang melahirkannya telah runtuh secara fundamental.',
    anchor: '8.2',
    defense: 'Menjelaskan kepatuhan masyarakat terhadap doktrin usang yang bertentangan langsung dengan kepentingan material mereka saat ini.',
    falsification: 'Dapat difalsifikasi bila ditemukan korelasi seketika tanpa jeda waktu adaptasi antara perubahan kondisi material dan transformasi keyakinan publik.',
  },
  {
    code: '3c',
    tier: 3,
    tierName: 'Tier 3 — Empirical Hypotheses',
    domain: 'Ekonomi & Kontestasi',
    title: 'MULTIPLICATIVE TRANSFER EQUATION (T = S · D · P · G)',
    summary: 'Ekstraksi surplus struktural bekerja secara multiplikatif: jika transparansi (G) atau exit penalty (P) ditekan ke nol, potensi dominasi monopoli lumpuh.',
    anchor: '6.3',
    defense: 'Menghubungkan ekonomi politik dengan teori informasi: transparansi radikal dan kemudahan keluar mampu melumpuhkan potensi pemerasan kustodian.',
    falsification: 'Dapat difalsifikasi jika pengujian data ekonomi menunjukkan hubungan linier terpisah antar-variabel tanpa efek pengali pada ekstraksi surplus riil.',
  },
]

export default function AxiomStructureSection({ data, onJump, onStartReading }: AxiomStructureSectionProps) {
  const [tierFilter, setTierFilter] = useState<number | 0>(0)
  const [domainFilter, setDomainFilter] = useState<string>('all')
  const [searchQuery, setSearchQuery] = useState<string>('')
  const [expandedAxioms, setExpandedAxioms] = useState<Record<string, boolean>>({ '1a': true })

  const toggleAxiom = (code: string) => {
    setExpandedAxioms(prev => ({ ...prev, [code]: !prev[code] }))
  }

  const jumpToSectionId = (secId: string) => {
    if (!data) { onStartReading(); return }
    const cleanId = secId.trim()
    const lookHit = data.look?.[cleanId] || data.look?.[cleanId.replace('.', ',')]
    if (lookHit && typeof lookHit.pi === 'number') {
      onJump(lookHit.pi, lookHit.si)
      return
    }
    for (let pi = 0; pi < data.parts.length; pi++) {
      const p = data.parts[pi]
      const si = p.subs?.findIndex((s: any) => s.id === cleanId || s.id.replace(',', '.') === cleanId)
      if (si !== undefined && si >= 0) {
        onJump(pi, si)
        return
      }
    }
    onStartReading()
  }

  const filteredAxioms = useMemo(() => {
    return AXIOMS.filter(ax => {
      if (tierFilter !== 0 && ax.tier !== tierFilter) return false
      if (domainFilter !== 'all' && ax.domain !== domainFilter) return false
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase()
        return (
          ax.title.toLowerCase().includes(q) ||
          ax.summary.toLowerCase().includes(q) ||
          ax.code.toLowerCase().includes(q) ||
          ax.defense.toLowerCase().includes(q)
        )
      }
      return true
    })
  }, [tierFilter, domainFilter, searchQuery])

  const tier1Count = AXIOMS.filter(a => a.tier === 1).length
  const tier2Count = AXIOMS.filter(a => a.tier === 2).length
  const tier3Count = AXIOMS.filter(a => a.tier === 3).length

  // Group by tier for clean sectioning if no specific tier filter is active
  const groupedTiers = useMemo(() => {
    if (tierFilter !== 0) {
      return [{ tier: tierFilter, title: tierFilter === 1 ? 'Tier 1 — Foundational Axioms' : tierFilter === 2 ? 'Tier 2 — Structural Commitments' : 'Tier 3 — Empirical Hypotheses', items: filteredAxioms }]
    }
    return [
      { tier: 1, title: 'Tier 1 — Foundational Axioms', items: filteredAxioms.filter(a => a.tier === 1) },
      { tier: 2, title: 'Tier 2 — Structural Commitments', items: filteredAxioms.filter(a => a.tier === 2) },
      { tier: 3, title: 'Tier 3 — Empirical Hypotheses', items: filteredAxioms.filter(a => a.tier === 3) },
    ].filter(g => g.items.length > 0)
  }, [filteredAxioms, tierFilter])

  return (
    <div className="theses-section">
      <div className="theses-inner">

        {/* COLUMN 1: SIDEBAR LEAD CARD (Matches original layout exactly) */}
        <div className="theses-lead">
          <h2>Axiom Structure</h2>
          <p className="theses-lead-sub">
            PMN operates on three tiers. Tier 1 axioms are design choices defended by argument. Tier 2 are structural commitments. Tier 3 are empirical hypotheses (revisable).
          </p>
          <div className="theses-tier-list">
            <span 
              className="theses-tier-chip tier-1" 
              style={{cursor:'pointer', opacity: tierFilter === 0 || tierFilter === 1 ? 1 : 0.45}}
              onClick={() => setTierFilter(tierFilter === 1 ? 0 : 1)}
            >
              &#9679; Tier 1 &mdash; Foundational ({tier1Count})
            </span>
            <span 
              className="theses-tier-chip tier-2" 
              style={{cursor:'pointer', opacity: tierFilter === 0 || tierFilter === 2 ? 1 : 0.45}}
              onClick={() => setTierFilter(tierFilter === 2 ? 0 : 2)}
            >
              &#9679; Tier 2 &mdash; Structural ({tier2Count})
            </span>
            <span 
              className="theses-tier-chip tier-3" 
              style={{cursor:'pointer', opacity: tierFilter === 0 || tierFilter === 3 ? 1 : 0.45}}
              onClick={() => setTierFilter(tierFilter === 3 ? 0 : 3)}
            >
              &#9679; Tier 3 &mdash; Empirical ({tier3Count})
            </span>
          </div>
        </div>

        {/* COLUMN 2: WIDE MAIN CONTENT (Controls + Theses List) */}
        <div className="theses-main" style={{minWidth: 0, display: 'flex', flexDirection: 'column', gap: '1.25rem'}}>

          {/* CONTROLS BAR: TIER FILTER PILLS + DOMAIN SELECTOR + SEARCH */}
          <div style={{display:'flex', flexWrap:'wrap', gap:'.6rem', alignItems:'center', justifyContent:'space-between', paddingBottom:'.85rem', borderBottom:'1px solid var(--rule)'}}>
            
            {/* Quick Tier Switcher */}
            <div style={{display:'flex', flexWrap:'wrap', gap:'.35rem'}}>
              {[
                { id: 0, label: 'All Tiers' },
                { id: 1, label: 'Tier 1' },
                { id: 2, label: 'Tier 2' },
                { id: 3, label: 'Tier 3' },
              ].map(t => (
                <button
                  key={t.id}
                  onClick={() => setTierFilter(t.id)}
                  style={{
                    fontFamily:'var(--f-mono)',
                    fontSize:'.68rem',
                    letterSpacing:'.08em',
                    textTransform:'uppercase',
                    padding:'.35rem .65rem',
                    cursor:'pointer',
                    border:'1px solid var(--rule)',
                    background: tierFilter === t.id ? 'var(--acc)' : 'var(--bg2)',
                    color: tierFilter === t.id ? '#fff' : 'var(--ink)',
                    fontWeight: tierFilter === t.id ? 700 : 400,
                    transition:'all .15s ease'
                  }}
                >
                  {t.label}
                </button>
              ))}
            </div>

            {/* Domain & Search Input */}
            <div style={{display:'flex', flexWrap:'wrap', gap:'.4rem', alignItems:'center'}}>
              <select
                value={domainFilter}
                onChange={e => setDomainFilter(e.target.value)}
                style={{
                  fontFamily:'var(--f-mono)',
                  fontSize:'.68rem',
                  padding:'.35rem .6rem',
                  border:'1px solid var(--rule)',
                  background:'var(--bg2)',
                  color:'var(--ink)',
                  outline:'none'
                }}
              >
                <option value="all">All Domains</option>
                <option value="Epistemologi">Epistemologi</option>
                <option value="Etika & Sentience">Etika & Sentience</option>
                <option value="Kekuasaan & Lembaga">Kekuasaan & Lembaga</option>
                <option value="Ekonomi & Kontestasi">Ekonomi & Kontestasi</option>
              </select>

              <input
                type="search"
                placeholder="Filter axioms…"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                style={{
                  fontFamily:'var(--f-body)',
                  fontSize:'.82rem',
                  padding:'.35rem .6rem',
                  border:'1px solid var(--rule)',
                  background:'var(--bg2)',
                  color:'var(--ink)',
                  outline:'none',
                  maxWidth:'160px'
                }}
              />
            </div>
          </div>

          {/* THE AUTHENTIC THESES ACCORDION LIST */}
          <div className="theses-list" id="theses-list">
            {groupedTiers.length === 0 && (
              <div style={{textAlign:'center', padding:'2.5rem 1rem', fontFamily:'var(--f-mono)', fontSize:'.8rem', color:'var(--mute)'}}>
                No axioms found matching your filters.
              </div>
            )}

            {groupedTiers.map((group, gIdx) => (
              <React.Fragment key={group.tier}>
                {/* TIER HEADER */}
                <div className={`thesis-tier-hdr tier-${group.tier}${gIdx === 0 ? ' first' : ''}`}>
                  {group.title}
                </div>

                {/* ACCORDION ITEMS */}
                {group.items.map(ax => {
                  const isOpen = !!expandedAxioms[ax.code]
                  return (
                    <div key={ax.code} className={`thesis-item${isOpen ? ' open' : ''}`}>
                      <button 
                        className="thesis-toggle" 
                        onClick={() => toggleAxiom(ax.code)}
                      >
                        <span className="thesis-num">{ax.code}</span>
                        <span className="thesis-title">{ax.title}</span>
                        <span className="thesis-arrow">›</span>
                      </button>

                      {isOpen && (
                        <div className="thesis-body" style={{display: 'block', paddingBottom: '1.4rem'}}>
                          
                          {/* META PILLS: DOMAIN + ANCHOR */}
                          <div style={{display:'flex', gap:'.5rem', marginBottom:'.8rem', flexWrap:'wrap', alignItems:'center'}}>
                            <span style={{fontFamily:'var(--f-mono)', fontSize:'.62rem', letterSpacing:'.08em', textTransform:'uppercase', color:'var(--acc-text)', background:'var(--bg2)', border:'1px solid var(--rule)', padding:'.15rem .45rem'}}>
                              {ax.domain}
                            </span>
                            <span style={{fontFamily:'var(--f-mono)', fontSize:'.62rem', color:'var(--mute)', background:'var(--bg2)', border:'1px solid var(--rule)', padding:'.15rem .45rem'}}>
                              Canon Anchor: §{ax.anchor}
                            </span>
                          </div>

                          {/* PROPOSITION SUMMARY */}
                          <p style={{fontFamily:'var(--f-body)', fontSize:'.94rem', lineHeight:1.68, color:'var(--ink)', margin:'0 0 1rem 0'}}>
                            {ax.summary}
                          </p>

                          {/* 2-COLUMN COMPARISON: DEFENSE & FALSIFICATION */}
                          <div style={{display:'grid', gridTemplateColumns:'repeat(auto-fit, minmax(260px, 1fr))', gap:'.85rem', marginBottom:'1rem'}}>
                            <div style={{background:'var(--bg2)', border:'1px solid var(--rule)', padding:'.9rem 1rem'}}>
                              <strong style={{display:'block', fontFamily:'var(--f-mono)', fontSize:'.62rem', letterSpacing:'.1em', textTransform:'uppercase', color:'var(--acc-text)', marginBottom:'.35rem'}}>
                                Landasan Argumentatif:
                              </strong>
                              <p style={{fontFamily:'var(--f-body)', fontSize:'.86rem', lineHeight:1.6, color:'var(--ink2)', margin:0}}>
                                {ax.defense}
                              </p>
                            </div>

                            <div style={{background:'var(--bg2)', border:'1px solid var(--rule)', padding:'.9rem 1rem'}}>
                              <strong style={{display:'block', fontFamily:'var(--f-mono)', fontSize:'.62rem', letterSpacing:'.1em', textTransform:'uppercase', color:'var(--mute)', marginBottom:'.35rem'}}>
                                Standar Falsifikasi / Uji Stres:
                              </strong>
                              <p style={{fontFamily:'var(--f-body)', fontSize:'.86rem', lineHeight:1.6, color:'var(--ink2)', margin:0}}>
                                {ax.falsification}
                              </p>
                            </div>
                          </div>

                          {/* JUMP TO MANUSCRIPT BUTTON */}
                          <div style={{display:'flex', justifyContent:'flex-end'}}>
                            <button
                              onClick={() => jumpToSectionId(ax.anchor)}
                              style={{
                                background:'transparent',
                                border:'1px solid var(--rule2)',
                                color:'var(--ink)',
                                fontFamily:'var(--f-mono)',
                                fontSize:'.68rem',
                                letterSpacing:'.1em',
                                textTransform:'uppercase',
                                padding:'.4rem .8rem',
                                cursor:'pointer',
                                transition:'all .15s ease'
                              }}
                              onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--acc)'; e.currentTarget.style.color = 'var(--acc-text)' }}
                              onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--rule2)'; e.currentTarget.style.color = 'var(--ink)' }}
                            >
                              Buka Pembuktian di §{ax.anchor} &rarr;
                            </button>
                          </div>

                        </div>
                      )}
                    </div>
                  )
                })}
              </React.Fragment>
            ))}
          </div>

        </div>

      </div>
    </div>
  )
}
