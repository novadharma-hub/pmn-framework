import React, { useState, useMemo } from 'react'

interface GuideViewProps {
  onBackHome: () => void
  version: string
}

interface ModelSpec {
  id: string
  name: string
  apiString: string
  family: 'gemini' | 'claude' | 'deepseek' | 'openai' | 'qwen' | 'glm' | 'kimi' | 'mistral' | 'grok' | 'muse'
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
  'claude-fable-5-1',
  'claude-opus-5',
  'claude-sonnet-5',
  'openai-gpt-6-astra',
  'openai-gpt-56-sol',
  'muse-spark-13',
  'glm-53',
  'grok-46',
  'kimi-k3',
  'gemini-38-flash',
  'qwen-38-max',
  'deepseek-v4-pro'
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

  // MODEL MATRIX — every row verified against the provider's own live documentation
  // on 2026-09-09. No model name here is written from model memory: the previous
  // matrix was 'corrected' against an agent's recollection and deleted real models
  // as fictional. Re-verify at every release, or remove this section entirely.
  const MODELS: ModelSpec[] = [
    // ANTHROPIC
    {
      id: 'claude-fable-5-1',
      name: 'Claude Fable 5.1',
      apiString: 'claude-fable-5-1',
      family: 'claude',
      familyName: 'Anthropic',
      tierBadge: 'Rank #1 Frontier',
      tierClass: 'badge-best',
      tierCategory: 'pro',
      contextWindow: 'Long-context (see official documentation)',
      architecture: 'Frontier reasoning champion',
      strongestArena: 'Systemic argument reformulation, adversarial red-teaming, and counter-objection drafting.',
      failureMode: 'High demand on reasoning budgets; verify account limits before heavy batch runs.',
      ingestionStrategy: 'API or Claude web portal.',
      thirdPartyRank: 'Ranked #1 on Artificial Analysis Intelligence Index v4.3 (Score: 53.37)'
    },
    {
      id: 'claude-opus-5',
      name: 'Claude Opus 5',
      apiString: 'claude-opus-5',
      family: 'claude',
      familyName: 'Anthropic',
      tierBadge: 'Frontier Reasoning',
      tierClass: 'badge-best',
      tierCategory: 'pro',
      contextWindow: 'Long-context (see official documentation)',
      architecture: 'Flagship reasoning model',
      strongestArena: 'Holding the permanent tension of Part XIII without forcing artificial resolution; assumption archaeology (§12.1). Highest resilience against user sycophancy.',
      failureMode: 'Lengthy reasoning traces; budget output tokens when concise synthesis is required.',
      ingestionStrategy: 'Claude Projects with pmn_corpus_for_ai.md in Project Knowledge, or direct API.',
      thirdPartyRank: 'Ranked #3 on Artificial Analysis Intelligence Index v4.3 (Score: 50.70)'
    },
    {
      id: 'claude-sonnet-5',
      name: 'Claude Sonnet 5',
      apiString: 'claude-sonnet-5',
      family: 'claude',
      familyName: 'Anthropic',
      tierBadge: 'Balanced Frontier',
      tierClass: 'badge-good',
      tierCategory: 'pro',
      contextWindow: 'Long-context (see official documentation)',
      architecture: 'Balanced frontier model',
      strongestArena: 'Sustained cross-Part reading; default choice for long analytical dialogues.',
      failureMode: 'May conclude prematurely on sections without explicit defeaters — demand specific section citations (§X.Y).',
      ingestionStrategy: 'Claude Projects or direct API.',
      thirdPartyRank: 'Verified against active Claude environment'
    },
    {
      id: 'claude-haiku-4-5',
      name: 'Claude Haiku 4.5',
      apiString: 'claude-haiku-4-5-20251001',
      family: 'claude',
      familyName: 'Anthropic',
      tierBadge: 'Fast / Economical',
      tierClass: 'badge-fast',
      tierCategory: 'flash',
      contextWindow: 'See official documentation',
      architecture: 'Fast tier model',
      strongestArena: 'Cross-reference scanning, citation lookup, and lightweight vocabulary verification.',
      failureMode: 'Less suited for deep multi-Part dialectical synthesis.',
      ingestionStrategy: 'API for iterative passes; pair with frontier tier for final verdicts.',
      thirdPartyRank: 'Verified against active Claude environment'
    },
    // OPENAI
    {
      id: 'openai-gpt-6-astra',
      name: 'GPT-6 Astra',
      apiString: 'gpt-6-astra',
      family: 'openai',
      familyName: 'OpenAI',
      tierBadge: 'Rank #2 Frontier',
      tierClass: 'badge-best',
      tierCategory: 'pro',
      contextWindow: 'See official documentation',
      architecture: 'Flagship for complex reasoning, code synthesis, and multi-step verification',
      strongestArena: 'Extended deductive chains and cross-Part systemic consistency audits.',
      failureMode: 'Staged availability (Trusted Access) — verify tier access in developer dashboard.',
      ingestionStrategy: 'API; upload full corpus or segmented Parts.',
      thirdPartyRank: 'Ranked #2 on Artificial Analysis Intelligence Index v4.3 (Score: 52.81)'
    },
    {
      id: 'openai-gpt-56-sol',
      name: 'GPT-5.6 Sol',
      apiString: 'gpt-5.6-sol',
      family: 'openai',
      familyName: 'OpenAI',
      tierBadge: 'Professional Flagship',
      tierClass: 'badge-best',
      tierCategory: 'pro',
      contextWindow: 'See official documentation',
      architecture: 'Flagship for complex professional workloads',
      strongestArena: 'Extended structural analysis; forensic diagnostics of institutional capture (Part VII).',
      failureMode: 'High output token cost — constrain output tokens for iterative passes.',
      ingestionStrategy: 'API.',
      thirdPartyRank: 'Ranked #6 on Artificial Analysis Intelligence Index v4.3 (Score: 47.06)'
    },
    {
      id: 'openai-gpt-56-terra',
      name: 'GPT-5.6 Terra',
      apiString: 'gpt-5.6-terra',
      family: 'openai',
      familyName: 'OpenAI',
      tierBadge: 'Balanced Frontier',
      tierClass: 'badge-good',
      tierCategory: 'pro',
      contextWindow: 'See official documentation',
      architecture: 'Balances intelligence and cost efficiency',
      strongestArena: 'Everyday interactive inquiry and manuscript navigation.',
      failureMode: 'For load-bearing normative claims, cross-verify with flagship reasoning models.',
      ingestionStrategy: 'API.',
      thirdPartyRank: 'Ranked #10 on Artificial Analysis Intelligence Index v4.3 (Score: 42.25)'
    },
    {
      id: 'openai-gpt-56-luna',
      name: 'GPT-5.6 Luna',
      apiString: 'gpt-5.6-luna',
      family: 'openai',
      familyName: 'OpenAI',
      tierBadge: 'Cost-Sensitive / Fast',
      tierClass: 'badge-fast',
      tierCategory: 'flash',
      contextWindow: 'See official documentation',
      architecture: 'Optimized for cost-sensitive high-throughput tasks',
      strongestArena: 'Initial passes, section lookup, and citation extraction.',
      failureMode: 'Do not use for definitive philosophical verdicts.',
      ingestionStrategy: 'High-volume API passes.',
      thirdPartyRank: 'Ranked #15 on Artificial Analysis Intelligence Index v4.3 (Score: 37.50)'
    },
    // MUSE
    {
      id: 'muse-spark-13',
      name: 'Muse Spark 1.3',
      apiString: 'muse-spark-1.3',
      family: 'muse',
      familyName: 'Muse',
      tierBadge: 'Rank #5 Frontier',
      tierClass: 'badge-best',
      tierCategory: 'pro',
      contextWindow: 'See official documentation',
      architecture: 'High-parameter frontier reasoning model',
      strongestArena: 'Rigorous formal logic, axiomatic deconstruction, and dialectical pressure-testing.',
      failureMode: 'Requires explicit output token budgeting for iterative loops.',
      ingestionStrategy: 'API.',
      thirdPartyRank: 'Ranked #5 on Artificial Analysis Intelligence Index v4.3 (Score: 48.17)'
    },
    // Z.AI (ZHIPU)
    {
      id: 'glm-53',
      name: 'GLM-5.3',
      apiString: 'glm-5.3',
      family: 'glm',
      familyName: 'Z.ai (Zhipu)',
      tierBadge: 'Sovereign Weights Leader',
      tierClass: 'badge-best',
      tierCategory: 'pro',
      contextWindow: 'See official documentation',
      architecture: 'Latest flagship release of GLM-5 family',
      strongestArena: 'Strongest open-weights model when manuscript text must never leave local premises.',
      failureMode: 'Demands substantial local GPU hardware; verify VRAM specs before deploying.',
      ingestionStrategy: 'Hugging Face (zai-org) or Z.ai API.',
      thirdPartyRank: 'Ranked #7 on Artificial Analysis Intelligence Index v4.3 (Score: 44.86)'
    },
    {
      id: 'glm-53-flash',
      name: 'GLM-5.3-Flash',
      apiString: 'glm-5.3-flash',
      family: 'glm',
      familyName: 'Z.ai (Zhipu)',
      tierBadge: 'Fast Sovereign',
      tierClass: 'badge-fast',
      tierCategory: 'flash',
      contextWindow: 'See official documentation',
      architecture: 'High-throughput sovereign inference model',
      strongestArena: 'High-speed automated scanning and local RAG indexing.',
      failureMode: 'For complex philosophical verdicts, escalate to GLM-5.3 flagship.',
      ingestionStrategy: 'Z.ai API.',
      thirdPartyRank: 'Ranked #11 on Artificial Analysis Intelligence Index v4.3 (Score: 41.91)'
    },
    // XAI
    {
      id: 'grok-46',
      name: 'Grok 4.6',
      apiString: 'grok-4.6',
      family: 'grok',
      familyName: 'xAI',
      tierBadge: '500k Frontier',
      tierClass: 'badge-good',
      tierCategory: 'pro',
      contextWindow: '500,000 tokens',
      architecture: 'Frontier model for complex reasoning and direct dialectical critique',
      strongestArena: '500k context holds majority of corpus; uninhibited adversarial challenge to institutional PR.',
      failureMode: 'Strict knowledge cutoff; verify latest empirical references.',
      ingestionStrategy: 'xAI API (api.x.ai/v1).',
      thirdPartyRank: 'Ranked #8 on Artificial Analysis Intelligence Index v4.3 (Score: 44.41)'
    },
    // MOONSHOT AI
    {
      id: 'kimi-k3',
      name: 'Kimi K3',
      apiString: 'kimi-k3',
      family: 'kimi',
      familyName: 'Moonshot AI',
      tierBadge: '1M Context Champion',
      tierClass: 'badge-best',
      tierCategory: 'pro',
      contextWindow: '1,000,000 tokens',
      architecture: '2.8T parameters, native multimodal context',
      strongestArena: '1M token window holds entire PMN corpus with room for extensive multi-document dialogue.',
      failureMode: 'Massive context does not guarantee needle-in-haystack recall; always demand exact § citations.',
      ingestionStrategy: 'Moonshot API.',
      thirdPartyRank: 'Ranked #9 on Artificial Analysis Intelligence Index v4.3 (Score: 43.78)'
    },
    // GOOGLE DEEPMIND
    {
      id: 'gemini-38-flash',
      name: 'Gemini 3.8 Flash',
      apiString: 'gemini-3.8-flash',
      family: 'gemini',
      familyName: 'Google DeepMind',
      tierBadge: 'High-Velocity Frontier',
      tierClass: 'badge-best',
      tierCategory: 'flash',
      contextWindow: 'See official documentation',
      architecture: 'Latest Gemini release',
      strongestArena: 'Ingesting massive context in a single prompt; cross-Part conceptual mapping.',
      failureMode: 'Fast models tend to summarize; demand verbatim section citations (§X.Y).',
      ingestionStrategy: 'API; or NotebookLM for source-grounded answering.',
      thirdPartyRank: 'Ranked #12 on Artificial Analysis Intelligence Index v4.3 (Score: 41.19)'
    },
    {
      id: 'gemini-37-flash',
      name: 'Gemini 3.7 Flash',
      apiString: 'gemini-3.7-flash',
      family: 'gemini',
      familyName: 'Google DeepMind',
      tierBadge: 'Workhorse',
      tierClass: 'badge-good',
      tierCategory: 'flash',
      contextWindow: 'See official documentation',
      architecture: 'Workhorse for coding and agentic workflows',
      strongestArena: 'Agentic sweeps: automated tracing of cross-references across the manuscript.',
      failureMode: 'Demand explicit section citations to prevent generic responses.',
      ingestionStrategy: 'API.',
      thirdPartyRank: 'Verified via Google AI developer documentation'
    },
    {
      id: 'gemini-notebooklm',
      name: 'NotebookLM',
      apiString: 'notebooklm',
      family: 'gemini',
      familyName: 'Google DeepMind',
      tierBadge: 'Source-Grounded',
      tierClass: 'badge-good',
      tierCategory: 'pro',
      contextWindow: 'Grounded in uploaded documents',
      architecture: 'Source-grounded synthesis interface',
      strongestArena: 'Answers grounded directly in sources with citations — ideal for verifying whether a claim exists in the manuscript.',
      failureMode: 'Confined strictly to uploaded documents; will not synthesize beyond provided text.',
      ingestionStrategy: 'Upload pmn_corpus_for_ai.md as primary source.',
      thirdPartyRank: 'Verified via Google AI developer documentation'
    },
    // ALIBABA CLOUD
    {
      id: 'qwen-38-max',
      name: 'Qwen3.8-Max',
      apiString: 'qwen3.8-max',
      family: 'qwen',
      familyName: 'Alibaba Cloud',
      tierBadge: 'Frontier Thinking',
      tierClass: 'badge-best',
      tierCategory: 'pro',
      contextWindow: 'See official documentation',
      architecture: 'Hybrid Thinking / Non-Thinking reasoning mode (2.4T A95B)',
      strongestArena: 'Thinking mode forces explicit chains of materialist causation and falsification criteria.',
      failureMode: 'Explicitly activate Thinking mode; default mode can be too concise.',
      ingestionStrategy: 'Alibaba Model Studio; OpenAI/Anthropic compatible.',
      thirdPartyRank: 'Ranked #13 on Artificial Analysis Intelligence Index v4.3 (Score: 40.04)'
    },
    {
      id: 'qwen-38-plus',
      name: 'Qwen3.8-Plus',
      apiString: 'qwen3.8-plus',
      family: 'qwen',
      familyName: 'Alibaba Cloud',
      tierBadge: 'Balanced Tier',
      tierClass: 'badge-good',
      tierCategory: 'pro',
      contextWindow: 'See official documentation',
      architecture: 'Plus tier model (27B)',
      strongestArena: 'Everyday reading sessions at moderate cost.',
      failureMode: 'Cross-verify deep dialectical claims with flagship tier.',
      ingestionStrategy: 'Alibaba Model Studio.',
      thirdPartyRank: 'Alibaba Model Studio documentation'
    },
    // DEEPSEEK
    {
      id: 'deepseek-v4-pro',
      name: 'DeepSeek-V4-Pro',
      apiString: 'deepseek-v4-pro',
      family: 'deepseek',
      familyName: 'DeepSeek',
      tierBadge: 'Frontier MoE',
      tierClass: 'badge-best',
      tierCategory: 'pro',
      contextWindow: 'See official documentation',
      architecture: 'MoE 1.6T total / 49B active',
      strongestArena: 'Long synthesis and multi-step reasoning at a fraction of Western frontier API costs.',
      failureMode: 'Verify provider data retention policy if working on private unreleased drafts.',
      ingestionStrategy: 'OpenAI/Anthropic compatible API.',
      thirdPartyRank: 'DeepSeek V4 series on Artificial Analysis'
    },
    {
      id: 'deepseek-v4-flash',
      name: 'DeepSeek-V4-Flash',
      apiString: 'deepseek-v4-flash',
      family: 'deepseek',
      familyName: 'DeepSeek',
      tierBadge: 'Fast / Economical',
      tierClass: 'badge-fast',
      tierCategory: 'flash',
      contextWindow: 'See official documentation',
      architecture: 'MoE 284B total / 13B active',
      strongestArena: 'Cheap iterative passes: cross-reference tracing and quote assembly.',
      failureMode: 'For final philosophical verdicts, escalate to V4-Pro.',
      ingestionStrategy: 'OpenAI/Anthropic compatible API.',
      thirdPartyRank: 'Ranked #14 on Artificial Analysis Intelligence Index v4.3 (Score: 39.55)'
    },
    // MISTRAL AI
    {
      id: 'mistral-medium-35',
      name: 'Mistral Medium 3.5',
      apiString: 'mistral-medium-3.5',
      family: 'mistral',
      familyName: 'Mistral AI',
      tierBadge: 'Multimodal Reasoning',
      tierClass: 'badge-best',
      tierCategory: 'pro',
      contextWindow: 'See official documentation',
      architecture: 'Configurable reasoning effort via reasoning_effort parameter',
      strongestArena: 'reasoning_effort parameter enables escalating cognitive effort for heavy sections (Part XIII).',
      failureMode: 'Set reasoning_effort consciously; default can be too brief for structural critique.',
      ingestionStrategy: 'Mistral API.',
      thirdPartyRank: 'Artificial Analysis evaluations'
    },
    {
      id: 'mistral-large-3',
      name: 'Mistral Large 3',
      apiString: 'mistral-large-3',
      family: 'mistral',
      familyName: 'Mistral AI',
      tierBadge: 'Large MoE',
      tierClass: 'badge-good',
      tierCategory: 'pro',
      contextWindow: 'See official documentation',
      architecture: 'Sparse MoE, 41B active / 675B total',
      strongestArena: 'Long-form synthesis in European sovereign cloud deployments.',
      failureMode: 'Check regional availability and rate limits.',
      ingestionStrategy: 'Mistral API.',
      thirdPartyRank: 'Docs Mistral documentation'
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

# 3. Call Remote API (Example: Anthropic Claude Opus 5)
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
      style={{
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
        width: '100%',
        overflow: 'hidden',
        background: 'var(--bg)'
      }}
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

        {/* SECTION 1: WHAT THIS CORPUS CANNOT DO FOR YOU */}
        <div className="step" id="corpus-limits">
          <span className="step-num">Step 01</span>
          <h2 className="step-h2">Before You Start: Where This Corpus Is Weak</h2>
          <p>
            Every guide of this kind tells you which model to pick. Model choice is the variable that matters
            least here. The findings below were measured against the v120 corpus on 2026-09-09, and they apply
            <strong> identically to the strongest and the weakest model on this page</strong>. An AI reading this
            corpus will reproduce these weaknesses confidently, because nothing in the text marks them.
          </p>
          <p>
            This section exists for a reason internal to the framework itself. PMN&apos;s primary diagnostic
            (&sect;1.2) is whether a framework revises under evidence or insulates itself from it. A framework
            that hides its weak points from its own readers has already begun to insulate. Publishing them is an
            application of PMN, not a concession.
          </p>

          <div className="workflow-grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', marginTop: '1.2rem' }}>
            {[
              {
                h: '74 attributions carry no source',
                d: 'Sentences of the form "Gramsci argues that…" appear 81 times; 74 of them have no citation within three sentences. Gramsci alone carries 35.',
                w: 'Ask the model to quote the section it is drawing on before accepting any claim about what a thinker held. If it cannot name a section, treat the attribution as the manuscript\'s reading, not as a report of the source.'
              },
              {
                h: 'No causal claim states what would refute it',
                d: 'Of 57 sections classified as causal-mechanism claims, 0 state a defeater. Scope hedging is good (84% qualify their conditions) — but hedging weakens a claim without saying what would overturn it.',
                w: 'When you ask a model to "test" a claim, ask it first: what evidence would defeat this? If the corpus does not say, that is the finding — make the model report the absence instead of inventing a test.'
              },
              {
                h: '13 empirical and historical sections cite nothing',
                d: 'Including the whole of Part XVII (the case studies, ~5,100 words) and §7.8 Regime Types (4,004 words) — the two places whose function is to ground the framework in real history.',
                w: 'These are where a model is most likely to fabricate supporting detail. Ask for the historical claim and the source separately, and verify the source yourself.'
              },
              {
                h: 'The canonical definitions section is outvoted on S',
                d: '§15.0b states that S is "a qualitative classification, not a quantity" and that S = f(R, B, V) is "not a measurable sum". Four other places write S = R + B + V — §3.4b (twice), §7.8, §15.14, and the glossary.',
                w: 'If a model computes S as a sum, it is following the majority of the text against the section that claims authority over the term. Point it at §15.0b.'
              },
              {
                h: 'The glossary and §11.0 disagree on a count',
                d: 'The glossary entry is "the seven diagnostic questions". §11.0 is headed "Nine diagnostic questions" and lists eight items, one of which the text itself calls the eighth. v118.6 and v119 both said seven.',
                w: 'Expect two different answers to the same question. Seven is the reading supported by every source except the current heading.'
              },
              {
                h: 'What this list is not',
                d: 'It is not a list of errors in the philosophy. Every item is about traceability: whether a reader can check a claim, not whether the claim is true.',
                w: 'Use it to calibrate how much weight to put on a given answer — not to discount the framework.'
              }
            ].map((c, i) => (
              <div key={i} className="workflow-card">
                <h4>{c.h}</h4>
                <p>{c.d}</p>
                <p><strong>What to do:</strong> {c.w}</p>
              </div>
            ))}
          </div>
        </div>

        {/* SECTION 4: UPGRADED PROMPT LIBRARY */}
        <div className="step" id="prompt-library">
          <span className="step-num">Step 02</span>
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
          <span className="step-num">Step 03</span>
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

        {/* SECTION 1: DUAL DEPLOYMENT MODES */}
        <div className="step" id="deploy-modes">
          <span className="step-num">Step 04</span>
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
                  <div className="workflow-name">Claude Projects (Claude Opus 5 / Sonnet 5)</div>
                  <div className="workflow-note">
                    Attach <code>pmn_corpus_for_ai.md</code> into Project Knowledge. Leverage 200k-token context and Extended Thinking for deep dialectical reasoning, multi-part synthesis, and assumption archaeology without persona decay.
                  </div>
                  <span className="workflow-badge badge-best">Best for Dialectical Depth</span>
                </div>

                <div className="workflow-card">
                  <div className="workflow-name">Google AI Studio (Gemini 3.8 Flash / 3.7 Flash)</div>
                  <div className="workflow-note">
                    Massive 2M-token context window ingests the entire ~330,000-word uncompressed manuscript in a single prompt. Run simultaneous cross-sectional queries across Part I through XVII with sub-second retrieval.
                  </div>
                  <span className="workflow-badge badge-good">Best for 2M Full Corpus</span>
                </div>

                <div className="workflow-card">
                  <div className="workflow-name">DeepSeek Chat Web (DeepSeek-V4-Pro &amp; R1)</div>
                  <div className="workflow-note">
                    DeepSeek-V4-Pro (671B MoE) and DeepSeek-V4-Pro extended reasoning. Exceptional resistance to establishment propaganda and ruthless execution of the 5-Stage Institutional Capture Sequence (§7.3c-i). Note: Sensitive political-economy topics are subject to CAC regulatory filtering.
                  </div>
                  <span className="workflow-badge badge-good">Best for Capture Forensics</span>
                </div>

                <div className="workflow-card">
                  <div className="workflow-name">OpenAI ChatGPT (GPT-6 Astra &amp; GPT-5.6 Sol)</div>
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
                    Unified OpenAI-compatible proxy routing between Claude Opus 5, Gemini 3.8 Flash, Qwen3.7-Max, and DeepSeek-V4-Pro using a single API key. Automatically falls back if rate limits or outages occur.
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
                    For open-weight models like GLM-5 (MIT), GLM-5.2, or Mistral Small 4, utilize cloud LPU/WSE hardware yielding 800+ tokens/second rather than overloading local laptop GPUs.
                  </div>
                  <span className="workflow-badge badge-good">Best for High-Speed Tokens</span>
                </div>
              </div>

              <div className="note-box" style={{ marginTop: '1.2rem' }}>
                <span className="note-label">Why API Harnesses Beat Local GPU Serving</span>
                Frontier models (such as 671B DeepSeek-V4-Pro or massive 70B+ architectures) require multi-cluster server infrastructure that consumer hardware cannot run. Local developer harnesses give you the privacy of local file management and custom scripts while leveraging datacenter-scale compute via official API keys.
              </div>
            </div>
          )}
        </div>

