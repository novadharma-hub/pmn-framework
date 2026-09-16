import React, { useState, useMemo } from 'react'

/*
 * DATA SOURCE: §14.3 "Axiom hierarchy — consolidated reference".
 *
 * Every item below is transcribed from that block. Nothing is added, and the
 * tier assignments are the manuscript's own. An earlier version of this file
 * carried eleven cards of which three corresponded to the hierarchy: Tier 1
 * had been inflated from two items to four, four of the six Tier 2 commitments
 * were missing (including the is-ought bridge), and three of the four Tier 3
 * assumptions were absent. See private/restrukturisasi/audit/AUD-23 §7.
 *
 * FIELD SEMANTICS DIFFER BY TIER, because §14.3 says the appropriate response
 * to challenge differs by tier:
 *   Tier 1 — `basis`: what supports it. NOT a falsification test. §14.3:
 *            adopted as starting points, "defended by the convergence arguments
 *            in Parts I and II rather than by evidence from within the
 *            framework." A falsification field here would misdescribe them.
 *   Tier 2 — `challenge`: what a successful challenge would have to show.
 *   Tier 3 — `evidence`: the falsification condition AS THE MANUSCRIPT STATES
 *            IT. Empty where the manuscript does not specify one. Empty is
 *            reported as empty; inventing a threshold is what the previous
 *            version did, and eight of its eleven conditions were set at
 *            extremes no observation could meet.
 *
 * `part` is derived from the anchor's Part, not from an invented subject
 * taxonomy. `canonical` is the §14.3 item id, so any curation stays auditable.
 */

interface AxiomItem {
  code: string
  canonical: string
  tier: 1 | 2 | 3
  part: string
  title: string
  summary: string
  anchor: string
  repairCost: string
  basis?: string
  challenge?: string
  evidence?: string
}

// Daftar Bagian DITURUNKAN dari data, bukan diketik ulang: daftar yang
// diketik ulang adalah daftar yang bisa menyimpang dari isinya.
const REPAIR: Record<number, string> = {
  1: 'Replacing the framework',
  2: 'Restructuring the architecture',
  3: 'Revising a specific analytical claim',
}

