# PMN Framework — Design System & Platform Architecture

**Specification Version:** 2.1 (updated 2026-09-24 for the current reader)  
**Aesthetic:** Warm Editorial / Archival Minimalism / Print-Grade Precision  
**Character:** Scholarly, book-grade reading environment engineered for high cognitive endurance. Deep crimson on near-black (dark mode) or aged archival parchment (light mode). Serif typography for sustained reading; crisp monospace for analytical UI chrome.

---

## 1. Philosophical Design Principles

1. **Content Primacy & The 68ch Measure:** The reading experience mimics a master-typeset volume. Prose width is strictly capped at `68ch` with 1.68–1.75 line-height to optimize saccadic eye movement and cognitive focus.
2. **Restrained Hierarchy:** No decorative clutter, unsolicited modal popups, or aggressive neon gradients. Visual accents are restricted to the canonical PMN Crimson (`#c0271a` / `#8b1e14`), subtle rule lines, and hard-edged archival card shadows (`8px 8px 0 var(--rule2)`).
3. **Strict Language Parity (100% Academic English):** The public reader, interactive tools, AI lab, and metadata are strictly presented in fluent academic English. Private internal notes or translation drafts remain confined to development vaults.
4. **Zero-Backend Sovereignty:** The platform operates as a static Progressive Web App (PWA) on GitHub Pages. No tracking pixels, third-party analytics, external fonts at runtime, or centralized database dependencies.

---

## 2. Color Tokens & Semantic Theme Variables

Themes are toggled via the `data-theme="dark"` attribute on the `<html>` root element.

### Dark Mode (Default Reading Environment)
| Token | Hex | Semantic Role |
|---|---|---|
| `--color-pmn-bg` | `#0d0d0d` | Primary canvas background |
| `--color-pmn-bg2` | `#171717` | Card surface, sidebar, and table alternating rows |
| `--color-pmn-bg3` | `#1f1f1f` | Hover states, active tabs, interactive wells |
| `--color-pmn-sb` | `#141414` | Reader navigation drawer & directory background |
| `--color-pmn-ink` | `#f5f0e8` | Primary reading prose (warm eggshell white) |
| `--color-pmn-ink2` | `#c8bfb2` | Secondary body text, card summaries, metadata |
| `--color-pmn-acc` | `#c0271a` | Canonical PMN Red — primary accent, active indicators |
| `--color-pmn-acc2` | `#961f14` | Darker accent for active hover states & shadows |
| `--color-pmn-mute` | `#8a7d6e` | Muted labels, timestamps, section IDs |
| `--color-pmn-mute2` | `#7c7064` | Subdued borders, table headers |
| `--color-pmn-mute3` | `#3a3530` | Input placeholder text, disabled states |
| `--color-pmn-rule` | `#302b27` | Primary structural border & table grid lines |
| `--color-pmn-rule2` | `#3d3730` | Secondary border for card offset drop-shadows |
| `--color-pmn-hdr` | `#0d0d0d` | Sticky navigation header backdrop |

### Light Mode (Archival Parchment)
| Token | Hex | Semantic Role |
|---|---|---|
| `--color-pmn-bg` | `#e8dcc8` | Warm amber paper / archival canvas |
| `--color-pmn-bg2` | `#ddd0b6` | Aged parchment card surface |
| `--color-pmn-bg3` | `#cfc09e` | Archival tan for active tabs and hover wells |
| `--color-pmn-sb` | `#e2d4bc` | Warm ivory sidebar background |
| `--color-pmn-ink` | `#1a100a` | Deep printer's ink (near black) |
| `--color-pmn-ink2` | `#322014` | Warm espresso for secondary text |
| `--color-pmn-acc` | `#8b1e14` | Deep crimson accent (light theme) |
| `--color-pmn-acc2` | `#6a1610` | Darker crimson hover accent |
| `--color-pmn-mute` | `#7a6048` | Muted archival descriptors and metadata |
| `--color-pmn-mute2` | `#5e4832` | Secondary labels |
| `--color-pmn-mute3` | `#9e8468` | Placeholder text |
| `--color-pmn-rule` | `#c8b898` | Muted parchment borders |
| `--color-pmn-rule2` | `#b0a080` | Parchment offset drop-shadows |
| `--color-pmn-hdr` | `#e8dcc8` | Light sticky header background |

---

## 3. Typography Architecture

| Role | Typeface | Style / Weight | Usage Directives |
|---|---|---|---|
| **Headings & Titles** | Libre Baskerville | Serif, 400 & 700 | Manuscript part titles, chapter headers, modal banners |
| **Reading Prose** | Lora | Serif, 400 & 500 (Upright) | Body text, section content, analytical expositions |
| **UI Chrome & Code** | Source Code Pro | Monospace, 400, 600, 700 | Buttons, tags, section IDs (§X.Y), formulas, navigation |

