import React, { useState } from 'react'

interface ReadingPathStep {
  id: string
  label: string
  desc: string
}

interface ReadingPath {
  num: string
  title: string
  persona: string
  badge: string
  estTime: string
  summary: string
  steps: ReadingPathStep[]
  leadPart?: string
}

interface ReadingPathsSectionProps {
  data: any
  readMap: Record<string, boolean>
  onJump: (pIdx: number, sIdx: number) => void
  onStartReading: () => void
}

const READING_PATHS: ReadingPath[] = [
  {
    num: '01',
    title: 'Fondasi Epistemik & Realisme',
    persona: 'Akademisi & Peneliti Filsafat',
    badge: 'Fondasi',
    estTime: '~40 mnt · 4 Modul',
    summary: 'Mulai dari realisme ontologis, batas fisikalis, dan evaluasi penderitaan sebelum masuk ke doktrin atau aplikasi.',
    leadPart: 'I',
    steps: [
      { id: '1.1', label: '§1.1 Premis Realisme', desc: 'Realitas fisik independen terhadap kesadaran pengamat.' },
      { id: '1.6', label: '§1.6 Otoritas Epistemik', desc: 'Penolakan hak istimewa pewahyuan dan dogma skolastik.' },
      { id: '2.4', label: '§2.4 Arsitektur Berlapis', desc: 'Lapisan material, struktural, dan agensi tanpa reduksionisme sembrono.' },
      { id: '3.4', label: '§3.4 Lantai Biologis', desc: 'Kerentanan sentience dan minimisasi penderitaan struktural.' },
    ],
  },
  {
    num: '02',
    title: 'Forensik Kuasa & Anti-Pembajakan',
    persona: 'Analis Kebijakan & Pegiat Lembaga',
    badge: 'Kekuasaan',
    estTime: '~50 mnt · 4 Modul',
    summary: 'Bedah bagaimana kekuasaan mengakar, asimetri informasi dieksploitasi, dan lembaga publik dibajak menjadi alat ekstraksi.',
    leadPart: 'VI',
    steps: [
      { id: '6.2', label: '§6.2 Asimetri Modal', desc: 'Disparitas sumber daya yang menciptakan medan kuasa tak berimbang.' },
      { id: '7.1', label: '§7.1 Pengakaran Kustodian', desc: 'Bagaimana peran penjaga bermutasi menjadi kepentingan pemeliharaan posisi.' },
      { id: '7.3c-i', label: '§7.3 Siklus 5 Tahap', desc: 'Urutan baku degenerasi institusi dari mandat protektif menuju ekstraksi.' },
      { id: '8.2', label: '§8.2 Inersia Narasi', desc: 'Keterlambatan wacana dan legitimasi palsu dalam membela status-quo.' },
    ],
  },
  {
    num: '03',
    title: 'Intisari Kompresi Inti (Fast-Track)',
    persona: 'Pembaca Cepat & AI Context Brief',
    badge: 'Kompresi',
    estTime: '~25 mnt · 4 Modul',
    summary: 'Rute tercepat memahami kerangka dasar PMN secara utuh dalam hitungan menit sebelum menyelami keseluruhan naskah.',
    steps: [
      { id: '15.15', label: '§15.15 Intisari Doktrin', desc: 'Rumusan paling padat dari keseluruhan tesis dan etika materialis PMN.' },
      { id: '1.6', label: '§1.6 Jangkar Epistemik', desc: 'Standar pembuktian dan akuntabilitas akal sehat.' },
      { id: '3.4', label: '§3.4 Penderitaan Fisik', desc: 'Jangkar evaluatif yang tidak dapat dinegosiasikan.' },
      { id: '7.3', label: '§7.3 Diagnostik Lembaga', desc: 'Metode deteksi pembajakan institusional.' },
    ],
  },
  {
    num: '04',
    title: 'Etika Terapan, Agensi & Becoming',
    persona: 'Pembaca Eksistensial & Etika Praktis',
    badge: 'Etika & Agensi',
    estTime: '~45 mnt · 4 Modul',
    summary: 'Bergerak dari lantai biologis penderitaan menuju penyingkapan potensi manusia (genuine becoming) dan etika di dunia nyata.',
    leadPart: 'XVII',
    steps: [
      { id: '3.4', label: '§3.4 Sentience & Rasa Sakit', desc: 'Batas bawah moralitas: penghindaran penderitaan yang tak terelakkan.' },
      { id: '5.1', label: '§5.1 Vektor Becoming', desc: 'Flourishing dan ekspansi kapasitas perkembangan sebagai batas atas evaluatif.' },
      { id: '17.1', label: '§17.1 Etika dalam Praktik', desc: 'Dilema sejarah dan komitmen moral di tengah keterbatasan material.' },
      { id: '18.2', label: '§18.2 Ketahanan Agensi', desc: 'Menjaga integritas dan navigasi otonom di bawah tekanan struktur.' },
    ],
  },
  {
    num: '05',
    title: 'Diagnostik Situasi & Analisis Lapangan',
    persona: 'Strategis Transformasi & Reformis',
    badge: 'Diagnostik',
    estTime: '~55 mnt · 4 Modul',
    summary: 'Gunakan instrumen analitis PMN untuk mengukur besaran eksploitasi dan merumuskan intervensi taktis pada sistem nyata.',
    leadPart: 'VII',
    steps: [
      { id: '2.4', label: '§2.4 Analisis 3 Tingkat', desc: 'Memisahkan faktor material, kekuatan struktural, dan agensi individual.' },
      { id: '6.3', label: '§6.3 Formula Transfer T', desc: 'Kalkulasi pengalihan surplus melalui T = S · D · P · G.' },
      { id: '7.3', label: '§7.3 Ceklist Pembajakan', desc: 'Audit empiris tanda-tanda kerusakan integritas institusi.' },
      { id: '11.2', label: '§11.2 Rekayasa Kontestasi', desc: 'Menghadirkan jalur disensus formal yang aman dan berdaya tekan.' },
    ],
  },
  {
    num: '06',
    title: 'Doktrin Ekonomi & Kontestabilitas',
    persona: 'Ekonom Politik & Perancang Kebijakan',
    badge: 'Ekonomi',
    estTime: '~45 mnt · 4 Modul',
    summary: 'Melampaui perdebatan kepemilikan formal menuju tata kelola kontestabilitas, distribusi surplus, dan perlindungan lantai hidup.',
    leadPart: 'XI',
    steps: [
      { id: '11.1', label: '§11.1 Melampaui Kepemilikan', desc: 'Kekuasaan riil ditentukan oleh kontrol alokasi, bukan sertifikat nominal.' },
      { id: '11.3', label: '§11.3 Diagnostik Akuntabilitas', desc: 'Mekanisme audit surplus dan pembatasan akumulasi monopolistik.' },
      { id: '11.5', label: '§11.5 Jaminan Lantai Hidup', desc: 'Kebutuhan material dasar sebagai hak tak bersyarat bagi partisipasi wajar.' },
      { id: '12.1', label: '§12.1 Ekologi & Entropi', desc: 'Batas daya dukung biosfer dan termodinamika sistem ekonomi.' },
    ],
  },
]

