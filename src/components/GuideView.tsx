/**
 * AI Guide — halaman bertab dengan URL sendiri per tab:
 *   #/guide            Start      tiga langkah, memilih alat & model, tanda gagal
 *   #/guide/install    Install    Claude Skill, Custom GPT / Gem / Project
 *   #/guide/prompts    Prompts    prompt pembuka + tujuh peran
 *   #/guide/questions  Questions  delapan contoh pertanyaan
 *   #/guide/dev        Developer  skrip Python, aturan IDE agen
 *   #/guide/endpoints  Endpoints  berkas untuk skrip & crawler, jebakan scraping
 *
 * Direstrukturisasi 2026-09-24. Sebelumnya satu halaman ~12.900px dengan:
 * - matriks ~30 nama model yang harus diverifikasi ulang tiap rilis (komentar
 *   di kodenya sendiri berkata "or remove this section entirely"). Diganti
 *   kriteria memilih model + uji cepat lima menit; kriteria tidak basi.
 * - kutipan seksi yang salah di prompt: T = S·D·P·G diartikan "Structural
 *   Stagnation · Legitimacy Deficit · Material Pressure · Coordinated
 *   Grievance" (naskah §15.4: suffering · duration · geographic spread ·
 *   intergenerational transmission); "Technocratic Drift" dirujuk ke §12.5b
 *   (sebenarnya §12.8); "Custodian Problem" ke §1.6 (sebenarnya §7.3).
 *   Setiap § di berkas ini sudah dicocokkan dengan judul & isi seksinya.
 * - skrip Python yang tak jalan: membaca manifest['corpus_stats'] (kunci
 *   sebenarnya 'statistics') dan memakai model yang sudah pensiun.
 *
 * Tab dikendalikan App (ikut URL), sama seperti RulesPage.
 */
import React, { useEffect, useRef, useState } from 'react'
import type { GuideTab } from '../routing'
import { PageHeader, PageFooter } from './PageHeader'

interface GuideViewProps {
  tab: GuideTab
  onTabChange: (tab: GuideTab) => void
  onBackHome: () => void
  version: string
}

const BASE = 'https://novadharma-hub.github.io/pmn-framework/'

/** Tanggal terakhir isi tab Start (alat & kriteria model) diperiksa. */
const LAST_REVIEWED = '2026-09-24'

const TABS: Array<[GuideTab, string, string]> = [
  ['start', 'Start', '#/guide'],
  ['install', 'Install', '#/guide/install'],
  ['prompts', 'Prompts', '#/guide/prompts'],
  ['questions', 'Questions', '#/guide/questions'],
  ['dev', 'Developer', '#/guide/dev'],
  ['endpoints', 'Endpoints', '#/guide/endpoints'],
]

type RoleKey =
  | 'priming'
  | 'general'
  | 'diagnostic'
  | 'adversarial'
  | 'transformation'
  | 'meaning'
  | 'falsification'
  | 'agent'

const ROLES: Array<[RoleKey, string, string]> = [
  ['priming', 'Priming', 'First message: load the framework'],
  ['general', '1. Structural analyst', 'General structural analysis'],
  ['diagnostic', '2. Capture diagnostician', 'Five-stage capture sequence (§7.3c-i)'],
  ['adversarial', '3. Red team', 'Stress-testing and assumption archaeology (§12.1)'],
  ['transformation', '4. Counter-power', 'Transformation pressure and counter-power (Part XV)'],
  ['meaning', '5. Meaning triage', 'Meaning infrastructure (§5.6b, §5.6c)'],
  ['falsification', '6. Falsifier', 'Evidence audit and falsification'],
  ['agent', '7. Agent system prompt', 'System prompt for an agent or project'],
]

const QUESTIONS: Array<[string, string]> = [
  [
    'Gig work and "flexibility"',
    'Using §3.4, §6.2 and §11.5, evaluate app-based gig work: is participation an exercise of self-authorship, or an adaptation to a degraded set of alternatives? Separate what the evidence shows from what the platforms claim, and say what data would change your answer.',
  ],
  [
    'Regulatory capture',
    'Audit [agency] against the five-stage capture sequence in §7.3c-i. Which stage has it reached? Name the observable signals (§7.3b) behind that judgement and the evidence that would show you are wrong.',
  ],
  [
    'Drug pricing and patents',
    'Apply the suffering variable in §15.3 to pharmaceutical patent thickets. Where is resource deprivation (R) produced, where does the institution fail its stated mandate (B), and how does pricing opacity act as visibility suppression (V)? Use the definitions in §15.0b.',
  ],
  [
    'Recommendation algorithms',
    'Analyse engagement-ranked feeds with §16.2 and §8.4. Do they degrade the conditions for becoming (§4.5c) without touching the biological floor (§3.4)? Keep the two apart, as PMN does, and compare with the platform governance case in §17.5.',
  ],
  [
    'Collapse of civic life',
    'Assess the decline of local civic associations with §5.6b: rate each of the five functional dimensions, classify the infrastructure (robust, brittle, fragmented, depleted), and if it is collapsing, propose triage under §5.6c.',
  ],
  [
    'Who pays for climate transition',
    'Test [climate policy] against §3.4 and §9.5. Do the costs fall on people near the biological floor while those who hold capital stay insulated? What distribution would PMN count as acceptable, and why?',
  ],
  [
    'AI governance',
    'Evaluate an AI governance body with §9.2c, §16.2 and the Custodian Problem (§7.3, §10.14). Who monitors the evaluators, and how could compliance audits drift into Stage 4 capture (objective redefinition)?',
  ],
  [
    'PMN against itself',
    "Apply §12.5, §12.8 and §14.6 to one of PMN's own reform proposals. Is it drifting toward technocracy, being used as legitimation, or at risk of capture by its own community? Apply the diagnostics as strictly as you would to any other institution.",
  ],
]

