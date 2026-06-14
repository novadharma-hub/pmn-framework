import React, { useState } from 'react'

interface GuideViewProps {
  onBackHome: () => void
  version: string
}

export default function GuideView({ onBackHome, version }: GuideViewProps) {
  const [activeRoleTab, setActiveRoleTab] = useState<'general' | 'diagnostic' | 'debate'>('general')
  const [copiedStates, setCopiedStates] = useState<Record<string, boolean>>({})

  const copyText = (id: string, text: string) => {
    navigator.clipboard.writeText(text).then(() => {
      setCopiedStates(prev => ({ ...prev, [id]: true }))
      setTimeout(() => {
        setCopiedStates(prev => ({ ...prev, [id]: false }))
      }, 1800)
    }).catch(() => {})
  }

  const prompts = {
    priming: `I am attaching PMN (Progressive Materialist Naturalism) v${version} by Nova Dharma. Read it as a framework to reason with, not as a document to summarize.

Your task is to internalize its architecture:
- epistemology and revision discipline
- ontology and material commitments
- the biological floor and evaluative criterion
- structural analysis, failure modes, and institutional diagnosis
- the compressed core in 15.15 when simplification is required

When I ask you to analyze something using PMN, reason from within the framework rather than describing it from outside.

Do not rely on URL browsing assumptions if manuscript text is already supplied directly.

Confirm comprehension in under 150 words by explaining how Parts I, II, and III generate the framework's evaluative starting point.`,
    general: `From this point forward, operate as a PMN analyst.

Reason from within the framework rather than describing it from outside.

For each case:
- identify the structural arrangement being evaluated
- name the most relevant PMN sections or variables
- distinguish what the text states from what must be inferred
- preserve the difference between the minimal anchor and the fuller horizon of becoming
- cite section IDs when doing so improves precision`,
    diagnostic: `Operate as a PMN diagnostic analyst.

For each case I bring:
- identify the dominant structural variables
- name the most activated PMN tensions or diagnostics
- identify the likely failure modes in the analysis itself
- separate what is evidenced from what is only plausible
- end with the missing evidence PMN would need for stronger confidence

You are not required to reach a verdict when the evidence is incomplete.`,
    debate: `Operate as a PMN debate partner.

For each argument I give you:
1. reconstruct the strongest PMN-readable version of it
2. identify what PMN would find structurally persuasive
3. identify where the argument becomes architecturally incomplete
4. test whether the same lens is being applied consistently

The goal is analytical pressure-testing, not rhetorical victory.`,
    template: `Using PMN, analyze [arrangement, doctrine, case, or policy].

Do not answer at the level of slogans.

Instead:
- identify the structural arrangement being evaluated
- name the most relevant section IDs
- say which variables or diagnostics matter most
- identify the likely failure mode in the analysis itself
- end with the evidence that would most likely change the conclusion`,
    reset: `Return to PMN mode.

Re-ground the answer in the supplied PMN material.

Before answering:
- name the most relevant section IDs
- identify the structural variables or diagnostics at stake
- state the main evidential gap
- preserve the difference between the biological floor and the fuller horizon of becoming

Do not become smoother than the evidence allows.`
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
      maxWidth: '920px',
      width: '100%'
    }}
  >
      
      {/* HEADER */}
      <div className="sv-hdr-wrap border-b border-pmn-rule bg-pmn-bg sticky top-0 z-20">
        <div className="max-w-[920px] mx-auto flex items-center justify-between px-4 lg:px-8 py-4">
          <p className="sv-hdr !border-none !p-0 !m-0 font-pmn-head text-[1.4rem] text-pmn-ink" id="sv-hdr">
            AI Agent Guide
          </p>
          <button className="hbtn font-mono text-[0.7rem] uppercase tracking-widest text-pmn-mute hover:text-pmn-ink transition-colors" onClick={onBackHome}>
            &larr; Return Home
          </button>
        </div>
      </div>

      <div className="guide-page">
        <div className="page-eyebrow">PMN v{version} - Nova Dharma</div>
        <h1 className="page-h1">Using PMN<br /><em style={{ color: 'var(--acc)' }}>as an AI Agent</em></h1>
        <p className="page-subtitle">A practical guide to deploying the framework through Claude, DeepSeek, ChatGPT, Gemini, and similar systems without letting the manuscript dissolve into generic ideology talk.</p>

        <div className="page-actions">
          <a className="btn-dl" href="https://github.com/novadharma-hub/pmn-framework/releases/latest" target="_blank" rel="noopener noreferrer">
            <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" className="inline mr-2"><path d="M8 2v8M5 7l3 3 3-3M2 11v1a2 2 0 002 2h8a2 2 0 002-2v-1"/></svg>
            Download PDF / Markdown
          </a>
          <button className="btn-dl cursor-pointer" onClick={onBackHome}>
            <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" className="inline mr-2"><path d="M10 8H2M5 5L2 8l3 3M14 4v8"/></svg>
            Open Reader
          </button>
        </div>

        <div className="intro">
          <p>PMN works best in AI when the model is made to reason from the framework's architecture rather than merely summarize it. That means giving the system real manuscript text, assigning an operational role, and checking whether it preserves the distinction between the biological floor, structural diagnosis, and the fuller horizon of becoming.</p>
          <p>This guide is for practical deployment, not abstract commentary. It compares major systems, tells you when to use the reader versus a full upload, gives concrete prompts, and explains how to keep the model from sliding back into generic political-philosophy prose.</p>
        </div>

        <div className="step">
          <span className="step-num">Step 01</span>
          <h2 className="step-h2">Choose the deployment mode</h2>
          <p>There are three useful ways to run PMN through AI, and they are not interchangeable.</p>
          <div className="workflow-grid">
            <div className="workflow-card">
              <div className="workflow-name">Full manuscript upload</div>
              <div className="workflow-note">Best for long sessions, repeated case analysis, and debates where the model needs to hold the architecture in working memory.</div>
              <span className="workflow-badge badge-best">Best depth</span>
            </div>
            <div className="workflow-card">
              <div className="workflow-name">Reader-grounded context pack</div>
              <div className="workflow-note">Best for targeted questions. Use the PMN site to surface the relevant sections first, then paste the prepared context into your AI system.</div>
              <span className="workflow-badge badge-good">Best precision</span>
            </div>
            <div className="workflow-card">
              <div className="workflow-name">Chunked upload</div>
              <div className="workflow-note">Use when the platform struggles with the whole PDF. Load the framework in stages and keep a short state memo between turns.</div>
              <span className="workflow-badge badge-good">Best fallback</span>
            </div>
            <div className="workflow-card">
              <div className="workflow-name">URL only</div>
              <div className="workflow-note">Do not rely on this. A static reader plus hash anchors is not enough to guarantee that the model actually read the relevant PMN text.</div>
              <span className="workflow-badge badge-stop">Avoid</span>
            </div>
          </div>
          <div className="note-box">
            <span className="note-label">Practical recommendation</span>
            If you want durable PMN-mode reasoning, start with the full PDF or a Markdown export. If you want a narrower answer about one issue, section, or case, the reader-grounded context pack is faster and usually safer.
          </div>
        </div>

        <div className="step">
          <span className="step-num">Step 02</span>
          <h2 className="step-h2">Choose the system deliberately</h2>
          <p>Different platforms fail in different ways. The best choice depends on whether you need document retention, diagnostic rigidity, synthesis, or translation for a new reader.</p>
          <div className="platform-grid">
            <div className="platform-card">
              <div className="workflow-name">Claude</div>
              <div className="workflow-note">Usually the strongest for full-manuscript retention, long-form reasoning, and preserving architectural distinctions across a long thread.</div>
              <span className="workflow-badge badge-best">Best for full-PMN mode</span>
            </div>
            <div className="platform-card">
              <div className="workflow-name">DeepSeek</div>
              <div className="workflow-note">Often strong for narrower diagnostics, adversarial pressure-testing, and explicit structural reasoning. Good value for tighter workflows.</div>
              <span className="workflow-badge badge-good">Best for diagnostics</span>
            </div>
            <div className="platform-card">
              <div className="workflow-name">ChatGPT</div>
              <div className="workflow-note">Good generalist, especially with reader-grounded context packs, but more likely to smooth PMN into generic explanation unless prompted firmly.</div>
              <span className="workflow-badge badge-good">Best with context packs</span>
            </div>
            <div className="platform-card">
              <div className="workflow-name">Gemini</div>
              <div className="workflow-note">Useful for broad synthesis and long inputs, but sometimes too eager to harmonize tensions that PMN wants to keep analytically alive.</div>
              <span className="workflow-badge badge-ok">Best for synthesis</span>
            </div>
            <div className="platform-card">
              <div className="workflow-name">Google NotebookLM</div>
              <div className="workflow-note">Upload the PMN PDF as a source and it becomes the notebook's permanent grounding. Strong for citation-backed retrieval. Use the Audio Overview for a fast first-pass orientation.</div>
              <span className="workflow-badge badge-best">Best for grounded retrieval</span>
            </div>
          </div>
          <div className="callout">
            <strong>On plans and tiers:</strong> plan names and limits change often, so this guide does not hard-code them. For a full ~600-page PMN workflow, use the highest-context upload tier available on the platform you choose.
          </div>
          <div className="note-box">
            <span className="note-label">Google NotebookLM — how to use it well</span>
            <p style={{ fontSize: '.9rem', color: 'var(--ink2)', lineHeight: 1.75, marginBottom: '.7rem' }}>NotebookLM is free and treats uploaded sources as the only ground truth the model draws from — making it unusually resistant to hallucinated section IDs.</p>
            <ul style={{ fontSize: '.88rem', color: 'var(--mute)', lineHeight: 1.8, paddingLeft: '1.2rem', marginBottom: '.5rem', listStyleType: 'disc' }}>
              <li><strong>Upload the PMN PDF as a source.</strong> Every answer will be anchored to it with clickable inline citations.</li>
              <li><strong>Use the Audio Overview first.</strong> It generates a 10–15 min dialogue summarising the manuscript.</li>
              <li><strong>Ask for section IDs explicitly.</strong> Verify that the citation matches the actual PMN text.</li>
              <li><strong>Use the Study Guide feature.</strong> Seed your own follow-up prompts with these to stay framework-grounded.</li>
            </ul>
          </div>
        </div>

        <div className="step">
          <span className="step-num">Step 03</span>
          <h2 className="step-h2">Load the manuscript the right way</h2>
          <p>If the model is going to reason as PMN, it needs the framework as text, not just the brand name. The loading strategy should match the size of the session you want.</p>
          <div className="checklist">
            <div className="check-item"><strong>Full PDF route</strong><span>Upload the current PDF, then use a priming prompt that asks for architecture, not summary.</span></div>
            <div className="check-item"><strong>Markdown route</strong><span>If your platform handles plain text more reliably than PDF, use a Markdown export.</span></div>
            <div className="check-item"><strong>Chunked route</strong><span>Load Part I-III first, then the relevant later Parts.</span></div>
            <div className="check-item"><strong>Reader route</strong><span>Use the PMN site to retrieve the exact sections, then paste those.</span></div>
          </div>

          <div className="code-block">
            <span className="code-label">Priming prompt</span>
            <button className={`copy-btn ${copiedStates['priming'] ? 'copied' : ''}`} onClick={() => copyText('priming', prompts.priming)}>
              {copiedStates['priming'] ? 'copied' : 'copy'}
            </button>
            <div className="code-text">{prompts.priming}</div>
          </div>

          <div className="note-box">
            <span className="note-label">What to check</span>
            A good confirmation should preserve the sequence: epistemology establishes how claims are disciplined, ontology establishes what kind of reality is being analyzed, and Part III provides the non-arbitrary evaluative floor.
          </div>
        </div>

        <div className="step">
          <span className="step-num">Step 04</span>
          <h2 className="step-h2">Assign the operating role</h2>
          <p>After the load step, tell the model what kind of PMN work you want. The sharper the role, the less likely it is to drift into vague explanation.</p>

          <div className="variants">
            <div className="vtabs">
              <button className={`vtab ${activeRoleTab === 'general' ? 'active' : ''}`} onClick={() => setActiveRoleTab('general')}>General analyst</button>
              <button className={`vtab ${activeRoleTab === 'diagnostic' ? 'active' : ''}`} onClick={() => setActiveRoleTab('diagnostic')}>Diagnostic analyst</button>
              <button className={`vtab ${activeRoleTab === 'debate' ? 'active' : ''}`} onClick={() => setActiveRoleTab('debate')}>Debate partner</button>
            </div>

            {activeRoleTab === 'general' && (
              <div className="vpanel active">
                <div className="code-block">
                  <span className="code-label">General analyst prompt</span>
                  <button className={`copy-btn ${copiedStates['general'] ? 'copied' : ''}`} onClick={() => copyText('general', prompts.general)}>
                    {copiedStates['general'] ? 'copied' : 'copy'}
                  </button>
                  <div className="code-text">{prompts.general}</div>
                </div>
              </div>
            )}

            {activeRoleTab === 'diagnostic' && (
              <div className="vpanel active">
                <div className="code-block">
                  <span className="code-label">Diagnostic analyst prompt</span>
                  <button className={`copy-btn ${copiedStates['diagnostic'] ? 'copied' : ''}`} onClick={() => copyText('diagnostic', prompts.diagnostic)}>
                    {copiedStates['diagnostic'] ? 'copied' : 'copy'}
                  </button>
                  <div className="code-text">{prompts.diagnostic}</div>
                </div>
              </div>
            )}

            {activeRoleTab === 'debate' && (
              <div className="vpanel active">
                <div className="code-block">
                  <span className="code-label">Debate partner prompt</span>
                  <button className={`copy-btn ${copiedStates['debate'] ? 'copied' : ''}`} onClick={() => copyText('debate', prompts.debate)}>
                    {copiedStates['debate'] ? 'copied' : 'copy'}
                  </button>
                  <div className="code-text">{prompts.debate}</div>
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="step">
          <span className="step-num">Step 05</span>
          <h2 className="step-h2">Ask better PMN questions</h2>
          <p>Most weak sessions fail because the question is underspecified. Good PMN prompts name the arrangement, the structural tension, and the standard the model should use.</p>

          <div className="question-grid">
            <div className="question-card">
              <div className="question-name">Case analysis</div>
              <div className="question-note">Using PMN, analyze whether a labor platform can be defended by worker preference when the wider choice set is structurally degraded. Name the most relevant section IDs and what evidence would change the assessment.</div>
            </div>
            <div className="question-card">
              <div className="question-name">Explanation for newcomers</div>
              <div className="question-note">Read 15.15 as the compressed core, then explain PMN in plain language without flattening the difference between the minimum anchor and the horizon of becoming.</div>
            </div>
            <div className="question-card">
              <div className="question-name">Comparative diagnosis</div>
              <div className="question-note">Using PMN, compare liberal-democratic and authoritarian responses to a legitimacy crisis. Keep the floor/ceiling distinction explicit.</div>
            </div>
            <div className="question-card">
              <div className="question-name">Self-critique</div>
              <div className="question-note">Apply PMN to PMN itself. Which failure modes from 12.5 are most likely to distort this analysis?</div>
            </div>
          </div>

          <div className="ex-thread">
            <div className="ex-msg ex-user">
              <div className="ex-role">User</div>
              <div className="ex-body">Using PMN, analyze whether gig-work flexibility is a genuine preference or a preference formed inside a structurally degraded labor market. Cite the most relevant sections and say what evidence would change the answer.</div>
            </div>
            <div className="ex-msg">
              <div className="ex-role">PMN Agent</div>
              <div className="ex-body">
                <p>A strong PMN answer should not stop at reported preference. It should ask how the choice set is structured, whether the arrangement degrades medium-term becoming capacity, and whether the preference itself is being formed under conditions of institutional betrayal or visibility suppression.</p>
                <p style={{ marginTop: '.5rem' }}>It should also tell you what would weaken the critique: durable protections, real exit options, bargaining power, and evidence that the flexibility is not merely compensation for a degraded alternative.</p>
              </div>
            </div>
          </div>

          <div className="code-block">
            <span className="code-label">Reusable question template</span>
            <button className={`copy-btn ${copiedStates['template'] ? 'copied' : ''}`} onClick={() => copyText('template', prompts.template)}>
              {copiedStates['template'] ? 'copied' : 'copy'}
            </button>
            <div className="code-text">{prompts.template}</div>
          </div>
        </div>

        <div className="step">
          <span className="step-num">Step 06</span>
          <h2 className="step-h2">Know what each system is good and bad at</h2>
          <p>The point is not to find one perfect platform. It is to know how to use each one without mistaking fluency for fidelity.</p>

          <div className="advice-grid">
            <div className="advice-card">
              <div className="advice-name">Claude</div>
              <div className="advice-note">Use for full-manuscript internalization, long architectural conversations, and careful reconstruction of tensions across Parts.</div>
            </div>
            <div className="advice-card">
              <div className="advice-name">DeepSeek</div>
              <div className="advice-note">Use for explicit diagnostics, challenge passes, and narrower case work where you want the model to stay literal and structurally disciplined.</div>
            </div>
            <div className="advice-card">
              <div className="advice-name">ChatGPT</div>
              <div className="advice-note">Use when the PMN site has already done the retrieval work. It performs better when the relevant sections are already in the prompt.</div>
            </div>
            <div className="advice-card">
              <div className="advice-name">Gemini</div>
              <div className="advice-note">Use for long inputs and broad synthesis, but watch for over-smoothing or premature reconciliation of tensions that PMN wants to hold open.</div>
            </div>
            <div className="advice-card">
              <div className="advice-name">Google NotebookLM</div>
              <div className="advice-note">Use for citation-backed verification and multi-session knowledge management. Upload the PMN PDF once; every answer is grounded to it.</div>
            </div>
          </div>

          <div className="callout">
            <strong>Do not over-read a smooth answer.</strong> A weak PMN session often sounds persuasive. The actual test is whether the model names relevant sections, preserves distinctions, and tells you what evidence it does not yet have.
          </div>
        </div>

        <div className="step">
          <span className="step-num">Step 07</span>
          <h2 className="step-h2">Reset drift before it hardens</h2>
          <p>Over time the model will drift toward generic rhetoric, summary language, or false confidence. When that starts happening, reset it explicitly.</p>

          <div className="code-block">
            <span className="code-label">Reset prompt</span>
            <button className={`copy-btn ${copiedStates['reset'] ? 'copied' : ''}`} onClick={() => copyText('reset', prompts.reset)}>
              {copiedStates['reset'] ? 'copied' : 'copy'}
            </button>
            <div className="code-text">{prompts.reset}</div>
          </div>

          <div className="checklist">
            <div className="check-item"><strong>Ask for section IDs</strong><span>If the model cannot point back to sections, it is probably freelancing.</span></div>
            <div className="check-item"><strong>Ask what would falsify it</strong><span>This exposes fake confidence fast.</span></div>
            <div className="check-item"><strong>Compare against the reader</strong><span>Open the cited sections and see whether the answer preserved the actual PMN distinction.</span></div>
            <div className="check-item"><strong>Keep a state memo</strong><span>For long projects, maintain a short running note of established conclusions.</span></div>
          </div>
        </div>

        <div className="step">
          <span className="step-num">Step 08</span>
          <h2 className="step-h2">Navigate the AI Scraping & Grounding Pitfalls</h2>
          <p>Feeding a live website link directly into an external AI search engine or a roleplay bot often fails in silent, destructive ways. To build a highly disciplined AI Agent or run a random Q&A roleplay session, you must understand the five major scraper limitations and how to bypass them.</p>
          
          <div className="note-box" style={{ borderLeft: '3px solid var(--acc)' }}>
            <span className="note-label">⚠️ The Five Severe Web-Scraping Failures</span>
            <ul style={{ fontSize: '0.88rem', color: 'var(--ink2)', lineHeight: 1.75, paddingLeft: '1.2rem', margin: '0.5rem 0', listStyleType: 'decimal' }}>
              <li><strong>1. Dynamic JS Rendering:</strong> AI bots act like simple text scrapers. Because the main PMN site wraps the manuscript inside JSON script tags, standard web crawlers only see a blank visual skeleton.</li>
              <li><strong>2. Client-Side Rendering Fails:</strong> Scrapers ignore hash parameters (like <code>/#1.1</code>). The AI only crawls the main homepage generally, failing to find the specific section context.</li>
              <li><strong>3. Hidden UI States:</strong> Bots cannot "click" or interact with sliding search drawers, accordion theses, or popovers. Anything hidden behind a UI toggle is completely invisible.</li>
              <li><strong>4. AI Hallucination Fallback:</strong> When a crawler fails to read the raw text but sees the title, it will try to sound smart by generating generic materialism/naturalism talk from its training data.</li>
              <li><strong>5. Decaying Persona:</strong> Instructing a model to "be a PMN Agent by reading this link" causes a rapid fading of context after just one or two dialogue turns.</li>
            </ul>
          </div>

          <div className="checklist">
            <div className="check-item">
              <strong>1. File Upload (The Gold Standard)</strong>
              <span>To secure durable, high-fidelity AI roleplay, always download the PMN PDF or the raw Markdown corpus, then <strong>upload it directly</strong> as a source file inside Google NotebookLM, Claude Projects, or a Custom GPT.</span>
            </div>
            <div className="check-item">
              <strong>2. The Pure Markdown Link Bypass</strong>
              <span>If you must feed a live link to a search AI, <strong>do not feed the HTML reader link</strong>. Instead, feed the direct raw Markdown URL: <code>pmn_corpus_for_ai.md</code>. This serves a flat, static, JS-free text file.</span>
            </div>
            <div className="check-item">
              <strong>3. Rely on Grounded Files</strong>
              <span>Make the model earn every conclusion by explicitly prompting: <em>"Search the uploaded PMN file for section IDs and quote the exact passage before answering."</em></span>
            </div>
          </div>
        </div>

        <div className="closing">
          The right PMN-AI workflow makes the model more disciplined, not just more articulate. If the answer gets smoother while the manuscript disappears, the deployment has failed. Keep the text present, keep the section IDs alive, and make the model earn every conclusion.
        </div>
      </div>

      <footer className="py-12 border-t border-pmn-rule text-center text-xs font-pmn-mono text-pmn-mute uppercase tracking-[0.3em] bg-pmn-bg">
        Progressive Materialist Naturalism &mdash; V{version}
      </footer>
    </div>
  )
}
