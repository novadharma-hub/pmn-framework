# PMN React UI Reconstruction PRD

**Document status:** Active recovery specification  
**Date:** 2026-06-07  
**Product:** PMN Interactive Manuscript Reader  
**Implementation:** React + TypeScript + Vite + Tailwind CSS with temporary legacy CSS compatibility  
**Primary visual baseline:** `..\private\Referensi Versi Lama\`  
**Technical audit:** `Dokumentasi_AI\PMN_UI_MIGRATION_AUDIT_2026-06-07.md`

---

## 1. Purpose

This PRD defines how the PMN React UI must be recovered after migration from the legacy HTML, CSS, and JavaScript implementation.

The target is not a generic modern redesign. The target is:

> A stable React implementation that restores the geometry, hierarchy, readability, interaction behavior, and editorial character of the accepted legacy PMN interface, while creating a maintainable foundation for future development.

This document exists because subjective instructions such as "make it centered", "clean up the layout", or "make light mode nicer" have produced local CSS patches without fixing the true layout owner.

For this project, visual work must be:

- reference-driven
- root-cause-driven
- measured
- browser-verified
- responsive
- reversible and reviewable

---

## 2. Problem Statement

The current React migration exhibits:

- blank-screen runtime failure after data loading
- elements that are mathematically or visually off-center
- boxes centered inside incorrectly positioned parents
- inconsistent left and right alignment
- text colliding with card borders
- insufficient separation between backgrounds, panels, and text fields
- excessive light-theme brightness and glare
- conflicting spacing scales
- competing Tailwind, legacy CSS, custom CSS, and inline styles
- dead controls and incomplete behavior
- desktop-specific layouts breaking at narrower widths
- AI fixes that modify symptoms rather than the first incorrect ancestor

The main problem is not a lack of individual CSS declarations. It is the absence of a shared layout contract and measurable completion criteria.

---

## 3. Product Goals

### G1. Restore runtime usability

The React application must render after data loading without framework errors.

### G2. Restore legacy visual fidelity

Major surfaces must match the accepted reference composition unless a deviation is explicitly approved.

### G3. Establish predictable geometry

Every major section must have a declared:

- containing block
- maximum width
- horizontal alignment reference
- padding contract
- grid or flex ownership
- responsive behavior

### G4. Produce comfortable dark and light themes

Both themes must preserve hierarchy and reading comfort. Light mode must not be a simple inversion or high-luminance white canvas.

### G5. Restore interaction parity

Every enabled control must work, every documented shortcut must be accurate, and navigation must preserve reading context.

### G6. Make future AI changes reliable

AI agents must diagnose parent-chain geometry, provide browser evidence, and avoid arbitrary offset patches.

---

## 4. Non-Goals

The following are outside the initial recovery scope:

- replacing the manuscript data pipeline
- changing the manuscript content
- introducing a new visual brand
- converting every legacy CSS rule to Tailwind immediately
- adding heavy animation or decorative effects
- introducing a large component library
- rewriting the full application from scratch
- optimizing bundle size before correctness and fidelity

---

## 5. Users and Use Cases

### Primary reader

Needs a calm, readable manuscript interface for long-form reading, navigation, notes, cross-references, and progress tracking.

### Returning reader

Needs reliable resume behavior, reading history, saved notes, highlights, and stable URLs or section references.

### Research-oriented reader

Needs search, Glossary, cross-references, section IDs, related modules, citation copying, and AI handoff.

### Maintainer or AI coding agent

Needs clear component ownership, design tokens, visual references, acceptance criteria, and tests that detect regressions.

---

## 6. Binding Design Principles

### 6.1 Editorial before decorative

Typography, alignment, spacing, contrast, and reading rhythm take priority over glass, blur, particles, shadows, and animation.

### 6.2 One layout owner per dimension

For a given component, one layer should own width, one should own horizontal positioning, and one should own internal padding. Avoid multiple ancestors independently applying compensating widths and offsets.

### 6.3 Fix the first incorrect ancestor

When a child appears displaced, inspect the parent chain and fix the earliest incorrect containing block.

### 6.4 Visual similarity requires geometric similarity

Matching colors and fonts is insufficient if widths, center lines, baselines, gaps, and proportions differ.

### 6.5 Dark and light are designed modes

Light mode must have its own surface and contrast decisions, not merely swapped text and background values.

### 6.6 No enabled dead controls

If an action is unavailable, it must be disabled and honestly explained, or removed.

---

## 7. Centering and Alignment Contract

This section is binding for all AI and human contributors.

### 7.1 "Center" must name a reference

Never implement a request to "center X" without determining which reference is intended:

1. text within its box
2. element within its immediate parent
3. content container within the page shell
4. composition within the viewport
5. reader column within the area beside the Sidebar
6. alignment to the legacy screenshot grid
7. optical centering with a documented offset

### 7.2 Definitions

#### Text-centered

Text lines are centered inside the content box. This says nothing about the box position.

#### Element-centered

The element's border-box center equals its immediate parent's content-box center.

#### Container-centered

The section's main container has equal free space on both sides of the available section area, subject to a defined max-width.

#### Viewport-centered

The target center equals `window.innerWidth / 2`.

#### Reading-area-centered

The target is centered within:

```text
viewport width - persistent Sidebar width - reserved page gutters
```

It may therefore not be centered in the physical viewport.

#### Grid-aligned

The target aligns to a declared grid line, central reading column, or another reference edge.

#### Optically centered

The target is deliberately offset from mathematical center because of unequal visual mass. This requires an explicit note and screenshot approval.

### 7.3 Measurement

For target `T` and reference `R`:

```text
T.centerX = T.left + T.width / 2
R.centerX = R.left + R.width / 2
deltaX = T.centerX - R.centerX

