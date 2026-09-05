import React, { useState } from 'react'

interface SubSection { id: string; title: string; html?: string; text?: string }
interface Part { part: string; title: string; subs: SubSection[] }

interface AITerminalProps {
  parts: Part[]
  gl: Record<string, string>
  activeSec: SubSection | null
  onOpenGuide?: () => void
}

type PlatformKey = 'claude' | 'gemini' | 'deepseek' | 'chatgpt' | 'api'

export default function AITerminal({ parts, gl, activeSec, onOpenGuide }: AITerminalProps) {
  const [activeTab, setActiveTab] = useState<PlatformKey>('claude')
  const [selectedMode, setSelectedMode] = useState<string>('analyst')
  const [userQuestion, setUserQuestion] = useState<string>('')
  const [copyStatus, setCopyStatus] = useState<string>('')

  // Build a grounded structural prompt using active section + operational directive
  const buildPrompt = (userQ: string, mode: string) => {
    const sec = activeSec
    let context = 'Global PMN Architectural Context (No specific section selected).'
    if (sec) {
      const cleanText = (sec.html || sec.text || '').replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim()
      context = `TARGET MANUSCRIPT SECTION:
Section ID: §${sec.id}
Section Title: ${sec.title}
Section Excerpt:
"${cleanText.slice(0, 2200)}${cleanText.length > 2200 ? '… [continued in full text]' : ''}"`
    }

    let modeInstruction = ''
    if (mode === 'diagnostic') {
      modeInstruction = `OPERATIONAL DIRECTIVE: FORENSIC CAPTURE DIAGNOSTICS (§7.3c-i)
- Test the arrangement against the 5-Stage Institutional Capture Sequence.
- Trace how technical complexity is being mobilized as an intentional opacity resource (§6.5).
- Identify who bears the material costs at the biological floor (§3.4).
- End with an explicit empirical test that would falsify your diagnosis.`
    } else if (mode === 'adversarial') {
      modeInstruction = `OPERATIONAL DIRECTIVE: ADVERSARIAL RED-TEAM & ASSUMPTION ARCHAEOLOGY (§12.1)
- Reconstruct the strongest structural counter-argument against the prevailing consensus.
- Test for the 'Technocratic Drift Trap' (§12.5b) and 'Paralysis by Complexity' (§12.5d).
- Name the unstated empirical assumptions required for this claim to hold.`
    } else if (mode === 'equation') {
      modeInstruction = `OPERATIONAL DIRECTIVE: TRANSFORMATION PRESSURE FORMULA ($T = S \cdot D \cdot P \cdot G$)
- Evaluate the arrangement through PMN's Multiplicative Transfer Equation (§6.3 / §15.8).
- Analyze how changes in opacity (G) or exit penalties (P) scale extractive leverage multiplicatively.
- State required material preconditions for irreversible structural transition (§10.8).`
    } else {
      modeInstruction = `OPERATIONAL DIRECTIVE: PMN STRUCTURAL MATERIALIST ANALYST
- Trace underlying material resource flows, power asymmetries, and incentive structures.
- Evaluate impacts on the biological floor (minimizing structural suffering) vs genuine becoming (§3.4, §4.2).
- Distinguish verified empirical evidence from self-serving institutional PR framing.`
    }

    return `You are operating as an authoritative Progressive Materialist Naturalism (PMN) analyst.
Ground your reasoning in PMN Framework v118.6 (Nova Dharma).

${modeInstruction}

${context}

ANALYTICAL QUERY:
${userQ.trim() || 'Provide a comprehensive PMN structural diagnosis of this section, identifying its material mechanisms, potential capture vulnerabilities, and non-arbitrary evaluative criteria.'}

FORMAT REQUIREMENTS:
1. Grounded Diagnosis (cite specific PMN sections §X.Y).
2. Institutional Asymmetry & Power Flows.
3. Biological Floor & Becoming Evaluation.
4. Concrete Falsification Threshold.`
  }

  const buildCurlPayload = () => {
    const prompt = buildPrompt(userQuestion, selectedMode).replace(/"/g, '\\"').replace(/\n/g, '\\n')
    return `curl https://api.anthropic.com/v1/messages \\
  -H "x-api-key: $ANTHROPIC_API_KEY" \\
  -H "anthropic-version: 2023-06-01" \\
  -H "content-type: application/json" \\
  -d '{
    "model": "claude-sonnet-5",
    "max_tokens": 2500,
    "messages": [{"role": "user", "content": "${prompt.slice(0, 800)}..."}]
  }'`
  }

  const handleCopyPrompt = () => {
    const textToCopy = activeTab === 'api' ? buildCurlPayload() : buildPrompt(userQuestion, selectedMode)
    navigator.clipboard.writeText(textToCopy).then(() => {
      setCopyStatus(activeTab === 'api' ? 'cURL API Payload copied!' : `Prompt copied for ${activeTab.toUpperCase()}!`)
      window.setTimeout(() => setCopyStatus(''), 2500)
    }).catch(() => {
      window.prompt('Copy this manually:', textToCopy)
    })
  }

  const handleOpenPlatform = () => {
    if (activeTab === 'api') {
      handleCopyPrompt()
      return
    }
    handleCopyPrompt()
    let url = ''
    switch (activeTab) {
      case 'claude':
        url = 'https://claude.ai'
        break
      case 'gemini':
        url = 'https://aistudio.google.com'
        break
      case 'deepseek':
        url = 'https://chat.deepseek.com'
        break
      case 'chatgpt':
        url = 'https://chatgpt.com'
        break
    }
    if (url) {
      window.open(url, '_blank')
    }
  }

  return (
    <div className="home-ai-inner" style={{ width: '100%' }}>
      <div className="home-ai-hdr mb-3 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <span className="font-pmn-head text-base text-pmn-ink font-bold">PMN Agent Terminal</span>
          <span className="font-mono text-[0.65rem] px-2 py-0.5 rounded bg-pmn-acc text-white uppercase tracking-widest font-bold">
            Live Grounding
          </span>
        </div>
        {activeSec && (
          <span className="font-mono text-[0.72rem] text-pmn-acc border border-pmn-rule px-2 py-0.5 bg-pmn-bg2">
            Locked to §{activeSec.id} ({activeSec.title.slice(0, 30)}…)
          </span>
        )}
      </div>

      <p className="home-ai-desc mb-4 text-xs text-pmn-ink2 opacity-80">
        Generate precision context packs directly from the active manuscript section for interactive Web Portals or local Developer API Harnesses.
      </p>

      {copyStatus && (
        <div className="font-mono text-[0.7rem] uppercase tracking-wider text-pmn-acc border border-pmn-acc bg-pmn-bg px-3 py-1.5 mb-4 animate-in fade-in">
          ✓ {copyStatus}
        </div>
      )}

      {/* PLATFORM SELECTOR TABS */}
      <div className="hai-tabs mb-4 flex flex-wrap gap-1" id="hai-tabs">
        <button
          className={`hai-tab ${activeTab === 'claude' ? 'active' : ''}`}
          onClick={() => setActiveTab('claude')}
        >
          Claude (Fable / Sonnet) ↗
        </button>
        <button
          className={`hai-tab ${activeTab === 'gemini' ? 'active' : ''}`}
          onClick={() => setActiveTab('gemini')}
        >
          Gemini (3.1 Pro / 3.8) ↗
        </button>
        <button
          className={`hai-tab ${activeTab === 'deepseek' ? 'active' : ''}`}
          onClick={() => setActiveTab('deepseek')}
        >
          DeepSeek (V4 / R1) ↗
        </button>
        <button
          className={`hai-tab ${activeTab === 'chatgpt' ? 'active' : ''}`}
          onClick={() => setActiveTab('chatgpt')}
        >
          ChatGPT (GPT-6 / o3) ↗
        </button>
        <button
          className={`hai-tab ${activeTab === 'api' ? 'active' : ''}`}
          onClick={() => setActiveTab('api')}
        >
          Developer API / cURL
        </button>
      </div>

      {/* INPUT & CONFIGURATION PANEL */}
      <div className="hai-panel p-4 border border-pmn-rule bg-pmn-bg2 rounded space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2 flex-1 min-w-[240px]">
            <label className="font-mono text-[0.68rem] uppercase tracking-wider text-pmn-mute">
              Operational Role:
            </label>
            <select
              className="home-ai-select text-xs p-1.5 bg-pmn-bg border border-pmn-rule text-pmn-ink rounded"
              value={selectedMode}
              onChange={e => setSelectedMode(e.target.value)}
            >
              <option value="analyst">Structural Materialist Analyst</option>
              <option value="diagnostic">Forensic Capture Diagnostician (§7.3c-i)</option>
              <option value="adversarial">Adversarial Red-Team &amp; Dialectical Stress-Tester</option>
              <option value="equation">Transformation Pressure Formula ($T = S · D · P · G$)</option>
            </select>
          </div>

          <div className="font-mono text-[0.68rem] text-pmn-mute">
            {activeSec ? 'Section Context: Injected' : 'Context: Global Corpus Architecture'}
          </div>
        </div>

        <div className="home-ai-row flex flex-wrap gap-2">
          <input
            type="text"
            className="home-ai-input flex-1 min-w-[260px] p-2 bg-pmn-bg border border-pmn-rule text-xs text-pmn-ink rounded font-pmn-body placeholder:text-pmn-mute"
            placeholder={
              activeSec
                ? `Ask a structural question about §${activeSec.id}: ${activeSec.title}…`
                : 'Formulate an institutional or philosophical question with PMN context…'
            }
            value={userQuestion}
            onChange={e => setUserQuestion(e.target.value)}
            onKeyDown={e => {
              if (e.key === 'Enter') handleOpenPlatform()
            }}
          />
        </div>

        {/* ACTION BUTTONS */}
        <div className="home-ai-actions flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-pmn-rule/50">
          <div className="flex flex-wrap gap-2">
            <button
              className="pmn-agent-btn primary px-4 py-1.5 text-xs font-mono font-bold bg-pmn-acc text-white rounded hover:opacity-90 cursor-pointer"
              onClick={handleOpenPlatform}
            >
              {activeTab === 'api' ? 'Copy cURL API Request' : `Copy & Open ${activeTab.toUpperCase()} ↗`}
            </button>
            <button
              className="pmn-agent-btn px-3 py-1.5 text-xs font-mono bg-pmn-bg border border-pmn-rule text-pmn-ink rounded hover:border-pmn-acc cursor-pointer"
              onClick={handleCopyPrompt}
            >
              {activeTab === 'api' ? 'Copy Raw Prompt' : 'Copy Prompt Only'}
            </button>
          </div>

          {onOpenGuide && (
            <button
              className="font-mono text-[0.7rem] uppercase tracking-wider text-pmn-mute hover:text-pmn-acc cursor-pointer"
              onClick={onOpenGuide}
            >
              Full AI Guide &amp; Endpoints &rarr;
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
