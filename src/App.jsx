import { useState, useEffect } from 'react'

// ─── Storage ──────────────────────────────────────────────────────────────────
const VERSIONS_KEY = 'pmn-versions'
const CREDS_KEY    = 'pmn-creds'

function loadVersions() {
  try { return JSON.parse(localStorage.getItem(VERSIONS_KEY) || '[]') } catch { return [] }
}
function saveVersions(v) { localStorage.setItem(VERSIONS_KEY, JSON.stringify(v)) }
function loadCreds() {
  try { return JSON.parse(localStorage.getItem(CREDS_KEY)) } catch { return null }
}
function saveCreds(c) { localStorage.setItem(CREDS_KEY, JSON.stringify(c)) }

// ─── Theme ────────────────────────────────────────────────────────────────────
const T = {
  bg:      '#0d0d0d',
  surface: '#141414',
  card:    '#1a1a1a',
  border:  '#2a2a2a',
  borderL: '#333',
  text:    '#e8e4db',
  mute:    '#706a60',
  accent:  '#c9a84c',
  serif:   "'EB Garamond', Georgia, serif",
  mono:    "'DM Mono', monospace",
}

const S = {
  topBar: { height: 2, background: T.accent, width: '100%' },
  label: {
    fontFamily: T.mono, fontSize: '0.6rem', letterSpacing: '0.22em',
    textTransform: 'uppercase', color: T.mute, display: 'block', marginBottom: '1rem',
  },
  input: {
    width: '100%', background: '#0d0d0d', border: `1px solid ${T.border}`,
    color: T.text, fontFamily: T.serif, fontSize: '1rem',
    padding: '0.65rem 0.9rem', outline: 'none', marginBottom: '0.9rem',
    boxSizing: 'border-box',
  },
  textarea: {
    width: '100%', background: '#0d0d0d', border: `1px solid ${T.border}`,
    color: T.text, fontFamily: T.serif, fontSize: '1rem',
    padding: '0.65rem 0.9rem', outline: 'none', marginBottom: '0.9rem',
    resize: 'vertical', minHeight: 90, boxSizing: 'border-box',
  },
  btn: (bg = T.accent, fg = '#0d0d0d') => ({
    display: 'inline-flex', alignItems: 'center', gap: '0.5rem',
    background: bg, color: fg, fontFamily: T.mono, fontSize: '0.66rem',
    letterSpacing: '0.15em', textTransform: 'uppercase', border: 'none',
    padding: '0.7rem 1.3rem', cursor: 'pointer', transition: 'opacity .18s',
    textDecoration: 'none',
  }),
}