T.centerY = T.top + T.height / 2
R.centerY = R.top + R.height / 2
deltaY = T.centerY - R.centerY
```

Also record:

```text
leftSpace = T.left - R.left
rightSpace = R.right - T.right
spaceDifference = leftSpace - rightSpace
```

### 7.4 Default tolerances

| Target | Maximum unexplained delta |
|---|---:|
| Primary desktop composition | 2 px |
| Ordinary desktop component | 4 px |
| Mobile component | 3 px |
| Text baseline shared by adjacent controls | 2 px |
| Repeated card edge alignment | 2 px |

An approved optical adjustment may exceed these values only when documented.

### 7.5 Parent-chain diagnostic protocol

Before editing a displaced element, inspect:

```text
html
body
#root
application shell
page/view shell
section
section inner container
grid/flex wrapper
target box
target text
```

For every relevant node, inspect:

- bounding rectangle
- computed width and max-width
- margin and padding
- border width
- `box-sizing`
- display type
- grid columns and gap
- flex alignment
- position and inset
- transform
- overflow
- scrollbar occupancy
- inherited font metrics
- winning CSS declaration

### 7.6 Invalid centering fixes

The following are invalid unless the parent geometry has been verified:

- arbitrary `margin-left` or `padding-left`
- negative margins
- `left: 50%` plus transform
- unexplained `translateX`
- fixed pixel offsets tied to one viewport
- adding another wrapper solely to compensate
- using `text-align: center` to solve box positioning
- setting `width: 100vw` inside a padded or scrollable parent

### 7.7 Required completion evidence

Every major alignment change must report:

```text
Viewport:
Target:
Reference coordinate system:
Root cause:
Changed layout owner:
Before delta:
After delta:
Intentional optical offset:
Screenshot evidence:
Responsive checks:
```

An AI must not state "now centered" without runtime evidence.

---

## 8. Layout System Requirements

### 8.1 Application shell

- `html`, `body`, and `#root` must have an explicit height/min-height contract.
- The header must not silently change the available page height.
- The page shell must define whether child views or the document body scrolls.
- Desktop Sidebar width must be included in reader-area calculations.
- Mobile navigation must reserve space and must not cover content.

### 8.2 Global content containers

Use named container roles rather than unrelated max-width values:

