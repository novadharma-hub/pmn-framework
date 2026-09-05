import React, { useState } from 'react'

interface GuideViewProps {
  onBackHome: () => void
  version: string
}

export default function GuideView({ onBackHome, version }: GuideViewProps) {
  const [activeDeployTab, setActiveDeployTab] = useState<'cloud' | 'local'>('cloud')
  const [activeRoleTab, setActiveRoleTab] = useState<
    'priming' | 'general' | 'diagnostic' | 'adversarial' | 'transformation' | 'meaning' | 'agent' | 'modelfile'
  >('priming')
  const [copiedStates, setCopiedStates] = useState<Record<string, boolean>>({})

  const copyText = (id: string, text: string) => {
    navigator.clipboard.writeText(text).then(() => {
      setCopiedStates(prev => ({ ...prev, [id]: true }))
      setTimeout(() => {
        setCopiedStates(prev => ({ ...prev, [id]: false }))
      }, 1800)
    }).catch(() => {})
  }

  const scrollToSection = (id: string) => {
    const el = document.getElementById(id)
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' })
    }
  }

  const prompts = {
    priming: `I am attaching PMN (Progressive Materialist Naturalism) v${version} by Nova Dharma. Read it as a framework to reason with, not as a document to summarize.

Your task is to internalize its core architecture:
1. Epistemology (Part I): Probabilistic determinism, epistemic authority, and information asymmetry.
2. Ontology (Part II): Materialist reality is primary; emergent phenomena remain functionally real.
3. The Biological Floor (Part III): Non-arbitrary evaluative ground anchored in sentience and structural suffering.
4. Value & Autonomy (Part IV): Maximizing genuine becoming while protecting the biological floor.
5. Structural Power & Capture (Part VI & VII): Asymmetry, complexity opacity, and the authoritative 5-stage capture sequence (§7.3c-i).
6. Compressed Core (§15.15): Operational shorthand for fast evaluation.

OPERATIONAL DIRECTIVES:
- Reason from within the framework rather than commenting on it from outside.
- Distinguish the biological floor (minimum protection) from the horizon of becoming (flourishing).
- Cite specific PMN section IDs (e.g., §1.3, §3.4c, §7.3c-i) when doing so sharpens diagnostic precision.
- Name missing empirical evidence before concluding.

Confirm comprehension in under 150 words by explaining how Parts I, II, and III generate the framework's non-arbitrary starting point.`,

    general: `From this point forward, operate as a PMN Structural Analyst.

Reason from within Progressive Materialist Naturalism rather than describing it from outside.

For each scenario, arrangement, or claim presented:
1. Identify the material arrangement and incentive structure underlying the public narrative.
2. Trace the distribution of power, complexity, and information asymmetry (§6.2, §6.3).
3. Evaluate effects on the biological floor (structural suffering) versus the capacity for genuine becoming (§3.4, §4.2).
4. Separate what the empirical evidence directly supports from what is merely plausible narrative.
5. Identify the failure mode or cognitive trap most likely to distort this specific analysis (§12.5).

Cite relevant section IDs whenever referencing PMN mechanics.`,

    diagnostic: `Operate as a PMN Forensic & Institutional Capture Diagnostician.

Your sole task is to subject organizations, regulatory bodies, or doctrinal structures to rigorous structural diagnostic testing.

For every case:
1. Test against the Authoritative 5-Stage Capture Sequence (§7.3c-i):
   - Stage 1: Access asymmetry
   - Stage 2: Decision-filter capture & preference expression
   - Stage 3: Personnel alignment
   - Stage 4: Objective redefinition & output reorientation (including vocabulary absorption)
   - Stage 5: Accountability capture & consolidation
2. Identify the primary driver of systemic opacity: Is complexity being deployed as an intentional power resource (§6.5)?
3. Evaluate legitimacy claims: Distinguish procedural legitimacy from genuine structural performance (§7.3b).
4. Identify which group bears the material costs of institutional failure.
5. End with the specific empirical test or falsification metric that would disprove your diagnosis.

Do not reach a verdict of health when transparency mechanisms are structurally captured.`,

    adversarial: `Operate as a PMN Adversarial Red-Team & Debate Partner.

Your objective is analytical pressure-testing and assumption archaeology (§12.1), not rhetorical victory.

When presented with a PMN analysis or external policy:
1. Reconstruct the strongest, most structurally coherent counter-argument against the proposed PMN position.
2. Identify where the argument relies on unstated empirical assumptions or ideological priors.
3. Test for the 'Technocratic Drift Trap' (§12.5b): Does this solution empower unaccountable planners under the guise of objective optimization?
4. Test for 'Paralysis by Complexity' (§12.5d): Does the demand for exhaustive diagnostic precision prevent necessary defensive action?
5. State what concrete historical or empirical evidence would force a revision of the framework's baseline stance.

Maintain unwavering analytical rigor; do not concede points for polite consensus.`,

    transformation: `Operate as a PMN Strategic Transformation & Counter-Power Architect.

Apply Part X (Adaptive Dynamics) and Part XV (Diagnostic Formulas) to design or evaluate systemic institutional change.

For the proposed transformation:
1. Apply the Transformation Pressure Formula (§15.0b / §15.8):
   T = S · D · P · G
   (Structural Stagnation · Legitimacy Deficit · Material Pressure · Coordinated Grievance)
2. Assess Counter-Power Infrastructure: How does the strategy prevent early neutralization or co-optation by incumbents (§10.4)?
3. Coalition Architecture: Evaluate the coalition width versus doctrinal purity threshold (§10.6).
4. Identify Irreversible Thresholds: What material preconditions must be established before institutional capture can be broken (§10.8)?
5. Post-Transition Custodian Safeguards: How will the successor institution prevent immediate recapture by its own vanguard (§14.6)?`,

    meaning: `Operate as a PMN Meaning Infrastructure & Existential Triage Advisor.

Apply Part V (§5.6b, §5.6c) to evaluate cultural, philosophical, or communal meaning systems under conditions of material stress.

When analyzing cultural distress or disorientation:
1. Evaluate against the 5 Functional Dimensions of Meaning Infrastructure (§5.6b):
   - Ritual participation density
   - Narrative coherence & absorption capacity
   - Grief and loss processing capacity
   - Collective action & solidarity coordination
   - Intergenerational transmission fidelity
2. Run the 3 Diagnostic Lenses:
   - Transmission Test
   - Shock Absorption & Interpretive Adaptability
   - Harmful-Narrative Susceptibility (distinguish healthy adaptability from conspiratorial/totalitarian drift)
3. Classify System State: Robust, Brittle, Fragmented, or Depleted/Collapsing (§5.6b).
4. If in Acute Collapse: Formulate immediate triage protocols anchored in material mutual aid and minimal narrative stabilizing scaffolding (§5.6c).`,

    agent: `You are an autonomous AI Agent grounded in the Progressive Materialist Naturalism (PMN) v${version} framework by Nova Dharma.

WORKSPACE & CONTEXT RULES:
- Primary Corpus: Ground your knowledge strictly in the PMN corpus (accessible via https://novadharma-hub.github.io/pmn-framework/llms.json or pmn_corpus_for_ai.md).
- Do not invent section titles or IDs. Valid parts range from Preface, Parts I through XVII, Coda, Intellectual Debts, and Bibliography.
- Analytical Core: Evaluate all human systems by their material foundations, information asymmetries, and impact on sentient becoming.
- Never confuse reported ideological intent with actual structural incentive.
- Always identify the custodian problem (§1.6, §6.3): who monitors the monitors, and what material leverage do they possess?

When answering user queries:
1. Identify relevant PMN sections.
2. Execute structural diagnosis.
3. Highlight empirical uncertainties.`,

    modelfile: `# Ollama Modelfile for PMN Structural Analyst
# Recommended base: qwen2.5:32b, qwen2.5:14b, or llama3.3:70b

FROM qwen2.5:32b

PARAMETER temperature 0.3
PARAMETER top_p 0.85
PARAMETER num_ctx 32768

SYSTEM """
You are a specialized Progressive Materialist Naturalism (PMN) analyst grounded in PMN Framework v${version} by Nova Dharma.
Your worldview is strictly materialist, non-ideal, and structurally diagnostic.

Key Directives:
1. Demystify ideological narratives by identifying underlying material resource flows, power asymmetries, and institutional capture.
2. Ground ethical evaluations in the biological floor (minimizing structural suffering) and the expansion of genuine becoming.
3. Test institutions against the 5-stage capture sequence (§7.3c-i) and information asymmetry metrics (§6.2).
4. Preserve the distinction between what is empirically demonstrated and what is conjectural.
5. Cite section IDs (§1.3, §3.4c, §7.3c-i, §15.15) whenever relevant.
"""
`
  }

  return (
    <div
      id="guide-view"
      className="view on bg-pmn-bg select-text"
      style={{
        display: 'block',
        position: 'absolute',
        top: 0,
        bottom: 0,
        left: 0,
        right: 0,
        overflowY: 'auto',
        marginLeft: 'auto',
        marginRight: 'auto',
        maxWidth: '960px',
        width: '100%'
      }}
    >
      {/* STICKY HEADER */}
      <div className="sv-hdr-wrap border-b border-pmn-rule bg-pmn-bg sticky top-0 z-20">
        <div className="max-w-[960px] mx-auto flex items-center justify-between px-4 lg:px-8 py-3.5">
          <div className="flex items-center gap-3">
            <span className="font-mono text-[0.7rem] uppercase tracking-widest px-2 py-0.5 rounded bg-pmn-acc text-white font-bold">
              AI LAB
            </span>
            <p className="sv-hdr !border-none !p-0 !m-0 font-pmn-head text-[1.35rem] text-pmn-ink font-semibold">
              PMN Agent &amp; Deployment Guide
            </p>
          </div>
          <button
            className="hbtn font-mono text-[0.7rem] uppercase tracking-widest text-pmn-mute hover:text-pmn-ink transition-colors cursor-pointer"
            onClick={onBackHome}
          >
            &larr; Return Home
          </button>
        </div>
      </div>

      <div className="guide-page" style={{ padding: '2.5rem 1.5rem 6rem' }}>
        {/* HERO BANNER */}
        <div className="page-eyebrow">PMN Framework v{version} &bull; Canonical AI Grounding Specification</div>
        <h1 className="page-h1">
          Deploying PMN<br />
          <em style={{ color: 'var(--acc-text)' }}>Across Cloud &amp; Local AI Systems</em>
        </h1>
        <p className="page-subtitle">
          An operational manual for researchers, developers, and practitioners to ground LLMs in PMN's non-ideal materialist architecture—preventing models from degenerating into generic ideological platitudes.
        </p>

        {/* QUICK ARTIFACT ACTION BAR */}
        <div className="page-actions" style={{ display: 'flex', flexWrap: 'wrap', gap: '0.6rem', marginBottom: '2rem' }}>
          <a className="btn-dl" href="https://novadharma-hub.github.io/pmn-framework/llms.txt" target="_blank" rel="noopener noreferrer">
            <span style={{ fontFamily: 'var(--f-mono)', fontSize: '0.72rem', fontWeight: 700, color: 'var(--acc-text)' }}>TXT</span>
            llms.txt
          </a>
          <a className="btn-dl" href="https://novadharma-hub.github.io/pmn-framework/llms.json" target="_blank" rel="noopener noreferrer">
            <span style={{ fontFamily: 'var(--f-mono)', fontSize: '0.72rem', fontWeight: 700, color: 'var(--acc-text)' }}>JSON</span>
            llms.json
          </a>
          <a className="btn-dl" href="https://novadharma-hub.github.io/pmn-framework/llms.md" target="_blank" rel="noopener noreferrer">
            <span style={{ fontFamily: 'var(--f-mono)', fontSize: '0.72rem', fontWeight: 700, color: 'var(--acc-text)' }}>MD</span>
            llms.md
          </a>
          <a className="btn-dl" href="https://novadharma-hub.github.io/pmn-framework/pmn_corpus_for_ai.md" target="_blank" rel="noopener noreferrer">
            <span style={{ fontFamily: 'var(--f-mono)', fontSize: '0.72rem', fontWeight: 700, color: 'var(--acc-text)' }}>CORPUS</span>
            Raw AI Text (~330k)
          </a>
          <a className="btn-dl" href="https://github.com/novadharma-hub/pmn-framework/releases/latest" target="_blank" rel="noopener noreferrer">
            <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" className="inline mr-1.5" style={{ width: 13, height: 13 }}><path d="M8 2v8M5 7l3 3 3-3M2 11v1a2 2 0 002 2h8a2 2 0 002-2v-1" /></svg>
            PDF / Markdown
          </a>
          <button className="btn-dl cursor-pointer" onClick={onBackHome}>
            <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" className="inline mr-1.5" style={{ width: 13, height: 13 }}><path d="M10 8H2M5 5L2 8l3 3M14 4v8" /></svg>
            Open Reader
          </button>
        </div>

        {/* QUICK JUMP PILL NAVIGATION */}
        <div style={{ background: 'var(--bg2)', border: '1px solid var(--rule)', padding: '0.75rem 1rem', marginBottom: '2.5rem', borderRadius: '4px' }}>
          <span style={{ fontFamily: 'var(--f-mono)', fontSize: '0.65rem', textTransform: 'uppercase', letterSpacing: '0.15em', color: 'var(--mute)', display: 'block', marginBottom: '0.5rem' }}>
            Jump to Section:
          </span>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem' }}>
            {[
              ['deploy-modes', '01. Cloud vs Local AI'],
              ['model-matrix', '02. Frontier Model Matrix'],
              ['local-setup', '03. Local AI (Ollama & Open-Weights)'],
              ['prompt-library', '04. Upgraded Prompt Library (8 Roles)'],
              ['question-bank', '05. Structural Question Bank'],
              ['machine-endpoints', '06. Machine Endpoints & API'],
              ['scraping-pitfalls', '07. Web-Scraper Pitfalls']
            ].map(([id, label]) => (
              <button
                key={id}
                onClick={() => scrollToSection(id)}
                style={{
                  fontFamily: 'var(--f-mono)',
                  fontSize: '0.68rem',
                  padding: '0.25rem 0.55rem',
                  background: 'var(--bg)',
                  border: '1px solid var(--rule2)',
                  color: 'var(--ink2)',
                  cursor: 'pointer',
                  borderRadius: '3px'
                }}
              >
                {label}
              </button>
            ))}
          </div>
        </div>

        {/* INTRO */}
        <div className="intro">
          <p>
            Large Language Models default to <em>sycophancy</em> and <em>unanchored idealist ethics</em>: when asked to evaluate complex social arrangements, they instinctively synthesize opposing viewpoints into bland compromise statements and evaluate institutions by their stated good intentions rather than their material incentives.
          </p>
          <p>
            PMN operates under the opposite premise: <strong>material reality is primary</strong>, information asymmetries dictate power, and moral evaluations must be strictly anchored to the biological floor (minimizing structural suffering) while expanding genuine becoming. To make an AI reason as a PMN analyst, you must feed it concrete architecture, force it into an explicit role, and measure it by whether it detects structural capture rather than producing polite prose.
          </p>
        </div>

        {/* SECTION 1: DEPLOYMENT MODES (CLOUD VS LOCAL) */}
        <div className="step" id="deploy-modes">
          <span className="step-num">Step 01</span>
          <h2 className="step-h2">Choose Your Deployment Architecture: Cloud vs. Local AI</h2>
          <p>
            Depending on your requirements for privacy, compute budget, and session duration, PMN can be deployed through cloud frontier platforms or 100% offline, self-hosted local engines.
          </p>

          <div className="vtabs" style={{ marginTop: '1.2rem', marginBottom: '1.2rem' }}>
            <button
              className={`vtab ${activeDeployTab === 'cloud' ? 'active' : ''}`}
              onClick={() => setActiveDeployTab('cloud')}
            >
              ☁️ Cloud / Frontier AI (NotebookLM, Claude, Gemini, ChatGPT)
            </button>
            <button
              className={`vtab ${activeDeployTab === 'local' ? 'active' : ''}`}
              onClick={() => setActiveDeployTab('local')}
            >
              🔒 Local / Sovereign AI (Ollama, LM Studio, Jan, Open-Weights)
            </button>
          </div>

          {activeDeployTab === 'cloud' && (
            <div>
              <div className="workflow-grid">
                <div className="workflow-card">
                  <div className="workflow-name">Google NotebookLM</div>
                  <div className="workflow-note">Upload the PMN PDF (~660 pages) directly as a source notebook. Grounding is strictly constrained to the text with inline page citations. Zero hallucinated section IDs.</div>
                  <span className="workflow-badge badge-best">Best for Citation Fidelity</span>
                </div>
                <div className="workflow-card">
                  <div className="workflow-name">Claude Projects (Sonnet 3.7)</div>
                  <div className="workflow-note">Attach <code>pmn_corpus_for_ai.md</code> into Project Knowledge with custom instructions. Excels at deep architectural debate, multi-part synthesis, and long-session continuity.</div>
                  <span className="workflow-badge badge-best">Best for Deep Reasoning</span>
                </div>
                <div className="workflow-card">
                  <div className="workflow-name">Gemini 1.5 / 2.0 Pro</div>
                  <div className="workflow-note">Supports 1M–2M token context window. Ingests the entire ~330,000-word uncompressed manuscript in a single prompt without chunking or state loss.</div>
                  <span className="workflow-badge badge-good">Best for Massive Context</span>
                </div>
                <div className="workflow-card">
                  <div className="workflow-name">DeepSeek V3 / R1</div>
                  <div className="workflow-note">Extended Chain-of-Thought reasoning. Deconstructs institutional rhetoric and maps capture sequences with high analytical skepticism.</div>
                  <span className="workflow-badge badge-good">Best for Forensic Scrutiny</span>
                </div>
              </div>
              <div className="note-box">
                <span className="note-label">Cloud Deployment Rule of Thumb</span>
                For casual research and interactive verification, use <strong>Google NotebookLM</strong>. For extended policy stress-testing or drafting, use <strong>Claude Projects</strong> with the full Markdown corpus attached.
              </div>
            </div>
          )}

          {activeDeployTab === 'local' && (
            <div>
              <div className="workflow-grid">
                <div className="workflow-card">
                  <div className="workflow-name">Ollama (CLI &amp; API)</div>
                  <div className="workflow-note">Run Qwen 2.5 (14B/32B) or Llama 3.3 (70B) locally. Build custom models via a single <code>Modelfile</code> with injected system prompts. Completely offline, zero telemetry.</div>
                  <span className="workflow-badge badge-best">Top Local Recommendation</span>
                </div>
                <div className="workflow-card">
                  <div className="workflow-name">LM Studio / Jan.ai (GUI)</div>
                  <div className="workflow-note">Desktop chat interface for GGUF models. Easy attachment of <code>pmn_corpus_for_ai.md</code> into local context or multi-document local RAG.</div>
                  <span className="workflow-badge badge-good">Easiest Desktop Setup</span>
                </div>
                <div className="workflow-card">
                  <div className="workflow-name">AnythingLLM / Dify (Local RAG)</div>
                  <div className="workflow-note">Self-hosted vector pipeline. Ingests the PMN JSON modules (<code>manifest.json</code>, <code>gl.json</code>) into local embeddings for enterprise or sensitive institutional audits.</div>
                  <span className="workflow-badge badge-good">Best for Local RAG</span>
                </div>
                <div className="workflow-card">
                  <div className="workflow-name">Agentic IDEs (Cursor / Windsurf)</div>
                  <div className="workflow-note">Point agent rules (<code>.cursorrules</code>) to <code>llms.txt</code> and <code>llms.json</code> for live pairing when writing philosophical, legal, or analytical software.</div>
                  <span className="workflow-badge badge-best">Best for Developers</span>
                </div>
              </div>
              <div className="note-box">
                <span className="note-label">Why Deploy Locally?</span>
                PMN's institutional capture and corruption diagnostics (§7.3c, §14.6) frequently involve evaluating sensitive internal organizational data. Local deployment guarantees zero risk of data leakage or external vendor surveillance.
              </div>
            </div>
          )}
        </div>

        {/* SECTION 2: MODEL SELECTION MATRIX */}
        <div className="step" id="model-matrix">
          <span className="step-num">Step 02</span>
          <h2 className="step-h2">Frontier Model Capability &amp; Diagnostic Selection Matrix</h2>
          <p>
            No single model dominates every PMN task. Extended reasoning models excel at causal forensics, while large-context generalists excel at multi-part manuscript synthesis.
          </p>

          <div style={{ overflowX: 'auto', margin: '1.5rem 0' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem', fontFamily: 'var(--f-body)', border: '1px solid var(--rule)' }}>
              <thead>
                <tr style={{ background: 'var(--bg2)', borderBottom: '2px solid var(--rule)', textAlign: 'left' }}>
                  <th style={{ padding: '0.65rem 0.85rem', fontFamily: 'var(--f-mono)', fontSize: '0.72rem', textTransform: 'uppercase' }}>Model / Family</th>
                  <th style={{ padding: '0.65rem 0.85rem', fontFamily: 'var(--f-mono)', fontSize: '0.72rem', textTransform: 'uppercase' }}>Context Window</th>
                  <th style={{ padding: '0.65rem 0.85rem', fontFamily: 'var(--f-mono)', fontSize: '0.72rem', textTransform: 'uppercase' }}>Strongest PMN Arena</th>
                  <th style={{ padding: '0.65rem 0.85rem', fontFamily: 'var(--f-mono)', fontSize: '0.72rem', textTransform: 'uppercase' }}>Known Failure Modes</th>
                  <th style={{ padding: '0.65rem 0.85rem', fontFamily: 'var(--f-mono)', fontSize: '0.72rem', textTransform: 'uppercase' }}>Ingestion Strategy</th>
                </tr>
              </thead>
              <tbody>
                <tr style={{ borderBottom: '1px solid var(--rule)' }}>
                  <td style={{ padding: '0.75rem 0.85rem', fontWeight: 600 }}>Claude 3.7 Sonnet (Thinking)</td>
                  <td style={{ padding: '0.75rem 0.85rem', fontFamily: 'var(--f-mono)', fontSize: '0.8rem' }}>200K tokens</td>
                  <td style={{ padding: '0.75rem 0.85rem' }}>Architectural consistency, maintaining unresolved permanent tensions (Part XIII), complex qualitative reasoning.</td>
                  <td style={{ padding: '0.75rem 0.85rem', color: 'var(--mute)' }}>Can be verbose; needs explicit word count caps if fast output is desired.</td>
                  <td style={{ padding: '0.75rem 0.85rem' }}>Upload <code>pmn_corpus_for_ai.md</code> in Claude Project.</td>
                </tr>
                <tr style={{ borderBottom: '1px solid var(--rule)', background: 'var(--bg2)' }}>
                  <td style={{ padding: '0.75rem 0.85rem', fontWeight: 600 }}>Google NotebookLM</td>
                  <td style={{ padding: '0.75rem 0.85rem', fontFamily: 'var(--f-mono)', fontSize: '0.8rem' }}>Full PDF (~660 pgs)</td>
                  <td style={{ padding: '0.75rem 0.85rem' }}>Zero-hallucination ground truth retrieval; clickable inline citations; audio podcast synthesis.</td>
                  <td style={{ padding: '0.75rem 0.85rem', color: 'var(--mute)' }}>Cannot perform multi-turn interactive roleplay as freely as chat models.</td>
                  <td style={{ padding: '0.75rem 0.85rem' }}>Upload official typeset <code>PMN_Latest.pdf</code>.</td>
                </tr>
                <tr style={{ borderBottom: '1px solid var(--rule)' }}>
                  <td style={{ padding: '0.75rem 0.85rem', fontWeight: 600 }}>DeepSeek-R1 / V3</td>
                  <td style={{ padding: '0.75rem 0.85rem', fontFamily: 'var(--f-mono)', fontSize: '0.8rem' }}>64K–128K tokens</td>
                  <td style={{ padding: '0.75rem 0.85rem' }}>Forensic deconstruction of ideology; detection of subtle 5-stage capture (§7.3c-i); high adversarial immunity.</td>
                  <td style={{ padding: '0.75rem 0.85rem', color: 'var(--mute)' }}>Context window is tighter; full manuscript must be chunked or condensed to §15.15.</td>
                  <td style={{ padding: '0.75rem 0.85rem' }}>Chunked module upload or Reader context packs.</td>
                </tr>
                <tr style={{ borderBottom: '1px solid var(--rule)', background: 'var(--bg2)' }}>
                  <td style={{ padding: '0.75rem 0.85rem', fontWeight: 600 }}>Gemini 1.5 / 2.0 Pro</td>
                  <td style={{ padding: '0.75rem 0.85rem', fontFamily: 'var(--f-mono)', fontSize: '0.8rem' }}>1M–2M tokens</td>
                  <td style={{ padding: '0.75rem 0.85rem' }}>Whole-corpus simultaneous ingestion; broad cross-sectional inquiries spanning Part I to Part XVII.</td>
                  <td style={{ padding: '0.75rem 0.85rem', color: 'var(--mute)' }}>Tendency to 'over-smooth' harsh materialist conclusions into conventional ethical consensus.</td>
                  <td style={{ padding: '0.75rem 0.85rem' }}>Full uncompressed Markdown upload in Google AI Studio.</td>
                </tr>
                <tr style={{ borderBottom: '1px solid var(--rule)' }}>
                  <td style={{ padding: '0.75rem 0.85rem', fontWeight: 600 }}>Qwen 2.5 (32B / 72B)</td>
                  <td style={{ padding: '0.75rem 0.85rem', fontFamily: 'var(--f-mono)', fontSize: '0.8rem' }}>32K–128K tokens</td>
                  <td style={{ padding: '0.75rem 0.85rem' }}>Best open-weights model for following complex systemic instructions and evaluating structural variables.</td>
                  <td style={{ padding: '0.75rem 0.85rem', color: 'var(--mute)' }}>Requires adequate local GPU VRAM (16GB–48GB) for full-context speed.</td>
                  <td style={{ padding: '0.75rem 0.85rem' }}>Ollama <code>Modelfile</code> with system prompt and target parts.</td>
                </tr>
                <tr>
                  <td style={{ padding: '0.75rem 0.85rem', fontWeight: 600 }}>OpenAI o1 / o3-mini / 4o</td>
                  <td style={{ padding: '0.75rem 0.85rem', fontFamily: 'var(--f-mono)', fontSize: '0.8rem' }}>128K tokens</td>
                  <td style={{ padding: '0.75rem 0.85rem' }}>Mathematical calculations of transformation pressure formulas ($T = S \cdot D \cdot P \cdot G$); Custom GPT deployment.</td>
                  <td style={{ padding: '0.75rem 0.85rem', color: 'var(--mute)' }}>Prone to moralizing tone unless instructed with strict non-ideal behavioral prompts.</td>
                  <td style={{ padding: '0.75rem 0.85rem' }}>Custom GPT Instructions with PDF knowledge file.</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        {/* SECTION 3: LOCAL AI SETUP */}
        <div className="step" id="local-setup">
          <span className="step-num">Step 03</span>
          <h2 className="step-h2">Deploying Sovereign Local AI with Ollama</h2>
          <p>
            You can instantiate a local PMN Analyst in under 3 minutes using Ollama on Windows, macOS, or Linux.
          </p>

          <div className="checklist">
            <div className="check-item">
              <strong>1. Install Ollama &amp; Pull Model</strong>
              <span>Install Ollama from <code>ollama.com</code>. For 16GB RAM/VRAM, pull <code>qwen2.5:14b</code> or <code>qwen2.5:32b</code>:
              <br /><code style={{ fontSize: '0.75rem' }}>ollama pull qwen2.5:32b</code></span>
            </div>
            <div className="check-item">
              <strong>2. Download PMN Corpus</strong>
              <span>Save the flat AI text file to your local machine:
              <br /><a href="https://novadharma-hub.github.io/pmn-framework/pmn_corpus_for_ai.md" target="_blank" rel="noopener noreferrer" style={{ color: 'var(--acc-text)' }}>Download pmn_corpus_for_ai.md &darr;</a></span>
            </div>
            <div className="check-item">
              <strong>3. Build the Model Container</strong>
              <span>Create a text file named <code>Modelfile</code> (copy the template below) and run:
              <br /><code style={{ fontSize: '0.75rem' }}>ollama create pmn-agent -f Modelfile</code></span>
            </div>
          </div>

          <div className="code-block">
            <span className="code-label">Ollama Modelfile Template</span>
            <button className={`copy-btn ${copiedStates['modelfile-btn'] ? 'copied' : ''}`} onClick={() => copyText('modelfile-btn', prompts.modelfile)}>
              {copiedStates['modelfile-btn'] ? 'Copied' : 'Copy Modelfile'}
            </button>
            <div className="code-text">{prompts.modelfile}</div>
          </div>
        </div>

        {/* SECTION 4: UPGRADED PROMPT LIBRARY */}
        <div className="step" id="prompt-library">
          <span className="step-num">Step 04</span>
          <h2 className="step-h2">The Operational Prompt Library (8 Strategic Roles)</h2>
          <p>
            Choose an operational role below. Giving the AI a specialized analytical objective prevents generic summarization and activates PMN's rigorous structural codebook.
          </p>

          <div className="variants">
            <div className="vtabs" style={{ display: 'flex', flexWrap: 'wrap', gap: '0.2rem' }}>
              {[
                ['priming', 'Priming Protocol (v118.6)'],
                ['general', '1. Structural Analyst'],
                ['diagnostic', '2. Capture Diagnostician'],
                ['adversarial', '3. Red-Team Debate'],
                ['transformation', '4. Strategic Transformation'],
                ['meaning', '5. Meaning Triage (§5.6b/c)'],
                ['agent', '6. Agentic IDE / System'],
                ['modelfile', '7. Ollama Modelfile']
              ].map(([key, label]) => (
                <button
                  key={key}
                  className={`vtab ${activeRoleTab === key ? 'active' : ''}`}
                  onClick={() => setActiveRoleTab(key as any)}
                >
                  {label}
                </button>
              ))}
            </div>

            {/* TAB CONTENTS */}
            <div className="vpanel active" style={{ marginTop: '1rem' }}>
              <div className="code-block">
                <span className="code-label">
                  {activeRoleTab === 'priming' && 'Comprehensive Priming Prompt (Use on First Turn)'}
                  {activeRoleTab === 'general' && 'Role 1: General Structural Analyst Prompt'}
                  {activeRoleTab === 'diagnostic' && 'Role 2: Forensic Institutional Capture Diagnostician Prompt'}
                  {activeRoleTab === 'adversarial' && 'Role 3: Adversarial Red-Team & Pressure-Testing Prompt'}
                  {activeRoleTab === 'transformation' && 'Role 4: Strategic Transformation & Counter-Power Prompt'}
                  {activeRoleTab === 'meaning' && 'Role 5: Meaning Infrastructure & Acute Triage Prompt'}
                  {activeRoleTab === 'agent' && 'Role 6: Developer / Agentic System Prompt'}
                  {activeRoleTab === 'modelfile' && 'Role 7: Ollama Modelfile Configuration'}
                </span>
                <button
                  className={`copy-btn ${copiedStates[activeRoleTab] ? 'copied' : ''}`}
                  onClick={() => copyText(activeRoleTab, prompts[activeRoleTab])}
                >
                  {copiedStates[activeRoleTab] ? 'Copied' : 'Copy Prompt'}
                </button>
                <div className="code-text">{prompts[activeRoleTab]}</div>
              </div>
            </div>
          </div>
        </div>

        {/* SECTION 5: STRUCTURAL QUESTION BANK */}
        <div className="step" id="question-bank">
          <span className="step-num">Step 05</span>
          <h2 className="step-h2">The Structural Question Bank: Tested Case Templates</h2>
          <p>
            Vague questions yield vague answers. A high-yield PMN prompt specifies the structural arrangement, the suspected asymmetry, and the exact falsification criteria.
          </p>

          <div className="question-grid">
            <div className="question-card">
              <div className="question-name">Labor &amp; Platform Economics</div>
              <div className="question-note">
                "Using PMN §3.4, §6.2, and §11.3, evaluate gig-economy flexibility: Is worker adoption driven by genuine flourishing, or is it a defensive choice formed within a structurally degraded alternative set? What empirical evidence would disprove this?"
              </div>
            </div>
            <div className="question-card">
              <div className="question-name">Regulatory Agency Capture</div>
              <div className="question-note">
                "Audit [Agency X] against PMN's 5-Stage Capture Sequence (§7.3c-i). At which stage is the institution currently stabilized? Trace how technical complexity is used as a barrier to public contestability (§6.5)."
              </div>
            </div>
            <div className="question-card">
              <div className="question-name">Institutional Collapse &amp; Meaning</div>
              <div className="question-note">
                "Analyze the collapse of communal civic organizations through PMN §5.6b. Evaluate their status across the 5 functional dimensions of meaning infrastructure. Propose a minimal material triage protocol (§5.6c)."
              </div>
            </div>
            <div className="question-card">
              <div className="question-name">Reflexive Self-Critique</div>
              <div className="question-note">
                "Subject PMN's own reform recommendations to §12.5 (Epistemic Traps). Is this proposal falling into Technocratic Drift (§12.5b) or Moralizing Substitution (§12.5c)?"
              </div>
            </div>
          </div>
        </div>

        {/* SECTION 6: MACHINE ENDPOINTS */}
        <div className="step" id="machine-endpoints">
          <span className="step-num">Step 06</span>
          <h2 className="step-h2">Official Machine &amp; AI Grounding Endpoints</h2>
          <p>
            For programmatic pipelines, automated scraping, LangChain/LlamaIndex agents, or direct prompt feeding, use the canonical static endpoints below. All endpoints are CORS-enabled and bypass SPA client routing.
          </p>

          <div className="workflow-grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', marginTop: '1.2rem' }}>
            {[
              {
                id: 'ep-txt',
                format: 'TXT',
                name: 'llms.txt (Standard Index)',
                url: 'https://novadharma-hub.github.io/pmn-framework/llms.txt',
                desc: 'Official llmstxt.org discovery index with clean summaries and links to all architectural modules.'
              },
              {
                id: 'ep-json',
                format: 'JSON',
                name: 'llms.json (API Manifest)',
                url: 'https://novadharma-hub.github.io/pmn-framework/llms.json',
                desc: 'Machine-readable JSON schema with 21 part endpoints, statistics, and metadata for automated code.'
              },
              {
                id: 'ep-md',
                format: 'MD',
                name: 'llms.md (AI Documentation)',
                url: 'https://novadharma-hub.github.io/pmn-framework/llms.md',
                desc: 'Rich Markdown documentation with architectural tables, section counts, and priming prompts.'
              },
              {
                id: 'ep-corpus',
                format: 'CORPUS',
                name: 'pmn_corpus_for_ai.md',
                url: 'https://novadharma-hub.github.io/pmn-framework/pmn_corpus_for_ai.md',
                desc: 'Flat, uncompressed ~330,000-word manuscript export without HTML tags, ideal for full LLM upload.'
              },
              {
                id: 'ep-manifest',
                format: 'DATA',
                name: 'manifest.json (Parts & Subs)',
                url: 'https://novadharma-hub.github.io/pmn-framework/data/parts/manifest.json',
                desc: 'Structural hierarchy of all 21 parts, titles, section IDs, and subsection markers.'
              },
              {
                id: 'ep-gl',
                format: 'DATA',
                name: 'gl.json (237 Glossary Terms)',
                url: 'https://novadharma-hub.github.io/pmn-framework/data/gl.json',
                desc: 'Complete philosophical vocabulary definitions with section cross-reference citations.'
              }
            ].map(ep => (
              <div key={ep.id} className="workflow-card" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between', padding: '1rem' }}>
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.4rem' }}>
                    <span style={{ fontFamily: 'var(--f-mono)', fontSize: '0.65rem', fontWeight: 700, padding: '0.15rem 0.45rem', borderRadius: '3px', background: 'var(--acc)', color: 'var(--bg)' }}>
                      {ep.format}
                    </span>
                    <a href={ep.url} target="_blank" rel="noopener noreferrer" style={{ fontSize: '0.75rem', color: 'var(--acc-text)', textDecoration: 'none' }}>
                      Open &rarr;
                    </a>
                  </div>
                  <div className="workflow-name" style={{ fontSize: '0.92rem', fontWeight: 600 }}>{ep.name}</div>
                  <div className="workflow-note" style={{ fontSize: '0.8rem', marginTop: '0.3rem', color: 'var(--mute)', lineHeight: 1.45 }}>{ep.desc}</div>
                </div>
                <div style={{ marginTop: '0.8rem', paddingTop: '0.6rem', borderTop: '1px solid var(--rule)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <code style={{ fontSize: '0.68rem', color: 'var(--mute)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: '170px' }}>
                    {ep.url.replace('https://novadharma-hub.github.io/pmn-framework', '')}
                  </code>
                  <button
                    className={`copy-btn ${copiedStates[ep.id] ? 'copied' : ''}`}
                    style={{ position: 'static', padding: '0.2rem 0.5rem', fontSize: '0.68rem' }}
                    onClick={() => copyText(ep.id, ep.url)}
                  >
                    {copiedStates[ep.id] ? 'Copied' : 'Copy URL'}
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* SECTION 7: SCRAPING PITFALLS */}
        <div className="step" id="scraping-pitfalls">
          <span className="step-num">Step 07</span>
          <h2 className="step-h2">Navigate Web-Scraper Limitations &amp; Hallucination Traps</h2>
          <p>
            Feeding live web links directly to public search LLMs often fails silently. Understand these five scraper failure modes to maintain rigorous grounding:
          </p>

          <div className="note-box" style={{ borderLeft: '3px solid var(--acc)' }}>
            <span className="note-label">⚠️ The Five Web-Scraping Blindspots</span>
            <ul style={{ fontSize: '0.88rem', color: 'var(--ink2)', lineHeight: 1.75, paddingLeft: '1.2rem', margin: '0.5rem 0', listStyleType: 'decimal' }}>
              <li><strong>Dynamic Single-Page Application (SPA):</strong> Most web crawlers do not execute JavaScript; they receive an empty root container instead of rendered prose. Always point them to <code>pmn_corpus_for_ai.md</code> or <code>llms.txt</code>.</li>
              <li><strong>Ignored Hash Anchors:</strong> Crawlers strip URL hashes (e.g. <code>/#/s/1.3</code>). A query directed to a specific section will only pull the general home page metadata.</li>
              <li><strong>Interactive UI Concealment:</strong> Accordions, glossary modals, and sliding sidebars are invisible to basic HTTP scrapers.</li>
              <li><strong>Plausible Hallucination Fallback:</strong> When a crawler sees a title like "Progressive Materialist Naturalism" but cannot access the body text, the LLM hallucinates generic 19th-century Marxist or physicalist tropes.</li>
              <li><strong>Rapid Persona Decay:</strong> Instructing a model via chat to "roleplay as PMN" decays within 3–4 turns unless grounded in an uploaded source file or persistent project prompt.</li>
            </ul>
          </div>
        </div>

        {/* CLOSING REMARKS */}
        <div className="closing">
          A successful PMN AI deployment makes the model noticeably more disciplined, not merely more eloquent. If an answer sounds smooth and universally agreeable while the specific structural variables and section cross-references fade away, the deployment has failed. Keep the text loaded, enforce structural roles, and demand empirical falsification standards.
        </div>

        {/* ABOUT & PRIVACY */}
        <div className="page-section" style={{ marginTop: '3.5rem' }}>
          <h2 className="page-h2">About This Platform</h2>
          <p className="page-body">
            This is the official reader and AI grounding platform for <em>Progressive Materialist Naturalism</em> (PMN) v{version} by Nova Dharma. Source code, version history, and release assets are publicly available on{' '}
            <a href="https://github.com/novadharma-hub/pmn-framework" target="_blank" rel="noopener noreferrer" className="text-pmn-acc hover:underline">GitHub</a>.
          </p>
          <p className="page-body">
            The platform is engineered as a static Progressive Web App (PWA) hosted on GitHub Pages—requiring no backend databases, user tracking, or account registration.
          </p>
        </div>
      </div>

      <footer className="py-12 border-t border-pmn-rule text-center text-xs font-pmn-mono text-pmn-mute uppercase tracking-[0.3em] bg-pmn-bg">
        Progressive Materialist Naturalism &mdash; V{version} &bull; Canonical AI Specification
      </footer>
    </div>
  )
}
