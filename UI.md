# 🎨 PMN WEB READER UI/UX DESIGN SYSTEM & COMPONENT BLUEPRINT (UI.md)

Welcome, Front-End Engineer & UI AI Specialist! This blueprint serves as the **Design System Specification** for the Progressive Materialist Naturalism (PMN) philosophical manuscript reader. 

Use this document to understand the design tokens, visual elements, animations, and dark/light modes of the application to ensure that future UI modifications align perfectly with the established high-end aesthetics.

---

## 🏛️ DESIGN PHILOSOPHY & ART DIRECTION
The PMN Reader is built to feel like an **elite, interactive academic environment**. It avoids generic templates in favor of bespoke glassmorphism, responsive micro-animations, and organic, atmospheric aesthetics. 

*   **Dark Mode (Default)**: Deep, immersive space with neon grid structures and a soft, circular warm terracotta radial gradient center-orb.
*   **Light Mode ("Cozy Cottage Sepia")**: A soothing, non-glare "cottage bookstore warm reading lamp" ivory-sepia tone designed to eliminate screen glare and reduce reading fatigue.

---

## 🎨 COLOR PALETTES & CSS VARIABLES

All colors are mapped to semantic CSS custom properties in `style.css`. Never use hardcoded colors in ad-hoc selectors.

### 🌑 Dark Theme (Default)
| Property | Value | Intended Usage |
| :--- | :--- | :--- |
| `--bg` | `#050505` | Pure dark void viewport background |
| `--bg2` | `#110d0a` | Elevated surfaces, cards, and modal backings |
| `--ink` | `#e4dfda` | Highly legible warm off-white body text |
| `--ink2` | `#9d9085` | Secondary headings and meta descriptions |
| `--mute` | `#5c5248` | Low-priority labels and inactive controls |
| `--mute2` | `#7c7064` | High-contrast secondary text for glare reduction |
| `--accent` | `#d54e36` | Dynamic terracotta crimson for branding and buttons |
| `--glow` | `rgba(213, 78, 54, 0.15)` | Terracotta drop-shadows and subtle highlights |

### ☀️ Light Theme ("Cozy Cottage Bookstore Sepia")
| Property | Value | Intended Usage |
| :--- | :--- | :--- |
| `--bg` | `#fdfbf7` | Soothing warm ivory paper canvas background |
| `--bg2` | `#f3eee5` | Elevated boxes (TOC, stats, AI assistant panel) |
| `--ink` | `#1c1510` | Rich roasted espresso bean ink for body reading |
| `--ink2` | `#56483c` | Chapter details and structural subtitles |
| `--mute` | `#8a7b6e` | Low-visibility labels and hints |
| `--mute2` | `#7c7064` | High-legibility mobile secondary elements |
| `--accent` | `#b83a1b` | Earthy terracotta red for interactive hover states |
| `--glow` | `rgba(184, 58, 27, 0.08)` | Soft, cozy highlight overlays |

---

## 🌟 KEY VISUAL EXPERIENCE COMPONENTS

### 🌌 1. Organic Parallax Covers & Radial Gradients
The hero header uses a true circular center radial gradient fading organically into the page background.
*   **Aesthetic Feedback Loop**: In Light Mode, it simulates a Sepia warm reading lamp glowing at the center of the sheet. In Dark Mode, it behaves like an active terracotta center-orb.
*   **Performance (120 FPS)**: The dynamic blur filter has been stripped from scroll repaints, ensuring butter-smooth covers transition.

### 🧠 2. Sinusoidal Particle Constellations
The canvas background (`#constellation`) displays a glowing, organic neural network.
*   **Physics**: Particles drift sinusoidally with Kunang-Kunang size breathing.
*   **Connections**: Dynamic neon vectors bridge adjacent particles based on spatial proximity.
*   **Theme Integration**: Line and shadow blurs automatically scale contrast when switching between dark and light themes.

### ⌨️ 3. Floating Orientation Welcome Toast (`#welcome-banner`)
A glassmorphic welcome toast slides in from the bottom right after `1.5` seconds.
*   **Purpose**: Guides new users on keyboard shortcuts (`Ctrl + K` Command Palette, `Shift + Arrow` Navigation).
*   **Persistence**: Once closed by the reader, it writes to `localStorage` to prevent future intrusive pop-ups.

### 🎛️ 4. Glare-Free Mobile & Sidebar Navigation
*   **Manuscript Map (TOC)**: Replaces semi-transparent glare overlays with cozy solid warm `var(--bg2)` backings and elegant thin borders. Hovering over headings triggers a sliding arrow micro-animation (`\2192`).
*   **AI Agent Terminal (`.home-ai-section`)**: Mapped entirely to theme-aware variables. It remains cozy ivory paper in Light Mode and shifts seamlessly to pure black `#050505` in Dark Mode to eliminate the "black-bar sandwich glare" fatigue.

---

## 🛠️ EXTENDING THE UI: BEST PRACTICES

1.  **Strict Variable Mapping**: When creating new widgets, buttons, or cards, always reference CSS variables (e.g. `background: var(--bg2); color: var(--ink);`).
2.  **Glassmorphism Utility**: For modern floating panels, combine backdrop blurs and thin borders:
    ```css
    background: rgba(var(--bg2-rgb), 0.75);
    backdrop-filter: blur(12px);
    border: 1px solid var(--mute);
    ```
3.  **Active Micro-Animations**: Give interactive buttons a tactile hover feedback (e.g. a transition of `transform: translateY(-2px)`, terracotta glow drop shadow, and a transition duration of `0.2s cubic-bezier(0.4, 0, 0.2, 1)`).
4.  **CORS Offline Resilience**: Always ensure javascript assets in `app.js` detect local DOM inlined JSON payloads before attempting standard local network HTTP fetches, preserving 100% offline startup via `file:///` double-click.
