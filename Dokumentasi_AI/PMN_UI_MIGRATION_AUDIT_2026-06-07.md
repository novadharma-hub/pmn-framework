# PMN UI Migration Audit and Recovery Plan

**Audit date:** 2026-06-07  
**Auditor:** OpenAI Codex  
**Project:** Progressive Materialist Naturalism (PMN) Interactive Manuscript Reader  
**Workspace:** `D:\Master-Universe\pmn-workspace\public`  
**Migration:** HTML + CSS + JavaScript to React + TypeScript + Vite + Tailwind CSS  
**Primary focus:** UI fidelity, runtime stability, interaction parity, responsive behavior, accessibility, and maintainability

---

## 0. Instructions for the Next AI Agent

Read this document before editing the React UI.

The current migration is **not ready for visual polishing yet**. There is a P0 React runtime failure that causes the application to become blank after data loading. Fix and verify that blocker first, then restore behavior, then compare visual fidelity.

Do not treat a successful `npm run build` or `npx tsc --noEmit` as proof that the application works. Both commands passed during this audit while the browser rendered an empty application.

Recommended order:

1. Fix the Hooks-order runtime crash.
2. Add a repeatable browser smoke test.
3. Restore interaction parity and remove dead controls.
4. Establish a visual baseline from the legacy screenshots.
5. Repair desktop layout one surface at a time.
6. Repair mobile layout.
7. Consolidate CSS only after visual parity is stable.

Do not rewrite `App.tsx`, `ReaderView.tsx`, or `style.css` wholesale. The worktree contains extensive uncommitted migration work and generated content changes.

---

## 1. Executive Summary

The architectural direction is reasonable. React, TypeScript, Vite, and component separation can make future UI development safer and more efficient for both humans and AI agents.

However, the current migration has three different levels of incompleteness:

1. **Runtime stability is broken.** The application crashes after loading its JSON data because `App` calls a Hook after conditional returns.
2. **Behavioral parity is incomplete.** Several visible controls do nothing, search filtering is disconnected, documented shortcuts do not match implementation, and a legacy HTML link points to a deleted file.
3. **Visual migration is structurally fragile.** React JSX, Tailwind utilities, a 2,247-line legacy stylesheet, a second CSS file full of overrides, and many inline styles all compete for ownership of layout and appearance.

Current release recommendation:

> **Do not deploy the current React build as the primary public reader until P0 and P1 findings are resolved and browser QA passes.**

Confidence levels used in this report:

- **Runtime-confirmed:** reproduced in the browser.
- **Source-confirmed:** directly evident from current source code.
- **Visual-reference-confirmed:** evident from supplied legacy screenshots.
- **Pending runtime verification:** cannot be fully tested because the P0 blank-screen crash blocks navigation.

---

## 2. Scope and Evidence

### 2.1 Files inspected

- `src/App.tsx`
- `src/main.tsx`
- `src/index.css`
- `src/components/ReaderView.tsx`
- `src/components/ContentsView.tsx`
- `src/components/Sidebar.tsx`
- `src/components/CommandPalette.tsx`
- `src/components/AITerminal.tsx`
- `src/components/KeyboardModal.tsx`
- `src/components/NotesModal.tsx`
- `src/components/GuideView.tsx`
- `src/components/VersionManager.tsx`
- `style.css`
- `vite.config.js`
- `tsconfig.json`
- `package.json`
- `Dokumentasi_AI/PMN_REACT_MIGRATION_STATE.md`

### 2.2 Legacy visual references inspected

Reference directory:

`D:\Master-Universe\pmn-workspace\private\Referensi Versi Lama`

Key references:

- `Versi Lama (1).png`: reader and lower reader surfaces
- `Versi Lama (2).png`: full desktop cover
- `Reading Paths.png`
- `Theoretical Anatomy.png`
- `Axiom Structure (1).png`
- `Axiom Structure (2).png`
- `Reader Desk.png`
- `Release snapshot.png`
- remaining `Versi Lama (3-24).png` supporting details and responsive states

The reference set contains desktop-wide, section-detail, narrow, and mobile-sized captures. It should be treated as the visual acceptance baseline unless the product owner explicitly approves a redesign.

### 2.3 Commands and runtime checks

The following passed:

```powershell
npm run build
npx tsc --noEmit
```

Build result at audit time:

```text
dist/index.html                 0.79 kB
dist/assets/main-*.css        140.33 kB
dist/assets/main-*.js         261.13 kB
```

Browser test URL:

```text
http://127.0.0.1:5173/pmn-framework/
```

Browser result:

```text
React warning: change in the order of Hooks called by App
Error: Rendered more hooks than during the previous render.
```

Observed DOM after failure:

```text
#root children: 0
body visible text: empty
```

This is a full application blocker, not a cosmetic warning.

---

## 3. Severity Model

