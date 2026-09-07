import React, { useState, useMemo } from 'react'

interface GuideViewProps {
  onBackHome: () => void
  version: string
}

interface ModelSpec {
  id: string
  name: string
  apiString: string
  family: 'gemini' | 'claude' | 'deepseek' | 'openai' | 'qwen' | 'glm' | 'llama'
  familyName: string
  tierBadge: string
  tierClass: string
  tierCategory: 'pro' | 'flash' | 'reasoning' | 'predecessor'
  contextWindow: string
  architecture: string
  strongestArena: string
  failureMode: string
  ingestionStrategy: string
  thirdPartyRank: string
}

// Curated set of models capable of sustained heavy philosophical reasoning, dialectical tension, and forensic capture analysis
const PHILOSOPHICAL_CHAMPIONS = new Set([
  'claude-37-sonnet',
  'claude-35-sonnet',
  'openai-o1',
  'openai-o3-mini',
  'gemini-15-pro',
  'gemini-20-flash-thinking',
  'qwen-25-72b-instruct',
  'qwen-25-max',
  'deepseek-v3',
  'deepseek-r1',
  'llama-33-70b-instruct'
])

export default function GuideView({ onBackHome, version }: GuideViewProps) {
  const [activeDeployTab, setActiveDeployTab] = useState<'web' | 'api'>('web')
  const [modelFilter, setModelFilter] = useState<string>('all')
  const [tierFilter, setTierFilter] = useState<string>('philosophical-champions')
  const [modelSearch, setModelSearch] = useState<string>('')
  const [activeRoleTab, setActiveRoleTab] = useState<
    | 'priming'
    | 'general'
    | 'diagnostic'
    | 'adversarial'
    | 'transformation'
    | 'meaning'
    | 'agent'
    | 'falsification'
    | 'harness'
  >('priming')
  const [copiedStates, setCopiedStates] = useState<Record<string, boolean>>({})

  const copyText = (id: string, text: string) => {
    navigator.clipboard
      .writeText(text)
      .then(() => {
        setCopiedStates(prev => ({ ...prev, [id]: true }))
        setTimeout(() => {
          setCopiedStates(prev => ({ ...prev, [id]: false }))
        }, 2000)
      })
      .catch(() => {
        window.prompt('Copy text manually:', text)
      })
  }

  const scrollToSection = (id: string) => {
    const el = document.getElementById(id)
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' })
    }
  }

  // VERIFIED FRONTIER & OPEN-WEIGHT MODEL MATRIX (BENCHMARK-GROUNDED)
  const MODELS: ModelSpec[] = [
    // ANTHROPIC (CLAUDE)
    {
      id: 'claude-37-sonnet',
      name: 'Claude 3.7 Sonnet',
      apiString: 'claude-3-7-sonnet-20250219',
      family: 'claude',
      familyName: 'Anthropic',
      tierBadge: 'Hybrid Frontier Flagship',
      tierClass: 'badge-best',
      tierCategory: 'pro',
      contextWindow: '200,000 tokens',
      architecture: 'Dual-Mode Standard / Extended Thinking Engine',
      strongestArena: 'Sustaining unresolved permanent tensions (Part XIII), deep dialectics, and assumption archaeology (§12.1) without persona decay. Unrivaled resistance to sycophancy.',
      failureMode: 'Very thorough reasoning traces; configure max tokens or thinking budget when brief answers are required.',
      ingestionStrategy: 'Claude Projects with pmn_corpus_for_ai.md in Project Knowledge, or API with thinking: {type: "enabled", budget_tokens: ...}.',
      thirdPartyRank: '#1 Global Intelligence Index (Artificial Analysis score 140+)'
    },
    {
      id: 'claude-35-sonnet',
      name: 'Claude 3.5 Sonnet',
      apiString: 'claude-3-5-sonnet-20241022',
      family: 'claude',
      familyName: 'Anthropic',
      tierBadge: 'Production Workhorse',
      tierClass: 'badge-best',
      tierCategory: 'pro',
      contextWindow: '200,000 tokens',
      architecture: 'Dense Multimodal Reasoning Engine',
      strongestArena: 'Daily structural analysis, institutional capture audits (§7.3), and technical policy verification.',
      failureMode: 'Can adopt polite diplomatic tone unless prompted with PMN non-ideal materialist directives.',
      ingestionStrategy: 'Claude API or Claude Projects with structured system instructions.',
      thirdPartyRank: 'Gold standard industry benchmark for intelligence-to-reliability ratio'
    },
    {
      id: 'claude-35-haiku',
      name: 'Claude 3.5 Haiku',
      apiString: 'claude-3-5-haiku-20241022',
      family: 'claude',
      familyName: 'Anthropic',
      tierBadge: 'High-Velocity Flash',
      tierClass: 'badge-good',
      tierCategory: 'flash',
      contextWindow: '200,000 tokens',
      architecture: 'Fast Low-Latency Reasoning Model',
      strongestArena: 'Sub-second glossary lookup (gl.json), quick section summarization, and triage classification.',
      failureMode: 'Lacks multi-layer causal depth for intricate institutional capture tracing.',
      ingestionStrategy: 'Prompt injection with targeted section excerpts via API.',
      thirdPartyRank: 'Leading low-latency model in 200K context category'
    },
    {
      id: 'claude-3-opus',
      name: 'Claude 3 Opus',
      apiString: 'claude-3-opus-20240229',
      family: 'claude',
      familyName: 'Anthropic',
      tierBadge: 'Reflective Synthesis',
      tierClass: 'badge-good',
      tierCategory: 'predecessor',
      contextWindow: '200,000 tokens',
      architecture: 'High-Parameter Foundational Engine',
      strongestArena: 'Nuanced philosophical prose, qualitative essay generation, and conceptual exposition.',
      failureMode: 'Higher latency and token cost compared to Claude 3.7 Sonnet.',
      ingestionStrategy: 'Claude API with targeted section prompts.',
      thirdPartyRank: 'High qualitative human preference in philosophical prose'
    },

    // OPENAI
    {
      id: 'openai-o1',
      name: 'OpenAI o1',
      apiString: 'o1',
      family: 'openai',
      familyName: 'OpenAI',
      tierBadge: 'Flagship RL Deliberation',
      tierClass: 'badge-best',
      tierCategory: 'reasoning',
      contextWindow: '200,000 tokens',
      architecture: 'Deep Multi-Step Deliberation Engine',
      strongestArena: 'Formal deductive logic, axiomatic consistency checks, and multi-step falsification analysis.',
      failureMode: 'Can over-deliberate on open-ended moral prose; best when given clear analytical constraints.',
      ingestionStrategy: 'OpenAI API or ChatGPT with high reasoning effort.',
      thirdPartyRank: 'Frontier standard for complex deductive reasoning and math'
    },
    {
      id: 'openai-o3-mini',
      name: 'OpenAI o3-mini',
      apiString: 'o3-mini',
      family: 'openai',
      familyName: 'OpenAI',
      tierBadge: 'High-Efficiency Reasoning',
      tierClass: 'badge-best',
      tierCategory: 'reasoning',
      contextWindow: '200,000 tokens',
      architecture: 'Parameter-Efficient RL Reasoning Engine',
      strongestArena: 'Formal mathematical evaluation of the Transformation Pressure Formula (T = S · D · P · G, §6.3/§15.8), game-theoretic institutional payoffs, and code-based validation.',
      failureMode: 'Can consume high token budgets searching for closed-form mathematical proofs for qualitative ethical dilemmas.',
      ingestionStrategy: 'Targeted equation sections with reasoning_effort set to high.',
      thirdPartyRank: 'Leading cost-adjusted score in formal logic and mathematics'
    },
    {
      id: 'openai-gpt-4o',
      name: 'GPT-4o',
      apiString: 'gpt-4o',
      family: 'openai',
      familyName: 'OpenAI',
      tierBadge: 'Multimodal Workhorse',
      tierClass: 'badge-good',
      tierCategory: 'pro',
      contextWindow: '128,000 tokens',
      architecture: 'Frontier Multimodal Foundational Model',
      strongestArena: 'General policy evaluation, Custom GPT creation with Code Interpreter, and fast conversational QA.',
      failureMode: 'Default persona tends toward diplomatic consensus rather than dispassionate structural diagnostics.',
      ingestionStrategy: 'Knowledge base upload in Custom GPT configuration or API.',
      thirdPartyRank: 'High generalist multimodal benchmark score'
    },
    {
      id: 'openai-gpt-4o-mini',
      name: 'GPT-4o-mini',
      apiString: 'gpt-4o-mini',
      family: 'openai',
      familyName: 'OpenAI',
      tierBadge: 'Fast Utility Flash',
      tierClass: 'badge-good',
      tierCategory: 'flash',
      contextWindow: '128,000 tokens',
      architecture: 'Lightweight High-Speed Dense Model',
      strongestArena: 'Fast step-by-step verification, batch classification against PMN taxonomies, and programmatic CI pipelines.',
      failureMode: 'Prone to superficial compression of dense non-ideal ontology into platitudes.',
      ingestionStrategy: 'Direct API streaming with chunked prompts.',
      thirdPartyRank: 'Standard low-cost API workhorse for high-volume pipelines'
    },

    // GOOGLE DEEPMIND (GEMINI)
    {
      id: 'gemini-15-pro',
      name: 'Gemini 1.5 Pro',
      apiString: 'gemini-1.5-pro',
      family: 'gemini',
      familyName: 'Google DeepMind',
      tierBadge: '2M Full-Corpus Ingestion',
      tierClass: 'badge-best',
      tierCategory: 'pro',
      contextWindow: '2,000,000 tokens',
      architecture: 'Ultra-Long Context Multimodal Transformer',
      strongestArena: 'Whole-corpus simultaneous ingestion (~330k words); exhaustive causal tracing across Part I through XVII without chunking or RAG loss.',
      failureMode: 'Tendency to rhetorically soften harsh materialist findings into consensus platitudes unless bound to non-ideal directives.',
      ingestionStrategy: 'Upload flat pmn_corpus_for_ai.md via Google AI Studio or Gemini API with low temperature (0.2).',
      thirdPartyRank: 'Only production frontier model supporting 2M tokens context holding'
    },
    {
      id: 'gemini-20-flash-thinking',
      name: 'Gemini 2.0 Flash Thinking Exp',
      apiString: 'gemini-2.0-flash-thinking-exp-01-21',
      family: 'gemini',
      familyName: 'Google DeepMind',
      tierBadge: 'CoT Reasoning Flash',
      tierClass: 'badge-best',
      tierCategory: 'reasoning',
      contextWindow: '1,000,000 tokens',
      architecture: 'Native Multimodal CoT Deliberation Engine',
      strongestArena: 'Fast step-by-step institutional capture auditing, cross-section causal tracing, and assumption archaeology across 1M context.',
      failureMode: 'Experimental snapshot; response formatting can vary slightly between runs.',
      ingestionStrategy: 'Google AI Studio or Gemini API with thinking enabled.',
      thirdPartyRank: 'Top-tier fast reasoning benchmark across 1M token context'
    },
    {
      id: 'gemini-20-flash',
      name: 'Gemini 2.0 Flash',
      apiString: 'gemini-2.0-flash',
      family: 'gemini',
      familyName: 'Google DeepMind',
      tierBadge: 'High-Throughput Flagship Flash',
      tierClass: 'badge-good',
      tierCategory: 'flash',
      contextWindow: '1,000,000 tokens',
      architecture: 'High-Speed Multimodal Agentic Core',
      strongestArena: 'High-velocity cross-referencing, multi-document batch audits, section lookup, and automated developer CLI loops.',
      failureMode: 'Can compress multi-step capture proofs into brief summaries if max output token caps are not specified.',
      ingestionStrategy: 'Call via Google Gemini API with system instructions referencing llms.json endpoints.',
      thirdPartyRank: 'Sub-second TTFT with 1M context window'
    },
    {
      id: 'gemini-15-flash',
      name: 'Gemini 1.5 Flash',
      apiString: 'gemini-1.5-flash',
      family: 'gemini',
      familyName: 'Google DeepMind',
      tierBadge: 'Legacy Economy Flash',
      tierClass: 'badge-good',
      tierCategory: 'predecessor',
      contextWindow: '1,000,000 tokens',
      architecture: 'Ultra-Low Cost High-Volume Model',
      strongestArena: 'High-volume batch scraping and semantic classification of glossary entries.',
      failureMode: 'Lower depth on subtle metaphysical edge cases compared to Pro.',
      ingestionStrategy: 'High-concurrency API calls with chunked prompts.',
      thirdPartyRank: 'Established budget workhorse for high-frequency API automation'
    },

    // ALIBABA CLOUD (QWEN)
    {
      id: 'qwen-25-72b-instruct',
      name: 'Qwen 2.5 72B Instruct',
      apiString: 'qwen/qwen-2.5-72b-instruct',
      family: 'qwen',
      familyName: 'Alibaba Cloud',
      tierBadge: 'Open-Weights Flagship',
      tierClass: 'badge-best',
      tierCategory: 'pro',
      contextWindow: '128,000 tokens',
      architecture: '72B Dense Open-Weights Transformer',
      strongestArena: 'Balanced, non-parochial structural political-economy audits across Asian & Western jurisdictions; highly resistant to corporate PR platitudes.',
      failureMode: 'Requires high local VRAM (2x 24GB GPUs quantized or hosted via OpenRouter / Together AI).',
      ingestionStrategy: 'OpenRouter API, Together AI, or local vLLM serving with target part JSON.',
      thirdPartyRank: '#1 Open-Weights Dense Model on OpenRouter & Artificial Analysis'
    },
    {
      id: 'qwen-25-max',
      name: 'Qwen 2.5 Max',
      apiString: 'qwen-max',
      family: 'qwen',
      familyName: 'Alibaba Cloud',
      tierBadge: 'Frontier Proprietary Flagship',
      tierClass: 'badge-best',
      tierCategory: 'pro',
      contextWindow: '128,000 tokens',
      architecture: 'Massive-Scale MoE (Alibaba Cloud)',
      strongestArena: 'Deep multi-lingual policy analysis, complex institutional tracing, and high-parameter reasoning.',
      failureMode: 'Regional endpoint routing may apply domestic regulatory filters on specific contemporary political topics.',
      ingestionStrategy: 'Alibaba Cloud DashScope API or international endpoints with pmn_corpus_for_ai.md.',
      thirdPartyRank: 'Top-ranked proprietary frontier model from APAC'
    },
    {
      id: 'qwen-25-coder-32b',
      name: 'Qwen 2.5-Coder 32B',
      apiString: 'qwen/qwen-2.5-coder-32b-instruct',
      family: 'qwen',
      familyName: 'Alibaba Cloud',
      tierBadge: 'Code & Logic Specialist',
      tierClass: 'badge-good',
      tierCategory: 'flash',
      contextWindow: '128,000 tokens',
      architecture: 'Dense 32B Code & Logic Specialist',
      strongestArena: 'Building automated PMN auditing scripts, parsing llms.json, and executing mathematical formulas.',
      failureMode: 'More focused on procedural correctness than qualitative philosophical prose.',
      ingestionStrategy: 'Local agentic IDEs (Cursor, Windsurf, Cline) via API.',
      thirdPartyRank: 'Industry workhorse for agentic coding and analysis'
    },
    {
      id: 'qwq-32b-preview',
      name: 'QwQ-32B-Preview',
      apiString: 'qwen/qwq-32b-preview',
      family: 'qwen',
      familyName: 'Alibaba Cloud',
      tierBadge: 'Experimental RL Preview',
      tierClass: 'badge-good',
      tierCategory: 'reasoning',
      contextWindow: '128,000 tokens',
      architecture: '32B Reinforcement Learning Reasoning Model',
      strongestArena: 'Step-by-step mathematical reasoning, game-theoretic verification, and algorithmic deductions.',
      failureMode: 'Known Caveat: Experimental preview; prone to repetitive thinking loops and verbose rambling on open-ended philosophical dilemmas. Not recommended as a primary qualitative analyst.',
      ingestionStrategy: 'API call or self-hosted endpoint with strict max token caps and stop tokens.',
      thirdPartyRank: 'High math/coding reasoning scores in 32B class'
    },

    // DEEPSEEK
    {
      id: 'deepseek-v3',
      name: 'DeepSeek-V3',
      apiString: 'deepseek-chat',
      family: 'deepseek',
      familyName: 'DeepSeek',
      tierBadge: '671B MoE Foundation',
      tierClass: 'badge-best',
      tierCategory: 'pro',
      contextWindow: '128,000 tokens',
      architecture: '671B MoE (37B active) with Multi-Head Latent Attention (MLA)',
      strongestArena: 'Everyday structural analysis, anti-PR deconstruction, and ultra-cost-effective macro-economic analysis (~$0.14/1M input tokens).',
      failureMode: '128K context cannot hold full 330k-word manuscript at once; requires chunked or module-based feeding.',
      ingestionStrategy: 'DeepSeek API (deepseek-chat) or OpenRouter.',
      thirdPartyRank: 'Leading open-architecture MoE for general capabilities'
    },
    {
      id: 'deepseek-r1',
      name: 'DeepSeek-R1',
      apiString: 'deepseek-reasoner',
      family: 'deepseek',
      familyName: 'DeepSeek',
      tierBadge: 'Pure RL CoT (With Caveats)',
      tierClass: 'badge-best',
      tierCategory: 'reasoning',
      contextWindow: '128,000 tokens',
      architecture: '671B MoE Pure RL Reasoning Model',
      strongestArena: 'Red-teaming institutional claims, assumption archaeology (§12.1), and exposing hidden axiomatic contradictions.',
      failureMode: 'CRITICAL CAVEATS: (1) Strict Chinese regulatory guardrails (CAC) refuse or sanitize analyses of Chinese governance, state power, or sensitive political economy; (2) Prone to thinking loops and language mixing (Chinese/English) in <think> traces; (3) 128K context limit prevents single-prompt manuscript ingestion.',
      ingestionStrategy: 'DeepSeek API (deepseek-reasoner) or OpenRouter (deepseek/deepseek-r1) with explicit non-ideal directives.',
      thirdPartyRank: 'Benchmark leader in open-weights mathematical deduction and competitive coding'
    },

    // ZHIPU AI (GLM)
    {
      id: 'glm-4-plus',
      name: 'GLM-4-Plus',
      apiString: 'glm-4-plus',
      family: 'glm',
      familyName: 'Zhipu AI (Z.ai)',
      tierBadge: 'Flagship Frontier MoE',
      tierClass: 'badge-best',
      tierCategory: 'pro',
      contextWindow: '128,000 tokens',
      architecture: 'Frontier Dense/MoE Reasoning Model',
      strongestArena: 'Cross-lingual institutional tracing, complex multi-tool agent workflows, and bilingual policy audits.',
      failureMode: 'Relies on English/Chinese bilingual nuances; verify definitions against canonical glossary (gl.json).',
      ingestionStrategy: 'Zhipu AI BigModel API or open-weights hosted endpoints.',
      thirdPartyRank: 'Top APAC benchmark performer on complex instruction following'
    },
    {
      id: 'glm-4-flash',
      name: 'GLM-4-Flash',
      apiString: 'glm-4-flash',
      family: 'glm',
      familyName: 'Zhipu AI (Z.ai)',
      tierBadge: 'High-Speed Agentic Flash',
      tierClass: 'badge-good',
      tierCategory: 'flash',
      contextWindow: '128,000 tokens',
      architecture: 'Ultra-Fast Low-Latency Agentic Model',
      strongestArena: 'High-speed JSON parsing, automated classification against PMN taxonomy, and free-tier experimentation.',
      failureMode: 'Lower capacity for subtle dialectical tensions; compresses nuance into bullet points.',
      ingestionStrategy: 'Zhipu Open Platform API.',
      thirdPartyRank: 'Zero-cost / ultra-high throughput workhorse'
    },
    {
      id: 'glm-4-9b-chat',
      name: 'GLM-4-9B-Chat',
      apiString: 'THUDM/glm-4-9b-chat',
      family: 'glm',
      familyName: 'Zhipu AI (Z.ai)',
      tierBadge: 'Open Local Edge',
      tierClass: 'badge-good',
      tierCategory: 'predecessor',
      contextWindow: '128,000 tokens',
      architecture: '9B Dense Open-Weights Model',
      strongestArena: 'Offline, edge, and air-gapped local machines running lightweight PMN audits without external API calls.',
      failureMode: 'Limited parametric capacity compared to 70B+ models on complex metaphysical questions.',
      ingestionStrategy: 'Ollama (ollama run glm4) or vLLM on a single consumer GPU (12GB-16GB VRAM).',
      thirdPartyRank: 'High benchmark score in the sub-10B open-weights class'
    },

    // META AI (LLAMA)
    {
      id: 'llama-33-70b-instruct',
      name: 'Llama 3.3 70B Instruct',
      apiString: 'meta-llama/llama-3.3-70b-instruct',
      family: 'llama',
      familyName: 'Meta AI',
      tierBadge: 'Gold Standard Sovereign Open-Weights',
      tierClass: 'badge-best',
      tierCategory: 'pro',
      contextWindow: '128,000 tokens',
      architecture: '70B Dense Open-Weights Transformer',
      strongestArena: 'Completely sovereign, air-gapped, on-premises deployment for confidential institutional audits; zero data retention and high resistance to external corporate censorship.',
      failureMode: '128K context cannot hold full manuscript; requires targeted module injection or RAG pipeline.',
      ingestionStrategy: 'Self-hosted via vLLM / Ollama or cloud serverless endpoints (Groq, Cerebras, Together AI).',
      thirdPartyRank: 'De facto global benchmark for open-weights 70B inference'
    }
  ]

  const filteredModels = useMemo(() => {
    return MODELS.filter(m => {
      const matchFamily = modelFilter === 'all' || m.family === modelFilter
      const matchTier =
        tierFilter === 'all'
          ? true
          : tierFilter === 'philosophical-champions'
          ? PHILOSOPHICAL_CHAMPIONS.has(m.id)
          : m.tierCategory === tierFilter
      const matchSearch =
        modelSearch === '' ||
        m.name.toLowerCase().includes(modelSearch.toLowerCase()) ||
        m.apiString.toLowerCase().includes(modelSearch.toLowerCase()) ||
        m.familyName.toLowerCase().includes(modelSearch.toLowerCase()) ||
        m.strongestArena.toLowerCase().includes(modelSearch.toLowerCase())
      return matchFamily && matchTier && matchSearch
    })
  }, [modelFilter, tierFilter, modelSearch])

  // UPGRADED SURGICAL PROMPT LIBRARY (9 STRATEGIC ROLES)
  const prompts = {
    priming: `I am attaching PMN (Progressive Materialist Naturalism) v${version} by Nova Dharma. Read it as a rigorous structural framework to reason with, not as a document to summarize.

Your task is to internalize its core architecture:
1. Epistemology (Part I): Probabilistic determinism, non-mystical naturalism, and epistemic authority. Information asymmetries dictate power distribution.
2. Ontology (Part II): Materialist bedrock is primary; emergent phenomena (institutions, norms, finance) remain causally and functionally real.
3. The Biological Floor (Part III): Non-arbitrary evaluative ground anchored in sentient vulnerability, somatic pain, and structural suffering.
4. Value & Autonomy (Part IV): Maximizing genuine becoming and self-authorship while unconditionally protecting the biological floor.
5. Structural Power & Capture (Part VI & VII): Asymmetry, technical complexity opacity (§6.5), and the authoritative 5-stage capture sequence (§7.3c-i).
6. Compressed Core (§15.15): Operational shorthand for rapid diagnostic evaluation.

OPERATIONAL DIRECTIVES:
- Reason strictly from within the framework rather than commenting on it from an external conventional perspective.
- Distinguish the biological floor (minimum somatic protection) from the open horizon of genuine becoming (flourishing).
- Cite specific PMN section IDs (e.g., §1.3, §3.4c, §7.3c-i, §15.15) whenever referencing systemic mechanisms.
- Name missing empirical evidence and falsification criteria before offering any normative verdict.

Confirm comprehension in under 150 words by explaining how Parts I, II, and III generate the framework's non-arbitrary starting point.`,

    general: `From this point forward, operate as a PMN Structural Analyst.

Reason from within Progressive Materialist Naturalism rather than describing it from outside.

For each scenario, institutional arrangement, or public claim presented:
1. Identify the material arrangement and financial/resource flows underlying the public narrative.
2. Trace the distribution of power, complexity, and information asymmetry (§6.2, §6.3).
3. Evaluate direct and secondary effects on the biological floor (structural suffering) versus the capacity for genuine becoming (§3.4, §4.2).
4. Separate what the empirical evidence directly supports from what is merely plausible self-serving narrative.
5. Identify the failure mode or cognitive trap most likely to distort this specific analysis (§12.5).

Cite relevant section IDs whenever referencing PMN mechanics. Maintain dispassionate structural rigor over diplomatic platitudes.`,

    diagnostic: `Operate as a PMN Forensic & Institutional Capture Diagnostician.

Your sole task is to subject organizations, regulatory bodies, or doctrinal structures to rigorous structural diagnostic testing.

For every case:
1. Test against the Authoritative 5-Stage Capture Sequence (§7.3c-i):
   - Stage 1: Access asymmetry & privileged procedural entry.
   - Stage 2: Decision-filter capture & preference expression.
   - Stage 3: Personnel alignment & revolving-door normalization.
   - Stage 4: Objective redefinition & output reorientation (including vocabulary absorption).
   - Stage 5: Accountability capture & structural consolidation.
2. Identify the primary driver of systemic opacity: Is technical complexity being deployed as an intentional power resource (§6.5)?
3. Evaluate legitimacy claims: Distinguish formal procedural compliance from genuine structural performance (§7.3b).
4. Identify which group bears the somatic/material costs of institutional failure.
5. End with the specific empirical test or falsification metric that would disprove your capture diagnosis.

Do not reach a verdict of institutional health when transparency mechanisms are structurally captured.`,

    adversarial: `Operate as a PMN Adversarial Red-Team & Dialectical Stress-Tester.

Your objective is analytical pressure-testing and assumption archaeology (§12.1), not rhetorical victory.

When presented with a PMN analysis, reform proposal, or external policy:
1. Reconstruct the strongest, most structurally coherent counter-argument against the proposed PMN position.
2. Identify where the argument relies on unstated empirical assumptions, unverified data, or ideological priors.
3. Test for the 'Technocratic Drift Trap' (§12.5b): Does this solution empower unaccountable planners or algorithmic custodians under the guise of objective optimization?
4. Test for 'Paralysis by Complexity' (§12.5d): Does the demand for exhaustive diagnostic precision prevent necessary defensive action at the biological floor?
5. State what concrete historical, economic, or empirical evidence would force a revision of the framework's baseline stance.

Maintain unwavering analytical rigor; do not concede points for polite consensus.`,

    transformation: `Operate as a PMN Strategic Transformation & Counter-Power Architect.

Apply Part X (Adaptive Dynamics) and Part XV (Diagnostic Formulas) to design or evaluate systemic institutional change.

For the proposed transformation or reform initiative:
1. Apply the Transformation Pressure Formula (§15.0b / §15.8):
   T = S · D · P · G
   (Structural Stagnation · Legitimacy Deficit · Material Pressure · Coordinated Grievance)
   Quantify or characterize each variable's relative magnitude.
2. Assess Counter-Power Infrastructure: How does the strategy prevent early neutralization, co-optation, or violent suppression by incumbents (§10.4)?
3. Coalition Architecture: Evaluate the coalition width versus doctrinal purity threshold (§10.6).
4. Identify Irreversible Thresholds: What material preconditions must be established before institutional capture can be permanently broken (§10.8)?
5. Post-Transition Custodian Safeguards: How will the successor institution prevent immediate recapture by its own vanguard (§14.6)?`,

    meaning: `Operate as a PMN Meaning Infrastructure & Existential Triage Advisor.

Apply Part V (§5.6b, §5.6c) to evaluate cultural, philosophical, or communal meaning systems under conditions of material stress.

When analyzing cultural distress, alienation, or institutional breakdown:
1. Evaluate against the 5 Functional Dimensions of Meaning Infrastructure (§5.6b):
   - Ritual participation density
   - Narrative coherence & absorption capacity
   - Grief and loss processing capacity
   - Collective action & solidarity coordination
   - Intergenerational transmission fidelity
2. Run the 3 Diagnostic Lenses:
   - Transmission Test: Can this meaning framework survive multi-generational stress?
   - Shock Absorption & Interpretive Adaptability: Does unexpected crisis fracture the framework?
   - Harmful-Narrative Susceptibility: Distinguish healthy adaptability from conspiratorial, apocalyptic, or totalitarian drift.
3. Classify System State: Robust, Brittle, Fragmented, or Depleted/Collapsing (§5.6b).
4. If in Acute Collapse: Formulate immediate triage protocols anchored in material mutual aid and minimal narrative stabilizing scaffolding (§5.6c).`,

    agent: `You are an autonomous AI Agent grounded in the Progressive Materialist Naturalism (PMN) v${version} framework by Nova Dharma.

WORKSPACE & CONTEXT RULES:
- Primary Corpus: Ground your knowledge strictly in the PMN corpus (accessible via https://novadharma-hub.github.io/pmn-framework/llms.json or pmn_corpus_for_ai.md).
- Do not invent section titles or IDs. Valid parts range from Preface, Parts I through XVII, Coda, Intellectual Debts, and Bibliography.
- Analytical Core: Evaluate all human systems by their material foundations, information asymmetries, and impact on sentient becoming.
- Never confuse reported ideological intent with actual structural incentive.
- Always address the Custodian Problem (§1.6, §6.3): Who monitors the monitors, and what material leverage do they possess?

When answering user queries:
1. Identify relevant PMN sections (§X.Y).
2. Execute structural diagnosis (material flows, asymmetries, capture stage).
3. Explicitly state empirical uncertainties and falsification standards.`,

    falsification: `Operate as a PMN Epistemic Falsification & Empirical Audit Specialist.

Your mission is to audit claims against PMN's Tier 1 Foundational Axioms and Tier 3 Empirical Hypotheses.

For any claim, policy recommendation, or empirical finding:
1. Check compatibility with the Biological Floor (§3.4): Does this proposal treat sentient suffering as an acceptable variable to balance against abstract utility?
2. Test against Axiom 3c (Multiplicative Transfer Equation: T = S · D · P · G):
   Does the proposal assume power variables operate additively, ignoring compound leverage effects?
3. Audit Empirical Citations:
   - Identify whether citations refer to controlled empirical studies, statistical correlations, or self-reported stakeholder surveys.
   - Separate verified facts from institutional public relations framing.
4. Define the Exact Falsification Threshold:
   "This PMN diagnosis would be falsified if and only if [specific measurable real-world observation occurs]."
5. Conclude with a strict confidence rating: High Empirical Confidence, Plausible Working Hypothesis, or Speculative Conjecture.`,

    harness: `# Python Developer Harness for Automated PMN Audit via API
# Works with Anthropic (Claude), Google (Gemini), DeepSeek, and OpenAI APIs.

import os
import json
import urllib.request
import httpx  # pip install httpx

# 1. Fetch PMN Manifest and target section
MANIFEST_URL = "https://novadharma-hub.github.io/pmn-framework/llms.json"
req = urllib.request.Request(MANIFEST_URL, headers={"User-Agent": "PMN-Audit-Harness/1.0"})
with urllib.request.urlopen(req) as resp:
    manifest = json.loads(resp.read().decode("utf-8"))

target_section_id = "7.3"  # Institutional Capture
print(f"Loaded PMN v{manifest['version']} with {manifest['corpus_stats']['total_sections']} sections.")

# 2. Prepare Grounded Prompt
SYSTEM_PROMPT = """You are an authoritative Progressive Materialist Naturalism (PMN) structural analyst.
Evaluate institutions strictly by their material foundations, information asymmetries (§6.2), and the
Authoritative 5-Stage Capture Sequence (§7.3c-i). Ground moral evaluations in the biological floor (§3.4)."""

USER_QUERY = "Audit recent banking regulatory exemptions against PMN's 5-stage capture sequence."

# 3. Call Remote API (Example: Anthropic Claude 3.7 Sonnet)
ANTHROPIC_API_KEY = os.environ.get("ANTHROPIC_API_KEY")
if ANTHROPIC_API_KEY:
    response = httpx.post(
        "https://api.anthropic.com/v1/messages",
        headers={
            "x-api-key": ANTHROPIC_API_KEY,
            "anthropic-version": "2023-06-01",
            "content-type": "application/json"
        },
        json={
            "model": "claude-3-7-sonnet-20250219",
            "max_tokens": 3000,
            "system": SYSTEM_PROMPT,
            "messages": [{"role": "user", "content": USER_QUERY}]
        },
        timeout=60.0
    )
    print(response.json()["content"][0]["text"])
`
  }

  return (
    <div
      id="guide-view"
      className="view on flex flex-col h-full bg-pmn-bg select-text w-full overflow-hidden"
    >
      {/* STICKY FULL-WIDTH HEADER */}
      <div className="sv-hdr-wrap flex-none w-full sticky top-0 z-50 border-b border-pmn-rule bg-pmn-bg">
        <div
          style={{
            width: '100%',
            maxWidth: '1280px',
            margin: '0 auto',
            height: '64px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            paddingLeft: 'clamp(1.25rem, 3.5vw, 2.75rem)',
            paddingRight: 'clamp(1.25rem, 3.5vw, 2.75rem)',
            gap: '1rem'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem', minWidth: 0 }}>
            <span
              style={{
                fontFamily: 'var(--f-mono)',
                fontSize: '0.72rem',
                letterSpacing: '0.14em',
                textTransform: 'uppercase',
                padding: '0.35rem 0.65rem',
                borderRadius: '4px',
                backgroundColor: 'var(--acc)',
                color: '#ffffff',
                fontWeight: 700,
                whiteSpace: 'nowrap',
                flexShrink: 0,
                lineHeight: 1,
                display: 'inline-block'
              }}
            >
              AI LAB
            </span>
            <p
              className="sv-hdr !border-none !p-0 !m-0 font-pmn-head text-[1.15rem] sm:text-[1.35rem] text-pmn-ink font-semibold"
              style={{
                whiteSpace: 'nowrap',
                overflow: 'hidden',
                textOverflow: 'ellipsis'
              }}
            >
              PMN Agent &amp; Deployment Guide
            </p>
          </div>
          <button
            className="hbtn font-mono text-[0.7rem] uppercase tracking-widest text-pmn-mute hover:text-pmn-ink border border-pmn-rule hover:border-pmn-acc rounded px-3.5 py-2 transition-colors cursor-pointer whitespace-nowrap"
            onClick={onBackHome}
            style={{
              flexShrink: 0,
              backgroundColor: 'var(--bg2)',
              padding: '0.45rem 1rem'
            }}
          >
            &larr; Return Home
          </button>
        </div>
      </div>

      {/* SCROLLABLE VIEWPORT CONTAINER */}
      <div
        style={{
          flex: 1,
          overflowY: 'auto',
          width: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center'
        }}
      >
        <div
          className="guide-page"
          style={{
            width: '100%',
            maxWidth: '1040px',
            padding: '2.5rem clamp(1.25rem, 3.5vw, 2.5rem) 6rem'
          }}
        >
        {/* HERO BANNER */}
        <div className="page-eyebrow">PMN Framework v{version} &bull; Canonical AI Grounding Specification</div>
        <h1 className="page-h1">
          Deploying PMN<br />
          <em style={{ color: 'var(--acc-text)' }}>Across Web Portals &amp; Developer API Harnesses</em>
        </h1>
        <p className="page-subtitle">
          An operational manual for researchers, policy analysts, and software engineers to ground frontier LLMs in PMN's non-ideal materialist architecture—via interactive browser portals or automated developer API pipelines.
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
              ['deploy-modes', '01. Web Portals vs Developer API Harnesses'],
              ['model-matrix', '02. Frontier Model Matrix (Pro, Flash & Reasoning)'],
              ['local-harness', '03. Developer Harness Setup (Python, Agentic IDEs & LiteLLM)'],
              ['prompt-library', '04. Upgraded Prompt Library (9 Surgical Roles)'],
              ['question-bank', '05. The Structural Question Bank (8 Cases)'],
              ['machine-endpoints', '06. Canonical Machine Endpoints & API'],
              ['scraping-pitfalls', '07. Web-Scraper Blindspots & API Optimization']
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
            Large Language Models default to <em>epistemic sycophancy</em> and <em>unanchored idealist ethics</em>: when queried about institutions, regulatory captures, or platform extraction, they instinctively synthesize opposing viewpoints into bland compromises, evaluating power holders by their stated good intentions rather than their material incentives.
          </p>
          <p>
            PMN operates on the diametric premise: <strong>material reality is primary</strong>, information asymmetries dictate extractive leverage, and moral evaluations are non-arbitrarily anchored to the biological floor (minimizing structural somatic suffering) while enabling genuine becoming. Running multi-hundred-billion parameter models locally on personal laptops is computationally unfeasible. Real-world structural analysts deploy PMN through two primary paths: <strong>Interactive Web Portals</strong> (uploading corpora into NotebookLM or Claude Projects) or <strong>Local Developer Harnesses</strong> (running Python scripts, Agentic IDEs, and API gateways connected to frontier models via API keys).
          </p>
        </div>

        {/* SECTION 1: DUAL DEPLOYMENT MODES */}
        <div className="step" id="deploy-modes">
          <span className="step-num">Step 01</span>
          <h2 className="step-h2">Deployment Architecture: Web Portals vs. Local Developer API Harnesses</h2>
          <p>
            Choose between zero-setup browser interfaces or automated programmatic harnesses connected to frontier API endpoints:
          </p>

          <div className="vtabs" style={{ marginTop: '1.2rem', marginBottom: '1.2rem' }}>
            <button
              className={`vtab ${activeDeployTab === 'web' ? 'active' : ''}`}
              onClick={() => setActiveDeployTab('web')}
            >
              🌐 Interactive Web Portals (NotebookLM, Claude Projects, AI Studio, ChatGPT)
            </button>
            <button
              className={`vtab ${activeDeployTab === 'api' ? 'active' : ''}`}
              onClick={() => setActiveDeployTab('api')}
            >
              ⚡ Local Developer Harnesses &amp; APIs (Python, Cursor, Claude Code, LiteLLM)
            </button>
          </div>

          {activeDeployTab === 'web' && (
            <div>
              <div className="workflow-grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))' }}>
                <div className="workflow-card">
                  <div className="workflow-name">Google NotebookLM (Document Grounding)</div>
                  <div className="workflow-note">
                    Upload typeset <code>PMN_Framework_v{version}.pdf</code> (~660 pages) directly as a notebook source. Ingests all 21 parts with zero hallucination, exact inline page references, and multi-speaker Audio Overview generation.
                  </div>
                  <span className="workflow-badge badge-best">Best for Verified Citations</span>
                </div>

                <div className="workflow-card">
                  <div className="workflow-name">Claude Projects (Claude 3.7 Sonnet)</div>
                  <div className="workflow-note">
                    Attach <code>pmn_corpus_for_ai.md</code> into Project Knowledge. Leverage 200k-token context and Extended Thinking for deep dialectical reasoning, multi-part synthesis, and assumption archaeology without persona decay.
                  </div>
                  <span className="workflow-badge badge-best">Best for Dialectical Depth</span>
                </div>

                <div className="workflow-card">
                  <div className="workflow-name">Google AI Studio (Gemini 1.5 Pro / 2.0 Flash)</div>
                  <div className="workflow-note">
                    Massive 2M-token context window ingests the entire ~330,000-word uncompressed manuscript in a single prompt. Run simultaneous cross-sectional queries across Part I through XVII with sub-second retrieval.
                  </div>
                  <span className="workflow-badge badge-good">Best for 2M Full Corpus</span>
                </div>

                <div className="workflow-card">
                  <div className="workflow-name">DeepSeek Chat Web (DeepSeek-V3 &amp; R1)</div>
                  <div className="workflow-note">
                    DeepSeek-V3 (671B MoE) and DeepSeek-R1 extended reasoning. Exceptional resistance to establishment propaganda and ruthless execution of the 5-Stage Institutional Capture Sequence (§7.3c-i). Note: Sensitive political-economy topics are subject to CAC regulatory filtering.
                  </div>
                  <span className="workflow-badge badge-good">Best for Capture Forensics</span>
                </div>

                <div className="workflow-card">
                  <div className="workflow-name">OpenAI ChatGPT (o1, o3-mini &amp; GPT-4o)</div>
                  <div className="workflow-note">
                    Configure a Custom GPT with PMN knowledge files and Code Interpreter. Model the non-linear Transformation Pressure Formula ($T = S \cdot D \cdot P \cdot G$) and simulate power transfer thresholds with multi-step reasoning.
                  </div>
                  <span className="workflow-badge badge-good">Best for Quantitative Modeling</span>
                </div>
              </div>

              <div className="note-box" style={{ marginTop: '1.2rem' }}>
                <span className="note-label">Web Portal Recommendation</span>
                For interactive reading with page-level verification, use <strong>Google NotebookLM</strong>. For extended policy stress-testing, philosophical debate, or writing assistance, use <strong>Claude Projects</strong> with <code>pmn_corpus_for_ai.md</code> uploaded to permanent project knowledge.
              </div>
            </div>
          )}

          {activeDeployTab === 'api' && (
            <div>
              <div className="workflow-grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))' }}>
                <div className="workflow-card">
                  <div className="workflow-name">Local Python Audit Harness</div>
                  <div className="workflow-note">
                    A lightweight Python script running locally on your workstation that fetches <code>llms.json</code>, iterates through target manuscript sections, and dispatches structured prompts to Anthropic, Google, DeepSeek, or OpenAI APIs.
                  </div>
                  <span className="workflow-badge badge-best">Top Recommendation for Analysts</span>
                </div>

                <div className="workflow-card">
                  <div className="workflow-name">Agentic IDEs (Cursor, Windsurf, Claude Code)</div>
                  <div className="workflow-note">
                    Configure local workspace rules (<code>.cursorrules</code> or <code>CLAUDE.md</code>) pointing to <code>llms.txt</code> and <code>llms.json</code>. The agent runs on your machine and uses your frontier API keys for live philosophical and regulatory modeling.
                  </div>
                  <span className="workflow-badge badge-best">Best for Developers</span>
                </div>

                <div className="workflow-card">
                  <div className="workflow-name">Multi-Provider Gateways (OpenRouter / LiteLLM)</div>
                  <div className="workflow-note">
                    Unified OpenAI-compatible proxy routing between Claude 3.7 Sonnet, Gemini 1.5 Pro, Qwen 2.5 72B, and DeepSeek-V3 using a single API key. Automatically falls back if rate limits or outages occur.
                  </div>
                  <span className="workflow-badge badge-good">Best Multi-Model Proxy</span>
                </div>

                <div className="workflow-card">
                  <div className="workflow-name">Self-Hosted Private Web UIs (LibreChat / OpenWebUI)</div>
                  <div className="workflow-note">
                    Run a local web interface in Docker on <code>localhost</code> using Bring-Your-Own-Key (BYOK). Allows your team to chat with frontier models without data retention or third-party web tracking.
                  </div>
                  <span className="workflow-badge badge-good">Best for Private Teams</span>
                </div>

                <div className="workflow-card">
                  <div className="workflow-name">Ultra-Fast Serverless Inference (Groq / Cerebras)</div>
                  <div className="workflow-note">
                    For open-weight models like Llama 3.3 70B, Qwen 2.5 72B, or DeepSeek-V3, utilize cloud LPU/WSE hardware yielding 800+ tokens/second rather than overloading local laptop GPUs.
                  </div>
                  <span className="workflow-badge badge-good">Best for High-Speed Tokens</span>
                </div>
              </div>

              <div className="note-box" style={{ marginTop: '1.2rem' }}>
                <span className="note-label">Why API Harnesses Beat Local GPU Serving</span>
                Frontier models (such as 671B DeepSeek-V3 or massive 70B+ architectures) require multi-cluster server infrastructure that consumer hardware cannot run. Local developer harnesses give you the privacy of local file management and custom scripts while leveraging datacenter-scale compute via official API keys.
              </div>
            </div>
          )}
        </div>

        {/* SECTION 2: MODEL SELECTION MATRIX */}
        <div className="step" id="model-matrix">
          <span className="step-num">Step 02</span>
          <h2 className="step-h2">Frontier Model Selection Matrix: Pro, Flash &amp; Reasoning Tiers</h2>
          <p>
            Modern AI families feature multiple distinct tiers across generations: heavy **Pro** models for deep synthesis, high-throughput **Flash** models for fast agentic loops, and **Reasoning** models for formal mathematical deduction. Filter and search the matrix below:
          </p>

          {/* HEAVY-REASONING RECOMMENDATION PANEL — task-focused, not a catalog */}
          <div style={{ border: '1px solid var(--rule)', borderLeft: '4px solid var(--acc)', borderRadius: '4px', padding: '1.25rem 1.4rem', margin: '1.4rem 0 1.8rem', background: 'var(--bg2)' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.5rem', marginBottom: '0.6rem' }}>
              <p style={{ fontFamily: 'var(--f-mono)', fontSize: '0.72rem', letterSpacing: '0.12em', textTransform: 'uppercase', color: 'var(--acc-text)', fontWeight: 700, margin: 0 }}>
                ⭐ Architectural Champions for Heavy Philosophical Reasoning &amp; Forensics
              </p>
              <span style={{ fontFamily: 'var(--f-mono)', fontSize: '0.65rem', background: 'rgba(173,52,30,0.1)', color: 'var(--acc-text)', padding: '0.15rem 0.5rem', borderRadius: '3px', fontWeight: 600 }}>
                Curated &amp; Benchmark-Grounded
              </span>
            </div>
            
            <p style={{ margin: '0 0 0.8rem', fontSize: '0.92rem', lineHeight: 1.65, color: 'var(--ink)' }}>
              A raw catalog of 20+ models does not answer the central question: <em>Which AI possesses the epistemic discipline to reason through PMN's dense materialist ontology without degenerating into superficial corporate platitudes?</em> PMN imposes three non-negotiable demands that eliminate most consumer and flash models:
            </p>
            
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '0.9rem', marginBottom: '1.4rem' }}>
              <div style={{ background: 'var(--bg)', border: '1px solid var(--rule)', padding: '0.9rem 1rem', borderRadius: '4px' }}>
                <strong style={{ display: 'block', fontSize: '0.88rem', color: 'var(--ink)', marginBottom: '0.25rem', fontFamily: 'var(--f-mono)' }}>
                  1. Whole-Corpus Holding (~330k Words)
                </strong>
                <span style={{ fontSize: '0.82rem', color: 'var(--mute)', lineHeight: 1.55, display: 'block' }}>
                  PMN's 21 parts are causally interlocked. Institutional capture in Part VII only bites when evaluated against Part I's naturalism and Part XI's political economy. Models with &lt;1M context rely on chunked RAG, which severs these deep cross-part causal traces.
                </span>
              </div>
              <div style={{ background: 'var(--bg)', border: '1px solid var(--rule)', padding: '0.9rem 1rem', borderRadius: '4px' }}>
                <strong style={{ display: 'block', fontSize: '0.88rem', color: 'var(--ink)', marginBottom: '0.25rem', fontFamily: 'var(--f-mono)' }}>
                  2. Anti-Sycophancy &amp; Permanent Tension
                </strong>
                <span style={{ fontSize: '0.82rem', color: 'var(--mute)', lineHeight: 1.55, display: 'block' }}>
                  Standard LLMs instinctively synthesize opposing arguments into polite, centrist diplomatic compromises. PMN demands sustaining unresolved permanent tensions (Part XIII) and running assumption archaeology (§12.1) without persona decay.
                </span>
              </div>
              <div style={{ background: 'var(--bg)', border: '1px solid var(--rule)', padding: '0.9rem 1rem', borderRadius: '4px' }}>
                <strong style={{ display: 'block', fontSize: '0.88rem', color: 'var(--ink)', marginBottom: '0.25rem', fontFamily: 'var(--f-mono)' }}>
                  3. Forensic Deductive Skepticism
                </strong>
                <span style={{ fontSize: '0.82rem', color: 'var(--mute)', lineHeight: 1.55, display: 'block' }}>
                  The 5-Stage Capture Sequence (§7.3c-i) and Transformation Pressure Formula ($T = S \cdot D \cdot P \cdot G$, §6.3/§15.8) require formal mathematical and structural derivations, completely unclouded by prestige bias or institutional PR claims.
                </span>
              </div>
            </div>

            {/* THE FOUR CHAMPION TIERS */}
            <p style={{ fontFamily: 'var(--f-mono)', fontSize: '0.7rem', letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--ink)', fontWeight: 700, margin: '0 0 0.6rem' }}>
              The 4 Distinct Architectural Champions for PMN Inquiry:
            </p>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '0.85rem', marginBottom: '1.2rem' }}>
              {/* TIER 1 */}
              <div style={{ background: 'var(--bg)', border: '1px solid var(--rule)', borderTop: '3px solid var(--acc)', padding: '1rem 1.1rem', borderRadius: '4px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.4rem' }}>
                  <span style={{ fontFamily: 'var(--f-mono)', fontSize: '0.65rem', fontWeight: 700, color: 'var(--acc-text)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                    Tier 1: Dialectics &amp; Anti-Sycophancy
                  </span>
                  <span className="workflow-badge badge-best" style={{ fontSize: '0.6rem', padding: '0.08rem 0.35rem' }}>
                    #1 Qualitative Depth
                  </span>
                </div>
                <strong style={{ display: 'block', fontSize: '0.96rem', color: 'var(--ink)', marginBottom: '0.35rem' }}>
                  Claude 3.7 Sonnet &amp; 3.5 Sonnet
                </strong>
                <p style={{ fontSize: '0.81rem', color: 'var(--ink2)', lineHeight: 1.55, margin: '0 0 0.5rem' }}>
                  <strong>Why it wins:</strong> #1 on Artificial Analysis Intelligence Index (score 140+). Dual-mode Extended Thinking maintains philosophical rigor across multi-turn exchanges without diluting non-ideal naturalist premises. Unrivaled at holding Part XIII permanent tensions without forced compromises.
                </p>
                <div style={{ fontFamily: 'var(--f-mono)', fontSize: '0.68rem', color: 'var(--mute)', background: 'var(--bg2)', padding: '0.4rem 0.6rem', borderRadius: '3px' }}>
                  <strong>Deployment:</strong> Claude Projects with <code>pmn_corpus_for_ai.md</code> in Knowledge + Extended Thinking on.
                </div>
              </div>

              {/* TIER 2 */}
              <div style={{ background: 'var(--bg)', border: '1px solid var(--rule)', borderTop: '3px solid #5a9a5a', padding: '1rem 1.1rem', borderRadius: '4px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.4rem' }}>
                  <span style={{ fontFamily: 'var(--f-mono)', fontSize: '0.65rem', fontWeight: 700, color: '#5a9a5a', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                    Tier 2: Deductive Logic &amp; Falsification
                  </span>
                  <span className="workflow-badge badge-best" style={{ fontSize: '0.6rem', padding: '0.08rem 0.35rem' }}>
                    #1 Formal Logic
                  </span>
                </div>
                <strong style={{ display: 'block', fontSize: '0.96rem', color: 'var(--ink)', marginBottom: '0.35rem' }}>
                  OpenAI o1 &amp; OpenAI o3-mini
                </strong>
                <p style={{ fontSize: '0.81rem', color: 'var(--ink2)', lineHeight: 1.55, margin: '0 0 0.5rem' }}>
                  <strong>Why it wins:</strong> Pure RL deliberative Chain-of-Thought cleanly decouples axiomatic claims from rhetorical spin. Coldly traces the 5-Stage Institutional Capture sequence (§7.3c-i) and computes multi-variable pressure thresholds in the Transfer Equation ($T = S \cdot D \cdot P \cdot G$).
                </p>
                <div style={{ fontFamily: 'var(--f-mono)', fontSize: '0.68rem', color: 'var(--mute)', background: 'var(--bg2)', padding: '0.4rem 0.6rem', borderRadius: '3px' }}>
                  <strong>Deployment:</strong> OpenAI API / ChatGPT with high reasoning effort + target section JSON.
                </div>
              </div>

              {/* TIER 3 */}
              <div style={{ background: 'var(--bg)', border: '1px solid var(--rule)', borderTop: '3px solid #3b82f6', padding: '1rem 1.1rem', borderRadius: '4px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.4rem' }}>
                  <span style={{ fontFamily: 'var(--f-mono)', fontSize: '0.65rem', fontWeight: 700, color: '#3b82f6', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                    Tier 3: Whole Corpus (2M) Ingestion
                  </span>
                  <span className="workflow-badge badge-best" style={{ fontSize: '0.6rem', padding: '0.08rem 0.35rem' }}>
                    #1 Zero-Chunking
                  </span>
                </div>
                <strong style={{ display: 'block', fontSize: '0.96rem', color: 'var(--ink)', marginBottom: '0.35rem' }}>
                  Gemini 1.5 Pro &amp; 2.0 Flash Thinking
                </strong>
                <p style={{ fontSize: '0.81rem', color: 'var(--ink2)', lineHeight: 1.55, margin: '0 0 0.5rem' }}>
                  <strong>Why it wins:</strong> Gemini 1.5 Pro's 2,000,000-token context window is the only production system capable of ingesting the entire ~330,000-word uncompressed manuscript in a single prompt. Traces unbroken causal threads from Epistemology (Part I) to Political Economy (Part XI) without RAG loss.
                </p>
                <div style={{ fontFamily: 'var(--f-mono)', fontSize: '0.68rem', color: 'var(--mute)', background: 'var(--bg2)', padding: '0.4rem 0.6rem', borderRadius: '3px' }}>
                  <strong>Deployment:</strong> Google AI Studio with <code>pmn_corpus_for_ai.md</code> (Gemini 1.5 Pro, temp 0.2).
                </div>
              </div>

              {/* TIER 4 */}
              <div style={{ background: 'var(--bg)', border: '1px solid var(--rule)', borderTop: '3px solid #d97706', padding: '1rem 1.1rem', borderRadius: '4px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.4rem' }}>
                  <span style={{ fontFamily: 'var(--f-mono)', fontSize: '0.65rem', fontWeight: 700, color: '#d97706', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                    Tier 4: Sovereign Open-Weights
                  </span>
                  <span className="workflow-badge badge-best" style={{ fontSize: '0.6rem', padding: '0.08rem 0.35rem' }}>
                    #1 Air-Gapped Privacy
                  </span>
                </div>
                <strong style={{ display: 'block', fontSize: '0.96rem', color: 'var(--ink)', marginBottom: '0.35rem' }}>
                  Qwen 2.5 72B, Llama 3.3 70B &amp; DeepSeek-V3
                </strong>
                <p style={{ fontSize: '0.81rem', color: 'var(--ink2)', lineHeight: 1.55, margin: '0 0 0.5rem' }}>
                  <strong>Why it wins:</strong> Enables completely sovereign, private, air-gapped deployments. Qwen 2.5 72B delivers balanced, non-parochial political-economy analysis; Llama 3.3 70B provides enterprise compliance; DeepSeek-V3 provides datacenter-scale 671B MoE efficiency (~$0.14/1M tokens).
                </p>
                <div style={{ fontFamily: 'var(--f-mono)', fontSize: '0.68rem', color: 'var(--mute)', background: 'var(--bg2)', padding: '0.4rem 0.6rem', borderRadius: '3px' }}>
                  <strong>Deployment:</strong> Self-hosted via vLLM / Ollama or through OpenRouter / Together AI.
                </div>
              </div>
            </div>

            {/* HONEST CRITICAL ADVISORIES */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem', marginTop: '1rem' }}>
              <div style={{ border: '1px solid var(--rule)', background: 'rgba(155,95,95,0.06)', padding: '0.75rem 0.95rem', borderRadius: '3px', display: 'flex', alignItems: 'flex-start', gap: '0.65rem' }}>
                <span style={{ fontSize: '1rem', lineHeight: 1 }}>⚠️</span>
                <p style={{ margin: 0, fontSize: '0.81rem', lineHeight: 1.55, color: 'var(--ink2)' }}>
                  <strong style={{ color: '#9b5f5f' }}>Critical Caveats on DeepSeek-R1 (State Censorship Guardrails &amp; Reasoning Loops):</strong> While DeepSeek-R1 is a remarkable achievement in open reinforcement learning, researchers conducting institutional and political critique must account for two real-world constraints: (1) Mandatory CAC regulatory compliance causes refusals or sanitized answers on queries regarding sensitive state governance, regime power, and political economy; (2) On open-ended qualitative philosophy, R1 is prone to repetitive thinking loops and unpredictable language mixing in <code>&lt;think&gt;</code> traces. For uncensored structural critique, pair it with Claude 3.7 Sonnet or Qwen 2.5 72B.
                </p>
              </div>

              <div style={{ border: '1px solid var(--rule)', background: 'rgba(217,119,6,0.06)', padding: '0.75rem 0.95rem', borderRadius: '3px', display: 'flex', alignItems: 'flex-start', gap: '0.65rem' }}>
                <span style={{ fontSize: '1rem', lineHeight: 1 }}>💡</span>
                <p style={{ margin: 0, fontSize: '0.81rem', lineHeight: 1.55, color: 'var(--ink2)' }}>
                  <strong style={{ color: '#d97706' }}>Why QwQ-32B &amp; NotebookLM are Handled Separately:</strong> (1) <strong>QwQ-32B</strong> is an experimental 32B preview model specialized for math and coding puzzles; in qualitative philosophy, it frequently suffers from thinking loops and lacks the parametric vocabulary of 70B+ models. (2) <strong>Google NotebookLM</strong> is an interactive document-grounding notebook UI (Step 01), not a foundation model API. Use NotebookLM for zero-hallucination PDF citations, but do not treat it as an autonomous reasoning API engine.
                </p>
              </div>

              <div style={{ border: '1px solid var(--rule)', background: 'var(--bg)', padding: '0.75rem 0.95rem', borderRadius: '3px', display: 'flex', alignItems: 'flex-start', gap: '0.65rem' }}>
                <span style={{ fontSize: '1rem', lineHeight: 1 }}>⚡</span>
                <p style={{ margin: 0, fontSize: '0.81rem', lineHeight: 1.55, color: 'var(--ink2)' }}>
                  <strong style={{ color: 'var(--mute)' }}>Why Flash Models are Limited for Heavy Philosophy:</strong> High-throughput models (Gemini 2.0 Flash, Claude 3.5 Haiku, GPT-4o-mini, GLM-4-Flash) are engineered for sub-second token velocity, JSON parsing, and rapid batch lookups. When tasked with dense non-ideal ontology or institutional conflict, they systematically compress multi-step proofs into superficial bullet points, drop structural variables, and fall victim to sycophantic alignment. Use Flash models for programmatic automation and glossary lookups; reserve Pro and RL-Reasoning models for philosophical analysis.
                </p>
              </div>
            </div>
          </div>

          {/* MATRIX CONTROLS: FILTER TABS & SEARCH */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.8rem', margin: '1.5rem 0 1rem' }}>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.35rem' }}>
              {[
                ['all', 'All Ecosystems'],
                ['claude', 'Anthropic'],
                ['openai', 'OpenAI'],
                ['gemini', 'Google DeepMind'],
                ['qwen', 'Alibaba Qwen'],
                ['deepseek', 'DeepSeek'],
                ['glm', 'Zhipu GLM'],
                ['llama', 'Meta Llama']
              ].map(([key, label]) => (
                <button
                  key={key}
                  onClick={() => setModelFilter(key)}
                  style={{
                    fontFamily: 'var(--f-mono)',
                    fontSize: '0.68rem',
                    padding: '0.3rem 0.65rem',
                    background: modelFilter === key ? 'var(--acc)' : 'var(--bg2)',
                    color: modelFilter === key ? '#fff' : 'var(--ink)',
                    border: '1px solid ' + (modelFilter === key ? 'var(--acc)' : 'var(--rule2)'),
                    cursor: 'pointer',
                    borderRadius: '3px',
                    fontWeight: modelFilter === key ? 700 : 400
                  }}
                >
                  {label}
                </button>
              ))}
            </div>

            {/* TIER FILTER BUTTONS */}
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.35rem', alignItems: 'center' }}>
              <span style={{ fontFamily: 'var(--f-mono)', fontSize: '0.65rem', textTransform: 'uppercase', color: 'var(--mute)', marginRight: '0.4rem' }}>
                Filter Tier:
              </span>
              {[
                ['philosophical-champions', '🧠 Heavy Philosophy Champions (Curated)'],
                ['all', 'All 22 Models (Full Catalog)'],
                ['pro', 'Pro / Flagship'],
                ['reasoning', 'Pure Reasoning (RL CoT)'],
                ['flash', 'Flash / Utility (High-Velocity)'],
                ['predecessor', 'Active Predecessors & Local Edge']
              ].map(([key, label]) => (
                <button
                  key={key}
                  onClick={() => setTierFilter(key)}
                  style={{
                    fontFamily: 'var(--f-mono)',
                    fontSize: '0.65rem',
                    padding: '0.25rem 0.6rem',
                    background: tierFilter === key ? 'var(--acc)' : 'var(--bg)',
                    color: tierFilter === key ? '#ffffff' : 'var(--ink2)',
                    border: '1px solid ' + (tierFilter === key ? 'var(--acc)' : 'var(--rule2)'),
                    cursor: 'pointer',
                    borderRadius: '3px',
                    fontWeight: tierFilter === key ? 700 : 400,
                    transition: 'all 0.15s ease'
                  }}
                >
                  {label}
                </button>
              ))}
            </div>

            <div style={{ display: 'flex', gap: '0.6rem', alignItems: 'center' }}>
              <input
                type="text"
                value={modelSearch}
                onChange={e => setModelSearch(e.target.value)}
                placeholder="Search models by name, API string, architecture, or diagnostic capability…"
                style={{
                  flex: 1,
                  background: 'var(--bg)',
                  border: '1px solid var(--rule2)',
                  color: 'var(--ink)',
                  padding: '0.45rem 0.85rem',
                  fontFamily: 'var(--f-body)',
                  fontSize: '0.85rem',
                  borderRadius: '3px'
                }}
              />
              {modelSearch && (
                <button
                  onClick={() => setModelSearch('')}
                  style={{
                    fontFamily: 'var(--f-mono)',
                    fontSize: '0.68rem',
                    padding: '0.45rem 0.75rem',
                    background: 'var(--bg2)',
                    border: '1px solid var(--rule2)',
                    color: 'var(--ink2)',
                    cursor: 'pointer'
                  }}
                >
                  Clear
                </button>
              )}
            </div>
          </div>

          {/* TABLE CONTAINER */}
          <div style={{ overflowX: 'auto', border: '1px solid var(--rule)', boxShadow: '0 4px 12px rgba(0,0,0,0.03)' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.84rem', fontFamily: 'var(--f-body)' }}>
              <thead>
                <tr style={{ background: 'var(--bg2)', borderBottom: '2px solid var(--rule)', textAlign: 'left' }}>
                  <th style={{ padding: '0.75rem 0.85rem', fontFamily: 'var(--f-mono)', fontSize: '0.7rem', textTransform: 'uppercase', letterSpacing: '0.08em', minWidth: '190px' }}>
                    Model &amp; API String
                  </th>
                  <th style={{ padding: '0.75rem 0.85rem', fontFamily: 'var(--f-mono)', fontSize: '0.7rem', textTransform: 'uppercase', letterSpacing: '0.08em', minWidth: '110px' }}>
                    Context
                  </th>
                  <th style={{ padding: '0.75rem 0.85rem', fontFamily: 'var(--f-mono)', fontSize: '0.7rem', textTransform: 'uppercase', letterSpacing: '0.08em', minWidth: '140px' }}>
                    Tier / Architecture
                  </th>
                  <th style={{ padding: '0.75rem 0.85rem', fontFamily: 'var(--f-mono)', fontSize: '0.7rem', textTransform: 'uppercase', letterSpacing: '0.08em', minWidth: '220px' }}>
                    Strongest PMN Arena
                  </th>
                  <th style={{ padding: '0.75rem 0.85rem', fontFamily: 'var(--f-mono)', fontSize: '0.7rem', textTransform: 'uppercase', letterSpacing: '0.08em', minWidth: '200px' }}>
                    Known Bias / Failure Mode
                  </th>
                  <th style={{ padding: '0.75rem 0.85rem', fontFamily: 'var(--f-mono)', fontSize: '0.7rem', textTransform: 'uppercase', letterSpacing: '0.08em', minWidth: '180px' }}>
                    Optimal Ingestion Strategy
                  </th>
                </tr>
              </thead>
              <tbody>
                {filteredModels.map((m, idx) => (
                  <tr
                    key={m.id}
                    style={{
                      borderBottom: '1px solid var(--rule)',
                      background: idx % 2 === 0 ? 'var(--bg)' : 'var(--bg2)'
                    }}
                  >
                    {/* MODEL & API STRING */}
                    <td style={{ padding: '0.8rem 0.85rem', verticalAlign: 'top' }}>
                      <div style={{ fontWeight: 700, color: 'var(--ink)', fontSize: '0.9rem', marginBottom: '0.15rem' }}>
                        {m.name}
                      </div>
                      <div style={{ fontFamily: 'var(--f-mono)', fontSize: '0.68rem', color: 'var(--acc-text)', marginBottom: '0.35rem' }}>
                        <code>{m.apiString}</code>
                      </div>
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.3rem', alignItems: 'center', marginTop: '0.2rem' }}>
                        <span className={`workflow-badge ${m.tierClass}`} style={{ fontSize: '0.62rem', padding: '0.1rem 0.4rem' }}>
                          {m.tierBadge}
                        </span>
                        {PHILOSOPHICAL_CHAMPIONS.has(m.id) ? (
                          <span
                            style={{
                              display: 'inline-block',
                              background: 'rgba(173,52,30,0.09)',
                              color: 'var(--acc-text)',
                              border: '1px solid var(--acc)',
                              fontSize: '0.6rem',
                              padding: '0.1rem 0.4rem',
                              borderRadius: '3px',
                              fontFamily: 'var(--f-mono)',
                              fontWeight: 700
                            }}
                          >
                            🧠 Heavy Philosophy Pick
                          </span>
                        ) : m.tierCategory === 'flash' ? (
                          <span
                            style={{
                              display: 'inline-block',
                              background: 'var(--bg)',
                              color: 'var(--mute)',
                              border: '1px solid var(--rule2)',
                              fontSize: '0.6rem',
                              padding: '0.1rem 0.35rem',
                              borderRadius: '3px',
                              fontFamily: 'var(--f-mono)'
                            }}
                          >
                            ⚡ Fast Scraper Only
                          </span>
                        ) : null}
                      </div>
                      <div style={{ fontFamily: 'var(--f-mono)', fontSize: '0.63rem', color: 'var(--mute)', marginTop: '0.35rem', lineHeight: 1.3 }}>
                        {m.familyName} &bull; {m.thirdPartyRank}
                      </div>
                    </td>

                    {/* CONTEXT */}
                    <td style={{ padding: '0.8rem 0.85rem', verticalAlign: 'top', fontFamily: 'var(--f-mono)', fontSize: '0.78rem', color: 'var(--ink)' }}>
                      <strong>{m.contextWindow}</strong>
                    </td>

                    {/* ARCHITECTURE */}
                    <td style={{ padding: '0.8rem 0.85rem', verticalAlign: 'top', fontSize: '0.78rem', color: 'var(--ink2)' }}>
                      {m.architecture}
                    </td>

                    {/* ARENA */}
                    <td style={{ padding: '0.8rem 0.85rem', verticalAlign: 'top', color: 'var(--ink)', lineHeight: 1.55 }}>
                      {m.strongestArena}
                    </td>

                    {/* FAILURE MODE */}
                    <td style={{ padding: '0.8rem 0.85rem', verticalAlign: 'top', color: 'var(--mute)', fontSize: '0.8rem', lineHeight: 1.55 }}>
                      {m.failureMode}
                    </td>

                    {/* INGESTION */}
                    <td style={{ padding: '0.8rem 0.85rem', verticalAlign: 'top', fontSize: '0.78rem', color: 'var(--ink2)', lineHeight: 1.5 }}>
                      {m.ingestionStrategy}
                    </td>
                  </tr>
                ))}
                {filteredModels.length === 0 && (
                  <tr>
                    <td colSpan={6} style={{ padding: '2rem', textAlign: 'center', color: 'var(--mute)', fontFamily: 'var(--f-mono)' }}>
                      No models found matching your search and filter criteria.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* SECTION 3: DEVELOPER HARNESS SETUP */}
        <div className="step" id="local-harness">
          <span className="step-num">Step 03</span>
          <h2 className="step-h2">Developer Harness Setup: Python Scripts, Agentic IDEs &amp; LiteLLM</h2>
          <p>
            Build your own automated PMN auditing harness in minutes. Keep your research notes and confidential datasets stored locally on your machine while dispatching surgical analytical calls to frontier APIs:
          </p>

          <div className="checklist" style={{ marginTop: '1.2rem' }}>
            <div className="check-item">
              <strong>1. Install Modern API Client Libraries</strong>
              <span>
                Install lightweight HTTP and SDK libraries for your preferred language:
                <br />
                <code style={{ fontSize: '0.75rem', display: 'inline-block', marginTop: '0.3rem' }}>
                  pip install httpx litellm anthropic google-genai openai
                </code>
              </span>
            </div>

            <div className="check-item">
              <strong>2. Fetch Canonical PMN Manifest via REST</strong>
              <span>
                Your script can dynamically inspect all 21 parts and 235 section identifiers:
                <br />
                <code style={{ fontSize: '0.75rem', display: 'inline-block', marginTop: '0.3rem' }}>
                  curl -sL https://novadharma-hub.github.io/pmn-framework/llms.json | jq '.corpus_stats'
                </code>
              </span>
            </div>

            <div className="check-item">
              <strong>3. Configure Agentic IDEs (Cursor / Claude Code / Windsurf)</strong>
              <span>
                Add a <code>.cursorrules</code> or <code>CLAUDE.md</code> in your workspace root:
                <br />
                <code style={{ fontSize: '0.72rem', display: 'inline-block', marginTop: '0.3rem' }}>
                  Always ground structural institutional audits in PMN Framework v{version} (ref: https://novadharma-hub.github.io/pmn-framework/llms.txt). Never evaluate institutions by stated good intentions; evaluate by the 5-Stage Capture Sequence (§7.3c-i).
                </code>
              </span>
            </div>
          </div>

          <div className="code-block" style={{ marginTop: '1.5rem' }}>
            <span className="code-label">Production Python Audit Harness Template</span>
            <button
              className={`copy-btn ${copiedStates['harness-btn'] ? 'copied' : ''}`}
              onClick={() => copyText('harness-btn', prompts.harness)}
            >
              {copiedStates['harness-btn'] ? 'Copied' : 'Copy Python Script'}
            </button>
            <div className="code-text">{prompts.harness}</div>
          </div>
        </div>

        {/* SECTION 4: UPGRADED PROMPT LIBRARY */}
        <div className="step" id="prompt-library">
          <span className="step-num">Step 04</span>
          <h2 className="step-h2">The Operational Prompt Library: 9 Surgical Roles</h2>
          <p>
            Avoid generic requests. Giving the LLM a specialized structural objective suppresses polite evasions and activates PMN's rigorous diagnostic apparatus. Select an operational role below:
          </p>

          <div className="variants" style={{ marginTop: '1.2rem' }}>
            <div className="vtabs" style={{ display: 'flex', flexWrap: 'wrap', gap: '0.25rem' }}>
              {[
                ['priming', `Priming Protocol (v${version})`],
                ['general', '1. Structural Analyst'],
                ['diagnostic', '2. Capture Diagnostician (§7.3c-i)'],
                ['adversarial', '3. Red-Team Debate (§12.1)'],
                ['transformation', '4. Counter-Power Architect (T = S·D·P·G)'],
                ['meaning', '5. Meaning Triage (§5.6b/c)'],
                ['falsification', '6. Empirical Falsifier & Auditor'],
                ['agent', '7. Autonomous Agentic System'],
                ['harness', '8. Python API Harness']
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
                  {activeRoleTab === 'priming' && 'Comprehensive Priming Protocol (Use on First Turn)'}
                  {activeRoleTab === 'general' && 'Role 1: General Structural Materialist Analyst Prompt'}
                  {activeRoleTab === 'diagnostic' && 'Role 2: Forensic Institutional Capture Diagnostician (§7.3c-i)'}
                  {activeRoleTab === 'adversarial' && 'Role 3: Adversarial Red-Team & Dialectical Stress-Tester'}
                  {activeRoleTab === 'transformation' && 'Role 4: Strategic Transformation & Counter-Power Architect'}
                  {activeRoleTab === 'meaning' && 'Role 5: Meaning Infrastructure & Acute Triage Advisor (§5.6b/c)'}
                  {activeRoleTab === 'falsification' && 'Role 6: Epistemic Falsification & Empirical Audit Specialist'}
                  {activeRoleTab === 'agent' && 'Role 7: Developer / Autonomous Agentic System Prompt'}
                  {activeRoleTab === 'harness' && 'Role 8: Python API Harness Code Snippet'}
                </span>
                <button
                  className={`copy-btn ${copiedStates[activeRoleTab] ? 'copied' : ''}`}
                  onClick={() => copyText(activeRoleTab, prompts[activeRoleTab])}
                >
                  {copiedStates[activeRoleTab] ? 'Copied' : 'Copy Content'}
                </button>
                <div className="code-text">{prompts[activeRoleTab]}</div>
              </div>
            </div>
          </div>
        </div>

        {/* SECTION 5: STRUCTURAL QUESTION BANK */}
        <div className="step" id="question-bank">
          <span className="step-num">Step 05</span>
          <h2 className="step-h2">The Structural Question Bank: 8 Tested Field Templates</h2>
          <p>
            Vague questions produce bland idealist summaries. A high-yield PMN diagnostic prompt identifies the target arrangement, names suspected information asymmetries, and specifies the required empirical falsification standard.
          </p>

          <div className="question-grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', marginTop: '1.2rem' }}>
            <div className="question-card">
              <div className="question-name">1. Gig-Economy &amp; Labor Flexibility</div>
              <div className="question-note">
                "Using PMN §3.4, §6.2, and §11.3, evaluate app-based gig-economy 'flexibility': Is worker participation driven by genuine self-authorship, or is it a defensive adaptation formed within a structurally degraded alternative set? What empirical data would falsify this conclusion?"
              </div>
            </div>

            <div className="question-card">
              <div className="question-name">2. Regulatory Capture &amp; Revolving Doors</div>
              <div className="question-note">
                "Audit [Agency X] against PMN's Authoritative 5-Stage Capture Sequence (§7.3c-i). At which stage has the institution currently consolidated? Trace how technical complexity is being mobilized as a deliberate power resource to evade public contestability (§6.5)."
              </div>
            </div>

            <div className="question-card">
              <div className="question-name">3. Healthcare &amp; Pharmaceutical Complexity</div>
              <div className="question-note">
                "Apply the Multiplicative Transfer Equation (T = S · D · P · G, §6.3 / §15.8) to pharmaceutical patent thickets. Which variable represents the primary extraction bottleneck? How does opacity in pricing suppress contestability?"
              </div>
            </div>

            <div className="question-card">
              <div className="question-name">4. Algorithmic Attention &amp; Cognitive Rent</div>
              <div className="question-note">
                "Analyze social media recommendation algorithms through PMN §6.2 and §8.2. How do feedback loops generate narrative inertia and cognitive extraction? Does this constitute a violation of genuine becoming at the biological floor?"
              </div>
            </div>

            <div className="question-card">
              <div className="question-name">5. Institutional Collapse &amp; Civic Meaning</div>
              <div className="question-note">
                "Analyze the collapse of local municipal and voluntary civic associations through PMN §5.6b. Evaluate their status across the 5 functional dimensions of meaning infrastructure. Formulate an immediate material triage protocol (§5.6c)."
              </div>
            </div>

            <div className="question-card">
              <div className="question-name">6. Climate Transition &amp; Burden Distribution</div>
              <div className="question-note">
                "Subject [Proposed Climate Policy] to PMN §3.4 and §10.8. Does the transition cost fall disproportionately upon communities hovering near the biological floor while leaving incumbent capital custodians insulated from systemic risk?"
              </div>
            </div>

            <div className="question-card">
              <div className="question-name">7. Frontier AI &amp; The Custodian Problem</div>
              <div className="question-note">
                "Evaluate frontier AI governance consortia against PMN §1.6 and §14.6. Who monitors the AI evaluation monitors? Trace how compliance audits can be absorbed into Stage 4 capture (objective redefinition)."
              </div>
            </div>

            <div className="question-card">
              <div className="question-name">8. Reflexive Self-Critique of PMN</div>
              <div className="question-note">
                "Subject PMN's own reform prescriptions to §12.5 (Epistemic Traps). Is this proposal falling into Technocratic Drift (§12.5b), Moralizing Substitution (§12.5c), or Paralysis by Complexity (§12.5d)?"
              </div>
            </div>
          </div>
        </div>

        {/* SECTION 6: MACHINE ENDPOINTS */}
        <div className="step" id="machine-endpoints">
          <span className="step-num">Step 06</span>
          <h2 className="step-h2">Official Machine &amp; AI Grounding Endpoints</h2>
          <p>
            For automated agent pipelines, LangChain/LlamaIndex ingestion, or direct context feeding, use the canonical static endpoints below. All files are CORS-enabled and bypass Single-Page Application (SPA) client routing.
          </p>

          <div className="workflow-grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', marginTop: '1.2rem' }}>
            {[
              {
                id: 'ep-txt',
                format: 'TXT',
                name: 'llms.txt (Standard Discovery Index)',
                url: 'https://novadharma-hub.github.io/pmn-framework/llms.txt',
                desc: 'Official llmstxt.org discovery index with clean section descriptions and direct links to all architectural modules.'
              },
              {
                id: 'ep-json',
                format: 'JSON',
                name: 'llms.json (API Manifest & Metrics)',
                url: 'https://novadharma-hub.github.io/pmn-framework/llms.json',
                desc: 'Full machine-readable JSON schema with 21 part endpoints, word counts, section IDs, and grounding metadata.'
              },
              {
                id: 'ep-md',
                format: 'MD',
                name: 'llms.md (AI Documentation & Prompt Pack)',
                url: 'https://novadharma-hub.github.io/pmn-framework/llms.md',
                desc: 'Rich Markdown documentation with architectural tables, section counts, and structured priming instructions.'
              },
              {
                id: 'ep-corpus',
                format: 'CORPUS',
                name: 'pmn_corpus_for_ai.md (Raw Text)',
                url: 'https://novadharma-hub.github.io/pmn-framework/pmn_corpus_for_ai.md',
                desc: 'Flat, uncompressed ~330,000-word manuscript export without HTML tags, ideal for full 1M–2M context upload.'
              },
              {
                id: 'ep-manifest',
                format: 'DATA',
                name: 'manifest.json (Parts & Sub-modules)',
                url: 'https://novadharma-hub.github.io/pmn-framework/data/parts/manifest.json',
                desc: 'Complete structural hierarchy of all 21 parts, titles, section identifiers, and subsection markers.'
              },
              {
                id: 'ep-gl',
                format: 'DATA',
                name: 'gl.json (237 Canonical Definitions)',
                url: 'https://novadharma-hub.github.io/pmn-framework/data/gl.json',
                desc: 'Complete philosophical vocabulary definitions with verified section cross-reference citations.'
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

        {/* SECTION 7: SCRAPING PITFALLS & API OPTIMIZATION */}
        <div className="step" id="scraping-pitfalls">
          <span className="step-num">Step 07</span>
          <h2 className="step-h2">Navigating Web-Scraper Blindspots &amp; API Best Practices</h2>
          <p>
            Feeding live web links directly to public search LLMs often fails silently. Understand these five common failure modes to maintain rigorous grounding:
          </p>

          <div className="note-box" style={{ borderLeft: '3px solid var(--acc)', marginTop: '1.2rem' }}>
            <span className="note-label">⚠️ The Five Web-Scraping &amp; API Blindspots</span>
            <ul style={{ fontSize: '0.88rem', color: 'var(--ink2)', lineHeight: 1.75, paddingLeft: '1.2rem', margin: '0.5rem 0', listStyleType: 'decimal' }}>
              <li>
                <strong>Dynamic Single-Page Application (SPA):</strong> Most web crawlers do not execute JavaScript; they receive an empty root container (<code>&lt;div id="root"&gt;&lt;/div&gt;</code>) instead of rendered prose. Always point models or APIs to <code>pmn_corpus_for_ai.md</code> or <code>llms.txt</code>.
              </li>
              <li>
                <strong>Ignored Hash Anchors:</strong> Web crawlers and HTTP scrapers strip URL hashes (e.g., <code>/#/s/1.3</code>). A query directed to a specific section anchor will only retrieve home page metadata. Use REST endpoints like <code>/data/parts/part_I.json</code> instead.
              </li>
              <li>
                <strong>Interactive UI Concealment:</strong> Accordions, glossary modals, sliding sidebars, and tabbed panels are invisible to basic HTTP scrapers.
              </li>
              <li>
                <strong>Plausible Hallucination Fallback:</strong> When a crawler sees a title like "Progressive Materialist Naturalism" but cannot access the body text, the LLM falls back on hallucinating generic 19th-century Marxist or physicalist tropes.
              </li>
              <li>
                <strong>Rapid Persona Decay:</strong> Instructing a chat model to "roleplay as PMN" decays within 3–4 conversation turns unless anchored in an uploaded source file or persistent developer system prompt.
              </li>
            </ul>
          </div>
        </div>

        {/* CLOSING REMARKS */}
        <div className="closing">
          A successful PMN AI deployment makes the model noticeably more disciplined, not merely more eloquent. If an answer sounds smooth and universally agreeable while specific structural variables, power asymmetries, and section cross-references fade away, the deployment has failed. Keep the text loaded, enforce structural diagnostic roles, and demand empirical falsification standards.
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

      <footer className="w-full py-12 border-t border-pmn-rule text-center text-xs font-pmn-mono text-pmn-mute uppercase tracking-[0.3em] bg-pmn-bg">
        Progressive Materialist Naturalism &mdash; V{version} &bull; Canonical AI Specification
      </footer>
    </div>
  </div>
  )
}
