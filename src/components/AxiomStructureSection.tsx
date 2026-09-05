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
  // TIER 1
  {
    code: '1a',
    tier: 1,
    tierName: 'Tier 1 — Fondasional',
    domain: 'Epistemologi',
    title: 'REALITAS MATERIAL INDEPENDEN-PIKIRAN ADALAH BASIS PRIMER',
    summary: 'Dunia material dan hukum-hukum fisik ada secara objektif terlepas dari persepsi, bahasa, atau konstruksi sosial manusia. Menetapkan kondisi material adalah langkah paling awal sebelum menganalisis wacana.',
    anchor: '1.6',
    defense: 'Menolak solipsisme, idealisme metafisik, dan relativisme linguistik radikal. Narasi dan kesadaran selalu memerlukan substrat biologis dan energi fisik untuk dapat beroperasi.',
    falsification: 'Dapat digugurkan jika dibuktikan secara empiris adanya fenomena mental sadar yang eksis secara otonom tanpa bergantung sama sekali pada energi atau substrat fisik.',
  },
  {
    code: '1b',
    tier: 1,
    tierName: 'Tier 1 — Fondasional',
    domain: 'Etika & Sentience',
    title: 'PENDERITAAN BIOLOGIS MEMILIKI VALENSI EVALUATIF NEGATIF MUTLAK',
    summary: 'Rasa sakit dan penderitaan somatik pada makhluk bersaraf adalah fakta material, bukan preferensi subjektif. Minimisasi penderitaan struktural berfungsi sebagai jangkar moral non-arbitrer (lantai dasar).',
    anchor: '3.4',
    defense: 'Menghindari jurang nihilisme moral dan relativisme etis tanpa membutuhkan wahyu teologis. Semua organisme sentient secara biologis terprogram menghindari trauma fisik.',
    falsification: 'Dapat digugurkan jika ditemukan populasi sentient yang secara konsisten dan intrinsik memilih kerusakan somatik tanpa kompensasi neurologis atau tujuan fungsional apa pun.',
  },
  {
    code: '1c',
    tier: 1,
    tierName: 'Tier 1 — Fondasional',
    domain: 'Etika & Sentience',
    title: 'PENYINGKAPAN POTENSI (GENUINE BECOMING) MEMILIKI SIGNIFIKANSI EVALUATIF',
    summary: 'Pengembangan kapasitas manusia untuk mencipta, memahami, dan berelasi secara bermakna adalah vektor aspirasional yang melengkapi lantai penghindaran penderitaan.',
    anchor: '5.1',
    defense: 'Etika tidak boleh berhenti pada pencegahan rasa sakit semata (utilitarianisme negatif pasif); pembebasan sejati menuntut ruang penyingkapan kapasitas kreatif dan otonomi.',
    falsification: 'Dapat digugurkan jika ekspansi kapasitas perkembangan manusia terbukti selalu berkorelasi positif dengan peningkatan penderitaan netto yang tak terelakkan.',
  },
  {
    code: '1d',
    tier: 1,
    tierName: 'Tier 1 — Fondasional',
    domain: 'Epistemologi',
    title: 'ANTI-DOGMATISME DESAIN & KETIADAAN HAK ISTIMEWA OTORITAS',
    summary: 'Tidak ada doktrin, teks, gelar kehormatan, penjaga ideologi, atau konsensus historis yang kebal dari audit empiris, disensus nalar, dan revisi prosedural bila berhadapan dengan bukti kegagalan.',
    anchor: '1.4',
    defense: 'Mencegah pembekuan intelektual skolastik. Menjaga PMN tetap sebagai instrumen penyelidikan yang adaptif terhadap dinamika material zaman.',
    falsification: 'Dapat digugurkan jika dibuktikan adanya prinsip filosofis tertentu yang mampu mempertahankan kebenaran mutlak tanpa memerlukan verifikasi empiris berulang.',
  },

  // TIER 2
  {
    code: '2a',
    tier: 2,
    tierName: 'Tier 2 — Struktural',
    domain: 'Etika & Sentience',
    title: 'KENDALA BIOLOGIS BERSYARAT & PROBABILISTIK',
    summary: 'Kognisi dan perilaku manusia beroperasi di dalam batas-batas biologis evolusioner yang nyata dan dapat diukur, namun bersifat probabilistik dan plastis, bukan fatalistis.',
    anchor: '3.2',
    defense: 'Menolak utopianisme "tabula rasa" yang berasumsi manusia dapat dibentuk tanpa batas, sekaligus menolak determinisme genetik reaksioner yang melegitimasi ketidakadilan.',
    falsification: 'Dapat direvisi jika ilmu saraf dan biologi evolusioner membuktikan perilaku sosial manusia sepenuhnya ditentukan oleh program genetika kaku tanpa elastisitas lingkungan.',
  },
  {
    code: '2b',
    tier: 2,
    tierName: 'Tier 2 — Struktural',
    domain: 'Kekuasaan & Lembaga',
    title: 'ARSITEKTUR ANALITIS BERLAPIS TANPA REDUKSIONISME',
    summary: 'Penyelidikan berlangsung dalam 3 lapisan: Kondisi Material Termodinamika → Medan Kekuatan Struktural & Lembaga → Agensi Subjektif. Tidak ada lapisan yang boleh direduksi habis ke lapisan lain.',
    anchor: '2.4',
    defense: 'Menghindari reduksionisme fisik murni (yang gagal membaca fenomena institusi dan hukum) serta menghindari kulturalisme murni (yang melupakan batas material fisik).',
    falsification: 'Dapat direvisi jika dinamika sosiopolitik dan hukum terbukti dapat diprediksi secara tuntas hanya melalui kalkulasi fisika kuantum atau kimia biologis murni.',
  },
  {
    code: '2c',
    tier: 2,
    tierName: 'Tier 2 — Struktural',
    domain: 'Kekuasaan & Lembaga',
    title: 'PRINSIP KONTESTABILITAS UNIVERSAL LEMBAGA',
    summary: 'Setiap tatanan institusional yang mengklaim mewakili kepentingan bersama wajib secara struktural menyediakan instrumen verifikasi dan jalur perlawanan damai bagi pihak yang diatur.',
    anchor: '11.2',
    defense: 'Lembaga yang menutup jalur kontestasi niscaya mengalami degradasi informasi dan berubah menjadi instrumen ekstraksi kelompok penjaga (kustodian).',
    falsification: 'Dapat direvisi jika ditemukan masyarakat tanpa mekanisme oposisi atau disensus yang mampu mempertahankan keadilan dan adaptabilitas jangka panjang.',
  },
  {
    code: '2d',
    tier: 2,
    tierName: 'Tier 2 — Struktural',
    domain: 'Kekuasaan & Lembaga',
    title: 'BATASAN PROPORSI PAKSAAN & DEDIKASI PERLINDUNGAN',
    summary: 'Penggunaan instrumen pemaksa hanya sah sejauh diperlukan secara proporsional untuk mengamankan lantai biologis bersama; setiap kelebihan paksaan bermutasi menjadi dominasi ekstraktif.',
    anchor: '7.4',
    defense: 'Mencegah normalisasi kekerasan negara atau lembaga di bawah dalih keamanan atau kestabilan abstrak.',
    falsification: 'Dapat direvisi jika peningkatan intensitas represi dan monopoli kekerasan terbukti secara konsisten memperluas kebebasan dan flourishing umum dalam jangka panjang.',
  },

  // TIER 3
  {
    code: '3a',
    tier: 3,
    tierName: 'Tier 3 — Empiris',
    domain: 'Kekuasaan & Lembaga',
    title: 'ASIMETRI INFORMASI SEBAGAI PENGGERAK PRIMER PEMBAJAKAN',
    summary: 'Keuntungan kustodian (custodian advantage) melalui kontrol selektif atas data, arsip, dan prosedur teknis merupakan mekanisme kausal paling dominan dalam proses pembajakan institusi publik.',
    anchor: '7.3',
    defense: 'Berdasarkan telaah historis sosiologi organisasi: tanpa transparansi radikal, informasi selalu diakumulasi di puncak hirarki untuk mempertahankan status-quo.',
    falsification: 'Dapat difalsifikasi jika audit data menunjukkan pembajakan institusi terjadi secara merata terlepas dari apakah sistem informasi lembaga tersebut tertutup atau terbuka penuh.',
  },
  {
    code: '3b',
    tier: 3,
    tierName: 'Tier 3 — Empiris',
    domain: 'Epistemologi',
    title: 'INERSIA NARASI & KETERLAMBATAN RESPON IDEOLOGIS (NARRATIVE LAG)',
    summary: 'Kerangka ideologis dan wacana budaya cenderung bertahan puluhan tahun setelah kondisi material yang melahirkannya telah berubah atau runtuh secara fundamental.',
    anchor: '8.2',
    defense: 'Menjelaskan fenomena kepatuhan masyarakat terhadap doktrin usang yang bertentangan langsung dengan kepentingan material mereka saat ini.',
    falsification: 'Dapat difalsifikasi bila ditemukan korelasi seketika (tanpa jeda waktu adaptasi) antara perubahan kondisi ekonomi material dengan transformasi total keyakinan wacana publik.',
  },
  {
    code: '3c',
    tier: 3,
    tierName: 'Tier 3 — Empiris',
    domain: 'Ekonomi & Kontestasi',
    title: 'HUBUNGAN MULTIPLIKATIF FORMULA TRANSFER SURPLUS (T = S · D · P · G)',
    summary: 'Ekstraksi kekuasaan struktural tidak bekerja secara linier tambahan, melainkan secara multiplikatif: jika transparansi (G) mendekati nol, maka ekstraksi (T) mendekati nol kendati ada asimetri.',
    anchor: '6.3',
    defense: 'Menghubungkan ekonomi politik dengan teori informasi: transparansi radikal dan kemudahan keluar (exit) mampu melumpuhkan potensi dominasi monopoli.',
    falsification: 'Dapat difalsifikasi jika pengujian data ekonomi menunjukkan hubungan linier terpisah antar-variabel tanpa efek pengali pada tingkat ekstraksi surplus riil.',
  },
]

