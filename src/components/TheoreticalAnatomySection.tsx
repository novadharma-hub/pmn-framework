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
      title: 'Material Ground & Biological Constraints',
      scope: 'Parts I through IV',
      anchorSec: '3.4',
      badge: 'Bedrock / Physical Constraints',
      principle: 'Mind-independent physical reality is primary. Sentient biological suffering is an undeniable material fact that any coherent moral architecture must minimize.',
      mechanics: [
        'Thermodynamic laws and biospheric carrying capacity constraints.',
        'Somatic vulnerability: pain, starvation, and mortality as non-arbitrary evaluative anchors.',
        'Rejection of radical idealism: material conditions always precede and constrain consciousness.',
      ],
      keySections: [
        { id: '1.1', title: 'Ontological Realism' },
        { id: '1.6', title: 'Epistemic Authority' },
        { id: '2.4', title: 'Non-Reductive Layered Architecture' },
        { id: '3.4', title: 'The Biological Floor of Suffering' },
      ],
    },
    {
      id: 2,
      title: 'Institutional Force Fields & Structural Power',
      scope: 'Parts VI through XII',
      anchorSec: '7.3c-i',
      badge: 'Architecture / Incentive Fields',
      principle: 'Protective institutions systematically degenerate into predatory extraction mechanisms due to information asymmetries and custodian entrenchment.',
      mechanics: [
        'Structural forces operate above and beyond the subjective moral intent of individual officeholders.',
        'Multiplicative surplus transfer equation: T = S · D · P · G.',
        'Narrative inertia and ideological lag justifying constituent compliance.',
      ],
      keySections: [
        { id: '6.2', title: 'Resource & Capacity Asymmetry' },
        { id: '7.1', title: 'The Custodian Dilemma' },
        { id: '7.3c-i', title: '5-Stage Capture Lifecycle' },
        { id: '11.2', title: 'Universal Contestability Engineering' },
      ],
    },
    {
      id: 3,
      title: 'Genuine Becoming & Subjective Agency',
      scope: 'Parts V, XVII through XXI',
      anchorSec: '5.1',
      badge: 'Horizon / Human Potential',
      principle: 'The expansion of developmental capacity (genuine becoming) is the highest evaluative vector, contingent upon securing the biological floor beneath it.',
      mechanics: [
        'Rejection of fatalistic determinism: individuals possess navigational agency within structural bounds.',
        'Materialist praxis: active commitment to minimizing structural suffering for vulnerable others.',
        'Institutional reconstruction through coordinated dissent and counter-design.',
      ],
      keySections: [
        { id: '5.1', title: 'Evaluation of Genuine Becoming' },
        { id: '17.1', title: 'Ethics in Historical Situations' },
        { id: '18.2', title: 'Autonomous Agentic Integrity' },
        { id: '20.1', title: 'Prospects for Systemic Transformation' },
      ],
    },
  ]

  // 2. DATA: Transfer Formula Variables
  const FORMULA_VARS = {
    S: {
      symbol: 'S',
      name: 'Scale & Capacity Asymmetry',
      anchor: '6.2',
      def: 'The disparity in material resources, technological leverage, and organizational capacity between incumbent custodians and constituents.',
      fieldTest: 'Do constituents possess equivalent capacity to independently verify or counter custodian decisions?',
      counterMeasure: 'Audit capacity decentralization, independent constituent federations, and open machine-auditable public repositories.',
    },
    D: {
      symbol: 'D',
      name: 'Duration of Unrotated Tenure',
      anchor: '7.1',
      def: 'Prolonged tenure without mandatory rotation, enabling patronage crystallization and internal interest entrenchment.',
      fieldTest: 'How long have incumbent decision-makers held office without binding external audits?',
      counterMeasure: 'Term limits, staggered lot-based rotation, and mandatory external citizen audits.',
    },
    P: {
      symbol: 'P',
      name: 'Exit Penalty (Cost of Non-Compliance)',
      anchor: '6.4',
      def: 'The material, legal, or social damage a constituent incurs when attempting to exit the system or contest authority.',
      fieldTest: 'If a member rejects an extractive directive, do they lose access to their fundamental living necessities?',
      counterMeasure: 'Unconditional living floor guarantee (§11.5) independent of organizational loyalty, and safe exit rights without penalization.',
    },
    G: {
      symbol: 'G',
      name: 'Governance Opacity (Information Asymmetry)',
      anchor: '7.3',
      def: 'The degree of procedural secrecy, bureaucratic obfuscation, and verification monopolization held by inner custodian circles.',
      fieldTest: 'How accessible and comprehensible are transaction records and policy deliberation minutes to ordinary citizens?',
      counterMeasure: 'Radical procedural transparency, machine-auditable public ledgers, and robust whistleblower safeguards.',
    },
  }

  // 3. DATA: 5 Capture Stages
  const CAPTURE_STAGES = [
    {
      num: '01',
      title: 'Initial Protective Mandate',
      anchor: '7.3',
      subtitle: 'Chartered Protection for Shared Vulnerabilities',
      symptoms: 'Focus on safeguarding constituents from shared existential threats (famine, external predation, disorder). The relationship between custodians and constituents is functional and high-trust.',
      indicators: 'High civic legitimacy, lean operational structure, direct communication, voluntary compliance driven by demonstrable shared benefit.',
      remedy: 'Lock in sunset clauses, universal contestability protocols (§11.2), and radical transparency requirements from day one of institutional creation.',
    },
    {
      num: '02',
      title: 'Custodian Entrenchment',
      anchor: '7.3',
      subtitle: 'Bureaucratic Specialization & Emergent Internal Interests',
      symptoms: 'Administrators segregate into a distinct professional class. Institutional survival and internal staff perks begin to take precedence over the founding charter.',
      indicators: 'Growth of exclusive executive allowances, budget disproportionately diverted toward institutional PR and brand defense over direct constituent protection.',
      remedy: 'Enforce mandatory term limits, lot-based rotational leadership, and independent citizen inspection panels selected at random.',
    },
    {
      num: '03',
      title: 'Information Asymmetry Accumulation',
      anchor: '7.3',
      subtitle: 'Archival Monopoly, Secrecy & Technical Complexity',
      symptoms: 'Custodians claim institutional operations are "too technically complex and sensitive" for public scrutiny. Performance reporting is curated selectively.',
      indicators: 'External audits denied under the pretext of operational secrecy; informed public critique dismissed as unprofessional or uncredentialed.',
      remedy: 'Institutionalize radical open data: all deliberative minutes, fiscal transfers, and decision trees must be published to machine-readable public repositories.',
    },
    {
      num: '04',
      title: 'Extraction Normalization & Ideological Defense',
      anchor: '7.3c-i',
      subtitle: 'Public Surplus Diverted to Preserve Incumbent Power',
      symptoms: 'Structural extraction is rationalized as "the necessary sacrifice for collective stability." Moralistic rhetoric is deployed to silence constituent dissent.',
      indicators: 'Criminalization or stigmatization of whistleblowers and critics; permanent invocation of emergency states to suspend normal accountability.',
      remedy: 'Organized civil non-cooperation, selective withdrawal of compliance, and constructing independent parallel institutions.',
    },
    {
      num: '05',
      title: 'Systemic Rigidity & Catastrophic Capture',
      anchor: '7.3c-i',
      subtitle: 'Institutions Predate Upon the Constituents They Were Chartered to Protect',
      symptoms: 'The institution operates strictly as an extractive instrument for incumbent factions. Internal correction is impossible absent massive external shock.',
      indicators: 'Functional collapse, compliance enforced purely through coercive threats or economic denial, mass constituent flight and loss of legitimacy.',
      remedy: 'Radical delegitimation and dismantling; material reconstruction from below based on newly forged, verifiable constitutional charters.',
    },
  ]

  return (
    <div className="anatomy-section" style={{padding:'4rem 2.5rem', background:'var(--bg2)', borderTop:'1px solid var(--rule)'}}>
      <div className="anatomy-section-inner" style={{maxWidth:1080, margin:'0 auto'}}>

        {/* HEADER */}
        <div className="anatomy-section-hdr" style={{display:'flex', justifyContent:'space-between', alignItems:'flex-end', flexWrap:'wrap', gap:'1.5rem', marginBottom:'2rem', borderBottom:'1px solid var(--rule)', paddingBottom:'1.5rem'}}>
          <div>
            <div style={{fontFamily:'var(--f-mono)', fontSize:'.68rem', letterSpacing:'.18em', textTransform:'uppercase', color:'var(--acc-text)', marginBottom:'.35rem'}}>
              ● PMN STRUCTURAL MECHANICS
            </div>
            <h2 style={{fontFamily:'var(--f-head)', fontSize:'clamp(1.8rem, 3.5vw, 2.4rem)', color:'var(--ink)', margin:0}}>
              Theoretical Anatomy &amp; Causal Engine
            </h2>
          </div>
          <div style={{fontFamily:'var(--f-mono)', fontSize:'.68rem', color:'var(--mute)', background:'var(--bg)', border:'1px solid var(--rule)', padding:'.4rem .75rem', textTransform:'uppercase', letterSpacing:'.1em'}}>
            Engine Status: Verified v118.6 Canonical
          </div>
        </div>

        {/* MODE SELECTOR TABS */}
        <div style={{display:'flex', flexWrap:'wrap', gap:'.5rem', marginBottom:'2rem'}}>
          {[
            { id: 'layers', label: '1. 3-Layer Analytical Stack' },
            { id: 'formula', label: '2. Power Transfer Formula (T = S · D · P · G)' },
            { id: 'capture', label: '3. 5-Stage Institutional Capture (§7.3)' },
            { id: 'parts', label: '4. Module Directory (Parts I–XXI)' },
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveMode(tab.id as AnatomyMode)}
              style={{
                fontFamily:'var(--f-mono)',
                fontSize:'.72rem',
                letterSpacing:'.08em',
                textTransform:'uppercase',
                padding:'.6rem 1rem',
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

        {/* PANEL 1: 3-LAYER ANALYTICAL STACK */}
        {activeMode === 'layers' && (
          <div style={{background:'var(--bg)', border:'1px solid var(--rule)', padding:'2rem', boxShadow:'8px 8px 0 rgba(0,0,0,0.05)'}}>
            <div style={{display:'grid', gridTemplateColumns:'repeat(auto-fit, minmax(260px, 1fr))', gap:'1.2rem', marginBottom:'2rem'}}>
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
                      LAYER {layer.id}
                    </span>
                    <span style={{fontFamily:'var(--f-mono)', fontSize:'.62rem', color:'var(--mute)', background:'var(--bg)', border:'1px solid var(--rule)', padding:'.15rem .4rem'}}>
                      {layer.badge}
                    </span>
                  </div>
                  <h4 style={{fontFamily:'var(--f-head)', fontSize:'1.12rem', color:'var(--ink)', margin:'0 0 .4rem 0'}}>
                    {layer.title}
                  </h4>
                  <div style={{fontFamily:'var(--f-mono)', fontSize:'.68rem', color:'var(--mute)', textTransform:'uppercase'}}>
                    Scope: {layer.scope}
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
                      OPERATIONAL PRINCIPLE &mdash; LAYER {LAYERS[selectedLayer].id}
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
                    Open Anchor Section (§{LAYERS[selectedLayer].anchorSec}) &rarr;
                  </button>
                </div>

                <p style={{fontFamily:'var(--f-body)', fontSize:'1.02rem', lineHeight:1.7, color:'var(--ink)', fontStyle:'italic', marginBottom:'1.5rem'}}>
                  &ldquo;{LAYERS[selectedLayer].principle}&rdquo;
                </p>

                <div style={{display:'grid', gridTemplateColumns:'repeat(auto-fit, minmax(280px, 1fr))', gap:'1.5rem', marginBottom:'1.5rem'}}>
                  <div style={{background:'var(--bg2)', border:'1px solid var(--rule)', padding:'1.2rem'}}>
                    <div style={{fontFamily:'var(--f-mono)', fontSize:'.68rem', letterSpacing:'.12em', textTransform:'uppercase', color:'var(--mute)', marginBottom:'.8rem'}}>
                      Primary Causal Mechanisms:
                    </div>
                    <ul style={{margin:0, paddingLeft:'1.2rem', fontFamily:'var(--f-body)', fontSize:'.9rem', color:'var(--ink2)', lineHeight:1.65}}>
                      {LAYERS[selectedLayer].mechanics.map((m, i) => (
                        <li key={i} style={{marginBottom:'.4rem'}}>{m}</li>
                      ))}
                    </ul>
                  </div>

                  <div style={{background:'var(--bg2)', border:'1px solid var(--rule)', padding:'1.2rem'}}>
                    <div style={{fontFamily:'var(--f-mono)', fontSize:'.68rem', letterSpacing:'.12em', textTransform:'uppercase', color:'var(--mute)', marginBottom:'.8rem'}}>
                      Key Analytical Sections:
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
                  <span style={{color:'var(--acc-text)', fontWeight:700}}>● CAUSAL FLOW:</span>
                  <span>Material Bedrock (Physical Limits)</span>
                  <span>&rarr;</span>
                  <span>Institutional Field (Incentives &amp; Law)</span>
                  <span>&rarr;</span>
                  <span>Subjective Agency (Becoming &amp; Praxis)</span>
                </div>
              </div>
            )}
          </div>
        )}

        {/* PANEL 2: TRANSFER FORMULA (T = S · D · P · G) */}
        {activeMode === 'formula' && (
          <div style={{background:'var(--bg)', border:'1px solid var(--rule)', padding:'2rem', boxShadow:'8px 8px 0 rgba(0,0,0,0.05)'}}>
            <div style={{textAlign:'center', padding:'1.8rem 1rem', background:'var(--bg2)', border:'1px solid var(--rule)', marginBottom:'2rem'}}>
              <div style={{fontFamily:'var(--f-mono)', fontSize:'.68rem', letterSpacing:'.2em', textTransform:'uppercase', color:'var(--mute)', marginBottom:'.6rem'}}>
                STRUCTURAL SURPLUS TRANSFER EQUATION (PMN §6.3, §11.3)
              </div>
              <div style={{fontFamily:'var(--f-head)', fontSize:'clamp(2.2rem, 5vw, 3.4rem)', color:'var(--acc-text)', letterSpacing:'.1em', margin:'0 0 .6rem 0'}}>
                T = S &middot; D &middot; P &middot; G
              </div>
              <p style={{fontFamily:'var(--f-body)', fontSize:'.95rem', color:'var(--ink2)', maxWidth:'640px', margin:'0 auto', lineHeight:1.65}}>
                The magnitude of structural surplus extraction (<strong style={{color:'var(--ink)'}}>T</strong>) scales multiplicatively with scale asymmetry (<strong style={{color:'var(--ink)'}}>S</strong>), unrotated duration of tenure (<strong style={{color:'var(--ink)'}}>D</strong>), exit penalties for constituents (<strong style={{color:'var(--ink)'}}>P</strong>), and opacity of governance/verification (<strong style={{color:'var(--ink)'}}>G</strong>).
              </p>
            </div>

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

            {FORMULA_VARS[selectedVar] && (
              <div style={{border:'1px solid var(--rule)', background:'var(--bg2)', padding:'1.6rem', borderRadius:'2px'}}>
                <div style={{display:'flex', justifyContent:'space-between', alignItems:'center', flexWrap:'wrap', gap:'1rem', marginBottom:'1rem', borderBottom:'1px solid var(--rule)', paddingBottom:'.8rem'}}>
                  <div>
                    <span style={{fontFamily:'var(--f-mono)', fontSize:'.68rem', letterSpacing:'.12em', textTransform:'uppercase', color:'var(--acc-text)'}}>
                      VARIABLE {selectedVar} &mdash; DIAGNOSTIC ANALYSIS
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
                    Open Foundation in §{FORMULA_VARS[selectedVar].anchor} &rarr;
                  </button>
                </div>

                <div style={{display:'grid', gridTemplateColumns:'repeat(auto-fit, minmax(280px, 1fr))', gap:'1.2rem'}}>
                  <div>
                    <strong style={{display:'block', fontFamily:'var(--f-mono)', fontSize:'.68rem', letterSpacing:'.1em', textTransform:'uppercase', color:'var(--mute)', marginBottom:'.4rem'}}>
                      Formal Definition:
                    </strong>
                    <p style={{fontFamily:'var(--f-body)', fontSize:'.92rem', lineHeight:1.65, color:'var(--ink)', margin:0}}>
                      {FORMULA_VARS[selectedVar].def}
                    </p>
                  </div>

                  <div>
                    <strong style={{display:'block', fontFamily:'var(--f-mono)', fontSize:'.68rem', letterSpacing:'.1em', textTransform:'uppercase', color:'var(--mute)', marginBottom:'.4rem'}}>
                      Empirical Field Test:
                    </strong>
                    <p style={{fontFamily:'var(--f-body)', fontSize:'.92rem', lineHeight:1.65, color:'var(--ink2)', margin:0, fontStyle:'italic'}}>
                      &ldquo;{FORMULA_VARS[selectedVar].fieldTest}&rdquo;
                    </p>
                  </div>

                  <div style={{gridColumn:'1 / -1', background:'var(--bg)', border:'1px solid var(--rule)', padding:'1rem 1.2rem', marginTop:'.5rem'}}>
                    <strong style={{display:'block', fontFamily:'var(--f-mono)', fontSize:'.68rem', letterSpacing:'.1em', textTransform:'uppercase', color:'var(--acc-text)', marginBottom:'.4rem'}}>
                      PMN Counter-Measures &amp; Reform Protocols:
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

        {/* PANEL 3: 5-STAGE CAPTURE SEQUENCE (§7.3c-i) */}
        {activeMode === 'capture' && (
          <div style={{background:'var(--bg)', border:'1px solid var(--rule)', padding:'2rem', boxShadow:'8px 8px 0 rgba(0,0,0,0.05)'}}>
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
                    STAGE {stg.num}
                  </div>
                  <div style={{fontFamily:'var(--f-head)', fontSize:'.82rem', color:'var(--ink)', lineHeight:1.2}}>
                    {stg.title}
                  </div>
                </button>
              ))}
            </div>

            {CAPTURE_STAGES[selectedStage] && (
              <div style={{border:'1px solid var(--rule)', background:'var(--bg2)', padding:'1.8rem', borderRadius:'2px'}}>
                <div style={{display:'flex', justifyContent:'space-between', alignItems:'baseline', flexWrap:'wrap', gap:'1rem', marginBottom:'1.2rem', borderBottom:'1px solid var(--rule)', paddingBottom:'1rem'}}>
                  <div>
                    <span style={{fontFamily:'var(--f-mono)', fontSize:'.68rem', letterSpacing:'.14em', textTransform:'uppercase', color:'var(--acc-text)'}}>
                      INSTITUTIONAL DEGENERATION &mdash; STAGE {CAPTURE_STAGES[selectedStage].num}
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
                    Open Section (§{CAPTURE_STAGES[selectedStage].anchor}) &rarr;
                  </button>
                </div>

                <div style={{display:'grid', gridTemplateColumns:'repeat(auto-fit, minmax(280px, 1fr))', gap:'1.4rem'}}>
                  <div style={{background:'var(--bg)', border:'1px solid var(--rule)', padding:'1.2rem'}}>
                    <strong style={{display:'block', fontFamily:'var(--f-mono)', fontSize:'.68rem', letterSpacing:'.1em', textTransform:'uppercase', color:'var(--mute)', marginBottom:'.5rem'}}>
                      Clinical Symptoms &amp; Manifestations:
                    </strong>
                    <p style={{fontFamily:'var(--f-body)', fontSize:'.92rem', lineHeight:1.68, color:'var(--ink)', margin:0}}>
                      {CAPTURE_STAGES[selectedStage].symptoms}
                    </p>
                  </div>

                  <div style={{background:'var(--bg)', border:'1px solid var(--rule)', padding:'1.2rem'}}>
                    <strong style={{display:'block', fontFamily:'var(--f-mono)', fontSize:'.68rem', letterSpacing:'.1em', textTransform:'uppercase', color:'var(--mute)', marginBottom:'.5rem'}}>
                      Empirical Field Indicators:
                    </strong>
                    <p style={{fontFamily:'var(--f-body)', fontSize:'.92rem', lineHeight:1.68, color:'var(--ink2)', margin:0}}>
                      {CAPTURE_STAGES[selectedStage].indicators}
                    </p>
                  </div>

                  <div style={{gridColumn:'1 / -1', background:'var(--bg)', border:'1px solid var(--rule)', padding:'1.2rem'}}>
                    <strong style={{display:'block', fontFamily:'var(--f-mono)', fontSize:'.68rem', letterSpacing:'.1em', textTransform:'uppercase', color:'var(--acc-text)', marginBottom:'.5rem'}}>
                      PMN Counter-Measures &amp; Anti-Capture Protocols:
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

        {/* PANEL 4: PART DIRECTORY (Part I - XXI) */}
        {activeMode === 'parts' && (
          <div className="anatomy-terminal" style={{display:'grid', gridTemplateColumns:'minmax(220px, 280px) 1fr', border:'1px solid var(--rule)', background:'var(--bg)', minHeight:'520px', boxShadow:'12px 12px 0 rgba(0,0,0,0.05)'}}>
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
                      : `This part contains ${currentPart.subs?.length || 0} analytical modules exploring fundamental PMN theory.`}
                  </p>

                  <div style={{fontFamily:'var(--f-mono)', fontSize:'.72rem', marginBottom:'1.5rem', display:'flex', flexDirection:'column', gap:'.4rem'}}>
                    <div style={{color:'var(--mute)', textTransform:'uppercase', letterSpacing:'.1em', fontSize:'.65rem', marginBottom:'.2rem'}}>
                      Sub-Module Analytical Registry:
                    </div>
                    {(currentPart.subs || []).slice(0, 8).map((s: any) => (
                      <div key={s.id} style={{padding:'.35rem 0', borderBottom:'1px solid var(--rule)', display:'flex', alignItems:'baseline', gap:'.6rem'}}>
                        <span style={{color:'var(--acc-text)', fontWeight:700}}>{s.id}</span>
                        <span style={{color:'var(--ink2)', flex:1}}>{s.title}</span>
                      </div>
                    ))}
                    {(currentPart.subs?.length || 0) > 8 && (
                      <div style={{color:'var(--mute)', paddingTop:'.4rem', fontStyle:'italic'}}>
                        + {currentPart.subs.length - 8} more analytical modules in this part
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
                    Open Part {currentPart.part} in Reader &rarr;
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
