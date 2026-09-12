import React, { useState } from 'react'

interface SubSection { id: string; title: string; html?: string; text?: string }
interface Part { part: string; title: string; subs: SubSection[] }

interface AITerminalProps {
  parts: Part[]
  gl: Record<string, string>
  activeSec: SubSection | null
  onOpenGuide?: () => void
  version?: string
}

export type AIProviderId = 
  | 'claude' 
  | 'chatgpt' 
  | 'gemini' 
  | 'deepseek' 
  | 'grok' 
  | 'perplexity' 
  | 'mistral' 
  | 'openrouter' 
  | 'api'

interface ProviderItem {
  id: AIProviderId
  name: string
  company: string
  badge: string
  url: string
  desc: string
}

const PROVIDERS: ProviderItem[] = [
  { id: 'claude', name: 'Claude', company: 'Anthropic', badge: '3.7 / 3.5 Sonnet', url: 'https://claude.ai', desc: 'Deep systemic synthesis, long-context reasoning & dialectics' },
  { id: 'chatgpt', name: 'ChatGPT', company: 'OpenAI', badge: 'GPT-4o / o3-mini', url: 'https://chatgpt.com', desc: 'Universal reasoning, code synthesis & counterfactual stress-testing' },
  { id: 'gemini', name: 'Gemini', company: 'Google', badge: '2.5 Pro / 2.0 Flash', url: 'https://aistudio.google.com', desc: 'Multimodal analysis, massive 2M token context & deep research' },
  { id: 'deepseek', name: 'DeepSeek', company: 'DeepSeek', badge: 'V3 / R1 Reasoner', url: 'https://chat.deepseek.com', desc: 'Open reasoning models, mathematical logic & structural rigor' },
  { id: 'grok', name: 'Grok', company: 'xAI', badge: 'Grok 3 / Grok 2', url: 'https://grok.com', desc: 'Real-time grounding, direct philosophical critique & unfiltered analysis' },
  { id: 'perplexity', name: 'Perplexity', company: 'Perplexity', badge: 'Deep Research', url: 'https://www.perplexity.ai', desc: 'Live web synthesis, empirical citation audit & cross-referencing' },
  { id: 'mistral', name: 'Mistral', company: 'Mistral AI', badge: 'Le Chat / Large 2', url: 'https://chat.mistral.ai', desc: 'European sovereign AI, dense architectural reasoning' },
  { id: 'openrouter', name: 'OpenRouter', company: 'Multi-Model', badge: 'Llama 3.3 / Qwen', url: 'https://openrouter.ai', desc: 'Route to hundreds of open-weights models and custom endpoints' },
  { id: 'api', name: 'Developer API', company: 'Harness', badge: 'cURL / Python SDK', url: '', desc: 'Direct code snippets and payloads for local or server-side pipelines' },
]

interface ModeItem {
  id: string
  title: string
  desc: string
  directive: string
}

