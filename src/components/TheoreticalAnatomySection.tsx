import React, { useState } from 'react'

interface TheoreticalAnatomySectionProps {
  data: any
  onJump: (pIdx: number, sIdx: number) => void
  onStartReading: () => void
}

type AnatomyMode = 'layers' | 'formula' | 'capture' | 'parts'

export default function TheoreticalAnatomySection({ data, onJump, onStartReading }: TheoreticalAnatomySectionProps) {
  const [activeMode, setActiveMode] = useState<AnatomyMode>('layers')
  const [selectedLayer, setSelectedLayer] = useState<number>(0)
  const [selectedVar, setSelectedVar] = useState<'S' | 'D' | 'P' | 'G'>('S')
  const [selectedStage, setSelectedStage] = useState<number>(0)
  const [selectedPartIndex, setSelectedPartIndex] = useState<number>(0)

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

  // Filter roman numeral parts for part browser
  const romanToVal = (r: string): number => {
    const map: Record<string, number> = { i: 1, v: 5, x: 10, l: 50, c: 100, d: 500, m: 1000 }
    let val = 0, prev = 0
    const s = r.toLowerCase()
    for (let i = s.length - 1; i >= 0; i--) {
      const curr = map[s[i]] || 0
      if (curr < prev) val -= curr
      else val += curr
      prev = curr
    }
    return val
  }

  const anatParts = [...(data?.parts || [])]
    .filter((p: any) => /^[IVXLCDM]+$/i.test(p.part))
    .sort((a: any, b: any) => romanToVal(a.part) - romanToVal(b.part))

  const currentPart = anatParts[selectedPartIndex] || null

  // 1. DATA: 3 Layers
  const LAYERS = [
    {
      id: 1,
      title: 'Lantai Material & Kendala Biologis',
      scope: 'Part I s/d Part IV',
      anchorSec: '3.4',
      badge: 'Bawah / Pondasi',
      principle: 'Realitas fisik independen terhadap pikiran. Penderitaan biologis adalah fakta material tak terbantahkan yang harus dihindari sistem bersaraf.',
      mechanics: [
        'Hukum termodinamika dan batas ketersediaan energi biosfer.',
        'Kerentanan somatik: rasa sakit, kelaparan, dan kematian sebagai jangkar nilai non-arbitrer.',
        'Menolak idealisme radikal: kondisi material selalu mendahului dan membatasi kesadaran.',
      ],
      keySections: [
        { id: '1.1', title: 'Realisme Ontologis' },
        { id: '1.6', title: 'Otoritas Epistemik' },
        { id: '2.4', title: 'Non-Reduksionisme Berlapis' },
        { id: '3.4', title: 'Lantai Biologis Penderitaan' },
      ],
    },
    {
      id: 2,
      title: 'Medan Kuasa & Struktur Lembaga',
      scope: 'Part VI s/d Part XII',
      anchorSec: '7.3c-i',
      badge: 'Tengah / Arsitektur',
      principle: 'Lembaga yang dibentuk untuk proteksi secara sistematis bermutasi menjadi aparat ekstraksi akibat asimetri informasi dan pengakaran kustodian.',
      mechanics: [
        'Kekuatan struktural beroperasi melampaui kehendak moral individu penjabat.',
        'Formula transfer surplus eksploitatif: T = S · D · P · G.',
        'Inersia narasi dan legitimasi ideologis yang membenarkan kepatuhan konstituen.',
      ],
      keySections: [
        { id: '6.2', title: 'Asimetri Sumber Daya' },
        { id: '7.1', title: 'Dilema Kustodian' },
        { id: '7.3c-i', title: 'Siklus Pembajakan 5 Tahap' },
        { id: '11.2', title: 'Desain Kontestabilitas Universal' },
      ],
    },
    {
      id: 3,
      title: 'Vektor Becoming & Agensi Subjektif',
      scope: 'Part V, XVII s/d XXI',
      anchorSec: '5.1',
      badge: 'Atas / Horizon',
      principle: 'Penyingkapan potensi manusia (genuine becoming) adalah vektor evaluatif tertinggi yang hanya mungkin terwujud jika lantai penderitaan diamankan.',
      mechanics: [
        'Menolak fatalisme deterministik: individu memiliki agensi navigasi dalam batas struktur.',
        'Etika praksis materialis: komitmen meminimalkan penderitaan pihak lain yang rentan.',
        'Rekonstruksi institusional melalui pembangkangan terkoordinasi dan desain tandingan.',
      ],
      keySections: [
        { id: '5.1', title: 'Evaluasi Genuine Becoming' },
        { id: '17.1', title: 'Etika dalam Situasi Sejarah' },
        { id: '18.2', title: 'Integritas Agensi Otonom' },
        { id: '20.1', title: 'Prospek Transformasi Sistemik' },
      ],
    },
  ]

  // 2. DATA: Transfer Formula Variables
  const FORMULA_VARS = {
    S: {
      symbol: 'S',
      name: 'Asimetri Skala / Kapasitas',
      anchor: '6.2',
      def: 'Tingkat disparitas modal, teknologi, dan kapasitas organisasi antara pihak penjaga (kustodian) dan konstituen publik.',
      fieldTest: 'Apakah konstituen memiliki sumber daya setara untuk memverifikasi atau melawan keputusan kustodian?',
      counterMeasure: 'Desentralisasi kapasitas audit, federasi serikat independen, dan transparansi repositori publik terbuka.',
    },
    D: {
      symbol: 'D',
      name: 'Durasi Waktu Pengakaran',
      anchor: '7.1',
      def: 'Panjang masa jabatan tanpa rotasi yang memungkinkan pembentukan jaringan patronase dan kristalisasi kepentingan internal.',
      fieldTest: 'Sudah berapa lama kelompok pengendali menduduki simpul keputusan tanpa audit independen?',
      counterMeasure: 'Pembatasan masa mandat, rotasi acak berimbang, dan kewajiban audit berkala oleh dewan luar.',
    },
    P: {
      symbol: 'P',
      name: 'Exit Penalty (Biaya Pembangkangan)',
      anchor: '6.4',
      def: 'Kerugian material, legal, atau sosial yang harus ditanggung seseorang jika memutuskan keluar dari sistem atau membangkang.',
      fieldTest: 'Jika seorang anggota menolak instruksi tidak adil, apakah ia kehilangan akses kebutuhan dasar hidupnya?',
      counterMeasure: 'Jaminan lantai hidup dasar (§11.5) yang independen dari loyalitas organisasi, hak keluar aman tanpa sanksi pidana.',
    },
    G: {
      symbol: 'G',
      name: 'Governance Opacity (Kepekatan Akses)',
      anchor: '7.3',
      def: 'Tingkat kerahasiaan prosedural, kompleksitas birokrasi, dan monopoli informasi yang dikuasai lingkaran dalam kustodian.',
      fieldTest: 'Seberapa sulit warga biasa membaca aliran dana dan risalah rapat penetapan kebijakan?',
      counterMeasure: 'Keterbukaan data radikal, format dokumen publik yang dapat diaudit mesin, dan perlindungan pelapor pelanggaran (whistleblower).',
    },
  }

  // 3. DATA: 5 Capture Stages
  const CAPTURE_STAGES = [
    {
      num: '01',
      title: 'Mandat Protektif Mula-Mula',
      anchor: '7.3',
      subtitle: 'Pembentukan Organisasi untuk Kebutuhan Bersama',
      symptoms: 'Fokus pada perlindungan warga dari bahaya bersama (krisis, kelaparan, ketertiban). Hubungan kustodian-konstituen bersifat fungsional dan dipercaya.',
      indicators: 'Legitimasi tinggi, struktur ramping, komunikasi langsung, kepatuhan sukarela berbasis manfaat nyata.',
      remedy: 'Kuncikan klausul sunset, protokol kontestabilitas (§11.2), dan kewajiban transparansi sejak hari pertama pendirian.',
    },
    {
      num: '02',
      title: 'Pengakaran Kelompok Kustodian',
      anchor: '7.3',
      subtitle: 'Spesialisasi Birokrasi & Kepentingan Eksklusif',
      symptoms: 'Pengurus lembaga mulai memisahkan diri menjadi kasta profesional. Kelangsungan hidup lembaga mulai diprioritaskan di atas mandat aslinya.',
      indicators: 'Peningkatan tunjangan eksklusif pengurus, alokasi anggaran lebih besar untuk citra kelembagaan dibanding pelayanan langsung.',
      remedy: 'Penegakan rotasi kepemimpinan wajib dan pembentukan dewan pengawas dari pihak eksternal yang dipilih acak.',
    },
    {
      num: '03',
      title: 'Akumulasi Asimetri Informasi',
      anchor: '7.3',
      subtitle: 'Monopoli Arsip, Kerahasiaan & Regulasi Rumit',
      symptoms: 'Kustodian mengklaim bahwa urusan lembaga "terlalu rumit dan sensitif" untuk dipahami publik. Laporan kinerja dipoles secara selektif.',
      indicators: 'Akses audit ditutup dengan dalih kerahasiaan dinas; kritik dipinggirkan sebagai ketidaktahuan teknis.',
      remedy: 'Penerapan prinsip keterbukaan data radikal: seluruh risalah dan audit keuangan wajib dipublikasikan ke domain publik.',
    },
    {
      num: '04',
      title: 'Normalisasi Ekstraksi & Pertahanan Ideologi',
      anchor: '7.3c-i',
      subtitle: 'Surplus Publik Dialihkan untuk Pemeliharaan Kekuasaan',
      symptoms: 'Eksploitasi dan penarikan surplus dijustifikasi sebagai "biaya pengorbanan demi stabilitas". Narasi moral dipakai untuk memadamkan protes.',
      indicators: 'Kriminalisasi pengkritik, stigmatisasi oposisi sebagai ancaman keamanan bersama, pengabadian retorika darurat.',
      remedy: 'Pembangunan jalur pembangkangan sipil terorganisir, boikot kepatuhan selektif, dan pembentukan lembaga tandingan independen.',
    },
    {
      num: '05',
      title: 'Rigiditas Sistemik & Pembajakan Paripurna',
      anchor: '7.3c-i',
      subtitle: 'Institusi Berbalik Menyerang Konstituen yang Dilindunginya',
      symptoms: 'Lembaga sepenuhnya menjadi instrumen pemaksa demi keuntungan faksi internal. Lembaga tidak lagi mampu mengoreksi diri sendiri tanpa guncangan luar.',
      indicators: 'Keruntuhan fungsional, kepatuhan hanya dipertahankan lewat ancaman kekerasan fisik/ekonomi, pelarian massal konstituen.',
      remedy: 'Dekonstruksi radikal dan delegitimasi menyeluruh; rekonstruksi material tandingan dari bawah berdasarkan konsensus baru.',
    },
  ]

  return (
    <div className="anatomy-section" style={{padding:'4.5rem 2rem', background:'var(--bg2)', borderTop:'1px solid var(--rule)'}}>
      <div className="anatomy-section-inner" style={{maxWidth:1120, margin:'0 auto'}}>

        {/* HEADER */}
        <div className="anatomy-section-hdr" style={{display:'flex', justifyContent:'space-between', alignItems:'flex-end', flexWrap:'wrap', gap:'1.5rem', marginBottom:'2rem', borderBottom:'1px solid var(--rule)', paddingBottom:'1.5rem'}}>
          <div>
            <div style={{fontFamily:'var(--f-mono)', fontSize:'.72rem', letterSpacing:'.2em', textTransform:'uppercase', color:'var(--acc-text)', marginBottom:'.4rem'}}>
              ● MEKANIKA STRUKTURAL PMN
            </div>
            <h2 style={{fontFamily:'var(--f-head)', fontSize:'clamp(1.8rem, 3.5vw, 2.4rem)', color:'var(--ink)', margin:0}}>
              Theoretical Anatomy & Causal Engine
            </h2>
          </div>
          <div style={{fontFamily:'var(--f-mono)', fontSize:'.72rem', color:'var(--mute)', background:'var(--bg)', border:'1px solid var(--rule)', padding:'.4rem .8rem', textTransform:'uppercase', letterSpacing:'.1em'}}>
            Engine Status: Terverifikasi v118.6
          </div>
        </div>

        {/* MODE SELECTOR TABS */}
        <div style={{display:'flex', flexWrap:'wrap', gap:'.5rem', marginBottom:'2rem'}}>
          {[
            { id: 'layers', label: '1. Arsitektur 3 Lapisan' },
            { id: 'formula', label: '2. Formula Transfer Kuasa (T=S·D·P·G)' },
            { id: 'capture', label: '3. Siklus 5 Tahap Pembajakan (§7.3)' },
            { id: 'parts', label: '4. Direktori Modul Part I–XXI' },
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveMode(tab.id as AnatomyMode)}
              style={{
                fontFamily:'var(--f-mono)',
                fontSize:'.74rem',
                letterSpacing:'.1em',
                textTransform:'uppercase',
                padding:'.65rem 1.1rem',
                cursor:'pointer',
                border:'1px solid var(--rule)',
                background: activeMode === tab.id ? 'var(--acc)' : 'var(--bg)',
                color: activeMode === tab.id ? '#fff' : 'var(--ink)',
                fontWeight: activeMode === tab.id ? 700 : 400,
                transition:'all .15s ease'
              }}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* ================================================================
            PANEL 1: 3-LAYER ANALYTICAL STACK
           ================================================================ */}
        {activeMode === 'layers' && (
          <div style={{background:'var(--bg)', border:'1px solid var(--rule)', padding:'2rem', boxShadow:'8px 8px 0 rgba(0,0,0,0.05)'}}>
            <div style={{display:'grid', gridTemplateColumns:'repeat(auto-fit, minmax(260px, 1fr))', gap:'1.5rem', marginBottom:'2rem'}}>
              {LAYERS.map((layer, idx) => (
                <div
                  key={layer.id}
                  onClick={() => setSelectedLayer(idx)}
                  style={{
                    border: selectedLayer === idx ? '2px solid var(--acc)' : '1px solid var(--rule)',
                    background: selectedLayer === idx ? 'var(--bg2)' : 'var(--bg)',
                    padding:'1.4rem',
                    cursor:'pointer',
                    position:'relative',
                    transition:'all .15s ease'
                  }}
                >
                  <div style={{display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'.6rem'}}>
                    <span style={{fontFamily:'var(--f-mono)', fontSize:'.68rem', fontWeight:700, color:'var(--acc-text)'}}>
                      LAPISAN {layer.id}
                    </span>
                    <span style={{fontFamily:'var(--f-mono)', fontSize:'.62rem', color:'var(--mute)', background:'var(--bg)', border:'1px solid var(--rule)', padding:'.15rem .4rem'}}>
                      {layer.badge}
                    </span>
                  </div>
                  <h4 style={{fontFamily:'var(--f-head)', fontSize:'1.12rem', color:'var(--ink)', margin:'0 0 .4rem 0'}}>
                    {layer.title}
                  </h4>
                  <div style={{fontFamily:'var(--f-mono)', fontSize:'.68rem', color:'var(--mute)', textTransform:'uppercase'}}>
                    Cakupan: {layer.scope}
                  </div>
                </div>
              ))}
            </div>

            {/* Selected Layer Detail */}
            {LAYERS[selectedLayer] && (
              <div style={{borderTop:'1px solid var(--rule)', paddingTop:'1.8rem'}}>
                <div style={{display:'flex', justifyContent:'space-between', alignItems:'baseline', flexWrap:'wrap', gap:'1rem', marginBottom:'1rem'}}>
                  <div>
                    <span style={{fontFamily:'var(--f-mono)', fontSize:'.68rem', letterSpacing:'.14em', textTransform:'uppercase', color:'var(--acc-text)'}}>
                      PRINSIP OPERASIONAL LAPISAN {LAYERS[selectedLayer].id}
                    </span>
                    <h3 style={{fontFamily:'var(--f-head)', fontSize:'1.4rem', color:'var(--ink)', margin:'.3rem 0 0 0'}}>
                      {LAYERS[selectedLayer].title}
                    </h3>
                  </div>
                  <button
                    onClick={() => jumpToSectionId(LAYERS[selectedLayer].anchorSec)}
                    style={{
                      background:'var(--acc)',
                      color:'#fff',
                      border:'none',
                      fontFamily:'var(--f-mono)',
                      fontSize:'.72rem',
                      letterSpacing:'.1em',
                      textTransform:'uppercase',
                      padding:'.55rem .95rem',
                      cursor:'pointer',
                      fontWeight:700
                    }}
                  >
                    Buka Jangkar Naskah (§{LAYERS[selectedLayer].anchorSec}) &rarr;
                  </button>
                </div>

                <p style={{fontFamily:'var(--f-body)', fontSize:'1.02rem', lineHeight:1.7, color:'var(--ink)', fontStyle:'italic', marginBottom:'1.5rem'}}>
                  &ldquo;{LAYERS[selectedLayer].principle}&rdquo;
                </p>

                <div style={{display:'grid', gridTemplateColumns:'repeat(auto-fit, minmax(280px, 1fr))', gap:'1.5rem', marginBottom:'1.5rem'}}>
                  <div style={{background:'var(--bg2)', border:'1px solid var(--rule)', padding:'1.2rem'}}>
                    <div style={{fontFamily:'var(--f-mono)', fontSize:'.68rem', letterSpacing:'.12em', textTransform:'uppercase', color:'var(--mute)', marginBottom:'.8rem'}}>
                      Mekanika Kausal Utama:
                    </div>
                    <ul style={{margin:0, paddingLeft:'1.2rem', fontFamily:'var(--f-body)', fontSize:'.9rem', color:'var(--ink2)', lineHeight:1.65}}>
                      {LAYERS[selectedLayer].mechanics.map((m, i) => (
                        <li key={i} style={{marginBottom:'.4rem'}}>{m}</li>
                      ))}
                    </ul>
                  </div>

                  <div style={{background:'var(--bg2)', border:'1px solid var(--rule)', padding:'1.2rem'}}>
                    <div style={{fontFamily:'var(--f-mono)', fontSize:'.68rem', letterSpacing:'.12em', textTransform:'uppercase', color:'var(--mute)', marginBottom:'.8rem'}}>
                      Seksi Inti Terkait:
                    </div>
                    <div style={{display:'flex', flexDirection:'column', gap:'.4rem'}}>
                      {LAYERS[selectedLayer].keySections.map(sec => (
                        <button
                          key={sec.id}
                          onClick={() => jumpToSectionId(sec.id)}
                          style={{
                            display:'flex',
                            justifyContent:'space-between',
                            alignItems:'center',
                            background:'var(--bg)',
                            border:'1px solid var(--rule)',
                            padding:'.45rem .75rem',
                            cursor:'pointer',
                            textAlign:'left',
                            color:'var(--ink)'
                          }}
                        >
                          <span style={{fontFamily:'var(--f-mono)', fontSize:'.72rem', color:'var(--acc-text)', fontWeight:700}}>§{sec.id}</span>
                          <span style={{fontFamily:'var(--f-head)', fontSize:'.88rem', color:'var(--ink2)'}}>{sec.title}</span>
                          <span style={{fontFamily:'var(--f-mono)', fontSize:'.7rem', color:'var(--mute)'}}>&rarr;</span>
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Flow indicator */}
                <div style={{background:'var(--bg2)', border:'1px solid var(--rule)', padding:'.8rem 1.2rem', fontFamily:'var(--f-mono)', fontSize:'.72rem', color:'var(--mute)', display:'flex', alignItems:'center', gap:'.8rem', flexWrap:'wrap'}}>
                  <span style={{color:'var(--acc-text)', fontWeight:700}}>● ALUR KAUSAL:</span>
                  <span>Lantai Material (Batas Fisik)</span>
                  <span>&rarr;</span>
                  <span>Medan Lembaga (Insentif & Hukum)</span>
                  <span>&rarr;</span>
                  <span>Agensi Subjektif (Becoming & Praksis)</span>
                </div>
              </div>
            )}
          </div>
        )}

        {/* ================================================================
            PANEL 2: TRANSFER FORMULA (T = S · D · P · G)
           ================================================================ */}
        {activeMode === 'formula' && (
          <div style={{background:'var(--bg)', border:'1px solid var(--rule)', padding:'2rem', boxShadow:'8px 8px 0 rgba(0,0,0,0.05)'}}>
            
            {/* Big Formula Display */}
            <div style={{textAlign:'center', padding:'1.8rem 1rem', background:'var(--bg2)', border:'1px solid var(--rule)', marginBottom:'2rem'}}>
              <div style={{fontFamily:'var(--f-mono)', fontSize:'.68rem', letterSpacing:'.2em', textTransform:'uppercase', color:'var(--mute)', marginBottom:'.6rem'}}>
                FORMULA TRANSFER SURPLUS STRUKTURAL (PMN §6.3, §11.3)
              </div>
              <div style={{fontFamily:'var(--f-head)', fontSize:'clamp(2.2rem, 5vw, 3.4rem)', color:'var(--acc-text)', letterSpacing:'.1em', margin:'0 0 .6rem 0'}}>
                T = S &middot; D &middot; P &middot; G
              </div>
              <p style={{fontFamily:'var(--f-body)', fontSize:'.95rem', color:'var(--ink2)', maxWidth:'620px', margin:'0 auto'}}>
                Besaran ekstraksi surplus kekuasaan (<strong style={{color:'var(--ink)'}}>T</strong>) berbanding lurus secara multiplikatif terhadap disparitas skala (<strong style={{color:'var(--ink)'}}>S</strong>), durasi waktu tanpa rotasi (<strong style={{color:'var(--ink)'}}>D</strong>), biaya pemutusan kepatuhan (<strong style={{color:'var(--ink)'}}>P</strong>), dan kepekatan tabir transparansi (<strong style={{color:'var(--ink)'}}>G</strong>).
              </p>
            </div>

            {/* Variable Pills */}
            <div style={{display:'grid', gridTemplateColumns:'repeat(auto-fit, minmax(200px, 1fr))', gap:'1rem', marginBottom:'2rem'}}>
              {(['S', 'D', 'P', 'G'] as const).map(v => (
                <button
                  key={v}
                  onClick={() => setSelectedVar(v)}
                  style={{
                    border: selectedVar === v ? '2px solid var(--acc)' : '1px solid var(--rule)',
                    background: selectedVar === v ? 'var(--bg2)' : 'var(--bg)',
                    padding:'1rem',
                    textAlign:'left',
                    cursor:'pointer',
                    transition:'all .15s ease'
                  }}
                >
                  <div style={{display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'.3rem'}}>
                    <span style={{fontFamily:'var(--f-head)', fontSize:'1.6rem', color: selectedVar === v ? 'var(--acc-text)' : 'var(--ink)', fontWeight:700}}>
                      {v}
                    </span>
                    <span style={{fontFamily:'var(--f-mono)', fontSize:'.65rem', color:'var(--mute)'}}>
                      §{FORMULA_VARS[v].anchor}
                    </span>
                  </div>
                  <div style={{fontFamily:'var(--f-mono)', fontSize:'.72rem', color:'var(--ink2)', lineHeight:1.3}}>
                    {FORMULA_VARS[v].name}
                  </div>
                </button>
              ))}
            </div>

            {/* Selected Variable Breakdown */}
            {FORMULA_VARS[selectedVar] && (
              <div style={{border:'1px solid var(--rule)', background:'var(--bg2)', padding:'1.6rem', borderRadius:'2px'}}>
                <div style={{display:'flex', justifyContent:'space-between', alignItems:'center', flexWrap:'wrap', gap:'1rem', marginBottom:'1rem', borderBottom:'1px solid var(--rule)', paddingBottom:'.8rem'}}>
                  <div>
                    <span style={{fontFamily:'var(--f-mono)', fontSize:'.68rem', letterSpacing:'.12em', textTransform:'uppercase', color:'var(--acc-text)'}}>
                      VARIABEL {selectedVar} &mdash; ANALISIS DIAGNOSTIK
                    </span>
                    <h3 style={{fontFamily:'var(--f-head)', fontSize:'1.35rem', color:'var(--ink)', margin:'.2rem 0 0 0'}}>
                      {FORMULA_VARS[selectedVar].name}
                    </h3>
                  </div>
                  <button
                    onClick={() => jumpToSectionId(FORMULA_VARS[selectedVar].anchor)}
                    style={{
                      background:'var(--acc)',
                      color:'#fff',
                      border:'none',
                      fontFamily:'var(--f-mono)',
                      fontSize:'.7rem',
                      letterSpacing:'.1em',
                      textTransform:'uppercase',
                      padding:'.5rem .85rem',
                      cursor:'pointer',
                      fontWeight:700
                    }}
                  >
                    Buka Pembuktian di §{FORMULA_VARS[selectedVar].anchor} &rarr;
                  </button>
                </div>

                <div style={{display:'grid', gridTemplateColumns:'repeat(auto-fit, minmax(280px, 1fr))', gap:'1.2rem'}}>
                  <div>
                    <strong style={{display:'block', fontFamily:'var(--f-mono)', fontSize:'.68rem', letterSpacing:'.1em', textTransform:'uppercase', color:'var(--mute)', marginBottom:'.4rem'}}>
                      Definisi Formal:
                    </strong>
                    <p style={{fontFamily:'var(--f-body)', fontSize:'.92rem', lineHeight:1.65, color:'var(--ink)', margin:0}}>
                      {FORMULA_VARS[selectedVar].def}
                    </p>
                  </div>

                  <div>
                    <strong style={{display:'block', fontFamily:'var(--f-mono)', fontSize:'.68rem', letterSpacing:'.1em', textTransform:'uppercase', color:'var(--mute)', marginBottom:'.4rem'}}>
                      Uji Lapangan (Field Test):
                    </strong>
                    <p style={{fontFamily:'var(--f-body)', fontSize:'.92rem', lineHeight:1.65, color:'var(--ink2)', margin:0, fontStyle:'italic'}}>
                      &ldquo;{FORMULA_VARS[selectedVar].fieldTest}&rdquo;
                    </p>
                  </div>

                  <div style={{gridColumn:'1 / -1', background:'var(--bg)', border:'1px solid var(--rule)', padding:'1rem 1.2rem', marginTop:'.5rem'}}>
                    <strong style={{display:'block', fontFamily:'var(--f-mono)', fontSize:'.68rem', letterSpacing:'.1em', textTransform:'uppercase', color:'var(--acc-text)', marginBottom:'.4rem'}}>
                      Penangkal & Strategi Reformasi PMN:
                    </strong>
                    <p style={{fontFamily:'var(--f-body)', fontSize:'.92rem', lineHeight:1.65, color:'var(--ink)', margin:0}}>
                      {FORMULA_VARS[selectedVar].counterMeasure}
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* ================================================================
            PANEL 3: 5-STAGE CAPTURE SEQUENCE (§7.3c-i)
           ================================================================ */}
        {activeMode === 'capture' && (
          <div style={{background:'var(--bg)', border:'1px solid var(--rule)', padding:'2rem', boxShadow:'8px 8px 0 rgba(0,0,0,0.05)'}}>
            
            {/* Stage Stepper Header */}
            <div style={{display:'grid', gridTemplateColumns:'repeat(auto-fit, minmax(170px, 1fr))', gap:'.6rem', marginBottom:'2rem'}}>
              {CAPTURE_STAGES.map((stg, i) => (
                <button
                  key={stg.num}
                  onClick={() => setSelectedStage(i)}
                  style={{
                    border: selectedStage === i ? '2px solid var(--acc)' : '1px solid var(--rule)',
                    background: selectedStage === i ? 'var(--bg2)' : 'var(--bg)',
                    padding:'.8rem .6rem',
                    textAlign:'center',
                    cursor:'pointer',
                    transition:'all .15s ease'
                  }}
                >
                  <div style={{fontFamily:'var(--f-mono)', fontSize:'.65rem', color: selectedStage === i ? 'var(--acc-text)' : 'var(--mute)', fontWeight:700, marginBottom:'.2rem'}}>
                    TAHAP {stg.num}
                  </div>
                  <div style={{fontFamily:'var(--f-head)', fontSize:'.82rem', color:'var(--ink)', lineHeight:1.2}}>
                    {stg.title}
                  </div>
                </button>
              ))}
            </div>

            {/* Stage Detail Card */}
            {CAPTURE_STAGES[selectedStage] && (
              <div style={{border:'1px solid var(--rule)', background:'var(--bg2)', padding:'1.8rem', borderRadius:'2px'}}>
                <div style={{display:'flex', justifyContent:'space-between', alignItems:'baseline', flexWrap:'wrap', gap:'1rem', marginBottom:'1.2rem', borderBottom:'1px solid var(--rule)', paddingBottom:'1rem'}}>
                  <div>
                    <span style={{fontFamily:'var(--f-mono)', fontSize:'.68rem', letterSpacing:'.14em', textTransform:'uppercase', color:'var(--acc-text)'}}>
                      DEGENERASI INSTITUSI &mdash; TAHAP {CAPTURE_STAGES[selectedStage].num}
                    </span>
                    <h3 style={{fontFamily:'var(--f-head)', fontSize:'1.45rem', color:'var(--ink)', margin:'.3rem 0 .2rem 0'}}>
                      {CAPTURE_STAGES[selectedStage].title}
                    </h3>
                    <div style={{fontFamily:'var(--f-body)', fontSize:'.9rem', color:'var(--mute)', fontStyle:'italic'}}>
                      {CAPTURE_STAGES[selectedStage].subtitle}
                    </div>
                  </div>
                  <button
                    onClick={() => jumpToSectionId(CAPTURE_STAGES[selectedStage].anchor)}
                    style={{
                      background:'var(--acc)',
                      color:'#fff',
                      border:'none',
                      fontFamily:'var(--f-mono)',
                      fontSize:'.72rem',
                      letterSpacing:'.1em',
                      textTransform:'uppercase',
                      padding:'.55rem .95rem',
                      cursor:'pointer',
                      fontWeight:700
                    }}
                  >
                    Buka Naskah (§{CAPTURE_STAGES[selectedStage].anchor}) &rarr;
                  </button>
                </div>

                <div style={{display:'grid', gridTemplateColumns:'repeat(auto-fit, minmax(280px, 1fr))', gap:'1.4rem'}}>
                  <div style={{background:'var(--bg)', border:'1px solid var(--rule)', padding:'1.2rem'}}>
                    <strong style={{display:'block', fontFamily:'var(--f-mono)', fontSize:'.68rem', letterSpacing:'.1em', textTransform:'uppercase', color:'var(--mute)', marginBottom:'.5rem'}}>
                      Gejala & Manifestasi Klinis:
                    </strong>
                    <p style={{fontFamily:'var(--f-body)', fontSize:'.92rem', lineHeight:1.68, color:'var(--ink)', margin:0}}>
                      {CAPTURE_STAGES[selectedStage].symptoms}
                    </p>
                  </div>

                  <div style={{background:'var(--bg)', border:'1px solid var(--rule)', padding:'1.2rem'}}>
                    <strong style={{display:'block', fontFamily:'var(--f-mono)', fontSize:'.68rem', letterSpacing:'.1em', textTransform:'uppercase', color:'var(--mute)', marginBottom:'.5rem'}}>
                      Indikator Diagnostik Lapangan:
                    </strong>
                    <p style={{fontFamily:'var(--f-body)', fontSize:'.92rem', lineHeight:1.68, color:'var(--ink2)', margin:0}}>
                      {CAPTURE_STAGES[selectedStage].indicators}
                    </p>
                  </div>

                  <div style={{gridColumn:'1 / -1', background:'var(--bg)', border:'1px solid var(--rule)', padding:'1.2rem'}}>
                    <strong style={{display:'block', fontFamily:'var(--f-mono)', fontSize:'.68rem', letterSpacing:'.1em', textTransform:'uppercase', color:'var(--acc-text)', marginBottom:'.5rem'}}>
                      Penangkal & Intervensi PMN (Anti-Capture Protocols):
                    </strong>
                    <p style={{fontFamily:'var(--f-body)', fontSize:'.95rem', lineHeight:1.68, color:'var(--ink)', margin:0}}>
                      {CAPTURE_STAGES[selectedStage].remedy}
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* ================================================================
            PANEL 4: ENHANCED PART DIRECTORY (Part I - XXI)
           ================================================================ */}
        {activeMode === 'parts' && (
          <div className="anatomy-terminal" style={{display:'grid', gridTemplateColumns:'minmax(220px, 280px) 1fr', border:'1px solid var(--rule)', background:'var(--bg)', minHeight:'520px', boxShadow:'12px 12px 0 rgba(0,0,0,0.05)'}}>
            {/* Sidebar list of parts */}
            <div style={{borderRight:'1px solid var(--rule)', background:'var(--bg2)', overflowY:'auto', maxHeight:'580px'}}>
              <div style={{background:'var(--acc)', color:'#fff', fontFamily:'var(--f-mono)', fontSize:'.7rem', fontWeight:700, textTransform:'uppercase', letterSpacing:'.12em', padding:'.8rem 1rem'}}>
                Part Index (I &ndash; XXI)
              </div>
              {anatParts.map((p: any, i: number) => (
                <button
                  key={p.part}
                  onClick={() => setSelectedPartIndex(i)}
                  style={{
                    display:'block',
                    width:'100%',
                    textAlign:'left',
                    padding:'.7rem 1rem',
                    border:'none',
                    borderBottom:'1px solid var(--rule)',
                    background: selectedPartIndex === i ? 'var(--bg)' : 'transparent',
                    color: selectedPartIndex === i ? 'var(--acc-text)' : 'var(--ink)',
                    fontFamily:'var(--f-mono)',
                    fontSize:'.75rem',
                    cursor:'pointer',
                    fontWeight: selectedPartIndex === i ? 700 : 400
                  }}
                >
                  Part {p.part}
                </button>
              ))}
            </div>

            {/* Content panel */}
            <div style={{padding:'2rem', overflowY:'auto', maxHeight:'580px'}}>
              {currentPart && (
                <div>
                  <div style={{display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'.8rem'}}>
                    <span style={{fontFamily:'var(--f-mono)', fontSize:'.72rem', color:'var(--acc-text)', fontWeight:700, textTransform:'uppercase'}}>
                      Part {currentPart.part}
                    </span>
                    <span style={{fontFamily:'var(--f-mono)', fontSize:'.68rem', color:'var(--mute)'}}>
                      {currentPart.subs?.length || 0} Analytical Modules
                    </span>
                  </div>

                  <h3 style={{fontFamily:'var(--f-head)', fontSize:'1.45rem', color:'var(--ink)', margin:'0 0 1rem 0'}}>
                    {currentPart.title}
                  </h3>

                  <p style={{fontFamily:'var(--f-body)', fontSize:'.95rem', lineHeight:1.7, color:'var(--ink2)', marginBottom:'1.5rem'}}>
                    {currentPart.subs?.[0]?.text
                      ? currentPart.subs[0].text.slice(0, 320) + '…'
                      : `Part ini memuat rangkaian analisis mendalam dengan ${currentPart.subs?.length || 0} sub-modul teoritis.`}
                  </p>

                  <div style={{fontFamily:'var(--f-mono)', fontSize:'.72rem', marginBottom:'1.5rem', display:'flex', flexDirection:'column', gap:'.4rem'}}>
                    <div style={{color:'var(--mute)', textTransform:'uppercase', letterSpacing:'.1em', fontSize:'.65rem', marginBottom:'.2rem'}}>
                      Daftar Sub-Seksi Modul:
                    </div>
                    {(currentPart.subs || []).slice(0, 8).map((s: any) => (
                      <div key={s.id} style={{padding:'.35rem 0', borderBottom:'1px solid var(--rule)', display:'flex', alignItems:'baseline', gap:'.6rem'}}>
                        <span style={{color:'var(--acc-text)', fontWeight:700}}>{s.id}</span>
                        <span style={{color:'var(--ink2)', flex:1}}>{s.title}</span>
                      </div>
                    ))}
                    {(currentPart.subs?.length || 0) > 8 && (
                      <div style={{color:'var(--mute)', paddingTop:'.4rem', fontStyle:'italic'}}>
                        + {currentPart.subs.length - 8} modul analitis lainnya dalam bagian ini
                      </div>
                    )}
                  </div>

                  <button
                    onClick={() => {
                      if (data) {
                        const pIdx = data.parts.findIndex((pp: any) => pp.part === currentPart.part)
                        if (pIdx >= 0) { onJump(pIdx, 0); return }
                      }
                      onStartReading()
                    }}
                    style={{
                      background:'var(--acc)',
                      color:'#fff',
                      border:'none',
                      fontFamily:'var(--f-mono)',
                      fontSize:'.75rem',
                      letterSpacing:'.12em',
                      textTransform:'uppercase',
                      padding:'.7rem 1.2rem',
                      cursor:'pointer',
                      fontWeight:700
                    }}
                  >
                    Buka Part {currentPart.part} di Reader &rarr;
                  </button>
                </div>
              )}
            </div>
          </div>
        )}

      </div>
    </div>
  )
}
