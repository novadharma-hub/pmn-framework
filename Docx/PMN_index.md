# PMN Framework — Structural Index
*Reference file for efficient editing sessions. Upload alongside DOCX.*

---

## File Versions
| Version | Filename | Notes |
|---------|----------|-------|
| v102 | PMN_Framework_v102.docx | Source for v103 |
| v103 | PMN_Framework_v103.docx | Consistency audit |
| v104 | PMN_Framework_v104.docx | Formula closure, live case update, structural fix |
| v105 | PMN_Framework_v105.docx | Applied cases, practice architecture, non-Western counter-power, E variable integration |
| v106 | PMN_Framework_v106.docx | High-priority additions + audit |
| v107 | PMN_Framework_v107.docx | Language audit |
| v108 | PMN_Framework_v108.docx | Part XIV repositioned; bibliography merged |
| v109 | PMN_Framework_v109.docx | Hard read I–III + platform attribution removed |
| v110 | PMN_Framework_v110.docx | Current latest — formatting audit + structural fixes + citation audit |

---

## Document Structure (TOC Line Numbers in Unpacked XML)

All line numbers refer to `word/document.xml` after unpacking.

### Title Block
| Element | Line | Current Value |
|---------|------|---------------|
| Title | ~89 | Progressive Materialist Naturalism |
| Subtitle | ~91 | A Framework for Navigating Material Reality |
| Author | ~92 | Nova Dharma |
| Version | 93 | Version 110 • 2026 |

### Table of Contents
- TOC paragraphs: lines ~95–480 (Normal style, not body content)
- TOC Part headers: `Sizes=['28','28'] Bold=True`
- TOC section entries: `Sizes=['28','22'] Bold=False`

---

## Key Paragraph IDs (w14:paraId)

These are stable across repacks — use for targeted edits.

| Para ID | Location | Content |
|---------|----------|---------|
| `34415D7C` | 15.14 body | **Case D: Indonesia** heading |
| `087268B0` | 15.14 body | **Case A: Tunisia** heading |
| `2826ED9F` | 15.14 body | First body para after Case A |
| `4B16993C` | 15.14 body | First body para after Case B |
| `35DB07E4` | 15.14 body | First body para after Case C |
| `4AAC3FE7` | 15.14 body | First body para after Case D |

---

## Key Line Numbers (word/document.xml, post-unpack)

*Re-verify after each repack — may shift by ±5 lines.*

| Line | Content |
|------|---------|
| 93 | Version number |
| 75507 | 15.14 intro: "four cases demonstrate..." |
| 75529 | Case A: Tunisia heading |
| 75769 | Case B: Belarus heading |
| 75980 | Case C: Argentina heading |
| 77195 | Case D: Indonesia heading |
| 57660 | 12.7 geographic bias note |
| 21698 | 3.11 "three cases below" (illustrative — intentionally three, do NOT change) |

---

## Heading Style Reference

### Part Headers (body)
```xml
<w:sz w:val="40"/> Bold=True  (20pt)
<!-- Example: "Part IV: What Matters..." -->
```

### Section Headers (x.x level, body)
```xml
<w:sz w:val="32"/> Bold=True  (16pt)
<!-- Example: "4.1 The Foundation of Value" -->
```

### Sub-section Headers (x.xb / named subsections)
```xml
<w:sz w:val="28"/> Bold=True  (14pt)
<!-- Example: "The Aristotelian Lineage and Its Revision" -->
```

### Case Headings in 15.14 (A/B/C/D)
```xml
<w:spacing w:before="280" w:after="60"/>
<w:b/>  <w:bCs/>
<w:color w:val="1D4ED8"/>   <!-- blue -->
<w:sz w:val="28"/>
```

### Case Headings in 3.11 (A/B/C — inline bold)
```xml
<w:spacing w:after="220" w:line="280" w:lineRule="exact"/>
<w:b/>  <w:bCs/>
<!-- No color override — inherits body color -->
<w:sz w:val="28"/>
```