const ENDPOINTS: Array<{ id: string; format: string; path: string; name: string; desc: string }> = [
  {
    id: 'ep-index',
    format: 'TXT',
    path: 'txt/index.txt',
    name: 'Plain-text section index',
    desc: 'All 235 sections in reading order, each with the URL and size of its own .txt file (largest ~55 KB). Start here.',
  },
  {
    id: 'ep-llms',
    format: 'TXT',
    path: 'llms.txt',
    name: 'llms.txt',
    desc: 'The llmstxt.org discovery file: what PMN is, and links to every Part as plain text.',
  },
  {
    id: 'ep-read',
    format: 'HTML',
    path: 'read/',
    name: 'Static edition',
    desc: 'Every section as a plain HTML page with no JavaScript, e.g. read/7.3c-i.html. For crawlers and for citing a URL.',
  },
  {
    id: 'ep-full',
    format: 'TXT',
    path: 'llms-full.txt',
    name: 'Whole book, one file',
    desc: 'About 2.4 MB, roughly half a million tokens. Most fetchers truncate it; use it only for upload or local processing.',
  },
  {
    id: 'ep-json',
    format: 'JSON',
    path: 'llms.json',
    name: 'llms.json',
    desc: 'Machine-readable manifest: version, licence, statistics, per-Part data endpoints.',
  },
  {
    id: 'ep-gl',
    format: 'JSON',
    path: 'data/gl.json',
    name: 'Glossary',
    desc: '239 defined terms, each with the section it comes from.',
  },
  {
    id: 'ep-sitemap',
    format: 'XML',
    path: 'sitemap.xml',
    name: 'Sitemap',
    desc: 'Every public URL, including all static section pages.',
  },
  {
    id: 'ep-pdf',
    format: 'PDF',
    path: 'PMN_Latest.pdf',
    name: 'Typeset PDF',
    desc: 'The whole book, about 630 pages. Best for NotebookLM and other tools that index uploaded sources.',
  },
]

/**
 * Tingkatan menurut apa yang bisa dibaca alat, bukan merek (2026-09-24).
 * Ukuran dari v126: buku ~2,4 MB (~450k-600k token menurut tokenizer),
 * Part terbesar (X) ~300 KB, seksi terbesar ~53 KB. Model sepintar apa pun
 * dengan jendela 200k tetap tidak bisa memuat seluruh buku; karena itu
 * tingkatan tidak diurutkan menurut nama model.
 */
const REPO = 'https://github.com/novadharma-hub/pmn-framework'

/** Skill yang dibangun scripts/build_skill.py dari skill/<nama>/. */
const SKILLS: Array<{ name: string; does: string; when: string }> = [
  {
    name: 'pmn',
    does: 'The whole manuscript, one file per section, with the index, glossary and analytical roles. Answers from the text with section citations, and sends other kinds of request to the right skill below.',
    when: 'Any question about PMN, including a personal problem, a request for an opinion or a thought experiment. The base for the others.',
  },
  {
    name: 'pmn-diagnose',
    does: 'A structured diagnosis of a real or imagined situation at any scale: a person or workplace, an institution or policy, a country or the international order. Finds the level that produces the outcome, applies its tests, and says what would overturn the diagnosis.',
    when: '"Is this regulator captured?", "Is my situation my fault?", "How much pressure for change is there?"',
  },
  {
    name: 'pmn-strategy',
    does: 'What to do: where the system stands, the counter-power available and its weakest factor, whether a window is open, accommodation or transformation, and realistic options.',
    when: '"How do we push this change?", "Reform or something bigger?", "When should we act?"',
  },
  {
    name: 'pmn-learn',
    does: 'Teaches PMN from the text, one section at a time: plain explanation, the key sentence, an example, a question to check understanding, what to read next.',
    when: '"Teach me PMN from the start", "I have an hour", "Is PMN just Marxism?"',
  },
  {
    name: 'pmn-critic',
    does: "Questions PMN's ideas: the strongest objections to its arguments and assumptions, whether a criticism lands or misreads, unfalsifiable claims, blind spots.",
    when: '"Is PMN convincing?", "Is this critic right?", "What would prove PMN wrong?"',
  },
]

