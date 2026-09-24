import React, { useState } from 'react'
import type { GuideTab } from '../routing'

interface SubSection { id: string; title: string; html?: string; text?: string }
interface Part { part: string; title: string; subs: SubSection[] }

interface AITerminalProps {
  parts: Part[]
  gl: Record<string, string>
  activeSec: SubSection | null
  onOpenGuide?: (tab?: GuideTab) => void
  version?: string
}

/**
 * Layanan chat tujuan "Copy & Launch". Diurutkan alfabetis dan tanpa nama
 * versi model maupun peringkat: daftar sebelumnya ("GPT-6 Astra", "Rank #1
 * on AA Index (53.37)", ...) basi dalam hitungan bulan dan tidak bisa
 * diverifikasi dari situs statis ini. Kriteria memilih model ada di
 * AI Guide (#/guide), yang tidak ikut basi.
 *
 * Tab "Developer API" dihapus 2026-09-24: payload JSON-nya tanpa max_tokens
 * (ditolak API) dan versi cURL-nya rusak bila prompt memuat apostrof.
 * Skrip yang teruji ada di #/guide/dev.
 */
export type AIProviderId =
  | 'chatgpt'
  | 'claude'
  | 'deepseek'
  | 'gemini'
  | 'glm'
  | 'grok'
  | 'kimi'
  | 'qwen'

interface ProviderItem {
  id: AIProviderId
  name: string
  company: string
  url: string
}

const PROVIDERS: ProviderItem[] = [
  { id: 'chatgpt', name: 'ChatGPT', company: 'OpenAI', url: 'https://chatgpt.com' },
  { id: 'claude', name: 'Claude', company: 'Anthropic', url: 'https://claude.ai' },
  { id: 'deepseek', name: 'DeepSeek', company: 'DeepSeek', url: 'https://chat.deepseek.com' },
  { id: 'gemini', name: 'Gemini', company: 'Google', url: 'https://aistudio.google.com' },
  { id: 'glm', name: 'GLM', company: 'Zhipu AI', url: 'https://chatglm.cn' },
  { id: 'grok', name: 'Grok', company: 'xAI', url: 'https://grok.com' },
  { id: 'kimi', name: 'Kimi', company: 'Moonshot AI', url: 'https://kimi.moonshot.cn' },
  { id: 'qwen', name: 'Qwen', company: 'Alibaba Cloud', url: 'https://chat.qwen.ai' },
]

const BASE = 'https://novadharma-hub.github.io/pmn-framework/'

interface ModeItem {
  id: string
  title: string
  desc: string
  directive: string
}

// Setiap § di sini dicocokkan dengan judul dan isi seksinya (2026-09-24).
// Versi sebelumnya mengartikan T = S · D · P · G sebagai "Surplus
// extraction, Disparity, Probability of enforcement, Growth of extraction
// rate" dan mengutip §6.3/§15.8 untuknya; naskah §15.2/§15.4 berkata lain.
const MODES: ModeItem[] = [
  {
    id: 'analyst',
    title: 'Structural Analyst',
    desc: 'Traces resource flows, power asymmetries, and effects on the floor and on becoming (§3.4, §4.2, §6.2).',
    directive: `ROLE: PMN STRUCTURAL ANALYST
- Trace the material resource flows, power asymmetries and incentive structures beneath the public narrative (§6.2, §6.3).
- Assess effects on the biological floor (§3.4) and, separately, on the conditions for becoming (§4.2).
- Separate what the evidence supports from institutional public relations.`
  },
  {
    id: 'diagnostic',
    title: 'Capture Diagnostician (§7.3c-i)',
    desc: 'Tests an institution against the five-stage capture sequence and its early-detection signals.',
    directive: `ROLE: PMN CAPTURE DIAGNOSTICIAN (§7.3c-i)
- Test the arrangement against the five stages: (1) Access Asymmetry, (2) Decision-Filter Capture & Preference Expression, (3) Personnel Alignment, (4) Objective Redefinition & Output Reorientation, (5) Accountability Capture & Consolidation.
- List the early-detection signals present (§7.3b) and how the institution preserves itself against correction (§6.5).
- Apply the diagnostics regardless of the institution's ideology or stated mission (§12.5).
- Identify who bears the material costs, and end with the observation that would falsify the diagnosis.`
  },
  {
    id: 'adversarial',
    title: 'Red Team (§12.1)',
    desc: 'Builds the strongest objection, digs out hidden assumptions, and tests for technocratic drift (§12.8).',
    directive: `ROLE: PMN RED TEAM (§12.1, §12.1c)
- Build the strongest objection to the claims under discussion.
- List the unstated empirical assumptions they rely on.
- Test for technocratic drift (§6.4, §12.8) and for the cost of inaction (§1.5).
- State what evidence would force PMN to revise its position.`
  },
  {
    id: 'equation',
    title: 'Transformation Pressure (T = S × D × P × G)',
    desc: 'Structural suffering × duration × geographic spread × intergenerational transmission (§15.2, §15.4).',
    directive: `ROLE: PMN TRANSFORMATION-PRESSURE ANALYST (§15.2, §15.4)
- T = S × D × P × G, where S = structural suffering, D = duration, P = geographic spread (population scale), G = intergenerational transmission.
- Characterise each variable; they multiply, they do not add. Compare T with the system's threshold for non-linear change (§10.5).
- Assess counter-power capacity with §15.8 and name its bottleneck.`
  },
  {
    id: 'biological_floor',
    title: 'Biological Floor Audit (§3.4)',
    desc: 'Checks physical vulnerability and who can and cannot exit the arrangement.',
    directive: `ROLE: PMN BIOLOGICAL FLOOR AUDIT (§3.4, §4.1)
- Ground the evaluation in physical vulnerability: deprivation, exposure, and the asymmetric cost of exit.
- Reject aesthetic or rhetorical justifications of preventable structural harm.
- Propose concrete material safeguards that preserve exit and agency.`
  },
  {
    id: 'ideology_debunker',
    title: 'Legitimation Analyst (§6.7, §7.5)',
    desc: 'Shows how narrow interests are presented as public goods, and how claims are insulated from revision (§1.2).',
    directive: `ROLE: PMN LEGITIMATION ANALYST (§1.2, §6.7, §7.5)
- Identify how narrow interests are presented as public goods or inevitable laws (§6.7, §7.5).
- Show where claims are insulated from revision rather than open to it (§1.2).
- Name the accountability structure that would expose the claim to public falsification.`
  }
]

