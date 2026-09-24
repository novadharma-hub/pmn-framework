import React, { useState } from 'react'

interface TheoreticalAnatomySectionProps {
  data: any
  onJump: (pIdx: number, sIdx: number) => void
  onStartReading: () => void
  version?: string
}

type AnatomyMode = 'layers' | 'formula' | 'capture' | 'parts'

/** "Part VI" untuk angka Romawi; "Preface", "Coda" dsb. apa adanya. */
const labelPart = (part: string) => (/^[IVXLC]+$/.test(part) ? 'Part ' + part : part)

export default function TheoreticalAnatomySection({ data, onJump, onStartReading, version = '120' }: TheoreticalAnatomySectionProps) {
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
        { id: '2.1', title: 'Reality as Primary' },
        { id: '1.9', title: 'Epistemic Authority' },
        { id: '2.4', title: 'Social Ontology' },
        { id: '3.4', title: 'The Minimal Anchor' },
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
        'Transformation pressure is multiplicative: T = S × D × P × G (§15.2).',
        'Narrative inertia and ideological lag justifying constituent compliance.',
      ],
      keySections: [
        { id: '6.2', title: 'Power as Structural Position' },
        { id: '7.3', title: 'The Custodian Problem' },
        { id: '7.3c-i', title: 'A General Theory of Capture' },
        { id: '11.0', title: 'Two Levels of Economic Analysis' },
      ],
    },
    {
      id: 3,
      title: 'Genuine Becoming & Subjective Agency',
      scope: 'Parts V and XVII, and the Coda',
      anchorSec: '5.1',
      badge: 'Horizon / Human Potential',
      principle: 'The expansion of developmental capacity (genuine becoming) is the highest evaluative vector, contingent upon securing the biological floor beneath it.',
      mechanics: [
        'Rejection of fatalistic determinism: individuals possess navigational agency within structural bounds.',
        'Materialist praxis: active commitment to minimizing structural suffering for vulnerable others.',
        'Institutional reconstruction through coordinated dissent and counter-design.',
      ],
      keySections: [
        { id: '4.5', title: 'The Anti-Foreclosure Criterion' },
        { id: '17.1', title: 'The Prohibition Case' },
        { id: '10.10c', title: 'The Extended Agent Typology' },
        { id: '10.1', title: 'Why Systems Change' },
      ],
    },
  ]

  // 2. DATA: primary-formula variables, transcribed from 15.2-15.4.
  //
  // An earlier version of this block described T as "structural surplus
  // extraction" and glossed S, D, P, G as scale asymmetry, unrotated tenure,
  // exit penalties and governance opacity. None of those are the manuscript's
  // variables: "exit penalties" and "governance opacity" occur zero times in
  // the corpus. T is Transformation Pressure, the net force pushing a system
  // toward reorganization. See private/restrukturisasi/audit/AUD-23.
  //
  // `behaviour` replaced a `counterMeasure` field that attributed per-variable
  // policy prescriptions to PMN. The manuscript states how these variables
  // behave; it does not issue remedies for them one by one.
  const FORMULA_VARS = {
    S: {
      symbol: 'S',
      name: 'Structural Suffering',
      anchor: '15.3',
      def: 'Resource Deprivation (R) + Institutional Betrayal (B), with Visibility Suppression (V) operating as a political-conversion modifier rather than an additive component. Resource deprivation is the gap between what a population requires to meet the minimal anchor and what the system actually provides.',
      fieldTest: 'Is the deprivation understood by those experiencing it as structural, differential, and produced by identifiable arrangements — or as natural, shared, and temporary?',
      behaviour: 'Populations can sustain extraordinary material hardship without generating transformation pressure when the deprivation reads as natural or temporary. This formula tracks what feeds systemic change; the four-way typology at 3.4b tracks what the framework evaluates as wrong. They are complementary, not substitutes.',
    },
    D: {
      symbol: 'D',
      name: 'Duration',
      anchor: '15.4',
      def: 'The multiplier by which persistence raises suffering’s political weight. Suffering that persists across years generates different political consequences than equivalent suffering concentrated in a brief crisis.',
      fieldTest: 'Has the condition persisted long enough to alter behavioural dispositions, life expectations, and institutional trust — or is it still being absorbed as an acute episode?',
      behaviour: 'Acute crises are absorbed more readily than chronic conditions, because acute crises do not degrade the dispositions and trust that chronic suffering erodes.',
    },
    P: {
      symbol: 'P',
      name: 'Scale',
      anchor: '15.4',
      def: 'The proportion of a relevant population experiencing the suffering. Below certain thresholds it is politically managed as a minority problem; above them it becomes the majority’s problem and the political arithmetic changes.',
      fieldTest: 'What share of the relevant population is affected, and has that share crossed the threshold at which the arrangement can no longer treat it as a minority concern?',
      behaviour: 'Scale amplifies pressure non-linearly as it crosses political thresholds. Where the threshold sits varies by political system, cultural context, and the capacity of affected populations to form coalitions.',
    },
    G: {
      symbol: 'G',
      name: 'Intergenerational Transmission',
      anchor: '15.4',
      def: 'The degree to which suffering passes from parents to children through structural mechanisms rather than being resolved within a generation.',
      fieldTest: 'Do the mechanisms that produced the condition also reproduce it in the next generation, or does each generation face it afresh?',
      behaviour: 'Always implied in the primary formula even where cross-references write the shorthand T = S × D × P for legibility.',
    },

  }

  // 3. DATA: 5 Capture Stages
  // CAPTURE_STAGES: the authoritative five-stage sequence, transcribed from
  // 7.3c-i. An earlier version presented a different lifecycle entirely
  // (protective mandate -> custodian entrenchment -> information asymmetry ->
  // extraction normalization), which is not the manuscript's model. The
  // `remedy` field now carries what 7.3d and 7.3c-i actually say, including
  // the finding that remedies stop being available after stage three.
  const CAPTURE_STAGES = [
    {
      num: '01',
      title: 'Access Asymmetry',
      anchor: '7.3c-i',
      subtitle: 'Systematic informational, technical and relational advantage',
      symptoms: 'Concentrated interests establish an advantage over institutional overseers. Regulators and decision-makers come to rely on the regulated for specialized expertise, data models, and professional career pipelines.',
      indicators: 'Capture presents innocuously as technical competence and administrative efficiency. Nothing yet looks like wrongdoing.',
      remedy: 'One of only two tractable windows. 7.3d: sunset provisions and mandatory re-authorization force an arrangement to demonstrate continued justification for its authority rather than assuming it.',
    },
    {
      num: '02',
      title: 'Decision-Filter Capture & Preference Expression',
      anchor: '7.3c-i',
      subtitle: 'Procedural filters narrow around the dominant interest',
      symptoms: 'Actors with asymmetric access express preferences through institutional channels. The institution’s cognitive and procedural filters narrow, systematically excluding information and policy choices that threaten the dominant interest.',
      indicators: 'Decisions remain locally defensible as pragmatic or legally prudent, but cumulatively bias institutional direction. The bias is visible only in aggregate.',
      remedy: 'The last tractable window. 7.3d: external independent review with genuine enforcement capacity — authority to compel disclosure, impose consequences, and act without the consent of the reviewed entity.',
    },
    {
      num: '03',
      title: 'Personnel Alignment',
      anchor: '7.3c-i',
      subtitle: 'Veto points staffed with sympathetic custodians',
      symptoms: 'Recruitment, promotion, and retention systematically select for personnel whose orientations fit the narrowed decision filter, while dissenting personnel are marginalized, reassigned, or driven out.',
      indicators: 'Internal alignment cements the access asymmetry. Internal reform capacity is now severely impaired.',
      remedy: 'Randomized selection for oversight bodies removes the self-selection bias that allows capture through strategic placement of personnel — but 7.3d warns the mechanism depends on how the eligible pool is constructed: randomizing within an exclusionary pool replicates the exclusion.',
    },
    {
      num: '04',
      title: 'Objective Redefinition & Output Reorientation',
      anchor: '7.3c-i',
      subtitle: 'The founding legitimacy vocabulary is absorbed and repurposed',
      symptoms: 'Operative goals diverge decisively from the statutory mandate. What was previously defined as regulatory evasion or mission failure is formally rearticulated as modern, flexible mandate fulfillment.',
      indicators: 'Outputs consistently serve the captured interest while maintaining symbolic fidelity to public purposes.',
      remedy: 'No longer reversible from within the institution’s own rules. Reversal requires either severe systemic crisis or organized external counter-power (10.9) capable of overriding captured procedures.',
    },
    {
      num: '05',
      title: 'Accountability Capture & Consolidation',
      anchor: '7.3c-i',
      subtitle: 'The beneficiaries adjudicate grievances against themselves',
      symptoms: 'Channels of review, contestation, and appellate correction are dismantled, defunded, or captured by the same interests.',
      indicators: 'Institutional lock-in: beneficiaries control adjudication of claims against themselves and command institutional resources to suppress counter-claims.',
      remedy: 'Self-insulating. The standing diagnostics from 7.3 still apply — who benefits from the output distribution, who audits the auditors, what counts as failure, and whether revision from outside is legally and materially possible — but answering them no longer produces reform from inside.',
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
            Engine Status: Verified v{version} Canonical
          </div>
        </div>

        {/* MODE SELECTOR TABS */}
        <div style={{display:'flex', flexWrap:'wrap', gap:'.5rem', marginBottom:'2rem'}}>
          {[
            { id: 'layers', label: '1. 3-Layer Analytical Stack' },
            { id: 'formula', label: '2. Transformation Pressure (T = S × D × P × G)' },
            { id: 'capture', label: '3. The Capture Sequence (§7.3c-i)' },
            { id: 'parts', label: '4. Part Directory (Preface to Bibliography)' },
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
                THE PRIMARY FORMULA — TRANSFORMATION PRESSURE (PMN §15.2)
              </div>
              <div style={{fontFamily:'var(--f-head)', fontSize:'clamp(2.2rem, 5vw, 3.4rem)', color:'var(--acc-text)', letterSpacing:'.1em', margin:'0 0 .6rem 0'}}>
                T = S &times; D &times; P &times; G
              </div>
              <p style={{fontFamily:'var(--f-body)', fontSize:'.95rem', color:'var(--ink2)', maxWidth:'640px', margin:'0 auto', lineHeight:1.65}}>
                Transformation pressure (<strong style={{color:'var(--ink)'}}>T</strong>) is the net force pushing a system toward significant reorganization. It is structural suffering (<strong style={{color:'var(--ink)'}}>S</strong>) multiplied by duration (<strong style={{color:'var(--ink)'}}>D</strong>), scale (<strong style={{color:'var(--ink)'}}>P</strong>), and intergenerational transmission (<strong style={{color:'var(--ink)'}}>G</strong>). When T crosses a system&rsquo;s threshold for non-linear change — a threshold that is itself variable and not known in advance — rapid reorganization becomes probable.
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
                      How the manuscript says it behaves:
                    </strong>
                    <p style={{fontFamily:'var(--f-body)', fontSize:'.92rem', lineHeight:1.65, color:'var(--ink)', margin:0}}>
                      {FORMULA_VARS[selectedVar].behaviour}
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
                      What can be done at this stage:
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

        {/* PANEL 4: PART DIRECTORY (Preface, Parts I-XVII, Coda, Debts, Bibliography) */}
        {activeMode === 'parts' && (
          <div className="anatomy-terminal" style={{display:'grid', gridTemplateColumns:'minmax(220px, 280px) 1fr', border:'1px solid var(--rule)', background:'var(--bg)', minHeight:'520px', boxShadow:'12px 12px 0 rgba(0,0,0,0.05)'}}>
            <div style={{borderRight:'1px solid var(--rule)', background:'var(--bg2)', overflowY:'auto', maxHeight:'580px'}}>
              <div style={{background:'var(--acc)', color:'#fff', fontFamily:'var(--f-mono)', fontSize:'.7rem', fontWeight:700, textTransform:'uppercase', letterSpacing:'.12em', padding:'.8rem 1rem'}}>
                Part Index
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
                  {labelPart(p.part)}
                </button>
              ))}
            </div>

            <div style={{padding:'2rem', overflowY:'auto', maxHeight:'580px'}}>
              {currentPart && (
                <div>
                  <div style={{display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'.8rem'}}>
                    <span style={{fontFamily:'var(--f-mono)', fontSize:'.72rem', color:'var(--acc-text)', fontWeight:700, textTransform:'uppercase'}}>
                      {labelPart(currentPart.part)}
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
                    Open {labelPart(currentPart.part)} in Reader &rarr;
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
