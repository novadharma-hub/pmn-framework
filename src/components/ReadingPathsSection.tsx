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
    title: 'Epistemic Foundations & Realism',
    persona: 'Philosophers & Academic Researchers',
    badge: 'Foundations',
    estTime: '~40 min · 4 Modules',
    summary: 'Ground your inquiry in mind-independent material realism, physicalist limits, and the biological floor of suffering before engaging doctrine or applied cases.',
    leadPart: 'I',
    steps: [
      { id: '1.1', label: '§1.1 Ontological Realism', desc: 'Mind-independent physical reality as the primary ground.' },
      { id: '1.6', label: '§1.6 Epistemic Authority', desc: 'Rejection of revelation, theological dogma, and scholastic immunity.' },
      { id: '2.4', label: '§2.4 Layered Architecture', desc: 'Thermodynamic, structural, and agent tiers without reductive collapse.' },
      { id: '3.4', label: '§3.4 The Biological Floor', desc: 'Sentient vulnerability and non-negotiable suffering minimization.' },
    ],
  },
  {
    num: '02',
    title: 'Power Forensics & Anti-Capture',
    persona: 'Policy Analysts & Institutional Auditors',
    badge: 'Power & Institutions',
    estTime: '~50 min · 4 Modules',
    summary: 'Dissect how power entrenches, how information asymmetries are leveraged, and how protective institutions degenerate into predatory extraction apparatuses.',
    leadPart: 'VI',
    steps: [
      { id: '6.2', label: '§6.2 Resource Asymmetry', desc: 'Material disparities that construct uneven bargaining fields.' },
      { id: '7.1', label: '§7.1 Custodian Dilemma', desc: 'How protective stewardship mutates into self-preserving interest.' },
      { id: '7.3c-i', label: '§7.3 5-Stage Capture Cycle', desc: 'The canonical lifecycle sequence from protective mandate to predatory extraction.' },
      { id: '8.2', label: '§8.2 Narrative Inertia', desc: 'Ideological lag and false consciousness legitimizing status-quo capture.' },
    ],
  },
  {
    num: '03',
    title: 'Compressed Core (Fast-Track)',
    persona: 'Quick Readers & AI Context Briefing',
    badge: 'Compression',
    estTime: '~25 min · 4 Modules',
    summary: 'The most compressed formulation of PMN’s core thesis, diagnostic power mechanics, and materialist ethics in under thirty minutes.',
    steps: [
      { id: '15.15', label: '§15.15 Doctrinal Core', desc: 'The definitive, high-density summary of PMN metaphysics and ethics.' },
      { id: '1.6', label: '§1.6 Epistemic Anchor', desc: 'Empirical evidentiary standards and common-sense accountability.' },
      { id: '3.4', label: '§3.4 Physical Suffering', desc: 'The non-arbitrary biological floor of moral valuation.' },
      { id: '7.3', label: '§7.3 Institutional Diagnostic', desc: 'Methods for auditing custodian advantage and capture signatures.' },
    ],
  },
  {
    num: '04',
    title: 'Applied Ethics, Agency & Becoming',
    persona: 'Existential Readers & Ethical Practitioners',
    badge: 'Ethics & Agency',
    estTime: '~45 min · 4 Modules',
    summary: 'Move from the biological floor of suffering prevention toward the evaluative ceiling of human flourishing (genuine becoming) and historical praxis.',
    leadPart: 'XVII',
    steps: [
      { id: '3.4', label: '§3.4 Sentience & Pain', desc: 'The moral bedrock: unavoidable biological aversion to somatic trauma.' },
      { id: '5.1', label: '§5.1 Vector of Becoming', desc: 'Optimal developmental capacity expansion as the evaluative ceiling.' },
      { id: '17.1', label: '§17.1 Ethics in Historical Practice', desc: 'Moral action and systemic trade-offs under material resource constraints.' },
      { id: '18.2', label: '§18.2 Agentic Resilience', desc: 'Preserving individual integrity and navigating structural coercion.' },
    ],
  },
  {
    num: '05',
    title: 'Situation Diagnostics & Field Audit',
    persona: 'Systemic Reformers & Strategists',
    badge: 'Diagnostics',
    estTime: '~55 min · 4 Modules',
    summary: 'Deploy PMN analytical instruments to measure structural surplus extraction and formulate tactical interventions in real-world institutions.',
    leadPart: 'VII',
    steps: [
      { id: '2.4', label: '§2.4 3-Tier Analysis', desc: 'Separating thermodynamic limits, structural incentives, and individual agency.' },
      { id: '6.3', label: '§6.3 Transfer Formula T', desc: 'Quantifying surplus extraction via T = S · D · P · G.' },
      { id: '7.3', label: '§7.3 Capture Checklist', desc: 'Empirical audit indicators for institutional integrity degradation.' },
      { id: '11.2', label: '§11.2 Contestability Engineering', desc: 'Designing viable, low-cost institutional channels for dissent.' },
    ],
  },
  {
    num: '06',
    title: 'Economic Doctrine & Contestability',
    persona: 'Political Economists & Policy Designers',
    badge: 'Economics',
    estTime: '~45 min · 4 Modules',
    summary: 'Transcend ownership formalism toward contestable governance, surplus allocation auditing, and unconditional biological floor security.',
    leadPart: 'XI',
    steps: [
      { id: '11.1', label: '§11.1 Beyond Ownership', desc: 'Real power is determined by allocation control, not nominal title deeds.' },
      { id: '11.3', label: '§11.3 Accountability Diagnostics', desc: 'Mechanisms for surplus auditing and monopolistic capture restriction.' },
      { id: '11.5', label: '§11.5 Unconditional Living Floor', desc: 'Basic material security as an inalienable prerequisite for civic participation.' },
      { id: '12.1', label: '§12.1 Ecology & Thermodynamics', desc: 'Biospheric carrying capacity and thermodynamic limits on production.' },
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
      `# PMN Reading Syllabus: ${path.title} (${path.badge})`,
      `Target Persona: ${path.persona} | Estimated Time: ${path.estTime}`,
      `Overview: ${path.summary}`,
      '',
      '## Curated Module Sequence:',
      ...path.steps.map((s, i) => `${i + 1}. **${s.label}**: ${s.desc} [https://novadharma-hub.github.io/pmn-framework/#/s/${encodeURIComponent(s.id)}]`),
      '',
      '---',
      'Progressive Materialist Naturalism (PMN v118.6) — https://novadharma-hub.github.io/pmn-framework/'
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
          <span style={{display:'block', fontFamily:'var(--f-mono)', fontSize:'.68rem', letterSpacing:'.18em', textTransform:'uppercase', color:'var(--acc-text)', marginBottom:'.35rem'}}>
            ● GUIDED ONBOARDING &amp; PATHWAYS
          </span>
          <h2>Reading Paths</h2>
        </div>
        <p>
          Not every reader approaches PMN with the same inquiry. Choose a curated multi-step journey below to navigate according to your investigative agenda: foundations, power analysis, compression, or practical ethics.
        </p>
      </div>

      {/* META STATS BAR */}
      <div className="reading-paths-meta">
        <div className="reading-stat">
          <strong>Path Logic</strong>
          <span>Navigate by research task and persona, not by linear obligation.</span>
        </div>
        <div className="reading-stat">
          <strong>Fastest Route (25 Min)</strong>
          <span>Select Path 03 for compressed core doctrine (§15.15) before delving into architectural details.</span>
        </div>
        <div className="reading-stat">
          <strong>Progress Tracking</strong>
          <span>Milestone indicators update automatically as you mark sections read.</span>
        </div>
      </div>

      {/* GRID OF PATH CARDS */}
      <div className="reading-paths-grid">
        {READING_PATHS.map((path, idx) => {
          const progress = computePathProgress(path)
          return (
            <div 
              key={path.num} 
              className="path-card" 
              data-ghost={path.num}
            >
              {/* TOP ROW: Kicker + Badge + Est Time */}
              <div style={{display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'.8rem', flexWrap:'wrap', gap:'.5rem'}}>
                <span style={{fontFamily:'var(--f-mono)', fontSize:'.68rem', letterSpacing:'.16em', textTransform:'uppercase', color:'var(--acc-text)', fontWeight:700}}>
                  PATH {path.num} · {path.badge}
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
                Target: {path.persona}
              </div>

              {/* SUMMARY */}
              <p style={{fontFamily:'var(--f-body)', fontSize:'.88rem', lineHeight:1.6, color:'var(--ink2)', margin:'0 0 1.2rem 0', flex:1}}>
                {path.summary}
              </p>

              {/* STEP ROADMAP TAGS */}
              <div style={{marginBottom:'1.2rem', background:'var(--bg)', border:'1px solid var(--rule)', padding:'.8rem', borderRadius:'2px'}}>
                <div style={{fontFamily:'var(--f-mono)', fontSize:'.62rem', letterSpacing:'.12em', textTransform:'uppercase', color:'var(--mute)', marginBottom:'.5rem', display:'flex', justifyContent:'space-between'}}>
                  <span>Curated Module Sequence</span>
                  <span>Progress: {progress}%</span>
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
                    fontSize:'.68rem',
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
