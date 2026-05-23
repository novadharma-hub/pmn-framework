# PMN Framework — Changelog
*Track all edits per version. Upload alongside DOCX + index.*

---

## v103 (April 2026)
**Source:** v102 → v103
**Session:** Consistency audit + rebranding prompt response

### Changes Made
| # | Location | Change | Para ID / Line |
|---|----------|--------|----------------|
| 1 | 15.14 intro | "three cases" → "four cases"; config list updated to name all four cases explicitly | Line ~75507 |
| 2 | 12.7 geographic bias note | "three applied cases...Tunisia, Belarus, Argentina" → "four applied cases...Tunisia, Belarus, Argentina, and Indonesia" | Line ~57660 |
| 3 | Case D heading (15.14) | Spacing `before=360, after=160` → `before=280, after=60` (match Cases A/B/C) | `34415D7C` |
| 4 | Case D heading (15.14) | Font color `374151` (gray) → `1D4ED8` (blue, match Cases A/B/C) | `34415D7C` |
| 5 | Title block | Version "95.0" → "103" | Line 93 |

### Issues Identified but NOT Changed
- Rebranding prompt (AMP/DM/AMF/SRP): **Rejected** — see rationale in session notes
- 3.11 "three cases below": intentionally three (A=inequality/collapse, B=cognitive limits, C=environmental) — different section from 15.14, do NOT change

---

## v102
**Source:** v101 (or earlier)
**Session:** Unknown — pre-audit baseline

### Known State at v102
- Version number in body: "95.0" (stale — fixed in v103)
- 15.14 had 4 cases (A/B/C/D) but intro text said "three"
- Geographic bias note (12.7) still referenced only three cases
- Case D spacing/color inconsistent with A/B/C

---

## v76 (historical reference)
Changes from v75:
- Full body justification across ~2,648 paragraphs
- Some subheading font size reductions
- Deletion of empty spacer paragraphs
- Version number updated

---

## Pending / Backlog
*(Add future edit requests here)*

| Priority | Location | Change Needed | Notes |
|----------|----------|---------------|-------|
| — | — | — | — |

---

## Structural Notes for Future Edits

### TOC entries: do they auto-update?
The TOC in this document uses Word's field codes. After repacking, **open in Word and press F9** (or right-click TOC → Update Field) to refresh page numbers. The XML edits do not automatically update TOC page numbers.

### Case heading pattern (15.14)
All four cases (A/B/C/D) should share:
- `w:before="280" w:after="60"`
- `w:color w:val="1D4ED8"` (blue)
- `w:b/` (bold)
- `w:sz w:val="28"` (14pt)
- Stand-alone paragraph (not inline within body text)

### Case heading pattern (3.11)
Cases A/B/C in section 3.11 are **inline bold** within body paragraphs — different pattern, intentionally different from 15.14.

### Version numbering convention
File naming: `PMN_Framework_vXXX.docx`
Body version: `Version XXX • 2026`
Keep both in sync.

---

## v104 (April 2026)
**Source:** v103 → v104
**Session:** Substantive additions — formula closure, live case update, structural fix

### Changes Made
| # | Location | Change | Para ID / Line |
|---|----------|--------|----------------|
| 1 | 15.0b — V definition | Extended with Symbolic Violence (Bourdieu): primitive V (external suppression) vs advanced V (internalised/symbolic violence via meritocracy narrative 8.4c) | Line ~61441 |
| 2 | 15.0b — B definition | Added scope note: B presupposes normative contract; arrangements without prior promise require E variable; see 3.4 + Intellectual Debts | Line ~61412 |
| 3 | 15.0b — new definitions | Added 3 canonical definitions after Layer/Level, before 15.2: W (Coalition Width, paraId 2DA5B110), If (Institutional Fragmentation, paraId 2DA5B111), E (Absolute Structural Exclusion, paraId 2DA5B112) | After line ~61665 |
| 4 | 15.14 — Argentina Case C | Added Milei/2024 live update paragraph after diagnostic callout | paraId 2DA5B120 |
| 5 | **STRUCTURAL FIX** — Case D position | Moved Case D from inside Part XVI (between 16.2 and 16.3) to correct position in 15.14 (after Milei paragraph, before "Parts of this will be wrong" 45513707) | paraId 34415D7C |