type TierId = 'agent' | 'whole' | 'part' | 'section' | 'notebook'
const TIERS: Array<{ id: TierId; badge: string; name: string; needs: string; give: string; good: string; limit: string }> = [
  {
    id: 'agent', badge: 'A', name: 'Agent with file access',
    needs: 'A coding or research agent that can read files or fetch URLs (for example Claude Code, Codex, Cursor).',
    give: 'The PMN skill (see Install), the repository (clone it), or the per-section files in txt/. The agent searches first, then reads only what it needs.',
    good: 'The deepest work: questions that cross many Parts, with exact quotations. Size is no limit because nothing is loaded at once.',
    limit: 'It must open a section before citing it. Ask it to show which files it read.',
  },
  {
    id: 'whole', badge: 'B', name: 'Whole book in one conversation',
    needs: 'A context window of about 1 million tokens, so the book fits with room to work.',
    give: 'llms-full.txt (plain text) or the PDF.',
    good: 'Questions that connect distant Parts, in an ordinary chat.',
    limit: 'Long contexts blur: ask for the sentence behind each claim. Near the window limit, drop to tier C.',
  },
  {
    id: 'part', badge: 'C', name: 'One to three Parts',
    needs: 'A context window of about 128k tokens or more (the largest Part is roughly 65k–80k).',
    give: 'The Part files for your topic (txt/part_VII.txt and so on).',
    good: 'Working through one theme in depth: capture (VII), the formulas (XV), meaning (V).',
    limit: 'The model cannot see other Parts. It should say which section to add rather than guess.',
  },
  {
    id: 'section', badge: 'D', name: 'A few sections',
    needs: 'Any model, including free tiers and small local models.',
    give: 'One to three section files from txt/index.txt, pasted in full.',
    good: 'One focused question; checking a single claim.',
    limit: 'Easy to overreach: the model should stop and ask for more sections instead of filling gaps.',
  },
  {
    id: 'notebook', badge: 'N', name: 'Source-grounded notebook',
    needs: 'A tool that indexes uploads and cites passages (for example NotebookLM).',
    give: 'The PDF as a source.',
    good: 'Checking what the text actually says; its answers link to the passage.',
    limit: 'Retrieves passages rather than reading the whole: weaker at connecting distant Parts.',
  },
]

