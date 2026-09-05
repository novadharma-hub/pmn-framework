import React, { useState, useMemo } from 'react'

interface GuideViewProps {
  onBackHome: () => void
  version: string
}

interface ModelSpec {
  id: string
  name: string
  apiString: string
  family: 'gemini' | 'claude' | 'deepseek' | 'openai' | 'qwen' | 'glm'
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

export default function GuideView({ onBackHome, version }: GuideViewProps) {
  const [activeDeployTab, setActiveDeployTab] = useState<'web' | 'api'>('web')
  const [modelFilter, setModelFilter] = useState<string>('all')
  const [tierFilter, setTierFilter] = useState<string>('all')
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

  // 2026 FRONTIER & ACTIVE PREDECESSOR MODEL MATRIX (PRO, FLASH, REASONING TIERS)
  const MODELS: ModelSpec[] = [
    // GOOGLE DEEPMIND (GEMINI)
    {
      id: 'gemini-31-pro',
      name: 'Gemini 3.1 Pro',
      apiString: 'gemini-3.1-pro',
      family: 'gemini',
      familyName: 'Google DeepMind',
      tierBadge: 'Frontier Pro Flagship',
      tierClass: 'badge-best',
      tierCategory: 'pro',
      contextWindow: '2,000,000 tokens',
      architecture: 'Multimodal Deep Reasoning Pro (2M Context)',
      strongestArena: 'Whole-corpus simultaneous ingestion (~330k words); exhaustive causal tracing across Part I through XVII without chunking.',
      failureMode: 'Tendency to rhetorically soften harsh materialist findings into consensus platitudes unless bound to non-ideal directives.',
      ingestionStrategy: 'Upload flat pmn_corpus_for_ai.md via Google AI Studio or Gemini API with low temperature.',
      thirdPartyRank: 'Top-3 Global Frontier Arena (MMLU-Pro 92.4%, Deep Scientific Reasoning leader)'
    },
    {
      id: 'gemini-38-flash',
      name: 'Gemini 3.8 Flash',
      apiString: 'gemini-3.8-flash',
      family: 'gemini',
      familyName: 'Google DeepMind',
      tierBadge: 'High-Velocity Flash (Sept 2026)',
      tierClass: 'badge-good',
      tierCategory: 'flash',
      contextWindow: '1,000,000 tokens',
      architecture: 'High-Throughput Flash MoE with Agentic Core',
      strongestArena: 'High-velocity cross-referencing, multi-document batch audits, section lookup, and automated developer CLI loops.',
      failureMode: 'Can compress multi-step capture proofs into brief summaries if max output token caps are not specified.',
      ingestionStrategy: 'Call via Google Gemini API with system instructions referencing llms.json endpoints.',
      thirdPartyRank: 'Fastest 1M-token throughput model globally (sub-second TTFT)'
    },
    {
      id: 'gemini-37-flash',
      name: 'Gemini 3.7 Flash',
      apiString: 'gemini-3.7-flash',
      family: 'gemini',
      familyName: 'Google DeepMind',
      tierBadge: 'Agentic Flash',
      tierClass: 'badge-good',
      tierCategory: 'flash',
      contextWindow: '1,000,000 tokens',
      architecture: 'Agentic Multimodal Flash',
      strongestArena: 'Automated tool-calling against PMN JSON endpoints and live pipeline extraction.',
      failureMode: 'Focuses heavily on code execution syntax; requires explicit prompting to sustain philosophical rigor.',
      ingestionStrategy: 'Function calling / LangChain structured output tools.',
      thirdPartyRank: 'Leading cost-efficiency score in agentic benchmarks'
    },
    {
      id: 'gemini-25-pro',
      name: 'Gemini 2.5 Pro (Active)',
      apiString: 'gemini-2.5-pro',
      family: 'gemini',
      familyName: 'Google DeepMind',
      tierBadge: 'Stable Enterprise Pro',
      tierClass: 'badge-good',
      tierCategory: 'predecessor',
      contextWindow: '2,000,000 tokens',
      architecture: 'Established 2M Enterprise Foundation',
      strongestArena: 'Proven enterprise fallback for deep cross-sectional research across large corpora.',
      failureMode: 'Slightly higher latency and cost per token than Gemini 3.8 Flash.',
      ingestionStrategy: 'Google AI Studio or Vertex AI batch API.',
      thirdPartyRank: 'Long-standing enterprise baseline for multi-million token context'
    },
    {
      id: 'gemini-25-flash',
      name: 'Gemini 2.5 Flash (Active)',
      apiString: 'gemini-2.5-flash',
      family: 'gemini',
      familyName: 'Google DeepMind',
      tierBadge: 'Legacy Flash Workhorse',
      tierClass: 'badge-good',
      tierCategory: 'predecessor',
      contextWindow: '1,000,000 tokens',
      architecture: 'Ultra-low cost high-volume Flash',
      strongestArena: 'High-volume batch scraping and semantic classification of glossary entries.',
      failureMode: 'Lower depth on subtle metaphysical edge cases compared to 3.1 Pro.',
      ingestionStrategy: 'High-concurrency API calls with chunked prompts.',
      thirdPartyRank: 'Top budget workhorse for high-frequency API automation'
    },
    {
      id: 'gemini-notebooklm',
      name: 'Google NotebookLM',
      apiString: 'notebooklm-grounding',
      family: 'gemini',
      familyName: 'Google DeepMind',
      tierBadge: 'Zero-Hallucination Grounding',
      tierClass: 'badge-best',
      tierCategory: 'pro',
      contextWindow: 'Full PDF (~660 pgs)',
      architecture: 'Document Grounding & Audio Synthesis Engine',
      strongestArena: 'Absolute zero-hallucination document retrieval, clickable inline page citations, and Audio Overview podcasts.',
      failureMode: 'Cannot run autonomous API loops or multi-turn adversarial persona simulation.',
      ingestionStrategy: 'Upload official typeset PMN_Framework_v118.6.pdf directly as a notebook source.',
      thirdPartyRank: 'Gold standard for zero-hallucination scholarly PDF citation'
    },

    // ANTHROPIC (CLAUDE)
    {
      id: 'claude-fable-51',
      name: 'Claude Fable 5.1',
      apiString: 'claude-fable-5-1',
      family: 'claude',
      familyName: 'Anthropic',
      tierBadge: 'Frontier Flagship (Sept 2026)',
      tierClass: 'badge-best',
      tierCategory: 'pro',
      contextWindow: '1,000,000 tokens',
      architecture: 'Adaptive Thinking Frontier Flagship',
      strongestArena: 'Sustaining unresolved permanent tensions (Part XIII), deep dialectics, and assumption archaeology (§12.1) without persona decay.',
      failureMode: 'Very thorough and introspective; set max output tokens if brief answers are required.',
      ingestionStrategy: 'Claude Projects with pmn_corpus_for_ai.md and adaptive thinking enabled.',
      thirdPartyRank: '#1 Global Qualitative Reasoning, Ethics & Red-Teaming'
    },
    {
      id: 'claude-sonnet-5',
      name: 'Claude Sonnet 5',
      apiString: 'claude-sonnet-5',
      family: 'claude',
      familyName: 'Anthropic',
      tierBadge: 'Standard Workhorse',
      tierClass: 'badge-best',
      tierCategory: 'pro',
      contextWindow: '1,000,000 tokens',
      architecture: '1M Adaptive Reasoning Standard ($2/$10 permanent)',
      strongestArena: 'Daily structural analysis, rigorous prose audits, institutional capture diagnostics, and developer pairings.',
      failureMode: 'Can occasionally adopt a polite diplomatic framing unless primed with PMN non-ideal directives.',
      ingestionStrategy: 'Claude API or Claude Projects with system prompt injection.',
      thirdPartyRank: 'Industry benchmark for price-to-intelligence frontier ratio'
    },
    {
      id: 'claude-opus-5',
      name: 'Claude Opus 5',
      apiString: 'claude-opus-5',
      family: 'claude',
      familyName: 'Anthropic',
      tierBadge: 'Heavy Enterprise',
      tierClass: 'badge-good',
      tierCategory: 'pro',
      contextWindow: '1,000,000 tokens',
      architecture: 'Massive Enterprise Architecture Engine',
      strongestArena: 'Enterprise-grade legal and constitutional audits, institutional counter-power architecture, and multi-century historical simulations.',
      failureMode: 'Higher latency and API pricing compared to Sonnet 5.',
      ingestionStrategy: 'Enterprise Claude API with full repository context.',
      thirdPartyRank: 'Top tier in multi-step enterprise reasoning and complex planning'
    },
    {
      id: 'claude-haiku-45',
      name: 'Claude Haiku 4.5',
      apiString: 'claude-haiku-4-5',
      family: 'claude',
      familyName: 'Anthropic',
      tierBadge: 'High Velocity Flash',
      tierClass: 'badge-good',
      tierCategory: 'flash',
      contextWindow: '200,000 tokens',
      architecture: 'Lightweight Fast Dense Model',
      strongestArena: 'Sub-second glossary lookup (gl.json), quick section summarization, and triage classification.',
      failureMode: 'Lacks multi-layer causal depth for intricate capture tracing.',
      ingestionStrategy: 'Prompt injection with targeted section excerpts.',
      thirdPartyRank: 'Leading low-latency model in 200K category'
    },
    {
      id: 'claude-37-sonnet',
      name: 'Claude 3.7 Sonnet (Active)',
      apiString: 'claude-3-7-sonnet-20250219',
      family: 'claude',
      familyName: 'Anthropic',
      tierBadge: 'Hybrid Extended Thinking',
      tierClass: 'badge-good',
      tierCategory: 'predecessor',
      contextWindow: '200,000 tokens',
      architecture: 'Hybrid Standard/Extended Thinking Engine',
      strongestArena: 'Highly disciplined reasoning and technical code audits.',
      failureMode: 'Context capped at 200K; cannot hold full 330k-word corpus simultaneously.',
      ingestionStrategy: 'Targeted part Markdown upload or chapter-by-chapter reading.',
      thirdPartyRank: 'Historical benchmark for hybrid reasoning'
    },

    // DEEPSEEK
    {
      id: 'deepseek-v4-pro',
      name: 'DeepSeek-V4-Pro',
      apiString: 'deepseek-v4-pro',
      family: 'deepseek',
      familyName: 'DeepSeek',
      tierBadge: 'Frontier Pro MoE (Aug 2026)',
      tierClass: 'badge-best',
      tierCategory: 'pro',
      contextWindow: '1,000,000 tokens',
      architecture: '1.6T MoE (49B active) + Hybrid Attention & mHC',
      strongestArena: 'Ruthless deconstruction of ideological PR; detection of subtle 5-stage capture (§7.3c-i); high immunity to corporate whitewashing.',
      failureMode: 'Extremely blunt analytical deductions; can discount psychological or cultural legitimacy factors unless guided by Part V (§5.6).',
      ingestionStrategy: 'DeepSeek API with 90% reduced KV-cache; upload full corpus.',
      thirdPartyRank: '#1 Open/Commercial MoE for mathematical & institutional forensics'
    },
    {
      id: 'deepseek-v4-flash',
      name: 'DeepSeek-V4-Flash',
      apiString: 'deepseek-v4-flash',
      family: 'deepseek',
      familyName: 'DeepSeek',
      tierBadge: 'High-Throughput Flash MoE',
      tierClass: 'badge-good',
      tierCategory: 'flash',
      contextWindow: '1,000,000 tokens',
      architecture: '284B MoE (13B active) + mHC (July 2026)',
      strongestArena: 'High-speed institutional screening, large regulatory document scanning, ultra-cost-effective production API pipelines.',
      failureMode: 'Slightly reduced nuance on deep metaphysical edge cases compared to V4-Pro.',
      ingestionStrategy: 'Cloud API or hosted endpoints via Cerebras / Together AI / DeepSeek.',
      thirdPartyRank: 'Most parameter-efficient 1M context MoE in production'
    },
    {
      id: 'deepseek-r1',
      name: 'DeepSeek-R1',
      apiString: 'deepseek-reasoner',
      family: 'deepseek',
      familyName: 'DeepSeek',
      tierBadge: 'Pure RL Reasoning',
      tierClass: 'badge-best',
      tierCategory: 'reasoning',
      contextWindow: '128,000 tokens',
      architecture: 'Reinforcement Learning Extended CoT Specialist',
      strongestArena: 'Assumption archaeology (§12.1), red-teaming institutional claims, and exposing hidden axiomatic contradictions.',
      failureMode: '128K context cannot ingest full manuscript; requires chunked or module-based feeding.',
      ingestionStrategy: 'Feed target part JSON or Condensed Core (§15.15) with reasoning mode enabled.',
      thirdPartyRank: '#1 Open Reasoning Model for pure mathematical & deductive skepticism'
    },
    {
      id: 'deepseek-v3',
      name: 'DeepSeek-V3 (Active)',
      apiString: 'deepseek-chat',
      family: 'deepseek',
      familyName: 'DeepSeek',
      tierBadge: 'General MoE Predecessor',
      tierClass: 'badge-good',
      tierCategory: 'predecessor',
      contextWindow: '128,000 tokens',
      architecture: '671B MoE Foundation',
      strongestArena: 'Everyday structural analysis and general conversational auditing.',
      failureMode: 'Context is limited to 128K tokens compared to V4 1M series.',
      ingestionStrategy: 'Chunked section feeding via API.',
      thirdPartyRank: 'Historical foundation for high-efficiency MoE architectures'
    },

    // OPENAI
    {
      id: 'openai-gpt6-astra',
      name: 'GPT-6 Astra',
      apiString: 'gpt-6-astra',
      family: 'openai',
      familyName: 'OpenAI',
      tierBadge: 'Frontier Flagship (Sept 2026)',
      tierClass: 'badge-best',
      tierCategory: 'pro',
      contextWindow: '1,000,000 tokens',
      architecture: 'Next-Gen Multi-Variable Frontier Flagship',
      strongestArena: 'Complex multi-variable systemic planning, macro-economic counter-power modeling, and interdisciplinary synthesis.',
      failureMode: 'Proprietary safety guardrails can occasionally flag frank discussions of state breakdown or revolutionary counter-power.',
      ingestionStrategy: 'API or Custom GPT in ChatGPT Enterprise with knowledge files.',
      thirdPartyRank: 'Top Frontier Arena contender in multi-agent problem solving'
    },
    {
      id: 'openai-o3-series',
      name: 'OpenAI o3 & o3-pro',
      apiString: 'o3 / o3-pro',
      family: 'openai',
      familyName: 'OpenAI',
      tierBadge: 'Deep Deductive Reasoning',
      tierClass: 'badge-best',
      tierCategory: 'reasoning',
      contextWindow: '200,000 tokens',
      architecture: 'Deep Multi-Step Deliberation Engine',
      strongestArena: 'Formal mathematical evaluation of the Transformation Pressure Formula (T = S · D · P · G) and game-theoretic institutional payoffs.',
      failureMode: 'Can consume high token budgets searching for closed-form mathematical proofs for qualitative ethical dilemmas.',
      ingestionStrategy: 'Targeted equation sections (§6.3, §15.8) with structured parameter ranges.',
      thirdPartyRank: '#1 Standard in formal scientific & algorithmic deduction'
    },
    {
      id: 'openai-gpt56-sol',
      name: 'GPT-5.6 Sol / Terra',
      apiString: 'gpt-5.6-sol',
      family: 'openai',
      familyName: 'OpenAI',
      tierBadge: 'Enterprise Production',
      tierClass: 'badge-good',
      tierCategory: 'pro',
      contextWindow: '256,000 tokens',
      architecture: 'Enterprise General Intelligence Series',
      strongestArena: 'General policy evaluation, Custom GPT creation for institutional staff, and fast conversational QA.',
      failureMode: 'Default persona tends to offer moralizing consensus advice rather than dispassionate structural diagnostics.',
      ingestionStrategy: 'Knowledge base upload in Custom GPT configuration.',
      thirdPartyRank: 'Enterprise benchmark for workflow reliability'
    },
    {
      id: 'openai-o4-mini',
      name: 'OpenAI o4-mini',
      apiString: 'o4-mini',
      family: 'openai',
      familyName: 'OpenAI',
      tierBadge: 'Fast Reasoning Flash',
      tierClass: 'badge-good',
      tierCategory: 'flash',
      contextWindow: '128,000 tokens',
      architecture: 'Lightweight Deliberation Engine',
      strongestArena: 'Fast step-by-step verification of logical consistency across section claims.',
      failureMode: 'Smaller parametric memory on niche historical philosophy citations.',
      ingestionStrategy: 'Direct API streaming with reasoning_effort set to medium.',
      thirdPartyRank: 'Leading low-cost reasoning model for programmatic CI pipelines'
    },

    // ALIBABA CLOUD (QWEN)
    {
      id: 'qwen-38-max',
      name: 'Qwen 3.8-Max',
      apiString: 'qwen-3.8-max-0902',
      family: 'qwen',
      familyName: 'Alibaba Cloud',
      tierBadge: 'Frontier Flagship MoE',
      tierClass: 'badge-best',
      tierCategory: 'pro',
      contextWindow: '1,000,000 tokens',
      architecture: '2.4 Trillion Parameter MoE (Aug/Sept 2026)',
      strongestArena: 'Massive-scale enterprise knowledge ingestion, agentic tool workflows, structural political-economy audits across Asian & Western jurisdictions.',
      failureMode: 'Certain sensitive geopolitical queries can undergo domestic filtering if routed through mainland regional endpoints.',
      ingestionStrategy: 'DashScope API or international endpoints with pmn_corpus_for_ai.md.',
      thirdPartyRank: 'Top-ranked frontier model from APAC region'
    },
    {
      id: 'qwen-38-flash-next',
      name: 'Qwen 3.8-Flash-Next',
      apiString: 'qwen-3.8-flash-next',
      family: 'qwen',
      familyName: 'Alibaba Cloud',
      tierBadge: 'Next-Gen Flash Preview',
      tierClass: 'badge-good',
      tierCategory: 'flash',
      contextWindow: '1,000,000 tokens',
      architecture: 'Multimodal MoE (Qwen 4 Architecture Preview)',
      strongestArena: 'High-speed ingestion of tabular data, cross-examination of economic balance sheets, and fast agent loops.',
      failureMode: 'Experimental snapshot; parameters subject to architectural updates.',
      ingestionStrategy: 'DashScope API / OpenRouter.',
      thirdPartyRank: 'Fastest next-gen multimodal open/commercial preview'
    },
    {
      id: 'qwq-32b',
      name: 'QwQ-32B',
      apiString: 'qwq-32b',
      family: 'qwen',
      familyName: 'Alibaba Cloud',
      tierBadge: 'Open Reasoning Specialist',
      tierClass: 'badge-best',
      tierCategory: 'reasoning',
      contextWindow: '128,000 tokens',
      architecture: '32B Reinforcement Learning Reasoning Model',
      strongestArena: 'Deep step-by-step institutional capture auditing via API or hosted endpoints (Groq / Cerebras / Together AI).',
      failureMode: 'Can loop in thinking steps if prompt does not set explicit termination conditions.',
      ingestionStrategy: 'API call or self-hosted endpoint with reasoning delimiters.',
      thirdPartyRank: '#1 32B-class reasoning model globally'
    },
    {
      id: 'qwen-25-coder-32b',
      name: 'Qwen 2.5-Coder 32B (Active)',
      apiString: 'qwen-2.5-coder-32b-instruct',
      family: 'qwen',
      familyName: 'Alibaba Cloud',
      tierBadge: 'Code & Logic Workhorse',
      tierClass: 'badge-good',
      tierCategory: 'predecessor',
      contextWindow: '128,000 tokens',
      architecture: 'Dense 32B Code & Logic Specialist',
      strongestArena: 'Building automated PMN auditing scripts, parsing llms.json, and executing mathematical formulas.',
      failureMode: 'More focused on procedural correctness than qualitative prose.',
      ingestionStrategy: 'Local agentic IDEs (Cursor, Windsurf, Cline) via API.',
      thirdPartyRank: 'Industry workhorse for agentic coding and analysis'
    },

    // ZHIPU AI / Z.AI (GLM)
    {
      id: 'glm-53-series',
      name: 'GLM-5.3 / GLM-5.3-Flash',
      apiString: 'glm-5.3 / glm-5.3-flash',
      family: 'glm',
      familyName: 'Zhipu AI (Z.ai)',
      tierBadge: 'Frontier Agentic MoE',
      tierClass: 'badge-best',
      tierCategory: 'pro',
      contextWindow: '1,000,000 tokens',
      architecture: 'Slime RL + Native Multimodal MoE (Late August 2026)',
      strongestArena: 'Autonomous multi-tool pipelines, long-horizon institutional tracing, and high-efficiency cost-effective inference.',
      failureMode: 'Relies on English/Chinese bilingual nuances; verify definitions against canonical glossary (gl.json).',
      ingestionStrategy: 'Z.ai International API with direct corpus feeding.',
      thirdPartyRank: 'Top leaderboard performer on Terminal Bench 3.0 & AgentBench'
    },
    {
      id: 'glm-52-agentic',
      name: 'GLM-5.2',
      apiString: 'glm-5.2',
      family: 'glm',
      familyName: 'Zhipu AI (Z.ai)',
      tierBadge: 'Long-Horizon Agent',
      tierClass: 'badge-good',
      tierCategory: 'pro',
      contextWindow: '1,000,000 tokens',
      architecture: 'IndexShare Sparse Attention MoE',
      strongestArena: 'Cost-minimized 1M token audits; tracing bureaucratic networks across multi-part regulatory corpora.',
      failureMode: 'Occasionally generates shorter answers than Claude Fable or GPT-6 Astra unless prompted to elaborate.',
      ingestionStrategy: 'Z.ai API platform with streaming responses.',
      thirdPartyRank: 'Lowest inference cost per 1M context tokens among frontier models'
    },
    {
      id: 'glm-5-base-mit',
      name: 'GLM-5 Base (744B MIT)',
      apiString: 'glm-5-base-mit',
      family: 'glm',
      familyName: 'Zhipu AI (Z.ai)',
      tierBadge: 'Open Sovereign Foundation',
      tierClass: 'badge-good',
      tierCategory: 'predecessor',
      contextWindow: '128,000 tokens',
      architecture: '744B MoE (40B active) under MIT License',
      strongestArena: 'Institutional research clusters requiring permissive MIT licensing with zero vendor lock-in.',
      failureMode: 'Requires multi-node GPU cluster (8x H100 or Ascend 910B) for full unquantized deployment.',
      ingestionStrategy: 'vLLM / SGLang cluster deployment with FP8 quantization.',
      thirdPartyRank: 'Largest fully MIT-licensed open foundation model in existence'
    }
  ]

  const filteredModels = useMemo(() => {
    return MODELS.filter(m => {
      const matchFamily = modelFilter === 'all' || m.family === modelFilter
      const matchTier = tierFilter === 'all' || m.tierCategory === tierFilter
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

# 3. Call Remote API (Example: Anthropic Claude Sonnet 5)
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
            "model": "claude-sonnet-5",
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
        maxWidth: '1040px',
        width: '100%'
      }}
    >
      {/* STICKY HEADER */}
      <div className="sv-hdr-wrap border-b border-pmn-rule bg-pmn-bg sticky top-0 z-20">
        <div className="max-w-[1040px] mx-auto flex items-center justify-between gap-4 px-6 sm:px-8 lg:px-14 py-4">
          <div className="flex items-center gap-3">
            <span className="font-mono text-[0.7rem] uppercase tracking-widest px-2.5 py-1 rounded bg-pmn-acc text-white font-bold">
              AI LAB
            </span>
            <p className="sv-hdr !border-none !p-0 !m-0 font-pmn-head text-[1.35rem] text-pmn-ink font-semibold">
              PMN Agent &amp; Deployment Guide
            </p>
          </div>
          <button
            className="hbtn font-mono text-[0.7rem] uppercase tracking-widest text-pmn-mute hover:text-pmn-ink border border-pmn-rule hover:border-pmn-acc rounded px-3.5 py-2 transition-colors cursor-pointer whitespace-nowrap"
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
                    Upload typeset <code>PMN_Framework_v118.6.pdf</code> (~660 pages) directly as a notebook source. Ingests all 21 parts with zero hallucination, exact inline page references, and multi-speaker Audio Overview generation.
                  </div>
                  <span className="workflow-badge badge-best">Best for Verified Citations</span>
                </div>

                <div className="workflow-card">
                  <div className="workflow-name">Claude Projects (Fable 5.1 / Sonnet 5)</div>
                  <div className="workflow-note">
                    Attach <code>pmn_corpus_for_ai.md</code> into Project Knowledge. Leverage 1M-token context and Adaptive Thinking for deep dialectical reasoning, multi-part synthesis, and assumption archaeology without persona decay.
                  </div>
                  <span className="workflow-badge badge-best">Best for Dialectical Depth</span>
                </div>

                <div className="workflow-card">
                  <div className="workflow-name">Google AI Studio (Gemini 3.1 Pro / 3.8 Flash)</div>
                  <div className="workflow-note">
                    Massive 2M-token context window ingests the entire ~330,000-word uncompressed manuscript in a single prompt. Run simultaneous cross-sectional queries across Part I through XVII with sub-second retrieval.
                  </div>
                  <span className="workflow-badge badge-good">Best for 2M Full Corpus</span>
                </div>

                <div className="workflow-card">
                  <div className="workflow-name">DeepSeek Chat Web (V4-Pro &amp; R1)</div>
                  <div className="workflow-note">
                    DeepSeek-V4-Pro (1.6T MoE, 1M context) and DeepSeek-R1 extended reasoning. Exceptional resistance to establishment propaganda and ruthless execution of the 5-Stage Institutional Capture Sequence (§7.3c-i).
                  </div>
                  <span className="workflow-badge badge-good">Best for Capture Forensics</span>
                </div>

                <div className="workflow-card">
                  <div className="workflow-name">OpenAI ChatGPT (GPT-6 Astra &amp; o3)</div>
                  <div className="workflow-note">
                    Configure a Custom GPT with PMN knowledge files and Code Interpreter. Model the non-linear Transformation Pressure Formula ($T = S \cdot D \cdot P \cdot G$) and simulate power transfer thresholds.
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
                    Unified OpenAI-compatible proxy routing between Gemini 3.8 Flash, DeepSeek-V4-Pro, Claude Sonnet 5, and GPT-6 Astra using a single API key. Automatically falls back if rate limits or outages occur.
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
                    For open-weight models like QwQ-32B, DeepSeek-V4-Flash, or Llama 3.3 70B, utilize cloud LPU/WSE hardware yielding 800+ tokens/second rather than overloading local laptop GPUs.
                  </div>
                  <span className="workflow-badge badge-good">Best for High-Speed Tokens</span>
                </div>
              </div>

              <div className="note-box" style={{ marginTop: '1.2rem' }}>
                <span className="note-label">Why API Harnesses Beat Local GPU Serving</span>
                Frontier models (such as 1.6T DeepSeek-V4-Pro or 2.4T Qwen 3.8-Max) require multi-cluster server infrastructure that consumer hardware cannot run. Local developer harnesses give you the privacy of local file management and custom scripts while leveraging datacenter-scale compute via official API keys.
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
          <div style={{ border: '1px solid var(--rule)', borderLeft: '3px solid var(--acc)', borderRadius: '4px', padding: '1.1rem 1.2rem', margin: '1.2rem 0 1.6rem', background: 'var(--bg2)' }}>
            <p style={{ fontFamily: 'var(--f-mono)', fontSize: '0.68rem', letterSpacing: '0.12em', textTransform: 'uppercase', color: 'var(--acc-text)', fontWeight: 700, margin: '0 0 0.55rem' }}>
              Heavy philosophical reasoning — what to actually pick
            </p>
            <p style={{ margin: '0 0 0.6rem', fontSize: '0.92rem', lineHeight: 1.65 }}>
              The matrix below is a catalog; catalogs do not answer the question you came here with. For PMN work, three demands decide the choice, and benchmark scores decide almost none of them:
            </p>
            <ol style={{ margin: '0 0 0.7rem', paddingLeft: '1.25rem', fontSize: '0.9rem', lineHeight: 1.65 }}>
              <li><strong>Whole-corpus holding.</strong> The manuscript is ~330k words. Models under 1M context must chunk it via the RAG discipline (llms.json), and chunking severs cross-part tracing — §7.3's capture mechanics only bite when Part I is read against Part XV.</li>
              <li><strong>Sycophancy resistance.</strong> A model that agrees with you is worthless here. §12.5 requires applying the same capture diagnostics to your own commitments — if the model flatters your position instead of stress-testing it, it fails the framework's central demand.</li>
              <li><strong>Anchor discipline.</strong> It must cite §-numbers verbatim and say plainly when it is paraphrasing from memory rather than the corpus. Invented anchors are worse than no anchors.</li>
            </ol>
            <p style={{ margin: '0 0 0.45rem', fontSize: '0.9rem', lineHeight: 1.65 }}>
              <strong>Recommendation order for the heavy-reasoning workload</strong> — sustained dialectic, counter-argument generation, falsification pressure (the Part V, VIII, and §12.5 work):
            </p>
            <ol style={{ margin: '0 0 0.7rem', paddingLeft: '1.25rem', fontSize: '0.9rem', lineHeight: 1.75 }}>
              <li><strong>Frontier Pro class with ≥1M context</strong> — Gemini 3.1 Pro (2M), Claude Opus 5, GPT-6 Astra: single-pass whole-corpus grounding without chunking loss.</li>
              <li><strong>Reasoning class</strong> — DeepSeek-R1, OpenAI o3-pro: slower and sometimes context-limited, but built for sustained multi-step deduction; strongest on capture-sequence proofs and §15 formula discipline. Pair with corpus chunking.</li>
              <li><strong>Flash tier — explicitly not for this workload.</strong> Its throughput is for batch audits and section lookup. Flash models compress multi-step proofs into summaries under output caps — their own failure-mode notes below say so.</li>
            </ol>
            <p style={{ margin: 0, fontSize: '0.85rem', lineHeight: 1.6, color: 'var(--ink2)' }}>
              One honesty requirement before you trust any of this: vendor claims in this matrix are unverified by the platform. The honest test is §12.5 applied to the model itself — run the falsification prompts from the Question Bank (Step 06) on your chosen model, and demote it the first time it flatters you instead of answering.
            </p>
          </div>

          {/* MATRIX CONTROLS: FILTER TABS & SEARCH */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.8rem', margin: '1.5rem 0 1rem' }}>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.35rem' }}>
              {[
                ['all', 'All Ecosystems'],
                ['gemini', 'Google DeepMind'],
                ['claude', 'Anthropic'],
                ['deepseek', 'DeepSeek'],
                ['openai', 'OpenAI'],
                ['qwen', 'Alibaba Qwen'],
                ['glm', 'Zhipu GLM']
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
                Tier:
              </span>
              {[
                ['all', 'All Tiers'],
                ['pro', 'Pro / Flagship'],
                ['flash', 'Flash / High-Velocity'],
                ['reasoning', 'Pure Reasoning (CoT)'],
                ['predecessor', 'Active Predecessors']
              ].map(([key, label]) => (
                <button
                  key={key}
                  onClick={() => setTierFilter(key)}
                  style={{
                    fontFamily: 'var(--f-mono)',
                    fontSize: '0.65rem',
                    padding: '0.2rem 0.55rem',
                    background: tierFilter === key ? 'var(--ink)' : 'var(--bg)',
                    color: tierFilter === key ? 'var(--bg)' : 'var(--ink2)',
                    border: '1px solid var(--rule2)',
                    cursor: 'pointer',
                    borderRadius: '3px'
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
                      <span className={`workflow-badge ${m.tierClass}`} style={{ fontSize: '0.62rem', padding: '0.1rem 0.4rem' }}>
                        {m.tierBadge}
                      </span>
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
                  Always ground structural institutional audits in PMN Framework v118.6 (ref: https://novadharma-hub.github.io/pmn-framework/llms.txt). Never evaluate institutions by stated good intentions; evaluate by the 5-Stage Capture Sequence (§7.3c-i).
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
                ['priming', 'Priming Protocol (v118.6)'],
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

      <footer className="py-12 border-t border-pmn-rule text-center text-xs font-pmn-mono text-pmn-mute uppercase tracking-[0.3em] bg-pmn-bg">
        Progressive Materialist Naturalism &mdash; V{version} &bull; Canonical AI Specification
      </footer>
    </div>
  )
}