| Priority | Meaning |
|---|---|
| P0 | Application unusable, blank, crashes, or data/navigation fundamentally inaccessible |
| P1 | Major user-facing workflow broken or misleading |
| P2 | Significant visual, responsive, accessibility, or maintainability regression |
| P3 | Polish, consistency, optimization, or future-hardening issue |

---

## 4. Findings

### P0-01: React application becomes blank after loading

**Status:** Runtime-confirmed  
**Owner:** `src/App.tsx`  
**Relevant lines:** conditional returns around lines 114-126; `useEffect` around line 150

`App` returns early while `loading` is true:

```tsx
if (loading) return (...)
if (loadError || !data) return (...)
```

A later `useEffect` is declared after those returns:

```tsx
useEffect(() => {
  // content width initialization
}, [])
```

First render calls fewer Hooks than the render after data loading. React therefore throws:

```text
Rendered more hooks than during the previous render.
```

**User impact**

- Initial loading indicator may appear briefly.
- The app then becomes an empty dark page.
- Home, Contents, Reader, Guide, Notes, and Admin are all inaccessible.

**Required fix**

Move every Hook above all conditional returns. Prefer consolidating content-width initialization into the existing local-storage initialization effect.

**Acceptance criteria**

- No Hook-order warning or error.
- `#root` remains populated after data resolves.
- Home screen renders meaningful content.
- Browser console has no React error.
- Reload works with both empty and populated localStorage.

---

### P1-01: UI advertises shortcuts that are not implemented

**Status:** Source-confirmed  
**Owners:** `src/App.tsx`, `src/components/KeyboardModal.tsx`, `src/components/ReaderView.tsx`

The keyboard modal advertises:

- `C`: Contents
- `R`: resume reading
- `?`: Glossary
- Right arrow or `N`: next section
- Left arrow or `P`: previous section
- `A+` / `A-`: reader text size
- `Ctrl+S`: save note

The actual global handler only implements:

- `K`: toggle keyboard modal
- `N`: toggle Notes modal
- `/`: open command palette
- `F`: focus mode

There is a direct conflict: the modal says `N` means next section, while implementation uses `N` for Notes.

The cover also displays `[C]`, `[R]`, and `[?]` hints that are not implemented by the global handler.

**User impact**

- Visible help documentation is false.
- Keyboard-oriented users lose trust in the interface.
- `N` performs an unexpected action.

**Required decision**

Choose one canonical shortcut contract, then implement it in one centralized keyboard map. The modal and visible hints must be generated from or tested against that contract.

**Acceptance criteria**

- Every documented shortcut works.
- No shortcut has two meanings.
- Shortcuts do not fire while typing in input, textarea, select, or contenteditable elements.
- Modal copy matches behavior exactly.

---

### P1-02: Search part filter is disconnected

**Status:** Source-confirmed  
**Owners:** `src/App.tsx`, `src/components/ContentsView.tsx`

`App` maintains `searchPartFilter` and renders an `All parts` select. However, the value is not passed into `ContentsView`, and the search calculation loops over all parts.

**User impact**

- Selecting a part appears to work visually.
- Results are not filtered.
- The control is misleading.

**Required fix**

Pass the selected part filter into `ContentsView` and apply it before scanning subsections.

**Acceptance criteria**

- `All parts` searches the full corpus.
- Selecting one part restricts results to that part.
- Clearing search also clears the filter only if that is the intended UX.
- Search result count updates immediately.

---

### P1-03: Multiple visible controls are dead

**Status:** Source-confirmed

Dead or incomplete controls found:

| Surface | Control | Source |
|---|---|---|
| Home AI Terminal | Primary `Open ChatGPT` beside the question input | `AITerminal.tsx` |
| Reader endcap | `Copy Citation` | `ReaderView.tsx` |
| Reader Desk | `Copy` | `App.tsx` |
| Reader Desk | `Clear` | `App.tsx` |
| Reader Desk | Notes textarea persistence | `App.tsx` |
| Command Palette | Glossary result selection | `CommandPalette.tsx` contains a placeholder comment |

Some duplicate secondary controls do work, which makes the dead primary controls more confusing.

**Required fix**

Either implement each control or remove/disable it with honest explanatory copy. Do not leave button styling on inert elements.

**Acceptance criteria**

- Every enabled button causes a visible, testable result.
- Clipboard actions show non-blocking feedback.
- Disabled functions use a disabled state and explain why.

---

### P1-04: AI Guide links use two incompatible navigation systems

**Status:** Source-confirmed  
**Owners:** `src/App.tsx`, `src/components/AITerminal.tsx`

The React app now includes a `GuideView` page and uses state navigation from the cover. `AITerminal`, however, still links to:

```html
pmn-agent-guide.html
```

That legacy file is currently deleted from the worktree and no longer exists in the build output.

With Vite base `/pmn-framework/`, relative HTML navigation is also more fragile than using the React view.