        {/* SECTION 2: MODEL SELECTION MATRIX */}
        <div className="step" id="model-matrix">
          <span className="step-num">Step 05</span>
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
                  Claude Opus 5 &amp; Claude Sonnet 5
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
                  GPT-6 Astra &amp; GPT-5.6 Sol
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
                  Kimi K3 &amp; Gemini 3.8 Flash
                </strong>
                <p style={{ fontSize: '0.81rem', color: 'var(--ink2)', lineHeight: 1.55, margin: '0 0 0.5rem' }}>
                  <strong>Why it wins:</strong> Kimi K3 carries a 1,000,000-token context window and GLM-5.2 matches it, so the entire ~330,000-word uncompressed corpus fits in a single prompt on more than one provider — which matters, because it lets you ask the same whole-corpus question twice and compare. A large window is not the same as reliable retrieval: always demand the section number behind an answer rather than a paraphrase.</p>
                <div style={{ fontFamily: 'var(--f-mono)', fontSize: '0.68rem', color: 'var(--mute)', background: 'var(--bg2)', padding: '0.4rem 0.6rem', borderRadius: '3px' }}>
                  <strong>Deployment:</strong> Google AI Studio or the Kimi platform with <code>pmn_corpus_for_ai.md</code>, temperature 0.2.
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
                  GLM-5.3, GLM-5 (MIT) &amp; DeepSeek-V4-Pro
                </strong>
                <p style={{ fontSize: '0.81rem', color: 'var(--ink2)', lineHeight: 1.55, margin: '0 0 0.5rem' }}>
                  <strong>Why it wins:</strong> Enables completely sovereign, private, air-gapped deployments. GLM-5 ships under an MIT licence, the most permissive option for a fully local install; Mistral Small 4 provides enterprise compliance; DeepSeek-V4-Pro provides datacenter-scale 671B MoE efficiency (~$0.14/1M tokens).
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
                  <strong style={{ color: '#9b5f5f' }}>Critical Caveats on Chinese-hosted APIs (State Censorship Guardrails):</strong> While the DeepSeek V4 family is a remarkable achievement in open reinforcement learning, researchers conducting institutional and political critique must account for two real-world constraints: (1) Mandatory CAC regulatory compliance causes refusals or sanitized answers on queries regarding sensitive state governance, regime power, and political economy; (2) On open-ended qualitative philosophy, R1 is prone to repetitive thinking loops and unpredictable language mixing in <code>&lt;think&gt;</code> traces. For uncensored structural critique, pair it with Claude Opus 5 or Qwen3.7-Max.
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
                  <strong style={{ color: 'var(--mute)' }}>Why Flash Models are Limited for Heavy Philosophy:</strong> High-throughput tiers (Gemini 3.5 Flash-Lite, Claude Haiku 4.5, GPT-5.6 Luna) are built for volume, not for sustained argument. Use them for the mechanical passes — locating sections, checking whether a citation exists, tabulating cross-references — and hand the verdict to a frontier tier. On this corpus that division matters more than usual: 0 of 57 causal-mechanism sections state a defeater, so a fast model asked to &quot;evaluate&quot; a claim has nothing to anchor against and will produce fluent agreement.</p>
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
                ['kimi', 'Moonshot Kimi'],
                ['mistral', 'Mistral AI'],
                ['glm', 'Z.ai GLM'],
                ['grok', 'xAI Grok']
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
          <span className="step-num">Step 06</span>
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

        {/* SECTION 6: MACHINE ENDPOINTS */}
        <div className="step" id="machine-endpoints">
          <span className="step-num">Step 07</span>
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
          <span className="step-num">Step 08</span>
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