### Body Text
```xml
<w:spacing w:after="220" w:line="280" w:lineRule="exact"/>
<w:jc w:val="both"/>   <!-- justified -->
<w:sz w:val="28"/>     <!-- 14pt -->
<w:color w:val="111827"/>
```

### Blue Callout Boxes (left-border blocks)
```xml
<w:pStyle w:val="..."/>
<!-- Typically: shading fill + left border in blue -->
<w:color w:val="1D4ED8"/>
```

### Red Diagnostic Boxes
```xml
<w:color w:val="DC2626"/>  <!-- red text or border -->
```

---

## Fonts Used
| Font | Usage |
|------|-------|
| Georgia | Body text (primary) |
| Calibri | Headings (some) |
| Times New Roman | `w:cs` fallback (complex scripts) |

---

## Color Palette
| Hex | Usage |
|-----|-------|
| `111827` | Body text (dark charcoal) |
| `374151` | Secondary text / gray (do NOT use for case headings) |
| `1D4ED8` | Blue — case headings, callout accents |
| `DC2626` | Red — diagnostic/operational callouts |
| `000000` | Part headers |

---

## Section Count Reference
| Part | Sections | Notes |
|------|----------|-------|
| I | 1.1–1.12 | Epistemology |
| II | 2.1–2.6e | Ontology |
| III | 3.0–3.12 | Biological Foundation |
| IV | 4.1–4.5d | Ethics |
| V | 5.1–5.8 | Metaphysics/Meaning |
| VI | 6.1–6.8 | Power |
| VII | 7.0–7.8 | Institutions |
| VIII | 8.1–8.7 | Society/Culture |
| IX | 9.0–9.5 | Geopolitics |
| X | 10.1–10.15 | System Change |
| XI | 11.0–11.5 | Economics |
| XII | 12.1–12.9 | Methodology |
| XIII | 13.1–13.5 | Tensions |
| XIV | 14.1–14.6 | Summary |
| XV | 15.0–15.15 | Formula Architecture |
| XVI | 16.0–16.5 | Technology |
| XVII | 17.0–17.8 | Cases + Individual |

---

## Quick Edit Commands

### Unpack
```bash
python /mnt/skills/public/docx/scripts/office/unpack.py \
  PMN_Framework_vXXX.docx PMN_unpacked/
```

### Pack
```bash
python /mnt/skills/public/docx/scripts/office/pack.py \
  PMN_unpacked/ PMN_Framework_vYYY.docx \
  --original PMN_Framework_vXXX.docx
```

### Find paragraph by content
```bash
grep -n "search text" PMN_unpacked/word/document.xml
```

### Find paragraph by ID
```bash
grep -n "paraId=\"34415D7C\"" PMN_unpacked/word/document.xml
```

---

## New Para IDs (v104)
| Para ID | Location | Content |
|---------|----------|---------|
| `2DA5B110` | 15.0b | W — Coalition Width definition |
| `2DA5B111` | 15.0b | If — Institutional Fragmentation definition |
| `2DA5B112` | 15.0b | E — Absolute Structural Exclusion definition |
| `2DA5B120` | 15.14 | Argentina Milei 2024 live update paragraph |

## New Para IDs (v105)
| Para ID | Location | Content |
|---------|----------|---------|
| `1EB4A001` | 13.4h | De-Ba'athification — Applied Case sub-heading |
| `1EB4A002` | 13.4h | De-Ba'athification — Para 1: moral vs functional analysis |
| `1EB4A003` | 13.4h | De-Ba'athification — Para 2: functional inventory + vacuum |
| `1EB4A004` | 13.4h | De-Ba'athification — Para 3: 5-step diagnostic, idealism check fails |
| `1E177001` | 17.7c | Drift/ToS — Sub-heading |
| `1E177002` | 17.7c | Drift/ToS — Para 1: reactive vs practice, Foucault |
| `1E177003` | 17.7c | Drift/ToS — Para 2: 3 practice components |
| `1E177004` | 17.7c | Drift/ToS — Red callout: individual drift detection matrix |
| `1E200001` | 10.9 | Counter-power — Sub-heading |
| `1E200002` | 10.9 | Counter-power — Kerala applied case |
| `1E200003` | 10.9 | Counter-power — Cochabamba applied case |
| `1E200004` | 10.9 | Counter-power — Cross-cultural synthesis |
| `1E340001` | 3.4 | Ambedkar — Sub-heading |
| `1E340002` | 3.4 | Ambedkar — Para 1: E vs B distinction |
| `1E340003` | 3.4 | Ambedkar — Para 2: cosmological capture + conversion as exit |
| `1E340004` | 3.4 | Ambedkar — Para 3: distributional criterion, Ambedkar-Gandhi |
| `1E340005` | 3.4 | Ambedkar — Blue callout: 3 additions to E variable spec |