**User impact**

- `Open guide` from the AI Terminal can lead to a 404.
- Guide behavior differs depending on entry point.

**Required fix**

Pass an `onOpenGuide` callback into `AITerminal`, or establish a real router and one canonical Guide route.

---

### P1-05: Reader global click listener is never removed

**Status:** Source-confirmed  
**Owner:** `src/components/ReaderView.tsx`  
**Relevant area:** lines 223-241

The component registers an anonymous function:

```tsx
window.addEventListener('click', (e) => {
  // ...
})
```

Cleanup attempts:

```tsx
window.removeEventListener('click', dismiss)
```

These are different function references. The anonymous listener remains active.

The effect depends on `toolbar.range`, so more global listeners may accumulate as selection state changes.

**User impact**

- Increasing duplicate state updates over time.
- Hard-to-debug tooltip/highlight dismissal behavior.
- Potential performance degradation during long reading sessions.

**Required fix**

Create one named click handler inside the effect and remove that exact handler in cleanup.

---

### P1-06: Migration documentation incorrectly reports critical stability

**Status:** Source and runtime-confirmed  
**Owner:** `Dokumentasi_AI/PMN_REACT_MIGRATION_STATE.md`

The existing migration state document reports critical bugs as fixed and states that the build is healthy. It does not account for the Hook-order runtime crash.

**Risk**

- A future AI may trust the document and begin visual refactoring without opening the app.
- A green build may be mistaken for release readiness.

**Required fix**

Update the migration state document after P0 repair. Link this audit and record browser verification, not only build verification.

---

### P2-01: CSS ownership is split across four competing systems

**Status:** Source-confirmed

Current styling sources:

1. Tailwind utility classes in JSX.
2. `src/index.css` with Tailwind theme tokens and custom overrides.
3. `style.css`, a 2,247-line legacy master stylesheet.
4. Inline React style objects.

Measured during audit:

- `style.css`: approximately 108 KB and 2,247 lines.
- Combined production CSS: approximately 140 KB.
- Inline `style={{...}}` occurrences in TSX: 142.
- `!important` occurrences in `src/index.css` and `style.css`: 135.

The same selectors are defined repeatedly, including:

- `#hdr`
- `#hdr-srch`
- `#mob-nav`
- `.anatomy-terminal`
- `.home-bottom`

**User impact**

- A local change can unexpectedly alter distant surfaces.
- Desktop fixes can break mobile.
- Tailwind classes may appear correct in JSX but lose in the cascade.
- AI agents cannot easily identify the authoritative styling source.

**Recommendation**

Do not immediately delete legacy CSS. First assign ownership by surface:

| Surface | Temporary owner |
|---|---|
| Cover and legacy homepage sections | `style.css` |
| New modal shells | Tailwind/component CSS |
| Reader prose typography | `style.css` until parity |
| New application state/layout glue | Tailwind |

After parity, migrate one surface at a time and delete the replaced legacy rules in the same change.

---

### P2-02: Two design-token namespaces are mixed

**Status:** Source-confirmed

Legacy CSS primarily uses:

```css
--bg
--bg2
--ink
--acc
--rule
--f-head
--f-body
--f-mono
```

Tailwind-oriented code and newer custom CSS also use:

```css
--pmn-bg
--pmn-bg2
--pmn-ink
--pmn-acc
--pmn-rule
--font-pmn-head
```

Some inline controls reference `var(--pmn-bg2)` while legacy surfaces use `var(--bg2)`.

**Risk**

- Light theme and dark theme can diverge.
- A token can be undefined depending on where it was declared.
- Components can have mismatched foreground/background colors.

**Recommendation**

Define one canonical semantic token layer, with temporary aliases:

```css
:root {
  --color-bg: ...;
  --color-surface: ...;
  --color-text: ...;
  --color-accent: ...;
  --color-border: ...;

  /* Temporary compatibility aliases */
  --bg: var(--color-bg);
  --pmn-bg: var(--color-bg);
}
```

Do not perform this token migration before screenshots can be compared after every change.

---

### P2-03: `App.tsx` remains a large mixed-responsibility component

**Status:** Source-confirmed

Current component sizes:

| Component | Approximate lines |
|---|---:|
| `App.tsx` | 568 |
| `ReaderView.tsx` | 409 |
| `GuideView.tsx` | 383 |
| `ContentsView.tsx` | 325 |
| `VersionManager.tsx` | 321 |
| `NotesModal.tsx` | 317 |

`App.tsx` owns:

- application navigation
- JSON loading
- theme
- localStorage synchronization
- global shortcuts
- search state
- reading history
- cover
- reading paths
- theoretical anatomy
- axiom accordion
- AI terminal section
- reader desk
- admin login

React migration has split some files, but the most visually complex homepage is still embedded in the application root.

**Recommendation**

After runtime recovery, extract without redesign:

