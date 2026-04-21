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

## v110 (April 2026)
**Source:** v109 → v110
**Session:** Formatting audit + structural misplacements fixed + hard read Part VII + citation audit

### Changes Made
| # | Location | Change | Para IDs |
|---|----------|--------|-------|
| 1 | Formula arrow boxes | Text color `6B7280` → `1E3A5F` — gray on pale blue was illegible in PDF | 53 runs |
| 2 | Bibliography | 2 bold runs removed; 113 entries spacing standardized to `w:after=160` | inline |
| 3 | Intellectual Debts | Horizontal divider removed, 40 entries sorted A–Z, Kastrup+Foucault repositioned, 2 spacing fixes | −1 para |
| 4 | How to Read | Bridging intro added before Level 1; visual elements section moved after Level 11 | `1E110001` |
| 5 | **STRUCTURAL** — 4.4 body | Moved "The concept of progress developed here has a temporal dimension" paragraph to end of 4.3 (where it belongs thematically) | para move |
| 6 | **STRUCTURAL** — End of Part VI | Moved "Measuring Meaning Infrastructure: Indicators of Strength, Fragility, and Collapse Risk" section (45k chars) to end of Part V (Part V content) | section move |
| 7 | 7.1 | "The Military as Autonomous Institutional Actor" sub-heading → "7.1b The Military as Autonomous Institutional Actor" (numbered, consistent with document style) | inline |
| 8 | Bibliography | Added 5 missing entries: Held 1995, Montesquieu 1748, Sartre 1943, Taylor 2007, Zuboff 2019 — all cited inline in body but missing from bibliography | `1E110002–1E110006` |

### Citation audit results
All inline citations (Author YEAR) format cross-checked against bibliography. 4 originally missing: Sartre 1943, Taylor 2007, Held 1995, Zuboff 2019. Montesquieu referenced by bare surname — also added. All 5 now in bibliography ✅.

### Hard read coverage
| Part | Status | Issues |
|------|--------|--------|
| VII (7.0–7.3b) | ✅ Full read | 7.1b numbering fixed; citation gaps found and fixed |

### Paragraph count
v109: 3357 → v110: 3362 (+5 bibliography entries; net after section moves = 0 paragraph count change from moves)

### New Para IDs
| Para ID | Location | Content |
|---------|----------|---------|
| `1E110001` | How to Read | Bridging intro before Level 1 |
| `1E110002` | Bibliography | Held 1995 — *Democracy and the Global Order* |
| `1E110003` | Bibliography | Sartre 1943 — *Being and Nothingness* |
| `1E110004` | Bibliography | Taylor 2007 — *A Secular Age* |
| `1E110005` | Bibliography | Zuboff 2019 — *The Age of Surveillance Capitalism* |
| `1E110006` | Bibliography | Montesquieu 1748 — *De l'Esprit des Lois* |

### pmn-check audit result
0 errors, 12 warnings (expected baseline)

---

## Pending / Backlog
| Priority | Location | Change Needed |
|----------|----------|---------------|
| Med | Parts VII cont. (7.3c+), VIII–XIII | Hard read continuation |
| Med | Parts XV–XVII | Hard read |
| Med | Pre-institutional demolition | Sub-chapter: shadow institutions / parallel infrastructure doctrine |
| Med | 12.x | Deficit estimation protocol — PMN dengan data parsial |
| Low | 3.4 atau 1.x | Satu kalimat eksplisit: postmodernisme vs minimal anchor + libertarianisme vs biological floor |