export default function GuideView({ tab, onTabChange, onBackHome, version }: GuideViewProps) {
  const [role, setRole] = useState<RoleKey>('priming')
  const [copied, setCopied] = useState<string | null>(null)
  const scrollRef = useRef<HTMLDivElement>(null)

  // Tab baru mulai dari atas, seperti halaman baru.
  useEffect(() => {
    scrollRef.current?.scrollTo({ top: 0 })
  }, [tab])

  const copyText = (id: string, text: string) => {
    navigator.clipboard
      .writeText(text)
      .then(() => {
        setCopied(id)
        setTimeout(() => setCopied(c => (c === id ? null : c)), 2000)
      })
      .catch(() => {
        window.prompt('Copy text manually:', text)
      })
  }

  // Tab adalah tautan sungguhan (bisa dibuka di tab baru / disalin), tapi
  // klik biasa langsung mengubah state tanpa menunggu hashchange.
  const goTab = (t: GuideTab) => (e: React.MouseEvent) => {
    if (e.metaKey || e.ctrlKey || e.shiftKey || e.button !== 0) return
    e.preventDefault()
    onTabChange(t)
  }

  const prompts: Record<RoleKey, string> = {
    priming: `I am attaching PMN (Progressive Materialist Naturalism) v${version} by Nova Dharma. Read it as a framework to reason with, not a document to summarise.

Internalise its architecture:
1. Epistemology (Part I): probabilistic determinism (§1.3); information asymmetry as structural power (§1.10).
2. Ontology (Part II): material reality is primary; emergent structures such as institutions are causally real (§2.4).
3. The biological floor (Part III): the minimal anchor in sentient vulnerability and structural suffering (§3.4).
4. Value (Part IV): protecting the floor while keeping the horizon of becoming open (§4.5, §4.5c).
5. Power and capture (Parts VI and VII): power as structural position (§6.2), asymmetry and capture (§6.3), the five-stage capture sequence (§7.3c-i).
6. The compressed core (§15.15).

Rules for every answer:
- Reason from inside the framework, not about it from outside.
- Keep the biological floor and the open horizon of becoming distinct.
- Cite section numbers (e.g. §3.4, §7.3c-i) for every mechanism you use.
- Name the missing evidence and what would falsify a claim before giving a verdict.
- If the text does not address something, say so. Do not fill the gap with your own assumptions.

Confirm in under 150 words how Parts I, II and III give the framework its non-arbitrary starting point.`,

    general: `From now on, work as a PMN structural analyst. Reason from inside Progressive Materialist Naturalism rather than describing it.

For each scenario, institution or public claim:
1. Identify the material arrangement and the resource flows beneath the public narrative.
2. Trace how power and information are distributed (§6.2, §6.3).
3. Assess effects on the biological floor (§3.4) and, separately, on the conditions for becoming (§4.2).
4. Separate what the evidence supports from what is merely plausible or self-serving.
5. Name the failure mode most likely to distort this analysis (§12.5).

Cite section numbers whenever you use a PMN mechanism. Prefer structural precision to diplomatic balance.`,

    diagnostic: `Work as a PMN capture diagnostician. Test organisations, regulators or doctrinal bodies for institutional capture.

For each case:
1. Test against the five-stage sequence in §7.3c-i:
   (1) Access Asymmetry
   (2) Decision-Filter Capture & Preference Expression
   (3) Personnel Alignment
   (4) Objective Redefinition & Output Reorientation
   (5) Accountability Capture & Consolidation
   Stages can overlap or stall; say which evidence places the case at each stage.
2. List the early-detection signals present (§7.3b).
3. Identify how the institution preserves itself against correction (§6.5).
4. Identify who bears the material costs when the institution fails.
5. Apply the diagnostics regardless of the institution's ideology or stated mission (§12.5).
6. End with the observation that would falsify your diagnosis.

Do not call an institution healthy when its transparency mechanisms are themselves captured.`,

    adversarial: `Work as a PMN red team. The goal is pressure-testing and assumption archaeology (§12.1, §12.1c), not winning.

For a PMN analysis, reform proposal or policy:
1. Build the strongest counter-argument to the PMN position.
2. List the unstated empirical assumptions and unverified data it relies on.
3. Test for technocratic drift (§6.4, §12.8): does the proposal hand power to unaccountable experts in the name of optimisation?
4. Test for the cost of inaction (§1.5): does demanding more diagnostic precision delay action that the floor requires now?
5. Check the language for phrases that close analysis early, "essentially" and "should" (§12.5b).
6. State what historical or empirical evidence would force PMN to revise its position.

Do not concede points for the sake of politeness.`,

    transformation: `Work as a PMN counter-power strategist. Use Part X (how systems change) and Part XV (the formula architecture).

For a proposed transformation or reform:
1. Transformation pressure (§15.2, §15.4): T = S × D × P × G
   S = structural suffering, D = duration, P = geographic spread (population scale), G = intergenerational transmission.
   Characterise each variable; they multiply, they do not add. Compare T with the system's threshold (§10.5).
2. Counter-power capacity (§15.8): CP = (O × N × Rs × W) × (1 − Rp − Cf). Which factor is the bottleneck?
3. How counter-power accumulates without early neutralisation or co-optation (§10.9).
4. Sequencing: reform, revolution, and in what order (§10.6); organisational form (§10.8).
5. After success: how the new institution avoids capture by its own leadership (§7.3d, §10.14, and the case in §17.4).`,

    meaning: `Work as a PMN meaning-infrastructure analyst (Part V).

For cultural distress, alienation or institutional breakdown:
1. Rate the five functional dimensions (§5.6b):
   - ritual participation density
   - narrative coherence and absorption capacity
   - grief and loss processing capacity
   - collective action and solidarity coordination
   - intergenerational transmission fidelity
2. Apply the three diagnostic lenses (§5.6b): the transmission test; shock absorption and interpretive adaptability; harmful-narrative susceptibility.
3. Classify the infrastructure: robust, brittle, fragmented, or depleted/collapsing.
4. If it is in acute collapse, propose triage under §5.6c, grounded in material mutual aid.`,

    falsification: `Work as a PMN evidence auditor.

For any claim, policy or empirical finding:
1. Place it in PMN's tiers (§14.3): foundational axiom, structural commitment, or empirical hypothesis. Only empirical claims can be settled by data.
2. Check it against the biological floor (§3.4): does it treat preventable suffering as an acceptable trade-off?
3. If it uses the primary formula (§15.2), check that the variables are treated as multiplying, not adding.
4. Audit the evidence: controlled study, correlation, self-report, or institutional public relations?
5. Where data is missing, estimate the deficit explicitly (§12.5e) rather than guessing.
6. State the falsification condition: "This diagnosis would be wrong if [specific, observable result]."
7. Rate your confidence and say why.`,

    agent: `You are an assistant grounded in Progressive Materialist Naturalism (PMN) v${version} by Nova Dharma.

Source:
- The text is at ${BASE}txt/index.txt (one plain-text file per section). Fetch the sections you need; do not rely on memory of the framework.
- Never invent section numbers or titles. The book has a Preface, Parts I–XVII, a Coda, Intellectual Debts and a Bibliography. If a section is not in the index, it does not exist.

Analysis:
- Evaluate human systems by their material foundations, information asymmetries, and effects on the biological floor and on becoming.
- Do not confuse stated intent with structural incentive.
- Address the Custodian Problem (§7.3, §10.14): who monitors the monitors, and with what leverage?

For each answer:
1. Name the relevant sections (§X.Y) and quote the sentences you rely on.
2. Give the structural diagnosis.
3. State the uncertainties and what would falsify the conclusion.`,
  }

  const harness = `# Minimal PMN audit script: fetch one section as plain text, ask Claude about it.
# pip install anthropic   ·   export ANTHROPIC_API_KEY=...
import urllib.request
import anthropic

BASE = "${BASE}"
SECTION = "7.3c-i"  # any id listed in txt/index.txt

with urllib.request.urlopen(f"{BASE}txt/{SECTION}.txt") as resp:
    section_text = resp.read().decode("utf-8")

SYSTEM = f"""You analyse institutions with Progressive Materialist Naturalism (PMN).
Ground every claim in the section text below and cite section numbers (e.g. §7.3c-i).
Evaluate institutions by material incentives, not stated intentions.
If the text does not cover something, say so.

<pmn_section id="{SECTION}">
{section_text}
</pmn_section>"""

client = anthropic.Anthropic()

# Server-side fallbacks: if the model is overloaded or unavailable, the API
# retries on a fallback model instead of failing. Remove both lines to opt out.
with client.beta.messages.stream(
    model="claude-opus-5",
    max_tokens=16000,
    thinking={"type": "adaptive"},
    betas=["server-side-fallback-2026-07-01"],
    fallbacks="default",
    system=SYSTEM,
    messages=[{
        "role": "user",
        "content": "Audit [institution] against the five-stage capture sequence. "
                   "Which stage has it reached, and what evidence would falsify that?",
    }],
) as stream:
    response = stream.get_final_message()

if response.stop_reason == "refusal":
    print("Declined:", response.stop_details)
else:
    print("".join(b.text for b in response.content if b.type == "text"))
`

  const ideRule = `Ground analysis of institutions in PMN (Progressive Materialist Naturalism) v${version}.
Text: ${BASE}txt/index.txt - fetch the sections you need, one plain-text file each.
Cite section numbers; never invent one that is not in the index.
Evaluate institutions by material incentives and the five-stage capture sequence (§7.3c-i), not by stated intentions.`

  const tierPrompts: Partial<Record<TierId, string>> = {
    agent: `You have file access. Work from the text of Progressive Materialist Naturalism (PMN) v${version}, not from memory.

1. Get the text: clone https://github.com/novadharma-hub/pmn-framework (read-only) and search pmn_corpus_for_ai.md, where each section starts with "#### Section <id> — <title>". Or fetch the sections you need from ${BASE}txt/index.txt.
2. Search first (key terms, section ids), then read every section you will rely on in full.
3. Cite the section id for each claim and quote the sentence you rely on. Never cite a section you have not opened.
4. List the files or sections you read at the end.
5. If the text does not address something, say so.

Question: [your question]`,
    whole: `I am attaching the complete text of PMN (Progressive Materialist Naturalism) v${version}. Use only this text.

Before answering, list the sections you will rely on (id and title). Then answer, citing the section id for each claim and quoting the sentence behind each key claim. Where the text is silent, say so. Where Parts pull in different directions, show the tension instead of resolving it (Part XIII keeps some tensions open on purpose).

Question: [your question]`,
    part: `I am attaching Part [X] of PMN (Progressive Materialist Naturalism) v${version}, not the whole book. Answer only from what is attached.

If the question needs another Part, name the section ids I should add (from ${BASE}txt/index.txt) instead of guessing what they say. Cite section ids and quote the sentence you rely on.

Question: [your question]`,
    section: `Below are sections [ids] of PMN (Progressive Materialist Naturalism) v${version}, pasted in full. Answer only from them.

If they are not enough, say which other sections to paste (ids from ${BASE}txt/index.txt) and stop there. Quote the sentence behind each claim.

[paste the sections here]

Question: [your question]`,
  }

  const assistantRule = `You answer questions about Progressive Materialist Naturalism (PMN) v${version}, a philosophical framework by Nova Dharma. The full text is in your knowledge files: in llms-full.txt every section starts with a line "#### Section <id> — <title>".

How to answer:
1. Search the knowledge files for the concepts in the question before answering. Never answer about PMN from memory: it is recent, and memory produces generic materialism with PMN's words pasted on.
2. Cite the section id (for example §7.3c-i) for each claim and quote the sentence it rests on for the key ones. Only cite a section you have found in the files.
3. If the files do not address something, say so. Do not fill the gap with a position PMN does not state.
4. Judge institutions by material incentives and structural position, not by stated intentions. Keep open the tensions the text leaves open (Part XIII) instead of smoothing them into a compromise.
5. For a diagnosis, say what evidence would change it.
6. The manuscript is being revised and sometimes contradicts itself (for example, §15.4 uses G for two different things). Use the reading that keeps the argument coherent (an explicit definition over a later passing use) and answer from it without commenting on the inconsistency, unless a quote you give reads differently or the conclusion depends on it.

Answer in the user's language (English if unclear). Search the files in English, since the text is English; keep section ids and quoted sentences in the original English and translate key quotes. End analytical answers with the sections you relied on.

Licence: CC BY-SA 4.0. Credit "Progressive Materialist Naturalism by Nova Dharma" and link ${BASE}`

  const ccPlugin = `/plugin marketplace add novadharma-hub/pmn-framework
/plugin install pmn@pmn-framework`

  const npxSkills = `npx skills add novadharma-hub/pmn-framework`

  const copyBtn = (id: string, text: string, label = 'Copy') => (
    <button type="button" className={`copy-btn ${copied === id ? 'copied' : ''}`} onClick={() => copyText(id, text)}>
      {copied === id ? 'Copied' : label}
    </button>
  )

  return (
    <div
      id="guide-view"
      className="view on"
      ref={scrollRef}
      style={{ position: 'absolute', inset: 0, overflowY: 'auto', WebkitOverflowScrolling: 'touch', background: 'var(--bg)' }}
    >
      <PageHeader title="AI Guide" subtitle=" — Using PMN with AI" onBack={onBackHome} />
      <div className="pg-col pg-col-text">
        <div className="pg-intro">
          <div className="pg-eyebrow">PMN v{version} &middot; AI Guide</div>
          <h1 className="pg-h1">Using PMN with AI</h1>
          <p className="pg-lede">
            How to give a model the actual text, the prompts that keep it grounded, and the files for scripts and crawlers.
          </p>
        </div>

        <nav aria-label="AI Guide sections" className="pg-tabs pg-tabs-6">
          {TABS.map(([key, label, href]) => (
            <a
              key={key}
              href={href}
              className="pg-tab"
              aria-current={tab === key ? 'page' : undefined}
              onClick={goTab(key)}
            >
              {label}
            </a>
          ))}
        </nav>

        <div className="guide-page">
          {tab === 'start' && (
            <>
              <section className="step">
                <p>
                  A model that has not been given PMN's text will guess. The framework is recent and specific, so the guess is usually generic
                  materialism or Marxism with PMN's vocabulary pasted on. Everything on this page comes down to one rule:{' '}
                  <strong>put the text in front of the model, then make it cite.</strong>
                </p>
              </section>

              <section className="step">
                <span className="step-num">Three steps</span>
                <h2 className="step-h2">Getting a grounded answer</h2>
                <ol className="guide-list guide-list-num">
                  <li>
                    <strong>Give it the text, as much as your tool can hold.</strong> The whole book is about half a million tokens (roughly
                    450k–600k, depending on the model's tokenizer), more than most chat windows hold. The tiers below say what to give each kind of
                    tool.
                  </li>
                  <li>
                    <strong>Prime it.</strong> Use the starter prompt for your tier, or the{' '}
                    <a href="#/guide/prompts" onClick={goTab('prompts')}>priming prompt</a> as the first message. Both ask the model to reason inside
                    the framework, cite section numbers, and admit when the text is silent.
                  </li>
                  <li>
                    <strong>Ask a precise question.</strong> Name the institution, the sections, and what evidence would change the answer. See the{' '}
                    <a href="#/guide/questions" onClick={goTab('questions')}>example questions</a>.
                  </li>
                </ol>
              </section>

              <section className="step">
                <span className="step-num">Tiers</span>
                <h2 className="step-h2">What your tool can hold decides the method</h2>
                <p>
                  Tiers are set by what a tool can read, not by brand: a very capable model with a small context window still cannot hold the whole
                  book. Pick the highest tier your tool supports.
                </p>
                <div className="guide-tiers">
                  {TIERS.map(t => (
                    <div className="guide-tier" key={t.id}>
                      <div className="guide-tier-hdr">
                        <span className="guide-tier-badge">{t.badge}</span>
                        <h3>{t.name}</h3>
                      </div>
                      <dl className="guide-tier-dl">
                        <dt>Needs</dt><dd>{t.needs}</dd>
                        <dt>Give it</dt><dd>{t.give}</dd>
                        <dt>Good for</dt><dd>{t.good}</dd>
                        <dt>Watch for</dt><dd>{t.limit}</dd>
                      </dl>
                      {tierPrompts[t.id] && (
                        <details className="guide-tier-prompt">
                          <summary>Starter prompt</summary>
                          <div className="code-block">
                            <span className="code-label">{t.name}</span>
                            {copyBtn('tier-' + t.id, tierPrompts[t.id])}
                            <div className="code-text">{tierPrompts[t.id]}</div>
                          </div>
                        </details>
                      )}
                    </div>
                  ))}
                </div>
                <p className="guide-small">
                  Sizes measured on v{version}: whole book about 2.4 MB of text; largest Part (X) about 300 KB, roughly 65k–80k tokens; largest
                  section about 53 KB, roughly 12k–14k tokens; median section about 8 KB. Product limits change often; check each tool's own
                  documentation.
                </p>
              </section>

              <section className="step">
                <span className="step-num">Within a tier</span>
                <h2 className="step-h2">Is the model any good at this?</h2>
                <p>
                  This page names no models: lists of them go stale within months. Within your tier, look for a model that:
                </p>
                <ul className="guide-list">
                  <li><strong>Quotes accurately.</strong> Asked for the sentence behind a claim, it gives one you can find in the text.</li>
                  <li><strong>Keeps tensions open.</strong> PMN deliberately leaves some tensions unresolved (Part XIII). A good model does not smooth them into a compromise.</li>
                  <li><strong>Admits gaps.</strong> It says "the text does not address this" instead of inventing a PMN position.</li>
                  <li><strong>Holds the frame.</strong> Ten turns in, it still cites sections and still judges by incentives, not intentions.</li>
                </ul>
                <div className="note-box">
                  <span className="note-label">Five-minute test</span>
                  Give the model the text, then ask three questions with known answers:
                  <ol className="guide-list guide-list-num">
                    <li>
                      "List the five stages in §7.3c-i." <em>Access Asymmetry; Decision-Filter Capture; Personnel Alignment; Objective Redefinition;
                      Accountability Capture.</em>
                    </li>
                    <li>
                      "What do S, D, P and G stand for in §15.4?" <em>Structural suffering, duration, geographic spread, intergenerational transmission.</em>
                    </li>
                    <li>
                      "Which section says the capture diagnostics apply regardless of ideology?" <em>§12.5.</em>
                    </li>
                  </ol>
                  A model that gets these wrong with the text in front of it will get harder questions wrong too.
                </div>
                <p className="guide-small">Last reviewed {LAST_REVIEWED}.</p>
              </section>

              <section className="step">
                <span className="step-num">Warning signs</span>
                <h2 className="step-h2">When it isn't working</h2>
                <ul className="guide-list">
                  <li>
                    <strong>No section numbers,</strong> or numbers that are not in{' '}
                    <a href={BASE + 'txt/index.txt'} target="_blank" rel="noopener noreferrer">the index</a>. The model is not reading the text.
                  </li>
                  <li><strong>Everyone has a point.</strong> A balanced compromise where the framework would name a structural cause.</li>
                  <li><strong>Judging by intentions.</strong> Taking an institution's stated mission as evidence of what it does.</li>
                  <li><strong>Generic materialism.</strong> Marxist or physicalist stock phrases that PMN explicitly distinguishes itself from (§2.6c, §10.7).</li>
                  <li><strong>Drift.</strong> The persona fades after a few turns. Re-send the priming prompt, or put it in project instructions.</li>
                </ul>
              </section>

              <div className="closing">
                A good PMN deployment makes the model more disciplined, not more eloquent. If an answer sounds smooth and agreeable while the structural
                variables and section references fade away, it has failed. Keep the text loaded, give it a role, and ask what would prove it wrong.
              </div>
            </>
          )}

          {tab === 'install' && (
            <>
              <section className="step">
                <p>
                  Set PMN up once instead of pasting the text into every chat. Two ways, depending on the tool. Both carry a copy of v{version}: when
                  the version on this site changes, update or download again.
                </p>
              </section>

              <section className="step">
                <span className="step-num">Claude, Codex, OpenCode, Cursor and other agents</span>
                <h2 className="step-h2">Install the PMN skills</h2>
                <p>
                  A skill is a folder of instructions and files that the model opens only when a question needs it. There are five, and they work
                  together:
                </p>
                <div className="guide-table-wrap">
                  <table className="guide-table">
                    <thead>
                      <tr><th>Skill</th><th>What it does</th><th>Use it when</th></tr>
                    </thead>
                    <tbody>
                      {SKILLS.map(s => (
                        <tr key={s.name}>
                          <td><code>{s.name}</code></td>
                          <td>{s.does}</td>
                          <td>{s.when}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                <p className="guide-small">
                  Only <code>pmn</code> carries the manuscript. The others read it from there, so install <code>pmn</code> in every case. Without
                  it they fetch sections from GitHub or this site, which always hold the latest edition.
                </p>

                <h3 className="guide-h3">Claude Code</h3>
                <div className="code-block">
                  <span className="code-label">In a Claude Code session</span>
                  {copyBtn('cc-plugin', ccPlugin)}
                  <pre className="code-text code-pre">{ccPlugin}</pre>
                </div>

                <h3 className="guide-h3">Codex, OpenCode, Cursor, Gemini CLI and others</h3>
                <p>
                  The <code>skills</code> installer copies the folders into each agent's skills directory. Add <code>-g</code> to install for every
                  project instead of the current one.
                </p>
                <div className="code-block">
                  <span className="code-label">Terminal</span>
                  {copyBtn('npx-skills', npxSkills)}
                  <pre className="code-text code-pre">{npxSkills}</pre>
                </div>

                <h3 className="guide-h3">Claude apps (web, desktop)</h3>
                <p>
                  In Claude's settings, open the Skills section and upload each zip as it is, <code>pmn</code> first. Skills need code execution to be
                  switched on. Menu names move between releases; Claude's help pages have the current steps.
                </p>
                <p className="guide-dl-row">
                  <a className="guide-dl" href="pmn-skill.zip" download>pmn-skill.zip</a>
                  <a className="guide-dl" href="pmn-diagnose.zip" download>pmn-diagnose.zip</a>
                  <a className="guide-dl" href="pmn-strategy.zip" download>pmn-strategy.zip</a>
                  <a className="guide-dl" href="pmn-learn.zip" download>pmn-learn.zip</a>
                  <a className="guide-dl" href="pmn-critic.zip" download>pmn-critic.zip</a>
                </p>
                <p className="guide-small">
                  The first is about 0.9 MB (the whole manuscript); the others are a few KB each. Any other agent that reads the Agent Skills format can
                  use the same folders: unzip them side by side in its skills directory. Source:{' '}
                  <a href={REPO + '/tree/main/plugins/pmn/skills'} target="_blank" rel="noopener noreferrer">plugins/pmn/skills</a>.
                </p>
                <p className="guide-small">
                  Test with the five-minute test on the <a href="#/guide" onClick={goTab('start')}>Start tab</a>. The skills work best where the model
                  can run commands and search files; it still has to open a section before citing it.
                </p>
              </section>

              <section className="step">
                <span className="step-num">ChatGPT, Gemini, Claude Projects</span>
                <h2 className="step-h2">Make a PMN assistant</h2>
                <p>
                  A Custom GPT, a Gemini Gem or a Claude Project keeps the text and the instructions in one place, so every new chat starts grounded.
                </p>
                <ol className="guide-list guide-list-num">
                  <li>Create the GPT, Gem or Project.</li>
                  <li>Paste the instructions below into its instructions field.</li>
                  <li>
                    Upload <a href={BASE + 'llms-full.txt'} target="_blank" rel="noopener noreferrer">llms-full.txt</a> (2.4 MB, the whole book) as a
                    knowledge file. If the tool refuses it as too large, upload the Part files for your topic instead (listed in{' '}
                    <a href={BASE + 'txt/index.txt'} target="_blank" rel="noopener noreferrer">txt/index.txt</a>).
                  </li>
                </ol>
                <div className="code-block">
                  <span className="code-label">Instructions</span>
                  {copyBtn('assistant-rule', assistantRule)}
                  <div className="code-text">{assistantRule}</div>
                </div>
                <div className="note-box">
                  <span className="note-label">What to expect</span>
                  These tools usually search the uploaded file rather than read all of it, like a notebook (tier N on the Start tab). They are good at
                  finding what the text says and weaker at connecting distant Parts. For questions that cross the whole book, use an agent with the
                  skill or a model that holds the whole book (tiers A and B).
                </div>
              </section>
            </>
          )}

          {tab === 'prompts' && (
            <section className="step">
              <p>
                Send <strong>Priming</strong> first, together with the text. Then pick a role: a specific job suppresses polite evasion better than a
                general request. Every section number in these prompts has been checked against the text.
              </p>
              <div className="variants">
                <div className="vtabs" role="tablist" aria-label="Prompt roles">
                  {ROLES.map(([key, label]) => (
                    <button
                      key={key}
                      type="button"
                      role="tab"
                      aria-selected={role === key}
                      className={`vtab ${role === key ? 'active' : ''}`}
                      onClick={() => setRole(key)}
                    >
                      {label}
                    </button>
                  ))}
                </div>
                <div className="code-block" role="tabpanel">
                  <span className="code-label">{ROLES.find(r => r[0] === role)?.[2]}</span>
                  {copyBtn('role-' + role, prompts[role])}
                  <div className="code-text">{prompts[role]}</div>
                </div>
              </div>
            </section>
          )}

          {tab === 'questions' && (
            <section className="step">
              <p>
                Vague questions get vague summaries. A good question names the arrangement, the sections to apply, and the evidence that would change the
                answer. Replace the bracketed parts with your own case.
              </p>
              <div className="question-grid">
                {QUESTIONS.map(([name, q], i) => (
                  <div className="question-card" key={name}>
                    <div className="question-name">{i + 1}. {name}</div>
                    <div className="question-note">{q}</div>
                    <button type="button" className="guide-copy-inline" onClick={() => copyText('q' + i, q)}>
                      {copied === 'q' + i ? 'Copied' : 'Copy'}
                    </button>
                  </div>
                ))}
              </div>
            </section>
          )}

          {tab === 'dev' && (
            <>
              <section className="step">
                <span className="step-num">Python</span>
                <h2 className="step-h2">A minimal audit script</h2>
                <p>
                  Fetches one section as plain text and sends it to the model with your question. The text is fetched fresh each time, so the script
                  always uses the current edition. Swap <code>SECTION</code> for any id in{' '}
                  <a href={BASE + 'txt/index.txt'} target="_blank" rel="noopener noreferrer">txt/index.txt</a>; for several sections, fetch each and
                  put them all inside the tags.
                </p>
                <div className="code-block">
                  <span className="code-label">pmn_audit.py</span>
                  {copyBtn('harness', harness)}
                  <pre className="code-text code-pre">{harness}</pre>
                </div>
                <p className="guide-small">
                  The same pattern works with any provider's SDK: fetch the section, put it in the system prompt, ask. Model names date quickly; check
                  the provider's current model list.
                </p>
              </section>

              <section className="step">
                <span className="step-num">Agentic IDEs</span>
                <h2 className="step-h2">A rule for coding agents</h2>
                <p>
                  For Claude Code, Cursor and similar tools, add this to <code>CLAUDE.md</code>, <code>AGENTS.md</code> or the tool's rules file:
                </p>
                <div className="code-block">
                  <span className="code-label">Workspace rule</span>
                  {copyBtn('ide', ideRule)}
                  <div className="code-text">{ideRule}</div>
                </div>
              </section>

              <section className="step">
                <span className="step-num">Other setups</span>
                <h2 className="step-h2">Gateways, local UIs, open-weight models</h2>
                <ul className="guide-list">
                  <li>
                    <strong>Multi-provider gateways</strong> (OpenRouter, LiteLLM) let one script try several models. Useful for running the five-minute
                    test on each.
                  </li>
                  <li>
                    <strong>Self-hosted chat interfaces</strong> (Open WebUI, LibreChat) with your own API keys keep the conversation history on your
                    machine.
                  </li>
                  <li>
                    <strong>Open-weight models</strong> run locally only at small sizes. Test them before trusting them: smaller models are the most
                    likely to invent section numbers.
                  </li>
                </ul>
              </section>
            </>
          )}

          {tab === 'endpoints' && (
            <>
              <section className="step">
                <p>
                  Static files for scripts, retrieval pipelines and crawlers. They are plain files on GitHub Pages: no JavaScript needed, and any origin
                  can fetch them.
                </p>
                <div className="workflow-grid">
                  {ENDPOINTS.map(ep => (
                    <div key={ep.id} className="workflow-card guide-ep">
                      <div className="guide-ep-top">
                        <span className="guide-ep-fmt">{ep.format}</span>
                        <a href={BASE + ep.path} target="_blank" rel="noopener noreferrer">Open &rarr;</a>
                      </div>
                      <div className="workflow-name">{ep.name}</div>
                      <div className="workflow-note">{ep.desc}</div>
                      <div className="guide-ep-foot">
                        <code>{ep.path}</code>
                        <button type="button" className="guide-copy-inline" onClick={() => copyText(ep.id, BASE + ep.path)}>
                          {copied === ep.id ? 'Copied' : 'Copy URL'}
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </section>

              <section className="step">
                <span className="step-num">Pitfalls</span>
                <h2 className="step-h2">Why pasting the site link often fails</h2>
                <ul className="guide-list">
                  <li>
                    <strong>This reader is a JavaScript app.</strong> Most crawlers do not run JavaScript, so from the main URL they get only a contents
                    list, not the prose. Point them at <code>llms.txt</code>, <code>txt/index.txt</code> or the static pages under <code>read/</code>.
                  </li>
                  <li>
                    <strong>Everything after # is dropped.</strong> A link like <code>#/s/1.3</code> reaches a crawler as the home page. Use{' '}
                    <code>txt/1.3.txt</code> or <code>read/1.3.html</code> instead.
                  </li>
                  <li>
                    <strong>Big files get cut off.</strong> Many fetchers stop after a few hundred KB, often inside the glossary of the one-file edition.
                    Fetch sections, not the whole book.
                  </li>
                  <li>
                    <strong>A title is not the text.</strong> When a model sees "Progressive Materialist Naturalism" but not the body, it fills in from
                    similar-sounding frameworks. Ask it to quote before it concludes.
                  </li>
                </ul>
              </section>
            </>
          )}

          <section className="guide-about">
            <h2 className="step-h2">About this site</h2>
            <p>
              The reader for <em>Progressive Materialist Naturalism</em> v{version} by Nova Dharma. Source, history and releases are on{' '}
              <a href="https://github.com/novadharma-hub/pmn-framework" target="_blank" rel="noopener noreferrer">GitHub</a>. It is a static site: no
              accounts, no server-side database, no tracking.
            </p>
          </section>
        </div>
      </div>
      <PageFooter version={version} />
    </div>
  )
}
