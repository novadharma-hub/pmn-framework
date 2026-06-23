# PMN Framework — Design System

**Aesthetic:** Warm Editorial / Editorial Minimalism  
**Character:** Print-first, book-grade reading platform. Deep red on near-black (dark) or aged parchment (light). Monospace for all UI chrome. Serif for content.

---

## Color Tokens

### Dark Mode (Default)
| Token | Hex | Role |
|-------|-----|------|
| `--color-pmn-bg` | `#0d0d0d` | Primary background |
| `--color-pmn-bg2` | `#171717` | Secondary background, cards |
| `--color-pmn-bg3` | `#1f1f1f` | Tertiary, hover states |
| `--color-pmn-sb` | `#141414` | Sidebar |
| `--color-pmn-ink` | `#f5f0e8` | Primary text (warm white) |
| `--color-pmn-ink2` | `#c8bfb2` | Secondary text |
| `--color-pmn-acc` | `#c0271a` | PMN Red — accent, CTAs, active |
| `--color-pmn-acc2` | `#961f14` | Accent hover/shadow |
| `--color-pmn-mute` | `#8a7d6e` | Muted text |
| `--color-pmn-mute2` | `#7c7064` | Labels, metadata |
| `--color-pmn-mute3` | `#3a3530` | Placeholder text |
| `--color-pmn-rule` | `#302b27` | Primary border |
| `--color-pmn-rule2` | `#3d3730` | Secondary border |
| `--color-pmn-hdr` | `#0d0d0d` | Header background |

### Light Mode
| Token | Hex | Role |
|-------|-----|------|
| `--color-pmn-bg` | `#e8dcc8` | Warm amber paper |
| `--color-pmn-bg2` | `#ddd0b6` | Aged parchment |
| `--color-pmn-bg3` | `#cfc09e` | Archival tan |
| `--color-pmn-sb` | `#e2d4bc` | Warm ivory |
| `--color-pmn-ink` | `#1a100a` | Deep print ink |
| `--color-pmn-ink2` | `#322014` | Warm espresso |
| `--color-pmn-acc` | `#8b1e14` | PMN Red (light) |
| `--color-pmn-acc2` | `#6a1610` | Accent hover |
| `--color-pmn-mute` | `#7a6048` | Muted |
| `--color-pmn-mute2` | `#5e4832` | Labels |
| `--color-pmn-mute3` | `#9e8468` | Placeholder |
| `--color-pmn-rule` | `#c8b898` | Border |
| `--color-pmn-rule2` | `#b0a080` | Secondary border |
| `--color-pmn-hdr` | `#e8dcc8` | Header |

---

## Typography

| Role | Font | Stack |
|------|------|-------|
| Heading | Libre Baskerville | serif |
| Body / Reading | Lora (italic encouraged) | serif |
| UI Chrome | Source Code Pro | monospace |

**Scale:** `clamp()` for headings. Body reading text: 1rem–1.05rem, line-height 1.65–1.75.  
**Reader measure:** `68ch` max-width for prose columns.

---

## Spacing & Layout

| Context | Value |
|---------|-------|
| Header height | `52px` |
| Page padding | `2.5rem` horizontal |
| Max content width | `960–1100px` |
| Reader max-width | `68ch` |
| Card border-offset shadow | `8px 8px 0 var(--rule2)` |

---

## Component Patterns

### Buttons (Header / UI)
```css
font-family: var(--f-mono);
font-size: 0.65rem;
letter-spacing: 0.1em;
text-transform: uppercase;
background: var(--bg2);
color: var(--ink2);
border: 1px solid var(--rule2);
padding: 0.35rem 0.75rem;
box-shadow: 2px 2px 0 var(--rule2);
border-radius: 2px;
/* hover */
background: var(--bg3); color: var(--acc);
border-color: var(--acc); box-shadow: 2px 2px 0 var(--acc2);
transform: translate(-1px, -1px);
/* active */
box-shadow: none; transform: translate(1px, 1px);
```

### Fixed-Width Icon Buttons (Measure/Zoom controls)
```
w-10 py-2 font-mono text-xs text-center
```
All buttons in a group share the same width regardless of label length.

### Cards
```css
border: 1px solid var(--rule);
background: var(--bg2);
box-shadow: 8px 8px 0 var(--rule2);
/* accent top bar */
::before { height: 3px; background: linear-gradient(90deg, var(--acc), transparent 70%); }
```

### Chips / Labels
```css
font-family: var(--f-mono);
font-size: 0.7rem;
letter-spacing: 0.16em;
text-transform: uppercase;
```

### Accent Dividers
```css
/* Gradient rule — always fades right */
background: linear-gradient(90deg, var(--acc), rgba(accent, 0));
height: 1px; opacity: 0.34;
```

---

## Decorative Layers

| Layer | Purpose |
|-------|---------|
| Noise overlay | SVG fractal noise, `opacity: 0.03–0.10`, `mix-blend-mode: color-burn` (light) / `screen` (dark) |
| Vignette | `box-shadow: inset 0 0 200–300px rgba(...)` |
| Grid overlay | 40×40px rule grid, `opacity: 0.06` |
| Hero parallax | `translate3d + scale` driven by `--cover-progress` CSS var |

---

## Dark/Light Switching

Via `[data-theme=dark]` attribute on `<html>`. Default in `@theme` block is dark. Light overrides via `:root:not([data-theme=dark])`.

---

## CSS Architecture

```
src/index.css   → Tailwind v4 @import + @theme token definitions
style.css       → Legacy master CSS (components, layout, animations)
                  Imported separately in main.tsx to avoid cascade conflict
```

**Rule:** Never hardcode hex values in style.css. All color changes go to `src/index.css @theme`.

---

## Anti-patterns to Avoid

- `mx-auto` on flex children inside `#reader-nav` — does not work; use `padding-inline: max(1rem, calc((100% - 960px) / 2))` instead
- `transform: translateY(-100%)` on sticky elements — leaves layout gap; use `margin-top: -52px` on sibling
- Hardcoded colors anywhere outside `src/index.css @theme`
- Mixing Tailwind utility classes with direct CSS variable overrides for the same property