const AXIOMS: AxiomItem[] = [
  // ── TIER 1 — foundational axioms, adopted as starting points ──
  {
    code: '1a',
    canonical: '14.3 Tier 1(a)',
    tier: 1,
    part: 'Part II — What Exists',
    title: 'MIND-INDEPENDENT MATERIAL REALITY IS PRIMARY',
    summary: 'Reality is primary and independent of our perception of it. §14.3 records this as adopted as a starting point rather than derived from prior argument, and states that the framework’s entire analytical architecture inherits whatever vulnerability the axiom carries.',
    anchor: '2.1',
    repairCost: REPAIR[1],
    basis: 'The convergence argument in §2.1 gives a reason to prefer this axiom over its idealist alternative but does not prove it: every ontological starting point is, by definition, not derived from a prior one. §2.6b adds that the axiom is methodological rather than metaphysical — a working assumption that yields productive analysis, not a demonstrated conclusion about what exists.',
  },
  {
    code: '1b',
    canonical: '14.3 Tier 1(b)',
    tier: 1,
    part: 'Part III — The Biological Foundation',
    title: 'SUFFERING HAS NEGATIVE EVALUATIVE VALENCE',
    summary: 'That suffering’s presence is bad and its reduction good is treated as the framework’s foundational normative commitment rather than as a derived conclusion.',
    anchor: '3.0',
    repairCost: REPAIR[1],
    basis: 'Defended against the is-ought objection in Part III, but the defence is a philosophical argument rather than a deduction from empirical premises. §14.3 also records that choosing suffering over life, flourishing, preferences or capabilities is a design choice: alternatives in the capabilities tradition are live competing choices the framework excludes rather than refutes. Note the acknowledged exception to the dependency ordering: this axiom functions as a universal criterion only if 3(c) holds.',
  },

  // ── TIER 2 — structural commitments ──
  {
    code: '2a',
    canonical: '14.3 Tier 2(a)',
    tier: 2,
    part: 'Part III — The Biological Foundation',
    title: 'LIFE AS FOUNDATION, SUFFERING AS CRITERION, ANTI-FORECLOSURE AS ITS TEMPORAL EXTENSION',
    summary: 'The two-level evaluative architecture. ‘Becoming’ is shorthand for what the floor criterion requires when applied across time — not an independent positive aspiration, and not a second value commitment. §14.3 states it is defended as a derivation, which is why it carries less philosophical vulnerability than an independent axiom would.',
    anchor: '3.0',
    repairCost: REPAIR[2],
    challenge: 'Show that the architecture does not require this structure, or that capabilities frameworks, preference-satisfaction approaches, or thick conceptions of flourishing produce better results by the framework’s own criteria.',
  },
  {
    code: '2b',
    canonical: '14.3 Tier 2(b)',
    tier: 2,
    part: 'Part III — The Biological Foundation',
    title: 'DESCRIPTIVE EGOISM AS THE BIOLOGICAL STARTING POINT',
    summary: 'Organisms avoid pain and seek resources as a prior fact, before any normative framework is imposed. This is not a claim that organisms are selfish in all their behaviour; it is the minimal factual anchor from which the is-ought bridge in §3.3 begins.',
    anchor: '3.2',
    repairCost: REPAIR[2],
    challenge: 'Show that the bridge in §3.3 can begin somewhere else, or that the factual anchor is not minimal — that it smuggles in evaluative content rather than starting from observation.',
  },
  {
    code: '2c',
    canonical: '14.3 Tier 2(c)',
    tier: 2,
    part: 'Part II — What Exists',
    title: 'THE LAYERED CONSTRAINT MODEL',
    summary: 'Ecological Viability → Biological Floor → Economic Arrangements → Institutional Architecture → Meaning Infrastructure. Each layer constrains the one above without determining it, and no layer collapses into another.',
    anchor: '2.2',
    repairCost: REPAIR[2],
    challenge: 'Show that the ordering is wrong, that a layer is redundant, or that constraint runs in the opposite direction at some point in the chain. The ecological layer is developed at §3.10 and the meaning layer at §5.6.',
  },
  {
    code: '2d',
    canonical: '14.3 Tier 2(d)',
    tier: 2,
    part: 'Part I — How We Know',
    title: 'PROBABILISTIC DETERMINISM',
    summary: 'Structural forces establish probability distributions over outcomes, not specific outcomes. Conditions make some configurations far more likely than others without fixing which one occurs.',
    anchor: '1.3',
    repairCost: REPAIR[2],
    challenge: 'Show that the analysis in practice requires stronger determinism than this commitment allows, or that its predictions are indistinguishable from those of a framework with no determinism at all.',
  },
  {
    code: '2e',
    canonical: '14.3 Tier 2(e)',
    tier: 2,
    part: 'Part III — The Biological Foundation',
    title: 'THE IS-OUGHT BRIDGE THROUGH MATERIAL CONSEQUENCES AND STABILITY',
    summary: 'Suffering at scale produces observable systemic instability. This is the step that licenses the framework’s evaluative apparatus: it is how a materialist analysis earns the right to call an arrangement worse without importing a moral premise from outside.',
    anchor: '3.3',
    repairCost: REPAIR[2],
    challenge: 'Show that the bridge does not cross — that stability consequences carry no evaluative weight, or that the argument smuggles in the normative conclusion it claims to reach. §3.0c sets out the logical structure with the epistemic status of each step made explicit.',
  },
  {
    code: '2f',
    canonical: '14.3 Tier 2(f)',
    tier: 2,
    part: 'Part II — What Exists',
    title: 'THE TWO-LEVEL METAPHYSICAL ARCHITECTURE: SOURCE AND INTERFACE',
    summary: 'The source level of reality may be impersonal while the interface level generates genuinely personal phenomena through the interaction of consciousness with complex structure. This is what allows the framework to treat religion and metaphysical commitment as material forces without ruling on their source.',
    anchor: '2.3',
    repairCost: REPAIR[2],
    challenge: 'Show that the two levels collapse, or that the impersonal-ground reading dissolves the problem of evil only by relabelling it. §14.3 lists the latter as an open question the framework cannot close from within.',
  },

  // ── TIER 3 — empirical-hypothetical assumptions ──
  {
    code: '3a',
    canonical: '14.3 Tier 3(a)',
    tier: 3,
    part: 'Part III — The Biological Foundation',
    title: 'THE PERMANENT CONDITIONS ARE GENUINELY PERMANENT',
    summary: 'The conditions identified in Part III are treated as permanent features of collective life rather than as artefacts of a particular historical period. The economic doctrine in Part XI begins from them.',
    anchor: '3.0',
    repairCost: REPAIR[3],
    evidence: 'Working hypothesis, falsifiable by demonstration of institutional designs that eliminate them rather than manage them.',
  },
  {
    code: '3b',
    canonical: '14.3 Tier 3(b)',
    tier: 3,
    part: 'Part IX — The International Dimension',
    title: 'MATERIAL CONDITIONS WILL SUPPORT POST-NATIONAL COORDINATION',
    summary: 'That material development will eventually support forms of coordination beyond the territorially bounded state. §14.3 marks this as a speculative projection and Part IX states it as such.',
    anchor: '9.0',
    repairCost: REPAIR[3],
    evidence: '',
  },
  {
    code: '3c',
    canonical: '14.3 Tier 3(c)',
    tier: 3,
    part: 'Part III — The Biological Foundation',
    title: 'CROSS-CULTURAL VALIDITY OF SUFFERING AS EVALUATIVE ANCHOR',
    summary: 'That the minimal anchor is cross-cultural enough to function as a universal evaluative criterion. Assumed on convergence grounds and treated as well-supported rather than demonstrated. §14.4b records that the biological foundation rests on this assumption — which is why a successful challenge here would carry a Tier 1 cost rather than the Tier 3 cost its placement implies. It is kept at Tier 3 because its evidential status is empirical and §14.4b specifies what evidence would revise it.',
    anchor: '3.2',
    repairCost: 'Placement says Tier 3; §14.3 records that the real cost is Tier 1',
    evidence: 'Specified at §14.4b: the biological foundation rests on the claim that suffering is a cross-culturally valid anchor because all organisms avoid it. §14.4b exists to keep that foundation a genuine empirical claim with stated falsification conditions rather than a self-sealing axiom.',
  },
  {
    code: '3d',
    canonical: '14.3 Tier 3(d)',
    tier: 3,
    part: 'Part XV — The Formula Architecture',
    title: 'THE FORMULA ARCHITECTURE CAPTURES PRIMARY STRUCTURAL TENDENCIES',
    summary: 'The Structural Tendency Analysis formulas in Part XV are structural hypotheses about variable relationships, not confirmed causal laws. The primary formula is Transformation Pressure: T = A = S × D × P × G, the net force pushing a system toward significant reorganisation, where D is Duration, P is Scale, and G is Intergenerational Transmission.',
    anchor: '15.2',
    repairCost: REPAIR[3],
    evidence: 'Their precision should not be confused with established causal knowledge. They are diagnostic frameworks for directing analysis, not predictive instruments whose outputs can be relied on without qualification.',
  },
]