```text
src/components/home/HomeView.tsx
src/components/home/HeroSection.tsx
src/components/home/ReadingPathsSection.tsx
src/components/home/AnatomySection.tsx
src/components/home/AxiomSection.tsx
src/components/home/ReaderDeskSection.tsx
```

Each extraction must preserve existing IDs and classes until visual parity is verified.

---

### P2-04: TypeScript safety is intentionally weakened

**Status:** Source-confirmed

`tsconfig.json` currently has:

```json
"strict": false,
"strictNullChecks": false,
"noImplicitAny": false,
"noEmitOnError": false,
"allowJs": true,
"checkJs": false
```

The TSX source also contains multiple `any` usages.

This helps an early migration compile, but it reduces the expected long-term benefit of TypeScript. Prop mismatches, invalid data assumptions, and state-shape problems can pass compilation.

**Recommendation**

Do not enable full strict mode in one step. Use staged hardening:

1. Define shared manuscript data types.
2. Remove `any` from component props.
3. Enable `noImplicitAny`.
4. Enable `strictNullChecks`.
5. Enable `strict`.
6. Set `noEmitOnError: true`.

---

### P2-05: Accessibility is inconsistent

**Status:** Source-confirmed, pending full runtime audit

Positive examples:

- Notes modal includes `role="dialog"` and `aria-modal`.
- Sidebar font controls include an accessible group label.

Gaps:

- Command Palette has no dialog semantics.
- Several icon-only buttons rely only on symbols or `title`.
- Search input has no visible or programmatic label.
- Part filter has no label.
- Modal focus trapping and focus restoration are not consistently implemented.
- Accordion buttons do not expose `aria-expanded` and `aria-controls`.
- Active tabs do not consistently use tab semantics or `aria-selected`.
- Color controls for highlights rely heavily on color.

**Acceptance criteria**

- Keyboard-only navigation reaches every control.
- Focus is visible.
- Opening a modal moves focus into it.
- Closing a modal returns focus to the trigger.
- Dialog background content is not keyboard-active.
- Interactive states are exposed programmatically.

---

### P2-06: Potential encoding/mojibake remains in UI source

**Status:** Source inspection indicates risk; browser verification blocked

Some terminal reads display sequences such as:

```text
â†—
âœ¦
âŒ¨
Ã—
```

This may be a real source-encoding problem or a PowerShell display-codepage issue. It must be verified in the browser after P0 is fixed.

Files requiring verification:

- `src/components/AITerminal.tsx`
- `src/components/KeyboardModal.tsx`
- migration documentation files

**Acceptance criteria**

- Arrows, close symbols, keyboard symbols, ellipses, and check marks display correctly.
- Files are saved as UTF-8.
- No replacement character appears in rendered UI.

---

### P2-07: Global navigation is state-only and has no URL contract

**Status:** Source-confirmed

The application uses:

```tsx
setPage('home' | 'contents' | 'reader' | 'guide' | ...)
```

There is no visible routing contract for:

- direct links to Guide
- direct links to Contents/Glossary
- direct links to a manuscript section
- browser Back/Forward behavior
- reload persistence of the current surface

The legacy PMN QA requirements specifically include hash bootstrap and hashchange behavior. Those paths are not clearly represented in the new root application.

**Recommendation**

Before introducing a routing library, decide the URL contract:

```text
/pmn-framework/
/pmn-framework/contents
/pmn-framework/glossary
/pmn-framework/guide
/pmn-framework/reader#3.4b
```

For a static GitHub Pages deployment, hash routing may be safer unless a 404 fallback is configured.

---

### P2-08: Reader navigation parity is incomplete or not demonstrated

**Status:** Pending runtime verification with source-level concerns

Required PMN reader paths:

- open by hash
- react to hash changes
- inline cross-reference
- related section
- referenced-in section
- TOC selection
- Sidebar selection
- previous section
- next section
- jump-back behavior

Current React code visibly handles some xrefs and related sections, but the complete matrix was not executable because of P0.

There is no clear previous/next navigation implementation in the inspected Reader UI, despite keyboard documentation advertising it.

---

### P2-09: Responsive layout is high risk

**Status:** Source and visual-reference-confirmed; runtime verification blocked

The legacy references include narrow and mobile captures, but the React source contains desktop-specific grids and fixed dimensions:

- Contents header uses a three-column grid and `h-[100px]`.
- Reader navigation uses `grid-cols-[1fr_2.5fr_1fr]`.
- Reader controls contain multiple horizontally arranged control groups.
- Homepage Reader Desk includes inline 12-column grid ownership.
- Theoretical Anatomy has both legacy flex rules and newer grid rules.
- Mobile bottom navigation uses generic arrows without page labels.

`style.css` has several overlapping mobile media-query blocks around the same 680px breakpoint. Newer overrides are added later in the file, increasing cascade uncertainty.

**Required viewports**