## New Para IDs (v106)
| Para ID | Location | Content |
|---------|----------|---------|
| `1E162001` | 16.2 | Advanced V — Sub-heading |
| `1E162002` | 16.2 | Advanced V — Para 1: ideology of objectivity as symbolic violence |
| `1E162003` | 16.2 | Advanced V — Para 2: counter-power mismatch, 3 compounding properties |
| `1E162004` | 16.2 | Advanced V — Para 3: AI as institutional form |
| `1E162005` | 16.2 | Advanced V — Red callout: algorithmic advanced V diagnostic (4-step) |
| `1E210001` | 2.1 | Kastrup bulletproof postulate — phenomenological invariance across ontologies |
| `1E164001` | 16.4 | e/acc — Sub-heading |
| `1E164002` | 16.4 | e/acc — Para 1: temporal displacement of evaluative criterion |
| `1E164003` | 16.4 | e/acc — Para 2: falsification trigger + four conditions |
| `1E177501` | 17.7d | Weaponized Stoicism — Sub-heading |
| `1E177502` | 17.7d | Weaponized Stoicism — Para 1: valid jurisdictional scope |
| `1E177503` | 17.7d | Weaponized Stoicism — Para 2: jurisdictional error as V mechanism |
| `1E177504` | 17.7d | Weaponized Stoicism — Para 3: deployment channels + demarcation rule |
| `1E930001` | 9.3b | Geopolitik — Sub-heading |
| `1E930002` | 9.3b | Geopolitik — Para 1: three dynamics framing |
| `1E930003` | 9.3b | Geopolitik — Para 2: semiconductor controls |
| `1E930004` | 9.3b | Geopolitik — Para 3: de-dollarization |
| `1E930005` | 9.3b | Geopolitik — Para 4: critical minerals + Indonesia nickel |
| `1E930006` | 9.3b | Geopolitik — Para 5: synthesis + evaluative criterion |
| `1E930007` | 9.3b | Geopolitik — Blue callout: materialist reading |

## New Para IDs (v106 — audit fixes)
| Para ID | Location | Content |
|---------|----------|---------|
| `1E107001` | Intellectual Debts | Kastrup entry |
| `1E107002` | Intellectual Debts | Foucault entry |
| `1E107003` | Bibliography | Ambedkar 1945 — *What Congress and Gandhi Have Done to the Untouchables* |
| `1E107004` | Bibliography | Kastrup 2019 — *The Idea of the World* |
| `1E107005` | Bibliography | Foucault 1975 — *Discipline and Punish* |
| `1E107006` | Bibliography | Foucault 1988 — 'Technologies of the Self' |


## New Para IDs (v110)
| Para ID | Location | Content |
|---------|----------|---------|
| `1E110001` | How to Read | Bridging intro before Level 1 |
| `1E110002` | Bibliography | Held 1995 — *Democracy and the Global Order* |
| `1E110003` | Bibliography | Sartre 1943 — *Being and Nothingness* |
| `1E110004` | Bibliography | Taylor 2007 — *A Secular Age* |
| `1E110005` | Bibliography | Zuboff 2019 — *The Age of Surveillance Capitalism* |
| `1E110006` | Bibliography | Montesquieu 1748 — *De l'Esprit des Lois* |

## Current version
**v110** — PMN_Framework_v110.docx
