import React, { useState, useEffect, useRef } from 'react'

interface SubSection {
  id: string
  title: string
  html?: string
  text?: string
}

interface Part {
  part: string
  title: string
  subs: SubSection[]
}

interface AITerminalProps {
  parts: Part[]
  gl: Record<string, string>
  activeSec: SubSection | null
}

interface Message {
  role: 'user' | 'assistant'
  content: string
  isStreaming?: boolean
}

export default function AITerminal({ parts, gl, activeSec }: AITerminalProps) {
  const [activeTab, setActiveTab] = useState<'claude' | 'chatgpt' | 'gemini'>('chatgpt')
  
  // Claude Inline Simulator State
  const [chatMode, setChatMode] = useState<'agent' | 'diagnostic' | 'debate' | 'oracle'>('agent')
  const [input, setInput] = useState('')
  const [messages, setMessages] = useState<Message[]>([])
  const [busy, setBusy] = useState(false)
  const chatLogRef = useRef<HTMLDivElement>(null)

  // Redirect Tabs State
  const [redirectQuery, setRedirectQuery] = useState('')
  const [redirectMode, setRedirectMode] = useState<'agent' | 'diagnostic' | 'debate' | 'oracle'>('agent')
  const [promptCopied, setPromptCopied] = useState(false)
  const [promptStats, setPromptStats] = useState('')

  // Scroll chat log to bottom
  useEffect(() => {
    if (chatLogRef.current) {
      chatLogRef.current.scrollTop = chatLogRef.current.scrollHeight
    }
  }, [messages])

  // Helper: Strip HTML tags
  const stripHtml = (str: string) => {
    return (str || '')
      .replace(/<br\s*\/?>/gi, '\n')
      .replace(/<[^>]+>/g, ' ')
      .replace(/&amp;/g, '&')
      .replace(/&lt;/g, '<')
      .replace(/&gt;/g, '>')
      .replace(/&nbsp;/g, ' ')
      .replace(/&#x27;/g, "'")
      .replace(/&quot;/g, '"')
      .replace(/&mdash;/g, '—')
      .replace(/&ldquo;/g, '"')
      .replace(/&rdquo;/g, '"')
      .replace(/\s{2,}/g, ' ')
      .trim()
  }

  // Local Search Scorer
  const buildContextPack = (query: string, maxSections = 5, maxGlossary = 4) => {
    const q = query.toLowerCase()
    const scored: { pIdx: number; sIdx: number; score: number; sec: SubSection; part: Part }[] = []

    parts.forEach((p, pIdx) => {
      p.subs.forEach((s, sIdx) => {
        let score = 0
        const textContent = stripHtml(s.html || '')
        const blob = `${s.title} ${textContent}`.toLowerCase()

        if (q.length > 2 && blob.includes(q)) score += 3
        q.split(/\s+/).filter(w => w.length > 3).forEach(w => {
          if (blob.includes(w)) score += 1
        })

        if (activeSec && s.id === activeSec.id) score += 5
        
        if (score > 0) {
          scored.push({ pIdx, sIdx, score, sec: s, part: p })
        }
      })
    })

    scored.sort((a, b) => b.score - a.score)

    const sections = scored.slice(0, maxSections).map(item => ({
      id: item.sec.id,
      title: item.sec.title,
      part: `Part ${item.part.part}`,
      excerpt: stripHtml(item.sec.html || '').slice(0, 600),
      fullText: stripHtml(item.sec.html || '').slice(0, 2500)
    }))

    let glossary: { term: string; def: string }[] = []
    if (q.length > 2) {
      Object.keys(gl).forEach(term => {
        if (term.toLowerCase().includes(q) || q.includes(term.toLowerCase())) {
          glossary.push({ term, def: gl[term].slice(0, 240) })
        }
      })
      glossary = glossary.slice(0, maxGlossary)
    }

    return { sections, glossary }
  }

  // Generate Offline Response (Heuristics)
  const generateLocalResponse = (query: string, pack: any) => {
    const q = query.toLowerCase()
    
    if (q.includes('custodian') || q.includes('asymmetry') || q.includes('power')) {
      return `### ✦ PMN DIALECTICAL ANALYSIS: THE CUSTODIAN PROBLEM

Under the **Progressive Materialist Naturalism (PMN)** architecture, power asymmetry is not merely a moral failure but a structural necessity of complex information networks. This is defined as **The Custodian Problem**.

According to **Part VI** and specifically **Section 3.4**, when an institutional arrangement designates a 'custodian' to manage resources or information, a structural asymmetry is established. Because the custodian has direct access to the source layer while the public only experiences the interface layer, information asymmetry inevitably emerges.

**Causal Diagnosis:**
1. *Structural Power:* The custodian leverages information asymmetry to secure its own survival (Descriptive Egoism).
2. *Legitimacy Capture:* The custodian rewrites the interface rules to declare its own preservation as the primary public good.

**Evaluative Recommendation:**
To resolve this, PMN recommends transitioning from custodian-dependency to direct material audits (see Section 10.1). You should study Section 3.4 for the foundational mechanics and Section 12.5 for the institutional failure modes.`
    }

    if (q.includes('ought') || q.includes('value') || q.includes('suffering') || q.includes('morality')) {
      return `### ✦ PMN ONTOLOGICAL SYSTEM: THE IS-OUGHT BRIDGE

The transition from descriptive fact ('is') to evaluative commitment ('ought') is a core architecture of PMN, resolved through material biology rather than abstract metaphysics.

As outlined in **Axiom 1b** and **Section 3.0**, PMN anchors value in the **Biological Floor**. The experience of suffering has an inherently negative evaluative valence for any conscious organism. This is a descriptive fact.

**The Bridge Mechanics:**
1. *Universal Valence:* Since suffering is materially avoided by organisms, the reduction of structural suffering becomes the non-arbitrary anchor of our value system.
2. *Becoming:* Minimizing the floor enables the expansion of development (Becoming), which acts as the evaluative ceiling.

**Structural Linkages:**
Consult Section 3.0 for the three-level architecture (Life, Suffering, Becoming), and Section 3.3 for the instability caused by systemic suffering.`
    }

    if (q.includes('start') || q.includes('read') || q.includes('begin') || q.includes('guide')) {
      return `### ✦ PMN ENTRY ORIENTATION

Welcome to the PMN Interactive Framework. The manuscript is structurally layered, meaning you do not have to read it linearly from start to finish. Here is your optimal entry strategy:

1. **Foundations (Part I & II):** If you prefer analytical rigor, begin with the metaphysics of material reality (Axiom 1a) and the layered constraint model (Section 2.2).
2. **Compressed Core (Section 15.15):** If you need a high-density operational summary of the entire framework in under 10 minutes, jump straight to Section 15.15.
3. **Power Analysis (Part VI):** To see how PMN diagnoses systemic power, custodian capture, and information bottlenecks, proceed directly to Part VI.
4. **Applied Action (Part XVII):** To explore the ethical demands PMN places on the individual holding it, read Part XVII.

Select 'Contents' in the top bar to choose your path, or jump straight to Section 15.15 to begin the core overview.`
    }

    // Default Fallback Context-based response
    const bestSec = pack.sections?.[0]
    const bestGloss = pack.glossary?.[0]

    let response = `### ✦ PMN CONTEXTUAL SYNTHESIS

Analyzing your query through the lens of the Progressive Materialist Naturalism manuscript. `

    if (bestSec) {
      response += `The most relevant architectural anchor is **Section ${bestSec.id} (${bestSec.title})** under **${bestSec.part}**.\n\n**Manuscript Passage Analysis:**\nThe framework establishes that: \n> "${bestSec.excerpt}..."\n\nThis asserts that material processes are primary (source level) and emergent phenomena must be tracked through their causal dependencies.\n\n`
    } else {
      response += `The manuscript focuses on anchoring all conceptual claims in mind-independent material foundations, bypassing speculative abstractions.\n\n`
    }

    if (bestGloss) {
      response += `**Core Terminology:**\nTo understand this, you should master **${bestGloss.term}** (${bestGloss.def}).\n\n`
    }

    response += `**Analytical Conclusion:**\nPMN tracks these processes using the *Layered Constraint Model* (ecological, biological, economic, institutional, meaning). Any proposed solution that violates a lower layer constraint will inevitably fail.`

    return response
  }

  // Handle Claude Inline Send
  const handleClaudeSend = () => {
    if (!input.trim() || busy) return
    const userQuery = input.trim()
    setInput('')
    setBusy(true)

    const nextMessages: Message[] = [
      ...messages,
      { role: 'user', content: userQuery }
    ]
    setMessages(nextMessages)

    // Append thinking indicator
    setMessages(prev => [
      ...prev,
      { role: 'assistant', content: 'Membaca data manuskrip...', isStreaming: true }
    ])

    setTimeout(() => {
      const pack = buildContextPack(userQuery, 3, 3)
      const fullResponse = generateLocalResponse(userQuery, pack)
      
      // Stream Response
      let index = 0
      const words = fullResponse.split(' ')
      let currentText = ''
      
      const interval = setInterval(() => {
        if (index < words.length) {
          currentText += (index === 0 ? '' : ' ') + words[index]
          index++
          setMessages(prev => {
            const copy = [...prev]
            copy[copy.length - 1] = {
              role: 'assistant',
              content: currentText + '█',
              isStreaming: true
            }
            return copy
          })
        } else {
          clearInterval(interval)
          setMessages(prev => {
            const copy = [...prev]
            copy[copy.length - 1] = {
              role: 'assistant',
              content: currentText,
              isStreaming: false
            }
            return copy
          })
          setBusy(false)
        }
      }, 35)
    }, 800)
  }

  // ChatGPT & Gemini Prompt Generator
  const MODES = {
    agent: 'Terapkan kriteria evaluatif PMN. Hubungkan dengan bagian bab terdekat.',
    diagnostic: 'Terapkan 7 pertanyaan diagnosis ekonomi (11.0) dan tipologi kegagalan (12.5). Fokus pada analisis struktural, bukan sekadar opini.',
    debate: 'Rekonstruksi argumen pengguna ke versi PMN terkuat, lalu tunjukkan di mana letak ketidaklengkapan arsitekturalnya.',
    oracle: 'Format tanggapan kaku: [REFERENSI PMN] -> [ANALISIS STRUKTURAL] -> [IMPLIKASI EVALUATIF]'
  }

  const generateRedirectPrompt = (mode: keyof typeof MODES, question: string) => {
    const pack = buildContextPack(question, 5, 5)
    const modeDesc = MODES[mode] || MODES.agent

    // Format Context sections full text
    const contextSections = pack.sections.map(s => {
      return `\n[${s.id}] ${s.title} (${s.part})\n─────────────────────────────────────\n${s.fullText}\n`
    }).join('\n')

    // Format Glossary terms
    const glossaryTerms = pack.glossary.map(g => `• ${g.term}: ${g.def}`).join('\n')

    return `# PMN Agent — Grounded Input Package

## System Prompt / Role
You are PMN Agent for Progressive Materialist Naturalism (PMN) by Nova Dharma.
Analyze the user's question using ONLY the manuscript extracts provided below.
When answering: cite specific section IDs (e.g. "[3.4]"), label your inferences, and stay analytically rigorous.

## Active Mode
${modeDesc}

## User Question
${question || 'Berikan tinjauan atas bab ini dan letaknya di dalam arsitektur PMN.'}

## PMN Manuscript Extracts
================================================================
${activeSec ? `━━━ CURRENT ACTIVE SECTION ━━━\n[${activeSec.id}] ${activeSec.title}\n─────────────────────────────────────\n${stripHtml(activeSec.html || '').slice(0, 2500)}\n\n` : ''}
━━━ RELATED RETRIEVED SECTIONS ━━━
${contextSections}

━━━ KEY TERMS GLOSSARY ━━━
${glossaryTerms}
================================================================

## Final Output Constraints
- Rely exclusively on the manuscript extracts above.
- Do not make generic philosophical assumptions.
- Cite specific section IDs for every claim.
- End with what empirical evidence would be required to falsify your conclusion.`
  }

  const handleCopyPrompt = (platform: 'chatgpt' | 'gemini') => {
    const queryText = redirectQuery.trim() || (activeSec ? `Jelaskan peran Bab ${activeSec.id} dalam arsitektur PMN.` : 'Berikan tinjauan singkat tentang PMN.')
    const prompt = generateRedirectPrompt(redirectMode, queryText)
    
    navigator.clipboard.writeText(prompt).then(() => {
      setPromptCopied(true)
      setPromptStats(`Teks paket prompt (${Math.round(prompt.length / 1024)} KB) berhasil disalin. Siap ditempelkan ke ${platform === 'chatgpt' ? 'ChatGPT' : 'Gemini'}!`)
      setTimeout(() => setPromptCopied(false), 2000)
    })
  }

  return (
    <div className="bg-[var(--bg2)] dark:bg-[#111] border border-[var(--rule)] p-6 flex flex-col h-[520px] select-none">
      {/* Header Tabs */}
      <div className="flex justify-between items-center border-b border-[var(--rule)] pb-4 mb-4 flex-wrap gap-2">
        <div className="flex items-center gap-2">
          <span className="animate-pulse w-2 h-2 bg-[var(--acc)] rounded-full inline-block" />
          <span className="font-mono text-xs font-bold uppercase tracking-wider text-[var(--ink)] dark:text-gray-200">PMN AI Assistant</span>
        </div>
        <div className="flex gap-2">
          <button 
            onClick={() => setActiveTab('claude')}
            className={`font-mono text-[0.66rem] uppercase tracking-wider px-3 py-1 cursor-pointer transition-colors ${activeTab === 'claude' ? 'bg-[var(--acc)] text-white dark:text-black font-bold' : 'text-[var(--mute)] hover:text-[var(--ink)]'}`}
          >
            Claude (Offline Sim)
          </button>
          <button 
            onClick={() => setActiveTab('chatgpt')}
            className={`font-mono text-[0.66rem] uppercase tracking-wider px-3 py-1 cursor-pointer transition-colors ${activeTab === 'chatgpt' ? 'bg-[var(--acc)] text-white dark:text-black font-bold' : 'text-[var(--mute)] hover:text-[var(--ink)]'}`}
          >
            ChatGPT Handoff
          </button>
          <button 
            onClick={() => setActiveTab('gemini')}
            className={`font-mono text-[0.66rem] uppercase tracking-wider px-3 py-1 cursor-pointer transition-colors ${activeTab === 'gemini' ? 'bg-[var(--acc)] text-white dark:text-black font-bold' : 'text-[var(--mute)] hover:text-[var(--ink)]'}`}
          >
            Gemini Handoff
          </button>
        </div>
      </div>

      {/* CLAUDE OFFLINE SIMULATOR TAB */}
      {activeTab === 'claude' && (
        <div className="flex-1 flex flex-col overflow-hidden">
          {/* Chat Logs */}
          <div ref={chatLogRef} className="flex-1 overflow-y-auto space-y-4 mb-4 p-4 border border-[var(--rule)] bg-[var(--bg)]">
            {messages.length === 0 ? (
              <div className="h-full flex flex-col justify-center items-center text-center text-xs font-mono text-[var(--mute2)] space-y-2">
                <span>✦ PMN AGENT SIMULATOR (OFFLINE) ✦</span>
                <p className="max-w-[320px] font-serif leading-relaxed italic text-[var(--mute)]">
                  Mode ini berjalan 100% lokal di browser Anda. COBA TANYA tentang "ought" atau "custodian".
                </p>
              </div>
            ) : (
              messages.map((m, idx) => (
                <div key={idx} className={`space-y-1 ${m.role === 'user' ? 'text-right' : ''}`}>
                  <span className="font-mono text-[0.6rem] uppercase tracking-wider text-[var(--mute2)]">
                    {m.role === 'user' ? 'You' : 'PMN Agent'}
                  </span>
                  <div className={`p-3 text-left font-serif text-[0.88rem] leading-relaxed whitespace-pre-wrap ${m.role === 'user' ? 'bg-[rgba(201,168,76,0.1)] inline-block border border-[rgba(201,168,76,0.2)]' : 'bg-[var(--bg2)] border border-[var(--rule)]'}`}>
                    {m.content}
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Form Input */}
          <div className="flex gap-2">
            <select 
              value={chatMode} 
              onChange={e => setChatMode(e.target.value as any)}
              className="bg-[var(--bg)] border border-[var(--rule)] text-[var(--ink)] font-mono text-[0.68rem] px-2 outline-none cursor-pointer"
            >
              <option value="agent">Analyst Mode</option>
              <option value="diagnostic">Diagnostic Mode</option>
              <option value="debate">Debate Mode</option>
              <option value="oracle">Oracle Mode</option>
            </select>
            <input 
              type="text"
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleClaudeSend()}
              className="flex-1 bg-[var(--bg)] border border-[var(--rule)] text-[var(--ink)] font-serif p-2 outline-none text-sm focus:border-[var(--acc)]"
              placeholder="Tulis pertanyaan Anda..."
              disabled={busy}
            />
            <button 
              onClick={handleClaudeSend}
              disabled={busy || !input.trim()}
              className="bg-[var(--acc)] text-white dark:text-black font-mono text-xs font-bold uppercase px-4 hover:opacity-75 cursor-pointer disabled:opacity-50"
            >
              Kirim
            </button>
          </div>
        </div>
      )}

      {/* CHATGPT / GEMINI REDIRECT HANDOFF TABS */}
      {(activeTab === 'chatgpt' || activeTab === 'gemini') && (
        <div className="flex-1 flex flex-col justify-between overflow-hidden">
          <div className="space-y-4">
            <p className="font-serif text-sm text-[var(--mute)] leading-relaxed">
              Karena bot eksternal tidak dapat membuka URL dinamis manuskrip, tab ini akan **mengemas teks bab yang sedang Anda baca dan daftar istilah relevan** secara utuh ke dalam clipboard Anda.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-[150px_1fr] gap-3">
              <div>
                <label className="block font-mono text-[0.58rem] uppercase text-[var(--mute2)] mb-1">Mode Agen</label>
                <select 
                  value={redirectMode} 
                  onChange={e => setRedirectMode(e.target.value as any)}
                  className="w-full bg-[var(--bg)] border border-[var(--rule)] text-[var(--ink)] font-mono text-[0.68rem] p-2 outline-none cursor-pointer"
                >
                  <option value="agent">General Analyst</option>
                  <option value="diagnostic">Diagnostic Mode</option>
                  <option value="debate">Debate Partner</option>
                  <option value="oracle">Strict Oracle</option>
                </select>
              </div>
              <div>
                <label className="block font-mono text-[0.58rem] uppercase text-[var(--mute2)] mb-1">Pertanyaan Analitis</label>
                <input 
                  type="text" 
                  value={redirectQuery} 
                  onChange={e => setRedirectQuery(e.target.value)} 
                  className="w-full bg-[var(--bg)] border border-[var(--rule)] text-[var(--ink)] font-serif p-2 outline-none text-sm focus:border-[var(--acc)]"
                  placeholder={activeSec ? `Jelaskan peran Bab ${activeSec.id} dalam arsitektur PMN.` : 'Berikan tinjauan singkat tentang PMN.'}
                />
              </div>
            </div>

            {promptStats && (
              <div className="bg-[#1b2210] border border-[#3b4f24] text-[#a5d6a7] font-mono text-[0.64rem] p-3 leading-relaxed">
                {promptStats}
              </div>
            )}
          </div>

          <div className="flex justify-between items-center mt-4">
            <span className="font-mono text-[0.58rem] text-[var(--mute2)] uppercase tracking-wider">
              ✦ Grounded Prompt Generator ✦
            </span>
            <button 
              onClick={() => handleCopyPrompt(activeTab)}
              className="bg-[var(--acc)] text-white dark:text-black font-mono text-xs font-bold uppercase py-2.5 px-6 tracking-widest hover:opacity-75 cursor-pointer"
            >
              {promptCopied ? 'Tersalin!' : `Salin Prompt & Buka ${activeTab === 'chatgpt' ? 'ChatGPT' : 'Gemini'} ↗`}
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