- 1440 x 900
- 1280 x 720
- 1024 x 768
- 768 x 1024
- 390 x 844
- 360 x 800

Test both dark and light themes at least once on desktop and mobile.

---

### P2-10: Visual hierarchy has drifted from the legacy reference

**Status:** Visual-reference-confirmed plus source comparison; current React render blocked

The reference design has a clear visual grammar:

- restrained black/brown editorial palette
- red used as a precise structural accent
- large serif display typography
- monospaced labels and controls
- thin rules and rectangular panels
- wide breathing room
- low-radius, almost print-like geometry
- consistent alignment to a central reading column

Current source adds newer effects and competing styling:

- glassmorphism header
- backdrop blur
- rounded utility classes
- multiple shadow languages
- animated overlays
- large fixed z-index overlays
- mixed Tailwind spacing and legacy spacing

These additions may be aesthetically valid, but they are not automatically fidelity-preserving. Any intentional redesign must be explicitly approved. Otherwise, restore the reference grammar first.

---

### P2-11: Visual requests such as "make it centered" are underspecified and encourage symptom patches

**Status:** Process and architecture-confirmed

The current UI has nested layout ownership:

```text
viewport
-> application root
-> page shell
-> view scroller
-> section
-> section container
-> grid/flex wrapper
-> card or text box
-> text content
```

An element can have `text-align: center` while its box remains off-center. A box can be centered inside an incorrectly sized parent while the parent itself is off-center in the viewport. A mathematically centered composition can also appear optically off-center because of a Sidebar, asymmetric decoration, scrollbar, floating card, or unequal visual weight.

Therefore, instructions such as these are not sufficient:

```text
make this more centered
align this properly
move it slightly left
fix the spacing
```

They often produce local patches such as `text-align`, arbitrary margins, transforms, or negative offsets without identifying the first incorrect ancestor.

#### Required centering vocabulary

Every alignment task must identify the intended coordinate system:

| Term | Meaning |
|---|---|
| Text-centered | Inline text is centered inside its own content box |
| Element-centered | The element's border box is centered inside its immediate parent |
| Container-centered | The main content container is centered in the available page area |
| Viewport-centered | The target center aligns with the browser viewport center |
| Reading-area-centered | The target centers in the area remaining after persistent UI such as a Sidebar |
| Grid-aligned | Edges or centers align to the declared page grid or reference column |
| Optically centered | A measured adjustment compensates for asymmetric visual weight |

#### Required root-cause inspection chain

Before changing CSS, inspect:

1. target text alignment
2. target element width and box model
3. immediate parent display mode, width, padding, gap, and alignment
4. every ancestor with width, max-width, margin, transform, position, overflow, grid, or flex rules
5. persistent Sidebar/header/mobile-nav space
6. scrollbar and viewport dimensions
7. competing rules and computed-style winner
8. visual reference geometry

The fix should be made at the **first incorrect layout owner**, not necessarily on the visibly displaced child.

#### Prohibited completion claims

An AI must not say an item is centered merely because it added:

```css
text-align: center;
margin-inline: auto;
justify-content: center;
left: 50%;
transform: translateX(-50%);
```

These declarations solve different problems and may conceal an incorrect parent width.

#### Required evidence

For important alignment fixes, record:

- viewport size
- target selector
- intended center reference
- target bounding box
- reference-parent bounding box
- left and right free space
- before screenshot
- after screenshot
- any intentional optical offset

For horizontal geometric centering:

```text
targetCenterX = target.left + target.width / 2
referenceCenterX = reference.left + reference.width / 2
centerDeltaX = targetCenterX - referenceCenterX
```

Default acceptance tolerance:

- primary desktop composition: `abs(centerDeltaX) <= 2px`
- ordinary desktop component: `abs(centerDeltaX) <= 4px`
- mobile component: `abs(centerDeltaX) <= 3px`
- intentional optical adjustment: documented and screenshot-approved

See `PRD.md` for the binding UI reconstruction requirements.

---

### P3-01: Bundle is acceptable but not yet optimized

**Status:** Build-confirmed

Production bundle:

- JS: approximately 261 KB raw, 78 KB gzip
- CSS: approximately 140 KB raw, 25 KB gzip

This is not the main current problem. Runtime correctness and UI fidelity are higher priority.

Future optimization candidates:

- lazy-load Admin and Guide
- reduce duplicate CSS after parity
- consider loading large manuscript data by part
- defer particle effects on reduced-motion or low-power contexts

---

### P3-02: No automated UI regression safety net

**Status:** Source-confirmed

`package.json` exposes:

```json
"dev": "vite",
"build": "vite build",
"preview": "vite preview"
```

There is no lint, unit, component, or browser test script.

This allowed a full blank-screen regression to coexist with a green build.

Minimum recommended scripts:

```json
"typecheck": "tsc --noEmit",
"test:smoke": "playwright test",
"test:ui": "playwright test tests/ui",
"check": "npm run typecheck && npm run build && npm run test:smoke"
```