| Container | Purpose |
|---|---|
| `--container-wide` | cover and broad editorial sections |
| `--container-page` | Contents, Guide, and standard page sections |
| `--container-reader` | prose and reader tools |
| `--container-dialog` | modal content |

Exact values may be tuned against references, but each surface must use a declared role.

### 8.3 Spacing

Adopt one spacing scale. Avoid accumulating nearby values such as 22, 23, 24, 25, and 26 pixels without reason.

Suggested base scale:

```text
4, 8, 12, 16, 24, 32, 48, 64, 80, 96
```

Optical typography adjustments may use smaller increments but must not become the general layout system.

### 8.4 Box model

- Default to `box-sizing: border-box`.
- A card's declared width must include padding and border.
- Text must never collide with borders.
- Minimum internal card padding:
  - desktop compact control: 12 px
  - desktop content card: 24 px
  - mobile content card: 16 px
- Long labels must wrap or truncate intentionally.

### 8.5 Grids

- Repeated cards must share explicit columns and gaps.
- Avoid mixing inline `gridColumn` ownership with conflicting stylesheet rules.
- Grid items must use `min-width: 0` where text may otherwise force overflow.
- Equal-height rows should be intentional, not accidental.

---

## 9. Color and Surface Requirements

### 9.1 General hierarchy

Each theme must visibly distinguish:

1. page background
2. elevated or grouped section background
3. card/panel surface
4. input/textarea surface
5. hover/active surface
6. border and divider
7. primary text
8. secondary text
9. muted metadata
10. accent

Background and text-box surfaces must not collapse into the same color.

### 9.2 Dark theme

Requirements:

- avoid pure black across every layer
- preserve subtle warm PMN undertones
- cards must be distinguishable without heavy shadows
- borders must be visible but subdued
- body text must remain comfortable for long reading
- red accent must not dominate large areas

### 9.3 Light theme

Light mode must be warm, low-glare, and editorial.

Requirements:

- no pure `#ffffff` as the dominant full-page reading background
- use warm paper-like background and slightly darker panels
- avoid low-contrast beige-on-beige text
- avoid bright red across large surfaces
- text fields must be clearly separated from surrounding cards
- shadows should remain subtle and warm
- the manuscript body must remain comfortable for extended reading

Suggested direction, subject to browser tuning:

```text
page background: warm off-white / paper
panel surface: slightly darker or more neutral than page
input surface: distinct recessed tone
primary text: near-black warm brown
secondary text: medium neutral brown
border: visible warm gray-brown
accent: restrained deep red
```

### 9.4 Contrast acceptance

- Normal text must target WCAG AA contrast.
- Muted metadata may be lower emphasis but must remain readable.
- Disabled controls must remain legible.
- Focus indicators must be visible in both themes.

---

## 10. Typography Requirements

- Preserve the PMN editorial combination:
  - serif display/headings
  - serif reading body
  - monospaced metadata and controls
- Heading wraps must be intentional and reference-aligned.
- Text must not overflow card boundaries.
- Use readable prose line length.
- Reader font scaling must not break navigation or endcap layout.
- Line-height must increase on narrow screens.
- Uppercase monospaced labels require sufficient letter spacing but must not exceed their containers.

---

## 11. Surface Requirements

### 11.1 Header

- Logo, search, filter, Deep Scan, and utility actions share a stable baseline.
- Search must not visually appear centered if the full header composition is unbalanced.
- At desktop widths, left and right groups must not force the search box away from its intended reference.
- At mobile widths, controls must collapse intentionally rather than shrink into collisions.

### 11.2 Cover

- Match `Versi Lama (2).png`.
- Main hero composition centers in the usable viewport.
- Orientation card must not alter hero centering because it is floating.
- Title, quote, statistics, and CTA widths align to one central axis.
- First viewport must not clip essential actions.

### 11.3 Reading Paths

- Match `Reading Paths.png`.
- Header copy aligns to the same section container as cards.
- Metadata boxes align precisely with the card grid.
- Card titles and buttons must not collide or drift vertically.

