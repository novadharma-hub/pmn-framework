# PMN Workspace Layout

This repository can be used directly at `D:\pmn-framework`, but the safer long-term operating layout is:

```text
D:\pmn-workspace\
  private\
    raw_inputs\
    clean_outputs\
    backups\
    scratch\
    release_packets\
    config_notes\
    docx_source\      <== [RAW MS WORD SOURCE MANUSCRIPTS ARE SECURELY KEPT HERE]

  public\             <== [THE REPOSITORY ITSELF DIRECTLY AS JUNCTION TO D:\pmn-framework]
    index.html
    index.ui.html
    app.js
    style.css
    data/
    docs/
    scripts/
```

Open AI coding tools at:

```text
D:\pmn-workspace
```

Use the Git repository at:

```text
D:\pmn-workspace\public
```

The `public` entry is a Windows junction pointing to the real public repo at `D:\pmn-framework`. This keeps existing scripts and Git remotes stable while giving AI tools one parent workspace that contains both private and public zones side-by-side.

---

## Zone Rules

### `private`

Use `private` for files that should not be pushed:

- raw DOCX/PDF drafts (in `raw_inputs/`)
- raw Microsoft Word manuscript files (in `docx_source/`)
- unsanitized source documents
- backup ZIPs and stable .bak files (in `backups/`)
- generated diagnostics (`LENGKAPI_DIAGNOSIS_UNTUK_AI.md`)
- personal user guides (`CARA_PAKAI_PMN.txt`)
- AI system prompts and personal documentation
- scratch files
- AI experiments
- private release notes
- local config notes
- anything containing personal metadata or secrets

Never commit files from `private`.

### `public`

Use `public` for public, Git-tracked project files:

- `index.ui.html`
- `style.css`
- `app.js`
- `data/`
- `data/parts/`
- `scripts/`
- public-safe `docs/`
- generated `index.html`
- AI handoff Markdown files

Only push from inside `public`.

---

## Recommended Release Flow

```text
1. Put raw manuscript drafts in:
   D:\pmn-workspace\private\docx_source

2. Scrub or review metadata (using BERSIHKAN_DAN_BACKUP_DOKUMEN.bat or menu 8).

3. Import DOCX and compile from the repo (Option [3] in Central Console).
   The import script dynamically reads from private\docx_source and splits it into modular JSONs.

4. Run:
   python scripts/security_check.py

5. Review:
   git status -sb
   git diff --cached --stat

6. Push only from:
   D:\pmn-workspace\public
```

Note: Stable backups (`index.html.bak` etc.) are now automatically written to `private/backups/`
when the pmn-workspace layout is detected.


---

## AI Maintainer Instruction

When an AI agent is opened at `D:\pmn-workspace`, follow this rule:

```text
Workspace root: D:\pmn-workspace
Public Git repo: D:\pmn-workspace\public
Private non-git area: D:\pmn-workspace\private

Never commit files from private.
Only run git commit/push inside public.
Before push, run python scripts/security_check.py from public.
```

---

## Why This Layout Exists

AI tools often work best when they can see one folder. A single public repo is safer for GitHub, but manuscript work also needs private scratch space.

This layout gives both:

- one AI-visible workspace root
- one clean GitHub repo (directly at public/)
- one private area outside git (at private/)
- no need to physically move the existing repo
- no broken Git remote or deployment setup