const MODES: ModeItem[] = [
  {
    id: 'analyst',
    title: 'Structural Materialist Analyst',
    desc: 'Traces underlying resource flows, power asymmetries, and non-arbitrary criteria (§3.4, §4.2).',
    directive: `OPERATIONAL DIRECTIVE: PMN STRUCTURAL MATERIALIST ANALYST
- Trace underlying material resource flows, power asymmetries, and incentive structures.
- Evaluate impacts on the biological floor (minimizing structural suffering) vs genuine becoming (§3.4, §4.2).
- Distinguish verified empirical evidence from self-serving institutional PR framing.`
  },
  {
    id: 'diagnostic',
    title: 'Forensic Capture Diagnostician (§7.3c-i)',
    desc: 'Audits arrangements against the 5-Stage Institutional Capture Sequence and opacity resources.',
    directive: `OPERATIONAL DIRECTIVE: FORENSIC CAPTURE DIAGNOSTICS (§7.3c-i)
- Test the arrangement against the 5-Stage Institutional Capture Sequence.
- Trace how technical complexity is being mobilized as an intentional opacity resource (§6.5).
- Identify who bears the material costs at the biological floor (§3.4).
- End with an explicit empirical test that would falsify your diagnosis.`
  },
  {
    id: 'adversarial',
    title: 'Adversarial Dialectical Stress-Tester (§12.1)',
    desc: 'Formulates strongest objections, tests for technocratic drift, and identifies hidden assumptions.',
    directive: `OPERATIONAL DIRECTIVE: ADVERSARIAL DIALECTICAL STRESS-TESTER (§12.1)
- Formulate the strongest possible materialist or pragmatic objection to this section's claims.
- Identify latent technocratic assumptions or unstated boundary conditions.
- Test whether the proposal risks technocratic drift, moralizing substitution, or paralysis by complexity (§12.5).`
  },
  {
    id: 'equation',
    title: 'Transformation Pressure Formula (T = S · D · P · G)',
    desc: 'Deconstructs systemic pressure using the multiplicative transition equation (§6.3, §15.8).',
    directive: `OPERATIONAL DIRECTIVE: TRANSFORMATION PRESSURE FORMULA ($T = S · D · P · G$)
- Deconstruct systemic power dynamics using the multiplicative equation (§6.3, §15.8).
- Analyze how Surplus extraction (S), Disparity (D), Probability of enforcement (P), and Growth of extraction rate (G) interact.
- State required material preconditions for irreversible structural transition (§10.8).`
  },
  {
    id: 'biological_floor',
    title: 'Biological Floor & Vulnerability Audit (§3.4)',
    desc: 'Evaluates baseline physical vulnerability, calorie/shelter baselines, and asymmetry of exit.',
    directive: `OPERATIONAL DIRECTIVE: BIOLOGICAL FLOOR & VULNERABILITY AUDIT (§3.4, §4.1)
- Ground evaluation in non-arbitrary somatic reality: acute physical deprivation and asymmetric exit costs.
- Reject purely aesthetic, metaphysical, or rhetoric-based rationalizations of structural harm.
- Propose concrete material safeguards that preserve exit autonomy and agency.`
  },
  {
    id: 'ideology_debunker',
    title: 'Ideological Legitimation Demystifier (§1.2, §6.5)',
    desc: 'Uncovers insulation channels, authority laundering, and moral substitution mechanisms.',
    directive: `OPERATIONAL DIRECTIVE: IDEOLOGICAL LEGITIMATION DEMYSTIFIER (§1.2, §6.5)
- Identify how elite interests are universalized into purported public goods or inevitable laws.
- Unmask semantic laundering, moral substitution, and epistemic insulation channels.
- Demand concrete institutional accountability structures subject to public falsification.`
  }
]

