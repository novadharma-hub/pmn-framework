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
      return `### ✦ PMN ORIENTATION GUIDE

Welcome to the **Progressive Materialist Naturalism** framework. To understand the architecture of reality through our dialectical lens, we recommend the following path:

1. **Section 1.0 (How to Read):** Establishes the epistemology and the multi-layered reading method.
2. **Axiom 1b:** The core material anchor for our value system.
3. **Part II (Material Foundations):** Lays out the biological and physical basis of naturalism.

You can use the **Search** feature or the **Glossary** (Lexicon) to look up specific terms like 'Metasubjectivity' or 'The Bio-Floor'.`
    }

    if (pack.sections.length > 0) {
      return `### ✦ PMN CONTEXTUAL SEARCH RESULT

I found information in **${pack.sections[0].title} (${pack.sections[0].id})**. 

${pack.sections[0].excerpt}...

**Analysis:**
This section appears to be the most relevant to your inquiry regarding "${query}". Under the current offline simulation mode, I am providing high-level pointers based on the manuscript's structure. For a deeper, generative analysis, please use the **ChatGPT or Gemini Handoff** tabs above.`
    }

    return `### ✦ OFFLINE MODE: LIMITED ANALYSIS

I cannot find a direct dialectical match for "${query}" in the active context. However, based on the PMN framework:

1. Material conditions always precede ideological superstructures.
2. Every inquiry should begin by identifying the underlying information asymmetry.

Try asking about: **"Is-Ought Bridge"**, **"Materialism"**, or **"Institutional Collapse"**.`
  }

  const handleClaudeSend = () => {
    if (!input.trim() || busy) return
    const userMsg: Message = { role: 'user', content: input }
    setMessages(prev => [...prev, userMsg])
    setInput('')
    setBusy(true)

    // Simulate thinking
    setTimeout(() => {
      const pack = buildContextPack(userMsg.content)
      const assistantMsg: Message = { 
        role: 'assistant', 
        content: generateLocalResponse(userMsg.content, pack) 
      }
      setMessages(prev => [...prev, assistantMsg])
      setBusy(false)
    }, 1200)
  }

  const handleCopyPrompt = (platform: 'chatgpt' | 'gemini') => {
    setPromptCopied(true)
    const pack = buildContextPack(redirectQuery || (activeSec?.title || 'General PMN Overview'), 8, 10)
    
    let prompt = `[CONTEXT: PROGRESSIVE MATERIALIST NATURALISM (PMN) FRAMEWORK]\n`
    prompt += `You are acting as an advanced PMN Dialectical Engine. Use the provided context to analyze the following query.\n\n`
    prompt += `CORE QUERY: ${redirectQuery || 'Summarize the provided sections.'}\n\n`
    prompt += `[MANUSKRIP CONTEXT - TARGET SECTIONS]\n`
    pack.sections.forEach(s => {
      prompt += `--- SECTION ${s.id}: ${s.title} ---\n${s.fullText}\n\n`
    })
    
    if (pack.glossary.length > 0) {
      prompt += `[LEXICON DEFINITIONS]\n`
      pack.glossary.forEach(g => {
        prompt += `- ${g.term}: ${g.def}\n`
      })
    }

    prompt += `\n[INSTRUCTIONS]\n`
    prompt += `1. Maintain the philosophical rigor of PMN.\n`
    prompt += `2. Reference specific bab (Section IDs) provided in the text.\n`
    prompt += `3. Identify material foundations vs ideological superstructures in the query.\n`

    navigator.clipboard.writeText(prompt).then(() => {
      setPromptStats(`Teks paket prompt (${Math.round(prompt.length / 1024)} KB) berhasil disalin. Siap ditempelkan ke ${platform === 'chatgpt' ? 'ChatGPT' : 'Gemini'}!`)
      setTimeout(() => setPromptCopied(false), 2000)
    })
  }

  return (
    <div className="bg-pmn-bg2 border border-pmn-rule p-8 flex flex-col h-[520px] select-none shadow-sm">
      {/* Header Tabs */}
      <div className="flex justify-between items-center border-b border-pmn-rule pb-4 mb-6 flex-wrap gap-4">
        <div className="flex items-center gap-2.5">
          <span className="animate-pulse w-2 h-2 bg-pmn-acc rounded-full inline-block shadow-[0_0_8px_rgba(192,39,26,0.4)]" />
          <span className="font-pmn-mono text-[0.65rem] font-bold uppercase tracking-[0.2em] text-pmn-ink">PMN AI Assistant</span>
        </div>
        <div className="flex gap-2">
          <button 
            onClick={() => setActiveTab('claude')}
            className={`font-pmn-mono text-[0.62rem] uppercase tracking-wider px-3 py-1.5 cursor-pointer transition-all ${activeTab === 'claude' ? 'bg-pmn-acc text-white dark:text-black font-bold shadow-sm' : 'text-pmn-mute hover:text-pmn-ink'}`}
          >
            Claude (Offline Sim)
          </button>
          <button 
            onClick={() => setActiveTab('chatgpt')}
            className={`font-pmn-mono text-[0.62rem] uppercase tracking-wider px-3 py-1.5 cursor-pointer transition-all ${activeTab === 'chatgpt' ? 'bg-pmn-acc text-white dark:text-black font-bold shadow-sm' : 'text-pmn-mute hover:text-pmn-ink'}`}
          >
            ChatGPT Handoff
          </button>
          <button 
            onClick={() => setActiveTab('gemini')}
            className={`font-pmn-mono text-[0.62rem] uppercase tracking-wider px-3 py-1.5 cursor-pointer transition-all ${activeTab === 'gemini' ? 'bg-pmn-acc text-white dark:text-black font-bold shadow-sm' : 'text-pmn-mute hover:text-pmn-ink'}`}
          >
            Gemini Handoff
          </button>
        </div>
      </div>

      {/* CLAUDE OFFLINE SIMULATOR TAB */}
      {activeTab === 'claude' && (
        <div className="flex-1 flex flex-col overflow-hidden">
          {/* Chat Logs */}
          <div ref={chatLogRef} className="flex-1 overflow-y-auto space-y-5 mb-5 p-5 border border-pmn-rule bg-pmn-bg shadow-inner scroll-smooth">
            {messages.length === 0 ? (
              <div className="h-full flex flex-col justify-center items-center text-center space-y-3">
                <span className="font-pmn-mono text-[0.6rem] text-pmn-acc uppercase tracking-[0.3em] opacity-80">✦ PMN AGENT SIMULATOR ✦</span>
                <p className="max-w-[320px] font-pmn-body leading-relaxed italic text-[0.85rem] text-pmn-mute/70">
                  Mode ini berjalan 100% lokal. COBA TANYA tentang "ought" atau "custodian".
                </p>
              </div>
            ) : (
              messages.map((m, idx) => (
                <div key={idx} className={`space-y-1.5 ${m.role === 'user' ? 'text-right' : ''}`}>
                  <span className="font-pmn-mono text-[0.58rem] uppercase tracking-widest text-pmn-mute/60 font-bold">
                    {m.role === 'user' ? 'Analytical Request' : 'PMN Dialectical Engine'}
                  </span>
                  <div className={`p-4 text-left font-pmn-body text-[0.88rem] leading-relaxed whitespace-pre-wrap shadow-xs ${m.role === 'user' ? 'bg-pmn-acc/5 inline-block border border-pmn-acc/20 rounded-sm italic' : 'bg-pmn-bg2 border border-pmn-rule rounded-sm'}`}>
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
              className="bg-pmn-bg border border-pmn-rule text-pmn-ink font-pmn-mono text-[0.68rem] px-3 outline-none cursor-pointer hover:border-pmn-acc transition-colors"
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
              className="flex-1 bg-pmn-bg border border-pmn-rule text-pmn-ink font-pmn-body p-3 outline-none text-sm focus:border-pmn-acc transition-colors placeholder:text-pmn-mute/30 shadow-xs"
              placeholder="Ketik pertanyaan analitis..."
              disabled={busy}
            />
            <button 
              onClick={handleClaudeSend}
              disabled={busy || !input.trim()}
              className="bg-pmn-acc text-white dark:text-black font-pmn-mono text-[0.68rem] font-bold uppercase px-6 tracking-widest hover:opacity-85 cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed transition-all"
            >
              Kirim
            </button>
          </div>
        </div>
      )}

      {/* CHATGPT / GEMINI REDIRECT HANDOFF TABS */}
      {(activeTab === 'chatgpt' || activeTab === 'gemini') && (
        <div className="flex-1 flex flex-col justify-between overflow-hidden">
          <div className="space-y-6">
            <p className="font-pmn-body text-[0.9rem] text-pmn-mute leading-relaxed">
              Bot eksternal membutuhkan konteks utuh. Tab ini akan **mengemas naskah bab yang sedang dibaca dan daftar istilah relevan** secara sistematis ke dalam clipboard Anda.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-[160px_1fr] gap-4">
              <div className="space-y-1.5">
                <label className="block font-pmn-mono text-[0.6rem] uppercase text-pmn-mute/80 tracking-widest font-bold">Mode Agen</label>
                <select 
                  value={redirectMode} 
                  onChange={e => setRedirectMode(e.target.value as any)}
                  className="w-full bg-pmn-bg border border-pmn-rule text-pmn-ink font-pmn-mono text-[0.7rem] p-2.5 outline-none cursor-pointer hover:border-pmn-acc transition-colors shadow-xs"
                >
                  <option value="agent">General Analyst</option>
                  <option value="diagnostic">Diagnostic Mode</option>
                  <option value="debate">Debate Partner</option>
                  <option value="oracle">Strict Oracle</option>
                </select>
              </div>
              <div className="space-y-1.5">
                <label className="block font-pmn-mono text-[0.6rem] uppercase text-pmn-mute/80 tracking-widest font-bold">Pertanyaan Khusus</label>
                <input 
                  type="text" 
                  value={redirectQuery} 
                  onChange={e => setRedirectQuery(e.target.value)} 
                  className="w-full bg-pmn-bg border border-pmn-rule text-pmn-ink font-pmn-body p-2.5 outline-none text-[0.9rem] focus:border-pmn-acc transition-colors shadow-xs"
                  placeholder={activeSec ? `Jelaskan peran Bab ${activeSec.id} dalam PMN.` : 'Berikan tinjauan singkat tentang PMN.'}
                />
              </div>
            </div>

            {promptStats && (
              <div className="bg-green-950/20 border border-green-900/50 text-green-400 font-pmn-mono text-[0.65rem] p-4 leading-relaxed animate-in fade-in slide-in-from-top-1">
                {promptStats}
              </div>
            )}
          </div>

          <div className="flex justify-between items-center mt-6 pt-6 border-t border-pmn-rule/50">
            <span className="font-pmn-mono text-[0.6rem] text-pmn-mute/50 uppercase tracking-[0.2em]">
              ✦ Prompt Pack Generator ✦
            </span>
            <button 
              onClick={() => handleCopyPrompt(activeTab)}
              className="bg-pmn-acc text-white dark:text-black font-pmn-mono text-[0.7rem] font-bold uppercase py-3 px-8 tracking-[0.15em] shadow-lg hover:translate-y-[-1px] active:translate-y-[1px] cursor-pointer transition-all"
            >
              {promptCopied ? 'TERKEMAS!' : `SALIN PAKET & BUKA ${activeTab === 'chatgpt' ? 'CHATGPT' : 'GEMINI'} ↗`}
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
