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
  /** Perkiraan waktu saja; jumlah seksi dihitung dari steps (dulu ditulis
   *  tangan "4 Modules" di keenam jalur, padahal Path 04 berisi 3). */
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
  version?: string
}

// Label langkah = judul seksi sebenarnya (sebelum titik dua), 2026-09-24.
// Sebelumnya sebagian ditulis bebas dan keliru, mis. §11.1 berlabel
// "Beyond Ownership" (judul §11.5) dan §11.5 "Unconditional Living Floor".
const READING_PATHS: ReadingPath[] = [
  {
    num: '01',
    title: 'Epistemic Foundations & Realism',
    persona: 'Philosophers & Academic Researchers',
    badge: 'Foundations',
    estTime: '~40 min',
    summary: 'Ground your inquiry in mind-independent material realism, physicalist limits, and the biological floor of suffering before engaging doctrine or applied cases.',
    leadPart: 'I',
    steps: [
      { id: '2.1', label: '§2.1 Reality as Primary', desc: 'Mind-independent physical reality as the primary ground.' },
      { id: '1.9', label: '§1.9 Epistemic Authority', desc: 'Who gets believed without checking: epistemic authority as an unequally distributed material resource.' },
      { id: '2.4', label: '§2.4 Social Ontology', desc: 'Thermodynamic, structural, and agent tiers without reductive collapse.' },
      { id: '3.4', label: '§3.4 The Minimal Anchor', desc: 'Sentient vulnerability and non-negotiable suffering minimization.' },
    ],
  },
  {
    num: '02',
    title: 'Power Forensics & Anti-Capture',
    persona: 'Policy Analysts & Institutional Auditors',
    badge: 'Power & Institutions',
    estTime: '~50 min',
    summary: 'Dissect how power entrenches, how information asymmetries are leveraged, and how protective institutions degenerate into predatory extraction apparatuses.',
    leadPart: 'VI',
    steps: [
      { id: '6.2', label: '§6.2 Power as Structural Position', desc: 'Material disparities that construct uneven bargaining fields.' },
      { id: '7.3', label: '§7.3 The Custodian Problem', desc: 'How protective stewardship mutates into self-preserving interest.' },
      { id: '7.3c-i', label: '§7.3c-i A General Theory of Capture', desc: 'The canonical account of capture: mechanism, stages, and detection.' },
      { id: '8.4b', label: '§8.4b Narrative Typology', desc: 'How governing narratives structure political time and what populations can perceive as possible.' },
    ],
  },
  {
    num: '03',
    title: 'Compressed Core (Fast-Track)',
    persona: 'Quick Readers & AI Context Briefing',
    badge: 'Compression',
    estTime: '~25 min',
    summary: 'The most compressed formulation of PMN’s core thesis, diagnostic power mechanics, and materialist ethics in under thirty minutes.',
    steps: [
      { id: '15.15', label: '§15.15 The Compressed Core', desc: 'The definitive, high-density summary of PMN metaphysics and ethics.' },
      { id: '1.9', label: '§1.9 Epistemic Authority', desc: 'How claims acquire social standing, and why that standing is a resource distributed unequally.' },
      { id: '3.4', label: '§3.4 The Minimal Anchor', desc: 'The non-arbitrary biological floor of moral valuation.' },
      { id: '7.3', label: '§7.3 The Custodian Problem', desc: 'Methods for auditing custodian advantage and capture signatures.' },
    ],
  },
  {
    num: '04',
    title: 'Applied Ethics, Agency & Becoming',
    persona: 'Existential Readers & Ethical Practitioners',
    badge: 'Ethics & Agency',
    estTime: '~45 min',
    summary: 'Move from the biological floor of suffering prevention toward the evaluative ceiling of human flourishing (genuine becoming) and historical praxis.',
    leadPart: 'XVII',
    steps: [
      { id: '3.4', label: '§3.4 The Minimal Anchor', desc: 'The minimal anchor: reducing structural suffering, and why the floor is not arbitrary.' },
      { id: '4.5', label: '§4.5 The Anti-Foreclosure Criterion', desc: 'Optimal developmental capacity expansion as the evaluative ceiling.' },
      { id: '17.1', label: '§17.1 The Prohibition Case', desc: 'Moral action and systemic trade-offs under material resource constraints.' },
    ],
  },
  {
    num: '05',
    title: 'Situation Diagnostics & Field Audit',
    persona: 'Systemic Reformers & Strategists',
    badge: 'Diagnostics',
    estTime: '~55 min',
    summary: 'Deploy PMN analytical instruments to measure transformation pressure and formulate tactical interventions in real-world institutions.',
    leadPart: 'VII',
    steps: [
      { id: '2.4', label: '§2.4 Social Ontology', desc: 'Separating thermodynamic limits, structural incentives, and individual agency.' },
      { id: '15.2', label: '§15.2 The Primary Formula', desc: 'The net force pushing a system toward reorganization: T = S × D × P × G.' },
      { id: '7.3', label: '§7.3 The Custodian Problem', desc: 'Empirical audit indicators for institutional integrity degradation.' },
      { id: '11.0', label: '§11.0 Two Levels of Economic Analysis', desc: 'Keeps two levels apart: the questions any economic analysis must ask, and PMN\'s own economic doctrine.' },
    ],
  },
  {
    num: '06',
    title: 'Economic Doctrine & Contestability',
    persona: 'Political Economists & Policy Designers',
    badge: 'Economics',
    estTime: '~45 min',
    summary: 'Transcend ownership formalism toward contestable governance, surplus allocation auditing, and unconditional biological floor security.',
    leadPart: 'XI',
    steps: [
      { id: '11.1', label: '§11.1 Economics Without Prior Commitments', desc: 'Economic systems are tools; which works is an empirical question, not a prior commitment.' },
      { id: '11.3', label: '§11.3 Horizon and Instrument', desc: 'The horizon the minimal anchor points toward, versus the instruments that move toward it now.' },
      { id: '11.5', label: '§11.5 Power Beyond Ownership', desc: 'Power that does not come from ownership: expertise, information, and network effects.' },
      { id: '3.10', label: '§3.10 Ecological Constraints', desc: 'Biospheric carrying capacity and thermodynamic limits on production.' },
    ],
  },
]