// ─── Daftar Isi PMN (dari dokumen asli) ──────────────────────────────────────
const TOC = [
  { part: 'I', title: 'How We Know: The Epistemological Foundation', subs: [
    '1.1 The Prior Question',
    '1.2 The Primary Diagnostic',
    '1.3 Probabilistic Determinism',
    '1.4 Convergence Under Material Pressure',
    '1.5 Inaction and Its Costs',
    '1.6 Truth, Communication, and the Management Problem',
    '1.6b Belief and Doubt: The Productive Equilibrium',
    '1.7 Knowledge Production as a Material Process',
  ]},
  { part: 'I-b', title: 'Epistemic Infrastructure as Material Condition', subs: [
    'I-b.1 The Social Architecture of What Can Be Known',
    'I-b.2 Epistemic Authority: How Claims Acquire Social Standing',
    'I-b.3 Information Asymmetry as Structural Power',
    'I-b.4 Trust Infrastructure and Its Collapse',
    'I-b.5 Epistemic Infrastructure and the Visibility Variable',
  ]},
  { part: 'II', title: 'What Exists: The Ontological Foundation', subs: [
    '2.1 Reality as Primary',
    '2.2 Adaptive Materialism',
    '2.3 On Necessary Being',
  ]},
  { part: 'III', title: 'The Biological Foundation: From Physiology to Institution', subs: [
    '3.1 The Displacement That Matters',
    '3.2 The Starting Point: Descriptive, Not Normative',
    '3.3 From Description to Evaluation: The Is-Ought Bridge',
    '3.4 The Minimal Anchor',
    '3.4b A Typology of Suffering',
    '3.4c The Scope of Moral Patienthood and the Aggregation Problem',
    '3.4d The Biological Foundation Under Technological Pressure',
    '3.5 Suffering as a System-Level Variable',
    '3.6 The Arc from Physiology to Institution',
    '3.7 The Causal Chain: From Self-Interest to Collective Structure',
    '3.8 Cognitive Constraints and Institutional Limits',
    '3.8b Affective Mobilization and the Politics of Collective Emotion',
    '3.9 Demographic Dynamics as Material Variables',
    '3.10 Ecological Constraints: The Ground Beneath All Systems',
    '3.11 Illustrative Cases: The Chain in Operation',
    '3.12 Rational Micro, Problematic Macro',
  ]},
  { part: 'IV', title: 'What Matters: Ethics, Value, and the Evaluative Commitment', subs: [
    '4.1 The Foundation of Value',
    '4.2 Better and Worse',
    '4.3 On Progress',
    '4.4 On Manipulation, Trust, and Structural Checks',
    '4.5 Beyond the Minimal Anchor: Toward Genuine Becoming',
  ]},
  { part: 'V', title: 'The Metaphysical Dimension: Meaning, Religion, and Material Reality', subs: [
    '5.1 What the Materialist Tradition Got Wrong About Religion',
    '5.2 Two Levels of the Same Question',
    '5.3 Interface-Emergent Phenomena',
    '5.4 The Evaluative Standard for Metaphysical Claims',
    '5.5 Religion as Material Variable',
  ]},
  { part: 'VI', title: 'Power: The Variable That Cannot Be Left Implicit', subs: [
    '6.1 Why Power Must Be Named',
    '6.2 Power as Structural Position',
    '6.3 Asymmetry, Capture, and Information',
    '6.4 The Anti-Technocratic Guardrail',
    '6.5 How Institutions Preserve Themselves',
    '6.6 Legitimacy Crisis: When Systems Lose the Consent That Sustains Them',
    '6.7 Legitimacy Production: How Systems Build Consent',
    '6.8 Elite Circulation and Structural Continuity',
  ]},
  { part: 'VII', title: 'How to Organize: Politics, Institutions, and the State', subs: [
    '7.0 What We Mean by System',
    '7.0b Levels of Analysis',
    '7.1 The State Problem',
    '7.2 Progressive Institutionalism',
    '7.3 The Custodian Problem',
    '7.3b Early Detection of Institutional Capture',
    '7.3c Incentive Architecture and Predictable Institutional Failure',
    '7.4 The State and Long-Term Direction',
    '7.5 Noble Lie: Fictions That Serve Power',
    '7.6 Those Who Stand on Others: The Structural Analysis',
    '7.7 Path Dependence: Why History Constrains the Present',
  ]},
  { part: 'VIII', title: 'Society, Culture, and the Politics of Material Outcomes', subs: [
    '8.1 Evaluating Cultural Practices',
    '8.2 Marginalized Groups and the Material Frame',
    '8.2b Intersectional Analysis as Methodological Procedure',
    '8.3 The Consistency Standard',
    '8.4 Governing Narrative as Material Force',
    '8.4b Narrative Typology: How Governing Narratives Structure Political Time',
    '8.4c Meritocracy as Visibility Suppression',
    '8.5 Anti-Naïve Universalism',
    '8.6 Anti-Passive Multiculturalism: The Consistency Standard Applied',
  ]},
  { part: 'IX', title: 'The International Dimension: Geopolitics and Global Order', subs: [
    '9.0 The Material Basis of International Order',
    '9.0b The Historical Divergence: How the Distribution Was Produced',
    '9.1 Realism and Direction',
    '9.2 On Power Concentration',
    '9.2b Technology as Redistributor of Material Power',
    '9.2c Artificial Intelligence and the New Architecture of Institutional Power',
    '9.3 Multipolarity as Transitional Arrangement',
    '9.4 The Parallel Development Framework',
  ]},
  { part: 'X', title: 'How Systems Change: Adaptive Dynamics and Historical Transformation', subs: [
    '10.1 Why Systems Change',
    '10.2 Suffering as the Signal of System Stress',
    '10.3 Technology and System Transition',
    '10.4 Adaptation, Not Optimization',
    '10.5 Thresholds and Non-Linearity',
    '10.5b Political Time: Windows, Conjunctures, and the Materiality of Timing',
    '10.6 Reform, Revolution, and the Sequencing Problem',
    '10.7 How Counter-Power Accumulates',
    '10.8 The Two Modes of Struggle',
    '10.9 Performative Hostility and Coordination Behind the Surface',
  ]},
  { part: 'XI', title: 'The Economic Doctrine', subs: [
    '11.0 Two Levels of Economic Analysis',
    '11.0b Incentive Structures in Economic Arrangements',
    '11.1 Economics Without Prior Commitments',
    '11.2 The Permanent Conditions and Economic Doctrine',
    '11.3 Horizon and Instrument',
    '11.3b Contemporary Capitalism as Terrain for the Seven Diagnostics',
    '11.4 What Doctrine Looks Like: A Contrastive Illustration',
  ]},
  { part: 'XII', title: 'How This Framework Operates', subs: [
    '12.1 The Methodology of Stress-Testing',
    '12.2 Multi-Perspectival Analysis',
    '12.3 Framework and Doctrine in Practice',
    '12.4 The Architecture of the Framework: Parts I, II, and III in Sequence',
    '12.5 When This Framework Fails: Specific Failure Modes',
    '12.6 Genealogical Interrogation as Method',
    '12.7 The Genealogy of This Framework',
  ]},
  { part: 'XIII', title: 'Tensions That Cannot Be Resolved — Only Managed', subs: [
    '13.1 The Nature of Permanent Tension',
    '13.1b The Relationship Between Contradictions and Tensions',
    '13.1c Diagnostic: Is This a Tension or a Contradiction?',
    '13.2 The Tensions',
    '13.2b Conditional Tensions: Present Under Specific Circumstances',
    '13.3 Trade-offs as Permanent Features of Complex Systems',
    '13.4 Limits of This Framework',
    '13.5 Closing: The Framework That Must Be Surpassed',
  ]},
  { part: 'XIV', title: 'Summary: Framework, Doctrine, and What Remains Open', subs: [
    '14.1 The Framework: Adaptive Naturalism',
    '14.2 The Doctrine: Progressive Materialist Naturalism',
    '14.3 Argument, Assumption, and Open Question',
    '14.4 What Would Surpass This Framework',
  ]},
  { part: 'XV', title: 'The Formula Architecture', subs: [
    '15.0 The Input Architecture of Predictive History',
    '15.1 Complexity & Systems Dynamics: The Operator Decomposed',
    '15.2 The Primary Formula',
    '15.3 The Suffering Variable: What Feeds Transformation Pressure',
    '15.4 The Duration and Scale Multipliers',
    '15.5 The Adaptive Capacity Formula',
    '15.6 The Repressive Capacity Formula',
    '15.7 The Legitimacy Formula',
    '15.8 The Counter-Power Formula',
    '15.9 The Predictive History Formula',
    '15.10 Domain-Specific Formulas',
    '15.11 The Time Variable: Windows and Cycles',
    '15.12 Application: Reading Current Conditions',
    '15.13 What the Formulas Cannot Do',
    '15.14 Applied Cases: The Formulas in Operation',
  ]},
]

// ─── Micro components ─────────────────────────────────────────────────────────
function Rule() {
  return <div style={{ borderTop: `1px solid ${T.border}`, margin: '2.5rem 0' }} />
}