export default function AxiomStructureSection({ data, onJump, onStartReading }: AxiomStructureSectionProps) {
  const [tierFilter, setTierFilter] = useState<number | 0>(0)
  const [domainFilter, setDomainFilter] = useState<string>('all')
  const [searchQuery, setSearchQuery] = useState<string>('')
  const [expandedAxioms, setExpandedAxioms] = useState<Record<string, boolean>>({ '1a': true, '1b': true })

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

  return (
    <div className="theses-section" style={{padding:'4.5rem 2rem', background:'var(--bg2)', borderTop:'1px solid var(--rule)', borderBottom:'1px solid var(--rule)'}}>
      <div className="theses-inner" style={{maxWidth:1120, margin:'0 auto'}}>

        {/* HEADER */}
        <div className="theses-lead" style={{marginBottom:'2rem', borderBottom:'1px solid var(--rule)', paddingBottom:'1.5rem'}}>
          <div style={{fontFamily:'var(--f-mono)', fontSize:'.72rem', letterSpacing:'.2em', textTransform:'uppercase', color:'var(--acc-text)', marginBottom:'.4rem'}}>
            ● EPISTEMIC CANON & POSTULAT ANALITIS
          </div>
          <h2 style={{fontFamily:'var(--f-head)', fontSize:'clamp(1.8rem, 3.5vw, 2.4rem)', color:'var(--ink)', margin:'0 0 .8rem 0'}}>
            Axiom Structure & Epistemic Matrix
          </h2>
          <p className="theses-lead-sub" style={{fontFamily:'var(--f-body)', fontSize:'1rem', color:'var(--ink2)', maxWidth:'720px', lineHeight:1.65, margin:0}}>
            PMN beroperasi pada arsitektur tiga tier yang ketat: <strong style={{color:'var(--ink)'}}>Tier 1</strong> adalah fondasi filosofis yang dipertahankan dengan argumen rasional, <strong style={{color:'var(--ink)'}}>Tier 2</strong> adalah komitmen struktural operasional, dan <strong style={{color:'var(--ink)'}}>Tier 3</strong> adalah hipotesis empiris terbuka terhadap falsifikasi.
          </p>
        </div>

        {/* CONTROLS BAR: TIER FILTER + DOMAIN FILTER + SEARCH */}
        <div style={{background:'var(--bg)', border:'1px solid var(--rule)', padding:'1.2rem', marginBottom:'2rem', display:'flex', flexWrap:'wrap', gap:'1rem', alignItems:'center', justifyContent:'space-between'}}>
          
          {/* Tier Buttons */}
          <div style={{display:'flex', flexWrap:'wrap', gap:'.4rem'}}>
            {[
              { id: 0, label: 'Semua Tier (10+)' },
              { id: 1, label: 'Tier 1: Fondasional' },
              { id: 2, label: 'Tier 2: Struktural' },
              { id: 3, label: 'Tier 3: Empiris' },
            ].map(t => (
              <button
                key={t.id}
                onClick={() => setTierFilter(t.id)}
                style={{
                  fontFamily:'var(--f-mono)',
                  fontSize:'.7rem',
                  letterSpacing:'.08em',
                  textTransform:'uppercase',
                  padding:'.45rem .8rem',
                  cursor:'pointer',
                  border:'1px solid var(--rule)',
                  background: tierFilter === t.id ? 'var(--acc)' : 'var(--bg2)',
                  color: tierFilter === t.id ? '#fff' : 'var(--ink)',
                  fontWeight: tierFilter === t.id ? 700 : 400
                }}
              >
                {t.label}
              </button>
            ))}
          </div>

          {/* Domain & Search */}
          <div style={{display:'flex', flexWrap:'wrap', gap:'.6rem', alignItems:'center'}}>
            <select
              value={domainFilter}
              onChange={e => setDomainFilter(e.target.value)}
              style={{
                fontFamily:'var(--f-mono)',
                fontSize:'.72rem',
                padding:'.45rem .8rem',
                border:'1px solid var(--rule)',
                background:'var(--bg2)',
                color:'var(--ink)',
                outline:'none'
              }}
            >
              <option value="all">Semua Domain</option>
              <option value="Epistemologi">Epistemologi</option>
              <option value="Etika & Sentience">Etika & Sentience</option>
              <option value="Kekuasaan & Lembaga">Kekuasaan & Lembaga</option>
              <option value="Ekonomi & Kontestasi">Ekonomi & Kontestasi</option>
            </select>

            <input
              type="search"
              placeholder="Cari aksioma…"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              style={{
                fontFamily:'var(--f-body)',
                fontSize:'.85rem',
                padding:'.45rem .8rem',
                border:'1px solid var(--rule)',
                background:'var(--bg2)',
                color:'var(--ink)',
                outline:'none',
                minWidth:'180px'
              }}
            />
          </div>
        </div>

        {/* AXIOM LIST */}
        <div className="theses-list" id="theses-list" style={{display:'flex', flexDirection:'column', gap:'1rem'}}>
          {filteredAxioms.length === 0 && (
            <div style={{textAlign:'center', padding:'3rem', fontFamily:'var(--f-mono)', color:'var(--mute)'}}>
              Tidak ada aksioma yang cocok dengan filter.
            </div>
          )}

          {filteredAxioms.map(ax => {
            const isOpen = !!expandedAxioms[ax.code]
            return (
              <div
                key={ax.code}
                style={{
                  border:'1px solid var(--rule)',
                  background:'var(--bg)',
                  boxShadow:'4px 4px 0 rgba(0,0,0,0.03)',
                  transition:'all .15s ease'
                }}
              >
                {/* Accordion Header */}
                <button
                  onClick={() => toggleAxiom(ax.code)}
                  style={{
                    width:'100%',
                    display:'flex',
                    alignItems:'center',
                    gap:'1rem',
                    padding:'1.2rem 1.4rem',
                    textAlign:'left',
                    background:'transparent',
                    border:'none',
                    cursor:'pointer',
                    color:'var(--ink)'
                  }}
                >
                  <span style={{fontFamily:'var(--f-mono)', fontSize:'.85rem', fontWeight:700, color:'var(--acc-text)', minWidth:'32px'}}>
                    {ax.code}
                  </span>

                  <div style={{flex:1}}>
                    <div style={{display:'flex', alignItems:'center', gap:'.6rem', marginBottom:'.25rem', flexWrap:'wrap'}}>
                      <span style={{fontFamily:'var(--f-mono)', fontSize:'.62rem', letterSpacing:'.1em', textTransform:'uppercase', color:'var(--mute)', background:'var(--bg2)', border:'1px solid var(--rule)', padding:'.15rem .45rem'}}>
                        {ax.tierName}
                      </span>
                      <span style={{fontFamily:'var(--f-mono)', fontSize:'.62rem', letterSpacing:'.08em', color:'var(--acc-text)', background:'var(--bg2)', border:'1px solid var(--rule)', padding:'.15rem .45rem'}}>
                        {ax.domain}
                      </span>
                    </div>
                    <h3 style={{fontFamily:'var(--f-head)', fontSize:'1.05rem', color:'var(--ink)', margin:0, lineHeight:1.3}}>
                      {ax.title}
                    </h3>
                  </div>

                  <span style={{fontFamily:'var(--f-mono)', fontSize:'1.1rem', color:'var(--mute)', transform: isOpen ? 'rotate(90deg)' : 'none', transition:'transform .2s ease'}}>
                    ›
                  </span>
                </button>

                {/* Collapsible Body */}
                {isOpen && (
                  <div style={{padding:'0 1.4rem 1.4rem 1.4rem', borderTop:'1px solid var(--rule)', background:'var(--bg2)'}}>
                    
                    {/* Core Summary */}
                    <p style={{fontFamily:'var(--f-body)', fontSize:'.96rem', lineHeight:1.7, color:'var(--ink)', margin:'1.2rem 0', fontStyle:'italic'}}>
                      &ldquo;{ax.summary}&rdquo;
                    </p>

                    {/* 2-Column Card: Defense & Falsification */}
                    <div style={{display:'grid', gridTemplateColumns:'repeat(auto-fit, minmax(280px, 1fr))', gap:'1rem', marginBottom:'1.2rem'}}>
                      <div style={{background:'var(--bg)', border:'1px solid var(--rule)', padding:'1rem'}}>
                        <strong style={{display:'block', fontFamily:'var(--f-mono)', fontSize:'.65rem', letterSpacing:'.12em', textTransform:'uppercase', color:'var(--acc-text)', marginBottom:'.4rem'}}>
                          Landasan Argumentatif (Defensive Grounding):
                        </strong>
                        <p style={{fontFamily:'var(--f-body)', fontSize:'.88rem', lineHeight:1.6, color:'var(--ink2)', margin:0}}>
                          {ax.defense}
                        </p>
                      </div>

                      <div style={{background:'var(--bg)', border:'1px solid var(--rule)', padding:'1rem'}}>
                        <strong style={{display:'block', fontFamily:'var(--f-mono)', fontSize:'.65rem', letterSpacing:'.12em', textTransform:'uppercase', color:'var(--mute)', marginBottom:'.4rem'}}>
                          Kriteria Falsifikasi / Uji Stres (Stress-Test):
                        </strong>
                        <p style={{fontFamily:'var(--f-body)', fontSize:'.88rem', lineHeight:1.6, color:'var(--ink2)', margin:0}}>
                          {ax.falsification}
                        </p>
                      </div>
                    </div>

                    {/* Anchor button */}
                    <div style={{display:'flex', justifyContent:'flex-end'}}>
                      <button
                        onClick={() => jumpToSectionId(ax.anchor)}
                        style={{
                          background:'var(--acc)',
                          color:'#fff',
                          border:'none',
                          fontFamily:'var(--f-mono)',
                          fontSize:'.7rem',
                          letterSpacing:'.1em',
                          textTransform:'uppercase',
                          padding:'.5rem .9rem',
                          cursor:'pointer',
                          fontWeight:700
                        }}
                      >
                        Buka Pembuktian di Naskah (§{ax.anchor}) &rarr;
                      </button>
                    </div>

                  </div>
                )}
              </div>
            )
          })}
        </div>

      </div>
    </div>
  )
}