export default function ReadingPathsSection({ data, readMap, onJump, onStartReading, version = '120' }: ReadingPathsSectionProps) {
  const [selectedPath, setSelectedPath] = useState<ReadingPath | null>(null)
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null)

  const jumpToSectionId = (secId: string) => {
    if (!data) {
      onStartReading()
      return
    }
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
      `# PMN Reading Syllabus: ${path.title} (${path.badge})`,
      `Target Persona: ${path.persona} | Estimated Time: ${path.estTime} · ${path.steps.length} sections`,
      `Overview: ${path.summary}`,
      '',
      '## Curated Module Sequence:',
      ...path.steps.map((s, i) => `${i + 1}. **${s.label}**: ${s.desc} [https://novadharma-hub.github.io/pmn-framework/#/s/${encodeURIComponent(s.id)}]`),
      '',
      '---',
      `Progressive Materialist Naturalism (PMN v${version}) — https://novadharma-hub.github.io/pmn-framework/`
    ].join('\n')

    navigator.clipboard.writeText(text).then(() => {
      setCopiedIndex(idx)
      setTimeout(() => setCopiedIndex(null), 2500)
    }).catch(() => {
      window.prompt('Copy Syllabus Manually:', text)
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
    <div className="reading-paths">
      {/* HEADER */}
      <div className="reading-paths-hdr">
        <div>
          <span style={{display:'block', fontFamily:'var(--f-mono)', fontSize:'.75rem', letterSpacing:'.18em', textTransform:'uppercase', color:'var(--acc-text)', marginBottom:'.35rem'}}>
            ● GUIDED ONBOARDING &amp; PATHWAYS
          </span>
          <h2>Reading Paths</h2>
        </div>
        <p>
          Six short routes into the text, by what you came looking for. In a hurry? Path 03 gives the compressed core (§15.15) in about 25 minutes. Progress fills in as you mark sections read.
        </p>
      </div>

      {/* GRID OF PATH CARDS */}
      <div className="reading-paths-grid">
        {READING_PATHS.map((path, idx) => {
          const progress = computePathProgress(path)
          return (
            <div 
              key={path.num} 
              className="path-card"
            >
              {/* TOP ROW: Kicker + Badge + Est Time */}
              <div style={{display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'.8rem', flexWrap:'wrap', gap:'.5rem'}}>
                <span style={{fontFamily:'var(--f-mono)', fontSize:'.75rem', letterSpacing:'.16em', textTransform:'uppercase', color:'var(--acc-text)', fontWeight:700}}>
                  PATH {path.num} · {path.badge}
                </span>
                <span style={{fontFamily:'var(--f-mono)', fontSize:'.75rem', color:'var(--mute)', background:'var(--bg)', border:'1px solid var(--rule)', padding:'.2rem .5rem'}}>
                  {path.estTime} &middot; {path.steps.length} {path.steps.length === 1 ? 'section' : 'sections'}
                </span>
              </div>

              {/* TITLE & PERSONA */}
              <h3 style={{fontFamily:'var(--f-head)', fontSize:'1.22rem', color:'var(--ink)', margin:'0 0 .3rem 0', lineHeight:1.25}}>
                {path.title}
              </h3>
              <div style={{fontFamily:'var(--f-mono)', fontSize:'.75rem', color:'var(--mute)', textTransform:'uppercase', letterSpacing:'.08em', marginBottom:'.8rem'}}>
                Target: {path.persona}
              </div>

              {/* SUMMARY */}
              <p style={{fontFamily:'var(--f-body)', fontSize:'.88rem', lineHeight:1.6, color:'var(--ink2)', margin:'0 0 1.2rem 0', flex:1}}>
                {path.summary}
              </p>

              {/* LANGKAH: dulu chip berisi nomor seksi saja ("2.1", "1.9"), yang
                  tak berarti apa-apa tanpa judul. Kini daftar berjudul, dilipat. */}
              <div className="path-progress" aria-hidden="true">
                <div style={{width:`${progress}%`}} />
              </div>
              <details className="path-steps">
                <summary>
                  {path.steps.length} sections &middot; {progress}% read
                </summary>
                <ol>
                  {path.steps.map(step => (
                    <li key={step.id}>
                      <button type="button" onClick={() => jumpToSectionId(step.id)}>
                        {step.label}
                      </button>
                    </li>
                  ))}
                </ol>
              </details>

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
                    fontSize:'.75rem',
                    letterSpacing:'.12em',
                    textTransform:'uppercase',
                    padding:'.65rem .8rem',
                    cursor:'pointer',
                    fontWeight:700
                  }}
                >
                  Start Step 1 ({path.steps[0].id}) &rarr;
                </button>

                <button
                  onClick={() => handleCopySyllabus(path, idx)}
                  title="Copy this reading syllabus as Markdown"
                  style={{
                    flex:1,
                    background:'transparent',
                    color:'var(--ink2)',
                    border:'1px solid var(--rule)',
                    fontFamily:'var(--f-mono)',
                    fontSize:'.75rem',
                    letterSpacing:'.08em',
                    textTransform:'uppercase',
                    padding:'.65rem .5rem',
                    cursor:'pointer'
                  }}
                >
                  {copiedIndex === idx ? '✓ Copied!' : 'Syllabus 📋'}
                </button>
              </div>

            </div>
          )
        })}
      </div>
    </div>
  )
}
