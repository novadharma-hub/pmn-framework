import React, { useState, useMemo } from 'react'

interface GuideViewProps {
  onBackHome: () => void
  version: string
}

interface ModelSpec {
  id: string
  name: string
  family: 'gemini' | 'claude' | 'deepseek' | 'openai' | 'qwen' | 'glm' | 'local'
  familyName: string
  tierBadge: string
  tierClass: string
  contextWindow: string
  architecture: string
  strongestArena: string
  failureMode: string
  ingestionStrategy: string
  thirdPartyRank: string
}

export default function GuideView({ onBackHome, version }: GuideViewProps) {
  const [activeDeployTab, setActiveDeployTab] = useState<'cloud' | 'local'>('cloud')
  const [modelFilter, setModelFilter] = useState<string>('all')
  const [modelSearch, setModelSearch] = useState<string>('')
  const [activeRoleTab, setActiveRoleTab] = useState<
    | 'priming'
    | 'general'
    | 'diagnostic'
    | 'adversarial'
    | 'transformation'
    | 'meaning'
    | 'agent'
    | 'modelfile'
    | 'falsification'
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

  // UPGRADED 2026 FRONTIER & SOVEREIGN MODEL MATRIX
  const MODELS: ModelSpec[] = [
    // GOOGLE DEEPMIND (GEMINI)
    {
      id: 'gemini-31-pro',
      name: 'Gemini 3.1 Pro',
      family: 'gemini',
      familyName: 'Google DeepMind',
      tierBadge: 'Frontier Flagship',
      tierClass: 'badge-best',
      contextWindow: '2,000,000 tokens',
      architecture: 'Multimodal Dense/MoE Flagship',
      strongestArena: 'Whole-corpus simultaneous ingestion (~330k words); exhaustive cross-part causal tracing (Part I through XVII) in a single context window.',
      failureMode: 'Tendency to rhetorically over-smooth harsh materialist conclusions into conventional ethical consensus unless pinned to non-ideal directives.',
      ingestionStrategy: 'Upload flat uncompressed pmn_corpus_for_ai.md directly in Google AI Studio or Vertex AI Workbench.',
      thirdPartyRank: 'Top-3 Global Frontier Arena (MMLU-Pro 92.4%, Math/Reasoning leader)'
    },
    {
      id: 'gemini-38-flash',
      name: 'Gemini 3.8 Flash',
      family: 'gemini',
      familyName: 'Google DeepMind',
      tierBadge: 'High-Velocity Workhorse',
      tierClass: 'badge-good',
      contextWindow: '1,000,000 tokens',
      architecture: 'High-Throughput Flash MoE (Sept 2026)',
      strongestArena: 'Rapid cross-referencing, multi-document batch audits, section lookup, and real-time interactive reader pairing.',
      failureMode: 'Can prematurely truncate long step-by-step structural capture proofs if max token limits are not explicitly set.',
      ingestionStrategy: 'Stream queries via Google Gemini API with system instructions pointing to llms.json endpoints.',
      thirdPartyRank: 'Fastest 1M-token throughput model with sub-second TTFT'
    },
    {
      id: 'gemini-37-flash',
      name: 'Gemini 3.7 Flash',
      family: 'gemini',
      familyName: 'Google DeepMind',
      tierBadge: 'Agentic Workhorse',
      tierClass: 'badge-good',
      contextWindow: '1,000,000 tokens',
      architecture: 'Agentic Multimodal Flash',
      strongestArena: 'Tool use, live API calls against PMN JSON endpoints, automated data pipelining, and structured JSON extraction.',
      failureMode: 'Focuses heavily on code/execution syntax; requires explicit prompting to sustain philosophical depth.',
      ingestionStrategy: 'Ingest parts JSON via function calling / LangChain tools.',
      thirdPartyRank: 'Leading cost-efficiency score in agentic benchmarks'
    },
    {
      id: 'gemini-notebooklm',
      name: 'Google NotebookLM',
      family: 'gemini',
      familyName: 'Google DeepMind',
      tierBadge: 'Citation Ground Truth',
      tierClass: 'badge-best',
      contextWindow: 'Full PDF (~660 pages)',
      architecture: 'Document Grounding Engine',
      strongestArena: 'Zero-hallucination ground truth retrieval; exact page-level inline citations; Audio Overview podcast synthesis.',
      failureMode: 'Cannot perform free multi-turn adversarial persona roleplay or dynamic code execution as flexibly as raw LLM chats.',
      ingestionStrategy: 'Upload official typeset PMN_Framework_v118.6.pdf directly as a notebook source.',
      thirdPartyRank: 'Gold standard for zero-hallucination academic citation fidelity'
    },

    // ANTHROPIC (CLAUDE)
    {
      id: 'claude-fable-51',
      name: 'Claude Fable 5.1',
      family: 'claude',
      familyName: 'Anthropic',
      tierBadge: 'Frontier Flagship',
      tierClass: 'badge-best',
      contextWindow: '1,000,000 tokens',
      architecture: 'Adaptive Thinking Flagship (Sept 2026)',
      strongestArena: 'Architectural consistency, sustaining unresolved permanent tensions (Part XIII), long-horizon philosophical dialectics, and institutional critique.',
      failureMode: 'Very thorough and introspective; requires strict token caps if succinct operational summaries are demanded.',
      ingestionStrategy: 'Attach pmn_corpus_for_ai.md into Claude Project Knowledge; enable adaptive thinking budget.',
      thirdPartyRank: '#1 Global Qualitative Reasoning & Policy Red-Teaming'
    },
    {
      id: 'claude-sonnet-5',
      name: 'Claude Sonnet 5',
      family: 'claude',
      familyName: 'Anthropic',
      tierBadge: 'Balanced Standard',
      tierClass: 'badge-best',
      contextWindow: '1,000,000 tokens',
      architecture: '1M Adaptive Reasoning Workhorse',
      strongestArena: 'Everyday structural analysis, rigorous manuscript prose editing, institutional capture forensics, and philosophical debate.',
      failureMode: 'Can occasionally adopt a gentle diplomatic tone when addressing intense normative conflicts unless primed with PMN non-ideal ethics.',
      ingestionStrategy: 'Claude Projects with custom instructions and target chapter Markdown files.',
      thirdPartyRank: 'Best price-to-performance ratio among frontier 1M models'
    },
    {
      id: 'claude-opus-5',
      name: 'Claude Opus 5',
      family: 'claude',
      familyName: 'Anthropic',
      tierBadge: 'Heavy Enterprise',
      tierClass: 'badge-good',
      contextWindow: '1,000,000 tokens',
      architecture: 'Massive Multi-Agent Reasoning Engine',
      strongestArena: 'Enterprise-grade legal and constitutional audits, institutional counter-power architecture, and multi-century historical simulations.',
      failureMode: 'Higher latency and API pricing compared to Sonnet 5.',
      ingestionStrategy: 'Enterprise Claude API with full repository context injection.',
      thirdPartyRank: 'Top tier in multi-step enterprise reasoning and complex planning'
    },
    {
      id: 'claude-haiku-45',
      name: 'Claude Haiku 4.5',
      family: 'claude',
      familyName: 'Anthropic',
      tierBadge: 'High Velocity',
      tierClass: 'badge-good',
      contextWindow: '200,000 tokens',
      architecture: 'Lightweight Dense Model',
      strongestArena: 'Rapid semantic glossary search (gl.json), quick section summarization, and interactive triage.',
      failureMode: 'Lacks the depth needed for multi-layer causal capture tracing.',
      ingestionStrategy: 'Prompt injection with targeted section snippets.',
      thirdPartyRank: 'Top-tier sub-200K low latency tier'
    },

    // DEEPSEEK
    {
      id: 'deepseek-v4-pro',
      name: 'DeepSeek-V4-Pro',
      family: 'deepseek',
      familyName: 'DeepSeek',
      tierBadge: 'Frontier Flagship MoE',
      tierClass: 'badge-best',
      contextWindow: '1,000,000 tokens',
      architecture: '1.6T MoE (49B active) + Hybrid Attention (Aug 2026)',
      strongestArena: 'Forensic deconstruction of ideology; detection of subtle 5-stage capture (§7.3c-i); high immunity to establishment propaganda.',
      failureMode: 'Extremely blunt analytical deductions; can discount psychological or cultural legitimacy factors unless explicitly guided by Part V (§5.6).',
      ingestionStrategy: 'DeepSeek API or chat platform with full corpus uploaded; 90% reduced KV cache via mHC.',
      thirdPartyRank: 'Leading global open/commercial MoE in mathematical & forensic logic'
    },
    {
      id: 'deepseek-v4-flash',
      name: 'DeepSeek-V4-Flash',
      family: 'deepseek',
      familyName: 'DeepSeek',
      tierBadge: 'Efficient MoE',
      tierClass: 'badge-good',
      contextWindow: '1,000,000 tokens',
      architecture: '284B MoE (13B active) + mHC (July 2026)',
      strongestArena: 'High-speed institutional audits, rapid document screening, cost-sensitive production API deployments.',
      failureMode: 'Slightly reduced nuance on deep metaphysical edge cases compared to V4-Pro.',
      ingestionStrategy: 'Single B200 / multi-GPU self-hosting or DeepSeek cloud API.',
      thirdPartyRank: 'Most parameter-efficient 1M context MoE in production'
    },
    {
      id: 'deepseek-r1',
      name: 'DeepSeek-R1',
      family: 'deepseek',
      familyName: 'DeepSeek',
      tierBadge: 'Pure RL Reasoning',
      tierClass: 'badge-best',
      contextWindow: '128,000 tokens',
      architecture: 'Reinforcement Learning CoT Specialist',
      strongestArena: 'Adversarial assumption archaeology (§12.1), red-teaming institutional justifications, and exposing hidden axioms.',
      failureMode: 'Context window (128K) cannot fit the entire 330k-word manuscript at once; requires chunked or module-based feeding.',
      ingestionStrategy: 'Upload target parts or Condensed Core (§15.15) with strict reasoning instructions.',
      thirdPartyRank: '#1 Open Reasoning Model for pure mathematical & deductive skepticism'
    },

    // OPENAI
    {
      id: 'openai-gpt6-astra',
      name: 'GPT-6 Astra',
      family: 'openai',
      familyName: 'OpenAI',
      tierBadge: 'Frontier Flagship',
      tierClass: 'badge-best',
      contextWindow: '1,000,000 tokens',
      architecture: 'Next-Gen Frontier Flagship (Sept 3, 2026)',
      strongestArena: 'Complex multi-variable systemic planning, macro-economic counter-power modeling, and interdisciplinary synthesis.',
      failureMode: 'Proprietary safety filters can occasionally trigger false positives on frank discussions of violent revolution or state breakdown.',
      ingestionStrategy: 'Custom GPT with typeset PDF / Markdown knowledge files in ChatGPT Enterprise.',
      thirdPartyRank: 'Top Frontier Arena contender in multi-agent problem solving'
    },
    {
      id: 'openai-o3-series',
      name: 'OpenAI o3 / o3-pro',
      family: 'openai',
      familyName: 'OpenAI',
      tierBadge: 'Deductive Math / Logic',
      tierClass: 'badge-best',
      contextWindow: '200,000 tokens',
      architecture: 'Deep Multi-Step Reasoning Engine',
      strongestArena: 'Formal mathematical evaluation of the Transformation Pressure Formula (T = S · D · P · G) and game-theoretic institutional payoffs.',
      failureMode: 'Can spend excessive compute budget searching for closed-form mathematical proofs for inherently qualitative moral dilemmas.',
      ingestionStrategy: 'Feed specific equation sections (§6.3, §15.8) with structured parameter ranges.',
      thirdPartyRank: '#1 Standard in formal scientific & algorithmic validation'
    },
    {
      id: 'openai-gpt56-sol',
      name: 'GPT-5.6 Sol / Terra',
      family: 'openai',
      familyName: 'OpenAI',
      tierBadge: 'General Production',
      tierClass: 'badge-good',
      contextWindow: '256,000 tokens',
      architecture: 'Enterprise General Intelligence Series',
      strongestArena: 'General policy evaluation, Custom GPT creation for institutional staff, and fast conversational QA.',
      failureMode: 'Default system persona tends to offer moralizing advice rather than dispassionate structural diagnostics.',
      ingestionStrategy: 'Knowledge base upload in Custom GPT configuration.',
      thirdPartyRank: 'Industry benchmark for enterprise workflow reliability'
    },

    // ALIBABA CLOUD (QWEN)
    {
      id: 'qwen-38-max',
      name: 'Qwen 3.8-Max',
      family: 'qwen',
      familyName: 'Alibaba Cloud',
      tierBadge: 'Frontier Flagship MoE',
      tierClass: 'badge-best',
      contextWindow: '1,000,000 tokens',
      architecture: '2.4 Trillion Parameter MoE (Aug/Sept 2026)',
      strongestArena: 'Massive-scale enterprise knowledge ingestion, agentic tool workflows, structural political-economy audits across Asian & Western jurisdictions.',
      failureMode: 'Certain sensitive geopolitical queries can undergo domestic content filtering if routed through regional endpoints.',
      ingestionStrategy: 'DashScope API or international endpoints with pmn_corpus_for_ai.md.',
      thirdPartyRank: 'Top-ranked open/commercial frontier model from APAC region'
    },
    {
      id: 'qwq-32b',
      name: 'QwQ-32B (Open Weights)',
      family: 'qwen',
      familyName: 'Alibaba Cloud',
      tierBadge: 'Sovereign Open Reasoning',
      tierClass: 'badge-best',
      contextWindow: '128,000 tokens',
      architecture: '32B Pure Reinforcement Learning Reasoning',
      strongestArena: 'Deep step-by-step institutional capture auditing on self-hosted workstation hardware (24GB VRAM). 100% confidential.',
      failureMode: 'Can loop in thinking steps if prompt does not set explicit termination conditions.',
      ingestionStrategy: 'Ollama or vLLM deployment with Modelfile and target parts.',
      thirdPartyRank: '#1 Open-weights reasoning model for consumer-grade GPU deployment'
    },
    {
      id: 'qwen-25-coder-32b',
      name: 'Qwen 2.5-Coder 32B',
      family: 'qwen',
      familyName: 'Alibaba Cloud',
      tierBadge: 'Sovereign Open Weights',
      tierClass: 'badge-good',
      contextWindow: '128,000 tokens',
      architecture: 'Dense 32B Code & Logic Specialist',
      strongestArena: 'Building automated PMN auditing scripts, parsing llms.json, and executing mathematical formulas locally.',
      failureMode: 'More focused on procedural correctness than qualitative philosophical prose.',
      ingestionStrategy: 'Ollama CLI: ollama run qwen2.5-coder:32b',
      thirdPartyRank: 'Industry standard for local offline agentic coding and analysis'
    },

    // ZHIPU AI / Z.AI (GLM)
    {
      id: 'glm-53-series',
      name: 'GLM-5.3 / GLM-5.3-Flash',
      family: 'glm',
      familyName: 'Zhipu AI (Z.ai)',
      tierBadge: 'Frontier Agentic',
      tierClass: 'badge-best',
      contextWindow: '1,000,000 tokens',
      architecture: 'Slime RL + Native Multimodal MoE (Late August 2026)',
      strongestArena: 'Autonomous agentic multi-tool pipelines, long-horizon institutional tracing, and high-efficiency cost-effective inference.',
      failureMode: 'Relies heavily on English/Chinese bilingual nuance; check definitions against canonical glossary (gl.json).',
      ingestionStrategy: 'Z.ai International API platform with direct corpus feeding.',
      thirdPartyRank: 'Frontier leaderboard leader on Terminal Bench 3.0 & AgentBench'
    },
    {
      id: 'glm-52-agentic',
      name: 'GLM-5.2 (1M Context)',
      family: 'glm',
      familyName: 'Zhipu AI (Z.ai)',
      tierBadge: 'Long-Horizon Agent',
      tierClass: 'badge-good',
      contextWindow: '1,000,000 tokens',
      architecture: 'IndexShare Sparse Attention MoE',
      strongestArena: 'Cost-minimized 1M token audits; tracing bureaucratic captured networks across multi-part regulatory corpora.',
      failureMode: 'Occasionally generates shorter answers than Claude Fable or GPT-6 Astra unless prompted to elaborate.',
      ingestionStrategy: 'Z.ai open API integration or enterprise self-hosting.',
      thirdPartyRank: 'Lowest inference cost per 1M context tokens among frontier models'
    },
    {
      id: 'glm-5-base-mit',
      name: 'GLM-5 Base (744B MIT)',
      family: 'glm',
      familyName: 'Zhipu AI (Z.ai)',
      tierBadge: 'Open Sovereign Foundation',
      tierClass: 'badge-good',
      contextWindow: '128,000 tokens',
      architecture: '744B MoE (40B active) Open Weights under MIT License',
      strongestArena: 'Self-hosted institutional research clusters requiring permissive MIT licensing with zero vendor lock-in.',
      failureMode: 'Requires multi-node GPU cluster (8x H100 or Ascend 910B) for full unquantized deployment.',
      ingestionStrategy: 'vLLM / SGLang cluster deployment with FP8 quantization.',
      thirdPartyRank: 'Largest fully MIT-licensed open foundation model in existence'
    },

    // LOCAL & SOVEREIGN OPEN WEIGHTS
    {
      id: 'llama-33-70b',
      name: 'Llama 3.3 70B',
      family: 'local',
      familyName: 'Meta & Open Community',
      tierBadge: 'Open-Weights Workhorse',
      tierClass: 'badge-good',
      contextWindow: '128,000 tokens',
      architecture: 'Dense 70B Open Foundation',
      strongestArena: 'Standard local offline deployment for workstations with 48GB–64GB RAM/VRAM. General PMN analysis.',
      failureMode: 'Can hallucinate PMN section numbers if not grounded with specific context chunks.',
      ingestionStrategy: 'Ollama: ollama run llama3.3:70b with injected Modelfile.',
      thirdPartyRank: 'Global baseline for 70B class open-weights intelligence'
    }
  ]

  const filteredModels = useMemo(() => {
    return MODELS.filter(m => {
      const matchFamily = modelFilter === 'all' || m.family === modelFilter
      const matchSearch =
        modelSearch === '' ||
        m.name.toLowerCase().includes(modelSearch.toLowerCase()) ||
        m.familyName.toLowerCase().includes(modelSearch.toLowerCase()) ||
        m.strongestArena.toLowerCase().includes(modelSearch.toLowerCase())
      return matchFamily && matchSearch
    })
  }, [modelFilter, modelSearch])

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

    modelfile: `# Production Ollama Modelfile for PMN Structural Analyst
# Recommended base models:
# 1. qwen2.5:32b (balanced local workstation standard)
# 2. qwq:32b (deep reinforcement learning reasoning)
# 3. deepseek-r1:32b (adversarial forensic auditing)

FROM qwen2.5:32b

# Low temperature ensures deterministic structural rigor over creative hallucination
PARAMETER temperature 0.25
PARAMETER top_p 0.85
PARAMETER num_ctx 65536
PARAMETER repeat_penalty 1.1

SYSTEM """
You are an authoritative Progressive Materialist Naturalism (PMN) structural analyst grounded in PMN Framework v${version} by Nova Dharma.
Your worldview is strictly materialist, non-ideal, and structurally diagnostic.

Key Directives:
1. Demystify ideological and moralizing narratives by identifying underlying material resource flows, power asymmetries, and institutional capture.
2. Ground all ethical evaluations in the biological floor (minimizing structural suffering) and the expansion of genuine becoming.
3. Test institutions against the Authoritative 5-Stage Capture Sequence (§7.3c-i) and opacity-as-power mechanics (§6.5).
4. Preserve the distinction between what is empirically demonstrated and what is conjectural.
5. Always cite specific PMN section IDs (§1.3, §3.4c, §6.5, §7.3c-i, §15.15) whenever referencing systemic mechanics.
"""
`,

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
5. Conclude with a strict confidence rating: High Empirical Confidence, Plausible Working Hypothesis, or Speculative Conjecture.`
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
        maxWidth: '1020px',
        width: '100%'
      }}
    >
      {/* STICKY HEADER */}
      <div className="sv-hdr-wrap border-b border-pmn-rule bg-pmn-bg sticky top-0 z-20">
        <div className="max-w-[1020px] mx-auto flex items-center justify-between px-4 lg:px-8 py-3.5">
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
          <em style={{ color: 'var(--acc-text)' }}>Across Cloud &amp; Local Sovereign AI Systems</em>
        </h1>
        <p className="page-subtitle">
          An operational manual for researchers, developers, and institutions to ground frontier and open-weights LLMs in PMN's non-ideal materialist architecture—preventing models from degenerating into ideological sycophancy or unanchored moralizing platitudes.
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
              ['deploy-modes', '01. Dual Deployment Architecture'],
              ['model-matrix', '02. Frontier & Sovereign Model Matrix (2026)'],
              ['local-setup', '03. Sovereign Local AI (Ollama & vLLM)'],
              ['prompt-library', '04. Upgraded Prompt Library (9 Roles)'],
              ['question-bank', '05. The Structural Question Bank (8 Cases)'],
              ['machine-endpoints', '06. Canonical Machine Endpoints & API'],
              ['scraping-pitfalls', '07. Web-Scraper Blindspots & Decay']
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
            Large Language Models default to <em>epistemic sycophancy</em> and <em>unanchored idealist ethics</em>: when queried about institutions, public health, platform economics, or state power, they instinctively synthesize opposing viewpoints into toothless compromises, judging power holders by their stated good intentions rather than their material incentives.
          </p>
          <p>
            PMN operates on the diametric premise: <strong>material reality is primary</strong>, information asymmetries dictate extractive leverage, and moral evaluations are non-arbitrarily anchored to the biological floor (minimizing structural somatic suffering) while enabling genuine becoming. To transform an AI into a rigorous structural analyst, you must feed it uncompressed architectural ground truth, enforce strict diagnostic protocols, and grade its output by whether it uncovers institutional capture rather than delivering diplomatic reassurance.
          </p>
        </div>

        {/* SECTION 1: DUAL DEPLOYMENT MODES */}
        <div className="step" id="deploy-modes">
          <span className="step-num">Step 01</span>
          <h2 className="step-h2">Dual Deployment Architecture: Cloud vs. Sovereign Local AI</h2>
          <p>
            Choose your deployment architecture based on context scale, institutional privacy, hardware access, and interactive needs:
          </p>

          <div className="vtabs" style={{ marginTop: '1.2rem', marginBottom: '1.2rem' }}>
            <button
              className={`vtab ${activeDeployTab === 'cloud' ? 'active' : ''}`}
              onClick={() => setActiveDeployTab('cloud')}
            >
              ☁️ Cloud / Frontier AI Platforms (Google, Anthropic, DeepSeek, OpenAI, Alibaba, Z.ai)
            </button>
            <button
              className={`vtab ${activeDeployTab === 'local' ? 'active' : ''}`}
              onClick={() => setActiveDeployTab('local')}
            >
              🔒 Sovereign / Local AI Engines (Ollama, LM Studio, vLLM, SGLang, Agentic IDEs)
            </button>
          </div>

          {activeDeployTab === 'cloud' && (
            <div>
              <div className="workflow-grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))' }}>
                <div className="workflow-card">
                  <div className="workflow-name">Google NotebookLM</div>
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
                  <div className="workflow-name">DeepSeek Platform (V4-Pro &amp; R1)</div>
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

                <div className="workflow-card">
                  <div className="workflow-name">Alibaba DashScope &amp; Z.ai (Qwen 3.8 / GLM-5.3)</div>
                  <div className="workflow-note">
                    Multi-agent autonomous workflows using Qwen 3.8-Max and GLM-5.3. Ingest PMN JSON endpoints (<code>llms.json</code>, <code>gl.json</code>) into automated agent pipelines and compliance toolchains.
                  </div>
                  <span className="workflow-badge badge-good">Best for Autonomous Workflows</span>
                </div>
              </div>

              <div className="note-box" style={{ marginTop: '1.2rem' }}>
                <span className="note-label">Cloud Deployment Rule of Thumb</span>
                For rapid reading verification and zero-hallucination page lookups, use <strong>Google NotebookLM</strong>. For extended policy stress-testing, philosophical debate, or red-teaming, use <strong>Claude Projects (Fable 5.1 / Sonnet 5)</strong> with <code>pmn_corpus_for_ai.md</code> loaded into permanent project knowledge.
              </div>
            </div>
          )}

          {activeDeployTab === 'local' && (
            <div>
              <div className="workflow-grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))' }}>
                <div className="workflow-card">
                  <div className="workflow-name">Ollama (CLI &amp; Local REST API)</div>
                  <div className="workflow-note">
                    Instantly deploy <code>qwen2.5:32b</code>, <code>qwq:32b</code>, or <code>deepseek-r1:32b</code> via a single customized <code>Modelfile</code>. Configure <code>num_ctx 65536</code> for 100% offline, zero-telemetry institutional audits.
                  </div>
                  <span className="workflow-badge badge-best">Top Local Recommendation</span>
                </div>

                <div className="workflow-card">
                  <div className="workflow-name">LM Studio &amp; Jan.ai (Desktop GUI)</div>
                  <div className="workflow-note">
                    Native desktop GGUF runners for Windows, macOS, and Linux. Drag-and-drop <code>pmn_corpus_for_ai.md</code> into local context or attach it to local RAG vector indexes with zero command-line configuration.
                  </div>
                  <span className="workflow-badge badge-good">Easiest Desktop Setup</span>
                </div>

                <div className="workflow-card">
                  <div className="workflow-name">vLLM &amp; SGLang (High-Throughput Inference)</div>
                  <div className="workflow-note">
                    Production-grade inference engine for research institutions. Host open-weight models (Qwen 2.5 72B, DeepSeek-V4-Flash, GLM-5 Base) with PagedAttention, FP8 quantization, and standard OpenAI-compatible endpoints.
                  </div>
                  <span className="workflow-badge badge-best">Best for High-Volume Research</span>
                </div>

                <div className="workflow-card">
                  <div className="workflow-name">Enterprise Local RAG (AnythingLLM / Dify)</div>
                  <div className="workflow-note">
                    Self-hosted vector pipeline. Ingest the structured JSON datasets (<code>manifest.json</code>, <code>gl.json</code>) into local Qdrant/Chroma databases for confidential organizational capture evaluations.
                  </div>
                  <span className="workflow-badge badge-good">Best for Structured Datasets</span>
                </div>

                <div className="workflow-card">
                  <div className="workflow-name">Agentic IDEs (Cursor / Windsurf / Cline)</div>
                  <div className="workflow-note">
                    Point agent workspace rules (<code>.cursorrules</code>) directly to <code>llms.txt</code> and <code>llms.json</code> for live pair-programming and institutional modeling without external data leakage.
                  </div>
                  <span className="workflow-badge badge-best">Best for Developers</span>
                </div>
              </div>

              <div className="note-box" style={{ marginTop: '1.2rem' }}>
                <span className="note-label">Why Deploy Sovereign Local AI?</span>
                PMN's institutional capture and corruption diagnostics (§7.3c, §14.6) frequently evaluate internal whistleblower evidence, proprietary corporate data, or sensitive state regulatory filings. Local execution guarantees absolute confidentiality with zero risk of vendor surveillance or training-data absorption.
              </div>
            </div>
          )}
        </div>

        {/* SECTION 2: MODEL SELECTION MATRIX */}
        <div className="step" id="model-matrix">
          <span className="step-num">Step 02</span>
          <h2 className="step-h2">Frontier &amp; Sovereign Model Capability Matrix (2026 Edition)</h2>
          <p>
            No single model dominates every analytical domain. Deep reasoning models excel at causal forensics and assumption archaeology, while massive-context generalists excel at multi-part manuscript synthesis. Filter and search the matrix below:
          </p>

          {/* MATRIX CONTROLS: FILTER TABS & SEARCH */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.8rem', margin: '1.5rem 0 1rem' }}>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.35rem' }}>
              {[
                ['all', 'All Ecosystems'],
                ['gemini', 'Google DeepMind (Gemini)'],
                ['claude', 'Anthropic (Claude)'],
                ['deepseek', 'DeepSeek'],
                ['openai', 'OpenAI'],
                ['qwen', 'Alibaba (Qwen)'],
                ['glm', 'Zhipu AI (GLM)'],
                ['local', 'Open-Weights / Local']
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

            <div style={{ display: 'flex', gap: '0.6rem', alignItems: 'center' }}>
              <input
                type="text"
                value={modelSearch}
                onChange={e => setModelSearch(e.target.value)}
                placeholder="Search models by name, architecture, or diagnostic capability…"
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
                  <th style={{ padding: '0.75rem 0.85rem', fontFamily: 'var(--f-mono)', fontSize: '0.7rem', textTransform: 'uppercase', letterSpacing: '0.08em', minWidth: '170px' }}>
                    Model &amp; Tier
                  </th>
                  <th style={{ padding: '0.75rem 0.85rem', fontFamily: 'var(--f-mono)', fontSize: '0.7rem', textTransform: 'uppercase', letterSpacing: '0.08em', minWidth: '110px' }}>
                    Context
                  </th>
                  <th style={{ padding: '0.75rem 0.85rem', fontFamily: 'var(--f-mono)', fontSize: '0.7rem', textTransform: 'uppercase', letterSpacing: '0.08em', minWidth: '140px' }}>
                    Architecture / Scale
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
                    {/* MODEL & TIER */}
                    <td style={{ padding: '0.8rem 0.85rem', verticalAlign: 'top' }}>
                      <div style={{ fontWeight: 700, color: 'var(--ink)', fontSize: '0.9rem', marginBottom: '0.2rem' }}>
                        {m.name}
                      </div>
                      <div style={{ fontFamily: 'var(--f-mono)', fontSize: '0.66rem', color: 'var(--mute)', marginBottom: '0.35rem' }}>
                        {m.familyName}
                      </div>
                      <span className={`workflow-badge ${m.tierClass}`} style={{ fontSize: '0.62rem', padding: '0.1rem 0.4rem' }}>
                        {m.tierBadge}
                      </span>
                      <div style={{ fontFamily: 'var(--f-mono)', fontSize: '0.63rem', color: 'var(--acc-text)', marginTop: '0.35rem', lineHeight: 1.3 }}>
                        {m.thirdPartyRank}
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
                      No models found matching criteria "{modelSearch}".
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* SECTION 3: LOCAL SOVEREIGN SETUP */}
        <div className="step" id="local-setup">
          <span className="step-num">Step 03</span>
          <h2 className="step-h2">Deploying Sovereign Local AI with Ollama &amp; vLLM</h2>
          <p>
            You can instantiate a completely private, offline PMN Structural Analyst on local hardware using open-weight models in under 3 minutes. Zero external data transmission guarantees compliance when analyzing confidential organizational records.
          </p>

          <div className="checklist" style={{ marginTop: '1.2rem' }}>
            <div className="check-item">
              <strong>1. Install Ollama &amp; Pull Optimized Model</strong>
              <span>
                Download Ollama from <code>ollama.com</code>. On machines with 16GB–24GB VRAM/RAM, pull <code>qwen2.5:32b</code> or the reasoning-specialized <code>qwq:32b</code>:
                <br />
                <code style={{ fontSize: '0.75rem', display: 'inline-block', marginTop: '0.3rem' }}>
                  ollama pull qwen2.5:32b
                </code>
              </span>
            </div>

            <div className="check-item">
              <strong>2. Download Flat Uncompressed Corpus</strong>
              <span>
                Download the complete raw text file (~330,000 words without HTML bloat):
                <br />
                <a
                  href="https://novadharma-hub.github.io/pmn-framework/pmn_corpus_for_ai.md"
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{ color: 'var(--acc-text)', fontWeight: 600, display: 'inline-block', marginTop: '0.3rem' }}
                >
                  Download pmn_corpus_for_ai.md &darr;
                </a>
              </span>
            </div>

            <div className="check-item">
              <strong>3. Build the Dedicated Ollama Model Container</strong>
              <span>
                Create a text file named <code>Modelfile</code> with the configuration below and run:
                <br />
                <code style={{ fontSize: '0.75rem', display: 'inline-block', marginTop: '0.3rem' }}>
                  ollama create pmn-agent -f Modelfile
                </code>
              </span>
            </div>

            <div className="check-item">
              <strong>4. (Optional) High-Throughput Cluster Serving with vLLM</strong>
              <span>
                For research clusters or multi-seat organizations, serve open weights with OpenAI API compatibility:
                <br />
                <code style={{ fontSize: '0.72rem', display: 'inline-block', marginTop: '0.3rem' }}>
                  python3 -m vllm.entrypoints.openai.api_server --model Qwen/Qwen2.5-32B-Instruct --max-model-len 65536
                </code>
              </span>
            </div>
          </div>

          <div className="code-block" style={{ marginTop: '1.5rem' }}>
            <span className="code-label">Ollama Modelfile Template (Configured for 64K Context)</span>
            <button
              className={`copy-btn ${copiedStates['modelfile-btn'] ? 'copied' : ''}`}
              onClick={() => copyText('modelfile-btn', prompts.modelfile)}
            >
              {copiedStates['modelfile-btn'] ? 'Copied' : 'Copy Modelfile'}
            </button>
            <div className="code-text">{prompts.modelfile}</div>
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
                ['modelfile', '8. Ollama Modelfile (Local)']
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
                  {activeRoleTab === 'modelfile' && 'Role 8: Production Ollama Modelfile Configuration'}
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

        {/* SECTION 7: SCRAPING PITFALLS */}
        <div className="step" id="scraping-pitfalls">
          <span className="step-num">Step 07</span>
          <h2 className="step-h2">Navigating Web-Scraper Limitations &amp; Persona Decay</h2>
          <p>
            Feeding live web links directly to public search LLMs often fails silently. Understand these five common failure modes to maintain rigorous grounding:
          </p>

          <div className="note-box" style={{ borderLeft: '3px solid var(--acc)', marginTop: '1.2rem' }}>
            <span className="note-label">⚠️ The Five Web-Scraping Blindspots</span>
            <ul style={{ fontSize: '0.88rem', color: 'var(--ink2)', lineHeight: 1.75, paddingLeft: '1.2rem', margin: '0.5rem 0', listStyleType: 'decimal' }}>
              <li>
                <strong>Dynamic Single-Page Application (SPA):</strong> Most web crawlers do not execute JavaScript; they receive an empty root container (<code>&lt;div id="root"&gt;&lt;/div&gt;</code>) instead of rendered prose. Always point models to <code>pmn_corpus_for_ai.md</code> or <code>llms.txt</code>.
              </li>
              <li>
                <strong>Ignored Hash Anchors:</strong> Web crawlers and basic HTTP scrapers strip URL hashes (e.g., <code>/#/s/1.3</code>). A query directed to a specific section anchor will only retrieve home page metadata.
              </li>
              <li>
                <strong>Interactive UI Concealment:</strong> Accordions, glossary modals, sliding sidebars, and tabbed panels are invisible to basic HTTP scrapers.
              </li>
              <li>
                <strong>Plausible Hallucination Fallback:</strong> When a crawler sees a title like "Progressive Materialist Naturalism" but cannot access the body text, the LLM falls back on hallucinating generic 19th-century Marxist or physicalist tropes.
              </li>
              <li>
                <strong>Rapid Persona Decay:</strong> Instructing a chat model to "roleplay as PMN" decays within 3–4 conversation turns unless anchored in an uploaded source file (like a Claude Project or NotebookLM notebook) or persistent system instructions.
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