function Tag({ children, color = T.accent }) {
  return (
    <span style={{
      background: color + '22', color, border: `1px solid ${color}44`,
      fontFamily: T.mono, fontSize: '0.58rem', letterSpacing: '0.14em',
      textTransform: 'uppercase', padding: '0.15rem 0.5rem',
    }}>{children}</span>
  )
}

function DownloadIcon() {
  return (
    <svg width="12" height="12" viewBox="0 0 24 24" fill="none"
      stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
      <polyline points="7 10 12 15 17 10"/>
      <line x1="12" y1="15" x2="12" y2="3"/>
    </svg>
  )
}

function fmtDate(iso) {
  return new Date(iso).toLocaleDateString('id-ID', { year: 'numeric', month: 'long', day: 'numeric' })
}

// ─── Table of Contents Page ───────────────────────────────────────────────────
function TableOfContents({ onBack }) {
  const [openParts, setOpenParts] = useState({})

  function toggle(part) {
    setOpenParts(p => ({ ...p, [part]: !p[part] }))
  }

  function expandAll()   { const o = {}; TOC.forEach(t => o[t.part] = true);  setOpenParts(o) }
  function collapseAll() { setOpenParts({}) }

  const anyOpen = Object.values(openParts).some(Boolean)

  return (
    <div style={{ maxWidth: 800, margin: '0 auto', padding: '0 2rem' }}>
      <section style={{ padding: '4rem 0 5rem' }}>

        {/* Header */}
        <button onClick={onBack}
          style={{ background: 'none', border: 'none', cursor: 'pointer',
            fontFamily: T.mono, fontSize: '0.62rem', letterSpacing: '0.15em',
            textTransform: 'uppercase', color: T.mute, marginBottom: '2.5rem',
            display: 'block', padding: 0 }}>
          ← Kembali
        </button>

        <p style={{ fontFamily: T.mono, fontSize: '0.6rem', letterSpacing: '0.25em',
          textTransform: 'uppercase', color: T.accent, marginBottom: '1rem' }}>
          Progressive Materialist Naturalism
        </p>
        <h1 style={{ fontFamily: T.serif, fontSize: 'clamp(1.8rem, 4vw, 2.6rem)',
          fontWeight: 500, color: T.text, marginBottom: '0.5rem', lineHeight: 1.15 }}>
          Daftar Isi
        </h1>
        <p style={{ fontFamily: T.mono, fontSize: '0.65rem', color: T.mute,
          marginBottom: '2.5rem' }}>
          15 Parts · {TOC.reduce((a, t) => a + t.subs.length, 0)} Subbab
        </p>

        {/* Expand/Collapse toggle */}
        <div style={{ display: 'flex', gap: '1rem', marginBottom: '2rem' }}>
          <button onClick={anyOpen ? collapseAll : expandAll}
            style={{ background: 'none', border: `1px solid ${T.border}`,
              color: T.mute, fontFamily: T.mono, fontSize: '0.62rem',
              letterSpacing: '0.14em', textTransform: 'uppercase',
              padding: '0.4rem 0.9rem', cursor: 'pointer' }}>
            {anyOpen ? 'Tutup Semua' : 'Buka Semua'}
          </button>
        </div>

        {/* TOC list */}
        <div>
          {TOC.map((item, idx) => (
            <div key={item.part} style={{ borderTop: `1px solid ${T.border}` }}>
              <button
                onClick={() => toggle(item.part)}
                style={{ width: '100%', background: 'none', border: 'none',
                  cursor: 'pointer', padding: '1.1rem 0',
                  display: 'grid', gridTemplateColumns: '56px 1fr 24px',
                  alignItems: 'center', gap: '0.5rem', textAlign: 'left' }}>
                <span style={{ fontFamily: T.mono, fontSize: '0.62rem',
                  letterSpacing: '0.12em', color: T.accent,
                  textTransform: 'uppercase' }}>
                  Part {item.part}
                </span>
                <span style={{ fontFamily: T.serif, fontSize: '1.05rem',
                  color: T.text, lineHeight: 1.3 }}>
                  {item.title}
                </span>
                <span style={{ fontFamily: T.mono, fontSize: '0.7rem',
                  color: T.mute, textAlign: 'right',
                  transition: 'transform 0.2s',
                  display: 'inline-block',
                  transform: openParts[item.part] ? 'rotate(90deg)' : 'rotate(0deg)' }}>
                  ›
                </span>
              </button>

              {/* Subbab */}
              {openParts[item.part] && (
                <div style={{ paddingBottom: '1rem', paddingLeft: '56px' }}>
                  {item.subs.map(sub => (
                    <div key={sub} style={{ padding: '0.3rem 0',
                      borderLeft: `1px solid ${T.border}`, paddingLeft: '1.2rem',
                      marginLeft: '0' }}>
                      <span style={{ fontFamily: T.serif, fontSize: '0.92rem',
                        color: T.mute, lineHeight: 1.6 }}>{sub}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
          <div style={{ borderTop: `1px solid ${T.border}`, paddingTop: '1.1rem',
            display: 'grid', gridTemplateColumns: '56px 1fr',
            gap: '0.5rem', alignItems: 'center' }}>
            <span style={{ fontFamily: T.mono, fontSize: '0.62rem',
              color: T.mute, textTransform: 'uppercase', letterSpacing: '0.1em' }}>—</span>
            <span style={{ fontFamily: T.serif, fontSize: '1.05rem',
              color: T.mute, fontStyle: 'italic' }}>
              Coda · Intellectual Debts · Bibliography
            </span>
          </div>
        </div>
      </section>
    </div>
  )
}

// ─── PDF Viewer Page ──────────────────────────────────────────────────────────
function PdfViewer({ version, onBack }) {
  const [loaded, setLoaded] = useState(false)

  // Convert Google Drive share link to embed link
  function toEmbedUrl(url) {
    if (!url) return null
    // https://drive.google.com/file/d/FILE_ID/view?usp=sharing
    const match = url.match(/\/file\/d\/([^/]+)/)
    if (match) return `https://drive.google.com/file/d/${match[1]}/preview`
    // Already an embed or direct link — use as-is
    return url
  }

  const embedUrl = toEmbedUrl(version.pdfUrl)

  return (
    <div style={{ maxWidth: 900, margin: '0 auto', padding: '0 2rem' }}>
      <section style={{ padding: '3rem 0 5rem' }}>

        <div style={{ display: 'flex', justifyContent: 'space-between',
          alignItems: 'center', flexWrap: 'wrap', gap: '1rem',
          marginBottom: '2rem' }}>
          <div>
            <button onClick={onBack}
              style={{ background: 'none', border: 'none', cursor: 'pointer',
                fontFamily: T.mono, fontSize: '0.62rem', letterSpacing: '0.15em',
                textTransform: 'uppercase', color: T.mute,
                display: 'block', padding: 0, marginBottom: '0.8rem' }}>
              ← Kembali
            </button>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.8rem' }}>
              <span style={{ fontFamily: T.serif, fontSize: '1.4rem',
                color: T.text }}>PMN v{version.version}</span>
              <span style={{ fontFamily: T.mono, fontSize: '0.65rem',
                color: T.mute }}>{fmtDate(version.date)}</span>
            </div>
          </div>
          {version.pdfUrl && (
            <a href={version.pdfUrl} target="_blank" rel="noopener noreferrer"
              style={S.btn()}>
              <DownloadIcon /> Unduh PDF
            </a>
          )}
        </div>

        {/* PDF embed */}
        {embedUrl ? (
          <div style={{ position: 'relative', background: T.card,
            border: `1px solid ${T.border}` }}>
            {!loaded && (
              <div style={{ position: 'absolute', inset: 0, display: 'flex',
                alignItems: 'center', justifyContent: 'center',
                color: T.mute, fontFamily: T.mono, fontSize: '0.68rem',
                letterSpacing: '0.1em', zIndex: 1 }}>
                Memuat dokumen...
              </div>
            )}
            <iframe
              src={embedUrl}
              onLoad={() => setLoaded(true)}
              style={{ width: '100%', height: '80vh', border: 'none',
                display: 'block', minHeight: 500 }}
              title={`PMN v${version.version}`}
              allow="autoplay"
            />
          </div>
        ) : (
          <div style={{ border: `1px solid ${T.border}`, padding: '3rem',
            textAlign: 'center', color: T.mute, fontStyle: 'italic' }}>
            URL PDF belum diisi untuk versi ini.
          </div>
        )}

        <p style={{ fontFamily: T.mono, fontSize: '0.6rem', color: T.mute,
          marginTop: '1rem', lineHeight: 1.7 }}>
          Jika preview tidak muncul, pastikan link Google Drive sudah diset ke
          "Siapa saja dengan link dapat melihat". Atau gunakan tombol Unduh PDF di atas.
        </p>
      </section>
    </div>
  )
}

// ─── Public: Home ─────────────────────────────────────────────────────────────
function PublicHome({ versions, onView, onToc, onPdfView }) {
  const latest = versions[0]

  return (
    <div style={{ maxWidth: 800, margin: '0 auto', padding: '0 2rem' }}>

      {/* Hero */}
      <section style={{ padding: '5rem 0 3.5rem' }}>
        <p style={{ fontFamily: T.mono, fontSize: '0.6rem', letterSpacing: '0.25em',
          textTransform: 'uppercase', color: T.accent, marginBottom: '1.8rem' }}>
          Adaptive Naturalism · Nova Dharma
        </p>
        <h1 style={{ fontSize: 'clamp(2rem, 5vw, 3rem)', fontWeight: 500,
          lineHeight: 1.12, color: T.text, marginBottom: '1rem', fontFamily: T.serif }}>
          Progressive Materialist<br />
          <em style={{ fontStyle: 'italic', color: T.accent }}>Naturalism</em>
        </h1>
        <p style={{ fontFamily: T.serif, fontSize: '1rem', color: T.mute,
          maxWidth: 520, lineHeight: 1.85, marginBottom: '2.5rem' }}>
          Sebuah framework untuk menavigasi realitas material. Dokumen hidup yang
          terus berkembang — setiap versi mencerminkan kondisi pemikiran saat ini,
          bukan sistem yang sudah selesai.
        </p>

        {/* Quick actions */}
        <div style={{ display: 'flex', gap: '0.8rem', flexWrap: 'wrap' }}>
          <button onClick={onToc} style={S.btn()}>
            Lihat Daftar Isi →
          </button>
          {latest?.pdfUrl && (
            <button onClick={() => onPdfView(latest)}
              style={S.btn(T.surface, T.text)}>
              Baca PDF Online
            </button>
          )}
        </div>
      </section>

      <Rule />

      {/* Latest version */}
      <section style={{ marginBottom: '4rem' }}>
        <span style={S.label}>Versi Terbaru</span>
        {latest ? (
          <div style={{ border: `1px solid ${T.borderL}`, background: T.card,
            padding: '2.2rem 2.4rem', position: 'relative' }}>
            <div style={{ position: 'absolute', top: 0, left: 0, bottom: 0,
              width: 3, background: T.accent }} />
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem',
              flexWrap: 'wrap', marginBottom: '0.5rem' }}>
              <span style={{ fontFamily: T.serif, fontSize: '1.7rem',
                fontWeight: 500, color: T.text }}>PMN v{latest.version}</span>
              <Tag>Terkini</Tag>
              <span style={{ fontFamily: T.mono, fontSize: '0.65rem',
                color: T.mute }}>{fmtDate(latest.date)}</span>
            </div>
            {latest.subtitle && (
              <p style={{ fontFamily: T.serif, fontSize: '1rem', fontStyle: 'italic',
                color: T.mute, marginBottom: '1rem' }}>{latest.subtitle}</p>
            )}
            <p style={{ color: T.mute, fontSize: '0.97rem', marginBottom: '1.8rem',
              lineHeight: 1.8, maxWidth: 560 }}>{latest.summary}</p>
            <div style={{ display: 'flex', gap: '0.8rem', flexWrap: 'wrap' }}>
              {latest.pdfUrl && (
                <a href={latest.pdfUrl} target="_blank" rel="noopener noreferrer"
                  style={S.btn()}>
                  <DownloadIcon /> Unduh PDF
                </a>
              )}
              <button style={S.btn(T.surface, T.text)}
                onClick={() => latest.pdfUrl && onPdfView(latest)}>
                Baca Online
              </button>
              <button style={S.btn(T.surface, T.text)} onClick={() => onView(latest)}>
                Detail Versi →
              </button>
            </div>
          </div>
        ) : (
          <div style={{ border: `1px solid ${T.border}`, padding: '2rem',
            color: T.mute, fontStyle: 'italic', textAlign: 'center' }}>
            Belum ada versi yang dipublikasikan.
          </div>
        )}
      </section>

      {/* Archive + Changelog */}
      {versions.length > 0 && (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr',
          gap: '3rem', marginBottom: '5rem' }}>
          <section>
            <span style={S.label}>Arsip Versi</span>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ borderBottom: `1px solid ${T.border}` }}>
                  {['Versi', 'Tanggal', 'PDF'].map(h => (
                    <th key={h} style={{ ...S.label, paddingBottom: '0.6rem',
                      textAlign: 'left', fontWeight: 400 }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {versions.map((v, i) => (
                  <tr key={v.id} style={{ borderBottom: `1px solid ${T.border}` }}>
                    <td style={{ padding: '0.7rem 0' }}>
                      <button onClick={() => onView(v)}
                        style={{ background: 'none', border: 'none', color: T.accent,
                          cursor: 'pointer', fontFamily: T.mono, fontSize: '0.75rem' }}>
                        PMN v{v.version}
                        {i === 0 && <span style={{ color: T.mute, fontSize: '0.6rem',
                          marginLeft: '0.4rem' }}>●</span>}
                      </button>
                    </td>
                    <td style={{ padding: '0.7rem 0.5rem', fontFamily: T.mono,
                      fontSize: '0.65rem', color: T.mute }}>{fmtDate(v.date)}</td>
                    <td style={{ padding: '0.7rem 0' }}>
                      {v.pdfUrl
                        ? <button onClick={() => onPdfView(v)}
                            style={{ background: 'none', border: 'none',
                              fontFamily: T.mono, fontSize: '0.63rem', color: T.mute,
                              textDecoration: 'none', textTransform: 'uppercase',
                              borderBottom: `1px solid ${T.border}`, cursor: 'pointer',
                              padding: 0 }}>Baca ↗</button>
                        : <span style={{ color: T.border }}>—</span>}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </section>

          <section>
            <span style={S.label}>Changelog</span>
            {versions.map(v => (
              <div key={v.id} style={{ display: 'grid', gridTemplateColumns: '80px 1fr',
                gap: '0.8rem', padding: '0.8rem 0', borderBottom: `1px solid ${T.border}`,
                alignItems: 'baseline' }}>
                <span style={{ fontFamily: T.mono, fontSize: '0.68rem',
                  color: T.accent }}>v{v.version}</span>
                <span style={{ color: T.mute, fontSize: '0.9rem',
                  lineHeight: 1.7 }}>{v.summary}</span>
              </div>
            ))}
          </section>
        </div>
      )}

      <Rule />

      {/* About */}
      <section id="about" style={{ marginBottom: '5rem' }}>
        <h2 style={{ fontFamily: T.serif, fontSize: '1.4rem', fontWeight: 500,
          fontStyle: 'italic', color: T.text, marginBottom: '1.2rem' }}>
          Tentang Framework Ini
        </h2>
        <p style={{ color: T.mute, marginBottom: '1rem', fontSize: '0.97rem',
          lineHeight: 1.85 }}>
          PMN (Progressive Materialist Naturalism) adalah framework analitis yang
          memulai dari kondisi biologis — bukan dari produksi historis maupun
          kesadaran — sebagai fondasi untuk memahami bagaimana masyarakat, institusi,
          dan sistem kekuasaan terbentuk.
        </p>
        <p style={{ color: T.mute, fontSize: '0.97rem', lineHeight: 1.85,
          marginBottom: '1rem' }}>
          Framework (Adaptive Naturalism) adalah metodologinya.
          Doktrin (Progressive Materialist Naturalism) adalah aplikasinya
          pada kondisi saat ini. Keduanya terbuka untuk revisi.
        </p>
        <p style={{ color: T.mute, fontSize: '0.97rem', lineHeight: 1.85,
          fontStyle: 'italic' }}>
          "Dokumen ini adalah dokumen pertama, bukan sistem yang sudah selesai."
        </p>
      </section>
    </div>
  )
}

// ─── Public: Version Detail ───────────────────────────────────────────────────
function VersionDetail({ version, versions, onBack, onView, onPdfView }) {
  const idx  = versions.findIndex(v => v.id === version.id)
  const prev = versions[idx + 1]
  const next = versions[idx - 1]

  return (
    <div style={{ maxWidth: 700, margin: '0 auto', padding: '0 2rem' }}>
      <section style={{ padding: '4rem 0 3rem' }}>
        <button onClick={onBack}
          style={{ background: 'none', border: 'none', cursor: 'pointer',
            fontFamily: T.mono, fontSize: '0.62rem', letterSpacing: '0.15em',
            textTransform: 'uppercase', color: T.mute, marginBottom: '2.5rem',
            display: 'block', padding: 0 }}>
          ← Kembali
        </button>

        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem',
          flexWrap: 'wrap', marginBottom: '0.5rem' }}>
          <h1 style={{ fontFamily: T.serif, fontSize: '2.2rem', fontWeight: 500,
            color: T.text, margin: 0 }}>PMN v{version.version}</h1>
          {idx === 0 && <Tag>Terkini</Tag>}
        </div>

        <p style={{ fontFamily: T.mono, fontSize: '0.65rem', color: T.mute,
          marginBottom: '0.8rem' }}>{fmtDate(version.date)}</p>

        {version.subtitle && (
          <p style={{ fontFamily: T.serif, fontSize: '1.05rem', fontStyle: 'italic',
            color: T.mute, marginBottom: '1.5rem' }}>{version.subtitle}</p>
        )}

        <p style={{ color: T.mute, fontSize: '1rem', lineHeight: 1.85,
          marginBottom: '2rem', maxWidth: 560 }}>{version.summary}</p>

        <div style={{ display: 'flex', gap: '0.8rem', flexWrap: 'wrap',
          marginBottom: '3rem' }}>
          {version.pdfUrl && (
            <a href={version.pdfUrl} target="_blank" rel="noopener noreferrer"
              style={S.btn()}>
              <DownloadIcon /> Unduh PDF
            </a>
          )}
          {version.pdfUrl && (
            <button style={S.btn(T.surface, T.text)} onClick={() => onPdfView(version)}>
              Baca Online
            </button>
          )}
        </div>

        {version.changelog && (
          <>
            <Rule />
            <span style={S.label}>Perubahan di Versi Ini</span>
            <div style={{ color: T.mute, fontSize: '0.97rem', lineHeight: 1.85,
              whiteSpace: 'pre-wrap' }}>{version.changelog}</div>
          </>
        )}

        <Rule />

        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
          <div>
            {prev && (
              <button onClick={() => onView(prev)}
                style={{ background: 'none', border: 'none', cursor: 'pointer',
                  fontFamily: T.mono, fontSize: '0.63rem', letterSpacing: '0.12em',
                  textTransform: 'uppercase', color: T.mute, padding: 0 }}>
                ← v{prev.version}
              </button>
            )}
          </div>
          <div>
            {next && (
              <button onClick={() => onView(next)}
                style={{ background: 'none', border: 'none', cursor: 'pointer',
                  fontFamily: T.mono, fontSize: '0.63rem', letterSpacing: '0.12em',
                  textTransform: 'uppercase', color: T.mute, padding: 0 }}>
                v{next.version} →
              </button>
            )}
          </div>
        </div>
      </section>
    </div>
  )
}

// ─── Admin: Login ─────────────────────────────────────────────────────────────
function AdminLogin({ onLogin, onBack }) {
  const [user, setUser] = useState('')
  const [pass, setPass] = useState('')
  const [err, setErr]   = useState('')
  const isSetup = !loadCreds()

  function submit() {
    if (!user.trim() || !pass.trim()) { setErr('Username dan password wajib diisi.'); return }
    if (isSetup) { saveCreds({ user: user.trim(), pass }); onLogin() }
    else {
      const c = loadCreds()
      if (c?.user === user.trim() && c?.pass === pass) onLogin()
      else setErr('Username atau password salah.')
    }
  }

  return (
    <div style={{ maxWidth: 380, margin: '6rem auto', padding: '0 2rem' }}>
      <button onClick={onBack}
        style={{ background: 'none', border: 'none', cursor: 'pointer',
          fontFamily: T.mono, fontSize: '0.62rem', letterSpacing: '0.14em',
          textTransform: 'uppercase', color: T.mute, marginBottom: '2.5rem',
          display: 'block', padding: 0 }}>
        ← Kembali
      </button>
      <span style={S.label}>{isSetup ? 'Buat Akun Admin' : 'Login Admin'}</span>
      {isSetup && (
        <p style={{ color: T.mute, fontSize: '0.88rem', marginBottom: '1.5rem',
          lineHeight: 1.7 }}>
          Buat username dan password. Kredensial tersimpan di browser ini saja.
        </p>
      )}
      <input style={S.input} placeholder="Username" value={user}
        onChange={e => { setUser(e.target.value); setErr('') }}
        onKeyDown={e => e.key === 'Enter' && submit()} />
      <input style={S.input} type="password" placeholder="Password" value={pass}
        onChange={e => { setPass(e.target.value); setErr('') }}
        onKeyDown={e => e.key === 'Enter' && submit()} />
      {err && <p style={{ color: '#c0392b', fontFamily: T.mono, fontSize: '0.68rem',
        marginBottom: '1rem' }}>{err}</p>}
      <button style={{ ...S.btn(), width: '100%', justifyContent: 'center' }}
        onClick={submit}>
        {isSetup ? 'Buat & Masuk' : 'Masuk'}
      </button>
    </div>
  )
}

// ─── Admin: Dashboard ─────────────────────────────────────────────────────────
function AdminDashboard({ versions, onSave, onLogout }) {
  const [view, setView]     = useState('list')
  const [target, setTarget] = useState(null)
  const [toast, setToast]   = useState('')

  function showToast(msg) { setToast(msg); setTimeout(() => setToast(''), 3000) }

  function handleSave(data) {
    let updated
    if (target) updated = versions.map(v => v.id === target.id ? { ...v, ...data } : v)
    else updated = [{ id: Date.now().toString(), ...data }, ...versions]
    updated.sort((a, b) => parseFloat(b.version) - parseFloat(a.version))
    saveVersions(updated)
    onSave(updated)
    setView('list')
    showToast(target ? 'Versi diperbarui.' : 'Versi baru dipublikasikan.')
    setTarget(null)
  }

  function handleDelete(id) {
    if (!confirm('Hapus versi ini?')) return
    const updated = versions.filter(v => v.id !== id)
    saveVersions(updated)
    onSave(updated)
    showToast('Versi dihapus.')
  }

  return (
    <div>
      <div style={{ background: T.surface, borderBottom: `1px solid ${T.border}`,
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        padding: '0.85rem 2rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
          <span style={{ fontFamily: T.mono, fontSize: '0.6rem', letterSpacing: '0.2em',
            textTransform: 'uppercase', color: T.accent }}>PMN Admin Panel</span>
          {view !== 'list' && (
            <button onClick={() => { setView('list'); setTarget(null) }}
              style={{ background: 'none', border: 'none', cursor: 'pointer',
                fontFamily: T.mono, fontSize: '0.6rem', color: T.mute,
                letterSpacing: '0.12em', textTransform: 'uppercase' }}>
              ← Daftar Versi
            </button>
          )}
        </div>
        <button onClick={onLogout}
          style={{ background: 'none', border: 'none', cursor: 'pointer',
            fontFamily: T.mono, fontSize: '0.6rem', letterSpacing: '0.14em',
            textTransform: 'uppercase', color: T.mute }}>
          Keluar →
        </button>
      </div>

      <div style={{ maxWidth: 720, margin: '3rem auto', padding: '0 2rem' }}>
        {toast && (
          <div style={{ background: '#1a2e1a', color: '#6fcf97', padding: '0.65rem 1rem',
            fontFamily: T.mono, fontSize: '0.68rem', marginBottom: '1.5rem',
            border: '1px solid #2d6a4f' }}>{toast}</div>
        )}

        {view === 'list' && (
          <>
            <div style={{ display: 'flex', justifyContent: 'space-between',
              alignItems: 'center', marginBottom: '2rem' }}>
              <span style={S.label}>Semua Versi ({versions.length})</span>
              <button style={S.btn()} onClick={() => { setTarget(null); setView('add') }}>
                + Publikasikan Versi Baru
              </button>
            </div>
            {versions.length === 0 && (
              <div style={{ border: `1px solid ${T.border}`, padding: '2.5rem',
                color: T.mute, textAlign: 'center', fontStyle: 'italic' }}>
                Belum ada versi. Klik tombol di atas untuk memulai.
              </div>
            )}
            {versions.map((v, i) => (
              <div key={v.id} style={{ border: `1px solid ${T.border}`, background: T.card,
                padding: '1.6rem 2rem', marginBottom: '1rem',
                borderLeft: i === 0 ? `2px solid ${T.accent}` : `1px solid ${T.border}` }}>
                <div style={{ display: 'flex', justifyContent: 'space-between',
                  alignItems: 'flex-start', flexWrap: 'wrap', gap: '0.8rem' }}>
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.8rem',
                      flexWrap: 'wrap', marginBottom: '0.25rem' }}>
                      <span style={{ fontFamily: T.serif, fontSize: '1.2rem',
                        color: T.text }}>PMN v{v.version}</span>
                      {i === 0 && <Tag>Terkini</Tag>}
                      <span style={{ fontFamily: T.mono, fontSize: '0.63rem',
                        color: T.mute }}>{fmtDate(v.date)}</span>
                    </div>
                    {v.subtitle && (
                      <p style={{ fontStyle: 'italic', color: T.mute,
                        fontSize: '0.88rem', marginBottom: '0.4rem' }}>{v.subtitle}</p>
                    )}
                    <p style={{ color: T.mute, fontSize: '0.88rem',
                      lineHeight: 1.65 }}>{v.summary}</p>
                    {v.pdfUrl && (
                      <p style={{ fontFamily: T.mono, fontSize: '0.6rem', color: T.mute,
                        marginTop: '0.5rem', wordBreak: 'break-all' }}>
                        ↗ {v.pdfUrl.length > 60 ? v.pdfUrl.slice(0, 60) + '…' : v.pdfUrl}
                      </p>
                    )}
                  </div>
                  <div style={{ display: 'flex', gap: '0.5rem', flexShrink: 0 }}>
                    <button style={S.btn(T.surface, T.text)}
                      onClick={() => { setTarget(v); setView('edit') }}>Edit</button>
                    <button style={{ ...S.btn('#2a0e0e', '#e57373') }}
                      onClick={() => handleDelete(v.id)}>Hapus</button>
                  </div>
                </div>
              </div>
            ))}
          </>
        )}
        {(view === 'add' || view === 'edit') && (
          <VersionForm initial={target} onSave={handleSave}
            onCancel={() => { setView('list'); setTarget(null) }} />
        )}
      </div>
    </div>
  )
}

// ─── Admin: Form ──────────────────────────────────────────────────────────────
function VersionForm({ initial, onSave, onCancel }) {
  const [ver,  setVer]  = useState(initial?.version  || '')
  const [date, setDate] = useState(initial?.date?.slice(0, 10) || new Date().toISOString().slice(0, 10))
  const [sub,  setSub]  = useState(initial?.subtitle  || '')
  const [sum,  setSum]  = useState(initial?.summary   || '')
  const [log,  setLog]  = useState(initial?.changelog || '')
  const [pdf,  setPdf]  = useState(initial?.pdfUrl    || '')
  const [err,  setErr]  = useState('')

  function submit() {
    if (!ver.trim()) { setErr('Nomor versi wajib diisi.'); return }
    if (!sum.trim()) { setErr('Ringkasan wajib diisi.'); return }
    onSave({ version: ver.trim(), date, subtitle: sub.trim(),
             summary: sum.trim(), changelog: log.trim(), pdfUrl: pdf.trim() })
  }

  const lbl = { ...S.label, marginBottom: '0.35rem', display: 'block' }

  return (
    <div>
      <span style={S.label}>{initial ? `Edit PMN v${initial.version}` : 'Publikasikan Versi Baru'}</span>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
        <div>
          <label style={lbl}>Nomor Versi</label>
          <input style={S.input} placeholder="contoh: 36" value={ver}
            onChange={e => { setVer(e.target.value); setErr('') }} />
        </div>
        <div>
          <label style={lbl}>Tanggal Rilis</label>
          <input style={{ ...S.input, colorScheme: 'dark' }} type="date"
            value={date} onChange={e => setDate(e.target.value)} />
        </div>
      </div>
      <label style={lbl}>Subjudul (opsional)</label>
      <input style={S.input} placeholder="A Framework for Navigating Material Reality"
        value={sub} onChange={e => setSub(e.target.value)} />
      <label style={lbl}>Ringkasan Singkat</label>
      <textarea style={S.textarea}
        placeholder="Apa yang berubah di versi ini secara keseluruhan?"
        value={sum} onChange={e => { setSum(e.target.value); setErr('') }} />
      <label style={lbl}>Detail Changelog (opsional)</label>
      <textarea style={{ ...S.textarea, minHeight: 130 }}
        placeholder={"Contoh:\n- Tambah subbab 9.2c: AI dan Kekuasaan\n- Revisi Part VI\n- Koreksi bibliografi"}
        value={log} onChange={e => setLog(e.target.value)} />
      <label style={lbl}>URL PDF (Google Drive / Dropbox / dll)</label>
      <input style={S.input}
        placeholder="https://drive.google.com/file/d/..."
        value={pdf} onChange={e => setPdf(e.target.value)} />
      <p style={{ color: T.mute, fontSize: '0.82rem', marginBottom: '1.5rem', lineHeight: 1.7 }}>
        <strong style={{ color: T.text }}>Tip:</strong> Upload PDF ke Google Drive →
        klik kanan → Bagikan → "Siapa saja dengan link" → copy link.
        Preview otomatis akan muncul di halaman "Baca Online".
      </p>
      {err && <p style={{ color: '#c0392b', fontFamily: T.mono, fontSize: '0.68rem',
        marginBottom: '1rem' }}>{err}</p>}
      <div style={{ display: 'flex', gap: '0.8rem' }}>
        <button style={S.btn()} onClick={submit}>
          {initial ? 'Simpan Perubahan' : 'Publikasikan'}
        </button>
        <button style={S.btn(T.surface, T.text)} onClick={onCancel}>Batal</button>
      </div>
    </div>
  )
}

// ─── Root ─────────────────────────────────────────────────────────────────────
export default function App() {
  const [versions, setVersions] = useState(() => loadVersions())
  const [page, setPage]         = useState('public')
  const [detail, setDetail]     = useState(null)
  const [pdfVer, setPdfVer]     = useState(null)
  const [showToc, setShowToc]   = useState(false)

  const isPublic = page === 'public' || page === 'login'

  function goHome() { setPage('public'); setDetail(null); setPdfVer(null); setShowToc(false) }

  return (
    <div style={{ minHeight: '100vh', background: T.bg, color: T.text,
      fontFamily: T.serif, fontSize: 18, lineHeight: 1.75 }}>
      <style>{`
        * { box-sizing: border-box; margin: 0; padding: 0; }
        ::selection { background: #c9a84c33; }
        button:hover { opacity: 0.78; }
        input:focus, textarea:focus { border-color: ${T.accent} !important; outline: none; }
        input[type="date"]::-webkit-calendar-picker-indicator { filter: invert(0.6); }
      `}</style>

      <div style={S.topBar} />

      {/* Header */}
      {isPublic && (
        <header style={{ maxWidth: 900, margin: '0 auto', padding: '1.8rem 2rem 0',
          display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <button onClick={goHome}
            style={{ background: 'none', border: 'none', cursor: 'pointer',
              fontFamily: T.mono, fontSize: '0.68rem', letterSpacing: '0.18em',
              textTransform: 'uppercase', color: T.mute }}>
            PMN Framework
          </button>
          <div style={{ display: 'flex', gap: '1.5rem', alignItems: 'center' }}>
            <button onClick={() => { setShowToc(true); setDetail(null); setPdfVer(null) }}
              style={{ background: 'none', border: 'none', cursor: 'pointer',
                fontFamily: T.mono, fontSize: '0.65rem', letterSpacing: '0.12em',
                textTransform: 'uppercase', color: T.mute }}>
              Daftar Isi
            </button>
            <a href="#about"
              style={{ fontFamily: T.mono, fontSize: '0.65rem', letterSpacing: '0.12em',
                textTransform: 'uppercase', color: T.mute, textDecoration: 'none' }}>
              Tentang
            </a>
            <button onClick={() => setPage('login')}
              style={{ ...S.btn(T.surface, T.mute), border: `1px solid ${T.border}`,
                fontSize: '0.62rem' }}>
              Admin ↗
            </button>
          </div>
        </header>
      )}

      {/* Pages */}
      {page === 'public' && !detail && !pdfVer && !showToc &&
        <PublicHome versions={versions}
          onView={v => { setDetail(v); setPdfVer(null); setShowToc(false) }}
          onToc={() => { setShowToc(true); setDetail(null); setPdfVer(null) }}
          onPdfView={v => { setPdfVer(v); setDetail(null); setShowToc(false) }} />}

      {page === 'public' && showToc && !detail && !pdfVer &&
        <TableOfContents onBack={() => setShowToc(false)} />}

      {page === 'public' && pdfVer && !showToc &&
        <PdfViewer version={pdfVer} onBack={() => setPdfVer(null)} />}

      {page === 'public' && detail && !pdfVer && !showToc &&
        <VersionDetail version={detail} versions={versions}
          onBack={() => setDetail(null)}
          onView={v => setDetail(v)}
          onPdfView={v => { setPdfVer(v); setDetail(null) }} />}

      {page === 'login' &&
        <AdminLogin onLogin={() => setPage('admin')} onBack={() => setPage('public')} />}

      {page === 'admin' &&
        <AdminDashboard versions={versions} onSave={setVersions}
          onLogout={() => setPage('public')} />}

      {/* Footer */}
      {isPublic && !pdfVer && (
        <footer style={{ maxWidth: 900, margin: '0 auto',
          padding: '2rem 2rem 3rem', borderTop: `1px solid ${T.border}`,
          display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap',
          gap: '0.5rem' }}>
          <span style={{ fontFamily: T.mono, fontSize: '0.58rem', letterSpacing: '0.1em',
            textTransform: 'uppercase', color: T.mute }}>
            Progressive Materialist Naturalism · Nova Dharma · Semua Versi Diarsipkan
          </span>
          <span style={{ fontFamily: T.mono, fontSize: '0.58rem',
            color: T.mute }}>{new Date().getFullYear()}</span>
        </footer>
      )}
    </div>
  )
}