At minimum, a smoke test must assert that the app renders after JSON loading.

---

## 5. Visual Fidelity Baseline

### 5.1 Cover

Reference: `Versi Lama (2).png`

Required characteristics:

- full-width editorial header
- centered three-line title with italic red `Naturalism`
- controlled red atmospheric particle field
- centered quote and thin separators
- four-column statistics panel
- strong full-width primary CTA
- secondary action row
- floating orientation card at lower right
- content fits the first desktop viewport without accidental clipping

Do not judge cover parity only from individual elements. Compare the full 1919 x 987 composition.

### 5.2 Reading Paths

Reference: `Reading Paths.png`

Required characteristics:

- heading and explanatory copy share one top row
- three metadata panels underneath
- 2 x 2 equal card grid
- red top edge per card
- strong serif titles
- ghost card numbers in lower-right corners
- consistent card height and CTA alignment

### 5.3 Theoretical Anatomy

Reference: `Theoretical Anatomy.png`

Required characteristics:

- fixed-height terminal-like panel
- left part list approximately one-third width
- clear active red part row
- right content panel with badge, title, excerpt, and section list
- internal scrolling rather than page-level layout collapse

### 5.4 Axiom Structure

References:

- `Axiom Structure (1).png`
- `Axiom Structure (2).png`

Required characteristics:

- tier headings visibly separate conceptual levels
- rows remain compact and editorial
- number, title, and arrow align consistently
- expanded content does not destroy surrounding rhythm

### 5.5 Reader Desk

Reference: `Reader Desk.png`

Required characteristics:

- dominant notes card
- two narrower action/reference cards
- explicit Copy, Clear, and Save controls
- large readable notes textarea
- strong editorial title and explanatory copy
- responsive stacking that preserves action clarity

Current React source visually renders Copy and Clear buttons but does not implement them.

### 5.6 Reader

Reference: `Versi Lama (1).png` and related captures

Required characteristics:

- persistent manuscript navigation on desktop
- clear current section state
- constrained prose measure
- readable serif body typography
- working cross-references
- related/referenced navigation
- notes and AI handoff near the end of a section
- stable back/forward reading workflow

---

## 6. Feature-Parity Matrix

Use this table as a living checklist. Do not mark an item complete without browser proof.

| Surface | Feature | Current audit state |
|---|---|---|
| Application | Loads after JSON fetch | **FAIL - P0** |
| Application | No React console error | **FAIL - P0** |
| Home | Cover visual parity | Blocked |
| Home | Start Reading | Blocked |
| Home | Resume Reading | Source present, runtime blocked |
| Home | Key Terms opens Glossary | Incorrect wiring: currently same action as Start Reading |
| Home | Orientation tip close/persist | Source present, runtime blocked |
| Home | Reading Path buttons | Source present, runtime blocked |
| Home | Anatomy tabs | Source present, runtime blocked |
| Home | Axiom accordions | Source present, runtime blocked |
| Home | Reader Desk Copy/Clear/Save | Incomplete |
| Search | Query results | Source present, runtime blocked |
| Search | Part filter | **FAIL - disconnected** |
| Contents | Map navigation | Source present, runtime blocked |
| Glossary | Group rendering | Source present, runtime blocked |
| Reader | Sidebar selection | Source present, runtime blocked |
| Reader | Inline xrefs | Source present, runtime blocked |
| Reader | Related sections | Source present, runtime blocked |
| Reader | Previous/next | Not demonstrated |
| Reader | Mark as read | Source present, runtime blocked |
| Reader | Auto-mark after 3 seconds | Source present, runtime blocked |
| Reader | Notes save | Source present, runtime blocked |
| Reader | Copy Citation | **FAIL - dead button** |
| Reader | Highlighting | Source present, runtime blocked |
| Reader | Tooltip dismissal cleanup | **FAIL - listener leak** |
| AI Terminal | Copy prompt | Source present |
| AI Terminal | Primary ChatGPT open button | **FAIL - dead button** |
| AI Terminal | Gemini open button | Source present |
| AI Terminal | Open Guide | **FAIL - legacy/deleted HTML target** |
| Keyboard | Shortcut modal | Source present |
| Keyboard | Documented shortcuts | **FAIL - mismatch** |
| Notes Modal | Open/close | Source present, runtime blocked |
| Guide | React Guide view | Source present, runtime blocked |
| Mobile | Header/nav usability | Not tested due P0 |
| Mobile | Reader layout | Not tested due P0 |
| Theme | Dark theme | Not tested due P0 |
| Theme | Light theme | Not tested due P0 |

---

## 7. Root-Cause Analysis

### 7.1 Migration optimized for file conversion, not verified behavior

The codebase was divided into React components and successfully bundled, but runtime interaction and navigation were not protected by tests.

