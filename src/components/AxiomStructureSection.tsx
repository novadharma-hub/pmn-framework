import React, { useState, useMemo } from 'react'

interface AxiomItem {
  code: string
  tier: 1 | 2 | 3
  tierName: string
  domain: 'Epistemology' | 'Ethics & Sentience' | 'Power & Institutions' | 'Economics & Contestability'
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
  // TIER 1 — FOUNDATIONAL AXIOMS
  {
    code: '1a',
    tier: 1,
    tierName: 'Tier 1 — Foundational Axioms',
    domain: 'Epistemology',
    title: 'MIND-INDEPENDENT MATERIAL REALITY IS PRIMARY',
    summary: 'The physical universe and thermodynamic constraints exist objectively regardless of human perception, language, or social construction. Establishing material conditions is the prior analytical move before analyzing narrative formations.',
    anchor: '1.6',
    defense: 'Rejects solipsism, metaphysical idealism, and radical discursive constructivism. Consciousness and discourse strictly require biological substrates and thermodynamic throughput to exist.',
    falsification: 'Falsified if conscious mental phenomena are empirically demonstrated to operate autonomously without requiring energy, physical substrates, or biological embodiment.',
  },
  {
    code: '1b',
    tier: 1,
    tierName: 'Tier 1 — Foundational Axioms',
    domain: 'Ethics & Sentience',
    title: 'BIOLOGICAL SUFFERING HAS NEGATIVE EVALUATIVE VALENCE',
    summary: 'Somatic trauma and suffering in sentient nervous systems represent an objective material reality, not a subjective preference. The minimization of non-consensual structural suffering serves as our non-arbitrary moral floor.',
    anchor: '3.4',
    defense: 'Evades both moral nihilism and relativism without requiring scholastic theology or divine revelation. Sentient neural systems are evolutionarily hardwired to avoid somatic damage.',
    falsification: 'Falsified if sentient populations are discovered that intrinsically and consistently seek uncompensated bodily destruction absent any functional benefit.',
  },
  {
    code: '1c',
    tier: 1,
    tierName: 'Tier 1 — Foundational Axioms',
    domain: 'Ethics & Sentience',
    title: 'GENUINE BECOMING IS EVALUATIVELY SIGNIFICANT',
    summary: 'The expansion of human developmental capacity to create, comprehend, and relate with autonomy represents the evaluative ceiling that pairs with the baseline floor of suffering reduction.',
    anchor: '5.1',
    defense: 'Ethics cannot stagnate into passive negative utilitarianism. Authentic emancipation requires securing positive developmental headroom once the survival floor is established.',
    falsification: 'Falsified if expanding human creative and developmental capacities is shown to inevitably and monotonically increase net systemic suffering across all horizons.',
  },
  {
    code: '1d',
    tier: 1,
    tierName: 'Tier 1 — Foundational Axioms',
    domain: 'Epistemology',
    title: 'ANTI-DOGMATIC DESIGN & ZERO AUTHORITY PRIVILEGE',
    summary: 'No office, text, canonized founder, or ideological custodian holds immunity from empirical auditing, dissent, and procedural revision when confronted with demonstrated predictive failure.',
    anchor: '1.4',
    defense: 'Prevents scholastic ossification and custodian capture. Keeps PMN fundamentally calibrated as an adaptive instrument of real-world investigation rather than an inviolable dogma.',
    falsification: 'Falsified if any philosophical postulate is proven capable of retaining absolute veridical authority without requiring ongoing empirical feedback and verification.',
  },

  // TIER 2 — STRUCTURAL COMMITMENTS
  {
    code: '2a',
    tier: 2,
    tierName: 'Tier 2 — Structural Commitments',
    domain: 'Ethics & Sentience',
    title: 'CONDITIONAL BIOLOGICAL CONSTRAINTS',
    summary: 'Human cognition and social behavior operate within measurable evolutionary biological constraints that are probabilistically determined, rather than fatalistically fixed.',
    anchor: '3.2',
    defense: 'Rejects naive tabula-rasa utopianism that assumes human nature is infinitely plastic, while rejecting reactionary genetic determinism that naturalizes institutional oppression.',
    falsification: 'Revisable if neurobiology demonstrates human social behavior is rigidly locked by genetic programming with zero phenotypic plasticity or cultural responsiveness.',
  },
  {
    code: '2b',
    tier: 2,
    tierName: 'Tier 2 — Structural Commitments',
    domain: 'Power & Institutions',
    title: 'NON-COLLAPSIBLE LAYERED ARCHITECTURE',
    summary: 'Rigorous investigation proceeds across distinct, non-reducible tiers: Thermodynamic Constraints → Institutional Force Fields → Subjective Agency. No layer collapses into another.',
    anchor: '2.4',
    defense: 'Avoids crude physical reductionism (which is blind to emergent legal/economic dynamics) and culturalism (which ignores thermodynamic and resource boundaries).',
    falsification: 'Revisable if macro-sociopolitical dynamics can be completely derived and forecasted exclusively through quantum mechanics or molecular chemistry.',
  },
  {
    code: '2c',
    tier: 2,
    tierName: 'Tier 2 — Structural Commitments',
    domain: 'Power & Institutions',
    title: 'UNIVERSAL INSTITUTIONAL CONTESTABILITY',
    summary: 'Any institutional arrangement claiming legitimacy must structurally provide accessible, low-cost procedures for external audit, grievance redress, and peaceful non-compliance.',
    anchor: '11.2',
    defense: 'Institutions that insulate themselves from contestation suffer information degradation and systematically mutate into extractive apparatuses for incumbent custodians.',
    falsification: 'Revisable if closed, incontestable societies are empirically demonstrated to maintain long-term equity, institutional adaptation, and zero predatory capture.',
  },
  {
    code: '2d',
    tier: 2,
    tierName: 'Tier 2 — Structural Commitments',
    domain: 'Power & Institutions',
    title: 'BOUNDS OF COERCIVE PROPORTIONALITY',
    summary: 'The application of coercive power is legitimate only to the strict minimum necessary to secure the biological floor; any surplus coercion degenerates into predatory domination.',
    anchor: '7.4',
    defense: 'Blocks the normalization of state or custodian violence under rhetoric of abstract collective stability or emergency exceptions.',
    falsification: 'Revisable if escalated state coercion and punitive monopolies reliably generate wider long-term autonomy and flourishing for vulnerable constituents.',
  },