### 11.4 Theoretical Anatomy

- Match `Theoretical Anatomy.png`.
- Sidebar and content panel form one coherent bounded component.
- Active part state is visually unmistakable.
- Internal overflow must not resize the whole page unexpectedly.

### 11.5 Axiom Structure

- Match both Axiom reference images.
- Tier headers, row numbers, titles, and disclosure arrows use stable columns.
- Expansion must preserve row alignment.

### 11.6 Reader Desk

- Match `Reader Desk.png`.
- Notes panel is dominant.
- Copy, Clear, and Save are functional.
- Smaller cards align vertically and use distinct surfaces.
- Textarea is visibly separate from its card.

### 11.7 Contents, Glossary, and Search

- Page title centers in the declared page container, not simply in the middle grid cell.
- Back navigation and controls must not distort the title center.
- Search filters must affect results.
- Result snippets cannot overflow or inject unsafe layout.

### 11.8 Reader

- Reader column centers in the reading area, accounting for Sidebar width.
- Prose width changes must remain centered within that reading area.
- Reader header controls must not collide.
- Sidebar collapse must recalculate available space.
- Endcap panels must share the prose alignment grid.
- Related links, notes, and citation controls must work.

### 11.9 Dialogs and palettes

- Center relative to viewport unless explicitly attached to another surface.
- Use consistent modal max-width and safe viewport padding.
- Never overflow vertically without an internal scroll region.
- Trap focus and restore focus on close.

---

## 12. Responsive Requirements

Required test viewports:

| Category | Viewport |
|---|---|
| Large desktop | 1440 x 900 |
| Standard desktop | 1280 x 720 |
| Tablet landscape | 1024 x 768 |
| Tablet portrait | 768 x 1024 |
| Mobile | 390 x 844 |
| Small mobile | 360 x 800 |

At every viewport:

- no unintended horizontal scroll
- no text-border collisions
- no control overlap
- no hidden primary action
- no content behind fixed navigation
- no unexplained center drift
- cards stack in a deliberate order
- text remains readable without zoom

---

## 13. Interaction Requirements

- Start Reading opens the intended Contents/entry flow.
- Key Terms opens Glossary, not the generic Contents map.
- Resume opens the saved section.
- Part filter changes search results.
- Previous and next section navigation work.
- Cross-references preserve history or jump-back behavior.
- Every keyboard shortcut matches its documentation.
- Notes, highlights, and reading progress persist correctly.
- Copy actions provide visible feedback.
- AI Guide uses one canonical React navigation path.
- No enabled button is inert.

---

## 14. Accessibility Requirements

- All inputs have labels.
- All icon-only controls have accessible names.
- Dialogs use proper semantics.
- Accordions expose expansion state.
- Tabs expose selection state.
- Focus is always visible.
- Modal focus is trapped and restored.
- Keyboard interaction works without pointer input.
- Reduced-motion preference disables nonessential motion.
- Meaning is not conveyed by color alone.

---

## 15. Technical Requirements

### 15.1 Runtime

- No conditional Hook-order violations.
- No relevant console errors or framework overlays.
- localStorage parsing must be guarded.
- Global event listeners must be cleaned up using identical references.

### 15.2 CSS ownership

During recovery:

- legacy CSS may remain where it owns accepted reference visuals
- new component CSS or Tailwind may own newly isolated surfaces
- no property should be unknowingly owned by multiple layers
- replacement work must delete superseded rules
- unexplained `!important` additions are prohibited

### 15.3 TypeScript

Type hardening is staged, but new props and shared data structures should avoid `any`.

### 15.4 Navigation

Define a direct-link and browser-history contract compatible with GitHub Pages.

---

## 16. AI Work Protocol

Every AI session performing UI work must follow this sequence.

### Step 1: State the target

Example:

```text
Target: center the hero CTA group within the hero content container at 1280 x 720.
Not requested: center text inside each button.
```

### Step 2: Identify the coordinate system

State whether the reference is:

- parent
- page container
- viewport
- reading area
- reference screenshot grid

### Step 3: Inspect before editing