const PARTS: string[] = Array.from(new Set(AXIOMS.map(a => a.part)))

interface AxiomStructureSectionProps {
  data: any
  onJump: (pIdx: number, sIdx: number) => void
  onStartReading: () => void
}

export default function AxiomStructureSection({ data, onJump, onStartReading }: AxiomStructureSectionProps) {
  const [tierFilter, setTierFilter] = useState<number | 0>(0)
  const [partFilter, setPartFilter] = useState<string>('all')
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
      if (partFilter !== 'all' && ax.part !== partFilter) return false
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase()
        return (
          ax.title.toLowerCase().includes(q) ||
          ax.summary.toLowerCase().includes(q) ||
          ax.code.toLowerCase().includes(q) ||
          (ax.basis || ax.challenge || ax.evidence || '').toLowerCase().includes(q)
        )
      }
      return true
    })
  }, [tierFilter, partFilter, searchQuery])

  const tier1Count = AXIOMS.filter(a => a.tier === 1).length
  const tier2Count = AXIOMS.filter(a => a.tier === 2).length
  const tier3Count = AXIOMS.filter(a => a.tier === 3).length

  const groupedTiers = useMemo(() => {
    if (tierFilter !== 0) {
      return [{ 
        tier: tierFilter, 
        title: tierFilter === 1 ? 'Tier 1 — Foundational Axioms' : tierFilter === 2 ? 'Tier 2 — Structural Commitments' : 'Tier 3 — Empirical-Hypothetical Assumptions', 
        items: filteredAxioms 
      }]
    }
    return [
      { tier: 1, title: 'Tier 1 — Foundational Axioms', items: filteredAxioms.filter(a => a.tier === 1) },
      { tier: 2, title: 'Tier 2 — Structural Commitments', items: filteredAxioms.filter(a => a.tier === 2) },
      { tier: 3, title: 'Tier 3 — Empirical-Hypothetical Assumptions', items: filteredAxioms.filter(a => a.tier === 3) },
    ].filter(g => g.items.length > 0)
  }, [filteredAxioms, tierFilter])

  return (
    <div className="theses-section">
      <div className="theses-inner">

        {/* COLUMN 1: SIDEBAR LEAD CARD */}
        <div className="theses-lead">
          <h2>Axiom Structure</h2>
          <p className="theses-lead-sub">
            The twelve commitments below are transcribed from &sect;14.3, where the framework sets them out itself. Tiers are separated by what a successful challenge would cost: replacing the framework, restructuring the architecture, or revising a single claim. Tier&nbsp;3 depends on Tier&nbsp;2, which depends on Tier&nbsp;1 &mdash; with one exception &sect;14.3 names, at 3(c).
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

            {/* Part & Search Input */}
            <div style={{display:'flex', flexWrap:'wrap', gap:'.4rem', alignItems:'center'}}>
              <select
                value={partFilter}
                onChange={e => setPartFilter(e.target.value)}
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
                <option value="all">All Parts</option>
                {PARTS.map(p => <option key={p} value={p}>{p}</option>)}
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
                              {ax.part}
                            </span>
                            <span style={{fontFamily:'var(--f-mono)', fontSize:'.62rem', color:'var(--mute)', background:'var(--bg2)', border:'1px solid var(--rule)', padding:'.15rem .45rem'}}>
                              Canon Anchor: §{ax.anchor}
                            </span>
                          </div>

                          {/* PROPOSITION SUMMARY */}
                          <p style={{fontFamily:'var(--f-body)', fontSize:'.94rem', lineHeight:1.68, color:'var(--ink)', margin:'0 0 1rem 0'}}>
                            {ax.summary}
                          </p>

                          {/* TIER-DEPENDENT EVIDENCE BOX.
                              §14.3 says the appropriate response to challenge
                              differs by tier, so the field shown differs too.
                              A single "Falsification Standard" box for all
                              three tiers is what let the previous version
                              promise empirical tests for axioms the manuscript
                              says are not defended by evidence. */}
                          <div style={{display:'grid', gridTemplateColumns:'repeat(auto-fit, minmax(260px, 1fr))', gap:'.85rem', marginBottom:'1rem'}}>
                            {ax.tier === 1 && (
                              <div style={{background:'var(--bg2)', border:'1px solid var(--rule)', padding:'.9rem 1rem'}}>
                                <strong style={{display:'block', fontFamily:'var(--f-mono)', fontSize:'.62rem', letterSpacing:'.1em', textTransform:'uppercase', color:'var(--acc-text)', marginBottom:'.35rem'}}>
                                  Basis &mdash; adopted, not derived:
                                </strong>
                                <p style={{fontFamily:'var(--f-body)', fontSize:'.86rem', lineHeight:1.6, color:'var(--ink2)', margin:0}}>
                                  {ax.basis}
                                </p>
                              </div>
                            )}

                            {ax.tier === 2 && (
                              <div style={{background:'var(--bg2)', border:'1px solid var(--rule)', padding:'.9rem 1rem'}}>
                                <strong style={{display:'block', fontFamily:'var(--f-mono)', fontSize:'.62rem', letterSpacing:'.1em', textTransform:'uppercase', color:'var(--acc-text)', marginBottom:'.35rem'}}>
                                  What a successful challenge must show:
                                </strong>
                                <p style={{fontFamily:'var(--f-body)', fontSize:'.86rem', lineHeight:1.6, color:'var(--ink2)', margin:0}}>
                                  {ax.challenge}
                                </p>
                              </div>
                            )}

                            {ax.tier === 3 && (
                              <div style={{background:'var(--bg2)', border:'1px solid var(--rule)', padding:'.9rem 1rem'}}>
                                <strong style={{display:'block', fontFamily:'var(--f-mono)', fontSize:'.62rem', letterSpacing:'.1em', textTransform:'uppercase', color:'var(--acc-text)', marginBottom:'.35rem'}}>
                                  Falsification condition:
                                </strong>
                                <p style={{fontFamily:'var(--f-body)', fontSize:'.86rem', lineHeight:1.6, color: ax.evidence ? 'var(--ink2)' : 'var(--mute)', margin:0, fontStyle: ax.evidence ? 'normal' : 'italic'}}>
                                  {ax.evidence || 'Not specified in the manuscript. Recorded as absent rather than filled in — an invented threshold would be worse than an acknowledged gap.'}
                                </p>
                              </div>
                            )}

                            <div style={{background:'var(--bg2)', border:'1px solid var(--rule)', padding:'.9rem 1rem'}}>
                              <strong style={{display:'block', fontFamily:'var(--f-mono)', fontSize:'.62rem', letterSpacing:'.1em', textTransform:'uppercase', color:'var(--mute)', marginBottom:'.35rem'}}>
                                Cost of a successful challenge:
                              </strong>
                              <p style={{fontFamily:'var(--f-body)', fontSize:'.86rem', lineHeight:1.6, color:'var(--ink2)', margin:0}}>
                                {ax.repairCost}
                              </p>
                              <p style={{fontFamily:'var(--f-mono)', fontSize:'.6rem', lineHeight:1.5, color:'var(--mute)', margin:'.5rem 0 0 0'}}>
                                Canonical: &sect;{ax.canonical}
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