### Important Typographic Directives
* **Lora Upright Standard:** Body text is set upright by default. *Italics are reserved strictly for conceptual emphasis, block quotes, Latin terms, and formal titles.* Universal italic styling across body paragraphs or glossaries is prohibited.
* **Prose Line Measure:** Reader container max-width is strictly constrained to `68ch` (`max-width: 68ch; margin-inline: auto`).
* **Formula Display:** Mathematical formulations (such as $T = S \cdot D \cdot P \cdot G$) use KaTeX serif display mode with monospace variable descriptors.

---

## 4. Page Structure & Interactive Sections

### A. Shared page shell (`PageHeader.tsx`)
* Contents, Glossary, Search, AI Guide and Rules & Data share one header (back · title · tools), one intro block
  (`.pg-intro`: eyebrow, `.pg-h1`, `.pg-lede`) and one footer. Tabs on the AI Guide and Rules & Data use `.pg-tabs`;
  each tab is a real link with its own URL (`#/guide/prompts`, `#/rules/terms`).
* One scroll container per page. No boxed inner panels that scroll on their own.

### B. Home
1. **Cover:** title, stats, primary actions.
2. **Reading Paths** (`ReadingPathsSection.tsx`): six compact cards. Steps are a titled, folding list; labels are the
   real section titles.
3. **How the Framework Is Built** (`TheoreticalAnatomySection.tsx`): one tabbed section: 3-layer stack, primary formula
   (§15.2, §15.4), capture sequence (§7.3c-i), axioms (§14.3, rendered by `AxiomStructureSection.tsx` with `embedded`,
   single column), Part directory.
4. **AI Workbench** (`AITerminal.tsx`): builds a prompt from the text plus an analytical role and opens the chosen chat
   service. Services are listed alphabetically with no model versions or rankings.
* On screens up to 960px the reference sections fold (`MobileCollapse.tsx`); homepage text is at least 12px.

### C. Axiom Structure layout rule
* Stand-alone, `.theses-inner` is a 2-column grid and must have exactly two children (`.theses-lead`, `.theses-main`).
  Embedded (`.theses-embedded`), it is a single column.

### D. AI Guide (`GuideView.tsx`)
* Five tabs: Start, Prompts, Questions, Developer, Endpoints. No model names or model matrix: model lists go stale, so
  the guide gives selection criteria and a five-minute test instead. Every section number cited in a prompt must exist
  and match its section's title and content.

### E. Mobile chrome (<= 960px)
* Text fields are 16px (iOS zooms on focus below that). Bottom nav uses the line icons in `NavIcon` (App.tsx), 11px labels
  and a bar on the active tab.

---

## 5. CSS Patterns & Utility Standards

### Archival Card Box-Shadow
```css
/* Hard-edged architectural drop shadow */
border: 1px solid var(--rule);
background: var(--bg2);
box-shadow: 8px 8px 0 var(--rule2);
```

### UI Chrome Buttons
```css
font-family: var(--f-mono);
font-size: 0.68rem;
letter-spacing: 0.12em;
text-transform: uppercase;
background: var(--bg2);
color: var(--ink2);
border: 1px solid var(--rule2);
padding: 0.35rem 0.75rem;
box-shadow: 2px 2px 0 var(--rule2);
border-radius: 2px;
cursor: pointer;
transition: transform 0.1s ease, border-color 0.15s ease;
```

### Accent Dividers
```css
/* Gradient hairline rule fading smoothly to the right */
background: linear-gradient(90deg, var(--acc), transparent 80%);
height: 1px;
opacity: 0.45;
```

---

## 6. CSS Architecture & Anti-Patterns to Avoid

```
src/index.css   → Tailwind v4 @import + @theme token definitions
style.css       → Master layout, animations, component styles, and dark/light variables
```

### Prohibited Anti-Patterns
1. **Never hardcode raw hex colors in component JSX or style.css.** Always reference CSS variables (`var(--acc)`, `var(--bg2)`, `var(--ink)`).
2. **Never place a 3rd child directly inside `.theses-inner`.** Always wrap controls and content in `.theses-main`.
3. **Do not use `mx-auto` on flex children inside `#reader-nav`.** Use `padding-inline: max(1rem, calc((100% - 960px) / 2))` for perfect centering.
4. **Never allow Indonesian strings in public frontend components.** Private drafts and translations belong strictly in internal workspace vaults.