### Paragraph count
v103: 3318 → v104: 3322 (+4 new paragraphs: W, If, E definitions + Milei paragraph)

### Key new Para IDs
| Para ID | Content |
|---------|---------|
| `2DA5B110` | W — Coalition Width definition |
| `2DA5B111` | If — Institutional Fragmentation definition |
| `2DA5B112` | E — Absolute Structural Exclusion definition |
| `2DA5B120` | Argentina Milei 2024 live update |

### Structural order in 15.14 (post-v104)
Case A (Tunisia) → Case B (Belarus) → Case C (Argentina + Milei update) → Case D (Indonesia) → "Parts of this will be wrong" (45513707)

---

## v105 (April 2026)
**Source:** v104 → v105
**Session:** Substantive additions — applied cases, practice architecture, non-Western counter-power, E variable integration

### Changes Made
| # | Location | Change | Para IDs |
|---|----------|--------|----------|
| 1 | 13.4h | Applied case: De-Ba'athification Irak — CPA Orders 1 & 2, vacuum problem, 5-step diagnostic applied, idealism check failure, structural injustice conclusion | `1EB4A001–1EB4A004` |
| 2 | 17.7c | New sub-section: "From Diagnostic to Practice: Drift Detection as Technology of the Self" — reactive vs sustained practice, Foucault distinction (discipline vs self-formation), 3 practice components, red individual drift detection matrix (4-step) | `1E177001–1E177004` |
| 3 | 10.9 | New sub-section: "Non-Western Counter-Power: Kerala and Cochabamba as Applied Cases" — Kerala (CPI(M) organizational substrate, manufactured fracture line crossing, material mechanism); Cochabamba Water War 2000 (threshold non-linearity, irrigators' cooperatives as enabling substrate, Rs as decisive variable); synthesis of cross-cultural validity claim | `1E200001–1E200004` |
| 4 | 3.4 | New sub-section: "Absolute Structural Exclusion: The Ambedkar Problem" — E vs B distinction (constitutive exclusion vs betrayal); cosmological capture at social order scale (karma/dharma as legitimation architecture); distributional criterion vs aggregate (Ambedkar-Gandhi disagreement); blue callout: 3 specifications to E variable (legitimation architecture problem, standing construction requirement, reform-abolition boundary) | `1E340001–1E340005` |

### Paragraph count
v104: 3322 → v105: 3339 (+17 new paragraphs)

### Key new Para IDs
| Para ID | Content |
|---------|---------|
| `1EB4A001` | 13.4h — Applied Case: De-Ba'athification sub-heading |
| `1EB4A002` | 13.4h — Para 1: moral indictment correct, functional analysis absent |
| `1EB4A003` | 13.4h — Para 2: functional inventory + vacuum specification |
| `1EB4A004` | 13.4h — Para 3: 5-step diagnostic applied, idealism check fails |
| `1E177001` | 17.7c — Sub-heading: "From Diagnostic to Practice" |
| `1E177002` | 17.7c — Para 1: reactive vs practice, Foucault self-formation |
| `1E177003` | 17.7c — Para 2: 3 practice components (structural accounting, standing relationships, contemporaneous record) |
| `1E177004` | 17.7c — Red callout: Individual drift detection matrix (4-step) |
| `1E200001` | 10.9 — Sub-heading: "Non-Western Counter-Power" |
| `1E200002` | 10.9 — Kerala applied case |
| `1E200003` | 10.9 — Cochabamba applied case |
| `1E200004` | 10.9 — Synthesis: cross-cultural structural consistency |
| `1E340001` | 3.4 — Sub-heading: "Absolute Structural Exclusion: The Ambedkar Problem" |
| `1E340002` | 3.4 — Para 1: E vs B distinction, constitutive exclusion, counter-power implications |
| `1E340003` | 3.4 — Para 2: cosmological capture at social order scale, conversion as institutional exit |
| `1E340004` | 3.4 — Para 3: distributional criterion test, Ambedkar-Gandhi disagreement |
| `1E340005` | 3.4 — Blue callout: 3 additions to E variable specification |

### Insertion positions
| Addition | Inserted after | Inserted before |
|----------|---------------|-----------------|
| 13.4h De-Ba'ath | `341AE35A` (historical cases para) | `7ADC6171` ("Institutional Functions as Latent Infrastructure") |
| 17.7c ToS | Last para of 17.7c (`1C99CA67` callout) | `52F68E69` (17.7d heading) |
| 10.9 counter-power | `322EBEAB` (formula callout) | `4655862E` ("Fracture Lines" sub-heading) |
| 3.4 Ambedkar | `613A87B8` (blue diagnostic callout) | `1D757F41` (3.4b heading) |

---

## Pending / Backlog
| Priority | Location | Change Needed |
|----------|----------|---------------|
| High | Part IX | Restructure: geopolitik 2024-2026 (semikonduktor, de-dolarisasi, mineral kritis) |
| High | Part XVI | Restructure: AI sebagai institusi, algorithmic governance sebagai advanced V/capture |
| Med | Pre-institutional demolition | Sub-chapter: shadow institutions / parallel infrastructure doctrine |
| Med | 12.x | Deficit estimation protocol — PMN dengan data parsial |

---

## v106 (April 2026)
**Source:** v105 → v106
**Session:** High-priority additions — algorithmic governance as advanced V, geopolitik 2024–2026, Kastrup bulletproof postulate, e/acc falsification trigger, weaponized Stoicism demarcation; hard read + terminology fix; bibliography + Intellectual Debts audit

### Changes Made
| # | Location | Change | Para IDs |
|---|----------|--------|----------|
| 1 | 16.2 | New sub-section: "Algorithmic Governance as Advanced V" — primitive vs advanced V, opacity/distributed authorship/scalability, AI as institutional form, red diagnostic 4-step | `1E162001–1E162005` |
| 2 | 9.3b | New sub-section: "The Current Transition: Semiconductor Controls, De-dollarization, Critical Minerals" — CHIPS Act/EUV chokepoint; dollar hegemony + BRICS+/mBridge; Indonesia nickel case; blue callout: materialist reading | `1E930001–1E930007` |
| 3 | 2.1 | Kastrup bulletproof postulate — phenomenological invariance across ontologies | `1E210001` |
| 4 | 16.4 | New sub-section: "Effective Accelerationism and the Generational Sacrifice Problem" — temporal displacement of criterion; 4 conditions acceleration argument must meet; link to E variable | `1E164001–1E164003` |
| 5 | 17.7d | New sub-section: "On Weaponized Stoicism: Jurisdictional Demarcation" — valid scope (existential), alarm (structural); V mechanism; 3 deployment channels | `1E177501–1E177504` |
| 6 | 17.7c `1E177003` | Terminology fix: "solidarity infrastructure noted in 17.7d" → "solidarity analysis in 17.7d" | `1E177003` |
| 7 | Intellectual Debts | Added Kastrup entry (postulate in 2.1 formulated in response; PMN answer = phenomenological invariance not metaphysical refutation) | `1E107001` |
| 8 | Intellectual Debts | Added Foucault entry (technologies of the self, disciplinary power; departure: PMN rejects normative agnosticism via minimal anchor) | `1E107002` |
| 9 | Bibliography | Added Ambedkar 1945, Kastrup 2019, Foucault 1975, Foucault 1988 | `1E107003–1E107006` |
| 10 | How to Read Level 2 | Removed "Crucially," | inline |
| 11 | How to Read Level 5 | Added 9.3b mention | inline |
| 12 | How to Read Level 9 | Added algorithmic governance + e/acc mention | inline |
| 13 | Title block | Version 103 → 106 (detected by pmn_check.py) | line 93 |

### Paragraph count
v105: 3339 → v106: 3365 (+26)

### Saran yang TIDAK diimplementasikan
- Neo-Marxisme, Postmodernisme, Libertarianisme sebagai dedicated sections: REJECTED — rhetorical, bukan analytical. Coverage sudah ada struktural di Part III, 3.4, 4.1, 13.4.

### pmn-check audit result
0 errors, 12 warnings (all expected baseline)

---

## v107 (April 2026)
**Source:** v106 → v107
**Session:** Language audit + consistency recheck dengan pmn-check

### Changes Made
| # | Location | Change | Para ID |
|---|----------|--------|---------|
| 1 | 7.0 `681450B8` | "And crucially, these systems are nested" → "These systems are nested" | `681450B8` |
| 2 | 7.8 `57F4FEB0` | "More importantly, it fails" → "It also fails" | `57F4FEB0` |
| 3 | 9.0b `2050BE0F` | "With 9.0b, it is clear that the direction" → "With 9.0b, the direction" | `2050BE0F` |
| 4 | 10.13 `041E39DB` | "More importantly, it is not about" → "It is not about" | `041E39DB` |
| 5 | Title block | Version 106 → 107 | line 93 |

### Paragraph count
v106: 3365 → v107: 3365 (0 — language fixes only)

### Language audit findings — NOT fixed (legitimate)
- `in terms of the` x4 — used technically, not as filler
- `significantly` (4DDDF0C4) — degree adverb, not discourse marker
- `comprehensive framework` (6C88229F) — descriptive, not filler

### pmn-check audit result
0 errors, 12 warnings (all expected baseline — unchanged from v106)

### pmn-diff verification
Added=0 ✅ | Removed=0 ✅ | Modified=4 ✅ (exactly the 4 targeted paragraphs)

---

## Pending / Backlog
| Priority | Location | Change Needed |
|----------|----------|---------------|
| Med | Pre-institutional demolition | Sub-chapter: shadow institutions / parallel infrastructure doctrine |
| Med | 12.x | Deficit estimation protocol — PMN dengan data parsial |
| Low | 3.4 atau 1.x | Satu kalimat eksplisit: postmodernisme vs minimal anchor + libertarianisme vs biological floor |

---

## v111 (April 2026)
**Source:** v110 → v111
**Session:** Backlog completion — shadow institutions, deficit estimation, 3.4 postmodernism/libertarianism

### Changes Made
| # | Location | Change | Para IDs |
|---|----------|--------|----------|
| 1 | **10.8b** (new, before 10.9) | "Shadow Institutions and Parallel Infrastructure Doctrine" — definition, examples (Black Panthers, Zapatistas, Kerala), parallel infrastructure function, three-component doctrine | `1E108B01–1E108B07` |
| 2 | **12.5e** (new, before 12.6) | "Deficit Estimation Protocol: PMN Analysis with Partial Data" — four deficit types, three non-negotiable requirements | `1E125E01–1E125E05` |
| 3 | 3.4 opening paragraph | Added two sentences: postmodernism (all criteria are socially constructed → answered by biology: hunger is non-arbitrary regardless of theory) and libertarianism (voluntary exchange is always legitimate → answered by biology: consent under deprivation fails the floor criterion) | inline |
| 4 | Title block | Version 110 → 111 | |

### Paragraph count
v110: 3362 → v111: 3374 (+12)

---

## v112 (April 2026)
**Source:** v111 → v112
**Session:** Hard read VIII–XVII + full citation audit

### Hard read coverage
| Part | Status | Issues found |
|------|--------|-------------|
| VII (7.3c–7.8) | ✅ Full | Evans 1995 missing from bibliography |
| VIII (8.1–8.7) | ✅ Full | Clean — no issues |
| IX (9.0–9.5) | ✅ Full | Clean |
| X (10.1–10.15) | ✅ Full | 0 duplicates, 0 AI-ish |
| XI (11.0–11.5) | ✅ Full | Clean |
| XII (12.1–12.9) | ✅ Full | Clean |
| XIII (13.1–13.5) | ✅ Full | Clean |
| XV (15.0–15.15) | ✅ Full | All 15 formula refs verified |
| XVI (16.0–16.5) | ✅ Full | Clean |
| XVII (17.0–17.8) | ✅ Full | Clean |

### Changes Made
| # | Location | Change | Para IDs |
|---|----------|--------|----------|
| 1 | Bibliography | Added Evans 1995 — *Embedded Autonomy* (cited in Part VII, missing) | `1E111001` |
| 2 | Bibliography | Added Machiavelli 1513 — *The Prince* (bare surname cited 5x in body, missing) | `1E111002` |
| 3 | Title block | Version 111 → 112 | |

### Systematic scan results
- AI-ish phrases: **0** (clean — "in this context", "at the same time", "in order to" all verified as legitimate)
- Duplicate sentences (>100 chars): **0** across all Parts
- All inline citations (Author YYYY): **0 missing** from bibliography ✅
- All Part XV formula section references (15.0–15.15): **all verified** ✅
- 10.8b and 12.5e cross-references: heading exists, citations found ✅

### Paragraph count
v111: 3374 → v112: 3376 (+2 bibliography entries)

### New Para IDs
| Para ID | Location | Content |
|---------|----------|---------|
| `1E111001` | Bibliography | Evans 1995 — *Embedded Autonomy* |
| `1E111002` | Bibliography | Machiavelli 1513 — *The Prince* |

### pmn-check audit result
0 errors, 12 warnings (all expected baseline)

### Hard read complete
All 17 Parts + Part XIV (final position) + Coda + Preface + How to Read + Intellectual Debts + Bibliography have now been read in full across sessions v109–v112.

---

## Pending / Backlog
| Priority | Location | Change Needed |
|----------|----------|---------------|
| Low | Any new session | Continue monitoring for issues as framework develops |

---

## v114 (May 2026)
**Source:** v113 → v114
**Session:** Major architectural revision — becoming reframe (loop model + anti-foreclosure)

### Conceptual change
Previous versions positioned becoming as the "evaluative ceiling" — an independent positive criterion complementing suffering as the floor. This created an inversion problem: 4.5b explicitly stated "becoming is primary. Suffering matters because and insofar as it forecloses becoming." This framing made suffering derivative of becoming rather than primary, enabling the idealism the framework was designed to prevent.

The revision: **becoming is not an independent evaluative criterion. It is the floor criterion applied temporally.** Foreclosing adaptive response capacity is a form of structural suffering imposed on future populations — same criterion, different timescale. The moral force of becoming comes entirely from the floor criterion, not from becoming as a positive aspiration.

The sentient-material response loop model (developed in discussion of the ChatGPT becoming document) replaces the teleological account: suffering triggers responses → responses encode into patterns → patterns generate new capacities and new vulnerabilities → becoming emerges from this loop, not from a teleological destination.

### Changes Made
| # | Location | Change |
|---|----------|--------|
| 1 | **4.5b (full rewrite)** | Previous: ~57k chars, "becoming is primary / suffering is derivative." New: ~19k chars, loop model (sentient-material response dynamics), anti-foreclosure criterion, rejection of becoming-for-its-own-sake, functional/disfunctional distinction regrounded in suffering, distributional requirement regrounded. New paraIds: `2A45B001–2A45B015` |
| 2 | **4.5b terminological note** | Added `2A45B015`: "Throughout this document, 'becoming' functions as shorthand for the anti-foreclosure criterion" — defines the shorthand for remainder of document |
| 3 | 3.3 is-ought bridge | Revised ceiling language: "floor and ceiling are not two separate normative commitments" → "floor criterion and anti-foreclosure criterion are not two separate normative commitments." Multiple ceiling references reframed as temporal floor |
| 4 | 3.0 two-level architecture | "life is ontological foundation, suffering is evaluative criterion, becoming is evaluative ceiling" → suffering as evaluative criterion, anti-foreclosure criterion as temporal extension |
| 5 | How to Read Level 2 | "becoming is the evaluative ceiling (what counts as good)" → "becoming is shorthand for the anti-foreclosure criterion: what the floor criterion requires when traced temporally" |
| 6 | 4.2 Better and Worse | "expand becoming for majority" → "preserve and expand adaptive response capacity across population" |
| 7 | 14.3 axiom hierarchy | "suffering as evaluative criterion; becoming as evaluative ceiling" → anti-foreclosure framing |
| 8 | Preface | Ceiling language in Preface fixed |
| 9 | All callout boxes | "The evaluative ceiling:" → "The anti-foreclosure criterion (temporal extension of the floor):" |
| 10 | Terminology throughout | 60+ replacements: evaluative ceiling → anti-foreclosure criterion; ceiling criterion → anti-foreclosure criterion; ceiling failure → anti-foreclosure failure; ceiling-level → anti-foreclosure level |

### Terminology introduced
- **anti-foreclosure criterion**: the floor criterion applied temporally — institutional arrangements must not foreclose adaptive response capacity in future populations
- **sentient-material response loop**: the causal structure from which becoming emerges (suffering → response → encoded pattern → new capacity + new vulnerability → loop)

### What did NOT change
- S, R, B, V, E, W, If variable definitions (formula architecture unchanged)
- Floor criterion definition (unchanged — 'becoming' was the problem, not 'suffering')
- Applied analysis in Parts VII–XVII (ceiling shorthand acceptable there, now defined by 4.5b)
- Anti-aggregation principle (unchanged, regrounded)
- 4.5c Procedural Account of Becoming (already consistent with reformulation)
- 4.5d Becoming as Epistemic Capacity (already consistent — temporal floor argument)

### Key insight from ChatGPT discussion
Becoming and suffering are co-constitutive, not opposite axes. Becoming can produce suffering (more awareness → more existential suffering capacity; deeper relations → more vulnerability to loss). "Becoming for its own sake" is not a PMN value. The loop produces becoming as a pattern, not as a destination. Evaluation runs through suffering, not through becoming.

### Paragraph count
v113: 3380 → v114: 3354 (−26: 4.5b rewritten more concisely, replaced verbose idealist framing with tighter loop model account)

### New Para IDs (v114 — 4.5b rewrite)
| Para ID | Content |
|---------|---------|
| `2A45B001` | Subhead: "How Becoming Emerges: The Sentient-Material Response Loop" |
| `2A45B002` | Loop model — structure and mechanism |
| `2A45B003` | Food example — illustrates loop without romanticizing |
| `2A45B004` | Becoming produces suffering — co-constitutive, not opposite axes |
| `2A45B005` | Subhead: "The Evaluative Criterion Remains Suffering: Why Becoming Matters" |
| `2A45B006` | Anti-foreclosure argument — foreclosing response capacity = temporal floor violation |
| `2A45B007` | "Becoming" shorthand clarification — what earlier versions got wrong |
| `2A45B008` | Subhead: "Against Becoming for Its Own Sake" |
| `2A45B009` | Rejection of progress-for-its-own-sake — historical record of becoming-without-evaluation |
| `2A45B010` | Subhead: "Functional and Disfunctional Suffering: Regrounded" |
| `2A45B011` | Functional/disfunctional regrounded in suffering criterion, not becoming criterion |
| `2A45B012` | Subhead: "The Distributional Requirement" |
| `2A45B013` | Distributional requirement — colonialism as temporal floor violation, not ceiling trade-off |
| `2A45B014` | Relationship to capabilities tradition (Sen, Nussbaum) — PMN more minimal, more structurally demanding |
| `2A45B015` | Terminological note — "becoming" = anti-foreclosure shorthand throughout document |

### pmn-check audit
0 errors, 12 warnings (expected baseline), 0 missing citations, 0 AI-ish phrases in new content

---

## Pending / Backlog
*(No known gaps. Framework is substantively complete and internally consistent.)*

Monitoring notes:
- "becoming" appears 469x as shorthand — all defined by 2A45B015
- 66x "anti-foreclosure" — new term introduced in v114
- Next session: consider whether 4.5c and 4.5d need minor language updates to fully reflect loop model

---

## v116 (May 2026)
**Source:** v115 → v116
**Session:** Becoming reframe completion — e/acc, thinker audit, final sweeps

### Changes Made
| # | Location | Change | Notes |
|---|----------|--------|-------|
| 1 | **16.4 e/acc** — new para `1E164004` | Added paragraph applying anti-foreclosure criterion to e/acc critique. Two simultaneous violations: immediate floor failure + anti-foreclosure failure (destruction of collective response infrastructure through mass displacement). "Future generations will benefit" doesn't resolve either violation. | Stronger PMN critique than old floor-vs-ceiling framing |
| 2 | 16.4 e/acc body | "future flourishing" → "future adaptive response capacity" | Terminology alignment |
| 3 | Final sweeps | All remaining "genuine becoming" (44x), "future flourishing", "becoming as aspiration" patterns resolved | |

### Thinker reference audit (v116)
| Thinker | Count | Treatment |
|---------|-------|-----------|
| Gramsci | 137x | Hegemony, biological floor relation — accurate ✅ |
| Marx | 68x | Displacement from idealism to material production; PMN extends further to biology — accurate ✅ |
| Hegel | 16x | Displacement move credited; idealism rejected; World Spirit used as contrast case — fair ✅ |
| Nietzsche | 19x | Last Man concern taken seriously; PMN acknowledges validity then departs structurally — fair ✅ |
| Ambedkar | 28x | Central to Part III; E variable derivation — substantive engagement ✅ |
| Ibn Khaldun | 13x | Muqaddimah epistemology; asabiyyah as counter-power — accurate ✅ |
| Foucault | 3x | Technologies of the self — light treatment, acceptable given PMN's focus |
| Kastrup | 7x | Bulletproof postulate; idealist challenge acknowledged seriously — fair ✅ |
| Peirce | 8x | Fallibilism; pragmatic epistemology — accurate ✅ |

### Final state of becoming reframe (v114–v116)
| Check | v116 |
|-------|------|
| "evaluative ceiling" | 0x ✅ |
| "becoming is primary" | 0x ✅ |
| "genuine becoming" | 0x ✅ |
| "future flourishing" | 0x ✅ |
| "anti-foreclosure" | 70x ✅ |
| loop model | ✅ |
| 3.3 coherent | "one commitment, stated at two levels of causal depth" ✅ |
| 17.7 second-order | ✅ |
| 4.5d second-order | ✅ |
| e/acc anti-foreclosure | ✅ |

### Paragraph count
v115: 3355 → v116: 3356 (+1: e/acc anti-foreclosure paragraph)

### New Para IDs
| Para ID | Location | Content |
|---------|----------|---------|
| `1E164004` | 16.4 | e/acc — anti-foreclosure critique (two simultaneous violations) |

---

## Pending / Backlog
*(No known gaps. v114–v116 = complete becoming reframe, first- and second-order, with e/acc application.)*