export default function ReadingPathsSection({ data, readMap, onJump, onStartReading }: ReadingPathsSectionProps) {
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null)

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

  const handleCopySyllabus = (path: ReadingPath, idx: number) => {
    const text = [
      `# Silabus Bacaan PMN: ${path.title} (${path.badge})`,
      `Target: ${path.persona} | Estimasi: ${path.estTime}`,
      `Deskripsi: ${path.summary}`,
      '',
      '## Rute Modul Terarah:',
      ...path.steps.map((s, i) => `${i + 1}. **${s.label}**: ${s.desc} [https://novadharma-hub.github.io/pmn-framework/#/s/${encodeURIComponent(s.id)}]`),
      '',
      '---',
      'Progressive Materialist Naturalism (PMN v118.6) — https://novadharma-hub.github.io/pmn-framework/'
    ].join('\n')

    navigator.clipboard.writeText(text).then(() => {
      setCopiedIndex(idx)
      setTimeout(() => setCopiedIndex(null), 2500)
    }).catch(() => {
      window.prompt('Salin Silabus Manual:', text)
    })
  }

  const computePathProgress = (path: ReadingPath) => {
    if (!data?.look) return 0
    let completed = 0
    for (const step of path.steps) {
      const lookHit = data.look[step.id] || data.look[step.id.replace('.', ',')]
      if (lookHit && readMap[`${lookHit.pi}-${lookHit.si}`]) {
        completed++
      }
    }
    return Math.round((completed / path.steps.length) * 100)
  }

  return (
    <div className="reading-paths" style={{padding:'4rem 2rem', background:'var(--bg)', borderTop:'1px solid var(--rule)'}}>
      <div className="reading-paths-inner" style={{maxWidth:1120, margin:'0 auto'}}>
        
        {/* HEADER */}
        <div className="reading-paths-hdr" style={{display:'flex', justifyContent:'space-between', alignItems:'flex-end', flexWrap:'wrap', gap:'1.5rem', marginBottom:'2rem', borderBottom:'1px solid var(--rule)', paddingBottom:'1.5rem'}}>
          <div>
            <div style={{fontFamily:'var(--f-mono)', fontSize:'.72rem', letterSpacing:'.2em', textTransform:'uppercase', color:'var(--acc-text)', marginBottom:'.4rem'}}>
              ● ONBOARDING & JALUR TELAAH
            </div>
            <h2 style={{fontFamily:'var(--f-head)', fontSize:'clamp(1.8rem, 3.5vw, 2.4rem)', color:'var(--ink)', margin:0}}>
              Reading Paths Terarah
            </h2>
          </div>
          <p style={{fontFamily:'var(--f-body)', fontSize:'.95rem', color:'var(--ink2)', maxWidth:'520px', margin:0, lineHeight:1.6}}>
            Setiap pembaca mendekati PMN dengan pertanyaan yang berbeda. Pilih rute kurasi multi-langkah di bawah untuk navigasi fokus sesuai agenda penyelidikan Anda.
          </p>
        </div>

        {/* META STATS BAR */}
        <div className="reading-paths-meta" style={{display:'grid', gridTemplateColumns:'repeat(auto-fit, minmax(240px, 1fr))', gap:'1rem', marginBottom:'2.5rem'}}>
          <div className="reading-stat" style={{border:'1px solid var(--rule)', padding:'.8rem 1rem', background:'var(--bg2)'}}>
            <strong style={{display:'block', fontFamily:'var(--f-mono)', fontSize:'.68rem', letterSpacing:'.15em', textTransform:'uppercase', color:'var(--acc-text)', marginBottom:'.3rem'}}>Logika Jalur</strong>
            <span style={{fontFamily:'var(--f-body)', fontSize:'.85rem', color:'var(--ink)'}}>Navigasi berbasis tugas dan peran, bukan keharusan membaca linear dari nol.</span>
          </div>
          <div className="reading-stat" style={{border:'1px solid var(--rule)', padding:'.8rem 1rem', background:'var(--bg2)'}}>
            <strong style={{display:'block', fontFamily:'var(--f-mono)', fontSize:'.68rem', letterSpacing:'.15em', textTransform:'uppercase', color:'var(--acc-text)', marginBottom:'.3rem'}}>Rute Kilat 25 Menit</strong>
            <span style={{fontFamily:'var(--f-body)', fontSize:'.85rem', color:'var(--ink)'}}>Pilih Jalur 03 untuk intisari formulasi §15.15 sebelum menelaah detail arsitektur.</span>
          </div>
          <div className="reading-stat" style={{border:'1px solid var(--rule)', padding:'.8rem 1rem', background:'var(--bg2)'}}>
            <strong style={{display:'block', fontFamily:'var(--f-mono)', fontSize:'.68rem', letterSpacing:'.15em', textTransform:'uppercase', color:'var(--acc-text)', marginBottom:'.3rem'}}>Pelacakan Progres</strong>
            <span style={{fontFamily:'var(--f-body)', fontSize:'.85rem', color:'var(--ink)'}}>Indikator progres diperbarui otomatis berdasarkan modul yang Anda tandai telah dibaca.</span>
          </div>
        </div>

        {/* GRID OF PATH CARDS */}
        <div className="reading-paths-grid" style={{display:'grid', gridTemplateColumns:'repeat(auto-fit, minmax(320px, 1fr))', gap:'1.5rem'}}>
          {READING_PATHS.map((path, idx) => {
            const progress = computePathProgress(path)
            return (
              <div 
                key={path.num} 
                className="path-card" 
                data-ghost={path.num}
                style={{
                  border:'1px solid var(--rule)',
                  background:'var(--bg2)',
                  padding:'1.6rem 1.4rem',
                  display:'flex',
                  flexDirection:'column',
                  position:'relative',
                  overflow:'hidden',
                  boxShadow:'6px 6px 0 rgba(0,0,0,0.05)',
                  transition:'transform .2s ease, border-color .2s ease'
                }}
              >
                {/* TOP ROW: Kicker + Badge + Est Time */}
                <div style={{display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'.8rem', flexWrap:'wrap', gap:'.5rem'}}>
                  <span style={{fontFamily:'var(--f-mono)', fontSize:'.68rem', letterSpacing:'.16em', textTransform:'uppercase', color:'var(--acc-text)', fontWeight:700}}>
                    JALUR {path.num} · {path.badge}
                  </span>
                  <span style={{fontFamily:'var(--f-mono)', fontSize:'.65rem', color:'var(--mute)', background:'var(--bg)', border:'1px solid var(--rule)', padding:'.2rem .5rem'}}>
                    {path.estTime}
                  </span>
                </div>

                {/* TITLE & PERSONA */}
                <h3 style={{fontFamily:'var(--f-head)', fontSize:'1.22rem', color:'var(--ink)', margin:'0 0 .3rem 0', lineHeight:1.25}}>
                  {path.title}
                </h3>
                <div style={{fontFamily:'var(--f-mono)', fontSize:'.68rem', color:'var(--mute)', textTransform:'uppercase', letterSpacing:'.08em', marginBottom:'.8rem'}}>
                  Persona: {path.persona}
                </div>

                {/* SUMMARY */}
                <p style={{fontFamily:'var(--f-body)', fontSize:'.88rem', lineHeight:1.6, color:'var(--ink2)', margin:'0 0 1.2rem 0', flex:1}}>
                  {path.summary}
                </p>

                {/* STEP ROADMAP TAGS */}
                <div style={{marginBottom:'1.2rem', background:'var(--bg)', border:'1px solid var(--rule)', padding:'.8rem', borderRadius:'2px'}}>
                  <div style={{fontFamily:'var(--f-mono)', fontSize:'.62rem', letterSpacing:'.12em', textTransform:'uppercase', color:'var(--mute)', marginBottom:'.5rem', display:'flex', justifyContent:'space-between'}}>
                    <span>Urutan Langkah Modul</span>
                    <span>Progres: {progress}%</span>
                  </div>
                  
                  {/* Progress bar */}
                  <div style={{width:'100%', height:'3px', background:'var(--rule)', marginBottom:'.6rem', borderRadius:'1px', overflow:'hidden'}}>
                    <div style={{width:`${progress}%`, height:'100%', background:'var(--acc)', transition:'width .3s ease'}} />
                  </div>

                  {/* Step badges */}
                  <div style={{display:'flex', flexWrap:'wrap', gap:'.4rem'}}>
                    {path.steps.map((step, sIdx) => (
                      <button
                        key={step.id}
                        onClick={() => jumpToSectionId(step.id)}
                        title={`${step.label}: ${step.desc}`}
                        style={{
                          background:'var(--bg2)',
                          border:'1px solid var(--rule)',
                          color:'var(--ink)',
                          fontFamily:'var(--f-mono)',
                          fontSize:'.68rem',
                          padding:'.25rem .5rem',
                          cursor:'pointer',
                          display:'inline-flex',
                          alignItems:'center',
                          gap:'.3rem'
                        }}
                      >
                        <span style={{color:'var(--acc-text)', fontWeight:700}}>{sIdx + 1}.</span>
                        <span>{step.id}</span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* BOTTOM ACTIONS */}
                <div style={{display:'flex', gap:'.6rem', marginTop:'auto', paddingTop:'.8rem', borderTop:'1px solid var(--rule)'}}>
                  <button 
                    onClick={() => jumpToSectionId(path.steps[0].id)}
                    style={{
                      flex:2,
                      background:'var(--acc)',
                      color:'#fff',
                      border:'none',
                      fontFamily:'var(--f-mono)',
                      fontSize:'.72rem',
                      letterSpacing:'.12em',
                      textTransform:'uppercase',
                      padding:'.65rem .8rem',
                      cursor:'pointer',
                      fontWeight:700
                    }}
                  >
                    Mulai Langkah 1 ({path.steps[0].id}) &rarr;
                  </button>

                  <button
                    onClick={() => handleCopySyllabus(path, idx)}
                    title="Salin silabus jalur ini dalam format Markdown"
                    style={{
                      flex:1,
                      background:'transparent',
                      color:'var(--ink2)',
                      border:'1px solid var(--rule)',
                      fontFamily:'var(--f-mono)',
                      fontSize:'.68rem',
                      letterSpacing:'.08em',
                      textTransform:'uppercase',
                      padding:'.65rem .5rem',
                      cursor:'pointer'
                    }}
                  >
                    {copiedIndex === idx ? '✓ Tersalin!' : 'Silabus 📋'}
                  </button>
                </div>

              </div>
            )
          })}
        </div>

      </div>
    </div>
  )
}