export default function AITerminal({ parts, gl, activeSec, onOpenGuide, version = '120' }: AITerminalProps) {
  const [activeTab, setActiveTab] = useState<AIProviderId>(PROVIDERS[0].id)
  const [selectedMode, setSelectedMode] = useState<string>('analyst')
  const [userQuestion, setUserQuestion] = useState<string>('')
  const [copyStatus, setCopyStatus] = useState<string>('')
  const [showPreview, setShowPreview] = useState<boolean>(false)

  const currentProvider = PROVIDERS.find(p => p.id === activeTab) || PROVIDERS[0]
  const currentMode = MODES.find(m => m.id === selectedMode) || MODES[0]

  // Build a grounded structural prompt using active section + operational directive
  const buildPrompt = (userQ: string, modeId: string) => {
    const sec = activeSec
    let context = `No single section selected. The full text is at ${BASE}txt/index.txt (one plain-text file per section); ask me to paste the sections you need rather than answering from memory.`
    if (sec) {
      const cleanText = (sec.html || sec.text || '').replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim()
      context = `TARGET MANUSCRIPT SECTION:
Section ID: §${sec.id}
Section Title: ${sec.title}
Full text: ${BASE}txt/${sec.id}.txt
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
4. Concrete Empirical Test / Falsification Criterion.

If the text does not address something, say so instead of filling the gap.`
  }

  const handleCopyPrompt = () => {
    const textToCopy = buildPrompt(userQuestion, selectedMode)
    navigator.clipboard.writeText(textToCopy).then(() => {
      setCopyStatus(`✓ Grounded prompt copied for ${currentProvider.name}!`)
      window.setTimeout(() => setCopyStatus(''), 3000)
    }).catch(() => {
      window.prompt('Copy prompt manually:', textToCopy)
    })
  }

  const handleOpenPlatform = () => {
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
              fontSize:'.75rem',
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
                fontSize:'.75rem',
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
                fontSize:'.75rem',
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
        Builds a prompt that carries PMN's text and an analytical role, copies it, and opens the chat service you pick. Nothing is sent from this site; you paste it yourself. For API scripts, see the{' '}
        {onOpenGuide ? <a href="#/guide/dev" onClick={e => { e.preventDefault(); onOpenGuide('dev') }} style={{ color: 'var(--acc-text)' }}>Developer guide</a> : 'Developer guide'}.
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
                fontSize:'.75rem',
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
              <span aria-hidden="true" style={{ fontSize: '0.75rem' }}>↗</span>
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
            <span style={{ fontFamily: 'var(--f-mono)', fontSize:'.75rem', color: 'var(--mute2)' }}>
              Opens {currentProvider.name} ({currentProvider.company}) in a new tab
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
            <span style={{ fontFamily: 'var(--f-mono)', fontSize:'.75rem', color: 'var(--mute2)' }}>
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
              {`Copy & Launch ${currentProvider.name} ↗`}
            </button>

            <button
              className="hai-btn-secondary"
              onClick={handleCopyPrompt}
              style={{
                backgroundColor: 'var(--bg2)',
                color: 'var(--ink)',
                border: '1px solid var(--rule)',
                fontFamily: 'var(--f-mono)',
                fontSize:'.75rem',
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
                fontSize:'.75rem',
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
              onClick={() => onOpenGuide()}
              style={{
                fontFamily: 'var(--f-mono)',
                fontSize:'.75rem',
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
                  fontSize:'.75rem',
                  letterSpacing: '0.12em',
                  textTransform: 'uppercase',
                  color: 'var(--acc-text)',
                  fontWeight: 700
                }}
              >
                Assembled prompt
              </span>
              <button
                onClick={handleCopyPrompt}
                style={{
                  fontFamily: 'var(--f-mono)',
                  fontSize:'.75rem',
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
              {buildPrompt(userQuestion, selectedMode)}
            </pre>
          </div>
        )}

      </div>
    </div>
  )
}