### 7.2 Visual fidelity was pursued through additive overrides

Instead of assigning one owner to each selector, new rules were appended over legacy rules. This produces short-term visual movement but long-term uncertainty.

### 7.3 React state and legacy DOM assumptions coexist

Examples:

- React state controls pages.
- Legacy IDs and class names remain required by `style.css`.
- Some features manipulate `document.body`, CSS variables, and DOM IDs directly.
- Some navigation still assumes standalone HTML files.

This hybrid approach is valid as a temporary bridge, but it needs explicit boundaries.

### 7.4 Documentation and verification criteria are too build-centric

The migration state document records build success as a major completion signal. Runtime and screenshot evidence need equal or greater weight.

---

## 8. Recovery Roadmap

### Phase 0: Freeze and preserve

Goal: prevent further uncontrolled visual churn.

Tasks:

- Do not delete legacy reference screenshots.
- Record current worktree status.
- Avoid formatting or line-ending churn in manuscript JSON.
- Keep implementation changes scoped to source files needed for the current phase.
- Do not regenerate `dist` until a deliberate verification point.

Exit criteria:

- Recovery work can be reviewed without unrelated file churn.

### Phase 1: Runtime recovery

Goal: application renders reliably.

Tasks:

1. Move the content-width Hook above conditional returns.
2. Check every component for conditional Hook calls.
3. Add an error boundary around the application shell.
4. Verify data-load error state.
5. Verify localStorage parsing cannot crash initial render.

Exit criteria:

- Home renders after loading.
- No framework overlay.
- No React console errors.
- Reload succeeds.

### Phase 2: Smoke-test foundation

Goal: prevent another invisible blank-screen regression.

Minimum smoke flow:

```text
app loads
-> loading indicator disappears
-> PMN cover heading is visible
-> Start Reading opens Contents
-> first section opens Reader
-> browser console has no relevant errors
```

Add one mobile smoke flow:

```text
390 x 844
-> app loads
-> primary CTA is visible and usable
-> mobile navigation does not cover content
```

Exit criteria:

- `npm run check` detects the current P0 class of failure.

### Phase 3: Behavioral parity

Goal: every visible control is honest and functional.

Order:

1. Search and part filter.
2. Contents, Glossary, and section navigation.
3. Previous/next and reading history.
4. Shortcut contract.
5. Reader notes and Reader Desk notes.
6. AI Terminal actions.
7. Guide navigation.
8. Clipboard actions and feedback.

Exit criteria:

- Feature-parity matrix has no P1 failures.

### Phase 4: Desktop visual parity

Goal: restore legacy composition at 1440 x 900 and 1280 x 720.

Work one surface per change:

1. global header
2. cover
3. reading paths
4. anatomy
5. axioms
6. AI terminal
7. Reader Desk
8. Contents/Glossary/Search
9. Reader

For each surface:

- capture before screenshot
- compare to named legacy reference
- list mismatches
- make a small targeted change
- capture after screenshot
- verify no console error

Exit criteria:

- Product owner accepts desktop visual parity or approved deviations.

### Phase 5: Responsive recovery

Goal: repair tablet and mobile without compromising desktop.

Test:

- 1024 x 768
- 768 x 1024
- 390 x 844
- 360 x 800

Priority:

1. header and search
2. cover first viewport
3. Contents header and tabs
4. Reader navigation and controls
5. Sidebar/drawer behavior
6. modal dimensions
7. Reader Desk stacking

Exit criteria:

- no horizontal scroll
- no clipped primary controls
- no unreadable text
- no content hidden behind mobile nav

### Phase 6: Accessibility

Goal: keyboard and assistive-technology baseline.

Tasks:

- labels for search and part filter
- dialog semantics for Command Palette
- focus trap and restoration
- accordion ARIA state
- tab semantics
- accessible names for icon buttons
- reduced-motion support
- color-independent highlight labels

### Phase 7: CSS consolidation

Goal: make future AI edits predictable.

Rules:

- Migrate one surface at a time.
- Define canonical tokens first.
- Delete replaced legacy declarations in the same change.
- Reduce `!important`, do not merely relocate it.
- Replace inline layout style with component classes when stable.
- Preserve manuscript prose typography separately from app chrome.

Target architecture:

```text
src/styles/tokens.css
src/styles/base.css
src/styles/layout.css
src/styles/reader.css
src/styles/home.css
src/styles/components/*.css
```

Tailwind should own utility composition. CSS modules or focused CSS files should own complex editorial surfaces. Avoid using both for the same property on the same element.

### Phase 8: Type and architecture hardening

Goal: realize the long-term benefits of React and TypeScript.

Tasks:

- shared `ManuscriptData`, `Part`, `Section`, `LookupEntry`, and `Quote` types
- dedicated hooks for localStorage-backed state
- navigation state abstraction
- lazy-load heavy secondary screens
- staged strict TypeScript
- lint Rules of Hooks