Collect:

- screenshot
- DOM snapshot
- bounding boxes
- computed styles
- winning CSS rules
- relevant ancestors

### Step 4: Name the root cause

Examples:

```text
The text is centered, but the CTA wrapper is 42 px right of the hero container center because its parent inherits asymmetric right padding.
```

```text
The Reader column is centered in the viewport instead of the post-Sidebar reading area.
```

### Step 5: Edit the layout owner

Change the first incorrect ancestor or shared token. Avoid child compensation.

### Step 6: Verify

Repeat measurements and screenshot at required viewports.

### Step 7: Report honestly

Use:

```text
Fixed:
Root cause:
Evidence:
Viewports tested:
Remaining mismatch:
```

Do not use:

```text
Should be centered now.
Looks fixed.
Added margin auto.
```

---

## 17. Visual QA Checklist

For every surface:

- [ ] Correct reference image identified
- [ ] Correct viewport used
- [ ] Main container center measured
- [ ] Left/right free space compared
- [ ] Top/bottom rhythm compared
- [ ] Repeated edges aligned
- [ ] Text does not touch borders
- [ ] Background layers are distinguishable
- [ ] Dark theme checked
- [ ] Light theme checked
- [ ] Mobile checked
- [ ] Console checked
- [ ] Interaction checked
- [ ] Before/after screenshots recorded

---

## 18. Delivery Phases

### Phase A: Runtime and smoke test

- repair Hook order
- render Home
- add browser smoke test

### Phase B: Foundations

- define layout containers
- define canonical tokens
- establish dark/light surfaces
- define spacing and typography scales

### Phase C: Home reconstruction

- Header
- Cover
- Reading Paths
- Anatomy
- Axioms
- AI Terminal
- Reader Desk

### Phase D: Application views

- Contents
- Glossary
- Search
- Guide

### Phase E: Reader reconstruction

- Sidebar
- reading-area geometry
- Reader header
- prose
- xrefs
- endcap

### Phase F: Mobile and accessibility

- all required viewports
- keyboard and modal behavior
- reduced motion

### Phase G: Consolidation

- remove superseded CSS
- reduce inline styles and `!important`
- strengthen TypeScript
- finalize regression tests

---

## 19. Acceptance Gates

### Gate 1: Runtime

- Home renders after data load.
- No React runtime error.
- Smoke flow reaches Reader.

### Gate 2: Behavior

- No P1 interaction failures remain.
- Shortcut documentation and implementation match.

### Gate 3: Desktop fidelity

- Accepted screenshots at 1440 x 900 and 1280 x 720.
- No unexplained primary alignment delta above tolerance.

### Gate 4: Responsive

- Required tablet and mobile viewports pass.

### Gate 5: Themes

- Dark and light themes accepted.
- Light theme is warm, readable, and non-glare.

### Gate 6: Accessibility

- Keyboard, focus, dialog, label, and contrast checks pass.

### Gate 7: Maintainability

- Each major surface has clear CSS ownership.
- Smoke and visual checks are repeatable.
- Documentation reflects tested reality.

---

## 20. Definition of Done

The UI reconstruction is complete only when:

- the application is stable at runtime
- accepted legacy visual identity is restored
- alignment is measured against declared coordinate systems
- cards, text fields, and page backgrounds have clear hierarchy
- light mode is comfortable and intentionally designed
- no text collides with boxes
- desktop and mobile layouts pass
- all visible controls work
- accessibility baseline passes
- future AI agents can identify layout ownership without guessing
- automated smoke testing catches blank-screen regressions

---

## 21. Required Reading Order for AI Agents

1. `PRD.md`
2. `Dokumentasi_AI/PMN_UI_MIGRATION_AUDIT_2026-06-07.md`
3. `Dokumentasi_AI/PMN_REACT_MIGRATION_STATE.md`
4. Relevant source component
5. Matching screenshot in `..\private\Referensi Versi Lama\`

When documents conflict, this PRD and the dated audit take precedence over the older migration-state claims until those claims are revalidated in the browser.