  // TIER 3 — EMPIRICAL HYPOTHESES
  {
    code: '3a',
    tier: 3,
    tierName: 'Tier 3 — Empirical Hypotheses',
    domain: 'Power & Institutions',
    title: 'INFORMATION ASYMMETRY AS STRUCTURAL POWER',
    summary: 'Custodian advantage achieved through selective data hoarding, procedural complexity, and archival opacity is the primary causal driver of institutional capture.',
    anchor: '7.3',
    defense: 'Rooted in organizational sociology: absent radical transparency, bureaucratic information invariably clusters at the hierarchy peak to entrench incumbency.',
    falsification: 'Falsified if empirical audits reveal that institutional capture occurs at identical rates and severities across fully transparent versus closed information regimes.',
  },
  {
    code: '3b',
    tier: 3,
    tierName: 'Tier 3 — Empirical Hypotheses',
    domain: 'Epistemology',
    title: 'NARRATIVE INERTIA & DISCOURSE RETARDATION',
    summary: 'Ideological frameworks, cultural rationalizations, and moral doctrines persist across multi-generational horizons long after their underlying material conditions have dissolved.',
    anchor: '8.2',
    defense: 'Explains constituent obedience to obsolete theological or economic doctrines that run directly counter to their immediate material survival interests.',
    falsification: 'Falsified if changes in underlying material/economic conditions are observed to instantaneously transform public cultural and normative belief systems without lag.',
  },
  {
    code: '3c',
    tier: 3,
    tierName: 'Tier 3 — Empirical Hypotheses',
    domain: 'Economics & Contestability',
    title: 'MULTIPLICATIVE TRANSFER EQUATION (T = S · D · P · G)',
    summary: 'Structural surplus extraction operates multiplicatively rather than additively: if governance opacity (G) or exit penalties (P) approach zero, extractive leverage collapses.',
    anchor: '6.3',
    defense: 'Bridges political economy with information theory: radical procedural transparency and guaranteed exit rights disarm monopolistic extraction.',
    falsification: 'Falsified if econometric modeling reveals that power factors operate independently and additively without compound multiplier effects on extracted surplus.',
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

  const groupedTiers = useMemo(() => {
    if (tierFilter !== 0) {
      return [{ 
        tier: tierFilter, 
        title: tierFilter === 1 ? 'Tier 1 — Foundational Axioms' : tierFilter === 2 ? 'Tier 2 — Structural Commitments' : 'Tier 3 — Empirical Hypotheses', 
        items: filteredAxioms 
      }]
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

        {/* COLUMN 1: SIDEBAR LEAD CARD */}
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

        {/* COLUMN 2: WIDE MAIN CONTENT */}
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
                <option value="Epistemology">Epistemology</option>
                <option value="Ethics & Sentience">Ethics & Sentience</option>
                <option value="Power & Institutions">Power & Institutions</option>
                <option value="Economics & Contestability">Economics & Contestability</option>
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
                                Defensive Grounding:
                              </strong>
                              <p style={{fontFamily:'var(--f-body)', fontSize:'.86rem', lineHeight:1.6, color:'var(--ink2)', margin:0}}>
                                {ax.defense}
                              </p>
                            </div>

                            <div style={{background:'var(--bg2)', border:'1px solid var(--rule)', padding:'.9rem 1rem'}}>
                              <strong style={{display:'block', fontFamily:'var(--f-mono)', fontSize:'.62rem', letterSpacing:'.1em', textTransform:'uppercase', color:'var(--mute)', marginBottom:'.35rem'}}>
                                Falsification Standard:
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
                              Open Proof in §{ax.anchor} &rarr;
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