---

## 9. Proposed Component Ownership

```text
App
|- AppShell
|  |- Header
|  |- MobileNav
|  `- GlobalOverlays
|- HomeView
|  |- HeroSection
|  |- ReadingPathsSection
|  |- AnatomySection
|  |- AxiomSection
|  |- HomeAITerminal
|  `- ReaderDeskSection
|- ContentsView
|- ReaderView
|  |- ReaderSidebar
|  |- ReaderHeader
|  |- ReaderProse
|  |- ReaderTools
|  `- ReaderEndcap
|- GuideView
|- AdminView
`- GlobalModals
   |- CommandPalette
   |- KeyboardModal
   `- NotesModal
```

Suggested hooks:

```text
useManuscriptData()
useTheme()
useReadingPosition()
useReadingHistory()
useReadProgress()
useContentWidth()
useKeyboardShortcuts()
useSectionNotes()
```

Do not introduce these abstractions all at once. Extract them when repairing the behavior they own.

---

## 10. Testing Matrix

### 10.1 Build-level

| Check | Required |
|---|---|
| `npx tsc --noEmit` | Yes |
| `npm run build` | Yes |
| no unexpected build warnings | Yes |

### 10.2 Runtime-level

| Check | Desktop | Mobile |
|---|---:|---:|
| page identity | Yes | Yes |
| meaningful non-empty DOM | Yes | Yes |
| no framework overlay | Yes | Yes |
| no console error | Yes | Yes |
| screenshot | Yes | Yes |
| primary interaction | Yes | Yes |

### 10.3 Main user flows

1. Home to Contents to Reader.
2. Search exact section ID.
3. Search manuscript term with part filter.
4. Open Glossary and jump to source.
5. Inline xref and related-section navigation.
6. Previous/next section.
7. Mark as read and persist after reload.
8. Save note and retrieve from Notes modal.
9. Select text, create highlight, reload, and remove highlight.
10. Open Command Palette with `/`.
11. Open Keyboard modal with `K`.
12. Toggle theme and persist.
13. Toggle focus mode and exit it.
14. Open Guide from every entry point.
15. AI prompt copy/open behavior.

### 10.4 Visual regression targets

Create stable screenshots for:

```text
home-desktop-dark
home-desktop-light
home-mobile-dark
reading-paths-desktop
anatomy-desktop
axioms-expanded-desktop
reader-desk-desktop
contents-desktop
glossary-desktop
search-results-desktop
reader-desktop
reader-mobile
command-palette
notes-modal
guide-desktop
```

---

## 11. Definition of Done

The React migration should not be called complete until:

- application survives data loading without runtime errors
- all enabled controls work
- shortcut help matches implementation
- full reader navigation matrix passes
- desktop and mobile screenshots are accepted
- no horizontal overflow exists at required viewports
- dark and light themes remain readable
- keyboard navigation and modal focus behavior pass
- direct/reload navigation has an explicit URL strategy
- a smoke test catches blank-screen regressions
- migration documentation reflects browser-tested reality

---

## 12. Safe First Patch Recommendation

The first implementation patch should be deliberately small:

1. Move the content-width initialization effect above conditional returns.
2. Fix the Reader click-listener cleanup.
3. Add or prepare one smoke test that waits for the PMN cover heading.
4. Run:

```powershell
npx tsc --noEmit
npm run build
npm run dev -- --host 127.0.0.1 --port 5173
```

5. Browser-verify:

```text
URL and title correct
non-empty root
cover visible
no React errors
Start Reading changes the visible screen
```

Do not combine this first patch with visual redesign or CSS consolidation.

---

## 13. Worktree Warning

At audit time, the `public` repository had extensive existing uncommitted changes, including:

- React source files
- legacy `app.js`
- manuscript JSON
- build output
- deleted legacy documentation and HTML files
- new React components and migration documentation

Future agents must not revert or overwrite unrelated changes. Review `git status` and `git diff` before every patch.

The audit itself did not modify application implementation files.

---

## 14. Final Assessment

### Architecture decision

**React + TypeScript + Vite is a sound direction.** It can significantly improve modularity, AI edit precision, component reuse, and long-term development.

### Current implementation

**The migration is incomplete and presently unstable.** It has the shape of a modern application but still behaves like a hybrid conversion:

- React owns state and rendering.
- legacy CSS still owns most visual identity.
- direct DOM operations own several interactions.
- legacy standalone HTML assumptions remain.
- TypeScript checks are permissive.
- browser behavior is not protected by tests.

### Strategic recommendation

Recover in layers:

```text
runtime correctness
-> behavioral parity
-> desktop visual parity
-> mobile parity
-> accessibility
-> CSS/type consolidation
```

Trying to solve all layers in one large rewrite is the highest-risk path. Small, browser-verified surface-by-surface changes are the recommended recovery method.