export default function AITerminal({ parts, gl, activeSec, onOpenGuide, version = '120' }: AITerminalProps) {
  const [activeTab, setActiveTab] = useState<AIProviderId>('claude')
  const [selectedMode, setSelectedMode] = useState<string>('analyst')
  const [userQuestion, setUserQuestion] = useState<string>('')
  const [copyStatus, setCopyStatus] = useState<string>('')
  const [showPreview, setShowPreview] = useState<boolean>(false)
  const [apiFormat, setApiFormat] = useState<'curl' | 'python' | 'json'>('curl')

  const currentProvider = PROVIDERS.find(p => p.id === activeTab) || PROVIDERS[0]
  const currentMode = MODES.find(m => m.id === selectedMode) || MODES[0]

  // Build a grounded structural prompt using active section + operational directive
  const buildPrompt = (userQ: string, modeId: string) => {
    const sec = activeSec
    let context = 'Global PMN Architectural Context (Full corpus available via /pmn_corpus_for_ai.md).'
    if (sec) {
      const cleanText = (sec.html || sec.text || '').replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim()
      context = `TARGET MANUSCRIPT SECTION:
Section ID: §${sec.id}
Section Title: ${sec.title}
Section Excerpt:
"${cleanText.slice(0, 2400)}${cleanText.length > 2400 ? '… [continued in full text]' : ''}"`
    }

    const mode = MODES.find(m => m.id === modeId) || MODES[0]

    return `You are operating as an authoritative Progressive Materialist Naturalism (PMN) analyst.
Ground your reasoning in the PMN Framework v${version} (Nova Dharma).

${mode.directive}

${context}

ANALYTICAL QUERY:
${userQ.trim() || 'Provide a rigorous PMN structural analysis of this context, identifying institutional power asymmetries, capture vulnerabilities, biological floor impacts, and concrete empirical falsification criteria.'}

FORMAT REQUIREMENTS:
1. Grounded Diagnosis (cite specific PMN sections §X.Y).
2. Institutional Asymmetry & Power Flow Analysis.
3. Biological Floor & Non-Arbitrary Flourishing Evaluation.
4. Concrete Empirical Test / Falsification Criterion.`
  }

  const buildApiPayload = (format: 'curl' | 'python' | 'json') => {
    const prompt = buildPrompt(userQuestion, selectedMode)
    const escapedPrompt = prompt.replace(/"/g, '\\"').replace(/\n/g, '\\n')

    if (format === 'curl') {
      return `curl https://api.anthropic.com/v1/messages \\
  -H "x-api-key: $ANTHROPIC_API_KEY" \\
  -H "anthropic-version: 2023-06-01" \\
  -H "content-type: application/json" \\
  -d '{
    "model": "claude-3-7-sonnet-20250219",
    "max_tokens": 2500,
    "messages": [
      {
        "role": "user",
        "content": "${escapedPrompt.slice(0, 1000)}..."
      }
    ]
  }'`
    }

    if (format === 'python') {
      return `import os
import requests

api_key = os.environ.get("ANTHROPIC_API_KEY", "your-api-key")
prompt = """${prompt}"""

response = requests.post(
    "https://api.anthropic.com/v1/messages",
    headers={
        "x-api-key": api_key,
        "anthropic-version": "2023-06-01",
        "content-type": "application/json"
    },
    json={
        "model": "claude-3-7-sonnet-20250219",
        "max_tokens": 3000,
        "messages": [{"role": "user", "content": prompt}]
    }
)

print(response.json()["content"][0]["text"])`
    }

    return JSON.stringify({
      system: `PMN Framework v${version} Grounded Agent`,
      model: "claude-3-7-sonnet-20250219",
      temperature: 0.2,
      messages: [{ role: "user", content: prompt }]
    }, null, 2)
  }

  const handleCopyPrompt = () => {
    const textToCopy = activeTab === 'api' ? buildApiPayload(apiFormat) : buildPrompt(userQuestion, selectedMode)
    navigator.clipboard.writeText(textToCopy).then(() => {
      setCopyStatus(activeTab === 'api' ? '✓ API Payload copied to clipboard!' : `✓ Grounded prompt copied for ${currentProvider.name}!`)
      window.setTimeout(() => setCopyStatus(''), 3000)
    }).catch(() => {
      window.prompt('Copy prompt manually:', textToCopy)
    })
  }

  const handleOpenPlatform = () => {
    if (activeTab === 'api') {
      handleCopyPrompt()
      return
    }
    handleCopyPrompt()
    if (currentProvider.url) {
      window.open(currentProvider.url, '_blank')
    }
  }

  return (
    <div className="home-ai-inner" style={{ width: '100%', maxWidth: '1040px', margin: '0 auto' }}>
      {/* HEADER ROW */}
      <div className="home-ai-hdr" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.85rem', marginBottom: '0.85rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.45rem', color: 'var(--acc-text)', fontWeight: 700, fontFamily: 'var(--f-mono)', fontSize: '0.85rem' }}>
            <span style={{ color: 'var(--acc)', display: 'inline-block' }}>■</span>
            PMN AGENT WORKBENCH
          </span>
          <span
            style={{
              fontFamily: 'var(--f-mono)',
              fontSize: '0.62rem',
              fontWeight: 700,
              letterSpacing: '0.12em',
              textTransform: 'uppercase',
              padding: '0.2rem 0.6rem',
              backgroundColor: 'var(--acc)',
              color: '#ffffff',
              borderRadius: '3px'
            }}
          >
            Live Grounding
          </span>
        </div>

        <div>
          {activeSec ? (
            <span
              style={{
                fontFamily: 'var(--f-mono)',
                fontSize: '0.72rem',
                color: 'var(--acc-text)',
                border: '1px solid var(--rule2)',
                padding: '0.35rem 0.75rem',
                backgroundColor: 'var(--bg)',
                borderRadius: '3px',
                display: 'inline-block'
              }}
            >
              Locked: §{activeSec.id} ({activeSec.title.slice(0, 32)}…)
            </span>
          ) : (
            <span
              style={{
                fontFamily: 'var(--f-mono)',
                fontSize: '0.68rem',
                color: 'var(--mute)',
                border: '1px solid var(--rule)',
                padding: '0.3rem 0.65rem',
                backgroundColor: 'var(--bg)',
                borderRadius: '3px',
                display: 'inline-block'
              }}
            >
              Scope: Full PMN Framework v{version}
            </span>
          )}
        </div>
      </div>

      {/* DESCRIPTION */}
      <p
        className="home-ai-desc"
        style={{
          fontSize: '0.9rem',
          lineHeight: 1.65,
          color: 'var(--ink2)',
          marginBottom: '1.25rem',
          maxWidth: '82ch'
        }}
      >
        Extracts structural context and quotes directly from the PMN manuscript, injects calibrated materialist analytical directives, and generates high-precision prompts for frontier AI portals or local developer harnesses.
      </p>

      {/* NOTIFICATION FEEDBACK */}
      {copyStatus && (
        <div
          className="hai-status-banner"
          style={{
            fontFamily: 'var(--f-mono)',
            fontSize: '0.75rem',
            letterSpacing: '0.06em',
            textTransform: 'uppercase',
            color: 'var(--acc-text)',
            backgroundColor: 'rgba(192, 39, 26, 0.12)',
            border: '1px solid var(--acc)',
            padding: '0.75rem 1.25rem',
            borderRadius: '4px',
            marginBottom: '1.25rem',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem'
          }}
        >
          {copyStatus}
        </div>
      )}

      {/* PROVIDER SELECTOR TABS */}
      <div
        className="hai-tabs"
        id="hai-tabs"
        style={{
          display: 'flex',
          flexWrap: 'wrap',
          gap: '0.45rem',
          marginBottom: '1.25rem'
        }}
      >
        {PROVIDERS.map(p => {
          const isActive = activeTab === p.id
          return (
            <button
              key={p.id}
              className={`hai-tab ${isActive ? 'active' : ''}`}
              onClick={() => setActiveTab(p.id)}
              style={{
                fontFamily: 'var(--f-mono)',
                fontSize: '0.72rem',
                padding: '0.55rem 0.95rem',
                borderRadius: '4px',
                border: isActive ? '1px solid var(--acc)' : '1px solid var(--rule)',
                backgroundColor: isActive ? 'var(--bg3)' : 'var(--bg)',
                color: isActive ? 'var(--acc-text)' : 'var(--mute)',
                cursor: 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.45rem',
                whiteSpace: 'nowrap',
                transition: 'all 0.15s ease',
                boxShadow: isActive ? '2px 2px 0 var(--acc2)' : 'none'
              }}
            >
              <span>{p.name}</span>
              <span
                style={{
                  fontSize: '0.62rem',
                  opacity: 0.8,
                  padding: '0.1rem 0.35rem',
                  backgroundColor: isActive ? 'rgba(192,39,26,0.2)' : 'var(--bg2)',
                  borderRadius: '2px'
                }}
              >
                {p.badge}
              </span>
              {p.id !== 'api' && <span style={{ fontSize: '0.75rem' }}>↗</span>}
            </button>
          )
        })}
      </div>

      {/* WORKBENCH PANEL */}
      <div
        className="hai-panel"
        style={{
          backgroundColor: 'var(--bg)',
          border: '1px solid var(--rule2)',
          borderRadius: '6px',
          padding: '1.75rem 2rem',
          boxShadow: '0 12px 36px rgba(0, 0, 0, 0.22)',
          display: 'flex',
          flexDirection: 'column',
          gap: '1.35rem'
        }}
      >
        {/* ROW 1: ROLE SELECTOR & INFO */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.55rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.5rem' }}>
            <label
              style={{
                fontFamily: 'var(--f-mono)',
                fontSize: '0.7rem',
                textTransform: 'uppercase',
                letterSpacing: '0.12em',
                color: 'var(--mute)',
                fontWeight: 600
              }}
            >
              Operational Role &amp; Methodology:
            </label>
            <span style={{ fontFamily: 'var(--f-mono)', fontSize: '0.68rem', color: 'var(--mute2)' }}>
              {currentProvider.desc}
            </span>
          </div>

          <select
            className="hai-select"
            value={selectedMode}
            onChange={e => setSelectedMode(e.target.value)}
            style={{
              width: '100%',
              backgroundColor: 'var(--bg2)',
              color: 'var(--ink)',
              border: '1px solid var(--rule)',
              borderRadius: '4px',
              padding: '0.75rem 1rem',
              fontFamily: 'var(--f-mono)',
              fontSize: '0.84rem',
              outline: 'none',
              cursor: 'pointer'
            }}
          >
            {MODES.map(m => (
              <option key={m.id} value={m.id}>
                {m.title}
              </option>
            ))}
          </select>

          <p style={{ fontFamily: 'var(--f-body)', fontSize: '0.82rem', color: 'var(--mute)', fontStyle: 'italic', margin: '0.2rem 0 0 0.15rem' }}>
            {currentMode.desc}
          </p>
        </div>

        {/* ROW 2: USER INQUIRY INPUT / TEXTAREA */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.55rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.5rem' }}>
            <label
              style={{
                fontFamily: 'var(--f-mono)',
                fontSize: '0.7rem',
                textTransform: 'uppercase',
                letterSpacing: '0.12em',
                color: 'var(--mute)',
                fontWeight: 600
              }}
            >
              Analytical Query / Custom Directive:
            </label>
            <span style={{ fontFamily: 'var(--f-mono)', fontSize: '0.68rem', color: 'var(--mute2)' }}>
              (Press Enter or click Copy to proceed)
            </span>
          </div>

          <textarea
            className="hai-textarea"
            rows={2}
            value={userQuestion}
            onChange={e => setUserQuestion(e.target.value)}
            onKeyDown={e => {
              if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) {
                handleOpenPlatform()
              }
            }}
            placeholder={
              activeSec
                ? `Formulate a specific structural or empirical question regarding §${activeSec.id}: ${activeSec.title}…`
                : 'Formulate an institutional, empirical, or philosophical question with PMN grounding…'
            }
            style={{
              width: '100%',
              minHeight: '80px',
              backgroundColor: 'var(--bg2)',
              color: 'var(--ink)',
              border: '1px solid var(--rule)',
              borderRadius: '4px',
              padding: '0.85rem 1.15rem',
              fontFamily: 'var(--f-body)',
              fontSize: '0.92rem',
              lineHeight: 1.6,
              outline: 'none',
              resize: 'vertical',
              boxSizing: 'border-box'
            }}
          />
        </div>

        {/* ROW 2.5: API FORMAT SELECTOR IF API TAB */}
        {activeTab === 'api' && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.65rem 1rem', backgroundColor: 'var(--bg2)', border: '1px solid var(--rule)', borderRadius: '4px' }}>
            <span style={{ fontFamily: 'var(--f-mono)', fontSize: '0.7rem', textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--mute)' }}>
              Format:
            </span>
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              {(['curl', 'python', 'json'] as const).map(fmt => (
                <button
                  key={fmt}
                  onClick={() => setApiFormat(fmt)}
                  style={{
                    fontFamily: 'var(--f-mono)',
                    fontSize: '0.68rem',
                    textTransform: 'uppercase',
                    letterSpacing: '0.08em',
                    padding: '0.3rem 0.65rem',
                    borderRadius: '3px',
                    border: apiFormat === fmt ? '1px solid var(--acc)' : '1px solid var(--rule)',
                    backgroundColor: apiFormat === fmt ? 'var(--bg3)' : 'transparent',
                    color: apiFormat === fmt ? 'var(--acc-text)' : 'var(--mute)',
                    cursor: 'pointer'
                  }}
                >
                  {fmt === 'curl' ? 'cURL' : fmt === 'python' ? 'Python Requests' : 'JSON Payload'}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* ROW 3: ACTIONS & CONTROLS */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '1rem',
            paddingTop: '1.25rem',
            borderTop: '1px solid var(--rule)'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: '0.75rem' }}>
            <button
              className="hai-btn-primary"
              onClick={handleOpenPlatform}
              style={{
                backgroundColor: 'var(--acc)',
                color: '#ffffff',
                border: '1px solid var(--acc)',
                fontFamily: 'var(--f-mono)',
                fontSize: '0.75rem',
                fontWeight: 700,
                letterSpacing: '0.08em',
                textTransform: 'uppercase',
                padding: '0.75rem 1.4rem',
                borderRadius: '4px',
                cursor: 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.5rem',
                boxShadow: '2px 2px 0 var(--acc2)'
              }}
            >
              {activeTab === 'api'
                ? `Copy ${apiFormat.toUpperCase()} Code`
                : `Copy & Launch ${currentProvider.name} ↗`}
            </button>

            <button
              className="hai-btn-secondary"
              onClick={handleCopyPrompt}
              style={{
                backgroundColor: 'var(--bg2)',
                color: 'var(--ink)',
                border: '1px solid var(--rule)',
                fontFamily: 'var(--f-mono)',
                fontSize: '0.72rem',
                letterSpacing: '0.06em',
                textTransform: 'uppercase',
                padding: '0.75rem 1.15rem',
                borderRadius: '4px',
                cursor: 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.4rem'
              }}
            >
              Copy Prompt Only
            </button>

            <button
              onClick={() => setShowPreview(prev => !prev)}
              style={{
                background: 'none',
                border: '1px dashed var(--rule2)',
                color: showPreview ? 'var(--acc-text)' : 'var(--mute)',
                fontFamily: 'var(--f-mono)',
                fontSize: '0.72rem',
                letterSpacing: '0.06em',
                textTransform: 'uppercase',
                padding: '0.75rem 1rem',
                borderRadius: '4px',
                cursor: 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.4rem'
              }}
            >
              {showPreview ? 'Hide Prompt' : '👁 Inspect Prompt'}
            </button>
          </div>

          {onOpenGuide && (
            <button
              onClick={onOpenGuide}
              style={{
                fontFamily: 'var(--f-mono)',
                fontSize: '0.72rem',
                letterSpacing: '0.1em',
                textTransform: 'uppercase',
                color: 'var(--mute)',
                cursor: 'pointer',
                background: 'none',
                border: 'none',
                padding: '0.4rem 0.2rem'
              }}
            >
              Full AI Guide &amp; Endpoints &rarr;
            </button>
          )}
        </div>

        {/* ROW 4: PROMPT PREVIEW / CODE INSPECTION */}
        {showPreview && (
          <div
            className="hai-preview-box"
            style={{
              backgroundColor: 'var(--bg2)',
              border: '1px solid var(--rule)',
              borderRadius: '4px',
              padding: '1.25rem',
              marginTop: '0.5rem',
              display: 'flex',
              flexDirection: 'column',
              gap: '0.65rem'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <span
                style={{
                  fontFamily: 'var(--f-mono)',
                  fontSize: '0.68rem',
                  letterSpacing: '0.12em',
                  textTransform: 'uppercase',
                  color: 'var(--acc-text)',
                  fontWeight: 700
                }}
              >
                {activeTab === 'api' ? `Assembled ${apiFormat.toUpperCase()} Code Snippet` : 'Assembled Precision Prompt (Markdown)'}
              </span>
              <button
                onClick={handleCopyPrompt}
                style={{
                  fontFamily: 'var(--f-mono)',
                  fontSize: '0.65rem',
                  letterSpacing: '0.08em',
                  textTransform: 'uppercase',
                  padding: '0.25rem 0.6rem',
                  borderRadius: '3px',
                  backgroundColor: 'var(--bg3)',
                  border: '1px solid var(--rule)',
                  color: 'var(--ink)',
                  cursor: 'pointer'
                }}
              >
                Copy
              </button>
            </div>

            <pre
              className="hai-preview-pre"
              style={{
                fontFamily: 'var(--f-mono)',
                fontSize: '0.78rem',
                lineHeight: 1.6,
                color: 'var(--ink)',
                whiteSpace: 'pre-wrap',
                wordBreak: 'break-word',
                maxHeight: '320px',
                overflowY: 'auto',
                padding: '0.85rem',
                backgroundColor: 'var(--bg)',
                border: '1px solid var(--rule)',
                borderRadius: '3px'
              }}
            >
              {activeTab === 'api' ? buildApiPayload(apiFormat) : buildPrompt(userQuestion, selectedMode)}
            </pre>
          </div>
        )}

        {/* BOTTOM ARCHITECTURAL NOTE */}
        <div style={{ paddingTop: '0.5rem', borderTop: '1px dashed var(--rule2)' }}>
          <p
            style={{
              fontFamily: 'var(--f-mono)',
              fontSize: '0.68rem',
              letterSpacing: '0.04em',
              lineHeight: 1.5,
              color: 'var(--mute2)',
              margin: 0
            }}
          >
            <strong>Note on Architecture:</strong> PMN Framework is a client-side static web application without a server backend. This terminal operates as a <em>zero-trust client bridge</em>: it generates fully grounded manuscript context packs locally in your browser and transfers them via clipboard to your own authenticated AI accounts or developer pipelines, ensuring zero credential risk and absolute reader privacy.
          </p>
        </div>
      </div>
    </div>
  )
}
